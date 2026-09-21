import { useNavigate } from "react-router-dom";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { RULES_VARIANTS, RulesCard } from "../components/Community/RulesRowVariants";
import { RoomRow } from "./LoungeHome";
import { roomOrder, DESTINATIONS } from "../data/communityData";

// Five ways to put the rules above the rooms, each shown with the two rooms
// underneath, because the only question that matters is whether it still reads
// as a third room.

export default function LoungeRules() {
  const navigate = useNavigate();
  const { liveQuestionsFor } = useCommunity();
  const live = roomOrder().filter(id => DESTINATIONS[id].booked);

  return (
    <Screen>
      <TopBar title="Rules Row" sub="Five options, in place" onBack={() => navigate("/lounge-index")} />
      <Body>
        <div style={{ padding: "16px 0 40px" }}>
          <Block n={0} name="What Is There Now" note="The same card as a room, which is the problem.">
            <RulesCard onClick={() => {}} />
            <Rooms live={live} count={liveQuestionsFor} />
          </Block>

          {RULES_VARIANTS.map(({ id, n, name, note, Cmp }) => (
            <Block key={id} n={n} name={name} note={note}>
              <Cmp onClick={() => {}} />
              <Rooms live={live} count={liveQuestionsFor} />
            </Block>
          ))}
        </div>
      </Body>
    </Screen>
  );
}

function Rooms({ live, count }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {live.map(id => (
        <RoomRow key={id} id={id} count={count(id).length} onOpen={() => {}} />
      ))}
    </div>
  );
}

function Block({ n, name, note, children }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ padding: `0 ${PAD}px 10px` }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: CC.ink }}>
          {n === 0 ? name : `${n}. ${name}`}
        </p>
        <p style={{ margin: "3px 0 0", fontSize: 12.5, color: CC.soft, lineHeight: "18px" }}>
          {note}
        </p>
      </div>
      <div style={{
        padding: `14px ${PAD}px`, background: CC.white,
        borderTop: `1px solid ${CC.line}`, borderBottom: `1px solid ${CC.line}`,
        display: "flex", flexDirection: "column", gap: 10,
      }}>{children}</div>
    </div>
  );
}
