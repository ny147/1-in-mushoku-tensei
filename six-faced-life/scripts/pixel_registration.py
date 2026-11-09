"""Authoring-only head exclusion for wardrobe overlays; requires Pillow.

The fixed brown-haired reference is the same accepted pose sheet used to export
all garments. Its connected hair silhouette locates the initial idle template;
weighted template matching follows heads through crouched/raised poses. Only body alpha inside that head window is excluded;
clothing outside it (especially arms and feet) is preserved byte-for-byte.
"""
from PIL import Image, ImageChops, ImageStat

def initial_head_box(frame):
    points = {(x, y) for y in range(3, 44) for x in range(5, 53)
              if (lambda c: c[3] > 128 and c[0] < 120 and c[1] < 85
                  and c[2] < 65 and c[0] > c[1] * 1.25)(frame.getpixel((x, y)))}
    groups = []
    while points:
        pending = [points.pop()]
        group = []
        while pending:
            x, y = pending.pop()
            group.append((x, y))
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    neighbor = (x + dx, y + dy)
                    if neighbor in points:
                        points.remove(neighbor)
                        pending.append(neighbor)
        if len(group) > 12 and min(y for _, y in group) < 30:
            groups.append(group)
    if not groups:
        raise ValueError('Reference head could not be located; inspect source registration')
    hair = max(groups, key=len)
    xs, ys = zip(*hair)
    # Include the face beneath the hair and ears beside it, but not the torso.
    return (max(0, min(xs)-3), max(0, min(ys)-2),
            min(64, max(xs)+4), min(64, max(ys)+3))

def head_exclusion(reference, bodies):
    mask = Image.new('L', reference.size)
    initial = reference.crop((0, 0, 64, 64))
    template = initial.crop(initial_head_box(initial))
    template_alpha = template.getchannel('A')
    for row in range(17):
        for column in range(8):
            origin = (column * 64, row * 64)
            cell = (*origin, origin[0]+64, origin[1]+64)
            frame = reference.crop(cell)
            # Match the accepted idle head, not a color component which can
            # merge with raised arms or warm shadows on a crouched torso.
            width, height = template.size
            best = None
            for y in range(0, 64-height):
                for x in range(3, 61-width):
                    candidate = frame.crop((x, y, x+width, y+height))
                    difference = ImageChops.difference(candidate, template)
                    score = sum(ImageStat.Stat(difference, template_alpha).sum)
                    if best is None or score < best[0]:
                        best = (score, x, y)
            _, x, y = best
            bounds = (x, y, x+width, y+height)
            head = Image.new('L', (64, 64))
            for body in bodies:
                alpha = body.crop(cell).getchannel('A')
                region = Image.new('L', (64, 64))
                region.paste(alpha.crop(bounds), bounds[:2])
                head = ImageChops.lighter(head, region)
            mask.paste(head, origin)
    return mask.point(lambda alpha: 255 if alpha > 128 else 0)

def protect_heads(garment, exclusion):
    result = garment.copy()
    result.putalpha(ImageChops.multiply(garment.getchannel('A'), ImageChops.invert(exclusion)))
    return result
