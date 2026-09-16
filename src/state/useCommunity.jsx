import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { ME, QUESTIONS, CHAT_BY_DEST, track } from "../data/communityData";

// Anything a traveller does in Community lives here, so a question they ask or
// an answer they write is still there when they come back to the feed.

const KEY = "30s_community_v1";
const Ctx = createContext(null);

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

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
    strikes: 0,         // moderation offences this session
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
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ }
  }, [state]);

  const patch = useCallback((fn) => setState(p => fn(p)), []);

  const askQuestion = useCallback(({ dest, title, body, image, tag }) => {
    const q = {
      id: uid("q"), dest, title: title.trim(), body: body.trim(), image,
      // The subject is worked out as the question posts, not chosen by the
      // person asking. Every card is guaranteed one, and nobody is made to
      // classify their own problem before they can ask about it.
      tags: tag ? [tag] : [],
      author: { name: ME.name, city: ME.city, stamp: ME.stamp }, mine: true,
      postedAt: Date.now(), minsAgo: 0, answers: [],
    };
    track("community_question_asked", { dest });
    patch(p => ({ ...p, asked: [q, ...p.asked] }));
    return q;
  }, [patch]);

  const postAnswer = useCallback((questionId, { body, image }) => {
    const a = {
      id: uid("a"), body: body.trim(), image, mine: true,
      author: { name: ME.name, city: ME.city, stamp: ME.stamp },
      postedAt: Date.now(), minsAgo: 0, likes: 0,
    };
    track("community_answer_posted", { questionId });
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

  // Only questions in `asked` can be touched, which is exactly the set this
  // traveller wrote. Nothing seeded is editable, so ownership needs no check
  // beyond looking in the right list.
  const editQuestion = useCallback((id, { title, body }) => patch(p => ({
    ...p,
    asked: p.asked.map(q => (q.id === id
      ? { ...q, title: String(title || "").trim(), body: String(body || "").trim() }
      : q)),
  })), [patch]);

  const deleteQuestion = useCallback((id) => patch(p => {
    const answers = { ...p.answers };
    delete answers[id];
    return { ...p, asked: p.asked.filter(q => q.id !== id), answers };
  }), [patch]);

  // Only answers this traveller wrote live in `answers`, so ownership needs no
  // check beyond looking in the right place.
  const editAnswer = useCallback((questionId, answerId, body) => patch(p => ({
    ...p,
    answers: {
      ...p.answers,
      [questionId]: (p.answers[questionId] || []).map(a => (a.id === answerId
        ? { ...a, body: String(body || "").trim(), edited: true }
        : a)),
    },
  })), [patch]);

  const deleteAnswer = useCallback((questionId, answerId) => patch(p => ({
    ...p,
    answers: {
      ...p.answers,
      [questionId]: (p.answers[questionId] || []).filter(a => a.id !== answerId),
    },
  })), [patch]);

  const toggleLike = useCallback((id) => patch(p => ({
    ...p, likes: { ...p.likes, [id]: !p.likes[id] },
  })), [patch]);

  const toggleBookmark = useCallback((id) => patch(p => ({
    ...p, bookmarks: { ...p.bookmarks, [id]: !p.bookmarks[id] },
  })), [patch]);

  const seeWelcome = useCallback((dest) => patch(p => ({
    ...p, welcomeSeen: { ...p.welcomeSeen, [dest]: true },
  })), [patch]);

  const seeHelp = useCallback((dest) => patch(p => ({
    ...p, helpSeen: { ...p.helpSeen, [dest]: true },
  })), [patch]);

  // Reporting is one way. Nothing is undone from the app, because a report
  // that can be taken back is a report nobody trusts.
  const reportPost = useCallback((id, reason) => patch(p => ({
    ...p, reports: { ...p.reports, [id]: reason },
  })), [patch]);

  const seeRules = useCallback((dest) => patch(p => ({
    ...p, rulesSeen: { ...p.rulesSeen, [dest]: true },
  })), [patch]);

  const readChat = useCallback((dest) => patch(p => (
    p.chatRead[dest] ? p : { ...p, chatRead: { ...p.chatRead, [dest]: true } }
  )), [patch]);

  const addStrike = useCallback(() => {
    let next = 0;
    patch(p => { next = p.strikes + 1; return { ...p, strikes: next }; });
    return next;
  }, [patch]);

  const clearStrikes = useCallback(() => patch(p => ({ ...p, strikes: 0 })), [patch]);

  const resetCommunity = useCallback(() => setState(seed()), []);

  // ── Reading ──
  // Anything a traveller posted sits alongside the seeded data rather than in a
  // separate list, so the feed reads the same either way.
  const questionsFor = useCallback((dest) => [
    ...state.asked.filter(q => q.dest === dest),
    ...QUESTIONS.filter(q => q.dest === dest),
  ], [state.asked]);

  const findQuestion = useCallback((id) =>
    state.asked.find(q => q.id === id) || QUESTIONS.find(q => q.id === id) || null,
  [state.asked]);

  const answersFor = useCallback((q) => {
    if (!q) return [];
    return [...(q.answers || []), ...(state.answers[q.id] || [])];
  }, [state.answers]);

  const messagesFor = useCallback((dest) => [
    ...(CHAT_BY_DEST[dest] || []),
    ...state.messages.filter(m => m.dest === dest),
  ], [state.messages]);

  // How many questions already have at least one answer. The useful number is
  // how much of this has been resolved, not how much has been posted.
  const answeredCount = useCallback((dest) =>
    questionsFor(dest).filter(q => ((q.answers || []).length + (state.answers[q.id] || []).length) > 0).length,
  [questionsFor, state.answers]);

  // Unread is everything from the last day, until the chat has been opened
  // once. Enough to show the badge honestly without faking a read receipt.
  const unreadFor = useCallback((dest) => {
    if (state.chatRead[dest]) return 0;
    return (CHAT_BY_DEST[dest] || []).filter(m => (m.minsAgo ?? 0) <= 1440).length;
  }, [state.chatRead]);

  const value = useMemo(() => ({
    ...state,
    askQuestion, editQuestion, deleteQuestion, postAnswer, editAnswer, deleteAnswer,
    sendMessage, toggleLike, toggleBookmark, reportPost,
    seeWelcome, seeRules, seeHelp, readChat, addStrike, clearStrikes, resetCommunity,
    questionsFor, findQuestion, answersFor, messagesFor, answeredCount, unreadFor,
  }), [state, askQuestion, editQuestion, deleteQuestion, postAnswer, editAnswer, deleteAnswer,
      sendMessage, toggleLike, toggleBookmark, reportPost,
      seeWelcome, seeRules, seeHelp, readChat, addStrike, clearStrikes, resetCommunity,
      questionsFor, findQuestion, answersFor, messagesFor, answeredCount, unreadFor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCommunity() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCommunity must be used inside CommunityProvider");
  return v;
}
