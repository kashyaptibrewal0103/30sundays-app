import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Check, Loader2, MessageSquareText, MessageCircle, Delete, X as XIcon } from "lucide-react";

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
  err: "#B42318",
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

export const RESEND_SECONDS = 60;
const OTP_LEN = 6;
const MAX_WRONG = 5;   // wrong codes before a new one is needed
const MAX_SENDS = 5;   // the first code plus four resends, then a wait
const emptyOtp = () => Array(OTP_LEN).fill("");
const firstEmpty = (otp) => otp.findIndex((d) => !d);

// The number the demo phone "knows" as its own, offered above the keyboard.
const DEMO_OWN_NUMBER = "9971019664";

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
// demoKeyboard draws a phone keyboard inside the screen and plays the code
// arriving by SMS or WhatsApp, so the keyboard, autofill and resend cases can
// be tried in a browser. The real keyboard never opens in this mode.
//
// Props (all optional - defaults make this work as a standalone /login-v2 page):
//   onComplete({ country, phone, otp, channel, method }) - called after OTP verifies successfully
//   showSkip                                     - first app launch only
//   onSkip()                                     - called when Skip tapped (default: navigate("/"))
//   onBack()                                     - back from the number screen (default: navigate(-1))
//   validateOtp(otpString) -> string|null        - return error string to keep on OTP screen, or null/undefined to proceed
//   demoKeyboard                                 - the in-screen keyboard and message simulation
//   initial { phase, channel, phone, timer }     - open straight on a state (demo links)
//   failWhatsApp                                 - WhatsApp can't reach the number (demo)
export default function LoginV2({ onComplete, onSkip: onSkipProp, onBack: onBackProp, validateOtp, showSkip = false, demoKeyboard = false, initial = null, failWhatsApp = false }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(initial?.phase || "phone"); // phone | otp
  const [country, setCountry] = useState(countryCodes[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [phone, setPhone] = useState(initial?.phone || "");
  const [otp, setOtp] = useState(emptyOtp);
  const [focusIdx, setFocusIdx] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [channel, setChannel] = useState(initial?.channel || "sms");
  const [sending, setSending] = useState(null);   // channel being sent on, while it sends
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [resentNote, setResentNote] = useState("");
  const [wrongTries, setWrongTries] = useState(0);
  const [sends, setSends] = useState(initial?.phase === "otp" ? 1 : 0);
  const [shake, setShake] = useState(0);
  // Demo only: the keyboard, the codes sent, and what reached the phone.
  const [kbOpen, setKbOpen] = useState(initial?.phase === "otp");
  const [smsIn, setSmsIn] = useState("");         // the latest code to arrive by SMS
  const [banner, setBanner] = useState(null);     // the notification on screen
  const [clip, setClip] = useState("");           // a code copied from WhatsApp
  const [waFailed, setWaFailed] = useState(false);
  const codesRef = useRef([]);
  const methodRef = useRef("typed");
  const otpRefs = useRef([]);
  const timerRef = useRef(null);
  const arriveRef = useRef([]);   // every message still on its way
  const bannerRef = useRef(null);
  const noteRef = useRef(null);

  // Counted from a fixed end time, not by ticks, so the countdown is right
  // after the app comes back from WhatsApp or Messages.
  const startTimer = (seconds = RESEND_SECONDS) => {
    clearInterval(timerRef.current);
    setResendTimer(seconds);
    if (seconds <= 0) return;
    const ends = Date.now() + seconds * 1000;
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((ends - Date.now()) / 1000));
      setResendTimer(left);
      if (!left) clearInterval(timerRef.current);
    }, 250);
  };
  useEffect(() => () => {
    clearInterval(timerRef.current);
    arriveRef.current.forEach(clearTimeout);
    clearTimeout(bannerRef.current);
    clearTimeout(noteRef.current);
  }, []);

  const phoneValid = phone.length === country.digits;
  const locked = wrongTries >= MAX_WRONG;
  const sendsUsed = sends >= MAX_SENDS;

  // Typed, pasted or filled in. A pasted number loses its spaces, a leading
  // country code and a leading 0.
  const handlePhone = (v) => {
    let d = v.replace(/\D/g, "");
    const cc = country.code.replace("+", "");
    if (d.length > country.digits && d.startsWith(cc)) d = d.slice(cc.length);
    if (d.length > country.digits && d.startsWith("0")) d = d.slice(1);
    setPhone(d.slice(0, country.digits));
  };

  // One digit per box. A whole code arriving at once (pasted, or filled in
  // from the SMS) spreads across the boxes. The last digit verifies on its
  // own; there is no button to press.
  const handleOtpChange = (i, v) => {
    const digits = v.replace(/\D/g, "");
    const next = [...otp];
    if (digits.length > 1) {
      methodRef.current = "autofill";
      digits.slice(0, OTP_LEN - i).split("").forEach((d, k) => { next[i + k] = d; });
    } else {
      methodRef.current = "typed";
      next[i] = digits;
    }
    setOtp(next);
    if (otpError && !locked) setOtpError("");
    if (!digits) return;
    const fe = firstEmpty(next);
    if (fe === -1) { otpRefs.current[i]?.blur(); verify(next); }
    else otpRefs.current[Math.min(fe, OTP_LEN - 1)]?.focus();
  };
  // Back clears one digit at a time, right to left.
  const handleOtpKey = (i, e) => {
    if (e.key !== "Backspace" || otp[i] || i === 0) return;
    e.preventDefault();
    const next = [...otp];
    next[i - 1] = "";
    setOtp(next);
    otpRefs.current[i - 1]?.focus();
  };
  // No gaps: a tap on any box lands on the first empty one.
  const handleOtpFocus = (i) => {
    const fe = firstEmpty(otp);
    const target = fe === -1 ? OTP_LEN - 1 : fe;
    if (i !== target) { otpRefs.current[target]?.focus(); return; }
    setFocusIdx(i);
  };

  // Demo: the message reaches the phone a moment after it is sent. One
  // already on its way still lands after a switch, the way a late SMS does.
  // A number WhatsApp can't reach gets a note instead, with SMS ready to go.
  const deliver = (ch) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    codesRef.current = [...codesRef.current, code];
    if (ch === "whatsapp" && failWhatsApp) {
      arriveRef.current.push(setTimeout(() => setWaFailed(true), 2600));
      return;
    }
    arriveRef.current.push(setTimeout(() => {
      if (ch === "sms") setSmsIn(code);
      setBanner({ channel: ch, code });
      clearTimeout(bannerRef.current);
      if (ch === "sms") bannerRef.current = setTimeout(() => setBanner(null), 5000);
    }, 1800));
  };

  const flash = (note) => {
    setResentNote(note);
    clearTimeout(noteRef.current);
    noteRef.current = setTimeout(() => setResentNote(""), 2600);
  };

  // Send (or resend) the code on a channel. A brief wait so the moment of
  // commitment feels real, then the code screen with a fresh countdown.
  const send = (ch) => {
    if (!phoneValid || sending || sendsUsed) return;
    setSending(ch);
    setTimeout(() => {
      setSending(null);
      setChannel(ch);
      setOtp(emptyOtp());
      setOtpError("");
      setWrongTries(0);
      setWaFailed(false);
      setSends((n) => n + 1);
      if (phase === "otp") {
        flash(`New code sent ${CHANNEL[ch].sentBy}`);
        otpRefs.current[0]?.focus();
      }
      setPhase("otp");
      startTimer();
      if (demoKeyboard) { setKbOpen(true); deliver(ch); }
    }, phase === "otp" ? 900 : 1400);
  };

  // Opening straight on the code screen (demo links): the code is on its way.
  useEffect(() => {
    if (initial?.phase !== "otp") return;
    startTimer(initial.timer ?? RESEND_SECONDS);
    if (demoKeyboard) deliver(initial.channel || "sms");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const verify = (code) => {
    const otpStr = code.join("");
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      // Demo: any code sent in this session works, so a late SMS after a
      // switch to WhatsApp still gets the person in.
      const err = demoKeyboard
        ? (codesRef.current.includes(otpStr) ? null : "That code isn't right. Check it and try again.")
        : (validateOtp ? validateOtp(otpStr) : null);
      if (err) {
        const tries = wrongTries + 1;
        setWrongTries(tries);
        setOtpError(tries >= MAX_WRONG ? "Too many wrong tries. Get a new code to try again." : err);
        setOtp(emptyOtp());
        setShake((s) => s + 1);
        // Out of tries: the keyboard goes down and the way forward is a new code.
        if (tries < MAX_WRONG) otpRefs.current[0]?.focus();
        else setKbOpen(false);
        return;
      }
      setOtpError("");
      setKbOpen(false);
      if (onComplete) onComplete({ country, phone, otp: otpStr, channel, method: methodRef.current });
      else console.log("[LoginV2] Verify OTP", otpStr);
    }, 700);
  };

  // ─── Demo keyboard input ───
  const pressDigit = (d) => {
    if (phase === "phone") { if (!sending) handlePhone(phone + d); return; }
    if (verifying || locked) return;
    const i = firstEmpty(otp);
    if (i === -1) return;
    const next = [...otp];
    next[i] = d;
    methodRef.current = "typed";
    setOtp(next);
    if (otpError) setOtpError("");
    if (i === OTP_LEN - 1) verify(next);
  };
  const pressDelete = () => {
    if (phase === "phone") { if (!sending) setPhone((p) => p.slice(0, -1)); return; }
    if (verifying || locked) return;
    const last = otp.map(Boolean).lastIndexOf(true);
    if (last === -1) return;
    const next = [...otp];
    next[last] = "";
    setOtp(next);
  };
  const fillCode = (code, method) => {
    if (verifying || locked) return;
    const next = code.split("").slice(0, OTP_LEN);
    methodRef.current = method;
    setOtp(next);
    setOtpError("");
    if (method === "paste") setClip("");
    verify(next);
  };
  const paste = (text) => {
    const d = text.replace(/\D/g, "");
    if (phase === "phone") { handlePhone(d); setKbOpen(true); return; }
    if (d.length >= OTP_LEN) fillCode(d.slice(0, OTP_LEN), "paste");
  };

  // A computer keyboard drives the demo too: digits, Backspace and paste.
  const live = useRef({});
  live.current = { pressDigit, pressDelete, paste };
  useEffect(() => {
    if (!demoKeyboard) return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^\d$/.test(e.key)) { setKbOpen(true); live.current.pressDigit(e.key); }
      else if (e.key === "Backspace") live.current.pressDelete();
    };
    const onPaste = (e) => live.current.paste(e.clipboardData?.getData("text") || "");
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("paste", onPaste); };
  }, [demoKeyboard]);

  // What the keyboard offers above the keys.
  let suggestion = null;
  if (demoKeyboard && phase === "phone" && !phone) {
    suggestion = { label: "From My Card", value: `${country.code} ${fmtPhone(DEMO_OWN_NUMBER)}`, use: () => handlePhone(DEMO_OWN_NUMBER) };
  } else if (demoKeyboard && phase === "otp" && !verifying && !locked) {
    if (clip) suggestion = { label: "Paste", value: clip, use: () => fillCode(clip, "paste") };
    else if (smsIn) suggestion = { label: "From Messages", value: smsIn, use: () => fillCode(smsIn, "autofill") };
  }

  const skip = () => (onSkipProp ? onSkipProp() : navigate("/"));
  const back = () => {
    if (phase === "otp") {
      setPhase("phone"); clearInterval(timerRef.current); arriveRef.current.forEach(clearTimeout); arriveRef.current = [];
      setBanner(null); setOtpError(""); setKbOpen(false);
      return;
    }
    if (onBackProp) onBackProp(); else navigate(-1);
  };

  // With the keyboard up, the logo shrinks away so the field and both ways
  // to get the code stay in view right above the keys.
  const compact = demoKeyboard && kbOpen;
  const activeBox = verifying || locked ? -1 : firstEmpty(otp);

  // A resend chip wakes when the countdown ends. SMS wakes at once if
  // WhatsApp couldn't reach the number, and both wake after too many wrong tries.
  const chipOff = (ch) => !!sending || sendsUsed || (resendTimer > 0 && !locked && !(ch === "sms" && waFailed));

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
          <div onClick={() => setKbOpen(false)} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 28px" }}>
            <div style={{ animation: "lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) both", transition: "transform 250ms ease", transform: compact ? "scale(0.62)" : "none", margin: compact ? "-18px 0" : 0 }}>
              <LogoMark height={88} />
            </div>
            <h1 style={{ margin: compact ? "14px 0 0" : "26px 0 0", fontSize: 25, fontWeight: 800, letterSpacing: -0.4, color: T.navy, animation: "lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) 80ms both" }}>
              Let's plan your getaway
            </h1>
            <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.5, color: T.muted, maxWidth: 320, animation: "lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) 140ms both" }}>
              Your number helps our travel consultant reach you with a personalised itinerary
            </p>
          </div>

          <div style={{ flexShrink: 0, padding: compact ? "0 18px 14px" : "0 18px 28px" }}>
            {/* Country code + number, one field */}
            <div style={{
              display: "flex", alignItems: "center", height: 58,
              background: T.field, borderRadius: 18,
              border: `1.5px solid ${phoneValid ? T.ok : compact ? T.navy : T.line}`,
              transition: "border-color 160ms ease",
            }}>
              <button
                onClick={() => { setKbOpen(false); setCountryOpen(true); }}
                style={{ display: "flex", alignItems: "center", gap: 7, height: "100%", padding: "0 12px 0 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                <span style={{ fontSize: 17 }}>{country.flag}</span>
                <span style={{ fontSize: 16, fontWeight: 500, color: T.navy }}>{country.code}</span>
                <ChevronDown size={15} color={T.navy} strokeWidth={2.4} />
              </button>
              <span style={{ width: 1, height: 26, background: T.line }} />
              {demoKeyboard ? (
                <div
                  onClick={() => setKbOpen(true)}
                  data-testid="login-phone"
                  style={{ flex: 1, minWidth: 0, height: "100%", padding: "0 12px 0 14px", display: "flex", alignItems: "center", cursor: "text", fontSize: 18, fontWeight: 500, letterSpacing: 1, color: phone ? T.navy : "#A4A7AE" }}
                >
                  {phone ? <span>{phone}</span> : !kbOpen && <span style={{ letterSpacing: 0 }}>Mobile number</span>}
                  {kbOpen && <span className="lv2-caret" />}
                  {!phone && kbOpen && <span style={{ letterSpacing: 0, marginLeft: 2 }}>Mobile number</span>}
                </div>
              ) : (
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
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
              )}
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

            {!compact && (
              <p style={{ margin: "14px 0 0", fontSize: 12.5, color: T.muted, textAlign: "center" }}>
                We'll send a 6-digit code by SMS
              </p>
            )}
          </div>
        </>
      )}

      {/* ─── Code ─── */}
      {phase === "otp" && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: compact ? "0 18px 12px" : "6px 18px 28px", overflowY: "auto" }} className="hide-scrollbar">
          <div onClick={() => setKbOpen(false)} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ marginTop: compact ? 8 : 36, animation: "lv2Up 0.5s cubic-bezier(0.4,0,0.2,1) both" }}>
              <LogoMark height={compact ? 54 : 88} />
            </div>
            <h2 style={{ fontSize: 25, fontWeight: 800, color: T.navy, margin: compact ? "16px 0 0" : "28px 0 0", letterSpacing: -0.4 }}>
              Verify your number
            </h2>
            <p style={{ fontSize: 14.5, color: T.muted, margin: "10px 0 0", lineHeight: 1.5, maxWidth: 330 }}>
              {channel === "whatsapp"
                ? "We've sent you a verification code to your WhatsApp number"
                : "We've sent you a verification code by SMS to"}{" "}
              <span style={{ fontWeight: 700, color: T.navy, whiteSpace: "nowrap" }}>{country.code} {fmtPhone(phone)}</span>
            </p>
          </div>

          <div key={shake} style={{ display: "flex", gap: 8, marginTop: compact ? 22 : 30, width: "100%", animation: shake ? "lv2Shake 380ms ease" : "none" }}>
            {otp.map((d, i) => {
              if (demoKeyboard) {
                const on = kbOpen && activeBox === i;
                return (
                  <div
                    key={i}
                    onClick={() => !locked && setKbOpen(true)}
                    data-testid={`otp-${i}`}
                    style={{
                      flex: 1, minWidth: 0, height: 60, boxSizing: "border-box",
                      display: "grid", placeItems: "center", cursor: "text",
                      background: otpError ? "#FEF3F2" : on ? "#FFF5F7" : "rgba(255,255,255,0.6)",
                      border: `1.5px solid ${otpError ? T.err : on ? T.coral : d ? "#C9CBD1" : T.line}`,
                      borderRadius: 14, fontSize: 22, fontWeight: 700, color: T.navy,
                      transition: "border-color 160ms, background 160ms",
                    }}
                  >
                    {d || (on ? <span className="lv2-caret" /> : "")}
                  </div>
                );
              }
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
                  disabled={locked}
                  onFocus={() => handleOtpFocus(i)}
                  onBlur={() => setFocusIdx((f) => (f === i ? -1 : f))}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  data-testid={`otp-${i}`}
                  style={{
                    flex: 1, minWidth: 0, height: 60, padding: 0, boxSizing: "border-box",
                    background: otpError ? "#FEF3F2" : on ? "#FFF5F7" : "rgba(255,255,255,0.6)",
                    border: `1.5px solid ${otpError ? T.err : on ? T.coral : T.line}`,
                    borderRadius: 14, textAlign: "center",
                    fontSize: 22, fontWeight: 700, color: T.navy, fontFamily: "inherit",
                    outline: "none", transition: "border-color 160ms, background 160ms",
                  }}
                />
              );
            })}
          </div>

          {otpError && (
            <p data-testid="otp-error" style={{ fontSize: 13, color: T.err, margin: "12px 0 0", fontWeight: 600 }}>{otpError}</p>
          )}
          {verifying && (
            <p style={{ fontSize: 13, color: T.muted, margin: "12px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={14} className="lv2-spin" /> Verifying...
            </p>
          )}
          {waFailed && channel === "whatsapp" && !otpError && (
            <p data-testid="wa-failed" style={{ fontSize: 13, color: T.err, margin: "12px 0 0", fontWeight: 600, lineHeight: 1.45 }}>
              We couldn't reach this number on WhatsApp. Get the code by SMS instead.
            </p>
          )}

          {/* Resend: a countdown, then both ways to get a new code */}
          <div style={{ marginTop: compact ? 22 : 34, width: "100%" }} data-testid="otp-resend">
            {/* Both ways are on screen from the start, so nobody waits a
                minute to find out WhatsApp was an option. They wake up when
                the countdown ends. */}
            <p style={{ margin: 0, fontSize: 14.5, color: T.navy }}>
              {sendsUsed
                ? <span style={{ color: T.muted }}>Too many codes asked for. Try again in 10 minutes.</span>
                : <>Didn't receive?{" "}
                  {resendTimer > 0 && !locked && !waFailed
                    ? <span style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>Resend in {resendTimer}s</span>
                    : "Get a new code on"}</>}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <ResendChip onClick={() => send("sms")} busy={sending === "sms"} disabled={chipOff("sms")} testId="resend-sms">
                <MessageSquareText size={17} color={T.navy} /> SMS
              </ResendChip>
              <ResendChip onClick={() => send("whatsapp")} busy={sending === "whatsapp"} disabled={chipOff("whatsapp")} testId="resend-whatsapp">
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

      {/* The phone's own keyboard, drawn for the demo */}
      {demoKeyboard && (
        <Keypad open={kbOpen} suggestion={suggestion} onDigit={pressDigit} onDelete={pressDelete} />
      )}

      {/* The message arriving, as the phone shows it */}
      {demoKeyboard && banner && (
        <MessageBanner
          banner={banner}
          onClose={() => setBanner(null)}
          onCopy={() => { setClip(banner.code); setBanner(null); setKbOpen(true); flash("Code copied"); }}
        />
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
        @keyframes lv2Shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(3px); }
        }
        @keyframes lv2Blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
        @keyframes lv2Drop {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lv2-spin { animation: lv2Spin 0.9s linear infinite; }
        .lv2-caret { display: inline-block; width: 2px; height: 24px; background: ${T.coral}; border-radius: 1px; animation: lv2Blink 1s step-end infinite; vertical-align: middle; }
        .lv2-key { transition: background 80ms ease; }
        .lv2-key:active { background: #B9BCC4 !important; }
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

// ─── Demo keyboard ───
// An iPhone number pad with its suggestion strip. The strip offers the
// person's own number on the first screen and the code once it arrives.
const KEYS = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
];
const KB_HEIGHT = 292;

function Keypad({ open, suggestion, onDigit, onDelete }) {
  const key = { height: 46, borderRadius: 6, background: "#fff", border: "none", boxShadow: "0 1px 0 #898A8D", cursor: "pointer", fontFamily: "inherit", color: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 0 };
  return (
    <div data-testid="demo-keyboard" style={{ flexShrink: 0, height: open ? KB_HEIGHT : 0, overflow: "hidden", transition: "height 260ms cubic-bezier(0.32,0.72,0,1)", background: "#D1D3D9" }}>
      <div style={{ height: KB_HEIGHT, display: "flex", flexDirection: "column" }}>
        {/* Suggestion strip */}
        <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 10px" }}>
          {suggestion && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={suggestion.use}
              data-testid="kb-suggestion"
              style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "3px 18px", borderRadius: 8, animation: "lv2Up 0.3s ease both" }}
            >
              <span style={{ fontSize: 11, color: "#6B6E76", fontWeight: 500 }}>{suggestion.label}</span>
              <span style={{ fontSize: 16, color: "#000", fontWeight: 600, letterSpacing: 0.5 }}>{suggestion.value}</span>
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, padding: "0 6px" }}>
          {KEYS.map(([n, letters]) => (
            <button key={n} className="lv2-key" onClick={() => onDigit(n)} style={key}>
              <span style={{ fontSize: 25, lineHeight: 1, fontWeight: 400 }}>{n}</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, height: 11 }}>{letters}</span>
            </button>
          ))}
          <span />
          <button className="lv2-key" onClick={() => onDigit("0")} style={key}>
            <span style={{ fontSize: 25, lineHeight: 1 }}>0</span>
          </button>
          <button className="lv2-key" onClick={onDelete} aria-label="Delete" data-testid="kb-delete" style={{ ...key, background: "transparent", boxShadow: "none" }}>
            <Delete size={24} strokeWidth={1.6} />
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
          <span style={{ width: 134, height: 5, borderRadius: 3, background: "#000" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Demo notification ───
// SMS: the code is read off the message by the keyboard, nothing to tap.
// WhatsApp: the message carries a Copy code button, and the copied code
// is then offered above the keyboard.
function MessageBanner({ banner, onClose, onCopy }) {
  const wa = banner.channel === "whatsapp";
  return (
    <div data-testid="msg-banner" style={{ position: "absolute", top: 10, left: 8, right: 8, zIndex: 8, animation: "lv2Drop 0.35s cubic-bezier(0.32,0.72,0,1) both" }}>
      <div style={{ background: "rgba(250,250,250,0.94)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderRadius: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.16)", padding: "11px 12px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        {wa
          ? <WhatsAppIcon size={36} />
          : <span style={{ width: 36, height: 36, borderRadius: 9, background: "#34C759", display: "grid", placeItems: "center", flexShrink: 0 }}><MessageCircle size={21} color="#fff" fill="#fff" /></span>}
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: "#000" }}>{wa ? "30 Sundays" : "VM-30SNDY"}</span>
            <span style={{ fontSize: 12, color: "#8A8A8E" }}>now</span>
            <button onClick={onClose} aria-label="Dismiss" style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
              <XIcon size={14} color="#8A8A8E" />
            </button>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 13.5, lineHeight: 1.35, color: "#1C1C1E" }}>
            {wa
              ? <><b>{banner.code}</b> is your verification code. For your security, do not share this code.</>
              : <>{banner.code} is your 30 Sundays verification code. It is valid for 10 minutes. Do not share it with anyone.</>}
          </p>
          {wa && (
            <button onClick={onCopy} data-testid="wa-copy" style={{ marginTop: 9, width: "100%", height: 34, borderRadius: 9, border: "none", background: "#fff", boxShadow: "0 0 0 1px #E5E5EA", fontSize: 14, fontWeight: 600, color: "#008069", cursor: "pointer", fontFamily: "inherit" }}>
              Copy code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
