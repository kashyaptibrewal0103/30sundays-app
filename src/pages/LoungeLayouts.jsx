import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, MessagesSquare, ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { getDest, questionsFor } from "../data/communityData";

// Where the two actions live: Ask, and the group chat.
//
// The rule underneath all four: the thumb zone is the cheapest real estate on
// a phone and the top corners are the dearest, so whatever a person does most
// belongs at the bottom. The argument is only about which of these two that is,
// and the honest answer changes over the life of the feature.

const OPTIONS = [
  {
    id: "ask-thumb", n: "A", name: "Ask in the thumb, chat in the header",
    tag: "Live now",
    theory: "This screen is the Questions screen, so its verb owns the thumb. The chat is a place you go rather than an action you take, so it gets a home in the chrome that survives scrolling.",
    cost: "The thing people open most sits in the hardest corner to reach.",
    headerChat: true, thumb: "ask",
  },
  {
    id: "chat-thumb", n: "B", name: "Chat in the thumb, Ask in the list",
    tag: "Frequency first",
    theory: "Reading beats writing by roughly a hundred to one in any Q and A. The chat is the daily habit, so it takes the easy corner and Ask sits beside the Questions heading.",
    cost: "Asking gets quieter exactly when the product needs questions most.",
    headerChat: false, thumb: "chat", askInline: true,
  },
  {
    id: "both", n: "C", name: "Both in the thumb",
    tag: "No compromise",
    theory: "A round chat button and an Ask pill, side by side. Nothing is demoted and nothing is hidden in the chrome.",
    cost: "Two floating objects over a scrolling list. Whichever is smaller gets read as secondary anyway, so the choice is only postponed.",
    headerChat: false, thumb: "both",
  },
  {
    id: "card-only", n: "D", name: "Ask in the thumb, chat as a card only",
    tag: "Quietest",
    theory: "No icon in the header at all. The chat is the card at the top of the entrance and nothing else, so the chrome stays empty and the page carries everything.",
    cost: "Scroll past the entrance and the chat is gone, unread and all.",
    headerChat: false, thumb: "ask",
  },
];

export default function LoungeLayouts() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);

  const d = getDest("thailand");
  const questions = questionsFor("thailand");

  return (
    <Screen>
      <TopBar
        title="Where the actions live"
        sub="Four placements, one rule"
        onBack={() => navigate("/community/thailand")}
      />
      <Body>
        <div style={{ padding: "14px 0 40px" }}>

          <div style={{ padding: `0 ${PAD}px` }}>
            <div style={{
              border: `1px solid ${CC.line}`, borderLeft: `3px solid ${CC.gold}`,
              borderRadius: 14, background: CC.white, padding: "14px 16px",
            }}>
              <p style={{
                fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
                textTransform: "uppercase", color: CC.goldInk, margin: 0,
              }}>How to decide</p>
              <p style={{ fontSize: 14, color: CC.ink, margin: "7px 0 0", lineHeight: "21px" }}>
                The thumb zone is the cheapest reach on a phone and the top corners
                are the dearest. Whatever a person does most belongs at the bottom.
              </p>
              <p style={{ fontSize: 13.5, color: CC.body, margin: "8px 0 0", lineHeight: "20px" }}>
                Which of the two that is changes over time. In the first months
                there is nothing to read, so the product needs questions and Ask
                earns the corner. Once the rooms are full, the chat is the daily
                return and it should take it. So this is not a permanent answer,
                it is a switch to flip on a number you can watch: chats opened per
                session against questions asked per session.
              </p>
              <p style={{ fontSize: 13.5, color: CC.body, margin: "8px 0 0", lineHeight: "20px" }}>
                The fixed row at the bottom is gone either way. It spent a full
                width strip on two counts that were already on the screen, and
                took a slice of the list with it.
              </p>
            </div>
          </div>

          {OPTIONS.map((o) => (
            <section key={o.id}>
              <div style={{ height: 6, background: CC.well, margin: "22px 0" }} />

              <div style={{ padding: `0 ${PAD}px 12px` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", background: CC.ink, color: "#fff",
                    display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
                  }}>{o.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: CC.ink }}>{o.name}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, background: CC.goldTint,
                    border: `1px solid ${CC.goldLine}`, fontSize: 10.5, fontWeight: 700, color: CC.goldInk,
                  }}>{o.tag}</span>
                </div>
                <p style={{ fontSize: 13, color: CC.body, margin: "8px 0 0", lineHeight: "19px" }}>
                  {o.theory}
                </p>
                <p style={{ fontSize: 13, color: CC.soft, margin: "6px 0 0", lineHeight: "19px" }}>
                  What it costs: {o.cost}
                </p>
              </div>

              <div style={{ padding: `0 ${PAD}px` }}>
                <Mock o={o} d={d} questions={questions} />
              </div>

              <div style={{ padding: `14px ${PAD}px 0` }}>
                <button onClick={() => setPicked(o.id)} style={{
                  width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                  border: `1px solid ${picked === o.id ? CC.goldLine : CC.line}`,
                  background: picked === o.id ? CC.goldTint : CC.white,
                  color: picked === o.id ? CC.goldInk : CC.ink,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  {picked === o.id ? <><Check size={16} /> Picked {o.n}</> : `Pick ${o.n}`}
                </button>
              </div>
            </section>
          ))}
        </div>
      </Body>
    </Screen>
  );
}

/* ─────────────────── A small screen, for comparing ─────────────────── */

function Mock({ o, d, questions }) {
  return (
    <div style={{
      position: "relative", height: 400, overflow: "hidden",
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
        borderBottom: `1px solid ${CC.line}`,
      }}>
        <ArrowLeft size={18} color={CC.ink} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
            Sunday Lounge
          </span>
          <span style={{ display: "block", fontSize: 11.5, color: CC.body }}>
            {d.name} · {d.month}
          </span>
        </span>
        {o.headerChat && (
          <span style={{
            position: "relative", width: 34, height: 34, borderRadius: "50%",
            background: CC.goldTint, display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <MessagesSquare size={16} color={CC.goldInk} />
            <span style={{
              position: "absolute", top: 5, right: 5, width: 7, height: 7,
              borderRadius: "50%", background: CC.gold, border: `1.5px solid ${CC.goldTint}`,
            }} />
          </span>
        )}
      </div>

      {/* The golden entrance */}
      <div style={{ background: CC.goldTint, padding: "13px 0 11px" }}>
        <p style={{
          fontSize: 13.5, fontWeight: 700, color: CC.ink, margin: "0 14px", lineHeight: "19px",
        }}>
          Ask {d.recent3m} travellers who visited {d.name} in the last 3 months
        </p>
        <div style={{ padding: "11px 14px 0" }}>
          <span style={{
            display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
            borderRadius: 12, background: CC.white,
            border: `1px solid ${CC.bubbleEdge}`, borderLeft: `3px solid ${CC.gold}`,
          }}>
            <MessagesSquare size={15} color={CC.gold} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: CC.ink }}>
                Group chat
              </span>
              <span style={{ display: "block", fontSize: 10.5, color: CC.body }}>
                {d.cohort.members} travellers going
              </span>
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: CC.body,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: CC.gold }} />
              3 new
            </span>
          </span>
          <span style={{
            display: "flex", alignItems: "center", gap: 6, marginTop: 8,
          }}>
            <ShieldCheck size={12} color={CC.soft} />
            <span style={{ fontSize: 11, color: CC.body, textDecoration: "underline", textUnderlineOffset: 2 }}>
              Lounge guidelines
            </span>
          </span>
        </div>
      </div>

      <div style={{ height: 6, background: CC.well }} />

      {/* The list */}
      <div style={{ padding: "13px 14px 0" }}>
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9,
        }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: CC.ink }}>Questions</span>
          {o.askInline ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 12.5, fontWeight: 700, color: CC.pink,
            }}><Plus size={13} /> Ask</span>
          ) : (
            <span style={{ fontSize: 10.5, color: CC.body }}>{d.questionsTotal} FAQs</span>
          )}
        </div>

        {questions.slice(0, 2).map(q => (
          <div key={q.id} style={{
            border: `1px solid ${CC.line}`, borderRadius: 12, padding: "11px 12px", marginBottom: 8,
          }}>
            <p style={{
              fontSize: 12.5, fontWeight: 600, color: CC.ink, margin: 0, lineHeight: "17px",
            }}>{q.title}</p>
            <p style={{ fontSize: 10.5, color: CC.body, margin: "6px 0 0" }}>
              {(q.answers || []).length} answers
            </p>
          </div>
        ))}
      </div>

      {/* The thumb zone */}
      <div style={{
        position: "absolute", right: 14, bottom: 14,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {(o.thumb === "chat" || o.thumb === "both") && (
          <span style={{
            position: "relative", width: 46, height: 46, borderRadius: "50%",
            background: CC.ink, display: "grid", placeItems: "center",
            boxShadow: "0 6px 18px rgba(37,67,66,0.28)",
          }}>
            <MessagesSquare size={19} color="#fff" />
            <span style={{
              position: "absolute", top: 8, right: 8, width: 8, height: 8,
              borderRadius: "50%", background: CC.gold, border: "1.5px solid #254342",
            }} />
          </span>
        )}
        {(o.thumb === "ask" || o.thumb === "both") && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7, height: 46,
            padding: "0 20px", borderRadius: 999, background: CC.pink, color: "#fff",
            fontSize: 14, fontWeight: 700, boxShadow: "0 6px 18px rgba(253,1,79,0.26)",
          }}>
            <Plus size={16} /> Ask
          </span>
        )}
      </div>

      {/* A hint that the list keeps going under the action */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 60,
        background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, #fff 70%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}
