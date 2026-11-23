import { useParams } from "react-router-dom";
import { ChevronRight, ArrowLeftRight, BedDouble, MapPin, IndianRupee, Sparkles } from "lucide-react";
import { C } from "../../data";
import {
  PINK, TRIP, PEOPLE, Avatar, WhatsAppGlyph, useGo, Screen, Sheet, BackBar, btn,
} from "./parts";
import {
  OwnerTrip, AddSheet, ContactsSheet, SentSheet, PeopleSheet, RemoveDialog,
} from "./owner";
import {
  WaChat, MSG_SELF, MSG_BIZ, MSG_JOINED, GuestLogin, GuestWelcome, GuestPlans, GuestTrip, GuestPeopleSheet,
  GuestMismatch, GuestGone, GuestTwoInvites, PlanCard, OWNER_CARDS,
} from "./guest";

// ─── Plan together: every screen of the flow, on its own link ───
//
// /together lists them; /together/<screen> opens one. Buttons inside each
// screen move on through the flow, so it can be walked as Kashyap (the owner)
// and then as Priya (the guest). Nothing here touches the real trip screen.

const { priya } = PEOPLE;

// ─── The phone's lock screen, with what reached it ───
function LockScreen() {
  const go = useGo();
  const notes = [
    { app: "30 Sundays", when: "now", title: "Priya saved V3 of your Bali trip", line: "Changed the Ubud hotel. See what changed.", go: "t-v3" },
    { app: "30 Sundays", when: "14m ago", title: "Priya joined your Bali trip", line: "You can plan it together now.", go: "o-joined" },
    { app: "WhatsApp", when: "14m ago", title: "30 Sundays", line: "Good news, Kashyap! 🎉 Priya has joined your Bali trip on 30 Sundays...", go: "o-wa-joined", wa: true },
  ];
  return (
    <Screen testid="lock-screen" bg="#000">
      <div style={{ position: "absolute", inset: 0, background: `url(${TRIP.img}) center/cover`, filter: "blur(2px) brightness(0.62)", transform: "scale(1.05)" }} />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", padding: "56px 12px 0" }}>
        <p style={{ margin: 0, textAlign: "center", fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Sunday 23 November</p>
        <p style={{ margin: "0 0 28px", textAlign: "center", fontSize: 76, fontWeight: 700, color: "#fff", letterSpacing: -2, lineHeight: "84px" }}>4:13</p>
        {notes.map((n) => (
          <button key={n.title + n.when} data-testid={`push-${n.go}`} onClick={() => go(n.go)} style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", padding: "11px 12px", marginBottom: 8, border: "none", borderRadius: 20, background: "rgba(245,245,245,0.82)", backdropFilter: "blur(16px)", cursor: "pointer", fontFamily: "inherit" }}>
            {n.wa
              ? <span style={{ width: 36, height: 36, borderRadius: 9, background: "#25D366", display: "grid", placeItems: "center", flexShrink: 0 }}><WhatsAppGlyph size={22} /></span>
              : <span style={{ width: 36, height: 36, borderRadius: 9, background: PINK, color: "#fff", fontSize: 14, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>30</span>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, color: "#111" }}>
                <span>{n.title}</span><span style={{ fontSize: 12, fontWeight: 500, color: "#555", flexShrink: 0, marginLeft: 8 }}>{n.when}</span>
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 13.5, color: "#222", lineHeight: "18px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.line}</p>
            </div>
          </button>
        ))}
      </div>
    </Screen>
  );
}

// ─── My Plans, as Kashyap: today's card, with who saved each version inside ───
function PlansVersions() {
  const go = useGo();
  return (
    <Screen testid="plans-versions">
      <BackBar onBack={() => go()} title="My Plans" />
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "4px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {OWNER_CARDS.map((c) => <PlanCard key={c.key} c={c} />)}
      </div>
    </Screen>
  );
}

// ─── What changed, with who changed it ───
function ChangedSheet() {
  const go = useGo();
  const rows = [
    [BedDouble, "Ubud hotel", "Ubud Grand Resort, now Komaneka at Bisma"],
    [MapPin, "Day 2, Ubud", "Added Tegallalang rice terraces"],
    [IndianRupee, "Price", "₹12,400 more for 2"],
  ];
  return (
    <Sheet testid="changed-sheet" title="What changed in V3" onClose={() => go("o-joined")}>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: 12, background: C.bg }}>
        <Avatar p={priya} size={26} />
        <p style={{ margin: 0, fontSize: 12.5, color: C.head }}><b>Priya</b> made V3 from V2 · Today, 4:12 pm</p>
      </div>
      {rows.map(([Icon, a, b]) => (
        <div key={a} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.div}` }}>
          <Icon size={18} color={PINK} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>{a}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: C.sub }}>{b}</p>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={() => go("t-versions")} style={{ ...btn("outline"), height: 46, fontSize: 14 }}><ArrowLeftRight size={15} /> Compare with V2</button>
        <button onClick={() => go("o-joined")} style={{ ...btn("quiet"), height: 46, fontSize: 14 }}>Close</button>
      </div>
    </Sheet>
  );
}

// ─── Two people editing at once ───
function ClashFooter() {
  const go = useGo();
  return (
    <div style={{ flexShrink: 0 }}>
      <div data-testid="clash-bar" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderTop: `1px solid ${C.div}`, background: C.white }}>
        <Avatar p={priya} size={28} />
        <p style={{ margin: 0, flex: 1, fontSize: 12.5, color: C.head, lineHeight: "17px" }}><b>Priya just saved V3.</b> Your changes will save as V4.</p>
        <button onClick={() => go("t-v3")} style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: PINK, flexShrink: 0 }}>See V3</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", borderTop: `1px solid ${C.div}` }}>
        <Sparkles size={15} color={PINK} />
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.head }}>2 changes since V2, only you can see them</p>
      </div>
      <div style={{ borderTop: `1px solid ${C.div}`, padding: "10px 16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11.5, color: C.sub }}>Indicative total</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.head }}>₹1,51,200</p>
        </div>
        <span data-testid="save-v4" style={{ ...btn("solid"), width: "auto", padding: "0 22px", height: 46, fontSize: 14 }}>Save as V4</span>
      </div>
    </div>
  );
}

// ─── Every screen, by key ───
export const SCREENS = [
  { group: "1. Kashyap invites", items: [
    ["trip", "Trip, nobody invited yet", () => <OwnerTrip state="empty" />],
    ["add", "Invite someone", () => <OwnerTrip state="empty" sheet={<AddSheet />} />],
    ["contacts", "Pick from contacts", () => <OwnerTrip state="empty" sheet={<ContactsSheet />} />],
    ["contacts-two", "A contact with two numbers", () => <OwnerTrip state="empty" sheet={<ContactsSheet open="Rohan Mehta" />} />],
    ["add-filled", "Details filled in", () => <OwnerTrip state="empty" sheet={<AddSheet initial={{ name: "Priya Sharma", num: "98200 11223" }} />} />],
    ["add-error", "Their own number typed", () => <OwnerTrip state="empty" sheet={<AddSheet initial={{ name: "Priya Sharma", num: "99710 19664" }} />} />],
    ["sent", "Invite sent", () => <OwnerTrip state="empty" sheet={<SentSheet />} />],
    ["wa-self", "Sending it from WhatsApp", () => <WaChat testid="wa-self" from="priya" compose={MSG_SELF} button={() => {}} />],
    ["invited", "Trip, Priya invited", () => <OwnerTrip state="invited" />],
    ["people", "People on the trip", () => <OwnerTrip state="invited" sheet={<PeopleSheet />} />],
    ["people-menu", "Remove someone", () => <OwnerTrip state="invited" sheet={<PeopleSheet menu />} />],
    ["remove", "Remove an invite", () => <OwnerTrip state="invited" sheet={<RemoveDialog />} />],
  ] },
  { group: "2. Priya joins", items: [
    ["g-wa", "The invite on WhatsApp", () => <WaChat testid="g-wa" from="biz" buttonGo="g-login" received={[{ text: MSG_BIZ, time: "2:14 pm", img: true, button: "Open the trip" }]} />],
    ["g-login", "Log in, as usual", () => <GuestLogin />],
    ["g-welcome", "You've been invited", () => <GuestWelcome />],
    ["g-plans", "My Plans, with the invited trip", () => <GuestPlans />],
    ["g-trip", "Priya's trip screen", () => <GuestTrip />],
    ["g-people", "People, as Priya sees them", () => <GuestTrip sheet={<GuestPeopleSheet />} />],
    ["g-leave", "Leave this trip", () => <GuestTrip sheet={<GuestPeopleSheet leave />} />],
    ["g-two", "Invited to two trips", () => <GuestTwoInvites />],
  ] },
  { group: "3. Kashyap hears", items: [
    ["o-wa-joined", "Joined, on WhatsApp", () => <WaChat testid="o-wa-joined" from="biz" buttonGo="o-joined" received={[{ text: MSG_JOINED, time: "3:59 pm", button: "Open your trip" }]} />],
    ["o-push", "Joined, on the lock screen", () => <LockScreen />],
    ["o-joined", "Trip, Priya joined", () => <OwnerTrip state="joined" banner version="V3" versionLine="V3 by Priya · Today, 4:12 pm" total="₹1,57,396" />],
    ["people-joined", "People, after joining", () => <OwnerTrip state="joined" version="V3" versionLine="V3 by Priya · Today, 4:12 pm" total="₹1,57,396" sheet={<PeopleSheet joined />} />],
    ["remove-joined", "Remove someone who joined", () => <OwnerTrip state="joined" version="V3" total="₹1,57,396" sheet={<RemoveDialog joined />} />],
  ] },
  { group: "4. Planning together", items: [
    ["t-versions", "My Plans: who saved each version", () => <PlansVersions />],
    ["t-v3", "What changed, and who", () => <OwnerTrip state="joined" version="V3" versionLine="V3 by Priya · Today, 4:12 pm" total="₹1,57,396" sheet={<ChangedSheet />} />],
    ["t-clash", "Both editing at once", () => <OwnerTrip state="joined" version="V2" versionLine="Editing from V2" footer={<ClashFooter />} />],
  ] },
  { group: "5. When it does not work", items: [
    ["g-mismatch", "Logged in with another number", () => <GuestMismatch />],
    ["g-inactive", "Invite no longer active", () => <GuestGone kind="inactive" />],
    ["g-gone", "No longer on the trip", () => <GuestGone kind="removed" />],
  ] },
];

const BY_KEY = Object.fromEntries(SCREENS.flatMap((g) => g.items.map(([k, , el]) => [k, el])));

function Index() {
  const go = useGo();
  return (
    <Screen testid="together-index">
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "22px 16px 24px" }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: PINK }}>PLAN TOGETHER · ALL SCREENS</p>
        <h1 style={{ margin: "6px 0 4px", fontSize: 24, fontWeight: 800, color: C.head, letterSpacing: -0.5 }}>Invite someone to plan</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: C.sub, lineHeight: "19px" }}>Kashyap made a Bali trip and invites Priya. Open any screen; the buttons inside move on through the flow.</p>
        {SCREENS.map((g) => (
          <div key={g.group} style={{ marginTop: 18 }}>
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: C.head }}>{g.group}</p>
            <div style={{ border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden" }}>
              {g.items.map(([k, name], i) => (
                <button key={k} data-testid={`open-${k}`} onClick={() => go(k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "none", borderTop: i ? `1px solid ${C.div}` : "none", background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ flex: 1, fontSize: 14, color: C.head }}>{name}</span>
                  <ChevronRight size={17} color={C.inact} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

export default function TogetherLab() {
  const { screen } = useParams();
  const El = screen && BY_KEY[screen];
  return El ? <El key={screen} /> : <Index />;
}
