import { useMemo, useState } from "react";
import { Check, Star } from "lucide-react";
import { C } from "../../data";
import { activityPool } from "../../data/buildData";
import { activityRating } from "../../data/activityRating";
import { activityKind, KIND_TONE } from "../../data/activityKind";
import { kindGlyph } from "../../data/kindGlyph";
import { buildActivityDetail } from "../../data/activityData";
import { ActivityDetailSheet } from "../../pages/ItineraryDetail";
import SaveHeart from "../SaveHeart";
import { useWishlist } from "../../data/wishlist";

// ─── The activities step, a row per city ───
//
// One long grid of every activity on the route read as a catalogue: nothing
// said which city a thing was in until you read the small print, and nothing
// said the cards were there to be picked. Each city is its own row now, in
// route order, scrolling sideways with a little over two cards in view so the
// sliver of the third says there is more.
//
// Two things to do with a card, and each has its own place. The card opens
// the itinerary's own activity sheet, to read about it. The Select button,
// and only the button, picks it. The sheet carries a Select button too, so
// somebody who opened it to decide can decide there.
//
// The wishlist lives on the cards, not behind a link to another screen: every
// card carries its heart, and what was saved earlier leads each city's row.
// The order is fixed when the step opens, so hearting a card here does not
// make it jump to the front under the finger.
export default function ActivityPicker({ dest, route, vibes, picks, setPicks }) {
  const { isSaved, toggle: toggleSave } = useWishlist();
  const [savedAtOpen] = useState(() => new Set(
    activityPool(dest, route, vibes).flatMap((g) => g.activities).filter((a) => isSaved("activity", dest, a.id)).map((a) => a.id)
  ));
  const groups = useMemo(
    () => activityPool(dest, route, vibes).map((g) => ({
      ...g,
      activities: [...g.activities].sort((a, b) => (savedAtOpen.has(b.id) ? 1 : 0) - (savedAtOpen.has(a.id) ? 1 : 0)),
    })),
    [dest, route, vibes, savedAtOpen]
  );
  const [open, setOpen] = useState(null);
  const toggle = (id) => setPicks((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const detail = useMemo(
    () => open && buildActivityDetail({ name: open.name, img: open.img }, { city: open.city, country: dest, isBooked: false }),
    [open, dest]
  );
  const openOn = open && picks.has(open.id);

  return (
    <>
      {groups.map((g) => {
        const count = g.activities.filter((a) => picks.has(a.id)).length;
        return (
          <section key={g.city} style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head, letterSpacing: "-0.2px" }}>{g.city}</h2>
              <span style={{ flex: 1 }} />
              {/* Hidden at none: "0 selected" reads as something gone wrong. */}
              {count > 0 && (
                <span data-testid={`city-count-${g.city}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 800, color: C.p600 }}>
                  <Check size={12} strokeWidth={3} /> {count} selected
                </span>
              )}
            </div>

            <div
              className="hide-scrollbar"
              style={{
                display: "flex", gap: 10, overflowX: "auto", margin: "10px -16px 0",
                padding: "2px 16px 4px", scrollSnapType: "x mandatory", scrollPaddingLeft: 16,
              }}
            >
              {g.activities.map((a) => (
                <PickCard
                  key={a.id}
                  a={a}
                  on={picks.has(a.id)}
                  saved={isSaved("activity", dest, a.id)}
                  onSave={() => toggleSave("activity", dest, a.id, { name: a.name, img: a.img, sub: a.city, city: a.city })}
                  onToggle={() => toggle(a.id)}
                  onOpen={() => setOpen(a)}
                />
              ))}
              {/* A snap target past the last card, so the row can rest there. */}
              <span aria-hidden style={{ flex: "0 0 6px", scrollSnapAlign: "end" }} />
            </div>
          </section>
        );
      })}

      {open && (
        <ActivityDetailSheet
          detail={detail}
          onClose={() => setOpen(null)}
          footer={
            <button
              data-testid="sheet-select"
              onClick={() => toggle(open.id)}
              style={{
                width: "100%", height: 48, borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontSize: 15, fontWeight: 800,
                background: openOn ? C.white : C.p600,
                color: openOn ? C.p600 : "#fff",
                border: openOn ? `1.5px solid ${C.p600}` : "none",
              }}
            >
              {openOn ? <><Check size={17} strokeWidth={3} /> Selected</> : "Select"}
            </button>
          }
        />
      )}
    </>
  );
}

// ─── One activity ───
//
// Fixed heights all the way down, so a row of them ends on one line whatever
// each name runs to. The photograph is well over half the card: it is what
// somebody recognises an activity by, and the words under it only confirm.
const PHOTO_H = 150;
const NAME_H = 36;

function PickCard({ a, on, saved, onSave, onToggle, onOpen }) {
  const { rating, reviews } = activityRating(a.id);
  const kind = activityKind(a.name);
  const tone = KIND_TONE[kind] || KIND_TONE.Culture;

  return (
    <div
      data-testid={`pick-${a.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${a.name}, details`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
      style={{
        // 2.1 cards in view. The percentage is of the row's inner width, which
        // is the screen less its two 16px paddings, so: 16 + 2.1 cards + two
        // 10px gaps = the screen.
        flex: "0 0 calc((100% - 4px) / 2.1)", minWidth: 0, scrollSnapAlign: "start",
        boxSizing: "border-box", borderRadius: 14, overflow: "hidden", cursor: "pointer",
        background: C.white,
        border: `${on ? 1.5 : 1}px solid ${on ? C.p600 : C.div}`,
        boxShadow: "0 1px 3px rgba(24,29,39,0.05)",
        display: "flex", flexDirection: "column",
        transition: "border-color .15s",
      }}
    >
      <div style={{ position: "relative", height: PHOTO_H, flexShrink: 0, background: "#F4F2F0" }}>
        <img src={a.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <SaveHeart onPhoto size={34} saved={!!saved} onToggle={onSave} style={{ position: "absolute", top: 2, right: 2 }} />

        {/* What kind of thing it is, in the colour that kind wears on the
            region pages, so a temple is the same purple wherever it appears. */}
        <span style={{
          position: "absolute", left: 7, bottom: 7, maxWidth: "calc(100% - 14px)", boxSizing: "border-box",
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 8px 3px 7px", borderRadius: 999,
          background: tone.bg, color: tone.fg,
          fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap",
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        }}>
          <span aria-hidden style={{ display: "inline-flex" }} dangerouslySetInnerHTML={{ __html: kindGlyph(kind, { size: 11, colour: tone.fg }) }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{kind}</span>
        </span>
      </div>

      <div style={{ padding: "9px 10px 10px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 2, height: NAME_H }}>
          <p style={{
            flex: 1, minWidth: 0, margin: 0, fontSize: 13, fontWeight: 800, color: C.head, lineHeight: "18px",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{a.name}</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4, fontSize: 11.5, whiteSpace: "nowrap" }}>
          <Star size={11} color="#D99A00" fill="#D99A00" />
          <strong style={{ fontWeight: 800, color: C.head }}>{rating}</strong>
          <span style={{ color: C.sub }}>({reviews})</span>
        </div>

        <button
          data-testid={`select-${a.id}`}
          aria-pressed={on}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            marginTop: 9, height: 32, borderRadius: 8, boxSizing: "border-box", cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            fontSize: 12.5, fontWeight: 800,
            background: on ? C.p600 : C.white,
            color: on ? "#fff" : C.head,
            border: on ? "none" : `1px solid ${C.icon}`,
            transition: "background .15s",
          }}
        >
          {on ? <><Check size={13} strokeWidth={3} /> Selected</> : "Select"}
        </button>
      </div>
    </div>
  );
}
