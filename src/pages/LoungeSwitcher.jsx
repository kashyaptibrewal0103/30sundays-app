import { useNavigate } from "react-router-dom";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { MARKS } from "../components/Community/SwitcherMarkVariants";

// Five ways to mark the destination the traveller is actually going to.
//
// Each list is shown while the reader sits in Bali, a room they have not
// booked. That is the only state worth testing: the tick is on one room and
// the trip is on another, so a mark that fights the tick shows it here.

export default function LoungeSwitcher() {
  const navigate = useNavigate();
  return (
    <Screen>
      <TopBar title="Trip Mark" onBack={() => navigate("/community/thailand")} />
      <Body>
        <div style={{ padding: `14px 0 40px` }}>
          <p style={{
            fontSize: 13.5, color: CC.body, margin: `0 ${PAD}px 16px`, lineHeight: "20px",
          }}>
            Each one is shown from inside Bali, so the tick and the trip sit on
            different rooms. Thailand is the booked trip.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: `0 ${PAD}px` }}>
            {MARKS.map((m, i) => {
              const Comp = m.Comp;
              return (
                <div key={m.id}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: CC.goldInk, margin: "0 0 4px" }}>
                    Option {i + 1}
                  </p>
                  <p style={{
                    fontSize: 15.5, fontWeight: 700, color: CC.ink, margin: "0 0 10px",
                    letterSpacing: "-0.1px",
                  }}>{m.name}</p>
                  <Comp current="bali" />
                </div>
              );
            })}
          </div>
        </div>
      </Body>
    </Screen>
  );
}
