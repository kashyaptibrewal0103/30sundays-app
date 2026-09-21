import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home as HomeIcon, UserCog, RotateCcw, UserCheck, Lock, Check } from "lucide-react";
import { BRAND, BRAND_TINT, BRAND_SUB, FONT } from "../data/brand";
import ProfileSheet from "../components/ProfileSheet";
import EditProfileScreen from "../components/EditProfileScreen";
import { useProfile, prettyDate } from "../data/profile";

// ─── Profile details collection, for review ───
// Both ways in, the same store behind them, and the events printed as they
// fire. The demo profile is a phone number and a name, which is all an account
// holds today.

const BASE = { name: "Kashyap", countryCode: "+91", phone: "9971019664" };

const FIELDS = [
  { key: "email", label: "Email" },
  { key: "dob", label: "Birthday", date: true },
  { key: "anniversary", label: "Anniversary", date: true },
  { key: "gender", label: "Gender" },
  { key: "city", label: "City" },
  { key: "photo", label: "Photo", asFlag: true },
];

export default function ProfileLab() {
  const navigate = useNavigate();
  const { values, isLocked, events, reset, prefill } = useProfile();
  const [open, setOpen] = useState(null); // "sheet" | "profile"

  const launch = (label, Icon, key) => (
    <button
      data-testid={`launch-${key}`}
      onClick={() => setOpen(key)}
      style={{
        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "13px 10px", borderRadius: 12, border: `1.5px solid ${BRAND.sunsetFuchsia}33`,
        background: "#fff", cursor: "pointer", fontFamily: "inherit",
        fontSize: 13.5, fontWeight: 600, color: BRAND.sunsetFuchsia,
      }}
    >
      <Icon size={15} color={BRAND.sunsetFuchsia} />
      {label}
    </button>
  );

  const small = (label, Icon, onClick, key) => (
    <button
      data-testid={key}
      onClick={onClick}
      style={{
        flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "10px 8px", borderRadius: 10, border: "1px solid #E7E2DE",
        background: "#fff", cursor: "pointer", fontFamily: "inherit",
        fontSize: 12.5, fontWeight: 600, color: BRAND_SUB,
      }}
    >
      <Icon size={13} color="#A6B6B4" />
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100%", background: "#FBFAF9", position: "relative", fontFamily: FONT.primary }}>
      <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 10, background: "#fff", borderBottom: "1px solid #EDE9E6" }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={20} color={BRAND.tropicalForest} />
        </button>
        <div>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: BRAND.tropicalForest }}>Profile details</p>
          <p style={{ margin: 0, fontSize: 11.5, color: BRAND_SUB }}>Home sheet and profile screen, one store</p>
        </div>
      </div>

      <div style={{ padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {launch("Home sheet", HomeIcon, "sheet")}
          {launch("Edit profile", UserCog, "profile")}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {small("Start empty", RotateCcw, reset, "demo-reset")}
          {small("Returning traveller", UserCheck, prefill, "demo-prefill")}
        </div>

        {/* What the account holds right now */}
        <div style={{ background: "#fff", border: "1px solid #EDE9E6", borderRadius: 14, padding: "14px 15px" }}>
          <p style={{ margin: "0 0 11px", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: BRAND.lagoonBliss }}>
            On the account
          </p>
          <Row label="Phone" value={`${BASE.countryCode} ${BASE.phone}`} note="Required, never editable" locked />
          <Row label="Name" value={values.name || BASE.name} />
          {FIELDS.map((f) => (
            <Row
              key={f.key}
              label={f.label}
              value={f.asFlag ? (values[f.key] ? "Uploaded" : "") : f.date ? prettyDate(values[f.key]) : values[f.key]}
              locked={isLocked(f.key)}
            />
          ))}
        </div>

        {/* Events */}
        <div style={{ background: "#fff", border: "1px solid #EDE9E6", borderRadius: 14, padding: "14px 15px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: BRAND.goldenHour }}>
            Events
          </p>
          {events.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12.5, color: "#A6B6B4" }}>Nothing yet. Open a flow above.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {events.map((e) => (
                <div key={e.id}>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: BRAND.sunsetFuchsia, fontFamily: "ui-monospace, Menlo, monospace" }}>{e.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: BRAND_SUB, wordBreak: "break-word" }}>{JSON.stringify(e.props)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open === "sheet" && <ProfileSheet source="lab" onClose={() => setOpen(null)} />}
      {open === "profile" && <EditProfileScreen base={BASE} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Row({ label, value, note, locked }) {
  const has = !!value;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #F4F1EF" }}>
      <span style={{ width: 86, flexShrink: 0, fontSize: 12.5, color: BRAND_SUB }}>{label}</span>
      <span style={{
        flex: 1, minWidth: 0, fontSize: 13, fontWeight: has ? 600 : 500,
        color: has ? BRAND.tropicalForest : "#C2CCCB",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value || "Not given"}
      </span>
      {locked && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
          padding: "3px 8px", borderRadius: 999, background: BRAND_TINT.lagoonBliss,
          fontSize: 10.5, fontWeight: 600, color: BRAND.lagoonBliss,
        }}>
          <Lock size={10} /> {note ? "Fixed" : "Locked"}
        </span>
      )}
      {!locked && has && <Check size={13} color={BRAND.lagoonBliss} style={{ flexShrink: 0 }} />}
    </div>
  );
}
