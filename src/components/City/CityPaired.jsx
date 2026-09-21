import { memo } from "react";
import { CitySection, PAD } from "./CityBits";

// Where people go next, and how long it takes to get there. The travel time is
// the only real information here, so a city without one is not shown as if it
// had one.
function CityPaired({ t, items, onOpen }) {
  if (!items.length) return null;
  return (
    <CitySection t={t} title="Often paired with" sub="Travel time from here" inset={false}>
      <div className="hs hide-scrollbar" style={{ display: "flex", gap: 10, padding: `0 ${PAD}px`, overflowX: "auto" }}>
        {items.map((p) => (
          <div key={p.city} onClick={() => onOpen(p.city)} style={{ width: 150, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}>
            <div style={{ height: 110, borderRadius: 14, overflow: "hidden", background: t.well }}>
              {p.img && <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.head }}>{p.city}</div>
              <div style={{ fontSize: 12, color: t.muted, fontWeight: 500 }}>
                {[p.travel, p.nights ? `${p.nights} nights` : null].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CitySection>
  );
}

export default memo(CityPaired);
