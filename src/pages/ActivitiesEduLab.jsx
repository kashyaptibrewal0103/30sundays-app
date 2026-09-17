import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Play, Plus, Star, MapPin, ChevronDown, ChevronRight, FileText,
  Pencil, Sparkles, Check, X as XIcon, Download,
} from "lucide-react";
import { C } from "../data";
import { flatActivities, recommendedRoute } from "../data/buildData";
import NextStepNote from "../components/NextStepNote";

// Same deterministic stand-in the wizard uses, so the mock reads like the real
// screen rather than inventing different numbers.
function activityRating(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 10000;
  return { rating: (4.3 + ((h % 7) * 0.1)).toFixed(1), reviews: 80 + (h % 400) };
}

// ─── Educating the last step of the wizard ───
//
// People stall on the activities step because nothing on it says what the
// button does. Two things are missing, and both came straight from the
// feedback:
//
//   1. What you get next: a real day-by-day itinerary, downloadable as a PDF.
//   2. That it is not final: everything can still be changed afterwards.
//
// Five places to say it, each with a different cost. They sit on the same mock
// of the real screen so they can be judged where they would actually live.

const DEST = "Vietnam";

const OPTIONS = [
  { key: "A", name: "Line above the button", note: "One line, right where the decision is made. Cheapest, always seen, least room." },
  { key: "B", name: "Card at the top", note: "Sets expectations before the list. Far from the button by the time they decide." },
  { key: "C", name: "Three-step strip", note: "Shows the whole journey, not just the next beat. Takes a band of space." },
  { key: "D", name: "Panel at the end", note: "Meets the people who scrolled to the bottom, and can show the thing itself." },
  { key: "E", name: "Button + explainer sheet", note: "Keeps the screen clean. Only the curious ever read it." },
];

// ─── The two promises, written once and reused by every option ───
const PROMISE = {
  build: {
    icon: FileText,
    title: "You get a day-by-day itinerary",
    body: "Flights, hotels, and every day planned out. Download it as a PDF.",
    short: "A day-by-day itinerary, yours as a PDF",
  },
  edit: {
    icon: Pencil,
    title: "Nothing is locked in",
    body: "Change any day, hotel or activity after it is built. As often as you like.",
    short: "Change any day or hotel after, as often as you like",
  },
};

export default function ActivitiesEduLab() {
  const navigate = useNavigate();
  const [opt, setOpt] = useState("A");
  const [picks, setPicks] = useState(() => new Set());
  const [sheet, setSheet] = useState(false);

  const route = useMemo(() => recommendedRoute(DEST, 8), []);
  const acts = useMemo(() => flatActivities(DEST, route, []).slice(0, 6), [route]);
  const toggle = (id) => setPicks((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const current = OPTIONS.find((o) => o.key === opt);

  return (
    <div style={{ height: "100%", background: C.white, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Lab controls */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "#FBFAF9", borderBottom: `1px solid ${C.div}`, padding: "12px 14px 11px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={19} color={C.head} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>What happens next</p>
            <p style={{ margin: 0, fontSize: 11, color: C.sub }}>Five ways to say it on the activities step</p>
          </div>
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              data-testid={`edu-opt-${o.key}`}
              onClick={() => { setOpt(o.key); setSheet(false); }}
              style={{
                flexShrink: 0, padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                border: `1px solid ${opt === o.key ? C.p600 : C.div}`,
                background: opt === o.key ? C.p600 : C.white,
                color: opt === o.key ? "#fff" : C.sub,
              }}
            >
              {o.key}. {o.name}
            </button>
          ))}
        </div>
        <p style={{ margin: "9px 2px 0", fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>{current.note}</p>
      </div>

      {/* ── The real screen, mocked ── */}
      <div style={{ flex: 1, overflowY: "auto" }} className="hide-scrollbar">
        <ProgressRow />

        <div style={{ padding: "16px 16px 24px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.head, margin: 0, letterSpacing: "-0.4px" }}>What sounds fun?</h1>
          <p style={{ fontSize: 13, color: C.sub, margin: "6px 0 0", lineHeight: "18px" }}>
            Pick anything you like. Some may make it into your final trip, some may not, depending on what's possible on the ground.
          </p>

          {opt === "B" && <TopCard />}
          {opt === "C" && <StepStrip />}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            {acts.map((a) => <Card key={a.id} a={a} on={picks.has(a.id)} onToggle={() => toggle(a.id)} />)}
          </div>

          <button style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4, width: "100%", marginTop: 16,
            padding: "13px", borderRadius: 12, border: `1px solid ${C.div}`, background: C.white,
            fontSize: 14, fontWeight: 700, color: C.head, cursor: "pointer", fontFamily: "inherit",
          }}>
            See more activities <ChevronDown size={15} color={C.sub} />
          </button>

          {opt === "D" && <EndPanel />}
        </div>
      </div>

      {/* ── Footer, with whatever the option adds to it ── */}
      <div style={{ flexShrink: 0, borderTop: `1px solid ${C.div}`, background: C.white }}>
        {opt === "A" && <NextStepNote />}
        <div style={{ padding: "12px 16px calc(12px + env(safe-area-inset-bottom))" }}>
          {opt === "E" && (
            <button
              data-testid="edu-what-next"
              onClick={() => setSheet(true)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5, width: "100%",
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: 700, color: C.p600, padding: "0 0 10px",
              }}
            >
              What happens after this? <ChevronRight size={14} color={C.p600} />
            </button>
          )}
          <button style={{
            width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: C.p600,
            color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            {picks.size > 0 ? "Create my itinerary ✦" : "Skip & build my trip"}
          </button>
          {opt === "E" && (
            <p style={{ margin: "8px 0 0", fontSize: 11.5, color: C.sub, textAlign: "center" }}>
              You can change everything afterwards
            </p>
          )}
        </div>
      </div>

      {opt === "E" && sheet && <ExplainerSheet onClose={() => setSheet(false)} />}
    </div>
  );
}

// ════════════════ B. Card at the top ════════════════
function TopCard() {
  return (
    <div data-testid="edu-b" style={{
      marginTop: 16, borderRadius: 16, border: `1px solid ${C.p300}`, background: C.p100 + "55", padding: "14px 14px 12px",
    }}>
      <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 800, color: C.head }}>What happens after this</p>
      {[PROMISE.build, PROMISE.edit].map((p) => {
        const Icon = p.icon;
        return (
          <div key={p.title} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: C.white, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon size={13} color={C.p600} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.head }}>{p.title}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: C.sub, lineHeight: "17px" }}>{p.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════ C. Three-step strip ════════════════
const BEATS = [
  { icon: Check, label: "Pick what\nyou like" },
  { icon: Sparkles, label: "We build your\nitinerary" },
  { icon: Pencil, label: "Edit it, save\nthe PDF" },
];
function StepStrip() {
  return (
    <div data-testid="edu-c" style={{
      display: "flex", alignItems: "flex-start", marginTop: 16, padding: "14px 6px",
      borderRadius: 16, border: `1px solid ${C.div}`, background: C.bg,
    }}>
      {BEATS.map((b, i) => {
        const Icon = b.icon;
        const now = i === 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, position: "relative" }}>
            {i > 0 && (
              <span style={{ position: "absolute", left: "-50%", top: 15, width: "100%", height: 1, background: C.div }} />
            )}
            <span style={{
              position: "relative", width: 31, height: 31, borderRadius: "50%", display: "grid", placeItems: "center",
              background: now ? C.p600 : C.white, border: `1px solid ${now ? C.p600 : C.div}`,
            }}>
              <Icon size={14} color={now ? "#fff" : C.sub} />
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: now ? C.head : C.sub, textAlign: "center", lineHeight: "14px", whiteSpace: "pre-line" }}>
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════ D. Panel at the end ════════════════
function EndPanel() {
  return (
    <div data-testid="edu-d" style={{
      marginTop: 20, borderRadius: 18, border: `1px solid ${C.div}`, overflow: "hidden", background: C.white,
    }}>
      <div style={{ padding: "16px 16px 0" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.head }}>Here is what you get next</p>
      </div>
      <div style={{ padding: "12px 16px 0" }}>
        <ItineraryPreview />
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        {[PROMISE.build, PROMISE.edit].map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 8 }}>
              <Icon size={14} color={C.p600} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: C.head, lineHeight: "17px" }}>{p.short}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// A small stand-in for the itinerary itself, so the promise is shown, not
// only described.
function ItineraryPreview() {
  const days = [
    { d: "Day 1", city: "Hanoi", note: "Arrive, Old Quarter walk" },
    { d: "Day 2", city: "Ha Long", note: "Bay cruise, kayaking" },
    { d: "Day 3", city: "Hoi An", note: "Ancient town, lanterns" },
  ];
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${C.div}`, background: C.bg, padding: "10px 12px", position: "relative" }}>
      <span style={{
        position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 8px", borderRadius: 999, background: C.white, border: `1px solid ${C.div}`,
        fontSize: 10, fontWeight: 700, color: C.sub,
      }}>
        <Download size={10} color={C.sub} /> PDF
      </span>
      {days.map((x, i) => (
        <div key={x.d} style={{ display: "flex", gap: 9, alignItems: "center", padding: "7px 0", borderTop: i ? `1px solid ${C.div}` : "none" }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: C.p600, width: 34, flexShrink: 0 }}>{x.d}</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head, width: 52, flexShrink: 0 }}>{x.city}</span>
          <span style={{ fontSize: 11, color: C.sub, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.note}</span>
        </div>
      ))}
      <div style={{ height: 14, marginTop: 4, background: `linear-gradient(${C.bg}00, ${C.bg})` }} />
    </div>
  );
}

// ════════════════ E. Explainer sheet ════════════════
function ExplainerSheet({ onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div data-testid="edu-e-sheet" style={{
        position: "relative", background: C.white, borderRadius: "22px 22px 0 0", padding: "14px 20px 24px",
        animation: "sheetSlideUp 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E0E2EB", margin: "0 auto 12px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head }}>What happens after this</p>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }}>
            <XIcon size={19} color={C.sub} />
          </button>
        </div>
        <ItineraryPreview />
        <div style={{ marginTop: 14 }}>
          {[PROMISE.build, PROMISE.edit].map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ width: 28, height: 28, borderRadius: 9, background: C.p100, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={14} color={C.p600} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head }}>{p.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>{p.body}</p>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} style={{
          width: "100%", padding: "14px 0", borderRadius: 14, border: "none", background: C.p600,
          color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>
          Got it
        </button>
      </div>
    </div>
  );
}

// ════════════════ Mock furniture ════════════════
function ProgressRow() {
  const steps = [
    ["Destination", "Vietnam"], ["Travelers", "2A"], ["Travel dates", "09/10 - 17/10"],
    ["Route", "4 cities"], ["Activities", "-"],
  ];
  return (
    <div style={{ display: "flex", gap: 6, padding: "10px 16px 12px", borderBottom: `1px solid ${C.div}` }}>
      {steps.map(([label, val], i) => (
        <div key={label} style={{ flex: 1, minWidth: 0 }}>
          <div style={{ height: 3, borderRadius: 2, background: i === 4 ? C.p600 : C.p600, opacity: i === 4 ? 1 : 0.85, marginBottom: 6 }} />
          <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, color: i === 4 ? C.p600 : C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
          <p style={{ margin: 0, fontSize: 9.5, color: i === 4 ? C.p600 : C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</p>
        </div>
      ))}
    </div>
  );
}

function Card({ a, on, onToggle }) {
  const { rating, reviews } = activityRating(a.id);
  return (
    <div style={{
      position: "relative", aspectRatio: "3 / 4", borderRadius: 18, overflow: "hidden",
      background: C.div, boxShadow: on ? `0 0 0 3px ${C.p600}` : "none",
    }}>
      <img src={a.img} alt={a.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 55%)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(0,0,0,0.32)", border: "1.5px solid rgba(255,255,255,0.7)", display: "grid", placeItems: "center" }}>
        <Play size={17} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
      </div>
      <button onClick={onToggle} aria-label={on ? "Remove" : "Add"} style={{
        position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
        border: on ? "none" : "2px solid rgba(255,255,255,0.9)", background: on ? C.p600 : "rgba(0,0,0,0.3)",
        display: "grid", placeItems: "center", padding: 0,
      }}>
        {on ? <Check size={16} color="#fff" strokeWidth={3} /> : <Plus size={16} color="#fff" strokeWidth={2.5} />}
      </button>
      <div style={{ position: "absolute", left: 11, right: 11, bottom: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
          <Star size={11} color="#FBBC05" fill="#FBBC05" />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{rating}</span>
          <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.8)" }}>({reviews})</span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: "#fff", lineHeight: "17px" }}>{a.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
          <MapPin size={10} color="rgba(255,255,255,0.85)" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{a.city}</span>
        </div>
      </div>
    </div>
  );
}
