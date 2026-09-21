import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Archive } from "lucide-react";
import { C } from "../data";
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
            />
          ))}
        </div>
      )}

    </div>
  );
}

function PastEnquiry({ group, open, onToggle }) {
  const navigate = useNavigate();
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
            {itineraries} itinerar{itineraries === 1 ? "y" : "ies"}{group.planId ? ` · Trip ${group.planId}` : ""}
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
            // Straight to the itinerary as it was built. Everything you can do
            // with a closed plan, keeping the PDF or starting it again, lives
            // on that screen, next to the trip it is about.
            const openPlan = () => navigate(`/itinerary/${v.itineraryId ?? card.itineraryId}?dealId=${card.id.split("__")[0]}&versionId=${v.id}`);
            return (
              <TripPlanCard
                key={card.id}
                deal={card}
                planId={v.planId}
                pastNote={`Quoted ${when}`}
                onOpen={openPlan}
                onStartNew={openPlan}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
