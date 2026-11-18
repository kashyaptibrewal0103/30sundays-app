import { useEffect, useState } from "react";
import { BedDouble, Hotel, X as XIcon } from "lucide-react";
import { C } from "../data";

// ─── What kind of hotel to book here ───
//
// The region page already says, per city, what kind of stay works and which
// room to ask for. The hotel list carries it as "The honest bit": a cream band
// with wavy edges after the second hotel, in the paper colour of the honest
// bit and Know before you go elsewhere in the app. It is not at the top, which
// belongs to the hotels, and it has no close button: people scroll past it.
// Read why opens the whole guide in a sheet over the list.
//
// `stay` is regionGuide(dest, city).stay: { headline, note, rooms }.

const PAPER = "#FCF6E7";

// "A pool villa, not a hotel room" -> "In Ubud, choose a pool villa." The
// advice, said plainly, without the contrast the headline is built on.
export function stayLine(city, stay) {
  const what = stay.headline.split(/, not /)[0];
  return `In ${city}, choose ${what.charAt(0).toLowerCase()}${what.slice(1)}.`;
}

export function HonestBand({ city, stay, onOpen }) {
  if (!stay) return null;
  return (
    <button data-testid="stay-guide" onClick={onOpen} style={{
      display: "flex", flexDirection: "column", margin: "0 -16px", width: "calc(100% + 32px)",
      border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "center",
    }}>
      <Wave flip={false} />
      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: "100%", boxSizing: "border-box", background: PAPER, padding: "6px 24px 8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 9, width: "100%" }}>
          <span aria-hidden style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(227,27,83,0), rgba(227,27,83,0.55))" }} />
          <Sparkle />
          <span style={{ fontFamily: "Caveat, cursive", fontSize: 23, lineHeight: "24px", fontWeight: 700, color: C.head, whiteSpace: "nowrap" }}>The honest bit</span>
          <Sparkle />
          <span aria-hidden style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(227,27,83,0.55), rgba(227,27,83,0))" }} />
        </span>
        <span style={{ fontSize: 13.5, lineHeight: "19px", fontWeight: 400, color: "#3F3A2E" }}>
          {stayLine(city, stay)}{" "}
          <span style={{ fontWeight: 600, color: C.p600, whiteSpace: "nowrap" }}>Read why ›</span>
        </span>
      </span>
      <Wave flip />
    </button>
  );
}

function Sparkle() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 0c1 7 4 10 12 12-8 2-11 5-12 12-1-7-4-10-12-12 8-2 11-5 12-12z" fill={C.p600} />
    </svg>
  );
}

// The scalloped edge, top or bottom. Stretched to the width, so it holds its
// rhythm on any phone.
function Wave({ flip }) {
  const d = flip
    ? "M0 0 Q 16.25 10 32.5 5 T 65 5 T 97.5 5 T 130 5 T 162.5 5 T 195 5 T 227.5 5 T 260 5 T 292.5 5 T 325 5 T 357.5 5 T 390 5 V 0 Z"
    : "M0 10 Q 16.25 0 32.5 5 T 65 5 T 97.5 5 T 130 5 T 162.5 5 T 195 5 T 227.5 5 T 260 5 T 292.5 5 T 325 5 T 357.5 5 T 390 5 V 10 Z";
  return (
    <svg width="100%" height="10" viewBox="0 0 390 10" preserveAspectRatio="none" aria-hidden style={{ display: "block" }}>
      <path d={d} fill={PAPER} />
    </svg>
  );
}

// ─── The guide itself, over the list ───
export function StayGuideSheet({ stay, city, onClose }) {
  const [up, setUp] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setUp(true)); return () => cancelAnimationFrame(id); }, []);
  const close = () => { setUp(false); setTimeout(onClose, 220); };

  return (
    <div data-testid="stay-guide-sheet" style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", opacity: up ? 1 : 0, transition: "opacity .22s" }} />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0", maxHeight: "82%", overflowY: "auto",
        padding: "10px 20px calc(24px + env(safe-area-inset-bottom))",
        transform: up ? "translateY(0)" : "translateY(100%)", transition: "transform .24s cubic-bezier(0.32,0.72,0,1)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "0 0 8px" }}>
          <span style={{ width: 38, height: 4, borderRadius: 99, background: "#D5D7DA" }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.p600 }}>Where to stay in {city}</p>
            <h3 style={{ margin: "3px 0 0", fontSize: 19, fontWeight: 800, color: C.head, lineHeight: 1.25 }}>{stay.headline}</h3>
          </div>
          <button onClick={close} aria-label="Close" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <XIcon size={16} color={C.head} />
          </button>
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Hotel size={15} color={C.p600} strokeWidth={2.4} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>What kind of hotel</p>
        </div>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>{stay.note}</p>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.div}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BedDouble size={15} color={C.p600} strokeWidth={2.4} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>Which room to look for</p>
          </div>
          <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
            {stay.rooms.map((room) => (
              <li key={room} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 6 }}>
                <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: C.head, flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontSize: 13.5, color: C.head, lineHeight: 1.4 }}>{room}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
