import { allItineraries } from "../data";

// ─── Partly booked trips ───
//
// A customer can ask for part of a trip to be booked before the rest is
// final: "book the flights first", or the hotels, or only some of either.
// The seller takes the payment for that part and marks it sold. The trip
// stays in My Plans, because the rest is still being planned, and moves to
// My Trips only once every part is booked. A customer has at most one partly
// booked plan.
//
// Only flights and hotels can be booked on their own. Day plans and the visa
// are finalised with the last part.
//
// On the deal, one entry per booking, in the order they happened:
//   partial: {
//     bookings: [{ flights, hotels, status, at }],
//     consentAt,
//   }
//   flights: "all" | "intl" (out and home) | "dom" (inside the country) | null
//   hotels:  "all" | [stay index, ...] | null
//   status:  "booked" (paid and booked) or "confirm" (sent by the
//            consultant to be confirmed and paid; nothing is booked yet).
//   covered: true when money the customer has already paid us covers this
//            part, so there is nothing to pay now; they only confirm.

export function partialOf(deal) {
  const bookings = deal?.partial?.bookings || [];
  if (!bookings.length) return null;
  return {
    bookings,
    anyBooked: bookings.some((b) => b.status === "booked"),
    // A consent link is out: the trip waits on the customer.
    linkLive: bookings.some((b) => b.status === "confirm"),
    consentAt: deal.partial.consentAt || null,
  };
}

const flightIdx = (sel, legs) => legs.map((l, i) => i).filter((i) =>
  sel === "all" || (sel === "intl" && legs[i].type === "international") || (sel === "dom" && legs[i].type === "internal"));
const hotelIdx = (sel, n) => (sel === "all" ? [...Array(n).keys()] : Array.isArray(sel) ? sel.filter((i) => i < n) : []);

// Which flights and stays on this trip each booking covers.
export function resolvePartial(info, legs, stayCount) {
  const flight = {};
  const hotel = {};
  if (!info) return { flight, hotel, items: () => ({ flights: [], hotels: [] }) };
  info.bookings.forEach((b, bi) => {
    flightIdx(b.flights, legs).forEach((i) => { flight[i] = { status: b.status, at: b.at, bi }; });
    hotelIdx(b.hotels, stayCount).forEach((i) => { hotel[i] = { status: b.status, at: b.at, bi }; });
  });
  const items = (bi) => ({
    flights: Object.keys(flight).map(Number).filter((i) => flight[i].bi === bi),
    hotels: Object.keys(hotel).map(Number).filter((i) => hotel[i].bi === bi),
  });
  return { flight, hotel, items };
}

// "2 flights and 1 hotel".
export const countWords = (nf, nh) => {
  const w = [nf && `${nf} flight${nf === 1 ? "" : "s"}`, nh && `${nh} hotel${nh === 1 ? "" : "s"}`].filter(Boolean);
  return w.join(" and ");
};

export const fmtINR = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
export const fmtDay = (ts) => ts ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

// ─── The demo cases ───
//
// One at a time: /partial puts the chosen case in My Plans and takes out the
// others, since a customer has only one partly booked plan.
const DAY = 86400000;
const num = (p) => Number(String(p ?? 0).replace(/,/g, "")) || 0;

export const PARTIAL_CASES = [
  { id: "demo_partial_flights", itin: 5, title: "All flights booked", note: "Every flight is booked. Hotels and day plans are still open.",
    bookings: [{ flights: "all", status: "booked", ago: 9 }] },
  { id: "demo_partial_hotels", itin: 14, title: "All hotels booked", note: "Every hotel is booked. Flights and day plans are still open.",
    bookings: [{ hotels: "all", status: "booked", ago: 9 }] },
  { id: "demo_partial_someflights", itin: 25, title: "Some flights booked", note: "Out and home are booked. The flight inside Vietnam is still open.",
    bookings: [{ flights: "intl", status: "booked", ago: 9 }] },
  { id: "demo_partial_somehotels", itin: 20, title: "Flights, then some hotels", note: "Flights booked first, then two of the three hotels. The last hotel is still open.",
    bookings: [{ flights: "all", status: "booked", ago: 9 }, { hotels: [0, 1], status: "booked", ago: 2 }] },
  { id: "demo_partial_confirm", itin: 11, title: "Flights sent to confirm and pay", note: "Nothing booked yet. The consultant has sent the flights for consent and payment.",
    bookings: [{ flights: "all", status: "confirm" }] },
  { id: "demo_partial_next", itin: 10, title: "Flights booked, hotels to confirm", note: "Flights booked earlier. Now the consultant has sent the hotels to confirm and pay.",
    bookings: [{ flights: "all", status: "booked", ago: 9 }, { hotels: "all", status: "confirm" }] },
  { id: "demo_partial_zero", itin: 7, title: "Hotels to confirm, nothing to pay", note: "The consultant has sent the hotels to confirm. Money already paid covers them, so pay now is zero.",
    bookings: [{ hotels: "all", status: "confirm", covered: true }] },
];

export function partialDemoDeal(c) {
  const now = Date.now();
  const it = allItineraries.find((i) => i.id === c.itin);
  const pp = num(it?.price);
  const cz = {
    travelDates: { fromDate: new Date(now + 52 * DAY).toISOString(), nights: it?.nights || 7, travelers: 2 },
    selectedDayOptions: {}, selectedHotels: {},
  };
  const v = (n, ageDays) => ({
    id: `${c.id}_v${n}`, num: n, status: "quote", parentId: null, createdBy: "customer",
    destination: it?.dest, itineraryId: c.itin, title: (it?.route || []).map((r) => r.city).join(" · "),
    // Saved as it stands, so the screen opens with nothing unsaved.
    customizations: cz, committed: cz,
    indicativePrice: pp, livePrice: pp, pricedAt: now - ageDays * DAY, createdAt: now - ageDays * DAY,
  });
  const bookings = c.bookings.map(({ ago, ...b }) => ({ ...b, at: b.status === "booked" ? now - ago * DAY : null }));
  const booked = bookings.filter((b) => b.status === "booked");
  return {
    id: c.id, status: "active", itineraryId: c.itin, dest: it?.dest, title: it?.name, img: it?.img,
    customItinerary: null, createdAt: now - 14 * DAY,
    versions: [v(1, 12), v(2, 1)],
    partial: { bookings, consentAt: booked.length ? booked[booked.length - 1].at : null },
  };
}
