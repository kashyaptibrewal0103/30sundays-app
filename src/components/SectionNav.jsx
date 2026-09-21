import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { C } from "../data";
import { BRAND } from "../data/brand";

// ─── Section nav for a long screen ───
//
// The itinerary runs nine sections deep. Everything above the day plan is the
// overview, and once that is behind you the rest is a list of places you might
// want to jump between rather than scroll through.
//
// The bar floats: a zero-height sticky anchor pins it to the top of the screen,
// and the bar itself is lifted out of the flow, so it costs the layout nothing
// and leaves no gap in the overview where it is not wanted. It fades in as the
// first section comes up to meet it, and fades out again on the way back.
//
// The chip you are in stays lit and stays in view, and tapping one glides there.

// How far below the bar a section's top has to come before it counts as the one
// you are reading. Without the slack the active chip flickers on the boundary.
const ARRIVED = 16;

// How far ahead of the first section the bar shows itself. It has to be more
// than the gap a jump leaves under the bar, or tapping the first chip would
// scroll back past the point that keeps the bar on screen.
const LEAD = 30;

// The gap a jump leaves between the bar and the heading it lands on.
const REST = 8;

// The nearest scrolling ancestor, whatever shell the screen is mounted in.
// Deliberately not gated on the page being tall enough yet: on a cold load the
// images have no height when this runs, and a screen that is not scrollable for
// another beat would otherwise never get a listener at all.
function findScroller(el) {
  let n = el?.parentElement;
  while (n) {
    const oy = getComputedStyle(n).overflowY;
    if (oy === "auto" || oy === "scroll") return n;
    n = n.parentElement;
  }
  return null;
}

export default function SectionNav({ sections, elFor, onJump }) {
  const wrapRef = useRef(null);
  const barRef = useRef(null);
  const railRef = useRef(null);
  const scrollerRef = useRef(null);
  // A tap sets the chip straight away. Without this the spy would walk the
  // active state through every section the smooth scroll flies past.
  const lockRef = useRef(0);
  // The scroll position at which the bar earns its place on screen, kept so a
  // jump can be held below it.
  const showAtRef = useRef(0);

  const [active, setActive] = useState(sections[0]?.key);
  const [shown, setShown] = useState(false);
  const [progress, setProgress] = useState(0);

  // Where something sits in the page, rather than on the screen.
  const flowTop = (el, sc) => sc.scrollTop + el.getBoundingClientRect().top - sc.getBoundingClientRect().top;

  const measure = useCallback(() => {
    const sc = scrollerRef.current;
    const bar = barRef.current;
    if (!sc || !bar) return;

    const navH = bar.offsetHeight || 52;
    const first = sections.map((s) => elFor(s.key)).find(Boolean);
    if (!first) return;

    // The overview ends where the first real section begins, so that is what
    // the bar waits for.
    const showAt = Math.max(0, flowTop(first, sc) - navH - LEAD);
    showAtRef.current = showAt;
    setShown(sc.scrollTop >= showAt);

    const span = sc.scrollHeight - sc.clientHeight - showAt;
    const p = span > 0 ? Math.min(1, Math.max(0, (sc.scrollTop - showAt) / span)) : 0;
    // Rounded so a scroll only re-renders the bar when the line would actually
    // move by about a pixel.
    setProgress(Math.round(p * 400) / 400);

    if (Date.now() < lockRef.current) return;

    const cTop = sc.getBoundingClientRect().top;
    let act = sections[0]?.key;
    sections.forEach((s) => {
      const el = elFor(s.key);
      if (!el) return;
      if (el.getBoundingClientRect().top - cTop <= navH + ARRIVED) act = s.key;
    });
    // The last section is usually too short to reach the top, so the bottom of
    // the page means the bottom of the list.
    if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 6) {
      const last = [...sections].reverse().find((s) => elFor(s.key));
      if (last) act = last.key;
    }
    setActive(act);
  }, [sections, elFor]);

  useLayoutEffect(() => {
    const sc = findScroller(wrapRef.current);
    scrollerRef.current = sc;
    if (!sc) return;
    // Measured straight off the scroll event rather than inside an animation
    // frame: the reads are a handful of rects, the browser already coalesces
    // scroll events, and a frame callback stops being delivered the moment the
    // tab is throttled, which leaves the bar frozen in whatever state it was in.
    sc.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      sc.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // Keep the lit chip on screen. A nav you have to scroll to read is not a nav.
  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector(`[data-chip="${active}"]`);
    if (!rail || !chip) return;
    const target = chip.offsetLeft - rail.clientWidth / 2 + chip.offsetWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  const jump = (key) => {
    const sc = scrollerRef.current;
    const bar = barRef.current;
    if (!sc) return;
    const el = elFor(key);
    setActive(key);
    lockRef.current = Date.now() + 800;
    onJump?.(key);

    if (!el) {
      // The overview has no anchor of its own: it is everything above here.
      sc.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const navH = bar?.offsetHeight || 52;
    const top = flowTop(el, sc) - navH - REST;
    // Never land above the point that keeps the bar on screen, or the first
    // chip would take the nav away on the very tap that used it.
    sc.scrollTo({ top: Math.max(showAtRef.current + 1, top), behavior: "smooth" });
  };

  return (
    // Zero height on purpose: the bar is lifted out of the flow, so the overview
    // keeps its own spacing and nothing shifts when the chips arrive.
    <div ref={wrapRef} style={{ position: "sticky", top: 0, height: 0, zIndex: 25 }}>
      <div
        ref={barRef}
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px) saturate(1.4)",
          WebkitBackdropFilter: "blur(14px) saturate(1.4)",
          borderBottom: `1px solid ${C.div}`,
          boxShadow: "0 10px 20px -18px rgba(0,0,0,0.55)",
          opacity: shown ? 1 : 0,
          transform: shown ? "none" : "translateY(-8px)",
          pointerEvents: shown ? "auto" : "none",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}
      >
        <div
          ref={railRef}
          className="hide-scrollbar"
          style={{ display: "flex", gap: 7, overflowX: "auto", padding: "9px 16px 15px" }}
        >
          {sections.map(({ key, label, Icon }) => {
            const on = active === key;
            return (
              <button
                key={key}
                data-chip={key}
                data-testid={`sectionnav-${key}`}
                onClick={() => jump(key)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
                  height: 34, padding: "0 13px", borderRadius: 999, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
                  border: `1px solid ${on ? BRAND.sunsetFuchsiaSoft : C.div}`,
                  background: on ? BRAND.sunsetFuchsiaSoft : C.white,
                  color: on ? "#fff" : C.sub,
                  boxShadow: on ? "0 6px 14px -8px rgba(248,113,159,0.85)" : "none",
                  transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                }}
              >
                <Icon size={14} color={on ? "#fff" : C.inact} />
                {label}
              </button>
            );
          })}
        </div>

        {/* How far through the trip you are. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, bottom: 0, height: 2,
            width: `${progress * 100}%`, background: BRAND.sunsetFuchsiaSoft,
          }}
        />
      </div>
    </div>
  );
}
