import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft, ArrowRight, Check, X as XIcon, Star, MapPin, Clock, Images,
  Plane, Car, CarTaxiFront, TrainFront, TramFront, Ship, Footprints, Bike, Bus,
  BedDouble, ChevronDown, ChevronUp, Sparkles, Hotel, ShoppingBag,
  Plus, Minus,
} from "lucide-react";
import { C, customerPhotos } from "../data";
import { regionDetail } from "../data/regionData";
import { regionFaq } from "../data/regionFaq";
import { regionReach } from "../data/regionReach";
import { cityCoords } from "../data/buildData";
import { sightCoords } from "../data/sightCoords";
import { areaCoords } from "../data/areaCoords";
import { regionsFor } from "../data/discoverData";
import { cityVibes } from "../data/dayOptions";
import { useSaves } from "../data/saves";
import { useWishlist } from "../data/wishlist";
import { tripsThroughCity } from "../data/bookedTrips";
import { generateHotelsForCity } from "../data/hotelData";
import { SKY_WORD, monthAdvice } from "../data/weatherData";
import { buildActivityDetail, activityFlags, flagChipList } from "../data/activityData";
import { cityTags } from "../data/cityTags";
import { KIND_TONE, activityKind } from "../data/activityKind";
import { kindGlyph } from "../data/kindGlyph";
import { FOOD_TAG, sortTags } from "../data/regionFood";
import { regionShops, SHOP_TAG } from "../data/regionShops";
import SaveHeart from "../components/SaveHeart";
import { SKY_STYLE, SKY_CHIP } from "../components/skyStyle";
import { SEASON_COLOR, SEASON_TINT, SEASON_LABEL, SEASON_MEANING } from "../components/seasonStyle";
import { R, SHADOW, T, WELL, A } from "../components/hotel_refined/tokens";
import CardReel from "../components/CardReel";
import BookedCard from "../components/booked_lab/BookedCard";
import { ActivityScreen } from "./DayDetailLab";
import HotelV3 from "../components/hotel_v3/HotelV3";
import { detailFromHotel } from "../data/hotelDetailAdapter";
import SourceLogo from "../components/hotel_detail/SourceLogo";

// ─── One region, in full ───
//
// A couple choosing between Hanoi and Hoi An is working through a list of
// questions nobody had answered in one place. This page is that list, in the
// order they ask it: what is there to do, how do we get there, what is the
// weather like, how do we move around, where do we stay, is it worth it, and
// who has already been.
//
// The shape is the day detail screen's. Each region is a card in a deck you
// push sideways, with the next region peeking in at the edge so the gesture is
// visible rather than guessed at. Scrolling a card lifts its sheet over the
// footage and the card grows out to the full screen as it goes, which is how
// the same surface is both a thing you browse and a thing you read.

const PAD = 16;

// ─── What a heart keeps ───
//
// The wishlist files everything under the destination it was tapped in and
// draws a row from a snapshot: a name, a picture if we hold one, and a small
// line under the name. These write that snapshot for each kind of thing on
// this page, so the Saved screen says the same about a place as the page did.
// The id is whatever the live data already calls the thing: `city::name` for
// an activity, a restaurant or a shop, and the hotel's own name for a hotel.
const placeId = (city, name) => `${city}::${name}`;
const actMeta = (a, city) => ({ name: a.name, img: a.img, sub: city, city });
const foodMeta = (f, city) => ({
  name: f.name, img: f.img, city,
  sub: [sortTags(f.tags)[0], f.area].filter(Boolean).join(" · "),
});
const shopMeta = (s, city) => ({ name: s.name, city, sub: [s.tag, s.area].filter(Boolean).join(" · ") });
const hotelMeta = (h, city) => ({ name: h.name, img: h.images?.[0]?.url, city, sub: `${city} · ${h.stars}-star`, stars: h.stars, score: h.bookingScore });

// ─── One region, on one page ───
//
// This screen used to be a deck of regions you pushed sideways, with a name and
// two arrows in the header to step between them. Both are gone. The photographs
// at the top are a reel you swipe now, and two horizontal gestures on one
// surface cannot both win: swiping a picture is what people expect, and
// stepping between regions already has two better doors, the destination
// screen and Pair with at the foot of this page.


const clamp = (lines) => ({
  display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden",
});

// ─── Three lines, then the rest ───
//
// The lead and the description are one block, capped at three lines together,
// with the rest behind a link. One block rather than two because a couple reads
// it as one paragraph, and capping only the second half leaves a bold line
// floating above a truncated one.
//
// The link measures before it offers itself and only appears when the text
// really is longer, because a "Read more" that reveals nothing is worse than no
// link at all. The descriptions are short today and will grow; the cap is what
// keeps that growth from pushing the whole page below the fold.
function ReadMore({ lead, sub, children, lines = 3 }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setOver(el.scrollHeight - el.clientHeight > 2);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lead, sub, children, lines]);

  return (
    <>
      <div ref={ref} style={{ margin: "7px 0 0", ...(open ? {} : clamp(lines)) }}>
        {lead && <span style={{ ...T.lead, lineHeight: 1.45 }}>{lead} </span>}
        {sub && <span style={{ ...T.body, lineHeight: 1.45 }}>{sub} </span>}
        {children && <span style={{ ...T.body, lineHeight: 1.45 }}>{children}</span>}
      </div>
      {(over || open) && (
        <button onClick={() => setOpen((v) => !v)} style={{
          margin: "5px 0 0", padding: 0, border: "none", background: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: C.p600,
        }}>{open ? "Read less" : "Read more"}</button>
      )}
    </>
  );
}

// ─── Where in the country this is ───
//
// A region page that never shows a map asks a couple to know, from the name
// alone, whether Ubud is next to Seminyak or a day away from it. Everything
// pinned here has real coordinates behind it: the regions come from the route
// builder's own table and the sights from their own, and the distances are
// measured off those rather than written down.
// ─── The Maps button ───
//
// A word and a scrap of map, the way the share sheet on a phone offers one. It
// reads as a map before it is read as a button, which a pin on its own does not.
//
// The scrap was four real OpenStreetMap tiles of the region, which was a nice
// trick and the wrong answer twice over. At forty pixels a real map is mush,
// and it came with the city's name printed across it, which made it look like a
// map of Hanoi rather than the way in to the map. This is a drawn one: two
// roads, a park and some water, in the page's own greys so it is clearly a
// picture of a map and not a map. Nothing to fetch and nothing to read.
function MapGlyph({ w, h }) {
  const roads = (
    <>
      <path d="M-2 9 L46 18" />
      <path d="M15 -2 L26 30" />
    </>
  );
  return (
    <svg viewBox="0 0 44 28" width={w} height={h} style={{ display: "block" }} aria-hidden>
      <rect width="44" height="28" fill="#EDF1F5" />
      <path d="M0 19 H13 L19 28 H0 Z" fill="#DCEBD7" />
      <path d="M31 0 H44 V11 Q36 9 31 0 Z" fill="#CFE3F5" />
      <g stroke="#DCE2E8" strokeWidth="4.6" fill="none" strokeLinecap="round">{roads}</g>
      <g stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round">{roads}</g>
    </svg>
  );
}

// The tile itself: a drawn map with a pin on it, bordered so it holds its own
// against whatever it sits on. Used on its own where there is no room for a
// word, and with one where there is.
function MapTile({ w = 46, h = 29, pin = 16 }) {
  return (
    <span style={{
      position: "relative", width: w, height: h, flexShrink: 0, overflow: "hidden",
      borderRadius: 8, border: `1px solid ${C.icon}`, display: "flex",
    }}>
      <MapGlyph w={w} h={h} />
      {/* Blue, like every map app's pin, so it reads as a marker at a glance
          rather than as one more pink accent. */}
      <MapPin
        size={pin}
        fill={C.b600}
        color="#fff"
        strokeWidth={1.8}
        style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -58%)",
          filter: "drop-shadow(0 1px 2px rgba(16,24,40,0.35))",
        }}
      />
    </span>
  );
}

function MapsButton({ onClick, label = true, w = 46, h = 29, pin = 16 }) {
  return (
    /* The map sits inside the box with white all round it and a darker edge of
       its own. Flush and hairlined, its corner met the page's grey and the
       whole thing dissolved into the background. */
    <button onClick={onClick} aria-label="Open the map" style={{
      flexShrink: 0, display: "inline-flex", alignItems: "center",
      border: `1px solid ${C.div}`, background: C.white, borderRadius: label ? 11 : 10,
      padding: 3, cursor: "pointer", fontFamily: "inherit", boxShadow: SHADOW.card,
    }}>
      {label && (
        <span style={{
          display: "flex", alignItems: "center", padding: "0 9px 0 7px",
          fontSize: 11.5, fontWeight: 700, color: C.head, letterSpacing: "-0.1px",
        }}>Maps</span>
      )}
      <MapTile w={w} h={h} pin={pin} />
    </button>
  );
}

// ─── A pin you can read ───
//
// These were numbered 1 to 7, counted outwards from the centre, matching a
// number on the card. That works, but it makes the map a lookup table: you tap
// a dot to find out what it is, and nothing on the screen says whether the
// thing nearest the old town is a temple or a tailor.
//
// So the pin says the name, with the kind of thing it is drawn beside it. The
// colours are the same ones the tags on the cards use, so a market pin and a
// market tag are the same pink. The chosen one fills with brand colour and
// comes to the front.
const sightPin = (name, kind, on) => {
  const tone = KIND_TONE[kind] || KIND_TONE.Culture;
  const bg = on ? C.p600 : "#fff";
  const ink = on ? "#fff" : C.head;
  const chipBg = on ? "rgba(255,255,255,0.22)" : tone.bg;
  const chipInk = on ? "#fff" : tone.fg;
  return L.divIcon({
    className: "sight-pin",
    html: `<div style="transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:5px;
        background:${bg};border-radius:999px;padding:3px 9px 3px 3px;
        box-shadow:0 2px 8px rgba(0,0,0,0.26);white-space:nowrap">
        <span style="width:19px;height:19px;border-radius:50%;background:${chipBg};
            display:flex;align-items:center;justify-content:center;flex-shrink:0"
          >${kindGlyph(kind, { size: 12, colour: chipInk })}</span>
        <span style="font-family:Figtree,sans-serif;font-size:11px;font-weight:800;color:${ink};
            max-width:116px;overflow:hidden;text-overflow:ellipsis">${escapeHtml(name)}</span>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// The names are ours, not anybody's input, but a pin is raw markup and an
// apostrophe in "Angel's Billabong" should stay an apostrophe.
function escapeHtml(t = "") {
  return t.replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

// The town itself, named on the map rather than left as one more dot. This is
// the honest way to answer "where is Ubud": we hold a centre point for every
// region and no boundary for any of them, so the page marks the point it has
// instead of drawing an outline it would be inventing.
// The label hangs below the dot rather than beside it. The sights nearest the
// centre are the ones a couple cares about most, and they sit on top of it: a
// label stretching sideways covered two or three of them every time.
const centrePin = (label) => L.divIcon({
  className: "sight-pin is-centre",
  html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;transform:translate(-50%,-11px)">
      <div style="width:18px;height:18px;border-radius:50%;background:${C.p600};
          border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.34)"></div>
      <div style="background:#fff;border-radius:999px;padding:3px 9px;
          box-shadow:0 2px 8px rgba(0,0,0,0.22);white-space:nowrap;
          font-family:Figtree,sans-serif;font-size:11.5px;font-weight:800;color:#181D27">${label}</div>
    </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// Straight-line distance, which is the only one we can honestly state: we hold
// coordinates, not road times. So a sight is "4 km from the centre", never
// "15 minutes away", and two regions are a distance "apart", never "away".
function kmApart(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const kmLabel = (km) => (km < 1 ? "In the centre" : `${km < 10 ? km.toFixed(1) : Math.round(km)} km from the centre`);

// ─── A sight is only pinned if we know where it is ───
//
// Two filters, and the second one is the important one. Most of the catalogue
// is things like "Beach day" and "Spa afternoon", which are real things to do
// that are not anywhere in particular, so they have no entry and get no pin.
//
// The distance check is the safety net: the coordinates are keyed by the
// activity's name, and a handful of names repeat across countries ("Fish market
// tour" is in both Malé and Auckland). Anything that lands implausibly far from
// the region it is supposed to belong to is dropped rather than drawn in the
// wrong ocean. Day trips are legitimately far (Hobbiton is eighty kilometres
// from Rotorua, Milford Sound nearly three hundred from Queenstown), so the
// limit is generous; it only has to catch the wrong continent.
const SAME_REGION_KM = 350;

function pinnedSights(acts, here) {
  if (!here) return [];
  return acts
    .map((a) => {
      const c = sightCoords(a.name);
      if (!c) return null;
      const km = kmApart(here, c);
      return km > SAME_REGION_KM ? null : { ...a, lat: c.lat, lng: c.lng, km };
    })
    .filter(Boolean)
    .sort((x, y) => x.km - y.km);
}

// ─── Labels that keep off each other ───
//
// A name is longer than a number, and the things to do in a town are mostly in
// the same few streets, so at a zoom that also fits a day trip an hour away
// four of them land on the same spot. A dot can afford to overlap a dot. A
// label cannot: the one underneath is simply not there.
//
// So after every move the pins are walked in order, nearest the centre first,
// and any one that lands on a label already placed drops by its own height
// until it is clear. The first pin never moves, the shift is a line or two at
// most, and the label stays plainly attached to its part of the map.
//
// Done in the DOM rather than in the data because it is a question about
// pixels: the same two sights collide at one zoom and separate at the next.
// As far as a label is ever moved off its own point. Roughly three stacked
// labels; past that the shift would be saying something false about where the
// place is, and overlapping is the lesser wrong.
const NUDGE = 92;

function Declutter({ count, pick }) {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane("markerPane");
    if (!pane) return undefined;

    const run = () => {
      // The marker element Leaflet positions is a zero-sized point; the label
      // is the child hanging off it, so the child is what gets measured and
      // what gets moved.
      const labels = [...pane.querySelectorAll(".sight-pin")]
        .map((el) => el.firstElementChild)
        .filter(Boolean);
      labels.forEach((el) => { el.style.marginTop = "0px"; });

      // The town goes down first and never moves: it is the thing the map is
      // answering about, and the sights nearest it are exactly the ones that
      // land on top of it. After that, highest on the screen keeps its place
      // and anything clashing with it goes under, which is the order a stack of
      // labels reads in anyway.
      const rows = labels
        .map((el) => ({ el, r: el.getBoundingClientRect(), centre: el.parentElement.classList.contains("is-centre") }))
        .sort((a, b) => (Number(b.centre) - Number(a.centre)) || (a.r.top - b.r.top));

      const placed = [];
      const clash = (top, r) => placed.find((q) =>
        top < q.bottom + 2 && top + r.height + 2 > q.top &&
        r.left < q.right + 3 && r.left + r.width + 3 > q.left);

      // How far this label has to move, one way, to clear everything already
      // down. Each step jumps clean past whatever it hit rather than feeling
      // its way in fixed increments, which is what a run of stacked labels
      // needs: the thing in the way may be the town pin, half as tall again as
      // a label.
      const slide = (r, dir) => {
        let d = 0;
        for (let i = 0; i < 8; i += 1) {
          const hit = clash(r.top + d, r);
          if (!hit) return d;
          d = dir > 0 ? hit.bottom + 3 - r.top : hit.top - 3 - r.height - r.top;
          if (Math.abs(d) > NUDGE) return null;
        }
        return null;
      };

      rows.forEach(({ el, r, centre }) => {
        // Up or down, whichever is the shorter move, so a stack opens around
        // its point rather than hanging below it. A label with nowhere to go
        // inside the limit stays where it is and overlaps, which at least
        // leaves it honest about where the thing actually is.
        const down = centre ? 0 : slide(r, 1);
        const up = centre ? null : slide(r, -1);
        const both = [down, up].filter((d) => d != null);
        const drop = both.length ? both.reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a)) : 0;
        if (drop) el.style.marginTop = `${drop}px`;
        placed.push({
          top: r.top + drop, bottom: r.top + drop + r.height,
          left: r.left, right: r.left + r.width,
        });
      });
    };

    // Straight away, and again twice after: the first pass runs before Leaflet
    // has finished placing anything, and the one after that can still measure a
    // label set in the fallback font, which is narrower than Figtree and hides
    // a clash that appears the moment the real font lands.
    run();
    const ids = [setTimeout(run, 120), setTimeout(run, 450)];
    document.fonts?.ready.then(run).catch(() => {});
    map.on("zoomend moveend", run);
    return () => { ids.forEach(clearTimeout); map.off("zoomend moveend", run); };
  }, [map, count, pick]);
  return null;
}

// ─── Getting closer ───
//
// The view opens on the whole destination, which is the point: it answers where
// the region sits. The cost is that the sights inside the town itself stack up
// at that zoom, so these are here to get in. Pinch does the same thing, but not
// everybody pinches and nobody pinches on a laptop.
function Zoom() {
  const map = useMap();
  const btn = {
    width: 34, height: 34, border: "none", background: C.white, cursor: "pointer",
    display: "grid", placeItems: "center", padding: 0,
  };
  return (
    <div style={{
      position: "absolute", right: 12, zIndex: 600,
      top: "calc(104px + env(safe-area-inset-top, 0px))",
      borderRadius: R.well, overflow: "hidden", boxShadow: SHADOW.float,
    }}>
      <button onClick={() => map.zoomIn()} aria-label="Zoom in" style={{ ...btn, borderBottom: `1px solid ${C.div}` }}>
        <Plus size={16} color={C.head} />
      </button>
      <button onClick={() => map.zoomOut()} aria-label="Zoom out" style={btn}>
        <Minus size={16} color={C.head} />
      </button>
    </div>
  );
}

// ─── The card that rises off a pin ───
//
// Tapping a pin brings up one card from the bottom of the screen, the way a
// listing does on a map you have used before. One card, not a rail of them: the
// pin you pressed is the thing you asked about, and a rail puts six answers
// under a question about one.
//
// The whole card is the way in. There is no separate button, because a card
// that appears when you press a pin and does nothing when you press it is a
// card that has taught you not to press it.
//
// The heart sits beside the title, bare, because the card is white. It is a
// button inside what used to be a button, so the card is a div that acts as
// one now: a button cannot hold another button.
function PinCard({ img, title, meta, chips = [], rating, saved, onSave, onOpen, onClose }) {
  return (
    <div style={{
      position: "absolute", left: 12, right: 12, bottom: 16, zIndex: 650,
      animation: "sheetSlideUp 0.22s cubic-bezier(0.22,0.61,0.36,1)",
    }}>
      <div style={{
        position: "relative", background: C.white, borderRadius: R.card,
        boxShadow: SHADOW.float, overflow: "hidden",
      }}>
        <div
          onClick={onOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
          style={{
            display: "flex", gap: 12, alignItems: "center", width: "100%", textAlign: "left",
            background: "none", border: "none", padding: 11, cursor: "pointer", fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        >
          <img src={img} alt="" style={{ width: 64, height: 64, flexShrink: 0, borderRadius: R.well, objectFit: "cover", display: "block", background: A.photoBg }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            {/* Only the title row clears the close button, which sits on its
                line. Giving the whole column that padding pushed the chips onto
                a second row for no reason. */}
            <span style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 22 }}>
              <span style={{ ...T.h3, fontSize: 14.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
              {onSave && <SaveHeart size={28} saved={!!saved} onToggle={onSave} />}
            </span>
            <span style={{ ...T.micro, display: "block", marginTop: 3 }}>{meta}</span>
            <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
              {/* The same score the activity page opens with, off the same
                  generator, so the card cannot disagree with the page it
                  leads to. */}
              {rating && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Star size={11} color={A.star} fill={A.star} strokeWidth={0} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.head }}>{rating.score}</span>
                  <span style={{ ...T.micro }}>({rating.count})</span>
                </span>
              )}
              {/* And the chips it opens with too, both of them where it has
                  two. It used to carry one tag of this page's own invention,
                  which said a different thing from the page behind it. */}
              {chips.map((c) => (
                <span key={c.key} style={{
                  padding: "3px 8px", borderRadius: R.pill,
                  background: c.bg, color: c.color, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
                }}>{c.icon} {c.label}</span>
              ))}
            </span>
          </span>
        </div>

        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%",
          border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer",
        }}><XIcon size={13} color={C.sub} /></button>
      </div>
    </div>
  );
}

// ─── The map ───
//
// The destination, the town marked and named on it, and the things to do around
// the town numbered outwards from it. Tapping a pin raises its card; tapping the
// card opens the activity. So the map is a way into the page rather than a
// picture of it.
//
// It used to carry the other regions on a second tab and a count of how many
// sights it could place. Both are gone: the regions have their own section at
// the foot of the page, and a badge reading "7 of 9 mapped" was the page
// talking about its own data rather than about Ubud.
function RegionMapScreen({ dest, city, acts, onOpenAct, onClose }) {
  const here = cityCoords[city];
  const sights = useMemo(() => pinnedSights(acts || [], here), [acts, here]);
  const [pick, setPick] = useState(null);
  const { isSaved, toggle } = useWishlist();

  const span = useMemo(() => {
    // ─── Every pin, deliberately ───
    //
    // The view opens on the whole destination with the region placed on it,
    // because that is the question the map is being asked: where is Ubud in
    // Bali. The cost is that one far day trip widens it, and that the pins in
    // the town itself stack up at that zoom. Milford Sound is three hundred
    // kilometres from Queenstown and pulls the view out to half the South
    // Island. The zoom buttons are the answer to both; dropping the far pin
    // from the fit is the other answer, and a tighter opening view is the
    // trade it costs.
    const all = [here, ...sights.map((x) => ({ lat: x.lat, lng: x.lng }))];
    const lat = all.map((c) => c.lat);
    const lng = all.map((c) => c.lng);
    // A single pin would otherwise fit a zero-sized box and land on a roof.
    const pad = Math.max(0.035, (Math.max(...lat) - Math.min(...lat)) * 0.3);
    return [
      [Math.min(...lat) - pad, Math.min(...lng) - pad],
      [Math.max(...lat) + pad, Math.max(...lng) + pad],
    ];
  }, [sights, here]);

  const chosen = sights.find((x) => x.id === pick);
  // The score the activity page will open with, read off the same builder, so
  // the card and the page can never show two different numbers.
  const rating = useMemo(() => {
    if (!chosen) return null;
    const d = buildActivityDetail({ name: chosen.name }, { city, country: dest });
    return { score: d.rating, count: Number(d.reviewCount).toLocaleString("en-IN") };
  }, [chosen, city, dest]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 300, background: C.white }}>
      <MapContainer
        bounds={span}
        style={{ height: "100%", width: "100%", background: "#AADAFF" }}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Zoom />
        <Declutter count={sights.length} pick={pick} />

        {/* The town, named, and deliberately underneath everything else. The
            numbered pins are what you came to press, and the ones nearest the
            centre land right on top of this one. */}
        <Marker position={[here.lat, here.lng]} icon={centrePin(city)} zIndexOffset={-500} />

        {sights.map((x) => (
          <Marker
            key={x.id}
            position={[x.lat, x.lng]}
            icon={sightPin(x.name, x.kind, pick === x.id)}
            zIndexOffset={pick === x.id ? 1000 : 0}
            eventHandlers={{ click: () => setPick(x.id) }}
          />
        ))}
      </MapContainer>

      <div style={{
        position: "absolute", left: 12, right: 12, zIndex: 600,
        top: "calc(12px + env(safe-area-inset-top, 0px))",
        display: "flex", alignItems: "center", gap: 9, pointerEvents: "none",
      }}>
        <button onClick={onClose} aria-label="Close map" style={{
          pointerEvents: "auto", width: 36, height: 36, borderRadius: "50%", border: "none",
          background: C.white, boxShadow: SHADOW.float, display: "grid", placeItems: "center",
          cursor: "pointer", flexShrink: 0,
        }}><XIcon size={18} color={C.head} /></button>
        <span style={{
          pointerEvents: "auto", background: C.white, borderRadius: R.pill, padding: "9px 14px",
          boxShadow: SHADOW.float, fontSize: 12.5, fontWeight: 700, color: C.head,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{city} in {dest}</span>
      </div>

      {chosen && (
        <PinCard
          img={chosen.img}
          title={chosen.name}
          meta={kmLabel(chosen.km)}
          chips={flagChipList(activityFlags(chosen.name)).slice(0, 2)}
          rating={rating}
          saved={isSaved("activity", dest, chosen.id)}
          onSave={() => toggle("activity", dest, chosen.id, actMeta(chosen, city))}
          onOpen={() => onOpenAct(chosen)}
          onClose={() => setPick(null)}
        />
      )}
    </div>
  );
}

// ─── The gallery ───
// One grid, not two tabs. Splitting the region's own photographs from the ones
// customers sent made a couple choose which half of the pictures to look at
// before they had seen any of them, and the answer was always "both".
function GalleryScreen({ r, onClose }) {
  const items = useMemo(() => {
    const mine = (customerPhotos[r.dest] || [])
      .map((p) => p?.img || p)
      .filter((x) => typeof x === "string");
    return [...new Set([...r.photos, ...r.acts.map((a) => a.img), ...mine].filter(Boolean))];
  }, [r]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 260, background: C.white, display: "flex", flexDirection: "column" }}>
      <div style={{
        flexShrink: 0, padding: "12px 14px 10px", borderBottom: `1px solid ${C.div}`,
        paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <button onClick={onClose} aria-label="Back" style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={17} color={C.head} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, ...T.h3 }}>{r.city}</p>
          <p style={{ margin: "1px 0 0", ...T.micro }}>{items.length} photos and videos</p>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "12px 14px 24px" }}>
        {items.length === 0 ? (
          <p style={{ margin: "30px 0 0", ...T.body, textAlign: "center" }}>Nothing here yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoFlow: "dense", gap: 4 }}>
            {items.map((src, i) => {
              const big = i % 3 === 0;
              const leftSide = Math.floor(i / 3) % 2 === 0;
              return (
                <div key={i} style={{
                  gridColumn: big ? (leftSide ? "1 / span 2" : "2 / span 2") : "auto",
                  gridRow: big ? "span 2" : "auto",
                  aspectRatio: "1 / 1", borderRadius: 8, overflow: "hidden", background: A.photoBg,
                }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Every trip through here, in one scroll ───
function AllTripsSheet({ trips, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 250, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)" }} />
      <div style={{
        position: "relative", background: C.bg, borderRadius: "20px 20px 0 0",
        height: "86%", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ background: C.white, padding: "10px 0 0", flexShrink: 0, borderBottom: `1px solid ${C.div}` }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `0 ${PAD}px 12px` }}>
            <p style={{ margin: 0, flex: 1, ...T.h2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Real traveller itineraries
            </p>
            <button onClick={onClose} aria-label="Close" style={{
              width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}><XIcon size={16} color={C.head} /></button>
          </div>
        </div>
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: `14px ${PAD}px 24px` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {trips.map((t) => <BookedCard key={t.key} t={t} wide />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section furniture ───

// A section without a title skips the header row rather than leaving an empty
// one: a block whose own card carries its heading still wants the section's
// spacing, not a twelve pixel gap where a heading would have been.
function Sec({ title, action, children, flush }) {
  return (
    <div style={{ marginTop: 26 }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: `0 ${PAD}px`, marginBottom: 12 }}>
          <h2 style={{ margin: 0, ...T.h2, flex: 1 }}>{title}</h2>
          {/* A title that wraps still has one first line, and that is the line
              the action belongs on. */}
          {action && <span style={{ flexShrink: 0, paddingTop: 2 }}>{action}</span>}
        </div>
      )}
      <div style={flush ? undefined : { padding: `0 ${PAD}px` }}>{children}</div>
    </div>
  );
}


// The kind's icon in a soft tile, where a place has no photograph (shops carry
// none). Brought back after the region rewrite dropped it while the shop and
// place rows still drew it, which crashed every region page.
function Well({ Icon, tone = WELL.neutral, size = 34 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: R.well, flexShrink: 0, background: tone.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}><Icon size={Math.round(size * 0.47)} color={tone.fg} /></span>
  );
}

function Card({ children, pad = 14 }) {
  return (
    <div style={{ background: C.white, borderRadius: R.card, boxShadow: SHADOW.card, padding: pad }}>
      {children}
    </div>
  );
}

// Every rail on this page caps at five or six and puts the rest behind this.
// One link, written one way, so "there is more of this" never looks like three
// different promises.
function ViewAll({ onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4,
      border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
      fontSize: 12.5, fontWeight: 700, color: C.p600,
    }}>View all <ArrowRight size={13} /></button>
  );
}

// And one sheet behind it, for whatever the rail was holding.
//
// Portalled into the phone shell, the way every other overlay in the app is.
// A sheet rendered where it is written would position itself against the
// scrolling page inside the card and open somewhere above the fold.
export function ListSheet({ open, title, count, children, onClose }) {
  const [frame, setFrame] = useState(null);
  useEffect(() => { setFrame(document.getElementById("phone-frame")); }, []);
  if (!open || !frame) return null;
  return createPortal(
    <div style={{ position: "absolute", inset: 0, zIndex: 250, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)" }} />
      <div style={{
        position: "relative", background: C.bg, borderRadius: "20px 20px 0 0",
        height: "86%", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ background: C.white, padding: "10px 0 0", flexShrink: 0, borderBottom: `1px solid ${C.div}` }}>
          <div style={{ width: 44, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 12px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `0 ${PAD}px 12px` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, ...T.h2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
              {count != null && <p style={{ margin: "1px 0 0", ...T.micro }}>{count} in all</p>}
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              width: 30, height: 30, borderRadius: "50%", border: "none", background: C.bg,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}><XIcon size={16} color={C.head} /></button>
          </div>
        </div>
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: `14px ${PAD}px 24px` }}>
          {children}
        </div>
      </div>
    </div>,
    frame
  );
}

// ─── Top things to do ───
//
// Five on the rail, then a door. Nine cards is nine swipes to the end of a list
// nobody asked to be exhaustive, and the ones at the back may as well not be
// there.
//
// The door is always on the section, even where the rail happens to be holding
// everything there is. A View all that comes and goes depending on how many
// trips pass through a particular town reads as a bug, and a couple who has
// learned the link is there should find it there.
const SHOWN_ACTS = 5;
// Eleven itineraries on a rail is eleven swipes. Same cap, same door.
const SHOWN_TRIPS = 6;

// ─── One thing to do ───
//
// The photograph carries the reason, when there is a particular one: "Best at
// sunrise" tells a couple something. The generic "In most itineraries" came
// off it, because that is the same claim the Recommended chip in the card
// makes, and a card does not need to say it twice.
//
// Under the words: what it is, whether we recommend it, whether it is off the
// beaten path, then what travellers made of it and how long it takes. Every
// card has the same rows whether or not it has every chip, so a rail of them
// lines up rather than each one ending wherever its own facts ran out.
//
// The heart sits beside the name, at the right edge of the card. It saves
// the thing the name names, so it belongs to the name, and the photograph
// stays a photograph.
export function ActCard({ a, city, dest, saved, onSave, onOpen, width = 255, imgH = 165 }) {
  const imgs = a.imgs?.length ? a.imgs : [a.img].filter(Boolean);
  // The score the activity page will open with, read off the same builder the
  // map card reads, so the three places this activity appears on one screen
  // cannot show three different numbers.
  const { rating, reviews } = useMemo(() => {
    const d = buildActivityDetail({ name: a.name }, { city, country: dest });
    return { rating: d.rating, reviews: Number(d.reviewCount).toLocaleString("en-IN") };
  }, [a.name, city, dest]);
  // The activity page's own chips, read off the same flags, so a thing that is
  // "Top activity" on a card is "Top activity" when you open it. Two at most
  // here: the page has a column to spill into and a 255px card does not.
  const chips = flagChipList(activityFlags(a.name)).slice(0, 2);
  // Only a named reason earns the badge on the photograph now.
  const badge = a.pick && a.pick !== "In most itineraries" ? a.pick : null;

  return (
    <div
      onClick={() => onOpen(a)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(a); } }}
      style={{
        flexShrink: 0, width, background: C.white, borderRadius: R.card,
        overflow: "hidden", boxShadow: SHADOW.card, display: "flex", flexDirection: "column",
        cursor: "pointer", textAlign: "left",
      }}
    >
      <div style={{ position: "relative" }}>
        <CardReel imgs={imgs} alt={a.name} height={imgH} />
        {badge && (
          <span style={{
            position: "absolute", left: 9, top: 9, zIndex: 1,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 9px", borderRadius: R.pill,
            background: "rgba(255,244,224,0.95)", color: WELL.gold.fg,
            border: "1px solid rgba(240,213,168,0.9)", backdropFilter: "blur(6px)",
            boxShadow: "0 1px 6px rgba(16,24,40,0.18)",
            fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap",
          }}><Sparkles size={10} /> {badge}</span>
        )}
      </div>

      <div style={{ padding: "11px 12px 13px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ margin: 0, flex: 1, minWidth: 0, ...T.h3, ...clamp(1) }}>{a.name}</p>
          {onSave && <SaveHeart size={28} saved={!!saved} onToggle={onSave} style={{ margin: "-5px -6px -5px 0" }} />}
        </div>
        {/* Two lines kept whether the line needs them or not. A rail stretches
            every card to the tallest one, so a one-line summary used to leave
            its missing second line as a gap above the tags. Reserving it puts
            the tags on the same line across the whole rail. */}
        {a.summary && (
          <p style={{
            margin: "5px 0 0", ...T.meta, lineHeight: 1.45, minHeight: 35, ...clamp(2),
          }}>{a.summary}</p>
        )}
        <span style={{ flex: 1 }} />

        {/* However many it has, up to two. A card with one chip shows one. */}
        {chips.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            {chips.map((c) => (
              <span key={c.key} style={{
                padding: "4px 9px", borderRadius: R.pill,
                background: c.bg, color: c.color,
                fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
              }}>{c.icon} {c.label}</span>
            ))}
          </div>
        )}

        {/* What travellers made of it, and how long it takes. Plain text
            rather than two more chips: four chips on a 255px card is a row
            that scrolls, and these two are read, not scanned. */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, ...T.micro, color: C.head, whiteSpace: "nowrap" }}>
            <Star size={11} color="#D99A00" fill="#D99A00" />
            <strong style={{ fontWeight: 800 }}>{rating}</strong>
            <span style={{ color: C.sub }}>({reviews})</span>
          </span>
          <span aria-hidden style={{ width: 3, height: 3, borderRadius: "50%", background: C.icon, flexShrink: 0 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, ...T.micro, color: C.sub, minWidth: 0 }}>
            <Clock size={11} style={{ flexShrink: 0 }} /> <span style={{ ...clamp(1) }}>{a.hours}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ThingsToDo({ acts, city, dest, onOpen }) {
  const [all, setAll] = useState(false);
  const { isSaved, toggle } = useWishlist();
  const heart = (a) => ({
    saved: isSaved("activity", dest, a.id),
    onSave: () => toggle("activity", dest, a.id, actMeta(a, city)),
  });

  return (
    <>
      <Sec
        title="Top things to do"
        action={acts.length > 0 && <ViewAll onClick={() => setAll(true)} />}
        flush
      >
        <div className="hs" style={{ gap: 12, paddingLeft: PAD, paddingRight: PAD, alignItems: "stretch" }}>
          {acts.slice(0, SHOWN_ACTS).map((a) => (
            <ActCard key={a.id} a={a} city={city} dest={dest} {...heart(a)} onOpen={onOpen} />
          ))}
        </div>
      </Sec>

      <ListSheet open={all} title={`Things to do in ${city}`} count={acts.length} onClose={() => setAll(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {acts.map((a) => (
            <ActCard key={a.id} a={a} city={city} dest={dest} {...heart(a)} width="100%" imgH={200} onOpen={(x) => { setAll(false); onOpen(x); }} />
          ))}
        </div>
      </ListSheet>
    </>
  );
}

// ─── How to reach ───
//
// Two questions, and the screen used to answer only the second one. A couple
// comparing Hoi An with Ha Long wants to know that one is a cab and the other
// is a flight. Somebody who has never been to Vietnam asks something simpler
// first: can I fly there, and from where. Hoi An has no airport, Da Nang's is
// half an hour up the road, and nothing from India lands at either.
//
// So the origins start in India and carry on into the country, in one row,
// because they are all answers to the same question and a caption over each
// half was two labels doing the work of an order.
//
// ─── Why this is a list and not a line ───
//
// It was a timeline: the places left to right with a little plane or boat on
// the rule between them. On Delhi to Wanaka that is five stops, which does
// not fit a phone, so it scrolled sideways with a fade at the end, and the
// one thing somebody wants from it, "what do I actually do", was spread
// across a gesture.
//
// A journey of more than one leg is a list of instructions, so it is a list
// now. One row per leg, in order, each one naming the thing you board:
// Flight, Cab, Train, Metro, Ferry. The total sits above them, because that
// is the number a couple compares origins with, and the airport codes are
// gone: DPS is for a boarding pass, not for deciding.
//
// Where every way is a single hop, they are not steps at all, they are
// alternatives, so they read as a short menu with a time against each.

// ─── What each way of moving looks like ───
//
// All grey was too far the other way: a card of names and hairlines with
// nothing to catch the eye. Each mode gets its own tint instead, from the same
// family the activity tags use, and none of them is the brand pink. Amber for a
// cab because that is what a taxi is everywhere, blue for the air, lagoon for
// the rails, and a deeper water blue for anything that floats.
const MODE_TONE = {
  flight: { bg: "#EAF2FE", fg: "#1570EF" },
  car: { bg: "#FFF4E0", fg: "#B54708" },
  train: { bg: "#E5F6F5", fg: "#007E72" },
  scooter: { bg: "#FDF2E8", fg: "#C4320A" },
  metro: { bg: "#EBE9FE", fg: "#6938EF" },
  boat: { bg: "#E0F2FE", fg: "#0369A1" },
  walk: { bg: "#F2F4F7", fg: "#475467" },
};

// The word for the thing you board. Said out loud on every row, because an
// icon at thirteen pixels is a shape you interpret and a word is a word.
const MODE_WORD = {
  flight: "Flight", car: "Cab", train: "Train",
  metro: "Metro", boat: "Ferry", walk: "Walk", scooter: "Scooter",
};

// ─── A train somebody can recognise at sixteen pixels ───
//
// Lucide's is a rounded cab with two round windows, which at this size is a
// bean with eyes and reads as a bus as readily as a train. Drawn here
// instead: a square front, a flat roof, a funnel on top, one wide cab
// window, a headlamp and the wheels under it. The funnel is the thing that
// makes it unmistakable, which is why every child draws one.
function TrainIcon({ size = 16, color = "currentColor", strokeWidth = 2 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden
    >
      {/* the funnel */}
      <path d="M10 2h4v2h-4z" />
      {/* the body, square at the front */}
      <rect x="4" y="4" width="16" height="13" rx="1.5" />
      {/* the cab window, one wide pane */}
      <path d="M7.5 7.5h9v4h-9z" />
      {/* the headlamp */}
      <path d="M12 14h.01" />
      {/* the wheels */}
      <circle cx="8" cy="19.5" r="1.6" />
      <circle cx="16" cy="19.5" r="1.6" />
    </svg>
  );
}

// A taxi for the cab rather than a saloon car: the roof sign is what makes
// the glyph read as something you hail at this size.
const REACH_ICON = {
  flight: Plane, car: CarTaxiFront, train: TrainIcon,
  metro: TramFront, boat: Ship, walk: Footprints, scooter: Bike,
};

function ModeDot({ mode, size = 30 }) {
  const Icon = REACH_ICON[mode] || CarTaxiFront;
  const tone = MODE_TONE[mode] || MODE_TONE.walk;
  return (
    <span aria-hidden style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0, background: tone.bg,
      display: "grid", placeItems: "center",
    }}>
      {/* Bigger than the thirteen pixels the timeline gave it. A train at
          thirteen is a smudge with windows. */}
      <Icon size={Math.round(size * 0.53)} color={tone.fg} strokeWidth={2} />
    </span>
  );
}

// ─── One leg ───
//
// Both ends of it, in the order you travel them, and the thing you board
// named underneath. Naming only the far end was shorter and left somebody
// counting rows back to work out where a leg starts: "Delhi to Hanoi" is
// the whole fact, and on a two-leg journey the repeat of the middle city is
// what makes it read as a change of train rather than two unrelated trips.
function LegRow({ leg, last, time = false }) {
  return (
    <div style={{ display: "flex", gap: 11 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <ModeDot mode={leg.mode} />
        {/* The thread down the side, so the rows read as one journey in
            order rather than three things that can be done in any of them. */}
        {!last && <span aria-hidden style={{ flex: 1, width: 2, background: C.div, borderRadius: 2, marginTop: 3 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: last ? 0 : 13 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: C.head }}>
            {leg.from} to {leg.to}
          </p>
          {/* Only when this row is the whole journey. On a journey of two
              or three legs the total is above them, and ten minutes here
              and twenty there is arithmetic nobody asked to check. */}
          {time && (
            <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap" }}>
              <span aria-hidden style={{ marginRight: 2, fontWeight: 600, color: C.sub }}>~</span>{hhmmShort(leg.mins)}
            </span>
          )}
        </div>
        {/* The mode, said in a word, under the two places it joins. An icon
            at sixteen pixels is a shape somebody interprets; the word is
            the word. */}
        <p style={{ margin: "1px 0 0", fontSize: 11.5, fontWeight: 600, color: C.sub }}>
          {MODE_WORD[leg.mode] || "Transfer"}
          {leg.note ? <span style={{ fontWeight: 400, color: C.inact }}> · {leg.note}</span> : null}
        </p>
      </div>
    </div>
  );
}

// Minutes as a short duration. The data holds them; hhmm lives in the reach
// module and is not exported, and a leg is never a number of days.
function hhmmShort(mins) {
  if (mins == null) return "";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// A single-hop alternative: one thing you board, and how long it takes. No
// thread down the side, because these are choices rather than steps.
function OptionRow({ w, first }) {
  const mode = w.legs[0]?.mode;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 11,
      padding: first ? "0 0 11px" : "11px 0",
      borderTop: first ? "none" : `1px solid ${C.div}`,
    }}>
      <ModeDot mode={mode} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.head }}>
          {MODE_WORD[mode] || w.label || "Transfer"}
        </p>
        {w.hint && <p style={{ margin: "2px 0 0", ...T.micro, lineHeight: "16px" }}>{w.hint}</p>}
      </div>
      <span style={{ flexShrink: 0, fontSize: 13.5, fontWeight: 800, color: C.head, whiteSpace: "nowrap" }}>
        <span aria-hidden style={{ marginRight: 3, fontWeight: 600, color: C.sub }}>~</span>{w.time}
      </span>
    </div>
  );
}

function HowToReach({ origins, city }) {
  const [pick, setPick] = useState(origins[0]?.id);
  const from = origins.find((o) => o.id === pick) || origins[0];
  if (!from) return null;
  // The ways arrive shortest first, so the one we would put somebody on is
  // the first of them.
  const best = from.ways[0];
  if (!best) return null;

  return (
    <Sec title={`How to reach ${city}`} flush>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: `0 ${PAD}px 2px` }}>
        {origins.map((o) => {
          const on = o.id === from.id;
          return (
            <button key={o.id} onClick={() => setPick(o.id)} style={{
              flexShrink: 0, borderRadius: R.pill, padding: "7px 13px",
              cursor: "pointer", fontFamily: "inherit",
              fontSize: 12.5, fontWeight: on ? 700 : 600, whiteSpace: "nowrap",
              border: `1px solid ${on ? A.pink : C.div}`,
              background: on ? A.pinkSoft : C.white,
              color: on ? "#C00840" : C.sub,
              boxShadow: on ? "none" : SHADOW.card,
            }}>
              {/* No distance. It was the one number here nobody travels by:
                  606 km of Vietnamese road is nine hours and 606 km of air is
                  an hour and a half. */}
              {o.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: `12px ${PAD}px 0` }}>
        <Card>
          {/* ─── Steps, or choices ───
              Where the best way has more than one leg, getting here is a
              sequence and only that way is shown: offering four versions of
              a journey somebody has not decided to make yet is a list to
              get through rather than an answer. Where every way is a single
              hop they are alternatives, and then all of them are worth
              seeing, because the choice between a three hour cab and a one
              hour flight is the whole question. */}
          {best.legs.length > 1 ? (
            <>
              {/* The one number on a journey of several legs. "Door to
                  door" was a caption on a figure that could not mean
                  anything else. */}
              <p style={{ margin: "0 0 13px", fontSize: 15, fontWeight: 800, color: C.head, whiteSpace: "nowrap" }}>
                <span aria-hidden style={{ marginRight: 3, fontWeight: 600, color: C.sub }}>~</span>{best.time}
              </p>
              {best.legs.map((l, i) => (
                <LegRow key={`${l.mode}-${l.to}-${i}`} leg={l} last={i === best.legs.length - 1} />
              ))}
            </>
          ) : from.ways.length === 1 ? (
            /* One hop and one way of making it. Written as a leg, so it
               names both ends: "Delhi to Hanoi", and the word Flight under
               it. A label on its own ("Non-stop to Hanoi") never said
               where it was non-stop from. */
            <LegRow leg={{ ...best.legs[0], note: best.legs[0].note || best.hint }} last time />
          ) : (
            <>
              {/* Every one of these joins the same two places, so the
                  places are said once at the top and each row below is
                  only the thing you board and how long it takes. */}
              <p style={{ margin: "0 0 11px", fontSize: 13, fontWeight: 700, color: C.head }}>
                {from.label} to {city}
              </p>
              {from.ways.map((w, i) => (
                <OptionRow key={w.label} w={w} first={i === 0} />
              ))}
            </>
          )}
        </Card>
      </div>
    </Sec>
  );
}

// ─── When to go ───
//
// A strip of months you can actually press. Picking one answers the question
// the page is really being asked, which is not "how many degrees" but "should
// we come then": a verdict, then the numbers behind it, then what the crowds
// will be like. The climate is the country's and the note says so. We hold one
// set of averages per destination, not one per town.
// The sky and the season both come from the dates step's own words and
// colours, not a second copy of them here. Two names, or two colours, for the
// same thing in one app is one of them being wrong.
//
// This used to carry a verdict of its own: green for "Great time to go", amber
// for "Fine, but expect rain" and red for "Not the best time". A red chip on a
// month we sell trips in argues with the page it is on, and the judgement was
// never ours to make in one word. The sky says what the sky does, the season
// chips say what the crowds and the prices do, and the couple decides.

function WhenToGo({ r }) {
  const now = new Date().getMonth();
  const [pick, setPick] = useState(now);
  // The next twelve months from this one. Nobody planning in October is
  // deciding about last February.
  const run = Array.from({ length: 12 }, (_, k) => r.months[(now + k) % 12]);
  const mo = r.months[pick];
  const Sky = SKY_STYLE[mo.sky] || SKY_STYLE.cloudy;
  // Millimetres as days, which is the form the number is useful in. Rounded
  // and stated as a guide, the way the rest of this section is.
  const rainDays = mo.rain == null ? null : Math.min(28, Math.round(mo.rain / 11));

  // ─── The nib under the chosen month ───
  //
  // The strip and the card below it are one control and one answer, and
  // without a mark between them they read as two things that happen to sit
  // near each other. A nib pointing up at the month that is selected says
  // "this panel is about that tab" before a word of it is read.
  //
  // Measured rather than placed: the strip scrolls, so the tab the nib
  // belongs to moves, and it follows on every scroll and every pick.
  const wrap = useRef(null);
  const strip = useRef(null);
  const tabs = useRef({});
  const [nib, setNib] = useState(null);
  useEffect(() => {
    const read = () => {
      const el = tabs.current[pick];
      const box = wrap.current;
      if (!el || !box) return;
      const a = el.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      const x = a.left + a.width / 2 - b.left;
      // Hidden when the month it belongs to has been scrolled off, rather
      // than pinned to an edge pointing at nothing.
      setNib(x > 24 && x < b.width - 24 ? x : null);
    };
    read();
    const sc = strip.current;
    sc?.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      sc?.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [pick, run.length]);

  return (
    <Sec title="When to go" flush>
      <div ref={wrap} style={{ position: "relative" }}>
        <div ref={strip} className="hs" style={{ gap: 8, paddingLeft: PAD, paddingRight: PAD }}>
          {run.map((x) => {
            const on = x.m === pick;
            const S = SKY_STYLE[x.sky] || SKY_STYLE.cloudy;
            return (
              <button
                key={x.m}
                ref={(el) => { tabs.current[x.m] = el; }}
                onClick={() => setPick(x.m)}
                aria-pressed={on}
                style={{
                  flexShrink: 0, minWidth: 82, padding: "10px 12px 11px", borderRadius: 13,
                  textAlign: "center", cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${on ? C.p300 : C.div}`,
                  background: on ? C.p100 : C.white,
                }}
              >
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: on ? C.p600 : C.head }}>
                  {x.name.slice(0, 3)}
                </span>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, margin: "7px 0 5px" }}>
                  <S.Icon size={14} color={S.color} />
                  {/* The sky's own ink, the calendar's. It was grey here, so
                      every month's weather read the same until you got to the
                      word. */}
                  <span style={{ fontSize: 11, fontWeight: 700, color: (SKY_CHIP[x.sky] || SKY_CHIP.cloudy).fg, whiteSpace: "nowrap" }}>
                    {SKY_WORD[x.sky] || "Mixed"}
                  </span>
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: C.head, whiteSpace: "nowrap" }}>
                  {x.low}° / {x.high}°
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── What we would say about that month ───
            Not the month, the sky and the temperatures again: those are on
            the tab that was just pressed, and printing them underneath is
            the same glance twice. Not a count of rain days either, which is
            a number somebody has to interpret, and interpreting it is the
            job this card exists to do. */}
        <div style={{ position: "relative", margin: `10px ${PAD}px 0` }}>
          {nib != null && (
            <span aria-hidden style={{
              position: "absolute", top: -6, left: nib - PAD - 5, width: 10, height: 10,
              background: C.white, borderLeft: `1px solid ${C.p300}`, borderTop: `1px solid ${C.p300}`,
              transform: "rotate(45deg)", borderTopLeftRadius: 2,
            }} />
          )}
          <div style={{
            // White, with the edge in the strip's pink. A tinted panel
            // behind a paragraph is a lot of brand for one sentence, and
            // the nib and the edge say "this belongs to that tab" on their
            // own.
            background: C.white, border: `1px solid ${C.p300}`, borderRadius: R.card, padding: 13,
          }}>
            {/* ─── The place and the month, as a sentence would say it ───
                "October" on its own was the word the tab above had just
                said. "Hanoi in October" is what a person asks about, and
                it names the subject of the paragraph under it. */}
            <p style={{ margin: 0, ...T.h3, letterSpacing: "-0.2px" }}>
              {r.city} in {mo.name}
            </p>
            <p data-testid="month-advice" style={{
              margin: "6px 0 0", fontSize: 13, fontWeight: 400, color: C.sub, lineHeight: "20px",
            }}>
              {monthAdvice(mo)}
            </p>

            {/* ─── The two numbers behind it ───
                Under a rule, in the smallest type on the card, because they
                are the evidence rather than the answer. The paragraph is
                what we think; these are what it is built on, there for
                anybody who wants to check our working. */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              marginTop: 11, paddingTop: 10, borderTop: `1px solid ${C.div}`,
            }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...T.micro, color: C.sub, whiteSpace: "nowrap" }}>
                <Sky.Icon size={13} color={Sky.color} />
                {rainDays != null ? `${rainDays} rain days` : "rain not recorded"}
              </span>
              {/* The season and what it means for a couple, which is the
                  pair of them or neither: "Mid-season" on its own is a
                  word from our side of the desk. */}
              {[SEASON_LABEL[mo.rating], SEASON_MEANING[mo.rating]].filter(Boolean).map((t) => (
                <span key={t} style={{
                  padding: "3px 9px", borderRadius: R.pill,
                  background: SEASON_TINT[mo.rating], color: SEASON_COLOR[mo.rating],
                  fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
                }}>{t}</span>
              ))}
            </div>
          </div>
          <p style={{ margin: "10px 2px 0", ...T.micro, lineHeight: "16px" }}>
            Averages across {r.dest}, indicative rather than a forecast.
          </p>
        </div>
      </div>
    </Sec>
  );
}

// ─── Getting about inside the place ───
//
// Plain pointers were honest and grey. These are the same four facts with the
// picture back on them: one card, a row per mode, each in its own colour so
// the list is something you scan rather than read.
//
// It was headed "Transport modes", which sat under "How to reach Hanoi" and
// read as more of the same subject. Two things are being answered on this
// page and they are a day apart: how you get to the place, and how you get
// about once you are standing in it. The second one says "within" now, and
// names the city, because a heading that leaves the difference to be
// inferred is a heading somebody has to stop and work out.
function TransportModes({ items, city }) {
  return (
    <Sec title={`How to travel within ${city}`}>
      <Card pad={0}>
        {/* ─── A list that is laid out, not just typed ───
            Name over sentence, which is the right shape: the names are
            not all short ("Walking and cycling"), so a column for them
            either squeezes the sentence or wraps the name, and both look
            worse than simply putting one above the other.
            
            What was missing was not structure but air. The first version
            was four bold run-ins with a dot each, stacked tight and with
            nothing between them, which reads as notes somebody pasted in.
            Rules between the rows, a line of space inside each one, and a
            sentence set at a comfortable measure, and the same content is
            a list a person reads down.
            
            No pictures. A disc with a scooter in it beside the words
            "Scooter hire" is the word twice, and this is background on
            the place rather than a set of things to choose between. */}
        {items.map((t, i) => (
          <div key={t.label} style={{
            display: "flex", gap: 9, alignItems: "flex-start",
            padding: "12px 15px",
            borderTop: i === 0 ? "none" : `1px solid ${C.div}`,
          }}>
            <span aria-hidden style={{
              flexShrink: 0, width: 5, height: 5, borderRadius: "50%",
              background: C.p300, marginTop: 7,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0, fontSize: 13, fontWeight: 800, color: C.head,
                lineHeight: "18px", letterSpacing: "-0.1px",
              }}>{t.label}</p>
              <p style={{
                margin: "3px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "19px",
              }}>{t.note}</p>
            </div>
          </div>
        ))}
      </Card>
    </Sec>
  );
}

// ─── Where the restaurants are ───
//
// The centre of town pinned and named, and every restaurant we can place
// pinned around it, numbered so a pin and a card match by looking. Tapping one
// raises its card from the bottom, the same way the things-to-do map does.
//
// What we hold per restaurant is the neighbourhood and the distance from the
// centre, not a street address, so a pin sits on the neighbourhood and is
// honest to a few hundred metres. Places whose area is not a location at all,
// which is a good third of these lists ("on your island", "any warung"), get no
// pin, and the badge says how many of them that is rather than quietly showing
// four of seven.
function foodPins(list, city) {
  return list
    .map((f) => {
      const c = areaCoords(city, f.area);
      return c ? { ...f, lat: c.lat, lng: c.lng } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
}

// ─── Places on a map ───
//
// Built for the restaurants, and the shops use it as it stands: both lists
// are a name, a neighbourhood and a distance, and both want the same answer,
// which is where any of this is in relation to anything else. `title` is the
// pill at the top, `pinKind` picks the glyph on the pins, `tags` turns a place
// into the pills on its card, and `kind` and `meta` are what its heart saves.
function PlaceMapScreen({ dest, city, list, title, pinKind, tags, kind, meta, onClose }) {
  const here = cityCoords[city];
  const pins = useMemo(() => foodPins(list, city), [list, city]);
  const [pick, setPick] = useState(null);
  const { isSaved, toggle } = useWishlist();

  const span = useMemo(() => {
    const all = [here, ...pins.map((x) => ({ lat: x.lat, lng: x.lng }))];
    const lat = all.map((c) => c.lat);
    const lng = all.map((c) => c.lng);
    const pad = Math.max(0.012, (Math.max(...lat) - Math.min(...lat)) * 0.35);
    return [
      [Math.min(...lat) - pad, Math.min(...lng) - pad],
      [Math.max(...lat) + pad, Math.max(...lng) + pad],
    ];
  }, [here, pins]);

  const chosen = pins.find((x) => x.name === pick);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 300, background: C.white }}>
      <MapContainer
        bounds={span}
        style={{ height: "100%", width: "100%", background: "#AADAFF" }}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Zoom />
        <Declutter count={pins.length} pick={pick} />
        <Marker position={[here.lat, here.lng]} icon={centrePin(city)} zIndexOffset={-500} />
        {pins.map((x) => (
          <Marker
            key={x.name}
            position={[x.lat, x.lng]}
            icon={sightPin(x.name, pinKind, pick === x.name)}
            zIndexOffset={pick === x.name ? 1000 : 0}
            eventHandlers={{ click: () => setPick(x.name) }}
          />
        ))}
      </MapContainer>

      <div style={{
        position: "absolute", left: 12, right: 12, zIndex: 600,
        top: "calc(12px + env(safe-area-inset-top, 0px))",
        display: "flex", alignItems: "center", gap: 9, pointerEvents: "none",
      }}>
        <button onClick={onClose} aria-label="Close map" style={{
          pointerEvents: "auto", width: 36, height: 36, borderRadius: "50%", border: "none",
          background: C.white, boxShadow: SHADOW.float, display: "grid", placeItems: "center",
          cursor: "pointer", flexShrink: 0,
        }}><XIcon size={18} color={C.head} /></button>
        <span style={{
          pointerEvents: "auto", background: C.white, borderRadius: R.pill, padding: "9px 14px",
          boxShadow: SHADOW.float, fontSize: 12.5, fontWeight: 700, color: C.head,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{title}</span>
      </div>

      {list.length > pins.length && (
        <span style={{
          position: "absolute", right: 12, zIndex: 600,
          top: "calc(58px + env(safe-area-inset-top, 0px))",
          background: C.white, borderRadius: R.pill, padding: "7px 11px",
          boxShadow: SHADOW.float, ...T.micro, fontWeight: 600, color: C.sub,
        }}>{pins.length} of {list.length} mapped</span>
      )}

      {chosen && (
        <div style={{
          position: "absolute", left: 12, right: 12, bottom: 16, zIndex: 650,
          animation: "sheetSlideUp 0.22s cubic-bezier(0.22,0.61,0.36,1)",
        }}>
          <div style={{ position: "relative", background: C.white, borderRadius: R.card, boxShadow: SHADOW.float, padding: 11 }}>
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              {/* A photograph where we hold one, the kind's icon where we do
                  not. The shops carry no pictures, by design. */}
              {chosen.img
                ? <img src={chosen.img} alt="" style={{ width: 56, height: 56, flexShrink: 0, borderRadius: R.well, objectFit: "cover", display: "block", background: A.photoBg }} />
                : <Well Icon={ShoppingBag} size={56} />}
              <div style={{ flex: 1, minWidth: 0, paddingRight: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, ...T.h3, fontSize: 14.5, flex: 1, minWidth: 0, ...clamp(1) }}>{chosen.name}</p>
                  <SaveHeart
                    size={28}
                    saved={isSaved(kind, dest, placeId(city, chosen.name))}
                    onToggle={() => toggle(kind, dest, placeId(city, chosen.name), meta(chosen, city))}
                  />
                </div>
                <p style={{ margin: "3px 0 0", ...T.micro, ...clamp(1) }}>
                  {chosen.area}{chosen.km != null ? ` · ${chosen.km} km from the centre` : ""}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                  {tags(chosen).map((t) => (
                    <span key={t.label} style={{
                      padding: "3px 8px", borderRadius: R.pill,
                      background: t.bg, color: t.fg,
                      fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
                    }}>{t.label}</span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setPick(null)} aria-label="Close" style={{
              position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%",
              border: "none", background: C.bg, display: "grid", placeItems: "center", cursor: "pointer",
            }}><XIcon size={13} color={C.sub} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Where to eat ───
//
// Was a rail of big photo cards, which is the wrong shape twice over: a
// photograph of a plate tells you nothing about whether the kitchen is Indian,
// and a rail hides most of the list behind a swipe. This is the hotel page's
// nearby block instead, which answers the same question in the same way: filter
// by what kind of place you want, read four rows, open the rest.
//
// The tags lead, because for most of the couples we sell to "Indian food" or
// "Veg only" decides the answer and the rest is detail.
const FOOD_FILTERS = ["Indian food", "Veg only", "Local food"];
const SHOWN_FOOD = 4;

// The food tags as the pills the row and the map card draw, in the order
// sortTags puts them. The shops have their own version below.
const foodTags = (f) => sortTags(f.tags).map((label) => {
  const tone = FOOD_TAG[label];
  return { label, bg: tone ? tone.bg : C.bg, fg: tone ? tone.fg : C.sub };
});

// ─── One place, as a row ───
//
// The restaurants and the shops share this. A picture or an icon on the left,
// the name, where it is, one line about it and its tags in the middle, and
// the heart on the name's line at the right edge, bare, because the row is
// white.
function PlaceRow({ img, Icon, name, area, km, note, tags, saved, onSave }) {
  return (
    <div style={{
      display: "flex", gap: 11, alignItems: "center", width: "100%",
      background: C.white, borderRadius: R.card, padding: 9, boxShadow: SHADOW.card,
      boxSizing: "border-box",
    }}>
      {img
        ? <img src={img} alt="" style={{ width: 58, height: 58, borderRadius: R.well, objectFit: "cover", flexShrink: 0, background: A.photoBg }} />
        : <Well Icon={Icon} size={58} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ margin: 0, flex: 1, minWidth: 0, ...T.lead, fontSize: 13.5, ...clamp(1) }}>{name}</p>
          {onSave && <SaveHeart size={28} saved={!!saved} onToggle={onSave} style={{ margin: "-5px -6px -5px 0" }} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "4px 0 0" }}>
          <MapPin size={11} color={C.inact} style={{ flexShrink: 0 }} />
          <span style={{ ...T.micro, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {area}{km != null ? ` · ${km} km from the centre` : ""}
          </span>
        </div>
        <p style={{ margin: "4px 0 0", ...T.meta, lineHeight: 1.4, ...clamp(1) }}>{note}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
          {tags.map((t) => (
            <span key={t.label} style={{
              padding: "3px 8px", borderRadius: R.pill,
              background: t.bg, color: t.fg,
              fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap",
            }}>{t.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FoodRow({ f, saved, onSave }) {
  return (
    <PlaceRow
      img={f.img} name={f.name} area={f.area} km={f.km} note={f.note}
      tags={foodTags(f)} saved={saved} onSave={onSave}
    />
  );
}

function Restaurants({ list, dest, city, onMap }) {
  const { isSaved, toggle } = useWishlist();
  const heart = (f) => ({
    saved: isSaved("restaurant", dest, placeId(city, f.name)),
    onSave: () => toggle("restaurant", dest, placeId(city, f.name), foodMeta(f, city)),
  });
  // No map where nothing on the list is anywhere. Every place to eat near a
  // Maldives resort is "on your island", which is true and unpinnable, and an
  // empty map is a worse answer than no map.
  const mappable = useMemo(() => foodPins(list, city).length > 0, [list, city]);
  // Only the filters that would actually match something here. A chip that
  // always returns nothing is a chip that teaches a couple not to press them.
  const filters = useMemo(() => {
    const live = FOOD_FILTERS.filter((k) => list.some((f) => (f.tags || []).includes(k)));
    return ["All", ...live];
  }, [list]);
  const [pick, setPick] = useState("All");
  const [all, setAll] = useState(false);

  const shown = pick === "All" ? list : list.filter((f) => (f.tags || []).includes(pick));

  return (
    <>
      <Sec
        title={`Where to eat in ${city}`}
        /* Two text links, not a boxed button beside a text link. The map was a
           34 by 24 bordered box sitting ten pixels from "View all", which put
           a control and a link at two different heights touching each other
           and read as one crowded thing. They are the same kind of thing, so
           they are now set the same way with a hairline between them. */
        action={list.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
            {mappable && (
              <>
                <button onClick={onMap} style={{
                  flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4,
                  border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12.5, fontWeight: 700, color: C.p600,
                }}>
                  <MapPin size={13} strokeWidth={2.4} /> Map
                </button>
                <span aria-hidden style={{ width: 1, height: 13, background: C.div, flexShrink: 0 }} />
              </>
            )}
            <ViewAll onClick={() => setAll(true)} />
          </span>
        )}
        flush
      >
        {filters.length > 1 && (
          <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: `0 ${PAD}px 2px` }}>
            {filters.map((k) => {
              const on = pick === k;
              const n = k === "All" ? list.length : list.filter((f) => (f.tags || []).includes(k)).length;
              return (
                <button key={k} onClick={() => setPick(k)} style={{
                  flexShrink: 0, borderRadius: R.pill, padding: "7px 13px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12.5, fontWeight: on ? 700 : 600, whiteSpace: "nowrap",
                  border: `1px solid ${on ? A.pink : C.div}`,
                  background: on ? A.pinkSoft : C.white,
                  color: on ? "#C00840" : C.sub,
                  boxShadow: on ? "none" : SHADOW.card,
                }}>
                  {k}<span style={{ marginLeft: 5, fontWeight: 600, opacity: 0.65 }}>{n}</span>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: `12px ${PAD}px 0` }}>
          {shown.slice(0, SHOWN_FOOD).map((f) => <FoodRow key={f.name} f={f} {...heart(f)} />)}
          {shown.length === 0 && (
            <p style={{ margin: "4px 0", ...T.body }}>Nothing on our list for that here yet.</p>
          )}
        </div>

      </Sec>

      <ListSheet open={all} title={`Where to eat in ${city}`} count={list.length} onClose={() => setAll(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((f) => <FoodRow key={f.name} f={f} {...heart(f)} />)}
        </div>
      </ListSheet>
    </>
  );
}

// ─── Where to shop ───
//
// The same block as the restaurants, one question later. Three to five places
// per region, so there are no filter chips: a filter over four rows is a
// filter over nothing. The door to the full list stays, because every list on
// this page has one and a couple who has learned where it is should find it.
//
// No photographs. We hold none of these places, and a stock market under a
// real market's name would be a claim. The icon says what the row is.
const SHOWN_SHOPS = 4;

const shopTags = (s) => {
  const tone = SHOP_TAG[s.tag];
  return s.tag ? [{ label: s.tag, bg: tone ? tone.bg : C.bg, fg: tone ? tone.fg : C.sub }] : [];
};

function ShopRow({ s, saved, onSave }) {
  return (
    <PlaceRow
      Icon={ShoppingBag} name={s.name} area={s.area} km={s.km} note={s.note}
      tags={shopTags(s)} saved={saved} onSave={onSave}
    />
  );
}

function Shopping({ list, dest, city, onMap }) {
  const mappable = useMemo(() => foodPins(list, city).length > 0, [list, city]);
  const [all, setAll] = useState(false);
  const { isSaved, toggle } = useWishlist();
  const heart = (s) => ({
    saved: isSaved("shop", dest, placeId(city, s.name)),
    onSave: () => toggle("shop", dest, placeId(city, s.name), shopMeta(s, city)),
  });

  return (
    <>
      <Sec
        title={`Where to shop in ${city}`}
        action={list.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            {mappable && (
              <MapsButton onClick={onMap} label={false} w={34} h={24} pin={13} />
            )}
            <ViewAll onClick={() => setAll(true)} />
          </span>
        )}
        flush
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: `0 ${PAD}px` }}>
          {list.slice(0, SHOWN_SHOPS).map((s) => <ShopRow key={s.name} s={s} {...heart(s)} />)}
        </div>
      </Sec>

      <ListSheet open={all} title={`Where to shop in ${city}`} count={list.length} onClose={() => setAll(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((s) => <ShopRow key={s.name} s={s} {...heart(s)} />)}
        </div>
      </ListSheet>
    </>
  );
}

// ─── The honest read, posted ───
// The same lines, on a postcard. The hotel page already writes its honest bit
// this way, and the form carries the meaning: a card from someone who went,
// not a disclaimer at the foot of a sales page.
const PAPER = "#FCF6E7";
const PAPER_EDGE = "#E6DCC4";
const RULE = "#D3C8AE";
const PAPER_INK = "#181D27";
const TICK = "#027A48";
const CROSS = "#B45309";

function Postcard({ city, pros, cons }) {
  const lines = [
    ...pros.slice(0, 3).map((t) => ({ good: true, t })),
    ...cons.slice(0, 3).map((t) => ({ good: false, t })),
  ];
  return (
    <div style={{
      background: PAPER, border: `1px solid ${PAPER_EDGE}`, borderRadius: 5,
      boxShadow: "0 6px 14px rgba(24,29,39,0.09)", padding: "11px 14px 12px",
      display: "flex", flexDirection: "column", gap: 9,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
          <span style={{ fontFamily: "Caveat, cursive", fontSize: 24, lineHeight: "25px", fontWeight: 700, color: PAPER_INK }}>
            {city}, honestly
          </span>
          <span style={{ width: 88, height: 1, background: RULE }} />
        </div>
        <img src="/stamp-honest.png" alt="" style={{ width: 50, height: 50, flexShrink: 0, objectFit: "contain", transform: "rotate(2deg)" }} />
      </div>

      <span style={{ height: 1, background: RULE }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <span style={{ marginTop: 1, display: "flex" }}>
              {l.good
                ? <Check size={13} color={TICK} strokeWidth={3} style={{ flexShrink: 0 }} />
                : <XIcon size={13} color={CROSS} strokeWidth={3} style={{ flexShrink: 0 }} />}
            </span>
            <span style={{ fontSize: 12.5, lineHeight: "17px", fontWeight: 500, color: PAPER_INK }}>{l.t}</span>
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

// ─── Where to stay ───
//
// Two questions, and neither of them is which part of town. The page answers
// that everywhere else: the map says where the region is, Pair with says what
// is next to it, and the honest bit says whether the beach is any good. What a
// couple genuinely cannot work out for themselves is what kind of place to book
// here and which room in it is worth paying up for, so that is what this says.
//
// The advice and the hotels are one answer, so they sit in one block rather
// than a card with a rail underneath it. Two surfaces read as two sections, and
// "what kind of hotel" followed by "here are the hotels" is plainly a single
// thought.
//
// White, like every other card on the page. It was a pink and cream wash, which
// is a lot of brand colour to put behind three paragraphs of body text; the
// pink earns more by being only the two icons and the bullets.
//
// Both halves used to open with an icon in a tinted well, which pushed the
// words into a column two thirds of the width and left a tall strip of nothing
// down the left of the block. The wells are gone. The advice is the only thing
// in here, so it gets the full width, and the room names are a plain list of
// the three worth asking about rather than three cards with a line of reasoning
// under each.
//
// Each hotel card carries a heart on its photograph, top right, in a white
// disc, the same corner the activity cards use. The card is a div that acts
// as a button, because the heart is a button and a button cannot hold one.
function WhereToStay({ stay, hotels, dest, city, onOpenHotel }) {
  const { isSaved, toggle } = useWishlist();
  return (
    <Sec title="Where to stay" flush>
      <div style={{
        margin: `0 ${PAD}px`, borderRadius: R.card, padding: "14px 14px 16px",
        background: C.white, boxShadow: SHADOW.card,
      }}>
        {stay && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Hotel size={15} color={C.p600} strokeWidth={2.4} />
              <p style={{ margin: 0, ...T.lead }}>What kind of hotel</p>
            </div>
            <p style={{ margin: "6px 0 0", ...T.body }}>{stay.note}</p>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.div}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BedDouble size={15} color={C.p600} strokeWidth={2.4} />
                <p style={{ margin: 0, ...T.lead }}>Which room to look for</p>
              </div>
              <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
                {stay.rooms.slice(0, 3).map((room) => (
                  <li key={room} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 6 }}>
                    {/* A plain black dot, not a pink one. Three pink marks in a
                        row beside a pink icon made a list of room names look
                        like three things on offer. */}
                    <span aria-hidden style={{
                      width: 5, height: 5, borderRadius: "50%", background: C.head,
                      flexShrink: 0, marginTop: 7,
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 400, color: C.head, lineHeight: 1.4 }}>{room}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {hotels.length > 0 && (
          <>
            <p style={{ margin: `${stay ? 16 : 0}px 0 10px`, ...T.h3 }}>Recommended hotels</p>
            <div className="hs" style={{ gap: 12, margin: "0 -14px", paddingLeft: 14, paddingRight: 14, alignItems: "stretch" }}>
              {hotels.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onOpenHotel(h)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenHotel(h); } }}
                  style={{
                    flexShrink: 0, width: 255, background: C.white, borderRadius: R.card,
                    overflow: "hidden", boxShadow: SHADOW.card,
                    display: "flex", flexDirection: "column",
                    border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  {/* A rail stretches every card to the tallest, and a hotel
                      with two tags instead of three used to leave the slack as
                      white at the bottom. The photograph takes it instead.
                      Absolute, because a plain `height: 100%` inside a flexible
                      box cannot resolve: the image fell back to its own aspect
                      ratio and set the height of every card in the rail. */}
                  <div style={{ position: "relative", flex: 1, minHeight: 128, background: A.photoBg }}>
                    <img src={h.images?.[0]?.url} alt={h.name} style={{
                      position: "absolute", inset: 0,
                      width: "100%", height: "100%", objectFit: "cover", display: "block",
                    }} />
                  </div>
                  <div style={{ padding: "10px 12px 13px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, ...T.micro, fontWeight: 600, color: C.sub }}>
                        <Star size={11} fill={A.star} color={A.star} strokeWidth={0} /> {h.stars} star
                      </span>
                      {/* Whose score it is, said with the mark rather than a
                          word. A number on its own is not a rating. */}
                      <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <SourceLogo source="booking" size={13} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.head }}>
                          {Number(h.bookingScore).toFixed(1)} rated
                        </span>
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                      <p style={{ margin: 0, flex: 1, minWidth: 0, ...T.h3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</p>
                      <SaveHeart
                        size={28}
                        saved={isSaved("hotel", dest, h.name)}
                        onToggle={() => toggle("hotel", dest, h.name, hotelMeta(h, city))}
                        style={{ margin: "-5px -6px -5px 0" }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "3px 0 0" }}>
                      <MapPin size={11} color={C.inact} style={{ flexShrink: 0 }} />
                      <span style={{ ...T.micro, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {h.neighbourhood} · {h.distanceFromCenter} km from the centre
                      </span>
                    </div>
                    {/* The star count and the score are on the row above, so the
                        tags that only repeat them are dropped. The meal plan
                        goes too: "Breakfast included" and "Only Room" are a
                        rate detail, and nothing on this page is a rate. Two
                        tags, because the third was always the weakest one. */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
                      {[...(h.viewTags || []), ...(h.amenities || [])]
                        .filter((x) => x && !/star$|rated$/.test(x))
                        .filter((x, i, all) => all.findIndex((y) =>
                          y.toLowerCase().includes(x.toLowerCase()) ||
                          x.toLowerCase().includes(y.toLowerCase())) === i)
                        .slice(0, 2)
                        .map((x) => (
                          <span key={x} style={{
                            padding: "3px 8px", borderRadius: R.pill, background: C.bg,
                            fontSize: 10.5, fontWeight: 600, color: C.sub, whiteSpace: "nowrap",
                          }}>{x}</span>
                        ))}
                    </div>
                    {/* No price. Nothing on this page is a quote, the nightly
                        rate here is not the one that ends up in a package, and
                        a number a consultant has to walk back on the call is
                        worse than no number at all. */}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Sec>
  );
}

// ─── Pair with ───
//
// Nobody books one region. A couple reading about Ubud is already wondering
// what goes with it, and the answer was a swipe away with no sign that it
// existed. The distance is measured off the real coordinates, in a straight
// line, which is why it says "apart" rather than a number of hours we do not
// hold.
// ─── What the place is, in two words ───
//
// A paired city used to carry two clamped lines of prose that ended in an
// ellipsis on every card, which is a sentence nobody finishes reading on a
// 150px card. The kinds of thing its days are built around say it faster: Ha
// Long is on the water and an adventure, Hoi An is culture and food. Read off
// the city's own plans, so a chip here means what it means everywhere else.
function pairThemes(city) {
  const counts = new Map();
  for (const v of cityVibes[city] || []) {
    for (const name of v.activities || []) {
      const k = activityKind(name);
      if (k) counts.set(k, (counts.get(k) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k);
}

function PairWith({ city, others, onPick }) {
  const here = cityCoords[city];
  if (!others.length) return null;
  return (
    <Sec title={`Travellers pair ${city} with`} flush>
      <div className="hs" style={{ gap: 12, paddingLeft: PAD, paddingRight: PAD, alignItems: "stretch" }}>
        {others.map((o) => {
          const there = cityCoords[o.city];
          return (
            <button key={o.city} onClick={() => onPick(o.city)} style={{
              // Wide enough for two theme chips on one line. At 150 the long
              // kinds wrapped, and a rail stretches every card to the tallest,
              // so one wrap left a band of nothing under all the others.
              flexShrink: 0, width: 164, background: C.white, borderRadius: R.card,
              overflow: "hidden", boxShadow: SHADOW.card, display: "block",
              border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <img src={o.img} alt="" style={{ width: "100%", height: 92, objectFit: "cover", display: "block", background: A.photoBg }} />
              <div style={{ padding: "9px 11px 11px" }}>
                <p style={{ margin: 0, ...T.h3, fontSize: 14, ...clamp(1) }}>{o.emoji} {o.city}</p>
                <p style={{ margin: "3px 0 0", ...T.micro }}>
                  {o.dayTrip ? "Day trip" : `${o.n} ${o.n === 1 ? "night" : "nights"}`}
                  {here && there ? ` · ${Math.round(kmApart(here, there))} km apart` : ""}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                  {pairThemes(o.city).map((k) => {
                    const t = KIND_TONE[k] || KIND_TONE.Culture;
                    return (
                      <span key={k} style={{
                        padding: "3px 7px", borderRadius: R.pill,
                        background: t.bg, color: t.fg,
                        fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap",
                      }}>{k}</span>
                    );
                  })}
                  {o.dayTrip && (
                    <span style={{
                      padding: "3px 7px", borderRadius: R.pill,
                      background: WELL.neutral.bg, color: WELL.neutral.fg,
                      fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap",
                    }}>Day trip</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Sec>
  );
}

// ─── Common questions ───
//
// At the foot of the page, where a couple lands once they have read everything
// above and are still holding one doubt. Every answer is read off this region's
// own data rather than written out again, so it cannot drift from the sections
// it is summarising.
//
// Written the way the hotel page writes its questions: no box, a hairline
// between the rows, chevron up and down. A card round them made the answers
// look like a different kind of thing from the rest of the page.
function Faq({ items }) {
  const [open, setOpen] = useState(null);
  if (!items.length) return null;
  return (
    <Sec title="Common questions">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} style={{ borderTop: i > 0 ? `1px solid ${C.div}` : "none" }}>
            <button
              onClick={() => setOpen(on ? null : i)}
              aria-expanded={on}
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
              <p style={{ ...T.body, margin: "0 0 15px", fontSize: 13 }}>{f.a}</p>
            )}
          </div>
        );
      })}
    </Sec>
  );
}

// ─── The photographs at the top ───
//
// A full-width reel you swipe, with dots under it and the count in the corner,
// which is the shape a couple already knows from every listing app they have
// ever booked anything on. The sheet of facts starts underneath it and scrolls
// over it, so the page opens on a picture and answers questions immediately
// below.
//
// Snapping is CSS, and the dots read the scroll position rather than driving
// it, so a flick, a drag and a trackpad all land on the same frame.
function RegionHero({ photos, city, count, onBack, onGallery, height, hideBack, closeIcon }) {
  const rail = useRef(null);
  const [i, setI] = useState(0);

  const onScroll = (e) => {
    const el = e.currentTarget;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    if (next !== i) setI(next);
  };

  const round = {
    width: 36, height: 36, borderRadius: "50%", border: "none",
    background: "rgba(255,255,255,0.96)", boxShadow: SHADOW.float,
    display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0,
    backdropFilter: "blur(8px)",
  };

  return (
    <div style={{ position: "relative", height, background: "#15172A" }}>
      <div
        ref={rail}
        className="hide-scrollbar"
        onScroll={onScroll}
        style={{
          display: "flex", height: "100%", overflowX: "auto", overflowY: "hidden",
          scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Tapping the picture opens the gallery, which is what the button in
            the corner does and what a full-bleed photograph has promised on
            every other app a couple already uses. A swipe still moves the
            reel: a drag is not a tap, so the two do not fight. */}
        {photos.map((src, n) => (
          <div
            key={n}
            onClick={onGallery}
            style={{ flex: "0 0 100%", width: "100%", height: "100%", scrollSnapAlign: "start", background: A.photoBg, cursor: "pointer" }}
          >
            <img
              src={src}
              alt={n === 0 ? city : ""}
              // The first one is the page opening; the rest can wait until the
              // swipe that asks for them.
              loading={n === 0 ? "eager" : "lazy"}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}
      </div>

      {/* The top row sits over the photograph, clear of the status bar. */}
      <div style={{
        position: "absolute", left: 14, right: 14, zIndex: 2,
        top: "calc(14px + env(safe-area-inset-top, 0px))",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {!hideBack && (
          <button onClick={onBack} aria-label={closeIcon ? "Close" : "Back"} style={round}>
            {/* In a sheet this shuts the sheet rather than going anywhere, and
                a cross says that where an arrow says the opposite. */}
            {closeIcon ? <XIcon size={18} color={C.head} /> : <ArrowLeft size={18} color={C.head} />}
          </button>
        )}
      </div>

      {/* Dots under the photograph, and the gallery beside them. */}
      {photos.length > 1 && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 29, zIndex: 2,
          display: "flex", justifyContent: "center", gap: 5, pointerEvents: "none",
        }}>
          {photos.map((_, n) => (
            <span key={n} style={{
              width: n === i ? 7 : 5, height: n === i ? 7 : 5, borderRadius: "50%",
              background: n === i ? "#fff" : "rgba(255,255,255,0.55)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              transition: "width 0.15s ease, height 0.15s ease",
            }} />
          ))}
        </div>
      )}

      <button
        onClick={onGallery}
        style={{
          position: "absolute", right: 14, bottom: 24, zIndex: 2,
          display: "inline-flex", alignItems: "center", gap: 7,
          border: "none", borderRadius: R.pill, padding: "8px 14px", cursor: "pointer",
          fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: "#fff",
          background: "rgba(17,17,17,0.78)", backdropFilter: "blur(10px)",
          boxShadow: SHADOW.float,
        }}
      >
        <Images size={14} color="#fff" />
        View gallery
        <span style={{ opacity: 0.65, fontWeight: 600 }}>{count}</span>
      </button>
    </div>
  );
}

// ─── The bar that takes over from the photograph ───
//
// Once the pictures have scrolled away there is nothing on the screen saying
// which region you are reading about, and on a page this long that matters more
// than it sounds. So the name arrives in a plain bar exactly as the photograph
// leaves, carrying the way out, which should never be a scroll away. The save
// stays beside the name on the page, not up here.
function StickyBar({ city, show, onBack, closeIcon, inset = 0 }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 6,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)",
      borderBottom: `1px solid ${C.div}`,
      padding: "8px 12px",
      paddingTop: `calc(${8 + inset}px + env(safe-area-inset-top, 0px))`,
      display: "flex", alignItems: "center", gap: 8,
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(-100%)",
      pointerEvents: show ? "auto" : "none",
      transition: "opacity 0.18s ease, transform 0.18s ease",
    }}>
      <button onClick={onBack} aria-label={closeIcon ? "Close" : "Back"} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
        {closeIcon ? <XIcon size={17} color={C.head} /> : <ArrowLeft size={17} color={C.head} />}
      </button>
      <p style={{ margin: 0, flex: 1, minWidth: 0, ...T.h3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {city}
      </p>
    </div>
  );
}

// ─── One region ───
//
// `onAdd` is passed when this opens over the route step, where reading about a
// place is half of choosing it. Without it, somebody who has just read the
// honest bit about Ubud has to close the page, find the card again and press
// the plus, which is three taps to answer a question they already answered.
export default function RegionDetail({
  dest: destProp, city: cityProp, onClose, onAdd, added,
  // Set when this is the content of a bottom sheet. The sheet is a different
  // height at each of its stops, so the photographs cannot be measured off
  // this page's own box or they would resize as the sheet moves; the sheet
  // passes the one height it should always be. It also wants to know how far
  // the page has been scrolled, because scrolling is what opens it fully.
  heroHeight, onScrollTop, sheetStop,
}) {
  const { name, city } = useParams();
  const navigate = useNavigate();
  const { forDest, toggleRegion } = useSaves();
  const { isSaved, toggle } = useWishlist();
  const embedded = !!destProp;
  const dest = embedded ? destProp : decodeURIComponent(name || "");
  const [localCity, setLocalCity] = useState(cityProp || "");
  const town = embedded ? localCity : decodeURIComponent(city || "");

  const [H, setH] = useState(760);
  const [scrolled, setScrolled] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [map, setMap] = useState(false);
  const [allTrips, setAllTrips] = useState(null);
  const [activity, setActivity] = useState(null);
  const [hotel, setHotel] = useState(null);
  // A saved place to eat or shop opens its town's list of them straight away
  // (?open=eat or ?open=shop), since neither has a page of its own.
  const [search] = useSearchParams();
  const opening = destProp ? null : search.get("open");
  const [eateries, setEateries] = useState(opening === "eat");
  const [shopping, setShopping] = useState(opening === "shop");

  const box = useRef(null);
  const scroller = useRef(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => setH(el.getBoundingClientRect().height);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const r = useMemo(() => regionDetail(dest, town), [dest, town]);
  const regions = useMemo(() => regionsFor(dest) || [], [dest]);
  const hotels = useMemo(() => {
    if (!r) return [];
    return generateHotelsForCity(town, dest, "2026-11-10", "2026-11-17", 7)
      .filter((h) => Number(h.bookingScore) >= 8)
      .slice(0, 6);
  }, [r, town, dest]);
  const trips = useMemo(() => (r ? tripsThroughCity(dest, town) : []), [r, dest, town]);
  const shops = useMemo(() => (r ? regionShops(dest, town) : []), [r, dest, town]);
  const faq = useMemo(() => regionFaq(r), [r]);
  const reach = useMemo(() => (r ? regionReach(dest, town) : []), [r, dest, town]);

  // Going to another region starts that page at the top, the way opening any
  // page does. Without this you land halfway down somebody else's FAQ.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
    setScrolled(false);
  }, [town]);

  const goRegion = (c) => {
    if (!c || c === town) return;
    if (embedded) { setLocalCity(c); return; }
    navigate(`/destination/${encodeURIComponent(dest)}/region/${encodeURIComponent(c)}`);
  };
  const back = () => (embedded ? onClose?.() : navigate(-1));

  // The photographs take a little under half the screen, which is where every
  // listing app puts them, and leaves the first section of facts visible at
  // the bottom rather than a strip of nothing.
  const heroH = heroHeight || Math.round(H * 0.42);

  const onScroll = useCallback((e) => {
    // The bar arrives as the last of the photograph leaves.
    setScrolled(e.currentTarget.scrollTop > heroH - 70);
    onScrollTop?.(e.currentTarget.scrollTop);
  }, [heroH, onScrollTop]);

  // The same chips the cities step showed for this place. Above the early
  // return, because a hook cannot sit below one.
  const tags = useMemo(() => cityTags(dest, town), [dest, town]);

  if (!regions.length || !regions.some((x) => x.city === town) || !r) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ ...T.body }}>We don&apos;t have a page for {town} yet.</p>
        <button onClick={back} style={{ marginTop: 14, border: "none", background: C.p600, color: "#fff", borderRadius: R.pill, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Go back</button>
      </div>
    );
  }

  const g = r.guide;
  const hasMap = !!cityCoords[town];
  const saved = forDest(dest).regions.includes(town);
  const mediaCount = new Set([
    ...r.photos,
    ...r.acts.map((a) => a.img),
    ...(customerPhotos[r.dest] || []).map((x) => x?.img || x).filter((x) => typeof x === "string"),
  ].filter(Boolean)).size;

  return (
    <div ref={box} style={{ position: "absolute", inset: 0, overflow: "hidden", background: C.bg }}>
      <div ref={scroller} className="hide-scrollbar" onScroll={onScroll}
        style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        <RegionHero
          photos={r.photos.slice(0, 8)}
          city={r.city}
          count={mediaCount}
          height={heroH}
          hideBack={sheetStop === "full"}
          closeIcon={!!sheetStop}
          onBack={back}
          onGallery={() => setGallery(true)}
        />

        {/* The facts, lifted over the bottom of the photographs. */}
        <div style={{
          position: "relative", marginTop: -18, background: C.bg,
          borderRadius: "20px 20px 0 0", minHeight: "60%",
        }}>
          <div style={{ display: "flex", justifyContent: "center", padding: "9px 0 2px" }}>
            <span style={{ width: 38, height: 4, borderRadius: 99, background: C.div }} />
          </div>

          <div style={{ padding: `8px ${PAD}px 0` }}>
            {/* The country and the area used to sit above the name. A couple
                arrived here from a Vietnam screen by tapping Hanoi, so neither
                was news, and the map beside the name answers the where. The
                heart closes the row, right aligned, the same as on every card. */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 26, fontWeight: 800, color: C.head, letterSpacing: "-0.7px", lineHeight: "31px" }}>
                {r.city}
              </h1>
              {hasMap && <MapsButton onClick={() => setMap(true)} />}
              <SaveHeart size={32} saved={saved} onToggle={() => toggleRegion(dest, town)} style={{ marginRight: -6 }} />
            </div>
            {/* The chips this city wore on the step it was chosen from, so
                somebody who tapped Ha Long because it was "Paired with Hanoi"
                still sees that on the page they land on. */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {tags.map((t) => (
                  <span key={t.key} style={{
                    padding: "4px 9px", borderRadius: R.pill,
                    background: t.bg, color: t.fg,
                    fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                  }}>{t.label}</span>
                ))}
              </div>
            )}
            {/* Lead and description are one block, capped at three lines, so
                the page opens on a picture and a paragraph rather than a page
                of prose. */}
            <ReadMore lead={g?.lead || r.blurb} sub={g?.sub}>{g?.about}</ReadMore>
          </div>

          {r.acts.length > 0 && <ThingsToDo acts={r.acts} city={r.city} dest={r.dest} onOpen={setActivity} />}
          {/* No section heading over the postcard. "The honest bit" sat
              directly above the card's own handwritten "Hanoi, honestly",
              which is the same heading twice and the card's is the better
              one. */}
          {(r.pros.length > 0 || r.cons.length > 0) && (
            <Sec>
              <Postcard city={r.city} pros={r.pros} cons={r.cons} />
            </Sec>
          )}
          <WhenToGo r={r} />
          {/* The home screen's heading, word for word, because it is the same
              rail of the same cards. */}
          {trips.length > 0 && (
            <Sec
              title={<>
                Real itineraries{" "}
                <span style={{
                  display: "inline-block", transform: "rotate(-5deg)", whiteSpace: "nowrap",
                  fontFamily: "Caveat, cursive", fontSize: 17, fontWeight: 700, color: "#007E72",
                  letterSpacing: 0, marginLeft: 3,
                }}>by real travellers</span>
              </>}
              action={<ViewAll onClick={() => setAllTrips(trips)} />}
              flush
            >
              <div className="hs" style={{ gap: 12, paddingLeft: PAD, paddingRight: PAD, alignItems: "stretch" }}>
                {trips.slice(0, SHOWN_TRIPS).map((t) => <BookedCard key={t.key} t={t} />)}
              </div>
            </Sec>
          )}
          {/* After the itineraries. Getting there is a question somebody asks
              once they have decided to come, and the trips are what decides
              it. */}
          {reach.length > 0 && <HowToReach origins={reach} city={r.city} />}
          {g?.transport?.length > 0 && <TransportModes items={g.transport} city={r.city} />}
          {(g?.stay || hotels.length > 0) && (
            <WhereToStay stay={g?.stay} hotels={hotels} dest={dest} city={r.city} onOpenHotel={setHotel} />
          )}
          {r.food?.length > 0 && (
            <Restaurants list={r.food} dest={dest} city={r.city} onMap={() => setEateries(true)} />
          )}
          {shops.length > 0 && (
            <Shopping list={shops} dest={dest} city={r.city} onMap={() => setShopping(true)} />
          )}
          <PairWith city={r.city} others={r.paired} onPick={goRegion} />
          <Faq items={faq} />
          <div style={{ height: onAdd ? 92 : 40 }} />
        </div>
      </div>

      {/* In a sheet the bar is the way out and is there the whole time the
          sheet is full, rather than arriving with the scroll: a sheet with no
          visible way to close it is a trap. */}
      <StickyBar
        city={r.city}
        show={scrolled || sheetStop === "full"}
        onBack={back}
        closeIcon={!!sheetStop}
        inset={sheetStop ? 20 : 0}
      />

      {/* The answer to the question this page was opened to settle. */}
      {onAdd && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 7,
          background: C.white, borderTop: `1px solid ${C.div}`,
          padding: "10px 16px calc(12px + env(safe-area-inset-bottom))",
        }}>
          <button onClick={onAdd} style={{
            width: "100%", padding: "13px 0", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
            fontSize: 14.5, fontWeight: 700,
            border: added ? `1.5px solid ${C.p600}` : "none",
            background: added ? C.white : C.p600,
            color: added ? C.p600 : "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            {added
              ? <><Check size={16} strokeWidth={3} /> Added to the trip</>
              : <><Plus size={16} strokeWidth={3} /> Add {r.city} to the trip</>}
          </button>
        </div>
      )}

      {eateries && hasMap && r.food?.length > 0 && (
        <PlaceMapScreen
          dest={dest} city={r.city} list={r.food}
          title={`Where to eat in ${r.city}`} pinKind="Food"
          tags={foodTags} kind="restaurant" meta={foodMeta}
          onClose={() => setEateries(false)}
        />
      )}
      {shopping && hasMap && shops.length > 0 && (
        <PlaceMapScreen
          dest={dest} city={r.city} list={shops}
          title={`Where to shop in ${r.city}`} pinKind="Market"
          tags={shopTags} kind="shop" meta={shopMeta}
          onClose={() => setShopping(false)}
        />
      )}

      {gallery && <GalleryScreen r={r} onClose={() => setGallery(false)} />}
      {allTrips && <AllTripsSheet trips={allTrips} onClose={() => setAllTrips(null)} />}
      {map && hasMap && (
        <RegionMapScreen
          dest={dest}
          city={r.city}
          acts={r.acts}
          onOpenAct={(a) => { setMap(false); setActivity(a); }}
          onClose={() => setMap(false)}
        />
      )}

      {/* The hotel page, read-only: from here there is no stay to price and
          nothing to swap, so it opens the same way a saved hotel does. */}
      {hotel && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, background: C.white }}>
          <HotelV3
            hotel={detailFromHotel(hotel)}
            onBack={() => setHotel(null)}
            readOnly
            saved={isSaved("hotel", dest, hotel.name)}
            onSave={() => toggle("hotel", dest, hotel.name, hotelMeta(hotel, r.city))}
          />
        </div>
      )}

      {activity && (
        <ActivityScreen
          // The hand-written line goes through as the summary, so the page
          // opens with the same sentence the card promised rather than the
          // builder's generic one. The pictures go through for the same reason:
          // the card and the page it opens should show the same place.
          activity={{
            name: activity.name,
            img: activity.img,
            photos: activity.imgs,
            editorialSummary: activity.summary,
          }}
          city={r.city}
          country={dest}
          isBooked={false}
          saved={isSaved("activity", dest, activity.id)}
          onSave={() => toggle("activity", dest, activity.id, actMeta(activity, r.city))}
          onClose={() => setActivity(null)}
        />
      )}
    </div>
  );
}
