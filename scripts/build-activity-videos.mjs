// Pulls the portrait activity clips out of the Trailix prod media manifest and
// writes src/data/activityVideos.js.
//
// Only direct .mp4 rows are kept. The HLS rows need a player library, and for a
// wait screen the browser's own progressive download of an mp4 is enough: we
// only ever play the first twenty seconds or so of each clip.
//
// Run:  node scripts/build-activity-videos.mjs [path-to-mp4-videos-prod.json]

import fs from "node:fs";

const SRC = process.argv[2] || "/Users/jaiki96/Documents/Claude-code/trailix/mp4-videos-prod.json";
const STATUS = "/Users/jaiki96/Documents/Claude-code/trailix/activity-portrait-video-status.csv";
const OUT = "src/data/activityVideos.js";

// The manifest files most of Sri Lanka under OTHER, so the destination comes
// off the id prefix instead of the destination column.
const PREFIX = { BLA: "Bali", BL: "Bali", THA: "Thailand", TH: "Thailand",
  VNA: "Vietnam", VN: "Vietnam", NZA: "New Zealand", NZ: "New Zealand", SLA: "Sri Lanka" };
// Transfers wear a lot of disguises. Besides the word itself, anything shaped
// like "X Hotel to Y" or "A to B" is a car ride, not something to look at.
const SKIP = /transfer|ferry ticket|airport|pick ?up|drop off|seat in coach|\bsic\b|hotel to |\bto\b.*\bhotel\b|^[^,]{3,} to [^,]{3,}$/i;
const STOP = new Set(["the","a","of","in","at","to","and","day","tour","trip","visit","experience","show","from","with","class"]);
// Words that two unrelated activities share all the time. A match made only of
// these is not a match: "Pattaya Floating Market" is not Bangkok's floating
// market, and tagging it "in your trip" would be a plain lie on screen.
const GENERIC = new Set(["market","beach","temple","island","water","waterfall","falls","river",
  "dinner","cruise","park","night","sunset","sunrise","boat","village","palace","museum","garden",
  "bay","point","cave","walk","tour","ride","lunch","city","town","street","food","local","hotel",
  "resort","centre","center","club","show","dance","rice","hike","trek","valley","lake","bridge"]);
const toks = (s) => new Set((s.toLowerCase().match(/[a-z]+/g) || []).filter(w => w.length > 3 && !STOP.has(w)));

// Sold counts, so the filler clips are the ones people actually book.
const sold = {};
if (fs.existsSync(STATUS)) {
  const rows = fs.readFileSync(STATUS, "utf8").split("\n").slice(1);
  for (const line of rows) {
    const m = line.match(/,([A-Z]+\d+),[^,]*,[^,]*,(\d+),/);
    if (m) sold[m[1]] = Number(m[2]);
  }
}

// Supplier listing titles carry sales phrasing the traveller does not need.
// The chip under the video already says the city, so "From Krabi:" is noise.
const cleanTitle = (t) => t
  .replace(/\s+/g, " ")
  .replace(/^(from|in)\s+[A-Za-z ]{3,18}:\s*/i, "")
  .replace(/\s*[-–|]\s*(private|shared|join in|sic|group)\s*$/i, "")
  .replace(/\s*\((private|shared|sic|join in)\)\s*$/i, "")
  .trim();

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
// Only the shared bucket. The other one answers 403 to anyone without creds,
// so a clip from it would be a black rectangle on the wait screen.
const PUBLIC_HOST = "30-sundays-shared.s3.ap-south-1.amazonaws.com";
const all = raw
  .filter(v => v.url && v.url.endsWith(".mp4") && v.url.includes(PUBLIC_HOST) && v.externalId && !SKIP.test(v.title))
  .map(v => ({
    id: v.externalId,
    title: cleanTitle(v.title),
    // Matching reads the original: "From Krabi: ..." names the city in the very
    // prefix the traveller does not need to see.
    match: v.title.replace(/\s+/g, " ").trim(),
    dest: PREFIX[(v.externalId.match(/^[A-Z]+/) || [""])[0]] || null,
    url: v.url,
    sold: sold[v.externalId] || 0,
  }))
  .filter(v => v.dest);

// The prototype's own cities and their activity names, so a clip can be tied to
// a stop on someone's route. Matching stays inside one destination: across
// destinations "White Water Rafting" lands in Sri Lanka from a Bali day.
const build = fs.readFileSync("src/data/buildData.js", "utf8");
const areas = build.slice(build.indexOf("export const destAreas"), build.indexOf("export const BUILD_DESTS"));
const cityDest = {};
let d = null;
for (const line of areas.split("\n")) {
  const h = line.match(/^ {2}"?([A-Za-z ]+)"?:\s*\[/);
  if (h) { d = h[1]; continue; }
  const c = line.match(/\{\s*city:\s*"([^"]+)"/);
  if (c && d) cityDest[c[1]] = d;
}

const opts = fs.readFileSync("src/data/dayOptions.js", "utf8");
const cityActs = {};
let cur = null;
for (const line of opts.split("\n")) {
  const h = line.match(/^ {2}"?([A-Za-z .'&-]+?)"?:\s*\[/);
  if (h) { cur = h[1]; continue; }
  const a = line.match(/activities:\s*\[([^\]]*)\]/);
  if (a && cur) {
    cityActs[cur] = cityActs[cur] || [];
    for (const n of a[1].match(/"[^"]+"/g) || []) cityActs[cur].push(n.slice(1, -1));
  }
}

// A clip belongs to a city when its title names the city, or shares two or more
// real words with something the city actually does.
for (const v of all) {
  for (const [city, dest] of Object.entries(cityDest)) {
    if (dest !== v.dest) continue;
    if (new RegExp(city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(v.match)) { v.city = city; break; }
  }
  if (v.city) continue;
  let best = 0;
  for (const [city, names] of Object.entries(cityActs)) {
    if (cityDest[city] !== v.dest) continue;
    for (const n of names) {
      const tn = toks(n), tv = toks(v.match);
      const shared = [...tn].filter((w) => tv.has(w));
      // Two words in common, and at least one of them has to actually mean
      // this place rather than being travel wallpaper.
      const named = shared.some((w) => !GENERIC.has(w));
      if (shared.length >= 2 && named && shared.length > best) { best = shared.length; v.city = city; v.act = n; }
    }
  }
}

// Keep every clip tied to a city, plus the fifteen most-booked per destination
// so a route with thin coverage still fills ninety seconds.
const out = {};
for (const dest of ["Bali", "Thailand", "Vietnam", "New Zealand", "Sri Lanka"]) {
  const mine = all.filter(v => v.dest === dest);
  const tied = mine.filter(v => v.city);
  const rest = mine.filter(v => !v.city).sort((a, b) => b.sold - a.sold).slice(0, 15);
  out[dest] = [...tied, ...rest]
    .sort((a, b) => b.sold - a.sold)
    .map(v => ({ id: v.id, title: v.title, city: v.city || null, sold: v.sold, url: v.url, mb: 0 }));
}

// File size, so the picker can lean on the lighter clips. These are raw camera
// files, 2 to 100 MB, and four heavy ones in a row is a real amount of someone
// else's mobile data. Production should stream the HLS renditions instead.
process.stdout.write("measuring sizes");
for (const rows of Object.values(out)) {
  for (const r of rows) {
    try {
      const head = await fetch(r.url, { method: "HEAD" });
      r.mb = Math.round(Number(head.headers.get("content-length") || 0) / 1048576);
    } catch { r.mb = 0; }
  }
  process.stdout.write(".");
}
process.stdout.write("\n");

const body = Object.entries(out).map(([dest, rows]) =>
  `  ${JSON.stringify(dest)}: [\n` +
  rows.map(r => `    ${JSON.stringify(r)},`).join("\n") +
  `\n  ],`).join("\n");

fs.writeFileSync(OUT, `// ─── Portrait activity clips ───
//
// Generated. Do not hand-edit: run scripts/build-activity-videos.mjs instead.
//
// Real footage from the Trailix media library, filmed for these activities.
// Portrait, which is the shape of a phone held while waiting. Each clip carries
// the city it belongs to where we could tie it to one, and how many times the
// activity has actually been booked, so the fallback picks are the popular ones
// rather than whatever happened to be first.
//
// Maldives and Mauritius have no clips: Maldives is resorts, not activities.

export const ACTIVITY_VIDEOS = {
${body}
};

// The gallery on the wait screen. Real footage, one tile per clip.
//
// These are the activity clips, standing in for customer uploads. The customer
// media lives in Trailix under random submission ids, so it cannot be reached
// from a file on disk: one export of destination, couple name, video url and
// poster and this function swaps its source with nothing else changing.
export function galleryForDest(dest, cities = [], limit = 12) {
  const pool = ACTIVITY_VIDEOS[dest] || [];
  const want = new Set(cities);
  const light = (a, b) => (a.mb || 99) - (b.mb || 99);
  const mine = pool.filter((v) => v.city && want.has(v.city)).sort(light);
  const rest = pool.filter((v) => !mine.includes(v)).sort((a, b) => b.sold - a.sold);
  return [...mine, ...rest].slice(0, limit);
}

// One clip for a named city, the lightest we have, so the footage on screen is
// the place currently being added to the route rather than a stranger.
export function clipForCity(dest, city) {
  const pool = (ACTIVITY_VIDEOS[dest] || []).filter((v) => v.city === city);
  if (!pool.length) return null;
  return pool.slice().sort((a, b) => (a.mb || 99) - (b.mb || 99))[0];
}

// Clips for one trip. Anything in a city on the route comes first, in booking
// order, then the destination's most-booked fills the rest so the screen is
// never short.
export function videosForTrip(dest, cities = [], limit = 5) {
  const pool = ACTIVITY_VIDEOS[dest] || [];
  const want = new Set(cities);
  // A clip on the route beats a popular one. Within each group the lighter file
  // wins, because we only play twenty seconds and nobody chose to spend the data.
  const light = (a, b) => (a.mb || 99) - (b.mb || 99);
  const mine = pool.filter((v) => v.city && want.has(v.city)).sort(light);
  const rest = pool.filter((v) => !mine.includes(v)).sort(light);
  return [...mine, ...rest].slice(0, limit);
}
`);

const n = Object.values(out).reduce((s, r) => s + r.length, 0);
const tied = Object.values(out).reduce((s, r) => s + r.filter(x => x.city).length, 0);
console.log(`wrote ${OUT}: ${n} clips, ${tied} tied to a city`);
for (const [k, v] of Object.entries(out)) console.log(`   ${k}: ${v.length} (${v.filter(x => x.city).length} tied)`);
