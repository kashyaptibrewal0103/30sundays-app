import { getDayTours } from "./dayScoring";
import { customerPhotos } from "../data";

// ─── Real itinerary days → the shape the media day detail renders ───
//
// The media day detail was designed against a hand-written sample week where
// every tour carried the full PDF: a written overview, a schedule, inclusions,
// exclusions and operator notes. The app does not hold any of that yet. What it
// does hold is the day's tours, their stops, and each stop's photo.
//
// So this maps what exists, and fills the rest from what is true of every
// 30 Sundays tour: the package covers entry, the transfer and the guide, and
// does not cover meals, tips or optional paid extras. Those lines are the same
// on every tour until ops carries them per tour, which is a real limitation:
// they describe the package, not this particular experience.
//
// Pickup times are laid out from the day's shape, earliest tour first, so a
// three-stop day reads as a schedule rather than three tours at once.

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

// A morning tour starts at 8:30 and an afternoon one after lunch. Written as a
// clock time because that is what a traveller needs to plan around, and the
// day's shape is what decides it.
const PICKUPS = ["8:30 am", "1:30 pm", "4:00 pm"];
const pickupAt = (tourIndex, hasTransferFirst) =>
  PICKUPS[Math.min(tourIndex + (hasTransferFirst ? 1 : 0), PICKUPS.length - 1)];

// What the package covers on a tour, and what it does not. The same on every
// tour: these describe the 30 Sundays package, not the individual experience.
const INCLUSIONS = (stops, transferLabel) => [
  stops > 1 ? `Entry to all ${stops} places on this tour` : "Entry tickets where required",
  `${transferLabel} to and from your hotel`,
  "English-speaking guide for the day",
  "Bottled water",
  "Passenger insurance",
];
const EXCLUSIONS = [
  "Meals and drinks, unless named above",
  "Optional paid activities at each stop",
  "Personal expenses and shopping",
  "Tips for your guide and driver",
];
const IMPORTANT = (city) => [
  `Timings shift with traffic and weather in ${city}. Your guide will call ahead if the day needs to move.`,
  "Wear comfortable shoes. Some stops involve a fair amount of walking.",
];

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
    inclusions: [
      `One-way ${(t.sharing || "private").toLowerCase()} ${t.vehicle || "transfer"}`,
      "Air-conditioned vehicle",
      "Professional driver",
      "All tolls and parking",
    ],
    exclusions: ["Meals and drinks", "Tips for your driver", "Anything not listed above"],
    important: [`Timings shift with traffic on the ${t.from} to ${t.to} road.`],
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
      const hadTransfer = tours.length > 0;
      let tourIndex = 0;
      grouped.forEach((g, gi) => {
        const items = g.items.filter((x) => x.actIdx != null && !x.onTap);
        if (!items.length) return;
        const names = items.map((x) => x.name);
        const transferLabel = day.transfers?.[0]?.sharing
          ? `${day.transfers[0].sharing} transfer`
          : "Private transfer";
        tours.push({
          id: `tour-${i}-${gi}`,
          name: listOf(names),
          img: items[0].img,
          duration: tourHours(scoring, items.length, totalStops),
          time: pickupAt(tourIndex, hadTransfer),
          transfer: transferLabel,
          overview: `${listOf(names)}, in ${day.city}. ${items.length > 1 ? "Your guide moves you between them" : "Your guide takes you there"} and back to your hotel.`,
          // A schedule, not a restatement of the stop list below it. The canned
          // per-stop line from getDayTours claimed a private transfer on every
          // tour, which contradicted the transfer shown right above it.
          covers: [
            { label: `${pickupAt(tourIndex, hadTransfer)} pickup`, text: `Your guide collects you from your hotel in ${day.city}.` },
            ...items.map((x) => ({ label: x.name, text: "Guided stop, with time to look around on your own." })),
            { label: "Back to your hotel", text: "Dropped back after the last stop." },
          ],
          inclusions: INCLUSIONS(items.length, transferLabel),
          exclusions: EXCLUSIONS,
          important: IMPORTANT(day.city),
          activities: items.map((x) => ({ name: x.name, img: x.img, actIdx: x.actIdx })),
        });
        tourIndex += 1;
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
      // A day with nothing booked has no tours, so the screen drops the
      // "Your day will cover" list rather than inventing a tour to fill it.
      freeNote: tours.length ? null : (day.departure
        ? "Check out, then the transfer to the airport for your flight home."
        : `Nothing is booked today. ${day.city} is yours to wander, and your consultant can add a tour if you would rather not.`),
      media: { video, images: video ? images.slice(1) : images },
      photos: photoPool,
    };
  });
}
