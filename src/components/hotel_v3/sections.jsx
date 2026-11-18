import { useMemo, useState } from "react";
import HonestNote from "../HonestNote";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import {
  Waves, Utensils, Flower2, Wifi, Umbrella, Bed, Bath, Trees, ConciergeBell,
  Shield, Heart, Sparkles, Star, Info, Users, Wallet, MapPin,
  Maximize2, Sun, Hammer, ChevronRight, Check, X, FileText, Building2,
  Hotel as HotelIcon, Soup,
} from "lucide-react";
import { C } from "../../data";
import { placeNearby } from "../../data/hotelDetailData";
import { Section, WellIcon, Chip, Sheet, Photo, PAD } from "../hotel_refined/kit";
import { NearbyMap } from "../hotel_refined/sections";
import { R, SHADOW, T, A } from "../hotel_refined/tokens";

const ICONS = {
  waves: Waves, utensils: Utensils, flower: Flower2, wifi: Wifi, umbrella: Umbrella,
  bed: Bed, bath: Bath, trees: Trees, concierge: ConciergeBell, shield: Shield,
  heart: Heart, sparkles: Sparkles, star: Star, info: Info, users: Users,
  wallet: Wallet, sun: Sun, hammer: Hammer,
};
const ico = (name) => ICONS[name] || Sparkles;

// Every "there is more of this" on the page is the same inline link. A
// full-width bordered button for it was a second card under a section that had
// just finished saying it was not a card.
function More({ children, onClick, top = 14 }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 3, marginTop: top,
        border: "none", background: "none", padding: 0, cursor: "pointer",
        fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: A.pink,
      }}
    >
      {children}
      <ChevronRight size={15} color={A.pink} />
    </button>
  );
}

// A pointer. A dot, a line, nothing around it.
function Point({ children }) {
  return (
    <div style={{ display: "flex", gap: 9, padding: "4px 0" }}>
      <span style={{
        width: 4, height: 4, borderRadius: "50%", background: C.icon,
        flexShrink: 0, marginTop: 8,
      }} />
      <p style={{ ...T.body, margin: 0, fontSize: 12.5 }}>{children}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// About the stay
// ═══════════════════════════════════════════════════════════
// No photo strip and no button. There are twenty-six photos one tap up the
// page and three more captioned ones here were repeating that, at the cost of
// 140px. And a paragraph that continues is a "read more", not a "view details":
// the link belongs at the end of the sentence it continues, not two elements
// below it behind a full-width control.
export function About({ hotel }) {
  const [open, setOpen] = useState(false);

  return (
    <Section title="About the stay">
      <p style={{
        ...T.body, margin: 0,
        ...(open ? {} : { display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }),
      }}>
        {open
          ? hotel.aboutSections.map((s) => s.body).join("\n\n")
          : hotel.aboutShort}
      </p>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          marginTop: 8, border: "none", background: "none", padding: 0, cursor: "pointer",
          fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: A.pink,
        }}
      >{open ? "Read less" : "Read more"}</button>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════
// What this place offers
// ═══════════════════════════════════════════════════════════
// A bordered card with rows and a chevron-shaped button is the vocabulary of
// something you tap. These six were not tappable, so the card was making a
// promise the section could not keep. Now it is a plain two-column list of
// icon and label with no container at all, which is what a summary looks like,
// and about a third of the height.
//
// The sheet behind it carries amenities only. Food and wellness have their own
// sections on this page, so repeating them here made the list longer without
// making it more useful, and the photos in it were decoration on a reference
// list nobody browses for pleasure.
const SHEET_GROUPS = ["listed", "room", "bathroom", "outdoors", "services", "internet", "safety"];

export function Facilities({ hotel }) {
  const [open, setOpen] = useState(false);
  const groups = hotel.facilityGroups.filter((g) => SHEET_GROUPS.includes(g.key));
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const top = hotel.facilityTop.slice(0, 5);

  return (
    <>
      <Section title="What this place offers">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 12, columnGap: 10 }}>
          {top.map((f) => {
            const Ico = ico(f.icon);
            return (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <Ico size={17} color={C.sub} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: 13, color: C.head, lineHeight: 1.3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{f.label}</span>
              </div>
            );
          })}
        </div>

        <More onClick={() => setOpen(true)}>View all {total} amenities</More>
      </Section>

      <Sheet open={open} title="Amenities" onClose={() => setOpen(false)} full>
        <div style={{ padding: `6px ${PAD}px 26px` }}>
          {groups.map((g) => (
            <div key={g.key} style={{ paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                <WellIcon Ico={ico(g.icon)} tone="neutral" size={26} icon={14} />
                <h4 style={{ ...T.h3, flex: 1, margin: 0, fontSize: 14 }}>{g.title}</h4>
                <span style={{ ...T.micro }}>{g.items.length}</span>
              </div>
              {/* A plain list. Tags made forty two ordinary facts look like
                  forty two controls, and a wrapped row of pills is harder to
                  read down than a column. The tick is grey on purpose: green
                  reads as an achievement, and a hairdryer is not one. */}
              <div>
                {g.items.map((it) => (
                  <div key={it.label} style={{ display: "flex", gap: 9, padding: "6px 0", alignItems: "flex-start" }}>
                    <Check size={14} color={C.inact} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ fontSize: 13, color: C.head, lineHeight: 1.45 }}>{it.label}</span>
                      {it.note && (
                        <span style={{ fontSize: 11.5, color: C.inact }}> {it.note}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      </Sheet>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// The honest bit
// ═══════════════════════════════════════════════════════════
// What we would tell a friend before they booked. Every hotel page in the
// world lists what is good; the reason nobody believes any of them is that
// none of them says what is not.
//
// It has moved to the top of the page, above About, because it is the only
// thing on this screen the hotel did not write. Read after eight sections of
// marketing it is a footnote; read first it is the reason to trust the rest.
//
// Two treatments, both of them paper. A page that is otherwise cards and
// hairlines has nowhere to put a private note, so the note brings its own
// surface: something handwritten, from a person, that could not be mistaken
// for the property's own copy.

const INK = "#181D27";
const PAPER = "#FCF6E7";
const PAPER_EDGE = "#E6DCC4";
const RULE = "#D3C8AE";
const TICK = "#1E7F4B";
const CROSS = "#B45309";

function Mark({ good, size = 18 }) {
  return good
    ? <Check size={size} color={TICK} strokeWidth={3} style={{ flexShrink: 0 }} />
    : <X size={size} color={CROSS} strokeWidth={3} style={{ flexShrink: 0 }} />;
}

// ── A, the index card ──
// A card off a notebook, taped to the page. The rules are real: the text sits
// on them, which is what makes it read as written rather than set.
//
// Both cards are drawn small. Seven lines is the content, and once the writing
// was at postcard size the block was the tallest thing above the fold: the page
// led with a note about the hotel before it had said what the hotel was. The
// hand stays, the scale goes.
function IndexCard({ hotel }) {
  return (
    <div style={{ position: "relative", padding: "11px 5px 4px" }}>
      <span style={{
        position: "absolute", top: 0, left: "50%", width: 84, height: 20, marginLeft: -42,
        background: "#E9ECF1", opacity: 0.85, transform: "rotate(-3deg)", borderRadius: 2, zIndex: 2,
      }} />
      <div style={{
        background: C.white, border: "1px solid #D5D9E2", borderRadius: 4,
        boxShadow: "0 5px 14px rgba(24,29,39,0.09)", transform: "rotate(-1.1deg)",
        padding: "13px 14px 14px",
        backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 23px, #E3E7EE 23px, #E3E7EE 24px)",
        backgroundPosition: "0 19px",
      }}>
        {hotel.honest.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
            <span style={{ position: "relative", top: 2, display: "flex" }}>
              <Mark good={h.good} size={13} />
            </span>
            <span style={{
              fontFamily: "Caveat, cursive", fontSize: 17, lineHeight: "24px",
              fontWeight: 600, color: INK,
            }}>{h.short || h.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── B, the postcard ──
// The same seven lines, posted. The stamp is ours and it carries its own
// postmark, so the two are one mark that lands at one angle rather than two
// that have to be positioned against each other.
//
// Small, now. A postcard is a small thing you hold; at the size it was, it was
// a poster of a postcard, and it pushed About the stay off the first screen.
function Postcard({ hotel }) {
  return (
    <div style={{
      background: PAPER, border: `1px solid ${PAPER_EDGE}`, borderRadius: 5,
      boxShadow: "0 6px 14px rgba(24,29,39,0.09)", padding: "9px 12px 10px",
      display: "flex", flexDirection: "column", gap: 7, overflow: "hidden",
    }}>
      {/* Centred against the stamp, so the space above the writing and the
          space below the address lines match. */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
          <span style={{
            fontFamily: "Caveat, cursive", fontSize: 23, lineHeight: "24px",
            fontWeight: 700, color: INK,
          }}>Know before you go</span>
          <span style={{ width: 88, height: 1, background: RULE }} />
        </div>

        <img
          src="/stamp-honest.png"
          alt=""
          style={{ width: 50, height: 50, flexShrink: 0, objectFit: "contain", transform: "rotate(2deg)" }}
        />
      </div>

      <span style={{ height: 1, background: RULE }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {hotel.honest.map((h, i) => (
          <div key={i} style={{ display: "flex", gap: 7 }}>
            <span style={{ marginTop: 1, display: "flex" }}><Mark good={h.good} size={13} /></span>
            <span style={{ fontSize: 12.5, lineHeight: "17px", fontWeight: 500, color: INK }}>
              {h.short || h.title}
            </span>
          </div>
        ))}
      </div>

      <span style={{
        fontFamily: "Caveat, cursive", fontSize: 15, lineHeight: "16px", fontWeight: 600,
        color: "#8A7F66", alignSelf: "flex-end",
      }}>Happy travels, with love. 30 Sundays</span>
    </div>
  );
}

const HONEST_SUB = {
  index: "Straight off the notebook from our stay.",
  postcard: "Sent to you before you book, not after you land.",
};

// One or two lines in a hand, the same note as everywhere else the honest
// bit appears. The note carries its own heading, so the section has none.
// (The index card and postcard above are kept for the hotel labs.)
export function HonestBit({ hotel, variant = "note" }) {
  if (variant === "postcard" || variant === "index") {
    return (
      <Section title="The honest bit" sub={HONEST_SUB[variant]}>
        {variant === "postcard" ? <Postcard hotel={hotel} /> : <IndexCard hotel={hotel} />}
      </Section>
    );
  }
  const line = hotel.honestNote
    || [hotel.honest?.find((h) => h.good), hotel.honest?.find((h) => !h.good)]
      .filter(Boolean).map((h) => `${h.short || h.title}.`).join(" ");
  return (
    <Section>
      <HonestNote line={line} />
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════
// Where you'll be
// ═══════════════════════════════════════════════════════════
const pin = (colour) => L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:${colour};
      border:3px solid #fff;box-shadow:0 2px 7px rgba(0,0,0,0.32)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// ─── The three things worth knowing about a place to eat ───
//
// Whether it is in the hotel, whether it cooks Indian, and whether it is pure
// veg. For the people booking these trips those three answers decide the meal,
// and no hotel page anywhere prints them. Each has its own colour so the list
// can be read down without reading a word.
const TAGS = {
  // Blue, not brand pink. Pink is the colour of everything on this page you can
  // act on, and a label that says where a restaurant is is not a control.
  property: { label: "At the hotel", bg: "#EAF2FE", fg: "#175CD3", bd: "#CBDDFA" },
  indian: { label: "Indian", bg: "#FFF4E0", fg: "#B54708", bd: "#F2DDB4" },
  pureveg: { label: "Pure veg", bg: "#ECFDF3", fg: "#027A48", bd: "#C0E5D5" },
};
const TAG_ORDER = ["property", "indian", "pureveg"];

// The square with a dot in it. Every Indian traveller reads this mark before
// they read anything next to it, so the word is only there to confirm it.
function VegMark({ colour }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" style={{ flexShrink: 0 }} aria-hidden="true">
      <rect x="0.8" y="0.8" width="10.4" height="10.4" rx="1.6" fill="none" stroke={colour} strokeWidth="1.2" />
      <circle cx="6" cy="6" r="2.5" fill={colour} />
    </svg>
  );
}

function FoodTag({ k }) {
  const t = TAGS[k];
  if (!t) return null;
  const Ico = k === "property" ? HotelIcon : Soup;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
      fontSize: 10.5, fontWeight: 700, borderRadius: R.pill, padding: "3px 8px",
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, whiteSpace: "nowrap",
    }}>
      {k === "pureveg" ? <VegMark colour={t.fg} /> : <Ico size={10.5} strokeWidth={2.4} />}
      {t.label}
    </span>
  );
}

// One place, wherever it is listed. The same row in the section and in the
// sheet, so opening "see all" shows more of the same thing rather than
// something else that happens to hold the same names.
function PlaceRow({ n, onOpen }) {
  const tags = TAG_ORDER.filter((k) => (n.tags || []).includes(k));
  const inner = (
    <>
      <Photo src={n.image} w={58} h={58} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          ...T.lead, margin: 0, fontSize: 13.5,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{n.name}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "5px 0 0", flexWrap: "wrap" }}>
          {n.rating != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Star size={11} color={A.star} fill={A.star} strokeWidth={0} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head }}>{n.rating}</span>
              {n.count != null && <span style={{ ...T.micro }}>({n.count.toLocaleString("en-IN")})</span>}
            </span>
          )}
          {n.distance && <span style={{ ...T.micro }}>{n.distance} · {n.time}</span>}
          {n.note && (
            <span style={{
              ...T.micro, minWidth: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{n.note}</span>
          )}
        </div>

        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 5, margin: "6px 0 0", flexWrap: "wrap" }}>
            {tags.map((k) => <FoodTag key={k} k={k} />)}
          </div>
        )}
      </div>
    </>
  );

  const box = {
    display: "flex", gap: 11, width: "100%", textAlign: "left", alignItems: "center",
    border: `1px solid ${C.div}`, borderRadius: R.card, padding: 9, background: C.white,
    boxShadow: SHADOW.card,
  };

  // A restaurant inside the hotel has no pin to drop, so it is not a button.
  if (!onOpen) return <div style={box}>{inner}</div>;
  return (
    <button onClick={onOpen} style={{ ...box, cursor: "pointer", fontFamily: "inherit" }}>
      {inner}
    </button>
  );
}

// Food leads. It is the first thing anyone plans around, and the hotel's own
// restaurants belong in the same list as the ones down the road: from where the
// reader is sitting they are all just places to eat at different distances.
// A separate Food and drink section further down asked them to hold two lists
// in their head and compare them from memory.
const TAB_ORDER = ["Food and drink", "Attractions", "Essentials", "Transport"];
const SHOWN = 4;

// One number. How far from the middle of town is the question a location has
// to answer; the walk to the beach is in the first line of About, and how long
// the airport transfer takes belongs to the transfer, not the hotel.
export function Location({ hotel }) {
  const hasPlaces = hotel.hasPlaces !== false;
  const places = useMemo(() => (hasPlaces ? placeNearby(hotel) : {}), [hotel, hasPlaces]);

  const groups = useMemo(() => {
    const food = [
      ...(hotel.restaurants || []).map((r) => ({
        name: r.name,
        image: r.image,
        atProperty: true,
        note: `${r.cuisine} · ${r.openFor.join(", ")}`,
        tags: ["property", ...(r.tags || [])],
      })),
      ...(places["Food and drink"] || []),
    ];
    const out = {};
    TAB_ORDER.forEach((t) => {
      const list = t === "Food and drink" ? food : places[t];
      if (list?.length) out[t] = list;
    });
    Object.keys(places).forEach((t) => { if (!out[t]) out[t] = places[t]; });
    return out;
  }, [hotel, places]);

  const tabs = Object.keys(groups);
  const [tab, setTab] = useState(tabs[0]);
  const [open, setOpen] = useState(null);
  const [sheet, setSheet] = useState(false);

  const list = groups[tab] || [];
  const pinnable = (n) => (hasPlaces && !n.atProperty ? () => setOpen(n) : null);

  return (
    <>
      <Section title="Where you'll be" flush>
        <div style={{ padding: `0 ${PAD}px` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <WellIcon Ico={MapPin} tone="ocean" size={28} icon={15} />
            <p style={{ ...T.body, margin: 0, paddingTop: 3 }}>{hotel.address}</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <WellIcon Ico={Building2} tone="neutral" size={28} icon={15} />
            <p style={{ ...T.body, margin: 0 }}>
              {hotel.distanceFromCenter} km from {hotel.city} centre
            </p>
          </div>

          {/* The whole preview opens the map. position + zIndex give Leaflet its
              own stacking context, or its panes draw straight through any sheet
              opened over them. It only draws at all for a hotel whose record
              carries its own coordinates. A map of the wrong island is not a
              placeholder. */}
          {hasPlaces && (
            <div
              onClick={() => setOpen(list.find((n) => !n.atProperty) || null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") setOpen(list.find((n) => !n.atProperty) || null); }}
              style={{
                position: "relative", zIndex: 0, height: 168, borderRadius: R.card,
                overflow: "hidden", border: `1px solid ${C.div}`, boxShadow: SHADOW.card,
                cursor: "pointer",
              }}
            >
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
              <span
                aria-hidden
                style={{
                  position: "absolute", top: 10, right: 10, zIndex: 500,
                  width: 34, height: 34, borderRadius: R.well, background: C.white,
                  boxShadow: SHADOW.float, display: "grid", placeItems: "center",
                }}
              >
                <Maximize2 size={15} color={C.head} />
              </span>
            </div>
          )}
        </div>

        {tabs.length > 0 && (
          <>
            <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: `16px ${PAD}px 2px` }}>
              {tabs.map((t) => (
                <Chip key={t} active={tab === t} onClick={() => setTab(t)} count={groups[t].length}>{t}</Chip>
              ))}
            </div>

            {/* Four, then a door. Everything in every category made the section
                the longest on the page and the four that matter impossible to
                find inside it. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: `12px ${PAD}px 0` }}>
              {list.slice(0, SHOWN).map((n) => (
                <PlaceRow key={n.name} n={n} onOpen={pinnable(n)} />
              ))}
            </div>

            {list.length > SHOWN && (
              <div style={{ padding: `0 ${PAD}px` }}>
                <More onClick={() => setSheet(true)}>See all</More>
              </div>
            )}
          </>
        )}
      </Section>

      <Sheet open={sheet} title={tab} onClose={() => setSheet(false)} full>
        <div style={{ padding: `14px ${PAD}px 26px`, display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((n) => (
            <PlaceRow
              key={n.name}
              n={n}
              onOpen={hasPlaces && !n.atProperty ? () => { setSheet(false); setOpen(n); } : null}
            />
          ))}
        </div>
      </Sheet>

      {open && (
        <NearbyMap
          hotel={hotel}
          places={list.filter((n) => !n.atProperty)}
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
// Hotel policies
// ═══════════════════════════════════════════════════════════
// Rows in a bordered card, each with its own tinted icon, made five pieces of
// small print look like five things to tap. They are not. So the card is gone
// and the icon is the same generic one every time: a policy can be about
// cancellation, children, pets or passports, and no icon set covers that
// honestly. One mark that means "policy" is truer than five that guess.
function PolicyBlock({ p, first }) {
  return (
    <div style={{ paddingTop: first ? 0 : 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
        <FileText size={15} color={C.icon} strokeWidth={2} style={{ flexShrink: 0 }} />
        <h4 style={{ ...T.h3, margin: 0, fontSize: 13.5 }}>{p.title}</h4>
      </div>
      <div style={{ paddingLeft: 24 }}>
        {p.lines.map((l, i) => <Point key={i}>{l}</Point>)}
      </div>
    </div>
  );
}

export function Policies({ hotel }) {
  const [open, setOpen] = useState(false);
  const key = hotel.policies.filter((p) => ["cancel", "children", "payment"].includes(p.key));

  return (
    <>
      <Section title="Hotel policies">
        <div>
          {key.map((p, i) => <PolicyBlock key={p.key} p={p} first={i === 0} />)}
        </div>
        <More onClick={() => setOpen(true)}>See all policies</More>
      </Section>

      <Sheet open={open} title="Hotel policies" onClose={() => setOpen(false)} full>
        <div style={{ padding: `14px ${PAD}px 26px` }}>
          {hotel.policies.map((p, i) => <PolicyBlock key={p.key} p={p} first={i === 0} />)}
        </div>
      </Sheet>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Important and legal info
// ═══════════════════════════════════════════════════════════
// Six sentences that exist so nobody is surprised. They were already pointers;
// they were just pointers inside a box with a shadow, which is the one shape
// on this page that means "there is more behind me".
export function LegalInfo({ hotel }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Section title="Important and legal info">
        <div>
          {hotel.legal.slice(0, 3).map((l, i) => <Point key={i}>{l}</Point>)}
        </div>
        <More onClick={() => setOpen(true)}>See all information</More>
      </Section>

      <Sheet open={open} title="Important and legal info" onClose={() => setOpen(false)} full>
        <div style={{ padding: `14px ${PAD}px 26px` }}>
          {hotel.legal.map((l, i) => <Point key={i}>{l}</Point>)}
        </div>
      </Sheet>
    </>
  );
}
