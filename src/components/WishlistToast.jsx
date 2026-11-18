import { useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { C } from "../data";
import { useWishlist } from "../data/wishlist";

// Where the line sits. It looks for whatever is floating at the bottom of the
// screen right now (the tab bar, a sticky button, a price bar) and sits just
// above it. With nothing there it drops to the bottom edge, so there is never
// a gap of empty photo under it.
const EDGE = 20; // from the bottom of the screen when nothing floats there
const GAP = 10; // above a floating bar

// True when el scrolls with the page, i.e. it sits inside a scrolling box.
function inScroller(el, frame) {
  for (let p = el.parentElement; p && p !== frame; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return true;
  }
  return false;
}

function measureBottom(frame, self) {
  const box = frame.getBoundingClientRect();
  let top = box.bottom;
  frame.querySelectorAll("*").forEach((el) => {
    if (self && (el === self || self.contains(el))) return;
    const r = el.getBoundingClientRect();
    // Touching the bottom, at least half the width, and a bar, not a page.
    if (r.height === 0 || r.bottom < box.bottom - 40 || r.bottom > box.bottom + 2) return;
    if (r.width < box.width * 0.5 || r.height > box.height * 0.4) return;
    if (r.top >= top) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.opacity === "0") return;
    // Pinned to the screen, or outside the part that scrolls. Content that
    // just happens to be at the bottom of the page right now does not count.
    if (cs.position !== "fixed" && cs.position !== "sticky" && inScroller(el, frame)) return;
    top = r.top;
  });
  return top >= box.bottom ? EDGE : Math.round(box.bottom - top + GAP);
}

// ─── "Saved to your wishlist", once for the whole app ───
//
// Every heart used to be on its own about what happened after you pressed it.
// My Plans put up a line with a link, the itinerary said nothing, the discover
// cards filled the heart and left it there. One line now, raised by the store
// whenever a heart turns on, with the one link that matters: the wishlist,
// opened on the destination you just saved into.
//
// It stays out of the way on the wishlist itself, where "View board" would point
// at the screen you are on. There it only says "removed", with an Undo.

export default function WishlistToast() {
  const { toast, dismissToast, undoRemove } = useWishlist();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [bottom, setBottom] = useState(EDGE);
  const [node, setNode] = useState(null);

  useLayoutEffect(() => {
    if (!toast || !node) return;
    const frame = document.getElementById("phone-frame");
    if (frame) setBottom(measureBottom(frame, node));
  }, [toast, node, pathname]);

  const removed = toast?.type === "removed";
  // "View wishlist" is pointless on the wishlist itself; "Undo" is not.
  if (!toast || (!removed && pathname.startsWith("/saved"))) return null;

  const open = () => {
    dismissToast();
    navigate(`/saved/board/${encodeURIComponent(toast.dest)}`);
  };

  return (
    <div
      key={toast.at}
      ref={setNode}
      role="status"
      style={{
        position: "absolute", left: 16, right: 16, bottom: bottom === EDGE ? `calc(${EDGE}px + env(safe-area-inset-bottom, 0px))` : bottom, zIndex: 1200,
        background: C.head, color: "#fff", borderRadius: 12, padding: "11px 14px",
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.22)", animation: "toastSlideUp 0.25s ease-out",
      }}
    >
      <Heart size={15} color={C.p300} fill={removed ? "none" : C.p300} style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 1.5 }} />
      <span style={{ flex: 1, fontSize: 13, lineHeight: "18px", minWidth: 0 }}>
        {removed ? `${toast.name} removed from your ${toast.dest} board.` : `${toast.name} saved to your ${toast.dest} board.`}
      </span>
      <button
        onClick={removed ? undoRemove : open}
        style={{ flexShrink: 0, background: "none", border: "none", color: "#fff", fontSize: 13, fontWeight: 800, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit", padding: 0 }}
      >
        {removed ? "Undo" : "View board"}
      </button>
    </div>
  );
}
