"""Build web copies and poster frames; never overwrite source videos.
Requires ffmpeg. Run from any working directory with python3 scripts/prepare_media.py.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / 'static'
POSTERS = STATIC / 'images' / 'posters'
WEB = STATIC / 'videos_web'


def run(args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def prepare(source):
    group = source.parent.name
    poster = POSTERS / group / (source.stem + '.jpg')
    poster.parent.mkdir(parents=True, exist_ok=True)
    if not poster.exists() or poster.stat().st_mtime < source.stat().st_mtime:
        run(['-ss', '0.2', '-i', str(source), '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '3', str(poster)])
    if group == 'videos_real':
        target = WEB / source.name
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
            temporary = target.with_suffix('.tmp.mp4')
            run(['-i', str(source), '-map', '0:v:0', '-map', '0:a?', '-c:v', 'libx264',
                 '-preset', 'fast', '-crf', '26', '-threads', '2', '-pix_fmt', 'yuv420p',
                 '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(temporary)])
            temporary.replace(target)
    print(f'Ready: {group}/{source.name}', flush=True)


if __name__ == '__main__':
    sources = sorted([*(STATIC / 'videos_sim').glob('*.mp4'), *(STATIC / 'videos_real').glob('*.mp4')])
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(prepare, sources))
