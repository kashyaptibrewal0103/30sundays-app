import { Car, Plane, ArrowRight, Sun, Check } from "lucide-react";
import { C } from "../data";

// Pick a leg icon: a flight/airport leg gets a plane, everything else a car.
function transferIcon(t) {
  const s = `${t.from || ""} ${t.to || ""} ${t.mode || ""}`.toLowerCase();
  return /airport|flight|fly/.test(s) ? Plane : Car;
}

// ─── Arranged transfers for the day (airport↔hotel, hotel↔hotel) ───
// Clearly marked "Included" so it reads as something we've booked, not a suggestion.
export function TransferSection({ transfers }) {
  if (!transfers?.length) return null;
  return (
    <div style={{ padding: "20px 20px 0" }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, color: "#181E4C", margin: "0 0 12px", lineHeight: "22px" }}>Arranged for you</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {transfers.map((t, i) => {
          const Icon = transferIcon(t);
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 12, border: "1px solid #E0E2EB", background: C.white }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FFE6ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color="#FD014F" strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#181E4C", lineHeight: "20px" }}>
                  <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.from}</span>
                  <ArrowRight size={14} color="#666C99" style={{ flexShrink: 0 }} />
                  <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.to}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
                  {(t.mode || t.duration) ? (
                    <span style={{ fontSize: 12.5, color: "#666C99" }}>{[t.mode, t.duration].filter(Boolean).join(" · ")}</span>
                  ) : <span />}
                  {t.included && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#2E7D52", background: "#E6F4EC", border: "1px solid #BBE3CA", padding: "3px 9px", borderRadius: 20, flexShrink: 0 }}>
                      <Check size={12} color="#2E7D52" strokeWidth={3} /> Included
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Calm "free day" hero shown INSTEAD of the video on leisure days ───
// Removes the arranged-looking player so a free day never reads as a booked tour.
export function LeisureCard({ hasTransfer }) {
  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 14, padding: "22px 20px", background: "linear-gradient(135deg, #FFF0F4 0%, #FEF6E9 100%)", border: "1px solid #F8D8E1" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: "0 4px 12px rgba(227,27,83,0.12)" }}>
          <Sun size={24} color="#FD014F" strokeWidth={1.8} />
        </div>
        <h4 style={{ fontSize: 18, fontWeight: 700, color: "#181E4C", margin: "0 0 6px", lineHeight: "24px" }}>
          {hasTransfer ? "Rest of the day is yours" : "This day is yours"}
        </h4>
        <p style={{ fontSize: 13.5, color: "#535862", margin: 0, lineHeight: "20px" }}>
          Nothing is scheduled{hasTransfer ? " after your transfer" : ""}. Relax at your own pace, or explore the ideas below. Nothing here is pre-booked, just tell your trip manager if you'd like us to arrange something.
        </p>
      </div>
    </div>
  );
}

// ─── Optional, clearly-unbooked ideas for a leisure day ───
// Same tile look as the rest of the app, but headed and captioned so it's obvious
// these are self-explore suggestions, not part of the arranged plan.
export function ExploreIdeas({ ideas }) {
  if (!ideas?.length) return null;
  return (
    <div style={{ padding: "24px 20px 0" }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, color: "#181E4C", margin: "0 0 2px", lineHeight: "22px" }}>Ideas to explore on your own</h4>
      <p style={{ fontSize: 12.5, color: "#666C99", margin: "0 0 14px", lineHeight: "17px" }}>Just suggestions, nothing is booked.</p>
      <div className="hs" style={{ gap: 12, paddingRight: 16 }}>
        {ideas.map((it, i) => (
          <div key={i} style={{ width: 140, flexShrink: 0 }}>
            <div style={{ width: 140, height: 100, borderRadius: 12, background: it.photo ? `url(${it.photo}) center/cover no-repeat` : "#F4F2F0", marginBottom: 8 }} />
            <p style={{ fontSize: 13.5, fontWeight: 500, color: "#181E4C", margin: "0 0 2px", lineHeight: "18px" }}>{it.title}</p>
            {it.caption && <p style={{ fontSize: 11.5, color: "#666C99", margin: 0, lineHeight: "15px" }}>{it.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
