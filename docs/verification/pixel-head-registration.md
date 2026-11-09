# Pixel head/wardrobe correction — 2026-11-09

Branch `codex/pixel-layer-registration` from freshly fetched `origin/main5c3cf90`
(PR21 merged). User confirmed head/clothing misalignment, not occupation copy.

Reproduced static face overpaint: Elf teen farmer pixel(18,19), bodyRGBA
(98,23,5,248) became(164,114,56,255). New literal regression failed first,
then passed after authoring-only head exclusion. Four face pixels are pinned.

Updated exporter/helpers and64 wardrobe PNGs with byte metadata. No body PNG,
domain/save/RNG/rendering/animation/source artwork change. Total179 assets,
41,229,786 bytes (519,862 fewer). Body/garment cell dimensions and IDs unchanged.
Rejected initial broad mask; final pose matching independently checked across
136 Human adult cells with no confirmed Important/Critical introduced issue.

Verification:
- `python scripts/test_pixel_registration.py`:4/4 PASS after RED→GREEN.
- `npm.cmd test -- --maxWorkers=2`:396/396,61 files,71.65s,exit0.
- `npm.cmd run build`:PASS; existing >500kB JS advisory.
- Human adult/Elf teen17-clip frame0/3/7 contacts, six races × child/teen/adult/
  elder idle farmer/magic contacts inspected. Not every Cartesian garment/race/
  frame combination was visually inspected.
- IAB isolated5174: TH Elf15 farmer Ranoa; loaded body/outfit paths verified,
  clear face with motion off, motion/playback on,390px mobile no overflow,
  warning/error log empty. Screenshot/contact evidence and sources are ignored
  under `.sites-workflow/registration/` and `.sites-workflow/pixel-life/`.
- Browser tab closed, viewport reset; task-owned5174 server stopped at handoff.
  Player5173 storage untouched.

Remaining pre-existing art limitation: some garment poses differ from bodies
(e.g. prepare3 raised arch/rest poses); this change does not redraw them.
Deferred reviewer minors: literal multi-pose head/torso tests and rejection of
implausible match scores on future source exports. Module-description correction
was documentation accuracy only. User merges manually; no publication.
