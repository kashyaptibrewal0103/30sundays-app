// ─── Flight Data Layer ───
// Deterministic flight generation for the 30 Sundays app

// ─── Airlines ───
export const airlines = [
  { code: "AI", name: "Air India", type: "full-service", alliance: "Star Alliance" },
  { code: "6E", name: "IndiGo", type: "lcc", alliance: null },
  { code: "SG", name: "SpiceJet", type: "lcc", alliance: null },
  { code: "UK", name: "Vistara", type: "full-service", alliance: null },
  { code: "IX", name: "Air India Express", type: "lcc", alliance: null },
  { code: "QZ", name: "AirAsia", type: "lcc", alliance: null },
  { code: "TG", name: "Thai Airways", type: "full-service", alliance: "Star Alliance" },
  { code: "SQ", name: "Singapore Airlines", type: "full-service", alliance: "Star Alliance" },
  { code: "EK", name: "Emirates", type: "full-service", alliance: null },
  { code: "MH", name: "Malaysia Airlines", type: "full-service", alliance: "Oneworld" },
  { code: "VJ", name: "VietJet Air", type: "lcc", alliance: null },
  { code: "VN", name: "Vietnam Airlines", type: "full-service", alliance: "SkyTeam" },
  { code: "UL", name: "SriLankan Airlines", type: "full-service", alliance: "Oneworld" },
  { code: "NZ", name: "Air New Zealand", type: "full-service", alliance: "Star Alliance" },
  { code: "GA", name: "Garuda Indonesia", type: "full-service", alliance: "SkyTeam" },
  { code: "FD", name: "Thai AirAsia", type: "lcc", alliance: null },
  { code: "AK", name: "AirAsia", type: "lcc", alliance: null },
  { code: "QR", name: "Qatar Airways", type: "full-service", alliance: "Oneworld" },
];

// ─── Airports ───
export const airports = {
  // India
  IDR: { city: "Indore", country: "India", code: "IDR" },
  DEL: { city: "Delhi", country: "India", code: "DEL" },
  BOM: { city: "Mumbai", country: "India", code: "BOM" },
  BLR: { city: "Bengaluru", country: "India", code: "BLR" },
  MAA: { city: "Chennai", country: "India", code: "MAA" },
  CCU: { city: "Kolkata", country: "India", code: "CCU" },
  AMD: { city: "Ahmedabad", country: "India", code: "AMD" },
  HYD: { city: "Hyderabad", country: "India", code: "HYD" },
  PNQ: { city: "Pune", country: "India", code: "PNQ" },
  COK: { city: "Kochi", country: "India", code: "COK" },
  JAI: { city: "Jaipur", country: "India", code: "JAI" },
  // Bali
  DPS: { city: "Denpasar", country: "Indonesia", code: "DPS" },
  LBJ: { city: "Labuan Bajo", country: "Indonesia", code: "LBJ" },
  // Vietnam
  HAN: { city: "Hanoi", country: "Vietnam", code: "HAN" },
  SGN: { city: "Ho Chi Minh City", country: "Vietnam", code: "SGN" },
  DAD: { city: "Da Nang", country: "Vietnam", code: "DAD" },
  PQC: { city: "Phu Quoc", country: "Vietnam", code: "PQC" },
  // Thailand
  BKK: { city: "Bangkok", country: "Thailand", code: "BKK" },
  HKT: { city: "Phuket", country: "Thailand", code: "HKT" },
  CNX: { city: "Chiang Mai", country: "Thailand", code: "CNX" },
  USM: { city: "Koh Samui", country: "Thailand", code: "USM" },
  KBV: { city: "Krabi", country: "Thailand", code: "KBV" },
  // Maldives
  MLE: { city: "Malé", country: "Maldives", code: "MLE" },
  // Mauritius (single international airport serves the whole island)
  MRU: { city: "Mauritius", country: "Mauritius", code: "MRU" },
  // Sri Lanka
  CMB: { city: "Colombo", country: "Sri Lanka", code: "CMB" },
  // New Zealand
  AKL: { city: "Auckland", country: "New Zealand", code: "AKL" },
  ZQN: { city: "Queenstown", country: "New Zealand", code: "ZQN" },
  CHC: { city: "Christchurch", country: "New Zealand", code: "CHC" },
  // Hubs
  SIN: { city: "Singapore", country: "Singapore", code: "SIN" },
  KUL: { city: "Kuala Lumpur", country: "Malaysia", code: "KUL" },
  DOH: { city: "Doha", country: "Qatar", code: "DOH" },
  DXB: { city: "Dubai", country: "UAE", code: "DXB" },
};

// ─── City to Airport Code mapping ───
export const cityToAirport = {
  "Indore": "IDR", "Delhi": "DEL", "Mumbai": "BOM", "Bengaluru": "BLR",
  "Chennai": "MAA", "Kolkata": "CCU", "Ahmedabad": "AMD",
  "Hyderabad": "HYD", "Pune": "PNQ", "Kochi": "COK", "Jaipur": "JAI",
  // Bali cities all use DPS
  "Ubud": "DPS", "Seminyak": "DPS", "Canggu": "DPS", "Sanur": "DPS",
  "Nusa Dua": "DPS", "Nusa Penida": "DPS", "Uluwatu": "DPS",
  "Sidemen": "DPS", "Munduk": "DPS", "Amed": "DPS", "Kintamani": "DPS",
  "Pemuteran": "DPS", "Lovina": "DPS", "Denpasar": "DPS",
  "Labuan Bajo": "LBJ",
  // Vietnam
  "Hanoi": "HAN", "Ha Long": "HAN", "HCMC": "SGN", "Ho Chi Minh City": "SGN",
  "Da Nang": "DAD", "Hoi An": "DAD", "Phu Quoc": "PQC",
  "Ninh Binh": "HAN", "Phong Nha": "HAN",
  // Thailand
  "Bangkok": "BKK", "Phuket": "HKT", "Chiang Mai": "CNX", "Chiang Rai": "CNX",
  "Krabi": "KBV", "Koh Samui": "USM", "Pai": "CNX",
  // Maldives
  "Malé": "MLE", "Addu": "MLE", "Baa Atoll": "MLE", "S.Ari": "MLE", "Fuvahmulah": "MLE",
  // Mauritius regions all use MRU (one island, one airport, transfers by road)
  "Grand Baie": "MRU", "Belle Mare": "MRU", "Flic en Flac": "MRU",
  "Le Morne": "MRU", "Trou aux Biches": "MRU", "South Coast": "MRU",
  "East Coast": "MRU", "Mauritius": "MRU",
  // Sri Lanka
  "Colombo": "CMB", "Kandy": "CMB", "Ella": "CMB", "Mirissa": "CMB",
  "Sigiriya": "CMB", "Galle": "CMB", "Trincomalee": "CMB", "Yala": "CMB",
  // New Zealand
  "Auckland": "AKL", "Queenstown": "ZQN", "Rotorua": "AKL", "Waiheke": "AKL",
  "Christchurch": "CHC", "Milford": "ZQN", "Wanaka": "ZQN",
};

// ─── Route airline pools ───
// Which airlines operate on which routes (realistic)
const routeAirlines = {
  "IDR-DPS": [
    { codes: ["AI", "IX"], stops: 1, hubCodes: ["DEL", "BOM"], durationRange: [9, 14] },
    { codes: ["6E"], stops: 1, hubCodes: ["DEL", "BLR"], durationRange: [8, 12] },
    { codes: ["SG"], stops: 1, hubCodes: ["DEL"], durationRange: [10, 14] },
    { codes: ["GA", "AI"], stops: 1, hubCodes: ["DEL"], durationRange: [11, 15] },
  ],
  "IDR-HAN": [
    { codes: ["AI", "EK"], stops: 1, hubCodes: ["DEL", "AMD"], durationRange: [10, 15] },
    { codes: ["6E"], stops: 1, hubCodes: ["DEL"], durationRange: [9, 13] },
    { codes: ["VJ"], stops: 1, hubCodes: ["DEL"], durationRange: [10, 14] },
    { codes: ["AI", "VN"], stops: 1, hubCodes: ["DEL"], durationRange: [11, 16] },
  ],
  "IDR-SGN": [
    { codes: ["6E", "VJ"], stops: 1, hubCodes: ["DEL"], durationRange: [10, 15] },
    { codes: ["AI"], stops: 1, hubCodes: ["BOM"], durationRange: [11, 15] },
  ],
  "IDR-DAD": [
    { codes: ["VJ"], stops: 2, hubCodes: ["DEL", "HAN"], durationRange: [14, 20] },
    { codes: ["6E", "VN"], stops: 1, hubCodes: ["DEL"], durationRange: [12, 17] },
  ],
  "IDR-BKK": [
    { codes: ["AI", "TG"], stops: 1, hubCodes: ["DEL"], durationRange: [8, 12] },
    { codes: ["6E"], stops: 1, hubCodes: ["DEL"], durationRange: [7, 11] },
    { codes: ["FD", "6E"], stops: 1, hubCodes: ["DEL"], durationRange: [8, 12] },
    { codes: ["SG"], stops: 1, hubCodes: ["DEL"], durationRange: [9, 13] },
  ],
  "IDR-HKT": [
    { codes: ["6E", "FD"], stops: 1, hubCodes: ["DEL", "BKK"], durationRange: [10, 15] },
    { codes: ["AI", "TG"], stops: 1, hubCodes: ["DEL"], durationRange: [11, 16] },
  ],
  "IDR-CNX": [
    { codes: ["AI", "TG"], stops: 1, hubCodes: ["DEL", "BKK"], durationRange: [10, 15] },
    { codes: ["6E", "FD"], stops: 2, hubCodes: ["DEL", "BKK"], durationRange: [12, 18] },
  ],
  "IDR-MLE": [
    { codes: ["6E"], stops: 1, hubCodes: ["BOM"], durationRange: [6, 9] },
    { codes: ["AI"], stops: 1, hubCodes: ["BOM", "BLR"], durationRange: [6, 10] },
    { codes: ["SG"], stops: 1, hubCodes: ["BOM"], durationRange: [7, 10] },
  ],
  "IDR-CMB": [
    { codes: ["UL", "AI"], stops: 1, hubCodes: ["MAA", "BOM"], durationRange: [5, 8] },
    { codes: ["6E"], stops: 1, hubCodes: ["MAA", "BLR"], durationRange: [5, 8] },
    { codes: ["SG"], stops: 1, hubCodes: ["MAA"], durationRange: [6, 9] },
  ],
  "IDR-AKL": [
    { codes: ["AI", "NZ"], stops: 2, hubCodes: ["DEL", "SIN"], durationRange: [20, 28] },
    { codes: ["SQ", "NZ"], stops: 2, hubCodes: ["DEL", "SIN"], durationRange: [19, 26] },
    { codes: ["MH", "NZ"], stops: 2, hubCodes: ["DEL", "KUL"], durationRange: [20, 28] },
    { codes: ["QR", "NZ"], stops: 2, hubCodes: ["BOM", "DOH"], durationRange: [22, 30] },
    { codes: ["EK", "NZ"], stops: 2, hubCodes: ["BOM", "DXB"], durationRange: [21, 29] },
  ],
  "IDR-ZQN": [
    { codes: ["SQ", "NZ"], stops: 2, hubCodes: ["DEL", "SIN"], durationRange: [22, 30] },
    { codes: ["EK", "NZ"], stops: 2, hubCodes: ["BOM", "DXB"], durationRange: [24, 32] },
  ],
  "IDR-CHC": [
    { codes: ["SQ", "NZ"], stops: 2, hubCodes: ["DEL", "SIN"], durationRange: [21, 29] },
    { codes: ["MH", "NZ"], stops: 2, hubCodes: ["DEL", "KUL"], durationRange: [22, 30] },
  ],
  // Domestic / Internal flights
  "DPS-LBJ": [
    { codes: ["GA"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["VJ"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["6E"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
  ],
  "HAN-SGN": [
    { codes: ["VN"], stops: 0, hubCodes: [], durationRange: [2, 2.5] },
    { codes: ["VJ"], stops: 0, hubCodes: [], durationRange: [2, 2.5] },
    { codes: ["6E"], stops: 0, hubCodes: [], durationRange: [2, 2.5] },
  ],
  "HAN-DAD": [
    { codes: ["VN"], stops: 0, hubCodes: [], durationRange: [1.25, 1.75] },
    { codes: ["VJ"], stops: 0, hubCodes: [], durationRange: [1.25, 1.75] },
  ],
  "DAD-SGN": [
    { codes: ["VN"], stops: 0, hubCodes: [], durationRange: [1.25, 1.75] },
    { codes: ["VJ"], stops: 0, hubCodes: [], durationRange: [1.25, 1.75] },
  ],
  "DAD-PQC": [
    { codes: ["VN"], stops: 0, hubCodes: [], durationRange: [1.5, 2] },
    { codes: ["VJ"], stops: 1, hubCodes: ["SGN"], durationRange: [4, 6] },
  ],
  "BKK-HKT": [
    { codes: ["TG"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["FD"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["VJ"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
  ],
  "BKK-CNX": [
    { codes: ["TG"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["FD"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["6E"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
  ],
  "BKK-KBV": [
    { codes: ["TG"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["FD"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
  ],
  "BKK-USM": [
    { codes: ["TG"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
    { codes: ["FD"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
  ],
  "HKT-CNX": [
    { codes: ["FD"], stops: 0, hubCodes: [], durationRange: [2, 2.5] },
    { codes: ["TG"], stops: 1, hubCodes: ["BKK"], durationRange: [4, 6] },
  ],
  "CNX-KBV": [
    { codes: ["FD"], stops: 1, hubCodes: ["BKK"], durationRange: [4, 6] },
  ],
  "CNX-USM": [
    { codes: ["FD"], stops: 1, hubCodes: ["BKK"], durationRange: [4, 6] },
  ],
  "AKL-ZQN": [
    { codes: ["NZ"], stops: 0, hubCodes: [], durationRange: [1.75, 2.25] },
  ],
  "AKL-CHC": [
    { codes: ["NZ"], stops: 0, hubCodes: [], durationRange: [1.25, 1.5] },
  ],
  "ZQN-CHC": [
    { codes: ["NZ"], stops: 0, hubCodes: [], durationRange: [1, 1.25] },
  ],
};

// ─── Price ranges by route type ───
const priceRanges = {
  domestic: { min: 3500, max: 12000 },
  shortHaul: { min: 14000, max: 45000 },    // SEA destinations
  mediumHaul: { min: 18000, max: 55000 },    // Maldives, Sri Lanka
  longHaul: { min: 45000, max: 150000 },     // New Zealand
};

function getRouteType(from, to) {
  const fromCountry = airports[from]?.country;
  const toCountry = airports[to]?.country;
  if (fromCountry === toCountry) return "domestic";
  if (["New Zealand"].includes(toCountry) || ["New Zealand"].includes(fromCountry)) return "longHaul";
  if (["Maldives", "Sri Lanka"].includes(toCountry) || ["Maldives", "Sri Lanka"].includes(fromCountry)) return "mediumHaul";
  return "shortHaul";
}

// ─── Deterministic pseudo-random ───
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

// ─── Time utilities ───
function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60 / 5) * 5;
  return m > 0 ? `${h}h ${m}m` : `${h}h 00m`;
}

function addHoursToTime(time, hours) {
  const [h, m] = time.split(":").map(Number);
  const totalMin = h * 60 + m + Math.round(hours * 60);
  const newH = Math.floor(totalMin / 60) % 24;
  const newM = totalMin % 60;
  const dayOffset = Math.floor(totalMin / (24 * 60));
  return {
    time: `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`,
    dayOffset,
  };
}

function addDaysToDate(dateStr, days) {
  // dateStr format: "Jun 20"
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const parts = dateStr.split(" ");
  const monthIdx = months.indexOf(parts[0]);
  const day = parseInt(parts[1]);
  // Simple: just add days (wrap month if needed)
  const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
  let newDay = day + days;
  let newMonth = monthIdx;
  while (newDay > daysInMonth[newMonth]) {
    newDay -= daysInMonth[newMonth];
    newMonth = (newMonth + 1) % 12;
  }
  return `${months[newMonth]} ${newDay}`;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getDayName(dateStr) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const parts = dateStr.split(" ");
  const monthIdx = months.indexOf(parts[0]);
  const day = parseInt(parts[1]);
  // Use 2025 as reference year
  const d = new Date(2025, monthIdx, day);
  return dayNames[d.getDay()];
}

// ─── Departure time slots ───
const depTimeSlots = [
  "01:15", "02:30", "03:10", "04:45", "05:20",
  "06:00", "06:45", "07:30", "08:15", "09:00", "09:45",
  "10:30", "11:15", "12:00", "12:45", "13:30",
  "14:15", "15:00", "15:45", "16:30", "17:15", "17:20",
  "18:00", "18:45", "19:30", "20:15", "21:00", "22:15", "22:30", "23:45",
];

// ─── Generate flights for a route ───
export function generateFlightsForRoute(from, to, date, pax = 2) {
  const routeKey = `${from}-${to}`;
  const reverseKey = `${to}-${from}`;

  // Check both directions
  let templates = routeAirlines[routeKey];
  if (!templates) {
    templates = routeAirlines[reverseKey];
    if (templates) {
      // Reverse the route templates
      templates = templates.map(t => ({
        ...t,
        hubCodes: [...t.hubCodes].reverse(),
      }));
    }
  }

  // Generic fallback so any origin works (route pools are authored from IDR only;
  // changing the departure city would otherwise yield no flights).
  if (!templates) {
    const rt = getRouteType(from, to);
    templates = rt === "domestic"
      ? [
          { codes: ["6E"], stops: 0, hubCodes: [], durationRange: [1.5, 2.75] },
          { codes: ["AI"], stops: 0, hubCodes: [], durationRange: [1.5, 2.75] },
          { codes: ["SG"], stops: 1, hubCodes: ["DEL"], durationRange: [3, 5] },
        ]
      : rt === "longHaul"
      ? [
          { codes: ["SQ", "NZ"], stops: 2, hubCodes: ["DEL", "SIN"], durationRange: [20, 28] },
          { codes: ["MH", "NZ"], stops: 2, hubCodes: ["BOM", "KUL"], durationRange: [21, 30] },
        ]
      : [
          { codes: ["AI"], stops: 1, hubCodes: ["SIN"], durationRange: [8, 13] },
          { codes: ["6E", "QZ"], stops: 1, hubCodes: ["KUL"], durationRange: [9, 14] },
          { codes: ["TG"], stops: 1, hubCodes: ["BKK"], durationRange: [9, 14] },
        ];
  }

  const rand = seededRandom(hashStr(routeKey + date));
  const routeType = getRouteType(from, to);
  const range = priceRanges[routeType];
  const flights = [];

  // Generate 10-18 flight options
  const count = Math.floor(rand() * 9) + 10;

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(rand() * templates.length)];
    const airlineCodes = template.codes;
    const primaryAirline = airlines.find(a => a.code === airlineCodes[0]);
    const secondaryAirline = airlineCodes.length > 1 ? airlines.find(a => a.code === airlineCodes[1]) : null;

    // Departure time
    const depIdx = Math.floor(rand() * depTimeSlots.length);
    const dep = depTimeSlots[depIdx];

    // Duration (slightly varied)
    const [minDur, maxDur] = template.durationRange;
    const duration = minDur + rand() * (maxDur - minDur);

    // Arrival
    const arrival = addHoursToTime(dep, duration);

    // Price (with variation)
    const basePrice = range.min + rand() * (range.max - range.min);
    const price = Math.round(basePrice / 100) * 100;

    // Stops
    const stops = template.stops;
    const stopCities = template.hubCodes.slice(0, stops);

    // Flight number
    const flightNo = `${airlineCodes[0]}${1000 + Math.floor(rand() * 8000)}`;

    // Luggage (varies by airline type)
    const isFullService = primaryAirline?.type === "full-service";
    const cabinKg = isFullService ? 10 : 7;
    const checkinKg = isFullService ? 30 : (rand() > 0.4 ? 25 : 20);

    const travelers = [];
    for (let t = 0; t < pax; t++) {
      travelers.push({
        label: `Traveler ${t + 1}`,
        cabin: `${cabinKg < 10 ? "0" : ""}${cabinKg}kg`,
        checkin: stops > 1 && !isFullService && rand() > 0.6 ? `00 kg` : `${checkinKg} kg`,
      });
    }

    // Build segments
    const segments = [];
    if (stops === 0) {
      segments.push({
        airline: primaryAirline?.name,
        airlineCode: airlineCodes[0],
        flightNo,
        from, fromCity: airports[from]?.city,
        dep,
        to, toCity: airports[to]?.city,
        arr: arrival.time,
        arrDate: arrival.dayOffset > 0 ? addDaysToDate(date, arrival.dayOffset) : date,
        duration: formatDuration(duration),
      });
    } else if (stops === 1) {
      const hub = stopCities[0];
      const firstLegDur = duration * (0.35 + rand() * 0.2);
      const layover = 1.5 + rand() * 3; // 1.5-4.5 hours
      const secondLegDur = duration - firstLegDur - layover;

      const firstArr = addHoursToTime(dep, firstLegDur);
      const secondDep = addHoursToTime(dep, firstLegDur + layover);
      const secondArr = addHoursToTime(dep, duration);

      const opAirline1 = primaryAirline;
      const opAirline2 = secondaryAirline || primaryAirline;

      segments.push({
        airline: opAirline1?.name,
        airlineCode: airlineCodes[0],
        flightNo,
        from, fromCity: airports[from]?.city,
        dep,
        to: hub, toCity: airports[hub]?.city,
        arr: firstArr.time,
        arrDate: firstArr.dayOffset > 0 ? addDaysToDate(date, firstArr.dayOffset) : date,
        duration: formatDuration(firstLegDur),
      });
      segments.push({
        airline: opAirline2?.name,
        airlineCode: airlineCodes.length > 1 ? airlineCodes[1] : airlineCodes[0],
        flightNo: `${(airlineCodes.length > 1 ? airlineCodes[1] : airlineCodes[0])}${2000 + Math.floor(rand() * 7000)}`,
        from: hub, fromCity: airports[hub]?.city,
        dep: secondDep.time,
        to, toCity: airports[to]?.city,
        arr: secondArr.time,
        arrDate: secondArr.dayOffset > 0 ? addDaysToDate(date, secondArr.dayOffset) : date,
        duration: formatDuration(Math.max(secondLegDur, 1)),
        layoverBefore: formatDuration(layover),
      });
    } else if (stops === 2) {
      const hub1 = stopCities[0] || "DEL";
      const hub2 = stopCities[1] || "SIN";
      const seg1Dur = duration * (0.15 + rand() * 0.1);
      const layover1 = 2 + rand() * 4;
      const seg2Dur = duration * (0.35 + rand() * 0.1);
      const layover2 = 2 + rand() * 4;
      const seg3Dur = duration - seg1Dur - seg2Dur - layover1 - layover2;

      const arr1 = addHoursToTime(dep, seg1Dur);
      const dep2 = addHoursToTime(dep, seg1Dur + layover1);
      const arr2 = addHoursToTime(dep, seg1Dur + layover1 + seg2Dur);
      const dep3 = addHoursToTime(dep, seg1Dur + layover1 + seg2Dur + layover2);
      const arr3 = addHoursToTime(dep, duration);

      segments.push({
        airline: primaryAirline?.name, airlineCode: airlineCodes[0],
        flightNo,
        from, fromCity: airports[from]?.city, dep,
        to: hub1, toCity: airports[hub1]?.city,
        arr: arr1.time, arrDate: arr1.dayOffset > 0 ? addDaysToDate(date, arr1.dayOffset) : date,
        duration: formatDuration(seg1Dur),
      });
      segments.push({
        airline: (secondaryAirline || primaryAirline)?.name,
        airlineCode: airlineCodes.length > 1 ? airlineCodes[1] : airlineCodes[0],
        flightNo: `${(airlineCodes.length > 1 ? airlineCodes[1] : airlineCodes[0])}${3000 + Math.floor(rand() * 6000)}`,
        from: hub1, fromCity: airports[hub1]?.city, dep: dep2.time,
        to: hub2, toCity: airports[hub2]?.city,
        arr: arr2.time, arrDate: arr2.dayOffset > 0 ? addDaysToDate(date, arr2.dayOffset) : date,
        duration: formatDuration(Math.max(seg2Dur, 1)),
        layoverBefore: formatDuration(layover1),
      });
      segments.push({
        airline: (secondaryAirline || primaryAirline)?.name,
        airlineCode: airlineCodes.length > 1 ? airlineCodes[1] : airlineCodes[0],
        flightNo: `${(airlineCodes.length > 1 ? airlineCodes[1] : airlineCodes[0])}${4000 + Math.floor(rand() * 5000)}`,
        from: hub2, fromCity: airports[hub2]?.city, dep: dep3.time,
        to, toCity: airports[to]?.city,
        arr: arr3.time, arrDate: arr3.dayOffset > 0 ? addDaysToDate(date, arr3.dayOffset) : date,
        duration: formatDuration(Math.max(seg3Dur, 1)),
        layoverBefore: formatDuration(layover2),
      });
    }

    // Airline display name (for multi-carrier)
    const airlineDisplay = secondaryAirline && stops > 0
      ? `${primaryAirline?.name} & ${secondaryAirline?.name}`
      : primaryAirline?.name;

    // Cancellation policy
    const cancellationPolicies = [
      "Full refund if cancelled 7 days before departure",
      "Full refund if cancelled 14 days before departure",
      "50% refund if cancelled 3 days before departure",
      "Non-refundable, credit shell only",
      "Full refund if cancelled 5 days before departure",
    ];
    const dateChangePolicies = [
      "Free change in Date – Validity till 30May",
      "Date change fee ₹2,500 per person",
      "Free date change up to 48 hours before departure",
      "One free date change allowed",
      "Date change fee ₹1,500 per person",
    ];

    flights.push({
      id: `${routeKey}-${i}`,
      airline: airlineDisplay,
      airlineCodes,
      flightNo,
      from,
      fromCity: airports[from]?.city,
      to,
      toCity: airports[to]?.city,
      dep,
      arr: arrival.time,
      date,
      arrDate: arrival.dayOffset > 0 ? addDaysToDate(date, arrival.dayOffset) : date,
      duration: formatDuration(duration),
      durationMinutes: Math.round(duration * 60),
      stops,
      stopCities,
      price,
      travelers,
      cancellation: cancellationPolicies[Math.floor(rand() * cancellationPolicies.length)],
      dateChange: dateChangePolicies[Math.floor(rand() * dateChangePolicies.length)],
      webCheckin: rand() > 0.3,
      segments,
      isFullService,
      lowEmission: rand() > 0.7,
    });
  }

  // Sort by price (default)
  return flights.sort((a, b) => a.price - b.price);
}

// ─── Get flight legs for an itinerary ───
export function getFlightLegs(itinerary, homeCity = "Indore", startLabel = "Jun 20") {
  const homeAirport = cityToAirport[homeCity] || "IDR";
  const days = itinerary.days;
  if (!days || days.length === 0) return [];

  const legs = [];

  // Collect unique airports in order of visit
  const visitedAirports = [];
  days.forEach(day => {
    const apt = cityToAirport[day.city];
    if (apt && (visitedAirports.length === 0 || visitedAirports[visitedAirports.length - 1].code !== apt)) {
      visitedAirports.push({ code: apt, city: day.city });
    }
  });

  const firstApt = visitedAirports[0];
  const lastApt = visitedAirports[visitedAirports.length - 1];

  // International outbound: home → first destination
  legs.push({
    type: "international",
    direction: "outbound",
    from: homeAirport,
    fromCity: homeCity,
    to: firstApt.code,
    toCity: firstApt.city,
    date: startLabel,
    label: `${homeCity} → ${airports[firstApt.code]?.city || firstApt.city}`,
  });

  // Internal flights between different airports
  for (let i = 0; i < visitedAirports.length - 1; i++) {
    const curr = visitedAirports[i];
    const next = visitedAirports[i + 1];
    if (curr.code !== next.code) {
      // Calculate the date offset based on nights
      let nightsSoFar = 0;
      let foundCurr = false;
      for (const day of days) {
        const dayApt = cityToAirport[day.city];
        if (dayApt === curr.code) foundCurr = true;
        if (foundCurr && dayApt === curr.code) {
          nightsSoFar += day.n;
        }
        if (dayApt === next.code) break;
      }
      const internalDate = addDaysToDate(startLabel, nightsSoFar);

      legs.push({
        type: "internal",
        direction: "onward",
        from: curr.code,
        fromCity: curr.city,
        to: next.code,
        toCity: next.city,
        date: internalDate,
        label: `${airports[curr.code]?.city || curr.city} → ${airports[next.code]?.city || next.city}`,
      });
    }
  }

  // International return: last destination → home
  const totalNights = days.reduce((sum, d) => sum + d.n, 0);
  const returnDate = addDaysToDate(startLabel, totalNights);

  legs.push({
    type: "international",
    direction: "return",
    from: lastApt.code,
    fromCity: lastApt.city,
    to: homeAirport,
    toCity: homeCity,
    date: returnDate,
    label: `${airports[lastApt.code]?.city || lastApt.city} → ${homeCity}`,
  });

  return legs;
}

// ─── Sort functions ───
export const flightSortOptions = [
  { label: "Best", fn: (a, b) => {
    // Best = weighted score of price + duration
    const scoreA = a.price * 0.6 + a.durationMinutes * 50 * 0.4;
    const scoreB = b.price * 0.6 + b.durationMinutes * 50 * 0.4;
    return scoreA - scoreB;
  }},
  { label: "Cheapest", fn: (a, b) => a.price - b.price },
  { label: "Fastest", fn: (a, b) => a.durationMinutes - b.durationMinutes },
  { label: "Outbound take off time", fn: (a, b) => a.dep.localeCompare(b.dep) },
  { label: "Outbound landing time", fn: (a, b) => a.arr.localeCompare(b.arr) },
  { label: "Inbound take off time", fn: (a, b) => a.dep.localeCompare(b.dep) },
  { label: "Inbound landing time", fn: (a, b) => a.arr.localeCompare(b.arr) },
];

// ─── Filter utilities ───
export function getTimeSlot(time) {
  const h = parseInt(time.split(":")[0]);
  if (h < 6) return "Before 6 AM";
  if (h < 12) return "6 AM - 12 AM";
  if (h < 18) return "12 AM-6 PM";
  return "After 6 pM";
}

export const timeSlots = ["Before 6 AM", "6 AM - 12 AM", "12 AM-6 PM", "After 6 pM"];
export const timeSlotIcons = ["🌙", "☀️", "🌤️", "🌅"];

export function applyFlightFilters(flights, filters) {
  return flights.filter(f => {
    // Stops filter
    if (filters.stops && filters.stops.size > 0) {
      if (!filters.stops.has(f.stops)) return false;
    }

    // Airlines filter
    if (filters.airlines && filters.airlines.size > 0) {
      const hasMatchingAirline = f.airlineCodes.some(code => filters.airlines.has(code));
      if (!hasMatchingAirline) return false;
    }

    // Baggage filters
    if (filters.checkinBaggage) {
      const hasCheckin = f.travelers.every(t => parseInt(t.checkin) > 0);
      if (!hasCheckin) return false;
    }
    if (filters.handBaggageOnly) {
      const handOnly = f.travelers.every(t => parseInt(t.checkin) === 0);
      if (!handOnly) return false;
    }
    if (filters.twoCheckinBags) {
      const hasTwo = f.travelers.every(t => parseInt(t.checkin) >= 25);
      if (!hasTwo) return false;
    }
    if (filters.heavyBaggage) {
      const heavy = f.travelers.every(t => parseInt(t.checkin) >= 30);
      if (!heavy) return false;
    }

    // Departure time filter
    if (filters.depTimes && filters.depTimes.size > 0) {
      const slot = getTimeSlot(f.dep);
      if (!filters.depTimes.has(slot)) return false;
    }

    // Arrival time filter
    if (filters.arrTimes && filters.arrTimes.size > 0) {
      const slot = getTimeSlot(f.arr);
      if (!filters.arrTimes.has(slot)) return false;
    }

    // Max duration
    if (filters.maxDuration && f.durationMinutes > filters.maxDuration) return false;

    // Max price
    if (filters.maxPrice && f.price > filters.maxPrice) return false;

    // Max layover
    if (filters.maxLayover) {
      const maxLay = f.segments.reduce((max, seg) => {
        if (seg.layoverBefore) {
          const parts = seg.layoverBefore.match(/(\d+)h\s*(\d+)?m?/);
          if (parts) {
            const layMin = parseInt(parts[1]) * 60 + (parseInt(parts[2]) || 0);
            return Math.max(max, layMin);
          }
        }
        return max;
      }, 0);
      if (maxLay > filters.maxLayover) return false;
    }

    // Low emission
    if (filters.lowEmission && !f.lowEmission) return false;

    return true;
  });
}

// ─── Format price with Indian commas ───
export function formatPrice(num) {
  const str = num.toString();
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== "") {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  return lastThree;
}

// Indian cities a trip can fly from, in the order the picker lists them.
export const HOME_CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Kochi", "Jaipur", "Indore"];

// "2027-02-11" -> "Feb 11", the label the flight legs are dated with.
export function legDateLabel(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "Jun 20";
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getDate()}`;
}
