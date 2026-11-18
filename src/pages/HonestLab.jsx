import { C } from "../data";
import HonestNote, { HONEST_LOOKS } from "../components/HonestNote";

// Five handwritten looks for the honest bit, each shown as it appears on the
// hotel page, the region page and in the hotel list, so they can be read
// against each other on one screen.
const SAMPLES = [
  { where: "Hotel page", title: "The honest bit", line: "Get to the pool before 9 am and it is all yours. The sea out front is rarely swimmable after 2 pm." },
  { where: "Region page", title: "Ubud, honestly", line: "No beach. The nearest swim is ninety minutes away." },
  { where: "Hotel list", title: "The honest bit", line: "In Hanoi, choose a small boutique.", action: "Read why", tilt: 1 },
];

export default function HonestLab() {
  return (
    <div className="hide-scrollbar" style={{ height: "100%", overflowY: "auto", background: C.white, padding: "16px 16px 40px" }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: ".6px", color: C.p600 }}>THE HONEST BIT</p>
      <h1 style={{ margin: "4px 0 4px", fontSize: 19, fontWeight: 700, color: C.head }}>5 handwritten styles</h1>
      <p style={{ margin: "0 0 20px", fontSize: 12.5, color: C.sub, lineHeight: "18px" }}>
        Same one or two lines in each. Every option is shown as it would look on the hotel page, the region page and the hotel list.
      </p>

      {HONEST_LOOKS.map((look, i) => (
        <div key={look.key} data-testid={`look-${i + 1}`} style={{ marginBottom: 34 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.head }}>
            <span style={{ color: C.p600 }}>{i + 1}.</span> {look.name}
          </p>
          <p style={{ margin: "3px 0 12px", fontSize: 12, color: C.sub, lineHeight: "17px" }}>{look.note}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SAMPLES.map((s) => (
              <div key={s.where}>
                <p style={{ margin: "0 0 4px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".5px", color: C.inact }}>{s.where.toUpperCase()}</p>
                <HonestNote look={look.key} title={s.title} line={s.line} action={s.action} onAction={() => {}} tilt={s.tilt ?? -1.2} testId={`note-${look.key}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
