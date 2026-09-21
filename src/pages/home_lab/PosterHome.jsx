import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { C } from "../../data";
import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, LabPage, LabVideo, NAVY, GAP, JOIN, PAD, Leaf, Photo, PlanAction, RotatingLine, TopBar, W, promiseAt, useLeadTrip, useRotate } from "./labShared";

// A printed collection. Photo on one side, cream and big handwriting on the
// other, alternating down the page. No caption ever sits on a photo, so the
// colour stays in the pictures and the words stay easy to read.

function Poster({ d, flip }) {
  // The photo runs off the outer edge of the phone; the words keep the page's
  // margin on their side. Alternating which side is which is what makes the
  // stack read as a printed collection rather than a list.
  const art = (
    <div style={{ position: "relative", flex: "0 0 52%", height: 182, overflow: "hidden", borderRadius: flip ? "0 22px 22px 0" : "22px 0 0 22px", boxShadow: W.shadow }}>
      <Photo src={d.img} alt={d.name} />
    </div>
  );
  const words = (
    <div style={{ flex: 1, minWidth: 0, padding: flip ? `0 ${PAD}px 0 14px` : `0 14px 0 ${PAD}px`, textAlign: flip ? "left" : "right" }}>
      <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: NAVY, lineHeight: 1.02 }}>{d.name}</p>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: C.sub, lineHeight: "16px" }}>{d.blurb}</p>
    </div>
  );
  return (
    <Link to={`/destination/${encodeURIComponent(d.name)}`}
      style={{ display: "flex", alignItems: "center", textDecoration: "none", marginBottom: 20, flexDirection: flip ? "row" : "row-reverse" }}>
      {art}{words}
    </Link>
  );
}

export default function PosterHome({ userState }) {
  const trip = useLeadTrip(userState);
  const i = useRotate(LAB_SIX.length);
  const d = LAB_SIX[i];

  return (
    <LabPage>
      <div style={{ position: "relative", height: 372 }}>
        <LabVideo src={d.video} poster={d.hero} fade={0.74} style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(42,22,14,0.44) 0%, rgba(42,22,14,0) 30%, rgba(42,22,14,0) 48%, rgba(42,22,14,0.46) 100%)" }} />
        </LabVideo>
        <TopBar onVideo style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
        <RotatingLine text={promiseAt(i)} height={76}
          boxStyle={{ left: 22, right: 22, bottom: 40 }}
          style={{ textAlign: "center", fontFamily: DISPLAY, fontSize: 33, fontWeight: 700, lineHeight: "36px", color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2, margin: `${-25 - JOIN}px ${PAD}px 0` }}>
        <PlanAction trip={trip} full size="lg" raised />
      </div>

      <div style={{ position: "relative", overflow: "hidden", padding: `${GAP}px 0 0` }}>
        <Leaf side="right" height={92} style={{ top: 16 }} />
        <Leaf side="left" height={100} style={{ bottom: "12%" }} />
        <div style={{ position: "relative" }}>
          {LAB_SIX.map((c, n) => <Poster key={c.name} d={c} flip={n % 2 === 1} />)}
        </div>
      </div>

    </LabPage>
  );
}
