import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { C } from "../../data";
import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, HeroScrim, JOIN, LabPage, LabVideo, NAVY, PAD, PlanAction, RotatingLine, TopBar, W, promiseAt, useCentreIndex, useLeadTrip, useRotate } from "./labShared";

// No hero and no grid. The page is six country chapters butted edge to edge,
// so scrolling is the browsing. Only the chapter nearest the middle of the
// phone plays its clip, which keeps one page from loading six videos at once.

const FIRST = 452;
const REST = 336;

function Chapter({ d, tall, playing, children }) {
  return (
    <div style={{ position: "relative", height: tall ? FIRST : REST }}>
      <LabVideo src={d.video} poster={d.hero} active={playing} style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(42,22,14,0.34) 0%, rgba(42,22,14,0) 30%, rgba(42,22,14,0) 44%, rgba(42,22,14,0.78) 100%)" }} />
      </LabVideo>
      {children}
      <Link to={`/destination/${encodeURIComponent(d.name)}`} style={{ position: "absolute", left: PAD, right: PAD, bottom: tall ? 84 : 20, textDecoration: "none" }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1, textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}>{d.name}</p>
        <p style={{ margin: "7px 0 0", fontSize: 13, color: "rgba(255,255,255,0.92)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{d.blurb}</p>
      </Link>
    </div>
  );
}

export default function ChapterHome({ userState }) {
  const trip = useLeadTrip(userState);
  const i = useRotate(3);
  const [ref, centre] = useCentreIndex(LAB_SIX.length);

  return (
    <LabPage>
      <div ref={ref}>
        {LAB_SIX.map((d, n) => (
          <Chapter key={d.name} d={d} tall={n === 0} playing={centre === n}>
            {n === 0 && (
              <>
                <TopBar onVideo style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }} />
                <RotatingLine text={promiseAt(i)} height={44}
                  boxStyle={{ left: PAD, right: PAD, top: 62, zIndex: 2 }}
                  style={{ fontSize: 14.5, fontWeight: 600, lineHeight: "21px", color: "rgba(255,255,255,0.96)", textShadow: "0 1px 10px rgba(0,0,0,0.5)" }} />
                {/* The action sits on the first chapter so the clip, the button
                    and a named country all land in the opening screen. */}
                <div style={{ position: "absolute", left: PAD, right: PAD, bottom: JOIN - 25, zIndex: 3 }}>
                  <PlanAction trip={trip} full size="lg" raised />
                </div>
              </>
            )}
          </Chapter>
        ))}
      </div>

    </LabPage>
  );
}
