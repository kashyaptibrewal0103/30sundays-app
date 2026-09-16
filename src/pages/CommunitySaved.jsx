import { useNavigate, useParams } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { getDest } from "../data/communityData";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, QuestionCard } from "../components/Community/CommunityUI";

// Saved threads, and nothing else. The cards and the thread behind them are
// the same ones as the feed, so this is a filter with a door rather than a
// second way of reading the Lounge.

export default function CommunitySaved() {
  const { dest = "thailand" } = useParams();
  const navigate = useNavigate();
  const { questionsFor, answersFor, bookmarks, reports } = useCommunity();

  const d = getDest(dest);
  const saved = questionsFor(dest).filter(q => bookmarks[q.id] && !reports[q.id]);

  return (
    <Screen>
      <TopBar
        title="Saved"
        sub={`${d.name} · ${d.month}`}
        onBack={() => navigate(`/community/${dest}`)}
      />
      <Body>
        <div style={{ padding: "14px 0 32px" }}>
          {saved.length > 0 ? (
            <>
              <p style={{
                fontSize: 12, fontWeight: 700,
                color: CC.body, margin: `0 ${PAD}px 10px`,
              }}>{saved.length} {saved.length === 1 ? "Thread" : "Threads"}</p>

              <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
                {saved.map(q => (
                  <QuestionCard
                    key={q.id} q={q}
                    answerCount={answersFor(q).length}
                    onClick={() => navigate(`/community/${dest}/q/${q.id}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: `28px ${PAD}px 12px` }}>
              <span style={{
                width: 52, height: 52, borderRadius: "50%", background: CC.well,
                display: "grid", placeItems: "center", margin: "0 auto 14px",
              }}><Bookmark size={21} color={CC.soft} /></span>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, color: CC.ink, margin: "0 0 6px" }}>
                Nothing saved yet
              </h3>
              <p style={{ fontSize: 13.5, color: CC.body, margin: 0, lineHeight: "20px" }}>
                Save a question and it waits here for you, on the trip and after it.
              </p>
            </div>
          )}
        </div>
      </Body>
    </Screen>
  );
}
