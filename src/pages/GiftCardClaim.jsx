import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Check, Smartphone, AlertCircle, Lock, ShieldCheck, CalendarClock,
} from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import {
  MY, CREDIT_TERMS_TOP, CARD_VALID_DAYS, getOccasion, inr,
} from "../data/giftData";
import {
  Screen, Body, TopBar, Primary, Secondary, Field, Input, SectionBar, PAD,
} from "../components/Gift/GiftUI";
import { W } from "../components/Gift/WalletUI";
import GiftCardArt from "../components/Gift/GiftCardArt";

// What the recipient opens when they tap the link. The code arrives with the
// link, so all they have to prove is that the phone is theirs. That one check
// is what stops a forwarded message being cashed by whoever it reaches next.

export default function GiftCardClaim() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { findCode, redeemCode, credit } = useGifting();

  const [stage, setStage] = useState("view");
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState(null);
  const [claimedAmount, setClaimedAmount] = useState(0);

  const card = findCode(code);
  const alreadyClaimed = card?.status === "claimed";
  const daysLeft = card?.expiresAt ? Math.ceil((card.expiresAt - Date.now()) / 86400000) : null;
  const lapsed = !alreadyClaimed && daysLeft !== null && daysLeft <= 0;

  if (!card) {
    return (
      <Problem title="This link does not work"
        desc="It may have been mistyped, or the card was already added to a wallet."
        action={<Secondary onClick={() => navigate("/wallet")}>Go to my wallet</Secondary>} />
    );
  }

  if (lapsed) {
    return (
      <Problem title="This gift card has expired"
        desc={`A card has to be claimed within ${CARD_VALID_DAYS} days. This one was bought longer ago than that, so the code no longer works. Ask whoever sent it to get in touch with us.`}
        action={<Secondary onClick={() => navigate("/wallet")}>Go to my wallet</Secondary>} />
    );
  }

  const occ = getOccasion(card.occasion);
  const fromName = card.from || card.fromName || "a friend";
  const phone = card.toPhone || MY.phone;

  const verify = () => {
    if (otp !== "1234" && otp !== "0000") {
      setOtpErr("That code is wrong. Try 1234 in this prototype.");
      return;
    }
    const res = redeemCode(card.code, card.pin, "link");
    if (res.error) {
      setOtpErr(res.error === "claimed" ? "This card has already been added." : "Something went wrong.");
      return;
    }
    setClaimedAmount(res.amount);
    setStage("done");
  };

  /* ─── Added ─── */
  if (stage === "done") {
    return (
      <Screen>
        <TopBar title="Added" />
        <Body>
          <div style={{ padding: `26px ${PAD}px 0`, textAlign: "center" }}>
            <span style={{
              width: 56, height: 56, borderRadius: "50%", background: W.green50,
              display: "grid", placeItems: "center", margin: "0 auto 14px",
            }}><Check size={28} color={W.green600} strokeWidth={2.6} /></span>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: C.head, margin: 0, letterSpacing: "-0.7px" }}>
              {inr(claimedAmount)} added
            </h2>
            <p style={{ fontSize: 14, color: C.sub, margin: "8px 0 0", lineHeight: "20px" }}>
              Travel credit now. Any package, any instalment, and it never expires.
            </p>
          </div>

          <SectionBar />

          <div style={{ padding: `0 ${PAD}px` }}>
            <div style={{ border: `1px solid ${C.div}`, borderRadius: 12, padding: "16px 15px" }}>
              <p style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
                color: C.sub, margin: 0,
              }}>Credit balance</p>
              <p style={{ fontSize: 27, fontWeight: 800, color: C.head, margin: "5px 0 0", letterSpacing: "-0.6px" }}>
                {inr(credit)}
              </p>
            </div>
            <p style={{ fontSize: 12, color: C.inact, margin: "12px 2px 0", lineHeight: "17px" }}>
              The code from {fromName} has now been used and will not work again.
            </p>
          </div>
          <div style={{ height: 24 }} />
        </Body>
        <div style={{
          flexShrink: 0, borderTop: `1px solid ${C.div}`, background: C.white,
          padding: `12px ${PAD}px calc(14px + env(safe-area-inset-bottom))`,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <Primary onClick={() => navigate("/wallet")}>See it in my wallet</Primary>
          <Secondary onClick={() => navigate("/")}>Start planning a trip</Secondary>
        </div>
      </Screen>
    );
  }

  /* ─── Phone check ─── */
  if (stage === "otp") {
    return (
      <Screen>
        <TopBar title="Check it is you" onBack={() => { setStage("view"); setOtp(""); setOtpErr(null); }} />
        <Body>
          <div style={{ padding: `22px ${PAD}px 0` }}>
            <span style={{
              width: 46, height: 46, borderRadius: 13, background: C.p100,
              display: "grid", placeItems: "center", marginBottom: 16,
            }}><Smartphone size={22} color={C.p600} /></span>
            <h2 style={{ fontSize: 21, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.4px" }}>
              Enter the code we texted you
            </h2>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "7px 0 20px", lineHeight: "19px" }}>
              Sent to +91 {phone.slice(0, 5)} {phone.slice(5)}. This is the only check, so the money
              lands in your wallet and nobody else&rsquo;s.
            </p>
            <Field label="4 digit code" error={otpErr}>
              <Input value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 4)); setOtpErr(null); }}
                inputMode="numeric" placeholder="1234" error={!!otpErr}
                style={{ textAlign: "center", fontSize: 22, fontWeight: 700, letterSpacing: "10px" }} />
            </Field>
            <p style={{ fontSize: 12, color: C.inact, margin: "10px 2px 0" }}>Prototype: the code is 1234.</p>
          </div>
        </Body>
        <div style={{
          flexShrink: 0, borderTop: `1px solid ${C.div}`, background: C.white,
          padding: `12px ${PAD}px calc(14px + env(safe-area-inset-bottom))`,
        }}>
          <Primary onClick={verify} disabled={otp.length !== 4}>Verify and add {inr(card.amount)}</Primary>
        </div>
      </Screen>
    );
  }

  /* ─── The card ─── */
  return (
    <Screen>
      <TopBar title="A gift for you" />
      <Body>
        <div style={{ padding: `18px ${PAD}px 0` }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
            color: C.p600, margin: "0 0 6px",
          }}>{occ.label} gift</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.5px", lineHeight: "28px" }}>
            {fromName} sent you {inr(card.amount)}
          </h2>
          <p style={{ fontSize: 13.5, color: C.sub, margin: "6px 0 16px", lineHeight: "19px" }}>
            Towards a holiday, on 30 Sundays.
          </p>
          <GiftCardArt artId={card.artId} occasion={card.occasion} amount={card.amount}
            toName={card.toName} fromName={fromName} size="lg" />
          {card.message && (
            <p style={{ fontSize: 13.5, color: C.sub, margin: "16px 0 0", lineHeight: "20px", fontStyle: "italic" }}>
              &ldquo;{card.message}&rdquo;
              <span style={{ display: "block", fontStyle: "normal", fontWeight: 600, color: C.head, marginTop: 6 }}>
                {fromName}
              </span>
            </p>
          )}
        </div>

        <SectionBar />

        <div style={{ padding: `0 ${PAD}px` }}>
          {alreadyClaimed ? (
            <div style={{
              border: `1px solid ${W.grey300}`, borderRadius: 12, padding: "15px", background: W.grey50,
            }}>
              <div style={{ display: "flex", gap: 10 }}>
                <Lock size={17} color={W.grey600} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>Already added</p>
                  <p style={{ fontSize: 13, color: C.sub, margin: "4px 0 0", lineHeight: "18px" }}>
                    A card goes into one wallet only. This code has stopped working.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Primary onClick={() => setStage("otp")}>Add {inr(card.amount)} to my wallet</Primary>
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-start" }}>
                <ShieldCheck size={15} color={C.sub} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>
                  We will text a code to +91 {phone.slice(0, 5)} {phone.slice(5)} to check it is you.
                </p>
              </div>
              {daysLeft !== null && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "flex-start" }}>
                  <CalendarClock size={15} color={daysLeft <= 30 ? W.red600 : C.sub} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{
                    fontSize: 12.5, margin: 0, lineHeight: "18px",
                    color: daysLeft <= 30 ? W.red600 : C.sub,
                    fontWeight: daysLeft <= 30 ? 600 : 400,
                  }}>
                    {daysLeft <= 30
                      ? `Only ${daysLeft} days left to claim this.`
                      : `You have ${daysLeft} days to claim it. The credit itself never expires.`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <SectionBar />

        <div style={{ padding: `0 ${PAD}px` }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
            color: C.sub, margin: "0 0 10px",
          }}>What travel credit is</p>
          {CREDIT_TERMS_TOP.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
              <Check size={14} color={C.p600} style={{ flexShrink: 0, marginTop: 3 }} />
              <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "18px" }}>{t}</p>
            </div>
          ))}
        </div>
        <div style={{ height: 28 }} />
      </Body>
    </Screen>
  );
}

function Problem({ title, desc, action }) {
  return (
    <Screen>
      <TopBar title="Gift card" />
      <Body>
        <div style={{ textAlign: "center", padding: `60px ${PAD}px` }}>
          <span style={{
            width: 56, height: 56, borderRadius: "50%", background: W.red50,
            display: "grid", placeItems: "center", margin: "0 auto 14px",
          }}><AlertCircle size={26} color={W.red600} /></span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>{title}</h3>
          <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 20px", lineHeight: "19px" }}>{desc}</p>
          {action}
        </div>
      </Body>
    </Screen>
  );
}
