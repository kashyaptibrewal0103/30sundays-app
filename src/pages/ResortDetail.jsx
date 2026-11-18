import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft, Star, ChevronDown, ChevronUp, ChevronRight,
  Camera, Check, MapPin, Globe, Plane, Ship, Waves, FileText, UtensilsCrossed, X as XIcon, Play,
  Calendar, Phone, MessageCircle,
} from "lucide-react";
import { C } from "../data";
import { getResortById, getRoomSplitLabel, resorts, MEAL_INFO } from "../data/resortData";
import { useWishlist } from "../data/wishlist";
import ResortCard from "../components/ResortCard";
import SaveHeart from "../components/SaveHeart";

// Demo hero video used until each resort has its own clip.
const HERO_VIDEO = "https://thirtysundays-prod-content.fra1.digitaloceanspaces.com/welcome/Indonesia.mp4";

const DAY_MS = 86400000;
const num = (s) => Number(String(s ?? 0).replace(/,/g, "")) || 0;
const pad2 = (n) => String(n).padStart(2, "0");

// Documents shown for every resort (view-only; open the resort website).
const RESORT_DOCS = [
  { title: "Water sports guide", Icon: Waves },
  { title: "Resort brochure", Icon: FileText },
  { title: "Food & beverage menu", Icon: UtensilsCrossed },
];

// What's-included accordion, in display order, with friendly labels.
const INCLUSION_SECTIONS = [
  { key: "standard", label: "General Inclusions" },
  { key: "special", label: "Special Inclusions" },
  { key: "honeymoon", label: "Honeymoon Specials" },
  { key: "birthday", label: "Birthday Specials" },
  { key: "anniversary", label: "Anniversary Specials" },
];

// Shared look, matched to HotelDetailScreen: 17px section titles, 24px rhythm,
// one bordered container per section with hairline-divided rows.
const sectionStyle = { marginTop: 24, padding: "0 16px" };
const titleStyle = { fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 12px" };
const groupStyle = { borderRadius: 14, border: `1px solid ${C.div}`, overflow: "hidden", background: C.white };
const rowBase = { display: "flex", alignItems: "center", gap: 12, padding: "13px 14px" };

function transferLabel(type) {
  if (type === "seaplane") return "Seaplane";
  if (type === "speedboat") return "Speedboat";
  return "Flight + Speedboat";
}

// Small "B" mark for the Booking.com rating (matches the shared hotel card).
function BookingMark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: "#003580", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>B</span>
  );
}

export default function ResortDetail() {
  const { resortId } = useParams();
  const [params] = useSearchParams();
  const wishlist = useWishlist();
  const resort = getResortById(resortId);

  // Choices carried in from the quote (or sensible defaults when browsing).
  const paramNights = Number(params.get("nights")) === 4 ? 4 : 3;
  const paramPax = Number(params.get("pax")) || 2;
  const paramDate = params.get("date") || null;
  const paramMeal = params.get("meal") || "";

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [openIncl, setOpenIncl] = useState({});
  const [roomView, setRoomView] = useState(null); // { name, imgs } for the room lightbox
  const [showGallery, setShowGallery] = useState(false); // full-screen hero gallery (video + photos)
  const [selectedNights, setSelectedNights] = useState(paramNights);
  const [startDate, setStartDate] = useState(paramDate);
  const [travellers] = useState(paramPax);
  const [comboId, setComboId] = useState(null); // null → the night config's default
  const [mealId, setMealId] = useState(null);   // null → resolved from prefs / base
  const [showComboPicker, setShowComboPicker] = useState(false);
  const [showBook, setShowBook] = useState(false);

  if (!resort) return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Resort not found</div>;

  // ── Stay: night config → curated combos → the chosen combo ──
  const nightConfig = resort.night_configs.find(c => c.nights === selectedNights) || resort.night_configs[0];
  const combos = nightConfig.combos;
  const combo = combos.find(c => c.combo_id === comboId) || combos.find(c => c.is_default) || combos[0];
  const rooms = combo?.rooms || [];

  // ── Meal: chosen plan, else closest to the quote preference, else base ──
  const mealFromPref = paramMeal
    ? resort.meal_plans.find(m => paramMeal.split(",").includes(m.plan_id))
    : null;
  const mealPlan = resort.meal_plans.find(m => m.plan_id === mealId)
    || mealFromPref
    || resort.meal_plans.find(m => m.is_base)
    || resort.meal_plans[0];

  // ── Final price incl. taxes (green tax already baked into the combo price) ──
  const perPerson = num(combo?.total_price) + (mealPlan?.price_delta || 0);
  const subtotal = perPerson * travellers;
  const gst = Math.round(subtotal * 0.04);
  const tcs = Math.round(subtotal * 0.05);
  const finalTotal = subtotal + gst + tcs;

  // Dates: start + selected nights → end.
  const start = startDate ? new Date(startDate) : null;
  const end = start ? new Date(start.getTime() + selectedNights * DAY_MS) : null;
  const fmtD = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const dateInputValue = start ? `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}` : "";
  const onDateInput = (v) => {
    if (!v) { setStartDate(null); return; }
    const [y, m, d] = v.split("-").map(Number);
    setStartDate(new Date(y, m - 1, d).toISOString());
  };
  const changeNights = (n) => { setSelectedNights(n); setComboId(null); };

  const inclSections = INCLUSION_SECTIONS.filter(s => (resort.inclusions?.[s.key] || []).length > 0);

  // Similar resorts: share at least one category, exclude the current one.
  const similar = resorts
    .filter(r => r.id !== resort.id && r.categories.some(c => resort.categories.includes(c)))
    .slice(0, 6);

  const roomImgs = (room) => {
    const rest = resort.images.filter(i => i !== room.image);
    return [room.image, ...rest].slice(0, 6);
  };

  const openMap = () => {
    const loc = resort.location;
    if (!loc) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`, "_blank", "noopener");
  };
  const openSite = () => resort.website && window.open(resort.website, "_blank", "noopener");
  const TransferIcon = resort.transfer_type === "seaplane" ? Plane : Ship;

  // Hero gallery: a video first, then all the resort photos.
  const heroVideo = resort.video_url || HERO_VIDEO;

  // The heart beside the name, keyed the same way the resort card keys it, so a
  // save made on the list shows here and the other way round.
  const isWished = wishlist.isSaved("hotel", "Maldives", resort.name);
  const toggleWish = () => wishlist.toggle("hotel", "Maldives", resort.name, {
    name: resort.name,
    img: resort.hero_image || resort.images?.[0],
    sub: `${resort.atoll || "Maldives"} · ${resort.star_rating}-star`,
    city: resort.atoll || null,
    stars: resort.star_rating,
  });

  // Carry the current choices onto linked (similar) resorts.
  const carry = [
    startDate && `date=${encodeURIComponent(startDate)}`,
    `pax=${travellers}`,
    mealPlan?.plan_id && `meal=${mealPlan.plan_id}`,
  ].filter(Boolean).join("&");

  // Website + documents as a compact link list (transfers + map are own blocks).
  const detailRows = [
    ...(resort.website ? [{ Icon: Globe, label: "Official website", action: "Visit", onClick: openSite }] : []),
    ...RESORT_DOCS.map(d => ({ Icon: d.Icon, label: d.title, action: "View", onClick: openSite })),
  ];

  return (
    <div style={{ paddingBottom: 0 }}>
      {/* ─── Hero: looping video, tap to open the full gallery ─── */}
      <div style={{ position: "relative", height: 280 }}>
        <button onClick={() => setShowGallery(true)} style={{ display: "block", width: "100%", height: "100%", padding: 0, border: "none", background: "#000", cursor: "pointer", overflow: "hidden" }}>
          <img src={resort.images[0]} alt={resort.name} className="ken-burns"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </button>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0,0,0,0.15) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />
        <div onClick={() => setShowGallery(true)} style={{ position: "absolute", bottom: 12, right: 14, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderRadius: 16, padding: "5px 11px", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
          <Play size={11} color="#fff" fill="#fff" />
          <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Video + {resort.images.length} photos</span>
        </div>
        <Link to="/destination/Maldives" style={{
          position: "absolute", top: 14, left: 14, width: 34, height: 34, borderRadius: 12,
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ArrowLeft size={18} color="#fff" />
        </Link>
      </div>

      {/* ─── Title + star / booking rating / atoll ─── */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: 0, flex: 1, minWidth: 0 }}>{resort.name}</h2>
          <SaveHeart saved={isWished} onToggle={toggleWish} size={32} style={{ marginTop: -1, marginRight: -7 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.sub }}>{resort.star_rating}-star</span>
          </div>
          <span style={{ color: C.icon }}>·</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <BookingMark />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{resort.booking_rating}/10</span>
            <span style={{ fontSize: 12, color: C.inact }}>({resort.booking_rating_count.toLocaleString()} reviews)</span>
          </div>
          <span style={{ color: C.icon }}>·</span>
          <button onClick={openMap} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <MapPin size={13} color={C.p600} />
            <span style={{ fontSize: 13, color: C.p600, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>Maldives</span>
          </button>
        </div>

        {/* Short description (2 lines, expandable) */}
        <p style={{
          fontSize: 13, color: C.sub, margin: "12px 0 0", lineHeight: "20px",
          ...(showFullDesc ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }),
        }}>
          {resort.editorial_description}
        </p>
        <button onClick={() => setShowFullDesc(!showFullDesc)} style={{ background: "none", border: "none", color: C.p600, fontSize: 12, fontWeight: 600, marginTop: 4, cursor: "pointer", padding: 0 }}>
          {showFullDesc ? "Read less" : "Read more"}
        </button>
      </div>

      {/* ─── Your stay: dates + nights (editable) ─── */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Your stay</h3>
        <div style={groupStyle}>
          {/* Dates (native picker sits invisibly over the row) */}
          <label style={{ ...rowBase, cursor: "pointer", position: "relative" }}>
            <Calendar size={18} color={C.sub} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 11, color: C.inact, display: "block" }}>Travel dates</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>
                {start ? `${fmtD(start)} - ${fmtD(end)}` : "Pick a start date"}
              </span>
            </div>
            <span style={{ fontSize: 12, color: C.p600, fontWeight: 600 }}>Change</span>
            <input type="date" value={dateInputValue} onChange={(e) => onDateInput(e.target.value)}
              style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer", border: "none" }} />
          </label>
          {/* Nights */}
          <div style={{ ...rowBase, borderTop: `1px solid ${C.div}` }}>
            <span style={{ width: 18, textAlign: "center", flexShrink: 0, fontSize: 15 }}>🌙</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.head }}>Nights</span>
            <div style={{ display: "flex", gap: 6 }}>
              {[3, 4].map(n => {
                const on = selectedNights === n;
                return (
                  <button key={n} onClick={() => changeNights(n)} style={{
                    minWidth: 44, padding: "7px 0", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                    border: on ? `1.5px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white, color: on ? C.p600 : C.head,
                  }}>{n}N</button>
                );
              })}
            </div>
          </div>
        </div>
        <p style={{ margin: "8px 2px 0", fontSize: 11.5, color: C.inact }}>Need more nights? Talk to our executive.</p>
      </div>

      {/* ─── Rooms (grouped rows, tap for photos) ─── */}
      {rooms.length > 0 && (
        <div style={sectionStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 12px" }}>
            <h3 style={{ ...titleStyle, margin: 0 }}>Your room mix</h3>
            {combos.length > 1 && (
              <button onClick={() => setShowComboPicker(true)} style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: C.p600, padding: 0 }}>
                Change <ChevronRight size={15} color={C.p600} />
              </button>
            )}
          </div>
          <div style={groupStyle}>
            {rooms.map((room, i) => {
              const imgs = roomImgs(room);
              return (
                <button key={i} onClick={() => setRoomView({ name: room.room_type, imgs })} style={{
                  ...rowBase, width: "100%", background: C.white, border: "none", textAlign: "left", cursor: "pointer",
                  borderTop: i > 0 ? `1px solid ${C.div}` : "none",
                }}>
                  <div style={{ position: "relative", width: 84, height: 64, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <img src={room.image} alt={room.room_type} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.55)", borderRadius: 12, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>
                      <Camera size={10} color="#fff" />
                      <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{imgs.length}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.head, display: "block" }}>{room.room_type}</span>
                    <span style={{ fontSize: 12, color: C.sub }}>{room.nights} {room.nights === 1 ? "night" : "nights"}</span>
                  </div>
                  <ChevronRight size={16} color={C.inact} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Meal plan (radio; changes price + what's covered) ─── */}
      {resort.meal_plans?.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={titleStyle}>Meal plan</h3>
          <div style={groupStyle}>
            {resort.meal_plans.map((m, i) => {
              const on = m.plan_id === mealPlan.plan_id;
              const info = MEAL_INFO[m.plan_id];
              return (
                <div key={m.plan_id} style={{ borderTop: i > 0 ? `1px solid ${C.div}` : "none" }}>
                  <button onClick={() => setMealId(m.plan_id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px",
                    background: on ? C.p100 : C.white, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: C.white, border: on ? `6px solid ${C.p600}` : `1.5px solid ${C.icon}` }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>{m.name}</span>
                      <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 1 }}>{m.description}</span>
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.price_delta ? C.head : C.sText, flexShrink: 0 }}>
                      {m.price_delta ? `+₹${m.price_delta.toLocaleString("en-IN")}` : "Included"}
                    </span>
                  </button>
                  {on && info && (
                    <div style={{ padding: "0 14px 13px 46px", display: "flex", flexWrap: "wrap", gap: "5px 14px" }}>
                      {info.covers.map((c, k) => (
                        <span key={k} style={{ fontSize: 12, color: C.sub, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <Check size={12} color={C.sText} strokeWidth={2.5} /> {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ margin: "8px 2px 0", fontSize: 11.5, color: C.inact }}>Prices shown are per person.</p>
        </div>
      )}

      {/* ─── What's included (one card, divided accordion rows) ─── */}
      {inclSections.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={titleStyle}>What's included</h3>
          <div style={groupStyle}>
            {inclSections.map((s, si) => {
              const isOpen = !!openIncl[s.key];
              const items = resort.inclusions[s.key];
              return (
                <div key={s.key} style={{ borderTop: si > 0 ? `1px solid ${C.div}` : "none" }}>
                  <button onClick={() => setOpenIncl(o => ({ ...o, [s.key]: !o[s.key] }))} style={{
                    width: "100%", padding: "13px 14px", background: C.white, border: "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.head }}>{s.label}</span>
                    {isOpen ? <ChevronUp size={16} color={C.inact} /> : <ChevronDown size={16} color={C.inact} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <Check size={14} color={C.sText} style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: C.sub, lineHeight: "18px" }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Resort details ─── */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Resort details</h3>

        {/* Getting there - its own small block */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.bg, borderRadius: 10, marginBottom: 14 }}>
          <TransferIcon size={18} color={C.sub} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <span style={{ fontSize: 11, color: C.inact, display: "block" }}>Getting there</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.head }}>{transferLabel(resort.transfer_type)} · {resort.transfer_duration_minutes} min from airport</span>
          </div>
        </div>

        {/* Location - compact map card */}
        {resort.location && (
          <button onClick={openMap} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 0, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.div}`, background: C.white, cursor: "pointer", textAlign: "left", marginBottom: 14 }}>
            <div style={{ position: "relative", width: 92, height: 74, flexShrink: 0, background: "url(https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80&auto=format&fit=crop) center/cover no-repeat, #E8ECEF" }}>
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 26, height: 26, borderRadius: "50%", background: C.p600, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(227,27,83,0.4)" }}>
                <MapPin size={13} color="#fff" fill="#fff" />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.head, display: "block" }}>Maldives</span>
              <span style={{ fontSize: 12, color: C.sub }}>{resort.atoll}</span>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: C.p600, whiteSpace: "nowrap", flexShrink: 0, paddingRight: 12 }}>
              Open in Maps <ChevronRight size={14} color={C.p600} />
            </span>
          </button>
        )}

        {/* Website + documents - compact divided rows */}
        <div>
          {detailRows.map((r, i) => (
            <div key={i} onClick={r.onClick} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 2px",
              borderTop: i > 0 ? `1px solid ${C.div}` : "none", cursor: r.onClick ? "pointer" : "default",
            }}>
              <r.Icon size={18} color={C.sub} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: C.head }}>{r.label}</span>
              {r.action && <span style={{ fontSize: 12, color: C.p600, fontWeight: 600, flexShrink: 0 }}>{r.action}</span>}
              {r.action && <ChevronRight size={16} color={C.p600} style={{ flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Other similar resorts ─── */}
      {similar.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ ...titleStyle, padding: "0 16px" }}>Other similar resorts</h3>
          <div className="hs" style={{ gap: 14, paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
            {similar.map(r => (
              <ResortCard key={r.id} resort={r} nights={selectedNights} query={carry} showCategoryBadge />
            ))}
          </div>
        </div>
      )}

      {/* ─── Sticky book bar (final price incl. taxes) ─── */}
      <div style={{ position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 20, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.div}`, padding: "10px 16px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.head }}>₹{finalTotal.toLocaleString("en-IN")}</p>
          <p style={{ margin: "1px 0 0", fontSize: 11, color: C.sub }}>Total for {travellers} · incl. taxes</p>
        </div>
        <button onClick={() => setShowBook(true)} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, background: C.p600, color: "#fff", border: "none", borderRadius: 12, padding: "13px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Book it <ChevronRight size={16} color="#fff" />
        </button>
      </div>

      {/* ─── Room mix picker ─── */}
      {showComboPicker && (
        <div onClick={() => setShowComboPicker(false)} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", maxWidth: 390, margin: "0 auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: C.white, borderRadius: "20px 20px 0 0", padding: "18px 16px calc(18px + env(safe-area-inset-bottom))" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.head }}>Choose your room mix</h3>
              <button onClick={() => setShowComboPicker(false)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><XIcon size={20} color={C.sub} /></button>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: C.sub }}>Curated combinations for {selectedNights} nights.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {combos.map(c => {
                const on = c.combo_id === combo.combo_id;
                return (
                  <button key={c.combo_id} onClick={() => { setComboId(c.combo_id); setShowComboPicker(false); }} style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left", padding: "13px 14px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                    border: on ? `2px solid ${C.p600}` : `1px solid ${C.div}`, background: on ? C.p100 : C.white,
                  }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: C.white, border: on ? `6px solid ${C.p600}` : `1.5px solid ${C.icon}` }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.head }}>{getRoomSplitLabel(c)}</span>
                      <span style={{ fontSize: 12, color: C.sub }}>₹{c.total_price}/pp</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Book: talk to a consultant ─── */}
      {showBook && (
        <div onClick={() => setShowBook(false)} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", maxWidth: 390, margin: "0 auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: C.white, borderRadius: "20px 20px 0 0", padding: "22px 20px calc(22px + env(safe-area-inset-bottom))" }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.head }}>Talk to a consultant</h2>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: C.sub, lineHeight: 1.5 }}>
              A consultant will confirm your booking: {resort.name}, {selectedNights} nights, {mealPlan.name}, for {travellers} travellers.
            </p>
            <div style={{ margin: "16px 0", padding: "12px 14px", borderRadius: 12, background: C.bg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.sub }}>Total incl. taxes</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: C.head }}>₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="tel:+919000000000" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", padding: "14px 0", borderRadius: 14, border: `1px solid ${C.div}`, background: C.white, color: C.head, fontSize: 15, fontWeight: 700 }}>
                <Phone size={17} color={C.head} /> Call
              </a>
              <a href="https://wa.me/919000000000" target="_blank" rel="noopener" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", padding: "14px 0", borderRadius: 14, border: "none", background: C.p600, color: "#fff", fontSize: 15, fontWeight: 700 }}>
                <MessageCircle size={17} color="#fff" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero gallery lightbox (video first, then photos) ─── */}
      {showGallery && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#000", maxWidth: 390, margin: "0 auto", display: "flex", flexDirection: "column" }}>
          <div className="hs" style={{ flex: 1, gap: 0, scrollSnapType: "x mandatory" }}>
            <div style={{ width: "100%", minWidth: "100%", height: "100%", flexShrink: 0, scrollSnapAlign: "start", display: "flex", alignItems: "center" }}>
              <video src={heroVideo} poster={resort.images[0]} autoPlay controls loop playsInline
                style={{ width: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
            </div>
            {resort.images.map((img, i) => (
              <div key={i} style={{ width: "100%", minWidth: "100%", height: "100%", flexShrink: 0, scrollSnapAlign: "start", display: "flex", alignItems: "center" }}>
                <img src={img} alt={`${resort.name} ${i + 1}`} style={{ width: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, background: "linear-gradient(rgba(0,0,0,0.55), transparent)", pointerEvents: "none" }} />
          <button onClick={() => setShowGallery(false)} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <XIcon size={19} color="#fff" />
          </button>
          <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>Swipe for photos</span>
          </div>
        </div>
      )}

      {/* ─── Room photo lightbox ─── */}
      {roomView && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "#000", maxWidth: 390, margin: "0 auto", display: "flex", flexDirection: "column" }}>
          <div className="hs" style={{ flex: 1, gap: 0, scrollSnapType: "x mandatory" }}>
            {roomView.imgs.map((img, i) => (
              <div key={i} style={{ width: "100%", minWidth: "100%", height: "100%", flexShrink: 0, scrollSnapAlign: "start", display: "flex", alignItems: "center" }}>
                <img src={img} alt={`${roomView.name} ${i + 1}`} style={{ width: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 90, background: "linear-gradient(rgba(0,0,0,0.55), transparent)", pointerEvents: "none" }} />
          <button onClick={() => setRoomView(null)} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <XIcon size={19} color="#fff" />
          </button>
          <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{roomView.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
