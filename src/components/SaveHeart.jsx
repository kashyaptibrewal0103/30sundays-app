import { Heart } from "lucide-react";
import { C } from "../data";

// ─── One wishlist control, everywhere ───
//
// The app had four hearts doing the same job, each with its own look, so the
// state of a save was something a couple had to learn again on every screen.
//
// One rule now. The heart sits beside the name of the thing it saves, right
// aligned, never on the photo and never in the header: it belongs to the name,
// and a photo stays a photo. Empty is a mid grey outline, saved is a solid
// pink heart with no outline. Where a name is printed over a photo (white text
// on a dark scrim) the empty heart is white instead, with a soft shadow,
// because grey beside white text reads as disabled.
//
// The tap area stays generous while the drawn heart is small, so callers pull
// it in with a negative margin to line the heart up with the text edge.

const EMPTY = "#8A8F98";
export const PHOTO_HEART_SHADOW = "drop-shadow(0 1px 2px rgba(0,0,0,0.35))";

export default function SaveHeart({ saved, onToggle, onPhoto = false, size = 32, iconSize, style }) {
  const icon = iconSize || Math.round(size * 0.6);
  const stroke = saved ? C.p600 : onPhoto ? "#fff" : EMPTY;
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle?.(); }}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={!!saved}
      style={{
        width: size, height: size, flexShrink: 0, padding: 0, cursor: "pointer",
        borderRadius: "50%", border: "none", background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        ...style,
      }}
    >
      <Heart size={icon} color={stroke} fill={saved ? C.p600 : "none"} strokeWidth={2} style={onPhoto ? { filter: PHOTO_HEART_SHADOW } : undefined} />
    </button>
  );
}
