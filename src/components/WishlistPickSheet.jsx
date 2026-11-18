import { Heart, Check, Plus, X as XIcon, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { C } from "../data";
import { useWishlist, KIND_LABEL } from "../data/wishlist";
import { PHOTO_HEART_SHADOW } from "./SaveHeart";

// ─── Your saves, where you are choosing ───
//
// A couple hearts things for weeks before they build a trip, and then the
// wizard asks "which cities" as if none of that happened. These two pieces
// close the loop without pre-deciding anything for them.
//
// SavedHint is one quiet line under a step's question: "3 saved for Bali.
// See them". It only appears when there is something to see.
//
// WishlistPickSheet is what the line opens: the saves of one kind for this
// destination, each with an Add button that puts it straight into the trip and
// a Done button that closes the sheet. It is a sheet rather than a trip to the
// wishlist screen, because leaving the wizard loses every answer so far.

export function SavedHint({ count, dest, onOpen, style }) {
  if (!count) return null;
  return (
    <button onClick={onOpen} style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0,
      cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, color: C.sub, ...style,
    }}>
      <Heart size={12} color={C.p600} fill={C.p600} />
      <span>{count} saved for {dest}.</span>
      <span style={{ fontWeight: 800, color: C.p600, display: "inline-flex", alignItems: "center", gap: 1 }}>See them <ChevronRight size={13} /></span>
    </button>
  );
}

// A small solid heart that marks a card or row as something already saved.
// Over a photograph it gets the same soft shadow as the save heart; on white
// it is bare.
export function SavedMark({ onPhoto = false, size = 22, style }) {
  return (
    <span aria-label="On your wishlist" title="On your wishlist" style={{
      width: size, height: size, flexShrink: 0,
      display: "inline-grid", placeItems: "center", ...style,
    }}>
      <Heart size={Math.round(size * (onPhoto ? 0.66 : 0.55))} color={C.p600} fill={C.p600} style={onPhoto ? { filter: PHOTO_HEART_SHADOW } : undefined} />
    </span>
  );
}

// items: the saved items to show (already narrowed by the caller).
// isAdded(item) says whether it is in the trip; onAdd(item) toggles it.
// canAdd(item) may return a reason string when it cannot be added here.
export default function WishlistPickSheet({ dest, kind, items, isAdded, onAdd, canAdd, onClose }) {
  const navigate = useNavigate();
  const { remove } = useWishlist();
  const label = (KIND_LABEL[kind] || "Saved").toLowerCase();

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 700, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(24,29,39,0.45)", animation: "fadeInBg .2s ease-out" }} />
      <div style={{ position: "relative", width: "100%", maxHeight: "78%", display: "flex", flexDirection: "column", background: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: "0 -8px 28px rgba(0,0,0,0.2)", animation: "sheetSlideUp .25s ease-out" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 16px 10px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.head }}>Your saved {label}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.sub }}>{items.length ? `${items.length} in ${dest}. Add what you want in this trip.` : `Nothing saved for ${dest} yet.`}</p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.div}`, background: C.white, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <XIcon size={16} color={C.head} />
          </button>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "0 16px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it) => {
            const added = isAdded(it);
            const blocked = canAdd ? canAdd(it) : null;
            return (
              <div key={it.key} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 10px", border: `1px solid ${C.div}`, borderRadius: 14, background: C.white }}>
                {it.img
                  ? <img src={it.img} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 52, height: 52, borderRadius: 10, background: C.p100, display: "grid", placeItems: "center", flexShrink: 0 }}><Heart size={16} color={C.p600} fill={C.p600} /></div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11.5, color: blocked ? C.inact : C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{blocked || it.sub || it.city || ""}</p>
                </div>
                {blocked ? (
                  <button onClick={() => remove(it.kind, it.dest, it.id)} aria-label="Remove from wishlist" style={{ border: "none", background: "none", padding: 6, cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Heart size={16} color={C.p600} fill={C.p600} />
                  </button>
                ) : (
                  <button onClick={() => onAdd(it)} aria-pressed={added} style={{
                    flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, minHeight: 32, padding: "0 11px", borderRadius: 999,
                    border: `1.5px solid ${added ? C.p600 : C.div}`, background: added ? C.p600 : C.white, color: added ? "#fff" : C.head,
                    fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {added ? <><Check size={13} strokeWidth={3} /> Added</> : <><Plus size={13} strokeWidth={2.5} /> Add</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: `1px solid ${C.div}` }}>
          <button onClick={() => { onClose(); navigate(`/saved?dest=${encodeURIComponent(dest)}`); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: C.p600 }}>
            Open wishlist
          </button>
          <button onClick={onClose} style={{ marginLeft: "auto", minHeight: 44, padding: "0 22px", borderRadius: 12, border: "none", background: C.p600, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
