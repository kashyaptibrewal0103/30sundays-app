import { useNavigate } from "react-router-dom";
import { BellOff, Lock } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { useDwell } from "../components/Community/useDwell";

// What reaches you, and what does not.
//
// Four switches, not fourteen. A setting for every kind of notification reads
// as generous and behaves as a maze, so these are grouped by what a traveller
// would actually want to stop hearing about.

const ROWS = [
  { key: "answers", label: "Answers To Your Questions",
    sub: "Someone replies to something you asked" },
  { key: "helpful", label: "When Your Answer Helps",
    sub: "Your answer gets marked most helpful" },
  { key: "rooms", label: "Your Rooms",
    sub: "A room opens after you book, or closes after your trip" },
];

export default function CommunityNotifySettings() {
  const navigate = useNavigate();
  const { notify, setNotify, mutedQuestions, toggleMute } = useCommunity();
  const muted = Object.entries(mutedQuestions || {});

  useDwell("notify_settings", { mutedCount: muted.length });

  return (
    <Screen>
      <TopBar title="Notification Settings" onBack={() => navigate(-1)} />
      <Body>
        <div style={{ padding: `16px 0 40px` }}>

          <div style={{ padding: `0 ${PAD}px` }}>
            {ROWS.map(r => (
              <Row
                key={r.key} label={r.label} sub={r.sub}
                on={!!notify[r.key]} onChange={v => setNotify(r.key, v)}
              />
            ))}

            {/* Not a choice. If we take something down we have to be able to
                tell you, otherwise the post just vanishes. */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
              borderBottom: `1px solid ${CC.line}`,
            }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
                  Your Posts
                </span>
                <span style={{ display: "block", marginTop: 2, fontSize: 12, color: CC.soft, lineHeight: "17px" }}>
                  When a post goes live, is held, or is taken down
                </span>
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
                fontSize: 11.5, fontWeight: 700, color: CC.soft,
              }}><Lock size={12} color={CC.soft} /> Always On</span>
            </div>
          </div>

          {/* Threads somebody stopped wanting. Empty for most people, which is
              why it only appears once there is something in it. */}
          {muted.length > 0 && (
            <div style={{ marginTop: 28, padding: `0 ${PAD}px` }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: CC.ink }}>
                Muted Questions
              </p>
              {muted.map(([id, title]) => (
                <div key={id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "11px 0",
                  borderBottom: `1px solid ${CC.line}`,
                }}>
                  <BellOff size={15} color={CC.soft} style={{ flexShrink: 0 }} />
                  <span style={{
                    flex: 1, minWidth: 0, fontSize: 13.5, color: CC.body,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{title}</span>
                  <button onClick={() => toggleMute(id)} style={{
                    border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: 700, color: CC.teal, padding: 0, flexShrink: 0,
                  }}>Unmute</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Body>
    </Screen>
  );
}

function Row({ label, sub, on, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "14px 0",
      borderBottom: `1px solid ${CC.line}`,
    }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
          {label}
        </span>
        <span style={{ display: "block", marginTop: 2, fontSize: 12, color: CC.soft, lineHeight: "17px" }}>
          {sub}
        </span>
      </span>
      <Toggle on={on} onChange={onChange} label={label} />
    </div>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch" aria-checked={on} aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: 46, height: 28, borderRadius: 999, border: "none", flexShrink: 0,
        background: on ? CC.teal : CC.line, cursor: "pointer", padding: 3,
        display: "flex", justifyContent: on ? "flex-end" : "flex-start",
        transition: "background 0.18s ease",
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: "50%", background: CC.white,
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)", display: "block",
      }} />
    </button>
  );
}
