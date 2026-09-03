// Activity detail data generator - stubs Google Places shape from minimal input.
// Used by ActivityDetail page for both booked customer and planning user.

// The old digitalocean bucket 404s on every path; the same files are served
// from the current CDN.
const CDN = "https://cdn.30sundays.club/app_content";

const FALLBACK_IMAGES = [
  `${CDN}/thailand/pileh_lagoon_439.jpg`,
  `${CDN}/thailand/big_buddha_temple_koh_samui_459.jpg`,
  `${CDN}/thailand/long_beach_koh_phi_phi_468.jpg`,
  `${CDN}/thailand/angel_waterfall_park_493.jpg`,
  `${CDN}/thailand/dolphin_show_phuket_494.jpg`,
];

const REVIEW_TEMPLATES = [
  {
    author: "Arkadiusz",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocK2QxHa44eF0CeV2UiaLaLNfQwTHFFFuPaqXcKpvRMPSXbkAc8=s64",
    rating: 5,
    date: "2 months ago",
    text: "One of the most picturesque and magical places. The early morning mist and reflections on the water make every photo feel surreal. There was no wait to enter, and the flow of visitors felt calm and respectful.",
  },
  {
    author: "Della Silvia",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXBOwUp1KbZqa13irGLOGDkEel8DB1OHi6oL_cLQM0RGNkJg-dt=s64",
    rating: 4,
    date: "a month ago",
    text: "Beautiful and well maintained. Try coming in the morning for a calmer experience - peak hours get crowded but the view is worth it.",
  },
  {
    author: "Deepak",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocJaF-1LsMTprXl92gk51czlFFGlH2UAvihdpqrWM13rZ2Ij9A=s64",
    rating: 4,
    date: "2 months ago",
    text: "Intricately designed and rich architecture. Many cafes nearby. Beautifully maintained gardens. Be prepared to spend around 2 hours here. Definitely a must visit.",
  },
  {
    author: "Jonathan Phan",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXQHG0IFClp82-DYYo1oK-yc30ydO9-d1703xTTJV7TUkzN9tvX=s64",
    rating: 5,
    date: "3 months ago",
    text: "Invites reflection, not just sightseeing. Easy to find a quiet corner to sit and breathe. Spend at least an hour here, maybe more.",
  },
];

const TYPE_KEYWORDS = [
  { match: /temple|pagoda|shrine|wat /i, type: "Hindu Temple", icon: "🛕" },
  { match: /beach|bay|lagoon/i, type: "Beach", icon: "🏖️" },
  { match: /market|bazaar|street/i, type: "Market", icon: "🛍️" },
  { match: /palace|fort/i, type: "Historic Site", icon: "🏛️" },
  { match: /museum|gallery/i, type: "Museum", icon: "🖼️" },
  { match: /forest|park|garden|terrace/i, type: "Nature", icon: "🌿" },
  { match: /restaurant|cuisine|dinner|food/i, type: "Restaurant", icon: "🍽️" },
  { match: /climb|trek|hike|raft|dive/i, type: "Adventure", icon: "🏔️" },
  { match: /spa|yoga|massage/i, type: "Wellness", icon: "💆" },
  { match: /class|workshop|cooking/i, type: "Experience", icon: "🎨" },
  { match: /tour|sightseeing|walk/i, type: "Tour", icon: "🚶" },
  { match: /buddha/i, type: "Buddhist Temple", icon: "🛕" },
  { match: /flight|airport|arrive|transfer|departure/i, type: "Travel", icon: "✈️" },
  { match: /check-in|hotel/i, type: "Stay", icon: "🏨" },
];

function hash(str) {
  return [...(str || "x")].reduce((a, c) => a + c.charCodeAt(0), 0);
}

function pickType(name) {
  const m = TYPE_KEYWORDS.find(t => t.match.test(name));
  return m || { type: "Point of Interest", icon: "📍" };
}

// Deterministic flag combinations so each activity feels different
function pickFlags(name) {
  const h = hash(name);
  return {
    topActivity: h % 4 === 0,
    offbeat: h % 5 === 0,
    audioGuide: h % 3 === 0,
    recommended: h % 7 !== 0,
  };
}

// Generate 3 deterministic photo slots from the CDN fallback set + activity photo
function pickPhotos(activity) {
  const h = hash(activity.title || activity.name || "x");
  const hero = activity.photo || activity.img;
  const others = [
    FALLBACK_IMAGES[h % FALLBACK_IMAGES.length],
    FALLBACK_IMAGES[(h + 2) % FALLBACK_IMAGES.length],
    FALLBACK_IMAGES[(h + 4) % FALLBACK_IMAGES.length],
  ];
  // Keep first slot as the card's hero so the transition feels continuous
  if (hero && !others.includes(hero)) {
    return [hero, others[0], others[1]];
  }
  return others;
}

function pickReviews(name) {
  const h = hash(name);
  return REVIEW_TEMPLATES
    .slice(0)
    .sort((a, b) => ((hash(a.author) + h) % 7) - ((hash(b.author) + h) % 7))
    .slice(0, 3);
}

const VIDEO_SAMPLE = "https://thirtysundays-prod-content.fra1.digitaloceanspaces.com/welcome/Indonesia.mp4";

// Hand-authored overrides for specific activity names. When the itinerary
// sends a generic label (e.g. "Dining"), we swap in a richer real-place record.
// Photos point at public/ so users only need to drop the files in.
const ACTIVITY_OVERRIDES = {
  Temples: {
    name: "Tandem ATV",
    primaryType: "Adventure",
    primaryTypeIcon: "🏔️",
    description:
      "Tandem ATV is a 2-up jungle ride through Ubud's bamboo trails, river crossings, and mossy stone tunnels. You and your partner share one ATV (driver and pillion), so neither of you misses the views. Routes wind through rice fields, past small waterfalls, and end at a local warung for lunch. Pickup is from your hotel, safety gear and a guide are included, and the ride lasts about 2 hours.",
    editorialSummary:
      "Bali's most-loved couple ride, jungle trails, river splashes, and a Jurassic-style stone tunnel.",
    photos: ["/atv-1.jpg", "/atv-2.jpg", "/atv-3.jpg"],
    rating: "4.9",
    reviewCount: 8420,
    address: "Kuber Bali ATV Adventure, Tegallalang, Ubud, Bali, Indonesia",
    shortAddress: "Ubud, Bali",
    types: ["Adventure", "Couples activity", "Outdoor"],
    typicalDuration: "~2 hr ride, ~4 hr door to door",
    weekdayHours: [
      "Monday: 8:00 AM to 4:00 PM",
      "Tuesday: 8:00 AM to 4:00 PM",
      "Wednesday: 8:00 AM to 4:00 PM",
      "Thursday: 8:00 AM to 4:00 PM",
      "Friday: 8:00 AM to 4:00 PM",
      "Saturday: 8:00 AM to 4:00 PM",
      "Sunday: 8:00 AM to 4:00 PM",
    ],
    openNow: true,
    nextOpenLabel: "Opens 8:00 AM",
    googleMapsUri: "https://www.google.com/maps/search/Kuber+Bali+ATV+Adventure",
    website: "https://kuberbali.com/atv",
    phone: "+62 821-4500-9090",
  },
  Dining: {
    name: "Kelingking Beach",
    primaryType: "Beach",
    primaryTypeIcon: "🏖️",
    description:
      "Kelingking Beach on Nusa Penida is famous for its T-Rex-shaped limestone cliff that juts into the sea. The viewpoint at the top is one of Bali's most photographed spots, especially at sunrise and sunset. A steep wooden staircase descends roughly 400 metres to the secluded white-sand cove and turquoise water below, with the climb back taking around 30 to 45 minutes.",
    editorialSummary:
      "Iconic T-Rex cliff and turquoise cove on Nusa Penida, Bali's most photographed beach.",
    photos: ["/kelingking-1.jpg", "/kelingking-2.jpg", "/kelingking-1.jpg"],
    rating: "4.8",
    reviewCount: 12842,
    address: "Bunga Mekar, Nusa Penida, Klungkung, Bali, Indonesia",
    shortAddress: "Nusa Penida, Bali",
    types: ["Beach", "Viewpoint", "Tourist attraction"],
    typicalDuration: "~2 hr at viewpoint, +1 hr if you descend",
    weekdayHours: [
      "Monday: Open 24 hours",
      "Tuesday: Open 24 hours",
      "Wednesday: Open 24 hours",
      "Thursday: Open 24 hours",
      "Friday: Open 24 hours",
      "Saturday: Open 24 hours",
      "Sunday: Open 24 hours",
    ],
    openNow: true,
    nextOpenLabel: "Open 24 hours",
    googleMapsUri: "https://www.google.com/maps/place/Kelingking+Beach",
    website: "https://nusa-penida.id/kelingking-beach",
    phone: null,
  },
};

/**
 * Build a full activity detail record.
 * @param {object} activity - source from trip data or itinerary day
 * @param {object} opts - { city, isBooked, dayDate, dayNum, country }
 */
export function buildActivityDetail(activity, opts = {}) {
  const { city = "", isBooked = false, dayDate = "", dayNum = null, country = "" } = opts;
  const rawName = activity.title || activity.name || "Activity";
  const override = ACTIVITY_OVERRIDES[rawName];
  const name = override?.name || rawName;
  const h = hash(name + city);
  const typeMeta = override
    ? { type: override.primaryType, icon: override.primaryTypeIcon }
    : pickType(name);
  const flags = pickFlags(name);

  // Description: prefer override, then activity, else compose
  const description = override?.description
    || (activity.description && activity.description.length > 60
        ? activity.description
        : `${name} is a beloved stop in ${city}. Plan to spend a couple of hours here soaking in the atmosphere, taking photos, and exploring at your own pace. It's the kind of place that rewards a slower visit, quiet moments, unexpected corners, and views you'll want to remember.`);

  const editorialSummary = override?.editorialSummary
    || activity.editorialSummary
    || `Popular ${typeMeta.type.toLowerCase()} ${city ? `in ${city}` : ""} with strong reviews and great photo spots.`;

  return {
    id: `act-${h}`,
    name,
    primaryType: typeMeta.type,
    primaryTypeIcon: typeMeta.icon,
    description,
    editorialSummary,
    photos: override?.photos || pickPhotos(activity),
    // Only booked customers get the curated guide
    videoUrl: isBooked ? VIDEO_SAMPLE : null,
    videoDuration: "1:45",
    rating: override?.rating || (4.3 + ((h % 7) * 0.1)).toFixed(1),
    reviewCount: override?.reviewCount || 800 + (h % 50000),
    address: override?.address || `${name}, ${city}${country ? `, ${country}` : ""}`,
    shortAddress: override?.shortAddress || `${city}${country ? `, ${country}` : ""}`,
    phone: override ? override.phone : (h % 4 === 0 ? null : `+62 821-${(h % 9000) + 1000}-${(h % 9000) + 1000}`),
    website: override?.website || (h % 3 === 0 ? `https://www.${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com` : null),
    googleMapsUri: override?.googleMapsUri || `https://www.google.com/maps/search/${encodeURIComponent(`${name}, ${city}`)}`,
    weekdayHours: override?.weekdayHours || [
      "Monday: 6:00 AM to 7:00 PM",
      "Tuesday: 6:00 AM to 7:00 PM",
      "Wednesday: 6:00 AM to 7:00 PM",
      "Thursday: 6:00 AM to 7:00 PM",
      "Friday: 6:00 AM to 7:00 PM",
      "Saturday: 6:00 AM to 7:00 PM",
      "Sunday: 6:00 AM to 7:00 PM",
    ],
    openNow: override?.openNow ?? (h % 5 !== 0),
    nextOpenLabel: override?.nextOpenLabel || "Opens 6:00 AM",
    businessStatus: "OPERATIONAL",
    flags,
    accessibility: {
      wheelchair: h % 3 !== 0,
      restroom: h % 2 === 0,
      kidFriendly: h % 4 !== 0,
      parking: h % 3 === 0,
    },
    types: override?.types || [typeMeta.type, "Tourist attraction", "Point of interest"].slice(0, 3),
    reviews: pickReviews(name),
    typicalDuration: override?.typicalDuration || ["~1 hr typical visit", "~2 hr typical visit", "~3 hr typical visit"][h % 3],
    // Context
    dayDate,
    dayNum,
    isBooked,
  };
}
