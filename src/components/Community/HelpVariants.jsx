import { HandHeart, X as XIcon, ArrowRight, BadgeCheck, MessageCircleQuestion } from "lucide-react";
import { CC } from "./tokens";
import { ME } from "../../data/communityData";

// Five ways to ask somebody to answer.
//
// The job is the same in all of them: name one question nobody has answered,
// say who asked it, and put the composer one tap away. They differ on how much
// of the screen that is worth, and on what the appeal is built from: the fact
// that it is unanswered, or the fact that you have been there.

function Close({ onClose, light }) {
  return (
    <button onClick={onClose} aria-label="Close" style={{
      width: 28, height: 28, borderRadius: "50%", flexShrink: 0, border: "none",
      background: light ? "rgba(255,255,255,0.7)" : CC.well,
      cursor: "pointer", display: "grid", placeItems: "center",
    }}><XIcon size={14} color={CC.body} /></button>
  );
}

const asked = (q) => `Asked by ${q.author?.name}`;

/* ═══ A. Tinted card ═══ */
// The one in use. A panel in lagoon, a kicker, and a filled button.

export function HelpCard({ q, onAnswer, onClose }) {
  return (
    <div style={{
      borderRadius: 16, background: CC.tealTint,
      border: `1px solid ${CC.tealLine}`, padding: "14px 15px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <HandHeart size={16} color={CC.teal} />
        <span style={{
          flex: 1, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
          textTransform: "uppercase", color: CC.tealInk,
        }}>Nobody has answered this</span>
        <Close onClose={onClose} light />
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: CC.ink, margin: "10px 0 0", lineHeight: "21px" }}>
        {q.title}
      </p>
      <p style={{ fontSize: 12.5, color: CC.body, margin: "4px 0 0" }}>{asked(q)}</p>
      <button onClick={onAnswer} style={{
        marginTop: 13, minHeight: 44, padding: "0 18px", borderRadius: 999,
        border: "none", background: CC.teal, cursor: "pointer",
        fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: "#fff",
      }}>Answer this</button>
    </div>
  );
}

/* ═══ B. Plain row ═══ */
// No tint, no panel. One row on white with a hairline, the way the rest of
// the app groups things. Least height of the five.

export function HelpRow({ q, onAnswer, onClose }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 11,
      padding: "13px 0", borderTop: `1px solid ${CC.line}`, borderBottom: `1px solid ${CC.line}`,
    }}>
      <MessageCircleQuestion size={18} color={CC.soft} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11.5, color: CC.body, margin: 0 }}>
          Unanswered · {asked(q)}
        </p>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: CC.ink, margin: "3px 0 0", lineHeight: "20px" }}>
          {q.title}
        </p>
        <button onClick={onAnswer} style={{
          marginTop: 8, padding: 0, minHeight: 36, border: "none", background: "none",
          cursor: "pointer", fontFamily: "inherit",
          fontSize: 13.5, fontWeight: 700, color: CC.pink,
        }}>Answer this</button>
      </div>
      <Close onClose={onClose} />
    </div>
  );
}

/* ═══ C. Straight into the box ═══ */
// The composer itself, not a button that opens one. A field that is already
// on the screen is the shortest distance between reading and writing.

export function HelpComposer({ q, onAnswer, onClose }) {
  return (
    <div style={{
      borderRadius: 16, background: CC.white,
      border: `1px solid ${CC.line}`, padding: "14px 15px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11.5, color: CC.body, margin: 0 }}>
            Nobody has answered · {asked(q)}
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: CC.ink, margin: "4px 0 0", lineHeight: "21px" }}>
            {q.title}
          </p>
        </div>
        <Close onClose={onClose} />
      </div>

      <button onClick={onAnswer} style={{
        display: "flex", alignItems: "center", gap: 9, width: "100%", marginTop: 12,
        minHeight: 46, padding: "0 14px", borderRadius: 12,
        background: CC.well, border: `1px solid ${CC.line}`,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <span style={{ flex: 1, fontSize: 14.5, color: CC.soft }}>
          Write what you know
        </span>
        <ArrowRight size={16} color={CC.pink} />
      </button>
    </div>
  );
}

/* ═══ D. Full bleed strip ═══ */
// Edge to edge, the way the band on the trip screen breaks the card rhythm.
// Loudest of the five, and the one that most interrupts the list.

export function HelpStrip({ q, onAnswer, onClose }) {
  return (
    <div style={{
      width: "calc(100% + 32px)", margin: "0 -16px",
      background: CC.goldTint, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <HandHeart size={15} color={CC.gold} />
        <span style={{
          flex: 1, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
          textTransform: "uppercase", color: CC.goldInk,
        }}>Can you answer this?</span>
        <Close onClose={onClose} light />
      </div>
      <p style={{ fontSize: 15.5, fontWeight: 700, color: CC.ink, margin: "9px 0 0", lineHeight: "21px" }}>
        {q.title}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: CC.body }}>{asked(q)}</span>
        <button onClick={onAnswer} style={{
          flexShrink: 0, minHeight: 40, padding: "0 16px", borderRadius: 999,
          border: "none", background: CC.pink, cursor: "pointer",
          fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, color: "#fff",
        }}>Answer</button>
      </div>
    </div>
  );
}

/* ═══ E. Because you have been ═══ */
// Leads with the credential rather than with the gap. "You went there" is a
// better reason to write than "nobody else has", and it is the only one of
// the five that explains why this person is being asked.

export function HelpStamp({ q, onAnswer, onClose }) {
  return (
    <div style={{
      borderRadius: 16, background: CC.white,
      border: `1px solid ${CC.line}`, borderLeft: `3px solid ${CC.teal}`, padding: "14px 15px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          flex: 1, display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 700, color: CC.tealInk,
        }}>
          <BadgeCheck size={14} color={CC.teal} />
          You went to {ME.stamp.destination} in {ME.stamp.month}
        </span>
        <Close onClose={onClose} />
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: CC.ink, margin: "10px 0 0", lineHeight: "21px" }}>
        {q.title}
      </p>
      <p style={{ fontSize: 12.5, color: CC.body, margin: "4px 0 0" }}>
        {asked(q)}, still waiting
      </p>

      <button onClick={onAnswer} style={{
        marginTop: 13, minHeight: 44, width: "100%", borderRadius: 12,
        border: "none", background: CC.pink, cursor: "pointer",
        fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: "#fff",
      }}>Answer this</button>
    </div>
  );
}

export const HELP_VARIANTS = [
  { id: "card", n: "A", name: "Tinted card", weight: "Medium", tag: "Live now",
    note: "A lagoon panel with a filled button. Clearly its own thing, and clearly not one of the questions under it.",
    cost: "A tinted panel behind body text is the one thing the house rules say not to do.",
    Comp: HelpCard },
  { id: "row", n: "B", name: "Plain row", weight: "Lightest", tag: "House style",
    note: "White, hairlines top and bottom, one pink text link. Grouped the way the rest of the app groups things.",
    cost: "Quiet enough that a scrolling thumb can pass it without noticing.",
    Comp: HelpRow, bare: true },
  { id: "composer", n: "C", name: "Straight into the box", weight: "Medium", tag: "Fewest taps",
    note: "The composer is on the screen rather than behind a button. Shortest distance between reading a question and writing to it.",
    cost: "Looks like you can type inline, and it still opens a sheet.",
    Comp: HelpComposer },
  { id: "strip", n: "D", name: "Full bleed strip", weight: "Heaviest", tag: "Loudest",
    note: "Edge to edge in gold, the way the band on the trip screen breaks the card rhythm.",
    cost: "Interrupts the list hardest, and reuses the colour the trip entry owns.",
    Comp: HelpStrip, bleed: true },
  { id: "stamp", n: "E", name: "Because you have been", weight: "Medium", tag: "Best reason",
    note: "Leads with the credential, not the gap. The only one that says why this person is being asked.",
    cost: "Needs a matching stamp, so it cannot show for somebody on their first trip.",
    Comp: HelpStamp },
];
