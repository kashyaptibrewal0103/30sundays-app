import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gift, Check, Clock, CalendarX, Wallet as WalletIcon, ChevronRight, MessageCircle,
} from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import {
  CARD_MIN, CARD_MAX, GIFT_TERMS_FULL, FAQS, REDEEM_WAYS, inr, claimUrl, getOccasion,
} from "../data/giftData";
import {
  Screen, Body, TopBar, Primary, Sheet, Accordion, EmptyState,
  CopyRow, SectionBar, FooterLinks, Toast, PAD,
} from "../components/Gift/GiftUI";
import { W } from "../components/Gift/WalletUI";
import GiftCardArt from "../components/Gift/GiftCardArt";

// Whether the gift was actually used. Redeemed means the amount is sitting in
// the recipient's credit wallet, so the code has stopped working. Anything else
// is simply not redeemed; whether the buyer has passed the link on is something
// we cannot see, so we do not pretend to.
const REDEEMED = { label: "Redeemed", color: W.green600, bg: W.green50, border: W.green200, icon: Check };
const WAITING = { label: "Not redeemed", color: W.grey600, bg: W.grey50, border: W.grey300, icon: Clock };
const LAPSED = { label: "Expired", color: W.red600, bg: W.red50, border: W.red200, icon: CalendarX };
const stateOf = (card) => {
  if (card.status === "claimed") return REDEEMED;
  if (card.expiresAt && card.expiresAt < Date.now()) return LAPSED;
  return WAITING;
};
const daysLeftOf = (card) => (card.expiresAt ? Math.ceil((card.expiresAt - Date.now()) / 86400000) : null);

const when = (t) => {
  if (!t) return "";
  const days = Math.floor((Date.now() - t) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const on = (t) => (t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function GiftCards() {
  const navigate = useNavigate();
  const { cards } = useGifting();
  const [open, setOpen] = useState(null);
  const [sub, setSub] = useState(null);
  const [toast, setToast] = useState(null);

  const back = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/account");
  };

  return (
    <Screen>
      <TopBar title="Gift cards" onBack={back} />
      <Body>
        {/* Hero: the card does the selling, so it gets the space. */}
        <div style={{ padding: `16px ${PAD}px 0` }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
            color: C.p600, margin: "0 0 6px",
          }}>Better than an envelope</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Give a holiday, not a hint
          </h2>
          <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 16px", lineHeight: "19px" }}>
            It becomes travel credit they can put against any 30 Sundays trip.
          </p>
          <GiftCardArt artId="villa" occasion="wedding" amount={11000}
            toName="Ishaan and Tara" fromName="you" size="lg" />
          <div style={{ marginTop: 16 }}>
            <Primary onClick={() => navigate("/gift-cards/buy")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Gift size={16} /> Buy a gift card
              </span>
            </Primary>
          </div>
          <p style={{ fontSize: 11.5, color: C.inact, margin: "10px 0 0", textAlign: "center" }}>
            {inr(CARD_MIN)} to {inr(CARD_MAX)} · six designs · sent on WhatsApp
          </p>
        </div>

        <SectionBar />

        {/* Cards this account has bought */}
        <div style={{ padding: `0 ${PAD}px` }}>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.head, margin: "0 0 12px", letterSpacing: "-0.2px" }}>
            Cards you have sent
          </p>
          {cards.length === 0 ? (
            <EmptyState icon={Gift} title="Nothing sent yet"
              desc="Every card you buy shows here, with whether it has been used." />
          ) : (
            <div style={{ border: `1px solid ${C.div}`, borderRadius: 12, overflow: "hidden" }}>
              {cards.map((card, i) => (
                <SentCardRow key={card.id} card={card} first={i === 0} onClick={() => setOpen(card)} />
              ))}
            </div>
          )}
        </div>

        <SectionBar />

        {/* Someone sent you one */}
        <div style={{ padding: `0 ${PAD}px` }}>
          <p style={{ fontSize: 15.5, fontWeight: 700, color: C.head, margin: "0 0 4px", letterSpacing: "-0.2px" }}>
            Got one yourself?
          </p>
          <p style={{ fontSize: 13, color: C.sub, margin: "0 0 12px", lineHeight: "18px" }}>
            Two ways in, and both end with the money in your credit wallet.
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
          <button onClick={() => navigate("/wallet")} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 15px",
            borderRadius: 12, border: `1px solid ${C.div}`, background: C.white, cursor: "pointer",
            fontFamily: "inherit", textAlign: "left",
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: 9, background: C.p100, flexShrink: 0,
              display: "grid", placeItems: "center",
            }}><WalletIcon size={17} color={C.p600} /></span>
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: C.head }}>Add a gift card</span>
            <ChevronRight size={17} color={C.inact} />
          </button>
        </div>

        <div style={{ height: 22 }} />
        <FooterLinks links={[
          ["Gift card terms", () => setSub("terms")],
          ["FAQs", () => setSub("faqs")],
        ]} />
      </Body>

      {open && (
        <CardDetailSheet card={open} onClose={() => setOpen(null)}
          onCopied={(what) => setToast(`${what} copied`)} />
      )}
      {sub === "terms" && <TermsScreen title="Gift card terms" items={GIFT_TERMS_FULL} onClose={() => setSub(null)} />}
      {sub === "faqs" && <TermsScreen title="FAQs" items={FAQS} onClose={() => setSub(null)} />}
      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </Screen>
  );
}

function SentCardRow({ card, first, onClick }) {
  const st = stateOf(card);
  const occ = getOccasion(card.occasion);
  const Icon = st.icon;
  const left = daysLeftOf(card);
  const claimed = card.status === "claimed";

  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 13px",
      background: C.white, border: "none", borderTop: first ? "none" : `1px solid ${C.div}`,
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <div style={{ width: 74, flexShrink: 0 }}>
        <GiftCardArt artId={card.artId} occasion={card.occasion} amount={card.amount} size="sm" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.2px" }}>
          {inr(card.amount)}
        </p>
        <p style={{
          fontSize: 12.5, color: C.sub, margin: "2px 0 0",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{occ.label} · {card.toName}</p>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4, marginTop: 7,
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase",
          color: st.color, background: st.bg, border: `1px solid ${st.border}`,
          padding: "3px 8px", borderRadius: 999,
        }}>
          <Icon size={10} strokeWidth={2.6} /> {st.label}
        </span>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <p style={{
          fontSize: 11.5, margin: 0,
          color: !claimed && left !== null && left > 0 && left <= 30 ? W.red600 : C.inact,
          fontWeight: !claimed && left !== null && left > 0 && left <= 30 ? 700 : 400,
        }}>
          {claimed ? when(card.claimedAt)
            : left === null ? when(card.sentAt)
            : left <= 0 ? on(card.expiresAt)
            : `${left} days left`}
        </p>
        <ChevronRight size={16} color={C.icon} style={{ marginTop: 6 }} />
      </div>
    </button>
  );
}

function CardDetailSheet({ card, onClose, onCopied }) {
  const st = stateOf(card);
  const claimed = card.status === "claimed";
  const left = daysLeftOf(card);
  const lapsed = !claimed && left !== null && left <= 0;
  const url = claimUrl(card.code);

  const share = () => {
    const text = `${card.fromName} sent you a 30 Sundays gift card worth ${inr(card.amount)}.\n\nAdd it here: ${url}\nGift code ${card.code} · PIN ${card.pin}`;
    try { navigator.clipboard?.writeText(text); } catch { /* noop */ }
    const to = card.toPhone ? `91${card.toPhone}` : "";
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    onCopied("Message");
  };

  return (
    <Sheet
      title={`${inr(card.amount)} gift card`}
      sub={`${st.label} · ${card.status === "with_you" ? "link with you" : `for ${card.toName}`}`}
      onClose={onClose}
      footer={claimed || lapsed ? null : (
        <button onClick={share} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "12px 0", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
          border: "1.5px solid #A7D8BC", background: C.white,
          color: "#1FA855", fontSize: 14.5, fontWeight: 700,
        }}>
          <MessageCircle size={16} /> Share on WhatsApp
        </button>
      )}
    >
      <GiftCardArt artId={card.artId} occasion={card.occasion} amount={card.amount}
        toName={card.toName} fromName={card.fromName} size="md" />

      {card.message && (
        <p style={{
          fontSize: 13.5, color: C.sub, margin: "14px 0 0", lineHeight: "20px", fontStyle: "italic",
        }}>&ldquo;{card.message}&rdquo;</p>
      )}

      <div style={{ marginTop: 16, border: `1px solid ${C.div}`, borderRadius: 12, overflow: "hidden" }}>
        {claimed ? (
          <>
            <PlainRow label="Added to their wallet" value={when(card.claimedAt)} first />
            <PlainRow label="Sent" value={when(card.sentAt)} />
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.div}`, background: W.green50 }}>
              <p style={{ fontSize: 12.5, color: W.green600, margin: 0, lineHeight: "18px", fontWeight: 600 }}>
                The code and PIN have stopped working, so they are hidden.
              </p>
            </div>
          </>
        ) : lapsed ? (
          <>
            <PlainRow label="Bought" value={when(card.sentAt)} first />
            <PlainRow label="Expired" value={on(card.expiresAt)} />
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.div}`, background: W.red50 }}>
              <p style={{ fontSize: 12.5, color: W.red600, margin: 0, lineHeight: "18px", fontWeight: 600 }}>
                Nobody claimed this within 365 days, so the code has lapsed.
              </p>
            </div>
          </>
        ) : (
          <>
            <CopyRow label="Link" value={url} mono={false} last="first" onCopied={() => onCopied("Link")} />
            <CopyRow label="Gift code" value={card.code} onCopied={() => onCopied("Gift code")} />
            <CopyRow label="PIN" value={card.pin} onCopied={() => onCopied("PIN")} />
            <PlainRow label="Must be claimed by" value={`${on(card.expiresAt)} · ${left} days left`} />
            {!!card.toPhone && <PlainRow label="Sent to" value={`+91 ${card.toPhone.slice(0, 5)} ${card.toPhone.slice(5)}`} />}
            {!!card.toEmail && <PlainRow label="Also emailed to" value={card.toEmail} />}
          </>
        )}
      </div>
    </Sheet>
  );
}

function PlainRow({ label, value, first }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
      padding: "12px 14px", borderTop: first ? "none" : `1px solid ${C.div}`,
    }}>
      <span style={{ fontSize: 13, color: C.sub }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.head }}>{value}</span>
    </div>
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
