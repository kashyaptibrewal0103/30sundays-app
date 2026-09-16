import {
  MessagesSquare, ChevronRight, Search, SlidersHorizontal, ThumbsUp, Zap,
  CornerUpLeft, Quote,
} from "lucide-react";
import { CC } from "./tokens";
import { PAD, TravellerMark, initialsFor } from "./CommunityUI";
import { ago } from "../../data/communityData";

// Six Lounges that borrow the app's handwriting without copying its screens.
//
// What is taken, in every option, so the whole thing reads as one product:
//   type      14/700 titles, 12 grey detail, 11 small caps kickers at 0.9px
//   neutrals  #181E4C ink, #5A5F7D sub, #8E93AE faint, #EAECF5 hairline
//   signals   green for settled, amber for wanting, pink for the one action
//   shapes    14px card radius, 20px pills, 3px 9px pill padding, chevrons
//
// What is added, one move per option, because the app on its own is careful
// and this room is meant to feel like people are in it.

const A = {
  ink: "#181E4C", sub: "#5A5F7D", faint: "#8E93AE", div: "#EAECF5", well: "#F7F8FC",
  good: "#027A48", goodBg: "#ECFDF3", goodLine: "#C6E9D7",
  warn: "#B54708", warnBg: "#FFFAEB", warnLine: "#F5DCAE",
  pink: "#FD014F",
};

// Subject colours, drawn from the app's own signal set plus the brand board,
// so nothing new is introduced.
const SUBJECT = {
  Weather: A.warn, Boats: CC.teal, Transport: CC.pink, Money: A.good,
  Food: A.warn, Stays: CC.teal, Packing: A.good, Cities: CC.pink,
};
const hueOf = (t) => SUBJECT[t] || A.faint;

const wrap = { padding: `0 ${PAD}px` };

/* ── the shared furniture ── */

function Kicker({ children, color }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, letterSpacing: "0.9px",
      color: color || A.faint, textTransform: "uppercase",
    }}>{children}</span>
  );
}

function Status({ n, plain }) {
  if (n > 0) {
    return (
      <span style={{
        fontSize: 11.5, fontWeight: 700, color: plain ? A.sub : A.good,
      }}>{n} {n === 1 ? "answer" : "answers"}</span>
    );
  }
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, color: A.warn }}>Needs an answer</span>
  );
}

function SearchBar({ name }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 9, width: "100%", height: 44,
      padding: "0 13px", borderRadius: 12, background: "#fff",
      border: `1px solid ${A.div}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <Search size={16} color={A.faint} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14.5, color: A.faint }}>Search {name} questions</span>
    </button>
  );
}

function Chat({ d, tone }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 11, width: "100%", cursor: "pointer",
      fontFamily: "inherit", textAlign: "left", padding: "12px 14px", borderRadius: 14,
      background: tone === "warm" ? "rgba(255,255,255,0.78)" : "#fff",
      border: `1px solid ${tone === "warm" ? CC.bubbleEdge : A.div}`,
    }}>
      <span style={{
        width: 38, height: 38, borderRadius: 11, background: CC.tealTint, flexShrink: 0,
        display: "grid", placeItems: "center",
      }}><MessagesSquare size={18} color={CC.teal} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: A.ink }}>
          Group chat
        </span>
        <span style={{ display: "block", fontSize: 12, color: A.sub, marginTop: 2 }}>
          {d.cohort.members} travellers going in October
        </span>
      </span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
        fontSize: 11.5, fontWeight: 700, color: A.warn,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: CC.gold }} /> 3 new
      </span>
      <ChevronRight size={17} color={A.faint} style={{ flexShrink: 0 }} />
    </button>
  );
}

function Head({ children, right, big }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
      gap: 10, padding: `0 ${PAD}px`, marginBottom: big ? 14 : 10,
    }}>
      <h2 style={{
        fontSize: big ? 28 : 16, fontWeight: 800, color: A.ink, margin: 0,
        letterSpacing: big ? "-0.9px" : "-0.1px",
      }}>{children}</h2>
      {right && (
        <span style={{
          fontSize: big ? 13 : 11.5, fontWeight: big ? 700 : 400,
          color: big ? A.good : A.sub,
        }}>{right}</span>
      )}
    </div>
  );
}

function Chips({ tags }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: `0 ${PAD}px 14px`,
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      <span style={{
        flexShrink: 0, padding: "7px 14px", borderRadius: 999, background: A.ink,
        fontSize: 12.5, fontWeight: 700, color: "#fff",
      }}>All</span>
      {tags.slice(0, 3).map(t => (
        <span key={t} style={{
          flexShrink: 0, padding: "7px 13px", borderRadius: 999, background: "#fff",
          border: `1px solid ${A.div}`, fontSize: 12.5, fontWeight: 600, color: A.ink,
        }}>{t}</span>
      ))}
      <span style={{
        flexShrink: 0, width: 36, height: 34, borderRadius: 999, background: "#fff",
        border: `1px solid ${A.div}`, display: "grid", placeItems: "center",
      }}><SlidersHorizontal size={15} color={A.ink} /></span>
    </div>
  );
}

// The plain row every option starts from.
function Row({ q, n, last, children }) {
  return (
    <div style={{
      borderBottom: last ? "none" : `1px solid ${A.div}`, padding: "13px 0",
    }}>{children}</div>
  );
}

/* ══════════ 1. Warm band ══════════ */

function WarmBand({ d, qs, countOf, tags }) {
  return (
    <div style={{ paddingBottom: 26 }}>
      {/* One warm block at the top, and the rest of the screen plain white.
          The band is a doorway, not a field: nothing below it is tinted. */}
      <div style={{
        background: CC.bubbleDeep, borderBottom: `1px solid ${CC.bubbleEdge}`,
        padding: `16px ${PAD}px`,
      }}>
        <Kicker color={A.warn}>Going in October</Kicker>
        <div style={{ marginTop: 10 }}><Chat d={d} tone="warm" /></div>
      </div>

      <div style={{ ...wrap, padding: `16px ${PAD}px 12px` }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>
      <Chips tags={tags} />

      <div style={wrap}>
        {qs.map((q, i) => (
          <Row key={q.id} last={i === qs.length - 1}>
            <p style={{
              margin: 0, fontSize: 14.5, fontWeight: 700, color: A.ink, lineHeight: "19px",
            }}>{q.title}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
              <TravellerMark name={q.author?.name} ops={q.author?.ops} size={18} />
              <span style={{ flex: 1, fontSize: 12, color: A.sub }}>{q.author?.name}</span>
              <Status n={countOf(q)} />
              <span style={{ fontSize: 11, color: A.faint }}>{ago(q.minsAgo)}</span>
            </div>
          </Row>
        ))}
      </div>
    </div>
  );
}

/* ══════════ 2. The faces who answered ══════════ */

function Faces({ people, n }) {
  const show = people.slice(0, 3);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ display: "inline-flex" }}>
        {/* One letter each. Two get eaten by the overlap, and a stack is read
            as people rather than as text anyway. The first sits on top so the
            row starts with a whole circle. */}
        {show.map((p, i) => (
          <span key={i} style={{
            width: 23, height: 23, borderRadius: "50%", background: CC.mist,
            border: "2px solid #fff", marginLeft: i === 0 ? 0 : -7,
            position: "relative", zIndex: show.length - i,
            display: "grid", placeItems: "center",
            fontSize: 10, fontWeight: 800, color: A.ink,
          }}>{initialsFor(p?.name).slice(0, 1)}</span>
        ))}
      </span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: A.good }}>
        {n} answered
      </span>
    </span>
  );
}

function WhoAnswered({ d, qs, countOf, answersFor, tags }) {
  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ ...wrap, paddingTop: 14, paddingBottom: 12 }}><Chat d={d} /></div>
      <div style={{ ...wrap, paddingBottom: 12 }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>
      <Chips tags={tags} />

      <div style={wrap}>
        {qs.map((q, i) => {
          const ans = answersFor(q) || [];
          return (
            <Row key={q.id} last={i === qs.length - 1}>
              <p style={{
                margin: 0, fontSize: 14.5, fontWeight: 700, color: A.ink, lineHeight: "19px",
              }}>{q.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
                {ans.length > 0 ? (
                  <Faces people={ans.map(a => a.author)} n={ans.length} />
                ) : (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 9px", borderRadius: 20, background: "#fff",
                    border: `1px solid ${A.warn}44`, fontSize: 11, fontWeight: 700, color: A.warn,
                  }}>
                    <Zap size={11} color={A.warn} fill={A.warn} strokeWidth={0} /> Be the first
                  </span>
                )}
                <span style={{ marginLeft: "auto", fontSize: 11, color: A.faint }}>
                  {ago(q.minsAgo)}
                </span>
              </div>
            </Row>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════ 3. Subject spine ══════════ */

function Spine({ d, qs, countOf, tags }) {
  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ ...wrap, paddingTop: 14, paddingBottom: 12 }}><Chat d={d} /></div>
      <div style={{ ...wrap, paddingBottom: 12 }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>
      <Chips tags={tags} />

      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 2 }}>
        {qs.map(q => {
          const tag = (q.tags || [])[0];
          const hue = hueOf(tag);
          return (
            <button key={q.id} style={{
              display: "block", width: "100%", textAlign: "left", cursor: "pointer",
              fontFamily: "inherit", background: "none", border: "none",
              borderLeft: `3px solid ${hue}`, padding: "11px 0 11px 13px",
            }}>
              <Kicker color={hue}>{tag}</Kicker>
              <span style={{
                display: "block", fontSize: 14.5, fontWeight: 700, color: A.ink,
                lineHeight: "19px", margin: "5px 0 0",
              }}>{q.title}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                <span style={{ flex: 1, fontSize: 12, color: A.sub }}>{q.author?.name}</span>
                <Status n={countOf(q)} />
                <span style={{ fontSize: 11, color: A.faint }}>{ago(q.minsAgo)}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════ 4. Asked and answered ══════════ */

function Pairs({ d, qs, answersFor, countOf, tags }) {
  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ ...wrap, paddingTop: 14, paddingBottom: 12 }}><Chat d={d} /></div>
      <div style={{ ...wrap, paddingBottom: 12 }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>
      <Chips tags={tags} />

      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 14 }}>
        {qs.map(q => {
          const top = (answersFor(q) || [])[0];
          return (
            <button key={q.id} style={{
              display: "block", width: "100%", textAlign: "left", cursor: "pointer",
              fontFamily: "inherit", background: "none", border: "none", padding: 0,
            }}>
              <span style={{
                display: "block", fontSize: 14.5, fontWeight: 700, color: A.ink,
                lineHeight: "19px",
              }}>{q.title}</span>

              {top ? (
                <span style={{
                  display: "flex", gap: 9, marginTop: 8, padding: "10px 11px",
                  background: A.well, borderRadius: "4px 14px 14px 14px",
                }}>
                  <TravellerMark name={top.author?.name} ops={top.author?.ops} size={22} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: "block", fontSize: 11.5, fontWeight: 700, color: A.ink,
                    }}>{top.author?.name}</span>
                    <span style={{
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden", fontSize: 13, color: A.sub, lineHeight: "18px",
                      marginTop: 2,
                    }}>{top.body}</span>
                  </span>
                </span>
              ) : (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
                  padding: "8px 11px", borderRadius: "4px 14px 14px 14px",
                  background: A.warnBg, fontSize: 12.5, fontWeight: 700, color: A.warn,
                }}>
                  <CornerUpLeft size={13} /> Nobody has answered. You could.
                </span>
              )}

              <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                <span style={{ flex: 1, fontSize: 11.5, color: A.faint }}>
                  Asked by {q.author?.name} · {ago(q.minsAgo)}
                </span>
                {countOf(q) > 1 && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: A.good }}>
                    {countOf(q) - 1} more
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════ 5. Big heads ══════════ */

function BigHeads({ d, qs, countOf, tags }) {
  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ ...wrap, paddingTop: 14, paddingBottom: 12 }}><Chat d={d} /></div>
      <div style={{ ...wrap, paddingBottom: 14 }}><SearchBar name={d.name} /></div>

      <Head big right={`${d.questionsTotal} answered`}>Questions</Head>
      <div style={{ ...wrap, marginTop: -6, marginBottom: 12 }}>
        <div style={{ height: 3, background: A.ink, borderRadius: 2 }} />
      </div>
      <Chips tags={tags} />

      <div style={wrap}>
        {qs.map((q, i) => (
          <Row key={q.id} last={i === qs.length - 1}>
            <p style={{
              margin: 0, fontSize: 15, fontWeight: 700, color: A.ink, lineHeight: "20px",
              letterSpacing: "-0.15px",
            }}>{q.title}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
              <Kicker>{(q.tags || [])[0]}</Kicker>
              <span style={{ color: A.div }}>·</span>
              <span style={{ flex: 1, fontSize: 12, color: A.sub }}>{q.author?.name}</span>
              <Status n={countOf(q)} />
            </div>
          </Row>
        ))}
      </div>
    </div>
  );
}

/* ══════════ 6. Tinted card head ══════════ */

function TintedHead({ d, qs, countOf, tags }) {
  return (
    <div style={{ paddingBottom: 26 }}>
      <div style={{ ...wrap, paddingTop: 14, paddingBottom: 12 }}><Chat d={d} /></div>
      <div style={{ ...wrap, paddingBottom: 12 }}><SearchBar name={d.name} /></div>
      <Head right={`${d.questionsTotal} answered`}>Questions</Head>
      <Chips tags={tags} />

      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 10 }}>
        {qs.map(q => {
          const tag = (q.tags || [])[0];
          const hue = hueOf(tag);
          return (
            <button key={q.id} style={{
              display: "block", width: "100%", textAlign: "left", cursor: "pointer",
              fontFamily: "inherit", background: "#fff", border: `1px solid ${A.div}`,
              borderRadius: 14, padding: 0, overflow: "hidden",
            }}>
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 13px", background: `${hue}12`,
                borderBottom: `1px solid ${hue}22`,
              }}>
                <Kicker color={hue}>{tag}</Kicker>
                <span style={{ fontSize: 11, color: A.faint }}>{ago(q.minsAgo)}</span>
              </span>

              <span style={{ display: "block", padding: "11px 13px 12px" }}>
                <span style={{
                  display: "block", fontSize: 14.5, fontWeight: 700, color: A.ink,
                  lineHeight: "19px",
                }}>{q.title}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 9 }}>
                  <TravellerMark name={q.author?.name} ops={q.author?.ops} size={19} />
                  <span style={{ flex: 1, fontSize: 12, color: A.sub }}>{q.author?.name}</span>
                  {countOf(q) > 0
                    ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 9px", borderRadius: 20, background: "#fff",
                        border: `1px solid ${A.good}44`, fontSize: 11, fontWeight: 700, color: A.good,
                      }}>
                        <ThumbsUp size={11} color={A.good} fill={A.good} strokeWidth={0} />
                        {countOf(q)}
                      </span>
                    )
                    : <Status n={0} />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const MIX_STYLES = [
  {
    id: "band", n: 1, name: "Warm band", tag: "one warm block", Comp: WarmBand,
    note: "App type and app rows all the way down, with one goldenHour band at the top holding the chat. The warmth is spent once, in the place people arrive, and everything under it is white.",
    cost: "It is the mildest of the six. Scroll past the band and the screen is a plain list again, which is honest but not memorable.",
  },
  {
    id: "faces", n: 2, name: "The faces who answered", tag: "people are the fun", Comp: WhoAnswered,
    note: "The count becomes a small stack of the people who actually answered, the way the app stacks travellers elsewhere. Three answers stops being a number and becomes three faces.",
    cost: "Faces are initials until there are photos, so on day one it is three grey circles. An unanswered question also has nothing to show, which makes the gap between the two states wide.",
  },
  {
    id: "spine", n: 3, name: "Subject spine", tag: "colour down the page", Comp: Spine,
    note: "A 3px rule in the subject's colour down the left of every row, with the subject in small caps above the title. Scrolling gives a rhythm of colour, and the subject is readable without a pill.",
    cost: "Six subjects means six colours in view at once, and the eye starts reading the colour as importance rather than topic.",
  },
  {
    id: "pairs", n: 4, name: "Asked and answered", tag: "content is the fun", Comp: Pairs,
    note: "Every question carries the first answer under it in a soft reply shape with the answerer's face. The list stops being questions and becomes conversations, and an unanswered one asks you directly.",
    cost: "The tallest of the six, so three questions fill the screen instead of six. It also flatters answered questions and buries the ones that need help.",
  },
  {
    id: "heads", n: 5, name: "Big heads", tag: "type only", Comp: BigHeads,
    note: "Nothing but the app's own fonts, set louder. The section head at 28px over a heavy rule, the rows slightly larger, the subject in small caps. No new colour anywhere.",
    cost: "The quietest. It will read as a well set list rather than a place, and it does the least for a room that needs to feel occupied.",
  },
  {
    id: "tinted", n: 6, name: "Tinted card head", tag: "cards with a hat", Comp: TintedHead,
    note: "The itinerary's card, with the subject strip at the top tinted in that subject's colour where the day card puts its photo. Each card gets a head of its own without any large fill.",
    cost: "Cards are taller than rows, and six tinted heads in a column is a lot of colour for a screen whose job is to be read.",
  },
];
