// ─── The facts a card shows, from one place ───
//
// A thing to do, a region or a place to eat turns up as a card on several
// screens. If each screen worked out its own rating, the same temple could be
// 4.5 on its page and 4.7 in the wishlist. Every card reads its numbers from
// here, so a fact is the same wherever it is shown.

import { buildActivityDetail } from "./activityData";
import { getTourRating } from "./tourRatings";
import { regionByCity } from "./discoverData";

// A thing to do: its star rating out of 5 and how many reviews, the same
// figures its own screen shows.
export function activityRating(dest, city, name) {
  if (!name) return null;
  const d = buildActivityDetail({ name }, { city: city || "", country: dest, isBooked: false });
  return { rating: Number(d.rating).toFixed(1), reviews: d.reviewCount };
}

// A region: the share of travellers who enjoyed their stay there (loved it
// or liked it), the same measure the itinerary uses for a day.
export function regionEnjoyed(dest, city) {
  if (!city) return null;
  const r = getTourRating(`region:${dest}:${city}`);
  return { pct: 100 - r.notPct, count: r.count };
}

// How long people tend to stay in a region, or that it is a day trip.
export function regionStay(dest, city) {
  const r = regionByCity(dest, city);
  if (!r) return null;
  return r.dayTrip ? "Day trip" : `~ ${r.n || 2} to ${(r.n || 2) + 1} nights`;
}

// A hotel: its star category and its Booking score out of 10, the two facts
// every hotel card in the app leads with. Both are kept on the save itself,
// because hotel data is regenerated per trip; an older save without them
// falls back to the star category written in its small print.
export function hotelFacts(item) {
  const stars = item.stars ?? (Number(String(item.sub || "").match(/(\d(?:\.\d)?)-star/)?.[1]) || null);
  const score = item.score != null ? Number(item.score).toFixed(1) : null;
  return stars || score ? { stars, score } : null;
}
