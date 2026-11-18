import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight } from "lucide-react";
import { C, allItineraries } from "../data";

// ─── Travelers like you choose ───
//
// Other trips to the same country, under the trip's own tagline. The route
// is the point of each card, so it leads: every stop with its nights, joined
// by a line, and the stops this trip does not have yet get a gold dot (gold
// is attention: "this is different from yours"). Name, nights and price sit
// under it. No photo: on a card about where you go, a photo of one place
// argues for that place over the shape of the trip.
//
// Quiet on purpose. White cards, navy text, no pink. The page already has
// its one pink button. The whole card is the tap target and opens the trip.

const GOLD = "#FDA201";
const MAX = 5;
const num = (p) => Number(String(p).replace(/[^0-9]/g, "")) || 0;
const inr = (n) => n.toLocaleString("en-IN");

export function similarTrips(it) {
  const mine = new Set(it.days.map((d) => d.city));
  return allItineraries
    .filter((o) => o.dest === it.dest && o.id !== it.id && o.route?.length && o.route.length <= 4)
    .map((o) => ({
      o,
      // "Like you" means close to this trip: a similar length, keeping some
      // of the same cities and swapping one or two. Trips that change every
      // city come last.
      score: (() => {
        const fresh = o.route.filter((r) => !mine.has(r.city)).length;
        const kept = o.route.length - fresh;
        return Math.abs(o.nights - it.nights) * 3 + (kept === 0 ? 20 : 0) + Math.abs(fresh - 1) * 2;
      })(),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX)
    .map(({ o }) => o);
}

function RouteLine({ route, mine }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {route.map((r, i) => {
        const isNew = !mine.has(r.city);
        return (
          <div key={r.city + i} style={{ display: "contents" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 58, flex: "none" }}>
              <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: isNew ? GOLD : C.head }} />
              <span style={{
                marginTop: 6, fontSize: 12.5, fontWeight: isNew ? 700 : 600, color: C.head,
                textAlign: "center", lineHeight: 1.25,
              }}>{r.city}</span>
              <span style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>{r.n}N</span>
            </div>
            {i < route.length - 1 && (
              <span aria-hidden style={{ flex: 1, minWidth: 8, height: 2, background: C.div, marginTop: 4 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SimilarTrips({ it }) {
  const navigate = useNavigate();
  const trips = useMemo(() => similarTrips(it), [it]);
  const mine = useMemo(() => new Set(it.days.map((d) => d.city)), [it]);
  if (!trips.length) return null;
  const myPrice = num(it.price);

  return (
    <section aria-label="Travelers like you choose" style={{ padding: "4px 0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", marginBottom: 12 }}>
        <Users size={18} color={GOLD} strokeWidth={2} aria-hidden />
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>Travelers like you choose</p>
      </div>

      <div className="hide-scrollbar" style={{
        display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory",
        padding: "0 16px 4px", scrollPaddingLeft: 16,
      }}>
        {trips.map((o) => {
          const diff = num(o.price) - myPrice;
          const diffLine = !myPrice ? null : diff === 0 ? "Same price as yours"
            : diff > 0 ? `₹${inr(diff)} more than yours` : `₹${inr(-diff)} less than yours`;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => navigate(`/itinerary/${o.id}`)}
              aria-label={`${o.name}, ${o.route.map((r) => `${r.city} ${r.n} nights`).join(", ")}. ₹${o.price} a person. View trip`}
              style={{
                flex: "none", width: 268, boxSizing: "border-box", padding: "16px 14px 14px",
                background: C.white, border: `1px solid ${C.div}`, borderRadius: 14,
                textAlign: "left", cursor: "pointer", fontFamily: "inherit", scrollSnapAlign: "start",
                display: "flex", flexDirection: "column",
              }}
            >
              <RouteLine route={o.route} mine={mine} />
              <span style={{ height: 1, background: C.div, margin: "14px 0 12px" }} />
              <span style={{ fontSize: 13, color: C.sub }}>{o.name} · {o.nights} nights</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.head, marginTop: 4 }}>₹{o.price} a person</span>
              {diffLine && <span style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{diffLine}</span>}
              <span style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 2, fontSize: 13, fontWeight: 600, color: C.head }}>
                View trip <ChevronRight size={14} strokeWidth={2.2} />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
