import { useState } from "react";
import { Leaf, MapPin, Moon, ChevronDown, ChevronUp, Info, X as XIcon } from "lucide-react";
import { C, destData } from "../data";
import { destAreas, respread, routeNights, areaImg } from "../data/buildData";
import { PHOTO_HEART_SHADOW } from "./SaveHeart";

// ─── People like you also tried ───
//
// After Itinerary at a glance, before Hotels: three full-width rows, closed
// until tapped, one open at a time (canvas board R1). An open row shows other
// shapes of this same trip as photo cards in a sideways row: the route with
// nights at each stop, and the total nights, nothing else. The i on a card
// says why we suggest it.
//
// - Make it more relaxed: one stop fewer, the same nights.
// - Add a place: a place in the country the trip does not visit yet.
// - Stay one more night: one night more in one of the trip's own towns.
//
// Picking one makes a new itinerary next to this one; the line under the rows
// says so before anyone taps. Nothing on it is pink: the page has its one
// pink button, Save Itinerary.

const GOLD = "#FDA201";
// The glass every label over a photo in the app uses.
const GLASS = { background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" };

// What we add, and where, from the trips we actually sell (30 Sundays sales
// data, Bali 7N: Seminyak opens 93% of trips and Ubud closes 90%, with Nusa
// Penida and the Gilis in between, Penida first when both). Per country, the
// places to suggest in order, the nights each usually gets, the stop it goes
// after, and the reason we give.
const ADD_FIRST = {
  Bali: ["Gili Trawangan", "Nusa Penida"],
  Vietnam: ["Ha Long", "Phu Quoc", "Da Nang", "Hoi An"],
  Thailand: ["Phi Phi", "Krabi", "Phuket"],
  "Sri Lanka": ["Ella", "Mirissa", "Galle"],
};
const ADD_NIGHTS = { "Gili Trawangan": [1, 2], "Nusa Penida": [1, 2], "Ha Long": [1], "Phi Phi": [2, 1] };
const ADD_AFTER = { "Gili Trawangan": "Nusa Penida", "Ha Long": "Hanoi", "Phi Phi": "Krabi" };
// A place that only makes sense from another one: the bay cruise leaves
// from Hanoi.
const ADD_NEEDS = { "Ha Long": "Hanoi" };
const ADD_WHY = {
  "Gili Trawangan": "Turtles, no cars and sunsets. Nearly half our Bali trips stop here.",
  "Nusa Penida": "Cliffs and manta rays. Nearly half our Bali trips stop here.",
  "Ha Long": "A night on the bay. Most of our Hanoi trips add it.",
  "Phi Phi": "Maya Bay and island hops. On most of our Krabi and Phuket trips.",
};

// k nights taken from the longest stays, one at a time (the later one on a
// tie, usually the beach end), never leaving a stay under two nights. Null
// when there is not enough to give.
function take(route, k) {
  const out = route.map((r) => ({ ...r }));
  for (let t = 0; t < k; t += 1) {
    let i = -1;
    out.forEach((r, j) => { if (r.n > 2 && (i < 0 || r.n >= out[i].n)) i = j; });
    if (i < 0) return null;
    out[i].n -= 1;
  }
  return out;
}

const areaOf = (dest, city) => (destAreas[dest] || []).find((a) => a.city === city);
const line = (route) => route.map((r) => `${r.city} ${r.n}N`).join(" → ");
const listOf = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

// A photo for a town, never the swing or the Handara gate (we tell people to
// skip both).
function photoFor(dest, city, k) {
  const ok = (u) => u && !/swing|handara/i.test(u);
  // The town's own photo on the first card; the cards after it take others,
  // so a row is not one picture three times.
  const own = areaImg(dest, city, k);
  const pool = (destData[dest]?.actImgs || []).filter((u) => ok(u) && u !== own);
  if (ok(own) && (k === 0 || !pool.length)) return own;
  return pool[k % (pool.length || 1)] || own || destData[dest]?.hero;
}

// The rows for a trip, each with up to three routes. A row with nothing to
// offer is left out.
export function betterRows(dest, route) {
  const total = routeNights(route);
  const have = new Set(route.map((r) => r.city));
  const rows = [];

  // More relaxed: first a second night on a one-night stop (a one-night
  // island is mostly boats), taken from the longest stay; then one stop
  // fewer, its nights shared out. The longest stay is the heart of the trip,
  // so it is never the one dropped; short stops go first, middle before end.
  if (route.length >= 2) {
    const cards = [];
    route.forEach((r, k) => {
      if (r.n !== 1) return;
      const next = take(route, 1);
      if (!next) return;
      next[k].n += 1;
      cards.push({ route: next, img: photoFor(dest, r.city, cards.length), why: `Two nights on ${r.city}, so it is not all boats. Same length of trip.` });
    });
    // Only on trips of three stops or more (two stops less one is a single
    // town, not a slower trip), and never one of the longest stays.
    const maxN = Math.max(...route.map((r) => r.n));
    const mid = (k) => (k > 0 && k < route.length - 1 ? 0 : 1);
    route.map((_, k) => k).filter((k) => route.length >= 3 && route[k].n < maxN)
      .sort((a, b) => route[a].n - route[b].n || mid(a) - mid(b))
      .forEach((k) => {
        const next = respread(route.filter((_, j) => j !== k), total);
        const gain = next.filter((r) => r.n > (route.find((x) => x.city === r.city)?.n || 0)).map((r) => r.city);
        cards.push({
          route: next,
          img: photoFor(dest, gain[0] || next[0].city, cards.length),
          why: `One hotel change fewer. More time in ${listOf((gain.length ? gain : next.map((r) => r.city)).slice(0, 2))}.`,
        });
      });
    if (cards.length) rows.push({ key: "relaxed", label: "Make it more relaxed", Icon: Leaf, cards: cards.slice(0, 3) });
  }

  // A place the trip does not visit yet, put where our trips put it. Where
  // we know what people add, only those; a trip that has them all gets no row.
  const pool = ADD_FIRST[dest] || (destAreas[dest] || []).map((a) => a.city);
  const place = pool.find((c) => !have.has(c) && areaOf(dest, c) && (!ADD_NEEDS[c] || have.has(ADD_NEEDS[c])));
  if (place) {
    const area = areaOf(dest, place);
    const after = route.findIndex((r) => r.city === ADD_AFTER[place]);
    // After its usual neighbour; else before the last stop; on a one-stop
    // trip, first (the stop there is the beach end).
    const at = after >= 0 ? after + 1 : route.length >= 2 ? route.length - 1 : 0;
    const put = (r, n) => [...r.slice(0, at), { city: place, n }, ...r.slice(at)];
    const options = [];
    (ADD_NIGHTS[place] || [Math.min(2, area.n || 2)]).forEach((n) => {
      const room = take(route, n);
      if (room) options.push(put(room, n)); // same length, nights from the longest stays
      options.push(put(route, n)); // n nights longer, nothing else moves
    });
    const seen = new Set();
    const cards = options.filter((r) => { const k = line(r); if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 3)
      .map((r, k) => ({
        route: r,
        img: photoFor(dest, place, k),
        why: ADD_WHY[place] || `${area.tag || place}. Often added in ${dest}.`,
      }));
    rows.push({ key: "place", label: `Add ${place}`, Icon: MapPin, cards });
  }

  // One more night in one of the towns already on the trip.
  const cards = route.map((r, k) => {
    const next = route.map((x, j) => (j === k ? { ...x, n: x.n + 1 } : x));
    const tag = areaOf(dest, r.city)?.tag;
    return {
      route: next,
      img: photoFor(dest, r.city, k + 2),
      why: `${tag ? `${tag}. ` : ""}One more night, same hotel.`,
    };
  }).slice(0, 3);
  rows.push({ key: "night", label: "Stay one more night", Icon: Moon, cards });

  return rows;
}

function RouteCard({ card, onPick }) {
  const [why, setWhy] = useState(false);
  const nights = routeNights(card.route);
  const long = card.route.length > 4;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPick(card)}
      onKeyDown={(e) => { if (e.key === "Enter") onPick(card); }}
      aria-label={`${line(card.route)}, ${nights} nights`}
      style={{
        position: "relative", flex: "none", width: 248, height: 150, borderRadius: 14, overflow: "hidden",
        cursor: "pointer", scrollSnapAlign: "start", background: C.bg,
      }}
    >
      <img src={card.img} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(24,30,76,0) 30%, rgba(24,30,76,0.85) 100%)" }} />
      <button
        type="button"
        aria-label={why ? "Hide why we suggest this" : "Why we suggest this"}
        aria-expanded={why}
        onClick={(e) => { e.stopPropagation(); setWhy((v) => !v); }}
        style={{
          position: "absolute", top: 8, right: 8, zIndex: 2, width: 28, height: 28, borderRadius: "50%",
          // Just the icon, white, with the photo-icon shadow so it reads on
          // any picture. The 28px box is only the tap target.
          border: "none", background: "none", display: "grid", placeItems: "center", cursor: "pointer", padding: 0,
          filter: PHOTO_HEART_SHADOW,
        }}
      >
        {why ? <XIcon size={18} color="#fff" strokeWidth={2.4} /> : <Info size={19} color="#fff" strokeWidth={2.2} />}
      </button>
      <span style={{ position: "absolute", left: 12, right: 12, bottom: 10, color: "#fff" }}>
        {/* A long trip's route runs smaller and stops at four lines; the
            confirm carries it in full. */}
        <span style={{
          display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: long ? 4 : 3, overflow: "hidden",
          fontSize: long ? 12.5 : 14.5, fontWeight: 700, lineHeight: 1.3,
        }}>{line(card.route)}</span>
        <span style={{ display: "block", marginTop: 3, fontSize: 12.5, opacity: 0.9 }}>{nights} nights</span>
      </span>
      {/* Why: two short lines on glass under the i, leaving the route in
          view at the foot of the card. */}
      {why && (
        <span
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", left: 8, right: 8, top: 42, zIndex: 1, borderRadius: 10, ...GLASS,
            padding: "6px 10px", boxSizing: "border-box", cursor: "default",
            fontSize: 11.5, fontWeight: 500, lineHeight: 1.35, color: "#fff",
            display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden",
          }}
        >{card.why}</span>
      )}
    </div>
  );
}

export default function BetterTrip({ dest, route, onPick }) {
  const rows = betterRows(dest, route);
  const [open, setOpen] = useState(rows[0]?.key || null);
  if (!rows.length) return null;

  return (
    <section aria-label="People like you also tried" style={{ padding: "4px 0 2px" }}>
      <p style={{ margin: "0 0 12px", padding: "0 16px", fontSize: 17, fontWeight: 700, color: C.head }}>People like you also tried</p>
      {rows.map((r) => {
        const isOpen = open === r.key;
        return (
          <div key={r.key} style={{ borderTop: `1px solid ${C.div}` }}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : r.key)}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px",
                border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
            >
              <r.Icon size={20} color={GOLD} strokeWidth={2} aria-hidden />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: C.head }}>{r.label}</span>
              {isOpen ? <ChevronUp size={18} color={C.sub} /> : <ChevronDown size={18} color={C.sub} />}
            </button>
            {isOpen && (
              <div
                className="hide-scrollbar"
                style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", padding: "2px 16px 16px", scrollPaddingLeft: 16 }}
              >
                {r.cards.map((c) => <RouteCard key={line(c.route)} card={c} onPick={onPick} />)}
              </div>
            )}
          </div>
        );
      })}
      <p style={{ margin: 0, padding: "12px 16px 0", borderTop: `1px solid ${C.div}`, fontSize: 12.5, lineHeight: 1.45, color: C.sub }}>
        Picking one makes a new itinerary, saved in your plans next to this one. You can review it anytime. Nothing is booked yet.
      </p>
    </section>
  );
}

// Asks before anything is made. The trip on screen stays as it is.
export function BetterTripConfirm({ from, to, frameStyle, onConfirm, onClose }) {
  return (
    <div style={{ ...frameStyle, zIndex: 160, display: "flex", alignItems: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div role="dialog" aria-label="Create a new itinerary?" style={{
        position: "relative", width: "100%", background: C.white, borderRadius: "20px 20px 0 0",
        padding: "20px 18px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 14px" }}>Create a new itinerary?</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          <div style={{ borderRadius: 12, border: `1px solid ${C.div}`, padding: "10px 12px" }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.sub }}>This itinerary, kept as it is</p>
            <p style={{ margin: 0, fontSize: 14, color: C.head, lineHeight: "19px" }}>{line(from)}</p>
          </div>
          <div style={{ borderRadius: 12, border: `1px solid ${C.div}`, padding: "10px 12px" }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.sub }}>New itinerary</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head, lineHeight: "19px" }}>{line(to)} · {routeNights(to)} nights</p>
          </div>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.5, color: C.sub }}>
          We build it with new hotels, day plans and prices, and save it in your plans. You can review either one anytime. <b style={{ color: C.head }}>Nothing is booked yet.</b>
        </p>

        <button onClick={onConfirm} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
          Create new itinerary
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Not now
        </button>
      </div>
    </div>
  );
}
