import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, LINE_MODES, LabPage, LabVideo, NAVY, PAD, RotatingLine, W, promiseAt, useRotate } from "./labShared";
import { C } from "../../data";

// Six ways the hero line can change, one under the other, all changing on the
// same beat so they can be compared. None of them overlap the two lines.

const ORDER = ["slide", "dissolve", "lift", "wipe", "words", "blur"];
const H = 208;

function Band({ mode, i, clip }) {
  const m = LINE_MODES[mode];
  return (
    <div style={{ margin: `0 ${PAD}px 14px` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{m.label}</span>
        <span style={{ fontSize: 12, color: C.sub }}>{m.note}</span>
      </div>
      <div style={{ position: "relative", height: H, borderRadius: 18, overflow: "hidden" }}>
        <LabVideo src={clip.video} poster={clip.hero} style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(30,16,10,0.34) 0%, rgba(30,16,10,0.1) 45%, rgba(30,16,10,0.5) 100%)" }} />
        </LabVideo>
        <RotatingLine mode={mode} text={promiseAt(i)} height={72}
          boxStyle={{ left: 16, right: 16, bottom: 22 }}
          style={{ textAlign: "center", fontFamily: DISPLAY, fontSize: 27, fontWeight: 700, lineHeight: "30px", color: "#fff", textShadow: "0 2px 18px rgba(0,0,0,0.55)" }} />
      </div>
    </div>
  );
}

export default function LinesLab() {
  const i = useRotate(LAB_SIX.length, 4200);
  return (
    <LabPage lower={false}>
      <div style={{ padding: `18px ${PAD}px 12px` }}>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: NAVY, lineHeight: 1 }}>Line changes</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.sub }}>Six ways. They all change together, so you can compare.</p>
      </div>
      {ORDER.map((mode, n) => <Band key={mode} mode={mode} i={i} clip={LAB_SIX[(i + n) % LAB_SIX.length]} />)}
      <div style={{ height: 40 }} />
    </LabPage>
  );
}
