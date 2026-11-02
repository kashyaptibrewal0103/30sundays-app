import { TravellerMomentsReels, LovedByCouples } from "./HomeV5";
import {
  PAPER, JournalHeader, MomentsFilm, MomentsLabel, MomentsStamp,
  ReviewsBubble, ReviewsStars, ReviewsNote,
} from "../components/booked_lab/Journal";

// Titles for the two sections under "Just booked", three each. Every option
// sits above its real section, on the same dotted paper, so it is judged where
// it will live. Each one is a different object from the same travel journal.

const NAVY = "#181E4C";
const SUB = "#535862";
const PAD = 18;

const MOMENTS = [
  { H: MomentsFilm, name: "Film strip", note: "The title on a strip of light lagoon film, sprocket holes top and bottom.",
    cost: "Says video before anyone reads a word. A tilted block of colour is the heaviest of the three." },
  { H: MomentsLabel, name: "Album label", note: "Handwritten on torn kraft tape, with a little drawn play button.",
    cost: "The warmest and most hand-made. Handwriting is slower to read than type." },
  { H: MomentsStamp, name: "Postage stamp", note: "A perforated stamp with a postmark across its edge.",
    cost: "Feels like it came back from somewhere. The title splits over two lines in two sizes." },
];

const REVIEWS = [
  { H: ReviewsBubble, name: "Speech bubble", note: "A hand-drawn bubble round the title, gold stars doodled beside it.",
    cost: "Reads as what people said at a glance. Sits close to the rating card's own stars." },
  { H: ReviewsStars, name: "Five drawn stars", note: "Serif title under five wonky gold stars, a double underline in gold.",
    cost: "The rating before the rating card. Two rows of stars in a row if the card follows straight after." },
  { H: ReviewsNote, name: "Pinned note", note: "A white note taped to the page, a big gold quote mark leading.",
    cost: "Most like a journal entry. One more white card on a section that already has a card under it." },
];

function Label({ n, name, note }) {
  return (
    <div style={{ padding: `0 ${PAD}px 10px`, display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: NAVY, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{n}</span>
      <span>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: "22px" }}>{name}</span>
        <span style={{ display: "block", fontSize: 12, color: SUB, lineHeight: "17px" }}>{note}</span>
      </span>
    </div>
  );
}

function Group({ title }) {
  return (
    <div style={{ padding: `26px ${PAD}px 4px` }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: SUB, letterSpacing: "0.6px" }}>{title}</p>
    </div>
  );
}

export default function JournalTitlesLab() {
  return (
    <div style={{ minHeight: "100%", background: "#fff" }}>
      <div style={{ padding: `16px ${PAD}px 12px`, borderBottom: "1px solid #E9EAEB" }}>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px" }}>Journal titles</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: SUB }}>Three for Traveller Moments, three for Traveller Reviews.</p>
      </div>

      <Group title="Live now, for reference" />
      <div style={{ background: PAPER, padding: "22px 0 6px" }}><JournalHeader /></div>

      <Group title="Traveller Moments" />
      {MOMENTS.map(({ H, name, note, cost }, i) => (
        <div key={name} style={{ paddingTop: 14 }}>
          <Label n={`M${i + 1}`} name={name} note={note} />
          <div style={{ background: PAPER, padding: "22px 0 18px" }}>
            <TravellerMomentsReels top={0} head={<H />} />
          </div>
          <p style={{ margin: "8px 18px 0", fontSize: 12, color: SUB, lineHeight: "17px" }}>{cost}</p>
        </div>
      ))}

      <Group title="Traveller Reviews" />
      {REVIEWS.map(({ H, name, note, cost }, i) => (
        <div key={name} style={{ paddingTop: 14 }}>
          <Label n={`R${i + 1}`} name={name} note={note} />
          <div style={{ background: PAPER, padding: "22px 0 18px" }}>
            <LovedByCouples top={0} head={<H />} />
          </div>
          <p style={{ margin: "8px 18px 0", fontSize: 12, color: SUB, lineHeight: "17px" }}>{cost}</p>
        </div>
      ))}
      <div style={{ height: 40 }} />
    </div>
  );
}
