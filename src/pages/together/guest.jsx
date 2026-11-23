import { useState } from "react";
import { Mail, ChevronDown, Heart, User, ArrowLeftRight, Check, ChevronLeft, MoreVertical, Video, Phone, Paperclip, Camera, Mic, SendHorizontal, BadgeCheck, LogOut, Lightbulb, X, PhoneCall, Lock, Link2Off, ArrowRight } from "lucide-react";
import { C, allItineraries } from "../../data";
import LoginV2 from "../LoginV2";
import {
  PINK, WA, TRIP, PEOPLE, Avatar, Faces, StatusChip, useGo, Screen, Sheet, TripHero, TripInfo, GlanceStub, btn,
} from "./parts";
import { TopStrip, TogetherCard } from "./owner";

const { kashyap, priya, ankit } = PEOPLE;

// ─── A WhatsApp chat, drawn ───
//
// Not our app: the message as it lands, so the copy is judged where it is read.
// `from` is who the chat is with. `compose` holds a message typed into the box
// but not sent: the owner's own invite, ready for them to send.
const LINK = "30sundays.club/j/K7Q2";

export function WaChat({ from, sent = [], received = [], compose, button, testid, onButton, buttonGo }) {
  const go = useGo();
  const biz = from === "biz";
  const who = biz ? { name: "30 Sundays", sub: "Business account" } : from === "priya" ? { name: "Priya Sharma", sub: "online" } : { name: from, sub: "" };
  return (
    <Screen testid={testid} bg={WA.chat}>
      <div style={{ flexShrink: 0, background: C.white, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #E4E4E4" }}>
        <button onClick={() => go()} aria-label="Back" style={{ border: "none", background: "none", padding: 2, cursor: "pointer", display: "grid" }}><ChevronLeft size={24} color="#111B21" /></button>
        {biz ? <Avatar p={ankit} size={36} /> : <Avatar p={priya} size={36} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: "#111B21", display: "flex", alignItems: "center", gap: 4 }}>{who.name}{biz && <BadgeCheck size={16} color={WA.green} fill={WA.green} stroke="#fff" />}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#667781" }}>{who.sub}</p>
        </div>
        {!biz && <Video size={21} color="#111B21" />}
        {!biz && <Phone size={19} color="#111B21" style={{ marginLeft: 14 }} />}
        <MoreVertical size={20} color="#111B21" style={{ marginLeft: 10 }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8 }} className="hide-scrollbar">
        <span style={{ alignSelf: "center", fontSize: 11.5, color: "#54656F", background: "#FFFFFFCC", borderRadius: 8, padding: "4px 10px" }}>TODAY</span>
        {biz && <p style={{ alignSelf: "center", margin: 0, maxWidth: "88%", textAlign: "center", fontSize: 11.5, color: "#54656F", background: "#FFF5C4", borderRadius: 8, padding: "6px 10px" }}>This business uses a secure service from Meta to manage this chat.</p>}
        {received.map((m, i) => (
          <div key={`r${i}`} style={{ alignSelf: "flex-start", maxWidth: "86%" }}>
            <div style={{ background: C.white, borderRadius: "0 10px 10px 10px", padding: "8px 10px 6px", boxShadow: "0 1px 1px rgba(0,0,0,0.08)" }}>
              {m.img && <div style={{ height: 120, borderRadius: 8, margin: "0 0 8px", background: `url(${TRIP.img}) center/cover` }} />}
              <p style={{ margin: 0, fontSize: 14, color: "#111B21", lineHeight: "20px", whiteSpace: "pre-wrap" }}>{m.text}</p>
              <p style={{ margin: "2px 0 0", textAlign: "right", fontSize: 11, color: "#667781" }}>{m.time}</p>
            </div>
            {m.button && (
              <button data-testid="wa-button" onClick={onButton || (buttonGo ? () => go(buttonGo) : undefined)} style={{ marginTop: 2, width: "100%", border: "none", background: C.white, borderRadius: 10, padding: "10px 0", fontSize: 14.5, fontWeight: 600, color: "#027EB5", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 1px rgba(0,0,0,0.08)" }}>{m.button}</button>
            )}
          </div>
        ))}
        {sent.map((m, i) => (
          <div key={`s${i}`} style={{ alignSelf: "flex-end", maxWidth: "86%", background: WA.bubbleOut, borderRadius: "10px 0 10px 10px", padding: "8px 10px 6px", boxShadow: "0 1px 1px rgba(0,0,0,0.08)" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#111B21", lineHeight: "20px", whiteSpace: "pre-wrap" }}>{m.text}</p>
            <p style={{ margin: "2px 0 0", textAlign: "right", fontSize: 11, color: "#667781" }}>{m.time} <span style={{ color: WA.tick }}>✓✓</span></p>
          </div>
        ))}
      </div>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-end", gap: 6, padding: "8px 8px 12px" }}>
        <div style={{ flex: 1, background: C.white, borderRadius: 22, padding: compose ? "10px 14px" : "11px 14px", display: "flex", alignItems: "flex-end", gap: 10, minHeight: 22 }}>
          <p style={{ margin: 0, flex: 1, fontSize: 14, lineHeight: "20px", color: compose ? "#111B21" : "#8696A0", whiteSpace: "pre-wrap", maxHeight: 220, overflow: "hidden" }}>{compose || "Message"}</p>
          {!compose && <><Paperclip size={20} color="#54656F" /><Camera size={20} color="#54656F" /></>}
        </div>
        <span data-testid={compose ? "wa-send" : undefined} onClick={button} style={{ width: 46, height: 46, borderRadius: "50%", background: WA.dark, display: "grid", placeItems: "center", flexShrink: 0, cursor: compose ? "pointer" : "default" }}>
          {compose ? <SendHorizontal size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
        </span>
      </div>
    </Screen>
  );
}

export const MSG_SELF = `Hi Priya 🌴\nIt's Kashyap. I've started planning our Bali trip on 30 Sundays and I'd love to plan it with you!\nDownload the app: ${LINK}\nLog in with this number to see the plan so far, and let's finalise the rest together.`;
export const MSG_BIZ = `Hi Priya 🌴\nKashyap has started planning your Bali trip on 30 Sundays and would love to plan it with you!\nDownload the app: ${LINK}\nLog in with this number to see the plan so far and finalise the rest together.`;
export const MSG_JOINED = `Good news, Kashyap! 🎉\nPriya has joined your Bali trip on 30 Sundays. You can now plan it together, and every change shows who made it.\nOpen your trip: 30sundays.club/t/bali`;

export function GuestLogin() {
  const go = useGo();
  return (
    <div data-testid="guest-login" style={{ height: "100%" }}>
      <LoginV2
        initial={{ phase: "phone", phone: "9820011223" }}
        onBack={() => go("g-wa")}
        onComplete={() => go("g-welcome")}
        validateOtp={(otp) => (otp === "000000" ? "Invalid OTP. Please try again." : null)}
      />
    </div>
  );
}

// ─── You've been invited ───
//
// The one screen between the usual login and the usual app. It says who
// invited them and to what, then hands them to My Plans, where the trip now
// sits beside any trips of their own.
export function GuestWelcome() {
  const go = useGo();
  return (
    <Screen testid="guest-welcome">
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "44px 20px 16px", textAlign: "center" }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          <Avatar p={kashyap} size={64} />
          <span style={{ position: "absolute", right: -4, bottom: -2, width: 26, height: 26, borderRadius: "50%", background: PINK, border: "2px solid #fff", display: "grid", placeItems: "center" }}><Mail size={13} color="#fff" /></span>
        </span>
        <h1 style={{ margin: "16px auto 6px", maxWidth: 300, fontSize: 24, fontWeight: 800, color: C.head, letterSpacing: -0.5, lineHeight: "30px" }}>Kashyap invited you to plan a Bali trip</h1>
        <p style={{ margin: "0 auto", maxWidth: 300, fontSize: 14, color: C.sub, lineHeight: "20px" }}>It&apos;s in your plans now, next to any trips of your own. We&apos;ve told Kashyap you joined.</p>
        <div style={{ marginTop: 22, textAlign: "left", border: `1px solid ${C.div}`, borderRadius: 18, overflow: "hidden" }}>
          <div style={{ height: 124, background: `${C.bg} url(${TRIP.img}) center 30%/cover` }} />
          <div style={{ padding: "12px 14px" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.head }}>Bali · {TRIP.nights} nights</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{TRIP.when} · {TRIP.route.map((r) => `${r.city} ${r.n}N`).join(" · ")}</p>
            <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.sub }}>Latest: <b style={{ color: C.head }}>V2</b>, saved by Kashyap yesterday</p>
          </div>
        </div>
        <p style={{ margin: "18px auto 0", maxWidth: 310, fontSize: 13, color: C.sub, lineHeight: "19px" }}>Change anything and save it. Every version shows who saved it, so you both know who changed what.</p>
      </div>
      <div style={{ flexShrink: 0, padding: "10px 20px 18px" }}>
        <button data-testid="welcome-plans" onClick={() => go("g-plans")} style={btn("solid")}>Go to My Plans <ArrowRight size={17} /></button>
      </div>
    </Screen>
  );
}

// ─── My Plans, with trips of their own and trips they were invited to ───
//
// The same cards as today. A trip someone invited them to says so on a line
// across its top, with that person's face; a new one is outlined and marked
// New until opened. Every version says who saved it.
const thai = allItineraries.find((i) => i.id === 13);
const lanka = allItineraries.find((i) => i.id === 19);
const ananya = { key: "ananya", first: "Ananya", fg: C.sText, bg: C.sBg };
const me = { ...priya, first: "You", initial: "P" };

// ─── A My Plans card, in today's format ───
//
// The card is the one My Plans already uses: photo, destination and nights,
// version, route, dates and travellers, when it was generated, the price, and
// the earlier versions folded under it. Two things are added, and only where
// they apply:
//   - a trip someone invited you to says so on a line across its top;
//   - opening the versions shows who saved each one, the latest included.
// The owner's own card carries nothing else: it is today's card.
// Who saved what is not on the closed card.
export function PlanCard({ c }) {
  const go = useGo();
  const [open, setOpen] = useState(!!c.open);
  const name = (p) => (p.first === "You" ? "you" : p.first);
  const latest = c.versions[0];
  return (
    <div data-testid={`plan-${c.key}`} style={{ border: c.fresh ? `1.5px solid ${C.p300}` : `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden", background: C.white, boxShadow: c.fresh ? "0 6px 18px rgba(227,27,83,0.10)" : "none" }}>
      {c.by && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderBottom: `1px solid ${C.bg}` }}>
          <Avatar p={c.by} size={22} />
          <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 12.5, color: C.head }}><b>{c.by.first}</b> invited you to plan this trip</p>
          {c.fresh && <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: PINK, borderRadius: 999, padding: "2px 7px", letterSpacing: 0.3 }}>NEW</span>}
        </div>
      )}
      <div onClick={() => c.go && go(c.go)} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 12px 11px", cursor: "pointer" }}>
        <span style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, background: `${C.bg} url(${c.img}) center/cover` }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: C.bg, color: C.sub, letterSpacing: ".3px" }}>{latest.v}</span>
              <Heart size={18} color={C.sub} />
            </div>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.head, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.route}</p>
          <p style={{ margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.sub }}>{c.dates} · <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>{c.pax}<User size={12} /></span></p>
          {c.with && (
            <p style={{ margin: "6px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.sub }}>
              <Avatar p={c.with} size={18} /> Planning with <b style={{ color: C.head }}>{c.with.first}</b>
            </p>
          )}
          <p style={{ margin: "1px 0 0", fontSize: 11, color: C.inact }}>Generated {c.generated}</p>
        </div>
      </div>
      <div onClick={() => c.go && go(c.go)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 12px", borderTop: `1px solid ${C.bg}`, cursor: "pointer" }}>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: C.head }}>{latest.total}<span style={{ fontSize: 11, fontWeight: 500, color: C.sub }}> incl. taxes</span></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: PINK }}>View <ArrowRight size={14} /></span>
      </div>
      {c.versions.length > 1 && (
        <>
          <div style={{ display: "flex", alignItems: "center", borderTop: `1px solid ${C.bg}` }}>
            <div data-testid={`plan-${c.key}-versions`} onClick={() => setOpen(!open)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", cursor: "pointer" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>{c.versions.length - 1} earlier version{c.versions.length > 2 ? "s" : ""}</span>
              <ChevronDown size={15} color={C.sub} style={{ transform: open ? "rotate(180deg)" : "none" }} />
            </div>
            <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 12px", fontSize: 12.5, fontWeight: 700, color: C.head }}><ArrowLeftRight size={14} /> Compare</span>
          </div>
          {open && c.versions.map((e, i) => (
            <div key={e.v} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px 9px 14px", borderTop: `1px solid ${C.bg}` }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6, background: i === 0 ? C.p100 : C.bg, color: i === 0 ? PINK : C.sub, flexShrink: 0 }}>{e.v}</span>
              <Avatar p={e.who} size={20} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Saved by <b>{name(e.who)}</b>{i === 0 && <span style={{ color: C.sub }}> · latest</span>}</p>
                <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.sub }}>{e.when} · {e.total}</p>
              </div>
              <ArrowRight size={13} color={C.inact} style={{ flexShrink: 0 }} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// The cards on Priya's My Plans: two trips she was invited to, one of her own.
const GUEST_CARDS = [
  {
    key: "bali", by: kashyap, fresh: true, go: "g-trip", img: TRIP.img, title: `🇮🇩 Bali · ${TRIP.nights}N`, route: TRIP.route.map((r) => `${r.city} ${r.n}N`).join(" · "), dates: "17 Dec", pax: 2, generated: "22 Nov",
    versions: [{ v: "V2", who: kashyap, when: "Yesterday, 11:05 am", total: "₹1,44,996" }, { v: "V1", who: kashyap, when: "18 Nov, 9:40 pm", total: "₹1,38,200" }],
  },
  {
    key: "lanka", by: ananya, open: true, img: lanka?.img, title: "🇱🇰 Sri Lanka · 7N", route: (lanka?.route || []).map((r) => `${r.city} ${r.n}N`).join(" · "), dates: "14 Feb", pax: 4, generated: "20 Nov",
    versions: [{ v: "V3", who: me, when: "20 Nov, 6:10 pm", total: "₹2,31,992" }, { v: "V2", who: ananya, when: "15 Nov, 1:25 pm", total: "₹2,19,992" }, { v: "V1", who: ananya, when: "10 Nov, 8:02 pm", total: "₹2,24,000" }],
  },
  {
    key: "thai", img: thai?.img, title: `🇹🇭 Thailand · ${thai?.nights || 6}N`, route: (thai?.route || []).map((r) => `${r.city} ${r.n}N`).join(" · "), dates: "3 Mar", pax: 2, generated: "12 Nov",
    versions: [{ v: "V1", who: me, when: "12 Nov, 10:30 am", total: "₹1,24,996" }],
  },
];

export function GuestPlans() {
  return (
    <Screen testid="guest-plans">
      <div style={{ flexShrink: 0, padding: "14px 16px 8px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>My Plans</h1>
        <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 0" }}>3 plans · 2 shared with you</p>
      </div>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "8px 16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {GUEST_CARDS.map((c) => <PlanCard key={c.key} c={c} />)}
      </div>
    </Screen>
  );
}

// Kashyap's My Plans, after Priya saved V3 of the Bali trip.
export const OWNER_CARDS = [
  {
    key: "owner-bali", open: true, go: "t-v3", img: TRIP.img, title: `🇮🇩 Bali · ${TRIP.nights}N`, route: TRIP.route.map((r) => `${r.city} ${r.n}N`).join(" · "), dates: "17 Dec", pax: 2, generated: "Today",
    versions: [{ v: "V3", who: priya, when: "Today, 4:12 pm", total: "₹1,57,396" }, { v: "V2", who: { ...kashyap, first: "You", initial: "K" }, when: "Yesterday, 11:05 am", total: "₹1,44,996" }, { v: "V1", who: { ...kashyap, first: "You", initial: "K" }, when: "18 Nov, 9:40 pm", total: "₹1,38,200" }],
  },
  {
    key: "owner-thai", img: thai?.img, title: `🇹🇭 Thailand · ${thai?.nights || 6}N`, route: (thai?.route || []).map((r) => `${r.city} ${r.n}N`).join(" · "), dates: "3 Mar", pax: 2, generated: "12 Nov",
    versions: [{ v: "V1", who: { ...kashyap, first: "You", initial: "K" }, when: "12 Nov, 10:30 am", total: "₹1,24,996" }],
  },
];

// ─── Priya's trip screen ───
export function GuestTrip({ sheet = null }) {
  const go = useGo();
  const [tip, setTip] = useState(true);
  return (
    <Screen testid="guest-trip">
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <TripHero onBack={() => go("g-plans")} version="V2" />
        {tip && (
          <div data-testid="guest-tip" style={{ margin: "12px 16px 0", display: "flex", gap: 10, padding: "12px", borderRadius: 14, border: `1px solid ${C.div}`, boxShadow: "0 4px 14px rgba(16,24,40,0.06)" }}>
            <Lightbulb size={18} color={PINK} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, flex: 1, fontSize: 13, color: C.head, lineHeight: "19px" }}>This is the plan Kashyap made. <b>Change anything and save.</b> Kashyap will see it with your name.</p>
            <button onClick={() => setTip(false)} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 0, alignSelf: "flex-start" }}><X size={16} color={C.sub} /></button>
          </div>
        )}
        <TripInfo versionLine="V2 by Kashyap · Yesterday, 11:05 am" strip={<TopStrip state="joined" guest onClick={() => go("g-people")} />} />
        <GlanceStub />
        <TogetherCard state="joined" guest onOpen={() => go("g-people")} />
        <div style={{ height: 90 }} />
      </div>
      <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, padding: "10px 16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11.5, color: C.sub }}>Total for 2</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.head }}>{TRIP.total}</p>
        </div>
        <span style={{ ...btn("solid"), width: "auto", padding: "0 20px", height: 46, fontSize: 14 }}>Review &amp; Pay</span>
      </div>
      {sheet}
    </Screen>
  );
}

export function GuestPeopleSheet({ leave: leaveFirst = false }) {
  const go = useGo();
  const [leave, setLeave] = useState(leaveFirst);
  return (
    <>
      <Sheet testid="guest-people" title="People on this trip" sub="Everyone here can see and change this trip." onClose={() => go("g-trip")} tall>
        <div style={{ marginTop: 8 }}>
          {[[kashyap, "owner", "Made this trip"], [priya, "joined", "Joined today, 3:58 pm", true]].map(([p, chip, line, you]) => (
            <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.div}` }}>
              <Avatar p={p} size={42} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: C.head }}>{you ? "You" : p.name}</span>
                  <StatusChip kind={chip} />
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{line}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "12px 2px 0", fontSize: 12.5, color: C.sub }}>Want someone else on the trip? Ask Kashyap to invite them.</p>
        <button data-testid="guest-leave" onClick={() => setLeave(true)} style={{ marginTop: 18, width: "100%", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#D92D20", padding: 8 }}>
          <LogOut size={16} /> Leave this trip
        </button>
      </Sheet>
      {leave && (
        <div data-testid="leave-dialog" style={{ position: "absolute", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 24 }}>
          <div onClick={() => setLeave(false)} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.5)" }} />
          <div style={{ position: "relative", width: "100%", background: C.white, borderRadius: 20, padding: "22px 20px 18px", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: C.head }}>Leave Kashyap's Bali trip?</h3>
            <p style={{ margin: 0, fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>It leaves your plans. Versions you saved stay on the trip, with your name. Kashyap can invite you again.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => setLeave(false)} style={{ ...btn("quiet"), height: 46, fontSize: 14 }}>Stay</button>
              <button onClick={() => go("g-gone")} style={{ ...btn("solid"), height: 46, fontSize: 14, background: "#D92D20", boxShadow: "none" }}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── When it does not work ───
function Notice({ testid, icon, title, body, children }) {
  return (
    <Screen testid={testid}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
        <span style={{ alignSelf: "center", width: 64, height: 64, borderRadius: "50%", background: C.bg, display: "grid", placeItems: "center" }}>{icon}</span>
        <h1 style={{ margin: "16px 0 6px", fontSize: 21, fontWeight: 800, color: C.head, letterSpacing: -0.3 }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: "21px" }}>{body}</p>
      </div>
      <div style={{ flexShrink: 0, padding: "10px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </Screen>
  );
}

export function GuestMismatch() {
  const go = useGo();
  const [asked, setAsked] = useState(false);
  return (
    <Notice
      testid="guest-mismatch"
      icon={<PhoneCall size={26} color={C.sub} />}
      title="This invite is for another number"
      body={<>Kashyap invited <b style={{ color: C.head }}>{priya.masked}</b>. You logged in with <b style={{ color: C.head }}>+91 99876 54321</b>.</>}
    >
      <button onClick={() => go("g-login")} style={btn("solid")}>Log in with that number</button>
      <button onClick={() => setAsked(true)} style={btn("quiet")}>
        {asked ? <><Check size={16} color={C.sText} /> Asked. We'll tell you when Kashyap adds you</> : "Ask Kashyap to add this number"}
      </button>
      <button onClick={() => go()} style={{ border: "none", background: "none", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: C.sub, cursor: "pointer", padding: 6 }}>Go to my plans</button>
    </Notice>
  );
}

export function GuestGone({ kind = "removed" }) {
  const go = useGo();
  const t = kind === "inactive"
    ? { icon: <Link2Off size={26} color={C.sub} />, title: "This invite is no longer active", body: "Kashyap may have removed the invite, or the trip was closed. Ask Kashyap to send a new one." }
    : { icon: <Lock size={26} color={C.sub} />, title: "You no longer have access to this trip", body: "You left, or Kashyap removed you. Your own plans are still here." };
  return (
    <Notice testid={`guest-${kind}`} icon={t.icon} title={t.title} body={t.body}>
      <button onClick={() => go()} style={btn("solid")}>Go to my plans</button>
      <button onClick={() => go()} style={btn("quiet")}>Plan a trip of my own</button>
    </Notice>
  );
}

// Two invites waiting on one number.
export function GuestTwoInvites() {
  const go = useGo();
  const trips = [
    { who: kashyap, dest: "Bali", line: `${TRIP.nights} nights · ${TRIP.when}`, img: TRIP.img },
    { who: { ...PEOPLE.kashyap, key: "rohan", first: "Rohan", fg: C.b600, bg: C.b100 }, dest: "Vietnam", line: "8 nights · 10 Jan to 18 Jan", img: allItineraries.find((i) => i.id === 10)?.img || TRIP.img },
  ];
  return (
    <Screen testid="guest-two">
      <div style={{ flex: 1, padding: "40px 20px 0" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: C.head, letterSpacing: -0.5 }}>You&apos;ve been invited to 2 trips</h1>
        <p style={{ margin: "0 0 18px", fontSize: 14, color: C.sub }}>Both are in your plans now.</p>
        {trips.map((t) => (
          <button key={t.dest} onClick={() => go("g-trip")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 10, marginBottom: 10, border: `1px solid ${C.div}`, borderRadius: 16, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <span style={{ width: 64, height: 64, borderRadius: 12, background: `${C.bg} url(${t.img}) center/cover`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.head }}>{t.dest}</p>
              <p style={{ margin: "1px 0 4px", fontSize: 12.5, color: C.sub }}>{t.line}</p>
              <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.head }}><Avatar p={t.who} size={18} /> From {t.who.first}</p>
            </div>
            <ArrowRight size={18} color={PINK} />
          </button>
        ))}
      </div>
      <div style={{ flexShrink: 0, padding: "10px 20px 18px" }}>
        <button onClick={() => go("g-plans")} style={btn("solid")}>Go to My Plans <ArrowRight size={17} /></button>
      </div>
    </Screen>
  );
}

export { Faces };
