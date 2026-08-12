import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, MapPin, Star, Plane, ChevronDown, ChevronUp, X as XIcon, ArrowLeftRight, RefreshCw, Calendar, Users, Zap, Sparkles, ChevronRight, SlidersHorizontal, Search, Download, Check, Plus, Minus, Pencil, MoreHorizontal, AlertTriangle, Heart, Phone, Info, HelpCircle } from "lucide-react";
import { C, allItineraries, destData, reviews, getCustomerPhotos, customerPhotos, couplesCount, couplePhotoNames, photoTags } from "../data";
import { getFlightLegs, generateFlightsForRoute, airports, formatPrice } from "../data/flightData";
import { generateDayOptions, getAllDayCombinations } from "../data/dayOptions";
import { Camera, Volume2, VolumeX, FileText, ChevronLeft } from "lucide-react";
import ChangeDaySheet from "../components/ChangeDaySheet";
import HotelUpgradeDrawer from "../components/HotelUpgradeDrawer";
import ConsultantCard from "../components/ConsultantCard";
import JourneyMap from "../components/JourneyMap";
import ItineraryMapScreen from "../components/ItineraryMapScreen";
import WatchTeaser from "../components/WatchTeaser";
import DayScoringRow from "../components/DayScoringRow";
import DayScoringModal from "../components/DayScoringModal";
import { getDayScore } from "../data/dayScoring";
import { videosForDest } from "../data/watchData";
import { getDayScoring, getDayTours, getAllDaysScoring } from "../data/dayScoring";
import { DayScoreRow, DayScoreModal } from "../components/DayScoring";
import ItineraryScoreboard from "../components/ItineraryScoreboard";
import SpotlightTour from "../components/SpotlightTour";
import InvitePartnerSection from "../components/InvitePartnerSection";
import { LeisureCard, LeisureStrip, ExploreIdeas } from "../components/DayWiseExtras";
import { ActivityDetailScroll } from "./ActivityDetail";
import { buildActivityDetail } from "../data/activityData";
import { getMauritiusHotel } from "../data/mauritiusData";
import { generateHotelsForCity, getStayInfo } from "../data/hotelData";
import InclusionsDrawer from "../components/InclusionsDrawer";
import HotelStayCard from "../components/HotelStayCard";

const PREBOOKING_CONSULTANTS = [
  { name: "Riya Shah", phone: "+919876500011" },
  { name: "Aarav Mehta", phone: "+919876500022" },
  { name: "Kabir Iyer", phone: "+919876500033" },
  { name: "Sana Kapoor", phone: "+919876500044" },
];
import { getUpgradeInfo } from "../data/upgradeData";
import { useDeals, computePrice, effectiveStatus, isExpired, QUOTE_VALID_DAYS, STATUS_LABEL } from "../data/deals";
import { runLiveCheck, stayState } from "../data/liveCheck";

const Divider = () => <div style={{ height: 6, background: "#F5F5F5", margin: "20px 0" }} />;

// Rotating reassurance copy shown in the bottom bar while we fetch live pricing.
const FETCH_MSGS = [
  "Pulling live rates from our partners…",
  "Finding you the best price…",
  "Almost there, locking it in…",
];

// Expand each city stay into individual days for video section + tabs
function getDayActivities(it) {
  const destImgs = destData[it.dest];
  const actImgs = destImgs?.actImgs || [];
  const expanded = [];
  let dayNum = 1;
  it.days.forEach((stay, si) => {
    const actNames = stay.sub.split(" · ");
    for (let d = 0; d < stay.n; d++) {
      const activities = actNames.map((name, ai) => ({
        name,
        img: actImgs[(si * 3 + ai + d) % (actImgs.length || 1)] || it.img,
      }));
      expanded.push({ city: stay.city, n: 1, sub: stay.sub, activities, dayNum, ...(it.dayMeta?.[dayNum] || {}) });
      dayNum++;
    }
  });
  return expanded;
}

// Sample hotels per city
// Hotel-property photos for the stub (resorts/rooms, not activities)
const HOTEL_STUB_IMGS = [
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80&auto=format&fit=crop",
];

function getHotels(it) {
  return it.days.map((day, i) => {
    const base = {
      city: day.city,
      dayRange: `Day ${it.days.slice(0, i).reduce((a, d) => a + d.n, 0) + 1}–${it.days.slice(0, i + 1).reduce((a, d) => a + d.n, 0)}`,
      name: `${day.city} Grand Resort`,
      type: "Deluxe Room · Breakfast included",
      stars: [4, 5, 4, 5][i % 4],
      rating: [8.4, 8.9, 8.1, 8.7][i % 4], // Booking.com 10-point scale
      img: HOTEL_STUB_IMGS[i % HOTEL_STUB_IMGS.length],
    };
    // Mauritius uses real hotels from the sheet, each carrying its inclusions
    // (honeymoon perks + value add-ons) surfaced in the accordion below.
    if (it.dest === "Mauritius") {
      const m = getMauritiusHotel(it.id, i, day.city);
      if (m) {
        return {
          ...base,
          name: m.name,
          stars: m.stars,
          img: m.img,
          inclusions: (m.inclusions && (m.inclusions.honeymoon?.length || m.inclusions.valueAdds?.length)) ? m.inclusions : null,
        };
      }
    }
    return base;
  });
}

// One flight row (Figma "Frame 2147227936"): dep block — duration/stops — arr block.
// dep/arr codes are the visual anchor (18px), date above (grey), time below.
function FlightLegRow({ f }) {
  const stopTxt = f.stops === 0 ? "Non-stop" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: C.sub, lineHeight: "16px" }}>{f.date}</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.head, lineHeight: "24px" }}>{f.from}</span>
        <span style={{ fontSize: 12.5, color: C.head, lineHeight: "18px" }}>{f.dep}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
        <span style={{ fontSize: 11.5, color: C.sub }}>{f.duration}</span>
        <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, borderTop: `1px dashed ${C.div}` }} />
          <Plane size={16} color="#FDA201" style={{ transform: "rotate(45deg)", margin: "0 2px" }} />
          <div style={{ flex: 1, borderTop: `1px dashed ${C.div}` }} />
        </div>
        <span style={{ fontSize: 11.5, color: C.p600 }}>{stopTxt}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: C.sub, lineHeight: "16px" }}>{f.arrDate}</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.head, lineHeight: "24px" }}>{f.to}</span>
        <span style={{ fontSize: 12.5, color: C.head, lineHeight: "18px" }}>{f.arr}</span>
      </div>
    </div>
  );
}

export default function ItineraryDetail({ selectedFlights, selectedHotels, setSelectedHotels }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const dealId = params.get("dealId");
  const versionId = params.get("versionId");
  const dealsCtx = useDeals();
  // Seed itineraries resolve from static data; trips built from scratch resolve
  // from the deal that stores their synthesized itinerary.
  const it = allItineraries.find(i => i.id === Number(id)) || dealsCtx.findCustomItinerary(Number(id), versionId);
  const [expanded, setExpanded] = useState(false);
  const [activeDay, setActiveDay] = useState(-1); // -1 = Highlights tab
  const [showViewer, setShowViewer] = useState(null); // { day, activity }
  const [flightsMenuOpen, setFlightsMenuOpen] = useState(false);
  const [changeDayIndex, setChangeDayIndex] = useState(null); // which day's bottom sheet is open
  const [dayDetailIndex, setDayDetailIndex] = useState(null); // which day's full-screen detail is open
  const [previewDay, setPreviewDay] = useState(null); // { dayIndex, option } - preview overlay above the tray
  const [allCombosIndex, setAllCombosIndex] = useState(null); // dayIndex for the full "see all" browse screen
  const [selectedDayOptions, setSelectedDayOptions] = useState({}); // { dayIndex: option }
  const [selectedHotelOptions, setSelectedHotelOptions] = useState({}); // { stayIndex: hotel } (per-version)
  const [inclHotel, setInclHotel] = useState(null); // hotel whose special-inclusions drawer is open
  const [pendingDayChange, setPendingDayChange] = useState(null); // { dayIndex, option } awaiting confirm
  const [showChanges, setShowChanges] = useState(false); // floating "changes since last version" panel
  const [leavePrompt, setLeavePrompt] = useState(false); // "discard / create itinerary" on back with unsaved edits
  const [showMap, setShowMap] = useState(false); // full-screen Itinerary Map
  const [toast, setToast] = useState(null); // { message, undoData } or null
  const toastTimerRef = useRef(null);
  const [showPricingSheet, setShowPricingSheet] = useState(false);
  const [travelDates, setTravelDates] = useState(null); // { month, travelers }
  const [pricingState, setPricingState] = useState("cached"); // "cached" | "loading" | "live"
  const [showUpgradeDrawer, setShowUpgradeDrawer] = useState(false);
  const [showDayPhotos, setShowDayPhotos] = useState(null); // { dayNum, photoIdx }
  const [showDayWiseDrawer, setShowDayWiseDrawer] = useState(false);
  const [drawerActiveDay, setDrawerActiveDay] = useState(0);
  const [fetchingPrice, setFetchingPrice] = useState(false); // bottom-bar loader while pricing
  const [liveResult, setLiveResult] = useState(null); // live availability + price check result
  // Snapshot of hotel picks at the last live check. A stay only counts as
  // "resolved" (clearing its sold-out flag) once the user re-picks it *after*
  // a check — not because the draft already had a saved hotel. Starts null so
  // the first check on any itinerary always surfaces the seeded sold-out stay.
  const hotelsAtCheckRef = useRef(null);
  const [fetchMsgIdx, setFetchMsgIdx] = useState(0); // rotating reassurance copy
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  // International flights: round trip (one paired fare) vs one-way (two separate
  // fares). The MODE is chosen in the flight listing and mirrored here; we don't
  // re-offer the choice on this summary. outAdded/retAdded let a one-way leg be
  // dropped so we can show "only one flight selected".
  const [outAdded, setOutAdded] = useState(true);
  const [retAdded, setRetAdded] = useState(true);
  // Departure city in India; changing it re-routes the international legs and
  // re-generates the available flights.
  const [departureCity, setDepartureCity] = useState("Indore");
  // Customer can drop flights entirely and book the land package only.
  const [flightsIncluded, setFlightsIncluded] = useState(true);
  // Explore itineraries: capture dates/travellers inline here (login is deferred
  // to the final step), instead of bouncing to the login-gated plan flow.
  const [showTripSheet, setShowTripSheet] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false); // "Edit your trip" field picker
  const [showTour, setShowTour] = useState(false); // guided customisation tour
  const [hintDismissed, setHintDismissed] = useState(false); // customisation signpost dismiss
  const [dayScore, setDayScore] = useState(null); // { metric, scoring, dayLabel, dayIdx } for the score drawer
  const [exploreStart, setExploreStart] = useState(""); // yyyy-mm-dd
  const [explorePax, setExplorePax] = useState(2);

  // ─── Versioned-deal context ───
  // When opened with ?dealId&versionId, this screen edits a specific copy.
  // Every copy is always editable - changes are allowed from anywhere and
  // auto-save. A quoted copy that's edited just needs an "Update quote".
  const version = dealId && versionId ? dealsCtx.getVersion(dealId, versionId) : null;
  const dealStatus = version ? effectiveStatus(version) : null;
  const inDeal = !!version;
  const isDraft = inDeal && dealStatus === "draft";
  const editable = true; // no gate; we reconcile at our end
  // The quote/PDF bar applies only to plans opened from the Plan tab (a deal).
  // Explore itineraries (no deal) show no version/PDF until the first edit
  // creates one. Quoted = a PDF exists; a deal copy is quoted once priced.
  const quoted = inDeal && !!version.pricedAt;
  const hydratedRef = useRef(false);

  // Load the opened version's customizations into the editor (once per version).
  useEffect(() => {
    if (!version) { hydratedRef.current = false; return; }
    setSelectedDayOptions(version.customizations?.selectedDayOptions || {});
    setSelectedHotelOptions(version.customizations?.selectedHotels || {});
    setTravelDates(version.customizations?.travelDates || null);
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionId]);

  // Persist edits back into the copy as they happen (draft or quote).
  useEffect(() => {
    if (!it || !inDeal || !hydratedRef.current) return;
    dealsCtx.updateDraft(dealId, versionId, {
      // Preserve other customization keys (e.g. a built trip's `builtItinerary`)
      // while patching the edit state.
      customizations: { ...(version?.customizations || {}), selectedDayOptions, selectedHotels: selectedHotelOptions, travelDates },
      indicativePrice: computePrice(it.price, selectedDayOptions, selectedHotelOptions),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayOptions, selectedHotelOptions, travelDates, inDeal]);

  // Show a toast once when returning from the hotel flow (?toast=hotel).
  useEffect(() => {
    const t = params.get("toast");
    if (!t) return;
    const hotelName = params.get("h");
    const msg = t === "hotel" ? `${hotelName || "Your new hotel"} is in ✓ Looking great!` : null;
    if (msg) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToast({ message: msg });
      toastTimerRef.current = setTimeout(() => setToast(null), 5000);
    }
    const next = new URLSearchParams(params);
    next.delete("toast");
    next.delete("h");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle reassurance copy while the price is being fetched.
  useEffect(() => {
    if (!fetchingPrice) { setFetchMsgIdx(0); return; }
    const id = setInterval(() => setFetchMsgIdx(i => i + 1), 1100);
    return () => clearInterval(id);
  }, [fetchingPrice]);

  // Track viewport so overlays fill the screen on mobile but match the phone
  // frame on desktop (same pattern as the in-file sheets).
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!it) return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Itinerary not found</div>;

  const travellers = it.travellers ?? (inDeal ? (2 + (it.veg ? 0 : 1)) : explorePax);
  // Explore: dates set inline (start + the trip's nights → range label).
  const exploreDateLabel = exploreStart ? (() => {
    const s = new Date(exploreStart);
    const e = new Date(s); e.setDate(e.getDate() + (it.nights || 0));
    const f = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${f(s)} – ${f(e)}`;
  })() : null;

  // Built trips carry a real start date; show its range. Seed trips keep the demo dates.
  const dateLabel = it.custom && it.startDate
    ? (() => {
        const s = new Date(it.startDate);
        const e = new Date(s); e.setDate(e.getDate() + (it.nights || 0));
        const f = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        return `${f(s)} – ${f(e)}`;
      })()
    : "Mar 31 – Apr 6";
  // One edit entry → the wizard on the relevant screen (travellers / dates /
  // cities). Each change forks a new version (handled in Build). Only built
  // (wizard-backed) trips can round-trip through the wizard.
  const goEdit = (target) => navigate(`/build?dealId=${dealId}&versionId=${versionId}&edit=${target}`);
  // Any saved plan can be edited via the wizard — built trips seed from their
  // own data, curated ones seed from the itinerary (Build handles the fallback).
  const wizardEditable = inDeal;

  // Guided customisation tour: auto-run once per person, or on demand when
  // opened with ?tour=1 (from the home banner). Replayable from the "How it
  // works" button. Delay a beat so the targets are laid out.
  useEffect(() => {
    const forced = params.get("tour") === "1";
    let seen = true;
    try { seen = !!localStorage.getItem("cust_tour_seen"); } catch { /* ignore */ }
    if (!forced && seen) return;
    const t = setTimeout(() => {
      setShowTour(true);
      try { localStorage.setItem("cust_tour_seen", "1"); } catch { /* ignore */ }
      if (forced) {
        const next = new URLSearchParams(params);
        next.delete("tour");
        setParams(next, { replace: true });
      }
    }, 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TOUR_STEPS = [
    { selector: '[data-tour="edit"]', gesture: "tap", text: "Tap Edit to change your destination, dates, travellers or route." },
    { selector: '[data-tour="change-day"]', gesture: "tap", text: "Tap Change day plan to swap a day's activities." },
    { selector: '[data-tour="change-hotel"]', gesture: "tap", text: "Tap Change hotel to pick a different stay." },
    { selector: '[data-tour="save"]', gesture: "tap", text: "Happy with it? Tap Save Itinerary to lock your price and get a PDF." },
  ];

  // Overlay frame: fills the viewport on mobile, matches the phone frame on desktop.
  const overlayFrame = isMobile
    ? { position: "fixed", inset: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 390, height: 844, borderRadius: 44, overflow: "hidden" };

  const upgradeInfo = getUpgradeInfo(it.id, it.days, it.custom);

  // Flight legs
  const flightLegs = useMemo(() => getFlightLegs(it, departureCity), [it, departureCity]);
  const internationalLegs = flightLegs.filter(l => l.type === "international");
  const internalLegs = flightLegs.filter(l => l.type === "internal");

  // Get selected or default flights for each leg
  const getFlightForLeg = (legIdx) => {
    const saved = selectedFlights?.[it.id]?.legs?.[legIdx];
    if (saved) return saved;
    const leg = flightLegs[legIdx];
    if (!leg) return null;
    const flights = generateFlightsForRoute(leg.from, leg.to, leg.date, 2);
    return flights[0] || null;
  };

  // Flight legs split out for the two-section layout + pricing.
  const intlOutIdx = flightLegs.findIndex(l => l.type === "international" && l.direction === "outbound");
  const intlRetIdx = flightLegs.findIndex(l => l.type === "international" && l.direction === "return");
  const domesticLegs = flightLegs.map((l, i) => ({ l, i })).filter(x => x.l.type === "internal");
  const selOut = intlOutIdx >= 0 ? getFlightForLeg(intlOutIdx) : null;
  const selRet = intlRetIdx >= 0 ? getFlightForLeg(intlRetIdx) : null;
  // Mode mirrors what was chosen in the flight listing (default round trip).
  const intlMode = selectedFlights?.[it.id]?.mode || "roundtrip";

  // Per-person flight cost folded into the trip total. International legs count
  // only when "added"; domestic hops always count. Round-trip vs one-way only
  // changes how the price is presented, not the sum.
  // Changing the departure city invalidates the chosen international flights
  // (they were priced from the trip's home). Until the customer re-selects, the
  // intl flights show an empty prompt and drop out of the costing.
  const deptChanged = departureCity !== "Indore";
  const flightPerPerson = !flightsIncluded ? 0 : (
    (!deptChanged && (intlMode === "roundtrip" || outAdded) && selOut ? selOut.price : 0) +
    (!deptChanged && (intlMode === "roundtrip" || retAdded) && selRet ? selRet.price : 0) +
    domesticLegs.reduce((s, { i }) => s + (getFlightForLeg(i)?.price || 0), 0)
  );
  const hasChosenFlights = flightPerPerson > 0;

  const d = destData[it.dest];
  const daysWithActivities = getDayActivities(it);
  const baseHotels = getHotels(it);
  // Unified itinerary design across all destinations: every dest now uses the
  // "Watch your trip unfold" tabs + tappable day cards (previously Vietnam had a
  // bespoke highlights carousel + thumbnail strip + day-wise drawer).
  const isVietnam = false;

  // Top highlights: first unique activity per day, capped at 8
  const highlights = useMemo(() => {
    const seen = new Set();
    const items = [];
    daysWithActivities.forEach((day, dayIdx) => {
      if (day.leisure || day.departure) return; // free / travel days aren't arranged experiences
      day.activities.forEach((act, actIdx) => {
        if (seen.has(act.name)) return;
        seen.add(act.name);
        items.push({
          name: act.name,
          img: act.img,
          dayNum: day.dayNum,
          city: day.city,
          dayIndex: dayIdx,
          activityIndex: actIdx,
        });
      });
    });
    return items.slice(0, 8);
  }, [daysWithActivities]);

  // Journey-map stops grouped by city, each carrying its activities (with the
  // day/activity index) so tapping a pin can open that place's reel.
  const mapStops = useMemo(() => {
    const groups = [];
    daysWithActivities.forEach((day, di) => {
      let g = groups[groups.length - 1];
      if (!g || g.city !== day.city) { g = { city: day.city, n: 0, activities: [], hero: null, hotel: null, transfer: null }; groups.push(g); }
      g.n += 1;
      // Only real tour days contribute previewable activities.
      if (!day.leisure && !day.departure) {
        (day.activities || []).forEach((a, ai) => {
          if (a?.name && !g.activities.some((x) => x.name === a.name)) {
            g.activities.push({ name: a.name, img: a.img, dayIndex: di, activityIndex: ai });
          }
        });
        if (!g.hero && day.activities?.[0]?.img) g.hero = day.activities[0].img;
      }
      if (!g.transfer && day.transfers?.length) g.transfer = day.transfers[0];
    });
    // Attach each city's hotel for the "where you'll stay" detail card.
    groups.forEach((g) => {
      const h = baseHotels.find((x) => x.city === g.city);
      if (h) { g.hotel = h; if (!g.hero) g.hero = h.img; }
    });
    return groups;
  }, [daysWithActivities, baseHotels]);

  // Merge saved hotel selections. In a deal, per-version picks win; otherwise
  // fall back to the app-level (Explore) selection.
  const hotels = baseHotels.map((h, i) => {
    const savedHotel = inDeal ? selectedHotelOptions?.[i] : selectedHotels?.[it.id]?.stays?.[i];
    const resolved = savedHotel
      ? {
          ...h,
          name: savedHotel.hotelName,
          type: savedHotel.roomName,
          img: savedHotel.image || h.img,
          rating: savedHotel.bookingScore || h.rating,
          stars: savedHotel.stars || h.stars,
          hotelId: savedHotel.hotelId,
        }
      : { ...h, hotelId: `${h.city}-hotel-0` }; // default to first hotel
    // Pull refundability from the real generated hotel behind this stay.
    const si = getStayInfo(it, i);
    const match = si && generateHotelsForCity(si.city, it.dest, si.checkIn, si.checkOut, si.nights).find(x => x.id === resolved.hotelId);
    return { ...resolved, freeCancellation: match ? match.freeCancellation : undefined };
  });

  // Stays the customer chose to book themselves — set from the hotel chooser,
  // stored in App selectedHotels so both screens agree. Excluded from cost.
  const selfBookedStays = new Set((selectedHotels?.[it.id]?.stays || []).map((s, i) => (s?.selfBooked ? i : -1)).filter(i => i >= 0));
  const restoreStay = (i) => setSelectedHotels?.(prev => {
    const next = { ...prev };
    const stays = [...(next[it.id]?.stays || [])];
    if (stays[i]?.selfBooked) stays[i] = undefined;
    next[it.id] = { ...next[it.id], stays };
    return next;
  });

  // ─── Changes since the last finalized version ───
  // Compare current customizations against the committed (last-quoted) snapshot.
  const committed = version?.committed || {};
  const committedDays = committed.selectedDayOptions || {};
  const committedHotels = committed.selectedHotels || {};
  const dayChanges = Object.entries(selectedDayOptions)
    .filter(([di, opt]) => !committedDays[di] || committedDays[di].id !== opt.id)
    .map(([di, opt]) => ({
      kind: "day", key: di,
      title: `Day ${daysWithActivities[di]?.dayNum} · ${daysWithActivities[di]?.city}`,
      detail: (opt.activities || []).join(", "),
    }));
  const hotelChanges = Object.entries(selectedHotelOptions)
    // A different room in the same hotel is a change too, so compare rooms as
    // well as properties.
    .filter(([si, h]) => !committedHotels[si] || committedHotels[si].hotelId !== h.hotelId || committedHotels[si].roomId !== h.roomId)
    .map(([si, h]) => ({
      kind: "hotel", key: si,
      title: `Hotel · ${baseHotels[si]?.city || ""}`,
      detail: h.roomName ? `${h.hotelName} · ${h.roomName}` : h.hotelName,
    }));
  const changes = [...dayChanges, ...hotelChanges];
  const hasChanges = changes.length > 0;
  const validQuote = quoted && !hasChanges && !isExpired(version);

  // Cost breakdown — splits the all-in grand total (the number shown in the
  // bottom bar) into the same headers as the price-quote PDF, reconciling
  // exactly back to that total. Land price already bakes in GST/TCS, so we
  // back those out rather than add on top.
  const landPP = !inDeal
    ? (Number(String(it.price).replace(/,/g, "")) || 0)
    : (validQuote ? (version.livePrice || 0) : (version.indicativePrice || 0));
  // Self-booked stays are removed from the land cost proportionally (hotels are
  // ~62% of land, split by nights), so the customer only pays for what we provide.
  const totalNights = it.days.reduce((a, d) => a + d.n, 0) || 1;
  const estHotelPP = (idx) => Math.round(((landPP * 0.62) / totalNights) * (it.days[idx]?.n || 0));
  const hotelDeductionPP = [...selfBookedStays].reduce((s, idx) => s + estHotelPP(idx), 0);
  const netLandPP = Math.max(0, landPP - hotelDeductionPP);
  const grandTotal = (netLandPP + flightPerPerson) * travellers;
  const flightsLine = flightPerPerson * travellers;
  const costSplit = (() => {
    const tcs = Math.round((grandTotal * 2) / 102);          // 2% added on top
    const discount = grandTotal > 60000 ? 5000 : 0;          // flat promo credit
    const gross = grandTotal - tcs + discount;               // pre-discount, pre-TCS
    const gst = Math.round((gross * 5) / 105);               // 5% within gross
    const nonFlight = gross - gst - flightsLine;             // hotels + activities
    const hotels = Math.round(nonFlight * 0.62);
    const activities = nonFlight - hotels;
    return { hotels, activities, flights: flightsLine, gst, discount, tcs, total: grandTotal };
  })();

  // Revert one change back to the committed (last-version) value.
  const undoChange = (ch) => {
    if (ch.kind === "day") {
      setSelectedDayOptions(prev => {
        const next = { ...prev };
        if (committedDays[ch.key]) next[ch.key] = committedDays[ch.key]; else delete next[ch.key];
        return next;
      });
    } else {
      setSelectedHotelOptions(prev => {
        const next = { ...prev };
        if (committedHotels[ch.key]) next[ch.key] = committedHotels[ch.key]; else delete next[ch.key];
        return next;
      });
    }
  };

  // Discard all unsaved changes: revert to the quote, or drop the copy if never finalized.
  const handleDiscardChanges = () => {
    if (!quoted) { handleDiscardCopy(); return; }
    setSelectedDayOptions(committedDays);
    setSelectedHotelOptions(committedHotels);
    setShowChanges(false);
    showToast("Changes discarded · back to your quote");
  };

  // Upgrade drawer must show the SAME current hotels as the Hotels cards above it,
  // not the stub's own "current" entries.
  const upgradeInfoDisplay = {
    ...upgradeInfo,
    upgrades: upgradeInfo.upgrades.map(u => {
      const shown = hotels[u.cityIndex];
      if (!shown) return u;
      return {
        ...u,
        current: { ...u.current, name: shown.name, stars: shown.stars, type: shown.type, rating: shown.rating, img: shown.img },
      };
    }),
  };

  const destReviews = reviews.filter(r => r.dest === it.dest).length > 0 ? reviews.filter(r => r.dest === it.dest) : reviews.slice(0, 3);
  const visibleDays = expanded ? daysWithActivities : daysWithActivities.slice(0, 3);

  // ─── Change Day handlers ───
  const showToast = (message, undoData) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undoData });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  // Open the hotel-change flow, carrying deal context so the change lands back
  // in editing mode on this same copy.
  const dealQS = inDeal ? `&dealId=${dealId}&versionId=${versionId}` : "";
  const openHotelFlow = (stayIndex, currentHotelId) =>
    navigate(`/hotels/${it.id}/${stayIndex}?current=${encodeURIComponent(currentHotelId || "")}${dealQS}`);

  // Selecting a day option stages a confirmation; nothing changes until Continue.
  const handleChangeDaySelect = (dayIndex, option) => {
    setChangeDayIndex(null);
    setPreviewDay(null);
    setAllCombosIndex(null);
    setPendingDayChange({ dayIndex, option });
  };

  // Apply the staged day change (from the confirm popup's Continue).
  const applyDayChange = () => {
    if (!pendingDayChange) return;
    const { dayIndex, option } = pendingDayChange;
    const previousOption = selectedDayOptions[dayIndex] || null;
    const next = { ...selectedDayOptions, [dayIndex]: option };
    setSelectedDayOptions(next);
    setPendingDayChange(null);

    // First edit on a plan that isn't yet a copy → start "your changes".
    if (!inDeal) {
      const { dealId: nd, versionId: nv } = dealsCtx.createDeal({
        itineraryId: it.id,
        dest: it.dest,
        title: it.route?.map(r => r.city).join(" · ") || `${it.dest} trip`,
        img: it.img,
        createdBy: "customer",
        customizations: { selectedDayOptions: next, selectedHotels: selectedHotelOptions, travelDates },
        indicativePrice: computePrice(it.price, next, selectedHotelOptions),
      });
      navigate(`/itinerary/${it.id}?dealId=${nd}&versionId=${nv}`);
      showToast(`Day ${daysWithActivities[dayIndex]?.dayNum} updated ✓ · your copy started ✦`);
      return;
    }

    const incremental = ((option.priceDelta || 0) - (previousOption?.priceDelta || 0)) * travellers;
    const pricePart = incremental !== 0
      ? ` · Trip total ${incremental > 0 ? "+" : "−"}₹${Math.abs(incremental).toLocaleString("en-IN")}`
      : "";
    showToast(
      `Day ${daysWithActivities[dayIndex]?.dayNum} updated ✓${pricePart}`,
      { dayIndex, previousOption }
    );
  };

  const handleUndo = () => {
    if (!toast?.undoData) return;
    const { dayIndex, previousOption } = toast.undoData;
    if (previousOption) {
      setSelectedDayOptions(prev => ({ ...prev, [dayIndex]: previousOption }));
    } else {
      setSelectedDayOptions(prev => {
        const next = { ...prev };
        delete next[dayIndex];
        return next;
      });
    }
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  // Get current day data for the change-day sheet
  const changeDayData = changeDayIndex !== null
    ? (() => {
        const data = generateDayOptions(it, changeDayIndex, daysWithActivities);
        if (!data) return null;
        // If user previously selected a different option, mark it as current
        const prevSelected = selectedDayOptions[changeDayIndex];
        if (prevSelected) {
          data.options = data.options.map(opt => ({
            ...opt,
            isCurrent: opt.id === prevSelected.id,
          }));
        }
        return data;
      })()
    : null;

  // Check if a day has alternate options available.
  const dayHasOptions = (dayIndex) => {
    const data = generateDayOptions(it, dayIndex, daysWithActivities);
    return data && data.options.length > 1;
  };

  // ─── Deal actions ───
  const handleSaveToPlans = () => {
    const { dealId: nd, versionId: nv } = dealsCtx.createDeal({
      itineraryId: it.id,
      dest: it.dest,
      title: it.route?.map(r => r.city).join(" · ") || `${it.dest} trip`,
      img: it.img,
      customizations: { selectedDayOptions, travelDates },
      indicativePrice: computePrice(it.price, selectedDayOptions),
    });
    navigate(`/itinerary/${it.id}?dealId=${nd}&versionId=${nv}`);
    showToast("Saved to My Plans as a draft");
  };
  // "Get final price" / "Update quote" → instant quote + fresh PDF, in place.
  // The copy stays fully editable afterwards.
  const handleGetFinalPrice = () => {
    if (fetchingPrice) return;
    setFetchingPrice(true);
    // Prototype: a real-time availability + price check. Sold-out stays block the
    // lock until resolved; price increases auto-apply with a "change?" option.
    setTimeout(() => {
      // Everything checks out available at the indicative rates: nothing blocks
      // or bumps, so the final quote locks on the first tap.
      const resolved = new Set((hotels || []).map((_, i) => i));
      const raw = runLiveCheck(it, hotels, resolved);
      const clean = {
        ...raw,
        stays: raw.stays.map(s => ({ ...s, status: "clear", delta: 0 })),
        tour: { ...raw.tour, status: "clear", delta: 0 },
        soldOut: [], priceUps: [], hotelDelta: 0, totalDelta: 0, blocking: false,
      };
      setFetchingPrice(false);
      setLiveResult(clean);
      const live = computePrice(it.price, selectedDayOptions, selectedHotelOptions);
      dealsCtx.requestPricing(dealId, versionId, live);
      showToast(`Quote ready · ₹${live.toLocaleString("en-IN")}/person · PDF generated ✓`);
    }, 1800);
  };
  const handleDownloadPdf = () => showToast("Quote PDF downloaded (demo)");
  const handleDiscardCopy = () => {
    dealsCtx.discardVersion(dealId, versionId);
    navigate(`/itinerary/${it.id}`);
    showToast("Changes discarded · back to the original");
  };

  // ─── Back / leave guard ───
  // Only one open (un-finalized) version may live at a time, so leaving an edited
  // draft must resolve it: discard the changes, or create the itinerary (lock the
  // PDF). With no unsaved edits we just leave.
  const attemptLeave = () => {
    if (inDeal && hasChanges) { setLeavePrompt(true); return; }
    navigate(-1);
  };
  const createItineraryAndLeave = () => {
    const live = computePrice(it.price, selectedDayOptions, selectedHotelOptions);
    dealsCtx.requestPricing(dealId, versionId, live);
    setLeavePrompt(false);
    navigate(-1);
  };
  // Keep the edited version as a draft (edits already auto-persist) and leave.
  const saveDraftAndLeave = () => {
    setLeavePrompt(false);
    navigate(-1);
  };

  return (
    <div style={{ position: "relative" }}>

      {/* ═══ 1. Hero Image ═══ */}
      <div style={{ position: "relative", height: 240 }}>
        <img src={it.img} alt={it.dest} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />
        {/* Top buttons */}
        <button onClick={attemptLeave} style={{ position: "absolute", top: 14, left: 14, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
          <ArrowLeft size={18} color="#fff" />
        </button>
        {wizardEditable && (
          <button data-tour="howitworks" onClick={() => setShowTour(true)} style={{ position: "absolute", top: 14, right: 14, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", cursor: "pointer", fontFamily: "inherit" }}>
            <HelpCircle size={12} color="#fff" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>How customising works</span>
          </button>
        )}
        {/* Bottom info - title on its own full-width row, then V{n} + Watch below */}
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, lineHeight: "28px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span>Your {it.dest} Trip · <span style={{ fontWeight: 400 }}>{it.nights}N</span></span>
            {inDeal && versionId && (
              <button onClick={() => dealsCtx.toggleWish(versionId)} aria-label={dealsCtx.isWished(versionId) ? "Remove from wishlist" : "Save to wishlist"} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "none", cursor: "pointer", flexShrink: 0, padding: 0 }}>
                <Heart size={16} color="#fff" fill={dealsCtx.isWished(versionId) ? "#fff" : "none"} />
              </button>
            )}
            {/* Version badge only once the itinerary is created (priced) */}
            {quoted && (
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", background: "rgba(255,255,255,0.24)", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", borderRadius: 999, padding: "2px 10px", letterSpacing: 0.4 }}>
                V{version.num}
              </span>
            )}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setShowViewer({ day: 0, activity: 0 })} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20,
              background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)", cursor: "pointer",
            }}>
              <Play size={12} color="#fff" fill="#fff" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>Watch the trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trip meta - dates, travellers, route + edit (moved out of the hero) */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          {wizardEditable ? (
            /* A built plan — one "Edit" entry (right) routes back to the wizard */
            <p style={{ fontSize: 13, fontWeight: 600, color: C.head, margin: 0 }}>
              {dateLabel} · {travellers} traveller{travellers > 1 ? "s" : ""}
            </p>
          ) : inDeal ? (
            /* A curated saved plan — dates/travellers editable inline (tap the pencil) */
            <button onClick={() => setShowTripSheet(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{exploreStart ? exploreDateLabel : dateLabel} · {exploreStart ? explorePax : travellers} traveller{(exploreStart ? explorePax : travellers) > 1 ? "s" : ""}</span>
              <Pencil size={12} color={C.p600} />
            </button>
          ) : exploreStart ? (
            /* Explore: dates/party filled inline — show them, tap to edit */
            <button onClick={() => setShowTripSheet(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{exploreDateLabel} · {explorePax} traveller{explorePax > 1 ? "s" : ""}</span>
              <Pencil size={12} color={C.p600} />
            </button>
          ) : (
            /* Explore: we don't have the customer's dates/party yet — prompt to add (inline, no login) */
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[{ icon: <Calendar size={12} />, label: "Add travel dates" }, { icon: <Users size={12} />, label: "Add travellers" }].map(c => (
                <button key={c.label} onClick={() => navigate(`/build?dest=${encodeURIComponent(it.dest)}&skipActivities=1`)} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: C.p600, border: `1px dashed ${C.p300}`, borderRadius: 20, padding: "5px 10px", background: C.white, cursor: "pointer", fontFamily: "inherit" }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          )}
          <p style={{ fontSize: 12.5, color: C.sub, margin: "3px 0 0", lineHeight: "17px" }}>{it.days.map(d => `${d.city} ${d.n}N`).join("  ·  ")}</p>
        </div>
        {wizardEditable && (
          /* Opens the "Edit your trip" field picker */
          <button data-tour="edit" onClick={() => setShowEditMenu(true)} style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: C.p600, border: `1px solid ${C.div}`, borderRadius: 20, padding: "6px 12px", background: C.white, cursor: "pointer", fontFamily: "inherit" }}>
            <Pencil size={13} /> Edit trip
          </button>
        )}
      </div>

      {/* Customisation signpost: point to Edit trip (big things) and the
          inline Change controls on each day and hotel below. */}
      {wizardEditable && !hintDismissed && (
        <div style={{ margin: "0 16px 10px", display: "flex", gap: 8, alignItems: "flex-start", background: "#FFF8E1", border: "1px solid #FCEBB6", borderRadius: 12, padding: "10px 12px" }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: C.head, lineHeight: "17px", fontWeight: 500 }}>
            Scroll down to <b style={{ color: C.head }}>Change day plan</b> or <b style={{ color: C.head }}>Change hotel</b>.
          </span>
          <button onClick={() => setHintDismissed(true)} aria-label="Dismiss" style={{ flexShrink: 0, border: "none", background: "none", cursor: "pointer", padding: 2, marginTop: -1, fontFamily: "inherit" }}>
            <XIcon size={16} color={C.sub} />
          </button>
        </div>
      )}

      {/* Inline trip-details sheet (explore) — set dates/travellers without login */}
      {showTripSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setShowTripSheet(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", padding: "18px 18px 28px", maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>Trip details</p>
              <button onClick={() => setShowTripSheet(false)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}><XIcon size={20} color={C.sub} /></button>
            </div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Start date</label>
            <input type="date" value={exploreStart} onChange={(e) => setExploreStart(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1px solid ${C.div}`, fontSize: 14, color: C.head, fontFamily: "inherit", marginBottom: 16 }} />
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: C.sub, marginBottom: 6 }}>Travellers</label>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.div}`, borderRadius: 10, padding: "8px 12px", marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>{explorePax} traveller{explorePax > 1 ? "s" : ""}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={() => setExplorePax(p => Math.max(1, p - 1))} style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer" }}><Minus size={15} color={C.head} /></button>
                <button onClick={() => setExplorePax(p => Math.min(12, p + 1))} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.p600, display: "grid", placeItems: "center", cursor: "pointer" }}><Plus size={15} color="#fff" /></button>
              </div>
            </div>
            <button onClick={() => setShowTripSheet(false)} disabled={!exploreStart} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: exploreStart ? C.p600 : C.div, color: exploreStart ? "#fff" : C.inact, fontSize: 15, fontWeight: 700, cursor: exploreStart ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Done</button>
          </div>
        </div>
      )}

      {/* Edit your trip — pick a field; the wizard opens at it and edits forward */}
      {showEditMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setShowEditMenu(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", padding: "18px 18px calc(20px + env(safe-area-inset-bottom))", maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>Edit your trip</p>
              <button onClick={() => setShowEditMenu(false)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}><XIcon size={20} color={C.sub} /></button>
            </div>
            <p style={{ fontSize: 12.5, color: C.sub, margin: "0 0 14px" }}>Pick what to change. You'll be able to edit it and the steps after it.</p>
            {[
              { target: "destination", icon: <MapPin size={18} color={C.p600} />, label: "Destination", value: it.dest },
              { target: "travellers", icon: <Users size={18} color={C.p600} />, label: "Travellers", value: `${travellers} traveller${travellers > 1 ? "s" : ""}` },
              { target: "dates", icon: <Calendar size={18} color={C.p600} />, label: "Travel dates", value: dateLabel },
              { target: "route", icon: <ArrowLeftRight size={18} color={C.p600} />, label: "Route", value: it.days.map(d => d.city).filter((c, i, a) => a.indexOf(c) === i).join(" · ") },
            ].map((row) => (
              <button key={row.target} onClick={() => goEdit(row.target)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", padding: "12px 4px", border: "none", borderTop: `1px solid ${C.bg}`, background: "none", cursor: "pointer", fontFamily: "inherit" }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: C.p100, display: "grid", placeItems: "center", flexShrink: 0 }}>{row.icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.head }}>{row.label}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.value}</span>
                </span>
                <ChevronRight size={18} color={C.inact} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 2. Highlights (Vietnam) / See Your Trip (others) ═══ */}
      {isVietnam ? (
        <div style={{ padding: "16px 0 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 16px", marginBottom: 10 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: 0 }}>Trip highlights</p>
            <span style={{ fontSize: 11, color: C.sub }}>{highlights.length} experiences</span>
          </div>
          <div className="hs" style={{ gap: 12, paddingLeft: 16, paddingRight: 16 }}>
            {highlights.map((h, i) => (
              <div
                key={i}
                onClick={() => setShowViewer({ day: h.dayIndex, activity: h.activityIndex })}
                style={{
                  width: 200, minWidth: 200, height: 280, borderRadius: 16, overflow: "hidden",
                  position: "relative", flexShrink: 0, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                <img
                  src={h.img}
                  alt={h.name}
                  className={`ken-burns${i % 3 === 1 ? " ken-burns-2" : i % 3 === 2 ? " ken-burns-3" : ""}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {/* gradient */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 30%, rgba(0,0,0,0.85))" }} />
                {/* title */}
                <p style={{ position: "absolute", bottom: 12, left: 12, right: 12, fontSize: 14, fontWeight: 700, color: "#fff", margin: 0, lineHeight: "18px" }}>
                  {h.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "16px 0 0" }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.head, padding: "0 16px", marginBottom: 10 }}>Watch your trip in videos</p>
          {/* Tabs: Highlights + Day pills */}
          <div className="hs" style={{ gap: 6, paddingLeft: 16, paddingRight: 16, marginBottom: 10 }}>
            <button onClick={() => setActiveDay(-1)} style={{
              padding: "8px 14px", borderRadius: 10, minWidth: 90, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
              background: activeDay === -1 ? C.p600 : "#F5F5F5",
              border: activeDay === -1 ? "none" : `1px solid ${C.div}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: activeDay === -1 ? "#fff" : C.head, margin: 0 }}>Highlights</p>
            </button>
            {daysWithActivities.map((day, i) => (
              <button key={i} onClick={() => setActiveDay(i)} style={{
                padding: "8px 14px", borderRadius: 10, minWidth: 80, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                background: activeDay === i ? C.p600 : "#F5F5F5",
                border: activeDay === i ? "none" : `1px solid ${C.div}`,
                textAlign: "left",
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: activeDay === i ? "#fff" : C.head, margin: 0 }}>Day {day.dayNum}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                  <MapPin size={10} color={activeDay === i ? "rgba(255,255,255,0.7)" : C.sub} />
                  <span style={{ fontSize: 11, color: activeDay === i ? "rgba(255,255,255,0.7)" : C.sub }}>{day.city}</span>
                </div>
              </button>
            ))}
          </div>
          {/* Highlights → bare carousel. A day → a tinted panel that bonds the
              day's score one-liner with its videos (tap the score for the full
              breakdown). The active pink tab sits right above this tint. */}
          {activeDay === -1 ? (
            <div className="hs" style={{ gap: 10, paddingLeft: 16, paddingRight: 16 }}>
              {highlights.map((h, i) => (
                <div key={i} onClick={() => setShowViewer({ day: h.dayIndex, activity: h.activityIndex })} style={{
                  width: 190, minWidth: 190, height: 330, borderRadius: 14, overflow: "hidden", position: "relative", flexShrink: 0, cursor: "pointer",
                }}>
                  <img src={h.img} alt={h.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.85))" }} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-55%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Play size={18} color="#fff" fill="#fff" />
                  </div>
                  <p style={{ position: "absolute", bottom: 12, left: 12, right: 12, fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{h.name}</p>
                </div>
              ))}
            </div>
          ) : (daysWithActivities[activeDay]?.leisure && !daysWithActivities[activeDay]?.transfers?.length) ? (
            <>
              <LeisureCard hasTransfer={false} ctaLabel="Explore Tours" onChangePlan={() => setChangeDayIndex(activeDay)} />
              <ExploreIdeas ideas={daysWithActivities[activeDay].ideas} />
            </>
          ) : (() => {
            const day = daysWithActivities[activeDay];
            const sc = getDayScoring(day, activeDay, daysWithActivities);
            return (
              <div>
                {/* Videos */}
                <div className="hs" style={{ gap: 10, paddingLeft: 16, paddingRight: 16 }}>
                  {day?.activities.map((act, i) => (
                    <div key={i} onClick={() => setShowViewer({ day: activeDay, activity: i })} style={{
                      width: 190, minWidth: 190, height: 330, borderRadius: 14, overflow: "hidden", position: "relative", flexShrink: 0, cursor: "pointer",
                    }}>
                      <img src={act.img} alt={act.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.8))" }} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-55%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play size={18} color="#fff" fill="#fff" />
                      </div>
                      <p style={{ position: "absolute", bottom: 12, left: 12, right: 12, fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{act.name}</p>
                    </div>
                  ))}
                </div>
                {/* Divider, a small title, then the day score tiles (tap → drawer) */}
                <div style={{ height: 1, background: C.div, margin: "14px 16px 0" }} />
                <p style={{ margin: "12px 16px 2px", fontSize: 12.5, fontWeight: 800, color: C.head, letterSpacing: "-0.1px" }}>Day {day.dayNum} scores</p>
                <div style={{ padding: "0 16px" }}>
                  <DayScoreRow scoring={sc} onOpen={(metric) => setDayScore({ metric, scoring: sc, dayLabel: `Day ${day.dayNum} · ${day.city}`, dayIdx: activeDay })} bg="transparent" borderColor="transparent" divider={C.div} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <Divider />

      {/* ═══ 3. Itinerary at a Glance ═══ */}
      <div style={{ padding: "0 16px" }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: C.head, marginBottom: 16 }}>Itinerary at a glance</p>
        <div style={{ position: "relative", paddingLeft: 24 }}>
          <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 1, borderLeft: "1px dashed #D0D5DD" }} />
          {visibleDays.map((day, i) => {
            const globalDayIndex = daysWithActivities.indexOf(day);
            const swapped = selectedDayOptions[globalDayIndex];
            const displayActivities = swapped
              ? swapped.activities
              : day.sub.split(" · ");
            const hasOptions = dayHasOptions(globalDayIndex);
            // Whole-card clickable variant for standard day rows; Vietnam keeps its thumbnail strip.
            const cardVariant = !isVietnam;

            return (
              <div key={i} style={{ position: "relative", marginBottom: i < visibleDays.length - 1 ? (isVietnam ? 14 : 20) : 0 }}>
                <div style={{ position: "absolute", left: -20, top: 4, width: 10, height: 10, borderRadius: "50%", background: "#fff", border: `2px solid ${i === 0 ? "#027A48" : C.inact}` }} />
                <div
                  {...(cardVariant ? {
                    "data-testid": `day-details-${globalDayIndex}`,
                    onClick: () => setDayDetailIndex(globalDayIndex),
                    role: "button",
                    "aria-label": `Day ${day.dayNum} details`,
                  } : {})}
                  style={cardVariant ? {
                    cursor: "pointer", borderRadius: 12, border: `1px solid ${C.div}`,
                    background: C.white, padding: "10px 12px", boxShadow: "0 1px 4px rgba(24,30,76,0.04)",
                  } : undefined}
                >
                  {cardVariant ? (
                    <>
                      {/* Condensed tappable day card: title + one activity line, chevron cue, inline change link */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Day {day.dayNum}: {day.city}</p>
                        <ChevronRight size={18} color={C.sub} style={{ flexShrink: 0 }} />
                      </div>
                      <p style={{ fontSize: 12, color: C.sub, lineHeight: "17px", margin: "3px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {day.departure
                          ? "Departure, transfer to the airport"
                          : day.leisure
                            ? (day.transfers?.length
                                ? `Transfer to ${day.transfers[0].to}, then the day is yours`
                                : "Leisure day, the day is yours")
                            : `• ${displayActivities.join(", ")}`}
                      </p>
                      {hasOptions && (
                        <button
                          data-testid={`change-day-${globalDayIndex}`}
                          data-tour="change-day"
                          onClick={(e) => { e.stopPropagation(); setChangeDayIndex(globalDayIndex); }}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
                            padding: 0, background: "none", border: "none",
                            fontSize: 12, fontWeight: 600, color: C.p600, cursor: "pointer", fontFamily: "inherit",
                          }}
                          aria-label="Change day plan"
                        >
                          <ArrowLeftRight size={13} color={C.p600} />
                          Change day plan
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>Day {day.dayNum}: {day.city}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <button
                            data-testid={`day-details-${globalDayIndex}`}
                            onClick={() => setDayDetailIndex(globalDayIndex)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "4px 10px", background: C.white,
                              border: `1px solid ${C.div}`, borderRadius: 999,
                              fontSize: 11, fontWeight: 600, color: C.head, cursor: "pointer",
                              fontFamily: "inherit", flexShrink: 0, lineHeight: 1,
                            }}
                            aria-label="Day details"
                          >
                            <FileText size={11} color={C.sub} />
                            Details
                          </button>
                          {hasOptions && (
                            <button
                              data-testid={`change-day-${globalDayIndex}`}
                              onClick={() => setChangeDayIndex(globalDayIndex)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "4px 10px", background: C.white,
                                border: `1px solid ${C.div}`, borderRadius: 999,
                                fontSize: 11, fontWeight: 600, color: C.p600, cursor: "pointer",
                                fontFamily: "inherit", flexShrink: 0, lineHeight: 1,
                              }}
                              aria-label="Change day plan"
                            >
                              <ArrowLeftRight size={11} color={C.p600} />
                              Change day
                            </button>
                          )}
                        </div>
                      </div>
                      {isVietnam ? (
                        <div className="hs" style={{ gap: 10, marginTop: 8, paddingBottom: 2, marginRight: -16 }}>
                          {displayActivities.map((a, j) => {
                            const thumb = day.activities[j]?.img || it.img;
                            return (
                              <div
                                key={j}
                                onClick={() => setShowViewer({ day: globalDayIndex, activity: j })}
                                style={{ width: 76, minWidth: 76, flexShrink: 0, cursor: "pointer" }}
                              >
                                <div style={{ width: 76, height: 76, borderRadius: 10, overflow: "hidden", background: C.div }}>
                                  <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </div>
                                <p style={{ fontSize: 11, color: C.head, fontWeight: 500, margin: "6px 0 0", lineHeight: "13px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                  {a}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: C.sub, lineHeight: "18px", margin: "4px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          • {displayActivities.join(", ")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {daysWithActivities.length > 3 && (
          <button onClick={() => setExpanded(!expanded)} style={{
            display: "flex", alignItems: "center", gap: 4, margin: "14px 0 0", background: "none", border: "none",
            fontSize: 13, fontWeight: 600, color: C.sub, cursor: "pointer", fontFamily: "inherit",
          }}>
            <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>{expanded ? "Hide details" : "Read more"}</span> {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
        {isVietnam && (
          <button
            onClick={() => { setDrawerActiveDay(0); setShowDayWiseDrawer(true); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: "100%", marginTop: 16, padding: "12px 16px",
              background: "#fff", border: `1px solid ${C.div}`, borderRadius: 12,
              fontSize: 13, fontWeight: 600, color: C.head, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Play size={12} color={C.p600} fill={C.p600} />
            View day-wise itinerary
            <ChevronRight size={14} color={C.sub} />
          </button>
        )}
      </div>

      <Divider />

      {/* ═══ 4. Hotels ═══ */}
      <div id="hotels-section">
        <p style={{ fontSize: 17, fontWeight: 700, color: C.head, padding: "0 16px", marginBottom: 12 }}>Hotels</p>
        <div className="hs" style={{ gap: 12, paddingLeft: 16, paddingRight: 16 }}>
          {hotels.map((h, i) => {
            const selfBooked = selfBookedStays.has(i);
            const ls = stayState(liveResult, i);
            const soldOut = ls && ls.status === "sold_out";
            if (selfBooked) {
              return (
                <div key={i} style={{ width: 280, minWidth: 280, flexShrink: 0 }}>
                  <div style={{ borderRadius: 14, border: `1px dashed ${C.div}`, background: C.bg, padding: "12px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.sub }}>{h.dayRange} · {h.city}</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: "4px 0 0" }}>You're booking this stay</p>
                    <p style={{ fontSize: 12, color: C.sub, margin: 0, lineHeight: "17px", flex: 1 }}>We won't arrange a hotel in {h.city}. It's removed from your total.</p>
                    {editable && (
                      <button onClick={() => restoreStay(i)} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 20, border: `1px solid ${C.div}`, background: C.white, color: C.p600, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <Plus size={13} /> Let us book it
                      </button>
                    )}
                  </div>
                </div>
              );
            }
            return (
            <div key={i} style={{ width: 280, minWidth: 280, flexShrink: 0 }}>
              <HotelStayCard
                image={h.img}
                imageAlt={h.name}
                dayLabel={h.dayRange}
                soldOut={soldOut}
                topRightBadge={soldOut ? (
                  <span style={{ background: C.p600, color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999, letterSpacing: "0.3px", boxShadow: "0 1px 6px rgba(0,0,0,0.25)" }}>Sold out</span>
                ) : undefined}
                stars={h.stars}
                ratingScore={h.rating}
                name={h.name}
                roomType={h.type}
                city={h.city}
                freeCancellation={h.freeCancellation}
                to={`/hotel-detail/${it.id}/${i}/${encodeURIComponent(h.hotelId || "")}?current=${encodeURIComponent(h.hotelId || "")}${dealQS}`}
                footer={
                  <>
                    {ls?.status === "price_up" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF4ED", border: "1px solid #FED7AA", borderRadius: 8, padding: "6px 8px", marginTop: 4 }}>
                        <AlertTriangle size={13} color="#EA580C" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5, color: "#C2410C", fontWeight: 700, lineHeight: "15px" }}>
                          Price rose +₹{ls.delta.toLocaleString("en-IN")}/person since you saved
                        </span>
                      </div>
                    )}
                    {editable && (
                      <span
                        data-tour="change-hotel"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openHotelFlow(i, h.hotelId); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.p600, marginTop: 8, alignSelf: "flex-start" }}
                      >
                        <ArrowLeftRight size={13} color={C.p600} />
                        Change hotel
                      </span>
                    )}
                    {h.inclusions && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setInclHotel(h); }}
                        style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 0", border: "none", background: "none", color: C.p600, fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        <Sparkles size={13} color={C.p600} />
                        View special inclusions
                      </button>
                    )}
                  </>
                }
              />
            </div>
            );
          })}
        </div>

        {/* Special inclusions live behind a per-hotel CTA on the card (drawer),
            keeping this area free for the hotel-upgrade banner below. */}

        {/* Sold-out is communicated on the hotel card itself (badge) + toast; no section banner. */}

        {/* Single hotel-upgrade banner (per-card chips removed) */}
        {upgradeInfo.upgradeCount >= 1 && (
          <div onClick={() => setShowUpgradeDrawer(true)} style={{
            margin: "16px 16px 0", background: "linear-gradient(135deg, #FFF8E7 0%, #FFF1D6 100%)", border: "1.5px solid #E8D5A3",
            borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: C.white,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Sparkles size={16} color="#B8860B" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.head, display: "flex", alignItems: "center", gap: 2, lineHeight: "18px" }}>
                Hotel upgrades available
              </span>
              <span style={{ fontSize: 12, color: C.sub, fontWeight: 500, lineHeight: "16px", marginTop: 2, display: "flex", alignItems: "center", gap: 2 }}>
                Upgrade to 5<Star size={9} fill="#F5A623" stroke="#F5A623" strokeWidth={1.5} /> from <span style={{ color: "#B8860B", fontWeight: 600 }}>+₹{Math.min(...upgradeInfo.upgrades.map(u => u.totalDelta)).toLocaleString("en-IN")}</span>
              </span>
            </div>
            <span style={{ fontSize: 12, color: "#B8860B", fontWeight: 600, whiteSpace: "nowrap" }}>View upgrade</span>
          </div>
        )}
      </div>

      <Divider />

      {/* ═══ Invite partner (co-planner) ═══ */}
      <InvitePartnerSection destination={it.dest} />

      <Divider />

      {/* ═══ 5. Flights ═══ */}
      {(() => {
        const padCard = { border: `1px solid ${C.div}`, borderRadius: 16, background: C.white, boxShadow: "0 4px 4px -2px rgba(0,0,0,0.06)", padding: "12px 14px 14px" };
        const changeStyle = { display: "inline-flex", alignItems: "center", gap: 1, flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: C.p600, textDecoration: "none", border: `1px solid ${C.div}`, borderRadius: 20, padding: "5px 12px", background: C.white };
        const divider = <div style={{ borderTop: `1px solid ${C.div}`, margin: "12px 0" }} />;
        const priceRow = (price, left) => (
          <div style={{ display: "flex", justifyContent: left ? "space-between" : "flex-end", alignItems: "baseline", gap: 8 }}>
            {left}
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>₹{formatPrice(price)}</span>
              <span style={{ fontSize: 12, color: C.sub }}>/Person</span>
            </div>
          </div>
        );
        // Per-leg airline header — airline shown ON its own flight so the carrier
        // for each leg is unambiguous. Optional trailing control (Remove).
        const legHead = (label, f, control) => (
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: ".3px", flexShrink: 0 }}>{label}</span>
            <span style={{ flex: 1, textAlign: "right", fontSize: 12.5, fontWeight: 600, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f?.airline}</span>
            {control}
          </div>
        );

        const homeQS = `&home=${encodeURIComponent(departureCity)}`;
        const outTo = `/flights/${it.id}/${intlOutIdx}?current=${encodeURIComponent(selOut?.id || "")}${dealQS}${homeQS}`;
        // Per-leg "Change" — selection is one flight at a time, so each leg links
        // to its own single-leg chooser (one-way mode).
        const changeCtrl = (legIdx, f) => (
          <Link to={`/flights/${it.id}/${legIdx}?current=${encodeURIComponent(f?.id || "")}${dealQS}${homeQS}&mode=oneway`} style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.p600, textDecoration: "none" }}>
            <ArrowLeftRight size={13} /> Change
          </Link>
        );

        const removeBtn = (onClick) => (
          <button onClick={onClick} aria-label="Remove flight" style={{ display: "inline-flex", alignItems: "center", gap: 2, flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.sub, border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
            <XIcon size={12} /> Remove
          </button>
        );
        const addEmpty = (label, onClick) => (
          <button onClick={onClick} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "24px 14px", border: `1.5px dashed ${C.p300}`, borderRadius: 16, background: C.white, color: C.p600, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={18} /> Add {label} flight
          </button>
        );
        // One-way leg card (with per-leg Change + Remove) or an empty add slot.
        const owCard = (f, added, setAdded, label, legIdx) => (added && f) ? (
          <div style={padCard}>
            {legHead(label, f, removeBtn(() => setAdded(false)))}
            <FlightLegRow f={f} />
            {divider}
            {priceRow(f.price, changeCtrl(legIdx, f))}
          </div>
        ) : addEmpty(label.toLowerCase(), () => setAdded(true));

        // Kebab menu: lets the customer hand flight booking back to themselves
        // (drops flights from our package + cost) or undo that.
        const flightsMenu = (
          <div style={{ position: "relative" }}>
            <button onClick={() => setFlightsMenuOpen(o => !o)} aria-label="Flight options" style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <MoreHorizontal size={16} color={C.sub} />
            </button>
            {flightsMenuOpen && (
              <>
                <div onClick={() => setFlightsMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 31, minWidth: 196, background: C.white, border: `1px solid ${C.div}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
                  <button onClick={() => { setFlightsIncluded(v => !v); setFlightsMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.head, textAlign: "left" }}>
                    <Plane size={15} color={C.sub} />
                    {flightsIncluded ? "I'll book the flights myself" : "Let us book the flights"}
                  </button>
                </div>
              </>
            )}
          </div>
        );

        return (
          <div style={{ padding: "0 16px" }}>
            {/* Section header: Flights + remove/add-flights toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>Flights</p>
              {flightsMenu}
            </div>

            {!flightsIncluded ? (
              /* Package only — no flights, no flight cost */
              <div style={{ ...padCard, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center", padding: "24px 16px" }}>
                <Plane size={20} color={C.sub} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.head }}>You're booking flights yourself</span>
                <span style={{ fontSize: 12, color: C.sub }}>Flights aren't included in your total. Use the ⋯ menu to let us book them.</span>
              </div>
            ) : (
              <>
                {/* Departure city in India (re-routes + re-prices the flights) */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Plane size={13} color={C.sub} />
                  <span style={{ fontSize: 12.5, color: C.sub }}>Departing from</span>
                  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                    <select value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} style={{ appearance: "none", WebkitAppearance: "none", border: `1px solid ${C.div}`, borderRadius: 8, background: C.white, padding: "4px 24px 4px 10px", fontSize: 12.5, fontWeight: 600, color: C.head, fontFamily: "inherit", cursor: "pointer" }}>
                      {["Indore", "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Ahmedabad"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} color={C.sub} style={{ position: "absolute", right: 7, pointerEvents: "none" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* International */}
                  {deptChanged ? (
                    /* Departure city changed → prior selection void; prompt to choose */
                    <Link to={outTo} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "28px 16px", border: `1.5px dashed ${C.p300}`, borderRadius: 16, background: C.white, textAlign: "center" }}>
                      <Plane size={20} color={C.p600} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.head }}>Select your flights from {departureCity}</span>
                      <span style={{ fontSize: 12, color: C.sub }}>Your earlier choice no longer applies. Tap to pick outbound & return.</span>
                    </Link>
                  ) : intlMode === "roundtrip" ? (
                    /* One paired card, single combined price + a single Change at the price row */
                    <div style={padCard}>
                      {selOut && <>{legHead("Outbound", selOut)}<FlightLegRow f={selOut} /></>}
                      {divider}
                      {selRet && <>{legHead("Return", selRet)}<FlightLegRow f={selRet} /></>}
                      {divider}
                      {priceRow((selOut?.price || 0) + (selRet?.price || 0),
                        <Link to={outTo} style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: 12, fontWeight: 600, color: C.p600, textDecoration: "none" }}>
                          <ArrowLeftRight size={13} /> Change flights
                        </Link>
                      )}
                    </div>
                  ) : (
                    <>
                      {owCard(selOut, outAdded, setOutAdded, "Outbound", intlOutIdx)}
                      {owCard(selRet, retAdded, setRetAdded, "Return", intlRetIdx)}
                    </>
                  )}

                  {/* Connecting / domestic legs — same list, airline + per-leg Change */}
                  {domesticLegs.map(({ l, i }) => {
                    const f = getFlightForLeg(i);
                    return (
                      <div key={i} style={padCard}>
                        {legHead(`${l.fromCity} → ${l.toCity}`, f, changeCtrl(i, f))}
                        {f && <FlightLegRow f={f} />}
                        {divider}
                        {priceRow(f?.price || 0)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })()}

      <Divider />

      {/* ═══ 7. Traveler Stories ═══ */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <span style={{ fontSize: 20, fontWeight: 700, color: C.head }}>4.6</span>
          <span style={{ fontSize: 12, color: C.sub }}>/5</span>
          <div style={{ display: "flex", gap: 1, marginLeft: 4 }}>{[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />)}</div>
        </div>
        <p style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>Based on Google reviews</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.head, marginBottom: 10 }}>Our customers say</p>
        {destReviews.slice(0, 3).map((r, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: C.sub, flexShrink: 0 }}>{r.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>{r.name}</p>
                  <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(s => <Star key={s} size={10} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />)}</div>
                </div>
                <p style={{ fontSize: 13, color: C.sub, margin: "4px 0 0", lineHeight: "18px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>"{r.text}"</p>
              </div>
            </div>
            {i < 2 && <div style={{ height: 1, background: C.div }} />}
          </div>
        ))}
      </div>

      <Divider />

      {/* ═══ 6. Journey Map ═══ */}
      <div style={{ padding: "0 16px" }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: C.head, marginBottom: 12 }}>Journey Map</p>
        <JourneyMap stops={mapStops} height={220} onExpand={() => setShowMap(true)} />
      </div>

      <Divider />

      {/* ═══ 8. Cost breakdown ═══ */}
      <div id="cost-breakdown" style={{ padding: "0 16px", scrollMarginTop: 12 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 12px" }}>Cost breakdown</p>
        <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden" }}>
          {[
            { label: "Flights", value: costSplit.flights, hide: costSplit.flights <= 0 },
            { label: "Hotels", value: costSplit.hotels },
            { label: "Activities", value: costSplit.activities },
            { label: "Taxes (incl. TCS)", value: costSplit.gst + costSplit.tcs },
            { label: "Discount", value: -costSplit.discount, hide: costSplit.discount <= 0, accent: true },
          ].filter(r => !r.hide).map((r, i) => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderTop: i === 0 ? "none" : `1px solid ${C.div}` }}>
              <span style={{ fontSize: 13.5, color: C.sub }}>{r.label}</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: r.accent ? "#027A48" : C.head }}>
                {r.value < 0 ? "− " : ""}₹{Math.abs(r.value).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 14px", borderTop: `1px solid ${C.div}`, background: C.p50 || "#FFF1F4" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.head }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.head }}>₹{costSplit.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: C.inact, margin: "8px 2px 0", lineHeight: "15px" }}>
          You can claim the TCS amount when filing your income tax return.
        </p>
      </div>

      {/* Bottom padding for sticky CTA */}
      <div style={{ height: 20 }} />

      {/* ═══ Sticky footer - changes panel (floating) + price/CTA row ═══ */}
      <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 20 }}>
        {/* Floating "changes since last version" panel */}
        {inDeal && hasChanges && !fetchingPrice && (
          <div style={{ background: C.white, borderTop: `1px solid ${C.div}`, boxShadow: "0 -6px 20px rgba(0,0,0,0.07)" }}>
            <button onClick={() => setShowChanges(s => !s)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <Sparkles size={14} color={C.p600} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.head, flex: 1, textAlign: "left" }}>
                {changes.length} change{changes.length !== 1 ? "s" : ""} since your last version
              </span>
              {showChanges ? <ChevronDown size={16} color={C.sub} /> : <ChevronUp size={16} color={C.sub} />}
            </button>
            {showChanges && (
              <div style={{ padding: "0 16px 12px", maxHeight: 220, overflowY: "auto" }}>
                {changes.map((ch, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${C.bg}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.head }}>{ch.title}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 12, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.detail}</p>
                    </div>
                    <button onClick={() => undoChange(ch)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.div}`, background: C.white, fontSize: 12, fontWeight: 600, color: C.head, cursor: "pointer", fontFamily: "inherit" }}>
                      Undo
                    </button>
                  </div>
                ))}
                <button data-testid="discard-copy" onClick={handleDiscardChanges} style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.div}`, background: C.white, color: C.sub, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Discard all changes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Price changes (hotel + activity) — orange warning just above the action bar */}
        {liveResult && (liveResult.hotelDelta > 0 || liveResult.tour?.delta > 0) && !fetchingPrice && (
          <div style={{ background: "#FFF4ED", borderTop: "1px solid #FED7AA", padding: "9px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {liveResult.hotelDelta > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={13} color="#EA580C" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.head, lineHeight: "16px" }}>
                  <b style={{ fontWeight: 700 }}>Hotel price</b> rose +₹{liveResult.hotelDelta.toLocaleString("en-IN")}/person at today's rates. Included in your total.
                </span>
              </div>
            )}
            {liveResult.tour?.delta > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={13} color="#EA580C" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.head, lineHeight: "16px" }}>
                  <b style={{ fontWeight: 700 }}>{liveResult.tour.name}</b> rose +₹{liveResult.tour.delta.toLocaleString("en-IN")}/person at today's rates. Included in your total.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price + CTA row */}
        <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", padding: "10px 16px 12px", display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", borderTop: `1px solid ${C.div}` }}>
        {fetchingPrice ? (
          <div data-testid="price-loader" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "2px 0" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2.5px solid ${C.p100}`, borderTopColor: C.p600, animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>Fetching your price, please wait…</p>
              <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.sub }}>{FETCH_MSGS[fetchMsgIdx % FETCH_MSGS.length]}</p>
            </div>
          </div>
        ) : !inDeal ? (
          /* Explore itinerary - no quote/PDF; just start planning. */
          <>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: 11, color: C.sub }}>From</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.head }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <p style={{ fontSize: 11, color: C.inact, margin: 0 }}>Total for {travellers} · incl. GST & TCS{hasChosenFlights ? " & flights" : ""}</p>
            </div>
            <Link to={`/build?dest=${encodeURIComponent(it.dest)}&skipActivities=1`} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "13px 20px", borderRadius: 12,
              background: C.p600, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(227,27,83,0.3)",
            }}>
              Plan My Trip <ArrowRight size={14} />
            </Link>
          </>
        ) : (
        <>
        <div style={{ minWidth: 0 }}>
          {validQuote ? (
            <>
              <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Final price</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head }}>₹{grandTotal.toLocaleString("en-IN")}</p>
                <button onClick={() => document.getElementById("cost-breakdown")?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-label="View cost breakdown" style={{ background: "none", border: "none", padding: 2, cursor: "pointer", display: "inline-flex", lineHeight: 0 }}>
                  <Info size={15} color={C.sub} />
                </button>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 10.5, color: C.inact }}>Quote generated on {new Date(version.pricedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Indicative total</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head }}>₹{grandTotal.toLocaleString("en-IN")}</p>
                <button onClick={() => document.getElementById("cost-breakdown")?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-label="View cost breakdown" style={{ background: "none", border: "none", padding: 2, cursor: "pointer", display: "inline-flex", lineHeight: 0 }}>
                  <Info size={15} color={C.sub} />
                </button>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: 10.5, color: C.inact }}>Not saved yet, your consultant can't see this</p>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {validQuote ? (
            <>
              <button data-testid="download-pdf" onClick={handleDownloadPdf} style={{ display: "flex", alignItems: "center", gap: 5, padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: "#027A48", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <Download size={15} /> PDF
              </button>
              <button data-testid="call-consultant" onClick={() => alert("Calling your travel consultant…")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 18px", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(227,27,83,0.3)" }}>
                <Phone size={15} /> Call consultant
              </button>
            </>
          ) : hasChanges ? (
            <button data-testid="create-itinerary" data-tour="save" onClick={handleGetFinalPrice} disabled={fetchingPrice} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(227,27,83,0.3)", opacity: fetchingPrice ? 0.7 : 1 }}>
              {fetchingPrice ? "Checking availability…" : "Save Itinerary"}
            </button>
          ) : (
            <button data-testid="get-final-price" data-tour="save" onClick={handleGetFinalPrice} disabled={fetchingPrice} style={{ padding: "12px 18px", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(227,27,83,0.3)", opacity: fetchingPrice ? 0.7 : 1 }}>
              {fetchingPrice ? "Checking availability…" : "Save Itinerary"}
            </button>
          )}
        </div>
        </>
        )}
        </div>
      </div>

      {/* ═══ Stories-Style Video Viewer ═══ */}
      {showViewer && (
        <VideoViewer
          days={daysWithActivities}
          dest={it.dest}
          itineraryId={it.id}
          initialDay={showViewer.day}
          initialActivity={showViewer.activity}
          onPhotoOpen={(dayNum, photoIdx) => setShowDayPhotos({ dayNum, photoIdx })}
          onClose={() => setShowViewer(null)}
        />
      )}

      {/* ═══ Day Detail (full-screen, from "Details" pill) ═══ */}
      {dayDetailIndex !== null && (
        <DayDetailScreen
          days={daysWithActivities}
          dayIndex={dayDetailIndex}
          setDayIndex={setDayDetailIndex}
          dest={it.dest}
          itineraryId={it.id}
          canChangeDay={dayHasOptions(dayDetailIndex)}
          onChangeDay={(i) => { setDayDetailIndex(null); setChangeDayIndex(i); }}
          onPhotoOpen={(dayNum, photoIdx) => setShowDayPhotos({ dayNum, photoIdx })}
          onClose={() => setDayDetailIndex(null)}
        />
      )}

      {/* ═══ Itinerary Map (full-screen, from the Journey Map preview) ═══ */}
      {showMap && (
        <ItineraryMapScreen
          days={daysWithActivities}
          hotels={hotels}
          dest={it.dest}
          travelDates={travelDates}
          onClose={() => setShowMap(false)}
        />
      )}

      {showTour && <SpotlightTour steps={TOUR_STEPS} onClose={() => setShowTour(false)} />}

      {/* ═══ Day score metric drawer (from the day panel tiles) ═══ */}
      {/* Wrapped in a fixed viewport frame so the Sheet's inset:0 fills the
          screen (not the tall scroll content) and the drawer shows at the bottom. */}
      {dayScore && (
        <div style={{ ...overlayFrame, zIndex: 170 }}>
          <DayScoreModal
            metric={dayScore.metric}
            scoring={dayScore.scoring}
            allDaysScoring={getAllDaysScoring(daysWithActivities)}
            currentDayIdx={dayScore.dayIdx}
            dayLabel={dayScore.dayLabel}
            onClose={() => setDayScore(null)}
          />
        </div>
      )}

      {/* ═══ Leave guard: unsaved edits → discard or create the itinerary ═══ */}
      {leavePrompt && (
        <div style={{ ...overlayFrame, zIndex: 190, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={() => setLeavePrompt(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div style={{ position: "relative", width: "100%", maxWidth: 360, background: C.white, borderRadius: 20, padding: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.22)" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Save your changes?</p>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 18px", lineHeight: "20px" }}>
              You've edited this itinerary but haven't created it yet. Create it now, or save your changes as a draft to finish later.
            </p>
            <button
              onClick={createItineraryAndLeave}
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Create the itinerary
            </button>
            <button
              onClick={saveDraftAndLeave}
              style={{ width: "100%", marginTop: 10, padding: "12px 0", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Save as draft
            </button>
            <button
              onClick={() => setLeavePrompt(false)}
              style={{ width: "100%", marginTop: 6, padding: "10px 0", border: "none", background: "none", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              Keep editing
            </button>
          </div>
        </div>
      )}

      {/* ═══ Day-wise Full Screen (Vietnam) ═══ */}
      {showDayWiseDrawer && (
        <DayWiseScreen
          days={daysWithActivities}
          dest={it.dest}
          itineraryId={it.id}
          hotels={hotels}
          activeDay={drawerActiveDay}
          setActiveDay={setDrawerActiveDay}
          onPlay={(day, activity) => setShowViewer({ day, activity })}
          onChangeDay={(globalDayIndex) => setChangeDayIndex(globalDayIndex)}
          onPhotoOpen={(dayNum, photoIdx) => setShowDayPhotos({ dayNum, photoIdx })}
          dayHasOptions={dayHasOptions}
          onClose={() => setShowDayWiseDrawer(false)}
        />
      )}

      {/* ═══ Pricing Details Bottom Sheet ═══ */}
      {showPricingSheet && (
        <PricingSheet
          onClose={() => setShowPricingSheet(false)}
          initialDates={travelDates}
          onSubmit={(data) => {
            setTravelDates(data);
            setPricingState("loading");
            setShowPricingSheet(false);
            // Simulate live price fetch
            setTimeout(() => setPricingState("live"), 2000);
          }}
        />
      )}

      {/* ═══ Change Day Bottom Sheet ═══ */}
      {changeDayData && (
        <ChangeDaySheet
          dayData={changeDayData}
          combinations={getAllDayCombinations(it, changeDayIndex, daysWithActivities)?.combinations || []}
          onSelect={(option) => handleChangeDaySelect(changeDayIndex, option)}
          onPreview={(option) => setPreviewDay({ dayIndex: changeDayIndex, option })}
          onClose={() => setChangeDayIndex(null)}
        />
      )}

      {/* Day preview overlay (above the tray) - visualise an option before finalising */}
      {previewDay && (
        <DayPreviewViewer
          option={previewDay.option}
          dest={it.dest}
          days={daysWithActivities}
          dayIndex={previewDay.dayIndex}
          dayNumber={daysWithActivities[previewDay.dayIndex]?.dayNum}
          city={daysWithActivities[previewDay.dayIndex]?.city}
          itineraryId={it.id}
          onChoose={() => { handleChangeDaySelect(previewDay.dayIndex, previewDay.option); setPreviewDay(null); setAllCombosIndex(null); }}
          onBack={() => setPreviewDay(null)}
          onPhotoOpen={(dayNum, photoIdx) => setShowDayPhotos({ dayNum, photoIdx })}
        />
      )}

      {/* ═══ Day-change confirmation ═══ */}
      {pendingDayChange && (() => {
        const { dayIndex, option } = pendingDayChange;
        const day = daysWithActivities[dayIndex];
        const currentOpt = selectedDayOptions[dayIndex];
        const fromList = (currentOpt?.activities || day?.sub.split(" · ") || []).join(", ");
        const toList = (option.activities || []).join(", ");
        const incremental = (option.priceDelta || 0) - (currentOpt?.priceDelta || 0);
        return (
          <div style={{ ...overlayFrame, zIndex: 160, display: "flex", alignItems: "flex-end" }}>
            <div onClick={() => setPendingDayChange(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
            <div style={{ position: "relative", width: "100%", background: C.white, borderRadius: "20px 20px 0 0", padding: "20px 18px calc(20px + env(safe-area-inset-bottom))", boxShadow: "0 -8px 32px rgba(0,0,0,0.18)" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 14px" }}>Change Day {day?.dayNum}, {day?.city}?</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ borderRadius: 12, border: `1px solid ${C.div}`, padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: C.inact, textTransform: "uppercase", letterSpacing: 0.4 }}>Current plan</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: "18px" }}>{fromList}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <ChevronDown size={16} color={C.p600} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.p600 }}>Changing to</span>
                </div>
                <div style={{ borderRadius: 12, border: `1.5px solid ${C.p300}`, background: C.p100, padding: "10px 12px" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: C.p600, textTransform: "uppercase", letterSpacing: 0.4 }}>New plan</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.head, fontWeight: 600, lineHeight: "18px" }}>{toList}</p>
                </div>
              </div>

              {(() => {
                const deltaTotal = incremental * travellers;
                const newTotal = grandTotal + deltaTotal;
                return (
                  <div style={{ padding: "12px 14px", borderRadius: 12, background: C.bg, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: C.sub }}>Your trip now</span>
                      <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        {deltaTotal !== 0 && <span style={{ fontSize: 13, color: C.inact, textDecoration: "line-through" }}>₹{grandTotal.toLocaleString("en-IN")}</span>}
                        <span style={{ fontSize: 18, fontWeight: 800, color: C.head }}>₹{newTotal.toLocaleString("en-IN")}</span>
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub }}>
                        {deltaTotal === 0 ? "No change in price" : deltaTotal > 0 ? `+₹${deltaTotal.toLocaleString("en-IN")} for this change` : `You save ₹${Math.abs(deltaTotal).toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button onClick={applyDayChange} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
                Continue
              </button>
              <button onClick={() => setPendingDayChange(null)} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Go back
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ Toast Notification ═══ */}
      {toast && (
        <div style={{ ...overlayFrame, zIndex: 150, pointerEvents: "none" }}>
          <div style={{
            position: "absolute",
            bottom: 70, left: 16, right: 16,
            background: "rgba(24,29,39,0.95)",
            color: "#fff",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            pointerEvents: "auto",
            animation: "toastSlideUp 0.3s ease-out forwards",
            fontSize: 13,
            fontWeight: 500,
          }}>
            <span>{toast.message}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              {toast.undoData && (
                <button
                  onClick={handleUndo}
                  style={{
                    background: "none", border: "none",
                    color: C.p300, fontSize: 13, fontWeight: 600,
                    cursor: "pointer", textDecoration: "underline",
                    fontFamily: "inherit",
                  }}
                >
                  Undo
                </button>
              )}
              <button
                onClick={() => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); setToast(null); }}
                aria-label="Dismiss"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center" }}
              >
                <XIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Special Inclusions Drawer ═══ */}
      {inclHotel && (
        <InclusionsDrawer
          hotelName={inclHotel.name}
          city={inclHotel.city}
          inclusions={inclHotel.inclusions}
          onClose={() => setInclHotel(null)}
        />
      )}

      {/* ═══ Hotel Upgrade Drawer ═══ */}
      {showUpgradeDrawer && upgradeInfo.upgradeCount > 0 && (
        <HotelUpgradeDrawer
          upgrades={upgradeInfoDisplay.upgrades}
          totalAdditional={upgradeInfoDisplay.totalAdditional}
          onClose={() => setShowUpgradeDrawer(false)}
        />
      )}

      {/* ═══ Day Traveller Photos Fullscreen ═══ */}
      {showDayPhotos && customerPhotos[it.dest] && (
        <DayPhotosGallery
          dest={it.dest}
          dayNum={showDayPhotos.dayNum}
          startIdx={showDayPhotos.photoIdx}
          onClose={() => setShowDayPhotos(null)}
        />
      )}
    </div>
  );
}

// ═══ Day Traveller Photos (inline in each day) ═══
function DayTravellerPhotos({ dest, dayNum, dayIndex, totalDays, onPhotoClick }) {
  const photos = customerPhotos[dest];
  const tags = getCustomerPhotos(dest);
  const names = couplePhotoNames[dest] || [];
  const count = couplesCount[dest] || 500;
  if (!photos || photos.length === 0) return null;

  // Pick 3 photos per day by rotating through the pool
  const startOffset = (dayIndex * 3) % photos.length;
  const dayPhotos = [0, 1, 2].map(i => {
    const idx = (startOffset + i) % photos.length;
    return { img: photos[idx], tag: tags[idx]?.tag || dest, couple: names[idx] || "", realIdx: idx };
  });

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <Camera size={12} color={C.p600} />
        <span style={{ fontSize: 11, fontWeight: 600, color: C.head }}>Day {dayNum} photos from travelers</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {dayPhotos.map((p, i) => (
          <div key={i} onClick={() => onPhotoClick(p.realIdx)} style={{ flex: 1, height: 70, borderRadius: 10, overflow: "hidden", position: "relative", cursor: "pointer" }}>
            <img src={p.img} alt={p.tag} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 30%, rgba(0,0,0,0.65))" }} />
            <span style={{ position: "absolute", bottom: 4, left: 5, right: 5, fontSize: 11, fontWeight: 600, color: "#fff", lineHeight: "10px" }}>{p.tag}</span>
          </div>
        ))}
      </div>
      {/* CTA nudge */}
      <div onClick={() => onPhotoClick(dayPhotos[0].realIdx)} style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
        <Play size={10} color={C.p600} fill={C.p600} />
        <span style={{ fontSize: 11, fontWeight: 600, color: C.p600 }}>See how {count}+ couples experienced this</span>
      </div>
    </div>
  );
}

// ═══ Day Photos Fullscreen Gallery ═══
function DayPhotosGallery({ dest, dayNum, startIdx, onClose }) {
  // Full list with per-photo tag + couple name
  const urls = customerPhotos[dest] || [];
  const tags = photoTags[dest] || [];
  const names = couplePhotoNames[dest] || [];
  const allItems = urls.map((img, i) => ({ img, tag: tags[i] || dest, name: names[i] || dest }));

  // Filter chips: All + unique tags
  const uniqueTags = [...new Set(allItems.map(p => p.tag))];
  const [filter, setFilter] = useState("All");
  const items = filter === "All" ? allItems : allItems.filter(p => p.tag === filter);

  const [idx, setIdx] = useState(Math.min(startIdx || 0, allItems.length - 1));
  const touchRef = useRef(null);
  const railRef = useRef(null);
  const total = items.length;
  const current = items[idx] || items[0];

  // Mobile fills the viewport; desktop centers a phone-sized box (mirrors VideoViewer).
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const frameStyle = isMobile
    ? { position: "fixed", inset: 0, borderRadius: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44 };

  const pickFilter = (f) => { setFilter(f); setIdx(0); };
  const handleTouchStart = (e) => { touchRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchRef.current === null) return;
    const diff = touchRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && idx < total - 1) setIdx(idx + 1);
      else if (diff < 0 && idx > 0) setIdx(idx - 1);
    }
    touchRef.current = null;
  };

  return (
    <div style={{ ...frameStyle, zIndex: 450, background: "#000", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Top bar: counter + close */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "50px 16px 10px", zIndex: 2, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{idx + 1}/{total}</span>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <XIcon size={18} color="#fff" />
        </button>
      </div>

      {/* Filter chips */}
      <div className="hs hide-scrollbar" style={{ gap: 8, padding: "4px 16px 12px", flexShrink: 0 }}>
        {["All", ...uniqueTags].map((f) => (
          <button
            key={f}
            onClick={() => pickFilter(f)}
            style={{
              flexShrink: 0, padding: "9px 16px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
              fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
              display: "inline-flex", alignItems: "center", gap: 5,
              background: filter === f ? C.p600 : "rgba(255,255,255,0.12)",
              color: "#fff", border: filter === f ? "none" : "1px solid rgba(255,255,255,0.25)",
            }}
          >
            {filter === f && f === "All" && <span style={{ fontWeight: 700 }}>✓</span>}
            {f}
          </button>
        ))}
      </div>

      {/* Main image */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <img src={current?.img} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {idx > 0 && <div onClick={() => setIdx(idx - 1)} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "30%", cursor: "pointer" }} />}
        {idx < total - 1 && <div onClick={() => setIdx(idx + 1)} style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "30%", cursor: "pointer" }} />}
      </div>

      {/* Caption */}
      <div style={{ textAlign: "center", padding: "14px 16px 10px", flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{current?.tag}</span>
        <span style={{ fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}> · {dest}</span>
      </div>

      {/* Thumbnail rail */}
      <div ref={railRef} className="hs hide-scrollbar" style={{ gap: 8, padding: "0 16px 28px", flexShrink: 0 }}>
        {items.map((p, i) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: 64, height: 64, minWidth: 64, borderRadius: 12, overflow: "hidden", cursor: "pointer",
              border: i === idx ? `2px solid ${C.p600}` : "2px solid transparent",
              opacity: i === idx ? 1 : 0.85,
            }}
          >
            <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ All Combinations browse screen (full-screen list + filters) ═══
const PACE_LABELS = { relaxed: "Relaxed", balanced: "Balanced", active: "Active" };
function AllDayCombinationsScreen({ data, onPreview, onBack }) {
  const [paceFilter, setPaceFilter] = useState([]);
  const [actFilter, setActFilter] = useState([]);
  const [openFilter, setOpenFilter] = useState(null); // null | "pace" | "activities"
  const [actSearch, setActSearch] = useState("");

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const frameStyle = isMobile
    ? { position: "fixed", inset: 0, borderRadius: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44 };

  if (!data) return null;
  const { dayNumber, city, combinations } = data;

  // Filter facets
  const paceOpts = [...new Set(combinations.map(c => c.scoring.pace))];
  const actOpts = [...new Set(combinations.flatMap(c => c.activities))];

  const toggle = (list, setList, val) =>
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);

  const filtered = combinations.filter(c => {
    const paceOk = paceFilter.length === 0 || paceFilter.includes(c.scoring.pace);
    const actOk = actFilter.length === 0 || c.activities.some(a => actFilter.includes(a));
    return paceOk && actOk;
  });

  const totalActive = paceFilter.length + actFilter.length;

  const sheetChip = (label, active, onClick) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
        fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
        border: `1px solid ${active ? C.p600 : C.div}`,
        background: active ? C.p600 : C.white,
        color: active ? "#fff" : C.head,
      }}
    >
      {label}
    </button>
  );

  // Floating filter button
  const filterPill = (label, count, key) => (
    <button
      data-testid={`filter-${key}`}
      onClick={() => { setActSearch(""); setOpenFilter(key); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 16px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
        fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
        border: `1px solid ${count > 0 ? C.p600 : C.div}`,
        background: count > 0 ? C.p100 : C.white,
        color: count > 0 ? C.p600 : C.head,
      }}
    >
      <SlidersHorizontal size={14} color={count > 0 ? C.p600 : C.sub} />
      {label}{count > 0 ? ` · ${count}` : ""}
    </button>
  );

  const visibleActOpts = actOpts.filter(a => a.toLowerCase().includes(actSearch.trim().toLowerCase()));

  return (
    <div style={{ ...frameStyle, zIndex: 350, background: C.white, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "50px 16px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.div}`, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={18} color={C.head} />
        </button>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>All day plans</p>
          <p style={{ margin: "1px 0 0", fontSize: 12, color: C.sub }}>Day {dayNumber} · {city}</p>
        </div>
      </div>

      {/* Result list */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "12px 16px 84px" }}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: C.sub }}>
          {filtered.length} {filtered.length === 1 ? "plan" : "plans"}
        </p>
        {filtered.map((c, ci) => (
          <div
            key={c.id}
            data-testid={`combo-card-${ci}`}
            onClick={() => onPreview(c)}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: 10, marginBottom: 10,
              border: `1px solid ${C.div}`, borderRadius: 14, background: C.white, cursor: "pointer",
            }}
          >
            <img src={c.heroImage} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head, lineHeight: 1.3 }}>
                {c.activities.join(", ")}
              </p>
              <p style={{ margin: "5px 0 0", fontSize: 11, color: C.sub }}>
                {PACE_LABELS[c.scoring.pace]}
                {c.priceDelta !== 0 && (
                  <span style={{ color: c.priceDelta > 0 ? "#D92D20" : "#039855", fontWeight: 600 }}>
                    {"  ·  "}{c.priceDelta > 0 ? "+" : "−"}₹{Math.abs(c.priceDelta).toLocaleString("en-IN")}
                  </span>
                )}
              </p>
            </div>
            <ChevronRight size={18} color={C.inact} style={{ flexShrink: 0 }} />
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: C.sub, fontSize: 13, marginTop: 40 }}>
            No plans match these filters.
          </p>
        )}
      </div>

      {/* Floating filter row */}
      <div style={{
        position: "absolute", bottom: "calc(16px + env(safe-area-inset-bottom))", left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 10, zIndex: 6, pointerEvents: "none",
      }}>
        <div style={{ display: "inline-flex", gap: 10, pointerEvents: "auto", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.18))" }}>
          {filterPill("Pace", paceFilter.length, "pace")}
          {filterPill("Activities", actFilter.length, "activities")}
          {totalActive > 0 && (
            <button
              onClick={() => { setPaceFilter([]); setActFilter([]); }}
              style={{
                display: "inline-flex", alignItems: "center", padding: "10px 14px", borderRadius: 999,
                border: `1px solid ${C.div}`, background: C.white, color: C.sub,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter sheet */}
      {openFilter && (
        <>
          <div onClick={() => setOpenFilter(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 10 }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 11,
            background: C.white, borderRadius: "20px 20px 0 0",
            display: "flex", flexDirection: "column", maxHeight: "72%",
            animation: "sheetSlideUp 0.28s ease-out forwards",
          }}>
            {/* Sheet header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head }}>
                {openFilter === "pace" ? "Pace" : "Activities"}
              </p>
              <button onClick={() => setOpenFilter(null)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <XIcon size={16} color={C.sub} />
              </button>
            </div>

            {/* Activities search */}
            {openFilter === "activities" && (
              <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: C.bg, border: `1px solid ${C.div}` }}>
                  <Search size={16} color={C.inact} />
                  <input
                    data-testid="activity-search"
                    value={actSearch}
                    onChange={(e) => setActSearch(e.target.value)}
                    placeholder="Search activities"
                    autoFocus
                    style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, color: C.head, fontFamily: "inherit" }}
                  />
                  {actSearch && (
                    <button onClick={() => setActSearch("")} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", padding: 0 }}>
                      <XIcon size={15} color={C.inact} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px", display: "flex", flexWrap: "wrap", gap: 8, alignContent: "flex-start" }}>
              {openFilter === "pace"
                ? paceOpts.map(p => sheetChip(PACE_LABELS[p] || p, paceFilter.includes(p), () => toggle(paceFilter, setPaceFilter, p)))
                : visibleActOpts.length > 0
                  ? visibleActOpts.map(a => sheetChip(a, actFilter.includes(a), () => toggle(actFilter, setActFilter, a)))
                  : <p style={{ width: "100%", textAlign: "center", color: C.sub, fontSize: 13, margin: "24px 0" }}>No activities match "{actSearch}".</p>
              }
            </div>

            {/* Sheet footer */}
            <div style={{ display: "flex", gap: 10, padding: "12px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${C.div}`, flexShrink: 0 }}>
              <button
                onClick={() => (openFilter === "pace" ? setPaceFilter([]) : setActFilter([]))}
                style={{ flex: "0 0 auto", padding: "13px 18px", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Clear
              </button>
              <button
                onClick={() => setOpenFilter(null)}
                style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                Show {filtered.length} {filtered.length === 1 ? "plan" : "plans"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══ Day Preview (visualise an option before finalising) ═══
function DayPreviewViewer({ option, dest, days, dayIndex, dayNumber, city, itineraryId, onChoose, onBack, onPhotoOpen }) {
  const actImgs = destData[dest]?.actImgs || [];
  const cards = (option.activities || []).map((name, i) => ({
    name,
    img: actImgs[(i * 3 + 2) % (actImgs.length || 1)] || option.heroImage,
  }));
  const [idx, setIdx] = useState(0);
  const [sheetState, setSheetState] = useState("hidden"); // "hidden" | "peek" | "full"
  const [activeMetric, setActiveMetric] = useState(null);
  const touchStart = useRef(null);
  const total = cards.length;
  const cur = cards[idx] || cards[0];

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const frameStyle = isMobile
    ? { position: "fixed", inset: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44 };

  // Day-detail scoring/tours for THIS option (real city/travel context, option's activities).
  const synthDay = { city, activities: cards.map(c => ({ name: c.name, img: c.img })) };
  const daysForScoring = (days && days.length)
    ? days.map((d, i) => (i === dayIndex ? synthDay : d))
    : [synthDay];
  const scoreIdx = (days && days.length) ? dayIndex : 0;
  const scoring = getDayScoring(synthDay, scoreIdx, daysForScoring);
  const tours = getDayTours(synthDay, scoreIdx, daysForScoring);
  const allDaysScoring = getAllDaysScoring(daysForScoring);
  const description = `Curated experiences in ${city}, with guided activities, transfers, and tasting stops included.`;

  const next = () => idx < total - 1 && setIdx(idx + 1);
  const prev = () => idx > 0 && setIdx(idx - 1);
  const handleTap = (e) => {
    if (sheetState !== "hidden") return;
    const rect = e.currentTarget.getBoundingClientRect();
    (e.clientX - rect.left > rect.width * 0.5) ? next() : prev();
  };
  const onTS = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTE = (e) => {
    if (touchStart.current === null || sheetState !== "hidden") { touchStart.current = null; return; }
    const d = touchStart.current - e.changedTouches[0].clientX;
    if (d > 50) next(); else if (d < -50) prev();
    touchStart.current = null;
  };

  return (
    <div style={{ ...frameStyle, zIndex: 400, background: "#000", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <img src={cur?.img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(180deg, rgba(0,0,0,0.7), transparent)", zIndex: 2 }} />
      {sheetState === "hidden" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 320, background: "linear-gradient(transparent, rgba(0,0,0,0.9))", zIndex: 2 }} />
      )}
      {sheetState === "hidden" && (
        <div onClick={handleTap} onTouchStart={onTS} onTouchEnd={onTE} style={{ position: "absolute", inset: 0, zIndex: 1 }} />
      )}

      {/* Top - progress + back + preview badge */}
      <div style={{ position: "relative", zIndex: 5, padding: "50px 16px 0" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {cards.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 8, background: "rgba(255,255,255,0.4)", overflow: "hidden" }}>
              <div style={{ width: i <= idx ? "100%" : "0%", height: "100%", background: "#fff" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <ArrowLeft size={16} color="#fff" />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", padding: "5px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Preview · not selected yet
          </span>
        </div>
      </div>

      {/* Bottom - day/city, activity, customer photos, caption, day-details, choose CTA */}
      {sheetState === "hidden" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 28px", zIndex: 5 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: 0.2, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              Day {dayNumber} · {city}
            </span>
            {option.isCurrent ? (
              <button data-testid="preview-current-day" onClick={onBack} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.25)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                Current day
              </button>
            ) : (
              <button data-testid="preview-choose-day" onClick={onChoose} style={{ flexShrink: 0, padding: "8px 18px", borderRadius: 999, border: "none", background: C.p600, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 14px rgba(227,27,83,0.45)" }}>
                Choose this day
              </button>
            )}
          </div>
          <p onClick={() => setSheetState("peek")} style={{ margin: "4px 0 8px", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2, textShadow: "0 1px 12px rgba(0,0,0,0.5)", cursor: "pointer", width: "fit-content" }}>
            {cur?.name}
          </p>

          {/* Customer photos - social proof, opens the gallery */}
          {dest && customerPhotos[dest] && (
            <div
              onClick={() => onPhotoOpen && onPhotoOpen(dayNumber, 0)}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer", width: "fit-content" }}
            >
              <div style={{ display: "flex", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>
                {customerPhotos[dest].slice(0, 3).map((img, i) => (
                  <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "1.5px solid #fff", marginLeft: i > 0 ? -8 : 0 }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
                See {customerPhotos[dest].length} traveller photos
              </span>
            </div>
          )}

          {/* Caption - tap opens the day plan */}
          <p onClick={() => setSheetState("peek")} style={{ margin: 0, fontSize: 12, color: "#F9F9FB", lineHeight: 1.4, opacity: 0.92, textShadow: "0 1px 6px rgba(0,0,0,0.5)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", cursor: "pointer" }}>
            {description}
          </p>

          {/* View details indicator - opens the day plan */}
          <div
            onClick={() => setSheetState("peek")}
            style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12, cursor: "pointer", width: "fit-content", opacity: 0.85 }}
          >
            <ChevronUp size={14} color="#fff" />
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 500, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Tap to see day details</span>
          </div>
        </div>
      )}

      {/* Day-detail sheet (same component as the live video flow) */}
      {sheetState !== "hidden" && (
        <DaySheet
          state={sheetState}
          setState={setSheetState}
          day={synthDay}
          dayNum={dayNumber}
          dayIdx={scoreIdx}
          dest={dest}
          itineraryId={itineraryId}
          scoring={scoring}
          tours={tours}
          description={description}
          canChangeDay={false}
          onMetricOpen={setActiveMetric}
          onChangeDay={() => {}}
          onPhotoOpen={onPhotoOpen}
        />
      )}

      {activeMetric && (
        <DayScoreModal
          metric={activeMetric}
          scoring={scoring}
          allDaysScoring={allDaysScoring}
          currentDayIdx={scoreIdx}
          dayLabel={`Day ${dayNumber} · ${city}`}
          onClose={() => setActiveMetric(null)}
        />
      )}
    </div>
  );
}

// ═══ Flight Card (for ItineraryDetail) ═══
function FlightCard({ flight, leg, itineraryId, legIndex }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, padding: 14, background: C.white, position: "relative" }}>
      {/* Edit button */}
      <Link
        to={`/flights/${itineraryId}/${legIndex}?current=${encodeURIComponent(flight.id)}`}
        style={{
          position: "absolute", top: 10, right: 10,
          width: 30, height: 30, borderRadius: 8,
          background: C.p100, border: `1px solid ${C.p300}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", textDecoration: "none",
        }}
      >
        <ArrowLeftRight size={13} color={C.p600} />
      </Link>

      {/* Direction label */}
      <p style={{ fontSize: 11, fontWeight: 600, color: C.sub, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {leg.direction === "outbound" ? "Outbound" : leg.direction === "return" ? "Return" : "Transfer"}
      </p>

      {/* Airline + Price */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, paddingRight: 36 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.head, margin: 0 }}>{flight.airline}</p>
      </div>

      {/* Flight leg visual */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>{flight.dep}</p>
          <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{flight.from}</p>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 10px" }}>
          <span style={{ fontSize: 11, color: C.inact }}>{flight.duration}</span>
          <div style={{ width: "100%", height: 1, background: C.div, margin: "4px 0", position: "relative" }}>
            <Plane size={12} color="#D97706" fill="#D97706" style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)" }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: flight.stops === 0 ? "#027A48" : C.p600 }}>
            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
          </span>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>{flight.arr}</p>
          <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{flight.to}</p>
        </div>
      </div>

      {/* Price */}
      <p style={{ fontSize: 13, fontWeight: 600, color: C.p600, margin: 0 }}>₹ {formatPrice(flight.price)} <span style={{ fontSize: 11, fontWeight: 400, color: C.inact }}>/person</span></p>
    </div>
  );
}

// ═══ Full-Screen Video/Stories Viewer ═══
function VideoViewer({ days, dest, itineraryId, initialDay, initialActivity, onPhotoOpen, onClose }) {
  const navigate = useNavigate();
  const [dayIdx, setDayIdx] = useState(initialDay);
  const [actIdx, setActIdx] = useState(initialActivity);
  const [muted, setMuted] = useState(false);
  const touchStart = useRef(null);
  const [showActivityDetail, setShowActivityDetail] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const openActivityDetail = () => setShowActivityDetail(true);
  const LEISURE_IMG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&auto=format&fit=crop";

  // Mobile fills the viewport; desktop centers a 390x844 phone-sized box.
  // Use position:fixed so the viewer escapes the tall scrollable parent
  // (ItineraryDetail's root has position:relative and spans all content).
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const viewerStyle = isMobile
    ? { position: "fixed", inset: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44 };

  const currentDay = days[dayIdx];
  const activities = currentDay?.activities || [];
  const isLeisureDay = !!currentDay?.leisure;
  // A leisure day is a single "slide": a generic image, no per-activity reel.
  const slideCount = isLeisureDay ? 1 : activities.length;
  const currentAct = activities[actIdx] || activities[0];
  const bgImg = isLeisureDay ? LEISURE_IMG : currentAct?.img;
  const dayNum = days.slice(0, dayIdx).reduce((a, d) => a + d.n, 0) + 1;

  const description = `Curated experiences in ${currentDay?.city}, with guided activities, transfers, and tasting stops included.`;
  const actDescription = isLeisureDay
    ? `Nothing's planned today - relax at your own pace, or explore the recommended spots below. Nothing here is pre-booked.`
    : currentAct?.name
      ? `${currentAct.name} in ${currentDay?.city} - a hand-picked highlight with private transfers, a local guide, and time to truly soak it in.`
      : description;
  const title = isLeisureDay ? "Leisure day" : currentAct?.name;

  const goNext = useCallback(() => {
    if (actIdx < slideCount - 1) {
      setActIdx(a => a + 1);
    } else if (dayIdx < days.length - 1) {
      setDayIdx(d => d + 1);
      setActIdx(0);
    }
  }, [actIdx, slideCount, dayIdx, days.length]);

  const goPrev = useCallback(() => {
    if (actIdx > 0) {
      setActIdx(a => a - 1);
    } else if (dayIdx > 0) {
      const prev = days[dayIdx - 1];
      setDayIdx(d => d - 1);
      setActIdx(prev.leisure ? 0 : (prev.activities?.length || 1) - 1);
    }
  }, [actIdx, dayIdx, days]);

  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.55) goNext();
    else goPrev();
  };

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) { touchStart.current = null; return; }
    const diff = touchStart.current - e.changedTouches[0].clientY;
    if (diff > 60 && dayIdx < days.length - 1) { setDayIdx(d => d + 1); setActIdx(0); }
    else if (diff < -60 && dayIdx > 0) { setDayIdx(d => d - 1); setActIdx(0); }
    touchStart.current = null;
  };

  return (
    <div style={{ ...viewerStyle, zIndex: 200, background: "#000", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Background image - always present */}
      <img src={bgImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Top dark gradient - always */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(180deg, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0) 100%)", zIndex: 2 }} />

      {/* Bottom gradient */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", zIndex: 2 }} />

      {/* Tap zone (left/right nav) */}
      <div onClick={handleTap} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      {/* TOP - progress bars + activity title + close (always visible) */}
      <div style={{ position: "relative", zIndex: 5, padding: "50px 16px 0" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {Array.from({ length: slideCount }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 8, background: "rgba(255,255,255,0.5)", overflow: "hidden" }}>
              <div style={{ width: i < actIdx ? "100%" : i === actIdx ? "60%" : "0%", height: "100%", background: "#fff", transition: "width 0.3s" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            {muted ? <VolumeX size={16} color="#fff" /> : <Volume2 size={16} color="#fff" />}
          </button>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <XIcon size={16} color="#fff" />
          </button>
        </div>
      </div>

      {/* BOTTOM - activity only (Instagram style); opens the activity detail page */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 28px", zIndex: 5 }}>
        {/* Day context kicker - plain label, not interactive */}
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: 0.2, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
          Day {dayNum} · {currentDay?.city}
        </span>
        <p onClick={isLeisureDay ? undefined : openActivityDetail} style={{ margin: "4px 0 8px", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2, textShadow: "0 1px 12px rgba(0,0,0,0.5)", cursor: isLeisureDay ? "default" : "pointer", width: "fit-content" }}>
          {title}
        </p>

        {/* Customer photos - social proof, opens couples' photo gallery */}
        {dest && customerPhotos[dest] && (
          <div
            onClick={(e) => { e.stopPropagation(); if (onPhotoOpen) onPhotoOpen(dayNum, 0); }}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer", width: "fit-content" }}
          >
            <div style={{ display: "flex", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>
              {customerPhotos[dest].slice(0, 3).map((img, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "1.5px solid #fff", marginLeft: i > 0 ? -8 : 0 }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              See {customerPhotos[dest].length} traveller photos
            </span>
          </div>
        )}

        {/* Caption - tap opens the activity detail page (not on a leisure day) */}
        <p onClick={isLeisureDay ? undefined : openActivityDetail} style={{ margin: 0, fontSize: 12, color: "#F9F9FB", lineHeight: 1.4, opacity: 0.92, textShadow: "0 1px 6px rgba(0,0,0,0.5)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", cursor: isLeisureDay ? "default" : "pointer" }}>
          {actDescription}
        </p>

        {/* Bottom action - recommended places on a leisure day, else activity details */}
        {isLeisureDay ? (
          <button
            onClick={(e) => { e.stopPropagation(); setShowRecommended(true); }}
            style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 999, border: "none", background: "#fff", color: C.head, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Sparkles size={15} color={C.p600} /> View recommended activities
          </button>
        ) : (
          <div
            onClick={openActivityDetail}
            style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12, cursor: "pointer", width: "fit-content", opacity: 0.9 }}
          >
            <ChevronRight size={14} color="#fff" />
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 500, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>View activity details</span>
          </div>
        )}
      </div>

      {/* Activity detail - bottom drawer over the reel (keeps video in context) */}
      {showActivityDetail && currentAct && (
        <ActivityDetailSheet
          detail={buildActivityDetail(currentAct, { city: currentDay?.city, country: dest, isBooked: false, dayNum })}
          onClose={() => setShowActivityDetail(false)}
        />
      )}

      {/* Recommended activities - leisure-day bottom sheet */}
      {showRecommended && (
        <RecommendedActivitiesSheet ideas={currentDay?.ideas} city={currentDay?.city} onClose={() => setShowRecommended(false)} />
      )}
    </div>
  );
}

// Bottom sheet listing self-explore ideas for a leisure day.
function RecommendedActivitiesSheet({ ideas = [], city, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "16px 16px 0 0", maxHeight: "82%", overflowY: "auto", animation: "sheetSlideUp 0.25s ease-out", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.head }}>Recommended activities</h3>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <XIcon size={16} color={C.sub} />
          </button>
        </div>
        <p style={{ margin: "0 20px 12px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>
          Ideas to explore on your own in {city}. Nothing is pre-booked, just tell your trip manager if you'd like us to arrange any.
        </p>
        <div style={{ padding: "0 16px" }}>
          {ideas.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, borderRadius: 12, border: `1px solid ${C.div}`, marginBottom: 10 }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", background: "#F5F5F5", flexShrink: 0, backgroundImage: it.photo ? `url(${it.photo})` : "none", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.head }}>{it.title}</p>
                {it.caption && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{it.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ Activity detail - draggable bottom drawer (opens at 50%, snaps 50% ↔ 92%) ═══
const SHEET_SNAPS = [0.5, 0.92];
function ActivityDetailSheet({ detail, onClose }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const frameStyle = isMobile
    ? { position: "fixed", inset: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44 };

  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const [heightPct, setHeightPct] = useState(0.5);
  const [dragging, setDragging] = useState(false);

  const onHandleDown = (e) => {
    const frame = frameRef.current;
    if (!frame) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { rect: frame.getBoundingClientRect() };
    setDragging(true);
  };
  const onHandleMove = (e) => {
    if (!dragRef.current) return;
    const { rect } = dragRef.current;
    const pct = (rect.bottom - e.clientY) / rect.height;
    setHeightPct(Math.max(0.28, Math.min(0.96, pct)));
  };
  const onHandleUp = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    setHeightPct(h => {
      if (h < 0.36) { onClose(); return h; }          // dragged down far enough → dismiss
      return SHEET_SNAPS.reduce((a, b) => (Math.abs(b - h) < Math.abs(a - h) ? b : a));
    });
  };

  return (
    <div ref={frameRef} style={{ ...frameStyle, zIndex: 210, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* Scrim - tap to dismiss, keeps the video peeking above */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", animation: "fadeInBg 0.2s ease-out" }} />

      {/* Sheet */}
      <div style={{ position: "relative", height: `${heightPct * 100}%`, background: "#fff", borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column", overflow: "hidden", animation: "sheetSlideUp 0.28s cubic-bezier(0.32,0.72,0,1)", transition: dragging ? "none" : "height 0.28s cubic-bezier(0.32,0.72,0,1)" }}>
        {/* Drag handle + close */}
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          style={{ position: "relative", flexShrink: 0, paddingTop: 10, paddingBottom: 8, cursor: "row-resize", touchAction: "none" }}
        >
          <div style={{ width: 40, height: 5, borderRadius: 4, background: "#D5D7E0", margin: "0 auto" }} />
          <button onClick={onClose} onPointerDown={(e) => e.stopPropagation()} style={{ position: "absolute", top: 8, right: 14, width: 30, height: 30, borderRadius: "50%", background: "#F4F5F8", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
            <XIcon size={16} color="#181E4C" />
          </button>
        </div>
        {/* Scrollable detail body */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
          <ActivityDetailScroll detail={detail} />
        </div>
      </div>
    </div>
  );
}

// ═══ Day Detail - full-screen page with prev/next day switcher ═══
function DayDetailScreen({ days, dayIndex, setDayIndex, dest, itineraryId, canChangeDay, onChangeDay, onPhotoOpen, onClose }) {
  const [activeMetric, setActiveMetric] = useState(null);
  const [transferDetail, setTransferDetail] = useState(null);
  const day = days[dayIndex];

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const frameStyle = isMobile
    ? { position: "fixed", inset: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44 };

  const scoring = useMemo(() => getDayScoring(day, dayIndex, days), [day, dayIndex, days]);
  const tours = useMemo(() => getDayTours(day, dayIndex, days), [day, dayIndex, days]);
  const allDaysScoring = useMemo(() => getAllDaysScoring(days), [days]);

  const photos = dest && customerPhotos[dest] ? customerPhotos[dest] : [];
  const galleryItems = photos.length >= 6 ? photos.slice(0, 6) : [...photos, ...(day?.activities || [])].slice(0, 6);
  const activityNames = (day?.activities || []).map(a => a.name).filter(Boolean).join(", ");

  // Day-type flags (from dayMeta). Scoring shows for every type except a full
  // leisure day; transfers come from meta, so drop getDayTours' auto intro.
  const isLeisure = !!day?.leisure;
  const isDeparture = !!day?.departure;
  const hasTransfers = (day?.transfers?.length || 0) > 0;
  const isFullLeisure = isLeisure && !hasTransfers && !isDeparture;
  const showScoring = !isFullLeisure;
  const heroTitle = isDeparture ? "Departure day" : isLeisure ? `Leisure in ${day?.city}` : activityNames;
  const toursNoIntro = tours.map((t) => ({ ...t, intro: null }));
  // Each transfer becomes its own tour-style block: route heading, car photo,
  // and a tappable card (chevron) that opens the transfer detail.
  const transferBlocks = (day?.transfers || []).map((t) => ({
    heading: t.header || `${t.from} to ${t.to} transfer`,
    intro: null,
    items: [{
      name: t.name || `Private transfer to ${t.to}`,
      img: t.img || day?.activities?.[0]?.img,
      desc: t.desc || `${t.from} to ${t.to}`,
      onTap: () => setTransferDetail(t),
    }],
  }));

  const hasPrev = dayIndex > 0;
  const hasNext = dayIndex < days.length - 1;
  const navBtn = (enabled) => ({
    width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: enabled ? "pointer" : "default",
    opacity: enabled ? 1 : 0.35, flexShrink: 0,
  });

  return (
    <div style={{ ...frameStyle, zIndex: 120, background: "#fff", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Top bar: back + prev/next day switcher - sits on the brand hero tint */}
      <div style={{ flexShrink: 0, padding: "16px 12px 12px", background: "#FFF1F4", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={18} color={C.head} />
        </button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minWidth: 0 }}>
          <button onClick={() => hasPrev && setDayIndex(dayIndex - 1)} style={navBtn(hasPrev)} aria-label="Previous day">
            <ChevronLeft size={16} color={C.head} />
          </button>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head, whiteSpace: "nowrap" }}>Day {day?.dayNum} · {day?.city}</p>
          <button onClick={() => hasNext && setDayIndex(dayIndex + 1)} style={navBtn(hasNext)} aria-label="Next day">
            <ChevronRight size={16} color={C.head} />
          </button>
        </div>
        <div style={{ width: 34, flexShrink: 0 }} />
      </div>

      {/* Body */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        {/* Brand hero - title + scoring bonded on one soft-pink surface */}
        <div style={{ background: "linear-gradient(180deg, #FFF1F4 0%, #FFF6F8 100%)", padding: "4px 0 16px", borderBottom: `1px solid ${C.div}` }}>
          <div style={{ padding: "8px 20px 14px" }}>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#181E4C", lineHeight: 1.25 }}>{heroTitle}</h2>
          </div>
          {showScoring && (
            <div style={{ padding: "0 16px" }}>
              <div style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #FFE0E7", boxShadow: "0 2px 10px rgba(253,1,79,0.06)" }}>
                <DayScoreRow scoring={scoring} onOpen={setActiveMetric} bg="#fff" borderColor="transparent" divider="#FFE0E7" />
              </div>
            </div>
          )}
        </div>

        {/* Your day will cover - content varies by day type */}
        <div style={{ padding: "16px 20px 0" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "#181E4C" }}>Your day will cover:</h3>
        </div>
        {isDeparture ? (
          <div style={{ padding: "12px 20px 8px" }}>
            {transferBlocks.map((tb, ti) => (
              <TourBlock key={ti} tour={tb} itineraryId={itineraryId} dayIdx={dayIndex} />
            ))}
          </div>
        ) : isFullLeisure ? (
          <>
            <LeisureCard hasTransfer={false} />
            <ExploreIdeas ideas={day.ideas} />
          </>
        ) : (isLeisure && hasTransfers) ? (
          <>
            <div style={{ padding: "12px 20px 0" }}>
              {transferBlocks.map((tb, ti) => (
                <TourBlock key={ti} tour={tb} itineraryId={itineraryId} dayIdx={dayIndex} />
              ))}
            </div>
            <LeisureStrip />
            <ExploreIdeas ideas={day.ideas} />
          </>
        ) : (
          <div style={{ padding: "12px 20px 8px" }}>
            {transferBlocks.map((tb, ti) => (
              <TourBlock key={`tr-${ti}`} tour={tb} itineraryId={itineraryId} dayIdx={dayIndex} />
            ))}
            {(hasTransfers ? toursNoIntro : tours).map((tour, ti) => (
              <TourBlock key={ti} tour={tour} itineraryId={itineraryId} dayIdx={dayIndex} />
            ))}
          </div>
        )}

        <div style={{ height: 1, background: "#E0E2EB", margin: "8px 0" }} />

        {/* Traveller stories grid */}
        {galleryItems.length >= 3 && (
          <div style={{ padding: "8px 20px 24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 500, color: "#181E4C" }}>Traveller stories</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {galleryItems.map((p, i) => {
                const src = p.img || p;
                return (
                  <div key={i} onClick={() => onPhotoOpen && onPhotoOpen(day?.dayNum, i)} style={{ aspectRatio: "1 / 1", borderRadius: 8, overflow: "hidden", background: "#F5F5F5", cursor: "pointer" }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating CTA - opens the day-selection drawer */}
      {canChangeDay && (
        <div style={{ flexShrink: 0, padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", borderTop: `1px solid ${C.div}`, background: "#fff", boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>
          <button onClick={() => onChangeDay(dayIndex)} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 16px", background: C.head, border: "none", borderRadius: 14, fontSize: 15, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            <RefreshCw size={16} color="#fff" />
            Change this day
          </button>
        </div>
      )}

      {/* Metric drill-in modal */}
      {activeMetric && (
        <DayScoreModal
          metric={activeMetric}
          scoring={scoring}
          allDaysScoring={allDaysScoring}
          currentDayIdx={dayIndex}
          dayLabel={`Day ${day?.dayNum} · ${day?.city}`}
          onClose={() => setActiveMetric(null)}
        />
      )}

      {/* Transfer detail sheet */}
      {transferDetail && (
        <TransferDetailSheet transfer={transferDetail} onClose={() => setTransferDetail(null)} />
      )}
    </div>
  );
}

// Bottom sheet with the full transfer detail, opened from a transfer card.
function TransferDetailSheet({ transfer: t, onClose }) {
  const meta = [t.sharing, t.vehicle && (t.vehicle.charAt(0).toUpperCase() + t.vehicle.slice(1)), t.duration].filter(Boolean).join(" · ");
  const included = [
    "Meet & greet at the pickup point",
    "English-speaking chauffeur",
    "Air-conditioned vehicle, bottled water",
    "All tolls, parking and taxes",
  ];
  const Row = ({ label, value }) => (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: `1px solid ${C.div}` }}>
      <span style={{ fontSize: 12.5, color: C.sub }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.head, textAlign: "right" }}>{value}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "16px 16px 0 0", maxHeight: "86%", overflowY: "auto", animation: "sheetSlideUp 0.25s ease-out", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
        {t.img && (
          <div style={{ position: "relative", height: 180, background: `url(${t.img}) center/cover no-repeat` }}>
            <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <XIcon size={18} color="#fff" />
            </button>
          </div>
        )}
        <div style={{ padding: "16px 20px 8px" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: C.head }}>{t.name || `Transfer to ${t.to}`}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.head, fontWeight: 600 }}>
            <span>{t.from}</span>
            <ArrowRight size={14} color={C.sub} />
            <span>{t.to}</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <Row label="Vehicle" value={meta || "Private car"} />
            {t.duration && <Row label="Approx. time" value={t.duration} />}
            <Row label="Cost" value="Included in your package" />
          </div>
          <p style={{ margin: "16px 0 8px", fontSize: 13, fontWeight: 700, color: C.sub, letterSpacing: 0.3 }}>WHAT'S INCLUDED</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: C.head, lineHeight: "22px" }}>
            {included.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

// One tour group: heading + dashed-line timeline of items (intro text + activity cards).
function TourBlock({ tour, itineraryId, dayIdx }) {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 16, border: "1px solid #E0E2EB", borderRadius: 8, padding: 8 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 500, color: "#181E4C" }}>{tour.heading}</h4>
      <div style={{ position: "relative", paddingLeft: 16 }}>
        {/* Dashed timeline */}
        <div style={{ position: "absolute", left: 3, top: 12, bottom: 12, width: 0, borderLeft: "1px dashed #4EAC7E" }} />
        {tour.intro && (
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{ position: "absolute", left: -16, top: 4, width: 8, height: 8, borderRadius: "50%", background: "#4EAC7E" }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#181E4C" }}>{tour.intro.label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666C99", lineHeight: 1.35 }}>{tour.intro.desc}</p>
          </div>
        )}
        {tour.items.map((it, i) => (
          <div key={i} style={{ position: "relative", marginBottom: i < tour.items.length - 1 ? 10 : 0 }}>
            <div style={{
              position: "absolute", left: -16, top: 36,
              width: 8, height: 8, borderRadius: "50%",
              background: i === 0 && tour.intro ? "#fff" : "#4EAC7E",
              border: i === 0 && tour.intro ? "1px solid #4EAC7E" : "none",
              boxSizing: "border-box",
            }} />
            <div
              onClick={() => {
                if (it.onTap) { it.onTap(); return; }
                if (it.actIdx == null || itineraryId == null || dayIdx == null) return;
                navigate(`/itinerary/${itineraryId}/day/${dayIdx}/activity/${it.actIdx}`);
              }}
              style={{
                display: "flex", alignItems: "center", padding: "0 8px 0 8px",
                background: "#fff", borderRadius: 8,
                boxShadow: "0 4px 16px -4px rgba(16,24,40,0.06)",
                border: "1px solid #F0F1F5",
                cursor: (it.actIdx != null || it.onTap) ? "pointer" : "default",
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", background: "#F5F5F5", flexShrink: 0 }}>
                <img src={it.img} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, padding: "8px 12px" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#181E4C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666C99", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.desc}</p>
              </div>
              {(it.actIdx != null || it.onTap) && (
                <div style={{ flexShrink: 0, paddingRight: 4, color: "#FD014F", display: "flex", alignItems: "center" }}>
                  <ChevronRight size={18} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ Pricing Bottom Sheet ═══
function PricingSheet({ onClose, initialDates, onSubmit }) {
  const travelerOpts = [2, 4, 6, 8];
  const [fromDate, setFromDate] = useState(initialDates?.fromDate || "");
  const [nights, setNights] = useState(initialDates?.nights || "");
  const [travelers, setTravelers] = useState(initialDates?.travelers || 2);
  const nightOptions = [3, 4, 5, 6, 7, 8, 9, 10];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  const isValid = fromDate && nights;

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, zIndex: 100, borderRadius: 44, overflow: "hidden", pointerEvents: "none" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", pointerEvents: "auto" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.white, borderRadius: "20px 20px 0 0", padding: "20px 20px 34px", pointerEvents: "auto" }} className="animate-slide-up">
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, marginBottom: 4 }}>Get real-time pricing</h3>
        <p style={{ fontSize: 12, color: C.sub, marginBottom: 20 }}>We'll fetch live hotel rates and availability for your dates</p>

        {/* Travel Dates, exact from date + nights */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Calendar size={14} color={C.p600} />
            <p style={{ fontSize: 13, fontWeight: 600, color: C.head, margin: 0 }}>When are you travelling?</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1.3 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.sub, marginBottom: 4, display: "block" }}>From date</label>
              <input
                type="date"
                min={minDate}
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                  border: `1.5px solid ${fromDate ? C.p600 : C.div}`, background: fromDate ? C.p100 : C.white,
                  color: fromDate ? C.p600 : C.sub, fontFamily: "inherit", outline: "none",
                  fontWeight: fromDate ? 600 : 400, boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 0.7 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.sub, marginBottom: 4, display: "block" }}>Nights</label>
              <div style={{ position: "relative" }}>
                <select
                  value={nights}
                  onChange={e => setNights(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                    border: `1.5px solid ${nights ? C.p600 : C.div}`, background: nights ? C.p100 : C.white,
                    color: nights ? C.p600 : C.sub, fontFamily: "inherit", outline: "none",
                    fontWeight: nights ? 600 : 400, appearance: "none", boxSizing: "border-box",
                  }}
                >
                  <option value="">Select</option>
                  {nightOptions.map(n => <option key={n} value={n}>{n}N</option>)}
                </select>
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.sub, pointerEvents: "none" }}>▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Travelers */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Users size={14} color={C.p600} />
            <p style={{ fontSize: 13, fontWeight: 600, color: C.head, margin: 0 }}>How many adults?</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {travelerOpts.map(t => {
              const on = travelers === t;
              return (
                <button key={t} onClick={() => setTravelers(t)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14, fontWeight: on ? 700 : 500,
                  color: on ? C.p600 : C.sub, background: on ? C.p100 : C.white, border: `1.5px solid ${on ? C.p600 : C.div}`,
                }}>{t}</button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => { if (isValid) onSubmit({ fromDate, nights: Number(nights), travelers }); }}
          disabled={!isValid}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: isValid ? "pointer" : "default",
            background: isValid ? C.p600 : C.div, color: isValid ? "#fff" : C.inact,
            fontSize: 14, fontWeight: 600, fontFamily: "inherit",
            boxShadow: isValid ? "0 4px 16px rgba(227,27,83,0.3)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
          <Zap size={14} /> Fetch live prices
        </button>
      </div>
    </div>
  );
}

// ═══ Day-wise Drawer (Vietnam) ═══
const VIETNAM_NARRATIVES = {
  Hanoi:    [{ t: "Arrival in Hanoi",    s: "Settle in, walk the Old Quarter, end with street food." },
             { t: "Old soul of the city", s: "Temples, lakes, and a water puppet show." }],
  "Ha Long":[{ t: "Sail into the bay",   s: "Cruise emerald waters and kayak through limestone caves." },
             { t: "Caves & quiet coves", s: "Hidden lagoons, sunrise tai chi, slow sailing." }],
  HCMC:     [{ t: "Saigon's pulse",      s: "War Remnants, market hopping, rooftop sundowners." },
             { t: "Cu Chi & culture",    s: "Crawl the tunnels, then watch the city dance at night." },
             { t: "Slow & savor",        s: "Coffee crawl, tailor stops, last shopping run." }],
  Sapa:     [{ t: "Into the highlands",  s: "Trek through rice terraces with hill-tribe guides." },
             { t: "Fansipan summit",     s: "Cable car to Indochina's roof; clouds at your feet." },
             { t: "Village & valley",    s: "Homestay lunch, weaving demos, slow valley walks." }],
  "Hoi An": [{ t: "Lantern town",        s: "Tailors, ancient streets, and a riverside dinner." },
             { t: "Cooking & coast",     s: "Market-to-table class, then beach time at An Bang." },
             { t: "Slow Hoi An",         s: "Bicycle the rice fields, sunset by the lanterns." },
             { t: "Memories show",       s: "Riverside spectacle that lights up the night." }],
  "Da Nang":[{ t: "Beach city welcome",  s: "Golden Bridge, sunset cruise on Han River." },
             { t: "Marble & mountains",  s: "Marble Mountains caves, Ba Na Hills cable car." },
             { t: "Spa & sand",          s: "My Khe Beach morning, full-body spa afternoon." }],
  "Phu Quoc":[{ t: "Island arrival",     s: "Sunset on Long Beach, fresh seafood by the shore." },
             { t: "Snorkel & sail",      s: "Three-island hop with snorkel gear and lunch." },
             { t: "Slow island day",     s: "Spa, kayaking, fishing village walk." }],
  Mekong:   [{ t: "Mekong Delta day",    s: "Sampan rides, floating markets, coconut candy." }],
  "Ninh Binh":[{ t: "Tam Coc rowboats",  s: "Glide past karst peaks and rice paddies." },
             { t: "Bich Dong & Bai Dinh", s: "Pagodas, caves, and a quiet boat ride." }],
  "Phong Nha":[{ t: "Paradise Cave",     s: "Walk inside a cathedral of stalactites." },
             { t: "Dark Cave adventure", s: "Zipline, mud bath, swim through a cave river." },
             { t: "Jungle & river",      s: "Botanic garden, kayaking, slow village lunch." }],
  "Nha Trang":[{ t: "Beach welcome",     s: "Promenade walk, seafood dinner by the bay." },
             { t: "Snorkel & spa",       s: "Boat day to Hon Mun, mud bath afternoon." },
             { t: "Po Nagar & ponies",   s: "Cham temples, beach hour, sunset bar." }],
  "Ha Giang":[{ t: "Loop begins",        s: "Heaven's Gate, terraced valleys, twisting roads." },
             { t: "Markets & motors",    s: "Hill-tribe markets, valley vistas, cliffside cafés." },
             { t: "Slow descent",        s: "River canyons, homestay lunch, easy ride back." }],
};

function getDayPlan(day, dayIdx, daysWithActivities) {
  const sameCityCount = daysWithActivities.slice(0, dayIdx).filter(d => d.city === day.city).length;
  const cityDayIdx = sameCityCount;
  const narrArr = VIETNAM_NARRATIVES[day.city] || [];
  const narrative = narrArr[cityDayIdx] || { t: day.city, s: day.activities.map(a => a.name).join(" · ") };

  const isFirstDay = dayIdx === 0;
  const isLastDay = dayIdx === daysWithActivities.length - 1;
  const prevCity = dayIdx > 0 ? daysWithActivities[dayIdx - 1].city : null;
  const nextCity = dayIdx < daysWithActivities.length - 1 ? daysWithActivities[dayIdx + 1].city : null;
  const cityChanged = prevCity && prevCity !== day.city;
  const departingTomorrow = nextCity && nextCity !== day.city;

  let transfer = null;
  if (isFirstDay) transfer = { ico: "✈️", text: `Mumbai → ${day.city} · arriving 10:30 AM` };
  else if (cityChanged) transfer = { ico: "🚗", text: `${prevCity} → ${day.city} · ~4 hr scenic transfer` };
  else if (isLastDay) transfer = { ico: "✈️", text: `${day.city} → Mumbai · 6:30 PM departure` };
  else if (departingTomorrow) transfer = { ico: "🛏️", text: `Last night in ${day.city} before transfer to ${nextCity}` };

  const hotelName = `${day.city} Heritage Resort`;
  const roomType = "Deluxe King · Breakfast included";

  const meals = isFirstDay
    ? ["Welcome dinner"]
    : isLastDay
      ? ["Farewell breakfast"]
      : cityChanged
        ? ["Lunch en route", "Dinner at hotel"]
        : ["Breakfast"];

  const SLOTS = ["Morning", "Afternoon", "Evening"];
  const ICONS = { Morning: "🌅", Afternoon: "☀️", Evening: "🌙" };
  const DURATIONS = ["2 hrs", "3 hrs", "1.5 hrs", "2.5 hrs"];
  const groups = { Morning: [], Afternoon: [], Evening: [] };
  day.activities.forEach((a, i) => {
    const slot = SLOTS[i % SLOTS.length];
    groups[slot].push({ ...a, duration: DURATIONS[i % DURATIONS.length], idx: i });
  });

  return { narrative, transfer, hotelName, roomType, meals, groups, ICONS, cityDayIdx };
}

function DayWiseScreen({ days, dest, itineraryId, hotels, activeDay, setActiveDay, onPlay, onChangeDay, onPhotoOpen, dayHasOptions, onClose }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => { setClosing(true); setTimeout(onClose, 280); };
  const day = days[activeDay];
  const plan = day ? getDayPlan(day, activeDay, days) : null;
  const totalActs = day?.activities.length || 0;
  const DURATIONS = ["2 hrs", "3 hrs", "1.5 hrs", "2.5 hrs"];
  const totalDuration = day?.activities.reduce((sum, _, i) => sum + parseFloat(DURATIONS[i % 4]), 0) || 0;
  const dayHotelIdx = hotels?.findIndex(h => h.city === day?.city) ?? -1;
  const dayHotel = dayHotelIdx >= 0 ? hotels[dayHotelIdx] : null;
  const destReviewsForDest = reviews.filter(r => r.dest === dest);

  // Build portrait card list: transfer (if any) + activities
  const portraitCards = [];
  if (plan?.transfer) {
    portraitCards.push({
      type: "transfer",
      icon: plan.transfer.ico,
      title: plan.transfer.text,
      img: day.activities[0]?.img,
    });
  }
  day?.activities.forEach((a, i) => {
    portraitCards.push({
      type: "activity",
      title: a.name,
      img: a.img,
      duration: DURATIONS[i % 4],
      idx: i,
    });
  });

  // Activity description bank
  const ACT_DESC = {
    "Old Quarter":      "Maze of 36 narrow streets - each named after the trade once practiced there. Walk past silk shops, herbal apothecaries, and pho stalls older than your grandparents.",
    "Street food":      "Hanoi on a plate: bun cha smoke, egg coffee crema, banh cuon steamed fresh. A local guide takes you to spots tourists never find.",
    "Temple":           "Tran Quoc Pagoda on West Lake - Vietnam's oldest, set on a quiet island. Incense, lotus ponds, and a six-tiered tower glowing at dusk.",
    "Bay cruise":       "Overnight on a luxury junk among 1,600 limestone islets. Sunset kayaking, fresh seafood, and stargazing from the upper deck.",
    "Kayaking":         "Paddle into hidden lagoons reachable only at low tide. Pass floating fishing villages and emerald grottos.",
    "Caves":            "Sung Sot ('Surprise Cave') - three vast chambers filled with stalactites lit by carefully placed warm lights.",
    "Cu Chi":           "Crawl through a section of the 250 km tunnel network used during the war. Above ground: a glimpse of village life that never stopped.",
    "Markets":          "Ben Thanh by day, Ben Thanh Night by dusk. Sip sugarcane juice, haggle for silk, eat banh xeo at a plastic-stool counter.",
    "Rooftop bars":     "Watch District 1 light up from 50 floors above. Saigon classic cocktails with a side of city skyline.",
    "Golden Bridge":    "The 150 m bridge held aloft by giant stone hands. Cloud-walking is the unofficial sport here.",
    "Beach":            "An Bang or My Khe - soft white sand, gentle surf, palm-thatched cabanas, and the sweet kick of a co-co coconut.",
    "Spa":              "Vietnamese herbal compress massage. 90 minutes of warm oils, lemongrass steam, and quiet.",
    "Lanterns":         "After sundown, Hoi An's old town turns into a river of color. Float a candle on the Thu Bon for good luck.",
    "Tailoring":        "Pick your fabric in the morning, pick up your custom-fitted suit or ao dai by evening. A Hoi An rite of passage.",
    "Cooking":          "Market shop with a chef, then cook 4 dishes in a riverside class - pho, fresh spring rolls, banh xeo, mango sticky rice.",
    "Island beach":     "Sao Beach's sugar-fine sand stretches a kilometer. Hammocks, calm water, and grilled prawns delivered to your towel.",
    "Snorkeling":       "Reefs around An Thoi archipelago - clownfish, parrotfish, and the occasional reef shark in 5 m water.",
    "Boat rides":       "Bamboo sampans through the Tam Coc waterway, paddled by women who use their feet to row.",
    "Pagodas":          "Bai Dinh - Southeast Asia's largest pagoda complex. 500 stone arhat statues line the corridor.",
    "Paradise Cave":    "31 km of cathedral-scale formations. Wooden walkways take you a kilometer in.",
    "Dark Cave":        "Zipline in, mud-bath inside, then swim back out through a cave river. Gear and guide included.",
    "Jungle":           "Phong Nha National Park trek with a former cave explorer. Birds, butterflies, and a hidden waterfall lunch spot.",
    "Lantern Night":    "The town lit by 5,000 silk lanterns. Quietest at the corners; loudest at the night market.",
  };
  const fallback = "Curated experience hand-picked by our local team. Tap to see why we love it.";

  return (
    <div style={{
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      width: 390, height: 844, borderRadius: 44,
      zIndex: 100, background: "#fff",
      overflow: "hidden",
      animation: closing ? "fadeOutBg 0.28s ease-out forwards" : "fadeInBg 0.28s ease-out forwards",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{ flexShrink: 0, padding: "44px 16px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${C.div}` }}>
        <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5F5F5", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={16} color={C.head} />
        </button>
        <div>
          <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>Day-wise itinerary</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>Day {day?.dayNum} · {day?.city}</p>
        </div>
      </div>

      {/* Sticky day pills */}
      <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.div}`, background: "#fff" }}>
        <div className="hs" style={{ gap: 6, padding: "10px 16px" }}>
          {days.map((d, i) => (
            <button key={i} onClick={() => setActiveDay(i)} style={{
              padding: "8px 14px", borderRadius: 10, minWidth: 80, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
              background: activeDay === i ? C.p600 : "#F5F5F5",
              border: activeDay === i ? "none" : `1px solid ${C.div}`,
              textAlign: "left",
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: activeDay === i ? "#fff" : C.head, margin: 0 }}>Day {d.dayNum}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <MapPin size={10} color={activeDay === i ? "rgba(255,255,255,0.7)" : C.sub} />
                <span style={{ fontSize: 11, color: activeDay === i ? "rgba(255,255,255,0.7)" : C.sub }}>{d.city}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        {/* Day header / narrative */}
        <div style={{ padding: "16px 16px 12px" }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: 0 }}>{plan?.narrative.t}</p>
          <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 8px" }}>{totalActs} activities · ~{totalDuration} hrs</p>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "19px" }}>{plan?.narrative.s}</p>

          {/* Equally-weighted action chips: Photos · Videos · Change day */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => onPlay(activeDay, 0)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "8px 14px", background: C.white,
                border: `1px solid ${C.div}`, borderRadius: 999,
                fontSize: 12, fontWeight: 600, color: C.head, cursor: "pointer",
                fontFamily: "inherit", lineHeight: 1,
              }}
            >
              <Play size={12} color={C.sub} fill={C.sub} />
              Videos
            </button>
            {dest && customerPhotos[dest] && (
              <button
                onClick={() => onPhotoOpen(day?.dayNum, 0)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", background: C.white,
                  border: `1px solid ${C.div}`, borderRadius: 999,
                  fontSize: 12, fontWeight: 600, color: C.head, cursor: "pointer",
                  fontFamily: "inherit", lineHeight: 1,
                }}
              >
                <Camera size={12} color={C.sub} />
                Photos
              </button>
            )}
            {dayHasOptions && dayHasOptions(activeDay) && (
              <button
                onClick={() => onChangeDay(activeDay)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "8px 14px", background: C.white,
                  border: `1px solid ${C.div}`, borderRadius: 999,
                  fontSize: 12, fontWeight: 600, color: C.head, cursor: "pointer",
                  fontFamily: "inherit", lineHeight: 1,
                }}
              >
                <ArrowLeftRight size={12} color={C.sub} />
                Change day
              </button>
            )}
          </div>
        </div>

        {/* Portrait thumbnails: transfer + activities */}
        <div className="hs" style={{ gap: 10, padding: "0 16px 16px" }}>
          {portraitCards.map((c, i) => (
            <div
              key={i}
              onClick={() => c.type === "activity" && onPlay(activeDay, c.idx)}
              style={{
                width: 140, minWidth: 140, height: 200, borderRadius: 14, overflow: "hidden",
                position: "relative", flexShrink: 0,
                cursor: c.type === "activity" ? "pointer" : "default",
                background: c.type === "transfer" ? C.p100 : C.div,
              }}
            >
              {c.img && (
                <img
                  src={c.img}
                  alt={c.title}
                  className={c.type === "activity" ? "" : ""}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    display: "block",
                    filter: c.type === "transfer" ? "blur(2px) brightness(0.55)" : "none",
                  }}
                />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.85))" }} />
              {c.type === "activity" && (
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 999 }}>
                  {c.duration}
                </span>
              )}
              {c.type === "transfer" && (
                <div style={{ position: "absolute", top: 12, left: 12, fontSize: 22 }}>{c.icon}</div>
              )}
              <p style={{
                position: "absolute", bottom: 10, left: 10, right: 10,
                fontSize: 12, fontWeight: 600, color: "#fff", margin: 0, lineHeight: "15px",
              }}>
                {c.title}
              </p>
            </div>
          ))}
        </div>

        {/* Day in detail */}
        <div style={{ padding: "0 16px 8px" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: "4px 0 12px" }}>What you'll do</p>
          {day?.activities.map((a, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "10px 0",
              borderBottom: i < day.activities.length - 1 ? `1px solid ${C.div}` : "none",
            }}>
              <div onClick={() => onPlay(activeDay, i)} style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", flexShrink: 0, position: "relative", cursor: "pointer", background: C.div }}>
                <img src={a.img} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={11} color="#fff" fill="#fff" />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.head, margin: 0 }}>{a.name}</p>
                  <span style={{ fontSize: 11, color: C.sub }}>· {DURATIONS[i % 4]}</span>
                </div>
                <p style={{ fontSize: 12, color: C.sub, margin: 0, lineHeight: "17px" }}>
                  {ACT_DESC[a.name] || fallback}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hotel card - internal design language */}
        {dayHotel && (() => {
          const NEIGHBORHOODS = {
            Hanoi: "Hoan Kiem · Old Quarter",
            "Ha Long": "Bay Front",
            HCMC: "District 1 · Saigon",
            "Da Nang": "My Khe Beach",
            "Hoi An": "Ancient Town",
            "Phu Quoc": "Long Beach",
            Sapa: "Town Centre",
            Mekong: "Can Tho",
            "Ninh Binh": "Tam Coc",
            "Phong Nha": "Son Trach",
            "Nha Trang": "Tran Phu Beach",
            "Ha Giang": "Old Town",
          };
          const neighborhood = NEIGHBORHOODS[dayHotel.city] || dayHotel.city;
          const altCount = 3;
          return (
            <div style={{ padding: "16px 16px 0" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: "0 0 10px" }}>Tonight's stay</p>
              <HotelStayCard
                image={dayHotel.img}
                imageAlt={dayHotel.name}
                imageHeight={180}
                dayLabel={dayHotel.dayRange}
                recommendedBadge
                stars={dayHotel.stars}
                ratingScore={dayHotel.rating}
                name={dayHotel.name}
                roomType={dayHotel.type}
                city={`${neighborhood}, ${dayHotel.city}`}
                showChevron={false}
                to={`/hotel-detail/${itineraryId}/${dayHotelIdx}/${encodeURIComponent(dayHotel.hotelId || "")}?current=${encodeURIComponent(dayHotel.hotelId || "")}`}
                footer={
                  <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 10, marginTop: 6, borderTop: `1px solid ${C.div}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: C.p600 }}>
                      View details
                      <ChevronRight size={13} color={C.p600} />
                    </span>
                    <span style={{ width: 1, height: 14, background: C.div }} />
                    <span
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/hotels/${itineraryId}/${dayHotelIdx}?current=${encodeURIComponent(dayHotel.hotelId || "")}`; }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: C.p600, cursor: "pointer" }}
                    >
                      <RefreshCw size={12} color={C.p600} />
                      See {altCount} alternatives
                    </span>
                  </div>
                }
              />
            </div>
          );
        })()}

        {/* Traveller moments - marquee, same as destination page */}
        {dest && customerPhotos[dest] && (
          <div style={{ marginTop: 24 }}>
            <div style={{ padding: "0 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>📸</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Traveller moments</span>
              </div>
              <p style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Couples who explored {dest} with us</p>
            </div>
            <div style={{ overflow: "hidden", width: "100%" }}>
              <div className="marquee-strip" style={{ display: "flex", gap: 10, width: "max-content" }}>
                {(() => {
                  const photos = getCustomerPhotos(dest);
                  const names = couplePhotoNames[dest] || [];
                  return [...photos, ...photos].map((photo, i) => {
                    const realIdx = i % photos.length;
                    const coupleName = names[realIdx] || "";
                    return (
                      <div key={i} onClick={() => onPhotoOpen(day?.dayNum, realIdx)} style={{ width: 180, minWidth: 180, height: 240, borderRadius: 14, overflow: "hidden", flexShrink: 0, position: "relative", cursor: "pointer" }}>
                        <img src={photo.img} alt={photo.tag} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.75))" }} />
                        <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                          {coupleName && <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", margin: "0 0 2px", opacity: 0.9 }}>{coupleName}</p>}
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={10} color={C.p300} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{photo.tag}</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Reviews - same Google-card design as destination page */}
        {destReviewsForDest.length > 0 && (
          <div style={{ margin: "26px 16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.white, borderRadius: 12, padding: "8px 12px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span style={{ fontSize: 18, fontWeight: 700, color: C.head }}>4.6</span>
                <span style={{ fontSize: 12, color: C.sub }}>/5</span>
              </div>
              <p style={{ fontSize: 12, color: C.sub }}>1,000+ Google reviews</p>
            </div>
            {destReviewsForDest.slice(0, 3).map((r, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", borderLeft: `3px solid ${C.p300}`, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.p100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.p600 }}>{r.name[0]}</div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.head, margin: 0 }}>{r.name}</p>
                      <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{r.dest}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(s => <Star key={s} size={10} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />)}</div>
                </div>
                <p style={{ fontSize: 11, lineHeight: "16px", color: C.sub, margin: 0 }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 28 }} />
      </div>
    </div>
  );
}
