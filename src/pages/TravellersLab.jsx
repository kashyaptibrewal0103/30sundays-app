import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Plane } from "lucide-react";
import BookedCard from "../components/booked_lab/BookedCard";
import { AllTripsSheet } from "../components/BookedTripsRail";
import { BOOKED_TRIPS } from "../data/bookedTrips";
import { customerPhotos } from "../data";
import { W, NAVY } from "./home_lab/labShared";

// Round two: five light openings for the travellers section. Each takes an
// idea from the references (an annotated word, an editorial serif, cards with
// depth) and does something of its own with it. No dark bands, no pink, no
// subtitles, no pronouns. Real cards and the real View all sheet throughout.

const PAD = 18;
const SANS = "Figtree, system-ui, sans-serif";
const SERIF = "'DM Serif Display', Georgia, serif";
const HAND = "'Caveat', 'Figtree', cursive";
const LAGOON = "#00A898";
const LAGOON_INK = "#007E72";
const GOLD = "#FDA201";

const TRIPS = BOOKED_TRIPS.slice(0, 6);

function useSeen(threshold = 0.6) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

function ViewAll({ onClick, color = NAVY, style }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, padding: 0,
      border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
      fontSize: 13, fontWeight: 700, color, ...style,
    }}>View all <ArrowRight size={14} /></button>
  );
}

function Rail({ trips = TRIPS, decorate, padTop = 0 }) {
  return (
    <div className="hs" style={{ gap: 14, paddingLeft: PAD, paddingRight: PAD, paddingTop: padTop, paddingBottom: 6, alignItems: "stretch" }}>
      {trips.map((t, i) => (
        <div key={t.key} style={{ position: "relative", display: "flex", flexShrink: 0 }}>
          <BookedCard t={t} />
          {decorate?.(i)}
        </div>
      ))}
    </div>
  );
}

// ─── A. Marker and margin note ───
// The circled word, reworked: a gold highlighter swipe across "real travellers"
// and a handwritten note with an arrow pointing at the freshest booking.
function A({ onAll }) {
  const [ref, seen] = useSeen();
  return (
    <div style={{ background: W.page, padding: "30px 0 22px" }}>
      <div ref={ref} style={{ position: "relative", padding: `0 ${PAD}px`, marginBottom: 26 }}>
        <h2 style={{ margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 30, lineHeight: "37px", letterSpacing: "-0.8px", color: NAVY }}>
          Recently booked by<br />
          <span style={{ position: "relative", display: "inline-block", zIndex: 0 }}>
            <svg viewBox="0 0 220 40" preserveAspectRatio="none" aria-hidden="true" style={{
              position: "absolute", left: -6, right: -8, top: 8, width: "calc(100% + 14px)", height: 30, zIndex: -1,
              transformOrigin: "left", transform: seen ? "scaleX(1)" : "scaleX(0)", transition: "transform 0.7s cubic-bezier(.2,.8,.2,1) 0.15s",
            }}>
              <path d="M4 12 C 60 4, 150 6, 216 9 L 214 33 C 150 36, 70 34, 6 37 Z" fill={GOLD} opacity="0.42" />
            </svg>
            real travellers
          </span>
        </h2>
        {/* The margin note, pointing down at the first card. */}
        <div style={{ position: "absolute", right: 22, bottom: -24, display: "flex", alignItems: "flex-end", gap: 2, transform: "rotate(-4deg)",
          opacity: seen ? 1 : 0, transition: "opacity 0.4s ease 0.8s" }}>
          <svg width="38" height="34" viewBox="0 0 38 34" aria-hidden="true" style={{ marginBottom: -6 }}>
            <path d="M34 4 C 22 6, 10 14, 8 28" fill="none" stroke={LAGOON_INK} strokeWidth="2" strokeLinecap="round" />
            <path d="M3 22 L 8 29 L 14 23" fill="none" stroke={LAGOON_INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: HAND, fontSize: 22, fontWeight: 700, color: LAGOON_INK, lineHeight: 1 }}>{TRIPS[0].when}!</span>
        </div>
      </div>
      <Rail />
      <div style={{ padding: `12px ${PAD}px 0` }}><ViewAll onClick={onAll} /></div>
    </div>
  );
}

// ─── B. Faces inside the headline ───
// The editorial serif, with real traveller photos set into the sentence
// itself, so the proof is part of the words rather than under them.
function B({ onAll }) {
  const faces = [customerPhotos.Bali?.[0], customerPhotos.Maldives?.[0], customerPhotos.Vietnam?.[0]].filter(Boolean);
  return (
    <div style={{ background: "linear-gradient(#EFF8F7, #FDF8F5)", padding: "32px 0 22px" }}>
      <div style={{ padding: `0 ${PAD}px`, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 33, lineHeight: "44px", color: NAVY, letterSpacing: "-0.3px" }}>
          Booked by{" "}
          <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", padding: 3, borderRadius: 999, background: "#fff", boxShadow: "0 3px 10px rgba(0,80,72,0.14)", margin: "0 2px", position: "relative", top: -3 }}>
            {faces.map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", marginLeft: i ? -10 : 0 }} />
            ))}
          </span>{" "}
          real travellers
        </h2>
        <ViewAll onClick={onAll} color={LAGOON_INK} style={{ marginTop: 10 }} />
      </div>
      <Rail />
    </div>
  );
}

// ─── C. A plane on its way, and a spinning stamp ───
// Motion without a dark band: a little plane crosses a dotted route under the
// headline, and a round stamp turns slowly beside it.
function Stamp() {
  const text = "real travellers · real trips · ";
  return (
    <span style={{ position: "relative", width: 78, height: 78, flexShrink: 0, display: "grid", placeItems: "center" }}>
      <svg viewBox="0 0 100 100" width="78" height="78" style={{ position: "absolute", inset: 0, animation: "tlSpin 16s linear infinite" }} aria-hidden="true">
        <defs><path id="tlCircle" d="M50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" /></defs>
        <circle cx="50" cy="50" r="48" fill="#fff" stroke={LAGOON} strokeWidth="1.5" />
        {/* textLength stretches the words to meet themselves all the way round. */}
        <text style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, fill: LAGOON_INK }}>
          <textPath href="#tlCircle" textLength="224" lengthAdjust="spacing">{text}</textPath>
        </text>
      </svg>
      <span style={{ position: "relative", width: 30, height: 30, borderRadius: "50%", background: "#E5F6F5", display: "grid", placeItems: "center" }}>
        <Plane size={15} color={LAGOON_INK} />
      </span>
    </span>
  );
}

function C({ onAll }) {
  return (
    <div style={{ background: W.page, padding: "26px 0 22px" }}>
      <style>{`
        @keyframes tlSpin { to { transform: rotate(360deg); } }
        @keyframes tlFly { 0% { left: -6%; opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: `0 ${PAD}px` }}>
        <h2 style={{ margin: 0, flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 30, lineHeight: "34px", letterSpacing: "-0.8px", color: NAVY }}>
          Recently<br />booked
        </h2>
        <Stamp />
      </div>
      {/* The route: a dotted line with a plane flying along it. */}
      <div style={{ position: "relative", height: 26, margin: `10px ${PAD}px 12px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 12, borderTop: `2px dashed ${GOLD}`, opacity: 0.6 }} />
        <Plane size={18} color={GOLD} fill={GOLD} style={{ position: "absolute", top: 3, transform: "rotate(45deg)", animation: "tlFly 6s ease-in-out infinite" }} />
      </div>
      <Rail />
      <div style={{ padding: `12px ${PAD}px 0` }}><ViewAll onClick={onAll} /></div>
    </div>
  );
}

// ─── D. Scrapbook ───
// A short, loud headline with a handwritten aside, and each card taped down
// like a print in a travel journal.
const TAPE = [
  "repeating-linear-gradient(45deg, rgba(253,162,1,0.55) 0 6px, rgba(253,162,1,0.38) 6px 12px)",
  "repeating-linear-gradient(45deg, rgba(0,168,152,0.45) 0 6px, rgba(0,168,152,0.3) 6px 12px)",
  "repeating-linear-gradient(45deg, rgba(83,74,183,0.38) 0 6px, rgba(83,74,183,0.24) 6px 12px)",
];

function D({ onAll }) {
  return (
    <div style={{ background: `${W.page} radial-gradient(rgba(24,30,76,0.07) 1px, transparent 1.2px) 0 0 / 16px 16px`, padding: "30px 0 22px" }}>
      <div style={{ position: "relative", padding: `0 ${PAD}px`, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 40, lineHeight: "42px", letterSpacing: "-1.4px", color: NAVY }}>Just booked</h2>
        <span style={{ position: "absolute", left: 150, top: 34, fontFamily: HAND, fontSize: 25, fontWeight: 700, color: LAGOON_INK, transform: "rotate(-5deg)", whiteSpace: "nowrap" }}>
          by real travellers
        </span>
      </div>
      <Rail padTop={10} decorate={(i) => (
        <span aria-hidden="true" style={{
          position: "absolute", top: -9, left: "50%", width: 64, height: 20, marginLeft: -32,
          background: TAPE[i % TAPE.length], transform: `rotate(${i % 2 ? 3 : -4}deg)`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)", borderRadius: 2,
        }} />
      )} />
      <div style={{ padding: `12px ${PAD}px 0` }}><ViewAll onClick={onAll} /></div>
    </div>
  );
}

// ─── E. A deck to flip through ───
// Depth instead of a rail: one trip at a time with the next two waiting behind
// it. Swipe or tap the arrows; the front card goes to the back of the pile.
function E({ onAll }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(0); // -1 left, 1 right, 0 idle
  const start = useRef(null);
  const n = TRIPS.length;
  const go = (dir) => {
    if (leaving) return;
    setLeaving(dir);
    setTimeout(() => { setI((v) => (v + (dir < 0 ? 1 : n - 1)) % n); setLeaving(0); }, 280);
  };
  const stack = [0, 1, 2].map((k) => TRIPS[(i + k) % n]);

  return (
    <div style={{ background: "linear-gradient(#FFF6E3, #FDF8F5)", padding: "28px 0 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: `0 ${PAD}px`, marginBottom: 22 }}>
        <h2 style={{ margin: 0, flex: 1, fontFamily: SERIF, fontWeight: 400, fontSize: 32, lineHeight: "36px", color: NAVY }}>Recently booked</h2>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6, fontVariantNumeric: "tabular-nums" }}>
          {String(i + 1).padStart(2, "0")}<span style={{ opacity: 0.4 }}> / {String(n).padStart(2, "0")}</span>
        </span>
      </div>

      <div
        onPointerDown={(e) => { start.current = e.clientX; }}
        onPointerUp={(e) => { if (start.current == null) return; const dx = e.clientX - start.current; start.current = null; if (Math.abs(dx) > 40) go(dx < 0 ? -1 : 1); }}
        style={{ position: "relative", height: 300, margin: `0 ${PAD + 30}px 0 ${PAD}px`, touchAction: "pan-y" }}
      >
        {stack.slice().reverse().map((t, rk) => {
          const k = 2 - rk; // 0 is the front card
          const front = k === 0;
          const out = front && leaving;
          const tf = out
            ? `translateX(${leaving * 115}%) rotate(${leaving * 10}deg)`
            : `translateX(${k * 17}px) translateY(${k * 4}px) scale(${1 - k * 0.045}) rotate(${k * 2.6}deg)`;
          return (
            <div key={t.key + k} style={{
              position: "absolute", inset: 0, transform: tf, transformOrigin: "left center",
              opacity: out ? 0 : 1, transition: "transform 0.28s ease, opacity 0.28s ease",
              filter: front ? "none" : "brightness(0.97)", pointerEvents: front ? "auto" : "none",
            }}>
              <BookedCard t={t} wide />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `16px ${PAD}px 0` }}>
        {[[-1, ChevronLeft, "Previous"], [1, ChevronRight, "Next"]].map(([d, Icon, label]) => (
          <button key={label} aria-label={label} onClick={() => go(d === 1 ? -1 : 1)} style={{
            width: 38, height: 38, borderRadius: "50%", border: "1px solid #E4DCD2", background: "#fff",
            display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(120,86,40,0.08)",
          }}><Icon size={18} color={NAVY} /></button>
        ))}
        <span style={{ flex: 1 }} />
        <ViewAll onClick={onAll} />
      </div>
    </div>
  );
}

const VARIANTS = [
  { C: A, name: "Marker and margin note", note: "A gold highlighter swipe and a handwritten note pointing at the newest trip.",
    cost: "Feels hand-made and points the eye straight at a card. The note says the newest card's time, so it changes as bookings come in." },
  { C: B, name: "Faces in the headline", note: "Real traveller photos set into the sentence, on a pale lagoon wash.",
    cost: "Puts people up front without a single extra line. Needs good face photos to hold up at this size." },
  { C: C, name: "Plane and stamp", note: "A spinning round stamp, and a plane that keeps flying along a dotted route.",
    cost: "The most movement on a light ground. Two moving things at once can feel busy next to the cards." },
  { C: D, name: "Scrapbook", note: "Big short headline, a handwritten aside, cards taped down like prints.",
    cost: "Playful and warm, like a travel journal. The dotted paper and tape are a whole new style on this home." },
  { C: E, name: "Deck", note: "One trip at a time with two waiting behind. Swipe or tap the arrows.",
    cost: "The most tactile, and each trip gets full width. Only one trip shows at a time, so fewer get seen." },
];

export default function TravellersLab() {
  const [all, setAll] = useState(false);
  const onAll = () => setAll(true);
  return (
    <div style={{ minHeight: "100%", background: W.page }}>
      <div style={{ padding: `16px ${PAD}px 12px`, background: "#fff", borderBottom: "1px solid #E9EAEB" }}>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px" }}>Real travellers, five more ways</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: "#535862" }}>All light. Each one opens the section after Sunday School.</p>
      </div>
      {VARIANTS.map(({ C: V, name, note, cost }, i) => (
        <div key={name} style={{ paddingTop: 22 }}>
          <div style={{ padding: `0 ${PAD}px 10px`, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: NAVY, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{"ABCDE"[i]}</span>
            <span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: "22px" }}>{name}</span>
              <span style={{ display: "block", fontSize: 12, color: "#535862", lineHeight: "17px" }}>{note}</span>
            </span>
          </div>
          <V onAll={onAll} />
          <p style={{ margin: "8px 18px 0", fontSize: 12, color: "#535862", lineHeight: "17px" }}>{cost}</p>
        </div>
      ))}
      <div style={{ height: 40 }} />
      {all && createPortal(<AllTripsSheet onClose={() => setAll(false)} />, document.body)}
    </div>
  );
}
