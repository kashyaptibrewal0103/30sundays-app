// ─── Heads-up notes for a day ───
//
// The one line on a day card that warns you about the thing nobody tells you
// until you are standing there: monkeys that take sunglasses, a 2 am pickup, a
// temple that turns you away in shorts.
//
// These are matched off activity names for the prototype. In the real app they
// belong on the activity and the hotel, since that is where the fact actually
// lives, and a day should collect whatever its parts are carrying. Until then
// this keyword list stands in.
//
// One note per day. If several match, the first rule wins, so the rules are
// ordered with the ones people most need to hear at the top. A day with no
// activities falls back to a fact about the place it is spent in.

const RULES = [
  { match: /monkey/i,
    note: "Monkeys here grab phones and sunglasses. Zip your bag before you walk in." },
  { match: /sunrise trek|batur|volcano|ijen/i,
    note: "Very early pickup and it is cold at the summit. Take a jacket and closed shoes." },
  { match: /temple|pura |tanah lot|besakih/i,
    note: "Shoulders and knees need covering. Sarongs are handed out at the gate." },
  { match: /waterfall|canyon/i,
    note: "Wet, steep steps down and back up. Grippy shoes help." },
  { match: /snorkel|dive|diving|boat|island hop|penida|lembongan/i,
    note: "The crossing can get choppy. Take a tablet beforehand if you get seasick." },
  { match: /rice field|rice terrace|rice paddie|jungle|valley/i,
    note: "Insects pick up around dusk out here, so pack repellent." },
  { match: /atv|quad|rafting|surf/i,
    note: "You will get muddy or soaked. Bring a change of clothes." },
  { match: /hot spring|spa/i,
    note: "Bring swimwear and a towel you do not mind leaving damp." },
  { match: /market|night market/i,
    note: "Cash only at most stalls, and haggling is expected." },
];

// Where you are staying carries its own facts, and they hold on a free day
// just as much as a tour day. Used when the day has no activities to match on.
const PLACE_RULES = [
  { match: /ubud|sidemen|munduk/i,
    note: "It is about 90 minutes up from the airport, and traffic through Denpasar can double that." },
  { match: /kintamani|batur/i,
    note: "You are up at altitude. Evenings get cold, so keep a layer out of your suitcase." },
  { match: /seminyak|canggu|kuta|sanur|nusa dua|lovina/i,
    note: "The rip current runs strong on this coast. Swim between the flags." },
  { match: /nusa penida|lembongan|amed|pemuteran/i,
    note: "Roads are rough and phone signal drops out. Download your maps before you set off." },
];

// Returns one note for the day, or null when nothing applies. A day with tours
// is matched on what it does; a free or transfer day on where it is.
export function getDayNote(day) {
  if (!day) return null;
  const names = (day.activities || [])
    .map((a) => (typeof a === "string" ? a : a?.name || ""))
    .join(" | ");
  if (names.trim()) {
    const hit = RULES.find((r) => r.match.test(names));
    if (hit) return hit.note;
  }
  if (day.city) {
    const place = PLACE_RULES.find((r) => r.match.test(day.city));
    if (place) return place.note;
  }
  return null;
}
