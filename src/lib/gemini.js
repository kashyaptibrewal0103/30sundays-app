// A thin browser client for the Gemini API, used only by the lab.
//
// In dev the calls go through a Vite proxy at /gemini-api so the browser never
// has to care about CORS. Anywhere else they go straight to Google. The key is
// held in the page (and in localStorage, for convenience while testing) and is
// never sent anywhere except Google.

const DIRECT = "https://generativelanguage.googleapis.com/v1beta";
const PROXY = "/gemini-api/v1beta";

export const apiBase = () => (import.meta.env.DEV ? PROXY : DIRECT);

/* ── helpers ── */

// Reads a File or Blob as { mimeType, data } with data as bare base64.
export function blobToInline(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Could not read the file"));
    r.onload = () => {
      const url = String(r.result);
      const comma = url.indexOf(",");
      resolve({
        mimeType: blob.type || url.slice(5, url.indexOf(";")),
        data: url.slice(comma + 1),
      });
    };
    r.readAsDataURL(blob);
  });
}

export const inlineToDataUrl = (inline) => `data:${inline.mimeType};base64,${inline.data}`;

// Shrinks an image to maxEdge on its long side and returns
// { inline: { mimeType, data }, width, height }. The inline part is kept clean
// of anything else, because the API rejects unknown fields inside inlineData.
// Phone photos are 8-12MP, which makes requests slow for no gain.
export function blobToInlineResized(file, maxEdge = 2048, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file is not an image we can read")); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      if (scale === 1 && file.size < 3_000_000) {
        blobToInline(file).then((inline) =>
          resolve({ inline, width: img.width, height: img.height })
        ).catch(reject);
        return;
      }
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Could not resize that image")); return; }
        blobToInline(blob).then((inline) => resolve({ inline, width: w, height: h })).catch(reject);
      }, "image/jpeg", quality);
    };
    img.src = url;
  });
}

export const fileToInlineResized = blobToInlineResized;

// Loads one of the bundled location photos, at the size being sent, along with
// its shape. Cached per size, because a batch reruns the same few scenes a lot.
const sceneCache = new Map();
export async function urlToInline(url, maxEdge = 2048) {
  const key = `${url}@${maxEdge}`;
  if (sceneCache.has(key)) return sceneCache.get(key);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  const loaded = await blobToInlineResized(await res.blob(), maxEdge, 0.9);
  sceneCache.set(key, loaded);
  return loaded;
}

// The output shapes the image models accept. Asking for anything else is the
// same as asking for nothing, which leaves the model to pick the canvas itself.
const RATIOS = [
  ["21:9", 21 / 9], ["16:9", 16 / 9], ["3:2", 1.5], ["4:3", 4 / 3],
  ["5:4", 1.25], ["1:1", 1], ["4:5", 0.8], ["3:4", 0.75],
  ["2:3", 2 / 3], ["9:16", 9 / 16],
];

// The accepted shape closest to a picture's own. A portrait scene left on Auto
// can come back on a wide canvas, and a wide canvas invites the model to fill
// the spare width with a second panel, so the scene's shape is always named.
export function nearestRatio(width, height) {
  const target = width / height;
  const dist = ([, value]) => Math.abs(Math.log(value / target));
  return RATIOS.reduce((best, r) => (dist(r) < dist(best) ? r : best))[0];
}

// Roughly how many bytes of base64 a request will carry. Shown in the lab so
// the cost of a big send is visible rather than felt as slowness.
export const inlineBytes = (...inlines) =>
  inlines.filter(Boolean).reduce((n, i) => n + Math.round(i.data.length * 0.75), 0);

/* ── the calls ── */

async function post(path, key, body, signal) {
  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* keep the raw text */ }
  if (!res.ok) {
    const message = json?.error?.message || text || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.body = json ?? text;
    throw err;
  }
  return json;
}

// The model list the key can actually see. Saves guessing at ids.
export async function listModels(key) {
  const res = await fetch(`${apiBase()}/models?pageSize=200`, {
    headers: { "x-goog-api-key": key },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message || `Could not list models (${res.status})`);
  return (json?.models || []).map((m) => ({
    id: String(m.name || "").replace(/^models\//, ""),
    label: m.displayName || "",
    methods: m.supportedGenerationMethods || [],
  }));
}

const firstText = (json) =>
  json?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n") || "";

const firstImage = (json) => {
  for (const part of json?.candidates?.[0]?.content?.parts || []) {
    const d = part.inlineData || part.inline_data;
    if (d?.data) return { mimeType: d.mimeType || d.mime_type || "image/png", data: d.data };
  }
  return null;
};

// Pulls {"accept": ...} out of the model's reply, fenced or not.
export function parseVerdict(text) {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return typeof parsed.accept === "boolean" ? parsed : null;
  } catch { return null; }
}

// Runs the check prompt over the uploaded photo.
export async function checkPhoto({ key, model, temperature, prompt, image, signal }) {
  const started = performance.now();
  const json = await post(`/models/${model}:generateContent`, key, {
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: image }] }],
    generationConfig: { temperature: Number(temperature), responseMimeType: "application/json" },
  }, signal);
  const text = firstText(json);
  return {
    verdict: parseVerdict(text),
    text,
    raw: json,
    ms: Math.round(performance.now() - started),
  };
}

// Builds one generation request. IMAGE 1 is the location, IMAGE 2 the couple.
function generationBody({ prompt, scene, couple, extras = [], faces = [], subjectFirst, temperature, labelImages, imageSize, aspectRatio, modalities }) {
  const parts = [{ text: prompt }];
  const sceneParts = [];
  const coupleParts = [];
  if (labelImages) sceneParts.push({ text: "IMAGE 1:" });
  sceneParts.push({ inlineData: scene });
  if (couple) {
    if (labelImages) coupleParts.push({ text: "IMAGE 2:" });
    coupleParts.push({ inlineData: couple });
  }
  // More angles of the same couple. One photograph is thin evidence for a face,
  // and every extra one narrows what the model is free to invent.
  extras.forEach((extra, i) => {
    coupleParts.push({
      text: `ANOTHER PHOTOGRAPH OF THE SAME TWO PEOPLE (${i + 2} of ${extras.length + 1}), `
        + `for identity only: take nothing from its setting, clothing, framing or lighting.`,
    });
    coupleParts.push({ inlineData: extra });
  });
  faces.forEach((face, i) => {
    coupleParts.push({ text: `FACE REFERENCE ${i + 1}, for facial structure only:` });
    coupleParts.push({ inlineData: face });
  });
  // Whichever picture goes first tends to dominate the result. Scene first keeps
  // the place faithful; people first holds the faces better. Worth testing both.
  parts.push(...(subjectFirst ? [...coupleParts, ...sceneParts] : [...sceneParts, ...coupleParts]));

  const generationConfig = { temperature: Number(temperature) };
  if (modalities?.length) generationConfig.responseModalities = modalities;
  const imageConfig = {};
  if (imageSize && imageSize !== "Auto") imageConfig.imageSize = imageSize;
  if (aspectRatio && aspectRatio !== "Auto") imageConfig.aspectRatio = aspectRatio;
  if (Object.keys(imageConfig).length) generationConfig.imageConfig = imageConfig;

  return { contents: [{ role: "user", parts }], generationConfig };
}

// Model support for responseModalities and imageConfig varies by id, and the
// only honest way to find out is to be told. So each rejected field is dropped
// and the call retried, rather than failing the whole batch.
const RETRY_LADDER = [
  {},
  { modalities: ["TEXT", "IMAGE"] },
  { modalities: null },
  { modalities: null, imageSize: "Auto", aspectRatio: "Auto" },
];

const isFieldComplaint = (err) =>
  err.status === 400 && /modalit|imageConfig|image_config|imageSize|aspectRatio|Unknown name/i.test(err.message || "");

export async function generateImage(opts) {
  const { key, model, signal } = opts;
  const started = performance.now();
  let lastErr = null;

  for (const override of RETRY_LADDER) {
    const settings = { ...opts, ...override };
    try {
      const json = await post(`/models/${model}:generateContent`, key, generationBody(settings), signal);
      const image = firstImage(json);
      if (!image) {
        const reason = json?.candidates?.[0]?.finishReason;
        const blocked = json?.promptFeedback?.blockReason;
        throw new Error(
          blocked ? `Blocked: ${blocked}`
            : reason && reason !== "STOP" ? `No image came back (${reason})`
            : firstText(json) ? `No image came back. Model said: ${firstText(json).slice(0, 300)}`
            : "No image came back"
        );
      }
      return {
        inline: image,
        dataUrl: inlineToDataUrl(image),
        mimeType: image.mimeType,
        text: firstText(json),
        finishReason: json?.candidates?.[0]?.finishReason,
        usage: json?.usageMetadata,
        droppedFields: Object.keys(override),
        ms: Math.round(performance.now() - started),
      };
    } catch (err) {
      lastErr = err;
      if (err.name === "AbortError") throw err;
      if (!isFieldComplaint(err)) throw err;
    }
  }
  throw lastErr;
}


/* ── the likeness agent ── */

// Crops a region out of an inline image. Boxes arrive normalised 0 to 1000 in
// the order ymin, xmin, ymax, xmax, which is what the vision models return.
// Padded outwards, because a face judged in isolation from its head and neck
// reads worse than it should.
export function cropInline(inline, box, pad = 0.45) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("Could not read the image to crop"));
    img.onload = () => {
      const [ymin, xmin, ymax, xmax] = box;
      const bw = ((xmax - xmin) / 1000) * img.width;
      const bh = ((ymax - ymin) / 1000) * img.height;
      const px = bw * pad;
      const py = bh * pad;
      const x = Math.max(0, (xmin / 1000) * img.width - px);
      const y = Math.max(0, (ymin / 1000) * img.height - py);
      const w = Math.min(img.width - x, bw + px * 2);
      const h = Math.min(img.height - y, bh + py * 2);
      if (w < 24 || h < 24) { reject(new Error("That face box is too small to use")); return; }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      canvas.getContext("2d").drawImage(img, x, y, w, h, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Could not crop that face")); return; }
        blobToInline(blob).then(resolve).catch(reject);
      }, "image/jpeg", 0.95);
    };
    img.src = inlineToDataUrl(inline);
  });
}

const firstJson = (text) => {
  const cleaned = String(text || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { return null; }
};

const isBox = (b) =>
  Array.isArray(b) && b.length === 4 && b.every((n) => Number.isFinite(n)) && b[2] > b[0] && b[3] > b[1];

// Reads the two people off the uploaded photo: a written description of each,
// and where their heads are, so tight face crops can go with every request.
export async function readSubjects({ key, model, prompt, image, signal }) {
  const started = performance.now();
  const json = await post(`/models/${model}:generateContent`, key, {
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: image }] }],
    generationConfig: { temperature: 0, responseMimeType: "application/json" },
  }, signal);
  const text = firstText(json);
  const parsed = firstJson(text);
  const people = Array.isArray(parsed?.people) ? parsed.people.slice(0, 2) : [];

  const faces = [];
  for (const person of people) {
    if (!isBox(person.face_box)) continue;
    try { faces.push(await cropInline(image, person.face_box)); } catch { /* skip a bad box */ }
  }

  return { people, faces, text, raw: json, ms: Math.round(performance.now() - started) };
}

// Turns the descriptions into the block that replaces {People} in the prompt.
export function describePeople(people) {
  if (!people?.length) return "";
  return people.map((p, i) => {
    const side = p.label ? `The person on the ${p.label}` : `Person ${i + 1}`;
    const art = p.body_art && p.body_art.toLowerCase() !== "none"
      ? ` Body art: ${p.body_art}`
      : "";
    return `${side}: ${p.description || ""}${art}`.trim();
  }).join("\n\n");
}

// Scores a generated picture against the original photo, and says what to fix.
export async function scoreLikeness({ key, model, prompt, reference, candidate, signal }) {
  const started = performance.now();
  const json = await post(`/models/${model}:generateContent`, key, {
    contents: [{ role: "user", parts: [
      { text: prompt },
      { text: "IMAGE A, the reference photograph:" },
      { inlineData: reference },
      { text: "IMAGE B, the generated picture:" },
      { inlineData: candidate },
    ] }],
    generationConfig: { temperature: 0, responseMimeType: "application/json" },
  }, signal);
  const text = firstText(json);
  const parsed = firstJson(text);
  return {
    score: Number.isFinite(parsed?.score) ? Math.round(parsed.score) : null,
    samePeople: parsed?.same_people ?? null,
    fixes: Array.isArray(parsed?.fixes) ? parsed.fixes.filter(Boolean).slice(0, 8) : [],
    text,
    raw: json,
    ms: Math.round(performance.now() - started),
  };
}


// Strips the people out of a location photo, so the scene carries no faces for
// the model to borrow from. One call per location, reusable for every couple.
export const PLATE_PROMPT =
  "Remove every person from this photograph. Rebuild whatever they were standing " +
  "in front of or covering: the ground, the water, the railings, the furniture, " +
  "the planting, the background. Keep absolutely everything else identical: the " +
  "framing, the dimensions, the aspect ratio, the colour, the light, the existing " +
  "shadows and the grain. Add nobody. Add nothing that was not already there. " +
  "Output the same photograph with no people in it, image only.";

export async function makePlate({ key, model, scene, aspectRatio, imageSize, signal }) {
  return generateImage({
    key, model, temperature: 0.2, prompt: PLATE_PROMPT,
    scene, couple: null, aspectRatio, imageSize, modalities: ["IMAGE"], signal,
  });
}


/* ── the descriptor pipeline ── */

// Prompt A. A richer read than readSubjects: attributes a strict gate can be
// held to, and a flag for whether the photo is usable at all. Cached per photo,
// because it says nothing about the location and never needs running twice.
export async function readDescriptor({ key, model, prompt, image, signal }) {
  const started = performance.now();
  const json = await post(`/models/${model}:generateContent`, key, {
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: image }] }],
    generationConfig: { temperature: 0, responseMimeType: "application/json" },
  }, signal);
  const text = firstText(json);
  const parsed = firstJson(text) || {};
  const people = Array.isArray(parsed.people) ? parsed.people.slice(0, 2) : [];
  return {
    people,
    quality: parsed.image_quality || null,
    blocking: Array.isArray(parsed.blocking_issues) ? parsed.blocking_issues.filter(Boolean) : [],
    unusable: people.filter((p) => p.usable_for_transfer === false).length,
    text,
    raw: json,
    ms: Math.round(performance.now() - started),
  };
}

// Turns Prompt A's output into the block that replaces {People}. Build is only
// asserted when the photo actually showed one, because a build the model cannot
// see is a build it will invent.
export function describeDescriptor(people) {
  if (!people?.length) return "";
  return people.map((p, i) => {
    const who = p.position ? `The person on the ${p.position}` : `Person ${i + 1}`;
    const a = p.attributes || {};
    const bits = [p.descriptor || ""];
    if (a.build_visible && a.build) bits.push(`Build: ${a.build}.`);
    if (a.relative_height) bits.push(`Height: ${a.relative_height}.`);
    return `${who}: ${bits.filter(Boolean).join(" ")}`.trim();
  }).join("\n\n");
}

const asPct = (n, fallback) => (Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : fallback);

// Reads outfit, scale, placement and light off a location photo, once. These are
// stable per location, so keeping them out of every request is four fewer things
// for the model to get wrong.
export async function readLocationConfig({ key, model, prompt, image, signal }) {
  const started = performance.now();
  const json = await post(`/models/${model}:generateContent`, key, {
    contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: image }] }],
    generationConfig: { temperature: 0, responseMimeType: "application/json" },
  }, signal);
  const text = firstText(json);
  const p = firstJson(text) || {};
  return {
    config: {
      outfit: String(p.outfit_spec || "").trim(),
      heightPct: asPct(p.target_height_pct, 32),
      placement: String(p.placement_note || "").trim(),
      xPct: asPct(p.placement_x_pct, 50),
      yPct: asPct(p.placement_y_pct, 88),
      light: String(p.light_note || "").trim(),
      difficulty: ["easy", "medium", "hard"].includes(p.difficulty) ? p.difficulty : "medium",
    },
    text,
    raw: json,
    ms: Math.round(performance.now() - started),
  };
}

const IDENTITY_FIELDS = [
  "face_shape_match", "face_width_match", "skin_tone_match", "hair_match",
  "facial_hair_match", "eyewear_match", "relative_height_match",
];

// Prompt C. A pass or fail with one correction to carry into the next attempt.
// The score is derived from the same numbers only so the result can wear a badge
// like every other workflow: it is the verdict that governs the retries.
export async function scoreStrict({ key, model, prompt, reference, candidate, signal }) {
  const started = performance.now();
  const json = await post(`/models/${model}:generateContent`, key, {
    contents: [{ role: "user", parts: [
      { text: prompt },
      { text: "IMAGE A, the original photograph:" },
      { inlineData: reference },
      { text: "IMAGE B, the generated composite:" },
      { inlineData: candidate },
    ] }],
    generationConfig: { temperature: 0, responseMimeType: "application/json" },
  }, signal);
  const text = firstText(json);
  const parsed = firstJson(text) || {};
  const identity = parsed.identity || {};
  const scene = parsed.scene || {};

  const marks = IDENTITY_FIELDS.map((f) => identity[f]).filter((n) => Number.isFinite(n));
  const score = marks.length ? Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 10) : null;

  // The model is asked to apply the rules itself, but the rules are cheap to
  // check here and a gate that trusts a self report is not much of a gate.
  const reasons = Array.isArray(parsed.fail_reasons) ? parsed.fail_reasons.filter(Boolean) : [];
  const failed = [
    ...IDENTITY_FIELDS.filter((f) => Number.isFinite(identity[f]) && identity[f] < 6)
      .map((f) => `${f.replace(/_match$/, "").replace(/_/g, " ")} scored ${identity[f]} out of 10`),
    ...(identity.beautification_detected ? [identity.beautification_notes || "the faces have been flattered"] : []),
    ...(scene.background_intact === false ? ["the background has drifted"] : []),
    ...(scene.feet_grounded === false ? ["the feet are not on the ground"] : []),
    ...(scene.scale_plausible === false ? ["they are the wrong size for the scene"] : []),
    ...(scene.extra_people_added ? ["an extra person has appeared"] : []),
    ...(scene.clothing_appropriate === false ? ["the clothing does not suit the place"] : []),
    ...(Array.isArray(scene.anatomy_errors) ? scene.anatomy_errors.filter(Boolean) : []),
  ];

  const said = String(parsed.verdict || "").toUpperCase();
  const pass = failed.length === 0 && said !== "FAIL" && marks.length > 0;
  const hint = String(parsed.retry_hint || "").trim();

  return {
    pass,
    verdict: pass ? "PASS" : "FAIL",
    score,
    // One correction per retry: stacking them dilutes all of them.
    fixes: pass ? [] : [hint || failed[0] || reasons[0] || "the people do not look like the reference"].filter(Boolean),
    hint,
    reasons: reasons.length ? reasons : failed,
    identity, scene,
    text, raw: json,
    ms: Math.round(performance.now() - started),
  };
}
