import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Share2, Play, Volume2, VolumeX } from "lucide-react";

// The hero owns the gallery index and all the video state, so a swipe never
// re-renders the page under it.
//
// One gesture does two jobs, the way the day detail screen already works:
// swipe through the photos, and swiping past either end hands the gesture on to
// the next or previous city.

const PAD = 16;
const H = 460;

const glass = {
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.28)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

function RoundBtn({ children, onClick, label, size = 44 }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: size, height: size, borderRadius: size / 2, ...glass, padding: 0,
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    }}>{children}</button>
  );
}

// The clip plays on arrival, muted, and stops the moment the hero leaves the
// screen. If the file is missing it falls back to the still, so a city without
// footage looks deliberate rather than broken.
function HeroVideo({ src, poster, active, muted, onFail }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !v.play) return;
    if (active && inView) v.play().catch(() => {});
    else { v.pause(); }
  }, [active, inView]);

  if (!ready) return <img src={poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  return (
    <video
      ref={ref} src={src} poster={poster} muted={muted} loop playsInline
      preload={active ? "auto" : "none"} onError={onFail}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

function CityHero({
  t, city, kicker, character, photos, video,
  saved, onToggleSave, onShare, onBack, backLabel = "Back",
  prevCity, nextCity, onPrevCity, onNextCity,
}) {
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(true);
  const [noVideo, setNoVideo] = useState(false);
  const touch = useRef(null);

  const slides = noVideo ? photos : [null, ...photos];
  const last = slides.length - 1;

  // Reset to the first slide when the city changes under us.
  useEffect(() => { setI(0); }, [city]);

  const step = useCallback((dir) => {
    setI((cur) => {
      const next = cur + dir;
      if (next > last) { if (nextCity) onNextCity(); return cur; }
      if (next < 0) { if (prevCity) onPrevCity(); return cur; }
      return next;
    });
  }, [last, nextCity, prevCity, onNextCity, onPrevCity]);

  const onTS = (e) => { touch.current = e.touches[0].clientX; };
  const onTE = (e) => {
    if (touch.current === null) return;
    const d = touch.current - e.changedTouches[0].clientX;
    touch.current = null;
    if (d > 50) step(1);
    else if (d < -50) step(-1);
  };

  const titleSize = city.length > 10 ? 36 : city.length > 7 ? 44 : 52;

  return (
    <div style={{ height: H, position: "relative", background: "#0B3C49", overflow: "hidden", flexShrink: 0 }}>
      {/* Slide track. Transform rather than native scroll, so the swipe can be
          handed on to the next city at the ends. */}
      <div
        onTouchStart={onTS} onTouchEnd={onTE}
        style={{ position: "absolute", inset: 0, display: "flex", transform: `translateX(-${i * 100}%)`, transition: "transform 280ms cubic-bezier(0.22,0.61,0.36,1)" }}
      >
        {slides.map((src, n) => (
          <div key={n} style={{ minWidth: "100%", height: "100%" }}>
            {src === null
              ? <HeroVideo src={video} poster={photos[0]} active={i === 0} muted={muted} onFail={() => setNoVideo(true)} />
              : <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          </div>
        ))}
      </div>

      {/* Ink so white type always reads, whatever the photo is doing. */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 280, background: "linear-gradient(180deg, rgba(6,28,36,0) 0%, rgba(6,28,36,0.78) 70%, rgba(6,28,36,0.86) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: "linear-gradient(180deg, rgba(6,28,36,0.45), transparent)", pointerEvents: "none" }} />

      {/* Top controls */}
      <div style={{ position: "absolute", left: PAD, right: PAD, top: PAD, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <RoundBtn onClick={onBack} label={backLabel}><ChevronLeft size={20} color="#fff" /></RoundBtn>
        <div style={{ display: "flex", gap: 8 }}>
          <RoundBtn onClick={onToggleSave} label={saved ? "Remove from saved" : "Save"}>
            <Heart size={20} color="#fff" fill={saved ? "#fff" : "none"} />
          </RoundBtn>
          <RoundBtn onClick={onShare} label="Share"><Share2 size={19} color="#fff" /></RoundBtn>
        </div>
      </div>

      {/* Media label, only while the clip is showing */}
      {!noVideo && i === 0 && (
        <div style={{ position: "absolute", left: PAD, top: 76, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, ...glass, color: "#fff", fontSize: 12, fontWeight: 600 }}>
          <Play size={12} color="#fff" fill="#fff" /> <span>Video</span>
        </div>
      )}

      {/* Title block */}
      <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 76, display: "flex", flexDirection: "column", gap: 8, color: "#fff" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.6px", textTransform: "uppercase", color: "rgba(255,255,255,0.78)" }}>{kicker}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {prevCity && (
            <button onClick={onPrevCity} aria-label={`Go to ${prevCity}`} style={{ ...glass, width: 30, height: 30, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0, cursor: "pointer" }}>
              <ChevronLeft size={16} color="#fff" />
            </button>
          )}
          <h1 style={{ margin: 0, fontSize: titleSize, lineHeight: 1, fontWeight: 800, letterSpacing: "-2px", flex: 1, minWidth: 0 }}>{city}</h1>
          {nextCity && (
            <button onClick={onNextCity} aria-label={`Go to ${nextCity}`} style={{ ...glass, width: 30, height: 30, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0, cursor: "pointer" }}>
              <ChevronRight size={16} color="#fff" />
            </button>
          )}
        </div>
        <div style={{ fontSize: 16, lineHeight: "22px", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{character}</div>
      </div>

      {/* Dots, and the mute toggle while the clip is on */}
      <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {slides.map((_, n) => (
            <div key={n} style={{ width: n === i ? 22 : 6, height: 6, borderRadius: 3, background: n === i ? "#fff" : "rgba(255,255,255,0.45)", transition: "width 200ms ease" }} />
          ))}
        </div>
        {!noVideo && i === 0 && (
          <button onClick={() => setMuted(m => !m)} aria-label={muted ? "Unmute" : "Mute"} style={{ ...glass, width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer" }}>
            {muted ? <VolumeX size={16} color="#fff" /> : <Volume2 size={16} color="#fff" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(CityHero);
