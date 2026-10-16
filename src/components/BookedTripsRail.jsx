import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X as XIcon, SlidersHorizontal } from "lucide-react";
import { C } from "../data";
import { DEST_OPTIONS, BUDGET_CHIPS, SORTS, BOOKED_TRIPS, filterTrips, sortTrips } from "../data/bookedTrips";
import { FilterChip } from "../pages/HotelListing";
import BookedCard from "./booked_lab/BookedCard";

// ─── Real travellers, real itineraries ───
//
// Proof you can scroll. The reviews further down say we are good; this says
// what other travellers actually bought, where it went and what it cost, last
// week. It sits after Sunday School because that is where a couple works out
// which country they want, and this is what they ask for next.
//
// The filters used to sit above the rail, which put three controls in front of
// a couple before they had seen a single trip. They live in the View all sheet
// now, where someone is actually looking for something specific. The rail
// itself is just the trips.

const PAD = 18;

// ─── Sort and filter ───
//
// The same sheet the change-day and change-hotel screens use, so a couple
// meets one filter pattern across the app rather than three: two tabs, chips
// inside, reset on the left and a count on the button.
function SortFilterSheet({ tab, setTab, f, setF, matchCount, onClose }) {
  const toggle = (group, key) => setF((d) => ({
    ...d,
    [group]: d[group].includes(key) ? d[group].filter((x) => x !== key) : [...d[group], key],
  }));
  const activeCount = f.dests.length + f.budgets.length;
  const label = (t) => <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>{t}</p>;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", zIndex: 1, height: "72%", display: "flex", flexDirection: "column" }}>
        <div style={{ flexShrink: 0, padding: "14px 20px 0", display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: 1, display: "flex" }}>
            {["Filters", "Sort"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, fontSize: 15, fontWeight: tab === t ? 600 : 500, color: tab === t ? C.head : C.inact,
                background: "none", border: "none", cursor: "pointer", padding: "0 0 12px", fontFamily: "inherit",
                borderBottom: tab === t ? `2px solid ${C.p600}` : "2px solid transparent", textAlign: "center",
              }}>{t}</button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 28, height: 28, borderRadius: "50%", background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 4 }}>
            <XIcon size={14} color={C.sub} />
          </button>
        </div>

        {tab === "Sort" && (
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "8px 20px 24px" }}>
            {SORTS.map((opt, i) => (
              <button key={opt.key} onClick={() => { setF((d) => ({ ...d, sort: opt.key })); onClose(); }} style={{
                display: "block", width: "100%", textAlign: "left", padding: "12px 0",
                background: "none", border: "none",
                borderBottom: i < SORTS.length - 1 ? `1px solid ${C.div}` : "none",
                fontSize: 14, color: f.sort === opt.key ? C.p600 : C.head,
                fontWeight: f.sort === opt.key ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
              }}>
                {opt.label} {f.sort === opt.key && "✓"}
              </button>
            ))}
          </div>
        )}

        {tab === "Filters" && (
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
            {label("Budget")}
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
              {BUDGET_CHIPS.map((b) => (
                <FilterChip key={b.label} label={b.label} on={f.budgets.includes(b.label)} onClick={() => toggle("budgets", b.label)} />
              ))}
            </div>

            {label("Destination")}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DEST_OPTIONS.map((d) => (
                <FilterChip key={d} label={d} on={f.dests.includes(d)} onClick={() => toggle("dests", d)} />
              ))}
            </div>
          </div>
        )}

        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, padding: "10px 20px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setF((d) => ({ dests: [], budgets: [], sort: d.sort }))}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
              fontSize: 13.5, fontWeight: 600, color: activeCount ? C.head : C.inact,
              textDecoration: "underline", textUnderlineOffset: 3, flexShrink: 0,
            }}
          >Reset all</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
            background: C.p600, color: "#fff", fontSize: 14.5, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Show {matchCount} {matchCount === 1 ? "trip" : "trips"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Every trip, in one scroll ───
//
// The rail answers "show me something"; this answers "show me the one I want",
// which is where filters belong. They sit along the bottom, in reach of the
// thumb and after the list rather than in front of it.
function AllTripsSheet({ onClose }) {
  const [closing, setClosing] = useState(false);
  const [f, setF] = useState({ dests: [], budgets: [], sort: "recommended" });
  const [sheet, setSheet] = useState(false);
  const [tab, setTab] = useState("Filters");
  const close = () => { setClosing(true); setTimeout(onClose, 220); };

  const trips = sortTrips(filterTrips(f.dests, f.budgets), f.sort);
  const activeCount = f.dests.length + f.budgets.length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={close} style={{
        position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)",
        animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out",
      }} />
      <div style={{
        position: "relative", background: C.bg, borderRadius: "20px 20px 0 0",
        maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box",
        height: "88%", display: "flex", flexDirection: "column", overflow: "hidden",
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ background: C.white, padding: "10px 0 0", flexShrink: 0, borderBottom: `1px solid ${C.div}` }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `0 ${PAD}px 12px` }}>
            <p style={{ margin: 0, flex: 1, fontSize: 17, fontWeight: 800, color: C.head, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
              Real traveller itineraries
            </p>
            <button onClick={close} aria-label="Close" style={{
              width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}><XIcon size={16} color={C.head} /></button>
          </div>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: `14px ${PAD}px 20px` }}>
          {trips.length === 0 ? (
            <p style={{ margin: "20px 0 0", fontSize: 13, color: C.sub, textAlign: "center" }}>
              No trips match that yet. Try a wider budget.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {trips.map((t) => <BookedCard key={t.key} t={t} wide />)}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, background: C.white, borderTop: `1px solid ${C.div}`, boxShadow: "0 -4px 14px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px" }}>
            <div className="hs" style={{ flex: 1, gap: 6, paddingBottom: 0, minWidth: 0 }}>
              {BUDGET_CHIPS.map((b) => {
                const on = f.budgets.includes(b.label);
                return (
                  <button
                    key={b.label}
                    onClick={() => setF((d) => ({
                      ...d,
                      budgets: on ? d.budgets.filter((x) => x !== b.label) : [...d.budgets, b.label],
                    }))}
                    style={{
                      flexShrink: 0, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit",
                      border: on ? `1.5px solid ${C.p600}` : `1.5px solid ${C.div}`,
                      background: on ? C.p100 : C.white,
                      fontSize: 12, fontWeight: 500, color: on ? C.p600 : C.head, whiteSpace: "nowrap",
                    }}
                  >{b.label}</button>
                );
              })}
            </div>
            <div style={{ width: 1, height: 24, background: C.div, flexShrink: 0 }} />
            <button
              onClick={() => { setTab("Filters"); setSheet(true); }}
              aria-label="Sorting and filters"
              style={{
                position: "relative", width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: activeCount > 0 ? C.p100 : "transparent",
                border: activeCount > 0 ? `1.5px solid ${C.p600}` : `1px solid ${C.div}`,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={14} color={activeCount > 0 ? C.p600 : C.sub} />
              {activeCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%",
                  background: C.p600, color: "#fff", fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{activeCount}</span>
              )}
            </button>
          </div>
        </div>

        {sheet && (
          <SortFilterSheet
            tab={tab} setTab={setTab} f={f} setF={setF}
            matchCount={trips.length} onClose={() => setSheet(false)}
          />
        )}
      </div>
    </div>
  );
}

// `style` lets a page with its own ground (the warm lab homes) host the rail
// without a white band across it, and `titleColor` matches that page's
// headings. The cards stay white either way.
export default function BookedTripsRail({ style, titleColor = C.head, title = "Real traveller itineraries", sub = null, titleStyle }) {
  const [all, setAll] = useState(false);

  return (
    <div style={{ marginTop: 32, background: C.white, ...style }}>
      <div style={{ display: "flex", alignItems: sub ? "flex-start" : "center", gap: 10, padding: `0 ${PAD}px`, marginBottom: 13 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: titleColor, letterSpacing: "-0.5px", ...titleStyle }}>
            {title}
          </h2>
          {sub && <p style={{ fontSize: 13, color: C.sub, margin: "3px 0 0" }}>{sub}</p>}
        </div>
        <button onClick={() => setAll(true)} style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, marginTop: sub ? 3 : 0,
          border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
          fontSize: 12.5, fontWeight: 700, color: C.p600,
        }}>View all <ArrowRight size={13} /></button>
      </div>

      <div className="hs" style={{ gap: 13, paddingLeft: PAD, paddingRight: PAD, alignItems: "stretch" }}>
        {BOOKED_TRIPS.map((t) => <BookedCard key={t.key} t={t} />)}
      </div>

      {/* Rendered at the top of the page, not inside the rail. A host page can
          sit in a low layer (the lab homes do, to stay above their pinned
          hero), and a sheet trapped in there opens under the bottom bar. */}
      {all && createPortal(<AllTripsSheet onClose={() => setAll(false)} />, document.body)}
    </div>
  );
}
