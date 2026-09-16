import { useState } from "react";
import { Flag, ShieldCheck } from "lucide-react";
import { CC } from "./tokens";
import { REPORT_REASONS } from "../../data/communityData";
import { Sheet, Primary, Secondary, Field, Textarea } from "../Gift/GiftUI";

// Reporting, in two steps and no more. Pick why, then it is gone from your
// feed and with our team.
//
// It is deliberately one way. A report you can take back is a report nobody
// acts on, and the person who filed it should not have to manage it after.

export function ReportSheet({ what = "post", onClose, onSend }) {
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const ready = reason && (reason !== "other" || note.trim().length > 3);

  return (
    <Sheet
      title={`Report this ${what}`}
      sub="Our team reads every report, usually the same day."
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={() => onSend(reason, note.trim())} disabled={!ready}>
            Send report
          </Primary>
          <Secondary onClick={onClose}>Cancel</Secondary>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REPORT_REASONS.map(([id, label, help]) => {
          const on = reason === id;
          return (
            <button key={id} onClick={() => setReason(id)} style={{
              display: "flex", alignItems: "flex-start", gap: 11, width: "100%",
              textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              padding: "13px 14px", borderRadius: 12, background: CC.white,
              border: `1px solid ${on ? CC.ink : CC.line}`,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                border: `2px solid ${on ? CC.ink : CC.line}`,
                display: "grid", placeItems: "center",
              }}>
                {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: CC.ink }} />}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
                  {label}
                </span>
                <span style={{ display: "block", fontSize: 12.5, color: CC.body, marginTop: 2, lineHeight: "18px" }}>
                  {help}
                </span>
              </span>
            </button>
          );
        })}

        {reason === "other" && (
          <Field label="What is wrong with it">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={300}
              placeholder="A sentence is plenty." />
          </Field>
        )}

        <p style={{ fontSize: 12.5, color: CC.soft, margin: "2px 2px 0", lineHeight: "18px" }}>
          The person who wrote it is not told who reported it. Nothing about
          your trip changes.
        </p>
      </div>
    </Sheet>
  );
}

// What a reported post becomes in the reader's own feed. It is not deleted for
// anybody else, so this says what actually happened rather than pretending.
export function ReportedNote({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      border: `1px dashed ${CC.line}`, borderRadius: 14, background: CC.well,
      padding: "14px 15px",
    }}>
      <Flag size={15} color={CC.soft} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: CC.ink, margin: 0 }}>
          You reported this
        </p>
        <p style={{ fontSize: 13, color: CC.body, margin: "3px 0 0", lineHeight: "19px" }}>
          It is hidden for you while our team looks at it.
        </p>
        {children}
      </div>
    </div>
  );
}

export function ReportSent({ onClose }) {
  return (
    <Sheet
      title="Thank you"
      onClose={onClose}
      footer={<Primary onClick={onClose}>Done</Primary>}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, background: CC.tealTint, flexShrink: 0,
          display: "grid", placeItems: "center",
        }}><ShieldCheck size={19} color={CC.teal} /></span>
        <p style={{ flex: 1, fontSize: 14, color: CC.ink, margin: 0, lineHeight: "21px" }}>
          It is with our team and hidden from your feed. If it breaks the
          guidelines it comes down for everybody, usually the same day.
        </p>
      </div>
    </Sheet>
  );
}
