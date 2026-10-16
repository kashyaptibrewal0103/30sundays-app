import { allItineraries, destData, maldivesImgs } from "../data";
import { SIX } from "./homeV3Data";

// ─── Real couples, real itineraries ───
//
// Trips other couples have actually booked, newest first. Everything here is
// built from the itineraries the app already sells, so a card can never show a
// trip we cannot open: the name, nights, route and price are the itinerary's
// own. Only the traveller, the city and how long ago they booked are demo.
//
// Three per destination, picked for a spread of lengths rather than a spread
// of styles. Three cards all saying "5 nights" tells a couple nothing; 5, 7
// and 12 tells them we do short breaks and long hauls both.

// The six we sell, in the order the home screen lists them.
const DESTS = ["Vietnam", "Bali", "Thailand", "New Zealand", "Maldives", "Mauritius"];

// ─── Maldives and Mauritius ───
//
// The itinerary catalogue has nothing for these two yet, so their trips are
// written out here instead of read off a real itinerary. That is the one place
// this file invents a trip, and it is why their cards open the destination
// screen rather than an itinerary that does not exist.
const MAURITIUS_IMG = SIX.find((d) => d.name === "Mauritius")?.img;

const EXTRA = [
  { dest: "Maldives", vibe: "Relaxed", nights: 4, price: "89,998", img: maldivesImgs[1],
    route: [{ city: "Malé", n: 1 }, { city: "Baa Atoll", n: 3 }] },
  { dest: "Maldives", vibe: "Relaxed", nights: 6, price: "1,24,998", img: maldivesImgs[2],
    route: [{ city: "Malé", n: 1 }, { city: "Ari Atoll", n: 2 }, { city: "Baa Atoll", n: 3 }] },
  { dest: "Maldives", vibe: "Offbeat", nights: 8, price: "1,68,498", img: maldivesImgs[3],
    route: [{ city: "Malé", n: 1 }, { city: "Dhigurah", n: 3 }, { city: "Baa Atoll", n: 4 }] },
  { dest: "Mauritius", vibe: "Relaxed", nights: 5, price: "94,998", img: MAURITIUS_IMG,
    route: [{ city: "Grand Baie", n: 2 }, { city: "Le Morne", n: 3 }] },
  { dest: "Mauritius", vibe: "Explorer", nights: 7, price: "1,18,498", img: MAURITIUS_IMG,
    route: [{ city: "Grand Baie", n: 2 }, { city: "Chamarel", n: 2 }, { city: "Le Morne", n: 3 }] },
  { dest: "Mauritius", vibe: "Offbeat", nights: 9, price: "1,46,998", img: MAURITIUS_IMG,
    route: [{ city: "Port Louis", n: 2 }, { city: "Chamarel", n: 3 }, { city: "Belle Mare", n: 4 }] },
].map((t, i) => ({ ...t, id: null, target: `/destination/${encodeURIComponent(t.dest)}`, key: `x${i}` }));

// One name, not two. A card is a glance, and "Aanya & Rohan from Mumbai"
// spends most of its line on the half nobody reads.
const BOOKERS = [
  ["Aanya", "Mumbai"], ["Karan", "Bengaluru"], ["Meera", "Pune"],
  ["Vivaan", "Delhi"], ["Tara", "Hyderabad"], ["Neil", "Chennai"],
  ["Naina", "Kolkata"], ["Aditya", "Ahmedabad"], ["Diya", "Jaipur"],
  ["Siddharth", "Chandigarh"], ["Nitya", "Kochi"], ["Manav", "Indore"],
  ["Kavya", "Nagpur"], ["Aryan", "Lucknow"], ["Sanya", "Surat"],
];

const WHEN = ["3h ago", "9h ago", "yesterday", "2d ago", "4d ago", "6d ago", "1w ago", "2w ago"];
// Most trips are two adults. A few go as a family, which is the same two
// adults plus two children, so a card showing a child count means something
// when it shows one at all.
const FAMILIES = new Set([4, 11]);

const num = (price) => Number(String(price).replace(/[^0-9]/g, ""));

// ─── A different photo on every card ───
//
// The itinerary's own image repeats across every trip to the same place, so
// three Bali cards in a row were the same rice terrace three times. Each
// destination keeps a pool and the cards take from it in turn, so no two cards
// for one country ever show the same picture.
function photoPool(dest) {
  const d = destData[dest];
  if (d) {
    return [...new Set([d.hero, d.card, d.circle, ...(d.actImgs || [])].filter(Boolean))];
  }
  // Mauritius has no entry of its own yet and borrows the same shots the
  // destination grid already uses for it.
  return maldivesImgs.slice(2, 8);
}

// Three per destination with three different lengths: the shortest, the
// longest, and whatever sits nearest the middle.
function pick() {
  const out = [];
  DESTS.forEach((dest) => {
    const written = EXTRA.filter((t) => t.dest === dest);
    if (written.length) { out.push(...written); return; }

    const byNights = new Map();
    allItineraries
      .filter((it) => it.dest === dest)
      .sort((a, b) => a.nights - b.nights || num(a.price) - num(b.price))
      .forEach((it) => { if (!byNights.has(it.nights)) byNights.set(it.nights, it); });

    const lens = [...byNights.values()];
    if (lens.length <= 3) { out.push(...lens); return; }
    out.push(lens[0], lens[Math.floor(lens.length / 2)], lens[lens.length - 1]);
  });
  return out;
}

const seen = {};
export const BOOKED_TRIPS = pick().map((it, i) => {
  const [who, city] = BOOKERS[i % BOOKERS.length];
  const family = FAMILIES.has(i);
  const pool = photoPool(it.dest);
  seen[it.dest] = (seen[it.dest] || 0);
  const img = pool[seen[it.dest] % (pool.length || 1)] || it.img;
  seen[it.dest] += 1;
  return {
    id: it.id,
    key: it.key || `i${it.id}`,
    // Where the card goes. Itineraries open themselves; the two destinations
    // with no itineraries yet open their destination screen.
    target: it.target || `/itinerary/${it.id}`,
    dest: it.dest,
    style: it.vibe,
    nights: it.nights,
    price: it.price,
    priceValue: num(it.price),
    img,
    route: (it.route || []).map((r) => r.city),
    legs: (it.route || []).map((r) => ({ city: r.city, n: r.n })),
    who,
    city,
    when: WHEN[i % WHEN.length],
    travellers: family ? 4 : 2,
    adults: 2,
    kids: family ? 2 : 0,
    party: family ? "Family" : "Couple",
  };
});

// ─── The filters ───
//
// Where, then what we can spend. That is the order a couple decides in, and
// there is no third question a home screen has room to ask.
export const DEST_OPTIONS = [...DESTS];

// Budget is three chips rather than a dropdown. There are only three bands and
// a couple already knows which one they are in, so making them open a sheet to
// say so is a tap spent on nothing.
export const BUDGET_CHIPS = [
  { label: "Under ₹50k", test: (t) => t.priceValue < 50000 },
  { label: "₹50k to ₹1L", test: (t) => t.priceValue >= 50000 && t.priceValue < 100000 },
  { label: "₹1L to ₹2L", test: (t) => t.priceValue >= 100000 && t.priceValue < 200000 },
  { label: "₹2L+", test: (t) => t.priceValue >= 200000 },
];

// How the list can be ordered. "Recommended" is the order the rail already
// uses: destination by destination, shortest trip first.
export const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "price_asc", label: "Price, low to high" },
  { key: "price_desc", label: "Price, high to low" },
];

export function sortTrips(list, sort) {
  if (sort === "price_asc") return [...list].sort((a, b) => a.priceValue - b.priceValue);
  if (sort === "price_desc") return [...list].sort((a, b) => b.priceValue - a.priceValue);
  return list;
}

// Trip style is on the card, not in the filters. Nobody arrives at a home
// screen having already decided they want an Offbeat week.

export function filterTrips(dests, budgets) {
  const picked = BUDGET_CHIPS.filter((b) => budgets?.includes?.(b.label));
  return BOOKED_TRIPS.filter((t) =>
    (!dests?.length || dests.includes(t.dest)) &&
    (!picked.length || picked.some((b) => b.test(t)))
  );
}

// ─── The trips that stop in one region ───
//
// Same card as the home screen, same rules: everything but the traveller and
// how long ago they booked comes off a real itinerary, so a card here can
// always be opened. Keyed off the itinerary id rather than its position, so
// the same trip shows the same traveller wherever it appears.
function spin(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function tripsThroughCity(dest, city) {
  const pool = photoPool(dest);
  return allItineraries
    .filter((it) => it.dest === dest && (it.route || []).some((r) => r.city === city))
    .map((it, i) => {
      const h = spin(`${it.id}`);
      return {
        key: `r${it.id}`,
        target: `/itinerary/${it.id}`,
        dest: it.dest,
        style: it.vibe,
        nights: it.nights,
        price: it.price,
        priceValue: num(it.price),
        // A different photo on each card, the way the home rail does it.
        img: pool[(h + i) % (pool.length || 1)] || it.img,
        legs: (it.route || []).map((r) => ({ city: r.city, n: r.n })),
        who: BOOKERS[h % BOOKERS.length][0],
        when: WHEN[h % WHEN.length],
        adults: 2,
        kids: h % 5 === 0 ? 2 : 0,
        party: h % 5 === 0 ? "Family" : "Couple",
      };
    });
}
