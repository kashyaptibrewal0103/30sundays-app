import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, Trash2, Bookmark, Share2, MoreHorizontal, Flag, BellOff, Bell, BadgeCheck, ThumbsUp, CornerUpLeft } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { getDest, canPost, shortMonth, ago } from "../data/communityData";
import { Screen, Body, TopBar, Primary, Secondary, Sheet, Field, Input, Textarea } from "../components/Gift/GiftUI";
import {
  PAD, TravellerMark, TripStamp, PostActions, QuoteBlock, Toast, MoreMenu,
  IconAction, MoreButton, postMenuItems, ClampText, LikePop,
} from "../components/Community/CommunityUI";
import { AnswerSheet } from "../components/Community/PostSheets";
import { PendingEdge } from "../components/Community/PendingVariants";
import { useDwell } from "../components/Community/useDwell";
import { ReportSheet, ReportSent, ReportedNote } from "../components/Community/ReportFlow";

// One question, its answers, and a way to add another. The accepted answer is
// lifted to the top so whoever asked gets the useful bit first.

export default function CommunityQuestion() {
  const { dest = "bali", qid } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const {
    findQuestion, answersFor, likes, bookmarks, reports,
    toggleLike, toggleBookmark, reportPost, mutedQuestions, toggleMute,
    editQuestion, deleteQuestion, editAnswer, deleteAnswer, pendingAnswersFor, canPostNow,
  } = useCommunity();

  // The composer is always at the foot now, so the only state it needs is
  // which answer, if any, is being replied to, and a nudge to focus it.
  const [quote, setQuote] = useState(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(false);
  const [confirmGone, setConfirmGone] = useState(false);
  const [editAns, setEditAns] = useState(null);      // the answer being changed
  const [killAns, setKillAns] = useState(null);      // the answer being removed
  const [report, setReport] = useState(null);        // { id, what }
  const [sent, setSent] = useState(false);
  const [menu, setMenu] = useState(false);

  const d = getDest(dest);
  const q = findQuestion(qid);
  const writable = canPost(dest);
  const readOnly = d.cohort?.state === "closed" || !writable;

  // Posting order. Nothing is lifted, because the asker never picks a winner
  // and a thread is a conversation rather than a ticket. The one exception is
  // a label: whichever answer has the most likes is called out where it sits,
  // so somebody scrolling knows which one other travellers trusted.
  // answersFor returns nothing for a question that is gone, so everything
  // below is safe to work out before we know whether there is one.
  const ordered = answersFor(q);
  const liked = ordered.filter(a => (a.likes || 0) + (likes[a.id] ? 1 : 0) > 0);
  const best = liked.length > 1
    ? liked.reduce((m, a) => (
      ((a.likes || 0) + (likes[a.id] ? 1 : 0)) > ((m.likes || 0) + (likes[m.id] ? 1 : 0)) ? a : m
    ))
    : null;

  // The room's own answer comes first in a room whose answers are rules, and
  // what travellers add goes under a heading that says what it is.
  const roots = ordered.filter(a => !a.parentId || !ordered.some(x => x.id === a.parentId));
  const official = d.everyone ? roots.filter(a => a.author?.ops) : [];
  const rest = d.everyone ? roots.filter(a => !a.author?.ops) : roots;

  // One pair per thread view. The close says whether the answers were read,
  // which is the only way to judge whether an answer was any good.
  // Every hook runs before the missing-question screen below, so a thread
  // that vanishes under the reader never changes the order they run in.
  useDwell(
    "question",
    {
      questionId: q?.id ?? qid, dest, tag: (q?.tags || [])[0] || null,
      answerCount: ordered.length, source: params.get("src") || "feed",
    },
    () => ({ answersSeen: ordered.length, reachedEnd: false }),
  );

  if (!q) {
    return (
      <Screen>
        <TopBar title="Question" onBack={() => navigate(`/community/${dest}`)} />
        <Body>
          <div style={{ padding: `48px ${PAD}px`, textAlign: "center" }}>
            <p style={{ fontSize: 15, color: CC.body }}>This question is no longer here.</p>
          </div>
        </Body>
      </Screen>
    );
  }

  // Replies nest under the answer they reply to. Three levels is the cap: a
  // fourth indent leaves the words in a column too narrow to read on a phone,
  // so anything deeper is attached to its grandparent instead.
  const MAX_DEPTH = 3;
  const childrenOf = (parentId) => ordered.filter(a => (a.parentId || null) === parentId);
  const countAll = (a) => {
    const kids = ordered.filter(x => x.parentId === a.id);
    return kids.length + kids.reduce((n, k) => n + countAll(k), 0);
  };

  const renderThread = (a, depth = 0) => {
    const kids = depth + 1 < MAX_DEPTH ? ordered.filter(x => x.parentId === a.id) : [];
    const deeper = depth + 1 >= MAX_DEPTH ? ordered.filter(x => x.parentId === a.id) : [];
    return (
      <div key={a.id}>
        {renderAnswer(a, countAll(a))}
        {(kids.length > 0 || deeper.length > 0) && (
          <div style={{
            marginTop: 12, marginLeft: 16, paddingLeft: 15,
            borderLeft: `2px solid ${CC.line}`,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {kids.map(k => renderThread(k, depth + 1))}
            {/* At the cap the thread stops indenting and carries on in line. */}
            {deeper.map(k => renderThread(k, depth))}
          </div>
        )}
      </div>
    );
  };

  const renderAnswer = (a, replyCount = 0) => (reports[a.id] ? (
    <ReportedNote key={a.id} />
  ) : (
    <CommentAnswer
      key={a.id} answer={a} best={best?.id === a.id}
      replyCount={replyCount}
      liked={!!likes[a.id]}
      onLike={() => toggleLike(a.id)}
      onReply={() => setQuote({ author: a.author, text: firstLine(a.body), parentId: a.id })}
      menu={postMenuItems({
        mine: !!a.mine, reported: !!reports[a.id],
        onEdit: a.mine ? () => setEditAns(a) : undefined,
        onDelete: a.mine ? () => setKillAns(a) : undefined,
        onReport: () => setReport({ id: a.id, what: "answer" }),
      })}
    />
  ));

  const copy = (label) => {
    try { navigator.clipboard?.writeText(`${window.location.origin}/community/${dest}/q/${q.id}`); } catch { /* noop */ }
    setToast(`${label} link copied`);
  };

  return (
    <Screen>
      {/* Save, link and the dots belong to the screen, not to the question
          card. Up here they take no width off the title and they stay put
          while the thread scrolls. */}
      <TopBar
        title={d.month ? `${d.name} · ${shortMonth(d.month)}` : d.name}
        onBack={() => navigate(`/community/${dest}`)}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
            <IconAction
              icon={Bookmark} label={bookmarks[q.id] ? "Remove from saved" : "Save"}
              active={!!bookmarks[q.id]} fill={!!bookmarks[q.id]}
              onClick={() => { toggleBookmark(q.id); setToast(bookmarks[q.id] ? "Removed from saved" : "Saved"); }}
            />
            <IconAction icon={Share2} label="Share" onClick={() => copy("Question")} />
            <IconAction icon={MoreHorizontal} label="More" onClick={() => setMenu(true)} />
          </div>
        }
      />

      <Body>
        <div style={{ padding: `12px ${PAD}px 24px`, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* The question, laid out the way a post is: who is speaking first,
              then what they said. Flat on the page, no card edge, so the
              bubbles under it read as the smaller thing. */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TravellerMark name={q.author?.name} ops={q.author?.ops} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* The name owns the row, with the time at the far end of it.
                    What they can vouch for goes underneath, where it reads as
                    a credential rather than part of their name. */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 500, color: CC.ink,
                    lineHeight: "19px",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{q.mine ? "You" : q.author?.name}</span>
                  <span style={{ flexShrink: 0, fontSize: 12, color: CC.soft }}>
                    {ago(q.minsAgo)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                  <BadgeCheck size={12} color={CC.teal} style={{ flexShrink: 0 }} />
                  <TripStamp ops={q.author?.ops} stamp={q.author?.stamp} />
                </div>
              </div>
            </div>

            <h1 style={{
              fontSize: 19, fontWeight: 700, color: CC.ink, margin: "10px 0 0",
              lineHeight: "26px", letterSpacing: "-0.2px",
            }}>{q.title}</h1>
            {q.body && (
              <div style={{ marginTop: 8 }}>
                <ClampText>{q.body}</ClampText>
              </div>
            )}
            {q.image && <img src={q.image} alt="" style={{
              width: "100%", maxHeight: 340, objectFit: "cover",
              borderRadius: 12, marginTop: 12, display: "block",
            }} />}
            {/* Like and answer only. Save, the link and the dots are up in the
                bar, where they stay put while the thread scrolls. */}
            <div style={{ marginTop: 4, borderBottom: `1px solid ${CC.line}`, paddingBottom: 4 }}>
              <PostActions
                liked={!!likes[q.id]} likes={(q.likes || 0) + (likes[q.id] ? 1 : 0)}
                onLike={() => toggleLike(q.id)}
                onReply={() => { setQuote(null); setFocusSignal(n => n + 1); }}
              />
            </div>
          </div>

          {/* An answer of this traveller's that is still being checked, or held,
              or refused. Nobody else can see it. */}
          {pendingAnswersFor(q.id).map(a => (
            <PendingEdge
              key={a.id} state={a.status} reason={a.rule?.what || ""}
              title={a.body} body="" answerTo={q.title}
              onEdit={() => setEditAns(a)}
              onDelete={() => { deleteAnswer(q.id, a.id); setToast("Deleted"); }}
            />
          ))}

          {/* Answers */}
          {ordered.length === 0 ? (
            <EmptyAnswers writable={writable} />
          ) : (
            <>
              {official.length > 0 && (
                <>
                  <Heading>{official.length === 1 ? "The Answer" : "The Answers"}</Heading>
                  {official.map(a => renderThread(a))}
                </>
              )}

              {rest.length > 0 && (
                <>
                  <Heading>
                    {d.everyone
                      ? "What Travellers Found"
                      : `${ordered.length} ${ordered.length === 1 ? "Answer" : "Answers"}`}
                  </Heading>
                  {/* In this room the answer above is the rule. What follows is
                      what happened to people, which is a different thing. */}
                  {d.everyone && (
                    <p style={{
                      fontSize: 12.5, color: CC.body, margin: "-4px 0 0", lineHeight: "18px",
                    }}>
                      These are experiences, not rules. The answer above is the rule.
                    </p>
                  )}
                  {rest.map(a => renderThread(a))}
                </>
              )}
            </>
          )}
        </div>
      </Body>

      {!canPostNow ? (
        <div style={{
          flexShrink: 0, borderTop: `1px solid ${CC.line}`, background: CC.well,
          padding: `14px ${PAD}px calc(16px + env(safe-area-inset-bottom))`, textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: CC.body, margin: 0 }}>
            Posting is paused. You can still read everything.
          </p>
        </div>
      ) : readOnly ? (
        <div style={{
          flexShrink: 0, borderTop: `1px solid ${CC.line}`, background: CC.well,
          padding: `14px ${PAD}px calc(16px + env(safe-area-inset-bottom))`, textAlign: "center",
        }}>
          {/* Two different reasons a thread is read only, and they are not
              the same news. One is over, the other has not started for you. */}
          <p style={{ fontSize: 13, color: CC.body, margin: 0 }}>
            {writable
              ? "This destination has wrapped up. You can read it, but replies are closed."
              : `Reading only. Answering opens up once you book ${d.name}.`}
          </p>
        </div>
      ) : (
        /* The next step is simply there, the way a comment field is. No
           button in front of it, nothing to open or close. */
        <AnswerSheet
          questionId={q.id} questionTitle={q.title}
          quote={quote} onClearQuote={() => setQuote(null)}
          focusSignal={focusSignal}
          isFirstAnswer={ordered.length === 0}
          hoursSinceAsked={Math.round((q.minsAgo ?? 0) / 60)}
          onPosted={() => { setQuote(null); setToast("Your answer is up"); }}
        />
      )}

      {menu && (
        <MoreMenu
          onClose={() => setMenu(false)}
          items={[
            // A busy thread is the commonest reason somebody turns everything
            // off. Stopping one question is the smaller, better answer.
            {
              icon: mutedQuestions[q.id] ? Bell : BellOff,
              label: mutedQuestions[q.id] ? "Turn notifications back on" : "Mute this question",
              onClick: () => {
                toggleMute(q.id, q.title);
                setToast(mutedQuestions[q.id] ? "Notifications back on" : "Muted, you can undo this in settings");
              },
            },
            ...(q.mine ? [
              { icon: Pencil, label: "Edit question", onClick: () => setEditing(true) },
              { icon: Trash2, label: "Delete question", danger: true, onClick: () => setConfirmGone(true) },
            ] : [
              {
                icon: Flag, danger: true, done: !!reports[q.id],
                label: reports[q.id] ? "Reported" : "Report this question",
                onClick: reports[q.id] ? undefined : () => setReport({ id: q.id, what: "question" }),
              },
            ]),
          ]}
        />
      )}

      {report && (
        <ReportSheet
          what={report.what}
          onClose={() => setReport(null)}
          onSend={(reason, note) => {
            reportPost(report.id, note ? `${reason}: ${note}` : reason);
            setReport(null);
            setSent(true);
          }}
        />
      )}
      {sent && <ReportSent onClose={() => setSent(false)} />}

      {editAns && (
        <EditAnswerSheet
          answer={editAns}
          onClose={() => setEditAns(null)}
          onSave={(body) => { editAnswer(q.id, editAns.id, body); setEditAns(null); setToast("Answer updated"); }}
        />
      )}

      {killAns && (
        <Sheet
          title="Delete your answer?"
          onClose={() => setKillAns(null)}
          footer={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Primary onClick={() => { deleteAnswer(q.id, killAns.id); setKillAns(null); setToast("Answer deleted"); }}>
                Delete it
              </Primary>
              <Secondary onClick={() => setKillAns(null)}>Keep it</Secondary>
            </div>
          }
        >
          <p style={{ fontSize: 14, color: CC.body, margin: 0, lineHeight: "21px" }}>
            Anyone who replied to it keeps their reply, and the quote of your
            words goes with yours. This cannot be undone.
          </p>
        </Sheet>
      )}

      {editing && (
        <EditSheet
          q={q}
          onClose={() => setEditing(false)}
          onSave={({ title, body }) => {
            editQuestion(q.id, { title, body });
            setEditing(false);
            setToast("Question updated");
          }}
        />
      )}

      {confirmGone && (
        <Sheet
          title="Delete this question?"
          onClose={() => setConfirmGone(false)}
          footer={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Primary onClick={() => { deleteQuestion(q.id); navigate(`/community/${dest}`); }}>
                Delete it
              </Primary>
              <Secondary onClick={() => setConfirmGone(false)}>Keep it</Secondary>
            </div>
          }
        >
          <p style={{ fontSize: 14, color: CC.body, margin: 0, lineHeight: "21px" }}>
            Any answers go with it. Nobody is told, and you can ask it again
            whenever you like.
          </p>
        </Sheet>
      )}

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </Screen>
  );
}

function EditAnswerSheet({ answer, onClose, onSave }) {
  const [body, setBody] = useState(answer.body || "");
  const ready = body.trim().length > 4;
  return (
    <Sheet
      title="Edit your answer"
      sub="It will show as edited, so nobody is misled by a changed answer."
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={() => onSave(body)} disabled={!ready}>Save</Primary>
          <Secondary onClick={onClose}>Cancel</Secondary>
        </div>
      }
    >
      <Field label="Your answer">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={600} />
      </Field>
    </Sheet>
  );
}


export function EditSheet({ q, onClose, onSave }) {
  const [title, setTitle] = useState(q.title || "");
  const [body, setBody] = useState(q.body || "");
  const ready = title.trim().length > 4;
  return (
    <Sheet
      title="Edit your question"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={() => onSave({ title, body })} disabled={!ready}>Save</Primary>
          <Secondary onClick={onClose}>Cancel</Secondary>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="What do you want to know">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} />
        </Field>
        <Field label="Any detail that helps" hint="Optional.">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={500} />
        </Field>
      </div>
    </Sheet>
  );
}

// An answer as a comment: the face outside, the words in a grey bubble, the
// small acts on a line underneath. The question stays flat and big above, so
// the two can never be mistaken for each other again.
function CommentAnswer({ answer, best, liked, onLike, onReply, menu, replyCount = 0 }) {
  const ops = !!answer.author?.ops;
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
      <TravellerMark name={answer.author?.name} ops={ops} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* No position here: a sheet anchors to its nearest positioned
            ancestor, and it belongs to the screen, not to one bubble. */}
        <div style={{
          background: ops ? "#F5FCFB" : CC.well,
          border: ops ? `1px solid ${CC.tealLine}` : "none",
          borderRadius: 16, padding: "9px 13px 11px",
        }}>
          {best && (
            <p style={{
              display: "inline-flex", alignItems: "center", gap: 5, margin: "0 0 4px",
              fontSize: 11, fontWeight: 800, color: CC.tealInk,
            }}>Most Helpful</p>
          )}
          {/* The name row carries the time, and the dots sit in the corner of
              the bubble they belong to. */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: CC.ink,
              lineHeight: "17px",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{answer.mine ? "You" : answer.author?.name}</span>
            <span style={{ flexShrink: 0, fontSize: 11.5, color: CC.soft }}>
              {ago(answer.minsAgo)}
            </span>
            <MoreButton items={menu} style={{ margin: "-10px -8px -10px 0" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
            {/* The team's stamp already carries the badge, so the name only
                needs one when the stamp cannot. */}
            {!ops && <BadgeCheck size={11} color={CC.teal} style={{ flexShrink: 0 }} />}
            <TripStamp ops={ops} stamp={answer.author?.stamp} />
          </div>
          <div style={{ marginTop: 4, fontSize: 14, color: CC.ink, lineHeight: "20px" }}>
            <QuoteBlock quote={answer.quotes} />
            <ClampText answerId={answer.id}>{answer.body}</ClampText>
          </div>
          {answer.image && (
            <img src={answer.image} alt="" style={{
              width: "100%", maxHeight: 260, objectFit: "cover",
              borderRadius: 12, marginTop: 8, display: "block",
            }} />
          )}
          {answer.edited && (
            <p style={{ fontSize: 11, color: CC.soft, margin: "6px 0 0" }}>Edited</p>
          )}
        </div>

        {/* The two acts, small and grey under the bubble. Each keeps its
            icon, so neither is a word on its own. */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "3px 13px 0" }}>
          <SmallAction
            icon={ThumbsUp} label="Like" active={liked}
            count={(answer.likes || 0) + (liked ? 1 : 0)}
            onClick={onLike}
          />
          <SmallAction icon={CornerUpLeft} label="Reply" onClick={onReply} />
          {replyCount > 0 && (
            <span style={{ fontSize: 12, color: CC.soft }}>
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Like and reply under a bubble: an icon, a word, and the count when there
// is one. Small enough to stay out of the way of the words above it.
function SmallAction({ icon: Icon, label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 0",
      border: "none", background: "none", cursor: "pointer", fontFamily: "inherit",
      fontSize: 12, fontWeight: 700, color: active ? CC.tealInk : CC.body,
    }}>
      <LikePop liked={!!active}>
        <Icon size={13} color={active ? CC.tealInk : CC.body}
          fill={active ? CC.tealTint : "none"} />
      </LikePop>
      {label}{count > 0 ? ` ${count}` : ""}
    </button>
  );
}

const firstLine = (s) => {
  const t = String(s || "").trim();
  return t.length > 96 ? `${t.slice(0, 96).trim()}...` : t;
};

/* ─────────────────────── Answer composer ─────────────────────── */


function Heading({ children }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 700,
      color: CC.body, margin: "4px 0 0",
    }}>{children}</p>
  );
}

// Sits straight under the question rather than as a card of its own, and says
// the two things somebody who just asked wants to know. No promise about how
// fast a reply comes: in launch week that promise would not be true.
function EmptyAnswers({ writable }) {
  return (
    <div style={{
      margin: "-4px 0 0", padding: "12px 14px", borderRadius: 12,
      background: CC.well, border: `1px solid ${CC.line}`,
    }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, color: CC.ink, margin: 0 }}>
        No answers yet
      </p>
      <p style={{ fontSize: 13, color: CC.body, margin: "4px 0 0", lineHeight: "19px" }}>
        Everyone in this room can see it, along with our team.
        {writable ? " If you know this one, say so." : ""}
      </p>
    </div>
  );
}
