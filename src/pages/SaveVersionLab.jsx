import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Sparkles, ChevronUp, ChevronDown, Info,
} from "lucide-react";
import { C } from "../data";
import SaveVersionNote from "../components/SaveVersionNote";

// ─── Why people do not tap Save ───
//
// The screen says "Not saved yet, your consultant can't see this", which names
// a cost and no benefit. The feedback says people read saving as risky: they
// think the version they already have will be replaced by the one they are
// editing.
//
// Three things are true and none of them are on the screen:
//
//   1. Saving adds a version. The one you already have stays, and the two can
//      be compared.
//   2. Saving produces the PDF.
//   3. Saving is what lets the consultant see it and take it forward.
//
// Two places to say it, on a mock of the screen in its unsaved state. Both lead
// with the version point, because that is the one stopping the tap.

const OPTIONS = [
  { key: "A", name: "Line under the price", note: "Smallest change, always on screen. A narrow column beside the button, so it has to be shorthand." },
  { key: "B", name: "Strip above the bar", note: "Full width, so the point can be made in a sentence instead of a fragment." },
];



export default function SaveVersionLab() {
  const navigate = useNavigate();
  const [opt, setOpt] = useState("A");
  const [openChanges, setOpenChanges] = useState(false);
  const current = OPTIONS.find((o) => o.key === opt);

  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Lab controls */}
      <div style={{ flexShrink: 0, background: "#FBFAF9", borderBottom: `1px solid ${C.div}`, padding: "12px 14px 11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={19} color={C.head} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>Saving does not overwrite</p>
            <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Two ways to say it on an unsaved itinerary</p>
          </div>
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              data-testid={`save-opt-${o.key}`}
              onClick={() => setOpt(o.key)}
              style={{
                flexShrink: 0, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                border: `1px solid ${opt === o.key ? C.p600 : C.div}`,
                background: opt === o.key ? C.p600 : C.white,
                color: opt === o.key ? "#fff" : C.sub,
              }}
            >
              {o.key}. {o.name}
            </button>
          ))}
        </div>
        <p style={{ margin: "9px 2px 0", fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>{current.note}</p>
      </div>

      {/* ── The screen, mocked ── */}
      <div style={{ flex: 1, overflowY: "auto" }} className="hide-scrollbar">
        <div style={{ padding: "14px 16px 20px" }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 14px" }}>Itinerary at a glance</p>
          {[
            { d: "Day 5", city: "Hoi An", line: "Ancient town walk, Cooking class" },
            { d: "Day 6", city: "Hoi An", line: "Leisure day, the day is yours" },
            { d: "Day 7", city: "Hoi An", line: "Tra Que herb village, Basket boat ride" },
            { d: "Day 8", city: "Da Nang", line: "Checkout, then transfer to the airport" },
          ].map((x) => <MockDay key={x.d} {...x} />)}
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div style={{ flexShrink: 0 }}>
        {/* Changes panel, as it is today */}
        <div style={{ background: C.white, borderTop: `1px solid ${C.div}`, boxShadow: "0 -6px 20px rgba(0,0,0,0.07)" }}>
          <button onClick={() => setOpenChanges((s) => !s)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            <Sparkles size={14} color={C.p600} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.head, flex: 1, textAlign: "left" }}>1 change since your last version</span>
            {openChanges ? <ChevronDown size={16} color={C.sub} /> : <ChevronUp size={16} color={C.sub} />}
          </button>
          {openChanges && (
            <div style={{ padding: "0 16px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${C.bg}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.head }}>Day 6 · Hoi An</p>
                  <p style={{ margin: "1px 0 0", fontSize: 12, color: C.sub }}>Leisure day instead of Marble Mountains</p>
                </div>
                <button style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.div}`, background: C.white, fontSize: 12, fontWeight: 600, color: C.head, cursor: "pointer", fontFamily: "inherit" }}>Undo</button>
              </div>

            </div>
          )}
        </div>

        {/* B is the component that ships, so the lab cannot drift from live */}
        {opt === "B" && <SaveVersionNote hasPrevious />}

        {/* Price + CTA row */}
        <div style={{ background: "rgba(255,255,255,0.97)", padding: "10px 16px 12px", display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", borderTop: `1px solid ${C.div}` }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Indicative total</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head }}>₹2,04,000</p>
              <Info size={15} color={C.sub} />
            </div>
            {opt === "A" ? (
              <p data-testid="save-a" style={{ margin: "3px 0 0", fontSize: 10.5, lineHeight: "14px", color: C.inact }}>
                <span style={{ color: C.head, fontWeight: 700 }}>Saving creates a new version</span><br />
                Your older version stays saved.<br />
                You get the PDF, consultant sees it.
              </p>
            ) : (
              <p style={{ margin: "2px 0 0", fontSize: 10.5, color: C.inact }}>Not saved yet</p>
            )}
          </div>
          <button
            data-testid="save-cta"
            style={{
              flexShrink: 0, padding: "12px 18px", borderRadius: 12, border: "none", background: C.p600,
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(227,27,83,0.3)",
            }}
          >
            Save Itinerary
          </button>
        </div>
      </div>

    </div>
  );
}

// ════════════════ Mock furniture ════════════════
const IMG = "https://cdn.30sundays.club/app_content/vietnam/kissing_bridge_495.jpg";
function MockDay({ d, city, line }) {
  return (
    <div style={{ display: "flex", gap: 0, border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden", marginBottom: 12, background: C.white }}>
      <div style={{ width: 96, minWidth: 96, background: C.div, position: "relative" }}>
        <img src={IMG} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: "10px 12px" }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 0.4, textTransform: "uppercase" }}>{d} · {city}</p>
        <p style={{ margin: "6px 0 0", fontSize: 12.5, color: C.head, lineHeight: "17px" }}>{line}</p>
        <p style={{ margin: "7px 0 0", fontSize: 12.5, fontWeight: 700, color: C.p600 }}>Change day plan</p>
      </div>
    </div>
  );
}
