import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import LoginV2, { RESEND_SECONDS } from "./LoginV2";

// The login screen with a phone keyboard drawn in, for the OTP on SMS
// one-pager. Links open it on a given state:
//   ?step=otp&via=sms|whatsapp   straight to the code screen
//   &wait=0                      the resend countdown already over
//   &wa=fail                     WhatsApp can't reach the number
const HOW = {
  autofill: "filled in with one tap",
  paste: "pasted from WhatsApp with one tap",
  typed: "typed in",
};

export default function OtpSmsLab() {
  const [params] = useSearchParams();
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(null);

  const step = params.get("step");
  const via = params.get("via") === "whatsapp" ? "whatsapp" : "sms";
  const initial = step === "otp"
    ? { phase: "otp", channel: via, phone: "9971019664", timer: params.get("wait") === "0" ? 0 : RESEND_SECONDS }
    : null;

  if (done) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 32px" }}>
        <CheckCircle2 size={56} color="#2E7D32" strokeWidth={1.8} />
        <h2 style={{ margin: "18px 0 0", fontSize: 24, fontWeight: 800, color: "#181D27" }}>You're in</h2>
        <p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.5, color: "#717680" }}>
          The code came {done.channel === "whatsapp" ? "on WhatsApp" : "by SMS"} and was {HOW[done.method] || HOW.typed}.
        </p>
        <button
          onClick={() => { setDone(null); setRun((r) => r + 1); }}
          style={{ marginTop: 26, height: 48, padding: "0 26px", borderRadius: 999, border: "none", background: "#E31B53", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
        >
          Start again
        </button>
      </div>
    );
  }

  return (
    <LoginV2
      key={run}
      demoKeyboard
      showSkip={!step}
      initial={initial}
      failWhatsApp={params.get("wa") === "fail"}
      onSkip={() => setRun((r) => r + 1)}
      onComplete={setDone}
    />
  );
}
