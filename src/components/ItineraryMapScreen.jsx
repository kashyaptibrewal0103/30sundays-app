import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Play, Star, Navigation, Maximize2, X as XIcon } from "lucide-react";
import { C, destData } from "../data";
import { coordsFor, GATEWAY_AIRPORTS } from "./JourneyMap";

const SAMPLE_VIDEO = "https://thirtysundays-prod-content.fra1.digitaloceanspaces.com/welcome/Indonesia.mp4";
const FLIGHT_IMG = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format&fit=crop";
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Per point-type colour + glyph used on the map pins and the list-card badges.
const GLYPH = {
  flight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5z"/></svg>',
  stay: '<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M2 17h2v-2h16v2h2v-6.5a2.5 2.5 0 0 0-2.5-2.5H18V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2H4.5A2.5 2.5 0 0 0 2 10.5zM8 8V6h8v2z"/></svg>',
  activity: '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M12 2 3 7v2h18V7zM5 11v7H4v2h16v-2h-1v-7h-2v7h-2v-7h-2v7h-2v-7H8v7H6v-7z"/></svg>',
  transfer: '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M5 11l1.4-4.1A2 2 0 0 1 8.3 5.5h7.4a2 2 0 0 1 1.9 1.4L19 11h.5A1.5 1.5 0 0 1 21 12.5V17h-2.1a2 2 0 0 1-3.8 0H8.9a2 2 0 0 1-3.8 0H3v-4.5A1.5 1.5 0 0 1 4.5 11z"/></svg>',
  idea: '<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zM9 20h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/></svg>',
};
const COLOR = { flight: C.blue || "#1F78FF", stay: "#4EAC7E", activity: "#712BDA", transfer: "#9AA0A6", idea: "#FDA201" };

function poiPin({ type, num }) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;gap:2px;background:#fff;border-radius:16px;padding:2px;box-shadow:0 1px 5px rgba(0,0,0,.32);white-space:nowrap;font-family:inherit">
      <span style="width:24px;height:24px;border-radius:50%;background:${COLOR[type]};display:flex;align-items:center;justify-content:center">${GLYPH[type]}</span>
      <span style="font-size:12px;font-weight:800;color:${C.head};padding:0 5px 0 1px">${num}</span>
    </div>`,
    iconSize: [52, 28], iconAnchor: [26, 14],
  });
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 11);
    else map.fitBounds(points, { paddingTopLeft: [40, 30], paddingBottomRight: [40, 300] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

// Fan out pins that share the same city coordinate so overlapping numbers stay
// readable (activities in one city otherwise stack on a single point).
function withOffsets(list) {
  const seen = {};
  return list.map((p) => {
    if (!p.coord) return p;
    const key = `${p.coord.lat.toFixed(2)},${p.coord.lng.toFixed(2)}`;
    const k = seen[key] || 0;
    seen[key] = k + 1;
    if (k === 0) return p;
    const ring = Math.ceil(k / 8);
    const dir = k % 8;
    const d = 0.03 * ring;
    const dd = d * 0.7;
    const off = [
      { lat: d, lng: 0 }, { lat: dd, lng: dd }, { lat: 0, lng: d }, { lat: -dd, lng: dd },
      { lat: -d, lng: 0 }, { lat: -dd, lng: -dd }, { lat: 0, lng: -d }, { lat: dd, lng: -dd },
    ][dir];
    return { ...p, coord: { lat: p.coord.lat + off.lat, lng: p.coord.lng + off.lng } };
  });
}

export default function ItineraryMapScreen({ days, hotels, dest, travelDates, onClose }) {
  const [activeDay, setActiveDay] = useState(-1); // -1 = Full trip
  const [detail, setDetail] = useState(null); // { type, title, data }

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const frameStyle = isMobile
    ? { position: "fixed", inset: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44 };

  const gateway = GATEWAY_AIRPORTS[dest];
  const hotelFor = (city) => hotels.find((h) => h.city === city);
  const actImgs = destData[dest]?.actImgs || [];

  // Ideas (recommended free-time places) for a leisure day. Each idea may be a
  // plain string or a { title, caption, photo } object.
  const ideasFor = (day) => (day?.leisure ? (day.ideas || []) : []).map((idea, i) => {
    const name = typeof idea === "string" ? idea : (idea.title || idea.name || "");
    const img = (typeof idea === "object" && (idea.photo || idea.img)) || actImgs[i % (actImgs.length || 1)];
    const caption = typeof idea === "object" ? idea.caption : "";
    return {
      type: "idea", title: name, sub: caption || "Recommended place",
      data: { name, img, caption, desc: caption ? `${caption}. A lovely spot to explore on your free day. Tell your consultant if you'd like us to build it into your plan.` : "A lovely spot to explore on your free day. Tell your consultant if you'd like us to build it into your plan." },
    };
  });

  // A single day's ordered points: flight (arrival day) -> stay -> transfers -> activities.
  const pointsForDay = (day, dayIdx) => {
    const pts = [];
    if (dayIdx === 0) {
      const c = gateway ? { lat: gateway.lat, lng: gateway.lng } : coordsFor(day.city);
      pts.push({ type: "flight", title: gateway?.name || `${day.city} Airport`, sub: "Flight", label: "Arrival", coord: c, city: day.city });
    }
    const hotel = hotelFor(day.city);
    if (hotel) pts.push({ type: "stay", title: hotel.name, sub: "Your stay", label: day.city, coord: coordsFor(day.city), data: hotel, city: day.city });
    (day.transfers || []).forEach((t) => pts.push({ type: "transfer", title: t.header || t.name || `${t.from} to ${t.to} transfer`, sub: "Transfer", coord: null, data: t, city: day.city }));
    if (!day.leisure && !day.departure) {
      (day.activities || []).forEach((a) => { if (a?.name) pts.push({ type: "activity", title: a.name, sub: "Activity", coord: coordsFor(day.city), data: a, city: day.city }); });
    }
    return pts;
  };

  // { points: located/booked cards+pins, ideas: recommended-place cards }
  const { points, ideas } = useMemo(() => {
    let raw = [];
    let ideaList = [];
    if (activeDay >= 0) {
      raw = pointsForDay(days[activeDay], activeDay);
      ideaList = ideasFor(days[activeDay]);
    } else {
      let prevCity = null;
      days.forEach((day, di) => {
        if (di === 0 && gateway) raw.push({ type: "flight", title: gateway.name, sub: "Flight", label: "Arrival", coord: { lat: gateway.lat, lng: gateway.lng }, city: day.city });
        if (day.city !== prevCity) {
          const hotel = hotelFor(day.city);
          const nights = days.filter((x) => x.city === day.city).length;
          if (hotel) raw.push({ type: "stay", title: hotel.name, sub: `${nights} night${nights > 1 ? "s" : ""} · ${day.city}`, label: day.city, coord: coordsFor(day.city), data: hotel, city: day.city });
          prevCity = day.city;
        }
        (day.transfers || []).forEach((t) => raw.push({ type: "transfer", title: t.header || t.name || `${t.from} to ${t.to} transfer`, sub: "Transfer", coord: null, data: t }));
      });
    }
    let n = 0;
    const numbered = raw.map((p) => (p.type === "transfer" ? { ...p } : { ...p, num: ++n }));
    return { points: withOffsets(numbered), ideas: ideaList };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, days, hotels, dest]);

  const pinPts = points.filter((p) => p.coord).map((p) => [p.coord.lat, p.coord.lng]);

  const start = travelDates?.fromDate ? new Date(travelDates.fromDate) : null;
  const dayTab = (di) => {
    if (start) { const dt = new Date(start); dt.setDate(dt.getDate() + di); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    return `Day ${days[di]?.dayNum ?? di + 1}`;
  };

  // ── Draggable sheet with 3 snap heights: peek strip / half / almost full ──
  const topRef = useRef(null);
  const [snaps, setSnaps] = useState({ strip: 96, half: 360, full: 640 });
  const [sheetH, setSheetH] = useState(360);
  useLayoutEffect(() => {
    const frameH = isMobile ? window.innerHeight : 844;
    const topH = topRef.current ? topRef.current.offsetHeight : 150;
    const full = Math.round(frameH - topH - 6);
    const s = { strip: 100, half: Math.round(full * 0.56), full };
    setSnaps(s);
    setSheetH((h) => Math.min(h || s.half, full));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);
  // Reset to the half snap whenever the day changes (default = cards visible).
  useEffect(() => { setSheetH(snaps.half); }, [activeDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const startDrag = (clientY) => {
    const startY = clientY;
    const startH = sheetH;
    const move = (ev) => {
      const y = ev.clientY ?? (ev.touches && ev.touches[0]?.clientY);
      if (y == null) return;
      let h = startH + (startY - y);
      h = Math.max(snaps.strip, Math.min(snaps.full, h));
      setSheetH(h);
      if (ev.cancelable) ev.preventDefault();
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      setSheetH((h) => {
        const pts = [snaps.strip, snaps.half, snaps.full];
        return pts.reduce((best, p) => (Math.abs(p - h) < Math.abs(best - h) ? p : best), pts[0]);
      });
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  return (
    <div style={{ ...frameStyle, zIndex: 200, background: "#eaf2f8", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div ref={topRef} style={{ flexShrink: 0, background: "#fff", position: "relative", zIndex: 900 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 12px 10px", paddingTop: "calc(14px + env(safe-area-inset-top))" }}>
          <button onClick={onClose} aria-label="Back" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0 }}>
            <ChevronLeft size={26} color={C.head} />
          </button>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.head }}>Itinerary Map</p>
        </div>
        {/* Day tabs */}
        <div className="hs" style={{ gap: 10, padding: "6px 16px 12px" }}>
          <DayChip active={activeDay === -1} title="Full trip" onClick={() => { setActiveDay(-1); setDetail(null); }} />
          {days.map((day, di) => (
            <DayChip key={di} active={activeDay === di} title={dayTab(di)} sub={day.city} onClick={() => { setActiveDay(di); setDetail(null); }} />
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {pinPts.length > 0 && (
          <MapContainer center={pinPts[0]} zoom={9} style={{ height: "100%", width: "100%", background: "#aadaff" }} attributionControl={false} scrollWheelZoom={false} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FitBounds points={pinPts} />
            {pinPts.length > 1 && <Polyline positions={pinPts} pathOptions={{ color: C.p600, weight: 3, dashArray: "7 6" }} />}
            {points.filter((p) => p.coord).map((p, i) => (
              <Marker key={i} position={[p.coord.lat, p.coord.lng]} icon={poiPin({ type: p.type, num: p.num })} zIndexOffset={p.type === "activity" ? 0 : 1000} eventHandlers={{ click: () => setDetail(p) }}>
                {(p.type === "flight" || p.type === "stay") && (
                  <Tooltip permanent direction="bottom" offset={[0, 12]} className="route-tip">{p.label}</Tooltip>
                )}
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Draggable bottom sheet */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: sheetH, zIndex: 950, background: "#fff", borderRadius: "18px 18px 0 0", boxShadow: "0 -6px 24px rgba(0,0,0,0.16)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div onPointerDown={(e) => startDrag(e.clientY)} style={{ padding: "10px 0 8px", flexShrink: 0, cursor: "grab", touchAction: "none" }}>
          <div style={{ width: 44, height: 5, borderRadius: 3, background: "#D2D5DA", margin: "0 auto" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "2px 16px calc(20px + env(safe-area-inset-bottom))" }}>
          {points.map((p, i) => (
            (p.type === "flight" || p.type === "transfer")
              ? <StripRow key={"p" + i} p={p} onOpen={() => setDetail(p)} />
              : <PointCard key={"p" + i} p={p} onOpen={() => setDetail(p)} />
          ))}
          {ideas.length > 0 && (
            <>
              <p style={{ margin: "10px 2px 8px", fontSize: 15, fontWeight: 700, color: C.head }}>Ideas for your free time</p>
              {ideas.map((p, i) => (<IdeaRow key={"i" + i} p={p} onOpen={() => setDetail(p)} />))}
            </>
          )}
        </div>
      </div>

      {detail && (detail.type === "activity" || detail.type === "stay"
        ? <PlaceDetail detail={detail} dest={dest} extraImgs={actImgs} onClose={() => setDetail(null)} frameStyle={frameStyle} />
        : <PointDetail detail={detail} onClose={() => setDetail(null)} frameStyle={frameStyle} />)}
    </div>
  );
}

function DayChip({ active, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, minWidth: 96, textAlign: sub ? "left" : "center", padding: sub ? "10px 16px" : "0 18px", height: 58, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", background: active ? C.p600 : "#F4F4F5", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: active ? "#fff" : C.head }}>{title}</span>
      {sub && (
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 500, color: active ? "rgba(255,255,255,0.9)" : C.sub }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : C.sub} strokeWidth="2.4"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>
          {sub}
        </span>
      )}
    </button>
  );
}

// Small round type badge (icon + optional number) reused in card media corners.
function Badge({ type, num }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: "#fff", borderRadius: 14, padding: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: type === "transfer" || type === "idea" ? COLOR[type] : COLOR[type], display: "flex", alignItems: "center", justifyContent: "center" }}
        dangerouslySetInnerHTML={{ __html: GLYPH[type] }} />
      {num != null && <span style={{ fontSize: 11.5, fontWeight: 800, color: C.head, padding: "0 5px 0 1px" }}>{num}</span>}
    </span>
  );
}

// Thin strip row for a flight / transfer (no big media).
function StripRow({ p, onOpen }) {
  const title = p.type === "transfer" && p.data ? `${p.data.from} to ${p.data.to}` : p.title;
  const sub = p.type === "transfer"
    ? [p.data?.sharing, p.data?.vehicle && cap(p.data.vehicle), p.data?.duration].filter(Boolean).join(" · ")
    : "Flight · arranged as part of your trip";
  return (
    <button onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 12px", marginBottom: 12, background: "#fff", border: `1px solid ${C.div}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
      <span style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: p.type === "transfer" ? "#EFEFEF" : COLOR[p.type], display: "flex", alignItems: "center", justifyContent: "center" }}
        dangerouslySetInnerHTML={{ __html: (GLYPH[p.type] || "").replace(/#fff/g, p.type === "transfer" ? "#8A8F98" : "#fff") }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.num ? `${p.num}. ` : ""}{title}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</p>}
      </div>
      <ChevronRight size={18} color={C.inact} style={{ flexShrink: 0 }} />
    </button>
  );
}

// Rich expanded card for a booked point. Activities autoplay a portrait video;
// hotels show a photo. Both open the full place-detail screen on tap.
function PointCard({ p, onOpen }) {
  if (p.type === "activity") {
    return (
      <button onClick={onOpen} style={{ display: "flex", gap: 12, width: "100%", marginBottom: 14, background: "#fff", border: `1px solid ${C.div}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", fontFamily: "inherit", textAlign: "left", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: 0 }}>
        <div style={{ position: "relative", width: 116, flexShrink: 0, aspectRatio: "9 / 16", background: "#000" }}>
          <video src={SAMPLE_VIDEO} poster={p.data?.img} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", top: 8, left: 8 }}><Badge type={p.type} num={p.num} /></div>
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: "14px 12px 14px 2px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>{p.num ? `${p.num}. ` : ""}{p.title}</p>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: C.sub, lineHeight: "18px" }}>Curated experience · included in your trip</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12.5, fontWeight: 700, color: C.p600 }}><Play size={13} fill={C.p600} color={C.p600} /> Watch &amp; view details</span>
        </div>
      </button>
    );
  }
  // Hotel (stay) card: photo on top + name + rating + room.
  return (
    <button onClick={onOpen} style={{ display: "block", width: "100%", marginBottom: 14, background: "#fff", border: `1px solid ${C.div}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", fontFamily: "inherit", textAlign: "left", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: 0 }}>
      <div style={{ position: "relative", height: 156, background: p.data?.img ? `url(${p.data.img}) center/cover no-repeat` : "#EDEFF2" }}>
        <div style={{ position: "absolute", top: 10, left: 10 }}><Badge type={p.type} num={p.num} /></div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <p style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: C.head }}>{p.num ? `${p.num}. ` : ""}{p.title}</p>
        {p.data && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "5px 0 2px" }}>
            {p.data.stars && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 600, color: "#B8860B" }}><Star size={12} fill="#F5A623" color="#F5A623" /> {p.data.stars}-star</span>}
            {p.data.rating && <span style={{ fontSize: 12.5, fontWeight: 700, color: C.head }}>{p.data.rating} <span style={{ color: C.sub, fontWeight: 400 }}>rated</span></span>}
          </div>
        )}
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: C.sub }}>{p.data?.type || p.sub}</p>
      </div>
    </button>
  );
}

// Lighter row for a recommended (not-booked) free-time idea.
function IdeaRow({ p, onOpen }) {
  return (
    <button onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 10, marginBottom: 10, background: "#fff", border: `1px solid ${C.div}`, borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
      <div style={{ width: 60, height: 60, borderRadius: 10, flexShrink: 0, background: p.data?.img ? `url(${p.data.img}) center/cover no-repeat` : "#EDEFF2" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</p>
        {p.data?.caption && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.data.caption}</p>}
        <p style={{ margin: "3px 0 0", fontSize: 11.5, color: COLOR.idea, fontWeight: 700 }}>Recommended place</p>
      </div>
      <ChevronRight size={18} color={C.inact} style={{ flexShrink: 0 }} />
    </button>
  );
}

// Full-screen detail for a tapped event. Portrait video for activities, image
// cards for stay/transfer/flight, image + note for a recommended place.
function PointDetail({ detail, onClose, frameStyle }) {
  const { type, data } = detail;
  const title = type === "activity" ? data.name : type === "stay" ? "Where you'll stay" : type === "transfer" ? "Your transfer" : type === "idea" ? data.name : "Your flight";
  return (
    <div style={{ ...frameStyle, zIndex: 2000, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 12px", borderBottom: `1px solid ${C.div}`, flexShrink: 0, paddingTop: "calc(14px + env(safe-area-inset-top))" }}>
        <button onClick={onClose} aria-label="Back" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0 }}>
          <ArrowLeft size={22} color={C.head} />
        </button>
        <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 17, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}>
        {type === "activity" && (
          <>
            <div style={{ width: 236, maxWidth: "74%", margin: "0 auto", aspectRatio: "9 / 16", borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 8px 28px rgba(0,0,0,0.2)" }}>
              <video src={SAMPLE_VIDEO} poster={data.img} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ margin: "16px 0 4px", textAlign: "center", fontSize: 18, fontWeight: 700, color: C.head }}>{data.name}</h3>
            <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: C.sub, lineHeight: "19px" }}>A curated experience with a local guide and private transfers, included in your trip.</p>
          </>
        )}
        {type === "stay" && (
          <>
            <div style={{ width: "100%", height: 200, borderRadius: 14, background: data.img ? `url(${data.img}) center/cover no-repeat` : "#F4F2F0" }} />
            <h3 style={{ margin: "14px 0 6px", fontSize: 19, fontWeight: 700, color: C.head }}>{data.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              {data.stars && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "#B8860B" }}><Star size={13} fill="#F5A623" color="#F5A623" /> {data.stars}-star</span>}
              {data.rating && <span style={{ fontSize: 13, fontWeight: 700, color: C.head }}>{data.rating} <span style={{ color: C.sub, fontWeight: 400 }}>rated</span></span>}
            </div>
            {data.type && <p style={{ margin: 0, fontSize: 14, color: C.sub }}>{data.type}</p>}
          </>
        )}
        {type === "transfer" && (
          <>
            <div style={{ width: "100%", height: 190, borderRadius: 14, background: data.img ? `url(${data.img}) center/cover no-repeat` : "#F4F2F0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0 6px", fontSize: 16, fontWeight: 700, color: C.head, flexWrap: "wrap" }}>
              <span>{data.from}</span><ArrowRight size={15} color={C.sub} /><span>{data.to}</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: C.sub }}>{[data.sharing, data.vehicle && cap(data.vehicle), data.duration].filter(Boolean).join(" · ")}</p>
            {data.desc && <p style={{ margin: "10px 0 0", fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>{data.desc}</p>}
          </>
        )}
        {type === "flight" && (
          <>
            <div style={{ width: "100%", height: 180, borderRadius: 14, background: `url(${FLIGHT_IMG}) center/cover no-repeat` }} />
            <h3 style={{ margin: "14px 0 6px", fontSize: 18, fontWeight: 700, color: C.head }}>{detail.title}</h3>
            <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: "20px" }}>Your arrival airport. Flights and airport transfer are arranged as part of your trip.</p>
          </>
        )}
        {type === "idea" && (
          <>
            <div style={{ width: "100%", height: 200, borderRadius: 14, background: data.img ? `url(${data.img}) center/cover no-repeat` : "#F4F2F0" }} />
            <h3 style={{ margin: "14px 0 6px", fontSize: 19, fontWeight: 700, color: C.head }}>{data.name}</h3>
            <span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 700, color: COLOR.idea, background: "#FFF4E0", borderRadius: 8, padding: "3px 9px", marginBottom: 8 }}>Recommended place</span>
            <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: "20px" }}>{data.desc}</p>
          </>
        )}
      </div>
    </div>
  );
}

const placePin = L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${C.p600};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [26, 26], iconAnchor: [13, 24],
});

// Rich place-detail screen (Google-Maps style): media collage, title, rating +
// category + hours, Directions, About this place, and a location map + address.
function PlaceDetail({ detail, dest, extraImgs = [], onClose, frameStyle }) {
  const [readMore, setReadMore] = useState(false);
  const [fs, setFs] = useState(false); // fullscreen video
  const isActivity = detail.type === "activity";
  const data = detail.data || {};
  const city = detail.city || "";
  const coord = detail.coord || coordsFor(city);

  const main = data.img;
  const extras = [...extraImgs.filter((x) => x !== main), ...extraImgs].slice(0, 2);
  const title = data.name || detail.title;
  const category = isActivity ? "Experience · Travel Agency" : "Hotel";
  const pill = isActivity ? "Open · included in your trip" : "Check-in from 2:00 PM";
  const desc = isActivity
    ? "Led by a local guide with private transfers, this experience is included in your trip. Expect a mix of iconic sights and quieter local spots your consultant has hand-picked for couples. Comfortable pace, small group, and time to soak it all in."
    : `${data.type || "Comfortable room"} at ${data.name}. A ${data.stars || 4}-star stay rated ${data.rating || 8.4} by past guests, with breakfast included and easy access to the day's plan. Pool, spa and on-site dining round out an easy, restful base.`;
  const address = `${city}, ${dest}`;

  return (
    <div style={{ ...frameStyle, zIndex: 2000, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {/* Back */}
        <div style={{ padding: "14px 16px 4px", paddingTop: "calc(14px + env(safe-area-inset-top))" }}>
          <button onClick={onClose} aria-label="Back" style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${C.div}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <ArrowLeft size={22} color={C.head} />
          </button>
        </div>

        {/* Media collage */}
        <div style={{ display: "flex", gap: 8, padding: "8px 16px 0", height: 232 }}>
          <div style={{ flex: 1.4, position: "relative", borderRadius: 16, overflow: "hidden", background: "#000" }}>
            {isActivity
              ? <video src={SAMPLE_VIDEO} poster={main} autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", background: main ? `url(${main}) center/cover no-repeat` : "#EDEFF2" }} />}
            <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12.5, fontWeight: 700, padding: "5px 10px", borderRadius: 999 }}>
              <Star size={12} fill="#fff" color="#fff" /> {isActivity ? "Your guide" : "Your stay"}
            </span>
            <button onClick={() => isActivity && setFs(true)} aria-label="Expand" style={{ position: "absolute", right: 10, bottom: 10, width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <Maximize2 size={16} color="#fff" />
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {[extras[0], extras[1]].map((img, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 16, background: img ? `url(${img}) center/cover no-repeat` : "#EDEFF2" }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "18px 16px 8px" }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.head, lineHeight: "32px" }}>{title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "14px 0 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 15, fontWeight: 700, color: C.head }}>
              <Star size={15} fill="#F5A623" color="#F5A623" /> {isActivity ? "4.5" : (data.rating || "8.4")}
            </span>
            <span style={{ color: C.inact }}>·</span>
            <span style={{ fontSize: 14, color: C.head }}>📍 {isActivity ? "Travel Agency" : `${data.stars || 4}-star hotel`}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: C.p600, background: C.p100, padding: "6px 12px", borderRadius: 999, marginLeft: 2 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.p600 }} /> {pill}
            </span>
          </div>

          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, padding: "12px 22px", borderRadius: 999, border: `1px solid ${C.div}`, background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.head, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <Navigation size={17} color={C.p600} fill={C.p600} /> Directions
          </button>

          <h3 style={{ margin: "26px 0 10px", fontSize: 20, fontWeight: 800, color: C.head }}>About this place</h3>
          <p style={{ margin: 0, fontSize: 15.5, color: C.sub, lineHeight: "24px", display: readMore ? "block" : "-webkit-box", WebkitLineClamp: readMore ? "none" : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{desc}</p>
          <button onClick={() => setReadMore((v) => !v)} style={{ margin: "8px 0 0", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.p600 }}>{readMore ? "Read less" : "Read more"}</button>

          {/* Location */}
          <div style={{ marginTop: 22, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.div}` }}>
            {coord && (
              <div style={{ height: 180, position: "relative", zIndex: 0 }}>
                <MapContainer center={[coord.lat, coord.lng]} zoom={13} style={{ height: "100%", width: "100%" }} attributionControl={false} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} boxZoom={false} keyboard={false} touchZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[coord.lat, coord.lng]} icon={placePin} />
                </MapContainer>
              </div>
            )}
            <div style={{ padding: "12px 14px" }}>
              <p style={{ margin: 0, fontSize: 14.5, color: C.head, fontWeight: 500 }}>{address}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 14, fontWeight: 700, color: C.p600 }}>Open in Maps <ArrowRight size={15} color={C.p600} /></span>
            </div>
          </div>
        </div>
      </div>

      {fs && (
        <div style={{ position: "absolute", inset: 0, zIndex: 3000, background: "#000", display: "grid", placeItems: "center" }}>
          <video src={SAMPLE_VIDEO} poster={main} autoPlay loop playsInline controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          <button onClick={() => setFs(false)} aria-label="Close" style={{ position: "absolute", top: "calc(14px + env(safe-area-inset-top))", right: 14, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
            <XIcon size={22} color="#fff" />
          </button>
        </div>
      )}
    </div>
  );
}
