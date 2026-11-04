"""Regression check for mechanically registered runtime artwork (requires Pillow)."""
import unittest
from pathlib import Path
from PIL import Image

class RegistrationTest(unittest.TestCase):
    def test_migurd_magic_clothes_cover_the_same_torso_as_reference(self):
        root = Path(__file__).resolve().parent.parent / 'public/assets/pixel-life'
        outfit = Image.open(root / 'outfits/adult-magic-training.png')
        exposed = []
        for race in ['human', 'migurd']:
            actor = Image.alpha_composite(Image.open(root / f'bodies/{race}-adult.png'), outfit)
            frame = actor.crop((448, 128, 512, 192))
            exposed.append(sum(1 for y in range(24, 43) for x in range(20, 42)
                               if (lambda c: c[3] > 128 and c[0] > 160 and c[1] > 130 and c[2] > 100)(frame.getpixel((x, y)))))
        self.assertLessEqual(exposed[1], exposed[0] + 15,
                             'Migurd torso escapes the shared training garment')

    def test_raised_pose_keeps_head_inside_cell(self):
        root = Path(__file__).resolve().parent.parent
        mask = Image.open(root / 'public/assets/pixel-life/bodies/human-adult.png').getchannel('A')
        top = mask.crop((192, 16*64, 256, 16*64+1))
        self.assertLess(max(top.getdata()), 128, 'Raised pose is cut at the atlas cell top')

    def test_migurd_arrival_contains_one_actor_without_neighboring_head(self):
        root = Path(__file__).resolve().parent.parent
        mask = Image.open(root / 'public/assets/pixel-life/bodies/migurd-adult.png').getchannel('A')
        mask = mask.crop((192, 13*64, 256, 14*64))
        pixels = mask.load()
        seen = set()
        sizes = []
        for y in range(64):
            for x in range(64):
                if pixels[x,y] < 128 or (x,y) in seen:
                    continue
                todo = [(x,y)]
                seen.add((x,y))
                size = 0
                while todo:
                    a,b = todo.pop()
                    size += 1
                    for u,v in [(a-1,b),(a+1,b),(a,b-1),(a,b+1)]:
                        if 0 <= u < 64 and 0 <= v < 64 and pixels[u,v] >= 128 and (u,v) not in seen:
                            seen.add((u,v))
                            todo.append((u,v))
                sizes.append(size)
        self.assertEqual(len([size for size in sizes if size > 80]), 1,
                         f'Neighboring sprite leaked into arrival frame: {sizes}')

if __name__ == '__main__':
    unittest.main()
