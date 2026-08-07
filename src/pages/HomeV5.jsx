import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Star, ArrowRight, X as XIcon, Heart, IndianRupee, ShieldCheck, Wand2, Calendar } from "lucide-react";
import { C, destData, allItineraries, destinations, reviews, customerPhotos } from "../data";
import { useDeals } from "../data/deals";
import EduMultiCarousel from "../components/home_v2/EduMultiCarousel";
import TravellerReel from "../components/home_v2/TravellerReel";
import LeadCloseCTA from "../components/home_shared/LeadCloseCTA";
import HomeBanners, { BANNERS } from "../components/HomeBanners";
import { SIX, getSeasonGroups, fromPrice, COMPARE_REELS } from "../data/homeV3Data";
import { travellerReels } from "../data/homeV2Data";

const PAD = 18;
const HERO_IMGS = [destData.Maldives.hero, destData.Bali.hero, destData.Vietnam.hero];
const HERO_VIDEO = "https://thirtysundays-prod-content.fra1.digitaloceanspaces.com/welcome/Indonesia.mp4";

// Fullscreen video player. Tap the backdrop or the close button to dismiss.
function FullscreenVideo({ src, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <video src={src} autoPlay controls playsInline onClick={(e) => e.stopPropagation()} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
      <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <XIcon size={20} color="#fff" />
      </button>
    </div>
  );
}

// ─── Lower-fold pieces (clean, premium spacing) ───
function SectionTitle({ title, sub }) {
  return (
    <div style={{ padding: `0 ${PAD}px`, marginBottom: 14 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.4px" }}>{title}</h2>
      {sub && <p style={{ fontSize: 12.5, color: C.sub, margin: "4px 0 0", lineHeight: "17px" }}>{sub}</p>}
    </div>
  );
}

// Circular destination tabs (same set as the main home), shown above the hero.
function DestCircles() {
  return (
    <div className="hs" style={{ gap: 14, padding: `12px ${PAD}px 14px`, background: C.white }}>
      {destinations.map((d, i) => (
        <Link key={i} to={`/destination/${encodeURIComponent(d.name)}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, textDecoration: "none" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${C.div}`, padding: 2 }}>
            <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: C.sub, whiteSpace: "nowrap" }}>{d.name}</span>
        </Link>
      ))}
    </div>
  );
}

// Traveller moments reels (same as HomeV2's "From the road").
function TravellerMomentsReels() {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ padding: `0 ${PAD}px`, marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.4px", color: C.p600, textTransform: "uppercase", marginBottom: 4 }}>Couples who trusted us</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, letterSpacing: "-0.3px", margin: 0 }}>Traveller moments</h2>
        <p style={{ fontSize: 13, color: C.sub, margin: "3px 0 0" }}>Real couples. Real reels.</p>
      </div>
      <div className="hs" style={{ gap: 12, paddingLeft: PAD, paddingRight: PAD }}>
        {travellerReels.map((r, i) => <TravellerReel key={i} item={r} />)}
      </div>
    </div>
  );
}

// Compact review card (mirrors HomeV2's ReviewMini).
function ReviewMini({ r }) {
  return (
    <div style={{ background: C.white, borderRadius: 12, padding: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", borderLeft: `3px solid ${C.p300}`, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.p100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.p600 }}>{r.name[0]}</div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.head, margin: 0 }}>{r.name}</p>
            <p style={{ fontSize: 10, color: C.sub, margin: 0 }}>{r.dest}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />)}
        </div>
      </div>
      <p style={{ fontSize: 11, lineHeight: "16px", color: C.sub, margin: 0 }}>"{r.text}"</p>
    </div>
  );
}

// Real couples we've hosted, paired with their own trip photos.
const COUPLE_FACES = [
  { name: "Ayushi & Kaustubh", dest: "Bali", img: customerPhotos.Bali[0] },
  { name: "Dinesh & Harshitha", dest: "Maldives", img: customerPhotos.Maldives[0] },
  { name: "Raaghav & Ritika", dest: "Vietnam", img: customerPhotos.Vietnam[0] },
  { name: "Sharv & Pranjali", dest: "Thailand", img: customerPhotos.Thailand[0] },
  { name: "Utsav & Prachi", dest: "Bali", img: customerPhotos.Bali[10] },
  { name: "Anupriya & Sumit", dest: "Thailand", img: customerPhotos.Thailand[7] },
];

// Horizontal strip of real couples with their name + destination on the photo.
function CoupleFaces() {
  return (
    <div className="hs" style={{ gap: 10, margin: "0 -16px 16px", paddingLeft: 16, paddingRight: 16 }}>
      {COUPLE_FACES.map((c, i) => (
        <div key={i} style={{ flexShrink: 0, width: 124, position: "relative", aspectRatio: "3 / 4", borderRadius: 14, overflow: "hidden", background: C.div }}>
          <img src={c.img} alt={c.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.78))" }} />
          <div style={{ position: "absolute", left: 9, right: 9, bottom: 9 }}>
            <p style={{ margin: 0, color: "#fff", fontSize: 12, fontWeight: 800, lineHeight: 1.2, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{c.name}</p>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.9)", fontSize: 10.5, fontWeight: 600, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{c.dest}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Reviews block (same as HomeV2's "What couples say").
function LovedByCouples() {
  return (
    <div style={{ margin: "28px 16px 0" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.4px", color: C.p600, textTransform: "uppercase", marginBottom: 4 }}>What couples say</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, letterSpacing: "-0.3px", margin: 0 }}>Loved by 1,000+ couples</h2>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${C.p100} 0%, #fff 100%)`, border: `1px solid ${C.p100}`, borderRadius: 18, padding: "20px 18px", marginBottom: 16, boxShadow: "0 4px 18px rgba(137,18,62,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: C.head, lineHeight: 1, letterSpacing: "-1.5px" }}>4.6</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, marginTop: 2, letterSpacing: "0.2px" }}>out of 5</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />)}
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.head, margin: "0 0 8px", lineHeight: 1.3 }}>Based on <strong>1,000+</strong> verified reviews</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.white, border: `1px solid ${C.div}`, borderRadius: 999, padding: "4px 10px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.head, letterSpacing: "-0.1px" }}>Verified on Google</span>
            </div>
          </div>
        </div>
      </div>
      <CoupleFaces />
      {reviews.slice(0, 3).map((r, i) => <ReviewMini key={i} r={r} />)}
    </div>
  );
}

function SeasonCard({ d }) {
  return (
    <Link to={`/destination/${encodeURIComponent(d.name)}`} style={{ flexShrink: 0, width: 200, textDecoration: "none", borderRadius: 18, overflow: "hidden", background: C.white, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
      <div style={{ position: "relative", height: 150 }}>
        <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 45%)" }} />
        <span style={{ position: "absolute", top: 11, left: 11, display: "inline-flex", alignItems: "center", gap: 4, background: d.peakNow ? "#E6F4EC" : "rgba(255,255,255,0.95)", color: d.peakNow ? "#1B5E3A" : C.head, fontSize: 10.5, fontWeight: 700, padding: "4px 9px", borderRadius: 999 }}>
          {d.peakNow && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2E7D52" }} />}
          {d.badge}
        </span>
      </div>
      <div style={{ padding: "12px 13px 13px" }}>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: C.head, margin: 0 }}>{d.flag} {d.name}</p>
        <p style={{ fontSize: 11.5, color: C.sub, margin: "3px 0 7px", lineHeight: "15px" }}>{d.blurb}</p>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.head, margin: 0 }}>From {fromPrice(d.startPrice)} <span style={{ fontWeight: 500, color: C.inact }}>pp · 7 nights</span></p>
      </div>
    </Link>
  );
}

function LowerSections({ groups }) {
  return (
    <div style={{ paddingTop: 4, background: C.white, position: "relative" }}>
      {/* Compact proof line */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: `0 ${PAD}px`, marginBottom: 28 }}>
        {[
          { I: Heart, t: "Couples only" },
          { I: IndianRupee, t: "Transparent pricing" },
          { I: ShieldCheck, t: "No tourist traps" },
        ].map((x, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <x.I size={13} color={C.p600} strokeWidth={2.2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.head, letterSpacing: "0.1px", whiteSpace: "nowrap" }}>{x.t}</span>
          </span>
        ))}
      </div>

      {groups.map((g, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <SectionTitle title={g.label} sub={g.sub} />
          <div className="hs" style={{ gap: 13, paddingLeft: PAD, paddingRight: PAD }}>
            {g.dests.map(d => <SeasonCard key={d.name} d={d} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function AllSixCountries() {
  return (
    <div style={{ marginTop: 28, background: C.white }}>
      <SectionTitle title="All six countries" sub="Every country, honestly priced." />
      <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
        {SIX.map(d => (
          <Link key={d.name} to={`/destination/${encodeURIComponent(d.name)}`} style={{ textDecoration: "none", borderRadius: 16, overflow: "hidden", position: "relative", height: 128 }}>
            <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%)" }} />
            <div style={{ position: "absolute", left: 12, right: 12, bottom: 11 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{d.name}</p>
              <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.92)", margin: "1px 0 0", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>From {fromPrice(d.startPrice)} pp</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function HomeV5({ userState = "new" }) {
  const navigate = useNavigate();
  const { deals } = useDeals();
  const isLead = userState === "lead"; // customisation education is for leads only
  const groups = useMemo(() => getSeasonGroups(new Date()), []);
  const [hero, setHero] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setHero(h => (h + 1) % HERO_IMGS.length), 4500);
    return () => clearInterval(t);
  }, []);

  // Customisation education (leads only): a banner + a trip card that both open
  // the lead's in-progress itinerary and start the guided tour there. Falls back
  // to the Bali demo itinerary when there's no draft to resume.
  const draftDeal = deals.find(d => (d.versions || []).some(v => v.status === "draft"));
  const draftVer = draftDeal && [...draftDeal.versions].reverse().find(v => v.status === "draft");
  const draftIt = allItineraries.find(it => String(it.id) === String(draftVer?.itineraryId));
  const tripDest = draftVer?.destination || draftIt?.dest || "Bali";
  const tripNights = draftIt?.nights || draftVer?.customizations?.travelDates?.nights || 7;
  const tripImg = draftDeal?.img || destData.Bali?.hero;
  // Match the date shown on the itinerary header (custom draft = real dates).
  const tripDates = draftIt?.custom && draftIt.startDate
    ? (() => {
        const s = new Date(draftIt.startDate); const e = new Date(s); e.setDate(e.getDate() + (draftIt.nights || 0));
        const f = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        return `${f(s)} - ${f(e)}`;
      })()
    : "Mar 31 - Apr 6";
  const tourTarget = draftVer
    ? `/itinerary/${draftVer.itineraryId}?dealId=${draftDeal.id}&versionId=${draftVer.id}&tour=1`
    : `/itinerary/3?dealId=demo_draft_bali&versionId=demo_draft_bali_v1&tour=1`;
  const custBanner = {
    id: "customise",
    kicker: "You're in control",
    title: "Customise your trip, save time",
    sub: "Change days, hotels and dates yourself.",
    cta: "See how it works",
    Icon: Wand2,
    onClick: () => navigate(tourTarget),
    bg: "linear-gradient(115deg, #F3ECFF 0%, #E9DEFF 55%, #E2D3FF 100%)",
    border: "rgba(113,43,218,0.20)", accent: "#712BDA", tile: "#712BDA",
  };
  const banners = isLead ? [custBanner, ...BANNERS] : BANNERS;

  // "Torn between two?" comparison reels, shown in the Sunday School style.
  const seriesLessons = COMPARE_REELS.map((c) => ({
    poster: c.poster, videoUrl: c.videoUrl, duration: c.duration,
    tag: `${c.a} vs ${c.b}`, topics: c.topics,
  }));

  return (
    <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: C.white }}>
      {/* Circular destination tabs, above the hero */}
      <DestCircles />

      {/* Marketing banner carousel, between the circles and the hero.
          Leads also get a customisation banner that starts the guided tour. */}
      <div style={{ padding: "2px 0 14px" }}>
        <HomeBanners banners={banners} />
      </div>

      {/* ─── Cinematic full-bleed hero ─── */}
      <div style={{ position: "relative", height: "50vh", minHeight: 400, overflow: "hidden" }}>
        {HERO_IMGS.map((src, i) => (
          <img key={i} src={src} alt="" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            opacity: i === hero ? 1 : 0, transition: "opacity 1.4s ease, transform 6s ease",
            transform: i === hero ? "scale(1.08)" : "scale(1)",
          }} />
        ))}
        <div onClick={() => setShowVideo(true)} style={{ position: "absolute", inset: 0, cursor: "pointer", background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.15) 52%, rgba(0,0,0,0.82) 100%)" }} />

        {/* Bottom fade so the hero merges into the white content below */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 100%)", pointerEvents: "none" }} />

        {/* Bottom-anchored editorial block */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: `0 ${PAD}px 44px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Star size={13} fill="#FBBC05" color="#FBBC05" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", letterSpacing: "0.2px" }}><b style={{ color: "#fff" }}>4.6</b> · 10,000+ couples have trusted us</span>
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: "0 0 18px", letterSpacing: "-0.5px", lineHeight: "26px", whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,0,0.4)" }}>
            The one trip you'll both love.
          </h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link to="/build" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.p600, color: "#fff", borderRadius: 12, padding: "11px 22px", fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(253,1,79,0.35)" }}>
              <Sparkles size={16} color="#fff" /> Plan my trip
            </Link>
          </div>
        </div>
      </div>

      {/* Customisation trip card (leads only): shows the trip + starts the tour */}
      {isLead && (
        <div style={{ padding: `18px ${PAD}px 0` }}>
          <button
            onClick={() => navigate(tourTarget)}
            style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit", padding: 0, border: `1px solid ${C.p300}`, borderRadius: 16, overflow: "hidden", background: `linear-gradient(115deg, #F6F1FF 0%, #FBF9FF 60%, #fff 100%)` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
              <div style={{ position: "relative", width: 66, height: 66, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
                <img src={tripImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 4, left: 4, width: 24, height: 24, borderRadius: 8, background: "#712BDA", display: "grid", placeItems: "center", boxShadow: "0 2px 8px rgba(113,43,218,0.4)" }}>
                  <Wand2 size={13} color="#fff" />
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "1.2px", color: "#712BDA", textTransform: "uppercase" }}>You're in control</p>
                <p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 800, color: C.head, lineHeight: "20px", letterSpacing: "-0.2px" }}>Customise your {tripDest} trip</p>
                <p style={{ margin: "3px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
                  <Calendar size={12} color={C.sub} /> {tripDates} · {tripNights}N
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 14px", borderTop: "1px solid rgba(113,43,218,0.12)", background: "rgba(113,43,218,0.05)" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sub }}>Change days, hotels and dates yourself, save time.</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: "#712BDA", flexShrink: 0 }}>
                See how <ArrowRight size={14} />
              </span>
            </div>
          </button>
        </div>
      )}

      <div id="v5-rest"><LowerSections groups={groups} /></div>

      {/* Torn between two? in the Sunday School multi-video style */}
      <EduMultiCarousel valueTitle="Torn between [two]?" lessons={seriesLessons} />

      {/* All six countries, now below Torn between two */}
      <AllSixCountries />

      {/* Traveller moments + reviews + closing lead-gen */}
      <TravellerMomentsReels />
      <LovedByCouples />
      <LeadCloseCTA tone="clean" pad={PAD} />

      <div style={{ height: 80 }} />

      {showVideo && <FullscreenVideo src={HERO_VIDEO} onClose={() => setShowVideo(false)} />}
    </div>
  );
}
