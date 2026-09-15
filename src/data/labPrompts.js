// The two prompts the lab sends, kept verbatim as supplied. Both are editable
// in the UI at run time, and the edited text is read fresh on every request, so
// nothing here needs changing to test a new wording.
//
// Note: the generation prompt below is passed straight through to Gemini, so its
// punctuation is left exactly as written even where house style would differ.

// {Location name} is replaced with the location being generated.
export const LOCATION_TOKEN = "{Location name}";
// {People} is replaced with what the subject read wrote about the two people.
export const PEOPLE_TOKEN = "{People}";

export const DEFAULT_IMAGE_PROMPT = `IMAGE 1 is a real photograph of {Location name} with people in it. IMAGE 2 shows the people to be placed into it.
TASK: In IMAGE 1, replace the one or two people nearest the camera with the people nearest the camera in IMAGE 2. Assign each person to whichever position better suits their height and build.
FROM IMAGE 1 TAKE ONLY THESE FIVE THINGS: the framing, the background, where the people stand, how large they appear in the frame, and their pose.
IMAGE 1's PEOPLE ARE A POSITION AND POSTURE TEMPLATE ONLY. Nothing about how they look transfers: not their faces, hair, beards, glasses, sunglasses, skin, clothing, footwear or accessories. If they wear glasses and IMAGE 2's people wear different glasses, use IMAGE 2's. If they wear glasses and IMAGE 2's people wear none, use none.
EVERYTHING ABOUT THE PEOPLE COMES FROM IMAGE 2, exactly as photographed, EXCEPT THE OUTFIT, WHICH MUST BE LOCATION-APPROPRIATE:

THE PEOPLE IN IMAGE 2, DESCRIBED:
{People}

* Faces: exact width and shape. Do not slim, narrow, lengthen or sharpen.
* Bodies: exact build and the height difference between them. Do not reshape.
* Hair: exact length, volume, texture and style. Curly stays curly. Tied stays tied.
* Facial hair: exact density and shape. Do not trim or tidy.
* Eyewear: the exact frames, their shape, size, thickness, colour and lens tint.
* Clothing: replace the clothing shown in IMAGE 2 with realistic, location-appropriate clothing suitable for {Location name}, the local weather, climate, culture, setting and activity. The outfit must look natural for a real person visiting this location. Preserve the person's body shape, proportions and overall appearance. Do not use generic tourist clothing if the location calls for something more specific. Do not change the person's identity, body, pose or proportions to accommodate the clothing. Clothing should have realistic fit, folds, shadows and interaction with the body.
* Accessories and body art: keep every watch, bracelet, thread, ring, earring and necklace from IMAGE 2 wherever it naturally survives the change of outfit. Keep all mehndi and tattoos exactly as they are, on the same hands, arms and feet, at the same density and reaching the same distance up the limb. Body art is part of who these people are, not decoration to be tidied away.
* Skin: keep pores, blemishes, moles and asymmetry. Do not smooth, brighten, de-age or flatter.

The people must remain unmistakably the same people as photographed in IMAGE 2. A friend of theirs must recognise them instantly. Do not beautify, retouch, stylize or improve their appearance. If either person looks better than in IMAGE 2, or younger, or more symmetrical, or more conventionally attractive, you have failed.
THE ONLY REGION YOU MAY ALTER is the area IMAGE 1's foreground people occupy, plus their shadows. Everything else is final: sky, clouds, water, ground, buildings, ornament, sculpture, trees, hedges, lettering, and every background person, unchanged in number, position, size and clothing. The new people must fill the same height in frame as the people they replace. Do not reframe, recrop, resize, zoom, or change the dimensions or aspect ratio. Do not resaturate, relight, regrade, sharpen or denoise.
LIGHT: discard IMAGE 2's lighting completely. IMAGE 2 may be lit by coloured or stage light; none of that colour carries over. Read direction, height, hardness, shadow length and colour temperature from the shadows already in IMAGE 1, and make the new people obey exactly that, while keeping their true skin tone as it would look in neutral daylight. Bodies sit naturally into the surface with contact shadow beneath. Match IMAGE 1's grain and never exceed its sharpness.
OUTFIT RULE: The clothing should be determined by {Location name} and what a real visitor would appropriately wear there. Consider climate, temperature, season, local cultural norms, terrain and the specific activity visible in IMAGE 1. The clothing should look naturally photographed in the scene, not digitally composited or costume-like. Do not carry over IMAGE 2's original clothing when it is unsuitable for the location.
If IMAGE 1 contains an ATV ride activity image, then put appropriate gum boots and helmets on the people taken from IMAGE 2 when placing them into IMAGE 1. These should look naturally worn and realistically integrated with the people and scene.
Output: IMAGE 1's exact framing, dimensions and aspect ratio, 2K, image only.`;

// Read off the uploaded photo before any generation, and injected into the
// prompt above at {People}. A single reference image is thin evidence for a face,
// especially one shot under coloured light. Words survive the trip better.
export const DEFAULT_SUBJECT_PROMPT = `Describe the one or two people nearest the camera in this photograph, precisely enough that another model could redraw their faces from your words alone.

For each person, working left to right across the frame, give:
- label: "left" or "right"
- face_box: a tight box around their head, including all their hair
- description: 70 to 110 words, plain and factual, covering apparent age range, face shape and width, jawline, chin, cheekbones, nose shape and bridge, eye shape, size and spacing, eyebrow shape and thickness, lips, skin tone and texture, any moles, marks or asymmetry, facial hair density and shape, hair length, colour, texture and how it is worn, build, and apparent height next to the other person.
- body_art: where any mehndi or tattoos sit and how far up the limb they reach, or "none"

Judge only what is visible. Correct for coloured or stage lighting when you report skin tone, and say what it would look like in neutral daylight. Do not flatter or tidy: note the asymmetries, because they are what makes a face recognisable. Do not describe clothing, jewellery, the setting or the lighting.

Return JSON only:
{"people": [{"label": "left", "face_box": [ymin, xmin, ymax, xmax], "description": "...", "body_art": "..."}]}
Boxes are normalised 0 to 1000, in the order ymin, xmin, ymax, xmax.`;

// Run on every generated image, against the original photo. Its fixes are fed
// back into the next attempt.
export const DEFAULT_LIKENESS_PROMPT = `IMAGE A is a photograph of two real people. IMAGE B is a generated picture meant to show those same two people somewhere else.

Judge one thing only: whether IMAGE B shows the same people. The setting, clothing, pose and lighting are meant to differ, so ignore them completely. Ignore image quality.

Score out of 100. 100 means a friend of theirs would not hesitate for a moment. 70 means recognisable but altered. 50 means a plausible sibling. 20 means a different person of similar type.

Then list what is wrong, most damaging first, as short physical instructions to whoever will redraw it. Be concrete: "the jaw is narrower than the reference", "the beard has been trimmed shorter", "the hair has been straightened", "the mehndi is missing from the right forearm", "the face has been slimmed and de-aged". Say nothing about the setting, the outfit or the lighting. If a person is missing or a third person has appeared, say so first.

Return JSON only:
{"score": 0, "same_people": false, "fixes": ["...", "..."]}`;

export const DEFAULT_VALIDATE_PROMPT = `You are validating a photo a couple has uploaded so they can be placed into travel
scenes. Judge only what is visible. Return JSON only, no prose.

SUBJECTS are the one or two people nearest the camera. Ignore anyone smaller or
further back.

Judge framing and pose generously — reject only clear failures. Judge sharpness,
lighting and filtering strictly.

Check in this order and report only the single most important failure:

NOT_PORTRAIT — the image is landscape or square. It must be taller than it is wide.
NO_PERSON — no person clearly visible.
TOO_MANY_PEOPLE — three or more people are main subjects at similar size and distance.
BODY_CROPPED — a subject is cut off at or above the waist. Any visible part below the
  waist passes, even a small one — hips, thighs, knees, legs or feet. Reject only when
  the frame ends at the waist or higher.
BODY_OBSCURED — a subject's body is substantially hidden behind a vehicle, animal,
  railing, table, water or equipment, so their build and posture cannot be read.
  Riding or sitting on a vehicle counts.
HEAD_COVERED — a helmet, hood or cap hides most of a subject's hair.
TOO_CLOSE — arm's-length or face-forward shot: a head fills more than about a third
  of frame height, or a raised arm holding the camera is visible.
FACE_OBSCURED — a subject's face is blocked by a hand, object or mask, lost in deep
  shadow or silhouette, or turned so far that the features cannot be made out. An
  angled or partly turned face passes as long as the features are readable.
  Sunglasses always pass.
TOO_BLURRY — a face is soft, motion-blurred, or too small and low-resolution for
  features to be distinct.
TOO_DARK — too dark or too backlit to read facial features.
HEAVY_FILTER — strong beauty filter, skin smoothing, colour filter, sticker or heavy
  edit.
NOT_A_PHOTO — screenshot, illustration, cartoon, AI image, or a photo of a screen or
  printed photo.

Return exactly {"accept": true} or {"accept": false, "code": "<CODE>"}.`;

// What the couple is shown when a check fails. Keyed by the code the validator
// returns; an unknown code falls back to a generic line.
export const REJECTION_COPY = {
  NOT_PORTRAIT: "Please upload a portrait photo - taller than it is wide.",
  NO_PERSON: "We couldn't find anyone in this photo. Try one with both of you in it.",
  TOO_MANY_PEOPLE: "This works best with just the two of you - try one without others in frame.",
  BODY_CROPPED: "This one's cut off too high. Try a photo showing a bit more than just your upper body.",
  BODY_OBSCURED: "We can't see you clearly here. Try a photo where you're standing, with nothing in front of you.",
  HEAD_COVERED: "Helmets and hoods hide your hair. Try a photo with your heads uncovered.",
  TOO_CLOSE: "This one's a bit close. Ask someone to take it from a few steps back.",
  FACE_OBSCURED: "We need a clearer look at your faces. Try one where they're not covered or in shadow.",
  TOO_BLURRY: "This photo's a little soft - a sharper one will look much better.",
  TOO_DARK: "It's a bit too dark to see you clearly. Try one taken in daylight.",
  HEAVY_FILTER: "Filters change how you look. An unfiltered photo will look more like you.",
  NOT_A_PHOTO: "Please upload an original photo from your camera roll.",
};

export const FALLBACK_REJECTION = "This photo won't work for us. Try another one.";

// Two people in one photo is where the likeness keeps breaking: the model has
// four faces in front of it and averages them. Placing one person at a time
// leaves it only one face to copy, so there is nothing to blend with.
export const passOneNote = (side, label) =>
  `THIS IS PASS 1 OF 2. Replace ONLY the foreground person on the ${side} of IMAGE 1. `
  + `Use the person described above as "${label}", and the single face reference supplied. `
  + `Leave the other foreground person in IMAGE 1 completely alone for now: same face, `
  + `hair, body, clothing, position and shadow. They are replaced in the next pass. `
  + `There is only one person to place here. Do not blend anyone together.`;

export const passTwoNote = (keepSide, side, label) =>
  `THIS IS PASS 2 OF 2. The person on the ${keepSide} of IMAGE 1 is already correct. `
  + `Leave them absolutely untouched, pixel for pixel: face, hair, skin, body, clothing, `
  + `jewellery, position and shadow all stay exactly as they are. Replace ONLY the `
  + `foreground person on the ${side}. Use the person described above as "${label}", and `
  + `the single face reference supplied. There is only one person to place here. Do not `
  + `blend anyone together, and take nothing from the person on the ${keepSide}.`;

/* ── the descriptor pipeline (workflow 5 and 9) ── */

// Tokens the composite prompt can use on top of {Location name} and {People}.
export const OUTFIT_TOKEN = "{Outfit}";
export const HEIGHT_TOKEN = "{Height}";
export const PLACEMENT_TOKEN = "{Placement}";
export const LIGHT_TOKEN = "{Light}";

// Prompt A. Read once per uploaded photo and cached. Describing a face
// positively carries further than forbidding the model from changing it, so this
// is the largest single lever on whether the couple survives the trip.
export const DEFAULT_DESCRIPTOR_PROMPT = `You are extracting identity descriptors from a photograph for use in an image compositing pipeline. Accuracy matters more than kindness. Describe what is actually visible, plainly. Do not flatter, soften or idealise.

Return ONLY a JSON object. No preamble, no markdown fences.

{
  "person_count": 0,
  "people": [
    {
      "position": "left",
      "apparent_gender": "male",
      "descriptor": "one flowing sentence, 25 to 40 words, covering face shape and width, skin tone, hair length volume texture and how it is worn, facial hair if any, eyewear if any, and any distinctive visible feature",
      "attributes": {
        "face_shape": "round",
        "face_width": "medium",
        "skin_tone": "plain description, for example medium warm brown",
        "hair_length": "for example long, past shoulders",
        "hair_texture": "straight",
        "hair_volume": "full",
        "facial_hair": "description or none",
        "eyewear": "frame shape, thickness, colour, lens tint, or none",
        "build_visible": true,
        "build": "description, or not visible because clothing obscures it",
        "relative_height": "for example approximately one head shorter than the person on the right"
      },
      "usable_for_transfer": true,
      "issues": []
    }
  ],
  "image_quality": "good",
  "blocking_issues": []
}

Rules:
- Order people left to right as they appear in the frame.
- face_shape is one of round, oval, square, heart, long. face_width is one of narrow, medium, wide. hair_texture is one of straight, wavy, curly, coily. hair_volume is one of flat, medium, full.
- If clothing obscures the body, set build_visible false. Do not guess.
- Set usable_for_transfer false if a face is turned away, heavily shadowed, blurred, or smaller than roughly 8 percent of frame height.
- Set image_quality to good, acceptable or poor. Poor means heavy filters, low light or heavy compression.
- Correct for coloured or stage lighting when you report skin tone, and report what it would look like in neutral daylight.`;

// Prompt B. Identity sits at the top, because attention thins out down a long
// prompt. Almost no prohibitions: a positive description of the real face beats
// a list of things not to do, which models process weakly and sometimes invert.
export const DEFAULT_COMPOSITE_PROMPT = `Insert the two people from IMAGE 2 into the scene in IMAGE 1.

IMAGE 1 is the location photograph. IMAGE 2 is the identity reference.

PEOPLE, copy from IMAGE 2:
{People}

Same two faces, same skin tone, same hair, same facial hair, same eyewear, same relative height. Keep all mehndi and tattoos exactly where they are, at the same density, reaching the same distance up the limb. Ordinary skin texture with visible pores and natural asymmetry. Everyday looking people, not models.

{Framing}

CLOTHING:
Warm weather clothing for {Location name}: {Outfit}. Natural fit, folds and shadow. Body proportions unchanged.

LIGHT:
{Light}. Strong contact shadow at the feet. Match the photograph's grain and softness.

Keep the sky, water, terrain, vegetation and structures exactly as they are. Keep any existing figures at the frame edge. Same dimensions and aspect ratio. A photograph, not an illustration.`;

// Prompt C. A gate that passes everything is worse than no gate, because it
// manufactures confidence. This one is written to be strict, and a flattering
// version of the face is a fail rather than a pass.
export const DEFAULT_GATE_PROMPT = `IMAGE A is the original photograph of the people. IMAGE B is a generated composite that should show the same two people in a different location and different clothing.

Judge whether IMAGE B shows the same people. Clothing, background, pose and lighting are expected to differ and are not identity evidence. Ignore them when scoring identity.

Be strict. A generated face that is a flattering version of the original is a FAIL, not a pass. Common failures to watch for: face narrowed or slimmed, jawline sharpened, skin smoothed or brightened, hair volume reduced, facial hair thinned, apparent age lowered, mehndi or tattoos removed.

Return ONLY a JSON object. No preamble, no markdown fences.

{
  "identity": {
    "face_shape_match": 0,
    "face_width_match": 0,
    "skin_tone_match": 0,
    "hair_match": 0,
    "facial_hair_match": 0,
    "eyewear_match": 0,
    "relative_height_match": 0,
    "beautification_detected": false,
    "beautification_notes": ""
  },
  "scene": {
    "background_intact": true,
    "feet_grounded": true,
    "scale_plausible": true,
    "extra_people_added": false,
    "clothing_appropriate": true,
    "anatomy_errors": [],
    "scene_notes": ""
  },
  "verdict": "PASS",
  "fail_reasons": [],
  "retry_hint": ""
}

Every match field is scored 0 to 10. Verdict rules:
- FAIL if any identity score is below 6.
- FAIL if beautification_detected is true.
- FAIL if any scene boolean is false, or extra_people_added is true.
- FAIL if anatomy_errors is not empty.
- Otherwise PASS.

retry_hint is one sentence naming the single most important thing to correct on regeneration, or an empty string on a pass.`;

// Read once per location and cached, then editable by hand. Outfit, scale,
// placement and light are stable per location, so taking them out of the
// model's judgement removes four things it can get wrong on every request.
export const DEFAULT_LOCCONFIG_PROMPT = `You are writing a placement brief for a compositing pipeline. A couple will be inserted into this photograph of {Location name}. Judge only what is visible in the photograph.

Return ONLY a JSON object. No preamble, no markdown fences.

{
  "outfit_spec": "exact clothing for a real visitor here, said plainly, for both people, for example linen shirt and shorts on him, light midi dress on her, sandals, sunglasses. Include any gear the activity in the photograph demands, such as boots and a helmet for an off road ride, or a life jacket on a boat.",
  "target_height_pct": 30,
  "placement_note": "where and how they should stand, for example standing at the far railing, three quarter turned to camera",
  "placement_x_pct": 50,
  "placement_y_pct": 88,
  "light_note": "read off the shadows already in the photograph, for example high sun from the upper right, hard short shadows falling to the lower left",
  "difficulty": "easy"
}

Notes on the numbers:
- target_height_pct is the head to toe height of the couple as a percentage of frame height. Prefer 30 to 40 where the scene allows it: large enough to read a face, small enough to keep the landmark visible.
- placement_x_pct and placement_y_pct locate where their feet should land, as percentages across and down the frame.
- difficulty is easy, medium or hard. Say hard when the camera looks steeply down, when there is no natural standing spot, or when the only viable spot puts them below roughly 15 percent of frame height.`;

/* ── the composite workflows (6, 7 and 8) ── */

// Workflow 6. The picture is already made, so this pass has one job only.
export const DEFAULT_FACE_SWAP_PROMPT = `IMAGE 1 is a finished photograph. The face references that follow show the real faces of the people standing in it, in the same left to right order.

Replace the faces in IMAGE 1 with the real faces from the references. Copy the exact face shape and width, jawline, chin, cheekbones, nose, eye shape and spacing, eyebrows, lips, skin tone and texture, moles, marks, asymmetry, facial hair density and shape, and any eyewear.

Change nothing else at all. The framing, dimensions, aspect ratio, background, bodies, hair silhouette, clothing, pose, position and lighting all stay exactly as they are in IMAGE 1. Keep the head at the same size, angle and position. Match the light already falling on the head in IMAGE 1, and keep the grain and softness of IMAGE 1.

Do not beautify, smooth, brighten, de-age or slim. Ordinary skin with visible pores and natural asymmetry. Output one photograph, image only.`;

// Workflow 7, first call. A flat background is what lets the cutout be lifted
// off in the browser without a segmentation model.
export const DEFAULT_CUTOUT_PROMPT = `Cut the one or two people nearest the camera out of this photograph and place them on a plain, flat, pure white background.

Keep the people exactly as photographed: same faces, same hair, same bodies, same clothing, same jewellery, same mehndi and tattoos, same pose, same proportions, same relative heights. Do not redraw them, do not beautify them, do not change their expressions. Keep their feet visible if they are visible in the original.

Remove everything else: the setting, the background, any other people, and any object in front of them. The background must be a single flat pure white with no gradient, no shadow, no floor, no vignette and no texture.

Output one image, the people on white, image only.`;

// Workflow 7 and 8, second call. The paste is crude on purpose. This is the
// pass that has to make it look photographed.
export const DEFAULT_BLEND_PROMPT = `IMAGE 1 is a rough composite: real people have been pasted into a real photograph of {Location name}. The paste is crude, and your job is to make it look like one photograph taken in one moment.

Keep the faces exactly as they are. The faces in IMAGE 1 are the real faces of real people and must not be redrawn, moved, resized, reshaped, smoothed, brightened or de-aged. Do not touch the face, the hair or the head at all.

Fix everything around them:
- Relight the people to match the scene. {Light}. Bodies sit into the surface with a strong contact shadow at the feet.
- Replace their clothing with clothing a real visitor would wear here: {Outfit}. Natural fit, folds and shadow. Keep their body shape and proportions unchanged. Keep every watch, bracelet, ring, earring and necklace, and keep all mehndi and tattoos exactly where they are.
- Clean up the edges where they were pasted, so there is no cut out line, no halo and no white fringe.
- Match the grain, colour and softness of the background photograph, and never exceed its sharpness.

Keep the background, framing, dimensions and aspect ratio exactly as they are, and keep the people at the same size and position. Output one photograph, image only.`;

// Workflow 8, first call. Faces copy far better when they are large in frame,
// so the couple is made close up first and shrunk afterwards.
export const DEFAULT_CLOSEUP_PROMPT = `Make one photograph of the two people in IMAGE 1, shown from the knees up, filling the frame, on a plain flat pure white background.

The people must be unmistakably the same people as in IMAGE 1:
{People}

Same faces, same face width and shape, same skin tone and texture, same hair length volume and texture, same facial hair, same eyewear, same build, same height difference. Keep every watch, bracelet, ring, earring and necklace, and keep all mehndi and tattoos exactly where they are, at the same density. Ordinary skin with visible pores and natural asymmetry. Do not beautify, retouch or de-age.

Two changes only:
- Dress them for {Location name}: {Outfit}. Natural fit, folds and shadow.
- Light them plainly and neutrally, as if by soft daylight, with no coloured or stage light. {Light}

They should stand naturally, side by side, {Placement}, facing the camera three quarter on, at the scale a photographer standing a few steps away would catch them. Background is a single flat pure white, no gradient, no shadow, no floor. Output one photograph, image only.`;

/* ── placing into a scene with nobody in it ── */

// Expands to the whole placement instruction, which changes with how much freedom
// the model is being given over where the couple stands.
export const FRAMING_TOKEN = "{Framing}";

// The generation prompt above leans on the location photo's own couple as a pose,
// scale and position template. Take those people out and that instruction is
// pointing at nobody, so an emptied scene needs its own prompt: same insistence on
// the faces, no template to copy, and the choice of spot handed over.
export const DEFAULT_EMPTY_PROMPT = `IMAGE 1 is a real photograph of {Location name} with nobody in it. IMAGE 2 shows the two people to place into it.
TASK: Add the one or two people nearest the camera in IMAGE 2 into the scene in IMAGE 1, as though a photographer had caught them there.
FROM IMAGE 1 TAKE ONLY THESE THREE THINGS: the place itself, its light, and its framing. There are no people in IMAGE 1 to copy, so nothing about how anyone looks comes from it.

{Framing}

EVERYTHING ABOUT THE PEOPLE COMES FROM IMAGE 2, exactly as photographed, EXCEPT THE OUTFIT, WHICH MUST SUIT THE PLACE:

THE PEOPLE IN IMAGE 2, DESCRIBED:
{People}

* Faces: exact width and shape. Do not slim, narrow, lengthen or sharpen.
* Bodies: exact build and the height difference between them. Do not reshape.
* Hair: exact length, volume, texture and style. Curly stays curly. Tied stays tied.
* Facial hair: exact density and shape. Do not trim or tidy.
* Eyewear: the exact frames, their shape, size, thickness, colour and lens tint.
* Clothing: replace the clothing shown in IMAGE 2 with realistic clothing suitable for {Location name}, its weather, climate, culture, setting and the activity in the photograph. It must look natural on a real person visiting this place, with realistic fit, folds, shadow and interaction with the body. Do not change the person's identity, body, pose or proportions to suit the clothing.
* Accessories and body art: keep every watch, bracelet, thread, ring, earring and necklace from IMAGE 2 wherever it naturally survives the change of outfit. Keep all mehndi and tattoos exactly as they are, on the same hands, arms and feet, at the same density and reaching the same distance up the limb. Body art is part of who these people are, not decoration to be tidied away.
* Skin: keep pores, blemishes, moles and asymmetry. Do not smooth, brighten, de-age or flatter.

The people must remain unmistakably the same people as photographed in IMAGE 2. A friend of theirs must recognise them instantly. Do not beautify, retouch, stylize or improve their appearance. If either person looks better than in IMAGE 2, or younger, or more symmetrical, or more conventionally attractive, you have failed.
THE ONLY THING YOU MAY ADD IS THESE TWO PEOPLE, plus their shadows and the contact where they meet the ground. Everything else is final: sky, clouds, water, ground, buildings, ornament, sculpture, trees, hedges, lettering, and anyone already in the background, unchanged in number, position, size and clothing. Do not reframe, recrop, resize, zoom, or change the dimensions or aspect ratio. Do not resaturate, relight, regrade, sharpen or denoise the scene itself.
LIGHT: discard IMAGE 2's lighting completely. IMAGE 2 may be lit by coloured or stage light; none of that colour carries over. Read direction, height, hardness, shadow length and colour temperature from the shadows already in IMAGE 1, and make the new people obey exactly that, while keeping their true skin tone as it would look in neutral daylight. Bodies sit naturally into the surface with contact shadow beneath. Match IMAGE 1's grain and never exceed its sharpness.
If IMAGE 1 shows an activity that demands gear, such as an off road ride or a boat, put the right gear on them and let it look worn rather than placed.
Output: IMAGE 1's exact framing, dimensions and aspect ratio, 2K, image only.`;

// The three settings for how much say the model has over the standing spot. Read
// at send time, so switching between them costs nothing.
export const FRAMING_FREE =
  "WHERE THEY STAND, POSE AND SIZE ARE YOURS TO CHOOSE. Pick the spot in this "
  + "photograph a real couple would actually stand for a picture here, and put them "
  + "there: on the path rather than in the hedge, on the deck rather than in the "
  + "water, at the railing rather than over it. Face them so the camera reads both "
  + "faces. Give them a pose that suits the place and the activity, and each other: "
  + "standing together, walking, leaning, sitting, whatever the scene invites. Size "
  + "them so the perspective is honest for where they are standing, large enough that "
  + "a friend could recognise a face, and small enough that the place is still the "
  + "subject. Their feet meet the ground properly, and nothing important in the view "
  + "is hidden behind them.";

export const framingSuggested = (config) => {
  const bits = [];
  if (config?.placement) bits.push(`A good spot is ${config.placement}`);
  if (config?.heightPct) bits.push(`heads at roughly ${config.heightPct} percent of frame height`);
  const read = bits.length ? `${bits.join(", ")}.` : "";
  return "WHERE THEY STAND, POSE AND SIZE. " + read
    + " That is a reading of this photograph, not an instruction: if the scene "
    + "suggests a better spot, a better pose or a better size, use your own "
    + "judgement instead. Whatever you choose, their feet meet the ground properly, "
    + "the perspective is honest for where they stand, both faces read clearly, and "
    + "nothing important in the view is hidden behind them.";
};

export const framingPinned = (config) => {
  const where = config?.placement || "somewhere a real couple would stand for a photograph here";
  const height = config?.heightPct || 32;
  return `WHERE THEY STAND, POSE AND SIZE. Put them ${where}. Their heads reach `
    + `${height} percent of the frame's height, no more and no less. Feet flat on the `
    + `surface with a strong contact shadow. Both faces turned enough for the camera `
    + `to read them. The main view stays unblocked.`;
};
