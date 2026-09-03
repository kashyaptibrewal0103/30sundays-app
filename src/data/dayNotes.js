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
// ordered with the ones people most need to hear at the top.

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

// Returns one note for the day, or null when nothing applies. Departure and
// arrival days stay clean: a transfer needs no warning.
export function getDayNote(day) {
  if (!day || day.departure) return null;
  const names = (day.activities || [])
    .map((a) => (typeof a === "string" ? a : a?.name || ""))
    .join(" | ");
  if (!names.trim()) return null;
  const hit = RULES.find((r) => r.match.test(names));
  return hit ? hit.note : null;
}
