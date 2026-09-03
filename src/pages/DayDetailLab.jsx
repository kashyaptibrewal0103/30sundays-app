import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Check, X as XIcon,
  Clock, Timer, Car, Info, RefreshCw,
} from "lucide-react";
import { C } from "../data";
import { ActivityDetailScroll } from "./ActivityDetail";
import { TourReviewsSheet } from "./ItineraryDetail";
import { buildActivityDetail } from "../data/activityData";
import { getDayScoring } from "../data/dayScoring";
import { DayScoreRow, DayScoreModal } from "../components/DayScoring";
import { getDayRating } from "../data/dayRatings";
import { DayRatingRow } from "../components/DayRating";

// DayDetailLab - the accordion day detail, three layouts. Live at /day-lab
//
// Brief this build follows:
//  - top of the screen is unchanged from the app: day + city, title, the day
//    rating, then the pace / time / crowd card
//  - "Your day will cover:" then one card per tour
//  - a collapsed tour card carries title, image, duration, pickup time,
//    transfer type and a 3-line overview, with Read more
//  - Read more opens everything the PDF has, inclusions and exclusions included
//  - a tour's activities appear in the expanded view, tappable through to the
//    activity screen
//  - no big image and no date card inside the expanded view
//  - no restaurant section, and traveller stories are kept quiet at the end

const HEAD = "#181E4C";
const SUB = "#666C99";
const LINE = "#E0E2EB";
const SOFT = "#F0F1F5";
const PINK = "#FD014F";
const GREEN = "#4EAC7E";

const CDN = "https://cdn.30sundays.club/app_content";
export const IMG = {
  vinwonders: `${CDN}/vietnam/hoi_an_memories_show_502.jpg`,
  safari: `${CDN}/vietnam/sapa_valley_501.jpg`,
  grandworld: `${CDN}/vietnam/kissing_bridge_495.jpg`,
  kissbridge: `${CDN}/vietnam/kissing_bridge_495.jpg`,
  symphony: `${CDN}/vietnam/hoi_an_memories_show_502.jpg`,
  fireworks: `${CDN}/vietnam/xuong_island_496.jpg`,
  island: `${CDN}/vietnam/fingernail_island_497.jpg`,
  kayak: `${CDN}/vietnam/kayaking_halong_bay_500.jpg`,
  taichi: `${CDN}/vietnam/sunrise_tai_chi_ha_long_bay_499.jpg`,
  cooking: `${CDN}/vietnam/nem_cuon_cooking_class_ha_long_bay_498.jpg`,
  car: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&q=80&auto=format&fit=crop",
  dinner: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=640&q=80&auto=format&fit=crop",
  sunset: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=640&q=80&auto=format&fit=crop",
};

// ─── Tours. Every field here exists in the PDF today ───────────────────────

const TOUR_COMBO = {
  id: "combo",
  name: "Phu Quoc Triple Park Day Combo",
  img: IMG.vinwonders,
  duration: "10 hours",
  time: "8:30 am",
  transfer: "Shared transfer",
  overview:
    "Spend a full day across Phu Quoc's three headline parks. Ride the world's longest sea-crossing cable car, meet Vietnam's only open safari, and finish inside the canals and shows of Grand World. Entry to all three parks and the transfers between them are already paid for in your package.",
  covers: [
    { label: "8:30 am pickup", text: "Shared van from your hotel, about 40 minutes to the park cluster." },
    { label: "Three parks, one ticket", text: "Entry to all three is included, with a shuttle running between them all day." },
    { label: "Evening shows", text: "Stay for the Tata show and the Quintessence of Vietnam performance." },
    { label: "Back by 8:30 pm", text: "Drop at your hotel. Dinner is on your own." },
  ],
  inclusions: [
    "Entry tickets to VinWonders, Vinpearl Safari and Grand World",
    "Round-trip shared transfer from your hotel",
    "English-speaking tour guide",
    "Safari open-bus ride",
    "Mineral water and cold towel",
    "Passenger insurance",
  ],
  exclusions: [
    "Lunch and dinner",
    "Optional paid rides inside the parks",
    "Personal expenses and shopping",
    "Tips for the guide and driver",
  ],
  important: [
    "Vinpearl Safari closes for maintenance on the first Monday of each month.",
    "You will walk 4 to 6 km across the three parks, wear comfortable shoes.",
    "Park timings can change on public holidays and when shows change season.",
  ],
  activities: [
    { name: "VinWonders Phu Quoc", img: IMG.vinwonders },
    { name: "Vinpearl Safari Phu Quoc", img: IMG.safari },
    { name: "Grand World Complex", img: IMG.grandworld },
  ],
};

const TOUR_SUNSET = {
  id: "sunset",
  name: "Discover Sunset Town: Kiss Bridge, Symphony of the Sea & Fireworks",
  img: IMG.sunset,
  duration: "6 hours",
  time: "2:00 pm",
  transfer: "Shared transfer",
  overview:
    "An evening in Phu Quoc's Sunset Town, built around the Mediterranean-style waterfront. Time on the beach first, then the Kiss Bridge at golden hour, the Symphony of the Sea show after dark and the nightly fireworks over the bay.",
  covers: [
    { label: "2:00 pm pickup", text: "Shared van from your hotel to Sunset Town, about 45 minutes." },
    { label: "Free time on the beach", text: "An hour at Sunset Beach before the walk to the bridge." },
    { label: "Golden hour at Kiss Bridge", text: "The best light is between 5:30 and 6:15 pm." },
    { label: "Show and fireworks", text: "Symphony of the Sea seating, then the fireworks from the promenade." },
  ],
  inclusions: [
    "Round-trip shared transfer",
    "English-speaking tour guide",
    "Symphony of the Sea show ticket (Season 2)",
    "Dinner",
    "Mineral water and cold towel",
    "Passenger insurance",
  ],
  exclusions: [
    "Drinks beyond those served with dinner",
    "Cable car ticket to Hon Thom",
    "Tips for the guide and driver",
  ],
  important: [
    "The fireworks are weather dependent and can be cancelled at short notice.",
    "Show seating is unreserved, arrive with the group to sit together.",
  ],
  activities: [
    { name: "Kiss Bridge", img: IMG.kissbridge },
    { name: "Symphony of the Sea show", img: IMG.symphony },
    { name: "Sunset Town fireworks", img: IMG.fireworks },
  ],
};

const TOUR_DINNER = {
  id: "dinner",
  name: "Sea Sense Beach View Veg Romantic Dinner",
  img: IMG.dinner,
  duration: "3 hours",
  time: "7:00 pm",
  transfer: "Self transfer",
  overview:
    "A romantic beach-view dinner at Sea Sense with a privately decorated table and a five-course Western set menu, served as the sun goes down over Long Beach.",
  covers: [
    { label: "Beach view table setup", text: "Dinner at a specially arranged beach-view table." },
    { label: "Romantic decor", text: "The table setup includes floral decorations and candles." },
    { label: "5-course dinner", text: "A five-course Western set menu, fully vegetarian." },
    { label: "Wine", text: "One bottle of wine with the dinner." },
  ],
  inclusions: [
    "Beach view table setup",
    "Floral decorations",
    "Candles",
    "5-course Western set menu dinner",
    "1 bottle of wine",
  ],
  exclusions: [
    "Hotel transfers to and from Sea Sense",
    "Extra food or drinks ordered on the day",
    "Gratuities",
  ],
  important: [
    "You will make your own way to Sea Sense, the restaurant holds your table for 30 minutes.",
  ],
  activities: [
    { name: "Sea Sense Restaurant", img: IMG.dinner },
  ],
};

const TOUR_TRANSFER = {
  id: "transfer",
  name: "Phu Quoc City Centre Inter-Hotel Transfer",
  img: IMG.car,
  duration: "30 mins",
  time: "11:00 am",
  transfer: "Private car",
  overview:
    "A quick private transfer within central Phu Quoc City, under 5 km, between your two hotels.",
  covers: [
    { label: "Hotel pickup", text: "Driver collects you from your first hotel in the city centre area." },
    { label: "Private transfer", text: "Air-conditioned ride to your next hotel, less than about 5 km." },
    { label: "Hotel drop-off", text: "Direct drop at your next hotel." },
  ],
  inclusions: ["One-way private transfer", "Air-conditioned vehicle", "Professional driver", "All tolls and parking"],
  exclusions: ["Meals and drinks", "Tips and personal expenses", "Anything not listed in inclusions"],
  important: ["Timings can change due to traffic, weather or local rules."],
  activities: [],
};

// ─── Day shapes. All three are asked for in the brief ─────────────────────

// Day media, deliberately different on each day so the immersive variants can
// be checked against all three cases: video plus images, images only, and a
// single image.
const MEDIA_FULL = {
  video: { poster: IMG.vinwonders, duration: "1:12", title: "Your day in Phu Quoc" },
  images: [IMG.safari, IMG.grandworld, IMG.island, IMG.kayak, IMG.taichi, IMG.cooking],
};
const MEDIA_IMAGES = {
  video: null,
  images: [IMG.sunset, IMG.kissbridge, IMG.symphony, IMG.fireworks, IMG.island],
};
const MEDIA_SINGLE = {
  video: null,
  images: [IMG.dinner],
};

export const SHAPES = [
  { key: "one",  label: "1 tour",     dayNum: 3, city: "Phu Quoc", date: "Wed, 10 Dec 2026", title: "Phu Quoc Triple Park Day Combo", tours: [TOUR_COMBO], media: MEDIA_FULL },
  { key: "trtr", label: "Transfer + tour", dayNum: 4, city: "Phu Quoc", date: "Thu, 11 Dec 2026", title: "Hotel change, then Sunset Town", tours: [TOUR_TRANSFER, TOUR_SUNSET], media: MEDIA_IMAGES },
  { key: "twot", label: "Tour + tour", dayNum: 5, city: "Phu Quoc", date: "Fri, 12 Dec 2026", title: "Sunset Town, then a beach dinner", tours: [TOUR_SUNSET, TOUR_DINNER], media: MEDIA_SINGLE },
];

// Padded so no shape is ever the first or last day of the trip, which would
// load the scoring with airport travel time.
const FILLER = { dayNum: 0, city: "Phu Quoc", activities: [{ name: "Beach" }] };
export const SCORING_DAYS = [
  FILLER,
  ...SHAPES.map((s) => ({ dayNum: s.dayNum, city: s.city, activities: s.tours.flatMap((t) => t.activities) })),
  FILLER,
];

export const STORIES = [IMG.vinwonders, IMG.safari, IMG.grandworld, IMG.island, IMG.kayak, IMG.taichi, IMG.cooking];

// ─── Small shared pieces ──────────────────────────────────────────────────

function Label({ children }) {
  return <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: SUB, letterSpacing: 0.6, textTransform: "uppercase" }}>{children}</p>;
}

// Duration, pickup time and transfer type. One wrapped row, never more than
// two lines, so the card stays short.
function MetaRow({ tour, size = 12.5 }) {
  const timeLabel = tour.transfer === "Self transfer" ? "Starts" : "Pickup";
  const Item = ({ icon: Icon, children, tone }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: size, color: tone || HEAD, whiteSpace: "nowrap" }}>
      <Icon size={13} color={tone || SUB} /> {children}
    </span>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
      <Item icon={Clock}>{tour.duration}</Item>
      {tour.time && <Item icon={Timer}>{timeLabel} {tour.time}</Item>}
      <Item icon={Car}>{tour.transfer}</Item>
    </div>
  );
}

function Clamp({ text, lines = 3, size = 13.5 }) {
  return (
    <p style={{
      margin: 0, fontSize: size, color: SUB, lineHeight: "20px",
      display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden",
    }}>{text}</p>
  );
}

function Covers({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((c, i) => (
        <div key={i} style={{ display: "flex", gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, flexShrink: 0, marginTop: 7 }} />
          <p style={{ margin: 0, fontSize: 13.5, color: HEAD, lineHeight: "20px" }}>
            <span style={{ fontWeight: 600 }}>{c.label}: </span>
            <span style={{ color: SUB }}>{c.text}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function CheckList({ items, kind = "in", size = 13.5 }) {
  const isIn = kind === "in";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {items.map((x, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          {isIn
            ? <Check size={14} color="#027A48" strokeWidth={2.6} style={{ flexShrink: 0, marginTop: 3 }} />
            : <XIcon size={14} color="#A4A7AE" strokeWidth={2.6} style={{ flexShrink: 0, marginTop: 3 }} />}
          <span style={{ fontSize: size, color: isIn ? HEAD : SUB, lineHeight: "20px" }}>{x}</span>
        </div>
      ))}
    </div>
  );
}

function NoteBox({ items }) {
  return (
    <div style={{ background: "#FFFAEB", border: "1px solid #FEDF89", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Info size={13} color="#B54708" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#B54708" }}>Important information</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {items.map((x, i) => (
          <p key={i} style={{ margin: 0, fontSize: 12.5, color: "#93370D", lineHeight: "18px" }}>{x}</p>
        ))}
      </div>
    </div>
  );
}

// Activities in the tour. Image + title, tapping opens the activity screen.
function ActivityList({ activities, onOpen }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {activities.map((a, i) => (
        <button key={i} onClick={() => onOpen(a)} style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
          padding: 6, background: "#fff", border: `1px solid ${SOFT}`, borderRadius: 10,
          boxShadow: "0 4px 16px -6px rgba(16,24,40,0.08)", cursor: "pointer", fontFamily: "inherit",
        }}>
          <span style={{ width: 46, height: 46, borderRadius: 8, overflow: "hidden", background: SOFT, flexShrink: 0 }}>
            <img src={a.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: HEAD, lineHeight: 1.3 }}>{a.name}</span>
          <ChevronRight size={17} color={PINK} style={{ flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}

function ReadMore({ open, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: 0, background: "none",
      border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: PINK, cursor: "pointer",
    }}>
      {open ? "Show less" : "Read more"}
      <ChevronDown size={14} color={PINK} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s ease" }} />
    </button>
  );
}

// ─── Expanded tour body ───────────────────────────────
// No hero image and no date card in here, both live on the collapsed card.

export function ExpandedStack({ tour, onActivity }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p style={{ margin: 0, fontSize: 13.5, color: HEAD, lineHeight: "21px" }}>{tour.overview}</p>
      <div>
        <Label>{tour.activities.length ? "This experience will cover" : "This transfer will cover"}</Label>
        <div style={{ height: 8 }} />
        <Covers items={tour.covers} />
      </div>
      {tour.activities.length > 0 && (
        <div>
          <Label>{tour.activities.length > 1 ? `${tour.activities.length} places you will visit` : "Where you are going"}</Label>
          <div style={{ height: 8 }} />
          <ActivityList activities={tour.activities} onOpen={onActivity} />
        </div>
      )}
      <div>
        <Label>Inclusions</Label>
        <div style={{ height: 8 }} />
        <CheckList items={tour.inclusions} kind="in" />
      </div>
      <div>
        <Label>Exclusions</Label>
        <div style={{ height: 8 }} />
        <CheckList items={tour.exclusions} kind="ex" />
      </div>
      <NoteBox items={tour.important} />
    </div>
  );
}

// ─── The tour card ───────────────────────────────

function TourEyebrow({ index, total }) {
  if (total < 2) return null;
  return (
    <p style={{ margin: "0 0 3px", fontSize: 10.5, fontWeight: 700, color: PINK, letterSpacing: 0.4, textTransform: "uppercase" }}>
      Tour {index + 1} of {total}
    </p>
  );
}

// The tour card: image left, title and the three facts right, overview
// clamped to three lines, Read more opening everything the PDF carries.
export function TourCard({ tour, index, total, open, onToggle, onActivity }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, background: "#fff", padding: 12, marginBottom: 12 }}>
      <div onClick={onToggle} style={{ display: "flex", gap: 12, cursor: "pointer" }}>
        <div style={{ width: 84, height: 84, borderRadius: 10, overflow: "hidden", background: SOFT, flexShrink: 0 }}>
          <img src={tour.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <TourEyebrow index={index} total={total} />
          <h4 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: HEAD, lineHeight: 1.32, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{tour.name}</h4>
          <div style={{ height: 7 }} />
          <MetaRow tour={tour} />
        </div>
      </div>
      <div style={{ height: 10 }} />
      {!open && <Clamp text={tour.overview} lines={3} />}
      {open && (
        <div style={{ paddingTop: 4 }}>
          <ExpandedStack tour={tour} onActivity={onActivity} />
        </div>
      )}
      <div style={{ height: 10 }} />
      <ReadMore open={open} onClick={onToggle} />
    </div>
  );
}

// ─── Screen chrome ─────────────────────────────

function DayTopBar({ day }) {
  const navBtn = {
    width: 30, height: 30, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
  };
  return (
    <div style={{ flexShrink: 0, padding: "14px 12px 12px", background: "#FFF1F4", display: "flex", alignItems: "center", gap: 8 }}>
      <button style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <ArrowLeft size={18} color={C.head} />
      </button>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minWidth: 0 }}>
        <button style={navBtn}><ChevronLeft size={16} color={C.head} /></button>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head, whiteSpace: "nowrap" }}>Day {day.dayNum} · {day.city}</p>
        <button style={navBtn}><ChevronRight size={16} color={C.head} /></button>
      </div>
      <div style={{ width: 34, flexShrink: 0 }} />
    </div>
  );
}

// Title, day rating and the pace / time / crowd card, exactly as the app has it.
function DayHeader({ day, scoring, rating, onMetric, onRating }) {
  return (
    <div style={{ background: "linear-gradient(180deg, #FFF1F4 0%, #FFF6F8 100%)", padding: "4px 0 16px", borderBottom: `1px solid ${C.div}` }}>
      <div style={{ padding: "8px 20px 14px" }}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: HEAD, lineHeight: 1.25 }}>{day.title}</h2>
      </div>
      {rating && (
        <div style={{ padding: "0 20px 14px" }}>
          <DayRatingRow rating={rating} onOpen={onRating} />
        </div>
      )}
      <div style={{ padding: "0 16px" }}>
        <div style={{ borderRadius: 16, overflow: "hidden", background: "#fff", border: "1px solid #FFE0E7", boxShadow: "0 2px 10px rgba(253,1,79,0.06)" }}>
          <DayScoreRow scoring={scoring} onOpen={onMetric} bg="#fff" borderColor="transparent" divider="#FFE0E7" />
        </div>
      </div>
    </div>
  );
}

// Kept, but quiet. The screen is about the tours now.
export function TravellerStories() {
  return (
    <div style={{ padding: "14px 20px 24px" }}>
      <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 600, color: SUB }}>Traveller stories</p>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -20px", padding: "0 20px" }}>
        {STORIES.map((p, i) => (
          <div key={i} style={{ width: 76, minWidth: 76, height: 76, borderRadius: 8, overflow: "hidden", background: SOFT, flexShrink: 0 }}>
            <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChangeDayCTA() {
  return (
    <div style={{ flexShrink: 0, padding: "10px 16px calc(10px + env(safe-area-inset-bottom))", borderTop: `1px solid ${C.div}`, background: "#fff", boxShadow: "0 -2px 12px rgba(0,0,0,0.06)" }}>
      <button style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 16px", background: C.head, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
        <RefreshCw size={15} color="#fff" />
        Change this day
      </button>
    </div>
  );
}

// The app's own activity detail screen, full screen over the day.
export function ActivityScreen({ activity, city, dayNum, onClose }) {
  const detail = useMemo(
    () => buildActivityDetail(activity, { city, country: "Vietnam", isBooked: false, dayNum }),
    [activity, city, dayNum]
  );
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200, background: C.white, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `1px solid ${C.div}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <ArrowLeft size={18} color={HEAD} />
          </button>
        </div>
        <ActivityDetailScroll detail={detail} />
      </div>
    </div>
  );
}

// ─── The screen ───────────────────────────────────────────────────────────

function DayScreen({ day, shapeIdx }) {
  // One tour open by default, so a single-tour day needs no tapping at all.
  const [open, setOpen] = useState(() => {
    const first = day.tours.findIndex((t) => t.activities.length > 0);
    return day.tours.map((_, i) => i === (first === -1 ? 0 : first));
  });
  const [metric, setMetric] = useState(null);
  const [activity, setActivity] = useState(null);
  const [ratingOpen, setRatingOpen] = useState(false);

  const scoring = useMemo(() => getDayScoring(SCORING_DAYS[shapeIdx + 1], shapeIdx + 1, SCORING_DAYS), [shapeIdx]);
  const ratedTours = day.tours.filter((t) => t.activities.length);
  const rating = useMemo(() => {
    const keys = ratedTours.map((t) => t.name);
    return keys.length ? getDayRating(`day${shapeIdx}|${keys.join("~")}`, keys) : null;
  }, [shapeIdx, day]);
  // Same shape the itinerary screen passes to the sheet.
  const reviewItem = rating && {
    title: `Day ${day.dayNum} · ${day.city}`,
    subtitle: ratedTours.flatMap((t) => t.activities.map((a) => a.name)).join(", "),
    rating,
  };

  const total = day.tours.length;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#fff", position: "relative", overflow: "hidden" }}>
      <DayTopBar day={day} />
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        <DayHeader day={day} scoring={scoring} rating={rating} onMetric={setMetric} onRating={() => setRatingOpen(true)} />

        <div style={{ padding: "16px 20px 0" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: HEAD }}>Your day will cover:</h3>
        </div>

        <div style={{ padding: "12px 20px 4px" }}>
          {day.tours.map((t, i) => (
            <TourCard
              key={t.id}
              tour={t}
              index={i}
              total={total}
              open={open[i]}
              onToggle={() => setOpen((o) => o.map((v, j) => (j === i ? !v : v)))}
              onActivity={setActivity}
            />
          ))}
        </div>

        <div style={{ height: 6, background: "#F5F5F5" }} />
        <TravellerStories />
      </div>
      <ChangeDayCTA />

      {metric && (
        <DayScoreModal
          metric={metric}
          scoring={scoring}
          dayLabel={`Day ${day.dayNum} · ${day.city}`}
          onClose={() => setMetric(null)}
        />
      )}
      {activity && <ActivityScreen activity={activity} city={day.city} dayNum={day.dayNum} onClose={() => setActivity(null)} />}
      {ratingOpen && reviewItem && <TourReviewsSheet item={reviewItem} onClose={() => setRatingOpen(false)} />}
    </div>
  );
}

export default function DayDetailLab() {
  const navigate = useNavigate();
  const [si, setSi] = useState(1);
  const shape = SHAPES[si];

  const tabBtn = (on) => ({
    flex: 1, minWidth: 0, padding: "7px 4px", borderRadius: 8, border: "none",
    background: on ? "#fff" : "transparent", boxShadow: on ? "0 1px 4px rgba(16,24,40,0.12)" : "none",
    fontFamily: "inherit", fontSize: 11.5, fontWeight: on ? 700 : 500,
    color: on ? HEAD : "#8A90B2", cursor: "pointer", whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
      {/* Day-shape switcher, for checking the three cases. Not part of the design. */}
      <div style={{ flexShrink: 0, background: "#101828", padding: "8px 10px 9px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
          <button onClick={() => navigate(-1)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <ArrowLeft size={14} color="#fff" />
          </button>
          <p style={{ margin: 0, flex: 1, fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Day detail · final</p>
        </div>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 3 }}>
          {SHAPES.map((x, i) => (
            <button key={x.key} onClick={() => setSi(i)} style={tabBtn(si === i)}>{x.label}</button>
          ))}
        </div>
      </div>

      <DayScreen key={shape.key} day={shape} shapeIdx={si} />
    </div>
  );
}
