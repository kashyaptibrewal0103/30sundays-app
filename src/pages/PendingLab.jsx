import { useNavigate } from "react-router-dom";
import { C } from "../data";
import { useDeals } from "../data/deals";
import TripPlanCard, { PENDING_VARIANTS } from "../components/TripPlanCard";

// Five ways of giving Review & Pay the focus on a My Plans card whose final
// plan is waiting on the customer. Same card, same rows, one per option, so
// they can be read against each other on one screen.
export default function PendingLab() {
  const navigate = useNavigate();
  const { deals } = useDeals();
  const deal = deals.find((d) => d.id === "demo_vietnam");
  const quotes = (deal?.versions || []).filter((v) => v.status === "quote");

  if (!deal || !quotes.length) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>The Vietnam demo plan is missing on this device.</div>;
  }

  const card = { ...deal, dealId: deal.id, id: `${deal.id}__made`, versions: quotes, cardKind: "made", awaitingPayment: true };
  const openVersion = (v) => navigate(`/itinerary/${v.itineraryId ?? deal.itineraryId}?dealId=${deal.id}&versionId=${v.id}`);

  return (
    <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: C.white, padding: "16px 16px 40px" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".6px", color: C.p600 }}>MY PLANS</p>
      <h1 style={{ margin: "4px 0 4px", fontSize: 19, fontWeight: 700, color: C.head }}>Payment pending: 5 options</h1>
      <p style={{ margin: "0 0 18px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>
        Same card as today. Each option gives Review & Pay more focus in a different way.
      </p>

      {PENDING_VARIANTS.map((v, i) => (
        <div key={v.key} data-testid={`option-${i + 1}`} style={{ marginBottom: 26 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>
            <span style={{ color: C.p600 }}>{i + 1}.</span> {v.name}
          </p>
          <p style={{ margin: "3px 0 10px", fontSize: 12, color: C.sub, lineHeight: "17px" }}>{v.note}</p>
          <TripPlanCard deal={card} onOpen={openVersion} pendingVariant={v.key} />
        </div>
      ))}
    </div>
  );
}
