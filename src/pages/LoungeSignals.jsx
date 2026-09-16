import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import {
  GoldShell, QuestionRail, MetaDot, BUBBLE_SHADES,
} from "../components/Community/CountSignals";
import { getDest, questionsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";

// One decision left on this screen: how light the bubbles are.
//
// The count treatment is settled (a dot, then the words, in grey) and is
// already on the trip screen, so it is shown here rather than offered.

export default function LoungeSignals() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);
  const { unreadFor } = useCommunity();

  const d = getDest("thailand");
  const questions = questionsFor("thailand");
  const unread = unreadFor("thailand") || 3;
  const open = () => navigate("/community/thailand");

  const head = `Ask ${d.recent3m} travellers who visited ${d.name} in the last 3 months`;

  return (
    <Screen>
      <TopBar
        title="The rail"
        sub="Three shades of bubble"
        onBack={() => navigate("/trips/trip-1")}
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
              }}>How the rail works</p>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {[
                  "One bubble holds one question. Nothing else.",
                  "The answer count appears only at two or more. “0 answers” says the question is dead.",
                  "The last bubble is “See all 143 questions”, which absorbs the overflow and is the only destination the rail needs.",
                  "So the band has no footer. “Visit Lounge” and “143 FAQs answered” are gone.",
                  "84% of the screen, 12px gutters, 16px left edge, snapped. The next bubble peeks by about 40px.",
                  "One height for every bubble, question clamped to two lines.",
                  "One bubble every five seconds. It stops on touch, and never moves for reduced motion.",
                ].map(line => (
                  <li key={line} style={{ fontSize: 13, color: CC.body, lineHeight: "20px" }}>{line}</li>
                ))}
              </ul>
              <p style={{ fontSize: 13, color: CC.body, margin: "10px 0 0", lineHeight: "19px" }}>
                The bubble is the same hue as the band, lifted towards white, so it
                reads as raised off a warm surface rather than as a white patch
                dropped onto one. Three lightnesses below.
              </p>
            </div>
          </div>

          {Object.values(BUBBLE_SHADES).map((b) => (
            <section key={b.id}>
              <div style={{ height: 6, background: CC.well, margin: "22px 0" }} />

              <div style={{ padding: `0 ${PAD}px 12px` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", background: b.hex,
                    border: `1px solid ${CC.bubbleEdge}`, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: CC.ink }}>{b.name}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, background: CC.well,
                    border: `1px solid ${CC.line}`, fontSize: 10.5, fontWeight: 700, color: CC.body,
                  }}>{b.hex}</span>
                </div>
                <p style={{ fontSize: 13, color: CC.body, margin: "7px 0 0", lineHeight: "19px" }}>
                  {b.note}
                </p>
              </div>

              <div style={{ padding: `0 ${PAD}px`, overflow: "hidden" }}>
                <GoldShell
                  head={head} onOpen={open}
                  meta={<MetaDot unread={unread} />}
                  rail={
                    <QuestionRail
                      shade={b.id} questions={questions}
                      total={d.questionsTotal} onOpen={open}
                    />
                  }
                />
              </div>

              <div style={{ padding: `14px ${PAD}px 0` }}>
                <button onClick={() => setPicked(b.id)} style={{
                  width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                  border: `1px solid ${picked === b.id ? CC.goldLine : CC.line}`,
                  background: picked === b.id ? CC.goldTint : CC.white,
                  color: picked === b.id ? CC.goldInk : CC.ink,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  {picked === b.id ? <><Check size={16} /> Picked {b.name}</> : `Pick ${b.name}`}
                </button>
              </div>
            </section>
          ))}

          <p style={{
            fontSize: 12.5, color: CC.soft, margin: `26px ${PAD}px 0`, lineHeight: "18px",
          }}>
            “See all {d.questionsTotal} questions” uses the catalogue number. The
            seeded sample behind it is seven, so the rail shows those and the last
            bubble stands for the rest.
          </p>
        </div>
      </Body>
    </Screen>
  );
}
