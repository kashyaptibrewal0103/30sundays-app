import { ShieldCheck, ChevronRight } from "lucide-react";
import { CC } from "./tokens";
import { PAD } from "./CommunityUI";

// Five ways to put the rules on the Community home.
//
// The first attempt used the same card as a room, which made a document read
// like a third destination. Everything here is trying to be findable without
// competing with the rooms, so none of them is a 70px card with a photo well
// and a chevron.

const LINE = "Read this before you post";

// 1. A quiet link. No fill, no card, a hairline top and bottom so it reads as
// a shelf above the rooms rather than an item in the list.
export function RulesLink({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%",
      padding: "11px 0", border: "none", borderBottom: `1px solid ${CC.line}`,
      background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <ShieldCheck size={15} color={CC.teal} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13.5, color: CC.body }}>
        <span style={{
          fontWeight: 700, color: CC.ink, textDecoration: "underline",
          textUnderlineOffset: 3, textDecorationColor: CC.tealLine,
        }}>Rules And Guidelines</span>
        <span style={{ color: CC.soft }}>{"  "}· {LINE}</span>
      </span>
    </button>
  );
}

// 2. A pill. It reads as a control rather than a place, sits left, and takes
// only the width of its own words.
export function RulesPill({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "8px 14px 8px 11px", borderRadius: 999,
      background: CC.tealTint, border: `1px solid ${CC.tealLine}`,
      cursor: "pointer", fontFamily: "inherit",
    }}>
      <ShieldCheck size={15} color={CC.tealInk} />
      <span style={{ fontSize: 13, fontWeight: 700, color: CC.tealInk }}>
        Rules And Guidelines
      </span>
    </button>
  );
}

// 3. A dashed strip. Same footprint as a row, but a dashed edge and no fill
// say it is a note, not a destination.
export function RulesDashed({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 9, width: "100%",
      padding: "11px 13px", borderRadius: 12, background: "none",
      border: `1px dashed ${CC.tealLine}`, cursor: "pointer",
      fontFamily: "inherit", textAlign: "left",
    }}>
      <ShieldCheck size={16} color={CC.teal} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: CC.ink }}>
        Rules And Guidelines
      </span>
      <span style={{ fontSize: 12, color: CC.soft, flexShrink: 0 }}>{LINE}</span>
    </button>
  );
}

// 4. A notice. A lagoon bar down the left, tinted fill, no chevron, because
// nothing about it is a list item.
export function RulesNotice({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "11px 13px", borderRadius: 10,
      background: CC.tealTint, border: "none", borderLeft: `3px solid ${CC.teal}`,
    }}>
      <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: CC.tealInk }}>
        Rules And Guidelines
      </span>
      <span style={{ display: "block", marginTop: 2, fontSize: 12.5, color: CC.body, lineHeight: "18px" }}>
        {LINE}. It takes a minute.
      </span>
    </button>
  );
}

// 5. A sentence. The lightest thing on the screen: no container at all, the
// words carry it, and the link is the only coloured part.
export function RulesSentence({ onClick }) {
  return (
    <p style={{ margin: 0, fontSize: 13, color: CC.soft, lineHeight: "19px" }}>
      New here? {" "}
      <button onClick={onClick} style={{
        border: "none", background: "none", padding: 0, cursor: "pointer",
        fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: CC.tealInk,
        textDecoration: "underline", textUnderlineOffset: 3,
      }}>Read the rules</button>{" "}
      before you post.
    </p>
  );
}

// 6. The card that is there now, kept only so the five above can be judged
// against it.
export function RulesCard({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 11, width: "100%",
      textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      padding: "13px 14px", background: CC.well, borderRadius: 14,
      border: `1px solid ${CC.line}`,
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: "50%", background: CC.white,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}><ShieldCheck size={18} color={CC.teal} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
          Rules And Guidelines
        </span>
        <span style={{ display: "block", marginTop: 3, fontSize: 12, color: CC.body }}>
          {LINE}, it takes a minute
        </span>
      </span>
      <ChevronRight size={17} color={CC.soft} style={{ flexShrink: 0 }} />
    </button>
  );
}

export const RULES_VARIANTS = [
  { id: "link", n: 1, name: "Quiet Link", Cmp: RulesLink,
    note: "A hairline shelf above the rooms. No fill, no card, so it cannot be mistaken for a place." },
  { id: "pill", n: 2, name: "Pill", Cmp: RulesPill,
    note: "Takes only the width of its words. Reads as a control, not a destination." },
  { id: "dashed", n: 3, name: "Dashed Strip", Cmp: RulesDashed,
    note: "Room sized, but a dashed edge and no fill mark it as a note." },
  { id: "notice", n: 4, name: "Lagoon Notice", Cmp: RulesNotice,
    note: "A bar down the left and a tint. The most visible of the five, still not a card." },
  { id: "sentence", n: 5, name: "Plain Sentence", Cmp: RulesSentence,
    note: "The lightest option. Nothing but words, with the link carrying the colour." },
];
export { PAD };
