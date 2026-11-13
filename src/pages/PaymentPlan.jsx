import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle2, Lock } from "lucide-react";
import { C, allItineraries } from "../data";

function buildInstallments(total) {
  const pcts = [20, 30, 25, 25];
  const rel = ["Pay now to book", "30 days before travel", "15 days before travel", "7 days before travel"];
  return pcts.map((p, i) => ({
    label: `Installment ${i + 1}`,
    amount: Math.round((total * p) / 100),
    dueLabel: rel[i],
    status: i === 0 ? "active" : "locked",
  }));
}

export default function PaymentPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const it = allItineraries.find(i => i.id === Number(id));

  if (!it) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Itinerary not found</div>;
  }

  // A plan opened from My Plans brings its own final price and travellers, so
  // this page asks for the same amount the card showed.
  const travelers = Number(params.get("t")) || 2;
  const priceNum = Number(params.get("pp")) || Number(String(it.price).replace(/,/g, "")) || 0;
  const total = priceNum * travelers;
  const installments = buildInstallments(total);
  const first = installments[0];

  const handlePayNow = () => {
    alert("Razorpay checkout would open here");
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px 12px", background: C.white }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 34, height: 34, borderRadius: 12, background: C.white, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <ArrowLeft size={17} color={C.head} />
        </button>
        <h4 style={{ fontSize: 18, fontWeight: 600, color: C.head, margin: 0 }}>Payment plan</h4>
      </div>

      {/* Not-booked banner */}
      <div style={{ background: C.p600, padding: "12px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, textAlign: "center" }}>
          Pay ₹{first.amount.toLocaleString("en-IN")} to confirm your booking
        </p>
      </div>

      {/* Total package card */}
      <div style={{ margin: "0 16px 16px", padding: 16, background: "#FFF8F0", borderRadius: 12 }}>
        <p style={{ fontSize: 13, color: C.sub, margin: "0 0 4px" }}>Total package value</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: "0 0 4px" }}>
          ₹ {total.toLocaleString("en-IN")}
        </p>
        <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>
          {it.dest} · {it.nights}N · {travelers} travellers
        </p>
      </div>

      {/* What's next */}
      <div style={{
        margin: "0 16px 16px", padding: "12px 14px", background: C.white,
        borderRadius: 12, border: `1px solid ${C.div}`,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <CheckCircle2 size={18} color={C.sText} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: C.sub, margin: 0, lineHeight: "17px" }}>
          Pay Installment 1 to confirm your booking. You'll get instant confirmation and the remaining schedule unlocks.
        </p>
      </div>

      {/* Installments list */}
      <div style={{ padding: "0 16px" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 10px" }}>Installment schedule</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {installments.map((inst, idx) => {
            const isActive = inst.status === "active";
            return (
              <div key={idx} style={{
                background: C.white, borderRadius: 12, padding: 14,
                border: `1px solid ${isActive ? C.p300 : C.div}`,
                opacity: isActive ? 1 : 0.7,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: "0 0 2px" }}>{inst.label}</p>
                    <p style={{ fontSize: 12, color: C.sub, margin: "0 0 4px" }}>{inst.dueLabel}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: 0 }}>
                      ₹ {inst.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    {isActive ? (
                      <>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                          color: "#D92D20", background: "#FEF3F2", border: "1px solid #FECDCA",
                        }}>Due</span>
                        <button onClick={handlePayNow} style={{
                          padding: "7px 16px", borderRadius: 8, background: C.p600, color: "#fff",
                          fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit",
                        }}>
                          Pay now
                        </button>
                      </>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 20,
                        color: C.sub, background: C.bg, border: `1px solid ${C.div}`,
                      }}>
                        <Lock size={10} color={C.sub} /> After booking
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Razorpay security */}
      <div style={{
        margin: "20px 16px 24px", padding: "12px 14px", background: C.white,
        borderRadius: 12, border: `1px solid ${C.div}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "#EFF4FF",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Shield size={16} color="#1570EF" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.head, margin: "0 0 2px" }}>Secured by Razorpay</p>
          <p style={{ fontSize: 11, color: C.sub, margin: 0, lineHeight: "15px" }}>
            Payments are processed via Razorpay with 256-bit SSL encryption.
          </p>
        </div>
      </div>

      {/* Sticky Pay now CTA */}
      <div style={{
        position: "sticky", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)",
        padding: "10px 16px 14px", borderTop: `1px solid ${C.div}`,
      }}>
        <button onClick={handlePayNow} style={{
          width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer",
          background: C.p600, color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
          boxShadow: "0 4px 16px rgba(227,27,83,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          Pay ₹{first.amount.toLocaleString("en-IN")} via Razorpay
        </button>
      </div>
    </div>
  );
}
