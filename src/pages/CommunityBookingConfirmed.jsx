import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Users, MessageCircleQuestion, BadgeCheck, ChevronRight } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { getDest, PEOPLE, track } from "../data/communityData";
import { Screen, Body, Primary } from "../components/Gift/GiftUI";
import { PAD, SectionBar, AvatarStack, Kicker } from "../components/Community/CommunityUI";

// The second entry point. Straight after a booking is confirmed, while the
// excitement is still there, is the best moment to bring people in.

const FACES = [PEOPLE.aisha, PEOPLE.gaurav, PEOPLE.farah, PEOPLE.lakshmi];

export default function CommunityBookingConfirmed() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const dest = params.get("dest") || "bali";
  const d = getDest(dest);
  const [skipped, setSkipped] = useState(false);

  return (
    <Screen>
      <Body>
        {/* Confirmation first. Community is what comes after the good news. */}
        <div style={{ padding: `32px ${PAD}px 0`, textAlign: "center" }}>
          <span style={{
            width: 60, height: 60, borderRadius: "50%", background: CC.tealTint,
            display: "grid", placeItems: "center", margin: "0 auto 16px",
          }}><Check size={30} color={CC.teal} strokeWidth={2.6} /></span>
          <h1 style={{ fontSize: 25, fontWeight: 700, color: CC.ink, margin: 0, letterSpacing: "-0.5px" }}>
            You are going to {d.name}
          </h1>
          <p style={{ fontSize: 14.5, color: CC.body, margin: "8px 0 0", lineHeight: "21px" }}>
            Booking confirmed for {d.month}. Your consultant will be in touch about the
            next steps this week.
          </p>
        </div>

        <SectionBar margin="26px 0" />

        {/* The invite */}
        <div style={{ padding: `0 ${PAD}px` }}>
          <div style={{
            borderRadius: 16, border: `1px solid ${CC.line}`, background: CC.white,
            padding: 18,
          }}>
            <Kicker style={{ color: CC.tealInk }}>Sunday Lounge</Kicker>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: CC.ink, margin: "8px 0 0", letterSpacing: "-0.3px", lineHeight: "26px" }}>
              Connect with everyone going to {d.name} in {d.month.split(" ")[0]}
            </h2>
            <p style={{ fontSize: 14, color: CC.body, margin: "8px 0 0", lineHeight: "21px" }}>
              Ask anything, and hear from travellers who have already been. Every answer
              shows where and when they actually went.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 4px" }}>
              <AvatarStack people={FACES} extra={d.cohort.members - FACES.length} />
              <span style={{ fontSize: 13, color: CC.body }}>
                {d.cohort.members} going, {d.month}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "18px 0 20px" }}>
              <Point icon={Users} text={`A group chat for everyone going in ${d.month.split(" ")[0]}`} />
              <Point icon={MessageCircleQuestion} text="Questions answered by our team, usually the same day" />
              <Point icon={BadgeCheck} text="Every answer carries a verified trip stamp" />
            </div>

            <Primary onClick={() => { track("community_joined", { dest, from: "booking" }); navigate(`/community/${dest}`); }}>
              Take me in
            </Primary>
            <button onClick={() => setSkipped(true)} style={{
              width: "100%", minHeight: 48, marginTop: 6, background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: CC.body,
            }}>Maybe later</button>
          </div>

          {skipped && (
            <div style={{
              marginTop: 12, borderRadius: 14, background: CC.well, padding: "13px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <p style={{ flex: 1, fontSize: 13, color: CC.body, margin: 0, lineHeight: "19px" }}>
                No problem. It will be waiting on your trip in My Trips whenever you want it.
              </p>
              <ChevronRight size={16} color={CC.soft} />
            </div>
          )}
        </div>

        <div style={{ height: 32 }} />
      </Body>
    </Screen>
  );
}

function Point({ icon: Icon, text }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Icon size={16} color={CC.teal} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ fontSize: 13.5, color: CC.ink, margin: 0, lineHeight: "20px" }}>{text}</p>
    </div>
  );
}
