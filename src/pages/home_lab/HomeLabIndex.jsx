import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { C } from "../../data";
import { VARIANTS } from "../../data/homeLabData";
import { DISPLAY, NAVY, PAD, W } from "./labShared";

// One place to reach everything: the five homes, the component labs, and the
// three states a traveller can arrive in.

const LABS = [
  { to: "/home-lab/states", t: "Every state", s: "No plan, one plan, several. Each home, each state." },
  { to: "/home-lab/cards", t: "Ten ways to show six", s: "The country grid, ten shapes." },
  { to: "/home-lab/cta", t: "Five ways to ask", s: "Plan my trip, five shapes." },
  { to: "/home-lab/plans", t: "Ten ways back in", s: "The existing plan block, ten shapes." },
];

function Group({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 800, color: C.p600, letterSpacing: "0.4px" }}>{title}</p>
      <div style={{ background: W.card, borderRadius: 16, border: `1px solid ${W.line}`, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function Row({ to, badge, t, s, first }) {
  return (
    <Link to={to} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", padding: "13px 14px", borderTop: first ? "none" : `1px solid ${W.line}` }}>
      {badge != null && <span style={{ width: 24, height: 24, borderRadius: 8, background: C.p100, color: C.p600, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{badge}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY, letterSpacing: "-0.2px" }}>{t}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{s}</p>
      </div>
      <ChevronRight size={17} color={C.icon} style={{ flexShrink: 0 }} />
    </Link>
  );
}

export default function HomeLabIndex() {
  return (
    <div data-lab-scroll className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.page, padding: `18px ${PAD}px 90px` }}>
      <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 38, fontWeight: 700, color: NAVY, lineHeight: 1.02 }}>Home page lab</h1>
      <p style={{ margin: "6px 0 22px", fontSize: 13, color: C.sub, lineHeight: "18px" }}>
        Everything above Sunday School, rebuilt. Below it, each one is the live page.
      </p>

      <Group title="Home designs">
        {VARIANTS.map((v, n) => <Row key={v.n} to={`/home-lab/${v.n}`} badge={v.n} t={v.title} s={v.desc} first={n === 0} />)}
      </Group>

      <Group title="Pieces and states">
        {LABS.map((l, n) => <Row key={l.to} to={l.to} t={l.t} s={l.s} first={n === 0} />)}
      </Group>

      <Group title="For comparison">
        <Row to="/" t="Live home today" s="What we are replacing." first />
      </Group>
    </div>
  );
}
