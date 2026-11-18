import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { C } from "../data";
import { recommendedRoute } from "../data/buildData";
import ActivityPicker from "../components/wizard/ActivityPicker";

// ─── The activities step, on its own ───
//
// The real picker on the real Vietnam route, without walking the four steps
// before it. The wizard itself renders the same component.

const DEST = "Vietnam";

export default function ActivityPickLab() {
  const navigate = useNavigate();
  const route = useMemo(() => recommendedRoute(DEST, 8), []);
  const [picks, setPicks] = useState(() => new Set());

  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, background: "#FBFAF9", borderBottom: `1px solid ${C.div}`, padding: "12px 14px 11px", display: "flex", alignItems: "center", gap: 9 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={19} color={C.head} />
        </button>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>Activities step</p>
          <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Vietnam, 8 nights. Tap a card for details.</p>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ padding: "18px 16px 32px" }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.head, letterSpacing: "-0.5px" }}>Select activities</h1>
          <p style={{ margin: "7px 0 0", fontSize: 13, color: C.sub, lineHeight: 1.4 }}>Choose what you’d love to do. We’ll plan your days around it.</p>
          <ActivityPicker dest={DEST} route={route} vibes={[]} picks={picks} setPicks={setPicks} />
        </div>
      </div>
    </div>
  );
}
