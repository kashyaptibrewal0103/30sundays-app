// ─── Everything a couple wants to know before they accept a hotel ───
//
// The old hotel page carried a name, a star count, one rating and a strip of
// photos. That is not enough to decide on, so people were leaving the app to
// look the same hotel up on booking.com or Google, and half of them did not
// come back. This file is the answer to "what would they have gone looking
// for": the photos grouped by what they show, the room detail, the facilities
// in full, the neighbourhood, the policies, the questions people actually ask,
// and ratings from every source we have rather than one borrowed number.
//
// It is written as one complete hotel rather than a generator, because the
// point of the screen is depth. A generator that fills 40 fields with plausible
// noise proves nothing about whether the page reads well.

const U = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// One file in public/ stands in for every clip. When real footage lands, this
// is the only line that changes.
import { SAMPLE_VIDEO } from "./videoSource";

// ─── Where a rating or a review came from ───
//
// We show our own score next to booking.com's and Google's instead of
// borrowing one of theirs, because our couples rate a stay on things a
// business traveller does not: whether the room was worth the honeymoon, how
// the staff handled a surprise. Every number on the screen is badged, so
// nobody has to guess whose opinion they are reading.
export const SOURCES = {
  sundays: { key: "sundays", name: "30 Sundays", scale: 5, tint: "#FFF3F7" },
  booking: { key: "booking", name: "Booking.com", scale: 10, tint: "#EEF3FA" },
  google: { key: "google", name: "Google", scale: 5, tint: "#F4F7FE" },
  mmt: { key: "mmt", name: "MakeMyTrip", scale: 5, tint: "#FEF1F1" },
  tripadvisor: { key: "tripadvisor", name: "Tripadvisor", scale: 5, tint: "#EDFBF5" },
};

export const HOTEL = {
  id: "alila-seminyak",
  name: "Alila Seminyak",
  type: "Resort",
  stars: 5,
  neighbourhood: "Petitenget, Seminyak",
  city: "Seminyak",
  destination: "Bali",
  address: "Jl. Taman Ganesha No.9, Petitenget, Kerobokan Kelod, Seminyak, Bali 80361, Indonesia",
  distanceFromCenter: 1.8,
  distanceLine: "1.8 km from Seminyak centre · 2 min walk to the beach",
  coords: { lat: -8.6772, lng: 115.1553 },

  // ─── The header reel ───
  // A tall clip first, because a room looks different in motion, then the
  // stills. Photos carry their own category so the gallery can group them
  // without a second list to keep in sync.
  video: {
    src: SAMPLE_VIDEO,
    poster: U("1571896349842-33c89424de2d", 700),
    label: "Walk through the resort",
    duration: "0:48",
  },

  photos: [
    { url: U("1582719478250-c89cae4dc85b"), category: "Rooms", caption: "Deluxe Suite, garden wing" },
    { url: U("1571896349842-33c89424de2d"), category: "Pool", caption: "The 60 m infinity pool" },
    { url: U("1566073771259-6a8506099945"), category: "Exterior", caption: "Arrival courtyard" },
    { url: U("1584622650111-993a426fbf0a"), category: "Bathroom", caption: "Soaking tub, Deluxe Suite" },
    { url: U("1414235077428-338989a2e8c0"), category: "Dining", caption: "Seasalt, the beach restaurant" },
    { url: U("1540541338287-41700207dee6"), category: "Pool", caption: "Pool bar at golden hour" },
    { url: U("1618773928121-c32242e63f39"), category: "Rooms", caption: "One Bedroom Pool Villa" },
    { url: U("1618221195710-dd6b41faaea6"), category: "Common areas", caption: "The reading lounge" },
    { url: U("1552321554-5fefe8c9ef14"), category: "Bathroom", caption: "Twin vanity, Pool Villa" },
    { url: U("1551632436-cbf8dd35adfa"), category: "Dining", caption: "Breakfast, à la carte" },
    { url: U("1600334089648-b0d9d3028eb2"), category: "Spa", caption: "Alila Spa treatment room" },
    { url: U("1520250497591-112f2f40a3f4"), category: "Pool", caption: "Sun deck, adults only" },
    { url: U("1602002418082-a4443e081dd1"), category: "Rooms", caption: "Ocean Suite, upper floor" },
    { url: U("1564501049412-61c2a3083791"), category: "Exterior", caption: "Seen from the beach path" },
    { url: U("1578683010236-d716f9a3f461"), category: "Rooms", caption: "Turndown, Deluxe Suite" },
    { url: U("1542314831-068cd1dbfeeb"), category: "Pool", caption: "Villa plunge pool" },
    { url: U("1584132967334-10e028bd69f7"), category: "Common areas", caption: "The beach deck" },
    { url: U("1620626011761-996317b8d101"), category: "Bathroom", caption: "Rain shower" },
    { url: U("1571003123894-1f0594d2b5d9"), category: "Exterior", caption: "Garden wing at dusk" },
    { url: U("1595576508898-0ad5c879a061"), category: "Rooms", caption: "Living area, Pool Villa" },
    { url: U("1583416750470-965b2707b355"), category: "Spa", caption: "Steam and cold plunge" },
    { url: U("1551882547-ff40c63fe5fa"), category: "Pool", caption: "Lap lane, early morning" },
  ],

  // The reels tab in the gallery. Shot by couples who stayed, and by us.
  reels: [
    { id: "r1", src: SAMPLE_VIDEO, poster: U("1571896349842-33c89424de2d", 700), title: "The pool at 6 am", author: "30 Sundays", duration: "0:22" },
    { id: "r2", src: SAMPLE_VIDEO, poster: U("1582719478250-c89cae4dc85b", 700), title: "Inside a One Bedroom Pool Villa", author: "30 Sundays", duration: "0:41" },
    { id: "r3", src: SAMPLE_VIDEO, poster: U("1414235077428-338989a2e8c0", 700), title: "Breakfast at Seasalt", author: "Ananya, stayed Mar 2026", duration: "0:18" },
    { id: "r4", src: SAMPLE_VIDEO, poster: U("1540541338287-41700207dee6", 700), title: "Sunset from the beach club", author: "Meher, stayed Jan 2026", duration: "0:30" },
  ],

  // ─── Why an Indian couple says yes to this one ───
  //
  // The old list was reasons any traveller would like. Our customers are
  // Indian couples, and the questions they actually ask before they accept a
  // hotel are about food, language and whether the little things are handled.
  // So the section answers those, in our voice, and each line is checkable.
  whyIndians: [
    { icon: "leaf", text: "Pure vegetarian food at every meal, and a separate veg counter at breakfast" },
    { icon: "utensils", text: "Poha, upma and parathas on the breakfast buffet every morning" },
    { icon: "footprints", text: "Three Indian restaurants within a 10 minute walk, two of them pure veg" },
    { icon: "languages", text: "Hindi spoken at the front desk and by the concierge" },
    { icon: "plug", text: "Indian plug adaptors and a kettle in every room, no need to ask" },
    { icon: "heart", text: "86 Indian travellers have honeymooned here through us" },
  ],

  // ─── About ───
  aboutShort:
    "Alila Seminyak sits on the quiet end of Petitenget, two minutes from the sand and a ten minute walk from Seminyak's restaurants. The 240 suites and villas are stacked around a 60 metre infinity pool that runs towards the ocean, and the whole resort is adults only.",
  aboutSections: [
    {
      title: "The stay",
      body: "240 suites and pool villas arranged around a 60 metre infinity pool. Every room has a balcony or terrace, and the garden wing rooms open onto planted walkways rather than a corridor. The resort is adults only, which is why the pool and the beach deck stay as calm as they do.",
    },
    {
      title: "Eating here",
      body: "Three places to eat. Seasalt does Japanese and seafood on the beach side, Kiosk is the all-day café, and the Purnama rooftop opens at 5 pm for drinks. Breakfast is included on our rate and is served à la carte as well as buffet, from 6:30 am to 10:30 am.",
    },
    {
      title: "Getting around",
      body: "Seminyak's restaurant strip on Jalan Kayu Aya is a ten minute walk. Canggu is 25 minutes by car, Ubud is about 90 minutes and Ngurah Rai airport is 40 minutes in normal traffic.",
    },
    {
      title: "Good to know",
      body: "The beach in front of the resort has a strong current in the afternoon and is not always swimmable. The pool more than makes up for it. Rooms on the lower garden floors are the quietest, upper ocean suites get the view but also the morning sun from 6 am.",
    },
  ],
  aboutCards: [
    { url: U("1571896349842-33c89424de2d"), caption: "A 60 m infinity pool, adults only" },
    { url: U("1507525428034-b723cf961d3e"), caption: "Two minutes on foot to the sand" },
    { url: U("1600334089648-b0d9d3028eb2"), caption: "Alila Spa, treatment suites" },
  ],

  // ─── Facilities ───
  // Grouped the way booking.com groups them, but each group can carry photos,
  // because "Spa" as a word tells you nothing and a picture of the spa does.
  facilityTop: [
    { icon: "waves", label: "Infinity pool" },
    { icon: "utensils", label: "Breakfast included" },
    { icon: "flower", label: "Spa and wellness" },
    { icon: "wifi", label: "Free WiFi", note: "Rated 9.4 by guests" },
    { icon: "umbrella", label: "Beach access" },
    { icon: "heart", label: "Adults only" },
  ],
  facilityGroups: [
    {
      key: "wellness",
      title: "Wellness",
      icon: "flower",
      photos: [U("1600334089648-b0d9d3028eb2"), U("1583416750470-965b2707b355")],
      items: [
        { label: "Spa and wellness centre" },
        { label: "Treatment suite for two" },
        { label: "Steam room" },
        { label: "Cold plunge" },
        { label: "Yoga pavilion", note: "Free classes, 7 am" },
        { label: "Fitness centre", note: "Open 24 hours" },
        { label: "Massage", note: "Extra charge" },
        { label: "Outdoor infinity pool" },
      ],
    },
    {
      key: "food",
      title: "Food and drink",
      icon: "utensils",
      photos: [U("1414235077428-338989a2e8c0"), U("1551632436-cbf8dd35adfa")],
      items: [
        { label: "Breakfast included", note: "Buffet and à la carte" },
        { label: "3 restaurants on site" },
        { label: "Rooftop bar" },
        { label: "Pool bar" },
        { label: "Room service", note: "24 hours" },
        { label: "Special diets on request" },
        { label: "Minibar in every room" },
        { label: "Coffee and tea maker" },
      ],
    },
    {
      key: "room",
      title: "In your room",
      icon: "bed",
      photos: [U("1582719478250-c89cae4dc85b"), U("1595576508898-0ad5c879a061")],
      items: [
        { label: "Air conditioning" },
        { label: "Balcony or terrace" },
        { label: "Flat-screen TV" },
        { label: "Safe" },
        { label: "Blackout curtains" },
        { label: "Wardrobe" },
        { label: "Sofa or day bed" },
        { label: "Desk" },
        { label: "Iron on request" },
        { label: "Bluetooth speaker" },
      ],
    },
    {
      key: "bathroom",
      title: "Bathroom",
      icon: "bath",
      photos: [U("1584622650111-993a426fbf0a"), U("1620626011761-996317b8d101")],
      items: [
        { label: "Rain shower" },
        { label: "Soaking tub", note: "Suites and villas" },
        { label: "Twin vanity" },
        { label: "Bathrobes and slippers" },
        { label: "Hairdryer" },
        { label: "Free toiletries" },
        { label: "Toilet" },
        { label: "Towels" },
      ],
    },
    {
      key: "outdoors",
      title: "Outdoors and views",
      icon: "trees",
      photos: [U("1584132967334-10e028bd69f7"), U("1520250497591-112f2f40a3f4")],
      items: [
        { label: "Beach access", note: "2 min walk" },
        { label: "Sun deck" },
        { label: "Sun loungers" },
        { label: "Garden" },
        { label: "Terrace" },
        { label: "Beach towels" },
        { label: "Outdoor dining area" },
      ],
    },
    {
      key: "services",
      title: "Services",
      icon: "concierge",
      photos: [],
      items: [
        { label: "24 hour front desk" },
        { label: "Concierge" },
        { label: "Laundry", note: "Extra charge" },
        { label: "Dry cleaning", note: "Extra charge" },
        { label: "Daily housekeeping" },
        { label: "Luggage storage" },
        { label: "Currency exchange" },
        { label: "Tour desk" },
      ],
    },
    {
      key: "internet",
      title: "Internet and parking",
      icon: "wifi",
      photos: [],
      items: [
        { label: "Free WiFi everywhere", note: "Rated 9.4 by guests" },
        { label: "Free private parking" },
        { label: "Electric vehicle charging" },
      ],
    },
    {
      key: "safety",
      title: "Safety",
      icon: "shield",
      photos: [],
      items: [
        { label: "Smoke alarms" },
        { label: "Fire extinguishers" },
        { label: "CCTV in common areas" },
        { label: "24 hour security" },
        { label: "In-room safe" },
        { label: "First aid kit" },
      ],
    },
  ],

  // ─── The four things people scroll back up to check ───
  stayBasics: {
    checkIn: "3:00 pm",
    checkOut: "12:00 pm",
    earlyCheckIn: { included: true },
    lateCheckOut: { included: false },
  },

  // ─── Rooms ───
  rooms: [
    {
      id: "deluxe-suite",
      name: "Deluxe Suite, garden wing",
      size: 55,
      sizeTip: "Bigger than 80% of rooms in Seminyak",
      beds: "1 King bed",
      sleeps: 2,
      view: "Garden view",
      mealPlan: "Breakfast included",
      refundable: true,
      refundLine: "Free cancellation until 7 days before check-in",
      inItinerary: true,
      priceDelta: 0,
      images: [
        U("1582719478250-c89cae4dc85b"),
        U("1578683010236-d716f9a3f461"),
        U("1584622650111-993a426fbf0a"),
        U("1596436889106-be35e843f974"),
      ],
      description:
        "The entry room and the one most travellers end up happy with. 55 square metres on the garden side, a private balcony looking into planted walkways rather than a corridor, and a soaking tub set beside the window. Quieter than the ocean suites and about a minute further from the pool.",
      amenities: [
        "Balcony", "Soaking tub", "Rain shower", "King bed", "Air conditioning",
        "Flat-screen TV", "Minibar", "Safe", "Coffee and tea maker", "Bathrobes",
      ],
    },
    {
      id: "ocean-suite",
      name: "Ocean Suite, upper floor",
      size: 64,
      sizeTip: null,
      beds: "1 King bed",
      sleeps: 2,
      view: "Ocean view",
      mealPlan: "Breakfast included",
      refundable: true,
      refundLine: "Free cancellation until 7 days before check-in",
      inItinerary: false,
      priceDelta: 4200,
      images: [
        U("1602002418082-a4443e081dd1"),
        U("1595576508898-0ad5c879a061"),
        U("1552321554-5fefe8c9ef14"),
        U("1571003123894-1f0594d2b5d9"),
      ],
      description:
        "Same layout as the Deluxe, nine square metres bigger and turned to face the water. The balcony catches the sunset. Worth knowing: the sun hits these rooms from about 6 am, so pull the blackout curtains if you like a slow morning.",
      amenities: [
        "Ocean view", "Balcony", "Soaking tub", "Rain shower", "King bed",
        "Air conditioning", "Flat-screen TV", "Minibar", "Safe", "Bathrobes",
      ],
    },
    {
      id: "pool-villa",
      name: "One Bedroom Pool Villa",
      size: 130,
      sizeTip: "The largest room type here",
      beds: "1 King bed",
      sleeps: 2,
      view: "Private garden",
      mealPlan: "Breakfast included",
      refundable: false,
      refundLine: "Non-refundable on this rate",
      inItinerary: false,
      priceDelta: 16800,
      images: [
        U("1618773928121-c32242e63f39"),
        U("1542314831-068cd1dbfeeb"),
        U("1620626011761-996317b8d101"),
        U("1564501049412-61c2a3083791"),
      ],
      description:
        "A walled villa with its own plunge pool, an outdoor shower and a separate living pavilion. Butler service is included. There are only 18 of these, and they go first over Christmas and New Year.",
      amenities: [
        "Private plunge pool", "Outdoor shower", "Living pavilion", "Butler service",
        "King bed", "Soaking tub", "Air conditioning", "Minibar", "Safe", "Bathrobes",
      ],
    },
  ],

  // ─── Food and drink on site ───
  restaurants: [
    {
      name: "Seasalt",
      cuisine: "Japanese and seafood",
      openFor: ["Lunch", "Dinner"],
      note: "On the beach side, book a sunset table",
      image: U("1414235077428-338989a2e8c0"),
      tags: ["pureveg"],
    },
    {
      name: "Kiosk",
      cuisine: "All day, Indonesian and European",
      openFor: ["Breakfast", "Lunch", "Dinner"],
      note: "Where breakfast is served",
      image: U("1551632436-cbf8dd35adfa"),
      tags: ["indian"],
    },
    {
      name: "Purnama Rooftop",
      cuisine: "Bar and small plates",
      openFor: ["Drinks", "Dinner"],
      note: "Opens 5 pm, best view in the resort",
      image: U("1540541338287-41700207dee6"),
    },
  ],
  breakfast: {
    included: true,
    style: ["Buffet", "À la carte"],
    timing: "6:30 am to 10:30 am",
    where: "Kiosk, ground floor",
    note: "Indian vegetarian options are available if you tell them the night before",
  },

  // ─── Neighbourhood ───
  nearby: {
    // Food leads. It is the first thing anyone plans around, and for our
    // travellers it is the thing a hotel page never answers honestly: what can
    // I actually eat here. So the three tags that matter are on every card.
    "Food and drink": [
      { name: "Queen's Tandoor", rating: 4.4, count: 3180, distance: "1.3 km", time: "5 min drive", image: U("1585937421612-70a008356fbe"), tags: ["indian"] },
      { name: "Gopal Vegetarian", rating: 4.6, count: 1240, distance: "1.6 km", time: "6 min drive", image: U("1631452180519-c014fe946bc7"), tags: ["indian", "pureveg"] },
      { name: "La Lucciola", rating: 4.5, count: 4120, distance: "700 m", time: "9 min walk", image: U("1414235077428-338989a2e8c0") },
      { name: "Potato Head Beach Club", rating: 4.4, count: 21050, distance: "900 m", time: "11 min walk", image: U("1551632436-cbf8dd35adfa") },
      { name: "Sisterfields", rating: 4.5, count: 7640, distance: "1.4 km", time: "5 min drive", image: U("1517248135467-4c7edcad34c4") },
      { name: "Motel Mexicola", rating: 4.4, count: 8990, distance: "1.1 km", time: "14 min walk", image: U("1552566626-52f8b828add9") },
      { name: "Bombay Chowk", rating: 4.3, count: 2140, distance: "1.9 km", time: "7 min drive", image: U("1567188040759-fb8a883dc6d8"), tags: ["indian"] },
      { name: "Sattvik Kitchen", rating: 4.5, count: 860, distance: "2.3 km", time: "8 min drive", image: U("1546069901-ba9599a7e63c"), tags: ["indian", "pureveg"] },
      { name: "Bikini Seminyak", rating: 4.4, count: 5320, distance: "1.2 km", time: "15 min walk", image: U("1466978913421-dad2ebd01d17") },
      { name: "Mama San", rating: 4.4, count: 6180, distance: "1.8 km", time: "6 min drive", image: U("1590846406792-0adc7f938f1d") },
    ],
    Attractions: [
      { name: "Petitenget Temple", rating: 4.5, count: 3241, distance: "400 m", time: "5 min walk", image: U("1537996194471-e657df975ab4") },
      { name: "Seminyak Beach", rating: 4.6, count: 18420, distance: "160 m", time: "2 min walk", image: U("1507525428034-b723cf961d3e") },
      { name: "Double Six Beach", rating: 4.5, count: 9877, distance: "2.1 km", time: "7 min drive", image: U("1559827260-dc66d52bef19") },
      { name: "Tanah Lot Temple", rating: 4.6, count: 52310, distance: "19 km", time: "45 min drive", image: U("1518548419970-58e3b4079ab2") },
      { name: "Echo Beach", rating: 4.4, count: 7210, distance: "8.6 km", time: "25 min drive", image: U("1505228395891-9a51e7e86bf6") },
      { name: "Uluwatu Temple", rating: 4.7, count: 61200, distance: "32 km", time: "60 min drive", image: U("1604999565976-8913ad2ddb7c") },
      { name: "Canggu rice fields", rating: 4.5, count: 4380, distance: "7.2 km", time: "22 min drive", image: U("1555400038-63f5ba517a47") },
      { name: "Batu Bolong Beach", rating: 4.4, count: 12840, distance: "6.8 km", time: "20 min drive", image: U("1502680390469-be75c86b636f") },
    ],
    Essentials: [
      { name: "Seminyak Village Mall", rating: 4.3, count: 6210, distance: "1.2 km", time: "4 min drive", image: U("1555529669-e69e7aa0ba9a") },
      { name: "Pepito Market", rating: 4.2, count: 1890, distance: "600 m", time: "8 min walk", image: U("1578916171728-46686eac8d58") },
      { name: "BIMC Hospital Kuta", rating: 4.1, count: 980, distance: "6.4 km", time: "18 min drive", image: U("1519494026892-80bbd2d6fd0d") },
      { name: "Guardian Pharmacy", rating: 4.0, count: 420, distance: "850 m", time: "11 min walk", image: U("1587854692152-cbe660dbde88") },
      { name: "BCA ATM, Jalan Kayu Aya", rating: null, count: null, distance: "500 m", time: "6 min walk", image: U("1526304640581-d334cdbbf45e") },
      { name: "Seminyak money changer", rating: 4.4, count: 1120, distance: "950 m", time: "12 min walk", image: U("1580519542036-c47de6196ba5") },
      { name: "Laundry Bali Express", rating: 4.2, count: 310, distance: "700 m", time: "9 min walk", image: U("1545173168-9f1947eebb7f") },
    ],
    Transport: [
      { name: "Ngurah Rai International Airport", rating: 4.2, count: 44120, distance: "13 km", time: "40 min drive", image: U("1436491865332-7a61a109cc05") },
      { name: "Seminyak Square taxi stand", rating: null, count: null, distance: "1.1 km", time: "14 min walk", image: U("1449965408869-eaa3f722e40d") },
      { name: "Kuta Beach shuttle stop", rating: null, count: null, distance: "4.8 km", time: "15 min drive", image: U("1494515843206-f3117d3f51b7") },
      { name: "Scooter rental, Jalan Petitenget", rating: 4.1, count: 640, distance: "550 m", time: "7 min walk", image: U("1558981806-ec527fa84c39") },
    ],
  },

  // ─── Ratings, from everyone who has one ───
  ratings: {
    // Ours leads. It is not an average of the others: it is what couples who
    // booked this hotel through us said afterwards, which is a different and
    // smaller group, and we say so on the card.
    sundays: { score: 4.7, outOf: 5, count: 86, label: "Loved by travellers", ours: true },
    booking: { score: 9.2, outOf: 10, count: 1840, label: "Superb" },
    google: { score: 4.6, outOf: 5, count: 3120, label: "Excellent" },
    tripadvisor: { score: 4.5, outOf: 5, count: 2410, label: "Excellent" },
  },
  reviewSummary: {
    text: "Almost everyone who writes about this hotel writes about the pool. It comes up in a third of the reviews, usually alongside the fact that the resort is adults only, which is what keeps it quiet enough to swim laps at six in the morning. Breakfast and the staff are the next two things people single out, and several travellers mention that the team remembered their names by the second day. Rooms are described as spotless, and the two minute walk to the beach comes up again and again as the reason to pick this stretch of Seminyak.\n\nThe complaints are consistent and small. Drinks at the rooftop bar are priced for tourists, several people say so. A few note that the sea in front has a strong current from the early afternoon and is not always swimmable, which surprises people who booked for the beach. And a handful of guests in the upper ocean suites mention the sun arriving at six in the morning if the blackout curtains are left open.",
    updated: "Updated 12 Sept 2026",
  },
  ratingBreakdown: {
    booking: [
      { label: "Cleanliness", score: 9.6 },
      { label: "Location", score: 9.4 },
      { label: "Staff", score: 9.3 },
      { label: "Comfort", score: 9.2 },
      { label: "Facilities", score: 9.0 },
      { label: "Value for money", score: 8.4 },
    ],
    google: [
      { label: "Rooms", score: 4.7 },
      { label: "Service", score: 4.6 },
      { label: "Location", score: 4.8 },
    ],
    tripadvisor: [
      { label: "Location", score: 4.8 },
      { label: "Service", score: 4.6 },
      { label: "Cleanliness", score: 4.7 },
      { label: "Sleep quality", score: 4.4 },
      { label: "Value", score: 4.2 },
    ],
    sundays: [
      { label: "Matched the photos", score: 4.8 },
      { label: "Privacy", score: 4.8 },
      { label: "Food for Indian tastes", score: 4.5 },
      { label: "Staff", score: 4.7 },
      { label: "Worth the money", score: 4.4 },
    ],
  },
  // How the stars are spread, for the bar chart in each breakup sheet.
  starSplit: {
    booking: [72, 20, 5, 2, 1],
    google: [74, 18, 5, 2, 1],
    tripadvisor: [68, 21, 7, 3, 1],
    sundays: [79, 15, 4, 1, 1],
  },
  reviews: [
    {
      id: "rv1",
      source: "sundays",
      name: "Ananya",
      meta: "Honeymoon · 5 nights · Mar 2026",
      score: 5,
      outOf: 5,
      date: "6 months ago",
      tags: ["Pool", "Breakfast", "Honeymoon set-up"],
      text: "We booked this through 30 Sundays and the honeymoon set-up was already done when we walked in, flowers on the bed and a note. The pool is the reason to stay here. We swam at 6 am every day and had it to ourselves. Breakfast à la carte is much better than the buffet, ask for the eggs.",
      verified: true,
    },
    {
      id: "rv2",
      source: "booking",
      name: "Marieke",
      meta: "Netherlands · 4 nights",
      score: 9.6,
      outOf: 10,
      date: "2 months ago",
      tags: ["Location", "Cleanliness"],
      text: "Spotless rooms and a two minute walk to the beach. The staff remembered our names by the second day. Only small complaint is that drinks at the rooftop are priced for tourists.",
      verified: true,
    },
    {
      id: "rv3",
      source: "google",
      name: "Karthik R",
      meta: "Local Guide · 74 reviews",
      score: 5,
      outOf: 5,
      date: "3 weeks ago",
      tags: ["Staff", "Quiet"],
      text: "Adults only makes all the difference. Came here after three nights in Kuta and it was like a different island. The garden wing rooms are quieter than the ocean ones if you are a light sleeper.",
      verified: false,
    },
    {
      id: "rv4",
      source: "sundays",
      name: "Meher",
      meta: "Anniversary · 4 nights · Jan 2026",
      score: 4,
      outOf: 5,
      date: "8 months ago",
      tags: ["Spa", "Beach current"],
      text: "The spa treatment for two that came with our package was excellent. One thing nobody told us: the sea in front is not really swimmable in the afternoon, the current is strong. We used the pool instead and it was fine, but plan for it.",
      verified: true,
    },
    {
      id: "rv5",
      source: "mmt",
      name: "Sneha P",
      meta: "3 nights",
      score: 4.5,
      outOf: 5,
      date: "5 months ago",
      tags: ["Breakfast", "Value"],
      text: "Good property, well maintained. Breakfast spread is large and they do have Indian options if you ask. Airport transfer took 55 minutes, not 40, so leave early for your flight.",
      verified: true,
    },
    {
      id: "rv6",
      source: "tripadvisor",
      name: "JennyT_UK",
      meta: "United Kingdom · 31 contributions",
      score: 5,
      outOf: 5,
      date: "1 month ago",
      tags: ["Pool", "Quiet"],
      text: "Third stay here and it has not slipped. The infinity pool at sunset is worth the trip on its own. Book a garden suite, the view from the ocean rooms is nice but you spend your time by the pool anyway.",
      verified: false,
    },
  ],

  // ─── Policies ───
  checkIn: "3:00 pm",
  checkOut: "12:00 pm",
  policies: [
    {
      key: "checkin",
      icon: "login",
      title: "Check-in and check-out",
      lines: [
        "Check-in from 3:00 pm, check-out until 12:00 pm.",
        "Early check-in and late check-out are subject to availability and may carry a fee.",
        "Front desk is open 24 hours.",
      ],
    },
    {
      key: "cancel",
      icon: "info",
      title: "Cancellation",
      lines: [
        "Free cancellation until 7 days before check-in on refundable rates.",
        "Inside 7 days, one night is charged.",
        "Villa rates on this itinerary are non-refundable.",
      ],
    },
    {
      key: "children",
      icon: "users",
      title: "Children and extra beds",
      lines: [
        "This is an adults only resort. Guests must be 16 or older.",
        "Extra beds are not available.",
      ],
    },
    {
      key: "ids",
      icon: "idcard",
      title: "ID accepted at check-in",
      lines: [
        "Passport for all international guests.",
        "The same passport used for the visa on arrival.",
      ],
    },
    {
      key: "payment",
      icon: "wallet",
      title: "Payment and deposits",
      lines: [
        "A card is taken at check-in to cover incidentals.",
        "Visa, Mastercard and Amex accepted. Cash in IDR accepted at the front desk.",
        "Indonesian government tax and service charge are already in your package price.",
      ],
    },
    {
      key: "pets",
      icon: "paw",
      title: "Pets",
      lines: ["Pets are not allowed."],
    },
    {
      key: "smoking",
      icon: "ban",
      title: "Smoking",
      lines: [
        "All rooms are non-smoking.",
        "Smoking is allowed on balconies and in the designated garden area.",
      ],
    },
  ],

  // ─── What this hotel would replace ───
  currentStay: {
    name: "Bali Garden Beach Resort",
    stars: 4,
    score: 8.1,
    room: "Deluxe Room",
    mealPlan: "Breakfast included",
    image: U("1596436889106-be35e843f974"),
    total: 96400,
  },
  total: 124800,

  // ─── The property's own notes ───
  // Not policies, and not marketing. These are the things the hotel is
  // obliged to tell you and that people are annoyed to discover on arrival.
  legal: [
    "The beach in front of the resort is public. Sun loungers on the sand are not the resort's and are charged separately.",
    "Construction is due on the plot behind the garden wing from January 2027. Work is limited to 9 am to 5 pm on weekdays.",
    "The rooftop bar is closed on Nyepi, the Balinese day of silence. The whole island shuts down for 24 hours and nobody may leave the property.",
    "Indonesian government tax of 11 percent and a 10 percent service charge are already included in your package price.",
    "This property is licensed as a tourist accommodation under Bali regulation 2019/15.",
    "Guests must be 16 or older. Photo ID is checked at check-in for every guest.",
  ],

  // The honest bit as it is shown: one or two lines, the way you would say it
  // to a friend. The list below stays for anything that wants the detail.
  honestNote: "Get to the pool before 9 am and it is all yours. The sea out front is rarely swimmable after 2 pm.",

  honest: [
    {
      icon: "waves",
      good: true,
      title: "The pool is empty before 9 am",
      short: "Pool is empty before 9 am",
      body: "Almost nobody is up. If you want the sixty metre pool to yourself, that is the window, and it is the single thing our travellers write about most.",
    },
    {
      icon: "bed",
      good: true,
      title: "Garden rooms are bigger than ocean suites",
      short: "Garden rooms beat ocean suites",
      body: "By about nine square metres. The ocean suites buy you the view and the sunrise; the garden wing buys you the space and the quiet.",
    },
    {
      icon: "waves",
      title: "The sea in front is not always swimmable",
      short: "Sea in front is rarely swimmable",
      body: "From about 2 pm the current picks up and the resort puts out red flags. Mornings are usually fine. Most travellers swim in the pool in the afternoon and walk on the beach at sunset.",
    },
    {
      icon: "sun",
      title: "Ocean suites get the sun at 6 am",
      short: "Ocean suites get the sun at 6 am",
      body: "The upper floors face east over the water. Lovely if you are up for it, less so if you are not. The blackout curtains do work, but you have to remember to close them.",
    },
    {
      icon: "wallet",
      title: "Drinks at the rooftop are priced for tourists",
      short: "Rooftop drinks cost 3x beach bars",
      body: "Around ₹900 for a cocktail. Seminyak's own bars are a ten minute walk and roughly half that. Several reviews mention it.",
    },
    {
      icon: "hammer",
      title: "Building work behind the garden wing from Jan 2027",
      short: "Building work nearby till Mar 2027",
      body: "On the plot behind, not on resort grounds. Limited to 9 am to 5 pm on weekdays. If your dates fall in that window we will move you to the ocean side at no cost.",
    },
    {
      icon: "users",
      title: "Adults only, with no exceptions",
      short: "Adults only, no exceptions",
      body: "Guests must be 16 or older, and that includes visitors. If family are joining you for a day, you will need to meet them off the property.",
    },
  ],

  // ─── Where else you could sleep ───
  // A hotel page that ends in a full stop leaves you with one option. These
  // are the three we would put in this itinerary instead, with the price
  // difference, because that is the decision underneath the question.
  similar: [
    {
      id: "w-seminyak", name: "W Bali Seminyak", stars: 5, score: 9.0, source: "booking",
      area: "Seminyak Beach", delta: 12400,
      image: U("1566073771259-6a8506099945"),
      why: "Livelier, right on the beach",
    },
    {
      id: "katamama", name: "Katamama Suites", stars: 5, score: 9.4, source: "booking",
      area: "Petitenget", delta: 3100,
      image: U("1564501049412-61c2a3083791"),
      why: "Smaller, 58 suites, next door to Potato Head",
    },
    {
      id: "double-six", name: "Double-Six Luxury Hotel", stars: 5, score: 8.8, source: "booking",
      area: "Double Six Beach", delta: -8600,
      image: U("1571003123894-1f0594d2b5d9"),
      why: "Rooftop pool, and cheaper than this one",
    },
  ],

  // ─── The questions people actually ask us ───
  faqs: [
    {
      q: "Is the beach in front swimmable?",
      a: "In the morning, usually yes. From about 2 pm the current picks up and the resort puts out red flags. Most travellers swim in the pool in the afternoon and walk on the beach at sunset.",
    },
    {
      q: "Is breakfast included on our rate?",
      a: "Yes, for both of you, every morning. It is served at Kiosk from 6:30 am to 10:30 am, buffet and à la carte. If you have an early flight they will pack a breakfast box on request.",
    },
    {
      q: "How far is it from the airport?",
      a: "13 km, about 40 minutes in normal traffic and closer to an hour between 4 pm and 7 pm. Your airport transfer is included in this itinerary.",
    },
    {
      q: "Can we get a room next to friends travelling with us?",
      a: "Tell your trip manager and we will request adjoining rooms. The resort confirms it on the day, and in the garden wing it is usually possible.",
    },
    {
      q: "Is there a dress code anywhere?",
      a: "Only at Purnama Rooftop after 7 pm, which asks for smart casual. No beachwear, and closed shoes for men.",
    },
  ],
};

// Photo categories in the order the gallery shows them, counted from the
// photos themselves so the two can never disagree.
export function galleryCategories(hotel = HOTEL) {
  const counts = {};
  hotel.photos.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
  const order = ["Rooms", "Pool", "Bathroom", "Dining", "Spa", "Common areas", "Exterior"];
  return [
    { key: "All", label: "All", count: hotel.photos.length },
    ...order.filter((k) => counts[k]).map((k) => ({ key: k, label: k, count: counts[k] })),
  ];
}

// ─── Putting a nearby place on the map ───
// We know how far each one is, not which direction. The bearing is hashed off
// the name so the ring spreads them out and a place never moves between
// visits, which is the same approach the change-hotel map takes.
function ringSpot(centre, name, km) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  const bearing = ((Math.abs(h) % 360) * Math.PI) / 180;
  return {
    lat: centre.lat + (km * Math.cos(bearing)) / 111.32,
    lng: centre.lng + (km * Math.sin(bearing)) / (111.32 * Math.cos((centre.lat * Math.PI) / 180)),
  };
}

// Distances are written the way a person says them ("400 m", "2.1 km").
function kmOf(distance) {
  const n = parseFloat(distance);
  return /m\b/.test(distance) && !/km/.test(distance) ? n / 1000 : n;
}

// Every nearby place carries its own coordinates from here on.
export function placeNearby(hotel) {
  const out = {};
  Object.entries(hotel.nearby).forEach(([group, list]) => {
    out[group] = list.map((n) => ({ ...n, group, ...ringSpot(hotel.coords, n.name, kmOf(n.distance)) }));
  });
  return out;
}

// ─── Opening a similar hotel ───
//
// Only one hotel is written out in full here, so tapping a similar one shows
// that hotel's identity (its name, stars, score, area, lead photo and what the
// swap costs) over the same body of content. Enough to prove the tap works and
// that the page is reusable; the depth behind it is this one hotel's until a
// real catalogue is wired in.
export function variantOf(base, alt) {
  if (!alt) return base;
  const others = [
    { id: base.id, name: base.name, stars: base.stars, score: base.ratings.booking.score,
      source: "booking", area: base.neighbourhood, delta: -alt.delta,
      image: base.photos[0].url, why: "The one in your itinerary now" },
    ...base.similar.filter((h) => h.id !== alt.id).map((h) => ({ ...h, delta: h.delta - alt.delta })),
  ];
  return {
    ...base,
    id: alt.id,
    name: alt.name,
    stars: alt.stars,
    neighbourhood: alt.area,
    photos: [{ url: alt.image, category: "Exterior", caption: alt.name }, ...base.photos.slice(1)],
    video: { ...base.video, poster: alt.image },
    ratings: { ...base.ratings, booking: { ...base.ratings.booking, score: alt.score } },
    total: base.total + alt.delta,
    currentStay: base.currentStay,
    similar: others,
  };
}
