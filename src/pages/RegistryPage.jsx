import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Share2, Eye, EyeOff, Target, Lock, Check, Clock, Users, AlertTriangle,
  Copy, MessageCircle, Smartphone, X as XIcon, Wallet as WalletIcon, RefreshCw, Ban,
} from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import {
  inr, getOccasion, CONTRIB_TIERS, REGISTRY_CAP, REGISTRY_TERMS_TOP,
  REGISTRY_TERMS_TOP_COUPLE, MY, track,
} from "../data/giftData";
import {
  Screen, Body, TopBar, Primary, Secondary, Sheet, Field, Input, Textarea,
  AmountTiles, Checkbox, ChoiceCard, SectionLabel, PAD, usePayment, Toast,
} from "../components/Gift/GiftUI";
import { W, APP_BG } from "../components/Gift/WalletUI";

// One page, four points of view. The organiser and the couple see individual
// amounts. Contributors and anyone on the public link see names and the total
// only, so nobody feels they have to match what someone else gave.
const ROLES = [
  ["organiser", "Organiser"],
  ["couple", "Couple"],
  ["contributor", "Contributor"],
  ["public", "Public link"],
];

const when = (t) => {
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(t).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export default function RegistryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    findRegistry, registryTotal, daysLeft, revealRegistry, closeRegistry,
    declineRegistry, updateRegistry,
  } = useGifting();

  const r = findRegistry(id);
  const [role, setRole] = useState(() => {
    if (!r) return "public";
    if (r.organiserName === MY.name) return "organiser";
    if (r.couplePhone === MY.phone) return "couple";
    return "contributor";
  });
  const [overlay, setOverlay] = useState(null);   // "contribute" | "claim"
  const [sheet, setSheet] = useState(null);       // "share" | "close" | "decline" | "target"
  const [toast, setToast] = useState(null);

  const back = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/registry");
  };

  if (!r) {
    return (
      <Screen style={APP_BG}>
        <TopBar title="Gift registry" onBack={back} transparent />
        <Body>
          <div style={{ padding: "60px 28px", textAlign: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>This registry is not here</h3>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 20px", lineHeight: "19px" }}>
The link may be wrong, or it has been taken down.
            </p>
            <Secondary onClick={() => navigate("/registry")}>Back to registries</Secondary>
          </div>
        </Body>
      </Screen>
    );
  }

  const occ = getOccasion(r.occasion);
  const total = registryTotal(r);
  const pct = r.target ? Math.min(100, Math.round((total / r.target) * 100)) : null;
  const left = daysLeft(r);
  const expired = left === 0 && !r.claimed;
  const seesAmounts = role === "organiser" || role === "couple";
  const isOrganiser = role === "organiser";
  const isCouple = role === "couple";
  const hidden = !r.revealed && (isCouple);           // the surprise is being kept from them
  const open = r.status === "open" && !expired;
  const canContribute = open && !hidden && total < REGISTRY_CAP;
  // A registry the couple made themselves credits as it goes, so the rules
  // about claiming and pending pools do not apply to it.
  const rules = r.creatorType === "couple" ? REGISTRY_TERMS_TOP_COUPLE : REGISTRY_TERMS_TOP;

  // The couple has not been told yet, so their view is the one thing we do not show.
  if (hidden) {
    return (
      <Screen style={APP_BG}>
        <TopBar title="Gift registry" onBack={back} right={<RoleToggle value={role} onChange={setRole} transparent />} />
        <Body>
          <div style={{ padding: "60px 28px", textAlign: "center" }}>
            <span style={{ width: 56, height: 56, borderRadius: "50%", background: C.bg, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
              <EyeOff size={25} color={C.sub} />
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Nothing to see yet</h3>
            <p style={{ fontSize: 13.5, color: W.grey600, margin: 0, lineHeight: "19px" }}>
              Being kept a surprise until the organiser reveals it.
            </p>
          </div>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen
      style={APP_BG}
      footer={
        canContribute && !isCouple ? (
          <Primary onClick={() => setOverlay("contribute")}>Give towards their trip</Primary>
        ) : isCouple && !r.claimed && r.status !== "declined" && !expired ? (
          <Primary onClick={() => setOverlay("claim")}>Claim {inr(total)}</Primary>
        ) : null
      }
    >
      <TopBar
        title={r.coupleNames}
        sub={`${occ.emoji} ${occ.label}${r.destination ? ` · ${r.destination}` : ""}`}
        onBack={back}
        right={<RoleToggle value={role} onChange={setRole} transparent />}
      />
      <Body>
        {/* State banners */}
        {r.status === "declined" && (
          <Banner tone="bad" icon={Ban} title="This registry was declined"
            desc="The couple took it down. Support is contacting everyone who gave." />
        )}
        {expired && r.status !== "declined" && (
          <Banner tone="bad" icon={Clock} title="This pool has lapsed"
            desc="Held for a year, then gone. Contributions are not refunded." />
        )}
        {r.status === "closed" && !expired && (
          <Banner tone="warn" icon={Lock} title="Closed to new gifts"
            desc="No new gifts. What is in it still goes to the couple." />
        )}
        {r.claimed && (
          <Banner tone="good" icon={Check} title="Claimed"
            desc={`${r.coupleNames} have this as travel credit in their wallet.`} />
        )}
        {isOrganiser && !r.revealed && (
          <Banner tone="warn" icon={EyeOff} title="They do not know yet"
            desc="Nothing reaches them until you reveal it." />
        )}

        {/* The ask */}
        <div style={{ padding: `18px ${PAD}px 0` }}>
          <div style={{ borderRadius: 16, border: `1px solid ${C.p300}`, background: C.white, padding: "18px 16px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase", color: C.p600, margin: "0 0 8px" }}>
              {r.creatorType === "couple" ? "Set up by them" : `Set up by ${r.organiserName}, their ${String(r.organiserRelation || "friend").toLowerCase()}`}
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 4px", letterSpacing: "-0.5px", lineHeight: "28px" }}>
              Help {r.coupleNames} get there
            </h2>
            <div style={{ height: 16 }} />

            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: C.head, letterSpacing: "-1px" }}>{inr(total)}</span>
              {r.target && <span style={{ fontSize: 14, color: C.sub }}>of {inr(r.target)}</span>}
            </div>

            {pct !== null && (
              <>
                <div style={{ height: 7, borderRadius: 4, background: C.div, marginTop: 10, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: C.p600, borderRadius: 4, transition: "width 0.4s" }} />
                </div>
                <p style={{ fontSize: 12, color: W.grey600, margin: "8px 0 0" }}>{pct}% of the target</p>
              </>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: pct !== null ? 10 : 12 }}>
              <Users size={14} color={C.sub} />
              <span style={{ fontSize: 12.5, color: C.sub }}>
                {r.contributions.length} {r.contributions.length === 1 ? "person has" : "people have"} given
              </span>
            </div>
          </div>
        </div>

        {/* Organiser controls */}
        {isOrganiser && r.status === "open" && !expired && (
          <div style={{ padding: `14px ${PAD}px 0` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 }}>
              <MiniAction icon={Share2} label="Share" onClick={() => setSheet("share")} />
              {!r.revealed && (
                <MiniAction icon={Eye} label="Reveal to them" onClick={() => { revealRegistry(r.id); setToast("They have been told"); }} />
              )}
              <MiniAction icon={Target} label="Change target" onClick={() => setSheet("target")} />
              <MiniAction icon={Copy} label="Copy link" onClick={() => setToast("Link copied")} />
              <MiniAction icon={Lock} label="Close registry" onClick={() => setSheet("close")} />
            </div>
            <div style={{
              display: "flex", gap: 10, padding: "12px 14px", borderRadius: 13,
              background: C.white, border: `1px solid ${C.div}`, marginTop: 10,
            }}>
              <Lock size={15} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: W.grey600, margin: 0, lineHeight: "17px" }}>
                Only {r.coupleNames} can claim this. You cannot spend it or change the number it sits against.
              </p>
            </div>
          </div>
        )}

        {/* Couple controls */}
        {isCouple && !r.claimed && r.status !== "declined" && !expired && (
          <div style={{ padding: `14px ${PAD}px 0` }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
              borderRadius: 13, background: C.white, border: `1px solid ${C.div}`,
            }}>
              <Clock size={16} color={C.sub} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 12.5, color: C.sub, margin: 0, flex: 1, lineHeight: "17px" }}>
{left} days left to claim. After that it lapses.
              </p>
            </div>
            <button onClick={() => setSheet("decline")} style={{
              width: "100%", marginTop: 9, padding: "11px 0", background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: C.sub, textDecoration: "underline",
            }}>
              I did not ask for this. Take it down
            </button>
          </div>
        )}

        {/* Contributors */}
        <div style={{ padding: `24px ${PAD}px 0` }}>
          <SectionLabel>Who has given</SectionLabel>
          {r.contributions.length === 0 ? (
            <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "24px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 13.5, color: C.sub, margin: 0 }}>Nobody yet. Be the first.</p>
            </div>
          ) : (
            <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, overflow: "hidden" }}>
              {[...r.contributions].reverse().map((c, i, arr) => (
                <div key={c.id} style={{
                  display: "flex", gap: 12, padding: "13px 15px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.div}` : "none",
                }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: c.anon ? C.bg : C.p100, border: `1px solid ${c.anon ? C.div : C.p300}`,
                    display: "grid", placeItems: "center",
                    fontSize: 13, fontWeight: 700, color: c.anon ? C.sub : C.p600,
                  }}>
                    {c.anon ? "?" : c.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0, flex: 1 }}>
                        {c.anon ? "Someone" : c.name}
                      </p>
                      {seesAmounts
                        ? <span style={{ fontSize: 14, fontWeight: 700, color: C.head }}>{inr(c.amount)}</span>
                        : <span style={{ fontSize: 11.5, color: C.inact }}>{when(c.at)}</span>}
                    </div>
                    {c.message && (
                      <p style={{ fontSize: 12.5, color: C.sub, margin: "3px 0 0", lineHeight: "18px" }}>{c.message}</p>
                    )}
                    {seesAmounts && <p style={{ fontSize: 11.5, color: C.inact, margin: "3px 0 0" }}>{when(c.at)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!seesAmounts && r.contributions.length > 0 && (
            <p style={{ fontSize: 11.5, color: C.inact, margin: "10px 2px 0", lineHeight: "16px" }}>
              Only {r.coupleNames} and the organiser see individual amounts.
            </p>
          )}
        </div>

        {/* Rules */}
        <div style={{ padding: `24px ${PAD}px 40px` }}>
          <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
            {rules.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < rules.length - 1 ? 9 : 0 }}>
                <Check size={14} color={C.p600} style={{ flexShrink: 0, marginTop: 3 }} />
                <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </Body>

      {overlay === "contribute" && (
        <Contribute registry={r} onClose={() => setOverlay(null)} onDone={() => { setOverlay(null); setToast("Thank you. It is in the pool."); }} />
      )}
      {overlay === "claim" && (
        <Claim registry={r} total={total} onClose={() => setOverlay(null)} />
      )}

      {sheet === "share" && <ShareSheet registry={r} onClose={() => setSheet(null)} onCopy={() => { setSheet(null); setToast("Link copied"); }} />}
      {sheet === "target" && (
        <TargetSheet registry={r} onClose={() => setSheet(null)} onSave={(v) => { updateRegistry(r.id, { target: v }); setSheet(null); setToast(v ? `Target set to ${inr(v)}` : "Target removed"); }} />
      )}
      {sheet === "close" && (
        <ConfirmSheet
          title="Close this registry?"
          desc="No new gifts can come in. The pool is untouched and still goes to the couple. This cannot be undone."
          confirmLabel="Close it"
          onClose={() => setSheet(null)}
          onConfirm={() => { closeRegistry(r.id); setSheet(null); setToast("Registry closed"); }}
        />
      )}
      {sheet === "decline" && (
        <ConfirmSheet
          title="Take this down?"
          desc="It stops accepting gifts and comes off your account. Support contacts everyone who gave. This cannot be undone."
          confirmLabel="Take it down"
          onClose={() => setSheet(null)}
          onConfirm={() => { declineRegistry(r.id); setSheet(null); setToast("Registry taken down"); }}
        />
      )}

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </Screen>
  );
}

/* ── Chrome bits ── */

function RoleToggle({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const label = ROLES.find(([id]) => id === value)?.[1] || "View";
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        flexShrink: 0, padding: "6px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
        border: `1px solid ${C.div}`, background: C.bg, fontSize: 11.5, fontWeight: 700, color: C.sub,
      }}>
        {label}
      </button>
      {open && (
        <Sheet title="View this page as" sub="Prototype only. The real page picks this from who is logged in." onClose={() => setOpen(false)}>
          <div style={{ paddingBottom: 10 }}>
            {ROLES.map(([id, name]) => (
              <ChoiceCard
                key={id} selected={value === id}
                onClick={() => { onChange(id); setOpen(false); }}
                title={name}
                desc={
                  id === "organiser" ? "Sees every amount. Can share, reveal, set a target and close."
                  : id === "couple" ? "Sees every amount. Claims the pool and spends it."
                  : id === "contributor" ? "Sees names and the total. Not individual amounts."
                  : "Anyone with the link. Same as a contributor, no account needed."
                }
              />
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

function Banner({ tone, icon: Icon, title, desc }) {
  const t = tone === "bad" ? { bg: "#FEF3F2", border: "#FDA29B", color: "#B42318" }
    : tone === "warn" ? { bg: "#FFFAEB", border: "#F0C97A", color: "#B54708" }
    : { bg: "#ECFDF3", border: "#C0E5D5", color: "#027A48" };
  return (
    <div style={{ padding: `14px ${PAD}px 0` }}>
      <div style={{ display: "flex", gap: 10, padding: "13px 14px", borderRadius: 13, background: t.bg, border: `1px solid ${t.border}` }}>
        <Icon size={17} color={t.color} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: t.color, margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12.5, color: t.color, margin: "3px 0 0", lineHeight: "18px", opacity: 0.9 }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}

function MiniAction({ icon: Icon, label, onClick, filled, style }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
      padding: "12px 0", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
      border: filled ? "none" : `1px solid ${C.div}`,
      background: filled ? C.p600 : C.white, color: filled ? "#fff" : C.head,
      fontSize: 13.5, fontWeight: 700, ...style,
    }}>
      <Icon size={15} /> {label}
    </button>
  );
}

/* ── Contribute ── */
function Contribute({ registry, onClose, onDone }) {
  const { contribute, registryTotal, findRegistry } = useGifting();
  const { paying, pay } = usePayment();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(CONTRIB_TIERS[1]);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anon, setAnon] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);

  const value = custom !== "" ? Number(custom) : amount;
  const roomLeft = REGISTRY_CAP - registryTotal(registry);
  const amountErr = !value ? null
    : value < 500 ? "The smallest gift is ₹500"
    : value > roomLeft ? `Only ${inr(roomLeft)} of room left in this pool`
    : null;
  const nameErr = touched && !anon && !name.trim() ? "Add your name, or choose to give without it" : null;

  const submit = () => {
    pay(() => {
      contribute(registry.id, { name: name.trim(), anon, amount: value, message });
      setDone(true);
    });
  };

  if (done) {
    const total = registryTotal(findRegistry(registry.id) || registry);
    return (
      <Screen overlay={200} style={APP_BG} footer={
        <>
          <Primary onClick={onDone}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Share2 size={16} /> Ask others to chip in
            </span>
          </Primary>
          <div style={{ height: 9 }} />
          <Secondary onClick={onDone}>Done</Secondary>
        </>
      }>
        <TopBar title="Thank you" transparent />
        <Body>
          <div style={{ padding: `40px ${PAD}px 0`, textAlign: "center" }}>
            <span style={{
              width: 58, height: 58, borderRadius: "50%", background: "#ECFDF3",
              border: "1px solid #C0E5D5", display: "grid", placeItems: "center", margin: "0 auto 16px",
            }}>
              <Check size={27} color="#027A48" strokeWidth={3} />
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              {inr(value)} added
            </h2>
            <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "20px" }}>
{registry.coupleNames} are now at {inr(total)}.
            </p>
          </div>

          <div style={{ padding: `24px ${PAD}px 0` }}>
            <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
              <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>
Your name {anon ? "stays off" : "appears on"} the page. Only {registry.coupleNames} and {registry.organiserName} see the amount.
              </p>
            </div>
          </div>
          <div style={{ height: 40 }} />
        </Body>
      </Screen>
    );
  }

  if (failed) {
    return (
      <Screen overlay={200} style={APP_BG}>
        <TopBar title="Payment failed" onBack={onClose} transparent />
        <Body>
          <div style={{ padding: `40px ${PAD}px`, textAlign: "center" }}>
            <span style={{ width: 58, height: 58, borderRadius: "50%", background: "#FEF3F2", border: "1px solid #FDA29B", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <XIcon size={26} color="#D92D20" />
            </span>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>That did not go through</h3>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 22px", lineHeight: "19px" }}>
              Nothing has been charged and nothing has been added to the pool. Give it another go.
            </p>
            <Primary onClick={() => setFailed(false)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><RefreshCw size={16} /> Try again</span>
            </Primary>
          </div>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen
      overlay={200}
      style={APP_BG}
      footer={
        step === 1
          ? <Primary disabled={!value || !!amountErr} onClick={() => setStep(2)}>Continue</Primary>
          : (
            <>
              <Primary disabled={paying || !agreed} onClick={() => { if (!name.trim() && !anon) { setTouched(true); return; } submit(); }}>
                {paying ? "Processing..." : `Pay ${inr(value)}`}
              </Primary>
              <button onClick={() => setFailed(true)} style={{
                display: "block", width: "100%", marginTop: 11, background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, color: C.inact, textDecoration: "underline",
              }}>
                Prototype only: see what a failed payment looks like
              </button>
            </>
          )
      }
    >
      <TopBar
        title={`Give to ${registry.coupleNames}`}
        sub={step === 1 ? "How much" : "Your details"}
        onBack={step === 1 ? onClose : () => setStep(1)}
      />
      <Body>
        {step === 1 ? (
          <div style={{ padding: `20px ${PAD}px 30px` }}>
            <AmountTiles presets={CONTRIB_TIERS} value={custom === "" ? amount : null} onPick={(p) => { setAmount(p); setCustom(""); }} format={inr} />
            <div style={{ marginTop: 14 }}>
              <Field label="Or another amount" error={amountErr}>
                <Input inputMode="numeric" placeholder="₹" value={custom} error={!!amountErr}
                  onChange={(e) => { setCustom(e.target.value.replace(/\D/g, "")); setAmount(null); }} />
              </Field>
            </div>
            <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
              <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>
No account needed. Every gift joins one pool.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: `20px ${PAD}px 30px` }}>
            <Field label="Your name" error={nameErr} hint="This appears on the page next to your message.">
              <Input placeholder="Meera Nair" value={name} error={!!nameErr} disabled={anon}
                onChange={(e) => setName(e.target.value)} style={anon ? { background: C.bg, color: C.inact } : undefined} />
            </Field>

            <div style={{ marginTop: -6, marginBottom: 16 }}>
              <Checkbox checked={anon} onChange={setAnon}>
                Give without showing my name. Your gift still counts towards the total.
              </Checkbox>
            </div>

            <Field label="Your message" optional>
              <Textarea placeholder="Say something nice" value={message} maxLength={160} onChange={(e) => setMessage(e.target.value)} />
            </Field>

            <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: C.sub, flex: 1 }}>Your gift</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.head }}>{inr(value)}</span>
              </div>
              <div style={{ height: 1, background: C.div, marginBottom: 12 }} />
              <Checkbox checked={agreed} onChange={setAgreed}>
                I understand this becomes travel credit for {registry.coupleNames} and is not refundable.
              </Checkbox>
            </div>

            {[["upi", "UPI", "Pay by any UPI app"], ["card", "Card", "Credit or debit card"]].map(([id, l, dsc], i) => (
              <ChoiceCard key={id} selected={i === 0} onClick={() => {}} title={l} desc={dsc} />
            ))}
          </div>
        )}
      </Body>
    </Screen>
  );
}

/* ── Claim ── */
function Claim({ registry, total, onClose }) {
  const navigate = useNavigate();
  const { claimRegistry, credit } = useGifting();
  const [stage, setStage] = useState("otp");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState(null);

  const verify = () => {
    if (otp !== "1234" && otp !== "0000") { setErr("That code is wrong. Try 1234 in this prototype."); return; }
    const res = claimRegistry(registry.id);
    if (res.ok) { track("gift_registry_claimed", { amount: res.amount }); setStage("done"); }
    else setErr("This pool is not available any more.");
  };

  if (stage === "done") {
    return (
      <Screen overlay={200} style={APP_BG} footer={
        <>
          <Primary onClick={() => navigate("/wallet")}>See it in your wallet</Primary>
          <div style={{ height: 9 }} />
          <Secondary onClick={onClose}>Back to the registry</Secondary>
        </>
      }>
        <TopBar title="Claimed" transparent />
        <Body>
          <div style={{ padding: `40px ${PAD}px 0`, textAlign: "center" }}>
            <span style={{
              width: 58, height: 58, borderRadius: "50%", background: "#ECFDF3",
              border: "1px solid #C0E5D5", display: "grid", placeItems: "center", margin: "0 auto 16px",
            }}>
              <Check size={27} color="#027A48" strokeWidth={3} />
            </span>
            <h2 style={{ fontSize: 23, fontWeight: 700, color: C.head, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              {inr(total)} is yours
            </h2>
            <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "20px" }}>
              From {registry.contributions.length} people. It is travel credit now, it never expires, and
              {" "}{MY.partner} can see and spend it too.
            </p>
          </div>

          <div style={{ padding: `24px ${PAD}px 0` }}>
            <div style={{ borderRadius: 16, border: `1px solid ${C.p300}`, background: C.white, padding: "18px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: C.sub, margin: 0 }}>Your travel credit</p>
              <p style={{ fontSize: 30, fontWeight: 800, color: C.head, margin: "4px 0 0", letterSpacing: "-0.8px" }}>{inr(credit)}</p>
            </div>
          </div>
          <div style={{ height: 40 }} />
        </Body>
      </Screen>
    );
  }

  return (
    <Screen overlay={200} style={APP_BG} footer={<Primary disabled={otp.length !== 4} onClick={verify}>Verify and claim</Primary>}>
      <TopBar title="Claim the pool" onBack={onClose} transparent />
      <Body>
        <div style={{ padding: `26px ${PAD}px 0` }}>
          <span style={{ width: 46, height: 46, borderRadius: 12, background: C.p100, display: "grid", placeItems: "center", marginBottom: 14 }}>
            <Smartphone size={21} color={C.p600} />
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: "0 0 6px", letterSpacing: "-0.4px" }}>
            One code and it is yours
          </h2>
          <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 20px", lineHeight: "19px" }}>
Sent to +91 {registry.couplePhone.slice(0, 5)} {registry.couplePhone.slice(5)}, the number {registry.organiserName} used.
          </p>

          <div style={{ borderRadius: 14, border: `1px solid ${C.p300}`, background: C.white, padding: "14px 15px", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <WalletIcon size={17} color={C.p600} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>Landing in your wallet</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.head, margin: "2px 0 0" }}>{inr(total)}</p>
              </div>
            </div>
          </div>

          <Field label="4 digit code" error={err}>
            <Input inputMode="numeric" maxLength={4} placeholder="••••" value={otp} error={!!err}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErr(null); }}
              style={{ letterSpacing: "10px", fontWeight: 700, fontSize: 20, textAlign: "center" }} />
          </Field>
          <p style={{ fontSize: 12, color: C.inact, margin: "4px 0 0" }}>Prototype: the code is 1234.</p>
        </div>
      </Body>
    </Screen>
  );
}

/* ── Sheets ── */
function ShareSheet({ registry, onClose, onCopy }) {
  const link = `30sundays.club/r/${registry.id.replace(/^reg_?/, "")}`;
  return (
    <Sheet
      title="Share the registry"
      sub="No account, no app."
      onClose={onClose}
      footer={
        <>
          <Primary onClick={onCopy}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <MessageCircle size={16} /> Share on WhatsApp
            </span>
          </Primary>
          <div style={{ height: 9 }} />
          <Secondary onClick={onCopy}>Copy the link</Secondary>
        </>
      }
    >
      <div style={{ paddingBottom: 6 }}>
        <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px", marginBottom: 14 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: C.p600, margin: 0, wordBreak: "break-all" }}>{link}</p>
        </div>
        <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: C.sub, margin: "0 0 8px" }}>
            Suggested message
          </p>
          <p style={{ fontSize: 13.5, color: C.head, margin: 0, lineHeight: "20px" }}>
            {registry.coupleNames} are off on their {getOccasion(registry.occasion).label.toLowerCase()} trip
            {registry.destination ? ` to ${registry.destination}` : ""}. Instead of a gift, we are all putting
            something towards it. Any amount helps: {link}
          </p>
        </div>
      </div>
    </Sheet>
  );
}

function TargetSheet({ registry, onClose, onSave }) {
  const [v, setV] = useState(registry.target ? String(registry.target) : "");
  const num = v === "" ? null : Number(v);
  const err = num && num > REGISTRY_CAP ? `A registry can hold up to ${inr(REGISTRY_CAP)}` : null;
  return (
    <Sheet
      title="Change the target"
      sub="A progress marker only."
      onClose={onClose}
      footer={<Primary disabled={!!err} onClick={() => onSave(num)}>{num ? "Save target" : "Remove target"}</Primary>}
    >
      <div style={{ paddingBottom: 6 }}>
        <Field label="Target amount" error={err} optional>
          <Input inputMode="numeric" placeholder="₹" value={v} error={!!err} onChange={(e) => setV(e.target.value.replace(/\D/g, ""))} />
        </Field>
      </div>
    </Sheet>
  );
}

function ConfirmSheet({ title, desc, confirmLabel, onClose, onConfirm }) {
  return (
    <Sheet
      title={title} onClose={onClose}
      footer={
        <>
          <Secondary danger onClick={onConfirm}>{confirmLabel}</Secondary>
          <div style={{ height: 9 }} />
          <Secondary onClick={onClose}>Keep it as it is</Secondary>
        </>
      }
    >
      <div style={{ paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 10, padding: "13px 14px", borderRadius: 13, background: "#FFFAEB", border: "1px solid #F0C97A" }}>
          <AlertTriangle size={17} color="#B54708" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: "#B54708", margin: 0, lineHeight: "18px" }}>{desc}</p>
        </div>
      </div>
    </Sheet>
  );
}
