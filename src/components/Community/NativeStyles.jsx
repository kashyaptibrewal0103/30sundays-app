import {
  MessagesSquare, ChevronRight, Search, SlidersHorizontal, MessageCircle,
  Zap, CornerUpLeft, ThumbsUp,
} from "lucide-react";
import { CC } from "./tokens";
import { PAD, TravellerMark } from "./CommunityUI";
import { ago } from "../../data/communityData";
import { destData } from "../../data";

// Six ways to make the Lounge look like the rest of the app rather than like a
// forum bolted on. Every one of these borrows a pattern that is already
// shipping somewhere in the prototype, so none of them needs a new idea to be
// learned.
//
// What the app already does, in its own words:
//   Hotel listing   rows on hairlines, no cards, a 120x100 photo on the left,
//                   a bold two line name, then a stack of short grey facts,
//                   the good news in green, a chip strip pinned at the bottom
//                   with a sliders button on the end
//   Itinerary day   a card with a photo, a small caps kicker (DAY 2 · UBUD),
//                   outline pills with a filled leading icon for the signals,
//                   and a pink text action at the foot (Change day plan)
//   Everywhere      · as the separator, 11px grey for detail, a chevron for
//                   anything that opens

const wrap = { padding: `0 ${PAD}px` };

// The app's own colours, not the Lounge's, because the point is to match.
const APP = {
  head: "#181E4C", sub: "#5A5F7D", faint: "#8E93AE", div: "#EAECF5",
  good: "#027A48", goodBg: "#ECFDF3",
  warn: "#B54708", warnBg: "#FFFAEB",
  pink: "#FD014F",
};

const IMGS = destData.Thailand?.actImgs || [];

/* ══════════ The pieces the app already owns ══════════ */

// DAY 2 · UBUD, and here BOATS · 2 DAYS AGO.
function Kicker({ children }) {
  return (
    <p style={{
      margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: "0.9px",
      color: APP.faint, textTransform: "uppercase",
    }}>{children}</p>
  );
}

// The day card's pill: white ground, a tinted hairline, a filled leading icon.
function Pill({ icon: Icon, tone = "good", children }) {
  const col = tone === "warn" ? APP.warn : tone === "flat" ? APP.sub : APP.good;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: "#fff", border: `1px solid ${col}44`, color: col,
    }}>
      <Icon size={11} color={col} fill={col} strokeWidth={0} /> {children}
    </span>
  );
}

// Change day plan, in pink, with its icon. The app's in-card action.
function TextAction({ icon: Icon = CornerUpLeft, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 13, fontWeight: 700, color: APP.pink,
    }}>
      <Icon size={14} /> {children}
    </span>
  );
}

// The good news line at the foot of a hotel row.
function StatusLine({ n }) {
  return n > 0 ? (
    <span style={{ fontSize: 11, fontWeight: 600, color: APP.good }}>
      {n} {n === 1 ? "answer" : "answers"} from travellers
    </span>
  ) : (
    <span style={{ fontSize: 11, fontWeight: 600, color: APP.warn }}>
      Needs an answer
    </span>
  );
}

// The chat, in the shape the app uses for anything that opens a screen.
function ChatRow({ d, tone = "plain" }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", cursor: "pointer",
      fontFamily: "inherit", textAlign: "left", background: "#fff",
      border: tone === "card" ? `1px solid ${APP.div}` : "none",
      borderBottom: tone === "card" ? `1px solid ${APP.div}` : `1px solid ${APP.div}`,
      borderRadius: tone === "card" ? 14 : 0,
      padding: tone === "card" ? "12px 14px" : `14px ${PAD}px`,
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: 10, background: APP.goodBg, flexShrink: 0,
        display: "grid", placeItems: "center",
      }}><MessagesSquare size={18} color={APP.good} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: APP.head }}>
          Group chat
        </span>
        <span style={{ display: "block", fontSize: 11.5, color: APP.sub, marginTop: 2 }}>
          {d.cohort.members} travellers going in October
        </span>
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: APP.warn, flexShrink: 0 }}>
        3 new
      </span>
      <ChevronRight size={18} color={APP.faint} style={{ flexShrink: 0 }} />
    </button>
  );
}

function SearchBar({ name }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 9, width: "100%", height: 42,
      padding: "0 12px", borderRadius: 10, background: "#fff",
      border: `1px solid ${APP.div}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <Search size={16} color={APP.faint} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: APP.faint }}>Search {name} questions</span>
    </button>
  );
}

// The hotel listing's own furniture: chips floating over the list, with the
// sliders button held apart on the right.
function ChipStrip({ tags }) {
  return (
    <div style={{
      position: "sticky", bottom: 0, zIndex: 5, background: "#fff",
      borderTop: `1px solid ${APP.div}`, padding: `10px ${PAD}px`,
      display: "flex", alignItems: "center", gap: 8, overflowX: "auto", scrollbarWidth: "none",
    }}>
      {tags.slice(0, 4).map(t => (
        <span key={t} style={{
          flexShrink: 0, padding: "7px 13px", borderRadius: 999, background: "#fff",
          border: `1px solid ${APP.div}`, fontSize: 12.5, fontWeight: 600, color: APP.head,
        }}>{t}</span>
      ))}
      <span style={{
        flexShrink: 0, marginLeft: "auto", width: 38, height: 34, borderRadius: 999,
        border: `1px solid ${APP.div}`, display: "grid", placeItems: "center", background: "#fff",
      }}><SlidersHorizontal size={15} color={APP.head} /></span>
    </div>
  );
}

function Head({ children, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
      gap: 10, padding: `0 ${PAD}px`, marginBottom: 10,
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: APP.head, margin: 0 }}>{children}</h2>
      {right && <span style={{ fontSize: 11.5, color: APP.sub }}>{right}</span>}
    </div>
  );
}

/* ══════════ 1. Hotel rows ══════════ */

function HotelRows({ d, qs, countOf, tags }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
      <ChatRow d={d} />
      <div style={{ ...wrap, padding: `14px ${PAD}px 12px` }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>

      <div style={{ ...wrap, flex: 1 }}>
        {qs.map((q, i) => (
          <button key={q.id} style={{
            display: "block", width: "100%", textAlign: "left", cursor: "pointer",
            fontFamily: "inherit", background: "none", border: "none",
            borderBottom: i < qs.length - 1 ? `1px solid ${APP.div}` : "none",
            padding: "14px 0",
          }}>
            <span style={{
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden", fontSize: 14, fontWeight: 700, color: APP.head,
              lineHeight: "19px", marginBottom: 4,
            }}>{q.title}</span>
            <span style={{ display: "block", fontSize: 12, color: APP.sub, marginBottom: 4 }}>
              {(q.tags || [])[0]} : {q.author?.name}
            </span>
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            }}>
              <StatusLine n={countOf(q)} />
              <span style={{ fontSize: 11, color: APP.faint }}>{ago(q.minsAgo)}</span>
            </span>
          </button>
        ))}
      </div>

      <ChipStrip tags={tags} />
    </div>
  );
}

/* ══════════ 2. Day cards ══════════ */

function DayCards({ d, qs, countOf }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ ...wrap, paddingTop: 14, paddingBottom: 14 }}>
        <ChatRow d={d} tone="card" />
      </div>
      <div style={{ ...wrap, paddingBottom: 12 }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>

      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 10 }}>
        {qs.map(q => (
          <button key={q.id} style={{
            display: "block", width: "100%", textAlign: "left", cursor: "pointer",
            fontFamily: "inherit", background: "#fff", border: `1px solid ${APP.div}`,
            borderRadius: 14, padding: "12px 13px",
          }}>
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            }}>
              <Kicker>{(q.tags || [])[0]} · {ago(q.minsAgo)}</Kicker>
              <ChevronRight size={17} color={APP.faint} />
            </span>

            <span style={{
              display: "block", fontSize: 14.5, fontWeight: 700, color: APP.head,
              lineHeight: "19px", margin: "7px 0 0",
            }}>{q.title}</span>

            <span style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
              {countOf(q) > 0
                ? <Pill icon={ThumbsUp}>{countOf(q)} answers</Pill>
                : <Pill icon={Zap} tone="warn">Needs an answer</Pill>}
              <Pill icon={MessageCircle} tone="flat">{q.author?.name}</Pill>
            </span>

            <span style={{
              display: "block", marginTop: 10, paddingTop: 9, borderTop: `1px solid ${APP.div}`,
            }}>
              <TextAction>Answer this</TextAction>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════ 3. Photo rows ══════════ */

function PhotoRows({ d, qs, countOf, tags }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
      <ChatRow d={d} />
      <div style={{ ...wrap, padding: `14px ${PAD}px 12px` }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>

      <div style={{ ...wrap, flex: 1 }}>
        {qs.map((q, i) => (
          <button key={q.id} style={{
            display: "flex", gap: 14, width: "100%", textAlign: "left", cursor: "pointer",
            fontFamily: "inherit", background: "none", border: "none",
            borderBottom: i < qs.length - 1 ? `1px solid ${APP.div}` : "none",
            padding: "14px 0",
          }}>
            <span style={{
              width: 96, height: 82, borderRadius: 8, overflow: "hidden", flexShrink: 0,
              background: APP.div, display: "block",
            }}>
              <img src={IMGS[i % Math.max(IMGS.length, 1)]} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden", fontSize: 14, fontWeight: 700, color: APP.head,
                lineHeight: "19px", marginBottom: 4,
              }}>{q.title}</span>
              <span style={{ display: "block", fontSize: 12, color: APP.sub, marginBottom: 5 }}>
                {(q.tags || [])[0]} : {q.author?.name}
              </span>
              <StatusLine n={countOf(q)} />
            </span>
          </button>
        ))}
      </div>

      <ChipStrip tags={tags} />
    </div>
  );
}

/* ══════════ 4. The answer, in green ══════════ */

function AnswerPreview({ d, qs, countOf, answersFor, tags }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
      <ChatRow d={d} />
      <div style={{ ...wrap, padding: `14px ${PAD}px 12px` }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>

      <div style={{ ...wrap, flex: 1 }}>
        {qs.map((q, i) => {
          const top = (answersFor(q) || [])[0];
          return (
            <button key={q.id} style={{
              display: "block", width: "100%", textAlign: "left", cursor: "pointer",
              fontFamily: "inherit", background: "none", border: "none",
              borderBottom: i < qs.length - 1 ? `1px solid ${APP.div}` : "none",
              padding: "14px 0",
            }}>
              <span style={{
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden", fontSize: 14, fontWeight: 700, color: APP.head,
                lineHeight: "19px", marginBottom: 5,
              }}>{q.title}</span>

              {top ? (
                <span style={{
                  display: "flex", gap: 7, alignItems: "flex-start",
                  background: APP.goodBg, borderRadius: 8, padding: "7px 9px", marginBottom: 6,
                }}>
                  <ThumbsUp size={12} color={APP.good} fill={APP.good} strokeWidth={0}
                    style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden", fontSize: 12, color: APP.good, lineHeight: "17px",
                    fontWeight: 600,
                  }}>{top.body}</span>
                </span>
              ) : (
                <span style={{
                  display: "inline-block", fontSize: 11.5, fontWeight: 600, color: APP.warn,
                  background: APP.warnBg, borderRadius: 8, padding: "6px 9px", marginBottom: 6,
                }}>Nobody has answered this yet</span>
              )}

              <span style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              }}>
                <span style={{ fontSize: 11.5, color: APP.sub }}>
                  {(q.tags || [])[0]} · {q.author?.name}
                </span>
                <span style={{ fontSize: 11, color: APP.faint }}>
                  {countOf(q) > 1 ? `${countOf(q)} answers` : ago(q.minsAgo)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <ChipStrip tags={tags} />
    </div>
  );
}

/* ══════════ 5. Grouped like an itinerary ══════════ */

const GROUPS = [
  { title: "BEFORE YOU GO", take: ["Weather", "Packing", "Visas", "Money"] },
  { title: "ON THE GROUND", take: ["Boats", "Transport", "Cities"] },
  { title: "EVERYTHING ELSE", take: null },
];

function Grouped({ d, qs, countOf }) {
  const used = new Set();
  const groups = GROUPS.map(g => {
    const list = qs.filter(q => {
      if (used.has(q.id)) return false;
      const hit = !g.take || (q.tags || []).some(t => g.take.includes(t));
      if (hit) used.add(q.id);
      return hit;
    });
    return { ...g, list };
  }).filter(g => g.list.length > 0);

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ ...wrap, paddingTop: 14, paddingBottom: 14 }}>
        <ChatRow d={d} tone="card" />
      </div>
      <div style={{ ...wrap, paddingBottom: 16 }}><SearchBar name={d.name} /></div>

      {groups.map(g => (
        <div key={g.title} style={{ marginBottom: 18 }}>
          <div style={{
            ...wrap, display: "flex", alignItems: "center", gap: 9, marginBottom: 6,
          }}>
            <Kicker>{g.title}</Kicker>
            <span style={{ flex: 1, height: 1, background: APP.div }} />
            <span style={{ fontSize: 11, color: APP.faint }}>{g.list.length}</span>
          </div>

          <div style={wrap}>
            {g.list.map((q, i) => (
              <button key={q.id} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                cursor: "pointer", fontFamily: "inherit", background: "none", border: "none",
                borderBottom: i < g.list.length - 1 ? `1px solid ${APP.div}` : "none",
                padding: "12px 0",
              }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: "block", fontSize: 14, fontWeight: 700, color: APP.head,
                    lineHeight: "19px",
                  }}>{q.title}</span>
                  <span style={{
                    display: "flex", alignItems: "center", gap: 7, marginTop: 5,
                  }}>
                    <TravellerMark name={q.author?.name} size={17} />
                    <span style={{ fontSize: 11.5, color: APP.sub }}>{q.author?.name}</span>
                    <span style={{ color: APP.div }}>·</span>
                    <StatusLine n={countOf(q)} />
                  </span>
                </span>
                <ChevronRight size={17} color={APP.faint} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════ 6. Summary bar ══════════ */

function SummaryBar({ d, qs, countOf, tags }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 480 }}>
      {/* The hotel listing's collapsed bar: what you are looking at and how it
          is ordered, on one line, tappable to change either. */}
      <div style={{
        position: "sticky", top: 0, zIndex: 6, background: "#fff",
        borderBottom: `1px solid ${APP.div}`, padding: `10px ${PAD}px`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: APP.head }}>
            {d.questionsTotal} questions
          </span>
          <span style={{
            display: "block", fontSize: 11.5, color: APP.sub, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>All subjects · Most answers first</span>
        </span>
        <span style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, height: 34,
          padding: "0 12px", borderRadius: 999, border: `1px solid ${APP.div}`,
          fontSize: 12.5, fontWeight: 700, color: APP.head,
        }}><SlidersHorizontal size={14} /> Change</span>
      </div>

      <div style={{ ...wrap, padding: `12px ${PAD}px` }}><SearchBar name={d.name} /></div>
      <ChatRow d={d} />

      <div style={{ ...wrap, flex: 1, paddingTop: 4 }}>
        {qs.map((q, i) => (
          <button key={q.id} style={{
            display: "block", width: "100%", textAlign: "left", cursor: "pointer",
            fontFamily: "inherit", background: "none", border: "none",
            borderBottom: i < qs.length - 1 ? `1px solid ${APP.div}` : "none",
            padding: "13px 0",
          }}>
            <span style={{
              display: "block", fontSize: 14, fontWeight: 700, color: APP.head, lineHeight: "19px",
            }}>{q.title}</span>
            <span style={{
              display: "flex", alignItems: "center", gap: 7, marginTop: 5,
            }}>
              <span style={{ fontSize: 11.5, color: APP.sub }}>{q.author?.name}</span>
              <span style={{ color: APP.div }}>·</span>
              <StatusLine n={countOf(q)} />
            </span>
          </button>
        ))}
      </div>

      <ChipStrip tags={tags} />
    </div>
  );
}

export const NATIVE_STYLES = [
  {
    id: "rows", n: 1, name: "Hotel rows", tag: "from the hotel listing", Comp: HotelRows,
    note: "The hotel listing, verbatim. Hairline rows with no cards, a bold two line title, a grey fact line under it, the good news in green at the foot, and the chip strip pinned at the bottom with the sliders button on the end.",
    cost: "It is the plainest of the six. Nothing here is fun, it is just familiar, so the room has to be interesting on its own.",
  },
  {
    id: "days", n: 2, name: "Day cards", tag: "from the itinerary", Comp: DayCards,
    note: "The day card's anatomy on a question: a small caps kicker for subject and age, the title, then the app's outline pills carrying the state, and a pink text action at the foot exactly where Change day plan sits.",
    cost: "The pink action repeats on every card, and pink is meant to be the one primary thing on a screen. It also makes each question taller than a row.",
  },
  {
    id: "photos", n: 3, name: "Photo rows", tag: "from both", Comp: PhotoRows,
    note: "Hotel rows with the day card's thumbnail. The Lounge stops looking like a text feature and starts looking like the rest of the trip, and the photo gives the subject away before the title is read.",
    cost: "The photos are of the destination, not of the question, so they decorate rather than inform, and by the tenth row the same beach has been used twice.",
  },
  {
    id: "answer", n: 4, name: "The answer, in green", tag: "the good news line", Comp: AnswerPreview,
    note: "The hotel row's green line, holding the first two lines of the best answer. The list stops being a list of questions and becomes a list of answers, which is what somebody scrolling actually wants.",
    cost: "Green in this app means good news, and an answer is not news. It is also the tallest of the rows, so fewer questions fit on a screen.",
  },
  {
    id: "grouped", n: 5, name: "Grouped like an itinerary", tag: "from the day list", Comp: Grouped,
    note: "Before you go, on the ground, everything else. The same small caps group headers the itinerary uses for days, so the questions arrive in the order the trip happens.",
    cost: "Somebody has to decide which group a question belongs to, and a question about money on the islands belongs in both. Filters do this job already.",
  },
  {
    id: "summary", n: 6, name: "Summary bar", tag: "the hotel screen's furniture", Comp: SummaryBar,
    note: "The collapsed bar from the hotel listing at the top, saying what you are looking at and how it is ordered, with one Change button that opens both. The rows underneath carry nothing but the question and its state.",
    cost: "It spends the top of the screen on controls before anybody has seen a question, and the chat gets pushed under the search.",
  },
];
