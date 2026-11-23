import { useState } from "react";
import { UserPlus, Contact, Search, Check, ChevronRight, ChevronDown, MoreHorizontal, Trash2, Link2, X } from "lucide-react";
import { C } from "../../data";
import {
  PINK, WA, TRIP, PEOPLE, Avatar, Faces, StatusChip, WhatsAppGlyph, useGo, Screen, Sheet, IconDisc,
  TripHero, TripInfo, GlanceStub, btn,
} from "./parts";

const { kashyap, priya } = PEOPLE;
const OWN = "9971019664";

// ─── Who is on the trip, at the top of it ───
//
// A slim line under the route. Before anyone is invited it is the quiet way in;
// after, it is the faces of everyone planning, for the owner and the guest.
export function TopStrip({ state, onClick, guest = false }) {
  const base = { marginTop: 12, width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: `1px solid ${C.div}`, borderRadius: 12, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" };
  if (state === "empty") {
    return (
      <button data-testid="strip-invite" onClick={onClick} style={base}>
        <span style={{ display: "inline-flex" }}>
          <Avatar p={kashyap} size={26} ring />
          <span style={{ marginLeft: -8, width: 26, height: 26, borderRadius: "50%", border: `1.5px dashed ${C.inact}`, background: C.white, display: "grid", placeItems: "center" }}><UserPlus size={12} color={C.sub} /></span>
        </span>
        <span style={{ flex: 1, fontSize: 13, color: C.head, fontWeight: 600 }}>Plan this trip with your partner</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: PINK }}>Invite</span>
      </button>
    );
  }
  const faces = guest ? [kashyap, priya] : [kashyap, priya];
  const text = guest ? <>Planning with <b>Kashyap</b></> : state === "invited" ? <><b>Priya</b> invited · not joined yet</> : <>Planning with <b>Priya</b></>;
  return (
    <button data-testid="strip-people" onClick={onClick} style={base}>
      <Faces list={faces} size={26} />
      <span style={{ flex: 1, fontSize: 13, color: C.head }}>{text}</span>
      <ChevronRight size={17} color={C.inact} />
    </button>
  );
}

// ─── The Plan together section, further down the trip ───
export function TogetherCard({ state, onInvite, onOpen, guest = false }) {
  if (state === "empty") {
    return (
      <div style={{ padding: "16px 16px 18px", borderTop: `8px solid ${C.bg}` }}>
        <p style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700, color: C.head }}>Plan together</p>
        <div style={{ border: `1px solid ${C.div}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconDisc><UserPlus size={19} color={PINK} /></IconDisc>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>Plan this trip together</p>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>Invite your partner, family or friends. They can see it and make changes.</p>
            </div>
          </div>
          <button data-testid="together-invite" onClick={onInvite} style={{ ...btn("outline"), height: 44, marginTop: 14, fontSize: 14 }}><UserPlus size={16} /> Invite someone</button>
        </div>
      </div>
    );
  }
  const joined = state === "joined";
  return (
    <div style={{ padding: "16px 16px 18px", borderTop: `8px solid ${C.bg}` }}>
      <p style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700, color: C.head }}>Plan together</p>
      <button data-testid="together-open" onClick={onOpen} style={{ width: "100%", border: `1px solid ${C.div}`, borderRadius: 16, padding: 14, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Faces list={[kashyap, priya]} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head }}>{guest ? "Kashyap and you" : joined ? "You and Priya" : "Priya is invited"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{guest ? "You joined today, 3:58 pm" : joined ? "Latest: V3 by Priya · Today, 4:12 pm" : "Not joined yet · sent today, 2:14 pm"}</p>
          </div>
          <ChevronRight size={18} color={C.inact} />
        </div>
      </button>
    </div>
  );
}

// ─── The owner's trip screen ───
export function OwnerTrip({ state = "empty", sheet = null, banner = false, version = "V2", versionLine, footer, total = TRIP.total }) {
  const go = useGo();
  const [joinedNote, setJoinedNote] = useState(banner);
  return (
    <Screen testid={`owner-trip-${state}`}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <TripHero onBack={() => go()} version={version} />
        {joinedNote && (
          <div data-testid="joined-banner" style={{ margin: "12px 16px 0", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12, border: `1px solid ${C.sBorder}`, background: C.white }}>
            <Avatar p={priya} size={30} dot="joined" />
            <p style={{ margin: 0, flex: 1, fontSize: 13, color: C.head, lineHeight: "18px" }}><b>Priya joined.</b> You're planning this together now.</p>
            <button onClick={() => setJoinedNote(false)} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}><X size={16} color={C.sub} /></button>
          </div>
        )}
        <TripInfo versionLine={versionLine} strip={<TopStrip state={state} onClick={() => go(state === "empty" ? "add" : state === "joined" ? "people-joined" : "people")} />} />
        <GlanceStub />
        <TogetherCard state={state} onInvite={() => go("add")} onOpen={() => go(state === "joined" ? "people-joined" : "people")} />
        <div style={{ height: 90 }} />
      </div>
      {footer || (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, padding: "10px 16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 11.5, color: C.sub }}>Total for 2</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.head }}>{total}</p>
          </div>
          <span style={{ ...btn("solid"), width: "auto", padding: "0 20px", height: 46, fontSize: 14 }}>Review &amp; Pay</span>
        </div>
      )}
      {sheet}
    </Screen>
  );
}

// ─── Add someone ───
const fieldWrap = (on, bad) => ({ display: "flex", alignItems: "center", border: `1.5px solid ${bad ? "#F04438" : on ? PINK : C.div}`, borderRadius: 12, background: C.white, overflow: "hidden" });
const label = { display: "block", fontSize: 12.5, fontWeight: 700, color: C.head, margin: "0 0 6px" };

export function AddSheet({ initial = {}, taken = [] }) {
  const go = useGo();
  const [name, setName] = useState(initial.name || "");
  const [num, setNum] = useState(initial.num || "");
  const digits = num.replace(/\D/g, "").slice(-10);
  const full = digits.length === 10;
  const error = !num ? null
    : digits === OWN ? "That's your number. Add someone else's."
      : taken.includes(digits) ? "Priya is already on this trip."
        : num.replace(/\D/g, "").length >= 10 && !full ? "Enter a 10-digit mobile number."
          : null;
  const ok = name.trim() && full && !error;
  const first = name.trim().split(" ")[0] || "them";
  return (
    <Sheet testid="add-sheet" title="Invite someone to plan" sub="They can see this trip, change it and save their own versions." onClose={() => go("trip")}>
      <button data-testid="pick-contacts" onClick={() => go("contacts")} style={{ ...btn("quiet"), height: 46, marginTop: 16, fontSize: 14 }}>
        <Contact size={17} color={PINK} /> Pick from contacts
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
        <span style={{ flex: 1, height: 1, background: C.div }} />
        <span style={{ fontSize: 11.5, color: C.inact, fontWeight: 600 }}>OR TYPE THEIR DETAILS</span>
        <span style={{ flex: 1, height: 1, background: C.div }} />
      </div>
      <label style={label}>Name</label>
      <div style={fieldWrap(!!name.trim(), false)}>
        <input data-testid="add-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name" style={{ flex: 1, border: "none", outline: "none", padding: "13px 14px", fontSize: 15, fontFamily: "inherit", color: C.head, background: "transparent" }} />
      </div>
      <label style={{ ...label, marginTop: 14 }}>Mobile number</label>
      <div style={fieldWrap(full && !error, !!error)}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 10px 0 12px", height: 48, borderRight: `1px solid ${C.div}`, fontSize: 14, fontWeight: 600, color: C.head }}>🇮🇳 +91 <ChevronDown size={14} color={C.sub} /></span>
        <input data-testid="add-number" type="tel" inputMode="tel" value={num} onChange={(e) => setNum(e.target.value)} placeholder="98765 43210" style={{ flex: 1, border: "none", outline: "none", padding: "13px 12px", fontSize: 15, fontFamily: "inherit", color: C.head, background: "transparent", minWidth: 0 }} />
      </div>
      {error && <p data-testid="add-error" style={{ margin: "6px 2px 0", fontSize: 12.5, color: "#D92D20" }}>{error}</p>}
      <p style={{ margin: "14px 2px 0", display: "flex", gap: 7, fontSize: 12, color: C.sub, lineHeight: "17px" }}>
        <WhatsAppGlyph size={15} color={WA.green} />
        We'll send {name.trim() ? first : "them"} an invite on WhatsApp. They log in with this number to join.
      </p>
      <button data-testid="add-invite" disabled={!ok} onClick={() => go("sent")} style={{ ...btn("solid"), marginTop: 16, opacity: ok ? 1 : 0.4, boxShadow: ok ? btn("solid").boxShadow : "none", cursor: ok ? "pointer" : "default" }}>
        Send invite
      </button>
    </Sheet>
  );
}

// ─── Contacts ───
const CONTACTS = [
  { name: "Ananya Iyer", tels: ["+91 98765 12345"] },
  { name: "Arjun Rao", tels: ["+91 97411 22334"] },
  { name: "Karan Patel", tels: ["+91 90040 55667"] },
  { name: "Neha Gupta", tels: ["+91 98330 99881"] },
  { name: "Priya Sharma", tels: ["+91 98200 11223"] },
  { name: "Rohan Mehta", tels: ["+91 99876 54321", "+91 22 4000 1234"], kinds: ["Mobile", "Work"] },
];

export function ContactsSheet({ open: openFirst = null }) {
  const go = useGo();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(openFirst);
  const list = CONTACTS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const pick = () => go("add-filled");
  return (
    <Sheet testid="contacts-sheet" title="Pick from contacts" onClose={() => go("add")} tall>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 12, padding: "0 12px", height: 44 }}>
        <Search size={16} color={C.sub} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", color: C.head }} />
      </div>
      <div style={{ marginTop: 8 }}>
        {list.map((c) => {
          const many = c.tels.length > 1;
          const isOpen = open === c.name;
          const p = { key: c.name, first: c.name, fg: C.sub, bg: C.bg };
          return (
            <div key={c.name} style={{ borderBottom: `1px solid ${C.div}` }}>
              <button data-testid={`contact-${c.name.split(" ")[0].toLowerCase()}`} onClick={() => (many ? setOpen(isOpen ? null : c.name) : pick())} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 0", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <Avatar p={p} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: C.head }}>{c.name}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 12.5, color: C.sub }}>{many ? `${c.tels.length} numbers` : c.tels[0]}</p>
                </div>
                {many ? <ChevronDown size={18} color={C.inact} style={{ transform: isOpen ? "rotate(180deg)" : "none" }} /> : <ChevronRight size={18} color={C.inact} />}
              </button>
              {many && isOpen && (
                <div style={{ padding: "0 0 12px 50px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: C.sub }}>Which number should we invite?</p>
                  {c.tels.map((t, k) => (
                    <button key={t} onClick={pick} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", marginBottom: 6, border: `1px solid ${C.div}`, borderRadius: 10, background: C.white, cursor: "pointer", fontFamily: "inherit" }}>
                      <span style={{ fontSize: 13.5, color: C.head, fontWeight: 600 }}>{t}</span>
                      <span style={{ fontSize: 12, color: C.sub }}>{c.kinds?.[k]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ margin: "12px 2px 0", fontSize: 11.5, color: C.inact, lineHeight: "16px" }}>We only use the contact you pick. Your other contacts stay on your phone.</p>
    </Sheet>
  );
}

// ─── Invite sent ───
export function SentSheet() {
  const go = useGo();
  const [copied, setCopied] = useState(false);
  return (
    <Sheet testid="sent-sheet" onClose={() => go("invited")}>
      <div style={{ textAlign: "center", padding: "4px 4px 0" }}>
        <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: "50%", background: C.sBg }}><Check size={26} color={C.sText} strokeWidth={3} /></span>
        <h3 style={{ margin: "12px 0 4px", fontSize: 19, fontWeight: 800, color: C.head }}>Invite sent to Priya</h3>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: "19px" }}>We sent it on WhatsApp to {priya.tel}. You'll hear from us when Priya joins.</p>
      </div>
      <div style={{ marginTop: 18, padding: 14, border: `1px solid ${C.div}`, borderRadius: 16 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>Send it yourself too</p>
        <p style={{ margin: "3px 0 12px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>A message from you gets opened sooner. We'll fill it in, you just tap send.</p>
        <button data-testid="self-send" onClick={() => go("wa-self")} style={{ ...btn("wa"), height: 46, fontSize: 14 }}><WhatsAppGlyph size={18} /> Send from your WhatsApp</button>
        <button onClick={() => setCopied(true)} style={{ width: "100%", marginTop: 8, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.sub, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 6 }}>
          {copied ? <><Check size={14} color={C.sText} /> Link copied</> : <><Link2 size={14} /> Copy invite link</>}
        </button>
      </div>
      <button data-testid="sent-done" onClick={() => go("invited")} style={{ ...btn("quiet"), marginTop: 12 }}>Done</button>
    </Sheet>
  );
}

function PersonRow({ p, you, chip, line, line2, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.div}` }}>
      <Avatar p={p} size={42} dot={chip === "joined" ? "joined" : chip === "invited" ? "invited" : undefined} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{you ? "You" : p.name}</span>
          <StatusChip kind={chip} />
        </p>
        {line && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{line}</p>}
        {line2 && <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.inact }}>{line2}</p>}
      </div>
      {actions}
    </div>
  );
}

const roundBtn = (bg, bd) => ({ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${bd}`, background: bg, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 });

export function PeopleSheet({ joined = false, menu: menuFirst = false }) {
  const go = useGo();
  const [menu, setMenu] = useState(menuFirst);
  return (
    <Sheet testid={joined ? "people-sheet-joined" : "people-sheet"} title="People on this trip" sub="Everyone here can see and change this trip. 2 of 8 places used." onClose={() => go(joined ? "o-joined" : "invited")} tall>
      <div style={{ marginTop: 8 }}>
        <PersonRow p={kashyap} you chip="owner" line="Made this trip" />
        <div style={{ position: "relative" }}>
          <PersonRow
            p={priya}
            chip={joined ? "joined" : "invited"}
            line={priya.tel}
            line2={joined ? "Joined today, 3:58 pm" : "Sent today, 2:14 pm by 30 Sundays"}
            actions={
              <div style={{ display: "flex", gap: 8 }}>
                {!joined && <button data-testid="row-whatsapp" onClick={() => go("wa-self")} aria-label="Send on your WhatsApp" style={roundBtn("#F0FBF4", "#BBE9CB")}><WhatsAppGlyph size={17} color={WA.green} /></button>}
                <button data-testid="row-more" onClick={() => setMenu(!menu)} aria-label="More" style={roundBtn(C.white, C.div)}><MoreHorizontal size={17} color={C.sub} /></button>
              </div>
            }
          />
          {menu && (
            <div data-testid="row-menu" style={{ position: "absolute", right: 0, top: 54, zIndex: 5, width: 196, background: C.white, borderRadius: 14, boxShadow: "0 12px 32px rgba(16,24,40,0.18)", border: `1px solid ${C.div}`, padding: 6 }}>
              {[
                { icon: <Trash2 size={16} color="#D92D20" />, label: "Remove from trip", go: joined ? "remove-joined" : "remove", red: true },
              ].map((m) => (
                <button key={m.label} onClick={() => go(m.go)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", border: "none", background: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: m.red ? "#D92D20" : C.head, textAlign: "left" }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <button data-testid="add-someone" onClick={() => go("add")} style={{ ...btn("outline"), height: 46, marginTop: 16, fontSize: 14 }}><UserPlus size={16} /> Add someone</button>
      <p style={{ margin: "12px 2px 0", fontSize: 12, color: C.sub, lineHeight: "17px" }}>Wrong number, or no reply? Remove them and invite again.</p>
    </Sheet>
  );
}

// ─── Remove ───
export function RemoveDialog({ joined = false }) {
  const go = useGo();
  const back = joined ? "people-joined" : "people";
  return (
    <div data-testid="remove-dialog" style={{ position: "absolute", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={() => go(back)} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.5)" }} />
      <div style={{ position: "relative", width: "100%", background: C.white, borderRadius: 20, padding: "22px 20px 18px", textAlign: "center" }}>
        <Avatar p={priya} size={52} />
        <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 800, color: C.head }}>Remove Priya?</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>
          {joined ? "Priya won't see this trip any more. Versions Priya saved stay, with Priya's name." : "The invite link stops working. You can invite Priya again later."}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={() => go(back)} style={{ ...btn("quiet"), height: 46, fontSize: 14 }}>Cancel</button>
          <button data-testid="remove-confirm" onClick={() => go("trip")} style={{ ...btn("solid"), height: 46, fontSize: 14, background: "#D92D20", boxShadow: "none" }}>Remove</button>
        </div>
      </div>
    </div>
  );
}
