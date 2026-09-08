import { useState, useEffect, useRef } from "react";
import { Star, ArrowLeft, X as XIcon, Check, MessageCircle } from "lucide-react";
import { BRAND, BRAND_TINT, BRAND_SUB, FONT } from "../data/brand";

// ─── App rating, one sheet ───
//
// The old flow was a chain of sheets: rate, then reasons, then a text box, then
// for happy users a store sheet that appeared out of nowhere. Each hand-off
// lost people, and nobody could tell what the store sheet was for.
//
// One sheet, steps inside it. The score stays on screen and stays tappable, so
// a mis-tap on a star is a tap to fix rather than a reason to quit. The score
// alone decides where the flow goes:
//
//   4 or 5   the store ask, no typing
//   1 to 3   what went wrong, one screen, no store ask
//
// A happy traveller is asked for one thing. An unhappy one is never asked to
// advertise the app.

const LABELS = ["", "Not good", "Could be better", "It's fine", "Really good", "Love it"];

// What tends to go wrong, in the words travellers use. Multi-select, because
// more than one is usually true, and all optional: the score is the signal we
// need, and every required field loses someone.
const REASONS = [
  "App feels slow",
  "Hard to find things",
  "Something is broken",
  "Prices or details look wrong",
  "Not enough trip options",
  "Booking or payment trouble",
  "Something else",
];

const isIOS = () => typeof navigator !== "undefined" && /iPad|iPhone|iPod|Mac/.test(navigator.userAgent);

// The store's own mark. Recognising where a button leads beats a sentence
// explaining it, which is the whole problem with the screen it replaces.
function PlayMark({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
      <path fill="#00D2FF" d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1L13.5 12v-.2L3.7 1.7z" />
      <path fill="#FFCE00" d="M16.8 15.3 13.5 12v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3z" />
      <path fill="#FF3A44" d="m16.9 15.2-3.4-3.3L3.6 21.8c.4.4 1 .4 1.7.1z" />
      <path fill="#00C853" d="M16.9 8.6 5.3 2C4.6 1.6 4 1.7 3.6 2.1l9.9 9.8z" />
    </svg>
  );
}
function AppleMark({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden="true" style={{ display: "block" }}>
      <path d="M17.05 12.54c-.03-2.65 2.16-3.92 2.26-3.98-1.23-1.8-3.15-2.05-3.83-2.08-1.63-.16-3.18.96-4.01.96-.83 0-2.1-.94-3.45-.91-1.77.03-3.4 1.03-4.31 2.61-1.84 3.19-.47 7.91 1.32 10.5.87 1.27 1.91 2.69 3.28 2.64 1.32-.05 1.81-.85 3.4-.85 1.59 0 2.03.85 3.42.82 1.41-.02 2.31-1.29 3.17-2.56.99-1.47 1.4-2.9 1.42-2.97-.03-.01-2.72-1.05-2.75-4.16zM14.5 4.6c.73-.88 1.22-2.11 1.09-3.33-1.05.04-2.32.7-3.07 1.58-.67.78-1.26 2.03-1.1 3.22 1.17.09 2.36-.59 3.08-1.47z" />
    </svg>
  );
}

function Stars({ value, onPick, size = 44, glow = true }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "4px 0" }}>
      {glow && value > 0 && (
        <span aria-hidden="true" style={{
          position: "absolute", inset: "-24% -10%", borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${BRAND.goldenHour}26 0%, transparent 68%)`,
          pointerEvents: "none",
        }} />
      )}
      <div
        role="radiogroup"
        aria-label="Rate the app"
        onMouseLeave={() => setHover(0)}
        style={{ display: "flex", gap: size * 0.16, position: "relative" }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const on = n <= shown;
          return (
            <button
              key={n}
              data-testid={`star-${n}`}
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => onPick(n)}
              style={{
                background: "none", border: "none", padding: 2, cursor: "pointer", lineHeight: 0,
                transform: hover === n ? "scale(1.14)" : "scale(1)",
                transition: "transform 0.14s cubic-bezier(0.34,1.56,0.64,1)",
                animation: value === n ? "starPop 0.34s cubic-bezier(0.34,1.56,0.64,1)" : "none",
              }}
            >
              <Star
                size={size}
                color={on ? BRAND.goldenHour : "#DCD6D1"}
                fill={on ? BRAND.goldenHour : "none"}
                strokeWidth={on ? 0 : 1.5}
                style={{ filter: on ? `drop-shadow(0 3px 8px ${BRAND.goldenHour}55)` : "none" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Primary({ children, onClick, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      style={{
        width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
        background: BRAND.sunsetFuchsia, color: "#fff", fontSize: 15.5, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.1px",
        boxShadow: `0 8px 22px -8px ${BRAND.sunsetFuchsia}88`,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
      }}
    >
      {children}
    </button>
  );
}

function Quiet({ children, onClick, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      style={{
        width: "100%", padding: "13px 0", background: "none", border: "none",
        fontSize: 14, fontWeight: 600, color: BRAND_SUB, cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

const H = ({ children, size = 21 }) => (
  <h3 style={{
    margin: 0, fontSize: size, fontWeight: 600, color: BRAND.tropicalForest,
    lineHeight: 1.25, letterSpacing: "-0.35px", textWrap: "balance",
  }}>{children}</h3>
);

const Sub = ({ children }) => (
  <p style={{ margin: "7px 0 0", fontSize: 13.5, color: BRAND_SUB, lineHeight: "20px" }}>{children}</p>
);

// The wash behind the top of the sheet. It changes with the step, so each one
// has its own temperature instead of four identical white panels.
const WASH = {
  rate:    `${BRAND.goldenHour}1F`,
  store:   `${BRAND.goldenHour}26`,
  reasons: `${BRAND.coastalMist}`,
  done:    `${BRAND.lagoonBliss}1C`,
};

export default function RatingSheet({ source = "home", onClose, onEvent = () => {} }) {
  const [step, setStep] = useState("rate");
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState([]);
  const [note, setNote] = useState("");
  const [focused, setFocused] = useState(false);
  const [closing, setClosing] = useState(false);
  const advance = useRef(null);
  // React runs effects twice in development. Without this guard the shown
  // event double-counts, which would quietly halve every rate in the funnel.
  const announced = useRef(false);

  useEffect(() => {
    if (!announced.current) {
      announced.current = true;
      onEvent("app_rating_prompt_shown", { source });
    }
    return () => clearTimeout(advance.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = (reason) => {
    onEvent("app_rating_dismissed", { source, step, score: score || null, reason });
    setClosing(true);
    setTimeout(onClose, 210);
  };

  // A star sends you onward on its own. The score stays on screen and stays
  // tappable on the next step, so this is never a trap.
  const pick = (n) => {
    setScore(n);
    onEvent("app_rating_submitted", { source, score: n });
    clearTimeout(advance.current);
    advance.current = setTimeout(() => setStep(n >= 4 ? "store" : "reasons"), 340);
  };

  const toggle = (r) => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  const sendFeedback = () => {
    onEvent("app_rating_feedback_submitted", { source, score, reasons: picked, has_note: !!note.trim() });
    setStep("done");
  };

  const openStore = () => {
    onEvent("app_rating_store_opened", { source, score, store: isIOS() ? "app_store" : "play_store" });
    setStep("done");
  };

  const ios = isIOS();
  const storeName = ios ? "App Store" : "Play Store";

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end", fontFamily: FONT.primary }}>
      <style>{`
        @keyframes starPop { 0%{transform:scale(1)} 45%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes riseIn { from { opacity:0; transform:translateY(9px) } to { opacity:1; transform:none } }
        @keyframes tickIn { from { opacity:0; transform:scale(0.7) } to { opacity:1; transform:scale(1) } }
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

        {/* Step-coloured wash behind the top of the sheet */}
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 190,
          background: `linear-gradient(180deg, ${WASH[step]} 0%, rgba(255,255,255,0) 100%)`,
          pointerEvents: "none", transition: "background 0.3s ease",
        }} />

        <div style={{ position: "relative", padding: "10px 22px calc(20px + env(safe-area-inset-bottom))" }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: "#D8D3CF", margin: "0 auto 4px" }} />

          <div style={{ display: "flex", alignItems: "center", minHeight: 30 }}>
            {(step === "reasons" || step === "store") ? (
              <button
                data-testid="rating-back"
                onClick={() => { clearTimeout(advance.current); setStep("rate"); }}
                aria-label="Back"
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}
              >
                <ArrowLeft size={19} color={BRAND.tropicalForest} />
              </button>
            ) : <span style={{ width: 27 }} />}
            <span style={{ flex: 1 }} />
            {step !== "done" && (
              <button
                data-testid="rating-close"
                onClick={() => close("x")}
                aria-label="Close"
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}
              >
                <XIcon size={19} color="#A6B6B4" />
              </button>
            )}
          </div>

          {/* ── Rate ── */}
          {step === "rate" && (
            <div key="rate" style={{ textAlign: "center", padding: "4px 0 10px", animation: "riseIn 0.3s ease-out" }}>
              <H size={22}>How are we doing?</H>
              <Sub>One tap. It shapes what we build next.</Sub>
              <div style={{ margin: "24px 0 0" }}>
                <Stars value={score} onPick={pick} />
              </div>
              <p style={{
                margin: "16px 0 0", fontSize: 14.5, fontWeight: 600, minHeight: 21,
                color: score ? BRAND.goldenHour : "transparent",
                transition: "color 0.18s ease",
              }}>
                {LABELS[score] || "."}
              </p>
            </div>
          )}

          {/* ── 4 or 5: the store ask. Short on purpose. ── */}
          {step === "store" && (
            <div key="store" style={{ textAlign: "center", padding: "4px 0 2px", animation: "riseIn 0.3s ease-out" }}>
              <Stars value={score} onPick={pick} size={30} />
              <div style={{ height: 18 }} />
              <H size={22}>Thank you!</H>
              <Sub>Would you share that on the {storeName}?</Sub>
              <div style={{ height: 24 }} />
              <Primary testId="rate-on-store" onClick={openStore}>
                {ios ? <AppleMark /> : <PlayMark />}
                Rate on {storeName}
              </Primary>
              <Quiet testId="store-not-now" onClick={() => close("not_now")}>Not now</Quiet>
            </div>
          )}

          {/* ── 1 to 3: one screen, everything optional ── */}
          {step === "reasons" && (
            <div key="reasons" style={{ padding: "4px 0 2px", animation: "riseIn 0.3s ease-out" }}>
              <Stars value={score} onPick={pick} size={30} />
              <div style={{ height: 16 }} />
              <div style={{ textAlign: "center" }}>
                <H>Sorry we missed the mark</H>
                <Sub>Tell us what went wrong, or just send it.</Sub>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "20px 0 16px" }}>
                {REASONS.map((r) => {
                  const on = picked.includes(r);
                  return (
                    <button
                      key={r}
                      data-testid={`reason-${r.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => toggle(r)}
                      style={{
                        padding: "10px 15px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                        fontSize: 13, fontWeight: on ? 600 : 500,
                        border: `1.5px solid ${on ? BRAND.sunsetFuchsia : "#E7E2DE"}`,
                        background: on ? BRAND_TINT.sunsetFuchsia : "#fff",
                        color: on ? BRAND.sunsetFuchsia : BRAND.tropicalForest,
                        transition: "border-color 0.15s ease, background 0.15s ease",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>

              <textarea
                data-testid="rating-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Anything else? Optional."
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box", resize: "none",
                  border: `1.5px solid ${focused ? BRAND.lagoonBliss : "#E7E2DE"}`,
                  borderRadius: 14, padding: "12px 14px",
                  fontSize: 14, fontFamily: "inherit", color: BRAND.tropicalForest,
                  outline: "none", marginBottom: 16, lineHeight: "20px",
                  background: focused ? "#fff" : "#FBFAF9",
                  transition: "border-color 0.15s ease, background 0.15s ease",
                }}
              />

              <Primary testId="send-feedback" onClick={sendFeedback}>Send feedback</Primary>
            </div>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div key="done" style={{ textAlign: "center", padding: "8px 0 2px", animation: "riseIn 0.3s ease-out" }}>
              <div style={{
                width: 62, height: 62, borderRadius: "50%", background: BRAND_TINT.lagoonBliss,
                display: "grid", placeItems: "center", margin: "0 auto 16px",
                animation: "tickIn 0.34s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                <Check size={30} color={BRAND.lagoonBliss} strokeWidth={2.6} />
              </div>
              <H>{score >= 4 ? "You made our day" : "Thank you, we are on it"}</H>
              <Sub>
                {score >= 4
                  ? "It helps other couples find us."
                  : "Someone on the team reads every note."}
              </Sub>
              <div style={{ height: 22 }} />
              {score < 4 && (
                <button
                  data-testid="talk-to-support"
                  onClick={() => { onEvent("app_rating_support_tap", { source, score }); close("support"); }}
                  style={{
                    width: "100%", padding: "14px 0", borderRadius: 16, marginBottom: 2,
                    border: "1.5px solid #E7E2DE", background: "#fff",
                    fontSize: 14.5, fontWeight: 600, color: BRAND.tropicalForest,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
                  }}
                >
                  <MessageCircle size={16} color={BRAND.lagoonBliss} />
                  Need help now? Talk to us
                </button>
              )}
              <Quiet testId="rating-done" onClick={() => close("done")}>Close</Quiet>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
