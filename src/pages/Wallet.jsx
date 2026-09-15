import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet as WalletIcon, Plus, Gift, Megaphone, Palmtree, ChevronRight,
  ArrowUpCircle, ArrowDownCircle, ArrowDownLeft, ArrowUpRight, CalendarX,
  CalendarCheck, Coins, Check, AlertCircle, Lock,
} from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import {
  inr, TOPUP_PRESETS, CREDIT_BENEFITS, CREDIT_TERMS_FULL, GIFT_TERMS_FULL,
  FAQS, STAMP_EARN, codeFromUrl, track,
} from "../data/giftData";
import {
  Screen, Body, TopBar, Primary, Sheet, Field, Input, AmountTiles, Accordion, usePayment,
} from "../components/Gift/GiftUI";
import {
  W, APP_BG, T, StampIcon, DottedCard, WalletHookTag, TileIcon,
  SettingsTile, SettingsSection, InfoList, Divider, Segmented,
} from "../components/Gift/WalletUI";

// The balance card, the hook tag and the ways to earn rows are the live wallet
// from the Flutter app. Credit sits in its own tab beside stamps: same card,
// different currency, never one merged number.

const BENEFIT_ICON = { zap: ArrowUpCircle, layers: WalletIcon, shield: Lock };
const EARN_ICON = { gift: Gift, megaphone: Megaphone, palm: Palmtree };

const ts = (d) => { const v = Date.parse(d); return Number.isNaN(v) ? 0 : v; };

export default function Wallet({ userState, leadData }) {
  const navigate = useNavigate();
  const { credit, creditTx } = useGifting();
  const [tab, setTab] = useState("stamps");
  const [sheet, setSheet] = useState(null);
  const [sub, setSub] = useState(null);
  const [flash, setFlash] = useState(null);

  const profile = leadData || DEMO_STAMPS[userState] || null;
  const stamps = profile?.coins ?? 0;
  const stampTx = useMemo(
    () => [...(profile?.transactions || [])].sort((a, b) => ts(b.date) - ts(a.date)),
    [profile]
  );

  const back = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/account");
  };

  if (userState === "new") {
    return (
      <Screen style={APP_BG}>
        <TopBar title="Wallet" onBack={back} transparent />
        <Body>
          <div style={{ padding: "72px 32px", textAlign: "center" }}>
            <Coins size={40} color={W.grey600} strokeWidth={1.5} style={{ margin: "0 auto" }} />
            <p style={{ ...T.labelLarge, marginTop: 16 }}>Log in to see your wallet</p>
            <p style={{ ...T.bodySmall, color: W.grey600, marginTop: 8, marginBottom: 20 }}>
              Stamps and travel credit live here
            </p>
            <Primary onClick={() => navigate("/plan?return=account")}>Log in</Primary>
          </div>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen style={APP_BG}>
      <TopBar title="Wallet" onBack={back} transparent />
      <Body>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <Segmented
            value={tab} onChange={setTab}
            options={[["stamps", "Stamps"], ["credit", "Credit"]]}
          />

          {tab === "stamps"
            ? <StampsTab stamps={stamps} tx={stampTx} onHistory={() => setSub("history-stamps")} />
            : <CreditTab
                onHistory={() => setSub("history-credit")}
                onDetails={() => setSub("details")}
                onTopUp={() => setSheet("topup")}
                onAddCard={() => setSheet("addcard")}
                onTerms={setSub}
              />}

          <div style={{ height: 16 }} />
        </div>
      </Body>

      {sheet === "topup" && (
        <TopUpSheet onClose={() => setSheet(null)} onDone={(a) => { setSheet(null); setFlash(`${inr(a)} added`); }} />
      )}
      {sheet === "addcard" && (
        <AddGiftCardSheet onClose={() => setSheet(null)} onDone={(a, from) => { setSheet(null); setFlash(`${inr(a)} from ${from} added`); }} />
      )}

      {sub === "history-stamps" && <History kind="stamps" stampTx={stampTx} onClose={() => setSub(null)} />}
      {sub === "history-credit" && <History kind="credit" creditTx={creditTx} onClose={() => setSub(null)} />}
      {sub === "details" && <CreditDetails onClose={() => setSub(null)} />}
      {sub === "credit-terms" && <TermsScreen title="Credit terms" items={CREDIT_TERMS_FULL} onClose={() => setSub(null)} />}
      {sub === "gift-terms" && <TermsScreen title="Gift card terms" items={GIFT_TERMS_FULL} onClose={() => setSub(null)} />}
      {sub === "faqs" && <TermsScreen title="FAQs" items={FAQS} onClose={() => setSub(null)} />}

      {flash && <FlashBar text={flash} onDone={() => setFlash(null)} />}
      {credit === -1 && null}
    </Screen>
  );
}

/* ── Stamps: the app's card, unchanged ── */

function StampsTab({ stamps, tx, onHistory }) {
  const earned = tx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const redeemed = Math.abs(stamps - earned);

  return (
    <>
      <div style={{ position: "relative" }}>
        <DottedCard>
          <div style={{ padding: "16px 16px 0" }}>
            <p style={{ ...T.bodyMedium }}>Current Balance</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
              <StampIcon size={36} />
              <span style={{ ...T.headlineMedium }}>{stamps.toLocaleString("en-IN")}</span>
            </div>
            {(earned > 0 || redeemed > 0) && (
              <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
                <SplitStat icon={ArrowUpCircle} color={W.green600} label="Earned" value={earned.toLocaleString("en-IN")} />
                <SplitStat icon={ArrowDownCircle} color={W.red600} label="Redeemed" value={redeemed.toLocaleString("en-IN")} />
              </div>
            )}
            <div style={{ height: 16 }} />
            <Divider />
            <HistoryLink onClick={onHistory} />
          </div>
        </DottedCard>
        <WalletHookTag />
      </div>

      <div>
        <h2 style={{ ...T.titleMedium600, marginBottom: 16 }}>Ways to Earn Coins</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {STAMP_EARN.map(w => (
            <SettingsTile
              key={w.title}
              leading={<TileIcon icon={EARN_ICON[w.icon]} />}
              title={<p style={{ ...T.labelLarge }}>{w.title}</p>}
              description={<p style={{ ...T.bodyMedium, color: W.grey600, lineHeight: "20px" }}>{w.desc}</p>}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Credit: same card, real money ── */

function CreditTab({ onHistory, onDetails, onTopUp, onAddCard, onTerms }) {
  const { credit, creditTx } = useGifting();
  const added = creditTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = creditTx.filter(t => t.amount < 0).reduce((s, t) => s - t.amount, 0);

  return (
    <>
      <div style={{ position: "relative" }}>
        <DottedCard dashColor={C.p300}>
          <div style={{ padding: "16px 16px 0" }}>
            <p style={{ ...T.bodyMedium }}>Current Balance</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: C.p100, display: "grid", placeItems: "center" }}>
                <WalletIcon size={20} color={C.p600} />
              </span>
              <span style={{ ...T.headlineMedium }}>{inr(credit)}</span>
            </div>
            <p style={{ ...T.bodySmall, color: W.grey600, marginTop: 8 }}>Real money. Never expires.</p>

            {(added > 0 || spent > 0) && (
              <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
                <SplitStat icon={ArrowUpCircle} color={W.green600} label="Received" value={inr(added)} />
                <SplitStat icon={ArrowDownCircle} color={W.red600} label="Spent" value={inr(spent)} />
              </div>
            )}

            <div style={{ height: 16 }} />
            <Divider />
            <div style={{ display: "flex", gap: 8, padding: "12px 0" }}>
              <CardAction icon={Plus} label="Top up" onClick={onTopUp} filled />
              <CardAction icon={Gift} label="Add a gift card" onClick={onAddCard} />
            </div>
            <Divider />
            <HistoryLink onClick={onHistory} />
          </div>
        </DottedCard>
      </div>

      {/* Explanation, not navigation. Kept visually quieter than the rows below. */}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
          color: W.grey600, margin: "0 0 8px",
        }}>Why Credit</p>
        <InfoList items={CREDIT_BENEFITS.map(b => ({ ...b, icon: BENEFIT_ICON[b.icon] }))} />
      </div>

      {/* Credit details opens a screen with numbers on it, so it stays a row.
          Terms and FAQs are reading material, so they are just links. */}
      <SettingsSection>
        <NavRow icon={Coins} label="Credit details" value={inr(credit)} onClick={onDetails} />
      </SettingsSection>

      <TermLinks links={[
        ["Credit T&Cs", () => onTerms("credit-terms")],
        ["Gift card T&Cs", () => onTerms("gift-terms")],
        ["FAQs", () => onTerms("faqs")],
      ]} />
    </>
  );
}

// Small text links, the way the rest of the industry closes a wallet page off.
function TermLinks({ links }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", padding: "0 2px" }}>
      {links.map(([label, onClick]) => (
        <button key={label} onClick={onClick} style={{
          display: "inline-flex", alignItems: "center", gap: 2, background: "none", border: "none",
          padding: 0, cursor: "pointer", fontFamily: "inherit",
          fontSize: 12.5, fontWeight: 700, color: C.p600,
        }}>
          {label} <ChevronRight size={13} />
        </button>
      ))}
    </div>
  );
}

/* ── Shared bits ── */

function HistoryLink({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", width: "100%", padding: "16px 0",
      background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
    }}>
      <span style={{ ...T.labelLarge, color: C.p600, flex: 1, textAlign: "left" }}>
        View Transaction History
      </span>
      <ChevronRight size={16} color={C.p600} />
    </button>
  );
}

function SplitStat({ icon: Icon, color, label, value }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
      <Icon size={24} color={color} strokeWidth={1.8} style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ ...T.bodySmall, color: W.grey600 }}>{label}</p>
        <p style={{ ...T.titleMedium, whiteSpace: "nowrap" }}>{value}</p>
      </div>
    </div>
  );
}

function CardAction({ icon: Icon, label, onClick, filled }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "11px 0", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
      border: filled ? "none" : `1px solid ${W.grey300}`,
      background: filled ? C.p600 : C.white,
      color: filled ? "#fff" : C.head, fontSize: 14, fontWeight: 500,
    }}>
      <Icon size={16} /> {label}
    </button>
  );
}

function NavRow({ icon: Icon, label, value, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", padding: 12,
      background: C.white, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <TileIcon icon={Icon} color={C.p600} />
      <span style={{ ...T.labelLarge, flex: 1 }}>{label}</span>
      {value && <span style={{ ...T.bodyMedium, color: W.grey600 }}>{value}</span>}
      <ChevronRight size={16} color={C.head} />
    </button>
  );
}

/* ── Transaction history, the app's screen ── */

const TX_ICON = {
  referral: ArrowDownLeft, redemption: ArrowUpRight,
  expiry: CalendarX, bookingCompletion: CalendarCheck,
};
const TX_LABEL = {
  referral: "By Referral", redemption: "Redeem",
  expiry: "Expired", bookingCompletion: "Booking Completion",
};

function History({ kind, stampTx = [], creditTx = [], onClose }) {
  const rows = kind === "stamps"
    ? stampTx.map(t => ({
        id: `s_${t.title}_${t.date}`, kind, date: t.date,
        label: TX_LABEL[t.source] || "Unknown", source: t.source,
        desc: t.desc || t.title, amount: t.amount,
      }))
    : creditTx.map(t => ({
        id: t.id, kind, date: t.date, label: t.title,
        source: t.amount >= 0 ? "referral" : "redemption",
        desc: t.sub || "", amount: t.amount,
      }));

  return (
    <Screen overlay style={APP_BG}>
      <TopBar title="Transaction History" onBack={onClose} transparent />
      <Body>
        <div style={{ padding: 16 }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 64px 0" }}>
              <Coins size={40} color={W.grey600} strokeWidth={1.5} style={{ margin: "0 auto" }} />
              <p style={{ ...T.labelLarge, marginTop: 16 }}>No Transaction found</p>
              <p style={{ ...T.bodySmall, color: W.grey600, marginTop: 8 }}>
                Your transaction history will show up here
              </p>
            </div>
          ) : (
            <SettingsSection>
              {rows.map(r => <TxRow key={r.id} row={r} />)}
            </SettingsSection>
          )}
        </div>
      </Body>
    </Screen>
  );
}

function TxRow({ row }) {
  const debit = row.amount < 0;
  const Icon = TX_ICON[row.source] || Coins;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 12px 12px 12px" }}>
      <span style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center",
        background: debit ? `${W.red50}80` : `${W.green50}80`,
        border: `1px solid ${debit ? W.red200 : W.green200}`,
      }}>
        <Icon size={18} color={debit ? W.red : W.green} strokeWidth={1.8} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...T.bodySmall, color: W.grey600 }}>{row.date}</p>
            <p style={{ ...T.titleMedium, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {row.label}
            </p>
          </div>
          <span style={{
            display: "flex", alignItems: "center", gap: 2, flexShrink: 0,
            ...T.titleMedium, color: debit ? W.red600 : W.green600,
          }}>
            {row.kind === "stamps"
              ? <><StampIcon size={20} />{Math.abs(row.amount).toLocaleString("en-IN")}</>
              : inr(Math.abs(row.amount))}
          </span>
        </div>
        {row.desc && <p style={{ ...T.bodyMedium, color: W.grey600, marginTop: 4 }}>{row.desc}</p>}
      </div>
    </div>
  );
}

/* ── Credit details ── */

function CreditDetails({ onClose }) {
  const { credit, creditTx } = useGifting();
  const added = creditTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const used = creditTx.filter(t => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const sources = creditTx.filter(t => t.amount > 0);

  return (
    <Screen overlay style={APP_BG}>
      <TopBar title="Credit details" onBack={onClose} transparent />
      <Body>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatBox label="Active" value={inr(credit)} note="No expiry" />
            <StatBox label="Expired" value={inr(0)} note="Credit never lapses" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <StatBox label="Received" value={inr(added)} />
            <StatBox label="Spent" value={inr(used)} />
          </div>

          <div>
            <h2 style={{ ...T.titleMedium600, marginBottom: 16 }}>Where it came from</h2>
            <SettingsSection>
              {sources.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ ...T.bodySmall, color: W.grey600 }}>{t.date}</p>
                    <p style={{ ...T.titleMedium }}>{t.title}</p>
                  </div>
                  <p style={{ ...T.titleMedium, color: W.green600 }}>{inr(t.amount)}</p>
                </div>
              ))}
            </SettingsSection>
          </div>
        </div>
      </Body>
    </Screen>
  );
}

function StatBox({ label, value, note }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${W.grey200}`, borderRadius: 12, padding: 12 }}>
      <p style={{ ...T.bodySmall, color: W.grey600 }}>{label}</p>
      <p style={{ ...T.titleMedium600, fontSize: 18, marginTop: 4 }}>{value}</p>
      {note && <p style={{ ...T.bodySmall, color: C.inact, marginTop: 4 }}>{note}</p>}
    </div>
  );
}

function TermsScreen({ title, items, onClose }) {
  return (
    <Screen overlay style={APP_BG}>
      <TopBar title={title} onBack={onClose} transparent />
      <Body>
        <div style={{ padding: "16px 16px 40px" }}>
          <Accordion items={items} />
        </div>
      </Body>
    </Screen>
  );
}

/* ── Top up ── */

function TopUpSheet({ onClose, onDone }) {
  const { topUp } = useGifting();
  const [amount, setAmount] = useState(10000);
  const [custom, setCustom] = useState("");
  const { paying, pay } = usePayment();
  const value = custom ? Number(custom.replace(/\D/g, "")) : amount;
  const tooSmall = value > 0 && value < 500;

  return (
    <Sheet
      title="Top up credit"
      sub="Spend it on any instalment. It never expires."
      onClose={onClose}
      footer={
        <Primary disabled={!value || tooSmall || paying} onClick={() => pay(() => { topUp(value); onDone(value); })}>
          {paying ? "Processing..." : `Pay ${inr(value || 0)}`}
        </Primary>
      }
    >
      <div style={{ paddingBottom: 4 }}>
        <AmountTiles presets={TOPUP_PRESETS} value={custom ? null : amount} onPick={(p) => { setAmount(p); setCustom(""); }} format={inr} />
        <div style={{ marginTop: 12 }}>
          <Field label="Or another amount" error={tooSmall ? "Minimum ₹500" : null}>
            <Input inputMode="numeric" placeholder="₹" value={custom} error={tooSmall}
              onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <p style={{ ...T.bodySmall, color: W.grey600, paddingBottom: 6 }}>
          Credit cannot be withdrawn as cash.
        </p>
      </div>
    </Sheet>
  );
}

/* ── Add a gift card ── */

function AddGiftCardSheet({ onClose, onDone }) {
  const { redeemCode } = useGifting();
  // Two ways in: type the code and PIN, or paste the link you were sent. Inside
  // the app you are already signed in, so a pasted link needs no PIN.
  const [mode, setMode] = useState("code");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [link, setLink] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const linkCode = codeFromUrl(link);
  const ready = mode === "code"
    ? code.replace(/\W/g, "").length >= 8 && pin.length === 4
    : !!linkCode;

  const submit = () => {
    setBusy(true); setErr(null);
    setTimeout(() => {
      const res = mode === "code" ? redeemCode(code, pin) : redeemCode(linkCode, null, "link");
      setBusy(false);
      if (res.ok) { track("gift_card_claimed", { path: mode }); onDone(res.amount, res.from); return; }
      setErr(res);
    }, 600);
  };

  const message = !err ? null
    : err.error === "unknown" ? "We do not recognise that code."
    : err.error === "claimed" ? "This card has already been used."
    : err.error === "expired" ? "This card has expired. Cards must be claimed within a year."
    : err.error === "locked" ? `Locked for ${err.hoursLeft} more hours.`
    : `Wrong PIN. ${err.left} ${err.left === 1 ? "try" : "tries"} left.`;

  const locked = err?.error === "locked";

  return (
    <Sheet
      title="Add a gift card"
      sub="The amount lands in your credit balance."
      onClose={onClose}
      footer={<Primary disabled={!ready || busy || locked} onClick={submit}>{busy ? "Checking..." : "Add to wallet"}</Primary>}
    >
      <div style={{ paddingBottom: 4 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[["code", "Code and PIN"], ["link", "Paste the link"]].map(([id, label]) => {
            const on = mode === id;
            return (
              <button key={id} onClick={() => { setMode(id); setErr(null); }} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: on ? 700 : 600,
                border: `1px solid ${on ? C.p600 : W.grey200}`,
                background: on ? C.p100 : C.white, color: on ? C.p900 : W.grey600,
              }}>{label}</button>
            );
          })}
        </div>

        {mode === "code" ? (
          <>
            <Field label="Gift code">
              <Input placeholder="GS-XXXX-XXXX" value={code} error={!!err && err.error !== "pin"}
                autoCapitalize="characters"
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(null); }} />
            </Field>
            <Field label="4 digit PIN">
              <Input inputMode="numeric" placeholder="••••" value={pin} error={err?.error === "pin"} maxLength={4}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErr(null); }}
                style={{ letterSpacing: "6px", fontWeight: 700 }} />
            </Field>
          </>
        ) : (
          <Field label="Gift card link"
            hint={linkCode ? `Card ending ${linkCode.slice(-4)} found. No PIN needed.` : "It looks like 30sundays.club/g/..."}>
            <Input placeholder="https://30sundays.club/g/..." value={link} error={!!err}
              onChange={(e) => { setLink(e.target.value); setErr(null); }} />
          </Field>
        )}

        {message && (
          <div style={{
            display: "flex", gap: 9, padding: "11px 12px", borderRadius: 11,
            background: W.red50, border: `1px solid ${W.red200}`, marginBottom: 12,
          }}>
            {locked ? <Lock size={15} color={W.red600} style={{ flexShrink: 0, marginTop: 1 }} />
                    : <AlertCircle size={15} color={W.red600} style={{ flexShrink: 0, marginTop: 1 }} />}
            <p style={{ fontSize: 13, color: W.red600, margin: 0 }}>{message}</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function FlashBar({ text, onDone }) {
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 18, zIndex: 320,
      background: C.head, color: "#fff", borderRadius: 12, padding: "13px 15px",
      display: "flex", alignItems: "center", gap: 9,
      animation: "toastSlideUp 0.25s ease-out", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    }}>
      <Check size={17} strokeWidth={3} />
      <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{text}</span>
      <button onClick={onDone} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", padding: 0 }}>OK</button>
    </div>
  );
}

// Stamps for the demo accounts, mirroring the Account screen.
const DEMO_STAMPS = {
  lead: { coins: 0, transactions: [] },
  customer: {
    coins: 1500,
    transactions: [
      { title: "Booking credit · Bali trip", source: "bookingCompletion", date: "28 Apr 2026", amount: 1000, desc: "After your first instalment" },
      { title: "Referral bonus", source: "referral", date: "12 Apr 2026", amount: 500, desc: "Aarav Mehta booked their first trip" },
    ],
  },
  done: {
    coins: 4200,
    transactions: [
      { title: "Repeat booking reward", source: "bookingCompletion", date: "02 Jun 2026", amount: 1500, desc: "Booking MLD-4471" },
      { title: "Redeemed on Maldives trip", source: "redemption", date: "18 Mar 2026", amount: -800, desc: "Applied to instalment 1" },
      { title: "Referral bonus", source: "referral", date: "10 Feb 2026", amount: 500, desc: "Priya Sharma booked their first trip" },
      { title: "Welcome bonus", source: "bookingCompletion", date: "05 Jan 2026", amount: 3000, desc: "Thanks for joining" },
    ],
  },
};
