import {
  MessagesSquare, MessageCircleQuestion, ChevronRight, ArrowRight, BadgeCheck,
} from "lucide-react";
import { CC } from "./tokens";
import { TravellerMark, UnreadChip } from "./CommunityUI";
import { GoldRecent } from "./GoldContentVariants";

// Eleven ways the trip screen can open Sunday Lounge.
//
// Every one of them is a single door: one tap target, which lands on the
// Lounge itself. The group chat lives one tap further in, where it already
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

// Two numbers, one separator. Used wherever a variant wants the facts flat.
// The two facts, flat. No month: the trip screen around it already says when.
const factLine = (d, answered) => `${faqLine(answered)} · ${d.cohort.members} travellers going`;

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
          Sunday Lounge
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
      <Head>Sunday Lounge</Head>
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
          }}>Questions and chat</span>
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
      <Head>Sunday Lounge</Head>
      <Sub>{blurb(d)}</Sub>
      <button onClick={onOpen} style={{
        width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        border: `1px solid ${CC.line}`, borderRadius: 16, background: CC.white, padding: "15px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Stat n={answered} label={answered === 1 ? "FAQ" : "FAQs"} />
          <span style={{ width: 1, alignSelf: "stretch", background: CC.line }} />
          <Stat n={d.cohort.members} label={`travellers going in ${month(d)}`} />
          <ChevronRight size={18} color={CC.soft} style={{ marginLeft: "auto", flexShrink: 0 }} />
        </div>
        {unread > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 13,
            paddingTop: 12, borderTop: `1px solid ${CC.line}`,
          }}>
            <UnreadChip n={unread} />
            <span style={{ fontSize: 12.5, color: CC.body }}>in the group chat</span>
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
      <Head>Sunday Lounge</Head>
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
        }}>Sunday Lounge</span>
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
        }}>Visit Lounge <ArrowRight size={15} color={CC.teal} /></span>
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
        <Head>Sunday Lounge</Head>
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
        }}>Sunday Lounge</span>
        {unread > 0 && <UnreadChip n={unread} onDark={onDark} />}
      </div>

      <p style={{ fontSize: 15.5, fontWeight: 700, color: ink, margin: "9px 0 0", lineHeight: "22px" }}>
        {blurb(d)}
      </p>

      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap",
      }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: bodyInk }}>
          {factLine(d, answered)}
        </span>
        <span style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 13.5, fontWeight: 700, color: kickerInk,
        }}>Visit Lounge <ArrowRight size={15} color={accent} /></span>
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
    note: "The golden band, leading with the travellers who went with us in the last three months. The month cohort sits inside the Lounge instead.",
    Comp: GoldRecent },
  { id: "band-card", n: 11, name: "Tinted card", pattern: "Tinted, inset", weight: "Medium",
    note: "The same lagoon ground, but inset and rounded. Keeps the card rhythm of the trip screen and changes only what sits behind the type.",
    Comp: EntryBandCard },
];
