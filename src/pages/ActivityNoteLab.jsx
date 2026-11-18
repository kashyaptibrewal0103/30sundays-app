import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { C } from "../data";

// ─── Ways to say a pick did not fit ───
//
// Each one opens on a real itinerary (Bays & Boulevards, Vietnam), above
// Itinerary at a glance where it would ship. Every stacked version opens two
// ways: with 2 picks left out, and with 5, so "N more" shows on both lists.

const TRIP = 10;

const STACKED = [
  { key: "stack", name: "Included, then not included", note: "Ticks on top, crosses below, the reason under each cross. The plainest. The thing the title is about sits second." },
  { key: "stackOut", name: "Not included first", note: "The same lists, the other way up, so the title and its list sit together. What made it comes second, which is fine: the days below show it anyway." },
  { key: "stackChips", name: "Chips", note: "Both lists as green and gold chips. The most compact. No room for the reason on each one, so it lives in the line under the title." },
  { key: "stackPhotos", name: "With photos", note: "Every row carries the photo from the activities step. Easiest to recognise. The tallest." },
  { key: "stackCity", name: "By city", note: "One block per city, in and out together, the reason beside the city. Explains why best. Splits the count across blocks." },
];

const EARLIER = [
  { key: "line", name: "One line", note: "The hotel sold-out note's own pattern." },
  { key: "list", name: "List with photos", note: "Left-out picks only, with photo and reason." },
  { key: "tally", name: "Tally", note: "\"9 of 11 picks are in\", as dots." },
  { key: "ledger", name: "In and out, side by side", note: "The one these stacked versions came from." },
  { key: "fix", name: "Add a night", note: "The reason as an action." },
];

export default function ActivityNoteLab() {
  const navigate = useNavigate();
  const go = (key, drop) => navigate(`/itinerary/${TRIP}?actnote=${key}${drop ? `&actdrop=${drop}` : ""}`);

  return (
    <div style={{ height: "100%", background: C.white, overflowY: "auto" }} className="hide-scrollbar">
      <div style={{ background: "#FBFAF9", borderBottom: `1px solid ${C.div}`, padding: "12px 14px 12px", display: "flex", alignItems: "center", gap: 9 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
          <ArrowLeft size={19} color={C.head} />
        </button>
        <div>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>Activities not included</p>
          <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Each opens on a real itinerary</p>
        </div>
      </div>

      <div style={{ padding: "6px 16px 8px" }}>
        <p style={{ margin: "12px 0 2px", fontSize: 15, fontWeight: 800, color: C.head }}>Stacked</p>
        {STACKED.map((o, i) => (
          <div key={o.key} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.div}` }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: C.p100, color: C.p600, fontSize: 13, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: C.head }}>{o.name}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12, lineHeight: "17px", color: C.sub }}>{o.note}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
                {[2, 5].map((d) => (
                  <button
                    key={d}
                    data-testid={`note-opt-${o.key}-${d}`}
                    onClick={() => go(o.key, d)}
                    style={{
                      padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.div}`, background: C.white,
                      fontSize: 12, fontWeight: 700, color: C.head, cursor: "pointer", fontFamily: "inherit",
                      display: "inline-flex", alignItems: "center", gap: 2,
                    }}
                  >
                    {d} left out <ChevronRight size={13} color={C.inact} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        <p style={{ margin: "22px 0 2px", fontSize: 15, fontWeight: 800, color: C.head }}>Earlier</p>
        {EARLIER.map((o) => (
          <button
            key={o.key}
            data-testid={`note-opt-${o.key}`}
            onClick={() => go(o.key)}
            style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
              background: "none", border: "none", borderBottom: `1px solid ${C.div}`,
              padding: "12px 0", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.head }}>{o.name}</span>
              <span style={{ display: "block", marginTop: 2, fontSize: 12, color: C.sub }}>{o.note}</span>
            </span>
            <ChevronRight size={17} color={C.inact} />
          </button>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
