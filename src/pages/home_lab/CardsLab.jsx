import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { C } from "../../data";
import { LAB_SIX } from "../../data/homeLabData";
import { DISPLAY, NAVY, PAD, Photo, W } from "./labShared";

// Ten ways to show the six countries. Name only on every one: the price belongs
// on the country page, where there is room to say what it buys. Everything here
// scrolls down the page and nothing scrolls sideways.

const to = (d) => `/destination/${encodeURIComponent(d.name)}`;
// A warm black, so a name over a photo does not grey the picture down.
const SCRIM = "linear-gradient(180deg, rgba(42,22,14,0) 44%, rgba(42,22,14,0.72) 100%)";
const [BALI, MAURITIUS, MALDIVES, THAILAND, VIETNAM, NZ] = LAB_SIX;
// The first word of the blurb, as a quiet line above the name.
const kicker = (d) => d.blurb.split(",")[0];

// 1. Crew's own tile: photo fills, name sits on it, heights deliberately uneven
//    so the block reads as a wall rather than a grid.
const TILE_H = [206, 150, 178, 168, 196, 158];
function CrewTiles() {
  return (
    <div style={{ padding: `0 ${PAD}px`, columnCount: 2, columnGap: 12 }}>
      {LAB_SIX.map((d, i) => (
        <Link key={d.name} to={to(d)} style={{ display: "block", breakInside: "avoid", marginBottom: 12, height: TILE_H[i], borderRadius: 20, overflow: "hidden", position: "relative", textDecoration: "none", boxShadow: W.shadow }}>
          <Photo src={d.img} alt={d.name} />
          <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
          <p style={{ position: "absolute", left: 13, right: 13, bottom: 12, margin: 0, fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>{d.name}</p>
        </Link>
      ))}
    </div>
  );
}

// 2. Airbnb's plainest form: a rounded picture, the name as ordinary text under
//    it. No card, no border, no shadow. The page carries it.
function PlainCaption() {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 14px" }}>
      {LAB_SIX.map((d) => (
        <Link key={d.name} to={to(d)} style={{ textDecoration: "none" }}>
          <div style={{ position: "relative", height: 132, borderRadius: 16, overflow: "hidden" }}><Photo src={d.img} alt={d.name} /></div>
          <p style={{ margin: "9px 0 0", fontSize: 15, fontWeight: 700, color: NAVY }}>{d.name}</p>
        </Link>
      ))}
    </div>
  );
}

// 3. A polaroid: the photo inset inside a white card with the name written
//    across the bottom in the brand hand.
function Polaroid() {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
      {LAB_SIX.map((d) => (
        <Link key={d.name} to={to(d)} style={{ textDecoration: "none", background: W.card, borderRadius: 16, padding: 8, boxShadow: W.shadowLg }}>
          <div style={{ position: "relative", height: 116, borderRadius: 10, overflow: "hidden" }}><Photo src={d.img} alt={d.name} /></div>
          <p style={{ margin: "9px 0 6px", textAlign: "center", fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: NAVY, lineHeight: 1 }}>{d.name}</p>
        </Link>
      ))}
    </div>
  );
}

// 4. Wide bands, edge to edge, name written large across the picture. The most
//    cinematic, and the one that needs the most scrolling.
function Bands() {
  return (
    <div>
      {LAB_SIX.map((d) => (
        <Link key={d.name} to={to(d)} style={{ display: "block", position: "relative", height: 104, textDecoration: "none", marginBottom: 3 }}>
          <Photo src={d.img} alt={d.name} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(42,22,14,0.62) 0%, rgba(42,22,14,0.12) 70%)" }} />
          <p style={{ position: "absolute", left: PAD, top: "50%", transform: "translateY(-50%)", margin: 0, fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1, textShadow: "0 2px 14px rgba(0,0,0,0.5)" }}>{d.name}</p>
        </Link>
      ))}
    </div>
  );
}

// 5. Three across, two rows. The whole set lands in one block with no scrolling
//    at all, at the cost of small pictures.
function Compact() {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      {LAB_SIX.map((d) => (
        <Link key={d.name} to={to(d)} style={{ textDecoration: "none" }}>
          <div style={{ position: "relative", height: 96, borderRadius: 16, overflow: "hidden", boxShadow: W.shadow }}><Photo src={d.img} alt={d.name} /></div>
          <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 800, color: NAVY, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</p>
        </Link>
      ))}
    </div>
  );
}

// 6. The name leads and the picture follows. Type led, so the page reads like a
//    contents list rather than a gallery.
function TypeLed() {
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      {LAB_SIX.map((d, n) => (
        <Link key={d.name} to={to(d)} style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", padding: "13px 0", borderTop: n ? `1px solid ${W.line}` : "none" }}>
          <p style={{ flex: 1, minWidth: 0, margin: 0, fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: NAVY, lineHeight: 1 }}>{d.name}</p>
          <div style={{ position: "relative", width: 76, height: 56, borderRadius: 14, overflow: "hidden", flexShrink: 0, boxShadow: W.shadow }}>
            <Photo src={d.img} alt={d.name} />
          </div>
        </Link>
      ))}
    </div>
  );
}

// 7. An uneven mosaic: one tall, two small beside it, a pair, then a wide one to
//    close. A quiet line above each name says what the place is for.
function MosaicTile({ d, height, big }) {
  return (
    <Link to={to(d)} style={{ display: "block", position: "relative", height, borderRadius: 16, overflow: "hidden", textDecoration: "none" }}>
      <Photo src={d.img} alt={d.name} />
      <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
      <span style={{ position: "absolute", top: 9, right: 9, width: 26, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.24)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center" }}>
        <ArrowUpRight size={14} color="#fff" strokeWidth={2.6} />
      </span>
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 11 }}>
        {big && <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.82)" }}>{kicker(d)}</p>}
        <p style={{ margin: "1px 0 0", fontSize: big ? 18 : 14.5, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>{d.name}</p>
      </div>
    </Link>
  );
}
function Mosaic() {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><MosaicTile d={BALI} height={208} big /></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <MosaicTile d={MAURITIUS} height={98} />
          <MosaicTile d={MALDIVES} height={98} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><MosaicTile d={THAILAND} height={126} /></div>
        <div style={{ flex: 1 }}><MosaicTile d={VIETNAM} height={126} /></div>
      </div>
      <MosaicTile d={NZ} height={130} big />
    </div>
  );
}

// 8. Scapia's aeroplane window: a soft squircle with the shade pulled halfway
//    down. The shape does the talking, so the card needs nothing else on it.
function Windows() {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {LAB_SIX.map((d) => (
        <Link key={d.name} to={to(d)} style={{ display: "block", position: "relative", height: 190, borderRadius: 34, overflow: "hidden", textDecoration: "none", boxShadow: W.shadow, border: `3px solid ${W.card}` }}>
          <Photo src={d.img} alt={d.name} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 46, background: "linear-gradient(180deg, rgba(232,226,216,0.92) 0%, rgba(232,226,216,0) 100%)" }} />
          <span style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 36, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.9)" }} />
          <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
          <p style={{ position: "absolute", left: 12, right: 12, bottom: 13, margin: 0, textAlign: "center", fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>{d.name}</p>
        </Link>
      ))}
    </div>
  );
}

// 9. One leads, five follow. Gives the set a front page, which is useful when
//    one country really is the one most people start with.
function FeatureFirst() {
  const rest = LAB_SIX.slice(1);
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <Link to={to(BALI)} style={{ display: "block", position: "relative", height: 196, borderRadius: 22, overflow: "hidden", textDecoration: "none", boxShadow: W.shadow }}>
        <Photo src={BALI.img} alt={BALI.name} />
        <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}>{BALI.name}</p>
          <span style={{ width: 38, height: 38, borderRadius: 19, background: C.p600, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <ArrowRight size={17} color="#fff" strokeWidth={2.4} />
          </span>
        </div>
      </Link>
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {rest.map((d, n) => (
          <Link key={d.name} to={to(d)} style={{ display: "block", position: "relative", height: 112, borderRadius: 18, overflow: "hidden", textDecoration: "none", gridColumn: n === rest.length - 1 ? "span 2" : undefined, boxShadow: W.shadow }}>
            <Photo src={d.img} alt={d.name} />
            <div style={{ position: "absolute", inset: 0, background: SCRIM }} />
            <p style={{ position: "absolute", left: 12, bottom: 11, margin: 0, fontSize: 15, fontWeight: 800, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}>{d.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 10. Scapia's product card: white, photo inset with a margin all round, name on
//     its own row with the action beside it. The most app like of the ten.
function InsetCard() {
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
      {LAB_SIX.map((d) => (
        <Link key={d.name} to={to(d)} style={{ textDecoration: "none", background: W.card, borderRadius: 18, padding: 7, boxShadow: W.shadow, border: `1px solid ${W.line}` }}>
          <div style={{ position: "relative", height: 118, borderRadius: 13, overflow: "hidden" }}><Photo src={d.img} alt={d.name} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 5px 4px" }}>
            <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 14.5, fontWeight: 800, color: NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</p>
            <span style={{ width: 26, height: 26, borderRadius: 13, background: C.p100, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <ArrowRight size={14} color={C.p600} strokeWidth={2.5} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

const TAKES = [
  { n: 1, name: "Crew tiles", cost: "Crew's own wall. Uneven heights carry it, but every name sits on a darkened photo.", El: CrewTiles },
  { n: 2, name: "Plain caption", cost: "Airbnb's plainest form. Photos keep all their colour. Nothing but the picture says tap.", El: PlainCaption },
  { n: 3, name: "Polaroid", cost: "The most on brand, with the name in our own hand. The white border eats picture space.", El: Polaroid },
  { n: 4, name: "Wide bands", cost: "Biggest pictures and biggest names. Takes the most scrolling to get through six.", El: Bands },
  { n: 5, name: "Three across", cost: "All six land in one block with nothing hidden. The pictures get small.", El: Compact },
  { n: 6, name: "Name first", cost: "Reads as a contents list, which suits a set of six. The photos become thumbnails.", El: TypeLed },
  { n: 7, name: "Mosaic", cost: "Uneven sizes plus a line saying what each place is for. The smallest tiles are tight for a long name.", El: Mosaic },
  { n: 8, name: "Window cards", cost: "The shape says travel before a word is read. Borrowed closely enough that Scapia may show through.", El: Windows },
  { n: 9, name: "One leads", cost: "Gives the set a front page. Only right if one country really is where most people start.", El: FeatureFirst },
  { n: 10, name: "Inset card", cost: "The most app like, and the easiest to add a price or a badge to later. The least cinematic.", El: InsetCard },
];

export default function CardsLab() {
  return (
    <div data-lab-scroll className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.top }}>
      <div style={{ padding: `18px ${PAD}px 6px` }}>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.02 }}>Ten ways to show six</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.sub, lineHeight: "18px" }}>
          The same six countries, name only. Every one scrolls down, none sideways.
        </p>
      </div>

      {TAKES.map(({ n, name, cost, El }) => (
        <div key={n} style={{ marginTop: 30 }}>
          <div style={{ padding: `0 ${PAD}px 12px`, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.p600 }}>{n}</span>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: NAVY, letterSpacing: "-0.2px" }}>{name}</span>
          </div>
          <El />
          <p style={{ margin: `13px ${PAD}px 0`, fontSize: 12.5, color: C.sub, lineHeight: "17px" }}>{cost}</p>
        </div>
      ))}
      <div style={{ height: 90 }} />
    </div>
  );
}
