import { useState, useMemo, useEffect } from "react";
import { useRows } from "../data/wishlistRows";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, Heart, List, Map as MapIcon, Plus, Minus, X as XIcon, ChevronRight, ChevronDown, Compass, Check } from "lucide-react";
import { C, destData } from "../data";
import { useDeals } from "../data/deals";
import { useWishlist, TAB_KINDS, KIND_LABEL } from "../data/wishlist";
import { regionByCity } from "../data/discoverData";
import { regionGuide } from "../data/regionGuide";
import { regionMeta } from "../data/saves";
import SaveHeart from "../components/SaveHeart";

// ─── The wishlist ───
//
// One screen for everything a couple hearted, filed by destination. The row of
// destinations up top is the folders; inside one, the tabs split what was saved
// by what it is (trips, hotels, things to do, food, shops). Regions are not a
// tab. They are a filter at the end of the tabs: pick one and the list narrows
// to that part of the destination, and the region itself shows as a card you
// can open or take off the list. A filter rather than a third row of chips,
// because the header was already two rows and the list is what people came for. A map sits behind the list for anything that is
// somewhere, which is regions and the sights we can place.

const PAD = 16;
const flagOf = (dest) => destData[dest]?.flag || "";

// ─── Pieces ───

function Chip({ on, onClick, children, heart }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999,
      border: `1px solid ${on ? C.p600 : C.div}`, background: on ? C.p600 : C.white, cursor: "pointer", fontFamily: "inherit",
      fontSize: 12.5, fontWeight: 700, color: on ? "#fff" : C.head, whiteSpace: "nowrap",
    }}>
      {heart && <Heart size={11} color={on ? "#fff" : C.p600} fill={on ? "#fff" : C.p600} />}
      {children}
    </button>
  );
}

function Row({ row, onRemove, onOpen }) {
  const clickable = !!onOpen;
  return (
    <div onClick={onOpen} role={clickable ? "button" : undefined} style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, border: `1px solid ${C.div}`, borderRadius: 14, padding: 10, cursor: clickable ? "pointer" : "default" }}>
      {row.img
        ? <img src={row.img} alt="" style={{ width: 66, height: 66, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 66, height: 66, borderRadius: 11, background: C.p100, display: "grid", placeItems: "center", flexShrink: 0, fontSize: 22 }}>{row.emoji || "♥"}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 14, fontWeight: 700, color: C.head, lineHeight: "18px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</p>
          <SaveHeart size={28} saved onToggle={onRemove} style={{ margin: "-5px -6px -5px 0" }} />
        </div>
        {row.sub && <p style={{ margin: "3px 0 0", fontSize: 12, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.sub}</p>}
        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: C.inact }}>{row.meta}</p>
      </div>
    </div>
  );
}

// A region, drawn the way the trip builder draws it on the choose-cities
// step: the photo down the left, the name with its heart, the region's own
// opening line, and how long people tend to stay. The same card in both places
// so a town looks like the same town wherever it turns up. If a couple filtered
// to a town they saved things in but never hearted itself, the heart is open
// and saves it.
function RegionCard({ dest, city, row, onSave, onRemove, onOpen }) {
  const r = regionByCity(dest, city);
  const g = regionGuide(dest, city);
  const img = row?.img || r?.img;
  const blurb = g?.lead || r?.blurb || (row ? "On your wishlist" : `Where your ${dest} saves are`);
  const stay = r ? (r.dayTrip ? "Day trip" : `${r.n || 2} to ${(r.n || 2) + 1} nights`) : null;
  return (
    <div onClick={onOpen} role="button" style={{
      display: "flex", gap: 12, padding: 11, cursor: "pointer",
      borderRadius: 16, background: C.white, border: `1px solid ${C.div}`,
      boxShadow: "0 1px 3px rgba(24,29,39,0.05)",
    }}>
      <div style={{ position: "relative", width: 78, minHeight: 78, alignSelf: "stretch", flexShrink: 0, borderRadius: 12, overflow: "hidden", background: "#F4F2F0" }}>
        {img && <img src={img} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 800, color: C.head, letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{city}</span>
          <SaveHeart size={28} saved={!!row} onToggle={row ? onRemove : onSave} style={{ margin: "-5px -6px -5px 0" }} />
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12, lineHeight: "17px", color: C.sub, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blurb}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 700, color: C.head, opacity: 0.72, whiteSpace: "nowrap" }}>
            {stay && <><span aria-hidden style={{ marginRight: 4, fontWeight: 800 }}>{r?.dayTrip ? "" : "~"}</span>{stay}</>}
          </span>
          <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 800, color: C.p600, display: "inline-flex", alignItems: "center", gap: 1 }}>
            View details <ChevronRight size={14} strokeWidth={2.6} />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── The region filter ───
// A button at the end of the tabs, and the sheet it opens. The button says
// which region is on, so the filter is never on without the screen saying so.
function RegionFilterButton({ region, onClick }) {
  const on = !!region;
  return (
    <button onClick={onClick} aria-haspopup="dialog" style={{
      flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, height: 28, padding: "0 10px", marginBottom: 6,
      borderRadius: 999, border: `1px solid ${on ? C.p600 : C.div}`, background: C.white,
      color: on ? C.p600 : C.head, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
    }}>
      {region || "All regions"} <ChevronDown size={14} />
    </button>
  );
}

function RegionSheet({ dest, options, total, region, onPick, onClose }) {
  const Option = ({ value, label, n, saved }) => {
    const on = region === value;
    return (
      <button onClick={() => onPick(value)} style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 48, padding: "0 4px",
        background: "none", border: "none", borderBottom: `1px solid ${C.div}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
      }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: on ? 800 : 600, color: C.head }}>{label}</span>
        {saved && <Heart size={13} color={C.p600} fill={C.p600} aria-label="Region on your wishlist" />}
        <span style={{ fontSize: 12, color: C.inact, minWidth: 18, textAlign: "right" }}>{n}</span>
        <span style={{ width: 20, display: "grid", placeItems: "center" }}>{on && <Check size={16} strokeWidth={3} color={C.p600} />}</span>
      </button>
    );
  };
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 700, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)", animation: "fadeInBg .2s ease-out" }} />
      <div style={{ position: "relative", width: "100%", maxHeight: "75%", overflowY: "auto", background: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: `18px ${PAD}px calc(18px + env(safe-area-inset-bottom))`, boxShadow: "0 -8px 28px rgba(0,0,0,0.2)", animation: "sheetSlideUp .25s ease-out" }}>
        <p style={{ fontSize: 17, fontWeight: 800, color: C.head, margin: "0 0 6px" }}>Regions in {dest}</p>
        <Option value={null} label="All regions" n={total} />
        {options.map((o) => <Option key={o.city} value={o.city} label={o.city} n={o.n} saved={o.saved} />)}
      </div>
    </div>
  );
}

function Empty({ title, body, cta, onCta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "56px 24px 40px", textAlign: "center" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.p100, display: "grid", placeItems: "center" }}>
        <Heart size={22} color={C.p600} />
      </div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.head }}>{title}</p>
      <p style={{ margin: 0, fontSize: 12.5, color: C.sub, maxWidth: 250, lineHeight: "18px" }}>{body}</p>
      {cta && (
        <button onClick={onCta} style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: C.p600, color: "#fff", borderRadius: 12, padding: "11px 16px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <Compass size={15} /> {cta}
        </button>
      )}
    </div>
  );
}

// ─── The map ───

const HEART = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="#fff" stroke="#fff" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

// A pin is a pink disc with the heart in it and the name beside it. A region
// gets the dark disc so the towns read as the frame and the sights as what is
// in them.
function pin(row, picked) {
  const disc = row.kind === "region" ? C.head : C.p600;
  const html = `<div style="display:flex;align-items:center;gap:5px;transform:translate(-11px,-11px);${picked ? "" : ""}">
    <span style="width:22px;height:22px;border-radius:50%;background:${disc};display:grid;place-items:center;box-shadow:0 2px 6px rgba(16,24,40,.3);border:2px solid #fff;flex-shrink:0">${HEART}</span>
    <span style="background:#fff;color:${C.head};font:700 11.5px/1 Figtree,sans-serif;padding:5px 8px;border-radius:999px;box-shadow:0 1px 5px rgba(16,24,40,.22);white-space:nowrap;${picked ? `outline:2px solid ${C.p600}` : ""}">${esc(row.name)}</span>
  </div>`;
  return L.divIcon({ html, className: "", iconSize: [0, 0], iconAnchor: [0, 0] });
}

function Zoom() {
  const map = useMap();
  const btn = { width: 34, height: 34, border: "none", background: C.white, cursor: "pointer", display: "grid", placeItems: "center", padding: 0 };
  return (
    <div style={{ position: "absolute", right: 12, top: 12, zIndex: 600, borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 14px rgba(16,24,40,0.18)" }}>
      <button onClick={() => map.zoomIn()} aria-label="Zoom in" style={{ ...btn, borderBottom: `1px solid ${C.div}` }}><Plus size={16} color={C.head} /></button>
      <button onClick={() => map.zoomOut()} aria-label="Zoom out" style={btn}><Minus size={16} color={C.head} /></button>
    </div>
  );
}

function SavedMap({ rows, onOpen }) {
  const pins = rows.filter((r) => r.pin);
  const [pick, setPick] = useState(null);
  const bounds = useMemo(() => {
    const lat = pins.map((p) => p.pin.lat);
    const lng = pins.map((p) => p.pin.lng);
    const pad = Math.max(0.05, (Math.max(...lat) - Math.min(...lat)) * 0.25);
    return [[Math.min(...lat) - pad, Math.min(...lng) - pad], [Math.max(...lat) + pad, Math.max(...lng) + pad]];
  }, [pins]);
  const chosen = pins.find((p) => p.key === pick);
  const unplaced = rows.length - pins.length;

  if (pins.length === 0) {
    return <Empty title="Nothing to put on a map yet" body="Regions and the sights we can place show up here. Trips and stays live in the list." />;
  }

  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
      <MapContainer bounds={bounds} style={{ height: "100%", width: "100%", background: "#AADAFF" }} attributionControl={false} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Zoom />
        {pins.map((p) => (
          <Marker key={p.key} position={[p.pin.lat, p.pin.lng]} icon={pin(p, pick === p.key)}
            zIndexOffset={pick === p.key ? 1000 : p.kind === "region" ? -200 : 0}
            eventHandlers={{ click: () => setPick(p.key) }} />
        ))}
      </MapContainer>

      {unplaced > 0 && (
        <span style={{ position: "absolute", left: 12, top: 12, zIndex: 600, background: C.white, borderRadius: 999, padding: "7px 11px", fontSize: 11.5, fontWeight: 600, color: C.sub, boxShadow: "0 1px 5px rgba(16,24,40,.18)" }}>
          {pins.length} on the map · {unplaced} without a place
        </span>
      )}

      {chosen && (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, zIndex: 600, background: C.white, borderRadius: 14, padding: 10, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(16,24,40,.22)" }}>
          {chosen.img && <img src={chosen.img} alt="" style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chosen.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: C.sub }}>{chosen.meta}</p>
          </div>
          {chosen.open && (
            <button onClick={() => onOpen(chosen)} style={{ border: "none", background: C.p600, color: "#fff", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Open</button>
          )}
          <button onClick={() => setPick(null)} aria-label="Close" style={{ border: "none", background: "none", padding: 4, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}><XIcon size={16} color={C.sub} /></button>
        </div>
      )}
    </div>
  );
}

// ─── The screen ───

export default function SavedWishlist() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { deals } = useDeals();
  const { items, destinations, counts, removeWithUndo, toggle } = useWishlist();

  // The folder. From the link that opened us, else the destination saved into
  // most recently, else everything.
  const wanted = params.get("dest");
  const dest = wanted && wanted !== "all" ? wanted : (wanted === "all" ? null : (destinations[0] || null));
  const setDest = (d) => { setParams(d ? { dest: d } : { dest: "all" }, { replace: true }); setRegion(null); setTab("all"); };

  const [tab, setTab] = useState("all");
  const [region, setRegion] = useState(null);
  const [view, setView] = useState("list");
  useEffect(() => { if (!dest) setView("list"); }, [dest]);

  const scoped = useMemo(() => dest ? items.filter((it) => it.dest === dest) : items, [items, dest]);
  const rows = useRows(scoped, deals);

  // Tabs with something in them. "All" always.
  const tabs = useMemo(() => {
    const n = {};
    scoped.forEach((it) => { n[it.kind] = (n[it.kind] || 0) + 1; });
    return [{ key: "all", label: "All", n: scoped.length }, ...TAB_KINDS.filter((k) => n[k]).map((k) => ({ key: k, label: KIND_LABEL[k], n: n[k] }))];
  }, [scoped]);
  useEffect(() => { if (!tabs.some((t) => t.key === tab)) setTab("all"); }, [tabs, tab]);

  // The region filter's options: every region saved here, then every town something
  // saved here is in. Saved ones first, with the heart.
  const regionChips = useMemo(() => {
    if (!dest) return [];
    const saved = rows.filter((r) => r.kind === "region").map((r) => r.id);
    const towns = rows.filter((r) => r.kind !== "region" && r.city).map((r) => r.city);
    const out = [...new Set([...saved, ...towns])];
    return out.map((city) => ({ city, saved: saved.includes(city), n: rows.filter((r) => (r.kind === "region" ? r.id : r.city) === city).length }));
  }, [rows, dest]);
  const regionRow = region ? rows.find((r) => r.kind === "region" && r.id === region) : null;

  // What the list shows: not the regions (they are cards of their own), narrowed by tab
  // and by region.
  const listed = useMemo(() => rows
    .filter((r) => r.kind !== "region")
    .filter((r) => tab === "all" || r.kind === tab)
    .filter((r) => !region || r.city === region), [rows, tab, region]);
  const mapRows = useMemo(() => rows
    .filter((r) => tab === "all" ? true : r.kind === tab || r.kind === "region")
    .filter((r) => !region || r.city === region || (r.kind === "region" && r.id === region)), [rows, tab, region]);

  // Grouped for the list. Inside a destination, by kind; across all of them,
  // by destination.
  // Saved regions are cards too, under "All", unless the region filter is
  // already showing one.
  const groups = useMemo(() => {
    const regions = rows.filter((r) => r.kind === "region");
    if (dest) {
      if (tab !== "all") return [{ key: tab, label: null, rows: listed }];
      const byKind = TAB_KINDS.map((k) => ({ key: k, label: KIND_LABEL[k], rows: listed.filter((r) => r.kind === k) }));
      return [{ key: "region", label: KIND_LABEL.region, rows: region ? [] : regions }, ...byKind].filter((g) => g.rows.length);
    }
    return destinations.map((d) => ({
      key: d, label: `${flagOf(d)} ${d}`.trim(),
      rows: [...(tab === "all" ? regions.filter((r) => r.dest === d) : []), ...listed.filter((r) => r.dest === d)],
    })).filter((g) => g.rows.length);
  }, [dest, tab, region, rows, listed, destinations]);

  // Removing happens at once, with an Undo on the toast, rather than behind a
  // "are you sure". A save costs nothing to make again and a confirm on every
  // heart gets tapped through without reading; the undo is the real safety.
  const askRemove = (row) => removeWithUndo(row.kind, row.dest, row.id);
  const [regionSheet, setRegionSheet] = useState(false);

  const openRow = (row) => { if (row.open) navigate(row.open); };
  const mapAvailable = !!dest && rows.some((r) => r.pin);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: C.white, borderBottom: `1px solid ${C.div}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `12px ${PAD}px 10px` }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 34, height: 34, borderRadius: "50%", background: C.bg, border: "none", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <ArrowLeft size={18} color={C.head} />
          </button>
          <h1 style={{ flex: 1, fontSize: 18, fontWeight: 800, color: C.head, margin: 0 }}>Wishlist</h1>
          {mapAvailable && (
            <div style={{ display: "flex", border: `1px solid ${C.div}`, borderRadius: 999, padding: 2, background: C.bg }}>
              {[["list", List, "List"], ["map", MapIcon, "Map"]].map(([k, Icon, label]) => (
                <button key={k} onClick={() => setView(k)} aria-label={label} aria-pressed={view === k} style={{ width: 34, height: 28, borderRadius: 999, border: "none", background: view === k ? C.white : "transparent", boxShadow: view === k ? "0 1px 3px rgba(16,24,40,.12)" : "none", display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <Icon size={15} color={view === k ? C.p600 : C.sub} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination folders */}
        {destinations.length > 0 && (
          <div className="hide-scrollbar" style={{ display: "flex", gap: 8, padding: `0 ${PAD}px 10px`, overflowX: "auto" }}>
            <Chip on={!dest} onClick={() => setDest(null)}>All <span style={{ opacity: 0.75, fontWeight: 600 }}>{counts.total}</span></Chip>
            {destinations.map((d) => (
              <Chip key={d} on={dest === d} onClick={() => setDest(d)}>
                {flagOf(d)} {d} <span style={{ opacity: 0.75, fontWeight: 600 }}>{counts.byDest[d]?.total || 0}</span>
              </Chip>
            ))}
          </div>
        )}

        {/* Kind tabs, and the region filter at their end */}
        {scoped.length > 0 && (tabs.length > 1 || (dest && regionChips.length > 0)) && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: `0 ${PAD}px` }}>
          <div className="hide-scrollbar" style={{ flex: 1, minWidth: 0, display: "flex", gap: 18, overflowX: "auto" }}>
            {tabs.length > 1 && tabs.map((t) => {
              const on = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ flexShrink: 0, background: "none", border: "none", padding: "6px 0 9px", cursor: "pointer", fontFamily: "inherit", borderBottom: `2px solid ${on ? C.p600 : "transparent"}`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: on ? C.head : C.sub }}>{t.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: on ? C.p600 : C.inact }}>{t.n}</span>
                </button>
              );
            })}
          </div>
          {dest && regionChips.length > 0 && <RegionFilterButton region={region} onClick={() => setRegionSheet(true)} />}
          </div>
        )}
      </div>

      {/* Body */}
      {view === "map" ? (
        <SavedMap rows={mapRows} onOpen={openRow} />
      ) : (
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: `14px ${PAD}px 24px` }}>
          {items.length === 0 ? (
            <Empty title="Your wishlist is empty" body="Tap the heart on any trip, region or thing to do and it will be kept here, by destination." cta="Explore destinations" onCta={() => navigate("/")} />
          ) : scoped.length === 0 ? (
            <Empty title={`Nothing saved for ${dest} yet`} body="Everything you heart while browsing lands here." cta={`Explore ${dest}`} onCta={() => navigate(`/destination/${encodeURIComponent(dest)}`)} />
          ) : (
            <>
              {region && (
                <div style={{ marginBottom: 14 }}>
                <RegionCard
                  dest={dest} city={region} row={regionRow}
                  onSave={() => toggle("region", dest, region, regionMeta(dest, region))}
                  onRemove={() => askRemove(regionRow)}
                  onOpen={() => navigate(`/destination/${encodeURIComponent(dest)}/region/${encodeURIComponent(region)}`)}
                />
                </div>
              )}
              {groups.length === 0 ? (
                <p style={{ margin: "24px 0", textAlign: "center", fontSize: 13, color: C.sub }}>
                  {region ? `Nothing else saved in ${region} yet.` : `Nothing in ${KIND_LABEL[tab]?.toLowerCase() || "this tab"} here yet.`}
                </p>
              ) : groups.map((g) => (
                <div key={g.key} style={{ marginBottom: 18 }}>
                  {g.label && <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: ".4px" }}>{g.label} <span style={{ color: C.inact }}>· {g.rows.length}</span></p>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {g.rows.map((row) => row.kind === "region"
                      ? <RegionCard key={row.key} dest={row.dest} city={row.id} row={row} onRemove={() => askRemove(row)} onOpen={() => openRow(row)} />
                      : <Row key={row.key} row={row} onRemove={() => askRemove(row)} onOpen={row.open ? () => openRow(row) : undefined} />)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {regionSheet && (
        <RegionSheet
          dest={dest} options={regionChips} total={scoped.length} region={region}
          onPick={(c) => { setRegion(c); setRegionSheet(false); }}
          onClose={() => setRegionSheet(false)}
        />
      )}
    </div>
  );
}
