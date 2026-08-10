import { useLayoutEffect, useState } from "react";
import { Pointer, ChevronsUpDown, X as XIcon, ChevronLeft } from "lucide-react";
import { C } from "../data";
import { useFrameRect } from "./useFrameRect";

// A guided coach-mark tour styled to match the app's "watch my trip" tutorial:
// the real screen is dimmed, a bright spotlight hugs the actual control, a
// finger gesture sits on it, and a short one-line caption plus a "Skip" pill
// float on the dim (no heavy text card). Tapping anywhere advances.
//
// Each step points at a real on-screen element by CSS selector and carries a
// short `text` and a `gesture` ("tap" | "swipe"). The dim is drawn with a huge
// box-shadow on the spotlight, clipped to the phone frame so it never bleeds
// outside the device on desktop.
export default function SpotlightTour({ steps: candidateSteps, onClose }) {
  const frame = useFrameRect();
  // Keep only steps whose target actually exists on this screen right now.
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

  const last = i === steps.length - 1;
  const next = () => (last ? onClose() : setI(i + 1));
  const back = (e) => { e.stopPropagation(); setI(Math.max(0, i - 1)); };
  const skip = (e) => { e.stopPropagation(); onClose(); };

  if (steps.length === 0 || !target) {
    // Full dim while we scroll/measure so nothing flashes.
    return <div style={{ position: "fixed", left: frame.left, top: frame.top, width: frame.width, height: frame.height, zIndex: 3500, background: "rgba(6,8,20,0.62)" }} />;
  }

  const DIM = "rgba(6,8,20,0.82)";
  const PAD = 10;

  // Spotlight box, hugging the target and clamped to the frame. A stadium
  // radius makes it a circle for square targets and a pill for wide buttons.
  const sx = Math.max(frame.left + 4, target.left - PAD);
  const sy = Math.max(frame.top + 4, target.top - PAD);
  const sr = Math.min(frame.left + frame.width - 4, target.left + target.width + PAD);
  const sb = Math.min(frame.top + frame.height - 4, target.top + target.height + PAD);
  const sw = Math.max(0, sr - sx);
  const sh = Math.max(0, sb - sy);
  const radius = Math.min(sw, sh) / 2 + 4;

  // Frame-relative coordinates (everything is drawn inside the clipped frame box).
  const rx = sx - frame.left;
  const ry = sy - frame.top;

  // Finger gesture sits just below-right of the spotlight, nudged to stay in frame.
  const handLeft = Math.min(rx + sw - 10, frame.width - 52);
  const handTop = Math.min(ry + sh - 4, frame.height - 84);

  // The caption + controls live in one panel with a soft dark scrim so white
  // text stays readable over the (dimmed) real screen. It sits opposite the
  // spotlight - at the bottom when the spotlight is high, at the top when low -
  // so it never covers the highlighted control or the finger.
  const bottomMode = ry + sh < frame.height * 0.6;
  const swipe = step.gesture === "swipe";
  const GestureIcon = swipe ? ChevronsUpDown : Pointer;

  const panelStyle = bottomMode
    ? { left: 0, right: 0, bottom: 0, paddingTop: 70, paddingBottom: 20, background: "linear-gradient(to top, rgba(6,8,20,0.94) 62%, rgba(6,8,20,0))" }
    : { left: 0, right: 0, top: 0, paddingTop: 64, paddingBottom: 44, background: "linear-gradient(to bottom, rgba(6,8,20,0.94) 60%, rgba(6,8,20,0))" };

  return (
    <div
      onClick={next}
      style={{ position: "fixed", left: frame.left, top: frame.top, width: frame.width, height: frame.height, overflow: "hidden", zIndex: 3500, cursor: "pointer" }}
    >
      <style>{`
        @keyframes tourHand { 0%,100% { transform: translateY(0) scale(1); } 45% { transform: translateY(3px) scale(0.9); } }
        @keyframes tourRipple { 0% { transform: scale(0.5); opacity: 0.55; } 100% { transform: scale(1.7); opacity: 0; } }
      `}</style>

      {/* Spotlight: the box-shadow paints the whole dim, cut out around the target */}
      <div style={{ position: "absolute", left: rx, top: ry, width: sw, height: sh, borderRadius: radius, boxShadow: `0 0 0 2.5px rgba(255,255,255,0.92), 0 0 0 6px rgba(227,27,83,0.35), 0 0 0 9999px ${DIM}`, pointerEvents: "none" }} />

      {/* Finger gesture on the control */}
      <div style={{ position: "absolute", left: handLeft, top: handTop, width: 46, height: 46, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(255,255,255,0.35)", animation: "tourRipple 1.5s ease-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "tourHand 1.5s ease-in-out infinite" }}>
          <GestureIcon size={30} color="#fff" strokeWidth={2} style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
        </div>
      </div>

      {/* Caption + controls panel, on a soft scrim, opposite the spotlight */}
      <div style={{ position: "absolute", paddingLeft: 20, paddingRight: 20, ...panelStyle }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", opacity: 0.8, marginBottom: 8, letterSpacing: "0.3px" }}>{i + 1}/{steps.length}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", lineHeight: "26px", marginBottom: 18 }}>{step.text || step.body}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ minWidth: 56 }}>
            {i > 0 && (
              <button onClick={back} style={{ display: "inline-flex", alignItems: "center", gap: 2, border: "none", background: "none", color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
                <ChevronLeft size={16} color="rgba(255,255,255,0.85)" /> Back
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {steps.map((_, n) => (
              <span key={n} style={{ width: n === i ? 18 : 6, height: 6, borderRadius: 999, background: n === i ? C.p600 : "rgba(255,255,255,0.4)", transition: "width .2s" }} />
            ))}
          </div>
          <div style={{ minWidth: 56, textAlign: "right", fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
            {last ? "Tap to finish" : "Tap to go on"}
          </div>
        </div>
      </div>

      {/* Skip pill, top-right (rendered last so it stays above the panel) */}
      <button onClick={skip} aria-label="Skip tour" style={{ position: "absolute", top: 16, right: 16, display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 999, border: "none", background: "#fff", color: C.head, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}>
        Skip <XIcon size={14} color={C.head} />
      </button>
    </div>
  );
}
