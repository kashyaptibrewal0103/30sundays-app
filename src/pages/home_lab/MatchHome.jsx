import { LAB_SIX, byName } from "../../data/homeLabData";
import { BoardingPassCard, LoungeBlock, useBookedTrip } from "./BookedHomes";
import BookedTripsRail from "../../components/BookedTripsRail";
import { DisplayTitle, GAP, HeroScrim, JOIN, LabPage, LabVideo, NAVY, PAD, Leaf, PerfectMatch, PolaroidGrid, PlanAction, TopBar, W, useLeadTrip, useRotate, ProofLine } from "./labShared";

// The Crew layout with two changes. The clip carries one fixed promise instead
// of three that swap, so the first thing read stays still. And the site's own
// "Why we're the perfect match" sits between the countries and Sunday School,
// which is where the reasons land after the places, not before them.
//
// Somebody who has already booked gets a different opening. The clip and the
// plan button are selling a trip they have paid for, so both go, and the trip
// itself takes the top of the page with the Sunday Community under it. Everything
// below that point is the same page for everyone.

const HERO = 430;
const LINE = "Complete Picture of your Holiday";

// The plainer opening, kept for comparison at /home-lab/booked-flat: no clip,
// the pass on the page ground under a written heading.
function BookedTop() {
  const t = useBookedTrip();
  return (
    <>
      <TopBar />
      <div style={{ padding: `2px ${PAD}px 0` }}>
        <DisplayTitle title="Your Trip" style={{ padding: 0, marginBottom: 12 }} />
        <BoardingPassCard t={t} page={W.page} ink={NAVY} />
      </div>
      <LoungeBlock t={t} variant={4} style={{ marginTop: 16 }} />
    </>
  );
}

// The booked opening, laid over the clip. This is the one that ships.
// The clip is their own destination, not the rotating six, because a person who
// has paid has one country on their mind. The marketing promise goes with it:
// it is written for somebody still deciding.
//
// The pass starts 300px down a 470px clip, so it covers the bottom third. The
// picture is still solid where the pass begins and dissolves into the page
// around and below it, which is the same join the rest of the page uses.
const HERO_BOOKED = 470;
const PASS_TOP = 300;

function BookedHero() {
  const t = useBookedTrip();
  const d = byName(t.trip.destination);
  return (
    <>
      <div style={{ position: "relative", height: HERO_BOOKED }}>
        <LabVideo src={d.video} poster={d.hero} fade={0.72} style={{ position: "absolute", inset: 0 }}>
          <HeroScrim />
        </LabVideo>
        <TopBar onVideo style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <div style={{ position: "absolute", left: 22, right: 22, bottom: HERO_BOOKED - PASS_TOP + 30, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.88)",
            letterSpacing: "0.3px", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>Your trip to</p>
          <p style={{ margin: "3px 0 0", fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px",
            lineHeight: "37px", color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.55)" }}>{t.trip.destination}</p>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, margin: `${PASS_TOP - HERO_BOOKED}px ${PAD}px 0` }}>
        <BoardingPassCard t={t} page={W.page} ink={NAVY} raised />
      </div>
      <LoungeBlock t={t} variant={4} style={{ marginTop: 16 }} />
    </>
  );
}

// `compact` is the tighter opening at /home-lab/compact: the rating line moves
// onto the clip above the button, and the countries sit closer under it with
// their own title, "Curated Destinations".
export default function MatchHome({ userState, bookedStyle = "hero", compact = false }) {
  const trip = useLeadTrip(userState);
  const i = useRotate(LAB_SIX.length);
  const d = LAB_SIX[i];
  const booked = userState === "customer";

  return (
    <LabPage
      preSchool={<PerfectMatch style={{ padding: `${GAP}px 0 16px` }} />}
      // Everything other travellers did with us, as one group: what they
      // booked, what they filmed, what they said. Straight after Sunday School,
      // where the shared prototype puts the itineraries. On the warm ground.
      travellers={{
        title: "Our travellers",
        sub: "What they booked, filmed and said.",
        moments: { title: "On their trips", sub: "Reels from their holidays." },
        reviews: { title: "In their words" },
      }}
      afterSchool={
        <BookedTripsRail
          title="What they booked"
          sub="Real itineraries, from recent bookings."
          titleColor={NAVY}
          titleStyle={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}
          style={{ background: "transparent", marginTop: 20, marginBottom: 8 }}
        />
      }
    >
      {booked ? (bookedStyle === "hero" ? <BookedHero /> : <BookedTop />) : (
      <>
      <div style={{ position: "relative", height: HERO }}>
        <LabVideo src={d.video} poster={d.hero} fade={0.72} style={{ position: "absolute", inset: 0 }}>
          <HeroScrim />
        </LabVideo>
        <TopBar onVideo style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <p style={{ position: "absolute", left: 22, right: 22, bottom: compact ? 104 : 92, height: 80, margin: 0,
          textAlign: "center", fontSize: 26, fontWeight: 800, lineHeight: "32px",
          letterSpacing: "-0.5px", color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{LINE}</p>
        {/* Compact: the proof sits on the clip, just above where the button lands. */}
        {compact && <ProofLine onVideo style={{ position: "absolute", left: 0, right: 0, bottom: 25 + JOIN + 16 }} />}
      </div>

      <div style={{ position: "relative", zIndex: 2, margin: `${-25 - JOIN}px ${PAD}px 0` }}>
        <PlanAction trip={trip} full size="lg" raised />
        {!compact && <ProofLine style={{ marginTop: 11 }} />}
      </div>
      </>
      )}

      {/* The block must not clip: the cards throw a soft shadow well past their
          own edge, and cutting it off leaves a pale strip where the tint stops.
          Only the fronds need clipping, so they get their own clipping layer. */}
      <div style={{ position: "relative", zIndex: 3, marginTop: compact && !booked ? 30 : GAP, background: W.top }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <Leaf side="right" height={92} />
          <Leaf side="left" height={104} style={{ bottom: "8%" }} />
        </div>
        <div style={{ position: "relative" }}>
          <DisplayTitle title={compact ? "Curated Destinations" : "Destinations"} />
          <PolaroidGrid items={LAB_SIX} />
        </div>
      </div>
    </LabPage>
  );
}
