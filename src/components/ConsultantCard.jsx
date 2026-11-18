import { useState } from "react";
import { Phone, X as XIcon, MessageCircle } from "lucide-react";
import { C } from "../data";
import { avatarFor } from "../data/consultants";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function formatPhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return raw;
}

function ContactSheet({ consultant, role, context, onClose }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 220);
  };
  const phoneDigits = consultant.phone.replace(/\D/g, "");
  const waMsg = encodeURIComponent(
    `Hi ${consultant.name.split(" ")[0]}, this is regarding my ${context || "trip"}.`
  );

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <div
        onClick={handleClose}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
          animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out",
        }}
      />
      <div style={{
        position: "relative", background: C.white, borderRadius: "16px 16px 0 0",
        padding: "20px 20px 28px",
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.sub, margin: 0, textTransform: "uppercase", letterSpacing: 0.3 }}>{role}</p>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "4px 0 0" }}>{consultant.name}</h3>
            <p style={{ fontSize: 14, color: C.sub, margin: "2px 0 0" }}>{formatPhone(consultant.phone)}</p>
          </div>
          <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: "50%", background: C.bg, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XIcon size={16} color={C.sub} />
          </button>
        </div>

        <a
          href={`https://wa.me/${phoneDigits}?text=${waMsg}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 16px", borderRadius: 12, background: "#25D366",
            color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none",
            marginBottom: 10,
          }}
        >
          <MessageCircle size={18} color="#fff" fill="#fff" />
          Chat on WhatsApp
        </a>

        <a
          href={`tel:${consultant.phone}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px 16px", borderRadius: 12, background: C.white,
            border: `1.5px solid ${C.p600}`, color: C.p600,
            fontSize: 15, fontWeight: 600, textDecoration: "none",
          }}
        >
          <Phone size={18} color={C.p600} />
          Call {consultant.name.split(" ")[0]}
        </a>
      </div>
    </div>
  );
}

export default function ConsultantCard({ consultant, role = "Your travel consultant", context, unassigned = false }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (unassigned || !consultant) {
    return (
      <div style={{
        background: C.white, border: `1px solid ${C.div}`, borderRadius: 12,
        padding: 14, display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: C.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.inact, fontSize: 16,
        }}>
          <span style={{ fontSize: 18 }}>✨</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: C.sub, margin: 0, fontWeight: 500 }}>{role}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "2px 0 0" }}>Assigning your travel consultant…</p>
          <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0", lineHeight: "17px" }}>We're matching you with a specialist for your destination.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        style={{
          width: "100%", background: C.white, border: `1px solid ${C.div}`,
          borderRadius: 12, padding: 14, display: "flex", alignItems: "center",
          gap: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: C.p100,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.p600, fontSize: 15, fontWeight: 700, flexShrink: 0, overflow: "hidden",
        }}>
          {avatarFor(consultant.name)
            ? <img src={avatarFor(consultant.name)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.7)", transformOrigin: "50% 30%" }} />
            : initials(consultant.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, color: C.sub, margin: 0, fontWeight: 500 }}>{role}</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.head, margin: "2px 0 0" }}>{consultant.name}</p>
          <p style={{ fontSize: 13, color: C.sub, margin: "1px 0 0" }}>{formatPhone(consultant.phone)}</p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: C.p100,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Phone size={18} color={C.p600} />
        </div>
      </button>

      {sheetOpen && (
        <ContactSheet
          consultant={consultant}
          role={role}
          context={context}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
