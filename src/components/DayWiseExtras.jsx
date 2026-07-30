import { Car, Bus, Plane, ArrowRight, Sun, RefreshCw } from "lucide-react";
import { C } from "../data";

// A van/shuttle gets a bus glyph, everything else a car.
function vehicleIcon(v) {
  return /van|bus|coach|shuttle|tempo/i.test(v || "") ? Bus : Car;
}
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function SharingChip({ sharing }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: "#1570EF", background: "#EAF2FE", border: "1px solid #BBD6F8", padding: "3px 9px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" }}>
      {sharing}
    </span>
  );
}

// ─── Arranged transfers (airport↔hotel, hotel↔hotel) ───
// The "Transfers included" heading already conveys inclusion, so cards stay
// clean: vehicle, route, and a Private/Shared tag.
export function TransferSection({ transfers, heading = "Transfers included" }) {
  if (!transfers?.length) return null;
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <h4 style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: "0 0 12px", lineHeight: "22px" }}>{heading}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {transfers.map((t, i) => {
          const V = vehicleIcon(t.vehicle);
          const meta = [t.mode, t.vehicle && cap(t.vehicle), t.duration].filter(Boolean).join(" · ");
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${C.div}`, background: C.white }}>
              <div style={{ width: 54, height: 46, borderRadius: 10, background: "#FFE6ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <V size={28} color="#FD014F" strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: C.head, lineHeight: "20px" }}>
                  <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.from}</span>
                  <ArrowRight size={14} color={C.sub} style={{ flexShrink: 0 }} />
                  <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.to}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {t.sharing && <SharingChip sharing={t.sharing} />}
                  {meta && <span style={{ fontSize: 12.5, color: C.sub }}>{meta}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Thin "rest of the day is leisure" strip (transfer + leisure days) ───
export function LeisureStrip({ note }) {
  return (
    <div style={{ margin: "16px 16px 0", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(135deg, #FFF0F4 0%, #FEF6E9 100%)", border: "1px solid #F8D8E1" }}>
      <Sun size={18} color="#FD014F" strokeWidth={1.9} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 500, color: C.head, lineHeight: "18px" }}>
        {note || "Rest of the day is leisure - relax, take it easy and explore at your own pace."}
      </span>
    </div>
  );
}

// ─── Compact "this day is leisure" card (full leisure days) ───
// Icon + title on one row, a one-line note, and an optional change-plan action.
export function LeisureCard({ hasTransfer, onChangePlan, ctaLabel = "Change day plan" }) {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ borderRadius: 14, padding: "16px 18px", background: "linear-gradient(135deg, #FFF0F4 0%, #FEF6E9 100%)", border: "1px solid #F8D8E1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(227,27,83,0.12)" }}>
            <Sun size={22} color="#FD014F" strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0, lineHeight: "22px" }}>{hasTransfer ? "Rest of the day is yours" : "This day is leisure"}</h4>
            <p style={{ fontSize: 12.5, color: "#535862", margin: "2px 0 0", lineHeight: "17px" }}>
              Nothing's planned{hasTransfer ? " after your transfer" : ""}, relax at your own pace. Ideas below, nothing pre-booked.
            </p>
          </div>
        </div>
        {onChangePlan && (
          <button
            onClick={onChangePlan}
            style={{ marginTop: 14, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${C.p600}`, background: C.white, color: C.p600, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            <RefreshCw size={15} color={C.p600} /> {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Optional, clearly-unbooked recommendations for a leisure day ───
export function ExploreIdeas({ ideas, title = "Recommended places to explore" }) {
  if (!ideas?.length) return null;
  return (
    <div style={{ padding: "24px 16px 0" }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, color: C.head, margin: "0 0 2px", lineHeight: "22px" }}>{title}</h4>
      <p style={{ fontSize: 12.5, color: C.sub, margin: "0 0 14px", lineHeight: "17px" }}>Just suggestions, nothing is booked.</p>
      <div className="hs" style={{ gap: 12, paddingRight: 16 }}>
        {ideas.map((it, i) => (
          <div key={i} style={{ width: 140, flexShrink: 0 }}>
            <div style={{ width: 140, height: 100, borderRadius: 12, background: it.photo ? `url(${it.photo}) center/cover no-repeat` : "#F4F2F0", marginBottom: 8 }} />
            <p style={{ fontSize: 13.5, fontWeight: 500, color: C.head, margin: "0 0 2px", lineHeight: "18px" }}>{it.title}</p>
            {it.caption && <p style={{ fontSize: 11.5, color: C.sub, margin: 0, lineHeight: "15px" }}>{it.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Departure day card (transfer to the airport + a short note) ───
export function DepartureCard({ departure = {} }) {
  const V = vehicleIcon(departure.vehicle);
  const meta = [departure.sharing, departure.vehicle && cap(departure.vehicle), departure.duration].filter(Boolean).join(" · ");
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "linear-gradient(135deg, #FFF0F4 0%, #FEF6E9 100%)", borderBottom: `1px solid ${C.div}` }}>
          <Plane size={18} color="#FD014F" strokeWidth={1.9} style={{ transform: "rotate(45deg)" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.head }}>Departure day</span>
        </div>
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 54, height: 46, borderRadius: 10, background: "#FFE6ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <V size={28} color="#FD014F" strokeWidth={1.6} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.head, lineHeight: "20px" }}>Transfer to {departure.to || "the airport"}</div>
              {meta && <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>{meta}</div>}
            </div>
          </div>
          {departure.note && <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>{departure.note}</p>}
        </div>
      </div>
    </div>
  );
}
