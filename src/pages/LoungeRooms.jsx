import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Search } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, QuestionCard, SectionHead } from "../components/Community/CommunityUI";
import { ROOM_VARIANTS } from "../components/Community/RoomListVariants";
import { getDest, roomOrder, questionsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";

// The rooms list, eight ways, each one sitting where it really sits: under the
// search field and above the questions. The whole point is what reaches the
// fold, so the screen is shown whole and the section is measured.

export default function LoungeRooms() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { answersFor } = useCommunity();

  const asked = params.get("s");
  const v = ROOM_VARIANTS.find(x => x.id === asked) || ROOM_VARIANTS[0];
  const [picked, setPicked] = useState(null);

  const rooms = roomOrder();
  const count = (id) => questionsFor(id).length;
  const first = questionsFor("thailand").slice(0, 2);

  return (
    <Screen>
      <TopBar
        title="Rooms list"
        sub={`${v.n} of ${ROOM_VARIANTS.length} · ${v.name}`}
        onBack={() => navigate("/lounge")}
      />

      <Body>
        <div style={{
          position: "sticky", top: 0, zIndex: 20, background: CC.white,
          borderBottom: `1px solid ${CC.line}`,
        }}>
          <div style={{
            display: "flex", gap: 6, padding: `10px ${PAD}px`, overflowX: "auto",
            scrollbarWidth: "none",
          }}>
            {ROOM_VARIANTS.map(s => (
              <button key={s.id} onClick={() => setParams({ s: s.id })} style={{
                flexShrink: 0, minHeight: 36, padding: "0 13px", borderRadius: 999,
                cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700,
                border: `1px solid ${v.id === s.id ? CC.ink : CC.line}`,
                background: v.id === s.id ? CC.ink : CC.white,
                color: v.id === s.id ? "#fff" : CC.body,
              }}>{s.n}. {s.name}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: `16px ${PAD}px 0` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%", background: CC.ink, color: "#fff",
              display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
            }}>{v.n}</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: CC.ink }}>{v.name}</span>
            <span style={{
              padding: "2px 8px", borderRadius: 999, background: CC.goldTint,
              border: `1px solid ${CC.goldLine}`, fontSize: 10.5, fontWeight: 700, color: CC.goldInk,
            }}>{v.tag}</span>
          </div>
          <p style={{ fontSize: 13, color: CC.body, margin: "8px 0 0", lineHeight: "19px" }}>{v.note}</p>
          <p style={{ fontSize: 13, color: CC.soft, margin: "6px 0 0", lineHeight: "19px" }}>
            What it costs: {v.cost}
          </p>
        </div>

        <div style={{ height: 6, background: CC.well, margin: "18px 0 0" }} />

        {/* The real screen, in the real order, so what reaches the fold is
            what would really reach it. */}
        <div style={{ padding: "14px 0 0" }}>
          <div style={{ padding: `0 ${PAD}px 18px` }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              height: 46, padding: "0 13px", borderRadius: 12,
              background: CC.well, border: `1px solid ${CC.line}`,
            }}>
              <Search size={17} color={CC.soft} />
              <span style={{ fontSize: 15, color: CC.soft }}>Search everything in the Lounge</span>
            </div>
          </div>

          <SectionHead>Rooms</SectionHead>
          <Measured>
            <v.Comp rooms={rooms} count={count} onOpen={(id) => navigate(`/community/${id}`)} />
          </Measured>

          <div style={{ height: 22 }} />
          <SectionHead>All questions</SectionHead>
          <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
            {first.map(q => (
              <QuestionCard
                key={q.id} q={q} room="Thailand"
                answerCount={answersFor(q).length}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: `18px ${PAD}px 40px` }}>
          <button onClick={() => setPicked(v.id)} style={{
            width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer",
            fontFamily: "inherit", fontSize: 14, fontWeight: 700,
            border: `1px solid ${picked === v.id ? CC.pink : CC.line}`,
            background: picked === v.id ? CC.pinkTint : CC.white,
            color: picked === v.id ? CC.pinkInk : CC.ink,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            {picked === v.id ? <><Check size={16} /> Picked {v.name}</> : `Pick ${v.name}`}
          </button>
        </div>
      </Body>
    </Screen>
  );
}

// How tall the section is, and where the fold lands, because the ask was that
// search, rooms and the first question all reach one screen.
function Measured({ children }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setH(Math.round(el.getBoundingClientRect().height));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div ref={ref}>{children}</div>
      <p style={{
        display: "flex", alignItems: "center", gap: 8,
        margin: `10px ${PAD}px 0`, fontSize: 11, color: CC.soft,
      }}>
        <span style={{ flex: 1, height: 1, background: CC.line }} />
        <span style={{ fontWeight: 700, color: CC.ink }}>{h}px</span>
        <span style={{ flex: 1, height: 1, background: CC.line }} />
      </p>
    </>
  );
}
