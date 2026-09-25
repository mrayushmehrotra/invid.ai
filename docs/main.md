# Podcast → Shorts Pipeline: Zero to Approval (Build Guide for Agent)

**Target machine:** Acer One 14, Intel i3-1115G4 (2c/4t, integrated UHD, no discrete GPU), 24GB RAM, Windows 10, 512GB SSD.
**Scope:** Ingest a podcast → transcribe → detect highlight clips → cut + caption → generate title/thumbnail/description → surface in a local approval dashboard. **Stops at approval.** Upload-on-approve is a separate follow-on phase, intentionally excluded here so this guide stays focused and testable end-to-end.

Everything below is free, local, and CPU-only. No paid APIs, no GPU dependency.

---

## 1. Architecture

```
[podcast file/url]
      │
      ▼
 1. INGEST (yt-dlp / local copy)
      │
      ▼
 2. TRANSCRIBE (faster-whisper, word timestamps)
      │
      ▼
 3. WINDOW + SCORE (Ollama local LLM → JSON scores per window)
      │
      ▼
 4. SNAP BOUNDARIES (sentence-align top-N windows)
      │
      ▼
 5. CUT + CAPTION (ffmpeg: 9:16 crop, burned word-highlight captions)
      │
      ▼
 6. METADATA (Ollama → title/description/hashtags JSON)
      │
      ▼
 7. THUMBNAIL (extract frame + PIL text overlay)
      │
      ▼
 8. WRITE TO DB (SQLite: status = "pending_review")
      │
      ▼
 9. DASHBOARD (FastAPI + Jinja) → human clicks Approve/Reject
      │
      ▼
   [STOP HERE — upload phase is separate]
```

Orchestration is a single Python script per episode, run as a batch job (not real-time). Expect 1hr podcast ≈ 20-35 min total pipeline time on this CPU. Run overnight, review queue in the morning.

---

## 2. Environment Setup

```bash
# Python 3.11 recommended
python -m venv venv
venv\Scripts\activate        # Windows
pip install --upgrade pip

pip install faster-whisper ffmpeg-python fastapi uvicorn jinja2 \
    python-multipart pillow requests sqlalchemy yt-dlp ollama
```

**External binaries needed on PATH:**

- `ffmpeg` — download from https://www.gyan.dev/ffmpeg/builds/ (Windows builds), add `bin/` to PATH.
- `yt-dlp` — installed via pip above, also usable as CLI.
- **Ollama** — install from https://ollama.com, then pull a small model:
  ```bash
  ollama pull qwen2.5:3b-instruct
  ```
  Use the 3b model, not 7b — on a 2-core i3 the 7b model will be noticeably slower per call and you're making many calls (one per transcript window). 3b is fast enough and good enough for scoring/JSON-structured tasks.

**faster-whisper model choice:** use `base.en` or `small.en` with `compute_type="int8"`. Do NOT use `medium` or `large-v3` on this CPU for batch transcription — the time cost compounds badly on a 2-core chip. `small.en` gives good-enough accuracy for highlight detection and caption burning.

---

## 3. Project Structure

```
shorts-pipeline/
├── venv/
├── data/
│   ├── raw/              # downloaded/copied source podcasts
│   ├── transcripts/      # whisper output (json per episode)
│   ├── clips/            # cut+captioned mp4s
│   ├── thumbnails/       # generated jpg/png
│   └── pipeline.db        # sqlite
├── pipeline/
│   ├── __init__.py
│   ├── ingest.py
│   ├── transcribe.py
│   ├── highlight.py
│   ├── boundaries.py
│   ├── cut.py
│   ├── metadata.py
│   ├── thumbnail.py
│   ├── db.py
│   └── run_episode.py     # orchestrator entrypoint
├── dashboard/
│   ├── main.py             # FastAPI app
│   └── templates/
│       └── review.html
└── requirements.txt
```

---

## 4. Database Schema (`pipeline/db.py`)

```python
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

Base = declarative_base()

class Episode(Base):
    __tablename__ = "episodes"
    id = Column(Integer, primary_key=True)
    source_path = Column(String)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Clip(Base):
    __tablename__ = "clips"
    id = Column(Integer, primary_key=True)
    episode_id = Column(Integer)
    start_sec = Column(Float)
    end_sec = Column(Float)
    score = Column(Float)
    reason = Column(String)
    video_path = Column(String)
    thumbnail_path = Column(String)
    gen_title = Column(String)
    gen_description = Column(String)
    gen_hashtags = Column(String)
    status = Column(String, default="pending_review")  # pending_review | approved | rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

engine = create_engine("sqlite:///data/pipeline.db")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
```

---

## 5. Stage 1 — Ingest (`pipeline/ingest.py`)

```python
import subprocess, shutil, os

def ingest_from_url(url: str, out_dir: str = "data/raw") -> str:
    os.makedirs(out_dir, exist_ok=True)
    cmd = ["yt-dlp", "-f", "bestaudio+bestvideo/best", "-o",
           f"{out_dir}/%(id)s.%(ext)s", url]
    subprocess.run(cmd, check=True)
    files = sorted(os.listdir(out_dir), key=lambda f: os.path.getmtime(os.path.join(out_dir, f)))
    return os.path.join(out_dir, files[-1])

def ingest_from_local(path: str, out_dir: str = "data/raw") -> str:
    os.makedirs(out_dir, exist_ok=True)
    dest = os.path.join(out_dir, os.path.basename(path))
    shutil.copy(path, dest)
    return dest
```

---

## 6. Stage 2 — Transcribe (`pipeline/transcribe.py`)

```python
from faster_whisper import WhisperModel
import json, os

def transcribe(video_path: str, out_dir: str = "data/transcripts") -> str:
    os.makedirs(out_dir, exist_ok=True)
    model = WhisperModel("small.en", device="cpu", compute_type="int8")
    segments, info = model.transcribe(video_path, word_timestamps=True, vad_filter=True)

    result = []
    for seg in segments:
        words = [{"word": w.word, "start": w.start, "end": w.end} for w in (seg.words or [])]
        result.append({
            "start": seg.start, "end": seg.end, "text": seg.text, "words": words
        })

    out_path = os.path.join(out_dir, os.path.basename(video_path) + ".json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    return out_path
```

`vad_filter=True` matters — it skips silence, which meaningfully cuts total transcription time on a slow CPU.

---

## 7. Stage 3 — Window + Score with Ollama (`pipeline/highlight.py`)

```python
import json, ollama

WINDOW_SECONDS = 150   # ~2.5 min windows
STRIDE_SECONDS = 90    # overlapping windows so you don't miss boundary-crossing moments

PROMPT_TEMPLATE = """You are selecting short-form video clips from a podcast transcript segment.
Rate this segment 1-10 for standalone Shorts/Reels potential. Favor: a complete thought or story,
an emotional peak, a controversial or surprising take, a punchline, or a concrete actionable insight.
Penalize: rambling, mid-thought cuts, requires prior context to understand.

Segment transcript:
\"\"\"{text}\"\"\"

Respond with ONLY valid JSON, no other text:
{{"score": <1-10 integer>, "reason": "<one short sentence>"}}
"""

def build_windows(segments):
    windows = []
    cur_start = segments[0]["start"]
    end_time = segments[-1]["end"]
    t = cur_start
    while t < end_time:
        window_segs = [s for s in segments if s["start"] >= t and s["start"] < t + WINDOW_SECONDS]
        if window_segs:
            text = " ".join(s["text"].strip() for s in window_segs)
            windows.append({
                "start": window_segs[0]["start"],
                "end": window_segs[-1]["end"],
                "text": text
            })
        t += STRIDE_SECONDS
    return windows

def score_window(window, model="qwen2.5:3b-instruct"):
    prompt = PROMPT_TEMPLATE.format(text=window["text"][:2000])
    resp = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
    raw = resp["message"]["content"].strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {"score": 0, "reason": "parse_failed"}
    return {**window, **parsed}

def score_all(transcript_segments, top_n=8):
    windows = build_windows(transcript_segments)
    scored = [score_window(w) for w in windows]
    scored.sort(key=lambda w: w["score"], reverse=True)
    return dedupe_overlaps(scored)[:top_n]

def dedupe_overlaps(scored, min_gap=60):
    """Greedy: keep highest scored, drop windows that overlap an already-kept one."""
    kept = []
    for w in scored:
        if all(w["start"] >= k["end"] + min_gap or w["end"] <= k["start"] - min_gap for k in kept):
            kept.append(w)
    return kept
```

**Agent note:** if `ollama.chat` JSON parsing fails often, tighten the prompt further or add `format="json"` (supported in recent Ollama Python client versions) — check the installed client version before relying on it.

---

## 8. Stage 4 — Snap to Sentence Boundaries (`pipeline/boundaries.py`)

```python
def snap_to_sentence(window, transcript_segments, pad=1.0):
    """Expand/contract window edges to the nearest segment boundary so clips
    don't start or end mid-sentence."""
    candidates_start = [s["start"] for s in transcript_segments if s["start"] <= window["start"] + pad]
    candidates_end = [s["end"] for s in transcript_segments if s["end"] >= window["end"] - pad]
    new_start = max(candidates_start) if candidates_start else window["start"]
    new_end = min(candidates_end) if candidates_end else window["end"]
    return {**window, "start": new_start, "end": new_end}
```

---

## 9. Stage 5 — Cut + Burn Captions (`pipeline/cut.py`)

```python
import subprocess, os, json

def generate_srt(words, clip_start, out_path):
    """Word-by-word style captions using whisper word timestamps, times relative to clip start."""
    lines = []
    idx = 1
    for w in words:
        if w["start"] < clip_start:
            continue
        s = w["start"] - clip_start
        e = w["end"] - clip_start
        lines.append(f"{idx}\n{fmt_ts(s)} --> {fmt_ts(e)}\n{w['word'].strip()}\n")
        idx += 1
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def fmt_ts(seconds):
    ms = int((seconds % 1) * 1000)
    s = int(seconds) % 60
    m = (int(seconds) // 60) % 60
    h = int(seconds) // 3600
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

def cut_and_caption(source_path, clip, words, out_dir="data/clips"):
    os.makedirs(out_dir, exist_ok=True)
    clip_id = f"{int(clip['start'])}_{int(clip['end'])}"
    srt_path = os.path.join(out_dir, f"{clip_id}.srt")
    generate_srt(words, clip["start"], srt_path)

    out_path = os.path.join(out_dir, f"{clip_id}.mp4")
    duration = clip["end"] - clip["start"]

    # crop to 9:16 (centered) and burn subtitles
    vf = (
        "crop=ih*9/16:ih,scale=1080:1920,"
        f"subtitles={srt_path}:force_style='Fontsize=16,PrimaryColour=&H00FFFFFF,Bold=1'"
    )

    cmd = [
        "ffmpeg", "-y", "-ss", str(clip["start"]), "-i", source_path,
        "-t", str(duration), "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", out_path
    ]
    subprocess.run(cmd, check=True)
    return out_path
```

**Word timestamps for `words`:** pull all `w` entries from the transcript JSON that fall inside `[clip["start"], clip["end"]]` before calling this function.

**Hardware note:** `-preset fast` is a deliberate tradeoff for a weak CPU — `slow`/`veryslow` will cost you real time across many clips. If output quality feels soft, try `medium` before going higher.

---

## 10. Stage 6 — Metadata Generation (`pipeline/metadata.py`)

```python
import json, ollama

PROMPT = """Given this podcast clip transcript, write YouTube Shorts metadata.

Transcript:
\"\"\"{text}\"\"\"

Respond with ONLY valid JSON:
{{"title": "<under 60 chars, hook-driven>", "description": "<2 sentences>", "hashtags": ["#tag1","#tag2","#tag3"]}}
"""

def generate_metadata(clip_text, model="qwen2.5:3b-instruct"):
    prompt = PROMPT.format(text=clip_text[:1500])
    resp = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
    try:
        return json.loads(resp["message"]["content"].strip())
    except json.JSONDecodeError:
        return {"title": "Untitled Clip", "description": "", "hashtags": []}
```

---

## 11. Stage 7 — Thumbnail (`pipeline/thumbnail.py`)

```python
import subprocess, os
from PIL import Image, ImageDraw, ImageFont

def extract_frame(video_path, timestamp, out_path):
    cmd = ["ffmpeg", "-y", "-ss", str(timestamp), "-i", video_path,
           "-frames:v", "1", out_path]
    subprocess.run(cmd, check=True)

def make_thumbnail(clip_video_path, title_text, out_dir="data/thumbnails"):
    os.makedirs(out_dir, exist_ok=True)
    base = os.path.splitext(os.path.basename(clip_video_path))[0]
    frame_path = os.path.join(out_dir, f"{base}_frame.jpg")
    extract_frame(clip_video_path, 1.0, frame_path)  # 1s in, avoids black first frame

    img = Image.open(frame_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arialbd.ttf", 64)
    except OSError:
        font = ImageFont.load_default()

    # simple bottom-band text overlay
    w, h = img.size
    draw.rectangle([0, h - 220, w, h], fill=(0, 0, 0, 160))
    draw.text((40, h - 190), title_text[:40], font=font, fill="white")

    out_path = os.path.join(out_dir, f"{base}.jpg")
    img.save(out_path, quality=90)
    return out_path
```

---

## 12. Orchestrator (`pipeline/run_episode.py`)

```python
from pipeline.ingest import ingest_from_local, ingest_from_url
from pipeline.transcribe import transcribe
from pipeline.highlight import score_all
from pipeline.boundaries import snap_to_sentence
from pipeline.cut import cut_and_caption
from pipeline.metadata import generate_metadata
from pipeline.thumbnail import make_thumbnail
from pipeline.db import SessionLocal, Episode, Clip
import json

def run(source: str, is_url: bool = False):
    source_path = ingest_from_url(source) if is_url else ingest_from_local(source)

    transcript_path = transcribe(source_path)
    with open(transcript_path) as f:
        segments = json.load(f)

    top_clips = score_all(segments, top_n=8)

    db = SessionLocal()
    episode = Episode(source_path=source_path, title=source_path.split("/")[-1])
    db.add(episode)
    db.commit()
    db.refresh(episode)

    all_words = [w for s in segments for w in s.get("words", [])]

    for clip in top_clips:
        clip = snap_to_sentence(clip, segments)
        clip_words = [w for w in all_words if clip["start"] <= w["start"] <= clip["end"]]

        video_path = cut_and_caption(source_path, clip, clip_words)
        clip_text = " ".join(s["text"] for s in segments if s["start"] >= clip["start"] and s["start"] < clip["end"])
        meta = generate_metadata(clip_text)
        thumb_path = make_thumbnail(video_path, meta["title"])

        db.add(Clip(
            episode_id=episode.id,
            start_sec=clip["start"], end_sec=clip["end"],
            score=clip["score"], reason=clip.get("reason", ""),
            video_path=video_path, thumbnail_path=thumb_path,
            gen_title=meta["title"], gen_description=meta["description"],
            gen_hashtags=",".join(meta["hashtags"]),
            status="pending_review"
        ))
    db.commit()
    db.close()

if __name__ == "__main__":
    import sys
    run(sys.argv[1], is_url=(len(sys.argv) > 2 and sys.argv[2] == "--url"))
```

Run it:

```bash
python -m pipeline.run_episode "path/to/podcast.mp4"
python -m pipeline.run_episode "https://youtube.com/watch?v=..." --url
```

---

## 13. Dashboard (`dashboard/main.py`)

```python
from fastapi import FastAPI, Request, Form
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.templating import Jinja2Templates
from pipeline.db import SessionLocal, Clip

app = FastAPI()
templates = Jinja2Templates(directory="dashboard/templates")

@app.get("/")
def review(request: Request):
    db = SessionLocal()
    clips = db.query(Clip).filter(Clip.status == "pending_review").all()
    db.close()
    return templates.TemplateResponse("review.html", {"request": request, "clips": clips})

@app.post("/approve/{clip_id}")
def approve(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    clip.status = "approved"
    db.commit()
    db.close()
    return RedirectResponse("/", status_code=303)

@app.post("/reject/{clip_id}")
def reject(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    clip.status = "rejected"
    db.commit()
    db.close()
    return RedirectResponse("/", status_code=303)

@app.get("/video/{clip_id}")
def video(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    db.close()
    return FileResponse(clip.video_path)
```

`dashboard/templates/review.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Shorts Review Queue</title>
  </head>
  <body style="font-family: sans-serif; max-width: 900px; margin: 40px auto;">
    <h1>Pending Clips ({{ clips|length }})</h1>
    {% for clip in clips %}
    <div style="border: 1px solid #ccc; padding: 16px; margin-bottom: 20px;">
      <video width="270" controls>
        <source src="/video/{{ clip.id }}" type="video/mp4" />
      </video>
      <h3>{{ clip.gen_title }}</h3>
      <p>{{ clip.gen_description }}</p>
      <p><i>{{ clip.gen_hashtags }}</i></p>
      <p>Score: {{ clip.score }} — {{ clip.reason }}</p>
      <form
        method="post"
        action="/approve/{{ clip.id }}"
        style="display:inline;"
      >
        <button type="submit">✅ Approve</button>
      </form>
      <form
        method="post"
        action="/reject/{{ clip.id }}"
        style="display:inline;"
      >
        <button type="submit">❌ Reject</button>
      </form>
    </div>
    {% endfor %}
  </body>
</html>
```

Run:

```bash
uvicorn dashboard.main:app --reload
```

Open `http://localhost:8000` to review the queue.

---

## 14. Agent Build/Test Checklist

Build and verify **in this order** — don't skip ahead, each stage's output is the next stage's input:

1. [ ] `ingest.py` — confirm a local file copies correctly, and a YouTube URL downloads via yt-dlp.
2. [ ] `transcribe.py` — run on a short (2-3 min) test clip first, confirm JSON has `words` with start/end times populated.
3. [ ] `highlight.py` — run against the test transcript, confirm Ollama returns parseable JSON consistently (log raw failures if `score: 0` appears often — tune prompt).
4. [ ] `boundaries.py` — spot check that snapped clips don't cut mid-word (listen to a couple).
5. [ ] `cut.py` — confirm output mp4 is 9:16, captions appear and are synced.
6. [ ] `metadata.py` — sanity-check title length and tone.
7. [ ] `thumbnail.py` — confirm frame isn't black/blank, text is readable.
8. [ ] `run_episode.py` — run full pipeline on a **short 10-15 min podcast** first, not a 2hr one, to validate the whole chain before committing to long batch runs.
9. [ ] Dashboard — confirm video preview plays, approve/reject updates DB status correctly.

Only after all 9 pass on a short test episode should the agent be trusted to run on full-length podcasts unattended overnight.

---

## 15. What's Deliberately Out of Scope Here

- **Upload-on-approve**: separate next phase — YouTube Data API v3 (`google-api-python-client`), triggered by a status-change webhook/poll on `Clip.status == "approved"`. Build this only after the above is validated, since it's the one stage with real-world consequences (public upload) and should not be rushed.
- **Active-speaker cropping**: v1 uses a fixed center-crop. If podcast is two-person video and center-crop looks bad, next iteration adds `mediapipe`/OpenCV face detection to choose crop position per clip.
- **Multi-episode queue/scheduling**: v1 is single-episode-at-a-time via CLI. Wrap in `node-cron`-equivalent (`APScheduler`) once the core pipeline is proven.
