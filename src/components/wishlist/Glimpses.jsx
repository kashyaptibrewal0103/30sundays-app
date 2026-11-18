import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, X as XIcon, RotateCcw, Hand } from "lucide-react";
import { C } from "../../data";
import { useWishlist } from "../../data/wishlist";
import { regionsFor, activitiesFor } from "../../data/discoverData";
import { generateHotelsForCity } from "../../data/hotelData";
import { activityKind, KIND_TONE } from "../../data/activityKind";
import { activityRating, regionEnjoyed, regionStay } from "../../data/cardFacts";
import { detailFromHotel } from "../../data/hotelDetailAdapter";
import { ActivityScreen } from "../../pages/DayDetailLab";
import HotelV3 from "../hotel_v3/HotelV3";
import { KindDisc } from "../../data/wishlistKinds";

// ─── Glimpses of a destination ───
//
// A full-screen deck of the destination's regions, things to do and stays,
// swiped right (Love it) to wishlist and left (Not for me) to pass. Four ways to show the swipe are
// kept side by side for review (?v=1 to 4):
//   1 Reel     edge to edge, a colour wash from the side you swipe to
//   2 Stack    a rounded card on a stack, a glass label that grows as you drag
//   3 Reveal   the card slides off a dark ground that says what you chose
//   4 Collect  a saved card flies into the heart at the top, which counts up
// Collect (4) is the one in use; the others stay for comparison.
// Photos drift slowly, standing in for the activity videos to come; a stay is
// its photo, held still. A tap opens the thing itself in a drawer.

export const GLIMPSE_VARIANTS = [1, 2, 3, 4];
const NUDGE_KEY = "30s_glimpse_nudge_v2";
const PINK = "#E31B53";
const INK = "#0C1028";
const THRESHOLD = 96; // px of drag that commits a swipe
const FLICK = 0.55; // px per ms that commits a swipe on its own

const CSS = `
@keyframes gl-drift{0%{transform:scale(1.08) translate3d(-1.5%,-1%,0)}100%{transform:scale(1.18) translate3d(1.5%,1.5%,0)}}
@keyframes gl-hint{0%,100%{transform:translateX(0) rotate(0)}22%{transform:translateX(64px) rotate(6deg)}48%{transform:translateX(-56px) rotate(-5deg)}70%{transform:translateX(0) rotate(0)}}
@keyframes gl-hand{0%,100%{transform:translateX(0)}22%{transform:translateX(56px)}48%{transform:translateX(-48px)}70%{transform:translateX(0)}}
@keyframes gl-pop{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes gl-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes gl-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}35%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
`;

// ─── The deck ───
export function buildGlimpses(dest) {
  const regions = regionsFor(dest);
  const bases = regions.filter((r) => !r.dayTrip).slice(0, 4);
  const lists = {
    region: regions.map((r) => {
      const e = regionEnjoyed(dest, r.city);
      return {
        kind: "region", id: r.city, name: r.city, img: r.img, city: r.city, blurb: r.blurb,
        tag: r.dayTrip ? "Day trip" : "Base", stay: regionStay(dest, r.city), enjoyed: e?.pct,
        meta: { name: r.city, img: r.img, sub: r.blurb, city: r.city },
      };
    }),
    activity: activitiesFor(dest, 18).map((a) => {
      const r = activityRating(dest, a.city, a.name);
      return {
        kind: "activity", id: a.id, name: a.name, img: a.img, city: a.city, tag: activityKind(a.name),
        rating: r?.rating, reviews: r?.reviews,
        meta: { name: a.name, img: a.img, sub: a.city, city: a.city },
      };
    }),
    hotel: bases.flatMap((r) => {
      const h = generateHotelsForCity(r.city, dest, "2026-11-10", "2026-11-17", 7)
        .slice().sort((x, y) => (y.bookingScore || 0) - (x.bookingScore || 0))[0];
      const img = h?.images?.[0]?.url;
      return h && img ? [{
        kind: "hotel", id: h.name, name: h.name, img, city: r.city, stars: h.stars, score: h.bookingScore, hotel: h,
        meta: { name: h.name, city: r.city, sub: `${r.city} · ${h.stars}-star`, img, stars: h.stars, score: h.bookingScore },
      }] : [];
    }),
  };
  const order = ["activity", "region", "activity", "hotel", "activity", "activity", "region", "hotel"];
  const at = { region: 0, activity: 0, hotel: 0 };
  const out = [];
  for (let i = 0; i < 90 && out.length < 24; i++) {
    const k = order[i % order.length];
    const c = lists[k][at[k]++];
    if (c?.img) out.push({ ...c, key: `${c.kind}:${c.id}` });
    if (Object.keys(at).every((kk) => at[kk] >= lists[kk].length)) break;
  }
  return out;
}

// ─── The labels on a card ───
function Facts({ c }) {
  const tone = KIND_TONE[c.tag] || { bg: "rgba(255,255,255,0.18)", fg: "#fff" };
  const chip = { display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px", borderRadius: 13, fontSize: 12, fontWeight: 800 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span style={{ ...chip, background: "rgba(255,255,255,0.16)", color: "#fff", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", padding: "0 10px 0 4px" }}>
          <KindDisc kind={c.kind} size={20} />
          {c.kind === "hotel" ? "Stay" : c.kind === "region" ? "Region" : "Thing to do"}
        </span>
        {c.kind === "activity" && <span style={{ ...chip, background: tone.bg, color: tone.fg }}>{c.tag}</span>}
        {c.kind === "region" && <span style={{ ...chip, background: "rgba(255,255,255,0.92)", color: "#254342" }}>{c.tag}</span>}
      </div>
      <p style={{ margin: 0, fontSize: 28, lineHeight: 1.12, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px", textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>{c.name}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13.5, fontWeight: 700, color: "#fff" }}>
        {c.city && c.kind !== "region" && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={14} color="#fff" />{c.city}</span>}
        {c.kind === "activity" && c.rating && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Star size={14} color="#FDB534" fill="#FDB534" />{c.rating}
            <span style={{ fontWeight: 500, opacity: 0.8 }}>({c.reviews})</span>
          </span>
        )}
        {c.kind === "hotel" && (
          <>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
              {Array.from({ length: Math.round(c.stars || 0) }).map((_, i) => <Star key={i} size={12} color="#FDB534" fill="#FDB534" />)}
            </span>
            {c.score && <span>{c.score} on Booking</span>}
          </>
        )}
        {c.kind === "region" && (
          <>
            {c.enjoyed && <span>{c.enjoyed}% enjoyed</span>}
            {c.stay && <span style={{ fontWeight: 500, opacity: 0.85 }}>{c.stay}</span>}
          </>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>Tap for details</p>
    </div>
  );
}

// One card: the photo (drifting, except a stay), a scrim, the labels.
function Card({ c, radius, drift, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: radius, overflow: "hidden", background: "#1A1F3A" }}>
      <img
        src={c.img}
        alt=""
        draggable={false}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none",
          animation: drift && c.kind !== "hotel" ? "gl-drift 9s ease-in-out infinite alternate" : undefined,
          transform: c.kind === "hotel" || !drift ? "scale(1.02)" : undefined,
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,16,40,0.35) 0%, rgba(12,16,40,0) 22%, rgba(12,16,40,0) 48%, rgba(12,16,40,0.85) 100%)", pointerEvents: "none" }} />
      {children}
    </div>
  );
}

// ─── The screen ───
export default function GlimpsesScreen({ dest, variant = 4, onClose }) {
  const v = GLIMPSE_VARIANTS.includes(Number(variant)) ? Number(variant) : 4;
  const navigate = useNavigate();
  const { save, remove, isSaved, loginFor } = useWishlist();
  const [deck] = useState(() => buildGlimpses(dest).filter((c) => !isSaved(c.kind, dest, c.id)));
  const [at, setAt] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [leaving, setLeaving] = useState(null); // { dir, saved }
  const [history, setHistory] = useState([]); // [{ i, dir }]
  const [open, setOpen] = useState(null); // card shown in the drawer
  const [bump, setBump] = useState(0);
  const [nudge, setNudge] = useState(() => { try { return !localStorage.getItem(NUDGE_KEY); } catch { return true; } });
  const g = useRef(null); // gesture: start point, time, last samples
  const card = deck[at];
  const next = deck[at + 1];
  const third = deck[at + 2];
  const savedHere = history.filter((h) => h.dir === "right").length;

  const hideNudge = () => {
    if (!nudge) return;
    setNudge(false);
    try { localStorage.setItem(NUDGE_KEY, "1"); } catch { /* ignore */ }
  };

  const decide = (dir) => {
    if (!card || leaving) return;
    hideNudge();
    if (dir === "right") { save(card.kind, dest, card.id, card.meta, { silent: true }); setBump((b) => b + 1); }
    setLeaving({ dir });
    setHistory((h) => [...h, { i: at, dir }]);
    setTimeout(() => { setAt((i) => i + 1); setLeaving(null); setDrag({ x: 0, y: 0, active: false }); }, v === 4 && dir === "right" ? 520 : 380);
  };
  const undo = () => {
    const last = history[history.length - 1];
    if (!last || leaving) return;
    const c = deck[last.i];
    if (last.dir === "right") remove(c.kind, dest, c.id);
    setHistory((h) => h.slice(0, -1));
    setAt(last.i);
  };

  const onDown = (e) => {
    if (leaving) return;
    g.current = { x0: e.clientX, y0: e.clientY, t0: performance.now(), lx: e.clientX, lt: performance.now(), vx: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    const s = g.current;
    if (!s) return;
    const now = performance.now();
    s.vx = (e.clientX - s.lx) / Math.max(1, now - s.lt);
    s.lx = e.clientX; s.lt = now;
    setDrag({ x: e.clientX - s.x0, y: (e.clientY - s.y0) * 0.35, active: true });
  };
  const onUp = (e) => {
    const s = g.current;
    g.current = null;
    if (!s) return;
    const dx = e.clientX - s.x0;
    const moved = Math.hypot(dx, e.clientY - s.y0);
    if (moved < 6 && performance.now() - s.t0 < 350) { setDrag({ x: 0, y: 0, active: false }); hideNudge(); setOpen(card); return; }
    if (Math.abs(dx) > THRESHOLD || Math.abs(s.vx) > FLICK) decide((Math.abs(s.vx) > FLICK ? s.vx : dx) > 0 ? "right" : "left");
    else setDrag({ x: 0, y: 0, active: false });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (open) { if (e.key === "Escape") setOpen(null); return; }
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") decide("right");
      if (e.key === "ArrowLeft") decide("left");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Where the top card is, and how far through a swipe it is (-1 to 1).
  const W = 420;
  const fly = leaving ? (leaving.dir === "right" ? 1 : -1) : 0;
  const x = leaving ? (v === 4 && leaving.dir === "right" ? 0 : fly * W * 1.25) : drag.x;
  const y = leaving ? (v === 4 && leaving.dir === "right" ? 0 : drag.y + 30) : drag.y;
  const p = leaving ? fly : Math.max(-1, Math.min(1, drag.x / (THRESHOLD * 1.4)));
  const rot = (v === 1 ? 6 : 10) * (leaving && !(v === 4 && leaving.dir === "right") ? fly * 1.6 : p);
  const ease = drag.active ? "none" : leaving ? "transform 380ms cubic-bezier(0.22, 0.8, 0.24, 1), opacity 380ms ease" : "transform 460ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  const lift = Math.min(1, Math.abs(p));

  const round = v === 1 ? 0 : 26;
  const inset = v === 1 ? { top: 0, left: 0, right: 0, bottom: 0 } : { top: 74, left: 14, right: 14, bottom: 104 };
  const ground = v === 2 || v === 4 ? "#F6F4F2" : INK;

  // Collect (4): a saved card shrinks into the heart at the top right.
  const collect = v === 4 && leaving?.dir === "right";
  const topStyle = collect
    ? { transform: "translate(150px, -330px) scale(0.08) rotate(12deg)", opacity: 0.2, transition: "transform 520ms cubic-bezier(0.55, 0, 0.3, 1), opacity 520ms ease" }
    : { transform: `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`, transition: ease, opacity: leaving ? 0.96 : 1 };

  const content = (
    <div data-testid="glimpses" style={{ position: "absolute", inset: 0, zIndex: 1500, background: ground, overflow: "hidden", display: loginFor ? "none" : "block", animation: "gl-in 320ms cubic-bezier(0.22,0.8,0.24,1)", fontFamily: "inherit", userSelect: "none" }}>
      <style>{CSS}</style>

      {!card ? (
        <Done dest={dest} saved={savedHere} dark={ground === INK} onWishlist={() => { onClose(); navigate(`/saved/board/${encodeURIComponent(dest)}`); }} onClose={onClose} />
      ) : (
        <div style={{ position: "absolute", ...inset }}>
          {/* The cards under the top one rise as it is dragged away */}
          {v !== 1 && v !== 3 && third && (
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${24 - lift * 12}px) scale(${0.9 + lift * 0.04})`, transition: drag.active ? "none" : "transform 380ms cubic-bezier(0.22,0.8,0.24,1)", opacity: 0.55 }}>
              <Card c={third} radius={round} />
            </div>
          )}
          {next && (v !== 3 || leaving) && (
            <div style={{ position: "absolute", inset: 0, transform: v === 1 ? `scale(${1.04 - lift * 0.04})` : `translateY(${12 - lift * 12}px) scale(${0.95 + lift * 0.05})`, transition: drag.active ? "none" : "transform 380ms cubic-bezier(0.22,0.8,0.24,1)", filter: v === 1 ? `brightness(${0.6 + lift * 0.4})` : undefined }}>
              <Card c={next} radius={round} />
            </div>
          )}

          {/* Reveal (3): what the swipe means, on the ground, uncovered as the card moves.
              The cards below are hidden here so the ground shows. */}
      {v === 3 && (
        <>
          <div style={{ position: "absolute", left: 10, top: "40%", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, opacity: Math.max(0, p) * 1.2, transform: `scale(${0.85 + Math.max(0, p) * 0.15})`, transition: drag.active ? "none" : "opacity 300ms, transform 300ms" }}>
            <Heart size={46} color={PINK} fill={PINK} />
            <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>Love it</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Goes on your {dest} wishlist</span>
          </div>
          <div style={{ position: "absolute", right: 10, top: "40%", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, opacity: Math.max(0, -p) * 1.2, transform: `scale(${0.85 + Math.max(0, -p) * 0.15})`, transition: drag.active ? "none" : "opacity 300ms, transform 300ms" }}>
            <XIcon size={46} color="#fff" strokeWidth={2.4} />
            <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>Not for me</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>On to the next one</span>
          </div>
        </>
      )}

          {/* Reel (1): the colour wash and the label stay fixed to the screen,
              so they read wherever the card has been dragged to */}
          {v === 1 && !leaving && (
            <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(270deg, rgba(227,27,83,${0.7 * Math.max(0, p)}) 0%, rgba(227,27,83,0) 65%)` }} />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(12,16,40,${0.75 * Math.max(0, -p)}) 0%, rgba(12,16,40,0) 70%)` }} />
              <SideMark side="right" show={Math.max(0, p)} />
              <SideMark side="left" show={Math.max(0, -p)} />
            </div>
          )}
          <div
            key={card.key}
            data-testid="glimpse-card"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{
              position: "absolute", inset: 0, cursor: drag.active ? "grabbing" : "grab", touchAction: "none", willChange: "transform",
              borderRadius: round,
              boxShadow: v === 1 ? "none" : `0 18px 40px rgba(12,16,40,${0.22 + lift * 0.12})${v === 2 && p > 0 ? `, 0 0 0 ${3 * p}px ${PINK}` : ""}`,
              transformOrigin: "50% 90%",
              ...topStyle,
              ...(nudge && !drag.active && !leaving ? { animation: "gl-hint 2.4s cubic-bezier(0.45,0,0.2,1) 0.6s 2" } : {}),
            }}
          >
            <Card c={card} radius={round} drift>
              {/* Stack (2) and Collect (4): a glass label that grows with the drag */}
              {(v === 2 || v === 4) && <GlassLabel p={p} />}
              <div style={{ position: "absolute", left: 20, right: 20, bottom: v === 1 ? 128 : 22, pointerEvents: "none" }}>
                <Facts c={card} />
              </div>
            </Card>
          </div>

          {nudge && !leaving && (
            <div style={{ position: "absolute", left: 0, right: 0, top: v === 1 ? "40%" : "36%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none", zIndex: 4 }}>
              <span style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "grid", placeItems: "center", animation: "gl-hand 2.4s cubic-bezier(0.45,0,0.2,1) 0.6s 2" }}>
                <Hand size={26} color="#fff" />
              </span>
              <span style={{ padding: "8px 14px", borderRadius: 999, background: "rgba(12,16,40,0.72)", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                Swipe right if you love it, left if not
              </span>
            </div>
          )}
        </div>
      )}

      {/* Header: close, undo, and the wishlist heart that counts what was saved */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, padding: "calc(14px + env(safe-area-inset-top)) 14px 0", display: "flex", alignItems: "center", gap: 10, zIndex: 5, pointerEvents: "none" }}>
        <RoundBtn label="Close" dark={ground !== INK && v !== 1} onClick={onClose}><XIcon size={19} /></RoundBtn>
        <p style={{ flex: 1, margin: 0, textAlign: "center", fontSize: 15, fontWeight: 800, color: ground === INK || v === 1 ? "#fff" : C.head, textShadow: v === 1 ? "0 1px 8px rgba(0,0,0,0.35)" : "none" }}>Glimpses of {dest}</p>
        <RoundBtn label="Undo" dark={ground !== INK && v !== 1} onClick={undo} disabled={!history.length}><RotateCcw size={17} /></RoundBtn>
        <span key={bump} style={{ position: "relative", width: 40, height: 40, display: "grid", placeItems: "center", pointerEvents: "auto", animation: bump ? "gl-pop 420ms cubic-bezier(0.34,1.56,0.64,1)" : undefined }}>
          <Heart size={24} color={PINK} fill={savedHere ? PINK : "none"} strokeWidth={2.2} style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.25))" }} />
          {savedHere > 0 && <span style={{ position: "absolute", top: 2, right: 0, minWidth: 18, height: 18, padding: "0 5px", boxSizing: "border-box", borderRadius: 9, background: "#fff", color: PINK, fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>{savedHere}</span>}
        </span>
      </div>

      {/* A heart bursts where the card was, the moment it is saved */}
      {leaving?.dir === "right" && v !== 4 && (
        <span style={{ position: "absolute", left: "50%", top: "45%", zIndex: 6, pointerEvents: "none", animation: "gl-burst 520ms ease-out forwards" }}>
          <Heart size={92} color="#fff" fill={PINK} strokeWidth={1.5} />
        </span>
      )}

      {card && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 16px calc(24px + env(safe-area-inset-bottom))", display: "flex", gap: 12, zIndex: 5 }}>
          <button data-testid="glimpse-skip" onClick={() => decide("left")} style={pill(false, v, p)}>
            <XIcon size={19} strokeWidth={2.4} />Not for me
          </button>
          <button data-testid="glimpse-love" onClick={() => decide("right")} style={pill(true, v, p)}>
            <Heart size={19} strokeWidth={2.4} fill={p > 0.6 ? "#fff" : "none"} />Love it
          </button>
        </div>
      )}

      {open && <Drawer c={open} dest={dest} onClose={() => setOpen(null)} />}
    </div>
  );
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  return frame ? createPortal(content, frame) : content;
}

function pill(love, v, p) {
  const glass = v === 1 || v === 3;
  const grow = love ? Math.max(0, p) : Math.max(0, -p);
  return {
    flex: 1, height: 54, borderRadius: 16, cursor: "pointer", fontFamily: "inherit", fontSize: 15.5, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    transform: `scale(${1 + grow * 0.06})`, transition: "transform 200ms ease, background 200ms ease",
    border: love ? "none" : glass ? "1px solid rgba(255,255,255,0.35)" : `1.5px solid ${C.div}`,
    background: love ? PINK : glass ? "rgba(255,255,255,0.14)" : "#fff",
    color: love ? "#fff" : glass ? "#fff" : C.head,
    backdropFilter: glass && !love ? "blur(14px)" : undefined, WebkitBackdropFilter: glass && !love ? "blur(14px)" : undefined,
    boxShadow: love ? `0 10px 24px rgba(227,27,83,${0.3 + grow * 0.25})` : "none",
  };
}

function RoundBtn({ children, label, onClick, dark, disabled }) {
  return (
    <button aria-label={label} onClick={onClick} disabled={disabled} style={{
      pointerEvents: "auto", width: 40, height: 40, borderRadius: "50%", flexShrink: 0, cursor: disabled ? "default" : "pointer",
      border: "none", display: "grid", placeItems: "center", opacity: disabled ? 0.35 : 1,
      background: dark ? "#fff" : "rgba(255,255,255,0.18)", color: dark ? C.head : "#fff",
      backdropFilter: dark ? undefined : "blur(12px)", WebkitBackdropFilter: dark ? undefined : "blur(12px)",
      boxShadow: dark ? "0 2px 10px rgba(12,16,40,0.1)" : "none",
    }}>{children}</button>
  );
}

// Reel (1): a big label rising on the side being swiped to.
function SideMark({ side, show }) {
  const love = side === "right";
  return (
    <div style={{
      position: "absolute", top: "30%", [side]: 22, display: "flex", flexDirection: "column", alignItems: love ? "flex-end" : "flex-start", gap: 6,
      opacity: Math.min(1, show * 1.4), transform: `translateY(${(1 - show) * 14}px) scale(${0.8 + show * 0.2})`, pointerEvents: "none",
    }}>
      {love ? <Heart size={52} color="#fff" fill="#fff" /> : <XIcon size={50} color="#fff" strokeWidth={2.6} />}
      <span style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>{love ? "Love it" : "Not for me"}</span>
    </div>
  );
}

// Stack (2) and Collect (4): a frosted label at the top of the card.
function GlassLabel({ p }) {
  const love = p > 0;
  const s = Math.min(1, Math.abs(p) * 1.3);
  if (s < 0.05) return null;
  return (
    // On the side of the card that stays on screen as it is dragged away.
    <div style={{ position: "absolute", top: 18, left: 18, right: 18, display: "flex", justifyContent: love ? "flex-start" : "flex-end", pointerEvents: "none" }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 18px", borderRadius: 22,
        background: love ? "rgba(227,27,83,0.88)" : "rgba(255,255,255,0.86)", color: love ? "#fff" : C.head,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", fontSize: 16, fontWeight: 800,
        opacity: s, transform: `scale(${0.75 + s * 0.25})`, boxShadow: "0 8px 20px rgba(12,16,40,0.2)",
      }}>
        {love ? <Heart size={18} fill="#fff" color="#fff" /> : <XIcon size={18} strokeWidth={2.6} />}
        {love ? "Love it" : "Not for me"}
      </span>
    </div>
  );
}

function Done({ dest, saved, dark, onWishlist, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 32px", textAlign: "center", animation: "gl-in 400ms ease" }}>
      <Heart size={44} color={PINK} fill={PINK} />
      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: dark ? "#fff" : C.head }}>That is {dest} for now</p>
      {saved > 0 && <p style={{ margin: 0, fontSize: 14, color: dark ? "rgba(255,255,255,0.75)" : C.sub }}>{saved} added to your wishlist</p>}
      <button onClick={onWishlist} style={{ marginTop: 6, height: 50, padding: "0 22px", borderRadius: 14, border: "none", background: PINK, color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>See your {dest} wishlist</button>
      <button onClick={onClose} style={{ border: "none", background: "none", color: dark ? "#fff" : C.sub, fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Close</button>
    </div>
  );
}

// ─── The drawer a tap opens ───
// A thing to do opens its own activity page, a stay its hotel page, both as a
// tall drawer over the deck so closing it puts you back on the same card.
function Drawer({ c, dest, onClose }) {
  const { isSaved, toggle } = useWishlist();
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t); }, []);
  const close = () => { setShown(false); setTimeout(onClose, 280); };
  const saved = isSaved(c.kind, dest, c.id);
  const onSave = () => toggle(c.kind, dest, c.id, c.meta);
  const hotelDetail = useMemo(() => (c.kind === "hotel" && c.hotel ? detailFromHotel(c.hotel) : null), [c]);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20 }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(12,16,40,0.5)", opacity: shown ? 1 : 0, transition: "opacity 280ms ease" }} />
      <div data-testid="glimpse-drawer" style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: "90%", borderRadius: "24px 24px 0 0", overflow: "hidden", background: "#fff",
        transform: shown ? "translateY(0)" : "translateY(100%)", transition: "transform 340ms cubic-bezier(0.22, 0.8, 0.24, 1)",
      }}>
        <div style={{ position: "absolute", top: 8, left: 0, right: 0, zIndex: 300, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(0,0,0,0.18)" }} />
        </div>
        {c.kind === "activity" && (
          <ActivityScreen activity={{ name: c.name, img: c.img }} city={c.city} country={dest} isBooked={false} saved={saved} onSave={onSave} onClose={close} />
        )}
        {c.kind === "hotel" && hotelDetail && (
          <div style={{ position: "absolute", inset: 0 }}>
            <HotelV3 hotel={hotelDetail} onBack={close} readOnly saved={saved} onSave={onSave} />
          </div>
        )}
        {c.kind === "region" && <RegionPeek c={c} saved={saved} onSave={onSave} onClose={close} />}
      </div>
    </div>
  );
}

function RegionPeek({ c, saved, onSave, onClose }) {
  return (
    <div className="hide-scrollbar" style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
      <div style={{ position: "relative", height: 300 }}>
        <img src={c.img} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", left: 14, top: 18, width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <XIcon size={18} color={C.head} />
        </button>
      </div>
      <div style={{ padding: "16px 18px 30px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ flex: 1, margin: 0, fontSize: 24, fontWeight: 800, color: C.head }}>{c.name}</p>
          <button onClick={onSave} aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Heart size={22} color={saved ? PINK : "#8A8F98"} fill={saved ? PINK : "none"} />
          </button>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#027A48" }}>
          {c.enjoyed ? `${c.enjoyed}% enjoyed` : ""}{c.stay ? <span style={{ color: C.sub, fontWeight: 600 }}>{c.enjoyed ? " · " : ""}{c.stay}</span> : null}
        </p>
        {c.blurb && <p style={{ margin: 0, fontSize: 15, lineHeight: "23px", color: "#414651" }}>{c.blurb}</p>}
      </div>
    </div>
  );
}
