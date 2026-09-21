import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle, ShieldCheck, AlertTriangle, XCircle, Lock, Bell, CornerUpLeft,
} from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";
import { ago, track } from "../data/communityData";

// Everything that happened to this traveller's posts, in one list.
//
// Most of what the Lounge has to say does not earn a push. It lands here
// instead, and the badge on the way in is the only nudge it gets.

const LOOK = {
  live: { icon: ShieldCheck, tint: CC.tealTint, colour: CC.teal },
  flagged: { icon: AlertTriangle, tint: CC.goldTint, colour: CC.goldInk },
  blocked: { icon: XCircle, tint: CC.pinkTint, colour: CC.pink },
  paused: { icon: Lock, tint: CC.pinkTint, colour: CC.pink },
  appeal: { icon: MessageCircle, tint: CC.tealTint, colour: CC.teal },
  answer: { icon: CornerUpLeft, tint: CC.well, colour: CC.body },
};

export default function CommunityNotifications() {
  const navigate = useNavigate();
  const { notifications, readNotifications } = useCommunity();

  // Opening the list is the read receipt. No separate mark all as read, which
  // is a button that exists only because a list forgot to do its job.
  useEffect(() => {
    track("community_notifications_opened", {
      unreadCount: notifications.filter(n => !n.read).length,
      total: notifications.length,
    });
    readNotifications();
    // Once per open. The unread count is read before it is cleared.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <TopBar title="Notifications" onBack={() => navigate("/lounge")} />
      <Body>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: `40px ${PAD}px` }}>
            <span style={{
              width: 56, height: 56, borderRadius: "50%", background: CC.well,
              display: "grid", placeItems: "center", margin: "0 auto 14px",
            }}><Bell size={24} color={CC.soft} /></span>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: CC.ink, margin: "0 0 6px" }}>
              Nothing yet
            </h3>
            <p style={{ fontSize: 13.5, color: CC.body, margin: 0, lineHeight: "20px" }}>
              Answers to your questions will show up here.
            </p>
          </div>
        ) : (
          <div style={{ padding: "6px 0 32px" }}>
            {notifications.map(n => {
              const look = LOOK[n.kind] || LOOK.answer;
              const Icon = look.icon;
              return (
                <div key={n.id} style={{
                  display: "flex", gap: 12, padding: `13px ${PAD}px`,
                  borderBottom: `1px solid ${CC.line}`,
                  background: n.read ? CC.white : CC.bubbleDeep || CC.well,
                }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: "50%", background: look.tint,
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}><Icon size={15} color={look.colour} /></span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: CC.ink }}>
                      {n.title}
                    </p>
                    <p style={{
                      margin: "3px 0 0", fontSize: 13, color: CC.body, lineHeight: "19px",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>{n.body}</p>
                  </div>

                  <span style={{ flexShrink: 0, fontSize: 11.5, color: CC.soft }}>
                    {ago(Math.max(0, Math.round((Date.now() - n.ts) / 60000)))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Body>
    </Screen>
  );
}
