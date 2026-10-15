import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar, Primary } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { track } from "../data/communityData";

const MAX = 600;

// A way to tell the team the Community itself is wrong.
//
// Reports are about one post. This is about the room: a rule that does not fit,
// a room that should exist, something that keeps getting in the way. It is not
// a support channel, so it says plainly where trip problems go instead.

const KINDS = [
  { id: "feature", label: "Something Missing" },
  { id: "rule", label: "A Rule Feels Wrong" },
  { id: "bug", label: "Something Is Broken" },
  { id: "other", label: "Something Else" },
];

export default function CommunitySuggest() {
  const navigate = useNavigate();
  const { sendSuggestion } = useCommunity();

  const [kind, setKind] = useState("feature");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    sendSuggestion(kind, text.trim());
    setSent(true);
  };

  if (sent) {
    return (
      <Screen>
        <TopBar title="Suggest A Change" onBack={() => navigate("/community")} />
        <Body>
          <div style={{ padding: `56px ${PAD}px`, textAlign: "center" }}>
            <span style={{
              width: 62, height: 62, borderRadius: "50%", background: CC.tealTint,
              display: "grid", placeItems: "center", margin: "0 auto 16px",
            }}><Check size={28} color={CC.teal} /></span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: CC.ink, margin: "0 0 8px" }}>
              Thank You
            </h3>
            <p style={{ fontSize: 14, color: CC.body, margin: 0, lineHeight: "21px" }}>
              A real person reads every one of these. If we act on it you will see
              it show up in the Community.
            </p>
            <div style={{ marginTop: 26 }}>
              <Primary onClick={() => navigate("/community")}>Back To The Community</Primary>
            </div>
          </div>
        </Body>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <div style={{ padding: `10px ${PAD}px calc(12px + env(safe-area-inset-bottom))` }}>
          <Primary onClick={send} disabled={text.trim().length < 10}>Send</Primary>
        </div>
      }
    >
      <TopBar title="Suggest A Change" onBack={() => navigate(-1)} />
      <Body>
        <div style={{ padding: `18px ${PAD}px 30px` }}>
          <p style={{ margin: "0 0 18px", fontSize: 14, color: CC.body, lineHeight: "21px" }}>
            Tell us what would make the Community better. This goes to the 30 Sundays
            team, not to other travellers.
          </p>

          <p style={{ margin: "0 0 9px", fontSize: 13, fontWeight: 700, color: CC.ink }}>
            What Is This About
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {KINDS.map(k => {
              const on = kind === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => { setKind(k.id); track("community_suggestion_kind", { kind: k.id }); }}
                  style={{
                    padding: "8px 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: 700,
                    background: on ? CC.ink : CC.white,
                    color: on ? CC.white : CC.body,
                    border: `1px solid ${on ? CC.ink : CC.line}`,
                  }}
                >{k.label}</button>
              );
            })}
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX))}
            rows={7}
            placeholder="Tell us what you would change, and why."
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px 13px",
              borderRadius: 12, border: `1px solid ${CC.line}`, background: CC.white,
              fontFamily: "inherit", fontSize: 15, color: CC.ink, lineHeight: "22px",
              resize: "none", outline: "none",
            }}
          />
          <p style={{ margin: "5px 0 0", fontSize: 11.5, color: CC.soft, textAlign: "right" }}>
            {text.length} of {MAX}
          </p>

          <p style={{
            margin: "20px 0 0", fontSize: 12.5, fontStyle: "italic", color: CC.soft,
            lineHeight: "18px",
          }}>
            Anything about your own trip, your booking or a payment goes to your
            trip manager, who can actually fix it.
          </p>
        </div>
      </Body>
    </Screen>
  );
}
