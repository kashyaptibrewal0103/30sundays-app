import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Heart, Play, X, Check, AlertCircle, Plane, FileCheck,
  CalendarDays, Clock, Star, ChevronRight, MapPin,
} from "lucide-react";
import { C, destData } from "../data";
import { useSaves } from "../data/saves";
import SaveHeart from "../components/SaveHeart";
import { destHero, estimatePerPerson, formatINR } from "../data/buildData";
import { regionsFor, activitiesFor, goodToKnow, starterRoutes } from "../data/discoverData";

const PAD = 16;

// ─── Reusable spotlight overlay (region detail / activity clip / hero film) ───
function Spotlight({ data, onClose, saved, onToggleSave }) {
  if (!data) return null;
  const { img, title, sub, chips = [], pros = [], cons = [], saveable, savedLabel } = data;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.45)", animation: "fadeInBg 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "20px 20px 0 0", maxHeight: "88%", overflowY: "auto", animation: "sheetSlideUp 0.28s cubic-bezier(0.22,1,0.36,1)" }} className="hide-scrollbar">
        <div style={{ position: "relative", height: 210 }}>
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={18} color="#fff" />
          </button>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Play size={22} color={C.head} fill={C.head} />
          </div>
          <span style={{ position: "absolute", bottom: 12, left: 14, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, letterSpacing: "0.3px" }}>FILM COMING SOON</span>
        </div>
        <div style={{ padding: 18 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: C.head, margin: "0 0 4px", letterSpacing: "-0.4px" }}>{title}</h3>
          {sub && <p style={{ fontSize: 13, color: C.sub, margin: "0 0 12px" }}>{sub}</p>}
          {chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {chips.map((c, i) => (
                <span key={i} style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, background: C.bg, border: `1px solid ${C.div}`, borderRadius: 999, padding: "5px 10px" }}>{c}</span>
              ))}
            </div>
          )}
          {pros.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {pros.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <Check size={15} color="#2E7D52" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.head }}>{p}</span>
                </div>
              ))}
            </div>
          )}
          {cons.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {cons.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <AlertCircle size={15} color="#B45309" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.sub }}>{p}</span>
                </div>
              ))}
            </div>
          )}
          {saveable && (
            /* The same pink the heart is everywhere else, rather than the
               green this one button used to turn. A save is a save. */
            <button onClick={onToggleSave} style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 12, border: `1.5px solid ${C.p600}`, background: saved ? C.white : C.p600, color: saved ? C.p600 : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <Heart size={17} fill={saved ? C.p600 : "none"} color={saved ? C.p600 : "#fff"} strokeWidth={2.2} />
              {saved ? `Saved${savedLabel ? ` · ${savedLabel}` : ""}` : "Save this"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: `0 ${PAD}px`, marginBottom: 12, gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.3px" }}>{title}</h2>
        {sub && <p style={{ fontSize: 12, color: C.sub, margin: "3px 0 0", lineHeight: "16px" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Discover({ routesBase = "/discover" }) {
  const { name } = useParams();
  const dest = decodeURIComponent(name || "");
  const navigate = useNavigate();
  const { forDest, toggleRegion, toggleActivity } = useSaves();
  const [spot, setSpot] = useState(null);

  if (!destData[dest]) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Destination not found</div>;
  }

  const saved = forDest(dest);
  const isRegionSaved = (c) => saved.regions.includes(c);
  const isActivitySaved = (id) => saved.activities.includes(id);
  const savedCount = saved.regions.length + saved.activities.length;

  const regions = regionsFor(dest);
  const activities = activitiesFor(dest);
  const gtk = goodToKnow(dest);
  const starters = starterRoutes(dest, 3);
  const caption = destData[dest].stayAreas ? `${destData[dest].activities?.slice(0, 3).join(", ")}` : "";

  const fromPrice = (() => {
    const prices = starters.map(s => Number(String(s.price).replace(/[^0-9]/g, ""))).filter(Boolean);
    return prices.length ? Math.min(...prices) : estimatePerPerson(dest, 7);
  })();

  const openRegion = (r) => setSpot({
    kind: "region", key: r.city, img: r.img, title: `${r.emoji} ${r.city}`,
    sub: r.blurb, chips: [r.dayTrip ? "Day trip · not a base" : `Base · ~${r.n}N`, `${r.crowd} crowds`],
    pros: r.pros, cons: r.cons, saveable: true, savedLabel: r.dayTrip ? "day trip" : "base",
  });
  const openActivity = (a) => setSpot({
    kind: "activity", key: a.id, img: a.img, title: a.name,
    sub: `${a.city} · ${a.dur}`, chips: [a.vibe], saveable: true,
  });

  const spotSaved = spot ? (spot.kind === "region" ? isRegionSaved(spot.key) : spot.kind === "activity" ? isActivitySaved(spot.key) : false) : false;
  const toggleSpot = () => {
    if (!spot) return;
    if (spot.kind === "region") toggleRegion(dest, spot.key);
    else if (spot.kind === "activity") toggleActivity(dest, spot.key);
  };

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingBottom: 16 }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 240 }}>
        <img src={destHero(dest)} alt={dest} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)" }} />
        <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 14, left: 14, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.4)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={19} color="#fff" />
        </button>
        <button onClick={() => setSpot({ kind: "watch", img: destHero(dest), title: `${dest} in 90 seconds`, sub: "An honest look before you plan.", saveable: false })} style={{ position: "absolute", top: 14, right: 14, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.92)", border: "none", borderRadius: 999, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, color: C.head, cursor: "pointer" }}>
          <Play size={13} fill={C.p600} color={C.p600} /> Watch {dest} · 90s
        </button>
        <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 16 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.6px", textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>{dest}</h1>
          {caption && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", margin: "3px 0 0", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{caption}</p>}
        </div>
      </div>

      {/* Regions */}
      <div style={{ marginTop: 22, marginBottom: 26 }}>
        <SectionTitle title="Where will you base yourself?" sub="Save the places you love. A base is where you sleep; some spots are a day out." />
        <div className="hs" style={{ gap: 12, paddingLeft: PAD, paddingRight: PAD }}>
          {regions.map(r => (
            <div key={r.city} onClick={() => openRegion(r)} style={{ flexShrink: 0, width: 168, cursor: "pointer", borderRadius: 16, overflow: "hidden", background: C.white, border: `1px solid ${isRegionSaved(r.city) ? C.p300 : C.div}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ position: "relative", height: 120 }}>
                <img src={r.img} alt={r.city} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%)" }} />
                <span style={{ position: "absolute", left: 9, bottom: 9, display: "inline-flex", alignItems: "center", gap: 4, background: r.dayTrip ? "rgba(255,255,255,0.94)" : C.p100, color: r.dayTrip ? C.sub : C.p600, fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 999 }}>
                  {r.dayTrip ? "Day trip" : `Base · ${r.n}N`}
                </span>
              </div>
              <div style={{ padding: "10px 11px 12px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                  <p style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>{r.emoji} {r.city}</p>
                  <SaveHeart size={28} saved={isRegionSaved(r.city)} onToggle={() => toggleRegion(dest, r.city)} style={{ margin: "-6px -6px -6px 0" }} />
                </div>
                <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 0", lineHeight: "15px", height: 30, overflow: "hidden" }}>{r.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Good to know */}
      <div style={{ marginBottom: 26 }}>
        <SectionTitle title="Good to know" sub="The honest basics before you commit." />
        <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { I: FileCheck, label: "Visa", val: gtk.visa },
            { I: Plane, label: "Flights from India", val: gtk.flights },
            { I: CalendarDays, label: "Best months", val: gtk.bestMonths || "Year-round" },
            { I: Clock, label: "Ideal length", val: gtk.idealNights },
          ].filter(x => x.val).map((x, i) => (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.div}`, borderRadius: 12, padding: "12px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <x.I size={14} color={C.p600} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.3px" }}>{x.label}</span>
              </div>
              <p style={{ fontSize: 12.5, color: C.head, margin: 0, lineHeight: "17px" }}>{x.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experiences */}
      <div style={{ marginBottom: 26 }}>
        <SectionTitle title="Experiences worth saving" sub="Save what you'd love to do. It shapes the routes we build." />
        <div className="hs" style={{ gap: 11, paddingLeft: PAD, paddingRight: PAD }}>
          {activities.map(a => (
            <div key={a.id} onClick={() => openActivity(a)} style={{ flexShrink: 0, width: 140, cursor: "pointer" }}>
              <div style={{ position: "relative", height: 176, borderRadius: 14, overflow: "hidden" }}>
                <img src={a.img} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 100%)" }} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={16} color={C.head} fill={C.head} />
                </div>
                <div style={{ position: "absolute", left: 10, right: 10, bottom: 9 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                    <p style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: "#fff", margin: 0, lineHeight: "15px", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{a.name}</p>
                    <SaveHeart onPhoto size={28} saved={isActivitySaved(a.id)} onToggle={() => toggleActivity(dest, a.id)} style={{ margin: "-7px -6px -7px 0" }} />
                  </div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", margin: "1px 0 0", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{a.city} · {a.dur}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter routes */}
      {starters.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <SectionTitle title="Starter routes" sub="A few ready starting points. Tweak anything later." />
          <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 10 }}>
            {starters.map(it => (
              <Link key={it.id} to={`/itinerary/${it.id}`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: C.white, border: `1px solid ${C.div}`, borderRadius: 14, padding: 10 }}>
                <img src={it.img} alt={it.name} style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</p>
                  <p style={{ fontSize: 11.5, color: C.sub, margin: "2px 0 0" }}>{it.nights} nights · {it.route.map(r => r.city).join(" · ")}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.head, margin: "4px 0 0" }}>From ₹{it.price} pp</p>
                </div>
                <ChevronRight size={18} color={C.inact} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Honesty band */}
      <div style={{ padding: `0 ${PAD}px` }}>
        <div style={{ background: C.p100, borderRadius: 14, padding: "16px 16px 14px" }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.head, margin: "0 0 10px" }}>No asterisks. Ever.</p>
          {[
            "Real prices, taxes and fees in, upfront.",
            "Transfer times shown, not hidden in fine print.",
            "A day trip is never sold to you as a stay.",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 }}>
              <Check size={15} color="#2E7D52" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: C.head, lineHeight: "17px" }}>{t}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.p300}` }}>
            <Star size={13} fill="#FBBC05" color="#FBBC05" />
            <span style={{ fontSize: 12, color: C.sub }}><b style={{ color: C.head }}>4.8</b> · planned with 2,300+ couples</span>
          </div>
        </div>
      </div>

      </div>{/* end scroll area */}

      {/* Fixed bottom bar */}
      <div style={{ flexShrink: 0, background: C.white, borderTop: `1px solid ${C.div}`, padding: `12px ${PAD}px`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }}>
        <div>
          <p style={{ fontSize: 10.5, color: C.sub, margin: 0 }}>From</p>
          <p style={{ fontSize: 17, fontWeight: 800, color: C.head, margin: 0 }}>₹{formatINR(fromPrice)} <span style={{ fontSize: 11, fontWeight: 500, color: C.inact }}>/ person</span></p>
        </div>
        <button
          onClick={() => navigate(`${routesBase}/${encodeURIComponent(dest)}/routes`)}
          style={{ flex: 1, maxWidth: 230, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.p600, color: "#fff", border: "none", borderRadius: 13, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 16px rgba(227,27,83,0.3)" }}
        >
          {savedCount > 0 ? `See your routes · ${savedCount} saved` : `Plan my ${dest}`}
        </button>
      </div>

      <Spotlight data={spot} onClose={() => setSpot(null)} saved={spotSaved} onToggleSave={toggleSpot} />
    </div>
  );
}
