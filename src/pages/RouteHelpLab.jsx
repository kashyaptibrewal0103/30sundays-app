import { useState, useMemo } from "react";
import {
  Info, ChevronRight, ChevronDown, Map as MapIcon, Play, Check, X as XIcon, HelpCircle,
} from "lucide-react";
import { C } from "../data";
import { destAreas, areaImg, recommendedRoute } from "../data/buildData";
import RouteHelpDrawer from "../components/Build/RouteHelpDrawer";

// Five ways to open the "what is a route" drawer, each shown in place: the real
// heading, the real filter chips and a real route card around it, so the
// variation is judged next to what it actually sits beside.
//
// Everything opens the same drawer. Only the way in changes.

const DEST = "Bali";
const NIGHTS = 8;

// ─── The real neighbours, rebuilt static so the lab needs no wizard state ───

function Chips() {
  const areas = destAreas[DEST] || [];
  const on = ["Ubud", "Seminyak"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "0 0 8px" }}>
      {areas.slice(0, 4).map((a) => {
        const sel = on.includes(a.city);
        return (
          <span key={a.city} style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 20,
            border: `1px solid ${sel ? C.sText : C.div}`, background: sel ? C.sBg : C.white,
            color: sel ? C.sText : C.head, fontSize: 12.5, fontWeight: 700,
          }}>
            {sel && <Check size={12} color={C.sText} strokeWidth={3} />} {a.city}
          </span>
        );
      })}
    </div>
  );
}

function ViewMore() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 13.5, fontWeight: 700, color: C.p600, margin: "0 0 14px" }}>
      View more <ChevronDown size={15} color={C.p600} />
    </span>
  );
}

function RouteCard() {
  const areas = destAreas[DEST] || [];
  const r = useMemo(() => recommendedRoute(DEST, NIGHTS), []);
  return (
    <div style={{
      textAlign: "left", padding: 14, borderRadius: 16,
      border: `1px solid ${C.div}`, background: C.white, boxShadow: "0 1px 3px rgba(24,29,39,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head, letterSpacing: "-0.2px" }}>Route 1</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, color: C.sub, flexShrink: 0 }}>
            <MapIcon size={12} color={C.sub} /> View on map
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.p600, flexShrink: 0 }}>55% chose this</span>
      </div>
      <div style={{ margin: "6px 0 10px" }}>
        {r.map((s, i) => {
          const tag = areas.find((a) => a.city === s.city)?.tag;
          return (
            <div key={s.city} style={{ display: "flex", alignItems: "center", gap: 13, padding: "7px 0" }}>
              <span style={{ position: "relative", flexShrink: 0, width: 34, height: 34, display: "block" }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: 9, overflow: "hidden", display: "block" }}>
                  <img src={areaImg(DEST, s.city, i)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </span>
                <span style={{ position: "absolute", right: -4, bottom: -4, width: 17, height: 17, borderRadius: "50%", background: C.p600, border: "2px solid #fff", display: "grid", placeItems: "center" }}>
                  <Play size={7} color="#fff" fill="#fff" style={{ marginLeft: 0.5 }} />
                </span>
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: C.head, letterSpacing: "-0.2px" }}>
                {s.city} <span style={{ fontWeight: 600, fontSize: 13, color: C.sub }}>({s.n}N)</span>
              </span>
              {tag && <span style={{ fontSize: 11, fontStyle: "italic", color: C.sub, flexShrink: 0, maxWidth: 108, textAlign: "right", lineHeight: 1.3 }}>{tag}</span>}
            </div>
          );
        })}
      </div>
      <span style={{
        display: "inline-flex", width: "100%", boxSizing: "border-box", padding: "10px 0", borderRadius: 22,
        alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
        border: `1.5px solid ${C.p600}`, background: C.white, color: C.p600,
      }}>Select</span>
    </div>
  );
}

const headStyle = { margin: 0, fontSize: 18, fontWeight: 800, color: C.head, letterSpacing: "-0.3px" };

// ─── The five ways in ───

// 1. A plain underlined link under the title. The cheapest, most literal answer.
function V1({ open }) {
  return (
    <>
      <p style={headStyle}>Choose your route for {NIGHTS} Nights</p>
      <button onClick={open} style={{
        margin: "5px 0 12px", padding: 0, border: "none", background: "transparent", cursor: "pointer",
        fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: C.p600,
        textDecoration: "underline", textUnderlineOffset: 3,
      }}>What is a route?</button>
      <Chips /><ViewMore /><RouteCard />
    </>
  );
}

// 2. An info icon beside the title. Takes no line of its own.
function V2({ open }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <p style={headStyle}>Choose your route for {NIGHTS} Nights</p>
        <button onClick={open} aria-label="What is a route?" style={{
          border: "none", background: "transparent", padding: 0, cursor: "pointer",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <Info size={18} color={C.inact} />
        </button>
      </div>
      <Chips /><ViewMore /><RouteCard />
    </>
  );
}

// 3. A tinted strip under the chips. A doorway, so it is allowed its own ground.
function V3({ open }) {
  return (
    <>
      <p style={{ ...headStyle, marginBottom: 12 }}>Choose your route for {NIGHTS} Nights</p>
      <Chips /><ViewMore />
      <button onClick={open} style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box",
        padding: "11px 13px", marginBottom: 12, borderRadius: 12,
        background: C.p100 + "80", border: `1px solid ${C.p100}`, cursor: "pointer",
        fontFamily: "inherit", textAlign: "left",
      }}>
        <HelpCircle size={17} color={C.p600} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: C.head }}>
          New to this? What a route is, and what makes one good
        </span>
        <ChevronRight size={16} color={C.p600} style={{ flexShrink: 0 }} />
      </button>
      <RouteCard />
    </>
  );
}

// 4. The word itself is the link. A dotted underline on "route" is the glossary
//    pattern people already know from reading on the web.
function V4({ open }) {
  return (
    <>
      <p style={headStyle}>
        Choose your{" "}
        <button onClick={open} style={{
          padding: 0, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
          fontSize: 18, fontWeight: 800, color: C.head, letterSpacing: "-0.3px",
          borderBottom: `2px dotted ${C.p600}`, lineHeight: 1,
        }}>route</button>{" "}
        for {NIGHTS} Nights
      </p>
      <p style={{ margin: "4px 0 12px", fontSize: 12.5, color: C.sub }}>
        Where you sleep, and for how long. Tap the word for the full story.
      </p>
      <Chips /><ViewMore /><RouteCard />
    </>
  );
}

// 5. A coach mark the first time only, pointing back up at the title. It earns
//    attention once, then gets out of the way for good.
function V5({ open }) {
  const [shown, setShown] = useState(true);
  return (
    <>
      <p style={{ ...headStyle, marginBottom: shown ? 10 : 12 }}>Choose your route for {NIGHTS} Nights</p>
      {shown && (
        <div style={{ position: "relative", marginBottom: 14 }}>
          {/* The notch, so it reads as pointing at the title above it. */}
          <span style={{
            position: "absolute", top: -5, left: 22, width: 10, height: 10, background: C.head,
            transform: "rotate(45deg)", borderRadius: 2,
          }} />
          <div style={{
            position: "relative", background: C.head, borderRadius: 12, padding: "11px 12px 11px 14px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#fff", lineHeight: "18px" }}>
                A route is where you sleep, in order, and for how many nights.
              </p>
              <button onClick={open} style={{
                margin: "7px 0 0", padding: 0, border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#fff",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}>What makes a good one?</button>
            </div>
            <button onClick={() => setShown(false)} aria-label="Dismiss" style={{
              border: "none", background: "transparent", padding: 0, cursor: "pointer", flexShrink: 0,
            }}>
              <XIcon size={15} color="rgba(255,255,255,0.65)" />
            </button>
          </div>
        </div>
      )}
      <Chips /><ViewMore /><RouteCard />
    </>
  );
}

const VARIANTS = [
  { n: 1, name: "Underlined link under the title", Cmp: V1, cost: "Safest and clearest. Costs a whole line, and sits where the eye is already moving past." },
  { n: 2, name: "Info icon beside the title", Cmp: V2, cost: "Costs no space at all. Also the easiest to miss, and a bare icon never says what it opens." },
  { n: 3, name: "Tinted strip under the chips", Cmp: V3, cost: "Impossible to miss and it says what is inside. The loudest option, and it pushes the first route down." },
  { n: 4, name: "The word route is the link", Cmp: V4, cost: "Answers the question exactly where it is asked. Dotted underlines are faint on a phone, so it needs the helper line under it." },
  { n: 5, name: "Coach mark, once", Cmp: V5, cost: "Teaches without being asked, then leaves. Needs somewhere to remember it was dismissed, and it covers the chips on first load." },
];

export default function RouteHelpLab() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minHeight: "100%", background: C.bg }}>
      <div style={{ background: C.white, padding: "14px 16px 12px", borderBottom: `1px solid ${C.div}` }}>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.head, letterSpacing: "-0.3px" }}>Explaining the route step</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: C.sub }}>Five ways in. All five open the same drawer.</p>
      </div>

      <div style={{ padding: "12px 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {VARIANTS.map(({ n, name, Cmp, cost }) => (
          <div key={n}>
            <div style={{ padding: "0 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%", background: C.head, color: "#fff",
                fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0,
              }}>{n}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.head }}>{name}</span>
            </div>

            {/* The variation at real width, with its real neighbours around it. */}
            <div style={{ background: C.white, padding: "16px 16px 18px", borderTop: `1px solid ${C.div}`, borderBottom: `1px solid ${C.div}` }}>
              <Cmp open={() => setOpen(true)} />
            </div>

            <p style={{ margin: "8px 16px 0", fontSize: 12, color: C.sub, lineHeight: "17px" }}>{cost}</p>
          </div>
        ))}
      </div>

      {open && <RouteHelpDrawer onClose={() => setOpen(false)} />}
    </div>
  );
}
