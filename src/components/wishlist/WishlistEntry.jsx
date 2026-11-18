import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Hand, Heart, X as XIcon } from "lucide-react";
import { C, destinations as ALL_DESTS } from "../../data";
import { useWishlist } from "../../data/wishlist";
import { regionByCity, activityById } from "../../data/discoverData";
import { regionFood } from "../../data/regionFood";
import { KindDisc } from "../../data/wishlistKinds";
import GlimpsesScreen, { buildGlimpses } from "./Glimpses";

// ─── The wishlist, as a way in ───
//
// Chosen on the wishlist canvas: E1 on home (under Why we're the perfect
// match), E4 on the destination page (under the vibes), each with an empty
// state, and both opening "Choose what you like", a deck of regions, things to
// do, stays and places to eat that you swipe right to wishlist or left if it is not for them.

const TINT = "#FFF1F3";
const KINDS = ["region", "hotel", "activity", "restaurant"];
const WORDS = {
  region: ["region", "regions"], hotel: ["stay", "stays"], activity: ["thing to do", "things to do"], restaurant: ["place to eat", "places to eat"],
};

// A saved item's photo: what was kept when it was saved, else the live data.
function imgOf(it) {
  if (it.img) return it.img;
  if (it.kind === "region") return regionByCity(it.dest, it.id)?.img || null;
  if (it.kind === "activity") return activityById(it.dest, it.id)?.img || null;
  if (it.kind === "restaurant" && it.city) return regionFood(it.dest, it.city).find((f) => f.name === it.name)?.img || null;
  return null;
}

function useDestSaves(dest) {
  const { forDest } = useWishlist();
  return useMemo(() => {
    const items = forDest(dest).filter((it) => KINDS.includes(it.kind)).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    const counts = Object.fromEntries(KINDS.map((k) => [k, items.filter((it) => it.kind === k).length]));
    const photos = items.map(imgOf).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
    return { items, counts, photos, total: items.length };
  }, [forDest, dest]);
}

// "5 regions · 2 stays", each with its kind's coloured disc. Kinds with
// nothing saved are left out rather than shown as zero.
function KindCounts({ counts, size = 20 }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
      {KINDS.filter((k) => counts[k] > 0).map((k) => (
        <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: C.head }}>
          <KindDisc kind={k} size={size} />
          {counts[k]} {WORDS[k][counts[k] === 1 ? 0 : 1]}
        </span>
      ))}
    </div>
  );
}

const outlineBtn = {
  height: 46, borderRadius: 12, border: `1.5px solid ${C.p600}`, background: C.white, color: C.p600,
  fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
};

function DestChip({ name, count, on, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      flexShrink: 0, height: 36, padding: "0 13px", borderRadius: 18, cursor: "pointer", fontFamily: "inherit",
      border: `1.5px solid ${on ? C.p600 : C.div}`, background: on ? TINT : C.white,
      display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: C.head, whiteSpace: "nowrap",
    }}>
      {name}
      {count > 0 && <span style={{ fontWeight: 600, color: on ? C.p600 : C.sub }}>{count}</span>}
    </button>
  );
}

// Three photos, one large and two stacked, from what was saved last.
function Collage({ photos }) {
  const [a, b, c] = photos;
  const img = { width: "100%", objectFit: "cover", display: "block", background: C.bg };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "74px 74px", gap: 4, borderRadius: 14, overflow: "hidden" }}>
      <img src={a} alt="" style={{ ...img, gridRow: "span 2", height: 152 }} />
      {b ? <img src={b} alt="" style={{ ...img, height: 74 }} /> : <span style={{ background: C.bg }} />}
      {c ? <img src={c} alt="" style={{ ...img, height: 74 }} /> : <span style={{ background: C.bg }} />}
    </div>
  );
}

// ─── One card, on home and on a destination page ───
// Home (E1) adds the destination chips; the destination page (E4) is the same
// card for its own destination, without them. With nothing saved it peeks at
// three picks you can heart right there, and its button says what comes next:
// glimpses of the place, in a deck you swipe.
function WishlistCard({ testid, style, headStyle, title, seeAll, chips, dest, empty }) {
  const navigate = useNavigate();
  const s = useDestSaves(dest);
  const [choosing, setChoosing] = useState(false);
  // ?t=1 to 4 picks the teaser shown with nothing saved (see Teaser).
  const [search] = useSearchParams();
  const teaser = Number(search.get("t")) || 1;
  return (
    // The title sits outside the box, set like every other section title on
    // the page it is on (headStyle), so the card reads as one of the page's
    // sections. The pale pink box is what says wishlist.
    <div data-testid={testid} style={{ display: "flex", flexDirection: "column", gap: 12, ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#181E4C", letterSpacing: "-0.4px", ...headStyle }}>{title}</h2>
        {!empty && (
          <button onClick={() => navigate(seeAll)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: C.p600, flexShrink: 0 }}>See all</button>
        )}
      </div>
      <div style={{ padding: 16, borderRadius: 18, background: TINT, border: `1px solid ${C.p100}`, display: "flex", flexDirection: "column", gap: 12 }}>
      {chips}
      {empty ? (
        <Teaser key={dest} dest={dest} t={teaser} onOpen={() => setChoosing(true)} />
      ) : (
        <button onClick={() => navigate(`/saved/board/${encodeURIComponent(dest)}`)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", flexDirection: "column", gap: 12 }}>
          <Collage photos={s.photos} />
          <KindCounts counts={s.counts} />
        </button>
      )}
      <button onClick={() => setChoosing(true)} style={outlineBtn}>
        {empty ? <>Glimpses of {dest}<ChevronRight size={17} /></> : <><Hand size={16} />Swipe through more of {dest}</>}
      </button>
      </div>
      {choosing && <ChooseSheet dest={dest} onClose={() => setChoosing(false)} />}
    </div>
  );
}

// ─── Home (E1) ───
export function HomeWishlistCard({ forceEmpty = false, headStyle }) {
  const { destinations, forDest } = useWishlist();
  const saved = forceEmpty ? [] : destinations.filter((d) => forDest(d).some((it) => KINDS.includes(it.kind)));
  const [pick, setPick] = useState(null);
  const empty = saved.length === 0;
  const dest = pick || (empty ? ALL_DESTS[0]?.name : saved[0]);
  const names = empty ? ALL_DESTS.map((d) => d.name) : saved;
  return (
    <WishlistCard
      key={dest}
      testid="home-wishlist"
      style={{ margin: "32px 18px 0" }}
      headStyle={headStyle}
      title={empty ? "Start your wishlist" : "Your wishlist"}
      seeAll="/saved"
      dest={dest}
      empty={empty}
      chips={(
        <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
          {names.map((d) => (
            <DestChip key={d} name={d} count={empty ? 0 : forDest(d).filter((it) => KINDS.includes(it.kind)).length} on={d === dest} onClick={() => setPick(d)} />
          ))}
        </div>
      )}
    />
  );
}

// ─── Destination page (E4) ───
export function DestWishlistBand({ dest, forceEmpty = false, headStyle, style }) {
  const s = useDestSaves(dest);
  const empty = forceEmpty || s.total === 0;
  return (
    <WishlistCard
      testid="dest-wishlist"
      style={{ margin: "24px 0 0", ...style }}
      headStyle={headStyle}
      title={empty ? `Start your ${dest} wishlist` : `Your ${dest} wishlist`}
      seeAll={`/saved/board/${encodeURIComponent(dest)}`}
      dest={dest}
      empty={empty}
    />
  );
}

// ─── The deck, opened from anywhere ───
// ?v=1 to 4 picks how the swipe looks (see Glimpses); Collect (4) by default.
export function ChooseSheet({ dest, onClose }) {
  const [search] = useSearchParams();
  return <GlimpsesScreen dest={dest} variant={Number(search.get("v")) || 4} onClose={onClose} />;
}

// ─── The teaser: what "Glimpses" means, before it is opened ───
// Four ways to say "swipe through the place", each a moving picture of the
// deck itself rather than three loose picks (?t=1 to 4):
//   1 Fan      a small fanned stack whose top card swipes on its own, with
//              one line saying what to do (the one in use)
//   2 Demo     one card that plays a swipe right, then a swipe left, in a loop
//   3 Strip    a slow-moving row of cards under a swipe hint
//   4 Hero     one large photo with Skip and Love it at its edges
const TEASE_CSS = `
@keyframes ts-wag{0%,12%,100%{transform:translateX(0) rotate(0)}26%,34%{transform:translateX(18px) rotate(7deg)}50%,58%{transform:translateX(0) rotate(0)}72%,80%{transform:translateX(-16px) rotate(-6deg)}92%{transform:translateX(0) rotate(0)}}
@keyframes ts-love{0%,18%,42%,100%{opacity:0}26%,34%{opacity:1}}
@keyframes ts-skip{0%,64%,88%,100%{opacity:0}72%,80%{opacity:1}}
@keyframes ts-cycle{0%{opacity:0;transform:scale(.94)}6%{opacity:1;transform:scale(1)}26%{opacity:1;transform:translateX(0) rotate(0)}33%{opacity:0;transform:translateX(130%) rotate(14deg)}100%{opacity:0;transform:translateX(130%) rotate(14deg)}}
@keyframes ts-cycleL{0%{opacity:0;transform:scale(.94)}6%{opacity:1;transform:scale(1)}26%{opacity:1;transform:translateX(0) rotate(0)}33%{opacity:0;transform:translateX(-130%) rotate(-14deg)}100%{opacity:0;transform:translateX(-130%) rotate(-14deg)}}
@keyframes ts-badge{0%,18%{opacity:0;transform:scale(.6)}24%,30%{opacity:1;transform:scale(1)}33%,100%{opacity:0}}
@keyframes ts-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes ts-hand{0%,100%{transform:translateX(-26px)}50%{transform:translateX(26px)}}
@keyframes ts-drift{0%{transform:scale(1.06) translate(-1.5%,0)}100%{transform:scale(1.16) translate(1.5%,1%)}}
@keyframes ts-pulse{0%,100%{opacity:.55}50%{opacity:1}}
`;

function useTeaserCards(dest) {
  // Distinct photos only: two things to do can share a stock picture.
  return useMemo(() => {
    const seen = new Set();
    return buildGlimpses(dest).filter((c) => c.kind !== "hotel" && !seen.has(c.img) && seen.add(c.img)).slice(0, 6);
  }, [dest]);
}

const label = (love) => ({
  display: "inline-flex", alignItems: "center", gap: 5, height: 28, padding: "0 11px", borderRadius: 14,
  background: love ? C.p600 : "rgba(255,255,255,0.92)", color: love ? "#fff" : C.head, fontSize: 12.5, fontWeight: 800,
  boxShadow: "0 4px 12px rgba(12,16,40,0.18)",
});

function Teaser({ dest, t, onOpen }) {
  const cards = useTeaserCards(dest);
  if (!cards.length) return null;
  const T = [Fan, Demo, Strip, Hero][(t - 1) % 4] || Fan;
  return (
    <button data-testid="glimpse-teaser" onClick={onOpen} aria-label={`Glimpses of ${dest}`} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "block", width: "100%" }}>
      <style>{TEASE_CSS}</style>
      <T cards={cards} dest={dest} />
    </button>
  );
}

const photo = (src, extra = {}) => ({ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", ...extra });

// Fan (1), the one in use: a small stack beside one plain line on what to do.
// The top card leans right with a heart, then left with a cross, and settles.
function Fan({ cards, dest }) {
  const [a, b, c] = cards;
  const box = (rot, x, z) => ({
    position: "absolute", left: 22 + x, top: 8, width: 78, height: 104, borderRadius: 12, overflow: "hidden",
    transform: `rotate(${rot}deg)`, zIndex: z, background: C.bg, boxShadow: "0 6px 16px rgba(12,16,40,0.14)", border: "2px solid #fff",
  });
  const mark = (love) => ({
    position: "absolute", top: 6, [love ? "left" : "right"]: 6, width: 24, height: 24, borderRadius: "50%",
    display: "grid", placeItems: "center", background: love ? C.p600 : "#fff", boxShadow: "0 2px 6px rgba(12,16,40,0.2)",
    animation: `${love ? "ts-love" : "ts-skip"} 4.8s infinite`, opacity: 0,
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 2px" }}>
      <div style={{ position: "relative", width: 124, height: 122, flexShrink: 0 }}>
        <div style={box(-9, -16, 1)}>{c && <img src={c.img} alt="" style={photo()} />}</div>
        <div style={box(9, 16, 1)}>{b && <img src={b.img} alt="" style={photo()} />}</div>
        <div style={{ ...box(0, 0, 2), animation: "ts-wag 4.8s cubic-bezier(0.45,0,0.2,1) infinite" }}>
          <img src={a.img} alt="" style={photo()} />
          <span style={mark(true)}><Heart size={12} color="#fff" fill="#fff" /></span>
          <span style={mark(false)}><XIcon size={12} color={C.head} strokeWidth={3} /></span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.head, lineHeight: 1.25 }}>Swipe through {dest}</p>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: "19px" }}>Places, stays and things to do, one at a time. Swipe right on what you love to save it.</p>
      </div>
    </div>
  );
}

function Demo({ cards }) {
  const three = cards.slice(0, 3);
  return (
    <div style={{ position: "relative", height: 220, borderRadius: 16, overflow: "hidden", background: "#1A1F3A" }}>
      {three.map((c, i) => (
        <div key={c.key} style={{ position: "absolute", inset: 0, opacity: 0, animation: `${i % 2 ? "ts-cycleL" : "ts-cycle"} 9s cubic-bezier(0.45,0,0.2,1) ${i * 3}s infinite` }}>
          <img src={c.img} alt="" style={photo()} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,16,40,0) 45%,rgba(12,16,40,.8))" }} />
          <span style={{ position: "absolute", left: 14, bottom: 14, right: 14, fontSize: 17, fontWeight: 800, color: "#fff" }}>{c.name}</span>
          <span style={{ position: "absolute", top: 14, [i % 2 ? "right" : "left"]: 14, ...label(!(i % 2)), opacity: 0, animation: `ts-badge 9s ${i * 3}s infinite` }}>
            {i % 2 ? <><XIcon size={13} strokeWidth={2.6} />Not for me</> : <><Heart size={13} fill="#fff" />Love it</>}
          </span>
        </div>
      ))}
      <span style={{ position: "absolute", left: "50%", top: "42%", marginLeft: -22, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", animation: "ts-hand 1.5s ease-in-out infinite" }}>
        <Hand size={22} color="#fff" />
      </span>
    </div>
  );
}

function Strip({ cards, dest }) {
  const row = [...cards, ...cards];
  return (
    <div style={{ position: "relative", height: 196, margin: "0 -16px", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, width: "max-content", paddingLeft: 16, animation: "ts-marq 22s linear infinite" }}>
        {row.map((c, i) => (
          <div key={i} style={{ position: "relative", width: 118, height: 160, flexShrink: 0, borderRadius: 14, overflow: "hidden", background: C.bg, transform: `rotate(${i % 2 ? 2 : -2}deg)`, marginTop: 14 }}>
            <img src={c.img} alt="" style={photo()} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,16,40,0) 50%,rgba(12,16,40,.75))" }} />
            <span style={{ position: "absolute", left: 8, right: 8, bottom: 8, fontSize: 11.5, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{c.name}</span>
            <Heart size={15} color="#fff" style={{ position: "absolute", top: 8, right: 8, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.4))" }} />
          </div>
        ))}
      </div>
      <span style={{ position: "absolute", left: "50%", top: 68, transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 20, background: "rgba(12,16,40,0.78)", color: "#fff", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        <span style={{ display: "inline-flex", animation: "ts-hand 1.6s ease-in-out infinite" }}><Hand size={17} /></span>
        Swipe through {dest}
      </span>
    </div>
  );
}

function Hero({ cards }) {
  const c = cards[0];
  return (
    <div style={{ position: "relative", height: 228, borderRadius: 16, overflow: "hidden", background: "#1A1F3A" }}>
      <img src={c.img} alt="" style={photo({ animation: "ts-drift 8s ease-in-out infinite alternate" })} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(12,16,40,.55) 0%, rgba(12,16,40,0) 30%, rgba(12,16,40,0) 70%, rgba(227,27,83,.55) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,16,40,0) 50%,rgba(12,16,40,.7))" }} />
      <span style={{ position: "absolute", left: 14, top: "40%", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "#fff", fontSize: 12, fontWeight: 800, animation: "ts-pulse 2.4s ease-in-out infinite" }}>
        <XIcon size={24} strokeWidth={2.6} />Not for me
      </span>
      <span style={{ position: "absolute", right: 14, top: "40%", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "#fff", fontSize: 12, fontWeight: 800, animation: "ts-pulse 2.4s ease-in-out 1.2s infinite" }}>
        <Heart size={24} fill="#fff" />Love it
      </span>
      <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{c.name}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>Tap to start swiping</span>
      </div>
    </div>
  );
}
