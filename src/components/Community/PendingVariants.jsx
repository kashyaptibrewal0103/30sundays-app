import { Loader, ShieldCheck, AlertTriangle, XCircle, Pencil, Trash2, Clock } from "lucide-react";
import { CC } from "./tokens";
import { PAD } from "./CommunityUI";

// A post is never rejected in the composer. It lands in the room the moment it
// is written, sits there while it is checked, and then either goes live or
// says what happened.
//
// Three states, one card:
//   checking  the post is on the screen, nobody else can see it
//   flagged   a person is looking at it, amber, editable
//   blocked   it did not go up, red, with the reason named
//
// Only the author ever sees the first two. The room shows nothing until the
// post is live, which is what keeps the check invisible to everybody else.

const TITLE = "How much cash should we carry for the ferry and the markets?";
const BODY = "Landing in Phuket on the 4th and heading to Krabi. Call me on 98200 11223 if easier.";

/* ── 1. The card greys out, with a bar across the top ────────────────────── */

// The post is plainly there and plainly not finished. The bar is the only
// moving thing on the screen, so it reads as work in progress rather than as
// something broken.
export function PendingBar({ state, reason }) {
  return (
    <Card state={state}>
      {state === "checking" && (
        <div style={{
          height: 3, borderRadius: 3, background: CC.line, overflow: "hidden", marginBottom: 11,
        }}>
          <div style={{
            width: "40%", height: "100%", borderRadius: 3, background: CC.gold,
            animation: "loungeSlide 1.3s ease-in-out infinite",
          }} />
        </div>
      )}
      <Head state={state} reason={reason} />
      <Body state={state} />
      <Actions state={state} />
    </Card>
  );
}

/* ── 2. A status chip on the card ────────────────────────────────────────── */

// The state rides on a chip in the corner, the way a message says sending.
// Quietest of the five, and the easiest to miss on a busy screen.
export function PendingChip({ state, reason }) {
  const look = {
    checking: { bg: CC.well, fg: CC.body, icon: <Clock size={11} color={CC.body} />, label: "Checking" },
    flagged: { bg: CC.goldTint, fg: CC.goldInk, icon: <AlertTriangle size={11} color={CC.goldInk} />, label: "With us" },
    blocked: { bg: CC.pinkTint, fg: CC.pink, icon: <XCircle size={11} color={CC.pink} />, label: "Not posted" },
    live: { bg: CC.tealTint, fg: CC.tealInk, icon: <ShieldCheck size={11} color={CC.tealInk} />, label: "Live" },
  }[state];
  return (
    <Card state={state}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <p style={{
          flex: 1, margin: 0, fontSize: 15, fontWeight: 500, color: CC.ink, lineHeight: "20px",
          opacity: state === "checking" ? 0.55 : 1,
        }}>{TITLE}</p>
        <span style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 999, background: look.bg,
          fontSize: 11, fontWeight: 700, color: look.fg,
        }}>{look.icon} {look.label}</span>
      </div>
      {state !== "checking" && state !== "live" && (
        <p style={{ margin: "8px 0 0", fontSize: 13, color: CC.body, lineHeight: "19px" }}>{reason}</p>
      )}
      <Actions state={state} />
    </Card>
  );
}

/* ── 3. A line above the questions, and the card only when it is live ────── */

// The room stays clean. One strip at the top says what is happening, and the
// post appears in the list only once it has passed. Costs the reassurance of
// seeing your own words land.
export function PendingStrip({ state, reason }) {
  if (state === "live") return null;
  const look = {
    checking: { bg: CC.well, line: CC.line, fg: CC.ink,
      icon: <Loader size={14} color={CC.body} />, title: "Checking your question",
      body: "It goes up as soon as this is done. A few seconds, usually." },
    flagged: { bg: CC.goldTint, line: CC.goldLine, fg: CC.goldInk,
      icon: <AlertTriangle size={14} color={CC.goldInk} />, title: "Just checking this one",
      body: reason },
    blocked: { bg: CC.pinkTint, line: CC.pinkLine, fg: CC.pink,
      icon: <XCircle size={14} color={CC.pink} />, title: "This did not go up",
      body: reason },
  }[state];
  return (
    <div style={{
      background: look.bg, border: `1px solid ${look.line}`, borderRadius: 14,
      padding: "12px 14px",
    }}>
      <p style={{
        margin: 0, display: "flex", alignItems: "center", gap: 7,
        fontSize: 13.5, fontWeight: 700, color: CC.ink,
      }}>{look.icon} {look.title}</p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: CC.body, lineHeight: "19px" }}>
        {look.body}
      </p>
      {state !== "checking" && <Actions state={state} tight />}
    </div>
  );
}

/* ── 4. A coloured edge, carrying the state ──────────────────────────────── */

// The chosen one. The card never moves and never greys. A 3px edge changes
// colour: neutral while it is being reviewed, amber when a person has it, red
// when it did not go up.
//
// It carries whatever was written, a question with its body or an answer under
// the question it belongs to, because the thing somebody wants while they wait
// is to see their own words sitting there. Edit and delete are icons in the top
// right, out of the way of the text but reachable the moment they are needed.
export function PendingEdge({ state, reason, title = TITLE, body = BODY, answerTo, onEdit, onDelete }) {
  const edge = { checking: CC.line, flagged: CC.gold, blocked: CC.pink, live: CC.teal }[state];
  // Editing and deleting stay available the whole time, including while the
  // check runs. An edit mid-check simply restarts it on the new words.
  const canAct = state !== "live";
  return (
    <div style={{
      display: "flex", background: CC.white, border: `1px solid ${CC.line}`,
      borderRadius: 14, overflow: "hidden",
    }}>
      <span style={{ width: 3, flexShrink: 0, background: edge }} />
      <div style={{ flex: 1, minWidth: 0, padding: "13px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* An answer says what it is answering, so the card is not a
                stray paragraph with no question attached. */}
            {answerTo && (
              <p style={{
                margin: "0 0 5px", fontSize: 12, color: CC.soft, lineHeight: "17px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>Your answer to {answerTo}</p>
            )}
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: CC.ink, lineHeight: "20px" }}>
              {title}
            </p>
            {body && (
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: CC.body, lineHeight: "19px" }}>
                {body}
              </p>
            )}
          </div>

          {canAct && (
            <div style={{ display: "flex", gap: 2, flexShrink: 0, margin: "-6px -6px 0 0" }}>
              <IconButton label="Edit" onClick={onEdit}><Pencil size={15} color={CC.body} /></IconButton>
              <IconButton label="Delete" onClick={onDelete}><Trash2 size={15} color={CC.body} /></IconButton>
            </div>
          )}
        </div>

        <p style={{
          margin: "9px 0 0", fontSize: 12.5, fontWeight: 700,
          color: state === "checking" ? CC.soft
            : state === "flagged" ? CC.goldInk
              : state === "blocked" ? CC.pink : CC.tealInk,
        }}>
          {state === "checking" ? "Being reviewed, this takes a few seconds"
            : state === "live" ? "Live in Thailand"
              : reason}
        </p>
      </div>
    </div>
  );
}

function IconButton({ label, children, onClick }) {
  return (
    <button aria-label={label} onClick={onClick} style={{
      width: 34, height: 34, borderRadius: "50%", border: "none", background: "none",
      cursor: "pointer", display: "grid", placeItems: "center",
    }}>{children}</button>
  );
}

/* ── 5. The card, with the words held back ───────────────────────────────── */

// The question shows, the body is masked until it passes. It is the most
// honest picture of what is happening, and the most alarming: it looks like
// the post is being withheld, which is exactly what it is.
export function PendingMask({ state, reason }) {
  return (
    <Card state={state}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: CC.ink, lineHeight: "20px" }}>
        {TITLE}
      </p>
      {state === "checking" ? (
        <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 6 }}>
          {["92%", "74%"].map((w, i) => (
            <span key={i} style={{
              display: "block", width: w, height: 10, borderRadius: 5, background: CC.line,
              animation: "loungeFade 1.4s ease-in-out infinite",
            }} />
          ))}
          <span style={{ marginTop: 4, fontSize: 12.5, fontWeight: 700, color: CC.body }}>
            Checking this before it goes up
          </span>
        </div>
      ) : (
        <>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: CC.body, lineHeight: "19px" }}>
            {BODY}
          </p>
          {state !== "live" && (
            <p style={{
              margin: "8px 0 0", fontSize: 13, fontWeight: 700,
              color: state === "flagged" ? CC.goldInk : CC.pink,
            }}>{reason}</p>
          )}
        </>
      )}
      <Actions state={state} />
    </Card>
  );
}

/* ── Shared pieces ───────────────────────────────────────────────────────── */

function Card({ state, children }) {
  const border = state === "flagged" ? CC.goldLine : state === "blocked" ? CC.pinkLine : CC.line;
  const bg = state === "flagged" ? CC.goldTint : state === "blocked" ? CC.pinkTint : CC.white;
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "13px 14px",
    }}>{children}</div>
  );
}

function Head({ state, reason }) {
  const look = {
    checking: [<Loader key="i" size={13} color={CC.body} />, "Checking this before it goes up", CC.body],
    flagged: [<AlertTriangle key="i" size={13} color={CC.goldInk} />, "Just checking this one", CC.goldInk],
    blocked: [<XCircle key="i" size={13} color={CC.pink} />, "This did not go up", CC.pink],
    live: [<ShieldCheck key="i" size={13} color={CC.tealInk} />, "Live in Thailand", CC.tealInk],
  }[state];
  return (
    <>
      <p style={{
        margin: 0, display: "flex", alignItems: "center", gap: 6,
        fontSize: 12.5, fontWeight: 700, color: look[2],
      }}>{look[0]} {look[1]}</p>
      {state !== "checking" && state !== "live" && (
        <p style={{ margin: "4px 0 0", fontSize: 13, color: CC.body, lineHeight: "19px" }}>
          {reason}
        </p>
      )}
    </>
  );
}

function Body({ state }) {
  return (
    <p style={{
      margin: "9px 0 0", fontSize: 15, fontWeight: 500, color: CC.ink, lineHeight: "20px",
      opacity: state === "checking" ? 0.55 : 1,
    }}>{TITLE}</p>
  );
}

// Edit and delete while it waits. Nothing at all while it is being checked,
// because a check that takes four seconds does not need an escape hatch.
function Actions({ state, tight }) {
  if (state === "checking" || state === "live") return null;
  return (
    <div style={{ display: "flex", gap: 8, marginTop: tight ? 10 : 11 }}>
      <button style={{
        display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36,
        padding: "0 13px", borderRadius: 10, border: `1px solid ${CC.line}`,
        background: CC.white, cursor: "pointer", fontFamily: "inherit",
        fontSize: 13, fontWeight: 700, color: CC.ink,
      }}><Pencil size={13} /> {state === "blocked" ? "Edit and repost" : "Edit"}</button>
      <button style={{
        display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36,
        padding: "0 13px", borderRadius: 10, border: `1px solid ${CC.line}`,
        background: CC.white, cursor: "pointer", fontFamily: "inherit",
        fontSize: 13, fontWeight: 700, color: CC.body,
      }}><Trash2 size={13} /> Delete</button>
    </div>
  );
}

export const PENDING_VARIANTS = [
  { id: "bar", name: "The card greys out, with a bar across the top", Comp: PendingBar,
    note: "One moving thing on the screen. Reads as work in progress, not as broken." },
  { id: "chip", name: "A status chip on the card", Comp: PendingChip,
    note: "Quietest of the five, and the easiest to miss." },
  { id: "strip", name: "A line above the questions", Comp: PendingStrip,
    note: "The room stays clean. The post appears only once it passes." },
  { id: "edge", name: "A coloured edge carrying the state", Comp: PendingEdge,
    note: "Fastest to read at a glance, hardest to learn the first time." },
  { id: "mask", name: "The card, with the words held back", Comp: PendingMask,
    note: "The most honest picture of what is happening, and the most alarming." },
];

export const REASONS = {
  flagged: "It has a phone number in it, so it is with us before it goes live.",
  blocked: "It has someone else's number in it. Take that out and post it again.",
};
