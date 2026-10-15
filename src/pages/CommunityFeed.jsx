import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Users, Search, Bookmark, MessagesSquare, MessageCircleQuestion, Lock, ImagePlus,
  ArrowLeft, ChevronDown, Eye, SlidersHorizontal,
} from "lucide-react";
// Community has its own palette, in tokens.
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import {
  getDest, tagsFor, track, canPost, tagForPost, membersOf, ME, GUIDELINES,
} from "../data/communityData";
import { Screen, Body, TopBar, Primary, Secondary, Sheet, Field, Input, Textarea } from "../components/Gift/GiftUI";
import {
  PAD, FeedPostCard, Toast, SectionHead, Hero, TravellerMark,
} from "../components/Community/CommunityUI";
import { customerPhotos } from "../data";
import { GuidelinesNote, GuidelinesPointer } from "../components/Community/GuidelinesNote";
import { sortQuestions } from "../components/Community/FeedFilters";
import { SortFilterSheet } from "../components/Community/SortFilterVariants";
import { HelpComposer } from "../components/Community/HelpVariants";
import { AnswerSheet, ImageAttach, FailedNote } from "../components/Community/PostSheets";
import { PendingEdge } from "../components/Community/PendingVariants";
import {
  PausedScreen, PausedMarker, PausedSheetBody, AppealBody, AppealSent,
} from "../components/Community/PausedVariants";
import { ComposeRules, ConsentNote } from "../components/Community/FirstPost";
import { EditSheet } from "./CommunityQuestion";
import { useDwell } from "../components/Community/useDwell";
import { SwitcherTitle, SwitcherSheet } from "../components/Community/RoomSwitcher";

// The Q&A feed is where Community starts, shaped like a group page everyone
// already knows: cover, name, who is in it, a write box, then the questions.

// Five of the room's own travellers' photographs, spread across the whole set
// so the same couple does not fill every frame.
function coverCollage(d) {
  const shots = customerPhotos[d.name] || [];
  if (shots.length < 5) return null;
  return [0, 1, 2, 3, 4].map((i) => shots[Math.round((i * (shots.length - 1)) / 4)]);
}

export default function CommunityFeed() {
  const { dest = "bali" } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const view = params.get("state");

  // Where the room was entered from. Back undoes the last step: somebody who
  // came from their trip goes back to their trip, never to a screen they have
  // not seen. The way on to the rest of the Community is the title instead.
  const from = params.get("from");
  const [switcher, setSwitcher] = useState(false);

  const {
    liveQuestionsFor, pendingFor, answersFor,
    rulesSeen, seeRules, helpSeen, seeHelp, reports, reportPost,
    posting, canPostNow, pausedSeen, seePausedScreen, appeal,
    likes, toggleLike, bookmarks, toggleBookmark,
    editQuestion, deleteQuestion,
  } = useCommunity();
  // A post of this traveller's that is being checked, or held, or refused.
  // Both icons work throughout: an edit restarts the check on the new words.
  const [editingPending, setEditingPending] = useState(null);
  // Posting paused is an account state, so it shows in every room. In full the
  // first time, then a marker.
  const [pausedSheet, setPausedSheet] = useState(null);   // "why" | "appeal" | "sent"
  const [appealText, setAppealText] = useState("");
  const [ask, setAsk] = useState(false);
  // Questions is the room. About is a panel over it, and Rules is a screen of
  // its own, so only these two are state.
  const [tab, setTab] = useState("questions");
  const [filters, setFilters] = useState(false);
  const [toast, setToast] = useState(null);
  // Shown once, the moment the rules note is closed, so the rules are never
  // just gone.
  const [pointAtRules, setPointAtRules] = useState(false);

  // The list pages in as it is scrolled rather than rendering the whole
  // catalogue at once. A sentinel under the last card asks for the next page.
  const PAGE = 8;
  const [limit, setLimit] = useState(PAGE);
  const foot = useRef(null);

  const [sort, setSort] = useState("top");
  const [tag, setTag] = useState(null);
  const [helpWith, setHelpWith] = useState(null);   // the question being answered

  const d = getDest(dest);
  const all = liveQuestionsFor(dest);
  const pending = pendingFor(dest);
  // Reported posts leave the reporter's own feed, and nobody else's.
  const visible = all.filter(q => !reports[q.id]);
  const byTag = tag ? visible.filter(q => (q.tags || []).includes(tag)) : visible;
  const questions = view === "empty" ? [] : sortQuestions(byTag, sort, answersFor, (q) => (likes[q.id] ? 1 : 0) + (q.likes || 0));
  const page = questions.slice(0, limit);
  const more = questions.length > limit;

  // The oldest question nobody has answered, which is the one most in need.
  const tagCounts = tagsFor(dest).reduce((m, t) => ({
    ...m, [t]: visible.filter(q => (q.tags || []).includes(t)).length,
  }), {});

  const needsHelp = [...visible]
    .filter(q => answersFor(q).length === 0 && !q.mine)
    .sort((a, b) => (b.minsAgo ?? 0) - (a.minsAgo ?? 0))[0];
  const loading = view === "loading";
  const writable = canPost(dest);
  const backTo = from === "trip" && d.tripId ? `/trips/${d.tripId}` : "/community";

  // One pair per room view. The close carries how long it was open and how far
  // it was read, which is the only honest way to measure reading.
  useDwell(
    "room",
    { dest, roomType: d.everyone ? "general" : "destination", readOnly: !writable, source: from || "direct" },
    () => ({ cardsSeen: Math.min(limit, questions.length), questionCount: questions.length }),
  );

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
      {/* General Queries has no photo of its own, so it keeps the plain bar.
          The name is still the way out to the rest of the Community. */}
      {d.everyone && (
        <TopBar
          title={<SwitcherTitle label={d.name} onOpen={() => setSwitcher(true)} />}
          onBack={() => navigate(backTo)}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button
                onClick={() => navigate(`/community/${dest}/search`)}
                aria-label={`Search ${d.name}`}
                style={{
                  width: 38, height: 38, borderRadius: "50%", border: "none",
                  background: "none", cursor: "pointer", display: "grid", placeItems: "center",
                }}
              ><Search size={18} color={CC.body} /></button>
              <button
                onClick={() => navigate(`/community/${dest}/saved`)}
                aria-label="Saved questions"
                style={{
                  width: 38, height: 38, borderRadius: "50%", border: "none",
                  background: "none", cursor: "pointer", display: "grid", placeItems: "center",
                }}
              ><Bookmark size={17} color={CC.body} /></button>
            </div>
          }
        />
      )}

      {/* A destination room has no bar at all. Back, search and saved float
          over the cover on frosted circles, and stay put as the feed scrolls
          under them, which is how every photo-led screen in the app behaves. */}
      {!d.everyone && !loading && (
        <div style={{
          position: "absolute", top: 10, left: 10, right: 10, zIndex: 60,
          display: "flex", justifyContent: "space-between",
        }}>
          <FloatIcon label="Back" onClick={() => navigate(backTo)}>
            <ArrowLeft size={18} color="#fff" />
          </FloatIcon>
          <div style={{ display: "flex", gap: 8 }}>
            <FloatIcon label={`Search ${d.name}`} onClick={() => navigate(`/community/${dest}/search`)}>
              <Search size={17} color="#fff" />
            </FloatIcon>
            <FloatIcon label="Saved questions" onClick={() => navigate(`/community/${dest}/saved`)}>
              <Bookmark size={16} color="#fff" />
            </FloatIcon>
          </div>
        </div>
      )}

      <Body>
        {loading ? <FeedSkeleton /> : (
          <div style={{ padding: "0 0 92px" }}>
            {/* The cover says where you are before a word is read. Under it,
                the name, then who is in here, which is everything the old
                cohort card said without a card. */}
            {/* Everything the room is sits on its own photo: the name, who is
                going, and their faces. The scrim underneath keeps it legible
                on any picture. */}
            {!d.everyone && (
              <Hero
                image={d.hero}
                images={coverCollage(d)}
                height={210}
                title={
                  <button onClick={() => setSwitcher(true)} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    border: "none", background: "none", cursor: "pointer",
                    fontFamily: "inherit", padding: 0, textAlign: "left",
                    font: "inherit", color: "inherit", letterSpacing: "inherit",
                  }}>
                    {d.name} Community
                    <ChevronDown size={18} color="rgba(255,255,255,0.85)" style={{ flexShrink: 0 }} />
                  </button>
                }
                sub={metaLine(d)}
              />
            )}

            <RoomTabs
              tab={tab}
              onTab={(t) => {
                setTab(t);
                track("community_room_tab", { dest, tab: t });
                // The rules used to be a screen of their own, and this is
                // still the number that says whether anybody reads them.
                if (t === "rules") track("community_guidelines_opened", { dest, source: "tab" });
              }}
            />

            {tab === "about" ? (
              <AboutPanel d={d} members={membersOf(dest)} />
            ) : tab === "rules" ? (
              <RulesPanel />
            ) : (
              <>
                {!writable && (
                  <ReadOnlyNote />
                )}

                {/* A cancelled booking reads nothing like three blocked posts, so
                    it never borrows that copy. No reason is given, and none is
                    needed: they know why. */}
                {writable && posting === "cancelled" && (
                  <CancelledNote />
                )}

                {writable && !rulesSeen[dest] && (
                  <GuidelinesNote
                    onReadMore={() => navigate(`/community/${dest}/guidelines`)}
                    onClose={() => { seeRules(dest); setPointAtRules(true); }}
                  />
                )}

                {/* The write box, where a group page always puts it. Tapping
                    anywhere on it opens the same ask sheet as ever. */}
                {writable && canPostNow && (
                  <ComposerRow onAsk={() => setAsk(true)} />
                )}

                {writable && !helpSeen[dest] && needsHelp && (
                  <div style={{ padding: `0 ${PAD}px 14px` }}>
                    <HelpPromptSeen dest={dest} questionId={needsHelp.id} />
                    <HelpComposer
                      q={needsHelp}
                      onAnswer={() => {
                        track("community_help_prompt_tapped", { dest, questionId: needsHelp.id });
                        setHelpWith(needsHelp);
                      }}
                      onClose={() => seeHelp(dest)}
                    />
                  </div>
                )}

                {writable && posting !== "unlocked" && pausedSeen && (
                  <div style={{ padding: `0 ${PAD}px 12px` }}>
                    <PausedMarker onOpen={() => setPausedSheet("why")} />
                  </div>
                )}

                {/* One head, one control. The chips were reading as a third
                    row of tabs, so sorting and narrowing live behind the one
                    icon a feed usually gives them. */}
                <SectionHead style={{ marginTop: 8, alignItems: "center", marginBottom: 4 }} right={
                  <button onClick={() => setFilters(true)} aria-label="Sort and filter" style={{
                    position: "relative", width: 38, height: 38, borderRadius: "50%",
                    border: "none", background: "none", cursor: "pointer",
                    display: "grid", placeItems: "center",
                  }}>
                    <SlidersHorizontal size={17} color={CC.body} />
                    {(tag || sort !== "top") && (
                      <span style={{
                        position: "absolute", top: 6, right: 5, width: 8, height: 8,
                        borderRadius: "50%", background: CC.pink, display: "block",
                      }} />
                    )}
                  </button>
                }>Recent Activity</SectionHead>

                {/* A post of this traveller's that is still being checked, or held,
                    or refused. Nobody else can see these. */}
                {pending.length > 0 && (
                  <div style={{
                    padding: `0 ${PAD}px 10px`, display: "flex", flexDirection: "column", gap: 8,
                  }}>
                    {pending.map(q => (
                      <PendingEdge
                        key={q.id} state={q.status} reason={q.rule?.what || ""}
                        title={q.title} body={q.body}
                        onEdit={() => setEditingPending(q)}
                        onDelete={() => { deleteQuestion(q.id); setToast("Deleted"); }}
                      />
                    ))}
                  </div>
                )}

                {questions.length === 0 ? (
                  <EmptyFeed name={d.name} />
                ) : (
                  <>
                    {/* Full-bleed posts parted by a grey bar, the way a feed
                        everyone knows does it. No card edges. */}
                    <div style={{ borderTop: `1px solid ${CC.line}` }}>
                      {page.map((q, i) => (
                        <div key={q.id}>
                          {i > 0 && <div style={{ height: 6, background: CC.well }} />}
                          <FeedPostCard
                            q={q}
                            answerCount={answersFor(q).length}
                            likeCount={(q.likes || 0) + (likes[q.id] ? 1 : 0)}
                            liked={!!likes[q.id]}
                            saved={!!bookmarks[q.id]}
                            onClick={() => navigate(`/community/${dest}/q/${q.id}`)}
                            onLike={() => toggleLike(q.id)}
                            onSave={() => { toggleBookmark(q.id); setToast(bookmarks[q.id] ? "Removed from saved" : "Saved"); }}
                            onCopy={() => {
                              // A rejected clipboard write is silent otherwise,
                              // and an unhandled rejection in the console.
                              try { navigator.clipboard?.writeText(`${window.location.origin}/community/${dest}/q/${q.id}`)?.catch(() => {}); } catch { /* noop */ }
                              setToast("Link copied");
                            }}
                            onReport={() => { reportPost(q.id, "Reported from the feed"); setToast("Reported. It is gone from your feed."); }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* The line the next page is loaded from. */}
                    <div ref={foot} style={{ height: 1 }} />

                    <p style={{
                      fontSize: 12.5, color: CC.soft, textAlign: "center",
                      margin: `18px ${PAD}px 0`,
                    }}>
                      {more
                        ? "Loading more"
                        : `That is all ${questions.length} of them`}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Body>


      {/* Posting is off. The screen says so in full the first time, and leaves a
          marker in every room after that. Reading, liking, saving and reporting
          all carry on. */}
      {!loading && writable && posting === "paused" && !pausedSeen && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 120, background: CC.white,
          display: "flex", alignItems: "center",
        }}>
          <div style={{ width: "100%" }}>
            <PausedScreen
              onAppeal={() => { seePausedScreen(); setAppealText(""); setPausedSheet("appeal"); }}
              onRead={seePausedScreen}
            />
          </div>
        </div>
      )}

      {pausedSheet === "why" && (
        <Sheet title="Posting is paused" onClose={() => setPausedSheet(null)}>
          <PausedSheetBody
            onAppeal={() => { setAppealText(""); setPausedSheet("appeal"); }}
            onClose={() => setPausedSheet(null)}
          />
        </Sheet>
      )}
      {pausedSheet === "appeal" && (
        <Sheet title="Tell us we got it wrong" onClose={() => setPausedSheet(null)}>
          <AppealBody
            text={appealText} setText={setAppealText}
            onSend={() => { appeal(appealText); setPausedSheet("sent"); }}
          />
        </Sheet>
      )}
      {pausedSheet === "sent" && (
        <Sheet title="" onClose={() => setPausedSheet(null)}><AppealSent /></Sheet>
      )}

      {/* Posting drops the question into the list it belongs to rather than
          opening a screen of its own. Somebody who just asked wants to see it
          land, not to be moved somewhere else. */}
      {/* Answering from the feed, without a trip into the thread and back. */}
      {helpWith && (
        <AnswerSheet
          questionId={helpWith.id}
          focusSignal={helpWith.id}
          onClose={() => setHelpWith(null)}
          onPosted={() => { setHelpWith(null); seeHelp(dest); setToast("Your answer is up"); }}
        />
      )}

      {pointAtRules && <GuidelinesPointer onDone={() => setPointAtRules(false)} />}

      {filters && (
        <SortFilterSheet
          sort={sort}
          onSort={(v) => { setSort(v); setLimit(PAGE); track("community_sort_changed", { dest, sort: v }); }}
          tags={tagsFor(dest)} tag={tag}
          onTag={(v) => {
            setTag(v); setLimit(PAGE);
            if (v) {
              track("community_tag_filter_used", {
                dest, tag: v, resultCount: visible.filter(q => (q.tags || []).includes(v)).length,
              });
            }
          }}
          counts={tagCounts}
          onClose={() => setFilters(false)}
        />
      )}

      {ask && (
        <AskSheet dest={dest} destName={d.name} onClose={() => setAsk(false)}
          onPosted={() => { setAsk(false); setToast("Your question is up"); }} />
      )}
      {switcher && (
        <SwitcherSheet
          current={dest}
          onPick={(id) => { setSwitcher(false); navigate(`/community/${id}`); }}
          onAll={() => { setSwitcher(false); navigate("/community"); }}
          onClose={() => setSwitcher(false)}
        />
      )}

      {editingPending && (
        <EditSheet
          q={editingPending}
          onClose={() => setEditingPending(null)}
          onSave={({ title, body }) => {
            editQuestion(editingPending.id, { title, body });
            setEditingPending(null);
            setToast("Checking it again");
          }}
        />
      )}

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </Screen>
  );
}

// One line under the room name, and it sells the room rather than labelling
// it: the people who have already done this trip are the reason to ask
// anything here. The name above already says where, so it is not repeated.
function metaLine(d) {
  if (d.recent3m) {
    return `${d.recent3m} travellers have already travelled with us`;
  }
  // No count to lead with, so fall back to who is going.
  const c = d.cohort || {};
  if (c.state === "closed") return `Closed on ${c.closedOn} · read only`;
  return `${c.members || 0} travellers going in ${d.month}`;
}

// A frosted circle that reads on a photo and on white alike.
function FloatIcon({ label, onClick, children }) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: 36, height: 36, borderRadius: "50%",
      border: "1px solid rgba(255,255,255,0.22)",
      background: "rgba(20,38,37,0.38)", backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      cursor: "pointer", display: "grid", placeItems: "center",
    }}>{children}</button>
  );
}

// The group page's pill row. All three swap the panel underneath, so nothing
// here takes the reader off the room.
function RoomTabs({ tab, onTab }) {
  // One row, three equal pills. Sharing the width evenly makes them read as
  // one control rather than three loose chips with dead space after them.
  const pill = (active) => ({
    flex: 1, minWidth: 0, minHeight: 38, padding: "0 10px", borderRadius: 999,
    border: "none", cursor: "pointer", fontFamily: "inherit",
    fontSize: 13.5, fontWeight: 700,
    background: active ? CC.ink : CC.well,
    color: active ? "#fff" : CC.ink,
  });
  return (
    <div style={{ display: "flex", gap: 8, padding: `14px ${PAD}px 10px` }}>
      <button style={pill(tab === "questions")} onClick={() => onTab("questions")}>Questions</button>
      <button style={pill(tab === "about")} onClick={() => onTab("about")}>About</button>
      <button style={pill(tab === "rules")} onClick={() => onTab("rules")}>Rules</button>
    </div>
  );
}

// What the room is, said the way a group's About says it: a paragraph, then
// plain rows. Everything here already existed; this is just where it lives.
function AboutPanel({ d, members }) {
  const closed = d.cohort?.state === "closed";
  const row = (Icon, title, sub) => (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{
        width: 36, height: 36, borderRadius: "50%", background: CC.well,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}><Icon size={17} color={CC.body} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: CC.ink }}>{title}</p>
        {sub && (
          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: CC.body, lineHeight: "18px" }}>{sub}</p>
        )}
      </div>
    </div>
  );
  return (
    <div style={{ padding: `4px ${PAD}px 8px` }}>
      <p style={{ margin: "0 0 18px", fontSize: 13.5, color: CC.body, lineHeight: "20px" }}>
        {d.about}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {d.everyone ? (
          row(Users, "Open to every traveller",
            "Anyone who has booked with 30 Sundays can ask and answer here.")
        ) : (
          // A month that has been and gone is spoken about in the past, and
          // never promises that posting will open up later.
          row(Users, `${d.cohort?.members || 0} travellers`,
            `${closed ? "Went in" : "Going in"} ${d.month}${members.length > 0
              ? `: ${members.slice(0, 6).join(", ")}${members.length > 6 ? ` and ${members.length - 6} more` : ""}`
              : ""}`)
        )}
        {row(Eye, "Everyone can read",
          d.everyone
            ? "Questions here are visas, forex, packing, and everything else that is not one place."
            : closed
              ? "This month has passed, so nothing new is posted here."
              : "Asking and answering open up once this trip is booked.")}
        {d.questionsTotal
          ? row(MessageCircleQuestion, `${d.questionsTotal} questions so far`,
              "Most get their first answer within a day.")
          : null}
      </div>
    </div>
  );
}

// The rules, numbered the way a group's rules always are. A number gives
// each one a name people can point at, which a bullet never does.
function RulesPanel() {
  return (
    <div style={{ padding: `4px ${PAD}px 8px` }}>
      <p style={{ margin: "0 0 4px", fontSize: 13.5, color: CC.body, lineHeight: "20px" }}>
        Everyone here is planning the same trip as you. Five things keep it
        worth reading.
      </p>

      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {GUIDELINES.map(([title, body], i) => (
          <li key={title} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "14px 0 0", borderTop: i ? `1px solid ${CC.line}` : "none",
            marginTop: i ? 14 : 14,
          }}>
            <span style={{
              flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
              background: CC.well, display: "grid", placeItems: "center",
              fontSize: 12.5, fontWeight: 800, color: CC.ink,
            }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: CC.ink, margin: 0 }}>
                {title}
              </p>
              <p style={{ fontSize: 13, color: CC.body, margin: "3px 0 0", lineHeight: "19px" }}>
                {body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p style={{
        margin: "18px 0 0", paddingTop: 14, borderTop: `1px solid ${CC.line}`,
        fontSize: 12.5, color: CC.soft, lineHeight: "18px",
      }}>
        Our team reads the Sunday Community every day. If something here does not
        sit right, tell your consultant and they will pass it on.
      </p>
    </div>
  );
}

// The write box. The pink stays on the sheet's Post button, so this row can
// sit quietly at the top of the feed without shouting.
function ComposerRow({ onAsk }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: `4px ${PAD}px 14px`,
    }}>
      <TravellerMark name={ME.name} size={38} />
      <button onClick={onAsk} style={{
        flex: 1, minHeight: 42, borderRadius: 999, border: `1px solid ${CC.line}`,
        background: CC.well, cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 10, padding: "0 14px 0 16px",
      }}>
        <span style={{ flex: 1, textAlign: "left", fontSize: 14.5, color: CC.soft }}>
          Ask a question...
        </span>
        <ImagePlus size={19} color={CC.body} style={{ flexShrink: 0 }} />
      </button>
    </div>
  );
}

// The strip is the supply lever, so shown over tapped is the number that
// matters. One impression per room visit, not one per render.
function HelpPromptSeen({ dest, questionId }) {
  useEffect(() => {
    track("community_help_prompt_shown", { dest, questionId });
  }, [dest, questionId]);
  return null;
}

function CancelledNote() {
  return (
    <div style={{
      background: CC.well, borderBottom: `1px solid ${CC.line}`, padding: `14px ${PAD}px`,
    }}>
      <p style={{
        margin: 0, display: "flex", alignItems: "center", gap: 7,
        fontSize: 13.5, fontWeight: 700, color: CC.ink,
      }}>
        <Lock size={14} color={CC.body} /> Posting is paused
      </p>
      <p style={{ margin: "5px 0 0", fontSize: 13, color: CC.body, lineHeight: "19px" }}>
        You can still read everything here, and everything you posted before is
        still up. Posting comes back when you next book.
      </p>
    </div>
  );
}

function ReadOnlyNote() {
  return (
    <div style={{
      background: CC.well, borderBottom: `1px solid ${CC.line}`,
      padding: `14px ${PAD}px`,
    }}>
      <p style={{
        margin: 0, display: "flex", alignItems: "center", gap: 7,
        fontSize: 13.5, fontWeight: 700, color: CC.ink,
      }}>
        <Lock size={14} color={CC.body} /> Reading only for now
      </p>
      <p style={{ margin: "5px 0 0", fontSize: 13, color: CC.body, lineHeight: "19px" }}>
        Every question and answer here is open to read. Asking and answering
        open up once you book.
      </p>
    </div>
  );
}

/* ─────────────────────── Empty and loading ─────────────────────── */

function EmptyFeed({ name }) {
  return (
    <div style={{ textAlign: "center", padding: `28px ${PAD}px 12px` }}>
      <span style={{
        width: 56, height: 56, borderRadius: "50%", background: CC.well,
        display: "grid", placeItems: "center", margin: "0 auto 14px",
      }}><MessagesSquare size={25} color={CC.soft} /></span>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: CC.ink, margin: "0 0 6px" }}>
        Nobody has asked yet
      </h3>
      <p style={{ fontSize: 13.5, color: CC.body, margin: 0, lineHeight: "19px" }}>
        Whatever you are wondering about {name}, someone else is wondering it too.
        Ask at the top and it goes to everyone.
      </p>
    </div>
  );
}

function FeedSkeleton() {
  const bar = (w, h = 12) => (
    <div style={{ width: w, height: h, borderRadius: 6, background: CC.line, animation: "pulse 1.4s ease-in-out infinite" }} />
  );
  return (
    <div>
      {/* The cover loads like a cover, so the page does not jump into shape. */}
      <div style={{ height: 168, background: CC.line, animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ padding: `16px ${PAD}px`, display: "flex", flexDirection: "column", gap: 12 }}>
        {bar("52%", 20)}
        {bar("70%", 12)}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: CC.line }} />
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: CC.line, marginLeft: -18 }} />
        </div>
      </div>
      {[0, 1, 2].map(i => (
        <div key={i}>
          <div style={{ height: 6, background: CC.well }} />
          <div style={{ padding: `14px ${PAD}px`, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: CC.line }} />
              {bar("34%")}
            </div>
            {bar(i % 2 ? "70%" : "88%", 15)}
            {bar("46%")}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Ask a question ─────────────────────── */

export function AskSheet({ dest, destName, rooms, seedTitle = "", source = "button", onClose, onPosted }) {
  const { askQuestion, composeRulesSeen, seeComposeRules, consentSeen, seeConsent } = useCommunity();
  const [room, setRoom] = useState(dest);
  // A search that found nothing has already had the question typed into it.
  const [title, setTitle] = useState(seedTitle.trim());
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // The detail is optional, so only the question itself gates posting.
  const ready = title.trim().length > 4;

  // Opened, and then either posted or walked away from. The gap between the two
  // is where asking actually breaks down.
  const startedAt = useRef(Date.now());
  const posted = useRef(false);
  const draft = useRef({ title: "", body: "" });
  draft.current = { title, body };
  useEffect(() => {
    track("community_ask_started", { dest, source });
    return () => {
      if (posted.current) return;
      track("community_ask_abandoned", {
        dest, source,
        hadTitle: draft.current.title.trim().length > 0,
        hadBody: draft.current.body.trim().length > 0,
        secondsSpent: Math.round((Date.now() - startedAt.current) / 1000),
      });
    };
  }, [dest, source]);

  // Nothing is refused in here any more. The question lands in the room and
  // the check runs behind it, so the only failure left is the network.
  const submit = () => {
    // Posting is the agreement. The note above says what becomes public, and
    // this is the moment it applies, so it is marked as shown here.
    if (!consentSeen) seeConsent();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      // A failure is one toggle away, so the state can be shown on demand.
      if (window.__communityFailNext) {
        window.__communityFailNext = false;
        track("community_post_failed", { kind: "question", recovered: false });
        setFailed(true);
        return;
      }
      posted.current = true;
      onPosted(askQuestion({
        dest: room, title, body, images, tag: tagForPost(`${title} ${body}`, room),
      }));
    }, 700);
  };

  // The five rules, once, before this traveller's first post anywhere.
  if (!composeRulesSeen) {
    return <ComposeRules onGotIt={seeComposeRules} onClose={onClose} />;
  }

  return (
    <Sheet
      title="Ask a question"
      sub={rooms
        ? "Pick where it belongs, and everyone in that room can answer."
        : `Everyone going to ${destName}, and everyone who has been, can answer.`}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={submit} disabled={!ready || busy}>
            {busy ? "Posting..." : "Post question"}
          </Primary>
          <Secondary onClick={onClose}>Cancel</Secondary>
        </div>
      }
    >
      {failed && <FailedNote onRetry={() => { setFailed(false); submit(); }} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rooms ? (
          <Field label="Which room">
            <div style={{ display: "flex", gap: 8 }}>
              {rooms.map(r => (
                <button key={r.id} onClick={() => setRoom(r.id)} style={{
                  flex: 1, minHeight: 46, borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13.5, fontWeight: 700, padding: "0 10px",
                  border: `1.5px solid ${room === r.id ? CC.pink : CC.line}`,
                  background: room === r.id ? CC.pinkTint : CC.white,
                  color: room === r.id ? CC.pinkInk : CC.ink,
                }}>{r.name}</button>
              ))}
            </div>
          </Field>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
            background: CC.well, borderRadius: 12,
          }}>
            <span style={{ fontSize: 12.5, color: CC.body }}>Destination</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: CC.ink, flex: 1 }}>{destName}</span>
            <Lock size={13} color={CC.soft} />
          </div>
        )}

        <Field label="What do you want to know">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90}
            placeholder="How bad is the drive to Ubud in the evening?" />
        </Field>
        <Field label="Any detail that helps" hint="Optional. The more you give, the better the answers.">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={500}
            placeholder="We land at 7pm and our first two nights are in Ubud..." />
        </Field>

        <ImageAttach images={images} setImages={setImages} />

        {/* Said once, in plain words, before anything of theirs is public. */}
        {!consentSeen && <ConsentNote />}
      </div>
    </Sheet>
  );
}

/* ─────────────────────── Shared composer bits ─────────────────────── */

