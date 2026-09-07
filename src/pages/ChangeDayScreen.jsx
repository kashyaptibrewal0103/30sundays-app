import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Search, X as XIcon, SlidersHorizontal,
  Clock, Car, MapPin, Layers, Play, Heart, Zap, Gauge, Flame, Moon, ChevronRight,
} from "lucide-react";
import { C } from "../data";
import { DayRatingPill } from "../components/DayRating";
import { TRANSFERS, PACES, RATING_BANDS } from "../data/dayOptionShape";
import { FilterChip, SearchableCheckList } from "./HotelListing";

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
// Same shape as the Change hotel screen: sorting and filters share one tabbed
// sheet, so there is one place to change how the list is ordered or cut.
const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "asc", label: "Price difference: low to high" },
  { key: "desc", label: "Price difference: high to low" },
];

// The four cuts people reach for most, on the bar itself. Each is a shortcut
// into the same filter state the sheet writes, so the two never disagree.
const QUICK = [
  { label: "Private transfer", group: "transfer", key: "private" },
  { label: "Shared transfer", group: "transfer", key: "shared" },
  { label: "Relaxed day", group: "pace", key: "relaxed" },
  { label: "90% and above rating", group: "rating", key: "90" },
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

// ─── Sorting and filters, one tabbed sheet ────────────────────────────────
// Deliberately the Change hotel screen's sheet: same tabs, same chips, same
// searchable checklist, so the two flows are learned once.
function SortFilterSheet({ tab, setTab, f, setF, activityOptions, matchCount, onClose }) {
  const toggle = (group, key) => setF((d) => ({
    ...d,
    [group]: d[group].includes(key) ? d[group].filter((x) => x !== key) : [...d[group], key],
  }));
  const activeCount = f.transfer.length + f.pace.length + f.rating.length + f.activities.length;

  const label = (t) => (
    <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 8px" }}>{t}</p>
  );

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", zIndex: 1, height: "72%", display: "flex", flexDirection: "column" }}>

        <div style={{ flexShrink: 0, padding: "14px 20px 0", display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: 1, display: "flex" }}>
            {["Filters", "Sort"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, fontSize: 15, fontWeight: tab === t ? 600 : 500, color: tab === t ? C.head : C.inact,
                background: "none", border: "none", cursor: "pointer", padding: "0 0 12px", fontFamily: "inherit",
                borderBottom: tab === t ? "2px solid #FD014F" : "2px solid transparent", textAlign: "center",
              }}>{t}</button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 28, height: 28, borderRadius: "50%", background: C.bg, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 4 }}>
            <XIcon size={14} color={C.sub} />
          </button>
        </div>

        {tab === "Sort" && (
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "8px 20px 24px" }}>
            {SORTS.map((opt, i) => (
              <button
                key={opt.key}
                data-testid={`sort-${opt.key}`}
                onClick={() => { setF((d) => ({ ...d, sort: opt.key })); onClose(); }}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "12px 0",
                  background: "none", border: "none",
                  borderBottom: i < SORTS.length - 1 ? `1px solid ${C.div}` : "none",
                  fontSize: 14, color: f.sort === opt.key ? "#FD014F" : C.head,
                  fontWeight: f.sort === opt.key ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {opt.label} {f.sort === opt.key && "✓"}
              </button>
            ))}
          </div>
        )}

        {tab === "Filters" && (
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
            {label("Transfer")}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {TRANSFERS.map((t) => (
                <FilterChip key={t.key} label={t.label} on={f.transfer.includes(t.key)} onClick={() => toggle("transfer", t.key)} />
              ))}
            </div>

            {label("Day pace")}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {PACES.map((p) => (
                <FilterChip key={p.key} label={p.label} on={f.pace.includes(p.key)} onClick={() => toggle("pace", p.key)} />
              ))}
            </div>

            {label("Day rating")}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {RATING_BANDS.map((r) => (
                <FilterChip key={r.key} label={r.label} on={f.rating.includes(r.key)} onClick={() => toggle("rating", r.key)} />
              ))}
            </div>

            {label("Activities")}
            <SearchableCheckList
              options={activityOptions}
              selected={new Set(f.activities)}
              onToggle={(a) => toggle("activities", a)}
              placeholder="Search activities"
            />
          </div>
        )}

        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, padding: "10px 20px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setF((d) => ({ transfer: [], pace: [], rating: [], activities: [], sort: d.sort }))}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
              fontSize: 13.5, fontWeight: 600, color: activeCount ? C.head : C.inact,
              textDecoration: "underline", textUnderlineOffset: 3, flexShrink: 0,
            }}
          >Reset all</button>
          <button
            data-testid="apply-filters"
            onClick={onClose}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
              background: C.p600, color: "#fff", fontSize: 14.5, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Show {matchCount} {matchCount === 1 ? "plan" : "plans"}
          </button>
        </div>
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
  const [sheetTab, setSheetTab] = useState("Filters");
  const [f, setF] = useState({ transfer: [], pace: [], rating: [], activities: [], sort: "recommended" });

  // Every activity on offer for this day, for the searchable filter.
  const activityOptions = useMemo(
    () => [...new Set(options.flatMap((o) => o.activities || []))].sort(),
    [options],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    // The plan already on the day is not an option to change to, so it is not
    // in the list at all.
    let list = options.filter((o) => !o.isCurrent).filter((o) => {
      if (q && !o.name.toLowerCase().includes(q)) return false;
      if (f.transfer.length && !f.transfer.includes(o.transferKey)) return false;
      if (f.pace.length && !f.pace.includes(o.paceKey)) return false;
      if (f.rating.length) {
        const pct = o.rating?.enjoyedPct ?? -1;
        const min = Math.min(...f.rating.map((k) => RATING_BANDS.find((b) => b.key === k)?.min ?? 0));
        if (pct < min) return false;
      }
      // A plan matches if it contains any of the chosen activities.
      if (f.activities.length && !(o.activities || []).some((a) => f.activities.includes(a))) return false;
      return true;
    });
    if (f.sort === "asc") list = [...list].sort((a, b) => a.priceDelta - b.priceDelta);
    else if (f.sort === "desc") list = [...list].sort((a, b) => b.priceDelta - a.priceDelta);
    // Recommended: best reviewed first.
    else list = [...list].sort((a, b) => (b.rating?.enjoyedPct || 0) - (a.rating?.enjoyedPct || 0));
    return list;
  }, [options, query, f]);

  const activeCount = f.transfer.length + f.pace.length + f.rating.length + f.activities.length;
  const quickOn = (q) => f[q.group].includes(q.key);
  const toggleQuick = (q) => setF((d) => ({
    ...d,
    [q.group]: d[q.group].includes(q.key) ? d[q.group].filter((x) => x !== q.key) : [...d[q.group], q.key],
  }));

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
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 16px calc(112px + env(safe-area-inset-bottom))" }}>
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

      {/* Floating bar, the Change hotel screen's pattern: quick chips, a
          separator, then one control that opens sorting and filters. The
          leisure-day offer rides on the same card so it stays in view without
          competing with the chips. */}
      <div style={{
        position: "absolute", bottom: 12, left: 12, right: 12, zIndex: 10,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        {onLeisureDay && (
          <button
            data-testid="make-leisure-day"
            onClick={onLeisureDay}
            style={{
              display: "block", width: "100%", padding: "8px 12px",
              background: "none", border: "none", borderBottom: `1px solid ${C.div}`,
              cursor: "pointer", fontFamily: "inherit", fontSize: 12, color: C.sub,
              textAlign: "center",
            }}
          >
            Prefer a free day? <span style={{ color: C.p600, fontWeight: 700 }}>Make it a leisure day</span>
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
          <div className="hs" style={{ flex: 1, gap: 6, paddingBottom: 0, minWidth: 0 }}>
            {QUICK.map((q) => {
              const on = quickOn(q);
              return (
                <button
                  key={q.label}
                  data-testid={`quick-${q.key}-${q.group}`}
                  onClick={() => toggleQuick(q)}
                  style={{
                    flexShrink: 0, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit",
                    border: on ? "1.5px solid #FD014F" : `1.5px solid ${C.div}`,
                    background: on ? "#FFEBF1" : C.white,
                    fontSize: 12, fontWeight: 500, color: on ? "#FD014F" : C.head,
                    whiteSpace: "nowrap",
                  }}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
          <div style={{ width: 1, height: 24, background: C.div, flexShrink: 0 }} />
          <button
            data-testid="open-filters"
            onClick={() => { setSheetTab("Filters"); setShowFilters(true); }}
            aria-label="Sorting and filters"
            style={{
              position: "relative", width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: activeCount > 0 ? "#FFEBF1" : "transparent",
              border: activeCount > 0 ? "1.5px solid #FD014F" : `1px solid ${C.div}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <SlidersHorizontal size={14} color={activeCount > 0 ? "#FD014F" : C.sub} />
            {activeCount > 0 && (
              <div style={{
                position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%",
                background: "#FD014F", color: "#fff", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{activeCount}</div>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <SortFilterSheet
          tab={sheetTab}
          setTab={setSheetTab}
          f={f}
          setF={setF}
          activityOptions={activityOptions}
          matchCount={shown.length}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
