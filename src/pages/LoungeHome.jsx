import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bookmark, Menu, Bell, ChevronRight, Plane, Plus } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { getDest, roomOrder, DESTINATIONS } from "../data/communityData";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, FeedPostCard, SectionHead, Toast } from "../components/Community/CommunityUI";
import { AskSheet } from "./CommunityFeed";
import LoungeMenu from "../components/Community/LoungeMenu";
import { RulesLink } from "../components/Community/RulesRowVariants";

// The whole Community, one level up from a room.
//
// Nobody lands here from the app: tapping Sunday Community opens the trip they
// are on. This is where the back arrow goes, so it is a browse screen rather
// than a hub, and it is ordered that way. Rooms first, because the room you
// are in is the likeliest tap. The mixed feed is underneath, for reading.

export default function LoungeHome() {
  const navigate = useNavigate();
  const {
    liveQuestionsFor, answersFor, reports, reportPost, unreadNotifications, canPostNow,
    likes, toggleLike, bookmarks, toggleBookmark,
  } = useCommunity();

  // The mixed feed pages in the same way a room does.
  const [ask, setAsk] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState(null);

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
        title="Sunday Community"
        onBack={() => navigate("/")}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Everything that happened to this traveller's posts. The count is
                the only nudge most of it gets, since almost none of it pushes. */}
            <button
              onClick={() => navigate("/community/notifications")}
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
            <button onClick={() => navigate("/community/search")} style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%",
              height: 46, padding: "0 13px", borderRadius: 12,
              background: CC.well, border: `1px solid ${CC.line}`,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <Search size={17} color={CC.soft} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 15, color: CC.soft }}>
                Search everything in the Community
              </span>
            </button>
          </div>

          {/* The rules used to be a word in the header, which is where things
              go to be ignored. A hairline shelf above the rooms is read on
              the way past, and gives up nothing to the rooms below it. */}
          <div style={{ padding: `0 ${PAD}px` }}>
            <RulesLink onClick={() => navigate("/community/thailand/guidelines")} />
          </div>

          {/* The two rooms this traveller can write in, as a groups list:
              a square photo, the name, and what is new in there. */}
          <SectionHead style={{ marginTop: 16 }}>Your Rooms</SectionHead>
          <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 4 }}>
            {live.map(id => (
              <RoomRow
                key={id} id={id}
                count={liveQuestionsFor(id).length}
                fresh={liveQuestionsFor(id).filter(q => (q.minsAgo ?? 0) <= 1440).length}
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

          <SectionHead>From Your Rooms</SectionHead>
          {/* One feed across every room, each post carrying its room's name,
              parted by the grey bar every feed uses. */}
          <div style={{ borderTop: `1px solid ${CC.line}` }}>
            {page.map(({ q, room }, i) => (
              <div key={`${room}-${q.id}`}>
                {i > 0 && <div style={{ height: 6, background: CC.well }} />}
                <FeedPostCard
                  q={q}
                  room={getDest(room).short || getDest(room).name}
                  answerCount={answersFor(q).length}
                  likeCount={(q.likes || 0) + (likes[q.id] ? 1 : 0)}
                  liked={!!likes[q.id]}
                  saved={!!bookmarks[q.id]}
                  onClick={() => navigate(`/community/${room}/q/${q.id}`)}
                  onLike={() => toggleLike(q.id)}
                  onSave={() => { toggleBookmark(q.id); setToast(bookmarks[q.id] ? "Removed from saved" : "Saved"); }}
                  onCopy={() => {
                    // A rejected clipboard write is silent otherwise, and an
                    // unhandled rejection in the console.
                    try { navigator.clipboard?.writeText(`${window.location.origin}/community/${room}/q/${q.id}`)?.catch(() => {}); } catch { /* noop */ }
                    setToast("Link copied");
                  }}
                  onReport={() => { reportPost(q.id, "Reported from the feed"); setToast("Reported. It is gone from your feed."); }}
                />
              </div>
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

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}

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

// A room in the groups list: a square photo, the name, and what is new. No
// card edge; the photo does the identifying, the way a groups list does it.
export function RoomRow({ id, count, fresh = 0, onOpen }) {
  const d = DESTINATIONS[id] || {};
  return (
    <button onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
      cursor: "pointer", fontFamily: "inherit", padding: "9px 0",
      background: "none", border: "none",
    }}>
      {d.hero ? (
        <span style={{
          width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0,
          background: CC.mist, display: "block",
        }}>
          <img src={d.hero} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }} />
        </span>
      ) : (
        <span style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: CC.tealTint, display: "grid", placeItems: "center",
        }}><Plane size={21} color={CC.teal} /></span>
      )}

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "block", fontSize: 15.5, fontWeight: 700, color: CC.ink,
          letterSpacing: "-0.1px",
        }}>
          {d.name}{d.month ? `, ${d.month}` : ""}
        </span>
        <span style={{ display: "block", marginTop: 3, fontSize: 12.5, color: CC.body }}>
          {fresh > 0 ? (
            <>
              <span style={{
                display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                background: CC.teal, marginRight: 6, verticalAlign: "1px",
              }} />
              {fresh} new {fresh === 1 ? "question" : "questions"}
            </>
          ) : `${count} questions`}
        </span>
      </span>
      <ChevronRight size={17} color={CC.soft} style={{ flexShrink: 0 }} />
    </button>
  );
}
