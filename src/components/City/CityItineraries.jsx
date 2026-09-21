import { memo } from "react";
import ItineraryCard from "../ItineraryCard";
import { CitySection, PAD } from "./CityBits";

// Six at most, in the itinerary card the app already uses everywhere else.
function CityItineraries({ t, city, items }) {
  if (!items.length) return null;
  return (
    <CitySection
      t={t}
      title={`${items.length} ${items.length === 1 ? "itinerary includes" : "itineraries include"} ${city}`}
      sub="Every price shown is the full amount. No hidden markups."
      inset={false}
    >
      <div className="hs hide-scrollbar" style={{ display: "flex", gap: 12, padding: `0 ${PAD}px`, overflowX: "auto" }}>
        {items.map(it => <ItineraryCard key={it.id} it={it} hideDest />)}
      </div>
    </CitySection>
  );
}

export default memo(CityItineraries);
