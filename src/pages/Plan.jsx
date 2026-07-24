import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, X as XIcon, ChevronDown, Search, Heart, MapPin, Sparkles, Plus, Bell, Phone } from "lucide-react";
import { C, destinations, allItineraries } from "../data";
import TripPlanCard from "../components/TripPlanCard";
import DatePicker from "../components/DatePicker";
import LoginV2 from "./LoginV2";
import { useDeals } from "../data/deals";

const funLines = [
  "Meanwhile, your dream beach is warming up the sand for you...",
  "Fun fact: Couples who travel together stay together 💕",
  "Your sunset dinner table in Bali is almost ready...",
  "Pack your bags mentally while we verify this...",
];

// ─── Country codes (expanded + searchable) ───
const countryCodes = [
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳", digits: 10 },
  { code: "+1", country: "US", name: "United States", flag: "🇺🇸", digits: 10 },
  { code: "+44", country: "UK", name: "United Kingdom", flag: "🇬🇧", digits: 10 },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺", digits: 9 },
  { code: "+65", country: "SG", name: "Singapore", flag: "🇸🇬", digits: 8 },
  { code: "+971", country: "AE", name: "UAE", flag: "🇦🇪", digits: 9 },
  { code: "+60", country: "MY", name: "Malaysia", flag: "🇲🇾", digits: 10 },
  { code: "+66", country: "TH", name: "Thailand", flag: "🇹🇭", digits: 9 },
  { code: "+81", country: "JP", name: "Japan", flag: "🇯🇵", digits: 10 },
  { code: "+86", country: "CN", name: "China", flag: "🇨🇳", digits: 11 },
  { code: "+49", country: "DE", name: "Germany", flag: "🇩🇪", digits: 11 },
  { code: "+33", country: "FR", name: "France", flag: "🇫🇷", digits: 9 },
  { code: "+39", country: "IT", name: "Italy", flag: "🇮🇹", digits: 10 },
  { code: "+82", country: "KR", name: "South Korea", flag: "🇰🇷", digits: 10 },
  { code: "+62", country: "ID", name: "Indonesia", flag: "🇮🇩", digits: 11 },
  { code: "+63", country: "PH", name: "Philippines", flag: "🇵🇭", digits: 10 },
  { code: "+64", country: "NZ", name: "New Zealand", flag: "🇳🇿", digits: 9 },
  { code: "+94", country: "LK", name: "Sri Lanka", flag: "🇱🇰", digits: 9 },
  { code: "+977", country: "NP", name: "Nepal", flag: "🇳🇵", digits: 10 },
  { code: "+880", country: "BD", name: "Bangladesh", flag: "🇧🇩", digits: 10 },
  { code: "+27", country: "ZA", name: "South Africa", flag: "🇿🇦", digits: 9 },
  { code: "+7", country: "RU", name: "Russia", flag: "🇷🇺", digits: 10 },
  { code: "+55", country: "BR", name: "Brazil", flag: "🇧🇷", digits: 11 },
  { code: "+52", country: "MX", name: "Mexico", flag: "🇲🇽", digits: 10 },
  { code: "+234", country: "NG", name: "Nigeria", flag: "🇳🇬", digits: 10 },
  { code: "+254", country: "KE", name: "Kenya", flag: "🇰🇪", digits: 9 },
  { code: "+966", country: "SA", name: "Saudi Arabia", flag: "🇸🇦", digits: 9 },
  { code: "+974", country: "QA", name: "Qatar", flag: "🇶🇦", digits: 8 },
  { code: "+968", country: "OM", name: "Oman", flag: "🇴🇲", digits: 8 },
  { code: "+973", country: "BH", name: "Bahrain", flag: "🇧🇭", digits: 8 },
];

// ─── SVG Illustrations ───
const IlloPhone = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="40" fill="#FFE4E8"/>
    <rect x="27" y="18" width="26" height="44" rx="5" stroke="#E31B53" strokeWidth="2" fill="#fff"/>
    <rect x="35" y="56" width="10" height="2" rx="1" fill="#FEA3B4"/>
    <circle cx="52" cy="22" r="5" fill="#E31B53"/>
    <circle cx="52" cy="22" r="2" fill="#fff"/>
    <path d="M48 16l2-3M56 16l-2-3M52 14v-3" stroke="#FEA3B4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IlloOtp = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="40" fill="#FFE4E8"/>
    <rect x="22" y="28" width="36" height="26" rx="4" stroke="#E31B53" strokeWidth="2" fill="#fff"/>
    <path d="M22 32l18 12 18-12" stroke="#FEA3B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="34" cy="44" r="2" fill="#E31B53"/>
    <circle cx="40" cy="44" r="2" fill="#E31B53"/>
    <circle cx="46" cy="44" r="2" fill="#E31B53"/>
  </svg>
);

const destNames = ["Thailand", "Vietnam", "Bali", "Maldives", "Sri Lanka", "New Zealand"];
// Only couple trips to these destinations get an itinerary auto-generated.
// Anything else is routed to the sales team, who build it manually.
const AUTO_ITINERARY_DESTS = ["Thailand", "Vietnam", "Bali"];
// Returning users without a fresh lead inquiry still land on a populated plan list.
const DEFAULT_PLAN_DESTS = ["Bali", "Thailand", "Vietnam"];
const destFlags = { Thailand: "🇹🇭", Vietnam: "🇻🇳", Bali: "🇮🇩", Maldives: "🇲🇻", "Sri Lanka": "🇱🇰", "New Zealand": "🇳🇿" };
const adultOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function Plan({ userState, setUserState, leadData, setLeadData }) {
  const navigate = useNavigate();
  const { deals } = useDeals();
  const [params] = useSearchParams();
  const preselectedDest = params.get("dest") || "";
  const returnTo = params.get("return") || "";

  // Returning users (lead / customer / trip done) go straight to their plans.
  // Only a brand-new user is asked to log in first.
  const isReturning = userState !== "new";

  useEffect(() => {
    if (isReturning) {
      if (returnTo === "trips") {
        navigate("/trips", { replace: true });
      } else if (returnTo === "account") {
        navigate("/account", { replace: true });
      } else {
        // Already known to us, show the plans directly
        setPhase("success");
      }
    }
  }, []);

  // phase: "auth" | "details" | "curating" | "success"
  // ("auth" covers what used to be "phone" + "otp" - handled by LoginV2)
  const [phase, setPhase] = useState(isReturning ? "success" : "auth");
  const [countryIdx, setCountryIdx] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(28);
  const [canResend, setCanResend] = useState(false);

  // Details fields
  const [name, setName] = useState("");
  const [dests, setDests] = useState(preselectedDest ? [preselectedDest] : []);
  const [adults, setAdults] = useState(2);
  const [showAdultDropdown, setShowAdultDropdown] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [showChildrenApology, setShowChildrenApology] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [nights, setNights] = useState(null);
  const [showNightsDropdown, setShowNightsDropdown] = useState(false);

  // Welcome banner dismiss
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeFadingOut, setWelcomeFadingOut] = useState(false);
  // Bottom "older plans" accordion (closed/expired vacations), collapsed by default.
  const [showOlder, setShowOlder] = useState(false);
  const [savedToast, setSavedToast] = useState(null); // destination name after hearting a plan
  const savedTimer = useRef(null);
  const showSavedToast = (d) => {
    setSavedToast(d);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedToast(null), 3200);
  };


  const funLine = useMemo(() => funLines[Math.floor(Math.random() * funLines.length)], []);
  const otpRefs = useRef([]);
  const searchInputRef = useRef(null);
  const country = countryCodes[countryIdx];
  const phoneValid = phone.length === country.digits;

  // Get recommended itineraries for selected destinations
  const recommendedItineraries = useMemo(() => {
    let selectedDests = phase === "success" && leadData ? leadData.dests : dests;
    // Returning user without a fresh inquiry: fall back to a default curated set.
    if (phase === "success" && (!selectedDests || selectedDests.length === 0)) {
      selectedDests = DEFAULT_PLAN_DESTS;
    }
    if (!selectedDests || selectedDests.length === 0) return [];
    // Pick 1 recommended itinerary per destination
    const recs = [];
    selectedDests.forEach(d => {
      const match = allItineraries.find(it => it.dest === d);
      if (match) recs.push(match);
    });
    return recs;
  }, [phase, leadData, dests]);

  // Filter countries by search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countryCodes;
    const q = countrySearch.toLowerCase().trim();
    return countryCodes.filter(cc =>
      cc.name.toLowerCase().includes(q) ||
      cc.country.toLowerCase().includes(q) ||
      cc.code.includes(q)
    );
  }, [countrySearch]);

  // Auto-focus search when picker opens
  useEffect(() => {
    if (showCountryPicker && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!showCountryPicker) setCountrySearch("");
  }, [showCountryPicker]);

  // Resend timer
  useEffect(() => {
    if (phase !== "otp") return;
    setResendTimer(28);
    setCanResend(false);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-dismiss welcome banner after 20 seconds
  useEffect(() => {
    if (phase !== "success" || !showWelcome) return;
    const fadeTimer = setTimeout(() => setWelcomeFadingOut(true), 19000);
    const hideTimer = setTimeout(() => setShowWelcome(false), 20000);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, [phase, showWelcome]);

  const handleResend = () => {
    if (!canResend) return;
    setResendTimer(28);
    setCanResend(false);
    setOtp(["", "", "", ""]);
    setOtpError("");
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { setCanResend(true); clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleDest = (d) => setDests(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const handleChildrenYes = () => {
    setHasChildren(true);
    setShowChildrenApology(true);
  };

  // Determine CTA state per phase (auth phase has its own CTA inside LoginV2)
  let ctaLabel = "";
  let ctaEnabled = false;
  if (phase === "details") { ctaLabel = "Explore Itineraries"; ctaEnabled = name.trim().length > 0 && dests.length > 0; }

  // Called by LoginV2 when OTP verifies successfully
  const handleAuthComplete = ({ country: c, phone: p }) => {
    setPhone(p);
    setCountryIdx(countryCodes.findIndex((cc) => cc.code === c.code));
    setPhase("details");
  };

  // OTP validation that LoginV2 calls - keep the legacy "0000 = invalid" rule
  const validateOtp = (otpStr) => {
    if (otpStr === "0000") return "Invalid OTP. Please try again.";
    return null;
  };

  // Skip from LoginV2 → bounce home (or return target)
  const handleAuthSkip = () => {
    if (returnTo === "trips") navigate("/trips", { replace: true });
    else if (returnTo === "account") navigate("/account", { replace: true });
    else navigate("/", { replace: true });
  };

  const ctaAction = () => {
    if (phase === "details") {
      // Case 1: couple + auto-eligible destinations -> itinerary auto-generated.
      // Case 2: anything else -> sales team builds it; consultant calls the user.
      const isCouple = adults === 2 && !hasChildren;
      const autoEligible = dests.length > 0 && dests.every((d) => AUTO_ITINERARY_DESTS.includes(d));
      const salesRequest = !(isCouple && autoEligible);
      const data = {
        phone,
        countryCode: country.code,
        name: name.trim(),
        dests,
        adults,
        children: hasChildren ? 1 : 0,
        startDate,
        nights,
        salesRequest,
      };
      setLeadData(data);
      setUserState("lead");
      if (returnTo === "trips") {
        navigate("/trips", { replace: true });
      } else if (returnTo === "account") {
        navigate("/account", { replace: true });
      } else if (salesRequest) {
        // Case 2: loader, then land on the home screen. The callback nudge
        // there tells the user a travel consultant will call shortly.
        setPhase("curating");
        setTimeout(() => navigate("/"), 2400);
      } else {
        // Case 1: transient curating state for feedback, then success
        setPhase("curating");
        setTimeout(() => {
          setPhase("success");
          setShowWelcome(true);
        }, 2400);
      }
    }
  };

  const goBack = () => {
    if (phase === "details") setPhase("auth");
    else if (phase === "success") navigate("/");
    else navigate(-1);
  };

  const successName = leadData?.name || name.trim() || "traveller";
  const successDests = (leadData?.dests?.length ? leadData.dests : (dests.length ? dests : DEFAULT_PLAN_DESTS));

  // ─── RENDER ───
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 700, background: C.white, position: "relative" }}>

      {/* Saved-to-wishlist toast */}
      {savedToast && (
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 84, zIndex: 60, background: C.head, color: "#fff", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.22)", animation: "scaleIn 0.2s ease-out" }}>
          <span style={{ flex: 1, fontSize: 13, lineHeight: "18px" }}>{savedToast} saved to your wishlist.</span>
          <button onClick={() => { setSavedToast(null); navigate("/saved"); }} style={{ flexShrink: 0, background: "none", border: "none", color: "#fff", fontSize: 13, fontWeight: 800, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
            View wishlist
          </button>
        </div>
      )}

      {/* ═══ CURATING TRANSIENT STATE ═══ */}
      {phase === "curating" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: `linear-gradient(135deg, ${C.p100} 0%, #FFF5F0 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, position: "relative",
            animation: "scaleIn 0.4s ease-out",
          }}>
            <Sparkles size={40} color={C.p600} style={{ animation: "pulse 1.6s ease-in-out infinite" }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>
            Curating your getaway…
          </h2>
          <p style={{ fontSize: 14, color: C.sub, margin: 0, lineHeight: "20px", maxWidth: 300 }}>
            {leadData?.salesRequest
              ? "Hand-picking itineraries based on your preferences. A travel consultant will reach out shortly."
              : "Hand-picking itineraries based on your preferences. This takes just a moment."}
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 26 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: C.p600, opacity: 0.35,
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ SUCCESS SCREEN (post-signup, stays on Plan page) ═══ */}
      {/* ═══ SUCCESS, sales-handled request: card + call CTA only, no plans ═══ */}
      {phase === "success" && leadData?.salesRequest && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, padding: "12px 16px 90px" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 12px" }}>My Plans</h1>

          {/* Consultant-callback card (always visible while the request is open) */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "linear-gradient(135deg, #FFE4E8 0%, #FFF5F7 100%)", border: `1px solid ${C.p100}`, borderRadius: 16, padding: "16px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(227,27,83,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bell size={20} color={C.p600} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.p600, margin: 0 }}>We are working on your request</p>
              <p style={{ fontSize: 13, color: C.sub, margin: "3px 0 0", lineHeight: "18px" }}>
                A travel consultant will also call you shortly to personalise your getaway.
              </p>
            </div>
          </div>

          {/* Soft filler so the screen reads composed, not empty */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, background: `linear-gradient(135deg, ${C.p100} 0%, #FFF5F0 100%)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Sparkles size={36} color={C.p600} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.head, margin: "0 0 4px" }}>Your itinerary will appear here</p>
            <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "19px", maxWidth: 260 }}>
              Our travel consultant is crafting it with you. It shows up here as soon as it's ready.
            </p>
          </div>

          <button
            onClick={() => alert("Calling your travel consultant…")}
            style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(227,27,83,0.3)" }}
          >
            <Phone size={17} color="#fff" /> Call travel consultant
          </button>
        </div>
      )}

      {phase === "success" && !leadData?.salesRequest && (
        <>
          {/* Header */}
          {(() => {
          const versionsOf = (d) => d.properties?.length
            ? d.properties.flatMap(p => p.versions || [])
            : (d.versions || []);
          // Show every live vacation, including one that's only an open draft
          // (saved to finish later). Lost vacations sink to the accordion below.
          const active = deals.filter(d => d.status !== "lost" && versionsOf(d).length > 0);
          const older = deals.filter(d => d.status === "lost");
          // Open the right itinerary for a version (uses the real deal id even
          // for an expanded Maldives property card).
          const openVersion = (card, v) => {
            const itinId = v?.itineraryId ?? card.itineraryId;
            navigate(`/itinerary/${itinId}?dealId=${card.dealId ?? card.id}&versionId=${v.id}`);
          };
          const recency = (vs) => Math.max(...(vs.map(v => v.createdAt || 0)), 0);
          // Maldives → one unit per property; every other vacation → one unit.
          const toUnits = (list) => list.flatMap(deal => deal.properties?.length
            ? deal.properties.map(p => ({ ...deal, id: `${deal.id}__${p.property.replace(/\s+/g, "")}`, dealId: deal.id, property: p.property, itineraryId: p.itineraryId, versions: p.versions, properties: undefined }))
            : [{ ...deal, dealId: deal.id }]);
          // Each unit shows up to two cards: a "Draft" card for the in-progress
          // edit (no Compare, reopens where the user left off), and a "created"
          // card for the finalised versions (with Compare + earlier versions).
          // A trip edited on top of, say, V2 therefore shows both.
          const toCards = (units) => units.flatMap(u => {
            const quotes = u.versions.filter(v => v.status === "quote");
            const drafts = u.versions.filter(v => v.status !== "quote");
            const cards = [];
            drafts.forEach(dv => {
              const parent = quotes.find(q => q.id === dv.parentId);
              cards.push({ ...u, id: `${u.id}__draft_${dv.id}`, versions: [dv], cardKind: "draft", baseNum: parent?.num ?? null });
            });
            if (quotes.length) cards.push({ ...u, id: `${u.id}__made`, versions: quotes, cardKind: "made" });
            return cards;
          });
          // In-progress edits float up (their draft was just touched); the draft
          // card sits right above its created card so the pair reads together.
          const activeCards = toCards(
            [...toUnits(active)].sort((a, b) => recency(b.versions) - recency(a.versions))
          );
          return (
          <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: "12px 16px 8px" }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>My Plans</h1>
              <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 0" }}>
                {activeCards.length} {activeCards.length === 1 ? "plan" : "plans"}
              </p>
            </div>
          </div>

          {/* Content — active vacations first, then a collapsed "older plans" accordion */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 80px" }} className="hide-scrollbar">
            {activeCards.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeCards.map(card => (
                  <TripPlanCard key={card.id} deal={card} onOpen={(v) => openVersion(card, v)} onStartNew={() => navigate("/build")} onSaved={showSavedToast} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.head, margin: "0 0 4px" }}>No vacations yet</p>
                <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>Plan your first trip to see it here.</p>
              </div>
            )}

            {/* Older / closed plans — collapsed accordion at the bottom */}
            {older.length > 0 && (
              <div style={{ marginTop: 22, borderTop: `1px solid ${C.div}`, paddingTop: 14 }}>
                <button
                  onClick={() => setShowOlder(o => !o)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "4px 2px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.sub }}>
                    Older plans <span style={{ color: C.inact }}>({older.length})</span>
                  </span>
                  <ChevronDown size={16} color={C.sub} style={{ transition: "transform 0.2s", transform: showOlder ? "rotate(180deg)" : "none" }} />
                </button>
                {showOlder && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                    {[...older].sort((a, b) => recency(b.versions || []) - recency(a.versions || [])).map(deal => (
                      <TripPlanCard key={deal.id} deal={deal} onOpen={(v) => openVersion(deal, v)} onStartNew={() => navigate("/build")} onSaved={showSavedToast} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          </>
          ); })()}
        </>
      )}

      {/* ═══ Top bar (details only - auth has its own, success/curating don't need it) ═══ */}
      {phase === "details" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 0" }}>
          <button onClick={goBack} style={{ width: 34, height: 34, borderRadius: 12, background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={17} color={C.head} />
          </button>
          <span style={{ fontSize: 11, color: C.inact }}>Almost done</span>
          <button onClick={() => navigate(-1)} style={{ width: 34, height: 34, borderRadius: 12, background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <XIcon size={16} color={C.sub} />
          </button>
        </div>
      )}

      {/* ═══ AUTH (phone + OTP) - handled by LoginV2 ═══ */}
      {phase === "auth" && (
        <LoginV2
          onComplete={handleAuthComplete}
          onSkip={handleAuthSkip}
          validateOtp={validateOtp}
        />
      )}

      {/* ═══ TRIP DETAILS SCREEN ═══ */}
      {phase === "details" && (
        <>
          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 0" }} className="hide-scrollbar">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, marginBottom: 2, animation: "fadeUp 0.3s ease-out" }}>
              Tell us about your trip
            </h2>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 16, animation: "fadeUp 0.3s ease-out 0.05s both" }}>
              We'll curate the perfect getaway for you
            </p>

            {/* ── 1. Name ── */}
            <div style={{ marginBottom: 16, animation: "fadeUp 0.3s ease-out 0.08s both" }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: C.head, marginBottom: 6, display: "block" }}>
                Your name <span style={{ color: C.p600 }}>*</span>
              </label>
              <input
                type="text" placeholder="What should we call you?" autoFocus
                value={name} onChange={e => setName(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 14,
                  border: `1.5px solid ${name.trim() ? "#027A48" : C.div}`,
                  fontSize: 15, color: C.head, background: "#FAFAFA",
                  outline: "none", fontFamily: "inherit", transition: "border 0.2s",
                }}
              />
            </div>

            {/* ── 2. Travellers ── */}
            <div style={{ marginBottom: 16, position: "relative", zIndex: 20, animation: "fadeUp 0.3s ease-out 0.12s both" }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: C.head, marginBottom: 8, display: "block" }}>
                Travellers
              </label>

              {/* Adults dropdown */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.div}` }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>Adults</p>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowAdultDropdown(!showAdultDropdown)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "9px 14px", borderRadius: 10,
                      background: C.p100, border: `1.5px solid ${C.p300}`,
                      cursor: "pointer", fontFamily: "inherit",
                      minWidth: 64, justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 600, color: C.p900 }}>{adults}</span>
                    <ChevronDown size={14} color={C.p600} style={{ transition: "transform 0.2s", transform: showAdultDropdown ? "rotate(180deg)" : "none" }} />
                  </button>
                  {showAdultDropdown && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
                      background: C.white, borderRadius: 12, border: `1px solid ${C.div}`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
                      width: 80,
                    }}>
                      {adultOptions.map((n, idx) => (
                        <button
                          key={n}
                          onClick={() => { setAdults(n); setShowAdultDropdown(false); }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: "100%", padding: "12px 0",
                            background: n === adults ? C.p100 : "none",
                            border: "none", cursor: "pointer", fontFamily: "inherit",
                            borderBottom: idx < adultOptions.length - 1 ? `1px solid ${C.div}` : "none",
                            fontSize: 15, fontWeight: n === adults ? 700 : 500,
                            color: n === adults ? C.p600 : C.head,
                          }}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Adults apology, if not exactly 2 (couples only) */}
              {adults !== 2 && (
                <div style={{
                  marginTop: 12, padding: "14px", borderRadius: 14,
                  background: "linear-gradient(135deg, #FFF5F0 0%, #FFE4E8 100%)",
                  border: `1px solid ${C.p300}44`,
                  animation: "fadeUp 0.3s ease-out",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 12, background: C.p100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Heart size={16} color={C.p600} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.p900, margin: "0 0 4px" }}>
                        We're so sorry! 😔
                      </p>
                      <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "18px" }}>
                        30 Sundays is exclusively crafted for couples, intimate getaways,
                        private dinners, that kind of magic. We don't curate group trips yet.
                      </p>
                      <p style={{ fontSize: 13, color: C.p600, fontWeight: 600, margin: "8px 0 0" }}>
                        For now, try a couples-only escape? You deserve it. 💕
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Travelling with children toggle */}
              <div style={{ padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>Travelling with children?</p>
                    <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>Age 0–11</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { setHasChildren(false); setShowChildrenApology(false); }}
                      style={{
                        padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                        background: !hasChildren ? C.p100 : "#FAFAFA",
                        color: !hasChildren ? C.p600 : C.sub,
                        border: `1.5px solid ${!hasChildren ? C.p600 : C.div}`,
                      }}
                    >No</button>
                    <button
                      onClick={handleChildrenYes}
                      style={{
                        padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                        background: hasChildren ? C.p100 : "#FAFAFA",
                        color: hasChildren ? C.p600 : C.sub,
                        border: `1.5px solid ${hasChildren ? C.p600 : C.div}`,
                      }}
                    >Yes</button>
                  </div>
                </div>
                {showChildrenApology && (
                  <div style={{
                    marginTop: 14, padding: "16px", borderRadius: 14,
                    background: "linear-gradient(135deg, #FFF5F0 0%, #FFE4E8 100%)",
                    border: `1px solid ${C.p300}44`,
                    animation: "fadeUp 0.3s ease-out",
                  }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: C.p100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Heart size={18} color={C.p600} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.p900, margin: "0 0 4px" }}>
                          We're so sorry! 😔
                        </p>
                        <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "18px" }}>
                          Right now, 30 Sundays is exclusively crafted for couples, romantic getaways,
                          sunset dinners for two, that kind of magic. We don't have kids' itineraries yet,
                          but we're working on it!
                        </p>
                        <p style={{ fontSize: 13, color: C.p600, fontWeight: 600, margin: "8px 0 0" }}>
                          For now, maybe plan a couples-only escape? You deserve it. 💕
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 3. Destinations ── */}
            <div style={{ marginBottom: 16, animation: "fadeUp 0.3s ease-out 0.16s both" }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: C.head, marginBottom: 2, display: "block" }}>
                Where do you want to go? <span style={{ color: C.p600 }}>*</span>
              </label>
              <p style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>Pick one or more, we'll curate for each</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {destNames.map(d => {
                  const sel = dests.includes(d);
                  return (
                    <button key={d} onClick={() => toggleDest(d)} style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "10px 10px", borderRadius: 12, cursor: "pointer",
                      fontSize: 14, fontWeight: sel ? 600 : 500,
                      color: sel ? C.p600 : C.sub,
                      background: sel ? C.p100 : "#FAFAFA",
                      border: `1.5px solid ${sel ? C.p600 : C.div}`,
                      transition: "all 0.15s", fontFamily: "inherit",
                    }}>
                      <span>{destFlags[d]}</span>
                      {sel && <Check size={14} color={C.p600} strokeWidth={2.5} />}
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 4. Trip start date ── */}
            <div style={{ marginBottom: 16, position: "relative", zIndex: 15, animation: "fadeUp 0.3s ease-out 0.18s both" }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: C.head, marginBottom: 2, display: "block" }}>
                When's your trip? <span style={{ color: C.p600 }}>*</span>
              </label>
              <p style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>Trip start date</p>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>

            {/* ── 5. Nights ── */}
            <div style={{ marginBottom: 16, position: "relative", zIndex: 10, animation: "fadeUp 0.3s ease-out 0.2s both" }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: C.head, marginBottom: 2, display: "block" }}>
                How many nights? <span style={{ color: C.p600 }}>*</span>
              </label>
              <p style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>Duration of your getaway</p>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNightsDropdown(!showNightsDropdown)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", borderRadius: 12,
                    background: "#FAFAFA",
                    border: `1.5px solid ${nights ? "#027A48" : C.div}`,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: nights ? 600 : 500, color: nights ? C.head : C.sub }}>
                    {nights ? (nights === 0 ? "Flexible" : `${nights} Nights`) : "Select number of nights"}
                  </span>
                  <ChevronDown size={16} color={C.sub} style={{ transition: "transform 0.2s", transform: showNightsDropdown ? "rotate(180deg)" : "none" }} />
                </button>
                {showNightsDropdown && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
                    background: C.white, borderRadius: 12, border: `1px solid ${C.div}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
                    maxHeight: 280, overflowY: "auto",
                  }}>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0].map((n, idx, arr) => {
                      const sel = nights === n;
                      const label = n === 0 ? "Flexible" : `${n} Nights`;
                      return (
                        <button
                          key={n}
                          onClick={() => { setNights(n); setShowNightsDropdown(false); }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "flex-start",
                            width: "100%", padding: "12px 16px",
                            background: sel ? C.p100 : "none",
                            border: "none", cursor: "pointer", fontFamily: "inherit",
                            borderBottom: idx < arr.length - 1 ? `1px solid ${C.div}` : "none",
                            fontSize: 14, fontWeight: sel ? 700 : 500,
                            color: sel ? C.p600 : C.head,
                            textAlign: "left",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Spacer for fixed CTA */}
            <div style={{ height: 90 }} />
          </div>

          {/* ── Fixed CTA at bottom ── */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "12px 20px 40px",
            background: "linear-gradient(0deg, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)",
            zIndex: 5,
          }}>
            <button
              onClick={ctaAction}
              disabled={!ctaEnabled}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 14, border: "none",
                background: ctaEnabled ? C.p600 : C.inact,
                color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: ctaEnabled ? "pointer" : "not-allowed",
                boxShadow: ctaEnabled ? "0 4px 16px rgba(227,27,83,0.3)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "inherit", transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              {ctaLabel} <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
