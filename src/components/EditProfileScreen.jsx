import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, Info, Check, Trash2, AlertTriangle, Sparkles,
} from "lucide-react";
import { BRAND, BRAND_TINT, BRAND_SUB, FONT } from "../data/brand";
import { useProfile, maskDate, dateError, emailError, toDMY } from "../data/profile";
import { Field, SelectField, SectionCard, PhotoPicker } from "./ProfileFields";

// ─── Edit profile ───
//
// The same fields the home sheet asks for, plus the ones nobody would fill in
// on a sheet. Everything is optional except the phone number, which is the
// account itself and so cannot be touched at all.
//
// A field that has been given locks. Birthday and anniversary drive dated
// campaigns, and a date that keeps moving is one we cannot send anything
// against. Name, photo and city stay open: those change in real life.

const GENDERS = ["Female", "Male", "Prefer not to say"];
const LOCK_NOTE = "Saved. Contact support if this needs to change.";

export default function EditProfileScreen({ base, onClose, onDelete }) {
  const { values, saveProfile, isLocked, track } = useProfile();
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [blurred, setBlurred] = useState({});

  const initial = useMemo(() => ({
    name: values.name || base?.name || "",
    email: values.email || "",
    dob: toDMY(values.dob),
    anniversary: toDMY(values.anniversary),
    gender: values.gender || "",
    city: values.city || "",
    photo: values.photo || "",
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [values, base]);

  const [form, setForm] = useState(initial);
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  // Errors show while typing, not on submit: an invalid field greys out the
  // save button, so a tap on it can never be what explains the problem.
  const blur = (k) => () => setBlurred((b) => ({ ...b, [k]: true }));
  const ready = (k, v) => blurred[k] || (k !== "email" && v.length === 10);
  const errors = {
    email: ready("email", form.email) ? emailError(form.email) : "",
    dob: ready("dob", form.dob) ? dateError(form.dob, { label: "birthday" }) : "",
    anniversary: ready("anniversary", form.anniversary) ? dateError(form.anniversary, { label: "anniversary" }) : "",
  };
  const blocked = !!(emailError(form.email) || dateError(form.dob) || dateError(form.anniversary));
  const changed = Object.keys(initial).filter((k) => form[k] !== initial[k]);
  const canSave = changed.length > 0 && !blocked;

  const phone = base ? `${base.countryCode || "+91"} ${(base.phone || "").replace(/(\d{5})(\d{5})/, "$1 $2")}` : "";
  const missing = ["email", "dob", "anniversary"].filter((k) => !form[k]);

  const submit = () => {
    setBlurred({ email: true, dob: true, anniversary: true });
    if (!canSave) return;
    saveProfile(form);
    track("profile_updated", { source: "profile", fields: changed });
    setSaved(true);
  };

  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const content = (
    <div style={{
      position: isMobile ? "fixed" : "absolute", inset: 0, zIndex: 300,
      background: "#FBFAF9", display: "flex", flexDirection: "column", fontFamily: FONT.primary,
      ...(isMobile ? {} : { borderRadius: 44, overflow: "hidden" }),
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "16px",
        background: "#fff", borderBottom: "1px solid #EFEBE8", flexShrink: 0,
      }}>
        <button onClick={onClose} aria-label="Back" data-testid="profile-back"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}>
          <ArrowLeft size={22} color={BRAND.tropicalForest} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: BRAND.tropicalForest, margin: 0, letterSpacing: "-0.3px" }}>
          Edit profile
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 120px" }} className="hide-scrollbar">
        {/* What we are still missing, and why it is worth giving */}
        {missing.length > 0 && (
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14,
            background: BRAND_TINT.sunsetFuchsia, border: `1px solid ${BRAND.sunsetFuchsia}22`,
            borderRadius: 14, padding: "12px 14px",
          }}>
            <Sparkles size={16} color={BRAND.sunsetFuchsia} style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 12.5, color: BRAND.tropicalForest, lineHeight: "18px" }}>
              {missing.includes("email") && missing.length === 1
                ? "Add your email so invoices and trip updates reach you."
                : "Add your dates and we will plan something for your birthday and your anniversary."}
            </p>
          </div>
        )}

        <SectionCard title="Basic information" sub="Only the phone number is required. The rest is yours to give.">
          <div style={{ margin: "0 0 22px" }}>
            <PhotoPicker
              photo={form.photo}
              name={form.name}
              onPick={(url, fileName) => { set("photo")(url); track("profile_photo_added", { source: "profile", file: fileName }); }}
              onRemove={() => { set("photo")(""); track("profile_photo_removed", { source: "profile" }); }}
            />
          </div>

          <Field label="Name" testId="profile-name"
            value={form.name} onChange={set("name")} placeholder="Your name" />

          <Field label="Phone number" testId="profile-phone" tag="Required"
            value={phone} onChange={() => {}} disabled
            disabledNote="Your account is linked to this number, so it cannot be changed." />

          <Field label="Email" testId="profile-email" type="email"
            value={form.email} onChange={set("email")} onBlur={blur("email")} placeholder="you@email.com"
            error={errors.email} locked={isLocked("email")} lockNote={LOCK_NOTE} />

          <Field label="Birthday" testId="profile-dob" inputMode="numeric" maxLength={10}
            value={form.dob} onChange={(v) => set("dob")(maskDate(v))} onBlur={blur("dob")} placeholder="DD / MM / YYYY"
            error={errors.dob} locked={isLocked("dob")} lockNote={LOCK_NOTE} />
        </SectionCard>

        <SectionCard title="Additional details (optional)" sub="They only make what we send you better.">
          <SelectField label="Gender" testId="profile-gender"
            value={form.gender} onChange={set("gender")} options={GENDERS}
            placeholder="Select" locked={isLocked("gender")} lockNote={LOCK_NOTE} />

          <Field label="Anniversary" testId="profile-anniversary" inputMode="numeric" maxLength={10}
            value={form.anniversary} onChange={(v) => set("anniversary")(maskDate(v))} onBlur={blur("anniversary")} placeholder="DD / MM / YYYY"
            error={errors.anniversary} locked={isLocked("anniversary")} lockNote={LOCK_NOTE} />

          <Field label="City of residence" testId="profile-city"
            value={form.city} onChange={set("city")} placeholder="City, Country" />
        </SectionCard>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "2px 4px 18px" }}>
          <Info size={13} color="#8FA3A1" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 11.5, color: BRAND_SUB, lineHeight: "17px" }}>
            Your email and dates are saved once, so check them before you update.
          </p>
        </div>

        {onDelete && (
          <>
            <button
              data-testid="profile-delete"
              onClick={() => setConfirm(true)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "14px 0", borderRadius: 14,
                background: "#fff", border: "1px solid #FDA29B", cursor: "pointer", fontFamily: "inherit",
                color: "#D92D20", fontSize: 14.5, fontWeight: 600,
              }}
            >
              <Trash2 size={16} /> Delete account
            </button>
            <p style={{ fontSize: 11.5, color: "#8FA3A1", textAlign: "center", margin: "10px 4px 0", lineHeight: "16px" }}>
              Deleting your account permanently removes your trips, saved itineraries and data.
            </p>
          </>
        )}
      </div>

      {/* Sticky save */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        padding: "12px 16px calc(14px + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.94)", backdropFilter: "blur(10px)",
        borderTop: "1px solid #EFEBE8",
      }}>
        <button
          data-testid="profile-update"
          onClick={submit}
          disabled={!canSave && !saved}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
            background: saved ? BRAND_TINT.lagoonBliss : canSave ? BRAND.sunsetFuchsia : "#EAE6E3",
            color: saved ? BRAND.lagoonBliss : canSave ? "#fff" : "#A6B6B4",
            fontSize: 15.5, fontWeight: 600, fontFamily: "inherit",
            cursor: canSave ? "pointer" : "default",
            boxShadow: canSave && !saved ? `0 8px 22px -8px ${BRAND.sunsetFuchsia}88` : "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.18s ease, color 0.18s ease",
          }}
        >
          {saved ? <><Check size={17} /> Saved</> : "Update profile"}
        </button>
      </div>

      {/* Delete confirm */}
      {confirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 320 }}>
          <div onClick={() => setConfirm(false)} style={{ position: "absolute", inset: 0, background: "rgba(10,22,21,0.5)" }} />
          <div style={{
            position: "absolute", left: 20, right: 20, top: "50%", transform: "translateY(-50%)",
            background: "#fff", borderRadius: 20, padding: "22px 20px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.25)", textAlign: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%", background: "#FEF3F2",
              border: "1px solid #FDA29B", display: "grid", placeItems: "center", margin: "0 auto 14px",
            }}>
              <AlertTriangle size={26} color="#D92D20" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: BRAND.tropicalForest, margin: "0 0 6px" }}>Delete account?</h3>
            <p style={{ fontSize: 13.5, color: BRAND_SUB, margin: "0 0 20px", lineHeight: "19px" }}>
              This is permanent and cannot be undone. All your trips and saved data will be erased.
            </p>
            <button onClick={onDelete} style={{
              width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
              background: "#D92D20", color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", marginBottom: 8,
            }}>Delete my account</button>
            <button onClick={() => setConfirm(false)} style={{
              width: "100%", padding: "13px 0", borderRadius: 14, border: "1px solid #E7E2DE",
              background: "#fff", color: BRAND.tropicalForest, fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  return frame ? createPortal(content, frame) : content;
}
