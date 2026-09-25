import json, sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipeline.ingest import ingest_from_local, ingest_from_url
from pipeline.transcribe import transcribe
from pipeline.highlight import score_all
from pipeline.boundaries import snap_to_sentence
from pipeline.cut import cut_and_caption
from pipeline.metadata import generate_metadata
from pipeline.thumbnail import make_thumbnail
from pipeline.db import SessionLocal, Episode, Clip

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
    run(sys.argv[1], is_url=(len(sys.argv) > 2 and sys.argv[2] == "--url"))
