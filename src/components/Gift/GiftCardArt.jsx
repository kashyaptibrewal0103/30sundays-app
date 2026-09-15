import { getArt, getOccasion, inr } from "../../data/giftData";
import Logo from "../Logo";

// The gift card front. A real destination photo, a dark fade at the foot, the
// brand logo in white, and the amount set large and tight. The same treatment
// the itinerary screen uses for its hero and its photo rails, so a gift card
// looks like it came from the same place as the trips.

const SIZES = {
  // sm is the thumbnail in a list: photo, logo and amount, nothing else.
  sm: { pad: 10, logo: 13, kicker: 8, amount: 15, name: 9, radius: 10 },
  md: { pad: 15, logo: 20, kicker: 10, amount: 27, name: 12, radius: 14 },
  lg: { pad: 18, logo: 23, kicker: 10.5, amount: 33, name: 13, radius: 16 },
};

export default function GiftCardArt({
  artId, occasion, amount, toName, fromName,
  size = "md", showAmount = true, style,
}) {
  const art = getArt(artId);
  const occ = getOccasion(occasion);
  const s = SIZES[size] || SIZES.md;
  const small = size === "sm";
  const names = [toName ? `For ${toName}` : null, fromName ? `from ${fromName}` : null]
    .filter(Boolean).join(" · ");

  return (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "5 / 3", borderRadius: s.radius,
      overflow: "hidden", background: "#1A1A1A",
      boxShadow: small ? "0 2px 8px rgba(0,0,0,0.14)" : "0 8px 24px rgba(0,0,0,0.18)",
      ...style,
    }}>
      <img src={art.photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

      {/* One fade from the foot, so type sits on darkness and the photo stays open. */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.5) 62%, rgba(0,0,0,0.9) 100%)",
      }} />

      <div style={{
        position: "relative", height: "100%", boxSizing: "border-box", padding: s.pad,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div>
          <Logo variant="lockup" height={s.logo} mono="#FFFFFF" style={{ opacity: 0.96 }} />
        </div>

        <div>
          {!small && (
            <p style={{
              fontSize: s.kicker, fontWeight: 700, letterSpacing: "0.9px", textTransform: "uppercase",
              margin: 0, color: "rgba(255,255,255,0.8)",
            }}>{occ.label} gift</p>
          )}
          {showAmount && !!amount && (
            <p style={{
              fontSize: s.amount, fontWeight: 800, margin: small ? 0 : "4px 0 0", color: "#fff",
              letterSpacing: "-0.7px", lineHeight: 1, textShadow: "0 1px 10px rgba(0,0,0,0.35)",
            }}>{inr(amount)}</p>
          )}
          {/* Nothing goes here until a name is typed. An invented name reads worse than none. */}
          {!small && !!names && (
            <p style={{
              fontSize: s.name, margin: "6px 0 0", fontWeight: 500, color: "rgba(255,255,255,0.86)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{names}</p>
          )}
        </div>
      </div>
    </div>
  );
}
