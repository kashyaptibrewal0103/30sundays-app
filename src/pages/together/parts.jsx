import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Check, ChevronRight, Heart, Pencil } from "lucide-react";
import { C, allItineraries } from "../../data";

// ─── Plan together: the pieces every screen shares ───
//
// The lab tells one story with three people: Kashyap made a Bali trip and
// invites Priya; Ankit is their consultant. The same trip, versions and times
// are used on every screen, so the screens read as one flow.

export const PINK = C.p600;
export const WA = { green: "#25D366", dark: "#008069", bubbleOut: "#D9FDD3", chat: "#EFEAE2", tick: "#53BDEB" };

const trip = allItineraries.find((i) => i.id === 3);
export const TRIP = {
  dest: "Bali",
  nights: trip?.nights || 7,
  img: trip?.img,
  route: trip?.route || [],
  when: "17 Dec to 24 Dec",
  pax: 2,
  total: "₹1,44,996",
};

export const PEOPLE = {
  kashyap: { key: "kashyap", first: "Kashyap", name: "Kashyap Tibrewal", fg: C.p600, bg: C.p100 },
  priya: { key: "priya", first: "Priya", name: "Priya Sharma", tel: "+91 98200 11223", masked: "+91\u00a098•••\u00a0••223", fg: C.purple, bg: C.pur100 },
  ankit: { key: "ankit", first: "Ankit", name: "30 Sundays (Ankit)", fg: "#fff", bg: C.p600, brand: true },
};

// A face: the first letter on the person's own tint. 30 Sundays is its mark.
export function Avatar({ p, size = 36, ring = false, dot }) {
  return (
    <span style={{ position: "relative", flexShrink: 0, width: size, height: size, display: "inline-block" }}>
      <span style={{
        width: size, height: size, borderRadius: "50%", display: "grid", placeItems: "center",
        background: p.bg, color: p.fg, fontWeight: 800, fontSize: p.brand ? size * 0.34 : size * 0.4,
        border: ring ? "2px solid #fff" : "none", boxSizing: "border-box", letterSpacing: p.brand ? -0.5 : 0,
      }}>
        {p.brand ? "30" : (p.initial || p.first[0])}
      </span>
      {dot && (
        <span style={{ position: "absolute", right: -1, bottom: -1, width: size * 0.34, height: size * 0.34, borderRadius: "50%", border: "2px solid #fff", background: dot === "joined" ? "#12B76A" : "#F79009" }} />
      )}
    </span>
  );
}

export function Faces({ list, size = 28 }) {
  return (
    <span style={{ display: "inline-flex" }}>
      {list.map((p, i) => <span key={p.key} style={{ marginLeft: i ? -size / 3 : 0 }}><Avatar p={p} size={size} ring /></span>)}
    </span>
  );
}

// Status chips on a co-traveller.
export function StatusChip({ kind }) {
  const s = {
    joined: { fg: C.sText, bg: C.sBg, label: "Joined", icon: true },
    invited: { fg: C.wText, bg: C.wBg, label: "Invited" },
    sms: { fg: C.wText, bg: C.wBg, label: "Sent by SMS" },
    owner: { fg: C.sub, bg: C.bg, label: "Owner" },
  }[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 700, color: s.fg, background: s.bg, padding: "2px 7px", borderRadius: 999, flexShrink: 0 }}>
      {s.icon && <Check size={10} strokeWidth={3.5} />}{s.label}
    </span>
  );
}

// WhatsApp's mark, drawn, since the icon set has no brand marks.
export function WhatsAppGlyph({ size = 16, color = "#fff" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm4.52 11.99c-.247-.124-1.465-.723-1.692-.806-.227-.083-.393-.124-.558.124-.165.248-.64.806-.785.97-.145.166-.29.186-.537.062-.248-.124-1.046-.386-1.993-1.23-.737-.657-1.235-1.47-1.38-1.717-.144-.248-.015-.382.109-.505.111-.11.248-.29.372-.434.124-.145.165-.248.248-.414.083-.166.041-.31-.021-.434-.062-.124-.558-1.345-.765-1.84-.201-.484-.406-.418-.558-.426l-.475-.008a.916.916 0 00-.662.31c-.227.248-.868.848-.868 2.069 0 1.22.889 2.4 1.013 2.565.124.166 1.75 2.672 4.24 3.746.593.256 1.055.409 1.416.523.595.19 1.136.163 1.564.099.477-.071 1.465-.599 1.671-1.177.207-.579.207-1.075.145-1.178-.062-.104-.227-.166-.475-.29z" />
    </svg>
  );
}

export function useGo() {
  const navigate = useNavigate();
  return (key) => navigate(key ? `/together/${key}` : "/together");
}

// A screen inside the phone: fills it, and holds its own sheets.
export function Screen({ children, bg = C.white, testid }) {
  return (
    <div data-testid={testid} style={{ position: "relative", height: "100%", overflow: "hidden", background: bg, display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}

export function BackBar({ onBack, title, right }) {
  return (
    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
      <button onClick={onBack} aria-label="Back" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer" }}>
        <ArrowLeft size={18} color={C.head} />
      </button>
      {title && <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.head, flex: 1 }}>{title}</p>}
      {right}
    </div>
  );
}

export const btn = (kind = "solid") => ({
  width: "100%", height: 50, borderRadius: 14, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  ...(kind === "solid" && { border: "none", background: PINK, color: "#fff", boxShadow: "0 6px 16px rgba(227,27,83,0.24)" }),
  ...(kind === "outline" && { border: `1.5px solid ${PINK}`, background: C.white, color: PINK }),
  ...(kind === "quiet" && { border: `1px solid ${C.div}`, background: C.white, color: C.head }),
  ...(kind === "wa" && { border: "none", background: WA.green, color: "#fff" }),
});

// ─── The trip screen, as far as this feature needs it ───
//
// The real screen's hero and first lines, so each Plan together state is seen
// where it lives. `strip` is the new line of faces under the route: who is on
// the trip, at the top of the trip, for the owner and the guest alike.
export function TripHero({ onBack, version = "V2", children }) {
  return (
    <div style={{ position: "relative", height: 232, flexShrink: 0, background: `${C.bg} url(${TRIP.img}) center 30%/cover no-repeat` }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)" }} />
      <button onClick={onBack} aria-label="Back" style={{ position: "absolute", left: 14, top: 14, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", cursor: "pointer" }}>
        <ArrowLeft size={18} color="#fff" />
      </button>
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 23, fontWeight: 800, color: "#fff", letterSpacing: -0.4 }}>Your Bali Trip <span style={{ fontWeight: 500 }}>· {TRIP.nights}N</span></p>
        <Heart size={19} color="#fff" />
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "5px 10px" }}>{version}</span>
      </div>
      {children}
    </div>
  );
}

export function TripInfo({ strip, versionLine }) {
  return (
    <div style={{ padding: "14px 16px 12px", borderBottom: `8px solid ${C.bg}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head }}>{TRIP.when} · {TRIP.pax} travellers</p>
          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>{TRIP.route.map((r) => `${r.city} ${r.n}N`).join(" · ")}</p>
          {versionLine && <p style={{ margin: "5px 0 0", fontSize: 12, color: C.sub }}>{versionLine}</p>}
        </div>
        <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${C.p300}`, color: PINK, borderRadius: 999, padding: "7px 13px", fontSize: 13, fontWeight: 700 }}>
          <Pencil size={13} /> Customise
        </span>
      </div>
      {strip}
    </div>
  );
}

// What follows on the real screen, enough to show the trip goes on.
export function GlanceStub() {
  const days = [
    { d: "DAY 1", city: "UBUD", line: "Arrive, rice terrace walk", img: TRIP.img },
    { d: "DAY 2", city: "UBUD", line: "Monkey Forest, art villages", img: TRIP.img },
  ];
  return (
    <div style={{ padding: "16px 16px 8px" }}>
      <p style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, color: C.head }}>Itinerary at a glance</p>
      {days.map((x) => (
        <div key={x.d} style={{ display: "flex", gap: 12, border: `1px solid ${C.div}`, borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
          <span style={{ width: 92, height: 74, flexShrink: 0, background: `${C.bg} url(${x.img}) center/cover` }} />
          <div style={{ padding: "12px 0" }}>
            <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: C.sub, letterSpacing: 0.4 }}>{x.d} · {x.city}</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.head }}>{x.line}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── A sheet over the screen ───
export function Sheet({ title, sub, onClose, children, tall = false, testid }) {
  return (
    <div data-testid={testid} style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.45)" }} />
      <div className="hide-scrollbar" style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", padding: "10px 18px calc(20px + env(safe-area-inset-bottom))", maxHeight: tall ? "92%" : "86%", overflowY: "auto", animation: "sheetSlideUp 0.25s ease-out" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.icon, margin: "0 auto 14px" }} />
        {(title || onClose) && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.head, letterSpacing: -0.2 }}>{title}</h3>}
              {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.sub, lineHeight: "19px" }}>{sub}</p>}
            </div>
            {onClose && (
              <button onClick={onClose} aria-label="Close" style={{ border: "none", background: C.bg, width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                <X size={16} color={C.sub} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// A row in a list of choices: icon, two lines, a chevron.
export function ChoiceRow({ icon, title, line, onClick, testid }) {
  return (
    <button data-testid={testid} onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px", border: `1px solid ${C.div}`, borderRadius: 14, background: C.white, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: C.head }}>{title}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{line}</p>
      </div>
      <ChevronRight size={18} color={C.inact} style={{ flexShrink: 0 }} />
    </button>
  );
}

export function IconDisc({ children, bg = C.p100, size = 40 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "grid", placeItems: "center", flexShrink: 0 }}>{children}</span>;
}
