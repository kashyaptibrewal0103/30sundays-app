// Home lab data: everything the four home revamps share. Stock clips for now
// (royalty free, Pexels), one per country, each with the country's own photo
// behind it so a slow or failed clip still shows the place.

import { destData } from "../data";
import { SIX, fromPrice } from "./homeV3Data";
import { destMeta, visaShort } from "./buildData";

const PX = "https://videos.pexels.com/video-files";

export const DEST_VIDEO = {
  Bali: `${PX}/6989017/6989017-hd_1280_720_25fps.mp4`,
  Maldives: `${PX}/4010511/4010511-hd_1920_1080_25fps.mp4`,
  Thailand: `${PX}/15151692/15151692-hd_1280_720_30fps.mp4`,
  Vietnam: `${PX}/35325029/14966875_3840_2160_60fps.mp4`,
  "New Zealand": `${PX}/3321014/3321014-hd_1280_720_30fps.mp4`,
  // The stock clip we had for Mauritius turned out to be a hotel bedroom, so
  // it shows its photo until a real Mauritius clip is dropped in.
  Mauritius: null,
};

// The six marketed countries with everything a home tile needs. Order is the
// order they appear in every layout, so the set reads the same each time.
export const LAB_SIX = SIX.map((d) => ({
  ...d,
  video: DEST_VIDEO[d.name],
  hero: destData[d.name]?.hero || d.img,
  nights: destMeta[d.name]?.defaultNights || 7,
  visa: visaShort(d.name),
  price: fromPrice(d.startPrice),
  priceNum: Number(String(d.startPrice).replace(/[^0-9]/g, "")),
}));

export const byName = (name) => LAB_SIX.find((d) => d.name === name) || LAB_SIX[0];

// The lines that sit on the hero clip: the three USPs, cut to two lines each at
// the hero's type size. The full wording still stands in USPS below.
export const PROMISES = [
  "Vacations curated solely with couples in mind",
  "We split flights, hotels and activities",
  "Only 8+ rated hotels, hand-picked activities",
];

// The three USPs, worded as the brand words them.
export const USPS = [
  { key: "couples", t: "Made for Couples", s: "Vacations curated solely with couples in mind." },
  { key: "price", t: "Price Transparency", s: "The only travel company that splits flights, hotels and activities." },
  { key: "traps", t: "No Tourist Traps", s: "Only hotels rated 8 and above, and hand picked activities." },
];

export function inr(n) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// The price split behind the Price Transparency claim. Ratios follow the
// itinerary page's own breakdown so the home never contradicts the quote.
export function priceSplit(raw) {
  const total = Number(String(raw).replace(/[^0-9]/g, "")) || 0;
  const flights = Math.round(total * 0.34);
  const hotels = Math.round(total * 0.41);
  const activities = Math.round(total * 0.15);
  return {
    total,
    parts: [
      { label: "Flights", value: flights },
      { label: "Hotels", value: hotels },
      { label: "Activities", value: activities },
      { label: "Taxes", value: total - flights - hotels - activities },
    ],
  };
}

// Nights and budgets offered by the fill in the blank planner.
export const NIGHT_CHOICES = [5, 6, 7, 8, 10];
export const BUDGET_CHOICES = [60000, 75000, 90000, 120000, 150000];

// The five takes, for the directory and the page titles.
export const VARIANTS = [
  { n: 1, title: "Crew layout", desc: "Clip fills the screen, a card overlaps its edge, then a staggered wall of six." },
  { n: 2, title: "Six chapters", desc: "No hero and no grid. Six country chapters edge to edge, each with its own clip." },
  { n: 3, title: "Pinned clip", desc: "The clip never scrolls away. The countries ride on a panel that slides over it." },
  { n: 4, title: "Fill in the blank", desc: "A sentence you complete, then the six countries as a plain list." },
  { n: 5, title: "Poster stack", desc: "Photo one side, handwriting the other, alternating down the page." },
];

export const HOME_LAB_ROUTES = [...VARIANTS.map((v) => `/home-lab/${v.n}`), "/home-lab/cta", "/home-lab/cards", "/home-lab/plans", "/home-lab/states"];
