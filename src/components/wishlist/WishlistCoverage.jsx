import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Heart, X as XIcon } from "lucide-react";
import { C } from "../../data";
import { useWishlist } from "../../data/wishlist";
import { KindDisc } from "../../data/wishlistKinds";

// ─── How much of the wishlist this itinerary covers ───
//
// Chosen on the wishlist canvas: one line at the top of the itinerary with a
// small ring (C1), and View opens a sheet grouped by kind (C5). Cities, stays
// and things to do count; food and shops do not, because an itinerary does
// not book them. A missing save gets a small grey link to go and add it.

const KINDS = [
  { kind: "region", title: "Cities" },
  { kind: "hotel", title: "Stays" },
  { kind: "activity", title: "Things to do" },
];
const low = (s) => String(s || "").toLowerCase();
const span = (a, b) => (a === b ? `Day ${a}` : `Day ${a} - ${b}`);

// days: the itinerary's stays ({ city, n }); dayActs: one entry per day with
// its activities; picked: the day plans chosen on top ({ dayIndex: option });
// hotels: the stay picked for each stay, in order.
export function useCoverage({ dest, days, dayActs, picked, hotels }) {
  const { ofKind } = useWishlist();
  return useMemo(() => {
    // Which days each city covers, counted through the stays.
    const cityDays = {};
    let d = 1;
    (days || []).forEach((s) => {
      const first = d; d += s.n || 1;
      const c = cityDays[s.city];
      cityDays[s.city] = c ? [c[0], d - 1] : [first, d - 1];
    });
    const dayOfAct = (name) => {
      const n = low(name);
      for (let i = 0; i < (dayActs || []).length; i++) {
        const names = [...(picked?.[i]?.activities || []), ...((dayActs[i].activities || []).map((a) => a.name))];
        if (names.some((x) => low(x) === n)) return dayActs[i].dayNum || i + 1;
      }
      return null;
    };
    const rows = [];
    ofKind("region", dest).forEach((it) => {
      const r = cityDays[it.id];
      rows.push({ kind: "region", key: it.key, name: it.id, city: it.id, in: !!r, where: r ? span(r[0], r[1]) : null, day: r ? r[0] : 99 });
    });
    ofKind("hotel", dest).forEach((it) => {
      const at = (hotels || []).findIndex((h) => low(h?.name) === low(it.name));
      rows.push({ kind: "hotel", key: it.key, name: it.name, city: it.city, in: at >= 0, where: at >= 0 ? hotels[at].city : null });
    });
    ofKind("activity", dest).forEach((it) => {
      const n = dayOfAct(it.name);
      rows.push({ kind: "activity", key: it.key, name: it.name, city: it.city, in: n != null, where: n != null ? `Day ${n}` : null, day: n ?? 99 });
    });
    const inCount = rows.filter((r) => r.in).length;
    return { rows, inCount, total: rows.length, pct: rows.length ? Math.round((inCount / rows.length) * 100) : 0, cityDays };
  }, [ofKind, dest, days, dayActs, picked, hotels]);
}

function Ring({ pct, size = 34, stroke = 4.5, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span style={{ position: "relative", width: size, height: size, flexShrink: 0, display: "inline-block" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.p100} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.p600} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</span>
    </span>
  );
}

// ─── C1: the one line ───
export function CoverageLine({ dest, cov, onView }) {
  if (!cov.total) return null;
  return (
    <button data-testid="wishlist-coverage" onClick={onView} style={{
      margin: "4px 16px 14px", width: "calc(100% - 32px)", boxSizing: "border-box",
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14,
      border: `1px solid ${C.div}`, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <Ring pct={cov.pct}><Heart size={12} color={C.p600} fill={C.p600} /></Ring>
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: C.head, lineHeight: 1.35 }}>
        {cov.inCount === 0 ? `None of your ${dest} wishlist is in this trip yet` : `${cov.pct}% of your ${dest} wishlist is in this trip`}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", fontSize: 13.5, fontWeight: 800, color: C.p600, flexShrink: 0 }}>
        View<ChevronRight size={14} color={C.p600} />
      </span>
    </button>
  );
}

// ─── C5: the sheet, grouped by kind ───
// onAdd(row) takes the person to where that save can be put in: the cities
// screen, the hotel list for that town, or the day plans for a day there.
export function CoverageSheet({ dest, cov, onClose, onAdd }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const content = (
    <div data-testid="coverage-sheet" style={{ position: "absolute", inset: 0, zIndex: 1500, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,30,76,0.4)" }} />
      <div style={{ position: "relative", maxHeight: "88%", background: C.white, borderRadius: "22px 22px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "#D5D7DA", margin: "8px auto 0", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 6px", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.head }}>Your wishlist in this trip</p>
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <XIcon size={18} color={C.head} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "6px 16px 14px", borderBottom: `1px solid ${C.div}`, flexShrink: 0 }}>
          <Ring pct={cov.pct} size={84} stroke={9}>
            <span style={{ fontSize: 20, fontWeight: 800, color: C.head }}>{cov.pct}%</span>
          </Ring>
          <span style={{ fontSize: 15, fontWeight: 800, color: C.head, lineHeight: 1.35 }}>
            {cov.inCount} of your {cov.total} {dest} saves {cov.inCount === 1 ? "is" : "are"} in
          </span>
        </div>
        <div className="hide-scrollbar" style={{ overflowY: "auto", padding: "4px 16px calc(20px + env(safe-area-inset-bottom))" }}>
          {KINDS.map(({ kind, title }) => {
            const rows = cov.rows.filter((r) => r.kind === kind);
            if (!rows.length) return null;
            const n = rows.filter((r) => r.in).length;
            return (
              <div key={kind} style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 800, color: C.head }}>
                  {title} <span style={{ fontWeight: 600, color: C.sub }}>{n} of {rows.length}</span>
                </p>
                {[...rows].sort((a, b) => (b.in - a.in) || ((a.day || 99) - (b.day || 99))).map((r) => (
                  <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 42 }}>
                    <KindDisc kind={kind} size={22} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: r.in ? 700 : 600, color: r.in ? C.head : C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                    {r.in ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#027A48", flexShrink: 0 }}>
                        <Check size={13} color="#027A48" strokeWidth={2.6} />{r.where}
                      </span>
                    ) : onAdd ? (
                      <button onClick={() => onAdd(r)} style={{
                        flexShrink: 0, minHeight: 32, padding: 0, border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
                        fontSize: 12.5, fontWeight: 700, color: C.sub, textDecoration: "underline", textUnderlineOffset: 3,
                      }}>{kind === "hotel" ? "Swap in" : "Add"}</button>
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  return frame ? createPortal(content, frame) : content;
}
