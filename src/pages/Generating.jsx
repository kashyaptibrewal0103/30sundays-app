import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Play, Check, ChevronLeft, Clock, Map, BedDouble, Compass, Receipt } from "lucide-react";
import { C } from "../data";
import { BRAND, BRAND_TINT } from "../data/brand";
import { recommendedRoute, destMeta } from "../data/buildData";
import { galleryForDest } from "../data/activityVideos";
import ReelPlayer from "../components/Generating/ReelPlayer";

// The wait while an itinerary is built. Around ninety seconds of real work,
// which is far too long to spend watching a spinner.
//
// The only two things known during the wait are that it started and, later,
// that it is ready. Nothing on this screen claims more than that: no step
// completes, nothing ticks, nothing says done. The motion is ambient, and the
// content is the checks every itinerary goes through, which are true whether
// or not this one has reached them yet.
//
//   status   the countdown, a badge, and five areas that step left to right
//            every twelve seconds: green when passed, lit when live, grey
//            when waiting. Paced off the countdown, since that is all we have.
//   checks   five things every itinerary is built on, as a plain list
//   reels    footage from this destination, which opens full screen
//
// The clock lives inside the status card, so a tick never re-renders a video.

const COUNTDOWN = 60;

const PAGE = C.bg;
const CARD = {
  background: C.white,
  borderRadius: 20,
  border: "1px solid #E0E2EB",
  boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
};
const TEAL = BRAND.lagoonBliss;
const TEAL_TINT = BRAND_TINT.lagoonBliss;
const INK = C.head;

const AREAS = [
  { key: "route", label: "Route", icon: Map },
  { key: "stays", label: "Stays", icon: BedDouble },
  { key: "exp", label: "Experiences", icon: Compass },
  { key: "timing", label: "Timing", icon: Clock },
  { key: "price", label: "Price", icon: Receipt },
];

// The checks. Written as things that are true of every itinerary, not as
// things happening right now, because nobody knows which one is happening.
export const CHECKS = [
  { emoji: "🏨", title: "Stays rated 8.0 and above, nothing lower" },
  { emoji: "🧘", title: "A pace with room to breathe, not a checklist" },
  { emoji: "🚫", title: "No tourist traps, only places worth your time" },
];

// ─── Top bar ───
function TopBar({ dest, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 16px 8px", background: C.white }}>
      <button onClick={onBack} aria-label="Back" style={{ width: 36, height: 36, borderRadius: 18, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0, marginLeft: -8 }}>
        <ChevronLeft size={24} color={INK} />
      </button>
      {/* The title centres on the bar, with the back button's width mirrored on
          the right so it stays centred with nothing over there. */}
      <span style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 700, color: INK, letterSpacing: "-0.3px" }}>Building your {dest} trip</span>
      <span style={{ width: 28, flexShrink: 0 }} />
    </div>
  );
}

// ─── Status card ───

// Five areas, one every twelve seconds, left to right. Finished ones go green
// with a tick, the live one is lit, the rest wait in grey. This is paced off
// the countdown, not off the build, and the last one holds until it is ready.
const STEP_S = 12;
const Pulse = memo(function Pulse({ elapsed }) {
  const at = Math.min(AREAS.length - 1, Math.floor(elapsed / STEP_S));
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginTop: 8 }}>
      {AREAS.map((a, i) => {
        const done = i < at;
        const on = i === at;
        const Icon = a.icon;
        return (
          <div key={a.key} style={{ display: "flex", alignItems: "flex-start", flex: i < AREAS.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 52 }}>
              <div style={{ height: 36, display: "grid", placeItems: "center", position: "relative" }}>
                {/* A halo that breathes out of the live node, so the step that is
                    running reads as running without claiming it is finished. */}
                {on && <span style={{
                  position: "absolute", width: 36, height: 36, borderRadius: "50%",
                  border: `2px solid ${TEAL}`, animation: "genHalo 1800ms ease-out infinite", pointerEvents: "none",
                }} />}
                <span style={{
                  width: on ? 36 : 30, height: on ? 36 : 30, borderRadius: "50%", display: "grid", placeItems: "center",
                  background: on ? TEAL_TINT : done ? C.sBg : C.bg,
                  border: on ? `1.5px solid ${TEAL}` : done ? "none" : `1.5px solid ${C.div}`,
                  transition: "width 320ms ease, height 320ms ease, background 320ms ease",
                }}>
                  {done
                    ? <Check size={14} color={C.sText} strokeWidth={3} />
                    : <Icon size={on ? 17 : 14} color={on ? TEAL : C.inact} style={on ? { animation: "genBeat 1800ms ease-in-out infinite" } : undefined} />}
                </span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: on ? TEAL : done ? C.sText : C.inact, whiteSpace: "nowrap", transition: "color 320ms ease" }}>{a.label}</span>
            </div>
            {i < AREAS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: C.div, marginTop: 17, marginLeft: -6, marginRight: -6, borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", background: C.sText, transform: done ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform 600ms ease" }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

const StatusCard = memo(function StatusCard({ dest, startAt, onLeave }) {
  const [elapsed, setElapsed] = useState(startAt);
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, COUNTDOWN - elapsed);
  const late = elapsed >= COUNTDOWN;

  return (
    <div style={{ ...CARD, padding: "14px 16px 12px", position: "relative", overflow: "hidden" }}>
      {/* Only the late state gets a badge. On track is true of every normal
          build, and a badge on the default is decorating the default. */}
      {late && (
        <span style={{
          position: "absolute", top: 0, right: 0, padding: "8px 14px 8px 12px", borderBottomLeftRadius: 16, borderTopRightRadius: 19,
          display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700,
          background: C.wBg, color: C.wText,
        }}>
          <Clock size={13} color={C.wText} />
          Running late
        </span>
      )}

      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: C.sub }}>{late ? "Nearly there" : "Your itinerary will be ready in"}</p>
      <p style={{ margin: "2px 0 0", fontSize: late ? 26 : 36, lineHeight: late ? "32px" : "40px", fontWeight: 800, letterSpacing: "-1.2px", color: late ? C.wText : INK, fontVariantNumeric: "tabular-nums" }}>
        {late ? "A bit longer ⏳" : <>{left} <span style={{ fontSize: 20, letterSpacing: "-0.4px" }}>sec</span></>}
      </p>
      {late && (
        <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 700, color: INK, letterSpacing: "-0.2px" }}>Your {dest} trip is nearly built</p>
      )}

      {late ? (
        <>
          <p style={{ margin: "6px 0 14px", fontSize: 13.5, color: C.sub, lineHeight: "19px" }}>
            Bigger trips take more thinking. Stay and watch it land, or have a look around {dest} and we will tell you the moment it is ready.
          </p>
          {/* Same secondary button the builder uses, so it sits at the same height. */}
          <button onClick={onLeave} style={{
            width: "100%", padding: "10px 0", borderRadius: 22, border: `1.5px solid ${C.p600}`, background: C.white, color: C.p600,
            fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
          }}>
            Show me {dest}
          </button>
        </>
      ) : (
        <Pulse elapsed={elapsed} />
      )}
    </div>
  );
});

// ─── The checks ───
// Three things every itinerary is built on. A plain list in a panel
// with a coloured edge, the same shape as the honest-bit section elsewhere.
function Checks() {
  return (
    <div style={{ ...CARD, padding: "14px 16px 16px" }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700, color: INK, letterSpacing: "-0.3px" }}>What goes into your itinerary</h2>
      <div style={{ background: C.white, border: "1px solid #E0E2EB", borderLeft: `4px solid ${TEAL}`, borderRadius: 14, padding: "6px 14px 6px 12px" }}>
        {CHECKS.map((c) => (
          <div key={c.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: TEAL_TINT, display: "grid", placeItems: "center", fontSize: 14, flexShrink: 0 }}>{c.emoji}</span>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: INK, lineHeight: "19px" }}>{c.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── The reels ───
// A tile is the video itself, parked one second in, so the still is a real
// frame of that clip rather than a photo of somewhere else. preload is
// metadata only, so twelve tiles cost a fraction of one clip.

function Tile({ clip, onOpen, height, wide }) {
  return (
    <div onClick={onOpen} style={{ position: "relative", borderRadius: 16, overflow: "hidden", cursor: "pointer", background: C.icon, height, gridColumn: wide ? "span 2" : undefined }}>
      <video src={`${clip.url}#t=1`} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: wide ? 130 : 96, background: "linear-gradient(0deg, rgba(6,12,20,0.84), transparent)" }} />
      <span style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: 13, background: "rgba(10,18,28,0.44)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", display: "grid", placeItems: "center" }}>
        <Play size={11} color="#fff" fill="#fff" />
      </span>
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 11, color: "#fff" }}>
        {clip.city && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.9px", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>{clip.city}</span>}
        <p style={{ margin: "3px 0 0", fontSize: wide ? 16.5 : 13, fontWeight: 700, lineHeight: wide ? "21px" : "17px", letterSpacing: "-0.2px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{clip.title}</p>
      </div>
    </div>
  );
}

const Gallery = memo(function Gallery({ dest, clips, onOpen }) {
  // Two columns from the first row. No hero: the video sits behind two other sections, so no single clip earns the space.
  return (
    <div style={{ ...CARD, padding: "10px 14px 16px" }}>
      {/* The handle says there is more below, the way a sheet does. */}
      <div style={{ width: 36, height: 4, borderRadius: 2, background: C.icon, margin: "0 auto 10px" }} />
      <div style={{ marginBottom: 10, padding: "0 4px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: INK, letterSpacing: "-0.3px" }}>Real trips, real reels 🎥</h2>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: C.sub }}>Filmed by travellers on their own {dest} trip with us.</p>
        </div>
      </div>
      {/* Two columns that stack on their own, so staggered heights leave no
          holes the way they do in a grid with shared rows. */}
      <div style={{ display: "flex", gap: 10 }}>
        {[0, 1].map((col) => (
          <div key={col} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {clips.map((c, i) => (i % 2 === col
              ? <Tile key={c.id} clip={c} height={(i + col) % 3 === 1 ? 232 : 190} onOpen={() => onOpen(i)} />
              : null))}
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── The screen ───
export default function Generating({ leadData }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dest = params.get("dest") || leadData?.dests?.[0] || "Thailand";
  const nights = Number(params.get("nights")) || leadData?.nights || destMeta[dest]?.defaultNights || 7;

  const stops = useMemo(() => recommendedRoute(dest, nights), [dest, nights]);
  const cities = useMemo(() => stops.map((s) => s.city), [stops]);
  const clips = useMemo(() => galleryForDest(dest, cities, 12), [dest, cities]);

  const [reelAt, setReelAt] = useState(null);

  const onLeave = useCallback(() => navigate(`/destination/${encodeURIComponent(dest)}`), [navigate, dest]);
  const onBack = useCallback(() => navigate(-1), [navigate]);
  const openReel = useCallback((i) => setReelAt(i), []);
  const closeReel = useCallback(() => setReelAt(null), []);

  // ?over=1 jumps straight to the past-the-countdown state, so it can be
  // reviewed without sitting through sixty seconds.
  const startAt = params.get("over") === "1" ? COUNTDOWN : 0;

  return (
    <div style={{ minHeight: "100%", background: PAGE }}>
      <style>{`
        @keyframes genIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes genSlide { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
        @keyframes genFill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes genHalo { 0% { transform: scale(1); opacity: 0.55; } 70% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes genBeat { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
      `}</style>

      <TopBar dest={dest} onBack={onBack} />

      <div style={{ padding: "8px 14px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        <StatusCard dest={dest} startAt={startAt} onLeave={onLeave} />
        <Checks />
        <Gallery dest={dest} clips={clips} onOpen={openReel} />
      </div>

      {reelAt !== null && <ReelPlayer clips={clips} dest={dest} start={reelAt} onClose={closeReel} />}
    </div>
  );
}
