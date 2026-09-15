import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import {
  MY, DEMO_CODES, normaliseCode, POOL_VALID_DAYS, CARD_VALID_DAYS, track,
} from "../data/giftData";

// ─── Gift cards, registries and the Travel Credit half of the wallet ───
// Stamps stay on the account profile, because they are the marketing currency
// the app already had. Credit lives here, because it is real money that moves
// when a card is claimed, a pool lands, or a top up goes through.

const KEY = "30s_gift_v4";
const DAY = 86400000;
const GiftingContext = createContext(null);

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

const today = () => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// A code the buyer can read out loud without ambiguity.
function makeCode() {
  const set = "ACDEFGHJKLMNPQRTUVWXY2345679";
  const chunk = () => Array.from({ length: 4 }, () => set[Math.floor(Math.random() * set.length)]).join("");
  return `GS-${chunk()}-${chunk()}`;
}
const makePin = () => String(Math.floor(1000 + Math.random() * 9000));

// ─── Seed ───
// Enough history that no screen opens empty, and one of each interesting state.
function seed() {
  const now = Date.now();
  return {
    credit: 11000,
    creditTx: [
      { id: uid("tx"), title: "Gift card from Meera Nair", sub: "Wedding gift", amount: 11000, date: "18 Aug 2026" },
      { id: uid("tx"), title: "Refund · Bali trip cancelled", sub: "Returned as credit", amount: 6000, date: "02 Jul 2026" },
      { id: uid("tx"), title: "Used on Maldives instalment 2", sub: "Booking MLD-4471", amount: -6000, date: "11 Jul 2026" },
    ],
    // Cards this account has bought for other people.
    cards: [
      {
        id: uid("gc"), code: "GS-2QMX-7HTP", pin: "3390", amount: 5000,
        occasion: "birthday", artId: "halong",
        message: "Happy birthday. Spend this on a trip, not a cake.",
        toName: "Ananya Rao", toPhone: "9812345670", toEmail: "",
        fromName: MY.name, sendNow: true, status: "claimed",
        sentAt: now - 26 * DAY, claimedAt: now - 24 * DAY,
        expiresAt: now - 26 * DAY + CARD_VALID_DAYS * DAY,
      },
      {
        id: uid("gc"), code: "GS-9LKD-4RWA", pin: "7712", amount: 21000,
        occasion: "wedding", artId: "villa",
        message: "Wishing you both a lifetime of good days.",
        toName: "Ishaan and Tara", toPhone: "9900112233", toEmail: "ishaan.t@gmail.com",
        fromName: MY.name, sendNow: true, status: "sent",
        sentAt: now - 4 * DAY, claimedAt: null,
        expiresAt: now - 4 * DAY + CARD_VALID_DAYS * DAY,
      },
    ],
    // Codes this account has already redeemed, so they cannot be redeemed twice.
    redeemed: ["GS-9XQ2-1AAB"],
    // code -> { attempts, lockedUntil }
    pinTries: {},
    registries: [
      // Someone set one up for me and my partner. Unclaimed, so the claim flow
      // is reachable the moment the prototype opens.
      {
        id: "reg_us", creatorType: "organiser",
        organiserName: "Nikhil Sharma", organiserRelation: "Brother",
        coupleNames: "Priya and Karan", couplePhone: MY.phone,
        occasion: "wedding", destination: "Maldives",
        target: 150000, reveal: "now", revealed: true,
        status: "open", claimed: false,
        createdAt: now - 21 * DAY,
        contributions: [
          { id: uid("c"), name: "Nikhil Sharma", anon: false, amount: 25000, message: "Go and do nothing for ten days. Love you both.", at: now - 21 * DAY },
          { id: uid("c"), name: "Meera Nair", anon: false, amount: 11000, message: "Congratulations you two!", at: now - 19 * DAY },
          { id: uid("c"), name: "The Kapoors", anon: false, amount: 21000, message: "With all our love.", at: now - 16 * DAY },
          { id: uid("c"), name: "", anon: true, amount: 5000, message: "Have the best time.", at: now - 12 * DAY },
          { id: uid("c"), name: "Rahul Sethi", anon: false, amount: 3000, message: "", at: now - 9 * DAY },
          { id: uid("c"), name: "Aunt Sudha", anon: false, amount: 5000, message: "Send us photos.", at: now - 5 * DAY },
        ],
      },
      // One I set up for friends. Still a surprise, so it exercises Reveal.
      {
        id: "reg_mine", creatorType: "organiser",
        organiserName: MY.name, organiserRelation: "Friend",
        coupleNames: "Ishaan and Tara", couplePhone: "9900112233",
        occasion: "wedding", destination: "Thailand",
        target: 100000, reveal: "surprise", revealed: false,
        status: "open", claimed: false,
        createdAt: now - 6 * DAY,
        contributions: [
          { id: uid("c"), name: MY.name, anon: false, amount: 11000, message: "Kicking this off. Everyone chip in!", at: now - 6 * DAY },
          { id: uid("c"), name: "Devika Menon", anon: false, amount: 5000, message: "So excited for you both.", at: now - 3 * DAY },
        ],
      },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through to a fresh seed */ }
  return seed();
}

export function GiftingProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }, [state]);

  const patch = useCallback((fn) => setState(prev => fn(prev)), []);

  // ─── Credit ───
  const addCredit = useCallback((amount, title, sub) => {
    patch(p => ({
      ...p,
      credit: p.credit + amount,
      creditTx: [{ id: uid("tx"), title, sub, amount, date: today() }, ...p.creditTx],
    }));
  }, [patch]);

  const topUp = useCallback((amount) => {
    track("credit_topup_complete", { amount });
    addCredit(amount, "Top up", "Added by you");
  }, [addCredit]);

  // ─── Gift cards ───
  // Every card the account knows about: bought here, or seeded as a demo code
  // someone else sent. Redeeming looks across both.
  const findCode = useCallback((code) => {
    const c = normaliseCode(code);
    const demo = DEMO_CODES.find(d => normaliseCode(d.code) === c);
    if (demo) {
      const sentAt = Date.now() - (demo.boughtDaysAgo || 0) * DAY;
      return { ...demo, sentAt, expiresAt: sentAt + CARD_VALID_DAYS * DAY, source: "demo" };
    }
    const own = state.cards.find(d => normaliseCode(d.code) === c);
    if (own) return { ...own, from: own.fromName, source: "own" };
    return null;
  }, [state.cards]);

  // Returns { ok } or { error, ... } so the drawer can say something specific.
  const redeemCode = useCallback((code, pin, how = "code") => {
    const c = normaliseCode(code);
    const lock = state.pinTries[c];
    if (lock?.lockedUntil && lock.lockedUntil > Date.now()) {
      return { error: "locked", hoursLeft: Math.ceil((lock.lockedUntil - Date.now()) / 3600000) };
    }
    const card = findCode(c);
    if (!card) return { error: "unknown" };
    if (state.redeemed.includes(c) || card.status === "claimed") return { error: "claimed" };
    if (card.expiresAt && card.expiresAt < Date.now()) return { error: "expired" };

    // A link carries its own proof: the code came from us and the phone was
    // checked on the way in, so there is no PIN to type.
    if (how !== "link" && String(pin) !== String(card.pin)) {
      const attempts = (lock?.attempts || 0) + 1;
      const locked = attempts >= 5;
      patch(p => ({
        ...p,
        pinTries: { ...p.pinTries, [c]: { attempts, lockedUntil: locked ? Date.now() + DAY : null } },
      }));
      track("gift_card_claim_failed", { reason: locked ? "locked" : "wrong_pin" });
      return locked ? { error: "locked", hoursLeft: 24 } : { error: "pin", left: 5 - attempts };
    }

    track("gift_card_claimed", { amount: card.amount, how });
    patch(p => ({
      ...p,
      credit: p.credit + card.amount,
      creditTx: [{
        id: uid("tx"), title: `Gift card from ${card.from}`,
        sub: how === "link" ? "Added from the link" : "Added with code and PIN",
        amount: card.amount, date: today(),
      }, ...p.creditTx],
      redeemed: [...p.redeemed, c],
      pinTries: { ...p.pinTries, [c]: { attempts: 0, lockedUntil: null } },
      cards: p.cards.map(x => normaliseCode(x.code) === c ? { ...x, status: "claimed", claimedAt: Date.now() } : x),
    }));
    return { ok: true, amount: card.amount, from: card.from };
  }, [state.pinTries, state.redeemed, findCode, patch]);

  const buyCard = useCallback((draft) => {
    const card = {
      ...draft,
      id: uid("gc"),
      code: makeCode(),
      pin: makePin(),
      fromName: draft.fromName || MY.name,
      // Unticked box: the buyer holds the link and passes it on themselves.
      status: draft.sendNow ? "sent" : "with_you",
      sentAt: Date.now(),
      claimedAt: null,
      expiresAt: Date.now() + CARD_VALID_DAYS * DAY,
    };
    track("gift_card_purchase_complete", { amount: card.amount, occasion: card.occasion, sent_now: !!card.sendNow });
    patch(p => ({ ...p, cards: [card, ...p.cards] }));
    return card;
  }, [patch]);

  // ─── Registries ───
  const registryTotal = useCallback((r) => (r?.contributions || []).reduce((s, c) => s + c.amount, 0), []);

  const findRegistry = useCallback((id) => state.registries.find(r => r.id === id) || null, [state.registries]);

  const findRegistryByPhone = useCallback(
    (phone) => state.registries.find(r => r.couplePhone === String(phone).replace(/\D/g, "").slice(-10) && !r.claimed) || null,
    [state.registries]
  );

  const createRegistry = useCallback((draft) => {
    const r = {
      ...draft,
      id: uid("reg"),
      revealed: draft.creatorType === "couple" ? true : draft.reveal === "now",
      status: "open",
      claimed: draft.creatorType === "couple",
      createdAt: Date.now(),
      contributions: [],
    };
    track("gift_registry_created", { creator_type: r.creatorType, has_target: !!r.target });
    patch(p => ({ ...p, registries: [r, ...p.registries] }));
    return r;
  }, [patch]);

  const contribute = useCallback((id, { name, anon, amount, message }) => {
    const c = { id: uid("c"), name: anon ? "" : name, anon: !!anon, amount, message: message || "", at: Date.now() };
    track("gift_registry_contribution", { amount, anon: !!anon });
    patch(p => ({
      ...p,
      registries: p.registries.map(r => {
        if (r.id !== id) return r;
        const next = { ...r, contributions: [...r.contributions, c] };
        // A registry set up by the couple themselves has no claim step, so
        // money lands in their wallet as it arrives.
        return next;
      }),
      ...(function () {
        const r = p.registries.find(x => x.id === id);
        if (!r || r.creatorType !== "couple") return {};
        return {
          credit: p.credit + amount,
          creditTx: [{ id: uid("tx"), title: `Registry gift from ${anon ? "someone" : name}`, sub: r.coupleNames, amount, date: today() }, ...p.creditTx],
        };
      })(),
    }));
    return c;
  }, [patch]);

  const updateRegistry = useCallback((id, fields) => {
    patch(p => ({ ...p, registries: p.registries.map(r => r.id === id ? { ...r, ...fields } : r) }));
  }, [patch]);

  const revealRegistry = useCallback((id) => {
    track("gift_registry_revealed", { id });
    updateRegistry(id, { revealed: true, reveal: "now" });
  }, [updateRegistry]);

  const closeRegistry = useCallback((id) => {
    track("gift_registry_closed", { id });
    updateRegistry(id, { status: "closed" });
  }, [updateRegistry]);

  const declineRegistry = useCallback((id) => {
    updateRegistry(id, { status: "declined" });
  }, [updateRegistry]);

  const claimRegistry = useCallback((id) => {
    const r = state.registries.find(x => x.id === id);
    if (!r || r.claimed) return { error: "unavailable" };
    const total = registryTotal(r);
    track("gift_registry_claimed", { amount: total, contributors: r.contributions.length });
    patch(p => ({
      ...p,
      credit: p.credit + total,
      creditTx: [{ id: uid("tx"), title: `Registry pool · ${r.coupleNames}`, sub: `${r.contributions.length} people`, amount: total, date: today() }, ...p.creditTx],
      registries: p.registries.map(x => x.id === id ? { ...x, claimed: true, revealed: true } : x),
    }));
    return { ok: true, amount: total };
  }, [state.registries, registryTotal, patch]);

  const resetGifting = useCallback(() => setState(seed()), []);

  // Registries this account is involved in, split by role.
  const { myRegistries, forMe } = useMemo(() => ({
    myRegistries: state.registries.filter(r => r.organiserName === MY.name),
    forMe: state.registries.filter(r => r.couplePhone === MY.phone && r.organiserName !== MY.name),
  }), [state.registries]);

  // Days a gift card still has to be claimed. Negative means it has lapsed.
  const cardDaysLeft = useCallback((card) => {
    if (!card?.expiresAt) return null;
    return Math.ceil((card.expiresAt - Date.now()) / DAY);
  }, []);
  const cardExpired = useCallback((card) => (
    card?.status !== "claimed" && !!card?.expiresAt && card.expiresAt < Date.now()
  ), []);

  const daysLeft = useCallback((r) => {
    const end = r.createdAt + POOL_VALID_DAYS * DAY;
    return Math.max(0, Math.ceil((end - Date.now()) / DAY));
  }, []);

  const value = {
    credit: state.credit, creditTx: state.creditTx,
    cards: state.cards, registries: state.registries,
    myRegistries, forMe,
    addCredit, topUp, redeemCode, findCode, buyCard, cardDaysLeft, cardExpired,
    createRegistry, contribute, updateRegistry, revealRegistry,
    closeRegistry, declineRegistry, claimRegistry,
    findRegistry, findRegistryByPhone, registryTotal, daysLeft,
    resetGifting,
  };

  return <GiftingContext.Provider value={value}>{children}</GiftingContext.Provider>;
}

export function useGifting() {
  const ctx = useContext(GiftingContext);
  if (!ctx) throw new Error("useGifting must be used within GiftingProvider");
  return ctx;
}
