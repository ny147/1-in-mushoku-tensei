"""Slice original ImageGen infant, ambient, rank and effect artwork.

Usage: python scripts/prepare-pixel-details.py SOURCE_DIRECTORY
Requires the body/wardrobe export first. Only mechanical slicing/resizing and
registration of original source pixels is performed; sources are retained.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('source',type=Path)
args=parser.parse_args()
app=Path(__file__).resolve().parent.parent
root=app/'public/assets/pixel-life'
manifest_path=app/'src/components/life-scene/assets.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
races=('human','elf','beastfolk','migurd','dwarf','superd')

def save(key,image):
    target=root/f'{key}.png';target.parent.mkdir(parents=True,exist_ok=True)
    image.save(target,optimize=True)
    manifest['assets'][key]=dict(url=f'/assets/pixel-life/{key}.png',width=image.width,height=image.height,alpha=True,bytes=target.stat().st_size)

def slices(path,cols,rows):
    source=Image.open(path).convert('RGBA')
    return [[source.crop((round(c*source.width/cols),round(r*source.height/rows),round((c+1)*source.width/cols),round((r+1)*source.height/rows))) for c in range(cols)] for r in range(rows)]

def fitted(frame,width,height):
    box=frame.getchannel('A').getbbox()
    if box is None: raise ValueError('Empty source cell')
    image=frame.crop(box)
    scale=min(width/image.width,height/image.height)
    return image.resize((max(1,round(image.width*scale)),max(1,round(image.height*scale))),Image.Resampling.NEAREST)

infants=slices(args.source/'infants.png',4,6)
for race,frames in zip(races,infants):
    sheet=Image.new('RGBA',(512,1088))
    for row in range(17):
        for col in range(8):
            frame=fitted(frames[min(col,3)],30,28)
            sheet.alpha_composite(frame,(col*64+32-frame.width//2,row*64+56-frame.height))
    save(f'bodies/{race}-infant',sheet)
save('outfits/infant-neutral',Image.new('RGBA',(512,1088)))

ambient=slices(args.source/'ambient.png',8,2)
sheet=Image.new('RGBA',(512,128))
for row,frames in enumerate(ambient):
    # Use one scale for the complete action to retain frame-to-frame size.
    boxes=[f.getchannel('A').getbbox() for f in frames]
    scale=(30 if row==0 else 42)/max(b[3]-b[1] for b in boxes)
    for col,(frame,box) in enumerate(zip(frames,boxes)):
        image=frame.crop(box)
        image=image.resize((round(image.width*scale),round(image.height*scale)),Image.Resampling.NEAREST)
        sheet.alpha_composite(image,(col*64+32-image.width//2,row*64+56-image.height))
for region in ('asura','ranoa','millis','forest','demon','begaritt'):save(f'ambient/{region}',sheet)

gear=slices(args.source/'rank-gear.png',7,2)
for stage,height in [('child',34),('teen',42),('adult',48),('elder',44)]:
    body=Image.open(root/f'bodies/human-{stage}.png')
    for family,frames in zip(('magic','sword'),gear):
        for rank,source in enumerate(frames):
            item=fitted(source,round(height*.55),round(height*.30))
            sheet=Image.new('RGBA',(512,1088))
            for row in range(17):
                for col in range(8):
                    mask=body.crop((col*64,row*64,(col+1)*64,(row+1)*64)).getchannel('A')
                    # Mechanical registration to the torso cross-section.
                    shoulder_y=round(56-height*.78)
                    band=mask.crop((0,shoulder_y,64,shoulder_y+4)).getbbox()
                    center=32 if band is None else (band[0]+band[2])//2
                    sheet.alpha_composite(item,(col*64+center-item.width//2,row*64+shoulder_y))
            save(f'ranks/{stage}-{family}-{rank}',sheet)

for discipline in ('water','fire','earth','wind','healing','sword-god','water-god','north-god'):
    frames=slices(args.source/f'effect-{discipline}.png',8,1)[0]
    boxes=[f.getchannel('A').getbbox() for f in frames]
    if any(b is None for b in boxes):raise ValueError(f'Empty effect cell: {discipline}')
    bounds=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
    scale=min(100/(bounds[2]-bounds[0]),100/(bounds[3]-bounds[1]))
    sheet=Image.new('RGBA',(1024,128))
    for col,frame in enumerate(frames):
        image=frame.crop(bounds)
        image=image.resize((round(image.width*scale),round(image.height*scale)),Image.Resampling.NEAREST)
        sheet.alpha_composite(image,(col*128+(128-image.width)//2,(128-image.height)//2))
    save(f'effects/{discipline}',sheet)

manifest_path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
preview=Image.new('RGB',(7*128,2*128),'#e9e3ce')
for row,family in enumerate(('magic','sword')):
    body=Image.open(root/'bodies/human-adult.png')
    clothing=Image.open(root/f'outfits/adult-{family}-training.png')
    for rank in range(7):
        overlay=Image.open(root/f'ranks/adult-{family}-{rank}.png')
        actor=Image.alpha_composite(Image.alpha_composite(body,clothing),overlay)
        frame=actor.crop((0,0,64,64)).resize((128,128),Image.Resampling.NEAREST)
        preview.paste(frame,(rank*128,row*128),frame)
preview.save(args.source.parent/'rank-contact.png')
print(f'Complete manifest: {len(manifest["assets"])} assets')
