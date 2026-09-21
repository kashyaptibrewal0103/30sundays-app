import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { C } from "../../data";
import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, LabVideo, NAVY, PAD, W } from "./labShared";

// Five takes on the one action, each shown the way it is actually seen: sitting
// on the bottom edge of the clip. Same words every time, so the only thing
// being compared is the shape.

const LABEL = "Plan my trip";

// 1. White card with a fuchsia circle. The card is the target, the circle is
//    the affordance. Quiet, and the closest to Crew's own trip card.
function CardArrow() {
  return (
    <Link to="/build" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: W.card, borderRadius: 22, padding: 16, boxShadow: W.shadowLg }}>
      <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 17, fontWeight: 800, color: C.head, letterSpacing: "-0.3px" }}>{LABEL}</p>
      <span style={{ width: 42, height: 42, borderRadius: 21, background: C.p600, display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 6px 16px rgba(227,27,83,0.32)" }}>
        <ArrowRight size={18} color="#fff" strokeWidth={2.4} />
      </span>
    </Link>
  );
}

// 2. One fuchsia pill, full width. What the marketing site already does with
//    Request a quote, so it is the most familiar of the five.
function Pill() {
  return (
    <Link to="/build" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.p600, color: "#fff", borderRadius: 999, padding: "16px 26px", fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 10px 28px rgba(227,27,83,0.34)" }}>
      {LABEL} <ArrowRight size={17} />
    </Link>
  );
}

// 3. One card in two tones: the words on white, the action on fuchsia, flush to
//    the card edge. Louder than the circle without becoming a full pink block.
function Split() {
  return (
    <Link to="/build" style={{ display: "flex", alignItems: "stretch", textDecoration: "none", background: W.card, borderRadius: 22, overflow: "hidden", boxShadow: W.shadowLg }}>
      <p style={{ flex: 1, minWidth: 0, margin: 0, padding: "20px 16px", fontSize: 17, fontWeight: 800, color: C.head, letterSpacing: "-0.3px" }}>{LABEL}</p>
      <span style={{ width: 64, background: C.p600, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <ArrowRight size={20} color="#fff" strokeWidth={2.4} />
      </span>
    </Link>
  );
}

// 4. The card itself in fuchsia, words in white. The strongest of the five, and
//    the one that spends the most colour: nothing else on the screen can shout.
function Inverted() {
  return (
    <Link to="/build" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: C.p600, borderRadius: 22, padding: 16, boxShadow: "0 12px 32px rgba(227,27,83,0.36)" }}>
      <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>{LABEL}</p>
      <span style={{ width: 42, height: 42, borderRadius: 21, background: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <ArrowRight size={18} color={C.p600} strokeWidth={2.4} />
      </span>
    </Link>
  );
}

// 5. A question rather than a command. Reads as a place to start, not a form to
//    submit, which suits a page whose job is to get people looking.
function Prompt() {
  return (
    <Link to="/build" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", background: W.card, borderRadius: 999, padding: "10px 10px 10px 18px", boxShadow: W.shadowLg }}>
      <Search size={17} color={C.inact} strokeWidth={2.4} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, color: C.sub }}>Where would you like to go?</span>
      <span style={{ width: 40, height: 40, borderRadius: 20, background: C.p600, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <ArrowRight size={17} color="#fff" strokeWidth={2.4} />
      </span>
    </Link>
  );
}

const TAKES = [
  { n: 1, name: "White card, circle", cost: "Quietest. On a busy photo the fuchsia circle is the only thing that says tap.", El: CardArrow },
  { n: 2, name: "Fuchsia pill", cost: "Most familiar, and it matches the website. Covers more of the clip than a card.", El: Pill },
  { n: 3, name: "Two tone card", cost: "Clear where to tap without a full pink block. The hardest of the five to fit a longer label into.", El: Split },
  { n: 4, name: "Fuchsia card", cost: "Impossible to miss. Spends the screen's only accent, so nothing below can compete.", El: Inverted },
  { n: 5, name: "Question bar", cost: "Invites rather than instructs. Reads as search, so some people will expect a keyboard.", El: Prompt },
];

export default function CtaLab() {
  const d = LAB_SIX[0];
  return (
    <div data-lab-scroll className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.top }}>
      <div style={{ padding: `18px ${PAD}px 6px` }}>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.02 }}>Five ways to ask</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.sub, lineHeight: "18px" }}>
          The same action, shown where it actually sits: on the bottom edge of the clip.
        </p>
      </div>

      {TAKES.map(({ n, name, cost, El }) => (
        <div key={n} style={{ marginTop: 26 }}>
          <div style={{ padding: `0 ${PAD}px 10px`, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.p600 }}>{n}</span>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: NAVY, letterSpacing: "-0.2px" }}>{name}</span>
          </div>
          <div style={{ position: "relative", height: 150 }}>
            <LabVideo src={n === 1 ? d.video : null} poster={d.hero} style={{ position: "absolute", inset: 0 }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(255,246,230,0) 74%, ${W.top} 100%)` }} />
            </LabVideo>
          </div>
          <div style={{ position: "relative", zIndex: 2, margin: `-40px ${PAD}px 0` }}><El /></div>
          <p style={{ margin: `12px ${PAD}px 0`, fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{cost}</p>
        </div>
      ))}
      <div style={{ height: 90 }} />
    </div>
  );
}
