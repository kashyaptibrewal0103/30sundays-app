import { useState } from "react";
import { IdCard, ShieldCheck, Banknote, ChevronDown, ChevronUp, FileText, ExternalLink } from "lucide-react";
import { C } from "../data";

// The add-ons a customer bought, as accordion rows. Collapsed by default; tap a
// row to read its description.
//
// All we hold per add-on is a title and a description, plus the documents that
// belong to it. Every row is bought by definition, so rows carry no tag at all.
// Add-ons that were not bought are not listed, so this never reads as an upsell.
//
// Two variants:
//   plain - title and description only.
//   docs  - the same, with the add-on's documents listed under the description.
//
// The richer version (state menu, forex upsell) still lives in AddOnsSection and
// VisaSection for when the data behind it exists.

// Visa first, then insurance. Forex has no bought flag in the data, so it never
// shows; it was only ever a promotion.
const KINDS = [
  { key: "visa", Icon: IdCard },
  { key: "insurance", Icon: ShieldCheck },
  { key: "forex", Icon: Banknote },
];

// The documents tagged to each add-on. Same rules as the Trip Documents screen,
// so the two never disagree: one e-Visa per traveller, one insurance policy that
// covers everybody.
function documentsFor(key, addOn, travelers) {
  const ready = Boolean(addOn?.documentUrl);
  if (key === "visa") {
    return travelers.map((t, i) => ({
      id: `visa-${i}`, label: t.name, meta: "e-Visa document", url: addOn.documentUrl, ready,
    }));
  }
  if (key === "insurance") {
    return [{
      id: "insurance", label: "Travel insurance policy",
      meta: travelers.map((t) => t.name).join(", "), url: addOn.documentUrl, ready,
    }];
  }
  return [];
}

// One document. A ready one opens; one still being issued says so instead of
// pretending to be a link.
function DocRow({ doc }) {
  const tile = (
    <span style={{
      width: 36, height: 36, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center",
      background: doc.ready ? C.p100 : C.white,
    }}>
      <FileText size={18} color={doc.ready ? C.p600 : C.inact} />
    </span>
  );
  const text = (
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: C.head, lineHeight: "19px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.label}</span>
      <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 2, lineHeight: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {doc.ready ? doc.meta : "Available soon, we'll notify you."}
      </span>
    </span>
  );
  const box = { display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12 };

  if (!doc.ready) {
    return <div style={{ ...box, background: C.bg }}>{tile}{text}</div>;
  }
  return (
    <a href={doc.url || "#"} target="_blank" rel="noreferrer" style={{ ...box, background: C.white, border: `1px solid ${C.div}`, textDecoration: "none" }}>
      {tile}{text}
      <ExternalLink size={16} color={C.sub} style={{ flexShrink: 0 }} />
    </a>
  );
}

function Row({ item, open, onToggle, showDivider, withDocs }) {
  const { Icon } = item;
  return (
    <div style={{ borderTop: showDivider ? "1px solid #E9EAEB" : "none" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "16px 0",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <span style={{ width: 44, height: 44, borderRadius: 12, background: "#FFE6ED", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={22} color="#FD014F" strokeWidth={1.8} />
        </span>
        <span style={{ flex: 1, minWidth: 0, marginLeft: 2 }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#181E4C", lineHeight: "20px" }}>{item.title}</span>
        </span>
        {open ? <ChevronUp size={20} color="#666C99" style={{ flexShrink: 0 }} /> : <ChevronDown size={20} color="#666C99" style={{ flexShrink: 0 }} />}
      </button>

      {open && (
        <div style={{ padding: "0 0 18px 56px" }}>
          {item.description && (
            <p style={{ margin: 0, fontSize: 13.5, color: "#535862", lineHeight: "20px" }}>{item.description}</p>
          )}
          {withDocs && item.docs.length > 0 && (
            <>
              <p style={{ margin: item.description ? "14px 0 8px" : "0 0 8px", fontSize: 13, fontWeight: 700, color: C.head }}>
                {item.docs.length === 1 ? "Document" : "Documents"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {item.docs.map((d) => <DocRow key={d.id} doc={d} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function TripAddOns({ addOns, travelers = [], variant = "plain", divider = null }) {
  const [openKey, setOpenKey] = useState(null);
  const withDocs = variant === "docs";

  const items = KINDS
    .map((k) => ({ ...k, ...addOns?.[k.key], docs: documentsFor(k.key, addOns?.[k.key], travelers) }))
    .filter((a) => a.purchased && a.title);

  // Nothing bought, no section and no divider. An empty heading reads as
  // broken, not unused.
  if (!items.length) return null;

  return (
    <>
      {divider}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181E4C", margin: "0 0 4px" }}>Add Ons</h4>
        <div>
          {items.map((item, i) => (
            <Row
              key={item.key}
              item={item}
              withDocs={withDocs}
              open={openKey === item.key}
              onToggle={() => setOpenKey((k) => (k === item.key ? null : item.key))}
              showDivider={i > 0}
            />
          ))}
        </div>
      </div>
    </>
  );
}
