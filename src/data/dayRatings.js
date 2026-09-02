// ─── Day-level traveller ratings ───────────────────────────────────────────
// Ratings sit on the DAY, not on each tour. A day's numbers are the sum of its
// tours' ratings, weighted by how many people rated each.
//
// The published figure is ENJOYED = loved + liked, i.e. everyone who did not
// pick "not for me". One metric in all three slots, so days stay comparable.
//
// One threshold, one colour change:
//
//   enjoyed >= LOW_THRESHOLD   green
//   enjoyed <  LOW_THRESHOLD   amber, and on the day-details screen the
//                              sentence is prefixed with "Only"
//
// The figure is shown in every band — nothing is suppressed for being low.
// Note for when live ratings land: measured across the mock generator, real
// loved+liked lands between 94% and 100%, so a 50% threshold will almost never
// fire on production data. The boundary is worth re-deriving from the real
// distribution once it exists.
import { getTourRating, buildSummary, buildReviewSample } from "./tourRatings";

export const LOW_THRESHOLD = 50;
export const MIN_RATINGS = 20;   // below this, a figure is noise — show nothing

export const GREEN = "#2E8B60";
export const AMBER = "#E0940A";

export const TIER = {
  good:   { key: "good",   color: GREEN, showPct: true },
  low:    { key: "low",    color: AMBER, showPct: true },
  tooFew: { key: "tooFew", color: AMBER, showPct: false },
};

// Wording for the day-details line. The compact slots carry no words.
// The low variants lead with "Only".
export const WORDING = {
  plain: {
    good: (p) => `${p}% of travellers enjoyed this day`,
    low:  (p) => `Only ${p}% of travellers enjoyed this day`,
  },
  couples: {
    good: (p) => `Enjoyed by ${p}% of couples`,
    low:  (p) => `Only ${p}% of couples enjoyed this day`,
  },
  repeat: {
    good: (p) => `${p}% would do this day again`,
    low:  (p) => `Only ${p}% would do this day again`,
  },
};
export const DEFAULT_WORDING = "plain";

export function tierFor(enjoyedPct, count) {
  if (count < MIN_RATINGS) return TIER.tooFew;
  return enjoyedPct >= LOW_THRESHOLD ? TIER.good : TIER.low;
}

// Build the rating keys for a day from the tours getDayTours() returns.
// Transfer-only blocks (tap-to-open, no real activity) are not rated.
export function tourKeysForDay(tours) {
  return (tours || [])
    .map((t) => {
      const real = (t.items || []).filter((x) => x.actIdx != null && !x.onTap);
      return real.length ? t.heading + "|" + real.map((x) => x.name).join("~") : null;
    })
    .filter(Boolean);
}

function hash(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// PROTOTYPE ONLY. The tour generator only ever produces 94-100% enjoyed, so
// summing it would make every day green and the amber treatment unreachable.
// This spreads days deterministically so roughly one in three lands below the
// threshold — enough that a normal itinerary and a Change-day-plan grid both
// show the two states side by side. Delete this when live ratings arrive.
function prototypeEnjoyed(key) {
  const h = hash(key);
  return h % 3 === 0 ? 31 + ((h >>> 4) % 18) : 84 + ((h >>> 4) % 16);
}

const FORCED = { good: [84, 99], low: [31, 48] };

/**
 * One rating for a whole day.
 *
 * @param dayKey    stable key for the day
 * @param tourKeys  rating keys of the day's tours, from tourKeysForDay()
 * @param opts.forceTier  "good" | "low" — pins the band, for demos
 * @param opts.wording    key of WORDING (default DEFAULT_WORDING)
 */
export function getDayRating(dayKey, tourKeys, opts = {}) {
  const parts = (tourKeys || []).map((k) => getTourRating(k)).filter(Boolean);
  if (!parts.length) return null;

  let count = 0, loved = 0, liked = 0;
  parts.forEach((p) => { count += p.count; loved += p.loved; liked += p.liked; });

  const band = FORCED[opts.forceTier];
  const h = hash(dayKey);
  const targetEnjoyed = band
    ? band[0] + (h % (band[1] - band[0] + 1))
    : prototypeEnjoyed(dayKey);

  // Reshape the mix to the target, keeping the loved:liked ratio as generated.
  const notForMe = Math.round((count * (100 - targetEnjoyed)) / 100);
  const rest = count - notForMe;
  const lovedShare = loved / Math.max(1, loved + liked);
  loved = Math.round(rest * lovedShare);
  liked = Math.max(0, rest - loved);

  const lovedPct = Math.round((loved / count) * 100);
  const likedPct = Math.round((liked / count) * 100);
  const notPct = Math.max(0, 100 - lovedPct - likedPct);
  const enjoyedPct = lovedPct + likedPct;
  const tier = tierFor(enjoyedPct, count);

  const wording = WORDING[opts.wording] || WORDING[DEFAULT_WORDING];
  const detailText = tier === TIER.tooFew ? null : wording[tier.key](enjoyedPct);

  return {
    count, loved, liked, notForMe,
    lovedPct, likedPct, notPct, enjoyedPct,
    tier, color: tier.color, detailText,
    summary: buildSummary(lovedPct, likedPct, notPct),
    reviews: buildReviewSample(dayKey, { loved: lovedPct, liked: likedPct, not: notPct }),
  };
}
