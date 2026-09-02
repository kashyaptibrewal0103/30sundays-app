import { useState } from "react";
import { MapPin, Briefcase, Languages, Users, Phone, MessageCircle } from "lucide-react";
import { C } from "../data";
import { consultantVersion, teamLeadFor, formatCount } from "../data/consultants";

const firstName = (name) => (name || "").trim().split(/\s+/)[0] || "";

function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return (p[0][0] + (p[1]?.[0] || "")).toUpperCase();
}

// One of the three blocks under the name. Divider sits on the left so the row
// needs no outer hairlines.
function StatBlock({ icon: Icon, value, caption, first }) {
  return (
    <div style={{
      flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
      alignItems: "center", gap: 6, padding: "0 6px", textAlign: "center",
      borderLeft: first ? "none" : `1px solid ${C.div}`,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", background: C.p100,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={17} color={C.p600} strokeWidth={1.9} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: C.head, lineHeight: "17px" }}>{value}</span>
      <span style={{ fontSize: 11, color: C.sub, lineHeight: "14px" }}>{caption}</span>
    </div>
  );
}

function ProofLine({ children }) {
  return (
    <p style={{
      margin: 0, border: `1px solid ${C.sBorder}`, background: C.sBg,
      borderRadius: 12, padding: "11px 12px",
      fontSize: 13, lineHeight: "19px", color: C.sText,
    }}>
      {children}
    </p>
  );
}

// ─── Team lead bottom sheet, opened from the footer link on either version ───
function TeamLeadSheet({ lead, onClose }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 220);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        onClick={handleClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out" }}
      />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0",
        maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box",
        padding: "10px 18px 26px",
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: C.icon, margin: "0 auto 14px" }} />

        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
          <div style={{ position: "relative", marginBottom: 9 }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%", background: C.p100,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.p600, fontSize: 21, fontWeight: 700,
            }}>
              {initials(lead.name)}
            </div>
            <span style={{
              position: "absolute", right: 2, top: 4, width: 13, height: 13,
              borderRadius: "50%", background: "#25D366", border: `2.5px solid ${C.white}`,
            }} />
          </div>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.head }}>{lead.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 14, color: C.sub }}>{lead.role}</p>
        </div>

        {/* Three blocks — what a team lead is judged on */}
        <div style={{ display: "flex", marginBottom: 16 }}>
          <StatBlock first icon={Users} value={lead.teamSize} caption="Team members" />
          <StatBlock icon={Briefcase} value={`${formatCount(lead.tripsPlanned)}+`} caption="Trips planned" />
          <StatBlock icon={Languages} value={lead.languages.join(" · ")} caption="Speaks" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <ProofLine>{lead.bio}</ProofLine>
        </div>

        <a
          data-testid="call-team-lead"
          href={`tel:${lead.phone}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            padding: "14px 20px", borderRadius: 999, background: C.p600,
            color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none",
          }}
        >
          <Phone size={17} color="#fff" />
          Call {firstName(lead.name)}
        </a>
      </div>
    </div>
  );
}

// ─── Demo-only version switch, so both versions ship in one prototype ───
function VersionToggle({ version, onChange }) {
  const opts = [
    { key: "v1", label: "≥100 trips" },
    { key: "v2", label: "<100 trips" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, color: C.inact, letterSpacing: "0.7px", textTransform: "uppercase" }}>Demo</span>
      <div style={{ display: "flex", gap: 2, padding: 2, border: `1px dashed ${C.icon}`, borderRadius: 999 }}>
        {opts.map((o) => {
          const on = version === o.key;
          return (
            <button
              key={o.key}
              data-testid={`consultant-version-${o.key}`}
              onClick={() => onChange(o.key)}
              style={{
                padding: "4px 10px", borderRadius: 999, border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 11,
                fontWeight: on ? 700 : 500,
                background: on ? C.p600 : "transparent",
                color: on ? "#fff" : C.sub,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * "Your travel consultant" section for the itinerary screen.
 *
 * Renders nothing when no consultant is assigned yet. Otherwise picks its own
 * version from `consultant.tripsPlanned` — see src/data/consultants.js. The
 * only differences between the versions are the line under the name and
 * whether the trips block is shown.
 */
export default function TravelConsultantSection({ consultant, onVersionChange }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  if (!consultant) return null;

  const lead = teamLeadFor(consultant);
  const version = consultantVersion(consultant);
  const isNew = version === "v2";
  const fname = firstName(consultant.name);
  const waMsg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);

  return (
    <div style={{ padding: "0 16px" }}>
      {onVersionChange && <VersionToggle version={version} onChange={onVersionChange} />}

      <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 12px" }}>
        Your travel consultant
      </p>

      <div style={{
        border: `1px solid ${C.div}`, borderRadius: 14, padding: "15px 14px",
        display: "flex", flexDirection: "column", gap: 15,
      }}>
        {/* Name + contact actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: C.p100,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: C.p600, fontSize: 17, fontWeight: 700, flexShrink: 0,
          }}>
            {initials(consultant.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>{consultant.name}</p>
            {/* Version 2 only: borrow the team lead's record right under the name. */}
            {isNew && lead && (
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>
                His team lead has planned {formatCount(lead.tripsPlanned)}+ trips
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <a
              data-testid="consultant-whatsapp"
              href={`https://wa.me/${consultant.phone.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Chat with ${fname} on WhatsApp`}
              style={{ width: 36, height: 36, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <MessageCircle size={17} color="#fff" fill="#fff" />
            </a>
            <a
              data-testid="consultant-call"
              href={`tel:${consultant.phone}`}
              aria-label={`Call ${fname}`}
              style={{ width: 36, height: 36, borderRadius: "50%", background: C.p600, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Phone size={17} color="#fff" />
            </a>
          </div>
        </div>

        {/* Blocks — the trips block is hidden below the threshold */}
        <div style={{ display: "flex" }}>
          <StatBlock first icon={MapPin} value={consultant.destination} caption="Destination expert" />
          {!isNew && (
            <StatBlock icon={Briefcase} value={formatCount(consultant.tripsPlanned)} caption="Trips planned" />
          )}
          <StatBlock icon={Languages} value={consultant.languages.join(" · ")} caption="Speaks" />
        </div>

        <ProofLine>{consultant.bio}</ProofLine>

        {lead && (
          <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: C.sub }}>
            Can't reach {fname}?{" "}
            <button
              data-testid="open-team-lead"
              onClick={() => setSheetOpen(true)}
              style={{
                border: "none", background: "none", padding: 0, cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: C.p600,
                borderBottom: `1.5px solid ${C.p300}`,
              }}
            >
              Talk to his team lead
            </button>
          </p>
        )}
      </div>

      {sheetOpen && lead && <TeamLeadSheet lead={lead} onClose={() => setSheetOpen(false)} />}
    </div>
  );
}
