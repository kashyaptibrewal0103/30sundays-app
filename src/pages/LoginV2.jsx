import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Check, Loader2, MessageSquareText, X as XIcon } from "lucide-react";

// Official WhatsApp logo asset.
const WhatsAppIcon = ({ size = 20 }) => (
  <img
    src="/whatsapp.webp"
    alt=""
    width={size}
    height={size}
    style={{ display: "block", flexShrink: 0 }}
  />
);

// The palm-and-sun mark on its own: the left of the full lockup, cropped.
const LogoMark = ({ height = 96 }) => (
  <div style={{ width: height * 1.02, height, overflow: "hidden", margin: "0 auto" }}>
    <img src="/logo.png" alt="30 Sundays" style={{ height: height * 1.12, width: "auto", maxWidth: "none", display: "block", marginTop: -height * 0.06 }} />
  </div>
);

// ─── Design tokens ───
const T = {
  coral: "#E31B53",
  blush: "#FFE4E8",
  navy: "#181D27",
  muted: "#717680",
  line: "#E4E4E7",
  field: "#F4F4F5",
  ok: "#2E7D32",
};

// ─── Country codes ───
const countryCodes = [
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳", digits: 10 },
  { code: "+1", country: "US", name: "United States", flag: "🇺🇸", digits: 10 },
  { code: "+44", country: "UK", name: "United Kingdom", flag: "🇬🇧", digits: 10 },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺", digits: 9 },
  { code: "+65", country: "SG", name: "Singapore", flag: "🇸🇬", digits: 8 },
  { code: "+971", country: "AE", name: "UAE", flag: "🇦🇪", digits: 9 },
];

const CHANNEL = {
  sms: { label: "SMS", sentBy: "by SMS" },
  whatsapp: { label: "WhatsApp", sentBy: "on WhatsApp" },
};

const RESEND_SECONDS = 60;
const OTP_LEN = 6;
const emptyOtp = () => Array(OTP_LEN).fill("");

// 9971019664 -> 99710 19664
const fmtPhone = (p) => (p.length === 10 ? `${p.slice(0, 5)} ${p.slice(5)}` : p);

// ─── Main screen ───
// The code goes by SMS first. WhatsApp is the second way, offered next to it
// on the number screen and again on every resend.
//
// Skip is shown only on the very first screen of the app (showSkip). Reached
// from the trip wizard, a lead form or Account, logging in is the point, so
// there is nothing to skip to.
//
// Props (all optional - defaults make this work as a standalone /login-v2 page):
//   onComplete({ country, phone, otp, channel }) - called after OTP verifies successfully
//   showSkip                                     - first app launch only
//   onSkip()                                     - called when Skip tapped (default: navigate("/"))
//   onBack()                                     - back from the number screen (default: navigate(-1))
//   validateOtp(otpString) -> string|null        - return error string to keep on OTP screen, or null/undefined to proceed
export default function LoginV2({ onComplete, onSkip: onSkipProp, onBack: onBackProp, validateOtp, showSkip = false }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("phone"); // phone | otp
  const [country, setCountry] = useState(countryCodes[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [focusIdx, setFocusIdx] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [channel, setChannel] = useState("sms");
  const [sending, setSending] = useState(null);   // channel being sent on, while it sends
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [resentNote, setResentNote] = useState("");
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setResendTimer(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  useEffect(() => () => clearInterval(timerRef.current), []);

  const phoneValid = phone.length === country.digits;

  const handlePhone = (v) => setPhone(v.replace(/\D/g, "").slice(0, country.digits));
  // One digit per box. A whole code arriving at once (pasted, or filled in
  // from the SMS) spreads across the boxes. The last digit verifies on its
  // own; there is no button to press.
  const handleOtpChange = (i, v) => {
    const digits = v.replace(/\D/g, "");
    const next = [...otp];
    if (digits.length > 1) {
      digits.slice(0, OTP_LEN - i).split("").forEach((d, k) => { next[i + k] = d; });
    } else {
      next[i] = digits;
    }
    setOtp(next);
    if (otpError) setOtpError("");
    if (!digits) return;
    const firstEmpty = next.findIndex((d) => !d);
    if (firstEmpty === -1) { otpRefs.current[i]?.blur(); verify(next); }
    else otpRefs.current[Math.min(firstEmpty, OTP_LEN - 1)]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  // Send (or resend) the code on a channel. A brief wait so the moment of
  // commitment feels real, then the code screen with a fresh countdown.
  const send = (ch) => {
    if (!phoneValid || sending) return;
    setSending(ch);
    setTimeout(() => {
      setSending(null);
      setChannel(ch);
      setOtp(emptyOtp());
      setOtpError("");
      if (phase === "otp") {
        setResentNote(`New code sent ${CHANNEL[ch].sentBy}`);
        setTimeout(() => setResentNote(""), 2600);
        otpRefs.current[0]?.focus();
      }
      setPhase("otp");
      startTimer();
    }, phase === "otp" ? 900 : 1400);
  };

  const verify = (code) => {
    const otpStr = code.join("");
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      const err = validateOtp ? validateOtp(otpStr) : null;
      if (err) {
        setOtpError(err);
        setOtp(emptyOtp());
        otpRefs.current[0]?.focus();
        return;
      }
      setOtpError("");
      if (onComplete) onComplete({ country, phone, otp: otpStr, channel });
      else console.log("[LoginV2] Verify OTP", otpStr);
    }, 700);
  };

  const skip = () => (onSkipProp ? onSkipProp() : navigate("/"));
  const back = () => {
    if (phase === "otp") { setPhase("phone"); clearInterval(timerRef.current); return; }
    if (onBackProp) onBackProp(); else navigate(-1);
  };

  return (
    <div data-testid="login-screen" style={{
      position: "absolute", inset: 0, zIndex: 40,
      display: "flex", flexDirection: "column", overflow: "hidden",
      color: T.navy,
      // The app's soft morning wash: peach in one corner, pink in the other,
      // settling to near white where the form sits.
      background: [
        "radial-gradient(120% 60% at 0% 0%, rgba(253,220,190,0.55) 0%, rgba(253,220,190,0) 55%)",
        "radial-gradient(110% 55% at 100% 0%, rgba(255,214,228,0.75) 0%, rgba(255,214,228,0) 60%)",
        "linear-gradient(180deg, #FFFBFA 0%, #F7F6F5 100%)",
      ].join(", "),
    }}>
      {/* Top bar */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px 0", paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
      }}>
        <button onClick={back} aria-label="Back" style={{ width: 40, height: 40, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
          <ChevronLeft size={28} color={T.navy} strokeWidth={2} />
        </button>
        {showSkip && phase === "phone" && (
          <button onClick={skip} data-testid="login-skip" style={{
            background: "transparent", border: "none", padding: "8px 8px",
            fontSize: 14, fontWeight: 600, color: T.muted, cursor: "pointer", fontFamily: "inherit",
          }}>
            Skip
          </button>
        )}
      </div>

      {/* ─── Phone number ─── */}
      {phase === "phone" && (
        <>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 28px" }}>
            <div style={{ animation: "lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) both" }}>
              <LogoMark height={88} />
            </div>
            <h1 style={{ margin: "26px 0 0", fontSize: 25, fontWeight: 800, letterSpacing: -0.4, color: T.navy, animation: "lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) 80ms both" }}>
              Let's plan your getaway
            </h1>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.5, color: T.muted, maxWidth: 320, animation: "lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) 140ms both" }}>
              Your number helps our travel consultant reach you with a personalised itinerary
            </p>
          </div>

          <div style={{ flexShrink: 0, padding: "0 18px 28px" }}>
            {/* Country code + number, one field */}
            <div style={{
              display: "flex", alignItems: "center", height: 58,
              background: T.field, borderRadius: 18,
              border: `1.5px solid ${phoneValid ? T.ok : T.line}`,
              transition: "border-color 160ms ease",
            }}>
              <button
                onClick={() => setCountryOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 7, height: "100%", padding: "0 12px 0 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                <span style={{ fontSize: 17 }}>{country.flag}</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: T.navy }}>{country.code}</span>
                <ChevronDown size={15} color={T.navy} strokeWidth={2.4} />
              </button>
              <span style={{ width: 1, height: 26, background: T.line }} />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={country.digits}
                placeholder="Mobile number"
                value={phone}
                disabled={!!sending}
                onChange={(e) => handlePhone(e.target.value)}
                data-testid="login-phone"
                style={{
                  flex: 1, minWidth: 0, height: "100%", padding: "0 12px 0 14px",
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 18, fontWeight: 500, letterSpacing: 1, color: T.navy, fontFamily: "inherit",
                }}
              />
              {phoneValid && <Check size={20} color={T.ok} strokeWidth={2.4} style={{ marginRight: 16, flexShrink: 0 }} />}
            </div>

            {/* Primary: SMS */}
            <button
              onClick={() => send("sms")}
              disabled={!phoneValid || !!sending}
              data-testid="send-otp-sms"
              style={{
                marginTop: 14, width: "100%", height: 54, borderRadius: 999,
                background: T.coral, color: "#fff", border: "none",
                fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                cursor: phoneValid && !sending ? "pointer" : "default",
                opacity: phoneValid || sending === "sms" ? 1 : 0.45,
                boxShadow: phoneValid ? "0 8px 20px rgba(227,27,83,0.28)" : "none",
                transition: "opacity 200ms ease, box-shadow 200ms ease",
              }}
            >
              {sending === "sms"
                ? <><Loader2 size={17} className="lv2-spin" /> Sending OTP...</>
                : <>Send OTP <MessageSquareText size={18} /></>}
            </button>

            {/* Secondary: WhatsApp */}
            <button
              onClick={() => send("whatsapp")}
              disabled={!phoneValid || !!sending}
              data-testid="send-otp-whatsapp"
              style={{
                marginTop: 10, width: "100%", height: 50, borderRadius: 999,
                background: "#fff", color: T.navy, border: `1px solid ${T.line}`,
                fontSize: 14.5, fontWeight: 600, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: phoneValid && !sending ? "pointer" : "default",
                opacity: phoneValid || sending === "whatsapp" ? 1 : 0.5,
                transition: "opacity 200ms ease",
              }}
            >
              {sending === "whatsapp"
                ? <><Loader2 size={16} className="lv2-spin" /> Sending on WhatsApp...</>
                : <><WhatsAppIcon size={18} /> Get OTP on WhatsApp</>}
            </button>

            <p style={{ margin: "14px 0 0", fontSize: 12.5, color: T.muted, textAlign: "center" }}>
              We'll send a 6-digit code by SMS
            </p>
          </div>
        </>
      )}

      {/* ─── Code ─── */}
      {phase === "otp" && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "6px 18px 28px", overflowY: "auto" }}>
          <div style={{ marginTop: 36, animation: "lv2Up 0.5s cubic-bezier(0.4,0,0.2,1) both" }}>
            <LogoMark height={88} />
          </div>
          <h2 style={{ fontSize: 25, fontWeight: 800, color: T.navy, margin: "28px 0 0", letterSpacing: -0.4 }}>
            Verify your number
          </h2>
          <p style={{ fontSize: 14.5, color: T.muted, margin: "10px 0 0", lineHeight: 1.5, maxWidth: 330 }}>
            {channel === "whatsapp"
              ? "We've sent you a verification code to your WhatsApp number"
              : "We've sent you a verification code by SMS to"}{" "}
            <span style={{ fontWeight: 700, color: T.navy, whiteSpace: "nowrap" }}>{country.code} {fmtPhone(phone)}</span>
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 30, width: "100%" }}>
            {otp.map((d, i) => {
              const on = focusIdx === i;
              return (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="tel"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  value={d}
                  autoFocus={i === 0}
                  onFocus={() => setFocusIdx(i)}
                  onBlur={() => setFocusIdx((f) => (f === i ? -1 : f))}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  data-testid={`otp-${i}`}
                  style={{
                    flex: 1, minWidth: 0, height: 60, padding: 0, boxSizing: "border-box",
                    background: otpError ? "#FEF3F2" : on ? "#FFF5F7" : "rgba(255,255,255,0.6)",
                    border: `1.5px solid ${otpError ? "#B42318" : on ? T.coral : T.line}`,
                    borderRadius: 14, textAlign: "center",
                    fontSize: 22, fontWeight: 700, color: T.navy, fontFamily: "inherit",
                    outline: "none", transition: "border-color 160ms, background 160ms",
                  }}
                />
              );
            })}
          </div>

          {otpError && (
            <p style={{ fontSize: 13, color: "#B42318", margin: "12px 0 0", fontWeight: 600 }}>{otpError}</p>
          )}
          {verifying && (
            <p style={{ fontSize: 13, color: T.muted, margin: "12px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={14} className="lv2-spin" /> Verifying...
            </p>
          )}

          {/* Resend: a countdown, then both ways to get a new code */}
          <div style={{ marginTop: 34, width: "100%" }} data-testid="otp-resend">
            {/* Both ways are on screen from the start, so nobody waits a
                minute to find out WhatsApp was an option. They wake up when
                the countdown ends. */}
            <p style={{ margin: 0, fontSize: 14.5, color: T.navy }}>
              Didn't receive?{" "}
              {resendTimer > 0
                ? <span style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>Resend in {resendTimer}s</span>
                : "Get a new code on"}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <ResendChip onClick={() => send("sms")} busy={sending === "sms"} disabled={!!sending || resendTimer > 0} testId="resend-sms">
                <MessageSquareText size={17} color={T.navy} /> SMS
              </ResendChip>
              <ResendChip onClick={() => send("whatsapp")} busy={sending === "whatsapp"} disabled={!!sending || resendTimer > 0} testId="resend-whatsapp">
                <WhatsAppIcon size={17} /> WhatsApp
              </ResendChip>
            </div>
            {resentNote && (
              <p style={{ margin: "12px 0 0", fontSize: 13, fontWeight: 600, color: T.ok, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <Check size={14} strokeWidth={2.6} /> {resentNote}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Country picker */}
      {countryOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setCountryOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)" }} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "20px 20px 0 0", padding: "10px 0 18px" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "6px 16px 10px" }}>
              <p style={{ flex: 1, margin: 0, fontSize: 16, fontWeight: 800, color: T.navy }}>Country code</p>
              <button onClick={() => setCountryOpen(false)} aria-label="Close" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: T.field, display: "grid", placeItems: "center", cursor: "pointer" }}>
                <XIcon size={15} color={T.muted} />
              </button>
            </div>
            {countryCodes.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCountry(c); setCountryOpen(false); setPhone(""); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "transparent", border: "none", borderTop: `1px solid ${T.field}`, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
              >
                <span style={{ fontSize: 18 }}>{c.flag}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: c.code === country.code ? 700 : 500, color: T.navy }}>{c.name}</span>
                <span style={{ fontSize: 13, color: T.muted }}>{c.code}</span>
                {c.code === country.code && <Check size={16} color={T.coral} />}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes lv2Up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lv2Spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .lv2-spin { animation: lv2Spin 0.9s linear infinite; }
      `}</style>
    </div>
  );
}

function ResendChip({ onClick, busy, disabled, testId, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        flex: 1, height: 44, borderRadius: 999,
        background: "#fff", border: `1px solid ${T.line}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        fontSize: 14, fontWeight: 600, color: T.navy, fontFamily: "inherit",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled && !busy ? 0.45 : 1,
        transition: "opacity 200ms ease",
      }}
    >
      {busy ? <><Loader2 size={15} className="lv2-spin" /> Sending...</> : children}
    </button>
  );
}
