import { ChevronRight, ArrowLeftRight, Play, Layers, TriangleAlert, Heart, Zap, Gauge, Flame, Moon } from "lucide-react";
import { C } from "../data";
import { SCORE_PALETTE, LEVEL_KEYS } from "../data/dayScoring";
import { DayRatingPill } from "./DayRating";

// ─── One day in "Itinerary at a glance" ───
//
// Poster down the left, the day's own detail beside it, and a heads-up band
// across the foot when the day has something you need to know.
//
// The poster stretches to the height of the row next to it, which is why the
// note is kept out of that row: a day with a warning would otherwise get a
// poster twice as tall as a day without one, and the crops stop matching down
// the page. A floor on the row stops arrival and departure days collapsing it
// to a letterbox.

const PACE_ICON = { Relaxed: Moon, Balanced: Heart, Active: Zap, "Fast-paced": Flame };

// One treatment for every note, whatever it says. Splitting them by severity
// made the list look patchy and asked the reader to learn a colour code first.
const NOTE = { bg: "#FFF8EA", border: "#FBE3B2", icon: "#B45309", text: "#8A5A00" };

// The count only earns its place when there is more than one video. A single
// video is already obvious from the play button, and a day with none needs no
// badge at all.
function MediaBadge({ count }) {
  if (count < 2) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 6, background: "rgba(12,16,40,0.78)",
      backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    }}>
      <Layers size={11} color="#fff" />
      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", letterSpacing: 0.3 }}>{count} videos</span>
    </div>
  );
}

function PaceChip({ pace, level }) {
  const colors = SCORE_PALETTE[LEVEL_KEYS[level]];
  const Icon = PACE_ICON[pace] || Gauge;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: C.white, border: `1px solid ${colors.icon}44`, color: colors.text,
    }}>
      <Icon size={11} color={colors.icon} fill={colors.icon} strokeWidth={0} />
      {pace}
    </div>
  );
}

export default function GlanceDayCard({
  dayNum, city, lines, poster, videoCount = 0,
  pace, paceLevel, rating, note, canChange,
  onOpen, onChange, onOpenReviews, testId, changeTestId,
}) {
  return (
    <div
      {...(testId ? { "data-testid": testId } : {})}
      onClick={onOpen}
      role="button"
      aria-label={`Day ${dayNum} details`}
      style={{
        cursor: "pointer", borderRadius: 14, border: `1px solid ${C.div}`,
        background: C.white, boxShadow: "0 1px 4px rgba(24,30,76,0.04)", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 116 }}>
        <div style={{ position: "relative", width: 116, minWidth: 116, background: C.div }}>
          <img src={poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          {videoCount > 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.92)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
              }}>
                <Play size={12} color={C.head} fill={C.head} style={{ marginLeft: 2 }} />
              </div>
            </div>
          )}
          <div style={{ position: "absolute", left: 7, bottom: 7 }}>
            <MediaBadge count={videoCount} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: 0.4, textTransform: "uppercase",
              display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0,
            }}>
              <span style={{ flexShrink: 0 }}>Day {dayNum}</span>
              <span style={{ opacity: 0.45, flexShrink: 0 }}>&middot;</span>
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{city}</span>
            </span>
            <ChevronRight size={17} color={C.sub} style={{ flexShrink: 0, marginTop: -1 }} />
          </div>

          {(rating || pace) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {/* The rating is a way in, not just a badge: it opens the day
                  already scrolled to what couples actually said. */}
              {rating && onOpenReviews ? (
                <button
                  data-testid={testId ? `${testId}-reviews` : undefined}
                  onClick={(e) => { e.stopPropagation(); onOpenReviews(); }}
                  aria-label="Read what couples said about this day"
                  style={{ padding: 0, border: "none", background: "none", cursor: "pointer", display: "inline-flex", fontFamily: "inherit" }}
                >
                  <DayRatingPill rating={rating} style="outline" showCount />
                </button>
              ) : (
                <DayRatingPill rating={rating} style="outline" showCount />
              )}
              {pace && <PaceChip pace={pace} level={paceLevel} />}
            </div>
          )}

          <div>
            {lines.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginTop: i === 0 ? 0 : 3 }}>
                <span style={{ flexShrink: 0, color: C.inact, fontSize: 12, lineHeight: "18px" }}>&bull;</span>
                <span style={{
                  minWidth: 0, fontSize: 12, color: C.sub, lineHeight: "18px",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{l}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {canChange && (
              <button
                data-testid={changeTestId}
                data-tour="change-day"
                onClick={(e) => { e.stopPropagation(); onChange(); }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: 0,
                  background: "none", border: "none", fontSize: 12, fontWeight: 600,
                  color: C.p600, cursor: "pointer", fontFamily: "inherit",
                }}
                aria-label="Change day plan"
              >
                <ArrowLeftRight size={13} color={C.p600} />
                Change day plan
              </button>
            )}
          </div>
        </div>
      </div>

      {note && (
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-start",
          padding: "9px 12px", background: NOTE.bg, borderTop: `1px solid ${NOTE.border}`,
        }}>
          <TriangleAlert size={13} color={NOTE.icon} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11.5, color: NOTE.text, lineHeight: "16px", fontWeight: 500 }}>{note}</span>
        </div>
      )}
    </div>
  );
}
