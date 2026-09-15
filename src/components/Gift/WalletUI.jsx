import { C } from "../../data";

// Pieces lifted from the live Flutter wallet (lib/features/user_wallet) so the
// prototype reads as the same screen: the dotted balance card, the orange hook
// tag hanging off its side, the stamp mark, and the settings tile the ways to
// earn rows are built from.

// The wallet screen uses Material greys, greens and reds that the rest of the
// prototype has no token for, so they sit here rather than in the shared set.
export const W = {
  grey50: "#FAFAFA", grey100: "#F5F5F5", grey200: "#EEEEEE",
  grey300: "#E0E0E0", grey600: "#757575",
  green: "#4CAF50", green50: "#E8F5E9", green200: "#A5D6A7", green600: "#43A047",
  red: "#F44336", red50: "#FFEBEE", red200: "#EF9A9A", red600: "#E53935",
  orange200: "#FFCC80", hookLine: "#FDA201", hookDot: "#FFAE4D", hookGlow: "#FFD983",
};

export const LIGHT_SHADOW = "0 4px 4px -2px rgba(0,0,0,0.06)";

// Text roles straight from the app's theme, so sizes match rather than drift.
export const T = {
  headlineMedium: { fontSize: 28, fontWeight: 500, color: C.head, margin: 0, letterSpacing: "-0.5px" },
  titleMedium600: { fontSize: 18, fontWeight: 600, color: C.head, margin: 0 },
  titleMedium: { fontSize: 16, fontWeight: 500, color: C.head, margin: 0 },
  labelLarge: { fontSize: 14, fontWeight: 500, color: C.head, margin: 0 },
  bodyMedium: { fontSize: 14, fontWeight: 400, color: C.head, margin: 0 },
  bodySmall: { fontSize: 12, fontWeight: 400, color: C.head, margin: 0 },
};

// The app paints every screen on a soft wash that fades into grey.
export const APP_BG = {
  backgroundColor: W.grey100,
  backgroundImage: "url(/background-gradient.png)",
  backgroundSize: "100% auto",
  backgroundRepeat: "no-repeat",
};

export function StampIcon({ size = 24, style }) {
  return <img src="/icons/stamp-icon.svg" alt="" width={size} height={size} style={{ display: "block", flexShrink: 0, ...style }} />;
}

// White card, 8px of padding, and a dashed 6/6 rule sitting just inside it.
// CSS dashes are not adjustable, so the rule is drawn as an SVG rect.
export function DottedCard({ children, style, dashColor = W.grey300 }) {
  return (
    <div style={{
      position: "relative", background: C.white, padding: 8,
      borderRadius: 16, boxShadow: LIGHT_SHADOW, ...style,
    }}>
      <div style={{ position: "relative" }}>
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)"
            rx="12" ry="12" fill="none" stroke={dashColor} strokeWidth="1" strokeDasharray="6 6" />
        </svg>
        {children}
      </div>
    </div>
  );
}

// The tag that hangs off the right edge of the balance card, like the stub of
// a ticket. Dashed on three sides only, open towards the card.
export function WalletHookTag({ top = 44 }) {
  // Fixed geometry: 60 wide, a 20px dot inside 8px of padding, so 36 tall.
  const w = 56, h = 36, r = 8;
  return (
    <div style={{
      position: "absolute", top, right: 0, width: 60, boxSizing: "border-box",
      padding: "4px 0 4px 4px", background: W.orange200,
      borderRadius: "12px 0 0 12px", pointerEvents: "none",
    }}>
      <div style={{ position: "relative", width: w, height: h }}>
        <svg aria-hidden="true" width={w} height={h} style={{ position: "absolute", inset: 0 }}>
          <path
            d={`M ${w} 0.5 L ${r} 0.5 A ${r} ${r} 0 0 0 0.5 ${r} L 0.5 ${h - r} A ${r} ${r} 0 0 0 ${r} ${h - 0.5} L ${w} ${h - 0.5}`}
            fill="none" stroke={W.hookLine} strokeWidth="1" strokeDasharray="6 6"
          />
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 20, height: 20, borderRadius: "50%", background: W.hookDot,
          boxShadow: `0 0 2px 2px ${W.hookGlow}`,
        }} />
      </div>
    </div>
  );
}

// The 40px rounded square every settings row leads with.
export function TileIcon({ icon: Icon, tint = C.p100, color = C.head, size = 40, iconSize = 18 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: 12, background: tint, flexShrink: 0,
      display: "grid", placeItems: "center",
    }}>
      <Icon size={iconSize} color={color} />
    </span>
  );
}

// The app's settings row: leading icon, title, description underneath.
export function SettingsTile({ leading, title, description, trailing, onClick, style }) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 16, padding: 12,
        background: C.white, border: `1px solid ${W.grey200}`, borderRadius: 12,
        cursor: onClick ? "pointer" : "default", ...style,
      }}
    >
      {leading}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {title}
        {description}
      </div>
      {trailing}
    </div>
  );
}

// Read-only explanation. One card, hairline rules, small plain icons and no
// chevrons, so it never reads as a list of things you can tap.
export function InfoList({ items }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${W.grey200}`, borderRadius: 12, overflow: "hidden",
    }}>
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={it.title} style={{
            display: "flex", gap: 12, padding: "12px 14px",
            borderTop: i ? `1px solid ${W.grey200}` : "none",
          }}>
            <Icon size={17} color={C.p600} strokeWidth={1.9} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: C.head, margin: 0 }}>{it.title}</p>
              <p style={{ fontSize: 13, color: W.grey600, margin: "2px 0 0", lineHeight: "18px" }}>{it.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Grouped rows share one rounded shell with hairlines between them.
export function SettingsSection({ children, style }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  return (
    <div style={{
      background: C.white, border: `1px solid ${W.grey200}`, borderRadius: 12,
      overflow: "hidden", boxShadow: LIGHT_SHADOW, ...style,
    }}>
      {items.map((child, i) => (
        <div key={i} style={{ borderTop: i ? `1px solid ${W.grey200}` : "none" }}>{child}</div>
      ))}
    </div>
  );
}

export function Divider({ style }) {
  return <div style={{ height: 1, background: W.grey300, ...style }} />;
}

// The tab switch at the top of the wallet.
export function Segmented({ value, onChange, options }) {
  return (
    <div style={{
      display: "flex", background: C.white, borderRadius: 12, padding: 4,
      border: `1px solid ${W.grey200}`, boxShadow: LIGHT_SHADOW,
    }}>
      {options.map(([id, label]) => {
        const on = value === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 14, fontWeight: on ? 600 : 500,
            background: on ? C.p100 : "transparent",
            color: on ? C.p900 : W.grey600, transition: "background 0.15s",
          }}>{label}</button>
        );
      })}
    </div>
  );
}
