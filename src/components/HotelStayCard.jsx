import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { C } from "../data";

// Shared hotel card that represents ONE stay. Used across planning/exploration,
// booked trips, the day-by-day view, the day drawer, and the compare popup so a
// hotel looks the same everywhere. Reference design: photo on top with a small
// "Day 1 - 4" tag, then the star category + booking rating, name, room type, and
// location with a chevron. Mode-specific bits come in via slots.
//
// Props:
//   image, imageAlt, fallbackImage   hero photo (+ optional fallback src)
//   imageHeight                      default 150
//   dayLabel                         pill on the image, top-left (e.g. "Day 1 - 4")
//   topRightBadge                    node pinned top-right on the image (Booked / Sold out)
//   recommendedBadge                 bool -> "30 Sundays Recommended" pill on the image
//   soldOut                          bool -> desaturate image + pink glow border
//   stars                            number -> "N star hotel"
//   ratingScore                      number|string -> "{score} Rated" with a Booking "B"
//   name, roomType, city
//   showChevron                      bool -> chevron in the location row
//   width                            number | "100%"  (cards sit in a swipe row)
//   to                               Link target (wraps the whole card in a Link)
//   onClick                          tap handler (when not using `to`)
//   footer                           node rendered below the location row
//   confirmationBar                  full-bleed node at the very bottom (booked ref bar)
export default function HotelStayCard({
  image, imageAlt, fallbackImage, imageHeight = 150,
  dayLabel, topRightBadge, recommendedBadge, soldOut,
  stars, ratingScore, name, roomType, city, freeCancellation,
  showChevron = true, width, to, onClick, footer, confirmationBar,
}) {
  const cardStyle = {
    width, minWidth: width, flexShrink: width ? 0 : undefined,
    borderRadius: 14, overflow: "hidden", background: C.white,
    border: soldOut ? `1.5px solid ${C.p600}` : `1px solid ${C.div}`,
    boxShadow: soldOut ? "0 0 0 3px rgba(227,27,83,0.10)" : "0 4px 16px rgba(15,23,42,0.06)",
    textDecoration: "none", color: "inherit", display: "block",
    cursor: (to || onClick) ? "pointer" : "default",
  };

  const inner = (
    <>
      {/* Hero image with overlays */}
      <div style={{ position: "relative", height: imageHeight, background: "#F4F2F0" }}>
        <img
          src={image}
          alt={imageAlt || name}
          onError={fallbackImage ? (e) => { if (!e.currentTarget.src.endsWith(fallbackImage)) e.currentTarget.src = fallbackImage; } : undefined}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: soldOut ? "grayscale(0.5) brightness(0.72)" : "none" }}
        />
        {dayLabel && (
          <span style={{
            position: "absolute", top: 10, left: 10,
            background: C.white, borderRadius: 8, padding: "4px 10px",
            fontSize: 12, fontWeight: 700, color: C.head,
            boxShadow: "0 1px 6px rgba(0,0,0,0.18)",
          }}>{dayLabel}</span>
        )}
        {recommendedBadge && (
          <span style={{
            position: "absolute", bottom: 10, left: 10,
            background: C.p100, color: C.p600, borderRadius: 8, padding: "4px 10px",
            fontSize: 11, fontWeight: 700, boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
          }}>30 Sundays Recommended</span>
        )}
        {topRightBadge && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>{topRightBadge}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Star category + booking rating */}
        {(stars || ratingScore != null) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            {stars ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={16} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#4EAC7E" }}>{stars} star hotel</span>
              </div>
            ) : <span />}
            {ratingScore != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: "#003580", color: "#fff", fontSize: 11, fontWeight: 700 }}>B</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.head }}>{ratingScore} Rated</span>
              </div>
            )}
          </div>
        )}

        {/* Name */}
        <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0, lineHeight: "21px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>

        {/* Room type (never truncated) */}
        {roomType && (
          <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "17px" }}>{roomType}</p>
        )}

        {/* Region (clickable), with refundability on the right */}
        {(city || freeCancellation != null) && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
              {city && <MapPin size={13} color={C.inact} style={{ flexShrink: 0 }} />}
              {city && <span style={{ fontSize: 12, color: C.sub, textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{city}</span>}
            </div>
            {freeCancellation != null && (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: freeCancellation ? (C.sText || "#027A48") : C.p600, flexShrink: 0 }}>
                {freeCancellation ? "Free cancellation" : "Non-refundable"}
              </span>
            )}
          </div>
        )}

        {footer}
      </div>

      {confirmationBar}
    </>
  );

  if (to) return <Link to={to} style={cardStyle}>{inner}</Link>;
  return <div onClick={onClick} style={cardStyle}>{inner}</div>;
}
