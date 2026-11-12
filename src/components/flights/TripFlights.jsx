import { useState, useEffect, useMemo, useRef } from "react";
import { PlaneTakeoff, PlaneLanding, Plane, Plus, X as XIcon, Check, ChevronRight, ChevronLeft, Luggage, BaggageClaim, ArrowLeftRight, Trash2, RefreshCw, AlertCircle, Info } from "lucide-react";
import { C } from "../../data";
import { airports, formatPrice, generateFlightsForRoute, HOME_CITIES } from "../../data/flightData";

// ─── Flights on a trip ───
//
// A trip the couple builds starts without flights, and says so in the words
// the app already uses: "Flights not included in this price". From there one
// button adds them: where are you flying from, then each flight in turn.
// Fares are fetched live, so every list of fares waits on a loader. Nothing
// chosen here is final: flights are part of the itinerary, and like the rest
// of it they are tentative until the itinerary is saved, which is when the
// latest fares are fetched.
//
// The cards are the app's own, nothing added, and each holds one flight. Two
// or more sit side by side and are swiped, like the app does. Each card
// carries Change and Remove as buttons, not as small print.
//
// A flight is only ever one we fetched. When none can be fetched, the couple
// is sent to their travel consultant, who adds it for them; a flight the
// consultant adds is changed and removed like any other.

const PINK = "#E31B53";
const GREEN = "#2E7D32";
const ORANGE = "#E07A00";
const NOTE_UNSAVED = "Save the itinerary to see the latest fares and pricing";
const NOTE_SAVED = "Fares as fetched when you last saved the itinerary";

// ─── State, kept per trip ───
//
// { city, picks }. city is null until flights are added. picks is keyed by
// the leg itself (from, to and date), not by its place in the list, so a
// change to the route or the dates can be told apart from a choice:
//   { "BOM-HAN-Nov 18": { id, role, label, airline, fare } }
// id is null once taken out. role is
// what the flight is for: "outbound", "return", or a hop inside the country.
// fare is the price the last check returned. A leg with no entry is new to
// the trip.

const LS_KEY = "30s_trip_flights_v3";
const readAll = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } };

export function useTripFlights(key, startEmpty) {
  const fresh = () => readAll()[key] || (startEmpty ? { city: null, picks: {} } : { city: "Delhi", picks: {} });
  const [state, setState] = useState(fresh);
  useEffect(() => { setState(fresh()); }, [key, startEmpty]);
  const save = (next) => {
    setState(next);
    try { const all = readAll(); all[key] = next; localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch { /* storage off */ }
  };
  return [state, save];
}

export const legSig = (l) => `${l.from}-${l.to}-${l.date}`;
export const legRole = (l) => (l.type === "international" ? l.direction : `dom:${l.from}-${l.to}`);

// Fares are generated for two travellers so a route always yields the same
// flights; the bags shown per traveller are read off the first one.
export const flightsFor = (leg) => generateFlightsForRoute(leg.from, leg.to, leg.date, 2);
const findFlight = (leg, id) => (id ? flightsFor(leg).find((f) => f.id === id) || null : null);

// No airline sells Jaipur to the destinations in this prototype, which is how
// it shows the screens for flights that could not be fetched.
export const fetchFails = (leg) => leg.type === "international" && (leg.from === "JAI" || leg.to === "JAI");

// The flight that fits the days: out lands the same day by 8pm, home leaves
// after 11am, a hop inside the country leaves in the working day. Cheapest of
// those, else simply the cheapest. Given an airline, its flights come first.
export function bestFlight(leg, list = flightsFor(leg), airline = null) {
  const fits = (f) => leg.direction === "outbound" ? (f.arrDate === f.date && f.arr <= "20:00")
    : leg.direction === "return" ? f.dep >= "11:00"
    : (f.dep >= "07:00" && f.dep <= "17:00" && f.arrDate === f.date);
  const same = (f) => airline && f.airlineCodes?.[0] === airline;
  return list.find((f) => same(f) && fits(f)) || list.find(same) || list.find(fits) || list[0] || null;
}

// Write down a full set of choices, one per leg (a flight, or null for none),
// so that a leg turning up later without one can only mean the trip changed.
// A leg whose fetch failed keeps saying so (failed) until a flight is added.
export function materialize(legs, flights, failed = []) {
  return Object.fromEntries(legs.map((l, i) => {
    const f = flights[i] || null;
    return [legSig(l), {
      id: f ? f.id : null, role: legRole(l), label: legTitle(l),
      airline: f?.airlineCodes?.[0] || null, fare: f?.price ?? null,
      name: f?.airline || null, dep: f?.dep || null,
      failed: !f && failed.includes(i),
    }];
  }));
}

// What the trip flies now, and what moved since the choices were made.
//   chosen   one flight (or null) per leg
//   changed  legs whose flight we picked again, because the route or the
//            dates moved under them
//   failed   legs with no flight because none could be fetched
//   failedNow  the ones among them that failed just now, as the trip moved
//   dropped  flights that were on the trip and no longer have a leg
//   cause    "dates" when only the dates moved, "route" when the places did
// A flight that was taken out stays out when its dates move.
export function resolveTrip(legs, picks) {
  const entries = Object.values(picks || {});
  const fresh = entries.length === 0;
  const chosen = [];
  const changed = [];
  const failed = [];
  const failedNow = [];
  let newRole = false;
  legs.forEach((leg, i) => {
    const e = picks?.[legSig(leg)];
    if (e) {
      if (e.id === null) { chosen[i] = null; if (e.failed) failed.push(i); return; }
      const f = findFlight(leg, e.id) || bestFlight(leg);
      chosen[i] = f && e.fare != null ? { ...f, price: e.fare, base: f.price } : f;
      return;
    }
    const before = entries.find((x) => x.role === legRole(leg));
    if (!before && !fresh) newRole = true;
    if (before && before.id === null) { chosen[i] = null; return; }
    if (!fresh && fetchFails(leg)) { chosen[i] = null; failed.push(i); failedNow.push(i); return; }
    chosen[i] = bestFlight(leg, flightsFor(leg), before?.airline);
    if (!fresh) changed.push(i);
  });
  const roles = new Set(legs.map(legRole));
  const dropped = fresh ? [] : entries.filter((x) => x.id && !roles.has(x.role)).map((x) => x.label);
  return { chosen, changed, failed, failedNow, dropped, cause: dropped.length || newRole ? "route" : "dates" };
}

// ─── What changed in the flights since the last save ───
//
// One line per flight, the way hotels and day plans list theirs: added,
// changed, removed, moved by new dates, or dropped by a new route. before is
// the saved { city, picks }; beforeLegs are its legs, for a saved version that
// kept the default flights and so never wrote them down. A line that only
// follows a new route or new dates cannot be undone on its own, so it says so
// (undoable: false) and goes back with that change. The others carry what to
// put back (restore, or null to take the flight out again).
export function flightChanges({ legs, chosen, failed = [], city: nowCity, before, beforeLegs = [] }) {
  const lines = [];
  const prev = new Map();
  if (before?.city) {
    const entries = Object.entries(before.picks || {});
    if (entries.length) {
      entries.forEach(([sig, e]) => prev.set(e.role, { ...e, sig, date: sig.split("-").slice(2).join("-") }));
    } else {
      const r = resolveTrip(beforeLegs, {});
      beforeLegs.forEach((l, i) => {
        const f = r.chosen[i];
        if (f) prev.set(legRole(l), { sig: legSig(l), id: f.id, role: legRole(l), label: legTitle(l), airline: f.airlineCodes?.[0], name: f.airline, dep: f.dep, fare: f.price, date: l.date });
      });
    }
  }
  if (before?.city && nowCity && before.city !== nowCity) {
    lines.push({ key: "city", title: "Flying from", detail: `${nowCity} now, was ${before.city}`, revertAll: true });
  }
  const cityMoved = !!(before?.city && nowCity && before.city !== nowCity);
  const what = (l) => (l.type === "international" ? (l.direction === "outbound" ? "Outbound flight" : "Return flight") : "Domestic flight");
  const seen = new Set();
  legs.forEach((l, i) => {
    const role = legRole(l);
    const sig = legSig(l);
    const f = chosen[i];
    const p = prev.get(role);
    seen.add(role);
    const title = `${what(l)} · ${legTitle(l)}`;
    const had = p && p.id !== null;
    const was = had ? `${p.name || p.airline || "a flight"}${p.dep ? `, ${p.dep}` : ""}` : "";
    const now = f ? `${f.airline}, ${f.dep}` : "";
    const base = { key: `flight:${role}`, title, sig, role };
    if (!had && !f) return;
    if (!had && f) { lines.push({ ...base, detail: `Added ${f.airline}, ${l.date}, ${f.dep}`, restore: null }); return; }
    if (p.sig !== sig) {
      // New dates or a new city put this flight on a different leg.
      const follows = cityMoved && l.type === "international" && p.sig.split("-").slice(2).join("-") === l.date ? "city" : "trip";
      if (!f) { lines.push({ ...base, detail: failed.includes(i) ? `No flights found ${follows === "city" ? `from ${nowCity}` : "for the new dates"}` : "Removed", undoable: false, follows }); return; }
      lines.push({ ...base, detail: follows === "city" ? `Now ${now} from ${nowCity}. Was ${was}` : `Moved to ${l.date}: ${now}`, undoable: false, follows });
      return;
    }
    if (!f) { lines.push({ ...base, detail: `Removed (was ${was})`, restore: p }); return; }
    if (p.id !== f.id) {
      lines.push({ ...base, detail: `Now ${now}. Was ${was}`, restore: p });
    }
  });
  prev.forEach((p, role) => {
    if (!seen.has(role) && p.id !== null) {
      lines.push({ key: `flight:${role}`, title: `Domestic flight · ${p.label}`, detail: "Removed, no longer on your route", undoable: false });
    }
  });
  return lines;
}

// The check Save runs: most fares hold, now and then one has moved. Kept
// steady per flight so the prototype tells the same story every time.
// Measured from the listed fare, so saving twice does not move it twice.
export function recheck(f) {
  let h = 0;
  for (const ch of `${f.id}|${f.date}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const delta = h % 6 === 0 ? 600 : h % 6 === 1 ? -400 : 0;
  const latest = (f.base ?? f.price) + delta;
  return latest !== f.price ? { ...f, price: latest, was: f.price } : f;
}

// ─── Small helpers ───

const city = (code, fallback) => airports[code]?.city || fallback || code;
export const legTitle = (leg) => `${city(leg.from, leg.fromCity)} to ${city(leg.to, leg.toCity)}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Feb 11" on a trip starting startISO -> a real date (the year can roll over).
function legDate(label, startISO) {
  const start = new Date(startISO);
  const [m, d] = String(label).split(" ");
  const mi = MONTHS.indexOf(m);
  if (mi < 0 || isNaN(start)) return null;
  const y = start.getFullYear() + (mi < start.getMonth() ? 1 : 0);
  return new Date(y, mi, Number(d));
}
export const longDate = (label, startISO) => {
  const d = legDate(label, startISO);
  return d ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : label;
};
export const dayOfTrip = (label, startISO) => {
  const d = legDate(label, startISO);
  const s = new Date(startISO);
  if (!d || isNaN(s)) return null;
  s.setHours(0, 0, 0, 0);
  return Math.round((d - s) / 86400000) + 1;
};
const kg = (s) => parseInt(String(s), 10) || 0;
const stopsLine = (f) => f.stops === 0 ? null : `${f.stops} stop${f.stops > 1 ? "s" : ""} • ${f.stopCities.join(", ")}`;
const sum = (list) => list.reduce((s, f) => s + (f?.price || 0), 0);

function AirlineTile({ f, size = 34 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: size * 0.26, background: "#F2F4F7", display: "grid", placeItems: "center", flexShrink: 0, fontSize: size * 0.32, fontWeight: 700, color: "#344054" }}>
      {(f?.airlineCodes || [])[0] || "✈"}
    </span>
  );
}

// DEL ○- - - (✈) - - -○ DPS, with the times under the codes and the length
// of the flight over the plane. Stops sit under it in orange.
function RouteRow({ f, accent = PINK, size = "card" }) {
  const S = size === "card" ? { code: 18, time: 11, dur: 10, side: 48 } : { code: 16, time: 10.5, dur: 10, side: 44 };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <div style={{ minWidth: S.side }}>
        <div style={{ fontSize: S.code, fontWeight: 400, color: C.head, lineHeight: 1.15 }}>{f.from}</div>
        <div style={{ fontSize: S.time, color: C.head, marginTop: 3 }}>{f.dep}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        <div style={{ fontSize: S.dur, color: C.head, minHeight: 12 }}>{f.duration}</div>
        <div style={{ height: 16, display: "flex", alignItems: "center", margin: "1px 0" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${accent}`, background: C.white, flexShrink: 0 }} />
          <span style={{ flex: 1, borderTop: `1.5px dashed ${C.inact}` }} />
          <span style={{ width: 16, height: 16, borderRadius: "50%", background: accent, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Plane size={9} color="#fff" fill="#fff" style={{ transform: "rotate(45deg)" }} />
          </span>
          <span style={{ flex: 1, borderTop: `1.5px dashed ${C.inact}` }} />
          <span style={{ width: 6, height: 6, borderRadius: "50%", border: `1.5px solid ${accent}`, background: C.white, flexShrink: 0 }} />
        </div>
        {stopsLine(f) && <div style={{ fontSize: 10.5, color: ORANGE }}>{stopsLine(f)}</div>}
      </div>
      <div style={{ minWidth: S.side, textAlign: "right" }}>
        <div style={{ fontSize: S.code, fontWeight: 400, color: C.head, lineHeight: 1.15 }}>{f.to}</div>
        <div style={{ fontSize: S.time, color: C.head, marginTop: 3 }}>
          {f.arr}{f.arrDate !== f.date && <sup style={{ fontSize: 8, color: ORANGE, fontWeight: 700, marginLeft: 1 }}>+1</sup>}
        </div>
      </div>
    </div>
  );
}

const linkBtn = { border: "none", background: "none", padding: 0, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" };

function Badge({ children, color = "#B54708", bg = "#FFFAEB", border = "#FEDF89" }) {
  return <span style={{ fontSize: 9, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, padding: "1px 6px", borderRadius: 999, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{children}</span>;
}

// One leg inside a card, as the app draws it: "OUTBOUND • Feb 11", then the route.
function Leg({ kind, leg, f, updated }) {
  const ret = kind === "ret";
  const color = ret ? GREEN : PINK;
  const Icon = ret ? PlaneLanding : PlaneTakeoff;
  const word = kind === "out" ? "OUTBOUND" : ret ? "RETURN" : "ONE WAY";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Icon size={13} color={color} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 11.5, color, letterSpacing: 0.2, whiteSpace: "nowrap" }}>{word} • {leg.date}</span>
        {updated && <Badge>UPDATED</Badge>}
      </div>
      <RouteRow f={f} accent={color} />
    </div>
  );
}

const cardStyle = { border: `1px solid ${C.div}`, borderRadius: 14, background: C.white, boxShadow: "0 4px 14px rgba(16,24,40,0.05)", overflow: "hidden" };
const footStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 14px", background: "#F7F7F8", border: "none", fontFamily: "inherit", fontSize: 11, color: C.sub, cursor: "pointer" };
const actBtn = { flex: 1, height: 34, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", background: C.white };

// One airline's flights: the app's card, plus the two things that can be done
// to it.
function FlightCard({ parts, travellers, onChange, onRemove, onDetails, testId }) {
  const f0 = parts[0].f;
  const fare = sum(parts.map((p) => p.f));
  return (
    <div style={cardStyle} data-testid={testId}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.div}` }}>
        <AirlineTile f={f0} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f0.airline}</span>
        <span style={{ fontSize: 14.5, fontWeight: 500, color: C.head, flexShrink: 0 }}>₹{formatPrice(fare * travellers)}</span>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
        {parts.map((p, k) => (
          <div key={k} style={k ? { borderTop: `1px solid ${C.div}`, paddingTop: 14 } : null}>
            <Leg {...p} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
          <button onClick={onChange} data-testid={`${testId}-change`} style={{ ...actBtn, border: `1px solid ${PINK}`, color: PINK }}>
            <ArrowLeftRight size={14} /> Change
          </button>
          <button onClick={onRemove} data-testid={`${testId}-remove`} style={{ ...actBtn, border: `1px solid ${C.div}`, color: C.head }}>
            <Trash2 size={14} color={C.sub} /> Remove
          </button>
        </div>
      </div>
      <button onClick={onDetails} style={footStyle}>
        Tap to view flight details <ChevronRight size={15} color={C.head} />
      </button>
    </div>
  );
}

// Cards side by side, one per airline, with the app's dots under them.
function Carousel({ children }) {
  const ref = useRef(null);
  const [at, setAt] = useState(0);
  const n = children.length;
  const onScroll = () => {
    const el = ref.current;
    if (el) setAt(Math.round(el.scrollLeft / (el.clientWidth * 0.9 + 10)));
  };
  if (n === 1) return children[0];
  return (
    <div>
      <div ref={ref} onScroll={onScroll} className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", margin: "0 -16px", padding: "2px 16px 6px", scrollPaddingLeft: 16 }}>
        {children.map((c, i) => <div key={i} style={{ flex: "0 0 90%", scrollSnapAlign: "start" }}>{c}</div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
        {children.map((_, i) => <span key={i} style={{ width: i === at ? 18 : 8, height: 4, borderRadius: 99, background: i === at ? PINK : C.div, transition: "width 200ms" }} />)}
      </div>
    </div>
  );
}

// The travel consultant, on WhatsApp, with the flight already named. They add
// what the app could not fetch.
function AskConsultant({ consultant, leg, startISO, testId, big = false }) {
  const first = consultant?.name?.split(" ")[0];
  const msg = encodeURIComponent(`Hi${first ? ` ${first}` : ""}, the app couldn't find flights for ${legTitle(leg)} on ${longDate(leg.date, startISO)}. Could you add one to my itinerary?`);
  const href = consultant?.phone ? `https://wa.me/${consultant.phone.replace(/\D/g, "")}?text=${msg}` : null;
  const label = first ? `Ask ${first} on WhatsApp` : "Ask your consultant";
  const style = big
    ? { ...actBtn, flex: "none", width: "100%", maxWidth: 280, height: 44, marginTop: 18, border: "none", background: PINK, color: "#fff", fontSize: 14, textDecoration: "none" }
    : { ...actBtn, border: `1px solid ${PINK}`, color: PINK, textDecoration: "none" };
  return (
    <a href={href || undefined} target="_blank" rel="noopener noreferrer" data-testid={testId} style={style}>
      <img src="/whatsapp.webp" alt="" width={big ? 18 : 15} height={big ? 18 : 15} style={{ display: "block", flexShrink: 0 }} /> {label}
    </a>
  );
}

// A leg with no flight: taken out, or one we could not fetch.
function MissingLeg({ text, sub, onAdd, ask, testId, failed }) {
  return (
    <div data-testid={testId} style={{ padding: "11px 12px", border: `1.5px dashed ${failed ? "#FECDCA" : C.icon}`, borderRadius: 12, background: "#FCFCFD" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {failed && <AlertCircle size={16} color="#B42318" style={{ flexShrink: 0 }} />}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: C.head }}>{text}</span>
          {sub && <span style={{ display: "block", fontSize: 11, color: C.sub, marginTop: 2 }}>{sub}</span>}
        </span>
        {!failed && (
          <button onClick={onAdd} data-testid={`${testId}-add`} style={{ ...linkBtn, display: "inline-flex", alignItems: "center", gap: 4, color: PINK, padding: "6px 11px", border: `1px solid ${PINK}`, borderRadius: 999, background: C.white }}>
            <Plus size={13} /> Add
          </button>
        )}
      </div>
      {failed && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {ask}
          <button onClick={onAdd} data-testid={`${testId}-retry`} style={{ ...actBtn, flex: "0 0 auto", padding: "0 14px", border: `1px solid ${C.div}`, color: C.head }}><RefreshCw size={13} color={C.sub} /> Search again</button>
        </div>
      )}
    </div>
  );
}

function SectionHead({ title, note }) {
  return (
    <>
      <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>{title}</p>
      {note && <p style={{ fontSize: 11.5, color: C.inact, margin: "4px 0 12px", lineHeight: 1.45 }}>{note}</p>}
    </>
  );
}

// ─── The loader for anything that fetches fares ───
export function FareLoader({ title, sub, cards = 3 }) {
  return (
    <div data-testid="fare-loader">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "10px 0 16px" }}>
        <div style={{ position: "relative", width: 150, height: 34 }}>
          <svg width="150" height="34" viewBox="0 0 150 34" style={{ position: "absolute", inset: 0 }}>
            <path d="M6 28 Q75 -8 144 28" fill="none" stroke={C.icon} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="6" cy="28" r="3.5" fill={C.white} stroke={PINK} strokeWidth="1.5" />
            <circle cx="144" cy="28" r="3.5" fill={C.white} stroke={PINK} strokeWidth="1.5" />
          </svg>
          <span className="fl-fly" style={{ position: "absolute", left: 0, top: 0, width: 20, height: 20, marginLeft: -10, marginTop: -10, borderRadius: "50%", background: PINK, display: "grid", placeItems: "center" }}>
            <Plane size={11} color="#fff" fill="#fff" style={{ transform: "rotate(45deg)" }} />
          </span>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 13.5, fontWeight: 600, color: C.head }}>{title}</p>
        {sub && <p style={{ margin: "3px 0 0", fontSize: 11.5, color: C.sub }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.div}`, borderRadius: 14, padding: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="fl-shim" style={{ width: 30, height: 30, borderRadius: 8 }} />
              <span className="fl-shim" style={{ flex: 1, height: 11, borderRadius: 6 }} />
              <span className="fl-shim" style={{ width: 56, height: 13, borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
              <span className="fl-shim" style={{ width: 40, height: 16, borderRadius: 6 }} />
              <span className="fl-shim" style={{ flex: 1, height: 4, borderRadius: 4 }} />
              <span className="fl-shim" style={{ width: 40, height: 16, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes flFly { 0% { offset-distance: 0%; } 100% { offset-distance: 100%; } }
        .fl-fly { offset-path: path("M6 28 Q75 -8 144 28"); offset-rotate: 0deg; animation: flFly 1.6s ease-in-out infinite; }
        @keyframes flShim { 0% { background-position: -160px 0; } 100% { background-position: 160px 0; } }
        .fl-shim { display: block; background: linear-gradient(90deg, #F2F4F7 0%, #E4E7EC 50%, #F2F4F7 100%); background-size: 320px 100%; animation: flShim 1.2s linear infinite; }
      `}</style>
    </div>
  );
}

// ─── The section on the itinerary ───
export function FlightsSection({ legs, chosen, changed = [], failed = [], failedNow = [], dropped = [], cause, refreshing, saved, city: fromCity, travellers, startISO, consultant, onAddFlights, onChangeCity, onChangeLegs, onRemoveLegs, onAddLeg, onDetails, onDismissChanges }) {
  const any = chosen.some(Boolean) || failed.length > 0;
  const note = saved ? NOTE_SAVED : NOTE_UNSAVED;

  // Nothing added yet (or everything taken out): the app's own empty card,
  // with the way in.
  if (!fromCity || !any) {
    return (
      <div style={{ padding: "0 16px" }} data-testid="flights-empty">
        <SectionHead title="Flights" note={null} />
        <div style={{ marginTop: 12, border: `1.5px dashed ${C.icon}`, borderRadius: 14, padding: "14px 14px", background: "#FCFCFD" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: "#F1EDFD", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Plane size={17} color="#6938EF" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.head }}>Flights not included in this price</p>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
                Add flights from your city to see what the whole trip costs. You can change or remove them any time.
              </p>
              <button onClick={onAddFlights} data-testid="flights-add" style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 15px", borderRadius: 999, border: "none", background: PINK, color: "#fff", fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                <Plus size={14} /> Add flights
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const outIdx = legs.findIndex((l) => l.type === "international" && l.direction === "outbound");
  const retIdx = legs.findIndex((l) => l.type === "international" && l.direction === "return");
  const out = chosen[outIdx];
  const ret = chosen[retIdx];
  const isNew = (i) => changed.includes(i);
  const part = (i, kind) => ({ kind, leg: legs[i], f: chosen[i], updated: isNew(i), i });
  // One flight to a card, always. Outbound and return are two cards, swiped.
  const intlCards = [out && [part(outIdx, "out")], ret && [part(retIdx, "ret")]].filter(Boolean);
  const domestic = legs.map((l, i) => ({ l, i })).filter((x) => x.l.type === "internal");
  const card = (parts, testId) => (
    <FlightCard
      key={testId}
      testId={testId}
      parts={parts}
      travellers={travellers}
      onChange={() => onChangeLegs(parts.map((p) => p.i))}
      onRemove={() => onRemoveLegs(parts.map((p) => p.i))}
      onDetails={() => onDetails(parts.map((p) => ({ f: p.f, kind: p.kind })))}
    />
  );
  const missing = (i, label) => failed.includes(i) ? (
    <MissingLeg failed testId={`miss-${i}`} text={`No flights found for ${legTitle(legs[i])}`} sub={`${longDate(legs[i].date, startISO)}. Your travel consultant can add it for you, or search again.`} onAdd={() => onAddLeg([i])} ask={<AskConsultant consultant={consultant} leg={legs[i]} startISO={startISO} testId={`miss-${i}-ask`} />} />
  ) : (
    <MissingLeg testId={`miss-${i}`} text={`${label} not added`} sub={`${legTitle(legs[i])} · ${legs[i].date}`} onAdd={() => onAddLeg([i])} />
  );

  // The route or the dates moved: say what happened, in those words.
  const routeMoved = cause === "route";
  const notice = (changed.length > 0 || dropped.length > 0 || failedNow.length > 0) && (
    <div data-testid="flights-changed" style={{ position: "relative", display: "flex", gap: 10, padding: "12px 34px 12px 12px", marginBottom: 16, border: `1px solid ${C.div}`, borderRadius: 12 }}>
      <Info size={16} color="#B54708" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.head }}>{routeMoved ? "Your route changed" : "Your travel dates changed"}</p>
        {changed.length > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: C.sub, lineHeight: 1.45 }}>
            {routeMoved
              ? `We found new flights for ${changed.map((i) => legTitle(legs[i])).join(", ")}.`
              : `We moved ${changed.length === 1 ? "your flight" : `your ${changed.length} flights`} to the new dates and kept the same airlines where we could.`}
            {" "}They're marked Updated. Save the itinerary to fetch the latest fares.
          </p>
        )}
        {dropped.length > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: C.sub, lineHeight: 1.45 }}>
            {dropped.join(", ")} {dropped.length === 1 ? "is" : "are"} no longer on your route, so we took {dropped.length === 1 ? "it" : "them"} out.
          </p>
        )}
        {failedNow.length > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#B42318", lineHeight: 1.45 }}>
            We couldn't find flights for {failedNow.map((i) => legTitle(legs[i])).join(", ")} {routeMoved ? "on your new route" : "on the new dates"}. Your travel consultant can add {failedNow.length === 1 ? "it" : "them"} for you.
          </p>
        )}
      </div>
      <button onClick={onDismissChanges} aria-label="Dismiss" data-testid="flights-changed-close" style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer" }}>
        <XIcon size={13} color={C.sub} />
      </button>
    </div>
  );

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Where they fly from, and the way to change it */}
      <div data-testid="flights-from" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <PlaneTakeoff size={14} color={C.sub} />
        <span style={{ flex: 1, fontSize: 12, color: C.sub }}>Flying from <b style={{ color: C.head, fontWeight: 600 }}>{fromCity}</b></span>
        <button onClick={onChangeCity} data-testid="flights-change-city" style={{ ...linkBtn, color: PINK }}>Change city</button>
      </div>

      {refreshing ? (
        <FareLoader title={cause === "route" ? "Finding flights for your new route" : "Finding flights for your new dates"} sub="Fetching the latest fares" cards={2} />
      ) : (
        <>
          {notice}

          <SectionHead title="International flights" note={note} />
          {!out && !ret && !failed.includes(outIdx) && !failed.includes(retIdx) ? (
            <MissingLeg testId="flights-intl-missing" text="International flights not added" sub={`${legTitle(legs[outIdx])} and back`} onAdd={() => onAddLeg([outIdx, retIdx])} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {intlCards.length > 0 && <Carousel>{intlCards.map((parts, k) => card(parts, `flights-intl-${k}`))}</Carousel>}
              {!out && missing(outIdx, "Outbound flight")}
              {!ret && missing(retIdx, "Return flight")}
            </div>
          )}

          {domestic.length > 0 && (
            <div style={{ marginTop: 24 }} data-testid="flights-domestic">
              <SectionHead title="Domestic flights" note={note} />
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {domestic.map(({ l, i }) => {
                  const day = dayOfTrip(l.date, startISO);
                  return (
                    <div key={legSig(l)}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.head }}>{day ? `Day ${day}` : l.date}</p>
                      <p style={{ margin: "1px 0 10px", fontSize: 12, color: C.sub }}>{legTitle(l)}</p>
                      {chosen[i] ? card([part(i, "dom")], `flights-dom-${i}`) : missing(i, "Flight")}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Choosing flights, one leg at a time ───
//
// Each step fetches that flight's fares (the loader holds the screen while it
// does), then lists them with the fare per person and the bags. The one that
// fits the trip is picked to start with. The footer keeps a tentative total,
// and Done puts the flights on the itinerary, unsaved: saving the itinerary
// is what fetches the latest fares. When nothing comes back, the step says
// so and sends them to their travel consultant, who adds it for them.
//
// The options carry no labels (no Cheapest, no Non-stop): the one that fits
// the trip is simply selected and listed first.
export function FlightChooser({ legs, legIdxs, initial = {}, current = [], travellers, startISO, mode = "add", fromCity, consultant, onDone, onClose }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState({}); // legIdx -> flight | null
  const [showAll, setShowAll] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tries, setTries] = useState(0);

  const legIdx = legIdxs[step];
  const leg = legs[legIdx];
  const failedFetch = fetchFails(leg);
  const list = useMemo(() => (failedFetch ? [] : flightsFor(leg)), [leg, failedFetch]);
  const best = useMemo(() => (failedFetch ? null : bestFlight(leg, list)), [leg, list, failedFetch]);
  const startId = initial[legIdx] || best?.id;
  const selFlight = picks[legIdx] !== undefined ? picks[legIdx] : list.find((f) => f.id === startId) || null;
  // The flight already on the trip (when changing) leads, then the best fit.
  const startF = list.find((f) => f.id === startId);
  const ordered = useMemo(() => [...new Set([startF, best, ...list])].filter(Boolean), [startF, best, list]);
  const shown = showAll ? ordered : ordered.slice(0, 5);
  const last = step === legIdxs.length - 1;
  const multi = legIdxs.length > 1;

  // Every step is a fetch: hold the screen on the loader while it runs.
  useEffect(() => {
    setShowAll(false);
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, [step, tries]);

  // What the chosen flights come to so far, for everyone travelling.
  const runFlights = legIdxs.map((i) => (i === legIdx ? selFlight : picks[i] !== undefined ? picks[i] : null));
  const tentative = sum(runFlights) * travellers;

  const finish = (all) => onDone(all);
  const choose = (f) => {
    const next = { ...picks, [legIdx]: f };
    setPicks(next);
    if (last) finish(Object.fromEntries(legIdxs.map((i) => [i, next[i] !== undefined ? next[i] : null])));
    else setStep(step + 1);
  };
  const back = () => {
    if (step === 0) onClose(); else setStep(step - 1);
  };
  const kindLabel = leg.type === "international" ? (leg.direction === "outbound" ? "Outbound flight" : "Return flight") : `Day ${dayOfTrip(leg.date, startISO) || ""} flight`;
  const nextLeg = !last ? legs[legIdxs[step + 1]] : null;
  const cta = last ? "Done" : `Next: ${nextLeg.type === "international" ? (nextLeg.direction === "return" ? "return flight" : "outbound flight") : legTitle(nextLeg)}`;

  return (
    <div data-testid="flight-chooser" style={{ position: "absolute", inset: 0, background: C.white, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, padding: "12px 14px", borderBottom: `1px solid ${C.div}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={back} aria-label="Back" style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            {step === 0 ? <XIcon size={16} color={C.head} /> : <ChevronLeft size={18} color={C.head} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600, color: C.sub, letterSpacing: 0.3, textTransform: "uppercase" }}>
              {kindLabel}{multi ? ` · ${step + 1} of ${legIdxs.length}` : ""}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 15.5, fontWeight: 700, color: C.head }}>{legTitle(leg)}</p>
          </div>
          {mode !== "change" && (
            <button onClick={() => choose(null)} data-testid="flight-skip" style={{ ...linkBtn, fontSize: 12.5, color: C.sub, flexShrink: 0 }}>Skip</button>
          )}
        </div>
        <p style={{ margin: "6px 0 0 44px", fontSize: 11.5, color: C.sub }}>{longDate(leg.date, startISO)} · {travellers} traveller{travellers === 1 ? "" : "s"}{fromCity && leg.type === "international" ? ` · from ${fromCity}` : ""}</p>
        {multi && (
          <div style={{ display: "flex", gap: 4, margin: "10px 0 0 44px" }}>
            {legIdxs.map((_, k) => <span key={k} style={{ flex: 1, height: 3, borderRadius: 2, background: k <= step ? PINK : C.div }} />)}
          </div>
        )}
      </div>

      <>
          {/* Options */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 20px", background: "#FAFAFB" }}>
            {loading ? (
              <FareLoader title={`Fetching live fares for ${longDate(leg.date, startISO)}`} sub={`${legTitle(leg)} · ${travellers} traveller${travellers === 1 ? "" : "s"}`} />
            ) : failedFetch ? (
              <div data-testid="flight-fetch-failed" style={{ textAlign: "center", padding: "36px 12px" }}>
                <span style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEF3F2", display: "inline-grid", placeItems: "center" }}>
                  <AlertCircle size={22} color="#B42318" />
                </span>
                <p style={{ margin: "14px 0 0", fontSize: 15, fontWeight: 700, color: C.head }}>We couldn't fetch flights</p>
                <p style={{ margin: "6px auto 0", fontSize: 12.5, color: C.sub, lineHeight: 1.5, maxWidth: 280 }}>
                  No fares came back for {legTitle(leg)} on {longDate(leg.date, startISO)}. Your travel consultant can add this flight for you, and you can still change it after.
                </p>
                <AskConsultant consultant={consultant} leg={leg} startISO={startISO} testId="flight-ask" big />
                <button onClick={() => setTries(tries + 1)} data-testid="flight-retry" style={{ ...actBtn, flex: "none", width: "100%", maxWidth: 280, height: 42, marginTop: 10, border: `1px solid ${C.div}`, color: C.head, fontSize: 13.5 }}>
                  <RefreshCw size={14} color={C.sub} /> Try again
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {shown.map((f) => {
                    const on = f.id === selFlight?.id;
                    const bag = f.travelers?.[0] || {};
                    const checkin = kg(bag.checkin);
                    return (
                      <div
                        key={f.id}
                        role="button"
                        onClick={() => setPicks({ ...picks, [legIdx]: f })}
                        data-testid="flight-option"
                        style={{ background: C.white, borderRadius: 14, border: on ? `1.5px solid ${PINK}` : `1px solid ${C.div}`, padding: "12px 12px 10px", cursor: "pointer", boxShadow: on ? "0 4px 14px rgba(227,27,83,0.10)" : "none" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <AirlineTile f={f} size={30} />
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: 12.5, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.airline}</span>
                          </span>
                          <span style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.head }}>₹{formatPrice(f.price)}</span>
                            <span style={{ display: "block", fontSize: 9.5, color: C.inact }}>per person</span>
                          </span>
                          <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, border: on ? "none" : `1.5px solid ${C.icon}`, background: on ? PINK : C.white, display: "grid", placeItems: "center" }}>
                            {on && <Check size={12} color="#fff" strokeWidth={3} />}
                          </span>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <RouteRow f={f} size="option" accent={leg.direction === "return" ? GREEN : PINK} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, paddingTop: 9, borderTop: `1px dashed ${C.div}` }}>
                          <BagChip Icon={Luggage} color={PINK} bg="#FFF0F3" text={`Cabin ${kg(bag.cabin)} kg`} />
                          <BagChip Icon={BaggageClaim} color="#1570EF" bg="#EFF6FF" text={checkin ? `Check-in ${checkin} kg` : "No check-in bag"} warn={!checkin} />
                          <button onClick={(e) => { e.stopPropagation(); setDetail(f); }} style={{ ...linkBtn, marginLeft: "auto", fontSize: 11, fontWeight: 500, color: C.sub, textDecoration: "underline" }}>Details</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!showAll && ordered.length > 5 && (
                  <button onClick={() => setShowAll(true)} style={{ ...linkBtn, display: "block", margin: "14px auto 0", fontSize: 12.5, color: PINK }}>
                    Show {ordered.length - 5} more flights
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer: a tentative total, and Save checks it */}
          {!loading && !failedFetch && (
            <div style={{ flexShrink: 0, padding: "10px 14px 16px", borderTop: `1px solid ${C.div}`, background: C.white }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 10.5, color: C.sub }}>Tentative total{multi && !last ? " so far" : ""}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 16, fontWeight: 700, color: C.head }} data-testid="flight-tentative">₹{formatPrice(tentative)}</p>
                </div>
                <button onClick={() => choose(selFlight)} disabled={!selFlight} data-testid="flight-next" style={{ flex: "0 0 auto", minWidth: 150, padding: "0 20px", height: 46, borderRadius: 999, border: "none", background: PINK, opacity: selFlight ? 1 : 0.5, color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                  {cta}
                </button>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 10.5, color: C.inact, lineHeight: 1.4 }}>
                Flight prices are tentative. Save the itinerary to fetch the latest fares.
              </p>
            </div>
          )}
      </>

      {detail && <FlightDetailSheet items={[{ f: detail, kind: leg.direction === "return" ? "ret" : leg.type === "internal" ? "dom" : "out" }]} travellers={travellers} startISO={startISO} onClose={() => setDetail(null)} perPerson />}
    </div>
  );
}

function BagChip({ Icon, color, bg, text, warn }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: warn ? ORANGE : C.head }}>
      <span style={{ width: 20, height: 20, borderRadius: 6, background: bg, display: "grid", placeItems: "center" }}>
        <Icon size={12} color={color} />
      </span>
      {text}
    </span>
  );
}

// ─── Flight details: the app's bottom sheet ───

const wave = (hex) => `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Cpath d='M0 4 Q4 0 8 4 T16 4' fill='none' stroke='%23${hex}' stroke-width='1.3'/%3E%3C/svg%3E")`;

export function FlightDetailSheet({ items, travellers, startISO, onClose, perPerson = false }) {
  const f0 = items[0].f;
  const total = sum(items.map((x) => x.f)) * (perPerson ? 1 : travellers);
  return (
    <div data-testid="flight-detail" style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.55)" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "22px 22px 0 0", maxHeight: "86%", overflowY: "auto", padding: "10px 16px 28px" }}>
        <div style={{ width: 48, height: 5, borderRadius: 99, background: C.icon, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AirlineTile f={f0} size={36} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, color: C.head }}>{f0.airline}</span>
            <span style={{ display: "block", fontSize: 10.5, color: C.inact, marginTop: 3 }}>{f0.flightNo}</span>
          </span>
          <span style={{ fontSize: 19, fontWeight: 600, color: C.head, flexShrink: 0 }}>₹{formatPrice(total)}</span>
        </div>

        {items.map(({ f, kind }, k) => {
          const color = kind === "ret" ? GREEN : PINK;
          const label = kind === "ret" ? "RETURN" : kind === "dom" ? "FLIGHT" : "DEPARTURE";
          const bag = f.travelers?.[0];
          return (
            <div key={k} style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, height: 8, backgroundImage: wave(color.slice(1)), backgroundRepeat: "repeat-x" }} />
                {kind === "ret" ? <PlaneLanding size={14} color={color} /> : <PlaneTakeoff size={14} color={color} />}
                <span style={{ fontSize: 10.5, color, letterSpacing: 0.5 }}>{label}</span>
                <span style={{ flex: 1, height: 8, backgroundImage: wave(color.slice(1)), backgroundRepeat: "repeat-x" }} />
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 12.5, color: C.head }}>{f.airline}</p>
              <p style={{ margin: "3px 0 0", fontSize: 10.5, color: C.sub }}>{longDate(f.date, startISO)}{f.duration ? ` • ${f.duration}` : ""}</p>

              <div style={{ marginTop: 10, paddingLeft: 4 }}>
                {f.segments.map((s, i) => (
                  <div key={i}>
                    {s.layoverBefore && (
                      <p style={{ margin: "0 0 10px 26px", fontSize: 10.5, color: ORANGE }}>{s.layoverBefore} layover in {s.fromCity || s.from}</p>
                    )}
                    <TimelineRow time={s.dep} code={s.from} name={s.fromCity} color={color} line />
                    <TimelineRow time={s.arr} code={s.to} name={s.toCity} color={color} />
                  </div>
                ))}
              </div>

              <p style={{ margin: "14px 0 10px", fontSize: 10.5, fontWeight: 500, color: C.head, letterSpacing: 0.5 }}>LUGGAGE ALLOWANCE</p>
              {bag && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                    <Legend Icon={Luggage} color={PINK} bg="#FFF0F3" text="Cabin" />
                    <Legend Icon={BaggageClaim} color="#1570EF" bg="#EFF6FF" text="Check-in" />
                  </div>
                  {Array.from({ length: travellers }).map((_, t) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0 5px 8px" }}>
                      <span style={{ flex: 1, fontSize: 12.5, color: C.head }}>Traveller {t + 1}</span>
                      <KgPill Icon={Luggage} color={PINK} n={kg(bag.cabin)} label="Cabin" />
                      <KgPill Icon={BaggageClaim} color="#1570EF" n={kg(bag.checkin)} label="Check-in" />
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineRow({ time, code, name, color, line }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", paddingBottom: line ? 18 : 10 }}>
      <span style={{ position: "relative", width: 12, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${color}`, background: C.white, zIndex: 1 }} />
        {line && <span style={{ position: "absolute", top: 12, height: 24, left: "50%", borderLeft: `1.5px dashed ${C.icon}` }} />}
      </span>
      <span style={{ flex: 1, fontSize: 15, color: C.head }}>{time} <span style={{ color: C.sub, fontSize: 12 }}>{code}</span></span>
      <span style={{ fontSize: 10.5, color: C.inact }}>{name}</span>
    </div>
  );
}

function Legend({ Icon, color, bg, text }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, color: C.head }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: bg, display: "grid", placeItems: "center" }}>
        <Icon size={12} color={color} />
      </span>
      {text}
    </span>
  );
}

function KgPill({ Icon, color, n, label }) {
  return (
    <span aria-label={`${label} ${n} kg`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 999, background: "#F4F4F5", minWidth: 66 }}>
      <Icon size={12} color={color} />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: n ? C.head : ORANGE }}>{n}</span>
      <span style={{ fontSize: 10.5, color: C.sub }}>kg</span>
    </span>
  );
}

// ─── Where are you flying from? ───
export function CitySheet({ value, onPick, onClose, changing = false }) {
  return (
    <div data-testid="flights-city-sheet" style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", maxHeight: "82%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flexShrink: 0, padding: "10px 16px 12px", borderBottom: `1px solid ${C.div}` }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: C.div, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ margin: 0, flex: 1, fontSize: 16, fontWeight: 700, color: C.head }}>Where are you flying from?</p>
            <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
              <XIcon size={15} color={C.sub} />
            </button>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: C.sub }}>
            {changing ? "We'll fetch flights from the new city. Your domestic flights stay as they are." : "Next, you'll choose each flight. Every option shows its fare and bags."}
          </p>
        </div>
        <div style={{ overflowY: "auto" }}>
          {HOME_CITIES.map((c) => (
            <button key={c} onClick={() => onPick(c)} data-testid={`flights-city-${c}`} style={{ display: "flex", alignItems: "center", width: "100%", padding: "13px 16px", border: "none", borderBottom: `1px solid ${C.div}`, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: c === value ? 600 : 400, color: C.head }}>{c}</span>
              {c === value && <Check size={16} color={PINK} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
