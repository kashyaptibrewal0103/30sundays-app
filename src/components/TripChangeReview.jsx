import { useEffect, useState } from "react";
import { BedDouble, Sun, Plane, X as XIcon, ArrowRight, ChevronDown, Layers, CalendarDays } from "lucide-react";
import { C } from "../data";

// ─── Before new dates or a new route ───
//
// New dates or a new route are the shape of the trip, and the hotels, day
// plans and flights are all built on it. So before either goes through, the
// trip is shown twice: the version they have, which stays in My Plans as it
// is, and the new version this makes, side by side. Under them, one line each
// for hotels, day plans and flights says what moves, with the detail a tap
// away. Nothing is changed until Create; the old version is never touched.
//
// before / after: { v, dates, nights, route: [{ city, n }], price }
// sections: [{ key, label, status, sub, lines: [{ name, text, off }] }]

const PINK = "#E31B53";
const ICONS = { hotels: BedDouble, days: Sun, flights: Plane };

function VersionCard({ side, data, other }) {
  const isNew = side === "new";
  const known = new Map((other?.route || []).map((r) => [r.city, r.n]));
  // On the new version, what moved is in pink: the dates, the nights, a city.
  const datesMoved = isNew && other && other.dates !== data.dates;
  const nightsMoved = isNew && other && other.nights !== data.nights;
  return (
    <div data-testid={`trip-change-${side}`} style={{
      flex: 1, minWidth: 0, borderRadius: 14, padding: "11px 11px 12px", background: C.white,
      border: isNew ? `1.5px solid ${PINK}` : `1px solid ${C.div}`,
      boxShadow: isNew ? "0 6px 18px rgba(227,27,83,0.12)" : "none",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3,
        borderRadius: 999, padding: "3px 8px",
        background: isNew ? PINK : C.bg, color: isNew ? "#fff" : C.sub,
      }}>
        V{data.v} {isNew ? "· NEW" : "· NOW"}
      </span>
      <p style={{ margin: "9px 0 0", display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: datesMoved ? PINK : C.head }}>
        <CalendarDays size={13} color={isNew ? PINK : C.sub} style={{ flexShrink: 0 }} />
        <span style={{ minWidth: 0 }}>{data.dates}</span>
      </p>
      <p style={{ margin: "2px 0 0 18px", fontSize: 11, color: nightsMoved ? PINK : C.sub, fontWeight: nightsMoved ? 700 : 400 }}>{data.nights} nights</p>
      <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 4 }}>
        {data.route.map((r) => {
          const added = isNew && !known.has(r.city);
          const resized = isNew && known.has(r.city) && known.get(r.city) !== r.n;
          const gone = !isNew && other && !other.route.some((x) => x.city === r.city);
          return (
            <div key={r.city} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, lineHeight: "16px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: added || resized ? PINK : C.icon }} />
              <span style={{
                flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                color: gone ? C.inact : C.head, fontWeight: added ? 700 : 500, textDecoration: gone ? "line-through" : "none",
              }}>{r.city}</span>
              <span style={{ flexShrink: 0, color: added || resized ? PINK : C.sub, fontWeight: added || resized ? 700 : 500 }}>{r.n}N</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, paddingTop: 9, borderTop: `1px dashed ${C.div}` }}>
        <p style={{ margin: 0, fontSize: 10.5, color: C.sub }}>{isNew ? "Price" : "Price now"}</p>
        <p style={{ margin: "1px 0 0", fontSize: isNew ? 12.5 : 14, fontWeight: 700, color: isNew ? PINK : C.head }}>{data.price}</p>
      </div>
    </div>
  );
}

function Section({ s }) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[s.key] || Sun;
  const can = s.lines?.length > 0;
  return (
    <div data-testid={`trip-change-${s.key}`} style={{ borderBottom: `1px solid ${C.div}` }}>
      <button
        onClick={() => can && setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "12px 0", border: "none", background: "none", cursor: can ? "pointer" : "default", fontFamily: "inherit", textAlign: "left" }}
      >
        <span style={{ width: 32, height: 32, borderRadius: 10, background: "#FFF0F3", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={16} color={PINK} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.head }}>{s.label}</span>
          {s.sub && <span style={{ display: "block", fontSize: 11.5, color: C.sub, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.sub}</span>}
        </span>
        <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: s.calm ? C.sub : C.head, background: s.calm ? C.bg : "#FFF5E6", borderRadius: 999, padding: "4px 9px", whiteSpace: "nowrap" }}>
          {s.status}
        </span>
        {can && <ChevronDown size={16} color={C.sub} style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />}
      </button>
      {open && (
        <div style={{ padding: "0 0 12px 43px", display: "flex", flexDirection: "column", gap: 6 }}>
          {s.lines.map((l, k) => (
            <p key={k} style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: l.off ? C.sub : C.head }}>
              {l.name && <span style={{ fontWeight: 600 }}>{l.name}: </span>}
              <span style={{ textDecoration: l.off ? "line-through" : "none" }}>{l.text}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripChangeReview({ kind, before, after, sections, frame, onConfirm, onClose }) {
  const [up, setUp] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setUp(true)); return () => cancelAnimationFrame(id); }, []);
  const close = () => { setUp(false); setTimeout(onClose, 200); };

  return (
    <div data-testid="trip-change-review" style={{ ...frame, zIndex: 330, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.5)", opacity: up ? 1 : 0, transition: "opacity .2s" }} />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0", maxHeight: "92%",
        display: "flex", flexDirection: "column", transform: up ? "none" : "translateY(24px)",
        transition: "transform .22s ease",
      }}>
        <div style={{ padding: "10px 16px 4px", flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: C.div, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: PINK }}>{kind === "dates" ? "NEW TRAVEL DATES" : "NEW ROUTE"}</p>
              <h3 style={{ margin: "3px 0 0", fontSize: 18, fontWeight: 700, color: C.head }}>This makes a new version</h3>
            </div>
            <button onClick={close} aria-label="Close" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
              <XIcon size={16} color={C.head} />
            </button>
          </div>
        </div>

        <div className="hide-scrollbar" style={{ overflowY: "auto", padding: "10px 16px 6px" }}>
          {/* The two versions, side by side */}
          <div style={{ position: "relative", display: "flex", gap: 10, alignItems: "stretch" }}>
            <VersionCard side="old" data={before} other={after} />
            <VersionCard side="new" data={after} other={before} />
            <span aria-hidden style={{
              position: "absolute", left: "50%", top: 44, width: 26, height: 26, marginLeft: -13, borderRadius: "50%",
              background: C.white, border: `1px solid ${C.div}`, display: "grid", placeItems: "center",
              boxShadow: "0 2px 6px rgba(16,24,40,0.10)",
            }}>
              <ArrowRight size={14} color={PINK} />
            </span>
          </div>

          {/* The old version is kept */}
          <div data-testid="trip-change-kept" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.div}` }}>
            <Layers size={17} color={PINK} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: C.head }}>
              <b>V{before.v} stays in My Plans</b>, just as it is. Compare V{before.v} and V{after.v} there any time.
            </p>
          </div>

          {/* What moves, one line each */}
          <p style={{ margin: "18px 0 0", fontSize: 13, fontWeight: 700, color: C.head }}>What changes in V{after.v}</p>
          <div style={{ marginTop: 2 }}>
            {sections.map((s) => <Section key={s.key} s={s} />)}
          </div>
        </div>

        <div style={{ padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${C.div}`, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={close} data-testid="trip-change-keep" style={{ flex: "0 0 38%", height: 48, borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Keep V{before.v}
            </button>
            <button onClick={onConfirm} data-testid="trip-change-confirm" style={{ flex: 1, height: 48, borderRadius: 12, border: "none", background: PINK, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              Create V{after.v}
            </button>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 10.5, color: C.inact, textAlign: "center" }}>We fetch the latest prices as we save V{after.v}.</p>
        </div>
      </div>
    </div>
  );
}
