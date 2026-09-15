import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Phone, Check, AlertTriangle, EyeOff, Bell, Share2, Users, Lock,
} from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import {
  OCCASIONS, getOccasion, CONTRIB_TIERS, REGISTRY_CAP, REGISTRY_TERMS_TOP,
  REGISTRY_TERMS_TOP_COUPLE, inr, MY,
} from "../data/giftData";
import {
  Screen, Body, TopBar, Primary, Secondary, StepBar, StepTitle, Field, Input,
  Textarea, AmountTiles, Checkbox, ChoiceCard, Sheet, PAD,
} from "../components/Gift/GiftUI";
import { APP_BG } from "../components/Gift/WalletUI";

const cleanPhone = (s) => String(s || "").replace(/\D/g, "").slice(0, 10);
const validPhone = (s) => cleanPhone(s).length === 10 && /^[6-9]/.test(cleanPhone(s));

const ORGANISER_STEPS = ["couple", "occasion", "target", "reveal", "contribute"];
const COUPLE_STEPS = ["names", "occasion", "target", "done"];

const RELATIONS = ["Friend", "Sibling", "Parent", "Cousin", "Colleague"];

export default function RegistryCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const asCouple = params.get("for") === "us";
  const { createRegistry, contribute, findRegistryByPhone, registryTotal } = useGifting();

  const steps = asCouple ? COUPLE_STEPS : ORGANISER_STEPS;
  const [i, setI] = useState(0);
  const key = steps[i];

  const [d, setD] = useState({
    coupleNames: asCouple ? `${MY.name.split(" ")[0]} and ${MY.partner.split(" ")[0]}` : "",
    couplePhone: asCouple ? MY.phone : "",
    organiserRelation: "Friend",
    occasion: "", destination: "",
    target: null, customTarget: "",
    reveal: "now",
    amount: CONTRIB_TIERS[1], customAmount: "", message: "",
  });
  const [touched, setTouched] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [dupe, setDupe] = useState(null);
  const [created, setCreated] = useState(null);

  const set = (f) => setD(p => ({ ...p, ...f }));

  const target = d.customTarget !== "" ? Number(d.customTarget) : d.target;
  const targetError = target && target > REGISTRY_CAP ? `A registry can hold up to ${inr(REGISTRY_CAP)}` : null;
  const amount = d.customAmount !== "" ? Number(d.customAmount) : d.amount;
  const amountError = amount && amount < 500 ? "The smallest contribution is ₹500" : null;

  const phoneErr = touched && !asCouple && !validPhone(d.couplePhone) ? "Enter their 10 digit mobile number" : null;
  const nameErr = touched && !d.coupleNames.trim() ? "Add their names" : null;

  const canGo = {
    couple: d.coupleNames.trim() && validPhone(d.couplePhone),
    names: d.coupleNames.trim(),
    occasion: !!d.occasion,
    target: !targetError,
    reveal: true,
    contribute: !!amount && !amountError && agreed,
    done: agreed,
  }[key];

  const back = () => {
    setTouched(false);
    if (i > 0) { setI(i - 1); return; }
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/registry");
  };

  const finish = () => {
    const r = createRegistry({
      creatorType: asCouple ? "couple" : "organiser",
      organiserName: MY.name,
      organiserRelation: asCouple ? "Themselves" : d.organiserRelation,
      coupleNames: d.coupleNames.trim(),
      couplePhone: cleanPhone(d.couplePhone),
      occasion: d.occasion,
      destination: d.destination.trim(),
      target: target || null,
      reveal: asCouple ? "now" : d.reveal,
    });
    if (!asCouple) {
      contribute(r.id, { name: MY.name, anon: false, amount, message: d.message.trim() });
    }
    setCreated(r);
  };

  const next = () => {
    if (!canGo) { setTouched(true); return; }
    setTouched(false);

    // Two branches of one family often start separate registries by accident.
    if (key === "couple") {
      const existing = findRegistryByPhone(d.couplePhone);
      if (existing) { setDupe(existing); return; }
    }
    if (key === "contribute" || key === "done") { finish(); return; }
    setI(i + 1);
  };

  if (created) return <Success registry={created} asCouple={asCouple} amount={asCouple ? 0 : amount} />;

  return (
    <Screen
      style={APP_BG}
      footer={
        <Primary disabled={!canGo && key !== "couple" && key !== "names"} onClick={next}>
          {key === "contribute" ? `Pay ${inr(amount || 0)} and create` : key === "done" ? "Create the registry" : "Continue"}
        </Primary>
      }
    >
      <TopBar
        title={asCouple ? "Our gift registry" : "Set up a registry"}
        sub={`Step ${i + 1} of ${steps.length}`}
        onBack={back} transparent
      />
      <StepBar step={i + 1} total={steps.length} />
      <Body>
        {key === "couple" && (
          <StepCouple d={d} set={set} nameErr={nameErr} phoneErr={phoneErr} />
        )}
        {key === "names" && (
          <>
            <StepTitle kicker="Step 1" title="Your registry" sub="This is the name people will see at the top of the page." />
            <div style={{ padding: `0 ${PAD}px 30px` }}>
              <Field label="Your names" error={nameErr}>
                <Input value={d.coupleNames} error={!!nameErr} onChange={(e) => set({ coupleNames: e.target.value })} />
              </Field>
              <div style={{
                display: "flex", gap: 10, padding: "13px 14px", borderRadius: 13,
                background: C.white, border: `1px solid ${C.div}`,
              }}>
                <Lock size={16} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>
Money lands in your wallet as people give. Nothing to claim later.
                </p>
              </div>
            </div>
          </>
        )}
        {key === "occasion" && <StepOccasion d={d} set={set} />}
        {key === "target" && <StepTarget d={d} set={set} target={target} error={targetError} />}
        {key === "reveal" && <StepReveal d={d} set={set} />}
        {key === "contribute" && (
          <StepContribute d={d} set={set} error={amountError} agreed={agreed} setAgreed={setAgreed} />
        )}
        {key === "done" && <StepDone d={d} target={target} agreed={agreed} setAgreed={setAgreed} />}
      </Body>

      {dupe && (
        <DuplicateSheet
          registry={dupe}
          total={registryTotal(dupe)}
          onClose={() => setDupe(null)}
          onUseExisting={() => navigate(`/registry/${dupe.id}`)}
          onCreateAnyway={() => { setDupe(null); setI(i + 1); }}
        />
      )}
    </Screen>
  );
}

/* ── Who it is for ── */
function StepCouple({ d, set, nameErr, phoneErr }) {
  return (
    <>
      <StepTitle
        kicker="Step 1"
        title="Who is this for?"
        sub="The pool sits against their number until they claim it."
      />
      <div style={{ padding: `0 ${PAD}px 30px` }}>
        <Field label="Their names" error={nameErr} hint="Goes at the top of the page.">
          <Input placeholder="Ishaan and Tara" value={d.coupleNames} error={!!nameErr} onChange={(e) => set({ coupleNames: e.target.value })} />
        </Field>

        <Field label="Their mobile number" error={phoneErr} hint="Cannot be changed later. Support has to fix a wrong one.">
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5, padding: "0 12px", borderRadius: 11,
              border: `1px solid ${C.div}`, background: C.bg, fontSize: 15, color: C.head, fontWeight: 600,
            }}>
              <Phone size={14} color={C.sub} /> +91
            </div>
            <Input inputMode="numeric" placeholder="98765 43210" value={d.couplePhone} error={!!phoneErr} onChange={(e) => set({ couplePhone: cleanPhone(e.target.value) })} />
          </div>
        </Field>

        <Field label="You are their">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RELATIONS.map(r => {
              const on = d.organiserRelation === r;
              return (
                <button key={r} onClick={() => set({ organiserRelation: r })} style={{
                  padding: "9px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                  border: `1.5px solid ${on ? C.p600 : C.div}`, background: on ? C.p100 : C.white,
                  color: on ? C.p900 : C.head, fontSize: 13.5, fontWeight: 600,
                }}>{r}</button>
              );
            })}
          </div>
        </Field>

        <div style={{
          display: "flex", gap: 10, padding: "13px 14px", borderRadius: 13,
          background: C.white, border: `1px solid ${C.div}`, marginTop: 4,
        }}>
          <Lock size={16} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>
Share, set a target, close it. You can never touch the money.
          </p>
        </div>
      </div>
    </>
  );
}

/* ── Occasion ── */
function StepOccasion({ d, set }) {
  return (
    <>
      <StepTitle kicker="Step 2" title="What is the occasion?" sub="It sets the tone of the page people land on." />
      <div style={{ padding: `0 ${PAD}px 30px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
          {OCCASIONS.map(o => {
            const on = d.occasion === o.id;
            return (
              <button key={o.id} onClick={() => set({ occasion: o.id })} style={{
                display: "flex", alignItems: "center", gap: 13, width: "100%", padding: "14px 15px",
                borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                border: `1.5px solid ${on ? C.p600 : C.div}`, background: on ? C.p100 : C.white,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{o.emoji}</span>
                <span style={{ flex: 1, fontSize: 15.5, fontWeight: 700, color: C.head }}>{o.label}</span>
                {on && (
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.p600, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Field label="Where are they going" optional hint="Leave it blank if it is not decided yet.">
          <Input placeholder="Maldives" value={d.destination} onChange={(e) => set({ destination: e.target.value })} />
        </Field>
      </div>
    </>
  );
}

/* ── Target ── */
function StepTarget({ d, set, target, error }) {
  const presets = [50000, 100000, 200000, 300000];
  return (
    <>
      <StepTitle
        kicker="Step 3" title="Set a target?"
        sub="A progress marker. Nothing is refunded if it is missed."
      />
      <div style={{ padding: `0 ${PAD}px 30px` }}>
        <AmountTiles
          presets={presets}
          value={d.customTarget === "" ? d.target : null}
          onPick={(p) => set({ target: p === d.target ? null : p, customTarget: "" })}
          format={inr}
        />
        <div style={{ marginTop: 14 }}>
          <Field label="Or another number" error={error}>
            <Input inputMode="numeric" placeholder="₹" value={d.customTarget} error={!!error}
              onChange={(e) => set({ customTarget: e.target.value.replace(/\D/g, ""), target: null })} />
          </Field>
        </div>

        <button onClick={() => set({ target: null, customTarget: "" })} style={{
          width: "100%", padding: "13px 0", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
          border: `1.5px solid ${!target ? C.p600 : C.div}`, background: !target ? C.p100 : C.white,
          color: C.head, fontSize: 14.5, fontWeight: 600,
        }}>
          No target, just collect
        </button>

        <p style={{ fontSize: 12, color: C.sub, margin: "16px 0 0", lineHeight: "17px" }}>
          A registry can hold up to {inr(REGISTRY_CAP)} in total.
        </p>
      </div>
    </>
  );
}

/* ── Reveal ── */
function StepReveal({ d, set }) {
  return (
    <>
      <StepTitle
        kicker="Step 4" title="When do they find out?"
        sub="Nobody is told the moment you create this."
      />
      <div style={{ padding: `0 ${PAD}px 30px` }}>
        <ChoiceCard
          selected={d.reveal === "now"} onClick={() => set({ reveal: "now" })}
          title="Tell them on the first gift" badge="Usual"
          desc="Told once there is something in it, so right after you pay."
        />
        <ChoiceCard
          selected={d.reveal === "surprise"} onClick={() => set({ reveal: "surprise" })}
          title="Keep it a surprise"
          desc="Nothing reaches them until you tap Reveal."
        />

        <div style={{
          display: "flex", gap: 10, padding: "13px 14px", borderRadius: 13,
          background: C.white, border: `1px solid ${C.div}`, marginTop: 6,
        }}>
          {d.reveal === "surprise"
            ? <EyeOff size={16} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />
            : <Bell size={16} color={C.sub} style={{ flexShrink: 0, marginTop: 1 }} />}
          <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>
            {d.reveal === "surprise"
? "Reveal it any time from the registry page."
              : "A summary now and then, not a ping for every gift."}
          </p>
        </div>
      </div>
    </>
  );
}

/* ── First contribution ── */
function StepContribute({ d, set, error, agreed, setAgreed }) {
  return (
    <>
      <StepTitle
        kicker="Last step" title="Start it off"
        sub="A registry with nothing in it is hard to share."
      />
      <div style={{ padding: `0 ${PAD}px 30px` }}>
        <AmountTiles
          presets={CONTRIB_TIERS} value={d.customAmount === "" ? d.amount : null}
          onPick={(p) => set({ amount: p, customAmount: "" })} format={inr}
        />
        <div style={{ marginTop: 14 }}>
          <Field label="Or another amount" error={error}>
            <Input inputMode="numeric" placeholder="₹" value={d.customAmount} error={!!error}
              onChange={(e) => set({ customAmount: e.target.value.replace(/\D/g, ""), amount: null })} />
          </Field>
        </div>

        <Field label="Your message" optional hint="Shown next to your name.">
          <Textarea placeholder="Say something nice" value={d.message} maxLength={160}
            onChange={(e) => set({ message: e.target.value })} />
        </Field>

        <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
          {REGISTRY_TERMS_TOP.map((t, k) => (
            <div key={k} style={{ display: "flex", gap: 9, marginBottom: 9 }}>
              <Check size={14} color={C.p600} style={{ flexShrink: 0, marginTop: 3 }} />
              <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>{t}</p>
            </div>
          ))}
          <div style={{ height: 1, background: C.div, margin: "6px 0 13px" }} />
          <Checkbox checked={agreed} onChange={setAgreed}>I have read and accept the registry terms.</Checkbox>
        </div>
      </div>
    </>
  );
}

/* ── Couple path, final confirm ── */
function StepDone({ d, target, agreed, setAgreed }) {
  const occ = getOccasion(d.occasion);
  return (
    <>
      <StepTitle kicker="Last step" title="Ready to share" sub="What people see when they open your link." />
      <div style={{ padding: `0 ${PAD}px 30px` }}>
        <div style={{ borderRadius: 16, border: `1px solid ${C.div}`, background: C.white, padding: "18px 16px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase", color: C.p600, margin: "0 0 6px" }}>
            {occ.emoji} {occ.label}
          </p>
          <h3 style={{ fontSize: 21, fontWeight: 700, color: C.head, margin: "0 0 4px", letterSpacing: "-0.4px" }}>{d.coupleNames}</h3>
          {d.destination && <p style={{ fontSize: 13.5, color: C.sub, margin: 0 }}>Heading to {d.destination}</p>}
          <p style={{ fontSize: 13, color: C.sub, margin: "12px 0 0" }}>
            {target ? `Target ${inr(target)}` : "No target, just collecting"}
          </p>
        </div>

        <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
          {REGISTRY_TERMS_TOP_COUPLE.map((t, k) => (
            <div key={k} style={{ display: "flex", gap: 9, marginBottom: 9 }}>
              <Check size={14} color={C.p600} style={{ flexShrink: 0, marginTop: 3 }} />
              <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>{t}</p>
            </div>
          ))}
          <div style={{ height: 1, background: C.div, margin: "6px 0 13px" }} />
          <Checkbox checked={agreed} onChange={setAgreed}>I have read and accept the registry terms.</Checkbox>
        </div>
      </div>
    </>
  );
}

/* ── Duplicate warning ── */
function DuplicateSheet({ registry, total, onClose, onUseExisting, onCreateAnyway }) {
  return (
    <Sheet
      title="There is already one for this number"
      sub="Two registries split the money."
      onClose={onClose}
      footer={
        <>
          <Primary onClick={onUseExisting}>Add to the existing one</Primary>
          <div style={{ height: 9 }} />
          <Secondary onClick={onCreateAnyway}>Create a separate one anyway</Secondary>
        </>
      }
    >
      <div style={{ paddingBottom: 6 }}>
        <div style={{
          display: "flex", gap: 10, padding: "13px 14px", borderRadius: 13,
          background: "#FFFAEB", border: "1px solid #F0C97A", marginBottom: 14,
        }}>
          <AlertTriangle size={17} color="#B54708" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: "#B54708", margin: 0, lineHeight: "18px" }}>
            Separate registries from each side of the family are fine. We just want to be sure you meant it.
          </p>
        </div>

        <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.head, margin: 0 }}>{registry.coupleNames}</p>
          <p style={{ fontSize: 12.5, color: C.sub, margin: "3px 0 10px" }}>
            Set up by {registry.organiserName}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={15} color={C.sub} />
            <span style={{ fontSize: 13, color: C.sub }}>
              {inr(total)} from {registry.contributions.length} people
            </span>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

/* ── Created ── */
function Success({ registry, asCouple, amount }) {
  const navigate = useNavigate();
  const link = `30sundays.club/r/${registry.id.replace(/^reg_?/, "")}`;
  const surprise = registry.reveal === "surprise";

  return (
    <Screen style={APP_BG} footer={
      <>
        <Primary onClick={() => navigate(`/registry/${registry.id}`)}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Share2 size={16} /> Share the link
          </span>
        </Primary>
        <div style={{ height: 9 }} />
        <Secondary onClick={() => navigate("/registry")}>Done</Secondary>
      </>
    }>
      <TopBar title="Created" transparent />
      <Body>
        <div style={{ padding: `36px ${PAD}px 0`, textAlign: "center" }}>
          <span style={{
            width: 58, height: 58, borderRadius: "50%", background: "#ECFDF3",
            border: "1px solid #C0E5D5", display: "grid", placeItems: "center", margin: "0 auto 16px",
          }}>
            <Check size={27} color="#027A48" strokeWidth={3} />
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 8px", letterSpacing: "-0.5px", lineHeight: "28px" }}>
            {asCouple ? "Your registry is live" : `${registry.coupleNames} have a registry`}
          </h2>
          <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "20px" }}>
            {asCouple
? "Whatever people give lands straight in your wallet."
              : amount
                ? `You started it off with ${inr(amount)}. ${surprise ? "They have not been told yet." : "They have just been told about it."}`
                : "Share the link to get it going."}
          </p>
        </div>

        <div style={{ padding: `24px ${PAD}px 0` }}>
          <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, padding: "14px 15px" }}>
            <p style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, margin: "0 0 4px" }}>Their link</p>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: C.p600, margin: 0, wordBreak: "break-all" }}>{link}</p>
            <p style={{ fontSize: 11.5, color: C.inact, margin: "8px 0 0", lineHeight: "16px" }}>
No account needed, no app needed.
            </p>
          </div>
        </div>

        {surprise && (
          <div style={{ padding: `14px ${PAD}px 0` }}>
            <div style={{
              display: "flex", gap: 10, padding: "13px 14px", borderRadius: 13,
              background: "#FFFAEB", border: "1px solid #F0C97A",
            }}>
              <EyeOff size={17} color="#B54708" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12.5, color: "#B54708", margin: 0, lineHeight: "18px" }}>
They hear nothing until you tap Reveal.
              </p>
            </div>
          </div>
        )}

        <div style={{ height: 40 }} />
      </Body>
    </Screen>
  );
}
