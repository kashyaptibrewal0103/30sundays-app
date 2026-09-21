import { memo, useState } from "react";
import HotelStayCard from "../HotelStayCard";
import { formatINR } from "../../data/buildData";
import { CitySection, PAD } from "./CityBits";

// The stay card the rest of the app uses, in a swipe row. The price split opens
// inside the card, so nothing covers the screen to show three numbers.
//
// Which card is open lives here, so tapping one never re-renders the page.
function CityStays({ t, items }) {
  const [open, setOpen] = useState(null);
  if (!items.length) return null;

  return (
    <CitySection t={t} title="Where to stay" note="Only 8.0 and above" inset={false}>
      <div className="hs hide-scrollbar" style={{ display: "flex", gap: 12, padding: `0 ${PAD}px`, overflowX: "auto", alignItems: "flex-start" }}>
        {items.map((h) => {
          const isOpen = open === h.id;
          return (
            <HotelStayCard
              key={h.id}
              width={250}
              imageHeight={130}
              image={h.img}
              name={h.name}
              stars={h.stars}
              ratingScore={h.score}
              roomType={h.roomType}
              city={h.area}
              showChevron={false}
              onClick={() => setOpen(isOpen ? null : h.id)}
              footer={
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.head }}>
                    ₹{formatINR(h.total)} <span style={{ fontSize: 12, fontWeight: 500, color: t.muted }}>a night, taxes in</span>
                  </div>
                  {isOpen ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: t.muted }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Room</span><span>₹{formatINR(h.base)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>Taxes and fees</span><span>₹{formatINR(h.tax)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: t.head }}><span>A night</span><span>₹{formatINR(h.total)}</span></div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: t.head, textDecoration: "underline", textUnderlineOffset: 3 }}>See price split</span>
                  )}
                </div>
              }
            />
          );
        })}
      </div>
    </CitySection>
  );
}

export default memo(CityStays);
