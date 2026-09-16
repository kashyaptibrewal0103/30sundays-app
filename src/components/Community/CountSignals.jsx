import { useEffect, useRef, useState } from "react";
import { MessagesSquare, ArrowRight, MessageCircle } from "lucide-react";
import { CC } from "./tokens";

// Two things live here.
//
// 1. Five ways to carry the message count without the brand fuchsia. Pink is
//    the colour of the one primary action per screen, and an unread count on a
//    section that is not the primary action was borrowing that weight.
//
// 2. The question ticker: what has been asked, how many answered it, moving on
//    its own so a still screenshot of the trip page is never the whole story.

/* ═══════════ The gold band shell ═══════════ */

export function GoldShell({ kicker = "Sunday Lounge", meta, head, sub, rail, onOpen }) {
  return (
    <div style={{
      width: "calc(100% + 32px)", margin: "0 -16px",
      background: CC.goldTint, padding: "16px 0",
    }}>
      <button onClick={onOpen} style={{
        display: "block", width: "100%", padding: "0 16px", background: "none",
        border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MessagesSquare size={16} color={CC.gold} />
          <span style={{
            fontSize: 12, fontWeight: 800, color: CC.goldInk, flex: 1,
          }}>{kicker}</span>
          {meta}
        </div>

        <p style={{
          fontSize: 16, fontWeight: 700, color: CC.ink, margin: "9px 0 0",
          lineHeight: "23px", letterSpacing: "-0.2px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{head}</p>
      </button>

      {rail && <div style={{ marginTop: 14 }}>{rail}</div>}

      {/* The footer stays. The rail's end marker is a small pointer at the end
          of a scroll, not a call to action, so the band still needs one. */}
      {sub && (
        <button onClick={onOpen} style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          padding: "0 16px", marginTop: rail ? 14 : 11, background: "none",
          border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: CC.body }}>{sub}</span>
          <span style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 13.5, fontWeight: 700, color: CC.goldInk,
          }}>Visit Lounge <ArrowRight size={15} color={CC.gold} /></span>
        </button>
      )}
    </div>
  );
}

/* ═══════════ Five ways to say what is new ═══════════ */
//
// Only new messages are counted here. A running total of everything ever said
// is a vanity number: it does not change what anyone does next, and it competes
// with the one number that does.
//
// None of them uses the brand fuchsia. That colour belongs to the single
// primary action on a screen, which on a trip is Pay now.

const metaText = { fontSize: 12, color: CC.body, whiteSpace: "nowrap" };

// 1. Flat. One weight, one colour, nothing raised.
export const MetaFlat = ({ unread }) =>
  unread > 0 ? <span style={metaText}>{unread} new messages</span> : null;

// 2. A dot, then the words, in grey. The dot catches the eye, the grey keeps
//    it from competing with the headline, and the count still says how much.
export const MetaDot = ({ unread }) =>
  unread > 0 ? (
    <span style={{ ...metaText, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: CC.gold, flexShrink: 0 }} />
      {unread} new messages
    </span>
  ) : null;

// 3. Inside the name, in brackets. Parentheses are how English says "this is
//    an aside", so it reads second without a colour or a second element.
export const MetaInKicker = () => null;
export const kickerWithCount = (unread) =>
  unread > 0 ? `Sunday Lounge (${unread} new)` : "Sunday Lounge";

// 4. Weight, not hue. Bold deep green against the grey around it.
export const MetaBold = ({ unread }) =>
  unread > 0 ? (
    <span style={{ ...metaText, color: CC.ink, fontWeight: 700 }}>{unread} new messages</span>
  ) : null;

// 5. Lagoon. On brand, and it already means "something real happened here"
//    everywhere else in the Lounge.
export const MetaLagoon = ({ unread }) =>
  unread > 0 ? (
    <span style={{ ...metaText, color: CC.tealInk, fontWeight: 700 }}>{unread} new messages</span>
  ) : null;

export const META_VARIANTS = [
  { id: "flat", n: 1, name: "Flat grey", how: "One weight, one colour",
    note: "The count is context, and context should not compete with the headline under it. Quietest of the five.",
    Comp: MetaFlat },
  { id: "dot", n: 2, name: "A dot and the words", how: "One mark, grey type",
    note: "The dot catches the eye, the grey stops it competing with the headline, and the count still says how much. This is the one in use.",
    Comp: MetaDot },
  { id: "kicker", n: 3, name: "In the name", how: "Punctuation does the work",
    note: "Brackets after the name. One element instead of two, and no colour spent. The tidiest, and the easiest to miss.",
    Comp: MetaInKicker, kicker: kickerWithCount },
  { id: "bold", n: 4, name: "Bold, no colour", how: "Weight, not hue",
    note: "Deep green against the grey around it. Contrast does the pointing, so nothing is taken from the palette.",
    Comp: MetaBold },
  { id: "lagoon", n: 5, name: "Lagoon", how: "On-brand colour",
    note: "Lagoon already means “something real happened here” everywhere else in the Lounge, so it carries this without borrowing from the primary action.",
    Comp: MetaLagoon },
];

/* ═══════════ The rail ═══════════ */
//
// Bubbles, not bare text and not white cards. The bubble is the same hue as
// the band underneath, lifted most of the way to white, so it reads as raised
// off a warm surface rather than as a white patch dropped onto one.
//
// Everything else holds:
//   · One bubble holds one question. Nothing else.
//   · The answer count appears only at two or more. "0 answers" says the
//     question is dead, which is the opposite of the invitation.
//   · The overflow is the last bubble, "See all 143 questions", which is also
//     the only destination the rail needs. So the band has no footer.
//   · 84% of the screen, 12px gutters, 16px left edge, snapped, one height.

const PAD = 16;
const GAP = 12;
const WIDTH = 84;
const CARD_H = 66;

const twoLines = {
  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
  overflow: "hidden", height: 38, lineHeight: "19px",
};

export const BUBBLE_SHADES = {
  light: { id: "light", name: "Almost white", hex: CC.bubbleLight,
    note: "A hair off white. The question floats furthest forward, and the band behind it stays clearly the ground." },
  mid: { id: "mid", name: "Halfway", hex: CC.bubbleMid,
    note: "Between the band and white. Raised, but unmistakably the same family as the surface under it." },
  deep: { id: "deep", name: "Close to the band", hex: CC.bubbleDeep,
    note: "Only a shade up from the ground. Quietest of the three, and the one that needs its hairline most." },
};

const bubble = (hex) => ({
  position: "relative",
  flex: `0 0 ${WIDTH}%`, scrollSnapAlign: "start", height: CARD_H,
  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  background: hex, border: `1px solid ${CC.bubbleEdge}`, borderRadius: 14,
  padding: "12px 14px", display: "flex", flexDirection: "column",
  justifyContent: "flex-start",
});

function Bubble({ q, hex, onOpen }) {
  const n = (q.answers || []).length;
  const hasCount = n >= 2;
  return (
    <button onClick={onOpen} style={bubble(hex)}>
      {/* Pinned to the top right of every bubble, so the eye finds it in the
          same place each time. The question is padded to match, rather than
          the count chasing the end of the text. */}
      {hasCount && (
        <span style={{
          position: "absolute", top: 13, right: 14,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <MessageCircle size={12} color={CC.soft} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.body }}>{n}</span>
        </span>
      )}

      <span style={{
        fontSize: 14, fontWeight: 600, color: CC.ink,
        paddingRight: hasCount ? 34 : 0, ...twoLines,
      }}>{q.title}</span>
    </button>
  );
}

// Pinned at the end, and deliberately not a bubble. It is not another
// question, so giving it the same shape as one would misfile it. It is also
// not a scroll stop: the rail loops from the last question back to the first.
function SeeAll({ total, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      // A snap target of its own, aligned to the end. Mandatory snapping will
      // not let the rail rest between targets, which is what was holding the
      // last scroll short and cutting this in half.
      flex: "0 0 auto", scrollSnapAlign: "end", alignSelf: "center", height: CARD_H,
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      background: "none", border: "none", padding: "0 4px 0 2px",
      display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: CC.goldInk }}>
        See all {total}
      </span>
      <ArrowRight size={15} color={CC.gold} />
    </button>
  );
}

export function QuestionRail({
  questions = [], total, onOpen, interval = 5000, shade = "light",
}) {
  const rail = useRef(null);
  const [held, setHeld] = useState(false);
  const [i, setI] = useState(0);

  const hex = BUBBLE_SHADES[shade]?.hex || BUBBLE_SHADES.light.hex;
  const shown = questions.slice(0, 6);
  // The questions, then one last stop for the end of the rail. After that it
  // comes back to the first, so it never parks on a dead end.
  const stops = shown.length + 1;

  useEffect(() => {
    if (held || stops < 2) return undefined;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (still) return undefined;
    const t = setInterval(() => setI(n => (n + 1) % stops), interval);
    return () => clearInterval(t);
  }, [held, stops, interval]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const card = el.children[1]?.getBoundingClientRect().width || 0;
    // The last stop runs to the true end rather than to a card edge, which is
    // the only position where "See all" is fully on screen. A bubble wide
    // enough to hold one question cannot leave room for it any other way.
    const end = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: i >= stops - 1 ? end : i * (card + GAP), behavior: "smooth" });
  }, [i, stops]);

  if (!shown.length) return null;

  return (
    <div
      ref={rail}
      onPointerDown={() => setHeld(true)}
      style={{
        display: "flex", gap: GAP, overflowX: "auto", padding: 0,
        // Without this a snapped bubble lands on the container edge and loses
        // the 16px gutter the rest of the screen keeps.
        scrollPaddingLeft: PAD, scrollPaddingRight: PAD,
        scrollbarWidth: "none", scrollSnapType: "x mandatory",
      }}
    >
      {/* Spacers rather than padding. A percentage width resolves against the
          content box, so padding here would quietly shrink every bubble and
          the peek with it. */}
      <span style={{ flex: `0 0 ${PAD - GAP}px` }} aria-hidden="true" />
      {shown.map(q => <Bubble key={q.id} q={q} hex={hex} onOpen={onOpen} />)}
      <SeeAll total={total || shown.length} onOpen={onOpen} />
      <span style={{ flex: `0 0 ${PAD - GAP}px` }} aria-hidden="true" />
    </div>
  );
}
