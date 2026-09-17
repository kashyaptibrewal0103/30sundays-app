import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, DisplayTitle, GAP, HeroScrim, JOIN, LabPage, LabVideo, PAD, Leaf, PolaroidGrid, PlanAction, RotatingLine, TopBar, W, promiseAt, useLeadTrip, useRotate } from "./labShared";

// Crew's home, built from our own pieces. The clip fills the first screen with
// one line on it, a white card overlaps its bottom edge, and the countries come
// as a staggered wall rather than a rail. The card is the action: a plan button
// for a new visitor, the live trip once there is one, so it never disappears.

const HERO = 430;
export default function CrewHome({ userState }) {
  const trip = useLeadTrip(userState);
  const i = useRotate(LAB_SIX.length);
  const d = LAB_SIX[i];

  return (
    <LabPage>
      <div style={{ position: "relative", height: HERO }}>
        <LabVideo src={d.video} poster={d.hero} fade={0.72} style={{ position: "absolute", inset: 0 }}>
          <HeroScrim />
        </LabVideo>
        <TopBar onVideo style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <RotatingLine text={promiseAt(i)} height={80}
          boxStyle={{ left: 22, right: 22, bottom: 92 }}
          style={{ textAlign: "center", fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, lineHeight: "38px", color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2, margin: `${-25 - JOIN}px ${PAD}px 0` }}>
        <PlanAction trip={trip} full size="lg" raised />
      </div>

      {/* Fronds peek in from the page edges, the way they do on the site. The
          block clips them, so only a corner of each is ever on screen. */}
      <div style={{ position: "relative", overflow: "hidden", marginTop: GAP, paddingBottom: 8 }}>
        <Leaf side="right" height={92} />
        <Leaf side="left" height={104} style={{ bottom: "8%" }} />
        <div style={{ position: "relative" }}>
          <DisplayTitle title="Our Curations" />
          <PolaroidGrid items={LAB_SIX} />
        </div>
      </div>

    </LabPage>
  );
}
