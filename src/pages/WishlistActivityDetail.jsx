import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { C } from "../data";
import { activityById } from "../data/discoverData";
import { buildActivityDetail } from "../data/activityData";
import { useWishlist } from "../data/wishlist";
import Logo from "../components/Logo";
import { activityMeta } from "../data/saves";
import { ActivityDetailScroll } from "./ActivityDetail";

// A saved activity, opened from the wishlist: the same activity screen used
// everywhere else, in planning context (no booked-guide video, no dates). The
// heart beside the name lets a couple take it off the list from here.
export default function WishlistActivityDetail() {
  const { dest: rawDest, id: rawId } = useParams();
  const dest = decodeURIComponent(rawDest || "");
  const id = decodeURIComponent(rawId || "");
  const navigate = useNavigate();
  const { isSaved, toggle, get } = useWishlist();

  const live = activityById(dest, id);
  const saved = get("activity", dest, id);
  const activity = live || (saved ? { name: saved.name, img: saved.img, city: saved.city } : null);

  if (!activity) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: C.bg }}>
        <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>Activity not found.</p>
        <button onClick={() => navigate(-1)} style={{ border: "none", background: C.p600, color: "#fff", borderRadius: 12, padding: "11px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Back</button>
      </div>
    );
  }

  const detail = buildActivityDetail(
    { name: activity.name, img: activity.img },
    { city: activity.city || "", country: dest, isBooked: false }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: C.white, position: "relative" }}>
      <div style={{ flex: 1, paddingBottom: 24 }}>
        <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `1px solid ${C.div}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <ArrowLeft size={18} color="#181E4C" />
          </button>
          <Logo variant="lockup" height={30} />
        </div>
        <ActivityDetailScroll detail={detail} saved={isSaved("activity", dest, id)} onSave={() => toggle("activity", dest, id, activityMeta(dest, id))} />
      </div>
    </div>
  );
}
