import { useState, useRef, useEffect } from "react";
import { ArrowLeft, X as XIcon, ChevronDown, ChevronRight, Check, Copy } from "lucide-react";
import { C } from "../../data";

// Shared chrome for the gift card and gift registry screens. Everything here
// sits on white and keeps pink for the things that should be noticed, in line
// with the rest of the app.

export const PAD = 18;

// `transparent` lets the app's background wash run behind the bar, the way the
// real app bar does.
export function TopBar({ title, sub, onBack, right, transparent }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: `10px ${PAD}px`,
      borderBottom: transparent ? "none" : `1px solid ${C.div}`,
      background: transparent ? "transparent" : C.white, flexShrink: 0,
    }}>
      {onBack && (
        <button onClick={onBack} aria-label="Back" style={{
          width: 40, height: 40, marginLeft: -8, display: "flex", alignItems: "center",
          justifyContent: "center", background: "none", border: "none", cursor: "pointer",
        }}>
          <ArrowLeft size={21} color={C.head} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: sub ? 16.5 : 20, fontWeight: sub ? 700 : 500, color: C.head, margin: 0, letterSpacing: "-0.3px" }}>{title}</h1>
        {sub && <p style={{ fontSize: 12, color: C.sub, margin: "1px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// Full-height screen with a fixed bar, a scrolling body and an optional footer.
// A route-level screen sits in the flow, below the phone's status bar. An
// overlay covers the whole frame, the same way the account sub-screens do.
export function Screen({ children, footer, style, overlay }) {
  return (
    <div style={{
      ...(overlay
        ? { position: "absolute", inset: 0, zIndex: typeof overlay === "number" ? overlay : 160 }
        // Positioned so overlays and drawers inside it cover the content area
        // and leave the phone's status bar alone.
        : { height: "100%", position: "relative" }),
      display: "flex", flexDirection: "column",
      background: C.white, ...style,
    }}>
      {children}
      {footer && (
        <div style={{
          flexShrink: 0, padding: `12px ${PAD}px calc(14px + env(safe-area-inset-bottom))`,
          borderTop: `1px solid ${C.div}`, background: C.white,
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// `scrollKey` is for stepped flows: change it and the body jumps back to the
// top, so step two does not open halfway down step one.
export function Body({ children, style, scrollKey }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [scrollKey]);
  return (
    <div ref={ref} style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", ...style }}>
      {children}
    </div>
  );
}

export function Primary({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
        background: disabled ? C.icon : C.p600, color: "#fff",
        fontSize: 15.5, fontWeight: 700, fontFamily: "inherit",
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 16px rgba(227,27,83,0.28)",
        transition: "background 0.15s", ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Secondary({ children, onClick, style, danger }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "13px 0", borderRadius: 12,
      border: `1px solid ${danger ? "#FDA29B" : C.div}`, background: C.white,
      color: danger ? "#D92D20" : C.head, fontSize: 15, fontWeight: 600,
      fontFamily: "inherit", cursor: "pointer", ...style,
    }}>
      {children}
    </button>
  );
}

// Step counter for the multi-step buy and create flows.
export function StepBar({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 5, padding: `10px ${PAD}px 0` }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < step ? C.p600 : C.div, transition: "background 0.25s",
        }} />
      ))}
    </div>
  );
}

export function StepTitle({ kicker, title, sub }) {
  return (
    <div style={{ padding: `18px ${PAD}px 14px` }}>
      {kicker && (
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
          color: C.p600, margin: "0 0 6px",
        }}>{kicker}</p>
      )}
      <h2 style={{ fontSize: 21, fontWeight: 700, color: C.head, margin: 0, letterSpacing: "-0.4px", lineHeight: "27px" }}>{title}</h2>
      {sub && <p style={{ fontSize: 13.5, color: C.sub, margin: "6px 0 0", lineHeight: "19px" }}>{sub}</p>}
    </div>
  );
}

export function Field({ label, hint, error, children, optional }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{label}</label>
        {optional && <span style={{ fontSize: 11.5, color: C.inact }}>Optional</span>}
      </div>
      {children}
      {error
        ? <p style={{ fontSize: 12, color: "#D92D20", margin: "6px 0 0" }}>{error}</p>
        : hint ? <p style={{ fontSize: 12, color: C.sub, margin: "6px 0 0", lineHeight: "17px" }}>{hint}</p> : null}
    </div>
  );
}

export const inputStyle = (error) => ({
  width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 11,
  border: `1px solid ${error ? "#FDA29B" : C.div}`, background: C.white,
  fontSize: 15, fontFamily: "inherit", color: C.head, outline: "none",
});

export function Input(props) {
  const { error, ...rest } = props;
  return <input {...rest} style={{ ...inputStyle(error), ...(props.style || {}) }} />;
}

export function Textarea(props) {
  const { error, ...rest } = props;
  return <textarea {...rest} rows={rest.rows || 3} style={{ ...inputStyle(error), resize: "none", lineHeight: "20px", ...(props.style || {}) }} />;
}

// A pill row of preset amounts plus a custom entry.
export function AmountTiles({ presets, value, onPick, format, cols = 2 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 9 }}>
      {presets.map(p => {
        const on = value === p;
        return (
          <button key={p} onClick={() => onPick(p)} style={{
            padding: "14px 0", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
            border: `1.5px solid ${on ? C.p600 : C.div}`,
            background: on ? C.p100 : C.white,
            color: on ? C.p900 : C.head, fontSize: cols > 2 ? 15 : 16, fontWeight: 700,
            transition: "all 0.15s",
          }}>
            {format ? format(p) : p}
          </button>
        );
      })}
    </div>
  );
}

export function Checkbox({ checked, onChange, children }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      display: "flex", alignItems: "flex-start", gap: 10, width: "100%",
      background: "none", border: "none", padding: 0, cursor: "pointer",
      fontFamily: "inherit", textAlign: "left",
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: checked ? C.p600 : C.white,
        border: `1.5px solid ${checked ? C.p600 : C.inact}`,
      }}>
        {checked && <Check size={14} color="#fff" strokeWidth={3} />}
      </span>
      <span style={{ fontSize: 13, color: C.sub, lineHeight: "19px", flex: 1 }}>{children}</span>
    </button>
  );
}

// Two mutually exclusive choices shown as full-width cards.
export function ChoiceCard({ selected, onClick, title, desc, badge }) {
  return (
    <button onClick={onClick} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer",
      padding: "14px 15px", borderRadius: 13, fontFamily: "inherit",
      border: `1.5px solid ${selected ? C.p600 : C.div}`,
      background: selected ? C.p100 : C.white, marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.head }}>{title}</span>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase",
            color: C.p600, background: C.white, border: `1px solid ${C.p300}`,
            padding: "2px 6px", borderRadius: 999,
          }}>{badge}</span>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>{desc}</p>
    </button>
  );
}

// ─── Bottom drawer ───
export function Sheet({ title, sub, onClose, children, footer }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 220); };
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={close} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
        animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out",
      }} />
      <div style={{
        position: "relative", background: C.white, borderRadius: "20px 20px 0 0",
        width: "100%", boxSizing: "border-box", maxHeight: "88%",
        display: "flex", flexDirection: "column",
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "18px 18px 10px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: 0, lineHeight: "22px" }}>{title}</p>
            {sub && <p style={{ fontSize: 12.5, color: C.sub, margin: "3px 0 0", lineHeight: "18px" }}>{sub}</p>}
          </div>
          <button onClick={close} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
            <XIcon size={20} color={C.sub} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "0 18px 4px" }}>{children}</div>
        {footer && (
          <div style={{ padding: "12px 18px calc(18px + env(safe-area-inset-bottom))", borderTop: `1px solid ${C.div}`, marginTop: 12 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Accordion, used for terms and FAQs ───
export function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, overflow: "hidden", background: C.white }}>
      {items.map(([q, a], i) => {
        const on = open === i;
        return (
          <div key={q} style={{ borderBottom: i < items.length - 1 ? `1px solid ${C.div}` : "none" }}>
            <button onClick={() => setOpen(on ? null : i)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 15px",
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.head, lineHeight: "19px" }}>{q}</span>
              <ChevronDown size={17} color={C.inact} style={{ flexShrink: 0, transform: on ? "rotate(180deg)" : "none", transition: "transform 0.18s" }} />
            </button>
            {on && (
              <p style={{ fontSize: 13, color: C.sub, margin: 0, padding: "0 15px 15px", lineHeight: "19px" }}>{a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// A tappable row that opens something else.
export function LinkRow({ icon: Icon, label, value, onClick, tint }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 15px",
      background: C.white, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      {Icon && (
        <span style={{
          width: 34, height: 34, borderRadius: 9, background: tint || C.p100,
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <Icon size={17} color={C.p600} />
        </span>
      )}
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: C.head }}>{label}</span>
      {value && <span style={{ fontSize: 13, color: C.sub }}>{value}</span>}
      <ChevronRight size={17} color={C.inact} />
    </button>
  );
}

export function SectionLabel({ children, style }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.7px", textTransform: "uppercase",
      color: C.sub, margin: `0 0 10px`, ...style,
    }}>{children}</p>
  );
}

// Small confirmation that slides up over the current screen.
export function Toast({ children, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 22, zIndex: 300,
      background: C.head, color: "#fff", borderRadius: 12, padding: "13px 16px",
      fontSize: 13.5, fontWeight: 600, textAlign: "center",
      animation: "toastSlideUp 0.25s ease-out", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    }}>
      {children}
    </div>
  );
}

// Centred fallback for a list with nothing in it yet.
export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 28px" }}>
      <span style={{
        width: 56, height: 56, borderRadius: "50%", background: C.p100,
        display: "grid", placeItems: "center", margin: "0 auto 14px",
      }}>
        <Icon size={25} color={C.p600} />
      </span>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "19px" }}>{desc}</p>
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

// The 6px grey bar the itinerary screen uses between sections. It separates
// white slabs without wrapping anything in a tinted card.
export function SectionBar({ margin = "20px 0" }) {
  return <div style={{ height: 6, background: C.bg, margin }} />;
}

// One detail with a copy button: a code, a PIN, a link. The value is set in a
// monospaced-feeling wide track so a long code can still be read back.
export function CopyRow({ label, value, mono = true, onCopied, last }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    try { navigator.clipboard?.writeText(value); } catch { /* noop */ }
    setDone(true);
    onCopied?.(label);
    setTimeout(() => setDone(false), 1600);
  };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
      borderTop: last === "first" ? "none" : `1px solid ${C.div}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
          color: C.sub, margin: 0,
        }}>{label}</p>
        <p style={{
          fontSize: 14, fontWeight: 600, color: C.head, margin: "3px 0 0",
          letterSpacing: mono ? "0.6px" : 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{value}</p>
      </div>
      <button onClick={copy} aria-label={`Copy ${label}`} style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "7px 11px",
        borderRadius: 9, border: `1px solid ${done ? C.sBorder : C.div}`,
        background: done ? C.sBg : C.white, cursor: "pointer", fontFamily: "inherit",
        fontSize: 12, fontWeight: 700, color: done ? C.sText : C.head,
      }}>
        {done ? <Check size={13} /> : <Copy size={13} />}
        {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// Sticky bar at the foot of a buying screen: what it costs on the left, the one
// pink action on the right. Lifted from the itinerary screen so the two match.
export function PayBar({ amount, caption, label, onClick, disabled }) {
  return (
    <div style={{
      flexShrink: 0, borderTop: `1px solid ${C.div}`,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)",
      padding: `10px ${PAD}px calc(12px + env(safe-area-inset-bottom))`,
      display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between",
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head, letterSpacing: "-0.4px" }}>{amount}</p>
        {caption && <p style={{ margin: 0, fontSize: 11, color: C.sub }}>{caption}</p>}
      </div>
      <button onClick={onClick} disabled={disabled} style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "13px 22px",
        borderRadius: 12, border: "none", cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit", fontSize: 14.5, fontWeight: 700,
        background: disabled ? C.div : C.p600, color: disabled ? C.inact : "#fff",
        boxShadow: disabled ? "none" : "0 4px 16px rgba(227,27,83,0.3)",
      }}>{label}</button>
    </div>
  );
}

// The quiet links strip at the foot of the gift screens, the way the reference
// apps close a page off: terms and FAQs, nothing shouted.
export function FooterLinks({ links }) {
  return (
    <div style={{
      background: C.bg, padding: "18px 16px 26px", display: "flex",
      alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "6px 0",
    }}>
      {links.map(([label, onClick], i) => (
        <span key={label} style={{ display: "inline-flex", alignItems: "center" }}>
          {i > 0 && <span style={{ color: C.icon, padding: "0 12px" }}>|</span>}
          <button onClick={onClick} style={{
            background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, fontWeight: 600, color: C.sub,
          }}>{label}</button>
        </span>
      ))}
    </div>
  );
}

// A fake payment step, so every flow ends the same way it would in the app.
export function usePayment() {
  const [paying, setPaying] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const pay = (onDone) => {
    setPaying(true);
    timer.current = setTimeout(() => { setPaying(false); onDone(); }, 1200);
  };
  return { paying, pay };
}
