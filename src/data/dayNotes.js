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
  { match: /cruise|ferry|junk|sail|kayak/i,
    note: "Open water gets choppy in the afternoon. Take a tablet beforehand if you get seasick." },
  { match: /climb|hike|trek|summit|peak|cave/i,
    note: "There is real climbing involved. Closed shoes, and carry more water than you think." },
  { match: /cook|masterclass|food tour|street food|tasting/i,
    note: "You will eat properly at the end of this, so go light at lunch." },
  { match: /cycl|bike|scooter|vespa/i,
    note: "Traffic here does not give way to bikes. Stay together and keep the pace slow." },
  { match: /show|performance|theatre|dance|puppet/i,
    note: "Doors close on time. Latecomers wait until the interval to be seated." },
  { match: /village|herb|farm|plantation|paddy/i,
    note: "Narrow lanes and dirt paths. Wear shoes you do not mind getting dusty." },
];

// Where you are staying carries its own facts, and they hold on a free day
// just as much as a tour day. Used when the day has no activities to match on.
const PLACE_RULES = [
  // Bali
  { match: /ubud|sidemen|munduk/i,
    note: "It is about 90 minutes up from the airport, and traffic through Denpasar can double that." },
  { match: /kintamani|batur/i,
    note: "You are up at altitude. Evenings get cold, so keep a layer out of your suitcase." },
  { match: /nusa penida|lembongan|amed|pemuteran/i,
    note: "Roads are rough and phone signal drops out. Download your maps before you set off." },
  { match: /seminyak|canggu|kuta|sanur|nusa dua|lovina|uluwatu/i,
    note: "The rip current runs strong on this coast. Swim between the flags." },
  // Vietnam
  { match: /hanoi|hcmc|ho chi minh/i,
    note: "Crossing the road means walking slowly and steadily. The scooters go around you." },
  { match: /ha long|halong|ninh binh|phong nha/i,
    note: "Boats and caves mean damp steps. Shoes with grip beat sandals here." },
  { match: /hoi an|da nang|phu quoc|nha trang/i,
    note: "Afternoon showers are common in season and pass quickly. Keep a light poncho on you." },
  // Thailand
  { match: /bangkok/i,
    note: "Temples turn away bare shoulders and knees, so carry something to cover up with." },
  { match: /chiang mai/i,
    note: "Evenings cool off more than you expect up here. Take a layer for the night markets." },
  { match: /krabi|phuket|koh samui|phi phi/i,
    note: "Longtail crossings get choppy. Take a tablet beforehand if you get seasick." },
  // Maldives, Sri Lanka, Mauritius, New Zealand
  { match: /mal(e|é)|atoll|maldives/i,
    note: "Everything runs on the resort's boat and seaplane times, so build your day around them." },
  { match: /colombo|kandy|ella|sigiriya|galle|mirissa|trincomalee|bentota/i,
    note: "Temples and sacred sites need covered shoulders and bare feet. Socks help on hot stone." },
  { match: /port louis|flic en flac|belle mare|grand baie|le morne/i,
    note: "The sun is stronger than it feels in the sea breeze. Reef-safe sunscreen, reapplied." },
  { match: /queenstown|wanaka|rotorua|christchurch|auckland|te anau|franz josef/i,
    note: "Four seasons in one day here. Take a waterproof layer even when the morning looks clear." },
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
