import { useNavigate } from "react-router-dom";
import {
  Briefcase, CheckCircle2, BellRing, Home, MessageCircleQuestion, MessagesSquare,
  Search, Bookmark, ShieldCheck, Plane, Lock, Users, Inbox, Loader, WifiOff, Bell,
  ShieldAlert, ChevronRight, RotateCcw, Layers, ArrowRightLeft, HelpCircle,
  User, FileText, Lightbulb,
} from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, SectionBar, SectionHead } from "../components/Community/CommunityUI";

// Every Community screen, state and edge case, on one page.
//
// Two audiences use this. Somebody who wants to see the product walks the
// flow at the top in order. Somebody building or testing one screen jumps
// straight to it from the lists below, including the states that are hard to
// reach by hand: an empty room, a failed post, a room whose month has passed.

export default function LoungeDirectory() {
  const navigate = useNavigate();
  const { resetCommunity, strikes, setCancelled } = useCommunity();

  const go = (to) => () => navigate(to);
  // Arms the next post to fail once, so the failure state can be seen without
  // unplugging anything.
  const failNext = () => { window.__communityFailNext = true; navigate("/community/thailand"); };
  // Two states that take three blocked posts or a cancellation to reach by
  // hand. The switch is the only honest way to show them in a prototype.
  const pauseNow = () => {
    try {
      const raw = JSON.parse(localStorage.getItem("30s_community_v2") || "{}");
      localStorage.setItem("30s_community_v2", JSON.stringify({
        ...raw, strikes: 3, posting: "paused", pausedSeen: false,
      }));
    } catch { /* noop */ }
    window.location.href = "/community/thailand";
  };
  const cancelNow = () => { setCancelled(true); navigate("/community/thailand"); };

  return (
    <Screen>
      <TopBar title="Community Screens" sub="Every screen and state" onBack={() => navigate("/community")} />
      <Body>
        <div style={{ padding: "14px 0 44px" }}>

          <div style={{ padding: `0 ${PAD}px 16px` }}>
            <p style={{ fontSize: 14, color: CC.body, margin: 0, lineHeight: "21px" }}>
              Questions about a destination, answered by travellers who have been and
              by our team. Walk the flow in order, or jump to any single screen.
            </p>
          </div>

          <SectionBar margin="4px 0 20px" />

          {/* ── The flow, in the order a traveller meets it ── */}
          <SectionHead right="In order">The whole flow</SectionHead>
          <Group>
            <Row n={1} icon={Briefcase} title="A trip screen"
              desc="The band that opens the Community, under the trip"
              onClick={go("/trips/trip-1")} />
            <Row n={2} icon={MessageCircleQuestion} title="The destination room"
              desc="Opened from the trip, so back returns to the trip"
              onClick={go("/community/thailand?from=trip")} />
            <Row n={3} icon={MessagesSquare} title="A question, with answers"
              desc="Our team first, then travellers who went"
              onClick={go("/community/thailand/q/t1")} />
            <Row n={4} icon={ArrowRightLeft} title="The room switcher"
              desc="Tap the room name in the bar to change room"
              onClick={go("/community/thailand")} />
            <Row n={5} icon={Home} title="Community home"
              desc="Every room, and questions from all of them"
              onClick={go("/community")} last />
          </Group>

          <SectionBar />

          {/* ── Ways in ── */}
          <SectionHead>The ways in</SectionHead>
          <Group>
            <Row icon={Briefcase} title="From a trip"
              desc="The main one. A band on the trip screen"
              onClick={go("/trips/trip-1")} />
            <Row icon={CheckCircle2} tint={CC.tealTint} iconColor={CC.teal} title="Just after booking"
              desc="The invite on the confirmation screen"
              onClick={go("/community/booking-confirmed?dest=thailand")} />
            <Row icon={BellRing} tint={CC.goldTint} iconColor={CC.gold} title="A push notification"
              desc="Opens one question. The tile sits on My Trips"
              onClick={go("/trips-community")} last />
          </Group>

          <SectionBar />

          {/* ── The screens themselves ── */}
          <SectionHead right="Thailand, October 2026">The screens</SectionHead>
          <Group>
            <Row icon={Home} title="Community home"
              desc="Search, rooms, and questions from every room"
              onClick={go("/community")} />
            <Row icon={MessageCircleQuestion} title="A destination room"
              desc="Cover, who is going, filters, questions"
              onClick={go("/community/thailand")} />
            <Row icon={Plane} tint={CC.tealTint} iconColor={CC.teal} title="General Queries"
              desc="Visas, passports, forex. Anyone who booked can answer"
              onClick={go("/community/india")} />
            <Row icon={MessagesSquare} title="A question thread"
              desc="Three answers, most helpful marked"
              onClick={go("/community/thailand/q/t1")} />
            <Row icon={Users} title="A thread in the India room"
              desc="Our team's answer, then what travellers found"
              onClick={go("/community/india/q/in1")} />
            <Row icon={Search} title="Search one room"
              desc="Top questions first, then live results"
              onClick={go("/community/thailand/search")} />
            <Row icon={Search} title="Search everywhere"
              desc="The same screen, across all rooms"
              onClick={go("/community/search")} />
            <Row icon={Bookmark} title="Saved questions"
              desc="Whatever this traveller bookmarked"
              onClick={go("/community/thailand/saved")} />
            <Row icon={Bell} title="Notifications"
              desc="Answers, moderation outcomes, appeals"
              onClick={go("/community/notifications")} />
            <Row icon={ShieldCheck} title="Guidelines"
              desc="The rules, now a row on the Community home"
              onClick={go("/community/thailand/guidelines")} />
            <Row icon={User} title="Your profile"
              desc="Photo, one line about you, delete everything you wrote"
              onClick={go("/community/profile")} />
            <Row icon={Bell} title="Notification settings"
              desc="What reaches you, and muted questions"
              onClick={go("/community/settings")} />
            <Row icon={FileText} title="Your posts"
              desc="Every question and answer this traveller wrote"
              onClick={go("/community/my-posts")} />
            <Row icon={Lightbulb} title="Suggest a change"
              desc="A feature, a rule, or something broken, sent to the team"
              onClick={go("/community/suggest")} last />
          </Group>

          <SectionBar />

          {/* ── The states that are hard to reach by hand ── */}
          <SectionHead>Edge cases</SectionHead>
          <Group>
            <Row icon={Lock} tint={CC.goldTint} iconColor={CC.goldInk} title="A room you have not booked"
              desc="Bali. Reading only, no asking"
              onClick={go("/community/bali")} />
            <Row icon={Users} title="A quiet room"
              desc="Mauritius, only a few going so far"
              onClick={go("/community/mauritius")} />
            <Row icon={MessagesSquare} title="A month that has passed"
              desc="Vietnam, closed but still readable"
              onClick={go("/community/vietnam")} />
            <Row icon={HelpCircle} title="A question nobody answered"
              desc="Shows Needs an answer, and the offer to write one"
              onClick={go("/community/thailand/q/t6")} />
            <Row icon={Inbox} title="A room with no questions"
              desc="Only the band and the empty state"
              onClick={go("/community/thailand?state=empty")} />
            <Row icon={Search} title="A search that finds nothing"
              desc="Offers to widen, then to ask"
              onClick={go("/community/thailand/search?q=zzzz")} />
            <Row icon={Loader} title="Loading"
              desc="Skeleton feed"
              onClick={go("/community/thailand?state=loading")} />
            <Row icon={WifiOff} tint={CC.goldTint} iconColor={CC.goldInk} title="A post that fails"
              desc="Arms the next post to fail once"
              onClick={failNext} />
            <Row icon={Bell} title="Notifications"
              desc="Everything that happened to this traveller's posts"
              onClick={go("/community/notifications")} />
            <Row icon={Lock} tint={CC.pinkTint} iconColor={CC.pink} title="Posting paused"
              desc="Three blocked posts. Reading, liking and saving carry on"
              onClick={pauseNow} />
            <Row icon={Lock} title="A cancelled booking"
              desc="Posting off, reading on, no reason given"
              onClick={cancelNow} last />
          </Group>

          <SectionBar />

          {/* ── Moderation, which needs an explanation, not a link ── */}
          <SectionHead>Moderation</SectionHead>
          <div style={{ padding: `0 ${PAD}px` }}>
            <div style={{
              border: `1px solid ${CC.line}`, borderRadius: 14, padding: 16, background: CC.white,
            }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: CC.goldInk, margin: 0 }}>
                How To Trigger It
              </p>
              <p style={{ fontSize: 13.5, color: CC.ink, margin: "8px 0 0", lineHeight: "20px" }}>
                Ask a question or write an answer carrying a phone number, an email, an
                @handle, or something that reads as selling. The first one offers an edit.
                The second is held back for our team.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginTop: 14,
                padding: "10px 12px", borderRadius: 10, background: CC.well,
              }}>
                <ShieldAlert size={15} color={strikes ? CC.gold : CC.soft} />
                <span style={{ flex: 1, fontSize: 12.5, color: CC.body }}>
                  {strikes === 0
                    ? "No offences yet"
                    : strikes === 1 ? "One offence. The next one is blocked" : "Blocked"}
                </span>
                <button onClick={resetCommunity} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, minHeight: 36,
                  padding: "0 12px", borderRadius: 9, border: `1px solid ${CC.line}`,
                  background: CC.white, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12.5, fontWeight: 700, color: CC.ink,
                }}><RotateCcw size={13} /> Reset</button>
              </div>
              <p style={{ fontSize: 12.5, color: CC.soft, margin: "10px 0 0", lineHeight: "18px" }}>
                Reset clears everything this browser remembers: questions asked, answers,
                likes, saves, reports and offences.
              </p>
            </div>
          </div>

          <SectionBar />

          {/* ── The comparison screens, kept so decisions can be revisited ── */}
          <SectionHead right="Not live">Design options</SectionHead>
          <Group>
            <Row icon={Layers} title="Room list"
              desc="Eight ways to show the rooms on Community home"
              onClick={go("/community-rooms")} />
            <Row icon={ArrowRightLeft} title="Trip mark in the switcher"
              desc="Five ways to say which destination is yours"
              onClick={go("/community-switcher")} />
            <Row icon={Layers} title="Trip screen entry"
              desc="Eleven layouts for the band on a trip"
              onClick={go("/community-entries")} />
            <Row icon={Layers} title="Question card styles"
              desc="Seven directions for the feed"
              onClick={go("/community-styles")} />
            <Row icon={Layers} title="Card styles, app native"
              desc="The same, built from the app's own patterns"
              onClick={go("/community-native")} />
            <Row icon={Layers} title="Card styles, mixed"
              desc="The set the current design came from"
              onClick={go("/community-mix")} />
            <Row icon={Layers} title="Card meta row"
              desc="Six ways to place the count and the time"
              onClick={go("/community-meta")} />
            <Row icon={Layers} title="Reply rows"
              desc="Six ways to cut the height of an answer"
              onClick={go("/community-rows")} />
            <Row icon={Layers} title="Room top block"
              desc="Layouts for the band above the questions"
              onClick={go("/community-layouts")} />
            <Row icon={Layers} title="Trip band copy"
              desc="Headline options for the entry band"
              onClick={go("/community-copy")} />
            <Row icon={Layers} title="Count signals"
              desc="Which numbers earn their place"
              onClick={go("/community-signals")} />
            <Row icon={Layers} title="Parts"
              desc="The small pieces on their own"
              onClick={go("/community-parts")} last />
          </Group>
        </div>
      </Body>
    </Screen>
  );
}

function Group({ children }) {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <div style={{
        border: `1px solid ${CC.line}`, borderRadius: 14, overflow: "hidden", background: CC.white,
      }}>{children}</div>
    </div>
  );
}

// `n` numbers the flow, so the order it is walked in is on the screen rather
// than in somebody's memory.
function Row({ icon: Icon, tint = CC.well, iconColor = CC.ink, n, title, desc, onClick, last }) {
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
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
          {n ? `${n}. ${title}` : title}
        </span>
        <span style={{
          display: "block", fontSize: 12.5, color: CC.body, marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{desc}</span>
      </span>
      <ChevronRight size={17} color={CC.soft} />
    </button>
  );
}
