import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { GOLD_VARIANTS } from "../components/Community/GoldContentVariants";
import { getDest, COHORT_THRESHOLD } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";

// The golden band is settled. This screen is only about the words inside it.
//
// Every treatment is shown twice: once with the room as it is today, and once
// as it will look in week one, when nothing has been asked and three people
// have booked. A line that only works in the busy state is not an option.

export default function LoungeGoldCopy() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);
  const { unreadFor } = useCommunity();

  const d = getDest("thailand");
  const unread = unreadFor("thailand");

  // Week one: three bookings, nothing asked, nothing unread.
  const dayOne = { ...d, cohort: { ...d.cohort, members: 3, state: "below" } };

  const open = () => navigate("/community/thailand");

  return (
    <Screen>
      <TopBar
        title="What goes in the gold"
        sub="Four treatments, two states each"
        onBack={() => navigate("/community-entries")}
      />
      <Body>
        <div style={{ padding: "14px 0 40px" }}>

          <div style={{ padding: `0 ${PAD}px` }}>
            <div style={{
              border: `1px solid ${CC.line}`, borderLeft: `3px solid ${CC.gold}`,
              borderRadius: 14, background: CC.white, padding: "14px 16px",
            }}>
              <p style={{
                fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
                textTransform: "uppercase", color: CC.goldInk, margin: 0,
              }}>The rules these follow</p>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {[
                  "No question is ever quoted, so a cold start cannot break it.",
                  "“FAQs” is gone. Nothing in here counts documents.",
                  "The headline is a fact or a promise, never an instruction.",
                  "The name does work instead of sitting in a 10px label.",
                ].map(line => (
                  <li key={line} style={{ fontSize: 13.5, color: CC.body, lineHeight: "21px" }}>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {GOLD_VARIANTS.map((v) => (
            <section key={v.id}>
              <div style={{ height: 6, background: CC.well, margin: "22px 0" }} />

              <div style={{ padding: `0 ${PAD}px 14px` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", background: CC.ink, color: "#fff",
                    display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
                  }}>{v.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: CC.ink }}>{v.name}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, background: CC.goldTint,
                    border: `1px solid ${CC.goldLine}`, fontSize: 10.5, fontWeight: 700, color: CC.goldInk,
                  }}>Leads with: {v.leads}</span>
                </div>
                <p style={{ fontSize: 13, color: CC.body, margin: "7px 0 0", lineHeight: "19px" }}>
                  {v.note}
                </p>
              </div>

              <StateLabel>Today, {d.cohort.members} going</StateLabel>
              <div style={{ padding: `0 ${PAD}px`, overflow: "hidden" }}>
                <v.Comp d={d} unread={unread} onOpen={open} />
              </div>

              <StateLabel style={{ marginTop: 18 }}>
                Week one, {dayOne.cohort.members} going, nothing asked
              </StateLabel>
              <div style={{ padding: `0 ${PAD}px`, overflow: "hidden" }}>
                <v.Comp d={dayOne} cold unread={0} onOpen={open} />
              </div>
              <p style={{
                fontSize: 12.5, color: CC.body, margin: `8px ${PAD}px 0`, lineHeight: "18px",
              }}>{v.cold}</p>

              <div style={{ padding: `16px ${PAD}px 0` }}>
                <button onClick={() => setPicked(v.id)} style={{
                  width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                  border: `1px solid ${picked === v.id ? CC.pink : CC.line}`,
                  background: picked === v.id ? CC.pinkTint : CC.white,
                  color: picked === v.id ? CC.pinkInk : CC.ink,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  {picked === v.id ? <><Check size={16} /> Picked {v.n}</> : `Pick ${v.n}`}
                </button>
              </div>
            </section>
          ))}

          <div style={{ height: 6, background: CC.well, margin: "22px 0" }} />
          <p style={{
            fontSize: 12.5, color: CC.soft, margin: `0 ${PAD}px`, lineHeight: "18px",
          }}>
            Week one uses {COHORT_THRESHOLD > 3 ? "three" : "a few"} bookings, which is
            below the threshold where the group chat opens. That is the hardest
            state any of these has to survive.
          </p>

          {picked && (
            <div style={{ padding: `22px ${PAD}px 0` }}>
              <p style={{ fontSize: 13.5, color: CC.body, margin: 0, lineHeight: "20px", textAlign: "center" }}>
                {GOLD_VARIANTS.find(v => v.id === picked).name} is marked.
                Tell me and it goes on the trip screen.
              </p>
            </div>
          )}
        </div>
      </Body>
    </Screen>
  );
}

function StateLabel({ children, style }) {
  return (
    <p style={{
      fontSize: 10.5, fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase",
      color: CC.soft, margin: `0 ${PAD}px 8px`, ...style,
    }}>{children}</p>
  );
}
