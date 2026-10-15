import { useState } from "react";
import { GlassPlay } from "./EduSingleCard";
import SundaySchoolMasthead from "./SundaySchoolMasthead";
import LessonViewer from "./LessonViewer";

// Sunday School - series carousel (multi-video).
// Editorial masthead + horizontal-scroll video tiles. Each tile is the poster
// only (no white body) with the title overlaid bottom-left in DM Serif white.
// Tapping a tile opens it full-screen with a wishlist strip for whatever
// places/activities that lesson covers (see LessonViewer).
export default function EduMultiCarousel({
  lessons,
  valueTitle = "The full series",
  tagline,            // pass "" to suppress the byline on repeat SS sections
  flush = false,      // drop the rules and the top gap when the page fades into
                      // the yellow itself, so the fade is the only join
}) {
  const [active, setActive] = useState(null);
  return (
    <div style={{
      background: "#FCF4CC",
      padding: flush ? "24px 0 8px" : "26px 0 22px",
      marginTop: flush ? 0 : 28,
      borderTop: flush ? "none" : "1px solid rgba(180,130,30,0.22)",
      borderBottom: flush ? "none" : "1px solid rgba(180,130,30,0.22)",
    }}>
      <div style={{ padding: "0 16px" }}>
        <SundaySchoolMasthead valueTitle={valueTitle} tagline={tagline} />
      </div>

      <div className="hs" style={{ gap: 12, padding: "4px 16px 4px" }}>
        {lessons.map((l, i) => <LessonCard key={i} l={l} onOpen={() => setActive(l)} />)}
      </div>

      {active && <LessonViewer lesson={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function LessonCard({ l, onOpen }) {
  // Title source: prefer hook, fall back to tag.
  const title = l.hook || l.tag || "";
  return (
    <div onClick={onOpen} style={{
      flex: "0 0 220px", width: 220,
      position: "relative",
      borderRadius: 16, overflow: "hidden",
      border: "0.5px solid rgba(24,29,39,0.06)",
      boxShadow: "0 2px 8px rgba(24,29,39,0.06)",
      height: 300,
      background: "#d6cfc4",
      cursor: "pointer",
    }}>
      {l.poster && (
        <img
          src={l.poster}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}

      {/* Bottom gradient for title legibility */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 35%, rgba(0,0,0,0.65) 100%)",
        pointerEvents: "none",
      }} />

      <GlassPlay size={48} iconSize={18} />

      {l.duration && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(20,16,14,0.85)",
          backdropFilter: "blur(6px)",
          color: "#fff",
          padding: "3px 7px", borderRadius: 4,
          fontSize: 11, fontWeight: 700,
          letterSpacing: "0.2px",
          zIndex: 2,
        }}>
          {l.duration}
        </div>
      )}

      {/* Title overlay */}
      {title && (
        <div style={{
          position: "absolute", left: 14, right: 14, bottom: 14,
          color: "#fff",
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 18,
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "-0.2px",
          textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          zIndex: 2,
        }}>
          {title}
        </div>
      )}
    </div>
  );
}
