import { C } from "../data";
import { MONTHS } from "../data/buildData";
import { monthWeather } from "../data/weatherData";
import { SKY_STYLE } from "./skyStyle";

// ─── Weather by month, on the destination page ───
//
// What stood here was a chart: a rainfall bar per month in millimetres, one
// daytime high above it, and a legend explaining both scales. A traveller
// reading it only wanted to know whether March is warm and whether it rains.
//
// So each month says three things and stops: how warm at night, how warm by
// day, and what the sky mostly does. The same chip as the dates step of the
// wizard, with the word spelled out because this page is read rather than
// tapped through.

export default function MonthWeatherStrip({ dest, pad = 16 }) {
  const now = new Date().getMonth();
  if (!monthWeather(dest, 0)) return null;

  return (
    <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", margin: `0 -${pad}px`, padding: `0 ${pad}px 4px` }}>
      {MONTHS.map((m, i) => {
        const w = monthWeather(dest, i);
        const { Icon, color } = SKY_STYLE[w.sky] || SKY_STYLE.cloudy;
        const isNow = i === now;
        return (
          <div key={m} data-testid={`wx-strip-${i}`} style={{
            flexShrink: 0, minWidth: 82, padding: "10px 12px 11px", borderRadius: 13, textAlign: "center",
            border: `1px solid ${isNow ? C.p300 : C.div}`,
            background: isNow ? `${C.p100}88` : C.white,
          }}>
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: isNow ? C.p600 : C.head }}>{m}</span>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, margin: "7px 0 5px" }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: 11, fontWeight: 600, color: C.sub, whiteSpace: "nowrap" }}>{w.word}</span>
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.head, whiteSpace: "nowrap" }}>
              {w.low}° / {w.high}°
            </span>
          </div>
        );
      })}
    </div>
  );
}
