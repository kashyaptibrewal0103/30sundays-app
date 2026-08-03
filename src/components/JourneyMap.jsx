import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Plane, X as XIcon, Play, ArrowLeft, ArrowRight, ChevronRight, Star, Maximize2 } from "lucide-react";
import { C } from "../data";
import { cityCoords } from "../data/buildData";

const SAMPLE_VIDEO = "https://thirtysundays-prod-content.fra1.digitaloceanspaces.com/welcome/Indonesia.mp4";
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Coordinates for itinerary cities not covered by the build wizard's cityCoords.
// Cities still missing from both fall back to the simple SVG strip below.
const EXTRA_COORDS = {
  // Bali
  "Nusa Dua": { lat: -8.7969, lng: 115.2310 }, Kintamani: { lat: -8.2486, lng: 115.3120 },
  Amed: { lat: -8.3380, lng: 115.6620 }, Sidemen: { lat: -8.4500, lng: 115.4450 },
  Munduk: { lat: -8.2710, lng: 115.0760 }, Pemuteran: { lat: -8.1400, lng: 114.6500 },
  Lovina: { lat: -8.1580, lng: 115.0250 }, Lembongan: { lat: -8.6810, lng: 115.4540 },
  // Vietnam
  Sapa: { lat: 22.3360, lng: 103.8440 }, "Ninh Binh": { lat: 20.2510, lng: 105.9740 },
  "Phong Nha": { lat: 17.5910, lng: 106.2820 }, Mekong: { lat: 10.1200, lng: 105.7700 },
  // Thailand
  "Chiang Rai": { lat: 19.9100, lng: 99.8400 }, Pai: { lat: 19.3590, lng: 98.4420 },
  // Sri Lanka
  Colombo: { lat: 6.9271, lng: 79.8612 }, Trincomalee: { lat: 8.5874, lng: 81.2152 },
  Yala: { lat: 6.3700, lng: 81.5160 },
  // New Zealand
  Waiheke: { lat: -36.8000, lng: 175.1080 }, Milford: { lat: -44.6680, lng: 167.9250 },
  // Maldives
  Fuvahmulah: { lat: -0.2980, lng: 73.4240 },
  // Mauritius
  "Grand Baie": { lat: -20.0064, lng: 57.5804 }, "Belle Mare": { lat: -20.1900, lng: 57.7700 },
  "Flic en Flac": { lat: -20.2740, lng: 57.3670 }, "Le Morne": { lat: -20.4560, lng: 57.3120 },
  "Trou aux Biches": { lat: -20.0350, lng: 57.5460 }, "South Coast": { lat: -20.5000, lng: 57.4000 },
  "East Coast": { lat: -20.2400, lng: 57.7800 }, Mauritius: { lat: -20.3480, lng: 57.5520 },
};

export const coordsFor = (city) => cityCoords[city] || EXTRA_COORDS[city] || null;

// Arrival gateway airports for the destinations we have coordinates for. Used by
// the full Itinerary Map screen to place the "Flight" pin. Falls back to the
// first city's coordinates when a destination isn't listed.
export const GATEWAY_AIRPORTS = {
  Bali: { name: "Ngurah Rai (Bali) International Airport", lat: -8.7467, lng: 115.1670 },
  Thailand: { name: "Suvarnabhumi Airport, Bangkok", lat: 13.6900, lng: 100.7501 },
  Vietnam: { name: "Noi Bai International Airport, Hanoi", lat: 21.2187, lng: 105.8072 },
  "Sri Lanka": { name: "Bandaranaike International Airport, Colombo", lat: 7.1808, lng: 79.8841 },
  Maldives: { name: "Velana International Airport, Malé", lat: 4.1917, lng: 73.5290 },
  "New Zealand": { name: "Auckland Airport", lat: -37.0082, lng: 174.7850 },
  Mauritius: { name: "Sir Seewoosagur Ramgoolam Airport", lat: -20.4300, lng: 57.6836 },
};

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 10);
    else if (points.length > 1) map.fitBounds(points, { padding: [38, 38] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

function numberPin(n) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${C.p600};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;font-family:inherit;">${n}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
}

// Simple non-map fallback (the original numbered strip) for routes whose
// cities we don't have coordinates for.
function SvgStrip({ stops }) {
  return (
    <div style={{ position: "relative", height: 200, borderRadius: 14, overflow: "hidden", background: "#E8F4EA" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {stops.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.p600, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.head, marginTop: 4, whiteSpace: "nowrap" }}>{s.city}</span>
                <span style={{ fontSize: 11, color: C.sub }}>{s.n}N</span>
              </div>
              {i < stops.length - 1 && (
                <div style={{ width: 40, height: 1, borderTop: "2px dashed #A4A7AE", margin: "0 4px 16px" }}>
                  <Plane size={10} color={C.inact} style={{ position: "relative", top: -7, left: 14 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Real OpenStreetMap (Leaflet) of the route: numbered pins per stop + a dashed
// connecting line, framed to the whole journey. Falls back to SvgStrip when a
// stop's coordinates aren't known.
export default function JourneyMap({ stops, height = 220, onExpand }) {
  const [openIdx, setOpenIdx] = useState(null);
  const list = stops || [];
  const resolved = list.map(s => ({ ...s, c: coordsFor(s.city) }));
  if (!resolved.length || !resolved.every(s => s.c)) return <SvgStrip stops={list} />;

  const pts = resolved.map(s => [s.c.lat, s.c.lng]);
  const tappable = (s) => (s.activities?.length || 0) > 0 || !!s.hotel || !!s.transfer;
  // Preview mode: the whole map is a launcher into the full Itinerary Map screen.
  const preview = typeof onExpand === "function";
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.div}`, position: "relative", zIndex: 0, isolation: "isolate" }}>
      <MapContainer center={pts[0]} zoom={9} style={{ height, width: "100%", background: "#aadaff" }} attributionControl={false} scrollWheelZoom={false} zoomControl={!preview} dragging={!preview} doubleClickZoom={!preview}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={pts} />
        {pts.length > 1 && <Polyline positions={pts} pathOptions={{ color: C.p600, weight: 3, dashArray: "7 6" }} />}
        {resolved.map((s, i) => (
          <Marker key={i} position={[s.c.lat, s.c.lng]} icon={numberPin(i + 1)}
            eventHandlers={!preview && tappable(s) ? { click: () => setOpenIdx(i) } : undefined}>
            <Tooltip permanent direction="top" offset={[0, -14]} className="route-tip">
              {s.city} · {s.n}N{!preview && tappable(s) ? " · tap" : ""}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      {preview && (
        <>
          <button onClick={onExpand} aria-label="Open full map" style={{ position: "absolute", inset: 0, zIndex: 500, background: "transparent", border: "none", cursor: "pointer", padding: 0 }} />
          <div onClick={onExpand} style={{ position: "absolute", right: 10, bottom: 10, zIndex: 600, display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 999, padding: "7px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.18)", cursor: "pointer" }}>
            <Maximize2 size={14} color={C.p600} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.p600 }}>View full map</span>
          </div>
        </>
      )}
      {!preview && openIdx != null && resolved[openIdx] && (
        <StopSheet stop={resolved[openIdx]} onClose={() => setOpenIdx(null)} />
      )}
    </div>
  );
}

// Persistent two-level bottom sheet. Level 1 lists the stop's items; tapping one
// swaps the sheet content to an in-sheet detail (portrait video for activities,
// image cards for hotel/transfer) with a Back button - never a fullscreen view.
function StopSheet({ stop, onClose }) {
  const [detail, setDetail] = useState(null); // { kind, a|h|t }
  const hero = stop.hero || stop.activities?.[0]?.img || stop.hotel?.img;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: "16px 16px 0 0", height: "82%", display: "flex", flexDirection: "column", overflow: "hidden", animation: "sheetSlideUp 0.25s ease-out" }}>
        {detail
          ? <StopDetail detail={detail} onBack={() => setDetail(null)} onClose={onClose} />
          : <StopList stop={stop} hero={hero} onOpen={setDetail} onClose={onClose} />}
      </div>
    </div>
  );
}

function StopList({ stop, hero, onOpen, onClose }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}>
      <div style={{ position: "relative", height: 170, background: hero ? `url(${hero}) center/cover no-repeat` : "#F4F2F0" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.6))" }} />
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <XIcon size={18} color="#fff" />
        </button>
        <div style={{ position: "absolute", left: 16, bottom: 12 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{stop.city}</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "rgba(255,255,255,0.92)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{stop.n} night{stop.n > 1 ? "s" : ""}</p>
        </div>
      </div>

      {stop.activities?.length > 0 && (
        <div style={{ padding: "16px 0 4px" }}>
          <h4 style={{ margin: "0 16px 2px", fontSize: 16, fontWeight: 700, color: C.head }}>Things to see here</h4>
          <p style={{ margin: "0 16px 12px", fontSize: 12.5, color: C.sub }}>Tap to watch a preview.</p>
          <div className="hs" style={{ gap: 10, paddingLeft: 16, paddingRight: 16 }}>
            {stop.activities.map((a, i) => (
              <div key={i} onClick={() => onOpen({ kind: "activity", a })} style={{ width: 130, minWidth: 130, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 130, height: 160, borderRadius: 12, overflow: "hidden", position: "relative", background: a.img ? `url(${a.img}) center/cover no-repeat` : "#F4F2F0" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.7))" }} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-55%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center" }}>
                    <Play size={15} color="#fff" fill="#fff" />
                  </div>
                  <p style={{ position: "absolute", left: 8, right: 8, bottom: 8, margin: 0, fontSize: 12, fontWeight: 600, color: "#fff" }}>{a.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stop.hotel && (
        <div style={{ padding: "14px 0 0" }}>
          <h4 style={{ margin: "0 16px 6px", fontSize: 16, fontWeight: 700, color: C.head }}>Where you'll stay</h4>
          <ListRow img={stop.hotel.img} title={stop.hotel.name} sub={stop.hotel.type} onClick={() => onOpen({ kind: "hotel", h: stop.hotel })} />
        </div>
      )}

      {stop.transfer && (
        <div style={{ padding: "10px 0 0" }}>
          <h4 style={{ margin: "0 16px 6px", fontSize: 16, fontWeight: 700, color: C.head }}>Getting here</h4>
          <ListRow img={stop.transfer.img} title={stop.transfer.name || `Transfer to ${stop.transfer.to}`} sub={[stop.transfer.sharing, stop.transfer.duration].filter(Boolean).join(" · ")} onClick={() => onOpen({ kind: "transfer", t: stop.transfer })} />
        </div>
      )}
    </div>
  );
}

function ListRow({ img, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
      <div style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0, background: img ? `url(${img}) center/cover no-repeat` : "#F4F2F0" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>}
      </div>
      <ChevronRight size={18} color={C.inact} style={{ flexShrink: 0 }} />
    </button>
  );
}

// In-sheet detail: top bar (Back + Close) and type-specific content.
function StopDetail({ detail, onBack, onClose }) {
  const title = detail.kind === "activity" ? detail.a.name : detail.kind === "hotel" ? "Where you'll stay" : "Your transfer";
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 12px", borderBottom: `1px solid ${C.div}`, flexShrink: 0 }}>
        <button onClick={onBack} aria-label="Back" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0 }}>
          <ArrowLeft size={20} color={C.head} />
        </button>
        <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 16, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
        <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0 }}>
          <XIcon size={18} color={C.sub} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
        {detail.kind === "activity" && (
          <>
            <div style={{ width: 232, maxWidth: "72%", margin: "0 auto", aspectRatio: "9 / 16", borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 8px 28px rgba(0,0,0,0.2)" }}>
              <video src={SAMPLE_VIDEO} poster={detail.a.img} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ margin: "16px 0 4px", textAlign: "center", fontSize: 18, fontWeight: 700, color: C.head }}>{detail.a.name}</h3>
            <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: C.sub, lineHeight: "19px" }}>A curated experience with a local guide and private transfers, included in your trip.</p>
          </>
        )}
        {detail.kind === "hotel" && (
          <>
            <div style={{ width: "100%", height: 190, borderRadius: 14, background: detail.h.img ? `url(${detail.h.img}) center/cover no-repeat` : "#F4F2F0" }} />
            <h3 style={{ margin: "14px 0 6px", fontSize: 18, fontWeight: 700, color: C.head }}>{detail.h.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              {detail.h.stars && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#B8860B" }}><Star size={13} fill="#F5A623" color="#F5A623" /> {detail.h.stars}-star</span>}
              {detail.h.rating && <span style={{ fontSize: 13, fontWeight: 700, color: C.head }}>{detail.h.rating} <span style={{ color: C.sub, fontWeight: 400 }}>rated</span></span>}
            </div>
            {detail.h.type && <p style={{ margin: 0, fontSize: 13.5, color: C.sub }}>{detail.h.type}</p>}
          </>
        )}
        {detail.kind === "transfer" && (
          <>
            <div style={{ width: "100%", height: 180, borderRadius: 14, background: detail.t.img ? `url(${detail.t.img}) center/cover no-repeat` : "#F4F2F0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 6px", fontSize: 16, fontWeight: 700, color: C.head }}>
              <span>{detail.t.from}</span><ArrowRight size={15} color={C.sub} /><span>{detail.t.to}</span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: C.sub }}>{[detail.t.sharing, detail.t.vehicle && cap(detail.t.vehicle), detail.t.duration].filter(Boolean).join(" · ")}</p>
            {detail.t.desc && <p style={{ margin: "10px 0 0", fontSize: 13, color: C.sub, lineHeight: "19px" }}>{detail.t.desc}</p>}
          </>
        )}
      </div>
    </>
  );
}
