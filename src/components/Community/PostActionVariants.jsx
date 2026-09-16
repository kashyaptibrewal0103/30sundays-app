import { useState } from "react";
import {
  Heart, Bookmark, CornerUpLeft, Link2, Flag, MoreHorizontal,
} from "lucide-react";
import { CC } from "./tokens";
import { Sheet } from "../Gift/GiftUI";

// Six ways to carry the actions on a post.
//
// The problem: five actions under every answer is five times the same row on
// a thread with five answers, and about a hundred pixels of it. Most of those
// taps never happen. Liking and replying do; saving, copying a link and
// reporting are rare, and rare things belong behind one more tap.
//
// Everything below keeps all five reachable. They differ on which are in the
// open and how much height that costs.

function Act({ icon: Icon, label, active, fill, muted, onClick }) {
  return (
    <button onClick={onClick} disabled={muted} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      minHeight: 44, padding: "0 9px", background: "none", border: "none",
      cursor: muted ? "default" : "pointer", fontFamily: "inherit",
      fontSize: 12.5, fontWeight: 600,
      color: active ? CC.pink : muted ? CC.soft : CC.body,
    }}>
      <Icon size={16} color={active ? CC.pink : muted ? CC.soft : CC.body} fill={fill ? CC.pink : "none"} />
      {label}
    </button>
  );
}

function IconAct({ icon: Icon, label, active, fill, onClick }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: 40, height: 40, borderRadius: "50%", border: "none", background: "none",
      cursor: "pointer", display: "grid", placeItems: "center",
    }}>
      <Icon size={17} color={active ? CC.pink : CC.body} fill={fill ? CC.pink : "none"} />
    </button>
  );
}

// The rare three, and reply when it is not inline.
function MoreSheet({ items, onClose }) {
  return (
    <Sheet title="More" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((it, i) => (
          <button key={it.label} onClick={() => { it.onClick?.(); onClose(); }} disabled={it.muted}
            style={{
              display: "flex", alignItems: "center", gap: 12, minHeight: 52,
              background: "none", border: "none", borderTop: i ? `1px solid ${CC.line}` : "none",
              cursor: it.muted ? "default" : "pointer", fontFamily: "inherit",
              textAlign: "left", padding: "0 2px",
            }}>
            <it.icon size={18} color={it.danger ? CC.pinkInk : CC.body} />
            <span style={{
              flex: 1, fontSize: 15, fontWeight: 600,
              color: it.danger ? CC.pinkInk : it.muted ? CC.soft : CC.ink,
            }}>{it.label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

const rest = ({ bookmarked, reported, mine, onBookmark, onCopy, onReport }) => [
  { icon: Bookmark, label: bookmarked ? "Remove from saved" : "Save", onClick: onBookmark },
  { icon: Link2, label: "Copy link", onClick: onCopy },
  ...(mine ? [] : [{ icon: Flag, label: reported ? "Reported" : "Report", onClick: onReport, danger: true, muted: !!reported }]),
];

/* ═══ A. All five, in the open ═══ */

export function ActionsAll(p) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 10, flexWrap: "wrap" }}>
      <Act icon={Heart} label={p.likes > 0 ? String(p.likes) : "Like"} active={p.liked} fill={p.liked} onClick={p.onLike} />
      <Act icon={Bookmark} label="Save" active={p.bookmarked} fill={p.bookmarked} onClick={p.onBookmark} />
      <Act icon={CornerUpLeft} label="Reply" onClick={p.onReply} />
      <Act icon={Link2} label="Link" onClick={p.onCopy} />
      {!p.mine && <Act icon={Flag} label={p.reported ? "Reported" : "Report"} muted={!!p.reported} onClick={p.onReport} />}
    </div>
  );
}

/* ═══ B. Two out, three behind a dot menu ═══ */
// The pattern every feed settled on. Like and Reply are the actions people
// take; the other three are one tap further in.

export function ActionsTwoAndMore(p) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 10 }}>
        <Act icon={Heart} label={p.likes > 0 ? String(p.likes) : "Like"} active={p.liked} fill={p.liked} onClick={p.onLike} />
        <Act icon={CornerUpLeft} label="Reply" onClick={p.onReply} />
        <span style={{ flex: 1 }} />
        <IconAct icon={MoreHorizontal} label="More" onClick={() => setOpen(true)} />
      </div>
      {open && <MoreSheet items={rest(p)} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ═══ C. Icons only ═══ */
// No labels. Half the width, and the icons are ones people already know.

export function ActionsIcons(p) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 8 }}>
      <button onClick={p.onLike} aria-label="Like" style={{
        display: "inline-flex", alignItems: "center", gap: 5, minHeight: 40, padding: "0 8px",
        border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
        fontSize: 12.5, fontWeight: 700, color: p.liked ? CC.pink : CC.body,
      }}>
        <Heart size={17} color={p.liked ? CC.pink : CC.body} fill={p.liked ? CC.pink : "none"} />
        {p.likes > 0 ? p.likes : ""}
      </button>
      <IconAct icon={CornerUpLeft} label="Reply" onClick={p.onReply} />
      <IconAct icon={Bookmark} label="Save" active={p.bookmarked} fill={p.bookmarked} onClick={p.onBookmark} />
      <IconAct icon={Link2} label="Copy link" onClick={p.onCopy} />
      {!p.mine && <IconAct icon={Flag} label="Report" onClick={p.onReport} />}
    </div>
  );
}

/* ═══ D. One action, everything else behind the dots ═══ */
// Liking is the only thing most readers ever do. Reply moves in with the rest.

export function ActionsOneAndMore(p) {
  const [open, setOpen] = useState(false);
  const items = [
    { icon: CornerUpLeft, label: "Reply", onClick: p.onReply },
    ...rest(p),
  ];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 8 }}>
        <button onClick={p.onLike} style={{
          display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 9px",
          border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: 12.5, fontWeight: 600, color: p.liked ? CC.pink : CC.body,
        }}>
          <Heart size={16} color={p.liked ? CC.pink : CC.body} fill={p.liked ? CC.pink : "none"} />
          {p.likes > 0 ? `${p.likes}` : "Like"}
        </button>
        <span style={{ flex: 1 }} />
        <IconAct icon={MoreHorizontal} label="More" onClick={() => setOpen(true)} />
      </div>
      {open && <MoreSheet items={items} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ═══ E. The dots move up to the corner ═══ */
// Nothing under the text at all. Like sits beside the name at the top, the
// menu in the opposite corner. The shortest card of the six.

export function ActionsInHeader(p) {
  const [open, setOpen] = useState(false);
  const items = [
    { icon: CornerUpLeft, label: "Reply", onClick: p.onReply },
    ...rest(p),
  ];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button onClick={p.onLike} style={{
          display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36, padding: "0 6px",
          border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: 12.5, fontWeight: 700, color: p.liked ? CC.pink : CC.body,
        }}>
          <Heart size={16} color={p.liked ? CC.pink : CC.body} fill={p.liked ? CC.pink : "none"} />
          {p.likes > 0 ? p.likes : ""}
        </button>
        <IconAct icon={MoreHorizontal} label="More" onClick={() => setOpen(true)} />
      </div>
      {open && <MoreSheet items={items} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ═══ F. Reply once, at the foot of the thread ═══ */
// Per answer: a like and a menu, nothing else. Replying is not a per answer
// action at all; the thread has one composer at the bottom, and quoting is
// picked inside it.

export function ActionsNoReply(p) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 8 }}>
        <button onClick={p.onLike} style={{
          display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 9px",
          border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: 12.5, fontWeight: 600, color: p.liked ? CC.pink : CC.body,
        }}>
          <Heart size={16} color={p.liked ? CC.pink : CC.body} fill={p.liked ? CC.pink : "none"} />
          {p.likes > 0 ? `${p.likes}` : "Like"}
        </button>
        <span style={{ flex: 1 }} />
        <IconAct icon={MoreHorizontal} label="More" onClick={() => setOpen(true)} />
      </div>
      {open && <MoreSheet items={rest(p)} onClose={() => setOpen(false)} />}
    </>
  );
}

export const ACTION_VARIANTS = [
  { id: "all", n: "A", name: "All five in the open", weight: "98px", tag: "Live now",
    note: "Nothing hidden. Every action is one tap, and every one is labelled.",
    cost: "Wraps to two rows on a narrow phone, and repeats five times on a five answer thread.",
    Comp: ActionsAll },
  { id: "two", n: "B", name: "Two out, three behind dots", weight: "44px", tag: "The common pattern",
    note: "Like and Reply in the open, the rare three behind a dot menu. What almost every feed settled on, so it needs no learning.",
    cost: "Saving becomes two taps, and a dot menu hides what is in it until opened.",
    Comp: ActionsTwoAndMore },
  { id: "icons", n: "C", name: "Icons only", weight: "40px", tag: "Half the width",
    note: "No labels. Everything stays in the open and the row takes half the space.",
    cost: "A flag and a bookmark are guessable; nobody is certain until they tap one.",
    Comp: ActionsIcons },
  { id: "one", n: "D", name: "Like out, the rest behind dots", weight: "40px", tag: "Most minimal",
    note: "Liking is the only thing most readers ever do, so it is the only thing in the open.",
    cost: "Replying is two taps, which is the action a thread most needs.",
    Comp: ActionsOneAndMore },
  { id: "header", n: "E", name: "Up in the corner", weight: "0px", tag: "Shortest card",
    note: "Nothing under the text at all. Like beside the name, the menu in the opposite corner, so the card is only as tall as what somebody wrote.",
    cost: "Actions at the top read as being about the author rather than the answer.",
    Comp: ActionsInHeader, inHeader: true },
  { id: "no-reply", n: "F", name: "Reply once, at the foot", weight: "40px", tag: "Fewest repeats",
    note: "A like and a menu per answer. Replying is not a per answer action: the thread has one composer at the bottom and quoting is picked inside it.",
    cost: "Quoting a particular answer gets harder, which is what makes a long thread readable.",
    Comp: ActionsNoReply },
];
