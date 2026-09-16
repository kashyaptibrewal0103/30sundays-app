// ─── Community palette ───
//
// Community used to be almost entirely pink, which made every element shout at
// the same volume. This is the brand board instead: the deep green carries the
// type, lagoon carries trust, golden carries attention, and the fuchsia is held
// back for the one action per screen that matters.
//
// Kept local to Community so nothing else in the app shifts underneath it.

export const CC = {
  // Type and structure
  ink: "#254342",       // tropical forest, headings
  body: "#5B7472",      // muted body, still in the green family
  soft: "#93A9A7",      // captions, timestamps, inactive icons
  line: "#E4EAE9",      // hairlines
  well: "#F4F7F6",      // section bars and quiet wells
  white: "#FFFFFF",

  // Lagoon: proof. Verified, solved, answered, the team.
  teal: "#00A898",
  tealInk: "#04756B",
  tealTint: "#E5F6F5",
  tealLine: "#BFE6E2",

  // Golden: attention without alarm. Live activity, new, unanswered.
  gold: "#FDA201",
  goldInk: "#8A5A00",
  goldTint: "#FFF4E0",
  goldLine: "#F5DCAE",

  // Coastal mist: the brand's own warm off-white, for a ground that reads as
  // a different surface without reading as a colour.
  mist: "#EFECE9",
  mistLine: "#DFD9D4",

  // Blush and coral: decoration in the pink family. The full fuchsia is spoken
  // for by the one primary action per screen, so a rule that wants to be warm
  // without being a button borrows from these instead.
  blush: "#F4A9BF",
  coral: "#F97B62",

  // Bubbles sitting on the golden band. Same hue as the ground, lifted most of
  // the way to white, so a card reads as raised rather than as a white patch
  // dropped onto a warm surface.
  bubbleLight: "#FFFDF7",
  bubbleMid: "#FFFAEF",
  bubbleDeep: "#FFF8E8",
  bubbleEdge: "#F6E8CE",

  // Fuchsia: the single primary action, and nothing else.
  pink: "#FD014F",
  pinkInk: "#B00038",
  pinkTint: "#FFE8EF",
  pinkLine: "#FAC6D5",
  // The fuchsia lifted far enough to read on the deep green card.
  pinkOnDark: "#FF7FA4",
};

// One warm neutral for every avatar. They used to rotate through lagoon,
// golden and fuchsia, which spent all three accents on decoration: lagoon now
// means proof, golden means attention, and fuchsia means the one action.
// Coastal mist is warm enough to sit under a golden section without becoming
// a fourth colour.
const AVATAR = { bg: CC.mist, fg: CC.ink };

export function tintFor() {
  return AVATAR;
}

// Subject colour. Three hues and the ink, rotating, so a list of six subjects
// never shows six different colours arguing with each other. The colour is the
// subject's, not a signal: golden still means attention everywhere else.
const SUBJECT_HUE = {
  Weather: CC.goldInk, Food: CC.goldInk, Temples: CC.goldInk,
  Boats: CC.tealInk, Stays: CC.tealInk, Activities: CC.tealInk,
  Transport: CC.pinkInk, Cities: CC.pinkInk,
  Money: CC.ink, Packing: CC.ink, Visas: CC.ink,
};
export function hueFor(tag) {
  return SUBJECT_HUE[tag] || CC.body;
}
