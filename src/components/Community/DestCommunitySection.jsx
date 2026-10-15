import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DESTINATIONS, track } from "../../data/communityData";
import { EntryArc } from "./TripEntryVariants";

// The Community, reachable from anywhere a destination is named: an itinerary,
// a destination page, a city page. TripCommunitySection does the same job on a
// booked trip, where the way in is the trip rather than the place.
//
// A place we have no room for renders nothing, which is what makes this safe
// to drop onto every screen that mentions a country.
//
// It fires the same two entry events as the trip card rather than a pair of
// its own. There is one way-in event with a `surface` property, so every door
// stays comparable against every other.

const byName = Object.values(DESTINATIONS).reduce((m, d) => ({ ...m, [d.name.toLowerCase()]: d }), {});

// Bali is in Indonesia and Phuket is in Thailand, so a screen can name a place
// that is not itself a room. Anything we cannot place falls through to nothing.
const ALIASES = {
  indonesia: "bali", ubud: "bali", seminyak: "bali", "nusa penida": "bali",
  phuket: "thailand", krabi: "thailand", bangkok: "thailand",
  hanoi: "vietnam", "ha long bay": "vietnam", "ho chi minh": "vietnam", "hoi an": "vietnam",
};

export function destFor(name) {
  const key = String(name || "").trim().toLowerCase();
  if (!key) return null;
  return byName[key] || byName[ALIASES[key]] || null;
}

export default function DestCommunitySection({ name, surface = "destination", style }) {
  const navigate = useNavigate();
  const d = destFor(name);
  const seen = useRef(false);
  const box = useRef(null);

  useEffect(() => {
    const el = box.current;
    if (!el || !d || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || seen.current) return;
      seen.current = true;
      track("community_lounge_entry_shown", { surface, dest: d.id });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [d, surface]);

  if (!d) return null;

  return (
    <div ref={box} style={style}>
      <EntryArc
        d={d}
        onOpen={() => {
          track("community_lounge_entry_tapped", { surface, dest: d.id });
          navigate(`/community/${d.id}?from=${surface}`);
        }}
      />
    </div>
  );
}
