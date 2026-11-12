import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Waves, Utensils, Flower2, Wifi, Umbrella, Bus, Bed, Bath, Trees,
  ConciergeBell, Shield, Footprints, Heart, Sparkles, Star, LogIn, LogOut, Info,
  Users, Wallet, PawPrint, Ban, IdCard, MapPin, Navigation, Maximize2,
  ChevronDown, ChevronUp, X, Ruler, Eye, Coffee, Leaf, Languages, Plug, Sunrise, Sunset,
  Check, ChevronLeft, ChevronRight, Expand,
} from "lucide-react";
import { C } from "../../data";
import { placeNearby } from "../../data/hotelDetailData";
import SourceLogo from "../hotel_detail/SourceLogo";
import {
  Section, RowCard, Row, WellIcon, MoreButton, Chip, Tag, Yes, CheckLine,
  Stars, Photo, Sheet, Clamp, PAD,
} from "./kit";
import { R, SHADOW, T, A, HIGHLIGHT } from "./tokens";

const ICONS = {
  waves: Waves, utensils: Utensils, flower: Flower2, wifi: Wifi, umbrella: Umbrella,
  bus: Bus, bed: Bed, bath: Bath, trees: Trees, concierge: ConciergeBell, shield: Shield,
  footprints: Footprints, heart: Heart, sparkles: Sparkles, star: Star,
  login: LogIn, info: Info, users: Users, wallet: Wallet, paw: PawPrint,
  ban: Ban, idcard: IdCard, leaf: Leaf, languages: Languages, plug: Plug,
};
const ico = (name) => ICONS[name] || Sparkles;

// ═══════════════════════════════════════════════════════════
// About the stay
// ═══════════════════════════════════════════════════════════
// The photo cards now share one ratio with every other wide card on the page
// (16:10), and the caption sits on a proper scrim rather than a gradient that
// ran out before the second line.
export function About({ hotel }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Section title="About the stay" flush>
        <div style={{ padding: `0 ${PAD}px` }}>
          <Clamp lines={4}>{hotel.aboutShort}</Clamp>
        </div>

        <div className="hs" style={{ gap: 10, padding: `14px ${PAD}px 2px` }}>
          {hotel.aboutCards.map((cd, i) => (
            <div key={i} style={{
              position: "relative", width: 200, height: 125, flexShrink: 0,
              borderRadius: R.card, overflow: "hidden", background: A.photoBg,
              boxShadow: SHADOW.card,
            }}>
              <img src={cd.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.78) 100%)",
              }} />
              <p style={{
                position: "absolute", left: 12, right: 12, bottom: 11, margin: 0,
                fontSize: 12.5, fontWeight: 600, color: "#fff", lineHeight: 1.32,
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}>{cd.caption}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: `0 ${PAD}px` }}>
          <MoreButton onClick={() => setOpen(true)}>View details</MoreButton>
        </div>
      </Section>

      <Sheet open={open} title="About the stay" onClose={() => setOpen(false)}>
        <div style={{ padding: "18px 16px 26px" }}>
          <h4 style={{ ...T.h2, margin: "0 0 4px" }}>{hotel.name}</h4>
          <p style={{ ...T.meta, margin: "0 0 18px" }}>
            {hotel.stars} star {hotel.type.toLowerCase()} · {hotel.neighbourhood}
          </p>
          {hotel.aboutSections.map((s) => (
            <div key={s.title} style={{ marginBottom: 18 }}>
              <p style={{ ...T.h3, margin: "0 0 5px" }}>{s.title}</p>
              <p style={{ ...T.body, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// What this place offers
// ═══════════════════════════════════════════════════════════
// The six amenities were a list of bare glyphs against hairlines, which is a
// settings screen. They are now wells on a lifted card, which is how this app
// has drawn a list of features since the transfer cards shipped.
export function Facilities({ hotel }) {
  const [open, setOpen] = useState(false);
  const total = hotel.facilityGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <Section title="What this place offers">
        <RowCard>
          {hotel.facilityTop.map((f, i) => (
            <Row
              key={f.label}
              Ico={ico(f.icon)}
              tone="lagoon"
              label={f.label}
              sub={f.note}
              last={i === hotel.facilityTop.length - 1}
            />
          ))}
        </RowCard>
        <MoreButton onClick={() => setOpen(true)}>View all {total} amenities</MoreButton>
      </Section>

      <Sheet open={open} title="What this place offers" onClose={() => setOpen(false)} full>
        <div style={{ padding: `6px ${PAD}px 26px` }}>
          {hotel.facilityGroups.map((g) => (
            <div key={g.key} style={{ paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                <WellIcon Ico={ico(g.icon)} tone="lagoon" size={28} icon={15} />
                <h4 style={{ ...T.h3, flex: 1, margin: 0 }}>{g.title}</h4>
                <span style={{ ...T.micro }}>{g.items.length}</span>
              </div>

              {g.photos.length > 0 && (
                <div className="hs" style={{ gap: 8, marginBottom: 10 }}>
                  {g.photos.map((p, i) => (
                    <Photo key={i} src={p} w={176} h={110} radius={R.card} />
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 12 }}>
                {g.items.map((it) => <CheckLine key={it.label} label={it.label} note={it.note} />)}
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Where you'll be
// ═══════════════════════════════════════════════════════════
const pin = (colour, filled = true) => L.divIcon({
  className: "",
  html: `<div style="width:${filled ? 16 : 12}px;height:${filled ? 16 : 12}px;border-radius:50%;
      background:${filled ? colour : "#fff"};border:${filled ? 3 : 3}px solid ${filled ? "#fff" : colour};
      box-shadow:0 2px 7px rgba(0,0,0,0.32)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function Recentre({ at }) {
  const map = useMap();
  useEffect(() => { if (at) map.panTo(at, { animate: true }); }, [at, map]);
  return null;
}

export function NearbyMap({ hotel, places, selected, onSelect, onClose, title }) {
  const active = selected || places[0];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 850, background: C.white }}>
      <MapContainer
        center={[active.lat, active.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%", background: "#AADAFF" }}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recentre at={[active.lat, active.lng]} />
        <Marker position={[hotel.coords.lat, hotel.coords.lng]} icon={pin(A.pink)} />
        {places.map((p) => (
          <Marker
            key={p.name}
            position={[p.lat, p.lng]}
            icon={pin("#1570EF", p.name === active.name)}
            zIndexOffset={p.name === active.name ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(p) }}
          />
        ))}
      </MapContainer>

      <div style={{
        position: "absolute", top: 12, left: 12, right: 12, zIndex: 600,
        display: "flex", alignItems: "center", gap: 9, pointerEvents: "none",
      }}>
        <button
          onClick={onClose}
          aria-label="Close map"
          style={{
            pointerEvents: "auto", width: 36, height: 36, borderRadius: "50%", border: "none",
            background: C.white, boxShadow: SHADOW.float, display: "grid", placeItems: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <X size={18} color={C.head} />
        </button>
        <span style={{
          pointerEvents: "auto", background: C.white, borderRadius: R.pill, padding: "9px 14px",
          boxShadow: SHADOW.float, fontSize: 12.5, fontWeight: 700, color: C.head,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {title} · {places.length} nearby
        </span>
      </div>

      <div className="hs" style={{
        position: "absolute", left: 0, right: 0, bottom: 16, zIndex: 600, gap: 10, padding: "0 12px",
      }}>
        {places.map((p) => {
          const on = p.name === active.name;
          return (
            <button
              key={p.name}
              onClick={() => onSelect(p)}
              style={{
                width: 250, flexShrink: 0, display: "flex", gap: 11, textAlign: "left",
                background: C.white, borderRadius: R.card, padding: 11, cursor: "pointer",
                fontFamily: "inherit",
                border: on ? "1.5px solid #1570EF" : "1.5px solid transparent",
                boxShadow: SHADOW.float,
              }}
            >
              <Photo src={p.image} w={54} h={54} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  ...T.lead, display: "block",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{p.name}</span>
                {p.rating != null && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Star size={11} color={A.star} fill={A.star} strokeWidth={0} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head }}>{p.rating}</span>
                    <span style={{ ...T.micro }}>({p.count.toLocaleString("en-IN")})</span>
                  </span>
                )}
                <span style={{ ...T.micro, display: "block", marginTop: 3 }}>
                  {p.distance} · {p.time} from the hotel
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Location({ hotel }) {
  const places = useMemo(() => placeNearby(hotel), [hotel]);
  const tabs = Object.keys(places);
  const [tab, setTab] = useState(tabs[0]);
  const [open, setOpen] = useState(null);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address}`)}`;

  return (
    <>
      <Section title="Where you'll be" flush>
        <div style={{ padding: `0 ${PAD}px` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <WellIcon Ico={MapPin} tone="ocean" size={28} icon={15} />
            <p style={{ ...T.body, margin: 0, paddingTop: 3 }}>{hotel.address}</p>
          </div>

          {/* position + zIndex give Leaflet its own stacking context, or its
              panes draw straight through any sheet opened over them. */}
          <div style={{
            position: "relative", zIndex: 0, height: 168, borderRadius: R.card,
            overflow: "hidden", border: `1px solid ${C.div}`, boxShadow: SHADOW.card,
          }}>
            <MapContainer
              center={[hotel.coords.lat, hotel.coords.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%", background: "#AADAFF" }}
              attributionControl={false}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[hotel.coords.lat, hotel.coords.lng]} icon={pin(A.pink)} />
            </MapContainer>
            <button
              onClick={() => setOpen(places[tab][0])}
              aria-label="Expand map"
              style={{
                position: "absolute", top: 10, right: 10, zIndex: 500,
                width: 34, height: 34, borderRadius: R.well, border: "none", background: C.white,
                boxShadow: SHADOW.float, display: "grid", placeItems: "center", cursor: "pointer",
              }}
            >
              <Maximize2 size={15} color={C.head} />
            </button>
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              style={{
                position: "absolute", left: 10, bottom: 10, zIndex: 500,
                display: "inline-flex", alignItems: "center", gap: 6,
                background: C.white, borderRadius: R.pill, padding: "8px 13px",
                boxShadow: SHADOW.float, textDecoration: "none",
                fontSize: 12, fontWeight: 700, color: C.head,
              }}
            >
              <Navigation size={12} color={A.pink} /> Open in Maps
            </a>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 12,
            ...HIGHLIGHT, borderRadius: R.well, padding: "10px 12px",
          }}>
            <Footprints size={15} color={A.pink} strokeWidth={2} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: C.head }}>
              {hotel.distanceLine}
            </p>
          </div>
        </div>

        <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: `16px ${PAD}px 2px` }}>
          {tabs.map((t) => (
            <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Chip>
          ))}
        </div>

        <div className="hs" style={{ gap: 10, padding: `12px ${PAD}px 2px` }}>
          {places[tab].map((n) => (
            <button
              key={n.name}
              onClick={() => setOpen(n)}
              style={{
                width: 212, flexShrink: 0, display: "flex", gap: 11, textAlign: "left",
                border: `1px solid ${C.div}`, borderRadius: R.card, padding: 10, background: C.white,
                cursor: "pointer", fontFamily: "inherit", boxShadow: SHADOW.card,
              }}
            >
              <Photo src={n.image} w={56} h={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  ...T.lead, margin: 0, fontSize: 13,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{n.name}</p>
                {n.rating != null && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <Star size={11} color={A.star} fill={A.star} strokeWidth={0} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head }}>{n.rating}</span>
                    <span style={{ ...T.micro }}>({n.count.toLocaleString("en-IN")})</span>
                  </span>
                )}
                <p style={{ ...T.micro, margin: "3px 0 0" }}>{n.distance} · {n.time}</p>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {open && (
        <NearbyMap
          hotel={hotel}
          places={places[tab]}
          selected={open}
          onSelect={setOpen}
          onClose={() => setOpen(null)}
          title={tab}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Why Indian couples pick this stay
// ═══════════════════════════════════════════════════════════
// The bespoke pink box is replaced with the gradient the app already uses for
// a highlighted strip, and each line gets a well so the section reads as one
// family with the facilities above it rather than a different design.
export function WhyIndians({ hotel }) {
  return (
    <Section title="Why Indian couples pick this stay">
      <div style={{ ...HIGHLIGHT, borderRadius: R.card, padding: "3px 14px", boxShadow: SHADOW.card }}>
        {hotel.whyIndians.map((w, i) => {
          const Ico = ico(w.icon);
          return (
            <div
              key={i}
              style={{
                display: "flex", gap: 12, alignItems: "center", padding: "11px 0",
                borderBottom: i === hotel.whyIndians.length - 1 ? "none" : "1px solid rgba(248,216,225,0.9)",
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: R.well, background: "rgba(255,255,255,0.86)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                <Ico size={16} color={A.pink} strokeWidth={2} />
              </span>
              <span style={{ fontSize: 13, color: C.head, lineHeight: 1.45 }}>{w.text}</span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════
// Select your room
// ═══════════════════════════════════════════════════════════
// ─── A room's photos, full size ───
//
// The strip in the sheet is a preview, and a preview of a bedroom at 252 by 158
// is not enough to decide on a bedroom. Tapping one opens it properly, with the
// rest of that room's photos behind the arrows.
//
// Dark, and only here: a single image is the one case where black genuinely
// gets out of the way. Same treatment as the hotel gallery's lightbox, because
// it is the same thing happening.
function RoomPhotos({ room, start, onClose }) {
  const [i, setI] = useState(start);
  const shots = room.images || [];

  useEffect(() => {
    // Capture phase, and it stops the event dead. The sheet underneath also
    // listens for Escape, and one press should close one thing.
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); onClose(); }
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
      if (e.key === "ArrowRight") setI((n) => Math.min(shots.length - 1, n + 1));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, shots.length]);

  if (!shots.length) return null;

  const arrow = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 36, height: 36, borderRadius: "50%", border: "none",
    background: "rgba(255,255,255,0.16)", display: "grid", placeItems: "center", cursor: "pointer",
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 1100, background: "#0B0B0C",
      display: "flex", flexDirection: "column", animation: "fadeInBg 0.18s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", padding: `12px ${PAD}px`, flexShrink: 0 }}>
        <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          {i + 1} of {shots.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center", cursor: "pointer",
          }}
        >
          <X size={17} color="#fff" />
        </button>
      </div>

      <div style={{ flex: 1, position: "relative", display: "grid", placeItems: "center", minHeight: 0, padding: "0 8px" }}>
        <img src={shots[i]} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        {i > 0 && (
          <button onClick={() => setI(i - 1)} aria-label="Previous" style={{ ...arrow, left: 6 }}>
            <ChevronLeft size={19} color="#fff" />
          </button>
        )}
        {i < shots.length - 1 && (
          <button onClick={() => setI(i + 1)} aria-label="Next" style={{ ...arrow, right: 6 }}>
            <ChevronRight size={19} color="#fff" />
          </button>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: `14px ${PAD}px 20px` }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>{room.name}</p>
        <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "rgba(255,255,255,0.55)" }}>
          {room.size} m² · {room.beds}
        </p>
      </div>
    </div>
  );
}

function RoomSheet({ room, chosen, onClose, onPick }) {
  const [shot, setShot] = useState(null);

  // A different room behind the same sheet should not open on the last room's
  // third photo.
  useEffect(() => { setShot(null); }, [room?.id]);

  return (
    <>
    <Sheet
      open={!!room}
      title={room?.name || ""}
      onClose={onClose}
      full
      footer={room && !chosen ? (
        <button
          onClick={() => { onPick?.(room); onClose(); }}
          style={{
            width: "100%", padding: "15px 0", borderRadius: R.card, border: "none",
            background: A.pink, color: "#fff", cursor: "pointer",
            fontFamily: "inherit", fontSize: 15, fontWeight: 700,
            boxShadow: "0 4px 14px rgba(253,1,79,0.28)",
          }}
        >
          Choose this room
          {room.priceDelta > 0 && ` · + ₹${room.priceDelta.toLocaleString("en-IN")}`}
          {room.priceDelta < 0 && ` · − ₹${Math.abs(room.priceDelta).toLocaleString("en-IN")}`}
        </button>
      ) : null}
    >
      {room && (
        <div style={{ paddingBottom: 26 }}>
          <div className="hs" style={{ gap: 8, padding: `16px ${PAD}px 0` }}>
            {room.images.map((im, i) => (
              <button
                key={i}
                onClick={() => setShot(i)}
                aria-label={`Photo ${i + 1} of ${room.images.length}`}
                style={{
                  position: "relative", flexShrink: 0, border: "none", padding: 0,
                  background: "none", cursor: "pointer", lineHeight: 0,
                }}
              >
                <Photo src={im} w={252} h={158} radius={R.card} style={{ boxShadow: SHADOW.card }} />
                {/* One mark, on the first photo only. Enough to say the strip
                    opens, not so much that it is on every frame. */}
                {i === 0 && (
                  <span style={{
                    position: "absolute", right: 9, bottom: 9,
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(16,24,40,0.62)", color: "#fff", borderRadius: R.pill,
                    padding: "5px 9px", fontSize: 11, fontWeight: 700, lineHeight: 1,
                  }}>
                    <Expand size={11} strokeWidth={2.4} />
                    {room.images.length} photos
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ padding: `18px ${PAD}px 0` }}>
            <p style={{ ...T.body, margin: 0 }}>{room.description}</p>

            <RowCard style={{ marginTop: 18 }}>
              {[
                { Ico: Ruler, k: "Room size", v: `${room.size} m²` },
                { Ico: Bed, k: "Beds", v: room.beds },
                { Ico: Users, k: "Sleeps", v: `${room.sleeps} adults` },
                room.view ? { Ico: Eye, k: "View", v: room.view } : null,
                { Ico: Coffee, k: "Meals", v: room.mealPlan },
                { Ico: Info, k: "Cancellation", v: room.refundable ? "Free cancellation" : "Non-refundable" },
              ].filter(Boolean).map((x, i, arr) => (
                <Row key={x.k} Ico={x.Ico} tone="neutral" label={x.k} value={x.v} last={i === arr.length - 1} />
              ))}
            </RowCard>

            {room.sizeTip && (
              <div style={{
                display: "flex", alignItems: "center", gap: 9, marginTop: 12,
                background: A.greenBg, borderRadius: R.well, padding: "11px 12px",
              }}>
                <Sparkles size={15} color={A.green} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: A.green }}>{room.sizeTip}</p>
              </div>
            )}

            <h4 style={{ ...T.h3, margin: "22px 0 4px" }}>In this room</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 12 }}>
              {room.amenities.map((a) => <CheckLine key={a} label={a} />)}
            </div>
          </div>
        </div>
      )}
    </Sheet>

    {room && shot != null && (
      <RoomPhotos room={room} start={shot} onClose={() => setShot(null)} />
    )}
    </>
  );
}

export function Rooms({ hotel, onPick, selectedId, readOnly = false, nights = 3, title, currentId }) {
  const [detail, setDetail] = useState(null);

  // Your own hotel is a different question from a hotel you are looking at.
  // The room is already chosen, so the section leads with it, marked plainly,
  // and the other rooms wait behind one tap.
  if (currentId && !readOnly) {
    return (
      <YourRoom
        hotel={hotel}
        currentId={currentId}
        selectedId={selectedId}
        onPick={onPick}
        nights={nights}
        detail={detail}
        setDetail={setDetail}
      />
    );
  }

  return (
    <>
      <Section
        title={title || (readOnly ? (hotel.rooms.length === 1 ? "Your room" : "Rooms") : "Select your room")}
        // "for 3 nights" was printed on all three cards and then wrapped to a
        // second line once the Select control sat beside it. It is the same
        // sentence three times, so it says it once, here.
        sub={readOnly
          ? null
          : `${hotel.rooms.length} room types. Any extra cost is for all ${nights} ${nights === 1 ? "night" : "nights"}.`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {hotel.rooms.map((r) => (
            <RoomCard key={r.id} r={r} chosen={r.id === selectedId} readOnly={readOnly} onOpen={setDetail} onPick={onPick} />
          ))}
        </div>
      </Section>

      <RoomSheet
        room={detail}
        chosen={readOnly || detail?.id === selectedId}
        onClose={() => setDetail(null)}
        onPick={onPick}
      />
    </>
  );
}

// One room card, the same everywhere a room can be chosen. The price is what
// the room adds to (or takes off) the stay; the room already on the trip has
// nothing to add, so it carries no price at all.
function RoomCard({ r, chosen, readOnly = false, onOpen, onPick, hidePrice = false, testId }) {
  return (
    // A card, not a button, because it now holds one. Tapping the
    // card still opens the room; the control on it commits to the
    // room without making you open it first. Two ways in, because
    // people who already know the room they want should not have to
    // read it again to choose it.
    <div
      data-testid={testId}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(r)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(r); }}
      style={{
        display: "flex", gap: 12, width: "100%", padding: 11, textAlign: "left",
        alignItems: "stretch", cursor: "pointer", fontFamily: "inherit",
        borderRadius: R.card, background: C.white,
        border: `1px solid ${chosen ? A.pink : C.div}`,
        boxShadow: chosen ? "0 4px 18px rgba(253,1,79,0.14)" : SHADOW.card,
      }}
    >
      <div style={{ position: "relative", width: 108, flexShrink: 0 }}>
        <img
          src={r.images[0]}
          alt=""
          style={{
            width: "100%", height: "100%", minHeight: 108, borderRadius: R.well,
            objectFit: "cover", display: "block", background: A.photoBg,
          }}
        />
        <span style={{
          position: "absolute", bottom: 7, left: 7, background: "rgba(0,0,0,0.58)",
          color: "#fff", fontSize: 9.5, fontWeight: 600, borderRadius: 6, padding: "3px 7px",
          backdropFilter: "blur(4px)",
        }}>{r.images.length} photos</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...T.h3, margin: 0, fontSize: 14.5 }}>{r.name}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 0" }}>
          <Tag>{r.size} m²</Tag>
          <Tag>{r.beds}</Tag>
          {r.view && <Tag>{r.view}</Tag>}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", margin: "9px 0 0" }}>
          <Yes>{r.mealPlan}</Yes>
          <Yes no={!r.refundable}>{r.refundable ? "Free cancellation" : "Non-refundable"}</Yes>
        </div>

        {!readOnly && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 10, margin: "11px 0 0",
          }}>
            <span style={{
              fontSize: 13.5, fontWeight: 700, minWidth: 0, whiteSpace: "nowrap",
              color: r.priceDelta ? C.head : C.sub,
            }}>
              {hidePrice ? null : r.priceDelta > 0
                ? `+ ₹${r.priceDelta.toLocaleString("en-IN")}`
                : r.priceDelta < 0
                  ? `− ₹${Math.abs(r.priceDelta).toLocaleString("en-IN")}`
                  : "No extra cost"}
            </span>

            {chosen ? (
              <span style={{
                flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5,
                background: A.pink, color: "#fff", borderRadius: R.pill,
                padding: "6px 12px", fontSize: 12, fontWeight: 700,
              }}>
                <Check size={13} strokeWidth={3} /> Selected
              </span>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onPick?.(r); }}
                style={{
                  flexShrink: 0, border: `1.5px solid ${A.pink}`, background: C.white,
                  color: A.pink, borderRadius: R.pill, padding: "6px 16px",
                  fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Select
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Your room ───
//
// The room already on the trip, opened from the trip. It leads, highlighted,
// with no price on it: it is what the trip already costs. The other rooms sit
// behind "Show more rooms", priced against your room rather than the cheapest
// one, so a cheaper room reads as a saving and a bigger one as an extra.
function YourRoom({ hotel, currentId, selectedId, onPick, nights, detail, setDetail }) {
  const current = hotel.rooms.find((r) => r.id === currentId) || hotel.rooms[0];
  // Every price here is the difference from your room, for the whole stay.
  const rooms = hotel.rooms.map((r) => ({ ...r, priceDelta: r.priceDelta - current.priceDelta }));
  const mine = rooms.find((r) => r.id === current.id);
  const others = rooms.filter((r) => r.id !== current.id);
  const [open, setOpen] = useState(selectedId && selectedId !== current.id);
  const changed = selectedId && selectedId !== current.id;

  const card = (r, { isCurrent }) => (
    <RoomCard
      key={r.id}
      r={r}
      chosen={r.id === selectedId}
      onOpen={setDetail}
      onPick={onPick}
      hidePrice={isCurrent}
      testId={isCurrent ? "your-room" : `room-${r.id}`}
    />
  );

  return (
    <>
      <Section title="Your room">
        {card(mine, { isCurrent: true })}

        {others.length > 0 && (
          open ? (
            <div style={{ marginTop: 22 }}>
              <h3 style={{ ...T.h3, margin: 0 }}>Other rooms</h3>
              <p style={{ ...T.meta, margin: "4px 0 12px" }}>
                Prices are the difference from your room, for all {nights} {nights === 1 ? "night" : "nights"}.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {others.map((r) => card(r, { isCurrent: false }))}
              </div>
              {!changed && (
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5, margin: "14px auto 0",
                    border: "none", background: "none", color: A.pink, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 13.5, fontWeight: 700,
                  }}
                >
                  Show fewer rooms <ChevronUp size={16} strokeWidth={2.4} />
                </button>
              )}
            </div>
          ) : (
            <button
              data-testid="show-more-rooms"
              onClick={() => setOpen(true)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                marginTop: 12, padding: "12px 0", borderRadius: R.card,
                border: `1px solid ${C.div}`, background: C.white, color: A.pink, cursor: "pointer",
                fontFamily: "inherit", fontSize: 13.5, fontWeight: 700,
              }}
            >
              Show {others.length} more {others.length === 1 ? "room" : "rooms"} <ChevronDown size={16} strokeWidth={2.4} />
            </button>
          )
        )}
      </Section>

      <RoomSheet
        room={detail}
        chosen={detail?.id === selectedId}
        onClose={() => setDetail(null)}
        onPick={onPick}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Check-in and check-out
// ═══════════════════════════════════════════════════════════
export function StayBasics({ hotel }) {
  const b = hotel.stayBasics;
  const rows = [
    { Ico: LogIn, k: "Check-in", v: `From ${b.checkIn}` },
    { Ico: LogOut, k: "Check-out", v: `Until ${b.checkOut}` },
    { Ico: Sunrise, k: "Early check-in", v: b.earlyCheckIn.included ? "Included" : "Not included", good: b.earlyCheckIn.included },
    { Ico: Sunset, k: "Late check-out", v: b.lateCheckOut.included ? "Included" : "Not included", good: b.lateCheckOut.included },
  ];

  return (
    <Section title="Check-in and check-out">
      <RowCard>
        {rows.map((r, i) => (
          <Row
            key={r.k}
            Ico={r.Ico}
            tone={r.good ? "lagoon" : "neutral"}
            label={r.k}
            value={r.v}
            valueTone={r.good ? "good" : undefined}
            last={i === rows.length - 1}
          />
        ))}
      </RowCard>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════
// Food and drink
// ═══════════════════════════════════════════════════════════
export function FoodAndDrink({ hotel }) {
  const [tab, setTab] = useState("onsite");
  const [open, setOpen] = useState(null);
  const nearby = useMemo(() => placeNearby(hotel)["Food and drink"] || [], [hotel]);

  const shell = {
    width: 220, flexShrink: 0, borderRadius: R.card, overflow: "hidden",
    background: C.white, border: `1px solid ${C.div}`, boxShadow: SHADOW.card,
  };

  return (
    <>
      <Section title="Food and drink" flush>
        <div style={{ display: "flex", gap: 8, padding: `0 ${PAD}px 12px` }}>
          <Chip active={tab === "onsite"} onClick={() => setTab("onsite")} count={hotel.restaurants.length}>
            On site
          </Chip>
          <Chip active={tab === "nearby"} onClick={() => setTab("nearby")} count={nearby.length}>
            Nearby
          </Chip>
        </div>

        {tab === "onsite" ? (
          <div className="hs" style={{ gap: 10, padding: `0 ${PAD}px 2px` }}>
            {hotel.restaurants.map((r) => (
              <div key={r.name} style={shell}>
                <Photo src={r.image} w="100%" h={112} radius={0} />
                <div style={{ padding: 12 }}>
                  <p style={{ ...T.h3, margin: 0, fontSize: 14 }}>{r.name}</p>
                  <p style={{ ...T.meta, margin: "3px 0 8px" }}>{r.cuisine}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                    {r.openFor.map((o) => <Tag key={o}>{o}</Tag>)}
                  </div>
                  <p style={{ ...T.micro, margin: 0, lineHeight: 1.45 }}>{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hs" style={{ gap: 10, padding: `0 ${PAD}px 2px` }}>
            {nearby.map((n) => (
              <button key={n.name} onClick={() => setOpen(n)} style={{ ...shell, padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                <Photo src={n.image} w="100%" h={112} radius={0} />
                <div style={{ padding: 12 }}>
                  <p style={{
                    ...T.h3, margin: 0, fontSize: 14,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{n.name}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, margin: "5px 0 0" }}>
                    <Star size={12} color={A.star} fill={A.star} strokeWidth={0} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.head }}>{n.rating}</span>
                    <span style={{ ...T.micro }}>({n.count.toLocaleString("en-IN")})</span>
                  </span>
                  <p style={{ ...T.micro, margin: "6px 0 0" }}>{n.distance} · {n.time}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Section>

      {open && (
        <NearbyMap
          hotel={hotel}
          places={nearby}
          selected={open}
          onSelect={setOpen}
          onClose={() => setOpen(null)}
          title="Food and drink"
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Hotel policies
// ═══════════════════════════════════════════════════════════
export function Policies({ hotel }) {
  const [open, setOpen] = useState(false);
  const key = hotel.policies.filter((p) => ["cancel", "children", "payment"].includes(p.key));

  return (
    <>
      <Section title="Hotel policies">
        <RowCard>
          {key.map((p, i) => (
            <Row
              key={p.key}
              Ico={ico(p.icon)}
              tone="neutral"
              label={p.title}
              sub={p.lines[0]}
              last={i === key.length - 1}
            />
          ))}
        </RowCard>
        <MoreButton onClick={() => setOpen(true)}>See all policies</MoreButton>
      </Section>

      <Sheet open={open} title="Hotel policies" onClose={() => setOpen(false)} full>
        <div style={{ padding: `8px ${PAD}px 26px` }}>
          {hotel.policies.map((p) => (
            <div key={p.key} style={{ paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <WellIcon Ico={ico(p.icon)} tone="neutral" size={28} icon={15} />
                <h4 style={{ ...T.h3, margin: 0 }}>{p.title}</h4>
              </div>
              {p.lines.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 9, padding: "4px 0" }}>
                  <span style={{ color: C.icon, fontSize: 14, lineHeight: 1.55 }}>·</span>
                  <p style={{ ...T.body, margin: 0, fontSize: 13 }}>{l}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Important and legal info
// ═══════════════════════════════════════════════════════════
// The amber well is the one place on the page that says "read this", which is
// exactly what a legal notice is for. It could not do that when every icon on
// the page was the same grey.
export function LegalInfo({ hotel }) {
  const [open, setOpen] = useState(false);
  const key = hotel.legal.slice(0, 3);

  return (
    <>
      <Section title="Important and legal info">
        <RowCard>
          {key.map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: 12, padding: "12px 13px", alignItems: "flex-start",
                borderBottom: i === key.length - 1 ? "none" : `1px solid ${C.div}`,
              }}
            >
              <WellIcon Ico={Info} tone="gold" />
              <p style={{ ...T.body, margin: 0, fontSize: 12.5, paddingTop: 4 }}>{l}</p>
            </div>
          ))}
        </RowCard>
        <MoreButton onClick={() => setOpen(true)}>See all information</MoreButton>
      </Section>

      <Sheet open={open} title="Important and legal info" onClose={() => setOpen(false)} full>
        <div style={{ padding: `10px ${PAD}px 26px` }}>
          {hotel.legal.map((l, i) => (
            <div key={i} style={{
              display: "flex", gap: 11, padding: "13px 0", alignItems: "flex-start",
              borderBottom: i === hotel.legal.length - 1 ? "none" : `1px solid ${C.div}`,
            }}>
              <WellIcon Ico={Info} tone="gold" size={28} icon={15} />
              <p style={{ ...T.body, margin: 0, fontSize: 13, paddingTop: 3 }}>{l}</p>
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Frequently asked questions
// ═══════════════════════════════════════════════════════════
// The app's own expandable list: no box, a hairline between rows, chevron up
// and down. Same as the add-ons list that already ships.
export function Questions({ hotel }) {
  const [open, setOpen] = useState(null);
  return (
    <Section title="Frequently asked questions">
      <div>
        {hotel.faqs.map((f, i) => {
          const on = open === i;
          return (
            <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C.div}` : "none" }}>
              <button
                onClick={() => setOpen(on ? null : i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "14px 0", border: "none", background: "none", cursor: "pointer",
                  fontFamily: "inherit", textAlign: "left",
                }}
              >
                <span style={{ ...T.lead, flex: 1, lineHeight: 1.4 }}>{f.q}</span>
                {on
                  ? <ChevronUp size={18} color={C.sub} style={{ flexShrink: 0 }} />
                  : <ChevronDown size={18} color={C.sub} style={{ flexShrink: 0 }} />}
              </button>
              {on && (
                <p style={{ ...T.body, margin: "0 0 15px", fontSize: 13, animation: "fadeUp 0.2s ease" }}>
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════
// Similar hotels
// ═══════════════════════════════════════════════════════════
export function SimilarHotels({ hotel, onOpen }) {
  if (!hotel.similar || hotel.similar.length === 0) return null;
  return (
    <Section title="Similar hotels" flush>
      <div className="hs" style={{ gap: 11, padding: `0 ${PAD}px 2px` }}>
        {hotel.similar.map((h) => {
          const cheaper = h.delta < 0;
          return (
            <button
              key={h.id}
              onClick={() => onOpen?.(h)}
              style={{
                width: 220, flexShrink: 0, borderRadius: R.card, overflow: "hidden",
                background: C.white, border: `1px solid ${C.div}`, boxShadow: SHADOW.card,
                padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                // A button centres its content vertically when it is taller
                // than that content. These cards stretch to match the tallest
                // in the row, so the one with the shortest line floated, and
                // its photo came away from the top of the card. Column layout
                // pins the photo to the top edge where it belongs.
                display: "flex", flexDirection: "column", alignItems: "stretch",
              }}
            >
              <Photo src={h.image} w="100%" h={124} radius={0} />
              <div style={{ padding: 12 }}>
                <p style={{
                  ...T.h3, margin: 0, fontSize: 13.5,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{h.name}</p>

                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 0" }}>
                  <Stars n={h.stars} size={10} />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <SourceLogo source={h.source} size={13} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head }}>{h.score.toFixed(1)}</span>
                  </span>
                </div>

                <p style={{ ...T.micro, margin: "6px 0 0", lineHeight: 1.4 }}>{h.why}</p>

                <span style={{
                  display: "inline-block", marginTop: 9, borderRadius: R.pill, padding: "5px 10px",
                  fontSize: 11.5, fontWeight: 700,
                  background: cheaper ? A.greenBg : "#FEF3F2",
                  color: cheaper ? A.green : "#B42318",
                }}>
                  {cheaper ? "Lesser by" : "More by"} ₹{Math.abs(h.delta).toLocaleString("en-IN")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
