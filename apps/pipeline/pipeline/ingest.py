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
