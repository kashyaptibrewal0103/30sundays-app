import { useMemo, useRef, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Search, X as XIcon, ArrowLeft } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { getDest, roomOrder, canPost } from "../data/communityData";
import { Screen, Body } from "../components/Gift/GiftUI";
import { PAD, QuestionCard, Toast } from "../components/Community/CommunityUI";
import { AskSheet } from "./CommunityFeed";

// Search is the way most people will use a body of answered questions: they
// arrive with something specific in mind rather than a wish to browse.
//
// Two things make this worth its own screen. The keyboard needs the whole
// screen, and a search that finds nothing is the best possible moment to ask,
// because the person has just told us exactly what they wanted to know.

const norm = (s) => String(s || "").toLowerCase();

// Title matches rank above body matches, which rank above answer matches. A
// hit anywhere is still a hit: the answer is usually where the words live.
function rank(q, needle, answersOf) {
  const t = norm(q.title), b = norm(q.body);
  if (t.includes(needle)) return 3;
  if (b.includes(needle)) return 2;
  if (answersOf(q).some(a => norm(a.body).includes(needle))) return 1;
  return 0;
}

// One screen, two scopes. Inside a room it searches that room; reached from
// Lounge home it searches every room. The header always says which, because a
// result list that does not say where it looked is a result list nobody trusts.
export default function CommunitySearch({ everywhere }) {
  const { dest = "thailand" } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { questionsFor, answersFor } = useCommunity();

  const [term, setTerm] = useState(params.get("q") || "");
  const [ask, setAsk] = useState(false);
  const [toast, setToast] = useState(null);
  const field = useRef(null);

  const d = getDest(dest);
  const rooms = roomOrder();
  const all = everywhere
    ? rooms.flatMap(id => questionsFor(id).map(q => ({ ...q, room: id })))
    : questionsFor(dest).map(q => ({ ...q, room: dest }));
  const scopeLabel = everywhere ? "Everywhere" : `In ${d.name}`;
  const placeholder = everywhere
    ? "Search the Lounge"
    : `Search in ${d.everyone ? d.name : `${d.name} Lounge`}`;
  const roomOf = (q) => q.room || dest;

  useEffect(() => { field.current?.focus(); }, []);

  const needle = term.trim().toLowerCase();
  const results = useMemo(() => {
    if (needle.length < 2) return [];
    return all
      .map(q => ({ q, score: rank(q, needle, answersFor) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score || answersFor(b.q).length - answersFor(a.q).length)
      .map(r => r.q);
  }, [all, needle, answersFor]);

  // Nothing typed yet, so suggest what to search for rather than show an empty
  // page. Four is enough to give the idea without becoming a second feed.
  const mostAnswered = useMemo(
    () => [...all].sort((a, b) => answersFor(b).length - answersFor(a).length).slice(0, 4),
    [all, answersFor],
  );

  const searching = needle.length >= 2;
  const shown = searching ? results : mostAnswered;

  return (
    <Screen>
      {/* The field replaces the title bar rather than sitting under it. On a
          search screen there is nothing else the top of the screen is for. */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 10,
        padding: `10px ${PAD}px`, borderBottom: `1px solid ${CC.line}`, background: CC.white,
      }}>
        <button
          onClick={() => navigate(everywhere ? "/lounge" : `/community/${dest}`)}
          aria-label="Back"
          style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: "50%", border: "none",
            background: "none", cursor: "pointer", display: "grid", placeItems: "center",
          }}
        ><ArrowLeft size={20} color={CC.ink} /></button>

        <div style={{
          flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8,
          height: 44, padding: "0 12px", borderRadius: 12,
          background: CC.well, border: `1px solid ${CC.line}`,
        }}>
          <Search size={16} color={CC.soft} style={{ flexShrink: 0 }} />
          <input
            ref={field}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1, minWidth: 0, border: "none", background: "none", outline: "none",
              fontFamily: "inherit", fontSize: 15, color: CC.ink,
            }}
          />
          {term && (
            <button onClick={() => { setTerm(""); field.current?.focus(); }} aria-label="Clear"
              style={{
                width: 24, height: 24, flexShrink: 0, borderRadius: "50%", border: "none",
                background: CC.line, cursor: "pointer", display: "grid", placeItems: "center",
              }}><XIcon size={13} color={CC.body} /></button>
          )}
        </div>
      </div>

      <Body>
        <div style={{ padding: `14px 0 32px` }}>
          <p style={{
            fontSize: 12, fontWeight: 700,
            color: CC.body, margin: `0 ${PAD}px 10px`,
          }}>
            {searching
              ? `${results.length} ${results.length === 1 ? "Thread" : "Threads"} ${scopeLabel}`
              : `Top Questions ${scopeLabel}`}
          </p>

          {shown.length > 0 ? (
            <div style={{ padding: `0 ${PAD}px`, display: "flex", flexDirection: "column", gap: 8 }}>
              {shown.map(q => (
                <QuestionCard
                  key={`${roomOf(q)}-${q.id}`} q={q}
                  room={everywhere ? (getDest(roomOf(q)).short || getDest(roomOf(q)).name) : null}
                  answerCount={answersFor(q).length}
                  onClick={() => navigate(`/community/${roomOf(q)}/q/${q.id}`)}
                />
              ))}
            </div>
          ) : (
            <Nothing
              term={term} name={d.name} everywhere={everywhere}
              canAsk={canPost(dest)}
              onWiden={() => navigate(`/lounge/search?q=${encodeURIComponent(term.trim())}`)}
              onAsk={() => setAsk(true)}
            />
          )}
        </div>
      </Body>

      {ask && (
        <AskSheet
          dest={dest} destName={d.name} seedTitle={term}
          onClose={() => setAsk(false)}
          onPosted={(q) => { setAsk(false); navigate(`/community/${dest}/q/${q.id}`); }}
        />
      )}
      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </Screen>
  );
}

function Nothing({ term, name, everywhere, canAsk, onWiden, onAsk }) {
  return (
    <div style={{ textAlign: "center", padding: `28px ${PAD}px 12px` }}>
      <span style={{
        width: 52, height: 52, borderRadius: "50%", background: CC.well,
        display: "grid", placeItems: "center", margin: "0 auto 14px",
      }}><Search size={22} color={CC.soft} /></span>
      <h3 style={{ fontSize: 16.5, fontWeight: 700, color: CC.ink, margin: "0 0 6px" }}>
        Nothing on that yet
      </h3>
      <p style={{ fontSize: 13.5, color: CC.body, margin: 0, lineHeight: "20px" }}>
        Nobody has asked about &ldquo;{term.trim()}&rdquo;
        {everywhere ? " anywhere in the Lounge" : ` in ${name}`}.
        {canAsk ? " Ask it and our team answers the same day." : ""}
      </p>

      {/* One room came up empty, so the next thing to try is the rest of them.
          Asking is the second offer, not the first. */}
      {!everywhere && (
        <button onClick={onWiden} style={{
          marginTop: 16, display: "inline-flex", alignItems: "center", gap: 4,
          padding: 0, minHeight: 40, border: "none", background: "none",
          cursor: "pointer", fontFamily: "inherit",
          fontSize: 14, fontWeight: 700, color: CC.ink,
        }}>
          <span style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
            Search everywhere instead
          </span>
        </button>
      )}

      {canAsk && (
        <div>
          <button onClick={onAsk} style={{
            marginTop: everywhere ? 18 : 6, minHeight: 52, padding: "0 24px", borderRadius: 999,
            border: "none", background: CC.pink, cursor: "pointer",
            fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#fff",
            boxShadow: "0 6px 20px rgba(253,1,79,0.24)",
          }}>Ask this question</button>
        </div>
      )}
    </div>
  );
}
