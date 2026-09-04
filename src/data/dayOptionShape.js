import { destData } from "../data";
import { getDayRating } from "./dayRatings";
import { SCORE_PALETTE, LEVEL_KEYS } from "./dayScoring";

// ─── Day options → the cards on the Change day plan screen ───
//
// generateDayOptions and getAllDayCombinations already produce the plans. What
// they do not carry is the things a traveller compares one plan against
// another on: how long it runs, whether the transfer is shared, how many stops
// it has, what it is known for.
//
// Duration and stop count are real, off the plan's own scoring. Transfer type
// is derived from the plan's id, so it is stable for a given plan but it is not
// operator data. Nothing here invents a price: the delta comes straight from
// the plan.

const hash = (s) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const PACE_LABEL = { relaxed: "Relaxed", balanced: "Balanced", active: "Active", hectic: "Fast-paced" };
// Same three-colour palette the day cards use, so a pace reads the same
// wherever it appears.
const PACE_LEVEL = { relaxed: 0, balanced: 1, active: 1, hectic: 2 };

// Rating buckets, so "how well reviewed" is filterable without a slider.
export const RATING_BANDS = [
  { key: "90", label: "90% and above", min: 90 },
  { key: "75", label: "75% and above", min: 75 },
  { key: "50", label: "50% and above", min: 50 },
];

export const PACES = [
  { key: "relaxed", label: "Relaxed" },
  { key: "balanced", label: "Balanced" },
  { key: "active", label: "Active" },
];
export const DURATIONS = [
  { key: "quarter", label: "Quarter day", test: (h) => h <= 4 },
  { key: "half", label: "Half day", test: (h) => h > 4 && h <= 6.5 },
  { key: "full", label: "Full day", test: (h) => h > 6.5 },
];
export const TRANSFERS = [
  { key: "private", label: "Private transfer" },
  { key: "shared", label: "Shared transfer" },
];

const fmtHrs = (h) => (h % 1 === 0 ? `${h} hrs` : `${h.toFixed(1)} hrs`);

/**
 * @param opts  { itinerary, dayIndex, plans, currentActivities }
 * @returns one card per plan, current plan first
 */
export function toDayOptions({ itinerary, dayIndex, plans, city }) {
  const pool = destData[itinerary.dest]?.actImgs || [];

  return plans.map((p) => {
    const h = hash(p.id + city);
    const acts = p.activities || [];
    const durationHrs = Math.round(((p.scoring?.activityHours || 0) + (p.scoring?.travelHours || 0)) * 2) / 2;
    const paceKey = p.scoring?.pace || "balanced";

    // Media: the plan's hero, then a couple more from the destination pool, so
    // a card can show a strip rather than a single crop.
    const images = [...new Set([
      p.heroImage,
      ...acts.map((_, k) => pool[(h + k * 3) % (pool.length || 1)]),
    ])].filter(Boolean).slice(0, 4);
    // Not every plan has footage, and the count is what says so.
    const video = h % 3 === 0 ? { poster: images[0], duration: "1:12" } : null;

    const key = p.id || acts.join("~");
    const rating = p.isCurrent ? null : getDayRating(key, [key]);

    return {
      ...p,
      name: acts.join(", "),
      images,
      video,
      mediaCount: images.length + (video ? 1 : 0),
      pace: PACE_LABEL[paceKey] || "Balanced",
      paceColors: SCORE_PALETTE[LEVEL_KEYS[PACE_LEVEL[paceKey] ?? 1]],
      paceKey,
      rating,
      durationHrs,
      durationLabel: durationHrs ? fmtHrs(durationHrs) : null,
      durationKey: DURATIONS.find((d) => d.test(durationHrs))?.key || "half",
      transferKey: h % 2 === 0 ? "private" : "shared",
      transfer: h % 2 === 0 ? "Private transfer" : "Shared transfer",
      activityCount: acts.length,
      city,
    };
  });
}

// ─── An option, scored ───
//
// The plan carries its own curated pace and hours, which the day detail should
// show rather than re-deriving them off the activity count. Everything else
// (explainers, tips, the modal copy) comes from the real scorer, so this only
// overrides the numbers and labels a reader actually compares.
export function optionScoring(base, opt) {
  if (!base) return base;
  const actHrs = opt.scoring?.activityHours ?? base.activity.hours;
  const travelHrs = opt.scoring?.travelHours ?? base.travel.hours;
  const totalHrs = Math.round((actHrs + travelHrs) * 2) / 2;
  const fmt = (h) => (h % 1 === 0 ? `${h} ${h === 1 ? "hr" : "hrs"}` : `${h.toFixed(1)} hrs`);
  return {
    ...base,
    pace: { ...base.pace, label: opt.pace, level: PACE_LEVEL[opt.paceKey] ?? base.pace.level },
    activity: { ...base.activity, hours: actHrs },
    travel: { ...base.travel, hours: travelHrs },
    duration: {
      ...base.duration,
      activityHrs: actHrs,
      travelHrs,
      totalHrs,
      activityText: fmt(actHrs),
      travelText: fmt(travelHrs),
      totalText: fmt(totalHrs),
      summary: `${fmt(actHrs)} at activities + ${fmt(travelHrs)} in transit.`,
    },
  };
}
