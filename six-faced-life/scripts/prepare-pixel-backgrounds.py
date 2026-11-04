"""Mechanically export original ImageGen backgrounds; user authorized Pillow processing.

Usage: python scripts/prepare-pixel-backgrounds.py SOURCE_DIRECTORY
Sources must be named asura.png, ranoa.png, millis.png, forest.png,
demon.png, begaritt.png. Source files are retained unchanged.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
args = parser.parse_args()
app = Path(__file__).resolve().parent.parent
output = app / 'public/assets/pixel-life/regions'
output.mkdir(parents=True, exist_ok=True)
manifest_path = app / 'src/components/life-scene/assets.json'
assets = json.loads(manifest_path.read_text(encoding='utf-8'))['assets'] if manifest_path.exists() else {}
for region in ('asura', 'ranoa', 'millis', 'forest', 'demon', 'begaritt'):
    with Image.open(args.source / f'{region}.png') as source:
        if source.width != source.height * 3:
            raise ValueError(f'{region}: expected 3:1 source, got {source.size}')
        image = source.convert('RGB').resize((768, 256), Image.Resampling.NEAREST)
        target = output / f'{region}.png'
        image.save(target, optimize=True)
        assets[f'regions/{region}'] = dict(url=f'/assets/pixel-life/regions/{region}.png', width=768, height=256, alpha=False, bytes=target.stat().st_size)
manifest = app / 'src/components/life-scene/assets.json'
manifest.write_text(json.dumps(dict(version=1, assets=assets), indent=2)+'\n', encoding='utf-8')
print('Exported six backgrounds; existing character metadata retained')
