import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ME, QUESTIONS, CHAT_BY_DEST, checkPost, track } from "../data/communityData";

// Anything a traveller does in the Lounge lives here, so a question they ask or
// an answer they write is still there when they come back to the feed.
//
// The moderation check runs after a post lands, never before it. A post is
// written into its room immediately with status "checking", only its author can
// see it, and a few seconds later it becomes live, flagged or blocked in place.
// The timer below stands in for the model call the real product makes.

const KEY = "30s_community_v2";
const Ctx = createContext(null);

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

// How long the check takes. Long enough to be seen, short enough that nobody
// goes looking for something else to do.
export const CHECK_MS = 2600;

// Three blocked posts and posting stops. Only the community manager lifts it.
export const BLOCKS_BEFORE_PAUSE = 3;

function seed() {
  return {
    asked: [],          // questions this traveller posted
    answers: {},        // questionId -> answers this traveller posted
    messages: [],       // group messages this traveller sent
    likes: {},          // postId -> true
    bookmarks: {},      // questionId -> true
    welcomeSeen: {},    // destination -> true
    chatRead: {},       // destination -> true once the chat has been opened
    rulesSeen: {},      // destination -> true once the guidelines note is closed
    helpSeen: {},       // destination -> true once the help note is closed
    reports: {},        // postId -> the reason it was reported
    strikes: 0,         // blocked posts, which is what pauses posting
    posting: "unlocked",  // unlocked | paused | cancelled
    pausedSeen: false,  // the paused screen is shown in full once, then a marker
    consentSeen: false, // the consent notice, shown before the first post
    composeRulesSeen: false, // the five rules, shown above the first compose
    notifications: [],  // everything that happened to this traveller's posts
    appeals: [],        // what they told us when they thought we got it wrong
    profile: { about: "", photo: null }, // what a traveller chooses to say about themselves
    notify: { answers: true, helpful: true, moderation: true, rooms: true },
    mutedQuestions: {}, // questionId -> true, a thread that stopped being worth a ping
    suggestions: [],    // what travellers sent the team about the Lounge itself
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...seed(), ...JSON.parse(raw) } : seed();
  } catch { return seed(); }
}

export function CommunityProvider({ children }) {
  const [state, setState] = useState(load);
  const ticking = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ }
  }, [state]);

  const patch = useCallback((fn) => setState(p => fn(p)), []);

  // ── The check ──
  //
  // Runs on a tick rather than a per-post timeout, so a post that was being
  // checked when the app closed resolves on the next open rather than sitting
  // in limbo forever.
  const resolvePost = useCallback((p) => {
    const now = Date.now();
    let changed = false;
    let blockedCount = 0;
    const notes = [];

    const settle = (post, kind, parentTitle) => {
      if (post.status !== "checking" || post.checkAt > now) return post;
      changed = true;
      const hit = checkPost(`${post.title || ""} ${post.body || ""}`);
      if (!hit) {
        notes.push({
          id: uid("n"), kind: "live", ts: now, read: false,
          title: kind === "question" ? "Your question is live" : "Your answer is live",
          body: post.title || post.body,
        });
        track("community_post_resolved", {
          kind, outcome: "live", rule: null,
          checkSeconds: Math.round((now - (post.postedAt || now)) / 1000),
        });
        return { ...post, status: "live", rule: null };
      }
      // The first offence is held for a person. Everything after that is
      // refused outright, and three refusals stop posting.
      const offence = p.strikes + blockedCount + 1;
      if (offence === 1) {
        notes.push({
          id: uid("n"), kind: "flagged", ts: now, read: false,
          title: "We are looking at one of your posts",
          body: hit.what,
        });
        track("community_post_resolved", {
          kind, outcome: "flagged", rule: hit.id,
          checkSeconds: Math.round((now - (post.postedAt || now)) / 1000),
        });
        return { ...post, status: "flagged", rule: hit };
      }
      blockedCount += 1;
      notes.push({
        id: uid("n"), kind: "blocked", ts: now, read: false,
        title: "One of your posts did not go up",
        body: hit.what,
      });
      track("community_post_resolved", {
        kind, outcome: "blocked", rule: hit.id, offence,
        checkSeconds: Math.round((now - (post.postedAt || now)) / 1000),
      });
      return { ...post, status: "blocked", rule: hit };
    };

    const asked = p.asked.map(q => settle(q, "question"));
    const answers = Object.fromEntries(
      Object.entries(p.answers).map(([qid, list]) => [qid, list.map(a => settle(a, "answer"))]),
    );

    if (!changed) return p;

    const strikes = p.strikes + blockedCount;
    const paused = strikes >= BLOCKS_BEFORE_PAUSE;
    if (paused && p.posting === "unlocked") {
      notes.push({
        id: uid("n"), kind: "paused", ts: now, read: false,
        title: "Posting is paused",
        body: "Three posts have not made it through. You can still read everything.",
      });
      track("community_posting_paused", { strikes });
    }

    return {
      ...p,
      asked,
      answers,
      strikes,
      posting: paused && p.posting === "unlocked" ? "paused" : p.posting,
      pausedSeen: paused && p.posting === "unlocked" ? false : p.pausedSeen,
      notifications: [...notes.reverse(), ...p.notifications],
    };
  }, []);

  // One timer for the whole module. It only does work when something is
  // actually being checked.
  useEffect(() => {
    const pending = state.asked.some(q => q.status === "checking")
      || Object.values(state.answers).some(list => list.some(a => a.status === "checking"));
    if (!pending) return undefined;
    ticking.current = setInterval(() => setState(resolvePost), 400);
    return () => clearInterval(ticking.current);
  }, [state.asked, state.answers, resolvePost]);

  // Resolve anything left mid-check by a closed app, on the first render.
  useEffect(() => { setState(resolvePost); }, [resolvePost]);

  // ── Writing ──

  const askQuestion = useCallback(({ dest, title, body, images = [], tag }) => {
    const q = {
      id: uid("q"), dest, title: title.trim(), body: body.trim(),
      images, image: images[0] || null,
      // The subject is worked out as the question posts, not chosen by the
      // person asking. Every card is guaranteed one, and nobody is made to
      // classify their own problem before they can ask about it.
      tags: tag ? [tag] : [],
      author: { name: ME.name, city: ME.city, stamp: ME.stamp }, mine: true,
      postedAt: Date.now(), minsAgo: 0, answers: [],
      status: "checking", checkAt: Date.now() + CHECK_MS, rule: null,
    };
    track("community_question_asked", {
      dest, tag, imageCount: images.length, titleLength: title.trim().length,
    });
    patch(p => ({ ...p, asked: [q, ...p.asked] }));
    return q;
  }, [patch]);

  const postAnswer = useCallback((questionId, {
    body, images = [], questionTitle, isFirstAnswer, hoursSinceAsked, isReply,
  }) => {
    const a = {
      id: uid("a"), body: body.trim(), images, image: images[0] || null, mine: true,
      author: { name: ME.name, city: ME.city, stamp: ME.stamp },
      postedAt: Date.now(), minsAgo: 0, likes: 0, questionTitle,
      status: "checking", checkAt: Date.now() + CHECK_MS, rule: null,
    };
    track(isReply ? "community_reply_posted" : "community_answer_posted", {
      questionId, imageCount: images.length, isFirstAnswer, hoursSinceAsked,
      isOps: false,
    });
    patch(p => ({ ...p, answers: { ...p.answers, [questionId]: [...(p.answers[questionId] || []), a] } }));
    return a;
  }, [patch]);

  const sendMessage = useCallback(({ dest, text, image }) => {
    const m = {
      id: uid("ch"), dest, text: text.trim(), image, mine: true,
      author: { name: ME.name, city: ME.city }, postedAt: Date.now(), minsAgo: 0,
    };
    patch(p => ({ ...p, messages: [...p.messages, m] }));
    return m;
  }, [patch]);

  // Editing a held or refused post sends it back through the check, which is
  // the whole point of offering the edit.
  const editQuestion = useCallback((id, { title, body }) => patch(p => {
    const before = p.asked.find(q => q.id === id);
    if (before?.status && before.status !== "live") {
      track("community_post_edited_after_outcome", {
        kind: "question", previousOutcome: before.status, previousRule: before.rule?.id || null,
      });
    }
    return {
    ...p,
    asked: p.asked.map(q => (q.id === id
      ? {
        ...q, title: String(title || "").trim(), body: String(body || "").trim(),
        edited: true,
        ...(q.status && q.status !== "live"
          ? { status: "checking", checkAt: Date.now() + CHECK_MS, rule: null }
          : {}),
      }
      : q)),
  };
  }), [patch]);

  const deleteQuestion = useCallback((id) => patch(p => {
    const answers = { ...p.answers };
    delete answers[id];
    return { ...p, asked: p.asked.filter(q => q.id !== id), answers };
  }), [patch]);

  const editAnswer = useCallback((questionId, answerId, body) => patch(p => {
    const before = (p.answers[questionId] || []).find(a => a.id === answerId);
    if (before?.status && before.status !== "live") {
      track("community_post_edited_after_outcome", {
        kind: "answer", previousOutcome: before.status, previousRule: before.rule?.id || null,
      });
    }
    return {
    ...p,
    answers: {
      ...p.answers,
      [questionId]: (p.answers[questionId] || []).map(a => (a.id === answerId
        ? {
          ...a, body: String(body || "").trim(), edited: true,
          ...(a.status && a.status !== "live"
            ? { status: "checking", checkAt: Date.now() + CHECK_MS, rule: null }
            : {}),
        }
        : a)),
    },
  };
  }), [patch]);

  const deleteAnswer = useCallback((questionId, answerId) => patch(p => ({
    ...p,
    answers: {
      ...p.answers,
      [questionId]: (p.answers[questionId] || []).filter(a => a.id !== answerId),
    },
  })), [patch]);

  // Liking, saving and reporting all keep working while posting is paused.
  // None of them publish words.
  const toggleLike = useCallback((id, targetType = "answer") => patch(p => {
    track("community_post_liked", { targetType, targetId: id, on: !p.likes[id] });
    return { ...p, likes: { ...p.likes, [id]: !p.likes[id] } };
  }), [patch]);

  const toggleBookmark = useCallback((id) => patch(p => {
    track("community_question_saved", { questionId: id, on: !p.bookmarks[id] });
    return { ...p, bookmarks: { ...p.bookmarks, [id]: !p.bookmarks[id] } };
  }), [patch]);

  const seeWelcome = useCallback((dest) => patch(p => ({
    ...p, welcomeSeen: { ...p.welcomeSeen, [dest]: true },
  })), [patch]);

  const seeHelp = useCallback((dest) => patch(p => ({
    ...p, helpSeen: { ...p.helpSeen, [dest]: true },
  })), [patch]);

  const reportPost = useCallback((id, reason) => patch(p => {
    track("community_report_submitted", { id, reason });
    return { ...p, reports: { ...p.reports, [id]: reason } };
  }), [patch]);

  const seeRules = useCallback((dest) => patch(p => ({
    ...p, rulesSeen: { ...p.rulesSeen, [dest]: true },
  })), [patch]);

  const readChat = useCallback((dest) => patch(p => (
    p.chatRead[dest] ? p : { ...p, chatRead: { ...p.chatRead, [dest]: true } }
  )), [patch]);

  // ── Posting state ──

  const seePausedScreen = useCallback(() => patch(p => ({ ...p, pausedSeen: true })), [patch]);
  const seeConsent = useCallback(() => patch(p => ({ ...p, consentSeen: true })), [patch]);
  const seeComposeRules = useCallback(() => patch(p => ({ ...p, composeRulesSeen: true })), [patch]);

  const appeal = useCallback((text) => patch(p => {
    track("community_appeal_submitted", {});
    return {
      ...p,
      appeals: [{ id: uid("ap"), text, ts: Date.now() }, ...p.appeals],
      notifications: [{
        id: uid("n"), kind: "appeal", ts: Date.now(), read: false,
        title: "We have got it",
        body: "Someone will read this and come back within two working days.",
      }, ...p.notifications],
    };
  }), [patch]);

  const setCancelled = useCallback((on) => patch(p => ({
    ...p, posting: on ? "cancelled" : "unlocked",
  })), [patch]);

  const readNotifications = useCallback(() => patch(p => (
    p.notifications.some(n => !n.read)
      ? { ...p, notifications: p.notifications.map(n => ({ ...n, read: true })) }
      : p
  )), [patch]);

  const addStrike = useCallback(() => {
    let next = 0;
    patch(p => { next = p.strikes + 1; return { ...p, strikes: next }; });
    return next;
  }, [patch]);

  const clearStrikes = useCallback(() => patch(p => ({
    ...p, strikes: 0, posting: "unlocked", pausedSeen: false,
  })), [patch]);

  const resetCommunity = useCallback(() => setState(seed()), []);

  // ── Profile, settings and suggestions ──

  const saveProfile = useCallback((next) => patch(p => {
    track("community_profile_saved", { hasAbout: !!(next.about || "").trim(), hasPhoto: !!next.photo });
    return { ...p, profile: { ...p.profile, ...next } };
  }), [patch]);

  const setNotify = useCallback((key, on) => patch(p => {
    track("community_notify_changed", { setting: key, on });
    return { ...p, notify: { ...p.notify, [key]: on } };
  }), [patch]);

  const toggleMute = useCallback((id, title) => patch(p => {
    const on = !p.mutedQuestions[id];
    track("community_question_muted", { questionId: id, on });
    const muted = { ...p.mutedQuestions };
    if (on) muted[id] = title || "A question you follow"; else delete muted[id];
    return { ...p, mutedQuestions: muted };
  }), [patch]);

  const sendSuggestion = useCallback((kind, text) => patch(p => {
    track("community_suggestion_sent", { kind, length: text.length });
    return {
      ...p,
      suggestions: [{ id: uid("sg"), kind, text, ts: Date.now() }, ...p.suggestions],
    };
  }), [patch]);

  // The promise in the moderation policy, kept. Everything this traveller wrote
  // goes, in one action, without a support ticket.
  const deleteMyPosts = useCallback(() => patch(p => {
    track("community_all_posts_deleted", {
      questions: p.asked.length,
      answers: Object.values(p.answers).reduce((n, a) => n + a.length, 0),
    });
    return { ...p, asked: [], answers: {} };
  }), [patch]);

  // ── Reading ──
  // Anything a traveller posted sits alongside the seeded data rather than in a
  // separate list, so the feed reads the same either way. A post still being
  // checked, or held, or refused, is filtered out of the public list by the
  // screens themselves, which show it to its author in its own card.
  const questionsFor = useCallback((dest) => [
    ...state.asked.filter(q => q.dest === dest),
    ...QUESTIONS.filter(q => q.dest === dest),
  ], [state.asked]);

  const liveQuestionsFor = useCallback((dest) =>
    questionsFor(dest).filter(q => !q.status || q.status === "live"),
  [questionsFor]);

  const pendingFor = useCallback((dest) =>
    state.asked.filter(q => q.dest === dest && q.status && q.status !== "live"),
  [state.asked]);

  const findQuestion = useCallback((id) =>
    state.asked.find(q => q.id === id) || QUESTIONS.find(q => q.id === id) || null,
  [state.asked]);

  const answersFor = useCallback((q) => {
    if (!q) return [];
    const mine = (state.answers[q.id] || []).filter(a => !a.status || a.status === "live");
    return [...(q.answers || []), ...mine];
  }, [state.answers]);

  const pendingAnswersFor = useCallback((questionId) =>
    (state.answers[questionId] || []).filter(a => a.status && a.status !== "live"),
  [state.answers]);

  const messagesFor = useCallback((dest) => [
    ...(CHAT_BY_DEST[dest] || []),
    ...state.messages.filter(m => m.dest === dest),
  ], [state.messages]);

  const answeredCount = useCallback((dest) =>
    liveQuestionsFor(dest).filter(q => ((q.answers || []).length + (state.answers[q.id] || []).length) > 0).length,
  [liveQuestionsFor, state.answers]);

  const unreadFor = useCallback((dest) => {
    if (state.chatRead[dest]) return 0;
    return (CHAT_BY_DEST[dest] || []).filter(m => (m.minsAgo ?? 0) <= 1440).length;
  }, [state.chatRead]);

  const canPostNow = state.posting === "unlocked";
  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  const value = useMemo(() => ({
    ...state,
    canPostNow, unreadNotifications,
    askQuestion, editQuestion, deleteQuestion, postAnswer, editAnswer, deleteAnswer,
    sendMessage, toggleLike, toggleBookmark, reportPost,
    seeWelcome, seeRules, seeHelp, readChat, addStrike, clearStrikes, resetCommunity,
    seePausedScreen, seeConsent, seeComposeRules, appeal, setCancelled, readNotifications,
    saveProfile, setNotify, toggleMute, sendSuggestion, deleteMyPosts,
    questionsFor, liveQuestionsFor, pendingFor, findQuestion, answersFor, pendingAnswersFor,
    messagesFor, answeredCount, unreadFor,
  }), [state, canPostNow, unreadNotifications,
      askQuestion, editQuestion, deleteQuestion, postAnswer, editAnswer, deleteAnswer,
      sendMessage, toggleLike, toggleBookmark, reportPost,
      seeWelcome, seeRules, seeHelp, readChat, addStrike, clearStrikes, resetCommunity,
      seePausedScreen, seeConsent, seeComposeRules, appeal, setCancelled, readNotifications,
      saveProfile, setNotify, toggleMute, sendSuggestion, deleteMyPosts,
      questionsFor, liveQuestionsFor, pendingFor, findQuestion, answersFor, pendingAnswersFor,
      messagesFor, answeredCount, unreadFor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCommunity() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCommunity must be used inside CommunityProvider");
  return v;
}
