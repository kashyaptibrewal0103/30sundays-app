import { useState, useEffect } from "react";
import { UserPlus, Contact, Search, Check, ChevronRight, ChevronDown, MoreHorizontal, Trash2, Link2, X, UserCheck } from "lucide-react";
import { C } from "../data";
import { useDeals } from "../data/deals";
import { Avatar, Faces, StatusChip, WhatsAppGlyph, Sheet, IconDisc, btn, WA } from "../pages/together/parts";

// ─── Plan together, on the trip screen ───
//
// The owner of a saved trip invites people to plan it with them. Who is on
// the trip is kept on the deal (`people`), so it survives a reload and every
// screen of the trip reads the same list.
//
// The screen gets three pieces from one hook, all opening the same sheets:
//   strip    - the faces under the route, at the top of the trip
//   section  - the Plan together section further down, as before
//   overlays - the sheets and the toast
//
// Kept small on purpose: invite, send it yourself on WhatsApp, remove. No
// reminders, no editing a number (remove and invite again), no activity log;
// who made which version is said on the versions themselves.
//
// In the app a co-traveller joins by logging in with the invited number. The
// prototype has nobody on the other end, so the menu on an invited row has a
// prototype-only "Mark as joined" that plays that moment.

const OWN_NUMBER = "9971019664"; // the logged-in number; the prototype has no account, so it uses the demo login's
const MAX_PEOPLE = 8;            // owner included
const TINTS = [
  { fg: C.purple, bg: C.pur100 },
  { fg: C.b600, bg: C.b100 },
  { fg: C.sText, bg: C.sBg },
  { fg: C.wText, bg: C.wBg },
];

const CONTACTS = [
  { name: "Ananya Iyer", tels: ["+91 98765 12345"] },
  { name: "Arjun Rao", tels: ["+91 97411 22334"] },
  { name: "Karan Patel", tels: ["+91 90040 55667"] },
  { name: "Neha Gupta", tels: ["+91 98330 99881"] },
  { name: "Priya Sharma", tels: ["+91 98200 11223"] },
  { name: "Rohan Mehta", tels: ["+91 99876 54321", "+91 22 4000 1234"], kinds: ["Mobile", "Work"] },
];

const digitsOf = (raw) => {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  return d;
};
const display = (n) => `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
const firstOf = (name) => (name || "").trim().split(/\s+/)[0] || "Guest";
const newId = () => `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

// Times as people say them: "Today, 2:14 pm", "Yesterday, 11:05 am", "18 Nov, 9:40 pm".
export function when(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?([ap])\.?m\.?/i, " $1m").toLowerCase();
  const day = new Date(); day.setHours(0, 0, 0, 0);
  const diff = Math.floor((day.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

export const faceOf = (p) => ({ key: p.id, first: p.first, ...TINTS[(p.tint || 0) % TINTS.length] });

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const on = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return m;
}
const frameStyle = (isMobile) => (isMobile
  ? { position: "fixed", inset: 0 }
  : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 390, height: 844, borderRadius: 44, overflow: "hidden" });

// The native contact picker where the phone has one, else null.
async function pickNative() {
  if (typeof navigator !== "undefined" && navigator.contacts?.select) {
    try {
      const sel = await navigator.contacts.select(["name", "tel"], { multiple: false });
      return sel.map((c) => ({ name: c.name?.[0] || "", tel: c.tel?.[0] || "" }));
    } catch { return []; }
  }
  return null;
}

export function usePlanTogether({ dealId, dest, enabled, leadName }) {
  const { getDeal, patchDeal } = useDeals();
  const isMobile = useIsMobile();
  const deal = dealId ? getDeal(dealId) : null;
  const people = deal?.people || [];
  const [view, setView] = useState(null);        // add | contacts | sent | people | remove
  const [target, setTarget] = useState(null);    // the person a sheet is about
  const [draft, setDraft] = useState({ name: "", num: "" });
  const [menuFor, setMenuFor] = useState(null);
  const [openContact, setOpenContact] = useState(null);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!enabled || !deal) return { strip: null, section: null, overlays: null };

  const sender = firstOf(leadName || "") === "Guest" ? null : firstOf(leadName);
  const owner = { key: "owner", first: sender || "You", fg: C.p600, bg: C.p100 };
  const joined = people.filter((p) => p.status === "joined");
  const person = people.find((p) => p.id === target) || null;
  const full = people.length >= MAX_PEOPLE - 1;
  const savePeople = (fn) => patchDeal(dealId, (d) => ({ people: fn(d.people || []) }));

  const linkFor = (p) => `https://30sundays.club/j/${p.id.slice(-6)}`;
  const msgSelf = (p) => `Hi ${p.first} 🌴\n${sender ? `It's ${sender}. ` : ""}I've started planning our ${dest} trip on 30 Sundays and I'd love to plan it with you!\nDownload the app: ${linkFor(p)}\nLog in with this number to see the plan so far, and let's finalise the rest together.`;
  const openWhatsApp = (p) => window.open(`https://wa.me/91${p.national}?text=${encodeURIComponent(msgSelf(p))}`, "_blank");

  const close = () => { setView(null); setMenuFor(null); };
  const openAdd = () => { setDraft({ name: "", num: "" }); setTarget(null); setView("add"); };
  const openEntry = () => (people.length ? setView("people") : openAdd());

  // ─── The add sheet's checks ───
  const num = digitsOf(draft.num);
  const fullNum = num.length === 10;
  const clash = people.find((p) => p.national === num);
  const error = !draft.num ? null
    : num === OWN_NUMBER ? "That's your number. Add someone else's."
      : clash ? `${clash.first} is already on this trip.`
        : num.length >= 10 && !fullNum ? "Enter a 10-digit mobile number."
          : null;
  const canSend = draft.name.trim() && fullNum && !error && !full;

  const send = () => {
    if (!canSend) return;
    const p = { id: newId(), name: draft.name.trim(), first: firstOf(draft.name), national: num, display: display(num), status: "invited", sentAt: Date.now(), tint: people.length, announced: false };
    savePeople((list) => [...list, p]);
    setTarget(p.id);
    setView("sent");
  };

  const contacts = async () => {
    const native = await pickNative();
    if (native === null) { setQ(""); setOpenContact(null); setView("contacts"); return; }
    if (native.length) setDraft({ name: native[0].name, num: native[0].tel });
  };
  const pickContact = (name, tel) => { setDraft({ name, num: tel }); setView("add"); };

  const remove = (p) => {
    savePeople((list) => list.filter((x) => x.id !== p.id));
    setView(people.length > 1 ? "people" : null);
    setToast(`${p.first} removed`);
  };
  // Prototype only: what happens when they log in with the invited number.
  const markJoined = (p) => {
    savePeople((list) => list.map((x) => (x.id === p.id ? { ...x, status: "joined", joinedAt: Date.now(), announced: false } : x)));
    setMenuFor(null);
    setToast(`${p.first} joined your ${dest} trip`);
  };
  const announce = () => patchDeal(dealId, (d) => ({ people: (d.people || []).map((p) => ({ ...p, announced: true })) }));

  // ─── The faces under the route ───
  const unannounced = joined.filter((p) => !p.announced);
  const stripText = joined.length
    ? <>Planning with <b>{joined.map((p) => p.first).join(", ")}</b></>
    : people.length === 1 ? <><b>{people[0].first}</b> invited · not joined yet</> : <><b>{people.length} people</b> invited · not joined yet</>;
  const stripBase = { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", border: `1px solid ${C.div}`, borderRadius: 12, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" };
  const strip = (
    <div style={{ padding: "0 16px 12px" }}>
      {unannounced.length > 0 && (
        <div data-testid="together-joined-banner" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.sBorder}`, background: C.white }}>
          <Avatar p={faceOf(unannounced[0])} size={30} dot="joined" />
          <p style={{ margin: 0, flex: 1, fontSize: 13, color: C.head, lineHeight: "18px" }}><b>{unannounced.map((p) => p.first).join(" and ")} joined.</b> You&apos;re planning this together now.</p>
          <button onClick={announce} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}><X size={16} color={C.sub} /></button>
        </div>
      )}
      {people.length === 0 ? (
        <button data-testid="together-strip-invite" onClick={openAdd} style={stripBase}>
          <span style={{ display: "inline-flex" }}>
            <Avatar p={owner} size={26} ring />
            <span style={{ marginLeft: -8, width: 26, height: 26, borderRadius: "50%", border: `1.5px dashed ${C.inact}`, background: C.white, display: "grid", placeItems: "center" }}><UserPlus size={12} color={C.sub} /></span>
          </span>
          <span style={{ flex: 1, fontSize: 13, color: C.head, fontWeight: 600 }}>Plan this trip with your partner</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.p600 }}>Invite</span>
        </button>
      ) : (
        <button data-testid="together-strip" onClick={() => setView("people")} style={stripBase}>
          <Faces list={[owner, ...people.slice(0, 3).map(faceOf)]} size={26} />
          <span style={{ flex: 1, fontSize: 13, color: C.head }}>{stripText}</span>
          <ChevronRight size={17} color={C.inact} />
        </button>
      )}
    </div>
  );

  // ─── The section further down ───
  const last = people[people.length - 1];
  const section = (
    <div style={{ padding: "0 16px" }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.head, marginBottom: 12 }}>Plan together</p>
      {people.length === 0 ? (
        <div style={{ border: `1px solid ${C.div}`, borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <IconDisc><UserPlus size={19} color={C.p600} /></IconDisc>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>Plan this trip together</p>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>Invite your partner, family or friends. They can see it and make changes.</p>
            </div>
          </div>
          <button data-testid="together-invite" onClick={openAdd} style={{ ...btn("outline"), height: 44, marginTop: 14, fontSize: 14 }}><UserPlus size={16} /> Invite someone</button>
        </div>
      ) : (
        <button data-testid="together-open" onClick={openEntry} style={{ width: "100%", border: `1px solid ${C.div}`, borderRadius: 16, padding: 14, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
          <Faces list={[owner, ...people.slice(0, 3).map(faceOf)]} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head }}>
              {joined.length ? `You and ${joined.map((p) => p.first).join(", ")}` : people.length === 1 ? `${people[0].first} is invited` : `${people.length} people invited`}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {joined.length
                ? `${people.length - joined.length ? `${people.length - joined.length} not joined yet · ` : ""}Tap to see who is on this trip`
                : `Not joined yet · sent ${when(last.sentAt).toLowerCase()}`}
            </p>
          </div>
          <ChevronRight size={18} color={C.inact} />
        </button>
      )}
    </div>
  );

  // ─── The sheets ───
  const label = { display: "block", fontSize: 12.5, fontWeight: 700, color: C.head, margin: "0 0 6px" };
  const field = (on, bad) => ({ display: "flex", alignItems: "center", border: `1.5px solid ${bad ? "#F04438" : on ? C.p600 : C.div}`, borderRadius: 12, background: C.white, overflow: "hidden" });
  const roundBtn = (bg, bd) => ({ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${bd}`, background: bg, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 });

  const addSheet = (
    <Sheet testid="together-add" title="Invite someone to plan" sub="They can see this trip, change it and save their own versions." onClose={() => (people.length ? setView("people") : close())}>
      {full && <p style={{ margin: "12px 0 0", fontSize: 13, color: "#D92D20" }}>A trip can have up to {MAX_PEOPLE} people. Remove someone to add more.</p>}
      <button data-testid="together-pick-contacts" onClick={contacts} style={{ ...btn("quiet"), height: 46, marginTop: 16, fontSize: 14 }}><Contact size={17} color={C.p600} /> Pick from contacts</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
        <span style={{ flex: 1, height: 1, background: C.div }} />
        <span style={{ fontSize: 11.5, color: C.inact, fontWeight: 600 }}>OR TYPE THEIR DETAILS</span>
        <span style={{ flex: 1, height: 1, background: C.div }} />
      </div>
      <label style={label}>Name</label>
      <div style={field(!!draft.name.trim(), false)}>
        <input data-testid="together-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Their name" style={{ flex: 1, border: "none", outline: "none", padding: "13px 14px", fontSize: 15, fontFamily: "inherit", color: C.head, background: "transparent" }} />
      </div>
      <label style={{ ...label, marginTop: 14 }}>Mobile number</label>
      <div style={field(fullNum && !error, !!error)}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 10px 0 12px", height: 48, borderRight: `1px solid ${C.div}`, fontSize: 14, fontWeight: 600, color: C.head }}>🇮🇳 +91 <ChevronDown size={14} color={C.sub} /></span>
        <input data-testid="together-number" type="tel" inputMode="tel" value={draft.num} onChange={(e) => setDraft({ ...draft, num: e.target.value })} placeholder="98765 43210" style={{ flex: 1, border: "none", outline: "none", padding: "13px 12px", fontSize: 15, fontFamily: "inherit", color: C.head, background: "transparent", minWidth: 0 }} />
      </div>
      {error && <p data-testid="together-error" style={{ margin: "6px 2px 0", fontSize: 12.5, color: "#D92D20" }}>{error}</p>}
      <p style={{ margin: "14px 2px 0", display: "flex", gap: 7, fontSize: 12, color: C.sub, lineHeight: "17px" }}>
        <WhatsAppGlyph size={15} color={WA.green} />
        We&apos;ll send {draft.name.trim() ? firstOf(draft.name) : "them"} an invite on WhatsApp. They log in with this number to join.
      </p>
      <button data-testid="together-send" disabled={!canSend} onClick={send} style={{ ...btn("solid"), marginTop: 16, opacity: canSend ? 1 : 0.4, boxShadow: canSend ? btn("solid").boxShadow : "none", cursor: canSend ? "pointer" : "default" }}>
        Send invite
      </button>
    </Sheet>
  );

  const list = CONTACTS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.tels.some((t) => t.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "#")));
  const contactsSheet = (
    <Sheet testid="together-contacts" title="Pick from contacts" onClose={() => setView("add")} tall>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 12, padding: "0 12px", height: 44 }}>
        <Search size={16} color={C.sub} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or number" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, fontFamily: "inherit", color: C.head }} />
      </div>
      <div style={{ marginTop: 8 }}>
        {list.map((c) => {
          const many = c.tels.length > 1;
          const isOpen = openContact === c.name;
          return (
            <div key={c.name} style={{ borderBottom: `1px solid ${C.div}` }}>
              <button data-testid={`together-contact-${firstOf(c.name).toLowerCase()}`} onClick={() => (many ? setOpenContact(isOpen ? null : c.name) : pickContact(c.name, c.tels[0]))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 0", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <Avatar p={{ key: c.name, first: c.name, fg: C.sub, bg: C.bg }} size={38} />
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
                    <button key={t} onClick={() => pickContact(c.name, t)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", marginBottom: 6, border: `1px solid ${C.div}`, borderRadius: 10, background: C.white, cursor: "pointer", fontFamily: "inherit" }}>
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

  const sentSheet = person && (
    <Sheet testid="together-sent" onClose={() => { setCopied(false); close(); }}>
      <div style={{ textAlign: "center", padding: "4px 4px 0" }}>
        <span style={{ display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: "50%", background: C.sBg }}><Check size={26} color={C.sText} strokeWidth={3} /></span>
        <h3 style={{ margin: "12px 0 4px", fontSize: 19, fontWeight: 800, color: C.head }}>Invite sent to {person.first}</h3>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: "19px" }}>We sent it on WhatsApp to {person.display}. You&apos;ll hear from us when {person.first} joins.</p>
      </div>
      <div style={{ marginTop: 18, padding: 14, border: `1px solid ${C.div}`, borderRadius: 16 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.head }}>Send it yourself too</p>
        <p style={{ margin: "3px 0 12px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>A message from you gets opened sooner. We&apos;ll fill it in, you just tap send.</p>
        <button data-testid="together-self-send" onClick={() => openWhatsApp(person)} style={{ ...btn("wa"), height: 46, fontSize: 14 }}><WhatsAppGlyph size={18} /> Send from your WhatsApp</button>
        <button onClick={() => { try { navigator.clipboard?.writeText(linkFor(person)); } catch { /* no clipboard */ } setCopied(true); }} style={{ width: "100%", marginTop: 8, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.sub, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 6 }}>
          {copied ? <><Check size={14} color={C.sText} /> Link copied</> : <><Link2 size={14} /> Copy invite link</>}
        </button>
      </div>
      <button data-testid="together-sent-done" onClick={() => { setCopied(false); close(); }} style={{ ...btn("quiet"), marginTop: 12 }}>Done</button>
    </Sheet>
  );

  const peopleSheet = (
    <Sheet testid="together-people" title="People on this trip" sub={`Everyone here can see and change this trip. ${people.length + 1} of ${MAX_PEOPLE} places used.`} onClose={close} tall>
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.div}` }}>
          <Avatar p={owner} size={42} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 14.5, fontWeight: 700, color: C.head }}>You</span><StatusChip kind="owner" /></p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>Made this trip</p>
          </div>
        </div>
        {people.map((p) => {
          const on = p.status === "joined";
          return (
            <div key={p.id} style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${C.div}` }}>
                <Avatar p={faceOf(p)} size={42} dot={on ? "joined" : "invited"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                    <StatusChip kind={on ? "joined" : "invited"} />
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{p.display}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.inact }}>{on ? `Joined ${when(p.joinedAt).toLowerCase()}` : `Sent ${when(p.sentAt).toLowerCase()} by 30 Sundays`}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!on && <button data-testid="together-row-whatsapp" onClick={() => openWhatsApp(p)} aria-label="Send on your WhatsApp" style={roundBtn("#F0FBF4", "#BBE9CB")}><WhatsAppGlyph size={17} color={WA.green} /></button>}
                  <button data-testid="together-row-more" onClick={() => setMenuFor(menuFor === p.id ? null : p.id)} aria-label="More" style={roundBtn(C.white, C.div)}><MoreHorizontal size={17} color={C.sub} /></button>
                </div>
              </div>
              {menuFor === p.id && (
                <div data-testid="together-row-menu" style={{ position: "absolute", right: 0, top: 54, zIndex: 5, width: 200, background: C.white, borderRadius: 14, boxShadow: "0 12px 32px rgba(16,24,40,0.18)", border: `1px solid ${C.div}`, padding: 6 }}>
                  <button data-testid="together-remove-open" onClick={() => { setTarget(p.id); setMenuFor(null); setView("remove"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px", border: "none", background: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: "#D92D20", textAlign: "left" }}>
                    <Trash2 size={16} color="#D92D20" /> Remove from trip
                  </button>
                  {!on && (
                    <button data-testid="together-mark-joined" onClick={() => markJoined(p)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", marginTop: 4, border: `1px dashed ${C.icon}`, background: C.white, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: C.sub, textAlign: "left" }}>
                      <UserCheck size={15} color={C.sub} /> Prototype: mark as joined
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button data-testid="together-add-someone" disabled={full} onClick={openAdd} style={{ ...btn("outline"), height: 46, marginTop: 16, fontSize: 14, opacity: full ? 0.45 : 1 }}><UserPlus size={16} /> {full ? "This trip is full" : "Add someone"}</button>
      <p style={{ margin: "12px 2px 0", fontSize: 12, color: C.sub, lineHeight: "17px" }}>Wrong number, or no reply? Remove them and invite again.</p>
    </Sheet>
  );

  const removeDialog = person && (
    <div data-testid="together-remove" style={{ position: "absolute", inset: 0, zIndex: 60, display: "grid", placeItems: "center", padding: 24 }}>
      <div onClick={() => setView("people")} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.5)" }} />
      <div style={{ position: "relative", width: "100%", background: C.white, borderRadius: 20, padding: "22px 20px 18px", textAlign: "center" }}>
        <Avatar p={faceOf(person)} size={52} />
        <h3 style={{ margin: "12px 0 6px", fontSize: 18, fontWeight: 800, color: C.head }}>Remove {person.first}?</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>
          {person.status === "joined"
            ? `${person.first} won't see this trip any more. Versions ${person.first} saved stay, with ${person.first}'s name.`
            : `The invite link stops working. You can invite ${person.first} again later.`}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={() => setView("people")} style={{ ...btn("quiet"), height: 46, fontSize: 14 }}>Cancel</button>
          <button data-testid="together-remove-confirm" onClick={() => remove(person)} style={{ ...btn("solid"), height: 46, fontSize: 14, background: "#D92D20", boxShadow: "none" }}>Remove</button>
        </div>
      </div>
    </div>
  );

  const sheet = { add: addSheet, contacts: contactsSheet, sent: sentSheet, people: peopleSheet, remove: removeDialog }[view];
  const overlays = (
    <>
      {sheet && <div style={{ ...frameStyle(isMobile), zIndex: 180 }}>{view === "remove" ? <>{peopleSheet}{removeDialog}</> : sheet}</div>}
      {toast && (
        <div data-testid="together-toast" style={{ position: "fixed", left: "50%", bottom: 96, transform: "translateX(-50%)", zIndex: 300, background: C.head, color: "#fff", padding: "12px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.22)", display: "flex", alignItems: "center", gap: 8, maxWidth: "88%" }}>
          <Check size={16} color="#4EAC7E" strokeWidth={3} /> {toast}
        </div>
      )}
    </>
  );

  return { strip, section, overlays };
}
