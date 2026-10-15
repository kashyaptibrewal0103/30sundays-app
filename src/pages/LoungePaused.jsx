import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bookmark, ShieldCheck, ArrowLeft, ChevronDown, Plus, Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar, Sheet } from "../components/Gift/GiftUI";
import { PAD, QuestionCard } from "../components/Community/CommunityUI";
import { questionsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";
import {
  PausedBanner, PausedOnAsk, PausedSheetBody, PausedInline, PausedScreen,
  PausedMarker, PausedNotice, AppealBody, AppealSent, PAUSED_VARIANTS,
} from "../components/Community/PausedVariants";

// Posting paused, five ways, each one inside a real room so the cost of the
// space it takes is visible rather than described.
//
// The appeal is the same in all five and is live at the bottom: open it, write
// something, send it, and see what comes back.

export default function LoungePaused() {
  const navigate = useNavigate();
  const { answersFor } = useCommunity();
  const [picked, setPicked] = useState(null);
  const [sheet, setSheet] = useState(null);      // "why" | "appeal" | "sent"
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const qs = questionsFor("thailand").slice(0, 2);

  const openAppeal = () => { setText(""); setSheet("appeal"); };
  const send = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSheet("sent"); }, 600);
  };

  const Room = ({ children, ask }) => (
    <div style={{
      border: `1px solid ${CC.line}`, borderRadius: 18, overflow: "hidden",
      background: CC.white, position: "relative",
    }}>
      {/* The room's own bar, so each variant is judged against the real
          furniture rather than against a blank page. */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 12px", borderBottom: `1px solid ${CC.line}`,
      }}>
        <ArrowLeft size={18} color={CC.ink} />
        <span style={{
          flex: 1, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 16, fontWeight: 600, color: CC.ink,
        }}>Thailand Community <ChevronDown size={15} color={CC.soft} /></span>
        <Search size={16} color={CC.body} />
        <Bookmark size={15} color={CC.body} />
        <ShieldCheck size={14} color={CC.soft} />
      </div>

      {children}

      <div style={{ padding: `14px ${PAD}px 18px` }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: CC.ink, margin: "0 0 10px" }}>
          Questions
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {qs.map(q => (
            <QuestionCard key={q.id} q={q} answerCount={answersFor(q).length} onClick={() => {}} />
          ))}
        </div>
      </div>

      {ask}
    </div>
  );

  return (
    <Screen>
      <TopBar title="Posting Paused" sub="Five ways" onBack={() => navigate("/community")} />
      <Body>
        <div style={{ padding: `14px 0 44px` }}>
          <p style={{ fontSize: 13.5, color: CC.body, margin: `0 ${PAD}px 18px`, lineHeight: "20px" }}>
            Three blocked posts switch posting off. Reading carries on, and only our
            team turns it back on. The question each one answers: where does somebody
            learn this, and how loudly.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 26, padding: `0 ${PAD}px` }}>

            {/* 1. Banner */}
            <Option n={1} v={PAUSED_VARIANTS[0]} picked={picked} onPick={setPicked}>
              <Room ask={<GhostAsk />}>
                <PausedBanner onAppeal={openAppeal} />
              </Room>
            </Option>

            {/* 2. The Ask button */}
            <Option n={2} v={PAUSED_VARIANTS[1]} picked={picked} onPick={setPicked}>
              <Room ask={<PausedOnAsk onOpen={() => setSheet("why")} />}>
                <div style={{ height: 12 }} />
              </Room>
            </Option>

            {/* 3. Inline, where the composer was */}
            <Option n={3} v={PAUSED_VARIANTS[2]} picked={picked} onPick={setPicked}>
              <Room>
                <div style={{ padding: `12px ${PAD}px 0` }}>
                  <PausedInline onAppeal={openAppeal} />
                </div>
              </Room>
            </Option>

            {/* 4. Its own screen, then a marker */}
            <Option n={4} v={PAUSED_VARIANTS[3]} picked={picked} onPick={setPicked}>
              <div style={{
                border: `1px solid ${CC.line}`, borderRadius: 18, overflow: "hidden",
                background: CC.white, marginBottom: 10,
              }}>
                <PausedScreen onAppeal={openAppeal} onRead={() => {}} />
              </div>
              <p style={{ fontSize: 12, color: CC.soft, margin: "0 0 8px" }}>
                Every visit after that, only this:
              </p>
              <Room ask={<GhostAsk />}>
                <div style={{ padding: `12px ${PAD}px 0` }}>
                  <PausedMarker onOpen={() => setSheet("why")} />
                </div>
              </Room>
            </Option>

            {/* 5. Notifications only */}
            <Option n={5} v={PAUSED_VARIANTS[4]} picked={picked} onPick={setPicked}>
              <div style={{
                border: `1px solid ${CC.line}`, borderRadius: 18, overflow: "hidden",
                background: CC.white, marginBottom: 10,
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 800, color: CC.soft,
                  margin: `12px ${PAD}px 6px`,
                }}>Notifications</p>
                <PausedNotice onOpen={() => setSheet("why")} />
                <div style={{ padding: "13px 14px", display: "flex", gap: 11 }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: "50%", background: CC.tealTint, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13.5, color: CC.body, lineHeight: "19px" }}>
                    Aisha Rahman answered your question about the ferry
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: CC.soft, margin: "0 0 8px" }}>
                The room itself says nothing:
              </p>
              <Room ask={<GhostAsk />}>
                <div style={{ height: 12 }} />
              </Room>
            </Option>
          </div>
        </div>
      </Body>

      {sheet === "why" && (
        <Sheet title="Posting is paused" onClose={() => setSheet(null)}>
          <PausedSheetBody onAppeal={openAppeal} onClose={() => setSheet(null)} />
        </Sheet>
      )}
      {sheet === "appeal" && (
        <Sheet title="Tell us we got it wrong" onClose={() => setSheet(null)}>
          <AppealBody text={text} setText={setText} onSend={send} sending={sending} />
        </Sheet>
      )}
      {sheet === "sent" && (
        <Sheet title="" onClose={() => setSheet(null)}>
          <AppealSent />
        </Sheet>
      )}
    </Screen>
  );
}

// The Ask button as it looks when posting is off: gone, in every variant that
// does not use it to carry the message.
function GhostAsk() {
  return (
    <div style={{
      position: "absolute", right: 14, bottom: 14,
      display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44,
      padding: "0 18px", borderRadius: 999, border: `1px dashed ${CC.line}`,
      fontSize: 13.5, fontWeight: 700, color: CC.soft, background: CC.white,
    }}>
      <Plus size={15} /> Ask, hidden
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
        fontSize: 15.5, fontWeight: 700, color: CC.ink, margin: "0 0 3px",
        letterSpacing: "-0.1px",
      }}>{v.name}</h2>
      <p style={{ fontSize: 13, color: CC.body, margin: "0 0 10px", lineHeight: "19px" }}>
        {v.note}
      </p>
      {children}
    </div>
  );
}
