import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { X, Check, ChevronRight, AlertTriangle, Heart } from "lucide-react";
import { C } from "../../data";
import { destAreas, areaImg, cityCoords } from "../../data/buildData";
import { cityTags, cityPhotos } from "../../data/cityTags";
import RegionDetail from "../../pages/RegionDetail";
import { useWishlist } from "../../data/wishlist";
import { SavedMark } from "../WishlistPickSheet";

// ─── Choose the cities ───
//
// One question: where do you want to stay. The screen used to ask four at once.
// Every card carried the weather, a nightly rate, two tags, a suggestion, and a
// dial for setting that city's nights by hand; above them sat a route strip, an
// order note, a fit warning, a nights warning and an info panel, and behind it
// all a drag-and-drop route builder. A couple picking Ubud does not need nine
// surfaces to do it in.
//
// So: a map, and a list of cities on a sheet that pulls up over it. There is
// no search: a country has ten or fifteen regions in it, which is a scroll
// rather than a query, and the box cost more room than it saved. One line at
// the foot says whether what they have chosen fits the trip, which is the only
// thing the warnings were ever really saying.
//
// The order and the nights are ours to work out, as they always were, and the
// itinerary screen is where either gets changed afterwards.

const PAD = 16;

// ─── Sharing the nights out ───
//
// Our suggested length per city, scaled to fit the trip they have booked, with
// the remainder going to the longer stays first so nothing ends up at nought.
export function split(cities, rec, target) {
  if (!cities.length) return [];
  const want = cities.map((c) => Math.max(1, rec[c] ?? 2));
  const total = want.reduce((a, b) => a + b, 0);
  const out = cities.map((c, i) => ({
    city: c,
    n: Math.max(1, Math.round((want[i] / total) * target)),
  }));
  // Rounding never lands on the target, so the difference is handed to, or
  // taken from, the longest stays until it does.
  let diff = target - out.reduce((a, b) => a + b.n, 0);
  const order = [...out.keys()].sort((a, b) => out[b].n - out[a].n);
  let guard = 0;
  while (diff !== 0 && guard < 500) {
    for (const i of order) {
      if (diff === 0) break;
      if (diff > 0) { out[i].n += 1; diff -= 1; }
      else if (out[i].n > 1) { out[i].n -= 1; diff += 1; }
    }
    guard += 1;
  }
  return out;
}

// ─── Does it fit ───
//
// Not "are all your nights allocated", which they always are, but "do the
// places you have chosen want more or less time than you have". That is the
// question a couple is actually getting wrong, and the only one worth a line.
function fit(route, rec, nights) {
  if (!route.length) {
    return { kind: "empty", text: `Pick a city to start. Your trip is ${nights} nights.` };
  }
  const want = route.reduce((t, s) => t + Math.max(1, rec[s.city] ?? 2), 0);
  const over = want - nights;
  if (over > 1) return { kind: "over", text: "Too much to see, too little time." };
  if (over < -1) {
    const spare = -over;
    return { kind: "under", text: `${spare} ${spare === 1 ? "night" : "nights"} spare, keep adding.` };
  }
  return { kind: "good", text: "Just about the right length." };
}

// ─── The map ───
//
// Full bleed, the way a listing app does it, and the cities are their own names
// rather than numbered dots: a pin reading "2" is a puzzle, and the name is
// both the label and the answer. Picked cities carry the brand colour and a
// tick, so the map is a way of choosing rather than a picture of what you chose.
const namePin = (name, picked) => L.divIcon({
  className: "",
  html: `<div style="transform:translate(-50%,-50%);
      display:inline-flex;align-items:center;gap:4px;
      white-space:nowrap;padding:6px 11px;border-radius:999px;
      background:${picked ? C.p600 : "#fff"};color:${picked ? "#fff" : C.head};
      box-shadow:0 2px 8px rgba(16,24,40,0.28);
      font-family:Figtree,sans-serif;font-size:12.5px;font-weight:700">
      ${picked ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ""}
      ${name}
    </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// ─── Keeping the right part of the map on screen ───
//
// Leaflet measures its container once and caches it. Growing the map leaves
// the new area unpainted until it is told, which showed as flat blue below the
// old bottom edge. Being told is not enough on its own: the extra height gets
// added at the bottom and the cities stay pinned to the top, so the map has to
// be framed again, and framed against what is actually visible rather than the
// whole element, since the sheet sits over the foot of it.
function Frame({ on, fit, clear = 0 }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(fit, { paddingBottomRight: [0, clear], animate: false });
    }, 60);
    return () => clearTimeout(id);
  }, [map, on, fit, clear]);
  return null;
}

function CityMap({ cards, picked, onOpen, height, covered = 0 }) {
  const pins = useMemo(() => cards.filter((a) => cityCoords[a.city]), [cards]);

  // ─── What the opening view fits ───
  //
  // Not every pin. Bali's list runs to Labuan Bajo, five hundred kilometres
  // east in Flores, and fitting that put the six cities people actually choose
  // between into one overlapping blob off the corner of Java. So the outlier is
  // left out of the fit and stays on the map, a zoom out away: anything more
  // than three times the median distance from the middle of the cluster. A
  // country that is genuinely spread out, like Vietnam, keeps all of itself
  // because none of its cities is an outlier against the others.
  const span = useMemo(() => {
    const pts = pins.map((p) => cityCoords[p.city]);
    const mid = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    const c = { lat: mid(pts.map((p) => p.lat)), lng: mid(pts.map((p) => p.lng)) };
    const away = pts.map((p) => Math.hypot(p.lat - c.lat, p.lng - c.lng));
    const typical = mid(away) || 0.1;
    const core = pts.filter((_, i) => away[i] <= typical * 3);
    const use = core.length >= 2 ? core : pts;
    const lat = use.map((x) => x.lat);
    const lng = use.map((x) => x.lng);
    // Each side gets a margin off its own span. Padding the longitude by a
    // quarter of the latitude is what pushed a tall country like Vietnam out
    // to a view with half of China in it.
    const padOf = (xs) => Math.max(0.12, (Math.max(...xs) - Math.min(...xs)) * 0.18);
    const padLat = padOf(lat);
    const padLng = padOf(lng);
    return [
      [Math.min(...lat) - padLat, Math.min(...lng) - padLng],
      [Math.max(...lat) + padLat, Math.max(...lng) + padLng],
    ];
  }, [pins]);

  // position and zIndex together give Leaflet its own stacking context. Its
  // panes sit at z-index 200 to 700 internally, and without a context of their
  // own they draw straight through any page opened over this step.
  return (
    <div style={{ position: "relative", zIndex: 0, height, background: "#AADAFF" }}>
      <MapContainer
        bounds={span}
        style={{ height: "100%", width: "100%", background: "#AADAFF" }}
        attributionControl={false}
        zoomControl={false}
        // Whole zoom steps are a factor of two apart, so fitting a long
        // country into a short box had to drop a whole level and the view
        // came back with half of China in it. Off the snap, it fits exactly.
        zoomSnap={0}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Frame on={height} fit={span} clear={covered} />
        {pins.map((p) => (
          <Marker
            key={p.city}
            position={[cityCoords[p.city].lat, cityCoords[p.city].lng]}
            icon={namePin(p.city, picked.has(p.city))}
            zIndexOffset={picked.has(p.city) ? 500 : 0}
            eventHandlers={{ click: () => onOpen(p.city) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

// ─── How long we would give it ───
//
// Our own suggested nights for the city, shown as the range around it rather
// than a single number, because that is how long anybody actually stays and a
// flat "2 nights" reads as a rule. A single tilde carries the "about", which
// the words no longer have to: the almost-equals sign is two strokes and reads
// as an equals at this size, which is the opposite of what it means.
const nightsRange = (n) => {
  const k = Math.max(1, n || 2);
  return `${k} to ${k + 1} nights`;
};

// ─── One city ───
//
// The whole card chooses it. There is no plus beside the name any more: a card
// with one obvious thing to do with it does not need a button to say so, and
// the tick is the answer rather than the control. Reading about the place is
// the other thing somebody wants here, so that is its own small link.
//
// Under the name, two things. One line saying what the place is, which is the
// city's own short label and not the region page's opening paragraph: a
// paragraph on a card somebody is scanning six of is a wall, and they are not
// reading six of them. Then a chip or two for what that line cannot say.
//
// The photograph runs the full height of the card and flush to its edge, so
// the card is as tall as its words with no band of nothing to manage.
// saved: the region is on the wishlist, which the card marks and nothing more.
function CityCard({ area, picked, saved, onToggle, onOpen }) {
  // A chip or two for what the line above cannot say: how booked the place is
  // and how busy it gets. See cityTags.
  const tags = useMemo(() => cityTags(area.dest, area.city), [area.dest, area.city]);
  const photos = useMemo(() => cityPhotos(area.dest, area.city), [area.dest, area.city]);
  const [shot, setShot] = useState(0);
  return (
    <div
      onClick={onToggle}
      role="button"
      aria-pressed={picked}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      style={{
        display: "flex", cursor: "pointer", overflow: "hidden",
        borderRadius: 16, background: C.white,
        border: `${picked ? 1.5 : 1}px solid ${picked ? C.p600 : C.div}`,
        boxShadow: "0 1px 3px rgba(24,29,39,0.05)",
        transition: "border-color .15s",
      }}
    >
      {/* Flush to the edge and the full height of the card. It used to sit in
          eleven pixels of white on all four sides, which spends the width a
          photograph is there to use and makes the card read as a thumbnail
          with a margin rather than a place.

          A reel rather than one frame, with dots, the way the region pages and
          the hotel cards do it. A swipe moves the picture and a tap still
          picks the city, because a drag is not a tap. */}
      <div style={{
        position: "relative", width: 104, alignSelf: "stretch",
        flexShrink: 0, overflow: "hidden", background: "#F4F2F0",
      }}>
        <div
          className="hide-scrollbar"
          onScroll={(e) => {
            const el = e.currentTarget;
            const n = Math.round(el.scrollLeft / (el.clientWidth || 1));
            if (n !== shot) setShot(n);
          }}
          style={{
            position: "absolute", inset: 0, display: "flex",
            overflowX: "auto", overflowY: "hidden",
            scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
          }}
        >
          {photos.map((src, n) => (
            <img
              key={n}
              src={src}
              alt={n === 0 ? area.city : ""}
              loading={n === 0 ? "eager" : "lazy"}
              style={{
                flex: "0 0 100%", width: "100%", height: "100%",
                objectFit: "cover", display: "block", scrollSnapAlign: "start",
              }}
            />
          ))}
        </div>

        {photos.length > 1 && (
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 7,
            display: "flex", justifyContent: "center", gap: 3.5, pointerEvents: "none",
          }}>
            {photos.map((_, n) => (
              <span key={n} style={{
                width: n === shot ? 5 : 4, height: n === shot ? 5 : 4, borderRadius: "50%",
                background: n === shot ? "#fff" : "rgba(255,255,255,0.55)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "11px 12px 11px 13px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 800, color: C.head, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {area.city}
          </span>
          {saved && <SavedMark size={18} />}
          {/* ─── The one thing to tap ───
              The tick used to appear only once a city was chosen, so an
              unchosen card showed nothing at all: a photograph, a name and a
              sentence, with no sign that it was something you pick. The circle
              is always there now, empty and waiting, and fills when it is
              answered. Small and quiet on purpose: it is the whole card that
              takes the press, and this only has to say that the card takes
              one. */}
          <span aria-hidden style={{
            width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
            display: "grid", placeItems: "center",
            background: picked ? C.p600 : C.white,
            // Quiet enough to be a mark on the card rather than a thing
            // competing with the name, and a shade darker than the card's own
            // border so it still reads as a control.
            border: picked ? "none" : `1.5px solid ${C.icon}`,
            boxSizing: "border-box",
            transition: "background .15s, border-color .15s",
          }}>
            {picked && <Check size={11} strokeWidth={3.6} color="#fff" />}
          </span>
        </div>

        {/* What the place is, in its own line. The chips below say what it is
            like; this says what it is, which is the thing a name alone does
            not. */}
        <p style={{
          margin: "2px 0 0", fontSize: 12, lineHeight: "17px", color: C.sub,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{area.tag}</p>

        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
            {tags.map((t) => (
              <span key={t.key} style={{
                padding: "3px 8px", borderRadius: 999,
                background: t.bg, color: t.fg,
                fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
              }}>{t.label}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <span
            aria-label={`About ${nightsRange(area.n)}`}
            style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 700, color: C.head, opacity: 0.72, whiteSpace: "nowrap" }}
          >
            <span aria-hidden style={{ marginRight: 4, fontWeight: 800 }}>~</span>
            {nightsRange(area.n)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            style={{
              flexShrink: 0, border: "none", background: "none", padding: 0, cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, fontWeight: 800, color: C.p600,
              display: "inline-flex", alignItems: "center", gap: 1,
            }}
          >
            View details
            <ChevronRight size={14} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── The region, on a sheet over whatever opened it ───
//
// Two stops and a way out, the way a profile preview behaves: it arrives
// covering most of the screen with the page behind it dimmed, reading it takes
// it the rest of the way up, and pulling it down sends it away from either
// height. Whatever was underneath is still underneath and unchanged, which is
// the point: reading about Hoi An is not meant to cost you your place.
//
// Portalled into the phone shell. Rendered where it is written it would size
// itself against the scrolling step, and the region page measures its own box
// to decide how tall the photographs are: opened from the route step that box
// was the whole scroll length and the pictures came out half as tall again as
// they are on the region page proper.
const GONE = 2;

// How far a drag has to travel before it counts as one. Below this it is a
// stray few pixels on the way to reading something.
const PULL = 70;

function RegionSheet({ dest, city, added, onAdd, onClose }) {
  const [frame, setFrame] = useState(null);
  const [h, setH] = useState(760);
  // 0 full, 1 partial, GONE on the way out. Opens from under the bottom edge.
  const [stop, setStop] = useState(GONE);
  const [drag, setDrag] = useState(false);
  const [pull, setPull] = useState(0);

  const gap = Math.round(h * 0.28);
  const at = stop === 0 ? 0 : stop === 1 ? gap : h;
  const top = Math.max(0, Math.min(h, at + pull));
  const shade = Math.max(0, 1 - top / Math.max(1, h));

  useEffect(() => {
    const el = document.getElementById("phone-frame");
    setFrame(el);
    if (!el) return;
    const read = () => setH(el.getBoundingClientRect().height);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One frame under the bottom edge, then up: the arrival is the same
  // transition as every other move between stops.
  useEffect(() => {
    const id = setTimeout(() => setStop(1), 20);
    return () => clearTimeout(id);
  }, []);

  const leave = useCallback(() => {
    setStop(GONE);
    setTimeout(() => onClose?.(), 240);
  }, [onClose]);

  // ─── Pulling it down ───
  //
  // The drag is not only the handle's. Anywhere on the sheet counts, as long
  // as the page inside is already at its top and the finger is going down,
  // which is the one moment the page itself has nothing to do with the
  // gesture. That is what makes "scroll it down and it goes" true rather than
  // "find the handle and pull it".
  //
  // On native listeners rather than React's, because React adds touchmove as a
  // passive listener and a passive listener cannot stop the page scrolling
  // under the drag.
  //
  // Attached once and only once. Hung off anything that changes while a finger
  // is down, they tear off and go back on mid-gesture, and the drag so far is
  // forgotten: the sheet would follow the first few pixels and then stop dead.
  const sheet = useRef(null);
  const atTop = useRef(true);
  const live = useRef({ stop, pull: 0, leave });
  live.current = { stop, pull, leave };

  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    let g = null;

    // What the gesture was, not where it ended up. Down means close, from
    // either stop: half way up and dragged down used to land back at half,
    // which is a sheet arguing with the hand on it. Up means open fully. A
    // pull shorter than the threshold was not a gesture, so it springs back to
    // wherever it started.
    const settle = () => {
      const { pull: P, stop: S } = live.current;
      setDrag(false);
      setPull(0);
      if (P > PULL) live.current.leave();
      else if (P < -PULL) setStop(0);
      else setStop(S);
    };

    const begin = (y, x, free) => {
      g = { y, x, moving: free };
      if (free) { setDrag(true); setPull(0); }
    };
    const moved = (y, x, e) => {
      if (!g) return;
      const dy = y - g.y;
      const dx = x - g.x;
      if (!g.moving) {
        if (!atTop.current || dy <= 8 || Math.abs(dx) > Math.abs(dy)) return;
        g.moving = true;
        setDrag(true);
      }
      if (e.cancelable) e.preventDefault();
      setPull(dy);
    };
    const ended = () => {
      if (!g) return;
      const moving = g.moving;
      g = null;
      if (moving) settle();
    };

    const onHandle = (t) => !!(t && t.closest && t.closest("[data-grab]"));

    const ts = (e) => { const t = e.touches[0]; begin(t.clientY, t.clientX, onHandle(e.target)); };
    const tm = (e) => { const t = e.touches[0]; moved(t.clientY, t.clientX, e); };
    const md = (e) => { if (e.button === 0) begin(e.clientY, e.clientX, onHandle(e.target)); };
    const mm = (e) => moved(e.clientY, e.clientX, e);

    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", ended);
    el.addEventListener("touchcancel", ended);
    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", ended);
    return () => {
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", ended);
      el.removeEventListener("touchcancel", ended);
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", ended);
    };
    // On the phone shell, which arrives one render after this component does
    // and never changes again. Before it arrives there is no sheet to listen
    // to, and anything that changes more often than this tears the listeners
    // off mid-gesture.
  }, [frame]);

  if (!frame) return null;

  return createPortal(
    <div style={{ position: "absolute", inset: 0, zIndex: 240 }}>
      <div
        onClick={leave}
        style={{
          position: "absolute", inset: 0, background: "rgba(24,29,39,0.5)",
          opacity: shade, transition: drag ? "none" : "opacity .24s ease",
        }}
      />

      <div ref={sheet} style={{
        position: "absolute", left: 0, right: 0, bottom: 0, top,
        background: C.bg, borderRadius: top > 2 ? "18px 18px 0 0" : 0,
        overflow: "hidden", boxShadow: "0 -8px 30px rgba(16,24,40,0.28)",
        transition: drag ? "none" : "top .24s cubic-bezier(0.22,0.61,0.36,1), border-radius .2s",
      }}>
        <RegionDetail
          dest={dest}
          city={city}
          added={added}
          // Choosing the city is the answer the sheet was opened for, so the
          // sheet goes, whether it was opened from the map or from the list.
          onAdd={() => { onAdd?.(); leave(); }}
          onClose={leave}
          heroHeight={Math.round(h * 0.42)}
          sheetStop={stop === 0 ? "full" : "partial"}
          // Reading it is what opens it: the first scroll takes the sheet the
          // rest of the way up rather than moving the page under a half sheet.
          // Back at the top, a downward drag belongs to the sheet again.
          onScrollTop={(y) => {
            atTop.current = y <= 1;
            if (y > 4 && stop === 1) setStop(0);
          }}
        />

        {/* The handle. A drag starts here whichever way it is going, which is
            the only way up by hand; everywhere else on the sheet it has to be
            a downward pull from the top of the page. */}
        <div data-grab style={{
          position: "absolute", top: 0, left: "28%", right: "28%", height: 34,
          zIndex: 9, cursor: "grab", touchAction: "none",
          display: "grid", placeItems: "center",
        }}>
          <span style={{
            width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.85)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }} />
        </div>
      </div>
    </div>,
    frame
  );
}

// `title` is the step's question. The itinerary screen opens this same picker
// as its own screen with its own header bar, so there it passes none and keeps
// one title on the screen instead of two saying the same thing.
export default function RoutePicker({
  dest, nights, route, setRoute, nudge,
  title = "Choose the cities you want to visit",
  // What happens to the cities once they are chosen. True in the wizard,
  // where the order and the nights are ours; the route chooser overrides it,
  // because there the next screen hands the order back.
  nightsNote = "We'll set the order and nights. You can customise them once your itinerary is created.",
  // The "too much to see" warning compares the cities against the trip's
  // length. Off where the cities being picked are a pool to draw routes
  // from rather than the route itself, because then the length is not yet
  // a thing they are deciding.
  showFit = true,
}) {
  const areas = useMemo(() => destAreas[dest] || [], [dest]);
  // The region page opens over the step rather than navigating to it. Leaving
  // the wizard loses every answer given so far, and reading about Ubud is not
  // a reason to start again.
  const [reading, setReading] = useState(null);

  const cards = useMemo(
    () => areas.map((a, i) => ({ ...a, dest, img: areaImg(dest, a.city, i) })),
    [areas, dest]
  );
  const rec = useMemo(() => Object.fromEntries(areas.map((a) => [a.city, a.n])), [areas]);
  const canonical = useMemo(() => areas.map((a) => a.city), [areas]);
  const picked = useMemo(() => new Set(route.map((r) => r.city)), [route]);
  const note = useMemo(() => fit(route, rec, nights), [route, rec, nights]);

  // The regions hearted for this destination before the wizard was opened. A
  // mark on their cards, and one line under the question that opens them so
  // they can be added from here. Not pre-chosen: a save is interest, a pick is
  // a decision, and the nights are worked out from the picks.
  const { ofKind } = useWishlist();
  // With the card's photograph, so the sheet shows the place and not a blank.
  const savedRegions = useMemo(
    () => ofKind("region", dest).map((it) => ({ ...it, img: it.img || cards.find((c) => c.city === it.id)?.img || null })),
    [ofKind, dest, cards]
  );
  const savedCities = useMemo(() => new Set(savedRegions.map((i) => i.id)), [savedRegions]);

  // The saved cities come first, under their own heading, right here in the
  // list they are chosen from: nobody has to go somewhere else to find what
  // they already said they wanted. Within each group, chosen cities first, in
  // the order the trip runs them. Still nothing pre-ticked.
  const shown = useMemo(() => {
    const order = route.map((s) => s.city);
    const rank = (a) => (order.includes(a.city) ? order.indexOf(a.city) : 1000 + cards.indexOf(a));
    return [...cards].sort((a, b) => (savedCities.has(b.city) - savedCities.has(a.city)) || (rank(a) - rank(b)));
  }, [cards, route, savedCities]);
  const savedShown = shown.filter((a) => savedCities.has(a.city)).length;

  const seen = useRef(false);
  if (nudge) seen.current = true;

  // ─── How tall the map is ───
  //
  // All of the step bar a strip, so the sheet peeks at the bottom the way a
  // listing app's does: enough to show the handle and the count, and enough to
  // say there is a list down there to pull up.
  //
  // Measured off the step's scroll container, not off this component. Measuring
  // our own height is a loop: the sheet is as tall as the step, so the content
  // grows, so the measurement grows, so the map grows. And not vh either,
  // because inside the phone shell on a desktop the viewport is the window
  // rather than the screen we are drawing.
  const box = useRef(null);
  const scroller = useRef(null);
  const [H, setH] = useState(560);
  const [sized, setSized] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let sc = el.parentElement;
    while (sc && sc !== document.body) {
      const oy = getComputedStyle(sc).overflowY;
      if (oy === "auto" || oy === "scroll") break;
      sc = sc.parentElement;
    }
    if (!sc || sc === document.body) return;
    scroller.current = sc;
    const read = () => { const h = sc.clientHeight; if (h > 200) { setH(h); setSized(true); } };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(sc);
    return () => ro.disconnect();
  }, []);

  // ─── Where the sheet rests ───
  //
  // Three stops and no others: the strip at the foot that says how many cities
  // there are, halfway up with the list under the map, and all the way up with
  // the list on its own. The sheet settles on the nearest one when a flick ends
  // rather than being left wherever the finger happened to stop, which is what
  // makes it feel like a sheet instead of a long page. Past the top stop it is
  // an ordinary list again and nothing snaps.
  //
  // The title and the strip at the top of the sheet are measured rather than
  // guessed, because the sheet is pulled up over the map by exactly the
  // strip's height and a few pixels out shows as a gap or a clipped line.
  const head = useRef(null);
  const peek = useRef(null);
  const sheet = useRef(null);
  const frame = useRef(null);
  const [headH, setHeadH] = useState(56);
  const [peekH, setPeekH] = useState(56);
  useEffect(() => {
    const read = () => {
      const h = head.current?.offsetHeight;
      const p = peek.current?.offsetHeight;
      // Zero is a real answer when there is no title, so only a missing
      // measurement falls back to the default.
      if (h != null) setHeadH(h);
      if (p) setPeekH(p);
    };
    read();
    const ro = new ResizeObserver(read);
    if (head.current) ro.observe(head.current);
    if (peek.current) ro.observe(peek.current);
    return () => ro.disconnect();
  }, []);

  // The stops are read off the sheet itself at the moment they are needed
  // rather than worked out from the heights in state. The step is a different
  // height with the wizard's button under it than without, so a number worked
  // out while a card was up is the wrong number by the time the card is gone.
  // Half means half of what is under the title, so the map keeps its share of
  // the screen now that the title holds the top of it.
  const titlePx = useRef(56);
  titlePx.current = headH;
  const stops = useCallback(() => {
    const sc = scroller.current;
    const sh = sheet.current;
    if (!sc || !sh) return null;
    const up = sh.offsetTop;
    const t = titlePx.current;
    const mid = t + Math.round((sc.clientHeight - t) / 2);
    return [0, Math.max(0, up - mid), up];
  }, []);

  // The slide is animated here rather than handed to the browser. A native
  // smooth scroll gets dropped halfway whenever the map re-measures itself in
  // the same beat, and the sheet was landing back where it started.
  const anim = useRef(0);
  const settle = useRef(0);
  const busy = useRef(false);
  const goTo = useCallback((top, smooth) => {
    const sc = scroller.current;
    if (!sc) return;
    cancelAnimationFrame(anim.current);
    clearTimeout(settle.current);
    const from = sc.scrollTop;
    const by = top - from;
    if (!smooth || !by) { sc.scrollTop = top; busy.current = false; return; }
    const t0 = performance.now();
    busy.current = true;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 280);
      sc.scrollTop = from + by * (1 - Math.pow(1 - k, 3));
      if (k < 1) anim.current = requestAnimationFrame(step);
      else busy.current = false;
    };
    anim.current = requestAnimationFrame(step);
    // If the frames never arrive, which is what happens when the screen is not
    // being drawn, the sheet still has to end up where it was sent.
    settle.current = setTimeout(() => {
      if (busy.current) { sc.scrollTop = top; busy.current = false; }
    }, 340);
  }, []);
  useEffect(() => () => {
    cancelAnimationFrame(anim.current);
    clearTimeout(settle.current);
  }, []);

  const goStop = useCallback((i, smooth) => {
    const st = stops();
    if (st) goTo(st[i], smooth);
  }, [stops, goTo]);

  // How much of the map the sheet is sitting on, measured once the scroll has
  // come to rest. The map is framed against what is left, so the cities stay
  // in the part of it somebody can see.
  const [low, setLow] = useState(false);
  const [cover, setCover] = useState(0);
  useEffect(() => {
    const sc = scroller.current;
    if (!sc) return;
    let quiet;
    const rest = () => {
      const sh = sheet.current;
      const mp = frame.current;
      if (!sh || !mp) return;
      const top = sh.getBoundingClientRect().top;
      setCover(Math.max(0, Math.round(mp.getBoundingClientRect().bottom - top)));
      // Settle on the nearest stop, unless this is our own slide finishing or
      // the sheet is up and the list is being read.
      if (busy.current) return;
      const st = stops();
      if (!st || sc.scrollTop > st[2] + 4) return;
      const near = st.reduce((a, b) => (Math.abs(b - sc.scrollTop) < Math.abs(a - sc.scrollTop) ? b : a));
      if (Math.abs(near - sc.scrollTop) > 2) goTo(near, true);
    };
    const on = () => {
      setLow(sc.scrollTop < 24);
      clearTimeout(quiet);
      quiet = setTimeout(rest, 130);
    };
    on();
    rest();
    sc.addEventListener("scroll", on, { passive: true });
    return () => { sc.removeEventListener("scroll", on); clearTimeout(quiet); };
  }, [H, headH, peekH, stops, goTo]);

  // Land halfway, and not before the step has been measured: landing against
  // a guessed height puts the sheet in the wrong place and it stays there.
  const landed = useRef(false);
  useEffect(() => {
    if (landed.current || !sized || !scroller.current || !sheet.current) return;
    landed.current = true;
    goStop(1, false);
  }, [sized, peekH, headH, goStop]);

  // Cities go in the order the trip would run them, not the order they were
  // tapped, and the nights are shared out again every time. Nothing is ever
  // left unallocated, so nothing has to warn anybody that it is.
  const setCities = (cities) => setRoute(
    split(cities.sort((a, b) => canonical.indexOf(a) - canonical.indexOf(b)), rec, nights)
  );

  const toggle = (area) => {
    const has = picked.has(area.city);
    setCities(has
      ? route.filter((s) => s.city !== area.city).map((s) => s.city)
      : [...route.map((s) => s.city), area.city]);
  };

  return (
    <div ref={box} style={{ position: "relative" }}>
      {/* The same question the other steps ask, asked the same way. It stays at
          the top of the screen while the map and the sheet move under it, and
          goes only when the sheet comes all the way up and the list is the
          whole screen. */}
      <div ref={head} style={{
        position: "sticky", top: 0, zIndex: 1, background: C.white,
        padding: title ? "14px 16px 12px" : 0,
      }}>
        {title && (
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: C.head, letterSpacing: "-0.4px", lineHeight: 1.22 }}>
            {title}
          </h1>
        )}
      </div>

      {/* ─── The map, and most of the screen ───
          Not behind a button, and not a strip at the top. A couple choosing
          between six parts of an island is asking where those places are, and
          the map is the answer rather than an illustration of it. It stays put
          while the sheet slides up over it. */}
      <div ref={frame} style={{ position: "sticky", top: headH, zIndex: 0 }}>
        <CityMap
          cards={cards}
          picked={picked}
          // A pin opens the same sheet the list's View details opens. One
          // surface for one question: what is this place and do we want it.
          onOpen={(city) => setReading(city)}
          height={H - headH}
          covered={cover}
        />
      </div>

      {/* ─── And the cities, on a sheet that pulls up over it ───
          Pulled up over the map by its own strip, so at the foot of the scroll
          the only thing showing is the count and the handle above it: the map
          has the screen under the title, and the line says there is a list
          below. At the top stop it comes over the title too. */}
      <div ref={sheet} style={{
        position: "relative", zIndex: 2, marginTop: -peekH, background: C.white,
        borderRadius: "20px 20px 0 0", minHeight: H,
        boxShadow: "0 -6px 24px rgba(16,24,40,0.12)",
      }}>
        <div ref={peek}>
          <div style={{ display: "flex", justifyContent: "center", padding: "9px 0 0" }}>
            <span style={{ width: 38, height: 4, borderRadius: 99, background: C.div }} />
          </div>

          {/* The one line a peeking sheet has room for, and the same line the
              listing apps put there: how much is down here. */}
          <p style={{
            margin: 0, padding: `10px ${PAD}px 12px`, fontSize: 14.5, fontWeight: 800,
            color: C.head, textAlign: "center", letterSpacing: "-0.2px",
          }}>
            {cards.length} cities in {dest}
            {savedShown > 0 && <span style={{ color: C.p600 }}> · {savedShown} saved</span>}
          </p>
        </div>

        <div style={{ padding: `4px ${PAD}px 16px`, borderTop: `1px solid ${C.div}` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
            {shown.map((a, i) => (
              <div key={a.city} style={{ display: "contents" }}>
                {savedShown > 0 && i === 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 -2px" }}>
                    <Heart size={16} color={C.p600} fill={C.p600} />
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.head }}>From your wishlist</p>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.p600 }}>{savedShown} saved</span>
                  </div>
                )}
                {savedShown > 0 && i === savedShown && (
                  <p style={{ margin: "8px 0 -2px", paddingTop: 16, borderTop: `1px solid ${C.div}`, fontSize: 15, fontWeight: 800, color: C.head }}>
                    All cities in {dest}
                  </p>
                )}
                <CityCard
                  area={a}
                  picked={picked.has(a.city)}
                  saved={savedCities.has(a.city)}
                  onToggle={() => toggle(a)}
                  onOpen={() => setReading(a.city)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── What they have chosen ───
          Pinned above the wizard's own button. The nights are not on the chips:
          they are ours to work out and nobody picking Ubud is choosing a
          number. The line above only appears when there is something wrong
          with the choice, which is when there are more cities than the trip can
          hold; a line that is always there is one nobody reads. */}
      {route.length > 0 && !low && (
        <div style={{
          position: "sticky", bottom: 0, zIndex: 20,
          background: C.white, borderTop: `1px solid ${C.div}`,
          padding: `10px ${PAD}px 12px`,
          boxShadow: "0 -2px 10px rgba(24,29,39,0.05)",
        }}>
          {showFit && note.kind === "over" && (
            <p style={{
              margin: "0 0 9px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontSize: 12.5, fontWeight: 700, color: "#B54708", textAlign: "center",
            }}>
              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
              {note.text}
            </p>
          )}

          <div className="hide-scrollbar" style={{ display: "flex", gap: 7, overflowX: "auto" }}>
            {route.map((s) => (
              <span key={s.city} style={{
                flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
                background: C.p100, borderRadius: 999, padding: "6px 8px 6px 12px",
                fontSize: 12.5, fontWeight: 700, color: C.p900, whiteSpace: "nowrap",
              }}>
                {s.city}
                <button
                  onClick={() => toggle({ city: s.city })}
                  aria-label={`Remove ${s.city}`}
                  style={{
                    width: 17, height: 17, borderRadius: "50%", border: "none", flexShrink: 0,
                    background: "rgba(192,8,64,0.14)", display: "grid", placeItems: "center",
                    cursor: "pointer", padding: 0,
                  }}
                ><X size={11} color={C.p900} strokeWidth={3} /></button>
              </span>
            ))}
          </div>
          {/* The order and the nights are ours. Said once, under the cities,
              with where it can be changed, so nobody looks for it here. */}
          <p data-testid="route-note" style={{ margin: "7px 2px 0", fontSize: 10.5, lineHeight: "14px", color: C.sub }}>
            {nightsNote}
          </p>
        </div>
      )}

      {/* The region page gets the same add button the cards have, because
          somebody who has just read about Ubud should not have to come back
          out to choose it. */}
      {reading && (
        <RegionSheet
          key={reading}
          dest={dest}
          city={reading}
          added={picked.has(reading)}
          onAdd={() => toggle({ city: reading })}
          onClose={() => setReading(null)}
        />
      )}
    </div>
  );
}
