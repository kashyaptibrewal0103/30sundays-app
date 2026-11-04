import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft, Check, Plus, Minus, X as XIcon, ChevronDown, ChevronRight,
  Sparkles, Play, GripVertical, Map as MapIcon, Search, Star, Users, MapPin,
} from "lucide-react";
import { C, allItineraries } from "../data";
import { activityRating } from "../data/activityRating";
import { SEASON_LABEL, SEASON_COLOR } from "../components/seasonStyle";
import {
  BUILD_DESTS, destMeta, destAreas, MONTHS, monthRating,
  areaImg, destHero, topActivities, recommendedRoute, routeNights,
  activityPool, estimatePerPerson, formatINR, synthesizeItinerary,
  destCaption, destSocial, visaShort, cityCoords, flatActivities,
} from "../data/buildData";
import {
  TIER_META, TIER_ORDER, getResortsByTier, getResortById, getStartingPrice,
  getTierFromPrice, MEAL_INFO, MEAL_PREF_KEYS, resorts as maldivesResorts,
} from "../data/resortData";
import { useDeals } from "../data/deals";
import LoginV2 from "./LoginV2";
import NextStepNote from "../components/NextStepNote";
import MonthWeather from "../components/MonthWeather";
import DateRange from "../components/wizard/DateRange";
import RoutePicker from "../components/wizard/RoutePicker";
import { BuildingView } from "./Generating";

// How long the wait screen holds before the itinerary opens. The real build
// takes about a minute; this is a preview of it, long enough to read.
const BUILD_WAIT = 6000;

// Steps: 0 Destination · 1 Party · 2 When · 3 Cities · 4 Activities.
// Maldives swaps the last two: 3 Resort preference · 4 Meal preference.
const STEP_LABELS_DEFAULT = ["Destination", "Travelers", "Travel dates", "Cities", "Activities"];
const STEP_LABELS_MALDIVES = ["Destination", "Travelers", "Travel dates", "Resort", "Meal plan"];
// Only these get the in-app itinerary wizard; other countries go to lead capture.
const AUTO_ITINERARY_DESTS = ["Thailand", "Vietnam", "Bali"];

// Deterministic "chosen by X% of Indian couples" from a route signature (55-88%).
function couplePct(sig) {
  let h = 0;
  for (let i = 0; i < sig.length; i++) h = (h * 31 + sig.charCodeAt(i)) % 100;
  return 55 + (h % 34);
}
const CROWD_COLOR = { Low: C.sText, Mixed: C.wText, High: C.dText };
// User-facing: collapse crowd levels into a friendlier Popular / Offbeat label.
const CROWD_LABEL = { Low: "Offbeat", Mixed: "Popular", High: "Popular" };
const LABEL_COLOR = { Offbeat: C.sText, Popular: C.wText };
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Reconstruct the picked activities ({ city: [names] }) from an already-built
// itinerary, so a travellers/dates edit re-synthesises with the same day plans.
function picksFromBuilt(built) {
  const map = {};
  (built?.days || []).forEach((d) => {
    if (!d.city || !d.sub) return;
    (map[d.city] ||= []).push(...d.sub.split(" · "));
  });
  Object.keys(map).forEach((c) => { map[c] = [...new Set(map[c])]; });
  return map;
}

const paxToParty = (n) => {
  const t = Math.max(1, n || 2);
  return { couples: Math.floor(t / 2), adults: t % 2, kids: 0 };
};

// ─── Curated route recommendations (the route step is select-only) ───
const CROWD_RANK = { Low: 0, Mixed: 1, High: 2 };

// Greedy-fill an ordered area list to exactly `nights` (leftover lands on the last stop).
function buildRouteFromAreas(areas, nights) {
  const route = [];
  let rem = nights;
  for (const a of areas) {
    if (rem <= 0) break;
    const n = Math.min(a.n, rem);
    if (n > 0) { route.push({ city: a.city, n }); rem -= n; }
  }
  if (!route.length && areas[0]) route.push({ city: areas[0].city, n: nights });
  if (rem > 0 && route.length) route[route.length - 1].n += rem;
  return route;
}

// A handful of distinct curated routes for the chosen nights, from different angles.
function routeVariants(dest, nights) {
  const areas = destAreas[dest] || [];
  if (!areas.length || !nights) return [];
  const orderings = [
    areas,                                                                   // classic / recommended
    [...areas].sort((a, b) => CROWD_RANK[a.crowd] - CROWD_RANK[b.crowd]),     // calm-first
    [...areas].sort((a, b) => CROWD_RANK[b.crowd] - CROWD_RANK[a.crowd]),     // buzzy-first
    areas.slice(1).concat(areas[0]),                                         // alternate lead
    [...areas].reverse(),                                                     // flipped
  ];
  const seen = new Set(); const out = [];
  for (const ord of orderings) {
    const r = buildRouteFromAreas(ord, nights);
    const sig = r.map(s => `${s.city}${s.n}`).join("|");
    if (!r.length || seen.has(sig)) continue;
    seen.add(sig); out.push(r);
    if (out.length >= 6) break;
  }
  return out;
}

// Edit mode for a curated (non-built) plan: seed the wizard from the deal's
// itinerary + the version's travel dates so dates/travellers/route are editable.
function seedFromCurated(deal, version) {
  if (!deal) return null;
  const it = allItineraries.find((i) => i.id === (version?.itineraryId ?? deal.itineraryId));
  if (!it) return null;
  const td = version?.customizations?.travelDates || {};
  const route = (it.route?.length ? it.route : (it.days || []).map((d) => ({ city: d.city, n: d.n })))
    .map((r) => ({ city: r.city, n: r.n }));
  return {
    id: it.id,
    custom: false, // not a wizard-built itinerary, a save mints a fresh id
    dest: it.dest || deal.dest,
    route,
    nights: td.nights ?? it.nights ?? routeNights(route),
    startDate: td.fromDate || null,
    partySize: paxToParty(td.travelers ?? it.travellers ?? 2),
    _vibes: [],
    days: it.days || [],
  };
}

export default function Build({ userState = "new", otpVerified = false, setOtpVerified }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const dealsCtx = useDeals();

  // Sequential edit: re-enter the wizard at a chosen field. Fields BEFORE it are
  // locked; the chosen field and everything AFTER it are edited in order via
  // Continue; the final step saves a new version (no confirmation). `editRoute=1`
  // is kept as a legacy alias for `edit=route`.
  const editDealId = params.get("dealId");
  const editVersionId = params.get("versionId");
  const EDIT_STEP_MAP = { destination: 0, travellers: 1, dates: 2, route: 3, activities: 4 };
  const editTarget = params.get("editRoute") === "1" ? "route" : params.get("edit"); // destination | travellers | dates | route | activities
  const editRoute = editTarget === "route";
  const editMode = editTarget in EDIT_STEP_MAP && !!editDealId && !!editVersionId;
  const editingVersion = editMode ? dealsCtx.getVersion(editDealId, editVersionId) : null;
  const editDeal = editMode ? dealsCtx.getDeal(editDealId) : null;
  const editBuilt = editMode
    ? (editingVersion?.customizations?.builtItinerary
        || editDeal?.customItinerary
        || seedFromCurated(editDeal, editingVersion))
    : null;
  // Entry field the user chose; earlier steps lock, this + later steps edit.
  const editFromStep = editMode ? (EDIT_STEP_MAP[editTarget] ?? 0) : 0;
  const editStep = editFromStep;

  // Pre-selected destination (e.g. entering from a destination page): skip the
  // destination pick + intro and start on the next step with it already chosen.
  const destParam = params.get("dest");
  const seedDest = !editMode && destParam && destMeta[destParam] ? destParam : null;
  // Entering from a ready-made itinerary (Add dates / travellers / Plan my
  // trip): the trip already has day plans, so skip the Activities step and
  // finish on Route.
  const skipActivities = !!seedDest && params.get("skipActivities") === "1";

  const [step, setStep] = useState(editMode ? editStep : (seedDest ? 1 : 0));
  const [dest, setDest] = useState(editBuilt?.dest || seedDest || null);
  const [party, setParty] = useState(editBuilt?.partySize
    ? { ...editBuilt.partySize }
    : { couples: 1, adults: 0, kids: 0 });
  // Lead name captured on the Travellers step (like the lead form).
  const [name, setName] = useState(editBuilt?.leadName || "");
  const [vibes, setVibes] = useState(editBuilt?._vibes || []);
  const [startDate, setStartDate] = useState(editBuilt?.startDate || null);
  // Maldives asks for a fixed 3 or 4 nights, so it starts unset (no default fill).
  const [nights, setNights] = useState(editBuilt?.nights || (seedDest && seedDest !== "Maldives" ? (destMeta[seedDest]?.defaultNights || 7) : null));
  const [route, setRoute] = useState(editBuilt?.route || null);
  const [picks, setPicks] = useState(() => {
    // In edit mode, pre-select the activities already in the built itinerary so
    // they carry over unless the user changes them on the Activities step.
    if (!editBuilt) return new Set();
    const chosen = picksFromBuilt(editBuilt);
    const ids = new Set();
    try {
      activityPool(editBuilt.dest, editBuilt.route || [], editBuilt._vibes || []).forEach(g => {
        (chosen[g.city] || []).forEach(name => {
          const a = g.activities.find(x => x.name === name);
          if (a) ids.add(a.id);
        });
      });
    } catch (_) { /* fall back to empty */ }
    return ids;
  });
  // Maldives-only: budget tier, a specific pinned resort, and meal preferences.
  const [tier, setTier] = useState(null);
  const [pinnedResortId, setPinnedResortId] = useState(null);
  const [mealPrefs, setMealPrefs] = useState(() => new Set());
  const [detailDest, setDetailDest] = useState(null); // full-screen destination view
  const [building, setBuilding] = useState(false);
  // End-of-flow OTP gate: shown on the final CTA for unverified users, the
  // pending build action runs right after a successful verification.
  const [showAuth, setShowAuth] = useState(false);
  const pendingBuildRef = useRef(null);

  const isMaldives = dest === "Maldives";
  const STEP_LABELS = isMaldives ? STEP_LABELS_MALDIVES : STEP_LABELS_DEFAULT;
  const travellers = party.couples * 2 + party.adults + party.kids;

  const targetNights = nights || (dest ? destMeta[dest]?.defaultNights : 7);

  // Entering with a pre-seeded destination (destination page "Plan my trip" or
  // a ready-made itinerary) for a non-wizard country → send to the lead form.
  const leadRedirect = !!seedDest && !AUTO_ITINERARY_DESTS.includes(seedDest);
  useEffect(() => {
    if (leadRedirect) navigate(`/plan?dest=${encodeURIComponent(seedDest)}`, { replace: true });
  }, [leadRedirect, seedDest]);

  // The route step starts empty. It used to arrive with our recommended route
  // already filled in, and the screen recordings were plain about what that
  // did: nobody changed it, because a list that is already ticked is a list
  // nobody reads. The couple picks the places; we put them in order.
  // Maldives has no route step, so it never seeds one.
  useEffect(() => {
    if (!isMaldives && step >= 3 && dest && targetNights && !route) {
      setRoute([]);
    }
  }, [isMaldives, step, dest, targetNights, route]);

  const runningTotal = dest && targetNights
    ? estimatePerPerson(dest, routeNights(route || []) || targetNights) * travellers
    : null;

  // ─── navigation ───
  const goBack = () => {
    // Sequential edit: step back through the editable range; leave at the entry.
    if (editMode) {
      if (step > editFromStep) { setStep(s => s - 1); return; }
      navigate(-1); return;
    }
    // With a pre-seeded destination, step 1 is the first screen; leaving it exits.
    if (step === 0 || (seedDest && step === 1)) { navigate(-1); return; }
    setStep(s => Math.max(0, s - 1));
  };
  const goNext = () => setStep(s => s + 1);

  // Tapping the greyed Continue on the route step asks the step to say what
  // is missing, rather than the button simply not responding.
  const [routeNudge, setRouteNudge] = useState(0);
  const nudgeRoute = () => setRouteNudge((n) => n + 1);

  // Reset the trip to a freshly-picked destination (nights, route, activities).
  const resetForDest = (d) => {
    setDest(d);
    // Maldives asks for nights (3/4) on the dates step, so leave it unset.
    setNights(d === "Maldives" ? null : (destMeta[d]?.defaultNights || 7));
    setRoute(null); setPicks(new Set()); setVibes([]);
    setTier(null); setPinnedResortId(null); setMealPrefs(new Set());
  };
  // Grid tap: select the destination but stay on step 0 (a sticky Continue
  // advances). Watching from the detail view still advances directly.
  const pickDest = (d) => resetForDest(d);
  const chooseDest = (d) => { resetForDest(d); setDetailDest(null); setStep(1); };
  // From the standalone Select-destination page: only Bali / Vietnam / Thailand
  // continue into the customisation wizard; every other country goes to the
  // existing lead-generation form.
  const pickDestination = (d) => {
    if (AUTO_ITINERARY_DESTS.includes(d)) chooseDest(d);
    else navigate(`/plan?dest=${encodeURIComponent(d)}`);
  };

  // ─── activities → build ───
  const picksByCity = useMemo(() => {
    const map = {};
    if (!route) return map;
    activityPool(dest, route, vibes).forEach(g => {
      map[g.city] = g.activities.filter(a => picks.has(a.id)).map(a => a.name);
    });
    return map;
  }, [route, vibes, picks]);

  const doBuild = () => {
    setBuilding(true);
    setTimeout(() => {
      const it = synthesizeItinerary({
        dest, nights: routeNights(route), route, picksByCity, vibes, startDate, party,
      });
      it._vibes = vibes; // keep for potential re-entry
      it.leadName = name; // captured on the Travellers step, kept for re-entry
      const { dealId, versionId } = dealsCtx.createDeal({
        itineraryId: it.id,
        dest: it.dest,
        title: route.map(r => r.city).join(" · "),
        img: it.img,
        createdBy: "customer",
        customItinerary: it,
        customizations: { leadName: name, selectedDayOptions: {}, selectedHotels: {}, travelDates: { fromDate: startDate, nights: it.nights, travelers: travellers }, builtItinerary: it },
        indicativePrice: Number(String(it.price).replace(/,/g, "")) || 0,
      });
      // The loader was the wait. What it built is saved as V1 on the spot,
      // rather than landing as a draft that asks to be saved again.
      dealsCtx.requestPricing(dealId, versionId, Number(String(it.price).replace(/,/g, "")) || 0);
      // Skip the reveal: drop straight onto the itinerary screen. Replace so
      // Back from the itinerary doesn't return into the half-built wizard.
      navigate(`/itinerary/${it.id}?dealId=${dealId}&versionId=${versionId}&saved=1`, { replace: true });
    }, BUILD_WAIT);
  };

  // Mobile OTP verification before the itinerary is created (non-skippable).
  // Verified users (or known leads/customers) go straight to the build.
  const gatedBuild = (fn) => {
    if (userState === "new" && !otpVerified) {
      pendingBuildRef.current = fn;
      setShowAuth(true);
    } else {
      fn();
    }
  };

  // Maldives: no multi-city itinerary. Collect the choices and land on a quote
  // screen listing the shortlisted resort(s), passing dates/nights/meal along.
  const doBuildMaldives = () => {
    setBuilding(true);
    setTimeout(() => {
      const qs = new URLSearchParams();
      qs.set("nights", String(nights || 3));
      if (startDate) qs.set("date", startDate);
      qs.set("pax", String(travellers));
      if (pinnedResortId) qs.set("resort", pinnedResortId);
      else if (tier) qs.set("tier", tier);
      if (mealPrefs.size) qs.set("meal", [...mealPrefs].join(","));
      navigate(`/maldives-quote?${qs.toString()}`, { replace: true });
    }, BUILD_WAIT);
  };

  // ─── Save the sequential edit → fork a new version (no confirmation) ───
  // The walk ends on the Activities step, so the itinerary is rebuilt from the
  // current dest / dates / route / activities. Day-option and hotel swaps reset
  // because the plan is regenerated.
  const applyEdit = () => {
    const nightsChanged = nights && routeNights(route) !== nights;
    const effRoute = nightsChanged ? recommendedRoute(dest, nights) : route;
    const it = synthesizeItinerary({
      dest, nights: routeNights(effRoute), route: effRoute,
      picksByCity, vibes, startDate, party,
      // Reuse a built trip's id; a curated edit mints a fresh (high) id so it
      // doesn't collide with the seed itinerary it forked from.
      id: editBuilt?.custom ? editBuilt.id : undefined,
    });
    it._vibes = vibes;
    const { versionId: newVer } = dealsCtx.forkVersion(editDealId, editVersionId);
    dealsCtx.updateDraft(editDealId, newVer, {
      customizations: {
        selectedDayOptions: {},
        selectedHotels: {},
        travelDates: { fromDate: startDate, nights: it.nights, travelers: travellers },
        builtItinerary: it,
      },
      indicativePrice: Number(String(it.price).replace(/,/g, "")) || 0,
    });
    // Saved as the next version straight away, the same as a new trip.
    dealsCtx.requestPricing(editDealId, newVer, Number(String(it.price).replace(/,/g, "")) || 0);
    dealsCtx.setCustomItinerary(editDealId, it);
    // Replace the editor entry so Back lands on the itinerary, not the wizard.
    navigate(`/itinerary/${it.id}?dealId=${editDealId}&versionId=${newVer}&saved=1`, { replace: true });
  };

  // The route has to spend every night the dates bought. Fewer nights in the
  // cities than in the trip is not a shorter holiday, it is an itinerary with
  // a hole in it, so Continue waits until the two agree.
  const routeMinN = destMeta[dest]?.minNights || 4;
  const ROUTE_LONG = 14;
  const routeStepOk = !!route?.length && targetNights <= ROUTE_LONG
    && routeNights(route) === targetNights;

  // ─── primary CTA per step ───
  // Couples only: groups must be an even number of adults (pairs of couples).
  const partyOk = party.kids === 0 && !party.solo && (party.couples > 0 || party.adults % 2 === 0);
  const nameOk = name.trim().length > 0; // Travellers step now also needs a name
  const ctaFor = () => {
    // Sequential edit: Continue through each editable step in order; the final
    // step saves a new version with no confirmation. Activities is not part of
    // the edit flow, so Route is the last step (Maldives ends on Meal plan).
    if (editMode) {
      const stepValid = step === 0 ? !!dest
        : step === 1 ? (partyOk && nameOk)
        : step === 2 ? (!!startDate && !!nights)
        : step === 3 ? (isMaldives ? (!!tier || !!pinnedResortId) : routeStepOk)
        : true;
      const editLast = isMaldives ? 4 : 3;
      const blocked = step === 3 && !isMaldives ? nudgeRoute : undefined;
      if (step >= editLast) return { label: "Save changes", onClick: applyEdit, enabled: stepValid, onBlocked: blocked };
      return { label: "Continue", onClick: goNext, enabled: stepValid, onBlocked: blocked };
    }
    // Destination step: a sticky Select CTA once a place is chosen.
    if (step === 0) return dest ? { label: `Select ${dest}`, onClick: goNext, enabled: true } : null;
    if (isMaldives) {
      switch (step) {
        case 1: return { label: "Continue", onClick: goNext, enabled: partyOk && nameOk };
        case 2: return { label: "Continue", onClick: goNext, enabled: !!startDate && !!nights };
        case 3: return { label: "Continue", onClick: goNext, enabled: !!tier || !!pinnedResortId };
        case 4: return mealPrefs.size > 0
          ? { label: "See my quote ✦", onClick: () => gatedBuild(doBuildMaldives), enabled: true }
          : { label: "Skip & see my quote", onClick: () => gatedBuild(doBuildMaldives), enabled: true };
        default: return null;
      }
    }
    switch (step) {
      case 1: return { label: "Continue", onClick: goNext, enabled: partyOk && nameOk };
      case 2: return { label: "Continue", onClick: goNext, enabled: !!startDate && !!nights };
      case 3: return skipActivities
        ? { label: "Create my itinerary ✦", onClick: () => gatedBuild(doBuild), enabled: routeStepOk, onBlocked: nudgeRoute }
        : { label: "Looks good, continue", onClick: goNext, enabled: routeStepOk, onBlocked: nudgeRoute };
      case 4: return picks.size > 0
        ? { label: "Create my itinerary ✦", onClick: () => gatedBuild(doBuild), enabled: true }
        : { label: "Skip & build my trip", onClick: () => gatedBuild(doBuild), enabled: true };
      default: return null;
    }
  };
  const cta = ctaFor();

  // ─── progress stepper: what each stage answered ───
  // A stage shows its answer once it has one, and its own name until then.
  // Tapping a completed stage jumps back to it, and a pre-seeded destination
  // locks stage 0.
  // "10 Nov", not "10/11". A slash date is two numbers to decode, and on a
  // step whose whole job is to say what you already answered, that is the one
  // thing it must not be. The month is short so two of them still fit the row.
  const ddmm = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  let whenVal = null;
  if (startDate) {
    const s = new Date(startDate);
    whenVal = nights ? `${ddmm(s)} - ${ddmm(new Date(s.getTime() + nights * 86400000))}` : ddmm(s);
  }
  const adultCount = party.couples * 2 + party.adults;
  const resortPrefVal = pinnedResortId
    ? (getResortById(pinnedResortId)?.name || "Resort")
    : tier ? TIER_META[tier]?.label : null;
  const stepSummary = [
    dest || null,                                                            // Destination
    // "2 adults", not "2A". The same point as the activities stage: a code
    // saves four characters in a row that scrolls anyway, and costs the reader
    // the one thing the stage is there to tell them.
    step >= 1
      ? `${adultCount} adult${adultCount === 1 ? "" : "s"}${party.kids ? `, ${party.kids} ${party.kids === 1 ? "child" : "children"}` : ""}`
      : null,                                                                // Travelers
    whenVal,                                                                 // Travel dates
    isMaldives
      ? resortPrefVal                                                        // Resort preference
      : (route?.length ? `${route.length} ${route.length === 1 ? "city" : "cities"}` : null), // Cities
    // What was picked, not how many picks. "2 picks" on the Activities step is
    // a count of taps; "2 activities" is the answer the step was asking for.
    isMaldives
      ? (mealPrefs.size ? `${mealPrefs.size} meal plan${mealPrefs.size === 1 ? "" : "s"}` : null) // Meal plan
      : (picks.size ? `${picks.size} activit${picks.size === 1 ? "y" : "ies"}` : null),           // Activities
  ];
  // Sequential edit: tap back to any already-reached editable step (from the
  // entry field up to the current step) to edit it again; forward still only via
  // Continue, and steps before the entry stay locked. Outside edit, tapping a
  // done stage jumps back; a pre-seeded destination keeps step 0 locked.
  const canJump = (i) => editMode ? (i >= editFromStep && i <= step) : !(seedDest && i === 0);
  const jumpTo = (i) => { if (canJump(i)) setStep(i); };
  // Keep the current stage in view as the row scrolls.
  const stepBarRef = useRef(null);
  useEffect(() => {
    const el = stepBarRef.current?.children?.[step];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [step]);

  // Approach B: the wizard is open to everyone; identity is asked at the end.
  // On "Create my itinerary", new users verify their mobile number (mandatory,
  // no skip), then the generating splash runs and the itinerary is created.
  if (showAuth) {
    return (
      <LoginV2
        onComplete={() => {
          setOtpVerified?.(true);
          setShowAuth(false);
          const fn = pendingBuildRef.current;
          pendingBuildRef.current = null;
          fn?.();
        }}
        validateOtp={(otp) => (otp === "000000" ? "Invalid OTP. Please try again." : null)}
      />
    );
  }

  if (leadRedirect) return null;
  if (building) return <Building dest={dest} cities={(route || []).map((r) => r.city)} />;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.white }}>
      {/* Header: back + segmented progress + running total */}
      <div style={{ flexShrink: 0, padding: "12px 14px 10px", borderBottom: `1px solid ${C.div}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goBack} aria-label="Back" style={iconBtn}>
            <ArrowLeft size={20} color={C.head} />
          </button>
          {/* The standalone Select-destination page (step 0, fresh entry) shows no
              stepper - the wizard only appears once a wizard-eligible country is
              chosen. Edit mode keeps the stepper on step 0. */}
          {(editMode || step > 0) && (
          /* ─── The stepper ───
              One line per stage, not two. It used to carry the stage's name
              and its answer stacked on top of each other, which is the same
              word twice: "Destination" over "Vietnam" tells you nothing that
              "Vietnam" does not, and five of those made a header taller than
              the question underneath it.

              So a stage shows its answer once it has one, and its name until
              then. The bar above says where you are, the pink says which stage
              you are on, and tapping a done one jumps back. */
          <div ref={stepBarRef} className="hide-scrollbar" style={{ flex: 1, display: "flex", gap: 10, minWidth: 0, overflowX: "auto" }}>
            {/* Activities is dropped for the edit flow and the ready-made-itinerary
                flow (both non-Maldives end on Route). */}
            {((editMode || skipActivities) && !isMaldives ? STEP_LABELS.slice(0, 4) : STEP_LABELS).map((label, i) => {
              const done = i < step;
              const current = i === step;
              // Steps before the edit entry are locked (dimmed); the entry and
              // steps up to the current one read as reached (coloured bar). A
              // pre-seeded destination is fixed too, so it shows greyed out.
              const locked = (editMode && i < editFromStep) || (!!seedDest && i === 0);
              const active = !locked && (done || current); // reached (coloured bar)
              const jumpable = canJump(i);
              const val = stepSummary[i];
              return (
                <button
                  key={label}
                  onClick={() => jumpTo(i)}
                  disabled={!jumpable}
                  aria-label={`${label}${val ? `: ${val}` : ""}`}
                  style={{
                    flexShrink: 0, padding: 0, border: "none", background: "none",
                    textAlign: "left", cursor: jumpable ? "pointer" : "default", fontFamily: "inherit",
                    opacity: locked ? 0.4 : 1,
                  }}
                >
                  <div style={{ height: 4, borderRadius: 4, background: active ? C.p600 : C.div, transition: "background .2s" }} />
                  {/* An answer reads as an answer: darker and heavier than the
                      question it replaced. */}
                  <p style={{
                    margin: "6px 0 0", fontSize: 11.5, whiteSpace: "nowrap",
                    fontWeight: val ? 700 : 500,
                    color: current ? C.p600 : val ? C.head : C.inact,
                  }}>{val || label}</p>
                </button>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {step === 0 && <StepDestination onOpen={setDetailDest} selected={dest} onSelect={pickDestination} />}
        {step === 1 && <StepParty name={name} setName={setName} party={party} setParty={setParty} onContinue={goNext} />}
        {step === 2 && (isMaldives
          ? <StepDatesMaldives dest={dest} startDate={startDate} setStartDate={setStartDate} nights={nights} setNights={setNights} />
          : <StepDates dest={dest} startDate={startDate} setStartDate={setStartDate} nights={nights} setNights={setNights} />
        )}
        {step === 3 && (isMaldives
          ? <StepResortPref tier={tier} setTier={setTier} pinnedResortId={pinnedResortId} setPinnedResortId={setPinnedResortId} nights={nights} />
          : (route && <StepRoute dest={dest} nights={targetNights} startDate={startDate} route={route} setRoute={setRoute} setNights={setNights} editRoute={editRoute} nudge={routeNudge} />)
        )}
        {step === 4 && (isMaldives
          ? <StepMealPref mealPrefs={mealPrefs} setMealPrefs={setMealPrefs} />
          : (route && <StepActivities dest={dest} route={route} vibes={vibes} picks={picks} setPicks={setPicks} />)
        )}
      </div>

      {/* Footer CTA. On the step that actually builds the trip, it says what
          tapping it produces and that the result can still be changed. */}
      {cta && (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, background: C.white }}>
        {(step === 4 || (step === 3 && skipActivities)) && <NextStepNote />}
        <div style={{ padding: "12px 16px calc(12px + env(safe-area-inset-bottom))" }}>
          {/* A greyed CTA that answers when it is tapped. A button that does
              nothing at all leaves somebody guessing what is missing. */}
          <button
            onClick={cta.enabled ? cta.onClick : cta.onBlocked}
            disabled={!cta.enabled && !cta.onBlocked}
            style={{
              ...primaryBtn,
              opacity: cta.enabled ? 1 : 0.4,
              cursor: cta.enabled || cta.onBlocked ? "pointer" : "default",
            }}
          >
            {cta.label}
          </button>
          </div>
        </div>
      )}

      {/* Full-screen destination view */}
      {detailDest && (
        <DestinationDetail dest={detailDest} onClose={() => setDetailDest(null)} onChoose={pickDestination} />
      )}
    </div>
  );
}

// ════════════════════ Step 0: Destination ════════════════════
// A compact grid of portrait cards (4+ visible, scroll for more). Each signals a
// video and shows a one-line visa. Tapping opens a full-screen view.
const DEST_FLAGS = { Bali: "🇮🇩", Vietnam: "🇻🇳", Thailand: "🇹🇭", Maldives: "🇲🇻", "Sri Lanka": "🇱🇰", "New Zealand": "🇳🇿", Georgia: "🇬🇪", Azerbaijan: "🇦🇿", Kazakhstan: "🇰🇿", Europe: "🇪🇺", Mauritius: "🇲🇺" };
const visaTone = (v) => (/e-?visa|eta/i.test(v) ? "blue" : "green");

function StepDestination({ onOpen, selected, onSelect }) {
  // Photo rows: real destination image + name + visa tag (+ trending). One tap
  // selects and moves straight to the next step. Quick to scan, no video.
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 16px 10px" }}>
        <h1 style={titleStyle}>Select destination</h1>
        <p style={subStyle}>Tap a destination to choose.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {BUILD_DESTS.map((d) => {
            const soc = destSocial[d] || {};
            const on = selected === d;
            const visa = visaShort(d);
            const pill = visaTone(visa) === "blue"
              ? { color: "#1570EF", background: "#EAF2FE" }
              : { color: "#067647", background: "#E7F4EC" };
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                  padding: 10, borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                  background: on ? C.p100 : C.white,
                  border: `1.5px solid ${on ? C.p600 : C.div}`,
                }}
              >
                <img src={destHero(d)} alt={d} style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: C.head, letterSpacing: "-0.2px" }}>
                    {DEST_FLAGS[d] ? `${DEST_FLAGS[d]} ` : ""}{d}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ ...pill, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{visa}</span>
                    {soc.trending && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#9A6B00", background: "#FBEFD3", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: ".3px" }}>🔥 Trending</span>
                    )}
                  </div>
                </div>
                {on
                  ? <span style={{ width: 24, height: 24, borderRadius: "50%", background: C.p600, display: "grid", placeItems: "center", flexShrink: 0 }}><Check size={14} color="#fff" strokeWidth={3} /></span>
                  : <ChevronRight size={20} color={C.inact} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
        <p style={{ textAlign: "center", color: C.inact, fontSize: 12, fontWeight: 600, margin: "16px 0 4px" }}>
          More destinations landing soon ✈️
        </p>
      </div>
    </div>
  );
}

// Full-screen destination view: immersive media with content overlaid (no
// opaque panel over the video) and an explicit Select.
function DestinationDetail({ dest, onClose, onChoose }) {
  const meta = destMeta[dest];
  const nightsRange = `${meta.minNights}–${meta.minNights + 4}`;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, background: "#000" }}>
      <img src={destHero(dest)} alt={dest} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.45) 100%)" }} />
      {/* close */}
      <button onClick={onClose} style={{ position: "absolute", top: 14, left: 14, ...iconBtn, background: "rgba(0,0,0,0.4)" }} aria-label="Close"><XIcon size={20} color="#fff" /></button>
      {/* centre play affordance */}
      <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)", border: "1.5px solid rgba(255,255,255,0.65)", display: "grid", placeItems: "center" }}>
        <Play size={24} color="#fff" fill="#fff" />
      </div>
      {/* content overlaid on media */}
      <div style={{ position: "absolute", left: 18, right: 18, bottom: 20, color: "#fff" }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.4px", fontFamily: "Georgia, 'Times New Roman', serif" }}>{dest}</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.45, color: "rgba(255,255,255,0.92)" }}>{destCaption[dest]}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "14px 0 0" }}>
          <GlassChip>🛂 {visaShort(dest)}</GlassChip>
          <GlassChip>🌙 {nightsRange} nights</GlassChip>
        </div>
        <button onClick={() => onChoose(dest)} style={{ ...primaryBtn, marginTop: 16 }}>Select {dest}</button>
      </div>
    </div>
  );
}

const GlassChip = ({ children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: 20 }}>{children}</span>
);

// Social-proof stat, reused wherever we tell a couple "X% chose this": on a
// route card (light background) or over a photo/video (dark, glassy).
const TrustBadge = ({ pct, dark }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: dark ? 12 : 11.5, fontWeight: 700,
    color: dark ? "#fff" : C.p600,
    background: dark ? "rgba(227,27,83,0.35)" : C.p100,
    border: dark ? "1px solid rgba(255,255,255,0.35)" : "none",
    backdropFilter: dark ? "blur(6px)" : "none",
    padding: "6px 11px", borderRadius: 20,
  }}>
    <Users size={dark ? 13 : 12} color={dark ? "#fff" : C.p600} strokeWidth={2.4} />
    Chosen by {pct}% of Indian couples
  </span>
);

// ════════════════════ Step 1: Party ════════════════════
// Card-based. Couple and two-couples need no extra input (tap advances). A
// bigger group reveals traveller + kids steppers inline.
function StepParty({ name, setName, party, setParty, onContinue }) {
  const isGroup = party.couples === 0 && party.kids === 0 && !party.solo;
  // Selecting "couple with kids" or "solo traveller" doesn't advance, we
  // surface a couples-only note and disable Continue (Build reads these as
  // not-catered signals).
  const kidsBlocked = party.kids > 0;
  const soloBlocked = !!party.solo;
  // Groups travel as couples: an odd adult count blocks Continue with a note.
  const oddBlocked = isGroup && party.adults % 2 !== 0;
  const [showCountList, setShowCountList] = useState(false);
  // The name is the only thing on this step nobody can answer for you, so the
  // cursor starts in it. Leaving it empty says so, rather than leaving a grey
  // field and a dead Continue button to explain themselves.
  const nameRef = useRef(null);
  const [nameTouched, setNameTouched] = useState(false);
  const nameMissing = nameTouched && !name.trim();
  useEffect(() => { nameRef.current?.focus(); }, []);
  const COUNT_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12];
  const cards = [
    { key: "couple", emoji: "💑", label: "2 Adults", on: party.couples === 1 && !kidsBlocked && !soloBlocked },
    { key: "group", emoji: "👯", label: "4 or More Adults", on: isGroup },
    { key: "kids", emoji: "👨‍👩‍👧", label: "Adults with Children", on: kidsBlocked },
    { key: "solo", emoji: "🧍", label: "Solo Traveller", on: soloBlocked },
  ];
  const pick = (key) => {
    if (key === "kids") { setParty({ couples: 1, adults: 0, kids: 1, solo: false }); return; } // not catered → blocks Continue
    if (key === "solo") { setParty({ couples: 0, adults: 1, kids: 0, solo: true }); return; } // not catered → blocks Continue
    if (key === "couple") { setParty({ couples: 1, adults: 0, kids: 0, solo: false }); } // footer Continue advances (needs name)
    else setParty({ couples: 0, adults: 4, kids: 0, solo: false }); // reveal stepper, stay on screen
  };
  const setAdults = (v) => setParty(p => ({ ...p, adults: Math.max(4, v) }));
  return (
    <div style={{ padding: "18px 16px 24px" }}>
      <h1 style={titleStyle}>Who is Travelling?</h1>
      {/* Name (like the lead form), above the traveller selection */}
      <div style={{ marginTop: 16 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.head, marginBottom: 6 }}>
          Your name <span style={{ color: C.p600 }}>*</span>
        </label>
        <input
          ref={nameRef}
          data-testid="build-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setNameTouched(true)}
          placeholder="What should we call you?"
          style={{
            width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 14,
            border: `1.5px solid ${nameMissing ? "#D92D20" : name.trim() ? C.p600 : C.div}`,
            fontSize: 15, color: C.head,
            background: C.white, outline: "none", fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
        />
        {nameMissing && (
          <p data-testid="build-name-error" style={{ margin: "7px 2px 0", fontSize: 12.5, color: "#D92D20" }}>
            Please enter your name
          </p>
        )}
      </div>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.head, margin: "18px 0 0" }}>
        Select number of travellers
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
        {cards.map(c => (
          <div key={c.key}>
            <button onClick={() => pick(c.key)} style={{
              display: "flex", alignItems: "center", gap: 13, padding: "16px", borderRadius: 14, width: "100%",
              border: c.on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: c.on ? C.p100 : C.white, cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 26 }}>{c.emoji}</span>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: c.on ? C.p600 : C.head }}>{c.label}</span>
              {c.on && <Check size={20} color={C.p600} strokeWidth={2.5} />}
            </button>
            {c.key === "group" && isGroup && (
              <div style={{ marginTop: 10, border: `1px solid ${C.div}`, borderRadius: 14, animation: "fadeUp 0.2s ease-out" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>Travellers</span>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setShowCountList(v => !v)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, background: C.white, border: `1.5px solid ${C.div}`, cursor: "pointer", fontFamily: "inherit", minWidth: 64, justifyContent: "center" }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.head }}>{party.adults}</span>
                      <ChevronDown size={14} color={C.head} style={{ transition: "transform 0.2s", transform: showCountList ? "rotate(180deg)" : "none" }} />
                    </button>
                    {showCountList && (
                      <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50, background: C.white, borderRadius: 12, border: `1px solid ${C.div}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "auto", width: 80, maxHeight: 240 }}>
                        {COUNT_OPTIONS.map((n, idx) => (
                          <button
                            key={n}
                            onClick={() => { setAdults(n); setShowCountList(false); }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "12px 0", background: n === party.adults ? C.p100 : C.white, border: "none", cursor: "pointer", fontFamily: "inherit", borderBottom: idx < COUNT_OPTIONS.length - 1 ? `1px solid ${C.div}` : "none", fontSize: 15, fontWeight: n === party.adults ? 700 : 500, color: n === party.adults ? C.p600 : C.head }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {oddBlocked && (
        <div style={{ marginTop: 14, padding: 16, borderRadius: 14, background: "linear-gradient(135deg, #FFF5F0 0%, #FFE4E8 100%)", border: "1px solid rgba(254,163,180,0.27)", animation: "fadeUp 0.3s ease-out" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#89123E", margin: "0 0 4px" }}>We're so sorry! 😔</p>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "18px" }}>
            Right now, 30 Sundays only plans trips for couples, so the group needs an even number of travellers.
          </p>
          <p style={{ fontSize: 13, color: C.p600, fontWeight: 600, margin: "8px 0 0" }}>Pick an even number and let's plan something unforgettable. 💕</p>
        </div>
      )}
      {kidsBlocked && (
        <div style={{ marginTop: 14, padding: 16, borderRadius: 14, background: "linear-gradient(135deg, #FFF5F0 0%, #FFE4E8 100%)", border: "1px solid rgba(254,163,180,0.27)", animation: "fadeUp 0.3s ease-out" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#89123E", margin: "0 0 4px" }}>We're so sorry! 😔</p>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "18px" }}>
            Right now, 30 Sundays is exclusively crafted for couples, romantic getaways, sunset dinners for two, that kind of magic. We don't have kids' itineraries yet, but we're working on it!
          </p>
          <p style={{ fontSize: 13, color: C.p600, fontWeight: 600, margin: "8px 0 0" }}>For now, maybe plan a couples-only escape? You deserve it. 💕</p>
        </div>
      )}
      {soloBlocked && (
        <div style={{ marginTop: 14, padding: 16, borderRadius: 14, background: "linear-gradient(135deg, #FFF5F0 0%, #FFE4E8 100%)", border: "1px solid rgba(254,163,180,0.27)", animation: "fadeUp 0.3s ease-out" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#89123E", margin: "0 0 4px" }}>We're so sorry! 😔</p>
          <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "18px" }}>
            Right now, 30 Sundays is exclusively crafted for couples, so we don't have solo itineraries yet. We're working on it!
          </p>
          <p style={{ fontSize: 13, color: C.p600, fontWeight: 600, margin: "8px 0 0" }}>Grab a partner and let's plan something unforgettable together. 💕</p>
        </div>
      )}
    </div>
  );
}

function Stepper({ label, value, onChange, min = 0, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: last ? "none" : `1px solid ${C.div}` }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => onChange(value - 1)} disabled={value <= min} style={{ ...roundBtn, opacity: value <= min ? 0.3 : 1 }} aria-label={`Less ${label}`}><Minus size={16} color={C.head} /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.head, minWidth: 18, textAlign: "center" }}>{value}</span>
        <button onClick={() => onChange(value + 1)} style={roundBtn} aria-label={`More ${label}`}><Plus size={16} color={C.head} /></button>
      </div>
    </div>
  );
}

// ════════════════════ Step 2: When & how long ════════════════════


function StepDates({ dest, startDate, setStartDate, nights, setNights }) {
  const minN = destMeta[dest]?.minNights || 3;
  // The calendar opens part-way down, at next month, so the question has to
  // stay on the screen rather than scrolling off with the months above it.
  // Its height is handed to the calendar, which parks its weekday row
  // underneath rather than on top of it.
  const head = useRef(null);
  const [headH, setHeadH] = useState(52);
  useLayoutEffect(() => {
    const el = head.current;
    if (!el) return;
    const read = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      setHeadH((prev) => (prev === h ? prev : h));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div ref={head} style={{
        position: "sticky", top: 0, zIndex: 6, background: C.white, padding: "18px 0 10px",
      }}>
        <h1 style={titleStyle}>Select travel dates</h1>
      </div>
      <DateRange
        dest={dest}
        minNights={minN}
        stickyTop={headH}
        startDate={startDate}
        setStartDate={setStartDate}
        nights={nights}
        setNights={setNights}
      />
    </div>
  );
}
// Same month strip + calendar look, but a single start date and two night options.
function StepDatesMaldives({ dest, startDate, setStartDate, nights, setNights }) {
  const today = new Date();
  const monthsList = useMemo(() => {
    const out = [];
    for (let i = 0; i < 10; i++) {
      const m = (today.getMonth() + i) % 12;
      const y = today.getFullYear() + Math.floor((today.getMonth() + i) / 12);
      out.push({ m, y });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sel = startDate ? new Date(startDate) : null;
  const [openMonth, setOpenMonth] = useState(() => sel ? { m: sel.getMonth(), y: sel.getFullYear() } : monthsList[1]);
  const DAY_MS = 86400000;
  const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endD = startDate && nights ? new Date(midnight(sel).getTime() + nights * DAY_MS) : null;
  const ndays = DAYS_IN_MONTH[openMonth.m] + (openMonth.m === 1 && openMonth.y % 4 === 0 ? 1 : 0);
  const isPast = (day) => new Date(openMonth.y, openMonth.m, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const firstDow = new Date(openMonth.y, openMonth.m, 1).getDay();
  const shortDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const pickDay = (day) => setStartDate(new Date(openMonth.y, openMonth.m, day).toISOString());

  return (
    <div style={{ padding: "18px 16px 24px" }}>
      <h1 style={titleStyle}>When & how long?</h1>
      <p style={subStyle}>Pick a start date, then choose your nights.</p>

      {/* month strip */}
      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "16px -16px 0", padding: "0 16px 4px" }}>
        {monthsList.map(({ m, y }) => {
          const r = monthRating(dest, m);
          const on = openMonth.m === m && openMonth.y === y;
          return (
            <button key={`${m}-${y}`} onClick={() => setOpenMonth({ m, y })} style={{
              flexShrink: 0, padding: "9px 14px 10px", borderRadius: 12, cursor: "pointer", textAlign: "center",
              border: on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white,
            }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: on ? C.p600 : C.head }}>{MONTHS[m]}</span>
              <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, color: SEASON_COLOR[r], marginTop: 2 }}>{SEASON_LABEL[r]}</span>
              <MonthWeather dest={dest} monthIdx={m} on={on} />
            </button>
          );
        })}
      </div>

      {/* day grid, single start date */}
      <p style={{ margin: "18px 0 8px", fontSize: 13, fontWeight: 700, color: C.head }}>Pick your start date</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.inact }}>{d}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: ndays }, (_, i) => i + 1).map(day => {
          const past = isPast(day);
          const d = new Date(openMonth.y, openMonth.m, day);
          const isStart = sel && d.getTime() === midnight(sel).getTime();
          const isEnd = endD && d.getTime() === midnight(endD).getTime();
          const inRange = sel && endD && d > midnight(sel) && d < midnight(endD);
          const cap = isStart || isEnd;
          return (
            <button key={day} disabled={past} onClick={() => pickDay(day)} style={{
              aspectRatio: "1", borderRadius: 10, border: "none", cursor: past ? "default" : "pointer",
              background: cap ? C.p600 : inRange ? C.p100 : past ? "transparent" : C.bg,
              color: cap ? "#fff" : inRange ? C.p600 : past ? C.icon : C.head,
              fontSize: 13, fontWeight: cap ? 800 : inRange ? 700 : 600, opacity: past ? 0.4 : 1,
            }}>{day}</button>
          );
        })}
      </div>

      {/* nights: 3 or 4 */}
      <p style={{ margin: "20px 0 8px", fontSize: 13, fontWeight: 700, color: C.head }}>How many nights?</p>
      <div style={{ display: "flex", gap: 10 }}>
        {[3, 4].map(nOpt => {
          const on = nights === nOpt;
          return (
            <button key={nOpt} onClick={() => setNights(nOpt)} style={{
              flex: 1, padding: "14px 0", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
              border: on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white,
              fontSize: 15, fontWeight: 800, color: on ? C.p600 : C.head,
            }}>{nOpt} nights</button>
          );
        })}
      </div>
      <p style={{ margin: "10px 2px 0", fontSize: 12, color: C.sub }}>Need more nights? Talk to our executive.</p>

      {/* summary */}
      {startDate && nights && (
        <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 14, background: C.bg, border: `1px solid ${C.div}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>{shortDate(sel)} – {shortDate(endD)}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: C.p600 }}>{nights} nights</span>
        </div>
      )}
    </div>
  );
}

// ════════════════════ Maldives Step 3: Resort preference ════════════════════
// Budget tiers (shortlist their resorts) OR a typeahead to pin one resort.
function StepResortPref({ tier, setTier, pinnedResortId, setPinnedResortId }) {
  const [query, setQuery] = useState(pinnedResortId ? (getResortById(pinnedResortId)?.name || "") : "");
  const [open, setOpen] = useState(false);
  const pinned = pinnedResortId ? getResortById(pinnedResortId) : null;
  const q = query.trim().toLowerCase();
  const matches = q ? maldivesResorts.filter(r => r.name.toLowerCase().includes(q)).slice(0, 6) : [];

  const pickTier = (key) => { setTier(key); setPinnedResortId(null); setQuery(""); setOpen(false); };
  const pickResort = (r) => { setPinnedResortId(r.id); setTier(null); setQuery(r.name); setOpen(false); };
  const clearResort = () => { setPinnedResortId(null); setQuery(""); };

  return (
    <div style={{ padding: "18px 16px 24px" }}>
      <h1 style={titleStyle}>Any resort preference?</h1>
      <p style={subStyle}>Pick a budget level, or search for a resort.</p>

      {/* budget tiers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {TIER_ORDER.map(key => {
          const meta = TIER_META[key];
          const names = getResortsByTier(key).map(r => r.name).join(", ");
          const from = getTierFromPrice(key);
          const on = tier === key && !pinnedResortId;
          return (
            <button key={key} onClick={() => pickTier(key)} style={{
              display: "block", width: "100%", textAlign: "left", padding: "15px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
              border: on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: on ? C.p600 : C.head }}>{meta.label}</span>
                {on ? <Check size={20} color={C.p600} strokeWidth={2.5} />
                    : from && <span style={{ fontSize: 12.5, fontWeight: 700, color: C.sub }}>from ₹{from}<span style={{ fontWeight: 500, color: C.inact }}>/pp</span></span>}
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.sub }}>{meta.blurb}</p>
              <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 600, color: C.inact }}>{names}</p>
            </button>
          );
        })}
      </div>

      {/* or search a specific resort */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 12px" }}>
        <div style={{ flex: 1, height: 1, background: C.div }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.inact }}>OR</span>
        <div style={{ flex: 1, height: 1, background: C.div }} />
      </div>
      <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.head }}>Know the resort you want?</p>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 44, borderRadius: 12, border: `1.5px solid ${pinned ? C.p600 : C.div}`, background: C.white }}>
          <Search size={16} color={C.inact} style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); if (pinnedResortId) setPinnedResortId(null); }}
            onFocus={() => setOpen(true)}
            placeholder="Search resorts by name"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.head, fontFamily: "inherit", background: "transparent", minWidth: 0 }}
          />
          {(query || pinned) && (
            <button onClick={clearResort} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }} aria-label="Clear">
              <XIcon size={15} color={C.inact} />
            </button>
          )}
        </div>
        {open && matches.length > 0 && !pinned && (
          <div style={{ position: "absolute", top: 48, left: 0, right: 0, zIndex: 10, background: C.white, borderRadius: 12, border: `1px solid ${C.div}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            {matches.map((r, i) => (
              <button key={r.id} onClick={() => pickResort(r)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 12px", background: C.white, border: "none",
                borderTop: i > 0 ? `1px solid ${C.div}` : "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              }}>
                <img src={r.hero_image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.sub }}>
                    {r.atoll} <Star size={10} color="#F59E0B" fill="#F59E0B" /> {r.star_rating}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {pinned && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: C.p100, border: `1px solid ${C.p300}` }}>
          <Check size={16} color={C.p600} strokeWidth={2.5} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.p600 }}>{pinned.name} selected</span>
        </div>
      )}
    </div>
  );
}

// ════════════════════ Maldives Step 4: Meal preference ════════════════════
// Optional, multi-select. Explains each plan's drinks/alcohol coverage.
function StepMealPref({ mealPrefs, setMealPrefs }) {
  const toggle = (key) => setMealPrefs(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; });
  return (
    <div style={{ padding: "18px 16px 24px" }}>
      <h1 style={titleStyle}>Any meal preference?</h1>
      <p style={subStyle}>Optional. Pick any that appeal, we'll match the closest plan. You can change it on the resort.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {MEAL_PREF_KEYS.map(key => {
          const info = MEAL_INFO[key];
          const on = mealPrefs.has(key);
          return (
            <button key={key} onClick={() => toggle(key)} style={{
              display: "block", width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
              border: on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: on ? C.p600 : C.head }}>{info.label}</span>
                <span style={{ width: 22, height: 22, borderRadius: "50%", border: on ? "none" : `1.5px solid ${C.icon}`, background: on ? C.p600 : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {on && <Check size={14} color="#fff" strokeWidth={3} />}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
                {info.covers.map((c, i) => (
                  <span key={i} style={{ fontSize: 12, color: C.sub, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.icon }} /> {c}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════ Step 3: Route ════════════════════
// Select-only: get to know the regions (intro videos), then pick one of our
// curated routes for the chosen nights. No manual route editing here. Too few
// nights → nudge to add some; too many → hand off to the team.
// ─── The route step ───
//
// Two questions used to live here: which regions, and which of five pre-built
// routes. Screen recordings showed almost nobody touching the regions and
// almost everybody taking Route 1, because "Route 2" is a name, not a reason.
// It is one question now, in RoutePicker: where do you want to stay. The order
// is ours to work out, and anyone who wants it different opens the builder.
//
// The one case the picker cannot answer stays here: a trip long enough that we
// would rather a person designed it.
function StepRoute({ dest, nights, startDate, route, setRoute, setNights, editRoute, nudge }) {
  const meta = destMeta[dest] || {};
  const LONG = 14;
  const n = nights || routeNights(route) || meta.defaultNights || 7;
  const [leadSent, setLeadSent] = useState(false);

  if (n > LONG) {
    return (
      <div style={{ padding: "18px 16px 24px" }}>
        <h1 style={{ ...titleStyle, fontSize: 18, letterSpacing: "-0.3px" }}>
          {editRoute ? "Change your route" : "Choose your route"}
        </h1>
        {leadSent ? (
          <div style={{ padding: 16, borderRadius: 14, background: C.sBg || "#ECFDF3", border: `1px solid ${C.sBorder || "#C0E5D5"}` }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>Thanks, you&apos;re in good hands ✨</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: C.sub, lineHeight: 1.5 }}>Our trip designers will reach out within 24 hours to craft your {n}-night {dest} journey.</p>
          </div>
        ) : (
          <div style={{ padding: 16, borderRadius: 14, background: C.p100, border: `1px solid ${C.p300}` }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>A {n}-night trip deserves a personal touch</p>
            <p style={{ margin: "6px 0 14px", fontSize: 13, color: C.sub, lineHeight: 1.5 }}>Longer journeys are hand-crafted by our team. Share your trip and we&apos;ll design the perfect route for you.</p>
            <button onClick={() => setLeadSent(true)} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Request a custom plan
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <RoutePicker
      dest={dest}
      nights={n}
      startDate={startDate}
      route={route}
      setRoute={setRoute}
      setNights={setNights}
      nudge={nudge}
    />
  );
}


// Read-only map for the chosen route. The map frames just the selected cities;
// a bottom rail of recommended routes lets the user switch and the map re-frames
// live. No manual editing.
function RouteMapView({ dest, nights, route, setRoute, onClose }) {
  const n = nights || route.reduce((s, r) => s + r.n, 0);
  const variants = useMemo(() => routeVariants(dest, n), [dest, n]);
  const sigOf = (r) => r.map(s => `${s.city}${s.n}`).join("|");
  const selectedSig = sigOf(route);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 65, background: C.white, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.div}` }}>
        <button onClick={onClose} style={iconBtn} aria-label="Close map"><XIcon size={20} color={C.head} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.head }}>Your cities</p>
          <p style={{ margin: 0, fontSize: 12, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{route.map(s => `${s.city} ${s.n}N`).join(" · ")}</p>
        </div>
        <button onClick={onClose} style={{ ...pillBtn, color: C.p600, borderColor: C.p300 }}>Done</button>
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 0, isolation: "isolate", minHeight: 0 }}>
        <LeafletRouteMap dest={dest} route={route} height="100%" interactive={false} />
      </div>

      {/* Recommended routes: tap to switch, the map re-frames live */}
      {variants.length > 0 && (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, padding: "12px 0 calc(14px + env(safe-area-inset-bottom))", background: C.white }}>
          <p style={{ margin: "0 16px 10px", fontSize: 12, fontWeight: 800, color: C.head }}>City options</p>
          <div className="hs" style={{ gap: 10, paddingLeft: 16, paddingRight: 16 }}>
            {variants.map((r, idx) => {
              const on = sigOf(r) === selectedSig;
              return (
                <button key={sigOf(r)} onClick={() => setRoute(r)} style={{
                  flexShrink: 0, width: 230, textAlign: "left", padding: "10px 12px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                  border: `${on ? 2 : 1}px solid ${on ? C.p600 : C.div}`, background: on ? C.p100 : C.white,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head }}>Option {idx + 1}</span>
                    {on ? <Check size={15} color={C.p600} strokeWidth={2.5} /> : <span style={{ fontSize: 11.5, fontWeight: 700, color: C.p600 }}>Select</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.map(s => `${s.city} ${s.n}N`).join(" · ")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Real OpenStreetMap (Leaflet) helpers ───
// Keep the Leaflet view framed to whatever cities are plottable.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 9);
    else if (points.length > 1) map.fitBounds(points, { padding: [36, 36] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

// A numbered pink pin for selected cities, a small grey dot for the rest.
function cityPin(on, seq) {
  const html = on
    ? `<div style="width:26px;height:26px;border-radius:50%;background:${C.p600};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;font-family:inherit;">${seq + 1}</div>`
    : `<div style="width:14px;height:14px;border-radius:50%;background:#9ca3af;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3);"></div>`;
  const size = on ? 26 : 14;
  return L.divIcon({ className: "", html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

// Shared Leaflet route map. interactive=false renders a static thumbnail.
function LeafletRouteMap({ dest, route, onToggle, height, interactive = true }) {
  const areas = destAreas[dest] || [];
  const selected = route.map(r => r.city);
  const allPts = areas.map(a => cityCoords[a.city]).filter(Boolean).map(c => [c.lat, c.lng]);
  const linePts = route.map(r => cityCoords[r.city]).filter(Boolean).map(c => [c.lat, c.lng]);
  // Editor frames all options; the read-only view frames just the chosen route.
  const fitPts = interactive ? allPts : (linePts.length ? linePts : allPts);
  const center = fitPts[0] || [0, 0];
  return (
    <MapContainer
      center={center} zoom={8} style={{ height, width: "100%", background: "#aadaff" }}
      scrollWheelZoom={interactive} dragging={interactive} zoomControl={interactive}
      doubleClickZoom={interactive} touchZoom={interactive} boxZoom={interactive} keyboard={interactive}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds points={fitPts} />
      {linePts.length > 1 && <Polyline positions={linePts} pathOptions={{ color: C.p600, weight: 3, dashArray: "7 6" }} />}
      {(interactive ? areas : route).map((a) => {
        const co = cityCoords[a.city]; if (!co) return null;
        const seq = selected.indexOf(a.city); const on = seq >= 0;
        return (
          <Marker
            key={a.city} position={[co.lat, co.lng]} icon={cityPin(on, seq)}
            interactive={interactive}
            eventHandlers={interactive && onToggle ? { click: () => onToggle(a) } : undefined}
          >
            <Tooltip permanent direction="top" offset={[0, on ? -14 : -8]} className="route-tip">{a.city}</Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

// Full-screen, functional map editor: all the destination's cities plotted at
// their true positions on a real map. Tap a pin to add/remove; the selected ones
// show a numbered sequence and a connecting path. Sequence + nights are edited in
// the list below and reflected live on the map.
function RouteMapFull({ dest, route, setRoute, onClose }) {
  const [dragIdx, setDragIdx] = useState(null);
  const selectedSet = new Set(route.map(r => r.city));
  const totalNights = route.reduce((s, r) => s + r.n, 0);

  const setN = (i, n) => setRoute(r => r.map((s, j) => j === i ? { ...s, n: Math.max(1, n) } : s));
  const remove = (city) => setRoute(r => r.length > 1 ? r.filter(s => s.city !== city) : r);
  const toggle = (area) => {
    if (selectedSet.has(area.city)) remove(area.city);
    else setRoute(r => [...r, { city: area.city, n: area.n }]);
  };
  const reorder = (from, to) => setRoute(r => { const c = [...r]; const [m] = c.splice(from, 1); c.splice(to, 0, m); return c; });

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 65, background: C.white, display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.div}` }}>
        <button onClick={onClose} style={iconBtn} aria-label="Close map"><XIcon size={20} color={C.head} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.head }}>Plan on the map</p>
          <p style={{ margin: 0, fontSize: 12, color: C.sub }}>{route.length} {route.length > 1 ? "cities" : "city"} · {totalNights} night{totalNights > 1 ? "s" : ""}</p>
        </div>
        <button onClick={onClose} style={{ ...pillBtn, color: C.p600, borderColor: C.p300 }}>Done</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* real OpenStreetMap canvas */}
        <div style={{ borderBottom: `1px solid ${C.div}` }}>
          <LeafletRouteMap dest={dest} route={route} onToggle={toggle} height={300} />
          <p style={{ margin: 0, padding: "10px 16px 12px", fontSize: 11.5, color: C.sub, textAlign: "center" }}>Tap a pin to add or remove a city</p>
        </div>

        {/* selected sequence: reorder and nights */}
        <div style={{ padding: "16px 16px 28px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: C.head }}>Your sequence</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {route.map((stop, i) => (
              <div
                key={stop.city + i}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) { reorder(dragIdx, i); setDragIdx(i); } }}
                onDragEnd={() => setDragIdx(null)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 10px 8px", border: `1px solid ${C.div}`, borderRadius: 14, background: C.white, opacity: dragIdx === i ? 0.45 : 1 }}
              >
                <span style={{ cursor: "grab", color: C.icon, display: "grid", placeItems: "center" }} aria-label="Drag to reorder"><GripVertical size={16} /></span>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.p600, color: "#fff", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: C.head }}>{stop.city}</span>
                <NightsDropdown value={stop.n} onChange={(n) => setN(i, n)} />
                {route.length > 1 && (
                  <button onClick={() => remove(stop.city)} style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }} aria-label={`Remove ${stop.city}`}><XIcon size={15} color={C.icon} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact nights picker shared by the route list and the map editor.
function NightsDropdown({ value, onChange }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Nights"
        style={{
          appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
          padding: "8px 26px 8px 11px", border: `1px solid ${C.div}`, borderRadius: 10,
          background: C.white, color: C.head, fontSize: 13, fontWeight: 800,
          fontFamily: "inherit", cursor: "pointer", lineHeight: 1,
        }}
      >
        {Array.from({ length: 10 }, (_, k) => k + 1).map(v => (
          <option key={v} value={v}>{v} night{v > 1 ? "s" : ""}</option>
        ))}
      </select>
      <ChevronDown size={14} color={C.sub} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

// Full-screen city look opened from "View details".
function CityDetail({ dest, city, onClose }) {
  const area = (destAreas[dest] || []).find(a => a.city === city) || { city, crowd: "Mixed", blurb: "" };
  const pct = couplePct(city);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, background: "#000" }}>
      <img src={areaImg(dest, city, 0)} alt={city} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.4) 100%)" }} />
      <button onClick={onClose} style={{ position: "absolute", top: 14, left: 14, ...iconBtn, background: "rgba(0,0,0,0.4)" }} aria-label="Close"><XIcon size={20} color="#fff" /></button>
      <div style={{ position: "absolute", top: "44%", left: "50%", transform: "translate(-50%,-50%)", width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)", border: "1.5px solid rgba(255,255,255,0.65)", display: "grid", placeItems: "center" }}>
        <Play size={24} color="#fff" fill="#fff" />
      </div>
      <div style={{ position: "absolute", left: 18, right: 18, bottom: 22, color: "#fff" }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, fontFamily: "Georgia, 'Times New Roman', serif" }}>{city}</h1>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <GlassChip>{CROWD_LABEL[area.crowd] || "Popular"}</GlassChip>
          <TrustBadge pct={pct} dark />
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.92)" }}>{area.blurb}</p>
      </div>
    </div>
  );
}

// ════════════════════ Step 5: Activities ════════════════════
// One flat set of the best experiences across the whole trip (not per-city).
// Portrait reel cards, 2 per row; tap opens the full-screen reel. A corner tick
// toggles selection. "See more" reveals the rest; "Skip" auto-builds the best.
function StepActivities({ dest, route, vibes, picks, setPicks }) {
  const all = useMemo(() => flatActivities(dest, route, vibes), [dest, route, vibes]);
  const [showAll, setShowAll] = useState(false);
  const [reel, setReel] = useState(null);
  const toggle = (id) => setPicks(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const TOP = 8;
  const shown = showAll ? all : all.slice(0, TOP);

  return (
    <div style={{ padding: "18px 16px 24px" }}>
      {/* The name of the step, like every other step. "What sounds fun?" asked
          a question the screen then answered for you, and the line under it
          ran to three of them: a caveat about what is possible on the ground,
          at the moment somebody is being invited to choose. The caveat is true
          and worth one short clause, not a paragraph. */}
      <h1 style={titleStyle}>Select activities</h1>
      <p style={subStyle}>Pick any activity you like. We fit in what we can.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        {shown.map(a => (
          <ActivityCard key={a.id} a={a} on={picks.has(a.id)} onOpen={() => setReel(a)} onToggle={() => toggle(a.id)} />
        ))}
      </div>

      {!showAll && all.length > TOP && (
        <button onClick={() => setShowAll(true)} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", marginTop: 16,
          padding: "13px", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white,
          fontSize: 14, fontWeight: 700, color: C.head, cursor: "pointer", fontFamily: "inherit",
        }}>
          See more activities <ChevronDown size={15} color={C.sub} />
        </button>
      )}

      {reel && <ActivityReel a={reel} dest={dest} on={picks.has(reel.id)} onToggle={() => toggle(reel.id)} onClose={() => setReel(null)} />}
    </div>
  );
}

// Portrait reel card (mirrors the destination cards). Tap the card to watch the
// reel; tap the corner tick to add/remove.
function ActivityCard({ a, on, onOpen, onToggle }) {
  const { rating, reviews } = activityRating(a.id);
  return (
    <div onClick={onOpen} style={{
      position: "relative", aspectRatio: "3 / 4", borderRadius: 18, overflow: "hidden", cursor: "pointer",
      background: C.div, boxShadow: on ? `0 0 0 3px ${C.p600}` : "none",
    }}>
      <img src={a.img} alt={a.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.32)", backdropFilter: "blur(4px)", border: "1.5px solid rgba(255,255,255,0.7)", display: "grid", placeItems: "center" }}>
        <Play size={17} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} aria-label={on ? "Remove" : "Add"} style={{
        position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
        border: on ? "none" : "2px solid rgba(255,255,255,0.9)", background: on ? C.p600 : "rgba(0,0,0,0.3)",
        backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 0,
      }}>
        {on ? <Check size={16} color="#fff" strokeWidth={3} /> : <Plus size={16} color="#fff" strokeWidth={2.5} />}
      </button>
      <div style={{ position: "absolute", left: 11, right: 11, bottom: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
          <Star size={11} color="#FBBC05" fill="#FBBC05" />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{rating}</span>
          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.8)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>({reviews})</span>
        </div>
        <p style={{ margin: 0, color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{a.name}</p>
        <p style={{ margin: "2px 0 0", display: "flex", alignItems: "center", gap: 3, color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          <MapPin size={10} color="rgba(255,255,255,0.85)" /> {a.city}
        </p>
      </div>
    </div>
  );
}

// Full-screen activity reel. Mirrors the itinerary's VideoViewer design: top +
// bottom gradients, kicker, name, traveller-photo social proof, caption, then
// the "Add to my trip" CTA at the bottom.
function ActivityReel({ a, dest, on, onToggle, onClose }) {
  const { rating, reviews } = activityRating(a.id);
  const caption = `${a.name} in ${a.city} - a hand-picked highlight with private transfers, a local guide, and time to truly soak it in.`;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, background: "#000", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <img src={a.img} alt={a.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* top + bottom gradients (match VideoViewer) */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: "linear-gradient(180deg, rgba(0,0,0,0.8) 10%, rgba(0,0,0,0) 100%)", zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 300, background: "linear-gradient(transparent, rgba(0,0,0,0.9))", zIndex: 2 }} />

      {/* top: close */}
      <div style={{ position: "relative", zIndex: 5, padding: "16px 16px 0", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onClose} aria-label="Close" style={{
          width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <XIcon size={16} color="#fff" />
        </button>
      </div>

      {/* bottom: kicker, name, traveller photos, caption, CTA */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 16px 28px", zIndex: 5 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: 0.2, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
          {a.city} · {a.vibe}
        </span>
        <p style={{ margin: "4px 0 10px", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2, textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>{a.name}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <Star size={14} color="#FBBC05" fill="#FBBC05" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{rating}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>({reviews} reviews)</span>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#F9F9FB", lineHeight: 1.4, opacity: 0.92, textShadow: "0 1px 6px rgba(0,0,0,0.5)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {caption}
        </p>

        <button onClick={onToggle} aria-label={on ? "Remove from trip" : "Add to my trip"} style={{
          ...primaryBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: on ? "rgba(255,255,255,0.18)" : C.p600,
          border: on ? "1px solid rgba(255,255,255,0.6)" : "none",
          backdropFilter: on ? "blur(8px)" : "none",
        }}>
          {on ? <><Check size={18} color="#fff" strokeWidth={3} /> Added to your trip</> : <><Plus size={18} color="#fff" strokeWidth={2.5} /> Add to my trip</>}
        </button>
      </div>
    </div>
  );
}

// ════════════════════ Building ════════════════════
// The same wait the itinerary shows when a trip is built again: a countdown,
// the five areas it works through, and reels from
// the destination. The real build takes about a minute, which is what the
// countdown says; the prototype lands on the itinerary after a few seconds,
// so the screen is a preview of the wait rather than the whole of it.
function Building({ dest, cities = [] }) {
  return (
    <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: C.bg }}>
      <BuildingView dest={dest} cities={cities} checks={false} />
    </div>
  );
}

function ConfirmEdit({ target, onCancel, onConfirm }) {
  const what = target === "all" ? "your trip" : target === "dates" ? "your dates" : target === "travellers" ? "your travellers" : "your cities";
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end" }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: C.white, borderRadius: "20px 20px 0 0", padding: "22px 20px calc(22px + env(safe-area-inset-bottom))" }}>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.head }}>Save this as a new version?</h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: C.sub, lineHeight: 1.5 }}>
          Changing {what} creates a new version of this trip. Your current one stays saved in My Plans.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button onClick={onCancel} style={{ ...secondaryBtn, flex: 1 }}>Go back</button>
          <button onClick={onConfirm} style={{ ...primaryBtn, flex: 1 }}>Save new version</button>
        </div>
      </div>
    </div>
  );
}

// ─── shared styles ───
const titleStyle = { margin: 0, fontSize: 26, fontWeight: 800, color: C.head, letterSpacing: "-0.5px" };
// Supporting text, under a 26px title. It was 14px, which is body size: at
// that weight it argued with the heading instead of sitting under it. Every
// step's line is one short sentence now, so it can afford to be a caption.
const subStyle = { margin: "7px 0 0", fontSize: 13, color: C.sub, lineHeight: 1.4 };
const iconBtn = { width: 38, height: 38, borderRadius: 12, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const roundBtn = { width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const primaryBtn = { width: "100%", padding: "15px", borderRadius: 14, border: "none", background: C.p600, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const secondaryBtn = { padding: "15px", borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const pillBtn = { display: "inline-flex", alignItems: "center", padding: "8px 13px", borderRadius: 20, border: `1px solid ${C.div}`, background: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer" };
