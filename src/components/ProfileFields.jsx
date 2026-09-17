import { useRef } from "react";
import { Lock, ChevronDown, Camera, Trash2 } from "lucide-react";
import { BRAND, BRAND_SUB } from "../data/brand";
import { initialsOf } from "../data/profile";

// Shared field furniture for the two places we ask a traveller for anything:
// the home sheet and the profile screen. Same box, same lock, same error, so a
// field learnt in one place is the same field in the other.

const BORDER = "#E7E2DE";
const WELL = "#F7F5F4";

export const LABEL = { fontSize: 12.5, fontWeight: 500, color: BRAND_SUB, margin: "0 0 7px", display: "block" };

export function Field({
  label, value, onChange, placeholder, type = "text", icon: Icon,
  locked, lockNote, error, inputMode, maxLength, testId, disabled, disabledNote, autoFocus, onBlur, tag,
}) {
  const readOnly = locked || disabled;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...LABEL, display: "flex", alignItems: "center", gap: 7 }}>
        {label}
        {tag && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
            color: BRAND.lagoonBliss, background: "#E5F6F5", borderRadius: 5, padding: "2px 6px",
          }}>{tag}</span>
        )}
      </label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        border: `1px solid ${error ? BRAND.sunsetFuchsia : BORDER}`,
        background: readOnly ? WELL : "#fff",
        borderRadius: 14, padding: "0 14px", height: 50,
        transition: "border-color 0.15s ease",
      }}>
        <input
          data-testid={testId}
          type={type}
          value={value}
          onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          readOnly={readOnly}
          autoFocus={autoFocus}
          inputMode={inputMode}
          maxLength={maxLength}
          style={{
            flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent",
            fontSize: 15, fontWeight: 500, fontFamily: "inherit",
            color: readOnly ? BRAND_SUB : BRAND.tropicalForest,
            cursor: readOnly ? "default" : "text",
          }}
        />
        {locked ? <Lock size={15} color="#A6B6B4" />
          : Icon ? <Icon size={17} color="#A6B6B4" /> : null}
      </div>
      {error ? (
        <p style={{ margin: "6px 2px 0", fontSize: 12, color: BRAND.sunsetFuchsia }}>{error}</p>
      ) : locked && lockNote ? (
        <p style={{ margin: "6px 2px 0", fontSize: 11.5, color: "#8FA3A1", lineHeight: "16px" }}>{lockNote}</p>
      ) : disabled && disabledNote ? (
        <p style={{ margin: "6px 2px 0", fontSize: 11.5, color: "#8FA3A1", lineHeight: "16px" }}>{disabledNote}</p>
      ) : null}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, placeholder, locked, lockNote, testId }) {
  if (locked) {
    return <Field label={label} value={value} locked lockNote={lockNote} testId={testId} onChange={() => {}} />;
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LABEL}>{label}</label>
      <div style={{ position: "relative" }}>
        <select
          data-testid={testId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", height: 50, borderRadius: 14, border: `1px solid ${BORDER}`,
            background: "#fff", padding: "0 40px 0 14px", appearance: "none", WebkitAppearance: "none",
            fontSize: 15, fontWeight: 500, fontFamily: "inherit",
            color: value ? BRAND.tropicalForest : "#A6B6B4", outline: "none", cursor: "pointer",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={17} color="#A6B6B4" style={{ position: "absolute", right: 14, top: 17, pointerEvents: "none" }} />
      </div>
    </div>
  );
}

export function SectionCard({ title, sub, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: `1px solid ${BORDER}`,
      padding: "18px 16px 4px", marginBottom: 14,
    }}>
      {title && (
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.2px" }}>{title}</h3>
          {sub && <p style={{ margin: "4px 0 0", fontSize: 12.5, color: BRAND_SUB, lineHeight: "18px" }}>{sub}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// The photo. Initials until there is one, a pencil badge either way, and a
// remove button once a photo exists so a bad pick is one tap to undo.
export function PhotoPicker({ photo, name, onPick, onRemove, size = 96 }) {
  const input = useRef(null);
  const read = (e) => {
    const file = e.target.files?.[0];
    if (file) onPick(URL.createObjectURL(file), file.name);
    e.target.value = "";
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <div style={{
          width: size, height: size, borderRadius: "50%", overflow: "hidden",
          background: BRAND.coastalMist, display: "grid", placeItems: "center",
          border: `1px solid ${BORDER}`,
        }}>
          {photo
            ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            : <span style={{ fontSize: size * 0.32, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "0.5px" }}>{initialsOf(name)}</span>}
        </div>
        <button
          data-testid="profile-photo-edit"
          onClick={() => input.current?.click()}
          aria-label="Change profile photo"
          style={{
            position: "absolute", right: -2, bottom: -2, width: 32, height: 32, borderRadius: "50%",
            background: "#fff", border: `1px solid ${BORDER}`, cursor: "pointer",
            display: "grid", placeItems: "center", boxShadow: "0 4px 12px -4px rgba(10,22,21,0.3)",
          }}
        >
          <Camera size={15} color={BRAND.tropicalForest} />
        </button>
        <input ref={input} type="file" accept="image/*" onChange={read} style={{ display: "none" }} />
      </div>
      {photo && (
        <button
          data-testid="profile-photo-remove"
          onClick={onRemove}
          style={{
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 12.5, fontWeight: 600, color: BRAND_SUB,
            display: "inline-flex", alignItems: "center", gap: 5, padding: 4,
          }}
        >
          <Trash2 size={13} /> Remove photo
        </button>
      )}
    </div>
  );
}
