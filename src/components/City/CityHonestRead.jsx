import { memo } from "react";
import { Check, X } from "lucide-react";
import { CitySection, cardStyle } from "./CityBits";

// Why go and why skip, side by side and the same size. Why skip is not an
// afterthought and is never shorter than why go.
function Col({ t, title, lines, good }) {
  const tint = good ? t.band.good : t.band.avoid;
  return (
    <div style={{ ...cardStyle(t), padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: tint.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {good ? <Check size={12} color={tint.fg} strokeWidth={3} /> : <X size={12} color={tint.fg} strokeWidth={3} />}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.head }}>{title}</span>
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 14px", fontSize: 13, lineHeight: "19px", color: t.body, display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    </div>
  );
}

function CityHonestRead({ t, whyGo, whySkip }) {
  if (!whyGo || !whySkip) return null;
  return (
    <CitySection t={t} title="The honest read">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <Col t={t} title="Why go" lines={whyGo} good />
        <Col t={t} title="Why skip" lines={whySkip} />
      </div>
    </CitySection>
  );
}

export default memo(CityHonestRead);
