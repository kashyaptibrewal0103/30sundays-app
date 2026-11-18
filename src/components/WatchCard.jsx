import { useEffect, useRef, useState } from "react";
import { Play, Clock } from "lucide-react";
import { C } from "../data";
import { WATCH_CATEGORIES } from "../data/watchData";
import { useSavedVideos } from "../hooks/useSavedVideos";
import SaveHeart from "./SaveHeart";

// Watch card - split layout (portrait poster + white footer panel) so it reads
// unmistakably as a vertical video, distinct from the gradient cards used for
// itineraries / activities elsewhere on the page.
//
// Props:
//   video    - the video object
//   onOpen   - invoked on tap (opens the player)
//   live     - when true, the card auto-pans (ken-burns) once it scrolls into
//              view. Used by the first card in a row / grid only.
//   width    - explicit pixel width (used by the horizontal teaser).
//              Omit on the library where columns size the card.
//   aspect   - poster aspect ratio as a CSS aspect-ratio string. Defaults to
//              "9/16" (tall portrait); the library passes mixed values to
//              break the monotony of a uniform grid.
export default function WatchCard({ video, onOpen, live = false, width, aspect = "9/16" }) {
  const { isSaved, toggle } = useSavedVideos();
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const cat = WATCH_CATEGORIES.find(c => c.id === video.category) || WATCH_CATEGORIES[0];

  useEffect(() => {
    if (!live || !ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio > 0.6),
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [live]);

  const cardStyle = {
    width: width || "100%",
    minWidth: width || undefined,
    flexShrink: 0,
    cursor: "pointer",
    borderRadius: 14,
    overflow: "hidden",
    background: C.white,
    border: `1px solid ${C.div}`,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div ref={ref} onClick={() => onOpen(video)} style={cardStyle}>
      {/* Portrait poster */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: aspect,
        background: "#000", overflow: "hidden",
      }}>
        <img
          src={video.poster}
          alt={video.title}
          className={live && inView ? "ken-burns" : undefined}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* Subtle vignette so chips read on any image */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.35) 100%)" }} />

        {/* Duration pill - strong "this is a video" cue */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          display: "inline-flex", alignItems: "center", gap: 3,
          padding: "3px 7px", borderRadius: 6,
          background: "rgba(0,0,0,0.78)", color: "#fff",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.3px",
        }}>
          <Clock size={9} color="#fff" />
          {video.duration}
        </div>

        {/* Persistent play button */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}>
          <Play size={17} color={C.head} fill={C.head} style={{ marginLeft: 2 }} />
        </div>
      </div>

      {/* Info footer - solid white panel cements the "video card" identity */}
      <div style={{ padding: "9px 11px 11px", background: C.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {cat.label}
          </span>
        </div>
        {/* Title with its save heart, right aligned on the first line */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <p style={{
            flex: 1, minWidth: 0,
            fontSize: 13, fontWeight: 600, color: C.head,
            margin: 0, lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {video.title}
          </p>
          <SaveHeart size={28} saved={isSaved(video.id)} onToggle={() => toggle(video.id)} style={{ marginTop: -6, marginRight: -6, marginBottom: -6 }} />
        </div>
      </div>
    </div>
  );
}
