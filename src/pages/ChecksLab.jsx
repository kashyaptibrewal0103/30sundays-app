import { memo, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "../data";
import { BRAND, BRAND_TINT } from "../data/brand";
import { CHECKS } from "./Generating";

// Ten ways to show "what every trip is checked for" in one short strip on the
// building screen. All live on one page so they can be compared in place.
// Each owns its own clock, so one variant never re-renders another.

const ROTATE_MS = 5000;
const TEAL = BRAND.lagoonBliss;
const TINT = BRAND_TINT.lagoonBliss;
const INK = C.head;
const CARD = { background: C.white, borderRadius: 20, border: "1px solid #ECECEC", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" };
const SLIDE = "labSlide 420ms cubic-bezier(0.22,0.61,0.36,1) both";

function useRotate(n, ms = ROTATE_MS) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((k) => (k + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms, i]);
  return [i, setI];
}

const Emoji = ({ c, size = 36, radius = 11 }) => (
  <span style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, display: "grid", placeItems: "center", fontSize: size * 0.5, background: TINT }}>{c.emoji}</span>
);

// 1. Ticker strip: one line, a hairline underneath fills over the five seconds.
const V1 = memo(function V1() {
  const [i] = useRotate(CHECKS.length);
  const c = CHECKS[i];
  return (
    <div style={{ ...CARD, padding: "12px 14px 0", overflow: "hidden" }}>
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: SLIDE, paddingBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{c.emoji}</span>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: INK, flex: 1 }}>{c.title}</p>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, fontVariantNumeric: "tabular-nums" }}>{i + 1}/{CHECKS.length}</span>
      </div>
      <div style={{ height: 2, background: C.div }}>
        <div key={i} style={{ height: "100%", background: TEAL, transformOrigin: "left", animation: `labFill ${ROTATE_MS}ms linear both` }} />
      </div>
    </div>
  );
});

// 2. Story bars: six segments across the top, the way stories do it.
const V2 = memo(function V2() {
  const [i] = useRotate(CHECKS.length);
  const c = CHECKS[i];
  return (
    <div style={{ ...CARD, padding: "10px 14px 12px", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
        {CHECKS.map((_, k) => (
          <div key={k} style={{ flex: 1, height: 3, borderRadius: 2, background: k < i ? TEAL : C.div, overflow: "hidden" }}>
            {k === i && <div key={i} style={{ height: "100%", background: TEAL, transformOrigin: "left", animation: `labFill ${ROTATE_MS}ms linear both` }} />}
          </div>
        ))}
      </div>
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: SLIDE }}>
        <Emoji c={c} size={32} radius={10} />
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: INK }}>{c.title}</p>
      </div>
    </div>
  );
});

// 3. Card deck: the next two peek out from behind, so the stack is visible.
const V3 = memo(function V3() {
  const [i] = useRotate(CHECKS.length);
  const c = CHECKS[i];
  return (
    <div style={{ position: "relative", paddingBottom: 8 }}>
      <div style={{ ...CARD, position: "absolute", left: 16, right: 16, bottom: 0, height: 40, opacity: 0.5 }} />
      <div style={{ ...CARD, position: "absolute", left: 8, right: 8, bottom: 4, height: 40, opacity: 0.8 }} />
      <div style={{ ...CARD, position: "relative", padding: "12px 14px", overflow: "hidden" }}>
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: SLIDE }}>
          <Emoji c={c} />
          <div>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: TEAL }}>Check {i + 1} of {CHECKS.length}</p>
            <p style={{ margin: "2px 0 0", fontSize: 14.5, fontWeight: 700, color: INK }}>{c.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

// 4. Chip rail: swipeable chips, the live one filled, the rail scrolls itself.
const V4 = memo(function V4() {
  const [i] = useRotate(CHECKS.length);
  const rail = useRef(null);
  useEffect(() => {
    const el = rail.current?.children[i];
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [i]);
  return (
    <div ref={rail} className="hs hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", margin: "0 -14px", padding: "0 14px" }}>
      {CHECKS.map((c, k) => (
        <span key={c.title} style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 999,
          background: k === i ? TEAL : C.white, color: k === i ? "#fff" : INK, border: `1px solid ${k === i ? TEAL : "#ECECEC"}`,
          fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", transition: "background 300ms ease, color 300ms ease",
        }}>
          <span style={{ fontSize: 14 }}>{c.emoji}</span>{c.title}
        </span>
      ))}
    </div>
  );
});

// 5. Checklist: all six in view, ticked one by one, every ten seconds.
const V5 = memo(function V5() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDone((d) => Math.min(CHECKS.length, d + 1)), 10000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ ...CARD, padding: "6px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 12 }}>
      {CHECKS.map((c, k) => {
        const ok = k < done;
        const live = k === done;
        return (
          <div key={c.title} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", opacity: ok || live ? 1 : 0.45, transition: "opacity 400ms ease" }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: ok ? C.sText : C.white, border: ok ? "none" : `1.5px solid ${live ? TEAL : C.div}`, transition: "background 300ms ease" }}>
              {ok && <Check size={11} color="#fff" strokeWidth={3.5} />}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
          </div>
        );
      })}
    </div>
  );
});

// 6. Paged: arrows either side and a count, turns on its own too.
const V6 = memo(function V6() {
  const [i, setI] = useRotate(CHECKS.length);
  const c = CHECKS[i];
  const go = (d) => setI((i + d + CHECKS.length) % CHECKS.length);
  const arrow = (d) => (
    <button onClick={() => go(d)} style={{ width: 30, height: 30, borderRadius: 15, border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0 }}>
      {d < 0 ? <ChevronLeft size={16} color={INK} /> : <ChevronRight size={16} color={INK} />}
    </button>
  );
  return (
    <div style={{ ...CARD, padding: "10px 10px", display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
      {arrow(-1)}
      <div key={i} style={{ flex: 1, minWidth: 0, textAlign: "center", animation: SLIDE }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: INK }}>{c.emoji} {c.title}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 700, color: C.sub }}>{i + 1} of {CHECKS.length} checks</p>
      </div>
      {arrow(1)}
    </div>
  );
});

// 7. Tinted band: the lagoon strip, teal type, the way a payment note sits.
const V7 = memo(function V7() {
  const [i] = useRotate(CHECKS.length);
  const c = CHECKS[i];
  return (
    <div style={{ borderRadius: 14, background: TINT, border: "1px solid #CDEDE9", padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
      <Check size={15} color="#00736A" strokeWidth={3} style={{ flexShrink: 0 }} />
      <p key={i} style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#00736A", flex: 1, minWidth: 0, animation: SLIDE }}>{c.title}</p>
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {CHECKS.map((_, k) => <span key={k} style={{ width: k === i ? 12 : 4, height: 4, borderRadius: 2, background: k === i ? "#00736A" : "#9ED8D1", transition: "width 260ms ease" }} />)}
      </div>
    </div>
  );
});

// 8. Marquee: everything in one slow ticker, never stops, nothing to time.
const V8 = memo(function V8() {
  const items = [...CHECKS, ...CHECKS];
  return (
    <div style={{ ...CARD, padding: "12px 0", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", gap: 28, whiteSpace: "nowrap", animation: "labMarquee 26s linear infinite", width: "max-content" }}>
        {items.map((c, k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: INK }}>
            <span style={{ fontSize: 15 }}>{c.emoji}</span>{c.title}
            <span style={{ width: 4, height: 4, borderRadius: 2, background: C.icon, marginLeft: 20 }} />
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 28, background: "linear-gradient(90deg, #fff, rgba(255,255,255,0))" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 28, background: "linear-gradient(270deg, #fff, rgba(255,255,255,0))" }} />
    </div>
  );
});

// 9. Stat tile: a ring counting the checks, the live one named beside it.
const V9 = memo(function V9() {
  const [i] = useRotate(CHECKS.length);
  const c = CHECKS[i];
  const R = 17, CIRC = 2 * Math.PI * R;
  return (
    <div style={{ ...CARD, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
      <div style={{ width: 42, height: 42, position: "relative", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <svg width="42" height="42" viewBox="0 0 42 42" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle cx="21" cy="21" r={R} fill="none" stroke={C.div} strokeWidth="3" />
          <circle cx="21" cy="21" r={R} fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - (i + 1) / CHECKS.length)} style={{ transition: "stroke-dashoffset 500ms ease" }} />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 800, color: INK, fontVariantNumeric: "tabular-nums" }}>{i + 1}/{CHECKS.length}</span>
      </div>
      <div key={i} style={{ minWidth: 0, animation: SLIDE }}>
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: C.sub }}>Checked for</p>
        <p style={{ margin: "2px 0 0", fontSize: 14.5, fontWeight: 700, color: INK }}>{c.emoji} {c.title}</p>
      </div>
    </div>
  );
});

// 10. Icon rail: six tiles, the live one lifted and ringed, its title beneath.
const V10 = memo(function V10() {
  const [i, setI] = useRotate(CHECKS.length);
  const c = CHECKS[i];
  return (
    <div style={{ ...CARD, padding: "12px 14px 10px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {CHECKS.map((x, k) => (
          <button key={x.title} onClick={() => setI(k)} style={{
            width: 40, height: 40, borderRadius: 13, border: "none", padding: 0, cursor: "pointer", fontSize: 19, display: "grid", placeItems: "center",
            background: k === i ? TINT : C.bg, boxShadow: k === i ? `0 0 0 2px ${TEAL}` : "none",
            transform: k === i ? "translateY(-2px)" : "none", opacity: k === i ? 1 : 0.6,
            transition: "transform 300ms ease, box-shadow 300ms ease, opacity 300ms ease",
          }}>{x.emoji}</button>
        ))}
      </div>
      <p key={i} style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 700, color: INK, textAlign: "center", animation: SLIDE }}>{c.title}</p>
    </div>
  );
});

const VARIANTS = [
  ["Ticker strip", "One line, count on the right, a hairline filling underneath.", V1],
  ["Story bars", "Six segments across the top, the way stories show where you are.", V2],
  ["Card deck", "The next two peek out from behind, so it reads as a stack.", V3],
  ["Chip rail", "Swipeable chips, the live one filled, the rail moves itself.", V4],
  ["Checklist", "All six in view, ticked one by one every ten seconds.", V5],
  ["Paged", "Arrows and a count. Turns on its own, or by hand.", V6],
  ["Tinted band", "A lagoon strip with teal type, like a payment note.", V7],
  ["Marquee", "One slow ticker, never stops, nothing to time.", V8],
  ["Stat ring", "A ring counting through the checks, the live one named beside it.", V9],
  ["Icon rail", "Six tiles, the live one lifted, its title beneath.", V10],
];

export default function ChecksLab() {
  return (
    <div style={{ minHeight: "100%", background: C.bg, padding: "14px 14px 40px" }}>
      <style>{`
        @keyframes labSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
        @keyframes labFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes labMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
      <h1 style={{ margin: "0 0 2px", fontSize: 19, fontWeight: 800, color: INK, letterSpacing: "-0.4px" }}>The checks strip, ten ways</h1>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: C.sub }}>All live. Pick one and it goes into the building screen.</p>
      {VARIANTS.map(([name, blurb, V], k) => (
        <div key={name} style={{ marginBottom: 26 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 800, color: INK }}>{k + 1}. {name}</p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: C.sub }}>{blurb}</p>
          <V />
        </div>
      ))}
    </div>
  );
}
