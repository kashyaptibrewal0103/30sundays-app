import { useState } from "react";
import {
  SlidersHorizontal, ChevronDown, Check, X as XIcon, Edit3, ArrowUpDown,
} from "lucide-react";
import { CC } from "./tokens";
import { Sheet, Primary, Secondary } from "../Gift/GiftUI";

// Six ways to sort and narrow the questions.
//
// Two of them are lifted straight off screens this app already has: the chips
// plus a sliders button come from Change day plan, and the collapsed summary
// bar comes from the hotel listing. Borrowing beats inventing, because a
// traveller has met both of those before.
//
// The trade is always the same: how much of the screen the controls take
// before the first question, against how many taps it costs to reach them.

export const SORTS = [
  { id: "recent", label: "Newest", short: "Newest" },
  { id: "unanswered", label: "Unanswered first", short: "Unanswered" },
  { id: "liked", label: "Most liked", short: "Most liked" },
  { id: "answered", label: "Most answered", short: "Most answered" },
];

const labelOf = (id) => SORTS.find(s => s.id === id)?.short || "Newest";

/* ─── Shared pieces ─── */

function Chip({ on, onClick, children, pink, snap }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, minHeight: 34, padding: "0 12px", borderRadius: 999,
      scrollSnapAlign: snap ? "start" : undefined,
      cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600,
      border: on ? `1.5px solid ${pink ? CC.pink : CC.ink}` : `1.5px solid ${CC.line}`,
      background: on ? (pink ? CC.pinkTint : CC.ink) : CC.white,
      color: on ? (pink ? CC.pink : "#fff") : CC.ink,
      whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

// Snapping means a scroll always comes to rest with a chip against the edge,
// so a label is never left cut in the middle of a word.
const rail = {
  display: "flex", gap: 7, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px",
  scrollSnapType: "x mandatory", scrollPaddingLeft: 16, scrollPaddingRight: 16,
};

// The sheet three of the six share. Sort on one tab, subject on the other,
// and a count so nobody applies a filter that empties the screen.
export function SortFilterSheet({ sort, onSort, tags, tag, onTag, counts, matches, onClose }) {
  const [tab, setTab] = useState("Sort");
  return (
    <Sheet
      title="Sort and filter"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={onClose}>Show {matches} questions</Primary>
          <Secondary onClick={() => { onSort("recent"); onTag(null); }}>Reset</Secondary>
        </div>
      }
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["Sort", "Subject"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, minHeight: 40, borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
            fontSize: 13.5, fontWeight: 700,
            border: `1px solid ${tab === t ? CC.ink : CC.line}`,
            background: tab === t ? CC.ink : CC.white,
            color: tab === t ? "#fff" : CC.body,
          }}>{t}</button>
        ))}
      </div>

      {tab === "Sort" ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SORTS.map((s, i) => (
            <button key={s.id} onClick={() => onSort(s.id)} style={{
              display: "flex", alignItems: "center", gap: 10, minHeight: 50,
              background: "none", border: "none", borderTop: i ? `1px solid ${CC.line}` : "none",
              cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: "0 2px",
            }}>
              <span style={{ flex: 1, fontSize: 15, color: CC.ink }}>{s.label}</span>
              {sort === s.id && <Check size={17} color={CC.pink} />}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Chip on={!tag} onClick={() => onTag(null)} pink>All</Chip>
          {tags.map(t => (
            <Chip key={t} on={tag === t} onClick={() => onTag(tag === t ? null : t)} pink>
              {t}{counts?.[t] ? ` ${counts[t]}` : ""}
            </Chip>
          ))}
        </div>
      )}
    </Sheet>
  );
}

/* ═══ A. Two rows of chips ═══ */
// What is live. Everything visible, nothing hidden, two rows of height.

export function FiltersTwoRows({ sort, onSort, tags, tag, onTag }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
      <div style={rail}>
        {SORTS.map(s => (
          <Chip key={s.id} on={sort === s.id} onClick={() => onSort(s.id)}>{s.label}</Chip>
        ))}
      </div>
      <div style={rail}>
        <Chip on={!tag} onClick={() => onTag(null)}>All</Chip>
        {tags.map(t => (
          <Chip key={t} on={tag === t} onClick={() => onTag(tag === t ? null : t)}>{t}</Chip>
        ))}
      </div>
    </div>
  );
}

/* ═══ B. Chips and a sliders button ═══ */
// Straight off Change day plan: subjects scroll, a rule, then a sliders button
// with a count on it. Sorting lives in the sheet, where it is used least.

export function FiltersChipsAndSliders({ sort, onSort, tags, tag, onTag, counts, matches }) {
  const [open, setOpen] = useState(false);
  const active = (sort !== "recent" ? 1 : 0) + (tag ? 1 : 0);
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "0 10px 0 0", marginBottom: 12,
      }}>
        <div style={{ ...rail, flex: 1, minWidth: 0 }}>
          <Chip on={!tag} onClick={() => onTag(null)} pink snap>All</Chip>
          {tags.map(t => (
            <Chip key={t} on={tag === t} onClick={() => onTag(tag === t ? null : t)} pink snap>{t}</Chip>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: CC.line, flexShrink: 0 }} />
        <button onClick={() => setOpen(true)} aria-label="Sorting and filters" style={{
          position: "relative", width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: active ? CC.pinkTint : "transparent",
          border: active ? `1.5px solid ${CC.pink}` : `1px solid ${CC.line}`,
          display: "grid", placeItems: "center", cursor: "pointer",
        }}>
          <SlidersHorizontal size={14} color={active ? CC.pink : CC.body} />
          {active > 0 && (
            <span style={{
              position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%",
              background: CC.pink, color: "#fff", fontSize: 11, fontWeight: 700,
              display: "grid", placeItems: "center",
            }}>{active}</span>
          )}
        </button>
      </div>

      {open && (
        <SortFilterSheet
          sort={sort} onSort={onSort} tags={tags} tag={tag} onTag={onTag}
          counts={counts} matches={matches} onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* ═══ C. Collapsed summary bar ═══ */
// The hotel listing's move. One line saying what is on, and a pencil to change
// it. Smallest footprint of any option that keeps the state visible.

export function FiltersSummaryBar({ sort, onSort, tags, tag, onTag, counts, matches }) {
  const [open, setOpen] = useState(false);
  const touched = sort !== "recent" || tag;
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        display: "flex", alignItems: "center", gap: 8, width: "calc(100% - 32px)",
        margin: "0 16px 12px", padding: "11px 14px", borderRadius: 12,
        background: CC.white, border: `1px solid ${touched ? CC.pink : CC.line}`,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <ArrowUpDown size={14} color={touched ? CC.pink : CC.body} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: CC.ink }}>
          {labelOf(sort)}{tag ? ` · ${tag}` : " · All subjects"}
        </span>
        <Edit3 size={15} color={touched ? CC.pink : CC.soft} />
      </button>

      {open && (
        <SortFilterSheet
          sort={sort} onSort={onSort} tags={tags} tag={tag} onTag={onTag}
          counts={counts} matches={matches} onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* ═══ D. Sort in the heading ═══ */
// The sort sits where the count used to, on the Questions row. Subjects keep
// one scrolling row underneath. Saves a whole row of height.

export function FiltersSortInHead({ sort, onSort, tags, tag, onTag }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", marginBottom: 10,
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: CC.ink }}>Questions</span>
        <button onClick={() => setOpen(true)} style={{
          display: "inline-flex", alignItems: "center", gap: 5, minHeight: 34,
          padding: "0 10px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
          border: `1px solid ${CC.line}`, background: CC.white,
          fontSize: 12.5, fontWeight: 700, color: CC.ink,
        }}>
          {labelOf(sort)} <ChevronDown size={14} color={CC.body} />
        </button>
      </div>

      <div style={{ ...rail, marginBottom: 12 }}>
        <Chip on={!tag} onClick={() => onTag(null)}>All</Chip>
        {tags.map(t => (
          <Chip key={t} on={tag === t} onClick={() => onTag(tag === t ? null : t)}>{t}</Chip>
        ))}
      </div>

      {open && (
        <Sheet title="Sort by" onClose={() => setOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {SORTS.map((s, i) => (
              <button key={s.id} onClick={() => { onSort(s.id); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 10, minHeight: 50,
                background: "none", border: "none", borderTop: i ? `1px solid ${CC.line}` : "none",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: "0 2px",
              }}>
                <span style={{ flex: 1, fontSize: 15, color: CC.ink }}>{s.label}</span>
                {sort === s.id && <Check size={17} color={CC.pink} />}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

/* ═══ E. Segmented sort, subject in a sheet ═══ */
// Four equal buttons, no horizontal scroll, so every sort is visible without
// a swipe. Subjects go behind a button, because there are eleven of them.

export function FiltersSegmented({ sort, onSort, tags, tag, onTag, counts }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ padding: "0 16px", marginBottom: 12 }}>
        <div style={{
          display: "flex", padding: 3, borderRadius: 12, background: CC.well,
        }}>
          {SORTS.map(s => (
            <button key={s.id} onClick={() => onSort(s.id)} style={{
              flex: 1, minHeight: 36, borderRadius: 9, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 12, fontWeight: 700,
              background: sort === s.id ? CC.white : "transparent",
              color: sort === s.id ? CC.ink : CC.body,
              boxShadow: sort === s.id ? "0 1px 3px rgba(37,67,66,0.12)" : "none",
            }}>{s.short}</button>
          ))}
        </div>

        <button onClick={() => setOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 7, marginTop: 9, minHeight: 36,
          padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
          border: `1px solid ${tag ? CC.pink : CC.line}`,
          background: tag ? CC.pinkTint : CC.white,
          fontSize: 12.5, fontWeight: 700, color: tag ? CC.pink : CC.ink,
        }}>
          {tag || "Any subject"} <ChevronDown size={14} color={tag ? CC.pink : CC.body} />
        </button>
      </div>

      {open && (
        <Sheet title="Subject" onClose={() => setOpen(false)}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip on={!tag} onClick={() => { onTag(null); setOpen(false); }} pink>All</Chip>
            {tags.map(t => (
              <Chip key={t} on={tag === t} onClick={() => { onTag(t); setOpen(false); }} pink>
                {t}{counts?.[t] ? ` ${counts[t]}` : ""}
              </Chip>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}

/* ═══ F. One row, everything behind it ═══ */
// Nothing inline at all. A single row with the active state on it and a count
// badge, and every control in the sheet. Nothing between the search box and
// the first question.

export function FiltersOneRow({ sort, onSort, tags, tag, onTag, counts, matches }) {
  const [open, setOpen] = useState(false);
  const active = (sort !== "recent" ? 1 : 0) + (tag ? 1 : 0);
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "0 16px", marginBottom: 12,
      }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: CC.body }}>
          {matches} questions{tag ? ` in ${tag}` : ""}
        </span>
        <button onClick={() => setOpen(true)} style={{
          display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36,
          padding: "0 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
          border: `1px solid ${active ? CC.pink : CC.line}`,
          background: active ? CC.pinkTint : CC.white,
          fontSize: 12.5, fontWeight: 700, color: active ? CC.pink : CC.ink,
        }}>
          <SlidersHorizontal size={14} color={active ? CC.pink : CC.body} />
          Sort and filter
          {active > 0 && (
            <span style={{
              minWidth: 17, height: 17, borderRadius: 999, padding: "0 5px",
              background: CC.pink, color: "#fff", fontSize: 10.5, fontWeight: 800,
              display: "grid", placeItems: "center",
            }}>{active}</span>
          )}
        </button>
      </div>

      {open && (
        <SortFilterSheet
          sort={sort} onSort={onSort} tags={tags} tag={tag} onTag={onTag}
          counts={counts} matches={matches} onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export const FILTER_VARIANTS = [
  { id: "two-rows", n: "A", name: "Two rows of chips", height: "80px", tag: "Live now",
    note: "Everything visible, nothing hidden. Every sort and every subject is one tap away.",
    cost: "Two rows before the first question, and eleven subjects that only a swipe reveals.",
    Comp: FiltersTwoRows },
  { id: "sliders", n: "B", name: "Chips and a sliders button", height: "44px", tag: "From Change day plan",
    note: "The pattern this app already uses. Subjects scroll, a rule, then a sliders button carrying a count.",
    cost: "Sorting is two taps away, and the badge is the only clue anything is on.",
    Comp: FiltersChipsAndSliders },
  { id: "summary", n: "C", name: "Collapsed summary bar", height: "50px", tag: "From the hotel listing",
    note: "One line saying what is on, with a pencil to change it. The smallest thing that still shows its state in words.",
    cost: "Nothing can be changed without opening the sheet, not even the subject.",
    Comp: FiltersSummaryBar },
  { id: "in-head", n: "D", name: "Sort in the heading", height: "44px", tag: "Saves a row",
    note: "The sort sits where the FAQ count used to, on the Questions row. Subjects keep their own row underneath.",
    cost: "Loses the count from the heading, and a dropdown in a heading is easy to miss.",
    Comp: FiltersSortInHead },
  { id: "segmented", n: "E", name: "Segmented sort", height: "86px", tag: "No swiping",
    note: "Four equal buttons, so every sort is visible without a swipe. Subject goes behind one button.",
    cost: "Four labels in one row means short ones, and it is the tallest of the six.",
    Comp: FiltersSegmented },
  { id: "one-row", n: "F", name: "One row, all behind it", height: "36px", tag: "Lightest",
    note: "Nothing inline. A count, a button, and every control in the sheet. Shortest path from the search box to the first question.",
    cost: "Subjects are invisible until somebody goes looking, so most people never filter at all.",
    Comp: FiltersOneRow },
];
