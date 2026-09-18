import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, X as XIcon, SlidersHorizontal, ChevronDown, ChevronUp,
  Check, Home, MoreVertical, Star, User, Images, ChevronRight,
  Car, Utensils, RotateCcw, Ban, LogIn, LogOut,
} from "lucide-react";
import { C, allItineraries } from "../data";
import { generateHotelsForCity, getStayInfo, formatHotelPrice } from "../data/hotelData";

// ─── Change hotel, built like Change day plan ───
//
// The old screen was a comparison table pretending to be a list: a thumbnail,
// six lines of small text, and the hotel you already have pinned to the top in
// a box of its own. Choosing a stay is the same browse problem a day plan is,
// so it gets the same shape.
//
// Cards lead with their photos, because a hotel is looked at before it is read.
// Under the photos sits only what a stay is actually compared on: how good it
// is, what room you get, where it is, whether you can cancel it, how it gets
// you around, and what it does to the price you already have.

// ─── Sorting: every hotel here is a change to an existing stay, so the money
// question is never "how much" but "how much more" ───
const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "diff_asc", label: "Price difference: low to high" },
  { key: "diff_desc", label: "Price difference: high to low" },
  { key: "rating", label: "Rating: high to low" },
  { key: "distance", label: "Distance: nearest first" },
];

// The cuts people reach for most, on the bar itself. Each writes the same
// filter state the sheet does, so the two never disagree.
const QUICK = [
  { key: "5 star", label: "5 star" },
  { key: "9+ rated", label: "9+ rated" },
  { key: "Free cancellation", label: "Free cancellation" },
  { key: "Private transfer", label: "Private transfer" },
  { key: "Early check-in", label: "Early check-in" },
];

const mealOptions = ["Only Room", "Breakfast included", "Breakfast + Dinner", "All Inclusive"];
const filterAmenityOptions = ["Breakfast", "Spa", "Swimming pool", "Gym", "Airport Transfer", "Free WiFi", "Beachfront", "Restaurant", "Bar", "Parking"];
const roomFacilityOptions = ["Jacuzzi", "Balcony", "Sea View", "Private Pool", "Minibar", "Butler Service"];

// Hotel photos plus every room photo, which is what a traveller means by
// "show me the pictures".
const galleryOf = (hotel) => [
  ...hotel.images.map((im) => im.url),
  ...hotel.rooms.flatMap((r) => r.images || []),
].filter((v, i, a) => a.indexOf(v) === i);

// ─── The one number that matters: what this swap does to the trip ───
function PriceDelta({ delta, nights, fallbackPrice }) {
  if (delta === null) {
    return (
      <span style={{ fontSize: 13, fontWeight: 700, color: C.head }}>
        ₹{formatHotelPrice(fallbackPrice * nights)}
      </span>
    );
  }
  if (!delta) {
    return <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sub }}>No change in price</span>;
  }
  const up = delta > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: up ? "#FEF3F2" : "#ECFDF3", color: up ? "#B42318" : "#027A48",
      borderRadius: 999, padding: "5px 11px",
      fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {up ? "More by" : "Lesser by"} ₹{formatHotelPrice(Math.abs(delta))}
    </span>
  );
}

// The two chips a hotel is judged on, in the shape Change day plan uses: white
// fill, the colour carried by a hairline border and the text.
//
// Stars are ours, the score is Booking.com's, so the score keeps their mark and
// takes its colour from how good it is, the way a day rating does.
function StarChip({ stars }) {
  const col = "#E8940B";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
      padding: "3px 9px", borderRadius: 20, background: C.white,
      border: `1px solid ${col}55`, fontSize: 11.5, fontWeight: 700, color: col, whiteSpace: "nowrap",
    }}>
      <Star size={11} color={col} fill={col} strokeWidth={0} />
      {stars} star
    </span>
  );
}

function ScoreChip({ score }) {
  const col = score >= 9 ? "#027A48" : score >= 8 ? "#0E9384" : "#B54708";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
      padding: "3px 9px", borderRadius: 20, background: C.white,
      border: `1px solid ${col}55`, fontSize: 11.5, fontWeight: 700, color: col, whiteSpace: "nowrap",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 14, height: 14, borderRadius: 3, background: "#003580", color: "#fff",
        fontSize: 10, fontWeight: 700,
      }}>B</span>
      {score} Rated
    </span>
  );
}

function Fact({ icon: Icon, children, muted = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0, fontSize: 12, color: muted ? C.inact : C.sub, whiteSpace: "nowrap" }}>
      <Icon size={12.5} color={C.inact} />
      {children}
    </span>
  );
}

// ─── One hotel ──────────────────────────────────────────────────────────────
function HotelCard({ hotel, nights, priceDelta, onOpen, onGallery }) {
  const photos = galleryOf(hotel);
  const strip = photos.slice(0, 6);

  return (
    <div
      data-testid={`hotel-option-${hotel.id}`}
      onClick={() => onOpen(hotel)}
      role="button"
      style={{
        borderRadius: 14, overflow: "hidden", background: C.white, cursor: "pointer",
        border: `1px solid ${C.div}`, boxShadow: "0 1px 4px rgba(24,30,76,0.05)",
      }}
    >
      {/* Photos: swipe through a few here, tap for all of them */}
      <div style={{ position: "relative", height: 168, background: C.div }}>
        <div className="hide-scrollbar" style={{ display: "flex", height: "100%", overflowX: "auto", gap: 2 }}>
          {strip.map((src, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); onGallery(hotel, i); }}
              style={{ flexShrink: 0, height: "100%", width: "86%" }}
            >
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
        </div>
        <button
          data-testid={`gallery-${hotel.id}`}
          onClick={(e) => { e.stopPropagation(); onGallery(hotel, 0); }}
          style={{
            position: "absolute", right: 9, bottom: 9, display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(12,16,40,0.78)", borderRadius: 6, padding: "4px 9px", border: "none",
            cursor: "pointer", fontFamily: "inherit",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <Images size={11} color="#fff" />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>{photos.length} photos</span>
        </button>
      </div>

      <div style={{ padding: "10px 12px 11px", display: "flex", flexDirection: "column", gap: 7 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head, lineHeight: 1.3 }}>{hotel.name}</p>

        {/* How good it is */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <StarChip stars={hotel.stars} />
          <ScoreChip score={hotel.bookingScore} />
        </div>

        {/* What you get, and where it puts you */}
        <p style={{ margin: 0, fontSize: 12.5, color: C.sub, lineHeight: 1.35 }}>
          {hotel.roomType} · {hotel.neighbourhood}, {hotel.distanceFromCenter} km from city centre
        </p>

        {/* What is and is not included: a figure per fact, spaced apart, so the
            row reads as facts and not as a sentence run on from the line above */}
        <div style={{ display: "flex", gap: "5px 16px", flexWrap: "wrap" }}>
          {hotel.mealPlan !== "Only Room" && <Fact icon={Utensils}>{hotel.mealPlan}</Fact>}
          <Fact icon={Car}>{hotel.sharedTransfers ? "Shared transfer" : "Private transfer"}</Fact>
          <Fact icon={hotel.freeCancellation ? RotateCcw : Ban} muted={!hotel.freeCancellation}>
            {hotel.freeCancellation ? "Refundable" : "Non-refundable"}
          </Fact>
          {hotel.earlyCheckIn && <Fact icon={LogIn}>Early check-in</Fact>}
          {hotel.lateCheckOut && <Fact icon={LogOut}>Late checkout</Fact>}
        </div>

        {/* The whole card opens the hotel, and the chevron is what says so */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: `1px solid ${C.div}`, paddingTop: 9, marginTop: 1 }}>
          <PriceDelta delta={priceDelta} nights={nights} fallbackPrice={hotel.pricePerNight} />
          <ChevronRight size={18} color={C.sub} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Every photo, full bleed ───────────────────────────────────────────────
function Gallery({ hotel, startAt, onClose }) {
  const photos = galleryOf(hotel);
  const [idx, setIdx] = useState(startAt);

  useEffect(() => {
    const el = document.getElementById(`gal-${startAt}`);
    el?.scrollIntoView({ block: "nearest", inline: "start" });
  }, [startAt]);

  return (
    <div data-testid="hotel-gallery" style={{ position: "absolute", inset: 0, zIndex: 200, background: "#0B0E1A", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <button onClick={onClose} aria-label="Close gallery" style={{
          width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.14)",
          display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
        }}>
          <XIcon size={17} color="#fff" />
        </button>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hotel.name}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>{idx + 1} of {photos.length}</p>
        </div>
      </div>
      <div
        className="hide-scrollbar"
        onScroll={(e) => {
          const w = e.currentTarget.clientWidth || 1;
          setIdx(Math.round(e.currentTarget.scrollLeft / w));
        }}
        style={{ flex: 1, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}
      >
        {photos.map((src, i) => (
          <div key={i} id={`gal-${i}`} style={{ flexShrink: 0, width: "100%", height: "100%", scrollSnapAlign: "start", display: "grid", placeItems: "center" }}>
            <img src={src} alt="" style={{ width: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── The screen ─────────────────────────────────────────────────────────────
export default function HotelListing({ selectedHotels, setSelectedHotels }) {
  const { itineraryId, stayIndex } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const currentHotelId = params.get("current");
  const dealId = params.get("dealId");
  const versionId = params.get("versionId");
  const dealQS = dealId && versionId ? `&dealId=${dealId}&versionId=${versionId}` : "";
  const backToItinerary = `/itinerary/${itineraryId}${dealId && versionId ? `?dealId=${dealId}&versionId=${versionId}` : ""}`;

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmSelf, setConfirmSelf] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [sheetTab, setSheetTab] = useState("Filters");
  const [gallery, setGallery] = useState(null);
  const [filters, setFilters] = useState({
    quick: new Set(),
    stars: new Set(),
    minRating: 0,
    meals: new Set(),
    landmarks: new Set(),
    amenities: new Set(),
    roomFacilities: new Set(),
    sort: "recommended",
  });

  const itinerary = allItineraries.find(i => String(i.id) === String(itineraryId));
  const stayInfo = itinerary ? getStayInfo(itinerary, Number(stayIndex)) : null;

  const allHotels = useMemo(
    () => (stayInfo ? generateHotelsForCity(stayInfo.city, itinerary.dest, stayInfo.checkIn, stayInfo.checkOut, stayInfo.nights) : []),
    [stayInfo, itinerary],
  );

  // The stay you already have is not an option to change to, so it is not in
  // the list. It is only the price everything else is measured against.
  const currentHotel = allHotels.find(h => h.id === currentHotelId);
  const nights = stayInfo?.nights || 1;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allHotels.filter(h => h.id !== currentHotelId).filter(h => {
      if (q && !h.name.toLowerCase().includes(q) && !h.neighbourhood.toLowerCase().includes(q)) return false;
      for (const f of filters.quick) {
        if (f === "5 star" && h.stars !== 5) return false;
        if (f === "9+ rated" && h.bookingScore < 9) return false;
        if (f === "Free cancellation" && !h.freeCancellation) return false;
        if (f === "Private transfer" && h.sharedTransfers) return false;
        if (f === "Early check-in" && !h.earlyCheckIn) return false;
      }
      if (filters.stars.size && !filters.stars.has(h.stars)) return false;
      if (filters.minRating > 0 && h.bookingScore < filters.minRating) return false;
      if (filters.meals.size && !h.rooms.some(r => filters.meals.has(r.mealPlan))) return false;
      if (filters.landmarks.size && !filters.landmarks.has(h.neighbourhood)) return false;
      if (filters.amenities.size && ![...filters.amenities].every(a => h.amenities.includes(a))) return false;
      if (filters.roomFacilities.size && ![...filters.roomFacilities].every(f => h.rooms.some(r => r.amenities.includes(f)))) return false;
      return true;
    });

    const delta = (h) => currentHotel ? (h.pricePerNight - currentHotel.pricePerNight) * nights : h.pricePerNight * nights;
    if (filters.sort === "diff_asc") list = [...list].sort((a, b) => delta(a) - delta(b));
    else if (filters.sort === "diff_desc") list = [...list].sort((a, b) => delta(b) - delta(a));
    else if (filters.sort === "rating") list = [...list].sort((a, b) => b.bookingScore - a.bookingScore);
    else if (filters.sort === "distance") list = [...list].sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
    else list = [...list].sort((a, b) => (b.bookingScore + b.stars / 2) - (a.bookingScore + a.stars / 2));
    return list;
  }, [allHotels, currentHotelId, currentHotel, nights, query, filters]);

  // Escape closes what is on top, the way a full screen should.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (gallery) setGallery(null);
      else if (showSheet) setShowSheet(false);
      else navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gallery, showSheet, navigate]);

  if (!itinerary || !stayInfo) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Stay not found</div>;
  }

  // Customer opts to arrange this stay themselves → mark it and return.
  const bookStayMyself = () => {
    setSelectedHotels?.(prev => {
      const next = { ...prev };
      const stays = [...(next[itineraryId]?.stays || [])];
      stays[Number(stayIndex)] = { selfBooked: true };
      next[itineraryId] = { ...next[itineraryId], stays };
      return next;
    });
    navigate(backToItinerary);
  };

  const toggleQuick = (key) => setFilters(prev => {
    const quick = new Set(prev.quick);
    quick.has(key) ? quick.delete(key) : quick.add(key);
    return { ...prev, quick };
  });
  const toggleFilter = (key, value) => setFilters(prev => {
    const next = new Set(prev[key]);
    next.has(value) ? next.delete(value) : next.add(value);
    return { ...prev, [key]: next };
  });

  const landmarkOptions = [...new Set(allHotels.map(h => h.neighbourhood))];
  const activeFilterCount =
    filters.quick.size + filters.stars.size + (filters.minRating > 0 ? 1 : 0) +
    filters.meals.size + filters.landmarks.size + filters.amenities.size + filters.roomFacilities.size;

  const clearAllFilters = () => setFilters(prev => ({
    quick: new Set(), stars: new Set(), minRating: 0, meals: new Set(),
    landmarks: new Set(), amenities: new Set(), roomFacilities: new Set(), sort: prev.sort,
  }));

  const openHotel = (hotel) =>
    navigate(`/hotel-detail/${itineraryId}/${stayIndex}/${encodeURIComponent(hotel.id)}?current=${encodeURIComponent(currentHotelId || "")}${dealQS}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, position: "relative", overflow: "hidden" }}>
      {/* ═══ Header: where this stay is, how long it runs, how much choice ═══ */}
      <div style={{ flexShrink: 0, background: C.white, borderBottom: `1px solid ${C.div}`, padding: "13px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{
            width: 34, height: 34, borderRadius: "50%", border: "none", background: C.bg,
            display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
          }}>
            <ArrowLeft size={18} color={C.head} />
          </button>

          {searching ? (
            <input
              autoFocus
              data-testid="hotel-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search hotels in ${stayInfo.city}`}
              style={{
                flex: 1, minWidth: 0, border: `1px solid ${C.div}`, borderRadius: 999,
                padding: "9px 14px", fontSize: 13.5, fontFamily: "inherit", color: C.head, outline: "none",
              }}
            />
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, display: "flex", alignItems: "baseline", gap: 7, whiteSpace: "nowrap", overflow: "hidden" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.head }}>{stayInfo.city}</span>
                <span style={{ fontSize: 12, color: C.inact }}>{shown.length} options</span>
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {stayInfo.checkIn} - {stayInfo.checkOut} · 1 room ·{" "}
                <User size={11} color={C.sub} style={{ display: "inline", verticalAlign: "-1px", marginRight: 1 }} /> 2
              </p>
            </div>
          )}

          <button
            data-testid="toggle-search"
            onClick={() => { setSearching(s => !s); if (searching) setQuery(""); }}
            style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: "50%", border: "none", background: C.bg,
              display: "grid", placeItems: "center", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {searching ? <XIcon size={16} color={C.head} /> : <Search size={16} color={C.head} />}
          </button>

          {/* Secondary action: arrange this stay yourself */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button onClick={() => setMenuOpen(o => !o)} aria-label="More options" style={{
              width: 32, height: 32, borderRadius: 10, border: "none", background: "none",
              display: "grid", placeItems: "center", cursor: "pointer",
            }}>
              <MoreVertical size={19} color={C.head} />
            </button>
            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                <div style={{ position: "absolute", top: 40, right: 0, zIndex: 41, width: 220, background: C.white, borderRadius: 12, border: `1px solid ${C.div}`, boxShadow: "0 8px 28px rgba(0,0,0,0.16)", overflow: "hidden" }}>
                  <button onClick={() => { setMenuOpen(false); setConfirmSelf(true); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                    <Home size={17} color={C.sub} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: C.head }}>Book this stay myself</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══ The list ═══ */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 16px calc(112px + env(safe-area-inset-bottom))" }}>
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.head }}>Nothing matches those filters</p>
            <p style={{ margin: "6px 0 16px", fontSize: 13, color: C.sub, lineHeight: "19px" }}>
              Try clearing a filter, or search for a hotel you had in mind.
            </p>
            <button onClick={() => { clearAllFilters(); setQuery(""); }} style={{
              padding: "10px 18px", borderRadius: 999, border: `1px solid ${C.div}`, background: C.white,
              fontSize: 13, fontWeight: 600, color: C.p600, cursor: "pointer", fontFamily: "inherit",
            }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {shown.map(h => (
              <HotelCard
                key={h.id}
                hotel={h}
                nights={nights}
                priceDelta={currentHotel ? (h.pricePerNight - currentHotel.pricePerNight) * nights : null}
                onOpen={openHotel}
                onGallery={(hotel, at) => setGallery({ hotel, at })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══ Floating bar: quick chips, a separator, one control for the rest ═══ */}
      <div style={{
        position: "absolute", bottom: 12, left: 12, right: 12, zIndex: 10,
        background: "rgba(255,255,255,0.94)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 16, padding: "8px 10px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div className="hs" style={{ flex: 1, gap: 6, paddingBottom: 0, minWidth: 0 }}>
          {QUICK.map(q => {
            const on = filters.quick.has(q.key);
            return (
              <button
                key={q.key}
                data-testid={`quick-${q.key}`}
                onClick={() => toggleQuick(q.key)}
                style={{
                  flexShrink: 0, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit",
                  border: on ? "1.5px solid #FD014F" : `1.5px solid ${C.div}`,
                  background: on ? "#FFEBF1" : C.white,
                  fontSize: 12, fontWeight: 500, color: on ? "#FD014F" : C.head, whiteSpace: "nowrap",
                }}
              >
                {q.label}
              </button>
            );
          })}
        </div>
        <div style={{ width: 1, height: 24, background: C.div, flexShrink: 0 }} />
        <button
          data-testid="open-filters"
          onClick={() => { setSheetTab("Filters"); setShowSheet(true); }}
          aria-label="Sorting and filters"
          style={{
            position: "relative", width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: activeFilterCount > 0 ? "#FFEBF1" : "transparent",
            border: activeFilterCount > 0 ? "1.5px solid #FD014F" : `1px solid ${C.div}`,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <SlidersHorizontal size={14} color={activeFilterCount > 0 ? "#FD014F" : C.sub} />
          {activeFilterCount > 0 && (
            <div style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: "#FD014F", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilterCount}</div>
          )}
        </button>
      </div>

      {/* ═══ Sorting and filters, one tabbed sheet ═══ */}
      {showSheet && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowSheet(false)} />
          <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", zIndex: 1, height: "72%", display: "flex", flexDirection: "column" }}>
            <div style={{ flexShrink: 0, padding: "14px 20px 0", display: "flex", alignItems: "flex-start" }}>
              <div style={{ flex: 1, display: "flex" }}>
                {["Filters", "Sort"].map(tab => (
                  <button key={tab} onClick={() => setSheetTab(tab)} style={{
                    flex: 1, fontSize: 15, fontWeight: sheetTab === tab ? 600 : 500, color: sheetTab === tab ? C.head : C.inact,
                    background: "none", border: "none", cursor: "pointer", padding: "0 0 12px", fontFamily: "inherit",
                    borderBottom: sheetTab === tab ? "2px solid #FD014F" : "2px solid transparent", textAlign: "center",
                  }}>{tab}</button>
                ))}
              </div>
              <button onClick={() => setShowSheet(false)} aria-label="Close" style={{ width: 28, height: 28, borderRadius: "50%", background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 4 }}>
                <XIcon size={14} color={C.sub} />
              </button>
            </div>

            {sheetTab === "Sort" && (
              <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "8px 20px 24px" }}>
                {SORTS.map((opt, i) => (
                  <button
                    key={opt.key}
                    data-testid={`sort-${opt.key}`}
                    onClick={() => { setFilters(prev => ({ ...prev, sort: opt.key })); setShowSheet(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "12px 0",
                      background: "none", border: "none",
                      borderBottom: i < SORTS.length - 1 ? `1px solid ${C.div}` : "none",
                      fontSize: 14, color: filters.sort === opt.key ? "#FD014F" : C.head,
                      fontWeight: filters.sort === opt.key ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {opt.label} {filters.sort === opt.key && "✓"}
                  </button>
                ))}
              </div>
            )}

            {sheetTab === "Filters" && (
              <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Hotel category</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {[3, 4, 5].map(s => (
                    <FilterChip key={s} label={`${s} star`} on={filters.stars.has(s)} onClick={() => toggleFilter("stars", s)} />
                  ))}
                </div>

                <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Booking.com rating</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {[8, 8.5, 9].map(r => (
                    <FilterChip key={r} label={`${r}+`} on={filters.minRating === r} onClick={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === r ? 0 : r }))} />
                  ))}
                </div>

                <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Meals</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {mealOptions.map(m => (
                    <FilterChip key={m} label={m} on={filters.meals.has(m)} onClick={() => toggleFilter("meals", m)} />
                  ))}
                </div>

                <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Nearby landmarks</p>
                <SearchableCheckList
                  options={landmarkOptions}
                  selected={filters.landmarks}
                  onToggle={(l) => toggleFilter("landmarks", l)}
                  placeholder="Search landmarks"
                />

                <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Hotel facilities</p>
                <SearchableCheckList
                  options={filterAmenityOptions}
                  selected={filters.amenities}
                  onToggle={(a) => toggleFilter("amenities", a)}
                  placeholder="Search hotel facilities"
                />

                <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Room facilities</p>
                <SearchableCheckList
                  options={roomFacilityOptions}
                  selected={filters.roomFacilities}
                  onToggle={(f) => toggleFilter("roomFacilities", f)}
                  placeholder="Search room facilities"
                />
              </div>
            )}

            <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, padding: "10px 20px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={clearAllFilters}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 13.5, fontWeight: 600, color: activeFilterCount ? C.head : C.inact,
                  textDecoration: "underline", textUnderlineOffset: 3, flexShrink: 0,
                }}
              >Reset all</button>
              <button
                data-testid="apply-filters"
                onClick={() => setShowSheet(false)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
                  background: C.p600, color: "#fff", fontSize: 14.5, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Show {shown.length} {shown.length === 1 ? "hotel" : "hotels"}
              </button>
            </div>
          </div>
        </div>
      )}

      {gallery && <Gallery hotel={gallery.hotel} startAt={gallery.at} onClose={() => setGallery(null)} />}

      {/* ═══ Self-book confirmation ═══ */}
      {confirmSelf && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "flex-end" }}>
          <div onClick={() => setConfirmSelf(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ position: "relative", width: "100%", maxWidth: 420, margin: "0 auto", background: C.white, borderRadius: "20px 20px 0 0", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 8px" }}>Book this {stayInfo.city} stay yourself?</h3>
            <p style={{ fontSize: 13, color: C.sub, margin: "0 0 16px", lineHeight: "19px" }}>
              We'll remove this hotel from your package and its cost from your trip total. You can add a hotel back anytime.
            </p>
            <button onClick={() => { setConfirmSelf(false); bookStayMyself(); }} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
              Yes, I'll book it myself
            </button>
            <button onClick={() => setConfirmSelf(false)} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Keep this hotel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pink pill chip used across the filter sheet ───
// Exported so the Change day plan screen uses the same chip, not a copy of it.
export function FilterChip({ label, on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: on ? "1.5px solid #FD014F" : "1.5px solid #E9EAEB",
        borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit",
        background: on ? "#FFEBF1" : "none",
        fontSize: 12, fontWeight: 500, color: on ? "#FD014F" : "#181D27",
      }}
    >
      {label}
    </button>
  );
}

// ─── Searchable checkbox list: one option per row, 5 visible, rest behind "Show more" ───
// Exported for the same reason: one searchable checklist across the app.
export function SearchableCheckList({ options, selected, onToggle, placeholder }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const q = query.trim().toLowerCase();
  const matches = q ? options.filter(o => o.toLowerCase().includes(q)) : options;
  const visible = expanded ? matches : matches.slice(0, 5);
  const hiddenCount = matches.length - 5;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 36, borderRadius: 10, border: "1.5px solid #E9EAEB", marginBottom: 6 }}>
        <Search size={14} color="#A4A7AE" style={{ flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setExpanded(false); }}
          placeholder={placeholder}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#181D27", fontFamily: "inherit", background: "transparent", minWidth: 0 }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <XIcon size={13} color="#A4A7AE" />
          </button>
        )}
      </div>

      {visible.map(o => {
        const on = selected.has(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 2px", background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0,
              background: on ? "#FD014F" : "#fff", border: on ? "1.5px solid #FD014F" : "1.5px solid #D5D7DA",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {on && <Check size={12} color="#fff" strokeWidth={3} />}
            </span>
            <span style={{ fontSize: 13, color: "#181D27", fontWeight: on ? 600 : 400 }}>{o}</span>
          </button>
        );
      })}

      {matches.length === 0 && (
        <p style={{ fontSize: 12, color: "#A4A7AE", margin: "6px 2px" }}>No matches</p>
      )}

      {hiddenCount > 0 && !expanded && (
        <button onClick={() => setExpanded(true)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#FD014F", padding: "6px 2px" }}>
          Show {hiddenCount} more <ChevronDown size={14} />
        </button>
      )}
      {expanded && matches.length > 5 && (
        <button onClick={() => setExpanded(false)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#FD014F", padding: "6px 2px" }}>
          Show less <ChevronUp size={14} />
        </button>
      )}
    </div>
  );
}
