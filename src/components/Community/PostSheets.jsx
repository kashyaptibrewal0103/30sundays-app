import { useState, useRef, useEffect } from "react";
import { Lock, AlertTriangle, ImagePlus, X as XIcon, SendHorizontal } from "lucide-react";
import { CC } from "./tokens";
import { useCommunity } from "../../state/useCommunity";
import { track } from "../../data/communityData";
import { Sheet, Primary, Secondary } from "../Gift/GiftUI";
import { QuoteBlock } from "./CommunityUI";

// The pieces both the feed and a thread need: attaching a photo, the failure
// note, the two moderation sheets, and the answer composer.
//
// They live here rather than in either page because the feed opens the answer
// composer and the thread opens the feed's sheets. Keeping them in a page made
// the two import each other, which leaves one of them undefined at start up.

// Up to four photos per post. The spec's number, and the one a packing or a
// hotel answer actually needs.
export const MAX_IMAGES = 4;

export function ImageAttach({ images = [], setImages }) {
  const [id] = useState(() => `att_${Math.random().toString(36).slice(2, 8)}`);
  const full = images.length >= MAX_IMAGES;

  const add = (files) => {
    const room = MAX_IMAGES - images.length;
    [...files].slice(0, room).forEach(f => {
      const r = new FileReader();
      r.onload = () => setImages(prev => (prev.length >= MAX_IMAGES ? prev : [...prev, r.result]));
      r.readAsDataURL(f);
    });
  };

  return (
    <div>
      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {images.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 76 }}>
              <img src={src} alt="" style={{
                width: 76, height: 76, objectFit: "cover", borderRadius: 12, display: "block",
              }} />
              <button
                onClick={() => setImages(prev => prev.filter((_, n) => n !== i))}
                aria-label="Remove photo"
                style={{
                  position: "absolute", top: -7, right: -7, width: 24, height: 24, borderRadius: "50%",
                  background: CC.ink, border: "none", cursor: "pointer", display: "grid", placeItems: "center",
                }}
              ><XIcon size={13} color="#fff" /></button>
            </div>
          ))}
        </div>
      )}

      {!full && (
        <>
          <label htmlFor={id} style={{
            display: "inline-flex", alignItems: "center", gap: 8, minHeight: 48, padding: "0 14px",
            borderRadius: 999, border: `1px dashed ${CC.line}`, cursor: "pointer", alignSelf: "flex-start",
            fontSize: 13, fontWeight: 600, color: CC.ink,
          }}>
            <ImagePlus size={16} /> {images.length ? "Add another" : "Add a photo"}
            <span style={{ color: CC.soft, fontWeight: 500 }}>
              {images.length ? `${MAX_IMAGES - images.length} left` : "up to 4"}
            </span>
          </label>
          <input id={id} type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={(e) => { add(e.target.files || []); e.target.value = ""; }} />
        </>
      )}
    </div>
  );
}

// A row of photos on a post. One fills the width, several share it.
export function ImageRow({ images = [] }) {
  if (!images.length) return null;
  if (images.length === 1) {
    return (
      <img src={images[0]} alt="" style={{
        width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12,
        display: "block", marginTop: 10,
      }} />
    );
  }
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${Math.min(images.length, 2)}, 1fr)`,
      gap: 6, marginTop: 10,
    }}>
      {images.map((src, i) => (
        <img key={i} src={src} alt="" style={{
          width: "100%", height: 108, objectFit: "cover", borderRadius: 10, display: "block",
        }} />
      ))}
    </div>
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
export function AnswerSheet({
  questionId, questionTitle, quote, onClearQuote, focusSignal,
  isFirstAnswer, hoursSinceAsked, onClose, onPosted,
}) {
  const { postAnswer } = useCommunity();
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
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

  // The bar lives on the thread now, so focus only when asked for: a Reply
  // tap, or the question's own Answer action. Never on page load, where a
  // keyboard jumping up is an ambush.
  useEffect(() => {
    if (quote || focusSignal) field.current?.focus();
  }, [quote, focusSignal]);

  // Started means touched, not rendered. A reply is counted separately from
  // an answer, because they are different acts on the same screen.
  const started = useRef(false);
  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    track("community_answer_started", { questionId, isReply: !!quote });
  };

  // The answer lands in the thread and the check runs behind it, so the only
  // failure left in here is the network.
  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (window.__communityFailNext) {
        window.__communityFailNext = false;
        track("community_post_failed", { kind: quote ? "reply" : "answer", recovered: false });
        setFailed(true);
        return;
      }
      postAnswer(questionId, {
        body, images, questionTitle, isFirstAnswer, hoursSinceAsked, isReply: !!quote,
        parentId: quote?.parentId || null,
      });
      // The bar stays mounted, so it empties itself for the next thought.
      setBody("");
      setImages([]);
      started.current = false;
      onPosted();
    }, 700);
  };

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

      {onClose && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
          <button onClick={onClose} aria-label="Close" style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: "none",
            background: CC.well, cursor: "pointer", display: "grid", placeItems: "center",
          }}><XIcon size={13} color={CC.body} /></button>
        </div>
      )}

      {quote && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <QuoteBlock quote={quote} />
          </div>
          {onClearQuote && (
            <button onClick={onClearQuote} aria-label="Stop replying to this" style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0, border: "none",
              background: CC.well, cursor: "pointer", display: "grid", placeItems: "center",
              marginTop: 4,
            }}><XIcon size={13} color={CC.body} /></button>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {images.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 56 }}>
              <img src={src} alt="" style={{
                width: 56, height: 56, objectFit: "cover", borderRadius: 10, display: "block",
              }} />
              <button
                onClick={() => setImages(prev => prev.filter((_, n) => n !== i))}
                aria-label="Remove photo"
                style={{
                  position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%",
                  background: CC.ink, border: "none", cursor: "pointer",
                  display: "grid", placeItems: "center",
                }}
              ><XIcon size={12} color="#fff" /></button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <PhotoButton
          disabled={images.length >= MAX_IMAGES}
          onPick={(src) => setImages(prev => (prev.length >= MAX_IMAGES ? prev : [...prev, src]))}
        />

        <textarea
          ref={field}
          rows={1}
          value={body}
          onFocus={markStarted}
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
function PhotoButton({ onPick, disabled }) {
  const [id] = useState(() => `att_${Math.random().toString(36).slice(2, 8)}`);
  return (
    <>
      <label htmlFor={disabled ? undefined : id} aria-label="Add a photo" style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: CC.well,
        cursor: disabled ? "default" : "pointer", display: "grid", placeItems: "center",
        opacity: disabled ? 0.45 : 1,
      }}><ImagePlus size={19} color={CC.body} /></label>
      <input id={id} type="file" accept="image/*" multiple style={{ display: "none" }}
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
