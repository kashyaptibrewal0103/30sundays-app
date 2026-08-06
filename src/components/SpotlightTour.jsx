import { useLayoutEffect, useState } from "react";
import { ArrowRight, ArrowLeft, X as XIcon } from "lucide-react";
import { C } from "../data";
import { useFrameRect } from "./useFrameRect";

// A guided coach-mark tour. Given a list of steps (each pointing at a real
// on-screen element by CSS selector), it dims the phone, cuts a spotlight
// around the current target and shows a caption with Next / Back / Skip.
// The dimming is drawn as four rectangles clamped to the phone frame so it
// never bleeds outside the device on desktop.
export default function SpotlightTour({ steps: candidateSteps, onClose }) {
  const frame = useFrameRect();
  // Keep only steps whose target actually exists (e.g. a day may have no
  // "change day plan" option, or the plan may already be saved).
  const [steps] = useState(() => candidateSteps.filter((s) => document.querySelector(s.selector)));
  const [i, setI] = useState(0);
  const [target, setTarget] = useState(null);
  const step = steps[i];

  useLayoutEffect(() => {
    if (steps.length === 0) { onClose(); return; }
    const el = document.querySelector(step.selector);
    if (!el) { if (i < steps.length - 1) setI(i + 1); else onClose(); return; }
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const measure = () => {
      const r = el.getBoundingClientRect();
      setTarget({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    measure(); // sync (scrollIntoView is instant) so it works even if rAF is throttled
    const raf = requestAnimationFrame(measure); // refine once the scroll settles
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, steps]);

  if (steps.length === 0 || !target) {
    // Full dim while we scroll/measure so nothing flashes.
    return <div style={{ position: "fixed", left: frame.left, top: frame.top, width: frame.width, height: frame.height, zIndex: 3500, background: "rgba(12,14,30,0.55)" }} />;
  }

  const PAD = 8;
  // Highlight box, clamped to the frame.
  const hx = Math.max(frame.left, target.left - PAD);
  const hy = Math.max(frame.top, target.top - PAD);
  const hr = Math.min(frame.left + frame.width, target.left + target.width + PAD);
  const hb = Math.min(frame.top + frame.height, target.top + target.height + PAD);
  const hw = Math.max(0, hr - hx);
  const hh = Math.max(0, hb - hy);

  const DIM = "rgba(12,14,30,0.62)";
  const dims = [
    { left: frame.left, top: frame.top, width: frame.width, height: hy - frame.top },                 // above
    { left: frame.left, top: hb, width: frame.width, height: frame.top + frame.height - hb },          // below
    { left: frame.left, top: hy, width: hx - frame.left, height: hh },                                 // left
    { left: hr, top: hy, width: frame.left + frame.width - hr, height: hh },                            // right
  ];

  // Place the caption below the target, unless the target sits low in the frame.
  const below = target.top + target.height / 2 < frame.top + frame.height * 0.58;
  const last = i === steps.length - 1;

  const captionStyle = below
    ? { top: hb + 14 }
    : { bottom: window.innerHeight - (hy - 14) };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3500 }}>
      {/* Dimmed regions (block interaction with the rest of the screen) */}
      {dims.map((d, n) => (
        <div key={n} onClick={() => {}} style={{ position: "fixed", left: d.left, top: d.top, width: Math.max(0, d.width), height: Math.max(0, d.height), background: DIM }} />
      ))}
      {/* Highlight ring around the target */}
      <div style={{ position: "fixed", left: hx, top: hy, width: hw, height: hh, borderRadius: 12, boxShadow: `0 0 0 3px ${C.p600}, 0 0 0 7px rgba(227,27,83,0.28)`, pointerEvents: "none" }} />

      {/* Caption card */}
      <div style={{ position: "fixed", left: frame.left + 16, width: frame.width - 32, boxSizing: "border-box", ...captionStyle, background: C.white, borderRadius: 16, padding: "16px 16px 14px", boxShadow: "0 12px 40px rgba(12,14,30,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1px", color: C.p600, textTransform: "uppercase" }}>Step {i + 1} of {steps.length}</span>
          <button onClick={onClose} aria-label="Skip tour" style={{ display: "inline-flex", alignItems: "center", gap: 3, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: C.sub, padding: 2 }}>
            Skip <XIcon size={14} color={C.sub} />
          </button>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: C.head, margin: "0 0 5px", letterSpacing: "-0.3px" }}>{step.title}</h3>
        <p style={{ fontSize: 13.5, color: C.sub, lineHeight: "20px", margin: "0 0 14px" }}>{step.body}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {i > 0 && (
            <button onClick={() => setI(i - 1)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <button onClick={() => (last ? onClose() : setI(i + 1))} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 0", borderRadius: 10, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {last ? "Got it" : "Next"} {!last && <ArrowRight size={16} color="#fff" />}
          </button>
        </div>
      </div>
    </div>
  );
}
