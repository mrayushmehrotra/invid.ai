import subprocess, os, json

def generate_srt(words, clip_start, out_path):
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
