import { Sun, CloudSun, CloudDrizzle, CloudRain } from "lucide-react";
import { C } from "../data";
import { monthWeather } from "../data/weatherData";

// ─── What a month actually feels like ───
//
// The strip used to say peak, shoulder or off season and nothing else, which
// tells a traveller how busy a month is and nothing about whether they will be
// warm or wet in it. The climate averages were already in the app; this puts
// them on the chip where the month is chosen.
//
// Indicative averages, not a forecast.

const SKY = {
  sunny:   { Icon: Sun,          color: "#F5B301" },
  partly:  { Icon: CloudSun,     color: "#8A94A6" },
  showers: { Icon: CloudDrizzle, color: "#5B8DEF" },
  rain:    { Icon: CloudRain,    color: "#3B6FD4" },
};

export default function MonthWeather({ dest, monthIdx, on }) {
  const w = monthWeather(dest, monthIdx);
  if (!w) return null;
  const { Icon, color } = SKY[w.sky] || SKY.partly;
  return (
    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6 }}>
      <Icon size={13} color={color} />
      <span style={{ fontSize: 11, fontWeight: 600, color: on ? C.head : C.sub, whiteSpace: "nowrap" }}>
        {w.low}° / {w.high}°
      </span>
    </span>
  );
}
