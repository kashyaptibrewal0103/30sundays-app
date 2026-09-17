import { Link } from "react-router-dom";
import { C } from "../../data";
import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, DisplayTitle, JOIN, LabPage, LabVideo, NAVY, PAD, Leaf, PolaroidGrid, PlanAction, RotatingLine, TopBar, W, promiseAt, useLeadTrip, useRotate } from "./labShared";

// The clip never scrolls away. It is pinned to the top of the phone and the
// countries ride on a panel that slides up over it, the way a sheet does. The
// captions sit on cream under each photo rather than on a dark wash over it,
// so the page keeps its colour instead of greying down.

export default function PinnedHome({ userState }) {
  const trip = useLeadTrip(userState);
  const i = useRotate(LAB_SIX.length);
  const d = LAB_SIX[i];

  return (
    <LabPage>
      <div style={{ position: "sticky", top: 0, height: 414, zIndex: 0 }}>
        <LabVideo src={d.video} poster={d.hero} fade={0.78} style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(42,22,14,0.42) 0%, rgba(42,22,14,0) 30%, rgba(42,22,14,0) 46%, rgba(42,22,14,0.5) 100%)" }} />
        </LabVideo>
        <TopBar onVideo style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <RotatingLine text={promiseAt(i)} height={78}
          boxStyle={{ left: 22, right: 22, bottom: 126 }}
          style={{ textAlign: "center", fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, lineHeight: "37px", color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }} />
        <div style={{ position: "absolute", left: PAD, right: PAD, bottom: JOIN - 25, zIndex: 3 }}>
          <PlanAction trip={trip} full size="lg" raised />
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, marginTop: -30, borderRadius: "28px 28px 0 0", background: W.top, paddingTop: 10, overflow: "hidden", boxShadow: "0 -12px 34px rgba(42,22,14,0.22)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: W.line, margin: "0 auto 16px" }} />
        <Leaf side="right" height={86} style={{ top: 18 }} />
        <DisplayTitle title="Our Curations" style={{ position: "relative" }} />
        <PolaroidGrid items={LAB_SIX} style={{ position: "relative" }} />
      </div>
    </LabPage>
  );
}
