import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Plus } from "lucide-react";
import { C } from "../../data";
import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, GRADE, LabVideo, NAVY, PAD, Photo, W } from "./labShared";

// Ten takes on the returning traveller's block: the plan they already have, and
// the way back to starting another. Each one says which of the two actions it
// carries, because that is the real choice here, not the styling.

const TRIP = { dest: "Bali", nights: 7, dates: "Mar 31 to Apr 6", stage: "With our team" };
const ART = LAB_SIX[0];
const PLAN = "/itinerary/3?dealId=demo_draft_bali&versionId=demo_draft_bali_v1";
const NEW = "/build";

function Thumb({ size = 54, radius = 14, style }) {
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: radius, overflow: "hidden", flexShrink: 0, ...style }}>
      <Photo src={ART.img} alt="" />
    </div>
  );
}

// 1. Crew's own card: the trip named plainly, and a pill half under it that
//    goes to the full list. Nothing here starts a second trip.
function CrewCard() {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <Link to={PLAN} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: W.card, borderRadius: 22, padding: "18px 18px", boxShadow: W.shadowLg }}>
        <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 17, fontWeight: 700, color: NAVY, letterSpacing: "-0.2px" }}>{TRIP.dest} trip, {TRIP.dates.split(" to ")[0]}</p>
        <Thumb size={38} radius={19} />
      </Link>
      <div style={{ display: "flex", justifyContent: "center", marginTop: -14 }}>
        <Link to="/trips" style={{ display: "inline-flex", alignItems: "center", gap: 3, background: W.card, borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: NAVY, textDecoration: "none", boxShadow: W.shadow }}>
          View all plans <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// 2. Airbnb's resume card: the sentence is the title, the detail is the second
//    line, the picture sits quietly on the right.
function Resume() {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <Link to={PLAN} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", background: W.card, borderRadius: 20, padding: 16, boxShadow: W.shadow, border: `1px solid ${W.line}` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY, lineHeight: "21px" }}>Continue planning your {TRIP.dest} trip</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: C.sub }}>{TRIP.dates} · {TRIP.nights} nights ›</p>
        </div>
        <Thumb size={62} radius={16} />
      </Link>
    </div>
  );
}

// 3. The one we built. A single light card, two edges peeking below it when
//    there is more than one plan, and View all plans only when there is more to
//    see. No panel, no heading: the deck says there are others.
function Deck({ many = true }) {
  const layer = { position: "absolute", top: 0, borderRadius: 18 };
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <div style={{ position: "relative", paddingBottom: many ? 20 : 0 }}>
        {many && <span style={{ ...layer, left: 20, right: 20, bottom: 0, background: "#FAF2E4", border: "1px solid #EBDCC3" }} />}
        {many && <span style={{ ...layer, left: 10, right: 10, bottom: 9, background: "#FFFCF5", border: "1px solid #F0E3CD" }} />}
        <Link to={PLAN} style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: W.card, borderRadius: 18, padding: 13, border: `1px solid ${W.line}`, boxShadow: "0 6px 20px rgba(120,86,40,0.13)" }}>
          <Thumb size={44} radius={12} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.p600 }}>Continue where you left off</p>
            <p style={{ margin: "2px 0 0", fontSize: 15.5, fontWeight: 800, color: NAVY }}>{TRIP.dest}, {TRIP.nights} nights</p>
          </div>
          <ChevronRight size={18} color={C.icon} />
        </Link>
      </div>
      {many && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: -13, position: "relative", zIndex: 3 }}>
          <Link to="/trips" style={{ display: "inline-flex", alignItems: "center", gap: 3, background: W.card, borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: NAVY, textDecoration: "none", boxShadow: W.shadow }}>
            View all plans <ChevronRight size={14} />
          </Link>
        </div>
      )}
      <Link to={NEW} style={{ display: "block", textAlign: "center", marginTop: many ? 12 : 10, fontSize: 13, fontWeight: 600, color: C.sub, textDecoration: "underline", textUnderlineOffset: 3 }}>Plan another trip</Link>
    </div>
  );
}

function DeckOne() { return <Deck many={false} />; }

// 4. Both actions on one line: the plan takes the room it needs, starting
//    another takes the corner. Nothing scrolls and nothing is hidden.
function SideBySide() {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "flex", gap: 11 }}>
      <Link to={PLAN} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 11, textDecoration: "none", background: W.card, borderRadius: 20, padding: 13, boxShadow: W.shadow, border: `1px solid ${W.line}` }}>
        <Thumb size={42} radius={12} />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: NAVY }}>{TRIP.dest}</p>
          <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.sub }}>{TRIP.stage}</p>
        </div>
      </Link>
      <Link to={NEW} aria-label="Plan another trip" style={{ width: 74, display: "grid", placeItems: "center", textDecoration: "none", background: W.card, borderRadius: 20, border: `1px dashed ${C.p300}`, gap: 3 }}>
        <Plus size={19} color={C.p600} strokeWidth={2.6} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: C.p600 }}>New</span>
      </Link>
    </div>
  );
}

// 5. Two rows of equal weight. Reads as a short list of what you can do next,
//    which is honest when someone has exactly one plan on the go.
function TwoRows() {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <Link to={PLAN} style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", padding: "13px 0", borderBottom: `1px solid ${W.line}` }}>
        <Thumb size={50} radius={14} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: NAVY }}>{TRIP.dest}, {TRIP.nights} nights</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{TRIP.stage} · {TRIP.dates}</p>
        </div>
        <ChevronRight size={18} color={C.icon} />
      </Link>
      <Link to={NEW} style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", padding: "13px 0" }}>
        <span style={{ width: 50, height: 50, borderRadius: 14, display: "grid", placeItems: "center", background: C.p100, flexShrink: 0 }}>
          <Plus size={20} color={C.p600} strokeWidth={2.5} />
        </span>
        <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 15.5, fontWeight: 800, color: NAVY }}>Plan another trip</p>
        <ChevronRight size={18} color={C.icon} />
      </Link>
    </div>
  );
}

// 6. The plan rides on the clip as a thin glass strip, so the fuchsia button
//    underneath stays the one loud thing on the screen.
function OnClip() {
  return (
    <div>
      <div style={{ position: "relative", height: 172 }}>
        <LabVideo src={null} poster={ART.hero} style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(42,22,14,0.3) 0%, rgba(255,246,230,0) 76%, ${W.top} 100%)` }} />
        </LabVideo>
        <Link to={PLAN} style={{ position: "absolute", left: PAD, right: PAD, top: 16, display: "flex", alignItems: "center", gap: 10, textDecoration: "none", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", backdropFilter: "blur(10px)", borderRadius: 999, padding: "9px 14px" }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{TRIP.dest} plan · {TRIP.stage}</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff" }}>See plan</span>
        </Link>
      </div>
      <div style={{ position: "relative", zIndex: 2, margin: `-26px ${PAD}px 0` }}>
        <Link to={NEW} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.p600, color: "#fff", borderRadius: 999, padding: "15px 26px", fontSize: 15.5, fontWeight: 700, textDecoration: "none", boxShadow: "0 10px 28px rgba(227,27,83,0.32)" }}>
          Plan another trip <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// 7. Says where the plan has got to. The bar is the only thing here that a
//    plain card cannot do, and it answers the question people actually ask.
function Progress() {
  const steps = ["Sent", "Being built", "Ready"];
  const at = 1;
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <div style={{ background: W.card, borderRadius: 22, padding: 16, boxShadow: W.shadow, border: `1px solid ${W.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Thumb size={46} radius={13} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: NAVY }}>{TRIP.dest}, {TRIP.nights} nights</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{TRIP.dates}</p>
          </div>
          <Link to={PLAN} style={{ fontSize: 13.5, fontWeight: 800, color: C.p600, textDecoration: "none" }}>See plan</Link>
        </div>
        <div style={{ display: "flex", gap: 5, margin: "15px 0 8px" }}>
          {steps.map((s, n) => <span key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= at ? C.p600 : W.line }} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {steps.map((s, n) => <span key={s} style={{ fontSize: 10.5, fontWeight: n === at ? 800 : 600, color: n <= at ? NAVY : C.inact }}>{s}</span>)}
        </div>
      </div>
      <Link to={NEW} style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 13, fontWeight: 600, color: C.sub, textDecoration: "underline", textUnderlineOffset: 3 }}>Plan another trip</Link>
    </div>
  );
}

// 8. A stub, the way a ticket is torn. The notch is the only decoration and it
//    is doing a job: it says this is a thing you already hold.
function Stub() {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <Link to={PLAN} style={{ display: "flex", alignItems: "stretch", textDecoration: "none", background: W.card, borderRadius: 20, overflow: "hidden", boxShadow: W.shadow, border: `1px solid ${W.line}` }}>
        <div style={{ position: "relative", width: 96, flexShrink: 0 }}><Photo src={ART.img} alt="" /></div>
        <div style={{ width: 0, borderLeft: `2px dashed ${W.line}`, margin: "10px 0" }} />
        <div style={{ flex: 1, minWidth: 0, padding: "14px 15px" }}>
          <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: NAVY, lineHeight: 1 }}>{TRIP.dest}</p>
          <p style={{ margin: "5px 0 0", fontSize: 12.5, color: C.sub }}>{TRIP.dates} · {TRIP.nights} nights</p>
          <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 800, color: C.p600 }}>See plan ›</p>
        </div>
      </Link>
    </div>
  );
}

// 9. Two blocks that look like two different things, because they are: one you
//    already own, one you have not started. Follows the rule that different
//    kinds of thing should not arrive as the same white card.
function TwoBlocks() {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <Link to={PLAN} style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", background: W.card, borderRadius: 20, padding: 14, boxShadow: W.shadow, border: `1px solid ${W.line}` }}>
        <Thumb size={52} radius={14} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: NAVY }}>{TRIP.dest}, {TRIP.nights} nights</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{TRIP.stage}</p>
        </div>
        <ChevronRight size={18} color={C.icon} />
      </Link>
      <div style={{ marginTop: 12, borderRadius: 20, border: `1px dashed ${C.p300}`, padding: "16px 16px 15px", textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: NAVY, lineHeight: 1 }}>Somewhere else in mind?</p>
        <Link to={NEW} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 11, background: C.p600, color: "#fff", borderRadius: 999, padding: "11px 20px", fontSize: 14.5, fontWeight: 700, textDecoration: "none" }}>
          Plan another trip <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

// 10. One block, two states. The switch keeps both actions in reach without
//     ever showing two competing buttons at once.
function Switcher() {
  const [tab, setTab] = useState(0);
  const tabStyle = (on) => ({ flex: 1, padding: "9px 0", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, borderRadius: 999, background: on ? W.card : "transparent", color: on ? NAVY : C.sub, boxShadow: on ? W.shadow : "none" });
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <div style={{ display: "flex", gap: 4, padding: 4, background: "#F6EADB", borderRadius: 999 }}>
        <button onClick={() => setTab(0)} style={tabStyle(tab === 0)}>My plan</button>
        <button onClick={() => setTab(1)} style={tabStyle(tab === 1)}>Somewhere new</button>
      </div>
      <div style={{ marginTop: 12, background: W.card, borderRadius: 20, padding: 15, boxShadow: W.shadow, border: `1px solid ${W.line}`, animation: "fadeUp 0.22s ease-out" }}>
        {tab === 0 ? (
          <Link to={PLAN} style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none" }}>
            <Thumb size={50} radius={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: NAVY }}>{TRIP.dest}, {TRIP.nights} nights</p>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{TRIP.stage} · {TRIP.dates}</p>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: C.p600 }}>See plan</span>
          </Link>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: NAVY }}>Six countries to choose from</p>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>Your {TRIP.dest} plan stays where it is.</p>
            </div>
            <Link to={NEW} aria-label="Plan another trip" style={{ width: 42, height: 42, borderRadius: 21, background: C.p600, display: "grid", placeItems: "center", flexShrink: 0, textDecoration: "none" }}>
              <ArrowRight size={18} color="#fff" strokeWidth={2.4} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const TAKES = [
  { n: 1, name: "Crew card", shows: "Plan only", cost: "Calmest, and closest to Crew. Starting another trip has to live on the plans screen.", El: CrewCard },
  { n: 2, name: "Airbnb resume", shows: "Plan only", cost: "The sentence tells you exactly what happens next. No way in to a second trip from here.", El: Resume },
  { n: 3, name: "Deck (built)", shows: "Both", cost: "This is what the five homes now use. The stacked edges carry the fact that there are others, so no heading or count is needed.", El: Deck },
  { n: 3.5, name: "Deck, one plan", shows: "Both", cost: "The same block when there is only one plan: no edges behind it, and no View all plans.", El: DeckOne },
  { n: 4, name: "Side by side", shows: "Both", cost: "Both actions in one line, nothing hidden. The new trip tile is small, so it reads as secondary.", El: SideBySide },
  { n: 5, name: "Two rows", shows: "Both", cost: "Reads as a short list of what to do next. Gives the two actions equal weight, which may be wrong.", El: TwoRows },
  { n: 6, name: "Strip on the clip", shows: "Both", cost: "Keeps one loud button on the screen. The plan becomes quiet, and glass over footage is the hardest thing to read.", El: OnClip },
  { n: 7, name: "Progress", shows: "Both", cost: "Answers the question people actually ask. Only honest if the stage is real data, not decoration.", El: Progress },
  { n: 8, name: "Ticket stub", shows: "Plan only", cost: "Feels like something you already hold. The notch is decoration, and it suits a booking better than a draft.", El: Stub },
  { n: 9, name: "Two blocks", shows: "Both", cost: "The two are clearly different kinds of thing. Takes the most vertical room of the ten.", El: TwoBlocks },
  { n: 10, name: "Switcher", shows: "Both", cost: "Never two buttons competing. Costs a tap, and half the block is hidden at any moment.", El: Switcher },
];

export default function PlansLab() {
  return (
    <div data-lab-scroll className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.top }}>
      <div style={{ padding: `18px ${PAD}px 6px` }}>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.02 }}>Ten ways back in</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.sub, lineHeight: "18px" }}>
          What a returning traveller sees. Each says whether it carries one action or both.
        </p>
      </div>

      {TAKES.map(({ n, name, shows, cost, El }) => (
        <div key={n} style={{ marginTop: 30 }}>
          <div style={{ padding: `0 ${PAD}px 12px`, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.p600 }}>{n}</span>
            <span style={{ flex: 1, fontSize: 15.5, fontWeight: 800, color: NAVY, letterSpacing: "-0.2px" }}>{name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: shows === "Both" ? "#1B7F4C" : C.inact }}>{shows}</span>
          </div>
          <El />
          <p style={{ margin: `13px ${PAD}px 0`, fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{cost}</p>
        </div>
      ))}
      <div style={{ height: 90 }} />
    </div>
  );
}
