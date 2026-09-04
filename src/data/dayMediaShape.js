import { getDayTours } from "./dayScoring";
import { customerPhotos } from "../data";

// ─── Real itinerary days → the shape the media day detail renders ───
//
// The media day detail was designed against a hand-written sample week where
// every tour carried the full PDF: a written overview, a schedule, inclusions,
// exclusions and operator notes. The app does not hold any of that yet. What it
// does hold is the day's tours, their stops, and each stop's photo.
//
// So this maps what exists and leaves out what does not. The tour card renders
// only the sections it is given, so a tour here shows its overview, its
// schedule of stops and the stops themselves. Inclusions, exclusions and the
// operator notes stay absent until ops carries them per tour, rather than being
// invented here.

const listOf = (names) => {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

// Roughly how long a tour runs, from the day's scored activity time split
// across its tours. Written as "about N hours" because it is an estimate.
const tourHours = (scoring, stops, totalStops) => {
  const hrs = scoring?.activity?.hours;
  if (!hrs || !totalStops) return null;
  const share = Math.round((hrs * stops) / totalStops * 2) / 2;
  if (!share) return null;
  return share === 1 ? "about 1 hour" : `about ${share} hours`;
};

function transferTour(t, dayCity, fallbackImg) {
  return {
    id: `transfer-${t.from}-${t.to}`,
    name: t.name || `Transfer to ${t.to}`,
    img: t.img || fallbackImg,
    duration: t.duration || null,
    time: null,
    transfer: t.sharing ? `${t.sharing} ${t.vehicle || "transfer"}` : null,
    overview: t.desc || `${t.from} to ${t.to}.`,
    covers: [
      { label: "Pickup", text: `Your driver collects you from ${t.from}.` },
      { label: t.sharing ? `${t.sharing} transfer` : "Transfer", text: `${t.duration ? `${t.duration}. ` : ""}Straight through to ${t.to}.` },
      { label: "Drop-off", text: `Direct drop at ${t.to}.` },
    ],
    activities: [],
  };
}

/**
 * @param days   the itinerary's days (as the itinerary screen builds them)
 * @param dest   destination name, for the customer photo pool
 * @param opts   { dateFor(day, index) → a date line for the day }
 */
export function toMediaDays(days, dest, opts = {}) {
  const { dateFor, scoringFor } = opts;
  const photoPool = (dest && customerPhotos[dest]) || [];

  return days.map((day, i) => {
    const acts = day.activities || [];
    const free = day.leisure || day.departure;
    const scoring = scoringFor ? scoringFor(day, i) : null;

    // Transfers first: they are what starts the day.
    const tours = (day.transfers || []).map((t) => transferTour(t, day.city, acts[0]?.img));

    if (!free) {
      const grouped = getDayTours(day, i, days);
      const totalStops = grouped.reduce((n, g) => n + g.items.filter((x) => x.actIdx != null && !x.onTap).length, 0);
      grouped.forEach((g, gi) => {
        const items = g.items.filter((x) => x.actIdx != null && !x.onTap);
        if (!items.length) return;
        const names = items.map((x) => x.name);
        tours.push({
          id: `tour-${i}-${gi}`,
          name: listOf(names),
          img: items[0].img,
          duration: tourHours(scoring, items.length, totalStops),
          time: null,
          transfer: day.transfers?.[0]?.sharing ? `${day.transfers[0].sharing} transfer` : "Private transfer",
          overview: `${listOf(names)}, in ${day.city}. ${items.length > 1 ? "Your guide moves you between them" : "Your guide takes you there"} and back to your hotel.`,
          covers: items.map((x) => ({ label: x.name, text: x.desc || `In ${day.city}.` })),
          activities: items.map((x) => ({ name: x.name, img: x.img, actIdx: x.actIdx })),
        });
      });
    }

    // A free day with no transfer still needs something on the card.
    if (!tours.length) {
      tours.push({
        id: `free-${i}`,
        name: day.departure ? "Checkout and airport transfer" : `A free day in ${day.city}`,
        img: acts[0]?.img,
        duration: null,
        time: null,
        transfer: null,
        overview: day.departure
          ? "Check out, then the transfer to the airport for your flight home."
          : `Nothing is booked today. ${day.city} is yours to wander, and your consultant can add a tour if you would rather not.`,
        covers: [],
        activities: [],
      });
    }

    // Media: one video per activity, matching what the app counts elsewhere.
    // A free day has no tours and so no video, and falls back to photos.
    const images = [...new Set(acts.map((a) => a.img).filter(Boolean))];
    const video = free || !images.length
      ? null
      : { poster: images[0], duration: "1:12", title: `Your day in ${day.city}` };

    const title = day.departure
      ? "Departure day"
      : day.leisure
        ? `Leisure in ${day.city}`
        : listOf(acts.map((a) => a.name).filter(Boolean)) || `Day in ${day.city}`;

    return {
      key: `day-${i}`,
      dayNum: day.dayNum,
      city: day.city,
      date: dateFor ? dateFor(day, i) : "",
      title,
      tours,
      media: { video, images: video ? images.slice(1) : images },
      photos: photoPool,
    };
  });
}
