import { ThumbsUp, ChevronRight } from "lucide-react";
import { C } from "../data";
import { TIER } from "../data/dayRatings";

// ─── Compact slot: day cards in "Itinerary at a glance", and the
// alternative-plan cards in Change day plan.
//
// Figure only — no words, no rating count, and NOT tappable. The breakdown has
// exactly one entry point, on the day-details screen, so these two slots stay
// pure display and never compete with the card's own tap target.
//
// Green at or above the threshold, amber below it. The figure is always shown.
//
// style: "pct" (icon + figure) · "word" (icon + figure + verb)
//        "dot" (colour dot + figure) · "chip" (filled, colour carries the tier)
export function DayRatingPill({ rating, overlay = false, style = "pct" }) {
  if (!rating || !rating.tier.showPct) return null;
  const col = rating.color;
  const filled = style === "chip";
  const figureColor = filled ? "#fff" : col;

  return (
    <div
      data-testid="day-rating-pill"
      data-tier={rating.tier.key}
      style={{
        display: "inline-flex", alignItems: "center", flexShrink: 0,
        gap: style === "dot" ? 5 : 4, borderRadius: 20,
        padding: filled ? "3px 9px" : overlay ? "3px 8px" : 0,
        background: filled ? col : overlay ? "rgba(255,255,255,0.92)" : "none",
        backdropFilter: overlay && !filled ? "blur(6px)" : undefined,
        WebkitBackdropFilter: overlay && !filled ? "blur(6px)" : undefined,
      }}
    >
      {style === "dot" ? (
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: col }} />
      ) : (
        <ThumbsUp size={11} color={figureColor} fill={figureColor} strokeWidth={0} />
      )}
      <span style={{ fontSize: 11.5, fontWeight: 800, color: figureColor, fontVariantNumeric: "tabular-nums" }}>
        {rating.enjoyedPct}%
      </span>
      {style === "word" && (
        <span style={{ fontSize: 11.5, fontWeight: 600, color: filled ? "rgba(255,255,255,0.85)" : C.sub }}>
          enjoyed
        </span>
      )}
    </div>
  );
}

// ─── Day details: the only slot with words, and the only way into the
// breakdown. Sits above the day-pace card. Tapping it opens
// loved / liked / not-for-me with the rating count.
//
// Below the threshold the chip turns amber and the sentence leads with "Only".
export function DayRatingRow({ rating, onOpen }) {
  if (!rating || rating.tier === TIER.tooFew) return null;
  const low = rating.tier === TIER.low;
  const col = rating.color;

  return (
    <button
      data-testid="day-rating-row"
      data-tier={rating.tier.key}
      onClick={onOpen}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: low ? "#FFF8EA" : "#EAF6F0",
        border: `1px solid ${low ? "#FBE3B2" : "#BFE3D0"}`,
        borderRadius: 20, padding: "5px 10px 5px 9px",
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <ThumbsUp size={13} color={col} fill={col} strokeWidth={0} />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1F2A37" }}>{rating.detailText}</span>
      <ChevronRight size={14} color={C.sub} />
    </button>
  );
}
