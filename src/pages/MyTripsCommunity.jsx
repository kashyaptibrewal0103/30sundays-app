import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessagesSquare, ChevronRight, Bell, X as XIcon } from "lucide-react";
import { CC } from "../components/Community/tokens";
import MyTrips from "./MyTrips";
import { useCommunity } from "../state/useCommunity";
import { DESTINATIONS, ago } from "../data/communityData";

// The primary entry point: a card that belongs to the trip it sits under, so
// Community is never a separate destination in the app.
//
// This is the parallel variant of My Trips. The real /trips screen is
// untouched, which makes it easy to show the two side by side.

const byTrip = Object.values(DESTINATIONS).reduce((m, d) => ({ ...m, [d.tripId]: d }), {});

export default function MyTripsCommunity({ userState, leadData }) {
  const navigate = useNavigate();
  const { questionsFor } = useCommunity();
  const [push, setPush] = useState(true);

  return (
    <MyTrips
      userState={userState}
      leadData={leadData}
      banner={push && (
        <PushTile
          onOpen={() => navigate("/community/bali/q/q1")}
          onDismiss={() => setPush(false)}
        />
      )}
      below={(trip) => {
        const d = byTrip[trip.id];
        if (!d) return null;
        return <CommunityTripCard d={d} count={questionsFor(d.id).length} onClick={() => navigate(`/community/${d.id}`)} />;
      }}
    />
  );
}

/* ─────────────────── The card under a trip ─────────────────── */

function CommunityTripCard({ d, count, onClick }) {
  const { state, members, lastActiveMins } = d.cohort;

  // The live signal is what earns the tap, so it leads.
  const signal = state === "open"
    ? `${members} going in ${d.month.split(" ")[0]}`
    : state === "closed"
      ? `${count} questions, kept for whoever goes next`
      : `${count} questions answered so far`;

  const fresh = state === "open" ? `${Math.max(3, count - 5)} new answers this week` : null;

  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      border: `1px solid ${CC.line}`, borderRadius: 14,
      background: CC.white, padding: "13px 14px", minHeight: 48,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{
          width: 38, height: 38, borderRadius: 12, background: CC.goldTint, flexShrink: 0,
          display: "grid", placeItems: "center",
        }}><MessagesSquare size={18} color={CC.gold} /></span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: CC.goldInk,
            }}>Sunday Lounge</span>
            {state === "open" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: CC.body }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: CC.gold }} />
                {ago(lastActiveMins)}
              </span>
            )}
          </div>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: CC.ink, margin: "3px 0 0", letterSpacing: "-0.1px" }}>
            {d.name}, {d.month}
          </p>
          <p style={{
            fontSize: 12.5, color: CC.body, margin: "2px 0 0",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{fresh || signal}</p>
        </div>

        <ChevronRight size={17} color={CC.soft} style={{ flexShrink: 0 }} />
      </div>
    </button>
  );
}

/* ─────────────────── Simulated push notification ─────────────────── */

// Stands in for a notification tap in the demo. Opens straight to one question.
function PushTile({ onOpen, onDismiss }) {
  return (
    <div style={{ padding: "12px 16px 0" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 11, padding: "11px 12px",
        borderRadius: 14, background: CC.ink, boxShadow: "0 8px 24px rgba(24,29,39,0.22)",
      }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.14)",
          flexShrink: 0, display: "grid", placeItems: "center",
        }}><Bell size={16} color="#fff" /></span>

        <button onClick={onOpen} style={{
          flex: 1, minWidth: 0, background: "none", border: "none", padding: 0,
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", margin: 0, letterSpacing: "0.3px" }}>
            30 Sundays · now
          </p>
          <p style={{
            fontSize: 13.5, fontWeight: 600, color: "#fff", margin: "2px 0 0", lineHeight: "18px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            Our team answered the question about the Ubud drive
          </p>
        </button>

        <button onClick={onDismiss} aria-label="Dismiss" style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0, border: "none",
          background: "rgba(255,255,255,0.12)", cursor: "pointer", display: "grid", placeItems: "center",
        }}><XIcon size={13} color="#fff" /></button>
      </div>
    </div>
  );
}
