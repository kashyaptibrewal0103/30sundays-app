// Canvas work for the two workflows that paste before they generate.
//
// The paste is deliberately crude: it puts the real, untouched faces in the
// right place at the right size, and leaves the edges, the light and the
// clothing to the Gemini pass that follows. Nothing here ever redraws a face,
// which is the whole reason these workflows exist.

import { blobToInline, inlineToDataUrl } from "./gemini";

const loadImage = (inline) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onerror = () => reject(new Error("Could not read that image"));
  img.onload = () => resolve(img);
  img.src = inlineToDataUrl(inline);
});

const canvasToInline = (canvas, type = "image/jpeg", quality = 0.92) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("Could not write that image")); return; }
      blobToInline(blob).then(resolve).catch(reject);
    }, type, quality);
  });

// Lifts the couple off the flat white background the cutout call was asked for,
// then trims to what is left, so a height in percent means the people rather
// than the canvas they were standing on.
export async function removeFlatBackground(inline, { tolerance = 26 } = {}) {
  const img = await loadImage(inline);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = frame.data;
  const floor = 255 - tolerance;
  let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;

  for (let i = 0; i < px.length; i += 4) {
    if (px[i] >= floor && px[i + 1] >= floor && px[i + 2] >= floor) {
      px[i + 3] = 0;
      continue;
    }
    const p = i / 4;
    const x = p % canvas.width;
    const y = (p - x) / canvas.width;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (maxX < 0) throw new Error("The cutout came back blank");
  ctx.putImageData(frame, 0, 0);

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d").drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
  return { inline: await canvasToInline(out, "image/png"), width: w, height: h };
}

// Puts a cutout into a scene at a height and a spot given in percentages, with
// the feet landing on the point named. The soft edge is only there to stop the
// blend pass having a hard cut line to argue with.
export async function pasteOnto(baseInline, overlayInline, {
  xPct = 50, yPct = 88, heightPct = 32, featherPx = 2,
} = {}) {
  const [base, over] = await Promise.all([loadImage(baseInline), loadImage(overlayInline)]);
  const bw = base.naturalWidth;
  const bh = base.naturalHeight;

  const oh = Math.max(1, Math.round((heightPct / 100) * bh));
  const ow = Math.max(1, Math.round(over.naturalWidth * (oh / over.naturalHeight)));

  // Softens the alpha only: sharp colour drawn first, then kept where a blurred
  // copy of itself is opaque.
  const soft = document.createElement("canvas");
  soft.width = ow;
  soft.height = oh;
  const sctx = soft.getContext("2d");
  sctx.drawImage(over, 0, 0, ow, oh);
  if (featherPx > 0) {
    sctx.globalCompositeOperation = "destination-in";
    sctx.filter = `blur(${featherPx}px)`;
    sctx.drawImage(over, 0, 0, ow, oh);
  }

  const canvas = document.createElement("canvas");
  canvas.width = bw;
  canvas.height = bh;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(base, 0, 0);

  const x = Math.round((xPct / 100) * bw - ow / 2);
  const y = Math.round((yPct / 100) * bh - oh);
  ctx.drawImage(soft, x, y);

  return {
    inline: await canvasToInline(canvas),
    width: bw,
    height: bh,
    placed: { x, y, width: ow, height: oh },
  };
}

// The close up is generated large on purpose, because face detail is what the
// whole workflow is buying. It only needs shrinking once it is time to paste.
export async function downscaleInline(inline, maxEdge = 1568) {
  const img = await loadImage(inline);
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  if (scale === 1) return inline;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToInline(canvas, "image/png");
}

// Redraws an image at exactly these pixels. The plate comes back at whatever size
// and near enough shape the model felt like, and a location photo that is a drop
// in replacement for the original should be the original's size.
export async function resizeToExact(inline, width, height) {
  const img = await loadImage(inline);
  if (img.naturalWidth === width && img.naturalHeight === height) return inline;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvasToInline(canvas, "image/jpeg", 0.92);
}
