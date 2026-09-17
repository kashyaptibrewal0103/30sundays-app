import { createContext, createElement, useCallback, useContext, useMemo, useRef, useState } from "react";

// ─── Traveller profile: what we know, and what we are still missing ───
//
// Today an account is a name and a phone number. That is enough to run a trip
// and not enough to run anything else: no email means no invoice and no offer,
// and no dates means the two days a couple actually cares about pass without
// us saying a word.
//
// So there are two ways in, and one store behind them. The home sheet asks for
// the three that earn their keep, and the profile screen holds everything and
// lets it be filled in later.

// What the home sheet asks for. Short on purpose.
export const COLLECT_KEYS = ["email", "dob", "anniversary"];

// Fields that lock once given. A birthday that keeps moving is a birthday we
// cannot send anything against, and an anniversary is not a thing that gets
// corrected twice. Name, photo and city stay editable: they are identity, not
// campaign triggers.
export const LOCK_KEYS = ["email", "dob", "anniversary", "gender"];

// Only the phone number is mandatory, and it is the one thing nobody can
// change: it is the account. Everything below is optional.
export const MANDATORY_KEYS = ["phone"];

// Which home visit brings up the sheet. The app rule is the third visit; the
// prototype shows it on the first so the flow can be reviewed without three
// laps of the home screen.
export const PROMPT_AFTER_VISITS = 1;

const EMPTY = { name: "", email: "", dob: "", anniversary: "", gender: "", city: "", photo: "" };

// A returning traveller, for reviewing the locked state without typing it in.
export const PREFILLED = {
  name: "", email: "kashyap.tibrewal@gmail.com", dob: "01/03/1994",
  anniversary: "12/05/2019", gender: "Male", city: "Gurugram, India", photo: "",
};

const ProfileCtx = createContext(null);

export function ProfileProvider({ children }) {
  const [values, setValues] = useState(EMPTY);
  const [skipped, setSkipped] = useState(false);
  const [visits, setVisits] = useState(0);
  const [events, setEvents] = useState([]);
  const seq = useRef(0);

  // Every screen in this flow reports through here, so the lab can show the
  // tracking plan running rather than describing it.
  const track = useCallback((name, props = {}) => {
    seq.current += 1;
    setEvents((e) => [{ id: seq.current, name, props }, ...e].slice(0, 40));
  }, []);

  // Saving only ever adds. A blank field in the sheet is "not now", never
  // "wipe what I gave you last time".
  const saveProfile = useCallback((patch) => {
    setValues((v) => {
      const next = { ...v };
      Object.entries(patch).forEach(([k, val]) => {
        const clean = typeof val === "string" ? val.trim() : val;
        if (clean) next[k] = clean;
        else if (k in next && !LOCK_KEYS.includes(k)) next[k] = clean || "";
      });
      return next;
    });
  }, []);

  const api = useMemo(() => {
    const isLocked = (key) => LOCK_KEYS.includes(key) && !!values[key];
    const missing = COLLECT_KEYS.filter((k) => !values[k]);
    return {
      values, saveProfile, isLocked, missing, events, track,
      skipped, skip: () => setSkipped(true),
      visits, noteVisit: () => setVisits((n) => n + 1),
      // The sheet is for people we are still missing something from, and it
      // asks once per session.
      shouldPrompt: missing.length > 0 && !skipped && visits >= PROMPT_AFTER_VISITS,
      reset: () => { setValues(EMPTY); setSkipped(false); setVisits(0); setEvents([]); },
      prefill: () => { setValues({ ...EMPTY, ...PREFILLED }); setSkipped(true); },
    };
  }, [values, saveProfile, skipped, visits, events, track]);

  return createElement(ProfileCtx.Provider, { value: api }, children);
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}

// ─── Field helpers ───

// Types as DD / MM / YYYY without the traveller reaching for the slashes.
export function maskDate(raw) {
  const d = String(raw).replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// Real calendar date, in the past, within a lifetime. Returns an error string
// or "" so a field can print it straight.
export function dateError(value, { label = "date" } = {}) {
  if (!value) return "";
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return `Use DD / MM / YYYY`;
  const [, dd, mm, yyyy] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getDate() !== dd || d.getMonth() !== mm - 1 || d.getFullYear() !== yyyy) return `That ${label} does not exist`;
  if (yyyy < 1920) return `Check the year`;
  if (d > new Date()) return `Pick a date that has already happened`;
  return "";
}

export function emailError(value) {
  if (!value) return "";
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim()) ? "" : "Check the email address";
}

// "14 Aug 1994" and "1994-03-01" both become "14/08/1994", so a value that
// came from somewhere else still lands in the same field.
export function toDMY(value) {
  if (!value) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// "01/03/1994" reads back as "1 Mar 1994" wherever we are showing it rather
// than asking for it.
export function prettyDate(value) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  if (!m) return value || "";
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function initialsOf(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}
