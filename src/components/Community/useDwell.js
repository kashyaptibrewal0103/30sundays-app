import { useEffect, useRef } from "react";
import { track } from "../../data/communityData";

// How long a screen was open, and how far down it got.
//
// One pair of events per screen rather than a scroll event every few hundred
// pixels: the open says what was entered, the close says whether it was read.
// Everything else about reading can be derived from those two.
//
// `extra()` is read at close time, so counts that grow while the screen is open
// (answers seen, cards rendered) are current rather than whatever they were on
// mount.
export function useDwell(event, props, extra) {
  const started = useRef(Date.now());
  const deepest = useRef(0);
  const scroller = useRef(null);
  const latest = useRef({ props, extra });
  latest.current = { props, extra };

  // The scrolling element is the screen body, which is not the window in a
  // phone frame, so it has to be found rather than assumed.
  useEffect(() => {
    const el = [...document.querySelectorAll("*")].find(
      n => n.scrollHeight > n.clientHeight + 40
        && getComputedStyle(n).overflowY === "auto"
        && n.clientHeight > 260,
    );
    if (!el) return undefined;
    scroller.current = el;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      deepest.current = Math.max(deepest.current, Math.round((el.scrollTop / max) * 100));
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const openedAt = started.current;
    track(`community_${event}_opened`, latest.current.props);
    return () => {
      const { props: p, extra: ex } = latest.current;
      track(`community_${event}_closed`, {
        ...p,
        dwellMs: Date.now() - openedAt,
        maxScrollPercent: deepest.current,
        ...(typeof ex === "function" ? ex() : {}),
      });
    };
    // Deliberately once per mount. A prop change is not a new view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}
