import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, List, Star, ChevronRight } from "lucide-react";
import { C } from "../data";
import { formatHotelPrice } from "../data/hotelData";
import { coordsFor } from "./JourneyMap";

// ─── The same hotels, seen from above ───
//
// A list answers "which of these is better". A map answers "where would I
// actually be", which is the question behind every "how far is it from the
// centre" on the cards. Booking.com puts the price on the pin; ours puts the
// price DIFFERENCE on it, because that is the only money this screen deals in:
// green and down for cheaper, red and up for dearer.
//
// Tapping a pin raises a small version of the list card. Tapping that opens the
// hotel, exactly as tapping the full card does.

// Hotels carry a distance from the city centre but no coordinates, so we place
// them on a ring at that distance. The bearing comes from the hotel's position
// in the CITY's full list, not the filtered one, so a hotel keeps its spot when
// a filter is turned on, and the ring spreads them evenly instead of letting a
// hash pile three on top of each other.
const hash = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

function placeHotels(all, centre) {
  const order = [...all].map((h) => h.id).sort();
  const n = order.length || 1;
  const spot = {};
  all.forEach((h) => {
    const idx = order.indexOf(h.id);
    const deg = (idx * 360) / n + (hash(h.id) % 24);
    const bearing = (deg * Math.PI) / 180;
    const d = h.distanceFromCenter || 1;
    spot[h.id] = {
      lat: centre.lat + (d * Math.cos(bearing)) / 111.32,
      lng: centre.lng + (d * Math.sin(bearing)) / (111.32 * Math.cos((centre.lat * Math.PI) / 180)),
    };
  });
  return spot;
}

// ─── The pin ───
function pricePin({ delta, selected }) {
  const up = delta > 0;
  const flat = !delta;
  const col = flat ? C.sub : up ? "#B42318" : "#027A48";
  const bg = selected ? col : "#fff";
  const fg = selected ? "#fff" : col;
  const arrow = flat
    ? ""
    : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${fg}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
         <path d="M12 ${up ? "19V5" : "5v14"}"/><path d="${up ? "m5 12 7-7 7 7" : "m19 12-7 7-7-7"}"/>
       </svg>`;
  const label = flat ? "Same" : `₹${formatHotelPrice(Math.abs(delta))}`;
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;gap:3px;background:${bg};border:1.5px solid ${col};
        border-radius:999px;padding:3px 9px 3px 7px;white-space:nowrap;font-family:inherit;
        box-shadow:0 2px 8px rgba(16,24,40,${selected ? ".34" : ".18"});transform:scale(${selected ? 1.08 : 1})">
      ${arrow}<span style="font-size:11.5px;font-weight:800;color:${fg}">${label}</span>
    </div>`,
    iconSize: [78, 24],
    iconAnchor: [39, 12],
  });
}

function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 13);
    // The pins are 78px wide and anchored at their centre, so the padding has
    // to clear half a pin or the outermost ones sit off the screen.
    else map.fitBounds(points, { paddingTopLeft: [62, 78], paddingBottomRight: [62, 170], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

// ─── The card a pin raises: the list card, small enough to sit over a map ───
function MiniCard({ hotel, nights, delta, onOpen }) {
  const up = delta > 0;
  return (
    <div
      data-testid={`map-card-${hotel.id}`}
      onClick={() => onOpen(hotel)}
      role="button"
      style={{
        position: "absolute", left: 12, right: 12, bottom: 14, zIndex: 600,
        display: "flex", gap: 11, padding: 10, borderRadius: 14, background: C.white,
        boxShadow: "0 8px 28px rgba(16,24,40,0.24)", cursor: "pointer", alignItems: "center",
      }}
    >
      <img
        src={hotel.images[0].url}
        alt=""
        style={{ width: 74, height: 74, borderRadius: 11, objectFit: "cover", flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head, lineHeight: 1.25,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{hotel.name}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "4px 0 3px" }}>
          <span style={{ display: "inline-flex", gap: 1 }}>
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <Star key={i} size={11} color="#E8940B" fill="#E8940B" strokeWidth={0} />
            ))}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 14, height: 14, borderRadius: 3, background: "#003580", color: "#fff",
              fontSize: 10, fontWeight: 700,
            }}>B</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head }}>{hotel.bookingScore}</span>
          </span>
        </div>

        <p style={{ margin: 0, fontSize: 11.5, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {hotel.neighbourhood} · {hotel.distanceFromCenter} km from city centre
        </p>

        <div style={{ marginTop: 6 }}>
          {delta === null ? (
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.head }}>
              ₹{formatHotelPrice(hotel.pricePerNight * nights)}
            </span>
          ) : !delta ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>No change in price</span>
          ) : (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: up ? "#FEF3F2" : "#ECFDF3", color: up ? "#B42318" : "#027A48",
              borderRadius: 999, padding: "4px 10px", fontSize: 12, fontWeight: 700,
            }}>
              {up ? "More by" : "Lesser by"} ₹{formatHotelPrice(Math.abs(delta))}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={18} color={C.sub} style={{ flexShrink: 0 }} />
    </div>
  );
}

export default function HotelMapScreen({ hotels, allHotels, city, nights, currentHotel, onOpen, onClose }) {
  const [sel, setSel] = useState(null);
  const centre = useMemo(() => coordsFor(city) || { lat: -8.5069, lng: 115.2625 }, [city]);
  const spots = useMemo(() => placeHotels(allHotels || hotels, centre), [allHotels, hotels, centre]);
  const placed = useMemo(() => hotels.map((h) => ({ ...h, ...spots[h.id] })), [hotels, spots]);
  const points = placed.map((h) => [h.lat, h.lng]);
  const deltaOf = (h) => (currentHotel ? (h.pricePerNight - currentHotel.pricePerNight) * nights : null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") (sel ? setSel(null) : onClose()); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, onClose]);

  const selected = placed.find((h) => h.id === sel);

  return (
    <div data-testid="hotel-map" style={{ position: "absolute", inset: 0, zIndex: 200, background: C.bg }}>
      <MapContainer
        center={[centre.lat, centre.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%", background: "#aadaff" }}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Fit points={points} />
        {placed.map((h) => (
          <Marker
            key={h.id}
            position={[h.lat, h.lng]}
            icon={pricePin({ delta: deltaOf(h) ?? 0, selected: sel === h.id })}
            zIndexOffset={sel === h.id ? 1000 : 0}
            eventHandlers={{ click: () => setSel((s) => (s === h.id ? null : h.id)) }}
          />
        ))}
      </MapContainer>

      {/* Back to the list, and what this map is of */}
      <div style={{
        position: "absolute", top: 12, left: 12, right: 12, zIndex: 600,
        display: "flex", alignItems: "center", gap: 8, pointerEvents: "none",
      }}>
        <button
          data-testid="map-close"
          onClick={onClose}
          aria-label="Back to list"
          style={{
            pointerEvents: "auto", width: 36, height: 36, borderRadius: "50%", border: "none",
            background: C.white, boxShadow: "0 2px 10px rgba(16,24,40,0.2)",
            display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} color={C.head} />
        </button>
        <span style={{
          pointerEvents: "auto", background: C.white, borderRadius: 999, padding: "8px 13px",
          boxShadow: "0 2px 10px rgba(16,24,40,0.16)", fontSize: 12.5, fontWeight: 700, color: C.head,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {city} · {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"}
        </span>
        <button
          data-testid="map-to-list"
          onClick={onClose}
          style={{
            pointerEvents: "auto", marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6,
            background: C.white, border: "none", borderRadius: 999, padding: "8px 13px",
            boxShadow: "0 2px 10px rgba(16,24,40,0.16)", cursor: "pointer", fontFamily: "inherit",
            fontSize: 12.5, fontWeight: 700, color: C.head, flexShrink: 0,
          }}
        >
          <List size={14} color={C.head} /> List
        </button>
      </div>

      {/* What the colours mean, once, at the top */}
      {!selected && (
        <div style={{
          position: "absolute", left: 12, right: 12, bottom: 16, zIndex: 590,
          display: "flex", justifyContent: "center",
        }}>
          <span style={{
            background: "rgba(255,255,255,0.95)", borderRadius: 999, padding: "7px 14px",
            boxShadow: "0 2px 10px rgba(16,24,40,0.16)", fontSize: 11.5, color: C.sub,
          }}>
            Tap a pin. <span style={{ color: "#027A48", fontWeight: 700 }}>Green is cheaper</span>,{" "}
            <span style={{ color: "#B42318", fontWeight: 700 }}>red is dearer</span> than your stay.
          </span>
        </div>
      )}

      {selected && (
        <MiniCard hotel={selected} nights={nights} delta={deltaOf(selected)} onOpen={onOpen} />
      )}
    </div>
  );
}
