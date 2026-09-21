import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bookmark, Menu, Bell, ChevronRight, Plane, Plus } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { getDest, roomOrder, DESTINATIONS } from "../data/communityData";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, QuestionCard, SectionHead } from "../components/Community/CommunityUI";
import { AskSheet } from "./CommunityFeed";
import LoungeMenu from "../components/Community/LoungeMenu";
import { RulesLink } from "../components/Community/RulesRowVariants";

// The whole Lounge, one level up from a room.
//
// Nobody lands here from the app: tapping Sunday Lounge opens the trip they
// are on. This is where the back arrow goes, so it is a browse screen rather
// than a hub, and it is ordered that way. Rooms first, because the room you
// are in is the likeliest tap. The mixed feed is underneath, for reading.

export default function LoungeHome() {
  const navigate = useNavigate();
  const { liveQuestionsFor, answersFor, reports, unreadNotifications, canPostNow } = useCommunity();

  // The mixed feed pages in the same way a room does.
  const [ask, setAsk] = useState(false);
  const [menu, setMenu] = useState(false);

  const PAGE = 8;
  const [limit, setLimit] = useState(PAGE);
  const foot = useRef(null);

  const rooms = roomOrder();
  const live = rooms.filter(id => DESTINATIONS[id].booked);
  const shut = rooms.filter(id => !DESTINATIONS[id].booked);

  // Every room's questions in one list, newest first. Nothing new is stored on
  // a question to do this: it already knows which room it is in.
  const everything = rooms
    .flatMap(id => liveQuestionsFor(id).map(q => ({ q, room: id })))
    .filter(x => !reports[x.q.id])
    .sort((a, b) => (a.q.minsAgo ?? 0) - (b.q.minsAgo ?? 0));

  const page = everything.slice(0, limit);
  const more = everything.length > limit;

  useEffect(() => {
    const mark = foot.current;
    if (!mark || !more) return undefined;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setLimit(n => n + PAGE); },
      { rootMargin: "200px 0px" },
    );
    io.observe(mark);
    return () => io.disconnect();
  }, [more]);

  return (
    <Screen>
      <TopBar
        title="Sunday Lounge"
        onBack={() => navigate("/")}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Everything that happened to this traveller's posts. The count is
                the only nudge most of it gets, since almost none of it pushes. */}
            <button
              onClick={() => navigate("/lounge/notifications")}
              aria-label="Notifications"
              style={{
                position: "relative", width: 38, height: 38, borderRadius: "50%", border: "none",
                background: "none", cursor: "pointer", display: "grid", placeItems: "center",
              }}
            >
              <Bell size={17} color={CC.body} />
              {unreadNotifications > 0 && (
                <span style={{
                  position: "absolute", top: 5, right: 5, minWidth: 16, height: 16,
                  padding: "0 4px", borderRadius: 999, background: CC.pink,
                  display: "grid", placeItems: "center",
                  fontSize: 10, fontWeight: 800, color: "#fff",
                }}>{unreadNotifications}</span>
              )}
            </button>

            {/* Saved lives here, one level above the rooms, because a thread
                somebody saved in Thailand is still theirs after that room
                closes. */}
            <button
              onClick={() => navigate("/community/thailand/saved")}
              aria-label="Saved questions"
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "none",
                background: "none", cursor: "pointer", display: "grid", placeItems: "center",
              }}
            ><Bookmark size={17} color={CC.body} /></button>

            {/* Everything about the traveller rather than about the rooms:
                who they are, what reaches them, what they wrote. */}
            <button
              onClick={() => setMenu(true)}
              aria-label="Menu"
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "none",
                background: "none", cursor: "pointer", display: "grid", placeItems: "center",
              }}
            ><Menu size={19} color={CC.body} /></button>
          </div>
        }
      />

      <Body>
        <div style={{ padding: "14px 0 92px" }}>
          <div style={{ padding: `0 ${PAD}px 18px` }}>
            <button onClick={() => navigate("/lounge/search")} style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              height: 46, padding: "0 13px", borderRadius: 12,
              background: CC.well, border: `1px solid ${CC.line}`,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <Search size={17} color={CC.soft} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 15, color: CC.soft }}>
                Search everything in the Lounge
              </span>
            </button>
          </div>

          {/* The two rooms this traveller can write in keep full rows, with a
              coloured edge saying which kind each is. */}
          <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>

            {/* The rules used to be a word in the header, which is where things
                go to be ignored. A hairline shelf above the rooms is read on
                the way past, and gives up nothing to the rooms below it. */}
            <RulesLink onClick={() => navigate("/community/thailand/guidelines")} />

            {live.map(id => (
              <RoomRow
                key={id} id={id}
                count={liveQuestionsFor(id).length}
                onOpen={() => navigate(`/community/${id}`)}
              />
            ))}
          </div>

          {/* Everything else is a pill: a small mark and a name. They wrap, so
              three today and forty later both work, and every place gets the
              same amount of room. No padlocks: a room says it is read only once
              you are inside it. */}
          {shut.length > 0 && (
            <>
              <p style={{
                margin: `18px ${PAD}px 9px`, fontSize: 12.5, fontWeight: 700,
                color: CC.body,
              }}>Read about somewhere else</p>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8, padding: `0 ${PAD}px`,
              }}>
                {shut.map(id => (
                  <button key={id} onClick={() => navigate(`/community/${id}`)} style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "4px 13px 4px 4px", borderRadius: 999,
                    border: `1px solid ${CC.line}`, background: CC.white,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: "50%", overflow: "hidden",
                      background: CC.mist, flexShrink: 0, display: "block",
                    }}>
                      <img src={DESTINATIONS[id].hero} alt="" style={{
                        width: "100%", height: "100%", objectFit: "cover", display: "block",
                      }} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: CC.ink }}>
                      {DESTINATIONS[id].name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ height: 24 }} />

          <SectionHead>All Questions</SectionHead>
          <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
            {page.map(({ q, room }) => (
              <QuestionCard
                key={`${room}-${q.id}`} q={q}
                room={getDest(room).short || getDest(room).name}
                answerCount={answersFor(q).length}
                onClick={() => navigate(`/community/${room}/q/${q.id}`)}
              />
            ))}
          </div>

          <div ref={foot} style={{ height: 1 }} />
          <p style={{
            fontSize: 12.5, color: CC.soft, textAlign: "center", margin: `18px ${PAD}px 0`,
          }}>
            {more ? "Loading more" : `That is all ${everything.length} of them`}
          </p>
        </div>
      </Body>

      {/* The same action the rooms have, in the same corner, because somebody
          who came up here to look and did not find it still has a question. It
          goes when posting is off. */}
      {canPostNow && (
      <button
        onClick={() => setAsk(true)}
        style={{
          position: "absolute", right: 16,
          bottom: "calc(18px + env(safe-area-inset-bottom))", zIndex: 80,
          display: "inline-flex", alignItems: "center", gap: 8, minHeight: 52,
          padding: "0 22px", borderRadius: 999, border: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 15, fontWeight: 700,
          background: CC.pink, color: "#fff",
          boxShadow: "0 6px 20px rgba(253,1,79,0.28)",
        }}
      >
        <Plus size={18} /> Ask
      </button>
      )}

      {menu && (
        <LoungeMenu
          onClose={() => setMenu(false)}
          onGo={(to) => { setMenu(false); navigate(to); }}
        />
      )}

      {ask && (
        <AskSheet
          dest={live[0]}
          rooms={live.map(id => ({ id, name: DESTINATIONS[id].short || DESTINATIONS[id].name }))}
          onClose={() => setAsk(false)}
          onPosted={(q) => { setAsk(false); navigate(`/community/${q.dest}/q/${q.id}`); }}
        />
      )}
    </Screen>
  );
}

// A room says what it is and how much is in it. The edge colour says which
// kind it is without a word being spent on it.
export function RoomRow({ id, count, onOpen }) {
  const d = DESTINATIONS[id] || {};
  const trip = id !== "india";
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: "13px 14px",
      background: CC.white, borderRadius: 14, border: `1px solid ${CC.line}`,
      borderLeft: `3px solid ${trip ? CC.gold : CC.teal}`,
    }}>
      {d.hero ? (
        <span style={{
          width: 38, height: 38, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
          background: CC.mist, display: "block",
        }}>
          <img src={d.hero} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }} />
        </span>
      ) : (
        <span style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: CC.tealTint, display: "grid", placeItems: "center",
        }}><Plane size={18} color={CC.teal} /></span>
      )}

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: 15, fontWeight: 700, color: CC.ink,
          letterSpacing: "-0.1px",
        }}>
          {d.name}{d.month ? `, ${d.month}` : ""}
        </span>
        <span style={{ display: "block", marginTop: 3, fontSize: 12, color: CC.body }}>
          {count} questions
        </span>
      </span>
      <ChevronRight size={17} color={CC.soft} style={{ flexShrink: 0 }} />
    </button>
  );
}
