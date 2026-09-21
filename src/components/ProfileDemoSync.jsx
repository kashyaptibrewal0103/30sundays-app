import { useEffect, useRef } from "react";
import { useProfile } from "../data/profile";

// Two scenarios have to be reviewable: a traveller whose details we do not hold,
// and one who gave them a while ago. They hang off the demo state switcher, so
// both are one tap apart rather than something to type in every time.
//
//   New, Lead        nothing held, the home sheet asks
//   Customer, Trip Done   already given, the profile screen shows them filled
//
// Only on a change of state, so anything typed during a session survives.
export default function ProfileDemoSync({ userState }) {
  const { seedDemo } = useProfile();
  const last = useRef(null);

  useEffect(() => {
    if (last.current === userState) return;
    last.current = userState;
    seedDemo(userState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState]);

  return null;
}
