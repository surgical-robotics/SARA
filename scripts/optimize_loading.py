"""Prepare small figure previews and losslessly enable MP4 fast start.

Run after replacing either research figure or a simulation video. Requires Pillow and FFmpeg.
The full-resolution figures stay untouched. Video packets and timestamps must
match before a remuxed container replaces its source.
"""
from hashlib import sha256
from pathlib import Path
import re
import struct
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / 'static/images'


def version(path):
    return sha256(path.read_bytes()).hexdigest()[:12]


def prepare_figure(name='abstract'):
    source = IMAGES / f'{name}.png'
    paths = [source]
    with Image.open(source) as image:
        for width in (1120, 2240):
            height = round(image.height * width / image.width)
            target = IMAGES / f'{name}-{width}.webp'
            preview = image.resize((width, height), Image.Resampling.LANCZOS)
            preview.save(target, 'WEBP', quality=90, method=6,
                         icc_profile=image.info.get('icc_profile', b''))
            paths.append(target)
            print(f'Figure preview: {target.name}, {width}×{height}, {target.stat().st_size / 1000:.0f} KB', flush=True)
    return paths


def has_faststart(path):
    atoms = []
    with path.open('rb') as stream:
        while stream.tell() < path.stat().st_size:
            offset = stream.tell()
            header = stream.read(8)
            if len(header) != 8:
                break
            size, kind = struct.unpack('>I4s', header)
            if size == 1:
                size = struct.unpack('>Q', stream.read(8))[0]
            if size < 8:
                break
            atoms.append(kind)
            stream.seek(offset + size)
    return b'moov' in atoms and b'mdat' in atoms and atoms.index(b'moov') < atoms.index(b'mdat')


def packet_fingerprint(path):
    packets = subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_packets', '-show_data_hash', 'sha256',
        '-show_entries', 'packet=stream_index,pts_time,dts_time,duration_time,data_hash',
        '-of', 'compact', str(path),
    ])
    return sha256(packets).digest()


def prepare_video(path):
    if has_faststart(path):
        return False
    temporary = path.with_suffix('.loading.tmp.mp4')
    try:
        original = packet_fingerprint(path)
        subprocess.run([
            'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-copyts',
            '-i', str(path), '-map', '0', '-c', 'copy', '-avoid_negative_ts', 'disabled',
            '-movflags', '+faststart', str(temporary),
        ], check=True)
        if not has_faststart(temporary) or packet_fingerprint(temporary) != original:
            raise RuntimeError(f'Lossless verification failed; source kept: {path.name}')
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)
    print(f'Fast start: {path.name}; packet data and timestamps unchanged', flush=True)
    return True


if __name__ == '__main__':
    assets = [asset for name in ('abstract', 'sara_pipeline') for asset in prepare_figure(name)]
    for source in sorted((ROOT / 'static/videos_sim').glob('*.mp4')):
        if prepare_video(source):
            assets.append(source)
    page = ROOT / 'index.html'
    text = page.read_text()
    for asset in assets:
        relative = asset.relative_to(ROOT).as_posix()
        pattern = re.escape(relative) + r'(?:\?v=[A-Za-z0-9_-]+)?'
        text = re.sub(pattern, lambda match: relative + '?v=' + version(asset), text)
    page.write_text(text)
