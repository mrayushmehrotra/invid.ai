from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from pipeline.db import SessionLocal, Episode, Clip
from pipeline.ingest import ingest_from_url
from pipeline.transcribe import transcribe
import os, shutil, uuid, json, shutil, uuid

app = FastAPI(title="Shorts Pipeline API")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "dashboard", "templates"))

SUBTITLE_DIR = os.path.join(DATA_DIR, "subtitles")
RAW_DIR = os.path.join(DATA_DIR, "raw")

@app.get("/", response_class=HTMLResponse)
def review_dashboard(request: Request):
    return templates.TemplateResponse("review.html", {"request": request})

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/clips")
def list_clips(status: str = None):
    db = SessionLocal()
    query = db.query(Clip)
    if status:
        query = query.filter(Clip.status == status)
    clips = query.all()
    db.close()
    return [
        {
            "id": c.id,
            "episode_id": c.episode_id,
            "start_sec": c.start_sec,
            "end_sec": c.end_sec,
            "score": c.score,
            "reason": c.reason,
            "video_path": c.video_path,
            "thumbnail_path": c.thumbnail_path,
            "gen_title": c.gen_title,
            "gen_description": c.gen_description,
            "gen_hashtags": c.gen_hashtags,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in clips
    ]

@app.get("/api/clips/{clip_id}")
def get_clip(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    db.close()
    if not clip:
        return JSONResponse({"error": "Clip not found"}, status_code=404)
    return {
        "id": clip.id,
        "episode_id": clip.episode_id,
        "start_sec": clip.start_sec,
        "end_sec": clip.end_sec,
        "score": clip.score,
        "reason": clip.reason,
        "video_path": clip.video_path,
        "thumbnail_path": clip.thumbnail_path,
        "gen_title": clip.gen_title,
        "gen_description": clip.gen_description,
        "gen_hashtags": clip.gen_hashtags,
        "status": clip.status,
    }

@app.post("/api/clips/{clip_id}/approve")
def approve(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    if not clip:
        db.close()
        return JSONResponse({"error": "Clip not found"}, status_code=404)
    clip.status = "approved"
    db.commit()
    db.close()
    return {"success": True, "status": "approved"}

@app.post("/api/clips/{clip_id}/reject")
def reject(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    if not clip:
        db.close()
        return JSONResponse({"error": "Clip not found"}, status_code=404)
    clip.status = "rejected"
    db.commit()
    db.close()
    return {"success": True, "status": "rejected"}

@app.get("/api/episodes")
def list_episodes():
    db = SessionLocal()
    episodes = db.query(Episode).all()
    db.close()
    return [
        {
            "id": e.id,
            "source_path": e.source_path,
            "title": e.title,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in episodes
    ]

@app.get("/video/{clip_id}")
def serve_video(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    db.close()
    if not clip or not os.path.exists(clip.video_path):
        return JSONResponse({"error": "Video not found"}, status_code=404)
    return FileResponse(clip.video_path)

@app.get("/thumbnail/{clip_id}")
def serve_thumbnail(clip_id: int):
    db = SessionLocal()
    clip = db.query(Clip).get(clip_id)
    db.close()
    if not clip or not os.path.exists(clip.thumbnail_path):
        return JSONResponse({"error": "Thumbnail not found"}, status_code=404)
    return FileResponse(clip.thumbnail_path)

@app.post("/api/subtitles/generate")
async def generate_subtitles(request: Request):
    body = await request.json()
    url = body.get("url")
    if not url:
        return JSONResponse({"error": "url is required"}, status_code=400)

    os.makedirs(SUBTITLE_DIR, exist_ok=True)
    job_id = uuid.uuid4().hex[:12]
    task_dir = os.path.join(SUBTITLE_DIR, job_id)
    os.makedirs(task_dir, exist_ok=True)

    try:
        raw_path = ingest_from_url(url, out_dir=task_dir)
        transcript_path = transcribe(raw_path, out_dir=task_dir)
        with open(transcript_path) as f:
            segments = json.load(f)

        subtitles = []
        for seg in segments:
            subtitles.append({
                "start": round(seg["start"], 3),
                "end": round(seg["end"], 3),
                "text": seg["text"],
            })

        srt_path = os.path.join(task_dir, f"{job_id}.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            for i, sub in enumerate(subtitles, 1):
                start_h = int(sub["start"] // 3600)
                start_m = int((sub["start"] % 3600) // 60)
                start_s = int(sub["start"] % 60)
                start_ms = int((sub["start"] - int(sub["start"])) * 1000)
                end_h = int(sub["end"] // 3600)
                end_m = int((sub["end"] % 3600) // 60)
                end_s = int(sub["end"] % 60)
                end_ms = int((sub["end"] - int(sub["end"])) * 1000)
                f.write(f"{i}\n")
                f.write(
                    f"{start_h:02d}:{start_m:02d}:{start_s:02d},{start_ms:03d} --> "
                    f"{end_h:02d}:{end_m:02d}:{end_s:02d},{end_ms:03d}\n"
                )
                f.write(f"{sub['text']}\n\n")

        return {
            "jobId": job_id,
            "url": url,
            "subtitles": subtitles,
            "srtPath": f"/api/subtitles/{job_id}.srt",
            "count": len(subtitles),
        }
    except Exception as e:
        shutil.rmtree(task_dir, ignore_errors=True)
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/api/subtitles/{job_id}.srt")
def serve_subtitle(job_id: str):
    srt_path = os.path.join(SUBTITLE_DIR, f"{job_id}.srt")
    if not os.path.exists(srt_path):
        return JSONResponse({"error": "Subtitle not found"}, status_code=404)
    return FileResponse(srt_path, media_type="application/x-subrip")
