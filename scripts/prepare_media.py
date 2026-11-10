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
# Reproduce the three approved preview crops, each measured at 1920x1080.
SUTURING_FILTER = (
    'crop=1600:900:320:180,scale=1920:1080:flags=lanczos,'
    'crop=1564:880:356:100,scale=1920:1080:flags=lanczos,'
    'crop=1742:980:178:0,scale=1920:1080:flags=lanczos,setsar=1'
)


def run(args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def prepare(source):
    group = source.parent.name
    suturing = group == 'videos_real' and 'stitch' in source.stem.lower()
    revision = max(source.stat().st_mtime, Path(__file__).stat().st_mtime) if suturing else source.stat().st_mtime
    poster_filter = (SUTURING_FILTER + ',') if suturing else ''
    poster = POSTERS / group / (source.stem + '.jpg')
    poster.parent.mkdir(parents=True, exist_ok=True)
    if not poster.exists() or poster.stat().st_mtime < revision:
        run(['-ss', '0.2', '-i', str(source), '-frames:v', '1', '-vf', poster_filter + 'scale=640:-2', '-q:v', '3', str(poster)])
    if group == 'videos_real':
        target = WEB / source.name
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or target.stat().st_mtime < revision:
            temporary = target.with_suffix('.tmp.mp4')
            filters = ['-vf', SUTURING_FILTER] if suturing else []
            run(['-i', str(source), '-map', '0:v:0', '-map', '0:a?', *filters, '-c:v', 'libx264',
                 '-preset', 'fast', '-crf', '26', '-threads', '2', '-pix_fmt', 'yuv420p',
                 '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(temporary)])
            temporary.replace(target)
    print(f'Ready: {group}/{source.name}', flush=True)


if __name__ == '__main__':
    sources = sorted([*(STATIC / 'videos_sim').glob('*.mp4'), *(STATIC / 'videos_real').glob('*.mp4')])
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(prepare, sources))
