"""Mechanically register ImageGen garment overlays to their source pose sheet.

Usage: python scripts/prepare-pixel-wardrobe.py SOURCE_DIRECTORY
No new artwork is drawn. Original sources are retained unchanged.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
args = parser.parse_args()
app = Path(__file__).resolve().parent.parent
root = app / 'public/assets/pixel-life'
base = Image.open(args.source / 'human-adult-draft.png').convert('RGBA')
alpha = base.getchannel('A')

def runs(values):
    groups = []
    for value in values:
        if not groups or value > groups[-1][-1] + 1:
            groups.append([])
        groups[-1].append(value)
    return groups

rows = runs([y for y in range(base.height) if alpha.crop((0, y, base.width, y+1)).getextrema()[1] > 128])
if len(rows) != 16:
    raise ValueError(f'Expected inspected 16-row source, found {len(rows)}')
# The source omitted a social row. Its actual greeting is reused for social.
row_map = [0, 1, 2, 3, 4, 5, 6, 7, 11, 8, 9, 10, 11, 12, 13, 14, 15]
cells = []
for index, row in enumerate(rows):
    top = 0 if index == 0 else (rows[index-1][-1] + row[0]) // 2
    bottom = base.height if index == 15 else (row[-1] + rows[index+1][0]) // 2
    strip = alpha.crop((0, top, base.width, bottom))
    columns = runs([x for x in range(base.width) if strip.crop((x, 0, x+1, strip.height)).getextrema()[1] > 128])
    if len(columns) != 8:
        raise ValueError(f'Row {index}: expected 8 separate figures, found {len(columns)}')
    frame_cells = []
    for col, column in enumerate(columns):
        left = 0 if col == 0 else (columns[col-1][-1] + column[0]) // 2
        right = base.width if col == 7 else (column[-1] + columns[col+1][0]) // 2
        box = (left, top, right, bottom)
        mask = alpha.crop(box)
        bbox = mask.getbbox()
        foot_y = bbox[3]
        feet = mask.crop((0, max(0, foot_y-4), mask.width, foot_y)).getbbox()
        foot_x = (feet[0] + feet[2]) / 2
        frame_cells.append((box, foot_x, foot_y))
    cells.append(frame_cells)

def export(source, height):
    source = source.convert('RGBA')
    if source.size != base.size:
        source = source.resize(base.size, Image.Resampling.NEAREST)
    scale = height / 83
    sheet = Image.new('RGBA', (512, 1088))
    for target_row, source_row in enumerate(row_map):
        for col, (box, foot_x, foot_y) in enumerate(cells[source_row]):
            frame = source.crop(box)
            frame = frame.resize((round(frame.width*scale), round(frame.height*scale)), Image.Resampling.NEAREST)
            cell = Image.new('RGBA', (64, 64))
            cell.alpha_composite(frame, (round(32-foot_x*scale), round(56-foot_y*scale)))
            sheet.alpha_composite(cell, (col*64, target_row*64))
    return sheet

manifest_path = app / 'src/components/life-scene/assets.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
def save(key, image):
    target = root / f'{key}.png'
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, optimize=True)
    manifest['assets'][key] = dict(url=f'/assets/pixel-life/{key}.png', width=image.width, height=image.height, alpha=True, bytes=target.stat().st_size)

outfits = {'guard': args.source / 'guard.png'}
outfits.update({p.stem.removeprefix('outfit-'): p for p in args.source.glob('outfit-*.png')})
for stage, height in [('child', 34), ('teen', 42), ('adult', 48), ('elder', 44)]:
    for race in ('human','elf','beastfolk','migurd','dwarf','superd'):
        source_stage = 'elder' if stage == 'elder' else 'adult'
        path = args.source / f'body-{race}-{source_stage}.png'
        if race == 'human' and source_stage == 'adult':
            source = base
        else:
            source = Image.open(path)
        save(f'bodies/{race}-{stage}', export(source, height))
    for outfit, path in outfits.items():
        with Image.open(path) as source:
            save(f'outfits/{stage}-{outfit}', export(source, height))
    empty = Image.new('RGBA', (512, 1088))
    save(f'outfits/{stage}-neutral', empty)
    save(f'outfits/{stage}-child', empty)

manifest_path.write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8')
# Disposable alignment contact sheet: standing, casting, sword, walking, greeting.
preview = Image.new('RGB', (6*128, 5*128), '#e9e3ce')
body = Image.open(root / 'bodies/human-adult.png')
for col, outfit in enumerate(['guard','farmer','mage','professor','magic-training','sword-training']):
    garment = Image.open(root / f'outfits/adult-{outfit}.png')
    for row, pose in enumerate([0, 2, 3, 9, 12]):
        frame = Image.alpha_composite(body, garment).crop((3*64, pose*64, 4*64, (pose+1)*64))
        preview.paste(frame.resize((128,128), Image.Resampling.NEAREST), (col*128,row*128), frame.resize((128,128), Image.Resampling.NEAREST))
preview.save(args.source.parent / 'wardrobe-contact.png')
preview = Image.new('RGB', (6*128, 4*128), '#e9e3ce')
for col, race in enumerate(('human','elf','beastfolk','migurd','dwarf','superd')):
    for row, stage in enumerate(('child','teen','adult','elder')):
        body = Image.open(root / f'bodies/{race}-{stage}.png')
        garment = Image.open(root / f'outfits/{stage}-guard.png')
        frame = Image.alpha_composite(body,garment).crop((0,0,64,64)).resize((128,128),Image.Resampling.NEAREST)
        preview.paste(frame,(col*128,row*128),frame)
preview.save(args.source.parent / 'race-age-contact.png')
print(f'Registered {len(outfits)} wardrobe designs; sources retained; contact preview written')
