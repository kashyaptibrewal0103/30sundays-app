import { memo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { CitySection, cardStyle } from "./CityBits";

// The whole year in one row, twelve equal columns. At 390px a three-letter
// month plus a word underneath does not fit, so each cell is a dot and a single
// letter, and the detail for the month you tap opens inside the same card
// rather than in a sheet. Nothing leaves the screen to read one month.
//
// The selected month lives here, so tapping never re-renders the page.

function CityWhenToGo({ t, city, months, thirdLabel, tripMonths, tripLine, initial }) {
  const [sel, setSel] = useState(initial);
  if (!months) return null;

  const s = months[sel];
  const band = t.band[s.band];

  return (
    <CitySection t={t} title="When to go" note="Climate averages, not a forecast">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tripLine && (
          <div style={{ ...cardStyle(t), borderRadius: 12, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
            <CalendarDays size={18} color={t.head} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, lineHeight: "18px", color: t.body }}>{tripLine}</span>
          </div>
        )}

        <div style={{ ...cardStyle(t), padding: "12px 8px 8px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 2 }}>
            {months.map((m) => {
              const on = m.idx === sel;
              const inTrip = tripMonths?.has(m.idx);
              return (
                <button
                  key={m.idx} type="button" onClick={() => setSel(m.idx)}
                  aria-label={`${m.name} in ${city}`} aria-pressed={on}
                  style={{
                    height: 52, borderRadius: 10, padding: 0, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                    color: t.head,
                    background: on ? t.card : inTrip ? t.accentBg : "transparent",
                    border: on ? `2px solid ${t.head}` : "2px solid transparent",
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: t.band[m.band].dot, display: "block" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, lineHeight: "14px", display: "block" }}>{m.short}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 8px 6px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.2px", color: t.head }}>{s.name} in {city}</div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: band.bg, color: band.fg, flexShrink: 0 }}>{band.label}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: "21px", color: t.body }}>{s.line}</div>
            <div style={{ display: "flex", gap: 8, fontSize: 12, fontWeight: 600, color: t.muted, flexWrap: "wrap" }}>
              <span>{s.temp}</span><span>·</span>
              <span>{s.rain}</span><span>·</span>
              <span>{thirdLabel} {s.third}</span>
            </div>
          </div>
        </div>
      </div>
    </CitySection>
  );
}

export default memo(CityWhenToGo);
