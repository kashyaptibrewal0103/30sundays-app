import { useCallback, useRef, useState } from "react";
import {
  ChevronDown, ChevronUp, Info, Sparkles, TriangleAlert,
  MapPin, Star, BedDouble, FileText, CircleHelp, Building2,
} from "lucide-react";
import { C } from "../../data";
import SectionNav from "../SectionNav";
import SourceLogo from "../hotel_detail/SourceLogo";
import { SOURCES } from "../../data/hotelDetailData";
import { GREEN, AMBER, LOW_THRESHOLD } from "../../data/dayRatings";
import MediaHeader from "./MediaHeader";
import GalleryScreen from "./GalleryScreen";
import Ratings from "./Ratings";
import {
  About, Facilities, HonestBit, Location, Policies, LegalInfo,
} from "./sections";
import { Rooms, Questions, SimilarHotels } from "../hotel_refined/sections";
import StayBasicsCrisp from "../hotel_refined/StayBasicsCrisp";
import { Stars, Rule, PAD, GAP } from "../hotel_refined/kit";
import { R, SHADOW, T, A, HIGHLIGHT } from "../hotel_refined/tokens";

// ─── The hotel page ───
//
// Thirteen sections is more than anyone scrolls twice. So the page borrows the
// itinerary screen's section nav: the bar is invisible over the photos and the
// name, and the moment the first section passes under it the chips appear and
// stay. Same component, same behaviour, so a long screen in this app always
// works the same way.

// Food is not on this list any more. It is the first tab inside Where you'll
// be, where the hotel's own restaurants sit in the same list as the ones down
// the road, which is how anyone deciding where to eat actually thinks about it.
const NAV = [
  { key: "honest", label: "Honest bit", Icon: TriangleAlert },
  { key: "about", label: "About", Icon: Info },
  { key: "offers", label: "Amenities", Icon: Sparkles },
  { key: "where", label: "Location", Icon: MapPin },
  { key: "reviews", label: "Reviews", Icon: Star },
  { key: "rooms", label: "Rooms", Icon: BedDouble },
  { key: "policies", label: "Policies", Icon: FileText },
  { key: "faq", label: "FAQs", Icon: CircleHelp },
  { key: "similar", label: "Similar", Icon: Building2 },
];

// ─── Our mark on a hotel ───
//
// Some hotels on this app we have stayed in, checked and would put a friend
// in. That is worth saying on the page, once, next to the name, in the way
// every traveller already understands from the sites they use.
//
// It runs inline with the name rather than above it. On its own line it took a
// whole row off the top of the page to say one word about the hotel, and the
// row it took was the one the name was supposed to own. Inline it flows after
// the last word, so a short name keeps it on the same line and a long name
// carries it down with the wrap. Nothing below moves either way.
export function SundaysPick() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, verticalAlign: "middle",
      position: "relative", top: -2, marginLeft: 8, whiteSpace: "nowrap",
      ...HIGHLIGHT, borderRadius: R.pill, padding: "3px 9px 3px 4px",
    }}>
      <SourceLogo source="sundays" size={14} />
      <span style={{
        fontSize: 9.5, fontWeight: 800, letterSpacing: "0.5px", color: "#C00840",
        lineHeight: 1,
      }}>
        SUNDAYS PICK
      </span>
    </span>
  );
}

// ─── Every opinion, in one line ───
//
// The same card the reviews section uses, shrunk to the smallest form that
// still says something: a mark and a number each, no site names, no counts.
// Whoever is reading this has a Booking.com tab open somewhere and is hunting
// for the number they came for; the row hands it to them without asking them
// to scroll eight sections for it.
//
// Ours leads and is the only one with words attached, because a percentage of
// our own travellers is the claim and the others are corroboration. Tripadvisor
// comes off at this size: a fourth number buys nothing here and it is the one
// that would push the sentence onto a second line.
export function ScoreStrip({ hotel, onOpen, sources, ours = true, max = 2 }) {
  const split = hotel.starSplit?.sundays || [];
  const pct = Math.round((split[0] || 0) + (split[1] || 0));
  const low = pct < LOW_THRESHOLD;
  const others = (sources || ["booking", "google", "tripadvisor"])
    .filter((k) => hotel.ratings[k])
    .slice(0, max);
  const mine = ours && !!hotel.ratings.sundays;
  if (!mine && others.length === 0) return null;

  return (
    <button
      onClick={onOpen}
      aria-label="See ratings and reviews"
      style={{
        display: "flex", alignItems: "stretch", width: "100%", marginTop: 12,
        background: C.white, border: `1px solid ${C.div}`, borderRadius: R.card,
        boxShadow: SHADOW.card, overflow: "hidden", padding: 0,
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {mine && (
        <span style={{
          flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6,
          padding: "9px 10px",
        }}>
          <SourceLogo source="sundays" size={16} />
          <span style={{
            minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            <span style={{
              fontSize: 13, fontWeight: 800, color: low ? AMBER : GREEN,
              fontVariantNumeric: "tabular-nums",
            }}>{pct}%</span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub }}>
              {" "}of travellers enjoyed it
            </span>
          </span>
        </span>
      )}

      {/* The scale travels with the score. 9.2 and 4.6 side by side with
          nothing between them invite the reader to compare them directly. */}
      {others.map((k) => (
        <span
          key={k}
          title={SOURCES[k].name}
          style={{
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "9px 9px", borderLeft: `1px solid ${C.div}`,
          }}
        >
          <SourceLogo source={k} size={15} />
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 1 }}>
            <span style={{
              fontSize: 13, fontWeight: 800, color: C.head, fontVariantNumeric: "tabular-nums",
            }}>{hotel.ratings[k].score.toFixed(1)}</span>
            <span style={{ fontSize: 9.5, fontWeight: 600, color: C.inact }}>
              /{hotel.ratings[k].outOf}
            </span>
          </span>
        </span>
      ))}
    </button>
  );
}

export default function HotelV3({
  hotel,
  onBack,
  bottomBar = null,
  onPickRoom,
  onOpenSimilar,
  selectedRoomId,
  jumpRef,
  // The three places this screen opens from each bring something of their own:
  // a booking card or a stay summary above the fold, perks and add-ons after
  // the rooms, a confirmation popup over everything. They are slots rather
  // than flags so the screen never has to know which flow it is in.
  stay = null,
  extras = null,
  overlay = null,
  // A booked or saved hotel has nothing to choose and nothing to pay, so the
  // room prices and the picker come off.
  readOnly = false,
  // What the rooms section is called. A booked hotel says "Your room"; a hotel
  // on somebody else's trip is not yours, so that screen passes its own.
  roomsTitle,
  // The room already on the trip, when this is the customer's own hotel. The
  // rooms section then leads with it and keeps the rest behind one tap.
  currentRoomId,
  nights = 3,
  // Which paper the honest bit is written on. The postcard is the one we
  // picked, so it is what every screen gets unless it asks for the other.
  honestVariant = "postcard",
}) {
  const [gallery, setGallery] = useState(null);
  const scroller = useRef(null);

  // Anchors for the section nav. Held in a ref rather than state: they are
  // read on scroll, never rendered from.
  const sectionEls = useRef({});
  const setEl = useCallback((key) => (el) => { sectionEls.current[key] = el; }, []);
  const elFor = useCallback((key) => sectionEls.current[key] || null, []);

  // The footer needs to be able to send you to a section, so the page hands
  // the jump out rather than the footer reaching back in.
  const jumpTo = useCallback((key) => {
    const el = sectionEls.current[key];
    const box = scroller.current;
    if (!el || !box) return;
    box.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
  }, []);
  if (jumpRef) jumpRef.current = jumpTo;

  // A chip that scrolls to nothing is worse than a missing chip, so the nav
  // drops any section this hotel does not have.
  const nav = NAV.filter((n) => n.key !== "similar" || hotel.similar?.length > 0);

  const toReviews = () => {
    const el = sectionEls.current.reviews;
    const box = scroller.current;
    if (!el || !box) return;
    box.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", height: "100%", background: C.white, overflow: "hidden" }}>
      <div
        ref={scroller}
        className="hide-scrollbar"
        style={{ height: "100%", overflowY: "auto", paddingBottom: bottomBar ? 100 : 30 }}
      >
        <SectionNav sections={nav} elFor={elFor} title={hotel.name} onBack={onBack} variant="soft" />

        <MediaHeader
          hotel={hotel}
          onBack={onBack}
          onGallery={(cat) => setGallery(cat)}
          onShare={() => {}}
        />

        <div style={{ padding: `18px ${PAD}px 0` }}>
          <h1 style={{ ...T.h1, margin: 0 }}>
            {hotel.name}
            {hotel.sundaysPick !== false && <SundaysPick />}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 0", flexWrap: "wrap" }}>
            <Stars n={hotel.stars} size={13} />
            <span style={{ ...T.meta, fontSize: 12.5 }}>
              {hotel.stars} star {hotel.type.toLowerCase()} · {hotel.neighbourhood}
            </span>
          </div>
          <ScoreStrip hotel={hotel} onOpen={toReviews} />
        </div>

        {stay}

        {/* The honest bit goes first, in About's old place. It is the only
            block on this page the hotel did not write, and read after eight
            sections of its own copy it is a footnote. Read first it is the
            reason to believe the eight sections. */}
        <Rule />
        <div ref={setEl("honest")}><HonestBit hotel={hotel} variant={honestVariant} /></div>
        <Rule />
        <div ref={setEl("about")}><About hotel={hotel} /></div>
        <Rule />
        <div ref={setEl("offers")}><Facilities hotel={hotel} /></div>
        <Rule />
        <div ref={setEl("where")}><Location hotel={hotel} /></div>
        {/* No rule either side: the band is its own edge. */}
        <div ref={setEl("reviews")} style={{ marginTop: GAP }}><Ratings hotel={hotel} /></div>
        <div ref={setEl("rooms")}>
          <Rooms
            hotel={hotel}
            onPick={onPickRoom}
            selectedId={selectedRoomId}
            readOnly={readOnly}
            title={roomsTitle}
            currentId={currentRoomId}
            nights={nights}
          />
        </div>
        {extras}
        <Rule />
        <StayBasicsCrisp hotel={hotel} />
        <Rule />
        <div ref={setEl("policies")}><Policies hotel={hotel} /></div>
        <Rule />
        <LegalInfo hotel={hotel} />
        <Rule />
        <div ref={setEl("faq")}><Questions hotel={hotel} /></div>
        <Rule />
        {hotel.similar?.length > 0 && (
          <div ref={setEl("similar")}>
            <SimilarHotels hotel={hotel} onOpen={onOpenSimilar} />
          </div>
        )}

        <div style={{ height: 28 }} />
      </div>

      {bottomBar}
      {overlay}

      {gallery && (
        <GalleryScreen hotel={hotel} startCategory={gallery} onClose={() => setGallery(null)} />
      )}
    </div>
  );
}

// ─── The footer ───
//
// Two steps, because that is how many decisions there are. Nothing is chosen
// when you arrive on a hotel you are considering, so the bar asks for the one
// thing it needs and takes you to it. Only once a room is picked does it know
// a price, and only then can it honestly offer to make the swap. The old bar
// quoted a total for a room the customer had never agreed to.
export function ReplaceBar({ hotel, room, onReplace, onSelectRoom }) {
  const [open, setOpen] = useState(false);
  const cur = hotel.currentStay;
  const inr = (n) => `₹${Math.abs(n).toLocaleString("en-IN")}`;

  const shell = {
    position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 120,
    padding: `10px ${PAD}px 14px`,
    background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 26%)",
  };
  const cardStyle = {
    background: C.white, border: `1px solid ${C.div}`, borderRadius: R.hero,
    boxShadow: SHADOW.raised, overflow: "hidden",
  };
  const cta = {
    flexShrink: 0, height: 46, padding: "0 20px", borderRadius: R.card, border: "none",
    background: A.pink, color: "#fff", cursor: "pointer",
    fontFamily: "inherit", fontSize: 14.5, fontWeight: 700,
    boxShadow: "0 4px 14px rgba(253,1,79,0.3)",
  };

  // ── Step one ──
  // No number here. Every price on this screen is a total for a room the
  // customer has not picked, and quoting one before they have picked it either
  // gets anchored on or contradicted a tap later. The space goes to saying
  // which hotel they are looking at instead.
  if (!room) {
    return (
      <div style={shell}>
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 12, padding: "13px 14px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              ...T.lead, margin: 0, fontSize: 13.5,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{hotel.name}</p>
            <p style={{ ...T.micro, margin: "3px 0 0" }}>3 nights, 2 travellers</p>
          </div>
          <button onClick={onSelectRoom} style={cta}>Select a room</button>
        </div>
      </div>
    );
  }

  // ── Step two ──
  // The difference, and only the difference. This is a swap, not a purchase:
  // the customer has already paid for a hotel, so the number that decides
  // anything is what changes, and a five figure total beside it only invites
  // the arithmetic back.
  const delta = hotel.total + room.priceDelta - cur.total;

  return (
    <div style={shell}>
      <div style={cardStyle}>
        {open && (
          <div style={{ display: "flex", gap: 12, padding: "13px 14px 0" }}>
            <img
              src={cur.image}
              alt=""
              style={{ width: 62, height: 62, borderRadius: R.well, objectFit: "cover", flexShrink: 0, background: A.photoBg }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ ...T.lead, margin: "0 0 3px", fontSize: 13.5 }}>{cur.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                <Stars n={cur.stars} size={11} />
                <span style={{ ...T.micro }}>{cur.score} rated</span>
              </div>
              <p style={{ ...T.micro, margin: 0 }}>{cur.room} · {cur.mealPlan}</p>
            </div>
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: open ? "11px 14px 13px" : "13px 14px",
        }}>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none",
              padding: 0, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ ...T.micro, fontSize: 11 }}>Replacing</span>
              <span style={{
                fontSize: 11.5, fontWeight: 700, color: C.sub, minWidth: 0,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{cur.name}</span>
              {open
                ? <ChevronDown size={14} color={C.icon} style={{ flexShrink: 0 }} />
                : <ChevronUp size={14} color={C.icon} style={{ flexShrink: 0 }} />}
            </span>

            <span style={{
              ...T.money, display: "block", marginTop: 3, whiteSpace: "nowrap",
              color: delta > 0 ? C.head : A.green,
            }}>
              {delta === 0 ? "No change in price" : `${delta > 0 ? "+" : "-"} ${inr(delta)}`}
            </span>
            <span style={{
              ...T.micro, display: "block", marginTop: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {room.name}
            </span>
          </button>

          <button onClick={onReplace} style={cta}>Replace hotel</button>
        </div>
      </div>
    </div>
  );
}
