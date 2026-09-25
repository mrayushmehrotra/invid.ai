def snap_to_sentence(window, transcript_segments, pad=1.0):
    candidates_start = [s["start"] for s in transcript_segments if s["start"] <= window["start"] + pad]
    candidates_end = [s["end"] for s in transcript_segments if s["end"] >= window["end"] - pad]
    new_start = max(candidates_start) if candidates_start else window["start"]
    new_end = min(candidates_end) if candidates_end else window["end"]
    return {**window, "start": new_start, "end": new_end}
