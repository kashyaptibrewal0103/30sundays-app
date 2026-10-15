import { memo, useEffect, useRef, useState } from "react";
import { X, MapPin } from "lucide-react";

// Full screen, one clip per screen, swipe up and down to move between them.
// The same shape as every reel player people already know, so nobody has to
// learn it while they are waiting for something else.
//
// Only the clip in view is allowed to play. Four portrait videos playing at
// once on a phone is how a wait screen turns into a hot battery.

function Reel({ clip, dest, active }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Autoplay can be refused: a backgrounded tab, a battery saver, a browser
    // that wants a gesture first. The frame still has to be on screen when that
    // happens, so nothing here is hidden behind a play event.
    if (active) v.play?.().catch(() => {});
    else { v.pause?.(); v.currentTime = 0; }
  }, [active]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%", scrollSnapAlign: "start", flexShrink: 0, background: "#07101A" }}>
      <video
        ref={ref}
        src={`${clip.url}#t=1`}
        muted loop playsInline
        preload={active ? "auto" : "metadata"}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: "linear-gradient(0deg, rgba(6,12,20,0.80), transparent)" }} />
      {/* Where this is and what it is, because a clip with no label is just
          somebody else's holiday video. */}
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 34, color: "#fff" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 999,
          background: "rgba(10,18,28,0.42)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.24)",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase", color: "#fff",
        }}>
          <MapPin size={11} color="#fff" />
          {clip.city ? `${dest} · ${clip.city}` : dest}
        </span>
        <p style={{ margin: "11px 0 0", fontSize: 24, fontWeight: 800, letterSpacing: "-0.7px", lineHeight: "29px", textWrap: "balance" }}>{clip.title}</p>
      </div>
    </div>
  );
}

function ReelPlayer({ clips, dest, start = 0, onClose }) {
  const scroller = useRef(null);
  const [at, setAt] = useState(start);

  // Land on the clip that was tapped, without animating past the ones between.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = start * el.clientHeight;
  }, [start]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const next = Math.round(el.scrollTop / el.clientHeight);
    if (next !== at) setAt(next);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, background: "#07101A" }}>
      <div
        ref={scroller} onScroll={onScroll} className="hide-scrollbar"
        style={{ height: "100%", overflowY: "auto", scrollSnapType: "y mandatory", display: "flex", flexDirection: "column" }}
      >
        {clips.map((c, i) => <Reel key={c.id} clip={c} dest={dest} active={i === at} />)}
      </div>

      <button onClick={onClose} aria-label="Close" style={{
        position: "absolute", top: 18, right: 18, width: 38, height: 38, borderRadius: 19,
        background: "rgba(10,18,28,0.5)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.22)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0,
      }}>
        <X size={19} color="#fff" />
      </button>

      {/* Where you are in the set, so a long reel does not feel endless. */}
      <div style={{ position: "absolute", top: 18, left: 18, display: "flex", flexDirection: "column", gap: 3 }}>
        {clips.map((_, i) => (
          <span key={i} style={{ width: 3, height: i === at ? 16 : 8, borderRadius: 2, background: i === at ? "#fff" : "rgba(255,255,255,0.38)", transition: "height 200ms ease" }} />
        ))}
      </div>
    </div>
  );
}

export default memo(ReelPlayer);
