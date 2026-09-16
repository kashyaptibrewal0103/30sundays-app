import { CC, hueFor } from "./tokens";
import { TravellerMark } from "./CommunityUI";
import { ago } from "../../data/communityData";

// Five ways to stop "3 answers" and "6m" reading as one thing.
//
// They collide because they are the same size, sitting 8px apart, at the same
// end of the row, and one of them is a number followed by a letter. Four fixes
// are available: more space, a mark between them, opposite ends, or a different
// row. One option each.

const TITLE = {
  flex: 1, fontSize: 15, fontWeight: 500, color: CC.ink,
  lineHeight: "20px", letterSpacing: "-0.1px",
};
const CARD = {
  display: "flex", gap: 11, width: "100%", textAlign: "left", cursor: "pointer",
  fontFamily: "inherit", padding: "13px 14px", background: CC.white,
  borderRadius: 14, border: `1px solid ${CC.line}`,
};

function Subject({ tag }) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: hueFor(tag) }}>{tag}</span>;
}

function Count({ n }) {
  return n > 0
    ? (
      <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.tealInk, whiteSpace: "nowrap" }}>
        {n} {n === 1 ? "answer" : "answers"}
      </span>
    )
    : (
      <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.goldInk, whiteSpace: "nowrap" }}>
        Needs an answer
      </span>
    );
}

function Time({ mins, size = 11.5 }) {
  return <span style={{ fontSize: size, color: CC.soft, flexShrink: 0 }}>{ago(mins)}</span>;
}

function Shell({ q, children, titleRight }) {
  return (
    <div style={CARD}>
      <TravellerMark name={q.mine ? "You" : q.author?.name} ops={q.author?.ops} size={30} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={TITLE}>{q.title}</span>
          {titleRight}
        </span>
        {children}
      </span>
    </div>
  );
}

/* ─── 1. Just more air ─── */

function WideGap({ q, n }) {
  return (
    <Shell q={q}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
        <Subject tag={(q.tags || [])[0]} />
        <span style={{ flex: 1 }} />
        <Count n={n} />
        <span style={{ width: 10 }} />
        <Time mins={q.minsAgo} />
      </span>
    </Shell>
  );
}

/* ─── 2. A dot between them ─── */

function MiddleDot({ q, n }) {
  return (
    <Shell q={q}>
      <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7 }}>
        <Subject tag={(q.tags || [])[0]} />
        <span style={{ flex: 1 }} />
        <Count n={n} />
        <span style={{ color: CC.line, fontSize: 12 }}>·</span>
        <Time mins={q.minsAgo} />
      </span>
    </Shell>
  );
}

/* ─── 3. Opposite ends ─── */

function BothEnds({ q, n }) {
  return (
    <Shell q={q}>
      <span style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 7 }}>
        <Subject tag={(q.tags || [])[0]} />
        <span style={{ color: CC.line, fontSize: 12 }}>·</span>
        <Count n={n} />
        <span style={{ flex: 1 }} />
        <Time mins={q.minsAgo} />
      </span>
    </Shell>
  );
}

/* ─── 4. The time goes up ─── */

function TimeOnTop({ q, n }) {
  return (
    <Shell q={q} titleRight={<Time mins={q.minsAgo} size={11.5} />}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
        <Subject tag={(q.tags || [])[0]} />
        <span style={{ flex: 1 }} />
        <Count n={n} />
      </span>
    </Shell>
  );
}

/* ─── 5. A rule between them ─── */

function HairRule({ q, n }) {
  return (
    <Shell q={q}>
      <span style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 7 }}>
        <Subject tag={(q.tags || [])[0]} />
        <span style={{ flex: 1 }} />
        <Count n={n} />
        <span style={{ width: 1, height: 11, background: CC.line, flexShrink: 0 }} />
        <Time mins={q.minsAgo} />
      </span>
    </Shell>
  );
}

/* ─── 6. The count takes the circle ─── */

function CountInMark({ q, n }) {
  const open = n === 0;
  return (
    <div style={CARD}>
      {/* The face gives up its place to the count. Nothing else on the card is
          a number, so the circle is unmistakable, and the bottom row is left
          carrying one thing at each end. */}
      <span style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        display: "grid", placeItems: "center",
        background: open ? CC.goldTint : CC.tealTint,
        border: `1px solid ${open ? CC.goldLine : CC.tealLine}`,
        fontSize: open ? 13 : 13.5, fontWeight: 800,
        color: open ? CC.goldInk : CC.tealInk,
      }}>{open ? "?" : n}</span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", ...TITLE }}>{q.title}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
          <Subject tag={(q.tags || [])[0]} />
          <span style={{ flex: 1 }} />
          <Time mins={q.minsAgo} />
        </span>
      </span>
    </div>
  );
}

export const META_VARIANTS = [
  {
    id: "gap", n: 1, name: "Just more air", tag: "18px apart", Comp: WideGap,
    note: "Nothing changes but the space between them, from 8px to 18px. Two things a thumb apart read as two things.",
    cost: "On a long count like Needs an answer the row runs out of room and the gap closes again, so it fixes the easy case only.",
  },
  {
    id: "dot", n: 2, name: "A dot between them", tag: "one pair", Comp: MiddleDot,
    note: "The app's own separator, used the same way it is used everywhere else. The two stay together as one trailing group but stop being one word.",
    cost: "It reads as a single sentence about the question, so the count loses a little of its weight as a signal.",
  },
  {
    id: "ends", n: 3, name: "Opposite ends", tag: "widest apart", Comp: BothEnds,
    note: "The count joins the subject on the left, the time keeps the right. They can never collide because the whole row is between them.",
    cost: "The left end now carries two different kinds of fact, and on a narrow screen the subject and count start to crowd each other instead.",
  },
  {
    id: "top", n: 4, name: "The time goes up", tag: "different rows", Comp: TimeOnTop,
    note: "The time moves to the top right, beside the title, which is where a thread already puts it. The bottom row is left carrying one thing.",
    cost: "It eats into the title, so a long question loses a few characters of its first line, and the New chip has nowhere to sit.",
  },
  {
    id: "rule", n: 5, name: "A rule between them", tag: "a visible edge", Comp: HairRule,
    note: "An 11px hairline between the two, with 10px either side. The separation is stated rather than implied, so it holds whatever the count says.",
    cost: "One more mark on a card that is already carrying a face, a subject, a count and a time. Small, but it is decoration doing a spacing job.",
  },
  {
    id: "mark", n: 6, name: "The count takes the circle", tag: "nothing left to collide", Comp: CountInMark,
    note: "The face goes and the count takes its place in the circle, lagoon when it is answered and golden with a question mark when it is not. The bottom row is left with the subject at one end and the time at the other, so there is nothing for them to crowd.",
    cost: "A number on its own says nothing about what it counts, and this is the one place on the card where there is no room for the word. It also gives up the faces, which are the cheapest proof that real people are in here.",
  },
];
