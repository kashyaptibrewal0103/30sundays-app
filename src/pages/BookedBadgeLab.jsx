import BookedCard from "../components/booked_lab/BookedCard";
import { BADGE_KEYFRAMES } from "../components/booked_lab/BookedBadges";
import { BOOKED_TRIPS } from "../data/bookedTrips";

// Ten ways to make "Aanya booked 3h ago" stand out on the booked-trip card.
// Each one is shown the way it will actually sit: a rail of real cards under
// the real heading, on the new home's warm ground. Three cards, one of them a
// family trip, so the traveller count with children is covered too.

const GROUND = "#FDF8F5";
const NAVY = "#181E4C";
const SUB = "#535862";
const PAD = 18;

const SAMPLE = [BOOKED_TRIPS[0], BOOKED_TRIPS[1], BOOKED_TRIPS[4]].filter(Boolean);

const VARIANTS = [
  { key: "ribbon", name: "Gold ribbon", where: "On the photo, right edge",
    cost: "Loudest of the ten and reads as a badge of honour. Gold also marks Explorer trips, so it can echo that tag." },
  { key: "glass", name: "Frosted glass with a live dot (chosen)", where: "On the photo, one line, bottom left",
    cost: "Now live on the home. Feels live and modern, and works on any photo. The pulsing dot is motion people may find busy across a whole rail." },
  { key: "tab", name: "Hanging tab, forest green", where: "On the photo, from the top edge",
    cost: "Distinctive and very on-brand. Dark green on a dark photo loses its edge, so it leans on the shadow." },
  { key: "ticket", name: "Ticket stub, lagoon", where: "On the photo, bottom left",
    cost: "The most travel-specific shape. Lagoon also marks Offbeat trips, and the notches are fussy at this size." },
  { key: "scrim", name: "Fade with avatar", where: "On the photo, along the bottom",
    cost: "Calm and editorial, the way reels label people. Darkens the bottom of every photo." },
  { key: "goldStrip", name: "Golden strip", where: "Between photo and facts",
    cost: "Easy to read and never fights the photo. Adds a line of height to every card." },
  { key: "forestStrip", name: "Forest strip, gold time", where: "Between photo and facts",
    cost: "Strongest contrast, and the time pops. A dark band is heavy repeated across a rail." },
  { key: "avatar", name: "Avatar over the photo edge", where: "Between photo and facts",
    cost: "Puts a person on the card, like a profile. Biggest change to the card's shape." },
  { key: "swingTag", name: "Swing tag, purple", where: "On the photo, top right",
    cost: "A literal tag, as asked, and purple is used nowhere else on this home. Purple is not on the brand board." },
  { key: "stamp", name: "Passport stamp, blue", where: "On the photo, top right",
    cost: "Playful and fits travel. Tilted text is slower to read, and blue also marks Relaxed trips." },
];

function Rail({ badge }) {
  return (
    <div style={{ background: GROUND, padding: "16px 0 18px" }}>
      <div style={{ padding: `0 ${PAD}px`, marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px" }}>What they booked</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: SUB }}>Real itineraries, from recent bookings.</p>
      </div>
      <div className="hs" style={{ gap: 13, paddingLeft: PAD, paddingRight: PAD, alignItems: "stretch" }}>
        {SAMPLE.map((t) => <BookedCard key={t.key} t={t} badge={badge} />)}
      </div>
    </div>
  );
}

export default function BookedBadgeLab() {
  return (
    <div style={{ minHeight: "100%", background: "#fff" }}>
      <style>{BADGE_KEYFRAMES}</style>
      <div style={{ padding: `16px ${PAD}px 12px`, borderBottom: "1px solid #E9EAEB" }}>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: NAVY, letterSpacing: "-0.3px" }}>Who booked it, ten ways</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: SUB }}>The card before, then ten options. Option 2 is live.</p>
      </div>

      <Section n={0} name="Before" where="Grey type under the photo" cost="The card before this change, for comparison." badge={null} />
      {VARIANTS.map(({ key, ...v }, i) => <Section key={key} n={i + 1} {...v} badge={key} />)}
      <div style={{ height: 40 }} />
    </div>
  );
}

function Section({ n, name, where, cost, badge }) {
  return (
    <div style={{ paddingTop: 18 }}>
      <div style={{ padding: `0 ${PAD}px 8px`, display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{
          width: 22, height: 22, borderRadius: "50%", background: n === 0 ? "#E9EAEB" : NAVY, color: n === 0 ? NAVY : "#fff",
          fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0,
        }}>{n}</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: "22px" }}>{name}</span>
          <span style={{ display: "block", fontSize: 12, color: SUB }}>{where}</span>
        </span>
      </div>
      <Rail badge={badge} />
      <p style={{ margin: "8px 18px 0", fontSize: 12, color: SUB, lineHeight: "17px" }}>{cost}</p>
    </div>
  );
}
