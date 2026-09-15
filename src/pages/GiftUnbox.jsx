import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, ArrowRight, Play, RotateCcw } from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import { DEMO_CODES, getOccasion, inr, track } from "../data/giftData";
import GiftCardArt from "../components/Gift/GiftCardArt";
import Logo from "../components/Logo";

// ─── The unboxing ────────────────────────────────────────────────────────
// Tapping a gift link opens a browser, not the app. That page is the whole
// gift as far as the receiver is concerned, so it gets a moment of its own
// before the money and the terms turn up. Four concepts, four routes, all
// drawn in SVG and CSS so nothing waits on a download.

export const CONCEPTS = [
  {
    id: "handover",
    name: "The handover",
    line: "Someone holds it out to you",
    note: "Two hands offer a wrapped box. Take it, the lid lifts away, the card rises out.",
    ground: "linear-gradient(178deg,#1B0A11 0%,#33101F 46%,#5C1029 100%)",
    ink: "#FFFFFF",
    onInk: "#2A0C16",
    dim: "rgba(255,255,255,0.66)",
    accent: "#FF7A9C",
  },
  {
    id: "ribbon",
    name: "The ribbon",
    line: "Pull the bow and it bursts",
    note: "A ribboned box. The bow unties, the lid springs open, the card pops out.",
    ground: "linear-gradient(178deg,#FFF6F1 0%,#FFE7DD 52%,#FFD3C4 100%)",
    ink: "#3A1520",
    onInk: "#FFFFFF",
    dim: "rgba(58,21,32,0.62)",
    accent: "#E31B53",
  },
  {
    id: "envelope",
    name: "The envelope",
    line: "Break the seal, slide it out",
    note: "A sealed envelope. Crack the wax, the flap falls open, the card slides up.",
    ground: "linear-gradient(178deg,#FBF8F2 0%,#F2EADC 54%,#E5D9C3 100%)",
    ink: "#2E2617",
    onInk: "#FFFFFF",
    dim: "rgba(46,38,23,0.6)",
    accent: "#A8762B",
  },
  {
    id: "boarding",
    name: "The boarding pass",
    line: "Your name on the departure board",
    note: "The board flickers your name in, a stamp lands, the stub tears off and becomes the card.",
    ground: "linear-gradient(178deg,#080D1A 0%,#0E1830 48%,#152546 100%)",
    ink: "#F2F5FF",
    onInk: "#0B1224",
    dim: "rgba(242,245,255,0.62)",
    accent: "#5FC8FF",
  },
];

const getConcept = (id) => CONCEPTS.find(c => c.id === id) || CONCEPTS[0];

/* ═══════════════════════════ The experience ═══════════════════════════ */

export default function GiftUnbox() {
  const { concept: conceptId, code } = useParams();
  const navigate = useNavigate();
  const { findCode } = useGifting();
  const t = getConcept(conceptId);

  const [phase, setPhase] = useState("idle");
  const card = findCode(code || DEMO_CODES[0].code) || { ...DEMO_CODES[0], sentAt: Date.now() };
  const occ = getOccasion(card.occasion);
  const fromName = card.from || card.fromName || "A friend";

  const open = () => {
    if (phase !== "idle") return;
    track("gift_unbox_open", { concept: t.id });
    setPhase("opening");
    setTimeout(() => setPhase("revealed"), t.id === "boarding" ? 2600 : 1500);
  };

  const Scene = SCENES[t.id];

  return (
    <div style={{
      height: "100%", background: t.ground, color: t.ink, position: "relative",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* This is a browser, not the app, and the page should admit it. */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 6, padding: "12px 16px 0",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px",
          borderRadius: 999, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.2px",
          background: "rgba(127,127,127,0.16)", color: t.dim,
        }}>
          <Lock size={9} /> 30sundays.club
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {phase === "revealed" ? (
          <Revealed t={t} card={card} occ={occ} fromName={fromName}
            onAdd={() => navigate(`/g/${card.code}`)} onAgain={() => setPhase("idle")} />
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "0 24px 40px", textAlign: "center",
          }}>
            <Logo variant="lockup" height={20} mono={t.ink} style={{ opacity: 0.72, marginBottom: 26 }} />
            <p style={{
              fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase",
              color: t.accent, margin: "0 0 10px",
            }}>{occ.label} gift</p>
            <h1 style={{
              fontSize: 25, fontWeight: 700, letterSpacing: "-0.6px", lineHeight: "31px",
              margin: "0 0 8px", color: t.ink,
            }}>{fromName} sent you something</h1>
            <p style={{ fontSize: 13.5, color: t.dim, margin: "0 0 34px", lineHeight: "19px" }}>
              {phase === "opening" ? "Here it comes." : t.line}
            </p>

            <button onClick={open} aria-label="Open the gift" style={{
              background: "none", border: "none", padding: 0, cursor: phase === "idle" ? "pointer" : "default",
              width: "100%", maxWidth: 300,
            }}>
              <Scene phase={phase} t={t} card={card} />
            </button>

            {phase === "idle" && (
              <p style={{
                fontSize: 12.5, fontWeight: 700, color: t.accent, margin: "30px 0 0",
                animation: "pulse 2.2s ease-in-out infinite",
              }}>Tap to open</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── After the reveal: the card, then the one thing to do next ── */

function Revealed({ t, card, occ, fromName, onAdd, onAgain }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 22px 26px" }}>
      <div style={{ textAlign: "center", animation: "unboxWordIn 0.5s ease-out both" }}>
        <Logo variant="lockup" height={19} mono={t.ink} style={{ opacity: 0.7, marginBottom: 18 }} />
        <p style={{
          fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase",
          color: t.accent, margin: "0 0 8px",
        }}>{occ.label} gift</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.6px", margin: 0, color: t.ink }}>
          {fromName} sent you {inr(card.amount)}
        </h1>
      </div>

      <div style={{
        margin: "22px 0 0",
        animation: "unboxCardRise 0.7s cubic-bezier(.22,1,.36,1) both",
      }}>
        <GiftCardArt artId={card.artId} occasion={card.occasion} amount={card.amount}
          toName={card.toName} fromName={fromName} size="lg" />
      </div>

      {card.message && (
        <p style={{
          fontSize: 14, color: t.dim, margin: "20px 0 0", lineHeight: "21px",
          fontStyle: "italic", textAlign: "center",
          animation: "unboxWordIn 0.5s 0.25s ease-out both",
        }}>&ldquo;{card.message}&rdquo;</p>
      )}

      <div style={{ flex: 1, minHeight: 22 }} />

      <div style={{ animation: "unboxWordIn 0.5s 0.4s ease-out both" }}>
        <button onClick={onAdd} style={{
          width: "100%", padding: "16px 0", borderRadius: 14, border: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 15.5, fontWeight: 700,
          background: t.ink, color: t.onInk,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Add {inr(card.amount)} to my wallet <ArrowRight size={17} />
        </button>
        <p style={{ fontSize: 12, color: t.dim, margin: "12px 0 0", textAlign: "center", lineHeight: "17px" }}>
          It becomes travel credit for any 30 Sundays trip.
        </p>
        <button onClick={onAgain} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          width: "100%", margin: "14px 0 0", padding: "6px 0", background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: t.dim,
        }}>
          <RotateCcw size={12} /> Watch it again
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Scene 1: the handover ═══════════════════════════ */

// Box and hands live in one SVG, so the lid always sits on the body and the
// body always sits on the palms, whatever the container width.
function HandoverScene({ phase, t }) {
  const opening = phase !== "idle";
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
      {opening && <Glow color={t.accent} />}

      {/* The card rises from behind the box */}
      {opening && (
        <Centre top="20%" width="60%">
          <div style={{ animation: "unboxCardRise 0.9s 0.5s cubic-bezier(.22,1,.36,1) both" }}>
            <MiniCard t={t} />
          </div>
        </Centre>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: "4%" }}>
        <svg viewBox="0 0 200 156" style={{ width: "100%", display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="hoShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.17" />
            </linearGradient>
          </defs>

          {/* box body */}
          <g style={{
            transformBox: "fill-box", transformOrigin: "center",
            animation: opening
              ? "unboxBoxSink 0.9s 0.4s cubic-bezier(.4,0,.7,1) both"
              : "unboxFloat 3.8s ease-in-out infinite",
          }}>
            <rect x="62" y="46" width="76" height="52" rx="5" fill="#F4C9D6" />
            <rect x="62" y="46" width="76" height="52" rx="5" fill="url(#hoShade)" />
            <rect x="92" y="46" width="16" height="52" fill={t.accent} opacity="0.92" />
          </g>

          {/* lid, which leaves */}
          <g style={{
            transformBox: "fill-box", transformOrigin: "center",
            animation: opening
              ? "unboxLidOff 1s cubic-bezier(.3,-0.2,.6,1) both"
              : "unboxFloat 3.8s ease-in-out infinite",
          }}>
            <rect x="56" y="30" width="88" height="20" rx="5" fill="#FFE2EA" />
            <rect x="92" y="30" width="16" height="20" fill={t.accent} />
            <path d="M100 31 C88 16 76 20 82 29 C86 34 94 33 100 31 Z" fill={t.accent} />
            <path d="M100 31 C112 16 124 20 118 29 C114 34 106 33 100 31 Z" fill={t.accent} />
            <circle cx="100" cy="30" r="4" fill="#FFF" opacity="0.9" />
          </g>

          {/* Hands, palms up. Fingers are staggered and stop short of the
              middle, so the two hands read as two hands and not one mound. */}
          <g style={{ animation: "unboxHandsIn 0.7s cubic-bezier(.22,1,.36,1) both" }}>
            {[false, true].map(flip => (
              <g key={String(flip)} transform={flip ? "translate(200,0) scale(-1,1)" : undefined}>
                {/* palm, sitting lower and darker than the fingers */}
                <path d="M96 110 L52 110 C32 110 16 121 10 136 C6 146 14 153 26 153 L96 153 Z" fill="#CE9670" />
                {/* thumb, on the outside where it can be seen */}
                <path d="M20 120 C8 121 2 132 9 140 C16 147 29 143 31 132 Z" fill="#E3AC85" />
                {/* fingers, tips toward the centre with a seam left between */}
                <rect x="54" y="97" width="44" height="11" rx="5.5" fill="#E9B58D" />
                <rect x="46" y="107" width="52" height="11" rx="5.5" fill="#E0A981" />
                <rect x="40" y="117" width="58" height="11" rx="5.5" fill="#D7A079" />
                <rect x="38" y="127" width="60" height="11" rx="5.5" fill="#CE9670" />
              </g>
            ))}
            <rect x="0" y="132" width="24" height="24" rx="6" fill="#2B3446" />
            <rect x="176" y="132" width="24" height="24" rx="6" fill="#2B3446" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Scene 2: the ribbon ═══════════════════════════ */

function RibbonScene({ phase, t }) {
  const opening = phase !== "idle";
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
      {opening && <Glow color={t.accent} />}
      {opening && <Confetti accent={t.accent} />}

      {/* The card, popping out from behind the lid */}
      {opening && (
        <Centre top="16%" width="64%">
          <div style={{ animation: "unboxCardPop 1s 0.55s cubic-bezier(.22,1,.36,1) both" }}>
            <MiniCard t={t} />
          </div>
        </Centre>
      )}

      <div style={{ position: "absolute", left: 0, right: 0, bottom: "8%" }}>
        <svg viewBox="0 0 200 168" style={{ width: "100%", display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="rbShade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.14" />
            </linearGradient>
          </defs>

          {/* body, and the ribbon that slips off it */}
          <rect x="26" y="62" width="148" height="100" rx="7" fill="#FFFFFF" />
          <rect x="26" y="62" width="148" height="100" rx="7" fill="url(#rbShade)" />
          <g style={{
            transformBox: "fill-box", transformOrigin: "50% 0%",
            animation: opening ? "unboxRibbonSlip 0.5s 0.3s ease-in both" : "none",
          }}>
            <rect x="90" y="62" width="20" height="100" fill={t.accent} />
          </g>

          {/* lid, hinged at its back edge */}
          <g style={{
            transformBox: "fill-box", transformOrigin: "50% 100%",
            animation: opening ? "unboxLidHinge 0.6s 0.4s cubic-bezier(.4,0,.3,1.4) both" : "none",
          }}>
            <rect x="18" y="42" width="164" height="24" rx="6" fill="#FFFFFF" />
            <rect x="18" y="42" width="164" height="24" rx="6" fill="url(#rbShade)" />
            <rect x="90" y="42" width="20" height="24" fill={t.accent} />
          </g>

          {/* bow, which unties and drops away */}
          <g style={{
            transformBox: "fill-box", transformOrigin: "center",
            animation: opening
              ? "unboxBowUntie 0.75s cubic-bezier(.4,0,.7,1) both"
              : "unboxNudge 3.2s ease-in-out infinite",
          }}>
            <path d="M100 30 L88 62" stroke={t.accent} strokeWidth="7" strokeLinecap="round" />
            <path d="M100 30 L114 60" stroke={t.accent} strokeWidth="7" strokeLinecap="round" />
            <path d="M100 28 C74 2 52 8 60 26 C66 38 84 35 100 28 Z" fill={t.accent} />
            <path d="M100 28 C126 2 148 8 140 26 C134 38 116 35 100 28 Z" fill={t.accent} />
            <path d="M100 28 C88 28 78 18 74 13" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.42" />
            <path d="M100 28 C112 28 122 18 126 13" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.42" />
            <circle cx="100" cy="28" r="9" fill={t.accent} />
            <circle cx="100" cy="28" r="9" fill="#fff" opacity="0.18" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Scene 3: the envelope ═══════════════════════════ */

function EnvelopeScene({ phase, t }) {
  const opening = phase !== "idle";
  // Once the flap is past halfway it has folded behind the envelope, so it has
  // to stop sitting in front of the card that is about to slide out.
  const [flapBack, setFlapBack] = useState(false);
  useEffect(() => {
    if (!opening) { setFlapBack(false); return; }
    const id = setTimeout(() => setFlapBack(true), 460);
    return () => clearTimeout(id);
  }, [opening]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
      {opening && <Glow color={t.accent} />}

      <div style={{
        position: "absolute", left: 0, right: 0, top: "24%",
        animation: opening ? "none" : "unboxFloat 4.2s ease-in-out infinite",
      }}>
        {/* The card, sliding out from behind the pocket */}
        {opening && (
          <div style={{
            position: "absolute", left: "9%", right: "9%", top: "12%", zIndex: 1,
            animation: "unboxCardSlide 0.85s 0.55s cubic-bezier(.22,1,.36,1) both",
          }}>
            <MiniCard t={t} />
          </div>
        )}

        {/* Envelope front pocket, drawn over the card so it slides out of it */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <svg viewBox="0 0 200 128" style={{ width: "100%", display: "block" }}>
            <rect x="0" y="26" width="200" height="102" rx="6" fill="#F6EFE0" />
            <path d="M0 128 L0 40 L100 104 L200 40 L200 128 Z" fill="#EDE2CC" />
            <path d="M0 128 L100 66 L200 128 Z" fill="#F8F2E6" />
            <path d="M0 128 L100 66 L200 128 Z" fill="url(#enShade)" />
            <defs>
              <linearGradient id="enShade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#000" stopOpacity="0.06" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* The back flap, hinged at the top */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: 0, zIndex: flapBack ? 0 : 3,
          perspective: 700,
        }}>
          <div style={{
            transformOrigin: "50% 20.3%", transformStyle: "preserve-3d",
            animation: opening ? "unboxFlapOpen 0.7s 0.3s cubic-bezier(.4,0,.3,1) both" : "none",
          }}>
            <svg viewBox="0 0 200 128" style={{ width: "100%", display: "block" }}>
              <path d="M0 26 L100 96 L200 26 Z" fill="#EFE5D0" />
              <path d="M0 26 L100 96 L200 26 Z" fill="url(#flShade)" />
              <path d="M0 26 L200 26" stroke="#E2D5B9" strokeWidth="1.5" />
              <defs>
                <linearGradient id="flShade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#000" stopOpacity="0" />
                  <stop offset="1" stopColor="#000" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Wax seal */}
        <div style={{
          position: "absolute", left: "50%", top: "48%", width: "17%", zIndex: 4,
          transform: "translate(-50%,-50%)",
        }}>
        <div style={{
          animation: opening
            ? "unboxSealCrack 0.45s cubic-bezier(.4,0,.7,1) both"
            : "unboxNudge 3.6s ease-in-out infinite",
        }}>
          <svg viewBox="0 0 44 44" style={{ width: "100%", display: "block" }}>
            <path d="M22 1 L28 5 L35 4 L38 11 L43 16 L41 23 L43 30 L38 34 L35 41 L28 40 L22 44 L16 40 L9 41 L6 34 L1 30 L3 23 L1 16 L6 11 L9 4 L16 5 Z"
              fill={t.accent} />
            <circle cx="22" cy="22" r="12" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
            <text x="22" y="27" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" opacity="0.85">30</text>
          </svg>
        </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Scene 4: the boarding pass ═══════════════════════════ */

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const FLAPS = 9;

function boardName(name) {
  const words = String(name || "").toUpperCase().replace(/[^A-Z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  let out = "";
  for (const w of words) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > FLAPS) break;
    out = next;
  }
  return out || "YOU";
}

function BoardingScene({ phase, t, card }) {
  const opening = phase !== "idle";
  // Nine flaps. Fill them with whole words, so "Ishaan and Tara" reads
  // "ISHAAN" rather than being sliced into "ISHAAN AN".
  const target = boardName(card.toName);
  const [letters, setLetters] = useState(() => target.split("").map(() => " "));
  const timer = useRef(null);

  // A split-flap board settles one column at a time, left to right.
  useEffect(() => {
    if (!opening) { setLetters(target.split("").map(() => " ")); return; }
    let tick = 0;
    timer.current = setInterval(() => {
      tick += 1;
      setLetters(target.split("").map((ch, i) => {
        const settleAt = 4 + i * 3;
        if (tick >= settleAt) return ch;
        if (ch === " ") return " ";
        return FLAP_CHARS[(tick * 7 + i * 5) % FLAP_CHARS.length];
      }));
      if (tick > 4 + target.length * 3) clearInterval(timer.current);
    }, 70);
    return () => clearInterval(timer.current);
  }, [opening, target]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
      {opening && <Glow color={t.accent} />}

      {/* Departure board */}
      <div style={{
        display: "flex", gap: 3, justifyContent: "center",
        animation: opening ? "none" : "unboxNudge 4s ease-in-out infinite",
      }}>
        {letters.map((ch, i) => (
          <span key={i} style={{
            width: 20, height: 27, borderRadius: 3, flexShrink: 0,
            background: "#0A1020", border: "1px solid rgba(95,200,255,0.22)",
            display: "grid", placeItems: "center",
            fontSize: 14, fontWeight: 800, color: t.accent,
            fontFamily: "ui-monospace, Menlo, monospace",
            boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.08)",
          }}>{ch === " " ? "" : ch}</span>
        ))}
      </div>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
        color: t.dim, margin: 0, textAlign: "center",
      }}>{opening ? "Boarding" : "Departures"}</p>

      {/* Boarding pass, with a stub that tears away */}
      <div style={{ position: "relative", padding: "0 2px" }}>
        <svg viewBox="0 0 240 96" style={{ width: "100%", display: "block" }}>
          {/* main body stays */}
          <rect x="0" y="4" width="176" height="88" rx="7" fill="#F4F7FF" />
          <text x="14" y="26" fontSize="8" fontWeight="800" fill="#7A8AA8" letterSpacing="1.4">30 SUNDAYS AIR</text>
          <text x="14" y="52" fontSize="21" fontWeight="800" fill="#101A2E">DEL</text>
          <path d="M60 45 L84 45" stroke="#B4C2DA" strokeWidth="1.4" strokeDasharray="3 3" />
          <path d="M86 40 l9 5 -9 5 2-5 z" fill={t.accent} />
          <text x="102" y="52" fontSize="21" fontWeight="800" fill="#101A2E">ANY</text>
          <text x="14" y="72" fontSize="7.5" fontWeight="700" fill="#7A8AA8" letterSpacing="1">SEAT</text>
          <text x="44" y="72" fontSize="7.5" fontWeight="700" fill="#101A2E">OPEN</text>
          <text x="86" y="72" fontSize="7.5" fontWeight="700" fill="#7A8AA8" letterSpacing="1">CLASS</text>
          <text x="122" y="72" fontSize="7.5" fontWeight="700" fill="#101A2E">GIFT</text>
          <path d="M176 4 L176 92" stroke="#C9D4E8" strokeWidth="1.5" strokeDasharray="5 5" />
        </svg>

        {/* the stub */}
        <div style={{
          position: "absolute", right: 2, top: 0, width: "26.6%", height: "100%",
          animation: opening ? "unboxTear 0.7s 1.55s cubic-bezier(.5,0,.75,0) both" : "none",
        }}>
          <svg viewBox="0 0 64 96" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d="M0 4 L57 4 A7 7 0 0 1 64 11 L64 85 A7 7 0 0 1 57 92 L0 92 Z" fill="#E8EEFB" />
            <text x="32" y="34" fontSize="7.5" fontWeight="800" fill="#7A8AA8" textAnchor="middle" letterSpacing="1">GIFT</text>
            <text x="32" y="52" fontSize="15" fontWeight="800" fill="#101A2E" textAnchor="middle">30S</text>
            <text x="32" y="72" fontSize="6.5" fontWeight="700" fill="#7A8AA8" textAnchor="middle" letterSpacing="0.8">ADMIT ONE</text>
          </svg>
        </div>

        {/* the stamp */}
        {opening && (
          <div style={{
            position: "absolute", left: "42%", top: "-6%", width: "34%",
            animation: "unboxStampDown 0.6s 0.85s cubic-bezier(.3,1.6,.5,1) both",
          }}>
            <svg viewBox="0 0 90 62" style={{ width: "100%", display: "block" }}>
              <rect x="2" y="2" width="86" height="58" rx="6" fill="none" stroke={t.accent} strokeWidth="3" opacity="0.9" />
              <text x="45" y="27" fontSize="13" fontWeight="800" fill={t.accent} textAnchor="middle" letterSpacing="1">CLEARED</text>
              <text x="45" y="45" fontSize="9" fontWeight="700" fill={t.accent} textAnchor="middle" letterSpacing="1.6" opacity="0.9">ANYWHERE</text>
            </svg>
          </div>
        )}

        {/* the card the stub turns into */}
        {opening && (
          <div style={{
            position: "absolute", left: "16%", right: "16%", top: "6%",
            animation: "unboxCardRise 0.85s 2.05s cubic-bezier(.22,1,.36,1) both",
          }}>
            <MiniCard t={t} />
          </div>
        )}
      </div>
    </div>
  );
}

const SCENES = {
  handover: HandoverScene,
  ribbon: RibbonScene,
  envelope: EnvelopeScene,
  boarding: BoardingScene,
};

/* ═══════════════════════════ Shared scene bits ═══════════════════════════ */

// A stand-in card inside the scene. The real artwork lands on the next screen,
// so this only has to read as "a card came out of it".
function MiniCard({ t }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "5 / 3", borderRadius: 9,
      background: "linear-gradient(150deg,#2A0F1A 0%,#5C1029 55%,#8E1740 100%)",
      boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "9%", boxSizing: "border-box", overflow: "hidden",
    }}>
      <Logo variant="mark" height={16} mono="#FFFFFF" style={{ opacity: 0.9 }} />
      <div>
        <div style={{ height: 4, width: "46%", borderRadius: 2, background: t.accent, opacity: 0.9 }} />
        <div style={{ height: 3, width: "30%", borderRadius: 2, background: "rgba(255,255,255,0.4)", marginTop: 5 }} />
      </div>
    </div>
  );
}

function Glow({ color }) {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", left: "50%", top: "42%", width: "78%", aspectRatio: "1 / 1",
      transform: "translate(-50%,-50%)", pointerEvents: "none",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: `radial-gradient(circle, ${color}66 0%, ${color}00 68%)`,
        animation: "unboxGlow 1.3s 0.35s ease-out both",
      }} />
    </div>
  );
}

// Centres an absolutely placed child, leaving the child's own transform free
// for its animation to use.
function Centre({ top, width, children }) {
  return (
    <div style={{ position: "absolute", left: "50%", top, width, transform: "translateX(-50%)" }}>
      {children}
    </div>
  );
}

const CONFETTI = [
  [-96, -150, "420deg"], [-52, -178, "-300deg"], [-14, -196, "520deg"],
  [30, -182, "-380deg"], [74, -152, "300deg"], [110, -110, "-460deg"],
  [-124, -96, "260deg"], [122, -60, "-260deg"], [-70, -130, "340deg"], [58, -128, "-340deg"],
];

function Confetti({ accent }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "34%", pointerEvents: "none" }}>
      {CONFETTI.map(([cx, cy, cr], i) => (
        <span key={i} style={{
          position: "absolute", width: i % 3 === 0 ? 5 : 7, height: i % 3 === 0 ? 9 : 5,
          borderRadius: 1.5,
          background: i % 4 === 0 ? accent : i % 4 === 1 ? "#FFC24B" : i % 4 === 2 ? "#4EC9A5" : "#FFFFFF",
          "--cx": `${cx}px`, "--cy": `${cy}px`, "--cr": cr,
          animation: `unboxConfetti ${0.9 + (i % 4) * 0.14}s ${0.5 + (i % 5) * 0.05}s cubic-bezier(.2,.6,.4,1) both`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════ The concept gallery ═══════════════════════════ */

export function UnboxGallery() {
  const navigate = useNavigate();
  const demo = DEMO_CODES[0].code;

  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, padding: "16px 18px 0" }}>
        <p style={{
          fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase",
          color: C.p600, margin: "0 0 8px",
        }}>Concepts</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.head, margin: "0 0 6px", letterSpacing: "-0.6px" }}>
          Opening the gift
        </h1>
        <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "19px" }}>
          Four takes on what the receiver sees when they tap the link in the browser.
          Each one ends on the card and the same one action.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {CONCEPTS.map(c => (
          <button key={c.id} onClick={() => navigate(`/unbox/${c.id}/${demo}`)} style={{
            display: "flex", gap: 14, alignItems: "center", width: "100%", padding: 12,
            borderRadius: 14, border: `1px solid ${C.div}`, background: C.white,
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          }}>
            <span style={{
              width: 66, height: 66, borderRadius: 12, flexShrink: 0, background: c.ground,
              display: "grid", placeItems: "center",
            }}>
              <ConceptGlyph id={c.id} accent={c.accent} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.head, letterSpacing: "-0.2px" }}>
                {c.name}
              </span>
              <span style={{ display: "block", fontSize: 12.5, color: C.p600, fontWeight: 600, margin: "2px 0 4px" }}>
                {c.line}
              </span>
              <span style={{ display: "block", fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{c.note}</span>
            </span>
            <span style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: C.p100,
              display: "grid", placeItems: "center",
            }}><Play size={14} color={C.p600} fill={C.p600} /></span>
          </button>
        ))}

        <p style={{ fontSize: 12, color: C.inact, margin: "6px 2px 0", lineHeight: "17px" }}>
          Every concept can be opened straight from a link, for example{" "}
          <Link to={`/unbox/ribbon/${demo}`} style={{ color: C.p600, fontWeight: 600 }}>
            /unbox/ribbon/{demo}
          </Link>.
        </p>
      </div>
    </div>
  );
}

// A 26px mark for each concept, so the gallery reads without playing anything.
function ConceptGlyph({ id, accent }) {
  const s = { width: 34, height: 34, display: "block" };
  if (id === "handover") return (
    <svg viewBox="0 0 34 34" style={s}>
      <rect x="9" y="8" width="16" height="12" rx="2" fill="#F4C9D6" />
      <rect x="15" y="8" width="4" height="12" fill={accent} />
      <path d="M6 24 C9 21 14 21 17 21 C20 21 25 21 28 24 L28 27 L6 27 Z" fill="#E8B58F" />
    </svg>
  );
  if (id === "ribbon") return (
    <svg viewBox="0 0 34 34" style={s}>
      <rect x="6" y="14" width="22" height="14" rx="2" fill="#fff" />
      <rect x="15" y="14" width="4" height="14" fill={accent} />
      <path d="M17 12 C11 5 6 7 8 12 C10 15 14 14 17 12 Z" fill={accent} />
      <path d="M17 12 C23 5 28 7 26 12 C24 15 20 14 17 12 Z" fill={accent} />
    </svg>
  );
  if (id === "envelope") return (
    <svg viewBox="0 0 34 34" style={s}>
      <rect x="4" y="9" width="26" height="17" rx="2" fill="#F6EFE0" />
      <path d="M4 9 L17 19 L30 9" fill="none" stroke="#D8C9A8" strokeWidth="1.6" />
      <circle cx="17" cy="19" r="4" fill={accent} />
    </svg>
  );
  return (
    <svg viewBox="0 0 34 34" style={s}>
      <rect x="4" y="11" width="26" height="13" rx="2" fill="#F4F7FF" />
      <path d="M23 11 L23 24" stroke="#C9D4E8" strokeWidth="1.4" strokeDasharray="2 2" />
      <path d="M8 17 L15 17" stroke="#7A8AA8" strokeWidth="1.4" />
      <path d="M16 14 l5 3 -5 3 1-3 z" fill={accent} />
    </svg>
  );
}
