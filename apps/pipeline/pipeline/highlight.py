import json, ollama

WINDOW_SECONDS = 150
STRIDE_SECONDS = 90

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

def score_window(window, model="qwen2.5:0.5b"):
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
    kept = []
    for w in scored:
        if all(w["start"] >= k["end"] + min_gap or w["end"] <= k["start"] - min_gap for k in kept):
            kept.append(w)
    return kept
