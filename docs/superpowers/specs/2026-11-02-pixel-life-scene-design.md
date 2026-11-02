# Pixel life scene

Status: **proposed design, awaiting user approval**. Interview decisions below
are confirmed; implementation has not started. Task branch:
`codex/pixel-life-scene`, targeting `main`.

## Intent

Make an unfolding life visible through a detailed pixel-art character performing
their current activity within an animated regional setting. The character's
race, age, career, selected training discipline and earned rank should be
recognizable while the player reads the chronicle and makes existing choices.

This is a substantial artwork and presentation project, not a new simulation.
The comparison image shown in chat is a static art-direction reference, not a
finished sprite sheet or evidence that animation exists.

Visual reference: [style comparison artwork](assets/2026-11-02-pixel-life-style-comparison.png).
The user selected the **lower panel, B**. This is original concept artwork
generated with the built-in imagegen tool for this interview, retained as a design
source rather than a production asset or browser screenshot. Match its smaller
crisp pixels, readable full-body hero, detailed clothing, restrained magic and
layered village depth; do not reproduce the rejected upper panel's chunky style.

## Confirmed interview decisions

- Replace the chronicle's painted landscape with a pixel scene containing both
  character activity and animated surroundings. Other screens retain their art.
- Follow actual location and yearly focus. Career determines ordinary clothing;
  focus determines the action even when it differs from the job.
- During sword or magic practice, training gear replaces the career outfit and
  visibly reflects the earned rank. Training visuals use the **currently selected
  discipline**, not the strongest unrelated track.
- Show baby, child, teen, adult and elder appearances, adapted to the life race
  and its lifespan. Race affects visible features as well as aging.
- Pausing or waiting for a choice stops the activity and leaves the character
  idling; ambient scenery continues gently while the scene is visible.
- Keep movement at a comfortable constant speed at every playback setting,
  including 8x. Update the depicted state as gameplay changes.
- Major events receive brief reactions inside the scene without delaying play.
- Use **B: Detailed fantasy**, selected from the two static mockups: crisp pixel
  sprites, readable clothing and race features, rich restrained scenery, warm
  lighting, forest greens, paper neutrals and limited gold. Keep the existing
  parchment interface, fonts, controls and hierarchy.
- The scene is **visual only**. Clicking scenery or characters triggers no action.
- Use **approach 1: layered pixel sprites**, selected by the user.

## Approaches considered

1. **Layered sprites in the existing React view — selected.** Compose regional
   backgrounds, bodies, clothing, equipment and effects. Reuse frame alignment
   across interchangeable layers; use CSS sprite timing and modest ambient
   transforms. Fits the existing stack without a separate game renderer. Requires
   careful art registration, clipping, asset loading and lifecycle management.
2. **Canvas scene renderer.** Offers explicit draw order and finer control of
   dense effects and crowds, but requires another rendering and scaling lifecycle
   alongside React. The agreed decorative scene does not require that complexity.

## Existing integration and constraints

`LifeView.tsx` currently renders `Landscape` beneath location, life-stage and
career captions. `Landscape.tsx` is shared with other views, so replace its use
in the chronicle rather than globally changing the original painting.
`App.tsx` owns playback, visibility behavior, navigation and saving. Neither
renderer nor animation completion may advance time or resolve a choice.

The design supersedes the painted-art requirement **only inside the chronicle
scene**. Retain the original artwork elsewhere and as the load/error fallback.
Preserve the existing English/Thai text system and accessible interaction order.

## Presentation policy — proposed builder decisions

The following are concrete proposed defaults, not additional user confirmations.
They are included for approval with this document.

### Scene selection

Derive one read-only scene description from existing life state and playback.
Resolve in this order: lifecycle/age safety, region, current focus/activity,
outfit, selected training track and earned rank, then transient reaction.

Use all six current regions: Asura countryside/town, snowy Ranoa, Millis stone
town, Great Forest settlement, Demon Continent settlement and Begaritt desert
outpost. These are original representative regional scenes, not claims about an
exact house, map position, canon building or weather simulation. Locality details
may vary decoratively only when supported by existing state. Do not add simulated
weather or day/night mechanics. Background NPCs are ambient villagers, not factual
family members unless an explicit reaction is supported by recorded relatives.

| Focus | Base activity |
| --- | --- |
| Balanced | Quiet everyday movement and observing surroundings |
| Magic | Practice the selected magic discipline |
| Sword | Practice the selected sword style |
| Study | Read/write at a desk or with a book |
| Work | Perform the current occupation's work loop |
| Bonds | Socialize with a generic companion; do not invent a named relative |
| Explore | Walk with travel equipment in the actual current region |
| Rest | Sit/rest with gentle breathing |

Movement within a background never implies a game-location change. Active
journey state may use a walking loop without claiming arrival before the game's
region changes. Infants use age-appropriate resting/observing variants, never
adult employment, weapons or spell casting. Other stages respect existing
training availability; a locked/unselected discipline gets an honest preparatory
or idle loop, not a fabricated learned style or spell.

### Identity, age and outfits

Cover all six `RaceId` values: human, elf, beastfolk, Migurd, dwarf and Superd.
Use the existing `lifeStage(age, race)` boundaries (under 3, under 12, under 18,
adult until 70% of race lifespan, then later years). These are existing authored
game rules, not a new claim about canon aging. Keep character proportions and
features stable across frames. Infer no gender or latent genetic manifestation
that the game has not recorded/revealed. Stable cosmetic variation can be derived
from life identity without consuming simulation randomness or adding save fields.

Outside training, explicitly map every current legacy and expanded occupation:
child, student, laborer, farmer, merchant, guard, adventurer, swordsman, mage,
healer, cleric, knight, teacher, professor and retired. Related roles may share a
base garment, with distinctive tools/accessories that make the current job
recognizable. Use the primary recorded job; optional training does not invent a
new career. Neutral clothing covers unemployed/unknown future values safely.

For magic/sword focus, select a training outfit family, overlay that track's
earned rank details and its discipline-specific equipment/effects. Cover the
game's seven ranks from Beginner through God, without inventing unlocks. Use
existing rank helpers and actual capped progress. Do not treat XP alone, a future
promotion, aggregate sword XP or an instruction cap as an earned rank.

All five magic disciplines (water, fire, earth, wind, healing) and all three
sword styles (Sword God, Water God, North God) need distinct visual treatments.
Adjacent ranks must have an observable garment/equipment detail, not just an
unbounded larger particle effect. Higher tiers remain restrained enough for
reading. Shared body/garment layers avoid rendering the entire combination
matrix as separate full-scene images.

Legacy lives use their recorded discipline and progression through a read-only
adapter; do not migrate or assign an expanded sword style just for visuals.
Unknown old discipline values use neutral practice rather than a false school.

### Playback and reactions

| State | Character | Surroundings |
| --- | --- | --- |
| Visible and playing | Current activity, steady speed | Gentle ambient motion |
| Visible and paused / pending choice | Quiet idle in current outfit | Gentle ambient motion |
| Hidden tab or scene not mounted/visible | Suspend animation work | Suspend animation work |
| Reduced motion or scene motion switched off | Representative still frame | Still frame |
| Ended life | Settled ending pose; no activity loop | Still frame |

Add a labeled **Scene motion** on/off control near the scene, independent of Play
and Pause. Default on unless reduced motion applies; reduced motion always wins.
Keep the preference in memory for this session, without touching the life save.
The toggle controls all scene motion and uses existing keyboard/touch styles.
No sound or music is added.

Limit the initial reaction vocabulary to birth/new-life presentation, career
appointment/promotion, earned sword/magic rank increase, recorded marriage/direct
child birth, region arrival and ending. A family celebration requires an actual
recorded event, not a generic rise in bonds. No reenactment of every story event,
combat cutscene or visual prediction of an unresolved decision.

Show reactions for approximately two seconds at normal motion speed, driven by
actual before/after transitions. A pending choice still forces idle; defer one
reaction until it clears, and discard it if a newer event/life supersedes it.
Ending takes precedence, then arrival, rank/career changes, then family/birth.
Keep at most one current and one latest deferred reaction: never build a backlog
at 8x. New life, navigation, unmount and reload clear transient reactions. Hidden
tabs discard obsolete reactions rather than playing catch-up. No historical
reaction is replayed merely because a saved life or archive was opened. Reduced
motion expresses the new state as a still image without a timed reaction.

### Layout, accessibility and fallback

Preserve the scene's current place in reading order and responsive container.
Compose the hero within a safe area so desktop banner crops retain their face,
outfit and activity. Captions must remain readable without covering the hero;
adjust their arrangement within the scene if necessary. The existing narrow-phone
rule hides the scene during a pending decision; retain that behavior so decisions
stay near the controls. When the scene is visible again, show current state.

Use a short localized description of location/activity/appearance, with purely
decorative layers hidden from assistive technology. Do not announce every frame
or focus the animation on updates. Existing game text remains authoritative for
rank, occupation and outcomes. The art adds no click targets beyond the motion
toggle. Avoid flashes, rapid full-screen changes, or contrast-heavy pulses.

Reserve layout space during loading. If scene assets fail, retain captions and
use the original painted fallback with an accurate generic artwork label. Do not
leave the current fixed 'imagined view of Asura' caption on other regional pixel
scenes. Presentation failures must not block decisions, playback or saving.

## Asset and implementation boundaries

Create original production raster assets with consistent pixel density, palette,
anchors, transparent margins and frame grids. The detailed mockup is direction,
not automatically an animation-ready source. No borrowed franchise sprites.
Production assets and provenance belong in `public/assets/` and its existing
asset documentation; keep preview screenshots, caches and generated builds out
of Git. Preserve licenses and existing hosting metadata.

Before implementing the renderer, the implementation plan must enumerate the
asset manifest: six regions; all race/stage bodies; listed occupation outfits;
eight focus loops plus idle and reaction poses; seven rank details for each
training family; five magic effects and three sword treatments. Shared compatible
layers are expected. A coverage table must account for every current enum value.
Do not silently ship a partial race/job set as the completed feature.

Builder discretion: exact sprite dimensions/frame count, modest ambient NPC
count, art production tooling, cache/preload strategy and module names. Prefer
current React/CSS and local assets. As proposed starting limits, load only the
active region and character layers, keep a scene's transferred compressed art
under 2 MB, and cap the initial scene at 20 independently animated elements.
Measure these in QA and document any justified budget change before delivery.

Scene selection should be a pure, independently testable presentation resolver;
layer rendering and transient timing belong outside the simulation. No new
backend, game-engine dependency, account, paid service, saved schema, random
draw, ability, item ownership or gameplay effect is introduced.

## Acceptance and verification for future implementation

1. The chronicle uses style B with readable region, race, age and outfit across
   desktop and 360px mobile. Other uses of the painting remain intact. Inspect
   actual scaled sprites for crisp pixels, coherent layers and cropped equipment.
2. Exercise every focus, region, race/stage, occupation, selected discipline and
   rank through resolver/manifest coverage. Check career versus focus priority,
   unavailable early training, unselected swords, capped ranks and legacy lives.
3. Verify Play/Pause, pending and manual/Watch choices, 1x/8x, hidden tabs,
   navigation, reload, motion toggle, reduced motion, endings and burst reactions.
   No backlog, replayed outcomes, new focus movement or animation-controlled time.
4. Use isolated saves on port 5174 or another separate QA origin. Check EN/TH,
   keyboard, screen-reader description, console, overflow, loading/failure and
   request sizes. Preserve the player's 5173 save. Assert resolver/animation
   operations leave life data and RNG unchanged.
5. Run `npm test` and `npm run build` from `six-faced-life/` for implementation;
   inspect results. Update PRODUCT, DESIGN, structured sidecar and asset records
   only when behavior/art actually exists. Deliver through the same task PR;
   human merges manually and publishing remains separately authorized.

## Current delivery boundary

This change delivers the proposed spec and checkpoint only. No app code,
production assets, browser-save operations, implementation plan or deployment
has been made. Next: user reviews this spec and its explicitly proposed defaults;
after approval, create the implementation plan before building.
