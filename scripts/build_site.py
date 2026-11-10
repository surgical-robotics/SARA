"""Package this static site and validate its local references before deployment."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'
# Explicit allowlist: do not publish original physical footage or Git metadata.
ASSETS = (
    'static/css/index.css',
    'static/js/index.js',
    'static/js/video-states.js',
    'static/js/media-controls.js',
    'static/images',
    'static/videos_sim',
    'static/videos_web',
)


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name in ('src', 'href', 'poster', 'data-image'):
            value = attrs.get(name, '')
            parsed = urlsplit(value)
            if value and not parsed.scheme and not parsed.netloc and parsed.path:
                self.paths.add(unquote(parsed.path))


def build():
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for item in ('index.html', '.nojekyll', *ASSETS):
        source, target = ROOT / item, OUTPUT / item
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.is_dir():
            shutil.copytree(source, target, ignore=shutil.ignore_patterns('.DS_Store', '.gitkeep'))
        else:
            shutil.copy2(source, target)
    page = References()
    page.feed((OUTPUT / 'index.html').read_text())
    missing = sorted(path for path in page.paths if not (OUTPUT / path).is_file())
    if missing:
        raise RuntimeError(f'Missing published assets: {missing}')
    forbidden = [p for p in OUTPUT.rglob('*') if p.is_symlink()]
    if forbidden:
        raise RuntimeError(f'Symlinks cannot be published: {forbidden}')
    files = [p for p in OUTPUT.rglob('*') if p.is_file()]
    print(f'Ready: {len(files)} files, {sum(p.stat().st_size for p in files) / 1_000_000:.1f} MB')
    print(f'Validated {len(page.paths)} local asset references in {OUTPUT}')


if __name__ == '__main__':
    build()
