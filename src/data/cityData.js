// ─── City Detail data ───
//
// One screen per city, answering a single question: should this city be in my
// trip, and for how many nights? Everything here serves that and nothing else.
//
// The split is deliberate. Anything that is inventory (experiences, stays,
// itineraries, photos) is DERIVED from the pools the rest of the app already
// uses, so it never drifts from them. Anything that is a claim about this
// specific city (when to go, why go, why skip, how far the next city is) is
// WRITTEN, because no generator could get it right and a wrong answer here is
// worse than no answer.

import { destData, getItinerariesForDest } from "../data";
import { C } from "../data";
import { destAreas, areaImg, destMeta, MONTHS, flatActivities, recommendedRoute } from "./buildData";
import { cityVibes } from "./dayOptions";
import { generateHotelsForCity } from "./hotelData";
import { SAMPLE_VIDEO } from "./videoSource";

// ─── Slugs ───
// The repo keys everything by display name and has no slug field anywhere, so
// the index is built from destAreas at load rather than stored twice.

export const slugify = (s) =>
  String(s).normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Maldives is resorts, not cities. Mauritius has no city data at all.
const NO_CITY_PAGES = new Set(["Maldives", "Mauritius"]);

export const CITY_DESTS = Object.keys(destAreas).filter(d => !NO_CITY_PAGES.has(d));

const destBySlug = {};
const cityBySlug = {};
CITY_DESTS.forEach((dest) => {
  destBySlug[slugify(dest)] = dest;
  cityBySlug[slugify(dest)] = {};
  (destAreas[dest] || []).forEach((a) => { cityBySlug[slugify(dest)][slugify(a.city)] = a.city; });
});

// Tolerant on the way in: the rest of the app links with the display name, so
// /destination/Thailand/city/phuket has to resolve as well as the slug form.
export function destFromSlug(s) {
  if (!s) return null;
  const key = slugify(s);
  if (destBySlug[key]) return destBySlug[key];
  const decoded = decodeURIComponent(s);
  return CITY_DESTS.includes(decoded) ? decoded : null;
}
export function cityFromSlug(destSlugOrName, s) {
  const dest = destFromSlug(destSlugOrName);
  if (!dest || !s) return null;
  const inDest = cityBySlug[slugify(dest)] || {};
  if (inDest[slugify(s)]) return inDest[slugify(s)];
  const decoded = decodeURIComponent(s);
  return (destAreas[dest] || []).some(a => a.city === decoded) ? decoded : null;
}
export const cityPath = (dest, city) => `/destination/${slugify(dest)}/city/${slugify(city)}`;

// Every city in a destination that has cityVibes gets a screen, so swiping
// between cities always lands somewhere real.
export function hasCityPage(dest, city) {
  if (!CITY_DESTS.includes(dest)) return false;
  return (destAreas[dest] || []).some(a => a.city === city) && !!cityVibes[city];
}
export const citiesWithPages = (dest) =>
  (destAreas[dest] || []).map(a => a.city).filter(c => hasCityPage(dest, c));

// ─── Themes ───
// Two looks, running side by side so they can be compared on the same screen.
// Everything else about the two is identical.

const BAND_REF = {
  good:  { dot: "#1E8A5A", bg: "#E3F3EA", fg: "#1E7A4E", label: "Good" },
  okay:  { dot: "#D9861C", bg: "#FBEBD3", fg: "#8A5410", label: "Okay" },
  avoid: { dot: "#C8322B", bg: "#F9E0DD", fg: "#A6432F", label: "Avoid" },
};
const BAND_APP = {
  good:  { dot: C.sText, bg: C.sBg,  fg: C.sText, label: "Good" },
  okay:  { dot: C.wText, bg: C.wBg,  fg: C.wText, label: "Okay" },
  avoid: { dot: C.dText, bg: C.dBg,  fg: C.dText, label: "Avoid" },
};

export const CITY_THEMES = {
  // The warm cream from the design reference.
  warm: {
    page: "#F6F2EC", card: "#FFFFFF", line: "#ECE6DD", well: "#F6F2EC",
    head: C.head, body: "#3D3934", muted: "#6B655D",
    accentBg: C.p100, accent: C.p600, band: BAND_REF,
  },
  // The greys the rest of the app already uses.
  plain: {
    page: C.bg, card: C.white, line: C.div, well: C.bg,
    head: C.head, body: C.head, muted: C.sub,
    accentBg: C.p100, accent: C.p600, band: BAND_APP,
  },
};

// Phuket runs warm and Ubud runs plain, as asked. Their neighbours inherit the
// destination's look so a swipe across a country does not change theme midway.
const DEST_THEME = { Thailand: "warm" };
export const themeFor = (dest, city) => {
  if (city === "Phuket") return CITY_THEMES.warm;
  if (city === "Ubud") return CITY_THEMES.plain;
  return CITY_THEMES[DEST_THEME[dest] || "plain"];
};

// ─── Written content ───
//
// months: one row per calendar month.
//   band  "good" | "okay" | "avoid"
//   line  the honest sentence. Every "avoid" month must say what you get in
//         return, so red never shows up without a reason.
//   third a city-appropriate third stat, labelled by thirdLabel below.

const M_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const M_NAME = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const cityContent = {
  Thailand: {
    Phuket: {
      kicker: "Thailand · Andaman coast",
      character: "Beach island with a nightlife strip. 45 min from the airport.",
      facts: ["Beaches", "Nightlife", "First-timers"],
      bestLabel: "Best Nov to Mar",
      thirdLabel: "Sea",
      whyGo: [
        "Direct flights from Delhi and Mumbai, no transit.",
        "Easiest base for Phi Phi and Phang Nga day trips.",
        "Widest hotel range in Thailand at every price.",
      ],
      whySkip: [
        "Patong is loud. Stay in Kata or Bang Tao if you want quiet.",
        "Beaches are busier than Krabi or Khao Lak.",
        "Jun to Sep seas are rough. Island trips get cancelled.",
      ],
      paired: [
        { city: "Krabi", travel: "2h by ferry" },
        { city: "Bangkok", travel: "1h 20m by flight" },
        { city: "Koh Samui", travel: "5h by ferry and road" },
      ],
      months: [
        { band: "good",  temp: "31° / 24°", rain: "3 rain days",  third: "calm",     line: "Dry, sunny and busy. Book hotels 6 to 8 weeks ahead." },
        { band: "good",  temp: "32° / 24°", rain: "3 rain days",  third: "calm",     line: "The clearest water of the year. Best month for island trips." },
        { band: "good",  temp: "33° / 25°", rain: "5 rain days",  third: "calm",     line: "Hot but dry. Crowds thin after the first week." },
        { band: "okay",  temp: "34° / 26°", rain: "9 rain days",  third: "calm",     line: "Hottest month. Songkran water festival mid-April is loud and fun." },
        { band: "okay",  temp: "33° / 26°", rain: "16 rain days", third: "moderate", line: "Rains begin, mostly in short afternoon bursts. Prices drop about 30%." },
        { band: "avoid", temp: "32° / 26°", rain: "18 rain days", third: "rough",    line: "Monsoon. Boat trips get cancelled, but hotels are 40% cheaper and quiet." },
        { band: "avoid", temp: "32° / 25°", rain: "19 rain days", third: "rough",    line: "Wettest stretch. Good for spa, food and Old Town, not for the beaches." },
        { band: "avoid", temp: "32° / 25°", rain: "19 rain days", third: "rough",    line: "Heavy rain most days. Krabi and Phi Phi are equally wet, Bali is dry." },
        { band: "avoid", temp: "31° / 25°", rain: "21 rain days", third: "rough",    line: "Peak rainfall. Lowest prices of the year if you can live with grey skies." },
        { band: "okay",  temp: "31° / 25°", rain: "17 rain days", third: "moderate", line: "Rainy season ending. Calm mornings, showers after 3pm. About 25% cheaper than December." },
        { band: "good",  temp: "31° / 24°", rain: "9 rain days",  third: "calm",     line: "Rains stop by mid-month. Green hills, full waterfalls, sane prices." },
        { band: "good",  temp: "31° / 24°", rain: "5 rain days",  third: "calm",     line: "Peak season. Perfect weather, highest prices, Christmas week sells out." },
      ],
    },
  },
  Bali: {
    Ubud: {
      kicker: "Bali · Central highlands",
      character: "Bali's arts town, inland in the rice terraces. 90 min from the airport.",
      facts: ["Rice terraces", "Yoga and spa", "Rainforest"],
      bestLabel: "Best Apr to Sep",
      thirdLabel: "Trails",
      whyGo: [
        "Terraces, river gorges and temples all within 20 minutes of town.",
        "The best food and spas in Bali, at half the Seminyak price.",
        "Sits high enough that the nights actually cool down.",
      ],
      whySkip: [
        "No beach. The nearest swim is 90 minutes away.",
        "The centre is one long traffic jam from 10am to 6pm.",
        "Monkeys at the forest will take sunglasses and phones.",
      ],
      paired: [
        { city: "Seminyak", travel: "1h 30m by road" },
        { city: "Sanur", travel: "1h by road" },
        { city: "Nusa Penida", travel: "2h by road and fast boat" },
      ],
      months: [
        { band: "avoid", temp: "30° / 23°", rain: "22 rain days", third: "slippery", line: "Wettest month. Rain most afternoons, but the terraces are their greenest and rooms are 40% cheaper." },
        { band: "avoid", temp: "30° / 23°", rain: "20 rain days", third: "slippery", line: "Still properly wet. Good for spas, cooking classes and temples, not for long treks." },
        { band: "okay",  temp: "31° / 23°", rain: "16 rain days", third: "muddy",    line: "Rain eases through the month. Late March is a quiet, green, well-priced window." },
        { band: "good",  temp: "31° / 23°", rain: "9 rain days",  third: "dry",      line: "Dry season starts and the crowds have not arrived yet." },
        { band: "good",  temp: "31° / 22°", rain: "7 rain days",  third: "dry",      line: "One of the best months. Dry, still green from the rains, cheaper than June." },
        { band: "good",  temp: "30° / 22°", rain: "6 rain days",  third: "dry",      line: "Cool evenings and clear skies. Book ahead, the busy season starts here." },
        { band: "good",  temp: "29° / 21°", rain: "5 rain days",  third: "dry",      line: "Peak season. Perfect weather, highest prices, the centre is busy all day." },
        { band: "good",  temp: "29° / 21°", rain: "3 rain days",  third: "dry",      line: "Driest month of the year. Also the most expensive and the most crowded." },
        { band: "good",  temp: "30° / 22°", rain: "5 rain days",  third: "dry",      line: "Crowds thin and the weather holds. Best value month of the dry season." },
        { band: "okay",  temp: "31° / 23°", rain: "8 rain days",  third: "dry",      line: "First showers return, usually short and late. Still mostly dry and much quieter." },
        { band: "okay",  temp: "31° / 23°", rain: "14 rain days", third: "muddy",    line: "Rains build. Mornings are usually clear, afternoons are not. Prices drop about 25%." },
        { band: "avoid", temp: "30° / 23°", rain: "19 rain days", third: "slippery", line: "Wet and humid. Waterfalls are at their fullest, but Christmas week is rain plus peak prices." },
      ],
    },
  },
};

export const writtenFor = (dest, city) => cityContent[dest]?.[city] || null;

// ─── Derived content ───
// None of this is stored twice. It comes off the same pools the destination
// page, the builder and the itinerary screens already read.

const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// The stay generator seeds on the check-in date, so a live date would reshuffle
// the list every day. Pin it unless the traveller has real dates in Plan.
const SEED_DATE = "2026-11-12";

export function cityBasics(dest, city) {
  const area = (destAreas[dest] || []).find(a => a.city === city);
  if (!area) return null;
  const w = writtenFor(dest, city);
  const peak = destMeta[dest]?.peak || [];
  return {
    dest, city,
    emoji: area.emoji,
    nights: area.n,
    crowd: area.crowd,
    blurb: area.blurb,
    kicker: w?.kicker || dest,
    character: w?.character || area.blurb,
    bestLabel: w?.bestLabel || (peak.length ? `Best ${peak[0]} to ${peak[peak.length - 1]}` : null),
    thirdLabel: w?.thirdLabel || "Sea",
    whyGo: w?.whyGo || null,
    whySkip: w?.whySkip || null,
    facts: w?.facts || [area.tag].filter(Boolean),
  };
}

// Up to five stills. Only Bali has real per-city photography; everywhere else
// falls back to the country pool, so de-dupe hard and show three good photos
// rather than six repeats.
export function cityPhotos(dest, city) {
  const dd = destData[dest] || {};
  // Seeded off the city's own position, so the first photo here is the same one
  // the destination page shows on that city's card.
  const at = (destAreas[dest] || []).findIndex(a => a.city === city);
  const seen = new Set();
  const out = [];
  const add = (src) => { if (src && !seen.has(src)) { seen.add(src); out.push(src); } };
  add(areaImg(dest, city, Math.max(0, at)));
  (dd.actImgs || []).forEach(add);
  (dd.offbeatImgs || []).forEach(add);
  add(dd.hero);
  return out.slice(0, 5);
}

// One clip exists in the whole app, so every city plays the same footage. It is
// never labelled as being of this city. Swapping it later is one line.
export const cityVideo = () => SAMPLE_VIDEO;

export function cityFacts(dest, city) {
  const b = cityBasics(dest, city);
  if (!b) return [];
  const out = [];
  if (b.bestLabel) out.push({ text: b.bestLabel, accent: true });
  out.push({ text: `${b.nights} to ${b.nights + 1} nights` });
  b.facts.forEach(f => out.push({ text: f }));
  return out.slice(0, 6);
}

export function cityMonths(dest, city) {
  const w = writtenFor(dest, city);
  if (!w) return null;
  return w.months.map((m, i) => ({ ...m, idx: i, name: M_NAME[i], short: M_SHORT[i] }));
}

// Experiences for this city, off the same activity pool the builder hand-picks
// from. Two fields are synthesised here and nowhere else.
export function cityExperiences(dest, city) {
  const route = recommendedRoute(dest, 60);
  const vibes = cityVibes[city] || [];
  const hoursByVibe = {};
  vibes.forEach(v => { hoursByVibe[v.vibe] = v.activityHours; });
  return flatActivities(dest, route)
    .filter(a => a.city === city)
    .slice(0, 6)
    .map((a) => {
      const h = hoursByVibe[a.vibe];
      // Not the `dur` the activity helper returns: that is a video length.
      const duration = !h ? "Half day" : h >= 6 ? "Full day" : `About ${Math.round(h)} hours`;
      // No per-activity price exists anywhere, so it is banded off the name and
      // always labelled "from", never presented as a quote.
      const price = 1500 + (hash(a.id) % 51) * 100;
      return { id: a.id, name: a.name, img: a.img, duration, price };
    });
}

export function cityStays(dest, city, startDate) {
  const checkIn = startDate || SEED_DATE;
  const all = generateHotelsForCity(city, dest, checkIn, checkIn, 2) || [];
  const rated = all.filter(h => h.bookingScore >= 8.0);
  const picked = (rated.length >= 3 ? rated : [...all].sort((a, b) => b.bookingScore - a.bookingScore)).slice(0, 4);
  return picked.map((h) => {
    const room = h.rooms?.[0] || {};
    const base = room.pricePerNight || h.pricePerNight || 0;
    const tax = room.taxPerNight || Math.round(base * 0.03);
    return {
      id: h.id, name: h.name, stars: h.stars, score: h.bookingScore,
      area: h.neighbourhood, roomType: h.roomType,
      img: h.images?.[0]?.url, base, tax, total: base + tax,
    };
  });
}

export function cityPaired(dest, city) {
  const w = writtenFor(dest, city);
  const areas = destAreas[dest] || [];
  const rows = w?.paired
    ? w.paired
    : areas.filter(a => a.city !== city).slice(0, 4).map(a => ({ city: a.city, travel: null }));
  return rows
    .filter(r => hasCityPage(dest, r.city))
    .map((r, i) => {
      const a = areas.find(x => x.city === r.city);
      return {
        city: r.city, travel: r.travel, nights: a?.n,
        img: areaImg(dest, r.city, areas.indexOf(a)) || areaImg(dest, r.city, i),
      };
    })
    .slice(0, 4);
}

export const cityItineraries = (dest, city) =>
  getItinerariesForDest(dest).filter(it => (it.route || []).some(r => r.city === city)).slice(0, 6);

export { MONTHS };
