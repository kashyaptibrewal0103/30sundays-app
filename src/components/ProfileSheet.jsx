import { useEffect, useRef, useState } from "react";
import { X as XIcon, Mail, Gift, Heart, Check } from "lucide-react";
import { BRAND, BRAND_TINT, BRAND_SUB, FONT } from "../data/brand";
import { useProfile, maskDate, dateError, emailError } from "../data/profile";
import { Field } from "./ProfileFields";

// ─── The home sheet ───
//
// One ask, three fields, all of them optional. It goes up on the home screen
// because that is where everybody already is, and it takes the three things an
// account cannot run campaigns without: a way to reach you, and the two dates
// worth reaching you on.
//
// Nothing here blocks anything. "I'll do it later" is a real answer, and the
// profile screen holds the same fields for whoever takes it.

export default function ProfileSheet({ source = "home", onClose }) {
  const { values, saveProfile, isLocked, track } = useProfile();
  const [email, setEmail] = useState(values.email || "");
  const [dob, setDob] = useState(values.dob || "");
  const [anniversary, setAnniversary] = useState(values.anniversary || "");
  const [blurred, setBlurred] = useState({});
  const [done, setDone] = useState(false);
  const [closing, setClosing] = useState(false);
  const announced = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!announced.current) {
      announced.current = true;
      track("profile_prompt_shown", { source });
    }
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = (reason) => {
    setClosing(true);
    timer.current = setTimeout(onClose, 210);
    if (reason) track("profile_prompt_dismissed", { source, reason });
  };

  // A wrong value says so while it is being typed. The save button greys out
  // on an invalid field, so waiting for a tap on it to explain why would leave
  // the traveller pressing a dead button with nothing to go on.
  const blur = (k) => () => setBlurred((b) => ({ ...b, [k]: true }));
  const ready = (k, v) => blurred[k] || (k !== "email" && v.length === 10);
  const errors = {
    email: ready("email", email) ? emailError(email) : "",
    dob: ready("dob", dob) ? dateError(dob, { label: "birthday" }) : "",
    anniversary: ready("anniversary", anniversary) ? dateError(anniversary, { label: "anniversary" }) : "",
  };
  const filled = [email, dob, anniversary].filter(Boolean).length;
  const blocked = !!(emailError(email) || dateError(dob) || dateError(anniversary));
  const canSave = filled > 0 && !blocked;

  const save = () => {
    setBlurred({ email: true, dob: true, anniversary: true });
    if (!canSave) return;
    const given = { email, dob, anniversary };
    saveProfile(given);
    track("profile_prompt_saved", {
      source,
      fields: Object.entries(given).filter(([, v]) => v).map(([k]) => k),
    });
    setDone(true);
    timer.current = setTimeout(() => close(), 1900);
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 380, fontFamily: FONT.primary,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <style>{`
        @keyframes profRise { from { opacity:0; transform:translateY(9px) } to { opacity:1; transform:none } }
        @keyframes profTick { from { opacity:0; transform:scale(0.7) } to { opacity:1; transform:scale(1) } }
      `}</style>

      <div
        onClick={() => close("backdrop")}
        style={{
          position: "absolute", inset: 0, background: "rgba(10,22,21,0.5)",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          animation: closing ? "fadeOutBg 0.2s ease-out forwards" : "fadeInBg 0.24s ease-out",
        }}
      />

      <div style={{
        position: "relative", background: "#fff", borderRadius: "26px 26px 0 0",
        boxShadow: "0 -18px 50px -20px rgba(10,22,21,0.4)",
        animation: closing ? "sheetSlideDown 0.21s ease-in forwards" : "sheetSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
        maxHeight: "94%", overflowY: "auto", overflowX: "hidden",
      }} className="hide-scrollbar">

        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 250, pointerEvents: "none",
          background: [
            `radial-gradient(120% 80% at 88% -10%, ${BRAND.goldenHour}24 0%, transparent 60%)`,
            `radial-gradient(110% 90% at 8% -20%, ${BRAND.sunsetFuchsia}22 0%, transparent 62%)`,
            `linear-gradient(180deg, ${BRAND_TINT.sunsetFuchsia}CC 0%, rgba(255,255,255,0) 100%)`,
          ].join(", "),
        }} />

        <div style={{ position: "relative", padding: "10px 22px calc(18px + env(safe-area-inset-bottom))" }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: "#D8D3CF", margin: "0 auto 6px" }} />

          {!done && (
            <button
              data-testid="profile-sheet-close"
              onClick={() => close("x")}
              aria-label="Close"
              style={{ position: "absolute", right: 16, top: 14, background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}
            >
              <XIcon size={19} color="#A6B6B4" />
            </button>
          )}

          {done ? (
            <div style={{ textAlign: "center", padding: "18px 0 8px", animation: "profRise 0.3s ease-out" }}>
              <div style={{
                width: 62, height: 62, borderRadius: "50%", background: BRAND_TINT.lagoonBliss,
                display: "grid", placeItems: "center", margin: "0 auto 16px",
                animation: "profTick 0.34s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                <Check size={30} color={BRAND.lagoonBliss} strokeWidth={2.6} />
              </div>
              <h3 style={{ margin: 0, fontSize: 21, fontWeight: 600, color: BRAND.tropicalForest, letterSpacing: "-0.3px" }}>
                Noted, thank you
              </h3>
              <p style={{ margin: "8px 0 0", fontSize: 13.5, color: BRAND_SUB, lineHeight: "20px" }}>
                We will be in touch on the days that matter.
              </p>
            </div>
          ) : (
            <div style={{ paddingTop: 12, animation: "profRise 0.3s ease-out" }}>
              <h3 style={{
                margin: 0, fontSize: 24, fontWeight: 600, color: BRAND.tropicalForest,
                lineHeight: 1.22, letterSpacing: "-0.5px", maxWidth: "88%",
              }}>
                Let us celebrate{" "}
                <span style={{ position: "relative", display: "inline-block", color: BRAND.sunsetFuchsia }}>
                  you
                  <svg aria-hidden="true" viewBox="0 0 84 10" preserveAspectRatio="none"
                    style={{ position: "absolute", left: -2, right: -2, bottom: -5, width: "calc(100% + 4px)", height: 7 }}>
                    <path d="M2 7.2 C 22 2.4, 58 2.0, 82 5.4" fill="none" strokeLinecap="round"
                      stroke={BRAND.sunsetFuchsia} strokeWidth="3" opacity="0.38" />
                  </svg>
                </span>
              </h3>
              <p style={{ margin: "13px 0 24px", fontSize: 13.5, color: BRAND_SUB, lineHeight: "20px" }}>
                Complete your profile so that we can surprise you on your special days.
              </p>

              <div style={{ animation: "profRise 0.34s ease-out 0.04s both" }}>
              <Field
                label="Email ID" testId="sheet-email" icon={Mail} type="email"
                value={email} onChange={(v) => setEmail(v)} onBlur={blur("email")}
                placeholder="you@email.com" error={errors.email}
                locked={isLocked("email")} lockNote="Saved already"
              />
              </div>
              <div style={{ animation: "profRise 0.34s ease-out 0.1s both" }}>
              <Field
                label="Birthday" testId="sheet-dob" icon={Gift} inputMode="numeric" maxLength={10}
                value={dob} onChange={(v) => setDob(maskDate(v))} onBlur={blur("dob")}
                placeholder="DD / MM / YYYY" error={errors.dob}
                locked={isLocked("dob")} lockNote="Saved already"
              />
              </div>
              <div style={{ animation: "profRise 0.34s ease-out 0.16s both" }}>
              <Field
                label="Anniversary" testId="sheet-anniversary" icon={Heart} inputMode="numeric" maxLength={10}
                value={anniversary} onChange={(v) => setAnniversary(maskDate(v))} onBlur={blur("anniversary")}
                placeholder="DD / MM / YYYY" error={errors.anniversary}
                locked={isLocked("anniversary")} lockNote="Saved already"
              />
              </div>

              <div style={{ height: 6 }} />

              <button
                data-testid="profile-sheet-save"
                onClick={save}
                disabled={!canSave}
                style={{
                  width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
                  background: canSave
                    ? `linear-gradient(135deg, ${BRAND.sunsetFuchsia} 0%, #D1004A 100%)`
                    : "#EAE6E3",
                  color: canSave ? "#fff" : "#A6B6B4",
                  fontSize: 15.5, fontWeight: 600, fontFamily: "inherit", letterSpacing: "-0.1px",
                  cursor: canSave ? "pointer" : "not-allowed",
                  boxShadow: canSave ? `0 10px 26px -10px ${BRAND.sunsetFuchsia}AA` : "none",
                  transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
                }}
              >
                Update profile
              </button>
              <button
                data-testid="profile-sheet-later"
                onClick={() => close("later")}
                style={{
                  width: "100%", padding: "13px 0", background: "none", border: "none",
                  fontSize: 14, fontWeight: 600, color: BRAND_SUB, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {"I'll do it later"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
