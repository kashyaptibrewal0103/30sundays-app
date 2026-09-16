import { useState, useRef, useEffect } from "react";
import {
  BadgeCheck, Heart, Link2, Bookmark, CornerUpLeft, Lock, Pin, ChevronRight,
  MessageCircle, ImagePlus, X as XIcon, ArrowLeft, SendHorizontal, Flag, Pencil, Trash2,
  ChevronDown, ChevronUp, User, Baby, MoreHorizontal,
} from "lucide-react";
// The app palette is no longer used here; Community has its own, in tokens.
import { Sheet } from "../Gift/GiftUI";
import { CC, tintFor, hueFor } from "./tokens";
import { ago, shortMonth } from "../../data/communityData";

// Community's own pieces. The screen chrome (Screen, Body, TopBar, Sheet,
// Primary, Secondary, Field, Input, Textarea) comes from the gift kit, which
// already matches the app, so none of that is rebuilt here.
//
// Colour rule for every piece below: white ground, green type, lagoon for
// proof, golden for attention, and fuchsia only on the one primary action.

// The brief's grid: 16px screen padding, 8px rhythm, 16px card radius.
export const PAD = 16;
export const CARD = {
  background: CC.white, borderRadius: 16, border: `1px solid ${CC.line}`,
};

// ── Who wrote this ──

// Up to two initials, which works for one name, two names, or a family.
export function initialsFor(name) {
  const words = String(name || "").replace(/[&+]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function TravellerMark({ name, ops, size = 36 }) {
  if (ops) {
    return (
      <span style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: CC.tealTint, display: "grid", placeItems: "center",
      }}>
        <BadgeCheck size={size * 0.52} color={CC.teal} />
      </span>
    );
  }
  const tint = tintFor(name);
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: tint.bg, display: "grid", placeItems: "center",
      fontSize: size * 0.34, fontWeight: 700, color: tint.fg, letterSpacing: "0.2px",
    }}>{initialsFor(name)}</span>
  );
}

// Where, when, and who went, in as few characters as it takes. Everybody in
// here is a verified traveller, so saying so on every line says nothing.
export function TripStamp({ stamp, adults, children, ops, style }) {
  if (ops) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 11.5, fontWeight: 600, color: CC.tealInk, ...style,
      }}>
        <BadgeCheck size={12} color={CC.teal} /> 30 Sundays
      </span>
    );
  }
  if (!stamp) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "wrap",
      fontSize: 11.5, fontWeight: 600, color: CC.tealInk, ...style,
    }}>
      {stamp.destination}, {shortMonth(stamp.month)}
      {adults > 0 && (
        <>
          <span style={{ color: CC.tealLine }}>·</span>
          {adults}<User size={12} color={CC.teal} />
        </>
      )}
      {children > 0 && (
        <>{children}<Baby size={12} color={CC.teal} /></>
      )}
    </span>
  );
}

export function AuthorLine({ author, minsAgo, stamp = true, right }) {
  const ops = !!author?.ops;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <TravellerMark name={author?.name} ops={ops} size={34} />

      {/* The name, then where they went on the line under it. No city: where
          somebody lives says nothing about whether their answer is worth
          reading. The team's second line says 30 Sundays in the same slot. */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{
            flex: 1, minWidth: 0,
            fontSize: 14, fontWeight: 700, color: CC.ink, margin: 0, lineHeight: "18px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{author?.name}</p>
          {right || (minsAgo != null && (
            <span style={{ flexShrink: 0, fontSize: 12, color: CC.soft }}>{ago(minsAgo)}</span>
          ))}
        </div>

        {stamp && (ops || author?.stamp) && (
          <div style={{ marginTop: 1 }}>
            <TripStamp ops={ops} stamp={author.stamp}
              adults={author.adults} children={author.children} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pinned rows ──

// `desc` is optional on purpose. A one line explanation under every row is
// what turns a list into a page of prose.
export function PinnedRow({ icon: Icon = Pin, title, desc, locked, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 48,
      padding: "14px 16px", background: CC.white, border: "none", borderBottom: `1px solid ${CC.line}`,
      cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10, background: CC.well, flexShrink: 0,
        display: "grid", placeItems: "center",
      }}><Icon size={16} color={CC.ink} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: CC.ink }}>{title}</span>
          {locked && <Lock size={12} color={CC.soft} />}
        </span>
        {desc && (
          <span style={{
            display: "block", fontSize: 12.5, color: CC.body, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{desc}</span>
        )}
      </span>
      <ChevronRight size={17} color={CC.soft} />
    </button>
  );
}

// The unread count, wherever a chat is linked to. Coloured type, no pill:
// a solid badge shouts louder than the thing it is pointing at, and the
// fuchsia carries the urgency on its own.
export function UnreadChip({ n, onDark }) {
  if (!n) return null;
  return (
    <span style={{
      flexShrink: 0, whiteSpace: "nowrap",
      fontSize: 12.5, fontWeight: 800, letterSpacing: "-0.1px",
      color: onDark ? CC.pinkOnDark : CC.pink,
    }}>{n} unread {n === 1 ? "message" : "messages"}</span>
  );
}

/* ═══════════ Screen furniture, matching the itinerary screen ═══════════ */

// A 6px full bleed grey bar is how that screen separates sections. No card
// wrapper, no tint, just a gap you can see.
export function SectionBar({ margin = "20px 0" }) {
  return <div style={{ height: 6, background: CC.well, margin }} />;
}

export function SectionHead({ children, right, style }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
      gap: 10, padding: `0 ${PAD}px`, marginBottom: 12, ...style,
    }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: CC.ink, margin: 0, letterSpacing: "-0.1px" }}>
        {children}
      </h2>
      {right && <span style={{ fontSize: 11, color: CC.body }}>{right}</span>}
    </div>
  );
}

export function Kicker({ children, style }) {
  return (
    <p style={{
      fontSize: 11.5, fontWeight: 700,
      color: CC.body, margin: 0, ...style,
    }}>{children}</p>
  );
}

// Photo first, like every other surface in the app that sells a place.
export function Hero({ image, kicker, title, sub, onBack, pill, height = 200 }) {
  return (
    <div style={{ position: "relative", height }}>
      <img src={image} alt="" className="ken-burns" style={{
        width: "100%", height: "100%", objectFit: "cover", display: "block",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.34) 0%, transparent 42%, rgba(0,0,0,0.78) 100%)",
      }} />
      {onBack && (
        <button onClick={onBack} aria-label="Back" style={{
          position: "absolute", top: 14, left: 14, width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)",
          border: "none", cursor: "pointer", display: "grid", placeItems: "center",
        }}><ArrowLeft size={19} color="#fff" /></button>
      )}
      <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 14 }}>
        {kicker && (
          <p style={{
            fontSize: 11.5, fontWeight: 800,
            color: "rgba(255,255,255,0.86)", margin: "0 0 5px",
          }}>{kicker}</p>
        )}
        <h1 style={{
          fontSize: 24, fontWeight: 700, color: "#fff", margin: 0, lineHeight: "29px",
          letterSpacing: "-0.4px", textShadow: "0 1px 12px rgba(0,0,0,0.35)",
        }}>{title}</h1>
        {sub && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", margin: "5px 0 0" }}>{sub}</p>
        )}
        {pill && <div style={{ marginTop: 12 }}>{pill}</div>}
      </div>
    </div>
  );
}

// Frosted pill that sits on a photo.
export function GlassPill({ icon: Icon, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7, minHeight: 36, padding: "0 15px",
      borderRadius: 999, background: "rgba(255,255,255,0.18)",
      border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(8px)",
      cursor: onClick ? "pointer" : "default", fontFamily: "inherit",
      fontSize: 12.5, fontWeight: 700, color: "#fff",
    }}>
      {Icon && <Icon size={14} color="#fff" />}
      {children}
    </button>
  );
}

// Who is in the group, as faces rather than a number on its own.
export function AvatarStack({ people, extra, size = 30 }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {people.map((p, i) => (
        <span key={p.name} style={{ marginLeft: i ? -10 : 0, borderRadius: "50%", border: `2px solid ${CC.white}` }}>
          <TravellerMark name={p.name} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span style={{
          marginLeft: -10, width: size, height: size, borderRadius: "50%",
          border: `2px solid ${CC.white}`, background: CC.ink, color: "#fff",
          display: "grid", placeItems: "center", fontSize: size * 0.3, fontWeight: 700,
        }}>+{extra}</span>
      )}
    </div>
  );
}

// The sticky foot of the itinerary screen: what this is on the left, and the
// single fuchsia action on the right. This is the only primary per screen.
export function ActionBar({ title, caption, label, icon: Icon, onClick }) {
  return (
    <div style={{
      flexShrink: 0, borderTop: `1px solid ${CC.line}`,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
      padding: `10px ${PAD}px calc(12px + env(safe-area-inset-bottom))`,
      display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between",
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: CC.ink }}>{title}</p>
        {caption && <p style={{ margin: 0, fontSize: 11, color: CC.body }}>{caption}</p>}
      </div>
      <button onClick={onClick} style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 7, minHeight: 48,
        padding: "0 20px", borderRadius: 999, border: "none", cursor: "pointer",
        fontFamily: "inherit", fontSize: 14.5, fontWeight: 700,
        background: CC.pink, color: "#fff", boxShadow: "0 4px 14px rgba(253,1,79,0.24)",
      }}>
        {Icon && <Icon size={17} />} {label}
      </button>
    </div>
  );
}

// Long posts get cut at five lines with a way to open them. Measured rather
// than guessed: the link only appears when the text actually overflows, so a
// four line answer never shows a Read more that does nothing.
export function ClampText({ children, lines = 5, style }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOver(el.scrollHeight > el.clientHeight + 1);
  }, [children, lines]);

  return (
    <>
      <p
        ref={ref}
        style={{
          fontSize: 14.5, color: CC.ink, margin: 0, lineHeight: "22px", ...style,
          ...(open ? null : {
            display: "-webkit-box", WebkitLineClamp: lines,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }),
        }}
      >{children}</p>

      {/* Not pink. Fuchsia is the one primary action per screen, and opening
          a paragraph is not it. Bold, underlined and a chevron say clickable
          without spending the accent. */}
      {over && (
        <button onClick={() => setOpen(v => !v)} style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          marginTop: 6, padding: 0, minHeight: 36, border: "none", background: "none",
          cursor: "pointer", fontFamily: "inherit",
          fontSize: 13.5, fontWeight: 700, color: CC.ink,
        }}>
          <span style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
            {open ? "Read less" : "Read more"}
          </span>
          {open
            ? <ChevronUp size={14} color={CC.ink} />
            : <ChevronDown size={14} color={CC.ink} />}
        </button>
      )}
    </>
  );
}

// ── A question in the feed ──

// `room` is passed only on a feed that mixes rooms, where the question is
// useless without knowing which place it is about.

export function QuestionCard({ q, answerCount, room, onClick }) {
  const lastActivity = answerCount > 0
    ? Math.min(q.minsAgo, ...(q.answers || []).map(a => a.minsAgo ?? q.minsAgo))
    : q.minsAgo;
  const tag = (q.tags || [])[0];

  return (
    <button onClick={onClick} style={{
      display: "flex", gap: 11, width: "100%", textAlign: "left", cursor: "pointer",
      fontFamily: "inherit", padding: "13px 14px", background: CC.white,
      borderRadius: 14, border: `1px solid ${CC.line}`,
    }}>
      {/* Who asked, as a face on the left. The name itself is not worth a line
          in a list: it tells you nothing about whether to open the question. */}
      <TravellerMark name={q.author?.name} ops={q.author?.ops} size={30} />

      <span style={{ flex: 1, minWidth: 0 }}>
        {/* The time sits up here beside the title, which is where a thread
            already puts it. It leaves the row below carrying one thing at each
            end, so the count and the time can never crowd each other. */}
        <span style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{
            flex: 1, fontSize: 15, fontWeight: 500, color: CC.ink,
            lineHeight: "20px", letterSpacing: "-0.1px",
          }}>{q.title}</span>
          <span style={{ flexShrink: 0, marginTop: 2, fontSize: 11.5, color: CC.soft }}>
            {ago(lastActivity)}
          </span>
        </span>

        {/* The subject stands where a name used to. It is the thing that lets
            somebody skip twenty questions without reading them. */}
        <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
          {room && (
            <>
              <span style={{ fontSize: 12, fontWeight: 700, color: CC.ink }}>{room}</span>
              {tag && <span style={{ color: CC.soft, fontSize: 12 }}>·</span>}
            </>
          )}
          {tag && (
            <span style={{
              fontSize: 12, fontWeight: 700, color: hueFor(tag),
            }}>{tag}</span>
          )}
          <span style={{ flex: 1 }} />
          {answerCount > 0 ? (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.tealInk, whiteSpace: "nowrap" }}>
              {answerCount} {answerCount === 1 ? "answer" : "answers"}
            </span>
          ) : (
            <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.goldInk, whiteSpace: "nowrap" }}>
              Needs an answer
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

// ── An answer ──

// A quote sits above the answer with the original author named, so a reply to
// one line of a long thread still makes sense on its own.
export function QuoteBlock({ quote }) {
  if (!quote) return null;
  return (
    <div style={{
      borderLeft: `3px solid ${CC.line}`, background: CC.well, borderRadius: "0 8px 8px 0",
      padding: "8px 12px", margin: "0 0 10px",
    }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, color: CC.ink, margin: 0 }}>
        {quote.author?.name || quote.author}
      </p>
      <p style={{ fontSize: 13, color: CC.body, margin: "3px 0 0", lineHeight: "18px", fontStyle: "italic" }}>
        &ldquo;{quote.text}&rdquo;
      </p>
    </div>
  );
}

// Icons with their words next to them. An icon on its own asks the reader to
// guess, and the two things people actually do here are worth naming.
//
// Everything rare goes behind the dots: edit and delete on a post of your own,
// report on somebody else's. One slot, so the row never grows.
export function MoreButton({ items, style }) {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;
  return (
    <span style={{ flexShrink: 0, margin: "-11px -6px -11px 0", ...style }}>
      <IconAction icon={MoreHorizontal} label="More" onClick={() => setOpen(true)} />
      {open && <MoreMenu items={items} onClose={() => setOpen(false)} />}
    </span>
  );
}

// What goes behind the dots on a post: edit and delete on your own, report on
// somebody else's.
export function postMenuItems({ mine, reported, onEdit, onDelete, onCopy, onReport }) {
  const items = [];
  if (mine && onEdit) items.push({ icon: Pencil, label: "Edit", onClick: onEdit });
  if (mine && onDelete) items.push({ icon: Trash2, label: "Delete", danger: true, onClick: onDelete });
  if (onCopy) items.push({ icon: Link2, label: "Copy link", onClick: onCopy });
  if (!mine && onReport) {
    items.push({
      icon: Flag, danger: true, done: !!reported,
      label: reported ? "Reported" : "Report",
      onClick: reported ? undefined : onReport,
    });
  }
  return items;
}

export function PostActions({ liked, likes, minsAgo, onLike, onReply }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
      <TextAction
        icon={Heart} label={liked ? "Liked" : "Like"} count={likes}
        active={liked} fill={liked} onClick={onLike}
      />
      {onReply && <TextAction icon={CornerUpLeft} label="Reply" onClick={onReply} />}

      {minsAgo != null && (
        <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 12, color: CC.soft }}>
          {ago(minsAgo)}
        </span>
      )}
    </div>
  );
}

// The two named actions. The count sits after the word, because a number on
// its own never says what it is counting.
export function TextAction({ icon: Icon, label, count, active, fill, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40, padding: "0 10px",
      borderRadius: 999, border: "none", background: "none", cursor: "pointer",
      fontFamily: "inherit", fontSize: 13, fontWeight: 700,
      color: active ? CC.pink : CC.body,
    }}>
      <Icon size={16} color={active ? CC.pink : CC.body} fill={fill ? CC.pink : "none"} />
      {label}
      {count > 0 && (
        <span style={{ fontWeight: 600, color: active ? CC.pink : CC.soft }}>{count}</span>
      )}
    </button>
  );
}

// Everything that is not like or reply. A sheet rather than a popover, because
// the rest of this feature already answers in sheets.
export function MoreMenu({ items, onClose }) {
  return (
    <Sheet title="More" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((it, i) => (
          <button
            key={it.label}
            disabled={it.done || !it.onClick}
            onClick={() => { onClose(); if (it.onClick) it.onClick(); }}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 54,
              background: "none", cursor: it.done ? "default" : "pointer", fontFamily: "inherit",
              textAlign: "left", padding: "0 2px", border: "none",
              borderTop: i === 0 ? "none" : `1px solid ${CC.line}`,
            }}
          >
            <it.icon size={18} color={it.done ? CC.soft : it.danger ? CC.pinkInk : CC.ink} />
            <span style={{
              flex: 1, fontSize: 15, fontWeight: 600,
              color: it.done ? CC.soft : it.danger ? CC.pinkInk : CC.ink,
            }}>{it.label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function IconAction({ icon: Icon, label, active, fill, muted, onClick }) {
  return (
    <button onClick={onClick} disabled={muted} aria-label={label} style={{
      width: 40, height: 40, borderRadius: "50%", border: "none", background: "none",
      cursor: muted ? "default" : "pointer", display: "grid", placeItems: "center",
    }}>
      <Icon size={17} color={active ? CC.pink : muted ? CC.soft : CC.body}
        fill={fill ? CC.pink : "none"} />
    </button>
  );
}

export function AnswerCard({
  answer, liked, bookmarked, reported, best,
  onLike, onCopy, onBookmark, onReply, onReport, onEdit, onDelete,
}) {
  const ops = !!answer.author?.ops;
  return (
    <div style={{ ...CARD, padding: 16 }}>
      {/* Most helpful, not accepted. Nobody marked this: it is simply the one
          the most people found useful, and it can change. */}
      {best && (
        <p style={{
          display: "inline-flex", alignItems: "center", gap: 5, margin: "0 0 10px",
          fontSize: 11.5, fontWeight: 800,
          color: CC.tealInk,
        }}>
          <Heart size={11} color={CC.teal} fill={CC.teal} /> Most Helpful
        </p>
      )}
      <AuthorLine
        author={answer.mine ? { ...answer.author, name: "You" } : answer.author}
        right={<MoreButton items={postMenuItems({
          mine: !!answer.mine, reported,
          onEdit, onDelete, onReport,
        })} />}
      />
      <div style={{ marginTop: 12 }}>
        <QuoteBlock quote={answer.quotes} />
        <ClampText>{answer.body}</ClampText>
        {answer.image && (
          <img src={answer.image} alt="" style={{
            width: "100%", borderRadius: 12, marginTop: 12, display: "block",
          }} />
        )}
      </div>
      {answer.edited && (
        <p style={{ fontSize: 11.5, color: CC.soft, margin: "8px 0 0" }}>Edited</p>
      )}

      <PostActions
        liked={liked} likes={(answer.likes || 0) + (liked ? 1 : 0)}
        minsAgo={answer.minsAgo}
        onLike={onLike} onReply={onReply}
      />
    </div>
  );
}

// Used on a post this traveller wrote, in the list and on the thread.
export function OwnerChip({ icon: Icon, label, danger, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, minHeight: 40,
      padding: "0 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
      border: `1px solid ${CC.line}`, background: CC.white,
      fontSize: 13, fontWeight: 700, color: danger ? CC.pinkInk : CC.ink,
    }}>
      <Icon size={14} color={danger ? CC.pinkInk : CC.body} /> {label}
    </button>
  );
}

// ── Cohort chat ──

export function ChatBubble({ msg }) {
  const ops = !!msg.author?.ops;
  const mine = !!msg.mine;

  // An ops checkpoint is the thing people scroll back for, so it gets a card
  // of its own rather than a bubble in the run of chat.
  if (ops) {
    return (
      <div style={{
        ...CARD, borderColor: CC.tealLine, background: "#F5FCFB", padding: 16, margin: "8px 0",
      }}>
        <TripStamp ops />
        {msg.title && (
          <p style={{ fontSize: 15, fontWeight: 700, color: CC.ink, margin: "10px 0 0", letterSpacing: "-0.1px" }}>
            {msg.title}
          </p>
        )}
        <p style={{ fontSize: 14, color: CC.ink, margin: "6px 0 0", lineHeight: "21px" }}>{msg.text}</p>
      </div>
    );
  }

  // No avatar. In a group where nobody knows each other yet, a wall of
  // coloured initials is noise; the name on the message is enough.
  return (
    <div style={{ display: "flex", margin: "8px 0", justifyContent: mine ? "flex-end" : "flex-start" }}>
      <div style={{ maxWidth: "82%" }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3,
          justifyContent: mine ? "flex-end" : "flex-start",
        }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: CC.ink }}>
            {mine ? "You" : msg.author?.name}
          </span>
        </div>
        <div style={{
          background: mine ? CC.well : CC.white,
          border: `1px solid ${CC.line}`,
          borderRadius: 14, padding: "10px 13px",
        }}>
          <p style={{ fontSize: 14.5, color: CC.ink, margin: 0, lineHeight: "21px" }}>{msg.text}</p>
          {msg.image && (
            <img src={msg.image} alt="" style={{ width: "100%", borderRadius: 10, marginTop: 8, display: "block" }} />
          )}
        </div>
      </div>
    </div>
  );
}

// Sits above the first message nobody has read yet.
export function UnreadDivider({ n }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: CC.pinkLine }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: CC.pinkInk, letterSpacing: "0.3px" }}>
        {n} new {n === 1 ? "message" : "messages"}
      </span>
      <div style={{ flex: 1, height: 1, background: CC.pinkLine }} />
    </div>
  );
}

export function DayDivider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: CC.line }} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.soft }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: CC.line }} />
    </div>
  );
}

// ── Composer ──

// Kept as its own component with its own state, so typing does not re-render
// the message list and throw the scroll position away.
export function Composer({ placeholder, onSend, disabled }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);

  const send = () => {
    if (!text.trim() || disabled) return;
    onSend({ text, image });
    setText("");
    setImage(null);
  };

  return (
    <div style={{
      flexShrink: 0, borderTop: `1px solid ${CC.line}`, background: CC.white,
      padding: `8px ${PAD}px calc(8px + env(safe-area-inset-bottom))`,
    }}>
      {image && (
        <div style={{ position: "relative", width: 64, marginBottom: 8 }}>
          <img src={image} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, display: "block" }} />
          <button onClick={() => setImage(null)} aria-label="Remove image" style={{
            position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%",
            background: CC.ink, border: "none", cursor: "pointer", display: "grid", placeItems: "center",
          }}><XIcon size={12} color="#fff" /></button>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <button onClick={() => fileRef.current?.click()} aria-label="Add a photo" disabled={disabled} style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: CC.well,
          border: "none", cursor: disabled ? "default" : "pointer", display: "grid", placeItems: "center",
        }}><ImagePlus size={19} color={CC.body} /></button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => setImage(r.result);
            r.readAsDataURL(f);
          }} />
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={1} disabled={disabled}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{
            flex: 1, minHeight: 44, maxHeight: 110, padding: "11px 14px", borderRadius: 14,
            border: `1px solid ${CC.line}`, background: CC.white, resize: "none",
            fontFamily: "inherit", fontSize: 15, color: CC.ink, outline: "none", lineHeight: "21px",
          }}
        />
        <button onClick={send} disabled={!text.trim() || disabled} aria-label="Send" style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: "none",
          background: text.trim() && !disabled ? CC.pink : CC.line,
          cursor: text.trim() && !disabled ? "pointer" : "default",
          display: "grid", placeItems: "center",
        }}><SendHorizontal size={18} color="#fff" /></button>
      </div>
    </div>
  );
}

// ── Small shared bits ──

// A note, not a billboard. White ground with one golden edge, so it sits in
// the page rather than blocking it.
export function Banner({ title, body, onDismiss, margin }) {
  return (
    <div style={{
      background: CC.white, borderRadius: 14, padding: "13px 15px",
      margin: margin ?? `0 ${PAD}px 12px`,
      border: `1px solid ${CC.line}`, borderLeft: `3px solid ${CC.gold}`,
      display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: CC.ink, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 13, color: CC.body, margin: "3px 0 0", lineHeight: "19px" }}>{body}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: CC.well,
          border: "none", cursor: "pointer", display: "grid", placeItems: "center",
        }}><XIcon size={13} color={CC.body} /></button>
      )}
    </div>
  );
}

export function Toast({ children, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 92, zIndex: 300,
      background: CC.ink, color: "#fff", borderRadius: 12, padding: "12px 16px",
      fontSize: 13.5, fontWeight: 600, textAlign: "center",
      animation: "toastSlideUp 0.25s ease-out",
    }}>{children}</div>
  );
}
