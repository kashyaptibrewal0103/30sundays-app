// The nine ways of making the picture.
//
// Every workflow takes the same job and returns the same shape, so the page does
// not care which one ran and the results can be raced against each other. What
// differs is only how many calls it makes and what goes into each one.
//
// A job:
//   loc        the location being generated
//   plate      the same location with its people taken out, or null
//   locConfig  outfit, scale, spot and light for this location, or null
//   subject    { couple, coupleRatio, extras, people, faces, peopleText, binding,
//                descriptorPeople, descriptorText }
//   cfg        a frozen snapshot of the settings, including cfg.prompts
//   signal     the batch's abort signal
//   progress   a patch callback, merged into the run on screen

import {
  generateImage, urlToInline, nearestRatio, inlineBytes,
  describePeople, scoreLikeness, scoreStrict, inlineToDataUrl,
} from "./gemini";
import { removeFlatBackground, pasteOnto } from "./composite";
import {
  LOCATION_TOKEN, PEOPLE_TOKEN, OUTFIT_TOKEN, HEIGHT_TOKEN,
  PLACEMENT_TOKEN, LIGHT_TOKEN, FRAMING_TOKEN, passOneNote, passTwoNote,
  FRAMING_FREE, framingSuggested, framingPinned,
} from "../data/labPrompts";

/* ── the blocks every prompt is built from ── */

// How much say the model has over the standing spot, the pose and the size. Free
// is the default: a scene with nobody in it has no template to copy, and a couple
// pinned to a number tends to look pasted rather than photographed.
export function framingBlock(mode, config) {
  if (mode === "pinned") return framingPinned(config);
  if (mode === "suggested" && (config?.placement || config?.heightPct)) return framingSuggested(config);
  return FRAMING_FREE;
}

export function fillTokens(prompt, loc, people = "", config = null, framing = "") {
  let filled = prompt
    .split(LOCATION_TOKEN).join(loc.name)
    .split("{Country}").join(loc.country || "")
    .split("{Location}").join(loc.name);
  if (framing) filled = filled.split(FRAMING_TOKEN).join(framing);
  if (config) {
    filled = filled
      .split(OUTFIT_TOKEN).join(config.outfit || "clothing a real visitor here would wear")
      .split(HEIGHT_TOKEN).join(String(config.heightPct ?? 32))
      .split(PLACEMENT_TOKEN).join(config.placement || "standing naturally in the scene")
      .split(LIGHT_TOKEN).join(config.light || "match the light already in the photograph");
  }
  // With no subject read to drop in, the heading above the token would sit over
  // nothing, so the whole block goes rather than leaving an empty promise.
  if (people) return filled.split(PEOPLE_TOKEN).join(people);
  return filled
    .split(`THE PEOPLE IN IMAGE 2, DESCRIBED:\n${PEOPLE_TOKEN}\n\n`).join("")
    .split(PEOPLE_TOKEN).join("");
}

// Appended rather than written into the prompt, so the prompt in the panel stays
// exactly what was typed.
export const FACE_REF_NOTE =
  "The images after IMAGE 2 are close crops of the faces of the same people, in " +
  "the same left to right order. Read the exact facial structure, proportions and " +
  "asymmetry from them. They are reference only: take nothing else from them, not " +
  "their framing, crop, scale or lighting.";

export const correctionsBlock = (fixes) =>
  "CORRECTIONS. Your previous attempt was rejected because the people did not " +
  "look like the people in IMAGE 2. Fix every one of these, and change nothing " +
  "else:\n" + fixes.map((f) => `- ${f}`).join("\n");

// Image models will happily answer a task phrased as a comparison with a
// comparison sheet, and this closes that door.
export const ONE_FRAME_GUARD =
  "Return exactly one single photograph. Not a diptych, not a split screen, " +
  "not a before and after, not a grid, not two panels side by side, and no " +
  "labels or captions of any kind.";

/* ── shared steps ── */

async function loadScene(job, { preferPlate = false } = {}) {
  const { loc, cfg, plate } = job;
  const sceneUrl = (preferPlate && plate) || loc.image;
  const { inline, width, height } = await urlToInline(sceneUrl, cfg.sendEdge);
  return {
    inline, width, height,
    ratio: cfg.aspect === "Match" ? nearestRatio(width, height) : cfg.aspect,
    usedPlate: sceneUrl !== loc.image,
  };
}

function assemblePrompt(job, {
  basePrompt, described = "", faces = [], passNote = "", fixes = [],
  config = null, extraBlocks = [], framing = "",
}) {
  const prompt = basePrompt ?? job.cfg.prompts.image;
  const pieces = [fillTokens(prompt, job.loc, described, config, framing)];
  if (framing && !prompt.includes(FRAMING_TOKEN)) pieces.push(framing);
  // An edited prompt may have lost the {People} token. The description still
  // goes, as its own block, rather than being quietly thrown away.
  if (described && !prompt.includes(PEOPLE_TOKEN)) {
    pieces.push(`THE PEOPLE IN IMAGE 2, DESCRIBED:\n${described}`);
  }
  if (faces.length) pieces.push(FACE_REF_NOTE);
  if (passNote) pieces.push(passNote);
  else if (job.subject.binding) pieces.push(job.subject.binding);
  pieces.push(...extraBlocks.filter(Boolean));
  if (job.cfg.oneFrame) pieces.push(ONE_FRAME_GUARD);
  if (fixes?.length) pieces.push(correctionsBlock(fixes));
  return pieces.join("\n\n");
}

function generateOnce(job, {
  sceneInline, couple = null, extras = [], faces = [], prompt, ratio, temperature,
}) {
  const { cfg } = job;
  return generateImage({
    key: cfg.apiKey, model: cfg.imageModel,
    temperature: temperature ?? cfg.imageTemp,
    prompt, scene: sceneInline, couple, extras, faces,
    subjectFirst: cfg.subjectFirst, labelImages: cfg.labelImages,
    imageSize: cfg.imageSize, aspectRatio: ratio, modalities: ["IMAGE"],
    signal: cfg.signal ?? job.signal,
  });
}

// Generate, have the likeness judged, and go again carrying the judge's
// corrections until the score is good enough or the attempts run out. The best
// scoring attempt is what comes back, not the last one.
async function judgeLoop(job, attemptFn) {
  const { cfg } = job;
  const rounds = cfg.agentOn ? Math.max(1, Number(cfg.agentRounds)) : 1;
  let best = null;
  let fixes = [];
  const history = [];

  for (let round = 1; round <= rounds; round++) {
    const attempt = { ...(await attemptFn({ round, rounds, fixes })), round };
    if (!cfg.agentOn) return { ...attempt, rounds: 1, history: [] };

    job.progress?.({ status: "running", round, rounds, phase: "judging" });
    const judged = await scoreLikeness({
      key: cfg.apiKey, model: cfg.checkModel, prompt: cfg.prompts.likeness,
      reference: job.subject.couple, candidate: attempt.inline, signal: job.signal,
    });

    attempt.score = judged.score;
    attempt.samePeople = judged.samePeople;
    attempt.fixes = judged.fixes;
    attempt.judgeRaw = judged.raw;
    history.push({ round, score: judged.score, fixes: judged.fixes });

    if (!best || (attempt.score ?? -1) > (best.score ?? -1)) best = attempt;
    job.progress?.({ status: "running", round, rounds, phase: "judged", score: judged.score });

    if (judged.score === null || judged.score >= Number(cfg.agentTarget)) break;
    fixes = judged.fixes;
  }

  return { ...best, rounds, history };
}

// The strict version: a pass or a fail rather than a score, one correction per
// retry, and a visible failure at the end rather than a quiet best effort.
async function strictGateLoop(job, attemptFn) {
  const { cfg } = job;
  const rounds = cfg.agentOn ? Math.min(3, Math.max(1, Number(cfg.agentRounds))) : 1;
  let best = null;
  let fixes = [];
  const history = [];

  for (let round = 1; round <= rounds; round++) {
    // The API has no seed, so a nudge in temperature is what "try again
    // differently" has to mean here.
    const temperature = round === 1
      ? cfg.imageTemp
      : Math.min(1, Number(cfg.imageTemp) + 0.25);

    const attempt = {
      ...(await attemptFn({ round, rounds, fixes, temperature })),
      round, looser: round > 1,
    };

    job.progress?.({ status: "running", round, rounds, phase: "judging", label: "Running the strict check" });
    const gate = await scoreStrict({
      key: cfg.apiKey, model: cfg.checkModel, prompt: cfg.prompts.gate,
      reference: job.subject.couple, candidate: attempt.inline, signal: job.signal,
    });

    attempt.score = gate.score;
    attempt.samePeople = gate.pass;
    attempt.fixes = gate.reasons.slice(0, 3);
    attempt.judgeRaw = gate.raw;
    attempt.gate = { verdict: gate.verdict, hint: gate.hint, identity: gate.identity, scene: gate.scene };
    history.push({ round, score: gate.score, verdict: gate.verdict, fixes: gate.reasons });

    if (!best || (attempt.score ?? -1) > (best.score ?? -1)) best = attempt;
    job.progress?.({ status: "running", round, rounds, phase: "judged", score: gate.score });

    if (gate.pass) return { ...attempt, rounds: round, history, gatePassed: true };
    fixes = gate.fixes;
  }

  return { ...best, rounds, history, gatePassed: false, gateFailed: true };
}

/* ── placing the couple straight into the scene: workflows 1 to 4 ── */

async function runPlacement(job, { preferPlate = false, allowTwoPass = false, multiRef = false } = {}) {
  const scene = await loadScene(job, { preferPlate });
  const s = job.subject;
  const extras = multiRef ? s.extras : [];

  // A scene with nobody in it has no pose, scale or spot to copy, so it gets its
  // own prompt and the choice is handed to the model.
  const hasTemplate = !scene.usedPlate && !job.cfg.scenesAreEmpty;
  const basePrompt = hasTemplate ? job.cfg.prompts.image : job.cfg.prompts.empty;
  const framing = hasTemplate ? "" : framingBlock(job.cfg.framing, job.locConfig);

  // Two people at once is where the likeness breaks: the model has four faces in
  // front of it and averages them. One person per call leaves nothing to blend.
  const twoPass = allowTwoPass && s.people.length === 2 && s.faces.length === 2;
  const meta0 = { hasTemplate, framingMode: hasTemplate ? "template" : job.cfg.framing };

  const meta = {
    ...meta0,
    sentBytes: inlineBytes(scene.inline, s.couple, ...extras, ...s.faces),
    ratio: scene.ratio,
    sceneSize: `${scene.width}x${scene.height}`,
    usedPlate: scene.usedPlate,
    twoPass,
  };

  return judgeLoop(job, async ({ round, rounds, fixes }) => {
    job.progress?.({ status: "running", round, rounds, phase: "generating", pass: twoPass ? 1 : null });

    if (!twoPass) {
      const prompt = assemblePrompt(job, {
        basePrompt, framing, config: job.locConfig,
        described: s.peopleText, faces: s.faces, fixes,
      });
      const res = await generateOnce(job, {
        sceneInline: scene.inline, couple: s.couple, extras, faces: s.faces,
        prompt, ratio: scene.ratio,
      });
      return { ...res, promptSent: prompt, ...meta };
    }

    const [first, second] = s.people;
    const firstSide = first.label || "left";
    const secondSide = second.label || "right";

    const promptOne = assemblePrompt(job, {
      basePrompt, framing, config: job.locConfig,
      described: describePeople([first]), faces: [s.faces[0]],
      passNote: passOneNote(firstSide, firstSide), fixes,
    });
    const one = await generateOnce(job, {
      sceneInline: scene.inline, couple: s.couple, extras, faces: [s.faces[0]],
      prompt: promptOne, ratio: scene.ratio,
    });

    job.progress?.({ status: "running", round, rounds, phase: "generating", pass: 2 });
    const promptTwo = assemblePrompt(job, {
      basePrompt, framing, config: job.locConfig,
      described: describePeople([second]), faces: [s.faces[1]],
      passNote: passTwoNote(firstSide, secondSide, secondSide), fixes,
    });
    const res = await generateOnce(job, {
      sceneInline: one.inline, couple: s.couple, extras, faces: [s.faces[1]],
      prompt: promptTwo, ratio: scene.ratio,
    });

    res.passOne = one.dataUrl;
    return { ...res, promptSent: `${promptOne}\n\n=== PASS 2 ===\n\n${promptTwo}`, ...meta };
  });
}

/* ── workflow 5 and 9: describe first, then a strict gate ── */

async function runDescribeFirst(job, { multiRef = false } = {}) {
  const scene = await loadScene(job, { preferPlate: true });
  const s = job.subject;
  const extras = multiRef ? s.extras : [];
  const described = s.descriptorText || s.peopleText;

  const meta = {
    sentBytes: inlineBytes(scene.inline, s.couple, ...extras, ...s.faces),
    ratio: scene.ratio,
    sceneSize: `${scene.width}x${scene.height}`,
    usedPlate: scene.usedPlate,
    twoPass: false,
    framingMode: job.cfg.framing,
  };

  return strictGateLoop(job, async ({ round, rounds, fixes, temperature }) => {
    job.progress?.({
      status: "running", round, rounds, phase: "generating",
      label: round === 1 ? "Composing the picture" : "Trying again with one correction",
    });
    const prompt = assemblePrompt(job, {
      basePrompt: job.cfg.prompts.composite,
      framing: framingBlock(job.cfg.framing, job.locConfig),
      described, faces: s.faces, fixes, config: job.locConfig,
    });
    const res = await generateOnce(job, {
      sceneInline: scene.inline, couple: s.couple, extras, faces: s.faces,
      prompt, ratio: scene.ratio, temperature,
    });
    return { ...res, promptSent: prompt, ...meta };
  });
}

/* ── workflow 6: make the picture, then put the real faces back ── */

async function runFaceFix(job) {
  const base = await runPlacement(job, { preferPlate: true, allowTwoPass: false });
  const s = job.subject;
  if (!s.faces.length || !base?.inline) return base;

  job.progress?.({ status: "running", phase: "swapping", label: "Swapping the real faces in" });
  const prompt = [
    job.cfg.prompts.faceSwap,
    job.cfg.oneFrame ? ONE_FRAME_GUARD : "",
  ].filter(Boolean).join("\n\n");

  const swapped = await generateOnce(job, {
    sceneInline: base.inline, faces: s.faces, prompt, ratio: base.ratio,
  });

  const out = {
    ...base, ...swapped,
    promptSent: `${base.promptSent}\n\n=== FACE PASS ===\n\n${prompt}`,
    passOne: base.dataUrl,
    passOneLabel: "before the faces were swapped",
    swapped: true,
    ms: (base.ms || 0) + (swapped.ms || 0),
  };

  if (!job.cfg.agentOn) return out;

  job.progress?.({ status: "running", phase: "judging", label: "Judging the swapped faces" });
  const judged = await scoreLikeness({
    key: job.cfg.apiKey, model: job.cfg.checkModel, prompt: job.cfg.prompts.likeness,
    reference: s.couple, candidate: swapped.inline, signal: job.signal,
  });

  out.score = judged.score;
  out.samePeople = judged.samePeople;
  out.fixes = judged.fixes;
  out.judgeRaw = judged.raw;
  out.history = [...(base.history || []), { round: "face pass", score: judged.score, fixes: judged.fixes }];

  // If the swap made it worse, the picture before the swap is the one to keep.
  if ((base.score ?? -1) > (judged.score ?? -1)) {
    return {
      ...base,
      history: out.history,
      swapped: false,
      passOne: swapped.dataUrl,
      passOneLabel: "the face swap, which scored lower and was dropped",
      ms: out.ms,
    };
  }
  return out;
}

/* ── workflows 7 and 8: paste the real people in, then only blend ── */

async function pasteAndBlend(job, { scene, cutInline, passLabel, spentMs = 0, prefix = "" }) {
  const flat = await removeFlatBackground(cutInline);
  const place = job.locConfig || {};
  const pasted = await pasteOnto(scene.inline, flat.inline, {
    xPct: place.xPct ?? 50,
    yPct: place.yPct ?? 88,
    heightPct: place.heightPct ?? 32,
    featherPx: 2,
  });
  const roughUrl = inlineToDataUrl(pasted.inline);

  const meta = {
    sentBytes: inlineBytes(pasted.inline),
    ratio: scene.ratio,
    sceneSize: `${scene.width}x${scene.height}`,
    usedPlate: scene.usedPlate,
    twoPass: false,
    passOne: roughUrl,
    passOneLabel: passLabel,
  };

  const out = await judgeLoop(job, async ({ round, rounds, fixes }) => {
    job.progress?.({
      status: "running", round, rounds, phase: "generating",
      label: round === 1 ? "Blending them into the scene" : "Blending again with corrections",
    });
    const prompt = assemblePrompt(job, {
      basePrompt: job.cfg.prompts.blend, fixes, config: job.locConfig,
    });
    const res = await generateOnce(job, {
      sceneInline: pasted.inline, prompt, ratio: scene.ratio,
    });
    return { ...res, promptSent: `${prefix}${prompt}`, ...meta };
  });

  return { ...out, ms: (out.ms || 0) + spentMs };
}

async function runCutBlend(job) {
  const scene = await loadScene(job, { preferPlate: true });
  const s = job.subject;

  job.progress?.({ status: "running", phase: "cutting", label: "Cutting the two of you out" });
  const cutPrompt = [
    job.cfg.prompts.cutout,
    job.cfg.oneFrame ? ONE_FRAME_GUARD : "",
  ].filter(Boolean).join("\n\n");
  const cut = await generateOnce(job, {
    sceneInline: s.couple, prompt: cutPrompt, ratio: s.coupleRatio,
  });

  job.progress?.({ status: "running", phase: "pasting", label: "Placing you in the scene" });
  return pasteAndBlend(job, {
    scene, cutInline: cut.inline, spentMs: cut.ms,
    passLabel: "the rough paste, before any blending",
    prefix: `=== CUTOUT PASS ===\n\n${cutPrompt}\n\n=== BLEND PASS ===\n\n`,
  });
}

async function runCloseupPlace(job) {
  const scene = await loadScene(job, { preferPlate: true });
  const s = job.subject;

  job.progress?.({ status: "running", phase: "closeup", label: "Making a close up of the two of you" });
  const closeupPrompt = assemblePrompt(job, {
    basePrompt: job.cfg.prompts.closeup,
    described: s.descriptorText || s.peopleText,
    faces: s.faces, config: job.locConfig,
  });
  // Portrait and large, because face detail is the whole point of the detour.
  const shot = await generateOnce(job, {
    sceneInline: s.couple, extras: s.extras, faces: s.faces,
    prompt: closeupPrompt, ratio: "3:4",
  });

  job.progress?.({ status: "running", phase: "pasting", label: "Shrinking and placing the close up" });
  return pasteAndBlend(job, {
    scene, cutInline: shot.inline, spentMs: shot.ms,
    passLabel: "the close up, pasted in before blending",
    prefix: `=== CLOSE UP PASS ===\n\n${closeupPrompt}\n\n=== BLEND PASS ===\n\n`,
  });
}

/* ── the registry ── */

const perRound = (cfg, gens) => (cfg.agentOn ? Math.max(1, Number(cfg.agentRounds)) : 1) * (gens + (cfg.agentOn ? 1 : 0));

export const WORKFLOWS = [
  {
    id: "one-shot",
    name: "One shot",
    blurb: "The location photo as it is, plus your photo and face crops. One call.",
    detail: "Simplest of the lot, and the one most likely to blend the four faces in front of it.",
    needs: {},
    prompts: ["image", "likeness"],
    estCalls: (cfg) => perRound(cfg, 1),
    run: (job) => runPlacement(job, { preferPlate: false, allowTwoPass: false }),
  },
  {
    id: "one-at-a-time",
    name: "One person at a time",
    blurb: "Places one of you, then the other into that result. Two calls per attempt.",
    detail: "Each call carries one face, so there is nothing left to average with.",
    needs: {},
    prompts: ["image", "likeness"],
    estCalls: (cfg) => perRound(cfg, 2),
    run: (job) => runPlacement(job, { preferPlate: false, allowTwoPass: true }),
  },
  {
    id: "empty-scene",
    name: "Empty scene first",
    blurb: "The location with its own people removed, then both of you placed in.",
    detail: "No competing faces in the scene at all, so your photo is the only face source.",
    needs: { plate: true },
    prompts: ["image", "likeness"],
    estCalls: (cfg) => perRound(cfg, 1),
    run: (job) => runPlacement(job, { preferPlate: true, allowTwoPass: false }),
  },
  {
    id: "empty-scene-refs",
    name: "Empty scene, more photos",
    blurb: "Same as above, with two to four photos of you attached instead of one.",
    detail: "More angles means less for the model to invent. Needs at least two uploads.",
    needs: { plate: true, multiRef: true },
    prompts: ["image", "likeness"],
    estCalls: (cfg) => perRound(cfg, 1),
    run: (job) => runPlacement(job, { preferPlate: true, allowTwoPass: false, multiRef: true }),
  },
  {
    id: "describe-first",
    name: "Describe first, strict judge",
    blurb: "Reads you into words, reads the scene for outfit and spot, then judges pass or fail.",
    detail: "Retries up to three times with one correction at a time, and shows an honest fail.",
    needs: { plate: true, descriptor: true, locConfig: true },
    prompts: ["descriptor", "composite", "gate", "locConfig"],
    estCalls: (cfg) => Math.min(3, Math.max(1, cfg.agentOn ? Number(cfg.agentRounds) : 1)) * 2,
    run: (job) => runDescribeFirst(job),
  },
  {
    id: "face-fix",
    name: "Fix the faces after",
    blurb: "Makes the picture, then a second call replaces only the two faces.",
    detail: "Splits the job: one call composes, one call handles the likeness.",
    needs: { plate: true },
    prompts: ["image", "faceSwap", "likeness"],
    estCalls: (cfg) => perRound(cfg, 1) + (cfg.agentOn ? 2 : 1),
    run: (job) => runFaceFix(job),
  },
  {
    id: "cut-blend",
    name: "Cut out and blend",
    blurb: "Cuts you out of your photo, pastes you into the empty scene, then only relights.",
    detail: "Your faces are never regenerated, so the likeness is exact by construction.",
    needs: { plate: true, locConfig: true },
    prompts: ["cutout", "blend", "likeness"],
    estCalls: (cfg) => 1 + perRound(cfg, 1),
    run: (job) => runCutBlend(job),
  },
  {
    id: "closeup-place",
    name: "Close up, then place",
    blurb: "Makes a big close up of you in holiday clothes, shrinks it into the scene, then blends.",
    detail: "Big faces copy better than small ones, and shrinking hides what is left. Uses your extra photos if you added any.",
    needs: { plate: true, locConfig: true },
    prompts: ["closeup", "blend", "likeness"],
    estCalls: (cfg) => 1 + perRound(cfg, 1),
    run: (job) => runCloseupPlace(job),
  },
  {
    id: "everything",
    name: "Everything on",
    blurb: "Empty scene, all your photos, the written description and the strict judge together.",
    detail: "The most expensive run, and the one to beat.",
    needs: { plate: true, multiRef: true, descriptor: true, locConfig: true },
    prompts: ["descriptor", "composite", "gate", "locConfig"],
    estCalls: (cfg) => Math.min(3, Math.max(1, cfg.agentOn ? Number(cfg.agentRounds) : 1)) * 2,
    run: (job) => runDescribeFirst(job, { multiRef: true }),
  },
];

export const DEFAULT_WORKFLOW = "one-at-a-time";

export const getWorkflow = (id) =>
  WORKFLOWS.find((w) => w.id === id) || WORKFLOWS.find((w) => w.id === DEFAULT_WORKFLOW);

export const estimateCalls = (id, cfg) => {
  const wf = getWorkflow(id);
  try { return wf.estCalls(cfg); } catch { return null; }
};

// Why a workflow cannot run yet, in the couple's own terms, or null.
export function blockedBecause(wf, { extraCount = 0 } = {}) {
  if (wf.needs.multiRef && extraCount < 1) {
    return "Add at least one more photo of the two of you to use this one.";
  }
  return null;
}
