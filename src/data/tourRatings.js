// Tour ratings + reviews (prototype mock).
// Ratings sit at the TOUR level: users rate a tour one of three ways -
// "loved it", "liked it", "not for me". Numbers are deterministic per tour
// key so a given tour always shows the same stats and reviews. Swap
// getTourRating for a live source when the ratings API is ready.

const REVIEWER_NAMES = [
  "Ayushi & Kaustubh", "Utsav & Prachi", "Dinesh & Harshitha", "Raaghav & Ritika",
  "Sharv & Pranjali", "Anupriya & Sumit", "Neha & Arjun", "Karan & Simran",
  "Rohan & Meera", "Aditya & Ishita", "Vikram & Tanvi", "Nikhil & Sneha",
];

const TEXTS = {
  loved: [
    "Absolutely the highlight of our trip. Would do it again in a heartbeat.",
    "Our guide was wonderful and the views were unreal.",
    "So worth it. Perfectly paced and never felt rushed.",
    "One of those experiences we kept talking about back home.",
    "Stunning from start to finish. Highly recommend.",
    "Loved every minute, the little details made it special.",
  ],
  liked: [
    "Really enjoyable, though it got a bit crowded midday.",
    "Good experience overall. A slightly shorter version would be perfect.",
    "Nice outing, the guide was friendly and helpful.",
    "Pretty and relaxed. Glad we did it.",
    "Solid choice, would recommend to most couples.",
  ],
  not: [
    "Not really our thing, but others might enjoy it.",
    "Felt a little touristy for us.",
    "Was okay, we would have preferred more free time.",
  ],
};

// FNV-1a string hash -> unsigned 32-bit
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

const pick = (arr, seed) => arr[seed % arr.length];

// A crisp two-line read on the feedback, driven by the rating mix. The lower
// bands matter: a middling day summarised in glowing language reads as spin,
// and the summary is the one place with room to say what actually split people.
export function buildSummary(lovedPct, likedPct, notPct) {
  let lead;
  if (lovedPct >= 85) lead = "Couples loved this one. The guide, the views and the easy pace come up again and again.";
  else if (lovedPct >= 65) lead = "Most couples enjoyed this. They liked the guide, the scenery and how relaxed it felt.";
  else if (lovedPct >= 45) lead = "Reactions are split. Plenty of couples enjoyed it, and a fair few felt it wasn't for them.";
  else lead = "This one divides couples. Some had a good time; many said it didn't suit them.";

  let caveat;
  if (notPct >= 20) caveat = "The usual reasons: too much time in transit, crowds, or not enough to do.";
  else if ((likedPct + notPct) >= 24) caveat = "A few felt it got busy around midday, or wanted a little more free time.";
  else caveat = "The odd couple found it a touch touristy, but that was rare.";

  return `${lead} ${caveat}`;
}

function whenLabel(daysAgo) {
  if (daysAgo <= 1) return "yesterday";
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 14) return "1 week ago";
  if (daysAgo < 30) return `${Math.round(daysAgo / 7)} weeks ago`;
  if (daysAgo < 60) return "last month";
  return `${Math.round(daysAgo / 30)} months ago`;
}

// Sample of reviews shown in the sheet. Weighted toward "loved" but always
// carries a few "liked" and "not for me" so the filter chips are meaningful.
const SAMPLE_PLAN = ["loved", "loved", "loved", "loved", "loved", "loved", "liked", "liked", "not", "not"];

// A review list whose loved/liked/not mix reflects the given percentages, so
// the sheet's filter chips agree with the bars above them. Any share that is
// non-zero gets at least one review, otherwise a chip would filter to nothing.
export function buildReviewSample(key, mix, n = 10) {
  let nLoved = Math.round((n * (mix.loved || 0)) / 100);
  let nNot = Math.round((n * (mix.not || 0)) / 100);
  if ((mix.not || 0) > 0 && nNot === 0) { nNot = 1; nLoved = Math.max(0, nLoved - 1); }
  let nLiked = Math.max(0, n - nLoved - nNot);
  if ((mix.liked || 0) > 0 && nLiked === 0) { nLiked = 1; nLoved = Math.max(0, nLoved - 1); }

  const plan = [
    ...Array(nLoved).fill("loved"),
    ...Array(nLiked).fill("liked"),
    ...Array(nNot).fill("not"),
  ];

  return plan.map((kind, i) => {
    const seed = hashStr(key + "#r" + i);
    const daysAgo = 1 + (hashStr(key + "#d" + i) % 90);
    return {
      name: pick(REVIEWER_NAMES, seed),
      rating: kind,
      text: pick(TEXTS[kind], seed >> 3),
      daysAgo,
      when: whenLabel(daysAgo),
    };
  });
}

export function getTourRating(key, opts = {}) {
  if (!key) return null;
  const h = hashStr(key);
  const h2 = hashStr(key + "#loved");
  const h3 = hashStr(key + "#not");

  const count = 60 + (h % 241);            // 60..300 ratings
  let lovedPct = 74 + (h2 % 22);           // 74..95
  const notPct = 1 + (h3 % 6);             // 1..6
  let likedPct = 100 - lovedPct - notPct;
  if (likedPct < 1) { likedPct = 1; lovedPct = 100 - likedPct - notPct; }

  const loved = Math.round((count * lovedPct) / 100);
  const notForMe = Math.round((count * notPct) / 100);
  const liked = Math.max(0, count - loved - notForMe);
  const lovedPctDisplay = Math.round((loved / count) * 100);

  const summary = buildSummary(lovedPctDisplay, likedPct, notPct);

  const reviews = SAMPLE_PLAN.map((kind, i) => {
    const seed = hashStr(key + "#r" + i);
    const daysAgo = 1 + (hashStr(key + "#d" + i) % 90);
    return {
      name: pick(REVIEWER_NAMES, seed),
      rating: kind,
      text: pick(TEXTS[kind], seed >> 3),
      daysAgo,
      when: whenLabel(daysAgo),
    };
  });

  return { count, loved, liked, notForMe, lovedPct: lovedPctDisplay, likedPct, notPct, summary, reviews, title: opts.title, subtitle: opts.subtitle };
}

export const RATING_META = {
  loved: { label: "Loved it", color: "#2E8B60" },   // green
  liked: { label: "Liked it", color: "#E0940A" },   // yellow / amber
  not: { label: "Not for me", color: "#98A2B3" },   // neutral grey
};
