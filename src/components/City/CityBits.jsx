// Small shared pieces for the City Detail screen. Kept here so every block
// looks the same without each one re-declaring the spacing.

const PAD = 16;

// Section heading, with an optional quiet note on the right. The note is where
// a caveat goes ("Climate averages, not a forecast"), so it is never a link.
export function CitySection({ t, title, note, sub, inset = true, children }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, lineHeight: "26px", fontWeight: 700, letterSpacing: "-0.4px", color: t.head }}>{title}</h2>
          {note && <span style={{ fontSize: 12, color: t.muted, fontWeight: 500, flexShrink: 0, textAlign: "right" }}>{note}</span>}
        </div>
        {sub && <span style={{ fontSize: 13, color: t.muted, fontWeight: 500 }}>{sub}</span>}
      </div>
      <div style={inset ? { padding: `0 ${PAD}px` } : undefined}>{children}</div>
    </section>
  );
}

export const cardStyle = (t) => ({
  background: t.card, border: `1px solid ${t.line}`, borderRadius: 16,
});

export { PAD };
