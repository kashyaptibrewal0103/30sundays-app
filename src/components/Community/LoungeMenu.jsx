import { Bell, User, FileText, Lightbulb, ChevronRight } from "lucide-react";
import { CC } from "./tokens";
import { Sheet } from "../Gift/GiftUI";
import { TravellerMark } from "./CommunityUI";
import { useCommunity } from "../../state/useCommunity";
import { ME, track } from "../../data/communityData";

// Everything about the traveller rather than about the rooms.
//
// The header used to carry Guidelines, which is a thing you read once. A menu
// holds the handful of screens that are yours: who you are, what reaches you,
// what you wrote, and the way to tell us the rules are wrong. The rules
// themselves are a row on the screen behind this one, so they are not repeated.

const ROWS = [
  { key: "profile", icon: User, to: "/lounge/profile",
    label: "Your Profile", sub: "Photo, name, and what you have seen" },
  { key: "notify", icon: Bell, to: "/lounge/settings",
    label: "Notification Settings", sub: "Choose what reaches you" },
  { key: "posts", icon: FileText, to: "/lounge/my-posts",
    label: "Your Posts", sub: "Everything you asked and answered" },
  { key: "suggest", icon: Lightbulb, to: "/lounge/suggest",
    label: "Suggest A Change", sub: "A feature, a rule, anything off" },
];

export default function LoungeMenu({ onClose, onGo }) {
  const { profile } = useCommunity();

  return (
    <Sheet title="Sunday Lounge" onClose={onClose}>
      <div style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
        {/* Who you are here, at the top, because the rest of the menu is about
            what happens to what this person writes. */}
        <button
          onClick={() => { track("community_menu_row", { row: "profile" }); onGo("/lounge/profile"); }}
          style={{
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            padding: "12px 0", border: "none", background: "none", cursor: "pointer",
            fontFamily: "inherit", textAlign: "left",
            borderBottom: `1px solid ${CC.line}`,
          }}
        >
          {profile.photo ? (
            <img src={profile.photo} alt="" style={{
              width: 46, height: 46, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
            }} />
          ) : <TravellerMark name={ME.name} size={46} />}
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: CC.ink }}>
              {ME.name}
            </span>
            <span style={{ display: "block", marginTop: 2, fontSize: 12.5, color: CC.body }}>
              {ME.stamp.destination}, {ME.stamp.month}
            </span>
          </span>
          <ChevronRight size={18} color={CC.soft} />
        </button>

        {ROWS.filter(r => r.key !== "profile").map(r => {
          const Icon = r.icon;
          return (
            <button
              key={r.key}
              onClick={() => { track("community_menu_row", { row: r.key }); onGo(r.to); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "13px 0", border: "none", background: "none", cursor: "pointer",
                fontFamily: "inherit", textAlign: "left",
                borderBottom: `1px solid ${CC.line}`,
              }}
            >
              <span style={{
                width: 36, height: 36, borderRadius: "50%", background: CC.well,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}><Icon size={17} color={CC.body} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: CC.ink }}>
                  {r.label}
                </span>
                <span style={{ display: "block", marginTop: 2, fontSize: 12, color: CC.soft }}>
                  {r.sub}
                </span>
              </span>
              <ChevronRight size={17} color={CC.soft} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
