import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Archive, X as XIcon, Info } from "lucide-react";
import { C, allItineraries } from "../data";
import { useDeals } from "../data/deals";
import TripPlanCard from "./TripPlanCard";

// ─── The plans that did not go ahead ───
//
// My Plans groups live plans by destination, because inside one live enquiry
// "my Bali plan" is a real thing. A past enquiry is not a destination, it is a
// moment: one enquiry can hold several countries, and the same country can sit
// in the live enquiry and in two past ones. Group those by country and Bali
// appears three times, or worse, versions from different enquiries and
// different prices sit together as though they belong to each other.
//
// So past plans group by ENQUIRY and sort by TIME, collapsed, at the bottom.

const byId = (id) => allItineraries.find((i) => i.id === id);
const toNum = (p) => Number(String(p || 0).replace(/[^0-9.]/g, "")) || 0;
const shortDate = (ts) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const monthYear = (ts) => new Date(ts).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

// Deals that came out of one conversation share an enquiry id. A deal without
// one is its own enquiry.
export function groupByEnquiry(deals) {
  const map = new Map();
  deals.forEach((d) => {
    const key = d.enquiryId || d.id;
    if (!map.has(key)) map.set(key, { key, planId: d.planId, deals: [], at: 0 });
    const g = map.get(key);
    g.deals.push(d);
    g.at = Math.max(g.at, d.createdAt || 0, ...(d.versions || []).map((v) => v.createdAt || 0));
  });
  return [...map.values()].sort((a, b) => b.at - a.at);
}

// One card per destination inside an enquiry, the way My Plans splits a live
// one: a draft card for the open edit, a created card for the finalised ones.
const toCards = (deal) => {
  const quotes = (deal.versions || []).filter((v) => v.status === "quote");
  const drafts = (deal.versions || []).filter((v) => v.status !== "quote");
  const cards = [];
  drafts.forEach((dv) => {
    const parent = quotes.find((q) => q.id === dv.parentId);
    cards.push({ ...deal, id: `${deal.id}__draft_${dv.id}`, versions: [dv], cardKind: "draft", baseNum: parent?.num ?? null });
  });
  if (quotes.length) cards.push({ ...deal, id: `${deal.id}__made`, versions: quotes, cardKind: "made" });
  return cards;
};

export default function PastPlans({ deals }) {
  const [open, setOpen] = useState(false);
  const [openEnquiry, setOpenEnquiry] = useState(null);
  const [again, setAgain] = useState(null);
  const groups = groupByEnquiry(deals);
  if (!groups.length) return null;

  return (
    <div style={{ marginTop: 22, borderTop: `1px solid ${C.div}`, paddingTop: 14 }}>
      <button
        data-testid="past-toggle"
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "4px 2px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        <Archive size={14} color={C.sub} />
        <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 700, color: C.sub }}>
          Past plans <span style={{ color: C.inact }}>({groups.length})</span>
        </span>
        <ChevronDown size={16} color={C.sub} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {groups.map((g) => (
            <PastEnquiry
              key={g.key}
              group={g}
              open={openEnquiry === g.key}
              onToggle={() => setOpenEnquiry((o) => (o === g.key ? null : g.key))}
              onAgain={(deal, v) => setAgain({ deal, v })}
            />
          ))}
        </div>
      )}

      {again && <PlanAgain deal={again.deal} version={again.v} onClose={() => setAgain(null)} />}
    </div>
  );
}

function PastEnquiry({ group, open, onToggle, onAgain }) {
  const countries = [...new Set(group.deals.map((d) => d.dest))];
  const itineraries = group.deals.reduce((n, d) => n + (d.versions || []).filter((v) => v.status === "quote").length, 0);
  const when = monthYear(group.at);

  return (
    <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden", background: C.white }}>
      <button
        data-testid={`past-enquiry-${group.key}`}
        onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 13px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
      >
        <div style={{ display: "flex", flexShrink: 0 }}>
          {group.deals.slice(0, 2).map((d, i) => (
            <img key={d.id} src={d.img} alt="" style={{
              width: 42, height: 42, borderRadius: 11, objectFit: "cover",
              filter: "grayscale(0.55)", marginLeft: i ? -14 : 0, border: `2px solid ${C.white}`,
            }} />
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>Planned in {when}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.head, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {countries.join(" · ")}
          </p>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: C.inact, fontVariantNumeric: "tabular-nums" }}>
            {itineraries} itinerar{itineraries === 1 ? "y" : "ies"}{group.planId ? ` · Plan ${group.planId}` : ""}
          </p>
        </div>
        <ChevronDown size={17} color={C.sub} style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>
            Prices are the ones quoted in {when} and are no longer valid. Start any of these again and we will price it afresh.
          </p>
          {group.deals.flatMap(toCards).map((card) => {
            const v = [...card.versions].sort((a, b) => b.num - a.num)[0];
            return (
              <TripPlanCard
                key={card.id}
                deal={card}
                planId={v.planId}
                pastNote={`Quoted ${when}`}
                onOpen={() => onAgain(card, v)}
                onStartNew={() => onAgain(card, v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Planning a past trip again ───
//
// If the travel dates are still ahead there is something to reprice straight
// away. If they have gone by there is nothing to price until the traveller says
// when, so we ask first.
//
// Either way it ends on the itinerary screen they already know, with today's
// prices in the cost breakdown and Save Itinerary where it always is.
function PlanAgain({ deal, version, onClose }) {
  const navigate = useNavigate();
  const { createDeal } = useDeals();
  const from = new Date(version.customizations?.travelDates?.fromDate || Date.now());
  const datesPassed = from.getTime() < Date.now();
  const [step, setStep] = useState(datesPassed ? "dates" : "pricing");
  const [date, setDate] = useState("");

  const itineraryId = version.itineraryId ?? deal.itineraryId;
  const it = byId(itineraryId);
  const nights = version.customizations?.travelDates?.nights ?? it?.nights ?? 7;

  useEffect(() => {
    if (step !== "pricing") return;
    const t = setTimeout(() => {
      const fromDate = (date ? new Date(date) : from).toISOString();
      const { dealId, versionId } = createDeal({
        itineraryId,
        dest: deal.dest,
        title: deal.title,
        img: deal.img,
        indicativePrice: toNum(it?.price),
        customizations: { travelDates: { fromDate, nights, travelers: 2 }, selectedDayOptions: {}, selectedHotels: {} },
      });
      navigate(`/itinerary/${itineraryId}?dealId=${dealId}&versionId=${versionId}`);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div style={{
      position: isMobile ? "fixed" : "absolute", inset: 0, zIndex: 120, background: C.white,
      display: "flex", flexDirection: "column",
      ...(isMobile ? {} : { borderRadius: 44, overflow: "hidden" }),
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.div}`, flexShrink: 0 }}>
        <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
          <XIcon size={20} color={C.head} />
        </button>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>{deal.dest} · {nights}N</p>
          {version.planId && (
            <p style={{ margin: 0, fontSize: 11.5, color: C.sub, fontVariantNumeric: "tabular-nums" }}>From plan {version.planId}</p>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }} className="hide-scrollbar">
        {step === "dates" && (
          <div data-testid="again-dates">
            <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "12px 14px", borderRadius: 13, background: "#FFF8E1", border: "1px solid #FCEBB6", marginBottom: 18 }}>
              <Info size={14} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 12.5, color: C.head, lineHeight: "18px" }}>
                This plan was for {shortDate(from)}, which has gone by. Tell us when you want to travel and we will price it for those dates.
              </p>
            </div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: C.sub, marginBottom: 7 }}>New start date</label>
            <input
              data-testid="again-date-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 13,
                border: `1px solid ${date ? C.p600 : C.div}`, fontSize: 15, color: C.head, fontFamily: "inherit", outline: "none",
              }}
            />
            <p style={{ margin: "8px 2px 0", fontSize: 11.5, color: C.sub }}>
              {nights} nights, the same as the original plan. You can change the length on the next screen.
            </p>
            <button
              data-testid="again-get-prices"
              onClick={() => setStep("pricing")}
              disabled={!date}
              style={{
                width: "100%", marginTop: 22, padding: "15px 0", borderRadius: 14, border: "none",
                background: date ? C.p600 : C.div, color: date ? "#fff" : C.inact,
                fontSize: 15, fontWeight: 700, cursor: date ? "pointer" : "not-allowed", fontFamily: "inherit",
              }}
            >
              Fetch updated prices
            </button>
          </div>
        )}

        {step === "pricing" && (
          <div data-testid="again-pricing" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid ${C.p100}`, borderTopColor: C.p600, animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>Fetching updated prices</p>
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: C.sub }}>
              Hotels and activities for {shortDate(date ? new Date(date) : from)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
