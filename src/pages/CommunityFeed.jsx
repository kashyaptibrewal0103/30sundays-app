import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus, Users, ShieldCheck, Search, Bookmark, MessagesSquare, Lock, AlertTriangle, ImagePlus,
  X as XIcon, ChevronRight,
} from "lucide-react";
// Community has its own palette, in tokens.
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import {
  getDest, tagsFor, checkPost, ago, track, canPost, tagForPost, COHORT_THRESHOLD,
} from "../data/communityData";
import { Screen, Body, TopBar, Primary, Secondary, Sheet, Field, Input, Textarea } from "../components/Gift/GiftUI";
import {
  PAD, QuestionCard, Toast,
  SectionBar, SectionHead,
} from "../components/Community/CommunityUI";
import { FeedTopWeight } from "../components/Community/FeedTopVariants";
import { GuidelinesNote, GuidelinesPointer } from "../components/Community/GuidelinesNote";
import { sortQuestions } from "../components/Community/FeedFilters";
import { FiltersChipsAndSliders } from "../components/Community/SortFilterVariants";
import { HelpComposer } from "../components/Community/HelpVariants";
import { AnswerSheet, ImageAttach, FailedNote, FlaggedSheet, BlockedSheet } from "../components/Community/PostSheets";
import { SwitcherTitle, SwitcherSheet } from "../components/Community/RoomSwitcher";

// The Q&A feed is where Community starts. A plain bar at the top, the group
// chat, then the questions.

export default function CommunityFeed() {
  const { dest = "bali" } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const view = params.get("state");

  // Where the room was entered from. Back undoes the last step: somebody who
  // came from their trip goes back to their trip, never to a screen they have
  // not seen. The way on to the rest of the Lounge is the title instead.
  const from = params.get("from");
  const [switcher, setSwitcher] = useState(false);

  const {
    questionsFor, answersFor, answeredCount, unreadFor,
    rulesSeen, seeRules, helpSeen, seeHelp, reports,
  } = useCommunity();
  const [ask, setAsk] = useState(false);
  const [toast, setToast] = useState(null);
  // Shown once, the moment the rules note is closed, so the rules are never
  // just gone.
  const [pointAtRules, setPointAtRules] = useState(false);

  // The list pages in as it is scrolled rather than rendering the whole
  // catalogue at once. A sentinel under the last card asks for the next page.
  const PAGE = 8;
  const [limit, setLimit] = useState(PAGE);
  const foot = useRef(null);

  const [sort, setSort] = useState("recent");
  const [tag, setTag] = useState(null);
  const [helpWith, setHelpWith] = useState(null);   // the question being answered

  const d = getDest(dest);
  const all = questionsFor(dest);
  // Reported posts leave the reporter's own feed, and nobody else's.
  const visible = all.filter(q => !reports[q.id]);
  const byTag = tag ? visible.filter(q => (q.tags || []).includes(tag)) : visible;
  const questions = view === "empty" ? [] : sortQuestions(byTag, sort, answersFor);
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
  const open = d.cohort?.state === "open";
  const writable = canPost(dest);
  const backTo = from === "trip" && d.tripId ? `/trips/${d.tripId}` : "/lounge";

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
      {/* The room's name is the way out of the room. It takes the short form,
          because the chevron needs the space and the sheet spells every room
          out in full anyway. */}
      <TopBar
        title={<SwitcherTitle
          label={d.everyone ? d.name : `${d.name} Lounge`}
          onOpen={() => setSwitcher(true)}
        />}
        sub={!writable && d.month ? d.month : null}
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

          <button
            onClick={() => navigate(`/community/${dest}/guidelines`)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5, minHeight: 40,
              padding: "0 2px", border: "none", background: "none", cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <ShieldCheck size={14} color={CC.soft} />
            {/* A word, underlined. A shield on its own asks the reader to
                guess what it opens, and nobody guesses "the rules". The short
                word, because the room name beside it is now a control too. */}
            <span style={{
              fontSize: 13, fontWeight: 600, color: CC.body,
              textDecoration: "underline", textUnderlineOffset: 3,
              textDecorationColor: CC.line,
            }}>Rules</span>
          </button>
          </div>
        }
      />

      <Body>
        {loading ? <FeedSkeleton /> : (
          <div style={{ padding: "0 0 92px" }}>
            {/* Separated by weight. The greeting is plain type, the chat is the
                only card on the screen, and the rules are a link. Three kinds
                of thing, three different amounts of ink. */}
            {!writable && (
              <ReadOnlyNote />
            )}

            {writable && !rulesSeen[dest] && (
              <GuidelinesNote
                onReadMore={() => navigate(`/community/${dest}/guidelines`)}
                onClose={() => { seeRules(dest); setPointAtRules(true); }}
              />
            )}

            {!writable ? null : d.everyone ? (
              <RoomBand d={d} />
            ) : open ? (
              <FeedTopWeight
                d={d}
                chat={writable}
                unread={unreadFor(dest)}
                onChat={() => navigate(`/community/${dest}/chat`)}
              />
            ) : (
              <>
                <div style={{ padding: `14px ${PAD}px 0` }}>
                  <CohortCard d={d} onOpen={() => navigate(`/community/${dest}/chat`)} />
                </div>
              </>
            )}

            <div style={{ height: 18 }} />

            {writable && !helpSeen[dest] && needsHelp && (
              <div style={{ padding: `0 ${PAD}px 14px` }}>
                <HelpComposer
                  q={needsHelp}
                  onAnswer={() => setHelpWith(needsHelp)}
                  onClose={() => seeHelp(dest)}
                />
              </div>
            )}

            <SectionHead>Questions</SectionHead>

            <FiltersChipsAndSliders
              sort={sort} onSort={(v) => { setSort(v); setLimit(PAGE); }}
              tags={tagsFor(dest)} tag={tag} onTag={(v) => { setTag(v); setLimit(PAGE); }}
              counts={tagCounts} matches={questions.length}
            />

            {questions.length === 0 ? (
              <EmptyFeed name={d.name} onAsk={() => setAsk(true)} />
            ) : (
              <>
                <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
                  {page.map(q => (
                    <QuestionCard
                      key={q.id} q={q}
                      answerCount={answersFor(q).length}
                      onClick={() => navigate(`/community/${dest}/q/${q.id}`)}
                    />
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
          </div>
        )}
      </Body>

      {/* Not a fixed bar. A row pinned across the bottom spent its width on
          two counts that are already on the screen, and it took a strip of the
          list with it. One action, in the corner a thumb reaches first. */}
      {!loading && !helpWith && writable && (
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

      {/* Posting drops the question into the list it belongs to rather than
          opening a screen of its own. Somebody who just asked wants to see it
          land, not to be moved somewhere else. */}
      {/* Answering from the feed, without a trip into the thread and back. */}
      {helpWith && (
        <AnswerSheet
          questionId={helpWith.id}
          onClose={() => setHelpWith(null)}
          onPosted={() => { setHelpWith(null); seeHelp(dest); setToast("Your answer is up"); }}
        />
      )}

      {pointAtRules && <GuidelinesPointer onDone={() => setPointAtRules(false)} />}

      {ask && (
        <AskSheet dest={dest} destName={d.name} onClose={() => setAsk(false)}
          onPosted={() => { setAsk(false); setToast("Your question is up"); }} />
      )}
      {switcher && (
        <SwitcherSheet
          current={dest}
          onPick={(id) => { setSwitcher(false); navigate(`/community/${id}`); }}
          onAll={() => { setSwitcher(false); navigate("/lounge"); }}
          onClose={() => setSwitcher(false)}
        />
      )}

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </Screen>
  );
}

function RoomBand({ d }) {
  return (
    <div style={{
      background: CC.bubbleDeep, borderBottom: `1px solid ${CC.bubbleEdge}`,
      padding: `14px ${PAD}px 16px`,
    }}>
      <p style={{ margin: 0, fontSize: 13, color: CC.body, lineHeight: "19px" }}>
        {d.about}
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

/* ─────────────────────── The cohort card ─────────────────────── */

function CohortCard({ d, unread = 0, onOpen }) {
  const { state, members, lastActiveMins, closedOn } = d.cohort;

  // Not enough people yet. Say so plainly rather than open an empty room.
  if (state === "below") {
    return (
      <div style={{
        border: `1px dashed ${CC.line}`, borderRadius: 16, padding: 16, background: CC.well,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, background: CC.white, flexShrink: 0,
          display: "grid", placeItems: "center", border: `1px solid ${CC.line}`,
        }}><Users size={19} color={CC.soft} /></span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: CC.ink, margin: 0, letterSpacing: "-0.1px" }}>
            No group chat for {d.month} yet
          </p>
          <p style={{ fontSize: 13, color: CC.body, margin: "4px 0 0", lineHeight: "19px" }}>
            {members} people are going that month. The chat opens at {COHORT_THRESHOLD}, so it
            is worth looking again. Questions below are answered either way.
          </p>
        </div>
      </div>
    );
  }

  // The month has been and gone. Readable, but nobody is talking any more.
  if (state === "closed") {
    return (
      <button onClick={onOpen} style={{
        width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit", minHeight: 48,
        border: `1px solid ${CC.line}`, borderRadius: 16, padding: 16, background: CC.white,
        display: "flex", gap: 12, alignItems: "center",
      }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, background: CC.well, flexShrink: 0,
          display: "grid", placeItems: "center",
        }}><Lock size={18} color={CC.soft} /></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: CC.ink }}>
            {d.name}, {d.month}
          </span>
          <span style={{ display: "block", fontSize: 13, color: CC.body, marginTop: 2 }}>
            Closed on {closedOn}. You can still read it.
          </span>
        </span>
        <ChevronRight size={17} color={CC.soft} />
      </button>
    );
  }

  return (
    <button onClick={onOpen} style={{
      width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      border: `1px solid ${CC.line}`, borderRadius: 16, padding: 16, background: CC.white,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{
          width: 38, height: 38, borderRadius: 12, background: CC.tealTint, flexShrink: 0,
          display: "grid", placeItems: "center",
        }}><MessagesSquare size={18} color={CC.teal} /></span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: CC.ink }}>
            Group chat
          </span>
          <span style={{ display: "block", fontSize: 12.5, color: CC.body, marginTop: 2 }}>
            {members} travellers going · active {ago(lastActiveMins)} ago
          </span>
        </span>

        {unread > 0 && <UnreadChip n={unread} />}
        <ChevronRight size={17} color={CC.soft} style={{ flexShrink: 0 }} />
      </div>
    </button>
  );
}

/* ─────────────────────── Empty and loading ─────────────────────── */

function EmptyFeed({ name, onAsk }) {
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
        Ask below and it goes to everyone.
      </p>
    </div>
  );
}

function FeedSkeleton() {
  const bar = (w, h = 12) => (
    <div style={{ width: w, height: h, borderRadius: 6, background: CC.line, animation: "pulse 1.4s ease-in-out infinite" }} />
  );
  return (
    <div style={{ padding: `18px ${PAD}px` }}>
      <div style={{
        border: `1px solid ${CC.line}`, borderRadius: 16, padding: 16,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {bar("38%", 11)}
        {bar("62%", 18)}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: CC.line }} />
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: CC.line, marginLeft: -18 }} />
          {bar("30%")}
        </div>
      </div>
      <div style={{ height: 6, background: CC.well, margin: "20px -16px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            border: `1px solid ${CC.line}`, borderRadius: 14, padding: 14,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {bar(i % 2 ? "70%" : "88%", 15)}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: CC.line }} />
              {bar("34%")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Ask a question ─────────────────────── */

export function AskSheet({ dest, destName, rooms, seedTitle = "", onClose, onPosted }) {
  const { askQuestion, addStrike } = useCommunity();
  const [room, setRoom] = useState(dest);
  // A search that found nothing has already had the question typed into it.
  const [title, setTitle] = useState(seedTitle.trim());
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flag, setFlag] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  // The detail is optional, so only the question itself gates posting.
  const ready = title.trim().length > 4;

  const submit = () => {
    const hit = checkPost(`${title} ${body}`);
    if (hit) {
      const n = addStrike();
      track("community_post_flagged", { rule: hit.id, offence: n });
      if (n >= 2) setBlocked(hit); else setFlag(hit);
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      // A failure is one toggle away, so the state can be shown on demand.
      if (window.__communityFailNext) { window.__communityFailNext = false; setFailed(true); return; }
      onPosted(askQuestion({ dest: room, title, body, image, tag: tagForPost(`${title} ${body}`, room) }));
    }, 700);
  };

  if (blocked) return <BlockedSheet rule={blocked} onClose={onClose} />;
  if (flag) return <FlaggedSheet rule={flag} onEdit={() => setFlag(null)} onClose={onClose} />;

  return (
    <Sheet
      title="Ask a question"
      sub={rooms
        ? "Pick where it belongs, and everyone in that room can answer."
        : `Everyone going to ${destName}, and everyone who has been, can answer.`}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={submit} disabled={!ready || busy}>{busy ? "Posting..." : "Post question"}</Primary>
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

        <ImageAttach image={image} setImage={setImage} />
      </div>
    </Sheet>
  );
}

/* ─────────────────────── Shared composer bits ─────────────────────── */

