import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, FileCheck, Clock } from "lucide-react";
import { C } from "../data";
import { MONTHS } from "../data/buildData";
import { monthWeather } from "../data/weatherData";
import MonthWeatherStrip from "../components/MonthWeatherStrip";
import { SKY_STYLE } from "../components/skyStyle";

// ─── Weather on the destination page ───
//
// What is there today is a chart: a rainfall bar per month in millimetres, a
// single daytime high above it, and a legend explaining both. Two scales, one
// picture, and a traveller who only wanted to know whether March is warm and
// dry.
//
// Three simpler ways, all saying the same two things per month: how warm, and
// what the sky does. No millimetres. Same treatment as the dates step of the
// wizard, so a month reads the same way in both places.

const DESTS = ["Bali", "Vietnam", "Thailand", "Sri Lanka"];

const OPTIONS = [
  { key: "A", name: "Month grid", note: "All twelve at once, nothing to swipe. Four rows of the page." },
  { key: "B", name: "Month strip", note: "The same chip as the dates step in the wizard. One row, swipe for the rest." },
  { key: "C", name: "Two columns", note: "Six rows, two months each. Reads as a table without being one." },
];

const PAD = 16;
const NOW = new Date().getMonth();

export default function DestWeatherLab() {
  const navigate = useNavigate();
  const [opt, setOpt] = useState("A");
  const [dest, setDest] = useState("Bali");
  const current = OPTIONS.find((o) => o.key === opt);

  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Lab controls */}
      <div style={{ flexShrink: 0, background: "#FBFAF9", borderBottom: `1px solid ${C.div}`, padding: "12px 14px 11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={19} color={C.head} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>Weather on the destination page</p>
            <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Three simpler ways, between Key facts and the trips</p>
          </div>
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 7 }}>
          {OPTIONS.map((o) => (
            <button key={o.key} data-testid={`dw-opt-${o.key}`} onClick={() => setOpt(o.key)} style={{
              flexShrink: 0, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              border: `1px solid ${opt === o.key ? C.p600 : C.div}`,
              background: opt === o.key ? C.p600 : C.white,
              color: opt === o.key ? "#fff" : C.sub,
            }}>{o.key}. {o.name}</button>
          ))}
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {DESTS.map((d) => (
            <button key={d} data-testid={`dw-dest-${d}`} onClick={() => setDest(d)} style={{
              flexShrink: 0, padding: "5px 11px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
              fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap",
              border: `1px solid ${dest === d ? C.head : C.div}`,
              background: dest === d ? C.head : C.white,
              color: dest === d ? "#fff" : C.sub,
            }}>{d}</button>
          ))}
        </div>
        <p style={{ margin: "9px 2px 0", fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>{current.note}</p>
      </div>

      {/* ── The destination page, mocked around the section ── */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }} className="hide-scrollbar">
        <KeyFacts dest={dest} />

        <div style={{ margin: `28px ${PAD}px 0` }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Weather in {dest}</span>
          <p style={{ fontSize: 12, color: C.sub, marginTop: 2, marginBottom: 14 }}>
            Typical temperature each month
          </p>
          {opt === "A" && <Grid dest={dest} />}
          {opt === "B" && <div data-testid="dw-b"><MonthWeatherStrip dest={dest} pad={PAD} /></div>}
          {opt === "C" && <TwoColumns dest={dest} />}
          <p style={{ fontSize: 11.5, color: C.inact, margin: "10px 2px 0" }}>
            Average low and high. Indicative, not a forecast.
          </p>
        </div>

        <ReadyMade dest={dest} />
      </div>
    </div>
  );
}

// ════════════════ A. Month grid ════════════════
function Grid({ dest }) {
  return (
    <div data-testid="dw-a" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      {MONTHS.map((m, i) => {
        const w = monthWeather(dest, i);
        const { Icon, color } = SKY_STYLE[w.sky];
        const now = i === NOW;
        return (
          <div key={m} style={{
            padding: "10px 4px 11px", borderRadius: 13, textAlign: "center",
            border: `1px solid ${now ? C.p300 : C.div}`, background: now ? C.p100 + "88" : C.white,
          }}>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: now ? C.p600 : C.head }}>{m}</span>
            <Icon size={17} color={color} style={{ margin: "7px auto 6px", display: "block" }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, whiteSpace: "nowrap" }}>{w.low}° / {w.high}°</span>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════ C. Two columns ════════════════
function TwoColumns({ dest }) {
  const rows = [0, 1, 2, 3, 4, 5].map((r) => [r, r + 6]);
  return (
    <div data-testid="dw-c" style={{ border: `1px solid ${C.div}`, borderRadius: 13, overflow: "hidden" }}>
      {rows.map(([a, b], idx) => (
        <div key={a} style={{ display: "flex", borderTop: idx ? `1px solid ${C.div}` : "none" }}>
          {[a, b].map((i, half) => {
            const w = monthWeather(dest, i);
            const { Icon, color } = SKY_STYLE[w.sky];
            const word = w.word;
            const now = i === NOW;
            return (
              <div key={i} style={{
                flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderLeft: half ? `1px solid ${C.div}` : "none",
                background: now ? C.p100 + "66" : "transparent",
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: now ? C.p600 : C.head, width: 26, flexShrink: 0 }}>{MONTHS[i]}</span>
                <Icon size={15} color={color} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, whiteSpace: "nowrap", marginLeft: "auto" }}>
                  {w.low}° / {w.high}°
                </span>
                <span style={{ display: "none" }}>{word}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ════════════════ Mock furniture ════════════════
function KeyFacts({ dest }) {
  const facts = [
    { icon: FileCheck, label: "Visa", value: dest === "Thailand" ? "Visa-free for Indians" : "Visa on arrival", color: C.p600 },
    { icon: Sun, label: "Best months to visit", value: "April to October", color: "#1570EF" },
    { icon: Clock, label: "Ideal duration", value: "6 to 8 nights", color: "#6938EF" },
  ];
  return (
    <div style={{ margin: `18px ${PAD}px 0` }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Key facts</span>
      <div style={{ marginTop: 12, border: `1px solid ${C.div}`, borderRadius: 13, overflow: "hidden" }}>
        {facts.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderTop: i ? `1px solid ${C.div}` : "none" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: `${f.color}14`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon size={15} color={f.color} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11.5, color: C.sub }}>{f.label}</p>
                <p style={{ margin: "1px 0 0", fontSize: 13.5, fontWeight: 600, color: C.head }}>{f.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReadyMade({ dest }) {
  return (
    <div style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: `0 ${PAD}px 12px` }}>Ready-made {dest} trips</h2>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 12, overflowX: "auto", padding: `0 ${PAD}px` }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ flexShrink: 0, width: 190, borderRadius: 14, border: `1px solid ${C.div}`, overflow: "hidden" }}>
            <div style={{ height: 96, background: C.div }} />
            <div style={{ padding: "10px 12px 12px" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.head }}>{7 + i} nights in {dest}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.sub }}>From ₹{(1.4 + i * 0.3).toFixed(2)} lakh</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
