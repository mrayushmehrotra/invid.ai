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
    extract_frame(clip_video_path, 1.0, frame_path)

    img = Image.open(frame_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arialbd.ttf", 64)
    except OSError:
        font = ImageFont.load_default()

    w, h = img.size
    draw.rectangle([0, h - 220, w, h], fill=(0, 0, 0, 160))
    draw.text((40, h - 190), title_text[:40], font=font, fill="white")

    out_path = os.path.join(out_dir, f"{base}.jpg")
    img.save(out_path, quality=90)
    return out_path
