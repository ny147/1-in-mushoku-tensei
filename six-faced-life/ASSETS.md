# Asset record

## Pixel life scene — 2026-11-03

Original detailed fantasy pixel artwork generated with the built-in ImageGen tool
on 2026-11-02, following the user's selected lower panel B. No franchise sprites
were downloaded. All 179 runtime PNGs are under `public/assets/pixel-life/`;
`src/components/life-scene/assets.json` records every path, dimension, alpha flag
and compressed byte size. Current total: **41,874,507 bytes**.

| Category | Files | Dimensions |
| --- | ---: | --- |
| Regional scenery | 6 | 768×256 |
| Ambient atlases | 6 | 512×128 |
| Race and age bodies | 30 | 512×1088 |
| Wardrobe | 73 | 512×1088 |
| Rank gear | 56 | 512×1088 |
| Selected-discipline effects | 8 | 1024×128 |

Exact original prompts, variant substitutions and reference-image inputs are
retained in [the authoring record](../docs/superpowers/specs/assets/2026-11-02-pixel-life-prompts.md).
The [source inventory](../docs/superpowers/specs/assets/2026-11-02-pixel-life-sources.md)
records filenames, byte sizes and SHA-256 hashes of the accepted originals.
Original PNGs remain locally in ignored `.sites-workflow/pixel-life/sources/`
and the Codex generated-image cache. Preserve them for future art revisions.

The user explicitly authorized Pillow for mechanical resizing, transparent
trimming and sheet slicing. The optional `scripts/prepare-pixel-backgrounds.py`,
`prepare-pixel-wardrobe.py` and `prepare-pixel-details.py` require those source
PNGs and Pillow (11.3.0 used); neither is an application/build dependency.
Run them in that order with the source directory argument. Never regenerate
art as part of the normal build. The exported assets are committed directly.

Mechanical registration uses 64×64 hero cells, eight columns and 17 clips, with
foot anchor (32,56). The 16-row original pose sheet shares greeting/social.
Child/teen bodies use size variants; elders have separately generated aged
features; infants have their own six-race sheet. Migurd youthful sources use
their own inspected row/foot geometry. Tall raised poses scale to fit the cell;
wardrobe uses the same reference scale. `python scripts/test_pixel_registration.py`
checks the reproduced neighboring-row and raised-pose clipping regressions.

A conservative upper bound across all categories is **1,720,121 compressed bytes**
for a scene, counting the shared ambient atlas once. There are at most seven
raster layers, six potentially moving. Other regions/characters are selected
lazily. Actual file coverage and metadata checks run in `tests/pixel-assets.test.ts`.
Visual acceptance status and any remaining limitations live in CONTINUE.md and
the active implementation plan; metadata tests alone do not prove artwork fit.

## Original landscape

File: `public/assets/asura-countryside.png`.
Generated with the built-in ImageGen tool on 2026-10-23, then copied into this project. No reference images were supplied. The illustration is atmospheric scenery, not a canon location reconstruction. Its use in the game is captioned as an imagined view of Asura.

On 2026-10-24 the unchanged 1881×836 source was encoded with Pillow/WebP quality 90, method 6, as `public/assets/asura-countryside.webp`. The derivative is 554,172 bytes versus the 3,293,374-byte PNG (83.2% smaller). It was visually inspected and confirmed as the browser's selected source. `Landscape.tsx` uses a picture element with the original PNG as fallback; composition and source provenance are retained.

Final generation prompt:

> Use case: stylized-concept. Create an original background illustration for a literary fantasy life simulation game inspired by the rural medieval world of Mushoku Tensei. A beautifully detailed hand-painted anime background, wide landscape 1536 by 1024 or wider if possible. View from a grassy hill overlooking a quiet farming hamlet: timber-framed cottages and terracotta rooftops clustered on the lower left and middle, winding pale dirt path across the foreground to the right, cultivated golden fields and meadows, distant layered blue mountains, vast soft blue sky with sunlit cumulus clouds. Summer morning, nostalgic and hopeful second chance at life. A small wooden fence and wildflowers in the near foreground, distant birds. Earthy olive greens, warm ochre, muted sage, blue grey, natural cream highlights. Cinematic environmental storytelling, polished 2D background painting, subtle brush texture, mature nuanced palette, extraordinary depth and warm light. No text, no lettering, no interface, no border, no watermark, no recognizable existing characters. Pure scenery with no people. It must remain readable when cropped to a very wide horizontal banner with the village visible.

## Typography

Cormorant Garamond and DM Sans were downloaded from the official Google Fonts service and saved as `.ttf` files. Each numbered file contains one weight: 0 = 400, 1 = 500, 2 = 600, 3 = 700. License text is included beside the assets.

## Thai typography

Noto Sans Thai and Noto Serif Thai variable TrueType fonts were downloaded unmodified from the official [Google Fonts repository](https://github.com/google/fonts) on 2026-10-25, pinned to revision `8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5`. Both use the SIL Open Font License 1.1; the complete source license accompanies each font. Weight coverage is 100–900. English assets and licenses remain in place. The app serves these files itself; no font CDN is used at runtime.

| Local file | Bytes | SHA-256 |
| --- | ---: | --- |
| `public/assets/notosansthai.ttf` | 218652 | `5a1c559bb539583c8a1fd99d1c5b9491e5e14478c9cd2bd0970d5c3096cc9ef8` |
| `public/assets/notoserifthai.ttf` | 292188 | `34a7ad11647c845303aabdde639059806c56b84719e5d2ceb28eb038711bdf53` |

Sources: [Noto Sans Thai](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notosansthai), [Noto Serif Thai](https://github.com/google/fonts/tree/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifthai). Local licenses: `public/assets/notosansthai-OFL.txt` and `public/assets/notoserifthai-OFL.txt` (4379 bytes each, SHA-256 `96ac951c8caddd87d8a66fe0d02342127696131d3e935ce4a936dc68cf032e33`).

## Icons and world guide

Icons: lucide-react (ISC).
The Six-Faced Life geometric mark and the simplified SVG regional guide were authored in code for this project. The map is explicitly labeled as simplified geography.

The complete OFL text is retained, with one trailing space normalized in each local license so repository whitespace checks pass. Font binaries are unmodified.
