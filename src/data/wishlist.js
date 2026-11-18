import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, createElement } from "react";

// ─── One wishlist ───
//
// The app used to keep three lists that never met: the plan versions a couple
// hearted in My Plans, the regions and activities they hearted while browsing a
// destination, and a demo catalogue of hotels and restaurants nothing could add
// to. One store now. Every save is filed under the destination it was tapped in,
// because the screen that owns the heart always knows where it is, and the
// Saved screen reads them back as destination folders.
//
// An item is { kind, dest, id, name, img, sub, city, savedAt, by, lovedBy,
// note }. The kind says
// what it is, the id is whatever the live data calls it (a city name for a
// region, `city::name` for an activity, a version id for a trip, a hotel's name
// for a hotel), and name/img/sub are a snapshot so the list can draw a row
// without knowing where the thing came from.
//
// Boards are shared. Everyone on a destination's board (see `members`) adds to
// the same list: `by` is who saved a thing, `lovedBy` everyone who has tapped
// "love it too", the saver included. A thing everyone on the board loves is
// the strongest signal the list has, so the board sorts it first.
//
// There are no named lists on top of the boards. People visit a destination
// once, so the destination is the only grouping a trip ever needs.

export const KINDS = ["trip", "region", "activity", "hotel", "restaurant", "shop"];
export const KIND_LABEL = {
  trip: "Itineraries", region: "Regions", activity: "Things to do",
  hotel: "Hotels", restaurant: "Food", shop: "Shops",
};
// What one of them is called, in a row's small print.
export const KIND_NOUN = {
  trip: "Itinerary", region: "Region", activity: "Thing to do",
  hotel: "Hotel", restaurant: "Restaurant", shop: "Shop",
};
// The tabs on the Saved screen. Regions are a filter there, not a tab.
export const TAB_KINDS = ["trip", "hotel", "activity", "restaurant", "shop"];

export const wishKey = (kind, dest, id) => `${kind}|${dest}|${id}`;

const KEY = "30s_wishlist_v2";
const SEED_KEY = "30s_wishlist_seeded_v3";
const OLD_SAVES_KEY = "30s_saves_v1";
const MEMBERS_KEY = "30s_wishlist_members_v1";
const COPLAN_KEY = "30s_wishlist_coplan_v1";
const MORE_KEY = "30s_wishlist_more_v5";
const ITIN_KEY = "30s_wishlist_itins_v1";
const ACTS_KEY = "30s_wishlist_acts_v1";

// The person using the app, and the demo co-planner. The app is single-user,
// so the other person on the Bali board is a stub with a few saves of their
// own; enough to show who saved what and what everyone loves.
export const ME = { key: "you", name: "You", first: "You", initial: "Y" };
export const CO_PLANNER = { key: "aanya", name: "Aanya Rao", first: "Aanya", initial: "A" };
// Contacts offered when inviting someone to a board.
export const INVITE_CONTACTS = [
  { key: "priya", name: "Priya Sharma", first: "Priya", initial: "P" },
  { key: "rohan", name: "Rohan Mehta", first: "Rohan", initial: "R" },
  { key: "karan", name: "Karan Patel", first: "Karan", initial: "K" },
  { key: "neha", name: "Neha Gupta", first: "Neha", initial: "N" },
];
export const personOf = (key) => [ME, CO_PLANNER, ...INVITE_CONTACTS].find((p) => p.key === key) || { key, name: key, first: key, initial: String(key)[0]?.toUpperCase() || "?" };
const TOAST_MS = 3200;
// A removal stays up longer: it carries the undo, and an undo you cannot
// reach in time is not one.
const UNDO_MS = 5000;

// A little demo content so the screen opens with something to show. The same
// Bali bases the discover flow used to seed, so the routes it generates still
// have something to work from.
function seed() {
  const now = Date.now();
  const out = {};
  ["Ubud", "Seminyak", "Canggu", "Sanur", "Nusa Penida"].forEach((city, i) => {
    const k = wishKey("region", "Bali", city);
    out[k] = { key: k, kind: "region", dest: "Bali", id: city, name: city, savedAt: now - (5 - i) * 60000 };
  });
  return out;
}

// The old discover saves ({ dest: { regions: [], activities: [] } }) come
// across as region and activity items, so nobody loses a heart to the merge.
function migrateOldSaves() {
  let old = null;
  try { old = JSON.parse(localStorage.getItem(OLD_SAVES_KEY)); } catch { old = null; }
  if (!old || typeof old !== "object") return null;
  const now = Date.now();
  const out = {};
  Object.entries(old).forEach(([dest, s]) => {
    (s?.regions || []).forEach((city) => {
      const k = wishKey("region", dest, city);
      out[k] = { key: k, kind: "region", dest, id: city, name: city, savedAt: now };
    });
    (s?.activities || []).forEach((id) => {
      const k = wishKey("activity", dest, id);
      const [city, name] = String(id).includes("::") ? String(id).split("::") : [null, String(id)];
      out[k] = { key: k, kind: "activity", dest, id, name, city, savedAt: now };
    });
  });
  try { localStorage.removeItem(OLD_SAVES_KEY); } catch { /* ignore */ }
  return out;
}

// The co-planner's saves on the Bali board. One overlaps the demo seed, so the
// board opens with something both people love.
function coPlannerSeed(data) {
  const now = Date.now();
  const out = { ...data };
  const add = (kind, id, meta, mins) => {
    const k = wishKey(kind, "Bali", id);
    if (out[k]) { out[k] = { ...out[k], lovedBy: [...new Set([...(out[k].lovedBy || [out[k].by || "you"]), "aanya"])] }; return; }
    out[k] = { ...meta, key: k, kind, dest: "Bali", id, by: "aanya", lovedBy: ["aanya"], savedAt: now - mins * 60000 };
  };
  add("region", "Nusa Penida", { name: "Nusa Penida", city: "Nusa Penida" }, 30);
  add("region", "Ubud", { name: "Ubud", city: "Ubud" }, 40);
  add("activity", "Ubud::Campuhan ridge walk", { name: "Campuhan ridge walk", city: "Ubud", sub: "Ubud" }, 12);
  add("restaurant", "Ubud::Locavore NXT", { name: "Locavore NXT", city: "Ubud", sub: "Fine dining · Nyuh Bulan", note: "Book this the day we land" }, 8);
  return out;
}

// Demo saves in every other destination, older than the Bali ones, so the
// wishlist opens on a board per destination rather than one.
function moreSeed(data) {
  const out = { ...data };
  const day = 24 * 60 * 60000;
  const add = (dest, kind, id, meta, daysAgo) => {
    const k = wishKey(kind, dest, id);
    if (!out[k]) out[k] = { ...meta, key: k, kind, dest, id, by: "you", lovedBy: ["you"], savedAt: Date.now() - daysAgo * day };
  };
  const act = (dest, id, d) => { const [city, name] = id.split("::"); add(dest, "activity", id, { name, city, sub: city }, d); };
  const U = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=75&auto=format&fit=crop`;
  const hotel = (dest, name, city, stars, score, img, d) => {
    add(dest, "hotel", name, { name, city, sub: `${city} · ${stars}-star`, img, stars, score }, d);
    const k = wishKey("hotel", dest, name);
    if (out[k].score == null) out[k] = { ...out[k], stars, score };
  };
  hotel("Bali", "Padma Resort Ubud", "Ubud", 4, 8.6, U("1618773928121-c32242e63f39"), 0.5);
  hotel("Bali", "W Bali Seminyak", "Seminyak", 4, 8.4, U("1595576508898-0ad5c879a061"), 0.6);
  add("Thailand", "region", "Krabi", { name: "Krabi", city: "Krabi" }, 3);
  add("Thailand", "region", "Chiang Mai", { name: "Chiang Mai", city: "Chiang Mai" }, 3.1);
  act("Thailand", "Krabi::4-island hop", 3.2);
  act("Thailand", "Bangkok::Grand Palace & Wat Phra Kaew", 3.3);
  hotel("Thailand", "Mandarin Oriental Bangkok", "Bangkok", 5, 9.1, U("1582719478250-c89cae4dc85b"), 3.05);
  add("Thailand", "restaurant", "Bangkok::Thipsamai", { name: "Thipsamai", city: "Bangkok", sub: "Local food · Pad thai" }, 3.4);
  add("Vietnam", "region", "Hoi An", { name: "Hoi An", city: "Hoi An" }, 6);
  add("Vietnam", "region", "Ha Long", { name: "Ha Long", city: "Ha Long" }, 6.1);
  act("Vietnam", "Ha Long::Bay cruise", 6.2);
  hotel("Vietnam", "Sofitel Legend Metropole", "Hanoi", 5, 9.0, U("1582719478250-c89cae4dc85b"), 6.15);
  act("Vietnam", "Hoi An::Lantern making class", 6.3);
  add("Maldives", "hotel", "Soneva Fushi", { name: "Soneva Fushi", city: "Baa Atoll", sub: "Baa Atoll · 5-star", stars: 5, img: "https://cdn.30sundays.club/app_content/hotels/maldives/hero-images/15_hero.webp" }, 9);
  add("Maldives", "hotel", "Cocogiri Island Resort", { name: "Cocogiri Island Resort", city: "Vaavu Atoll", sub: "Vaavu Atoll · 4.5-star", stars: 4.5, img: "https://cdn.30sundays.club/app_content/hotels/maldives/hero-images/11_hero.webp" }, 9.1);
  act("Maldives", "Baa Atoll::Manta ray snorkeling", 9.2);
  add("Sri Lanka", "region", "Ella", { name: "Ella", city: "Ella" }, 12);
  add("Sri Lanka", "region", "Galle", { name: "Galle", city: "Galle" }, 12.1);
  act("Sri Lanka", "Ella::Nine Arches Bridge", 12.2);
  act("Sri Lanka", "Sigiriya::Sigiriya Rock climb", 12.3);
  add("New Zealand", "region", "Queenstown", { name: "Queenstown", city: "Queenstown" }, 15);
  act("New Zealand", "Rotorua::Te Puia geothermal", 15.1);
  act("New Zealand", "Wanaka::Roys Peak hike", 15.2);
  hotel("New Zealand", "Matakauri Lodge", "Queenstown", 5, 9.3, U("1618773928121-c32242e63f39"), 15.05);
  return out;
}

// Two ready-made Bali itineraries saved to the Bali board, so the board shows
// what planning from a saved itinerary looks like. Both are real ones from the
// itinerary list (Swing & Sanur, Cliffs & Coast).
function itinSeed(data) {
  const out = { ...data };
  const day = 24 * 60 * 60000;
  [["1", 1.5], ["6", 2.5]].forEach(([n, daysAgo]) => {
    const k = wishKey("trip", "Bali", `it_${n}`);
    if (!out[k]) out[k] = { key: k, kind: "trip", dest: "Bali", id: `it_${n}`, name: "", by: "you", lovedBy: ["you"], savedAt: Date.now() - daysAgo * day };
  });
  return out;
}

// Two more Bali things to do, so a Ubud day has saves spread over two plans
// and the itinerary has a wishlist it only partly covers.
function actsSeed(data) {
  const out = { ...data };
  [["Ubud::Kintamani volcano hike", "Ubud", 0.8], ["Canggu::Surf lesson", "Canggu", 0.9]].forEach(([id, city, daysAgo]) => {
    const k = wishKey("activity", "Bali", id);
    if (!out[k]) out[k] = { key: k, kind: "activity", dest: "Bali", id, name: id.split("::")[1], city, sub: city, by: "you", lovedBy: ["you"], savedAt: Date.now() - daysAgo * 86400000 };
  });
  return out;
}

function loadJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v && typeof v === "object" ? v : fallback; } catch { return fallback; }
}

function load() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { data = null; }
  try {
    if (!localStorage.getItem(SEED_KEY)) {
      const migrated = migrateOldSaves();
      data = { ...(data || {}), ...(migrated || seed()) };
      localStorage.setItem(SEED_KEY, "1");
      localStorage.setItem(KEY, JSON.stringify(data));
    }
    if (!localStorage.getItem(MORE_KEY)) {
      data = moreSeed(data || {});
      localStorage.setItem(MORE_KEY, "1");
      localStorage.setItem(KEY, JSON.stringify(data));
    }
    if (!localStorage.getItem(ITIN_KEY)) {
      data = itinSeed(data || {});
      localStorage.setItem(ITIN_KEY, "1");
      localStorage.setItem(KEY, JSON.stringify(data));
    }
    if (!localStorage.getItem(ACTS_KEY)) {
      data = actsSeed(data || {});
      localStorage.setItem(ACTS_KEY, "1");
      localStorage.setItem(KEY, JSON.stringify(data));
    }
    if (!localStorage.getItem(COPLAN_KEY)) {
      data = coPlannerSeed(data || {});
      localStorage.setItem(COPLAN_KEY, "1");
      localStorage.setItem(KEY, JSON.stringify(data));
    }
  } catch { /* ignore */ }
  return data && typeof data === "object" ? data : {};
}
function persist(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

const WishlistContext = createContext(null);

export function WishlistProvider({ children, loggedIn = true }) {
  const [map, setMap] = useState(load);
  useEffect(() => { persist(map); }, [map]);

  // Who else is on each destination's board: { [dest]: [{ key, status }] }.
  // Bali starts with the demo co-planner already on it.
  const [members, setMembers] = useState(() => loadJSON(MEMBERS_KEY, { Bali: [{ key: "aanya", status: "joined" }] }));
  useEffect(() => { try { localStorage.setItem(MEMBERS_KEY, JSON.stringify(members)); } catch { /* ignore */ } }, [members]);

  // The "saved to your wishlist" toast. One for the whole app, raised here when
  // a heart turns on, so every screen says it the same way. The same line says
  // "removed" with an Undo when something comes off the wishlist screen.
  const [toast, setToast] = useState(null); // { type: "saved" | "removed", name, dest, at, item? }
  const toastTimer = useRef(null);
  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);
  const raiseToast = useCallback((name, dest, extra = {}) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type: "saved", name, dest, at: Date.now(), ...extra });
    toastTimer.current = setTimeout(() => setToast(null), extra.type === "removed" ? UNDO_MS : TOAST_MS);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const isSaved = useCallback((kind, dest, id) => !!map[wishKey(kind, dest, id)], [map]);
  const get = useCallback((kind, dest, id) => map[wishKey(kind, dest, id)] || null, [map]);

  // meta is { name, img, sub, city, ...anything else worth keeping }.
  const commit = useCallback((kind, dest, id, meta = {}, { silent = false } = {}) => {
    const k = wishKey(kind, dest, id);
    setMap((m) => m[k] ? m : { ...m, [k]: { ...meta, key: k, kind, dest, id, name: meta.name || String(id), savedAt: Date.now(), by: "you", lovedBy: ["you"] } });
    if (!silent) raiseToast(meta.name || String(id), dest, { itemKey: k });
  }, [raiseToast]);

  // A save needs an account, so it can follow the person to any phone. When
  // nobody is logged in, the heart asks them to log in first and holds on to
  // what they tapped; once they are in, that save goes through on its own,
  // so they never have to find the heart again.
  const [pendingSave, setPendingSave] = useState(null); // [kind, dest, id, meta, opts]
  const save = useCallback((kind, dest, id, meta = {}, opts = {}) => {
    if (!loggedIn) { setPendingSave([kind, dest, id, meta, opts]); return false; }
    commit(kind, dest, id, meta, opts);
    return true;
  }, [loggedIn, commit]);
  const finishLogin = useCallback(() => {
    if (pendingSave) commit(...pendingSave);
    setPendingSave(null);
  }, [pendingSave, commit]);
  const cancelLogin = useCallback(() => setPendingSave(null), []);

  const remove = useCallback((kind, dest, id) => {
    const k = wishKey(kind, dest, id);
    setMap((m) => { if (!m[k]) return m; const n = { ...m }; delete n[k]; return n; });
  }, []);

  // Takes it off straight away and offers the way back, rather than asking
  // first. The item is kept whole in the toast so Undo puts it back exactly,
  // in the same place in the list.
  const removeWithUndo = useCallback((kind, dest, id) => {
    const item = map[wishKey(kind, dest, id)];
    if (!item) return;
    remove(kind, dest, id);
    raiseToast(item.name || String(id), dest, { type: "removed", item });
  }, [map, remove, raiseToast]);

  const undoRemove = useCallback(() => {
    const item = toast?.type === "removed" ? toast.item : null;
    if (item) setMap((m) => ({ ...m, [item.key]: item }));
    dismissToast();
  }, [toast, dismissToast]);

  // "Love it too": the current person adds or takes back their love.
  const toggleLove = useCallback((key) => {
    setMap((m) => {
      const it = m[key];
      if (!it) return m;
      const loved = new Set(it.lovedBy || [it.by || "you"]);
      if (loved.has("you")) { if ((it.by || "you") !== "you") loved.delete("you"); } else loved.add("you");
      return { ...m, [key]: { ...it, lovedBy: [...loved] } };
    });
  }, []);

  const setNote = useCallback((key, note) => {
    setMap((m) => m[key] ? { ...m, [key]: { ...m[key], note } } : m);
  }, []);

  // ─── People on a board ───
  const invite = useCallback((dest, key) => {
    setMembers((all) => {
      const cur = all[dest] || [];
      if (cur.some((m) => m.key === key)) return all;
      return { ...all, [dest]: [...cur, { key, status: "invited" }] };
    });
  }, []);
  const membersOf = useCallback((dest) => (members[dest] || []).map((m) => ({ ...personOf(m.key), status: m.status })), [members]);

  // Returns true when the heart just turned on, so a caller can react to that.
  const toggle = useCallback((kind, dest, id, meta = {}, opts = {}) => {
    const on = !map[wishKey(kind, dest, id)];
    if (on) return save(kind, dest, id, meta, opts);
    remove(kind, dest, id);
    return false;
  }, [map, save, remove]);

  const items = useMemo(() => Object.values(map)
    .map((it) => ({ ...it, by: it.by || "you", lovedBy: it.lovedBy || [it.by || "you"], note: it.note || "" }))
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)), [map]);


  // Destinations, most recently saved-into first. This is the folder order on
  // the Saved screen, and the first one is where it opens.
  const destinations = useMemo(() => {
    const seen = new Set();
    const out = [];
    items.forEach((it) => { if (!seen.has(it.dest)) { seen.add(it.dest); out.push(it.dest); } });
    return out;
  }, [items]);

  const counts = useMemo(() => {
    const byDest = {};
    const byKind = {};
    items.forEach((it) => {
      byKind[it.kind] = (byKind[it.kind] || 0) + 1;
      const d = byDest[it.dest] || (byDest[it.dest] = { total: 0 });
      d.total += 1;
      d[it.kind] = (d[it.kind] || 0) + 1;
    });
    return { total: items.length, byKind, byDest };
  }, [items]);

  const forDest = useCallback((dest) => items.filter((it) => it.dest === dest), [items]);
  const ofKind = useCallback((kind, dest) => items.filter((it) => it.kind === kind && (!dest || it.dest === dest)), [items]);

  const value = useMemo(() => ({
    items, destinations, counts,
    isSaved, get, save, remove, removeWithUndo, undoRemove, toggle, forDest, ofKind,
    toast, dismissToast,
    toggleLove, setNote,
    invite, membersOf,
    loginFor: pendingSave ? { name: pendingSave[3]?.name || String(pendingSave[2]), dest: pendingSave[1] } : null,
    finishLogin, cancelLogin,
  }), [items, destinations, counts, isSaved, get, save, remove, removeWithUndo, undoRemove, toggle, forDest, ofKind, toast, dismissToast,
    toggleLove, setNote, invite, membersOf, pendingSave, finishLogin, cancelLogin]);

  return createElement(WishlistContext.Provider, { value }, children);
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
