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
