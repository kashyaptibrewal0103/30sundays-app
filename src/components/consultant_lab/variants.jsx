import { useState } from "react";
import { MapPin, Briefcase, Languages, Phone, Users, ChevronRight } from "lucide-react";
import { C } from "../../data";
import { BRAND, RAMP, FONT } from "../../data/brand";
import WhatsAppIcon from "../WhatsAppIcon";
import { teamLeadFor, formatCount } from "../../data/consultants";
import AvatarArt from "./AvatarArt";
import ConsultantSection from "../ConsultantSection";

// ─── Your travel consultant, four ways ───
//
// The shipped card does not belong to the itinerary screen and it is worth
// saying exactly why, because all four of these are answers to the same three
// faults.
//
// One: it is set in a different voice. The page sets every heading at 17/700 in
// near-black; the card sets 17/600 in Tropical Forest. Two: it is built out of
// shapes the page never uses, a centred three-column stat band with tinted icon
// circles and a tinted quote box, where the rest of the screen is left-aligned
// rows in plain hairline cards at 12px. Three: it spends 339px on four facts.
//
// All four below take the page's structure and the board's colour. The brand
// stays: Poppins, Tropical Forest ink, Lagoon Bliss for proof, Sunset Fuchsia
// for the one thing you press, Coastal Mist behind it. Every value comes off
// the shade card in RAMP rather than being mixed by eye.

const firstName = (name) => (name || "").trim().split(/\s+/)[0] || "";

const WA = "#25D366";

// ─── Shared parts ───

function Face({ person, size = 46 }) {
  const ring = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    overflow: "hidden", background: RAMP.coastalMist[500],
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  return (
    <div style={ring}>
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

// WhatsApp keeps its own green because it is somebody else's mark and a pink
// one would not be read as WhatsApp. Ours is the Sunset Fuchsia one.
function RoundActions({ person, size = 36 }) {
  const fname = firstName(person.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);
  const btn = {
    width: size, height: size, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
      <a
        href={`https://wa.me/${person.phone.replace(/\D/g, "")}?text=${msg}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Chat with ${fname} on WhatsApp`}
        style={{ ...btn, background: WA }}
      >
        <WhatsAppIcon size={size * 0.52} />
      </a>
      <a
        href={`tel:${person.phone}`}
        aria-label={`Call ${fname}`}
        style={{ ...btn, background: BRAND.sunsetFuchsia }}
      >
        <Phone size={size * 0.47} color="#fff" />
      </a>
    </div>
  );
}

function LeadLink({ lead, onOpen, align = "left", tone = "light" }) {
  if (!lead) return null;
  return (
    <button
      onClick={onOpen}
      style={{
        display: "inline-flex", alignItems: "center", gap: 3, alignSelf: align === "center" ? "center" : "flex-start",
        border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
        fontSize: 12.5, fontWeight: 600,
        color: tone === "dark" ? RAMP.lagoonBliss[100] : BRAND.sunsetFuchsia,
      }}
    >
      Talk to their team lead
      <ChevronRight size={14} />
    </button>
  );
}

// The page's own heading: 17/700, left, 12 under. Only the ink is the brand's.
function Head({ children }) {
  return (
    <p style={{
      margin: "0 0 12px", fontSize: 17, fontWeight: 700,
      color: BRAND.tropicalForest, letterSpacing: "-0.2px",
    }}>{children}</p>
  );
}

const CARD = {
  background: C.white, border: `1px solid ${RAMP.coastalMist[500]}`,
  borderRadius: 12, overflow: "hidden",
};

function Wrap({ children }) {
  return <div style={{ padding: "0 16px", fontFamily: FONT.primary }}>{children}</div>;
}

// ─── The team lead, now with a face ───
//
// Same sheet as before. The only change that matters is that the lead arrives
// with a drawn portrait rather than the letters "AM" in a grey disc.
export function TeamLeadSheet({ lead, onClose }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 220); };
  const fname = firstName(lead.name);

  const fact = (Icon, value, caption, first) => (
    <div style={{
      flex: 1, minWidth: 0, textAlign: "center", padding: "0 8px",
      borderLeft: first ? "none" : `1px solid ${RAMP.coastalMist[500]}`,
    }}>
      {/* Lucide renders its svg as a block, so text-align does not reach it. */}
      <span style={{ display: "flex", justifyContent: "center" }}>
        <Icon size={16} color={BRAND.lagoonBliss} strokeWidth={2} />
      </span>
      <p style={{ margin: "5px 0 0", fontSize: 13.5, fontWeight: 600, color: BRAND.tropicalForest, lineHeight: "17px" }}>{value}</p>
      <p style={{ margin: "2px 0 0", fontSize: 11, color: RAMP.tropicalForest[200], lineHeight: "14px" }}>{caption}</p>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        onClick={close}
        style={{ position: "absolute", inset: 0, background: "rgba(28,50,50,0.5)", animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out" }}
      />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0",
        maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box",
        padding: "10px 18px 26px", fontFamily: FONT.primary,
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: RAMP.coastalMist[600], margin: "0 auto 16px" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Face person={lead} size={72} />
            <span style={{
              position: "absolute", right: 2, top: 4, width: 14, height: 14,
              borderRadius: "50%", background: BRAND.lagoonBliss, border: `2.5px solid ${C.white}`,
            }} />
          </div>
          <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: BRAND.tropicalForest, letterSpacing: "-0.3px" }}>{lead.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: RAMP.tropicalForest[200] }}>{lead.role}</p>
        </div>

        <div style={{ display: "flex", marginBottom: 16 }}>
          {fact(Users, lead.teamSize, "Team members", true)}
          {fact(Briefcase, `${formatCount(lead.tripsPlanned)}+`, "Trips planned")}
          {fact(Languages, lead.languages.join(" · "), "Speaks")}
        </div>

        <p style={{
          margin: "0 0 16px", fontSize: 13, lineHeight: "20px", color: RAMP.tropicalForest[300],
        }}>{lead.bio}</p>

        <a
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

function useLead(consultant) {
  const [open, setOpen] = useState(false);
  const lead = teamLeadFor(consultant);
  const sheet = open && lead ? <TeamLeadSheet lead={lead} onClose={() => setOpen(false)} /> : null;
  return { lead, sheet, openLead: () => setOpen(true) };
}

// ═══════════════════════════════════════════════════════════
// A. The row
// ═══════════════════════════════════════════════════════════
// The smallest honest version. One row, the same shape as a hotel or a flight
// leg further up the page, with the proof on a single line under the name and
// the two ways to reach them on the right. The sentence and the lead link sit
// outside the card as plain text, because neither is a control.
export function VariantRow({ consultant }) {
  const { lead, sheet, openLead } = useLead(consultant);
  const fname = firstName(consultant.name);

  return (
    <Wrap>
      <Head>Your travel consultant</Head>

      <div style={{ ...CARD, display: "flex", alignItems: "center", gap: 12, padding: "12px 13px" }}>
        <Face person={consultant} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>
            {consultant.name}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: RAMP.tropicalForest[200], lineHeight: "16px" }}>
            {consultant.destination} expert
            {consultant.tripsPlanned >= 100 ? ` · ${formatCount(consultant.tripsPlanned)} trips` : ""}
            {` · ${consultant.languages.join(", ")}`}
          </p>
        </div>
        <RoundActions person={consultant} />
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: "20px", color: RAMP.tropicalForest[300] }}>
        {consultant.bio}
      </p>

      {lead && (
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: RAMP.tropicalForest[200] }}>
          Can&apos;t reach {fname}?{" "}
          <LeadLink lead={lead} onOpen={openLead} />
        </p>
      )}

      {sheet}
    </Wrap>
  );
}

// ═══════════════════════════════════════════════════════════
// B. The flat card
// ═══════════════════════════════════════════════════════════
// Everything the shipped card says, in the page's vocabulary. The three facts
// become one line of small Lagoon Bliss pills instead of a centred band with
// icon discs, the quote loses its tinted box, and the two ways to reach them
// become full-width buttons at the foot where a card's actions live elsewhere
// on this screen.
export function VariantCard({ consultant }) {
  const { lead, sheet, openLead } = useLead(consultant);
  const fname = firstName(consultant.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);

  const pill = (Icon, text) => (
    <span key={text} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: RAMP.lagoonBliss[50], borderRadius: 999, padding: "5px 10px",
      fontSize: 11.5, fontWeight: 600, color: RAMP.lagoonBliss[900], whiteSpace: "nowrap",
    }}>
      <Icon size={12} strokeWidth={2.2} />
      {text}
    </span>
  );

  const action = {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "11px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: "none",
  };

  return (
    <Wrap>
      <Head>Your travel consultant</Head>

      <div style={{ ...CARD, padding: "14px 13px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Face person={consultant} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>
              {consultant.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: RAMP.tropicalForest[200] }}>
              Planning your {consultant.destination} trip
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pill(MapPin, `${consultant.destination} expert`)}
          {consultant.tripsPlanned >= 100 && pill(Briefcase, `${formatCount(consultant.tripsPlanned)} trips`)}
          {pill(Languages, consultant.languages.join(" · "))}
        </div>

        <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: RAMP.tropicalForest[300] }}>
          {consultant.bio}
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={`https://wa.me/${consultant.phone.replace(/\D/g, "")}?text=${msg}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...action, background: C.white, border: `1px solid ${RAMP.coastalMist[600]}`, color: BRAND.tropicalForest }}
          >
            <WhatsAppIcon size={16} color={WA} />
            WhatsApp
          </a>
          <a href={`tel:${consultant.phone}`} style={{ ...action, background: BRAND.sunsetFuchsia, color: "#fff" }}>
            <Phone size={15} color="#fff" />
            Call {fname}
          </a>
        </div>
      </div>

      {lead && (
        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: RAMP.tropicalForest[200] }}>
          Can&apos;t reach {fname}? <LeadLink lead={lead} onOpen={openLead} />
        </p>
      )}

      {sheet}
    </Wrap>
  );
}

// ═══════════════════════════════════════════════════════════
// C. The forest panel
// ═══════════════════════════════════════════════════════════
// The one block on the itinerary with weight. Everything above it is white
// cards on white; a Tropical Forest panel says this is a person, not another
// line item, and it is the only place on the screen where the brand's darkest
// colour would be right. Lagoon Bliss carries the facts, Sunset Fuchsia the
// one thing you press.
export function VariantPanel({ consultant }) {
  const { lead, sheet, openLead } = useLead(consultant);
  const fname = firstName(consultant.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);

  const facts = [
    [`${consultant.destination}`, "Destination expert"],
    consultant.tripsPlanned >= 100 ? [formatCount(consultant.tripsPlanned), "Trips planned"] : null,
    [consultant.languages.join(" · "), "Speaks"],
  ].filter(Boolean);

  const action = {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "11px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: "none",
  };

  return (
    <Wrap>
      <Head>Your travel consultant</Head>

      <div style={{
        background: BRAND.tropicalForest, borderRadius: 12, padding: "15px 14px",
        display: "flex", flexDirection: "column", gap: 13,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Face person={consultant} size={50} />
            <span style={{
              position: "absolute", right: 0, bottom: 1, width: 12, height: 12, borderRadius: "50%",
              background: BRAND.lagoonBliss, border: `2px solid ${BRAND.tropicalForest}`,
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>
              {consultant.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: RAMP.lagoonBliss[100] }}>
              Planning your {consultant.destination} trip
            </p>
          </div>
        </div>

        {/* Facts on one baseline, divided by a hairline in the panel's own
            lighter shade rather than an outline round each. */}
        <div style={{ display: "flex", borderTop: `1px solid ${RAMP.tropicalForest[600]}`, paddingTop: 12 }}>
          {facts.map(([value, caption], i) => (
            <div key={caption} style={{
              flex: 1, minWidth: 0, padding: "0 8px",
              borderLeft: i === 0 ? "none" : `1px solid ${RAMP.tropicalForest[600]}`,
            }}>
              <p style={{
                margin: 0, fontSize: 13.5, fontWeight: 600, color: "#fff", lineHeight: "18px",
                minHeight: 36,
              }}>{value}</p>
              <p style={{ margin: "2px 0 0", fontSize: 10.5, color: RAMP.tropicalForest[100], lineHeight: "14px" }}>{caption}</p>
            </div>
          ))}
        </div>

        <p style={{ margin: 0, fontSize: 12.5, lineHeight: "19px", color: RAMP.tropicalForest[50] }}>
          {consultant.bio}
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={`https://wa.me/${consultant.phone.replace(/\D/g, "")}?text=${msg}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...action, background: "rgba(255,255,255,0.1)", border: `1px solid ${RAMP.tropicalForest[300]}`, color: "#fff" }}
          >
            <WhatsAppIcon size={16} color="#fff" />
            WhatsApp
          </a>
          <a href={`tel:${consultant.phone}`} style={{ ...action, background: BRAND.sunsetFuchsia, color: "#fff" }}>
            <Phone size={15} color="#fff" />
            Call {fname}
          </a>
        </div>

        {lead && (
          <div style={{ borderTop: `1px solid ${RAMP.tropicalForest[600]}`, paddingTop: 11, textAlign: "center" }}>
            <LeadLink lead={lead} onOpen={openLead} align="center" tone="dark" />
          </div>
        )}
      </div>

      {sheet}
    </Wrap>
  );
}

// ═══════════════════════════════════════════════════════════
// D. The header strip
// ═══════════════════════════════════════════════════════════
// No heading above it, because the strip says what it is. A Coastal Mist band
// carries the face and the name, the white half under it carries the sentence
// and the actions, and the two are one object. It is the version that fits a
// scroll: at a glance it reads as a person attached to this trip rather than
// another section to work through.
export function VariantStrip({ consultant }) {
  const { lead, sheet, openLead } = useLead(consultant);
  const fname = firstName(consultant.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);

  return (
    <Wrap>
      <div style={CARD}>
        <div style={{
          background: RAMP.coastalMist[300], padding: "12px 13px",
          display: "flex", alignItems: "center", gap: 12,
          borderBottom: `1px solid ${RAMP.coastalMist[500]}`,
        }}>
          <Face person={consultant} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.9px",
              textTransform: "uppercase", color: RAMP.lagoonBliss[900],
            }}>Your travel consultant</p>
            <p style={{ margin: "3px 0 0", fontSize: 15.5, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>
              {consultant.name}
            </p>
          </div>
          <RoundActions person={consultant} size={34} />
        </div>

        <div style={{ padding: "12px 13px", display: "flex", flexDirection: "column", gap: 9 }}>
          <p style={{
            margin: 0, fontSize: 11.5, fontWeight: 600, color: RAMP.lagoonBliss[900],
            display: "flex", gap: 6, flexWrap: "wrap",
          }}>
            <span>{consultant.destination} expert</span>
            {consultant.tripsPlanned >= 100 && (
              <>
                <span style={{ color: RAMP.coastalMist[700] }}>·</span>
                <span>{formatCount(consultant.tripsPlanned)} trips planned</span>
              </>
            )}
            <span style={{ color: RAMP.coastalMist[700] }}>·</span>
            <span>{consultant.languages.join(", ")}</span>
          </p>

          <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: RAMP.tropicalForest[300] }}>
            {consultant.bio}
          </p>

          {lead && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 2 }}>
              <span style={{ fontSize: 12.5, color: RAMP.tropicalForest[200] }}>Can&apos;t reach {fname}?</span>
              <LeadLink lead={lead} onOpen={openLead} />
            </div>
          )}
        </div>
      </div>

      {sheet}
    </Wrap>
  );
}

// ═══════════════════════════════════════════════════════════
// E. The conversation
// ═══════════════════════════════════════════════════════════
// Not a profile at all. Every one of these people is reached on WhatsApp in
// real life, so the block opens the way that conversation opens: a line from
// them, in a bubble, already addressed to you. The facts are the sender line
// above it, which is where a messaging app puts them anyway.
export function VariantChat({ consultant }) {
  const { lead, sheet, openLead } = useLead(consultant);
  const fname = firstName(consultant.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);

  const action = {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "11px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 600, textDecoration: "none",
  };

  return (
    <Wrap>
      <Head>Your travel consultant</Head>

      <div style={{ ...CARD, padding: "13px 13px 14px", display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Face person={consultant} size={40} />
            <span style={{
              position: "absolute", right: -1, bottom: -1, width: 11, height: 11, borderRadius: "50%",
              background: BRAND.lagoonBliss, border: `2px solid ${C.white}`,
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>
              {consultant.name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: RAMP.tropicalForest[200] }}>
              {consultant.destination} expert
              {consultant.tripsPlanned >= 100 ? ` · ${formatCount(consultant.tripsPlanned)} trips` : ""}
              {` · ${consultant.languages.join(", ")}`}
            </p>
          </div>
        </div>

        {/* One square corner, top left, under the sender. That corner is the
            whole reason a bubble reads as something a person sent. */}
        <p style={{
          margin: "0 0 0 50px", background: RAMP.coastalMist[200],
          borderRadius: "4px 14px 14px 14px", padding: "11px 13px",
          fontSize: 13, lineHeight: "20px", color: RAMP.tropicalForest[500],
        }}>{consultant.bio}</p>

        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={`https://wa.me/${consultant.phone.replace(/\D/g, "")}?text=${msg}`}
            target="_blank"
            rel="noreferrer"
            style={{ ...action, background: WA, color: "#fff" }}
          >
            <WhatsAppIcon size={16} color="#fff" />
            Message {fname}
          </a>
          <a
            href={`tel:${consultant.phone}`}
            aria-label={`Call ${fname}`}
            style={{
              flexShrink: 0, width: 44, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 10, background: RAMP.sunsetFuchsia[50], textDecoration: "none",
            }}
          >
            <Phone size={17} color={BRAND.sunsetFuchsia} />
          </a>
        </div>

        {lead && (
          <div style={{ borderTop: `1px solid ${RAMP.coastalMist[300]}`, paddingTop: 10 }}>
            <LeadLink lead={lead} onOpen={openLead} />
          </div>
        )}
      </div>

      {sheet}
    </Wrap>
  );
}

// ═══════════════════════════════════════════════════════════
// F. The signature band
// ═══════════════════════════════════════════════════════════
// Two blocks, no padding between them: the photo square against the edge of
// the card, and a Tropical Forest field beside it carrying the name and one
// line. It is the shortest version that still gives the face real size, which
// is the only part of this block doing the reassuring.
export function VariantBand({ consultant }) {
  const { lead, sheet, openLead } = useLead(consultant);
  const fname = firstName(consultant.name);
  const msg = encodeURIComponent(`Hi ${fname}, this is regarding my trip.`);

  return (
    <Wrap>
      <Head>Your travel consultant</Head>

      <div style={{ ...CARD, border: "none", display: "flex", alignItems: "stretch", minHeight: 92 }}>
        <div style={{ width: 92, flexShrink: 0, background: RAMP.sunsetFuchsia[300], overflow: "hidden" }}>
          {consultant.avatar ? (
            <img
              src={consultant.avatar}
              alt={consultant.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transform: "scale(1.7)", transformOrigin: "50% 30%", display: "block" }}
            />
          ) : (
            <AvatarArt size={92} />
          )}
        </div>

        <div style={{
          flex: 1, minWidth: 0, background: BRAND.tropicalForest,
          padding: "12px 13px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3,
        }}>
          <p style={{
            margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.9px",
            textTransform: "uppercase", color: RAMP.lagoonBliss[100],
          }}>
            {consultant.destination} expert
            {consultant.tripsPlanned >= 100 ? ` · ${formatCount(consultant.tripsPlanned)} trips` : ""}
          </p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" }}>
            {consultant.name}
          </p>

          <div style={{ display: "flex", gap: 7, marginTop: 6 }}>
            <a
              href={`https://wa.me/${consultant.phone.replace(/\D/g, "")}?text=${msg}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px",
                borderRadius: 999, background: "rgba(255,255,255,0.12)",
                border: `1px solid ${RAMP.tropicalForest[300]}`,
                color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              <WhatsAppIcon size={13} color="#fff" />
              WhatsApp
            </a>
            <a
              href={`tel:${consultant.phone}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px",
                borderRadius: 999, background: BRAND.sunsetFuchsia,
                color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              <Phone size={13} color="#fff" />
              Call
            </a>
          </div>
        </div>
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: "20px", color: RAMP.tropicalForest[300] }}>
        {consultant.bio}
      </p>

      {lead && (
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: RAMP.tropicalForest[200] }}>
          Can&apos;t reach {fname}? <LeadLink lead={lead} onOpen={openLead} />
        </p>
      )}

      {sheet}
    </Wrap>
  );
}

// ═══════════════════════════════════════════════════════════
// G. The byline
// ═══════════════════════════════════════════════════════════
// No card and no heading. A rule above, a rule below, and a line that says who
// made the thing you have just read. It belongs at the end of the day plan the
// way a byline belongs at the end of an article, and at roughly 90px it is the
// version that costs the scroll nothing.
export function VariantByline({ consultant }) {
  const { lead, sheet, openLead } = useLead(consultant);
  const fname = firstName(consultant.name);

  return (
    <Wrap>
      <div style={{ borderTop: `1px solid ${RAMP.coastalMist[500]}`, paddingTop: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Face person={consultant} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, color: RAMP.tropicalForest[200], lineHeight: "17px" }}>
              Planned for you by{" "}
              <span style={{ fontWeight: 600, color: BRAND.tropicalForest }}>{consultant.name}</span>
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: RAMP.lagoonBliss[900], fontWeight: 600, lineHeight: "16px" }}>
              {consultant.destination} expert
              {consultant.tripsPlanned >= 100 ? ` · ${formatCount(consultant.tripsPlanned)} trips` : ""}
              {` · ${consultant.languages.join(", ")}`}
            </p>
          </div>
          <RoundActions person={consultant} size={34} />
        </div>

        {lead && (
          <p style={{
            margin: "11px 0 0", paddingTop: 11, borderTop: `1px solid ${RAMP.coastalMist[300]}`,
            fontSize: 12.5, color: RAMP.tropicalForest[200],
          }}>
            Can&apos;t reach {fname}? <LeadLink lead={lead} onOpen={openLead} />
          </p>
        )}
      </div>

      {sheet}
    </Wrap>
  );
}

export const VARIANTS = [
  { key: "row", title: "A. The row", note: "Smallest. Same shape as a hotel or a flight leg further up the page.", Comp: VariantRow },
  { key: "card", title: "B. The flat card", note: "Everything the shipped card says, in the page's own vocabulary.", Comp: VariantCard },
  { key: "panel", title: "C. The forest panel", note: "The one block on the screen with weight. A person, not a line item.", Comp: VariantPanel },
  { key: "strip", title: "D. The header strip", note: "No heading above it. The band says what it is.", Comp: VariantStrip },
  { key: "chat", title: "E. The conversation", note: "Opens the way the real conversation opens. A line from them, in a bubble, already addressed to you.", Comp: VariantChat },
  { key: "band", title: "F. The signature band", note: "Photo flush to the card edge, forest field beside it. Shortest version that still gives the face real size.", Comp: VariantBand },
  { key: "byline", title: "G. The byline", note: "No card, no heading. Who made the thing you just read, in roughly a hundred pixels.", Comp: VariantByline },
  { key: "ledger", title: "H. The ledger · chosen", note: "Facts as label and value rows, like the cost breakdown lower down. Reach icons sit on the name, no paragraph, and the lead sheet uses the same rows.", Comp: ConsultantSection },
];
