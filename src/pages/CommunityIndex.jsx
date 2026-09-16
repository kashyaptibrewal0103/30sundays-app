import { useNavigate } from "react-router-dom";
import {
  Briefcase, BellRing, CheckCircle2, MessagesSquare, MessageCircleQuestion, ShieldCheck,
  Users, Inbox, Loader, WifiOff, ShieldAlert, ChevronRight, RotateCcw,
} from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, SectionBar, SectionHead, Kicker } from "../components/Community/CommunityUI";

// Every screen and state in one place, so the whole thing can be walked
// through in a demo without hunting for a route.

export default function CommunityIndex() {
  const navigate = useNavigate();
  const { resetCommunity, strikes } = useCommunity();

  const go = (to) => () => navigate(to);
  // The next post fails once, so the failure state can be shown on demand.
  const failNext = () => { window.__communityFailNext = true; navigate("/community/thailand"); };

  return (
    <Screen>
      <TopBar title="Sunday Lounge" sub="Phase 1 prototype" onBack={() => navigate("/account")} />
      <Body>
        <div style={{ padding: "14px 0 40px" }}>

          <div style={{ padding: `0 ${PAD}px 14px` }}>
            <p style={{ fontSize: 14, color: CC.body, margin: 0, lineHeight: "21px" }}>
              Questions about a destination, answered by our team and by travellers who
              have already been. Plus a group chat for everyone going the same month.
            </p>
          </div>

          <SectionBar margin="6px 0 20px" />

          <SectionHead>The three ways in</SectionHead>
          <Group>
            <Row icon={Briefcase} tint={CC.well} iconColor={CC.ink} title="On the trip screen"
              desc="The main one. Eleven layouts to choose from"
              onClick={go("/community-entries")} />
            <Row icon={CheckCircle2} tint={CC.tealTint} iconColor={CC.teal} title="Just after a booking"
              desc="The invite on the confirmation screen"
              onClick={go("/community/booking-confirmed?dest=thailand")} />
            <Row icon={BellRing} tint={CC.goldTint} iconColor={CC.gold} title="A push notification"
              desc="Opens straight to one question. Tile sits on My Trips"
              onClick={go("/trips-community")} last />
          </Group>

          <SectionBar />

          <SectionHead right="Thailand, October 2026">The screens</SectionHead>
          <Group>
            <Row icon={MessageCircleQuestion} tint={CC.well} iconColor={CC.ink} title="Questions"
              desc="The landing surface" onClick={go("/community/thailand")} />
            <Row icon={MessagesSquare} tint={CC.well} iconColor={CC.ink} title="Group chat"
              desc="19 travellers going, two checkpoints from our team" onClick={go("/community/thailand/chat")} />
            <Row icon={Users} tint={CC.well} iconColor={CC.ink} title="A long thread"
              desc="Three answers, one of them a quote reply" onClick={go("/community/thailand/q/t1")} />
            <Row icon={CheckCircle2} tint={CC.tealTint} iconColor={CC.teal} title="A solved question"
              desc="Accepted answer pinned to the top" onClick={go("/community/thailand/q/t3")} />
            <Row icon={ShieldCheck} tint={CC.well} iconColor={CC.body} title="Lounge guidelines"
              desc="Pinned and locked, no replies" onClick={go("/community/thailand/guidelines")} last />
          </Group>

          <SectionBar />

          <SectionHead>Empty and edge states</SectionHead>
          <Group>
            <Row icon={Inbox} tint={CC.well} iconColor={CC.body} title="No questions yet"
              desc="Only the pinned rows" onClick={go("/community/thailand?state=empty")} />
            <Row icon={Users} tint={CC.well} iconColor={CC.body} title="No group chat yet"
              desc="Mauritius, below the threshold of eight" onClick={go("/community/mauritius")} />
            <Row icon={MessagesSquare} tint={CC.well} iconColor={CC.body} title="A closed chat"
              desc="Vietnam, the month has passed. Read only" onClick={go("/community/vietnam/chat")} />
            <Row icon={Loader} tint={CC.well} iconColor={CC.body} title="Loading"
              desc="Skeleton feed" onClick={go("/community/thailand?state=loading")} />
            <Row icon={WifiOff} tint={CC.goldTint} iconColor={CC.goldInk} title="Failed to post"
              desc="Arms the next post to fail once" onClick={failNext} last />
          </Group>

          <SectionBar />

          <SectionHead>Moderation</SectionHead>
          <div style={{ padding: `0 ${PAD}px` }}>
            <div style={{
              border: `1px solid ${CC.line}`, borderRadius: 14, padding: 16, background: CC.white,
            }}>
              <Kicker>How To Trigger It</Kicker>
              <p style={{ fontSize: 13.5, color: CC.ink, margin: "8px 0 0", lineHeight: "20px" }}>
                Ask a question or write an answer with a phone number, an email, an @handle,
                or something that reads as selling. The first one offers an edit. The second
                is held back for our team.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginTop: 14,
                padding: "10px 12px", borderRadius: 10, background: CC.well,
              }}>
                <ShieldAlert size={15} color={strikes ? CC.gold : CC.soft} />
                <span style={{ flex: 1, fontSize: 12.5, color: CC.body }}>
                  {strikes === 0 ? "No offences yet" : strikes === 1 ? "One offence. The next one is blocked" : "Blocked"}
                </span>
                <button onClick={resetCommunity} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36, padding: "0 12px",
                  borderRadius: 9, border: `1px solid ${CC.line}`, background: CC.white, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: CC.ink,
                }}><RotateCcw size={13} /> Reset</button>
              </div>
            </div>
          </div>
        </div>
      </Body>
    </Screen>
  );
}

function Group({ children }) {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <div style={{ border: `1px solid ${CC.line}`, borderRadius: 14, overflow: "hidden", background: CC.white }}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon: Icon, tint, iconColor = CC.ink, title, desc, onClick, last }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 48,
      padding: "13px 14px", background: CC.white, border: "none",
      borderBottom: last ? "none" : `1px solid ${CC.line}`,
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10, background: tint, flexShrink: 0,
        display: "grid", placeItems: "center",
      }}><Icon size={16} color={iconColor} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink }}>{title}</span>
        <span style={{
          display: "block", fontSize: 12.5, color: CC.body, marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{desc}</span>
      </span>
      <ChevronRight size={17} color={CC.soft} />
    </button>
  );
}
