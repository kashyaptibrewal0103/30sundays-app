import { useState, useRef, useEffect } from "react";
import { Lock, AlertTriangle, ImagePlus, X as XIcon, SendHorizontal } from "lucide-react";
import { CC } from "./tokens";
import { useCommunity } from "../../state/useCommunity";
import { ME, checkPost, track } from "../../data/communityData";
import { Sheet, Primary, Secondary } from "../Gift/GiftUI";
import { QuoteBlock } from "./CommunityUI";

// The pieces both the feed and a thread need: attaching a photo, the failure
// note, the two moderation sheets, and the answer composer.
//
// They live here rather than in either page because the feed opens the answer
// composer and the thread opens the feed's sheets. Keeping them in a page made
// the two import each other, which leaves one of them undefined at start up.

export function ImageAttach({ image, setImage }) {
  const [id] = useState(() => `att_${Math.random().toString(36).slice(2, 8)}`);
  if (image) {
    return (
      <div style={{ position: "relative", width: 84 }}>
        <img src={image} alt="" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 12, display: "block" }} />
        <button onClick={() => setImage(null)} aria-label="Remove photo" style={{
          position: "absolute", top: -7, right: -7, width: 24, height: 24, borderRadius: "50%",
          background: CC.ink, border: "none", cursor: "pointer", display: "grid", placeItems: "center",
        }}><XIcon size={13} color="#fff" /></button>
      </div>
    );
  }
  return (
    <>
      <label htmlFor={id} style={{
        display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48, padding: "0 14px",
        borderRadius: 999, border: `1px dashed ${CC.line}`, cursor: "pointer", alignSelf: "flex-start",
        fontSize: 13, fontWeight: 600, color: CC.ink,
      }}>
        <ImagePlus size={16} /> Add a photo
        <span style={{ color: CC.soft, fontWeight: 500 }}>optional</span>
      </label>
      <input id={id} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => setImage(r.result);
          r.readAsDataURL(f);
        }} />
    </>
  );
}

export function FailedNote({ onRetry }) {
  return (
    <div style={{
      display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, marginBottom: 14,
      background: "#FEF3F2", border: "1px solid #F3C4C0",
    }}>
      <AlertTriangle size={16} color="#B42318" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: "#B42318", margin: 0 }}>That did not go up</p>
        <p style={{ fontSize: 13, color: "#B42318", margin: "3px 0 0", lineHeight: "18px" }}>
          Your words are still here. Check your connection and try once more.
        </p>
        <button onClick={onRetry} style={{
          marginTop: 8, minHeight: 36, padding: "0 14px", borderRadius: 9, cursor: "pointer",
          fontFamily: "inherit", border: "1px solid #B42318", background: "transparent",
          fontSize: 13, fontWeight: 700, color: "#B42318",
        }}>Try again</button>
      </div>
    </div>
  );
}

/* ─────────────────────── Moderation ─────────────────────── */

// First offence. Firm about the rule, warm about the person, and the way out
// is to edit rather than to start again.
export function FlaggedSheet({ rule, onEdit, onClose }) {
  return (
    <Sheet
      title="One thing before this goes up"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Primary onClick={onEdit}>Edit the post</Primary>
          <Secondary onClick={onClose}>Cancel</Secondary>
        </div>
      }
    >
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, background: "#FFFAEB", flexShrink: 0,
          display: "grid", placeItems: "center",
        }}><AlertTriangle size={19} color="#B54708" /></span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: CC.ink, margin: 0, lineHeight: "21px" }}>
            {rule.what}
          </p>
          <p style={{ fontSize: 14, color: CC.body, margin: "8px 0 0", lineHeight: "21px" }}>
            {rule.why}
          </p>
          <p style={{ fontSize: 13.5, color: CC.body, margin: "12px 0 0", lineHeight: "20px" }}>
            Take that bit out and it goes straight up. Nothing else you wrote is lost.
          </p>
        </div>
      </div>
    </Sheet>
  );
}

// Second offence. The post does not go up and a person picks it up from here.
export function BlockedSheet({ rule, onClose }) {
  return (
    <Sheet
      title="We have held this one back"
      onClose={onClose}
      footer={<Primary onClick={onClose}>Close</Primary>}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <span style={{
          width: 40, height: 40, borderRadius: 12, background: "#FEF3F2", flexShrink: 0,
          display: "grid", placeItems: "center",
        }}><Lock size={19} color="#B42318" /></span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: CC.ink, margin: 0, lineHeight: "21px" }}>
            {rule.what} This is the second time, so the post has not gone up.
          </p>
          <p style={{ fontSize: 14, color: CC.body, margin: "8px 0 0", lineHeight: "21px" }}>
            Someone on our team will take a look and get back to you. Nothing else
            about your trip is affected, and you can carry on reading the feed.
          </p>
        </div>
      </div>
    </Sheet>
  );
}


// Answering is a bar at the foot of the thread, not a sheet over it.
//
// A sheet covers the question being answered and stops the page scrolling,
// which is exactly backwards: the reason somebody is typing is on the screen
// behind it, and they want to look at it while they write.
//
// So: no scrim, no captured scroll, one line high until there is something to
// say, and it grows from there.
export function AnswerSheet({ questionId, quote, onClose, onPosted }) {
  const { postAnswer, addStrike } = useCommunity();
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [flag, setFlag] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const field = useRef(null);

  const ready = body.trim().length > 4;

  // Grows with the text, up to a point. Past that it scrolls, so the thread
  // behind never loses more than half the screen.
  const grow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  };

  useEffect(() => { field.current?.focus(); }, []);

  const submit = () => {
    const hit = checkPost(body);
    if (hit) {
      const n = addStrike();
      track("community_post_flagged", { rule: hit.id, offence: n });
      if (n >= 2) setBlocked(hit); else setFlag(hit);
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (window.__communityFailNext) { window.__communityFailNext = false; setFailed(true); return; }
      postAnswer(questionId, { body, image });
      onPosted();
    }, 700);
  };

  if (blocked) return <BlockedSheet rule={blocked} onClose={onClose} />;
  if (flag) return <FlaggedSheet rule={flag} onEdit={() => setFlag(null)} onClose={onClose} />;

  return (
    <div style={{
      flexShrink: 0, background: CC.white, borderTop: `1px solid ${CC.line}`,
      padding: `10px ${16}px calc(12px + env(safe-area-inset-bottom))`,
      boxShadow: "0 -8px 24px rgba(37,67,66,0.08)",
    }}>
      {failed && (
        <div style={{ marginBottom: 10 }}>
          <FailedNote onRetry={() => { setFailed(false); submit(); }} />
        </div>
      )}

      {/* Who is about to speak, in one line rather than a panel. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{
          flex: 1, minWidth: 0, fontSize: 11.5, color: CC.body,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {ME.name} · went to {ME.stamp.destination}, {ME.stamp.month}
        </span>
        <button onClick={onClose} aria-label="Close" style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: "none",
          background: CC.well, cursor: "pointer", display: "grid", placeItems: "center",
        }}><XIcon size={13} color={CC.body} /></button>
      </div>

      {quote && (
        <div style={{ marginBottom: 8 }}>
          <QuoteBlock quote={quote} />
        </div>
      )}

      {image && (
        <div style={{ position: "relative", width: 56, marginBottom: 8 }}>
          <img src={image} alt="" style={{
            width: 56, height: 56, objectFit: "cover", borderRadius: 10, display: "block",
          }} />
          <button onClick={() => setImage(null)} aria-label="Remove photo" style={{
            position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%",
            background: CC.ink, border: "none", cursor: "pointer", display: "grid", placeItems: "center",
          }}><XIcon size={12} color="#fff" /></button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <PhotoButton onPick={setImage} />

        <textarea
          ref={field}
          rows={1}
          value={body}
          onChange={(e) => { setBody(e.target.value); grow(e.target); }}
          placeholder="What would you tell them"
          style={{
            flex: 1, minWidth: 0, height: 44, maxHeight: 132, padding: "11px 14px",
            borderRadius: 14, border: `1px solid ${CC.line}`, background: CC.white,
            resize: "none", fontFamily: "inherit", fontSize: 15, color: CC.ink,
            outline: "none", lineHeight: "21px", overflowY: "auto",
          }}
        />

        <button onClick={submit} disabled={!ready || busy} aria-label="Post answer" style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: "none",
          background: ready && !busy ? CC.pink : CC.line,
          cursor: ready && !busy ? "pointer" : "default",
          display: "grid", placeItems: "center",
        }}><SendHorizontal size={18} color="#fff" /></button>
      </div>
    </div>
  );
}

// Icon only, 40px. The old dashed pill said "optional" in words and took a row
// of its own to do it.
function PhotoButton({ onPick }) {
  const [id] = useState(() => `att_${Math.random().toString(36).slice(2, 8)}`);
  return (
    <>
      <label htmlFor={id} aria-label="Add a photo" style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: CC.well,
        cursor: "pointer", display: "grid", placeItems: "center",
      }}><ImagePlus size={19} color={CC.body} /></label>
      <input id={id} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => onPick(r.result);
          r.readAsDataURL(f);
        }} />
    </>
  );
}
