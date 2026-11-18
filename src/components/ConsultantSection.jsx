import { useState } from "react";
import { Phone, ChevronRight } from "lucide-react";
import { C } from "../data";
import { BRAND, RAMP, FONT } from "../data/brand";
import WhatsAppIcon from "./WhatsAppIcon";
import AvatarArt from "./consultant_lab/AvatarArt";
import { consultantVersion, teamLeadFor, formatCount } from "../data/consultants";

// ─── Your travel consultant ───
//
// Version H, the ledger. The facts are label-left, value-right rows divided by
// hairlines, which is exactly how the cost breakdown lower down this same
// screen is set, so the block reads as part of the page rather than something
// pasted onto it. The Golden Hour edge is the brand's attention colour and the
// only thing here raising its voice at all.
//
// Colour and type come off the brand board: Poppins, Tropical Forest ink,
// Lagoon Bliss, Sunset Fuchsia for the one thing you press, Coastal Mist
// behind it, every value taken from the shade card rather than mixed by eye.

const firstName = (name) => (name || "").trim().split(/\s+/)[0] || "";
const WA = "#25D366";

function Face({ person, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
      background: RAMP.coastalMist[500], display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {person.avatar ? (
        <img
          src={person.avatar}
          alt={person.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", objectPosition: "center top", transform: "scale(1.7)", transformOrigin: "50% 30%" }}
        />
      ) : (
        <AvatarArt size={size} />
      )}
    </div>
  );
}

// Two marks beside the name, as they have always been. They are a shortcut for
// somebody who already knows which one they want; the card behind them opens
// the same two choices at full size for everybody else, so a press that lands
// anywhere still reaches the consultant. WhatsApp keeps its own green because
// it is somebody else's mark and a pink one would not be read as WhatsApp.
function Reach({ person, size = 34 }) {
  const fname = firstName(person.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);
  const btn = {
    width: size, height: size, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none",
  };
  // The card is pressable too, so each mark keeps its own press to itself.
  const mine = (e) => e.stopPropagation();
  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <a
        href={`https://wa.me/${person.phone.replace(/\D/g, "")}?text=${msg}`}
        target="_blank"
        rel="noreferrer"
        onClick={mine}
        aria-label={`Chat with ${fname} on WhatsApp`}
        style={{ ...btn, background: WA }}
      >
        <WhatsAppIcon size={17} />
      </a>
      <a
        href={`tel:${person.phone}`}
        onClick={mine}
        aria-label={`Call ${fname}`}
        style={{ ...btn, background: BRAND.sunsetFuchsia }}
      >
        <Phone size={16} color="#fff" />
      </a>
    </div>
  );
}

// ─── The same two choices, at full size ───
//
// What the card opens. Two rows and nothing else: no number, because nobody
// reads a number off a screen to then dial it by hand, and the row they press
// already knows it.
function ReachSheet({ person, onClose }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 220); };
  const fname = firstName(person.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);

  const row = {
    display: "flex", alignItems: "center", gap: 12, width: "100%",
    padding: "13px 2px", textDecoration: "none", border: "none", background: "none",
    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  };
  const tile = (bg) => ({
    width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: bg,
    display: "grid", placeItems: "center",
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0, background: "rgba(28,50,50,0.5)",
          animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out",
        }}
      />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0",
        maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box",
        padding: "10px 18px calc(22px + env(safe-area-inset-bottom))", fontFamily: FONT.primary,
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: RAMP.coastalMist[600], margin: "0 auto 16px" }} />

        <p style={{ margin: "0 0 10px", fontSize: 16.5, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>
          Reach {fname}
        </p>

        <a
          data-testid="consultant-whatsapp"
          href={`https://wa.me/${person.phone.replace(/\D/g, "")}?text=${msg}`}
          target="_blank"
          rel="noreferrer"
          onClick={close}
          style={{ ...row, borderTop: `1px solid ${RAMP.coastalMist[300]}` }}
        >
          <span style={tile(WA)}><WhatsAppIcon size={19} /></span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 600, color: BRAND.tropicalForest }}>WhatsApp</span>
          <ChevronRight size={18} color={RAMP.coastalMist[900]} />
        </a>

        <a
          data-testid="consultant-call"
          href={`tel:${person.phone}`}
          onClick={close}
          style={{ ...row, borderTop: `1px solid ${RAMP.coastalMist[300]}` }}
        >
          <span style={tile(BRAND.sunsetFuchsia)}><Phone size={18} color="#fff" /></span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 600, color: BRAND.tropicalForest }}>Call</span>
          <ChevronRight size={18} color={RAMP.coastalMist[900]} />
        </a>
      </div>
    </div>
  );
}

// One fact. The same row shape wherever a fact appears in this block, so the
// consultant and their lead are read with the same eye.
function Facts({ rows }) {
  return (
    <div>
      {rows.map(([label, value], i) => (
        <div key={label} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid ${RAMP.coastalMist[300]}`,
        }}>
          <span style={{ fontSize: 12.5, color: RAMP.tropicalForest[200] }}>{label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: BRAND.tropicalForest, textAlign: "right" }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── The team lead ───
//
// The paragraph about them is gone. It said in three lines what these four
// rows say at a glance, and the point of opening this sheet is to find out
// whether the person behind your consultant is worth ringing, not to read
// about them. Same rows, same order, same shape as the card it opened from.
//
// One action, and it is the call. A lead is the escalation when the consultant
// has not answered, so sending that person into another WhatsApp thread is the
// one thing the sheet should not offer.
function TeamLeadSheet({ lead, destination, onClose }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 220); };
  const fname = firstName(lead.name);

  const rows = [
    ["Destination", lead.destination || destination],
    ["Trips planned", `${formatCount(lead.tripsPlanned)}+`],
    ["Team members", lead.teamSize],
    ["Speaks", lead.languages.join(", ")],
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0, background: "rgba(28,50,50,0.5)",
          animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out",
        }}
      />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0",
        maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box",
        padding: "10px 18px 26px", fontFamily: FONT.primary,
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: RAMP.coastalMist[600], margin: "0 auto 16px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ position: "relative" }}>
            <Face person={lead} size={48} />
            <span style={{
              position: "absolute", right: -1, bottom: -1, width: 12, height: 12, borderRadius: "50%",
              background: BRAND.lagoonBliss, border: `2px solid ${C.white}`,
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 16.5, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>
              {lead.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: RAMP.tropicalForest[200] }}>{lead.role}</p>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <Facts rows={rows} />
        </div>

        <a
          data-testid="call-team-lead"
          href={`tel:${lead.phone}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
            padding: "14px 20px", borderRadius: 12, background: BRAND.sunsetFuchsia,
            color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none",
          }}
        >
          <Phone size={17} color="#fff" />
          Call {fname}
        </a>
      </div>
    </div>
  );
}

// ─── Demo-only switch, so both states ship in one prototype ───
function VersionToggle({ version, onChange }) {
  const opts = [
    { key: "v1", label: "≥100 trips" },
    { key: "v2", label: "<100 trips" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, color: RAMP.coastalMist[900], letterSpacing: "0.7px", textTransform: "uppercase" }}>
        Demo
      </span>
      <div style={{ display: "flex", gap: 2, padding: 2, border: `1px dashed ${RAMP.coastalMist[700]}`, borderRadius: 999 }}>
        {opts.map((o) => {
          const on = version === o.key;
          return (
            <button
              key={o.key}
              data-testid={`consultant-version-${o.key}`}
              onClick={() => onChange(o.key)}
              style={{
                padding: "4px 10px", borderRadius: 999, border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 11, fontWeight: on ? 700 : 500,
                background: on ? BRAND.sunsetFuchsia : "transparent",
                color: on ? "#fff" : RAMP.tropicalForest[200],
              }}
            >{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function ConsultantSection({ consultant, onVersionChange }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reachOpen, setReachOpen] = useState(false);
  if (!consultant) return null;

  const lead = teamLeadFor(consultant);
  const isNew = consultantVersion(consultant) === "v2";
  const fname = firstName(consultant.name);

  // Below the threshold a consultant's own count is not the proof, so the line
  // under the name borrows the one that is. Above it, the line just says what
  // they are doing for you.
  const subline = isNew && lead
    ? `Their team lead has planned ${formatCount(lead.tripsPlanned)}+ trips`
    : `Planning your ${consultant.destination} trip`;

  const rows = [
    ["Destination", consultant.destination],
    !isNew ? ["Trips planned", formatCount(consultant.tripsPlanned)] : null,
    ["Speaks", consultant.languages.join(", ")],
  ].filter(Boolean);

  return (
    <div style={{ padding: "0 16px", fontFamily: FONT.primary }}>
      {onVersionChange && <VersionToggle version={consultantVersion(consultant)} onChange={onVersionChange} />}

      <p style={{
        margin: "0 0 12px", fontSize: 17, fontWeight: 700,
        color: BRAND.tropicalForest, letterSpacing: "-0.2px",
      }}>Your travel consultant</p>

      {/* The whole card reaches them, in the shape it has always had. It is a
          card about one person you might want to ring, so a press anywhere on
          it gets you to them rather than only the two discs by the name. */}
      <div
        data-testid="consultant-card"
        role="button"
        tabIndex={0}
        aria-label={`Reach ${fname}`}
        onClick={() => setReachOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setReachOpen(true); } }}
        style={{
          display: "flex", background: C.white, borderRadius: 12, cursor: "pointer",
          border: `1px solid ${RAMP.coastalMist[500]}`, overflow: "hidden",
        }}
      >
        <span style={{ width: 4, flexShrink: 0, background: BRAND.goldenHour }} />

        <div style={{ flex: 1, minWidth: 0, padding: "13px 13px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
            <Face person={consultant} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>
                {consultant.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: RAMP.tropicalForest[200], lineHeight: "16px" }}>
                {subline}
              </p>
            </div>
            <Reach person={consultant} />
          </div>

          <Facts rows={rows} />

          {lead && (
            <p style={{
              margin: "12px 0 0", paddingTop: 11,
              borderTop: `1px solid ${RAMP.coastalMist[300]}`,
              fontSize: 12.5, color: RAMP.tropicalForest[200],
            }}>
              Can&apos;t reach {fname}?{" "}
              {/* The lead is somewhere else, so this press is its own. */}
              <button
                data-testid="open-team-lead"
                onClick={(e) => { e.stopPropagation(); setSheetOpen(true); }}
                style={{
                  border: "none", background: "none", padding: 0, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: BRAND.sunsetFuchsia,
                }}
              >Talk to their team lead</button>
            </p>
          )}
        </div>
      </div>

      {reachOpen && (
        <ReachSheet person={consultant} onClose={() => setReachOpen(false)} />
      )}

      {sheetOpen && lead && (
        <TeamLeadSheet lead={lead} destination={consultant.destination} onClose={() => setSheetOpen(false)} />
      )}
    </div>
  );
}
