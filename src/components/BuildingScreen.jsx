import { useEffect } from "react";
import { C } from "../data";
import { BuildingView } from "../pages/Generating";

// ─── Building the itinerary again ───
//
// The same wait screen the wizard shows while a trip is first built, laid
// over the itinerary for every change that sends the trip back through the
// builder: the route, the dates, the party. Just the timeline and the reels.
//
// The host decides how long it shows (the real app waits on the API, about
// a minute, which is what the countdown says) and what happens after.

export default function BuildingScreen({ dest, cities = [], duration = 6000, onDone, frame, testid = "building-screen" }) {
  useEffect(() => {
    const done = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(done);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shell = frame ? { ...frame, zIndex: 320 } : { position: "absolute", inset: 0, zIndex: 320 };

  return (
    <div data-testid={testid} className="hide-scrollbar" style={{ ...shell, background: C.bg, overflowY: "auto" }}>
      <BuildingView dest={dest} cities={cities} checks={false} />
    </div>
  );
}
