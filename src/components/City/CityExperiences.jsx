import { memo } from "react";
import { formatINR } from "../../data/buildData";
import { CitySection, cardStyle, PAD } from "./CityBits";

// The same activity pool the builder hand-picks from, narrowed to this city.
// The row scrolls natively and holds no state, so it costs nothing to move.
function CityExperiences({ t, items, onOpen }) {
  if (!items.length) return null;
  return (
    <CitySection t={t} title="Hand-picked experiences" inset={false}>
      <div className="hs hide-scrollbar" style={{ display: "flex", gap: 12, padding: `0 ${PAD}px`, overflowX: "auto" }}>
        {items.map((e) => (
          <div key={e.id} onClick={() => onOpen?.(e)} style={{ ...cardStyle(t), width: 216, flexShrink: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: onOpen ? "pointer" : "default" }}>
            <div style={{ height: 160, position: "relative", background: t.well }}>
              {e.img && <img src={e.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
              <span style={{ position: "absolute", left: 10, bottom: 10, fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 999, background: "rgba(24,29,39,0.7)", color: "#fff" }}>{e.duration}</span>
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: "20px", color: t.head }}>{e.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, color: t.head }}>
                From ₹{formatINR(e.price)} <span style={{ fontWeight: 500, color: t.muted }}>per person</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CitySection>
  );
}

export default memo(CityExperiences);
