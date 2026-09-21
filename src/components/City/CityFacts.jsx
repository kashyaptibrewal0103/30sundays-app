import { memo } from "react";
import { Sun } from "lucide-react";
import { PAD } from "./CityBits";

// Facts, not controls. Nothing here is tappable, so nothing here is styled to
// look tappable: no shadow, no chevron, no pointer. The first one is tinted
// because when to come is the fact that decides the rest.
function CityFacts({ t, facts }) {
  if (!facts.length) return null;
  return (
    <div className="hs hide-scrollbar" style={{ display: "flex", gap: 8, padding: `0 ${PAD}px`, overflowX: "auto" }}>
      {facts.map((f, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px",
          borderRadius: 18, whiteSpace: "nowrap", flexShrink: 0,
          fontSize: 13, fontWeight: 600, color: t.head, cursor: "default",
          background: f.accent ? t.accentBg : t.card,
          border: f.accent ? "1px solid transparent" : `1px solid ${t.line}`,
        }}>
          {f.accent && <Sun size={14} color={t.head} />}
          <span>{f.text}</span>
        </div>
      ))}
    </div>
  );
}

export default memo(CityFacts);
