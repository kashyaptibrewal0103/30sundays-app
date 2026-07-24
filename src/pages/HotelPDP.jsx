import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Star, ChevronUp, ChevronDown, UtensilsCrossed, ArrowLeftRight } from "lucide-react";
import { C, allItineraries } from "../data";
import { generateHotelsForCity, getStayInfo, formatHotelPrice, getHotelReviews } from "../data/hotelData";
import { getMauritiusHotel } from "../data/mauritiusData";
import { useDeals, computePrice } from "../data/deals";
import HotelDetailScreen from "../components/HotelDetailScreen";

export default function HotelPDP() {
  const { itineraryId, stayIndex, hotelId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const currentHotelId = params.get("current");
  const dealId = params.get("dealId");
  const versionId = params.get("versionId");
  const dealsCtx = useDeals();
  const [showCurrentDetails, setShowCurrentDetails] = useState(false); // expand current-hotel in the bar
  const [confirmReplace, setConfirmReplace] = useState(false); // warning popup

  const itinerary = allItineraries.find(i => i.id === Number(itineraryId)) || dealsCtx.findCustomItinerary(Number(itineraryId), versionId);
  const stayInfo = itinerary ? getStayInfo(itinerary, Number(stayIndex)) : null;

  const hotels = itinerary && stayInfo
    ? generateHotelsForCity(stayInfo.city, itinerary.dest, stayInfo.checkIn, stayInfo.checkOut, stayInfo.nights)
    : [];
  const hotel = hotels.find(h => h.id === decodeURIComponent(hotelId));

  const isCurrentHotel = hotel?.id === currentHotelId;

  const currentHotel = currentHotelId ? hotels.find(h => h.id === currentHotelId) : null;
  const currentRoomPrice = currentHotel ? currentHotel.rooms[0].pricePerNight : 0;

  const [selectedRoomId, setSelectedRoomId] = useState(() => {
    if (isCurrentHotel && hotel?.rooms?.length) return hotel.rooms[0].id;
    return hotel?.rooms?.[0]?.id || null;
  });

  if (!itinerary || !stayInfo || !hotel) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Hotel not found</div>;
  }

  const reviews = getHotelReviews(hotel.id);
  const nights = stayInfo.nights;
  const selectedRoom = hotel.rooms.find(r => r.id === selectedRoomId);
  const currentRoom = currentHotel?.rooms?.[0];

  const isSameAsCurrent = isCurrentHotel && selectedRoomId === hotel.rooms[0]?.id;

  const newStayTotal = selectedRoom.pricePerNight * nights;
  const oldStayTotal = currentRoomPrice * nights;
  const stayDelta = currentHotel ? (selectedRoom.pricePerNight - currentRoomPrice) * nights : 0;
  const baseHotel = hotels.find(h => h.id === `${stayInfo.city}-hotel-0`) || hotels[0];
  const basePrice = baseHotel?.rooms?.[0]?.pricePerNight || currentRoomPrice;
  const storedDelta = (selectedRoom.pricePerNight - basePrice) * nights;

  const hotelsQS = `?current=${encodeURIComponent(currentHotelId || "")}${dealId && versionId ? `&dealId=${dealId}&versionId=${versionId}` : ""}`;

  // Confirm → write the hotel onto the copy (create one if needed) + return.
  const doReplace = () => {
    if (!selectedRoom) return;
    const stay = {
      hotelId: hotel.id, hotelName: hotel.name,
      roomId: selectedRoom.id, roomName: selectedRoom.name, mealPlan: selectedRoom.mealPlan,
      image: hotel.images[0].url, stars: hotel.stars, bookingScore: hotel.bookingScore,
      neighbourhood: hotel.neighbourhood, pricePerNight: selectedRoom.pricePerNight, nights,
      priceDelta: storedDelta,
    };
    let did = dealId, vid = versionId;
    if (dealId && versionId) {
      const v = dealsCtx.getVersion(dealId, versionId);
      const cust = v?.customizations || {};
      const nextHotels = { ...(cust.selectedHotels || {}), [stayIndex]: stay };
      dealsCtx.updateDraft(dealId, versionId, {
        customizations: { ...cust, selectedHotels: nextHotels },
        indicativePrice: computePrice(itinerary.price, cust.selectedDayOptions, nextHotels),
      });
    } else {
      const created = dealsCtx.createDeal({
        itineraryId: itinerary.id, dest: itinerary.dest,
        title: itinerary.route?.map(r => r.city).join(" · ") || `${itinerary.dest} trip`, img: itinerary.img,
        createdBy: "customer",
        customizations: { selectedDayOptions: {}, selectedHotels: { [stayIndex]: stay }, travelDates: null },
        indicativePrice: computePrice(itinerary.price, {}, { [stayIndex]: stay }),
      });
      did = created.dealId; vid = created.versionId;
    }
    navigate(`/itinerary/${itinerary.id}?dealId=${did}&versionId=${vid}&toast=hotel&h=${encodeURIComponent(hotel.name)}`);
  };

  // Stay summary card (dates + travellers) — booking context only.
  const stayNode = (
    <div style={{ margin: "16px 16px 0", borderRadius: 16, border: `1px solid ${C.div}`, padding: "10px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#181E4C", margin: "0 0 2px" }}>
        {stayInfo.checkIn} – {stayInfo.checkOut} &bull; {stayInfo.nights} {stayInfo.nights === 1 ? "night" : "nights"} &bull; 👤 2 travellers
      </p>
      <span style={{ fontSize: 12, color: C.sub }}>Check-In: {hotel.checkInTime} &bull; Check-Out: {hotel.checkOutTime}</span>
    </div>
  );

  // "Change hotel" ingress, shown right after the Select room section when the
  // user is viewing their own hotel. Opens the alternatives list.
  const changeHotelNode = isCurrentHotel ? (
    <div style={{ margin: "16px 16px 0" }}>
      <button
        onClick={() => navigate(`/hotels/${itineraryId}/${stayIndex}${hotelsQS}`)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 0", borderRadius: 12, border: `1.5px solid #FD014F`, background: C.white, color: "#FD014F", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
      >
        <ArrowLeftRight size={15} /> Change hotel
      </button>
    </div>
  ) : null;

  // Per-room price + select control.
  const roomFooter = (room) => {
    const priceDelta = (room.pricePerNight * nights) - (currentRoomPrice * nights);
    const isSelected = room.id === selectedRoomId;
    return (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
        <div>
          <p style={{ fontSize: 12, color: "#FD014F", margin: "0 0 2px" }}>Price for {nights} night{nights > 1 ? "s" : ""}</p>
          <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px", color: priceDelta < 0 ? "#4EAC7E" : priceDelta > 0 ? "#FD014F" : C.sub }}>
            {priceDelta === 0 ? "No price change" : `${priceDelta > 0 ? "+" : "−"} ₹ ${formatHotelPrice(Math.abs(priceDelta))}`}
          </p>
        </div>
        {isSelected ? (
          <span style={{ fontSize: 14, fontWeight: 700, color: "#FD014F" }}>Selected</span>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); setSelectedRoomId(room.id); }} style={{ background: "none", border: `1.5px solid ${C.div}`, borderRadius: 8, padding: "6px 18px", fontSize: 13, fontWeight: 600, color: C.head, cursor: "pointer", fontFamily: "inherit" }}>
            Select
          </button>
        )}
      </div>
    );
  };

  // Sticky replace bar.
  const bottomBar = (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 16px 14px", background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 26%)" }}>
      <div style={{ background: C.white, border: `1px solid ${C.div}`, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
        {showCurrentDetails && currentHotel && (
          <div style={{ display: "flex", gap: 12, padding: "12px 14px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
              <img src={currentHotel.images[0].url} alt={currentHotel.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#181E4C", margin: "0 0 2px" }}>{currentHotel.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <div style={{ display: "flex", gap: 1 }}>
                  {Array.from({ length: currentHotel.stars }).map((_, s) => <Star key={s} size={12} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />)}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>· {currentHotel.bookingScore} Rated</span>
              </div>
              <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{currentRoom?.name}{currentRoom?.mealPlan ? ` · ${currentRoom.mealPlan}` : ""}</p>
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: showCurrentDetails && currentHotel ? "10px 14px 12px" : "12px 14px" }}>
          <button onClick={() => setShowCurrentDetails(s => !s)} disabled={!currentHotel} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, cursor: currentHotel ? "pointer" : "default", fontFamily: "inherit" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 11, color: C.sub }}>Replacing</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.head, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                {isCurrentHotel ? (currentRoom?.name || "current room") : (currentHotel ? currentHotel.name : "current hotel")}
              </span>
              {currentHotel && (showCurrentDetails ? <ChevronDown size={14} color={C.sub} style={{ flexShrink: 0 }} /> : <ChevronUp size={14} color={C.sub} style={{ flexShrink: 0 }} />)}
            </div>
            <p style={{ margin: "2px 0 0", display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
              {currentHotel && stayDelta !== 0 && (
                <span style={{ fontSize: 12, color: C.inact, textDecoration: "line-through" }}>₹{formatHotelPrice(oldStayTotal)}</span>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: C.head }}>₹{formatHotelPrice(newStayTotal)}</span>
              {stayDelta !== 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: C.sub }}>{stayDelta > 0 ? "+" : "−"}₹{formatHotelPrice(Math.abs(stayDelta))}</span>
              )}
              <span style={{ fontSize: 11, fontWeight: 400, color: C.sub }}>· {nights} night{nights > 1 ? "s" : ""}</span>
            </p>
          </button>
          <button onClick={() => setConfirmReplace(true)} disabled={!selectedRoomId} style={{ flexShrink: 0, padding: "11px 18px", height: 44, borderRadius: 12, border: "none", background: !selectedRoomId ? C.inact : "#FD014F", color: "#fff", fontSize: 14, fontWeight: 700, cursor: !selectedRoomId ? "default" : "pointer", fontFamily: "inherit" }}>
            {isCurrentHotel ? "Replace room" : "Replace hotel"}
          </button>
        </div>
      </div>
    </div>
  );

  // Replace-hotel confirmation.
  const overlay = confirmReplace && (
    <div style={{ position: "absolute", inset: 0, zIndex: 120, display: "flex", alignItems: "flex-end" }}>
      <div onClick={() => setConfirmReplace(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", width: "100%", background: C.white, borderRadius: "20px 20px 0 0", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(0,0,0,0.18)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 8px" }}>{isCurrentHotel ? "Replace your room?" : "Replace your hotel?"}</h3>
        <p style={{ fontSize: 13, color: C.sub, margin: "0 0 16px", lineHeight: "19px" }}>
          {isCurrentHotel
            ? <>You're changing your room at <b style={{ color: C.head }}>{hotel.name}</b> from <b style={{ color: C.head }}>{currentRoom?.name}</b> to <b style={{ color: C.head }}>{selectedRoom.name}</b>.</>
            : currentHotel
              ? <>You're swapping <b style={{ color: C.head }}>{currentHotel.name}</b> for <b style={{ color: C.head }}>{hotel.name}</b> ({selectedRoom.name}).</>
              : <>Set <b style={{ color: C.head }}>{hotel.name}</b> ({selectedRoom.name}) for this stay.</>}
        </p>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: C.bg, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.sub }}>This stay · {nights} night{nights > 1 ? "s" : ""}</span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              {currentHotel && stayDelta !== 0 && <span style={{ fontSize: 13, color: C.inact, textDecoration: "line-through" }}>₹{formatHotelPrice(oldStayTotal)}</span>}
              <span style={{ fontSize: 18, fontWeight: 800, color: C.head }}>₹{formatHotelPrice(newStayTotal)}</span>
            </span>
          </div>
          {stayDelta !== 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub }}>
                {stayDelta > 0 ? `+₹${formatHotelPrice(stayDelta)} on your trip` : `You save ₹${formatHotelPrice(Math.abs(stayDelta))}`}
              </span>
            </div>
          )}
        </div>
        <button onClick={doReplace} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: "#FD014F", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
          {isCurrentHotel ? "Replace room" : "Replace hotel"}
        </button>
        <button onClick={() => setConfirmReplace(false)} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Go back
        </button>
      </div>
    </div>
  );

  // Mauritius stays carry honeymoon perks / value add-ons; show them here too.
  const mauStay = itinerary.dest === "Mauritius" ? getMauritiusHotel(itinerary.id, Number(stayIndex), stayInfo.city) : null;
  const inclusions = mauStay?.inclusions && (mauStay.inclusions.honeymoon?.length || mauStay.inclusions.valueAdds?.length) ? mauStay.inclusions : null;

  return (
    <HotelDetailScreen
      hotel={hotel}
      cityName={stayInfo.city}
      reviews={reviews}
      onBack={() => navigate(`/hotels/${itineraryId}/${stayIndex}${hotelsQS}`)}
      selectedRoomId={selectedRoomId}
      stay={stayNode}
      roomFooter={roomFooter}
      afterRooms={changeHotelNode}
      bottomBar={isSameAsCurrent ? null : bottomBar}
      overlay={overlay}
      inclusions={inclusions}
    />
  );
}
