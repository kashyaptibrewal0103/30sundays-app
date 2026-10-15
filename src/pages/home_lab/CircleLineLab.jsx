import { Link, useNavigate } from "react-router-dom";
import { C } from "../../data";
import { NAVY, PAD, W } from "./labShared";
import { BoardingPassCard, CIRCLE_LINES, useBookedTrip } from "./BookedHomes";

// The Community under the pass, as a line rather than a second card. Two cards
// the same size stacked read as two boxes put together, which is the note that
// started this. Each option is shown under a real pass, at real width.

export default function CircleLineLab() {
  const t = useBookedTrip();
  const navigate = useNavigate();
  return (
    <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: W.page }}>
      <div style={{ padding: `16px ${PAD}px 60px` }}>
        <Link to="/home-lab" style={{ fontSize: 12.5, fontWeight: 700, color: C.p600, textDecoration: "none" }}>Home lab</Link>
        <h1 style={{ margin: "10px 0 0", fontSize: 24, fontWeight: 800, color: NAVY, letterSpacing: "-0.5px" }}>
          One line, five ways
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.sub, lineHeight: "20px" }}>
          The Community card came off the home because two cards of the same
          size stacked read as two boxes. This is what goes under the pass
          instead. Each one is shown under a real pass, at real width.
        </p>

        {CIRCLE_LINES.map((v) => (
          <div key={v.n} style={{ marginTop: 30 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", background: NAVY, color: "#fff",
                display: "grid", placeItems: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0,
              }}>{v.n}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>{v.name}</span>
            </div>
            <p style={{ margin: "7px 0 12px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>{v.note}</p>
            <BoardingPassCard t={t} page={W.page} ink={NAVY} />
            <div style={{ marginTop: 14 }}>
              <v.Comp t={t} onOpen={() => navigate(`/community/${t.room.id}?from=home`)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
