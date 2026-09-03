import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, ArrowLeftRight, Play, Layers,
  TriangleAlert, Heart, Zap, Gauge, Flame, Moon,
} from "lucide-react";
import { C, destData } from "../data";
import { getDayScoring, getDayTours, SCORE_PALETTE, LEVEL_KEYS } from "../data/dayScoring";
import { getDayRating, tourKeysForDay } from "../data/dayRatings";
import { DayRatingPill } from "../components/DayRating";
import { videosForDest } from "../data/watchData";

// ─── Itinerary at a glance: five ways to build the day card ───
//
// Every option carries the same set of parts, so they can be compared on
// placement and weight rather than on content:
//   media (video, video count, or an image when there is no video)
//   day number, city, and the route arrow on city-change days
//   the day's tour names, one line each
//   a pace chip
//   a heads-up note, on some days only
//   change day plan, on some days only
//   the day rating, and a tap target for day details
//
// All days show upfront. No "Read more".

const IMG = destData.Bali.actImgs;

// Sample week shaped like a real day object, so the live scoring, tour and
// rating helpers all work on it unchanged. Content is deliberately varied so
// each card state shows up once: no video, one video, many videos, a leisure
// day, two city changes, and a departure.
const A = (name, img) => ({ name, img });
const LAB_DAYS = [
  { dayNum: 1, city: "Ubud", leisure: true, activities: [] },
  { dayNum: 2, city: "Ubud", activities: [
    A("Tegallalang Rice Terrace", IMG[2]), A("Bali Swing at sunrise", IMG[0]), A("Tirta Empul Temple", IMG[4]),
  ] },
  { dayNum: 3, city: "Ubud", activities: [
    A("Sacred Monkey Forest", IMG[1]), A("Ubud Art Market", IMG[0]),
  ] },
  { dayNum: 4, city: "Kintamani", activities: [
    A("Mount Batur sunrise trek", IMG[4]), A("Toya Devasya hot springs", IMG[3]), A("Coffee plantation tasting", IMG[2]),
  ] },
  { dayNum: 5, city: "Seminyak", activities: [
    A("Tanah Lot temple sunset", IMG[4]), A("Seminyak beach club", IMG[5]),
  ] },
  { dayNum: 6, city: "Seminyak", activities: [
    A("Seminyak beach morning", IMG[5]), A("Couples spa", IMG[1]),
  ] },
  { dayNum: 7, city: "Seminyak", departure: true, activities: [] },
];

// How many videos each day has. 0 falls back to an image, 1 shows no count.
const VIDEO_PLAN = [1, 5, 2, 4, 0, 6, 0];

// Which days can be swapped. In the app this comes from the day options data.
const CHANGEABLE = new Set([2, 3, 4, 5]);

// Heads-up notes. In the app these would ride on the activity or the hotel,
// not on the day. Only some days have one.
const NOTES = {
  1: "Your villa backs onto the rice fields. Insects pick up after sunset, so pack repellent.",
  3: "Monkeys at the forest grab phones and sunglasses. Zip your bag before you walk in.",
  4: "2 am pickup for the trek and it is cold at the summit. Take a jacket and closed shoes.",
  5: "Tanah Lot needs shoulders and knees covered. Sarongs are handed out at the gate.",
};

const PACE_ICON = { Relaxed: Moon, Balanced: Heart, Active: Zap, "Fast-paced": Flame };

// ─── Per-day derived data, shared by all five options ───
function useDayInfo() {
  return LAB_DAYS.map((day, i) => {
    const scoring = getDayScoring(day, i, LAB_DAYS);
    const tours = getDayTours(day, i, LAB_DAYS);
    const keys = tourKeysForDay(tours);
    const rating = keys.length ? getDayRating(`glance${i}|${keys.join("~")}`, keys) : null;

    const pool = videosForDest("Bali");
    const nVid = VIDEO_PLAN[i];
    const videos = Array.from({ length: nVid }, (_, k) => pool[(i * 3 + k) % pool.length]);
    const poster = videos[0]?.poster || day.activities[0]?.img || IMG[i % IMG.length];

    const prev = i > 0 ? LAB_DAYS[i - 1].city : null;
    const moved = prev && prev !== day.city;

    // Tour names, one line each. A transfer-only day shows the transfer instead.
    const lines = tours
      .map((t) => t.items.filter((x) => x.actIdx != null).map((x) => x.name).join(", "))
      .filter(Boolean);
    if (!lines.length) {
      lines.push(day.departure ? "Checkout, then airport transfer" : moved ? `Transfer to ${day.city}` : "Airport transfer, then the day is yours");
    }

    return {
      day, i, scoring, tours, rating, videos, poster, moved, lines,
      pace: scoring.pace.label,
      paceColor: SCORE_PALETTE[LEVEL_KEYS[scoring.pace.level]],
      note: NOTES[day.dayNum] || null,
      canChange: CHANGEABLE.has(day.dayNum),
    };
  });
}

// ─── Small shared parts ───

// "5 videos" when there is more than one, a plain play cue for a single video,
// and a photo cue when the day has no video at all.
function MediaBadge({ videos, dark = true }) {
  const n = videos.length;
  if (n < 2) return null;
  const col = dark ? "#fff" : C.head;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 6,
      background: dark ? "rgba(12,16,40,0.78)" : "rgba(255,255,255,0.94)",
      backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
    }}>
      <Layers size={11} color={col} />
      <span style={{ fontSize: 10.5, fontWeight: 700, color: col, letterSpacing: 0.3 }}>{n} videos</span>
    </div>
  );
}

function PlayDisc({ size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
    }}>
      <Play size={size * 0.4} color={C.head} fill={C.head} style={{ marginLeft: 2 }} />
    </div>
  );
}

function PaceChip({ pace, colors, variant = "outline" }) {
  const Icon = PACE_ICON[pace] || Gauge;
  const base = {
    display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
    padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.1,
  };
  if (variant === "overlay") {
    return (
      <div style={{ ...base, background: "rgba(255,255,255,0.94)", color: colors.text, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
        <Icon size={11} color={colors.icon} fill={colors.icon} strokeWidth={0} />
        {pace}
      </div>
    );
  }
  if (variant === "soft") {
    return (
      <div style={{ ...base, background: colors.bg, color: colors.text }}>
        <Icon size={11} color={colors.icon} fill={colors.icon} strokeWidth={0} />
        {pace}
      </div>
    );
  }
  if (variant === "dot") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: C.sub }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors.icon }} />
        {pace}
      </span>
    );
  }
  return (
    <div style={{ ...base, background: C.white, border: `1px solid ${colors.icon}44`, color: colors.text }}>
      <Icon size={11} color={colors.icon} fill={colors.icon} strokeWidth={0} />
      {pace}
    </div>
  );
}

// One treatment for every note, whatever it says. Splitting them into warning
// and good-to-know colours made the list look patchy, and the reader has to
// learn what each colour means before it helps them.
const NOTE = { bg: "#FFF8EA", border: "#FBE3B2", icon: "#B45309", text: "#8A5A00" };

// Full-bleed band at the foot of the card. No inset, so it sits flush against
// the poster and the card edges instead of floating inside its own margin.
function NoteBand({ note }) {
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-start",
      padding: "9px 12px", background: NOTE.bg, borderTop: `1px solid ${NOTE.border}`,
    }}>
      <TriangleAlert size={13} color={NOTE.icon} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 11.5, color: NOTE.text, lineHeight: "16px", fontWeight: 500 }}>{note}</span>
    </div>
  );
}

// Tinted strip, inset to line up with the text around it.
function NoteStrip({ note }) {
  return (
    <div style={{
      display: "flex", gap: 7, alignItems: "flex-start",
      background: NOTE.bg, border: `1px solid ${NOTE.border}`, borderRadius: 9,
      padding: "7px 9px",
    }}>
      <TriangleAlert size={13} color={NOTE.icon} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 11.5, color: NOTE.text, lineHeight: "16px", fontWeight: 500 }}>{note}</span>
    </div>
  );
}

// One quiet line, no background.
function NoteLine({ note }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
      <TriangleAlert size={12} color={NOTE.icon} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 11.5, color: C.sub, lineHeight: "16px" }}>{note}</span>
    </div>
  );
}

// Callout with a coloured left edge.
function NoteQuote({ note }) {
  return (
    <div style={{ borderLeft: `3px solid ${NOTE.icon}`, paddingLeft: 9, margin: "2px 0" }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: NOTE.icon, letterSpacing: 0.4, textTransform: "uppercase", margin: "0 0 2px" }}>
        Heads up
      </p>
      <p style={{ fontSize: 11.5, color: C.head, lineHeight: "16px", margin: 0 }}>{note}</p>
    </div>
  );
}

function TourLines({ lines, color = C.sub, size = 12 }) {
  return (
    <div>
      {lines.map((l, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginTop: i === 0 ? 0 : 3 }}>
          <span style={{ flexShrink: 0, color: color === C.sub ? C.inact : "rgba(255,255,255,0.6)", fontSize: size, lineHeight: `${size + 6}px` }}>&bull;</span>
          <span style={{ minWidth: 0, fontSize: size, color, lineHeight: `${size + 6}px`, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function ChangeLink({ onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: 0,
        background: "none", border: "none", fontSize: 12, fontWeight: 600,
        color: C.p600, cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <ArrowLeftRight size={13} color={C.p600} />
      Change day plan
    </button>
  );
}

function ChangePill({ onClick, overlay = false }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "6px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
        fontSize: 11.5, fontWeight: 700,
        background: overlay ? "rgba(255,255,255,0.95)" : C.white,
        border: overlay ? "none" : `1px solid ${C.div}`,
        color: C.p600,
        backdropFilter: overlay ? "blur(6px)" : undefined,
        WebkitBackdropFilter: overlay ? "blur(6px)" : undefined,
      }}
    >
      <ArrowLeftRight size={12} color={C.p600} />
      Change day
    </button>
  );
}

// Day + city, with the route arrow on city-change days.
function DayHead({ info, light = false, size = 11 }) {
  const c = light ? "rgba(255,255,255,0.9)" : C.sub;
  return (
    <span style={{
      fontSize: size, fontWeight: 700, color: c, letterSpacing: 0.4, textTransform: "uppercase",
      display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0,
    }}>
      <span style={{ flexShrink: 0 }}>Day {info.day.dayNum}</span>
      <span style={{ opacity: 0.45, flexShrink: 0 }}>&middot;</span>
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{info.day.city}</span>
    </span>
  );
}

const cardBase = {
  cursor: "pointer", borderRadius: 14, border: `1px solid ${C.div}`,
  background: C.white, boxShadow: "0 1px 4px rgba(24,30,76,0.04)", overflow: "hidden",
};

// ═══ Option A · Poster left ═══
// The poster stretches to the height of the row beside it, so the note is kept
// out of that row and runs full width underneath. Otherwise a day with a note
// gets a poster twice as tall as a day without one, and the crops stop matching.
function CardA({ info, onOpen, onChange }) {
  return (
    <div onClick={onOpen} style={{ ...cardBase }}>
      <div style={{ display: "flex", alignItems: "stretch", minHeight: 116 }}>
        <div style={{ position: "relative", width: 116, minWidth: 116, background: C.div }}>
          <img src={info.poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          {info.videos.length > 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlayDisc size={30} />
            </div>
          )}
          <div style={{ position: "absolute", left: 7, bottom: 7 }}>
            <MediaBadge videos={info.videos} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <DayHead info={info} />
            <ChevronRight size={17} color={C.sub} style={{ flexShrink: 0, marginTop: -1 }} />
          </div>
          <TourLines lines={info.lines} />
          {/* Pace and rating are both quality signals, so they sit together and
              leave the header row free for the full day and route line. */}
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <PaceChip pace={info.pace} colors={info.paceColor} />
            <DayRatingPill rating={info.rating} />
            {info.canChange && <ChangeLink onClick={onChange} />}
          </div>
        </div>
      </div>
      {info.note && <NoteBand note={info.note} />}
    </div>
  );
}

// ═══ Option B · Wide banner ═══
function CardB({ info, onOpen, onChange }) {
  return (
    <div onClick={onOpen} style={cardBase}>
      <div style={{ position: "relative", height: 128, background: C.div }}>
        <img src={info.poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.62) 100%)" }} />
        {info.videos.length > 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PlayDisc size={38} />
          </div>
        )}
        <div style={{ position: "absolute", top: 9, left: 10 }}>
          <PaceChip pace={info.pace} colors={info.paceColor} variant="overlay" />
        </div>
        <div style={{ position: "absolute", top: 9, right: 10 }}>
          <DayRatingPill rating={info.rating} overlay />
        </div>
        <div style={{ position: "absolute", left: 10, bottom: 9, right: 10, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <DayHead info={info} light size={12} />
          <MediaBadge videos={info.videos} />
        </div>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <TourLines lines={info.lines} size={12.5} />
        {info.note && <NoteStrip note={info.note} />}
      </div>
      <div style={{ display: "flex", borderTop: `1px solid ${C.div}` }}>
        {info.canChange && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(); }}
            style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 8px", background: "none", border: "none", borderRight: `1px solid ${C.div}`,
              fontSize: 12, fontWeight: 700, color: C.p600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <ArrowLeftRight size={13} color={C.p600} />
            Change day plan
          </button>
        )}
        <div style={{
          flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
          padding: "10px 8px", fontSize: 12, fontWeight: 700, color: C.head,
        }}>
          Day details
          <ChevronRight size={14} color={C.sub} />
        </div>
      </div>
    </div>
  );
}

// ═══ Option C · Compact timeline ═══
function CardC({ info, onOpen, onChange, first }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute", left: -20, top: 16, width: 10, height: 10, borderRadius: "50%",
        background: "#fff", border: `2px solid ${first ? "#027A48" : C.inact}`,
      }} />
      <div onClick={onOpen} style={{ ...cardBase, padding: "10px 12px" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", width: 68, height: 68, minWidth: 68, borderRadius: 10, overflow: "hidden", background: C.div }}>
            <img src={info.poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {info.videos.length > 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlayDisc size={24} />
              </div>
            )}
            {info.videos.length > 1 && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, padding: "3px 0",
                background: "rgba(12,16,40,0.78)", textAlign: "center",
                fontSize: 9.5, fontWeight: 700, color: "#fff", letterSpacing: 0.3,
              }}>
                {info.videos.length} videos
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: C.head, margin: 0, minWidth: 0, lineHeight: "18px" }}>
                Day {info.day.dayNum}: {info.day.city}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <DayRatingPill rating={info.rating} />
                <ChevronRight size={17} color={C.sub} />
              </div>
            </div>
            <div style={{ margin: "3px 0 5px" }}>
              <PaceChip pace={info.pace} colors={info.paceColor} variant="dot" />
            </div>
            <TourLines lines={info.lines} />
          </div>
        </div>
        {(info.note || info.canChange) && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {info.note && <NoteLine note={info.note} />}
            {info.canChange && <ChangeLink onClick={onChange} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ Option D · Media strip ═══
function CardD({ info, onOpen, onChange }) {
  const tiles = info.videos.length
    ? info.videos.map((v) => ({ img: v.poster, video: true, label: v.duration }))
    : (info.day.activities.length ? info.day.activities : [{ img: info.poster }]).map((a) => ({ img: a.img || info.poster, video: false }));

  return (
    <div onClick={onOpen} style={{ ...cardBase, padding: "11px 0 11px 12px" }}>
      <div style={{ paddingRight: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <DayHead info={info} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <DayRatingPill rating={info.rating} />
          <ChevronRight size={17} color={C.sub} />
        </div>
      </div>
      <div style={{ paddingRight: 12, marginTop: 6 }}>
        <TourLines lines={info.lines} size={12.5} />
      </div>
      <div style={{ paddingRight: 12, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, letterSpacing: 0.4, textTransform: "uppercase" }}>
          {info.videos.length > 1 ? `${info.videos.length} videos from this day`
            : info.videos.length === 1 ? "Video from this day" : "Photos from this day"}
        </span>
      </div>
      <div className="hs" style={{ gap: 7, marginTop: 7, paddingRight: 12 }}>
        {tiles.map((t, i) => (
          <div key={i} style={{ position: "relative", width: 88, minWidth: 88, height: 108, borderRadius: 9, overflow: "hidden", background: C.div, flexShrink: 0 }}>
            <img src={t.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {t.video && (
              <>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PlayDisc size={26} />
                </div>
                {t.label && (
                  <span style={{
                    position: "absolute", right: 5, bottom: 5, padding: "1px 5px", borderRadius: 4,
                    background: "rgba(12,16,40,0.78)", fontSize: 9.5, fontWeight: 700, color: "#fff",
                  }}>{t.label}</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ paddingRight: 12, marginTop: 10, display: "flex", flexDirection: "column", gap: 9 }}>
        {info.note && <NoteQuote note={info.note} />}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <PaceChip pace={info.pace} colors={info.paceColor} variant="soft" />
          {info.canChange && <ChangePill onClick={onChange} />}
        </div>
      </div>
    </div>
  );
}

// ═══ Option E · Full-bleed hero ═══
function CardE({ info, onOpen, onChange }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div onClick={onOpen} style={{ ...cardBase, position: "relative", height: 208 }}>
      <img src={info.poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.05) 34%, rgba(0,0,0,0.78) 100%)" }} />
      {info.videos.length > 0 && (
        <div style={{ position: "absolute", top: 62, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <PlayDisc size={42} />
        </div>
      )}

      <div style={{ position: "absolute", top: 10, left: 11, right: 11, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <PaceChip pace={info.pace} colors={info.paceColor} variant="overlay" />
          {info.note && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowNote((s) => !s); }}
              aria-label="Heads up for this day"
              style={{
                width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                background: showNote ? NOTE.icon : "rgba(255,255,255,0.94)",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              }}
            >
              <TriangleAlert size={12} color={showNote ? "#fff" : NOTE.icon} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <MediaBadge videos={info.videos} dark={false} />
          <DayRatingPill rating={info.rating} overlay />
        </div>
      </div>

      {showNote && info.note && (
        <div style={{ position: "absolute", top: 40, left: 11, right: 11, background: "rgba(255,255,255,0.96)", borderRadius: 9, padding: "8px 10px", display: "flex", gap: 7 }}>
          <TriangleAlert size={13} color={NOTE.icon} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 11.5, color: C.head, lineHeight: "16px" }}>{info.note}</span>
        </div>
      )}

      <div style={{ position: "absolute", left: 12, right: 12, bottom: 11 }}>
        <DayHead info={info} light size={11.5} />
        <div style={{ marginTop: 4 }}>
          <TourLines lines={info.lines} color="rgba(255,255,255,0.94)" size={12.5} />
        </div>
        <div style={{ marginTop: 9, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {info.canChange ? <ChangePill onClick={onChange} overlay /> : <span />}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: "#fff" }}>
            Day details
            <ChevronRight size={14} color="#fff" />
          </span>
        </div>
      </div>
    </div>
  );
}

const OPTIONS = [
  { key: "a", label: "A · Poster left", Card: CardA, note: "Reference layout. Portrait poster on the left, everything else stacked beside it. Note runs full width underneath." },
  { key: "b", label: "B · Wide banner", Card: CardB, note: "Media runs the full width with pace and rating on it. Split footer for change day and day details." },
  { key: "c", label: "C · Compact timeline", Card: CardC, note: "Closest to today's card. Small square thumb, count printed on it, note as one quiet line." },
  { key: "d", label: "D · Media strip", Card: CardD, note: "Every video is its own tile, so the count is visible not just stated. Note as a callout." },
  { key: "e", label: "E · Full-bleed hero", Card: CardE, note: "Media is the card. Everything sits on it, and the note hides behind a tap." },
];

export default function GlanceCardLab() {
  const navigate = useNavigate();
  const [opt, setOpt] = useState(0);
  const days = useDayInfo();
  const { Card, note, label } = OPTIONS[opt];

  const [toast, setToast] = useState(null);
  const ping = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1600); };

  return (
    <div style={{ minHeight: "100%", background: C.bg, position: "relative" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.white, borderBottom: `1px solid ${C.div}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px 8px" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <ArrowLeft size={20} color={C.head} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.head, margin: 0 }}>Glance card, five ways</p>
            <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{label}</p>
          </div>
        </div>
        <div className="hs" style={{ gap: 7, padding: "0 14px 10px" }}>
          {OPTIONS.map((o, i) => (
            <button
              key={o.key}
              onClick={() => setOpt(i)}
              style={{
                flexShrink: 0, padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                background: i === opt ? C.head : C.white,
                color: i === opt ? "#fff" : C.sub,
                border: `1px solid ${i === opt ? C.head : C.div}`,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px 40px" }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 4px" }}>Your trip, day by day</p>
        <p style={{ fontSize: 12, color: C.sub, margin: "0 0 14px", lineHeight: "17px" }}>{note}</p>

        <div style={{ position: "relative", paddingLeft: opt === 2 ? 24 : 0 }}>
          {opt === 2 && <div style={{ position: "absolute", left: 7, top: 12, bottom: 12, width: 1, borderLeft: "1px dashed #D0D5DD" }} />}
          <div style={{ display: "flex", flexDirection: "column", gap: opt === 2 ? 14 : 12 }}>
            {days.map((info) => (
              <Card
                key={info.i}
                info={info}
                first={info.i === 0}
                onOpen={() => ping(`Day ${info.day.dayNum} details`)}
                onChange={() => ping(`Change day ${info.day.dayNum}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 28, zIndex: 50,
          background: C.head, color: "#fff", padding: "9px 16px", borderRadius: 22,
          fontSize: 12.5, fontWeight: 600, boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
