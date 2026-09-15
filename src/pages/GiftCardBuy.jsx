import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, Phone, Share2, RefreshCw, X as XIcon, MessageCircle, ChevronRight,
} from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import {
  MY, CARD_ARTS, CARD_PRESETS, CARD_MIN, CARD_MAX, OCCASIONS, getOccasion,
  GIFT_TERMS_TOP, GIFT_TERMS_FULL, REDEEM_WAYS, CARD_VALID_DAYS, inr, claimUrl, track,
} from "../data/giftData";
import {
  Screen, Body, TopBar, Primary, Secondary, StepBar, Field, Input, Textarea,
  AmountTiles, Checkbox, Sheet, Accordion, PayBar, CopyRow, SectionBar, PAD, usePayment,
} from "../components/Gift/GiftUI";
import { W, T } from "../components/Gift/WalletUI";
import GiftCardArt from "../components/Gift/GiftCardArt";

// Two steps. First the card, then who it is for. The person paying keeps the
// card either way; sending it on WhatsApp for them is a box they can tick.

const cleanPhone = (s) => String(s || "").replace(/\D/g, "").slice(0, 10);
const validPhone = (s) => cleanPhone(s).length === 10 && /^[6-9]/.test(cleanPhone(s));
const validEmail = (s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default function GiftCardBuy() {
  const navigate = useNavigate();
  const { buyCard } = useGifting();

  const [step, setStep] = useState(1);
  const [d, setD] = useState({
    occasion: "wedding", artId: getOccasion("wedding").arts[0],
    amount: CARD_PRESETS[1], customAmount: "",
    message: getOccasion("wedding").message,
    toName: "", toPhone: "", toEmail: "", fromName: MY.name, sendNow: false,
  });
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState(null);
  const [pay, setPay] = useState(false);
  const [sub, setSub] = useState(null);

  const set = (patch) => setD(p => ({ ...p, ...patch }));

  const amount = d.customAmount !== "" ? Number(d.customAmount) : d.amount;
  const amountError = useMemo(() => {
    if (!amount) return null;
    if (amount < CARD_MIN) return `Minimum ${inr(CARD_MIN)}`;
    if (amount > CARD_MAX) return `Maximum ${inr(CARD_MAX)}. Over that, use a registry.`;
    return null;
  }, [amount]);

  const ok = step === 1
    ? !!amount && !amountError
    : d.toName.trim() && (!d.sendNow || (validPhone(d.toPhone) && validEmail(d.toEmail)));

  const back = () => {
    if (step === 2) return setStep(1);
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/gift-cards");
  };

  const next = () => {
    setTouched(true);
    if (!ok) return;
    if (step === 1) { track("gift_card_purchase_start", { amount }); setTouched(false); return setStep(2); }
    setPay(true);
  };

  const complete = () => {
    const card = buyCard({
      occasion: d.occasion, artId: d.artId, amount,
      toName: d.toName.trim(), toPhone: d.sendNow ? cleanPhone(d.toPhone) : "",
      toEmail: d.sendNow ? d.toEmail.trim() : "",
      fromName: d.fromName.trim() || MY.name, message: d.message.trim(), sendNow: d.sendNow,
    });
    setPay(false);
    setResult(card);
  };

  if (result) return <Sent card={result} />;

  const card = (
    <GiftCardArt artId={d.artId} occasion={d.occasion} amount={amount}
      toName={d.toName} fromName={d.fromName} size="md" />
  );

  return (
    <Screen>
      <TopBar title="Buy a gift card" onBack={back} />
      <StepBar step={step} total={2} />
      <Body scrollKey={step}>
        {step === 1
          ? <StepCard d={d} set={set} card={card} error={touched || d.customAmount ? amountError : null} />
          : <StepSend d={d} set={set} card={card} amount={amount} touched={touched} onTerms={() => setSub("terms")} />}
      </Body>
      <PayBar
        amount={inr(amount || 0)}
        caption={step === 1 ? "Gift card value" : d.sendNow ? "Sent on WhatsApp when you pay" : "Link comes to you"}
        label={step === 1 ? "Continue" : "Pay now"}
        onClick={next}
      />

      {pay && <PaySheet amount={amount} onClose={() => setPay(false)} onDone={complete} />}
      {sub === "terms" && <TermsScreen title="Gift card terms" items={GIFT_TERMS_FULL} onClose={() => setSub(null)} />}
    </Screen>
  );
}

/* ─────────────────────────── Step 1: the card ─────────────────────────── */

function StepCard({ d, set, card, error }) {
  const occ = getOccasion(d.occasion);
  // The designs that suit the occasion come first, the rest follow.
  const ordered = [...occ.arts, ...CARD_ARTS.map(a => a.id).filter(id => !occ.arts.includes(id))];

  return (
    <div style={{ paddingBottom: 8 }}>
      <div style={{ padding: `14px ${PAD}px 4px` }}>{card}</div>

      <SectionBar margin="18px 0" />

      <Group label="What is the occasion">
        <div className="hs" style={{ display: "flex", gap: 8, padding: `0 ${PAD}px`, marginLeft: -PAD, marginRight: -PAD }}>
          {OCCASIONS.map(o => {
            const on = d.occasion === o.id;
            return (
              <button key={o.id} onClick={() => set({ occasion: o.id, artId: o.arts[0], message: o.message })} style={{
                flexShrink: 0, padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                border: `1px solid ${on ? C.p600 : C.div}`,
                background: on ? C.p600 : C.white, color: on ? "#fff" : C.head,
              }}>{o.emoji} {o.label}</button>
            );
          })}
        </div>
      </Group>

      <SectionBar margin="18px 0" />

      <Group label="Pick a design">
        <div className="hs" style={{ display: "flex", gap: 10, padding: `2px ${PAD}px 2px`, marginLeft: -PAD, marginRight: -PAD }}>
          {ordered.map(id => {
            const a = CARD_ARTS.find(x => x.id === id);
            const on = d.artId === id;
            return (
              <button key={id} onClick={() => set({ artId: id })} style={{
                flexShrink: 0, width: 104, padding: 0, background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}>
                <div style={{
                  position: "relative", width: "100%", aspectRatio: "5 / 3", borderRadius: 10,
                  overflow: "hidden", boxShadow: on ? `0 0 0 2px ${C.p600}` : `0 0 0 1px ${C.div}`,
                }}>
                  <img src={a.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {on && (
                    <span style={{
                      position: "absolute", right: 5, top: 5, width: 17, height: 17, borderRadius: "50%",
                      background: C.p600, display: "grid", placeItems: "center",
                    }}><Check size={11} color="#fff" strokeWidth={3} /></span>
                  )}
                </div>
                <p style={{
                  fontSize: 11.5, fontWeight: on ? 700 : 500, color: on ? C.head : C.sub,
                  margin: "6px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{a.name}</p>
              </button>
            );
          })}
        </div>
      </Group>

      <SectionBar margin="18px 0" />

      <Group label="How much">
        <AmountTiles presets={CARD_PRESETS} value={d.customAmount === "" ? d.amount : null}
          onPick={(v) => set({ amount: v, customAmount: "" })} format={inr} cols={3} />
        <div style={{ marginTop: 10 }}>
          <Input value={d.customAmount} onChange={(e) => set({ customAmount: e.target.value.replace(/\D/g, ""), amount: null })}
            inputMode="numeric" placeholder="Another amount" error={!!error} />
          <p style={{ fontSize: 11.5, color: error ? C.dText : C.inact, margin: "6px 2px 0" }}>
            {error || `${inr(CARD_MIN)} to ${inr(CARD_MAX)}`}
          </p>
        </div>
      </Group>

      <SectionBar margin="18px 0" />

      <Group label="Say something">
        <Textarea value={d.message} onChange={(e) => set({ message: e.target.value })}
          maxLength={140} placeholder="Say something nice" />
        <p style={{ fontSize: 11.5, color: C.inact, margin: "6px 2px 0" }}>{d.message.length}/140</p>
      </Group>
      <div style={{ height: 10 }} />
    </div>
  );
}

/* ─────────────────────────── Step 2: who it is for ─────────────────────────── */

function StepSend({ d, set, card, amount, touched, onTerms }) {
  const nameErr = touched && !d.toName.trim() ? "Add a name" : null;
  const phoneErr = touched && d.sendNow && !validPhone(d.toPhone) ? "10 digit mobile number" : null;
  const emailErr = touched && !validEmail(d.toEmail) ? "Check this address" : null;

  return (
    <div style={{ paddingBottom: 8 }}>
      <div style={{ padding: `14px ${PAD}px 4px` }}>{card}</div>

      <SectionBar margin="18px 0" />

      <Group label="Who is it for">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Their name" error={nameErr}>
            <Input value={d.toName} onChange={(e) => set({ toName: e.target.value })}
              placeholder="Ishaan and Tara" error={!!nameErr} />
          </Field>
          <Field label="From">
            <Input value={d.fromName} onChange={(e) => set({ fromName: e.target.value })} placeholder="Your name" />
          </Field>
        </div>
      </Group>

      <SectionBar margin="18px 0" />

      <div style={{ padding: `0 ${PAD}px` }}>
        {/* The buyer always gets the card. Sending it for them is the extra. */}
        <div style={{
          border: `1px solid ${d.sendNow ? C.p300 : C.div}`, borderRadius: 12, overflow: "hidden",
          background: C.white,
        }}>
          <div style={{ padding: "14px 15px" }}>
            <Checkbox checked={d.sendNow} onChange={(v) => set({ sendNow: v })}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>Send it to them on WhatsApp now</span>
            </Checkbox>
            <p style={{ fontSize: 12.5, color: C.sub, margin: "7px 0 0 32px", lineHeight: "18px" }}>
              {d.sendNow
                ? "Goes out the second the payment clears. It cannot be recalled, so check the number."
                : "Leave this off and the link comes to you, to pass on whenever you like."}
            </p>
          </div>

          {d.sendNow && (
            <div style={{ padding: "0 15px 15px", display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Their mobile number" error={phoneErr}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "0 12px", borderRadius: 10,
                    border: `1px solid ${C.div}`, background: C.bg, fontSize: 14.5, fontWeight: 600, color: C.head,
                  }}>
                    <Phone size={14} color={C.sub} /> +91
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Input value={d.toPhone} onChange={(e) => set({ toPhone: cleanPhone(e.target.value) })}
                      inputMode="numeric" placeholder="98765 43210" error={!!phoneErr} />
                  </div>
                </div>
              </Field>
              <Field label="Email" optional error={emailErr}>
                <Input type="email" value={d.toEmail} onChange={(e) => set({ toEmail: e.target.value })}
                  placeholder="name@email.com" error={!!emailErr} />
              </Field>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          {GIFT_TERMS_TOP.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
              <Check size={14} color={C.p600} style={{ flexShrink: 0, marginTop: 3 }} />
              <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>{t}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: C.sub, margin: "12px 0 0", lineHeight: "18px" }}>
          By paying, you agree to the{" "}
          <button onClick={onTerms} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
            fontSize: 12.5, fontWeight: 700, color: C.p600, textDecoration: "underline",
          }}>gift card terms</button>. {inr(amount || 0)} will be charged now.
        </p>
        <div style={{ height: 14 }} />
      </div>
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <p style={{ fontSize: 15.5, fontWeight: 700, color: C.head, margin: "0 0 12px", letterSpacing: "-0.2px" }}>{label}</p>
      {children}
    </div>
  );
}

/* ─────────────────────────── Payment ─────────────────────────── */

function PaySheet({ amount, onClose, onDone }) {
  const { paying, pay } = usePayment();
  const [method, setMethod] = useState("upi");
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Sheet title="Payment failed" sub="Nothing charged, nothing sent." onClose={onClose}
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Primary onClick={() => setFailed(false)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <RefreshCw size={15} /> Try again
              </span>
            </Primary>
            <Secondary onClick={onClose}>Cancel</Secondary>
          </div>
        }>
        <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
          <span style={{
            width: 52, height: 52, borderRadius: "50%", background: W.red50,
            display: "grid", placeItems: "center", margin: "0 auto 12px",
          }}><XIcon size={24} color={W.red600} /></span>
          <p style={{ ...T.bodyMedium, color: W.grey600 }}>Your bank turned it down. Try another method.</p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title={`Pay ${inr(amount)}`} sub="The card is ready the second this goes through." onClose={onClose}
      footer={
        <div>
          <Primary onClick={() => pay(onDone)} disabled={paying}>
            {paying ? "Processing..." : `Pay ${inr(amount)}`}
          </Primary>
          <button onClick={() => setFailed(true)} style={{
            width: "100%", marginTop: 10, padding: "4px 0", background: "none", border: "none",
            cursor: "pointer", fontFamily: "inherit", fontSize: 12, color: C.inact,
          }}>Prototype: see a failed payment</button>
        </div>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[["upi", "UPI"], ["card", "Card"], ["net", "Net banking"]].map(([id, label]) => {
          const on = method === id;
          return (
            <button key={id} onClick={() => setMethod(id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 15px", borderRadius: 12,
              border: `1px solid ${on ? C.p600 : C.div}`, background: on ? C.p100 : C.white,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                border: `${on ? 5 : 1.5}px solid ${on ? C.p600 : C.icon}`, background: C.white,
              }} />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: C.head }}>{label}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ─────────────────────────── Sent ─────────────────────────── */

function Sent({ card }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const url = claimUrl(card.code);
  const sentToThem = card.status === "sent";

  const share = () => {
    const text = `${card.fromName} sent you a 30 Sundays gift card worth ${inr(card.amount)}.\n\n${card.message}\n\nAdd it here: ${url}\nGift code ${card.code} · PIN ${card.pin}`;
    try { navigator.clipboard?.writeText(text); } catch { /* noop */ }
    const to = card.toPhone ? `91${card.toPhone}` : "";
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setToast("Message copied and WhatsApp opened");
  };

  return (
    <Screen>
      <TopBar title="Gift card ready" onBack={() => navigate("/gift-cards")} />
      <Body>
        <div style={{ padding: `18px ${PAD}px 0`, textAlign: "center" }}>
          <span style={{
            width: 48, height: 48, borderRadius: "50%", background: W.green50,
            display: "grid", placeItems: "center", margin: "0 auto 12px",
          }}><Check size={24} color={W.green600} strokeWidth={2.6} /></span>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.4px" }}>
            {sentToThem ? `On its way to ${card.toName}` : "Yours to hand over"}
          </h2>
          <p style={{ fontSize: 13.5, color: C.sub, margin: "6px 0 0", lineHeight: "19px" }}>
            {sentToThem
              ? `Delivered on WhatsApp${card.toEmail ? " and email" : ""}. Here is a copy for you.`
              : "Share the link whenever you are ready. It works until it is claimed."}
          </p>
        </div>

        <div style={{ padding: `18px ${PAD}px 0` }}>
          <GiftCardArt artId={card.artId} occasion={card.occasion} amount={card.amount}
            toName={card.toName} fromName={card.fromName} size="lg" />
        </div>

        <div style={{ padding: `14px ${PAD}px 0` }}>
          <button onClick={share} style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 15px",
            borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
            border: "1.5px solid #A7D8BC", background: C.white,
            color: "#1FA855", fontSize: 13.5, fontWeight: 700,
          }}>
            <MessageCircle size={15} /> {sentToThem ? "Send it again on WhatsApp" : "Share on WhatsApp"}
          </button>
        </div>

        <SectionBar margin="20px 0" />

        <div style={{ padding: `0 ${PAD}px` }}>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.head, margin: "0 0 12px", letterSpacing: "-0.2px" }}>
            Everything they need
          </p>
          <div style={{ border: `1px solid ${C.div}`, borderRadius: 12, overflow: "hidden" }}>
            <CopyRow label="Link" value={url} mono={false} last="first" onCopied={() => setToast("Link copied")} />
            <CopyRow label="Gift code" value={card.code} onCopied={() => setToast("Gift code copied")} />
            <CopyRow label="PIN" value={card.pin} onCopied={() => setToast("PIN copied")} />
          </div>
        </div>

        <SectionBar margin="20px 0" />

        <div style={{ padding: `0 ${PAD}px` }}>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.head, margin: "0 0 12px", letterSpacing: "-0.2px" }}>
            How they add it
          </p>
          <p style={{ fontSize: 13, color: C.sub, margin: "0 0 14px", lineHeight: "18px" }}>
            They have {CARD_VALID_DAYS} days to claim it. After that the code lapses.
            Once claimed, the credit never expires. We will let you know the moment
            they add it.
          </p>
          {REDEEM_WAYS.map(([title, body], i) => (
            <div key={title} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", background: C.p100, flexShrink: 0,
                display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, color: C.p600,
              }}>{i + 1}</span>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: C.head, margin: 0 }}>{title}</p>
                <p style={{ fontSize: 13, color: C.sub, margin: "2px 0 0", lineHeight: "18px" }}>{body}</p>
              </div>
            </div>
          ))}

          <button onClick={() => navigate(`/gift/${card.code}`)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "13px 15px",
            borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, cursor: "pointer",
            fontFamily: "inherit", textAlign: "left", marginTop: 2,
          }}>
            <Share2 size={16} color={C.p600} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.head }}>See what they see</span>
            <ChevronRight size={16} color={C.inact} />
          </button>
        </div>

        <div style={{ height: 24 }} />
      </Body>

      <div style={{
        flexShrink: 0, borderTop: `1px solid ${C.div}`, background: C.white,
        padding: `12px ${PAD}px calc(14px + env(safe-area-inset-bottom))`,
      }}>
        <Primary onClick={() => navigate("/gift-cards")}>Done</Primary>
      </div>

      {toast && <CopyToast onDone={() => setToast(null)}>{toast}</CopyToast>}
    </Screen>
  );
}

// Sits above the sticky footer, so a confirmation never hides the action.
function CopyToast({ children, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 84, zIndex: 300,
      background: C.head, color: "#fff", borderRadius: 12, padding: "12px 16px",
      fontSize: 13.5, fontWeight: 600, textAlign: "center",
      animation: "toastSlideUp 0.25s ease-out",
    }}>{children}</div>
  );
}

function TermsScreen({ title, items, onClose }) {
  return (
    <Screen overlay>
      <TopBar title={title} onBack={onClose} />
      <Body>
        <div style={{ padding: `16px ${PAD}px 40px` }}>
          <Accordion items={items} />
        </div>
      </Body>
    </Screen>
  );
}
