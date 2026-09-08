import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, LifeBuoy, Trash2 } from "lucide-react";
import { C } from "../data";
import { BRAND, BRAND_SUB, FONT } from "../data/brand";
import RatingSheet from "../components/RatingSheet";

// ─── App rating flow, for review ───
// Both entry points and both branches, with the event stream printed as it
// fires so the flow and its tracking can be checked in one place.

const OLD = [
  "Rate 1 to 5 in a sheet",
  "1 to 3: pick one reason, next sheet, write something, submit",
  "4 to 5: write something, submit",
  "4 to 5: a separate store sheet appears",
];
const NEW = [
  "Rate 1 to 5 in a sheet",
  "1 to 3: reasons and an optional note, one screen, send",
  "4 to 5: straight to the store ask, no typing",
  "The score stays on screen and stays changeable",
];

export default function RatingLab() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);   // "home" | "support"
  const [log, setLog] = useState([]);

  const push = (name, props) =>
    setLog((l) => [{ name, props, at: new Date().toLocaleTimeString("en-IN", { hour12: false }) }, ...l]);

  const launch = (label, Icon, source) => (
    <button
      data-testid={`launch-${source}`}
      onClick={() => setOpen(source)}
      style={{
        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "13px 10px", borderRadius: 12, border: `1.5px solid ${BRAND.sunsetFuchsia}33`,
        background: "#fff", cursor: "pointer", fontFamily: "inherit",
        fontSize: 13.5, fontWeight: 600, color: BRAND.sunsetFuchsia,
      }}
    >
      <Icon size={15} color={BRAND.sunsetFuchsia} />
      {label}
    </button>
  );

  const col = (title, items, tone) => (
    <div style={{ flex: 1, minWidth: 0, background: "#fff", border: "1px solid #EDE9E6", borderRadius: 12, padding: "13px 14px 15px" }}>
      <p style={{
        margin: "0 0 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5,
        textTransform: "uppercase", color: tone,
      }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <span style={{ flexShrink: 0, width: 5, height: 5, borderRadius: "50%", background: tone, marginTop: 7 }} />
            <span style={{ fontSize: 12.5, color: BRAND_SUB, lineHeight: "18px" }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: "#FBFAF9", position: "relative", fontFamily: FONT.primary }}>
      <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 10, background: "#fff", borderBottom: "1px solid #EDE9E6" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={20} color={BRAND.tropicalForest} />
        </button>
        <div>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: BRAND.tropicalForest }}>App rating flow</p>
          <p style={{ margin: 0, fontSize: 11.5, color: BRAND_SUB }}>Both entry points, both branches</p>
        </div>
      </div>

      <div style={{ padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {launch("Third home visit", Home, "home")}
          {launch("Support", LifeBuoy, "support")}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {col("Was", OLD, "#A2564E")}
          {col("Now", NEW, BRAND.lagoonBliss)}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: BRAND.tropicalForest }}>
              Events {log.length > 0 && <span style={{ color: BRAND_SUB, fontWeight: 500 }}>· {log.length}</span>}
            </p>
            {log.length > 0 && (
              <button onClick={() => setLog([])} style={{
                display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none",
                padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, color: BRAND_SUB,
              }}>
                <Trash2 size={13} color={BRAND_SUB} /> Clear
              </button>
            )}
          </div>
          {log.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12.5, color: "#9AACAA", lineHeight: "18px" }}>
              Open the sheet above. Every event appears here as it fires, newest first.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {log.map((e, i) => (
                <div key={i} data-testid="event-row" style={{ background: "#fff", border: "1px solid #EDE9E6", borderRadius: 10, padding: "9px 11px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, fontWeight: 700, color: BRAND.sunsetFuchsia }}>{e.name}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: "#A6B6B4" }}>{e.at}</span>
                  </div>
                  <p style={{ margin: "3px 0 0", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11.5, color: BRAND_SUB, wordBreak: "break-word" }}>
                    {JSON.stringify(e.props)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && <RatingSheet source={open} onEvent={push} onClose={() => setOpen(null)} />}
    </div>
  );
}
