import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { C } from "../../data";
import { BUDGET_CHOICES, LAB_SIX, NIGHT_CHOICES, inr } from "../../data/homeLabData";
import { DISPLAY, DestRow, LabPage, LabSheet, LabVideo, NAVY, GAP, PAD, Leaf, PlanButton, ResumeCard, RotatingLine, TopBar, W, promiseAt, useLeadTrip, useRotate } from "./labShared";

// The request written as a sentence you finish. Three taps and the plan flow
// already knows where, how long and how much, so the first screen does the work
// the wizard used to ask for. The countries sit right below as a plain list.

function Blank({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 3, background: C.p100, color: C.p900, border: "none", borderRadius: 9, padding: "3px 9px", margin: "0 1px", fontFamily: "inherit", fontSize: 18.5, fontWeight: 800, letterSpacing: "-0.3px", cursor: "pointer", verticalAlign: "baseline" }}>
      {children} <ChevronDown size={14} strokeWidth={2.6} />
    </button>
  );
}

function Option({ label, note, on, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "13px 14px", marginBottom: 8, borderRadius: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: on ? C.p100 : C.white, border: `1px solid ${on ? C.p300 : C.div}` }}>
      <span style={{ fontSize: 15, fontWeight: on ? 800 : 600, color: on ? C.p900 : C.head }}>{label}</span>
      {note && <span style={{ fontSize: 12.5, color: C.sub }}>{note}</span>}
    </button>
  );
}

export default function BlankHome({ userState }) {
  const trip = useLeadTrip(userState);
  const i = useRotate(LAB_SIX.length);
  const clip = LAB_SIX[i];

  const [dest, setDest] = useState("Bali");
  const [nights, setNights] = useState(7);
  const [budget, setBudget] = useState(90000);
  const [sheet, setSheet] = useState(null);

  const to = `/build?dest=${encodeURIComponent(dest)}&nights=${nights}&budget=${budget}`;

  const overlay = sheet && (
    <LabSheet onClose={() => setSheet(null)}
      title={sheet === "dest" ? "Where to?" : sheet === "nights" ? "How many nights?" : "Roughly what budget?"}>
      {sheet === "dest" && LAB_SIX.map((d) => (
        <button key={d.name} onClick={() => { setDest(d.name); setSheet(null); }}
          style={{ display: "flex", alignItems: "center", gap: 13, width: "100%", padding: "9px 0", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          <img src={d.img} alt="" style={{ width: 52, height: 52, borderRadius: 13, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: dest === d.name ? C.p600 : C.head }}>{d.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.blurb}</p>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.head, flexShrink: 0 }}>{d.price}</span>
        </button>
      ))}
      {sheet === "nights" && NIGHT_CHOICES.map((n) => (
        <Option key={n} label={`${n} nights`} on={n === nights} onClick={() => { setNights(n); setSheet(null); }} />
      ))}
      {sheet === "budget" && BUDGET_CHOICES.map((b) => (
        <Option key={b} label={inr(b)} note="per person" on={b === budget} onClick={() => { setBudget(b); setSheet(null); }} />
      ))}
    </LabSheet>
  );

  return (
    <LabPage overlay={overlay}>
      <TopBar />
      <div style={{ padding: `0 ${PAD}px` }}>
        <LabVideo src={clip.video} poster={clip.hero} style={{ height: 228, borderRadius: 24 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(42,22,14,0.5) 0%, rgba(42,22,14,0) 34%, rgba(42,22,14,0.58) 100%)" }} />
          <RotatingLine text={promiseAt(i)} height={64}
            boxStyle={{ left: 16, right: 16, bottom: 12 }}
            style={{ fontFamily: DISPLAY, fontSize: 27, fontWeight: 700, lineHeight: "30px", color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.5)" }} />
        </LabVideo>
      </div>

      {/* A lead still gets to start another trip here, so the running plan sits
          above the sentence rather than replacing it. */}
      {trip.isLead && (
        <div style={{ margin: `14px ${PAD}px 0` }}>
          <ResumeCard trip={trip} raised planAnother={false} />
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2, margin: `14px ${PAD}px 0`, background: W.card, borderRadius: 24, padding: 18, border: `1px solid ${W.line}`, boxShadow: W.shadowLg }}>
        <p style={{ margin: "0 0 8px", fontSize: 11.5, fontWeight: 800, color: C.p600, letterSpacing: "0.4px" }}>Tell us the shape of it</p>
        <p style={{ margin: 0, fontSize: 18.5, fontWeight: 600, color: C.head, lineHeight: "36px" }}>
          I want to go to <Blank onClick={() => setSheet("dest")}>{dest}</Blank> for <Blank onClick={() => setSheet("nights")}>{nights} nights</Blank> around <Blank onClick={() => setSheet("budget")}>{inr(budget)}</Blank>
        </p>
        <PlanButton to={to} full size="lg" style={{ marginTop: 16 }} />
      </div>

      <div style={{ position: "relative", overflow: "hidden", padding: `${GAP}px ${PAD}px 0` }}>
        <Leaf side="right" height={86} style={{ top: 10 }} />
        <h2 style={{ position: "relative", margin: "0 0 2px", fontFamily: DISPLAY, fontSize: 31, fontWeight: 700, color: NAVY, lineHeight: 1.05 }}>Or start from a country</h2>
        <p style={{ margin: "2px 0 6px", fontSize: 12.5, color: C.sub }}>Tap one to see what a week there costs.</p>
        {LAB_SIX.map((d, n) => (
          <div key={d.name} style={{ borderTop: n ? `1px solid ${W.line}` : "none" }}>
            <DestRow d={d} />
          </div>
        ))}
      </div>

    </LabPage>
  );
}
