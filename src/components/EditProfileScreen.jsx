import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check } from "lucide-react";
import { BRAND, BRAND_TINT, FONT } from "../data/brand";
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
// against. Name and photo stay open: those change in real life.

const GENDERS = ["Female", "Male", "Prefer not to say"];
// A stand-in portrait so the photo slot reads as a photo slot. Replaced by
// whatever the traveller uploads, and by their real picture once we hold one.

export default function EditProfileScreen({ base, onClose }) {
  const { values, saveProfile, isLocked, track } = useProfile();
  const [saved, setSaved] = useState(false);
  const [blurred, setBlurred] = useState({});

  const initial = useMemo(() => ({
    name: values.name || base?.name || "",
    email: values.email || "",
    dob: toDMY(values.dob),
    anniversary: toDMY(values.anniversary),
    gender: values.gender || "",
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
  // Available whether or not anything has been touched: a profile screen with a
  // dead button reads as broken, and this one opens on both an empty profile
  // and a filled one.
  const canSave = !blocked;

  const phone = base ? `${base.countryCode || "+91"} ${(base.phone || "").replace(/(\d{5})(\d{5})/, "$1 $2")}` : "";

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
        <SectionCard title="Basic information">
          <div style={{ margin: "0 0 16px" }}>
            <PhotoPicker
              photo={form.photo}
              name={form.name}
              onPick={(url, fileName) => { set("photo")(url); track("profile_photo_added", { source: "profile", file: fileName }); }}
              onRemove={() => { set("photo")(""); track("profile_photo_removed", { source: "profile" }); }}
            />
          </div>

          <Field label="Name" testId="profile-name"
            value={form.name} onChange={set("name")} placeholder="Your name" />

          <Field label="Phone number" testId="profile-phone"
            value={phone} onChange={() => {}} disabled noteIcon
            disabledNote="Your account is linked to this number, so it cannot be changed." />

          <Field label="Email" testId="profile-email" type="email"
            value={form.email} onChange={set("email")} onBlur={blur("email")} placeholder="you@email.com"
            error={errors.email} />

          <Field label="Birthday" testId="profile-dob" inputMode="numeric" maxLength={10}
            value={form.dob} onChange={(v) => set("dob")(maskDate(v))} onBlur={blur("dob")} placeholder="DD / MM / YYYY"
            error={errors.dob} locked={isLocked("dob")} noteIcon
            lockNote="The birthday linked to your account cannot be modified." />
        </SectionCard>

        <SectionCard title="Additional details (optional)">
          <SelectField label="Gender" testId="profile-gender"
            value={form.gender} onChange={set("gender")} options={GENDERS}
            placeholder="Select" />

          <Field label="Anniversary" testId="profile-anniversary" inputMode="numeric" maxLength={10}
            value={form.anniversary} onChange={(v) => set("anniversary")(maskDate(v))} onBlur={blur("anniversary")} placeholder="DD / MM / YYYY"
            error={errors.anniversary} />

        </SectionCard>

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
          disabled={!canSave}
          style={{
            width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
            background: saved ? BRAND_TINT.lagoonBliss : canSave ? BRAND.sunsetFuchsia : "#EAE6E3",
            color: saved ? BRAND.lagoonBliss : canSave ? "#fff" : "#A6B6B4",
            fontSize: 15.5, fontWeight: 600, fontFamily: "inherit",
            cursor: canSave ? "pointer" : "not-allowed",
            boxShadow: canSave && !saved ? `0 8px 22px -8px ${BRAND.sunsetFuchsia}88` : "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.18s ease, color 0.18s ease",
          }}
        >
          {saved ? <><Check size={17} /> Saved</> : "Update profile"}
        </button>
      </div>

    </div>
  );

  return frame ? createPortal(content, frame) : content;
}
