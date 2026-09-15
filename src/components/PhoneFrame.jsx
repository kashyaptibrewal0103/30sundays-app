import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { C } from "../data";

const MOBILE_BREAKPOINT = 768;

// Pages where BottomNav is rendered. Mirror BottomNav.showOn so the scroll
// container only reserves space when the nav is actually visible.
const NAV_PATHS = new Set(["/", "/ai", "/plan", "/trips", "/account"]);

export default function PhoneFrame({ children }) {
  const scrollRef = useRef(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navPad = NAV_PATHS.has(location.pathname) ? 84 : 0;

  // Mobile: render full-screen, no frame chrome. Fixed viewport height so
  // the bottom nav can stick to the bottom across scroll / route changes.
  if (isMobile) {
    return (
      <div id="phone-frame" style={{ width: "100vw", height: "100dvh", background: C.white, fontFamily: "'Figtree', sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: navPad, WebkitOverflowScrolling: "touch" }} className="hide-scrollbar">
          {children}
        </div>
      </div>
    );
  }

  // Desktop: show the iOS-style phone frame
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#E5E5E5", fontFamily: "'Figtree', sans-serif" }}>
      <div id="phone-frame" style={{ width: 390, height: 844, background: C.white, borderRadius: 44, overflow: "hidden", position: "relative", boxShadow: "0 25px 80px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column" }}>
        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px 0", fontSize: 14, fontWeight: 600, color: C.head, zIndex: 30 }}>
          <span>9:41</span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="16" height="11" viewBox="0 0 16 11"><rect y="4" width="3" height="7" rx="1" fill={C.head}/><rect x="4.5" y="2.5" width="3" height="8.5" rx="1" fill={C.head}/><rect x="9" y="1" width="3" height="10" rx="1" fill={C.head}/><rect x="13" width="3" height="11" rx="1" fill={C.head}/></svg>
            <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.5c2.2 0 4.2 1 5.5 2.5l1-1c-1.7-2-4.1-3.2-6.5-3.2S2.7 2 1 4l1 1c1.3-1.5 3.3-2.5 5.5-2.5z" fill={C.head}/><path d="M7.5 6c1.2 0 2.4.5 3.2 1.3l1-1C10.5 5.2 9.1 4.5 7.5 4.5S4.5 5.2 3.3 6.3l1 1C5.1 6.5 6.3 6 7.5 6z" fill={C.head}/><circle cx="7.5" cy="9.5" r="1.5" fill={C.head}/></svg>
            <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0" y="0.5" width="21" height="10" rx="2" stroke={C.head} strokeWidth="1" fill="none"/><rect x="22" y="3.5" width="2" height="4" rx="1" fill={C.head}/><rect x="1.5" y="2" width="17" height="7" rx="1" fill={C.head}/></svg>
          </div>
        </div>
        {/* Notch */}
        <div style={{ width: 126, height: 36, background: "#000", borderRadius: 20, position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)", zIndex: 30 }} />

        {/* Scrollable content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingBottom: navPad }} className="hide-scrollbar">
          {children}
        </div>

        {/* Home indicator */}
        <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, borderRadius: 3, background: C.head, zIndex: 30 }} />
      </div>
    </div>
  );
}
