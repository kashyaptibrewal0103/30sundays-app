import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Phone, X } from "lucide-react";
import { C } from "../data";

// Bottom nudge for a sales-handled request (non-couple or non-eligible
// destinations): no itinerary is auto-generated, a travel consultant will call.
// Tap the card to open the Plan section; the phone button places a call.
export default function CallbackNudge() {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  if (dismissed) return null;

  const call = (e) => {
    e.stopPropagation();
    alert("Calling your travel consultant…");
  };
  const dismiss = (e) => {
    e.stopPropagation();
    setDismissed(true);
  };

  return (
    <div
      onClick={() => navigate("/plan")}
      style={{
        position: "absolute", bottom: 90, left: 12, right: 12, zIndex: 10,
        borderRadius: 16, padding: "14px 16px",
        background: "rgba(255, 228, 232, 0.75)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "0.5px solid rgba(227, 27, 83, 0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", gap: 12,
        cursor: "pointer", animation: "nudgeIn 0.4s ease-out 0.5s both",
      }}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ position: "absolute", top: 6, right: 8, zIndex: 2, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <X size={10} color="rgba(0,0,0,0.3)" />
      </button>

      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(227,27,83,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Bell size={20} color={C.p600} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>We will call you shortly!</p>
        <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0", lineHeight: "16px" }}>
          We are working on your request. A travel consultant will call you shortly to personalise your trip.
        </p>
      </div>

      <button
        onClick={call}
        aria-label="Call travel consultant"
        style={{ width: 40, height: 40, borderRadius: "50%", background: C.p600, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: "0 4px 12px rgba(227,27,83,0.35)" }}
      >
        <Phone size={17} color="#fff" />
      </button>
    </div>
  );
}
