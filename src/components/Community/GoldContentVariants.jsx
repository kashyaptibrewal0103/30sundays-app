import { MessagesSquare, ArrowRight } from "lucide-react";
import { CC } from "./tokens";
import { MetaDot, GoldShell, QuestionRail } from "./CountSignals";

// Four things to put inside the golden band.
//
// The ground is settled, so only the words change. Every one of them has to
// survive a cold start: in the first weeks there are no questions, few
// travellers, and nothing unread. Anything that needs a busy room to make
// sense is not a real option, so each treatment carries a day-one line as
// well as a busy one.
//
// What they have in common: no question is ever quoted, "FAQs" is gone, and
// the name is doing work rather than sitting in a 10px label.

const month = (d) => d.month.split(" ")[0];

/* ─── The shell ─── */

function GoldBand({ kicker, head, sub, unread, oneLine, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "calc(100% + 32px)", margin: "0 -16px",
      padding: "16px", background: CC.goldTint, border: "none",
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MessagesSquare size={16} color={CC.gold} />
        <span style={{
          fontSize: 12, fontWeight: 800, color: CC.goldInk, flex: 1,
        }}>{kicker}</span>
        <MetaDot unread={unread} />
      </div>

      <p style={{
        fontSize: 16, fontWeight: 700, color: CC.ink, margin: "9px 0 0",
        lineHeight: "23px", letterSpacing: "-0.2px",
        // Two lines at most. A longer destination name should wrap, never
        // push the band open or truncate mid word.
        ...(oneLine
          ? { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
          : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
      }}>{head}</p>

      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginTop: 11, flexWrap: "wrap",
      }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: CC.body, lineHeight: "18px" }}>
          {sub}
        </span>
        <span style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 13.5, fontWeight: 700, color: CC.goldInk,
        }}>Visit Lounge <ArrowRight size={15} color={CC.gold} /></span>
      </div>
    </button>
  );
}

/* ═══ A. The room is full of people ═══ */
// Leads with a fact about the world, not a task for the reader. On day one
// the count is small, so the line stops quoting it and says what is coming.

export function GoldPeople({ d, cold, unread, onOpen }) {
  const n = d.cohort.members;
  return (
    <GoldBand
      kicker="Sunday Lounge"
      head={cold
        ? `You are one of the first going to ${d.name} in ${month(d)}.`
        : `${n} travellers are going to ${d.name} in ${month(d)}.`}
      sub={cold
        ? "The room fills as more book. Our team is already in there."
        : "Swap notes with them before you fly."}
      unread={unread}
      onOpen={onOpen}
    />
  );
}

/* ═══ B. Somebody will answer ═══ */
// Leads with the promise, which is the one thing true from day one. The
// travellers are the support act here, not the headline.

export function GoldPromise({ d, cold, unread, onOpen }) {
  const n = d.cohort.members;
  return (
    <GoldBand
      kicker="Sunday Lounge"
      head={`Ask anything about ${d.name}. Our team answers the same day.`}
      sub={cold
        ? "Travellers who have already been answer too."
        : `So do the ${n} travellers going in ${month(d)}.`}
      unread={unread}
      onOpen={onOpen}
    />
  );
}

/* ═══ C. Your room, by name ═══ */
// The name becomes the headline instead of a label above it. "Open" is the
// word doing the work: a room that is open is one you are allowed into.

export function GoldNamed({ d, cold, unread, onOpen }) {
  const n = d.cohort.members;
  return (
    <GoldBand
      kicker={`${d.name}, ${d.month}`}
      head={`Your ${d.name} Lounge is open.`}
      sub={cold
        ? "Our team is on hand, and travellers join as they book."
        : `${n} travellers going in ${month(d)}, and our team on hand.`}
      unread={unread}
      onOpen={onOpen}
    />
  );
}

/* ═══ D. Same dates as you ═══ */
// Leads with what makes this different from a forum: these are the people on
// your dates. True with three people in the room, and with thirty.

export function GoldDates({ d, cold, unread, onOpen }) {
  const n = d.cohort.members;
  return (
    <GoldBand
      kicker="Sunday Lounge"
      head={`Everyone going to ${d.name} on your dates, in one room.`}
      sub={cold
        ? `Ask anything before you fly. Our team answers while ${month(d)} fills up.`
        : `${n} of you in ${month(d)}. Ask anything before you fly.`}
      unread={unread}
      onOpen={onOpen}
    />
  );
}

/* ═══ E. Who has actually been ═══ */
// Leads with proof that already exists on launch day: the travellers who went
// with us in the last three months. A cohort has to fill up before it is worth
// quoting; past travellers are there from the first hour.
//
// The number going this month moves inside the Lounge, where the group chat
// card already carries it. Two people-counts on one card cancel each other out.
//
// The rail sits between the headline and the footer. Its end marker is a
// pointer at the end of a scroll, not a call to action, so the FAQ count and
// Visit Lounge stay where they were.

export function GoldRecent({ d, answered, cold, unread, questions = [], onOpen }) {
  const been = d.recent3m || 0;
  // A destination with almost no recent history cannot lead with the number,
  // so it falls back to the promise, which is true whatever the count says.
  const thin = cold || been < 20;
  const rail = questions.length
    ? <QuestionRail questions={questions} total={d.questionsTotal} onOpen={onOpen} />
    : null;

  return (
    <GoldShell
      head={thin
        ? `Ask our team anything about ${d.name}`
        : `Ask ${been} travellers who visited ${d.name} in the last 3 months`}
      sub={`${d.questionsTotal || answered} FAQs answered`}
      rail={rail}
      onOpen={onOpen}
    />
  );
}

export const GOLD_VARIANTS = [
  { id: "gold-recent", n: "E", name: "Who has actually been", leads: "Recent travellers",
    note: "Leads with the one number that exists on launch day: who went with us in the last three months. The month cohort moves inside, where the group chat already carries it.",
    cold: "A destination with under 20 recent travellers falls back to the promise, so a thin month never shows a thin number.",
    Comp: GoldRecent },
  { id: "gold-people", n: "A", name: "The room is full of people", leads: "A fact, not a task",
    note: "A count of travellers is news about the world. The old line handed the reader a chore before giving them a reason.",
    cold: "Stops quoting the number and says the room is filling.",
    Comp: GoldPeople },
  { id: "gold-promise", n: "B", name: "Somebody will answer", leads: "The promise",
    note: "The one thing true on launch day with an empty room. Travellers are the support act, not the headline.",
    cold: "Unchanged. This is the treatment that needs nothing to exist yet.",
    Comp: GoldPromise },
  { id: "gold-named", n: "C", name: "Your room, by name", leads: "The name",
    note: "Sunday Lounge moves out of the 10px label and into the headline. Open is the word doing the work.",
    cold: "Still open on day one, because a room can be open and quiet.",
    Comp: GoldNamed },
  { id: "gold-dates", n: "D", name: "Same dates as you", leads: "What makes it different",
    note: "Not a forum: these are the people on your dates. True with three in the room and with thirty.",
    cold: "Drops the count, keeps the idea.",
    Comp: GoldDates },
];
