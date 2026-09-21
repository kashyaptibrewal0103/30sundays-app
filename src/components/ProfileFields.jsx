import { useRef, useState } from "react";
import { Lock, ChevronDown, Pencil, Trash2, Info, UserRound } from "lucide-react";
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
  locked, lockNote, error, inputMode, maxLength, testId, disabled, disabledNote, autoFocus, onBlur, tag, noteIcon,
}) {
  const readOnly = locked || disabled;
  // A field that answers when you touch it. The tint tells you where the
  // cursor is without another label saying so.
  const [focused, setFocused] = useState(false);
  const live = focused && !readOnly;
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
        border: `1px solid ${error ? BRAND.sunsetFuchsia : live ? BRAND.sunsetFuchsia : BORDER}`,
        boxShadow: live ? `0 0 0 3px ${BRAND.sunsetFuchsia}1A` : "none",
        background: readOnly ? WELL : "#fff",
        borderRadius: 14, padding: "0 14px", height: 50,
        transition: "border-color 0.16s ease, box-shadow 0.16s ease",
      }}>
        <input
          data-testid={testId}
          type={type}
          value={value}
          onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
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
          : Icon ? <Icon size={17} color={live ? BRAND.sunsetFuchsia : "#A6B6B4"} style={{ transition: "color 0.16s ease" }} /> : null}
      </div>
      {error ? (
        <p style={{ margin: "6px 2px 0", fontSize: 12, color: BRAND.sunsetFuchsia }}>{error}</p>
      ) : (locked && lockNote) || (disabled && disabledNote) ? (
        <Note icon={noteIcon}>{locked ? lockNote : disabledNote}</Note>
      ) : null}
    </div>
  );
}

// A quiet line under a field, for a rule rather than a mistake.
function Note({ icon, children }) {
  const NoteIcon = icon === true ? Info : icon;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", margin: "6px 2px 0" }}>
      {NoteIcon && <NoteIcon size={12} color="#A6B6B4" style={{ flexShrink: 0, marginTop: 2 }} />}
      <p style={{ margin: 0, fontSize: 11.5, color: "#8FA3A1", lineHeight: "16px" }}>{children}</p>
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
export function PhotoPicker({ photo, name, onPick, onRemove, placeholder, size = 52 }) {
  const input = useRef(null);
  const read = (e) => {
    const file = e.target.files?.[0];
    if (file) onPick(URL.createObjectURL(file), file.name);
    e.target.value = "";
  };
  const src = photo || placeholder;
  // initialsOf falls back to "?", which is a worse empty state than a figure.
  const initials = name?.trim() ? initialsOf(name) : "";

  // A row, not a portrait. The photo is the least important thing on this
  // screen: the birthday and the anniversary are what we are here for. A 96px
  // circle centred above the fields made it the headline and pushed the fields
  // that matter below the fold.
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <div style={{
          width: size, height: size, borderRadius: "50%", overflow: "hidden",
          background: BRAND.coastalMist, display: "grid", placeItems: "center",
          border: `1px solid ${BORDER}`,
        }}>
          {src
            ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            : initials
              ? <span style={{ fontSize: size * 0.34, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "0.5px" }}>{initials}</span>
              // No photo and no name yet: a figure, not an empty circle.
              : <UserRound size={size * 0.46} color={BRAND_SUB} strokeWidth={1.6} />}
        </div>
        <button
          data-testid="profile-photo-edit"
          onClick={() => input.current?.click()}
          aria-label={src ? "Change profile photo" : "Add profile photo"}
          style={{
            position: "absolute", right: -3, bottom: -3, width: 22, height: 22, borderRadius: "50%",
            background: "#fff", border: `1px solid ${BORDER}`, cursor: "pointer",
            display: "grid", placeItems: "center", boxShadow: "0 2px 6px -2px rgba(10,22,21,0.3)",
          }}
        >
          <Pencil size={11} color={BRAND.tropicalForest} />
        </button>
        <input ref={input} type="file" accept="image/*" onChange={read} style={{ display: "none" }} />
      </div>

      <div style={{ minWidth: 0 }}>
        <button
          data-testid="profile-photo-action"
          onClick={() => input.current?.click()}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, fontWeight: 600, color: BRAND.sunsetFuchsia, display: "block",
          }}
        >
          {src ? "Change photo" : "Add a photo"}
        </button>
        {photo ? (
          <button
            data-testid="profile-photo-remove"
            onClick={onRemove}
            style={{
              background: "none", border: "none", padding: "3px 0 0", cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, color: BRAND_SUB, display: "inline-flex", alignItems: "center", gap: 4,
            }}
          >
            <Trash2 size={12} /> Remove
          </button>
        ) : (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: BRAND_SUB }}>Optional</p>
        )}
      </div>
    </div>
  );
}
