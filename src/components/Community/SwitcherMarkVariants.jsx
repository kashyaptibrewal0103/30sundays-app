import { Check, Plane, Ticket } from "lucide-react";
import { CC } from "./tokens";
import { getDest, roomOrder } from "../../data/communityData";

// Five ways to say "this is the place you are actually going", inside the
// room switcher.
//
// Two facts want the same row: the room you are reading now, and the trip you
// booked. The tick is spoken for by the first, so none of these may use it.
// They also have to survive a traveller with two trips, and one with none.

const BOOKED = (d) => !!d.booked && !d.everyone;

function Thumb({ d, ring }) {
  return (
    <span style={{
      width: 34, height: 34, borderRadius: 10, flexShrink: 0, overflow: "hidden",
      background: CC.tealTint, display: "grid", placeItems: "center",
      boxShadow: ring ? `0 0 0 2px ${CC.white}, 0 0 0 4px ${CC.teal}` : "none",
    }}>
      {d.everyone
        ? <Plane size={15} color={CC.teal} />
        : <img src={d.hero} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </span>
  );
}

function Name({ d, here, children }) {
  return (
    <span style={{
      flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8,
      fontSize: 15, fontWeight: 700, color: here ? CC.tealInk : CC.ink,
      overflow: "hidden", whiteSpace: "nowrap",
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
      {children}
    </span>
  );
}

const ROW = {
  display: "flex", alignItems: "center", gap: 11, width: "100%",
  padding: "12px 2px", background: "none", border: "none",
  borderBottom: `1px solid ${CC.line}`, cursor: "pointer",
  fontFamily: "inherit", textAlign: "left",
};

/* ── 1. The words, beside the name ───────────────────────────────────────── */

// Says the thing outright. Costs a second piece of type on a row that is
// otherwise one word, and it repeats on every trip a frequent traveller has.
export function MarkWords({ current }) {
  return (
    <List>
      {roomOrder().map(id => {
        const d = getDest(id), here = id === current;
        return (
          <div key={id} style={ROW}>
            <Thumb d={d} />
            <Name d={d} here={here}>
              {BOOKED(d) && (
                <span style={{ fontSize: 12, fontWeight: 700, color: CC.tealInk }}>
                  Your trip
                </span>
              )}
            </Name>
            {here && <Check size={17} color={CC.teal} style={{ flexShrink: 0 }} />}
          </div>
        );
      })}
    </List>
  );
}

/* ── 2. A ticket icon ────────────────────────────────────────────────────── */

// The quietest of the five, and the only one that adds no words at all.
// Costs comprehension: an icon has to be learned once before it is read.
export function MarkIcon({ current }) {
  return (
    <List>
      {roomOrder().map(id => {
        const d = getDest(id), here = id === current;
        return (
          <div key={id} style={ROW}>
            <Thumb d={d} />
            <Name d={d} here={here}>
              {BOOKED(d) && <Ticket size={14} color={CC.teal} style={{ flexShrink: 0 }} />}
            </Name>
            {here && <Check size={17} color={CC.teal} style={{ flexShrink: 0 }} />}
          </div>
        );
      })}
    </List>
  );
}

/* ── 3. The dates come back, but only there ──────────────────────────────── */

// A month under one room only is itself the mark: the room you are going to is
// the room with a date. Costs a taller row, and it is easy to read as clutter
// rather than as a signal.
export function MarkDate({ current }) {
  return (
    <List>
      {roomOrder().map(id => {
        const d = getDest(id), here = id === current;
        const mine = BOOKED(d);
        return (
          <div key={id} style={ROW}>
            <Thumb d={d} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: "block", fontSize: 15, fontWeight: 700,
                color: here ? CC.tealInk : CC.ink,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{d.name}</span>
              {mine && d.month && (
                <span style={{ display: "block", fontSize: 12.5, color: CC.tealInk, marginTop: 1 }}>
                  You go in {d.month.split(" ")[0]}
                </span>
              )}
            </span>
            {here && <Check size={17} color={CC.teal} style={{ flexShrink: 0 }} />}
          </div>
        );
      })}
    </List>
  );
}

/* ── 4. Split the list in two ────────────────────────────────────────────── */

// No mark at all. Position carries it, the way every mail app separates your
// own folders from everything else. Costs two extra lines of type, and it only
// works while the booked list is short.
export function MarkGrouped({ current }) {
  const rooms = roomOrder();
  const mine = rooms.filter(id => BOOKED(getDest(id)));
  const rest = rooms.filter(id => !BOOKED(getDest(id)));
  const row = (id) => {
    const d = getDest(id), here = id === current;
    return (
      <div key={id} style={ROW}>
        <Thumb d={d} />
        <Name d={d} here={here} />
        {here && <Check size={17} color={CC.teal} style={{ flexShrink: 0 }} />}
      </div>
    );
  };
  return (
    <List>
      <Head>Where you are going</Head>
      {mine.map(row)}
      <Head style={{ marginTop: 14 }}>Everywhere else</Head>
      {rest.map(row)}
    </List>
  );
}

/* ── 5. A ring on the photo ──────────────────────────────────────────────── */

// The mark lands on the picture, so the row's type is untouched and the list
// still reads as one column of names. Costs the most explanation: a ring means
// nothing until somebody tells you, and it collides with the tick's colour.
export function MarkRing({ current }) {
  return (
    <List>
      {roomOrder().map(id => {
        const d = getDest(id), here = id === current;
        return (
          <div key={id} style={{ ...ROW, gap: 13 }}>
            <Thumb d={d} ring={BOOKED(d)} />
            <Name d={d} here={here} />
            {here && <Check size={17} color={CC.teal} style={{ flexShrink: 0 }} />}
          </div>
        );
      })}
    </List>
  );
}

/* ── Shared frame ────────────────────────────────────────────────────────── */

function List({ children }) {
  return (
    <div style={{
      background: CC.white, borderRadius: 18, border: `1px solid ${CC.line}`,
      padding: "14px 16px 6px",
    }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: CC.ink, margin: "0 0 6px" }}>
        Switch Room
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
      <p style={{
        fontSize: 14.5, fontWeight: 700, color: CC.pink, margin: "12px 0 10px",
      }}>Sunday Lounge Home ›</p>
    </div>
  );
}

function Head({ children, style }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 800, color: CC.soft, margin: "2px 0 4px", ...style,
    }}>{children}</p>
  );
}

export const MARKS = [
  { id: "words", name: "The words, beside the name", Comp: MarkWords },
  { id: "icon", name: "A ticket icon", Comp: MarkIcon },
  { id: "date", name: "A date on that room only", Comp: MarkDate },
  { id: "grouped", name: "The list splits in two", Comp: MarkGrouped },
  { id: "ring", name: "A ring on the photo", Comp: MarkRing },
];
