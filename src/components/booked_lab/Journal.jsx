// The travel-journal look for the travellers block on the home: dotted paper,
// a short loud headline with a handwritten aside, and cards taped down like
// prints. Chosen from five at /travellers-lab (option D).

const NAVY = "#181E4C";
const LAGOON_INK = "#007E72";
const PAD = 18;

// Faint dots on the page's own warm ground, like journal paper.
export const PAPER = "#FDF8F5 radial-gradient(rgba(24,30,76,0.07) 1px, transparent 1.2px) 0 0 / 16px 16px";

export function JournalHeader({ title = "Just booked", aside = "by real travellers" }) {
  return (
    // The aside hangs below the headline, so the block leaves room for it and
    // sits above the cards in case a tape reaches up into it.
    <div style={{ position: "relative", zIndex: 2, padding: `0 ${PAD}px`, marginBottom: 34 }}>
      <h2 style={{ margin: 0, fontFamily: "Figtree, system-ui, sans-serif", fontWeight: 800, fontSize: 40, lineHeight: "42px", letterSpacing: "-1.4px", color: NAVY }}>
        {title}
      </h2>
      <span style={{
        position: "absolute", left: 150, top: 34, fontFamily: "'Caveat', 'Figtree', cursive", fontSize: 25, fontWeight: 700,
        color: LAGOON_INK, transform: "rotate(-5deg)", whiteSpace: "nowrap",
      }}>{aside}</span>
    </div>
  );
}

// Washi tape in the brand's gold and lagoon, plus the trip-tag purple.
const TAPES = [
  "repeating-linear-gradient(45deg, rgba(253,162,1,0.55) 0 6px, rgba(253,162,1,0.38) 6px 12px)",
  "repeating-linear-gradient(45deg, rgba(0,168,152,0.45) 0 6px, rgba(0,168,152,0.3) 6px 12px)",
  "repeating-linear-gradient(45deg, rgba(83,74,183,0.38) 0 6px, rgba(83,74,183,0.24) 6px 12px)",
];

export function Tape({ i = 0 }) {
  return (
    <span aria-hidden="true" style={{
      position: "absolute", top: -9, left: "50%", width: 64, height: 20, marginLeft: -32, pointerEvents: "none",
      background: TAPES[i % TAPES.length], transform: `rotate(${i % 2 ? 3 : -4}deg)`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)", borderRadius: 2,
    }} />
  );
}

// ─── Titles for the rest of the journal ───
//
// "Just booked" is loud type with a handwritten aside. The two sections under
// it each get a different object from the same journal, so the page reads as
// one book without three headings that look alike.

const SANS = "Figtree, system-ui, sans-serif";
const SERIF = "'DM Serif Display', Georgia, serif";
const HAND = "'Caveat', 'Figtree', cursive";
const LAGOON = "#00A898";
const GOLD = "#FDA201";
const PAGE = "#FDF8F5";

// A hand-drawn five-point star, a little uneven on purpose.
function Doodle({ size = 18, rotate = 0, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)`, ...style }}>
      <path d="M12 2.6 L14.6 8.9 L21.3 9.3 L16.1 13.6 L17.9 20.4 L12 16.6 L6.2 20.6 L7.8 13.7 L2.6 9.5 L9.4 8.8 Z"
        fill={GOLD} stroke="#C77F00" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

// Moments 1. A strip of film, light lagoon, sprocket holes along both edges.
export function MomentsFilm({ title = "Traveller Moments" }) {
  const holes = { position: "absolute", left: 8, right: 8, height: 6, background: "repeating-linear-gradient(90deg, #fff 0 9px, transparent 9px 17px)", borderRadius: 2 };
  return (
    <div style={{ padding: `0 ${PAD}px`, marginBottom: 18 }}>
      <div style={{ position: "relative", display: "inline-block", transform: "rotate(-2deg)", background: "#D7F1EE", padding: "17px 18px", borderRadius: 4, boxShadow: "0 3px 10px rgba(0,80,72,0.12)" }}>
        <span style={{ ...holes, top: 5 }} />
        <span style={{ ...holes, bottom: 5 }} />
        <h2 style={{ margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 27, lineHeight: "30px", letterSpacing: "-0.8px", color: NAVY }}>{title}</h2>
      </div>
    </div>
  );
}

// Moments 2. Handwritten on a strip of kraft tape with torn ends, like a label
// stuck on the spine of a photo album.
export function MomentsLabel({ title = "Traveller Moments" }) {
  const torn = "polygon(0 8%, 3% 0, 6% 10%, 9% 2%, 91% 0, 94% 9%, 97% 1%, 100% 10%, 100% 90%, 97% 100%, 94% 91%, 91% 99%, 9% 100%, 6% 90%, 3% 98%, 0 92%)";
  return (
    <div style={{ padding: `0 ${PAD}px`, marginBottom: 16 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, transform: "rotate(1.5deg)", background: "#EFDDB8", padding: "6px 22px 8px", clipPath: torn }}>
        <h2 style={{ margin: 0, fontFamily: HAND, fontWeight: 700, fontSize: 38, lineHeight: "40px", color: NAVY }}>{title}</h2>
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
          <circle cx="13" cy="13" r="10.5" fill="none" stroke={NAVY} strokeWidth="1.8" strokeDasharray="60 4" />
          <path d="M10.5 8.5 L18 13 L10.5 17.5 Z" fill={NAVY} />
        </svg>
      </div>
    </div>
  );
}

// Moments 3. A postage stamp with a perforated edge and a postmark across it.
export function MomentsStamp({ title = "Moments", kicker = "Traveller" }) {
  const bite = (side) => ({
    position: "absolute", ...side,
    background: `radial-gradient(circle, ${PAGE} 3.2px, transparent 3.6px) 0 0 / 10px 10px`,
  });
  return (
    <div style={{ padding: `4px ${PAD + 4}px`, marginBottom: 18 }}>
      <div style={{ position: "relative", display: "inline-block", transform: "rotate(-2.5deg)", background: "#fff", padding: 9, boxShadow: "0 3px 10px rgba(120,86,40,0.14)" }}>
        <span style={bite({ top: -5, left: 0, right: 0, height: 10 })} />
        <span style={bite({ bottom: -5, left: 0, right: 0, height: 10 })} />
        <span style={bite({ left: -5, top: 0, bottom: 0, width: 10 })} />
        <span style={bite({ right: -5, top: 0, bottom: 0, width: 10 })} />
        <div style={{ border: `1.5px solid ${LAGOON}`, padding: "8px 40px 9px 12px", background: "#F1FAF9" }}>
          <span style={{ display: "block", fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#007E72", letterSpacing: "0.4px" }}>{kicker}</span>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 30, lineHeight: "32px", color: NAVY }}>{title}</h2>
        </div>
        {/* The postmark: a ring and wavy cancel lines, half on the stamp. */}
        <svg width="70" height="44" viewBox="0 0 70 44" aria-hidden="true" style={{ position: "absolute", right: -26, top: 10, opacity: 0.55 }}>
          <circle cx="20" cy="22" r="15" fill="none" stroke={NAVY} strokeWidth="1.6" />
          {[14, 22, 30].map((y) => <path key={y} d={`M38 ${y} q 6 -4 12 0 t 12 0`} fill="none" stroke={NAVY} strokeWidth="1.6" />)}
        </svg>
      </div>
    </div>
  );
}

// Reviews 1. A hand-drawn speech bubble around the title, stars doodled beside.
export function ReviewsBubble({ title = "Traveller Reviews" }) {
  return (
    // Shrinks to the bubble, so the stars sit just past its end, not at the page edge.
    <div style={{ position: "relative", display: "inline-block", marginBottom: 18, paddingTop: 4, paddingRight: 52 }}>
      <div style={{ position: "relative", display: "inline-block", padding: "12px 20px 14px" }}>
        <svg viewBox="0 0 260 74" preserveAspectRatio="none" aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "calc(100% + 12px)", overflow: "visible" }}>
          <path d="M18 4 C 90 0, 190 2, 244 6 C 258 8, 258 50, 246 56 C 190 60, 100 60, 52 58 L 30 72 L 36 57 C 20 56, 6 52, 6 40 C 4 26, 4 8, 18 4 Z"
            fill="#fff" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <h2 style={{ position: "relative", margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 26, lineHeight: "30px", letterSpacing: "-0.7px", color: NAVY, whiteSpace: "nowrap" }}>{title}</h2>
      </div>
      <Doodle size={20} rotate={-12} style={{ position: "absolute", right: 34, top: 0 }} />
      <Doodle size={14} rotate={14} style={{ position: "absolute", right: 14, top: 22 }} />
      <Doodle size={11} rotate={-4} style={{ position: "absolute", right: 40, top: 36 }} />
    </div>
  );
}

// Reviews 2. Serif title under a row of five doodled stars, each a bit askew.
export function ReviewsStars({ title = "Traveller Reviews" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[-8, 6, -3, 9, -6].map((r, i) => <Doodle key={i} size={22} rotate={r} style={{ marginTop: i % 2 ? 3 : 0 }} />)}
      </div>
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 33, lineHeight: "36px", color: NAVY }}>
        Traveller{" "}
        <span style={{ position: "relative", display: "inline-block" }}>
          Reviews
          <svg viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: -9, width: "100%", height: 12 }}>
            <path d="M3 6 C 60 2, 140 3, 197 5 M10 13 C 70 9, 130 10, 188 12" fill="none" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </span>
      </h2>
    </div>
  );
}

// Reviews 3. A note pinned to the page with a strip of tape, a big gold quote
// mark leading the title.
export function ReviewsNote({ title = "Traveller Reviews" }) {
  return (
    <div style={{ marginBottom: 20, paddingTop: 10 }}>
      <div style={{ position: "relative", display: "inline-flex", alignItems: "flex-start", gap: 6, transform: "rotate(-1.5deg)", background: "#fff", padding: "10px 18px 12px 12px", borderRadius: 3, boxShadow: "0 4px 12px rgba(120,86,40,0.12)" }}>
        <span aria-hidden="true" style={{ position: "absolute", top: -10, left: 14, width: 54, height: 18, transform: "rotate(-6deg)", background: "repeating-linear-gradient(45deg, rgba(0,168,152,0.45) 0 6px, rgba(0,168,152,0.3) 6px 12px)" }} />
        <span aria-hidden="true" style={{ fontFamily: SERIF, fontSize: 64, lineHeight: "52px", color: GOLD, marginTop: 2 }}>“</span>
        <h2 style={{ margin: "6px 0 0", fontFamily: SANS, fontWeight: 800, fontSize: 25, lineHeight: "29px", letterSpacing: "-0.7px", color: NAVY }}>{title}</h2>
      </div>
    </div>
  );
}
