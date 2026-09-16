import { useState, useEffect } from "react";
import {
  MessagesSquare, ChevronRight, Search, ArrowRight, MessageCircle, Plus,
} from "lucide-react";
import { CC } from "./tokens";
import { PAD, TravellerMark } from "./CommunityUI";
import { ago } from "../../data/communityData";

// Seven ways the Lounge could look. Not seven layouts: the blocks are the same
// in all of them (a way into the chat, a way to search, the questions). What
// changes is the personality, and personality is carried by three things only:
// type, shape, and where the colour sits.
//
// The rule they all keep: one colour, one job. Where an option breaks that on
// purpose, it is written down as the cost.

const wrap = { padding: `0 ${PAD}px` };

// Tags, coloured, for the options that use colour as a code.
const TAG_TINT = {
  Weather: [CC.goldTint, CC.goldLine, CC.goldInk],
  Boats: [CC.tealTint, CC.tealLine, CC.tealInk],
  Transport: [CC.pinkTint, CC.pinkLine, CC.pinkInk],
  Money: [CC.mist, CC.mistLine, CC.ink],
  Food: [CC.goldTint, CC.goldLine, CC.goldInk],
  Stays: [CC.tealTint, CC.tealLine, CC.tealInk],
};
const tintOf = (t) => TAG_TINT[t] || [CC.well, CC.line, CC.body];

// One answer is not "1 answers".
const answerWord = (n) => `${n} ${n === 1 ? "answer" : "answers"}`;

/* ══════════ 1. Editorial ══════════ */

function Editorial({ d, qs, countOf }) {
  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ ...wrap, paddingTop: 18 }}>
        <p style={{
          margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "2.4px",
          color: CC.soft, textTransform: "uppercase",
        }}>Sunday Lounge</p>
        <h1 style={{
          margin: "6px 0 0", fontSize: 38, lineHeight: "38px", fontWeight: 800,
          color: CC.ink, letterSpacing: "-1.6px",
        }}>{d.name}</h1>
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          borderTop: `2px solid ${CC.ink}`, marginTop: 12, paddingTop: 8,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: CC.ink, letterSpacing: "0.4px" }}>
            {d.month.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: CC.body }}>{d.questionsTotal} answered</span>
        </div>
      </div>

      <button style={{
        ...wrap, width: "100%", display: "flex", alignItems: "center", gap: 10,
        border: "none", borderBottom: `1px solid ${CC.line}`, background: "none",
        padding: `16px ${PAD}px`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color: CC.ink, letterSpacing: "-0.2px" }}>
          Group chat
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: CC.body, marginTop: 3 }}>
            {d.cohort.members} travellers going in October
          </span>
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12.5, fontWeight: 700, color: CC.goldInk,
        }}>
          <Dot /> 3 new
        </span>
        <ArrowRight size={17} color={CC.ink} />
      </button>

      <div style={{ ...wrap, padding: `20px ${PAD}px 10px` }}>
        <SearchLine name={d.name} plain />
      </div>

      {qs.map((q, i) => (
        <button key={q.id} style={{
          display: "flex", gap: 14, width: "100%", textAlign: "left", background: "none",
          border: "none", borderTop: `1px solid ${CC.line}`, padding: `15px ${PAD}px`,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <span style={{
            fontSize: 26, fontWeight: 800, color: CC.line, lineHeight: "24px",
            letterSpacing: "-1px", flexShrink: 0, width: 34,
          }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              display: "block", fontSize: 16, fontWeight: 700, color: CC.ink,
              lineHeight: "21px", letterSpacing: "-0.3px",
            }}>{q.title}</span>
            <span style={{
              display: "block", marginTop: 7, fontSize: 10.5, fontWeight: 800,
              letterSpacing: "1.4px", textTransform: "uppercase", color: CC.soft,
            }}>
              {(q.tags || [])[0]} &nbsp;·&nbsp; {q.author?.name} &nbsp;·&nbsp;{" "}
              {countOf(q) > 0 ? answerWord(countOf(q)) : "Unanswered"}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ══════════ 2. Conversation ══════════ */

function Conversation({ d, qs, countOf }) {
  return (
    <div style={{ padding: `16px 0 30px`, background: CC.well }}>
      <div style={{ ...wrap }}>
        <button style={{
          width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
          background: CC.white, border: `1px solid ${CC.line}`, borderRadius: 18,
          padding: "13px 15px", display: "flex", alignItems: "center", gap: 11,
        }}>
          <span style={{
            width: 38, height: 38, borderRadius: "50%", background: CC.tealTint,
            display: "grid", placeItems: "center", flexShrink: 0,
          }}><MessagesSquare size={18} color={CC.teal} /></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
              Group chat
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <Typing />
              <span style={{ fontSize: 12.5, color: CC.body }}>
                {d.cohort.members} travellers going
              </span>
            </span>
          </span>
          <span style={{
            minWidth: 22, height: 22, borderRadius: 11, background: CC.gold, color: "#fff",
            display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, padding: "0 6px",
          }}>3</span>
        </button>
      </div>

      <div style={{ ...wrap, paddingTop: 20, paddingBottom: 10 }}>
        <SearchLine name={d.name} />
      </div>

      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 16 }}>
        {qs.map(q => (
          <div key={q.id}>
            <button style={{
              position: "relative", display: "block", width: "100%", textAlign: "left",
              cursor: "pointer", fontFamily: "inherit", background: CC.white,
              border: `1px solid ${CC.line}`, borderRadius: "18px 18px 18px 4px",
              padding: "13px 15px",
            }}>
              <span style={{
                display: "block", fontSize: 15.5, fontWeight: 600, color: CC.ink,
                lineHeight: "21px", letterSpacing: "-0.1px",
              }}>{q.title}</span>
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: 7, margin: "7px 0 0 6px",
            }}>
              <TravellerMark name={q.author?.name} size={18} />
              <span style={{ fontSize: 12, color: CC.body }}>
                {q.author?.name} · {ago(q.minsAgo)}
              </span>
              <span style={{ marginLeft: "auto" }}>
                {countOf(q) > 0
                  ? <Stack n={countOf(q)} />
                  : (
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: CC.goldInk,
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}><Dot /> Be the first</span>
                  )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Two half bubbles behind a count, so the answers look like they are stacked
// under the question rather than counted next to it.
function Stack({ n }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span style={{
        width: 14, height: 18, borderRadius: "9px 0 0 9px", background: CC.mist,
        border: `1px solid ${CC.mistLine}`, borderRight: "none",
      }} />
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4, height: 22, padding: "0 9px 0 7px",
        borderRadius: "0 11px 11px 11px", background: CC.white, border: `1px solid ${CC.line}`,
        fontSize: 12, fontWeight: 700, color: CC.ink, marginLeft: -6,
      }}>
        <MessageCircle size={11} color={CC.body} /> {n}
      </span>
    </span>
  );
}

function Typing() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: "50%", background: CC.teal,
          animation: `loungeBlink 1.2s ${i * 0.18}s infinite ease-in-out`,
        }} />
      ))}
    </span>
  );
}

/* ══════════ 3. Tag tabs ══════════ */

function TagTabs({ d, qs, countOf }) {
  return (
    <div style={{ padding: "16px 0 30px" }}>
      <div style={wrap}>
        <button style={{
          width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
          background: CC.white, border: `2px solid ${CC.ink}`, borderRadius: 16,
          boxShadow: `4px 4px 0 ${CC.gold}`, padding: "13px 15px",
          display: "flex", alignItems: "center", gap: 11,
        }}>
          <MessagesSquare size={19} color={CC.ink} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: CC.ink }}>
              Group chat
            </span>
            <span style={{ display: "block", fontSize: 12.5, color: CC.body, marginTop: 2 }}>
              {d.cohort.members} travellers going in October
            </span>
          </span>
          <span style={{
            fontSize: 12, fontWeight: 800, color: CC.ink, background: CC.goldTint,
            border: `1.5px solid ${CC.ink}`, borderRadius: 999, padding: "2px 9px",
          }}>3 new</span>
        </button>
      </div>

      <div style={{ ...wrap, padding: `20px ${PAD}px 16px` }}>
        <SearchLine name={d.name} hard />
      </div>

      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 18 }}>
        {qs.map(q => {
          const tag = (q.tags || [])[0] || "Other";
          const [bg, line, ink] = tintOf(tag);
          return (
            <div key={q.id} style={{ position: "relative" }}>
              <span style={{
                position: "absolute", top: -11, left: 14, zIndex: 2,
                padding: "2px 11px", borderRadius: "8px 8px 0 0",
                background: bg, border: `1.5px solid ${CC.ink}`, borderBottom: "none",
                fontSize: 10.5, fontWeight: 800, color: ink, letterSpacing: "0.4px",
                textTransform: "uppercase",
              }}>{tag}</span>

              <button style={{
                display: "block", width: "100%", textAlign: "left", cursor: "pointer",
                fontFamily: "inherit", background: CC.white,
                border: `1.5px solid ${CC.ink}`, borderRadius: 14,
                boxShadow: `3px 3px 0 ${line}`, padding: "16px 14px 13px",
              }}>
                <span style={{
                  display: "block", fontSize: 15.5, fontWeight: 700, color: CC.ink,
                  lineHeight: "21px", letterSpacing: "-0.15px",
                }}>{q.title}</span>
                <span style={{
                  display: "flex", alignItems: "center", gap: 8, marginTop: 11,
                }}>
                  <TravellerMark name={q.author?.name} size={20} />
                  <span style={{ flex: 1, fontSize: 12.5, color: CC.body }}>{q.author?.name}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 800,
                    color: countOf(q) > 0 ? CC.ink : CC.goldInk,
                  }}>
                    {countOf(q) > 0 ? answerWord(countOf(q)) : "Needs an answer"}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════ 4. Stamps and tickets ══════════ */

function Tickets({ d, qs, countOf }) {
  return (
    <div style={{ padding: "16px 0 30px" }}>
      <div style={wrap}>
        <Ticket>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <MessagesSquare size={19} color={CC.teal} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "1.6px",
                color: CC.soft, textTransform: "uppercase",
              }}>Boarding group</span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink, marginTop: 3 }}>
                {d.cohort.members} travellers going in October
              </span>
            </span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12.5, fontWeight: 700, color: CC.goldInk,
            }}><Dot /> 3</span>
          </div>
        </Ticket>
      </div>

      <div style={{ ...wrap, padding: `18px ${PAD}px 14px` }}>
        <SearchLine name={d.name} />
      </div>

      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 12 }}>
        {qs.map(q => (
          <Ticket key={q.id}>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: "block", fontSize: 15.5, fontWeight: 700, color: CC.ink,
                  lineHeight: "21px", letterSpacing: "-0.15px", paddingRight: 6,
                }}>{q.title}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10 }}>
                  <TravellerMark name={q.author?.name} size={19} />
                  <span style={{ fontSize: 12, color: CC.body }}>
                    {q.author?.name} · {ago(q.minsAgo)}
                  </span>
                </span>
              </span>
              <span style={{
                flexShrink: 0, width: 54, textAlign: "center", alignSelf: "flex-start",
                border: `1.5px dashed ${countOf(q) > 0 ? CC.tealLine : CC.goldLine}`,
                borderRadius: 8, padding: "5px 0",
                transform: "rotate(-4deg)",
              }}>
                <span style={{
                  display: "block", fontSize: 17, fontWeight: 800,
                  color: countOf(q) > 0 ? CC.tealInk : CC.goldInk, lineHeight: "18px",
                }}>{countOf(q) || "?"}</span>
                <span style={{
                  display: "block", fontSize: 8.5, fontWeight: 800, letterSpacing: "0.8px",
                  color: countOf(q) > 0 ? CC.tealInk : CC.goldInk, textTransform: "uppercase",
                }}>{countOf(q) === 1 ? "answer" : countOf(q) > 0 ? "answers" : "open"}</span>
              </span>
            </div>
          </Ticket>
        ))}
      </div>
    </div>
  );
}

// A card with a punched left edge, the way a torn stub reads.
function Ticket({ children }) {
  return (
    <div style={{
      position: "relative", background: CC.white, border: `1px solid ${CC.line}`,
      borderRadius: 14, padding: "14px 14px 13px 22px", overflow: "hidden",
    }}>
      <span style={{
        position: "absolute", left: 11, top: 12, bottom: 12,
        borderLeft: `1.5px dashed ${CC.mistLine}`,
      }} />
      <span style={{
        position: "absolute", left: 5, top: -7, width: 12, height: 12, borderRadius: "50%",
        background: CC.white, border: `1px solid ${CC.line}`,
      }} />
      <span style={{
        position: "absolute", left: 5, bottom: -7, width: 12, height: 12, borderRadius: "50%",
        background: CC.white, border: `1px solid ${CC.line}`,
      }} />
      {children}
    </div>
  );
}

/* ══════════ 5. Colour zones ══════════ */

function Zones({ d, qs, countOf }) {
  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ background: CC.bubbleDeep, padding: `18px ${PAD}px` }}>
        <p style={{
          margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "1.6px",
          color: CC.goldInk, textTransform: "uppercase",
        }}>Going in October</p>
        <button style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%", marginTop: 8,
          background: "none", border: "none", padding: 0, cursor: "pointer",
          fontFamily: "inherit", textAlign: "left",
        }}>
          <span style={{
            flex: 1, fontSize: 19, fontWeight: 800, color: CC.ink, letterSpacing: "-0.4px",
            lineHeight: "24px",
          }}>
            {d.cohort.members} travellers are in the group chat
          </span>
          <ChevronRight size={20} color={CC.ink} />
        </button>
        <p style={{
          margin: "8px 0 0", fontSize: 13, fontWeight: 700, color: CC.goldInk,
          display: "flex", alignItems: "center", gap: 6,
        }}><Dot /> 3 new messages</p>
      </div>

      <div style={{ background: CC.mist, padding: `14px ${PAD}px` }}>
        <SearchLine name={d.name} onMist />
      </div>

      <div style={{ padding: `18px ${PAD}px 0` }}>
        <h2 style={{
          margin: "0 0 12px", fontSize: 17, fontWeight: 800, color: CC.ink, letterSpacing: "-0.2px",
        }}>Questions</h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {qs.map((q, i) => (
            <button key={q.id} style={{
              display: "block", width: "100%", textAlign: "left", cursor: "pointer",
              fontFamily: "inherit", background: "none", border: "none",
              borderTop: i === 0 ? "none" : `1px solid ${CC.line}`, padding: "14px 0",
            }}>
              <span style={{
                display: "block", fontSize: 15.5, fontWeight: 700, color: CC.ink,
                lineHeight: "21px", letterSpacing: "-0.15px",
              }}>{q.title}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
                <TravellerMark name={q.author?.name} size={19} />
                <span style={{ flex: 1, fontSize: 12.5, color: CC.body }}>{q.author?.name}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: countOf(q) > 0 ? CC.body : CC.goldInk,
                }}>
                  {countOf(q) > 0 ? answerWord(countOf(q)) : "Needs an answer"}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════ 6. One big number ══════════ */

const TICKER = [
  "Meera Iyer asked about the ferry to Koh Tao",
  "Arjun Nair answered a question about cash",
  "Farah Sheikh asked what to pack for October",
  "Nikhil Rao answered a question about Phi Phi",
];

function BigNumber({ d, qs, countOf }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % TICKER.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ paddingBottom: 30 }}>
      <div style={{ ...wrap, paddingTop: 26, paddingBottom: 20 }}>
        <p style={{
          margin: 0, fontSize: 64, fontWeight: 800, color: CC.ink,
          letterSpacing: "-3.4px", lineHeight: "58px",
        }}>{d.questionsTotal}</p>
        <p style={{
          margin: "10px 0 0", fontSize: 17, fontWeight: 600, color: CC.body,
          lineHeight: "23px", letterSpacing: "-0.2px", maxWidth: 280,
        }}>
          questions about {d.name}, answered by travellers who have been.
        </p>

        <div style={{
          marginTop: 16, height: 20, overflow: "hidden", position: "relative",
        }}>
          <p key={i} style={{
            margin: 0, fontSize: 12.5, color: CC.tealInk, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 7,
            animation: "loungeRise 0.45s ease-out",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: CC.teal, flexShrink: 0,
            }} />
            {TICKER[i]}
          </p>
        </div>
      </div>

      <div style={{ ...wrap, paddingBottom: 16 }}>
        <SearchLine name={d.name} />
      </div>

      <button style={{
        display: "flex", alignItems: "center", gap: 9, width: "100%",
        padding: `13px ${PAD}px`, background: "none", cursor: "pointer", fontFamily: "inherit",
        border: "none", borderTop: `1px solid ${CC.line}`, borderBottom: `1px solid ${CC.line}`,
        textAlign: "left",
      }}>
        <MessagesSquare size={17} color={CC.body} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: CC.ink }}>
          Group chat
        </span>
        <span style={{
          fontSize: 12.5, fontWeight: 700, color: CC.goldInk,
          display: "inline-flex", alignItems: "center", gap: 6,
        }}><Dot /> 3 new</span>
        <ChevronRight size={16} color={CC.soft} />
      </button>

      <div style={{ padding: `4px ${PAD}px 0` }}>
        {qs.map(q => (
          <button key={q.id} style={{
            display: "block", width: "100%", textAlign: "left", cursor: "pointer",
            fontFamily: "inherit", background: "none", border: "none",
            borderBottom: `1px solid ${CC.line}`, padding: "15px 0",
          }}>
            <span style={{
              display: "block", fontSize: 15.5, fontWeight: 600, color: CC.ink,
              lineHeight: "21px", letterSpacing: "-0.15px",
            }}>{q.title}</span>
            <span style={{
              display: "block", marginTop: 6, fontSize: 12, color: CC.soft,
            }}>
              {q.author?.name} · {countOf(q) > 0 ? answerWord(countOf(q)) : "no answers yet"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════ 7. Pinboard ══════════ */

function Pinboard({ d, qs, countOf }) {
  const left = qs.filter((_, i) => i % 2 === 0);
  const right = qs.filter((_, i) => i % 2 === 1);
  return (
    <div style={{ background: CC.well, padding: `16px 0 30px` }}>
      <div style={wrap}>
        <button style={{
          width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
          background: CC.white, border: `1px solid ${CC.line}`, borderRadius: 14,
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <MessagesSquare size={17} color={CC.gold} />
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
            Group chat
            <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: CC.body, marginTop: 2 }}>
              {d.cohort.members} travellers going
            </span>
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, color: CC.goldInk,
            display: "inline-flex", alignItems: "center", gap: 5,
          }}><Dot /> 3</span>
        </button>
      </div>

      <div style={{ ...wrap, padding: `16px ${PAD}px 14px` }}>
        <SearchLine name={d.name} onMist />
      </div>

      <div style={{ ...wrap, display: "flex", gap: 10, alignItems: "flex-start" }}>
        {[left, right].map((col, ci) => (
          <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            {col.map(q => {
              const [bg, line, ink] = tintOf((q.tags || [])[0]);
              return (
                <button key={q.id} style={{
                  position: "relative", display: "block", width: "100%", textAlign: "left",
                  cursor: "pointer", fontFamily: "inherit", background: CC.white,
                  border: `1px solid ${CC.line}`, borderRadius: 12, padding: "12px 12px 11px",
                  overflow: "hidden",
                }}>
                  <span style={{
                    position: "absolute", top: 0, right: 0, width: 26, height: 26,
                    background: bg, clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                  }} />
                  <span style={{
                    display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.8px",
                    textTransform: "uppercase", color: ink,
                  }}>{(q.tags || [])[0]}</span>
                  <span style={{
                    display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
                    overflow: "hidden", marginTop: 6,
                    fontSize: 14, fontWeight: 700, color: CC.ink, lineHeight: "19px",
                    letterSpacing: "-0.1px",
                  }}>{q.title}</span>
                  <span style={{
                    display: "flex", alignItems: "center", gap: 6, marginTop: 10,
                  }}>
                    <TravellerMark name={q.author?.name} size={17} />
                    <span style={{
                      flex: 1, minWidth: 0, fontSize: 11, color: CC.soft,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{String(q.author?.name || "").split(" ")[0]}</span>
                    <span style={{
                      minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px",
                      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800,
                      background: countOf(q) > 0 ? CC.well : CC.goldTint,
                      color: countOf(q) > 0 ? CC.body : CC.goldInk,
                    }}>{countOf(q) || "?"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════ Shared small parts ══════════ */

function Dot() {
  return <span style={{
    width: 7, height: 7, borderRadius: "50%", background: CC.gold, display: "inline-block",
  }} />;
}

function SearchLine({ name, plain, hard, onMist }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 9, width: "100%", height: 44,
      padding: "0 13px", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      borderRadius: hard ? 12 : plain ? 0 : 12,
      background: plain ? "none" : CC.white,
      border: plain ? "none" : hard ? `1.5px solid ${CC.ink}` : `1px solid ${onMist ? CC.mistLine : CC.line}`,
      borderBottom: plain ? `1.5px solid ${CC.ink}` : undefined,
    }}>
      <Search size={16} color={plain || hard ? CC.ink : CC.soft} style={{ flexShrink: 0 }} />
      <span style={{
        fontSize: 14.5, color: plain || hard ? CC.body : CC.soft,
        fontWeight: plain || hard ? 600 : 400,
      }}>Search {name} questions</span>
    </button>
  );
}

export const STYLE_DIRECTIONS = [
  {
    id: "editorial", n: 1, name: "Editorial", tag: "type does the work", Comp: Editorial,
    note: "No cards at all. A masthead, a heavy rule, and questions as numbered entries on hairlines. The energy comes from the size jump between the destination, the index numbers and the small caps.",
    cost: "Nothing looks tappable in the usual way, so the first tap has to be learned. It is handsome rather than playful, so if the room feels cold this will not warm it.",
  },
  {
    id: "chat", n: 2, name: "Conversation", tag: "feels alive", Comp: Conversation,
    note: "The whole feed reads as a thread. Questions are bubbles with a corner cut, the asker sits under each one like a chat byline, and answers appear as a small stack behind the count. The chat card has live typing dots.",
    cost: "Bubbles promise a reply in minutes. Questions here can sit for a day, so the shape writes a cheque the room may not cash on week one.",
  },
  {
    id: "tabs", n: 3, name: "Tag tabs", tag: "playful, physical", Comp: TagTabs,
    note: "Every card is a file with its subject on a tab, hard black outlines and a solid offset shadow. Scanning by subject happens without reading, and the shapes have obvious personality.",
    cost: "It spends every colour on decoration. Once gold is a tag, gold cannot mean attention, so the unanswered signal has to find another way to stand out.",
  },
  {
    id: "ticket", n: 4, name: "Stamps and tickets", tag: "travel native", Comp: Tickets,
    note: "Cards as torn stubs: a punched left edge, a dashed spine, and the answer count as a stamp on the right. It is the only option whose personality comes from the category the product is in.",
    cost: "A gimmick on a repeated row is charming for four cards and wallpaper by twenty. The stamp also fixes a width the count has to live inside.",
  },
  {
    id: "zones", n: 5, name: "Colour zones", tag: "boldest", Comp: Zones,
    note: "Full width bands instead of cards. Gold is the chat, mist is the search strip, white is the questions. No dividers needed because the ground does the separating, and the chat headline is a fact rather than a label.",
    cost: "Large fills are what got taken out last time. It also spends the whole colour budget above the fold, so everything below it is flat by comparison.",
  },
  {
    id: "number", n: 6, name: "One big moment", tag: "quietest", Comp: BigNumber,
    note: "Almost nothing on screen, then one number at 64px and a live line underneath that changes every few seconds. Movement carries the interest, so the rest can stay plain.",
    cost: "The number is the vanity figure, and it is at its weakest in launch week when it should be biggest. The ticker also needs real traffic or it loops visibly.",
  },
  {
    id: "board", n: 7, name: "Pinboard", tag: "densest", Comp: Pinboard,
    note: "Two columns of short notes with a folded corner in the subject colour. Six questions are on screen at once instead of three, so the room looks busy immediately.",
    cost: "Half width means four lines of title, and these questions are long. Anything that does not fit gets cut, which hides the detail that makes a question worth opening. Only first names fit.",
  },
];
