import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { REPLY_ROW_VARIANTS, BASELINE } from "../components/Community/ReplyRowVariants";
import { questionsFor } from "../data/communityData";

// Six shorter replies, each shown three deep. One reply never looks tall. A
// thread of three is where the chrome starts costing something, so that is
// what gets measured.

export default function LoungeReplyRows() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);
  const [base, setBase] = useState(null);

  const withAnswers = questionsFor("thailand").find(q => (q.answers || []).length >= 3);
  const answers = (withAnswers?.answers || []).slice(0, 3);

  return (
    <Screen>
      <TopBar
        title="Reply height"
        sub="Six shorter replies"
        onBack={() => navigate("/community/thailand")}
      />
      <Body>
        <div style={{ padding: `14px ${PAD}px 0` }}>
          <p style={{ fontSize: 13, color: CC.body, margin: 0, lineHeight: "19px" }}>
            Today a reply spends three stacked rows before the answer starts: the name, the
            trip line, then a row of buttons. Each option below takes at least one of those
            rows away. Heights are measured on this screen, not estimated.
          </p>
        </div>

        <Block label="Today" measure={setBase}>
          {answers.map(a => <Row key={a.id} v={BASELINE} a={a} />)}
        </Block>

        {REPLY_ROW_VARIANTS.map(v => (
          <section key={v.id}>
            <div style={{ height: 6, background: CC.well, margin: "22px 0" }} />

            <div style={{ padding: `0 ${PAD}px 14px` }}>
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

            <Block base={base}>
              {answers.map(a => <Row key={a.id} v={v} a={a} />)}
            </Block>

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

// Measures what it wraps, and says how it compares with today.
function Block({ children, label, base, measure }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => {
      const px = Math.round(el.getBoundingClientRect().height);
      setH(px);
      if (measure) measure(px);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const saved = base && h ? base - h : 0;

  return (
    <div style={{ padding: `0 ${PAD}px` }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: CC.soft, letterSpacing: "0.3px" }}>
          {label || "Three answers"}
        </span>
        <span style={{ flex: 1, height: 1, background: CC.line }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: CC.ink }}>{h}px</span>
        {saved > 0 && (
          <span style={{
            padding: "2px 7px", borderRadius: 999, background: CC.tealTint,
            fontSize: 11, fontWeight: 800, color: CC.tealInk,
          }}>{saved}px shorter</span>
        )}
      </div>
      <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ v, a }) {
  const [liked, setLiked] = useState(false);
  return (
    <v.Comp
      a={a}
      liked={liked}
      likes={(a.likes || 0) + (liked ? 1 : 0)}
      onLike={() => setLiked(x => !x)}
      onReply={() => {}}
      onMore={() => {}}
    />
  );
}
