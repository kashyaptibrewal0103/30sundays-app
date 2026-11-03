import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  X as XIcon, Plus, Minus, Plane, Car, Ship, GripVertical, Trash2, AlertTriangle, Undo2, Info, Map as MapIcon, Route as RouteIcon,
} from "lucide-react";
import { C } from "../../data";
import { destAreas, areaImg, routeNights, destMeta } from "../../data/buildData";
import { hop, hhmm, arrivalAirport, airportCity, routeIssue, travelMinutes } from "../../data/routeBuilder";
import {
  endCost, moveOutcome, insertCost, removeIssue, checkRoute, nightsWord, hubCity, nearestAirport,
} from "../../data/routeRules";
import RouteMap from "../wizard/RouteMap";
import AddCitySheet from "./AddCitySheet";
import BuildingScreen from "../BuildingScreen";

// ─── Changing the cities ───
//
// The wizard asked which cities; we put them in order and shared the nights
// out. This is where somebody who has done their reading changes that: the
// order, the nights in each city, which city goes and which comes in.
//
// It opens as a plain full screen: the header fixed at the top, the list
// scrolling under it. Map, in the header, turns it into the wizard's city
// step for as long as it is wanted: the map behind, the list on a sheet over
// it with three places to rest (down, halfway, up). Pull the sheet all the
// way up, or tap Close map, and it is the plain screen again, at the same
// place in the list. The list reads the way the trip runs: the airport you
// land at, each city, how you get to the next one, the airport you fly home
// from. The number on each city is the handle.
//
// Nothing is explained up front. A drag that cannot be flown snaps back and
// says why. A city added somewhere that costs says what it costs, with our
// suggestion as a button and a way to keep it anyway. Whatever is kept anyway
// and cannot be booked is listed at Save, each line pointing at its row.

const PAD = 16;
const RAIL = 36;
const MODE_ICON = { flight: Plane, car: Car, boat: Ship };
const MODE_WORD = { flight: "By air", car: "By road", boat: "By boat" };

const fmtDay = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const pill = (on = true) => ({
  padding: "7px 13px", borderRadius: 999, border: `1.5px solid ${on ? C.p600 : C.div}`,
  background: C.white, color: on ? C.p600 : C.sub, fontSize: 12, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
  display: "inline-flex", alignItems: "center", gap: 5,
});
const solid = {
  ...pill(), background: C.p600, color: "#fff", border: `1.5px solid ${C.p600}`,
};
const quiet = {
  padding: "7px 12px", borderRadius: 999, border: "none", background: "none",
  color: C.sub, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};

const roundBtn = (on) => ({
  width: 26, height: 26, borderRadius: "50%", border: `1px solid ${on ? C.div : "transparent"}`,
  background: on ? C.white : C.bg, display: "grid", placeItems: "center",
  cursor: on ? "pointer" : "default", padding: 0, flexShrink: 0,
});

function Nights({ n, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <button onClick={() => onChange(n - 1)} disabled={n <= 1} aria-label="One night fewer" style={roundBtn(n > 1)}>
        <Minus size={13} color={n > 1 ? C.head : C.inact} strokeWidth={2.6} />
      </button>
      <span style={{ minWidth: 54, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: C.head }}>{nightsWord(n)}</span>
      <button onClick={() => onChange(n + 1)} aria-label="One night more" style={roundBtn(true)}>
        <Plus size={13} color={C.head} strokeWidth={2.6} />
      </button>
    </div>
  );
}

// The airport at either end. When the first or last city is a drive from it,
// that drive is the one line said here, because it is part of the first or
// last day and nothing else on the screen would say it.
function AirNode({ label, air, city, cost }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0, zIndex: 1,
        background: "#EAF2FE", border: "2px solid #fff", boxShadow: "0 0 0 1px #D6E4FB",
        display: "grid", placeItems: "center",
      }}><Plane size={15} color="#1570EF" /></span>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <p style={{ margin: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: C.inact }}>{label}</p>
        <p style={{ margin: "1px 0 0", fontSize: 13.5, fontWeight: 700, color: C.head }}>
          {air ? `${air.name} (${air.code})` : `${city} airport`}
        </p>
        {cost && (
          <p style={{ margin: "3px 0 0", fontSize: 11.5, lineHeight: "16px", color: C.sub }}>{cost.text}</p>
        )}
      </div>
    </div>
  );
}

// Between two stops: how you get from one to the next, as the icon alone on
// the line, and the way to put a city in between, small, on the right.
function Between({ mode, gap, onAdd }) {
  const Icon = mode ? MODE_ICON[mode] || Car : null;
  return (
    <div style={{ display: "flex", alignItems: "center", height: 34 }}>
      <span style={{ width: 32, display: "grid", placeItems: "center", flexShrink: 0, zIndex: 1 }}>
        {Icon && (
          <span aria-label={MODE_WORD[mode] || "Transfer"} title={MODE_WORD[mode]} style={{
            width: 24, height: 24, borderRadius: "50%", background: C.white, border: `1px solid ${C.div}`,
            display: "grid", placeItems: "center",
          }}><Icon size={12} color={C.sub} /></span>
        )}
      </span>
      <span style={{ flex: 1 }} />
      <button
        onClick={onAdd}
        data-testid={`route-add-${gap}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 2px 5px 4px",
          border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
          color: C.sub, fontSize: 11.5, fontWeight: 700,
        }}
      ><Plus size={12} strokeWidth={3} color={C.p600} /> Add a city</button>
    </div>
  );
}

// ─── A message at the foot ───
//
// An icon in a ring, a one-line title, the reason under it. When there is
// something to do about it, the actions sit on a row underneath: ours as a
// solid button, keeping it as text. When all there is to do is put it away,
// that is a small close at the end of the title row, not a row of its own.
const TONE = {
  block: { bg: "#FEF3F2", bd: "#FDA29B", fg: "#B42318", Icon: AlertTriangle },
  warn: { bg: "#FFFAEB", bd: "#FEC84B", fg: "#B54708", Icon: AlertTriangle },
  info: { bg: "#EFF4FF", bd: "#C7D7FE", fg: "#1570EF", Icon: Info },
};
function Note({ kind = "warn", title, text, actions = [], onDismiss, dismissLabel = "Got it", testid }) {
  const t = TONE[kind] || TONE.warn;
  const bare = actions.length === 0;
  return (
    <div data-testid={testid} style={{ marginBottom: 10, padding: "10px 12px", borderRadius: 14, background: t.bg, border: `1px solid ${t.bd}` }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: C.white, display: "grid", placeItems: "center", flexShrink: 0, boxShadow: `0 0 0 1px ${t.bd}` }}>
          <t.Icon size={13} color={t.fg} />
        </span>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
          {title && <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.head, lineHeight: "17px" }}>{title}</p>}
          <p style={{ margin: title ? "2px 0 0" : 0, fontSize: 12, lineHeight: "17px", color: C.sub }}>{text}</p>
        </div>
        {bare && (
          <button onClick={onDismiss} aria-label={dismissLabel} style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "none", display: "grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0, marginRight: -4 }}>
            <XIcon size={15} color={C.sub} />
          </button>
        )}
      </div>
      {!bare && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 9, paddingLeft: 36 }}>
          {actions.map((a) => (
            <button key={a.label} onClick={a.onClick} style={a.primary ? solid : pill()}>{a.icon}{a.label}</button>
          ))}
          <button onClick={onDismiss} style={quiet}>{dismissLabel}</button>
        </div>
      )}
    </div>
  );
}

export default function RouteEditor({
  dest, route: initial, startDate, onSave, onClose,
  // Whether a trip may start or finish somewhere a long drive from an airport.
  strictEnds = false,
  // Whether this screen shows the building screen itself before handing the
  // route over. The itinerary screen has its own, shared with dates and
  // travellers, so it turns this off.
  buildOnSave = true,
  // The itinerary says "Change cities"; the wizard, where the route is being
  // set for the first time, says so.
  title = "Change cities",
  saveLabel = "Save changes",
  frame,
}) {
  const areas = destAreas[dest] || [];
  const rec = Object.fromEntries(areas.map((a) => [a.city, a.n]));
  const [route, setRoute] = useState(initial);
  const [note, setNote] = useState(null);
  const [drag, setDrag] = useState(null);
  const [adding, setAdding] = useState(null);
  const [problems, setProblems] = useState(null);
  const [building, setBuilding] = useState(false);
  const dragRef = useRef(null);
  const rows = useRef([]);
  const rects = useRef([]);

  const cities = route.map((s) => s.city);
  const total = routeNights(route);
  const first = cities[0];
  const last = cities[cities.length - 1];
  const inAir = first ? arrivalAirport(dest, first) : null;
  const outAir = last ? arrivalAirport(dest, last) : null;
  const startCost = endCost(dest, first, "start");
  const endC = endCost(dest, last, "end");
  const minNights = destMeta[dest]?.minNights || 1;
  const changed = JSON.stringify(route) !== JSON.stringify(initial);
  // No cities at all: the route is being built from nothing, which gets a
  // screen of its own rather than an airport line with nothing between.
  const empty = route.length === 0;
  // More cities than the nights can carry: under two nights a city, on
  // average, is a move every day or two. Said on the sheet for as long as it
  // is true, not as a note that goes when the next thing happens.
  const crowdedKey = `${route.length}-${total}`;
  const [crowdedSeen, setCrowdedSeen] = useState(null);
  const crowded = route.length >= 3 && total < route.length * 2 && crowdedSeen !== crowdedKey;

  // The start date is theirs already. The end date follows the nights.
  const start = startDate ? new Date(startDate) : null;
  const end = start ? new Date(start.getTime() + total * 86400000) : null;

  const setOrder = (order) => setRoute((r) => order.map((c) => r.find((s) => s.city === c) || { city: c, n: rec[c] || 2 }).filter(Boolean));
  const setN = (city, n) => setRoute((r) => r.map((s) => (s.city === city ? { ...s, n: Math.max(1, n) } : s)));

  // ─── The map, and the sheet over it ───
  //
  // Off until Map is tapped. On, it is the wizard's mechanism: the whole thing
  // scrolls, the header and the map are sticky at the top, and the list is a
  // sheet that scrolls up over the map. Three stops: the sheet peeking at the
  // foot (the map has the screen), halfway, and up under the header. It
  // settles on the nearest one when a drag ends. At the top stop the map is
  // out of sight, so that is where the map mode ends and the plain screen
  // takes over, carrying the list's scroll position across.
  const [mapMode, setMapMode] = useState(false);
  const scroller = useRef(null);
  const head = useRef(null);
  const peek = useRef(null);
  const sheet = useRef(null);
  const mapBox = useRef(null);
  const [H, setH] = useState(560);
  const [headH, setHeadH] = useState(58);
  const [peekH, setPeekH] = useState(52);
  // How much of the map the sheet is sitting on. Starts as the halfway value,
  // because that is where the map is first seen.
  const [cover, setCover] = useState(null);
  const halfCover = Math.round((H - headH) / 2);

  useEffect(() => {
    const sc = scroller.current;
    if (!sc) return;
    const read = () => {
      const h = sc.clientHeight;
      if (h > 200) setH(h);
      if (head.current) setHeadH(head.current.offsetHeight);
      if (peek.current) setPeekH(peek.current.offsetHeight);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(sc);
    if (head.current) ro.observe(head.current);
    return () => ro.disconnect();
  }, []);

  const headPx = useRef(58);
  headPx.current = headH;
  const stops = useCallback(() => {
    const sc = scroller.current;
    const sh = sheet.current;
    if (!sc || !sh) return null;
    const up = sh.offsetTop;
    const t = headPx.current;
    const mid = t + Math.round((sc.clientHeight - t) / 2);
    return [0, Math.max(0, up - mid), Math.max(0, up - t)];
  }, []);

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
    settle.current = setTimeout(() => {
      if (busy.current) { sc.scrollTop = top; busy.current = false; }
    }, 340);
  }, []);
  useEffect(() => () => { cancelAnimationFrame(anim.current); clearTimeout(settle.current); }, []);

  const goStop = useCallback((i, smooth) => {
    const st = stops();
    if (st) goTo(st[i], smooth);
  }, [stops, goTo]);

  // Where the list was, carried across the switch in either direction.
  const carry = useRef(0);
  const openMap = () => { carry.current = scroller.current?.scrollTop || 0; setMapMode(true); };
  const closeMap = () => goStop(2, true);

  useLayoutEffect(() => {
    const sc = scroller.current;
    if (!sc) return;
    if (mapMode) {
      if (peek.current) setPeekH(peek.current.offsetHeight);
      const st = stops();
      if (!st) return;
      // Start where the plain list was, with the sheet up, and slide down to
      // halfway so the map comes into view rather than appearing.
      sc.scrollTop = st[2] + carry.current;
      goTo(st[1], true);
    } else {
      sc.scrollTop = carry.current;
    }
  }, [mapMode, stops, goTo]);

  useEffect(() => {
    const sc = scroller.current;
    if (!sc || !mapMode) return;
    let quietT;
    const rest = () => {
      const sh = sheet.current;
      const mp = mapBox.current;
      if (!sh || !mp) return;
      const covered = Math.max(0, Math.round(mp.getBoundingClientRect().bottom - sh.getBoundingClientRect().top));
      // Only while enough of the map shows to be worth framing.
      if (mp.offsetHeight - covered >= 120) setCover(covered);
      if (busy.current || dragRef.current) return;
      const st = stops();
      if (!st) return;
      // All the way up: the map is gone from view, so the map mode goes too.
      if (sc.scrollTop >= st[2] - 2) { carry.current = sc.scrollTop - st[2]; setMapMode(false); return; }
      const near = st.reduce((a, b) => (Math.abs(b - sc.scrollTop) < Math.abs(a - sc.scrollTop) ? b : a));
      if (Math.abs(near - sc.scrollTop) > 2) goTo(near, true);
    };
    const on = () => { clearTimeout(quietT); quietT = setTimeout(rest, 130); };
    sc.addEventListener("scroll", on, { passive: true });
    return () => { sc.removeEventListener("scroll", on); clearTimeout(quietT); };
  }, [mapMode, H, headH, peekH, stops, goTo]);

  useEffect(() => { if (empty && mapMode) { carry.current = 0; setMapMode(false); } }, [empty, mapMode]);

  // The handle on the sheet: down to the map when the list is up, otherwise up.
  const toggleSheet = () => {
    const st = stops();
    const sc = scroller.current;
    if (!st || !sc) return;
    goTo(sc.scrollTop >= st[2] - 4 ? st[1] : st[2], true);
  };

  // ─── Moving ───
  const applyMove = (from, to) => {
    if (to === from || to < 0 || to >= route.length) return;
    const next = [...cities];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    const out = moveOutcome(dest, cities, next, { strictEnds });
    if (out.kind === "block") { setNote({ ...out, title: "That cannot be flown" }); return; }
    setOrder(next);
    setNote(out.kind === "warn" ? { ...out, title: "That order costs more travelling" } : null);
  };

  const startDrag = (i) => (e) => {
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* no active pointer */ }
    rects.current = rows.current.slice(0, route.length).map((el) => el?.getBoundingClientRect());
    const d = { from: i, to: i, dy: 0, y0: e.clientY };
    dragRef.current = d;
    setDrag(d);
  };
  const moveDrag = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const r = rects.current;
    if (!r[d.from]) return;
    const dy = e.clientY - d.y0;
    // The finger is the thing being placed, not the card's centre.
    const y = e.clientY;
    const live = r.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
    let to = d.from;
    if (y < r[live[0]].top) to = live[0];
    else if (y > r[live[live.length - 1]].bottom) to = live[live.length - 1];
    else for (const i of live) { if (y >= r[i].top && y <= r[i].bottom) { to = i; break; } }
    const next = { ...d, dy, to };
    dragRef.current = next;
    setDrag(next);
  };
  const endDrag = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (d) applyMove(d.from, d.to);
  };
  const shift = (i) => {
    if (!drag) return 0;
    const h = rects.current[drag.from]?.height || 0;
    if (i === drag.from) return drag.dy;
    if (drag.to > drag.from && i > drag.from && i <= drag.to) return -h;
    if (drag.to < drag.from && i < drag.from && i >= drag.to) return h;
    return 0;
  };

  // ─── Adding ───
  //
  // Any city can go anywhere. What follows is the one message about it: what
  // it needs or what it costs, our suggestion as a button, and a way to keep
  // it as it is. Anything kept that cannot be booked comes up again at Save.
  const insert = (city, gap) => {
    const n = rec[city] || 2;
    const trial = [...cities.slice(0, gap), city, ...cities.slice(gap)];
    setRoute((r) => [...r.slice(0, gap), { city, n }, ...r.slice(gap)]);

    const hub = hubCity(dest, city);
    if (hub && !cities.includes(hub)) {
      setNote({
        kind: "warn", title: `${city} needs ${hub} on the trip`,
        text: `${city} has no flights of its own. It connects through ${hub}, which is not on the trip. We would add ${hub} next to it.`,
        addHub: { hub, city }, addLabel: `Add ${hub}`, keepLabel: "Keep as it is",
      });
      return;
    }
    const issue = routeIssue(dest, trial);
    if (issue) {
      const out = moveOutcome(dest, trial, trial, { strictEnds });
      setNote({ kind: "warn", title: `${city} belongs beside ${issue.hub}`, text: out.text, move: out.move, moveLabel: out.moveLabel, keepLabel: "Keep it here" });
      return;
    }
    const parts = [];
    if (!airportCity(dest, city)) {
      const which = gap === 0 ? "start" : gap === cities.length ? "end" : null;
      const ec = which ? endCost(dest, city, which) : null;
      const near = nearestAirport(dest, city);
      if (ec) parts.push(ec.text);
      else if (near?.mins) parts.push(`${city} has no airport of its own. You get there by road, about ${hhmm(near.mins)} from ${near.city}.`);
    }
    const cost = insertCost(dest, cities, city, gap, { strictEnds });
    if (cost) parts.push(`Here it adds about ${hhmm(cost.extra)} of travelling compared with putting it ${cost.beside}.`);
    if (!parts.length) { setNote(null); return; }
    setNote(cost
      ? { kind: "warn", title: `${city} is better ${cost.beside}`, text: parts.join(" "), move: cost.order, moveLabel: `Put it ${cost.beside}`, keepLabel: "Keep it here" }
      : { kind: "info", title: `${city} has no airport`, text: `${parts.join(" ")} This is the best place for it.` });
  };
  const addHub = ({ hub, city }) => {
    const i = cities.indexOf(city);
    const a = [...cities.slice(0, i), hub, ...cities.slice(i)];
    const b = [...cities.slice(0, i + 1), hub, ...cities.slice(i + 1)];
    setOrder(travelMinutes(dest, a) <= travelMinutes(dest, b) ? a : b);
    setNote(null);
  };

  // ─── Removing ───
  const remove = (city) => {
    const issue = removeIssue(dest, cities, city);
    const undo = route;
    setRoute((r) => r.filter((s) => s.city !== city));
    setNote(issue ? {
      kind: "warn", title: `${issue.stranded.join(" and ")} need${issue.stranded.length === 1 ? "s" : ""} ${city}`, text: issue.text,
      undoRoute: undo, undoLabel: `Keep ${city}`,
      alsoRemove: issue.stranded, alsoLabel: `Remove ${issue.stranded.join(" and ")} too`,
    } : null);
  };

  // ─── Saving ───
  const save = () => {
    const { blocks } = checkRoute(dest, route, { strictEnds });
    if (blocks.length) { setProblems({ blocks }); return; }
    if (buildOnSave) setBuilding(true);
    else onSave(route);
  };
  const showRow = (city) => {
    setProblems(null);
    if (mapMode) goStop(2, true);
    const i = cities.indexOf(city);
    const el = rows.current[i];
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("point-at");
      void el.offsetWidth;
      el.classList.add("point-at");
      setTimeout(() => el.classList.remove("point-at"), 2600);
    }, 320);
  };

  const shell = frame
    ? { ...frame, zIndex: 170 }
    : { position: "absolute", inset: 0 };

  // What a note offers, as buttons: ours first, solid.
  const noteActions = note ? [
    note.undo && { label: "Put it back", icon: <Undo2 size={13} />, primary: true, onClick: () => { setOrder(note.undo); setNote(null); } },
    note.undoRoute && { label: note.undoLabel, icon: <Undo2 size={13} />, primary: true, onClick: () => { setRoute(note.undoRoute); setNote(null); } },
    note.move && note.moveLabel && { label: note.moveLabel, primary: true, onClick: () => { setOrder(note.move); setNote(null); } },
    note.addHub && { label: note.addLabel, primary: true, onClick: () => addHub(note.addHub) },
    note.alsoRemove && { label: note.alsoLabel, onClick: () => { setRoute((r) => r.filter((s) => !note.alsoRemove.includes(s.city))); setNote(null); } },
  ].filter(Boolean) : [];

  return (
    <div style={{ ...shell, background: C.white, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div ref={scroller} className="hide-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: "auto", position: "relative", touchAction: drag ? "none" : "auto" }}>
        {/* ─── Header: stays over everything ─── */}
        <div ref={head} style={{ position: "sticky", top: 0, zIndex: 3, display: "flex", alignItems: "center", gap: 10, padding: "calc(10px + env(safe-area-inset-top)) 14px 10px", background: C.white, borderBottom: `1px solid ${C.div}` }}>
          <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <XIcon size={17} color={C.head} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: C.head, letterSpacing: "-0.2px" }}>{title}</p>
            <p data-testid="route-summary" style={{ margin: "1px 0 0", fontSize: 11.5, color: total < minNights ? "#B42318" : C.sub, fontWeight: total < minNights ? 700 : 400 }}>
              {empty ? "No cities yet" : `${route.length} ${route.length === 1 ? "city" : "cities"}`}
              {empty ? (start ? ` · starts ${fmtDay(start)}` : "") : start && end ? ` · ${fmtDay(start)} to ${fmtDay(end)}` : ` · ${nightsWord(total)}`}
            </p>
          </div>
          {!empty && (
            <button onClick={mapMode ? closeMap : openMap} data-testid="route-map" aria-label={mapMode ? "Close the map" : "See the route on a map"} style={{ ...pill(), padding: "7px 10px 7px 9px" }}>
              {mapMode ? <><XIcon size={14} /> Close map</> : <><MapIcon size={14} /> Map</>}
            </button>
          )}
        </div>

        {/* ─── The map, only while it is wanted, with the sheet sliding over it ─── */}
        {mapMode && (
          <div ref={mapBox} style={{ position: "sticky", top: headH, zIndex: 0, isolation: "isolate", height: H - headH, background: "#AADAFF" }}>
            <RouteMap dest={dest} route={route} height={H - headH} times={false} covered={cover ?? halfCover} interactive />
          </div>
        )}

        {/* ─── The route: a plain list, or a sheet over the map ─── */}
        <div ref={sheet} data-testid="route-sheet" style={mapMode ? {
          position: "relative", zIndex: 2, marginTop: -peekH, background: C.white,
          borderRadius: "20px 20px 0 0", minHeight: H, boxShadow: "0 -6px 24px rgba(16,24,40,0.12)",
        } : { position: "relative", background: C.white }}>
          {mapMode && (
            <div ref={peek} onClick={toggleSheet} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "center", padding: "9px 0 0" }}>
                <span style={{ width: 38, height: 4, borderRadius: 99, background: C.div }} />
              </div>
              <p style={{ margin: 0, padding: `8px ${PAD}px 10px`, fontSize: 14.5, fontWeight: 800, color: C.head, textAlign: "center", letterSpacing: "-0.2px" }}>
                Your cities
              </p>
            </div>
          )}

          {empty ? (
            /* ─── From nothing ───
                Every city taken out, which is how somebody starts over. One
                way in: the first city, and the list takes over from there. */
            <div data-testid="route-empty" style={{ padding: "48px 28px 28px", textAlign: "center" }}>
              <span style={{ width: 64, height: 64, borderRadius: "50%", background: C.p100, display: "inline-grid", placeItems: "center" }}>
                <RouteIcon size={28} color={C.p600} />
              </span>
              <p style={{ margin: "18px 0 0", fontSize: 18, fontWeight: 800, color: C.head, letterSpacing: "-0.3px" }}>Build your route from scratch</p>
              <p style={{ margin: "8px auto 0", fontSize: 13, lineHeight: "19px", color: C.sub, maxWidth: 290 }}>
                Add the cities you want to stay in, in the order you will visit them. We put in the airports and the way between them.
              </p>
              <button onClick={() => setAdding(0)} data-testid="route-empty-add" style={{ width: "100%", marginTop: 24, padding: "14px 0", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <Plus size={17} strokeWidth={2.6} /> Add your first city
              </button>
            </div>
          ) : (
          <div style={{ padding: `16px ${PAD}px 28px`, borderTop: mapMode ? `1px solid ${C.div}` : "none", position: "relative" }}>
            <span style={{ position: "absolute", left: PAD + 15, top: 32, bottom: 44, width: 2, background: C.div, borderRadius: 2 }} />

            <AirNode label="You land at" air={inAir} city={first} cost={startCost} />
            <Between gap={0} onAdd={() => setAdding(0)} />

            {route.map((s, i) => {
              const ai = Math.max(0, areas.findIndex((a) => a.city === s.city));
              const held = drag?.from === i;
              const next = route[i + 1];
              const leg = next ? hop(dest, s.city, next.city) : null;
              return (
                <div
                  key={s.city}
                  ref={(el) => { rows.current[i] = el; }}
                  data-route-row={s.city}
                  style={{
                    transform: `translateY(${shift(i)}px)`,
                    transition: held ? "none" : "transform .18s ease",
                    position: "relative", zIndex: held ? 5 : 1, borderRadius: 14,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* The number is the handle. */}
                    <span
                      onPointerDown={startDrag(i)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      role="button"
                      aria-label={`Move ${s.city}`}
                      data-testid={`route-handle-${s.city}`}
                      style={{
                        width: 32, flexShrink: 0, paddingTop: 5, paddingBottom: 5, borderRadius: 11,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                        background: held ? C.p600 : C.p100,
                        border: `2px solid ${held ? C.p600 : "#fff"}`,
                        boxShadow: held ? "0 4px 12px rgba(227,27,83,.35)" : "0 0 0 1px #F7CEDC",
                        cursor: "grab", touchAction: "none", zIndex: 1, userSelect: "none",
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 800, color: held ? "#fff" : C.p900, lineHeight: 1 }}>{i + 1}</span>
                      <GripVertical size={12} color={held ? "#fff" : C.p300} />
                    </span>

                    <div style={{
                      flex: 1, minWidth: 0, background: C.white, borderRadius: 14, padding: "8px 8px 8px 8px",
                      border: `1px solid ${held ? C.p600 : C.div}`,
                      boxShadow: held ? "0 8px 22px rgba(24,29,39,0.18)" : "0 1px 2px rgba(24,29,39,0.04)",
                      display: "flex", gap: 8, alignItems: "center",
                    }}>
                      <img src={areaImg(dest, s.city, ai)} alt="" style={{ width: 36, height: 36, borderRadius: 9, objectFit: "cover", flexShrink: 0, background: "#F4F2F0" }} />
                      <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800, color: C.head, letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.city}</p>
                      <Nights n={s.n} onChange={(n) => setN(s.city, n)} />
                      <button
                        onClick={() => remove(s.city)}
                        aria-label={`Remove ${s.city}`}
                        data-testid={`route-remove-${s.city}`}
                        style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, border: "none", background: "none", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}
                      ><Trash2 size={15} color={C.inact} /></button>
                    </div>
                  </div>

                  <Between mode={leg?.mode} gap={i + 1} onAdd={() => setAdding(i + 1)} />
                </div>
              );
            })}

            <AirNode label="You fly home from" air={outAir} city={last} cost={endC} />
          </div>
          )}
        </div>
      </div>

      {/* ─── Footer: the note, then Save. Not on the empty screen, which has
          its own one thing to do. ─── */}
      {!empty && (
      <div style={{ flexShrink: 0, background: C.white, borderTop: `1px solid ${C.div}`, padding: `10px ${PAD}px calc(12px + env(safe-area-inset-bottom))`, position: "relative", zIndex: 4 }}>
        {note && (
          <Note
            testid="route-note"
            kind={note.kind}
            title={note.title}
            text={note.text}
            actions={noteActions}
            onDismiss={() => setNote(null)}
            dismissLabel={note.keepLabel || (noteActions.length ? "Keep it" : "Got it")}
          />
        )}
        {!note && crowded && (
          <Note
            testid="route-crowded"
            kind="warn"
            title={`${route.length} cities in ${nightsWord(total)} is a lot of moving`}
            text="That is a new hotel every day or two. Most couples keep to 2 or 3 nights in each city, so take a city out or add nights."
            onDismiss={() => setCrowdedSeen(crowdedKey)}
          />
        )}
        <button
          data-testid="route-save"
          onClick={save}
          disabled={!changed || empty}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: changed && !empty ? C.p600 : C.div, color: changed && !empty ? "#fff" : C.inact,
            fontSize: 15, fontWeight: 700, cursor: changed && !empty ? "pointer" : "not-allowed", fontFamily: "inherit",
          }}
        >{saveLabel}</button>
      </div>
      )}

      {building && (
        <BuildingScreen
          dest={dest}
          cities={cities}
          onDone={() => { setBuilding(false); onSave(route); }}
        />
      )}

      {adding != null && (
        <AddCitySheet
          dest={dest} route={route} gap={adding}
          onAdd={(city, gap) => { insert(city, gap); setAdding(null); }}
          onClose={() => setAdding(null)}
        />
      )}

      {/* ─── Before we save ───
          The things that have to change, each pointing at its row. */}
      {problems && (
        <div style={{ position: "absolute", inset: 0, zIndex: 95, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setProblems(null)} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)" }} />
          <div data-testid="route-problems" style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", padding: "10px 18px calc(18px + env(safe-area-inset-bottom))" }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: C.div, margin: "0 auto 14px" }} />
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head, letterSpacing: "-0.3px" }}>
              {problems.blocks.length === 1 ? "One thing to fix first" : `${problems.blocks.length} things to fix first`}
            </p>
            <p style={{ margin: "3px 0 12px", fontSize: 12.5, color: C.sub }}>This route cannot be booked as it is.</p>
            {problems.blocks.map((b) => (
              <div key={b.key} style={{ display: "flex", gap: 9, padding: "10px 12px", borderRadius: 12, background: "#FEF3F2", border: "1px solid #FDA29B", marginBottom: 8 }}>
                <AlertTriangle size={14} color="#B42318" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: "17px", color: C.head }}>{b.text}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                    {b.fix && <button onClick={() => { setOrder(b.fix); setProblems(null); setNote(null); }} style={solid}>{b.fixLabel}</button>}
                    {b.city && <button onClick={() => showRow(b.city)} style={quiet}>Show me</button>}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setProblems(null)} style={{ width: "100%", marginTop: 14, padding: "13px 0", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Back to the route
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
