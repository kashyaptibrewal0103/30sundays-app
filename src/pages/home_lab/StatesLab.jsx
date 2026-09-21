import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { C } from "../../data";
import { VARIANTS } from "../../data/homeLabData";
import { DISPLAY, NAVY, PAD, W } from "./labShared";

// Every home, in each of the three states a traveller can be in. The state is
// forced by the link, so nothing has to be set up before looking.

const STATES = [
  { q: 0, t: "No plan yet", s: "Plan my trip, and nothing else." },
  { q: 1, t: "One plan", s: "The plan card on its own. No deck behind it, no View all plans." },
  { q: 3, t: "Multiple plans", s: "Two edges peeking behind, and View all plans under it." },
];

export default function StatesLab() {
  return (
    <div data-lab-scroll className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.page, padding: `18px ${PAD}px 90px` }}>
      <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.02 }}>Every state</h1>
      <p style={{ margin: "6px 0 22px", fontSize: 13, color: C.sub, lineHeight: "18px" }}>
        The same five homes, seen by someone with no plan, one plan, or several.
      </p>

      {STATES.map((st) => (
        <div key={st.q} style={{ marginBottom: 26 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>{st.t}</p>
          <p style={{ margin: "3px 0 10px", fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{st.s}</p>
          <div style={{ background: W.card, borderRadius: 16, border: `1px solid ${W.line}`, overflow: "hidden" }}>
            {VARIANTS.map((v, n) => (
              <Link key={v.n} to={`/home-lab/${v.n}?plans=${st.q}`}
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", padding: "12px 14px", borderTop: n ? `1px solid ${W.line}` : "none" }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: C.p100, color: C.p600, display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0 }}>{v.n}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: NAVY }}>{v.title}</span>
                <ChevronRight size={16} color={C.icon} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
