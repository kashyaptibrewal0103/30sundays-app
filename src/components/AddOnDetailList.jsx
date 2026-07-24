import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { C } from "../data";

// A list of add-ons where each title is a collapsed row; tapping expands a
// 3-4 line description. Everything starts collapsed. `items` is
// [{ title, description }].
export default function AddOnDetailList({ items }) {
  const [open, setOpen] = useState({});
  if (!items || items.length === 0) return null;
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = !!open[i];
        return (
          <div key={i} style={{ borderTop: i > 0 ? "1px solid #E9EAEB" : "none" }}>
            <button
              onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "13px 0", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
            >
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#181E4C", lineHeight: "20px" }}>{it.title}</span>
              {isOpen ? <ChevronUp size={18} color="#666C99" style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="#666C99" style={{ flexShrink: 0 }} />}
            </button>
            {isOpen && (
              <p style={{ margin: "0 0 14px", fontSize: 13, color: C.sub, lineHeight: "20px" }}>{it.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
