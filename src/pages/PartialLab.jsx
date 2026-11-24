import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, LayoutList, Check } from "lucide-react";
import { C, allItineraries } from "../data";
import { useDeals } from "../data/deals";
import { PARTIAL_CASES, partialDemoDeal } from "../data/partial";

// ─── Partly booked: every case ───
//
// A customer has at most one partly booked plan, so one case at a time: the
// chosen case goes into My Plans on this device and the others come out.
// Picking a case again starts it over, so confirm and pay can be run twice.
export default function PartialLab({ setUserState }) {
  const navigate = useNavigate();
  // A link can name a case, and where to go with it:
  // /partial?case=demo_partial_hotels&go=trip (or go=plans).
  const [params] = useSearchParams();
  const { deals, upsertDeals, deleteDeal } = useDeals();
  const active = PARTIAL_CASES.find((c) => deals.some((d) => d.id === c.id));

  const choose = (c) => {
    PARTIAL_CASES.forEach((x) => { if (x.id !== c.id) deleteDeal(x.id); });
    // A case from an earlier round of this demo.
    deleteDeal("demo_partial_both");
    upsertDeals([partialDemoDeal(c)]);
  };

  const openTrip = (c) => navigate(`/itinerary/${c.itin}?dealId=${c.id}&versionId=${c.id}_v2`);

  useEffect(() => {
    // My Plans shows plans to somebody who has made one; the flags last for
    // this tab, so a reload keeps the demo.
    setUserState?.("lead");
    try {
      sessionStorage.setItem("30s_demo_user", "lead");
      sessionStorage.setItem("30s_partial_demo", "1");
    } catch { /* private window */ }
    const asked = PARTIAL_CASES.find((c) => c.id === params.get("case"));
    if (asked) choose(asked);
    else if (!active) choose(PARTIAL_CASES[0]);
    const go = params.get("go");
    if (asked && go === "trip") setTimeout(() => openTrip(asked), 0);
    if (asked && go === "plans") setTimeout(() => navigate("/plan"), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div style={{ minHeight: "100%", background: C.white, padding: "20px 16px 40px", boxSizing: "border-box" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".7px", color: C.p600 }}>PARTLY BOOKED · ALL CASES</p>
      <h1 style={{ margin: "6px 0 6px", fontSize: 22, lineHeight: "28px", color: C.head }}>Book part of a trip first</h1>
      <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: "19px" }}>
        The customer books some flights or hotels first. The trip stays in My Plans with a Partly booked tag. Each booked flight and hotel is locked, and the dates, cities and travellers are fixed. A customer has one partly booked plan at a time, so pick a case.
      </p>

      <p style={{ margin: "20px 0 8px", fontSize: 11, fontWeight: 800, letterSpacing: ".5px", color: C.sub }}>PICK A CASE</p>
      <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden" }}>
        {PARTIAL_CASES.map((c, i) => {
          const it = allItineraries.find((x) => x.id === c.itin);
          const on = active?.id === c.id;
          return (
            <button key={c.id} data-testid={`case-${c.id}`} onClick={() => choose(c)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 12px", border: "none", borderTop: i ? `1px solid ${C.bg}` : "none", background: on ? "#FFF5F7" : C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", border: on ? "none" : `1.5px solid ${C.icon}`, background: on ? C.p600 : C.white, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {on && <Check size={13} color="#fff" strokeWidth={3} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.head }}>{c.title}</span>
                <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 2, lineHeight: "16px" }}>{it?.dest} · {c.note}</span>
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          <button onClick={() => navigate("/plan")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 14, border: "none", background: C.p600, color: "#fff", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <LayoutList size={18} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Open My Plans</span>
            <ChevronRight size={18} />
          </button>
          <button data-testid="open-trip" onClick={() => openTrip(active)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, border: `1.5px solid ${C.p300}`, background: C.white, color: C.p600, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Open the trip: {active.title.toLowerCase()}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
