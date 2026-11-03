# Pixel scene artwork generation record

Generated with built-in ImageGen on 2026-11-02. These are the original authoring call inputs recovered from this chat, including prompt templates and every variant substitution. Code blocks are provenance, not build scripts. Local reference paths identify generated source sheets; they are not distributed dependencies.

## Authoring batch 1

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 500}
const result = await tools.image_gen__imagegen({
transparent_background:false,
prompt: "Use case: ui-mockup. Asset type: preview-only art direction comparison board for Six-Faced Life, a fantasy browser life simulator. Create ONE landscape comparison board with TWO equal wide scene mockups stacked vertically, each in a restrained warm parchment frame, with very readable labels outside the art: 'A — Chunky retro' above the first and 'B — Detailed fantasy' above the second. Both panels depict precisely the SAME composition and gameplay situation, only the pixel-art resolution/detail changes. Scene: original medieval fantasy village edge, half-timber cottage on left, leafy tree on right, distant forest and small hills, path through middle. Single clearly visible adult elf protagonist in foreground, full body three-quarter side view, pointed ears and a green-and-ivory apprentice robe with subtle gold trim, practicing a small blue magic spell with a staff. Hero occupies about 30% of panel height, identifiable face and outfit, not tiny. A couple background villagers, a flag and leaves suggest ambient animation possibilities, but this is a STATIC concept image. Soft daylight, muted forest greens, warm paper cream, terracotta roofs, restrained gold, blue spell accent. A uses genuinely low-resolution chunky 16-bit game pixel art, roughly a 24-pixel-tall hero rendered with large crisp nearest-neighbor squares, limited palette, simple silhouettes. B uses more detailed high-quality handcrafted fantasy pixel art, roughly a 48-pixel-tall hero rendered with smaller crisp nearest-neighbor squares, richer but restrained shading and detailed equipment; clearly pixel art, never smooth illustration. Both use same side-view ground-level camera, character location, scene elements, color family and equal physical panel size. Keep the central activity and outfit legible in a short landscape banner suitable for a chronicle. No full app screen, no controls, no extra text, no franchise characters, no watermark, no blur, no anti-aliased painterly pixels, no faux screenshot gloss. This is a style choice board, not an animation sprite sheet and not production artwork."
});
generatedImage(result);

```

## Authoring batch 5

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 350}
const r=await tools.image_gen__imagegen({transparent_background:false,prompt:"Create an original production pixel-art background for a browser fantasy life simulator. Art direction: detailed handcrafted fantasy pixel art, sharply defined small square pixels, warm literary fantasy, muted forest greens, cream, terracotta, restrained gold, rich but controlled shading, NO smooth painterly or photographic textures. Output a very wide 3:1 landscape, intended final game grid 768 by 256. Scene: Asura-inspired original rural medieval hamlet, timber cottage left edge, leafy old tree right edge, distant castle and hills, path across lower foreground. Ground-level side view. Center foreground must be a clear flat empty stage for a separately composited full-body character; keep bottom ground and center visible when cropped into a short banner. Layered atmospheric depth. Absolutely no people, no characters, no flags in motion, no spell effects, no interface or labels, no frame, no watermark. This is ONLY scenery, not a screenshot or concept board. Background opaque, crisp pixel texture throughout."});generatedImage(r);

```

## Authoring batch 7

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 600}
const variants=[
["ranoa","Snowy Ranoa scholarly town: timber houses and stone academy in distance, snow-dusted roofs, pale winter sky, quiet packed-snow lane. Blue sage and cream, warm small window accents."],
["millis","Millis holy town: light stone houses, modest original cathedral silhouettes far behind, garden and cobbled lane. Cream masonry, olive foliage and warm subdued sunlight."],
["forest","Great Forest village: enormous ancient trees, wooden elevated homes and rope bridges in background, fern-lined dirt clearing foreground, green filtered daylight."],
["demon","Demon Continent settlement: strange rugged purple ochre hills, modest adobe and stone dwellings, sparse hardy plants, broad empty ochre lane, muted lavender sky. Cozy lived-in town, not apocalyptic."],
["begaritt","Begaritt desert outpost: sandstone courtyard dwellings, cloth awnings, distant sand dunes and a small oasis, empty sandy foreground path, warm desert light, muted terracotta and sage."]
];
await Promise.all(variants.map(async([id,scene])=>{
const result=await tools.image_gen__imagegen({transparent_background:false,prompt:`Original production backdrop for a detailed fantasy pixel-art browser life simulator. Region ${id}: ${scene} Match handcrafted fantasy game pixel art with crisp small square pixel edges, rich restrained shading, warm parchment-compatible colors, forest greens and restrained gold. Very wide 3:1 composition, target game grid768x256. Ground-level side-view, empty flat central foreground stage for a separately composited48px-tall protagonist. Detailed scenery concentrated on edges, layered regional architecture and landscape in distance. Absolutely no people, no characters, no effects, no text, no UI, no border, no watermarks. Background opaque. Not a painting: deliberate visible pixel-art texture.`});store("region-"+id,result);generatedImage(result);
}));

```

## Authoring batch 8

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 300}
const result=await tools.image_gen__imagegen({transparent_background:true,prompt:"PRODUCTION ANIMATION SPRITE SHEET, transparent background. Original detailed small-pixel fantasy game character, ADULT HUMAN, neutral androgynous appearance, short brown hair, simple ivory fitted undershirt and charcoal trousers and brown shoes, NO coat NO armor NO tools. Entire sheet EXACTLY 8 equal columns by17 equal rows, every cell64x64 logical pixels, total logical512x1088. Can upscale image but maintain exact regular grid and consistent anchors. Hero48pixels tall standing within64pixel square, side-on three-quarter facing right. Feet bottom anchor32,56 of each cell. Use crisp nearest-neighbor pixel art, refined fantasy RPG sprite, same character scale/hair/face and proportions in every cell. One complete 8-frame loop per row, chronological left to right. Row1 subtle idle/breathing; row2 looking around; row3 magic casting arm gesture with NO EFFECT; row4 fast overhead sword swings with EMPTY HANDS; row5 defensive parries EMPTY HANDS; row6 agile low sword motions EMPTY HANDS; row7 reading held imaginary book; row8 repetitive work hands at waist; row9 social greeting; row10 walking right in place; row11 sitting/resting; row12 happy celebration; row13 greeting; row14 arriving/waving; row15 quiet birth presentation neutral pose; row16 respectful settled still resting pose; row17 preparatory stretching. Keep rows8frames each. No empty cells, no text, no labels, no separator lines, no shadows outside characters, no gradient backdrop, actual transparent alpha. Match 1990s detailed fantasy RPG pixel sprites rather than vector shapes. This will be composited with independent career outfit and gear layers, so the uncluttered neutral body and consistent grid matter more than decorative clothing."});store("body-human-adult",result);generatedImage(result);

```

## Authoring batch 9

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 250}
const r=await tools.image_gen__imagegen({transparent_background:true,prompt:"Production original detailed fantasy pixel sprite atlas, exactly8columns and2rows equal square cells, transparent background. Each cell64x64 logicalpx, total512x128logicalpx, can upscale evenly. Row1 eight sequential walking-in-place frames of the SAME small background medieval villager, muted brown/olive tunic, simple dark trousers, neutral face, about30px tall, full body feet anchored32,56 everycell, facingright. Row2 eight sequential gently waving frames of the SAME restrained forest-green hanging cloth banner on a small wooden pole, gold edge, no symbols or text, sameanchor. Crisp refined RPG pixels. Keep generous consistent transparent margins, no text labels, no gridlines, no shadows outside sprites, no backdrop. Exactly16cells in regular rectangulargrid. This sprite sheet is a transparent overlay for a pixel-art life simulator."});store("ambient-draft",r);generatedImage(r);

```

## Authoring batch 10

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 300}
const r=await tools.image_gen__imagegen({transparent_background:true,referenced_image_paths:["C:\\Users\\Neary\\.codex\\generated_images\\01a19c4e-95de-7080-9eaf-4a70fc495aaa\\exec-5d97181d-dd6d-4279-8430-560b00ef51d2.png"],prompt:"Edit target: the supplied complete animation atlas. Create a REGISTERED CLOTHING-ONLY transparent overlay for this EXACT atlas. Preserve the original canvas dimensions, all 8 columns and all16 actual rows, exact pose positions and scale, exact character silhouettes. Dress each figure in a muted forest-green town guard tunic, leather belt, small chainmail shoulder pieces and brown guards' boots. Output ONLY those wardrobe pixels: erase every character head, hair, face, hands, exposed skin, and all underlying neutral undershirt/trousers unless replaced by the guard clothing. Keep original character geometry untouched so laying this overlay on the reference image produces a correctly dressed version frame-by-frame. No swords, no shields, no helmet covering face. Not a full character atlas; clothing alone floating in same registered positions with transparent gaps where heads and hands are. No text no grid lines, actual transparent alpha background. Critical invariants original16row8column grid, exact placement, same action poses, no added frames."});store("guard-overlay-draft",r);generatedImage(r);

```

## Authoring batch 11

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 700}
const outfits={student:"A modest sage student tunic and short academic cape, little book satchel",laborer:"Coarse ochre work shirt, patched trousers, work gloves and sturdy boots",farmer:"Rustic cream shirt, moss-green waistcoat, brown work trousers and a straw hat hanging at back",merchant:"Burgundy merchant doublet, leather coin pouch and respectable tan trousers",adventurer:"Olive adventurer cloak, light leather armor and compact travel pouch",swordsman:"Slate-blue martial tunic, leather bracers and fitted trousers",mage:"Deep teal wizard robe with restrained brass edging, open face, no hat",healer:"Ivory healer robe with sage sash, small medical pouch, no religious symbols",cleric:"Cream and forest-green clerical vestments with restrained gold edging, no symbols",knight:"Muted steel knight armor with forest-green tabard, no helmet or sword",teacher:"Practical warm brown teaching coat, ivory shirt and dark trousers",professor:"Dark academic gown with forest-green collar and gold fastening",retired:"Soft wool shawl, loose warm cream tunic and comfortable brown trousers","magic-training":"Ivory and deep forest-green apprentice training robe, small plain brass fastening","sword-training":"Practical green sword-training tunic, leather belt, brown bracers and sturdy boots"};
await Promise.all(Object.entries(outfits).map(async([id,description])=>{
const r=await tools.image_gen__imagegen({transparent_background:true,referenced_image_paths:["C:\\Users\\Neary\\.codex\\generated_images\\01a19c4e-95de-7080-9eaf-4a70fc495aaa\\exec-5d97181d-dd6d-4279-8430-560b00ef51d2.png"],prompt:`Create a REGISTERED CLOTHING-ONLY transparent overlay for the supplied EXACT animation atlas. Garment design: ${description}. Preserve original canvas dimensions, all8columns and all16actual rows, exact pose positions and scale. Output ONLY garment/trousers/shoes/accessory pixels. Remove heads, hair, faces, hands and exposed skin, leaving transparent gaps. Clothing must follow the reference's body geometry in every frame so overlaying it on the reference produces a dressed character without changing face or pose. No weapons, no large props, no helmets covering faces. Important: retain exact original16row8column layout, each figure position and movements. Match refined small-pixel fantasyRPG artwork. All background actual alpha. No labels, no grid lines.`});
store("outfit-"+id,r);text({id,path:r.output_hint?.match(/as (C:\\[^\n]+?\.png) by default/)?.[1]});
}));

```

## Authoring batch 13

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 900}
const races={human:"human, ordinary ears, brown hair",elf:"elf with clearly visible long pointed ears, pale blond hair",beastfolk:"beastfolk with clearly visible tawny cat ears and a tail, brown hair",migurd:"Migurd with vivid blue hair and a small youthful-featured face",dwarf:"dwarf with a full short dark beard, broad sturdy face and build",superd:"Superd with green hair and a small red forehead gem, pointed ears"};
const requests=[];
for(const [race,traits]of Object.entries(races))for(const stage of ["adult","elder"]){if(race==="human"&&stage==="adult")continue;requests.push([race,stage,traits]);}
await Promise.all(requests.map(async([race,stage,traits])=>{
const r=await tools.image_gen__imagegen({transparent_background:true,referenced_image_paths:["C:\\Users\\Neary\\.codex\\generated_images\\01a19c4e-95de-7080-9eaf-4a70fc495aaa\\exec-5d97181d-dd6d-4279-8430-560b00ef51d2.png"],prompt:`Edit this exact character animation atlas into the SAME CHARACTER POSES but with these features: ${traits}. Age stage: ${stage==="elder"?"elderly, visibly aged face, wrinkles, grey streaks in hair (retain distinctive racial hair color), mature calm expression":"adult, young mature face"}. Preserve EXACT original canvas dimensions and all16rows by8columns, the original body positions, movement poses, limb registration, foot locations and relative scale. Keep identical neutral ivory undershirt and charcoal trousers, original brown boots, no tools or armor. Only change race/age features and appropriate face/hair. Ears and tail may extend slightly, never move the underlying limbs or clothing silhouette because independent garment layers must still align. Detailed small crisp pixels matching the source. No labels, no grids, no extra characters or new poses. All background actual transparent alpha.`});store(`body-${race}-${stage}`,r);text({id:`${race}-${stage}`,path:r.output_hint?.match(/as (C:\\[^\n]+?\.png) by default/)?.[1]});
}));

```

## Authoring batch 14

```javascript
// @exec: {"yield_time_ms": 120000, "max_output_tokens": 900}
const specs=[
["infants","Original transparent detailed fantasy pixel sprite sheet, exactly4columns by6rows equal square cells. Four sequential subtle breathing/blinking frames of SAME swaddled newborn baby per row, side three-quarter view resting safely in an ivory cloth cradle wrap. Row1 human brown hair; row2 elf blond tuft and tiny pointed ears; row3 beastfolk tawny cat ears and tiny tail tucked in wrap; row4 Migurd blue hair; row5 dwarf round sturdy baby face brown tuft NO beard; row6 Superd green hair small red forehead gem. Everybaby full little wrappedbody, sameanchor inallcells. Actual transparency, no adults, no labels, no gridlines, no watermarks. Refined small visible pixels, not smooth illustration. Equal cells, gentle changes only, cute without giant heads."],
["rank-gear","Original transparent detailed fantasy pixel-art EQUIPMENT sheet, exactly7columns by2rows equal square cells. Fourteen isolated FRONT-FACING SHOULDER MANTLES with clasps, no characters/body/heads/limbs. Each mantle is a small wearable overlay around neck opening and shoulders, wide and shallow, centered in its cell, generous transparent margins. Columns show increasing quality left to right. Row1 MAGIC: 1 simple ivory cloth clasp, 2 bronze-edged sage collar, 3 silver-edged teal shoulder mantle, 4 embroidered blue-sage short cape with silver fastening, 5 ivory-gold ornate mantle, 6 dark-green high collar with restrained blue crystal clasp, 7 refined white and gold mantle with elegant blue crystal brooch. Row2 SWORD:1 plain brown leather shoulder guards, 2 reinforced leather bronze clasps, 3 muted steel shoulder armor,4 steel silver engraved pauldrons,5 green and gold shoulder armor,6 darksteel ornate armor gold clasps,7 refined white steel and gold layered armor. No readable symbols or text, no weapons, no glow spilling outside gear, no mannequin, genuine transparent background. Crisp small fantasyRPG pixels, restrained earthy palette, precise7x2 grid."],
...Object.entries({water:"A small flowing blue water orb and curling droplets",fire:"A small restrained orange fire orb with warm sparks",earth:"Several small ochre stones and dust rising in a controlled arc",wind:"A small pale sage wind spiral with delicate leaves",healing:"A soft green-and-ivory healing light with tiny motes, no cross symbol","sword-god":"A short original steel practice sword making a decisive overhead cutting arc, restrained pale gold trail","water-god":"A short original steel practice sword performing a controlled defensive parry, restrained blue-sage arc","north-god":"A short original steel practice sword making an agile low sweeping strike, restrained ochre trail"}).map(([id,subject])=>["effect-"+id,`Original production transparent pixel-art effects animation sprite strip, exactly8equal square cells inONE horizontal row. ${subject}. Eight sequential coherent frames lefttoright building then fading into loop. Each effect centered initscell with generous transparent margin, no effect touching neighboringcells. Logical128pxcell each; total1024x128 logical can upscale proportionately. Refined small crisp fantasyRPG pixels, subdued intensity suitable behind readable text, true transparent alpha. No character, no hands, no labels, no grids, no letters, no border, no background, no watermarks. For swordframes keep visible hilt near lower-left quadrant as blade sweeps towardupperright; for magic center orb slightlyright ofcenter. Exactly8frames with clear progression not8unrelated effects.`])
];
await Promise.all(specs.map(async([id,prompt])=>{
const r=await tools.image_gen__imagegen({transparent_background:true,prompt});store(id,r);text({id,path:r.output_hint?.match(/as (C:\\[^\n]+?\.png) by default/)?.[1]});
}));

```
