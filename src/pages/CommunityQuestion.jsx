import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CornerUpLeft, Pencil, Trash2, Bookmark, Share2, MoreHorizontal, Flag, Lock } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { ME, getDest, checkPost, track, canPost, shortMonth } from "../data/communityData";
import { Screen, Body, TopBar, Primary, Secondary, Sheet, Field, Input, Textarea } from "../components/Gift/GiftUI";
import {
  PAD, CARD, AuthorLine, AnswerCard, PostActions, QuoteBlock, Toast, MoreMenu,
  IconAction, ClampText,
} from "../components/Community/CommunityUI";
import { AnswerSheet } from "../components/Community/PostSheets";
import { ReportSheet, ReportSent, ReportedNote } from "../components/Community/ReportFlow";

// One question, its answers, and a way to add another. The accepted answer is
// lifted to the top so whoever asked gets the useful bit first.

export default function CommunityQuestion() {
  const { dest = "bali", qid } = useParams();
  const navigate = useNavigate();
  const {
    findQuestion, answersFor, likes, bookmarks, reports,
    toggleLike, toggleBookmark, reportPost,
    editQuestion, deleteQuestion, editAnswer, deleteAnswer,
  } = useCommunity();

  const [compose, setCompose] = useState(null); // null | { quote }
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

  // Posting order. Nothing is lifted, because the asker never picks a winner
  // and a thread is a conversation rather than a ticket. The one exception is
  // a label: whichever answer has the most likes is called out where it sits,
  // so somebody scrolling knows which one other travellers trusted.
  const ordered = answersFor(q);
  const liked = ordered.filter(a => (a.likes || 0) + (likes[a.id] ? 1 : 0) > 0);
  const best = liked.length > 1
    ? liked.reduce((m, a) => (
      ((a.likes || 0) + (likes[a.id] ? 1 : 0)) > ((m.likes || 0) + (likes[m.id] ? 1 : 0)) ? a : m
    ))
    : null;

  // The room's own answer comes first in a room whose answers are rules, and
  // what travellers add goes under a heading that says what it is.
  const official = d.everyone ? ordered.filter(a => a.author?.ops) : [];
  const rest = d.everyone ? ordered.filter(a => !a.author?.ops) : ordered;

  const renderAnswer = (a) => (reports[a.id] ? (
    <ReportedNote key={a.id} />
  ) : (
    <AnswerCard
      key={a.id} answer={a} best={best?.id === a.id}
      liked={!!likes[a.id]} bookmarked={!!bookmarks[a.id]} reported={!!reports[a.id]}
      onLike={() => toggleLike(a.id)}
      onCopy={() => copy("Answer")}
      onBookmark={() => { toggleBookmark(a.id); setToast(bookmarks[a.id] ? "Removed from saved" : "Saved"); }}
      onReply={() => setCompose({ quote: { author: a.author, text: firstLine(a.body) } })}
      onReport={() => setReport({ id: a.id, what: "answer" })}
      onEdit={a.mine ? () => setEditAns(a) : undefined}
      onDelete={a.mine ? () => setKillAns(a) : undefined}
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

          {/* The question itself */}
          <div style={{ ...CARD, padding: 16 }}>
            <h1 style={{
              fontSize: 19, fontWeight: 700, color: CC.ink, margin: 0,
              lineHeight: "26px", letterSpacing: "-0.2px",
            }}>{q.title}</h1>
            {q.body && (
              <div style={{ marginTop: 10 }}>
                <ClampText>{q.body}</ClampText>
              </div>
            )}
            {q.image && <img src={q.image} alt="" style={{ width: "100%", borderRadius: 12, marginTop: 12, display: "block" }} />}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${CC.line}` }}>
              {/* No dots here: the question's are up in the bar. The time
                  sits at the foot with the actions, as it does on an answer. */}
              <AuthorLine author={q.mine ? { ...q.author, name: "You" } : q.author} stamp={false} />
            </div>
            {/* Like and reply only. Save, the link and the dots are up in the
                bar, where they stay put while the thread scrolls. */}
            <PostActions
              liked={!!likes[q.id]} likes={likes[q.id] ? 1 : 0}
              minsAgo={q.minsAgo}
              onLike={() => toggleLike(q.id)}
              onReply={() => setCompose({ quote: null })}
            />
          </div>

          {/* Answers */}
          {ordered.length === 0 ? (
            <EmptyAnswers writable={writable} />
          ) : (
            <>
              {official.length > 0 && (
                <>
                  <Heading>{official.length === 1 ? "The Answer" : "The Answers"}</Heading>
                  {official.map(a => renderAnswer(a))}
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
                  {rest.map(a => renderAnswer(a))}
                </>
              )}
            </>
          )}
        </div>
      </Body>

      {compose ? (
        <AnswerSheet
          questionId={q.id} quote={compose.quote}
          onClose={() => setCompose(null)}
          onPosted={() => { setCompose(null); setToast("Your answer is up"); }}
        />
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
        <div style={{
          flexShrink: 0, borderTop: `1px solid ${CC.line}`, background: CC.white,
          padding: `10px ${PAD}px calc(12px + env(safe-area-inset-bottom))`,
        }}>
          <button onClick={() => setCompose({ quote: null })} style={{
            width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: CC.pink, color: "#fff", fontSize: 15.5, fontWeight: 700,
          }}>
            <CornerUpLeft size={17} /> Answer this
          </button>
        </div>
      )}

      {menu && (
        <MoreMenu
          onClose={() => setMenu(false)}
          items={q.mine ? [
            { icon: Pencil, label: "Edit question", onClick: () => setEditing(true) },
            { icon: Trash2, label: "Delete question", danger: true, onClick: () => setConfirmGone(true) },
          ] : [
            {
              icon: Flag, danger: true, done: !!reports[q.id],
              label: reports[q.id] ? "Reported" : "Report this question",
              onClick: reports[q.id] ? undefined : () => setReport({ id: q.id, what: "question" }),
            },
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


function EditSheet({ q, onClose, onSave }) {
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
