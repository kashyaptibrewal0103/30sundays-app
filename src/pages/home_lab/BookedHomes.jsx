import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ChevronRight, Plane } from "lucide-react";
import { C } from "../../data";
import { mockTrips } from "../../data/tripData";
import { DESTINATIONS } from "../../data/communityData";
import { getSeasonGroups, COMPARE_REELS } from "../../data/homeV3Data";
import { useCommunity } from "../../state/useCommunity";
import { CC } from "../../components/Community/tokens";
import { EntryLoungeScene } from "../../components/Community/TripEntryVariants";
import { customerPhotos } from "../../data";
import EduMultiCarousel from "../../components/home_v2/EduMultiCarousel";
import { DestCircles, LowerSections, AllSixCountries, TravellerMomentsReels, LovedByCouples } from "../HomeV5";
import { NAVY, W } from "./labShared";

// The home page once somebody has booked. The marketing hero and "Plan my
// trip" make no sense to a person who already paid, so the top of the page
// becomes their trip, with the Sunday Community entrance right under it. Five
// shapes for that top block; everything below it is the live home as it is.

const PAD = 18;
// Three letter country codes for the pass. The trip knows its destination by
// name, and a pass shows the country, not the city, so the name maps to both.
const STUB = "#F3E7DC";
const HOME_COUNTRY = { code: "IND", name: "India" };
const COUNTRY = {
  Thailand: { code: "THA", name: "Thailand" },
  Bali: { code: "IDN", name: "Indonesia" },
  Indonesia: { code: "IDN", name: "Indonesia" },
  Vietnam: { code: "VNM", name: "Vietnam" },
  Maldives: { code: "MDV", name: "Maldives" },
  Mauritius: { code: "MUS", name: "Mauritius" },
  "Sri Lanka": { code: "LKA", name: "Sri Lanka" },
  "New Zealand": { code: "NZL", name: "New Zealand" },
  Singapore: { code: "SGP", name: "Singapore" },
};
// dd mmm yy, the way a pass prints a date.
const passDate = (d) => [
  String(d.getDate()).padStart(2, "0"),
  d.toLocaleDateString("en-IN", { month: "short" }),
  String(d.getFullYear()).slice(-2),
].join(" ");
const SERIF = "'DM Serif Display', Georgia, serif";
const HAND = "'Caveat', 'Figtree', sans-serif";

// ─── Shared trip facts ───
export function useBookedTrip() {
  const trip = mockTrips.find(t => t.id === "trip-1");
  const room = DESTINATIONS.thailand;
  const { liveQuestionsFor } = useCommunity();
  return useMemo(() => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.max(0, Math.round((start - new Date()) / 86400000));
    const day = (d) => d.toLocaleDateString("en-IN", { day: "numeric" });
    const mon = (d) => d.toLocaleDateString("en-IN", { month: "short" });
    const dates = mon(start) === mon(end)
      ? `${day(start)} to ${day(end)} ${mon(end)}`
      : `${day(start)} ${mon(start)} to ${day(end)} ${mon(end)}`;
    const stops = trip.nightsBreakdown.split(" • ").map((s, i) => {
      const m = s.match(/^(\d+)N (.+)$/);
      return { nights: Number(m[1]), city: m[2], img: trip.heroImages[i % trip.heroImages.length] };
    });
    const fresh = liveQuestionsFor(room.id).filter(q => (q.minsAgo ?? 0) <= 1440).length;
    const first = trip.leadTraveler.name.split(" ")[0];
    const second = trip.coTravelers[0]?.name.split(" ")[0];
    return {
      trip, room, days, dates, stops, fresh, start, end, first,
      from: HOME_COUNTRY,
      to: COUNTRY[trip.destination] || { code: "\u2708", name: trip.destination },
      names: second ? `${first} & ${second}` : first,
      nights: trip.totalNights,
      hero: trip.heroImages[0],
      done: 3, total: 5,
    };
  }, [trip, room, liveQuestionsFor]);
}

// ─── Shared parts ───

// Under the pass, the Community is one line, not a second card. Two cards of
// the same size stacked read as two boxes put next to each other, which is the
// thing the home was trying to avoid. Five ways to write that line.

const faceRow = (t, n = 4) => {
  const shots = customerPhotos[t.room.name] || [];
  if (!shots.length) return [];
  return Array.from({ length: n }, (_, i) => shots[Math.round((i * (shots.length - 1)) / (n - 1))]);
};

const LINE = "Ask travelers who've been there before.";
const CTA = "View Community";
const NAME = "Sunday Community";

/* ─────────────────────────────────────────────────────────────────────────
   What was wrong with the first five, and what each of these does instead.

   1. Five things were fighting over one short row: four photographs, a loose
      "+138", the name, the sentence and a link. That is a section's worth of
      content wearing a line's clothes, and it is why every version looked
      cluttered no matter how it was arranged.
   2. The photographs were 24px. A landscape holiday shot stops reading as
      people below about 32px, so the one signal they were there for never
      landed. They were texture, not faces.
   3. The "+138" sat outside the stack at a different size, which broke the
      run of circles instead of finishing it. In every app that does this
      well the overflow is a chip the same size and shape as the avatars.
   4. The name and the sentence said the same thing twice, which forced two
      rows, which turned a line back into a block, which is the two-boxes
      problem returning at half size.
   5. It sat loose between a strong card and a section heading, with no
      ground of its own and nothing to attach to, so it read as leftover.

   So each of these removes something rather than rearranging it.
   ───────────────────────────────────────────────────────────────────────── */

// Avatars at a size where a photograph still reads as people, and the overflow
// as the last circle in the run rather than loose type beside it.
const Faces = ({ t, size = 34, n = 3, ring = C.white }) => {
  const pics = faceRow(t, n);
  const more = Math.max(0, (t.room.recent3m || 0) - pics.length);
  const lap = -size * 0.3;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
      {pics.map((src, i) => (
        <span key={i} style={{
          width: size, height: size, borderRadius: "50%", overflow: "hidden", display: "block",
          border: `2px solid ${ring}`, marginLeft: i ? lap : 0, position: "relative", zIndex: n - i,
        }}>
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </span>
      ))}
      {more > 0 && (
        <span style={{
          width: size, height: size, borderRadius: "50%", marginLeft: lap,
          border: `2px solid ${ring}`, background: CC.ink, color: "#fff",
          display: "grid", placeItems: "center", fontSize: size * 0.3, fontWeight: 800,
        }}>+{more}</span>
      )}
    </span>
  );
};

const Label = ({ color = CC.tealInk }) => (
  <span style={{
    fontSize: 11, fontWeight: 800, color, letterSpacing: "0.4px",
  }}>{NAME}</span>
);

// 1. A true line. No photographs, no count, no second row: the name as a small
// label and the sentence under it. Everything the strip was carrying that did
// not earn its place is gone.
export function CircleLinePure({ t, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 0,
      border: "none", background: "none", cursor: "pointer", font: "inherit", textAlign: "left",
    }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <Label />
        <span style={{ display: "block", fontSize: 13.5, color: C.head, lineHeight: "19px", marginTop: 2 }}>
          {LINE}
        </span>
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: C.p600, whiteSpace: "nowrap" }}>{CTA} →</span>
    </button>
  );
}

// 2. A tear-off on the pass. Not bolted underneath it but drawn as part of the
// ticket: same paper, a perforation across, and the notches carried down. It
// cannot look stranded because it is no longer a separate thing.
export function CircleLineTearOff({ t, onOpen, page = W.top }) {
  return (
    <button onClick={onOpen} style={{
      position: "relative", display: "flex", alignItems: "center", gap: 11, width: "100%",
      textAlign: "left", cursor: "pointer", font: "inherit", marginTop: -18,
      background: C.white, border: `1px solid ${C.div}`, borderTop: "none",
      borderRadius: "0 0 18px 18px", padding: "13px 16px 13px",
    }}>
      <span aria-hidden style={{
        position: "absolute", top: 0, left: 14, right: 14,
        borderTop: `1.5px dashed ${C.div}`,
      }} />
      <span aria-hidden style={{
        position: "absolute", top: -7, left: -7, width: 14, height: 14, borderRadius: "50%",
        background: page, border: `1px solid ${C.div}`, borderBottomColor: "transparent",
      }} />
      <span aria-hidden style={{
        position: "absolute", top: -7, right: -7, width: 14, height: 14, borderRadius: "50%",
        background: page, border: `1px solid ${C.div}`, borderBottomColor: "transparent",
      }} />
      <Faces t={t} size={30} n={2} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <Label />
        <span style={{ display: "block", fontSize: 12.5, color: C.sub, lineHeight: "17px", marginTop: 1 }}>
          {LINE}
        </span>
      </span>
      <ChevronRight size={17} color={C.p600} style={{ flexShrink: 0 }} />
    </button>
  );
}

// 3. Photographs at a size that actually reads, and nothing else next to them.
// Three faces, the overflow chip, one sentence. No name: the sentence says
// what it is, and saying it twice is what made the first set feel crowded.
export function CircleLineFacesBig({ t, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 0,
      border: "none", background: "none", cursor: "pointer", font: "inherit", textAlign: "left",
    }}>
      <Faces t={t} size={36} n={3} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: C.head, lineHeight: "19px" }}>
        {LINE}
      </span>
      <ChevronRight size={18} color={C.p600} style={{ flexShrink: 0 }} />
    </button>
  );
}

// 4. The app's own list row, hairline above and below. It stops looking foreign
// because it is built from the same parts as every other row in the product.
export function CircleLineListRow({ t, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
      cursor: "pointer", font: "inherit", background: "none",
      borderLeft: "none", borderRight: "none",
      borderTop: `1px solid ${C.div}`, borderBottom: `1px solid ${C.div}`,
      padding: "13px 0",
    }}>
      <Faces t={t} size={34} n={2} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.head, lineHeight: "19px" }}>
          {NAME}
        </span>
        <span style={{ display: "block", fontSize: 12.5, color: C.sub, lineHeight: "17px", marginTop: 1 }}>
          {LINE}
        </span>
      </span>
      {/* Pink and heavier than a list chevron: this row is the one thing on the
          home that opens the Community, so it should look like it does. */}
      <ChevronRight size={20} color={C.p600} strokeWidth={2.8} style={{ flexShrink: 0 }} />
    </button>
  );
}

// 5. A section of the page rather than an orphan between two. The heading sits
// at the same size and weight as Destinations below it, with the link on the
// right, so the eye files it with the other sections instead of wondering
// what it is doing there.
export function CircleLineSection({ t, onOpen }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: NAVY, letterSpacing: "-0.4px", lineHeight: "26px" }}>
          {NAME}
        </span>
        <button onClick={onOpen} style={{
          border: "none", background: "none", padding: 0, cursor: "pointer", font: "inherit",
          fontSize: 13, fontWeight: 700, color: C.p600, whiteSpace: "nowrap",
        }}>{CTA} →</button>
      </div>
      <button onClick={onOpen} style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", marginTop: 10, padding: 0,
        border: "none", background: "none", cursor: "pointer", font: "inherit", textAlign: "left",
      }}>
        <Faces t={t} size={34} n={3} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: C.sub, lineHeight: "19px" }}>
          {LINE}
        </span>
      </button>
    </div>
  );
}

export const CIRCLE_LINES = [
  { n: 1, name: "Pure line", note: "No photographs and no count. A small label and the sentence, with the link at the end. Everything that was not earning its place is gone.", Comp: CircleLinePure },
  { n: 2, name: "Tear-off", note: "Drawn as part of the ticket: same paper, a perforation across it, the notches carried down. It cannot look stranded because it is no longer separate.", Comp: CircleLineTearOff },
  { n: 3, name: "Faces that read", note: "Photographs at 36px, where a holiday shot still reads as people, and the overflow as the last circle in the run. One sentence, no name.", Comp: CircleLineFacesBig },
  { n: 4, name: "List row", note: "Hairline above and below, built from the same parts as every other row in the app. Stops looking foreign.", Comp: CircleLineListRow },
  { n: 5, name: "Its own section", note: "A heading at the same size as Destinations below it, with the link on the right. The eye files it with the other sections instead of wondering what it is.", Comp: CircleLineSection },
];

export function LoungeBlock({ t, style, variant = 1 }) {
  const navigate = useNavigate();
  const { Comp } = CIRCLE_LINES.find(v => v.n === variant) || CIRCLE_LINES[0];
  return (
    <div style={{ padding: `0 ${PAD}px`, ...style }}>
      <Comp t={t} onOpen={() => navigate(`/community/${t.room.id}?from=home`)} />
    </div>
  );
}

export function ReadyLink({ t, style, plain = false }) {
  return (
    <Link to={`/trips/${t.trip.id}`} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      margin: `14px ${PAD}px 0`, textDecoration: "none", ...style,
    }}>
      <span style={{ fontSize: 13, color: C.sub }}>
        {plain
          ? "Dates, hotels, payments and documents"
          : <><b style={{ color: C.head, fontWeight: 700 }}>{t.done} of {t.total}</b> things done before you fly</>}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: C.p600 }}>
        View trip <ArrowRight size={14} color={C.p600} />
      </span>
    </Link>
  );
}

// The untouched half of the home, below the booked block.
function RestOfHome() {
  const groups = useMemo(() => getSeasonGroups(new Date()), []);
  const lessons = COMPARE_REELS.map((c) => ({
    poster: c.poster, videoUrl: c.videoUrl, duration: c.duration, tag: `${c.a} vs ${c.b}`, topics: c.topics,
  }));
  return (
    <>
      <LowerSections groups={groups} showUsp={false} />
      <EduMultiCarousel valueTitle="Torn between [two]?" lessons={lessons} />
      <AllSixCountries />
      <TravellerMomentsReels />
      <LovedByCouples />
      <div style={{ height: 96 }} />
    </>
  );
}

// Lab control: a slim strip above the page, so it never covers the design.
function Switcher({ n }) {
  const v = BOOKED_HOMES.find(x => x.n === n);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: `8px ${PAD}px`, background: "#181E4C" }}>
      <Link to="/home-lab/booked" style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginRight: 2 }}>Booked</Link>
      {[1, 2, 3, 4, 5].map(i => (
        <Link key={i} to={`/home-lab/booked/${i}`} style={{
          width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center",
          textDecoration: "none", fontSize: 12, fontWeight: 800,
          background: i === n ? C.p600 : "rgba(255,255,255,0.12)", color: "#fff",
        }}>{i}</Link>
      ))}
      <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v?.name}</span>
    </div>
  );
}

function Page({ n, children }) {
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: C.white }}>
        <Switcher n={n} />
        <DestCircles />
        {children}
        <RestOfHome />
      </div>
    </div>
  );
}

// ─── 1. The countdown poster ───
// The destination's own photo fills the first screen, the way the marketing
// hero did, but the line on it is theirs: the place and the number of days.
// The Community card rides up over the bottom edge of the photo.
function CountdownPoster() {
  const t = useBookedTrip();
  const navigate = useNavigate();
  return (
    <Page n={1}>
      <div style={{ position: "relative", height: 372, overflow: "hidden" }}>
        <img src={t.hero} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.72) 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: `0 ${PAD}px 62px` }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.2px" }}>
            Your trip · {t.dates}
          </p>
          <h1 style={{ margin: "8px 0 0", fontFamily: SERIF, fontWeight: 400, fontSize: 44, lineHeight: "46px", color: "#fff", letterSpacing: "-0.5px", textShadow: "0 2px 18px rgba(0,0,0,0.35)" }}>
            Thailand,<br />in <em style={{ fontStyle: "italic" }}>{t.days} days</em>.
          </h1>
          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            {t.stops.map(s => (
              <span key={s.city} style={{ fontSize: 12, fontWeight: 600, color: "#fff", padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.35)", backdropFilter: "blur(6px)" }}>
                {s.nights}N {s.city}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 2, margin: `-34px ${PAD}px 0` }}>
        <div style={{ borderRadius: 20, boxShadow: "0 14px 36px rgba(0,0,0,0.16)" }}>
          <EntryLoungeScene d={t.room} onOpen={() => navigate(`/community/${t.room.id}?from=home`)} />
        </div>
        {t.fresh > 0 && (
          <p style={{ margin: "10px 2px 0", fontSize: 12.5, fontWeight: 700, color: CC.tealInk, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: CC.teal, display: "inline-block" }} />
            {t.fresh} new {t.fresh === 1 ? "question" : "questions"} in the Community today
          </p>
        )}
      </div>
      <ReadyLink t={t} style={{ marginTop: 16 }} />
    </Page>
  );
}

// ─── 2. The boarding pass ───
// White page, one object on it. The trip is printed as a pass: the two
// airport codes, the dates, the route, and the days to go on the tear-off
// stub. The Community card sits under it, since the pass is what gets you in.
function Notch({ top, ground = C.white }) {
  return (
    <span style={{
      position: "absolute", right: -7, [top ? "top" : "bottom"]: -7, width: 14, height: 14, borderRadius: "50%",
      background: ground, border: `1px solid ${C.div}`,
      [top ? "borderBottomColor" : "borderTopColor"]: "transparent",
    }} />
  );
}
// The trip printed as a pass: who is going, the two countries, the two dates,
// and the count on the stub. No cities and no route, because a pass names the
// country you clear immigration in, not the places you sleep.
// `page` is the colour behind the card, so the punched notches read as holes.
export function BoardingPassCard({ t, page = W.top, ink = C.head, raised = false }) {
  return (
    <Link to={`/trips/${t.trip.id}`} style={{
      display: "flex", textDecoration: "none", border: `1px solid ${C.div}`, borderRadius: 18,
      background: C.white, overflow: "hidden",
      boxShadow: raised ? "0 18px 44px rgba(20,16,12,0.30)" : "0 8px 24px rgba(24,29,39,0.06)",
    }}>
      <div style={{ flex: 1, minWidth: 0, padding: "13px 16px 12px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{t.first} · {t.nights} nights</span>
          <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>30 Sundays</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 29, fontWeight: 800, color: ink, letterSpacing: "-1px", lineHeight: "31px" }}>{t.from.code}</div>
            <div style={{ fontSize: 11.5, color: C.sub, marginTop: 1 }}>{t.from.name}</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 24 }}>
            <span style={{ flex: 1, borderTop: `1.5px dashed ${C.icon}` }} />
            <Plane size={15} color={C.p600} style={{ transform: "rotate(45deg)", flexShrink: 0 }} />
            <span style={{ flex: 1, borderTop: `1.5px dashed ${C.icon}` }} />
          </div>
          <div style={{ minWidth: 0, textAlign: "right" }}>
            <div style={{ fontSize: 29, fontWeight: 800, color: ink, letterSpacing: "-1px", lineHeight: "31px" }}>{t.to.code}</div>
            <div style={{ fontSize: 11.5, color: C.sub, marginTop: 1 }}>{t.to.name}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: 13 }}>
          {[["Depart", passDate(t.start)], ["Return", passDate(t.end)]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10.5, color: C.inact, fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 12.5, color: ink, fontWeight: 700, marginTop: 2, whiteSpace: "nowrap" }}>{v}</div>
            </div>
          ))}
          {/* The whole pass opens the trip. This is the hint, not a button. */}
          <span style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 12, fontWeight: 700, color: C.p600, whiteSpace: "nowrap",
          }}>Trip details <ChevronRight size={13} color={C.p600} /></span>
        </div>

        <Notch top ground={page} /><Notch ground={page} />
      </div>

      <div style={{
        width: 84, flexShrink: 0, borderLeft: `1.5px dashed ${C.div}`, background: STUB,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.p600, letterSpacing: "-1.5px", lineHeight: "34px" }}>{t.days}</div>
        <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 2 }}>days to go</div>
        <div style={{ marginTop: 10, display: "flex", gap: 2 }}>
          {[3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1].map((w, i) => <span key={i} style={{ width: w, height: 17, background: ink, opacity: 0.85 }} />)}
        </div>
      </div>
    </Link>
  );
}

function BoardingPass() {
  const t = useBookedTrip();
  return (
    <Page n={2}>
      <div style={{ padding: `6px ${PAD}px 0` }}>
        <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, color: C.sub }}>Your trip</p>
        <BoardingPassCard t={t} page={C.white} />
      </div>
      <LoungeBlock t={t} style={{ marginTop: 22 }} />
    </Page>
  );
}

// ─── 3. The calendar leaf ───
// A tear-off calendar page with the departure day on it, and the trip
// written beside it. Quiet, tabular, and the date is what your eye lands on.
function CalendarLeaf() {
  const t = useBookedTrip();
  const mon = t.start.toLocaleDateString("en-IN", { month: "long" });
  const wd = t.start.toLocaleDateString("en-IN", { weekday: "long" });
  return (
    <Page n={3}>
      <div style={{ padding: `8px ${PAD}px 0`, display: "flex", gap: 16, alignItems: "stretch" }}>
        <div style={{ width: 104, flexShrink: 0, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.div}`, boxShadow: "0 8px 20px rgba(24,29,39,0.08)", background: C.white, textAlign: "center" }}>
          <div style={{ background: C.p600, color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 0", position: "relative" }}>
            {mon}
            <span style={{ position: "absolute", top: 4, left: 14, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
            <span style={{ position: "absolute", top: 4, right: 14, width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
          </div>
          <div style={{ fontSize: 50, fontWeight: 800, color: C.head, letterSpacing: "-2px", lineHeight: "54px", marginTop: 8 }}>{t.start.getDate()}</div>
          <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 600, paddingBottom: 10 }}>{wd}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.sub }}>Your trip</p>
          <h1 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: C.head, letterSpacing: "-0.6px", lineHeight: "30px" }}>Thailand</h1>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: C.sub }}>{t.dates} · {t.nights} nights</p>
          <p style={{ margin: "10px 0 0", fontSize: 15, fontWeight: 800, color: C.head }}>{t.days} days to go</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{ flex: 1, height: 5, borderRadius: 3, background: C.div, overflow: "hidden" }}>
              <span style={{ display: "block", width: `${(t.done / t.total) * 100}%`, height: "100%", background: CC.teal, borderRadius: 3 }} />
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.tealInk, whiteSpace: "nowrap" }}>{t.done} of {t.total} ready</span>
          </div>
        </div>
      </div>
      <LoungeBlock t={t} style={{ marginTop: 22 }} />
      <ReadyLink t={t} plain />
    </Page>
  );
}

// ─── 4. The welcome note ───
// A greeting in the brand's handwriting, then three snapshots of the places
// on the route, pinned at a slant. The warmest of the five.
function WelcomeNote() {
  const t = useBookedTrip();
  const tilt = [-4, 2.5, -2];
  return (
    <Page n={4}>
      <div style={{ padding: `10px ${PAD}px 0` }}>
        <h1 style={{ margin: 0, fontFamily: HAND, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: "40px" }}>
          Sawasdee, {t.names}!
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: C.sub, lineHeight: "20px" }}>
          Thailand is <b style={{ color: C.head, fontWeight: 700 }}>{t.days} days</b> away. {t.dates}, {t.nights} nights.
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: `18px ${PAD}px 0` }}>
        {t.stops.map((s, i) => (
          <div key={s.city} style={{ transform: `rotate(${tilt[i]}deg)`, background: C.white, padding: "6px 6px 8px", borderRadius: 6, boxShadow: "0 8px 22px rgba(24,29,39,0.14), 0 1px 2px rgba(0,0,0,0.06)", width: 104, flexShrink: 0 }}>
            <img src={s.img} alt="" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 3, display: "block" }} />
            <div style={{ fontFamily: HAND, fontSize: 17, fontWeight: 600, color: NAVY, textAlign: "center", marginTop: 6, lineHeight: "18px" }}>
              {s.city}, {s.nights}N
            </div>
          </div>
        ))}
      </div>
      <LoungeBlock t={t} style={{ marginTop: 26 }} />
      <ReadyLink t={t} />
    </Page>
  );
}

// ─── 5. The route ───
// The three stops as a line, each a round photo with its nights under it.
// Reads like a map you could follow, with the count of days on a small tag.
function RouteStrip() {
  const t = useBookedTrip();
  return (
    <Page n={5}>
      <div style={{ padding: `8px ${PAD}px 0` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: C.sub }}>Your trip</p>
            <h1 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 800, color: C.head, letterSpacing: "-0.6px", lineHeight: "30px" }}>Thailand</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.sub }}>{t.dates} · {t.nights} nights</p>
          </div>
          <span style={{ marginTop: 4, fontSize: 12.5, fontWeight: 800, color: CC.goldInk, background: CC.goldTint, border: `1px solid ${CC.goldLine}`, borderRadius: 999, padding: "6px 11px", whiteSpace: "nowrap" }}>
            {t.days} days to go
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", marginTop: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 64, flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: W.top, border: `1px solid ${C.div}`, display: "grid", placeItems: "center" }}>
              <Plane size={20} color={C.head} style={{ transform: "rotate(45deg)" }} />
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.head, marginTop: 8 }}>Mumbai</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>Depart</div>
          </div>
          {t.stops.map((s) => (
            <div key={s.city} style={{ display: "flex", flex: 1, minWidth: 0, alignItems: "flex-start" }}>
              <span style={{ flex: 1, borderTop: `2px dotted ${C.icon}`, marginTop: 32 }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 64, flexShrink: 0 }}>
                <img src={s.img} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", display: "block", boxShadow: "0 6px 16px rgba(24,29,39,0.14)", border: "2.5px solid #fff" }} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.head, marginTop: 8, whiteSpace: "nowrap" }}>{s.city}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{s.nights} nights</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LoungeBlock t={t} style={{ marginTop: 24 }} />
      <ReadyLink t={t} />
    </Page>
  );
}

export const BOOKED_HOMES = [
  { n: 1, name: "The countdown poster", note: "The destination fills the first screen and the line on it is the days to go. The Community card rides up over the photo.", Comp: CountdownPoster },
  { n: 2, name: "The boarding pass", note: "The trip printed as a pass, airport codes and all, with the days to go on the stub. The Community sits under the thing that gets you in.", Comp: BoardingPass },
  { n: 3, name: "The calendar leaf", note: "A tear-off calendar page with the departure day, and the trip written beside it. The quietest of the five.", Comp: CalendarLeaf },
  { n: 4, name: "The welcome note", note: "A greeting in the brand's handwriting and three snapshots of the route, pinned at a slant. The warmest.", Comp: WelcomeNote },
  { n: 5, name: "The route", note: "Mumbai to Phuket to Krabi to Bangkok as a dotted line of round photos, with the count on a small tag.", Comp: RouteStrip },
];

export function BookedHome() {
  const { n } = useParams();
  const v = BOOKED_HOMES.find(x => String(x.n) === n) || BOOKED_HOMES[0];
  return <v.Comp />;
}

export function BookedHomeIndex() {
  return (
    <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: C.white, padding: `18px ${PAD}px 100px` }}>
      <Link to="/home-lab" style={{ fontSize: 12.5, fontWeight: 700, color: C.p600, textDecoration: "none" }}>Home lab</Link>
      <h1 style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>Home, once you have booked</h1>
      <p style={{ margin: "8px 0 0", fontSize: 14, color: C.sub, lineHeight: "21px" }}>
        The marketing hero goes. In its place: your trip, then the Sunday Community entrance from the trip screen, then the home as it is. Five shapes for the top.
      </p>
      <div style={{ marginTop: 18, border: `1px solid ${C.div}`, borderRadius: 16, overflow: "hidden" }}>
        {BOOKED_HOMES.map((v, i) => (
          <Link key={v.n} to={`/home-lab/booked/${v.n}`} style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", textDecoration: "none", borderTop: i ? `1px solid ${C.div}` : "none" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: C.p100, color: C.p600, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>{v.n}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 800, color: NAVY }}>{v.name}</span>
              <span style={{ display: "block", fontSize: 12.5, color: C.sub, lineHeight: "17px", marginTop: 2 }}>{v.note}</span>
            </span>
            <ChevronRight size={17} color={C.icon} />
          </Link>
        ))}
      </div>
    </div>
  );
}
