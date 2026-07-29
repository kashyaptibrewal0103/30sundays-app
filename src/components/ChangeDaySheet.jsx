import { useState, useRef, useEffect } from "react";
import { X as XIcon, Play, SlidersHorizontal, Check } from "lucide-react";
import { C } from "../data";

const paceLabels = { relaxed: "Relaxed", balanced: "Balanced", active: "Active" };
const crowdLabels = { low: "Low", moderate: "Moderate", high: "High" };
const fmtHrs = (h) => `${h} ${h === 1 ? "hr" : "hrs"}`;

function Metric({ label, value }) {
  return (
    <div>
      <span style={{ display: "block", fontSize: 11, color: C.inact, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, lineHeight: "12px" }}>{label}</span>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: C.head, lineHeight: "15px" }}>{value}</span>
    </div>
  );
}

// One portrait plan card (2-up grid). Tap = choose; play = preview.
function PlanCard({ opt, onSelect, onPreview }) {
  const delta = opt.priceDelta;
  return (
    <div
      data-testid={`plan-card-${opt.id}`}
      onClick={() => { if (!opt.isCurrent) onSelect(opt); }}
      style={{
        borderRadius: 14, overflow: "hidden", background: C.white,
        border: `1.5px solid ${opt.isCurrent ? C.p300 : C.div}`,
        cursor: opt.isCurrent ? "default" : "pointer",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Portrait media */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4", background: C.div }}>
        <img src={opt.heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(0,0,0,0.5))" }} />

        {/* Preview (play) */}
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(opt); }}
          aria-label="Preview this day"
          style={{
            position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%",
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <Play size={12} color="#fff" fill="#fff" />
        </button>

        {/* Price delta chip - neutral */}
        {delta !== 0 && (
          <div style={{
            position: "absolute", left: 8, bottom: 8,
            background: "rgba(24,29,39,0.82)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
            color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8,
          }}>
            {delta > 0 ? "+" : "−"}₹{Math.abs(delta).toLocaleString("en-IN")}
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ padding: "8px 10px 10px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.head, lineHeight: 1.3 }}>
          {opt.activities.join(", ")}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 8px", marginTop: 8 }}>
          <Metric label="Pace" value={paceLabels[opt.scoring.pace]} />
          <Metric label="Activity time" value={fmtHrs(opt.scoring.activityHours)} />
          <Metric label="Travel time" value={fmtHrs(opt.scoring.travelHours)} />
          <Metric label="Crowd levels" value={crowdLabels[opt.scoring.crowdLevel]} />
        </div>

        {/* CTA - pinned to the card bottom so it aligns across the row */}
        <div style={{ marginTop: "auto", paddingTop: 10 }}>
          {opt.isCurrent ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "9px 0", borderRadius: 10, border: `1.5px solid ${C.p300}`,
              fontSize: 12, fontWeight: 600, color: C.p600,
            }}>
              <Check size={13} color={C.p600} />
              Currently selected
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(opt); }}
              style={{
                width: "100%", padding: "9px 0", borderRadius: 10, border: "none",
                background: C.p600, color: "#fff", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Choose this day
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChangeDaySheet({ dayData, combinations = [], onSelect, onPreview, onClose }) {
  const [closing, setClosing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [paceFilter, setPaceFilter] = useState([]);
  const [actFilter, setActFilter] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const scrollRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const frameStyle = isMobile
    ? { position: "fixed", inset: 0, borderRadius: 0 }
    : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 390, height: 844, borderRadius: 44 };

  if (!dayData) return null;
  const { dayNumber, city, contextLine, options } = dayData;

  const handleClose = () => { setClosing(true); setTimeout(onClose, 280); };

  // Filter facets
  const paceOpts = [...new Set(combinations.map(c => c.scoring.pace))];
  const actOpts = [...new Set(combinations.flatMap(c => c.activities))];
  const toggle = (list, setList, val) => {
    setShowMore(false);
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  };

  // The current plan always leads. Everything else is a real, de-duped
  // alternative (no cycling/repeats) so the count is honest.
  const currentOpt = options.find(o => o.isCurrent);
  const passes = (c) =>
    (paceFilter.length === 0 || paceFilter.includes(c.scoring.pace)) &&
    (actFilter.length === 0 || c.activities.some(a => actFilter.includes(a)));
  const seen = new Set([currentOpt ? currentOpt.activities.join("|") : ""]);
  const alts = [];
  for (const c of [...options, ...combinations]) {
    if (c.isCurrent) continue;
    const key = c.activities.join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    if (passes(c)) alts.push(c);
  }
  const activeFilters = paceFilter.length + actFilter.length;

  // Default to 3 rows (current + 5 alternatives); "Show more" reveals the rest.
  const DEFAULT_ALTS = currentOpt ? 5 : 6;
  const shownAlts = showMore ? alts : alts.slice(0, DEFAULT_ALTS);
  const remaining = alts.length - shownAlts.length;

  // A relaxed "leisure day" (no plans). Cheaper than an activity day, so the
  // confirmation surfaces the saving (per-traveller delta).
  const leisureOpt = {
    id: "leisure-day",
    activities: ["Free day, explore at your own pace"],
    scoring: { pace: "relaxed", activityHours: 0, travelHours: 0, crowdLevel: "low" },
    priceDelta: -2000,
    heroImage: currentOpt?.heroImage || options[0]?.heroImage,
    isCurrent: false,
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    if (!expanded && el.scrollTop > 24) setExpanded(true);
  };

  const chip = (label, active, onClick, key) => (
    <button key={key || label} onClick={onClick} style={{
      padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
      fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
      border: `1px solid ${active ? C.p600 : C.div}`,
      background: active ? C.p600 : C.white, color: active ? "#fff" : C.head,
    }}>{label}</button>
  );

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} style={{ ...frameStyle, background: "rgba(0,0,0,0.55)", zIndex: 300, animation: closing ? "fadeOutBg 0.28s ease-out forwards" : "fadeInBg 0.28s ease-out forwards" }} />

      {/* Sheet */}
      <div style={{ ...frameStyle, zIndex: 301, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: expanded ? "100%" : "82%",
          background: C.white,
          borderRadius: expanded ? 0 : "24px 24px 0 0",
          display: "flex", flexDirection: "column", pointerEvents: "auto",
          transition: "height 0.34s cubic-bezier(0.22,1,0.36,1), border-radius 0.3s ease",
          animation: closing ? "sheetSlideDown 0.28s ease-in forwards" : "sheetSlideUp 0.32s ease-out forwards",
        }}>
          {/* Drag handle */}
          <div onClick={() => setExpanded(e => !e)} style={{ display: "flex", justifyContent: "center", padding: expanded ? "44px 0 6px" : "10px 0 6px", cursor: "pointer", flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div }} />
          </div>

          {/* Header */}
          <div style={{ padding: "6px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0, borderBottom: `1px solid ${C.div}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>Change Day {dayNumber}, {city}</p>
            </div>
            <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: 8 }}>
              <XIcon size={16} color={C.sub} />
            </button>
          </div>

          {/* Scrollable body */}
          <div ref={scrollRef} onScroll={onScroll} className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 16px calc(86px + env(safe-area-inset-bottom))" }}>
            {/* Our picks */}
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>Our picks</p>
            {(currentOpt || shownAlts.length) ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {currentOpt && <PlanCard key={currentOpt.id} opt={currentOpt} onSelect={onSelect} onPreview={onPreview} />}
                {shownAlts.map((opt, i) => (
                  <PlanCard key={`${opt.id}-${i}`} opt={opt} onSelect={onSelect} onPreview={onPreview} />
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: C.sub, fontSize: 13, margin: "30px 0" }}>No plans match these filters.</p>
            )}

            {/* Show more / less */}
            {remaining > 0 && (
              <button onClick={() => setShowMore(true)} style={{
                display: "block", width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 12,
                border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Show {remaining} more plan{remaining !== 1 ? "s" : ""}
              </button>
            )}
            {showMore && alts.length > DEFAULT_ALTS && (
              <button onClick={() => { setShowMore(false); scrollRef.current?.scrollTo({ top: 0 }); }} style={{
                display: "block", width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 12,
                border: "none", background: "none", color: C.sub, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                Show less
              </button>
            )}
          </div>

          {/* Pinned muted footer: quiet leisure-day fallback, always visible but secondary */}
          <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, background: "#F7F7F8", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))" }}>
            <button onClick={() => onSelect(leisureOpt)} style={{
              display: "block", width: "100%", background: "none", border: "none", cursor: "pointer",
              fontFamily: "inherit", textAlign: "center", fontSize: 12.5, color: C.sub, lineHeight: "18px",
            }}>
              Prefer a free day? <span style={{ color: C.p600, fontWeight: 600 }}>Make it a leisure day</span>
            </button>
          </div>

          {/* Floating filters bar - sits above the pinned leisure footer */}
          <div style={{ position: "absolute", bottom: "calc(66px + env(safe-area-inset-bottom))", left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 4 }}>
            <button
              data-testid="toggle-filters"
              onClick={() => setShowFilters(true)}
              style={{
                pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 22px", borderRadius: 999, border: "none",
                background: C.head, color: "#fff", fontSize: 13.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(0,0,0,0.24)",
              }}
            >
              <SlidersHorizontal size={15} color="#fff" />
              Filters{activeFilters > 0 ? ` · ${activeFilters}` : ""}
            </button>
          </div>

          {/* Filters bottom sheet */}
          {showFilters && (
            <div style={{ position: "absolute", inset: 0, zIndex: 6, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div onClick={() => setShowFilters(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
              <div style={{
                position: "relative", background: C.white, borderRadius: "20px 20px 0 0",
                padding: "8px 16px calc(18px + env(safe-area-inset-bottom))", maxHeight: "72%", overflowY: "auto",
                animation: "sheetSlideUp 0.28s ease-out", boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
              }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 14px" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>Filters</h3>
                  {activeFilters > 0 && (
                    <button onClick={() => { setPaceFilter([]); setActFilter([]); setShowMore(false); }} style={{ background: "none", border: "none", color: C.p600, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Clear all
                    </button>
                  )}
                </div>

                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: C.inact, textTransform: "uppercase", letterSpacing: 0.4 }}>Pace</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                  {paceOpts.map(p => chip(paceLabels[p] || p, paceFilter.includes(p), () => toggle(paceFilter, setPaceFilter, p), p))}
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: C.inact, textTransform: "uppercase", letterSpacing: 0.4 }}>Activities</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {actOpts.map(a => chip(a, actFilter.includes(a), () => toggle(actFilter, setActFilter, a), a))}
                </div>

                <button onClick={() => setShowFilters(false)} style={{
                  width: "100%", marginTop: 22, padding: "14px 0", borderRadius: 12, border: "none",
                  background: C.p600, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>
                  Show {alts.length} plan{alts.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
