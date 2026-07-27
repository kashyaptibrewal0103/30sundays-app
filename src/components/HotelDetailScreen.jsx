import { useState } from "react";
import { ArrowLeft, Star, MapPin, Navigation, X as XIcon, ChevronLeft, ChevronRight, Bed, Maximize2, Bath, Eye, UtensilsCrossed, Bus, Clock } from "lucide-react";
import { C } from "../data";
import InclusionsSection from "./InclusionsSection";
import AddOnDetailList from "./AddOnDetailList";

const amenityIcons = {
  Breakfast: "🍳", Spa: "💆", "Swimming pool": "🏊", "Indoor Games": "🎮",
  Gym: "🏋️", "Airport Transfer": "🚐", "Free WiFi": "📶", Beachfront: "🏖️",
  Restaurant: "🍽️", Bar: "🍸", "Room Service": "🛎️", Concierge: "🔑",
  Laundry: "👔", Parking: "🅿️",
};

// The one hotel-detail screen used everywhere: the booking flow passes the
// stay summary, per-room price/select footer and the sticky replace bar; the
// wishlist passes `readOnly` so all of that (dates, availability, prices,
// booking) is dropped and it reads as pure hotel information.
export default function HotelDetailScreen({
  hotel, cityName, reviews, onBack,
  selectedRoomId = null,   // highlights a room (booking only)
  stay = null,             // JSX: dates / travellers summary card
  roomFooter = null,       // (room) => JSX rendered inside each room card
  afterRooms = null,       // JSX rendered right after the rooms section
  bottomBar = null,        // JSX: sticky bottom bar
  overlay = null,          // JSX: extra overlays (confirm popup)
  inclusions = null,       // special inclusions (honeymoon perks + value add-ons)
  addOns = null,           // purchased add-ons (array of strings) -> plain bullet list
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState("All");

  const allCategories = ["All", ...new Set(hotel.images.map((img) => img.category))];
  const filteredGalleryImages = galleryCategoryFilter === "All"
    ? hotel.images
    : hotel.images.filter((img) => img.category === galleryCategoryFilter);
  const galleryImages = hotel.images.slice(0, 4);
  const remainingCount = hotel.images.length - 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.white, position: "relative" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: bottomBar ? 80 : 24 }}>

        {/* ═══ Header ═══ */}
        <div style={{ background: "linear-gradient(180deg, #FFEBF1 0%, #FFFFFF 100%)", padding: "10px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <button onClick={onBack} aria-label="Back" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flexShrink: 0, background: "none", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={20} color={C.head} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "#181E4C", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hotel.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {Array.from({ length: hotel.stars }).map((_, s) => (
                    <Star key={s} size={14} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />
                  ))}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: "#003580", color: "#fff", fontSize: 9, fontWeight: 700 }}>B</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.head }}>{hotel.bookingScore} Rated</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Photo gallery ═══ */}
        <div style={{ padding: "0 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gridTemplateRows: "1fr 1fr", gap: 3, height: 220, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ gridRow: "1 / 3", cursor: "pointer" }} onClick={() => { setGalleryIdx(0); setGalleryOpen(true); }}>
              <img src={galleryImages[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ cursor: "pointer" }} onClick={() => { setGalleryIdx(1); setGalleryOpen(true); }}>
              <img src={galleryImages[1].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => { setGalleryIdx(2); setGalleryOpen(true); }}>
              <img src={galleryImages[2].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {remainingCount > 0 && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>+{remainingCount}</span>
                  <span style={{ fontSize: 11, color: "#fff" }}>Photos</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Stay summary (booking only) ═══ */}
        {stay}

        {/* ═══ Property Highlights ═══ */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#181E4C", padding: "0 16px", margin: "0 0 12px" }}>Property Highlights</p>
          <div className="hs" style={{ gap: 16, paddingLeft: 16, paddingRight: 16 }}>
            {hotel.amenities.map((amenity, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 64, flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  {amenityIcons[amenity] || "✨"}
                </div>
                <span style={{ fontSize: 11, color: C.sub, textAlign: "center", lineHeight: 1.2 }}>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Special inclusions (honeymoon perks + value add-ons) ═══ */}
        <InclusionsSection inclusions={inclusions} />

        {/* ═══ Add-ons included (collapsed; expand each for a short description) ═══ */}
        {addOns?.length > 0 && (
          <div style={{ margin: "24px 16px 0" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#181E4C", margin: "0 0 4px" }}>{addOns.length} add-ons included</h3>
            <AddOnDetailList items={addOns} />
          </div>
        )}

        {/* ═══ Location ═══ */}
        <div style={{ margin: "24px 16px 0", borderRadius: 16, border: `1px solid ${C.div}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address}`)}`} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
            <div style={{ position: "relative", height: 120, background: "url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&q=80&auto=format&fit=crop) center/cover no-repeat, #E8ECEF" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -100%)", width: 32, height: 32, borderRadius: "50%", background: "#FD014F", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(253,1,79,0.45), 0 0 0 4px rgba(253,1,79,0.18)" }}>
                <MapPin size={16} color="#fff" fill="#fff" />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#181E4C", margin: 0 }}>{cityName}</p>
                <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{hotel.address}</p>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#FD014F", whiteSpace: "nowrap", flexShrink: 0 }}>
                <Navigation size={12} color="#FD014F" /> Open in Maps
              </span>
            </div>
          </a>
        </div>

        {/* ═══ Good to know: transfers, check-in/out ═══ */}
        {hotel.sharedTransfers !== undefined && (
          <div style={{ marginTop: 24, padding: "0 16px" }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#181E4C", margin: "0 0 12px" }}>Good to know</p>
            <div style={{ borderRadius: 14, border: `1px solid ${C.div}` }}>

              {/* Transfers */}
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.div}` }}>
                <Bus size={17} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>
                    {hotel.sharedTransfers ? "Shared or private transfers" : "Private transfers only"}
                  </span>
                  <p style={{ fontSize: 11.5, color: C.sub, margin: "2px 0 0" }}>
                    {hotel.sharedTransfers
                      ? "This hotel's area is served by shared coaches, so you can pick either"
                      : "This hotel's area has no shared coaches, so pickups are by private car"}
                  </p>
                </div>
              </div>

              {/* Check-in / checkout */}
              <div style={{ display: "flex", gap: 10, padding: "12px 14px" }}>
                <Clock size={17} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>
                    Check-in {hotel.checkInTime} · Checkout {hotel.checkOutTime}
                  </span>
                  {(hotel.earlyCheckIn || hotel.lateCheckOut) && (
                    <p style={{ fontSize: 11.5, fontWeight: 600, color: C.sText || "#027A48", margin: "2px 0 0" }}>
                      {hotel.earlyCheckIn && hotel.lateCheckOut
                        ? "Early check-in and late checkout included"
                        : hotel.earlyCheckIn ? "Early check-in included" : "Late checkout included"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Rooms ═══ */}
        <div style={{ marginTop: 24, padding: "0 16px" }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#181E4C", margin: "0 0 14px" }}>{roomFooter ? "Select your room" : "Rooms"}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {hotel.rooms.map((room) => {
              const isSelected = selectedRoomId && room.id === selectedRoomId;
              return (
                <div key={room.id} style={{ borderRadius: 14, overflow: "hidden", border: isSelected ? "2px solid #FD014F" : `1px solid ${C.div}`, background: isSelected ? "#FFF5F8" : C.white, padding: isSelected ? 15 : 16 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#181E4C", margin: "0 0 6px" }}>{room.name}</p>
                  {(room.mealPlan || hotel.freeCancellation !== undefined) && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                      {room.mealPlan ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <UtensilsCrossed size={12} color={room.mealPlan === "Only Room" ? C.inact : "#4EAC7E"} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: room.mealPlan === "Only Room" ? C.inact : "#4EAC7E" }}>{room.mealPlan}</span>
                        </div>
                      ) : <span />}
                      {hotel.freeCancellation !== undefined && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: hotel.freeCancellation ? (C.sText || "#027A48") : "#FD014F", flexShrink: 0 }}>
                          {hotel.freeCancellation ? "Free cancellation" : "Non-refundable"}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Bed size={13} color={C.sub} />
                      <span style={{ fontSize: 12, color: C.sub }}>{room.bedType}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Maximize2 size={13} color={C.sub} />
                      <span style={{ fontSize: 12, color: C.sub }}>Size: {room.size} m²</span>
                    </div>
                    {(room.amenities || []).map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {a === "Jacuzzi" && <Bath size={13} color={C.sub} />}
                        {a === "Sea View" && <Eye size={13} color={C.sub} />}
                        {!["Jacuzzi", "Sea View"].includes(a) && <span style={{ fontSize: 11, color: C.sub }}>•</span>}
                        <span style={{ fontSize: 12, color: C.sub }}>{a}</span>
                      </div>
                    ))}
                  </div>
                  {room.images?.length > 0 && (
                    <div className="hs" style={{ gap: 6, marginBottom: roomFooter ? 12 : 0 }}>
                      {room.images.map((img, i) => (
                        <div key={i} style={{ width: 110, height: 80, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {roomFooter && roomFooter(room)}
                </div>
              );
            })}
          </div>
        </div>

        {afterRooms}

        {/* ═══ Guest Reviews ═══ */}
        {reviews && (
          <div style={{ marginTop: 24, padding: "0 16px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#181E4C", margin: 0 }}>Guest Reviews</p>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 3, background: "#003580", color: "#fff", fontSize: 10, fontWeight: 700 }}>B</span>
              <span style={{ fontSize: 12, color: C.sub }}>Booking.com</span>
            </div>
            <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "#003580", color: "#fff", fontSize: 16, fontWeight: 700 }}>{hotel.bookingScore}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#181E4C" }}>Very Good</span>
                <span style={{ fontSize: 12, color: C.sub }}>({hotel.reviewCount})</span>
              </div>
              {[
                { label: "Cleanliness", score: reviews.cleanliness },
                { label: "Comfort", score: reviews.comfort },
                { label: "Facilities", score: reviews.facilities },
              ].map(({ label, score }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "#FD014F" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{score}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: C.bg }}>
                    <div style={{ height: "100%", borderRadius: 3, background: "#4EAC7E", width: `${(score / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {bottomBar}
      {overlay}

      {/* ═══ Fullscreen gallery ═══ */}
      {galleryOpen && (
        <div style={{ position: "absolute", inset: 0, background: "#000", zIndex: 100, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
            <span style={{ fontSize: 14, color: "#fff" }}>{galleryIdx + 1} / {filteredGalleryImages.length}</span>
            <button onClick={() => setGalleryOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <XIcon size={22} color="#fff" />
            </button>
          </div>
          <div className="hs" style={{ gap: 8, padding: "0 16px 12px" }}>
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => { setGalleryCategoryFilter(cat); setGalleryIdx(0); }} style={{ flexShrink: 0, border: "none", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", background: galleryCategoryFilter === cat ? "#FD014F" : "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 500, color: "#fff" }}>{cat}</button>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 0 }}>
            <img src={filteredGalleryImages[galleryIdx]?.url} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            {galleryIdx > 0 && (
              <button onClick={() => setGalleryIdx(galleryIdx - 1)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 20, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronLeft size={20} color="#fff" />
              </button>
            )}
            {galleryIdx < filteredGalleryImages.length - 1 && (
              <button onClick={() => setGalleryIdx(galleryIdx + 1)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 20, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronRight size={20} color="#fff" />
              </button>
            )}
          </div>
          <div className="hs" style={{ gap: 6, padding: "12px 16px 16px" }}>
            {filteredGalleryImages.map((img, i) => (
              <div key={i} onClick={() => setGalleryIdx(i)} style={{ width: 56, height: 42, borderRadius: 6, overflow: "hidden", flexShrink: 0, cursor: "pointer", border: i === galleryIdx ? "2px solid #FD014F" : "2px solid transparent", opacity: i === galleryIdx ? 1 : 0.6 }}>
                <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
