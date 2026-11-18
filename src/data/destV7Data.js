// ─── The destination page, v7, for every country we sell ───
//
// Everything the page shows that the app did not already hold: the intro, the
// flights from Indian cities, the visa, the money, what travellers liked, the
// questions. Facts are as of November 2026 and are samples until the team
// checks them; visa rules in particular move often.
//
// Seasons, weather, areas, activities, trips and photos all come from the
// app's own data, so this page can never disagree with the planner.

import { destData, customerPhotos, maldivesImgs, allItineraries } from "../data";
import { destMeta, destAreas, cityCoords } from "./buildData";

const CDN = "https://cdn.30sundays.club/app_content";

export const AS_OF = "November 2026";

export const V7_DESTS = ["Bali", "Thailand", "Vietnam", "Maldives", "Sri Lanka", "Mauritius", "New Zealand"];

// Mauritius has no planner metadata yet, so its seasons and areas live here.
const MAURITIUS_SEASONS = {
  peak: ["Sep", "Oct", "Nov", "Dec"],
  shoulder: ["Apr", "May", "Jun", "Jul", "Aug"],
};
const MAURITIUS_AREAS = [
  { city: "Grand Baie", n: 2, tag: "Beaches, boats and nightlife", lat: -20.0106, lng: 57.5800 },
  { city: "Belle Mare", n: 2, tag: "Long calm beach, big resorts", lat: -20.1900, lng: 57.7700 },
  { city: "Le Morne", n: 2, tag: "Mountain, lagoon, kitesurfing", lat: -20.4560, lng: 57.3100 },
  { city: "Flic en Flac", n: 2, tag: "Sunsets, dolphins, snorkelling", lat: -20.2740, lng: 57.3630 },
  { city: "Port Louis", n: 0, tag: "Markets and the waterfront", lat: -20.1609, lng: 57.5012 },
];

export function seasonsFor(dest) {
  if (dest === "Mauritius") return MAURITIUS_SEASONS;
  const m = destMeta[dest];
  return m ? { peak: m.peak, shoulder: m.shoulder } : { peak: [], shoulder: [] };
}

export function areasFor(dest) {
  if (dest === "Mauritius") return MAURITIUS_AREAS;
  return (destAreas[dest] || []).map((a) => ({
    city: a.city, n: a.n, tag: a.tag,
    lat: cityCoords[a.city]?.lat, lng: cityCoords[a.city]?.lng,
  }));
}

// Pictures we never show: we tell travellers to skip the Bali swing and the
// Handara gate, so neither appears anywhere on the page.
export const isBanned = (src = "") => /swing|handara/i.test(src);

// ─── Per destination ───
//
// flights: one row per Indian city. kind is "Direct" or "1 layover". When no
// row is direct, the page says "No direct flights from India" above them.
// money: two conversions, written the way people say them.
export const V7 = {
  Bali: {
    rating: 4.6, reviews: "1,000+",
    intro: "Bali is one island with three holidays in it. Inland around Ubud it is rice terraces, temples and jungle villas. The south coast is beach clubs, surf and sunset dinners on the cliffs. A short boat ride away, Nusa Penida has the cliffs and clear water from the photos. Easy for first-timers, with vegetarian and Indian food everywhere.",
    vibes: [["Islands", `/vibes/bali-islands.jpg`, `${CDN}/bali/kelingking_beach_65.jpg`, `${CDN}/bali/tree_house_nusa_penida_3.jpg`], ["Temples", `/vibes/bali-temples.jpg`, `/vibes/bali-temples-2.jpg`, `/vibes/bali-temples-3.jpg`], ["Beaches", `/vibes/bali-beaches.jpg`, `/vibes/bali-beaches-2.jpg`], ["Rice terraces", `${CDN}/bali/tegallalang_rice_fields_4.jpg`, `/vibes/bali-rice-2.jpg`], ["Volcanoes", `/vibes/bali-volcanoes.jpg`], ["Nightlife", `/vibes/bali-nightlife.jpg`, `/vibes/bali-nightlife-2.jpg`, `/vibes/bali-nightlife-3.jpg`]],
    flights: [
      { city: "Delhi", code: "DEL", to: "DPS", kind: "Direct", time: "About 7 hrs" },
      { city: "Bengaluru", code: "BLR", to: "DPS", kind: "Direct", time: "About 7 hrs" },
      { city: "Mumbai", code: "BOM", to: "DPS", kind: "1 layover", time: "9 to 11 hrs" },
    ],
    flightNote: "Other cities connect through Singapore or Kuala Lumpur. We help you pick the flight.",
    airports: [{ name: "Denpasar (DPS)", note: "Bali's only international airport, in the south" }],
    visa: {
      stay: "Up to 30 days", short: "On arrival", title: "Visa on arrival",
      lines: ["Stay up to 30 days. You get it at the airport when you land, in a few minutes.",
              "Or get an e-Visa online before you fly. It takes 1 to 3 days."],
    },
    currency: { name: "Rupiah (IDR)", a: ["₹1", "Rp 188"], b: ["$1", "Rp 16,500"],
      note: "Rupees are not taken in Bali. Carry US dollars and change them at a money changer there." },
    liked: ["Ubud rice terraces", "Nusa Penida day trip", "Easy vegetarian food"],
    disliked: ["Long drives between areas", "Crowds at the popular spots"],
    peers: ["Thailand", "Vietnam"],
  },
  Thailand: {
    rating: 4.6, reviews: "1,000+",
    intro: "Thailand is two trips in one. Bangkok is temples, rooftop bars and night markets that run till late. The south is islands: Phuket and Krabi for long beaches, Phi Phi for the boat days and the clear water. It is close, easy to get around, and the food works for every kind of eater.",
    vibes: [["Islands", `${CDN}/thailand/pileh_lagoon_439.jpg`], ["Beaches", `${CDN}/thailand/long_beach_koh_phi_phi_468.jpg`], ["Temples", `${CDN}/thailand/big_buddha_temple_koh_samui_459.jpg`], ["Waterfalls", `${CDN}/thailand/angel_waterfall_park_493.jpg`]],
    flights: [
      { city: "Delhi", code: "DEL", to: "BKK", kind: "Direct", time: "About 4.5 hrs" },
      { city: "Mumbai", code: "BOM", to: "BKK", kind: "Direct", time: "About 4.5 hrs" },
      { city: "Kolkata", code: "CCU", to: "BKK", kind: "Direct", time: "About 2.5 hrs" },
      { city: "Bengaluru", code: "BLR", to: "BKK", kind: "Direct", time: "About 4 hrs" },
    ],
    flightNote: "Most Indian cities fly direct to Bangkok, some to Phuket too. We help you pick the flight.",
    airports: [
      { name: "Bangkok (BKK, DMK)", note: "Most flights from India land here" },
      { name: "Phuket (HKT)", note: "For the islands in the south" },
      { name: "Krabi (KBV)", note: "Close to Ao Nang and Railay" },
    ],
    visa: {
      stay: "Up to 30 days", short: "Visa-free", title: "Visa-free",
      lines: ["Stay up to 30 days for a holiday. Nothing to apply for in advance.",
              "Fill in the free digital arrival card online in the 3 days before you land."],
    },
    currency: { name: "Baht (THB)", a: ["฿1", "₹2.7"], b: ["$1", "฿32.5"],
      note: "Rupees are not taken. Carry US dollars or a forex card; exchange counters at the airport are fine." },
    liked: ["Phi Phi boat day", "Bangkok street food", "Easy to get around"],
    disliked: ["Busy beaches in season", "Long ferry queues"],
    peers: ["Bali", "Vietnam"],
  },
  Vietnam: {
    rating: 4.7, reviews: "800+",
    intro: "Vietnam runs north to south, and our trips do too. Hanoi is old streets and coffee, Ha Long Bay is a night on the water among limestone islands, Hoi An is lanterns and tailors. It is great value, the scenery changes every few days, and the food is a reason to go on its own.",
    vibes: [["Ha Long Bay", `${CDN}/vietnam/kayaking_halong_bay_500.jpg`, `${CDN}/vietnam/sunrise_tai_chi_ha_long_bay_499.jpg`], ["Mountains", `${CDN}/vietnam/sapa_valley_501.jpg`], ["Islands", `${CDN}/vietnam/fingernail_island_497.jpg`, `${CDN}/vietnam/xuong_island_496.jpg`], ["Food", `${CDN}/vietnam/nem_cuon_cooking_class_ha_long_bay_498.jpg`], ["Culture", `${CDN}/vietnam/hoi_an_memories_show_502.jpg`], ["Sunsets", `${CDN}/vietnam/kissing_bridge_495.jpg`]],
    flights: [
      { city: "Delhi", code: "DEL", to: "HAN", kind: "Direct", time: "About 5 hrs" },
      { city: "Mumbai", code: "BOM", to: "SGN", kind: "Direct", time: "About 5.5 hrs" },
      { city: "Kolkata", code: "CCU", to: "HAN", kind: "Direct", time: "About 3 hrs" },
    ],
    flightNote: "Trips usually fly into Hanoi and out of Ho Chi Minh City, or the other way round.",
    airports: [
      { name: "Hanoi (HAN)", note: "In the north, for Ha Long Bay" },
      { name: "Ho Chi Minh City (SGN)", note: "In the south, for the Mekong" },
      { name: "Da Nang (DAD)", note: "In the middle, for Hoi An" },
    ],
    visa: {
      stay: "Up to 90 days", short: "e-Visa", title: "e-Visa",
      lines: ["Stay up to 90 days. Apply online before you fly.",
              "It takes 3 to 7 working days, so apply at least 2 weeks ahead."],
    },
    currency: { name: "Dong (VND)", a: ["₹1", "₫300"], b: ["$1", "₫26,300"],
      note: "Rupees are not taken. US dollars change easily in Hanoi and Ho Chi Minh City." },
    liked: ["Ha Long Bay overnight", "Hoi An old town", "Great value"],
    disliked: ["Long transfer days", "Cold in the north in winter"],
    peers: ["Thailand", "Bali"],
  },
  Maldives: {
    rating: 4.8, reviews: "600+",
    intro: "The Maldives is a holiday you take at your resort. Each one sits on its own island, with a lagoon, a reef to snorkel and a villa over the water or on the beach. You fly into Malé and finish the journey by seaplane or speedboat. Short to reach from India, and as calm as a trip gets.",
    vibes: [["Overwater villas", `${CDN}/hotels/maldives/hero-images/3_hero.webp`, `${CDN}/hotels/maldives/hero-images/12_hero.webp`, `${CDN}/hotels/maldives/hero-images/37_hero.webp`], ["Lagoons", `${CDN}/hotels/maldives/hero-images/134_hero.webp`, `${CDN}/hotels/maldives/hero-images/13_hero.webp`], ["Private islands", `${CDN}/hotels/maldives/hero-images/48_hero.webp`, `${CDN}/hotels/maldives/hero-images/126_hero.webp`, `${CDN}/hotels/maldives/hero-images/16_hero.webp`], ["Sunsets", `${CDN}/hotels/maldives/hero-images/11_hero.webp`], ["Infinity pools", `${CDN}/hotels/maldives/hero-images/15_hero.webp`]],
    flights: [
      { city: "Bengaluru", code: "BLR", to: "MLE", kind: "Direct", time: "About 1.5 hrs" },
      { city: "Mumbai", code: "BOM", to: "MLE", kind: "Direct", time: "About 3 hrs" },
      { city: "Delhi", code: "DEL", to: "MLE", kind: "Direct", time: "About 4 hrs" },
      { city: "Kochi", code: "COK", to: "MLE", kind: "Direct", time: "About 1 hr" },
    ],
    flightNote: "Then a seaplane or speedboat to your resort. We time it with your flight.",
    airports: [{ name: "Malé (MLE)", note: "The international airport, on its own island" }],
    visa: {
      stay: "Up to 30 days", short: "Free on arrival", title: "Visa on arrival, free",
      lines: ["Stay up to 30 days. Stamped at the airport when you land.",
              "Fill in the arrival form online in the 4 days before you fly."],
    },
    currency: { name: "Rufiyaa (MVR)", a: ["Rf 1", "₹5.7"], b: ["$1", "Rf 15.4"],
      note: "Resorts charge in US dollars, so carry dollars or a card. You rarely need rufiyaa." },
    liked: ["Overwater villas", "House reef snorkelling", "Very easy trip"],
    disliked: ["Pricey food and drinks", "Little to do off the resort"],
    peers: ["Mauritius", "Bali"],
  },
  "Sri Lanka": {
    rating: 4.6, reviews: "500+",
    intro: "Sri Lanka packs a lot into a small island. Tea hills around Ella and Nuwara Eliya, the rock fort at Sigiriya, safaris at Yala, and a south coast of beaches and old Galle Fort. Distances are short, flights from India are quicker than most domestic ones, and the food feels close to home.",
    vibes: [["Wildlife", `${CDN}/srilanka/elephant_transit_home_udawalawe_SLA00070.jpg`], ["Beaches", `${CDN}/srilanka/taprobane_island_viewpoint_SLA00057.jpg`, `${CDN}/srilanka/cinnamon_island_bentota_SLA00063.jpg`], ["Ancient cities", `${CDN}/srilanka/hot_air_balloon_flight_sigiriya_SLA00062.jpg`, `${CDN}/srilanka/yatala_vehera_tissamaharama_SLA00067.jpg`], ["Temples", `${CDN}/srilanka/koneswaram_temple_trincomalee_SLA00071.jpg`, `${CDN}/srilanka/bhadrakali_amman_temple_trincomalee_SLA00072.jpg`, `${CDN}/srilanka/katharagama_temple_SLA00069.jpg`], ["Surfing", `${CDN}/srilanka/surfing_lessons_south_coast_SLA00061.jpg`], ["Hill country", `${CDN}/srilanka/victoria_lake_kandy_SLA00074.jpg`]],
    flights: [
      { city: "Chennai", code: "MAA", to: "CMB", kind: "Direct", time: "About 1.5 hrs" },
      { city: "Bengaluru", code: "BLR", to: "CMB", kind: "Direct", time: "About 1.5 hrs" },
      { city: "Mumbai", code: "BOM", to: "CMB", kind: "Direct", time: "About 2.5 hrs" },
      { city: "Delhi", code: "DEL", to: "CMB", kind: "Direct", time: "About 3.5 hrs" },
    ],
    flightNote: "Flights from most Indian metros are direct to Colombo.",
    airports: [
      { name: "Colombo (CMB)", note: "Almost every flight lands here" },
      { name: "Mattala (HRI)", note: "In the south, few flights" },
    ],
    visa: {
      stay: "Up to 30 days", short: "Free online ETA", title: "Online ETA, free",
      lines: ["Stay up to 30 days. Apply online before you fly; there is no fee.",
              "Approval usually comes in 1 to 3 days."],
    },
    currency: { name: "Rupee (LKR)", a: ["₹1", "Rs 3.4"], b: ["$1", "Rs 300"],
      note: "Indian rupees are not taken in shops. Carry US dollars and change them at a bank." },
    liked: ["The train to Ella", "Yala safari", "Food close to home"],
    disliked: ["Winding hill roads", "Hot in the cities"],
    peers: ["Maldives", "Thailand"],
  },
  Mauritius: {
    rating: 4.7, reviews: "400+",
    intro: "Mauritius is beaches with more to do than lie on them. Resorts sit on calm lagoons ringed by a reef, and inland there are mountains, waterfalls and the seven coloured earths. It feels easy for Indian travellers, with familiar food and Hindi widely understood, and it suits a slow trip as well as an active one.",
    vibes: [["Dolphins", `https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=900&q=80&auto=format&fit=crop`], ["Reefs", `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80&auto=format&fit=crop`], ["Waterfalls", `https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=900&q=80&auto=format&fit=crop`], ["Resorts", `https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=900&q=80&auto=format&fit=crop`]],
    flights: [
      { city: "Mumbai", code: "BOM", to: "MRU", kind: "Direct", time: "About 6 hrs" },
      { city: "Delhi", code: "DEL", to: "MRU", kind: "Direct", time: "About 7.5 hrs" },
      { city: "Bengaluru", code: "BLR", to: "MRU", kind: "1 layover", time: "9 to 11 hrs" },
    ],
    flightNote: "Other cities connect through Mumbai or Dubai. We help you pick the flight.",
    airports: [{ name: "Plaisance (MRU)", note: "The only international airport, in the south east" }],
    visa: {
      stay: "Up to 90 days", short: "Visa-free", title: "Visa-free",
      lines: ["Stay up to 90 days. Stamped at the airport when you land.",
              "Keep your return ticket and hotel booking handy."],
    },
    currency: { name: "Rupee (MUR)", a: ["Rs 1", "₹1.9"], b: ["$1", "Rs 46"],
      note: "Indian rupees are not taken. Carry US dollars or a card; both work well." },
    liked: ["Catamaran day", "Calm lagoons", "Familiar food"],
    disliked: ["Long drives across the island", "Windy in July and August"],
    peers: ["Maldives", "Sri Lanka"],
  },
  "New Zealand": {
    rating: 4.8, reviews: "300+",
    intro: "New Zealand is a road trip through very big scenery. The North Island has Hobbiton, Rotorua's hot springs and Auckland's harbour. The South Island has Queenstown, the fiords at Milford Sound and the glaciers on the west coast. It is far and it is worth it; give it at least ten nights.",
    vibes: [["Mountains", `${CDN}/new_zealand/lake_matheson_NZA00064.jpg`], ["Self drive", `${CDN}/new_zealand/haast_pass_NZA00065.jpg`], ["Adventure", `${CDN}/new_zealand/aratiatia_rapids_NZA00057.jpg`], ["Lakes", `${CDN}/new_zealand/moke_lake_NZA00054.jpg`, `${CDN}/new_zealand/lake_taupo_NZA00055.jpg`, `${CDN}/new_zealand/lake_hawea_NZA00066.jpg`], ["Fiordland", `${CDN}/new_zealand/te_anau_NZA00060.jpg`], ["Coast", `${CDN}/new_zealand/hole_in_the_rock_NZA00061.jpg`, `${CDN}/new_zealand/roberton_island_NZA00062.jpg`]],
    flights: [
      { city: "Delhi", code: "DEL", to: "AKL", kind: "1 layover", time: "About 16 hrs" },
      { city: "Mumbai", code: "BOM", to: "AKL", kind: "1 layover", time: "About 17 hrs" },
      { city: "Bengaluru", code: "BLR", to: "AKL", kind: "1 layover", time: "About 16 hrs" },
    ],
    flightNote: "Flights connect through Singapore, Kuala Lumpur or Sydney. We help you pick the flight.",
    airports: [
      { name: "Auckland (AKL)", note: "Most flights from India land here" },
      { name: "Christchurch (CHC)", note: "For the South Island" },
      { name: "Queenstown (ZQN)", note: "Mostly flights from Australia" },
    ],
    visa: {
      stay: "Apply about 2 weeks ahead", short: "Visitor visa", title: "Visitor visa",
      lines: ["Apply online before you fly. Most are decided in about 2 weeks.",
              "Apply 6 to 8 weeks ahead to be safe."],
    },
    currency: { name: "NZ dollar (NZD)", a: ["NZ$1", "₹52"], b: ["$1", "NZ$1.7"],
      note: "Cards work almost everywhere. Carry a forex card rather than cash." },
    liked: ["Milford Sound", "Queenstown", "Easy, safe driving"],
    disliked: ["Long drives", "Expensive meals"],
    peers: ["Mauritius", "Vietnam"],
  },
};

// The vibes: what each place is best known for, each with a photograph that
// actually shows it. Bali's come from the destination design; the rest from
// the app's own picture pools. A country with few real photos gets fewer vibes
// rather than a picture of something else.
// A vibe can hold more than one photograph of the same thing: shut its blind
// and open it again, and the next one is there.
export function tilesFor(dest) {
  return (V7[dest]?.vibes || []).map(([label, ...imgs]) => ({ label, img: imgs[0], imgs: imgs.filter((i) => !isBanned(i)) }))
    .filter((t) => t.img && !isBanned(t.img));
}

// The photographs for a destination: its hero, its activity pictures, then a
// few from travellers, never the banned ones.
export function galleryFor(dest) {
  const d = destData[dest] || {};
  const base = [d.hero, d.card, d.circle, ...(d.actImgs || []), ...(dest === "Maldives" ? maldivesImgs : [])];
  const cust = (customerPhotos[dest] || []).slice(0, 4);
  const vibes = (V7[dest]?.vibes || []).flatMap(([, ...imgs]) => imgs);
  // Mauritius's hero is a hotel room, so it opens on its first vibe instead.
  const first = dest === "Mauritius" ? [] : base.slice(0, 1);
  return [...new Set([...first, ...vibes, ...base.slice(1), ...cust].filter(Boolean))].filter((s) => !isBanned(s)).slice(0, 28);
}

// The five questions, answered for this destination.
export function faqFor(dest) {
  const v = V7[dest];
  return [
    { q: "Are flights and visa included in the price?",
      a: `Hotels, private transfers and activities are included. Flights are booked separately so you can pick the timing and airline you prefer; we help you choose. ${v.visa.title}: ${v.visa.lines[0].charAt(0).toLowerCase()}${v.visa.lines[0].slice(1)}` },
    { q: "Can I go solo, or with family and friends?",
      a: `Yes. Every ${dest} trip is planned around who is travelling, from one person to a big group.` },
    { q: "What kind of hotels can I expect?",
      a: "Four and five star stays, picked by our team. You see every hotel before you pay and can change any of them." },
    { q: "How do payments work?",
      a: "A part payment holds the trip, and the rest is due before you travel. You see the full price up front, taxes included." },
    { q: "Can I change the plan after booking?",
      a: "Yes. Tell your trip expert what you want to change and they rework the plan with you." },
  ];
}

// "48,998" -> "₹49K", "1,65,098" -> "₹1.65L"
export function priceShort(s = "") {
  const n = Number(String(s).replace(/[^0-9]/g, ""));
  if (!n) return "";
  if (n >= 100000) return `₹${(n / 100000).toFixed(2).replace(/0$/, "")}L`;
  return `₹${Math.round(n / 1000)}K`;
}

// ─── Itinerary rows, through the page ───
//
// Six rows, each placed beside the part of the page it belongs to, all in the
// trip card from the home page. Picked from what each country's trips actually
// include, so a row never promises something its cards do not have. A row with
// fewer than two trips is not shown.
//   after: facts | todo | places | school | compare  (the real-travellers row
//   sits after Getting there and comes from the booked trips)
const ROW_THEMES = {
  Bali: { act: ["ATV ride", /ATV/i], place: ["Gili Islands", /^Gili/] },
  Thailand: { act: ["Island hopping", /Island hop|Islands|Snorkel/i], place: ["Phi Phi", /^Phi Phi/] },
  Vietnam: { act: ["Snorkelling", /Snorkel/i], place: ["Hoi An", /^Hoi An/] },
  "Sri Lanka": { act: ["Safari", /safari/i], place: ["Ella", /^Ella/] },
  "New Zealand": { act: ["Fiord cruise", /Milford|Fiord/i], place: ["Queenstown", /^Queenstown/] },
  Mauritius: { act: ["Catamaran cruise", /Catamaran/i], place: ["Le Morne", /^Le Morne/] },
  Maldives: { act: ["Water villa", (it) => (it.villas || []).some((v) => /Water/.test(v.type))] },
};
const BOOKERS = [["Aanya", "3h ago"], ["Karan", "yesterday"], ["Meera", "2d ago"], ["Vivaan", "9h ago"], ["Tara", "4d ago"],
  ["Neil", "1w ago"], ["Naina", "yesterday"], ["Aditya", "6d ago"], ["Diya", "2w ago"], ["Kavya", "2d ago"], ["Aryan", "4d ago"], ["Sanya", "1w ago"]];
const amount = (p) => Number(String(p).replace(/[^0-9]/g, ""));
const okTrip = (it) => !/swing|handara/i.test(it.name);

function toCard(it, i, gallery) {
  const [who, when] = BOOKERS[i % BOOKERS.length];
  return {
    id: it.id, key: `r${it.id}-${i}`, target: `/real/${it.id}`, dest: it.dest, style: it.vibe,
    nights: it.nights, price: it.price, img: !it.img || isBanned(it.img) ? gallery[i % gallery.length] : it.img,
    legs: (it.route || []).map((r) => ({ city: r.city, n: r.n })), route: (it.route || []).map((r) => r.city),
    who, when, travellers: 2, adults: 2, kids: 0,
  };
}

// The trips that stay in each place, for the row under Places to visit: it
// shows the trips of whichever place is in view. A route stop counts when it
// is the place or a part of it (Gili covers Gili Trawangan and Gili Air).
export function tripsByArea(dest, gallery) {
  const all = allItineraries.filter((it) => it.dest === dest && okTrip(it));
  let n = 0;
  return Object.fromEntries(areasFor(dest).map((a) => {
    const hit = (c = "") => c === a.city || c.startsWith(`${a.city} `) || a.city.startsWith(`${c} `);
    return [a.city, all.filter((it) => (it.route || []).some((r) => hit(r.city))).map((it) => toCard(it, n++, gallery))];
  }));
}

// The trips with each thing to do, for the row under Things to do. A trip has
// it when one of its days names it by a word that means something (Surf,
// Monkey Forest, Bay cruise; not "tour" or "beach"), and, when the activity
// is in a town the trips go to, the trip goes there.
const ACT_STOP = new Set(["tour", "trip", "visit", "with", "walk", "walking", "day", "class", "lesson", "ride", "party", "hike", "climb", "morning", "the", "and", "beach", "temple", "island", "town", "old"]);
const actWords = (t) => String(t).toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)
  .filter((w) => w && !ACT_STOP.has(w)).map((w) => w.replace(/s$/, "")).filter((w) => w.length > 2 && !ACT_STOP.has(w));
export function tripsForActs(dest, gallery, acts) {
  const all = allItineraries.filter((it) => it.dest === dest && okTrip(it));
  const towns = new Set(all.flatMap((it) => (it.route || []).map((r) => r.city)));
  let n = 0;
  return acts.map((a) => {
    const want = new Set(actWords(a.name));
    if (!want.size) return [];
    const inTown = towns.has(a.city) ? (it) => (it.route || []).some((r) => r.city === a.city) : () => true;
    return all.filter((it) => inTown(it) && tokensOf(it).some((t) => actWords(t).some((w) => want.has(w))))
      .map((it) => toCard(it, n++, gallery));
  });
}

// Trip rows. A row with a choice keeps every option, each with its own trips,
// so the activity or place at the end of its title can be changed in place.
// Options are only things at least two of this country's trips include.
const tokensOf = (it) => (it.days || []).flatMap((d) => String(d.sub || "").split(/\s*·\s*/)).map((t) => t.trim()).filter(Boolean);
export function itineraryRows(dest, gallery) {
  const all = allItineraries.filter((it) => it.dest === dest && okTrip(it));
  const real = all.filter((it) => !it.sample);
  const th = ROW_THEMES[dest] || {};
  let n = 0;
  const cards = (list) => list.map((it) => toCard(it, n++, gallery));
  const fits = (test, it) => (typeof test === "function" ? test(it) : test.test(tokensOf(it).join(" · ")));
  const rows = [];
  rows.push({ after: "facts", title: "Most loved trips", cards: cards(real.slice(0, 4)) });

  if (th.act) {
    const first = { label: th.act[0], cards: cards(all.filter((it) => fits(th.act[1], it))) };
    const count = new Map();
    all.forEach((it) => new Set(tokensOf(it)).forEach((t) => count.set(t, [...(count.get(t) || []), it])));
    const more = [...count.entries()]
      .filter(([t, list]) => list.length >= 2 && t.toLowerCase() !== th.act[0].toLowerCase())
      .sort((a, b) => b[1].length - a[1].length).slice(0, 9)
      .map(([t, list]) => ({ label: t, cards: cards(list) }));
    rows.push({ after: "todo", title: "Trips with", choices: [first, ...more].filter((c) => c.cards.length >= 2) });
  }

  {
    const count = new Map();
    all.forEach((it) => new Set((it.route || []).map((r) => r.city)).forEach((c) => count.set(c, [...(count.get(c) || []), it])));
    const first = th.place ? [{ label: th.place[0], cards: cards(all.filter((it) => (it.route || []).some((r) => th.place[1].test(r.city)))) }] : [];
    const more = [...count.entries()]
      .filter(([c, list]) => list.length >= 2 && list.length < all.length && !(th.place && th.place[1].test(c)))
      .sort((a, b) => b[1].length - a[1].length).slice(0, 9)
      .map(([c, list]) => ({ label: c, cards: cards(list) }));
    rows.push({ after: "places", title: "Trips with", choices: [...first, ...more].filter((c) => c.cards.length >= 2) });
  }

  const relaxed = real.filter((it) => it.vibe === "Relaxed");
  rows.push(relaxed.length >= 2
    ? { after: "school", title: "Relaxed trips", cards: cards(relaxed) }
    : { after: "school", title: "Explorer trips", cards: cards(real.filter((it) => it.vibe === "Explorer")) });
  const byPrice = [...real].sort((a, b) => amount(a.price) - amount(b.price));
  if (byPrice.length >= 3) {
    const cap = Math.ceil((amount(byPrice[2].price) + 1) / 10000) * 10000;
    const label = cap >= 100000 ? `₹${(cap / 100000).toFixed(1).replace(/\.0$/, "")}L` : `₹${cap / 1000}K`;
    rows.push({ after: "compare", title: `Trips under ${label}`, cards: cards(byPrice.filter((it) => amount(it.price) < cap)) });
  }
  return rows.filter((r) => (r.choices ? r.choices.length > 0 : r.cards.length >= 2));
}
