import { Heart, CornerUpLeft, MoreHorizontal } from "lucide-react";
import { CC } from "./tokens";
import { CARD, TravellerMark, TripStamp, ClampText } from "./CommunityUI";
import { ago } from "../../data/communityData";

// Six ways to carry one reply. The reply is the most repeated block in the
// Lounge, so every pixel of chrome is paid once per answer, and a thread of
// eight answers pays it eight times.
//
// Today's reply spends three stacked rows before the text even starts: the
// name, the trip stamp, then a 40px row of action buttons. That is roughly
// 92px of chrome around two lines of content.
//
// Two levers, and each option pulls one or both:
//   1. Merge rows. The stamp and the name can share a line.
//   2. Stop giving the actions a row of their own. A 36px button can sit in
//      a 20px slot with a negative margin: the hit area stays 36, the layout
//      height is 20. Nothing gets harder to tap.

const NAME = {
  fontSize: 14, fontWeight: 700, color: CC.ink, margin: 0,
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
};

// A button whose hit area is bigger than the space it takes in the layout.
// `lift` is how much it overflows above and below its row.
function Mini({ icon: Icon, count, active, size = 36, iconSize = 16, lift = 0, onClick }) {
  return (
    <button onClick={onClick} aria-label="Action" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
      minWidth: size, height: size, margin: `-${lift}px 0`, padding: count > 0 ? "0 6px" : 0,
      border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
      borderRadius: 999, flexShrink: 0,
    }}>
      <Icon size={iconSize} color={active ? CC.pink : CC.body} fill={active ? CC.pink : "none"} />
      {count > 0 && (
        <span style={{ fontSize: 12, fontWeight: 700, color: active ? CC.pink : CC.body }}>
          {count}
        </span>
      )}
    </button>
  );
}

function Stamp({ a, style }) {
  if (a.author?.ops) return null;
  return (
    <TripStamp stamp={a.author?.stamp} adults={a.author?.adults}
      children={a.author?.children} style={style} />
  );
}

function Time({ minsAgo, size = 12 }) {
  return <span style={{ flexShrink: 0, fontSize: size, color: CC.soft }}>{ago(minsAgo)}</span>;
}

/* ─── 1. Actions ride the name row ─── */

function ActionsOnByline({ a, liked, likes, onLike, onReply }) {
  const ops = !!a.author?.ops;
  return (
    <div style={{ ...CARD, padding: 14 }}>
      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
        <TravellerMark name={a.author?.name} ops={a.author?.ops} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20 }}>
            <p style={{ ...NAME, flex: 1, minWidth: 0 }}>{a.author?.name}</p>
            {ops && <Time minsAgo={a.minsAgo} size={11.5} />}
            <Mini icon={Heart} count={likes} active={liked} lift={8} onClick={onLike} />
            <Mini icon={CornerUpLeft} lift={8} onClick={onReply} />
          </div>
          {!ops && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 1 }}>
              <Stamp a={a} />
              <span style={{ marginLeft: "auto" }}><Time minsAgo={a.minsAgo} size={11.5} /></span>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 9 }}><ClampText>{a.body}</ClampText></div>
    </div>
  );
}

/* ─── 2. Name and stamp on one line ─── */

function OneMetaLine({ a, liked, likes, onLike, onReply }) {
  return (
    <div style={{ ...CARD, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <TravellerMark name={a.author?.name} ops={a.author?.ops} size={28} />
        <p style={{ ...NAME, fontSize: 13.5, flexShrink: 0, maxWidth: "48%" }}>{a.author?.name}</p>
        {!a.author?.ops && (
          <>
            <span style={{ color: CC.line, flexShrink: 0 }}>·</span>
            <span style={{ minWidth: 0, overflow: "hidden" }}>
              <Stamp a={a} style={{ flexWrap: "nowrap", whiteSpace: "nowrap" }} />
            </span>
          </>
        )}
        <span style={{ marginLeft: "auto" }}><Time minsAgo={a.minsAgo} /></span>
      </div>
      <div style={{ marginTop: 9 }}><ClampText>{a.body}</ClampText></div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20, marginTop: 10 }}>
        <Mini icon={Heart} count={likes} active={liked} lift={8} onClick={onLike} />
        <Mini icon={CornerUpLeft} lift={8} onClick={onReply} />
      </div>
    </div>
  );
}

/* ─── 3. No avatar, a lagoon rule instead ─── */

function RuleNoAvatar({ a, liked, likes, onLike, onReply }) {
  return (
    <div style={{ ...CARD, padding: 14 }}>
      <div style={{ borderLeft: `2px solid ${CC.tealLine}`, paddingLeft: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <p style={{ ...NAME, fontSize: 13.5, flexShrink: 0, maxWidth: "50%" }}>{a.author?.name}</p>
          <span style={{ minWidth: 0, overflow: "hidden" }}>
            <Stamp a={a} style={{ flexWrap: "nowrap", whiteSpace: "nowrap" }} />
          </span>
          <span style={{ marginLeft: "auto" }}><Time minsAgo={a.minsAgo} /></span>
        </div>
        <div style={{ marginTop: 6 }}><ClampText>{a.body}</ClampText></div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, height: 20, marginTop: 8 }}>
          <Mini icon={Heart} count={likes} active={liked} lift={8} onClick={onLike} />
          <Mini icon={CornerUpLeft} lift={8} onClick={onReply} />
        </div>
      </div>
    </div>
  );
}

/* ─── 4. Answer first, byline underneath it ─── */

function TextFirst({ a, liked, likes, onLike, onReply }) {
  return (
    <div style={{ ...CARD, padding: 14 }}>
      <ClampText>{a.body}</ClampText>
      <div style={{
        display: "flex", alignItems: "center", gap: 7, minWidth: 0, height: 22, marginTop: 9,
      }}>
        <TravellerMark name={a.author?.name} ops={a.author?.ops} size={20} />
        <p style={{ ...NAME, fontSize: 12.5, flexShrink: 0, maxWidth: "40%" }}>{a.author?.name}</p>
        <span style={{ minWidth: 0, overflow: "hidden" }}>
          <Stamp a={a} style={{ fontSize: 11, flexWrap: "nowrap", whiteSpace: "nowrap" }} />
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          <Time minsAgo={a.minsAgo} size={11.5} />
          <Mini icon={Heart} count={likes} active={liked} lift={7} onClick={onLike} />
          <Mini icon={CornerUpLeft} lift={7} onClick={onReply} />
        </span>
      </div>
    </div>
  );
}

/* ─── 5. Like stays out, the rest goes in a menu ─── */

function LikeAndMenu({ a, liked, likes, onLike, onMore }) {
  return (
    <div style={{ ...CARD, padding: 14 }}>
      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
        <TravellerMark name={a.author?.name} ops={a.author?.ops} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 20 }}>
            <p style={{ ...NAME, flex: 1, minWidth: 0 }}>{a.author?.name}</p>
            <Time minsAgo={a.minsAgo} size={11.5} />
            <Mini icon={MoreHorizontal} lift={8} onClick={onMore} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 1 }}>
            <Stamp a={a} />
            <span style={{ marginLeft: "auto", height: 20 }}>
              <Mini icon={Heart} count={likes} active={liked} lift={8} onClick={onLike} />
            </span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 9 }}><ClampText>{a.body}</ClampText></div>
    </div>
  );
}

/* ─── 6. Same shape, everything shrunk ─── */

function Compressed({ a, liked, likes, onLike, onReply }) {
  return (
    <div style={{ ...CARD, padding: 12 }}>
      <div style={{ display: "flex", gap: 9, minWidth: 0 }}>
        <TravellerMark name={a.author?.name} ops={a.author?.ops} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ ...NAME, fontSize: 13.5, flex: 1, minWidth: 0 }}>{a.author?.name}</p>
            <Time minsAgo={a.minsAgo} size={11.5} />
          </div>
          <Stamp a={a} style={{ fontSize: 11 }} />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <ClampText style={{ fontSize: 14, lineHeight: "20px" }}>{a.body}</ClampText>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, height: 22, marginTop: 8 }}>
        <Mini icon={Heart} count={likes} active={liked} size={34} iconSize={15} lift={6} onClick={onLike} />
        <Mini icon={CornerUpLeft} size={34} iconSize={15} lift={6} onClick={onReply} />
      </div>
    </div>
  );
}

/* ─── Today's reply, for the comparison ─── */

function Today({ a, liked, likes, onLike, onReply }) {
  return (
    <div style={{ ...CARD, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <TravellerMark name={a.author?.name} ops={a.author?.ops} size={34} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ ...NAME, flex: 1, minWidth: 0 }}>{a.author?.name}</p>
            <Time minsAgo={a.minsAgo} />
          </div>
          <div style={{ marginTop: 2 }}>
            <Stamp a={a} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}><ClampText>{a.body}</ClampText></div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 8 }}>
        <Mini icon={Heart} count={likes} active={liked} size={40} iconSize={17} onClick={onLike} />
        <Mini icon={CornerUpLeft} size={40} iconSize={17} onClick={onReply} />
      </div>
    </div>
  );
}

export const BASELINE = { id: "today", name: "Today", Comp: Today };

export const REPLY_ROW_VARIANTS = [
  {
    id: "byline", n: 1, name: "Actions on the name row", tag: "71px off each reply",
    Comp: ActionsOnByline,
    note: "Like and reply move up beside the name, in a 20px slot with a 36px hit area. The stamp row keeps the time on its right. No action row at all.",
    cost: "The actions sit above the text they act on, which is back to front. On a long name they crowd the right edge.",
  },
  {
    id: "oneline", n: 2, name: "Name and stamp on one line", tag: "54px off each reply",
    Comp: OneMetaLine,
    note: "Everything about the person on a single line: face, name, where they went, when. The actions keep their own row but drop to a 20px slot.",
    cost: "On a narrow screen the trip stamp is what gets truncated, and that stamp is the proof the answer is worth reading.",
  },
  {
    id: "rule", n: 3, name: "No face, a lagoon rule", tag: "49px off each reply",
    Comp: RuleNoAvatar,
    note: "The avatar goes and a 2px rule stands in for it. The text gains 42px of width, so a long answer loses a line of its own.",
    cost: "It saves the least of the six, because the action row survives. A thread of eight answers also becomes eight identical blocks, and faces are how people tell replies apart when scrolling fast.",
  },
  {
    id: "textfirst", n: 4, name: "Answer first, byline under", tag: "90px off, the smallest",
    Comp: TextFirst,
    note: "One 22px line carries the whole footer: face, name, stamp, time, like, reply. Everything above it is the answer.",
    cost: "You read the answer before you know who said it, and the Lounge is sold on who these people are. Six things on one 22px line also means the trip stamp clips first on a narrow screen.",
  },
  {
    id: "menu", n: 5, name: "Like out, the rest in a menu", tag: "71px off each reply",
    Comp: LikeAndMenu,
    note: "Like keeps its place because it is the one thing people do. Reply, report and the rest go behind the three dots on the name row.",
    cost: "Replying becomes two taps. Answers are already the scarce thing here, so taxing the reply is the wrong tax.",
  },
  {
    id: "compressed", n: 6, name: "Same shape, shrunk", tag: "61px off, the control",
    Comp: Compressed,
    note: "Nothing moves. The avatar, type, padding and buttons all come down a size. This is what pure compression buys with no restructuring.",
    cost: "Spends the whole budget on type that is now smaller than the rest of the app, and it still beats two of the restructured options, which is worth knowing before picking a clever one.",
  },
];
