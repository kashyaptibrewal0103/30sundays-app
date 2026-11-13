import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowRight, User, Baby, ArrowLeftRight, AlertTriangle } from "lucide-react";
import SaveHeart from "./SaveHeart";
import { C, allItineraries } from "../data";
import { useDeals } from "../data/deals";
import PlanRef from "./PlanRef";

// Wishlist toggle shown on every version row (prototype: local state only).
const destFlags = { Thailand: "🇹🇭", Vietnam: "🇻🇳", Bali: "🇮🇩", Maldives: "🇲🇻", "Sri Lanka": "🇱🇰", "New Zealand": "🇳🇿" };

// A version (or a Maldives property quote) is a DRAFT (editable) or a QUOTE
// (a generated PDF, locked). Draft → continue editing; quote → view the PDF.
const isQuote = (v) => v.status === "quote";
const travellersOf = (v) => v.customizations?.travelDates?.travelers ?? 2;
const ppPrice = (v) => v.livePrice ?? v.indicativePrice ?? 0;
const fmt = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const total = (perPerson, t) => (perPerson || 0) * t;
const shortDate = (ts) => ts ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
// Travel window as a compact range, e.g. "26-31 Aug" or "28 Aug - 3 Sep".
const travelRange = (from, nights) => {
  if (!from) return null;
  const a = new Date(from);
  if (isNaN(a.getTime())) return null;
  const b = new Date(a.getTime() + (nights || 0) * 86400000);
  const mo = (d) => d.toLocaleDateString("en-IN", { month: "short" });
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()}-${b.getDate()} ${mo(a)}`
    : `${a.getDate()} ${mo(a)} - ${b.getDate()} ${mo(b)}`;
};

// Every plan is a finalised version now, so a normal plan needs no status label.
// Only an expired plan still calls it out.
function StatusChip({ kind }) {
  if (kind !== "expired") return null;
  return <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.bg, color: C.inact, flexShrink: 0 }}>Expired</span>;
}

// Marks an in-progress edit that hasn't been created yet.
function DraftChip() {
  return <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: C.p100, color: C.p600, letterSpacing: ".3px" }}>Draft</span>;
}

// The one action affordance per item: quote → View, draft → Continue editing.
function ActionLink({ quote }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: C.p600, whiteSpace: "nowrap" }}>
      {quote ? <>View <ArrowRight size={14} /></> : <>Continue editing <ArrowRight size={14} /></>}
    </span>
  );
}

// ─── Waiting on payment ───
//
// The consultant has sent the final plan and only confirming and paying is
// left. The card keeps its usual rows; what changes is that Review & Pay is
// the one solid button on it. Five ways of placing it are kept side by side
// on /pending-lab until one is picked; My Plans uses PENDING_DEFAULT.
export const PENDING_VARIANTS = [
  { key: "banner-pill", name: "Button in the banner", note: "Same rows as today. The banner's Review link becomes a solid pink button, and View goes grey." },
  { key: "price-pill", name: "Button next to the price", note: "Review & Pay takes View's place beside the price. The banner below is just the message." },
  { key: "status-top", name: "Status first", note: "The banner moves up under the trip details, so it reads: status, price, then the button." },
  { key: "white-banner", name: "Lighter banner", note: "No yellow fill. A thin amber line with an outlined pink button, View in grey." },
  { key: "header-chip", name: "Status chip", note: "The status becomes a small chip in the trip details. No banner row; the button sits by the price." },
];
export const PENDING_DEFAULT = "banner-pill";

const AMBER = { text: "#B54708", fill: "#FEF9E7", line: "#F5DFA0" };

function PayButton({ onClick, outline = false }) {
  return (
    <button
      data-testid="review-pay"
      onClick={onClick}
      style={{
        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
        padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
        fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
        border: outline ? `1.5px solid ${C.p600}` : "none",
        background: outline ? C.white : C.p600,
        color: outline ? C.p600 : "#fff",
        boxShadow: outline ? "none" : "0 3px 10px rgba(227,27,83,0.25)",
      }}
    >
      Review & Pay <ArrowRight size={14} />
    </button>
  );
}

function PendingNote({ action, white = false, top = false }) {
  return (
    <div data-testid="awaiting-pay" style={{
      display: "flex", alignItems: "center", gap: 8, padding: action ? "9px 12px" : "10px 12px",
      background: white ? C.white : AMBER.fill,
      borderTop: `1px solid ${white ? C.bg : AMBER.line}`,
      borderBottom: top ? `1px solid ${AMBER.line}` : "none",
    }}>
      <AlertTriangle size={15} color={AMBER.text} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: AMBER.text, lineHeight: "17px" }}>
        Confirmation and payment pending
      </span>
      {action}
    </div>
  );
}

// ONE card template per deal. Header (destination, version, status) + the
// itinerary facts (route with nights, dates, travellers, generated-on) + the
// price(s) with their action. Maldives shows one priced row per property.
export default function TripPlanCard({ deal, onOpen, onStartNew, onSaved, planId, pastNote, pendingVariant = PENDING_DEFAULT }) {
  const [open, setOpen] = useState(false);
  const { isWished, toggleWish } = useDeals();
  const navigate = useNavigate();
  // Toggle the heart and, when it turns ON, let the parent raise a "saved" toast.
  const handleWish = (id) => {
    const nowOn = !isWished(id);
    toggleWish(id);
    if (nowOn) onSaved?.(dest);
  };
  const lost = deal.status === "lost";
  const sorted = [...deal.versions].sort((a, b) => b.num - a.num);
  const latest = sorted[0];
  const draftV = sorted.find(v => !isQuote(v));
  const quoteV = sorted.find(isQuote);

  // Lead with the open draft if any, else the latest quote.
  const primary = lost ? (quoteV ?? latest) : (draftV ?? quoteV ?? latest);
  const primaryIsQuote = isQuote(primary);
  const stateKind = lost ? "expired" : (primaryIsQuote ? "quote" : "draft");

  // A "draft" card is the in-progress edit split out from its created versions.
  // It shows a Draft tag, no Compare, and the version it was built on (V2) - or
  // no version at all if the trip was never created.
  const isDraftCard = deal.cardKind === "draft";
  const versionBadgeNum = isDraftCard ? deal.baseNum : primary.num;
  const showVersionBadge = versionBadgeNum != null;
  const awaiting = !lost && !isDraftCard && primaryIsQuote && !!deal.awaitingPayment;
  const pv = awaiting ? pendingVariant : null;

  const dest = primary.destination ?? deal.dest;
  const itin = allItineraries.find(i => i.id === (primary.itineraryId ?? deal.itineraryId));
  const td = primary.customizations?.travelDates;
  const t = travellersOf(primary);
  const nights = td?.nights ?? itin?.nights ?? itin?.route?.reduce((s, r) => s + (r.n || 0), 0);
  const route = itin?.route?.length
    ? itin.route.map(r => `${r.city} ${r.n}N`).join(" · ")
    : (primary.title ?? deal.title);
  const kids = td?.kids || 0;
  const adults = Math.max(1, t - kids);
  const dateStr = shortDate(td?.fromDate);
  const generatedOn = shortDate(primaryIsQuote ? primary.pricedAt : primary.createdAt);

  // Every list card leads with destination + nights, like the others. Maldives is
  // per-property, so the resort name moves to the subtitle. (Same property's quotes
  // are its versions; the resort-centric detail screen keeps its full treatment.)
  const property = deal.property;
  const titleText = `${destFlags[dest] || ""} ${dest}${nights ? ` · ${nights}N` : ""}`;
  const routeText = property ? property : route;
  const earlier = sorted.filter(v => v.id !== primary.id);

  const Header = (
    <div onClick={() => onOpen(primary)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 12px 11px", cursor: "pointer" }}>
      <img src={deal.img} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", flexShrink: 0, filter: lost ? "grayscale(0.6)" : "none" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {titleText}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {!lost && <SaveHeart size={30} saved={isWished(primary.id)} onToggle={() => handleWish(primary.id)} />}
            {showVersionBadge && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: C.bg, color: C.sub, letterSpacing: ".3px" }}>V{versionBadgeNum}</span>}
            {isDraftCard && <DraftChip />}
            <StatusChip kind={stateKind} />
          </div>
        </div>
        <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.head, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{routeText}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "2px 0 0", fontSize: 11.5, color: C.sub }}>
          {dateStr && <span>{dateStr}</span>}
          {dateStr && <span>·</span>}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{adults}<User size={12} /></span>
          {kids > 0 && <><span>·</span><span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{kids}<Baby size={12} /></span></>}
        </div>
        {!isDraftCard && generatedOn && (
          <p style={{ margin: "1px 0 0", fontSize: 11, color: C.inact, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            Generated {generatedOn}
            {pv === "header-chip" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: AMBER.fill, color: AMBER.text, border: `1px solid ${AMBER.line}`, whiteSpace: "nowrap" }}>
                <AlertTriangle size={11} /> Payment pending
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );

  // Lost / expired → muted summary in the "past plans" accordion. The price is
  // the one it was quoted at, so it carries the date it was quoted on.
  if (lost) {
    return (
      <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden", background: C.white, opacity: 0.72 }}>
        {Header}
        <div onClick={() => onStartNew?.()} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "11px 12px", borderTop: `1px solid ${C.bg}`, cursor: "pointer" }}>
          <span style={{ fontSize: 12.5, color: C.sub, minWidth: 0 }}>{pastNote || "This plan is closed"}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.p600, flexShrink: 0 }}>View →</span>
        </div>
        {planId && <PlanRef id={planId} />}
      </div>
    );
  }

  const priceCaption = <span style={{ fontSize: 11, fontWeight: 500, color: C.sub }}> {isDraftCard ? "indicative" : "incl. taxes"}</span>;

  // Compare is only offered on the created card, when two or more versions
  // share a destination. A draft card never offers it.
  const comparable = !isDraftCard && Object.values(
    sorted.reduce((m, v) => { const d = v.destination || deal.dest; m[d] = (m[d] || 0) + 1; return m; }, {})
  ).some(n => n >= 2);
  const goPay = (e) => {
    e.stopPropagation();
    navigate(`/itinerary/${primary.itineraryId ?? deal.itineraryId}/payment-plan?pp=${Math.round(ppPrice(primary))}&t=${t}`);
  };
  const goCompare = (e) => {
    e.stopPropagation();
    const p = deal.property ? `?prop=${encodeURIComponent(deal.property)}` : "";
    navigate(`/compare/${deal.dealId ?? deal.id}${p}`);
  };

  return (
    <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden", background: C.white }}>
      {Header}

      {pv === "status-top" && <PendingNote top />}

      {/* One final price + one action. While payment is pending the action
          is Review & Pay wherever the variant puts it, and View steps back. */}
      <div onClick={() => onOpen(primary)} style={{ display: "flex", alignItems: "center", gap: 8, padding: pv && ["price-pill", "status-top", "header-chip"].includes(pv) ? "9px 12px" : "11px 12px", borderTop: pv === "status-top" ? "none" : `1px solid ${C.bg}`, cursor: "pointer" }}>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: C.head }}>{fmt(total(ppPrice(primary), t))}{priceCaption}</span>
        {pv && ["price-pill", "status-top", "header-chip"].includes(pv)
          ? <PayButton onClick={goPay} />
          : pv
            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: C.sub, whiteSpace: "nowrap" }}>View <ArrowRight size={14} /></span>
            : <ActionLink quote={primaryIsQuote} />}
      </div>

      {pv === "banner-pill" && <PendingNote action={<PayButton onClick={goPay} />} />}
      {pv === "price-pill" && <PendingNote />}
      {pv === "white-banner" && <PendingNote white action={<PayButton onClick={goPay} outline />} />}

      {/* Quiet expander — earlier versions (V1, V2 …) */}
      {earlier.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", width: "100%", borderTop: `1px solid ${C.bg}` }}>
            <div onClick={() => setOpen(o => !o)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", cursor: "pointer" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>{earlier.length} earlier version{earlier.length !== 1 ? "s" : ""}</span>
              <ChevronDown size={15} color={C.sub} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
            </div>
            {comparable && (
              <button onClick={goCompare} style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                <ArrowLeftRight size={14} color={C.head} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.head }}>Compare</span>
              </button>
            )}
          </div>
          {open && earlier.map(v => {
            const vItin = allItineraries.find(i => i.id === (v.itineraryId ?? deal.itineraryId));
            const vTd = v.customizations?.travelDates;
            const vNights = vTd?.nights ?? vItin?.nights ?? vItin?.route?.reduce((s, r) => s + (r.n || 0), 0);
            const vRoute = vItin?.route?.length ? vItin.route.map(r => r.city).join(" · ") : (v.title ?? deal.title);
            const vDates = travelRange(vTd?.fromDate, vNights);
            return (
              <div key={v.id} onClick={() => onOpen(v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px 9px 14px", borderTop: `1px solid ${C.bg}`, cursor: "pointer" }}>
                <SaveHeart size={30} saved={isWished(v.id)} onToggle={() => handleWish(v.id)} />
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: C.bg, color: C.sub, flexShrink: 0 }}>V{v.num}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{vRoute}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {vDates ? `${vDates} · ` : ""}{fmt(total(ppPrice(v), travellersOf(v)))}
                  </p>
                </div>
                <ArrowRight size={13} color={C.inact} style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </>
      )}

    </div>
  );
}
