import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronRight, Star, User } from "lucide-react";
import { C, allItineraries } from "../data";

// ─── The store rating cards, as they appear in our app ───
//
// Both stores draw the rating card themselves; the app only asks for it. These
// are drawn copies, to show what a user sees and when: Apple's alert in the
// middle of the screen, Google Play's sheet from the bottom. Their layout and
// words follow the stores' own screenshots; the stores set the exact look, and
// it shifts a little between OS versions.
//
// /rating-prompts            the two flows, every step
// /rating-prompts/ios-2      one step, tappable from there on

const trip = allItineraries.find((i) => i.id === 3);
const PINK = C.p600;
const IOS_BLUE = "#007AFF";
const PLAY_GREEN = "#01875F";
const APP_NAME = "30 Sundays: Holiday planning";

// Our app icon: the palm-and-sun mark on white.
function AppIcon({ size = 60, radius }) {
  return (
    <span style={{ width: size, height: size, borderRadius: radius ?? size * 0.225, background: "#fff", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
      <span style={{ width: size * 0.78, height: size * 0.76, overflow: "hidden", display: "block" }}>
        <img src="/logo.png" alt="" style={{ height: size * 0.85, width: "auto", maxWidth: "none", display: "block", marginTop: -size * 0.04 }} />
      </span>
    </span>
  );
}

// ─── Our screen underneath: the booking is confirmed ───
function BookedScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: C.white, display: "flex", flexDirection: "column", padding: "44px 20px 18px" }}>
      <div style={{ textAlign: "center" }}>
        <span style={{ display: "inline-grid", placeItems: "center", width: 60, height: 60, borderRadius: "50%", background: C.sBg }}><Check size={30} color={C.sText} strokeWidth={3} /></span>
        <h1 style={{ margin: "14px 0 4px", fontSize: 23, fontWeight: 800, color: C.head, letterSpacing: -0.4 }}>Your Bali trip is booked</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: C.sub }}>Payment of ₹50,000 received · Booking 30S-48213</p>
      </div>
      <div style={{ marginTop: 22, border: `1px solid ${C.div}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ height: 130, background: `${C.bg} url(${trip?.img}) center 30%/cover` }} />
        <div style={{ padding: "12px 14px" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.head }}>Bali · 7 nights</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>17 Dec to 24 Dec · 2 travellers</p>
        </div>
      </div>
      <p style={{ margin: "20px 0 8px", fontSize: 14, fontWeight: 800, color: C.head }}>What happens next</p>
      {["Vouchers arrive here within 48 hours", "Your consultant will call to confirm flights", "Next payment due 5 Jan"].map((t) => (
        <p key={t} style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.head }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: PINK, flexShrink: 0 }} />{t}
        </p>
      ))}
      <div style={{ flex: 1 }} />
      <button style={{ width: "100%", height: 50, borderRadius: 14, border: "none", background: PINK, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>View my trip</button>
    </div>
  );
}

// ─── Apple: the system alert in the middle of the screen ───
const iosFont = { fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif" };

function IosAlert({ step, setStep }) {
  const [stars, setStars] = useState(step >= 3 ? 5 : 0);
  const pick = (n) => { setStars(n); setStep(3); };
  const row = { display: "flex", borderTop: "0.5px solid rgba(60,60,67,0.36)" };
  const btn = (bold) => ({ flex: 1, height: 44, border: "none", background: "transparent", color: IOS_BLUE, fontSize: 17, fontWeight: bold ? 600 : 400, cursor: "pointer", ...iosFont });
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)", display: "grid", placeItems: "center", zIndex: 5 }}>
      <div data-testid={`ios-alert-${step}`} style={{ width: 270, borderRadius: 14, background: "rgba(242,242,247,0.94)", backdropFilter: "blur(20px)", textAlign: "center", overflow: "hidden", ...iosFont }}>
        {step < 4 ? (
          <>
            <div style={{ padding: "18px 16px 14px" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><AppIcon size={60} /></div>
              <p style={{ margin: "12px 0 2px", fontSize: 17, fontWeight: 600, color: "#000" }}>Enjoying 30 Sundays?</p>
              <p style={{ margin: 0, fontSize: 13, color: "#000", lineHeight: "17px" }}>Tap a star to rate it on the<br />App Store.</p>
            </div>
            <div style={{ ...row, justifyContent: "center", gap: 14, padding: "10px 0" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} data-testid={`ios-star-${n}`} onClick={() => pick(n)} aria-label={`${n} stars`} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "grid" }}>
                  <Star size={27} color={IOS_BLUE} fill={n <= stars ? IOS_BLUE : "none"} strokeWidth={1.4} />
                </button>
              ))}
            </div>
            {step < 3 ? (
              <div style={row}><button onClick={() => setStep(1)} style={btn(false)}>Not Now</button></div>
            ) : (
              <div style={row}>
                <button onClick={() => setStep(1)} style={btn(false)}>Cancel</button>
                <span style={{ width: 0.5, background: "rgba(60,60,67,0.36)" }} />
                <button data-testid="ios-submit" onClick={() => setStep(4)} style={btn(true)}>Submit</button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ padding: "20px 16px 16px" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><AppIcon size={60} /></div>
              <p style={{ margin: "12px 0 2px", fontSize: 17, fontWeight: 600, color: "#000" }}>Thank you!</p>
              <p style={{ margin: 0, fontSize: 13, color: "#000", lineHeight: "17px" }}>Your rating has been submitted.</p>
            </div>
            <div style={row}>
              <button style={btn(false)}>Write a Review</button>
              <span style={{ width: 0.5, background: "rgba(60,60,67,0.36)" }} />
              <button onClick={() => setStep(1)} style={btn(true)}>OK</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Google Play: the sheet from the bottom ───
const playFont = { fontFamily: "'Google Sans', Roboto, Arial, sans-serif" };

function PlayLogo() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#5F6368", ...playFont }}>
      <svg width="16" height="17" viewBox="0 0 16 17" aria-hidden="true">
        <path d="M1 1l8.2 7.5L1 16z" fill="#00A0FF" />
        <path d="M1 1l11 6.2-2.8 1.3z" fill="#00F076" />
        <path d="M1 16l8.2-7.5 2.8 1.3z" fill="#FF3A44" />
        <path d="M12 7.2l3 1.6c.5.3.5.9 0 1.2l-3 1.6-2.8-3.1z" fill="#FFD500" />
      </svg>
      Google Play
    </span>
  );
}

function PlaySheet({ step, setStep }) {
  const [stars, setStars] = useState(step >= 3 ? 4 : 0);
  const [text, setText] = useState(step >= 4 ? "Planning was easy and the consultant was quick. Loved the day plans." : "");
  const pick = (n) => { setStars(n); if (step < 3) setStep(3); };
  const outline = { flex: 1, height: 38, borderRadius: 8, border: "1px solid #DADCE0", background: "#fff", color: PLAY_GREEN, fontSize: 14, fontWeight: 500, cursor: "pointer", ...playFont };
  const filled = (on) => ({ flex: 1, height: 38, borderRadius: 8, border: "none", background: on ? PLAY_GREEN : "#F1F3F4", color: on ? "#fff" : "#BDC1C6", fontSize: 14, fontWeight: 500, cursor: on ? "pointer" : "default", ...playFont });
  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <PlayLogo />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#202124", ...playFont }}>
        Aditi <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#F6AE2D", display: "grid", placeItems: "center" }}><User size={13} color="#fff" /></span>
      </span>
    </div>
  );
  const starRow = (size, gap) => (
    <div style={{ display: "flex", justifyContent: step >= 3 ? "flex-start" : "center", gap }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} data-testid={`play-star-${n}`} onClick={() => pick(n)} aria-label={`${n} stars`} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", display: "grid" }}>
          <Star size={size} color={n <= stars ? PLAY_GREEN : "#80868B"} fill={n <= stars ? PLAY_GREEN : "none"} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(32,33,36,0.45)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 5 }}>
      <div data-testid={`play-sheet-${step}`} style={{ background: "#fff", padding: "16px 18px 18px", borderRadius: "16px 16px 0 0", ...playFont }}>
        {step === 5 ? (
          <div style={{ textAlign: "center", padding: "16px 0 6px" }}>
            <p style={{ margin: 0, fontSize: 16, color: "#202124", lineHeight: "22px" }}>Thanks for<br />submitting a review!</p>
            <div style={{ position: "relative", width: 96, height: 84, margin: "14px auto 10px" }}>
              <Star size={84} color="#FBBC04" fill="#FBBC04" strokeWidth={1} style={{ position: "absolute", left: 6, top: 0 }} />
            </div>
            <button onClick={() => setStep(1)} style={{ border: "none", background: "none", color: PLAY_GREEN, fontSize: 14, fontWeight: 500, cursor: "pointer", ...playFont }}>Undo</button>
          </div>
        ) : step === 2 ? (
          <>
            {header}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AppIcon size={36} radius={8} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#202124" }}>{APP_NAME}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#5F6368", lineHeight: "15px" }}>Your review is public and includes your Google profile name and photo</p>
              </div>
            </div>
            <div style={{ margin: "20px 0 22px" }}>{starRow(36, 22)}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={outline}>Not now</button>
              <button disabled style={filled(false)}>Submit</button>
            </div>
          </>
        ) : (
          <>
            {header}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <AppIcon size={28} radius={6} />
              {starRow(26, 12)}
            </div>
            <div style={{ border: `${step === 4 ? 2 : 1}px solid ${step === 4 ? PLAY_GREEN : "#80868B"}`, borderRadius: 6, padding: "10px 12px", position: "relative" }}>
              {step === 4 && <span style={{ position: "absolute", top: -9, left: 10, background: "#fff", padding: "0 4px", fontSize: 11, color: PLAY_GREEN }}>Public review</span>}
              <textarea data-testid="play-text" value={text} onChange={(e) => { setText(e.target.value); setStep(4); }} onFocus={() => setStep(4)} placeholder="(Optional) Tell others what you think" rows={step === 4 ? 3 : 1}
                style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 14, color: "#202124", fontFamily: "inherit", padding: 0, background: "transparent" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 2px 14px", fontSize: 11, color: "#5F6368" }}>
              <span>{step === 4 ? "Optional" : "Public review"}</span>
              {step === 4 && <span>{text.length}/500</span>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={outline}>Cancel</button>
              <button data-testid="play-submit" onClick={() => setStep(5)} style={filled(true)}>Submit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── One flow on the phone ───
function Flow({ os, start }) {
  const [step, setStep] = useState(start);
  const ios = os === "ios";
  return (
    <div data-testid={`flow-${os}-${step}`} style={{ position: "relative", height: "100%", overflow: "hidden", background: C.white }}>
      <BookedScreen />
      {step >= 2 && (ios ? <IosAlert step={step} setStep={setStep} /> : <PlaySheet step={step} setStep={setStep} />)}
      {step === 1 && (
        <button data-testid="replay" onClick={() => setStep(2)} style={{ position: "absolute", left: "50%", top: 8, transform: "translateX(-50%)", zIndex: 6, border: `1px dashed ${C.icon}`, background: "#fff", borderRadius: 999, padding: "5px 12px", fontSize: 11.5, fontWeight: 600, color: C.sub, cursor: "pointer", fontFamily: "inherit" }}>
          Prototype: show the card again
        </button>
      )}
    </div>
  );
}

const STEPS = {
  ios: [
    [1, "Booking confirmed", "Our screen. 2 seconds after it settles, the app asks Apple."],
    [2, "Apple's card", "In the middle of the screen. Stars and Not Now."],
    [3, "Stars picked", "Cancel or Submit."],
    [4, "Submitted", "Apple thanks them and offers Write a Review."],
  ],
  android: [
    [1, "Booking confirmed", "Our screen. 2 seconds after it settles, the app asks Google."],
    [2, "Google Play's sheet", "From the bottom. Stars, Not now, Submit greyed out."],
    [3, "Stars picked", "An optional review box opens. Submit turns green."],
    [4, "Writing a review", "Up to 500 characters, public."],
    [5, "Submitted", "Google thanks them. Undo for a moment."],
  ],
};

function Index() {
  const navigate = useNavigate();
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "22px 16px 24px", background: C.white }} className="hide-scrollbar">
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: PINK }}>IN-APP RATING · BOTH STORES</p>
      <h1 style={{ margin: "6px 0 4px", fontSize: 24, fontWeight: 800, color: C.head, letterSpacing: -0.5 }}>How the rating card looks</h1>
      <p style={{ margin: 0, fontSize: 13.5, color: C.sub, lineHeight: "19px" }}>Shown over our booking confirmed screen. Tap any step; the stars and buttons work from there.</p>
      {[["ios", "iPhone: App Store"], ["android", "Android: Google Play"]].map(([os, name]) => (
        <div key={os} style={{ marginTop: 18 }}>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: C.head }}>{name}</p>
          <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden" }}>
            {STEPS[os].map(([n, t, d], i) => (
              <button key={n} onClick={() => navigate(`/rating-prompts/${os}-${n}`)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "none", borderTop: i ? `1px solid ${C.div}` : "none", background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.p100, color: PINK, fontSize: 11.5, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{n}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.head }}>{t}</span>
                  <span style={{ display: "block", fontSize: 12, color: C.sub }}>{d}</span>
                </span>
                <ChevronRight size={17} color={C.inact} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RatingPrompts() {
  const { screen } = useParams();
  const m = /^(ios|android)-(\d)$/.exec(screen || "");
  if (!m) return <Index />;
  return <Flow key={screen} os={m[1]} start={Number(m[2])} />;
}
