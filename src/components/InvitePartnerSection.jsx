import { useState, useEffect } from "react";
import { UserPlus, X as XIcon, MessageCircle, Send, Check, ChevronRight, Trash2, Contact } from "lucide-react";
import { C } from "../data";

const APP_LINK = "https://30sundays.club/get-app";

// Sample contacts used as a fallback when the device Contact Picker API isn't
// available (e.g. desktop browsers). On a real phone the OS picker is used.
const MOCK_CONTACTS = [
  { name: "Priya Sharma", tel: "+91 98200 11223" },
  { name: "Rohan Mehta", tel: "+91 99876 54321" },
  { name: "Ananya Iyer", tel: "+91 98765 12345" },
  { name: "Karan Patel", tel: "+91 90040 55667" },
  { name: "Neha Gupta", tel: "+91 98330 99881" },
  { name: "Arjun Rao", tel: "+91 97411 22334" },
];

// Normalize an Indian mobile to its parts: 10-digit national, +91 display, and
// the bare 91XXXXXXXXXX that wa.me expects.
function normalizeMobile(raw) {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  const national = d.slice(-10);
  const valid = national.length === 10;
  const display = valid ? `+91 ${national.slice(0, 5)} ${national.slice(5)}` : `+91 ${national}`;
  return { national, valid, display, wa: valid ? `91${national}` : "" };
}

// Planner's WhatsApp invite. Greeting falls back to "Hey!" if the name is blank.
// The number line is generic when we don't have the contact's number yet.
function buildInviteMessage({ name, numberDisplay, destination }) {
  const greet = name && name.trim() ? `Hey ${name.trim()}!` : "Hey!";
  const numberLine = numberDisplay
    ? `Log in with your number ${numberDisplay} (that's how we'll be connected on the trip)`
    : `Log in with your mobile number (that's how we'll be connected on the trip)`;
  return (
    `${greet} I've started planning our ${destination} trip on 30 Sundays ❤️ and I want you in on it.\n` +
    `Download the app: ${APP_LINK}\n` +
    `${numberLine} and you'll see the full itinerary I've put together. Let's plan the rest together!`
  );
}

// Open WhatsApp with the message prefilled. When we know the contact's number we
// pre-select them (wa.me/91…); otherwise wa.me/?text shows WhatsApp's chat picker
// so the planner chooses the contact themselves.
function openWhatsApp(partner, destination) {
  const msg = buildInviteMessage({ name: partner?.name, numberDisplay: partner?.display, destination });
  const base = partner?.wa ? `https://wa.me/${partner.wa}` : "https://wa.me/";
  window.open(`${base}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Try the native Contact Picker. Returns an array of {name, tel}, [] if cancelled,
// or null if the API isn't supported (caller should fall back to the mock list).
async function pickNativeContacts() {
  if (typeof navigator !== "undefined" && navigator.contacts && navigator.contacts.select) {
    try {
      const sel = await navigator.contacts.select(["name", "tel"], { multiple: true });
      return sel.map((c) => ({ name: (c.name && c.name[0]) || "", tel: (c.tel && c.tel[0]) || "" }));
    } catch {
      return [];
    }
  }
  return null;
}

function Avatar({ name, size = 42, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: C.p100, color: C.p600,
      display: "grid", placeItems: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      border: ring ? "2px solid #fff" : "none",
    }}>
      {(name?.[0] || "?").toUpperCase()}
    </div>
  );
}

function StatusChip({ joined }) {
  const c = joined
    ? { fg: "#2E7D52", bg: "#E6F4EC", bd: "#BBE3CA", label: "Joined" }
    : { fg: "#A66B00", bg: "#FEF5E5", bd: "#F5D98B", label: "Invited" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: c.fg, background: c.bg, border: `1px solid ${c.bd}`, padding: "3px 8px", borderRadius: 8, flexShrink: 0 }}>
      {joined && <Check size={12} strokeWidth={3} />} {c.label}
    </span>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

const sheetFrame = (isMobile) => isMobile
  ? { position: "fixed", inset: 0 }
  : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44, overflow: "hidden" };

const WhatsAppBtn = ({ onClick, label, solid }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", padding: "12px 0", borderRadius: 12,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      border: solid ? "none" : `1.5px solid #25D366`,
      background: solid ? "#25D366" : C.white, color: solid ? "#fff" : "#1FA855",
      fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    }}
  >
    <MessageCircle size={18} fill={solid ? "#fff" : "none"} color={solid ? "#25D366" : "#1FA855"} /> {label}
  </button>
);

const ContactsBtn = ({ onClick, label }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", padding: "12px 0", borderRadius: 12, border: `1.5px solid ${C.p600}`,
      background: C.white, color: C.p600, fontSize: 14, fontWeight: 700, cursor: "pointer",
      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}
  >
    <Contact size={17} /> {label}
  </button>
);

// ── Single-select contact picker (fallback): tap a contact to prefill the
//    add-guest form. ──
function MockContactsSheet({ onClose, onPick }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ ...sheetFrame(isMobile), zIndex: 186, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "16px 16px 0 0", padding: "16px 20px 28px", maxHeight: "82%", overflowY: "auto", animation: "sheetSlideUp 0.25s ease-out" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E2EB", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>Choose from contacts</h4>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 4, marginRight: -4 }}><XIcon size={20} color={C.sub} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.sub, margin: "0 0 12px", lineHeight: "18px" }}>Tap a contact to fill in their details.</p>

        {MOCK_CONTACTS.map((ct) => (
          <button key={ct.tel} onClick={() => onPick(ct)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 0", background: "none", border: "none", borderTop: `1px solid ${C.div}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <Avatar name={ct.name} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>{ct.name}</p>
              <p style={{ fontSize: 12.5, color: C.sub, margin: "1px 0 0" }}>{ct.tel}</p>
            </div>
            <ChevronRight size={18} color={C.inact} style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

const inputStyle = (valid) => ({
  width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12,
  border: `1.5px solid ${valid ? C.p600 : C.div}`, fontSize: 15, color: C.head,
  background: "#FAFAFA", outline: "none", fontFamily: "inherit",
});
const fieldLabel = { display: "block", fontSize: 13, fontWeight: 600, color: C.head, margin: "0 0 6px" };

// ── Add-guest sheet: enter name + mobile manually or prefill from contacts,
//    then Invite. ──
function AddGuestSheet({ name, setName, mobile, setMobile, destination, onContacts, onInvite, onClose }) {
  const isMobile = useIsMobile();
  const m = normalizeMobile(mobile);
  const canInvite = name.trim().length > 0 && m.valid;
  return (
    <div style={{ ...sheetFrame(isMobile), zIndex: 184, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "16px 16px 0 0", padding: "16px 20px 28px", maxHeight: "82%", overflowY: "auto", animation: "sheetSlideUp 0.25s ease-out" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E2EB", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>Add guest</h4>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 4, marginRight: -4 }}><XIcon size={20} color={C.sub} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.sub, margin: "0 0 16px", lineHeight: "18px" }}>Enter their details, or pick from your contacts. We'll invite them to plan this {destination} trip.</p>

        <div style={{ marginBottom: 14 }}>
          <label style={fieldLabel}>Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Their full name" style={inputStyle(name.trim().length > 0)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={fieldLabel}>Mobile number</label>
          <input type="tel" inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98765 43210" style={inputStyle(m.valid)} />
          {mobile.trim() && !m.valid && (
            <p style={{ fontSize: 12, color: "#D92D20", margin: "6px 2px 0" }}>Enter a valid 10-digit mobile number.</p>
          )}
        </div>

        <ContactsBtn onClick={onContacts} label="Add from contacts" />

        <button
          onClick={onInvite}
          disabled={!canInvite}
          style={{ marginTop: 16, width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: canInvite ? "pointer" : "default", fontFamily: "inherit", opacity: canInvite ? 1 : 0.4 }}
        >
          Invite
        </button>
      </div>
    </div>
  );
}

// Official WhatsApp glyph (lucide has no brand icons).
function WhatsAppIcon({ size = 16, color = "#fff" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.003a8.2 8.2 0 01-4.18-1.145l-.3-.178-3.114.816.83-3.038-.196-.312a8.2 8.2 0 01-1.26-4.39c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 015.82 2.41 8.19 8.19 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.247-.124-1.465-.723-1.692-.806-.227-.083-.393-.124-.558.124-.165.248-.64.806-.785.97-.145.166-.29.186-.537.062-.248-.124-1.046-.386-1.993-1.23-.737-.657-1.235-1.47-1.38-1.717-.144-.248-.015-.382.109-.505.111-.11.248-.29.372-.434.124-.145.165-.248.248-.414.083-.166.041-.31-.021-.434-.062-.124-.558-1.345-.765-1.84-.201-.484-.406-.418-.558-.426l-.475-.008a.916.916 0 00-.662.31c-.227.248-.868.848-.868 2.069 0 1.22.889 2.4 1.013 2.565.124.166 1.75 2.672 4.24 3.746.593.256 1.055.409 1.416.523.595.19 1.136.163 1.564.099.477-.071 1.465-.599 1.671-1.177.207-.579.207-1.075.145-1.178-.062-.104-.227-.166-.475-.29z"/>
    </svg>
  );
}

// ── Manage sheet: lists added co-travelers (name + mobile), each with a clear
//    "Invite on WhatsApp" button and a remove action, plus an Add-guest CTA. ──
function ManageSheet({ partners, destination, onClose, onAddGuest, onRemove }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ ...sheetFrame(isMobile), zIndex: 180, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "16px 16px 0 0", padding: "16px 20px 28px", maxHeight: "82%", overflowY: "auto", animation: "sheetSlideUp 0.25s ease-out" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E2EB", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>Your co-travelers</h4>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 4, marginRight: -4 }}><XIcon size={20} color={C.sub} /></button>
        </div>
        <p style={{ fontSize: 13, color: C.sub, margin: "0 0 8px", lineHeight: "18px" }}>Everyone here can plan this {destination} trip with you.</p>

        {partners.map((p, i) => (
          <div key={i} style={{ borderTop: `1px solid ${C.div}`, padding: "14px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={p.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name || "Your partner"}</p>
                <p style={{ fontSize: 12.5, color: C.sub, margin: "2px 0 0" }}>{p.display}</p>
              </div>
              <button onClick={() => onRemove(i)} aria-label={`Remove ${p.name || "guest"}`} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                <Trash2 size={16} color={C.sub} />
              </button>
            </div>
            <button
              onClick={() => openWhatsApp(p, destination)}
              aria-label={`Invite ${p.name || "guest"} on WhatsApp`}
              style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, border: "1px solid #BCE9CB", background: "#F3FBF6", color: "#1B7F4B", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              <WhatsAppIcon size={15} color="#25D366" /> Invite on WhatsApp
            </button>
          </div>
        ))}

        <button
          onClick={onAddGuest}
          style={{ marginTop: 16, width: "100%", padding: "13px 0", borderRadius: 12, border: `1.5px solid ${C.p600}`, background: C.white, color: C.p600, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <UserPlus size={17} /> Add guest
        </button>
      </div>
    </div>
  );
}

// ── Confirmation before removing a co-traveler ──
function ConfirmRemove({ name, onCancel, onConfirm }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ ...sheetFrame(isMobile), zIndex: 190, display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={onCancel} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 320, background: C.white, borderRadius: 16, padding: "22px 20px", textAlign: "center", animation: "sheetSlideUp 0.2s ease-out" }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#FDECEF", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
          <Trash2 size={20} color={C.p600} />
        </div>
        <h4 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Remove {name || "guest"}?</h4>
        <p style={{ fontSize: 13, color: C.sub, margin: "0 0 20px", lineHeight: "19px" }}>They'll no longer be able to plan this trip with you. You can invite them again anytime.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1.5px solid ${C.div}`, background: C.white, color: C.head, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
        </div>
      </div>
    </div>
  );
}

export default function InvitePartnerSection({ destination }) {
  const [partners, setPartners] = useState([]);
  const [view, setView] = useState(null); // 'manage' | 'add' | 'contacts'
  const [draftName, setDraftName] = useState("");
  const [draftMobile, setDraftMobile] = useState("");
  const [toast, setToast] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null); // { index, name }

  const joinedCount = partners.filter((p) => p.joined).length;

  const openAdd = () => { setDraftName(""); setDraftMobile(""); setView("add"); };
  const openEntry = () => (partners.length ? setView("manage") : openAdd());

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  // Invite the guest currently in the draft form, then drop back to the
  // itinerary with a success toast.
  const invite = () => {
    const m = normalizeMobile(draftMobile);
    const nm = draftName.trim();
    if (!nm || !m.valid) return;
    setPartners((prev) => (prev.some((p) => p.national === m.national)
      ? prev
      : [...prev, { name: nm, national: m.national, display: m.display, wa: m.wa, joined: false }]));
    setDraftName(""); setDraftMobile(""); setView(null);
    showToast(`Invitation sent to ${nm.split(" ")[0]}`);
  };

  // "Add from contacts": native picker prefills the form; else the mock sheet.
  const handleContacts = async () => {
    const native = await pickNativeContacts();
    if (native === null) { setView("contacts"); return; }
    if (native.length) { setDraftName(native[0].name || ""); setDraftMobile(native[0].tel || ""); }
  };

  const askRemove = (i) => setPendingRemove({ index: i, name: partners[i]?.name });
  const confirmRemove = () => {
    if (!pendingRemove) return;
    const { index, name } = pendingRemove;
    setPartners((prev) => prev.filter((_, idx) => idx !== index));
    setPendingRemove(null);
    if (partners.length <= 1) setView(null); // removed the last one → back to itinerary
    showToast(`${(name || "Guest").split(" ")[0]} removed`);
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.head, marginBottom: 12 }}>Plan together</p>

      {/* One compact, tappable row — no partners opens Add guest, else Manage */}
      <button
        onClick={openEntry}
        aria-label={partners.length ? "View travel companions" : "Invite your travel partner"}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, boxShadow: "0 1px 4px rgba(24,30,76,0.04)", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
      >
        {partners.length === 0 ? (
          <>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.p100, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <UserPlus size={19} color={C.p600} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>Invite your travel partner</p>
              <p style={{ fontSize: 12.5, color: C.sub, margin: "2px 0 0", lineHeight: "17px" }}>Plan this {destination} trip together</p>
            </div>
            <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#fff", background: C.p600, padding: "7px 16px", borderRadius: 999 }}>Invite</span>
          </>
        ) : (
          <>
            <div style={{ display: "flex" }}>
              {partners.slice(0, 3).map((p, i) => (
                <div key={i} style={{ marginLeft: i ? -12 : 0 }}><Avatar name={p.name} size={36} ring /></div>
              ))}
              {partners.length > 3 && (
                <div style={{ marginLeft: -12, width: 36, height: 36, borderRadius: "50%", background: C.bg, color: C.sub, border: "2px solid #fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>+{partners.length - 3}</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>
                {partners.length} {partners.length > 1 ? "co-travelers" : "co-traveler"} added
              </p>
              <p style={{ fontSize: 12.5, color: C.sub, margin: "2px 0 0" }}>
                {joinedCount > 0 ? `${joinedCount} joined so far` : "Tap to manage & send invites"}
              </p>
            </div>
            <ChevronRight size={18} color={C.sub} style={{ flexShrink: 0 }} />
          </>
        )}
      </button>

      {view === "manage" && (
        <ManageSheet
          partners={partners}
          destination={destination}
          onClose={() => setView(null)}
          onAddGuest={openAdd}
          onRemove={askRemove}
        />
      )}
      {pendingRemove && (
        <ConfirmRemove
          name={pendingRemove.name}
          onCancel={() => setPendingRemove(null)}
          onConfirm={confirmRemove}
        />
      )}
      {view === "add" && (
        <AddGuestSheet
          name={draftName}
          setName={setDraftName}
          mobile={draftMobile}
          setMobile={setDraftMobile}
          destination={destination}
          onContacts={handleContacts}
          onInvite={invite}
          onClose={() => setView(partners.length ? "manage" : null)}
        />
      )}
      {view === "contacts" && (
        <MockContactsSheet
          onClose={() => setView("add")}
          onPick={(c) => { setDraftName(c.name || ""); setDraftMobile(c.tel || ""); setView("add"); }}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", left: "50%", bottom: 96, transform: "translateX(-50%)", zIndex: 300, background: C.head, color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.22)", display: "flex", alignItems: "center", gap: 8, maxWidth: "88%", animation: "fadeInBg 0.2s ease-out" }}>
          <Check size={16} color="#4EAC7E" strokeWidth={3} /> {toast}
        </div>
      )}
    </div>
  );
}
