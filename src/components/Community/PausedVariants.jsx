import { Lock, AlertTriangle, Plus, ChevronRight, MessageCircle } from "lucide-react";
import { CC } from "./tokens";
import { PAD } from "./CommunityUI";

// Posting paused, five ways.
//
// Three blocked posts switch posting off. Reading continues everywhere, and
// only the community manager turns it back on. The question every variant is
// answering: where does somebody learn this, and how loudly?
//
// Two things are true of all five. The appeal is always one tap away, because
// a block with no way to argue is the thing that turns a mistake into a
// complaint. And the tone never scolds: the traveller already read why each
// post came down, and this is the consequence, not a fourth telling off.

/* ── 1. A banner at the top of the room ──────────────────────────────────── */

// The loudest. It is the first thing on every room, every visit, until it is
// lifted. Costs the top of the screen, and it is the one strangers cannot see
// but the traveller cannot escape.
export function PausedBanner({ onAppeal }) {
  return (
    <div style={{
      background: CC.pinkTint, borderBottom: `1px solid ${CC.pinkLine}`,
      padding: `12px ${PAD}px 13px`,
    }}>
      <p style={{
        margin: 0, display: "flex", alignItems: "center", gap: 7,
        fontSize: 13.5, fontWeight: 700, color: CC.ink,
      }}>
        <AlertTriangle size={14} color={CC.pink} /> Posting is paused
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: CC.body, lineHeight: "19px" }}>
        Three posts have not made it through. You can still read everything.
      </p>
      <button onClick={onAppeal} style={{
        marginTop: 8, padding: 0, minHeight: 34, border: "none", background: "none",
        cursor: "pointer", fontFamily: "inherit",
        fontSize: 13.5, fontWeight: 700, color: CC.pink,
      }}>Tell us we got it wrong</button>
    </div>
  );
}

/* ── 2. The Ask button explains it ───────────────────────────────────────── */

// Nothing on the screen until the traveller reaches for the thing they cannot
// do. Costs nothing on arrival, and it meets the intent at the exact moment it
// appears. The risk is somebody tapping Ask, writing nothing, and leaving
// without ever learning why.
export function PausedOnAsk({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      position: "absolute", right: 16, bottom: 18, zIndex: 80,
      display: "inline-flex", alignItems: "center", gap: 8, minHeight: 52,
      padding: "0 22px", borderRadius: 999, border: `1px solid ${CC.line}`,
      cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700,
      background: CC.well, color: CC.soft,
    }}>
      <Lock size={16} /> Ask
    </button>
  );
}

export function PausedSheetBody({ onAppeal, onClose }) {
  return (
    <div>
      <p style={{ fontSize: 14.5, color: CC.body, margin: 0, lineHeight: "21px" }}>
        Three of your posts have not made it through, so posting is off for now.
        You can still read every room, and everything you posted before is still up.
      </p>
      <p style={{ fontSize: 14.5, color: CC.body, margin: "10px 0 0", lineHeight: "21px" }}>
        Someone on our team turns it back on.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={onAppeal} style={{
          flex: 1, minHeight: 50, borderRadius: 14, border: "none", background: CC.pink,
          cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#fff",
        }}>Tell us we got it wrong</button>
        <button onClick={onClose} style={{
          minHeight: 50, padding: "0 18px", borderRadius: 14, border: `1px solid ${CC.line}`,
          background: CC.white, cursor: "pointer", fontFamily: "inherit",
          fontSize: 15, fontWeight: 700, color: CC.ink,
        }}>Close</button>
      </div>
    </div>
  );
}

/* ── 3. A quiet line where the composer was ──────────────────────────────── */

// The gentlest. It sits in the place the action used to be, says the state
// plainly, and takes no room above the fold. Costs discovery: on a question
// screen it is below the answers, so a scroller may never see it.
export function PausedInline({ onAppeal }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 14px", borderRadius: 14,
      background: CC.well, border: `1px solid ${CC.line}`,
    }}>
      <Lock size={15} color={CC.soft} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: CC.body, lineHeight: "19px" }}>
        Posting is paused. You can still read everything.
      </span>
      <button onClick={onAppeal} style={{
        flexShrink: 0, padding: 0, minHeight: 34, border: "none", background: "none",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: CC.pink,
      }}>Appeal</button>
    </div>
  );
}

/* ── 4. A screen of its own, once ────────────────────────────────────────── */

// Shown in full the first time, then nothing but a small marker afterwards.
// Costs an interruption on one visit, and buys back every screen after it.
// The strongest fit for something that has to be understood, not noticed.
export function PausedScreen({ onAppeal, onRead }) {
  return (
    <div style={{ padding: `26px ${PAD}px 20px`, textAlign: "center" }}>
      <span style={{
        width: 58, height: 58, borderRadius: "50%", background: CC.well,
        display: "grid", placeItems: "center", margin: "0 auto 16px",
      }}><Lock size={24} color={CC.soft} /></span>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: CC.ink, margin: "0 0 8px" }}>
        Posting is paused
      </h2>
      <p style={{ fontSize: 14.5, color: CC.body, margin: 0, lineHeight: "21px" }}>
        Three of your posts have not made it through, so asking and answering are
        off for now. Everything you have already posted stays up, and you can
        still read every room.
      </p>
      <button onClick={onAppeal} style={{
        marginTop: 18, minHeight: 52, padding: "0 24px", borderRadius: 999,
        border: "none", background: CC.pink, cursor: "pointer",
        fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#fff",
        boxShadow: "0 6px 20px rgba(253,1,79,0.24)",
      }}>Tell us we got it wrong</button>
      <div>
        <button onClick={onRead} style={{
          marginTop: 12, minHeight: 44, padding: 0, border: "none", background: "none",
          cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, color: CC.ink,
        }}>Keep reading</button>
      </div>
    </div>
  );
}

// What is left behind on later visits, under variant 4.
export function PausedMarker({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "5px 11px", borderRadius: 999, border: `1px solid ${CC.line}`,
      background: CC.well, cursor: "pointer", fontFamily: "inherit",
      fontSize: 12, fontWeight: 700, color: CC.body,
    }}>
      <Lock size={12} color={CC.soft} /> Posting paused
    </button>
  );
}

/* ── 5. In the notification list, and nowhere else ───────────────────────── */

// The state lives where every other thing that happened to your posts lives.
// Costs the most: a traveller who does not open notifications learns it by
// finding the Ask button gone, with no explanation anywhere on the screen.
export function PausedNotice({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "flex-start", gap: 11, width: "100%",
      padding: "13px 14px", background: CC.white, border: "none",
      borderBottom: `1px solid ${CC.line}`, cursor: "pointer",
      fontFamily: "inherit", textAlign: "left",
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: "50%", background: CC.pinkTint,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}><Lock size={15} color={CC.pink} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: CC.ink }}>
          Posting is paused
        </span>
        <span style={{ display: "block", fontSize: 13, color: CC.body, marginTop: 2, lineHeight: "18px" }}>
          Three posts have not made it through. You can still read everything.
        </span>
        <span style={{
          display: "inline-block", marginTop: 6,
          fontSize: 13, fontWeight: 700, color: CC.pink,
        }}>Tell us we got it wrong</span>
      </span>
      <span style={{ flexShrink: 0, fontSize: 11.5, color: CC.soft, marginTop: 2 }}>now</span>
    </button>
  );
}

/* ── The appeal, shared by all five ──────────────────────────────────────── */

export function AppealBody({ text, setText, onSend, sending }) {
  return (
    <div>
      <p style={{ fontSize: 14, color: CC.body, margin: "0 0 12px", lineHeight: "20px" }}>
        Tell us what you think we got wrong. Someone reads every one of these and
        comes back within two working days.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="What happened"
        style={{
          width: "100%", boxSizing: "border-box", padding: "12px 13px", borderRadius: 12,
          border: `1px solid ${CC.line}`, background: CC.white, fontFamily: "inherit",
          fontSize: 14.5, color: CC.ink, resize: "none", outline: "none",
        }}
      />
      <button
        onClick={onSend}
        disabled={!text.trim() || sending}
        style={{
          marginTop: 12, width: "100%", minHeight: 52, borderRadius: 14, border: "none",
          background: text.trim() ? CC.pink : CC.line, cursor: text.trim() ? "pointer" : "default",
          fontFamily: "inherit", fontSize: 15, fontWeight: 700,
          color: text.trim() ? "#fff" : CC.soft,
        }}
      >{sending ? "Sending" : "Send it"}</button>
    </div>
  );
}

export function AppealSent() {
  return (
    <div style={{ textAlign: "center", padding: "6px 0 4px" }}>
      <span style={{
        width: 52, height: 52, borderRadius: "50%", background: CC.tealTint,
        display: "grid", placeItems: "center", margin: "0 auto 14px",
      }}><MessageCircle size={22} color={CC.teal} /></span>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: CC.ink, margin: "0 0 6px" }}>
        We have got it
      </h3>
      <p style={{ fontSize: 14, color: CC.body, margin: 0, lineHeight: "20px" }}>
        Someone will read this and come back within two working days.
      </p>
    </div>
  );
}

export const PAUSED_VARIANTS = [
  { id: "banner", name: "A banner at the top of every room",
    note: "Impossible to miss, and impossible to escape until it is lifted." },
  { id: "ask", name: "The Ask button explains it",
    note: "Nothing until they reach for the thing they cannot do." },
  { id: "inline", name: "A quiet line where the composer was",
    note: "Says it in the place the action used to be." },
  { id: "screen", name: "A screen of its own, once",
    note: "Understood rather than noticed, then a small marker after." },
  { id: "notice", name: "In the notification list only",
    note: "Sits with everything else that happened to your posts." },
];
