import { Clock, Plane, Ticket } from "lucide-react";

// ─── Ten ways to say who booked it, and when ───
//
// "Aanya booked 3h ago" is the proof on this card: a real person, recently.
// It used to sit in small grey type under the photo. Each option here lifts it,
// either onto the photo or into a strip of its own between photo and facts.
//
// No pink or red: those mean the one primary action. Colours come from the
// brand board (golden hour, lagoon, tropical forest) plus the blue and purple
// the app already uses for trip-style tags.

const GOLD = "#FDA201";
const GOLD_TINT = "#FFF4E0";
const GOLD_INK = "#7A4A00";
const FOREST = "#254342";
const LAGOON = "#00A898";
const LAGOON_TINT = "#E5F6F5";
const LAGOON_INK = "#007E72";
const BLUE = "#175CD3";
const PURPLE = "#534AB7";

const initial = (name) => (name || "?").trim()[0].toUpperCase();

function Avatar({ name, size = 22, bg, fg, ring }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", background: bg, color: fg, flexShrink: 0,
      display: "grid", placeItems: "center", fontSize: size * 0.48, fontWeight: 800, lineHeight: 1,
      boxShadow: ring ? `0 0 0 ${ring}` : "none",
    }}>{initial(name)}</span>
  );
}

// place: "overlay" sits on the photo, "strip" sits between photo and facts.
export const BADGES = {
  // 1. A gold ribbon with a swallowtail end, pinned to the photo's right edge.
  ribbon: {
    place: "overlay",
    render: (t) => (
      <span style={{ position: "absolute", top: 12, right: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}>
        <span style={{
          display: "block", background: GOLD, color: "#2B1D00", padding: "6px 12px 6px 18px",
          clipPath: "polygon(10px 50%, 0 0, 100% 0, 100% 100%, 0 100%)",
          fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
        }}>
          <strong style={{ fontWeight: 800 }}>{t.who}</strong> booked {t.when}
        </span>
      </span>
    ),
  },

  // 2. Frosted dark glass on the photo, one line along the bottom left, with
  //    a live dot for "this just happened". The one that ships.
  glass: {
    place: "overlay",
    render: (t) => (
      <span style={{
        position: "absolute", left: 10, bottom: 10, maxWidth: "calc(100% - 20px)", boxSizing: "border-box",
        display: "flex", alignItems: "center", gap: 7,
        padding: "6px 11px 6px 9px", borderRadius: 10,
        background: "rgba(14,22,30,0.48)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.22)", color: "#fff",
      }}>
        <span style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#3CCB7F" }} />
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#3CCB7F", animation: "bbPing 1.8s ease-out infinite" }} />
        </span>
        <span style={{ minWidth: 0, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <strong style={{ fontSize: 13, fontWeight: 800 }}>{t.who}</strong>
          <span style={{ opacity: 0.88 }}> booked {t.when}</span>
        </span>
      </span>
    ),
  },

  // 3. A tab hanging from the top edge, deep forest green with a gold initial.
  tab: {
    place: "overlay",
    render: (t) => (
      <span style={{
        position: "absolute", top: 0, right: 14, display: "flex", alignItems: "center", gap: 7,
        padding: "7px 11px 8px 8px", borderRadius: "0 0 12px 12px", background: FOREST, color: "#fff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.22)",
      }}>
        <Avatar name={t.who} size={22} bg={GOLD} fg={FOREST} />
        <span style={{ fontSize: 12, fontWeight: 800 }}>{t.who}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: GOLD }}>{t.when}</span>
      </span>
    ),
  },

  // 4. A ticket stub with notched sides and a perforation, in lagoon.
  ticket: {
    place: "overlay",
    render: (t) => {
      const notch = (side) => `radial-gradient(circle 5px at ${side} 50%, transparent 97%, #000 100%) ${side === "0" ? "left" : "right"} / 51% 100% no-repeat`;
      return (
        <span style={{
          position: "absolute", left: 10, bottom: 10, display: "flex", alignItems: "stretch",
          background: LAGOON_TINT, color: LAGOON_INK, borderRadius: 6,
          WebkitMask: `${notch("0")}, ${notch("100%")}`, mask: `${notch("0")}, ${notch("100%")}`,
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
        }}>
          <span style={{ display: "grid", placeItems: "center", padding: "0 8px 0 12px", borderRight: `1.5px dashed ${LAGOON}` }}>
            <Ticket size={14} color={LAGOON_INK} />
          </span>
          <span style={{ padding: "6px 13px 6px 9px", fontSize: 12, whiteSpace: "nowrap" }}>
            <strong style={{ fontWeight: 800 }}>{t.who}</strong> booked {t.when}
          </span>
        </span>
      );
    },
  },

  // 5. A soft fade up from the bottom of the photo, the name sitting in it.
  scrim: {
    place: "overlay",
    render: (t) => (
      <>
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,16,24,0.72) 0%, rgba(10,16,24,0) 55%)" }} />
        <span style={{ position: "absolute", left: 12, right: 12, bottom: 10, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
          <Avatar name={t.who} size={26} bg="rgba(255,255,255,0.95)" fg={FOREST} />
          <span style={{ lineHeight: 1.15 }}>
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 800 }}>{t.who}</span>
            <span style={{ display: "block", fontSize: 11, opacity: 0.88 }}>booked {t.when}</span>
          </span>
        </span>
      </>
    ),
  },

  // 6. A warm golden strip under the photo, a gold rule on its left edge.
  goldStrip: {
    place: "strip",
    render: (t) => (
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 13px",
        background: GOLD_TINT, borderLeft: `3px solid ${GOLD}`, color: GOLD_INK, fontSize: 12.5,
      }}>
        <Clock size={14} color={GOLD} strokeWidth={2.4} />
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <strong style={{ fontWeight: 800, color: "#3D2600" }}>{t.who}</strong> booked {t.when}
        </span>
      </div>
    ),
  },

  // 7. A deep forest strip, the time picked out in gold.
  forestStrip: {
    place: "strip",
    render: (t) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 13px", background: FOREST, color: "#fff", fontSize: 12.5 }}>
        <Plane size={14} color={GOLD} strokeWidth={2.2} />
        <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <strong style={{ fontWeight: 800 }}>{t.who}</strong> booked this
        </span>
        <span style={{ fontWeight: 800, color: GOLD, flexShrink: 0 }}>{t.when}</span>
      </div>
    ),
  },

  // 8. An avatar that overlaps the photo's bottom edge, name beside it.
  avatar: {
    place: "strip",
    render: (t) => (
      // Only the avatar crosses the photo's edge; the name starts below it.
      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 9, padding: "0 13px", marginTop: -19 }}>
        <Avatar name={t.who} size={38} bg={LAGOON} fg="#fff" ring="3px #fff" />
        <span style={{ marginTop: 22, lineHeight: 1.2 }}>
          <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: "#181D27" }}>{t.who}</span>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: LAGOON_INK }}>booked {t.when}</span>
        </span>
      </div>
    ),
  },

  // 9. A swing tag: pointed end and a punched hole, in purple.
  swingTag: {
    place: "overlay",
    render: (t) => (
      <span style={{ position: "absolute", top: 12, right: 10, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}>
        <span style={{
          position: "relative", display: "block", background: PURPLE, color: "#fff",
          padding: "6px 11px 6px 22px", borderRadius: "0 7px 7px 0",
          clipPath: "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)",
          fontSize: 12, whiteSpace: "nowrap",
        }}>
          <span style={{ position: "absolute", left: 9, top: "50%", width: 6, height: 6, marginTop: -3, borderRadius: "50%", background: "rgba(255,255,255,0.9)" }} />
          <strong style={{ fontWeight: 800 }}>{t.who}</strong> booked {t.when}
        </span>
      </span>
    ),
  },

  // 10. A passport stamp, tilted, with a dashed inner border, in blue.
  stamp: {
    place: "overlay",
    render: (t) => (
      <span style={{
        position: "absolute", top: 12, right: 12, transform: "rotate(-6deg)",
        padding: 3, borderRadius: 8, border: `2px solid ${BLUE}`, background: "rgba(255,255,255,0.92)",
        boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
      }}>
        <span style={{ display: "block", padding: "4px 9px", borderRadius: 5, border: `1px dashed ${BLUE}`, color: BLUE, textAlign: "center", lineHeight: 1.15 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 800 }}>{t.who}</span>
          <span style={{ display: "block", fontSize: 10, fontWeight: 700 }}>booked {t.when}</span>
        </span>
      </span>
    ),
  },
};

export const BADGE_KEYFRAMES = "@keyframes bbPing { 0% { transform: scale(1); opacity: 0.7; } 80%, 100% { transform: scale(2.6); opacity: 0; } }";
