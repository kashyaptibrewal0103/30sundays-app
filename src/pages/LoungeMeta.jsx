import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { META_VARIANTS } from "../components/Community/MetaRowVariants";
import { questionsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";

// The bottom line of the question card, five ways. Four questions each time,
// including one nobody has answered, because that is the row where the two
// pieces are closest together.

export default function LoungeMeta() {
  const navigate = useNavigate();
  const { answersFor } = useCommunity();
  const [picked, setPicked] = useState(null);

  const all = questionsFor("thailand");
  const answered = all.filter(q => answersFor(q).length > 0).slice(0, 3);
  const open = all.find(q => answersFor(q).length === 0);
  const qs = open ? [...answered, open] : answered;

  return (
    <Screen>
      <TopBar
        title="Count and time"
        sub="Six ways to part them"
        onBack={() => navigate("/community/thailand")}
      />
      <Body>
        <div style={{ padding: `14px ${PAD}px 0` }}>
          <p style={{ fontSize: 13, color: CC.body, margin: 0, lineHeight: "19px" }}>
            They collide because they are the same size, 8px apart, at the same end of the row.
            More space, a mark between them, opposite ends, a different row, or take one of them off the row entirely.
          </p>
        </div>

        {META_VARIANTS.map(v => (
          <section key={v.id}>
            <div style={{ height: 6, background: CC.well, margin: "20px 0" }} />

            <div style={{ padding: `0 ${PAD}px 12px` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", background: CC.ink, color: "#fff",
                  display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
                }}>{v.n}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: CC.ink }}>{v.name}</span>
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

            <div style={{
              padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8,
            }}>
              {qs.map(q => (
                <v.Comp key={q.id} q={q} n={answersFor(q).length} />
              ))}
            </div>

            <div style={{ padding: `14px ${PAD}px 0` }}>
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

        <div style={{ height: 40 }} />
      </Body>
    </Screen>
  );
}
