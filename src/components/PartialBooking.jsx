import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Lock, Clock, CalendarCheck, AlertTriangle, X as XIcon, ShieldCheck, ArrowRight, Info, Download, CreditCard, Copy, Landmark, ArrowLeft, Link2, ExternalLink } from "lucide-react";
import { C } from "../data";
import { useDeals } from "../data/deals";
import { partialOf, resolvePartial, countWords, fmtINR, fmtDay } from "../data/partial";

// ─── A trip that is partly booked ───
//
// Some flights or hotels on this trip are booked (or sent by the consultant
// to be confirmed and paid). The trip screen asks this hook, item by item,
// what is locked. A locked item loses its change buttons and gets a lock,
// a Booked tag and an i: tapping it says why it cannot change, and that the
// dates, cities and travellers are fixed with it. When every hotel (or every
// flight) is booked, the tag sits once by the section's heading instead of
// on each card. Anything booked has its voucher to download.
//
// It also hands back the payment block (what was paid, what is to come, and
// the consent), a strip for a booking still waiting on the customer, and
// the consent screen. Customer-facing words say "booked", never "sold".

const GREEN = { text: C.sText, fill: C.sBg, line: C.sBorder };
const AMBER = { text: C.wText, fill: C.wBg, line: "#F5DFA0" };

function Chip({ tone, children }) {
  const t = tone === "green" ? GREEN : tone === "amber" ? AMBER : tone === "pink" ? { text: C.p600, fill: C.white, line: C.p300 } : { text: C.sub, fill: C.bg, line: C.div };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: t.fill, color: t.text, border: `1px solid ${t.line}`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// ─── A question and its answer, always the last thing in its card ───
function Faq({ q, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.bg}` }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ display: "flex", alignItems: "center", gap: 6, padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.b600, textAlign: "left" }}>
        <ChevronDown size={15} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
        {q}
      </button>
      {open && <p style={{ margin: "6px 0 0 21px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>{children}</p>}
    </div>
  );
}

// ─── One traveller on the consent screen ───
//
// Closed, a card shows the name and, only when something is missing, one
// pill. Open, it shows the details. A traveller with no passport on file
// gets one short note: check these against the passport.
const TRAVELLERS = [
  { first: "Rahul", last: "Mehta", dob: "3 Oct 1995", gender: "Male", passport: true },
  { first: "Ananya", last: "Mehta", dob: "21 May 1997", gender: "Female", passport: false },
];

function TravellerCard({ t }) {
  const [open, setOpen] = useState(false);
  const field = (label, value) => (
    <div>
      <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: ".4px", color: C.inact }}>{label.toUpperCase()}</p>
      <p style={{ margin: "2px 0 0", fontSize: 13, color: C.head }}>{value || "Not given"}</p>
    </div>
  );
  return (
    <div style={{ borderTop: `1px solid ${C.bg}` }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 0", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>{t.first} {t.last}</span>
        {!t.passport && <Chip tone="amber">Passport pending</Chip>}
        <ChevronDown size={16} color={C.sub} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <div style={{ paddingBottom: 12 }}>
          {!t.passport && (
            <p style={{ margin: "0 0 10px", fontSize: 12, color: C.wText, lineHeight: "17px", display: "flex", gap: 6 }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              Check these against your passport. Fixing them later can cost extra.
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
            {field("First name", t.first)}
            {field("Last name", t.last)}
            {field("Date of birth", t.dob)}
            {field("Gender", t.gender)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── The i, and what it says ───
//
// A small dark note under (or over) whatever was tapped, drawn on top of the
// page so a card's rounded corners cannot clip it. Any other tap, or a
// scroll, puts it away.
function Tip({ anchor, text, onClose }) {
  const [pos, setPos] = useState(null);
  useEffect(() => {
    const r = anchor.getBoundingClientRect();
    const w = 248;
    const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w + 10));
    const below = window.innerHeight - r.bottom > 150;
    setPos({ left, w, top: below ? r.bottom + 8 : null, bottom: below ? null : window.innerHeight - r.top + 8 });
    const away = (e) => { if (!anchor.contains(e.target)) onClose(); };
    const t = setTimeout(() => document.addEventListener("pointerdown", away), 0);
    window.addEventListener("scroll", onClose, true);
    return () => { clearTimeout(t); document.removeEventListener("pointerdown", away); window.removeEventListener("scroll", onClose, true); };
  }, [anchor, onClose]);
  if (!pos) return null;
  return createPortal(
    <div data-testid="booked-tip" role="tooltip" style={{
      position: "fixed", zIndex: 400, left: pos.left, width: pos.w, top: pos.top ?? undefined, bottom: pos.bottom ?? undefined,
      background: C.head, color: "#fff", borderRadius: 12, padding: "10px 12px", fontSize: 12.5, lineHeight: "18px",
      fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontFamily: "inherit",
    }}>
      {text}
    </div>,
    document.body
  );
}

// The lock, the Booked tag and the i, as one thing to tap.
export function BookedChip({ status = "booked", tip, label, onPhoto }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const pending = status !== "booked";
  const t = pending ? AMBER : GREEN;
  const word = label || (status === "booked" ? "Booked" : status === "confirm" ? "To confirm" : "On hold");
  return (
    <>
      <button
        ref={ref}
        data-testid="booked-chip"
        aria-label={`${word}. ${tip}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 7px 4px 8px", borderRadius: 999,
          border: onPhoto ? "none" : `1px solid ${t.line}`, background: onPhoto ? C.white : t.fill, color: t.text,
          fontSize: 11.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
          boxShadow: onPhoto ? "0 1px 6px rgba(0,0,0,0.22)" : "none",
        }}
      >
        {pending ? <Clock size={12} strokeWidth={2.4} /> : <Lock size={12} strokeWidth={2.4} />}
        {word}
        <Info size={13} strokeWidth={2.2} style={{ marginLeft: 1, opacity: 0.85 }} />
      </button>
      {open && ref.current && <Tip anchor={ref.current} text={tip} onClose={() => setOpen(false)} />}
    </>
  );
}

// The voucher for something booked. A prototype: it says it downloaded.
export function VoucherLink({ label = "Download voucher", block }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return undefined;
    const t = setTimeout(() => setDone(false), 2500);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      data-testid="voucher"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDone(true); }}
      style={block ? {
        width: "100%", height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 12,
        border: `1.5px solid ${C.p600}`, background: C.white, color: C.p600, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      } : {
        display: "inline-flex", alignItems: "center", gap: 6, padding: 0, border: "none", background: "none",
        color: done ? C.sText : C.p600, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {done ? <Check size={14} strokeWidth={2.6} /> : <Download size={14} />}
      {done ? "Voucher downloaded" : label}
    </button>
  );
}

function Frame({ frame, onClose, children, full }) {
  return (
    <div style={{ ...frame, zIndex: 90, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.45)" }} />
      <div style={{
        position: "relative", background: C.white, width: "100%", boxSizing: "border-box",
        borderRadius: full ? 0 : "20px 20px 0 0", maxHeight: full ? "100%" : "88%", height: full ? "100%" : "auto",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}

// A group in the consent screen: a heading with its chip, opening to a list.
function Group({ icon: Icon, title, chip, tone, items, note, defaultOpen = false, last }) {
  const [open, setOpen] = useState(defaultOpen);
  const canOpen = items?.length > 0;
  return (
    <div style={{ borderBottom: last ? "none" : `1px solid ${C.bg}` }}>
      <button onClick={() => canOpen && setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 0", border: "none", background: "none", cursor: canOpen ? "pointer" : "default", fontFamily: "inherit", textAlign: "left" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: tone === "green" ? GREEN.fill : tone === "pink" ? C.p100 : C.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={16} color={tone === "green" ? GREEN.text : tone === "pink" ? C.p600 : C.sub} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.head }}>{title}</span>
          <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5 }}>{chip}</span>
        </span>
        {canOpen && <ChevronDown size={17} color={C.sub} style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />}
      </button>
      {note && <p style={{ margin: "-4px 0 12px 44px", fontSize: 12, color: C.sub, lineHeight: "17px" }}>{note}</p>}
      {open && (
        <div style={{ margin: "0 0 12px 44px", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((x, i) => (
            <div key={i} style={{ border: `1px solid ${C.div}`, borderRadius: 10, padding: "8px 10px" }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.head }}>{x.title}</p>
              {x.sub && <p style={{ margin: "2px 0 0", fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>{x.sub}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export function usePartial({ deal, dealId, dest, travellers, dateLabel, fromCity, frame, legs = [], chosen = [], stays = [], legAmount = () => 0, stayAmount = () => 0, total = 0 }) {
  const { patchDeal } = useDeals();
  const info = partialOf(deal);
  const [consent, setConsent] = useState(null); // "confirm" | "view"
  // Opened from My Plans' Confirm and pay: straight to the consent screen.
  useEffect(() => {
    if (info?.linkLive && new URLSearchParams(window.location.search).get("confirm") === "1") setConsent("confirm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const off = { on: false, linkLive: false, flightLock: () => null, hotelLock: () => null, cityLocked: false, allFlights: false, allHotels: false, tip: () => "", topStrip: null, paymentBlock: null, overlays: null };
  if (!info) return off;

  const { linkLive } = info;
  const r = resolvePartial(info, legs, stays.length);
  // A booked item shows Booked; one sent to confirm shows To confirm; while a
  // link is out, everything else is on hold until the customer answers.
  const flightLock = (i) => r.flight[i]?.status || (linkLive ? "hold" : null);
  const hotelLock = (i) => r.hotel[i]?.status || (linkLive ? "hold" : null);
  const intlFixed = Object.keys(r.flight).some((i) => legs[i]?.type === "international");
  const cityLocked = intlFixed || linkLive;

  const legItem = (i) => {
    const l = legs[i]; const f = chosen[i];
    return { title: `${l?.fromCity || l?.from} to ${l?.toCity || l?.to}`, sub: [f?.airline, l?.date].filter(Boolean).join(" · ") };
  };
  const stayItem = (i) => ({ title: stays[i]?.name, sub: [stays[i]?.city, stays[i]?.dayRange].filter(Boolean).join(" · ") });

  // What is still open, in the customer's words.
  const openFlights = legs.filter((l, i) => chosen[i] && !r.flight[i]).length;
  const openHotels = stays.filter((h, i) => !r.hotel[i]).length;
  const later = [
    openFlights && `${openFlights} flight${openFlights === 1 ? "" : "s"}`,
    openHotels && `${openHotels} hotel${openHotels === 1 ? "" : "s"}`,
    "Day plans", "Visa",
  ].filter(Boolean);

  // One payment row per booking.
  const rows = info.bookings.map((b, bi) => {
    const it = r.items(bi);
    const amount = it.flights.reduce((s, i) => s + legAmount(i), 0) + it.hotels.reduce((s, i) => s + stayAmount(i), 0);
    // Covered by money already paid: nothing to pay now, only to confirm.
    const payNow = b.status === "confirm" && b.covered ? 0 : amount;
    return { b, bi, it, amount, payNow, words: countWords(it.flights.length, it.hotels.length) };
  });
  const paid = rows.filter((x) => x.b.status === "booked").reduce((s, x) => s + x.amount, 0);
  const dueRows = rows.filter((x) => x.b.status === "confirm");
  const dueValue = dueRows.reduce((s, x) => s + x.amount, 0);
  const due = dueRows.reduce((s, x) => s + x.payNow, 0);
  const rest = Math.max(0, total - paid - dueValue);

  // Every flight, or every hotel, booked: said once, by the heading.
  const flown = legs.map((l, i) => i).filter((i) => chosen[i]);
  const allFlights = flown.length > 0 && flown.every((i) => r.flight[i]?.status === "booked");
  const allHotels = stays.length > 0 && stays.every((h, i) => r.hotel[i]?.status === "booked");

  // What the i says.
  const tip = (kind, status, many = false) => {
    if (status === "confirm") return `Your consultant has sent ${many ? "these" : "this"} to be booked. Confirm and pay to book ${many ? "them" : "it"}. Until then, nothing on this trip can change.`;
    if (status !== "booked") return "On hold while part of your trip waits for your confirmation and payment.";
    const it = many ? `these ${kind}s` : `this ${kind}`;
    const pron = many ? "them" : "it";
    return `${many ? "These" : "This"} ${kind}${many ? "s" : ""} can't be changed because we have already booked ${pron}. Your dates, cities${kind === "flight" ? ", departure city" : ""} and travellers are fixed with ${pron}. To change ${it}, talk to your consultant; the ${kind === "flight" ? "airline" : "hotel"} may charge for it.`;
  };

  // ─── Only while a link waits on the customer ───
  const topStrip = linkLive && (
    <div data-testid="partial-pending" style={{ margin: "2px 16px 12px", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: AMBER.fill, border: `1px solid ${AMBER.line}`, borderRadius: 12 }}>
      <AlertTriangle size={15} color={AMBER.text} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: AMBER.text, lineHeight: "17px" }}>{due ? "Confirmation and payment pending" : "Waiting for your confirmation"}</span>
      <button data-testid="partial-confirm" onClick={() => setConsent("confirm")} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999, border: "none", background: C.p600, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
        {due ? "Confirm and pay" : "Confirm"} <ArrowRight size={13} />
      </button>
    </div>
  );

  // ─── Payment, under the cost breakdown ───
  const paymentBlock = (
    <div data-testid="partial-payment" style={{ padding: "0 16px" }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 12px" }}>Payment</p>
      <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden" }}>
        {rows.map((x) => (
          <div key={x.bi} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.div}`, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.5, color: C.head, fontWeight: 600 }}>{x.b.status === "booked" ? `${x.b.covered ? "Booked" : "Paid"} on ${fmtDay(x.b.at)}` : x.payNow ? "Pay now" : "Nothing to pay now"}</span>
              <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 1 }}>For {x.words}{x.b.covered ? `, covered by what you ${x.b.status === "booked" ? "had" : "have"} paid` : ""}</span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.head }}>{fmtINR(x.b.status === "booked" ? x.amount : x.payNow)}</span>
          </div>
        ))}
        <div style={{ padding: "12px 14px", display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13.5, color: C.head, fontWeight: 600 }}>Finalise later</span>
            <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 1 }}>For {later.join(", ").toLowerCase()} · tentative</span>
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.sub }}>{fmtINR(rest)}</span>
        </div>
        {info.consentAt && !linkLive && (
          <button onClick={() => setConsent("view")} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "11px 14px", border: "none", borderTop: `1px solid ${C.div}`, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <ShieldCheck size={15} color={GREEN.text} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12, color: C.sub }}>Consent and payment terms accepted on {fmtDay(info.consentAt)}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: C.p600 }}>View</span>
          </button>
        )}
      </div>
      <p style={{ fontSize: 11, color: C.inact, margin: "8px 2px 0", lineHeight: "15px" }}>Instalments are set once every part is booked.</p>
    </div>
  );

  // The consent screen reads the bookings waiting on the customer, or, when
  // opened to view, the ones already accepted.
  const shown = consent === "view" ? rows.filter((x) => x.b.status === "booked") : dueRows;
  const nowItems = shown.flatMap((x) => [...x.it.flights.map(legItem), ...x.it.hotels.map(stayItem)]);
  const nowWords = countWords(shown.reduce((s, x) => s + x.it.flights.length, 0), shown.reduce((s, x) => s + x.it.hotels.length, 0));
  // Booked before this one: shown as Already finalised, so the whole trip
  // reads in the same three groups the consultant sees.
  const before = consent === "confirm" ? rows.filter((x) => x.b.status === "booked") : [];
  const beforeItems = before.flatMap((x) => [...x.it.flights.map(legItem), ...x.it.hotels.map(stayItem)]);
  const beforeAmount = before.reduce((s, x) => s + x.amount, 0);
  const beforeWords = countWords(before.reduce((s, x) => s + x.it.flights.length, 0), before.reduce((s, x) => s + x.it.hotels.length, 0));
  const consentScreen = consent && (
    <ConsentScreen
      frame={frame} view={consent === "view"} consentAt={info.consentAt} dest={dest} dateLabel={dateLabel} travellers={travellers} fromCity={fromCity}
      nowItems={nowItems} nowWords={nowWords} hasFlights={shown.some((x) => x.it.flights.length)} hasHotels={shown.some((x) => x.it.hotels.length)}
      later={later} amount={consent === "view" ? paid : due} rest={rest} beforeItems={beforeItems} beforeWords={beforeWords} beforeAmount={beforeAmount}
      onClose={() => setConsent(null)}
      onPaid={() => {
        const now = Date.now();
        patchDeal(dealId, (d) => ({
          partial: {
            ...d.partial,
            consentAt: now,
            bookings: d.partial.bookings.map((b) => (b.status === "confirm" ? { ...b, status: "booked", at: now } : b)),
          },
        }));
      }}
    />
  );

  return { on: true, linkLive, flightLock, hotelLock, cityLocked, allFlights, allHotels, tip, topStrip, paymentBlock, overlays: consentScreen };
}

// ─── Confirm and pay, with consent ───
//
// Follows the consent link screen: what is booked now, what is finalised
// later, who is travelling, the terms, and one consent before paying. Opened
// to view, it shows what was agreed, with no payment.
function ConsentScreen({ frame, view, consentAt, dest, dateLabel, travellers, fromCity, nowItems, nowWords, hasFlights, hasHotels, later, amount, rest, beforeItems = [], beforeWords = "", beforeAmount = 0, onClose, onPaid }) {
  const [agreed, setAgreed] = useState(view);
  const [stage, setStage] = useState("review"); // review | method | paying | done | transfer
  const [bankOpen, setBankOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const copy = (key, text) => {
    try { navigator.clipboard?.writeText(text); } catch { /* not allowed here */ }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? "" : c)), 1500);
  };
  // Once paid, nothing is waiting any more; the thank-you keeps the words
  // it opened with.
  const [doneWords] = useState(nowWords);
  const [doneOne] = useState(nowItems.length === 1);

  const pay = () => {
    setStage("paying");
    setTimeout(() => { onPaid(); setStage("done"); }, 1300);
  };

  const box = { border: `1px solid ${C.div}`, borderRadius: 16, padding: "14px 14px", background: C.white };
  const h = (t, chip) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>{t}</p>
      {chip}
    </div>
  );

  if (stage === "done") {
    return (
      <Frame frame={frame} onClose={onClose} full>
        <div data-testid="partial-done" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" }}>
          <span style={{ width: 64, height: 64, borderRadius: "50%", background: GREEN.fill, display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Check size={30} color={GREEN.text} strokeWidth={3} />
          </span>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.head }}>Your {doneWords} {doneOne ? "is" : "are"} booked</p>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>
            We have sent the details on WhatsApp and email. Your trip stays in My Plans while you finish the rest with your consultant.
          </p>
          <button onClick={onClose} style={{ marginTop: 22, padding: "13px 26px", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Back to my trip</button>
        </div>
      </Frame>
    );
  }

  // Paid by bank transfer: nothing is booked until the money reaches us.
  if (stage === "transfer") {
    return (
      <Frame frame={frame} onClose={onClose} full>
        <div data-testid="partial-transfer" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" }}>
          <span style={{ width: 64, height: 64, borderRadius: "50%", background: AMBER.fill, display: "grid", placeItems: "center", marginBottom: 16 }}>
            <Clock size={28} color={AMBER.text} />
          </span>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.head }}>We are checking your transfer</p>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>
            We book your {doneWords} once it reaches us, usually within a working day. We will tell you on WhatsApp.
          </p>
          <button onClick={onClose} style={{ marginTop: 22, padding: "13px 26px", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Back to my trip</button>
        </div>
      </Frame>
    );
  }

  // How to pay. Pay online is the one main button; a bank transfer is
  // there for those who want it, folded away, with a plain outline button.
  if (stage === "method" || (stage === "paying" && amount)) {
    const BANK = [["Name", "Brance Technologies Pvt. Ltd."], ["Account no.", "50200078451236"], ["IFSC", "HDFC0000123"], ["Bank", "HDFC Bank, Koramangala, Bengaluru"]];
    return (
      <Frame frame={frame} onClose={onClose} full>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.div}` }}>
          <button aria-label="Back" onClick={() => setStage("review")} style={{ border: "none", background: C.bg, width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer" }}><ArrowLeft size={16} color={C.head} /></button>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>Your payment</p>
        </div>
        <div data-testid="partial-method" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px", background: "#FAFAFA", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={box}>
            <p style={{ margin: 0, fontSize: 12, color: C.sub }}>Due today <span style={{ color: C.wText, fontWeight: 600 }}>· for {nowWords}</span></p>
            <p style={{ margin: "4px 0 14px", fontSize: 26, fontWeight: 700, color: C.head }}>{fmtINR(amount)}</p>
            <button data-testid="partial-pay-online" disabled={stage === "paying"} onClick={pay} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 16px", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <CreditCard size={17} /> {stage === "paying" ? "Paying..." : `Pay online ${fmtINR(amount)}`}
            </button>
            <p style={{ margin: "8px 0 0", fontSize: 11.5, color: C.sub, textAlign: "center" }}>UPI, card or net banking</p>
            <button onClick={() => copy("link", "https://pay.30sundays.club/demo")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 10, padding: 0, border: "none", background: "none", color: C.b600, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Link2 size={14} /> {copied === "link" ? "Link copied" : "Copy payment link for someone else"}
            </button>
            <p style={{ margin: "14px 0 0", paddingTop: 10, borderTop: `1px solid ${C.bg}`, fontSize: 12, color: C.sub, lineHeight: "17px" }}>
              {later.length ? `The rest (${later.join(", ").toLowerCase()}) is priced and paid when you finalise it.` : "Nothing else is due now."}
            </p>
          </div>

          <div style={box}>
            <button onClick={() => setBankOpen((o) => !o)} aria-expanded={bankOpen} style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%", padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <Landmark size={16} color={C.sub} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.head }}>Pay by bank transfer instead</span>
                <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 1 }}>NEFT, RTGS or IMPS. Takes up to a working day to confirm.</span>
              </span>
              <ChevronDown size={16} color={C.sub} style={{ flexShrink: 0, marginTop: 2, transform: bankOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
            </button>
            {bankOpen && (
              <div style={{ marginTop: 10 }}>
                {BANK.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${C.bg}` }}>
                    <span style={{ width: 82, flexShrink: 0, fontSize: 12, color: C.sub }}>{k}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: C.head }}>{v}</span>
                    <button aria-label={`Copy ${k}`} onClick={() => copy(k, v)} style={{ border: "none", background: "none", padding: 2, cursor: "pointer", color: copied === k ? GREEN.text : C.sub, display: "grid", placeItems: "center" }}>
                      {copied === k ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                ))}
                <button data-testid="partial-transfer-done" onClick={() => setStage("transfer")} style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.div}`, background: C.white, color: C.head, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  I have made the transfer
                </button>
              </div>
            )}
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame frame={frame} onClose={onClose} full>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.div}` }}>
        <button aria-label="Close" onClick={onClose} style={{ border: "none", background: C.bg, width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer" }}><XIcon size={16} color={C.head} /></button>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>{view ? "What you agreed to" : amount ? "Confirm and pay" : "Confirm"}</p>
      </div>
      <div data-testid="partial-consent" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 24px", background: "#FAFAFA", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 21, fontWeight: 700, color: C.head, lineHeight: "27px" }}>
            {view ? `Your ${dest} trip, booked so far` : `Your ${dest} ${nowWords} ${nowItems.length === 1 ? "is" : "are"} ready to book`}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: C.sub }}>{dateLabel} · {travellers} travellers · from {fromCity || "Delhi"}</p>
        </div>

        <div style={box}>
          {h("Your itinerary")}
          <p style={{ margin: "0 0 4px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>We book strictly to what is shown here. Please check every detail.</p>
          {/* The same three names the consultant's tool uses. */}
          {beforeItems.length > 0 && (
            <Group icon={Lock} tone="green" title="Already finalised"
              chip={<Chip tone="green">{beforeWords}</Chip>} items={beforeItems}
              note="Booked earlier. Shown so you can see the whole trip." />
          )}
          {view ? (
            <Group icon={Lock} tone="green" title="Already finalised" defaultOpen
              chip={<Chip tone="green">{nowWords}</Chip>} items={nowItems} />
          ) : (
            <Group icon={CalendarCheck} tone="pink" title="Finalise now" defaultOpen
              chip={<Chip tone="pink">{nowWords}</Chip>} items={nowItems} />
          )}
          <Group icon={Clock} title="Finalise later" last
            chip={<Chip tone="amber">{later.join(", ")}</Chip>}
            note="Not booked yet. Priced and paid when you finalise them." />
          <p style={{ margin: "6px 0 0", fontSize: 11.5, color: C.sub, display: "flex", gap: 6 }}>
            <AlertTriangle size={13} color={C.inact} style={{ flexShrink: 0, marginTop: 1 }} />
            We cannot honour verbal or informal commitments. Only what is shown above is booked.
          </p>
        </div>

        <div style={box}>
          {h("Traveller details", TRAVELLERS.slice(0, Math.max(1, travellers)).every((t) => t.passport) ? <Chip tone="green">All details captured</Chip> : null)}
          <p style={{ margin: "0 0 8px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>Filled in by our team. Check they match each passport.</p>
          {TRAVELLERS.slice(0, Math.max(1, travellers)).map((t) => <TravellerCard key={t.first} t={t} />)}
          <Faq q="What counts as a valid passport?">
            At least 6 months left from the day you land, at least 2 blank pages, and no damage or tampering.
          </Faq>
        </div>

        <div style={box}>
          {h("Invoicing details", <Chip tone="green">Verified</Chip>)}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <CreditCard size={16} color={C.sub} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.head }}>PAN card</span>
          </div>
          <p style={{ margin: "2px 0 10px 24px", fontSize: 12, color: C.sub }}>Invoice and TCS in this name</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
            <div>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: ".4px", color: C.inact }}>NAME</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: C.head }}>Rahul Mehta</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, letterSpacing: ".4px", color: C.inact }}>PAN NUMBER</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: C.head }}>ABCPM1234K</p>
            </div>
          </div>
          <Faq q="Why do we need this?">
            Only to raise your invoice and report the TCS on an overseas trip. You can claim the TCS back when you file your income tax return.
          </Faq>
        </div>

        <div style={box} data-testid="partial-schedule">
          {h("Payment schedule")}
          {beforeItems.length > 0 && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "6px 0 10px", borderBottom: `1px solid ${C.bg}` }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.head }}>Already finalised</span>
                <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 1 }}>For {beforeWords} · paid</span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: GREEN.text }}>{fmtINR(beforeAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "6px 0 10px" }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.head }}>{view ? "Already finalised" : amount ? "Finalise now, pay now" : "Finalise now, nothing to pay"}</span>
              <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 1 }}>
                For {nowWords}{view ? " · paid" : !amount ? ". What you have already paid covers this." : ""}
              </span>
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: !view && !amount ? GREEN.text : C.head }}>{fmtINR(amount)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "10px 0", borderTop: `1px solid ${C.bg}` }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.head }}>Finalise later</span>
              <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 1 }}>For {later.join(", ").toLowerCase()} · tentative</span>
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.sub }}>{fmtINR(rest)}</span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.sub, lineHeight: "17px" }}>Instalments are set once every part is booked.</p>
          <a href="#terms" onClick={(e) => e.preventDefault()} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.bg}`, width: "100%", fontSize: 13, fontWeight: 600, color: C.b600, textDecoration: "none" }}>
            Read full Terms and Conditions <ExternalLink size={13} />
          </a>
        </div>

        {(hasFlights || hasHotels) && (
          <div style={box}>
            {h("Cancellation policy")}
            <ul style={{ listStyleType: "disc", margin: 0, paddingLeft: 18, fontSize: 12.5, color: C.head, lineHeight: "19px" }}>
              {hasFlights && <li>Flights cannot be refunded once ticketed. Name changes are usually not allowed.</li>}
              {hasHotels && <li>Hotels follow each hotel&apos;s cancellation policy, shown on the hotel.</li>}
            </ul>
          </div>
        )}

        <div style={{ ...box, borderColor: agreed ? GREEN.line : C.div }}>
          {h("Your consent", view && consentAt ? <Chip tone="green">Accepted {fmtDay(consentAt)}</Chip> : null)}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: view ? "default" : "pointer" }}>
            <input data-testid="partial-agree" type="checkbox" checked={agreed} disabled={view} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.p600, marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.head }}>I confirm and agree to all of the below</span>
          </label>
          <ul style={{ listStyleType: "disc", margin: "8px 0 0", paddingLeft: 46, fontSize: 12.5, color: C.sub, lineHeight: "19px" }}>
            <li>The {nowWords} above {nowItems.length === 1 ? "is" : "are"} final. Changing {nowItems.length === 1 ? "it" : "them"} later can cost extra.</li>
            <li>My travel dates, cities{hasFlights ? ", travellers and departure city" : " and travellers"} are now fixed.</li>
            <li>All traveller details are correct and match each passport.</li>
            <li>I accept the payment terms, the Cancellation and Refund Policy, and the Terms and Conditions.</li>
          </ul>
        </div>
      </div>

      {!view && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 18px", borderTop: `1px solid ${C.div}`, background: C.white }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: ".5px", color: C.sub }}>PAY NOW</p>
            <p style={{ margin: "1px 0 0", fontSize: 18, fontWeight: 700, color: C.head }}>{fmtINR(amount)}</p>
          </div>
          <button data-testid="partial-pay" disabled={!agreed || stage === "paying"} onClick={() => (amount ? setStage("method") : pay())} style={{
            padding: "13px 20px", borderRadius: 12, border: "none", fontSize: 14.5, fontWeight: 700, fontFamily: "inherit",
            background: agreed ? C.p600 : C.div, color: agreed ? "#fff" : C.inact, cursor: agreed ? "pointer" : "not-allowed", minWidth: 150,
          }}>
            {!amount ? (stage === "paying" ? "Confirming..." : "Confirm") : "Continue to pay"}
          </button>
        </div>
      )}
    </Frame>
  );
}
