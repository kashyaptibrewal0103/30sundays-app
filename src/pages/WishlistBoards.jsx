import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, ArrowRight, Heart, ChevronRight, UserPlus, X as XIcon, Check, Compass, Plus, Minus, Star, ThumbsUp, Map as MapIcon, Ticket, BedDouble, Utensils, ShoppingBag, Route as RouteIcon } from "lucide-react";
import { C, destData } from "../data";
import { useDeals } from "../data/deals";
import { useWishlist, KIND_LABEL, KIND_NOUN, ME, INVITE_CONTACTS } from "../data/wishlist";
import { useRows } from "../data/wishlistRows";
import { regionByCity } from "../data/discoverData";
import { regionGuide } from "../data/regionGuide";
import { cityCoords } from "../data/buildData";
import SaveHeart from "../components/SaveHeart";
import { ChooseSheet } from "../components/wishlist/WishlistEntry";
import { activityRating, regionEnjoyed, regionStay, hotelFacts } from "../data/cardFacts";
import { GREEN } from "../data/dayRatings";

// ─── Trip boards ───
//
// The wishlist used to be a filing cabinet: things went in and sat there. Now
// every destination is a board that a trip gets planned on. The map leads,
// because the first question about a pile of saves is where they all are; the
// list sits in a sheet over it that slides up to read. Everyone on the board
// adds to it, says which saves they love too, and leaves notes. And the board
// ends in the one thing a wishlist is for: planning the trip from it.
//
// One board per destination and no named lists on top. People visit a
// destination once, so the destination is the only grouping a trip needs.
//
// Two designs share this file. The one-person board ships first and lives at
// /saved: just you, your saves, your notes and the plan button. The group
// board at /saved/group adds the people on it, who saved what, "Love it too"
// and the saves everyone loves. Same pieces; the group parts are simply not
// drawn on the one-person board.

// The app's own heading colour and type, so a board reads as part of the app.
const NAVY = C.head;
const PAD = 16;
const MIST = "#EAE6E3"; // the one warm neutral for avatars
const SECTION_ORDER = ["region", "hotel", "activity", "restaurant", "shop", "trip"];

const flagOf = (dest) => destData[dest]?.flag || "";
const baseOf = (group) => (group ? "/saved/group" : "/saved");
const boardPath = (dest, group) => `${baseOf(group)}/board/${encodeURIComponent(dest)}`;

// Everyone on the board who has joined, the current person first. On the
// one-person board that is only ever you.
function useBoardPeople(dest, group) {
  const { membersOf } = useWishlist();
  return useMemo(() => {
    const all = group ? [ME, ...membersOf(dest)] : [ME];
    return { all, joined: all.filter((p) => p.key === "you" || p.status === "joined") };
  }, [dest, group, membersOf]);
}

const lovedByAll = (row, joined) => joined.length > 1 && joined.every((p) => row.lovedBy.includes(p.key));

// ─── Small pieces ───

function Avatar({ person, size = 22, ring = C.white }) {
  const invited = person.status === "invited";
  return (
    <span title={person.name} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "inline-grid", placeItems: "center",
      background: invited ? C.white : MIST, color: NAVY, fontSize: Math.round(size * 0.45), fontWeight: 800,
      border: invited ? `1.5px dashed ${C.inact}` : `2px solid ${ring}`, boxSizing: "border-box",
    }}>{person.initial}</span>
  );
}

function AvatarStack({ people, size = 22, ring }) {
  return (
    <span style={{ display: "inline-flex" }}>
      {people.map((p, i) => <span key={p.key} style={{ marginLeft: i ? -size * 0.32 : 0 }}><Avatar person={p} size={size} ring={ring} /></span>)}
    </span>
  );
}

function Sheet({ onClose, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 900, display: "flex", alignItems: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)", animation: "fadeInBg .2s ease-out" }} />
      <div style={{ position: "relative", width: "100%", maxHeight: "85%", overflowY: "auto", background: C.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: `10px ${PAD}px calc(18px + env(safe-area-inset-bottom))`, boxShadow: "0 -8px 28px rgba(0,0,0,0.2)", animation: "sheetSlideUp .25s ease-out" }}>
        <div style={{ width: 38, height: 4, borderRadius: 4, background: C.div, margin: "0 auto 14px" }} />
        {children}
      </div>
    </div>
  );
}

// ─── The map ───

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
// Map colours, one per kind of save, the way a map app does it: the colour
// says what the place is before the name is read. All four are from the brand
// board's shade card, a step lighter than the full swatch so the map stays
// calm: Sunset Fuchsia FE6795 for things to do, Tropical Forest 516968 for
// regions, Lagoon Bliss 00A898 for hotels and Golden Hour FDB534 for food.
const PIN = {
  region: { color: "#516968", tint: "#D3D9D9", icon: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>' },
  activity: { color: "#FE6795", tint: "#FFCCDC", icon: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>' },
  hotel: { color: "#00A898", tint: "#CCEEEA", icon: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>' },
  restaurant: { color: "#FDB534", tint: "#FFECCC", icon: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 3 2h2Zm0 0v7"/>' },
  // Itineraries are never on the map (a whole trip is not a place), so their
  // colour, the full-strength Tropical Forest, only shows on the filter chip.
  trip: { color: "#254342", tint: "#D3D9D9", icon: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>' },
  shop: { color: C.sub, tint: C.bg, icon: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
};
// One white location-shaped marker, and a disc in the kind's colour in its
// head holding the kind's line icon in white. The shadow lifts the white pin
// off light map tiles.
const marker = (kind) => `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" viewBox="0 0 28 34" style="display:block;filter:drop-shadow(0 1px 1px rgba(16,24,40,.25)) drop-shadow(0 2px 4px rgba(16,24,40,.2))"><path d="M14 1.5C7.1 1.5 1.5 7 1.5 13.8c0 8.6 10.3 17 11.6 18a1.5 1.5 0 0 0 1.8 0c1.3-1 11.6-9.4 11.6-18C26.5 7 20.9 1.5 14 1.5Z" fill="#fff"/><circle cx="14" cy="13.6" r="10.6" fill="${PIN[kind].color}"/><svg x="8" y="7.6" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${PIN[kind].icon}</svg></svg>`;
// No chip behind the name: the text sits on the map in the pin's colour,
// with a white halo so it reads over roads and water alike.
const HALO = "text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff,1px 1px 1px #fff,-1px -1px 1px #fff,1px -1px 1px #fff,-1px 1px 1px #fff;";

// Every save with a place gets a marker of its kind. Pins that land on the
// same spot (a hotel placed on its town's middle, next to the town itself)
// fan out side by side by `dx` pixels, so none hides another.
function pinIcon(p, on, side) {
  const color = PIN[p.kind].color;
  const label = `<span style="color:${color === PIN.restaurant.color ? "#C98A12" : color};font:800 12px/1.15 Figtree,sans-serif;white-space:nowrap;${HALO}${on ? "text-decoration:underline;text-underline-offset:3px;" : ""}">${esc(p.label)}</span>`;
  // The marker's tip is the place; the name sits beside its head, on the
  // right, or on the left when something else already has the right.
  const html = `<div style="position:relative;width:26px;height:32px;transform:translate(${(p.dx || 0) - 13}px,-32px)${on ? " scale(1.12)" : ""};transform-origin:13px 32px">
      ${marker(p.kind)}
      ${side ? `<span style="position:absolute;top:7px;${side === "left" ? "right" : "left"}:29px">${label}</span>` : ""}
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [0, 0], iconAnchor: [0, 0] });
}

// Labels that would sit on top of each other. Every pin is placed first, so
// no name is written over a pin. Then each name tries the right of its pin,
// then the left, and only if both are taken shows its pin alone. The more
// specific kinds go first so their names win; a region's name is printed on
// the map's own tiles anyway. Worked out again on every zoom. Returns
// { key: "right" | "left" } for the names that fit.
const LABEL_ORDER = ["activity", "hotel", "restaurant", "shop", "region"];
function useLabelSides(pins) {
  const map = useMap();
  const [sides, setSides] = useState({});
  useEffect(() => {
    const work = () => {
      const pts = Object.fromEntries(pins.map((p) => {
        const pt = map.latLngToContainerPoint([p.pos.lat, p.pos.lng]);
        return [p.key, { x: pt.x + (p.dx || 0), y: pt.y }];
      }));
      const boxes = pins.map((p) => ({ x1: pts[p.key].x - 13, x2: pts[p.key].x + 13, y1: pts[p.key].y - 32, y2: pts[p.key].y }));
      const free = (box) => !boxes.some((b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1);
      const out = {};
      const order = [...pins].sort((a, b) => LABEL_ORDER.indexOf(a.kind) - LABEL_ORDER.indexOf(b.kind));
      order.forEach((p) => {
        const pt = pts[p.key];
        const w = p.label.length * 6.8;
        const right = { x1: pt.x + 16, x2: pt.x + 16 + w, y1: pt.y - 27, y2: pt.y - 11 };
        const left = { x1: pt.x - 16 - w, x2: pt.x - 16, y1: pt.y - 27, y2: pt.y - 11 };
        if (free(right)) { out[p.key] = "right"; boxes.push(right); }
        else if (free(left)) { out[p.key] = "left"; boxes.push(left); }
      });
      setSides(out);
    };
    work();
    map.on("zoomend moveend", work);
    return () => { map.off("zoomend moveend", work); };
  }, [map, pins]);
  return sides;
}

function Pins({ pins, city, onCity }) {
  const sides = useLabelSides(pins);
  return pins.map((p) => (
    <Marker key={p.key} position={[p.pos.lat, p.pos.lng]} icon={pinIcon(p, city === p.city, sides[p.key])}
      zIndexOffset={(LABEL_ORDER.length - LABEL_ORDER.indexOf(p.kind)) * 50}
      eventHandlers={{ click: () => onCity(city === p.city ? null : p.city) }} />
  ));
}

function Zoom() {
  const map = useMap();
  const btn = { width: 34, height: 34, border: "none", background: C.white, cursor: "pointer", display: "grid", placeItems: "center", padding: 0 };
  return (
    <div style={{ position: "absolute", right: 12, top: 64, zIndex: 600, borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 14px rgba(16,24,40,0.18)" }}>
      <button onClick={() => map.zoomIn()} aria-label="Zoom in" style={{ ...btn, borderBottom: `1px solid ${C.div}` }}><Plus size={16} color={NAVY} /></button>
      <button onClick={() => map.zoomOut()} aria-label="Zoom out" style={btn}><Minus size={16} color={NAVY} /></button>
    </div>
  );
}

function BoardMap({ dest, rows, city, onCity, height }) {
  const pins = useMemo(() => {
    const out = rows.filter((r) => r.pin && PIN[r.kind]).map((r) => ({
      key: r.key, kind: r.kind, label: r.name, city: r.kind === "region" ? r.id : r.city, pos: r.pin, dx: 0,
    }));
    // Pins on the same spot fan out side by side, centred on it.
    const spots = new Map();
    out.forEach((p) => {
      const k = `${p.pos.lat.toFixed(4)},${p.pos.lng.toFixed(4)}`;
      spots.set(k, [...(spots.get(k) || []), p]);
    });
    spots.forEach((group) => group.forEach((p, i) => { p.dx = (i - (group.length - 1) / 2) * 24; }));
    return out;
  }, [rows]);

  const bounds = useMemo(() => {
    if (!pins.length) return null;
    const lat = pins.map((p) => p.pos.lat);
    const lng = pins.map((p) => p.pos.lng);
    const pad = Math.max(0.06, (Math.max(...lat) - Math.min(...lat)) * 0.3);
    // Extra room at the bottom, where the sheet covers the map.
    return [[Math.min(...lat) - pad * 2.2, Math.min(...lng) - pad], [Math.max(...lat) + pad, Math.max(...lng) + pad]];
  }, [pins]);

  if (!bounds) {
    const hero = destData[dest]?.hero;
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height }}>
        {hero && <img src={hero} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height }}>
      <MapContainer bounds={bounds} style={{ height: "100%", width: "100%", background: "#AADAFF" }} attributionControl={false} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Zoom />
        <Pins pins={pins} city={city} onCity={onCity} />
      </MapContainer>
    </div>
  );
}

// ─── One save ───
//
// The photo, the name with its heart, what it is and where, who saved it, and
// a footer for the two things people do together on a board: leave a note and
// love it too. Regions keep the trip builder's own card shape (the town's
// opening line and how long people stay), so a town looks like the same town
// wherever it turns up.
function SaveCard({ row, dest, joined, onOpen, onRemove, onLove, onNote }) {
  const isRegion = row.kind === "region";
  const r = isRegion ? regionByCity(dest, row.id) : null;
  // A hotel's small print is its town and star category, which the card now
  // shows as facts of their own.
  const blurb = isRegion ? (regionGuide(dest, row.id)?.lead || row.sub)
    : row.kind === "hotel" ? null
    : (row.sub && row.sub !== row.city ? row.sub.replace(`${row.city} · `, "") : null);
  const saver = joined.find((p) => p.key === row.by) || { key: row.by, first: "someone" };
  const lovers = joined.filter((p) => row.lovedBy.includes(p.key));
  const shared = joined.length > 1;
  const everyone = lovedByAll(row, joined);
  const iLove = row.lovedBy.includes("you");
  const kindLine = isRegion
    ? (regionStay(dest, row.id) || "Region")
    : row.kind === "trip" ? row.meta : [KIND_NOUN[row.kind], row.city].filter(Boolean).join(" · ");
  // The rating, read from the same place every other card reads it: stars
  // out of 5 for a thing to do, the share who enjoyed it for a region.
  const stars = row.kind === "activity" ? activityRating(dest, row.city, row.name) : null;
  const enjoyed = isRegion && r ? regionEnjoyed(dest, row.id) : null;
  const hotel = row.kind === "hotel" ? hotelFacts(row) : null;

  return (
    <div onClick={onOpen} role={onOpen ? "button" : undefined} style={{
      background: C.white, borderRadius: 18, border: `1px solid ${everyone ? C.p300 : C.div}`, padding: 12,
      boxShadow: "0 1px 3px rgba(24,29,39,0.05)", cursor: onOpen ? "pointer" : "default",
    }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", width: 84, minHeight: 84, alignSelf: "stretch", flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "#F4F2F0" }}>
          {row.img
            ? <img src={row.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 24 }}>{row.emoji || "📍"}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 15, fontWeight: 800, color: NAVY, lineHeight: "20px", letterSpacing: "-0.2px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{row.name}</p>
            <SaveHeart size={28} saved onToggle={onRemove} style={{ margin: "-4px -6px 0 0" }} />
          </div>
          <p style={{ margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12, color: C.sub, fontWeight: 600 }}>
            {enjoyed && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: GREEN, fontWeight: 800 }}><ThumbsUp size={12} strokeWidth={2.5} /> {enjoyed.pct}% enjoyed</span>}
            {enjoyed && <span aria-hidden style={{ color: C.inact }}>·</span>}
            <span>{kindLine}</span>
          </p>
          {hotel && (
            // The same two facts, in the same colours, as the hotel cards on
            // the itinerary: star category, then the Booking score.
            <p style={{ margin: "4px 0 0", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12.5 }}>
              {hotel.stars && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Star size={14} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />
                  <span style={{ fontWeight: 600, color: "#4EAC7E" }}>{hotel.stars} star hotel</span>
                </span>
              )}
              {hotel.score && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: 3, background: "#003580", color: "#fff", fontSize: 10.5, fontWeight: 700 }}>B</span>
                  <span style={{ fontWeight: 600, color: NAVY }}>{hotel.score} Rated</span>
                </span>
              )}
            </p>
          )}
          {stars && (
            <p style={{ margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <Star size={12} color="#FBBC05" fill="#FBBC05" />
              <span style={{ fontWeight: 800, color: NAVY }}>{stars.rating}</span>
              <span style={{ color: C.inact }}>({stars.reviews.toLocaleString()})</span>
            </p>
          )}
          {blurb && <p style={{ margin: "4px 0 0", fontSize: 12, lineHeight: "17px", color: C.sub, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blurb}</p>}
          {shared && saver.key !== "you" && (
            <p style={{ margin: "auto 0 0", paddingTop: 6, display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.sub, fontWeight: 600 }}>
              <Avatar person={saver} size={16} /> Saved by {saver.first}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, paddingTop: 9, borderTop: `1px solid ${C.div}` }}>
        <button onClick={(e) => { e.stopPropagation(); onNote(); }} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
          {row.note
            ? <span style={{ fontSize: 12.5, color: NAVY, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>&ldquo;{row.note}&rdquo;</span>
            : <span style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, display: "inline-flex", alignItems: "center", gap: 2 }}>Add a note <ChevronRight size={14} /></span>}
        </button>
        {shared && (everyone ? (
          <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: C.p600 }}>
            <AvatarStack people={lovers} size={20} /> Everyone loves this
          </span>
        ) : iLove ? (
          // Your own save, not loved by the others yet: nothing to say. With
          // more people on the board, say how many love it so far.
          lovers.length > 1 && (
            <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.sub }}>
              <AvatarStack people={lovers} size={20} /> {lovers.length} love this
            </span>
          )
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onLove(); }} style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 11px 0 4px", borderRadius: 999,
            border: `1.5px solid ${C.p300}`, background: C.white, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, color: C.p600,
          }}>
            <AvatarStack people={lovers} size={20} /> <Heart size={13} color={C.p600} /> Love it too
          </button>
        ))}
      </div>
    </div>
  );
}

// The saves everyone on the board loves, as a rail at the top. The strongest
// signal on the board gets its own place before the full list.
function LovedRail({ rows, joined, onOpen }) {
  return (
    <div style={{ margin: `4px -${PAD}px 18px` }}>
      <p style={{ margin: `0 ${PAD}px 10px`, display: "flex", alignItems: "center", gap: 7, fontSize: 16, fontWeight: 800, color: NAVY }}>
        <Heart size={15} color={C.p600} fill={C.p600} /> Loved by everyone
      </p>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 12, overflowX: "auto", padding: `0 ${PAD}px 4px`, scrollSnapType: "x mandatory", scrollPaddingLeft: PAD }}>
        {rows.map((r) => (
          <button key={r.key} onClick={() => onOpen(r)} style={{ flexShrink: 0, width: 148, height: 176, scrollSnapAlign: "start", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ position: "relative", height: 118, borderRadius: 16, overflow: "hidden", background: "#F4F2F0" }}>
              {r.img && <img src={r.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
              <span style={{ position: "absolute", left: 8, bottom: 8 }}><AvatarStack people={joined} size={22} /></span>
            </div>
            <p style={{ margin: "7px 0 0", fontSize: 13.5, fontWeight: 800, color: NAVY, lineHeight: "17px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sheets ───

function NoteSheet({ row, joined, group, onSave, onClose }) {
  const [text, setText] = useState(row.note || "");
  const saver = joined.find((p) => p.key === row.by);
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        {row.img && <img src={row.img} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</p>
          {saver && joined.length > 1 && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.sub }}>Saved by {saver.key === "you" ? "you" : saver.name}</p>}
        </div>
      </div>
      <textarea
        autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={140}
        placeholder="Book the sunset slot, ask about a room with a view..."
        style={{ width: "100%", boxSizing: "border-box", resize: "none", border: `1.5px solid ${C.div}`, borderRadius: 14, padding: "12px 14px", fontFamily: "inherit", fontSize: 14, color: NAVY, outline: "none", lineHeight: "20px" }}
      />
      <p style={{ margin: "6px 2px 16px", fontSize: 11.5, color: C.inact }}>{group ? "Everyone on the board sees notes." : "Only you see your notes."}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {row.note && <button onClick={() => onSave("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: C.sub }}>Delete note</button>}
        <button onClick={() => onSave(text.trim())} style={{ marginLeft: "auto", minHeight: 46, padding: "0 26px", borderRadius: 999, border: "none", background: C.p600, color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Save note</button>
      </div>
    </Sheet>
  );
}

function InviteSheet({ dest, people, onInvite, onClose }) {
  const onBoard = new Set(people.map((p) => p.key));
  return (
    <Sheet onClose={onClose}>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: NAVY }}>Plan {dest} with others</p>
      <p style={{ margin: "6px 0 16px", fontSize: 13, color: C.sub, lineHeight: "18px" }}>Everyone on a board can save, leave notes and love what others saved.</p>
      {people.map((p) => (
        <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}>
          <Avatar person={p} size={36} />
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: NAVY }}>{p.key === "you" ? "You" : p.name}</span>
          <span style={{ fontSize: 12.5, color: p.status === "invited" ? "#B97900" : C.inact, fontWeight: 600 }}>{p.key === "you" ? "Started this board" : p.status === "invited" ? "Invited" : "On the board"}</span>
        </div>
      ))}
      <p style={{ margin: "14px 0 4px", fontSize: 13, fontWeight: 800, color: NAVY }}>Invite from contacts</p>
      {INVITE_CONTACTS.map((c) => {
        const sent = onBoard.has(c.key);
        return (
          <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.div}` }}>
            <Avatar person={c} size={36} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: NAVY }}>{c.name}</span>
            <button disabled={sent} onClick={() => onInvite(c.key)} style={{
              display: "inline-flex", alignItems: "center", gap: 4, height: 32, padding: "0 13px", borderRadius: 999, fontFamily: "inherit", fontSize: 12.5, fontWeight: 800,
              border: `1.5px solid ${sent ? C.div : C.p600}`, background: C.white, color: sent ? C.inact : C.p600, cursor: sent ? "default" : "pointer",
            }}>
              {sent ? <><Check size={13} strokeWidth={3} /> Invited</> : "Invite"}
            </button>
          </div>
        );
      })}
    </Sheet>
  );
}

// ─── A destination's board ───

const PEEK = 0.44; // where the sheet rests, as a share of the screen height

// ─── Plan from the board ───
//
// Everything a plan needs except who and when is already on the board, so the
// wizard asks only that: travellers, then dates, then the itinerary is made.
// When the board holds saved itineraries this asks first which to start from,
// one of them or the saves themselves; with none it goes straight in.

function PlanOption({ img, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 10, marginBottom: 10, border: `1px solid ${C.div}`, borderRadius: 16, background: C.white, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
      <span style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#F4F2F0" }}>
        {img && <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: NAVY }}>{title}</span>
        <span style={{ display: "block", marginTop: 3, fontSize: 12.5, color: C.sub, lineHeight: "17px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</span>
      </span>
      <ChevronRight size={18} color={C.inact} />
    </button>
  );
}

function PlanSheet({ dest, rows, itins, onPick, onClose }) {
  const places = rows.filter((r) => r.kind !== "trip");
  const kinds = SECTION_ORDER.filter((k) => k !== "trip").map((k) => ({ k, n: places.filter((r) => r.kind === k).length })).filter((x) => x.n);
  return (
    <Sheet onClose={onClose}>
      <p style={{ margin: 0, fontSize: 19, fontWeight: 800, color: NAVY }}>Plan {dest}</p>
      <p style={{ margin: "4px 0 16px", fontSize: 13, color: C.sub }}>Pick where to start. Then just who is going and when.</p>
      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: C.sub }}>A saved itinerary</p>
      {itins.map((r) => <PlanOption key={r.key} img={r.img} title={r.name} sub={r.sub} onClick={() => onPick({ itin: r })} />)}
      {places.length > 0 && (
        <>
          <p style={{ margin: "8px 0 8px", fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: C.sub }}>Your saves</p>
          <PlanOption
            img={places.find((r) => r.img)?.img}
            title="Build from my saves"
            sub={kinds.map(({ k, n }) => `${n} ${KIND_WORDS[k][n === 1 ? 0 : 1]}`).join(" · ")}
            onClick={() => onPick(null)}
          />
        </>
      )}
    </Sheet>
  );
}

export function WishlistBoard({ group = false }) {
  const { dest: rawDest } = useParams();
  const dest = decodeURIComponent(rawDest || "");
  const navigate = useNavigate();
  const { deals } = useDeals();
  const { forDest, removeWithUndo, toggleLove, setNote, invite } = useWishlist();
  const { all: people, joined } = useBoardPeople(dest, group);
  const rows = useRows(forDest(dest), deals);

  // Back goes back. It used to push the Wishlist screen, whose own back then
  // returned here, and the two screens sent you round in a circle. Opened
  // straight from a link, with nothing behind it, it goes to the Wishlist.
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(baseOf(group), { replace: true }));
  const [planning, setPlanning] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const itins = rows.filter((r) => r.kind === "trip" && r.itineraryId != null);
  const startPlan = (pick) => navigate(pick?.itin
    ? `/build?dest=${encodeURIComponent(dest)}&from=wishlist&use=itin&itin=${pick.itin.itineraryId}${pick.itin.dealId ? `&deal=${pick.itin.dealId}` : ""}`
    : `/build?dest=${encodeURIComponent(dest)}&from=wishlist&use=saves`);
  const [expanded, setExpanded] = useState(false);
  const [city, setCity] = useState(null);
  const [tab, setTab] = useState("all");
  const [noteFor, setNoteFor] = useState(null);
  const [inviting, setInviting] = useState(false);
  const scroller = useRef(null);
  const drag = useRef(null);

  useEffect(() => { if (!rows.length) navigate(baseOf(group), { replace: true }); }, [rows.length, navigate, group]);

  const rank = (a, b) => (lovedByAll(b, joined) - lovedByAll(a, joined)) || (b.lovedBy.length - a.lovedBy.length) || ((b.savedAt || 0) - (a.savedAt || 0));
  const inCity = (r) => !city || (r.kind === "region" ? r.id === city : r.city === city);
  const shown = rows.filter(inCity).filter((r) => tab === "all" || r.kind === tab).sort(rank);
  const loved = rows.filter((r) => lovedByAll(r, joined));
  const tabs = SECTION_ORDER.map((k) => ({ k, n: rows.filter(inCity).filter((r) => r.kind === k).length })).filter((t) => t.n);

  const openRow = (r) => { if (r.open) navigate(r.open); };
  const pickCity = (c) => { setCity(c); setTab("all"); scroller.current?.scrollTo({ top: 0 }); };

  // The sheet rests low so the map shows, and comes up to read. A drag on the
  // handle moves it; scrolling the list while it is low brings it up first.
  const onDown = (e) => { drag.current = e.clientY; };
  const onUp = (e) => {
    if (drag.current == null) return;
    const dy = e.clientY - drag.current;
    drag.current = null;
    if (Math.abs(dy) < 6) setExpanded((v) => !v);
    else setExpanded(dy < 0);
  };
  const onScroll = (e) => { if (!expanded && e.currentTarget.scrollTop > 8) setExpanded(true); };

  if (!rows.length) return null;

  const content = tab === "all"
    ? SECTION_ORDER.map((k) => ({ k, rows: shown.filter((r) => r.kind === k) })).filter((g) => g.rows.length)
    : [{ k: tab, rows: shown }];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#AADAFF" }}>
      <BoardMap dest={dest} rows={rows} city={city} onCity={(c) => { pickCity(c); if (c) setExpanded(false); }} height={`${(PEEK + 0.08) * 100}%`} />

      {/* Back, floating over the map */}
      <div style={{ position: "absolute", left: PAD, top: `calc(12px + env(safe-area-inset-top, 0px))`, zIndex: 700, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={goBack} aria-label="Back" style={{ width: 40, height: 40, borderRadius: "50%", background: C.white, border: "none", display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(16,24,40,.18)" }}>
          <ArrowLeft size={19} color={NAVY} />
        </button>
      </div>

      {/* The sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, top: expanded ? 66 : `${PEEK * 100}%`, zIndex: 650,
        background: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26, boxShadow: "0 -10px 30px rgba(16,24,40,0.16)",
        transition: "top .32s cubic-bezier(0.32,0.72,0,1)", display: "flex", flexDirection: "column",
      }}>
        <div onPointerDown={onDown} onPointerUp={onUp} style={{ flexShrink: 0, padding: "10px 0 4px", cursor: "row-resize", touchAction: "none" }}>
          <div style={{ width: 40, height: 5, borderRadius: 4, background: C.div, margin: "0 auto" }} />
        </div>

        <div ref={scroller} onScroll={onScroll} className="hide-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: `4px ${PAD}px 96px` }}>
          {/* Who and what */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>
                {flagOf(dest)} {dest}
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: C.sub, letterSpacing: 0 }}>{rows.length} {rows.length === 1 ? "save" : "saves"}</span>
              </h1>
            </div>
            {/* More to save, from the same deck the home and destination
                pages open. The plan button below stays the one pink action. */}
            <button data-testid="board-shortlist" onClick={() => setChoosing(true)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, height: 36, padding: "0 12px", borderRadius: 999, border: `1.5px solid ${C.p600}`, background: C.white, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, color: C.p600 }}>
              <Plus size={15} /> Shortlist more
            </button>
            {group && <button onClick={() => setInviting(true)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 12px 0 5px", borderRadius: 999, border: `1px solid ${C.div}`, background: C.white, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, color: NAVY }}>
              <AvatarStack people={people} size={26} /> <UserPlus size={15} /> Invite
            </button>}
          </div>

          {loved.length > 0 && !city && tab === "all" && <LovedRail rows={loved} joined={joined} onOpen={openRow} />}

          {/* Filters: a town picked on the map, then what kind of thing */}
          <div className="hide-scrollbar" style={{ position: "sticky", top: -4, zIndex: 2, background: C.white, display: "flex", gap: 8, overflowX: "auto", margin: `0 -${PAD}px 12px`, padding: `8px ${PAD}px` }}>
            {city && (
              <button onClick={() => pickCity(null)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, height: 34, padding: "0 12px", borderRadius: 999, border: `1.5px solid ${C.p600}`, background: C.white, color: C.p600, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                {city} <XIcon size={14} />
              </button>
            )}
            {/* Each kind wears its map colour: the same disc and icon as its
                pins, and a tint of that colour when picked, so the chips are
                also the map's key. */}
            {[{ k: "all", n: rows.filter(inCity).length }, ...tabs].map((t) => {
              const on = tab === t.k;
              const kind = PIN[t.k];
              return (
                <button key={t.k} onClick={() => setTab(t.k)} style={{
                  flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: kind ? "0 13px 0 6px" : "0 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                  border: `1.5px solid ${on ? (kind ? kind.color : NAVY) : C.div}`, background: on ? (kind ? kind.tint : NAVY) : C.white, color: on && !kind ? "#fff" : NAVY,
                }}>
                  {kind && (
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: kind.color, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: kind.icon }} />
                    </span>
                  )}
                  {t.k === "all" ? "All" : KIND_LABEL[t.k]} <span style={{ opacity: 0.6, fontWeight: 600 }}>{t.n}</span>
                </button>
              );
            })}
          </div>

          {content.map((g) => (
            <div key={g.k} style={{ marginBottom: 20 }}>
              {tab === "all" && <p style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 800, color: NAVY }}>{KIND_LABEL[g.k]}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {g.rows.map((r) => (
                  <SaveCard
                    key={r.key} row={r} dest={dest} joined={joined}
                    onOpen={r.open ? () => openRow(r) : undefined}
                    onRemove={() => removeWithUndo(r.kind, r.dest, r.id)}
                    onLove={() => toggleLove(r.key)}
                    onNote={() => setNoteFor(r)}
                  />
                ))}
              </div>
            </div>
          ))}
          {!shown.length && <p style={{ margin: "30px 0", textAlign: "center", fontSize: 13, color: C.sub }}>Nothing saved in {city} yet.</p>}
        </div>

        {/* The one thing a board is for, in one short line. */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: `calc(16px + env(safe-area-inset-bottom, 0px))`, zIndex: 3, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <button onClick={() => (itins.length ? setPlanning(true) : startPlan(null))} style={{
            pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 8, height: 50, padding: "0 22px", borderRadius: 999, border: "none",
            background: C.p600, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 800, boxShadow: "0 8px 22px rgba(227,27,83,0.32)",
          }}>
            Plan {dest} with my saves <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {planning && <PlanSheet dest={dest} rows={rows} itins={itins} onPick={startPlan} onClose={() => setPlanning(false)} />}
      {choosing && <ChooseSheet dest={dest} onClose={() => setChoosing(false)} />}
      {noteFor && <NoteSheet row={noteFor} joined={joined} group={group} onClose={() => setNoteFor(null)} onSave={(t) => { setNote(noteFor.key, t); setNoteFor(null); }} />}
      {group && inviting && <InviteSheet dest={dest} people={people} onInvite={(k) => invite(dest, k)} onClose={() => setInviting(false)} />}
    </div>
  );
}

// ─── All boards ───
//
// One card per destination, saying what is inside before it is opened: the
// saves themselves as small round photos on the cover, the name and count,
// when it was last added to, and a count for each kind of save. The group
// board adds who is on it and how many saves everyone loves.

const KIND_WORDS = {
  region: ["region", "regions"], activity: ["thing to do", "things to do"], hotel: ["hotel", "hotels"],
  restaurant: ["place to eat", "places to eat"], shop: ["shop", "shops"], trip: ["itinerary", "itineraries"],
};
const KIND_ICON = { region: MapIcon, activity: Ticket, hotel: BedDouble, restaurant: Utensils, shop: ShoppingBag, trip: RouteIcon };

function ago(ts) {
  if (!ts) return "";
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return w === 1 ? "last week" : `${w} weeks ago`;
  const m = Math.floor(d / 30);
  return m <= 1 ? "last month" : `${m} months ago`;
}

function BoardCard({ dest, rows, group, onOpen }) {
  const { joined, all } = useBoardPeople(dest, group);
  const loved = rows.filter((r) => lovedByAll(r, joined)).length;
  const cover = rows.find((r) => r.img)?.img || destData[dest]?.hero;
  const faces = rows.filter((r) => r.img).slice(0, 5);
  const more = rows.length - faces.length;
  const kinds = SECTION_ORDER.map((k) => ({ k, n: rows.filter((r) => r.kind === k).length })).filter((x) => x.n);
  return (
    <button onClick={onOpen} style={{ flexShrink: 0, display: "block", width: "100%", padding: 7, border: `1px solid ${C.div}`, borderRadius: 22, background: C.white, cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxShadow: "0 4px 18px rgba(24,29,39,0.06)" }}>
      <div style={{ position: "relative", height: 150, borderRadius: 16, overflow: "hidden", background: "#F4F2F0" }}>
        {cover && <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        {/* The saves, overlapping, on the bottom edge of the cover. */}
        <div style={{ position: "absolute", left: 10, bottom: 10, display: "flex" }}>
          {faces.map((f, n) => (
            <span key={f.key} style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: "2px solid #fff", marginLeft: n ? -9 : 0, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", background: "#F4F2F0" }}>
              <img src={f.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </span>
          ))}
          {more > 0 && <span style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #fff", marginLeft: -9, background: NAVY, color: "#fff", display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800 }}>+{more}</span>}
        </div>
        {group && <span style={{ position: "absolute", right: 10, bottom: 10 }}><AvatarStack people={all} size={28} /></span>}
      </div>
      <div style={{ padding: "11px 8px 6px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 18, fontWeight: 800, color: NAVY }}>
            {flagOf(dest)} {dest} <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 400, color: C.sub }}>{rows.length} {rows.length === 1 ? "save" : "saves"}</span>
          </p>
          <span style={{ flexShrink: 0, fontSize: 12, color: C.inact }}>{ago(rows[0]?.savedAt)}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 9 }}>
          {kinds.map(({ k, n }) => {
            const Icon = KIND_ICON[k];
            return (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.sub }}>
                <Icon size={14} color={C.sub} strokeWidth={2} /> <b style={{ color: NAVY }}>{n}</b> {KIND_WORDS[k][n === 1 ? 0 : 1]}
              </span>
            );
          })}
        </div>
        {group && loved > 0 && <p style={{ margin: "8px 0 0", fontSize: 12.5, fontWeight: 700, color: C.p600 }}>{loved} loved by everyone</p>}
      </div>
    </button>
  );
}

export function WishlistHome({ group = false }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { deals } = useDeals();
  const { items, destinations } = useWishlist();
  const rows = useRows(items, deals);

  // Old links (the toast, the trip builder) name a destination: go straight
  // to its board.
  const wanted = params.get("dest");
  useEffect(() => {
    if (wanted && destinations.includes(wanted)) navigate(boardPath(wanted, group), { replace: true });
  }, [wanted, destinations, navigate, group]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.white }}>
      {/* The title sits in the header bar, beside back, so the boards start
          right under it rather than below an empty band. */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: `12px ${PAD}px 10px`, borderBottom: `1px solid ${C.div}` }}>
        <button onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"))} aria-label="Back" style={{ width: 34, height: 34, borderRadius: "50%", background: C.bg, border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={18} color={NAVY} />
        </button>
        <h1 style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 800, color: NAVY }}>Wishlist</h1>
      </div>
      <div className="hide-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: `14px ${PAD}px 32px` }}>

        {destinations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 12px" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: C.white, display: "grid", placeItems: "center", margin: "0 auto 14px", boxShadow: "0 4px 18px rgba(24,29,39,0.08)" }}>
              <Heart size={28} color={C.p600} fill={C.p600} />
            </div>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: NAVY }}>Every heart you tap lands here</p>
            <p style={{ margin: "6px auto 18px", maxWidth: 260, fontSize: 13, color: C.sub, lineHeight: "19px" }}>{group ? "Each destination gets its own board, with a map, notes, and the people you are planning with." : "Each destination gets its own board, with a map of what you saved and your notes."}</p>
            <button onClick={() => navigate("/")} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 46, padding: "0 22px", borderRadius: 999, border: "none", background: C.p600, color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              <Compass size={16} /> Explore destinations
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {destinations.map((d) => <BoardCard key={d} dest={d} group={group} rows={rows.filter((r) => r.dest === d)} onOpen={() => navigate(boardPath(d, group))} />)}
          </div>
        )}
      </div>
    </div>
  );
}
