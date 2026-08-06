import { useEffect, useState } from "react";

// Returns the on-screen rectangle of the phone shell (#phone-frame). On mobile
// that is the whole viewport; on desktop it is the centered 390x844 device box.
// Overlays use this so their dimming / spotlight stays inside the phone.
function readRect() {
  if (typeof document === "undefined") return { left: 0, top: 0, width: 390, height: 844 };
  const el = document.getElementById("phone-frame");
  if (el) {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

export function useFrameRect() {
  const [rect, setRect] = useState(readRect);
  useEffect(() => {
    const update = () => setRect(readRect());
    update();
    window.addEventListener("resize", update);
    const el = document.getElementById("phone-frame");
    let ro;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    return () => {
      window.removeEventListener("resize", update);
      if (ro) ro.disconnect();
    };
  }, []);
  return rect;
}
