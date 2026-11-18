import { useMemo } from "react";
import { Users, ChevronRight, X as XIcon } from "lucide-react";
import { C } from "../data";
import { regionDetail } from "../data/regionData";
import { useWishlist } from "../data/wishlist";
import SaveHeart from "./SaveHeart";

// ─── People like you also chose (activities) ───
//
// A short rail after the last day in a city: things other travellers add
// there that this trip does not have yet. It is a suggestion, so it stays
// quiet. A cream band separates it from the plan. Each card is a photo, the
// name, and a row with the price difference and View plans. Nothing on it is
// pink: the page already has its one pink button, Save Itinerary.
//
// Tapping the card opens the same activity sheet the day detail uses. View
// plans opens that city's day plans with this activity already filtered, and
// only shows when some plan there includes it.

const CREAM = "#FDF8F5";
const GOLD = "#FDA201";
const MAX = 4;

// We hold no real prices for add-ons yet, so each one gets a steady,
// believable difference per person, the same way day options price theirs.
// Seeded on the name, so a card shows the same number every visit.
function addPrice(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // A walk, a market or a temple stop costs little more than a guide and a
  // car; a tour, a class or a boat costs a real ticket.
  const light = /walk|market|stroll|temple|beach|cycling|forest|sunrise|sunset|cafe/i.test(name);
  return light ? 400 + (h % 9) * 100 : 1200 + (h % 28) * 100; // ₹400-₹1,200, or ₹1,200-₹3,900
}
const inr = (n) => n.toLocaleString("en-IN");

// The catalogue hands out photos from a shared pool, so a card could carry a
// picture of somewhere else (Kelingking showed the Bali swing). On Bali each
// card takes a photo of what it is, else of its town, and a row never shows
// the same photo twice. The swing and the Handara gate never show, since we
// tell people to skip both.
const CDN = "https://cdn.30sundays.club/app_content/bali";
const OWN_PHOTO = [
  [/kelingking|broken beach|angel/i, `${CDN}/kelingking_beach_65.jpg`],
  [/tegal+alang|rice terrace|rice field|paddies/i, `${CDN}/tegallalang_rice_fields_4.jpg`],
  [/waterfall|banyumala|rafting/i, `${CDN}/banyumala_waterfall_56.jpg`],
  [/tree ?house/i, `${CDN}/tree_house_nusa_penida_3.jpg`],
  [/temple|tirta|tanah lot|monkey|kecak/i, "/vibes/bali-temples.jpg"],
  [/snorkel|manta|dive|turtle|crystal bay|island/i, "/vibes/bali-islands.jpg"],
  [/volcano|batur/i, "/vibes/bali-volcanoes.jpg"],
  [/club|cocktail|bar\b|nightlife/i, "/vibes/bali-nightlife.jpg"],
  [/beach|sunset|surf/i, "/vibes/bali-beaches.jpg"],
];
const TOWN_PHOTO = {
  Ubud: `${CDN}/tegallalang_rice_fields_4.jpg`,
  "Nusa Penida": `${CDN}/kelingking_beach_65.jpg`,
  Seminyak: "/vibes/bali-beaches-2.jpg",
  "Gili Trawangan": "/vibes/bali-islands.jpg",
};
const SPARE = ["/vibes/bali-temples-2.jpg", "/vibes/bali-rice-2.jpg", "/vibes/bali-nightlife-2.jpg", "/vibes/bali-temples-3.jpg", "/vibes/bali-beaches.jpg"];
const SKIP = /swing|handara/i;
function photosFor(acts, city) {
  const used = new Set();
  return acts.map((a) => {
    const own = OWN_PHOTO.find(([re]) => re.test(a.name))?.[1];
    const pick = [own, TOWN_PHOTO[city], ...SPARE, SKIP.test(a.img) ? null : a.img]
      .find((u) => u && !used.has(u)) || own || TOWN_PHOTO[city] || SPARE[0];
    used.add(pick);
    return pick;
  });
}

export function popularFor(dest, city, exclude = []) {
  const r = regionDetail(dest, city);
  if (!r?.acts?.length) return [];
  const have = new Set(exclude.map((n) => String(n).toLowerCase()));
  const acts = r.acts.filter((a) => a.img && !have.has(a.name.toLowerCase())).slice(0, MAX);
  const imgs = dest === "Bali" ? photosFor(acts, city) : acts.map((a) => a.img);
  return acts.map((a, i) => ({ ...a, img: imgs[i], add: addPrice(a.name) }));
}

export default function PopularActivities({ dest, city, exclude, onOpen, canPlan, onPlans }) {
  const acts = useMemo(() => popularFor(dest, city, exclude), [dest, city, exclude]);
  const { isSaved, toggle } = useWishlist();
  if (!acts.length) return null;

  return (
    <section
      aria-label={`People like you also chose, ${city}`}
      style={{ margin: "4px -16px", background: CREAM, padding: "20px 0 22px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", marginBottom: 12 }}>
        <Users size={18} color={GOLD} strokeWidth={2} aria-hidden />
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>
          People like you also chose
        </p>
      </div>

      <div
        className="hide-scrollbar"
        style={{
          display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory",
          padding: "0 16px", scrollPaddingLeft: 16,
        }}
      >
        {acts.map((a) => {
          const plannable = canPlan ? canPlan(a.name) : false;
          return (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpen(a)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(a); } }}
              aria-label={`${a.name}, ₹${inr(a.add)} more a person`}
              style={{
                flex: "none", width: 236, border: `1px solid ${C.div}`, borderRadius: 16,
                overflow: "hidden", background: C.white, cursor: "pointer", scrollSnapAlign: "start",
                display: "flex", flexDirection: "column",
              }}
            >
              <img src={a.img} alt="" loading="lazy"
                style={{ display: "block", width: "100%", height: 112, objectFit: "cover" }} />
              <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column" }}>
                {/* The heart beside the name, right aligned, where every card
                    in the app keeps it. */}
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: C.head, lineHeight: 1.3,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{a.name}</span>
                  <SaveHeart
                    size={28}
                    saved={isSaved("activity", dest, a.id)}
                    onToggle={() => toggle("activity", dest, a.id, { name: a.name, img: a.img, sub: city, city })}
                    style={{ margin: "-5px -6px -5px 0" }}
                  />
                </span>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.head, whiteSpace: "nowrap" }}>+₹{inr(a.add)} a person</span>
                  {/* The day plans that include this activity, already filtered. */}
                  {plannable && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onPlans(a); }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 1, padding: 0, border: "none",
                        background: "none", fontSize: 13, fontWeight: 600, color: C.head,
                        whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      View plans <ChevronRight size={14} strokeWidth={2.2} />
                    </button>
                  )}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Which day ───
//
// A day plan replaces the whole day, so before the plans open the traveller
// picks the day that will change. Every day in the city is listed, in order,
// with what is on it now, so they can see what they would give up. Days that
// cannot change (arrival, hotel change, departure) stay in the list, greyed,
// with the reason, so nobody wonders where Day 1 went. Tapping a day opens its
// plans with the activity already filtered. Shown only when more than one day
// could take it; with one, the plans open straight away.
//
// days: [{ index, dayNum, date, now, free, reason }], reason set when locked.
export function DayPickSheet({ activity, days, frameStyle, onPick, onClose }) {
  return (
    <div style={{ ...frameStyle, zIndex: 210, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)", animation: "fadeInBg .2s ease-out" }} />
      <div
        role="dialog"
        aria-label={`Which day for ${activity}?`}
        style={{
          position: "relative", background: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
          boxShadow: "0 -8px 28px rgba(0,0,0,0.2)", animation: "sheetSlideUp .25s ease-out",
          padding: "16px 16px calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <p style={{ flex: 1, margin: 0, fontSize: 17, fontWeight: 700, color: C.head, lineHeight: 1.3 }}>
            Which day for {activity}?
          </p>
          <button onClick={onClose} aria-label="Close" style={{
            width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white,
            display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
          }}>
            <XIcon size={16} color={C.head} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {days.map((d) => {
            const locked = !!d.reason;
            return (
              <button
                key={d.index}
                type="button"
                disabled={locked}
                onClick={() => onPick(d.index)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px",
                  border: `1px solid ${C.div}`, borderRadius: 14, background: C.white, textAlign: "left",
                  cursor: locked ? "default" : "pointer", fontFamily: "inherit", opacity: locked ? 0.55 : 1,
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: C.head }}>
                    Day {d.dayNum}{d.date ? ` (${d.date})` : ""}
                  </span>
                  <span style={{
                    display: "block", marginTop: 3, fontSize: 13, color: C.sub,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {locked ? d.reason : d.free ? "Free day, nothing planned yet" : d.now}
                  </span>
                </span>
                {!locked && <ChevronRight size={18} color={C.sub} strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
