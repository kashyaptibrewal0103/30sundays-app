import { useEffect, useId, useState } from "react";

// Anybody who has asked the system for less movement gets the arc standing
// still, which is the whole of our obligation here.
function useReducedMotion() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setStill(q.matches);
    on();
    q.addEventListener?.("change", on);
    return () => q.removeEventListener?.("change", on);
  }, []);
  return still;
}
import {
  MessagesSquare, MessageCircleQuestion, ChevronRight, ArrowRight, BadgeCheck,
  Plane, MapPin, Star, Ship, CloudSun, Landmark, Wallet, Bus, Utensils, Camera,
  BedDouble, FileCheck2, Backpack,
} from "lucide-react";
import { CC } from "./tokens";
import { TravellerMark, UnreadChip, AvatarStack } from "./CommunityUI";
import { GoldRecent } from "./GoldContentVariants";
import { PEOPLE, shortMonth } from "../../data/communityData";
import { customerPhotos, couplePhotoNames } from "../../data";

// Twenty-eight ways the trip screen can open Sunday Community.
//
// Every one of them is a single door: one tap target, which lands on the
// Community itself. The rooms live one tap further in, where they already
// has a card of its own.
//
// They differ on the axis a trip screen actually cares about: how much weight
// this section pulls next to payments, documents and the itinerary. Each is
// labelled with the pattern it borrows and roughly how much height it costs.

/* ─── Shared ─── */

const Head = ({ children }) => (
  <h4 style={{
    fontSize: 18, fontWeight: 600, color: CC.ink, margin: "0 0 4px", lineHeight: "28px",
  }}>{children}</h4>
);

const Sub = ({ children }) => (
  <p style={{ fontSize: 14, color: CC.body, margin: "0 0 12px", lineHeight: "20px" }}>{children}</p>
);

const month = (d) => d.month.split(" ")[0];
// Every count here names what it counts. "6 answered" left the reader asking
// "out of what"; "6 FAQs" is a body of work, which is what it actually is.
const faqLine = (n) => `${n} ${n === 1 ? "FAQ" : "FAQs"}`;

// The blurb has one job: say who answers. Who they are carries the promise,
// so the sentence spelling it out was doing the same work twice.
const blurb = (d) => `Ask travellers who have already been to ${d.name}.`;

// Two facts, one separator, used wherever a variant wants them flat.
//
// The count is people who have already travelled with us, never people
// booked for the month. The month cohort is small on launch day and is a
// number the business would rather not quote on a trip screen. The figure
// gets a little weight because it is the proof; the rest of the line only
// names what it counts. `ink` lets a dark ground pass white.
const factLine = (d, answered, ink = CC.ink) => (
  <>
    <b style={{ fontWeight: 800, color: ink }}>{d.recent3m}</b>
    {" "}have travelled with us · {faqLine(answered)}
  </>
);

// The same proof without the FAQ count, for a card too short to carry both.
const travelledLine = (d, ink = CC.ink) => (
  <>
    <b style={{ fontWeight: 800, color: ink }}>{d.recent3m}</b>
    {" "}have travelled with us
  </>
);

const Tile = ({ children, size = 38, tint = CC.tealTint }) => (
  <span style={{
    width: size, height: size, borderRadius: size / 3, background: tint, flexShrink: 0,
    display: "grid", placeItems: "center",
  }}>{children}</span>
);

/* ═══ 1. One line ═══ */
// List row. The quietest thing that can work: no heading, no blurb, one row
// in the run of the page, the way a settings list behaves.

export function EntryOneLine({ d, answered, unread, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 48,
      padding: "14px 0", background: "none", border: "none",
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <Tile><MessagesSquare size={18} color={CC.teal} /></Tile>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: CC.ink }}>
          Sunday Community
        </span>
        <span style={{
          display: "block", fontSize: 13, color: CC.body, marginTop: 2,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{factLine(d, answered)}</span>
      </span>
      {unread > 0 && <UnreadChip n={unread} />}
      <ChevronRight size={18} color={CC.soft} />
    </button>
  );
}

/* ═══ 2. Section and row ═══ */
// The app's own section convention: heading, one line of explanation, one
// card. Nothing new to learn, which is its whole argument.

export function EntrySectionRow({ d, answered, unread, onOpen }) {
  return (
    <div>
      <Head>Sunday Community</Head>
      <Sub>{blurb(d)}</Sub>
      <button onClick={onOpen} style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 48,
        padding: "14px 15px", background: CC.white, cursor: "pointer",
        border: `1px solid ${CC.line}`, borderRadius: 14,
        fontFamily: "inherit", textAlign: "left",
      }}>
        <Tile size={34}><MessagesSquare size={16} color={CC.teal} /></Tile>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>Questions and answers</span>
          <span style={{
            display: "block", fontSize: 12.5, color: CC.body, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{factLine(d, answered)}</span>
        </span>
        {unread > 0 && <UnreadChip n={unread} />}
        <ChevronRight size={17} color={CC.soft} />
      </button>
    </div>
  );
}

/* ═══ 3. Two numbers ═══ */
// Stat pair. The numbers do the selling and the eye reads them before any
// prose, which is why dashboards lead with figures.

export function EntryStats({ d, answered, unread, onOpen }) {
  return (
    <div>
      <Head>Sunday Community</Head>
      <Sub>{blurb(d)}</Sub>
      <button onClick={onOpen} style={{
        width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white, padding: "15px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Stat n={answered} label={answered === 1 ? "FAQ" : "FAQs"} />
          <span style={{ width: 1, alignSelf: "stretch", background: CC.line }} />
          <Stat n={d.recent3m} label="have travelled with us" />
          <ChevronRight size={18} color={CC.soft} style={{ marginLeft: "auto", flexShrink: 0 }} />
        </div>
        {unread > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 13,
            paddingTop: 12, borderTop: `1px solid ${CC.line}`,
          }}>
            <UnreadChip n={unread} />
            <span style={{ fontSize: 12.5, color: CC.body }}>in the Community</span>
          </div>
        )}
      </button>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <span style={{ minWidth: 0 }}>
      <span style={{
        display: "block", fontSize: 24, fontWeight: 700, color: CC.ink,
        letterSpacing: "-0.6px", lineHeight: "26px",
      }}>{n}</span>
      <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 2 }}>{label}</span>
    </span>
  );
}

/* ═══ 4. A real question ═══ */
// Content preview. Shows the thing rather than describing it, the way a news
// tile shows a headline. Costs the most height and earns the most taps.

export function EntryPreview({ d, count, answered, unread, top, onOpen }) {
  return (
    <div>
      <Head>Sunday Community</Head>
      <Sub>{blurb(d)}</Sub>

      <div style={{
        border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white, overflow: "hidden",
      }}>
        <button onClick={onOpen} style={{
          display: "block", width: "100%", textAlign: "left", padding: "14px 15px",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
        }}>
          <p style={{
            fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px", textTransform: "uppercase",
            color: CC.tealInk, margin: 0,
          }}>Asked this week</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: CC.ink, margin: "6px 0 0", lineHeight: "21px" }}>
            {top?.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <TravellerMark name={top?.author?.name} ops={top?.author?.ops} size={20} />
            <span style={{ fontSize: 12.5, color: CC.body, flex: 1, minWidth: 0 }}>
              {top?.author?.name}
            </span>
            <span style={{
              padding: "3px 9px", borderRadius: 999, background: CC.well,
              fontSize: 11.5, fontWeight: 700, color: CC.body,
            }}>{(top?.answers || []).length} answers</span>
          </div>
        </button>

        <button onClick={onOpen} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", minHeight: 48,
          padding: "12px 15px", background: CC.well, border: "none",
          borderTop: `1px solid ${CC.line}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}>
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: CC.ink }}>
            {factLine(d, answered)}
          </span>
          {unread > 0 && <UnreadChip n={unread} />}
          <ChevronRight size={16} color={CC.soft} />
        </button>
      </div>
    </div>
  );
}

/* ═══ 5. Full bleed strip ═══ */
// Breaks the card rhythm. Every other section on a trip screen is a card, so
// a band that runs edge to edge reads as a different kind of thing.

export function EntryStrip({ d, answered, unread, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "calc(100% + 32px)", margin: "0 -16px",
      padding: "16px", background: CC.tealTint, border: "none",
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MessagesSquare size={16} color={CC.teal} />
        <span style={{
          fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
          textTransform: "uppercase", color: CC.tealInk, flex: 1,
        }}>Sunday Community</span>
        {unread > 0 && <UnreadChip n={unread} />}
      </div>
      <p style={{ fontSize: 15.5, fontWeight: 700, color: CC.ink, margin: "9px 0 0", lineHeight: "22px" }}>
        {blurb(d)}
      </p>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginTop: 12,
        flexWrap: "wrap",
      }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: CC.body }}>
          {factLine(d, answered)}
        </span>
        {/* Not a button. The whole band is the tap target, so a pill inside it
            would be a second affordance for the same action. A named link is
            enough to say where the tap goes. */}
        <span style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 13.5, fontWeight: 700, color: CC.tealInk,
        }}>Visit the Community <ArrowRight size={15} color={CC.teal} /></span>
      </div>
    </button>
  );
}

/* ═══ 6. Swipeable questions ═══ */
// Horizontal peek. Shows three real questions and ends in a tile that opens
// the rest. The cut-off fourth card is what tells a thumb it can scroll.

export function EntryCarousel({ d, count, answered, unread, questions = [], onOpen }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <Head>Sunday Community</Head>
        {unread > 0 && <span style={{ marginLeft: "auto" }}><UnreadChip n={unread} /></span>}
      </div>
      <Sub>{blurb(d)}</Sub>

      <div style={{
        display: "flex", gap: 10, overflowX: "auto", padding: "0 16px 4px",
        margin: "0 -16px", scrollbarWidth: "none",
      }}>
        {questions.slice(0, 3).map(q => (
          <button key={q.id} onClick={onOpen} style={{
            flex: "0 0 66%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
            border: `1px solid ${CC.line}`, borderRadius: 14, background: CC.white,
            padding: "13px 14px", display: "flex", flexDirection: "column", gap: 10,
          }}>
            <span style={{
              fontSize: 14, fontWeight: 700, color: CC.ink, lineHeight: "20px",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{q.title}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
              {q.acceptedId
                ? <BadgeCheck size={13} color={CC.teal} />
                : <MessageCircleQuestion size={13} color={CC.soft} />}
              <span style={{ fontSize: 11.5, color: CC.body }}>
                {(q.answers || []).length} answers
              </span>
            </span>
          </button>
        ))}

        <button onClick={onOpen} style={{
          flex: "0 0 40%", cursor: "pointer", fontFamily: "inherit",
          border: `1px dashed ${CC.line}`, borderRadius: 14, background: CC.well,
          padding: "13px 14px", display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "center", gap: 6,
        }}>
          <ArrowRight size={16} color={CC.tealInk} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: CC.ink, textAlign: "left" }}>
            All {count} questions
          </span>
          <span style={{ fontSize: 11.5, color: CC.body, textAlign: "left" }}>
            {faqLine(answered)}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════ 7 to 11: the tinted band, five more ways ═══════════ */
//
// Number 5 works because it changes the ground rather than adding another
// card. These keep that move and vary one thing at a time: which colour the
// ground is, how hard it stops, and whether it bleeds at all.
//
// Anatomy is identical in every one, so the comparison is only about surface:
//   kicker + unread · one line of promise · the two facts + a named link.

function Band({ ground, kickerInk, accent, ink, bodyInk, edge, inset, d, answered, unread, onOpen }) {
  const onDark = ground === CC.ink;
  return (
    <button onClick={onOpen} style={{
      display: "block", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      border: edge ? `1px solid ${edge}` : "none",
      background: ground,
      ...(inset
        ? { width: "100%", padding: 16, borderRadius: 16 }
        : { width: "calc(100% + 32px)", margin: "0 -16px", padding: 16 }),
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MessagesSquare size={16} color={accent} />
        <span style={{
          fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
          textTransform: "uppercase", color: kickerInk, flex: 1,
        }}>Sunday Community</span>
        {unread > 0 && <UnreadChip n={unread} onDark={onDark} />}
      </div>

      <p style={{ fontSize: 15.5, fontWeight: 700, color: ink, margin: "9px 0 0", lineHeight: "22px" }}>
        {blurb(d)}
      </p>

      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap",
      }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: bodyInk }}>
          {factLine(d, answered, ink)}
        </span>
        <span style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 13.5, fontWeight: 700, color: kickerInk,
        }}>Visit the Community <ArrowRight size={15} color={accent} /></span>
      </div>
    </button>
  );
}

/* ═══ 7. Golden band ═══ */
// Same shape, warmer ground. Golden is the attention colour, so this asks for
// a glance harder than lagoon does without shouting.

export function EntryBandGold(p) {
  return <Band {...p} ground={CC.goldTint} kickerInk={CC.goldInk} accent={CC.gold}
    ink={CC.ink} bodyInk={CC.body} />;
}

/* ═══ 8. Deep green band ═══ */
// Inverted. Nothing else on a trip screen is dark, so this is the loudest the
// band can be. The fuchsia unread count is at its strongest here.

export function EntryBandDark(p) {
  return <Band {...p} ground={CC.ink} kickerInk="rgba(255,255,255,0.72)" accent="#fff"
    ink="#fff" bodyInk="rgba(255,255,255,0.64)" />;
}

/* ═══ 9. Fading band ═══ */
// Lagoon at the top, white at the bottom. It does not stop hard against the
// next section, so it reads as part of the page rather than a slab dropped
// onto it.

export function EntryBandFade(p) {
  return <Band {...p}
    ground={`linear-gradient(180deg, ${CC.tealTint} 0%, ${CC.white} 100%)`}
    kickerInk={CC.tealInk} accent={CC.teal} ink={CC.ink} bodyInk={CC.body} />;
}

/* ═══ 10. Warm neutral band ═══ */
// Coastal mist, the brand's own off-white. A different surface without being
// a colour, which is the quietest way to make this block its own thing.

export function EntryBandMist(p) {
  return <Band {...p} ground={CC.mist} kickerInk={CC.ink} accent={CC.teal}
    ink={CC.ink} bodyInk={CC.body} />;
}

/* ═══ 11. Tinted card ═══ */
// The same lagoon ground, but inset and rounded. Keeps the card rhythm of the
// trip screen and changes only what is behind the type.

export function EntryBandCard(p) {
  return <Band {...p} inset ground={CC.tealTint} edge={CC.tealLine}
    kickerInk={CC.tealInk} accent={CC.teal} ink={CC.ink} bodyInk={CC.body} />;
}


/* ═══════════ 13 to 17: the artistic set ═══════════ */
//
// The bands sell with type on a tinted ground. These sell with the trip
// itself: the destination's own photo, and the shapes travel already owns,
// a postcard, a ticket, a stamp, a window seat, a polaroid. Same single
// door, same facts, more feeling.

/* ═══ 13. Postcard ═══ */
// The photo carries the destination, and the month sits in the corner the
// stamp goes. The white strip underneath is the message side.

export function EntryPostcard({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: 0, border: `1px solid ${CC.line}`,
      borderRadius: 16, overflow: "hidden", background: CC.white,
    }}>
      <span style={{ position: "relative", display: "block", height: 118 }}>
        <img src={d.hero} alt="" style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
        }} />
        <span style={{
          position: "absolute", inset: 0, display: "block",
          background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%), linear-gradient(to bottom, rgba(0,0,0,0.3), transparent 45%)",
        }} />
        {/* The stamp corner. */}
        <span style={{
          position: "absolute", top: 10, right: 10, padding: "5px 9px",
          border: "1.5px dashed rgba(255,255,255,0.85)", borderRadius: 6,
          transform: "rotate(4deg)", display: "block",
          fontSize: 10.5, fontWeight: 800, letterSpacing: "0.5px",
          textTransform: "uppercase", color: "#fff",
        }}>{month(d)} {d.month.split(" ")[1]}</span>
        <span style={{
          position: "absolute", left: 14, bottom: 10, display: "block",
          fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-0.2px",
          textShadow: "0 1px 8px rgba(0,0,0,0.4)",
        }}>Greetings from {d.name}</span>
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: CC.ink }}>
            {blurb(d)}
          </span>
          <span style={{ display: "block", marginTop: 3, fontSize: 12, color: CC.body }}>
            {factLine(d, answered)}
          </span>
        </span>
        <ArrowRight size={16} color={CC.teal} style={{ flexShrink: 0 }} />
      </span>
    </button>
  );
}

/* ═══ 14. Boarding pass ═══ */
// A ticket, torn where tickets tear. The month is the stub, the Community is the
// destination, and the barcode is just a barcode.

export function EntryTicket({ d, answered, onOpen }) {
  const notch = (side) => ({
    position: "absolute", [side]: -7, left: 91, width: 14, height: 14,
    borderRadius: "50%", background: CC.well, border: `1px solid ${CC.line}`,
    display: "block",
  });
  return (
    <button onClick={onOpen} style={{
      position: "relative", display: "flex", width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 0,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
      overflow: "hidden",
    }}>
      <span style={{
        width: 98, flexShrink: 0, background: CC.goldTint, display: "grid",
        placeItems: "center", padding: "16px 0",
        borderRight: `1.5px dashed ${CC.goldLine}`,
      }}>
        <span style={{ textAlign: "center", display: "block" }}>
          <span style={{
            display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.6px",
            textTransform: "uppercase", color: CC.goldInk,
          }}>Boarding</span>
          <span style={{
            display: "block", fontSize: 17, fontWeight: 800, color: CC.ink, marginTop: 2,
          }}>{month(d)}</span>
          <span style={{ display: "block", fontSize: 11, color: CC.body }}>
            {d.month.split(" ")[1]}
          </span>
        </span>
      </span>
      <span style={notch("top")} />
      <span style={notch("bottom")} />
      <span style={{ flex: 1, minWidth: 0, padding: "13px 14px" }}>
        <span style={{
          display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
          textTransform: "uppercase", color: CC.body,
        }}>You → Sunday Community</span>
        <span style={{
          display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink,
          margin: "5px 0 0", lineHeight: "20px",
        }}>{blurb(d)}</span>
        <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 3 }}>
          {factLine(d, answered)}
        </span>
        {/* The barcode. Decorative, and honest about it. */}
        <span aria-hidden style={{
          display: "block", height: 16, marginTop: 10, borderRadius: 2,
          background: `repeating-linear-gradient(90deg, ${CC.ink} 0 2px, transparent 2px 5px, ${CC.ink} 5px 6px, transparent 6px 10px)`,
          opacity: 0.75,
        }} />
      </span>
    </button>
  );
}

/* ═══ 15. Passport stamp ═══ */
// The rubber stamp every trip ends with, pressed a little crooked the way a
// real one lands. The type beside it stays straight and does the selling.

export function EntryStamp({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.mist,
    }}>
      <span style={{
        flexShrink: 0, transform: "rotate(-5deg)", display: "block",
        border: `2px solid ${CC.tealInk}`, borderRadius: 10, padding: 3,
      }}>
        <span style={{
          display: "block", border: `1.5px dashed ${CC.tealInk}`, borderRadius: 7,
          padding: "8px 12px", textAlign: "center",
        }}>
          <span style={{
            display: "block", fontSize: 9.5, fontWeight: 800, letterSpacing: "1px",
            textTransform: "uppercase", color: CC.tealInk,
          }}>Sunday Community</span>
          <span style={{
            display: "block", fontSize: 14, fontWeight: 800, color: CC.tealInk,
            marginTop: 2, textTransform: "uppercase", letterSpacing: "0.3px",
          }}>{d.name}</span>
          <span style={{
            display: "block", fontSize: 10, fontWeight: 700, color: CC.tealInk, marginTop: 2,
          }}>{month(d)} {d.month.split(" ")[1]}</span>
        </span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink, lineHeight: "20px",
        }}>{blurb(d)}</span>
        <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 4 }}>
          {factLine(d, answered)}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
          fontSize: 13, fontWeight: 700, color: CC.tealInk,
        }}>Visit the Community <ArrowRight size={14} color={CC.teal} /></span>
      </span>
    </button>
  );
}

/* ═══ 16. Through the window ═══ */
// The destination out of the window, and the people you would be asking
// looking back. The only variant where the photo is the whole ground.

export function EntryWindow({ d, faces, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      position: "relative", display: "block", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", border: "none", overflow: "hidden",
      width: "calc(100% + 32px)", margin: "0 -16px", padding: 0,
    }}>
      <img src={d.hero} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", display: "block",
      }} />
      <span style={{
        position: "absolute", inset: 0, display: "block",
        background: "linear-gradient(to right, rgba(10,32,31,0.82) 30%, rgba(10,32,31,0.28))",
      }} />
      <span style={{ position: "relative", display: "block", padding: "18px 16px" }}>
        <span style={{
          display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.6px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.75)",
        }}>Sunday Community</span>
        <span style={{
          display: "block", fontSize: 16.5, fontWeight: 700, color: "#fff",
          margin: "7px 0 0", lineHeight: "22px", maxWidth: 250,
        }}>Ask {d.recent3m} travellers who have just been to {d.name}</span>
        <span style={{
          display: "flex", alignItems: "center", gap: 12, marginTop: 13, flexWrap: "wrap",
        }}>
          <AvatarStack people={faces} extra={(d.recent3m || 0) - faces.length} size={26} />
          {/* Styled like GlassPill, but a span: this whole variant is already
              one button, and a button cannot hold another. */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7, minHeight: 36,
            padding: "0 15px", borderRadius: 999, background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(8px)",
            fontSize: 12.5, fontWeight: 700, color: "#fff",
          }}>Visit the Community</span>
        </span>
      </span>
    </button>
  );
}

/* ═══ 17. Polaroid ═══ */
// One instant photo, pinned a little off straight, with the invite written
// beside it the way a caption gets written.

export function EntryPolaroid({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{
        flexShrink: 0, transform: "rotate(-4deg)", display: "block",
        background: CC.white, padding: "6px 6px 20px",
        boxShadow: "0 3px 12px rgba(37,67,66,0.22)", position: "relative",
      }}>
        <img src={d.hero} alt="" style={{
          width: 86, height: 78, objectFit: "cover", display: "block",
        }} />
        <span style={{
          position: "absolute", left: 0, right: 0, bottom: 4, display: "block",
          textAlign: "center", fontSize: 9.5, fontWeight: 700, color: CC.body,
        }}>{d.name}, {month(d)}</span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <Head>Sunday Community</Head>
        <span style={{
          display: "block", fontSize: 13.5, color: CC.body, lineHeight: "19px",
        }}>{blurb(d)}</span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
          fontSize: 12, color: CC.body,
        }}>
          {factLine(d, answered)}
          <ArrowRight size={14} color={CC.teal} />
        </span>
      </span>
    </button>
  );
}


/* ═══════════ 18 to 27: more objects from the trip ═══════════ */
//
// The postcard set earned its keep by being a thing rather than a section.
// Ten more things: everything a trip leaves in a drawer, each carrying the
// same one door and the same facts.

const code = (d) => d.name.slice(0, 3).toUpperCase();
const year = (d) => d.month.split(" ")[1];
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

/* ═══ 18. Luggage tag ═══ */
// The tag off the handle, hole and all, hanging a few degrees off straight.

export function EntryLuggageTag({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{
        flexShrink: 0, transform: "rotate(-4deg)", display: "flex", alignItems: "center",
        gap: 8, padding: "10px 14px 10px 10px", background: CC.goldTint,
        border: `1.5px solid ${CC.goldLine}`, borderRadius: "14px 8px 8px 14px",
        boxShadow: "0 2px 8px rgba(37,67,66,0.12)",
      }}>
        <span style={{
          width: 12, height: 12, borderRadius: "50%", background: CC.white,
          border: `2px solid ${CC.goldLine}`, flexShrink: 0, display: "block",
        }} />
        <span style={{ display: "block" }}>
          <span style={{
            display: "block", fontSize: 18, fontWeight: 800, color: CC.ink,
            letterSpacing: "1px", fontFamily: MONO,
          }}>{code(d)}</span>
          <span style={{
            display: "block", fontSize: 8.5, fontWeight: 800, letterSpacing: "0.7px",
            textTransform: "uppercase", color: CC.goldInk,
          }}>Via Sunday Community</span>
        </span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink, lineHeight: "20px",
        }}>{blurb(d)}</span>
        <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 4 }}>
          {factLine(d, answered)}
        </span>
      </span>
      <ArrowRight size={16} color={CC.teal} style={{ flexShrink: 0 }} />
    </button>
  );
}

/* ═══ 19. Departure board ═══ */
// The airport board, letter spaced and lit. The only dark object in the set,
// which is exactly why the eye stops on it.

export function EntryDepartureBoard({ d, answered, onOpen }) {
  const row = (label, value) => (
    <span style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
      <span style={{
        width: 86, flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: "1px",
        textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontFamily: MONO,
      }}>{label}</span>
      <span style={{
        fontSize: 13.5, fontWeight: 800, letterSpacing: "1.5px",
        textTransform: "uppercase", color: CC.gold, fontFamily: MONO,
      }}>{value}</span>
    </span>
  );
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: 16, border: "none", borderRadius: 16,
      background: CC.ink,
    }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {row("Destination", d.name)}
        {row("Departure", `${month(d)} ${year(d)}`)}
        {row("Flown with us", `${d.recent3m} travellers`)}
        {row("Answered", faqLine(answered))}
      </span>
      <span style={{
        display: "flex", alignItems: "center", gap: 6, marginTop: 13,
        paddingTop: 11, borderTop: "1px solid rgba(255,255,255,0.14)",
        fontSize: 13, fontWeight: 700, color: "#fff",
      }}>Visit Sunday Community <ArrowRight size={14} color={CC.gold} /></span>
    </button>
  );
}

/* ═══ 20. Airmail envelope ═══ */
// The striped border does all the work: nothing else on the screen has one.

export function EntryAirmail({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: 5, border: "none", borderRadius: 14,
      background: `repeating-linear-gradient(45deg, ${CC.coral} 0 9px, ${CC.white} 9px 18px, ${CC.teal} 18px 27px, ${CC.white} 27px 36px)`,
    }}>
      <span style={{
        display: "block", background: CC.white, borderRadius: 10, padding: "13px 14px",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            flex: 1, fontSize: 10.5, fontWeight: 800, letterSpacing: "1px",
            textTransform: "uppercase", color: CC.body,
          }}>Par avion · From {d.name}</span>
          <Plane size={13} color={CC.teal} style={{ flexShrink: 0 }} />
        </span>
        <span style={{
          display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink,
          margin: "7px 0 0", lineHeight: "20px",
        }}>{d.recent3m} travellers came back in the last three months. Ask them anything.</span>
        <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 4 }}>
          P.S. {factLine(d, answered)} · Visit Sunday Community
        </span>
      </span>
    </button>
  );
}

/* ═══ 21. Postage stamp ═══ */
// The destination as the stamp itself, perforated edge, postmark rings over
// the corner the way a franked one comes home.

// The immigration stamp itself, drawn rather than photographed, so every
// destination has one and it stays sharp at any size.
//
// A real entry stamp is a ring of small type around a hard banner carrying the
// country. At this size the ring cannot be read, and it is not meant to be: it
// is the texture that says "stamp". The banner is the part that has to read, so
// the country name is stretched to fill it whatever its length, the way a
// stamp cut for one country would be.
export function PassportStamp({ name, size = 74, ink = "#37332F" }) {
  const uid = useId();
  const top = `${uid}-t`, bot = `${uid}-b`;
  const plate = name.toUpperCase();
  // The banner is a fixed width, so the name is sized to fill it rather than
  // stretched to it: forcing every name to one width left BALI enormous and
  // NEW ZEALAND squashed. Capped so a short name cannot outgrow the plate.
  const nameSize = Math.min(21, 84 / (plate.length * 0.62));
  // A short name hits the size cap and then sits lost in the middle of the
  // plate, so the letters spread to fill it instead. Long names never do.
  const natural = plate.length * 0.62 * nameSize;
  const track = Math.max(0, Math.min(9, (80 - natural) / Math.max(1, plate.length - 1)));
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden
      style={{ display: "block", transform: "rotate(-9deg)", opacity: 0.92 }}>
      <defs>
        {/* Text rides the inside of the ring: over the top, and under the
            bottom the other way round so both read upright. */}
        <path id={top} d="M 17,50 A 33,33 0 0,1 83,50" fill="none" />
        <path id={bot} d="M 14,50 A 36,36 0 0,0 86,50" fill="none" />
      </defs>

      <circle cx="50" cy="50" r="47" fill="none" stroke={ink} strokeWidth="2.6" />
      <circle cx="50" cy="50" r="41" fill="none" stroke={ink} strokeWidth="1.1" />

      <text fill={ink} fontSize="9.5" fontWeight="700" letterSpacing="1.6"
        fontFamily="Figtree, sans-serif">
        <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">★ WELCOME ★</textPath>
      </text>
      <text fill={ink} fontSize="8" fontWeight="700" letterSpacing="1.2"
        fontFamily="Figtree, sans-serif">
        <textPath href={`#${bot}`} startOffset="50%" textAnchor="middle">IMMIGRATION</textPath>
      </text>

      {/* The banner runs past the ring on both sides, the way a cut plate does. */}
      <g transform="rotate(-6 50 50)">
        <rect x="2" y="37" width="96" height="26" fill="#FFFFFF" stroke={ink} strokeWidth="3" />
        {/* Letter spacing adds a gap after the last letter too, so the middle
            anchor lands half a gap left. dx puts it back. */}
        <text x="50" y="50" dx={track / 2} dy="0.35em" fill={ink} fontSize={nameSize}
          fontWeight="800" letterSpacing={track}
          fontFamily="Figtree, sans-serif" textAnchor="middle">{plate}</text>
      </g>
    </svg>
  );
}

// `height` fixes the card so it can be sized against something next to it, and
// switches the stamp and the type to a set of metrics that fit the shorter box.
// `faqs` drops the FAQ count, which a short card has no room for.
export function EntryPostageStamp({ d, answered, onOpen, height, faqs = true }) {
  const c = height != null;                  // compact
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: c ? 12 : 16, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: c ? 12 : 16,
      ...(c ? { height, boxSizing: "border-box" } : null),
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ flexShrink: 0, display: "block" }}>
        <PassportStamp name={d.name} size={c ? 74 : 96} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: c ? 13.5 : 14.5, fontWeight: 700, color: CC.ink,
          lineHeight: c ? "18px" : "20px",
        }}>{blurb(d)}</span>
        <span style={{
          display: "block", fontSize: c ? 11.5 : 12, color: CC.body,
          marginTop: c ? 3 : 4, lineHeight: c ? "15px" : "normal",
        }}>
          {faqs ? factLine(d, answered) : travelledLine(d)}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginTop: c ? 6 : 8,
          fontSize: c ? 12.5 : 13, fontWeight: 700, color: CC.tealInk,
        }}>Visit the Community <ArrowRight size={14} color={CC.teal} /></span>
      </span>
    </button>
  );
}

/* ═══ 22. Entry visa ═══ */
// A visa sticker, machine readable line and all. The one variant that gets to
// be official looking, because a visa is the one document that grants entry.

export function EntryVisa({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: 14, borderRadius: 12,
      border: `1px solid ${CC.tealLine}`, outline: `3px solid ${CC.tealTint}`,
      outlineOffset: -7,
      background: `linear-gradient(135deg, ${CC.tealTint} 0%, ${CC.white} 45%, ${CC.goldTint} 100%)`,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          flex: 1, fontSize: 10.5, fontWeight: 800, letterSpacing: "1.2px",
          textTransform: "uppercase", color: CC.tealInk,
        }}>Entry visa · Sunday Community</span>
        <BadgeCheck size={15} color={CC.teal} style={{ flexShrink: 0 }} />
      </span>
      <span style={{
        display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink,
        margin: "8px 0 0", lineHeight: "20px",
      }}>Valid for {d.name}, {month(d)} {year(d)}. Bearer may ask {d.recent3m} travellers who have been.</span>
      <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 4 }}>
        {factLine(d, answered)}
      </span>
      <span aria-hidden style={{
        display: "block", marginTop: 10, paddingTop: 8, borderTop: `1px solid ${CC.line}`,
        fontSize: 11, letterSpacing: "1px", color: CC.soft, fontFamily: MONO,
        whiteSpace: "nowrap", overflow: "hidden",
      }}>{`V<SUNDAYLOUNGE<<${code(d)}<${month(d).slice(0, 3).toUpperCase()}${year(d)}<<<<<<<<`}</span>
    </button>
  );
}

/* ═══ 23. Room key ═══ */
// The hotel key tag, brass ring and all. The Community as a room you hold the
// key to, which is exactly what booking bought.

export function EntryRoomKey({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{
        flexShrink: 0, transform: "rotate(5deg)", display: "block", position: "relative",
        width: 74, padding: "22px 10px 12px", textAlign: "center",
        background: CC.ink, borderRadius: 10,
        boxShadow: "0 3px 10px rgba(37,67,66,0.25)",
      }}>
        <span style={{
          position: "absolute", top: 7, left: "50%", marginLeft: -7, width: 14, height: 14,
          borderRadius: "50%", border: `2.5px solid ${CC.gold}`, display: "block",
        }} />
        <span style={{
          display: "block", fontSize: 8.5, fontWeight: 800, letterSpacing: "0.8px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
        }}>Sunday Community</span>
        <span style={{
          display: "block", fontSize: 16, fontWeight: 800, color: CC.gold,
          marginTop: 2, fontFamily: MONO,
        }}>{code(d)}</span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink, lineHeight: "20px",
        }}>Your booking is the key. {blurb(d)}</span>
        <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 4 }}>
          {factLine(d, answered)}
        </span>
      </span>
      <ArrowRight size={16} color={CC.teal} style={{ flexShrink: 0 }} />
    </button>
  );
}

/* ═══ 24. Journal page ═══ */
// A ruled page out of the trip notebook, written in the traveller's own
// voice. The one variant that sells by sounding like the reader.

export function EntryJournal({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "14px 16px 16px 34px", borderRadius: 4,
      border: `1px solid ${CC.line}`, borderLeft: "none", position: "relative",
      background: `${CC.white} repeating-linear-gradient(${CC.white} 0 25px, ${CC.line} 25px 26px)`,
      boxShadow: "0 2px 8px rgba(37,67,66,0.08)",
    }}>
      <span aria-hidden style={{
        position: "absolute", top: 0, bottom: 0, left: 24, width: 1,
        background: CC.coral, opacity: 0.5, display: "block",
      }} />
      <span style={{
        display: "block", fontSize: 14.5, fontWeight: 700, fontStyle: "italic",
        color: CC.ink, lineHeight: "26px",
      }}>Before we pack: ask the {d.recent3m} people who just did this exact trip.</span>
      <span style={{
        display: "block", fontSize: 13, fontStyle: "italic", color: CC.body, lineHeight: "26px",
      }}>{factLine(d, answered)}, one tap away.</span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4,
        fontSize: 13.5, fontWeight: 700, fontStyle: "italic", color: CC.tealInk,
        textDecoration: "underline", textUnderlineOffset: 4, lineHeight: "26px",
      }}>Open Sunday Community <ArrowRight size={14} color={CC.teal} /></span>
    </button>
  );
}

/* ═══ 25. Baggage sticker ═══ */
// The long strip the airline wraps round a handle, barcode and route code,
// stuck on a shade crooked because they always are.

export function EntryBaggageSticker({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "18px 16px", borderRadius: 16,
      border: `1px solid ${CC.line}`, background: CC.mist, overflow: "hidden",
    }}>
      <span style={{
        display: "block", transform: "rotate(-2deg)", background: CC.white,
        border: `1px solid ${CC.line}`, borderRadius: 6, padding: "10px 12px",
        boxShadow: "0 2px 8px rgba(37,67,66,0.12)",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 15, fontWeight: 800, fontFamily: MONO, letterSpacing: "0.5px",
            color: CC.ink, flexShrink: 0,
          }}>30SUN → {code(d)}</span>
          <span aria-hidden style={{
            flex: 1, height: 20, borderRadius: 2, minWidth: 40,
            background: `repeating-linear-gradient(90deg, ${CC.ink} 0 2px, transparent 2px 5px, ${CC.ink} 5px 6px, transparent 6px 9px)`,
            opacity: 0.8, display: "block",
          }} />
        </span>
        <span style={{
          display: "block", marginTop: 7, fontSize: 10, fontWeight: 800,
          letterSpacing: "0.8px", textTransform: "uppercase", color: CC.goldInk,
        }}>Priority · {d.recent3m} have travelled with us · {faqLine(answered)}</span>
      </span>
      <span style={{
        display: "flex", alignItems: "center", gap: 6, marginTop: 12,
        fontSize: 13.5, fontWeight: 700, color: CC.ink,
      }}>{blurb(d)} <ArrowRight size={14} color={CC.teal} style={{ flexShrink: 0 }} /></span>
    </button>
  );
}

/* ═══ 26. Travel patch ═══ */
// The embroidered badge off a backpack: two stitched rings and a plane. Sits
// beside the type like a crest.

export function EntryPatch({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{
        flexShrink: 0, width: 84, height: 84, borderRadius: "50%",
        background: CC.tealInk, border: `3px solid ${CC.gold}`,
        display: "grid", placeItems: "center", transform: "rotate(-6deg)",
        boxShadow: "0 3px 10px rgba(4,117,107,0.3)",
      }}>
        <span style={{
          width: 68, height: 68, borderRadius: "50%",
          border: "1.5px dashed rgba(255,255,255,0.55)",
          display: "grid", placeItems: "center", textAlign: "center",
        }}>
          <span style={{ display: "block" }}>
            <Plane size={15} color={CC.gold} />
            <span style={{
              display: "block", fontSize: 9.5, fontWeight: 800, letterSpacing: "0.6px",
              textTransform: "uppercase", color: "#fff", marginTop: 1,
            }}>{d.name}</span>
            <span style={{
              display: "block", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.5px",
              textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
            }}>{month(d)} {year(d)}</span>
          </span>
        </span>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink, lineHeight: "20px",
        }}>{blurb(d)}</span>
        <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 4 }}>
          {factLine(d, answered)}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
          fontSize: 13, fontWeight: 700, color: CC.tealInk,
        }}>Visit the Community <ArrowRight size={14} color={CC.teal} /></span>
      </span>
    </button>
  );
}

/* ═══ 27. Folded map ═══ */
// A map out of the glovebox, fold shadows and a dotted route to the pin.

export function EntryFoldedMap({ d, answered, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "14px 16px", borderRadius: 16,
      border: `1px solid ${CC.line}`, position: "relative", overflow: "hidden",
      background: `linear-gradient(90deg, ${CC.white} 0 25%, #F6F5F1 25% 25.6%, ${CC.white} 25.6% 50%, #F6F5F1 50% 50.6%, ${CC.white} 50.6% 75%, #F6F5F1 75% 75.6%, ${CC.white} 75.6% 100%)`,
    }}>
      {/* The route: a dotted line wandering to the pin. */}
      <span aria-hidden style={{
        position: "absolute", top: 26, left: 16, right: 54, height: 1,
        borderTop: `2px dotted ${CC.tealLine}`, transform: "rotate(2deg)",
        display: "block",
      }} />
      <span style={{
        position: "absolute", top: 12, right: 18, display: "block",
      }}><MapPin size={22} color={CC.pink} fill={CC.pinkTint} /></span>
      <span style={{
        display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.8px",
        textTransform: "uppercase", color: CC.body,
      }}>You are here</span>
      <span style={{
        display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink,
        margin: "18px 0 0", lineHeight: "20px",
      }}>{d.name} is there, and {d.recent3m} travellers already know the way.</span>
      <span style={{ display: "block", fontSize: 12, color: CC.body, marginTop: 4 }}>
        {factLine(d, answered)}
      </span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
        fontSize: 13, fontWeight: 700, color: CC.tealInk,
      }}>Visit the Community <ArrowRight size={14} color={CC.teal} /></span>
    </button>
  );
}


/* ═══ 28. Community entrance ═══ */
// The one variant drawn rather than built: the sign, the door standing open,
// and the host at it. The picture is the ground and the words are live, so
// the count and the FAQ number update on their own. The scene owns the left
// of the card and the copy sits in the calm right half.

export function EntryLoungeScene({ d, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      position: "relative", display: "block", width: "100%", height: 176,
      padding: 0, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      // A touch rounder than the other cards: the picture's own corners are
      // cut at this radius, so the card clips just inside them.
      border: `1px solid ${CC.line}`, borderRadius: 20, overflow: "hidden",
      background: CC.white,
    }}>
      <img src="/lounge-entrance.webp" alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "left center", display: "block",
        // The drawing came out a shade muted. A little saturation brings the
        // lamp light and the sari up without changing the picture.
        filter: "saturate(1.22) contrast(1.03)",
      }} />
      {/* The right half of the drawing is a beige wash with a faint pattern,
          which reads dull under type. This fades it to the app's own white
          from the door rightwards, so the words sit on a clean ground and
          the scene keeps its warmth. */}
      <span aria-hidden style={{
        position: "absolute", inset: 0, display: "block",
        background: "linear-gradient(90deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.86) 60%, rgba(255,255,255,0.96) 100%)",
      }} />
      <span style={{
        position: "absolute", top: 0, bottom: 0, left: "56%", right: 16,
        display: "flex", flexDirection: "column", justifyContent: "center",
      }}>
        <span style={{
          display: "block", fontSize: 15, fontWeight: 700, color: CC.ink, lineHeight: "20px",
        }}>Welcome to the {d.name} Community.</span>
        <span style={{
          display: "block", fontSize: 12.5, color: CC.body, lineHeight: "17px", marginTop: 5,
        }}>
          Ask a community of{" "}
          <b style={{ fontWeight: 800, color: CC.ink }}>{d.recent3m}</b>
          {" "}who travelled with us.
        </span>
        {/* A link, not a button: the whole card is already the tap target.
            Dark pink is the one action on this card. */}
        <span style={{
          display: "inline-flex", alignItems: "center", alignSelf: "flex-start", gap: 5,
          marginTop: 10, fontSize: 13.5, fontWeight: 700, color: CC.pinkInk,
        }}>View community <ArrowRight size={14} color={CC.pinkInk} /></span>
      </span>
    </button>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   Sunday Community: the people set (29 onwards)

   Everything up to 28 is built from an object or a venue. A stamp, a pass, a
   key, a door. Objects say trip and venues say place, and neither has a person
   in it. This set puts people in the picture instead.

   At launch there is no activity to show, so none of these lean on a live
   question, a reply count or a timestamp. They lean on who is already there,
   which is true on day one.
   ═══════════════════════════════════════════════════════════════════════════ */

const first = (p) => p.name.split(" ")[0];
const been = (p) => `${p.stamp.destination}, ${shortMonth(p.stamp.month)}`;

// The line every card in this set ends on.
const CircleCta = ({ label = "Open Sunday Community", tone = CC.tealInk, mark = CC.teal }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 13, fontWeight: 700, color: tone,
  }}>{label} <ArrowRight size={14} color={mark} /></span>
);

/* ═══ 29. Voices ═══ */
// The shape of a conversation with nothing written in it. Three bubbles at
// three sizes, each with somebody in it, which is enough for the eye to read
// "people talking" from across the room.

export function EntryVoices({ d, faces = [], onOpen }) {
  const b = [
    { p: faces[0], w: 96, ml: 0 },
    { p: faces[1], w: 74, ml: 22 },
    { p: faces[2], w: 86, ml: 8 },
  ].filter((x) => x.p);
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 15, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ display: "block", flexShrink: 0 }}>
        {b.map((x, i) => (
          <span key={x.p.name} style={{
            display: "flex", alignItems: "center", gap: 7, marginLeft: x.ml, marginTop: i ? 6 : 0,
            width: x.w, padding: "5px 8px", borderRadius: "12px 12px 12px 3px",
            background: i % 2 ? CC.tealTint : CC.well,
          }}>
            <TravellerMark name={x.p.name} size={18} />
            <span style={{ display: "block", flex: 1, height: 4, borderRadius: 2, background: CC.line }} />
          </span>
        ))}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>Sunday Community</span>
        <span style={{ display: "block", fontSize: 12.5, color: CC.body, marginTop: 4, lineHeight: "17px" }}>
          <b style={{ fontWeight: 800, color: CC.ink }}>{d.recent3m}</b> travellers have been to {d.name} and answer here.
        </span>
        <span style={{ display: "block", marginTop: 9 }}><CircleCta /></span>
      </span>
    </button>
  );
}

/* ═══ 30. Many stamps, many people ═══ */
// The passport page from 21, but the page belongs to the group rather than to
// one country. Overlapping stamps with the travellers who collected them.

export function EntryManyStamps({ d, faces = [], onOpen }) {
  // Laid out as a cluster rather than a stack: overlapping them in a row hid
  // the labels behind one another, which read as a bug rather than a pile.
  const seats = [
    { x: 0, y: 2, size: 46, tilt: -11 },
    { x: 50, y: 0, size: 46, tilt: 8 },
    { x: 24, y: 44, size: 50, tilt: -4 },
  ];
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ position: "relative", width: 104, height: 96, flexShrink: 0, display: "block" }}>
        {faces.slice(0, 3).map((p, i) => {
          const q = seats[i];
          return (
            <span key={p.name} style={{
              position: "absolute", left: q.x, top: q.y,
              width: q.size, height: q.size, borderRadius: "50%",
              border: `1.5px solid ${CC.soft}`, background: CC.white,
              transform: `rotate(${q.tilt}deg)`,
              display: "grid", placeItems: "center", textAlign: "center",
            }}>
              <span style={{
                fontSize: 7.5, fontWeight: 800, color: CC.body, letterSpacing: "0.2px",
                lineHeight: "9px",
              }}>{p.stamp.destination}<br />{shortMonth(p.stamp.month)}</span>
            </span>
          );
        })}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>Sunday Community</span>
        <span style={{ display: "block", fontSize: 12.5, color: CC.body, marginTop: 4, lineHeight: "17px" }}>
          Every stamp here is somebody you can ask. <b style={{ fontWeight: 800, color: CC.ink }}>{d.recent3m}</b> of them have been to {d.name}.
        </span>
        <span style={{ display: "block", marginTop: 9 }}><CircleCta /></span>
      </span>
    </button>
  );
}


/* ═══ 31. The guest book ═══ */
// Not one more arrangement of round portraits. A page people have signed.
// Many hands, many sizes, slightly off the ruled line: the eye reads "a lot of
// different people were here" before it reads a single name.

export function EntryGuestBook({ d, faces = [], onOpen }) {
  const hand = "'Caveat', cursive";
  const rows = faces.slice(0, 4).map((p, i) => ({
    p, tilt: [-2.5, 1.5, -1, 2][i], size: [25, 22, 27, 23][i], indent: [0, 14, 4, 20][i],
  }));
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "15px 16px 14px",
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{
        display: "block", fontSize: 10.5, fontWeight: 800, color: CC.soft,
        letterSpacing: "1.4px", textTransform: "uppercase",
      }}>Signed by travellers who have been</span>

      <span style={{ display: "block", marginTop: 10 }}>
        {rows.map((r) => (
          <span key={r.p.name} style={{
            display: "flex", alignItems: "baseline", gap: 8,
            borderBottom: `1px solid ${CC.well}`, padding: "2px 0 5px", marginBottom: 5,
            paddingLeft: r.indent,
          }}>
            <span style={{
              fontFamily: hand, fontSize: r.size, fontWeight: 600, color: CC.ink,
              lineHeight: "26px", transform: `rotate(${r.tilt}deg)`, display: "inline-block",
            }}>{r.p.name}</span>
            <span style={{ fontSize: 10, color: CC.soft, whiteSpace: "nowrap", marginLeft: "auto" }}>
              {r.p.city} · {shortMonth(r.p.stamp.month)}
            </span>
          </span>
        ))}
      </span>

      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9 }}>
        <span style={{ fontSize: 12.5, color: CC.body }}>
          and <b style={{ fontWeight: 800, color: CC.ink }}>{Math.max(0, (d.recent3m || 0) - rows.length)}</b> more names on this page
        </span>
        <CircleCta label="Add yours" />
      </span>
    </button>
  );
}

/* ═══ 32. The manifest ═══ */
// A printed record rather than a picture. Set like a passenger list, because a
// list of real names, cities and dates is the least decorated way to prove
// that a lot of separate people are standing behind this.

export function EntryManifest({ d, faces = [], onOpen }) {
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  const rows = faces.slice(0, 3);
  const Cell = ({ children, w, dim }) => (
    <span style={{
      width: w, flexShrink: 0, fontFamily: mono, fontSize: 10.5,
      color: dim ? CC.soft : CC.ink, whiteSpace: "nowrap",
      overflow: "hidden", textOverflow: "ellipsis",
    }}>{children}</span>
  );
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "14px 16px 13px",
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: CC.soft, letterSpacing: "1.5px",
          textTransform: "uppercase", fontFamily: mono,
        }}>Sunday Community · {d.name}</span>
        <span style={{ fontSize: 10, color: CC.soft, fontFamily: mono }}>{d.recent3m} on file</span>
      </span>

      <span style={{ display: "block", borderTop: `1px solid ${CC.ink}`, marginTop: 8, paddingTop: 7 }}>
        {rows.map((p) => (
          <span key={p.name} style={{ display: "flex", gap: 10, padding: "3px 0" }}>
            <Cell w={104}>{p.name.toUpperCase()}</Cell>
            <Cell w={68} dim>{p.city}</Cell>
            <Cell w={58} dim>{shortMonth(p.stamp.month)}</Cell>
          </span>
        ))}
        <span style={{
          display: "block", fontFamily: mono, fontSize: 10.5, color: CC.soft,
          borderTop: `1px dashed ${CC.line}`, marginTop: 5, paddingTop: 6,
        }}>+ {Math.max(0, (d.recent3m || 0) - rows.length)} MORE ON THIS LIST</span>
      </span>

      <span style={{ display: "block", marginTop: 11 }}>
        <CircleCta label="Ask anyone on it" />
      </span>
    </button>
  );
}

/* ═══ 33. Contact sheet ═══ */
// Actual photographs of actual travellers, which no arrangement of initials
// can match. Laid out as a contact sheet so the frames read as many separate
// trips rather than one picture.

export function EntryContactSheet({ d, onOpen }) {
  const shots = customerPhotos[d.name] || [];
  const names = couplePhotoNames[d.name] || [];
  // Spread the picks across the whole roll. Taking the first four gave four
  // frames of the same couple, which is the opposite of what a contact sheet
  // is for.
  const frames = shots.length
    ? [0, 1, 2, 3].map((k) => {
        const i = Math.round((k * (shots.length - 1)) / 3);
        return { src: shots[i], who: names[i] };
      })
    : [0, 1, 2, 3].map(() => ({ src: d.hero, who: null }));
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: 0, overflow: "hidden",
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.ink,
    }}>
      <span style={{ display: "flex", gap: 2, padding: 2 }}>
        {frames.map((f, i) => (
          <span key={i} style={{ flex: 1, position: "relative", display: "block" }}>
            <img src={f.src} alt="" style={{
              width: "100%", height: 84, objectFit: "cover", display: "block",
            }} />
            <span style={{
              position: "absolute", left: 0, right: 0, bottom: 0,
              fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.92)",
              padding: "8px 4px 3px", letterSpacing: "0.2px",
              background: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.65))",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{f.who || d.name}</span>
          </span>
        ))}
      </span>
      <span style={{ display: "block", background: CC.white, padding: "12px 15px 13px" }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink, lineHeight: "20px" }}>
          Real travellers, real trips. <b style={{ fontWeight: 800 }}>{d.recent3m}</b> of them have been to {d.name}.
        </span>
        <span style={{ display: "block", marginTop: 8 }}><CircleCta /></span>
      </span>
    </button>
  );
}

/* ═══ 34. Postcards ═══ */
// The back of a postcard, which is the one surface in travel that is nothing
// but one person writing to another. Two of them fanned, each signed by a
// different traveller, so the card is made of correspondence.

export function EntryPostcards({ d, faces = [], onOpen }) {
  const hand = "'Caveat', cursive";
  const two = faces.slice(0, 2);
  const Card = ({ p, style }) => (
    <span style={{
      position: "absolute", width: 128, height: 88, background: CC.white,
      border: `1px solid ${CC.mistLine}`, borderRadius: 3, padding: 8,
      boxShadow: "0 3px 10px rgba(37,67,66,0.13)", display: "block", ...style,
    }}>
      <span style={{
        position: "absolute", top: 7, right: 7, width: 22, height: 17,
        border: `1px dashed ${CC.mistLine}`, display: "block",
      }} />
      {[74, 62, 70].map((w, i) => (
        <span key={i} style={{
          display: "block", width: w, height: 2, borderRadius: 1,
          background: CC.well, marginTop: i ? 7 : 6,
        }} />
      ))}
      <span style={{
        position: "absolute", left: 8, bottom: 6, fontFamily: hand,
        fontSize: 17, fontWeight: 600, color: CC.ink, lineHeight: "18px",
      }}>{p.name.split(" ")[0]}</span>
      <span style={{
        position: "absolute", right: 8, bottom: 8, fontSize: 8, color: CC.soft,
      }}>{shortMonth(p.stamp.month)}</span>
    </span>
  );
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: 16,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ position: "relative", width: 142, height: 104, flexShrink: 0, display: "block" }}>
        {two[1] && <Card p={two[1]} style={{ left: 14, top: 0, transform: "rotate(-6deg)" }} />}
        {two[0] && <Card p={two[0]} style={{ left: 0, top: 14, transform: "rotate(3deg)" }} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink, lineHeight: "19px" }}>
          Write to <b style={{ fontWeight: 800 }}>{d.recent3m}</b> travellers who have already been to {d.name}.
        </span>
        <span style={{ display: "block", marginTop: 9 }}><CircleCta label="Send a question" /></span>
      </span>
    </button>
  );
}

/* ═══ 35. The wall of names ═══ */
// No portrait, no object, no photograph. Just the names, set at the weights a
// wall of them would really have. The mass is the message, and it costs almost
// no height to print.

export function EntryNameWall({ d, onOpen }) {
  const all = Object.values(PEOPLE);
  const weight = (i) => [800, 500, 700, 400, 600, 500, 800, 400][i % 8];
  const size = (i) => [15, 12, 13.5, 11.5, 14, 12.5, 13, 11.5][i % 8];
  const fade = (i) => [1, 0.5, 0.82, 0.4, 0.92, 0.6, 0.72, 0.45][i % 8];
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "15px 16px 14px",
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{
        display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 9, rowGap: 3,
      }}>
        {all.map((p, i) => (
          <span key={p.name} style={{
            fontSize: size(i), fontWeight: weight(i), color: CC.ink,
            opacity: fade(i), whiteSpace: "nowrap", lineHeight: "20px",
          }}>{p.name.split(" ")[0]}</span>
        ))}
        <span style={{ fontSize: 12, color: CC.soft, whiteSpace: "nowrap", lineHeight: "20px" }}>
          and {Math.max(0, (d.recent3m || 0) - all.length)} more
        </span>
      </span>
      <span style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 11, paddingTop: 10, borderTop: `1px solid ${CC.well}`,
      }}>
        <span style={{ fontSize: 12.5, color: CC.body }}>Everyone here has been to {d.name}</span>
        <CircleCta label="Ask them" />
      </span>
    </button>
  );
}


/* ── Shared by the reference set (36 onwards) ── */

// Real photographs of travellers, cropped round. Initials are what the app has
// everywhere else, and initials are exactly why the earlier attempts read as
// grey chips rather than as people.
function FacePhoto({ src, size, style, edge = CC.white }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden",
      border: `${size > 40 ? 3 : 2}px solid ${edge}`,
      boxShadow: "0 3px 10px rgba(37,67,66,0.16)", display: "block", ...style,
    }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </span>
  );
}

// Photographs for a destination, spread across the whole roll so the same
// couple does not come back four times.
const rollFor = (d, n) => {
  const shots = customerPhotos[d.name] || [];
  if (!shots.length) return Array.from({ length: n }, () => d.hero);
  return Array.from({ length: n }, (_, i) => shots[Math.round((i * (shots.length - 1)) / (n - 1))]);
};

// Subjects this room actually holds, with an icon each. Subjects are not live
// activity: they are true on launch day, when no one has asked anything yet.
const SUBJECT_ICON = {
  Boats: Ship, Weather: CloudSun, Cities: Landmark, Money: Wallet,
  Transport: Bus, Food: Utensils, Activities: Camera, Stays: BedDouble,
  Visas: FileCheck2, Packing: Backpack, Temples: Landmark,
};
const SUBJECT_TINT = [
  { bg: CC.tealTint, fg: CC.tealInk },
  { bg: CC.goldTint, fg: CC.goldInk },
  { bg: CC.pinkTint, fg: CC.pinkInk },
  { bg: CC.mist, fg: CC.ink },
];
const subjectsOf = (questions = [], n = 4) => {
  const seen = [];
  for (const q of questions) for (const t of q.tags || []) if (!seen.includes(t)) seen.push(t);
  return seen.slice(0, n);
};

/* ═══ 36. Constellation ═══ */
// Travellers at three different sizes on two orbits, the nearest in photograph
// and the furthest reduced to a mark. Depth is what the flat ring was missing:
// a crowd has people at the front and people behind them.

export function EntryConstellation({ d, onOpen, size, compact = false }) {
  // Every ring position carries a photograph. The grey placeholders that used
  // to sit on the outer ring read as missing images rather than as distance.
  //
  // Compact is the home page: a traveller in the middle instead of the house
  // mark, a tighter orbit and smaller frames, so the block costs the home a
  // good deal less height than it costs the trip screen.
  const pics = rollFor(d, compact ? 6 : 7);
  const S = size || (compact ? 116 : 150);
  // The compact figures below are already final pixels, so they must not be
  // scaled again. Running them through the 150px scale shrank the drawing to
  // three quarters and left a dead band above and below it inside the card.
  const k = compact ? 1 : S / 150;
  // Five, evenly spaced, sitting on the ring. The radius has to clear the
  // middle photograph by a real gap: at 38 the orbit touched it and the whole
  // thing read as one clump rather than as a circle of people.
  const ring = compact
    ? [
        { a: -104, r: 44, size: 27, pic: 1 },
        { a: -32, r: 44, size: 25, pic: 2 },
        { a: 40, r: 44, size: 27, pic: 3 },
        { a: 112, r: 44, size: 24, pic: 4 },
        { a: 184, r: 44, size: 26, pic: 5 },
      ]
    : [
        { a: -100, r: 52, size: 42, pic: 0 },
        { a: 20, r: 56, size: 38, pic: 1 },
        { a: 140, r: 56, size: 34, pic: 2 },
        { a: -35, r: 64, size: 26, pic: 3 },
        { a: 75, r: 62, size: 24, pic: 4 },
        { a: 182, r: 60, size: 28, pic: 5 },
        { a: 238, r: 62, size: 22, pic: 6 },
      ];
  const hub = compact ? 36 : 52;
  const at = (o) => ({
    left: S / 2 + o.r * k * Math.cos((o.a * Math.PI) / 180) - (o.size * k) / 2,
    top: S / 2 + o.r * k * Math.sin((o.a * Math.PI) / 180) - (o.size * k) / 2,
  });
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: compact ? 10 : 6, width: "100%",
      textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      // The drawing all but fills its box, so the card needs very little above
      // and below it. The side padding stays: the text still needs its margin.
      padding: compact ? "5px 14px" : "10px 16px 10px 4px",
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ position: "relative", width: S, height: S, flexShrink: 0, display: "block" }}>
        {(compact ? [88] : [54, 84, 118]).map((r) => (
          <span key={r} style={{
            position: "absolute", left: (S - r * k) / 2, top: (S - r * k) / 2,
            width: r * k, height: r * k, borderRadius: "50%",
            border: `1px solid ${CC.well}`, display: "block",
          }} />
        ))}
        {/* On the trip screen the house mark holds the middle. On the home a
            traveller does, so the block is people the whole way through. */}
        {compact ? (
          <FacePhoto src={pics[0]} size={hub * k} style={{
            position: "absolute", left: S / 2 - (hub * k) / 2, top: S / 2 - (hub * k) / 2,
          }} />
        ) : (
          <span style={{
            position: "absolute", left: S / 2 - (hub * k) / 2, top: S / 2 - (hub * k) / 2,
            width: hub * k, height: hub * k, borderRadius: "50%", background: CC.white,
            border: `1px solid ${CC.line}`, boxShadow: "0 2px 10px rgba(37,67,66,0.10)",
            display: "grid", placeItems: "center", overflow: "hidden",
          }}>
            <img src="/logo-mark.png" alt="30 Sundays" style={{
              width: hub * k * 0.66, height: hub * k * 0.66, objectFit: "contain", display: "block",
            }} />
          </span>
        )}
        {ring.map((o, i) => (
          <FacePhoto key={i} src={pics[o.pic]} size={o.size * k} style={{ position: "absolute", ...at(o) }} />
        ))}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        {!compact && (
          <span style={{
            display: "block", fontSize: 15.5, fontWeight: 800, color: CC.ink, lineHeight: "20px",
          }}>Sunday Community</span>
        )}
        <span style={{
          display: "block", color: compact ? CC.ink : CC.body,
          fontSize: compact ? 13 : 12.5, fontWeight: compact ? 600 : 400,
          marginTop: compact ? 0 : 4, lineHeight: compact ? "18px" : "17px",
        }}>
          <b style={{ fontWeight: 800, color: CC.ink }}>{d.recent3m}</b> here have already been to {d.name}.
        </span>
        <span style={{ display: "block", marginTop: compact ? 6 : 10 }}>
          <CircleCta label={compact ? "Open the Community" : "Open Sunday Community"} />
        </span>
      </span>
    </button>
  );
}

/* ═══ 37. The arc ═══ */
// The academy pattern: a shallow arc of photographs, a small kicker, then one
// confident line. The arc reads as a group facing you rather than a list.

export function EntryArc({ d, onOpen }) {
  const pics = rollFor(d, 9);
  // A conveyor, not a carousel that wraps. The window is wider than the arc, so
  // a photograph fades in off the right, travels left growing into the focus
  // and shrinking out of it, and fades away off the left. Nothing jumps back
  // across the row, which is what a wrapping list has to do.
  //
  // Every frame is the same box, moved and scaled by one transform. Animating
  // left, top, width and height instead put nine elements through layout on
  // every frame, which is what made it stutter. Transform and opacity are the
  // only two properties a browser can hand to the compositor.
  const BASE = 56, W = 300, GAP = 58, H = 60, MID = 30;
  const SLOT = {
    "-1": [20, 20, 0], 0: [26, 16, 0],
    1: [34, 11, 1], 2: [44, 5, 1], 3: [56, 0, 1], 4: [44, 5, 1], 5: [34, 11, 1],
    6: [26, 16, 0], 7: [20, 20, 0],
  };
  const [start, setStart] = useState(0);
  const still = useReducedMotion();

  useEffect(() => {
    if (still) return undefined;
    const t = setInterval(() => setStart(n => n + 1), 2600);
    return () => clearInterval(t);
  }, [still]);

  const win = [];
  for (let k = -1; k <= 7; k += 1) win.push(start + k);

  // Soft at both ends, so a frame dissolves rather than meeting a hard clip.
  const fade = "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 13%, #000 87%, rgba(0,0,0,0) 100%)";

  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "center", cursor: "pointer",
      fontFamily: "inherit", padding: "16px 16px 15px",
      border: `1px solid ${CC.line}`, borderRadius: 16,
      background: `linear-gradient(${CC.well}, ${CC.white} 62%)`,
    }}>
      <span style={{
        position: "relative", display: "block", width: W, height: H, margin: "0 auto",
        WebkitMaskImage: fade, maskImage: fade,
      }}>
        {win.map((idx) => {
          const slot = idx - start;
          const [size, lift, o] = SLOT[slot] || [20, 20, 0];
          const cx = W / 2 + (slot - 3) * GAP;
          const cy = MID + lift;
          return (
            <span key={idx} style={{
              position: "absolute", left: 0, top: 0, width: BASE, height: BASE,
              transformOrigin: "center center",
              transform: `translate3d(${cx - BASE / 2}px, ${cy - BASE / 2}px, 0) scale(${size / BASE})`,
              opacity: o,
              willChange: still ? "auto" : "transform, opacity",
              transition: still ? "none" : "transform 820ms cubic-bezier(.33,0,.2,1), opacity 820ms ease",
            }}>
              <FacePhoto src={pics[((idx % pics.length) + pics.length) % pics.length]} size={BASE} />
            </span>
          );
        })}
      </span>

      {/* The name is the title, so the kicker that also said it has gone. */}
      <span style={{
        display: "block", fontSize: 20, fontWeight: 800, color: CC.ink,
        letterSpacing: "-0.4px", lineHeight: "26px", marginTop: 10,
      }}>Sunday Community</span>
      <span style={{
        display: "block", fontSize: 13.5, color: CC.body, lineHeight: "19px", marginTop: 3,
      }}>Ask travelers who&apos;ve been there before.</span>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5, marginTop: 10,
        fontSize: 13.5, fontWeight: 700, color: CC.pink,
      }}>View Community <ArrowRight size={15} color={CC.pink} /></span>
    </button>
  );
}

/* ═══ 38. Subject tiles ═══ */
// Blocks of colour, the way a community app shows what a group is for. The
// subjects are real: they are what this room already holds. Colour does the
// work a portrait cannot at this size.

export function EntrySubjectTiles({ d, questions = [], onOpen }) {
  const subs = subjectsOf(questions, 4);
  const pics = rollFor(d, 3);
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: 15,
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "flex" }}>
          {pics.map((src, i) => (
            <FacePhoto key={i} src={src} size={34} style={{ marginLeft: i ? -12 : 0 }} />
          ))}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, color: CC.ink }}>Sunday Community</span>
          <span style={{ display: "block", fontSize: 11.5, color: CC.body, marginTop: 1 }}>
            {d.recent3m} have been to {d.name}
          </span>
        </span>
      </span>

      <span style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        {subs.map((t, i) => {
          const I = SUBJECT_ICON[t] || MessageCircleQuestion;
          const tint = SUBJECT_TINT[i % SUBJECT_TINT.length];
          return (
            <span key={t} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 10px",
              borderRadius: 12, background: tint.bg,
            }}>
              <I size={16} color={tint.fg} strokeWidth={2.2} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: tint.fg }}>{t}</span>
            </span>
          );
        })}
      </span>

      <span style={{ display: "block", marginTop: 12 }}>
        <CircleCta label="Ask about any of these" />
      </span>
    </button>
  );
}

/* ═══ 39. Drawn together ═══ */
// Three travellers drawn flat, in the brand's own colours. A photograph shows
// who has been; a drawing shows what the place is for, which is people
// standing together working something out.

export function EntryDrawnTogether({ d, onOpen }) {
  // Everything below the table line is hidden by the table, so the drawing only
  // has to get heads, shoulders and arms right. A first attempt drew whole
  // bodies as rounded rectangles and they read as coloured eggs.
  const Person = ({ x, y, body, cuff, skin, hair, flip = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      <path d={`M -13 4 q 13 -13 26 0`} fill={hair} />
      <circle cx="0" cy="8" r="11" fill={skin} />
      <path d={`M -12 -1 q 12 -12 24 0 l 2 6 q -14 -8 -28 0 z`} fill={hair} />
      <rect x="-15" y="21" width="30" height="42" rx="13" fill={body} />
      {/* the arm that reaches in towards the table */}
      <rect x="9" y="30" width="10" height="30" rx="5" fill={cuff}
        transform="rotate(-18 14 34)" />
      <rect x="-19" y="30" width="10" height="28" rx="5" fill={cuff}
        transform="rotate(10 -14 34)" />
    </g>
  );
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: 0, overflow: "hidden",
      border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white,
    }}>
      <span style={{ display: "block", background: CC.mist }}>
        <svg viewBox="0 0 200 104" width="100%" height="116" style={{ display: "block" }} aria-hidden>
          {/* the soft ground the group stands on, the way the references do it */}
          <circle cx="100" cy="74" r="58" fill={CC.tealTint} opacity="0.75" />
          <circle cx="158" cy="30" r="7" fill={CC.goldTint} />
          <circle cx="40" cy="24" r="4.5" fill={CC.pinkTint} />

          <Person x="56" y="20" body={CC.teal} cuff={CC.tealInk} skin="#D79A72" hair="#3B2A22" />
          <Person x="100" y="8" body={CC.gold} cuff={CC.goldInk} skin="#E8B387" hair="#5B3A22" />
          <Person x="144" y="24" body={CC.coral} cuff={CC.pinkInk} skin="#B87A52" hair="#2E1F19" flip={-1} />

          {/* the table they are gathered at, drawn last so it sits in front */}
          <rect x="24" y="84" width="152" height="9" rx="4.5" fill={CC.white} />
          <rect x="84" y="70" width="34" height="15" rx="2.5" fill={CC.white} />
          <rect x="89" y="75" width="24" height="2.5" rx="1.25" fill={CC.line} />
          <rect x="89" y="80" width="15" height="2.5" rx="1.25" fill={CC.line} />
        </svg>
      </span>
      <span style={{ display: "block", padding: "13px 16px 14px" }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: CC.ink, lineHeight: "21px", letterSpacing: "-0.3px" }}>
          Nobody plans a trip alone here
        </span>
        <span style={{ display: "block", fontSize: 12.5, color: CC.body, marginTop: 4, lineHeight: "17px" }}>
          <b style={{ fontWeight: 800, color: CC.ink }}>{d.recent3m}</b> travellers have been to {d.name} and answer in the Community.
        </span>
        <span style={{ display: "block", marginTop: 10 }}><CircleCta /></span>
      </span>
    </button>
  );
}

/* ═══ 40. Subject cards ═══ */
// The explore-communities grid, narrowed to one destination. Each card is a
// subject with the travellers who can speak to it, which is the closest thing
// to a group directory that is honest before anyone has posted.

export function EntrySubjectCards({ d, questions = [], faces = [], onOpen }) {
  const subs = subjectsOf(questions, 4);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: CC.ink, letterSpacing: "-0.3px" }}>Sunday Community</span>
        <span style={{ fontSize: 12, color: CC.body }}>{d.recent3m} have been to {d.name}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        {subs.map((t, i) => {
          const I = SUBJECT_ICON[t] || MessageCircleQuestion;
          const tint = SUBJECT_TINT[i % SUBJECT_TINT.length];
          return (
            <button key={t} onClick={onOpen} style={{
              display: "block", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              padding: 12, border: `1px solid ${CC.line}`, borderRadius: 14, background: CC.white,
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: 10, background: tint.bg,
                display: "grid", placeItems: "center",
              }}>
                <I size={16} color={tint.fg} strokeWidth={2.2} />
              </span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: CC.ink, marginTop: 9 }}>{t}</span>
              <span style={{ display: "flex", alignItems: "center", marginTop: 7 }}>
                {[0, 1, 2].map((k) => faces[(i + k) % Math.max(1, faces.length)]).filter(Boolean).map((p, k) => (
                  <span key={p.name} style={{
                    marginLeft: k ? -8 : 0, borderRadius: "50%", border: `2px solid ${CC.white}`,
                  }}><TravellerMark name={p.name} size={22} /></span>
                ))}
                <span style={{ fontSize: 10.5, color: CC.soft, marginLeft: 7 }}>can answer</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   41-45: the orbit as a section of its own.

   Same drawing, five grounds. Each carries the name, one line under ten words,
   and nothing else: no call to action, because a card this size already reads
   as a thing you press.
   ═══════════════════════════════════════════════════════════════════════════ */

// The orbit on its own, so the five below differ only in the ground they sit
// on and the way the words are set beside them.
function CircleOrbit({ d, size = 116, edge = CC.white }) {
  const pics = rollFor(d, 6);
  const hub = Math.round(size * 0.31);
  const r = size * 0.379;
  const ring = [
    { a: -104, s: 0.233 }, { a: -32, s: 0.216 }, { a: 40, s: 0.233 },
    { a: 112, s: 0.207 }, { a: 184, s: 0.224 },
  ];
  return (
    <span style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "block" }}>
      <span style={{
        position: "absolute", left: size / 2 - r, top: size / 2 - r,
        width: r * 2, height: r * 2, borderRadius: "50%",
        border: `1px solid ${edge === CC.white ? CC.well : "rgba(255,255,255,0.18)"}`, display: "block",
      }} />
      <FacePhoto src={pics[0]} size={hub} edge={edge} style={{
        position: "absolute", left: size / 2 - hub / 2, top: size / 2 - hub / 2,
      }} />
      {ring.map((o, i) => {
        const px = size * o.s;
        return (
          <FacePhoto key={i} src={pics[i + 1]} size={px} edge={edge} style={{
            position: "absolute",
            left: size / 2 + r * Math.cos((o.a * Math.PI) / 180) - px / 2,
            top: size / 2 + r * Math.sin((o.a * Math.PI) / 180) - px / 2,
          }} />
        );
      })}
    </span>
  );
}

const CircleTitle = ({ color = CC.ink, size = 16 }) => (
  <span style={{
    display: "block", fontSize: size, fontWeight: 800, color,
    letterSpacing: "-0.3px", lineHeight: `${size + 4}px`,
  }}>Sunday Community</span>
);

const CircleLine = ({ d, color = CC.body, ink = CC.ink, size = 12.5 }) => (
  <span style={{ display: "block", fontSize: size, color, marginTop: 4, lineHeight: `${size + 5}px` }}>
    <b style={{ fontWeight: 800, color: ink }}>{d.recent3m}</b> have been to {d.name}. Ask them anything.
  </span>
);

/* ═══ 41. Golden top ═══ */
// A wash of the brand's gold falling out of the top edge. The one that asks to
// be noticed in a run of white cards, without becoming a coloured box.

export function EntryCircleGold({ d, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: "12px 14px",
      border: `1px solid ${CC.goldLine}`, borderRadius: 18,
      background: `linear-gradient(${CC.goldTint} 0%, #FFFDF8 58%, ${CC.white} 100%)`,
      boxShadow: "0 6px 18px rgba(176,128,22,0.10)",
    }}>
      <CircleOrbit d={d} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <CircleTitle />
        <CircleLine d={d} />
      </span>
      <ChevronRight size={18} color={CC.goldInk} style={{ flexShrink: 0 }} />
    </button>
  );
}

/* ═══ 42. Lagoon edge ═══ */
// White, with the lagoon carried as a thick rule down the left. Quietest of
// the five and the easiest to drop between two existing sections.

export function EntryCircleEdge({ d, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: "12px 14px 12px 12px",
      border: `1px solid ${CC.line}`, borderLeft: `4px solid ${CC.teal}`, borderRadius: 16,
      background: CC.white,
    }}>
      <CircleOrbit d={d} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <CircleTitle />
        <CircleLine d={d} />
      </span>
    </button>
  );
}

/* ═══ 43. Mirrored ═══ */
// The words first, the drawing on the right, on a raised white card. Reading
// order puts the name before the faces rather than after them.

export function EntryCircleMirror({ d, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: "12px 10px 12px 16px",
      border: `1px solid ${CC.line}`, borderRadius: 18, background: CC.white,
      boxShadow: "0 8px 22px rgba(37,67,66,0.10)",
    }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <CircleTitle />
        <CircleLine d={d} />
      </span>
      <CircleOrbit d={d} size={108} />
    </button>
  );
}

/* ═══ 44. Centred ═══ */
// The drawing above the words rather than beside them, which gives the orbit
// its full width and makes the block read as a section, not a row.

export function EntryCircleCentred({ d, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "block", width: "100%", textAlign: "center", cursor: "pointer",
      fontFamily: "inherit", padding: "16px 16px 18px",
      border: `1px solid ${CC.line}`, borderRadius: 18,
      background: `radial-gradient(120% 90% at 50% 0%, ${CC.well} 0%, ${CC.white} 70%)`,
    }}>
      <span style={{ display: "flex", justifyContent: "center" }}>
        <CircleOrbit d={d} size={132} />
      </span>
      <span style={{ display: "block", marginTop: 12 }}>
        <CircleTitle size={18} />
        <CircleLine d={d} size={13} />
      </span>
    </button>
  );
}

/* ═══ 45. Deep ground ═══ */
// The brand's forest green behind the photographs. Nothing else on a trip
// screen is dark, so this one is impossible to scroll past.

export function EntryCircleDeep({ d, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: "12px 14px",
      border: "none", borderRadius: 18,
      background: `linear-gradient(135deg, ${CC.ink} 0%, #16302F 100%)`,
      boxShadow: "0 10px 26px rgba(37,67,66,0.28)",
    }}>
      <CircleOrbit d={d} edge="#2F514F" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <CircleTitle color={CC.white} />
        <CircleLine d={d} color="rgba(255,255,255,0.78)" ink={CC.white} />
      </span>
      <ChevronRight size={18} color="rgba(255,255,255,0.55)" style={{ flexShrink: 0 }} />
    </button>
  );
}

export const ENTRY_VARIANTS = [
  { id: "one-line", n: 1, name: "One line", pattern: "List row", weight: "Lightest",
    note: "No heading, no blurb. One row in the run of the page, the way a settings list behaves.",
    Comp: EntryOneLine },
  { id: "section-row", n: 2, name: "Section and row", pattern: "House convention", weight: "Light",
    note: "Heading, one line of explanation, one card. Nothing new to learn, which is its whole argument.",
    Comp: EntrySectionRow },
  { id: "stats", n: 3, name: "Two numbers", pattern: "Stat pair", weight: "Medium",
    note: "The figures do the selling. The eye reads numbers before prose, which is why dashboards lead with them.",
    Comp: EntryStats },
  { id: "preview", n: 4, name: "A real question", pattern: "Content preview", weight: "Heavy",
    note: "Shows the thing instead of describing it, the way a news tile shows a headline. Proves the value before the tap.",
    Comp: EntryPreview },
  { id: "strip", n: 5, name: "Full bleed strip", pattern: "Breaks the rhythm", weight: "Medium", bleed: true,
    note: "Every other section is a card, so a band that runs edge to edge reads as a different kind of thing.",
    Comp: EntryStrip },
  { id: "carousel", n: 6, name: "Swipeable questions", pattern: "Horizontal peek", weight: "Heavy",
    note: "Three real questions and a tile for the rest. The cut-off card is what tells a thumb it can scroll.",
    Comp: EntryCarousel },

  // The tinted band, five more grounds.
  { id: "band-gold", n: 7, name: "Golden band", pattern: "Tinted ground", weight: "Medium", bleed: true,
    note: "Same shape as 5, warmer ground. Golden is the attention colour, so it asks for a glance harder than lagoon.",
    Comp: EntryBandGold },
  { id: "band-dark", n: 8, name: "Deep green band", pattern: "Inverted ground", weight: "Medium", bleed: true,
    note: "Nothing else on a trip screen is dark, so this is the loudest the band can be. The fuchsia unread count is at its strongest here.",
    Comp: EntryBandDark },
  { id: "band-fade", n: 9, name: "Fading band", pattern: "Gradient ground", weight: "Medium", bleed: true,
    note: "Lagoon at the top, white at the bottom. It does not stop hard against the next section, so it reads as part of the page.",
    Comp: EntryBandFade },
  { id: "band-mist", n: 10, name: "Warm neutral band", pattern: "Neutral ground", weight: "Medium", bleed: true,
    note: "Coastal mist, the brand's own off-white. A different surface without being a colour. The quietest of the tinted set.",
    Comp: EntryBandMist },
  { id: "band-recent", n: 12, name: "Who has actually been", pattern: "Gold ground, proof copy", weight: "Medium", bleed: true,
    note: "The golden band, leading with the travellers who went with us in the last three months. The month cohort sits inside the Community instead.",
    Comp: GoldRecent },
  { id: "band-card", n: 11, name: "Tinted card", pattern: "Tinted, inset", weight: "Medium",
    note: "The same lagoon ground, but inset and rounded. Keeps the card rhythm of the trip screen and changes only what sits behind the type.",
    Comp: EntryBandCard },

  // The artistic set: the destination's own photo, and the shapes travel
  // already owns.
  { id: "postcard", n: 13, name: "Postcard", pattern: "Photo led", weight: "Heavy",
    note: "The destination photo as a postcard, the month where the stamp goes, and the invite on the message side.",
    Comp: EntryPostcard },
  { id: "ticket", n: 14, name: "Boarding pass", pattern: "Ticket", weight: "Medium",
    note: "A ticket with a tear line. The month is the stub, the Community is the destination, and the barcode is just a barcode.",
    Comp: EntryTicket },
  { id: "stamp", n: 15, name: "Passport stamp", pattern: "Rubber stamp", weight: "Medium",
    note: "The stamp every trip ends with, pressed a little crooked the way a real one lands. The type beside it stays straight.",
    Comp: EntryStamp },
  { id: "window", n: 16, name: "Through the window", pattern: "Full photo, full bleed", weight: "Heavy", bleed: true,
    note: "The destination out of the window and the travellers you would be asking looking back. The loudest of the artistic set.",
    Comp: EntryWindow },
  { id: "polaroid", n: 17, name: "Polaroid", pattern: "Instant photo", weight: "Medium",
    note: "One instant photo pinned a little off straight, with the invite written beside it like a caption.",
    Comp: EntryPolaroid },

  // Ten more objects a trip leaves behind, on the lines of 14, 15 and 17:
  // things rather than sections, each a shade off straight.
  { id: "luggage-tag", n: 18, name: "Luggage tag", pattern: "Object, off straight", weight: "Medium",
    note: "The tag off the handle, hole and all. The three letter code does the destination's work at a glance.",
    Comp: EntryLuggageTag },
  { id: "departure-board", n: 19, name: "Departure board", pattern: "Dark object", weight: "Medium",
    note: "The airport board, letter spaced and lit. The only dark object in the set, which is why the eye stops on it.",
    Comp: EntryDepartureBoard },
  { id: "airmail", n: 20, name: "Airmail envelope", pattern: "Striped border", weight: "Medium",
    note: "The red and blue stripes do all the work: nothing else on the screen has a border like it.",
    Comp: EntryAirmail },
  { id: "postage-stamp", n: 21, name: "Immigration stamp", pattern: "Drawn stamp", weight: "Medium",
    note: "The entry stamp the destination would put in a passport, drawn in charcoal so every country has one.",
    Comp: EntryPostageStamp },
  { id: "visa", n: 22, name: "Entry visa", pattern: "Official document", weight: "Medium",
    note: "A visa sticker, machine readable line and all. Official looking, because a visa is what grants entry.",
    Comp: EntryVisa },
  { id: "room-key", n: 23, name: "Room key", pattern: "Object, off straight", weight: "Medium",
    note: "The hotel key tag. The Community as a room your booking holds the key to.",
    Comp: EntryRoomKey },
  { id: "journal", n: 24, name: "Journal page", pattern: "Ruled paper", weight: "Medium",
    note: "A page from the trip notebook, written in the traveller's own voice. Sells by sounding like the reader.",
    Comp: EntryJournal },
  { id: "baggage-sticker", n: 25, name: "Baggage sticker", pattern: "Object, off straight", weight: "Medium",
    note: "The strip the airline wraps round a handle: barcode, route code, stuck on a shade crooked.",
    Comp: EntryBaggageSticker },
  { id: "patch", n: 26, name: "Travel patch", pattern: "Crest", weight: "Medium",
    note: "The embroidered badge off a backpack, stitched rings and a plane, sitting beside the type like a crest.",
    Comp: EntryPatch },
  { id: "folded-map", n: 27, name: "Folded map", pattern: "Paper texture", weight: "Medium",
    note: "A map out of the glovebox: fold shadows, a dotted route, and the pin where the answers are.",
    Comp: EntryFoldedMap },

  // The lounge entrance, drawn.
  { id: "lounge-scene", n: 28, name: "Lounge entrance", pattern: "Illustrated scene", weight: "Heavy",
    note: "The sign, the open door and the host, drawn as one scene. The picture is the ground and the words on the right are live. The sign in the drawing still reads SUNDAY LOUNGE: it is painted into the picture and needs the illustration redrawn.",
    Comp: EntryLoungeScene },

  // ── Sunday Community: the people set ──
  { id: "voices", n: 29, name: "Voices", pattern: "People", weight: "Medium",
    note: "The shape of a conversation with nothing written in it. Three bubbles, three people, no content to go stale.",
    Comp: EntryVoices },
  { id: "many-stamps", n: 30, name: "Many stamps", pattern: "People", weight: "Medium",
    note: "The passport page from 21, but the page belongs to the group. Every stamp is somebody you can ask.",
    Comp: EntryManyStamps },
  { id: "guest-book", n: 31, name: "The guest book", pattern: "Handwriting", weight: "Heavy",
    note: "A page people have signed. Many hands at many sizes, which says a lot of separate people before a single name is read.",
    Comp: EntryGuestBook },
  { id: "manifest", n: 32, name: "The manifest", pattern: "Printed record", weight: "Heavy",
    note: "A passenger list. The least decorated way to prove real people stand behind this: names, cities, dates, in print.",
    Comp: EntryManifest },
  { id: "contact-sheet", n: 33, name: "Contact sheet", pattern: "Photography", weight: "Heavy",
    note: "Actual photographs of actual travellers, laid out as a contact sheet so the frames read as many separate trips.",
    Comp: EntryContactSheet },
  { id: "postcards", n: 34, name: "Postcards", pattern: "Paper objects", weight: "Medium",
    note: "The back of a postcard is one person writing to another. Two of them, fanned, each signed by a different traveller.",
    Comp: EntryPostcards },
  { id: "name-wall", n: 35, name: "The wall of names", pattern: "Typographic", weight: "Light",
    note: "No portrait, no object, no photograph. Just the names at the weights a wall of them would really have.",
    Comp: EntryNameWall },

  // ── Built from the community apps the user pulled as reference ──
  { id: "constellation", n: 36, name: "Constellation", pattern: "Orbit", weight: "Heavy",
    note: "Travellers on two orbits around the house mark, every position a photograph. This is the one on the trip screen and, in its short form, on the home page.",
    Comp: EntryConstellation },
  { id: "arc", n: 37, name: "The arc", pattern: "Group portrait", weight: "Heavy",
    note: "A shallow arc of photographs, the name as the title, one line under it, and the action in brand pink. The arc reads as a group facing you rather than a list. This is the one on the itinerary and destination screens.",
    Comp: EntryArc },
  { id: "subject-tiles", n: 38, name: "Subject tiles", pattern: "Colour blocks", weight: "Heavy",
    note: "Blocks of colour for what the room is actually about. Colour does the work a portrait cannot at this size.",
    Comp: EntrySubjectTiles },
  { id: "drawn-together", n: 39, name: "Drawn together", pattern: "Illustration", weight: "Heavy",
    note: "Three travellers drawn flat in the brand's colours. A photograph shows who has been; a drawing shows what the place is for.",
    Comp: EntryDrawnTogether },
  { id: "subject-cards", n: 40, name: "Subject cards", pattern: "Directory grid", weight: "Heavy",
    bleed: false,
    note: "The explore-communities grid narrowed to one destination. Each subject carries the travellers who can speak to it.",
    Comp: EntrySubjectCards },

  // ── The orbit as a section of its own: same drawing, five grounds ──
  { id: "circle-gold", n: 41, name: "Golden top", pattern: "Orbit section", weight: "Medium",
    note: "A wash of the brand's gold falling out of the top edge. The one that asks to be noticed in a run of white cards.",
    Comp: EntryCircleGold },
  { id: "circle-edge", n: 42, name: "Lagoon edge", pattern: "Orbit section", weight: "Medium",
    note: "White, with the lagoon as a thick rule down the left. The quietest, and the easiest to drop between two existing sections.",
    Comp: EntryCircleEdge },
  { id: "circle-mirror", n: 43, name: "Mirrored", pattern: "Orbit section", weight: "Medium",
    note: "Words first, drawing on the right, on a raised card. Reading order puts the name before the faces.",
    Comp: EntryCircleMirror },
  { id: "circle-centred", n: 44, name: "Centred", pattern: "Orbit section", weight: "Heavy",
    note: "The drawing above the words rather than beside them, so the orbit gets its full width and the block reads as a section.",
    Comp: EntryCircleCentred },
  { id: "circle-deep", n: 45, name: "Deep ground", pattern: "Orbit section", weight: "Medium",
    note: "The brand's forest green behind the photographs. Nothing else on a trip screen is dark, so it is impossible to scroll past.",
    Comp: EntryCircleDeep },

];
