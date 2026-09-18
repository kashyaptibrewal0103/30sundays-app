import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, CloudSun, CloudDrizzle, CloudRain, Info } from "lucide-react";
import { C } from "../data";
import { monthRating, MONTHS } from "../data/buildData";
import { monthWeather } from "../data/weatherData";

// ─── Weather on the travel dates step ───
//
// Today the month strip says peak, shoulder or off season and nothing else, so
// "is October any good" is a question the screen cannot answer. The climate
// averages are already in the app; they are just not on this screen.
//
// Four ways to put them there, on a mock of the dates step. Same data in all
// four: average low, average high, and what the sky mostly does that month.

const DEST = "Vietnam";
const YEAR = 2026;

const OPTIONS = [
  { key: "A", name: "Inside the month chip", note: "Everything on one line of chips. Nothing new on the screen, but the chips grow and the strip gets busy." },
  { key: "B", name: "Month grid", note: "All twelve months at once, closest to the reference. Costs four rows of vertical space before the calendar." },
  { key: "C", name: "Bar under the strip", note: "Chips stay lean; the open month gets a proper weather line with rainfall too." },
  { key: "D", name: "In the trip summary", note: "Weather for the dates actually chosen, next to the nights. Quiet, but only answers after the choice." },
];

const SEASON_LABEL = { peak: "Peak season", shoulder: "Shoulder", off: "Off-season" };
const SEASON_COLOR = { peak: C.sText, shoulder: C.wText, off: C.dText };

const SKY = {
  sunny:   { Icon: Sun,          word: "Mostly sunny",  color: "#F5B301" },
  cloudy:  { Icon: CloudSun,     word: "Some showers",  color: "#8A94A6" },
  rainy: { Icon: CloudDrizzle, word: "Showers",       color: "#5B8DEF" },
  heavy:    { Icon: CloudRain,    word: "Wet",           color: "#3B6FD4" },
};

const Temps = ({ w, size = 11.5, color = C.sub }) => (
  <span style={{ fontSize: size, fontWeight: 600, color, whiteSpace: "nowrap" }}>
    {w.low}° / {w.high}°
  </span>
);

export default function WeatherOptionsLab() {
  const navigate = useNavigate();
  const [opt, setOpt] = useState("A");
  const [month, setMonth] = useState(9); // October, as in the reference
  const current = OPTIONS.find((o) => o.key === opt);
  const w = monthWeather(DEST, month);

  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Lab controls */}
      <div style={{ flexShrink: 0, background: "#FBFAF9", borderBottom: `1px solid ${C.div}`, padding: "12px 14px 11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={19} color={C.head} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>Weather on the dates step</p>
            <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Four ways to show it, {DEST}</p>
          </div>
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              data-testid={`wx-opt-${o.key}`}
              onClick={() => setOpt(o.key)}
              style={{
                flexShrink: 0, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                border: `1px solid ${opt === o.key ? C.p600 : C.div}`,
                background: opt === o.key ? C.p600 : C.white,
                color: opt === o.key ? "#fff" : C.sub,
              }}
            >
              {o.key}. {o.name}
            </button>
          ))}
        </div>
        <p style={{ margin: "9px 2px 0", fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>{current.note}</p>
      </div>

      {/* ── The dates step, mocked ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 20px" }} className="hide-scrollbar">
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.head, margin: 0, letterSpacing: "-0.4px" }}>When & how long?</h1>
        <p style={{ fontSize: 13, color: C.sub, margin: "6px 0 0" }}>Just a starting point, you can always change this later.</p>

        {opt === "B"
          ? <MonthGrid month={month} setMonth={setMonth} />
          : <MonthStrip month={month} setMonth={setMonth} withWeather={opt === "A"} />}

        {opt === "C" && <WeatherBar month={month} w={w} />}

        <DayGrid month={month} />
        <Summary month={month} w={w} showWeather={opt === "D"} />
      </div>
    </div>
  );
}

// ════════════════ A and C, D: the strip ════════════════
function MonthStrip({ month, setMonth, withWeather }) {
  return (
    <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px -16px 0", padding: "0 16px 4px" }}>
      {Array.from({ length: 10 }, (_, i) => (new Date().getMonth() + i) % 12).map((m) => {
        const r = monthRating(DEST, m);
        const on = month === m;
        const w = monthWeather(DEST, m);
        const { Icon, color } = SKY[w.sky];
        return (
          <button key={m} data-testid={`wx-month-${m}`} onClick={() => setMonth(m)} style={{
            flexShrink: 0, padding: withWeather ? "9px 14px 10px" : "8px 16px", borderRadius: 12,
            cursor: "pointer", textAlign: "center", fontFamily: "inherit",
            border: on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white,
          }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: on ? C.p600 : C.head }}>{MONTHS[m]}</span>
            <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, color: SEASON_COLOR[r], marginTop: 2 }}>{SEASON_LABEL[r]}</span>
            {withWeather && (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 6 }}>
                <Icon size={13} color={color} />
                <Temps w={w} size={11} color={on ? C.head : C.sub} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ════════════════ B: the grid ════════════════
function MonthGrid({ month, setMonth }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginTop: 16 }}>
      {Array.from({ length: 12 }, (_, i) => (new Date().getMonth() + i) % 12).map((m) => {
        const r = monthRating(DEST, m);
        const on = month === m;
        const w = monthWeather(DEST, m);
        const { Icon, color } = SKY[w.sky];
        return (
          <button key={m} data-testid={`wx-month-${m}`} onClick={() => setMonth(m)} style={{
            padding: "11px 6px 10px", borderRadius: 14, cursor: "pointer", textAlign: "center", fontFamily: "inherit",
            border: on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white,
          }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: on ? C.p600 : C.head }}>{MONTHS[m]}</span>
            <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, color: SEASON_COLOR[r], marginTop: 3 }}>{SEASON_LABEL[r]}</span>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 8 }}>
              <Icon size={14} color={color} />
              <Temps w={w} size={11} color={on ? C.head : C.sub} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ════════════════ C: the bar ════════════════
function WeatherBar({ month, w }) {
  const { Icon, word, color } = SKY[w.sky];
  return (
    <div data-testid="wx-bar" style={{
      display: "flex", alignItems: "center", gap: 11, marginTop: 14,
      padding: "12px 14px", borderRadius: 14, background: C.bg, border: `1px solid ${C.div}`,
    }}>
      <span style={{ width: 36, height: 36, borderRadius: 11, background: C.white, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={19} color={color} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>
          {MONTHS[month]} in {DEST} · {w.low}° to {w.high}°
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: C.sub }}>
          {word} · about {w.rain}mm of rain that month
        </p>
      </div>
    </div>
  );
}

// ════════════════ Shared mock furniture ════════════════
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function DayGrid({ month }) {
  const first = new Date(YEAR, month, 1).getDay();
  const n = DAYS_IN_MONTH[month];
  return (
    <>
      <p style={{ margin: "18px 0 8px", fontSize: 13, fontWeight: 700, color: C.head }}>Pick your start date</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.inact }}>{d}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: n }, (_, i) => i + 1).map((day) => {
          const cap = day === 9 || day === 16;
          const inRange = day > 9 && day < 16;
          return (
            <div key={day} style={{
              aspectRatio: "1", borderRadius: 10, display: "grid", placeItems: "center",
              background: cap ? C.p600 : inRange ? C.p100 : C.bg,
              color: cap ? "#fff" : inRange ? C.p600 : C.head,
              fontSize: 13, fontWeight: cap ? 800 : inRange ? 700 : 600,
            }}>{day}</div>
          );
        })}
      </div>
    </>
  );
}

function Summary({ month, w, showWeather }) {
  const { Icon, word, color } = SKY[w.sky];
  return (
    <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 14, background: C.bg, border: `1px solid ${C.div}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>9 {MONTHS[month]} – 16 {MONTHS[month]}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.p600 }}>7 nights</span>
      </div>
      {showWeather ? (
        <div data-testid="wx-summary" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.div}` }}>
          <Icon size={15} color={color} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: C.sub }}>
            <b style={{ fontWeight: 700, color: C.head }}>{w.low}° to {w.high}°</b> in {DEST} then. {word}.
          </span>
        </div>
      ) : (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: C.sub, display: "flex", gap: 6, alignItems: "flex-start" }}>
          <Info size={13} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />
          We recommend at least 6 nights for {DEST}.
        </p>
      )}
    </div>
  );
}
