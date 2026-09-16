import { Link, useNavigate } from "react-router-dom";
import { Gift, MapPin, Compass, ChevronRight, CalendarCheck, CheckCircle } from "lucide-react";
import { C } from "../data";
import { mockTrips, getCountdown } from "../data/tripData";

// ─── SVG: Couple with suitcase illustration ───
const CoupleIllo = () => (
  <svg width="160" height="140" viewBox="0 0 160 140" fill="none">
    <ellipse cx="80" cy="130" rx="60" ry="8" fill="#FFE4E8" opacity="0.6" />
    <rect x="62" y="80" width="36" height="44" rx="6" fill="#FEA3B4" stroke="#E31B53" strokeWidth="1.5" />
    <rect x="72" y="74" width="16" height="8" rx="3" fill="none" stroke="#E31B53" strokeWidth="1.5" />
    <line x1="74" y1="92" x2="86" y2="92" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="50" cy="52" r="12" fill="#FFE4E8" stroke="#E31B53" strokeWidth="1.5" />
    <path d="M38 90c0-10 5-18 12-18s12 8 12 18" fill="#E31B53" opacity="0.9" />
    <circle cx="46" cy="50" r="1.5" fill="#E31B53" />
    <circle cx="54" cy="50" r="1.5" fill="#E31B53" />
    <path d="M47 56c1.5 2 4.5 2 6 0" stroke="#E31B53" strokeWidth="1" strokeLinecap="round" fill="none" />
    <circle cx="110" cy="52" r="12" fill="#FFE4E8" stroke="#FEA3B4" strokeWidth="1.5" />
    <path d="M98 90c0-10 5-18 12-18s12 8 12 18" fill="#FEA3B4" opacity="0.9" />
    <circle cx="106" cy="50" r="1.5" fill="#E31B53" />
    <circle cx="114" cy="50" r="1.5" fill="#E31B53" />
    <path d="M107 56c1.5 2 4.5 2 6 0" stroke="#E31B53" strokeWidth="1" strokeLinecap="round" fill="none" />
    <path d="M76 30c-1-3 -5-4-6-1s2 5 6 8c4-3 7-5 6-8s-5-2-6 1z" fill="#E31B53" opacity="0.8" />
    <path d="M90 22c-0.6-2-3-2.5-3.6-0.6s1.2 3 3.6 4.8c2.4-1.8 4.2-3 3.6-4.8s-3-1.4-3.6 0.6z" fill="#FEA3B4" opacity="0.7" />
  </svg>
);

// ─── Login Gate (for new users) ───
function LoginGate() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "calc(100% - 50px)", padding: "40px 24px",
      background: `linear-gradient(180deg, ${C.p100}44 0%, ${C.white} 50%)`,
    }}>
      <CoupleIllo />
      <h2 style={{ fontSize: 24, fontWeight: 700, color: C.head, marginTop: 24, textAlign: "center" }}>
        Your trips await
      </h2>
      <p style={{ fontSize: 16, color: C.sub, marginTop: 8, textAlign: "center", lineHeight: "22px" }}>
        Log in to view your booked trips and upcoming adventures
      </p>
      <button
        onClick={() => navigate("/plan?return=trips")}
        style={{
          width: "100%", maxWidth: 320, marginTop: 32, padding: "14px 0",
          borderRadius: 12, border: "none", background: C.p600, color: "#fff",
          fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 4px 16px rgba(227,27,83,0.3)",
        }}
      >
        Log in
      </button>
      <Link to="/" style={{ marginTop: 16, fontSize: 14, color: C.p600, fontWeight: 600, textDecoration: "none" }}>
        Continue exploring
      </Link>
    </div>
  );
}

// ─── Lead Empty State ───
function LeadEmptyState({ leadData }) {
  const name = leadData?.name || "traveller";
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 24px", textAlign: "center",
    }}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="58" fill="#FFE4E8" opacity="0.4" />
        <path d="M60 35v50" stroke="#E31B53" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 40c0-14 11-25 25-25s25 11 25 25" fill="#FEA3B4" stroke="#E31B53" strokeWidth="1.5" />
        <path d="M47 40c0-7 6-12 13-12s13 5 13 12" fill="#E31B53" opacity="0.3" />
        <path d="M40 75l10-10h20l10 10" stroke="#E31B53" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M44 75l4 10M76 75l-4 10" stroke="#E31B53" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M85 28c-0.8-2.4-4-3.2-4.8-0.8s1.6 4 4.8 6.4c3.2-2.4 5.6-4 4.8-6.4s-4-1.6-4.8 0.8z" fill="#FEA3B4" opacity="0.6" />
      </svg>
      <h4 style={{ fontSize: 20, fontWeight: 700, color: C.head, marginTop: 20 }}>
        No trips booked yet, {name}!
      </h4>
      <p style={{ fontSize: 14, color: C.sub, marginTop: 8, lineHeight: "20px", maxWidth: 280 }}>
        Your curated itinerary is ready and waiting. Review it, tweak it, and let's lock in your next getaway. 💕
      </p>
      <Link
        to="/plan"
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          marginTop: 24, padding: "13px 28px", borderRadius: 12, background: C.p600,
          color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(227,27,83,0.3)",
        }}
      >
        <Compass size={16} />
        View planned itineraries
      </Link>
    </div>
  );
}

// ─── Section Label ───
function SectionLabel({ icon: Icon, label, color, bg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={14} color={color} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.head }}>{label}</span>
    </div>
  );
}

// ─── Trip Card (full-bleed carousel format matching ItineraryCard) ───
function TripCard({ trip }) {
  const countdown = getCountdown(trip.startDate);
  const imgs = trip.heroImages;

  // Status-specific styling
  const statusConfig = {
    ongoing: { label: "Ongoing", emoji: "🔥", color: "#fff", bg: "rgba(227,27,83,0.85)" },
    upcoming: { label: "Booked", emoji: "✈️", color: "#fff", bg: "rgba(3,152,85,0.85)" },
    completed: { label: "Completed", emoji: "✨", color: "#fff", bg: "rgba(83,88,98,0.75)" },
  };
  const sc = statusConfig[trip.status];

  // Format dates
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };
  const dateRange = `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}, ${new Date(trip.endDate).getFullYear()}`;

  return (
    <Link to={`/trips/${trip.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{
        width: "100%", borderRadius: 16, overflow: "hidden", position: "relative",
        height: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", cursor: "pointer",
      }}>
        <img src={imgs[0]} alt={trip.destination} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.82) 100%)" }} />

        {/* Status badge, top left (glassmorphism) */}
        <span style={{
          position: "absolute", top: 12, left: 12,
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
          color: sc.color, background: sc.bg,
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          {sc.emoji} {sc.label}
        </span>

        {/* Countdown / Day badge, top right */}
        {trip.status === "upcoming" && countdown && (
          <span style={{
            position: "absolute", top: 12, right: 12,
            fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
            color: "#fff", background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            ⏳ {countdown}
          </span>
        )}
        {trip.status === "ongoing" && (
          <span style={{
            position: "absolute", top: 12, right: 12,
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
            color: "#fff", background: "rgba(227,27,83,0.85)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <MapPin size={10} color="#fff" /> Day {getCurrentDay(trip)}
          </span>
        )}

        {/* Bottom overlay content */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 14px 14px" }}>
          {/* Trip name + nights */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 4px" }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.3px" }}>{trip.destination}</h3>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>·</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>🌙 {trip.totalNights}N</span>
          </div>

          {/* Dates banner */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <CalendarCheck size={11} color="rgba(255,255,255,0.75)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{dateRange}</span>
          </div>

          {/* Price row + CTA */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>₹{(trip.totalPackageValue / 1000).toFixed(0)}k</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}> total</span>
              {trip.status === "upcoming" && trip.amountPaid < trip.totalPackageValue && (
                <span style={{ fontSize: 11, color: "#FEA3B4", marginLeft: 6 }}>
                  · ₹{((trip.totalPackageValue - trip.amountPaid) / 1000).toFixed(0)}k due
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {trip.status === "ongoing" ? "Today's Plan" : trip.status === "upcoming" ? "Details" : "View"}
              </span>
              <ChevronRight size={14} color="#fff" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// A trip and anything that belongs to it, as one block.
function TripBlock({ trip, below }) {
  const extra = below ? below(trip) : null;
  if (!extra) return <TripCard trip={trip} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <TripCard trip={trip} />
      {extra}
    </div>
  );
}

// Helper: get current day number for ongoing trips
function getCurrentDay(trip) {
  const start = new Date(trip.startDate);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diff + 1, 1), trip.totalNights);
}

// ─── Main Component ───
export default function MyTrips({ userState, leadData, below, banner }) {
  const isNew = userState === "new";
  const isLead = userState === "lead";

  // New user → login gate
  if (isNew) return <LoginGate />;

  // Lead → show empty state with witty message
  if (isLead) {
    return (
      <div style={{ background: `linear-gradient(180deg, ${C.p100}55 0%, ${C.bg} 12%)`, minHeight: "100%" }}>
        <div style={{ padding: "12px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: C.head }}>My Trips</h2>
        </div>
        <LeadEmptyState leadData={leadData} />
      </div>
    );
  }

  // Customer/done, single scroll with priority: ongoing → upcoming → completed
  const ongoing = mockTrips.filter(t => t.status === "ongoing");
  const upcoming = mockTrips
    .filter(t => t.status === "upcoming")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const completed = mockTrips
    .filter(t => t.status === "completed")
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

  const hasTrips = ongoing.length + upcoming.length + completed.length > 0;

  return (
    <div style={{ background: `linear-gradient(180deg, ${C.p100}55 0%, ${C.bg} 12%)`, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.head }}>My Trips</h2>
        <button style={{
          display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
          borderRadius: 20, background: C.p100, border: "none", cursor: "pointer", fontFamily: "inherit",
        }}>
          <Gift size={14} color={C.p600} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.p600 }}>Refer & Earn</span>
        </button>
      </div>

      {banner}

      {!hasTrips ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🏝️</p>
          <h4 style={{ fontSize: 18, fontWeight: 600, color: C.head }}>No trips yet</h4>
          <p style={{ fontSize: 14, color: C.sub, marginTop: 6, lineHeight: "20px" }}>
            Every couple needs a getaway. Yours is just a tap away.
          </p>
          <Link to="/" style={{
            marginTop: 20, padding: "12px 28px", borderRadius: 10, background: C.p600,
            color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 16px rgba(227,27,83,0.3)",
          }}>
            Explore destinations
          </Link>
        </div>
      ) : (
        <div style={{ padding: "16px 16px 80px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* ── Ongoing trips (highest priority) ── */}
          {ongoing.length > 0 && (
            <div>
              <SectionLabel icon={MapPin} label="Happening now" color={C.p600} bg={C.p100} />
              {ongoing.map(trip => <TripBlock key={trip.id} trip={trip} below={below} />)}
            </div>
          )}

          {/* ── Upcoming trips ── */}
          {upcoming.length > 0 && (
            <div style={{ marginTop: ongoing.length > 0 ? 8 : 0 }}>
              <SectionLabel icon={CalendarCheck} label="Coming up" color="#039855" bg="#ECFDF3" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {upcoming.map(trip => <TripBlock key={trip.id} trip={trip} below={below} />)}
              </div>
            </div>
          )}

          {/* ── Completed trips ── */}
          {completed.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <SectionLabel icon={CheckCircle} label="Memories made" color={C.sub} bg={C.bg} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {completed.map(trip => <TripBlock key={trip.id} trip={trip} below={below} />)}
              </div>
            </div>
          )}

          {/* Bottom nudge */}
          <div style={{
            marginTop: 12, padding: "14px 16px", borderRadius: 14,
            background: C.p100, textAlign: "center",
          }}>
            <p style={{ fontSize: 13, color: C.p900, fontWeight: 500 }}>
              💕 Planning your next couple's escape?
            </p>
            <Link to="/" style={{ fontSize: 13, fontWeight: 600, color: C.p600, textDecoration: "none" }}>
              Explore destinations →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
