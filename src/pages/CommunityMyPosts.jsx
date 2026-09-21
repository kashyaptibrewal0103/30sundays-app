import { useNavigate } from "react-router-dom";
import { MessageSquare, CornerUpLeft, FileText } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { useDwell } from "../components/Community/useDwell";
import { getDest, ago } from "../data/communityData";

// Everything this traveller wrote, questions and answers together, newest
// first. It exists so somebody can find a post again without scrolling a room,
// which is the only honest way to offer a delete.

const STATE = {
  checking: { label: "Being Reviewed", colour: CC.body, tint: CC.well },
  flagged: { label: "In Appeal", colour: CC.goldInk, tint: CC.goldTint },
  blocked: { label: "Taken Down", colour: CC.pink, tint: CC.pinkTint },
};

export default function CommunityMyPosts() {
  const navigate = useNavigate();
  const { asked, answers, findQuestion } = useCommunity();

  const items = [
    ...asked.map(q => ({
      id: q.id, kind: "question", dest: q.dest, qid: q.id,
      title: q.title, body: q.body, status: q.status,
      ts: q.postedAt || Date.now(),
    })),
    ...Object.entries(answers).flatMap(([qid, list]) => list.map(a => {
      const q = findQuestion(qid);
      return {
        id: a.id, kind: "answer", dest: q?.dest, qid,
        title: q?.title || "A question", body: a.body, status: a.status,
        ts: a.postedAt || Date.now(),
      };
    })),
  ].sort((a, b) => b.ts - a.ts);

  useDwell("my_posts", {}, () => ({ count: items.length }));

  return (
    <Screen>
      <TopBar title="Your Posts" onBack={() => navigate(-1)} />
      <Body>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: `48px ${PAD}px` }}>
            <span style={{
              width: 56, height: 56, borderRadius: "50%", background: CC.well,
              display: "grid", placeItems: "center", margin: "0 auto 14px",
            }}><FileText size={23} color={CC.soft} /></span>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: CC.ink, margin: "0 0 6px" }}>
              Nothing Yet
            </h3>
            <p style={{ fontSize: 13.5, color: CC.body, margin: 0, lineHeight: "20px" }}>
              Questions you ask and answers you write show up here.
            </p>
          </div>
        ) : (
          <div style={{ padding: `14px ${PAD}px 34px`, display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map(it => {
              const Icon = it.kind === "question" ? MessageSquare : CornerUpLeft;
              const state = STATE[it.status];
              return (
                <button
                  key={it.id}
                  onClick={() => it.dest && navigate(`/community/${it.dest}/q/${it.qid}?src=my_posts`)}
                  style={{
                    display: "flex", gap: 11, width: "100%", textAlign: "left", cursor: "pointer",
                    fontFamily: "inherit", padding: "13px 14px", background: CC.white,
                    borderRadius: 14, border: `1px solid ${CC.line}`,
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%", background: CC.well,
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}><Icon size={15} color={CC.body} /></span>

                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink,
                      lineHeight: "20px",
                    }}>{it.title}</span>
                    <span style={{
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden", marginTop: 3, fontSize: 13, color: CC.body,
                      lineHeight: "19px",
                    }}>{it.body}</span>

                    <span style={{
                      display: "flex", alignItems: "center", gap: 7, marginTop: 7,
                      fontSize: 11.5, color: CC.soft,
                    }}>
                      <span>{it.kind === "question" ? "You Asked" : "You Answered"}</span>
                      <span>·</span>
                      <span>{it.dest ? getDest(it.dest).name : "Lounge"}</span>
                      <span>·</span>
                      <span>{ago(Math.max(0, Math.round((Date.now() - it.ts) / 60000)))}</span>
                      {state && (
                        <span style={{
                          marginLeft: "auto", padding: "2px 8px", borderRadius: 999,
                          background: state.tint, color: state.colour, fontWeight: 700,
                        }}>{state.label}</span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Body>
    </Screen>
  );
}
