import { useState } from "react";
import { ArrowRight, Megaphone, Sparkles, Heart } from "lucide-react";
import { C } from "../data";

// Home marketing banner carousel (finalised design): sits between the
// destination circles and the hero. One banner per swipe, tappable, with the
// pagination dots inside the banner so it's obvious there is more.
// Slot size: full width minus 18pt side margins, 120pt tall, 18pt radius.

const PAD = 18;

export const BANNERS = [
  {
    id: "series-a",
    kicker: "Big news",
    title: "We've raised our Series A 🎉",
    sub: "Backed to craft many more honeymoons.",
    cta: "Read the story",
    Icon: Megaphone,
    url: "https://30sundays.club",
    bg: "linear-gradient(115deg, #FFF0F4 0%, #FFE4E8 55%, #FFD9E8 100%)",
    border: "rgba(253,1,79,0.18)", accent: "#FD014F", tile: "#FD014F",
  },
  {
    id: "maldives-offer",
    kicker: "Limited time",
    title: "Flat ₹10,000 off Maldives",
    sub: "On winter dates booked this month.",
    cta: "Grab the deal",
    Icon: Sparkles,
    url: "https://30sundays.club",
    bg: "linear-gradient(115deg, #EAF6FE 0%, #DCEEFD 55%, #CfE7FC 100%)",
    border: "rgba(21,112,239,0.18)", accent: "#1570EF", tile: "#1570EF",
  },
  {
    id: "referral",
    kicker: "Refer and win",
    title: "Gift a friend ₹5,000 off",
    sub: "You earn ₹5,000 when they book.",
    cta: "Invite now",
    Icon: Heart,
    url: "https://30sundays.club",
    bg: "linear-gradient(115deg, #FFF8E8 0%, #FEF0D8 55%, #FDE9C8 100%)",
    border: "rgba(245,184,28,0.28)", accent: "#B88500", tile: "#F5A623",
  },
];

function BannerCard({ b }) {
  const Icon = b.Icon;
  return (
    <div
      onClick={() => (b.onClick ? b.onClick() : window.open(b.url, "_blank"))}
      style={{
        height: 120, boxSizing: "border-box",
        borderRadius: 18, overflow: "hidden", cursor: "pointer",
        background: b.bg, border: `1px solid ${b.border}`,
        display: "flex", alignItems: "center", gap: 14, padding: "0 16px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.5)", top: -60, right: -40, pointerEvents: "none" }} />
      <div style={{ width: 52, height: 52, borderRadius: 16, background: b.tile, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 18px ${b.border}` }}>
        <Icon size={24} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "1.2px", color: b.accent, textTransform: "uppercase" }}>{b.kicker}</p>
        <p style={{ margin: "3px 0 0", fontSize: 15.5, fontWeight: 800, color: C.head, lineHeight: "20px", letterSpacing: "-0.2px" }}>{b.title}</p>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: C.sub, lineHeight: "16px" }}>{b.sub}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 7, fontSize: 12.5, fontWeight: 700, color: b.accent }}>
          {b.cta} <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}

export default function HomeBanners({ banners = BANNERS }) {
  const [active, setActive] = useState(0);
  const onScroll = (e) => {
    const el = e.currentTarget;
    setActive(Math.max(0, Math.min(banners.length - 1, Math.round(el.scrollLeft / el.clientWidth))));
  };
  return (
    <div style={{ position: "relative" }}>
      <div
        className="hide-scrollbar"
        onScroll={onScroll}
        style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {banners.map((b) => (
          <div key={b.id} style={{ width: "100%", flexShrink: 0, scrollSnapAlign: "center", padding: `0 ${PAD}px`, boxSizing: "border-box" }}>
            <BannerCard b={b} />
          </div>
        ))}
      </div>
      {/* Dots overlaid on the banner, bottom centre */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 5, pointerEvents: "none" }}>
        {banners.map((_, i) => (
          <span
            key={i}
            style={{
              height: 5, borderRadius: 999,
              width: i === active ? 16 : 5,
              background: i === active ? C.p600 : "rgba(24,29,39,0.22)",
              transition: "width .25s ease, background .25s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
