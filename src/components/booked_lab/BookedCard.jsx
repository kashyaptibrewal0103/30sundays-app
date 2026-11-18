import { Link } from "react-router-dom";
import { User, Baby } from "lucide-react";
import { C } from "../../data";

// ─── One booked trip ───
//
// Photo on top, facts underneath, the shape of a package card a couple has
// already seen a hundred times. Everything a glance needs is on it and
// nothing else: who booked it and when, who they went as, how long, where,
// through what, what it cost, and what kind of week it was.
//
// The pace sits beside the price rather than on a line of its own, because
// "Relaxed" and "₹62,498" are the two things people compare cards on.
//
// Who booked it, and when, is the thing that makes the card proof rather than
// an advert, so it sits on the photograph with a live dot beside it instead of
// opening the block of facts in grey. That frees the first line under the
// photo for the trip itself, with the party count beside it.

export const TAG = {
  Relaxed: { bg: "#EAF2FE", fg: "#175CD3" },
  Explorer: { bg: "#FFF4E0", fg: "#B54708" },
  Offbeat: { bg: "#E5F6F5", fg: "#007E72" },
};

// Each stop carries its own nights, so the route says how the week was split
// and not just where it went. The cities it has no room for are counted in
// words, because a bare "+2" reads like two of something unnamed.
export function Route({ legs, max = 2, size = 11.5 }) {
  const shown = legs.slice(0, max);
  const rest = legs.length - shown.length;
  return (
    <span style={{
      display: "block", fontSize: size, color: C.sub, lineHeight: "16px",
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    }}>
      {shown.map((l, i) => (
        <span key={l.city ?? l}>
          {i > 0 && <span style={{ opacity: 0.45, margin: "0 4px" }}>→</span>}
          {l.city ?? l}
          {l.n ? <span style={{ fontWeight: 600, color: C.head, opacity: 0.75 }}> {l.n}N</span> : null}
        </span>
      ))}
      {rest > 0 && (
        <span style={{ opacity: 0.7 }}> +{rest} {rest === 1 ? "city" : "cities"}</span>
      )}
    </span>
  );
}

// On a destination page the route leads: up to three stops with their nights,
// then the rest counted, on two lines so every card in a rail is the same
// height. Under it, one line: the price, and across from it the total nights.
// No pace tag and no divider, so the card is shorter.
function DestRoute({ legs = [] }) {
  const shown = legs.slice(0, 3);
  const rest = legs.length - shown.length;
  return (
    <div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: "19px", height: 38, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", letterSpacing: "-0.2px" }}>
        {shown.map((l, i) => (
          <span key={l.city}>
            {i > 0 && <span style={{ color: C.inact, fontWeight: 500, margin: "0 4px" }}>→</span>}
            {l.city}<span style={{ fontWeight: 500, color: C.sub }}> {l.n}N</span>
          </span>
        ))}
        {rest > 0 && <span style={{ fontWeight: 500, color: C.sub }}> +{rest} {rest === 1 ? "city" : "cities"}</span>}
      </p>
    </div>
  );
}
function DestFoot({ price, nights }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: C.ink, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
        ₹{price} <span style={{ fontSize: 10, fontWeight: 600, color: C.inact, letterSpacing: 0 }}>per person</span>
      </p>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sub, whiteSpace: "nowrap" }}>{nights} nights</span>
    </div>
  );
}

// On a destination page the country is already the page, so the card leads
// with the length of the trip and drops who went.
export default function BookedCard({ t, wide = false, inDest = false }) {
  const tone = TAG[t.style] || TAG.Relaxed;
  // Who went, as a count rather than a label. "Couple" and "Family" both took
  // a line to say something the numbers say better, and children only show up
  // when there are any.
  const kids = t.kids || 0;
  const adults = t.adults || Math.max(1, (t.travellers || 2) - kids);

  return (
    <Link to={t.target} style={{
      flexShrink: 0, width: wide ? "100%" : 254, textDecoration: "none",
      borderRadius: 16, overflow: "hidden", background: C.white,
      border: `1px solid ${C.div}`, boxShadow: "0 3px 14px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "relative" }}>
        <img src={t.img} alt={t.dest} style={{ width: "100%", height: inDest ? (wide ? 140 : 124) : wide ? 150 : 138, objectFit: "cover", display: "block" }} />
        <span style={{
          position: "absolute", left: 11, bottom: 10, maxWidth: "calc(100% - 22px)",
          display: "inline-flex", alignItems: "center", gap: 7,
          // No backdrop blur. The pill sits inside a rounded card that already
          // clips its contents, and a blurred backdrop inside a clipping box
          // composites badly: the rounding and the text drop out of it.
          background: "rgba(17,17,17,0.66)",
          borderRadius: 999, padding: "6px 12px 6px 9px",
          fontSize: 11.5, color: "rgba(255,255,255,0.86)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: "#34D399", flexShrink: 0 }} />
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
            <strong style={{ fontWeight: 800, color: "#fff" }}>{t.who}</strong> booked {t.when}
          </span>
        </span>
      </div>

      <div style={{ padding: inDest ? "10px 12px 12px" : "11px 13px 13px" }}>
        {inDest && <><DestRoute legs={t.legs} /><DestFoot price={t.price} nights={t.nights} /></>}
        {!inDest && <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <p style={{ margin: 0, minWidth: 0, fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {t.dest} ({t.nights}N)
          </p>
          {!inDest && <span style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999, border: `1px solid ${C.div}`,
            fontSize: 11.5, fontWeight: 700, color: C.sub, whiteSpace: "nowrap",
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              {adults}<User size={12} />
            </span>
            {kids > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                {kids}<Baby size={12} />
              </span>
            )}
          </span>}
        </div>}

        {!inDest && <div style={{ marginTop: 4 }}><Route legs={t.legs} /></div>}

        {!inDest && <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          marginTop: 11, paddingTop: 11, borderTop: `1px solid ${C.div}`,
        }}>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: C.ink, letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
            ₹{t.price} <span style={{ fontSize: 10, fontWeight: 600, color: C.inact, letterSpacing: 0 }}>per person</span>
          </p>
          <span style={{
            flexShrink: 0, padding: "4px 10px", borderRadius: 999,
            background: tone.bg, color: tone.fg, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
          }}>{t.style}</span>
        </div>}
      </div>
    </Link>
  );
}
