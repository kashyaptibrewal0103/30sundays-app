import { useState, useEffect } from "react";
import { X as XIcon, Route as RouteIcon, Moon, Car, Compass, CalendarDays } from "lucide-react";
import { C } from "../../data";

// "Route" is our word, not theirs. Somebody arriving at this step has picked a
// country and some dates, and is now being asked to choose between three lists
// of town names. This drawer answers the question they are actually holding:
// what is this, and how do I tell a good one from a bad one.
//
// Same sheet shell as the inclusions drawer, so it opens the way every other
// drawer in the app opens.

const FACTORS = [
  {
    icon: Moon,
    title: "Nights in each place",
    body: "Under two nights, most of a day goes on packing, checking out and checking in.",
  },
  {
    icon: Car,
    title: "Time between stops",
    body: "Every move costs you half a day. Fewer hops is more holiday, not less.",
  },
  {
    icon: Compass,
    title: "What is actually there",
    body: "A surf town and a temple town are different trips. The route decides which days you get.",
  },
  {
    icon: CalendarDays,
    title: "The month you travel",
    body: "Some coasts are rough in the wrong month. A good route goes around that.",
  },
];

export function RouteHelpBody() {
  return (
    <>
      <p style={{ margin: "0 0 14px", fontSize: 14, color: C.sub, lineHeight: "21px" }}>
        {/* The definition first. Everything else is only useful once this lands. */}
        A route is the towns you sleep in, in order, and how many nights you give
        each one. Two nights in Ubud, then two in Seminyak, is a route.
      </p>

      <div style={{ background: C.bg, borderRadius: 14, padding: "12px 14px", marginBottom: 18 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: C.head, fontWeight: 600, lineHeight: "20px" }}>
          It is the one choice that changes everything after it. The same 8 nights
          can be slow mornings in two places, or four hours in a car every other day.
        </p>
      </div>

      <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: C.head, letterSpacing: "-0.2px" }}>
        What makes a route a good one
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {FACTORS.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} style={{ display: "flex", gap: 12, padding: "10px 0", alignItems: "flex-start" }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, background: C.p100, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon size={16} color={C.p600} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head, letterSpacing: "-0.2px" }}>{f.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: C.sub, lineHeight: "19px" }}>{f.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing reassurance: this is not a decision they are locked into. */}
      <p style={{ margin: "16px 0 0", fontSize: 13, color: C.sub, lineHeight: "19px" }}>
        Pick whichever route is closest to the trip you want. You can change the
        places and the nights afterwards.
      </p>
    </>
  );
}

export default function RouteHelpDrawer({ onClose }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 220);
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div
        onClick={handleClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out" }}
      />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0",
        maxWidth: 420, margin: "0 auto", width: "100%", boxSizing: "border-box",
        maxHeight: "82vh", display: "flex", flexDirection: "column",
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "18px 18px 12px" }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: C.p100, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <RouteIcon size={17} color={C.p600} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0, lineHeight: "20px" }}>What is a route?</p>
            <p style={{ fontSize: 12.5, color: C.sub, margin: "2px 0 0" }}>And how to tell a good one from a bad one</p>
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
            <XIcon size={20} color={C.sub} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "0 18px 28px" }}>
          <RouteHelpBody />
        </div>
      </div>
    </div>
  );
}
