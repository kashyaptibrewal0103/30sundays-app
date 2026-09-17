import { Layers } from "lucide-react";
import { C } from "../data";

// ─── Why Save is safe ───
//
// The bar used to say "Not saved yet, your consultant can't see this", which
// names a cost and no benefit. The feedback was that people were not hesitating
// over the trip, they were afraid of losing the itinerary they already had:
// they read Save as "replace".
//
// It does not replace. It adds. That sentence goes directly above the button,
// followed by the two things saving actually gives you.

export default function SaveVersionNote({ hasPrevious }) {
  return (
    <div data-testid="save-version-note" style={{
      display: "flex", gap: 9, alignItems: "flex-start",
      padding: "11px 16px 12px", borderTop: `1px solid ${C.div}`,
      // Opaque on purpose: this sits over a scrolling list, and a tint with
      // alpha lets the day cards run straight through the words.
      background: "#FFF4F6",
    }}>
      <Layers size={13} color={C.p600} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, fontSize: 12, color: C.head, lineHeight: "17px" }}>
        {hasPrevious ? (
          <>
            <b style={{ fontWeight: 700 }}>Saving creates a new version.</b>{" "}
            <span style={{ color: C.sub }}>
              Your older version stays saved, nothing is replaced. You get the PDF, and your consultant can see it.
            </span>
          </>
        ) : (
          // Nothing saved yet, so there is no older version to protect. Saying
          // there is would be a promise about something that does not exist.
          <>
            <b style={{ fontWeight: 700 }}>Saving creates your itinerary.</b>{" "}
            <span style={{ color: C.sub }}>
              You get the PDF, and your consultant can see it. You can still change it afterwards.
            </span>
          </>
        )}
      </p>
    </div>
  );
}
