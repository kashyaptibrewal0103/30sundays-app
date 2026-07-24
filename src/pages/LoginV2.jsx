import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, Check, Loader2, Heart, GraduationCap } from "lucide-react";

// Animate a number from 0 to target over `duration`. Used in trust card.
function useCountUp(target, duration = 1400, start = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const t = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t >= 1) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [target, duration, start]);
  return value;
}

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


// ─── Brand illustrations ───
// Each is ~240x160, brand-coloured, scene-style. Reads as a value vignette,
// not a floating icon.

const IlloCustomise = () => (
  <svg width="240" height="160" viewBox="0 0 240 160" fill="none" aria-hidden="true">
    {/* soft blush halo */}
    <ellipse cx="120" cy="100" rx="105" ry="48" fill="#FFE4E8" opacity="0.6" />
    {/* back card */}
    <rect x="32" y="34" width="148" height="86" rx="14" fill="#FFD4DC" />
    {/* front card */}
    <rect x="48" y="46" width="148" height="86" rx="14" fill="#fff" stroke="#FFE4E8" strokeWidth="1.5" />
    {/* day rows */}
    <rect x="62" y="62" width="58" height="6" rx="3" fill="#E31B53" />
    <rect x="62" y="76" width="100" height="4" rx="2" fill="#FFE4E8" />
    <rect x="62" y="86" width="80" height="4" rx="2" fill="#FFE4E8" />
    <rect x="62" y="100" width="46" height="14" rx="7" fill="#FFE4E8" />
    {/* drag/pencil action */}
    <circle cx="180" cy="56" r="14" fill="#E31B53" />
    <path d="M174 60l4-8h2l-4 8h-2zm8-8l2 1 4-1 1-2-3-1-2 1-2 2z" fill="#fff" />
  </svg>
);

const IlloDiscover = () => (
  <svg width="240" height="160" viewBox="0 0 240 160" fill="none" aria-hidden="true">
    {/* soft blush halo */}
    <ellipse cx="120" cy="100" rx="110" ry="50" fill="#FFE4E8" opacity="0.6" />
    {/* globe / ocean ring */}
    <circle cx="120" cy="86" r="50" fill="#fff" stroke="#FFE4E8" strokeWidth="2" />
    <path d="M80 70c12 16 60 16 80 0M80 102c12-12 60-12 80 0M120 36c-16 20-16 80 0 100M120 36c16 20 16 80 0 100" stroke="#FFC4CF" strokeWidth="1.4" fill="none" />
    {/* pins */}
    <g transform="translate(90 64)">
      <path d="M0 0c0-6 5-11 11-11s11 5 11 11c0 9-11 18-11 18S0 9 0 0z" fill="#E31B53" />
      <circle cx="11" cy="0" r="4" fill="#fff" />
    </g>
    <g transform="translate(132 50)">
      <path d="M0 0c0-6 5-11 11-11s11 5 11 11c0 9-11 18-11 18S0 9 0 0z" fill="#E31B53" />
      <circle cx="11" cy="0" r="4" fill="#fff" />
    </g>
    <g transform="translate(118 96)">
      <path d="M0 0c0-6 5-11 11-11s11 5 11 11c0 9-11 18-11 18S0 9 0 0z" fill="#E31B53" />
      <circle cx="11" cy="0" r="4" fill="#fff" />
    </g>
    {/* sparkles */}
    <path d="M52 50l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="#FEA3B4" />
    <path d="M194 110l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5 1.5-4z" fill="#FEA3B4" />
  </svg>
);

const IlloManage = () => (
  <svg width="240" height="160" viewBox="0 0 240 160" fill="none" aria-hidden="true">
    {/* soft blush halo */}
    <ellipse cx="120" cy="100" rx="105" ry="50" fill="#FFE4E8" opacity="0.6" />
    {/* phone frame */}
    <rect x="84" y="22" width="72" height="118" rx="14" fill="#fff" stroke="#FFE4E8" strokeWidth="2" />
    <rect x="100" y="28" width="40" height="4" rx="2" fill="#FFE4E8" />
    {/* ticket inside */}
    <rect x="92" y="44" width="56" height="32" rx="6" fill="#E31B53" />
    <circle cx="92" cy="60" r="4" fill="#fff" />
    <circle cx="148" cy="60" r="4" fill="#fff" />
    <rect x="100" y="52" width="34" height="4" rx="2" fill="#fff" opacity="0.9" />
    <rect x="100" y="62" width="22" height="3" rx="1.5" fill="#fff" opacity="0.7" />
    {/* day card below */}
    <rect x="92" y="82" width="56" height="22" rx="6" fill="#FFE4E8" />
    <rect x="100" y="89" width="22" height="3" rx="1.5" fill="#E31B53" />
    <rect x="100" y="96" width="38" height="3" rx="1.5" fill="#FEA3B4" />
    {/* check badge */}
    <circle cx="156" cy="48" r="14" fill="#E31B53" />
    <path d="M150 48l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Google "G" logo
const GoogleG = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);

// ─── Design tokens ───
const T = {
  coral: "#E31B53",
  blush: "#FFE4E8",       // brand light pink - used for filled OTP, dropdown highlight
  navy: "#181D27",
  muted: "#6B7280",
  line: "rgba(0,0,0,0.06)",
  surface: "#F7F8FB",     // soft neutral for inputs on a white page
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

// Value props shown as a checklist in the hero
const VALUE_PROPS = [
  "See and customise your itinerary",
  "Explore all destinations we offer",
  "Vouchers, day plans & 24/7 support",
];

// Wrap any word in `highlights` with a coral span; preserves \n line breaks
function renderWithHighlights(text, highlights, color) {
  if (!highlights || highlights.length === 0) return text;
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${highlights.map(escape).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((p, i) =>
    highlights.some((h) => h.toLowerCase() === p.toLowerCase())
      ? <span key={i} style={{ color }}>{p}</span>
      : p
  );
}


// ─── Static hero: logo + 3 value ticks (no title, no circle bg on tick) ───
function StaticHero({ collapsed, onSkip, onBack, hideSkip = false }) {
  return (
    <div style={{
      position: "absolute", inset: 0, overflow: "hidden",
      background: `radial-gradient(circle at 50% 28%, ${T.blush}DD 0%, ${T.blush}55 30%, #fff 70%)`,
    }}>
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 6,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
      }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#fff", border: `1px solid ${T.line}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animation: "lv2FadeIn 0.5s ease-out both",
          }}
        >
          <ArrowLeft size={18} color={T.navy} />
        </button>
        {!hideSkip && <button
          onClick={onSkip}
          className="lv2-skip-link"
          style={{
            background: "transparent", border: "none", padding: "6px 2px",
            fontSize: 14, fontWeight: 700, letterSpacing: 0.1,
            color: T.muted, cursor: "pointer",
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? "none" : "auto",
            transition: "opacity 200ms ease, color 200ms ease",
            display: "inline-flex", alignItems: "center", gap: 4,
            animation: "lv2FadeIn 0.5s ease-out 80ms both",
          }}
        >
          <span>Skip</span>
          <ArrowRight size={14} className="lv2-skip-arrow" />
        </button>}
      </div>

      {/* Centered content: logo + 3 ticks */}
      <div style={{
        position: "absolute",
        left: 24, right: 24,
        top: "50%", transform: "translateY(-50%)",
        color: T.navy,
        textAlign: "center",
      }}>
        <img
          src="/logo.png"
          alt="30 Sundays"
          style={{
            height: collapsed ? 52 : 64,
            width: "auto",
            display: "block",
            margin: collapsed ? "0 auto 28px" : "0 auto 44px",
            transition: "height 280ms ease, margin 280ms ease",
            animation: "lv2Up 0.7s cubic-bezier(0.4,0,0.2,1) 60ms both",
          }}
        />

        {/* 3 value ticks - colored check only, no circle bg */}
        <ul style={{
          listStyle: "none", padding: 0,
          margin: 0,
          display: "flex", flexDirection: "column", gap: 12,
          textAlign: "left", maxWidth: 320, marginLeft: "auto", marginRight: "auto",
        }}>
          {VALUE_PROPS.map((line, i) => (
            <li
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                fontSize: 15, color: T.navy, lineHeight: 1.4, fontWeight: 500,
                animation: `lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) ${180 + i * 90}ms both`,
              }}
            >
              <Check size={22} color={T.coral} strokeWidth={3.2} style={{ flexShrink: 0 }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Trust card: 3 stats with inline icons + animated count-up ───
function TrustCard() {
  const rating = useCountUp(4.6, 1400);
  const trips  = useCountUp(10000, 1600);

  return (
    <div style={{
      margin: "0 16px 12px",
      background: "#fff",
      border: `0.5px solid ${T.line}`,
      borderRadius: 16,
      padding: "12px 4px",
      display: "flex", alignItems: "stretch",
      boxShadow: "0 4px 14px rgba(227,27,83,0.06)",
      animation: "lv2Up 0.6s cubic-bezier(0.4,0,0.2,1) 460ms both",
    }}>
      <Stat>
        <StatRow>
          <GoogleG size={14} />
          <StatTitle>{rating.toFixed(1)} / 5</StatTitle>
        </StatRow>
        <StatSub>Google reviews</StatSub>
      </Stat>
      <Divider />
      <Stat>
        <StatRow>
          <Heart size={13} color={T.coral} fill={T.coral} strokeWidth={0} />
          <StatTitle>{Math.round(trips).toLocaleString()}+</StatTitle>
        </StatRow>
        <StatSub>Trips planned</StatSub>
      </Stat>
      <Divider />
      <Stat>
        <StatRow>
          <GraduationCap size={14} color={T.coral} strokeWidth={2.4} />
          <StatTitle>IIT-IIM</StatTitle>
        </StatRow>
        <StatSub>Founders</StatSub>
      </Stat>
    </div>
  );
}

const Stat = ({ children }) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 3, padding: "4px 6px",
  }}>
    {children}
  </div>
);

const StatRow = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, lineHeight: 1.2 }}>
    {children}
  </div>
);

const StatTitle = ({ children }) => (
  <div style={{
    fontSize: 14, fontWeight: 800, color: T.navy,
    letterSpacing: -0.2, lineHeight: 1.2,
    fontVariantNumeric: "tabular-nums",
  }}>
    {children}
  </div>
);

const StatSub = ({ children }) => (
  <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, letterSpacing: 0.1 }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ width: 0.5, background: T.line }} />
);

// ─── Main screen ───
// Props (all optional - defaults make this work as a standalone /login-v2 page):
//   onComplete({ country, phone, otp })  - called after OTP verifies successfully
//   onSkip()                              - called when Skip tapped (default: navigate("/"))
//   validateOtp(otpString) -> string|null - return error string to keep on OTP screen, or null/undefined to proceed
export default function LoginV2({ onComplete, onSkip: onSkipProp, validateOtp, hideSkip = false }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("phone"); // phone | otp
  const [country, setCountry] = useState(countryCodes[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(28);
  const [canResend, setCanResend] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // hero shrinks when input focused
  const [sending, setSending] = useState(false);     // Send OTP loading state
  const otpRefs = useRef([]);

  // Resend countdown
  useEffect(() => {
    if (phase !== "otp") return;
    setResendTimer(28);
    setCanResend(false);
    const t = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const handleResend = () => {
    if (!canResend) return;
    setOtp(["", "", "", ""]);
    setOtpError("");
    setResendTimer(28);
    setCanResend(false);
  };

  // visualViewport - collapse when keyboard pushes viewport up
  useEffect(() => {
    if (!window.visualViewport) return;
    const baseline = window.visualViewport.height;
    const onResize = () => {
      const shrunk = baseline - window.visualViewport.height > 150;
      setCollapsed(shrunk);
    };
    window.visualViewport.addEventListener("resize", onResize);
    return () => window.visualViewport.removeEventListener("resize", onResize);
  }, []);

  const phoneValid = phone.length === country.digits;
  const otpValid = otp.every((d) => d.length === 1);

  const handlePhone = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, country.digits);
    setPhone(digits);
  };
  const handleOtpChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[i] = d; setOtp(next);
    if (otpError) setOtpError("");
    if (d && i < 3) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const onPrimary = () => {
    if (phase === "phone" && phoneValid && !sending) {
      setSending(true);
      // Brief loading state so the moment of commitment feels real.
      setTimeout(() => {
        setSending(false);
        setPhase("otp");
      }, 2400);
    } else if (phase === "otp" && otpValid) {
      const otpStr = otp.join("");
      if (validateOtp) {
        const err = validateOtp(otpStr);
        if (err) { setOtpError(err); return; }
      }
      setOtpError("");
      if (onComplete) onComplete({ country, phone, otp: otpStr });
      else console.log("[LoginV2] Verify OTP", otpStr);
    }
  };
  const skip = () => {
    if (onSkipProp) onSkipProp();
    else navigate("/");
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "#fff",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      color: T.navy,
    }}>
      {/* ─── Static hero (logo + headline + 3 value ticks) ─── */}
      {phase === "phone" && (
        <div style={{
          position: "relative",
          height: collapsed ? "44%" : "60%",
          transition: "height 320ms cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
        }}>
          <StaticHero
            collapsed={collapsed}
            onSkip={skip}
            onBack={() => navigate(-1)}
            hideSkip={hideSkip}
          />
        </div>
      )}

      {/* ─── Trust card above the form ─── */}
      {phase === "phone" && (
        <div style={{
          opacity: collapsed ? 0 : 1,
          maxHeight: collapsed ? 0 : 100,
          overflow: "hidden",
          transition: "opacity 200ms ease, max-height 280ms ease",
          flexShrink: 0,
        }}>
          <TrustCard />
        </div>
      )}

      {/* ─── Phone form ─── */}
      {phase === "phone" && (
        <div style={{
          flex: 1, minHeight: 0,
          padding: 16,
          display: "flex", flexDirection: "column",
          background: "#fff",
        }}>
          {/* Country code + phone */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCountryOpen((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 12px", height: 52,
                background: T.surface,
                border: `0.5px solid ${T.line}`,
                borderRadius: 16,
                fontSize: 14, fontWeight: 600, color: T.navy,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18 }}>{country.flag}</span>
              <span>{country.code}</span>
              <ChevronDown size={14} color={T.muted} />
            </button>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={country.digits}
              placeholder="Mobile number"
              value={phone}
              disabled={sending}
              onChange={(e) => handlePhone(e.target.value)}
              onFocus={() => setCollapsed(true)}
              onBlur={() => setTimeout(() => setCollapsed(false), 120)}
              style={{
                flex: 1, height: 52, padding: "0 16px",
                background: T.surface,
                border: `0.5px solid ${T.line}`,
                borderRadius: 16,
                fontSize: 15, fontWeight: 500, color: T.navy,
                outline: "none",
                opacity: sending ? 0.6 : 1,
              }}
            />
          </div>

          {/* Country dropdown */}
          {countryOpen && (
            <div style={{
              marginTop: 8,
              background: "#fff", borderRadius: 16, padding: 6,
              boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
              border: `0.5px solid ${T.line}`,
              maxHeight: 220, overflowY: "auto",
            }}>
              {countryCodes.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCountry(c); setCountryOpen(false); setPhone(""); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 10,
                    background: c.code === country.code ? T.blush : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.navy }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>{c.code}</span>
                </button>
              ))}
            </div>
          )}

          {/* CTA: Send OTP with WhatsApp signal + loading state */}
          <button
            onClick={onPrimary}
            disabled={!phoneValid || sending}
            className={phoneValid && !sending ? "lv2-cta-pulse" : ""}
            style={{
              marginTop: 12, height: 52, borderRadius: 16,
              // Brand pink primary CTA in all states; opacity signals disabled
              background: T.coral,
              color: "#fff",
              border: "none", fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              cursor: phoneValid && !sending ? "pointer" : (sending ? "default" : "not-allowed"),
              boxShadow: (phoneValid || sending) ? "0 8px 20px rgba(227,27,83,0.3)" : "0 4px 12px rgba(227,27,83,0.18)",
              transition: "opacity 200ms ease, box-shadow 200ms ease, transform 120ms ease",
              opacity: (phoneValid || sending) ? 1 : 0.5,
            }}
          >
            {sending ? (
              <>
                <Loader2 size={16} className="lv2-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <WhatsAppIcon size={18} />
                Send OTP
              </>
            )}
          </button>

          {/* Footer: legal microcopy */}
          <p style={{
            fontSize: 11, color: T.muted, textAlign: "center",
            margin: "auto 0 4px", lineHeight: 1.5,
          }}>
            By continuing, you agree to our{" "}
            <span style={{ color: T.coral, fontWeight: 600 }}>Terms</span> &{" "}
            <span style={{ color: T.coral, fontWeight: 600 }}>Privacy Policy</span>.
          </p>
        </div>
      )}

      {/* ─── OTP phase ─── */}
      {phase === "otp" && (
        <div style={{
          flex: 1, padding: "12px 16px 16px",
          display: "flex", flexDirection: "column",
          background: "#fff",
        }}>
          {/* Top bar - in-flow so the phone frame status bar isn't overlapped */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 24,
          }}>
            <button
              onClick={() => setPhase("phone")}
              style={{
                background: "transparent", border: "none", color: T.coral,
                fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0,
              }}
            >
              ← Change number
            </button>
            {!hideSkip && <button onClick={skip} style={{
              background: "rgba(0,0,0,0.04)",
              border: `0.5px solid ${T.line}`,
              borderRadius: 999, padding: "7px 14px",
              fontSize: 12, fontWeight: 600, color: T.muted,
              cursor: "pointer",
            }}>
              Skip →
            </button>}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.navy, margin: 0, letterSpacing: -0.3 }}>
            Check your messages
          </h2>
          <p style={{ fontSize: 14, color: T.muted, margin: "8px 0 0", lineHeight: 1.5 }}>
            We sent a 4-digit code to{" "}
            <span style={{ fontWeight: 700, color: T.navy }}>{country.code} {phone}</span>
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                autoFocus={i === 0}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKey(i, e)}
                style={{
                  width: 64, height: 64, padding: 0, boxSizing: "border-box",
                  background: otpError ? "#FEF3F2" : d ? T.blush : T.surface,
                  border: otpError
                    ? "1.5px solid #B42318"
                    : d
                      ? `1.5px solid ${T.coral}`
                      : `0.5px solid ${T.line}`,
                  borderRadius: 16, textAlign: "center",
                  fontSize: 24, fontWeight: 700, color: T.navy,
                  outline: "none",
                  transition: "border-color 160ms, background 160ms",
                }}
              />
            ))}
          </div>

          {otpError && (
            <p style={{ fontSize: 12, color: "#B42318", margin: "10px 0 0", fontWeight: 600 }}>
              {otpError}
            </p>
          )}

          <p style={{ fontSize: 12, color: T.muted, margin: "16px 0 0" }}>
            Didn't get it?{" "}
            {canResend ? (
              <span onClick={handleResend} style={{ color: T.coral, fontWeight: 600, cursor: "pointer" }}>
                Resend OTP
              </span>
            ) : (
              <span style={{ color: T.muted, fontWeight: 600 }}>Resend in {resendTimer}s</span>
            )}
          </p>

          <button
            onClick={onPrimary}
            disabled={!otpValid}
            style={{
              marginTop: 28, height: 54, borderRadius: 16,
              background: T.coral,
              color: "#fff",
              border: "none", fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: otpValid ? "pointer" : "not-allowed",
              boxShadow: otpValid ? "0 8px 20px rgba(227,27,83,0.3)" : "0 4px 12px rgba(227,27,83,0.18)",
              opacity: otpValid ? 1 : 0.5,
              transition: "opacity 200ms ease, box-shadow 200ms ease",
            }}
          >
            Verify & Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes lv2SlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lv2Up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lv2FadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lv2Spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes lv2CtaPulse {
          0%, 100% { box-shadow: 0 8px 20px rgba(227,27,83,0.30); }
          50%      { box-shadow: 0 8px 28px rgba(227,27,83,0.55); }
        }
        .lv2-spin { animation: lv2Spin 0.9s linear infinite; }
        .lv2-cta-pulse { animation: lv2CtaPulse 2.2s ease-in-out infinite; }
        .lv2-cta-pulse:active { transform: scale(0.98); }
        .lv2-skip-link { transition: color 200ms ease; }
        .lv2-skip-link:hover { color: ${T.coral} !important; }
        .lv2-skip-arrow { transition: transform 200ms ease; }
        .lv2-skip-link:hover .lv2-skip-arrow { transform: translateX(3px); }
      `}</style>
    </div>
  );
}
