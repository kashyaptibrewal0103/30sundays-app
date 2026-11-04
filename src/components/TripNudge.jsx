import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight, Plane, Heart, Star, X, Sparkles } from "lucide-react";
import { C, destData } from "../data";
import { useDeals } from "../data/deals";

const bgColors = {
  lead: "rgba(255, 228, 232, 0.65)",
  customer: "rgba(236, 253, 243, 0.65)",
  done: "rgba(235, 233, 254, 0.65)",
  new: "rgba(255, 244, 214, 0.70)",        // brand light yellow
};

const borderStyle = {
  lead: "0.5px solid rgba(227, 27, 83, 0.15)",
  customer: "0.5px solid rgba(3, 152, 85, 0.15)",
  done: "0.5px solid rgba(105, 56, 239, 0.15)",
  new: "0.5px solid rgba(245, 184, 28, 0.22)",
};

// Deep amber for legible text/icon on the light yellow tint
const NEW_ACCENT = "#B88500";

export default function TripNudge({ userState }) {
  const [dismissed, setDismissed] = useState(false);
  const { deals } = useDeals();

  if (dismissed) return null;

  // "Your Bali itinerary is ready" → open the actual saved plan's detail
  // (in-deal editable view), not the explore overview page.
  const baliDeal = deals.find(d => d.dest === "Bali" && d.status !== "lost");
  const baliLatest = baliDeal ? [...(baliDeal.versions || [])].sort((a, b) => b.num - a.num)[0] : null;
  const baliLink = baliDeal && baliLatest
    ? `/itinerary/${baliLatest.itineraryId ?? baliDeal.itineraryId}?dealId=${baliDeal.id}&versionId=${baliLatest.id}`
    : "/detail/1";

  const dismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
  };

  const bg = bgColors[userState];

  let content = null;

  // ─── Lead ───
  if (userState === "lead") {
    const destImg = destData.Bali?.card;
    content = (
      <>
        <img src={destImg} alt="Bali" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>Your Bali itinerary is ready</p>
          <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0" }}>20 May – 27 May, 2026</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.p600, margin: "4px 0 0" }}>View Itinerary →</p>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(227,27,83,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ChevronRight size={16} color={C.p600} />
        </div>
      </>
    );
  }

  // ─── Customer ───
  if (userState === "customer") {
    const destImg = destData.Vietnam?.card;
    content = (
      <>
        <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
          {destImg ? (
            <img src={destImg} alt="Vietnam" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(3,152,85,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plane size={22} color="#039855" />
            </div>
          )}
          <div style={{
            position: "absolute", bottom: -3, right: -3, width: 22, height: 22,
            borderRadius: "50%", background: "#039855", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Plane size={10} color="#fff" style={{ transform: "rotate(-30deg)" }} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>
            Vietnam awaits you both! ✨
          </p>
          <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0" }}>20 Jun – 27 Jun, 2026</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <div style={{
              flex: 1, height: 4, borderRadius: 2, background: "rgba(3,152,85,0.15)", overflow: "hidden",
            }}>
              <div style={{ width: "60%", height: "100%", borderRadius: 2, background: "#039855" }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#039855", whiteSpace: "nowrap" }}>3/5 done</span>
          </div>
        </div>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0,
          background: "rgba(3,152,85,0.08)", borderRadius: 10, padding: "6px 10px",
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#039855", lineHeight: 1 }}>31</span>
          <span style={{ fontSize: 8, fontWeight: 600, color: "#039855", textTransform: "uppercase", letterSpacing: 0.5 }}>days to go</span>
        </div>
      </>
    );
  }

  // ─── New (anonymous) - nudge to sign in & check for a pending itinerary ───
  if (userState === "new") {
    content = (
      <>
        <div
          className="tn-glow"
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(245,184,28,0.14)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={22} color={NEW_ACCENT} className="tn-sparkle" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>Already in touch with our team?</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: NEW_ACCENT, margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
            Sign in to see your itinerary
            <ArrowRight size={14} color={NEW_ACCENT} strokeWidth={2.4} />
          </p>
        </div>
        {/* Glow + sparkle pulse keyframes, scoped to this nudge variant */}
        <style>{`
          @keyframes tnGlowPulse {
            0%, 100% {
              box-shadow:
                0 0 0 0 rgba(245, 184, 28, 0.40),
                0 0 10px 0 rgba(245, 184, 28, 0.18);
              transform: scale(1);
            }
            50% {
              box-shadow:
                0 0 0 10px rgba(245, 184, 28, 0),
                0 0 22px 4px rgba(245, 184, 28, 0.35);
              transform: scale(1.05);
            }
          }
          @keyframes tnSparkleSpin {
            0%   { transform: rotate(0deg)   scale(1); }
            50%  { transform: rotate(10deg)  scale(1.12); }
            100% { transform: rotate(0deg)   scale(1); }
          }
          .tn-glow    { animation: tnGlowPulse 2.4s ease-in-out infinite; }
          .tn-sparkle { animation: tnSparkleSpin 2.4s ease-in-out infinite; transform-origin: center; }
        `}</style>
      </>
    );
  }

  // ─── Trip Done ───
  if (userState === "done") {
    content = (
      <>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(105,56,239,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Heart size={22} color="#6938EF" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>How was Vietnam?</p>
          <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0" }}>Share your experience, help other couples</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#6938EF", margin: "4px 0 0" }}>Leave a review →</p>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(105,56,239,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Star size={16} color="#6938EF" />
        </div>
      </>
    );
  }

  if (!content) return null;

  const linkTo =
    userState === "lead" ? baliLink :
    userState === "customer" ? "/trips/trip-3" :
    userState === "new" ? "/plan?return=plans" :
    "/plan";
  return (
    <Link
      to={linkTo}
      style={{
        position: "absolute",
        bottom: 90,
        left: 12,
        right: 12,
        zIndex: 10,
        borderRadius: 16,
        padding: "14px 16px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), inset 0 0 0 0.5px rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
        animation: "nudgeIn 0.4s ease-out 0.5s both",
        background: bg,
        border: borderStyle[userState],
      }}
    >
      <DismissBtn onClick={dismiss} />
      {content}
    </Link>
  );
}

function DismissBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute", top: 6, right: 8, zIndex: 2,
        width: 16, height: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "none", border: "none", cursor: "pointer", padding: 0,
      }}
    >
      <X size={10} color="rgba(0,0,0,0.3)" />
    </button>
  );
}
