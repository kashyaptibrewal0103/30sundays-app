import { C } from "../data";

// ─── The honest bit, as a note ───
//
// One or two lines, in a hand. It used to be a postcard of six or seven ticks
// and crosses, which read as a list the hotel or the region had been made to
// publish. A short note from someone who went reads as advice, and it is short
// enough that people read all of it.
//
// The same note everywhere the honest bit appears: the hotel page, the region
// page and the band in the hotel list. `title` is the small heading, `line` is
// the note itself, and `action` is an optional link under it (the hotel list
// opens its stay guide from here).
//
// Five looks, kept side by side on /honest-lab until one is picked. Every
// screen uses HONEST_LOOK.

export const HONEST_LOOKS = [
  { key: "slip", name: "Taped slip", note: "A cream slip of paper, taped to the page. Caveat, a quick pen hand." },
  { key: "sticky", name: "Sticky note", note: "A yellow sticky stuck on at an angle, with a curled corner. Kalam, a felt-tip hand." },
  { key: "notebook", name: "Notebook page", note: "Torn from a ruled notebook, the writing sitting on the lines. Patrick Hand, neat and easy to read." },
  { key: "scribble", name: "Margin scribble", note: "No paper at all. Written straight on the page with a pink underline, like a note in the margin." },
  { key: "tag", name: "Luggage tag", note: "A kraft paper tag on a string, the kind tied to a bag. Gochi Hand, a marker hand." },
];
export const HONEST_LOOK = "scribble";

const INK = "#2B2A26";
const SIGN = "#8A7F66";

function Action({ label, onAction, color = C.p600, font }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onAction?.(); }}
      style={{
        border: "none", background: "none", padding: 0, cursor: "pointer",
        fontFamily: font || "inherit", fontSize: font ? 15 : 12.5, fontWeight: 700, color, whiteSpace: "nowrap",
      }}
    >{label} ›</button>
  );
}

function Footer({ action, onAction, sign = "Love, 30 Sundays", signFont = "Caveat, cursive", signColor = SIGN, actionFont, actionColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: action ? "space-between" : "flex-end", gap: 10, marginTop: 6 }}>
      {action && <Action label={action} onAction={onAction} font={actionFont} color={actionColor} />}
      <span style={{ fontFamily: signFont, fontSize: 15, lineHeight: "16px", fontWeight: 600, color: signColor }}>{sign}</span>
    </div>
  );
}

// 1. Taped slip
function Slip({ title, line, action, onAction, tilt }) {
  return (
    <div style={{ position: "relative", padding: "12px 6px 4px" }}>
      <span aria-hidden style={{
        position: "absolute", top: 2, left: "50%", width: 74, height: 20, marginLeft: -37, zIndex: 2,
        background: "rgba(225,229,236,0.85)", transform: "rotate(-4deg)", borderRadius: 2,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }} />
      <div style={{
        background: "#FCF6E7", border: "1px solid #E9DFC6", borderRadius: 4,
        boxShadow: "0 6px 16px rgba(24,29,39,0.08)", transform: `rotate(${tilt}deg)`,
        padding: "14px 16px 10px",
      }}>
        <p style={{ margin: 0, fontFamily: "Caveat, cursive", fontSize: 17, lineHeight: "18px", fontWeight: 700, color: C.p600 }}>{title}</p>
        <p style={{ margin: "4px 0 0", fontFamily: "Caveat, cursive", fontSize: 22, lineHeight: "25px", fontWeight: 600, color: INK }}>{line}</p>
        <Footer action={action} onAction={onAction} />
      </div>
    </div>
  );
}

// 2. Sticky note
function Sticky({ title, line, action, onAction, tilt }) {
  return (
    <div style={{ padding: "6px 10px 10px" }}>
      <div style={{
        position: "relative", background: "linear-gradient(170deg, #FFF3A6 0%, #FFE97A 100%)",
        transform: `rotate(${tilt * 1.4}deg)`, padding: "14px 16px 12px",
        boxShadow: "0 10px 18px -8px rgba(60,50,0,0.35), 0 1px 2px rgba(0,0,0,0.06)",
        borderRadius: "2px 2px 2px 14px",
      }}>
        {/* The curled corner. */}
        <span aria-hidden style={{
          position: "absolute", left: 0, bottom: 0, width: 22, height: 22,
          background: "linear-gradient(45deg, rgba(0,0,0,0.08) 0%, #F4DC63 50%, transparent 51%)",
          borderBottomLeftRadius: 14,
        }} />
        <p style={{ margin: 0, fontFamily: "Kalam, cursive", fontSize: 13.5, lineHeight: "16px", fontWeight: 700, color: C.p600 }}>{title}</p>
        <p style={{ margin: "5px 0 0", fontFamily: "Kalam, cursive", fontSize: 17.5, lineHeight: "24px", fontWeight: 400, color: "#2E2A12" }}>{line}</p>
        <Footer action={action} onAction={onAction} signFont="Kalam, cursive" signColor="#7A6A1E" actionFont="Kalam, cursive" />
      </div>
    </div>
  );
}

// 3. Notebook page
function Notebook({ title, line, action, onAction, tilt }) {
  const LH = 26;
  return (
    <div style={{ padding: "4px 6px 6px" }}>
      <div style={{
        position: "relative", background: "#FFFFFF", transform: `rotate(${tilt * 0.6}deg)`,
        boxShadow: "0 6px 16px rgba(24,29,39,0.09)", border: "1px solid #E6E9EF",
        padding: `16px 16px 10px 40px`,
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LH - 1}px, #DCE6F5 ${LH - 1}px, #DCE6F5 ${LH}px)`,
        backgroundPosition: "0 12px",
        // A torn top edge.
        clipPath: "polygon(0 4px, 4% 0, 9% 4px, 15% 1px, 21% 4px, 27% 0, 33% 3px, 40% 0, 46% 4px, 53% 1px, 59% 4px, 66% 0, 72% 3px, 79% 0, 85% 4px, 91% 1px, 96% 4px, 100% 0, 100% 100%, 0 100%)",
      }}>
        {/* The red margin line. */}
        <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 28, width: 1.5, background: "#F2A3B3" }} />
        <p style={{ margin: 0, fontFamily: "'Patrick Hand', cursive", fontSize: 16, lineHeight: `${LH}px`, color: C.p600 }}>{title}</p>
        <p style={{ margin: 0, fontFamily: "'Patrick Hand', cursive", fontSize: 19, lineHeight: `${LH}px`, color: "#1F2A44" }}>{line}</p>
        <Footer action={action} onAction={onAction} signFont="'Patrick Hand', cursive" signColor="#6B7385" actionFont="'Patrick Hand', cursive" />
      </div>
    </div>
  );
}

// 4. Margin scribble
function Scribble({ title, line, action, onAction }) {
  return (
    <div style={{ padding: "4px 2px" }}>
      <p style={{ margin: 0, display: "inline-flex", flexDirection: "column", fontFamily: "Caveat, cursive", fontSize: 21, lineHeight: "22px", fontWeight: 700, color: C.p600 }}>
        {title}
        {/* A quick pen underline, not a rule. */}
        <svg width="118" height="8" viewBox="0 0 118 8" aria-hidden style={{ marginTop: 1 }}>
          <path d="M2 5 C 30 1, 60 7, 88 3 S 112 4, 116 2" stroke={C.p600} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
      </p>
      <p style={{ margin: "6px 0 0", fontFamily: "Caveat, cursive", fontSize: 24, lineHeight: "27px", fontWeight: 600, color: INK }}>
        {line}
      </p>
      <Footer action={action} onAction={onAction} sign="30 Sundays ♡" signColor={C.p600} />
    </div>
  );
}

// 5. Luggage tag
function Tag({ title, line, action, onAction, tilt }) {
  return (
    <div style={{ position: "relative", padding: "8px 8px 6px 26px" }}>
      {/* The string, out of the hole and off the edge. */}
      <svg aria-hidden width="40" height="34" viewBox="0 0 40 34" style={{ position: "absolute", left: 0, top: 6 }}>
        <path d="M38 22 C 26 20, 14 30, 2 6" stroke="#B9A27A" strokeWidth="1.6" fill="none" />
      </svg>
      <div style={{
        position: "relative", background: "#E7D3AE", transform: `rotate(${tilt * 0.8}deg)`,
        padding: "13px 16px 11px 34px", boxShadow: "0 6px 14px rgba(70,50,20,0.16)",
        clipPath: "polygon(16px 0, 100% 0, 100% 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)",
        backgroundImage: "radial-gradient(rgba(120,90,40,0.10) 1px, transparent 1px)", backgroundSize: "5px 5px",
      }}>
        {/* The eyelet. */}
        <span aria-hidden style={{ position: "absolute", left: 12, top: 18, width: 11, height: 11, borderRadius: "50%", background: "#FFFFFF", boxShadow: "0 0 0 3px #C9B086" }} />
        <p style={{ margin: 0, fontFamily: "'Gochi Hand', cursive", fontSize: 15, lineHeight: "18px", color: "#9E1F45", letterSpacing: 0.3 }}>{title}</p>
        <p style={{ margin: "4px 0 0", fontFamily: "'Gochi Hand', cursive", fontSize: 19.5, lineHeight: "24px", color: "#3A2A12" }}>{line}</p>
        <Footer action={action} onAction={onAction} signFont="'Gochi Hand', cursive" signColor="#7D6440" actionFont="'Gochi Hand', cursive" actionColor="#9E1F45" />
      </div>
    </div>
  );
}

const LOOKS = { slip: Slip, sticky: Sticky, notebook: Notebook, scribble: Scribble, tag: Tag };

// For comparing on the real screens: ?honest=sticky (or any look's key) on a
// link shows that look on every honest bit for the rest of the visit.
function forcedLook() {
  try {
    const q = new URLSearchParams(window.location.search).get("honest");
    if (q && LOOKS[q]) { sessionStorage.setItem("honestLook", q); return q; }
    const kept = sessionStorage.getItem("honestLook");
    return kept && LOOKS[kept] ? kept : null;
  } catch { return null; }
}

export default function HonestNote({ line, title = "The honest bit", action, onAction, tilt = -1.2, testId = "honest-note", look }) {
  if (!line) return null;
  const Look = LOOKS[look || forcedLook() || HONEST_LOOK] || Slip;
  return (
    <div data-testid={testId}>
      <Look title={title} line={line} action={action} onAction={onAction} tilt={tilt} />
    </div>
  );
}

// The first sentence of a line, so two borrowed lines still make a short note.
export const firstSentence = (s = "") => {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
};

// Two lines at most. The good thing and the catch together when they fit;
// otherwise the catch alone, since the catch is what makes it honest.
export const honestLine = (pros = [], cons = [], max = 95) => {
  const good = firstSentence(pros[0]);
  const bad = cons[0] || "";
  if (good && bad && good.length + bad.length + 1 <= max) return `${good} ${bad}`;
  return bad || good;
};
