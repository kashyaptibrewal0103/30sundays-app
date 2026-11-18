import { useCallback, useMemo } from "react";
import { useWishlist } from "./wishlist";
import { regionByCity, activityById } from "./discoverData";

// ─── Discover saves, read off the one wishlist ───
//
// The discover flow saves regions (a base to sleep in, or a day-trip spot) and
// activities, and those saves drive the routes it generates. They used to live
// in their own store. They are wishlist items now, kind "region" and
// "activity", and this hook keeps the shape the discover screens already read:
// forDest(dest) → { regions: [city], activities: [id] }.

const KIND_OF = { regions: "region", activities: "activity" };

// What a region or activity looks like as a wishlist row, looked up from the
// live data so the snapshot is never stale. Falls back to the key itself for
// things the catalogue does not know (a video lesson's topic, say).
export function regionMeta(dest, city) {
  const r = regionByCity(dest, city);
  return { name: city, img: r?.img || null, sub: r?.blurb || null, city };
}
export function activityMeta(dest, id) {
  const a = activityById(dest, id);
  const [city, name] = String(id).includes("::") ? String(id).split("::") : [null, String(id)];
  return { name: a?.name || name, img: a?.img || null, city: a?.city || city, sub: a?.city || city || null };
}

export function useSaves() {
  const w = useWishlist();

  const forDest = useCallback((dest) => ({
    regions: w.ofKind("region", dest).map((it) => it.id),
    activities: w.ofKind("activity", dest).map((it) => it.id),
  }), [w]);

  const toggleRegion = useCallback((dest, city) => w.toggle("region", dest, city, regionMeta(dest, city)), [w]);
  const toggleActivity = useCallback((dest, id) => w.toggle("activity", dest, id, activityMeta(dest, id)), [w]);

  const remove = useCallback((dest, kind, key) => w.remove(KIND_OF[kind] || kind, dest, key), [w]);

  const clearDest = useCallback((dest) => {
    w.forDest(dest).forEach((it) => { if (it.kind === "region" || it.kind === "activity") w.remove(it.kind, dest, it.id); });
  }, [w]);

  return useMemo(() => ({ forDest, toggleRegion, toggleActivity, remove, clearDest }),
    [forDest, toggleRegion, toggleActivity, remove, clearDest]);
}
