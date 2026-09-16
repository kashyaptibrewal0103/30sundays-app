import { ChevronRight, ChevronDown, Check, Plane } from "lucide-react";
import { CC } from "./tokens";
import { Sheet } from "../Gift/GiftUI";
import { getDest, roomOrder } from "../../data/communityData";

// The room name in the bar, and the sheet it opens.
//
// Back inside a room undoes the last step: somebody who opened Thailand from
// their trip goes back to their trip. That leaves the rest of the Lounge with
// no door, so the title becomes one. Tapping it lists every room, which is
// what people actually want when they leave a room, and a link to the Lounge
// itself underneath.



// Always reachable, from the top of every scroll position. Costs a tap target
// in the most expensive strip on the screen, and a title that no longer looks
// like a title.
export function SwitcherTitle({ label, onOpen }) {
  return (
    <button onClick={onOpen} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: 0, border: "none", background: "none", cursor: "pointer",
      fontFamily: "inherit", fontSize: 18, fontWeight: 600, color: CC.ink,
      letterSpacing: "-0.3px", maxWidth: "100%", minHeight: 40,
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <ChevronDown size={17} color={CC.soft} style={{ flexShrink: 0 }} />
    </button>
  );
}

export function SwitcherSheet({ current, onPick, onAll, onClose }) {
  const rooms = roomOrder();
  // The trip you booked and the rooms you are only reading are two different
  // things, so the list says so by where a room sits rather than by a badge on
  // it. Position keeps working when somebody has four trips; a badge does not.
  const mine = rooms.filter(id => booked(getDest(id)));
  const rest = rooms.filter(id => !booked(getDest(id)));

  const row = (id) => {
    const d = getDest(id);
    const here = id === current;
    return (
      <button key={id} onClick={() => (here ? onClose() : onPick(id))} style={{
        display: "flex", alignItems: "center", gap: 11, width: "100%",
        padding: "12px 2px", background: "none", border: "none",
        borderBottom: `1px solid ${CC.line}`, cursor: "pointer",
        fontFamily: "inherit", textAlign: "left",
      }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0, overflow: "hidden",
          background: CC.tealTint, display: "grid", placeItems: "center",
        }}>
          {d.everyone
            ? <Plane size={15} color={CC.teal} />
            : <img src={d.hero} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </span>
        {/* Names only. A month under every room said nothing about which room
            to open, and the room itself says it on arrival. */}
        <span style={{
          flex: 1, minWidth: 0,
          fontSize: 15, fontWeight: 700, color: here ? CC.tealInk : CC.ink,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{d.name}</span>
        {here && <Check size={17} color={CC.teal} style={{ flexShrink: 0 }} />}
      </button>
    );
  };

  return (
    <Sheet title="Switch Room" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Nobody with a trip yet gets one plain list. A heading over a group
            of none is worse than no heading at all. */}
        {mine.length > 0 && <Head>Where you are going</Head>}
        {mine.map(row)}
        {mine.length > 0 && <Head style={{ marginTop: 14 }}>Everywhere else</Head>}
        {rest.map(row)}

        <button onClick={onAll} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: "14px 2px 4px", background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          fontSize: 14.5, fontWeight: 700, color: CC.pink,
        }}>
          Sunday Lounge Home <ChevronRight size={16} color={CC.pink} />
        </button>
      </div>
    </Sheet>
  );
}

// A booked destination is a place this traveller is going. The room anybody
// can post in is not a destination, so it sits with the rest.
const booked = (d) => !!d.booked && !d.everyone;

function Head({ children, style }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 800, color: CC.soft, margin: "2px 0 4px", ...style,
    }}>{children}</p>
  );
}
