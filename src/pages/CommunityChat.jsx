import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { getDest, dayLabel, membersOf } from "../data/communityData";
import { Screen, Body, TopBar } from "../components/Gift/GiftUI";
import { PAD, ChatBubble, DayDivider, UnreadDivider, Composer, Toast } from "../components/Community/CommunityUI";
import { Sheet } from "../components/Gift/GiftUI";

// The group chat: everyone going to the same place in the same month. Our
// team posts checkpoints into it, which is what makes it worth opening.

export default function CommunityChat() {
  const { dest = "bali" } = useParams();
  const navigate = useNavigate();
  const { messagesFor, sendMessage, unreadFor, readChat } = useCommunity();
  const [toast, setToast] = useState(null);
  const [who, setWho] = useState(false);
  // Read on arrival, but the count at arrival is kept so the marker stays put
  // while the screen is open rather than vanishing under the reader.
  const [unread] = useState(() => unreadFor(dest));
  useEffect(() => { readChat(dest); }, [dest, readChat]);

  const d = getDest(dest);
  const closed = d.cohort.state === "closed";
  const messages = messagesFor(dest);

  // The list owns its own scroll. Sending a message is the only thing that
  // moves it, so typing never throws the position away.
  const endRef = useRef(null);
  const count = messages.length;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [count]);

  let lastDay = null;
  const firstUnread = unread > 0 ? messages.length - unread : -1;

  return (
    <Screen>
      <TopBar
        title={`${d.name}, ${d.month}`}
        sub={closed ? `Closed on ${d.cohort.closedOn}` : `${d.cohort.members} travellers going`}
        onBack={() => navigate(`/community/${dest}`)}
        right={
          <button onClick={() => setWho(true)} style={{
            minHeight: 40, padding: "0 4px", border: "none", background: "none",
            cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, fontWeight: 600, color: CC.body,
            textDecoration: "underline", textUnderlineOffset: 3,
            textDecorationColor: CC.line,
          }}>Who is here</button>
        }
      />

      <Body>
        <div style={{ padding: `4px ${PAD}px 16px` }}>
          {closed && (
            <div style={{
              background: CC.well, borderRadius: 16, padding: "14px 16px", margin: "8px 0 4px",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <Lock size={16} color={CC.soft} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: CC.body, margin: 0, lineHeight: "19px" }}>
                Your month has been and gone, so this chat is read only now. Everything
                shared here stays for whoever travels after you.
              </p>
            </div>
          )}

          {messages.map((m, i) => {
            const day = dayLabel(m.minsAgo ?? 0);
            const showDay = day !== lastDay;
            lastDay = day;
            return (
              <div key={m.id}>
                {showDay && <DayDivider label={day} />}
                {unread > 0 && i === firstUnread && <UnreadDivider n={unread} />}
                <ChatBubble msg={m} />
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </Body>

      {closed ? (
        <div style={{
          flexShrink: 0, borderTop: `1px solid ${CC.line}`, background: CC.well,
          padding: `14px ${PAD}px calc(16px + env(safe-area-inset-bottom))`, textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: CC.body, margin: 0 }}>This chat has closed</p>
        </div>
      ) : (
        <Composer
          placeholder="Say something to the group"
          onSend={({ text, image }) => {
            if (window.__communityFailNext) {
              window.__communityFailNext = false;
              setToast("That did not send. Try again.");
              return;
            }
            sendMessage({ dest, text, image });
          }}
        />
      )}

      {who && (
        <Sheet
          title="Who is here"
          sub={`${d.cohort.members} travellers going to ${d.name} in ${d.month.split(" ")[0]}`}
          onClose={() => setWho(false)}
        >
          {/* Names and nothing else. Anything more would turn a room into a
              directory, and nobody joined to be looked up. */}
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {membersOf(dest).map((name, i) => (
              <li key={name} style={{
                fontSize: 15, color: CC.ink, padding: "11px 2px",
                borderTop: i ? `1px solid ${CC.line}` : "none",
              }}>{name}</li>
            ))}
          </ul>
        </Sheet>
      )}

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </Screen>
  );
}
