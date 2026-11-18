import { useEffect, useMemo, useState } from "react";
import { Users, MapPin, ChevronRight } from "lucide-react";
import { C } from "../data";
import { stayHotels, getStayInfo } from "../data/hotelData";
import { useWishlist } from "../data/wishlist";
import { PriceDelta } from "../pages/HotelListing";
import SaveHeart from "./SaveHeart";

// ─── Travellers like you also chose ───
//
// Under the hotels row, on the cream band the activity suggestions use. It
// follows the hotel in view: swipe to Kintamani and the city in the title and
// the picks under it change to Kintamani's. Three kinds, each a tab, and a tab
// is left out when it has nothing to show:
//
// - 5 star: other 5 star hotels in the city, when the stay is not one already.
// - Room upgrade: the next room up in the same hotel. One room, one card.
// - Higher rated: hotels in the city scored above the stay.
// - Value find: as good a hotel or better, for less.
//
// Hotels open the hotel page in the Change hotel flow, so choosing one swaps
// the stay the way the list does. The room opens the same hotel page with that
// room's details already open. Nothing here is pink: the page has its one pink
// button, Save Itinerary.

const CREAM = "#FDF8F5";
const GOLD = "#FDA201";
const LAGOON = "#007E72";
const MAX = 4;
const KINDS = [
  { key: "five", label: "5 star" },
  { key: "room", label: "Room upgrade" },
  { key: "rated", label: "Higher rated" },
  { key: "value", label: "Value find" },
];

const photoOf = (x) => (typeof x === "string" ? x : x?.url);

// The picks for one stay. `shown` is the stay as the trip card shows it (stars
// and score); the prices are measured against the hotel behind it, the same
// way the Change hotel list and the hotel page measure them.
export function picksFor(it, stayIndex, shown) {
  const si = getStayInfo(it, stayIndex);
  if (!si) return null;
  const all = stayHotels(it, stayIndex);
  const cur = all.find((h) => h.id === shown.hotelId) || all[0];
  if (!cur) return null;
  const nights = si.nights;
  const base = cur.rooms[0].pricePerNight;
  const others = all.filter((h) => h.id !== cur.id);
  const byScore = (a, b) => b.bookingScore - a.bookingScore;
  const hotelPick = (h) => ({ hotel: h, delta: (h.rooms[0].pricePerNight - base) * nights });

  // An upgrade costs more. A pick that would come out cheaper is a value
  // find, and has its own tab.
  const dearer = (h) => h.rooms[0].pricePerNight > base;
  const five = shown.stars < 5 ? others.filter((h) => h.stars >= 5 && dearer(h)).sort(byScore).slice(0, MAX).map(hotelPick) : [];
  const fiveIds = new Set(five.map((p) => p.hotel.id));
  const rated = others.filter((h) => h.bookingScore > shown.rating && dearer(h) && !fiveIds.has(h.id)).sort(byScore).slice(0, MAX).map(hotelPick);
  // A value find: as many stars or more, scored about as well or better, for
  // less. The cheapest first.
  const value = others
    .filter((h) => !dearer(h) && h.rooms[0].pricePerNight < base && h.stars >= shown.stars && h.bookingScore >= shown.rating - 0.2)
    .sort((a, b) => a.rooms[0].pricePerNight - b.rooms[0].pricePerNight).slice(0, MAX).map(hotelPick);
  const nextRoom = [...cur.rooms].sort((a, b) => a.pricePerNight - b.pricePerNight).find((r) => r.pricePerNight > base);
  // Named as the trip card names the stay, so the two read as one hotel.
  const room = nextRoom ? { hotel: cur, hotelName: shown.name || cur.name, room: nextRoom, delta: (nextRoom.pricePerNight - base) * nights } : null;

  return { city: si.city, nights, five, room, rated, value };
}

function HotelPickCard({ dest, city, pick, onOpen }) {
  const { hotel, delta } = pick;
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved("hotel", dest, hotel.name);
  const img = photoOf(hotel.images?.[0]);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(hotel)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(hotel); }}
      style={{
        flex: "none", width: 222, borderRadius: 14, overflow: "hidden", background: C.white,
        border: `1px solid ${C.div}`, cursor: "pointer", scrollSnapAlign: "start",
      }}
    >
      <div style={{ position: "relative", height: 150, background: C.bg }}>
        {img && <img src={img} alt={hotel.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        <SaveHeart
          onPhoto
          saved={saved}
          onToggle={() => toggle("hotel", dest, hotel.name, {
            name: hotel.name, img, sub: `${city} · ${hotel.stars}-star`, city, stars: hotel.stars, score: hotel.bookingScore,
          })}
          style={{ position: "absolute", top: 6, right: 6 }}
        />
      </div>
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hotel.name}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.sub, whiteSpace: "nowrap", overflow: "hidden" }}>
          <MapPin size={12.5} color={C.inact} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{hotel.neighbourhood}, {city}</span>
        </span>
        <div style={{ marginTop: 2 }}>
          <PriceDelta delta={delta} nights={1} fallbackPrice={0} />
        </div>
      </div>
    </div>
  );
}

function RoomPickCard({ pick, onOpen }) {
  const { hotel, hotelName, room, delta } = pick;
  const img = photoOf(room.images?.[0]) || photoOf(hotel.images?.[0]);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      style={{ margin: "0 16px", borderRadius: 14, overflow: "hidden", background: C.white, border: `1px solid ${C.div}`, cursor: "pointer" }}
    >
      {img && <img src={img} alt={room.name} loading="lazy" style={{ display: "block", width: "100%", height: 160, objectFit: "cover" }} />}
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: C.head, lineHeight: 1.3 }}>{room.name}</p>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: C.sub }}>{hotelName}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12 }}>
          <PriceDelta delta={delta} nights={1} fallbackPrice={0} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: 13, fontWeight: 600, color: C.head, whiteSpace: "nowrap" }}>
            View room details <ChevronRight size={14} strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </div>
  );
}

// it: the itinerary. stays: the trip's hotel cards, in order (stars, rating,
// hotelId). active: the index of the card in view. Self-booked stays pass null.
export default function HotelPicks({ it, stays, active, onOpenHotel, onOpenRoom }) {
  const stay = stays[active];
  const picks = useMemo(() => (stay ? picksFor(it, active, stay) : null), [it, active, stay]);
  const kinds = useMemo(() => (picks ? KINDS.filter((k) => (k.key === "room" ? !!picks.room : picks[k.key].length)) : []), [picks]);
  const [tab, setTab] = useState(kinds[0]?.key);
  // Keep the kind when the next hotel has it too; otherwise its first one.
  useEffect(() => {
    if (!kinds.some((k) => k.key === tab)) setTab(kinds[0]?.key);
  }, [kinds, tab]);
  if (!picks || !kinds.length) return null;
  const on = kinds.some((k) => k.key === tab) ? tab : kinds[0].key;

  return (
    <section
      aria-label={`Travellers like you also chose in ${picks.city}`}
      style={{ margin: "16px 0 0", background: CREAM, padding: "18px 0 20px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", marginBottom: 12 }}>
        <Users size={18} color={GOLD} strokeWidth={2} aria-hidden />
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>
          Travellers like you also chose <span key={picks.city} style={{ color: LAGOON, fontWeight: 600 }}>in {picks.city}</span>
        </p>
      </div>

      <div role="tablist" style={{ display: "flex", gap: 22, padding: "0 16px", borderBottom: `1px solid ${C.div}`, marginBottom: 14 }}>
        {kinds.map((k) => {
          const sel = k.key === on;
          return (
            <button
              key={k.key}
              role="tab"
              aria-selected={sel}
              onClick={() => setTab(k.key)}
              style={{
                padding: "0 0 8px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, fontWeight: sel ? 700 : 500, color: sel ? C.head : C.sub, whiteSpace: "nowrap",
                borderBottom: `2px solid ${sel ? C.head : "transparent"}`, marginBottom: -1,
              }}
            >{k.label}</button>
          );
        })}
      </div>

      {on === "room" ? (
        <RoomPickCard pick={picks.room} onOpen={() => onOpenRoom(active, picks.room.hotel.id, picks.room.room.id)} />
      ) : (
        <div
          className="hide-scrollbar"
          style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 16px", scrollPaddingLeft: 16 }}
        >
          {picks[on].map((p) => (
            <HotelPickCard key={p.hotel.id} dest={it.dest} city={picks.city} pick={p} onOpen={(h) => onOpenHotel(active, h.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
