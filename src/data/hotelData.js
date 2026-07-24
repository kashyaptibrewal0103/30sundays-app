// ─── Hotel Data Layer ───
// Deterministic hotel generation for the 30 Sundays app

const CDN = "https://cdn.30sundays.club/app_content";

// ─── Deterministic pseudo-random (same pattern as flightData.js) ───
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Hotel name pools by destination ───
const hotelNames = {
  Bali: [
    "Anana Ecological Resort", "Alila Ubud", "The Mulia Bali", "Viceroy Bali",
    "Padma Resort Ubud", "Hanging Gardens of Bali", "Capella Ubud", "W Bali Seminyak",
    "Four Seasons Sayan", "Ayana Resort", "The Ritz-Carlton Bali", "Bulgari Resort Bali",
    "COMO Uma Canggu", "Potato Head Suites", "Hotel Indigo Bali",
  ],
  Vietnam: [
    "Sofitel Legend Metropole", "Hotel de l'Opera Hanoi", "JW Marriott Hanoi",
    "Melia Hanoi", "Lotte Hotel Hanoi", "InterContinental Hanoi",
    "Peridot Grand Luxury", "Pan Pacific Hanoi", "Silk Path Grand",
    "La Siesta Premium Hang Be", "Apricot Hotel", "Oriental Jade Hotel",
  ],
  Thailand: [
    "Mandarin Oriental Bangkok", "The Siam Hotel", "Rosewood Bangkok",
    "Banyan Tree Bangkok", "Amanpuri Phuket", "Six Senses Yao Noi",
    "Rayavadee Krabi", "Four Seasons Chiang Mai", "137 Pillars House",
    "Anantara Riverside", "Como Metropolitan Bangkok", "The Peninsula Bangkok",
  ],
  Maldives: [
    "Soneva Fushi", "One&Only Reethi Rah", "St. Regis Maldives",
    "Waldorf Astoria Maldives", "Anantara Kihavah", "Six Senses Laamu",
    "COMO Cocoa Island", "Baros Maldives", "Conrad Maldives Rangali",
    "Niyama Private Islands", "Velaa Private Island", "Joali Maldives",
  ],
  "Sri Lanka": [
    "Amanwella Tangalle", "Ceylon Tea Trails", "Heritance Kandalama",
    "Jetwing Lighthouse", "Cape Weligama", "Wild Coast Tented Lodge",
    "Uga Bay Pasikudah", "Galle Face Hotel", "Cinnamon Grand Colombo",
    "Shangri-La Hambantota", "Anantara Peace Haven", "Thotalagala Plantation",
  ],
  "New Zealand": [
    "The Lodge at Kauri Cliffs", "Huka Lodge Taupo", "Eichardt's Private Hotel",
    "The Rees Queenstown", "Matakauri Lodge", "Blanket Bay Glenorchy",
    "Sofitel Auckland Viaduct", "Hotel DeBrett Auckland", "QT Queenstown",
    "The George Christchurch", "Millbrook Resort", "Aro Ha Wellness Retreat",
  ],
};

// ─── Neighbourhood pools by destination ───
const neighbourhoods = {
  Bali: {
    Ubud: ["Ubud Centre", "Tegallalang", "Monkey Forest Road", "Campuhan Ridge"],
    Seminyak: ["Petitenget", "Oberoi Street", "Eat Street", "Double Six Beach"],
    Canggu: ["Batu Bolong", "Echo Beach", "Berawa", "Pererenan"],
    Sanur: ["Sanur Beach", "Mertasari", "Sindhu Beach"],
    "Nusa Dua": ["ITDC Complex", "Tanjung Benoa", "Sawangan"],
    "Nusa Penida": ["Crystal Bay", "Toyapakeh", "Banjar Nyuh"],
    Kintamani: ["Lake Batur", "Penelokan", "Batur Village"],
    Amed: ["Lipah Beach", "Jemeluk Bay", "Japanese Wreck"],
    Uluwatu: ["Bingin Beach", "Padang Padang", "Dreamland"],
    Sidemen: ["Sidemen Valley", "Iseh Village"],
    Munduk: ["Munduk Village", "Lake Tamblingan"],
    Lovina: ["Lovina Beach", "Kalibukbuk"],
    Pemuteran: ["Pemuteran Bay", "Menjangan Island"],
  },
  Vietnam: {
    Hanoi: ["Old Quarter", "Hoan Kiem", "West Lake", "French Quarter"],
    "Ha Long": ["Bai Chay", "Ha Long Bay", "Tuan Chau Island"],
    HCMC: ["District 1", "District 3", "Phu My Hung", "Thu Duc"],
    "Ho Chi Minh City": ["District 1", "District 3", "Phu My Hung"],
    "Da Nang": ["My Khe Beach", "Han River", "Son Tra Peninsula"],
    "Hoi An": ["Old Town", "An Bang Beach", "Cua Dai"],
    "Phu Quoc": ["Long Beach", "Ong Lang", "Duong Dong"],
    "Ninh Binh": ["Tam Coc", "Trang An", "Bich Dong"],
    "Phong Nha": ["Phong Nha Town", "Son Trach"],
  },
  Thailand: {
    Bangkok: ["Sukhumvit", "Silom", "Riverside", "Siam"],
    Phuket: ["Patong Beach", "Kata Beach", "Kamala", "Bang Tao"],
    "Chiang Mai": ["Old City", "Nimmanhaemin", "Riverside", "Night Bazaar"],
    "Chiang Rai": ["Clock Tower", "White Temple Area"],
    Krabi: ["Ao Nang Beach", "Railay", "Klong Muang"],
    "Koh Samui": ["Chaweng Beach", "Lamai", "Bophut", "Maenam"],
    Pai: ["Pai Walking Street", "Pai Canyon"],
  },
  Maldives: {
    Malé: ["North Malé Atoll", "South Malé Atoll", "Baa Atoll", "Ari Atoll"],
    "Baa Atoll": ["Baa Atoll"],
    "S.Ari": ["South Ari Atoll"],
    Addu: ["Addu Atoll"],
    Fuvahmulah: ["Fuvahmulah Island"],
  },
  "Sri Lanka": {
    Colombo: ["Fort", "Pettah", "Galle Face", "Cinnamon Gardens"],
    Kandy: ["Kandy Lake", "Peradeniya", "Hantana"],
    Ella: ["Ella Town", "Ravana Falls", "Little Adam's Peak"],
    Mirissa: ["Mirissa Beach", "Coconut Tree Hill", "Secret Beach"],
    Sigiriya: ["Sigiriya Village", "Dambulla"],
    Galle: ["Galle Fort", "Unawatuna", "Jungle Beach"],
    Trincomalee: ["Nilaveli Beach", "Uppuveli", "Fort Frederick"],
    Yala: ["Tissamaharama", "Kataragama"],
  },
  "New Zealand": {
    Auckland: ["Viaduct Harbour", "Ponsonby", "CBD", "Britomart"],
    Queenstown: ["CBD", "Frankton", "Arthurs Point", "Fernhill"],
    Rotorua: ["Lakefront", "Ohinemutu", "Whakarewarewa"],
    Waiheke: ["Oneroa", "Onetangi", "Surfdale"],
    Christchurch: ["CBD", "Hagley Park", "Sumner", "Merivale"],
    Milford: ["Milford Sound", "Te Anau"],
    Wanaka: ["Wanaka Lakefront", "Albert Town"],
  },
};

// ─── Meal plan options ───
const mealPlans = [
  "Only Room", "Breakfast included", "Breakfast + Dinner", "All Inclusive",
];

// ─── Image category tags ───
const imageCategories = ["Room", "Bathroom", "Pool", "Reception", "Restaurant", "Exterior", "Lobby", "Spa", "Beach", "Garden"];

// ─── Room type templates ───
const roomTemplates = [
  { name: "Sheraton Club Double Room", bedType: "1 Double bed", size: 30, amenities: ["Jacuzzi"] },
  { name: "Executive Suite", bedType: "1 Large double bed", size: 60, amenities: ["Balcony", "Lounge Access"] },
  { name: "Deluxe Double Room", bedType: "1 Large double bed", size: 45, amenities: ["City View"] },
  { name: "Superior Twin Room", bedType: "2 Single beds", size: 35, amenities: [] },
  { name: "Premium Suite", bedType: "1 King bed", size: 75, amenities: ["Jacuzzi", "Sea View", "Balcony"] },
  { name: "Classic Room", bedType: "1 Double bed", size: 25, amenities: [] },
  { name: "Grand Deluxe Room", bedType: "1 King bed", size: 50, amenities: ["Balcony", "Minibar"] },
  { name: "Private Pool Villa", bedType: "1 King bed", size: 120, amenities: ["Private Pool", "Garden", "Butler Service"] },
  { name: "Honeymoon Suite", bedType: "1 King bed", size: 80, amenities: ["Jacuzzi", "Sea View", "Champagne"] },
  { name: "Garden View Room", bedType: "1 Double bed", size: 32, amenities: ["Garden View"] },
];

// ─── Amenity pool ───
const allAmenities = [
  "Breakfast", "Spa", "Swimming pool", "Indoor Games", "Gym",
  "Airport Transfer", "Free WiFi", "Beachfront", "Restaurant",
  "Bar", "Room Service", "Concierge", "Laundry", "Parking",
];

// ─── Hotel image pools (reuse CDN images by destination) ───
const hotelImagePools = {
  Bali: [
    `${CDN}/bali/bali_swing_experience_1.jpg`,
    `${CDN}/bali/tree_house_nusa_penida_3.jpg`,
    `${CDN}/bali/tegallalang_rice_fields_4.jpg`,
    `${CDN}/bali/banyumala_waterfall_56.jpg`,
    `${CDN}/bali/handara_gate_63.jpg`,
    `${CDN}/bali/kelingking_beach_65.jpg`,
  ],
  Vietnam: [
    `${CDN}/vietnam/kissing_bridge_495.jpg`,
    `${CDN}/vietnam/xuong_island_496.jpg`,
    `${CDN}/vietnam/fingernail_island_497.jpg`,
    `${CDN}/vietnam/nem_cuon_cooking_class_ha_long_bay_498.jpg`,
    `${CDN}/vietnam/sunrise_tai_chi_ha_long_bay_499.jpg`,
    `${CDN}/vietnam/kayaking_halong_bay_500.jpg`,
    `${CDN}/vietnam/sapa_valley_501.jpg`,
    `${CDN}/vietnam/hoi_an_memories_show_502.jpg`,
  ],
  Thailand: [
    `${CDN}/thailand/pileh_lagoon_439.jpg`,
    `${CDN}/thailand/big_buddha_temple_koh_samui_459.jpg`,
    `${CDN}/thailand/long_beach_koh_phi_phi_468.jpg`,
    `${CDN}/thailand/angel_waterfall_park_493.jpg`,
    `${CDN}/thailand/dolphin_show_phuket_494.jpg`,
    `${CDN}/Thailand/Activities/Safari%20World.jpeg`,
  ],
  Maldives: [
    `${CDN}/hotels/maldives/hero-images/11_hero.webp`,
    `${CDN}/hotels/maldives/hero-images/12_hero.webp`,
    `${CDN}/hotels/maldives/hero-images/13_hero.webp`,
    `${CDN}/hotels/maldives/hero-images/15_hero.webp`,
    `${CDN}/hotels/maldives/hero-images/16_hero.webp`,
    `${CDN}/hotels/maldives/hero-images/18_hero.webp`,
  ],
  "Sri Lanka": [
    `${CDN}/srilanka/taprobane_island_viewpoint_SLA00057.jpg`,
    `${CDN}/srilanka/hummanaya_blowhole_SLA00058.jpg`,
    `${CDN}/srilanka/snorkelling_south_coast_SLA00059.jpg`,
    `${CDN}/srilanka/hot_air_balloon_flight_sigiriya_SLA00062.jpg`,
    `${CDN}/srilanka/cinnamon_island_bentota_SLA00063.jpg`,
    `${CDN}/srilanka/galle_lighthouse_SLA00066.jpg`,
  ],
  "New Zealand": [
    `${CDN}/new_zealand/moke_lake_NZA00054.jpg`,
    `${CDN}/new_zealand/lake_taupo_NZA00055.jpg`,
    `${CDN}/new_zealand/huka_falls_NZA00056.jpg`,
    `${CDN}/new_zealand/te_anau_NZA00060.jpg`,
    `${CDN}/new_zealand/lake_matheson_NZA00064.jpg`,
    `${CDN}/new_zealand/lake_hawea_NZA00066.jpg`,
  ],
};

const pick = (arr, i) => arr[Math.abs(i) % arr.length];

// ─── Format price with Indian commas ───
export function formatHotelPrice(num) {
  const str = num.toString();
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== "") {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  return lastThree;
}

// ─── Generate hotels for a city ───
export function generateHotelsForCity(city, destination, checkIn, checkOut, nights) {
  const seed = hashStr(`${city}-${destination}-${checkIn}`);
  const rand = seededRandom(seed);

  const names = hotelNames[destination] || hotelNames.Bali;
  const imgs = hotelImagePools[destination] || hotelImagePools.Bali;
  const cityNeighbourhoods = neighbourhoods[destination]?.[city] || ["City Centre", "Old Town", "Beach Area"];

  const count = 6 + Math.floor(rand() * 5); // 6-10 hotels
  const hotels = [];

  for (let i = 0; i < count; i++) {
    const hotelSeed = seededRandom(seed + i * 1000);

    // Pick hotel name (avoid duplicates)
    const name = pick(names, i);

    // Stars: mostly 4-5, some 3
    const starRoll = hotelSeed();
    const stars = starRoll > 0.7 ? 5 : starRoll > 0.2 ? 4 : 3;

    // Booking score: correlated with stars
    const baseScore = stars === 5 ? 8.8 : stars === 4 ? 8.0 : 7.2;
    const bookingScore = Math.round((baseScore + hotelSeed() * 1.2) * 10) / 10;

    // Review count
    const reviewCount = 100 + Math.floor(hotelSeed() * 1400);

    // Neighbourhood
    const neighbourhood = pick(cityNeighbourhoods, i);

    // Address
    const streetNum = 10 + Math.floor(hotelSeed() * 190);
    const address = `${streetNum} ${neighbourhood} Road, ${city}`;

    // Distance from city center (0.5 - 8 km)
    const distanceFromCenter = Math.round((0.5 + hotelSeed() * 7.5) * 10) / 10;

    // Hotel images with categories (8 per hotel)
    const hotelImages = [];
    const imgCategoryAssignment = ["Exterior", "Room", "Pool", "Room", "Restaurant", "Bathroom", "Lobby", "Spa"];
    for (let j = 0; j < 8; j++) {
      hotelImages.push({
        url: pick(imgs, i * 8 + j),
        category: imgCategoryAssignment[j] || pick(imageCategories, i + j),
      });
    }

    // Amenities (5-8 amenities per hotel)
    const amenityCount = 5 + Math.floor(hotelSeed() * 4);
    const hotelAmenities = [];
    const shuffled = [...allAmenities].sort(() => hotelSeed() - 0.5);
    for (let j = 0; j < amenityCount && j < shuffled.length; j++) {
      hotelAmenities.push(shuffled[j]);
    }
    // Always include Breakfast and Free WiFi for 4+ star
    if (stars >= 4 && !hotelAmenities.includes("Breakfast")) hotelAmenities.unshift("Breakfast");
    if (!hotelAmenities.includes("Free WiFi")) hotelAmenities.push("Free WiFi");

    // Check-in/out times
    const checkInTime = hotelSeed() > 0.5 ? "2 PM" : "3 PM";
    const checkOutTime = hotelSeed() > 0.5 ? "11 AM" : "12 PM";

    // Transfers: hotels far from the centre sit off shared (SIC) routes
    const sharedTransfers = distanceFromCenter <= 5;

    // Early check-in / late checkout included at some hotels
    const earlyCheckIn = hotelSeed() > 0.7;
    const lateCheckOut = hotelSeed() > 0.7;

    // Refundability: a real mix so both cases show up in every list
    const freeCancellation = hotelSeed() > 0.4;

    // Base price per night (correlated with stars)
    const basePriceMap = { 3: 2000, 4: 3500, 5: 6000 };
    const basePrice = basePriceMap[stars] + Math.floor(hotelSeed() * basePriceMap[stars]);

    // Generate 2-4 room types
    const roomCount = 2 + Math.floor(hotelSeed() * 2);
    const rooms = [];
    const usedTemplates = new Set();

    for (let r = 0; r < roomCount; r++) {
      let templateIdx;
      do {
        templateIdx = Math.floor(hotelSeed() * roomTemplates.length);
      } while (usedTemplates.has(templateIdx) && usedTemplates.size < roomTemplates.length);
      usedTemplates.add(templateIdx);

      const template = roomTemplates[templateIdx];
      const priceMultiplier = 0.8 + hotelSeed() * 0.8; // 0.8x to 1.6x
      const roomPrice = Math.round((basePrice * priceMultiplier) / 100) * 100;
      const taxPerNight = Math.round(roomPrice * 0.03); // ~3% tax

      // Room images (4 per room)
      const roomImages = [];
      for (let j = 0; j < 4; j++) {
        roomImages.push(pick(imgs, i * 10 + r * 4 + j + 3));
      }

      // Meal plan (deterministic per room)
      const mealIdx = Math.floor(hotelSeed() * mealPlans.length);
      const mealPlan = stars >= 4 && mealIdx === 0 ? mealPlans[1] : mealPlans[mealIdx]; // 4+ star rarely "Only Room"

      rooms.push({
        id: `${city}-${i}-room-${r}`,
        name: template.name,
        bedType: template.bedType,
        size: template.size,
        amenities: template.amenities,
        images: roomImages,
        pricePerNight: roomPrice,
        taxPerNight,
        mealPlan,
      });
    }

    // Sort rooms by price
    rooms.sort((a, b) => a.pricePerNight - b.pricePerNight);

    // Hotel-level view tags for quick filters
    const viewTags = [];
    if (hotelAmenities.includes("Swimming pool")) viewTags.push("Pool");
    if (hotelAmenities.includes("Beachfront")) viewTags.push("Sea view");
    if (hotelAmenities.includes("Spa")) viewTags.push("Hot tub");
    if (stars === 5) viewTags.push("5 star");
    if (bookingScore >= 9) viewTags.push("9+ rated");
    // Randomly add more views
    if (hotelSeed() > 0.6) viewTags.push("Mountain view");
    if (hotelSeed() > 0.5 && !viewTags.includes("Sea view")) viewTags.push("Sea view");
    const hasPrivatePool = rooms.some(r => r.amenities.includes("Private Pool"));
    if (hasPrivatePool) viewTags.push("Private pool");

    hotels.push({
      id: `${city}-hotel-${i}`,
      name,
      stars,
      freeCancellation,
      sharedTransfers,
      earlyCheckIn,
      lateCheckOut,
      bookingScore: Math.min(bookingScore, 9.8),
      reviewCount,
      neighbourhood,
      address,
      images: hotelImages,
      checkInTime,
      checkOutTime,
      amenities: hotelAmenities,
      rooms,
      distanceFromCenter,
      viewTags,
      // Convenience: cheapest room price for listing display
      pricePerNight: rooms[0].pricePerNight,
      roomType: rooms[0].name,
      bedSummary: rooms[0].bedType,
      mealPlan: rooms[0].mealPlan,
    });
  }

  // Sort by price (default)
  return hotels.sort((a, b) => a.pricePerNight - b.pricePerNight);
}

// ─── Get stay info from itinerary ───
export function getStayInfo(itinerary, stayIndex) {
  const days = itinerary.days;
  if (!days || !days[stayIndex]) return null;

  const stay = days[stayIndex];
  let nightsBefore = 0;
  for (let i = 0; i < stayIndex; i++) {
    nightsBefore += days[i].n;
  }

  // Calculate dates (same base date as flights: Jun 20)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const baseDay = 20; // Jun 20
  const baseMonth = 5; // June (0-indexed)
  const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

  function addDays(startDay, startMonth, numDays) {
    let d = startDay + numDays;
    let m = startMonth;
    while (d > daysInMonth[m]) {
      d -= daysInMonth[m];
      m = (m + 1) % 12;
    }
    return `${months[m]} ${d}`;
  }

  const checkIn = addDays(baseDay, baseMonth, nightsBefore);
  const checkOut = addDays(baseDay, baseMonth, nightsBefore + stay.n);

  return {
    city: stay.city,
    nights: stay.n,
    checkIn,
    checkOut,
    dayRange: `Day ${nightsBefore + 1}–${nightsBefore + stay.n}`,
    stayIndex,
  };
}

// ─── Review scores generator ───
export function getHotelReviews(hotelId) {
  const seed = hashStr(hotelId + "-reviews");
  const rand = seededRandom(seed);

  const cleanliness = Math.round((7.5 + rand() * 2.3) * 10) / 10;
  const comfort = Math.round((7.5 + rand() * 2.3) * 10) / 10;
  const facilities = Math.round((7.0 + rand() * 2.5) * 10) / 10;

  return { cleanliness, comfort, facilities };
}
