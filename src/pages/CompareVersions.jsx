import { useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight, ChevronRight,
  Plane, BedDouble, MapPin, CalendarDays, Map, Check, Star, Clock, X as XIcon,
  Coffee, Waves, Dumbbell, Wifi, UtensilsCrossed, Luggage, Heart,
} from "lucide-react";
import { C } from "../data";
import { airports } from "../data/flightData";
import { useDeals } from "../data/deals";
import { getVersionSnapshot, compareVersions, versionsForCard } from "../data/compareData";
import HotelStayCard from "../components/HotelStayCard";

const cityOf = (code) => airports[code]?.city || code;
const HOTEL_IMGS = [
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80&auto=format&fit=crop",
];
const hashStr = (s) => { let h = 0; for (let i = 0; i < (s || "").length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

const PAD = 16;
const SLATE = "#475467";        // neutral diff accent (never coral)
const SLATE_BG = "#F2F4F7";
const destFlags = { Thailand: "🇹🇭", Vietnam: "🇻🇳", Bali: "🇮🇩", Maldives: "🇲🇻", "Sri Lanka": "🇱🇰", "New Zealand": "🇳🇿", Mauritius: "🇲🇺" };

const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const signed = (n) => `${n > 0 ? "+" : n < 0 ? "-" : ""}${inr(Math.abs(n))}`;
const shortDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
const ddmm = (d) => { if (!d) return ""; const x = new Date(d); return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}`; };
const DIFF_RED = "#D92D20";
const DIFF_GREEN = "#067647";
const genDate = (v) => shortDate(v.status === "quote" ? v.pricedAt : v.createdAt);
const verPrice = (v) => (v.livePrice ?? v.indicativePrice ?? 0) * (v.customizations?.travelDates?.travelers ?? 2);

// Every version is a finalised plan now, so only an expired one needs a label.
function StatusChip({ status, small }) {
  if (status !== "expired") return null;
  return <span style={{ fontSize: small ? 9.5 : 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: C.bg, color: C.sub }}>Expired</span>;
}

function ChangedTag({ label = "Changed" }) {
  return <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".3px", color: SLATE, background: SLATE_BG, padding: "2px 7px", borderRadius: 999, textTransform: "uppercase" }}>{label}</span>;
}

// Subtle colored bold text (no pill): green "Added", red "Removed". Component-level.
function DiffTag({ kind }) {
  if (kind !== "added" && kind !== "removed") return null;
  const added = kind === "added";
  return (
    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".2px", color: added ? DIFF_GREEN : DIFF_RED, flexShrink: 0 }}>
      {added ? "Added" : "Removed"}
    </span>
  );
}

function Block({ icon, title, changed, tagLabel, showTag = true, children }) {
  const Icon = icon;
  return (
    <div style={{ marginBottom: 14, borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, overflow: "hidden", borderLeft: changed ? `3px solid ${C.p600}` : `1px solid ${C.div}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 13px 9px" }}>
        <Icon size={16} color={C.sub} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: C.head, flex: 1 }}>{title}</span>
        {changed && showTag && <ChangedTag label={tagLabel} />}
      </div>
      <div style={{ padding: `0 13px 13px` }}>{children}</div>
    </div>
  );
}

function TwoCol({ a, b }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
      <div style={{ flex: 1, minWidth: 0 }}>{a}</div>
      <div style={{ width: 1, background: C.div }} />
      <div style={{ flex: 1, minWidth: 0 }}>{b}</div>
    </div>
  );
}

export default function CompareVersions() {
  const { dealId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { getDeal, isWished, toggleWish } = useDeals();

  const prop = sp.get("prop") || undefined;
  const deal = getDeal(dealId);
  const list = useMemo(() => deal ? versionsForCard(deal, prop) : [], [deal, prop]);
  // Light per-version facts (route, start, nights) for the picker cards.
  const snaps = useMemo(
    () => deal ? Object.fromEntries(list.map((v) => [v.id, getVersionSnapshot(deal, v)])) : {},
    [deal, list]
  );
  const routeText = (id) => (snaps[id]?.route || []).map((s) => `${s.n}N ${s.city}`).join(" · ");

  // Selection-first: the user picks which two versions to compare.
  // Pre-tick the two latest versions that share the latest version's destination.
  const [picked, setPicked] = useState(() => {
    if (!list.length) return [];
    const d = list[0].destination;
    return list.filter((v) => v.destination === d).slice(0, 2).map((v) => v.id);
  });
  const [phase, setPhase] = useState("select"); // "select" | "compare"
  const [mode, setMode] = useState("diff");
  const [sheet, setSheet] = useState(null); // { type: "flight"|"hotel", item, label }

  if (!deal || list.length < 2) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, background: C.bg, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>Nothing to compare here.</p>
        <button onClick={() => navigate(-1)} style={{ border: "none", background: C.p600, color: "#fff", borderRadius: 12, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Back to My Plans</button>
      </div>
    );
  }

  const dest = list[0].destination ?? deal.dest;
  const nights = list[0].customizations?.travelDates?.nights;
  const flag = destFlags[dest] || "";

  // Comparison is same-destination only: block picking across destinations.
  const toggle = (id) => setPicked((p) => {
    if (p.includes(id)) return p.filter((x) => x !== id);
    if (p.length >= 2) return p;
    const locked = p.length ? list.find((x) => x.id === p[0])?.destination : null;
    const v = list.find((x) => x.id === id);
    if (locked && v?.destination !== locked) return p;
    return [...p, id];
  });

  // ── SELECT ──
  if (phase === "select") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg }}>
        <div style={{ flexShrink: 0, background: C.white, borderBottom: `1px solid ${C.div}`, padding: `12px ${PAD}px 12px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 34, height: 34, borderRadius: "50%", background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <ArrowLeft size={18} color={C.head} />
            </button>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{flag} {dest}{nights ? ` · ${nights}N` : ""}</p>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: C.head, margin: 0 }}>Compare versions</h1>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: C.sub, margin: "10px 0 0" }}>Pick two versions to compare.</p>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: `12px ${PAD}px 16px` }}>
          {(() => {
          const lockedDest = picked.length ? list.find((x) => x.id === picked[0])?.destination : null;
          return list.map((v) => {
            const on = picked.includes(v.id);
            const crossDest = !on && lockedDest && v.destination !== lockedDest;
            const dis = crossDest || (!on && picked.length >= 2);
            return (
              <button key={v.id} onClick={() => toggle(v.id)} disabled={dis}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11, border: `1.5px solid ${on ? C.p600 : C.div}`, background: on ? C.p100 : C.white, borderRadius: 13, padding: "12px 13px", marginBottom: 10, cursor: dis ? "not-allowed" : "pointer", opacity: dis ? 0.5 : 1 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `1.5px solid ${on ? C.p600 : C.icon}`, background: on ? C.p600 : C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {on && <Check size={13} color="#fff" strokeWidth={3} />}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: C.head }}>{v.label || `V${v.num}`}</span>
                    {v.id === list[0].id && <span style={{ fontSize: 9, fontWeight: 800, color: C.p600, background: C.p100, padding: "1px 6px", borderRadius: 999 }}>LATEST</span>}
                    <span style={{ flex: 1 }} />
                    {isWished(v.id) && <Heart size={15} color={C.p600} fill={C.p600} />}
                  </div>
                  {crossDest ? (
                    <p style={{ fontSize: 12, color: C.sub, margin: "3px 0 0" }}>Different trip · {v.destination}</p>
                  ) : (
                    <>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.head, margin: "4px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{routeText(v.id)}</p>
                      <p style={{ fontSize: 11.5, color: C.sub, margin: "2px 0 0" }}>Starts {shortDate(snaps[v.id]?.start)} · {snaps[v.id]?.nights}N</p>
                    </>
                  )}
                </div>
              </button>
            );
          });
          })()}
        </div>

        <div style={{ flexShrink: 0, background: C.white, borderTop: `1px solid ${C.div}`, padding: `10px ${PAD}px 12px`, boxShadow: "0 -4px 16px rgba(0,0,0,0.05)" }}>
          <button onClick={() => picked.length === 2 && setPhase("compare")} disabled={picked.length !== 2}
            style={{ width: "100%", minHeight: 48, borderRadius: 13, border: "none", background: picked.length === 2 ? C.p600 : C.bg, color: picked.length === 2 ? "#fff" : C.inact, fontSize: 15, fontWeight: 700, cursor: picked.length === 2 ? "pointer" : "default" }}>
            {picked.length === 2 ? "Compare these 2" : `Select ${2 - picked.length} more to compare`}
          </button>
        </div>
      </div>
    );
  }

  // ── COMPARE ──
  // Order: older (left, A) -> newer (right, B), so changes read as a progression.
  const [vA, vB] = [...picked]
    .map((id) => list.find((v) => v.id === id))
    .filter(Boolean)
    .sort((x, y) => x.num - y.num);
  const snapA = getVersionSnapshot(deal, vA);
  const snapB = getVersionSnapshot(deal, vB);
  const diff = compareVersions(snapA, snapB);

  const facets = [diff.dates.changed, diff.route.changed, diff.flights.changed, diff.stay.changed, diff.dayPlans.changed];
  const changedCount = facets.filter(Boolean).length;
  const hidden = mode === "diff" ? facets.length - changedCount : 0;
  const identical = !diff.price.changed && changedCount === 0;
  const show = (changed) => mode === "full" || changed;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg }}>
      {/* Header + version strip */}
      <div style={{ flexShrink: 0, background: C.white, borderBottom: `1px solid ${C.div}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `12px ${PAD}px 8px` }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 34, height: 34, borderRadius: "50%", background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <ArrowLeft size={18} color={C.head} />
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{flag} {dest} · {snapB.nights}N</p>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: C.head, margin: 0 }}>Compare versions</h1>
          </div>
          <button onClick={() => setPhase("select")} style={{ flexShrink: 0, border: "none", background: "none", color: C.p600, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Change</button>
        </div>
        <div style={{ display: "flex", gap: 10, padding: `4px ${PAD}px 12px` }}>
          {[{ v: vA }, { v: vB, latest: vB.id === list[0].id }].map(({ v, latest }) => (
            <div key={v.id} style={{ flex: 1, border: `1px solid ${C.div}`, borderRadius: 12, padding: "9px 11px", background: C.white }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.head }}>{v.label || `V${v.num}`}</span>
                <StatusChip status={v.status} small />
                {latest && <span style={{ fontSize: 9, fontWeight: 800, color: C.p600, background: C.p100, padding: "1px 6px", borderRadius: 999 }}>LATEST</span>}
              </div>
              <p style={{ fontSize: 11, color: C.sub, margin: "4px 0 0" }}>{genDate(v)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll body */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: `14px ${PAD}px 16px` }}>
        <PriceHero diff={diff} labelA={vA.label || `V${vA.num}`} labelB={vB.label || `V${vB.num}`} />

        <div style={{ display: "flex", background: SLATE_BG, borderRadius: 11, padding: 3, margin: "14px 0 6px" }}>
          {[{ k: "diff", l: "What changed" }, { k: "full", l: "Everything" }].map((o) => (
            <button key={o.k} onClick={() => setMode(o.k)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: mode === o.k ? C.white : "transparent", color: mode === o.k ? C.head : C.sub, boxShadow: mode === o.k ? "0 1px 2px rgba(16,24,40,0.08)" : "none" }}>{o.l}</button>
          ))}
        </div>
        {mode === "diff" && (
          <p style={{ fontSize: 11.5, color: C.sub, textAlign: "center", margin: "0 0 14px" }}>
            {identical ? "These two versions are identical." : `${changedCount} component${changedCount !== 1 ? "s" : ""} changed.${hidden ? ` ${hidden} identical hidden.` : ""}`}
          </p>
        )}

        {show(diff.dates.changed) && <DatesBlock dates={diff.dates} />}
        {show(diff.route.changed) && <RouteBlock route={diff.route} />}
        {show(diff.flights.changed) && <FlightsBlock flights={diff.flights} mode={mode} labelA={vA.label || `V${vA.num}`} labelB={vB.label || `V${vB.num}`} onOpen={(item, label) => setSheet({ type: "flight", item, label })} />}
        {show(diff.stay.changed) && <StayBlock stay={diff.stay} mode={mode} labelA={vA.label || `V${vA.num}`} labelB={vB.label || `V${vB.num}`} onOpen={(item, label) => setSheet({ type: "hotel", item, label })} />}
        {show(diff.dayPlans.changed) && <DaysBlock dp={diff.dayPlans} mode={mode} />}
      </div>

      {sheet?.type === "flight" && <FlightSheet f={sheet.item} label={sheet.label} onClose={() => setSheet(null)} />}
      {sheet?.type === "hotel" && <HotelSheet h={sheet.item} label={sheet.label} onClose={() => setSheet(null)} />}

      {/* Decide */}
      <div style={{ flexShrink: 0, background: C.white, borderTop: `1px solid ${C.div}`, padding: `10px ${PAD}px 12px`, display: "flex", gap: 10, boxShadow: "0 -4px 16px rgba(0,0,0,0.05)" }}>
        <VersionCTA deal={deal} ver={vA} />
        <VersionCTA deal={deal} ver={vB} primary />
      </div>
    </div>
  );
}

// ── Price hero ──
function PriceHero({ diff, labelA, labelB }) {
  const { a, b, delta, breakdown } = diff.price;
  const up = delta > 0;
  const Dir = up ? ArrowUpRight : ArrowDownRight;
  // Only a price drop is highlighted (green); an increase or no change reads black.
  const dirColor = delta < 0 ? C.sText : C.head;
  // Always list only the components that actually moved the price, in both
  // modes, so this summary card keeps a fixed height. That stops the mode
  // switch below it from jumping, and drops any misleading "No change" rows.
  const rows = breakdown.filter((d) => d.delta !== 0);

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.div}`, background: C.white, padding: 14 }}>
      <TwoCol
        a={<div><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{labelA}</p><p style={{ fontSize: 19, fontWeight: 800, color: C.head, margin: "2px 0 0" }}>{inr(a)}</p></div>}
        b={<div><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{labelB}</p><p style={{ fontSize: 19, fontWeight: 800, color: C.head, margin: "2px 0 0" }}>{inr(b)}</p></div>}
      />
      <p style={{ fontSize: 10.5, color: C.inact, margin: "4px 0 0" }}>Total incl. taxes</p>

      {delta !== 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 12px", borderRadius: 12, background: SLATE_BG }}>
          <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dir size={16} color={dirColor} />
          </div>
          <p style={{ fontSize: 13, color: C.head, margin: 0 }}>
            <b style={{ color: dirColor }}>{labelB} is {inr(Math.abs(delta))} {up ? "more" : "less"}</b> than {labelA}.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.sub, margin: "0 0 6px" }}>What moved the price</p>
          {rows.map((d) => {
            const c = d.delta < 0 ? C.sText : C.head;
            return (
              <div key={d.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderTop: `1px solid ${C.div}` }}>
                <span style={{ fontSize: 12.5, color: C.head }}>{d.label}</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: c }}>{d.delta === 0 ? "No change" : signed(d.delta)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Route ──
function RouteBlock({ route }) {
  const Side = ({ stops }) => (
    <div>
      {stops.map((s, i) => (
        <p key={i} style={{ fontSize: 13, color: C.head, margin: i ? "3px 0 0" : 0, lineHeight: "18px" }}>{s.city} {s.n}N</p>
      ))}
    </div>
  );
  return (
    <Block icon={Map} title="Route" changed={route.changed} tagLabel={route.sequenceChanged ? "Sequence changed" : "Changed"}>
      {route.sequenceChanged && (
        <p style={{ fontSize: 11.5, color: C.sub, margin: "0 0 8px" }}>Same places and nights, just a new order.</p>
      )}
      {route.changed
        ? <TwoCol a={<Side stops={route.a} />} b={<Side stops={route.b} />} />
        : <Side stops={route.b} />}
    </Block>
  );
}

// ── Flights ──
// Departure / arrival clock times, derived the same way as the detail drawer so
// the row and the drawer always agree.
const fmtTime = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
function flightTimes(f) {
  const [from, to] = (f.sector || "BOM to DPS").split(" to ");
  const seed = hashStr(`${f.sector}${f.airline}${f.dir}`);
  const depMin = (5 + (seed % 15)) * 60 + (seed % 4) * 15;
  const legMin = parseAir(f.airTime);
  const arr = depMin + legMin + (f.via && f.stops ? 70 : 0);
  return { from, to, dep: depMin, arr };
}
function FlightCol({ f, dir, onClick, tagKind }) {
  const t = flightTimes({ ...f, dir });
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: C.head, margin: 0, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.airline}</p>
        <DiffTag kind={tagKind} />
        <ChevronRight size={14} color={C.inact} style={{ flexShrink: 0 }} />
      </div>
      <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 0" }}>
        {t.from} {fmtTime(t.dep)} → {t.to} {fmtTime(t.arr)}{t.arr >= 1440 ? <span style={{ color: C.inact }}> +1</span> : ""}
      </p>
    </div>
  );
}
function FlightsBlock({ flights, labelA, labelB, onOpen, mode }) {
  // "What changed" lists only the legs that moved; "Everything" shows both.
  const dirs = mode === "diff" ? flights.dirs.filter((d) => d.changed) : flights.dirs;
  return (
    <Block icon={Plane} title="Flights" changed={flights.changed} showTag={false}>
      {dirs.map((d, i) => (
        <div key={d.dir} style={{ paddingTop: i ? 10 : 0, marginTop: i ? 10 : 0, borderTop: i ? `1px solid ${C.div}` : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: ".3px" }}>{d.dir}</span>
          </div>
          <TwoCol
            a={<FlightCol f={d.a} dir={d.dir} tagKind={d.changed ? "removed" : null} onClick={() => onOpen({ ...d.a, dir: d.dir }, `${labelA} · ${d.dir}`)} />}
            b={<FlightCol f={d.b} dir={d.dir} tagKind={d.changed ? "added" : null} onClick={() => onOpen({ ...d.b, dir: d.dir }, `${labelB} · ${d.dir}`)} />}
          />
        </div>
      ))}
    </Block>
  );
}

// ── Stay ──
// One stop on a version's stay timeline: region + dates/nights lead, an Added or
// Removed tag on the top right, hotel detail below. An empty slot (a stop that
// exists in only one version) reads as a faint dash so the columns stay aligned.
function StayStop({ h, onClick, tagKind }) {
  if (!h) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.inact }}>Not included</span>
        <DiffTag kind={tagKind} />
      </div>
    );
  }
  const selfBooked = h.selfBooked || h.hotel?.includes("booked by guest");
  return (
    <div onClick={selfBooked ? undefined : onClick} style={{ cursor: selfBooked ? "default" : "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.city}</span>
        <DiffTag kind={tagKind} />
      </div>
      <p style={{ fontSize: 10.5, color: C.inact, margin: "1px 0 3px" }}>{ddmm(h.checkIn)} - {ddmm(h.checkOut)} · {h.nights}N</p>
      {selfBooked ? (
        <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>Booked by guest</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: C.head, margin: 0, lineHeight: "16px", flex: 1 }}>{h.hotel}</p>
            <ChevronRight size={14} color={C.inact} style={{ flexShrink: 0, marginTop: 1 }} />
          </div>
          <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 0" }}>{h.room}</p>
          <p style={{ fontSize: 11, color: C.inact, margin: "2px 0 0" }}><span style={{ color: "#F5A623" }}>{"★".repeat(h.star)}</span></p>
        </>
      )}
    </div>
  );
}
// Which side carries which tag: a swap reads as Removed (old, left) + Added
// (new, right); an added or removed stop tags only the side it appears on.
function stayTagFor(status, side) {
  if (status === "added") return side === "b" ? "added" : null;
  if (status === "removed") return side === "a" ? "removed" : null;
  if (status === "swapped") return side === "a" ? "removed" : "added";
  return null;
}
function StayBlock({ stay, labelA, labelB, onOpen, mode }) {
  // Each version lists its own stays top to bottom (no head-on city alignment).
  // A tag marks the ones that moved; "What changed" shows only those.
  const statusByCity = Object.fromEntries(stay.rows.map((r) => [r.city, r.status]));
  const Col = ({ hotels, side, label }) => {
    const rows = hotels
      .map((h) => ({ h, tag: stayTagFor(statusByCity[h.city], side) }))
      .filter((r) => mode !== "diff" || r.tag);
    return (
      <div>
        {rows.map(({ h, tag }, i) => (
          <div key={h.seq ?? h.city} style={{ paddingTop: i ? 10 : 0, marginTop: i ? 10 : 0, borderTop: i ? `1px solid ${C.div}` : "none" }}>
            <StayStop h={h} tagKind={tag} onClick={() => onOpen(h, label)} />
          </div>
        ))}
      </div>
    );
  };
  return (
    <Block icon={BedDouble} title="Stay" changed={stay.changed} showTag={false}>
      <TwoCol
        a={<Col hotels={stay.aHotels} side="a" label={labelA} />}
        b={<Col hotels={stay.bHotels} side="b" label={labelB} />}
      />
    </Block>
  );
}

// ── Day plans (day by day, two columns) ──
function ActsCol({ day, addedCodes, removedCodes }) {
  if (!day) return <p style={{ fontSize: 15, fontWeight: 700, color: C.inact, margin: 0 }}>-</p>;
  return (
    <div>
      {day.activities.map((act, i) => {
        const kind = addedCodes?.has(act.code) ? "added" : removedCodes?.has(act.code) ? "removed" : null;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, margin: i ? "4px 0 0" : 0 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: act.category === "Tour" ? C.head : C.sub, lineHeight: "16px" }}>
              {act.title}
              {act.category !== "Tour" && <span style={{ color: C.inact }}> · {act.category.toLowerCase()}</span>}
            </span>
            <DiffTag kind={kind} />
          </div>
        );
      })}
    </div>
  );
}
function ActLine({ act, tone }) {
  return (
    <div style={{ display: "flex", gap: 7, alignItems: "flex-start", margin: "6px 0 0" }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: tone, lineHeight: "16px", flexShrink: 0 }}>{tone === C.p600 ? "+" : "−"}</span>
      <span style={{ fontSize: 12.5, color: C.head, lineHeight: "16px" }}>{act.title}{act.category !== "Tour" && <span style={{ color: C.inact }}> · {act.category.toLowerCase()}</span>}</span>
    </div>
  );
}

// "What changed" for tours & transfers: only what was added or removed across
// the trip (a tour moving to another day is not a change). Full mode = day view.
function DaysBlock({ dp, mode }) {
  if (mode === "diff") {
    return (
      <Block icon={MapPin} title="Tours & transfers" changed={dp.changed}>
        {dp.added.length > 0 && (
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: ".3px" }}>Added</span>
            {dp.added.map((act, i) => <ActLine key={`a${i}`} act={act} tone={C.p600} />)}
          </div>
        )}
        {dp.removed.length > 0 && (
          <div style={{ marginTop: dp.added.length ? 12 : 0 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: ".3px" }}>Removed</span>
            {dp.removed.map((act, i) => <ActLine key={`r${i}`} act={act} tone={C.inact} />)}
          </div>
        )}
      </Block>
    );
  }
  const rows = dp.rows;
  // Trip-level added / removed codes, so a tour that simply moves to another day
  // is not flagged; only a genuinely new or dropped item gets a tag.
  const addedCodes = new Set((dp.added || []).map((a) => a.code));
  const removedCodes = new Set((dp.removed || []).map((a) => a.code));
  return (
    <Block icon={MapPin} title="Day plans" changed={dp.changed} showTag={false}>
      {rows.map((row, i) => {
        const date = (row.a || row.b)?.date;
        return (
          <div key={row.day} style={{ paddingTop: i ? 10 : 0, marginTop: i ? 10 : 0, borderTop: i ? `1px solid ${C.div}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: ".3px" }}>Day {row.day}{date ? ` · ${shortDate(date)}` : ""}</span>
            </div>
            <TwoCol
              a={<ActsCol day={row.a} addedCodes={addedCodes} removedCodes={removedCodes} />}
              b={<ActsCol day={row.b} addedCodes={addedCodes} removedCodes={removedCodes} />}
            />
          </div>
        );
      })}
    </Block>
  );
}

// ── Dates & logistics ──
function DatesBlock({ dates }) {
  const paxStr = (d) => {
    const adults = Math.max(1, (d.travelers || 0) - (d.kids || 0));
    return `${adults} adult${adults !== 1 ? "s" : ""}${d.kids ? ` · ${d.kids} kid${d.kids !== 1 ? "s" : ""}` : ""}`;
  };
  const Val = ({ v }) => <p style={{ fontSize: 12.5, color: C.head, margin: 0, fontWeight: 600 }}>{v}</p>;
  const Field = ({ label, a, b, changed, i }) => (
    <div style={{ paddingTop: i ? 10 : 0, marginTop: i ? 10 : 0, borderTop: i ? `1px solid ${C.div}` : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: ".3px" }}>{label}</span>
        {changed && <ChangedTag />}
      </div>
      <TwoCol a={<Val v={a} />} b={<Val v={b} />} />
    </div>
  );
  return (
    <Block icon={CalendarDays} title="Dates & logistics" changed={dates.changed}>
      <Field i={0} label="Travel dates" a={`${shortDate(dates.a.start)} - ${shortDate(dates.a.end)}`} b={`${shortDate(dates.b.start)} - ${shortDate(dates.b.end)}`} changed={dates.fields.dates} />
      <Field i={1} label="Nights" a={`${dates.a.nights}N`} b={`${dates.b.nights}N`} changed={dates.fields.nights} />
      <Field i={2} label="Travellers" a={paxStr(dates.a)} b={paxStr(dates.b)} changed={dates.fields.pax} />
      <Field i={3} label="Departure" a={dates.a.dep} b={dates.b.dep} changed={dates.fields.dep} />
    </Block>
  );
}

// ── per-version CTA ──
function VersionCTA({ deal, ver, primary }) {
  const navigate = useNavigate();
  const open = () => {
    const itinId = ver.itineraryId ?? deal.itineraryId;
    navigate(`/itinerary/${itinId}?dealId=${deal.id}&versionId=${ver.id}`);
  };
  const label = ver.status === "draft" ? `Continue ${ver.label || `V${ver.num}`}` : `View ${ver.label || `V${ver.num}`}`;
  return (
    <button onClick={open} style={{ flex: 1, minHeight: 46, borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: "pointer", border: primary ? "none" : `1.5px solid ${C.div}`, background: primary ? C.p600 : C.white, color: primary ? "#fff" : C.head, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
      {label} <ArrowRight size={15} />
    </button>
  );
}

// ── bottom drawer shell ──
function Drawer({ title, onClose, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)" }} />
      <div className="hide-scrollbar" style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: "0 -8px 28px rgba(0,0,0,0.2)", maxHeight: "88%", overflowY: "auto" }}>
        <div style={{ position: "sticky", top: 0, background: C.white, paddingTop: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: C.div, margin: "0 auto 8px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: `2px ${PAD}px 10px`, borderBottom: `1px solid ${C.div}` }}>
            <p style={{ flex: 1, fontSize: 15, fontWeight: 800, color: C.head, margin: 0 }}>{title}</p>
            <button onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <XIcon size={16} color={C.head} />
            </button>
          </div>
        </div>
        <div style={{ padding: `14px ${PAD}px 22px` }}>{children}</div>
      </div>
    </div>
  );
}

// ── flight detail drawer (mirrors the flight detail screen) ──
const pad2 = (n) => String(n).padStart(2, "0");
function parseAir(t) { const m = /(\d+)h\s*(\d+)?/.exec(t || ""); return (Number(m?.[1]) || 8) * 60 + (Number(m?.[2]) || 0); }
function FlightSheet({ f, label, onClose }) {
  const [from, to] = (f.sector || "BOM to DPS").split(" to ");
  const seed = hashStr(`${f.sector}${f.airline}${f.dir}`);
  const depMin = (5 + (seed % 15)) * 60 + (seed % 4) * 15;
  const legMin = parseAir(f.airTime);
  const fmt = (mins) => `${pad2(Math.floor((mins % 1440) / 60))}:${pad2(mins % 60)}`;
  const flightNo = `${(f.airline.match(/[A-Z]/g) || ["6", "E"]).slice(0, 2).join("")} ${100 + (seed % 899)}`;
  const stops = f.via && f.stops ? [{ from, to: f.via, dep: depMin, arr: depMin + Math.round(legMin * 0.5) }, { from: f.via, to, dep: depMin + Math.round(legMin * 0.5) + 70, arr: depMin + legMin + 70 }]
    : [{ from, to, dep: depMin, arr: depMin + legMin }];
  return (
    <Drawer title={`Flight · ${label}`} onClose={onClose}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.head, margin: "0 0 4px" }}>{cityOf(from)} to {cityOf(to)}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <Clock size={12} color={C.sub} />
        <span style={{ fontSize: 12, color: C.sub }}>{f.airTime}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.p600 }}>· {f.stops === 0 ? "Non-stop" : `${f.stops} stop`}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Plane size={14} color={C.p600} /></div>
        <div><p style={{ fontSize: 13, fontWeight: 700, color: C.head, margin: 0 }}>{f.airline}</p><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{flightNo}</p></div>
      </div>
      {stops.map((s, i) => (
        <div key={i}>
          {i > 0 && <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "#FEF3F2", border: `1px solid ${C.p300}`, margin: "0 0 10px" }}><Clock size={10} color={C.p600} /><span style={{ fontSize: 11, fontWeight: 600, color: C.p600 }}>Layover at {f.via}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
            <div><p style={{ fontSize: 15, fontWeight: 800, color: C.head, margin: 0 }}>{fmt(s.dep)}</p><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{s.from} · {cityOf(s.from)}</p></div>
            <ArrowRight size={16} color={C.inact} />
            <div style={{ textAlign: "right" }}><p style={{ fontSize: 15, fontWeight: 800, color: C.head, margin: 0 }}>{fmt(s.arr)}</p><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{s.to} · {cityOf(s.to)}</p></div>
          </div>
          {i < stops.length - 1 && <div style={{ height: 1, background: C.div, margin: "8px 0" }} />}
        </div>
      ))}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><Luggage size={15} color={C.head} /><p style={{ fontSize: 13.5, fontWeight: 700, color: C.head, margin: 0 }}>Baggage</p></div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, border: `1px solid ${C.div}`, borderRadius: 10, padding: "9px 11px" }}><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>Cabin</p><p style={{ fontSize: 13, fontWeight: 700, color: C.head, margin: "2px 0 0" }}>7 kg</p></div>
          <div style={{ flex: 1, border: `1px solid ${C.div}`, borderRadius: 10, padding: "9px 11px" }}><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>Check-in</p><p style={{ fontSize: 13, fontWeight: 700, color: C.head, margin: "2px 0 0" }}>25 kg</p></div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Cancellation policy</p>
        <p style={{ fontSize: 12, color: C.sub, margin: "0 0 3px" }}>Cancellation allowed, airline charges apply.</p>
        <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>Date change permitted with a fare difference.</p>
      </div>
    </Drawer>
  );
}

// ── hotel detail drawer (mirrors the hotel detail screen) ──
const AMENITIES = [["Breakfast", Coffee], ["Free WiFi", Wifi], ["Swimming pool", Waves], ["Restaurant", UtensilsCrossed], ["Gym", Dumbbell]];
function HotelSheet({ h, label, onClose }) {
  const img = HOTEL_IMGS[hashStr(h.hotel) % HOTEL_IMGS.length];
  const rating = (8.0 + (hashStr(h.hotel) % 17) / 10).toFixed(1);
  return (
    <Drawer title={`Stay · ${label}`} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <HotelStayCard
          image={img}
          imageAlt={h.hotel}
          imageHeight={150}
          stars={h.star}
          ratingScore={rating}
          name={h.hotel}
          roomType={`${h.room} · ${h.meal} included`}
          city={h.city}
          showChevron={false}
        />
      </div>

      <div style={{ display: "flex", gap: 10, margin: "12px 0" }}>
        <div style={{ flex: 1, border: `1px solid ${C.div}`, borderRadius: 10, padding: "9px 11px" }}><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>Check in</p><p style={{ fontSize: 13, fontWeight: 700, color: C.head, margin: "2px 0 0" }}>{shortDate(h.checkIn)}</p></div>
        <div style={{ flex: 1, border: `1px solid ${C.div}`, borderRadius: 10, padding: "9px 11px" }}><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>Check out</p><p style={{ fontSize: 13, fontWeight: 700, color: C.head, margin: "2px 0 0" }}>{shortDate(h.checkOut)}</p></div>
        <div style={{ flex: 1, border: `1px solid ${C.div}`, borderRadius: 10, padding: "9px 11px" }}><p style={{ fontSize: 11, color: C.sub, margin: 0 }}>Nights</p><p style={{ fontSize: 13, fontWeight: 700, color: C.head, margin: "2px 0 0" }}>{h.nights}N</p></div>
      </div>

      <p style={{ fontSize: 13.5, fontWeight: 700, color: C.head, margin: "4px 0 8px" }}>Amenities</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {AMENITIES.map(([name, Icon]) => (
          <span key={name} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${C.div}`, borderRadius: 999, padding: "7px 12px", fontSize: 12, color: C.head }}>
            <Icon size={13} color={C.p600} /> {name}
          </span>
        ))}
      </div>

      <p style={{ fontSize: 13.5, fontWeight: 700, color: C.head, margin: "16px 0 6px" }}>About this stay</p>
      <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "19px" }}>
        {h.hotel} is a {h.star}-star property in {h.city}, with comfortable rooms, attentive service, and easy access to the area's highlights. A relaxed base for this leg of your trip.
      </p>
    </Drawer>
  );
}
