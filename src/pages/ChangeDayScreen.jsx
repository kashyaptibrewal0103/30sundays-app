import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Search, X as XIcon, SlidersHorizontal, ArrowDownUp, Check,
  Clock, Car, MapPin, Layers, Play, Heart, Zap, Gauge, Flame, Moon, ChevronRight, Sparkles,
} from "lucide-react";
import { C } from "../data";
import { DayRatingPill } from "../components/DayRating";
import { DURATIONS, TRANSFERS, PACES, RATING_BANDS } from "../data/dayOptionShape";

// ─── Change day plan, full screen ───
//
// Replaces the bottom sheet. A day's alternatives are a browse problem, not a
// confirmation problem: there are a dozen of them, they differ on several axes
// at once, and the price moves. A sheet could only ever show four at a time
// behind a "show more".
//
// Cards lead with their media, the way the reference does, because the photo is
// what people scan first. Everything a plan is compared on sits under it: what
// it covers, how long it runs, the transfer, the stop count, and the price
// difference from the day you already have.

const PACE_ICON = { Relaxed: Moon, Balanced: Heart, Active: Zap, "Fast-paced": Flame };
// Sorting lives on the bar, not in the filter sheet. Recommended is one of the
// three controls rather than only the starting state: once you have sorted by
// price there has to be a way back to the order we put them in.
const SORTS = [
  { key: "asc", label: "Sort Asc" },
  { key: "desc", label: "Sort Desc" },
];

const money = (n) => `₹${Math.abs(n).toLocaleString("en-IN")}`;

function PriceDelta({ delta, big = false }) {
  if (!delta) {
    return (
      <span style={{ fontSize: big ? 13.5 : 12.5, fontWeight: 600, color: C.sub }}>
        No change in price
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: up ? "#FEF3F2" : "#ECFDF3", color: up ? "#B42318" : "#027A48",
      borderRadius: 999, padding: big ? "7px 13px" : "5px 10px",
      fontSize: big ? 13.5 : 12.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      {up ? "More by" : "Lesser by"} {money(delta)}
    </span>
  );
}

function PaceChip({ pace, colors }) {
  const Icon = PACE_ICON[pace] || Gauge;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: C.white, border: `1px solid ${colors.icon}44`, color: colors.text,
    }}>
      <Icon size={11} color={colors.icon} fill={colors.icon} strokeWidth={0} />
      {pace}
    </span>
  );
}

function Fact({ icon: Icon, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
      <Icon size={12.5} color={C.inact} />
      {children}
    </span>
  );
}

// ─── One plan ───────────────────────────────────────────────────────────────
function OptionCard({ opt, onOpen }) {
  return (
    <div
      data-testid={`day-option-${opt.id}`}
      onClick={() => onOpen(opt)}
      role="button"
      style={{
        borderRadius: 14, overflow: "hidden", background: C.white, cursor: "pointer",
        border: `1px solid ${C.div}`,
        boxShadow: "0 1px 4px rgba(24,30,76,0.05)",
      }}
    >
      {/* Media, scrollable when the plan has more than one */}
      <div style={{ position: "relative", height: 168, background: C.div }}>
        <div className="hide-scrollbar" style={{ display: "flex", height: "100%", overflowX: "auto", gap: 2 }}>
          {opt.images.map((src, i) => (
            <div key={i} style={{
              position: "relative", flexShrink: 0, height: "100%",
              width: opt.images.length > 1 ? "86%" : "100%",
            }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
        </div>
        {opt.video && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{
              width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.92)",
              display: "grid", placeItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
            }}>
              <Play size={15} color={C.head} fill={C.head} style={{ marginLeft: 2 }} />
            </span>
          </div>
        )}
        {opt.mediaCount > 1 && (
          <div style={{
            position: "absolute", right: 9, bottom: 9, display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(12,16,40,0.78)", borderRadius: 6, padding: "3px 8px",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          }}>
            <Layers size={11} color="#fff" />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>
              {opt.video ? `${opt.mediaCount} media` : `${opt.images.length} images`}
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: "11px 12px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head, lineHeight: 1.32 }}>{opt.name}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <DayRatingPill rating={opt.rating} style="outline" showCount />
          <PaceChip pace={opt.pace} colors={opt.paceColors} />
        </div>

        <div style={{ display: "flex", gap: "5px 14px", flexWrap: "wrap" }}>
          {opt.durationLabel && <Fact icon={Clock}>{opt.durationLabel}</Fact>}
          <Fact icon={Car}>{opt.transfer}</Fact>
          <Fact icon={MapPin}>{opt.activityCount} {opt.activityCount === 1 ? "activity" : "activities"}</Fact>
        </div>

        {/* No CTA label: the whole card opens the plan, and the chevron is
            what says so. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: `1px solid ${C.div}`, paddingTop: 10 }}>
          <PriceDelta delta={opt.priceDelta} />
          <ChevronRight size={18} color={C.sub} style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Filters ────────────────────────────────────────────────────────────────
function FiltersSheet({ value, onChange, onClose, matchCount }) {
  const [draft, setDraft] = useState(value);
  const toggle = (group, key) => setDraft((d) => ({
    ...d,
    [group]: d[group].includes(key) ? d[group].filter((x) => x !== key) : [...d[group], key],
  }));
  const count = draft.duration.length + draft.transfer.length + draft.pace.length + draft.rating.length;

  const Row = ({ label, on, onClick }) => (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
      padding: "13px 14px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
      border: `1px solid ${on ? C.p600 : C.div}`, background: on ? "#FFF5F7" : C.white,
      fontSize: 14, fontWeight: on ? 700 : 500, color: C.head, textAlign: "left",
    }}>
      {label}
      <span style={{
        width: 19, height: 19, borderRadius: 5, flexShrink: 0,
        border: `1.5px solid ${on ? C.p600 : C.icon}`, background: on ? C.p600 : "transparent",
        display: "grid", placeItems: "center",
      }}>
        {on && <Check size={13} color="#fff" strokeWidth={3} />}
      </span>
    </button>
  );

  const Group = ({ title, children }) => (
    <div style={{ marginBottom: 22 }}>
      <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: C.head }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, background: C.white, display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.div}` }}>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.head }}>Sort and filters</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setDraft({ duration: [], transfer: [], pace: [], rating: [], sort: draft.sort })} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
            fontSize: 13.5, fontWeight: 600, color: count ? C.head : C.inact, textDecoration: "underline", textUnderlineOffset: 3,
          }}>Reset all</button>
          <button onClick={onClose} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <XIcon size={20} color={C.head} />
          </button>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "18px 16px 24px" }}>
        <Group title="Day duration">
          {DURATIONS.map((d) => (
            <Row key={d.key} label={d.label} on={draft.duration.includes(d.key)} onClick={() => toggle("duration", d.key)} />
          ))}
        </Group>
        <Group title="Transfer">
          {TRANSFERS.map((t) => (
            <Row key={t.key} label={t.label} on={draft.transfer.includes(t.key)} onClick={() => toggle("transfer", t.key)} />
          ))}
        </Group>
        <Group title="Day pace">
          {PACES.map((p) => (
            <Row key={p.key} label={p.label} on={draft.pace.includes(p.key)} onClick={() => toggle("pace", p.key)} />
          ))}
        </Group>
        <Group title="Day rating">
          {RATING_BANDS.map((r) => (
            <Row key={r.key} label={r.label} on={draft.rating.includes(r.key)} onClick={() => toggle("rating", r.key)} />
          ))}
        </Group>
      </div>

      <div style={{ flexShrink: 0, padding: "12px 16px calc(14px + env(safe-area-inset-bottom))", borderTop: `1px solid ${C.div}` }}>
        <button
          data-testid="apply-filters"
          onClick={() => { onChange(draft); onClose(); }}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 12, border: "none",
            background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── The screen ─────────────────────────────────────────────────────────────
export default function ChangeDayScreen({
  dayNumber, city, options, onOpen, onClose, onLeisureDay, frameStyle,
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [f, setF] = useState({ duration: [], transfer: [], pace: [], rating: [], sort: "recommended" });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // The plan already on the day is not an option to change to, so it is not
    // in the list at all.
    let list = options.filter((o) => !o.isCurrent).filter((o) => {
      if (q && !o.name.toLowerCase().includes(q)) return false;
      if (f.duration.length && !f.duration.includes(o.durationKey)) return false;
      if (f.transfer.length && !f.transfer.includes(o.transferKey)) return false;
      if (f.pace.length && !f.pace.includes(o.paceKey)) return false;
      if (f.rating.length) {
        const pct = o.rating?.enjoyedPct ?? -1;
        const min = Math.min(...f.rating.map((k) => RATING_BANDS.find((b) => b.key === k)?.min ?? 0));
        if (pct < min) return false;
      }
      return true;
    });
    if (f.sort === "asc") list = [...list].sort((a, b) => a.priceDelta - b.priceDelta);
    else if (f.sort === "desc") list = [...list].sort((a, b) => b.priceDelta - a.priceDelta);
    // Recommended: best reviewed first.
    else list = [...list].sort((a, b) => (b.rating?.enjoyedPct || 0) - (a.rating?.enjoyedPct || 0));
    return list;
  }, [options, query, f]);

  const activeCount = f.duration.length + f.transfer.length + f.pace.length + f.rating.length;
  const sorted = f.sort === "asc" || f.sort === "desc";
  const sortLabel = SORTS.find((s) => s.key === f.sort)?.label || "Sort Asc";

  // Escape closes, the way a full screen should.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") (showFilters ? setShowFilters(false) : onClose()); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showFilters, onClose]);

  return (
    <div style={{ ...frameStyle, zIndex: 310, background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: C.white, borderBottom: `1px solid ${C.div}`, padding: "13px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onClose} aria-label="Back" style={{
            width: 34, height: 34, borderRadius: "50%", border: "none", background: C.bg,
            display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
          }}>
            <ArrowLeft size={18} color={C.head} />
          </button>
          {searching ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search plans in ${city}`}
              style={{
                flex: 1, minWidth: 0, border: `1px solid ${C.div}`, borderRadius: 999,
                padding: "9px 14px", fontSize: 13.5, fontFamily: "inherit", color: C.head, outline: "none",
              }}
            />
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Day {dayNumber} · {city}
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 12, color: C.sub }}>
                {shown.length} {shown.length === 1 ? "day plan" : "day plans"}
              </p>
            </div>
          )}
          <button
            data-testid="toggle-search"
            onClick={() => { setSearching((s) => !s); if (searching) setQuery(""); }}
            style={{
              flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 13px", borderRadius: 999, border: "none", background: C.bg,
              fontSize: 13, fontWeight: 600, color: C.head, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {searching ? <XIcon size={15} color={C.head} /> : <Search size={15} color={C.head} />}
            {!searching && "Search"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 16px calc(132px + env(safe-area-inset-bottom))" }}>
        {shown.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.head }}>Nothing matches those filters</p>
            <p style={{ margin: "6px 0 16px", fontSize: 13, color: C.sub, lineHeight: "19px" }}>
              Try clearing a filter, or search for a place you had in mind.
            </p>
            <button onClick={() => { setF({ duration: [], transfer: [], pace: [], rating: [], sort: f.sort }); setQuery(""); }} style={{
              padding: "10px 18px", borderRadius: 999, border: `1px solid ${C.div}`, background: C.white,
              fontSize: 13, fontWeight: 600, color: C.p600, cursor: "pointer", fontFamily: "inherit",
            }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {shown.map((o) => <OptionCard key={o.id} opt={o} onOpen={onOpen} />)}
          </div>
        )}

      </div>

      {/* Recommended · sort · filters. Three controls, so a price sort is
          always reversible back to the order we put them in. */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5,
        background: C.head,
      }}>
        {/* Sticky, and deliberately quiet. At the foot of a twelve-card list
            nobody ever scrolled far enough to find it. */}
        {onLeisureDay && (
          <button onClick={onLeisureDay} style={{
            display: "block", width: "100%", padding: "9px 16px", background: "rgba(255,255,255,0.07)",
            border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
            fontFamily: "inherit", fontSize: 12, color: "rgba(255,255,255,0.68)", textAlign: "center",
          }}>
            Prefer a free day? <span style={{ color: "#fff", fontWeight: 700 }}>Make it a leisure day</span>
          </button>
        )}
        <div style={{ display: "flex", gap: 7, padding: "9px 11px calc(11px + env(safe-area-inset-bottom))" }}>
          <button
            data-testid="sort-recommended"
            onClick={() => setF((x) => ({ ...x, sort: "recommended" }))}
            style={{
              flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "11px 6px", borderRadius: 999, border: "none",
              background: !sorted ? "#fff" : "rgba(255,255,255,0.14)",
              fontSize: 12, fontWeight: 700, color: !sorted ? C.head : "#fff",
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}
          >
            <Sparkles size={13} color={!sorted ? C.head : "#fff"} />
            Recommended
          </button>
          <button
            data-testid="cycle-sort"
            onClick={() => setF((x) => ({ ...x, sort: x.sort === "asc" ? "desc" : "asc" }))}
            style={{
              flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "11px 6px", borderRadius: 999, border: "none",
              background: sorted ? "#fff" : "rgba(255,255,255,0.14)",
              fontSize: 12, fontWeight: 700, color: sorted ? C.head : "#fff",
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}
          >
            <ArrowDownUp size={13} color={sorted ? C.head : "#fff"} />
            {sorted ? sortLabel : "Sort"}
          </button>
          <button
            data-testid="open-filters"
            onClick={() => setShowFilters(true)}
            style={{
              flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "11px 6px", borderRadius: 999, border: "none",
              background: activeCount ? C.p600 : "rgba(255,255,255,0.14)",
              fontSize: 12, fontWeight: 700, color: "#fff",
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}
          >
            <SlidersHorizontal size={13} color="#fff" />
            Filters{activeCount ? ` · ${activeCount}` : ""}
          </button>
        </div>
      </div>

      {showFilters && (
        <FiltersSheet
          value={f}
          onChange={setF}
          onClose={() => setShowFilters(false)}
          matchCount={shown.length}
        />
      )}
    </div>
  );
}
