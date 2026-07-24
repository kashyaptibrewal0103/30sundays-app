import { useState, useMemo } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, SlidersHorizontal, X as XIcon, ChevronDown, ChevronUp, Search, Check, Home, MoreVertical } from "lucide-react";
import { C, allItineraries } from "../data";
import { generateHotelsForCity, getStayInfo, formatHotelPrice } from "../data/hotelData";
import { useDeals } from "../data/deals";

// ─── Quick filter chips (floating bar) ───
const quickFilters = [
  "5 star", "Free cancellation", "9+ rated", "Swimming pool", "Breakfast included",
];

// ─── Sort options ───
const sortOptions = [
  { label: "Price: Low to High", fn: (a, b) => a.pricePerNight - b.pricePerNight },
  { label: "Price: High to Low", fn: (a, b) => b.pricePerNight - a.pricePerNight },
  { label: "Rating: High to Low", fn: (a, b) => b.bookingScore - a.bookingScore },
  { label: "Distance: Nearest", fn: (a, b) => a.distanceFromCenter - b.distanceFromCenter },
];

export default function HotelListing({ selectedHotels, setSelectedHotels }) {
  const { itineraryId, stayIndex } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const currentHotelId = params.get("current");
  const dealId = params.get("dealId");
  const versionId = params.get("versionId");
  const dealQS = dealId && versionId ? `&dealId=${dealId}&versionId=${versionId}` : "";
  const backToItinerary = `/itinerary/${itineraryId}${dealId && versionId ? `?dealId=${dealId}&versionId=${versionId}` : ""}`;

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

  const dealsCtx = useDeals();
  const itinerary = allItineraries.find(i => i.id === Number(itineraryId)) || dealsCtx.findCustomItinerary(Number(itineraryId), versionId);
  const stayInfo = itinerary ? getStayInfo(itinerary, Number(stayIndex)) : null;

  // Filter/sort state
  const [activeQuickFilters, setActiveQuickFilters] = useState(new Set());
  const [showCurrent, setShowCurrent] = useState(false); // expandable "current hotel" bar
  const [menuOpen, setMenuOpen] = useState(false); // header kebab menu
  const [confirmSelf, setConfirmSelf] = useState(false); // self-book confirm modal
  const [showSheet, setShowSheet] = useState(false);
  const [sheetTab, setSheetTab] = useState("Filters");
  const [sortIdx, setSortIdx] = useState(0);
  const [filters, setFilters] = useState({
    budget: null, // [lo, hi] per night; null = untouched
    stars: new Set(),
    minRating: 0,
    meals: new Set(),
    landmarks: new Set(),
    amenities: new Set(),
    roomFacilities: new Set(),
    freeCancellation: false,
  });

  if (!itinerary || !stayInfo) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Stay not found</div>;
  }

  const allHotels = generateHotelsForCity(stayInfo.city, itinerary.dest, stayInfo.checkIn, stayInfo.checkOut, stayInfo.nights);

  // Get current hotel price for delta calculation
  const currentHotel = allHotels.find(h => h.id === currentHotelId);
  const currentPrice = currentHotel ? currentHotel.pricePerNight : allHotels[0]?.pricePerNight || 0;

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...allHotels];

    // Quick filters
    if (activeQuickFilters.size > 0) {
      result = result.filter(h => {
        for (const f of activeQuickFilters) {
          if (f === "5 star" && h.stars !== 5) return false;
          if (f === "9+ rated" && h.bookingScore < 9) return false;
          if (f === "Free cancellation" && !h.freeCancellation) return false;
          if (f === "Swimming pool" && !h.amenities.includes("Swimming pool")) return false;
          if (f === "Breakfast included" && !h.amenities.includes("Breakfast")) return false;
        }
        return true;
      });
    }

    // Budget filter (per-night price range)
    if (filters.budget) {
      result = result.filter(h => h.pricePerNight >= filters.budget[0] && h.pricePerNight <= filters.budget[1]);
    }

    // Star filter
    if (filters.stars.size > 0) {
      result = result.filter(h => filters.stars.has(h.stars));
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter(h => h.bookingScore >= filters.minRating);
    }

    // Meals filter (any room offers a selected plan)
    if (filters.meals.size > 0) {
      result = result.filter(h => h.rooms.some(r => filters.meals.has(r.mealPlan)));
    }

    // Nearby landmark filter
    if (filters.landmarks.size > 0) {
      result = result.filter(h => filters.landmarks.has(h.neighbourhood));
    }

    // Hotel facilities filter
    if (filters.amenities.size > 0) {
      result = result.filter(h => {
        for (const a of filters.amenities) {
          if (!h.amenities.includes(a)) return false;
        }
        return true;
      });
    }

    // Room facilities filter (every selected facility offered by some room)
    if (filters.roomFacilities.size > 0) {
      result = result.filter(h => [...filters.roomFacilities].every(f => h.rooms.some(r => r.amenities.includes(f))));
    }

    // Free cancellation
    if (filters.freeCancellation) {
      result = result.filter(h => h.freeCancellation);
    }

    // Sort, always put current hotel first
    const sortFn = sortOptions[sortIdx].fn;
    result.sort((a, b) => {
      if (a.id === currentHotelId) return -1;
      if (b.id === currentHotelId) return 1;
      return sortFn(a, b);
    });

    return result;
  }, [allHotels, activeQuickFilters, filters, sortIdx, currentHotelId]);

  const toggleQuickFilter = (f) => {
    setActiveQuickFilters(prev => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const toggleFilter = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: new Set(prev[key]) };
      next[key].has(value) ? next[key].delete(value) : next[key].add(value);
      return next;
    });
  };

  const filterAmenityOptions = ["Breakfast", "Spa", "Swimming pool", "Gym", "Airport Transfer", "Free WiFi", "Beachfront", "Restaurant", "Bar", "Parking"];
  const roomFacilityOptions = ["Jacuzzi", "Balcony", "Sea View", "Private Pool", "Minibar", "Butler Service"];
  const mealOptions = ["Only Room", "Breakfast included", "Breakfast + Dinner", "All Inclusive"];
  const landmarkOptions = [...new Set(allHotels.map(h => h.neighbourhood))];

  // Budget slider bounds from the city's actual prices, rounded to ₹500
  const priceBounds = [
    Math.floor(Math.min(...allHotels.map(h => h.pricePerNight)) / 500) * 500,
    Math.ceil(Math.max(...allHotels.map(h => h.pricePerNight)) / 500) * 500,
  ];
  const budgetValue = filters.budget || priceBounds;

  // Count of sheet filters in effect (drives the badge on the sliders button)
  const activeFilterCount =
    (filters.budget ? 1 : 0) + filters.stars.size + (filters.minRating > 0 ? 1 : 0) +
    filters.meals.size + filters.landmarks.size + filters.amenities.size +
    filters.roomFacilities.size + (filters.freeCancellation ? 1 : 0);

  const clearAllFilters = () => setFilters({
    budget: null, stars: new Set(), minRating: 0, meals: new Set(),
    landmarks: new Set(), amenities: new Set(), roomFacilities: new Set(), freeCancellation: false,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.white, position: "relative" }}>
      {/* ═══ Full scrollable content ═══ */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>

        {/* ═══ Header (scrolls with content) ═══ */}
        <div style={{ background: "linear-gradient(180deg, #FFEBF1 0%, #FFFFFF 100%)", padding: "10px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* History-aware back: returns to wherever the user came from
                (hotel detail via its Change hotel ingress, or the itinerary) */}
            <button onClick={() => navigate(-1)} aria-label="Back" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <ArrowLeft size={20} color={C.head} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>{stayInfo.city} hotels</h1>
                <span style={{ fontSize: 13, color: C.sub }}>({filtered.length})</span>
              </div>
              <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>
                {stayInfo.checkIn} – {stayInfo.checkOut} &bull; 1 Room &bull; 👤 2
              </p>
            </div>
            {/* Overflow menu — secondary action (book this stay yourself) */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={() => setMenuOpen(o => !o)} aria-label="More options" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
                <MoreVertical size={20} color={C.head} />
              </button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <div style={{ position: "absolute", top: 42, right: 0, zIndex: 41, width: 220, background: C.white, borderRadius: 12, border: `1px solid ${C.div}`, boxShadow: "0 8px 28px rgba(0,0,0,0.16)", overflow: "hidden" }}>
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

        {/* ═══ Current hotel - expandable, so the user knows what they're changing ═══ */}
        {currentHotel && (
          <div style={{ margin: "0 16px 4px", border: `1px solid ${C.div}`, borderRadius: 12, overflow: "hidden", background: C.white }}>
            <button
              onClick={() => setShowCurrent(s => !s)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: C.sub, flexShrink: 0 }}>Changing</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.head, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentHotel.name}
              </span>
              {showCurrent ? <ChevronUp size={16} color={C.sub} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color={C.sub} style={{ flexShrink: 0 }} />}
            </button>

            {showCurrent && (
              <div style={{ display: "flex", gap: 12, padding: "0 12px 12px" }}>
                <div style={{ width: 76, height: 76, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  <img src={currentHotel.images[0].url} alt={currentHotel.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#181E4C", margin: "0 0 3px", lineHeight: 1.3 }}>{currentHotel.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Star size={13} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#4EAC7E" }}>{currentHotel.stars} star hotel</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: "#003580", color: "#fff", fontSize: 12, fontWeight: 700 }}>B</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.head }}>{currentHotel.bookingScore} Rated</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: C.sub, margin: "0 0 2px" }}>{currentHotel.roomType} · {currentHotel.bedSummary}</p>
                  <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>{currentHotel.rooms?.[0]?.mealPlan || "Breakfast included"}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Hotel List ═══ */}
        <div style={{ padding: "16px 16px 0" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.head }}>No hotels match your filters</p>
              <p style={{ fontSize: 13, color: C.sub }}>Try adjusting your filters to see more options</p>
            </div>
          )}
          {filtered.map((hotel, i) => {
            const isCurrent = hotel.id === currentHotelId;
            const priceDelta = hotel.pricePerNight - currentPrice;

            return (
              <Link
                key={hotel.id}
                to={`/hotel-detail/${itineraryId}/${stayIndex}/${encodeURIComponent(hotel.id)}?current=${encodeURIComponent(currentHotelId || "")}${dealQS}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div style={isCurrent ? {
                  display: "flex", gap: 14, padding: "12px", margin: "4px 0",
                  border: `1.5px solid ${C.sBorder || "#C0E5D5"}`, background: C.sBg || "#ECFDF3", borderRadius: 12,
                } : {
                  display: "flex", gap: 14, padding: "16px 0",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${C.div}` : "none",
                }}>
                  {/* Hotel Image */}
                  <div style={{ width: 120, height: 100, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                    <img src={hotel.images[0].url} alt={hotel.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>

                  {/* Hotel Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isCurrent && (
                      <span style={{
                        display: "inline-block", fontSize: 11, fontWeight: 600, color: C.sText || "#027A48",
                        background: "#fff", border: `1px solid ${C.sBorder || "#C0E5D5"}`, borderRadius: 20, padding: "2px 8px", marginBottom: 4,
                      }}>
                        Currently Selected ✓
                      </span>
                    )}

                    <p style={{ fontSize: 14, fontWeight: 700, color: "#181E4C", margin: "0 0 3px", lineHeight: 1.3,
                      overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {hotel.name}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={14} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: "#4EAC7E" }}>{hotel.stars} star hotel</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 16, height: 16, borderRadius: 3, background: "#003580", color: "#fff",
                          fontSize: 11, fontWeight: 700,
                        }}>B</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.head }}>{hotel.bookingScore} Rated</span>
                      </div>
                    </div>

                    <p style={{ fontSize: 12, color: C.sub, margin: "0 0 4px" }}>{hotel.roomType} : {hotel.bedSummary}</p>

                    {/* Price delta */}
                    <p style={{ fontSize: 13, margin: "0 0 4px" }}>
                      {isCurrent ? (
                        <span style={{ fontWeight: 600, color: C.sub }}>Current selection</span>
                      ) : priceDelta === 0 ? (
                        <span style={{ fontWeight: 600, color: C.sub }}>No price change</span>
                      ) : (
                        <>
                          <span style={{ fontWeight: 700, color: C.head }}>
                            {priceDelta > 0 ? "+" : "−"} ₹ {formatHotelPrice(Math.abs(priceDelta) * stayInfo.nights)}
                          </span>
                          <span style={{ fontSize: 11, color: C.sub }}> on your trip</span>
                        </>
                      )}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={10} color={C.inact} />
                      <span style={{ fontSize: 11, color: C.inact }}>{hotel.neighbourhood}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══ Floating Filter Bar at Bottom (same pattern as trip Listing) ═══ */}
      <div style={{
        position: "absolute", bottom: 12, left: 12, right: 12, zIndex: 10,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 16, padding: "8px 10px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {/* Scrollable quick chips */}
        <div className="hs" style={{ flex: 1, gap: 6, paddingBottom: 0, minWidth: 0 }}>
          {quickFilters.map(f => (
            <button
              key={f}
              onClick={() => toggleQuickFilter(f)}
              style={{
                flexShrink: 0, border: activeQuickFilters.has(f) ? "1.5px solid #FD014F" : `1.5px solid ${C.div}`,
                borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit",
                background: activeQuickFilters.has(f) ? "#FFEBF1" : C.white,
                fontSize: 12, fontWeight: 500, color: activeQuickFilters.has(f) ? "#FD014F" : C.head,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Fixed separator + filter icon */}
        <div style={{ width: 1, height: 24, background: C.div, flexShrink: 0 }} />
        <button onClick={() => { setSheetTab("Filters"); setShowSheet(true); }} style={{
          position: "relative", width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: activeFilterCount > 0 ? "#FFEBF1" : "transparent", border: activeFilterCount > 0 ? "1.5px solid #FD014F" : `1px solid ${C.div}`,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <SlidersHorizontal size={14} color={activeFilterCount > 0 ? "#FD014F" : C.sub} />
          {activeFilterCount > 0 && (
            <div style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: "#FD014F", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilterCount}</div>
          )}
        </button>
      </div>

      {/* ═══ Filters / Sort Bottom Sheet (tabbed, same pattern as trip Listing) ═══ */}
      {showSheet && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={() => setShowSheet(false)} />
          <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", zIndex: 1, height: "70%", display: "flex", flexDirection: "column" }}>
            {/* Sticky header with 50-50 tabs */}
            <div style={{ flexShrink: 0, padding: "14px 20px 0", display: "flex", alignItems: "flex-start" }}>
              <div style={{ flex: 1, display: "flex" }}>
                {["Filters", "Sort"].map(tab => (
                  <button key={tab} onClick={() => setSheetTab(tab)} style={{
                    flex: 1, fontSize: 15, fontWeight: sheetTab === tab ? 600 : 500, color: sheetTab === tab ? C.head : C.inact,
                    background: "none", border: "none", cursor: "pointer", padding: "0 0 12px", fontFamily: "inherit",
                    borderBottom: sheetTab === tab ? "2px solid #FD014F" : "2px solid transparent",
                    textAlign: "center",
                  }}>{tab}</button>
                ))}
              </div>
              <button onClick={() => setShowSheet(false)} style={{ width: 28, height: 28, borderRadius: "50%", background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 4 }}>
                <XIcon size={14} color={C.sub} />
              </button>
            </div>

            {/* Sort tab */}
            {sheetTab === "Sort" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 24px" }} className="hide-scrollbar">
              {sortOptions.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => { setSortIdx(i); setShowSheet(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "12px 0",
                    background: "none", border: "none", borderBottom: i < sortOptions.length - 1 ? `1px solid ${C.div}` : "none",
                    fontSize: 14, color: i === sortIdx ? "#FD014F" : C.head, fontWeight: i === sortIdx ? 600 : 400,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {opt.label} {i === sortIdx && "✓"}
                </button>
              ))}
            </div>
            )}

            {/* Filters tab */}
            {sheetTab === "Filters" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }} className="hide-scrollbar">

            {/* Budget */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 4px" }}>
              Budget <span style={{ fontSize: 11, fontWeight: 400, color: C.sub }}>per night</span>
            </p>
            <DualRange
              min={priceBounds[0]}
              max={priceBounds[1]}
              step={500}
              value={budgetValue}
              onChange={(v) => setFilters(prev => ({ ...prev, budget: v }))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.head }}>₹{formatHotelPrice(budgetValue[0])}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.head }}>₹{formatHotelPrice(budgetValue[1])}</span>
            </div>

            {/* Star category */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Star Category</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {[3, 4, 5].map(s => (
                <FilterChip key={s} label={`${s} ★`} on={filters.stars.has(s)} onClick={() => toggleFilter("stars", s)} />
              ))}
            </div>

            {/* Booking.com rating */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Booking.com Rating</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {[8, 8.5, 9].map(r => (
                <FilterChip key={r} label={`${r}+`} on={filters.minRating === r} onClick={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === r ? 0 : r }))} />
              ))}
            </div>

            {/* Meals */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Meals</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {mealOptions.map(m => (
                <FilterChip key={m} label={m} on={filters.meals.has(m)} onClick={() => toggleFilter("meals", m)} />
              ))}
            </div>

            {/* Nearby landmarks */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Nearby Landmarks</p>
            <SearchableCheckList
              options={landmarkOptions}
              selected={filters.landmarks}
              onToggle={(l) => toggleFilter("landmarks", l)}
              placeholder="Search landmarks"
            />

            {/* Hotel facilities */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Hotel Facilities</p>
            <SearchableCheckList
              options={filterAmenityOptions}
              selected={filters.amenities}
              onToggle={(a) => toggleFilter("amenities", a)}
              placeholder="Search hotel facilities"
            />

            {/* Room facilities */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Room Facilities</p>
            <SearchableCheckList
              options={roomFacilityOptions}
              selected={filters.roomFacilities}
              onToggle={(f) => toggleFilter("roomFacilities", f)}
              placeholder="Search room facilities"
            />

            {/* Free cancellation */}
            <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>Cancellation</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <FilterChip label="Free cancellation" on={filters.freeCancellation} onClick={() => setFilters(prev => ({ ...prev, freeCancellation: !prev.freeCancellation }))} />
            </div>

            {/* Apply */}
            <button
              onClick={() => setShowSheet(false)}
              style={{
                width: "100%", height: 48, borderRadius: 9999, border: "none",
                background: "#FD014F", color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", marginTop: 8,
              }}
            >
              Apply Filters
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{
                  width: "100%", padding: "12px 0", background: "none", border: "none",
                  fontSize: 13, fontWeight: 600, color: C.sub, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Clear all filters
              </button>
            )}
            </div>
            )}
          </div>
        </div>
      )}

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
function FilterChip({ label, on, onClick }) {
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
function SearchableCheckList({ options, selected, onToggle, placeholder }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const q = query.trim().toLowerCase();
  const matches = q ? options.filter(o => o.toLowerCase().includes(q)) : options;
  const visible = expanded ? matches : matches.slice(0, 5);
  const hiddenCount = matches.length - 5;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Search box */}
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

      {/* Rows */}
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

      {/* Show more / less */}
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

// ─── Dual-thumb budget slider (thumb styles in index.css under .dual-range) ───
function DualRange({ min, max, step, value, onChange }) {
  const [lo, hi] = value;
  const pct = (v) => ((v - min) / (max - min || 1)) * 100;
  return (
    <div className="dual-range" style={{ position: "relative", height: 28, margin: "6px 0 2px" }}>
      <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 4, borderRadius: 4, background: "#E9EAEB" }} />
      <div style={{ position: "absolute", top: 12, left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%`, height: 4, borderRadius: 4, background: "#FD014F" }} />
      <input
        type="range" min={min} max={max} step={step} value={lo}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        aria-label="Minimum budget"
      />
      <input
        type="range" min={min} max={max} step={step} value={hi}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        aria-label="Maximum budget"
      />
    </div>
  );
}
