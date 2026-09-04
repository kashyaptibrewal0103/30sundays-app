import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Heart, Timer, Car, Users,
  Volume2, VolumeX, Play, Images, RefreshCw, ThumbsUp, Clock,
} from "lucide-react";
import { C } from "../data";
import { getDayScoring } from "../data/dayScoring";
import { DayScoreModal, DurationBody } from "../components/DayScoring";
import { getDayRating } from "../data/dayRatings";
import { RATING_META } from "../data/tourRatings";
import { DayRatingRow } from "../components/DayRating";
import {
  SHAPES, SCORING_DAYS, STORIES, TourCard, ActivityScreen,
} from "./DayDetailLab";

// DayDetailImmersive - day detail with a media hero, in two variants.
// Live at /day-media
//
// The District pattern from the reference videos:
//  - the media is a CARD in a horizontal deck. The next and previous day peek
//    in at the edges, and a swipe changes the day
//  - the details are a sheet that slides up over the media, and the media
//    comes back when you scroll down
//  - once the media is gone the screen is full width, and the bar carries the
//    day and the day title
//
// V1  one piece of media for the day, District's movie treatment
// V2  a collage that scrolls horizontally inside the card, District's
//     restaurant treatment. Scrolling past the last image hands the swipe to
//     the day deck, so one gesture does both.

const HEAD = "#181E4C";
const SUB = "#666C99";
const LINE = "#E0E2EB";
const SOFT = "#F0F1F5";
const PINK = "#FD014F";

// How tall the media runs, per variant.
//   video    portrait, the way a trailer fills a phone
//   collage  a band across the top, so the day's own detail starts on the
//            first screen and it reads as a normal screen with a header image
const MEDIA_SIZE = {
  video:   { ratio: 1.3, maxVh: 0.6 },
  collage: { ratio: 0.7, maxVh: 0.34 },
};
const PARALLAX = 0.42;    // how far the media travels per pixel scrolled
const SHEET_LIFT = 18;    // how far the sheet overlaps the media
const DECK_MPC = 0.045;   // card margin each side, 4.5% of the screen
const DECK_GAP = 8;       // gap between cards, so (margin - gap) of each neighbour shows
const CARD_R = 22;        // card corner radius at rest

const glass = {
  background: "rgba(16,18,32,0.42)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.18)",
};

function RoundBtn({ children, onClick, size = 34 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%", ...glass,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", flexShrink: 0, padding: 0,
    }}>{children}</button>
  );
}

// Day switcher: light on the media, plain once it is in the bar.
function DaySwitch({ day, onPrev, onNext, hasPrev, hasNext, onFrame = true, title }) {
  const arrow = (enabled) => ({
    width: 26, height: 26, borderRadius: "50%", border: "none",
    background: onFrame ? "rgba(255,255,255,0.18)" : SOFT,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: enabled ? "pointer" : "default", opacity: enabled ? 1 : 0.35, flexShrink: 0, padding: 0,
  });
  const ink = onFrame ? "#fff" : HEAD;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0, maxWidth: "100%",
      padding: onFrame ? "5px 8px" : 0, borderRadius: 999,
      ...(onFrame ? glass : {}),
    }}>
      <button onClick={onPrev} style={arrow(hasPrev)} aria-label="Previous day">
        <ChevronLeft size={15} color={ink} />
      </button>
      <span style={{ minWidth: 0, textAlign: "center" }}>
        <span style={{
          display: "block", fontSize: title ? 10.5 : 14, fontWeight: title ? 600 : 700,
          color: title ? SUB : ink, whiteSpace: "nowrap", lineHeight: 1.25,
        }}>
          Day {day.dayNum} · {day.city}
        </span>
        {title && (
          <span style={{
            display: "block", fontSize: 14, fontWeight: 700, color: ink, lineHeight: 1.25,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%",
          }}>{day.title}</span>
        )}
      </span>
      <button onClick={onNext} style={arrow(hasNext)} aria-label="Next day">
        <ChevronRight size={15} color={ink} />
      </button>
    </div>
  );
}

// Slow zoom, the stand-in for footage the Watch player already uses.
function MediaImage({ src, live = false }) {
  return (
    <img src={src} alt="" style={{
      width: "100%", height: "100%", objectFit: "cover", display: "block",
      animation: live ? "dayKenBurns 16s ease-in-out infinite alternate" : "none",
    }} />
  );
}

// ─── Media layers ─────────────────────────────────────────────────────────
// Inside a card the layers stack: media at the bottom, the scrolling sheet
// over it, then the media's own controls on top so they stay tappable.

function VideoMedia({ day }) {
  const v = day.media.video;
  return (
    <>
      <MediaImage src={v ? v.poster : day.media.images[0]} live={!!v} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 26%, transparent 60%, rgba(0,0,0,0.5) 100%)" }} />
    </>
  );
}

function CollageMedia({ day }) {
  const { video, images } = day.media;

  if (!video && images.length === 1) {
    return (
      <>
        <MediaImage src={images[0]} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, transparent 30%)" }} />
      </>
    );
  }

  const first = video ? { src: video.poster, live: true } : { src: images[0], live: false };
  const rest = video ? images : images.slice(1);
  const pairs = [];
  for (let i = 0; i < rest.length; i += 2) pairs.push(rest.slice(i, i + 2));

  return (
    <>
      <div
        data-media-scroll="1"
        className="hide-scrollbar"
        style={{
          position: "absolute", inset: 0, display: "flex", gap: 4,
          overflowX: "auto", overflowY: "hidden", touchAction: "pan-y",
        }}
      >
        <div style={{ position: "relative", width: "78%", minWidth: "78%", height: "100%", flexShrink: 0, background: SOFT }}>
          <MediaImage src={first.src} live={first.live} />
          {video && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, transparent 36%, transparent 64%, rgba(0,0,0,0.42) 100%)" }} />}
        </div>
        {pairs.map((pair, i) => (
          <div key={i} style={{ width: "52%", minWidth: "52%", flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            {pair.map((src, j) => (
              <div key={j} style={{ flex: 1, minHeight: 0, background: SOFT, overflow: "hidden" }}>
                <MediaImage src={src} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 78, background: "linear-gradient(180deg, rgba(0,0,0,0.5), transparent)", pointerEvents: "none" }} />
    </>
  );
}

// The controls that sit on the media. Their layer ignores pointer events so a
// drag over the photo still scrolls the sheet, but each control takes taps.
function MediaControls({ day, variant, muted, onMute, onGallery }) {
  const v = day.media.video;
  const count = day.media.images.length + (v ? 1 : 0);
  const showGallery = variant === "collage" && count > 1;
  return (
    <>
      {variant === "video" && v && (
        <>
          <div style={{ position: "absolute", left: 12, bottom: 26, pointerEvents: "auto" }}>
            <RoundBtn onClick={onMute} size={32}>
              {muted ? <VolumeX size={15} color="#fff" /> : <Volume2 size={15} color="#fff" />}
            </RoundBtn>
          </div>
          <button style={{
            position: "absolute", right: 12, bottom: 26, ...glass, borderRadius: 999,
            padding: "7px 12px 7px 10px", display: "inline-flex", alignItems: "center", gap: 6,
            cursor: "pointer", fontFamily: "inherit", pointerEvents: "auto",
          }}>
            <Play size={13} color="#fff" fill="#fff" />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Watch full video</span>
          </button>
        </>
      )}
      {variant === "collage" && v && (
        <div style={{ position: "absolute", left: 12, bottom: 26, ...glass, borderRadius: 999, padding: "4px 9px 4px 7px", display: "inline-flex", alignItems: "center", gap: 5 }}>
          <Play size={11} color="#fff" fill="#fff" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{v.duration}</span>
        </div>
      )}
      {showGallery && (
        <button onClick={() => onGallery("activity")} style={{
          position: "absolute", right: 12, bottom: 26, ...glass, borderRadius: 8,
          padding: "7px 11px", display: "inline-flex", alignItems: "center", gap: 6,
          cursor: "pointer", fontFamily: "inherit", pointerEvents: "auto",
        }}>
          <Images size={13} color="#fff" />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
            View gallery <span style={{ color: "rgba(255,255,255,0.6)" }}>· {count}</span>
          </span>
        </button>
      )}
    </>
  );
}

// ─── Gallery, opened from View gallery ────────────────────────────────────

function GalleryScreen({ day, photos = STORIES, initialTab = "activity", onClose }) {
  const [tab, setTab] = useState(initialTab);
  const activityMedia = useMemo(() => {
    const fromTours = day.tours.flatMap((t) => t.activities.map((a) => a.img));
    const { video, images } = day.media;
    return [...new Set([...(video ? [video.poster] : []), ...images, ...fromTours])].filter(Boolean);
  }, [day]);
  const customerMedia = useMemo(() => (photos.length ? photos : STORIES), [photos]);
  const items = tab === "activity" ? activityMedia : customerMedia;

  const tabBtn = (on) => ({
    flex: 1, padding: "8px 10px", borderRadius: 8, border: "none",
    background: on ? "#fff" : "transparent",
    boxShadow: on ? "0 1px 4px rgba(16,24,40,0.12)" : "none",
    fontFamily: "inherit", fontSize: 13, fontWeight: on ? 700 : 500,
    color: on ? HEAD : SUB, cursor: "pointer",
  });

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 240, background: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, padding: "12px 14px 10px", borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
          <ArrowLeft size={17} color={HEAD} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: HEAD }}>Day {day.dayNum} · {day.city}</p>
          <p style={{ margin: "1px 0 0", fontSize: 11.5, color: SUB }}>{items.length} photos and videos</p>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: 6, background: "#F4F5FA", borderRadius: 10, padding: 3 }}>
          <button onClick={() => setTab("activity")} style={tabBtn(tab === "activity")}>Activity media</button>
          <button onClick={() => setTab("customer")} style={tabBtn(tab === "customer")}>Customer media</button>
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "2px 14px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoFlow: "dense", gap: 4 }}>
          {items.map((src, i) => {
            // One big tile per three, alternating sides. Three columns means a
            // 2x2 tile plus two singles tile exactly, with no holes.
            const big = i % 3 === 0;
            const leftSide = Math.floor(i / 3) % 2 === 0;
            return (
              <div key={i} style={{
                gridColumn: big ? (leftSide ? "1 / span 2" : "2 / span 2") : "auto",
                gridRow: big ? "span 2" : "auto",
                // Both tile sizes need a ratio. Without one the big tile sized
                // itself off its image and grew taller than the two rows it
                // spans, leaving the singles beside it short of the row.
                aspectRatio: "1 / 1",
                borderRadius: 8, overflow: "hidden", background: SOFT,
              }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Pace and crowds ──────────────────────────────────────────────────────
// The app's card, shorter, with a chevron on every tile so the drill-ins read
// as tappable.

const TONE = [
  { bg: "#E7F8EE", fg: "#027A48" },
  { bg: "#FFF4E0", fg: "#B54708" },
  { bg: "#FEE4E2", fg: "#B42318" },
];
const shortH = (h) => (h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`);
const longH = (h) => `${h % 1 === 0 ? h : h.toFixed(1)} ${h === 1 ? "hour" : "hours"}`;

// The day duration sits beside the rating as a second chip: same shape, same
// job, both jump to their section further down.
function DurationChip({ hours, onTap }) {
  return (
    <button onClick={onTap} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 9px 6px 10px", borderRadius: 999,
      border: `1px solid ${LINE}`, background: "#fff",
      cursor: "pointer", fontFamily: "inherit",
    }}>
      <Clock size={13} color={SUB} />
      <span style={{ fontSize: 12.5, fontWeight: 600, color: HEAD, whiteSpace: "nowrap" }}>
        Day duration {longH(hours)}
      </span>
      <ChevronRight size={13} color="#A4A7AE" />
    </button>
  );
}

function PaceCard({ scoring, onOpen }) {
  // Pace and crowds are judgements with a breakdown behind them, so they are
  // tappable. Activity and travel time are just numbers, so they are not.
  const Tile = ({ icon: Icon, value, label, level, metric, fill }) => {
    const t = TONE[Math.min(2, level || 0)];
    const tappable = !!metric;
    const Wrap = tappable ? "button" : "div";
    return (
      <Wrap
        {...(tappable ? { onClick: () => onOpen(metric) } : {})}
        style={{
          flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8,
          padding: "11px 12px", background: "none", border: "none",
          cursor: tappable ? "pointer" : "default", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: t.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon size={13} color={t.fg} strokeWidth={2.2} fill={fill ? t.fg : "none"} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: HEAD, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
            {tappable && <ChevronRight size={12} color="#A4A7AE" style={{ flexShrink: 0 }} />}
          </span>
          <span style={{ display: "block", fontSize: 10, color: SUB, lineHeight: 1.3 }}>{label}</span>
        </span>
      </Wrap>
    );
  };
  const Div = () => <span style={{ width: 1, background: LINE, margin: "10px 0" }} />;
  return (
    <div>
      <p style={{ margin: "0 0 7px", fontSize: 10.5, fontWeight: 700, color: SUB, letterSpacing: 0.6, textTransform: "uppercase" }}>
        How this day feels
      </p>
      <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
        <div style={{ display: "flex" }}>
          <Tile icon={Heart} value={scoring.pace.label} label="Pace of the day" level={scoring.pace.level} metric="pace" fill />
          <Div />
          <Tile icon={Users} value={scoring.crowd.label} label="Crowd levels" level={scoring.crowd.level} metric="crowd" />
        </div>
        <div style={{ height: 1, background: LINE }} />
        <div style={{ display: "flex" }}>
          <Tile icon={Timer} value={shortH(scoring.activity.hours)} label="Activity time" level={scoring.activity.level} />
          <Div />
          <Tile icon={Car} value={shortH(scoring.travel.hours)} label="Travel time" level={scoring.travel.level} />
        </div>
      </div>
    </div>
  );
}

// Only the video variant carries this. The collage variant already puts
// customer photos behind View gallery.
function TravellerMoments({ onOpen, photos = STORIES }) {
  return (
    <div style={{ padding: "18px 0 0" }}>
      <div style={{ padding: "0 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: HEAD }}>Travellers' moments</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: SUB }}>Photos couples shared from this day</p>
        </div>
        <button onClick={onOpen} style={{
          flexShrink: 0, padding: 0, background: "none", border: "none", fontFamily: "inherit",
          fontSize: 13, fontWeight: 600, color: PINK, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 2,
        }}>
          See all
          <ChevronRight size={14} color={PINK} />
        </button>
      </div>
      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 20px 4px" }}>
        {(photos.length ? photos : STORIES).map((src, i) => (
          <button key={i} onClick={onOpen} style={{
            width: 108, minWidth: 108, height: 138, flexShrink: 0, padding: 0,
            border: "none", borderRadius: 12, overflow: "hidden", background: SOFT,
            cursor: "pointer",
          }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Customer reviews, at the foot of the day ─────────────────────────────
// What the ratings sheet showed, minus the day's own name, the filters, the
// sort and the review count. Each review says which tour it was left against.

// "Not for me" is red here, not the neutral grey it wears elsewhere. On a
// summary of one day the three verdicts are being compared, and a grey bar
// next to a green one reads as "no opinion" rather than "did not enjoy it".
const NOT_RED = "#D92D20";

// Reviews are stored under both partners' names. One is enough on a card this
// size, and the second name never told the reader anything.
const oneName = (name) => (name || "").split(/\s*&\s*/)[0].trim() || name;
const barColor = (key) => (key === "not" ? NOT_RED : RATING_META[key].color);

function CustomerReviews({ rating, tours }) {
  const bars = [
    { key: "loved", pct: rating.lovedPct },
    { key: "liked", pct: rating.likedPct },
    { key: "not", pct: rating.notPct },
  ];
  const named = tours.length ? tours : [{ name: "This day" }];
  return (
    <div style={{ padding: "18px 20px 0" }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 500, color: HEAD }}>What travellers said</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <ThumbsUp size={20} color={rating.color} fill={rating.color} strokeWidth={0} />
        <span style={{ fontSize: 26, fontWeight: 800, color: HEAD, lineHeight: 1 }}>{rating.enjoyedPct}%</span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: HEAD }}>enjoyed it</span>
        <span style={{ fontSize: 12.5, color: SUB }}>{rating.count} ratings</span>
      </div>

      {/* Percentages only. The head count per verdict said nothing the total
          above does not already say, and three numbers competed with it. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
        {bars.map((b) => (
          <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 74, flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: barColor(b.key) }}>
              {RATING_META[b.key].label}
            </span>
            <span style={{ flex: 1, height: 7, borderRadius: 99, background: "#F0F1F5", overflow: "hidden" }}>
              <span style={{ display: "block", width: `${b.pct}%`, height: "100%", background: barColor(b.key) }} />
            </span>
            <span style={{ width: 40, textAlign: "right", flexShrink: 0, fontSize: 12.5, fontWeight: 600, color: HEAD, fontVariantNumeric: "tabular-nums" }}>
              {b.pct}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ margin: "16px 0 4px", background: "#F7F8FC", borderRadius: 10, padding: "12px 14px" }}>
        <p style={{ margin: "0 0 4px", fontSize: 10.5, fontWeight: 700, color: SUB, letterSpacing: 0.5, textTransform: "uppercase" }}>In short</p>
        <p style={{ margin: 0, fontSize: 13.5, color: HEAD, lineHeight: "21px" }}>{rating.summary}</p>
      </div>

      <div>
        {rating.reviews.map((r, i) => {
          const meta = RATING_META[r.rating];
          const ink = r.rating === "not" ? NOT_RED : meta.color;
          const tour = named[i % named.length];
          return (
            <div key={i} style={{ padding: "14px 0", borderTop: `1px solid ${LINE}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: HEAD }}>{oneName(r.name)}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: ink, background: `${ink}1A`, borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" }}>
                  {meta.label}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 11.5, color: "#A4A7AE", whiteSpace: "nowrap" }}>{r.when}</span>
              </div>
              {r.text && <p style={{ margin: "6px 0 0", fontSize: 13.5, color: SUB, lineHeight: "21px" }}>{r.text}</p>}
              {/* Named after the comment, not before it: the comment is what
                  the reader came for. Kept as its own labelled block so it
                  cannot be read as another line of the review. */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "100%",
                background: SOFT, borderRadius: 6, padding: "4px 9px", marginTop: 9,
              }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: "#8A90B2", letterSpacing: 0.5, textTransform: "uppercase", flexShrink: 0 }}>Tour name</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: HEAD, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tour.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// A nominal week-long trip// A nominal week-long trip, so the bar can say where this day sits in it.


// District's bottom bar: a floating dark pill with the context on the left and
// the action as a white pill on the right.
function DayActionBar({ day, tripDays, onChangeDay, ctaLabel = "Change this day", ctaNote }) {
  const shortDate = (day.date || "").replace(/,? \d{4}$/, "");
  return (
    <div style={{ padding: "0 16px calc(18px + env(safe-area-inset-bottom))" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: HEAD, borderRadius: 999, padding: "8px 8px 8px 20px",
        boxShadow: "0 12px 30px -10px rgba(16,24,40,0.55)",
      }}>
        {/* Without travel dates there is only the day number to show, so it
            takes the strong line rather than sitting above an empty one. */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {shortDate ? (
            <>
              <p style={{ margin: 0, fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>
                Day {day.dayNum}{tripDays ? ` of ${tripDays}` : ""}
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {shortDate}
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Day {day.dayNum}{tripDays ? ` of ${tripDays}` : ""}
            </p>
          )}
          {/* On a plan you are choosing, the price difference matters more than
              the date, so it takes the strong line instead. */}
          {ctaNote && (
            <p style={{ margin: "1px 0 0", fontSize: 12.5, fontWeight: 700, color: ctaNote.up ? "#FFB4AB" : "#9BE8B8", lineHeight: 1.3, whiteSpace: "nowrap" }}>
              {ctaNote.text}
            </p>
          )}
        </div>
        <button onClick={onChangeDay || undefined} style={{
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 7,
          background: "#fff", border: "none", borderRadius: 999, padding: "12px 16px",
          fontSize: 14, fontWeight: 700, color: HEAD,
          cursor: onChangeDay ? "pointer" : "default", opacity: onChangeDay ? 1 : 0.55,
          fontFamily: "inherit",
        }}>
          <RefreshCw size={14} color={HEAD} />
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

// ─── One day card: media, the sheet over it, and the day's own CTA ─────────

function DayCard({
  day, shapeIdx, scoring, rating, photos, tripDays, width, restWidth, radius, mediaH,
  variant, showMoments, active, muted, onMute, onGallery, onProgress,
  onPrev, onNext, hasPrev, hasNext, p, onClose, onChangeDay, onActivityOpen, jumpTo,
  ctaLabel, ctaNote,
}) {
  const [metric, setMetric] = useState(null);
  const [activity, setActivity] = useState(null);
  const scroller = useRef(null);
  const reviews = useRef(null);
  const duration = useRef(null);
  const [open, setOpen] = useState(() => {
    if (!day.tours.length) return [];
    const first = day.tours.findIndex((t) => t.activities.length > 0);
    return day.tours.map((_, i) => i === (first === -1 ? 0 : first));
  });

  const ratedTours = day.tours.filter((t) => t.activities.length);
  const scrollTo = (ref) => {
    const box = scroller.current, el = ref.current;
    if (!box || !el) return;
    const top = box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - 8;
    const from = box.scrollTop;
    box.scrollTo({ top, behavior: "smooth" });
    // Some browsers have the smooth animation switched off.
    setTimeout(() => { if (Math.abs(box.scrollTop - from) < 2) box.scrollTop = top; }, 140);
  };
  const toReviews = () => scrollTo(reviews);
  const toDuration = () => scrollTo(duration);

  // Opened from the rating chip on the itinerary, so the day lands on the
  // reviews rather than making the reader scroll the whole sheet to find them.
  const jumped = useRef(false);
  useEffect(() => {
    if (!active || jumped.current || jumpTo !== "reviews" || !reviews.current) return;
    jumped.current = true;
    const box = scroller.current;
    const el = reviews.current;
    if (!box) return;
    const run = () => {
      const top = box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - 8;
      box.scrollTop = top;
    };
    // Two frames: the sheet's spacer depends on the measured media height.
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [active, jumpTo]);

  const onScroll = useCallback((e) => {
    onProgress(shapeIdx, Math.max(0, Math.min(1, e.currentTarget.scrollTop / mediaH)));
  }, [shapeIdx, onProgress]);

  const compact = p > 0.6;
  const mediaY = -p * mediaH * PARALLAX;
  const mediaFade = 1 - Math.max(0, (p - 0.55) / 0.45);
  const chromeFade = 1 - Math.max(0, (p - 0.28) / 0.3);

  return (
    <div style={{
      width, minWidth: width, height: "100%", flexShrink: 0,
      position: "relative", overflow: "hidden",
      borderRadius: radius, background: "#15172A",
    }}>
      {/* 1 · media */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: mediaH, zIndex: 1,
        transform: `translateY(${mediaY}px)`, opacity: mediaFade,
      }}>
        {variant === "video" ? <VideoMedia day={day} /> : <CollageMedia day={day} />}
      </div>

      {/* 2 · the sheet of details, scrolling over the media */}
      <div ref={scroller} className="hide-scrollbar" onScroll={onScroll} style={{ position: "absolute", inset: 0, overflowY: "auto", zIndex: 2 }}>
        <div style={{ height: mediaH - SHEET_LIFT }} />
        <div style={{ position: "relative", background: "#fff", borderRadius: "20px 20px 0 0", minHeight: "100%" }}>
          <div style={{ display: "flex", justifyContent: "center", padding: "9px 0 2px" }}>
            <span style={{ width: 38, height: 4, borderRadius: 99, background: "#D5D7DA" }} />
          </div>

          <div style={{ padding: "6px 20px 0" }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: HEAD, lineHeight: 1.25 }}>{day.title}</h2>
            {day.date && <p style={{ margin: "3px 0 0", fontSize: 12.5, color: SUB }}>{day.date}</p>}
          </div>

          {/* A free day has neither a rating nor a duration, so the chip row
              goes rather than leaving a gap under the title. */}
          {(rating || scoring) && (
            <div style={{ padding: "12px 20px 0", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {rating && <DayRatingRow rating={rating} onOpen={toReviews} />}
              {scoring && <DurationChip hours={scoring.duration.totalHrs} onTap={toDuration} />}
            </div>
          )}

          {scoring && (
            <div style={{ padding: "14px 16px 0" }}>
              <PaceCard scoring={scoring} onOpen={setMetric} />
            </div>
          )}

          {day.tours.length > 0 ? (
            <>
              <div style={{ padding: "18px 20px 0" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: HEAD }}>Your day will cover:</h3>
              </div>
              <div style={{ padding: "12px 20px 4px" }}>
                {day.tours.map((t, i) => (
                  <TourCard
                    key={t.id}
                    tour={t}
                    index={i}
                    total={day.tours.length}
                    open={open[i]}
                    onToggle={() => setOpen((o) => o.map((v, j) => (j === i ? !v : v)))}
                    onActivity={onActivityOpen || setActivity}
                  />
                ))}
              </div>
            </>
          ) : day.freeNote ? (
            <div style={{ padding: "16px 20px 4px" }}>
              <p style={{ margin: 0, fontSize: 13.5, color: SUB, lineHeight: "21px" }}>{day.freeNote}</p>
            </div>
          ) : null}

          {scoring && (
            <>
              <div style={{ height: 6, background: "#F5F5F5", marginTop: 18 }} />
              <div ref={duration} style={{ padding: "18px 20px 0" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 500, color: HEAD }}>Day duration</h3>
                <DurationBody
                  data={scoring.duration}
                  scoring={scoring}
                  dayLabel={`Day ${day.dayNum} · ${day.city}`}
                />
              </div>
            </>
          )}

          {showMoments && (
            <>
              <div style={{ height: 6, background: "#F5F5F5", marginTop: 18 }} />
              <TravellerMoments onOpen={() => onGallery("customer")} photos={photos} />
            </>
          )}

          <div style={{ height: 6, background: "#F5F5F5", marginTop: 18 }} />
          <div ref={reviews}>
            {rating && <CustomerReviews rating={rating} tours={ratedTours} />}
          </div>
          <div style={{ height: 104 }} />
        </div>
      </div>

      {/* 3 · media controls: above the sheet so they take taps, but clipped by
             the sheet's rising edge so they disappear under it, not over it */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 3,
        height: Math.max(0, mediaH - SHEET_LIFT - p * mediaH),
        overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: mediaH,
          transform: `translateY(${mediaY}px)`, opacity: mediaFade,
        }}>
          <MediaControls day={day} variant={variant} muted={muted} onMute={onMute} onGallery={onGallery} />
        </div>
      </div>

      {/* 4 · back and the day switcher, on the media */}
      {!compact && (
        <div style={{
          position: "absolute", top: 14, left: 12, right: 12, zIndex: 4,
          display: "flex", alignItems: "center", gap: 8,
          opacity: chromeFade, pointerEvents: p > 0.5 ? "none" : "auto",
        }}>
          <RoundBtn onClick={onClose}><ArrowLeft size={17} color="#fff" /></RoundBtn>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
            <DaySwitch day={day} onPrev={onPrev} onNext={onNext} hasPrev={hasPrev} hasNext={hasNext} />
          </div>
          <div style={{ width: 34, flexShrink: 0 }} />
        </div>
      )}

      {/* 5 · the bar once the media has gone, with the day and its title */}
      {compact && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 5,
          background: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${LINE}`, padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${LINE}`, background: "#fff", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <ArrowLeft size={17} color={HEAD} />
          </button>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
            <DaySwitch day={day} title onPrev={onPrev} onNext={onNext} hasPrev={hasPrev} hasNext={hasNext} onFrame={false} />
          </div>
          <div style={{ width: 32, flexShrink: 0 }} />
        </div>
      )}

      {/* 6 · the day's action bar, part of the card the way District's is */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 6 }}>
        <DayActionBar day={day} tripDays={tripDays} onChangeDay={onChangeDay} ctaLabel={ctaLabel} ctaNote={ctaNote} />
      </div>

      {active && metric && scoring && (
        <DayScoreModal metric={metric} scoring={scoring} dayLabel={`Day ${day.dayNum} · ${day.city}`} onClose={() => setMetric(null)} />
      )}
      {active && activity && (
        <ActivityScreen activity={activity} city={day.city} dayNum={day.dayNum} onClose={() => setActivity(null)} />
      )}
    </div>
  );
}

// ─── The deck ─────────────────────────────────────────────────────────────

function DayPager({
  days, idx, setIdx, variant, card, moments, onGallery,
  scoringFor, ratingFor, photos, tripDays, onClose, onChangeDay, onActivityOpen, jumpTo,
  ctaLabel, ctaNote,
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [prog, setProg] = useState(() => days.map(() => 0));
  const [muted, setMuted] = useState(true);
  const [W, setW] = useState(390);
  const [H, setH] = useState(760);

  const box = useRef(null);
  const start = useRef(null);
  const last = useRef(0);
  const axis = useRef(null);
  const inner = useRef(null);       // the collage scroller a drag started on
  const offset = useRef(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      setW(r.width);
      setH(r.height);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const M = card ? Math.round(W * DECK_MPC) : 0;
  const gap = card ? DECK_GAP : 0;
  const restW = Math.max(160, W - M * 2);
  const step = restW + gap;
  const size = MEDIA_SIZE[variant] || MEDIA_SIZE.video;
  const mediaH = Math.min(Math.round(restW * size.ratio), Math.round(H * size.maxVh));
  const p = prog[idx];
  // The active card grows to the full screen as the sheet takes over.
  const grow = card ? Math.min(1, p * 3) : 0;

  const go = (i) => setIdx(Math.max(0, Math.min(days.length - 1, i)));
  const setOffset = (v) => { offset.current = v; setDx(v); };
  const onProgress = useCallback((i, v) => {
    setProg((a) => (Math.abs(a[i] - v) > 0.01 ? a.map((x, j) => (j === i ? v : x)) : a));
  }, []);

  const down = (e) => {
    start.current = { x: e.clientX, y: e.clientY };
    last.current = e.clientX;
    axis.current = null;
    // A drag that begins on the media browses the images first. Look the
    // scroller up by index, since the press may land on the sheet layer above.
    const r = box.current.getBoundingClientRect();
    const onMedia = e.clientY - r.top < mediaH - SHEET_LIFT && p < 0.4;
    inner.current = onMedia ? box.current.querySelectorAll("[data-media-scroll]")[idx] || null : null;
  };

  const move = (e) => {
    if (!start.current) return;
    const ddx = e.clientX - start.current.x;
    const ddy = e.clientY - start.current.y;
    const delta = e.clientX - last.current;
    last.current = e.clientX;

    if (!axis.current) {
      if (Math.abs(ddx) < 8 && Math.abs(ddy) < 8) return;
      axis.current = Math.abs(ddx) > Math.abs(ddy) ? "x" : "y";
      if (axis.current === "x" && !inner.current) setDragging(true);
    }
    if (axis.current !== "x") return;

    const el = inner.current;
    if (el) {
      const max = el.scrollWidth - el.clientWidth - 1;
      const canGo = delta < 0 ? el.scrollLeft < max : el.scrollLeft > 1;
      if (canGo) {
        el.scrollLeft -= delta;
        return;
      }
      inner.current = null;
      start.current = { x: e.clientX, y: e.clientY };   // the day drag starts here
      setDragging(true);
      return;
    }

    const atEnd = (ddx > 0 && idx === 0) || (ddx < 0 && idx === days.length - 1);
    setOffset(atEnd ? ddx * 0.28 : ddx);
  };

  const up = () => {
    if (axis.current === "x" && !inner.current) {
      const threshold = Math.max(52, W * 0.16);
      if (offset.current <= -threshold) go(idx + 1);
      else if (offset.current >= threshold) go(idx - 1);
    }
    start.current = null;
    axis.current = null;
    inner.current = null;
    setDragging(false);
    setOffset(0);
  };

  const ease = "transform 0.3s cubic-bezier(0.22,0.61,0.36,1)";
  // Shift by whole cards, and by the margin again once the active card has
  // grown, so its left edge lands on the screen edge.
  const deckX = -idx * step - M * grow + dx;

  return (
    <div
      ref={box}
      style={{
        flex: 1, minHeight: 0, position: "relative", overflow: "hidden",
        background: "#0E1020", touchAction: "pan-y",
        padding: card ? "10px 0 12px" : 0, boxSizing: "border-box",
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerLeave={() => start.current && up()}
    >
      <div style={{
        display: "flex", gap, height: "100%", paddingLeft: M,
        transform: `translate3d(${deckX}px, 0, 0)`,
        transition: dragging ? "none" : ease,
      }}>
        {days.map((d, i) => (
          <DayCard
            key={d.key ?? i}
            day={d}
            shapeIdx={i}
            scoring={scoringFor(d, i)}
            rating={ratingFor(d, i)}
            photos={photos}
            tripDays={tripDays}
            onClose={onClose}
            onChangeDay={onChangeDay}
            onActivityOpen={onActivityOpen}
            jumpTo={i === idx ? jumpTo : null}
            ctaLabel={ctaLabel}
            ctaNote={ctaNote}
            width={i === idx ? restW + M * 2 * grow : restW}
            restWidth={restW}
            radius={card ? (i === idx ? CARD_R * (1 - grow) : CARD_R) : 0}
            mediaH={mediaH}
            variant={variant}
            showMoments={moments}
            active={i === idx}
            p={i === idx ? p : 0}
            muted={muted}
            onMute={() => setMuted(!muted)}
            onGallery={(tab) => onGallery({ day: d, tab: tab || "activity" })}
            onProgress={onProgress}
            onPrev={() => go(i - 1)}
            onNext={() => go(i + 1)}
            hasPrev={i > 0}
            hasNext={i < days.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── The screen, for real itinerary data ──────────────────────────────────

/**
 * The V1 day detail: a media hero in a card deck, with the day's details on a
 * sheet that rises over it. Swipe or use the arrows to change day.
 *
 * Takes days already in the shape this screen needs. Real itinerary days are
 * mapped into it by toMediaDays in src/data/dayMediaShape.js.
 */
export function DayMediaDetail({
  days, index, setIndex, variant = "video", card = true, moments = true,
  scoringFor, ratingFor, photos = [], tripDays, onClose, onChangeDay, onActivityOpen, jumpTo,
  ctaLabel, ctaNote,
}) {
  const [gallery, setGallery] = useState(null);
  if (!days?.length) return null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0E1020", position: "relative", overflow: "hidden" }}>
      <style>{`@keyframes dayKenBurns { from { transform: scale(1) translate(0,0); } to { transform: scale(1.09) translate(-1.5%, -1%); } }`}</style>
      <DayPager
        days={days}
        idx={index}
        setIdx={setIndex}
        variant={variant}
        card={card}
        moments={moments}
        scoringFor={scoringFor}
        ratingFor={ratingFor}
        photos={photos}
        tripDays={tripDays}
        onClose={onClose}
        onChangeDay={onChangeDay}
        onActivityOpen={onActivityOpen}
        jumpTo={jumpTo}
        ctaLabel={ctaLabel}
        ctaNote={ctaNote}
        onGallery={setGallery}
      />
      {gallery && (
        <GalleryScreen day={gallery.day} photos={photos} initialTab={gallery.tab} onClose={() => setGallery(null)} />
      )}
    </div>
  );
}

// ─── Lab shell ────────────────────────────────────────────────────────────

const VARIANTS = [
  // V1 is a card deck. V2 runs full screen, where the collage has the whole
  // width to scroll across.
  { key: "video", label: "V1 Day video", card: true, moments: true },
  { key: "collage", label: "V2 Media collage", card: false, moments: true },
];

// The lab's own scoring and ratings, off the sample week in DayDetailLab.
const labScoring = (_day, i) => getDayScoring(SCORING_DAYS[i + 1], i + 1, SCORING_DAYS);
const labRating = (day, i) => {
  const keys = day.tours.filter((t) => t.activities.length).map((t) => t.name);
  return keys.length ? getDayRating(`day${i}|${keys.join("~")}`, keys) : null;
};

// /day-media          the lab, with the variant switcher on top
// /day-media/v1        the day-video variant on its own, no lab chrome
// /day-media/v2        the media-collage variant on its own
const ROUTE_VARIANT = { v1: 0, v2: 1 };

export default function DayDetailImmersive() {
  const navigate = useNavigate();
  const params = useParams();
  const pinned = ROUTE_VARIANT[params.variant];
  const [v, setV] = useState(pinned ?? 0);
  const [idx, setIdx] = useState(0);

  const tabBtn = (on) => ({
    flex: 1, minWidth: 0, padding: "7px 4px", borderRadius: 8, border: "none",
    background: on ? "#fff" : "transparent", boxShadow: on ? "0 1px 4px rgba(16,24,40,0.12)" : "none",
    fontFamily: "inherit", fontSize: 11.5, fontWeight: on ? 700 : 500,
    color: on ? HEAD : "#8A90B2", cursor: "pointer", whiteSpace: "nowrap",
    overflow: "hidden", textOverflow: "ellipsis",
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0E1020", position: "relative", overflow: "hidden" }}>
      {/* Lab chrome. A pinned route is the screen on its own, for sharing. */}
      {pinned === undefined && (
        <div style={{ flexShrink: 0, background: "#101828", padding: "8px 10px 9px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <button onClick={() => navigate(-1)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(255,255,255,0.14)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
              <ArrowLeft size={14} color="#fff" />
            </button>
            <p style={{ margin: 0, flex: 1, fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>Day detail · media hero</p>
            <p style={{ margin: 0, fontSize: 10.5, color: "rgba(255,255,255,0.45)" }}>swipe to change day</p>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 3 }}>
            {VARIANTS.map((x, i) => (
              <button key={x.key} onClick={() => setV(i)} style={tabBtn(v === i)}>{x.label}</button>
            ))}
          </div>
        </div>
      )}

      <DayMediaDetail
        key={VARIANTS[v].key}
        days={SHAPES}
        index={idx}
        setIndex={setIdx}
        variant={VARIANTS[v].key}
        card={VARIANTS[v].card}
        moments={VARIANTS[v].moments}
        scoringFor={labScoring}
        ratingFor={labRating}
        tripDays={7}
        onClose={() => navigate(-1)}
        // The lab has no swap sheet to open, but the CTA is part of what is
        // being reviewed here, so it renders live rather than dimmed.
        onChangeDay={() => {}}
      />
    </div>
  );
}
