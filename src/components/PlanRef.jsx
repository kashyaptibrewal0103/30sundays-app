import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { C } from "../data";

// ─── The number a traveller reads out on the phone ───
//
// A consultant searching by mobile number finds several enquiries and a stack
// of itineraries against one customer, more than one of them for the same
// country. "The Bali one" does not narrow it down.
//
// So every past itinerary carries its own number. Nothing else is needed on the
// card: the country and the version are already written above it.

export default function PlanRef({ id, label = "Plan ID" }) {
  const [copied, setCopied] = useState(false);

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(String(id)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      data-testid="plan-ref"
      onClick={copy}
      style={{
        display: "flex", alignItems: "center", gap: 7, padding: "8px 12px",
        borderTop: `1px solid ${C.bg}`, cursor: "pointer", background: C.bg + "55",
      }}
    >
      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inact, letterSpacing: "0.3px", textTransform: "uppercase", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: C.head, letterSpacing: "0.4px", fontVariantNumeric: "tabular-nums" }}>
        {id}
      </span>
      {copied
        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#027A48", flexShrink: 0 }}><Check size={12} /> Copied</span>
        : <Copy size={13} color={C.sub} style={{ flexShrink: 0 }} />}
    </div>
  );
}
