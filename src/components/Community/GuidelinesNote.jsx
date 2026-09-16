import { useEffect } from "react";
import { ShieldCheck, X as XIcon, Check } from "lucide-react";
import { CC } from "./tokens";
import { GUIDELINES } from "../../data/communityData";

// The rules, once, before anything else on the screen. A room full of
// strangers works or fails on whether people know what it is for, and nobody
// taps a link in a header to find that out.
//
// It closes for good, and closing it says where the rules went. A thing that
// vanishes without telling you where it lives is a thing you cannot get back.

export function GuidelinesNote({ onReadMore, onClose }) {
  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{
        borderRadius: 16, background: CC.bubbleMid,
        border: `1px solid ${CC.goldLine}`, padding: "14px 15px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={16} color={CC.goldInk} />
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
            Community guidelines
          </span>
          <button onClick={onClose} aria-label="Close guidelines" style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0, border: "none",
            background: "rgba(255,255,255,0.7)", cursor: "pointer",
            display: "grid", placeItems: "center",
          }}><XIcon size={14} color={CC.body} /></button>
        </div>

        {/* Four, not five. The fifth is on the screen behind Read more, and a
            list somebody has to scroll is a list nobody reads. */}
        <ul style={{ listStyle: "none", margin: "11px 0 0", padding: 0 }}>
          {GUIDELINES.slice(0, 4).map(([title]) => (
            <li key={title} style={{
              display: "flex", alignItems: "flex-start", gap: 8, marginTop: 7,
            }}>
              <Check size={13} color={CC.gold} style={{ flexShrink: 0, marginTop: 3 }} />
              <span style={{ fontSize: 13.5, color: CC.ink, lineHeight: "19px" }}>{title}</span>
            </li>
          ))}
        </ul>

        <button onClick={onReadMore} style={{
          marginTop: 12, minHeight: 40, padding: 0, border: "none", background: "none",
          cursor: "pointer", fontFamily: "inherit",
          fontSize: 13.5, fontWeight: 700, color: CC.goldInk,
          textDecoration: "underline", textUnderlineOffset: 3,
        }}>Read more</button>
      </div>
    </div>
  );
}

// Fired once, the moment the note is closed. It points at where the rules
// went and then gets out of the way on its own.
export function GuidelinesPointer({ onDone, after = 5000 }) {
  useEffect(() => {
    const t = setTimeout(onDone, after);
    return () => clearTimeout(t);
  }, [onDone, after]);

  return (
    <button
      onClick={onDone}
      style={{
        position: "absolute", top: 78, right: 14, zIndex: 120,
        maxWidth: 232, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
        border: "none", background: "none", padding: 0,
        animation: "toastSlideUp 0.22s ease-out",
      }}
    >
      {/* The caret sits under the link it is pointing at. */}
      <span style={{
        position: "absolute", top: -6, right: 26, width: 12, height: 12,
        background: CC.ink, transform: "rotate(45deg)", borderRadius: 2,
      }} />
      {/* The caret above is already pointing. An arrow inside the bubble
          pointed at nothing and said the same thing twice. */}
      <span style={{
        position: "relative", display: "block",
        background: CC.ink, borderRadius: 12, padding: "11px 13px",
        boxShadow: "0 10px 26px rgba(37,67,66,0.26)",
        fontSize: 12.5, color: "#fff", lineHeight: "18px",
      }}>
        The guidelines live here whenever you want them.
      </span>
    </button>
  );
}
