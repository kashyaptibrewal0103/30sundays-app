import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { C, destData } from "../../data";
import { NAVY, PAD, W } from "./labShared";

// Five ways to put the rating and the traveller count between the headline and
// the button. All five sit on a photograph, which is the hard part: white type
// on a moving clip needs either a ground of its own or a strong shadow.

const RATING = "4.6";
const TRAVELLERS = "25,000+ travellers";
const SHOT = destData.Bali.hero;
const LINE = "Complete Picture of your Holiday";

// Google's own mark, drawn to their geometry and in their four colours. It is
// never recoloured, outlined or set on a busy part of the picture.
const GoogleG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Google" style={{ display: "block", flexShrink: 0 }}>
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.4c4.1-3.8 6.6-9.4 6.6-15.7z" />
    <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-6.9-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.2 5.6C7.9 41 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.5 28.3c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3l-7.2-5.6C2.9 17 2 20.4 2 24s.9 7 2.3 9.9l7.2-5.6z" />
    <path fill="#EA4335" d="M24 10.7c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4.5 30 2 24 2 15.4 2 7.9 7 4.3 14.1l7.2 5.6C13.3 14.5 18.2 10.7 24 10.7z" />
  </svg>
);


const SHADOW = "0 1px 10px rgba(0,0,0,0.55)";
const DIM = "rgba(255,255,255,0.88)";

// One line, directly under the button, the way the old home carried it. The
// five differ only in what leads and how the two facts are held apart.
const Row = ({ children, gap = 7 }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap, textShadow: SHADOW,
    fontSize: 12.5, color: DIM,
  }}>{children}</span>
);
const Dot = () => <span style={{ color: "rgba(255,255,255,0.55)" }}>·</span>;
const Rule = () => <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.4)" }} />;
const Num = ({ children }) => (
  <b style={{ color: "#fff", fontWeight: 800 }}>{children}</b>
);
const Pip = ({ size = 12 }) => <Star size={size} color="#FBBC05" fill="#FBBC05" strokeWidth={0} />;

/* 1. The mark leads */
const WithMark = () => (
  <Row><GoogleG size={14} /><Num>{RATING}</Num><Pip /><Dot /><span>{TRAVELLERS}</span></Row>
);

/* 2. The star leads, no mark */
const WithStar = () => (
  <Row><Pip size={13} /><Num>{RATING}</Num><span>on Google</span><Dot /><span>{TRAVELLERS}</span></Row>
);

/* 3. Words only */
const WordsOnly = () => (
  <Row><span>Rated <Num>{RATING}</Num> on Google</span><Dot /><span>{TRAVELLERS}</span></Row>
);

/* 4. The volume leads */
const VolumeFirst = () => (
  <Row><Num>{TRAVELLERS}</Num><Dot /><GoogleG size={13} /><Num>{RATING}</Num><Pip size={11} /></Row>
);

/* 5. Held apart by a rule */
const Ruled = () => (
  <Row gap={9}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <GoogleG size={13} /><Num>{RATING}</Num><Pip size={11} />
    </span>
    <Rule />
    <span>{TRAVELLERS}</span>
  </Row>
);

const OPTIONS = [
  { n: 1, name: "The mark leads", note: "Google's own mark, then the score and a star, then the count. Closest to how a rating is normally shown.", Comp: WithMark },
  { n: 2, name: "The star leads", note: "A star instead of the logo, with the word Google in the line. Nothing to get wrong about brand usage.", Comp: WithStar },
  { n: 3, name: "Words only", note: "No mark and no star. The quietest, and the one least likely to look like a badge stuck on a photograph.", Comp: WordsOnly },
  { n: 4, name: "The volume leads", note: "The count first, the rating after. Puts the bigger number where the eye lands and keeps the two facts clearly separate.", Comp: VolumeFirst },
  { n: 5, name: "Held apart", note: "A thin rule between the rating and the count rather than a dot, so nobody reads the count as the number of reviews.", Comp: Ruled },
];

function Hero({ children }) {
  return (
    <div style={{ position: "relative", height: 300, overflow: "hidden", borderRadius: 14 }}>
      <img src={SHOT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 34%, rgba(0,0,0,0.66) 100%)" }} />
      <div style={{ position: "absolute", top: 12, left: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", textShadow: SHADOW }}>30 Sundays</span>
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, textAlign: "center" }}>
        <p style={{ margin: "0 0 14px", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: "30px", textShadow: SHADOW }}>
          {LINE}
        </p>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7, background: C.p600, color: "#fff",
          borderRadius: 999, padding: "11px 24px", fontSize: 14.5, fontWeight: 800,
          boxShadow: "0 6px 20px rgba(253,1,79,0.4)",
        }}>Plan my trip →</span>
        {/* Under the button, where it was to begin with. */}
        <div style={{ marginTop: 11 }}>{children}</div>
      </div>
    </div>
  );
}

export default function ProofLab() {
  return (
    <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.page }}>
      <div style={{ padding: `16px ${PAD}px 60px` }}>
        <Link to="/home-lab" style={{ fontSize: 12.5, fontWeight: 700, color: C.p600, textDecoration: "none" }}>Home lab</Link>
        <h1 style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>
          Five ways to show the proof
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>
          One line, directly under the button, the way the old home carried
          it. Same two facts in all five. They differ only in what leads and
          how the rating is held apart from the count.
        </p>

        {OPTIONS.map((o) => (
          <div key={o.n} style={{ marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", background: NAVY, color: "#fff",
                display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
              }}>{o.n}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>{o.name}</span>
            </div>
            <p style={{ margin: "7px 0 12px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>{o.note}</p>
            <Hero><o.Comp /></Hero>
          </div>
        ))}
      </div>
    </div>
  );
}
