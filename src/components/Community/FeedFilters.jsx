// How the feed is ordered. The controls themselves live in SortFilterVariants;
// this is only the rule they drive.
//
// Unanswered is a sort rather than a filter on purpose. Hiding the answered
// ones would make a busy room look empty; lifting the unanswered ones puts the
// questions that need somebody at the top without losing anything.

// Newest is by time. Unanswered first keeps time as the tiebreak, so a room
// with nothing unanswered still reads newest first.
export function sortQuestions(list, sort, answersOf, likesOf) {
  const n = (q) => answersOf(q).length;
  const qLikes = (q) => (likesOf ? likesOf(q) : 0);
  const aLikes = (q) => answersOf(q).reduce((sum, a) => sum + (a.likes || 0), 0);
  const byTime = (a, b) => (a.minsAgo ?? 0) - (b.minsAgo ?? 0);

  // The default: likes on the question plus the number of answers, ties broken
  // on the most recent activity. It puts the best of the archive on top, which
  // is what a room full of seeded answers needs. The chips are how a brand new
  // question gets dug back out from the bottom of it.
  const score = (q) => qLikes(q) + n(q);

  const out = [...list];
  if (sort === "recent") return out.sort(byTime);
  if (sort === "unanswered") return out.sort((a, b) => (n(a) > 0) - (n(b) > 0) || byTime(a, b));
  if (sort === "liked") return out.sort((a, b) => aLikes(b) - aLikes(a) || byTime(a, b));
  if (sort === "answered") return out.sort((a, b) => n(b) - n(a) || byTime(a, b));
  return out.sort((a, b) => score(b) - score(a) || byTime(a, b));
}
