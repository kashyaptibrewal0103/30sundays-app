import { useParams, useNavigate } from "react-router-dom";
import { CC } from "../components/Community/tokens";
import { GUIDELINES, getDest } from "../data/communityData";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD } from "../components/Community/CommunityUI";

// Pinned and locked. Five rules, no reply action anywhere on the screen.

export default function CommunityGuidelines() {
  const { dest = "bali" } = useParams();
  const navigate = useNavigate();
  const d = getDest(dest);

  return (
    <Screen>
      <TopBar title="Lounge guidelines" onBack={() => navigate(`/community/${dest}`)} />
      <Body>
        <div style={{ padding: `12px ${PAD}px 40px` }}>
          <p style={{ fontSize: 14.5, color: CC.ink, margin: "0 0 18px", lineHeight: "22px" }}>
            This is a room full of people planning the same trip as you. Five things
            keep it useful for everyone.
          </p>

          {/* Plain bullets. A numbered card stack looked considered and made
              every edit a layout decision; a list is just a list. */}
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {GUIDELINES.map(([title, body]) => (
              <li key={title} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", background: CC.gold,
                  flexShrink: 0, marginTop: 8,
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: CC.ink, margin: 0 }}>{title}</p>
                  <p style={{ fontSize: 13.5, color: CC.body, margin: "3px 0 0", lineHeight: "20px" }}>{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p style={{ fontSize: 12.5, color: CC.soft, margin: "16px 2px 0", lineHeight: "18px" }}>
            Our team reads the Sunday Lounge every day. If something here does not
            sit right, tell your consultant and they will pass it on.
          </p>
        </div>
      </Body>
    </Screen>
  );
}
