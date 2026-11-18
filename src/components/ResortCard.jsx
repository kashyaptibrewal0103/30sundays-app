import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { C } from "../data";
import { CATEGORY_COLORS, CATEGORY_META, getRoomSplitLabel } from "../data/resortData";
import { useWishlist } from "../data/wishlist";
import SaveHeart from "./SaveHeart";

// Each card represents ONE night config for a resort (no toggles)
export default function ResortCard({ resort, nights, showCategoryBadge, query }) {
  const wishlist = useWishlist();
  const config = resort.night_configs.find(c => c.nights === nights) || resort.night_configs[0];
  const defaultCombo = config ? (config.combos.find(c => c.is_default) || config.combos[0]) : null;
  const roomSplit = defaultCombo ? getRoomSplitLabel(defaultCombo) : "";
  const displayNights = config?.nights || nights;

  const badgeCat = showCategoryBadge && resort.categories[0];
  const badgeColor = badgeCat ? CATEGORY_COLORS[badgeCat] : null;
  const badgeLabel = badgeCat ? CATEGORY_META[badgeCat]?.label : null;

  // The wishlist keys a resort by name under Maldives, with its atoll as the
  // town, the same way a hotel elsewhere carries the city of its stay.
  const saved = wishlist.isSaved("hotel", "Maldives", resort.name);
  const toggleSave = () => wishlist.toggle("hotel", "Maldives", resort.name, {
    name: resort.name,
    img: resort.hero_image,
    sub: `${resort.atoll || "Maldives"} · ${resort.star_rating}-star`,
    city: resort.atoll || null,
    stars: resort.star_rating,
  });

  return (
    <Link
      to={`/resort/${resort.id}?nights=${displayNights}${query ? `&${query}` : ""}`}
      style={{ textDecoration: "none", color: "inherit", flexShrink: 0, display: "block" }}
    >
      <div style={{
        width: 272, minWidth: 272, borderRadius: 16, overflow: "hidden",
        background: C.white, boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        border: `1px solid ${C.div}`,
      }}>
        {/* Hero image */}
        <div style={{ position: "relative", height: 170 }}>
          <img src={resort.hero_image} alt={resort.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(0,0,0,0.25))" }} />

          {/* Veg badge, top left */}
          {resort.veg_friendly && (
            <div style={{
              position: "absolute", top: 10, left: 10,
              background: "rgba(2,122,72,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: 20, padding: "3px 9px", fontSize: 10, fontWeight: 600, color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              🌱 Veg Friendly
            </div>
          )}

          {/* Category badge, top right */}
          {badgeColor && badgeLabel && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: badgeColor.bg, color: badgeColor.text,
              borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}>
              {badgeLabel}
            </div>
          )}

          {/* Night badge, bottom left on image */}
          <div style={{
            position: "absolute", bottom: 10, left: 10,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
            borderRadius: 14, padding: "3px 10px",
            fontSize: 11, fontWeight: 700, color: "#fff",
          }}>
            🌙 {displayNights}N
          </div>
        </div>

        {/* Card content */}
        <div style={{ padding: "12px 14px 14px" }}>
          {/* Resort name, star rating, and the heart at the far right */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.head, margin: 0, lineHeight: "20px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {resort.name}
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 8 }}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>{resort.star_rating}</span>
            </div>
            <SaveHeart saved={saved} onToggle={toggleSave} size={28} style={{ margin: "-4px -6px -4px 4px" }} />
          </div>

          {/* Atoll + transfer */}
          <p style={{ fontSize: 12, color: C.inact, margin: "0 0 6px", lineHeight: "16px" }}>
            {resort.atoll} · {resort.transfer_type.charAt(0).toUpperCase() + resort.transfer_type.slice(1)}
          </p>

          {/* Room split */}
          {roomSplit && (
            <p style={{ fontSize: 12, color: C.sub, margin: "0 0 10px", lineHeight: "16px", fontWeight: 500 }}>
              {roomSplit}
            </p>
          )}

          {/* Price + View CTA */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {defaultCombo?.total_price ? (
              <div>
                <span style={{ fontSize: 11, color: C.inact }}>From </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.head }}>₹{defaultCombo.total_price}</span>
                <span style={{ fontSize: 11, color: C.inact }}>/pp</span>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: C.inact }}>Price on request</span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.p600 }}>View</span>
              <ArrowRight size={14} color={C.p600} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
