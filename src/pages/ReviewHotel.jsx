import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowDown, Check } from "lucide-react";
import { C, allItineraries } from "../data";
import { stayHotels, getStayInfo, formatHotelPrice } from "../data/hotelData";

export default function ReviewHotel({ selectedHotels, setSelectedHotels }) {
  const { itineraryId, stayIndex } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const newHotelId = params.get("new");
  const newRoomId = params.get("room");
  const currentHotelId = params.get("current");

  const itinerary = allItineraries.find(i => i.id === Number(itineraryId));
  const stayInfo = itinerary ? getStayInfo(itinerary, Number(stayIndex)) : null;

  const hotels = itinerary && stayInfo
    ? stayHotels(itinerary, Number(stayIndex))
    : [];

  const newHotel = hotels.find(h => h.id === decodeURIComponent(newHotelId));
  const currentHotel = currentHotelId ? hotels.find(h => h.id === decodeURIComponent(currentHotelId)) : hotels[0];
  const newRoom = newHotel?.rooms?.find(r => r.id === decodeURIComponent(newRoomId));
  const currentRoom = currentHotel?.rooms?.[0];

  if (!itinerary || !stayInfo || !newHotel || !newRoom) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Hotel not found</div>;
  }

  const nights = stayInfo.nights;
  const newTotal = newRoom.pricePerNight * nights;
  const currentTotal = currentRoom ? currentRoom.pricePerNight * nights : 0;
  const priceDelta = newTotal - currentTotal;
  const isSame = newHotel.id === currentHotel?.id && newRoom.id === currentRoom?.id;

  const handleConfirm = () => {
    setSelectedHotels(prev => {
      const updated = { ...prev };
      if (!updated[itineraryId]) {
        updated[itineraryId] = { stays: [] };
      }
      const staysArr = [...(updated[itineraryId].stays || [])];
      staysArr[Number(stayIndex)] = {
        hotelId: newHotel.id,
        hotelName: newHotel.name,
        roomId: newRoom.id,
        roomName: newRoom.name,
        pricePerNight: newRoom.pricePerNight,
        totalPrice: newTotal,
        taxTotal: newRoom.taxPerNight * nights,
        image: newHotel.images[0].url,
        stars: newHotel.stars,
        bookingScore: newHotel.bookingScore,
        neighbourhood: newHotel.neighbourhood,
      };
      updated[itineraryId] = { stays: staysArr };
      return updated;
    });
    navigate(`/itinerary/${itineraryId}`);
  };

  const HotelCard = ({ hotel, room, label, highlight }) => (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      border: highlight ? "2px solid #FD014F" : `1px solid ${C.div}`,
      background: C.white,
    }}>
      <div style={{ display: "flex", gap: 12, padding: 14 }}>
        <div style={{ width: 80, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
          <img src={hotel.images[0].url} alt={hotel.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.sub, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#181E4C", margin: "0 0 3px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hotel.name}</p>
          <p style={{ fontSize: 12, color: C.sub, margin: "0 0 2px" }}>{room.name}</p>
          <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>
            {stayInfo.checkIn} – {stayInfo.checkOut}, {nights} night{nights > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
      {/* ═══ Header ═══ */}
      <div style={{ background: "linear-gradient(135deg, #FFE4E8 0%, #FFF5F0 100%)", padding: "10px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            to={`/hotel-detail/${itineraryId}/${stayIndex}/${encodeURIComponent(newHotelId)}?current=${encodeURIComponent(currentHotelId || "")}`}
            style={{ width: 34, height: 34, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <ArrowLeft size={18} color={C.head} />
          </Link>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>Review Changes</h1>
            <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>
              {stayInfo.city} &bull; {stayInfo.checkIn} – {stayInfo.checkOut}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Content ═══ */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {isSame ? (
          <div style={{
            borderRadius: 14, background: C.white, padding: 20, textAlign: "center",
            border: `1px solid ${C.div}`,
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.head, margin: "0 0 6px" }}>No changes made to your hotel</p>
            <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>You've selected the same hotel and room type</p>
          </div>
        ) : (
          <>
            {/* Current hotel */}
            {currentHotel && currentRoom && (
              <HotelCard hotel={currentHotel} room={currentRoom} label="Current Hotel" />
            )}

            {/* Arrow divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 0", gap: 6 }}>
              <ArrowDown size={16} color={C.sub} />
              <span style={{ fontSize: 12, color: C.sub, fontWeight: 500 }}>Changing to</span>
            </div>

            {/* New hotel */}
            <HotelCard hotel={newHotel} room={newRoom} label="New Hotel" highlight />

            {/* Price difference */}
            <div style={{
              marginTop: 16, borderRadius: 14, background: C.white, padding: 16,
              border: `1px solid ${C.div}`,
            }}>
              <p style={{ fontSize: 13, color: C.sub, margin: "0 0 4px" }}>Price difference for this stay</p>
              <p style={{
                fontSize: 18, fontWeight: 700, margin: "0 0 4px",
                color: priceDelta < 0 ? "#4EAC7E" : priceDelta > 0 ? "#FD014F" : C.sub,
              }}>
                {priceDelta === 0
                  ? "No change in price"
                  : priceDelta > 0
                    ? `You pay ₹${formatHotelPrice(priceDelta)} more`
                    : `You save ₹${formatHotelPrice(Math.abs(priceDelta))} on this stay`
                }
              </p>
              <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>
                (₹{formatHotelPrice(newRoom.pricePerNight)}/night × {nights} night{nights > 1 ? "s" : ""})
              </p>
            </div>
          </>
        )}
      </div>

      {/* ═══ Actions ═══ */}
      <div style={{ padding: "12px 16px 20px", background: C.white, borderTop: `1px solid ${C.div}` }}>
        <button
          onClick={handleConfirm}
          style={{
            width: "100%", height: 52, borderRadius: 9999, border: "none",
            background: "#FD014F", color: "#fff", fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", marginBottom: 10,
          }}
        >
          {isSame ? "Go Back" : "Confirm Change"}
        </button>
        <Link
          to={`/hotels/${itineraryId}/${stayIndex}?current=${encodeURIComponent(currentHotelId || "")}`}
          style={{
            display: "block", textAlign: "center", fontSize: 14, fontWeight: 600,
            color: "#FD014F", textDecoration: "none", padding: "6px 0",
          }}
        >
          Go back and explore
        </Link>
      </div>
    </div>
  );
}
