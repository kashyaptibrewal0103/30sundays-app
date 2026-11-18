import { useState } from "react";
import { Heart } from "lucide-react";
import { C } from "../data";

// Ten takes on the heart that sits over a photograph. Each row shows it on a
// bright photo and a busy one, empty and saved, so the only thing being
// compared is the heart. Tap any of them to flip it.

const img = (id) => `https://images.unsplash.com/photo-${id}?w=400&q=75&auto=format&fit=crop`;
const BRIGHT = img("1507525428034-b723cf961d3e");
const BUSY = img("1518548419970-58e3b4079ab2");
const SKY = img("1537996194471-e657df975ab4");

const PINK = C.p600;
const glass = (alpha, blur = 12) => ({ background: `rgba(255,255,255,${alpha})`, backdropFilter: `blur(${blur}px) saturate(160%)`, WebkitBackdropFilter: `blur(${blur}px) saturate(160%)` });
const darkGlass = (alpha, blur = 12) => ({ background: `rgba(16,20,28,${alpha})`, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` });
const round = (size) => ({ width: size, height: size, borderRadius: "50%", display: "grid", placeItems: "center" });
const lift = "drop-shadow(0 1px 2px rgba(0,0,0,0.35))";

const VARIANTS = [
  {
    name: "Clear glass",
    note: "Frosted disc, white outline. Fills pink when saved.",
    render: (on) => (
      <span style={{ ...round(32), ...glass(0.22), border: "1px solid rgba(255,255,255,0.35)" }}>
        <Heart size={16} strokeWidth={2.2} color={on ? PINK : "#fff"} fill={on ? PINK : "none"} />
      </span>
    ),
  },
  {
    name: "Bare outline",
    note: "No disc at all. A soft shadow keeps it readable.",
    render: (on) => (
      <span style={{ ...round(32) }}>
        <Heart size={22} strokeWidth={2} color="#fff" fill={on ? PINK : "none"} style={{ filter: lift }} />
      </span>
    ),
  },
  {
    name: "Smoked glass",
    note: "Dark frosted disc. Holds up best on bright photos.",
    render: (on) => (
      <span style={{ ...round(32), ...darkGlass(0.28) }}>
        <Heart size={16} strokeWidth={2.2} color={on ? PINK : "#fff"} fill={on ? PINK : "none"} />
      </span>
    ),
  },
  {
    name: "Glass ring",
    note: "Almost invisible disc, just a thin bright rim.",
    render: (on) => (
      <span style={{ ...round(32), ...glass(0.08, 8), border: "1.5px solid rgba(255,255,255,0.7)" }}>
        <Heart size={15} strokeWidth={2.2} color="#fff" fill={on ? "#fff" : "none"} />
      </span>
    ),
  },
  {
    name: "Liquid glass",
    note: "Glossy sheen with a lit top edge, like newer iPhones.",
    render: (on) => (
      <span style={{
        ...round(34), backdropFilter: "blur(14px) saturate(180%)", WebkitBackdropFilter: "blur(14px) saturate(180%)",
        background: "linear-gradient(160deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.10) 55%, rgba(255,255,255,0.18) 100%)",
        border: "1px solid rgba(255,255,255,0.45)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7), 0 4px 12px rgba(0,0,0,0.12)",
      }}>
        <Heart size={16} strokeWidth={2.2} color={on ? PINK : "#fff"} fill={on ? PINK : "none"} />
      </span>
    ),
  },
  {
    name: "Tinted fill",
    note: "Heart shape filled see-through dark, white edge. Pink when saved.",
    render: (on) => (
      <span style={{ ...round(32) }}>
        <Heart size={22} strokeWidth={2} color="#fff" fill={on ? PINK : "rgba(0,0,0,0.35)"} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))" }} />
      </span>
    ),
  },
  {
    name: "Small glass",
    note: "Clear glass, a size down with a finer line.",
    render: (on) => (
      <span style={{ ...round(26), ...glass(0.2, 10) }}>
        <Heart size={13} strokeWidth={2} color={on ? PINK : "#fff"} fill={on ? PINK : "none"} />
      </span>
    ),
  },
  {
    name: "Glass square",
    note: "Rounded square instead of a circle. Matches card corners.",
    render: (on) => (
      <span style={{ width: 32, height: 32, borderRadius: 10, display: "grid", placeItems: "center", ...glass(0.2), border: "1px solid rgba(255,255,255,0.3)" }}>
        <Heart size={16} strokeWidth={2.2} color={on ? PINK : "#fff"} fill={on ? PINK : "none"} />
      </span>
    ),
  },
  {
    name: "Corner shade",
    note: "No disc. The photo corner darkens slightly behind the heart.",
    corner: true,
    render: (on) => (
      <span style={{ ...round(32) }}>
        <Heart size={20} strokeWidth={2} color="#fff" fill={on ? PINK : "none"} />
      </span>
    ),
  },
  {
    name: "Glass, then white",
    note: "Quiet glass when empty. Turns into the white disc once saved.",
    render: (on) => (
      <span style={{ ...round(32), transition: "background .2s", ...(on ? { background: "rgba(255,255,255,0.96)", boxShadow: "0 2px 8px rgba(16,24,40,0.2)" } : { ...glass(0.2), border: "1px solid rgba(255,255,255,0.35)" }) }}>
        <Heart size={16} strokeWidth={2.2} color={on ? PINK : "#fff"} fill={on ? PINK : "none"} />
      </span>
    ),
  },
];

function Tile({ src, variant, start }) {
  const [on, setOn] = useState(start);
  const [pop, setPop] = useState(0);
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0, aspectRatio: "4 / 5", borderRadius: 14, overflow: "hidden", background: C.div }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      {variant.corner && <span style={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: "radial-gradient(circle at top right, rgba(0,0,0,0.38), rgba(0,0,0,0) 70%)" }} />}
      <button
        type="button"
        onClick={() => { setOn((v) => !v); setPop((n) => n + 1); }}
        aria-label={on ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={on}
        style={{ position: "absolute", top: 8, right: 8, padding: 0, border: "none", background: "none", cursor: "pointer" }}
      >
        <span key={pop} style={{ display: "inline-grid", animation: pop ? "heartPop .32s ease-out" : "none" }}>{variant.render(on)}</span>
      </button>
    </div>
  );
}

export default function HeartLab() {
  return (
    <div style={{ minHeight: "100%", background: C.white, padding: "20px 16px 40px" }}>
      <style>{"@keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.22)}100%{transform:scale(1)}}"}</style>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1, color: PINK, textTransform: "uppercase" }}>Heart lab</p>
      <h1 style={{ margin: "4px 0 4px", fontSize: 22, fontWeight: 800, color: C.head }}>Ten hearts for photos</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: C.sub }}>Bright photo, dark photo, then saved. Tap any heart.</p>
      {VARIANTS.map((v, i) => (
        <div key={v.name} style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.head }}>{i + 1}. {v.name}</p>
          <p style={{ margin: "2px 0 10px", fontSize: 12.5, color: C.sub }}>{v.note}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Tile src={BRIGHT} variant={v} start={false} />
            <Tile src={BUSY} variant={v} start={false} />
            <Tile src={SKY} variant={v} start />
          </div>
        </div>
      ))}
    </div>
  );
}
