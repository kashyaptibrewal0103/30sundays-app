import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Play, RotateCcw } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, QuestionCard } from "../components/Community/CommunityUI";
import { questionsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";
import { PENDING_VARIANTS, REASONS } from "../components/Community/PendingVariants";

// The post lands first, the check runs after.
//
// Somebody writes a question, it appears at the top of the room straight away
// in a checking state that only they can see, and a few seconds later it is
// either live, with us, or refused. Five ways to draw those few seconds and
// what follows them.
//
// Press play on any one to watch the whole arc at real speed. The outcome
// switch at the top decides which ending it runs.

const CHECK_MS = 2600;

export default function LoungePending() {
  const navigate = useNavigate();
  const { answersFor } = useCommunity();
  const [picked, setPicked] = useState(null);
  const [outcome, setOutcome] = useState("flagged");
  const qs = questionsFor("thailand").slice(0, 2);

  return (
    <Screen>
      <TopBar title="A Post Being Checked" sub="Five ways" onBack={() => navigate("/lounge")} />
      <Body>
        <div style={{ padding: "14px 0 44px" }}>
          <p style={{ fontSize: 13.5, color: CC.body, margin: `0 ${PAD}px 12px`, lineHeight: "20px" }}>
            The question lands in the room the moment it is written, in a state only
            its author can see, and the check runs behind it. Press play to watch
            the whole thing at real speed.
          </p>

          {/* The ending every card will run to. */}
          <div style={{ padding: `0 ${PAD}px 18px`, display: "flex", gap: 7, flexWrap: "wrap" }}>
            {[["live", "Goes live"], ["flagged", "Held for us"], ["blocked", "Refused"]].map(([id, label]) => {
              const on = outcome === id;
              return (
                <button key={id} onClick={() => setOutcome(id)} style={{
                  minHeight: 36, padding: "0 14px", borderRadius: 999, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                  border: `1px solid ${on ? CC.ink : CC.line}`,
                  background: on ? CC.ink : CC.white, color: on ? "#fff" : CC.body,
                }}>{label}</button>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26, padding: `0 ${PAD}px` }}>
            {PENDING_VARIANTS.map((v, i) => (
              <Option key={v.id} n={i + 1} v={v} picked={picked} onPick={setPicked}>
                <Runner v={v} outcome={outcome} qs={qs} answersFor={answersFor} />
              </Option>
            ))}
          </div>
        </div>
      </Body>
    </Screen>
  );
}

// One room, one post moving through it. The timer is the only state here: the
// variants themselves are pure and take the state as a prop.
function Runner({ v, outcome, qs, answersFor }) {
  const [state, setState] = useState("checking");
  const [run, setRun] = useState(0);
  const timer = useRef(null);
  const Comp = v.Comp;

  useEffect(() => {
    clearTimeout(timer.current);
    setState("checking");
    timer.current = setTimeout(() => setState(outcome), CHECK_MS);
    return () => clearTimeout(timer.current);
  }, [run, outcome]);

  const done = state !== "checking";

  return (
    <div>
      <div style={{
        border: `1px solid ${CC.line}`, borderRadius: 18, overflow: "hidden", background: CC.white,
      }}>
        <div style={{ padding: `13px ${PAD}px 16px` }}>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 10 }}>
            <p style={{ flex: 1, fontSize: 16, fontWeight: 700, color: CC.ink, margin: 0 }}>
              Questions
            </p>
            <button onClick={() => setRun(n => n + 1)} style={{
              display: "inline-flex", alignItems: "center", gap: 5, minHeight: 32,
              padding: "0 11px", borderRadius: 999, border: `1px solid ${CC.line}`,
              background: CC.white, cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, fontWeight: 700, color: CC.body,
            }}>
              {done ? <RotateCcw size={12} /> : <Play size={12} />} {done ? "Again" : "Running"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* The post being checked sits at the top, whatever the sort says,
                until it resolves. It is the only card its author cannot lose. */}
            <Comp state={state} reason={REASONS[state] || ""} />

            {/* Under variant 3 the card itself appears only once it is live. */}
            {v.id === "strip" && state === "live" && (
              <QuestionCard
                q={{ ...qs[0], title: "How much cash should we carry for the ferry and the markets?", minsAgo: 0, mine: true }}
                answerCount={0} onClick={() => {}}
              />
            )}

            {qs.map(q => (
              <QuestionCard key={q.id} q={q} answerCount={answersFor(q).length} onClick={() => {}} />
            ))}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: CC.soft, margin: "7px 2px 0" }}>
        {state === "checking"
          ? "Checking, about three seconds"
          : state === "live" ? "Live. Everyone in the room can see it now"
            : state === "flagged" ? "Held. Only this traveller sees the card"
              : "Refused. Only this traveller sees the card"}
      </p>
    </div>
  );
}

function Option({ n, v, children, picked, onPick }) {
  const on = picked === v.id;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: CC.goldInk }}>Option {n}</span>
        <button onClick={() => onPick(on ? null : v.id)} style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 10px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
          border: `1px solid ${on ? CC.teal : CC.line}`,
          background: on ? CC.tealTint : CC.white,
          fontSize: 12, fontWeight: 700, color: on ? CC.tealInk : CC.body,
        }}>
          {on && <Check size={12} color={CC.teal} />} {on ? "Picked" : "Pick this"}
        </button>
      </div>
      <h2 style={{
        fontSize: 15.5, fontWeight: 700, color: CC.ink, margin: "0 0 3px", letterSpacing: "-0.1px",
      }}>{v.name}</h2>
      <p style={{ fontSize: 13, color: CC.body, margin: "0 0 10px", lineHeight: "19px" }}>
        {v.note}
      </p>
      {children}
    </div>
  );
}
