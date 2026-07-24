import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Star, ArrowRight, X as XIcon, Heart, IndianRupee, ShieldCheck, Megaphone } from "lucide-react";
import { C, destData, allItineraries, destinations, reviews, customerPhotos } from "../data";
import { useDeals } from "../data/deals";
import EduMultiCarousel from "../components/home_v2/EduMultiCarousel";
import TravellerReel from "../components/home_v2/TravellerReel";
import LeadCloseCTA from "../components/home_shared/LeadCloseCTA";
import { SIX, getSeasonGroups, fromPrice, COMPARE_REELS } from "../data/homeV3Data";
import { travellerReels } from "../data/homeV2Data";

// ─── Banner lab: finalised design ───
// A multi-banner carousel between the destination circles and the hero. Swipe
// sideways; the dots inside the banner show there is more. "/" is untouched.

const PAD = 18;
const HERO_IMGS = [destData.Maldives.hero, destData.Bali.hero, destData.Vietnam.hero];
const HERO_VIDEO = "https://thirtysundays-prod-content.fra1.digitaloceanspaces.com/welcome/Indonesia.mp4";

// Banner content. Each banner is tappable and opens its web page.
// Slot size: full width minus 18pt side margins, 120pt tall, 18pt radius.
const BANNERS = [
  {
    id: "series-a",
    kicker: "Big news",
    title: "We've raised our Series A 🎉",
    sub: "Backed to craft many more honeymoons.",
    cta: "Read the story",
    Icon: Megaphone,
    url: "https://30sundays.club",
    bg: "linear-gradient(115deg, #FFF0F4 0%, #FFE4E8 55%, #FFD9E8 100%)",
    border: "rgba(253,1,79,0.18)", accent: "#FD014F", tile: "#FD014F",
  },
  {
    id: "maldives-offer",
    kicker: "Limited time",
    title: "Flat ₹10,000 off Maldives",
    sub: "On winter dates booked this month.",
    cta: "Grab the deal",
    Icon: Sparkles,
    url: "https://30sundays.club",
    bg: "linear-gradient(115deg, #EAF6FE 0%, #DCEEFD 55%, #CfE7FC 100%)",
    border: "rgba(21,112,239,0.18)", accent: "#1570EF", tile: "#1570EF",
  },
  {
    id: "referral",
    kicker: "Refer and win",
    title: "Gift a friend ₹5,000 off",
    sub: "You earn ₹5,000 when they book.",
    cta: "Invite now",
    Icon: Heart,
    url: "https://30sundays.club",
    bg: "linear-gradient(115deg, #FFF8E8 0%, #FEF0D8 55%, #FDE9C8 100%)",
    border: "rgba(245,184,28,0.28)", accent: "#B88500", tile: "#F5A623",
  },
];

// One banner card, sized to the shared slot (120pt tall).
function BannerCard({ b, flush = false }) {
  const Icon = b.Icon;
  return (
    <div
      onClick={() => window.open(b.url, "_blank")}
      style={{
        margin: flush ? 0 : `0 ${PAD}px`, height: 120, boxSizing: "border-box",
        borderRadius: 18, overflow: "hidden", cursor: "pointer",
        background: b.bg, border: `1px solid ${b.border}`,
        display: "flex", alignItems: "center", gap: 14, padding: "0 16px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.5)", top: -60, right: -40, pointerEvents: "none" }} />
      <div style={{ width: 52, height: 52, borderRadius: 16, background: b.tile, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 6px 18px ${b.border}` }}>
        <Icon size={24} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "1.2px", color: b.accent, textTransform: "uppercase" }}>{b.kicker}</p>
        <p style={{ margin: "3px 0 0", fontSize: 15.5, fontWeight: 800, color: C.head, lineHeight: "20px", letterSpacing: "-0.2px" }}>{b.title}</p>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: C.sub, lineHeight: "16px" }}>{b.sub}</p>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 7, fontSize: 12.5, fontWeight: 700, color: b.accent }}>
          {b.cta} <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}

// Multi-banner carousel: swipe sideways, one banner per page. The dots sit
// INSIDE the banner (bottom centre) so it's obvious there is more to swipe.
// The active dot stretches to a pill.
function BannerCarousel({ banners }) {
  const [active, setActive] = useState(0);
  const onScroll = (e) => {
    const el = e.currentTarget;
    setActive(Math.max(0, Math.min(banners.length - 1, Math.round(el.scrollLeft / el.clientWidth))));
  };
  return (
    <div style={{ position: "relative" }}>
      <div
        className="hide-scrollbar"
        onScroll={onScroll}
        style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {banners.map((b) => (
          <div key={b.id} style={{ width: "100%", flexShrink: 0, scrollSnapAlign: "center", padding: `0 ${PAD}px`, boxSizing: "border-box" }}>
            <BannerCard b={b} flush />
          </div>
        ))}
      </div>
      {/* Dots overlaid on the banner, bottom centre */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 5, pointerEvents: "none" }}>
        {banners.map((_, i) => (
          <span
            key={i}
            style={{
              height: 5, borderRadius: 999,
              width: i === active ? 16 : 5,
              background: i === active ? C.p600 : "rgba(24,29,39,0.22)",
              transition: "width .25s ease, background .25s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

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

// ─── Lower-fold pieces (same as the home clone) ───
function SectionTitle({ title, sub }) {
  return (
    <div style={{ padding: `0 ${PAD}px`, marginBottom: 14 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.4px" }}>{title}</h2>
      {sub && <p style={{ fontSize: 12.5, color: C.sub, margin: "4px 0 0", lineHeight: "17px" }}>{sub}</p>}
    </div>
  );
}

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

const COUPLE_FACES = [
  { name: "Ayushi & Kaustubh", dest: "Bali", img: customerPhotos.Bali[0] },
  { name: "Dinesh & Harshitha", dest: "Maldives", img: customerPhotos.Maldives[0] },
  { name: "Raaghav & Ritika", dest: "Vietnam", img: customerPhotos.Vietnam[0] },
  { name: "Sharv & Pranjali", dest: "Thailand", img: customerPhotos.Thailand[0] },
  { name: "Utsav & Prachi", dest: "Bali", img: customerPhotos.Bali[10] },
  { name: "Anupriya & Sumit", dest: "Thailand", img: customerPhotos.Thailand[7] },
];

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

export default function HomeBannerLab({ userState = "new" }) {
  const { deals } = useDeals();
  const isNew = userState === "new";
  const groups = useMemo(() => getSeasonGroups(new Date()), []);
  const [hero, setHero] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setHero(h => (h + 1) % HERO_IMGS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const draftDeal = deals.find(d => (d.versions || []).some(v => v.status === "draft"));
  const draftVer = draftDeal && [...draftDeal.versions].reverse().find(v => v.status === "draft");
  const draftNights = draftVer && (allItineraries.find(it => String(it.id) === String(draftVer.itineraryId))?.nights);

  const seriesLessons = COMPARE_REELS.map((c) => ({
    poster: c.poster, videoUrl: c.videoUrl, duration: c.duration,
    tag: `${c.a} vs ${c.b}`, topics: c.topics,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.white }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, background: C.white }}>
        <DestCircles />

        {/* Finalised slot: banner carousel between the circles and the hero */}
        <div style={{ padding: "2px 0 14px" }}>
          <BannerCarousel banners={BANNERS} />
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
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 100%)", pointerEvents: "none" }} />
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

        {/* Returning-user resume, slotted just under the hero */}
        {!isNew && draftVer && (
          <div style={{ padding: `18px ${PAD}px 0` }}>
            <Link to={`/itinerary/${draftVer.itineraryId}?dealId=${draftDeal.id}&versionId=${draftVer.id}`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: C.white, border: `1.5px solid ${C.p300}`, borderRadius: 14, padding: 12 }}>
              <img src={draftDeal.img} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: "cover" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>Resume {draftVer.destination}{draftNights ? ` · ${draftNights} nights` : ""}</p>
                <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{draftVer.title} · in progress</p>
              </div>
              <ArrowRight size={18} color={C.p600} />
            </Link>
          </div>
        )}

        <LowerSections groups={groups} />

        <EduMultiCarousel valueTitle="Torn between [two]?" lessons={seriesLessons} />

        <AllSixCountries />

        <TravellerMomentsReels />
        <LovedByCouples />
        <LeadCloseCTA tone="clean" pad={PAD} />

        <div style={{ height: 80 }} />
      </div>

      {showVideo && <FullscreenVideo src={HERO_VIDEO} onClose={() => setShowVideo(false)} />}
    </div>
  );
}
