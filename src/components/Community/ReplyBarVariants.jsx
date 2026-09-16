import { useState } from "react";
import { CornerUpLeft, SendHorizontal, Plus, BadgeCheck } from "lucide-react";
import { CC } from "./tokens";
import { ME } from "../../data/communityData";
import { TravellerMark } from "./CommunityUI";

// Five ways to invite an answer at the foot of a thread.
//
// The thing being traded is perceived effort. A button that opens a sheet says
// "this is a task". A box with a cursor in it says "just type". The second is
// almost always answered more, and almost always answered shorter, which for a
// question about a boat crossing is the right trade.

const bar = {
  flexShrink: 0, borderTop: `1px solid ${CC.line}`, background: CC.white,
  padding: `10px 16px calc(12px + env(safe-area-inset-bottom))`,
};

function Send({ on, onClick }) {
  return (
    <button onClick={onClick} disabled={!on} aria-label="Post answer" style={{
      width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: "none",
      background: on ? CC.pink : CC.line, cursor: on ? "pointer" : "default",
      display: "grid", placeItems: "center",
    }}><SendHorizontal size={18} color="#fff" /></button>
  );
}

const field = {
  flex: 1, minWidth: 0, minHeight: 44, maxHeight: 110, padding: "11px 14px",
  borderRadius: 14, border: `1px solid ${CC.line}`, background: CC.white,
  resize: "none", fontFamily: "inherit", fontSize: 15, color: CC.ink,
  outline: "none", lineHeight: "21px",
};

/* ═══ A. A button ═══ */
// What is live. One clear action, and a sheet behind it.

export function ReplyButton({ onOpen }) {
  return (
    <div style={bar}>
      <button onClick={onOpen} style={{
        width: "100%", minHeight: 48, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 8, borderRadius: 14, border: "none",
        cursor: "pointer", fontFamily: "inherit",
        background: CC.pink, color: "#fff", fontSize: 15.5, fontWeight: 700,
      }}>
        <CornerUpLeft size={17} /> Answer this
      </button>
    </div>
  );
}

/* ═══ B. A box and a send ═══ */
// Type straight in. No sheet, no screen, no sense of starting something.

export function ReplyBox({ onSend }) {
  const [text, setText] = useState("");
  return (
    <div style={bar}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <textarea
          rows={1} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Write your answer"
          style={field}
        />
        <Send on={!!text.trim()} onClick={() => { onSend?.(text); setText(""); }} />
      </div>
    </div>
  );
}

/* ═══ C. A line that opens up ═══ */
// One line until it is touched, then a proper box. Smallest footprint of the
// boxes, and it still never leaves the thread.

export function ReplyGrow({ onSend }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  if (!open) {
    return (
      <div style={bar}>
        <button onClick={() => setOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 9, width: "100%", minHeight: 44,
          padding: "0 14px", borderRadius: 14, background: CC.well,
          border: `1px solid ${CC.line}`, cursor: "pointer", fontFamily: "inherit",
          textAlign: "left",
        }}>
          <CornerUpLeft size={16} color={CC.soft} />
          <span style={{ fontSize: 15, color: CC.soft }}>Write your answer</span>
        </button>
      </div>
    );
  }
  return (
    <div style={bar}>
      <p style={{ fontSize: 11.5, color: CC.body, margin: "0 0 7px" }}>
        Posting as {ME.name}, who went to {ME.stamp.destination}
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <textarea
          autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="What would you tell them"
          style={{ ...field, minHeight: 74 }}
        />
        <Send on={!!text.trim()} onClick={() => { onSend?.(text); setText(""); setOpen(false); }} />
      </div>
    </div>
  );
}

/* ═══ D. Your face on it ═══ */
// The box, with who is about to speak. People write more carefully, and more
// often, when they can see the name that will carry it.

export function ReplyWithYou({ onSend }) {
  const [text, setText] = useState("");
  return (
    <div style={bar}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <TravellerMark name={ME.name} size={36} />
        <textarea
          rows={1} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={`Answer as ${ME.name.split(" ")[0]}`}
          style={field}
        />
        <Send on={!!text.trim()} onClick={() => { onSend?.(text); setText(""); }} />
      </div>
      <p style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 11, color: CC.tealInk, margin: "7px 0 0 44px",
      }}>
        <BadgeCheck size={12} color={CC.teal} />
        Your answer shows that you went to {ME.stamp.destination}
      </p>
    </div>
  );
}

/* ═══ E. A pill in the corner ═══ */
// No bar at all, so the thread runs to the bottom of the screen. Matches the
// Ask pill on the Lounge, which is the same shaped job.

export function ReplyPill({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      position: "absolute", right: 16,
      bottom: "calc(18px + env(safe-area-inset-bottom))", zIndex: 80,
      display: "inline-flex", alignItems: "center", gap: 8, minHeight: 52,
      padding: "0 22px", borderRadius: 999, border: "none", cursor: "pointer",
      fontFamily: "inherit", fontSize: 15, fontWeight: 700,
      background: CC.pink, color: "#fff", boxShadow: "0 6px 20px rgba(253,1,79,0.28)",
    }}><Plus size={18} /> Answer</button>
  );
}

export const REPLY_VARIANTS = [
  { id: "button", n: "A", name: "A button", weight: "70px", tag: "Live now",
    note: "One clear action and a sheet behind it. Nobody can miss what it does.",
    cost: "A full width button reads as a task, and a sheet is a screen. Both add to how much answering feels like work.",
    Comp: ReplyButton, opens: true },
  { id: "box", n: "B", name: "A box and a send", weight: "66px", tag: "Least friction",
    note: "Type straight in. No sheet, no second screen, no sense of starting something. The bar people already know from the group chat.",
    cost: "Invites one line answers, which is fine for a boat crossing and thin for a visa question.",
    Comp: ReplyBox },
  { id: "grow", n: "C", name: "A line that opens up", weight: "66px", tag: "Smallest",
    note: "One line until it is touched, then a proper box with room to think. Never leaves the thread either way.",
    cost: "Two steps again, even if the second one is only a tap on the field.",
    Comp: ReplyGrow },
  { id: "you", n: "D", name: "Your face on it", weight: "92px", tag: "Most considered",
    note: "The box, plus who is about to speak and the stamp their answer will carry. People write more carefully when they can see the name on it.",
    cost: "The tallest of the five, and the stamp line repeats what the posted answer will show anyway.",
    Comp: ReplyWithYou },
  { id: "pill", n: "E", name: "A pill in the corner", weight: "0px", tag: "No bar",
    note: "The thread runs to the bottom of the screen. Matches the Ask pill on the Lounge, which is the same shaped job.",
    cost: "Covers the last answer, and it is the furthest thing from just typing.",
    Comp: ReplyPill, opens: true, floating: true },
];
