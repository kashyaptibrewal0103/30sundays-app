import { useEffect, useRef, useState } from "react";
import ProfileSheet from "./ProfileSheet";
import { useProfile } from "../data/profile";

// Decides whether the home screen asks. Counts the visit, waits for home to
// settle, then puts the sheet up only if there is still something to collect
// and the traveller has not already waved it away this session.
export default function ProfileGate({ userState }) {
  const { shouldPrompt, noteVisit, skip } = useProfile();
  const [ready, setReady] = useState(false);
  const counted = useRef(false);

  useEffect(() => {
    // React runs effects twice in development; without this the visit counter
    // would run at double speed and the sheet would arrive a visit early.
    if (!counted.current) {
      counted.current = true;
      noteVisit();
    }
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nothing to save against until there is an account.
  if (userState === "new" || !ready || !shouldPrompt) return null;
  return <ProfileSheet source="home" onClose={skip} />;
}
