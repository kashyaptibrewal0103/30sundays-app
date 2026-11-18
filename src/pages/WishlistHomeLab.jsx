import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, ArrowRight, ChevronRight, Map as MapIcon, Ticket, BedDouble, Utensils, ShoppingBag, Route as RouteIcon } from "lucide-react";
import { C, destData } from "../data";
import { useDeals } from "../data/deals";
import { useWishlist } from "../data/wishlist";
import { useRows } from "../data/wishlistRows";
import { cityCoords } from "../data/buildData";

// ─── Wishlist home, five samples ───
//
// The live home is one identical photo collage per destination with a count
// under it. Every board looks the same and says nothing about what is in it.
// Each sample here borrows a pattern the app already uses somewhere else, and
// gives a board something to say: what kinds of thing are in it, when it was
// last added to, where it is.
//
//   1  One leads, the rest follow   (the home lab's feature-first cards)
//   2  Swipe through the saves      (the stage home's photo strip)
//   3  A stack of cards             (the gift card art, stacked like a wallet)
//   4  What is inside               (the inset card, with the saves as faces)
//   5  The world map                (the board's own map, one level up)

const NAVY = C.head;
const PAD = 16;
const SCRIM = "linear-gradient(180deg, rgba(12,16,40,0) 35%, rgba(12,16,40,0.78) 100%)";
const ORDER = ["region", "activity", "hotel", "restaurant", "shop", "trip"];
const WORDS = {
  region: ["region", "regions"], activity: ["thing to do", "things to do"], hotel: ["hotel", "hotels"],
  restaurant: ["place to eat", "places to eat"], shop: ["shop", "shops"], trip: ["itinerary", "itineraries"],
};
const KIND_ICON = { region: MapIcon, activity: Ticket, hotel: BedDouble, restaurant: Utensils, shop: ShoppingBag, trip: RouteIcon };

const flagOf = (dest) => destData[dest]?.flag || "";
const boardPath = (dest) => `/saved/board/${encodeURIComponent(dest)}`;
const savesWord = (n) => `${n} ${n === 1 ? "save" : "saves"}`;

function ago(ts) {
  if (!ts) return "";
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return w === 1 ? "last week" : `${w} weeks ago`;
  const m = Math.floor(d / 30);
  return m <= 1 ? "last month" : `${m} months ago`;
}

// Everything a sample needs about one board, worked out once.
function useBoards() {
  const { deals } = useDeals();
  const { items, destinations } = useWishlist();
  const rows = useRows(items, deals);
  return useMemo(() => destinations.map((dest) => {
    const mine = rows.filter((r) => r.dest === dest);
    const counts = {};
    mine.forEach((r) => { counts[r.kind] = (counts[r.kind] || 0) + 1; });
    const kinds = ORDER.filter((k) => counts[k]).map((k) => ({ k, n: counts[k], word: WORDS[k][counts[k] === 1 ? 0 : 1] }));
    const imgs = [...new Set(mine.map((r) => r.img).filter(Boolean))];
    const latest = mine[0];
    // Where the board sits on a world map: the middle of the towns saved in
    // it, from the same coordinates the board's own map uses.
    const pts = [...new Set(mine.map((r) => (r.kind === "region" ? r.id : r.city)).filter(Boolean))].map((c) => cityCoords[c]).filter(Boolean);
    const centre = pts.length ? { lat: pts.reduce((a, p) => a + p.lat, 0) / pts.length, lng: pts.reduce((a, p) => a + p.lng, 0) / pts.length } : null;
    return {
      dest, rows: mine, kinds, imgs, centre,
      cover: imgs[0] || destData[dest]?.hero,
      latest, when: ago(latest?.savedAt),
      summary: kinds.map((x) => `${x.n} ${x.word}`).join(" · "),
    };
  }), [rows, destinations]);
}

// ─── The frame every sample sits in ───

function Frame({ v, children, ground = C.white }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: ground }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: `12px ${PAD}px 10px`, background: C.white, borderBottom: `1px solid ${C.div}` }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 34, height: 34, borderRadius: "50%", background: C.bg, border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={18} color={NAVY} />
        </button>
        <h1 style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 800, color: NAVY }}>Wishlist</h1>
        {/* Sample switcher, for comparing only. */}
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => navigate(`/saved/home/${n}`, { replace: true })} style={{
              width: 26, height: 26, borderRadius: 8, border: `1px solid ${n === v ? NAVY : C.div}`, background: n === v ? NAVY : C.white,
              color: n === v ? "#fff" : C.sub, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}>{n}</button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

const Img = ({ src, style }) => src
  ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />
  : <div style={{ width: "100%", height: "100%", background: "#EDEBE9", ...style }} />;

// ─── 1. One leads, the rest follow ───
// The board you added to last is the one you are most likely planning, so it
// gets the big card and the way in to planning. The rest wait in tiles.

function LeadFollow({ boards }) {
  const navigate = useNavigate();
  const [lead, ...rest] = boards;
  return (
    <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: `16px ${PAD}px 32px` }}>
      <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color: C.p600 }}>Picking up where you left off</p>
      <button onClick={() => navigate(boardPath(lead.dest))} style={{ position: "relative", display: "block", width: "100%", height: 300, padding: 0, border: "none", borderRadius: 24, overflow: "hidden", cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxShadow: "0 10px 28px rgba(24,29,39,0.16)" }}>
        <Img src={lead.cover} />
        <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
        <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(255,255,255,0.94)", borderRadius: 999, padding: "6px 11px", fontSize: 12, fontWeight: 700, color: NAVY }}>
          Added to {lead.when}
        </span>
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, color: "#fff" }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.4px" }}>{flagOf(lead.dest)} {lead.dest}</p>
          <p style={{ margin: "6px 0 14px", fontSize: 13, opacity: 0.88, lineHeight: "18px" }}>{lead.summary}</p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 40, padding: "0 16px", borderRadius: 999, background: C.p600, fontSize: 14, fontWeight: 800 }}>
            Plan {lead.dest} with my saves <ArrowRight size={16} />
          </span>
        </div>
      </button>

      {rest.length > 0 && (
        <>
          <p style={{ margin: "26px 0 12px", fontSize: 17, fontWeight: 800, color: NAVY }}>Your other boards</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {rest.map((b, i) => (
              <button key={b.dest} onClick={() => navigate(boardPath(b.dest))} style={{
                position: "relative", height: 170, padding: 0, border: "none", borderRadius: 18, overflow: "hidden", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                gridColumn: rest.length % 2 === 1 && i === rest.length - 1 ? "1 / 3" : "auto",
              }}>
                <Img src={b.cover} />
                <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
                <div style={{ position: "absolute", left: 12, right: 12, bottom: 11, color: "#fff" }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{flagOf(b.dest)} {b.dest}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, opacity: 0.85 }}>{savesWord(b.rows.length)}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 2. Swipe through the saves ───
// A board is its saves, so the card is a strip of them you can swipe without
// opening it. The count sits on the photo; the last thing added sits under it.

function SwipeCard({ b }) {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const strip = useRef(null);
  const photos = b.rows.filter((r) => r.img).slice(0, 6);
  const onScroll = () => {
    const el = strip.current;
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth));
  };
  const cur = photos[i];
  return (
    <div style={{ flexShrink: 0, borderRadius: 22, overflow: "hidden", background: C.white, border: `1px solid ${C.div}`, boxShadow: "0 4px 18px rgba(24,29,39,0.06)" }}>
      <div style={{ position: "relative", height: 220 }}>
        <div ref={strip} onScroll={onScroll} className="hide-scrollbar" style={{ display: "flex", height: "100%", overflowX: "auto", scrollSnapType: "x mandatory" }}>
          {(photos.length ? photos : [{ img: b.cover, key: "c" }]).map((p) => (
            <div key={p.key} style={{ flex: "0 0 100%", height: "100%", scrollSnapAlign: "start" }}><Img src={p.img} /></div>
          ))}
        </div>
        <div style={{ position: "absolute", inset: 0, background: SCRIM, pointerEvents: "none" }} />
        <span style={{ position: "absolute", top: 12, right: 12, background: "#fff", borderRadius: 12, padding: "6px 10px", fontSize: 12, color: C.sub, pointerEvents: "none" }}>
          <b style={{ fontSize: 15, color: NAVY }}>{b.rows.length}</b> {b.rows.length === 1 ? "save" : "saves"}
        </span>
        {cur && (
          <p style={{ position: "absolute", left: 14, bottom: 26, right: 60, margin: 0, color: "#fff", fontSize: 13, fontWeight: 700, pointerEvents: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cur.name}</p>
        )}
        {photos.length > 1 && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "flex", justifyContent: "center", gap: 5, pointerEvents: "none" }}>
            {photos.map((p, n) => <span key={p.key} style={{ width: n === i ? 16 : 6, height: 6, borderRadius: 3, background: n === i ? "#fff" : "rgba(255,255,255,0.55)", transition: "width 200ms" }} />)}
          </div>
        )}
      </div>
      <button onClick={() => navigate(boardPath(b.dest))} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px 13px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: NAVY }}>{flagOf(b.dest)} {b.dest}</p>
          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Last added <b style={{ color: NAVY, fontWeight: 700 }}>{b.latest?.name}</b> {b.when}
          </p>
        </div>
        <ChevronRight size={20} color={C.inact} />
      </button>
    </div>
  );
}

const SwipeList = ({ boards }) => (
  <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: `16px ${PAD}px 32px`, display: "flex", flexDirection: "column", gap: 16 }}>
    {boards.map((b) => <SwipeCard key={b.dest} b={b} />)}
  </div>
);

// ─── 3. A stack of cards ───
// Each board is a card in a stack, like the gift cards. The stack shows every
// destination at once in one screen; tap one and it slides open with what is
// in it, tap again to go in.

const CARD_H = 214;
const PEEK = 66;

function Stack({ boards }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(0);
  return (
    <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: `18px ${PAD}px 32px` }}>
      <p style={{ margin: "0 0 14px", fontSize: 13, color: C.sub }}>{boards.length} destinations · tap a card to open it</p>
      {boards.map((b, i) => {
        const isOpen = i === open;
        // A card overlaps the one above it unless the one above is open.
        const overlap = i > 0 && i - 1 !== open;
        return (
          <button key={b.dest} onClick={() => (isOpen ? navigate(boardPath(b.dest)) : setOpen(i))} style={{
            position: "relative", display: "block", width: "100%", height: CARD_H, padding: 0, border: "none", borderRadius: 22, overflow: "hidden",
            marginTop: i === 0 ? 0 : overlap ? -(CARD_H - PEEK) : 12, transition: "margin-top 320ms cubic-bezier(0.4,0,0.2,1)",
            cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxShadow: "0 -6px 18px rgba(12,16,40,0.18)", zIndex: i,
          }}>
            <Img src={b.cover} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,16,40,0.62) 0%, rgba(12,16,40,0) 42%, rgba(12,16,40,0) 50%, rgba(12,16,40,0.7) 100%)" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: PEEK, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", color: "#fff" }}>
              <p style={{ flex: 1, margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-0.3px" }}>{flagOf(b.dest)} {b.dest}</p>
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.92 }}>{savesWord(b.rows.length)}</span>
            </div>
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, display: "flex", alignItems: "flex-end", gap: 12, color: "#fff", opacity: isOpen ? 1 : 0, transition: "opacity 200ms" }}>
              <p style={{ flex: 1, margin: 0, fontSize: 12.5, lineHeight: "18px", opacity: 0.9 }}>{b.summary}</p>
              <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px", borderRadius: 999, background: "#fff", color: NAVY, fontSize: 13, fontWeight: 800 }}>
                Open <ArrowRight size={14} />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── 4. What is inside ───
// The card says what the board holds before you open it: the saves themselves
// as small faces, and a count for each kind with the same icons the app uses.

function InsideCard({ b }) {
  const navigate = useNavigate();
  const faces = b.rows.filter((r) => r.img).slice(0, 5);
  const more = b.rows.length - faces.length;
  return (
    <button onClick={() => navigate(boardPath(b.dest))} style={{ flexShrink: 0, display: "block", width: "100%", padding: 7, border: `1px solid ${C.div}`, borderRadius: 22, background: C.white, cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxShadow: "0 4px 18px rgba(24,29,39,0.06)" }}>
      <div style={{ position: "relative", height: 150, borderRadius: 16, overflow: "hidden" }}>
        <Img src={b.cover} />
        {/* The saves, overlapping, on the bottom edge of the photo. */}
        <div style={{ position: "absolute", left: 10, bottom: 10, display: "flex" }}>
          {faces.map((f, n) => (
            <span key={f.key} style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", border: "2px solid #fff", marginLeft: n ? -9 : 0, boxShadow: "0 2px 6px rgba(0,0,0,0.18)" }}><Img src={f.img} /></span>
          ))}
          {more > 0 && <span style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #fff", marginLeft: -9, background: NAVY, color: "#fff", display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800 }}>+{more}</span>}
        </div>
      </div>
      <div style={{ padding: "11px 8px 6px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <p style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 800, color: NAVY }}>
            {flagOf(b.dest)} {b.dest} <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 400, color: C.sub }}>{savesWord(b.rows.length)}</span>
          </p>
          <span style={{ fontSize: 12, color: C.inact }}>{b.when}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 9 }}>
          {b.kinds.map(({ k, n, word }) => {
            const Icon = KIND_ICON[k];
            return (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.sub }}>
                <Icon size={14} color={C.sub} strokeWidth={2} /> <b style={{ color: NAVY }}>{n}</b> {word}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}

const InsideList = ({ boards }) => (
  <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: `16px ${PAD}px 32px`, display: "flex", flexDirection: "column", gap: 14 }}>
    {boards.map((b) => <InsideCard key={b.dest} b={b} />)}
  </div>
);

// ─── 5. The world map ───
// The boards are already maps inside, so the home is the map one level up:
// every destination you are dreaming of, as a photo pin where it is. The cards
// below swipe in step with the pins.

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
const photoPin = (b, on) => L.divIcon({
  className: "",
  iconSize: [0, 0], iconAnchor: [0, 0],
  html: `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center">
    <div style="position:relative;width:${on ? 58 : 46}px;height:${on ? 58 : 46}px;border-radius:50%;border:3px solid ${on ? C.p600 : "#fff"};overflow:hidden;box-shadow:0 4px 12px rgba(16,24,40,.3);background:#eee;transition:all .2s">
      <img src="${esc(b.cover || "")}" style="width:100%;height:100%;object-fit:cover;display:block" />
    </div>
    <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${on ? C.p600 : "#fff"};margin-top:-1px"></div>
    <span style="margin-top:3px;font:800 12px/1 Figtree,sans-serif;color:${NAVY};white-space:nowrap;text-shadow:0 0 2px #fff,0 0 3px #fff,1px 1px 1px #fff,-1px -1px 1px #fff">${esc(b.dest)}</span>
  </div>`,
});

function FitWorld({ boards }) {
  const map = useMap();
  useEffect(() => {
    const pts = boards.filter((b) => b.centre).map((b) => [b.centre.lat, b.centre.lng]);
    if (pts.length) map.fitBounds(pts, { padding: [48, 48] });
  }, [map, boards]);
  return null;
}

function WorldMap({ boards }) {
  const navigate = useNavigate();
  const [on, setOn] = useState(0);
  const rail = useRef(null);
  const placed = boards.filter((b) => b.centre);
  const pick = (i) => {
    setOn(i);
    const el = rail.current?.children[i];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };
  const onScroll = () => {
    const el = rail.current;
    if (!el) return;
    const w = el.children[0]?.clientWidth + 10 || 1;
    const i = Math.round(el.scrollLeft / w);
    if (i !== on && i < placed.length) setOn(i);
  };
  return (
    <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
      <MapContainer center={[5, 110]} zoom={3} style={{ position: "absolute", inset: 0, background: "#AADAFF" }} attributionControl={false} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitWorld boards={placed} />
        {placed.map((b, i) => (
          <Marker key={b.dest} position={[b.centre.lat, b.centre.lng]} icon={photoPin(b, i === on)} zIndexOffset={i === on ? 500 : 0} eventHandlers={{ click: () => pick(i) }} />
        ))}
      </MapContainer>
      <div style={{ position: "absolute", top: 12, left: PAD, zIndex: 500, background: "#fff", borderRadius: 999, padding: "7px 13px", fontSize: 13, color: C.sub, boxShadow: "0 2px 10px rgba(16,24,40,0.15)" }}>
        <b style={{ color: NAVY }}>{boards.length}</b> destinations on your wishlist
      </div>
      <div ref={rail} onScroll={onScroll} className="hide-scrollbar" style={{ position: "absolute", left: 0, right: 0, bottom: 18, zIndex: 500, display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", padding: `0 ${PAD}px` }}>
        {placed.map((b, i) => (
          <button key={b.dest} onClick={() => (i === on ? navigate(boardPath(b.dest)) : pick(i))} style={{
            flex: "0 0 82%", scrollSnapAlign: "center", display: "flex", gap: 12, alignItems: "center", padding: 8, border: "none", borderRadius: 18,
            background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(16,24,40,0.2)",
            outline: i === on ? `2px solid ${C.p600}` : "none",
          }}>
            <span style={{ width: 78, height: 78, borderRadius: 13, overflow: "hidden", flexShrink: 0 }}><Img src={b.cover} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: NAVY }}>{flagOf(b.dest)} {b.dest}</span>
              <span style={{ display: "block", marginTop: 3, fontSize: 12, color: C.sub, lineHeight: "16px" }}>{b.summary}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12.5, fontWeight: 800, color: C.p600 }}>Open board <ArrowRight size={13} /></span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Route ───

export default function WishlistHomeLab() {
  const { v } = useParams();
  const n = Math.min(5, Math.max(1, Number(v) || 1));
  const boards = useBoards();
  if (!boards.length) return <Frame v={n}><p style={{ padding: 24, color: C.sub }}>Nothing saved yet.</p></Frame>;
  const Body = { 1: LeadFollow, 2: SwipeList, 3: Stack, 4: InsideList, 5: WorldMap }[n];
  return <Frame v={n}><Body boards={boards} /></Frame>;
}
