import { NavLink, useLocation } from "react-router-dom";
import { Compass, Map, Briefcase, User } from "lucide-react";
import { C } from "../data";

const tabs = [
  { to: "/",        label: "Explore",  icon: Compass },
  { to: "/plan",    label: "My Plans", icon: Map },
  { to: "/trips",   label: "My Trips", icon: Briefcase },
  { to: "/account", label: "Account",  icon: User },
];

// Home + its parallel design variants all map to the Explore tab.
const HOME_ROUTES = ["/", "/v3", "/v4", "/v5", "/v6", "/ai"];
// Top-level paths that always show the nav
const showOn = new Set([...HOME_ROUTES, "/trips", "/account"]);

// Tokens
const INACTIVE = "#9097A4";
const BAR_HEIGHT = 60;
const BAR_INSET = 16;
const PILL_INSET = 5;  // pixel inset inside each tab cell - controls active-pill margin
const TAB_COUNT = tabs.length;
const TAB_PCT = 100 / TAB_COUNT;

export default function BottomNav({ userState }) {
  const { pathname } = useLocation();

  // Show nav on main tabs + Plan page for returning users (showing their plans).
  // New users see the full-screen login on /plan, so the nav stays hidden there.
  const visible = showOn.has(pathname) || (pathname === "/plan" && userState !== "new");
  if (!visible) return null;

  const isOn = (to) => (to === "/" ? HOME_ROUTES.includes(pathname) : pathname.startsWith(to));
  const activeIdx = tabs.findIndex((t) => isOn(t.to));

  return (
    <div
      style={{
        position: "absolute",
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${BAR_INSET}px)`,
        left: BAR_INSET,
        right: BAR_INSET,
        height: BAR_HEIGHT,
        borderRadius: 999,
        // Glass surface - slightly more opaque for readability over busy content
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        // Layered shell: subtle hairline rim + top highlight + soft drop shadow
        boxShadow: [
          "0 12px 36px rgba(15, 18, 30, 0.10)",   // diffuse drop
          "0 2px 6px rgba(15, 18, 30, 0.04)",     // close-cast shadow
          "inset 0 1px 0 rgba(255, 255, 255, 0.75)", // top inner highlight
          "inset 0 0 0 0.5px rgba(255, 255, 255, 0.4)", // glass rim
          "0 0 0 0.5px rgba(15, 18, 30, 0.06)",   // hairline outer border
        ].join(", "),
        display: "flex",
        alignItems: "stretch",
        zIndex: 20,
        isolation: "isolate",
      }}
    >
      {/* Sliding active-pill indicator (sits behind tabs) */}
      {activeIdx >= 0 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: PILL_INSET,
            bottom: PILL_INSET,
            width: `calc(${TAB_PCT}% - ${PILL_INSET * 2}px)`,
            left: `calc(${activeIdx * TAB_PCT}% + ${PILL_INSET}px)`,
            borderRadius: 999,
            background:
              "linear-gradient(180deg, rgba(227,27,83,0.07) 0%, rgba(227,27,83,0.13) 100%)",
            boxShadow: [
              "inset 0 1px 0 rgba(255, 255, 255, 0.7)",   // top sheen
              "inset 0 0 0 0.5px rgba(227, 27, 83, 0.10)", // coral rim
              "0 4px 14px rgba(227, 27, 83, 0.10)",        // outward glow
            ].join(", "),
            transition: "left 480ms cubic-bezier(0.32, 0.72, 0, 1)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const on = isOn(tab.to);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="bn-tab"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              textDecoration: "none",
              position: "relative",
              zIndex: 1,
              WebkitTapHighlightColor: "transparent",
              outline: "none",
            }}
          >
            <Icon
              size={20}
              color={on ? C.p600 : INACTIVE}
              strokeWidth={on ? 2.2 : 1.7}
              style={{
                transition:
                  "color 320ms cubic-bezier(0.32, 0.72, 0, 1), stroke-width 320ms ease",
              }}
            />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: on ? 600 : 500,
                color: on ? C.p600 : INACTIVE,
                letterSpacing: 0,
                lineHeight: 1,
                transition: "color 320ms cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              {tab.label}
            </span>
          </NavLink>
        );
      })}

      {/* Press feedback (pseudo-classes - inline can't reach :active) */}
      <style>{`
        .bn-tab        { transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); }
        .bn-tab:active { transform: scale(0.93); }
      `}</style>
    </div>
  );
}
