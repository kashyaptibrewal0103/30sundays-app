import { HOTEL } from "./hotelDetailData";

// ─── Real hotel in, detail screen out ───
//
// The new hotel screen wants far more than the app's hotel records carry: a
// neighbourhood guide, policies, an honest bit, written reviews. Only one
// hotel in this prototype is written out to that depth.
//
// So this maps every real hotel onto that one. Anything the record genuinely
// knows is used: the name, the stars, the photos, the amenities, the rooms and
// their prices, check-in and check-out, the Booking.com score and how many
// people gave it. Everything else is borrowed, the same way tapping a similar
// hotel already works. Photos are never borrowed, because a hotel wearing
// another hotel's rooms is the one substitution nobody would forgive.
//
// When a real catalogue arrives, the borrowed half is what it replaces.

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const r1 = (n) => Math.round(n * 10) / 10;
const hashOf = (s) => [...String(s || "")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7);

// Five buckets that sum to 100, given the share who rated it four or five.
// Written this way so the headline percentage on the card and the bars in the
// sheet can never disagree: one is the sum of the first two of the other.
function spread(top) {
  const five = Math.round(top * 0.8);
  const four = top - five;
  const rest = 100 - top;
  const three = Math.round(rest * 0.55);
  const two = Math.round(rest * 0.3);
  return [five, four, three, two, rest - three - two];
}

// Borrowed prose that names another hotel is worse than borrowed prose. The
// writing carries over; the name, the area and the town in it do not.
function restory(text, h) {
  if (typeof text !== "string") return text;
  return text
    .split("Alila Seminyak").join(h.name)
    .split("Petitenget").join(h.neighbourhood || HOTEL.neighbourhood)
    .split("Seminyak").join(h.city || h.neighbourhood || HOTEL.city);
}

const AMENITY_ICON = {
  Breakfast: "utensils", Spa: "flower", "Swimming pool": "waves", Gym: "hammer",
  "Airport Transfer": "bus", "Free WiFi": "wifi", Beachfront: "umbrella",
  Restaurant: "utensils", Bar: "utensils", "Room Service": "concierge",
  Concierge: "concierge", Laundry: "concierge", Parking: "info",
  "Indoor Games": "sparkles", Pool: "waves", "Private pool": "waves",
};
const iconFor = (label) => AMENITY_ICON[label] || "sparkles";

function toRooms(h, nights) {
  const list = h.rooms || [];
  if (list.length === 0) return HOTEL.rooms;
  const prices = list.map((r) => r.pricePerNight || 0);
  const cheapest = Math.min(...prices);

  return list.map((r) => ({
    id: r.id,
    name: r.name,
    size: r.size || 32,
    beds: r.bedType || "1 King bed",
    sleeps: 2,
    // A room's view comes from the room if it has one, then from the hotel's
    // own tags, and otherwise not at all. Cycling the hotel's filter tags put
    // "5 star" where a view should be.
    view: (r.amenities || []).find((a) => /view/i.test(a))
      || (h.viewTags || []).find((t) => /view|pool|beach/i.test(t))
      || null,
    mealPlan: r.mealPlan || "Breakfast included",
    refundable: h.freeCancellation !== false,
    priceDelta: ((r.pricePerNight || 0) - cheapest) * nights,
    images: r.images && r.images.length ? r.images : HOTEL.rooms[0].images,
    description:
      r.description ||
      `${r.name} at ${h.name}. ${r.size ? `${r.size} square metres, ` : ""}${(r.bedType || "").toLowerCase()}, with ${(r.amenities || []).length ? (r.amenities || []).join(", ").toLowerCase() : "the usual comforts"}.`,
    amenities: (r.amenities && r.amenities.length ? r.amenities : HOTEL.rooms[0].amenities).slice(0, 8),
    sizeTip: null,
  }));
}

export function detailFromHotel(h, opts = {}) {
  if (!h) return HOTEL;
  const { nights = 3, currentStay = null, similar = [] } = opts;

  const seed = hashOf(h.id || h.name);
  const booking = r1(clamp(h.bookingScore || 8.6, 5, 9.9));
  const bookingCount = h.reviewCount || 600;

  // Ours, in the unit the screen speaks: the share who rated it four or five.
  const topPct = clamp(Math.round(booking * 10) - 2 + (seed % 5), 55, 97);
  const ourCount = Math.max(14, Math.round(bookingCount / 22));
  const googleScore = r1(clamp(booking / 2 + 0.1, 3, 5));
  const taScore = r1(clamp(booking / 2 - 0.1, 3, 5));

  const rooms = toRooms(h, nights);
  const cheapest = Math.min(...(h.rooms || []).map((r) => r.pricePerNight || 0), Infinity);
  const total = Number.isFinite(cheapest) && cheapest > 0 ? cheapest * nights : HOTEL.total;

  const photos = (h.images || []).length
    ? h.images.map((im) => ({
      url: im.url || im,
      category: im.category || "Hotel",
      caption: `${im.category || "Hotel"} at ${h.name}`,
    }))
    : HOTEL.photos;

  const amenities = h.amenities && h.amenities.length ? h.amenities : [];

  // The five on the page have to be in the list behind "View all". They were
  // not: the page showed this hotel's own amenities and the sheet showed the
  // borrowed ones, so the count and the list disagreed with each other. The
  // hotel's own go in first, as their own group, and anything borrowed that
  // repeats one of them drops out.
  const own = new Set(amenities.map((a) => a.toLowerCase()));
  const facilityGroups = [
    ...(amenities.length
      ? [{
        key: "listed",
        title: "At this hotel",
        icon: "sparkles",
        photos: [],
        items: amenities.map((a) => ({ label: a })),
      }]
      : []),
    ...HOTEL.facilityGroups.map((g) => ({
      ...g,
      items: g.items.filter((it) => !own.has(it.label.toLowerCase())),
    })).filter((g) => g.items.length > 0),
  ];

  const tell = (t) => restory(t, h);

  return {
    ...HOTEL,

    // ── the map and the neighbourhood are the one thing we will not borrow ──
    // Everything else can wear this hotel's name and read true. A map pinned
    // to another island cannot, and neither can a list of temples 3,000 km
    // away. Until a record carries its own coordinates, the section says where
    // the hotel is and stops.
    hasPlaces: !!h.coords,
    // Not every hotel gets our mark. A badge on all of them says nothing.
    sundaysPick: (h.bookingScore || 0) >= 8.6,

    // ── what the record actually knows ──
    id: h.id,
    name: h.name,
    stars: h.stars || 4,
    type: (h.stars || 4) >= 5 ? "Resort" : "Hotel",
    neighbourhood: h.neighbourhood || HOTEL.neighbourhood,
    city: h.city || (h.neighbourhood || "").split(",")[0] || HOTEL.city,
    address: h.address || HOTEL.address,
    distanceFromCenter: h.distanceFromCenter ?? HOTEL.distanceFromCenter,
    photos,
    video: { ...HOTEL.video, poster: photos[0]?.url || HOTEL.video.poster },
    reels: HOTEL.reels.map((r, i) => ({ ...r, poster: photos[i % photos.length]?.url || r.poster })),
    aboutShort: h.description || tell(HOTEL.aboutShort),
    aboutSections: HOTEL.aboutSections.map((sec) => ({ ...sec, body: tell(sec.body) })),
    honestNote: tell(HOTEL.honestNote),
    honest: HOTEL.honest.map((x) => ({ ...x, title: tell(x.title), short: tell(x.short || x.title), body: tell(x.body) })),
    reviewSummary: { ...HOTEL.reviewSummary, text: tell(HOTEL.reviewSummary.text) },
    reviews: HOTEL.reviews.map((r) => ({ ...r, text: tell(r.text) })),
    faqs: HOTEL.faqs.map((f) => ({ q: tell(f.q), a: tell(f.a) })),
    legal: HOTEL.legal.map(tell),
    facilityTop: amenities.length
      ? amenities.slice(0, 6).map((a) => ({ label: a, icon: iconFor(a) }))
      : HOTEL.facilityTop,
    facilityGroups,
    stayBasics: {
      ...HOTEL.stayBasics,
      checkIn: h.checkInTime || HOTEL.stayBasics.checkIn,
      checkOut: h.checkOutTime || HOTEL.stayBasics.checkOut,
      earlyCheckIn: { included: !!h.earlyCheckIn },
      lateCheckOut: { included: !!h.lateCheckOut },
    },
    rooms,
    total,

    // ── the scores, all derived from the one real number ──
    ratings: {
      sundays: { score: r1(booking / 2), outOf: 5, count: ourCount, label: "Loved by travellers", ours: true },
      booking: { score: booking, outOf: 10, count: bookingCount, label: "Rated" },
      google: { score: googleScore, outOf: 5, count: Math.round(bookingCount * 1.7), label: "Rated" },
      tripadvisor: { score: taScore, outOf: 5, count: Math.round(bookingCount * 1.3), label: "Rated" },
    },
    starSplit: {
      sundays: spread(topPct),
      booking: spread(clamp(topPct + 1, 55, 97)),
      google: spread(clamp(topPct - 2, 55, 97)),
      tripadvisor: spread(clamp(topPct - 4, 55, 97)),
    },
    ratingBreakdown: {
      booking: [
        { label: "Cleanliness", score: r1(clamp(booking + 0.4, 0, 10)) },
        { label: "Location", score: r1(clamp(booking + 0.2, 0, 10)) },
        { label: "Staff", score: r1(clamp(booking + 0.1, 0, 10)) },
        { label: "Comfort", score: booking },
        { label: "Facilities", score: r1(clamp(booking - 0.2, 0, 10)) },
        { label: "Value for money", score: r1(clamp(booking - 0.8, 0, 10)) },
      ],
      google: HOTEL.ratingBreakdown.google,
      tripadvisor: HOTEL.ratingBreakdown.tripadvisor,
      sundays: HOTEL.ratingBreakdown.sundays,
    },

    // Only real alternatives, or none. A Phuket hotel listing three Bali
    // resorts as "similar" is the same mistake as the map.
    similar,

    // The policy sheet quoted the borrowed hotel's hours while the card above
    // it showed this one's. Two different check-in times on one screen.
    policies: HOTEL.policies.map((pol) => (pol.key === "checkin"
      ? {
        ...pol,
        lines: [
          `Check-in from ${h.checkInTime || HOTEL.stayBasics.checkIn}, check-out until ${h.checkOutTime || HOTEL.stayBasics.checkOut}.`,
          ...pol.lines.slice(1),
        ],
      }
      : pol)),

    currentStay: currentStay || HOTEL.currentStay,
  };
}
