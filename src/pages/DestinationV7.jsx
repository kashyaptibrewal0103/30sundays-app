import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Share2, ShieldCheck, ThumbsUp, ThumbsDown } from "lucide-react";
import { C, destData, reviews as ALL_REVIEWS, customerPhotos, couplePhotoNames } from "../data";
import { useSaves } from "../data/saves";
import SaveHeart from "../components/SaveHeart";
import BookedCard from "../components/booked_lab/BookedCard";
import EduMultiCarousel from "../components/home_v2/EduMultiCarousel";
import { ActivityScreen } from "./DayDetailLab";
import { ListSheet, ActCard } from "./RegionDetail";
import { BOOKED_TRIPS } from "../data/bookedTrips";
import { weatherData, monthSky } from "../data/weatherData";
import { activitiesFor } from "../data/discoverData";
import { buildActivityDetail } from "../data/activityData";
import {
  V7, V7_DESTS, AS_OF, seasonsFor, areasFor, galleryFor, tilesFor, faqFor, priceShort, isBanned, itineraryRows, tripsByArea, tripsForActs,
} from "../data/destV7Data";
import SectionNav from "../components/SectionNav";
import { DestWishlistBand } from "../components/wishlist/WishlistEntry";
import { Sun, Compass, MapPin, Plane, Route, Star as StarIcon } from "lucide-react";

// ─── The destination page, v7 ───
//
// The design signed off on the canvas, built for every destination. One
// scroll, in this order: photos, the title and intro, the vibes out of the
// plane windows, recently booked itineraries, places with their trips, best
// time, the wishlist, then things to do, getting there, Sunday School,
// compare, questions, and the reviews last. One fuchsia action: Plan my trip,
// in the bar at the foot.

const PAD = 16;
const INK = "#181E4C";
const TEXT = "#291D21";
const BODY = "#414651";
const SUB = "#5B6472";
const LINE = "#EFEBED";
const LAGOON = "#007E72";
const H2 = { margin: 0, fontSize: 19, lineHeight: "24px", fontWeight: 700, color: INK, letterSpacing: "-0.3px" };
const LABEL = { margin: 0, fontSize: 12.5, fontWeight: 600, color: SUB };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SEASON = {
  peak: { name: "Peak Season", color: "#8B1FA8", tint: "#F6E6FA", meaning: "Highest Demand, Peak Rates" },
  shoulder: { name: "Mid-season", color: "#6B3E0A", tint: "#F5EADB", meaning: "Fewer Crowds, Better Rates" },
  off: { name: "Off Season", color: "#6B6764", tint: "#F2F0EE", meaning: "Quietest Time, Base Rates" },
};
const SKY = {
  sunny: { bg: "#FFF5E0", fg: "#8A6100", word: "Sunny" },
  cloudy: { bg: "#DFF1F5", fg: "#0B6474", word: "Cloudy" },
  rainy: { bg: "#E4EBFD", fg: "#1E4FA8", word: "Light rain" },
  heavy: { bg: "#EAE7FA", fg: "#4B35A8", word: "Rainy" },
};
const SKY_ORDER = ["sunny", "cloudy", "rainy", "heavy"];

function SkyIcon({ sky, size = 13 }) {
  const c = SKY[sky]?.fg || SUB;
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (sky === "sunny") return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (sky === "cloudy") return <svg {...p}><path d="M12 2v2M4.9 4.9l1.4 1.4M2 12h2M20 12h2M17.7 6.3l1.4-1.4" /><path d="M15.9 11.3A5 5 0 0 0 7 10.5" /><path d="M13 22H7a4 4 0 0 1-.6-8A5.5 5.5 0 0 1 17 13a3.5 3.5 0 0 1-1 7h-3" /></svg>;
  if (sky === "rainy") return <svg {...p}><path d="M8 19v1M8 14v1M16 19v1M16 14v1M12 21v1M12 16v1" /><path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3" /></svg>;
  return <svg {...p}><path d="M16 13v8M8 13v8M12 15v8" /><path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3" /></svg>;
}

// A level plane, nose to the right.
function PlaneIcon({ size = 18, color = "#254342" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path transform="rotate(90 12 12)" fill={color} d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function GoogleMark({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Google">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Star({ size = 14, on = true }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill={on ? "#FBBC05" : "#E4E7EC"} d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>;
}

function Title({ children }) {
  return <div style={{ padding: `0 ${PAD}px` }}><h2 style={H2}>{children}</h2></div>;
}

// ─── Month helpers ───
function ratingOf(dest, m) {
  const s = seasonsFor(dest);
  if (s.peak.includes(MONTHS[m])) return "peak";
  if (s.shoulder.includes(MONTHS[m])) return "shoulder";
  return "off";
}

// Month indexes -> "May to Sep", "Apr and Oct", "Nov to Dec, Feb to Apr"
function rangeText(idx) {
  if (!idx.length) return "";
  if (idx.length === 12) return "All year";
  const set = new Set(idx);
  const runs = [];
  // start a run at a month whose previous month is not in the set (wraps)
  for (let m = 0; m < 12; m++) {
    if (!set.has(m) || set.has((m + 11) % 12)) continue;
    let end = m;
    while (set.has((end + 1) % 12) && (end + 1) % 12 !== m) end = (end + 1) % 12;
    runs.push([m, end]);
  }
  const one = ([a, b]) => (a === b ? MONTHS[a] : (b === (a + 1) % 12 ? `${MONTHS[a]} and ${MONTHS[b]}` : `${MONTHS[a]} to ${MONTHS[b]}`));
  if (runs.length === 2 && runs.every(([a, b]) => a === b)) return `${MONTHS[runs[0][0]]} and ${MONTHS[runs[1][0]]}`;
  return runs.map(one).join(", ");
}

function seasonRows(dest) {
  const w = weatherData[dest];
  return ["peak", "shoulder", "off"].map((key) => {
    const idx = [...Array(12).keys()].filter((m) => ratingOf(dest, m) === key);
    if (!idx.length) return null;
    const tally = {};
    idx.forEach((m) => { const k = monthSky(dest, m); tally[k] = (tally[k] || 0) + 1; });
    const shown = [Object.keys(tally).sort((a, b) => tally[b] - tally[a] || SKY_ORDER.indexOf(a) - SKY_ORDER.indexOf(b))[0]];
    const lo = Math.min(...idx.map((m) => w.low[m]));
    const hi = Math.max(...idx.map((m) => w.high[m]));
    return { key, months: rangeText(idx), skies: shown, temp: `${lo}° / ${hi}°` };
  }).filter(Boolean);
}

// ─── 1. Photos, dots, vibe tiles ───
function Hero({ imgs, onBack, onGallery }) {
  const track = useRef(null);
  const [idx, setIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const onScroll = () => {
    const el = track.current;
    if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth));
  };
  // Airbnb-style: at most five dots, the ones at the edge smaller.
  const n = imgs.length;
  const start = Math.max(0, Math.min(idx - 2, n - 5));
  const dots = [...Array(Math.min(5, n)).keys()].map((k) => start + k);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative", height: 440, background: "#1d2a24" }}>
        <div ref={track} onScroll={onScroll} className="hide-scrollbar" style={{ position: "absolute", inset: 0, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}>
          {imgs.map((src, i) => (
            <img key={src} src={src} alt="" onClick={() => onGallery(i)} loading={i < 2 ? "eager" : "lazy"} style={{ flex: "0 0 100%", width: "100%", height: "100%", objectFit: "cover", scrollSnapAlign: "start", cursor: "pointer" }} />
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 26%, rgba(255,255,255,0) 64%, rgba(255,255,255,0.45) 80%, rgba(255,255,255,0.88) 91%, #ffffff 97%, #ffffff 100%)" }} />
        <button onClick={onBack} aria-label="Back" style={pill(12)}><ArrowLeft size={20} color="#fff" /></button>
        <div style={{ position: "absolute", top: 14, right: 12, display: "flex", gap: 8 }}>
          <button aria-label="Share" style={{ ...pill(), position: "static" }}><Share2 size={18} color="#fff" /></button>
          <SaveHeart saved={saved} onToggle={() => setSaved((s) => !s)} size={40} style={{ background: "rgba(255,255,255,0.96)", borderRadius: "50%", boxShadow: "0 2px 8px rgba(16,24,40,0.22)" }} />
        </div>
        {/* The dots sit low, just above the title, on a small dark pill so they read over the fade. */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 58, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 999, background: "rgba(16,24,40,0.38)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
            {dots.map((i) => {
              const on = i === idx;
              const edge = (i === dots[0] && start > 0) || (i === dots[dots.length - 1] && dots[dots.length - 1] < n - 1);
              const s = on ? 6 : edge ? 4 : 5;
              return <span key={i} style={{ width: s, height: s, borderRadius: "50%", background: on ? "#fff" : "rgba(255,255,255,0.55)", transition: "all 0.2s" }} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
const pill = (left) => ({
  position: "absolute", top: 14, left, width: 40, height: 40, borderRadius: "50%", border: "none",
  background: "rgba(16,24,40,0.42)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer",
});

// ─── The photos, all at once ───
// A tap on any photo or vibe opens every photo of the place in a grid, the
// way the city page shows its own. The vibe photos carry their name, and the
// one that was tapped is scrolled to and outlined.
function Gallery({ dest, imgs, tiles, at, onClose }) {
  const refs = useRef([]);
  const label = Object.fromEntries(tiles.map((t) => [t.at, t.label]));
  useEffect(() => {
    const el = refs.current[at];
    if (el && at > 0) el.scrollIntoView({ block: "center" });
  }, [at]);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 260, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, padding: "12px 14px 10px", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onClose} aria-label="Back" style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
          <ArrowLeft size={17} color={INK} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: INK }}>{dest}</p>
          <p style={{ margin: "1px 0 0", fontSize: 12, color: SUB }}>{imgs.length} photos</p>
        </div>
      </div>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "12px 14px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoFlow: "dense", gap: 4 }}>
          {imgs.map((src, i) => {
            const big = i % 3 === 0;
            const leftSide = Math.floor(i / 3) % 2 === 0;
            return (
              <div key={src} ref={(el) => { refs.current[i] = el; }} style={{
                position: "relative", gridColumn: big ? (leftSide ? "1 / span 2" : "2 / span 2") : "auto", gridRow: big ? "span 2" : "auto",
                aspectRatio: "1 / 1", borderRadius: 8, overflow: "hidden", background: "#EEE",
                boxShadow: i === at ? `0 0 0 3px ${C.p600}` : "none",
              }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {label[i] && (
                  <>
                    <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)" }} />
                    <span style={{ position: "absolute", left: 8, bottom: 6, fontSize: 12.5, fontWeight: 600, color: "#fff" }}>{label[i]}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 2. Title, rating, intro ───
function TitleBlock({ dest, v, tiles, onGallery }) {
  const [more, setMore] = useState(false);
  return (
    <div style={{ padding: `0 ${PAD}px`, marginTop: -44, position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: dest.length > 9 ? 40 : 52, lineHeight: 1.1, fontWeight: 800, color: INK, letterSpacing: "-1px" }}>{dest}</h1>
        <span style={{ fontSize: 26 }} aria-hidden="true">{destData[dest]?.flag}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
        <GoogleMark />
        <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>{v.rating}</span>
        <Star />
        <span style={{ color: "#D5D7DA" }}>|</span>
        <span style={{ fontSize: 14, color: BODY }}>{v.reviews} reviews</span>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: "22px", color: BODY, ...(more ? {} : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }) }}>{v.intro}</p>
      <button onClick={() => setMore((m) => !m)} style={{ marginTop: 6, alignSelf: "flex-start", padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: TEXT, textDecoration: "underline", textUnderlineOffset: 3 }}>{more ? "Read less" : "Read more"}</button>
      <Vibes dest={dest} tiles={tiles} onGallery={onGallery} />
    </div>
  );
}

// ─── The vibes, from the window seat ───
// Each vibe is a view out of a plane window, on a band that goes from sky to
// the brand's cream, in a row that loops.
// A cabin window: a moulded frame lit from above, an inner ring, the view
// behind glass with a highlight, and a ridged blind with a pull handle.
//
// Every blind rests right at the top. Drag one and it follows the finger and
// stays where it is left, like a real one. Shut all the way, the window naps:
// a handwritten "z z z" drifts off the blind, and when it is lifted again
// there is a new view of the same vibe, when we have one; the label under it
// never changes, so it never says something the photo does not. A tap
// anywhere on the window, blind or view, opens the gallery.
const BLIND_TOP = 6;   // open: only the lip and handle left showing
const BLIND_SHUT = 100; // the whole view covered, the lip resting on the sill
const SHUT_AT = 88;
const GLASS_H = 114; // 140 window, less the 9px frame and 4px ring top and bottom
// The blind's place (hand) and the view belong to the vibe, not to this one
// copy of it in the loop, so going round the loop never changes them.
function PlaneWindow({ imgs, onOpen, nudge, view, hand, setHand }) {
  const w = 100, h = 140;
  const [dragging, setDragging] = useState(false);
  const [spring, setSpring] = useState(false);
  const drag = useRef(null);
  const pos = hand ?? BLIND_TOP;
  // The one-time hint: dip and spring back.
  useEffect(() => {
    if (!nudge) return;
    const t1 = setTimeout(() => setHand(48), 50);
    const t2 = setTimeout(() => { setSpring(true); setHand(null); }, 650);
    const t3 = setTimeout(() => setSpring(false), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [nudge]); // eslint-disable-line react-hooks/exhaustive-deps
  const down = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, from: pos, moved: false, swiped: false };
    setDragging(true);
  };
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(e.clientX - d.x) > 6) d.swiped = true; // sideways: the row scrolls, not the blind
    if (!d.swiped && Math.abs(dy) > 3) d.moved = true;
    if (!d.moved) return;
    setHand(Math.max(BLIND_TOP, Math.min(BLIND_SHUT, d.from + (dy / GLASS_H) * 100)));
  };
  const up = (e) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    e.stopPropagation();
    // A tap, not a drag, opens the gallery at this view, as a tap on the view does.
    if (!d.moved && !d.swiped) onOpen(img);
  };
  // The browser took the gesture over to scroll the row: not a tap.
  const cancel = () => { drag.current = null; setDragging(false); };
  const ease = dragging ? "none" : spring ? "height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)" : "height 0.42s cubic-bezier(0.22, 1, 0.36, 1)";
  const asleep = pos >= SHUT_AT && !dragging;
  const img = imgs[view] || imgs[0];
  return (
    <span style={{ display: "block", width: w, height: h, flexShrink: 0, boxSizing: "border-box", padding: 9, borderRadius: `${w * 0.42}px / ${h * 0.31}px`, background: "linear-gradient(180deg, #FFFDF9 0%, #DCD4C8 100%)", boxShadow: "0 12px 22px rgba(16,24,40,0.20), 0 2px 4px rgba(16,24,40,0.12), inset 0 2px 1px rgba(255,255,255,0.95), inset 0 -3px 5px rgba(0,0,0,0.12)" }}>
      <span style={{ display: "block", width: "100%", height: "100%", boxSizing: "border-box", padding: 4, borderRadius: `${w * 0.37}px / ${h * 0.27}px`, background: "linear-gradient(180deg, #C9C0B3 0%, #EDE6DC 100%)", boxShadow: "inset 0 3px 6px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.8)" }}>
        <span onClick={() => onOpen(img)} style={{ display: "block", position: "relative", width: "100%", height: "100%", borderRadius: `${w * 0.33}px / ${h * 0.24}px`, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)", cursor: "pointer" }}>
          {imgs.map((src, n) => (
            <img key={src} src={src} alt="" loading={n === 0 ? "lazy" : "eager"} draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none", opacity: n === view ? 1 : 0 }} />
          ))}
          <span style={{ position: "absolute", inset: 0, boxShadow: "inset 0 6px 12px rgba(0,0,0,0.35), inset 0 -4px 10px rgba(0,0,0,0.18)", pointerEvents: "none" }} />
          <span style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 26%, rgba(255,255,255,0) 40%)", pointerEvents: "none" }} />
          <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${pos}%`, transition: ease, background: "repeating-linear-gradient(180deg, rgba(0,0,0,0.03) 0 1px, rgba(0,0,0,0) 1px 5px), linear-gradient(180deg, #F4F0EB 0%, #E6DFD5 100%)", boxShadow: "0 3px 6px rgba(0,0,0,0.28)", pointerEvents: "none" }}>
            {asleep && (
              <span aria-hidden="true" style={{ position: "absolute", left: "50%", top: "36%", transform: "translateX(-50%)", width: 40, height: 40 }}>
                {[0, 1, 2].map((z) => (
                  <span key={z} style={{ position: "absolute", left: 4 + z * 11, top: 22 - z * 9, fontFamily: "Caveat, cursive", fontWeight: 700, fontSize: 15 + z * 3, color: "#8C8273", opacity: 0, animation: `v7zzz 2.1s ease-out ${z * 0.45}s infinite` }}>z</span>
                ))}
              </span>
            )}
            <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: "linear-gradient(180deg, #DAD2C7, #C8BFB2)" }} />
            <span style={{ position: "absolute", left: "50%", bottom: pos >= SHUT_AT ? 3 : -3, transition: "bottom 0.3s ease", transform: "translateX(-50%)", width: 24, height: 7, borderRadius: 4, background: "linear-gradient(180deg, #DAD2C7, #C8BFB2)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.35)" }} />
          </span>
          {/* Where the blind can be grabbed: the blind itself and a finger's width under its handle. */}
          <span role="slider" aria-label="Window blind" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onClick={(e) => e.stopPropagation()}
            style={{ position: "absolute", left: 0, right: 0, top: 0, height: `calc(${pos}% + 20px)`, transition: ease, touchAction: "pan-x", cursor: dragging ? "grabbing" : "grab" }} />
        </span>
      </span>
    </span>
  );
}
// Once per visitor, the second window's blind dips and springs back as the
// band comes into view, so the blinds read as something to play with.
function useNudgeOnce(ref) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem("v7-blind-nudge") === "1"; } catch { /* storage off */ }
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (seen || calm || !ref.current || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.intersectionRatio >= 0.6)) {
        setTimeout(() => setGo(true), 400);
        try { localStorage.setItem("v7-blind-nudge", "1"); } catch { /* storage off */ }
        io.disconnect();
      }
    }, { threshold: [0.6] });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref]);
  return go;
}
// The row loops, as the rows of cards further down do.
function Vibes({ dest, tiles, onGallery }) {
  const band = useRef(null);
  const row = useRef(null);
  const nudge = useNudgeOnce(band);
  const n = tiles.length;
  const loop = n > 3;
  const all = (loop ? [0, 1, 2] : [0]).flatMap((copy) => tiles.map((t, i) => ({ t, i, copy })));
  const [views, setViews] = useState({});
  const [hands, setHands] = useState({});
  const shut = useRef({});
  useLoop(row, n, loop, { center: false });
  // Where a vibe's blind is. Pulled all the way down after being open, the
  // next view goes in behind it, so it is already there as the blind lifts.
  const setHand = (i, at) => {
    if (at != null && at >= BLIND_SHUT - 1 && !shut.current[i]) {
      shut.current[i] = true;
      if (tiles[i].imgs.length > 1) setViews((v) => ({ ...v, [i]: (v[i] || 0) + 1 }));
    }
    if (at == null || at < SHUT_AT) shut.current[i] = false;
    setHands((h) => ({ ...h, [i]: at }));
  };
  return (
    <div ref={band} style={{ margin: `6px -${PAD}px 0`, background: "linear-gradient(180deg, #FFFFFF 0%, #EAF4F8 16%, #F3F5EF 52%, #FFF6E6 84%, #FFFFFF 100%)", padding: "22px 0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
      <style>{"@keyframes v7zzz { 0% { opacity: 0; transform: translate(0, 4px) scale(0.8); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(7px, -12px) scale(1.05); } }"}</style>
      <h2 style={{ margin: 0, padding: `0 ${PAD}px`, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 23, lineHeight: "28px", fontWeight: 400, color: INK }}>The Vibes of {dest === "Maldives" ? "the Maldives" : dest}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: `0 ${PAD}px` }}>
        <PlaneIcon size={16} />
        <span style={{ flex: 1, borderTop: "1.5px dashed #9FB7BD" }} />
      </div>
      <div ref={row} className="hide-scrollbar" style={{ position: "relative", display: "flex", gap: 16, padding: `8px ${PAD}px 12px`, overflowX: "auto" }}>
        {all.map(({ t, i, copy }, idx) => (
          <div key={`${copy}-${t.label}`} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <PlaneWindow imgs={t.imgs} nudge={nudge && idx === (loop ? n : 0) + 1}
              view={(views[i] || 0) % t.imgs.length} hand={hands[i] ?? null} setHand={(at) => setHand(i, at)}
              onOpen={(img) => onGallery(t.ats[Math.max(0, t.imgs.indexOf(img))])} />
            <button onClick={() => onGallery(t.at)} style={{ padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{t.label}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const SEASON_LINE = { peak: "#EBCDF3", shoulder: "#E9D6BC", off: "#E2DEDA" };
function BestTime({ dest }) {
  const rows = seasonRows(dest);
  const [open, setOpen] = useState(rows[0]?.key);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Title>Best time to visit</Title>
      <div style={{ margin: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((r) => {
          const s = SEASON[r.key];
          const on = open === r.key;
          return (
            <div key={r.key} style={{ border: `1px solid ${SEASON_LINE[r.key]}`, borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOpen(on ? null : r.key)} aria-expanded={on} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 14, border: "none", background: s.tint, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: TEXT }}>{s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{r.months}</span>
                {on ? <ChevronUp size={18} color={TEXT} /> : <ChevronDown size={18} color={TEXT} />}
              </button>
              {on && (
                <div style={{ padding: "12px 14px 14px 32px", background: "#fff", display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 13, color: SUB }}>{s.meaning}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                    {r.skies.map((k) => (
                      <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, background: SKY[k].bg, fontSize: 11.5, fontWeight: 600, color: SKY[k].fg }}>
                        <SkyIcon sky={k} />{SKY[k].word}
                      </span>
                    ))}
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: TEXT, marginLeft: 2 }}>{r.temp}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. Things to do ───
// ─── The card in view leads ───
// Under Things to do and Places to visit, the trips below a row are the
// trips of the card at the start of that row. A spotlight, two hairlines from
// the card's corners out to the edges of the screen with a breath of lagoon
// between them, joins the card to its trips and follows it as the row is
// swiped; between two cards the light dims. Swipe on and the next card's
// trips fade in. When a card has no trips, the section is not shown.
const SPOT_H = 36;
function useLead(rail, count, center = false) {
  const [lead, setLead] = useState({ k: 0, spot: null });
  useLayoutEffect(() => {
    const el = rail.current;
    if (!el) return undefined;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      let best = null;
      [...el.children].forEach((c, k) => {
        const r = c.getBoundingClientRect();
        const d = center ? Math.abs((r.left + r.right) / 2 - (box.left + box.right) / 2) : Math.abs(r.left - box.left - PAD);
        if (!best || d < best.d) best = { d, k, l: r.left - box.left, r: r.right - box.left, w: r.width };
      });
      if (!best) return;
      setLead({ k: best.k, spot: { l: best.l + 12, r: best.r - 12, w: box.width, o: 1 - Math.min(1, best.d / (best.w / 2)) * 0.7 } });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [rail, count, center]);
  return lead;
}
// Bring a card to the start, or the middle, of its row.
const bringCard = (rail, k, center = false) => {
  const el = rail.current;
  const card = el?.children[k];
  if (card) el.scrollTo({ left: card.offsetLeft - (center ? (el.clientWidth - card.offsetWidth) / 2 : PAD), behavior: "smooth" });
};
// A row that goes round and round: three copies of the cards, starting on
// the middle one, and whenever a swipe comes to rest in the first or the last
// copy it is moved, unseen, to the same card in the middle one.
function useLoop(rail, n, on, { center = true, onJump } = {}) {
  const jump = useRef(onJump);
  jump.current = onJump;
  useLayoutEffect(() => {
    const el = rail.current;
    if (!on || !el?.children[n]) return;
    const card = el.children[n];
    el.scrollLeft = card.offsetLeft - (center ? (el.clientWidth - card.offsetWidth) / 2 : PAD);
  }, [rail, n, on, center]);
  useEffect(() => {
    const el = rail.current;
    if (!on || !el) return undefined;
    let t = 0;
    const settle = () => {
      const kids = el.children;
      const span = kids[n].offsetLeft - kids[0].offsetLeft;
      const mid = el.scrollLeft + el.clientWidth / 2;
      const by = mid < kids[n].offsetLeft ? span : mid > kids[2 * n].offsetLeft ? -span : 0;
      if (!by) return;
      jump.current?.();
      el.scrollLeft += by;
    };
    const onScroll = () => { clearTimeout(t); t = setTimeout(settle, 140); };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [rail, n, on]);
}
function LedTrips({ spot, word, cards, lift = 14 }) {
  if (!spot || !cards.length) return null;
  return (
    <>
      <svg width="100%" height={SPOT_H} viewBox={`0 0 ${spot.w} ${SPOT_H}`} preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", marginTop: -lift, opacity: spot.o, transition: "opacity 0.2s ease-out" }}>
        <defs>
          <linearGradient id="v7spot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={LAGOON} stopOpacity="0.13" />
            <stop offset="1" stopColor={LAGOON} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={`M${spot.l} 0 L${spot.r} 0 L${spot.w} ${SPOT_H} L0 ${SPOT_H} Z`} fill="url(#v7spot)" />
        <path d={`M${spot.l} 0 L0 ${SPOT_H} M${spot.r} 0 L${spot.w} ${SPOT_H}`} stroke={LAGOON} strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ background: "linear-gradient(180deg, rgba(0,126,114,0.05) 0%, rgba(0,126,114,0) 100%)", padding: "12px 0 4px" }}>
        <TripRail title="Trips with" word={word} cards={cards} />
      </div>
    </>
  );
}

function ThingsToDo({ dest, gallery, onOpen }) {
  const [all, setAll] = useState(false);
  const { forDest, toggleActivity } = useSaves();
  const [local, setLocal] = useState({});
  const saved = forDest(dest).activities;
  const d = destData[dest] || {};
  let acts = activitiesFor(dest, 60).filter((a) => !isBanned(a.img) && !/swing|handara/i.test(a.name));
  if (!acts.length) {
    acts = (d.activities || []).map((name, i) => ({ id: null, name, city: dest, img: (d.actImgs || [])[i] || gallery[i % gallery.length] }));
  }
  // One photo per activity, never the same one twice, and how long it takes
  // from the same builder the activity screen reads, so the list and the
  // screen it opens agree.
  const used = new Set();
  acts = acts.map((a, i) => {
    let img = a.img;
    if (!img || used.has(img)) img = gallery.find((g) => !used.has(g)) || gallery[i % gallery.length];
    used.add(img);
    const hours = buildActivityDetail({ name: a.name }, { city: a.city, country: dest }).typicalDuration;
    return { ...a, img, hours };
  });
  // The ones that have trips come first, so the trips under the row are
  // there for as many cards as we can.
  const tripsOf = tripsForActs(dest, gallery, acts);
  const order = acts.map((a, i) => i).sort((x, y) => (tripsOf[y].length > 0) - (tripsOf[x].length > 0));
  const shown = order.slice(0, 5).map((i) => acts[i]);
  const shownTrips = order.slice(0, 5).map((i) => tripsOf[i]);
  // The card in the middle leads, and the row loops.
  const n = shown.length;
  const loop = n > 2;
  const cards = (loop ? [0, 1, 2] : [0]).flatMap((copy) => shown.map((a, i) => ({ a, i, copy })));
  const rail = useRef(null);
  useLoop(rail, n, loop);
  const { k: at, spot } = useLead(rail, cards.length, true);
  const k = at % n;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ padding: `0 ${PAD}px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={H2}>Things to do</h2>
        {acts.length > shown.length && (
          <button onClick={() => setAll(true)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3, padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: INK }}>
            See all {acts.length} <ArrowRight size={14} />
          </button>
        )}
      </div>
      <div ref={rail} className="hs" style={{ position: "relative", gap: 12, paddingLeft: PAD, paddingRight: PAD, paddingBottom: 14, scrollSnapType: "x mandatory" }}>
        {cards.map(({ a, i, copy }, idx) => {
          const on = a.id ? saved.includes(a.id) : !!local[a.name];
          return (
            <div key={`${copy}-${a.name}-${i}`} onClick={() => (idx === at ? onOpen(a) : bringCard(rail, idx, true))} role="button" tabIndex={0} style={{ flex: "0 0 160px", height: 284, borderRadius: 16, overflow: "hidden", position: "relative", background: "#2a2224", scrollSnapAlign: "center", cursor: "pointer" }}>
              <img src={a.img} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)" }} />
              <SaveHeart saved={on} onToggle={() => (a.id ? toggleActivity(dest, a.id) : setLocal((s) => ({ ...s, [a.name]: !s[a.name] })))} size={30}
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.96)", borderRadius: "50%", boxShadow: "0 2px 8px rgba(16,24,40,0.22)" }} />
              <div style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
                <p style={{ margin: 0, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: "italic", fontSize: 19, lineHeight: "22px", color: "#fff" }}>{a.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{a.city}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: -12 }}><LedTrips spot={spot} word={shown[k]?.name} cards={shownTrips[k] || []} /></div>
      {/* The same list the city page opens: every activity, one under the
          other, each one opening its own screen. */}
      <ListSheet open={all} title={`Things to do in ${dest}`} count={acts.length} onClose={() => setAll(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {acts.map((a, i) => (
            <ActCard key={a.name + i} a={a} city={a.city} dest={dest} width="100%" imgH={200}
              saved={a.id ? saved.includes(a.id) : !!local[a.name]}
              onSave={() => (a.id ? toggleActivity(dest, a.id) : setLocal((s) => ({ ...s, [a.name]: !s[a.name] })))}
              onOpen={() => { setAll(false); onOpen(a); }} />
          ))}
        </div>
      </ListSheet>
    </div>
  );
}

// ─── 6. Places to visit ───
function FitAll({ points }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
      if (points.length === 1) map.setView(points[0], 9);
      else if (points.length > 1) map.fitBounds(points, { padding: [36, 36], animate: false });
    }, 60);
    return () => clearTimeout(id);
  }, [map, points]);
  return null;
}
const dotIcon = (on, label) => L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;gap:5px;white-space:nowrap"><span style="width:${on ? 16 : 12}px;height:${on ? 16 : 12}px;border-radius:50%;background:${on ? C.p600 : INK};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>${on ? `<span style="font:700 12px Figtree,system-ui,sans-serif;color:${INK};background:#fff;padding:2px 7px;border-radius:999px;box-shadow:0 1px 4px rgba(0,0,0,.2)">${label}</span>` : ""}</div>`,
  iconSize: [12, 12], iconAnchor: [6, 6],
});

// The place in view leads (see useLead): its pin is lit on the map and the
// trips under the row are the trips that stay there.
function Places({ dest, gallery }) {
  const navigate = useNavigate();
  const { forDest, toggleRegion } = useSaves();
  const saved = forDest(dest).regions;
  const areas = useMemo(() => areasFor(dest).filter((a) => a.lat != null), [dest]);
  const trips = useMemo(() => tripsByArea(dest, gallery), [dest, gallery]);
  const rail = useRef(null);
  // The card in the middle leads, and the row loops.
  const n = areas.length;
  const loop = n > 2;
  const cards = (loop ? [0, 1, 2] : [0]).flatMap((copy) => areas.map((a, i) => ({ a, i, copy })));
  useLoop(rail, n, loop);
  const { k: at, spot } = useLead(rail, cards.length, true);
  const sel = areas[at % Math.max(1, n)]?.city;
  const bring = (city) => bringCard(rail, (loop ? n : 0) + areas.findIndex((a) => a.city === city), true);
  const list = trips[sel] || [];
  const points = useMemo(() => {
    const all = areas.map((a) => [a.lat, a.lng]);
    const mid = (k) => [...all].map((p) => p[k]).sort((x, y) => x - y)[Math.floor(all.length / 2)];
    const near = all.filter((p) => Math.abs(p[0] - mid(0)) < 2.5 && Math.abs(p[1] - mid(1)) < 2.5);
    return near.length > 1 ? near : all;
  }, [areas]);
  const counts = useMemo(() => {
    const all = activitiesFor(dest, 999);
    return Object.fromEntries(areas.map((a) => [a.city, all.filter((x) => x.city === a.city).length]));
  }, [dest, areas]);
  const hasRegionPages = dest !== "Mauritius";
  if (!areas.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", isolation: "isolate" }}>
      <div style={{ padding: `0 ${PAD}px 12px` }}><h2 style={H2}>Places to visit</h2></div>
      <div style={{ position: "relative", height: 240 }}>
        <MapContainer center={points[0]} zoom={8} zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false} style={{ position: "absolute", inset: 0, background: "#EAF2F4" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitAll points={points} />
          {areas.map((a) => (
            <Marker key={a.city} position={[a.lat, a.lng]} icon={dotIcon(a.city === sel, a.city)} eventHandlers={{ click: () => bring(a.city) }} />
          ))}
        </MapContainer>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 100%)", zIndex: 400, pointerEvents: "none" }} />
      </div>
      {/* Side room enough that the first and last cards can sit in the middle too. */}
      <div ref={rail} className="hs" style={{ gap: 12, paddingLeft: "calc((100% - 246px) / 2)", paddingRight: "calc((100% - 246px) / 2)", marginTop: -40, position: "relative", zIndex: 500, paddingTop: 4, paddingBottom: 14 }}>
        {cards.map(({ a, i, copy }, idx) => {
          const on = idx === at;
          const chips = (a.tag || "").split(/,\s*|\s+and\s+/).filter(Boolean).slice(0, 3);
          const img = gallery[(i + 2) % gallery.length];
          return (
            <div key={`${copy}-${a.city}`} onClick={() => bringCard(rail, idx, true)} style={{ scrollSnapAlign: "center", flex: "0 0 246px", height: 162, boxSizing: "border-box", background: "#fff", borderRadius: 18, padding: 14, border: on ? `2px solid ${C.p600}` : `1px solid ${LINE}`, boxShadow: "0 4px 14px rgba(16,24,40,0.08)", display: "flex", flexDirection: "column", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={img} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", boxSizing: "border-box", border: `2px solid ${C.p600}`, padding: 2, background: "#fff", flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 19, lineHeight: "24px", fontWeight: 700, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.city}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: INK, fontWeight: 500 }}>{a.n ? `${a.n}-${a.n + 1} nights` : "Day trip"}</p>
                </div>
                <SaveHeart saved={saved.includes(a.city)} onToggle={() => toggleRegion(dest, a.city)} size={32} />
              </div>
              <div style={{ display: "flex", flexWrap: "nowrap", overflow: "hidden", gap: 6, marginTop: 10 }}>
                {chips.map((c) => (
                  <span key={c} style={{ flexShrink: 0, whiteSpace: "nowrap", background: "#F4F2F0", color: INK, fontSize: 12, fontWeight: 500, lineHeight: "18px", padding: "4px 8px", borderRadius: 6 }}>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              {hasRegionPages && (
                <button onClick={(e) => { e.stopPropagation(); navigate(`/destination/${encodeURIComponent(dest)}/region/${encodeURIComponent(a.city)}`); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 36, padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", color: TEXT, fontSize: 14, fontWeight: 600 }}>
                  {counts[a.city] ? `${counts[a.city]} activities to do` : `See ${a.city}`} <ArrowRight size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <LedTrips spot={spot} word={sel} cards={list} />
    </div>
  );
}

// ─── 7. Getting there ───
function GettingThere({ dest, v }) {
  const [city, setCity] = useState(v.flights[0].city);
  const f = v.flights.find((x) => x.city === city) || v.flights[0];
  const chip = (on) => ({ flexShrink: 0, padding: "7px 13px", borderRadius: 999, border: on ? `1.5px solid ${TEXT}` : `1px solid ${LINE}`, background: "#fff", fontSize: 13, fontWeight: on ? 700 : 500, color: TEXT, whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Title>Getting there</Title>
      <div className="hs" style={{ gap: 8, paddingLeft: PAD, paddingRight: PAD }}>
        {v.flights.map((x) => <button key={x.city} onClick={() => setCity(x.city)} style={chip(x.city === city)}>{x.city}</button>)}
      </div>
      <div style={{ margin: `0 ${PAD}px`, padding: 16, border: `1px solid ${LINE}`, borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div><p style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.4px", color: TEXT }}>{f.code}</p><p style={{ margin: 0, fontSize: 12, color: SUB }}>{f.city}</p></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{f.time.replace(/^About/, "about")}</span>
            <span style={{ position: "relative", width: "100%", height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ position: "absolute", left: 0, right: 0, top: 9, borderTop: "1.5px dashed #C9C3C6" }} />
              <span style={{ position: "relative", background: "#fff", padding: "0 4px", display: "flex" }}><PlaneIcon /></span>
            </span>
            <span style={{ fontSize: 11.5, color: SUB }}>{f.kind}</span>
          </div>
          <div style={{ textAlign: "right" }}><p style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.4px", color: TEXT }}>{f.to}</p><p style={{ margin: 0, fontSize: 12, color: SUB }}>{dest}</p></div>
        </div>
      </div>
      <p style={{ ...LABEL, padding: `0 ${PAD}px`, marginTop: 8 }}>International airports</p>
      <div style={{ margin: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 12 }}>
        {v.airports.map((a) => (
          <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: "50%", background: "#EAE6E3", display: "grid", placeItems: "center", flexShrink: 0 }}><PlaneIcon /></span>
            <div><p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>{a.name}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: SUB }}>{a.note}</p></div>
          </div>
        ))}
      </div>
      <p style={{ ...LABEL, padding: `0 ${PAD}px`, marginTop: 8 }}>Visa</p>
      <div style={{ margin: `0 ${PAD}px`, padding: 14, border: `1px solid ${LINE}`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: "20px", fontWeight: 700, color: TEXT }}>{v.visa.title}</p>
        {v.visa.lines.map((l) => <p key={l} style={{ margin: 0, fontSize: 13.5, lineHeight: "20px", color: BODY }}>{l}</p>)}
      </div>
      <p style={{ ...LABEL, padding: `0 ${PAD}px`, marginTop: 8 }}>Money</p>
      <div style={{ margin: `0 ${PAD}px`, padding: "12px 14px", borderRadius: 12, background: "#FFF6E6", display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>{v.currency.name}</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[v.currency.a, v.currency.b].map(([x, y]) => (
            <p key={x} style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{x} <span style={{ fontWeight: 500, color: SUB }}>=</span> {y}</p>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: "18px", color: BODY }}>{v.currency.note}</p>
        <p style={{ margin: 0, fontSize: 11, color: SUB }}>Rates as of {AS_OF}.</p>
      </div>
    </div>
  );
}

// ─── 8. Real itineraries, titled the way the home page does ───
// The trip row. One title style everywhere, See all on the right. When the
// row has choices, the activity or place sits at the end of the title with an
// arrow; tapping it lists what this country's trips include, and picking one
// loads those trips in place.
function TripRail({ title, cards, choices, word }) {
  const [pick, setPick] = useState(0);
  const [picking, setPicking] = useState(false);
  const [all, setAll] = useState(false);
  const current = choices ? choices[Math.min(pick, choices.length - 1)] : null;
  const trips = current ? current.cards : cards;
  if (!trips || !trips.length) return null;
  const full = current ? `${title} ${current.label}` : word ? `${title} ${word}` : title;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
      <div style={{ padding: `0 ${PAD}px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ ...H2, minWidth: 0, position: "relative" }}>
          {title}
          {word && <span key={word} style={{ marginLeft: 6, fontWeight: 600, color: LAGOON, display: "inline-block", animation: "v7in 0.35s ease-out" }}>{word}</span>}
          {current && (
            <button onClick={() => setPicking((v) => !v)} aria-haspopup="listbox" aria-expanded={picking} style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 2, padding: 0, border: "none", background: "none", font: "inherit", fontWeight: 600, color: LAGOON, cursor: "pointer", whiteSpace: "nowrap" }}>
              {current.label}{picking ? <ChevronUp size={17} strokeWidth={2.4} /> : <ChevronDown size={17} strokeWidth={2.4} />}
            </button>
          )}
        </h2>
        <button onClick={() => setAll(true)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 3, padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: INK }}>
          See all <ArrowRight size={14} />
        </button>
      </div>
      {/* The choices open right under the title, over the cards. */}
      {choices && picking && (
        <>
          <div onClick={() => setPicking(false)} style={{ position: "fixed", inset: 0, zIndex: 29 }} />
          <div role="listbox" style={{ position: "absolute", top: 34, left: PAD, width: 250, maxHeight: 320, overflowY: "auto", zIndex: 30, background: "#fff", borderRadius: 14, border: `1px solid ${LINE}`, boxShadow: "0 12px 32px rgba(16,24,40,0.16)", padding: "4px 0" }} className="hide-scrollbar">
            {choices.map((c, k) => {
              const on = k === pick;
              return (
                <button key={c.label} role="option" aria-selected={on} onClick={() => { setPick(k); setPicking(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "none", background: on ? "#F4F2F0" : "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: on ? 700 : 500, color: TEXT }}>{c.label}</span>
                  <span style={{ fontSize: 12.5, color: SUB }}>{c.cards.length} trips</span>
                  <span style={{ width: 16, display: "flex" }}>{on && <Check size={16} color={LAGOON} strokeWidth={2.6} />}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      <style>{"@keyframes v7in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }"}</style>
      <div key={word} className="hs" style={{ gap: 13, paddingLeft: PAD, paddingRight: PAD, alignItems: "stretch", animation: word ? "v7in 0.35s ease-out" : undefined }}>
        {trips.slice(0, 6).map((t) => <BookedCard key={t.key} t={t} inDest />)}
      </div>
      <ListSheet open={all} title={full} count={trips.length} onClose={() => setAll(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {trips.map((t) => <BookedCard key={t.key} t={t} wide inDest />)}
        </div>
      </ListSheet>
    </div>
  );
}

function Itineraries({ dest }) {
  return <TripRail title="Recently booked itineraries" cards={BOOKED_TRIPS.filter((t) => t.dest === dest)} />;
}

// The section bar, as on the itinerary page.
const NAV = [
  { key: "trips", label: "Itineraries", Icon: Route },
  { key: "places", label: "Places", Icon: MapPin },
  { key: "best", label: "Best time", Icon: Sun },
  { key: "todo", label: "Things to do", Icon: Compass },
  { key: "getting", label: "Getting there", Icon: Plane },
  { key: "reviews", label: "Reviews", Icon: StarIcon },
];

// ─── 9. Sunday School ───
function SundaySchool({ dest, gallery }) {
  const d = destData[dest] || {};
  const acts = (d.activities || []).slice(0, 6);
  if (!acts.length) return null;
  return (
    <EduMultiCarousel
      valueTitle={`${dest} [activities], compared`}
      lessons={acts.map((act, i) => ({
        tag: act, hook: act,
        poster: gallery[(i + 1) % gallery.length],
        duration: `${1 + (i % 2)}:${String(20 + i * 7).padStart(2, "0")}`,
        videoUrl: "",
        topics: [{ dest, kind: "activity", key: act }],
      }))}
    />
  );
}

// ─── 10. Compare ───
function Compare({ dest }) {
  const { pathname } = useLocation();
  const base = pathname.startsWith("/destination-v7") ? "/destination-v7" : "/destination";
  const cols = [dest, ...V7[dest].peers];
  const peak = (x) => rangeText([...Array(12).keys()].filter((m) => ratingOf(x, m) === "peak"));
  const delhi = (x) => {
    const f = V7[x].flights.find((r) => r.city === "Delhi");
    return f ? (f.kind === "Direct" ? f.time : `${f.time}, ${f.kind}`) : "No direct flight";
  };
  const rows = [
    ["Trips from", (x) => `${priceShort(destData[x]?.startPrice)}/person`],
    ["Flight from Delhi", delhi],
    ["Visa", (x) => V7[x].visa.short],
    ["Best months", peak],
  ];
  const cell = (on, top) => ({ padding: "12px 6px", fontSize: 13.5, lineHeight: "17px", textAlign: "center", fontWeight: on ? 700 : 500, background: on ? "#FFF5F8" : "#fff", borderTop: top ? `1px solid ${LINE}` : "none", color: TEXT });
  const label = (top) => ({ position: "sticky", left: 0, zIndex: 1, background: "#fff", padding: "12px 8px 12px 12px", fontSize: 12, lineHeight: "17px", color: SUB, borderTop: top ? `1px solid ${LINE}` : "none", borderRight: `1px solid ${LINE}` });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Title>Compare with similar places</Title>
      <div className="hide-scrollbar" style={{ margin: `0 ${PAD}px`, border: `1px solid ${LINE}`, borderRadius: 12, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `92px repeat(${cols.length}, 126px)`, width: "max-content" }}>
          <div style={label(false)} />
          {cols.map((x, i) => (
            <Link key={x} to={`${base}/${encodeURIComponent(x)}`} style={{ padding: "10px 4px", background: i === 0 ? "#FFF5F8" : "#fff", textAlign: "center", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: TEXT, pointerEvents: i === 0 ? "none" : "auto" }}>
              <img src={destData[x]?.circle} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? C.p600 : TEXT }}>{x}{i ? " ›" : ""}</span>
            </Link>
          ))}
          {rows.map(([name, fn]) => [
            <div key={name} style={label(true)}>{name}</div>,
            ...cols.map((x, i) => <div key={name + x} style={cell(i === 0, true)}>{fn(x)}</div>),
          ])}
        </div>
      </div>
    </div>
  );
}

// ─── 11. Questions ───
function Questions({ dest }) {
  const [open, setOpen] = useState(0);
  const faq = faqFor(dest);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Title>Common questions</Title>
      <div style={{ padding: `0 ${PAD}px` }}>
        {faq.map((f, i) => (
          <div key={f.q} style={{ borderTop: i ? `1px solid ${LINE}` : "none" }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 0", border: "none", background: "none", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, lineHeight: "21px", color: TEXT }}>{f.q}</span>
              {open === i ? <ChevronUp size={18} color={SUB} /> : <ChevronDown size={18} color={SUB} />}
            </button>
            {open === i && <p style={{ margin: "0 0 15px", fontSize: 13.5, lineHeight: "20px", color: BODY }}>{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 12. Traveller Reviews, the home page block, last ───
const EXTRA_REVIEWS = {
  Mauritius: [
    { name: "Neha & Arjun", text: "The catamaran day and the lagoon at our resort were the best part. Very easy trip to plan.", dest: "Mauritius" },
    { name: "Ritu Malhotra", text: "Loved Le Morne and the food felt familiar. The drive across the island was longer than expected.", dest: "Mauritius", stars: 4 },
  ],
};
function ReviewMini({ r }) {
  const stars = r.stars || 5;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", border: "1px solid #F2F2F2", borderLeft: `3px solid ${C.p300}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.p100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.p600 }}>{r.name[0]}</div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.head, margin: 0 }}>{r.name}</p>
            <p style={{ fontSize: 10, color: C.sub, margin: 0 }}>{r.dest}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 1 }}>{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={10} on={s < stars} />)}</div>
      </div>
      <p style={{ fontSize: 11, lineHeight: "16px", color: C.sub, margin: 0 }}>&quot;{r.text}&quot;</p>
    </div>
  );
}

function Reviews({ dest, v }) {
  const list = [...ALL_REVIEWS.filter((r) => r.dest === dest && !/swing/i.test(r.text)), ...(EXTRA_REVIEWS[dest] || [])].slice(0, 3);
  const photos = (customerPhotos[dest] || []).slice(0, 6);
  const names = couplePhotoNames[dest] || [];
  const chip = (t) => <span key={t} style={{ display: "inline-flex", background: "#F4F2F0", color: TEXT, fontSize: 12.5, fontWeight: 500, lineHeight: "18px", padding: "5px 10px", borderRadius: 6 }}>{t}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Title>Traveller Reviews</Title>
      <div style={{ margin: `0 ${PAD}px`, background: `linear-gradient(135deg, ${C.p100} 0%, #fff 100%)`, border: `1px solid ${C.p100}`, borderRadius: 18, padding: "20px 18px", boxShadow: "0 4px 18px rgba(137,18,62,0.08)", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: INK, lineHeight: 1, letterSpacing: "-1.5px" }}>{v.rating}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, marginTop: 2 }}>out of 5</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>{[0, 1, 2, 3, 4].map((s) => <Star key={s} size={16} />)}</div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.head, margin: "0 0 8px", lineHeight: 1.3 }}>Based on <strong>{v.reviews}</strong> verified reviews</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${C.div}`, borderRadius: 999, padding: "4px 10px" }}>
            <GoogleMark size={13} /><span style={{ fontSize: 11, fontWeight: 700, color: C.head }}>Verified on Google</span>
          </span>
        </div>
      </div>
      <div style={{ padding: `0 ${PAD}px`, display: "flex", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: TEXT, display: "flex", alignItems: "center", gap: 5 }}><ThumbsUp size={13} color={LAGOON} />Liked</p>
          {v.liked.map(chip)}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: TEXT, display: "flex", alignItems: "center", gap: 5 }}><ThumbsDown size={13} color={SUB} />Didn&apos;t like</p>
          {v.disliked.map(chip)}
        </div>
      </div>
      {photos.length > 0 && (
        <div className="hs" style={{ gap: 10, paddingLeft: PAD, paddingRight: PAD }}>
          {photos.map((src, i) => (
            <div key={src} style={{ flexShrink: 0, width: 124, aspectRatio: "3 / 4", position: "relative", borderRadius: 14, overflow: "hidden", background: C.div }}>
              <img src={src} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.78))" }} />
              <div style={{ position: "absolute", left: 9, right: 9, bottom: 9 }}>
                <p style={{ margin: 0, color: "#fff", fontSize: 12, fontWeight: 800, lineHeight: 1.2 }}>{names[i] || "Our traveller"}</p>
                <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.9)", fontSize: 10.5, fontWeight: 600 }}>{dest}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((r) => <ReviewMini key={r.name + r.text} r={r} />)}
      </div>
    </div>
  );
}

// ─── The bar at the foot ───
function StickyBar({ dest }) {
  return (
    <div style={{ flexShrink: 0, padding: "10px 16px 14px", background: "#fff", borderTop: `1px solid ${LINE}`, boxShadow: "0 -4px 16px rgba(16,24,40,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, color: INK, fontWeight: 500 }}>
        <ShieldCheck size={14} color={INK} /> Our team builds the trip with you. Nothing is booked yet.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 12, color: SUB }}>Trips from</p>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TEXT }}>{priceShort(destData[dest]?.startPrice)}<span style={{ fontSize: 12, fontWeight: 500, color: SUB }}>/person</span></p>
        </div>
        <Link to={`/build?dest=${encodeURIComponent(dest)}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 50, borderRadius: 12, background: C.p600, color: "#fff", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 16px rgba(227,27,83,0.22)" }}>Plan my trip</Link>
      </div>
    </div>
  );
}

export default function DestinationV7() {
  const { name } = useParams();
  const dest = decodeURIComponent(name || "");
  const navigate = useNavigate();
  const scroller = useRef(null);
  const v = V7[dest];
  const gallery = useMemo(() => (v ? galleryFor(dest) : []), [dest, v]);
  useEffect(() => { scroller.current?.scrollTo(0, 0); }, [dest]);
  const [galleryAt, setGalleryAt] = useState(null);
  // Where each section starts, for the section bar.
  const anchors = useRef({});
  const mark = (key) => (el) => { anchors.current[key] = el; };
  const elFor = useCallback((key) => anchors.current[key] || null, []);
  // In the desktop phone frame the clock and notch sit over the top of the screen.
  const [framed, setFramed] = useState(false);
  useEffect(() => { setFramed(document.getElementById("phone-frame")?.style.borderRadius === "44px"); }, []);
  const [activity, setActivity] = useState(null);
  const { forDest, toggleActivity } = useSaves();
  // ?wish=empty shows the wishlist card as someone with no saves sees it.
  const wishEmpty = new URLSearchParams(useLocation().search).get("wish") === "empty";

  if (!v) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: SUB }}>
        No v7 page for {dest}. <Link to="/destination-v7">See all destinations</Link>
      </div>
    );
  }
  const tiles = tilesFor(dest).map((x) => ({ ...x, at: Math.max(0, gallery.indexOf(x.img)), ats: x.imgs.map((i) => Math.max(0, gallery.indexOf(i))) }));
  const rows = itineraryRows(dest, gallery);
  const row = (after) => rows.filter((r) => r.after === after).map((r) => <TripRail key={dest + r.after} title={r.title} cards={r.cards} choices={r.choices} />);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: "#fff", fontFamily: "Figtree, system-ui, sans-serif" }}>
      <div ref={scroller} className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <SectionNav sections={NAV} elFor={elFor} variant="soft" inset={framed ? 44 : 0} />
        <Hero imgs={gallery} onBack={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))} onGallery={setGalleryAt} />
        <TitleBlock dest={dest} v={v} tiles={tiles} onGallery={setGalleryAt} />
        <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: "8px 0 24px" }}>
          <div ref={mark("trips")}><Itineraries dest={dest} /></div>
          <div ref={mark("places")}><Places dest={dest} gallery={gallery} /></div>
          <div ref={mark("best")}><BestTime dest={dest} /></div>
          <DestWishlistBand dest={dest} forceEmpty={wishEmpty} headStyle={H2} style={{ margin: `0 ${PAD}px` }} />
          {row("facts")}
          <div ref={mark("todo")}><ThingsToDo dest={dest} gallery={gallery} onOpen={setActivity} /></div>
          <div ref={mark("getting")}><GettingThere dest={dest} v={v} /></div>
          <SundaySchool dest={dest} gallery={gallery} />
          {row("school")}
          <Compare dest={dest} />
          {row("compare")}
          <Questions dest={dest} />
          <div ref={mark("reviews")}><Reviews dest={dest} v={v} /></div>
          <p style={{ margin: `0 ${PAD}px`, fontSize: 11, color: SUB }}>Flights, visa and rates as of {AS_OF}. Prices, counts and reviews are samples.</p>
        </div>
      </div>
      <StickyBar dest={dest} />
      {galleryAt != null && <Gallery dest={dest} imgs={gallery} tiles={tiles} at={galleryAt} onClose={() => setGalleryAt(null)} />}
      {activity && (
        <ActivityScreen
          activity={{ name: activity.name, img: activity.img }}
          city={activity.city}
          country={dest}
          isBooked={false}
          saved={activity.id ? forDest(dest).activities.includes(activity.id) : false}
          onSave={activity.id ? () => toggleActivity(dest, activity.id) : undefined}
          onClose={() => setActivity(null)}
        />
      )}
    </div>
  );
}

// ─── Every destination, one tap each ───
export function DestinationV7Index() {
  return (
    <div className="hide-scrollbar" style={{ position: "absolute", inset: 0, overflowY: "auto", background: "#fff", fontFamily: "Figtree, system-ui, sans-serif" }}>
      <div style={{ padding: "28px 16px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: INK, letterSpacing: "-0.5px" }}>Destination pages</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: BODY }}>The new design, for every destination. Tap one to open it.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {V7_DESTS.map((d) => (
            <Link key={d} to={`/destination-v7/${encodeURIComponent(d)}`} style={{ position: "relative", height: 180, borderRadius: 16, overflow: "hidden", textDecoration: "none", background: "#ddd" }}>
              <img src={galleryFor(d)[0]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.7))" }} />
              <div style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#fff" }}>{destData[d]?.flag} {d}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>From {priceShort(destData[d]?.startPrice)} per person</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
