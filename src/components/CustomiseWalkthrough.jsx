import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X as XIcon, SlidersHorizontal, CalendarRange, BedDouble, FileCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { C } from "../data";
import { useFrameRect } from "./useFrameRect";

// Full-screen walkthrough that explains the "make it yours" customisation flow.
// Auto-shows once on the home screen and is re-openable from a "How it works"
// button. Four plain steps, each with an icon, title and one line of copy.
const STEPS = [
  {
    Icon: SlidersHorizontal,
    title: "Change the big things",
    body: "Switch your destination, travel dates, travellers or route anytime from the Edit button.",
    tint: C.p600, tintBg: C.p100,
  },
  {
    Icon: CalendarRange,
    title: "Tune any day",
    body: "Not loving a day's plan? Tap Change day plan on that day to swap it for another option.",
    tint: "#1F78FF", tintBg: "#E7F0FF",
  },
  {
    Icon: BedDouble,
    title: "Switch your stay",
    body: "Tap Change hotel on any hotel to pick a stay you like better.",
    tint: "#4EAC7E", tintBg: "#E4F5EC",
  },
  {
    Icon: FileCheck,
    title: "Save to lock it in",
    body: "Save your itinerary to see the final price and get a PDF. Your consultant sees your version only after you save.",
    tint: "#712BDA", tintBg: "#EFE7FB",
  },
];

export default function CustomiseWalkthrough({ onClose, onStart }) {
  const navigate = useNavigate();
  const frame = useFrameRect();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const Icon = step.Icon;

  const finish = () => {
    if (onStart) onStart();
    else navigate("/build");
  };

  return (
    <div style={{ position: "fixed", left: frame.left, top: frame.top, width: frame.width, height: frame.height, zIndex: 4000, background: C.white, display: "flex", flexDirection: "column", fontFamily: "'Figtree', sans-serif" }}>
      {/* Top row: step dots + skip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 18px 0" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((_, n) => (
            <span key={n} style={{ width: n === i ? 22 : 7, height: 7, borderRadius: 999, background: n === i ? C.p600 : C.div, transition: "width .2s ease" }} />
          ))}
        </div>
        <button onClick={onClose} aria-label="Skip" style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.sub, padding: 4 }}>
          Skip <XIcon size={15} color={C.sub} />
        </button>
      </div>

      {/* Hero illustration area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 26px", textAlign: "center" }}>
        <div style={{ position: "relative", marginBottom: 30 }}>
          <div style={{ width: 132, height: 132, borderRadius: "50%", background: step.tintBg, display: "grid", placeItems: "center" }}>
            <Icon size={54} color={step.tint} strokeWidth={1.8} />
          </div>
          <span style={{ position: "absolute", top: -6, right: -6, background: C.p600, color: "#fff", fontSize: 13, fontWeight: 800, width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(227,27,83,0.35)" }}>{i + 1}</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.4px", color: C.p600, textTransform: "uppercase", margin: "0 0 10px" }}>Make it yours</p>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.head, margin: "0 0 12px", letterSpacing: "-0.4px" }}>{step.title}</h2>
        <p style={{ fontSize: 15, color: C.sub, lineHeight: "23px", margin: 0, maxWidth: 320 }}>{step.body}</p>
      </div>

      {/* Bottom controls */}
      <div style={{ padding: "0 22px calc(26px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
        {i > 0 && (
          <button onClick={() => setI(i - 1)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "13px 18px", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <button
          onClick={() => (last ? finish() : setI(i + 1))}
          style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "14px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(227,27,83,0.3)" }}
        >
          {last ? "Start planning" : "Next"} <ArrowRight size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
}
