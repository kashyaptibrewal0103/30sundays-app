// ─── Build-your-own synthesis layer ───
// Powers the "Build your own trip" wizard. Everything here is grounded in the
// existing data: areas are scoped to cities that already have cityVibes (so the
// day-swap and activity hand-pick reuse the same pool), and prices/images come
// from destData. The wizard collects intent; these helpers synthesize a full
// itinerary object the existing itinerary screen can render unchanged.

import { destData, reviews } from "../data";
import { cityVibes } from "./dayOptions";

// Canonical trip vibes shown as 1-tap chips, mapped to the cityVibes labels we
// rank activities against.
export const VIBES = [
  { key: "Relax", emoji: "🌴", label: "Relax", match: ["Chill & Scenic", "The Classic"] },
  { key: "Culture", emoji: "🏛️", label: "Culture", match: ["Culture Deep Dive"] },
  { key: "Adventure", emoji: "🧗", label: "Adventure", match: ["Adventure Day"] },
  { key: "Food", emoji: "🍜", label: "Food & nightlife", match: ["Foodie Trail"] },
  { key: "Nature", emoji: "🌿", label: "Nature & offbeat", match: ["Off the Beaten Path", "Chill & Scenic"] },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Per-destination build metadata: timing, sizing and a one-line pitch.
export const destMeta = {
  Bali: {
    tagline: "Temples, rice terraces, beach clubs and a little magic.",
    whoFor: "Couples who want culture, nature and beach in one trip.",
    minNights: 6, defaultNights: 7,
    peak: ["May","Jun","Jul","Aug","Sep"], shoulder: ["Apr","Oct"],
  },
  Vietnam: {
    tagline: "Lantern towns, limestone bays and unreal street food.",
    whoFor: "Explorers who like cities, scenery and a fast pace.",
    minNights: 7, defaultNights: 8,
    peak: ["Feb","Mar","Apr","Nov","Dec"], shoulder: ["Jan","May","Oct"],
  },
  Thailand: {
    tagline: "Grand temples, island-hopping and night-market energy.",
    whoFor: "First-timers who want easy beaches plus buzzy cities.",
    minNights: 6, defaultNights: 7,
    peak: ["Nov","Dec","Jan","Feb"], shoulder: ["Mar","Oct"],
  },
  Maldives: {
    tagline: "Overwater villas, glass-clear lagoons, pure switch-off.",
    whoFor: "Couples wanting a quiet, romantic island escape.",
    minNights: 4, defaultNights: 5,
    peak: ["Nov","Dec","Jan","Feb","Mar","Apr"], shoulder: ["May","Oct"],
  },
  "Sri Lanka": {
    tagline: "Tea hills, ancient rock forts and golden south beaches.",
    whoFor: "Couples who want variety in a compact, easy loop.",
    minNights: 6, defaultNights: 7,
    peak: ["Dec","Jan","Feb","Mar"], shoulder: ["Apr","Nov"],
  },
  "New Zealand": {
    tagline: "Fiords, alps, vineyards and proper adrenaline.",
    whoFor: "Active couples up for big scenery and long drives.",
    minNights: 8, defaultNights: 10,
    peak: ["Dec","Jan","Feb"], shoulder: ["Mar","Apr","Oct","Nov"],
  },
};

// Curated, ordered candidate areas per destination. Every city here exists in
// cityVibes, so day-swap and the activity pool work downstream. `n` is the
// typical/recommended nights; the recommended route fills the trip length in
// this order. Crowd + blurb are the route-step education.
export const destAreas = {
  Bali: [
    { city: "Ubud", emoji: "🌿", n: 2, crowd: "Mixed", tag: "Rice terraces, yoga and art", blurb: "Jungle, rice terraces and Bali's arts-and-yoga heart." },
    { city: "Seminyak", emoji: "🌞", n: 2, crowd: "High", tag: "Beach clubs, dining and bars", blurb: "Upscale beach clubs, dining and sunset bars." },
    { city: "Sanur", emoji: "☀️", n: 2, crowd: "Low", tag: "Calm coast, easy mornings", blurb: "Calm coast, easy mornings, boats to the islands." },
    { city: "Canggu", emoji: "🏄", n: 2, crowd: "Mixed", tag: "Surf, cafés and beach town", blurb: "Surf, hip cafés and a laid-back beach-town buzz." },
    { city: "Uluwatu", emoji: "🛕", n: 1, crowd: "Mixed", tag: "Clifftop temples and surf", blurb: "Clifftop temples and dramatic sunset surf breaks." },
    { city: "Nusa Penida", emoji: "🌊", n: 2, crowd: "Low", tag: "Cliffs, snorkelling and beaches", blurb: "Cliffs, snorkelling and that postcard beach." },
    { city: "Labuan Bajo", emoji: "🐉", n: 2, crowd: "Low", tag: "Komodo dragons and islands", blurb: "Gateway to Komodo: dragons, pink beaches and island-hopping. A short flight from Bali." },
  ],
  Vietnam: [
    { city: "Hanoi", emoji: "🏮", n: 2, crowd: "High", tag: "Old Quarter, lakes and food", blurb: "Old Quarter chaos, lakes and legendary street food." },
    { city: "Ha Long", emoji: "⛰️", n: 2, crowd: "Mixed", tag: "Overnight bay cruise", blurb: "Overnight cruise through emerald limestone karsts." },
    { city: "Hoi An", emoji: "🏮", n: 3, crowd: "Mixed", tag: "Lantern town and tailors", blurb: "Lantern-lit old town, tailors and riverside calm." },
    { city: "Da Nang", emoji: "🌉", n: 2, crowd: "Mixed", tag: "Beach city, Golden Bridge", blurb: "Beach city with the Golden Bridge and easy days." },
    { city: "HCMC", emoji: "🛵", n: 2, crowd: "High", tag: "History, markets and rooftops", blurb: "High-energy south: history, markets and rooftops." },
    { city: "Phu Quoc", emoji: "🏝️", n: 3, crowd: "Low", tag: "Island beaches and seafood", blurb: "Island wind-down: beaches, seafood, sunsets." },
  ],
  Thailand: [
    { city: "Bangkok", emoji: "🛕", n: 2, crowd: "High", tag: "Temples, food and rooftop bars", blurb: "Glittering temples, street eats and rooftop bars." },
    { city: "Chiang Mai", emoji: "🐘", n: 2, crowd: "Mixed", tag: "Old city and mountain air", blurb: "Old-city temples, sanctuaries and mountain air." },
    { city: "Krabi", emoji: "🪨", n: 3, crowd: "Mixed", tag: "Limestone cliffs and islands", blurb: "Limestone cliffs, island hops and Railay beaches." },
    { city: "Phuket", emoji: "🏖️", n: 3, crowd: "High", tag: "Big beaches and nightlife", blurb: "Big beaches, Phi Phi day trips and nightlife." },
    { city: "Koh Samui", emoji: "🥥", n: 3, crowd: "Mixed", tag: "Palm beaches and slow pace", blurb: "Palm-fringed beach clubs and a slower pace." },
  ],
  Maldives: [
    { city: "Malé", emoji: "🕌", n: 1, crowd: "Mixed", tag: "Capital and quick stopover", blurb: "Gateway capital: fish market, cafés, quick stopover." },
    { city: "Baa Atoll", emoji: "🐠", n: 3, crowd: "Low", tag: "Manta rays and reef snorkelling", blurb: "UNESCO biosphere: manta rays and reef snorkelling." },
    { city: "S.Ari", emoji: "🦈", n: 3, crowd: "Low", tag: "Whale sharks and villas", blurb: "Whale-shark waters and classic overwater villas." },
    { city: "Addu", emoji: "🌊", n: 3, crowd: "Low", tag: "Quiet atoll, lagoons and diving", blurb: "Quiet southern atoll: lagoons, diving, dolphins." },
  ],
  "Sri Lanka": [
    { city: "Sigiriya", emoji: "🪨", n: 2, crowd: "Mixed", tag: "Lion Rock and cave temples", blurb: "Lion Rock fort, cave temples and village safaris." },
    { city: "Kandy", emoji: "🛕", n: 2, crowd: "Mixed", tag: "Hill temple and tea country", blurb: "Hill capital: sacred temple, lake and tea country." },
    { city: "Ella", emoji: "🚂", n: 2, crowd: "Mixed", tag: "Misty peaks and the train", blurb: "Misty peaks, the famous train and Nine Arches." },
    { city: "Galle", emoji: "🏰", n: 2, crowd: "Mixed", tag: "Dutch fort and south coast", blurb: "Dutch fort streets, cafés and south-coast surf." },
    { city: "Mirissa", emoji: "🐋", n: 3, crowd: "Low", tag: "Whale watching and beaches", blurb: "Whale watching and laid-back palm-fringed beaches." },
  ],
  "New Zealand": [
    { city: "Auckland", emoji: "⛵", n: 2, crowd: "Mixed", tag: "Harbour city, islands and wine", blurb: "Harbour city: islands, wine and a gentle start." },
    { city: "Rotorua", emoji: "♨️", n: 2, crowd: "Mixed", tag: "Geothermal springs and culture", blurb: "Geothermal wonders, Māori culture and Hobbiton." },
    { city: "Queenstown", emoji: "🏔️", n: 4, crowd: "Mixed", tag: "Adventure, lakes and Milford", blurb: "Adventure capital: bungee, lakes and Milford trips." },
    { city: "Wanaka", emoji: "🌲", n: 2, crowd: "Low", tag: "Alpine lake and big hikes", blurb: "Mellower alpine lake town with big hikes." },
    { city: "Christchurch", emoji: "🌳", n: 2, crowd: "Low", tag: "Garden city, gateway south", blurb: "Garden city and gateway to the south." },
  ],
};

// Approximate lat/lng per area, so the route map can place cities at their true
// relative positions on a stylised canvas (no map library / live tiles needed).
export const cityCoords = {
  // Bali
  Ubud: { lat: -8.5069, lng: 115.2625 }, Seminyak: { lat: -8.6917, lng: 115.1686 },
  Sanur: { lat: -8.6878, lng: 115.2526 }, Canggu: { lat: -8.6478, lng: 115.1385 },
  Uluwatu: { lat: -8.8291, lng: 115.0849 }, "Nusa Penida": { lat: -8.7274, lng: 115.5444 },
  "Labuan Bajo": { lat: -8.4964, lng: 119.8877 },
  // Vietnam
  Hanoi: { lat: 21.0285, lng: 105.8542 }, "Ha Long": { lat: 20.9101, lng: 107.1839 },
  "Hoi An": { lat: 15.8801, lng: 108.3380 }, "Da Nang": { lat: 16.0544, lng: 108.2022 },
  HCMC: { lat: 10.8231, lng: 106.6297 }, "Phu Quoc": { lat: 10.2899, lng: 103.9840 },
  // Thailand
  Bangkok: { lat: 13.7563, lng: 100.5018 }, "Chiang Mai": { lat: 18.7883, lng: 98.9853 },
  Krabi: { lat: 8.0863, lng: 98.9063 }, Phuket: { lat: 7.8804, lng: 98.3923 },
  "Koh Samui": { lat: 9.5120, lng: 100.0136 },
  // Maldives
  "Malé": { lat: 4.1755, lng: 73.5093 }, "Baa Atoll": { lat: 5.2000, lng: 73.0700 },
  "S.Ari": { lat: 3.8000, lng: 72.8500 }, Addu: { lat: -0.6300, lng: 73.1000 },
  // Sri Lanka
  Sigiriya: { lat: 7.9570, lng: 80.7603 }, Kandy: { lat: 7.2906, lng: 80.6337 },
  Ella: { lat: 6.8667, lng: 81.0466 }, Galle: { lat: 6.0535, lng: 80.2210 },
  Mirissa: { lat: 5.9483, lng: 80.4589 },
  // New Zealand
  Auckland: { lat: -36.8485, lng: 174.7633 }, Rotorua: { lat: -38.1368, lng: 176.2497 },
  Queenstown: { lat: -45.0312, lng: 168.6626 }, Wanaka: { lat: -44.7032, lng: 169.1321 },
  Christchurch: { lat: -43.5321, lng: 172.6362 },
};

// Destinations the builder supports (have both areas and cityVibes coverage).
export const BUILD_DESTS = Object.keys(destAreas);

// One-to-two line caption combining the vibe with who it's for (full-screen view).
export const destCaption = {
  Bali: "Temples, rice terraces and beach clubs. Culture, nature and beach in one trip.",
  Vietnam: "Lantern towns, limestone bays and unreal street food. Great for explorers who love cities and scenery.",
  Thailand: "Grand temples, islands and night markets. Easy beaches plus buzzy cities, great for first-timers.",
  Maldives: "Overwater villas and glass-clear lagoons. A quiet, romantic island switch-off.",
  "Sri Lanka": "Tea hills, rock forts and golden beaches. Lots of variety in one compact, easy loop.",
  "New Zealand": "Fiords, alps and vineyards. Big scenery and proper adventure for active couples.",
};

// Light social proof for the picker.
export const destSocial = {
  Bali: { trending: true, booked: "3 hrs ago" },
  Vietnam: { trending: true, booked: "22 hrs ago" },
  Thailand: { trending: false, booked: "1 day ago" },
  Maldives: { trending: true, booked: "6 hrs ago" },
  "Sri Lanka": { trending: false, booked: "2 days ago" },
  "New Zealand": { trending: false, booked: "yesterday" },
};

// Short visa label derived from destData (e.g. "Visa on Arrival", "E-Visa required").
export function visaShort(dest) {
  const v = destData[dest]?.visa || "";
  return v.split(/[(.]/)[0].trim() || "Check visa rules";
}

// First customer testimonial for a destination, for the picker card.
export function testimonialFor(dest) {
  return reviews.find(r => r.dest === dest) || null;
}

// ─── small utils ───
export function formatINR(num) {
  const s = Math.round(num).toString();
  // Indian grouping: last 3 digits, then pairs.
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  return rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
}

// Month rating for the dates strip: "peak" | "shoulder" | "off".
export function monthRating(dest, monthIdx) {
  const m = MONTHS[monthIdx];
  const meta = destMeta[dest];
  if (!meta) return "shoulder";
  if (meta.peak.includes(m)) return "peak";
  if (meta.shoulder.includes(m)) return "shoulder";
  return "off";
}
export { MONTHS };

// Hero/area imagery, reusing existing pools (stayAreas for Bali, actImgs else).
export function areaImg(dest, city, idx = 0) {
  const dd = destData[dest];
  const sa = dd?.stayAreas?.find(a => a.name === city);
  if (sa?.img) return sa.img;
  const pool = dd?.actImgs || [];
  return pool[idx % (pool.length || 1)] || dd?.hero;
}

export function destHero(dest) {
  return destData[dest]?.hero || destData[dest]?.card;
}

// Top activities for an area, pulled from cityVibes (one per vibe, up to 4).
export function topActivities(city, limit = 4) {
  const vibes = cityVibes[city] || [];
  const out = [];
  vibes.forEach(v => { if (v.activities[0]) out.push(v.activities[0]); });
  return out.slice(0, limit);
}

export function areaCrowd(dest, city) {
  return destAreas[dest]?.find(a => a.city === city)?.crowd || "Mixed";
}

// ─── route ───
// A complete recommended route that sums to `nights`, in the curated order.
export function recommendedRoute(dest, nights) {
  const areas = destAreas[dest] || [];
  const route = [];
  let remaining = nights;
  for (const a of areas) {
    if (remaining <= 0) break;
    const n = Math.min(a.n, remaining);
    if (n > 0) { route.push({ city: a.city, n }); remaining -= n; }
  }
  if (route.length === 0 && areas[0]) route.push({ city: areas[0].city, n: nights });
  // Any leftover nights land on the last stop so the route always balances.
  if (remaining > 0 && route.length) route[route.length - 1].n += remaining;
  return route;
}

export const routeNights = (route) => route.reduce((s, r) => s + r.n, 0);

// ─── activities ───
// Pool grouped by route city, each activity tagged with its vibe and whether it
// matches the trip's chosen vibes (those rank first / are recommended).
export function activityPool(dest, route, selectedVibes = []) {
  const matchLabels = new Set(
    VIBES.filter(v => selectedVibes.includes(v.key)).flatMap(v => v.match)
  );
  return route.map((stop) => {
    const vibes = cityVibes[stop.city] || [];
    const seen = new Set();
    const acts = [];
    vibes.forEach((v) => {
      v.activities.forEach((name, i) => {
        if (seen.has(name)) return;
        seen.add(name);
        acts.push({
          id: `${stop.city}::${name}`,
          city: stop.city,
          name,
          vibe: v.vibe,
          recommended: matchLabels.size > 0 && matchLabels.has(v.vibe),
          img: areaImg(dest, stop.city, i) || null,
        });
      });
    });
    // Recommended first, stable otherwise.
    acts.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    return { city: stop.city, activities: acts };
  });
}

// One flat, de-duped list of activities across the whole route, ranked best-first
// (recommended, then round-robin across cities so the top picks feel varied).
export function flatActivities(dest, route, selectedVibes = []) {
  const pool = activityPool(dest, route, selectedVibes);
  const out = [];
  const seen = new Set();
  const push = (a) => { if (a && !seen.has(a.id)) { seen.add(a.id); out.push(a); } };
  // recommended ones first (city order)
  pool.forEach(g => g.activities.forEach(a => { if (a.recommended) push(a); }));
  // then interleave the rest round-robin so no single city dominates the top
  const queues = pool.map(g => g.activities.filter(a => !a.recommended));
  for (let i = 0; i < Math.max(0, ...queues.map(q => q.length)); i++) {
    queues.forEach(q => push(q[i]));
  }
  return out;
}

// Pre-select a small starter set: the top recommended activity in each city,
// capped so the picker opens with sensible defaults the user can change.
export function defaultPicks(dest, route, selectedVibes = [], cap = 4) {
  const pool = activityPool(dest, route, selectedVibes);
  const picks = new Set();
  // one per city first
  pool.forEach((g) => { if (g.activities[0]) picks.add(g.activities[0].id); });
  // then fill toward cap with more recommended ones
  pool.flatMap(g => g.activities).forEach((a) => {
    if (picks.size >= cap) return;
    if (a.recommended) picks.add(a.id);
  });
  return [...picks].slice(0, cap);
}

// ─── price ───
// Indicative per-person base; the itinerary screen multiplies by travellers for
// the trip total. Scales the destination's start price with trip length.
export function estimatePerPerson(dest, nights) {
  const start = Number(String(destData[dest]?.startPrice || "50000").replace(/,/g, "")) || 50000;
  const baseNights = destMeta[dest]?.defaultNights || 7;
  const perPerson = start * (0.55 + 0.45 * (nights / baseNights));
  return Math.round(perPerson / 500) * 500;
}

// ─── the synthesis ───

const TRANSFER_CAR_IMG = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=320&h=320&q=80&auto=format&fit=crop";

// ─── Day shape for a built trip ───
//
// A synthesized trip used to schedule the same three tours on every day of a
// stay, including the day you land and the day you fly home. That is not a plan
// anybody would send a couple. This lays the week out the way it really runs:
//
//   day 1         land, transfer in, and the rest of the day is yours
//   longest stay  one free day, since three nights in one city does not mean
//                 three days of tours
//   last day      checkout and the transfer to the airport
//   new city      gets its inter-city transfer on the day you arrive
//
// Keyed by day number, matching the hand-written dayMeta on the seed trips.
export function buildDayMeta(dest, route, nights) {
  const meta = {};
  // The screen lays a trip out as one day per night, so the last night is also
  // the day you fly home.
  const lastDay = nights;
  const airport = `${destData[dest]?.name || dest} airport`;
  const hotel = (city) => `${city} Grand Resort`;
  const ideasFor = (city) => topActivities(city, 3).map((t, i) => ({
    title: t, caption: `In and around ${city}`, photo: areaImg(dest, city, i),
  }));

  // Day 1: land and transfer to the first hotel.
  meta[1] = {
    leisure: true,
    transfers: [{
      from: airport, to: hotel(route[0]?.city), vehicle: "car", sharing: "Private",
      duration: "1.5 hrs", name: "Airport private transfer", img: TRANSFER_CAR_IMG,
      desc: `Private car. Land and get taken straight to your ${route[0]?.city} hotel.`,
    }],
    ideas: ideasFor(route[0]?.city),
  };

  // Inter-city transfers, and the day each stay begins on.
  const stayStart = [];
  let dayNum = 1;
  route.forEach((stop, si) => {
    stayStart.push(dayNum);
    if (si > 0) {
      meta[dayNum] = {
        ...(meta[dayNum] || {}),
        transfers: [{
          from: hotel(route[si - 1].city), to: hotel(stop.city), vehicle: "van", sharing: "Shared",
          duration: "2 hrs", name: `Transfer to ${stop.city}`, img: TRANSFER_CAR_IMG,
          desc: `Shared van. The drive across from ${route[si - 1].city} to ${stop.city}.`,
        }],
      };
    }
    dayNum += stop.n;
  });

  // One free day, in the longest stay. Three nights in a city does not mean
  // three days of tours, but a week with three empty days is not a trip either,
  // so this stays at one.
  let longest = -1;
  route.forEach((stop, si) => {
    if (stop.n >= 3 && (longest === -1 || stop.n > route[longest].n)) longest = si;
  });
  if (longest !== -1) {
    const freeDay = stayStart[longest] + 1;
    if (freeDay > 1 && freeDay < lastDay && !meta[freeDay]) {
      meta[freeDay] = { leisure: true, ideas: ideasFor(route[longest].city) };
    }
  }

  // Last day: checkout and fly home.
  meta[lastDay] = {
    departure: true,
    transfers: [{
      from: hotel(route[route.length - 1]?.city), to: airport, vehicle: "car", sharing: "Private",
      duration: "1 hr", name: "Departure transfer", img: TRANSFER_CAR_IMG,
      desc: "Private car. We pick you up in time for your flight home.",
    }],
  };

  return meta;
}

let buildSeq = 0;
// Build a complete itinerary object the existing itinerary screen renders as-is.
export function synthesizeItinerary({ dest, nights, route, picksByCity, vibes, startDate, party, id: idOverride }) {
  const days = route.map((stop) => {
    const chosen = (picksByCity?.[stop.city] || []).slice(0, 3);
    const fallback = topActivities(stop.city, 3);
    const sub = (chosen.length ? chosen : fallback).join(" · ");
    return { city: stop.city, n: stop.n, sub };
  });
  const travellers = party ? party.couples * 2 + (party.adults || 0) + (party.kids || 0) : 2;
  const perPerson = estimatePerPerson(dest, nights);
  const meta = destMeta[dest] || {};
  const dominantCrowd = areaCrowd(dest, route[0]?.city);
  // High numeric id keeps day-option seeds working and never collides with the
  // seed itineraries (whose ids are <= ~106). A route-change reuses the old id.
  const id = idOverride ?? (900000 + (buildSeq++));
  return {
    id,
    custom: true,
    dest,
    vibe: vibes?.[0] ? VIBES.find(v => v.key === vibes[0])?.label || "Custom" : "Custom",
    name: route.map(r => r.city).join(" · "),
    nights,
    price: formatINR(perPerson),
    route: route.map(r => ({ city: r.city, n: r.n })),
    days,
    veg: party?.veg || false,
    img: areaImg(dest, route[0]?.city, 0) || destHero(dest),
    pace: vibes?.includes("Adventure") ? "Active" : vibes?.includes("Relax") ? "Unhurried" : "Balanced",
    crowds: dominantCrowd,
    vegFood: "High",
    travellers,
    partySize: party || { couples: 1, adults: 0, kids: 0 },
    startDate: startDate || null,
    dayMeta: buildDayMeta(dest, route, nights),
  };
}
