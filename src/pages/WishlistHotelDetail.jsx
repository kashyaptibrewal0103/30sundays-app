import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C } from "../data";
import { generateHotelsForCity } from "../data/hotelData";
import { useWishlist } from "../data/wishlist";
import HotelV3 from "../components/hotel_v3/HotelV3";
import { detailFromHotel } from "../data/hotelDetailAdapter";

// A saved hotel, opened from the wishlist: the same hotel page the region page
// opens, read-only, because from a board there is no stay to price and nothing
// to swap. The hotel is looked up in its town's list by name (that is how the
// wishlist keys hotels); a hotel that list does not hold, an older save or one
// from a seeded board, is drawn from what was kept when it was saved.
export default function WishlistHotelDetail() {
  const { dest: rawDest, id: rawId } = useParams();
  const dest = decodeURIComponent(rawDest || "");
  const id = decodeURIComponent(rawId || "");
  const navigate = useNavigate();
  const { get, isSaved, toggle } = useWishlist();
  // Kept from the first render, so taking the heart off here does not empty
  // the page out from under the person reading it.
  const [saved] = useState(() => get("hotel", dest, id));

  const hotel = useMemo(() => {
    const city = saved?.city;
    const live = city ? generateHotelsForCity(city, dest, "2026-11-10", "2026-11-17", 7).find((h) => h.name === id) : null;
    if (live) return live;
    if (!saved) return null;
    return {
      id, name: saved.name || id, city, neighbourhood: city,
      stars: saved.stars, bookingScore: saved.score,
      images: saved.img ? [{ url: saved.img, category: "Hotel" }] : [],
    };
  }, [saved, dest, id]);

  if (!hotel) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: C.bg }}>
        <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>Hotel not found.</p>
        <button onClick={() => navigate(-1)} style={{ border: "none", background: C.p600, color: "#fff", borderRadius: 12, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: C.white }}>
      <HotelV3
        hotel={detailFromHotel(hotel)}
        onBack={() => navigate(-1)}
        readOnly
        saved={isSaved("hotel", dest, id)}
        onSave={() => toggle("hotel", dest, id, saved || { name: hotel.name, city: hotel.city })}
      />
    </div>
  );
}
