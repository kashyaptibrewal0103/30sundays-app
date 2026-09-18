import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Play, Check, ChevronRight, Star, MapPin, FileCheck, Plane, Clock, ShieldCheck, Sun } from "lucide-react";
import { C, destData, destinations, reviews, getCustomerPhotos, couplePhotoNames, getItinerariesForDest, customerPhotos } from "../data";
import { useSaves } from "../data/saves";
import { destHero } from "../data/buildData";
import { regionsFor, activitiesFor } from "../data/discoverData";
import { weatherData } from "../data/weatherData";
import MonthWeatherStrip from "../components/MonthWeatherStrip";
import EduSingleCard from "../components/home_v2/EduSingleCard";
import EduMultiCarousel from "../components/home_v2/EduMultiCarousel";
import ItineraryCard from "../components/ItineraryCard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PAD = 16;

// Deterministic "X% of Indian couples visit" figure from a region name (62-89%).
function visitPct(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 100;
  return 62 + (h % 28);
}

// One save-heart look everywhere: brand-pink outline that fills solid on save.
// No disc; a soft shadow keeps it legible over photos (drop it when on white).
function SaveHeart({ saved, onClick, size = 30, icon = 22, shadow = true }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label={saved ? "Saved" : "Save"} style={{ width: size, height: size, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>
      <Heart size={icon} fill={saved ? C.p600 : "none"} color={C.p600} strokeWidth={2.2} style={shadow ? { filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))" } : undefined} />
    </button>
  );
}

// Horizontal scroll of ready-made itineraries for the destination, chosen to be
// distinct (different routes / nights / cities), reusing the standard card.
function ReadyMadeItineraries({ dest }) {
  const all = getItinerariesForDest(dest) || [];
  const seen = new Set();
  const picks = [];
  for (const it of all) {
    const key = `${it.nights}|${(it.route || []).map(r => r.city).join(">")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(it);
    if (picks.length === 5) break;
  }
  if (picks.length < 5) for (const it of all) { if (!picks.includes(it)) { picks.push(it); if (picks.length === 5) break; } }
  if (!picks.length) return null;
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ padding: `0 ${PAD}px`, marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: 0 }}>Ready-made {dest} trips</h2>
        <p style={{ fontSize: 12, color: C.sub, margin: "3px 0 0" }}>Loved routes you can start from.</p>
      </div>
      <div className="hs" style={{ gap: 14, paddingLeft: PAD, paddingRight: PAD }}>
        {picks.map((it, i) => <ItineraryCard key={i} it={it} vibe={it.vibe} hideDest />)}
      </div>
    </div>
  );
}

export default function DiscoverWF() {
  const { name } = useParams();
  const dest = decodeURIComponent(name || "");
  const navigate = useNavigate();
  const { forDest, toggleRegion, toggleActivity } = useSaves();
  const [reel, setReel] = useState(null); // { kind: "region" | "activity", data }

  if (!destData[dest]) return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Destination not found</div>;

  const regions = regionsFor(dest);
  const activities = activitiesFor(dest, 8);
  const saved = forDest(dest);
  const isRegionSaved = (c) => saved.regions.includes(c);
  const isActivitySaved = (id) => saved.activities.includes(id);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingBottom: 16 }}>
      {/* Slow zoom on region thumbs so they read as looping clips, not stills. */}
      <style>{`@keyframes wfKenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.12); } } .wf-kb { animation: wfKenBurns 14s ease-in-out infinite alternate; will-change: transform; }`}</style>
      {/* Hero (video placeholder - slow zoom mimics a looping clip) */}
      <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
        <img src={destHero(dest)} alt={dest} className="wf-kb" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.75) 100%)" }} />
        <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 14, left: 14, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.4)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={19} color="#fff" />
        </button>
        <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 14 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.5px", textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>{dest}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", margin: "2px 0 0", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Temples, rice fields &amp; sunset beaches</p>
        </div>
      </div>

      {/* Where will you base yourself */}
      <div style={{ marginTop: 20, marginBottom: 24 }}>
        <div style={{ padding: `0 ${PAD}px`, marginBottom: 12 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: 0 }}>Where will you base yourself?</h2>
          <p style={{ fontSize: 12, color: C.sub, margin: "3px 0 0", lineHeight: "16px" }}>Watch each region, save what you love.</p>
        </div>
        <div className="hs" style={{ gap: 11, paddingLeft: PAD, paddingRight: PAD }}>
          {regions.map((r, i) => (
            <div key={r.city} onClick={() => setReel({ kind: "region", data: r })} style={{ flexShrink: 0, width: 148, position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "9 / 16", background: C.div, cursor: "pointer" }}>
              <img src={r.img} alt={r.city} className="wf-kb" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", animationDelay: `${(i % 4) * -3.5}s` }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.18) 28%, rgba(0,0,0,0.72) 100%)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}><Play size={14} color={C.head} fill={C.head} /></div>
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <SaveHeart saved={isRegionSaved(r.city)} onClick={() => toggleRegion(dest, r.city)} />
              </div>
              <div style={{ position: "absolute", left: 11, right: 11, bottom: 11 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.55)" }}>{r.emoji} {r.city}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: "2px 0 0", textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}>{r.dayTrip ? "Day trip" : `${r.n}-${r.n + 1} Nights`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No asterisks */}
      <div style={{ padding: `0 ${PAD}px`, marginBottom: 24 }}>
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.div}`, padding: "16px 16px 6px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14 }}>
            <div style={{ width: 22, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>
              <ShieldCheck size={18} color={C.p600} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.head, margin: 0 }}>No asterisks. Ever.</p>
          </div>
          {["Real prices, taxes and fees in, upfront.", "Transfer times shown, not hidden in fine print.", "A day trip is never sold to you as a stay."].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 0", borderTop: `1px solid ${C.div}` }}>
              <span style={{ width: 22, display: "inline-flex", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={16} color={C.p600} strokeWidth={2.6} />
              </span>
              <span style={{ fontSize: 13, color: C.head, lineHeight: "18px" }}>{t}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: `1px solid ${C.div}` }}>
            <span style={{ width: 22, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>
              <Star size={14} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />
            </span>
            <span style={{ fontSize: 12, color: C.sub }}><b style={{ color: C.head }}>4.8</b> · planned with 2,300+ couples</span>
          </div>
        </div>
      </div>

      {/* What can you do in [dest] */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: `0 ${PAD}px`, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: 0 }}>What can you do in {dest}?</h2>
            <p style={{ fontSize: 12, color: C.sub, margin: "3px 0 0" }}>Tap to watch. Save what you love.</p>
          </div>
        </div>
        <div className="hs" style={{ gap: 11, paddingLeft: PAD, paddingRight: PAD }}>
          {activities.map(a => (
            <div key={a.id} onClick={() => setReel({ kind: "activity", data: a })} style={{ flexShrink: 0, width: 132, cursor: "pointer" }}>
              <div style={{ position: "relative", height: 168, borderRadius: 14, overflow: "hidden" }}>
                <img src={a.img} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)" }} />
                <div style={{ position: "absolute", top: 8, right: 8 }}><SaveHeart saved={isActivitySaved(a.id)} onClick={() => toggleActivity(dest, a.id)} /></div>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}><Play size={15} color={C.head} fill={C.head} /></div>
                <div style={{ position: "absolute", left: 9, right: 9, bottom: 9 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", margin: 0, lineHeight: "15px", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{a.name}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", margin: "1px 0 0", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{a.city} · {a.dur}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MoreFromDest dest={dest} navigate={navigate} />

      </div>{/* end scroll area */}

      {/* Fixed bottom bar */}
      <div style={{ flexShrink: 0, background: C.white, borderTop: `1px solid ${C.div}`, padding: `12px ${PAD}px`, boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }}>
        <Link to={`/build?dest=${encodeURIComponent(dest)}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.p600, color: "#fff", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
          Plan my {dest} trip <ChevronRight size={18} />
        </Link>
      </div>

      {/* Full-screen reel for the tapped region / activity */}
      {reel && (
        <DestReel
          dest={dest}
          reel={reel}
          saved={reel.kind === "region" ? isRegionSaved(reel.data.city) : isActivitySaved(reel.data.id)}
          onToggleSave={() => reel.kind === "region" ? toggleRegion(dest, reel.data.city) : toggleActivity(dest, reel.data.id)}
          onClose={() => setReel(null)}
        />
      )}
    </div>
  );
}

// Full-screen portrait reel opened from a region or activity card. Mirrors the
// activity reel in Build.jsx: poster with a slow zoom, top/bottom gradients,
// kicker, name and caption, traveller social proof. Back arrow + wishlist heart.
function DestReel({ dest, reel, saved, onToggleSave, onClose }) {
  const { kind, data } = reel;
  const isRegion = kind === "region";
  const name = isRegion ? data.city : data.name;
  const kicker = isRegion
    ? (data.dayTrip ? "Day trip" : `${data.n}-${data.n + 1} Nights`)
    : `${data.city} · ${data.vibe}`;
  const caption = isRegion
    ? data.blurb
    : `${data.name} in ${data.city} - a hand-picked highlight with private transfers, a local guide, and time to truly soak it in.`;
  const photos = customerPhotos[dest] || [];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, background: "#000", overflow: "hidden" }}>
      <img src={data.img} alt={name} className="wf-kb" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 120, background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 320, background: "linear-gradient(transparent, rgba(0,0,0,0.9))" }} />

      {/* Back (top-left) */}
      <button onClick={onClose} aria-label="Back" style={{ position: "absolute", top: 16, left: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.4)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <ArrowLeft size={19} color="#fff" />
      </button>

      {/* Bottom: kicker, name + heart, social proof, caption */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `0 ${PAD}px 30px` }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{kicker}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 10px" }}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.4px", textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>{name}</p>
          <SaveHeart saved={saved} onClick={onToggleSave} />
        </div>
        {isRegion ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            {photos.length > 0 && (
              <div style={{ display: "flex", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>
                {photos.slice(0, 3).map((img, i) => (
                  <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "1.5px solid #fff", marginLeft: i > 0 ? -8 : 0 }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{visitPct(name)}% of Indian couples visit {name}</span>
          </div>
        ) : photos.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ display: "flex", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>
              {photos.slice(0, 3).map((img, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "1.5px solid #fff", marginLeft: i > 0 ? -8 : 0 }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>Loved by {photos.length} travellers</span>
          </div>
        )}
        {caption && (
          <p style={{ margin: 0, fontSize: 13, color: "#F9F9FB", lineHeight: 1.45, opacity: 0.92, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{caption}</p>
        )}
      </div>
    </div>
  );
}

// The familiar destination-page sections, reused at the foot of the WF flow.
function MoreFromDest({ dest, navigate }) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const d = destData[dest];
  if (!d) return null;
  // Destination reviews first, then the wider pool, so "read all" has substance.
  const destReviews = [...reviews.filter(r => r.dest === dest), ...reviews.filter(r => r.dest !== dest)];
  const visibleReviews = showAllReviews ? destReviews : destReviews.slice(0, 3);
  const otherDests = destinations.filter(dd => dd.name !== dest);
  const wx = weatherData[dest];
  // Four driest months, in calendar order, for a "best time" note.
  const driest = wx ? wx.rain.map((r, i) => [r, i]).sort((a, b) => a[0] - b[0]).slice(0, 4).map(x => x[1]).sort((a, b) => a - b).map(i => MONTHS[i]) : [];
  const photos = getCustomerPhotos(dest);
  const coupleNames = couplePhotoNames[dest] || [];
  const facts = [
    { icon: FileCheck, label: "Visa", value: d.visa, color: C.p600 },
    { icon: Sun, label: "Best months to visit", value: d.bestMonths, color: "#1570EF" },
    { icon: Clock, label: "Ideal duration", value: d.idealNights, color: "#6938EF" },
  ];

  return (
    <div style={{ marginTop: 28 }}>
      {/* Sunday School - single (hidden for now, kept for later) */}
      {false && <EduSingleCard title={`Where to stay in [${dest}]`} poster={destHero(dest)} duration="2:18" videoUrl="" />}

      {/* Sunday School - multi */}
      {d.activities && d.activities.length > 0 && (
        <EduMultiCarousel
          valueTitle={`${dest} [activities], compared`}
          lessons={d.activities.slice(0, 6).map((act, i) => ({
            tag: act, hook: act,
            poster: (d.actImgs && d.actImgs[i]) || d.hero,
            duration: `${1 + (i % 2)}:${String(20 + i * 7).padStart(2, "0")}`,
            videoUrl: "",
            topics: [{ dest, kind: "activity", key: act }],
          }))}
        />
      )}

      {/* Key facts */}
      <div style={{ margin: `28px ${PAD}px 0` }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Key facts</span>
        <p style={{ fontSize: 12, color: C.sub, marginTop: 2, marginBottom: 14 }}>Everything you need to know before you go</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {facts.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{ display: "flex", gap: 12, padding: 14, background: C.white, borderRadius: 12, border: `1px solid ${C.div}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${f.color}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={f.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.head, margin: "0 0 2px" }}>{f.label}</p>
                  <p style={{ fontSize: 12, lineHeight: "17px", color: C.sub, margin: 0 }}>{f.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weather - how warm, and what the sky does, month by month */}
      {wx && (
        <div style={{ margin: `28px ${PAD}px 0` }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Weather in {dest}</span>
          <p style={{ fontSize: 12, color: C.sub, marginTop: 2, marginBottom: 14 }}>Typical temperature each month</p>
          <MonthWeatherStrip dest={dest} pad={PAD} />
          <p style={{ fontSize: 11.5, color: C.inact, margin: "10px 2px 0", lineHeight: "16px" }}>
            Average low and high, indicative rather than a forecast. Driest months are {driest.join(", ")}.
          </p>
        </div>
      )}

      {/* Ready-made itineraries for this destination */}
      <ReadyMadeItineraries dest={dest} />

      {/* Traveller moments */}
      {photos.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ padding: `0 ${PAD}px`, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>📸</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Traveller moments</span>
            </div>
            <p style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Couples who explored {dest} with us</p>
          </div>
          <div className="hs" style={{ gap: 10, paddingLeft: PAD, paddingRight: PAD }}>
            {photos.map((photo, i) => (
              <div key={i} style={{ width: 180, minWidth: 180, height: 240, borderRadius: 14, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                <img src={photo.img} alt={photo.tag} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(0,0,0,0.75))" }} />
                <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                  {coupleNames[i] && <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", margin: "0 0 2px", opacity: 0.9 }}>{coupleNames[i]}</p>}
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={10} color={C.p300} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{photo.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div style={{ margin: `28px ${PAD}px 0` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.white, borderRadius: 12, padding: "8px 12px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.head }}>4.6</span>
            <span style={{ fontSize: 12, color: C.sub }}>/5</span>
          </div>
          <p style={{ fontSize: 12, color: C.sub }}>1,000+ Google reviews</p>
        </div>
        {visibleReviews.map((r, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, padding: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", borderLeft: `3px solid ${C.p300}`, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.p100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.p600 }}>{r.name[0]}</div>
                <div><p style={{ fontSize: 12, fontWeight: 600, color: C.head, margin: 0 }}>{r.name}</p><p style={{ fontSize: 10, color: C.sub, margin: 0 }}>{r.dest}</p></div>
              </div>
              <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(s => <Star key={s} size={10} fill="#FBBC05" color="#FBBC05" strokeWidth={0} />)}</div>
            </div>
            <p style={{ fontSize: 11, lineHeight: "16px", color: C.sub }}>"{r.text}"</p>
          </div>
        ))}
        {destReviews.length > 3 && (
          <button onClick={() => setShowAllReviews(v => !v)} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: `1px solid ${C.div}`, background: C.white, fontSize: 13, fontWeight: 700, color: C.p600, cursor: "pointer", fontFamily: "inherit", marginTop: 2 }}>
            {showAllReviews ? "Show less" : `Read all ${destReviews.length} reviews`}
          </button>
        )}
      </div>

      {/* Other destinations */}
      <div style={{ marginTop: 24 }}>
        <div style={{ padding: `0 ${PAD}px`, marginBottom: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.head }}>Other destinations</span>
        </div>
        <div className="hs" style={{ gap: 10, paddingLeft: PAD, paddingRight: PAD }}>
          {otherDests.map((dd, i) => (
            <Link key={i} to={`/destination/${encodeURIComponent(dd.name)}`} style={{ width: 155, minWidth: 155, flexShrink: 0, borderRadius: 12, overflow: "hidden", textDecoration: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
              <div style={{ position: "relative", height: 120 }}>
                <img src={destData[dd.name].card} alt={dd.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 30%, rgba(0,0,0,0.7))" }} />
                <div style={{ position: "absolute", bottom: 10, left: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>{dd.flag} {dd.name}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: "2px 0 0" }}>From ₹{dd.startPrice}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
