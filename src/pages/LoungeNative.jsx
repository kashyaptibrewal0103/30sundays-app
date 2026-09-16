import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { NATIVE_STYLES } from "../components/Community/NativeStyles";
import { getDest, questionsFor, tagsFor } from "../data/communityData";
import { useCommunity } from "../state/useCommunity";

// The same screen again, six times, built only out of patterns the app is
// already using elsewhere. Nothing new to learn, and nothing that looks like
// it was designed by somebody who had not seen the hotel listing.

export default function LoungeNative() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { answersFor } = useCommunity();

  const asked = params.get("s");
  const v = NATIVE_STYLES.find(x => x.id === asked) || NATIVE_STYLES[0];
  const [picked, setPicked] = useState(null);

  const d = getDest("thailand");
  const qs = questionsFor("thailand").slice(0, 6);
  const tags = tagsFor("thailand");
  const countOf = (q) => answersFor(q).length;

  return (
    <Screen>
      <TopBar
        title="Lounge, app native"
        sub={`${v.n} of ${NATIVE_STYLES.length} · ${v.name}`}
        onBack={() => navigate("/community/thailand")}
      />

      <Body>
        <div style={{
          position: "sticky", top: 0, zIndex: 20, background: CC.white,
          borderBottom: `1px solid ${CC.line}`,
        }}>
          <div style={{
            display: "flex", gap: 6, padding: `10px ${PAD}px`, overflowX: "auto",
            scrollbarWidth: "none",
          }}>
            {NATIVE_STYLES.map(s => (
              <button key={s.id} onClick={() => setParams({ s: s.id })} style={{
                flexShrink: 0, minHeight: 36, padding: "0 13px", borderRadius: 999,
                cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700,
                border: `1px solid ${v.id === s.id ? CC.ink : CC.line}`,
                background: v.id === s.id ? CC.ink : CC.white,
                color: v.id === s.id ? "#fff" : CC.body,
              }}>{s.n}. {s.name}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: `16px ${PAD}px 0` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%", background: CC.ink, color: "#fff",
              display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
            }}>{v.n}</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: CC.ink }}>{v.name}</span>
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

        <div style={{ height: 6, background: CC.well, margin: "18px 0 0" }} />

        <v.Comp d={d} qs={qs} tags={tags} countOf={countOf} answersFor={answersFor} />

        <div style={{ padding: `16px ${PAD}px 40px` }}>
          <button onClick={() => setPicked(v.id)} style={{
            width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer",
            fontFamily: "inherit", fontSize: 14, fontWeight: 700,
            border: `1px solid ${picked === v.id ? CC.pink : CC.line}`,
            background: picked === v.id ? CC.pinkTint : CC.white,
            color: picked === v.id ? CC.pinkInk : CC.ink,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            {picked === v.id ? <><Check size={16} /> Picked {v.name}</> : `Pick ${v.name}`}
          </button>
        </div>
      </Body>
    </Screen>
  );
}
