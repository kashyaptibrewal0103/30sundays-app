import {
  MessagesSquare, ShieldCheck, ChevronRight, ArrowRight, Sparkles, Search,
} from "lucide-react";
import { CC } from "./tokens";
import { PAD } from "./CommunityUI";
import { MetaDot } from "./CountSignals";

// Four ways to break the flat hierarchy at the top of the Lounge.
//
// The problem being solved: welcome, group chat and guidelines are three
// different kinds of thing (a greeting, a live room, a rule book) and all
// three currently arrive as the same white rounded card, so the eye has
// nothing to sort them by.
//
// Each treatment below picks a different axis to separate them on.

/* ─── Shared ─── */

const goingLine = (d) => `${d.cohort.members} travellers going in ${d.month.split(" ")[0]}`;

// The quiet rule row, used the same way by every treatment so the comparison
// stays about the two blocks above it.
function GuidelinesLink({ onGuidelines, style }) {
  return (
    <button onClick={onGuidelines} style={{
      display: "flex", alignItems: "center", gap: 7, minHeight: 44,
      background: "none", border: "none", padding: 0, cursor: "pointer",
      fontFamily: "inherit", ...style,
    }}>
      <ShieldCheck size={14} color={CC.soft} />
      <span style={{
        fontSize: 12.5, fontWeight: 600, color: CC.body,
        textDecoration: "underline", textUnderlineOffset: 3,
        textDecorationColor: CC.goldLine,
      }}>Lounge guidelines</span>
    </button>
  );
}

/* ═══ A. Weight ═══ */
// The entrance, stripped back. No tinted ground, no headline, no rules link:
// the header carries the name and the guidelines, and the trip screen has
// already made the case for coming here.
//
// What is left is the chat: the live thing, and the only other place this
// screen leads. Search moved down into the Questions section, because that is
// what it searches.

export function FeedTopWeight({ d, unread, onChat, chat = true }) {
  return (
    /* One warm block, at the top, where people arrive. It is a doorway rather
       than a field: nothing below it is tinted, and the chat is the only thing
       inside it. The band's own edge separates it from the questions, so the
       grey divider that used to sit under here has gone. */
    <div style={{
      background: CC.bubbleDeep, borderBottom: `1px solid ${CC.bubbleEdge}`,
      padding: `14px ${PAD}px 16px`,
    }}>
      {/* Just the month. The bar above already said which destination. */}
      <p style={{
        margin: chat ? "0 0 10px" : 0, fontSize: 12, fontWeight: 800,
        color: CC.goldInk,
      }}>{d.month}</p>

      {/* No chat in a room you have not booked. The group is the people on the
          trip, and somebody who has not booked is not one of them yet. */}
      {chat && (
      <button onClick={onChat} style={{
        width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        padding: "12px 14px", borderRadius: 14,
        background: "rgba(255,255,255,0.8)", border: `1px solid ${CC.bubbleEdge}`,
        display: "flex", alignItems: "center", gap: 11,
      }}>
        <span style={{
          width: 38, height: 38, borderRadius: 11, background: CC.white, flexShrink: 0,
          display: "grid", placeItems: "center", border: `1px solid ${CC.bubbleEdge}`,
        }}><MessagesSquare size={18} color={CC.gold} /></span>

        {/* The unread count sits beside the name, not after the sentence, so
            the sentence gets the whole width and stays on one line. */}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: CC.ink }}>
              Group chat
            </span>
            <MetaDot unread={unread} />
          </span>
          <span style={{
            display: "block", fontSize: 12.5, color: CC.body, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {goingLine(d)}
          </span>
        </span>
        <ChevronRight size={17} color={CC.soft} style={{ flexShrink: 0 }} />
      </button>
      )}
    </div>
  );
}

/* ═══ B. Colour ═══ */
// Separated by ground. The welcome sits on a lagoon wash, the chat stays white
// with a lagoon edge, the rules are a plain link. Same shapes, different air.

export function FeedTopColour({ d, messages, onChat, onGuidelines }) {
  return (
    <div>
      <div style={{
        background: CC.tealTint, padding: `16px ${PAD}px`, marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Sparkles size={14} color={CC.teal} />
          <span style={{
            fontSize: 12, fontWeight: 800, color: CC.tealInk,
          }}>Answers From Travellers</span>
        </div>
        <p style={{ fontSize: 14.5, color: CC.ink, margin: "7px 0 0", lineHeight: "21px" }}>
          Ask anyone who has already been to {d.name}. Every answer shows when
          they went, and who they went with.
        </p>
      </div>

      <div style={{ padding: `0 ${PAD}px` }}>
        <button onClick={onChat} style={{
          width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
          padding: "14px 15px", borderRadius: 14, background: CC.white,
          border: `1px solid ${CC.line}`, borderLeft: `3px solid ${CC.teal}`,
          display: "flex", alignItems: "center", gap: 11,
        }}>
          <MessagesSquare size={18} color={CC.teal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
              Group chat
            </span>
            <span style={{ display: "block", fontSize: 12.5, color: CC.body, marginTop: 2 }}>
              {goingLine(d)}
            </span>
          </span>
          <span style={{
            flexShrink: 0, padding: "3px 9px", borderRadius: 999, background: CC.well,
            fontSize: 11.5, fontWeight: 700, color: CC.body,
          }}>{messages}</span>
          <ChevronRight size={17} color={CC.soft} />
        </button>

        <GuidelinesLink onGuidelines={onGuidelines} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

/* ═══ C. Shape ═══ */
// Separated by form. The chat is a wide banner with its own rhythm, the
// welcome is one line of type, the rules ride along the bottom of the banner.

export function FeedTopShape({ d, messages, onChat, onGuidelines }) {
  return (
    <div>
      <p style={{
        fontSize: 13, color: CC.body, margin: `0 ${PAD}px 14px`, lineHeight: "20px",
      }}>
        Ask travellers who have already been to {d.name}.
      </p>

      {/* Full bleed, so it cannot be mistaken for another card in the stack. */}
      <button onClick={onChat} style={{
        width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        border: "none", borderTop: `1px solid ${CC.line}`, borderBottom: `1px solid ${CC.line}`,
        background: CC.well, padding: `14px ${PAD}px`, display: "block",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MessagesSquare size={16} color={CC.teal} />
          <span style={{
            fontSize: 12, fontWeight: 800, color: CC.tealInk, flex: 1,
          }}>Group Chat</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.body }}>
            {messages} messages
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 8 }}>
          <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: CC.ink, letterSpacing: "-0.2px" }}>
            {goingLine(d)}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 13.5, fontWeight: 700, color: CC.ink,
          }}>Open <ArrowRight size={14} color={CC.soft} /></span>
        </div>
      </button>

      <GuidelinesLink onGuidelines={onGuidelines} style={{ margin: `2px ${PAD}px 0` }} />
    </div>
  );
}

/* ═══ D. One header ═══ */
// Separated by removing two of the three blocks. The welcome and the chat
// become one header that belongs to the destination, and the rules move to
// the foot of the screen where rules usually live.

export function FeedTopHeader({ d, messages, onChat }) {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <p style={{ fontSize: 14.5, color: CC.ink, margin: 0, lineHeight: "22px" }}>
        Ask travellers who have already been to {d.name}.
      </p>
      <p style={{ fontSize: 13, color: CC.body, margin: "4px 0 0", lineHeight: "19px" }}>
        Every answer shows when they went, and who they went with.
      </p>

      <button onClick={onChat} style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 12,
        minHeight: 44, padding: "9px 14px", borderRadius: 999,
        border: `1px solid ${CC.line}`, background: CC.white,
        cursor: "pointer", fontFamily: "inherit",
      }}>
        <MessagesSquare size={15} color={CC.teal} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: CC.ink }}>Group chat</span>
        <span style={{ fontSize: 12.5, color: CC.body }}>
          {d.cohort.members} going · {messages} messages
        </span>
        <ChevronRight size={15} color={CC.soft} />
      </button>
    </div>
  );
}

export const FEED_TOP_VARIANTS = [
  {
    id: "weight", n: "A", name: "By weight",
    axis: "Size and fill",
    note: "Only one thing on the screen is a card, and it is the chat. The greeting is plain type and the rules are a link, so the three stop competing.",
    Comp: FeedTopWeight,
  },
  {
    id: "colour", n: "B", name: "By colour",
    axis: "Ground",
    note: "The greeting sits on a full width lagoon wash. The chat stays white with a lagoon edge. Same shapes, different air around them.",
    Comp: FeedTopColour,
  },
  {
    id: "shape", n: "C", name: "By shape",
    axis: "Form",
    note: "The chat becomes a full bleed band rather than a card, so it cannot be read as another item in the same stack.",
    Comp: FeedTopShape,
  },
  {
    id: "header", n: "D", name: "One header",
    axis: "Fewer blocks",
    note: "Three blocks become one. The chat is a pill inside the header, and the guidelines move to the foot of the screen where rules belong.",
    Comp: FeedTopHeader,
  },
];
