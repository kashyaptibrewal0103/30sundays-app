import { useState } from "react";
import { Check, FileText, ExternalLink, MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import { C } from "../data";

// ─── Status chip (same look as the Add Ons chips) ───
function Chip({ tone, icon, text }) {
  const tones = {
    green: { color: "#2E7D52", background: "#E6F4EC", border: "#BBE3CA" },
    blue: { color: "#1570EF", background: "#EAF2FE", border: "#BBD6F8" },
    gray: { color: "#666C99", background: "#F1F2F6", border: "#E0E2EB" },
  };
  const t = tones[tone] || tones.gray;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: t.color, background: t.background, border: `1px solid ${t.border}`, padding: "3px 9px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" }}>
      {icon}
      {text}
    </span>
  );
}

// ─── Label / value info row ───
function InfoRow({ label, children, first }) {
  return (
    <div style={{ padding: first ? "0 0 10px" : "10px 0", borderTop: first ? "none" : "1px solid #E9EAEB" }}>
      <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 600, color: "#8A8FB0" }}>{label}</p>
      <div style={{ fontSize: 13.5, color: "#181E4C", lineHeight: "20px" }}>{children}</div>
    </div>
  );
}

// ─── Traveller document row (visa PDF, pending or ready) ───
function DocRow({ name, available, url }) {
  const inner = (
    <>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: available ? C.p100 : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <FileText size={18} color={available ? C.p600 : C.inact} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#181E4C", margin: 0 }}>{name}</p>
        <p style={{ fontSize: 12, color: available ? C.p600 : C.sub, margin: "2px 0 0", fontWeight: available ? 500 : 400 }}>
          {available ? "Tap to view e-Visa" : "Available soon, we'll notify you."}
        </p>
      </div>
      {available && <ExternalLink size={16} color={C.sub} style={{ flexShrink: 0 }} />}
    </>
  );
  const style = { display: "flex", alignItems: "center", gap: 12, padding: 12, background: available ? C.white : C.bg, border: available ? `1px solid ${C.div}` : `1px solid #E9EAEB`, borderRadius: 12, marginTop: 8, textDecoration: "none" };
  return available ? <a href={url || "#"} target="_blank" rel="noreferrer" style={style}>{inner}</a> : <div style={style}>{inner}</div>;
}

// ─── Kebab (3-dot) demo selector to switch the visa state ───
function StateMenu({ mode, setMode }) {
  const [open, setOpen] = useState(false);
  const options = [
    { k: "free", label: "Free VISA" },
    { k: "added", label: "Visa added" },
    { k: "notadded", label: "Visa not added" },
  ];
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change visa state"
        style={{ width: 28, height: 28, borderRadius: "50%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
      >
        <MoreVertical size={20} color="#666C99" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{ position: "absolute", top: 30, right: 0, zIndex: 50, background: C.white, border: "1px solid #E0E2EB", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.14)", overflow: "hidden", minWidth: 168 }}>
            {options.map((opt) => (
              <button
                key={opt.k}
                onClick={() => { setMode(opt.k); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", padding: "11px 14px", background: mode === opt.k ? "#FFF0F4" : C.white, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", fontSize: 13.5, color: "#181E4C" }}
              >
                {opt.label}
                {mode === opt.k && <Check size={15} color="#FD014F" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Visa section (shown before Add Ons) ───
// Rendered as a single accordion row in the same style as the Add Ons list:
// icon tile + label + subtitle + status chip + chevron, details expanding inline.
// The 3-dot menu switches between the three states so each can be previewed.
export default function VisaSection({ visa, destination, travelers = [] }) {
  const initialMode = !visa ? "notadded" : visa.type === "free_on_arrival" ? "free" : visa.purchased ? "added" : "notadded";
  const [mode, setMode] = useState(initialMode);
  const [open, setOpen] = useState(true);
  if (!visa) return null;

  const cardText = { fontSize: 13.5, color: "#535862", lineHeight: "20px", margin: "0 0 4px" };
  const primaryBtn = { marginTop: 14, width: "100%", padding: "12px 16px", borderRadius: 10, background: "#FD014F", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" };

  // Fallback demo content so every state renders fully via the selector.
  const free = {
    validity: visa.validity || "30 days on arrival (extendable up to 90 days for a fee)",
    requiredDocuments: visa.requiredDocuments || [
      "Passport valid for at least 6 months",
      "Confirmed return or onward flight tickets",
      "Confirmed hotel or resort booking",
      "Proof of sufficient funds",
    ],
    formNote: visa.formNote || "Fill and submit the official immigration form online within 96 hours of your flight departure:",
    formUrl: visa.formUrl || "https://imuga.immigration.gov.mv/",
  };
  const options = visa.options || [
    { label: "Tourist e-Visa (7-10 working days)", cost: "INR 3,465 / person" },
    { label: "Express (2 days)", cost: "INR 8,408 / person" },
    { label: "Express (1 day)", cost: "INR 9,610 / person" },
    { label: "Express (5 hours)", cost: "INR 11,642 / person" },
  ];

  let chip, rowLabel, rowSubtitle, body;

  if (mode === "free") {
    chip = <Chip tone="blue" text="Free on arrival" />;
    rowLabel = "Free visa on arrival";
    rowSubtitle = `${destination} · issued at immigration`;
    body = (
      <>
        <InfoRow label="Visa validity" first>{free.validity}</InfoRow>
        <InfoRow label="Required documents">
          <ul style={{ margin: "4px 0 0", paddingLeft: 17 }}>
            {free.requiredDocuments.map((d, i) => (
              <li key={i} style={{ marginBottom: 3 }}>{d}</li>
            ))}
          </ul>
        </InfoRow>
        <InfoRow label="Form to fill">
          {free.formNote}{" "}
          <a href={free.formUrl} target="_blank" rel="noreferrer" style={{ color: C.p600, fontWeight: 500, wordBreak: "break-all" }}>{free.formUrl}</a>
        </InfoRow>
      </>
    );
  } else if (mode === "added") {
    chip = <Chip tone="green" icon={<Check size={12} color="#2E7D52" strokeWidth={3} />} text="Added" />;
    rowLabel = `${destination} Tourist e-Visa`;
    rowSubtitle = "Ready for your trip";
    const people = travelers.length ? travelers : [{ name: "Your visa document" }];
    body = (
      <>
        <p style={cardText}>Your <b>{destination} Tourist e-Visa</b> is booked. {visa.stayInfo || "Single-entry, 30-day stay"}. No airport queues, no foreign-currency fees.</p>
        {people.map((t, i) => (
          <DocRow key={i} name={t.name} available={Boolean(visa.documentUrl)} url={visa.documentUrl} />
        ))}
      </>
    );
  } else {
    chip = <Chip tone="gray" text="Not added" />;
    rowLabel = `${destination} Tourist e-Visa`;
    rowSubtitle = "Add before you fly";
    body = (
      <>
        <p style={cardText}>We can arrange your tourist e-Visa before you fly, so it's sorted while you pack. Pick the processing speed that suits you.</p>
        {options.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 0", borderTop: "1px solid #E9EAEB" }}>
            <span style={{ fontSize: 13.5, color: "#181E4C" }}>{o.label}</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#181E4C", whiteSpace: "nowrap" }}>{o.cost}</span>
          </div>
        ))}
        <button style={primaryBtn} onClick={() => alert("Get visa - your trip manager will add it to your trip.")}>Get visa</button>
      </>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181E4C", margin: 0 }}>Visa</h4>
        <StateMenu mode={mode} setMode={setMode} />
      </div>

      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "8px 0 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#181E4C", lineHeight: "20px" }}>{rowLabel}</div>
            <div style={{ fontSize: 12.5, color: "#666C99", lineHeight: "17px", marginTop: 2 }}>{rowSubtitle}</div>
          </div>
          {chip}
          {open ? <ChevronUp size={20} color="#666C99" style={{ flexShrink: 0 }} /> : <ChevronDown size={20} color="#666C99" style={{ flexShrink: 0 }} />}
        </button>
        {open && <div style={{ padding: "0 0 4px" }}>{body}</div>}
      </div>
    </div>
  );
}
