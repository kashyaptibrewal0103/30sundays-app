import { CC } from "./tokens";
import { Sheet, Primary, Secondary } from "../Gift/GiftUI";

// The two things that happen before somebody's first post, and never again.
//
// The rules are shown above the composer rather than at join, because that is
// the moment they are actually read. The consent notice is separate and sits
// inside the composer, because it is about what becomes public rather than
// about how to behave.

export function ComposeRules({ onGotIt, onClose }) {
  return (
    <Sheet
      title="Before you post"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={onGotIt}>Got it</Primary>
          <Secondary onClick={onClose}>Not now</Secondary>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          "Answer about places you have actually been.",
          "Anything about your own trip goes to your trip manager, who can fix it.",
          "Nothing for sale here.",
          "No contact details, yours or anyone else's.",
          "No politics or religion, and nobody gets attacked.",
        ].map((rule, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              background: CC.tealTint, display: "grid", placeItems: "center",
              fontSize: 11.5, fontWeight: 800, color: CC.tealInk,
            }}>{i + 1}</span>
            <span style={{ fontSize: 14.5, color: CC.ink, lineHeight: "21px" }}>{rule}</span>
          </div>
        ))}

        <p style={{ fontSize: 13, color: CC.body, margin: "2px 0 0", lineHeight: "19px" }}>
          If a post crosses a line we take it down and tell you why.
        </p>
      </div>
    </Sheet>
  );
}

// Consent, in the words a person would use. Not a checkbox buried in signup,
// and not a link to a policy nobody opens.
//
// It asks for nothing. Posting is the agreement, so a button to confirm having
// read it would be a second click for the same act. Quiet type does the work.
export function ConsentNote() {
  return (
    <p style={{
      margin: 0, fontSize: 12.5, fontStyle: "italic", color: CC.soft, lineHeight: "18px",
    }}>
      Your name and the month you travelled show next to what you write. No phone
      number, no email, no home city.
    </p>
  );
}
