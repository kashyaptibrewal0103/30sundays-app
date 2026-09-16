import { useState } from "react";
import {
  ChevronRight, ChevronDown, Lock, Plane, MapPin, BookOpen,
} from "lucide-react";
import { CC } from "./tokens";
import { PAD } from "./CommunityUI";
import { DESTINATIONS } from "../../data/communityData";

// Eight ways to list the rooms.
//
// The list has three kinds of thing in it and today they all arrive as the
// same white card, so nothing tells you which one is yours:
//   1. The trip you are on. One room. The reason you opened the app.
//   2. Travelling from India. Applies whatever you booked, never expires.
//   3. Destinations you have not booked. Readable, not writable, and there
//      will be forty of these one day, not three.
//
// Every option below separates those three, adds a mark so the list is not a
// wall of type, and is measured, because all three sections plus the first
// question have to fit on one screen.

const ROW = {
  display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left",
  cursor: "pointer", fontFamily: "inherit", background: CC.white,
};
const wrap = { padding: `0 ${PAD}px` };

const heroOf = (id) => (DESTINATIONS[id] || {}).hero;
const nameOf = (d) => `${d.name}${d.month ? `, ${d.month}` : ""}`;

function Group({ children, label }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <p style={{
          margin: `0 ${PAD}px 7px`, fontSize: 11, fontWeight: 800, letterSpacing: "0.9px",
          color: CC.soft, textTransform: "uppercase",
        }}>{label}</p>
      )}
      {children}
    </div>
  );
}

// A round photo for a destination, a drawn mark for the room that has no
// place attached to it.
function Mark({ id, size = 38, dim }) {
  const hero = heroOf(id);
  if (!hero) {
    return (
      <span style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: CC.tealTint, display: "grid", placeItems: "center",
      }}><Plane size={size * 0.46} color={CC.teal} /></span>
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
      background: CC.mist, display: "block",
    }}>
      <img src={hero} alt="" style={{
        width: "100%", height: "100%", objectFit: "cover", display: "block",
        filter: dim ? "grayscale(1)" : "none", opacity: dim ? 0.55 : 1,
      }} />
    </span>
  );
}

function Count({ n, shut }) {
  return (
    <span style={{
      display: "flex", alignItems: "center", gap: 5, marginTop: 3,
      fontSize: 12, color: shut ? CC.soft : CC.body,
    }}>
      {shut && <Lock size={11} color={CC.soft} />}
      {shut ? "Read only until you book" : `${n} questions`}
    </span>
  );
}

/* ══════ 1. Three labelled groups ══════ */

function Labelled({ rooms, count, onOpen }) {
  const mine = rooms.filter(id => DESTINATIONS[id].booked && id !== "india");
  const shut = rooms.filter(id => !DESTINATIONS[id].booked);
  const card = {
    ...ROW, padding: "13px 14px", borderRadius: 14, border: `1px solid ${CC.line}`,
  };
  return (
    <>
      <Group label="Your trip">
        <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 8 }}>
          {mine.map(id => (
            <button key={id} style={card} onClick={() => onOpen(id)}>
              <Mark id={id} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
                  {nameOf(DESTINATIONS[id])}
                </span>
                <Count n={count(id)} />
              </span>
              <ChevronRight size={17} color={CC.soft} />
            </button>
          ))}
        </div>
      </Group>

      <Group label="Whatever you booked">
        <div style={wrap}>
          <button style={card} onClick={() => onOpen("india")}>
            <Mark id="india" />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
                Travelling from India
              </span>
              <Count n={count("india")} />
            </span>
            <ChevronRight size={17} color={CC.soft} />
          </button>
        </div>
      </Group>

      <Group label="Open to read">
        <div style={wrap}>
          {shut.map((id, i) => (
            <button key={id} onClick={() => onOpen(id)} style={{
              ...ROW, padding: "10px 0", background: "none",
              borderBottom: i < shut.length - 1 ? `1px solid ${CC.line}` : "none", border: "none",
            }}>
              <Mark id={id} size={28} dim />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: CC.body }}>
                {nameOf(DESTINATIONS[id])}
              </span>
              <Lock size={12} color={CC.soft} />
            </button>
          ))}
        </div>
      </Group>
    </>
  );
}

/* ══════ 2. One hero, then the rest ══════ */

function HeroFirst({ rooms, count, onOpen }) {
  const mine = rooms.find(id => DESTINATIONS[id].booked && id !== "india");
  const shut = rooms.filter(id => !DESTINATIONS[id].booked);
  const d = DESTINATIONS[mine];
  return (
    <>
      <div style={{ ...wrap, marginBottom: 10 }}>
        <button onClick={() => onOpen(mine)} style={{
          display: "block", width: "100%", textAlign: "left", cursor: "pointer",
          fontFamily: "inherit", padding: 0, border: "none", borderRadius: 16,
          overflow: "hidden", background: CC.white, position: "relative",
        }}>
          <img src={heroOf(mine)} alt="" style={{
            width: "100%", height: 104, objectFit: "cover", display: "block",
          }} />
          <span style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.62) 100%)",
          }} />
          <span style={{
            position: "absolute", left: 14, right: 14, bottom: 11,
            display: "flex", alignItems: "flex-end", gap: 10,
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: "#fff" }}>
                {nameOf(d)}
              </span>
              <span style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                {count(mine)} questions
              </span>
            </span>
            <ChevronRight size={18} color="#fff" />
          </span>
        </button>
      </div>

      <div style={{ ...wrap, marginBottom: 12 }}>
        <button onClick={() => onOpen("india")} style={{
          ...ROW, padding: "12px 14px", borderRadius: 14,
          border: `1px solid ${CC.tealLine}`, background: CC.tealTint,
        }}>
          <BookOpen size={18} color={CC.teal} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
              Travelling from India
            </span>
            <span style={{ display: "block", fontSize: 12, color: CC.tealInk, marginTop: 2 }}>
              Visas, passports, money. {count("india")} questions
            </span>
          </span>
          <ChevronRight size={17} color={CC.tealInk} />
        </button>
      </div>

      <ShutList rooms={shut} onOpen={onOpen} />
    </>
  );
}

// The quiet tail every option that does not group them shares.
function ShutList({ rooms, onOpen }) {
  return (
    <div style={wrap}>
      <p style={{
        margin: "0 0 4px", fontSize: 11, fontWeight: 800, letterSpacing: "0.9px",
        color: CC.soft, textTransform: "uppercase",
      }}>Open to read</p>
      {rooms.map((id, i) => (
        <button key={id} onClick={() => onOpen(id)} style={{
          ...ROW, padding: "9px 0", background: "none", border: "none",
          borderBottom: i < rooms.length - 1 ? `1px solid ${CC.line}` : "none",
        }}>
          <Mark id={id} size={26} dim />
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: CC.body }}>
            {nameOf(DESTINATIONS[id])}
          </span>
          <Lock size={12} color={CC.soft} />
        </button>
      ))}
    </div>
  );
}

/* ══════ 3. Photo circles, one list, weight does the sorting ══════ */

function Weighted({ rooms, count, onOpen }) {
  return (
    <div style={{ ...wrap, display: "flex", flexDirection: "column" }}>
      {rooms.map((id, i) => {
        const d = DESTINATIONS[id];
        const shut = !d.booked;
        const first = i === 0;
        return (
          <button key={id} onClick={() => onOpen(id)} style={{
            ...ROW, background: "none", border: "none",
            padding: first ? "14px 0" : shut ? "9px 0" : "12px 0",
            borderBottom: i < rooms.length - 1 ? `1px solid ${CC.line}` : "none",
          }}>
            <Mark id={id} size={first ? 44 : shut ? 26 : 34} dim={shut} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: "block",
                fontSize: first ? 16 : shut ? 13.5 : 14.5,
                fontWeight: shut ? 600 : 700,
                color: shut ? CC.body : CC.ink,
                letterSpacing: first ? "-0.2px" : 0,
              }}>{nameOf(d)}</span>
              {!shut && <Count n={count(id)} />}
            </span>
            {shut ? <Lock size={12} color={CC.soft} /> : <ChevronRight size={17} color={CC.soft} />}
          </button>
        );
      })}
    </div>
  );
}

/* ══════ 4. The locked ones fold away ══════ */

function Folded({ rooms, count, onOpen }) {
  const [open, setOpen] = useState(false);
  const live = rooms.filter(id => DESTINATIONS[id].booked);
  const shut = rooms.filter(id => !DESTINATIONS[id].booked);
  return (
    <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 8 }}>
      {live.map(id => {
        const d = DESTINATIONS[id];
        const trip = id !== "india";
        return (
          <button key={id} onClick={() => onOpen(id)} style={{
            ...ROW, padding: "13px 14px", borderRadius: 14,
            border: `1px solid ${trip ? CC.bubbleEdge : CC.line}`,
            background: trip ? CC.bubbleLight : CC.white,
          }}>
            <Mark id={id} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
                {nameOf(d)}
              </span>
              <Count n={count(id)} />
            </span>
            <ChevronRight size={17} color={CC.soft} />
          </button>
        );
      })}

      <button onClick={() => setOpen(v => !v)} style={{
        ...ROW, padding: "11px 14px", borderRadius: 14, border: `1px dashed ${CC.line}`,
        background: "none",
      }}>
        <Lock size={15} color={CC.soft} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: CC.body }}>
          {shut.length} more destinations to read
        </span>
        {open
          ? <ChevronDown size={16} color={CC.soft} />
          : <ChevronRight size={16} color={CC.soft} />}
      </button>

      {open && (
        <div style={{ padding: "0 2px" }}>
          {shut.map((id, i) => (
            <button key={id} onClick={() => onOpen(id)} style={{
              ...ROW, padding: "9px 0", background: "none", border: "none",
              borderBottom: i < shut.length - 1 ? `1px solid ${CC.line}` : "none",
            }}>
              <Mark id={id} size={26} dim />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: CC.body }}>
                {nameOf(DESTINATIONS[id])}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════ 5. Locked ones become a rail ══════ */

function Rail({ rooms, count, onOpen }) {
  const live = rooms.filter(id => DESTINATIONS[id].booked);
  const shut = rooms.filter(id => !DESTINATIONS[id].booked);
  return (
    <>
      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {live.map(id => {
          const d = DESTINATIONS[id];
          const trip = id !== "india";
          return (
            <button key={id} onClick={() => onOpen(id)} style={{
              ...ROW, padding: "13px 14px", borderRadius: 14, border: `1px solid ${CC.line}`,
              borderLeft: `3px solid ${trip ? CC.gold : CC.teal}`,
            }}>
              <Mark id={id} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
                  {nameOf(d)}
                </span>
                <Count n={count(id)} />
              </span>
              <ChevronRight size={17} color={CC.soft} />
            </button>
          );
        })}
      </div>

      <p style={{
        margin: `0 ${PAD}px 8px`, fontSize: 11, fontWeight: 800, letterSpacing: "0.9px",
        color: CC.soft, textTransform: "uppercase",
      }}>Read about anywhere else</p>
      <div style={{
        display: "flex", gap: 9, overflowX: "auto", scrollbarWidth: "none",
        padding: `0 ${PAD}px`, scrollSnapType: "x mandatory",
      }}>
        {shut.map(id => (
          <button key={id} onClick={() => onOpen(id)} style={{
            flexShrink: 0, width: 108, padding: 0, border: "none", background: "none",
            cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            scrollSnapAlign: "start",
          }}>
            <span style={{
              display: "block", width: "100%", height: 66, borderRadius: 12,
              overflow: "hidden", background: CC.mist, position: "relative",
            }}>
              <img src={heroOf(id)} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }} />
              <span style={{
                position: "absolute", top: 6, right: 6, width: 20, height: 20,
                borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                display: "grid", placeItems: "center",
              }}><Lock size={10} color={CC.body} /></span>
            </span>
            <span style={{
              display: "block", marginTop: 6, fontSize: 12.5, fontWeight: 700, color: CC.ink,
            }}>{DESTINATIONS[id].name}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ══════ 6. No photos, marks only ══════ */

function Marks({ rooms, count, onOpen }) {
  const tile = (bg, Icon, col) => (
    <span style={{
      width: 36, height: 36, borderRadius: 11, background: bg, flexShrink: 0,
      display: "grid", placeItems: "center",
    }}><Icon size={17} color={col} /></span>
  );
  return (
    <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 8 }}>
      {rooms.map(id => {
        const d = DESTINATIONS[id];
        const shut = !d.booked;
        const trip = d.booked && id !== "india";
        return (
          <button key={id} onClick={() => onOpen(id)} style={{
            ...ROW, padding: shut ? "10px 14px" : "13px 14px", borderRadius: 14,
            border: `1px solid ${shut ? "transparent" : CC.line}`,
            background: shut ? CC.well : CC.white,
          }}>
            {trip
              ? tile(CC.goldTint, MapPin, CC.gold)
              : shut
                ? tile(CC.line, Lock, CC.soft)
                : tile(CC.tealTint, Plane, CC.teal)}
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: "block", fontSize: shut ? 13.5 : 15,
                fontWeight: shut ? 600 : 700, color: shut ? CC.body : CC.ink,
              }}>{nameOf(d)}</span>
              {!shut && <Count n={count(id)} />}
            </span>
            <ChevronRight size={16} color={CC.soft} />
          </button>
        );
      })}
    </div>
  );
}

/* ══════ 7. Locked ones as a grid ══════ */

function Grid({ rooms, count, onOpen }) {
  const live = rooms.filter(id => DESTINATIONS[id].booked);
  const shut = rooms.filter(id => !DESTINATIONS[id].booked);
  return (
    <>
      <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {live.map(id => {
          const d = DESTINATIONS[id];
          return (
            <button key={id} onClick={() => onOpen(id)} style={{
              ...ROW, padding: "13px 14px", borderRadius: 14, border: `1px solid ${CC.line}`,
            }}>
              <Mark id={id} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
                  {nameOf(d)}
                </span>
                <Count n={count(id)} />
              </span>
              <ChevronRight size={17} color={CC.soft} />
            </button>
          );
        })}
      </div>

      <p style={{
        margin: `0 ${PAD}px 8px`, fontSize: 11, fontWeight: 800, letterSpacing: "0.9px",
        color: CC.soft, textTransform: "uppercase",
      }}>Open to read</p>
      <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {shut.map(id => (
          <button key={id} onClick={() => onOpen(id)} style={{
            padding: 0, border: "none", background: "none", cursor: "pointer",
            fontFamily: "inherit", textAlign: "center",
          }}>
            <span style={{
              display: "block", width: "100%", aspectRatio: "1 / 1", borderRadius: 12,
              overflow: "hidden", background: CC.mist,
            }}>
              <img src={heroOf(id)} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                filter: "grayscale(0.5)",
              }} />
            </span>
            <span style={{
              display: "block", marginTop: 6, fontSize: 12, fontWeight: 700, color: CC.body,
            }}>{DESTINATIONS[id].name}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ══════ 8. One container, dividers inside ══════ */

function Boxed({ rooms, count, onOpen }) {
  const live = rooms.filter(id => DESTINATIONS[id].booked);
  const shut = rooms.filter(id => !DESTINATIONS[id].booked);
  return (
    <div style={wrap}>
      <div style={{
        border: `1px solid ${CC.line}`, borderRadius: 16, overflow: "hidden", background: CC.white,
      }}>
        {live.map((id, i) => {
          const d = DESTINATIONS[id];
          return (
            <button key={id} onClick={() => onOpen(id)} style={{
              ...ROW, padding: "13px 14px", border: "none",
              borderBottom: `1px solid ${CC.line}`,
              background: i === 0 ? CC.bubbleLight : CC.white,
            }}>
              <Mark id={id} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
                  {nameOf(d)}
                </span>
                <Count n={count(id)} />
              </span>
              <ChevronRight size={17} color={CC.soft} />
            </button>
          );
        })}

        <div style={{ background: CC.well, padding: "8px 14px 10px" }}>
          <p style={{
            margin: "0 0 4px", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.9px",
            color: CC.soft, textTransform: "uppercase",
          }}>Open to read</p>
          {shut.map((id, i) => (
            <button key={id} onClick={() => onOpen(id)} style={{
              ...ROW, padding: "7px 0", background: "none", border: "none",
              borderBottom: i < shut.length - 1 ? `1px solid ${CC.mistLine}` : "none",
            }}>
              <Mark id={id} size={24} dim />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: CC.body }}>
                {nameOf(DESTINATIONS[id])}
              </span>
              <Lock size={11} color={CC.soft} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ROOM_VARIANTS = [
  {
    id: "labelled", n: 1, name: "Three labelled groups", tag: "says it out loud", Comp: Labelled,
    note: "Your trip, Whatever you booked, Open to read. The three kinds are named rather than implied, and the locked ones drop to a thin list with a small grey photo.",
    cost: "Three headings is three lines of chrome before any room. It is the clearest and also the tallest.",
  },
  {
    id: "hero", n: 2, name: "One hero, then the rest", tag: "your trip is the picture", Comp: HeroFirst,
    note: "Your destination gets a photo banner with its name over it. Travelling from India is a lagoon row underneath, and the locked ones are a quiet list at the foot.",
    cost: "A 104px banner is the biggest thing on the screen, and it pushes the questions further down than any other option.",
  },
  {
    id: "weighted", n: 3, name: "One list, three weights", tag: "no headings at all", Comp: Weighted,
    note: "A single list on hairlines. Your trip has a 44px photo and 16px type, India sits in the middle, the locked ones are small and grey. Nothing is labelled because the size says it.",
    cost: "Weight alone is a hint, not a statement. Somebody who does not notice the sizes reads it as one flat list.",
  },
  {
    id: "folded", n: 4, name: "The locked ones fold away", tag: "shortest", Comp: Folded,
    note: "Two real rows, then one dashed row saying how many more there are to read. Your trip carries the warm ground. Everything else is one tap away.",
    cost: "Hidden rooms do not get browsed. If reading other destinations is how people decide where to go next, this is the option that stops it.",
  },
  {
    id: "rail", n: 5, name: "Locked ones as a rail", tag: "browsable", Comp: Rail,
    note: "The two rooms you can write in keep full rows with a coloured edge. Everything else becomes a horizontal rail of photos, which is where forty destinations will actually fit.",
    cost: "A rail of pretty photos next to a locked padlock is an advert. It is the right shape and the wrong tone if it is not meant to sell.",
  },
  {
    id: "marks", n: 6, name: "Marks, not photos", tag: "no images", Comp: Marks,
    note: "A pin for your trip, a plane for the India room, a padlock for the rest, each in its own tinted tile. The locked rows sit on grey with no border at all.",
    cost: "Loses the one thing photos were bringing, which is a reason to look at a destination you have not booked.",
  },
  {
    id: "grid", n: 7, name: "Locked ones as a grid", tag: "most on screen", Comp: Grid,
    note: "Two full rows, then the rest as a three across grid of square photos. Nine destinations would fit in the space three rows take.",
    cost: "A square with a name under it cannot say the month or the question count, so the grid tells you less about each one.",
  },
  {
    id: "boxed", n: 8, name: "One box, quiet tail", tag: "tidiest", Comp: Boxed,
    note: "Everything inside a single bordered container. Your trip is the warm row at the top, then India, then the locked ones on a grey shelf inside the same box.",
    cost: "One container makes the three kinds look like one thing with sections, which is the opposite of the separation you asked for.",
  },
];
