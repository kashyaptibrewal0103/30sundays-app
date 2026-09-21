import { useState } from "react";
import { Layers, X as XIcon } from "lucide-react";
import { C } from "../data";

// ─── Why Save is safe ───
//
// The bar used to say "Not saved yet, your consultant can't see this", which
// names a cost and no benefit. The feedback was that people were not hesitating
// over the trip, they were afraid of losing the itinerary they already had:
// they read Save as "replace".
//
// It does not replace. It adds. One line says so, directly above the button.
//
// And it is dismissible: this sits between the day list and Save Itinerary, so
// once it has been read it is in the way.
//
// Closing it is remembered against THIS set of unsaved changes only. Make a new
// change later and the note is back, because by then it is answering a question
// about a different save. A permanent dismissal would silence the one line that
// tells a returning customer their old itinerary is safe.

const KEY = (scope) => `30s_save_note_dismissed_${scope || "default"}`;
// Written by an earlier build that dismissed the note for good.
const LEGACY_KEY = "30s_save_note_dismissed";

export default function SaveVersionNote({ hasPrevious, scope }) {
  const [gone, setGone] = useState(() => {
    try {
      localStorage.removeItem(LEGACY_KEY);
      return localStorage.getItem(KEY(scope)) === "1";
    } catch { return false; }
  });
  if (gone) return null;

  const close = () => {
    try { localStorage.setItem(KEY(scope), "1"); } catch { /* private mode */ }
    setGone(true);
  };

  return (
    <div data-testid="save-version-note" style={{
      display: "flex", gap: 9, alignItems: "flex-start",
      padding: "10px 12px 11px 16px", borderTop: `1px solid ${C.div}`,
      // Opaque on purpose: this sits over a scrolling list, and a tint with
      // alpha lets the day cards run straight through the words.
      background: "#FFF4F6",
    }}>
      <Layers size={13} color={C.p600} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 12, color: C.head, lineHeight: "17px" }}>
        {hasPrevious ? (
          <>
            <b style={{ fontWeight: 700 }}>Saving creates a new version.</b>{" "}
            <span style={{ color: C.sub }}>Your old itinerary stays saved.</span>
          </>
        ) : (
          // Nothing saved yet, so there is no older version to protect. Saying
          // there is would be a promise about something that does not exist.
          <>
            <b style={{ fontWeight: 700 }}>Saving creates your itinerary.</b>{" "}
            <span style={{ color: C.sub }}>You can still edit it later.</span>
          </>
        )}
      </p>
      <button
        data-testid="dismiss-save-note"
        onClick={close}
        aria-label="Dismiss"
        style={{
          flexShrink: 0, width: 22, height: 22, marginTop: -1, borderRadius: "50%",
          border: "none", background: "none", display: "grid", placeItems: "center", cursor: "pointer",
        }}
      >
        <XIcon size={14} color={C.sub} />
      </button>
    </div>
  );
}
