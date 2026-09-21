import { FileText, Pencil } from "lucide-react";
import { C } from "../data";

// ─── What the button actually does ───
//
// People stall on the last step of the wizard because nothing tells them what
// happens when they tap. The feedback was consistent on two points: they did
// not know they would get a real itinerary out of it, and they did not know
// they could still change it afterwards.
//
// So both are said in plain words, directly above the button, where the
// hesitation happens. Six words a line, because this is read in the second
// before a tap, not studied.

const POINTS = [
  { icon: FileText, text: "A day-by-day plan, yours as a PDF" },
  { icon: Pencil, text: "Nothing is final. Change it anytime" },
];

export default function NextStepNote() {
  return (
    <div data-testid="next-step-note" style={{
      padding: "11px 16px 12px",
      background: C.p100 + "66",
      borderBottom: `1px solid ${C.div}`,
    }}>
      <p style={{ margin: "0 0 7px", fontSize: 12.5, fontWeight: 700, color: C.head }}>
        Next: your itinerary
      </p>
      {POINTS.map(({ icon: Icon, text }) => (
        <div key={text} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 4 }}>
          <Icon size={12} color={C.p600} style={{ flexShrink: 0, marginTop: 2.5 }} />
          <span style={{ fontSize: 12, color: C.sub, lineHeight: "16px" }}>{text}</span>
        </div>
      ))}
    </div>
  );
}
