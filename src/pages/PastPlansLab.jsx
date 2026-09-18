import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ArrowRight } from "lucide-react";
import { C, allItineraries, destinations } from "../data";
import TripPlanCard from "../components/TripPlanCard";
import PastPlans from "../components/PastPlans";

// ─── My Plans, with the enquiries that did not go ahead ───
//
// A lost enquiry is hidden from the traveller today. Showing it is useful: it
// is their own record of what they were quoted, and a consultant can pick it up
// again. But it cannot be listed the way a live plan is.
//
// The live section groups by destination, because inside one live enquiry "my
// Bali plan" is a real thing. A past enquiry is not a destination, it is a
// moment. One enquiry can hold three countries, and the same country can sit in
// the live enquiry and in two past ones. Group those by country and Bali shows
// up three times, or worse, versions from different enquiries and different
// prices sit together as though they belong to each other.
//
// So past plans group by ENQUIRY and sort by TIME. Live plans are untouched.

const DAY = 86400000;
const byId = (id) => allItineraries.find((i) => i.id === id);
const toNum = (p) => Number(String(p || 0).replace(/[^0-9.]/g, "")) || 0;
const routeTitle = (id) => (byId(id)?.route || []).map((r) => r.city).join(" · ");

// Each itinerary carries its own number, long enough not to be confused with a
// version, a price or a phone number when it is read out.
const ver = (id, itinId, { num, status, ageDays, priceAdj = 0, dest, parentId = null, startsInDays, planId }) => {
  const it = byId(itinId);
  const pp = toNum(it?.price) + priceAdj;
  const created = Date.now() - ageDays * DAY;
  return {
    id, num, status, parentId, planId, createdBy: "customer",
    itineraryId: itinId, destination: dest, title: routeTitle(itinId),
    createdAt: created,
    indicativePrice: pp,
    livePrice: status === "quote" ? pp : null,
    pricedAt: status === "quote" ? created : null,
    customizations: {
      travelDates: {
        fromDate: new Date(Date.now() + startsInDays * DAY).toISOString(),
        nights: it?.nights, travelers: 2,
      },
    },
  };
};

// One card per destination inside an enquiry, exactly as My Plans splits them
// today: a draft card for the open edit, a created card for the finalised ones.
const toCards = (unit) => {
  const quotes = unit.versions.filter((v) => v.status === "quote");
  const drafts = unit.versions.filter((v) => v.status !== "quote");
  const cards = [];
  drafts.forEach((dv) => {
    const parent = quotes.find((q) => q.id === dv.parentId);
    cards.push({ ...unit, id: `${unit.id}__draft_${dv.id}`, versions: [dv], cardKind: "draft", baseNum: parent?.num ?? null });
  });
  if (quotes.length) cards.push({ ...unit, id: `${unit.id}__made`, versions: quotes, cardKind: "made" });
  return cards;
};

// ─── The data behind the scenarios ───

const liveEnquiry = {
  units: [
    {
      id: "live_bali", dest: "Bali", itineraryId: 1, img: byId(1)?.img, title: routeTitle(1), status: "active",
      versions: [
        ver("lb1", 1, { num: 1, status: "quote", ageDays: 9, dest: "Bali", startsInDays: 64 }),
        ver("lb2", 3, { num: 2, status: "quote", ageDays: 4, priceAdj: 6000, dest: "Bali", startsInDays: 64 }),
        ver("lb3", 3, { num: 3, status: "draft", ageDays: 0.4, priceAdj: 6000, dest: "Bali", parentId: "lb2", startsInDays: 64 }),
      ],
    },
    {
      id: "live_vietnam", dest: "Vietnam", itineraryId: 10, img: byId(10)?.img, title: routeTitle(10), status: "active",
      versions: [ver("lv1", 10, { num: 1, status: "quote", ageDays: 6, dest: "Vietnam", startsInDays: 71 })],
    },
  ],
};

// The first past enquiry is the awkward one on purpose: two countries, one of
// them also in the live enquiry, and one itinerary whose travel dates have
// already gone by while the other has not.
const pastEnquiries = [
  {
    planId: "104829371045", closedAgoDays: 180,
    units: [
      {
        id: "p1_thailand", dest: "Thailand", itineraryId: 13, img: byId(13)?.img, title: routeTitle(13), status: "lost",
        versions: [
          ver("pt1", 13, { num: 1, status: "quote", ageDays: 188, dest: "Thailand", startsInDays: 96, planId: "104829371061" }),
          ver("pt2", 13, { num: 2, status: "quote", ageDays: 183, priceAdj: 5000, dest: "Thailand", startsInDays: 96, planId: "104829371078" }),
        ],
      },
      {
        id: "p1_vietnam", dest: "Vietnam", itineraryId: 11, img: byId(11)?.img, title: routeTitle(11), status: "lost",
        versions: [ver("pv1", 11, { num: 1, status: "quote", ageDays: 185, dest: "Vietnam", startsInDays: -122, planId: "104829371094" })],
      },
    ],
  },
  {
    planId: "998210473326", closedAgoDays: 410,
    units: [
      {
        id: "p2_bali", dest: "Bali", itineraryId: 100, img: byId(100)?.img, title: routeTitle(100), status: "lost",
        versions: [ver("pb1", 100, { num: 1, status: "quote", ageDays: 415, dest: "Bali", startsInDays: -350, planId: "998210473341" })],
      },
    ],
  },
];

// Deal-shaped, the way the store holds them: deals from one conversation share
// an enquiry id and a plan number.
const pastDeals = pastEnquiries.flatMap((e) =>
  e.units.map((u) => ({
    ...u, enquiryId: e.planId, planId: e.planId,
    createdAt: Date.now() - e.closedAgoDays * DAY,
  }))
);

const SCENARIOS = [
  { key: "both", name: "Live + past", note: "One live enquiry across two countries, and two past enquiries below it. Live cards are untouched." },
  { key: "past", name: "Past only", note: "Nothing live. The past enquiries carry the screen instead of hiding behind an accordion." },
  { key: "none", name: "Nothing yet", note: "No live plans and nothing in the past. The screen we already have." },
];

export default function PastPlansLab() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState("both");

  const showLive = scenario === "both";
  const past = scenario === "none" ? [] : pastEnquiries;
  const liveCards = useMemo(() => (showLive ? liveEnquiry.units.flatMap(toCards) : []), [showLive]);
  const current = SCENARIOS.find((s) => s.key === scenario);

  return (
    <div style={{ height: "100%", background: C.white, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Lab controls */}
      <div style={{ flexShrink: 0, background: "#FBFAF9", borderBottom: `1px solid ${C.div}`, padding: "12px 14px 11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={19} color={C.head} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>My Plans with past enquiries</p>
            <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Three states, and planning a past trip again</p>
          </div>
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {SCENARIOS.map((s) => (
            <button key={s.key} data-testid={`plans-sc-${s.key}`}
              onClick={() => setScenario(s.key)}
              style={{
                flexShrink: 0, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                border: `1px solid ${scenario === s.key ? C.p600 : C.div}`,
                background: scenario === s.key ? C.p600 : C.white,
                color: scenario === s.key ? "#fff" : C.sub,
              }}>{s.name}</button>
          ))}
        </div>
        <p style={{ margin: "9px 2px 0", fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>{current.note}</p>
      </div>

      {/* ── My Plans ── */}
      <div style={{ flex: 1, overflowY: "auto" }} className="hide-scrollbar">
        <div style={{ padding: "12px 16px 8px" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>My Plans</h1>
          {liveCards.length > 0 && (
            <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 0" }}>
              {liveCards.length} {liveCards.length === 1 ? "plan" : "plans"}
            </p>
          )}
        </div>

        <div style={{ padding: "8px 16px 28px" }}>
          {/* Nothing at all. This is the first thing a new traveller sees on
              this tab, so it offers a way in rather than reporting a count. */}
          {scenario === "none" && <FirstTimeEmpty />}

          {/* Live plans, exactly as they are today */}
          {liveCards.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {liveCards.map((card) => (
                <TripPlanCard key={card.id} deal={card} onOpen={() => {}} onStartNew={() => {}} />
              ))}
            </div>
          )}

          {/* Past only: the past enquiries carry the screen, so they are open
              and the invitation to start something new sits on top of them
              rather than in an empty block of its own. */}
          {scenario === "past" && (
            <>
              <NewTripPrompt />
              <p style={{ margin: "22px 2px 10px", fontSize: 13, fontWeight: 700, color: C.head }}>
                Your earlier plans
              </p>
              <PastPlans deals={pastDeals} alwaysOpen />
            </>
          )}

          {/* Live + past: past stays collapsed under the live plans */}
          {scenario === "both" && past.length > 0 && <PastPlans deals={pastDeals} />}
        </div>
      </div>

    </div>
  );
}

// The first-time screen. A count of zero is not worth saying; somewhere to
// start is. The destination row is the same one the home screen opens with, so
// this reads as an invitation rather than a dead end.
function FirstTimeEmpty() {
  return (
    <div data-testid="empty-first" style={{ padding: "6px 0 0" }}>
      <div style={{
        borderRadius: 18, padding: "26px 20px 22px", textAlign: "center",
        background: `linear-gradient(160deg, ${C.p100}AA 0%, #EDF3FF77 62%, ${C.white} 100%)`,
        border: `1px solid ${C.p300}55`,
      }}>
        <span style={{
          display: "grid", placeItems: "center", width: 54, height: 54, borderRadius: "50%",
          background: C.white, margin: "0 auto 14px", boxShadow: "0 6px 18px -8px rgba(227,27,83,0.45)",
        }}>
          <Sparkles size={24} color={C.p600} />
        </span>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.head, letterSpacing: "-0.3px" }}>
          Your trips will live here
        </p>
        <p style={{ margin: "7px 0 18px", fontSize: 13, color: C.sub, lineHeight: "19px" }}>
          Tell us where you fancy and we will build the whole thing, day by day, with hotels and prices.
        </p>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", borderRadius: 14,
          border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 22px -8px rgba(227,27,83,0.6)",
        }}>
          Plan my trip <ArrowRight size={16} />
        </button>
      </div>

      <p style={{ margin: "22px 2px 12px", fontSize: 13, fontWeight: 700, color: C.head }}>Where couples are going</p>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 14, overflowX: "auto", margin: "0 -16px", padding: "0 16px 4px" }}>
        {destinations.slice(0, 6).map((d) => (
          <button key={d.name} style={{
            flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
          }}>
            <span style={{ width: 62, height: 62, borderRadius: "50%", overflow: "hidden", border: `2.5px solid ${C.div}`, padding: 2, display: "block" }}>
              <img src={d.img} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sub, whiteSpace: "nowrap" }}>{d.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// An invitation with something to look at, rather than an empty block of text.
function NewTripPrompt() {
  return (
    <div style={{
      borderRadius: 16, padding: "18px 16px", textAlign: "center",
      background: `linear-gradient(135deg, ${C.p100}88 0%, #EDF3FF66 100%)`,
      border: `1px solid ${C.p300}66`,
    }}>
      <span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: "50%", background: C.white, margin: "0 auto 10px" }}>
        <Sparkles size={18} color={C.p600} />
      </span>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>Nothing in progress</p>
      <p style={{ margin: "4px 0 14px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>
        Start where you left off, or plan somewhere new.
      </p>
      <button style={{
        padding: "12px 22px", borderRadius: 12, border: "none", background: C.p600, color: "#fff",
        fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        boxShadow: "0 4px 16px rgba(227,27,83,0.28)",
      }}>Plan a new trip</button>
    </div>
  );
}

