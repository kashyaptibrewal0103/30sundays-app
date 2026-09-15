// Model choices for the lab. Names move fast, so this list is only a starting
// point: the settings panel can pull the live list from the key with one tap,
// and any id can be typed in by hand.

// Gemini image generation and editing models. Nano Banana Pro is the default.
export const IMAGE_MODELS = [
  { id: "gemini-3-pro-image-preview", label: "Nano Banana 3 Pro (Gemini 3 Pro Image)" },
  { id: "gemini-3-pro-image", label: "Nano Banana 3 Pro (stable id)" },
  { id: "gemini-2.5-flash-image", label: "Nano Banana (Gemini 2.5 Flash Image)" },
  { id: "gemini-2.5-flash-image-preview", label: "Nano Banana preview (2.5 Flash Image)" },
  { id: "gemini-2.0-flash-preview-image-generation", label: "Gemini 2.0 Flash image generation" },
];

export const DEFAULT_IMAGE_MODEL = "gemini-3-pro-image-preview";

// The small model that checks the uploaded photo. Text in, JSON out.
export const CHECK_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash preview" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

export const DEFAULT_CHECK_MODEL = "gemini-2.5-flash";

export const IMAGE_SIZES = ["Auto", "1K", "2K", "4K"];
export const ASPECT_RATIOS = ["Auto", "9:16", "3:4", "1:1", "4:3", "16:9"];

// A model id looks image capable if its name says so. Used to sort the live
// list into the two dropdowns.
export const looksLikeImageModel = (id = "") => /image/i.test(id) && !/embedding/i.test(id);
