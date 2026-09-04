// ─── 30 Sundays brand board ───
//
// Straight from the brand board: five named colours and three typefaces.
// Named the way the shade card names them, so a design conversation and the
// code use the same words.

export const BRAND = {
  // The pink everything leads with. Buttons, links, the active state.
  sunsetFuchsia: "#FD014F",
  // The deep green we set type in. Headings, names, anything that has to read.
  tropicalForest: "#254342",
  // The trust colour. Proof, reassurance, anything verified.
  lagoonBliss: "#00A898",
  // Warmth and attention, without the alarm of red.
  goldenHour: "#FDA201",
  // The warm off-white behind everything. Cards, wells, avatar circles.
  coastalMist: "#EAE6E3",
};

// Tints of the brand colours, for backgrounds that sit under brand-coloured
// type. Mixed toward white rather than picked by eye, so they stay on-hue.
export const BRAND_TINT = {
  lagoonBliss: "#E5F6F5",
  sunsetFuchsia: "#FFE8EF",
  goldenHour: "#FFF4E0",
};

// Type. Poppins is primary, Raleway secondary, PF Reminder tertiary. Only
// Poppins is loaded today; the other two are not in use yet.
export const FONT = {
  primary: "'Poppins', 'Figtree', system-ui, sans-serif",
};

// Muted body text that stays in the green family rather than reverting to a
// neutral grey, which reads as a different design system next to it.
export const BRAND_SUB = "#5B7472";
