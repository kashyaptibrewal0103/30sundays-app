import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronRight, Heart, Receipt, ShieldCheck, Star } from "lucide-react";
import { C, destData, allItineraries } from "../../data";
import { useDeals } from "../../data/deals";
import { COMPARE_REELS } from "../../data/homeV3Data";
import EduMultiCarousel from "../../components/home_v2/EduMultiCarousel";
import LeadCloseCTA from "../../components/home_shared/LeadCloseCTA";
import { TravellerMomentsReels, LovedByCouples } from "../HomeV5";
import Logo from "../../components/Logo";
import { MATCH_CARDS, PROMISES, USPS } from "../../data/homeLabData";

export const PAD = 18;
// One gap between sections everywhere. It matches the space the live page
// already leaves before "Couples who trusted us", so the rebuilt half and the
// untouched half breathe the same way.
export const GAP = 46;
// Flat band at the foot of a hero, where the clip has fully faded out.
export const JOIN = 14;

// The warm ground the marketing site already uses: a blush paper that settles
// towards off white, with pure white kept for the cards that sit on it. Nothing
// on the rebuilt half of the page is pure white except a raised surface.
// Straight from the marketing site's stylesheet. The page ground is #FDF8F5,
// and the site never draws a wave: it washes a whole section with a soft
// gradient instead, which is why hand drawn waves looked wrong here.
export const W = {
  top: "#FDF8F5",
  page: "#FDF8F5",
  cream: "#F9F4EB",
  card: "#FFFFFF",
  line: "#F1E7E1",
  // The site's own section washes, copied value for value.
  washWarm: "linear-gradient(#F9F4EB, #FDF8F5)",
  washSea: "linear-gradient(#FDF8F5 0%, #C6ECF53D 20%, #FACFD638 60%, #FDF8F5 100%)",
  washBlue: "linear-gradient(#FDF8F5, #B2E3EE80)",
  washPink: "linear-gradient(#FACFD666, #FDF8F5)",
  shadow: "0 4px 18px rgba(120,86,40,0.08)",
  shadowLg: "0 14px 40px rgba(120,86,40,0.16)",
};

// The site's own decoration, hot linked from its CDN rather than redrawn.
const CDN = "https://cdn.prod.website-files.com/66fab24c6dde4d79b3b507d9";
export const ART = {
  leafRight: `${CDN}/68b7e505c45a6083ce21cab5_leave-right.svg`,
  leafLeft: `${CDN}/68b7e505ea2efe68166ea93c_leave-left.avif`,
  cloudLeft: `${CDN}/68b822df871d477b6d0f4b14_colud-left.svg`,
  cloudRight: `${CDN}/68b822dfe6c26be162413ebf_cloud-right.svg`,
  // The three icons drawn for "Why we're the perfect match".
  uspCouples: `${CDN}/68b6df380a620230fa53dcbb_couple.svg`,
  uspPrice: `${CDN}/68b6de749d134418c093c9b5_SVG_animate-02_09_2025%2C-17_14_46.svg`,
  uspTraps: `${CDN}/68b6de74da5e6834f4be99af_SVG_animate-02_09_2025%2C-17_17_59.svg`,
};

// The site sets every heading in navy, not the app's near black. Headings only;
// body copy stays on the app's own text colours so the two never clash.
export const NAVY = "#181E4C";

// Sunday School sits on its own yellow. Both joins use this ramp.
export const YELLOW = "#FCF4CC";
export const BRIDGE = 40;
// One continuous fade of the page ground over a solid yellow base. Stepping
// between two colours needs stops, and the rate changes at every stop, which
// the eye reads as a line. Fading one flat colour out instead keeps the rate
// smooth, tapers it to nothing at both ends, and guarantees the far end is the
// yellow exactly, so there is nothing for a seam to show up against.
// smootherstep, sampled often enough that no segment bends. A gradient turns
// at every stop, and a turn is what the eye reads as a line, so the curve is
// flat at both ends (no start edge, no finish edge) and the 24 samples keep
// every segment too short to see a bend in.
const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const CURVE = Array.from({ length: 25 }, (_, i) => [i / 24, 1 - ease(i / 24)]);
export function bridge(down = true) {
  const stops = CURVE.map(([at, a]) => {
    const pos = down ? at : 1 - at;
    return [pos, `rgba(253,248,245,${a.toFixed(4)}) ${(pos * 100).toFixed(2)}%`];
  }).sort((x, y) => x[0] - y[0]).map(([, css]) => css);
  return `linear-gradient(180deg, ${stops.join(", ")}), ${YELLOW}`;
}


// The site's display face is PF Reminder Pro, a handwriting face we do not
// have a web licence for here. Caveat is the closest Google equivalent and is
// a one line swap if the real webfont is ever added.
export const DISPLAY = "'Caveat', 'Figtree', sans-serif";

// Tints of the brand's tropical forest, for a set of parts that must be told
// apart. One family, so a breakdown never spends three accents on decoration.
export const FOREST = ["#254342", "#4C6F6D", "#7E9C9A", "#B9CBCA"];

// Six photos shot by six different people in six different lights read as
// noise side by side. One grade pulls them into a single warm family.
export const GRADE = "saturate(0.92) contrast(1.03) sepia(0.09) brightness(1.01)";

// A destination photo, graded, with a warm wash over it.
export function Photo({ src, alt = "", style, wash = true }) {
  return (
    <>
      <img src={src} alt={alt} loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: GRADE, ...style }} />
      {wash && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(255,198,155,0.10) 0%, rgba(120,66,44,0.09) 100%)", pointerEvents: "none" }} />}
    </>
  );
}

// A muted looping clip with the place's photo behind it. If the clip is slow
// or fails, the photo carries the tile and nothing looks broken. `active`
// pauses clips that are out of view so one phone never plays six at once.
export function LabVideo({ src, poster, active = true, fade = 0, style, children }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v || failed) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active, failed, src]);
  // `fade` dissolves the picture's own pixels into the page rather than laying
  // a matching gradient over the top. An overlay always leaves a composite
  // edge where it stops; masked alpha has nothing to leave an edge with.
  // A straight fade spends most of its length half-transparent, which turns the
  // picture into grey haze over the cream. This curve holds the picture whole,
  // drops it quickly through the range where detail still shows, then tails off
  // where there is nothing left to see. It reaches zero exactly at the bottom,
  // so no sliver of picture survives past the join.
  const stops = [[0, 1], [0.35, 0.9], [0.55, 0.55], [0.7, 0.24], [0.85, 0.08], [1, 0]];
  const mask = fade
    ? `linear-gradient(180deg, ${stops.map(([at, a]) =>
        `rgba(0,0,0,${a}) ${((fade + at * (1 - fade)) * 100).toFixed(1)}%`).join(", ")})`
    : undefined;
  const fill = {
    position: "absolute", top: -1, left: -1, width: "calc(100% + 2px)", height: "calc(100% + 2px)",
    objectFit: "cover", filter: GRADE,
    ...(mask ? { WebkitMaskImage: mask, maskImage: mask } : {}),
  };
  return (
    <div style={{ position: "relative", overflow: "hidden", background: fade ? "transparent" : W.top, ...style }}>
      <img src={poster} alt="" style={fill} />
      {src && !failed && (
        <video ref={ref} src={src} poster={poster} muted loop playsInline autoPlay={active} preload={active ? "auto" : "none"}
          onError={() => setFailed(true)} style={{ ...fill, display: "block" }} />
      )}
      {children}
    </div>
  );
}

// A frosted edge on the clip: the outer band of the picture is blurred and the
// middle is left sharp, so the footage sits behind glass at the sides and
// corners. The mask is two gradients unioned, which gives a rounded rectangle
// rather than an ellipse.
export function GlassEdge({ blur = 13, inset = 14, radius = 0, bottom = false }) {
  const band = `${inset}%`, far = `${100 - inset}%`;
  const vertical = bottom
    ? `linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) ${band}, rgba(0,0,0,0) ${far}, #000 100%)`
    : `linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) ${band})`;
  const mask = `linear-gradient(to right, #000 0%, rgba(0,0,0,0) ${band}, rgba(0,0,0,0) ${far}, #000 100%), ${vertical}`;
  // The blur is a layer of its own, so wherever it stops it leaves an edge. On a
  // full bleed hero it used to stop short of the bottom while the picture was
  // still partly there, which is the step you could see. It now runs the whole
  // height and the wrapper dissolves it on the way down, so it disappears at the
  // same rate the picture does and there is no edge to find.
  const dissolve = bottom
    ? undefined
    : "linear-gradient(to bottom, #000 0%, #000 52%, rgba(0,0,0,0) 86%)";
  return (
    <div aria-hidden="true" style={{
      position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none",
      ...(dissolve ? { WebkitMaskImage: dissolve, maskImage: dissolve } : {}),
    }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: radius,
        backdropFilter: `blur(${blur}px) saturate(1.05)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(1.05)`,
        WebkitMaskImage: mask, maskImage: mask,
        WebkitMaskComposite: "source-over", maskComposite: "add",
      }} />
    </div>
  );
}

// The scrim over a full bleed clip, in two layers. The first darkens the band
// the line sits in. The second dissolves the clip into the page, so the video
// has no hard bottom edge.
// The fade reaches the page colour at 96% and then holds flat to the bottom.
// That last flat band is what kills the hairline: with any opacity left at the
// edge, even one or two percent, the cut shows as a line on a flat ground.
// JOIN is how far above the container's bottom the clip visually ends, so the
// action can be centred on it.
export function HeroScrim({ glass = true }) {
  return (
    <>
      {glass && <GlassEdge />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.5) 58%, rgba(0,0,0,0.4) 78%, rgba(0,0,0,0) 92%)" }} />
    </>
  );
}

// The line over a hero. A new line arrives from the right; the one it replaces
// carries on to the left and fades, so the words change with the clip instead
// of cutting. Height is fixed so the swap never nudges the layout.
// Six ways for the hero line to change. In every one the outgoing line is fully
// gone before the incoming one starts, so they are never both on screen. The
// old version overlapped them by a third of a second, which read as a double
// image rather than a change.
export const LINE_MODES = {
  slide: { label: "Slide", note: "Out to the left, in from the right.",
    out: ["lineOutLeft", 320, "ease-in"], enter: ["lineInRight", 420, "cubic-bezier(.2,.85,.25,1)"] },
  dissolve: { label: "Dissolve", note: "No movement. It just changes.",
    out: ["lineOutFade", 300, "ease-in"], enter: ["lineInFade", 460, "ease-out"] },
  lift: { label: "Lift", note: "Rises away, the next one rises in.",
    out: ["lineOutUp", 300, "ease-in"], enter: ["lineInUp", 440, "cubic-bezier(.2,.85,.25,1)"] },
  wipe: { label: "Wipe", note: "Erased left to right, then written back.",
    out: ["lineOutWipe", 380, "ease-in-out"], enter: ["lineInWipe", 520, "ease-in-out"] },
  words: { label: "Word by word", note: "Each word lands on its own beat.",
    out: ["wordOut", 260, "ease-in"], enter: ["wordIn", 380, "cubic-bezier(.2,.85,.25,1)"], stagger: 55 },
  blur: { label: "Blur", note: "Softens away, sharpens back. No direction.",
    out: ["lineOutBlur", 340, "ease-in"], enter: ["lineInBlur", 480, "ease-out"] },
};

const anim = ([name, ms, ease], delay = 0) =>
  `${name} ${ms}ms ${ease} ${delay}ms both`;

export function RotatingLine({ text, height, boxStyle, style, mode = "slide" }) {
  const m = LINE_MODES[mode] || LINE_MODES.slide;
  const [items, setItems] = useState([{ t: text, k: 0 }]);
  const k = useRef(0);
  const outMs = m.out[1];
  const words = String(text).split(" ").length;
  const totalMs = outMs + m.enter[1] + (m.stagger ? (words - 1) * (26 + m.stagger) : 0) + 90;

  useEffect(() => {
    if (items[items.length - 1].t === text) return;
    k.current += 1;
    setItems((cur) => [cur[cur.length - 1], { t: text, k: k.current }]);
    const id = setTimeout(() => setItems([{ t: text, k: k.current }]), totalMs);
    return () => clearTimeout(id);
  }, [text, items, totalMs]);

  return (
    <div style={{ position: "absolute", height, ...boxStyle }}>
      {items.map((it, i) => {
        const leaving = i < items.length - 1;
        const base = { position: "absolute", inset: 0, margin: 0, ...style };
        if (m.stagger) {
          // Words animate one at a time, so the line is spans rather than text.
          // The incoming word cannot start until the LAST outgoing word has
          // gone, not the first, or the two lines overlap.
          const words = it.t.split(" ");
          const outStep = 26;
          const clear = outMs + (words.length - 1) * outStep;
          return (
            <p key={it.k} style={base}>
              {words.map((w, n) => (
                <span key={n} style={{ display: "inline-block", whiteSpace: "pre",
                  animation: leaving
                    ? anim(m.out, n * outStep)
                    : anim(m.enter, clear + n * m.stagger) }}>{w}{" "}</span>
              ))}
            </p>
          );
        }
        return (
          <p key={it.k} style={{ ...base,
            animation: leaving ? anim(m.out) : anim(m.enter, outMs) }}>{it.t}</p>
        );
      })}
    </div>
  );
}

export const promiseAt = (i) => PROMISES[i % PROMISES.length];

// Steps through 0..n-1 on a timer. Drives the hero clip and the line on it.
export function useRotate(n, ms = 5200) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms]);
  return i;
}

// Which child of a vertical stack is nearest the middle of the phone. Lets a
// page of full height sections play only the clip you are actually looking at.
export function useCentreIndex(count) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const scroller = el.closest("[data-lab-scroll]");
    if (!scroller) return;
    const onScroll = () => {
      const mid = scroller.getBoundingClientRect().top + scroller.clientHeight / 2;
      let best = 0, dist = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      setIdx(Math.min(best, count - 1));
    };
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [count]);
  return [ref, idx];
}

// The lead's trip, the same way the live home works it out. Falls back to the
// Bali demo so the resume card always has something real to open.
export function useLeadTrip(userState) {
  const { deals } = useDeals();
  const [params] = useSearchParams();
  // ?plans=0, 1 or 2+ forces the state, so every case can be opened by link
  // without hunting for the demo switcher.
  const forced = params.get("plans");
  const isLead = forced != null ? Number(forced) > 0 : userState === "lead";
  return useMemo(() => {
    const isSeed = (id) => allItineraries.some((it) => it.id === Number(id));
    const deal = deals.find((d) => (d.versions || []).some((v) => v.status === "draft" && isSeed(v.itineraryId)));
    const ver = deal && [...deal.versions].reverse().find((v) => v.status === "draft" && isSeed(v.itineraryId));
    const itId = ver ? ver.itineraryId : 3;
    const it = allItineraries.find((x) => x.id === Number(itId));
    const dest = ver?.destination || it?.dest || "Bali";
    const count = forced != null ? Math.max(Number(forced), 1) : (deals.filter((d) => d.status === "active").length || 1);
    return {
      isLead, dest, count,
      nights: it?.nights || 7,
      img: (deal && deal.img) || it?.img || destData.Bali?.hero,
      dates: "Mar 31 to Apr 6",
      target: `/itinerary/${itId}?dealId=${deal ? deal.id : "demo_draft_bali"}&versionId=${ver ? ver.id : "demo_draft_bali_v1"}`,
    };
  }, [deals, isLead, forced]);
}

// The one fuchsia button. `tone="forest"` is for a second action on the same
// screen: still a real button, without spending fuchsia twice.
export function PlanButton({ label = "Plan my trip", to = "/build", full = false, size = "md", tone = "brand", style }) {
  const pad = size === "lg" ? "15px 26px" : "13px 22px";
  const forest = tone === "forest";
  // `full` is the home's pill: centred and about sixty percent of the screen,
  // so it reads as one clear action without covering the clip behind it.
  const wide = full ? { display: "flex", width: "68%", maxWidth: 258, margin: "0 auto" } : { display: "inline-flex" };
  return (
    <Link to={to} style={{ ...wide, alignItems: "center", justifyContent: "center", gap: 7, background: forest ? FOREST[0] : C.p600, color: "#fff", borderRadius: 999, padding: pad, fontSize: 15.5, fontWeight: 700, textDecoration: "none", boxShadow: forest ? "0 6px 18px rgba(37,67,66,0.28)" : "0 8px 24px rgba(227,27,83,0.32)", whiteSpace: "nowrap", ...style }}>
      {label} <ArrowRight size={16} />
    </Link>
  );
}

// Once a lead exists the button gives way to this: the plan they already have,
// with two card edges peeking out below when there is more than one. The deck
// is the only thing on the card that says "there are others", so it saves a
// heading and a count. View all plans appears only when there is more to see.
export function ResumeCard({ trip, raised = false, planAnother = true, style }) {
  const many = (trip.count || 1) > 1;
  const layer = { position: "absolute", top: 0, borderRadius: 18 };
  return (
    <div style={{ width: "100%", ...style }}>
      <div style={{ position: "relative", paddingBottom: many ? 20 : 0 }}>
        {many && <span style={{ ...layer, left: 20, right: 20, bottom: 0, background: "#FAF2E4", border: "1px solid #EBDCC3" }} />}
        {many && <span style={{ ...layer, left: 10, right: 10, bottom: 9, background: "#FFFCF5", border: "1px solid #F0E3CD" }} />}
        <Link to={trip.target} style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", background: W.card, borderRadius: 18, padding: 13, border: `1px solid ${W.line}`, boxShadow: raised ? W.shadowLg : "0 6px 20px rgba(120,86,40,0.13)" }}>
          <img src={trip.img} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0, filter: GRADE }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.p600 }}>Continue where you left off</p>
            <p style={{ margin: "2px 0 0", fontSize: 15.5, fontWeight: 800, color: NAVY }}>{trip.dest}, {trip.nights} nights</p>
          </div>
          <ChevronRight size={18} color={C.icon} style={{ flexShrink: 0 }} />
        </Link>
      </div>

      {many && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: -13, position: "relative", zIndex: 3 }}>
          <Link to="/trips" style={{ display: "inline-flex", alignItems: "center", gap: 3, background: W.card, borderRadius: 999, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: NAVY, textDecoration: "none", boxShadow: W.shadow }}>
            View all plans <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* The way to start another trip never leaves the page, whatever state
          the traveller is in. */}
      {planAnother && <Link to="/build" style={{ display: "block", textAlign: "center", marginTop: many ? 12 : 10, fontSize: 13, fontWeight: 600, color: C.sub, textDecoration: "underline", textUnderlineOffset: 3 }}>Plan another trip</Link>}
    </div>
  );
}

// Button for everyone, resume card for a lead.
export function PlanAction({ trip, raised = false, style, ...btn }) {
  if (trip?.isLead) return <ResumeCard trip={trip} raised={raised} style={style} />;
  return <PlanButton {...btn} style={style} />;
}

// Brand row. `onVideo` paints the lockup white. Nothing else sits here: the
// account already has its own place in the bottom nav.
export function TopBar({ onVideo = false, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: `14px ${PAD}px`, ...style }}>
      <Logo variant="lockup" height={30} mono={onVideo ? "#fff" : undefined} />
    </div>
  );
}

// The site's own palm leaves, placed the way its stylesheet places them:
// leaf-right hangs off the top right, leaf-left sits low on the left.
export function Leaf({ side = "right", height = 88, opacity = 1, style }) {
  const right = side === "right";
  return (
    <img src={right ? ART.leafRight : ART.leafLeft} alt="" aria-hidden="true" loading="lazy"
      style={{ position: "absolute", height, pointerEvents: "none", opacity,
        ...(right ? { top: 0, right: "-2%" } : { bottom: "25%", left: "-3%" }), ...style }} />
  );
}

// A soft cloud, laid over the band it sits on rather than painted on top of it.
export function Cloud({ side = "left", height = 74, style }) {
  const left = side === "left";
  return (
    <img src={left ? ART.cloudLeft : ART.cloudRight} alt="" aria-hidden="true" loading="lazy"
      style={{ position: "absolute", height, mixBlendMode: "overlay", pointerEvents: "none",
        ...(left ? { top: "-1%", left: "-3%" } : { top: 0, right: "-2%" }), ...style }} />
  );
}

// A section heading in the site's handwriting, with an optional plain subline.
// Section headings are set in the app's own face, not the brand hand. The
// handwriting is reserved for the places where we are teaching somebody
// something, such as Sunday School and Know before you go. Everywhere else it
// made ordinary furniture look like a greetings card.
export function DisplayTitle({ title, sub, size = 22, style }) {
  return (
    <div style={{ padding: `0 ${PAD}px`, marginBottom: 12, ...style }}>
      <h2 style={{ margin: 0, fontSize: size, fontWeight: 800, color: NAVY, lineHeight: 1.18, letterSpacing: "-0.4px" }}>{title}</h2>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 13, color: C.sub, lineHeight: "18px" }}>{sub}</p>}
    </div>
  );
}

// The proof, as one line under the button. Option 5: a thin rule between the
// rating and the count rather than a dot, so the two read as two separate
// facts. Running them together invites the reader to take the traveller count
// as the number of people who left the rating.
//
// It sits on the page rather than on the clip, because the button overlaps the
// clip's bottom edge and everything under it is already cream.
// `onVideo` is the same line in white, for when it sits on the clip itself.
export function ProofLine({ rating = "4.6", travellers = "25,000+ travellers", style, onVideo = false }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
      fontSize: 12.5, color: onVideo ? "rgba(255,255,255,0.92)" : C.sub,
      textShadow: onVideo ? "0 1px 8px rgba(0,0,0,0.55)" : "none", ...style,
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <svg width="13" height="13" viewBox="0 0 48 48" role="img" aria-label="Google" style={{ display: "block", flexShrink: 0 }}>
          <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-2.8-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.4c4.1-3.8 6.6-9.4 6.6-15.7z" />
          <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-6.9-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.2 5.6C7.9 41 15.4 46 24 46z" />
          <path fill="#FBBC05" d="M11.5 28.3c-.5-1.4-.8-2.8-.8-4.3s.3-3 .8-4.3l-7.2-5.6C2.9 17 2 20.4 2 24s.9 7 2.3 9.9l7.2-5.6z" />
          <path fill="#EA4335" d="M24 10.7c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4.5 30 2 24 2 15.4 2 7.9 7 4.3 14.1l7.2 5.6C13.3 14.5 18.2 10.7 24 10.7z" />
        </svg>
        <b style={{ fontWeight: 800, color: onVideo ? "#fff" : NAVY }}>{rating}</b>
        <Star size={11} color="#FBBC05" fill="#FBBC05" strokeWidth={0} />
      </span>
      <span style={{ width: 1, height: 12, background: onVideo ? "rgba(255,255,255,0.45)" : W.line }} />
      <span>{travellers}</span>
    </div>
  );
}

// The country grid: a photo inset in a white card with the name written across
// the bottom in the brand hand. Two up, names only.
export function PolaroidGrid({ items, photoHeight = 118, style }) {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, ...style }}>
      {items.map((d) => (
        <Link key={d.name} to={`/destination/${encodeURIComponent(d.name)}`}
          style={{ textDecoration: "none", background: W.card, borderRadius: 16, padding: 8, boxShadow: W.shadowLg }}>
          <div style={{ position: "relative", height: photoHeight, borderRadius: 10, overflow: "hidden" }}>
            <Photo src={d.img} alt={d.name} />
          </div>
          <p style={{ margin: "9px 0 7px", textAlign: "center", fontSize: 15, fontWeight: 700, color: NAVY, lineHeight: "19px", letterSpacing: "-0.2px" }}>{d.name}</p>
        </Link>
      ))}
    </div>
  );
}

// The site's "Why we're the perfect match" block, brought over as it stands:
// same heading, same opening line, same three reasons, same drawn icons. At
// phone width the site stacks the three cards, so we stack them too, with the
// icon beside the words rather than above them to keep each card short.
export function PerfectMatch({ style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <DisplayTitle title="Why we're the perfect match" />
      <div style={{ padding: `0 ${PAD}px`, display: "grid", gap: 12 }}>
        {MATCH_CARDS.map((m) => (
          <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 14, background: W.card, borderRadius: 16, padding: "14px 16px", boxShadow: W.shadow }}>
            <img src={ART[m.icon]} alt="" aria-hidden="true" loading="lazy"
              style={{ width: 46, height: 46, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY, lineHeight: "22px", letterSpacing: "-0.2px" }}>{m.t}</p>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{m.s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// A row that opens a country. Photo left, name and one line, price right.
export function DestRow({ d, to }) {
  return (
    <Link to={to || `/destination/${encodeURIComponent(d.name)}`} style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none", padding: "9px 0" }}>
      <div style={{ position: "relative", width: 62, height: 62, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
        <Photo src={d.img} alt={d.name} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: C.head, letterSpacing: "-0.2px" }}>{d.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.blurb}</p>
      </div>
      <ChevronRight size={17} color={C.icon} style={{ flexShrink: 0, marginLeft: -4 }} />
    </Link>
  );
}

// Sunday School and everything under it. The live home's "All six countries"
// grid is left out: every variant now shows the six up top, so keeping it would
// say the same thing twice. No ground of its own, so the page stays one colour
// from the clip all the way down.
// Sub-sections under a group header step down a size, so the group reads as
// one block with three parts rather than four headings of equal weight.
const SUB_TITLE = { fontSize: 18, fontWeight: 700, color: NAVY };

export function LabLower({ top, afterSchool, travellers }) {
  const lessons = COMPARE_REELS.map((c) => ({ poster: c.poster, videoUrl: c.videoUrl, duration: c.duration, tag: `${c.a} vs ${c.b}`, topics: c.topics }));
  return (
    // Sits above a pinned hero, which is a positioned element and would
    // otherwise paint over everything below it.
    <div className="soft-rail" style={{ position: "relative", zIndex: 2, background: W.page }}>
      {/* The cards rest first, then the ground turns yellow over a long ramp,
          and it turns back the same way on the far side. The negative margin
          swallows Sunday School's own top gap. */}
      {top}
      <div style={{ height: BRIDGE + 1, marginBottom: -1, background: bridge(true) }} />
      <EduMultiCarousel flush valueTitle="Torn between [two]?" lessons={lessons} />
      <div style={{ height: BRIDGE + 1, marginTop: -1, background: bridge(false) }} />
      {/* One ground the whole way down. The blue and pink wash shifted colour
          across 1,200px of scroll and every card sat on a different shade of it,
          which is what read as the page changing. The clouds went with it: they
          only made sense against a sky. */}
      <div style={{ position: "relative", paddingTop: 6, background: W.page }}>
        {/* Optional. Sunday School is where a country gets chosen; what other
            travellers actually booked there is the next thing worth seeing. */}
        {travellers && <DisplayTitle title={travellers.title} sub={travellers.sub} style={{ marginTop: 28, marginBottom: 0 }} />}
        {afterSchool}
        {travellers ? (
          <>
            <TravellerMomentsReels kicker={null} {...travellers.moments} titleStyle={SUB_TITLE} />
            <LovedByCouples kicker={null} {...travellers.reviews} titleStyle={SUB_TITLE} />
          </>
        ) : (
          <>
            <TravellerMomentsReels />
            <LovedByCouples />
          </>
        )}
      </div>
      <LeadCloseCTA tone="clean" pad={PAD} />
      <div style={{ height: 80 }} />
    </div>
  );
}

// Page shell: warm scroll container, the variant's top, then the shared lower
// half. `overlay` sits outside the scroller so a sheet pins to the bottom of
// the phone rather than the bottom of a very long page.
export function LabPage({ children, overlay, lower = true, preSchool, afterSchool, travellers }) {
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div data-lab-scroll className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.page }}>
        {children}
        {lower && <LabLower top={preSchool} afterSchool={afterSchool} travellers={travellers} />}
      </div>
      {overlay}
    </div>
  );
}

// House bottom sheet: dimmed backdrop, white panel rising from the bottom edge.
export function LabSheet({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(48,28,20,0.44)", zIndex: 60, animation: "fadeInBg 0.2s ease-out" }}>
      <div onClick={(e) => e.stopPropagation()} className="animate-slide-up hide-scrollbar"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: W.card, borderRadius: "24px 24px 0 0", padding: `8px ${PAD}px 26px`, maxHeight: "78%", overflowY: "auto" }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: W.line, margin: "0 auto 14px" }} />
        <h3 style={{ margin: "0 0 12px", fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: NAVY }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
