import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, QuestionCard } from "../components/Community/CommunityUI";
import { HELP_VARIANTS } from "../components/Community/HelpVariants";
import { FILTER_VARIANTS } from "../components/Community/SortFilterVariants";
import { ACTION_VARIANTS } from "../components/Community/PostActionVariants";
import { REPLY_VARIANTS } from "../components/Community/ReplyBarVariants";
import { AuthorLine } from "../components/Community/CommunityUI";
import { sortQuestions } from "../components/Community/FeedFilters";
import { getDest, questionsFor, tagsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";

// Two parts of the Lounge, side by side with their alternatives. One tab asks
// somebody to answer; the other narrows the list. Both are shown in place,
// with the real questions under them, because neither can be judged alone.

const TABS = [
  { id: "help", label: "Ask to answer" },
  { id: "filters", label: "Sort and filter" },
  { id: "actions", label: "Post actions" },
  { id: "reply", label: "Answer bar" },
];

export default function LoungeParts() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab");
  const tab = TABS.some(t => t.id === asked) ? asked : "help";
  const [picked, setPicked] = useState(null);

  const { answersFor } = useCommunity();
  const d = getDest("thailand");
  const all = questionsFor("thailand");
  const tags = tagsFor("thailand");
  const needsHelp = [...all].filter(q => answersFor(q).length === 0)[0] || all[0];

  const counts = tags.reduce((m, t) => ({
    ...m, [t]: all.filter(q => (q.tags || []).includes(t)).length,
  }), {});

  const list = tab === "help" ? HELP_VARIANTS
    : tab === "filters" ? FILTER_VARIANTS
      : tab === "actions" ? ACTION_VARIANTS : REPLY_VARIANTS;

  return (
    <Screen>
      <TopBar
        title="Lounge parts"
        sub={tab === "help" ? "Five ways to ask"
          : tab === "filters" ? "Six ways to sort"
            : tab === "actions" ? "Six ways to carry the actions"
              : "Five ways to invite an answer"}
        onBack={() => navigate("/community/thailand")}
      />
      <Body>
        <div style={{ padding: "14px 0 40px" }}>

          <div style={{ display: "flex", gap: 6, padding: `0 ${PAD}px` }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setParams({ tab: t.id }); setPicked(null); }} style={{
                flex: 1, minHeight: 44, borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                fontSize: 12.5, fontWeight: 700, padding: "0 6px",
                border: `1px solid ${tab === t.id ? CC.ink : CC.line}`,
                background: tab === t.id ? CC.ink : CC.white,
                color: tab === t.id ? "#fff" : CC.body,
              }}>{t.label}</button>
            ))}
          </div>

          {list.map(v => (
            <section key={v.id}>
              <div style={{ height: 6, background: CC.well, margin: "22px 0" }} />

              <div style={{ padding: `0 ${PAD}px 14px` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", background: CC.ink, color: "#fff",
                    display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
                  }}>{v.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: CC.ink }}>{v.name}</span>
                  <Tag>{v.tag}</Tag>
                  <Tag plain>{v.weight || v.height}</Tag>
                </div>
                <p style={{ fontSize: 13, color: CC.body, margin: "8px 0 0", lineHeight: "19px" }}>
                  {v.note}
                </p>
                <p style={{ fontSize: 13, color: CC.soft, margin: "6px 0 0", lineHeight: "19px" }}>
                  What it costs: {v.cost}
                </p>
              </div>

              {tab === "help" && <HelpDemo v={v} q={needsHelp} />}
              {tab === "filters" && <FilterDemo v={v} all={all} tags={tags} counts={counts} answersFor={answersFor} />}
              {tab === "actions" && <ActionsDemo v={v} q={all[0]} />}
              {tab === "reply" && <ReplyDemo v={v} q={all[0]} />}

              <div style={{ padding: `16px ${PAD}px 0` }}>
                <button onClick={() => setPicked(v.id)} style={{
                  width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                  border: `1px solid ${picked === v.id ? CC.pink : CC.line}`,
                  background: picked === v.id ? CC.pinkTint : CC.white,
                  color: picked === v.id ? CC.pinkInk : CC.ink,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  {picked === v.id ? <><Check size={16} /> Picked {v.n}</> : `Pick ${v.n}`}
                </button>
              </div>
            </section>
          ))}
        </div>
      </Body>
    </Screen>
  );
}

function Tag({ children, plain }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 999,
      background: plain ? CC.well : CC.goldTint,
      border: `1px solid ${plain ? CC.line : CC.goldLine}`,
      fontSize: 10.5, fontWeight: 700, color: plain ? CC.body : CC.goldInk,
    }}>{children}</span>
  );
}

/* ─── Each option, in the place it would really sit ─── */

function HelpDemo({ v, q }) {
  const [gone, setGone] = useState(false);
  return (
    <div style={{ padding: v.bleed ? 0 : `0 ${PAD}px`, overflow: "hidden" }}>
      <div style={{ padding: v.bleed ? `0 ${PAD}px` : 0 }}>
        {gone
          ? <Closed onBack={() => setGone(false)} />
          : <v.Comp q={q} onAnswer={() => {}} onClose={() => setGone(true)} />}
      </div>
    </div>
  );
}

function Closed({ onBack }) {
  return (
    <div style={{
      border: `1px dashed ${CC.line}`, borderRadius: 14, background: CC.well,
      padding: "16px", textAlign: "center",
    }}>
      <p style={{ fontSize: 13, color: CC.body, margin: 0 }}>Closed. It does not come back.</p>
      <button onClick={onBack} style={{
        marginTop: 8, padding: 0, minHeight: 32, border: "none", background: "none",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: CC.pink,
      }}>Show it again</button>
    </div>
  );
}

// Two answers stacked, because the cost of this row is what it does when it
// repeats, not what it looks like once.
function ActionsDemo({ v, q }) {
  const answers = (q.answers || []).slice(0, 2);
  return (
    <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
      {answers.map(a => <ActionCard key={a.id} a={a} v={v} />)}
    </div>
  );
}

// The bar in the place it lives: pinned under a thread that is still running.
function ReplyDemo({ v, q }) {
  const a = (q.answers || [])[0];
  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <div style={{
        position: "relative", height: 300, overflow: "hidden", display: "flex",
        flexDirection: "column", border: `1px solid ${CC.line}`, borderRadius: 16,
        background: CC.white,
      }}>
        <div style={{ flex: 1, overflow: "hidden", padding: "14px 15px" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: CC.ink, margin: 0, lineHeight: "22px" }}>
            {q.title}
          </p>
          {a && (
            <div style={{
              marginTop: 12, paddingTop: 12, borderTop: `1px solid ${CC.line}`,
            }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: CC.ink, margin: 0 }}>
                {a.author?.name}
              </p>
              <p style={{ fontSize: 14, color: CC.ink, margin: "5px 0 0", lineHeight: "20px" }}>
                {a.body}
              </p>
            </div>
          )}
        </div>
        <v.Comp onOpen={() => {}} onSend={() => {}} />
      </div>
    </div>
  );
}

function ActionCard({ a, v }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const actions = {
    liked, likes: (a.likes || 0) + (liked ? 1 : 0), bookmarked: saved, mine: false,
    onLike: () => setLiked(v => !v), onBookmark: () => setSaved(v => !v),
    onReply: () => {}, onCopy: () => {}, onReport: () => {},
  };
  return (
    <div style={{
      background: CC.white, borderRadius: 16, border: `1px solid ${CC.line}`, padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <AuthorLine author={a.author} minsAgo={a.minsAgo} />
        </div>
        {v.inHeader && <v.Comp {...actions} />}
      </div>
      <p style={{ fontSize: 14.5, color: CC.ink, margin: "12px 0 0", lineHeight: "22px" }}>{a.body}</p>
      {!v.inHeader && <v.Comp {...actions} />}
    </div>
  );
}

function FilterDemo({ v, all, tags, counts, answersFor }) {
  const [sort, setSort] = useState("recent");
  const [tag, setTag] = useState(null);
  const shown = sortQuestions(tag ? all.filter(q => (q.tags || []).includes(tag)) : all, sort, answersFor);

  return (
    <div>
      <v.Comp
        sort={sort} onSort={setSort}
        tags={tags} tag={tag} onTag={setTag}
        counts={counts} matches={shown.length}
      />
      <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.slice(0, 2).map(q => (
          <QuestionCard key={q.id} q={q} answerCount={answersFor(q).length} onClick={() => {}} />
        ))}
      </div>
    </div>
  );
}
