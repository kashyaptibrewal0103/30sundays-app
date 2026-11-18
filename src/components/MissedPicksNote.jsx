import { useMemo, useState } from "react";
import { Check, ChevronRight, Info, Moon, X as XIcon } from "lucide-react";
import { C } from "../data";
import { activityPool, areaImg } from "../data/buildData";

// ─── The picks that did not make the plan ───
//
// Somebody picks five things in Hanoi, the plan holds three, and two used to
// disappear without a word. This says which, and why, once: it sits above
// "Itinerary at a glance" on the first visit and goes when it is closed.
// When every pick made it there is nothing to say, and it says nothing.
//
// report: { kept: [{ name, city }], dropped: [{ name, city, reason }] }
//
// Five ways to say it, compared at /activities-note-lab:
//   line    one gold line, the hotel sold-out note's own pattern
//   list    the left-out picks with their photos and the reason
//   tally   how many made it, as dots, then what did not
//   ledger  what is in and what is out, side by side
//   fix     the reason as something to do: add a night
//
// Then five takes on the ledger, stacked rather than side by side, each with a
// count for a title and three of each list until "N more" is pressed:
//   stack        Included, then Not included, ticks and crosses
//   stackOut     Not included first, since that is what the title is about
//   stackChips   both lists as chips
//   stackPhotos  both lists as rows with the activity's photo
//   stackCity    one block per city, in and out together
export const NOTE_VARIANTS = ["line", "list", "tally", "ledger", "fix", "stack", "stackOut", "stackChips", "stackPhotos", "stackCity"];

const GOLD = { bg: "#FFFAEB", border: "#FEDF89", fg: "#93370D", icon: "#B54708" };

// "Water puppet show and Train Street visit", "A, B and 1 more".
function joinNames(names, max = 2) {
  if (names.length <= max) return names.length === 2 ? `${names[0]} and ${names[1]}` : names[0];
  return `${names.slice(0, max).join(", ")} and ${names.length - max} more`;
}

// The dropped picks, by the city whose days ran out.
function byCity(dropped) {
  const out = [];
  dropped.forEach((d) => {
    let g = out.find((x) => x.city === d.city);
    if (!g) out.push((g = { city: d.city, reason: d.reason, names: [] }));
    g.names.push(d.name);
  });
  return out;
}

export default function MissedPicksNote({ report, dest, variant = "line", onClose, onFix }) {
  const dropped = report?.dropped || [];
  const kept = report?.kept || [];
  const groups = useMemo(() => byCity(dropped), [dropped]);
  if (!dropped.length) return null;

  if (variant.startsWith("stack")) {
    return <Stacked kept={kept} dropped={dropped} dest={dest} variant={variant} onClose={onClose} />;
  }

  const n = dropped.length;
  const title = `${n} pick${n === 1 ? "" : "s"} didn't fit`;
  const close = <CloseBtn onClose={onClose} color={variant === "line" ? GOLD.icon : C.sub} />;

  if (variant === "line") {
    return (
      <div data-testid="missed-note" style={{
        display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 16,
        background: GOLD.bg, border: `1px solid ${GOLD.border}`, borderRadius: 10, padding: "9px 9px 9px 11px",
      }}>
        <Info size={14} color={GOLD.icon} strokeWidth={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 12.5, lineHeight: "18px", color: GOLD.fg }}>
          <strong style={{ fontWeight: 800 }}>{joinNames(dropped.map((d) => d.name))}</strong>
          {" didn't fit. "}
          {groups.map((g) => g.reason).join(". ")}.
        </p>
        {close}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div data-testid="missed-note" style={{ marginBottom: 18, border: `1px solid ${C.div}`, borderRadius: 14, padding: "12px 12px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: C.head }}>{title}</span>
          {close}
        </div>
        <div style={{ marginTop: 8 }}>
          {dropped.map((d, i) => (
            <div key={d.name} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
              borderTop: i ? `1px solid ${C.div}` : "none",
            }}>
              <Thumb dest={dest} city={d.city} name={d.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.head, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</p>
                <p style={{ margin: "1px 0 0", fontSize: 11.5, color: GOLD.icon, fontWeight: 600 }}>{d.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "tally") {
    const total = kept.length + n;
    return (
      <div data-testid="missed-note" style={{ marginBottom: 18, borderLeft: `3px solid ${GOLD.icon}`, padding: "2px 0 2px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: C.head }}>
            {kept.length} of {total} picks are in
          </span>
          {close}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} style={{
              width: 9, height: 9, borderRadius: "50%", boxSizing: "border-box",
              background: i < kept.length ? C.sText : C.white,
              border: i < kept.length ? "none" : `1.5px solid ${GOLD.icon}`,
            }} />
          ))}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: "18px", color: C.sub }}>
          {groups.map((g) => (
            <span key={g.city} style={{ display: "block" }}>
              <span style={{ color: C.head, fontWeight: 700, textDecoration: "line-through", textDecorationColor: C.inact }}>{g.names.join(", ")}</span>
              {` - ${g.reason.charAt(0).toLowerCase()}${g.reason.slice(1)}.`}
            </span>
          ))}
        </p>
      </div>
    );
  }

  if (variant === "ledger") {
    return (
      <div data-testid="missed-note" style={{ marginBottom: 18, border: `1px solid ${C.div}`, borderRadius: 14, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: C.head }}>Picks</span>
          {close}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 800, color: C.sText }}>In the plan</p>
            {kept.map((k) => (
              <p key={k.name} style={{ margin: "0 0 5px", display: "flex", gap: 5, fontSize: 12, lineHeight: "16px", color: C.head }}>
                <Check size={12} color={C.sText} strokeWidth={3} style={{ flexShrink: 0, marginTop: 2 }} />{k.name}
              </p>
            ))}
          </div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 11.5, fontWeight: 800, color: GOLD.icon }}>Left out</p>
            {dropped.map((d) => (
              <p key={d.name} style={{ margin: "0 0 5px", display: "flex", gap: 5, fontSize: 12, lineHeight: "16px", color: C.head }}>
                <XIcon size={12} color={GOLD.icon} strokeWidth={3} style={{ flexShrink: 0, marginTop: 2 }} />{d.name}
              </p>
            ))}
            <p style={{ margin: "4px 0 0", fontSize: 11, color: C.sub }}>{groups.map((g) => g.reason).join(". ")}</p>
          </div>
        </div>
      </div>
    );
  }

  // fix
  return (
    <div data-testid="missed-note" style={{ marginBottom: 18, display: "flex", flexDirection: "column", gap: 8 }}>
      {groups.map((g, i) => (
        <div key={g.city} style={{
          display: "flex", alignItems: "center", gap: 10,
          border: `1px solid ${C.div}`, borderRadius: 14, padding: "10px 10px 10px 12px",
        }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: GOLD.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Moon size={16} color={GOLD.icon} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.head }}>
              {g.names.length} {g.city} pick{g.names.length === 1 ? "" : "s"} need another night
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 11.5, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {g.names.join(", ")}
            </p>
            <button onClick={() => onFix?.(g.city)} style={{
              marginTop: 5, border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
              fontSize: 12, fontWeight: 800, color: C.p600, display: "inline-flex", alignItems: "center",
            }}>
              Add a night <ChevronRight size={13} strokeWidth={2.6} />
            </button>
          </div>
          {i === 0 && <div style={{ alignSelf: "flex-start" }}>{close}</div>}
        </div>
      ))}
    </div>
  );
}

function CloseBtn({ onClose, color }) {
  return (
    <button aria-label="Dismiss" onClick={onClose} style={{
      flexShrink: 0, border: "none", background: "none", padding: 2, cursor: "pointer", display: "flex",
    }}>
      <XIcon size={15} color={color} />
    </button>
  );
}

// The same photo the card on the activities step showed.
function Thumb({ dest, city, name, size = 40 }) {
  const img = useMemo(() => {
    const g = activityPool(dest, [{ city, n: 1 }], [])[0];
    // A name the step never showed (a seed trip's own shorthand) still gets a
    // photo of the city rather than an empty square.
    return g?.activities.find((a) => a.name === name)?.img || areaImg(dest, city, 0) || null;
  }, [dest, city, name]);
  return (
    <span style={{ width: size, height: size, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "#F4F2F0" }}>
      {img && <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
    </span>
  );
}

// ─── The ledger, stacked ───

const SHOW = 3;

function Stacked({ kept, dropped, dest, variant, onClose }) {
  const n = dropped.length;
  const total = kept.length + n;

  const head = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color: C.head }}>
          {n} {n === 1 ? "activity" : "activities"} not included
        </span>
        <CloseBtn onClose={onClose} color={C.sub} />
      </div>
      <p style={{ margin: "3px 0 0", fontSize: 12.5, lineHeight: "18px", color: C.sub }}>
        {n} of {total} picks left out to make an optimised itinerary.
      </p>
    </>
  );

  const inList = <Group kind="in" items={kept} dest={dest} variant={variant} />;
  const outList = <Group kind="out" items={dropped} dest={dest} variant={variant} />;

  if (variant === "stackCity") {
    const cities = [];
    [...kept.map((k) => ({ ...k, in: true })), ...dropped.map((d) => ({ ...d, in: false }))].forEach((x) => {
      let c = cities.find((y) => y.city === x.city);
      if (!c) cities.push((c = { city: x.city, items: [] }));
      c.items.push(x);
    });
    // The cities with something left out lead: that is what the title is about.
    cities.sort((a, b) => (b.items.some((i) => !i.in) ? 1 : 0) - (a.items.some((i) => !i.in) ? 1 : 0));
    return (
      <Box>
        {head}
        {cities.map((c) => <CityBlock key={c.city} city={c.city} items={c.items} />)}
      </Box>
    );
  }

  return (
    <Box>
      {head}
      {variant === "stackOut" ? <>{outList}<Rule />{inList}</> : <>{inList}<Rule />{outList}</>}
    </Box>
  );
}

function Box({ children }) {
  return (
    <div data-testid="missed-note" style={{ marginBottom: 18, border: `1px solid ${C.div}`, borderRadius: 14, padding: "12px 12px 10px" }}>
      {children}
    </div>
  );
}

const Rule = () => <div style={{ height: 1, background: C.div, margin: "10px 0 0" }} />;

// One list, three long until it is opened.
function Group({ kind, items, dest, variant }) {
  const [all, setAll] = useState(false);
  const isIn = kind === "in";
  const shown = all ? items : items.slice(0, SHOW);
  const more = items.length - SHOW;
  const tone = isIn ? C.sText : GOLD.icon;
  const Icon = isIn ? Check : XIcon;

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: tone }}>
        {isIn ? "Included" : "Not included"} ({items.length})
      </p>

      {variant === "stackChips" ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {shown.map((x) => (
            <span key={x.name} style={{
              display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px 4px 7px", borderRadius: 999,
              background: isIn ? C.sBg : GOLD.bg, color: isIn ? C.sText : GOLD.fg,
              fontSize: 11.5, fontWeight: 700,
            }}>
              <Icon size={11} strokeWidth={3} />{x.name}
              <span style={{ fontWeight: 500, color: C.sub }}>({x.city})</span>
            </span>
          ))}
          {!all && more > 0 && <MoreBtn n={more} onClick={() => setAll(true)} chip />}
        </div>
      ) : (
        <>
          {shown.map((x) => (
            <div key={x.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: variant === "stackPhotos" ? "5px 0" : "3px 0" }}>
              {variant === "stackPhotos"
                ? <Thumb dest={dest} city={x.city} name={x.name} size={34} />
                : <Icon size={13} color={tone} strokeWidth={3} style={{ flexShrink: 0 }} />}
              {/* The city in brackets after the name, on the same line. The
                  reason is the line under the title, said once. */}
              <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: C.head, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {x.name} <span style={{ fontWeight: 500, color: C.inact }}>({x.city})</span>
              </span>
            </div>
          ))}
          {!all && more > 0 && <MoreBtn n={more} onClick={() => setAll(true)} />}
        </>
      )}
    </div>
  );
}

function MoreBtn({ n, onClick, chip = false }) {
  return (
    <button onClick={onClick} style={{
      border: chip ? `1px solid ${C.div}` : "none", background: "none", cursor: "pointer", fontFamily: "inherit",
      padding: chip ? "3px 9px" : "4px 0 0", borderRadius: 999,
      fontSize: 12, fontWeight: 800, color: C.p600, display: "inline-flex", alignItems: "center",
    }}>
      {n} more {!chip && <ChevronRight size={13} strokeWidth={2.6} />}
    </button>
  );
}

function CityBlock({ city, items }) {
  const [all, setAll] = useState(false);
  const outs = items.filter((i) => !i.in);
  // What was left out always shows; the three-at-a-time cap is on what is in.
  const ins = items.filter((i) => i.in);
  const shownIns = all ? ins : ins.slice(0, Math.max(0, SHOW - outs.length));
  const more = ins.length - shownIns.length;
  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.div}` }}>
      <p style={{ margin: "0 0 5px", fontSize: 12.5, fontWeight: 800, color: C.head }}>
        {city}
      </p>
      {[...outs, ...shownIns].map((x) => {
        const Icon = x.in ? Check : XIcon;
        return (
          <p key={x.name} style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: x.in ? C.head : GOLD.fg, textDecoration: x.in ? "none" : "line-through", textDecorationColor: GOLD.border }}>
            <Icon size={12} color={x.in ? C.sText : GOLD.icon} strokeWidth={3} style={{ flexShrink: 0 }} />{x.name}
          </p>
        );
      })}
      {!all && more > 0 && <MoreBtn n={more} onClick={() => setAll(true)} />}
    </div>
  );
}
