// True only on the photo lab deployment, which is meant to sit on its own
// subdomain. Reading the hostname keeps every deployment building from one
// branch with no per-environment config. VITE_APP_VARIANT overrides it locally.
export const LAB_VARIANT =
  import.meta.env.VITE_APP_VARIANT === "lab" ||
  (typeof window !== "undefined" && window.location.hostname.includes("photo-lab"));
