# Ending layout regression — 2026-11-14

The full `SwordProgress` section was the first child of the four-column
`.legacy-grid`. Its three definition rows and advancement disclosure stretched
the grid vertically and pushed the fourth compact life fact onto another row.
An isolated browser assertion failed before the fix: Thai at 1280px gave the
sword section 184.31px inside a 780px grid.

The compact facts now precede a separate full-width, start-aligned sword section.
Shared sword rows use flexible columns instead of the general definition list's
fixed label column. No simulation, save-schema, migration, or stored prose changes.

## Verification actually run

- New EN/TH component regressions failed before the fix on reading order, then
  passed. They verify all four compact facts precede sword records, retained
  per-style XP, and the absence of a practice selector in completed lives.
- `npm test`: **695 tests in 80 files passed**, 115.00s. A subsequent canonical
  fixture-cause correction was checked with `npm test -- src/components/LifeView.test.tsx`:
  **9 passed**. Targeted ending/sword tests also passed **16/16**.
- `npm run build`: **passed**, TypeScript and Vite. Existing >500kB chunk advisory
  remains (829.34kB JavaScript); no new dependency or build configuration.
- Browser geometry/keyboard matrix: **18 passed**, EN/TH at widths
  1280, 859, 851, 850, 741, 651, 650, 390, 320. Sword records take full width;
  rank/XP columns stay within rows; compact facts share a row above 850px;
  Enter opens the advancement disclosure with visible keyboard focus.
- Additional browser matrix: **30 passed**, EN/TH at 1280, 390, 320 covering
  current endings, legacy endings, old expanded endings without sword ledgers,
  live chronicle rails, and character pages. Real archive navigation/reload
  preserves the saved data, and ending controls remain read-only.
- Matrices reported no page/console errors or horizontal document overflow;
  the main matrix also checked HTTP resource errors. Desktop EN/TH and narrow
  mobile screenshots were visually inspected. These are Chrome-emulated
  viewports, not physical-device or screen-reader certification.
- Independent scoped code review: **no findings**. `git diff --check`: passed.
- Impeccable detector ran once over changed markup/CSS. It exited 1 for existing
  stylesheet font/color/type-ramp findings (including documented Thai font
  aliases and focus gold). Changed rules introduce no colors, fonts, or sizes;
  no detector finding identifies the changed declarations. Broader design-record
  drift is outside this bug fix.

QA uses fresh temporary Chrome contexts on `127.0.0.1:5174`. Existing Chrome
profiles, the player's 5173 save and hosted saves were untouched. Fixture setup
errors in the extra probe (active summary must be null; Thai menu name) were
corrected before its successful run. Scripts/screenshots stay ignored under
`six-faced-life/.openai/ending-qa/` and `checkpoints/`; the pre-existing 5174 server
was reused and left running.
