import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Key, Eye, EyeOff, RefreshCw, Upload, Check, X, AlertTriangle, Sparkles,
  Download, Plus, Trash2, Shuffle, ChevronDown, ChevronRight,
  RotateCcw, StopCircle, Image as ImageIcon, Clock, ScanFace, Eraser,
  Layers, Trophy, SlidersHorizontal, MapPin, Save,
} from "lucide-react";
import { C } from "../data";
import { PRESET_LOCATIONS } from "../data/labLocations";
import {
  IMAGE_MODELS, DEFAULT_IMAGE_MODEL, CHECK_MODELS, DEFAULT_CHECK_MODEL,
  IMAGE_SIZES, ASPECT_RATIOS, looksLikeImageModel,
} from "../data/labModels";
import {
  DEFAULT_IMAGE_PROMPT, DEFAULT_VALIDATE_PROMPT, DEFAULT_SUBJECT_PROMPT,
  DEFAULT_LIKENESS_PROMPT, LOCATION_TOKEN, PEOPLE_TOKEN,
  REJECTION_COPY, FALLBACK_REJECTION,
  DEFAULT_DESCRIPTOR_PROMPT, DEFAULT_COMPOSITE_PROMPT, DEFAULT_GATE_PROMPT,
  DEFAULT_LOCCONFIG_PROMPT, DEFAULT_FACE_SWAP_PROMPT, DEFAULT_CUTOUT_PROMPT,
  DEFAULT_BLEND_PROMPT, DEFAULT_CLOSEUP_PROMPT, DEFAULT_EMPTY_PROMPT,
  OUTFIT_TOKEN, HEIGHT_TOKEN, PLACEMENT_TOKEN, LIGHT_TOKEN, FRAMING_TOKEN,
} from "../data/labPrompts";
import {
  checkPhoto, listModels, urlToInline, blobToInlineResized, blobToInline,
  inlineToDataUrl, nearestRatio, readSubjects, describePeople,
  scoreLikeness, makePlate, readDescriptor, describeDescriptor, readLocationConfig,
} from "../lib/gemini";
import {
  WORKFLOWS, DEFAULT_WORKFLOW, getWorkflow, estimateCalls, blockedBecause,
} from "../lib/workflows";
import {
  putImage, getImage, deleteImage, imageKeys, putSession, getSession, clearAll,
  urlToBlob, askToPersist, storageUsed,
} from "../lib/labStore";
import { resizeToExact } from "../lib/composite";

const BATCH = 5;
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/* ── small helpers ── */

// The first build shipped with the ratio on Auto and the panel labels on, which
// made some models answer with a before and after diptych instead of one photo.
// Settings are remembered, so the two bad ones are cleared once.
(function migrateSettings() {
  const steps = {
    // Auto ratio and the panel labels made some models answer with a before and
    // after diptych instead of one photo.
    2: ["lab.aspect", "lab.labelImages"],
    // Temperature 1 was far too loose for a job whose whole point is copying two
    // particular faces exactly.
    3: ["lab.imageTemp"],
    // Both of these are now decided by which workflow is picked, so a stale
    // toggle would quietly contradict the choice on screen.
    4: ["lab.onePerPass", "lab.usePlates"],
  };
  try {
    const at = Number(localStorage.getItem("lab.settingsVersion") || 0);
    for (const [version, keys] of Object.entries(steps)) {
      if (at >= Number(version)) continue;
      keys.forEach((k) => localStorage.removeItem(k));
    }
    localStorage.setItem("lab.settingsVersion", "4");
  } catch { /* no storage, nothing to migrate */ }
})();

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  }, [key, value]);
  return [value, setValue];
}

const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);

// Runs thunks a few at a time and keeps the results in the order they were
// given. A race of five heavy workflows all at once is how a key gets throttled.
async function pool(thunks, limit = 3) {
  const out = new Array(thunks.length).fill(null);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, thunks.length) }, async () => {
    while (next < thunks.length) {
      const i = next++;
      try { out[i] = await thunks[i](); } catch { out[i] = null; }
    }
  });
  await Promise.all(workers);
  return out;
}

function download(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/* ── form parts ── */

function Card({ children, style }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.div}`, borderRadius: 12,
      padding: 14, ...style,
    }}>{children}</div>
  );
}

function Section({ title, icon, children, defaultOpen = true, right }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "12px 14px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        {open ? <ChevronDown size={16} color={C.sub} /> : <ChevronRight size={16} color={C.sub} />}
        {icon}
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: C.head }}>{title}</span>
        {right}
      </button>
      {open && <div style={{ padding: "0 14px 14px", display: "grid", gap: 12 }}>{children}</div>}
    </Card>
  );
}

function Label({ children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, letterSpacing: "0.02em", textTransform: "uppercase" }}>{children}</span>
      {hint && <span style={{ fontSize: 11, color: C.inact }}>{hint}</span>}
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "8px 10px",
  border: `1px solid ${C.div}`, borderRadius: 8, fontSize: 13,
  color: C.head, background: C.white, outline: "none",
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} style={{ ...inputStyle, cursor: "pointer" }}>
      {children}
    </select>
  );
}

function Temp({ value, onChange }) {
  return (
    <div>
      <Label hint={String(value)}>Temperature</Label>
      <input
        type="range" min={0} max={2} step={0.05} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.p600 }}
      />
    </div>
  );
}

function Toggle({ checked, onChange, children }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.head, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: C.p600, width: 15, height: 15 }} />
      {children}
    </label>
  );
}

function PromptBox({ value, onChange, onReset, rows = 12, tokens }) {
  const ref = useRef(null);
  const insert = (token) => {
    const el = ref.current;
    const at = el ? el.selectionStart : value.length;
    onChange(value.slice(0, at) + token + value.slice(at));
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        {tokens?.map((t) => (
          <button key={t} onClick={() => insert(t)} style={{
            fontFamily: MONO, fontSize: 11, padding: "3px 7px", borderRadius: 6,
            border: `1px solid ${C.p300}`, background: C.p100, color: C.p900, cursor: "pointer",
          }}>{t}</button>
        ))}
        <button onClick={onReset} style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, padding: "3px 7px", borderRadius: 6,
          border: `1px solid ${C.div}`, background: C.white, color: C.sub, cursor: "pointer",
        }}><RotateCcw size={11} /> Reset</button>
      </div>
      <textarea
        ref={ref} value={value} rows={rows}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          ...inputStyle, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.5,
          resize: "vertical", minHeight: 120,
        }}
      />
      <div style={{ fontSize: 11, color: C.inact, marginTop: 4 }}>
        {value.length.toLocaleString()} characters. Read fresh on every request.
      </div>
    </div>
  );
}

// Rebuilding the thirty preset photos, once, with their people taken out. This
// writes over the files on disk, which is why it says so plainly and why the dev
// server keeps a copy of every original before it replaces one.
function SceneRebuild({
  rebuild, state, total, canRun, model, onRun, onRetryFailed, onStop,
  scenesAreEmpty, setScenesAreEmpty,
}) {
  const [armed, setArmed] = useState(false);
  const done = rebuild.done.length;
  const failed = rebuild.failed.length;
  const left = total - done;

  return (
    <div style={{ border: `1px solid ${C.p300}`, borderRadius: 9, padding: 10, display: "grid", gap: 8, background: C.white }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.head }}>Rebuild the thirty photos without people</div>
      <Note>
        Runs every preset location photo through {model} once, asking for the same
        photograph with the people taken out and everything else untouched, then
        writes the result over the original file. The old file is copied to a
        with-people folder first, so nothing is lost. Thirty image calls, three at a
        time. It only needs doing once.
      </Note>
      {done > 0 && (
        <Note tone={failed ? "warn" : "good"}>
          {done} of {total} rebuilt{failed ? `, ${failed} failed` : ""}
          {left > 0 && !failed ? `, ${left} still to do` : ""}.
          {done === total && !failed ? " Reload the page to see them." : ""}
        </Note>
      )}
      {failed > 0 && (
        <div style={{ fontSize: 11, color: C.dText, lineHeight: 1.45 }}>
          {rebuild.failed.slice(0, 4).map((f) => <div key={f.id}>{f.id}: {f.error}</div>)}
          {failed > 4 && <div>and {failed - 4} more.</div>}
        </div>
      )}
      {state.error && <Note tone="bad">{state.error}</Note>}
      {state.running ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: C.sub, display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={12} className="spin" /> {state.at} of {left || total} done
          </span>
          <Button kind="danger" onClick={onStop} style={{ fontSize: 12, padding: "6px 10px" }}>
            <StopCircle size={12} /> Stop
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!armed ? (
            <Button kind="ghost" disabled={!canRun || left === 0} onClick={() => setArmed(true)}>
              <Eraser size={13} /> {left === 0 ? "All thirty done" : `Rebuild ${left === total ? "all thirty" : `the remaining ${left}`}`}
            </Button>
          ) : (
            <>
              <Button onClick={() => { setArmed(false); onRun(); }}>
                <Eraser size={13} /> Yes, replace the files
              </Button>
              <Button kind="ghost" onClick={() => setArmed(false)}>Cancel</Button>
            </>
          )}
          {failed > 0 && (
            <Button kind="ghost" disabled={!canRun} onClick={onRetryFailed}>
              <RefreshCw size={13} /> Retry the {failed} that failed
            </Button>
          )}
        </div>
      )}
      {armed && <Note tone="warn">This overwrites {left} photo{left === 1 ? "" : "s"} in the project. Originals are copied to with-people first.</Note>}
      {!canRun && <Note tone="warn">Add your Gemini key first.</Note>}
      <Toggle checked={scenesAreEmpty} onChange={setScenesAreEmpty}>
        The location photos already have nobody in them
      </Toggle>
      <Note>
        Turn that on once the rebuild is done. Every workflow that wanted the scene
        emptied then skips that call and uses the photo as it is, which is one call
        less per place. It also means workflows 1 and 2 lose the stand-in couple they
        were using as a pose and scale template.
      </Note>
    </div>
  );
}

// A prompt kept out of the way until it is wanted. Ten permanent text boxes in
// the rail would bury everything else in it.
function PromptDrawer({ title, value, onChange, onReset, tokens }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.div}`, borderRadius: 9, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 7, padding: "9px 10px",
        background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        {open ? <ChevronDown size={14} color={C.sub} /> : <ChevronRight size={14} color={C.sub} />}
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: C.head }}>{title}</span>
      </button>
      {open && (
        <div style={{ padding: "0 10px 10px" }}>
          <PromptBox value={value} onChange={onChange} onReset={onReset} rows={14} tokens={tokens} />
        </div>
      )}
    </div>
  );
}

// One picked place, with whatever has been prepared for it. The numbers are
// editable, because a model reading a photo gets the standing spot wrong often
// enough that being able to nudge it by hand saves a lot of regenerating.
function SceneRow({ loc, plate, config, onEdit }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.div}`, borderRadius: 9, overflow: "hidden" }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: 8,
        background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <img src={plate || loc.image} alt="" style={{
          width: 44, height: 44, objectFit: "cover", borderRadius: 6,
          border: `1px solid ${plate ? C.p300 : C.div}`, flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loc.name}</div>
          <div style={{ fontSize: 11, color: C.sub }}>
            {plate ? "emptied" : "not emptied"}
            {config ? `, read, ${config.heightPct}% tall` : ", not read"}
            {config?.difficulty === "hard" ? ", hard angle" : ""}
          </div>
        </div>
        {open ? <ChevronDown size={14} color={C.sub} /> : <ChevronRight size={14} color={C.sub} />}
      </button>
      {open && (
        <div style={{ padding: "0 8px 8px", display: "grid", gap: 8 }}>
          {!config && <Note>Nothing read yet for this place.</Note>}
          {config && (
            <>
              <div>
                <Label>Outfit</Label>
                <textarea
                  value={config.outfit || ""} rows={2} spellCheck={false}
                  onChange={(e) => onEdit({ outfit: e.target.value })}
                  style={{ ...inputStyle, fontSize: 12, resize: "vertical" }}
                />
              </div>
              <div>
                <Label>Where they stand</Label>
                <textarea
                  value={config.placement || ""} rows={2} spellCheck={false}
                  onChange={(e) => onEdit({ placement: e.target.value })}
                  style={{ ...inputStyle, fontSize: 12, resize: "vertical" }}
                />
              </div>
              <div>
                <Label>The light</Label>
                <textarea
                  value={config.light || ""} rows={2} spellCheck={false}
                  onChange={(e) => onEdit({ light: e.target.value })}
                  style={{ ...inputStyle, fontSize: 12, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  ["heightPct", "Height %"],
                  ["xPct", "Across %"],
                  ["yPct", "Down %"],
                ].map(([field, label]) => (
                  <div key={field}>
                    <Label>{label}</Label>
                    <TextInput
                      type="number" min={1} max={100} value={config[field] ?? ""}
                      onChange={(e) => onEdit({ [field]: Number(e.target.value) })}
                      style={{ fontSize: 12 }}
                    />
                  </div>
                ))}
              </div>
              <Note>Across and down are where their feet land. Height is how tall they stand in the frame.</Note>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Button({ onClick, disabled, children, kind = "primary", style }) {
  const kinds = {
    primary: { background: disabled ? C.icon : C.p600, color: C.white, border: "none" },
    ghost: { background: C.white, color: C.head, border: `1px solid ${C.div}` },
    danger: { background: C.white, color: C.dText, border: `1px solid ${C.dText}44` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
      padding: "9px 14px", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", ...kinds[kind], ...style,
    }}>{children}</button>
  );
}

function Note({ tone = "info", children }) {
  const tones = {
    info: { bg: C.bg, text: C.sub, border: C.div },
    good: { bg: C.sBg, text: C.sText, border: C.sBorder },
    bad: { bg: C.dBg, text: C.dText, border: `${C.dText}33` },
    warn: { bg: C.wBg, text: C.wText, border: `${C.wText}33` },
  }[tone];
  return (
    <div style={{
      background: tones.bg, color: tones.text, border: `1px solid ${tones.border}`,
      borderRadius: 9, padding: "9px 11px", fontSize: 12.5, lineHeight: 1.45,
    }}>{children}</div>
  );
}

function Raw({ label = "Raw response", data }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: "flex", alignItems: "center", gap: 5, background: "none",
        border: "none", padding: 0, fontSize: 11.5, color: C.sub, cursor: "pointer",
      }}>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />} {label}
      </button>
      {open && (
        <pre style={{
          margin: "6px 0 0", padding: 10, background: "#0F1115", color: "#D8DEE9",
          borderRadius: 8, fontSize: 10.5, lineHeight: 1.5, maxHeight: 260,
          overflow: "auto", fontFamily: MONO,
        }}>{typeof data === "string" ? data : JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

/* ── the page ── */

export default function AILab() {
  /* settings, all persisted so a reload does not cost a retype */
  const [apiKey, setApiKey] = useStored("lab.key", "");
  const [showKey, setShowKey] = useState(false);
  const [checkModel, setCheckModel] = useStored("lab.checkModel", DEFAULT_CHECK_MODEL);
  const [checkTemp, setCheckTemp] = useStored("lab.checkTemp", 0);
  const [checkPrompt, setCheckPrompt] = useStored("lab.checkPrompt", DEFAULT_VALIDATE_PROMPT);
  const [imageModel, setImageModel] = useStored("lab.imageModel", DEFAULT_IMAGE_MODEL);
  const [imageTemp, setImageTemp] = useStored("lab.imageTemp", 0.35);
  const [imagePrompt, setImagePrompt] = useStored("lab.imagePrompt", DEFAULT_IMAGE_PROMPT);
  const [emptyPrompt, setEmptyPrompt] = useStored("lab.emptyPrompt", DEFAULT_EMPTY_PROMPT);
  const [framing, setFraming] = useStored("lab.framing", "free");
  const [imageSize, setImageSize] = useStored("lab.imageSize", "2K");
  const [aspect, setAspect] = useStored("lab.aspect", "Match");
  const [sendEdge, setSendEdge] = useStored("lab.sendEdge", 1568);
  const [labelImages, setLabelImages] = useStored("lab.labelImages", false);
  const [oneFrame, setOneFrame] = useStored("lab.oneFrame", true);
  const [subjectFirst, setSubjectFirst] = useStored("lab.subjectFirst", false);
  const [agentOn, setAgentOn] = useStored("lab.agentOn", true);
  const [agentRounds, setAgentRounds] = useStored("lab.agentRounds", 2);
  const [agentTarget, setAgentTarget] = useStored("lab.agentTarget", 80);
  const [subjectPrompt, setSubjectPrompt] = useStored("lab.subjectPrompt", DEFAULT_SUBJECT_PROMPT);
  const [likenessPrompt, setLikenessPrompt] = useStored("lab.likenessPrompt", DEFAULT_LIKENESS_PROMPT);

  /* which of the nine ways to make the picture, and the race between them */
  const [workflowId, setWorkflowId] = useStored("lab.workflow", DEFAULT_WORKFLOW);
  const [compareOn, setCompareOn] = useStored("lab.compareOn", false);
  const [compareIds, setCompareIds] = useStored("lab.compareWorkflows", ["one-at-a-time", "empty-scene", "cut-blend"]);

  /* the prompts the newer workflows use, all editable like the first two */
  const [descriptorPrompt, setDescriptorPrompt] = useStored("lab.descriptorPrompt", DEFAULT_DESCRIPTOR_PROMPT);
  const [compositePrompt, setCompositePrompt] = useStored("lab.compositePrompt", DEFAULT_COMPOSITE_PROMPT);
  const [gatePrompt, setGatePrompt] = useStored("lab.gatePrompt", DEFAULT_GATE_PROMPT);
  const [locConfigPrompt, setLocConfigPrompt] = useStored("lab.locConfigPrompt", DEFAULT_LOCCONFIG_PROMPT);
  const [faceSwapPrompt, setFaceSwapPrompt] = useStored("lab.faceSwapPrompt", DEFAULT_FACE_SWAP_PROMPT);
  const [cutoutPrompt, setCutoutPrompt] = useStored("lab.cutoutPrompt", DEFAULT_CUTOUT_PROMPT);
  const [blendPrompt, setBlendPrompt] = useStored("lab.blendPrompt", DEFAULT_BLEND_PROMPT);
  const [closeupPrompt, setCloseupPrompt] = useStored("lab.closeupPrompt", DEFAULT_CLOSEUP_PROMPT);

  /* the emptied scenes are big, so they live in memory only. the scene notes are
     small json, and worth keeping between reloads. */
  const [plates, setPlates] = useState({});
  const [locConfigs, setLocConfigs] = useStored("lab.locConfigs", {});
  const [scenesAreEmpty, setScenesAreEmpty] = useStored("lab.scenesAreEmpty", false);
  const [revealTogether, setRevealTogether] = useStored("lab.revealTogether", true);
  const [customLocations, setCustomLocations] = useStored("lab.locations", []);
  const [selectedIds, setSelectedIds] = useStored("lab.selected", []);

  /* live model list, kept so the dropdowns are not empty again after a reload */
  const [liveModels, setLiveModels] = useStored("lab.models", null);
  const [modelsState, setModelsState] = useState({ loading: false, error: null });

  /* the couple photo */
  const [photo, setPhoto] = useState(null); // { dataUrl, inline, name, width, height }
  const [extras, setExtras] = useState([]); // more angles of the same two people
  const [check, setCheck] = useState(null); // { status, verdict, text, raw, ms, error }
  const [subjects, setSubjects] = useState(null); // { status, people, faces, error }
  const [descriptor, setDescriptor] = useState(null); // { status, people, blocking, error }
  const [overrideCheck, setOverrideCheck] = useState(false);

  /* the batch */
  const [runs, setRuns] = useState([]);
  const [running, setRunning] = useState(false);
  const [batchMs, setBatchMs] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [passPeek, setPassPeek] = useState(null);
  const [raceScoring, setRaceScoring] = useState(false);

  /* the session, kept in IndexedDB so a reload or a restart does not lose the
     pictures. booted gates the writer, so an empty first render cannot overwrite
     the session before it has been read back. */
  const [booted, setBooted] = useState(false);
  const [restored, setRestored] = useState(null);
  const [storage, setStorage] = useState(null);
  const abortRef = useRef(null);
  const [storageWarning, setStorageWarning] = useState(false);

  const locations = useMemo(() => [...customLocations, ...PRESET_LOCATIONS], [customLocations]);
  const byId = useMemo(() => Object.fromEntries(locations.map((l) => [l.id, l])), [locations]);
  const selected = useMemo(() => selectedIds.map((id) => byId[id]).filter(Boolean), [selectedIds, byId]);

  const countries = useMemo(() => [...new Set(locations.map((l) => l.country))], [locations]);
  const [country, setCountry] = useStored("lab.country", "All");

  /* ── model list ── */
  const loadModels = async () => {
    setModelsState({ loading: true, error: null });
    try {
      const list = await listModels(apiKey);
      setLiveModels(list.filter((m) => m.methods.includes("generateContent")));
      setModelsState({ loading: false, error: null });
    } catch (e) {
      setModelsState({ loading: false, error: e.message });
    }
  };

  const imageOptions = useMemo(() => {
    const live = (liveModels || []).filter((m) => looksLikeImageModel(m.id));
    const seen = new Set(live.map((m) => m.id));
    return [...live, ...IMAGE_MODELS.filter((m) => !seen.has(m.id))];
  }, [liveModels]);

  const checkOptions = useMemo(() => {
    const live = (liveModels || []).filter((m) => !looksLikeImageModel(m.id));
    const seen = new Set(live.map((m) => m.id));
    return [...live, ...CHECK_MODELS.filter((m) => !seen.has(m.id))];
  }, [liveModels]);

  /* ── photo upload and check ── */
  const runCheck = useCallback(async (inline) => {
    if (!apiKey) { setCheck({ status: "error", error: "Add your Gemini key first." }); return; }
    setCheck({ status: "running" });
    setOverrideCheck(false);
    try {
      const res = await checkPhoto({
        key: apiKey, model: checkModel, temperature: checkTemp,
        prompt: checkPrompt, image: inline,
      });
      setCheck({ status: "done", ...res });
    } catch (e) {
      setCheck({ status: "error", error: e.message, raw: e.body });
    }
  }, [apiKey, checkModel, checkTemp, checkPrompt]);

  const takeFile = async (file) => {
    if (!file) return;
    setRuns([]); setBatchMs(null); setSubjects(null); setDescriptor(null);
    try {
      const { inline, width, height } = await blobToInlineResized(file, 2048, 0.92);
      const dataUrl = inlineToDataUrl(inline);
      setPhoto({ dataUrl, inline, file, name: file.name, width, height });
      // The shrunk bytes are what gets sent, so they are what gets kept.
      askToPersist();
      putImage("photo", await urlToBlob(dataUrl)).then(refreshStorage).catch(() => {});
      runCheck(inline);
    } catch (e) {
      setCheck({ status: "error", error: e.message });
    }
  };

  // Extra angles are held in memory only. Three of them as data urls would not
  // fit in localStorage next to everything else that lives there.
  const addExtra = async (file) => {
    if (!file) return;
    if (extras.length >= 3) return;
    try {
      const { inline } = await blobToInlineResized(file, 2048, 0.92);
      const dataUrl = inlineToDataUrl(inline);
      // The slot is read here rather than inside the updater below, because React
      // runs an updater during the next render, by which time this line has gone.
      const at = extras.length;
      setExtras((list) => (list.length >= 3
        ? list
        : [...list, { inline, dataUrl, name: file.name }]));
      await putImage(`extra:${at}`, await urlToBlob(dataUrl));
      refreshStorage();
    } catch { /* an unreadable file is simply not added */ }
  };

  /* ── the subject read: who these two people are, and where their heads are ── */
  const runSubjectRead = useCallback(async (inline) => {
    setSubjects({ status: "running" });
    try {
      const res = await readSubjects({
        key: apiKey, model: checkModel, prompt: subjectPrompt, image: inline,
      });
      setSubjects({ status: "done", ...res });
      return res;
    } catch (e) {
      setSubjects({ status: "error", error: e.message, raw: e.body });
      return null;
    }
  }, [apiKey, checkModel, subjectPrompt]);

  /* ── locations ── */
  const toggleLocation = (id) => {
    setSelectedIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= BATCH) return ids;
      return [...ids, id];
    });
  };

  const pickRandom = () => {
    const pool = [...locations];
    const picked = [];
    while (picked.length < BATCH && pool.length) {
      picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].id);
    }
    setSelectedIds(picked);
  };

  const addLocation = async ({ name, countryName, file }) => {
    const { inline } = await blobToInlineResized(file, 1600, 0.78);
    const entry = {
      id: `custom-${Date.now()}`,
      country: countryName || "Added",
      name,
      image: inlineToDataUrl(inline),
      custom: true,
    };
    setCustomLocations((list) => [entry, ...list]);
    try {
      localStorage.setItem("lab.probe", entry.image.slice(0, 1000));
      localStorage.removeItem("lab.probe");
    } catch { setStorageWarning(true); }
  };

  /* ── what the workflows need built first, made on demand and cached ── */
  const [sceneWork, setSceneWork] = useState({ running: false, error: null, done: 0, total: 0 });

  // Several workflows can want the same emptied scene at the same moment in a
  // race, so the caches are read through a ref and the calls in flight are
  // shared rather than repeated.
  const platesRef = useRef(plates);
  const configsRef = useRef(locConfigs);
  useEffect(() => { platesRef.current = plates; }, [plates]);
  useEffect(() => { configsRef.current = locConfigs; }, [locConfigs]);
  const plateJobs = useRef(new Map());
  const configJobs = useRef(new Map());

  const ensurePlate = useCallback(async (loc, cfg, signal) => {
    // A photo that has already been rebuilt has nobody in it, so there is
    // nothing to take out and the call is skipped.
    if (cfg.scenesAreEmpty) return loc.image;
    if (platesRef.current[loc.id]) return platesRef.current[loc.id];
    if (plateJobs.current.has(loc.id)) return plateJobs.current.get(loc.id);
    const job = (async () => {
      const { inline, width, height } = await urlToInline(loc.image, cfg.sendEdge);
      const res = await makePlate({
        key: cfg.apiKey, model: cfg.imageModel, scene: inline,
        aspectRatio: cfg.aspect === "Match" ? nearestRatio(width, height) : cfg.aspect,
        imageSize: cfg.imageSize, signal,
      });
      platesRef.current = { ...platesRef.current, [loc.id]: res.dataUrl };
      setPlates((prev) => ({ ...prev, [loc.id]: res.dataUrl }));
      // An emptied scene costs a call, so it is worth keeping past a reload.
      putImage(`plate:${loc.id}`, await urlToBlob(res.dataUrl)).catch(() => {});
      return res.dataUrl;
    })();
    plateJobs.current.set(loc.id, job);
    try { return await job; } finally { plateJobs.current.delete(loc.id); }
  }, []);

  const ensureConfig = useCallback(async (loc, cfg, signal) => {
    if (configsRef.current[loc.id]) return configsRef.current[loc.id];
    if (configJobs.current.has(loc.id)) return configJobs.current.get(loc.id);
    const job = (async () => {
      const { inline } = await urlToInline(loc.image, cfg.sendEdge);
      const { config } = await readLocationConfig({
        key: cfg.apiKey, model: cfg.checkModel,
        prompt: cfg.prompts.locConfig.split(LOCATION_TOKEN).join(loc.name),
        image: inline, signal,
      });
      configsRef.current = { ...configsRef.current, [loc.id]: config };
      setLocConfigs((prev) => ({ ...prev, [loc.id]: config }));
      return config;
    })();
    configJobs.current.set(loc.id, job);
    try { return await job; } finally { configJobs.current.delete(loc.id); }
  }, [setLocConfigs]);

  /* ── the settings, frozen for the length of a run ── */
  const prompts = useMemo(() => ({
    image: imagePrompt, empty: emptyPrompt, likeness: likenessPrompt, subject: subjectPrompt,
    descriptor: descriptorPrompt, composite: compositePrompt, gate: gatePrompt,
    locConfig: locConfigPrompt, faceSwap: faceSwapPrompt, cutout: cutoutPrompt,
    blend: blendPrompt, closeup: closeupPrompt,
  }), [imagePrompt, emptyPrompt, likenessPrompt, subjectPrompt, descriptorPrompt, compositePrompt,
    gatePrompt, locConfigPrompt, faceSwapPrompt, cutoutPrompt, blendPrompt, closeupPrompt]);

  const cfg = useMemo(() => ({
    apiKey, imageModel, checkModel, imageTemp, sendEdge, imageSize, aspect,
    labelImages, oneFrame, subjectFirst, agentOn, agentRounds, agentTarget, prompts,
    scenesAreEmpty, framing,
  }), [apiKey, imageModel, checkModel, imageTemp, sendEdge, imageSize, aspect,
    labelImages, oneFrame, subjectFirst, agentOn, agentRounds, agentTarget, prompts,
    scenesAreEmpty, framing]);

  /* ── building the emptied scenes and the scene notes by hand ── */
  const prepareScenes = async (what) => {
    setSceneWork({ running: true, error: null, done: 0, total: selected.length });
    let done = 0;
    for (const loc of selected) {
      try {
        if (what === "plate") await ensurePlate(loc, cfg);
        else await ensureConfig(loc, cfg);
        done += 1;
        setSceneWork({ running: true, error: null, done, total: selected.length });
      } catch (e) {
        setSceneWork({ running: false, error: `${loc.name}: ${e.message}`, done, total: selected.length });
        return;
      }
    }
    setSceneWork({ running: false, error: null, done, total: selected.length });
  };

  /* ── rebuilding the preset photos with their people taken out ── */
  const [rebuild, setRebuild] = useStored("lab.rebuild", { done: [], failed: [] });
  const [rebuildState, setRebuildState] = useState({ running: false, at: 0, error: null });
  const rebuildAbort = useRef(null);

  // Writes the emptied scenes over the files they came from, all in one request.
  // The dev server copies each original aside first, so this is reversible.
  const writeSceneFiles = async (files) => {
    const res = await fetch("/lab-write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.error || "Could not write the photos");
    return json;
  };

  const rebuildScenes = async (only = null) => {
    const targets = (only ? [only] : PRESET_LOCATIONS)
      .filter((loc) => only || !rebuild.done.includes(loc.id));
    if (!targets.length) { setRebuildState({ running: false, at: 0, error: null }); return; }

    const controller = new AbortController();
    rebuildAbort.current = controller;
    setRebuildState({ running: true, at: 0, error: null });

    let at = 0;
    const done = new Set(rebuild.done);
    const failed = new Map(rebuild.failed.map((f) => [f.id, f.error]));

    // A location that has been rebuilt before has its untouched original sitting
    // in the backup folder, and that is the right thing to read from. Emptying an
    // already empty scene only loses another generation's worth of detail.
    const sourceFor = async (loc) => {
      const backup = `/lab-locations/with-people/${loc.id}.jpg`;
      try {
        const head = await fetch(backup, { method: "HEAD" });
        // The dev server answers a path it does not have with the app's own
        // index.html, so an ok status proves nothing. Only an image content type
        // means there is really a backup sitting there.
        const type = head.headers.get("content-type") || "";
        if (head.ok && type.startsWith("image/")) return backup;
      } catch { /* no backup, so the file itself is the original */ }
      return loc.image;
    };

    const ready = [];
    const one = async (loc) => {
      try {
        const src = await sourceFor(loc);
        const { inline, width, height } = await urlToInline(src, 2048);
        const res = await makePlate({
          key: apiKey, model: imageModel, scene: inline,
          aspectRatio: nearestRatio(width, height),
          // Asked for as large as the model will go, because these are the source
          // photos for everything else and 2048 is what they are today.
          imageSize: "4K", signal: controller.signal,
        });
        // Back to a jpeg at exactly the original's pixels, so the new file is a
        // drop in replacement rather than a smaller, slightly reshaped one.
        const bytes = await urlToBlob(res.dataUrl);
        const { inline: raw } = await blobToInlineResized(bytes, 4096, 0.95);
        const exact = await resizeToExact(raw, width, height);
        ready.push({ name: `${loc.id}.jpg`, dataUrl: inlineToDataUrl(exact) });
        done.add(loc.id);
        failed.delete(loc.id);
      } catch (e) {
        if (e.name === "AbortError") throw e;
        failed.set(loc.id, e.message);
      } finally {
        at += 1;
        setRebuildState({ running: true, at, error: null });
      }
    };

    try {
      // Three at a time: thirty image calls fired at once is how a key gets
      // throttled, and a throttled sweep has to be run again anyway.
      await pool(targets.map((loc) => () => one(loc)), 3);
    } catch (e) {
      setRebuildState({ running: false, at, error: e.name === "AbortError" ? "Stopped." : e.message });
    }

    // Recorded before the files land, because writing them wakes the dev server's
    // file watcher and this page may be reloaded out from under us.
    setRebuild({
      done: [...done],
      failed: [...failed].map(([id, error]) => ({ id, error })),
    });

    if (ready.length) {
      try {
        const res = await writeSceneFiles(ready);
        setRebuildState({
          running: false, at,
          error: res.failed?.length ? `${res.failed.length} could not be written` : null,
        });
      } catch (e) {
        setRebuildState({ running: false, at, error: `Generated, but not written: ${e.message}` });
      }
    } else {
      setRebuildState({ running: false, at, error: at ? "Nothing came back to write." : null });
    }
    // The pictures on screen came from the old files, and every cached copy of
    // them is now wrong.
    setPlates({});
    platesRef.current = {};
    rebuildAbort.current = null;
  };

  /* ── the descriptor read, once per photo ── */
  const runDescriptorRead = useCallback(async (inline) => {
    setDescriptor({ status: "running" });
    try {
      const res = await readDescriptor({
        key: apiKey, model: checkModel, prompt: descriptorPrompt, image: inline,
      });
      setDescriptor({ status: "done", ...res });
      return res;
    } catch (e) {
      setDescriptor({ status: "error", error: e.message, raw: e.body });
      return null;
    }
  }, [apiKey, checkModel, descriptorPrompt]);

  /* ── the batch ── */
  const verdict = check?.status === "done" ? check.verdict : null;
  const rejected = Boolean(verdict) && verdict.accept === false;
  const checkBlocks = rejected && !overrideCheck;

  const workflow = getWorkflow(workflowId);
  const raceWorkflows = useMemo(
    () => compareIds.map((id) => WORKFLOWS.find((w) => w.id === id)).filter(Boolean),
    [compareIds]
  );
  const raceLoc = selected[0] || null;

  const workflowBlock = compareOn
    ? raceWorkflows.map((w) => blockedBecause(w, { extraCount: extras.length })).find(Boolean) || null
    : blockedBecause(workflow, { extraCount: extras.length });

  const enoughPicked = compareOn ? Boolean(raceLoc) && raceWorkflows.length > 0 : selected.length > 0;
  const canRun = Boolean(apiKey) && Boolean(photo) && enoughPicked && !running && !checkBlocks && !workflowBlock;

  // What the run will cost, before it is pressed. The race adds one judging call
  // per workflow, because a fair comparison needs one judge, not each workflow's.
  const callEstimate = compareOn
    ? raceWorkflows.reduce((n, w) => n + (estimateCalls(w.id, cfg) || 0) + 1, 0)
    : (estimateCalls(workflowId, cfg) || 0) * Math.max(1, selected.length);

  // Either one workflow across the picked places, or several workflows racing on
  // one place. Both come out as the same list of targets.
  const buildTargets = () => (compareOn
    ? raceWorkflows.map((wf) => ({ key: wf.id, wf, loc: raceLoc, label: wf.name, sub: raceLoc.name }))
    : selected.map((loc) => ({ key: loc.id, wf: workflow, loc, label: loc.name, sub: loc.country })));

  const runBatch = async (onlyKey = null) => {
    if (compareOn && !raceLoc) return;
    const all = buildTargets();
    const targets = onlyKey ? all.filter((t) => t.key === onlyKey) : all;
    if (!targets.length) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setBatchMs(null);
    const started = performance.now();

    setRuns((prev) => {
      const kept = onlyKey
        ? prev.filter((r) => r.id !== onlyKey).map((r) => ({ ...r, winner: false }))
        : [];
      const fresh = targets.map((t) => ({
        id: t.key, name: t.label, country: t.sub,
        workflowId: t.wf.id, workflowName: t.wf.name, status: "running",
      }));
      return onlyKey ? [...fresh, ...kept] : fresh;
    });

    // A label belongs to the step that set it, so a step that names none clears
    // the last one rather than leaving it stuck on screen.
    const settle = (id, patch) =>
      setRuns((prev) => prev.map((r) => (r.id === id
        ? { ...r, ...(patch.phase && !patch.label ? { label: null } : null), ...patch }
        : r)));

    // The couple's photo always goes at full size. Shrinking it to speed the
    // send is what starves the model of a face to copy.
    const couple = photo.inline;

    // One subject read for the whole batch, reused by every target.
    let read = subjects?.status === "done" ? subjects : null;
    if (!read) read = await runSubjectRead(couple);
    const people = read?.people || [];

    // And the longer written read, only when a workflow asks for it.
    let desc = descriptor?.status === "done" ? descriptor : null;
    if (!desc && targets.some((t) => t.wf.needs.descriptor)) desc = await runDescriptorRead(couple);

    const subject = {
      couple,
      coupleRatio: photo.width && photo.height ? nearestRatio(photo.width, photo.height) : "3:4",
      extras: extras.map((e) => e.inline),
      people,
      faces: read?.faces || [],
      peopleText: describePeople(people),
      descriptorPeople: desc?.people || [],
      descriptorText: describeDescriptor(desc?.people || []),
      binding: people.length === 2 && people[0]?.label && people[1]?.label
        ? `WHICH PERSON IS WHICH: the person described as "${people[0].label}" in IMAGE 2 `
          + `must become the person standing on the ${people[0].label} of the output, and the person `
          + `described as "${people[1].label}" must become the person on the ${people[1].label}. `
          + `Do not blend the two of them together, and do not borrow any feature from either `
          + `person already standing in IMAGE 1.`
        : "",
    };

    const runTarget = async (t) => {
      const progress = (patch) => settle(t.key, patch);
      try {
        let plate = null;
        let locConfig = null;
        if (t.wf.needs.plate) {
          plate = platesRef.current[t.loc.id] || null;
          if (!plate) {
            progress({ status: "running", phase: "plate", label: "Emptying the scene" });
            plate = await ensurePlate(t.loc, cfg, controller.signal);
          }
        }
        // The notes are read when a workflow needs them for the outfit, and also
        // whenever the standing spot is meant to come from them, which is any
        // workflow once the pose is not free.
        if (t.wf.needs.locConfig || (framing !== "free" && (t.wf.needs.plate || scenesAreEmpty))) {
          locConfig = configsRef.current[t.loc.id] || null;
          if (!locConfig) {
            progress({ status: "running", phase: "config", label: "Reading the scene" });
            locConfig = await ensureConfig(t.loc, cfg, controller.signal);
          }
        }
        const res = await t.wf.run({
          loc: t.loc, plate, locConfig, subject, cfg,
          signal: controller.signal, progress,
        });
        settle(t.key, { status: "done", ...res });
        await keepRunImages(t.key, res);
        return res;
      } catch (e) {
        settle(t.key, {
          status: e.name === "AbortError" ? "stopped" : "error",
          error: e.message, raw: e.body,
        });
        return null;
      }
    };

    // A race can be five workflows deep, and firing every call at once is how a
    // key starts collecting rate limits. Three at a time is plenty.
    const results = compareOn
      ? await pool(targets.map((t) => () => runTarget(t)), 3)
      : (await Promise.allSettled(targets.map(runTarget))).map((r) => r.value ?? null);

    // One judge, one prompt, every result. A workflow's own score cannot crown a
    // winner, because the strict gate and the likeness agent do not score alike.
    if (compareOn && results.some(Boolean)) {
      setRaceScoring(true);
      const scored = await Promise.all(results.map(async (res, i) => {
        if (!res?.inline) return null;
        try {
          const judged = await scoreLikeness({
            key: cfg.apiKey, model: cfg.checkModel, prompt: cfg.prompts.likeness,
            reference: couple, candidate: res.inline, signal: controller.signal,
          });
          settle(targets[i].key, { raceScore: judged.score, raceFixes: judged.fixes });
          return { key: targets[i].key, score: judged.score ?? -1 };
        } catch { return null; }
      }));
      const winner = scored.filter(Boolean).sort((a, b) => b.score - a.score)[0];
      if (winner && winner.score >= 0) settle(winner.key, { winner: true });
      setRaceScoring(false);
    }

    setBatchMs(Math.round(performance.now() - started));
    setRunning(false);
    abortRef.current = null;
  };

  const stop = () => abortRef.current?.abort();

  /* ── keeping the session ── */

  // Written the moment a run lands rather than at the end of the batch, so a
  // preview that stops halfway still keeps whatever came back before it did.
  const keepRunImages = async (key, res) => {
    try {
      if (res?.dataUrl) await putImage(`run:${key}`, await urlToBlob(res.dataUrl));
      if (res?.passOne) await putImage(`run:${key}:pass`, await urlToBlob(res.passOne));
      else await deleteImage(`run:${key}:pass`);
    } catch { /* the picture is still on screen either way */ }
  };

  const refreshStorage = useCallback(async () => setStorage(await storageUsed()), []);

  // Read back once, before anything else is allowed to write.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const saved = await getSession();
        if (!saved || !alive) return;

        if (saved.photo) {
          const blob = await getImage("photo");
          if (blob) {
            setPhoto({
              inline: await blobToInline(blob),
              dataUrl: URL.createObjectURL(blob),
              name: saved.photo.name, width: saved.photo.width, height: saved.photo.height,
            });
          }
        }

        const backExtras = [];
        for (let i = 0; i < (saved.extras?.length || 0); i++) {
          const blob = await getImage(`extra:${i}`);
          if (!blob) continue;
          backExtras.push({
            inline: await blobToInline(blob),
            dataUrl: URL.createObjectURL(blob),
            name: saved.extras[i]?.name || `photo ${i + 2}`,
          });
        }
        if (backExtras.length) setExtras(backExtras);

        const backPlates = {};
        for (const id of saved.plateIds || []) {
          const blob = await getImage(`plate:${id}`);
          // An emptied scene is only ever read back as a url, so an object url
          // does the job and costs nothing to make.
          if (blob) backPlates[id] = URL.createObjectURL(blob);
        }
        if (Object.keys(backPlates).length) setPlates(backPlates);

        const backRuns = [];
        for (const r of saved.runs || []) {
          const next = { ...r };
          delete next.hasImage;
          delete next.hasPass;
          if (r.hasImage) {
            const blob = await getImage(`run:${r.id}`);
            if (blob) next.dataUrl = URL.createObjectURL(blob);
          }
          if (r.hasPass) {
            const blob = await getImage(`run:${r.id}:pass`);
            if (blob) next.passOne = URL.createObjectURL(blob);
          }
          // Anything the preview was still working on when it stopped did not
          // finish, and a tile spinning for ever would be a lie.
          if (next.status === "running") {
            next.status = next.dataUrl ? "done" : "stopped";
            next.label = null;
          }
          backRuns.push(next);
        }
        if (backRuns.length) setRuns(backRuns);

        if (saved.subjects) setSubjects(saved.subjects);
        if (saved.descriptor) setDescriptor(saved.descriptor);
        if (saved.check) setCheck(saved.check);
        if (saved.overrideCheck) setOverrideCheck(true);
        if (Number.isFinite(saved.batchMs)) setBatchMs(saved.batchMs);

        if (alive) {
          setRestored({
            at: saved.savedAt || null,
            runs: backRuns.filter((r) => r.dataUrl).length,
            photo: Boolean(saved.photo),
          });
        }
      } catch { /* no session to read back, or no store to read it from */ }
      finally { if (alive) { setBooted(true); refreshStorage(); } }
    })();
    return () => { alive = false; };
  }, [refreshStorage]);

  // And written back whenever any of it changes, once the read is done.
  useEffect(() => {
    if (!booted) return undefined;
    const strip = (r) => {
      const out = { ...r, hasImage: Boolean(r.dataUrl), hasPass: Boolean(r.passOne) };
      // The bytes are in the picture store. Keeping them here as well would
      // double the size of the snapshot for nothing.
      delete out.inline;
      delete out.dataUrl;
      delete out.passOne;
      return out;
    };
    const id = setTimeout(async () => {
      const kept = runs.map(strip);
      try {
        await putSession({
          savedAt: Date.now(),
          photo: photo ? { name: photo.name, width: photo.width, height: photo.height } : null,
          extras: extras.map((e) => ({ name: e.name })),
          plateIds: Object.keys(plates),
          runs: kept,
          subjects, descriptor, check, overrideCheck,
          batchMs, workflowId, compareOn,
        });
        // Anything the snapshot no longer points at is dead weight: a photo that
        // was replaced, or the results of a batch that has been rerun.
        const live = new Set([
          ...(photo ? ["photo"] : []),
          ...extras.map((_, i) => `extra:${i}`),
          ...Object.keys(plates).map((locId) => `plate:${locId}`),
          ...kept.filter((r) => r.hasImage).map((r) => `run:${r.id}`),
          ...kept.filter((r) => r.hasPass).map((r) => `run:${r.id}:pass`),
        ]);
        for (const key of await imageKeys()) {
          if (!live.has(key)) await deleteImage(key);
        }
        refreshStorage();
      } catch { /* out of room, or no store */ }
    }, 500);
    return () => clearTimeout(id);
  }, [booted, runs, photo, extras, plates, subjects, descriptor, check,
    overrideCheck, batchMs, workflowId, compareOn, refreshStorage]);

  const startFresh = async () => {
    if (running) stop();
    try { await clearAll(); } catch { /* nothing to clear */ }
    setPhoto(null); setExtras([]); setPlates({});
    setRuns([]); setBatchMs(null); setCheck(null);
    setSubjects(null); setDescriptor(null); setOverrideCheck(false);
    setRestored(null); refreshStorage();
  };

  const allSettled = runs.length > 0 && runs.every((r) => r.status !== "running");
  const showImages = !revealTogether || allSettled;
  const doneRuns = runs.filter((r) => r.status === "done");

  /* ── viewer keys ── */
  useEffect(() => {
    if (viewer === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setViewer(null);
      if (e.key === "ArrowRight") setViewer((i) => (i + 1) % doneRuns.length);
      if (e.key === "ArrowLeft") setViewer((i) => (i - 1 + doneRuns.length) % doneRuns.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, doneRuns.length]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.head, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* header */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.div}`,
        padding: "14px 22px", display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 0, zIndex: 30,
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.p100, display: "grid", placeItems: "center" }}>
          <Sparkles size={16} color={C.p600} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-0.3px" }}>Couple photo lab</div>
          <div style={{ fontSize: 12, color: C.sub }}>One photo of the two of them, five places, five real Gemini calls in parallel.</div>
        </div>
        {batchMs !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.sub }}>
            <Clock size={13} /> batch {fmtMs(batchMs)}
          </div>
        )}
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "minmax(320px, 400px) minmax(0, 1fr)",
        gap: 18, padding: 18, alignItems: "start", maxWidth: 1560, margin: "0 auto",
      }} className="lab-grid">

        {/* ── settings rail ── */}
        <div className="lab-rail" style={{
          display: "grid", gap: 12, position: "sticky", top: 78,
          maxHeight: "calc(100vh - 96px)", overflowY: "auto", paddingRight: 4,
        }}>
          <Section title="Gemini key" icon={<Key size={15} color={C.p600} />}>
            <div style={{ display: "flex", gap: 6 }}>
              <TextInput
                type={showKey ? "text" : "password"}
                value={apiKey}
                placeholder="AIza..."
                autoComplete="off"
                onChange={(e) => setApiKey(e.target.value.trim())}
                style={{ fontFamily: MONO, fontSize: 12 }}
              />
              <Button kind="ghost" onClick={() => setShowKey((s) => !s)} style={{ padding: "0 10px" }}>
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button kind="ghost" disabled={!apiKey || modelsState.loading} onClick={loadModels}>
                <RefreshCw size={13} className={modelsState.loading ? "spin" : ""} />
                {modelsState.loading ? "Loading models" : "Load models from key"}
              </Button>
              {apiKey && (
                <Button kind="danger" onClick={() => { setApiKey(""); setLiveModels(null); }}>Forget key</Button>
              )}
            </div>
            {modelsState.error && <Note tone="bad">{modelsState.error}</Note>}
            {liveModels && <Note tone="good">{liveModels.length} models this key can use are now in the dropdowns.</Note>}
            <Note>Kept in this browser only, and sent to Google alone. Local testing tool, so treat the key as exposed.</Note>
          </Section>

          <Section title="Photo check (small model)" icon={<Check size={15} color={C.p600} />}>
            <div>
              <Label hint={liveModels ? "from your key" : "type any id"}>Model</Label>
              <Select value={checkOptions.some((m) => m.id === checkModel) ? checkModel : ""} onChange={(e) => e.target.value && setCheckModel(e.target.value)}>
                <option value="">Custom id below</option>
                {checkOptions.map((m) => <option key={m.id} value={m.id}>{m.label ? `${m.label} (${m.id})` : m.id}</option>)}
              </Select>
              <TextInput value={checkModel} onChange={(e) => setCheckModel(e.target.value.trim())} style={{ marginTop: 6, fontFamily: MONO, fontSize: 12 }} />
            </div>
            <Temp value={checkTemp} onChange={setCheckTemp} />
            <div>
              <Label>Check prompt</Label>
              <PromptBox value={checkPrompt} onChange={setCheckPrompt} onReset={() => setCheckPrompt(DEFAULT_VALIDATE_PROMPT)} rows={10} />
            </div>
          </Section>

          <Section title="Image generation" icon={<ImageIcon size={15} color={C.p600} />}>
            <div>
              <Label hint={liveModels ? "from your key" : "type any id"}>Model</Label>
              <Select value={imageOptions.some((m) => m.id === imageModel) ? imageModel : ""} onChange={(e) => e.target.value && setImageModel(e.target.value)}>
                <option value="">Custom id below</option>
                {imageOptions.map((m) => <option key={m.id} value={m.id}>{m.label ? `${m.label} (${m.id})` : m.id}</option>)}
              </Select>
              <TextInput value={imageModel} onChange={(e) => setImageModel(e.target.value.trim())} style={{ marginTop: 6, fontFamily: MONO, fontSize: 12 }} />
            </div>
            <Temp value={imageTemp} onChange={setImageTemp} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <Label>Image size</Label>
                <Select value={imageSize} onChange={(e) => setImageSize(e.target.value)}>
                  {IMAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div>
                <Label>Aspect ratio</Label>
                <Select value={aspect} onChange={(e) => setAspect(e.target.value)}>
                  <option value="Match">Match the location photo</option>
                  {ASPECT_RATIOS.map((s) => <option key={s} value={s}>{s === "Auto" ? "Auto, the model picks" : s}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label hint="long edge, in pixels">Send images at</Label>
              <Select value={sendEdge} onChange={(e) => setSendEdge(Number(e.target.value))}>
                <option value={2048}>2048, most detail and the slowest send</option>
                <option value={1568}>1568, a good balance</option>
                <option value={1024}>1024, quickest to test with</option>
              </Select>
            </div>
            <Toggle checked={labelImages} onChange={setLabelImages}>Send {'"IMAGE 1:"'} and {'"IMAGE 2:"'} labels with the pictures</Toggle>
            <Toggle checked={oneFrame} onChange={setOneFrame}>Add a line telling it to return one frame, not a before and after</Toggle>
            <Toggle checked={revealTogether} onChange={setRevealTogether}>Hold all five back until every one has landed</Toggle>
            <div>
              <Label hint="tap a token to insert it">Generation prompt, scenes with people in them</Label>
              <PromptBox
                value={imagePrompt} onChange={setImagePrompt}
                onReset={() => setImagePrompt(DEFAULT_IMAGE_PROMPT)}
                rows={16} tokens={[LOCATION_TOKEN, PEOPLE_TOKEN, "{Country}"]}
              />
              {!imagePrompt.includes(PEOPLE_TOKEN) && (
                <div style={{ marginTop: 6 }}>
                  <Note tone="warn">
                    No {PEOPLE_TOKEN} in this prompt, so the subject read is added at the end
                    instead. Put the token where you want it, or hit Reset to take the
                    corrected prompt.
                  </Note>
                </div>
              )}
            </div>
            <div>
              <Label hint="in scenes with nobody in them">Pose, size and spot</Label>
              <Select value={framing} onChange={(e) => setFraming(e.target.value)}>
                <option value="free">The model chooses, freely</option>
                <option value="suggested">The scene notes suggest, the model may differ</option>
                <option value="pinned">Pinned to the scene notes exactly</option>
              </Select>
            </div>
            <Note>
              This only applies where the scene has nobody standing in it. A photo that
              still has its own couple in it is its own template, and the pose, the size
              and the spot are copied from them.
            </Note>
            <Toggle checked={subjectFirst} onChange={setSubjectFirst}>Send the couple before the location, which holds faces better</Toggle>
            <div>
              <Label hint="used from workflow 3 up">Generation prompt, scenes with nobody in them</Label>
              <PromptBox
                value={emptyPrompt} onChange={setEmptyPrompt}
                onReset={() => setEmptyPrompt(DEFAULT_EMPTY_PROMPT)}
                rows={14} tokens={[LOCATION_TOKEN, PEOPLE_TOKEN, FRAMING_TOKEN, "{Country}"]}
              />
              {!emptyPrompt.includes(FRAMING_TOKEN) && (
                <div style={{ marginTop: 6 }}>
                  <Note tone="warn">
                    No {FRAMING_TOKEN} in this prompt, so the pose and spot instruction is
                    added at the end instead. Put the token where you want it, or hit Reset.
                  </Note>
                </div>
              )}
            </div>
            <Note>
              Two prompts, because the two jobs are not the same one. With a couple
              already standing in the photo the pose, the size and the spot are there to
              be copied. With an empty scene there is nothing to copy, and asking the
              model to replace people who are not there is how you get a mess.
            </Note>
            <Note>
              Leaving the ratio on Auto lets the model pick the canvas, and a portrait
              scene can come back wide, with the spare width filled by a second panel.
              Matching the location photo is the safe setting.
            </Note>
            <Note>Any option the chosen model rejects is dropped and the call retried, so a size or ratio it does not support will not fail the batch.</Note>
          </Section>

          <Section title="Likeness agent" icon={<ScanFace size={15} color={C.p600} />} defaultOpen={false}>
            <Toggle checked={agentOn} onChange={setAgentOn}>Judge every result and try again when it does not look like them</Toggle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <Label hint="per place">Attempts</Label>
                <Select value={agentRounds} onChange={(e) => setAgentRounds(Number(e.target.value))}>
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
              <div>
                <Label hint="out of 100">Good enough at</Label>
                <Select value={agentTarget} onChange={(e) => setAgentTarget(Number(e.target.value))}>
                  {[60, 70, 75, 80, 85, 90].map((n) => <option key={n} value={n}>{n}</option>)}
                </Select>
              </div>
            </div>
            <Note>
              Each attempt is judged against the uploaded photo, and anything that falls
              short goes again carrying the judge{'\u2019'}s corrections. The best scoring attempt
              is what you get, not the last one. Costs up to {agentRounds} generations and
              {" "}{agentRounds} checks per place.
            </Note>
            <div>
              <Label>Subject read prompt</Label>
              <PromptBox value={subjectPrompt} onChange={setSubjectPrompt} onReset={() => setSubjectPrompt(DEFAULT_SUBJECT_PROMPT)} rows={8} />
            </div>
            <div>
              <Label>Likeness prompt</Label>
              <PromptBox value={likenessPrompt} onChange={setLikenessPrompt} onReset={() => setLikenessPrompt(DEFAULT_LIKENESS_PROMPT)} rows={8} />
            </div>
          </Section>

          <Section title="Scene setup" icon={<Eraser size={15} color={C.p600} />} defaultOpen={false}>
            <SceneRebuild
              rebuild={rebuild} state={rebuildState}
              total={PRESET_LOCATIONS.length}
              canRun={Boolean(apiKey)} model={imageModel}
              onRun={() => rebuildScenes()}
              onRetryFailed={async () => {
                for (const f of rebuild.failed) {
                  const loc = PRESET_LOCATIONS.find((l) => l.id === f.id);
                  if (loc) await rebuildScenes(loc);
                }
              }}
              onStop={() => rebuildAbort.current?.abort()}
              scenesAreEmpty={scenesAreEmpty} setScenesAreEmpty={setScenesAreEmpty}
            />
            <Note>
              Two things can be prepared per place, and both are reused for every
              couple after that. Emptying takes the location{'\u2019'}s own couple out, so
              there is no jaw or beard for the model to borrow. Reading the scene writes
              down the outfit, the size, the spot and the light, which takes four
              decisions away from the model on every request.
            </Note>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button kind="ghost" disabled={!apiKey || !selected.length || sceneWork.running} onClick={() => prepareScenes("plate")}>
                <Eraser size={13} />
                {sceneWork.running ? `Working, ${sceneWork.done} of ${sceneWork.total}` : "Empty the picked scenes"}
              </Button>
              <Button kind="ghost" disabled={!apiKey || !selected.length || sceneWork.running} onClick={() => prepareScenes("config")}>
                <MapPin size={13} /> Read the picked scenes
              </Button>
            </div>
            {sceneWork.error && <Note tone="bad">{sceneWork.error}</Note>}
            {Object.keys(plates).length > 0 && (
              <Note tone="good">{Object.keys(plates).length} emptied, held in memory until you reload.</Note>
            )}
            {selected.length === 0 && <Note tone="warn">Pick some places first.</Note>}
            <div style={{ display: "grid", gap: 8 }}>
              {selected.map((loc) => (
                <SceneRow
                  key={loc.id} loc={loc} plate={plates[loc.id]} config={locConfigs[loc.id]}
                  onEdit={(patch) => setLocConfigs((prev) => ({
                    ...prev, [loc.id]: { ...(prev[loc.id] || {}), ...patch },
                  }))}
                />
              ))}
            </div>
          </Section>

          <Section title="Advanced prompts" icon={<SlidersHorizontal size={15} color={C.p600} />} defaultOpen={false}>
            <Note>
              One prompt per step of the newer workflows. Each is read fresh on every
              request, so an edit takes effect on the next run with no reload.
            </Note>
            <PromptDrawer title="Descriptor read, used by describe first" value={descriptorPrompt} onChange={setDescriptorPrompt} onReset={() => setDescriptorPrompt(DEFAULT_DESCRIPTOR_PROMPT)} />
            <PromptDrawer title="Scene read, writes the notes above" value={locConfigPrompt} onChange={setLocConfigPrompt} onReset={() => setLocConfigPrompt(DEFAULT_LOCCONFIG_PROMPT)} tokens={[LOCATION_TOKEN]} />
            <PromptDrawer title="Composite, describe first and everything on" value={compositePrompt} onChange={setCompositePrompt} onReset={() => setCompositePrompt(DEFAULT_COMPOSITE_PROMPT)} tokens={[LOCATION_TOKEN, PEOPLE_TOKEN, OUTFIT_TOKEN, HEIGHT_TOKEN, PLACEMENT_TOKEN, LIGHT_TOKEN]} />
            <PromptDrawer title="Strict pass or fail judge" value={gatePrompt} onChange={setGatePrompt} onReset={() => setGatePrompt(DEFAULT_GATE_PROMPT)} />
            <PromptDrawer title="Face swap, used by fix the faces after" value={faceSwapPrompt} onChange={setFaceSwapPrompt} onReset={() => setFaceSwapPrompt(DEFAULT_FACE_SWAP_PROMPT)} />
            <PromptDrawer title="Cut out onto white" value={cutoutPrompt} onChange={setCutoutPrompt} onReset={() => setCutoutPrompt(DEFAULT_CUTOUT_PROMPT)} />
            <PromptDrawer title="Blend, used after every paste" value={blendPrompt} onChange={setBlendPrompt} onReset={() => setBlendPrompt(DEFAULT_BLEND_PROMPT)} tokens={[LOCATION_TOKEN, OUTFIT_TOKEN, LIGHT_TOKEN]} />
            <PromptDrawer title="Close up of the couple" value={closeupPrompt} onChange={setCloseupPrompt} onReset={() => setCloseupPrompt(DEFAULT_CLOSEUP_PROMPT)} tokens={[LOCATION_TOKEN, PEOPLE_TOKEN, OUTFIT_TOKEN, PLACEMENT_TOKEN, LIGHT_TOKEN]} />
          </Section>
        </div>

        {/* ── the flow ── */}
        <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
          <SessionBar
            restored={restored} storage={storage} onFresh={startFresh}
            counts={{
              photo: photo ? 1 : 0,
              extras: extras.length,
              results: runs.filter((r) => r.dataUrl).length,
              plates: Object.keys(plates).length,
            }}
          />

          <PhotoStep
            photo={photo} check={check} verdict={verdict} rejected={rejected}
            overrideCheck={overrideCheck} setOverrideCheck={setOverrideCheck}
            onFile={takeFile} onRecheck={() => photo && runCheck(photo.inline)}
            onClear={startFresh}
            subjects={subjects}
            onRead={() => photo && runSubjectRead(photo.inline)}
            canRead={Boolean(apiKey && photo)}
            extras={extras} onAddExtra={addExtra}
            onRemoveExtra={async (i) => {
              const next = extras.filter((_, x) => x !== i);
              setExtras(next);
              // The keys are positional, so the tail is rewritten rather than left
              // pointing at a photo that has moved up a slot.
              for (let n = 0; n < 3; n++) {
                if (n < next.length) await putImage(`extra:${n}`, await urlToBlob(next[n].dataUrl)).catch(() => {});
                else await deleteImage(`extra:${n}`).catch(() => {});
              }
              refreshStorage();
            }}
            descriptor={descriptor}
            onDescribe={() => photo && runDescriptorRead(photo.inline)}
          />

          <LocationStep
            locations={locations} selectedIds={selectedIds} toggle={toggleLocation}
            countries={countries} country={country} setCountry={setCountry}
            onRandom={pickRandom} onClear={() => setSelectedIds([])}
            onAdd={addLocation}
            onRemove={(id) => {
              setCustomLocations((l) => l.filter((x) => x.id !== id));
              setSelectedIds((ids) => ids.filter((x) => x !== id));
            }}
            storageWarning={storageWarning}
          />

          <WorkflowStep
            workflowId={workflowId} setWorkflowId={setWorkflowId}
            compareOn={compareOn} setCompareOn={setCompareOn}
            compareIds={compareIds} setCompareIds={setCompareIds}
            extraCount={extras.length} raceLoc={raceLoc} cfg={cfg} framing={framing}
          />

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                  Step 4. {compareOn ? "Run the race" : "Run the batch"}
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                  {compareOn
                    ? `${raceWorkflows.length} workflows on ${raceLoc ? raceLoc.name : "one place"}, three at a time, then one judge scores them all.`
                    : `${selected.length} of ${BATCH} places picked. Each one is its own request, all sent at the same moment.`}
                  {callEstimate ? ` Roughly ${callEstimate} model calls.` : ""}
                </div>
              </div>
              {running
                ? <Button kind="danger" onClick={stop}><StopCircle size={15} /> Stop</Button>
                : <Button disabled={!canRun} onClick={() => runBatch()}>
                    <Sparkles size={15} />
                    {compareOn ? `Race ${raceWorkflows.length || ""} workflows` : `Generate ${selected.length || BATCH} photos`}
                  </Button>}
            </div>
            {raceScoring && <div style={{ marginTop: 10 }}><Note>Scoring the race with one judge.</Note></div>}
            {!apiKey && <div style={{ marginTop: 10 }}><Note tone="warn">Add your Gemini key to run anything.</Note></div>}
            {apiKey && !photo && <div style={{ marginTop: 10 }}><Note tone="warn">Upload a photo of the couple first.</Note></div>}
            {apiKey && photo && workflowBlock && <div style={{ marginTop: 10 }}><Note tone="warn">{workflowBlock}</Note></div>}
            {apiKey && photo && compareOn && !raceLoc && (
              <div style={{ marginTop: 10 }}><Note tone="warn">Pick one place above to race on.</Note></div>
            )}
            {apiKey && photo && rejected && !overrideCheck && (
              <div style={{ marginTop: 10 }}><Note tone="warn">The check rejected this photo. Tick {'"use it anyway"'} above to test with it regardless.</Note></div>
            )}
          </Card>

          {runs.length > 0 && (
            <Results
              runs={runs} showImages={showImages} doneRuns={doneRuns}
              onOpen={setViewer} onRetry={(id) => runBatch(id)}
              onShowPass={(id) => setPassPeek(runs.find((r) => r.id === id)?.passOne || null)}
              batchMs={batchMs} model={imageModel}
              compareOn={compareOn} raceScoring={raceScoring}
            />
          )}
        </div>
      </div>

      {passPeek && (
        <div onClick={() => setPassPeek(null)} style={{
          position: "fixed", inset: 0, background: "rgba(10,10,12,0.94)", zIndex: 95,
          display: "grid", placeItems: "center", padding: 24, cursor: "zoom-out",
        }}>
          <img src={passPeek} alt="" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 10 }} />
          <div style={{ position: "fixed", bottom: 22, color: C.white, fontSize: 13 }}>
            The step before the one on the tile. Click anywhere to close.
          </div>
        </div>
      )}

      {viewer !== null && doneRuns[viewer] && (
        <Viewer
          run={doneRuns[viewer]} index={viewer} total={doneRuns.length}
          onClose={() => setViewer(null)}
          onStep={(d) => setViewer((i) => (i + d + doneRuns.length) % doneRuns.length)}
        />
      )}

      <style>{`
        .spin { animation: labspin 0.9s linear infinite; }
        @keyframes labspin { to { transform: rotate(360deg); } }
        .lab-rail::-webkit-scrollbar { width: 8px; }
        .lab-rail::-webkit-scrollbar-thumb { background: ${C.icon}; border-radius: 8px; }
        @media (max-width: 1020px) {
          .lab-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .lab-rail { position: static !important; max-height: none !important; overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}

// Everything on screen survives a reload, which is worth saying plainly, because
// the natural assumption with a page like this is that it does not.
function SessionBar({ restored, storage, onFresh, counts }) {
  const mb = (n) => `${(n / 1048576).toFixed(n > 10485760 ? 0 : 1)}MB`;
  const when = restored?.at
    ? new Date(restored.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;
  const held = [
    counts.photo ? "your photo" : "",
    counts.extras ? `${counts.extras} extra photo${counts.extras === 1 ? "" : "s"}` : "",
    counts.results ? `${counts.results} result${counts.results === 1 ? "" : "s"}` : "",
    counts.plates ? `${counts.plates} emptied scene${counts.plates === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  if (!held.length) return null;
  const list = held.length > 1
    ? `${held.slice(0, -1).join(", ")} and ${held[held.length - 1]}`
    : held[0];

  return (
    <Card style={{ padding: "10px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Save size={15} color={C.p600} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>
            {restored ? "Picked up where you left off" : "This session is being kept"}
          </div>
          <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>
            Holding {list} in this browser{when ? `, last saved ${when}` : ""}.
            {" "}Reloading, or restarting the preview, will not lose them.
            {storage?.usage ? ` Using ${mb(storage.usage)}.` : ""}
          </div>
        </div>
        <Button kind="danger" onClick={onFresh} style={{ fontSize: 12, padding: "6px 10px" }}>
          <Trash2 size={12} /> Start fresh
        </Button>
      </div>
    </Card>
  );
}

/* ── step 3: which way to make the picture ── */

function WorkflowStep({
  workflowId, setWorkflowId, compareOn, setCompareOn,
  compareIds, setCompareIds, extraCount, raceLoc, cfg, framing,
}) {
  const toggleRace = (id) => setCompareIds((ids) => (
    ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 5 ? ids : [...ids, id]
  ));

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>Step 3. Pick how it gets made</div>
        <div style={{ fontSize: 12, color: C.sub, flex: 1 }}>
          {compareOn ? "Tick the ones to race against each other." : "Nine different ways. They cost different amounts."}
        </div>
        <Toggle checked={compareOn} onChange={setCompareOn}>Race several on one place</Toggle>
      </div>

      {compareOn && (
        <div style={{ marginBottom: 10 }}>
          <Note>
            {raceLoc
              ? `Every ticked workflow runs on ${raceLoc.name}, then one judge scores all of them with the same prompt and the best is crowned.`
              : "Pick one place above. The first place you pick is the one they race on."}
          </Note>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
        {WORKFLOWS.map((w, i) => {
          const picked = compareOn ? compareIds.includes(w.id) : workflowId === w.id;
          const blocked = blockedBecause(w, { extraCount });
          const calls = estimateCalls(w.id, cfg);
          return (
            <button
              key={w.id}
              onClick={() => (compareOn ? toggleRace(w.id) : setWorkflowId(w.id))}
              disabled={Boolean(blocked) && !picked}
              title={blocked || w.detail}
              style={{
                textAlign: "left", padding: "10px 11px", borderRadius: 10,
                border: `1.5px solid ${picked ? C.p600 : C.div}`,
                background: picked ? C.p100 : C.white,
                cursor: blocked && !picked ? "not-allowed" : "pointer",
                opacity: blocked && !picked ? 0.55 : 1,
                display: "grid", gap: 3,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: compareOn ? 5 : 9, flexShrink: 0,
                  border: `1.5px solid ${picked ? C.p600 : C.icon}`,
                  background: picked ? C.p600 : C.white,
                  display: "grid", placeItems: "center",
                }}>
                  {picked && <Check size={11} color={C.white} strokeWidth={3} />}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: C.head, flex: 1 }}>
                  {i + 1}. {w.name}
                </span>
                {calls ? (
                  <span style={{ fontSize: 10.5, color: C.sub, fontFamily: MONO, flexShrink: 0 }}>{calls} calls</span>
                ) : null}
              </div>
              <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.45 }}>{w.blurb}</div>
              {blocked
                ? <div style={{ fontSize: 11, color: C.wText }}>{blocked}</div>
                : <div style={{ fontSize: 11, color: C.inact, lineHeight: 1.4 }}>{w.detail}</div>}
              {(w.needs.plate || w.needs.locConfig || (framing !== "free" && w.needs.plate)) && (
                <div style={{ fontSize: 10.5, color: C.inact, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {w.needs.plate && <span>needs the scene emptied</span>}
                  {(w.needs.locConfig || (framing !== "free" && w.needs.plate)) && <span>needs the scene read</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 10 }}>
        <Note>
          Anything a workflow needs is built on the first run that wants it, and kept
          for the runs after. Emptied scenes are lost on reload, scene notes are not.
        </Note>
      </div>
    </Card>
  );
}

/* ── step 1 ── */

function PhotoStep({
  photo, check, verdict, rejected, overrideCheck, setOverrideCheck, onFile, onRecheck,
  onClear, subjects, onRead, canRead, extras, onAddExtra, onRemoveExtra,
  descriptor, onDescribe,
}) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>Step 1. The couple photo</div>
        <div style={{ fontSize: 12, color: C.sub }}>Checked by the small model as soon as it lands.</div>
        {photo && <button onClick={onClear} style={{ marginLeft: "auto", background: "none", border: "none", color: C.sub, fontSize: 12, cursor: "pointer" }}>Remove</button>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: photo ? "180px minmax(0,1fr)" : "1fr", gap: 14 }}>
        {photo ? (
          <div>
            <img src={photo.dataUrl} alt="" style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.div}`, display: "block" }} />
            <div style={{ fontSize: 11, color: C.inact, marginTop: 5, wordBreak: "break-all" }}>
              {photo.name}<br />{photo.width} x {photo.height}
            </div>
            <Button kind="ghost" onClick={() => inputRef.current?.click()} style={{ marginTop: 8, width: "100%", fontSize: 12.5 }}>
              <Upload size={13} /> Change
            </Button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files?.[0]); }}
            style={{
              padding: "34px 20px", borderRadius: 12, cursor: "pointer",
              border: `2px dashed ${over ? C.p600 : C.icon}`,
              background: over ? C.p100 : C.bg, display: "grid", gap: 6, placeItems: "center",
            }}
          >
            <Upload size={22} color={C.p600} />
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Drop a photo of the two of them</div>
            <div style={{ fontSize: 12, color: C.sub }}>Or click to pick one. Portrait works best.</div>
          </button>
        )}

        {photo && (
          <div>
            {check?.status === "running" && <Note><RefreshCw size={12} className="spin" style={{ verticalAlign: "-2px", marginRight: 6 }} />Checking the photo</Note>}
            {check?.status === "error" && (
              <>
                <Note tone="bad">Check failed: {check.error}</Note>
                {check.raw && <Raw label="Raw error" data={check.raw} />}
              </>
            )}
            {check?.status === "done" && (
              <>
                {verdict?.accept === true && <Note tone="good"><b>Accepted.</b> Nothing to fix.</Note>}
                {rejected && (
                  <Note tone="bad">
                    <b>Rejected: {verdict.code || "no code"}</b>
                    <div style={{ marginTop: 4 }}>{REJECTION_COPY[verdict.code] || FALLBACK_REJECTION}</div>
                    <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>That second line is what the couple would see.</div>
                  </Note>
                )}
                {!verdict && <Note tone="warn">The model did not return usable JSON. Its reply: {check.text?.slice(0, 240) || "empty"}</Note>}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11.5, color: C.inact }}>{fmtMs(check.ms)}</span>
                  <Button kind="ghost" onClick={onRecheck} style={{ fontSize: 12, padding: "6px 10px" }}><RefreshCw size={12} /> Check again</Button>
                  {rejected && <Toggle checked={overrideCheck} onChange={setOverrideCheck}>Use it anyway</Toggle>}
                </div>
                <Raw data={check.raw} />
              </>
            )}
          </div>
        )}
      </div>

      {photo && (
        <ExtraPhotos extras={extras} onAdd={onAddExtra} onRemove={onRemoveExtra} />
      )}

      {photo && <SubjectRead subjects={subjects} onRead={onRead} canRead={canRead} descriptor={descriptor} onDescribe={onDescribe} />}

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </Card>
  );
}

// More angles of the same two people. One photograph is thin evidence for a
// face, and the workflows that take these have far less room to invent.
function ExtraPhotos({ extras, onAdd, onRemove }) {
  const inputRef = useRef(null);
  const full = extras.length >= 3;
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.div}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <Layers size={14} color={C.p600} />
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>More photos of the two of you</div>
        <div style={{ fontSize: 11.5, color: C.sub }}>Optional. Up to three more, and different angles help most.</div>
        <Button kind="ghost" disabled={full} onClick={() => inputRef.current?.click()}
          style={{ marginLeft: "auto", fontSize: 12, padding: "6px 10px" }}>
          <Plus size={12} /> {full ? "That is the lot" : "Add a photo"}
        </Button>
      </div>
      {extras.length === 0
        ? <Note>Two of the nine workflows use these. Without them, those two run as if you had only the one photo.</Note>
        : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {extras.map((e, i) => (
              <div key={e.name + i} style={{ position: "relative" }}>
                <img src={e.dataUrl} alt="" style={{ width: 74, height: 74, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.div}`, display: "block" }} />
                <button onClick={() => onRemove(i)} title="Remove" style={{
                  position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10,
                  border: `1px solid ${C.div}`, background: C.white, color: C.dText,
                  cursor: "pointer", display: "grid", placeItems: "center", padding: 0,
                }}><X size={11} /></button>
              </div>
            ))}
          </div>
        )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { onAdd(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

// What the small model read off the photo: a written description of each person
// and a tight crop of each face, both of which ride along with every request.
function SubjectRead({ subjects, onRead, canRead, descriptor, onDescribe }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.div}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <ScanFace size={14} color={C.p600} />
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>The subject read</div>
        <div style={{ fontSize: 11.5, color: C.sub }}>Sent with every request, in words and as face crops.</div>
        <Button kind="ghost" disabled={!canRead || subjects?.status === "running"} onClick={onRead}
          style={{ marginLeft: "auto", fontSize: 12, padding: "6px 10px" }}>
          <RefreshCw size={12} className={subjects?.status === "running" ? "spin" : ""} />
          {subjects?.status === "running" ? "Reading" : subjects ? "Read again" : "Read the photo"}
        </Button>
      </div>

      {!subjects && <Note>Not read yet. It runs on its own when you start a batch.</Note>}
      {subjects?.status === "error" && <Note tone="bad">{subjects.error}</Note>}
      {subjects?.status === "done" && subjects.people.length === 0 && (
        <Note tone="warn">Nothing usable came back, so the batch will run without a description. Its reply: {subjects.text?.slice(0, 200) || "empty"}</Note>
      )}
      {subjects?.status === "done" && subjects.people.length > 0 && (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {subjects.people.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "76px minmax(0,1fr)", gap: 10, alignItems: "start" }}>
                {subjects.faces[i]
                  ? <img src={inlineToDataUrl(subjects.faces[i])} alt="" style={{ width: "100%", borderRadius: 8, border: `2px solid ${C.p300}`, display: "block" }} />
                  : <div style={{ aspectRatio: "1", borderRadius: 8, background: C.bg, border: `1px dashed ${C.icon}`, display: "grid", placeItems: "center", fontSize: 10, color: C.inact, textAlign: "center", padding: 4 }}>no crop</div>}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: C.p900, textTransform: "uppercase", letterSpacing: "0.03em" }}>{p.label || `Person ${i + 1}`}</div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.45, marginTop: 3 }}>{p.description}</div>
                  {p.body_art && p.body_art.toLowerCase() !== "none" && (
                    <div style={{ fontSize: 11.5, color: C.p600, marginTop: 4 }}>Body art: {p.body_art}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.inact, marginTop: 8 }}>
            {subjects.faces.length} face crop{subjects.faces.length === 1 ? "" : "s"} found, read in {fmtMs(subjects.ms)}.
            Check the crops are tight on the right faces before running a batch.
          </div>
        </>
      )}

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.div}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>The longer read</div>
          <div style={{ fontSize: 11.5, color: C.sub }}>Only the describe first workflows use this one.</div>
          <Button kind="ghost" disabled={!canRead || descriptor?.status === "running"} onClick={onDescribe}
            style={{ marginLeft: "auto", fontSize: 12, padding: "6px 10px" }}>
            <RefreshCw size={12} className={descriptor?.status === "running" ? "spin" : ""} />
            {descriptor?.status === "running" ? "Reading" : descriptor ? "Read again" : "Read it now"}
          </Button>
        </div>
        {!descriptor && <Note>Not read yet. It runs on its own when a workflow needs it.</Note>}
        {descriptor?.status === "error" && <Note tone="bad">{descriptor.error}</Note>}
        {descriptor?.status === "done" && (
          <>
            {descriptor.blocking?.length > 0 && (
              <Note tone="warn">This read would reject the photo: {descriptor.blocking.join("; ")}</Note>
            )}
            {descriptor.unusable > 0 && (
              <Note tone="warn">
                {descriptor.unusable} of {descriptor.people.length} faces was called unusable for
                transfer, which means a poor likeness is expected from any workflow.
              </Note>
            )}
            <div style={{ display: "grid", gap: 8 }}>
              {descriptor.people.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: C.sub, lineHeight: 1.45 }}>
                  <b style={{ color: C.p900 }}>{p.position || `Person ${i + 1}`}:</b> {p.descriptor}
                  {p.attributes?.build_visible === false && (
                    <span style={{ color: C.inact }}> Build not visible, so none is claimed.</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.inact, marginTop: 6 }}>
              Photo quality called {descriptor.quality || "unknown"}, read in {fmtMs(descriptor.ms)}.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── step 2 ── */

function LocationStep({ locations, selectedIds, toggle, countries, country, setCountry, onRandom, onClear, onAdd, onRemove, storageWarning }) {
  const [adding, setAdding] = useState(false);
  const shown = country === "All" ? locations : locations.filter((l) => l.country === country);
  const full = selectedIds.length >= BATCH;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>Step 2. The places</div>
        <div style={{ fontSize: 12, color: C.sub }}>
          {selectedIds.length} of {BATCH} picked. The name goes into the prompt, the photo goes in as IMAGE 1.
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <Button kind="ghost" onClick={onRandom} style={{ fontSize: 12, padding: "6px 10px" }}><Shuffle size={12} /> Pick 5</Button>
          {selectedIds.length > 0 && <Button kind="ghost" onClick={onClear} style={{ fontSize: 12, padding: "6px 10px" }}>Clear</Button>}
          <Button kind="ghost" onClick={() => setAdding((a) => !a)} style={{ fontSize: 12, padding: "6px 10px" }}><Plus size={12} /> Add place</Button>
        </div>
      </div>

      {adding && <AddLocation onAdd={async (v) => { await onAdd(v); setAdding(false); }} onCancel={() => setAdding(false)} />}
      {storageWarning && <div style={{ marginBottom: 10 }}><Note tone="warn">This browser is out of room for added places, so a new one will not survive a reload.</Note></div>}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {["All", ...countries].map((c) => (
          <button key={c} onClick={() => setCountry(c)} style={{
            padding: "5px 11px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${country === c ? C.p600 : C.div}`,
            background: country === c ? C.p600 : C.white,
            color: country === c ? C.white : C.sub,
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))", gap: 10 }}>
        {shown.map((loc) => {
          const on = selectedIds.includes(loc.id);
          const order = selectedIds.indexOf(loc.id) + 1;
          return (
            <div key={loc.id} style={{ position: "relative" }}>
              <button
                onClick={() => toggle(loc.id)}
                disabled={!on && full}
                title={!on && full ? `Pick at most ${BATCH}` : loc.name}
                style={{
                  width: "100%", padding: 0, borderRadius: 10, overflow: "hidden", display: "block",
                  border: `2px solid ${on ? C.p600 : C.div}`, background: C.white, textAlign: "left",
                  cursor: !on && full ? "not-allowed" : "pointer", opacity: !on && full ? 0.45 : 1,
                }}
              >
                <div style={{ position: "relative", aspectRatio: "4/3", background: C.bg }}>
                  <img src={loc.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {on && (
                    <div style={{
                      position: "absolute", top: 6, left: 6, width: 21, height: 21, borderRadius: 99,
                      background: C.p600, color: C.white, fontSize: 11.5, fontWeight: 800,
                      display: "grid", placeItems: "center",
                    }}>{order}</div>
                  )}
                </div>
                <div style={{ padding: "7px 8px 8px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>{loc.name}</div>
                  <div style={{ fontSize: 10.5, color: C.inact, marginTop: 2 }}>{loc.country}</div>
                </div>
              </button>
              {loc.custom && (
                <button onClick={() => onRemove(loc.id)} title="Remove this place" style={{
                  position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 99,
                  border: "none", background: "rgba(0,0,0,0.55)", color: C.white, cursor: "pointer",
                  display: "grid", placeItems: "center",
                }}><Trash2 size={11} /></button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AddLocation({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!name.trim() || !file) { setError("A name and a photo are both needed."); return; }
    setBusy(true); setError(null);
    try { await onAdd({ name: name.trim(), countryName: countryName.trim(), file }); }
    catch (e) { setError(e.message); setBusy(false); }
  };

  return (
    <div style={{ border: `1px solid ${C.div}`, borderRadius: 10, padding: 12, marginBottom: 12, background: C.bg }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <Label>Location name</Label>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ubud" />
        </div>
        <div>
          <Label hint="optional">Country</Label>
          <TextInput value={countryName} onChange={(e) => setCountryName(e.target.value)} placeholder="Bali" />
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <Label>Scene photo, sent as IMAGE 1</Label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ fontSize: 12.5 }} />
      </div>
      {error && <div style={{ marginTop: 8 }}><Note tone="bad">{error}</Note></div>}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Button onClick={submit} disabled={busy}>{busy ? "Saving" : "Add place"}</Button>
        <Button kind="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

/* ── results ── */

function Results({ runs, showImages, doneRuns, onOpen, onRetry, onShowPass, batchMs, model, compareOn, raceScoring }) {
  const pending = runs.filter((r) => r.status === "running").length;
  const failed = runs.filter((r) => r.status === "error").length;
  const scored = runs.filter((r) => Number.isFinite(r.score));
  const avgScore = scored.length
    ? Math.round(scored.reduce((n, r) => n + r.score, 0) / scored.length)
    : null;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{compareOn ? "The race" : "Results"}</div>
        <div style={{ fontSize: 12, color: C.sub }}>
          {pending > 0
            ? `${runs.length - pending} of ${runs.length} back, ${pending} still running`
            : `${doneRuns.length} of ${runs.length} came back${failed ? `, ${failed} failed` : ""}`}
          {batchMs !== null && pending === 0 && ` in ${fmtMs(batchMs)}`}
        </div>
        <div style={{ fontSize: 11.5, color: C.inact, fontFamily: MONO }}>{model}</div>
        {avgScore !== null && (
          <div style={{ fontSize: 12, color: C.sub }}>likeness averaging <b style={{ color: C.head }}>{avgScore}</b></div>
        )}
        {raceScoring && (
          <div style={{ fontSize: 12, color: C.sub, display: "flex", alignItems: "center", gap: 5 }}>
            <RefreshCw size={12} className="spin" /> scoring them all with one judge
          </div>
        )}
        {doneRuns.length > 1 && showImages && (
          <Button kind="ghost" style={{ marginLeft: "auto", fontSize: 12, padding: "6px 10px" }}
            onClick={() => doneRuns.forEach((r, i) => download(r.dataUrl, `${r.id}-${i + 1}.png`))}>
            <Download size={12} /> Download all
          </Button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
        {runs.map((r) => (
          <div key={r.id} style={{ border: `1px solid ${C.div}`, borderRadius: 10, overflow: "hidden", background: C.white }}>
            <div style={{ position: "relative", aspectRatio: "9/16", background: C.bg, display: "grid", placeItems: "center" }}>
              {r.status === "done" && showImages && (
                <>
                  <img
                    src={r.dataUrl} alt={r.name}
                    onClick={() => onOpen(doneRuns.findIndex((d) => d.id === r.id))}
                    style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in", display: "block" }}
                  />
                  {Number.isFinite(r.raceScore ?? r.score) && (
                    <ScoreBadge score={r.raceScore ?? r.score} round={r.round} rounds={r.rounds} />
                  )}
                  {r.winner && (
                    <div style={{
                      position: "absolute", top: 7, right: 7, display: "flex", alignItems: "center", gap: 4,
                      padding: "3px 8px", borderRadius: 99, background: C.p600, color: C.white,
                      fontSize: 10.5, fontWeight: 800, letterSpacing: "0.02em",
                    }}><Trophy size={11} /> Winner</div>
                  )}
                </>
              )}
              {r.status === "done" && !showImages && (
                <div style={{ textAlign: "center", color: C.sText }}><Check size={20} /><div style={{ fontSize: 11.5, marginTop: 4 }}>Ready</div></div>
              )}
              {r.status === "running" && (
                <div style={{ textAlign: "center", color: C.sub, padding: 10 }}>
                  <RefreshCw size={18} className="spin" />
                  <div style={{ fontSize: 11.5, marginTop: 6 }}>
                    {r.phase === "judged" ? `Scored ${r.score}, going again`
                      : r.label ? r.label
                      : r.phase === "judging" ? "Judging the likeness"
                      : r.pass ? `Placing person ${r.pass} of 2`
                      : "Generating"}
                  </div>
                  {r.rounds > 1 && (
                    <div style={{ fontSize: 10.5, color: C.inact, marginTop: 3 }}>attempt {r.round} of {r.rounds}</div>
                  )}
                </div>
              )}
              {r.status === "error" && (
                <div style={{ textAlign: "center", color: C.dText, padding: 12 }}>
                  <AlertTriangle size={18} /><div style={{ fontSize: 11.5, marginTop: 6 }}>Failed</div>
                </div>
              )}
              {r.status === "stopped" && (
                <div style={{ textAlign: "center", color: C.sub }}><X size={18} /><div style={{ fontSize: 11.5, marginTop: 6 }}>Stopped</div></div>
              )}
            </div>
            <div style={{ padding: "8px 9px 10px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.25 }}>{r.name}</div>
              <div style={{ fontSize: 10.5, color: C.inact, marginTop: 2 }}>
                {r.country}{r.ms ? ` · ${fmtMs(r.ms)}` : ""}
                {r.sentBytes ? ` · sent ${Math.round(r.sentBytes / 1024)}KB` : ""}
                {r.ratio ? ` · asked for ${r.ratio}` : ""}
              </div>
              {!compareOn && r.workflowName && (
                <div style={{ fontSize: 10.5, color: C.p600, marginTop: 3 }}>{r.workflowName}</div>
              )}
              {r.status === "done" && r.gateFailed && (
                <div style={{ fontSize: 10.5, color: C.wText, marginTop: 4, lineHeight: 1.4 }}>
                  The strict judge failed all {r.rounds} attempts. This is the best of them.
                </div>
              )}
              {r.status === "done" && r.gatePassed && (
                <div style={{ fontSize: 10.5, color: C.sText, marginTop: 4 }}>Passed the strict judge on attempt {r.round}.</div>
              )}
              {r.looser && (
                <div style={{ fontSize: 10.5, color: C.inact, marginTop: 3 }}>A looser retry, temperature nudged up.</div>
              )}
              {r.swapped && <div style={{ fontSize: 10.5, color: C.p600, marginTop: 3 }}>Faces swapped in afterwards.</div>}
              {r.droppedFields?.length > 0 && (
                <div style={{ fontSize: 10.5, color: C.wText, marginTop: 4 }}>Retried without: {r.droppedFields.join(", ")}</div>
              )}
              {r.error && <div style={{ fontSize: 11, color: C.dText, marginTop: 5, lineHeight: 1.4 }}>{r.error}</div>}
              {r.status === "done" && r.fixes?.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.03em" }}>Still off</div>
                  <ul style={{ margin: "3px 0 0", paddingLeft: 14, fontSize: 11, color: C.sub, lineHeight: 1.4 }}>
                    {r.fixes.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {r.usedPlate && <div style={{ fontSize: 10.5, color: C.p600, marginTop: 4 }}>Used the emptied scene</div>}
              {r.passOne && (
                <button onClick={() => onShowPass(r.id)} style={{
                  marginTop: 5, background: "none", border: "none", padding: 0,
                  fontSize: 10.5, color: C.p600, cursor: "pointer", textDecoration: "underline",
                }}>See {r.passOneLabel || "the first pass"}</button>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {r.status === "done" && showImages && (
                  <Button kind="ghost" style={{ fontSize: 11.5, padding: "5px 9px" }} onClick={() => download(r.dataUrl, `${r.id}.png`)}>
                    <Download size={11} /> Save
                  </Button>
                )}
                {(r.status === "error" || r.status === "stopped" || r.status === "done") && (
                  <Button kind="ghost" style={{ fontSize: 11.5, padding: "5px 9px" }} onClick={() => onRetry(r.id)}>
                    <RefreshCw size={11} /> Retry
                  </Button>
                )}
              </div>
              {(r.raw || r.text) && <Raw label="Details" data={r.raw || { text: r.text, finishReason: r.finishReason, usage: r.usage }} />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Green at the target, amber halfway, red when it is not them.
function ScoreBadge({ score, round, rounds }) {
  const tone = score >= 80 ? { bg: C.sBg, text: C.sText, border: C.sBorder }
    : score >= 60 ? { bg: C.wBg, text: C.wText, border: `${C.wText}55` }
    : { bg: C.dBg, text: C.dText, border: `${C.dText}55` };
  return (
    <div style={{
      position: "absolute", top: 7, left: 7, display: "flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 99, background: tone.bg, color: tone.text,
      border: `1px solid ${tone.border}`, fontSize: 11, fontWeight: 800,
    }}>
      {score}
      {rounds > 1 && <span style={{ fontWeight: 600, opacity: 0.8 }}>· try {round}</span>}
    </div>
  );
}

function Viewer({ run, index, total, onClose, onStep }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(10,10,12,0.94)", zIndex: 90,
        display: "grid", placeItems: "center", padding: 24,
      }}
    >
      <img src={run.dataUrl} alt={run.name} onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "84vh", borderRadius: 10, display: "block" }} />
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "fixed", bottom: 20, left: 0, right: 0, display: "flex",
        alignItems: "center", justifyContent: "center", gap: 14, color: C.white,
      }}>
        <button onClick={() => onStep(-1)} style={viewerBtn}>Prev</button>
        <div style={{ fontSize: 13 }}>
          {run.name} · {index + 1} of {total}
          {Number.isFinite(run.score) && ` · likeness ${run.score}`}
        </div>
        <button onClick={() => onStep(1)} style={viewerBtn}>Next</button>
        <button onClick={() => download(run.dataUrl, `${run.id}.png`)} style={viewerBtn}>Save</button>
      </div>
      <button onClick={onClose} style={{ ...viewerBtn, position: "fixed", top: 18, right: 18 }}><X size={16} /></button>
    </div>
  );
}

const viewerBtn = {
  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px",
  borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)",
  background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 12.5, cursor: "pointer",
};
