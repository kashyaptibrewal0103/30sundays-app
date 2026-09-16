import { useNavigate } from "react-router-dom";
import { useCommunity } from "../../state/useCommunity";
import { DESTINATIONS, PEOPLE } from "../../data/communityData";
import { ENTRY_VARIANTS } from "./TripEntryVariants";

// Sunday Lounge, as it appears inside a trip. The trip is the way in, so this
// never reads as a separate part of the app.
//
// The layout is one of the eleven on /community-entries. Change VARIANT and the
// trip screen changes with it.
//
// A trip with no community renders nothing, which is what keeps this safe to
// drop into every trip.

const VARIANT = "band-recent";

const byTrip = Object.values(DESTINATIONS).reduce((m, d) => ({ ...m, [d.tripId]: d }), {});
const FACES = [PEOPLE.aisha, PEOPLE.gaurav, PEOPLE.farah, PEOPLE.lakshmi];

export default function TripCommunitySection({ trip, divider = null }) {
  const navigate = useNavigate();
  const { questionsFor, answeredCount, unreadFor } = useCommunity();

  const d = byTrip[trip.id];
  if (!d) return null;

  const questions = questionsFor(d.id);
  const { Comp, bleed } = ENTRY_VARIANTS.find(v => v.id === VARIANT) || ENTRY_VARIANTS[0];

  // A bleeding layout sits flush against the grey dividers either side. The
  // negative top margin eats the divider's own 24px, which would otherwise
  // show as a white strip above the band.
  const frame = bleed
    ? { marginTop: -24, marginBottom: 0 }
    : { marginBottom: 24 };

  return (
    <>
      <div style={frame}>
        <Comp
          d={d}
          count={questions.length}
          answered={answeredCount(d.id)}
          unread={unreadFor(d.id)}
          questions={questions}
          top={questions[0]}
          faces={FACES}
          // The room is told it was opened from a trip, so its back arrow
          // comes back here, not to a Lounge screen this person never saw.
          onOpen={() => navigate(`/community/${d.id}?from=trip`)}
        />
      </div>
      {divider}
    </>
  );
}
