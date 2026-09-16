import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { ENTRY_VARIANTS } from "../components/Community/TripEntryVariants";
import { getDest, PEOPLE, questionsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";

// Six ways Community can sit on the trip screen, one after the other, in the
// place and at the width they would really appear. Nothing here is wired into
// a trip; this screen exists to pick a shape.

const RECOMMENDED = "preview";

const FACES = [PEOPLE.aisha, PEOPLE.gaurav, PEOPLE.farah, PEOPLE.lakshmi];

export default function CommunityEntries() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);
  const { answeredCount, unreadFor } = useCommunity();

  const d = getDest("thailand");
  const questions = questionsFor("thailand");
  const top = questions[0];

  // Every variant is a single door, so they all get the same one action.
  const props = {
    d,
    count: questions.length,
    answered: answeredCount("thailand"),
    unread: unreadFor("thailand"),
    faces: FACES,
    top,
    questions,
    onOpen: () => navigate("/community/thailand"),
  };

  return (
    <Screen>
      <TopBar
        title="Sunday Lounge on a trip"
        sub="Eleven layouts, same content"
        onBack={() => navigate("/trips/trip-1")}
      />
      <Body>
        <div style={{ padding: `14px 0 40px` }}>

          {/* The recommendation, stated plainly, with the reasoning under it. */}
          <div style={{ padding: `0 ${PAD}px` }}>
            <div style={{
              border: `1px solid ${CC.line}`, borderLeft: `3px solid ${CC.gold}`,
              borderRadius: 14, background: CC.white, padding: "14px 16px",
            }}>
              <p style={{
                fontSize: 12, fontWeight: 800,
                color: CC.goldInk, margin: 0,
              }}>One Door, Eleven Ways</p>
              <p style={{ fontSize: 14, color: CC.ink, margin: "7px 0 0", lineHeight: "21px" }}>
                All eleven are a single tap target that opens the Lounge. The group
                chat sits one tap further in, where it already has a card of its own.
              </p>
              <p style={{ fontSize: 13.5, color: CC.body, margin: "8px 0 0", lineHeight: "20px" }}>
                Numbers 1 to 6 differ on how much weight this pulls next to
                payments, documents and the itinerary. Numbers 5 and 7 to 11 are
                the tinted band, identical in anatomy, varying only the ground
                behind the type.
              </p>
            </div>
          </div>

          {ENTRY_VARIANTS.map((v) => (
            <section key={v.id}>
              <div style={{ height: 6, background: CC.well, margin: "22px 0" }} />

              <div style={{ padding: `0 ${PAD}px 12px` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", background: CC.ink, color: "#fff",
                    display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flexShrink: 0,
                  }}>{v.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: CC.ink }}>{v.name}</span>
                  <Tag tone="teal">{v.pattern}</Tag>
                  <Tag tone="plain">{v.weight}</Tag>
                  {v.id === RECOMMENDED && (
                    <Tag tone="gold"><Star size={10} fill={CC.goldInk} /> Our pick</Tag>
                  )}
                </div>
                <p style={{ fontSize: 13, color: CC.body, margin: "7px 0 0", lineHeight: "19px" }}>
                  {v.note}
                </p>
              </div>

              {/* At the exact width and padding of the trip screen, so a full
                  bleed band bleeds here the way it will there. */}
              <div style={{ padding: `0 16px`, overflow: "hidden" }}>
                <v.Comp {...props} />
              </div>

              <div style={{ padding: `14px ${PAD}px 0` }}>
                <button onClick={() => setPicked(v.id)} style={{
                  width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                  border: `1px solid ${picked === v.id ? CC.pink : CC.line}`,
                  background: picked === v.id ? CC.pinkTint : CC.white,
                  color: picked === v.id ? CC.pinkInk : CC.ink,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  {picked === v.id ? <><Check size={16} /> Picked number {v.n}</> : `Pick number ${v.n}`}
                </button>
              </div>
            </section>
          ))}

          {picked && (
            <div style={{ padding: `26px ${PAD}px 0` }}>
              <p style={{ fontSize: 13.5, color: CC.body, margin: 0, lineHeight: "20px", textAlign: "center" }}>
                Number {ENTRY_VARIANTS.find(v => v.id === picked).n} is marked.
                Tell me and it goes onto the trip screen.
              </p>
            </div>
          )}
        </div>
      </Body>
    </Screen>
  );
}

function Tag({ children, tone }) {
  const tones = {
    teal: { bg: CC.tealTint, fg: CC.tealInk, line: CC.tealLine },
    gold: { bg: CC.goldTint, fg: CC.goldInk, line: CC.goldLine },
    plain: { bg: CC.well, fg: CC.body, line: CC.line },
  };
  const t = tones[tone] || tones.plain;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999,
      background: t.bg, border: `1px solid ${t.line}`,
      fontSize: 10.5, fontWeight: 700, color: t.fg,
      letterSpacing: "0.2px",
    }}>{children}</span>
  );
}
