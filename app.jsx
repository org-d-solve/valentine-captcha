/* Valentine Verification — interactive flow */

const { useState, useEffect, useRef, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "to": "",
  "from": "",
  "message": "",
  "skipToReveal": false
}/*EDITMODE-END*/;

/* ---------------- helpers ---------------- */
function getParam(name, fallback) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name) || fallback;
}

const CFG = (typeof window !== "undefined" && window.VALENTINE_CONFIG) || {};

// Comma-separated list param → array of trimmed strings (null if empty).
function parseList(raw) {
  if (!raw) return null;
  const parts = (Array.isArray(raw) ? raw : String(raw).split(","))
    .map(s => String(s).trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

/* ---------------- language ---------------- */
// ?lang=de | en   (config.js `language` is the fallback; English is the default)
const LANG = (() => {
  const raw = String(getParam("lang", "") || CFG.language || "en").toLowerCase().slice(0, 2);
  return raw === "de" ? "de" : "en";
})();

const STRINGS = {
  en: {
    pageTitle: "You've received a Valentine",
    metaSecure: "SECURE TRANSMISSION",
    stages: ["01 / VERIFICATION", "02 / IMAGE CHALLENGE", "03 / FINAL CONFIRMATION", "04 / VERIFIED"],
    defaultTo: "You",
    defaultFrom: "Your Secret Admirer",
    promptDefault: "a heart",

    stamp: "Priority · 1ST class",
    deliveredTo: "Hand-Delivered To",
    title: "you've received *a Valentine.*",
    subtitle: (toName, hasName) =>
      `For security reasons, please verify you are a real human${hasName ? ` and that you are, in fact, ${toName}` : ""}. Bots have been receiving entirely too many valentines this year.`,
    notRobot: "I'm not a robot",
    verifiedHuman: "Verified. You seem human enough.",
    captchaTerms: "Privacy · Terms",
    diagnostics: [
      "Analyzing your heart rate…",
      "Cross-referencing with my diary…",
      "Checking for red flags…",
      "Looking for someone better… none found.",
      "Asking your mom for permission…",
      "Verifying you're not my ex…",
      "Re-reading your texts from 2021…",
      "Calculating compatibility (suspiciously high)…",
    ],
    passPreparing: "✓ pass. preparing challenge…",
    fromLabel: (from) => `From ${from}`,
    declineLabels: ["decline", "no really, decline", "fine, decline"],
    declineQuit: "decline button quit",

    selectAllWith: "Select all squares with",
    hint: "If there are none, click verify.",
    errNoneSelected: (prompt) => `Please select all images containing ${prompt}.`,
    errAll: [
      (n) => `Almost — you missed ${n}. Look closer.`,
      (n, prompt) => `Still ${n} more. They all have ${prompt}. Trust me, I checked.`,
      (n) => `${n} unselected. This is starting to feel personal.`,
    ],
    errSpecific: ["Not quite — try again.", "Still wrong. Look closer.", "This is starting to feel personal."],
    reloadAll: (prompt) => `Refreshing didn't help. They're still all ${prompt}.`,
    reloadOther: "Refreshing didn't help. Same challenge.",
    helpAll: (prompt) => `Hint: every single one is ${prompt}.`,
    helpSpecific: (n) => `Hint: exactly ${n} of the nine squares count. Pick only those.`,
    helpAny: "Hint: pick at least one — any of them will do.",
    verifyBtn: "VERIFY",
    titleReload: "Get a new challenge",
    titleHelp: "Help",
    gridFoot: "This step protects against bots *and* people with worse taste.",

    finalConfirmation: "Final Confirmation",
    question: (from, hasFrom) =>
      `On a scale of *0 to yes*,\nwill you be ${hasFrom ? `${from}'s` : "my"} valentine?`,
    scale: ["NO", "MEH", "OK", "SURE", "YES"],
    readouts: ["absolutely not", "hmm.", "i guess.", "fine, yes.", "yes, obviously.", "yes, a thousand times."],
    reconsider: "← reconsider",
    slideAll: (pct) => `slide all the way (${pct}%)`,
    confirmBtn: "CONFIRM ✓",

    revealEyebrow: "Verified · Authentic · Non-refundable",
    reveal: "you are my valentine.",
    revealSub: "The system has spoken. The captcha agrees. There is no appeals process.",
    senderLabel: "— sender · ",
    startOver: "start over (you'll just end up here again)",
  },

  de: {
    pageTitle: "Du hast einen Valentinsgruß erhalten",
    metaSecure: "SICHERE ÜBERTRAGUNG",
    stages: ["01 / VERIFIZIERUNG", "02 / BILD-AUFGABE", "03 / LETZTE BESTÄTIGUNG", "04 / VERIFIZIERT"],
    defaultTo: "Du",
    defaultFrom: "Dein heimlicher Verehrer",
    promptDefault: "ein Herz",

    stamp: "Priorität · 1. Klasse",
    deliveredTo: "Persönlich zugestellt an",
    title: "du hast *einen Valentinsgruß* erhalten.",
    subtitle: (toName, hasName) =>
      `Aus Sicherheitsgründen bitte bestätigen, dass du ein echter Mensch bist${hasName ? ` und tatsächlich ${toName}` : ""}. Bots haben dieses Jahr entschieden zu viele Valentinsgrüße bekommen.`,
    notRobot: "Ich bin kein Roboter",
    verifiedHuman: "Verifiziert. Wirkt menschlich genug.",
    captchaTerms: "Datenschutz · AGB",
    diagnostics: [
      "Analysiere deinen Puls…",
      "Vergleiche mit meinem Tagebuch…",
      "Prüfe auf Warnsignale…",
      "Suche nach jemandem Besseren… nichts gefunden.",
      "Frage deine Mutter um Erlaubnis…",
      "Prüfe, ob du meine Ex bist…",
      "Lese deine Nachrichten von 2021 noch einmal…",
      "Berechne Kompatibilität (verdächtig hoch)…",
    ],
    passPreparing: "✓ bestanden. Aufgabe wird vorbereitet…",
    fromLabel: (from) => `Von ${from}`,
    declineLabels: ["ablehnen", "nein, wirklich ablehnen", "also gut, ablehnen"],
    declineQuit: "Ablehnen-Button hat gekündigt",

    selectAllWith: "Wähle alle Felder mit",
    hint: "Wenn keine dabei sind, klicke auf Bestätigen.",
    errNoneSelected: (prompt) => `Bitte wähle alle Bilder mit ${prompt}.`,
    errAll: [
      (n) => `Fast — ${n} fehlen noch. Schau genauer.`,
      (n, prompt) => `Immer noch ${n}. Auf allen ist ${prompt}. Ich habe nachgesehen.`,
      (n) => `${n} nicht ausgewählt. Das wird jetzt persönlich.`,
    ],
    errSpecific: ["Nicht ganz — versuch es noch einmal.", "Weiterhin falsch. Schau genauer.", "Das wird jetzt persönlich."],
    reloadAll: (prompt) => `Neu laden hat nicht geholfen. Auf allen ist weiterhin ${prompt}.`,
    reloadOther: "Neu laden hat nicht geholfen. Gleiche Aufgabe.",
    helpAll: (prompt) => `Tipp: auf jedem einzelnen ist ${prompt}.`,
    helpSpecific: (n) => `Tipp: genau ${n} der neun Felder zählen. Wähle nur diese aus.`,
    helpAny: "Tipp: wähle mindestens eins — es zählt jedes.",
    verifyBtn: "BESTÄTIGEN",
    titleReload: "Neue Aufgabe laden",
    titleHelp: "Hilfe",
    gridFoot: "Dieser Schritt schützt vor Bots *und* vor Menschen mit schlechterem Geschmack.",

    finalConfirmation: "Letzte Bestätigung",
    question: (from, hasFrom) =>
      `Auf einer Skala von *0 bis ja*,\nwillst du ${hasFrom ? `${from}s` : "mein"} Valentinsschatz sein?`,
    scale: ["NEIN", "HMM", "OK", "KLAR", "JA"],
    readouts: ["absolut nicht", "hmm.", "na gut.", "gut, ja.", "ja, offensichtlich.", "ja, tausendmal."],
    reconsider: "← nochmal überlegen",
    slideAll: (pct) => `ganz nach rechts ziehen (${pct}%)`,
    confirmBtn: "BESTÄTIGEN ✓",

    revealEyebrow: "Verifiziert · Echt · Nicht erstattungsfähig",
    reveal: "du bist mein Valentinsschatz.",
    revealSub: "Das System hat entschieden. Das Captcha stimmt zu. Einspruch ist nicht möglich.",
    senderLabel: "— Absender · ",
    startOver: "nochmal von vorn (du landest eh wieder hier)",
  },
};

const L = STRINGS[LANG];

if (typeof document !== "undefined") {
  document.documentElement.lang = LANG;
  document.title = L.pageTitle;
}

/* ---------------- customizable content ----------------
   Precedence for every value: URL param → config.js → language default. */
function pick(param, cfgKey) {
  return getParam(param, "") || CFG[cfgKey] || "";
}

const CFG_TITLE     = pick("title", "title");
const CFG_SUBTITLE  = pick("subtitle", "subtitle");
const CFG_PROMPT    = pick("prompt", "challengePrompt") || L.promptDefault;
const CFG_HINT      = pick("hint", "hint") || L.hint;   // always-visible header line
const CFG_HELP      = pick("help", "help");             // shown by the "?" button
const CFG_QUESTION  = pick("question", "question");
const CFG_REVEAL    = pick("reveal", "reveal");
const CFG_SCALE     = parseList(getParam("scale", "")) || parseList(CFG.scale) || L.scale;
const CFG_READOUTS  = parseList(getParam("readouts", "")) || parseList(CFG.readouts) || L.readouts;

// Captcha images: ?img1 … ?img9  (1-based, matching the grid labels).
// config.images is a plain array, so config.images[0] is cell 1.
function urlImages() {
  const out = [];
  for (let i = 1; i <= 9; i++) out.push(getParam("img" + i, null));
  return out;
}
const URL_IMAGES = urlImages();
const CFG_IMAGES_RAW = Array.isArray(CFG.images) ? CFG.images : [];
// Merge: URL beats config beats null
const CFG_IMAGES = Array.from({length: 9}, (_, i) => URL_IMAGES[i] || CFG_IMAGES_RAW[i] || null);

// Correct cells: ?cells=all | any | 1,3,5
// Cell numbers are 1–9, counted left-to-right, top-to-bottom — the same
// numbering the customize form uses. Stored 0-based internally.
function parseCorrect(raw) {
  if (!raw) return null;
  const mode = String(raw).trim().toLowerCase();
  if (mode === "all" || mode === "any") return mode;
  const parts = (Array.isArray(raw) ? raw : String(raw).split(","))
    .map(n => parseInt(String(n).trim(), 10))
    .filter(n => !isNaN(n) && n >= 1 && n <= 9)
    .map(n => n - 1);
  return parts.length ? [...new Set(parts)] : null;
}
const CFG_CORRECT =
  parseCorrect(getParam("cells", "")) || parseCorrect(CFG.correctCells) || "all";

/* Renders a customizable string: *asterisks* become the italic accent,
   "\n" becomes a line break. Plain text only — never raw HTML. */
function RichText({ text }) {
  return String(text).split(/\\n|\n/).map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br/>}
      {line.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
        part.length > 2 && part.startsWith("*") && part.endsWith("*")
          ? <em key={i}>{part.slice(1, -1)}</em>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </React.Fragment>
  ));
}

function Heart({ size = 24, fill = "currentColor", style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden="true">
      <path d="M12 21s-7.5-4.8-9.5-9.4C1.1 8.3 3 5 6.2 5c1.9 0 3.6 1 4.8 2.6C12.2 6 13.9 5 15.8 5 19 5 20.9 8.3 19.5 11.6 17.5 16.2 12 21 12 21z" fill={fill}/>
    </svg>
  );
}

/* Each "image" in the captcha grid is an SVG placeholder.
   They all (humorously) contain a heart somewhere. */
function CellArt({ idx, src }) {
  // If user supplied an image URL via config, render that as a real photo.
  if (src) {
    return (
      <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
    );
  }
  const palettes = [
    ["#f5d6cf", "#e89488"],
    ["#f1e3c9", "#d4a86a"],
    ["#dbe6d0", "#7fae6d"],
    ["#e6d3e8", "#b07ab8"],
    ["#f3cdc3", "#cf5a4a"],
    ["#e0d4c3", "#7a6850"],
    ["#f0e0d0", "#c98c5e"],
    ["#d9d3e3", "#6b6996"],
    ["#f5c8c0", "#a83a30"],
  ];
  const [bg, fg] = palettes[idx % palettes.length];

  // Each cell has a slightly different "scene" but with a heart concealed in it.
  const variants = [
    // 0: a sunrise with a heart-shaped sun
    <g key="a">
      <rect width="100" height="100" fill={bg}/>
      <path d="M0 75 Q 25 60 50 70 T 100 65 V100 H0 Z" fill={fg} opacity="0.6"/>
      <g transform="translate(50 38) scale(0.9)">
        <Heart size={28} fill={fg} style={{transform:"translate(-14px,-14px)"}}/>
      </g>
    </g>,
    // 1: stripes
    <g key="b">
      <rect width="100" height="100" fill={bg}/>
      {[...Array(6)].map((_,i)=> <rect key={i} y={i*18} width="100" height="6" fill={fg} opacity="0.5"/>)}
      <g transform="translate(50 50)"><Heart size={22} fill={fg} style={{transform:"translate(-11px,-11px)"}}/></g>
    </g>,
    // 2: dots
    <g key="c">
      <rect width="100" height="100" fill={bg}/>
      {[...Array(16)].map((_,i)=>(
        <circle key={i} cx={(i%4)*25+12} cy={Math.floor(i/4)*25+12} r="4" fill={fg} opacity="0.55"/>
      ))}
      <g transform="translate(50 52)"><Heart size={24} fill={fg} style={{transform:"translate(-12px,-12px)"}}/></g>
    </g>,
    // 3: cup of coffee w/ heart latte art
    <g key="d">
      <rect width="100" height="100" fill={bg}/>
      <rect x="22" y="30" width="56" height="46" rx="6" fill="#fff" stroke={fg} strokeWidth="2"/>
      <rect x="78" y="40" width="14" height="22" rx="7" fill="none" stroke={fg} strokeWidth="2"/>
      <rect x="24" y="32" width="52" height="14" fill={fg} opacity="0.4"/>
      <g transform="translate(50 56)"><Heart size={18} fill={fg} style={{transform:"translate(-9px,-9px)"}}/></g>
    </g>,
    // 4: envelope
    <g key="e">
      <rect width="100" height="100" fill={bg}/>
      <rect x="18" y="32" width="64" height="42" rx="3" fill="#fff" stroke={fg} strokeWidth="2"/>
      <path d="M18 32 L50 56 L82 32" fill="none" stroke={fg} strokeWidth="2"/>
      <g transform="translate(50 62)"><Heart size={16} fill={fg} style={{transform:"translate(-8px,-8px)"}}/></g>
    </g>,
    // 5: cat
    <g key="f">
      <rect width="100" height="100" fill={bg}/>
      <circle cx="50" cy="56" r="22" fill={fg} opacity="0.6"/>
      <polygon points="32,38 38,52 26,52" fill={fg} opacity="0.6"/>
      <polygon points="68,38 74,52 62,52" fill={fg} opacity="0.6"/>
      <circle cx="44" cy="55" r="2.5" fill="#1a1815"/>
      <circle cx="56" cy="55" r="2.5" fill="#1a1815"/>
      <g transform="translate(50 66)"><Heart size={10} fill="#1a1815" style={{transform:"translate(-5px,-5px)"}}/></g>
    </g>,
    // 6: pizza slice
    <g key="g">
      <rect width="100" height="100" fill={bg}/>
      <polygon points="20,20 80,20 50,82" fill={fg} opacity="0.6"/>
      <polygon points="20,20 80,20 50,38" fill="#fff" opacity="0.5"/>
      <g transform="translate(50 50)"><Heart size={14} fill="#fff" style={{transform:"translate(-7px,-7px)"}}/></g>
    </g>,
    // 7: clouds
    <g key="h">
      <rect width="100" height="100" fill={bg}/>
      <ellipse cx="35" cy="40" rx="20" ry="10" fill="#fff" opacity="0.85"/>
      <ellipse cx="65" cy="55" rx="22" ry="11" fill="#fff" opacity="0.85"/>
      <g transform="translate(50 78)"><Heart size={18} fill={fg} style={{transform:"translate(-9px,-9px)"}}/></g>
    </g>,
    // 8: just a really obvious heart
    <g key="i">
      <rect width="100" height="100" fill={bg}/>
      <g transform="translate(50 52)"><Heart size={56} fill={fg} style={{transform:"translate(-28px,-28px)"}}/></g>
    </g>,
  ];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {variants[idx % variants.length]}
    </svg>
  );
}

/* Picks the readout phrase for the current slider value — works with any
   number of phrases; the last one is reserved for "all the way". */
function readoutFor(val, list) {
  if (!list.length) return "";
  if (val >= 100) return list[list.length - 1];
  const rest = list.length > 1 ? list.length - 1 : 1;
  return list[Math.min(rest - 1, Math.floor((val / 100) * rest))];
}

/* ---------------- main app ---------------- */
function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const TweaksPanel = window.TweaksPanel;

  // Resolve names — URL params trump tweaks unless tweak is set
  const urlTo = getParam("to", "") || getParam("name", "");
  const urlFrom = getParam("from", "") || getParam("by", "");
  const urlMsg = getParam("msg", "") || getParam("message", "");
  const rawTo = tweaks.to || urlTo || CFG.to || "";
  const rawFrom = tweaks.from || urlFrom || CFG.from || "";
  const hasTo = Boolean(rawTo.trim());
  const hasFrom = Boolean(rawFrom.trim());
  const toName = (rawTo || L.defaultTo).trim();
  const fromName = (rawFrom || L.defaultFrom).trim();
  const message = tweaks.message || urlMsg || CFG.message || "";

  // Stages: intro -> imageGrid -> slider -> reveal
  const [stage, setStage] = useState(tweaks.skipToReveal ? "reveal" : "intro");

  useEffect(() => {
    if (tweaks.skipToReveal) setStage("reveal");
  }, [tweaks.skipToReveal]);

  // intro state — checkbox
  const [checkState, setCheckState] = useState("idle"); // idle | loading | done
  const [diagIdx, setDiagIdx] = useState(0);

  useEffect(() => {
    if (checkState !== "loading") return;
    setDiagIdx(0);
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % L.diagnostics.length;
      setDiagIdx(i);
    }, 850);
    const done = setTimeout(() => {
      setCheckState("done");
      clearInterval(id);
      setTimeout(() => setStage("grid"), 700);
    }, 3400);
    return () => { clearInterval(id); clearTimeout(done); };
  }, [checkState]);

  // grid challenge state
  const [selected, setSelected] = useState(new Set());
  const [gridError, setGridError] = useState("");
  const [gridAttempts, setGridAttempts] = useState(0);

  // 9 cells, populated from config.images + URL params (or defaults to null = SVG)
  const cells = CFG_IMAGES;

  const correctSet = useMemo(() => {
    if (Array.isArray(CFG_CORRECT)) return new Set(CFG_CORRECT);
    return new Set([0,1,2,3,4,5,6,7,8]); // "all" — default
  }, []);
  const correctMode = CFG_CORRECT === "any" ? "any" : Array.isArray(CFG_CORRECT) ? "specific" : "all";

  function toggleCell(i) {
    setGridError("");
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  function verifyGrid() {
    let pass = false;
    if (correctMode === "any") {
      pass = selected.size > 0;
    } else if (correctMode === "specific") {
      pass = correctSet.size === selected.size &&
             [...correctSet].every(i => selected.has(i));
    } else {
      pass = selected.size === 9;
    }
    if (pass) { setStage("slider"); return; }

    if (selected.size === 0) {
      setGridError(L.errNoneSelected(CFG_PROMPT));
      return;
    }
    setGridAttempts(a => a + 1);
    if (correctMode === "all") {
      const remaining = 9 - selected.size;
      const step = Math.min(gridAttempts, L.errAll.length - 1);
      setGridError(L.errAll[step](remaining, CFG_PROMPT));
    } else {
      const step = Math.min(gridAttempts, L.errSpecific.length - 1);
      setGridError(L.errSpecific[step]);
    }
  }

  function reloadGrid() {
    setSelected(new Set());
    setGridError(correctMode === "all" ? L.reloadAll(CFG_PROMPT) : L.reloadOther);
  }

  // The "?" button. A custom `help` text wins; otherwise the default actually
  // reflects the challenge instead of being the same line every time.
  function showHelp() {
    if (CFG_HELP) { setGridError(CFG_HELP); return; }
    if (correctMode === "all")      setGridError(L.helpAll(CFG_PROMPT));
    else if (correctMode === "any") setGridError(L.helpAny);
    else                            setGridError(L.helpSpecific(correctSet.size));
  }

  // slider challenge state
  const [sliderVal, setSliderVal] = useState(0);
  const sliderLabel = useMemo(
    () => readoutFor(sliderVal, CFG_READOUTS),
    [sliderVal]
  );

  function confirmSlider() {
    if (sliderVal >= 100) setStage("reveal");
  }

  // decline button skitter
  const declineRef = useRef(null);
  const [declineDx, setDeclineDx] = useState(0);
  const [declineDodges, setDeclineDodges] = useState(0);
  const [declineGone, setDeclineGone] = useState(false);

  function dodgeDecline() {
    if (declineDodges >= 2) {
      setDeclineGone(true);
      return;
    }
    setDeclineDx(prev => (prev === 0 ? -120 : prev > 0 ? -160 : 160));
    setDeclineDodges(d => d + 1);
  }

  // confetti for reveal
  const [confetti, setConfetti] = useState([]);
  useEffect(() => {
    if (stage !== "reveal") return;
    const pieces = Array.from({length: 30}, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      size: 14 + Math.random() * 22,
      tilt: Math.random() * 360,
    }));
    setConfetti(pieces);
  }, [stage]);

  /* -------- renders -------- */
  const stageLabel = stage === "intro" ? L.stages[0]
    : stage === "grid" ? L.stages[1]
    : stage === "slider" ? L.stages[2]
    : L.stages[3];

  return (
    <div className="stage">
      <div className="meta-row">
        <span><span className="dot"></span>{L.metaSecure}</span>
        <span>{stageLabel}</span>
      </div>

      {stage === "intro" && (
        <div className="card fade-in" key="intro">
          <div className="stamp">{L.stamp}</div>
          <h1 className="eyebrow">{L.deliveredTo}</h1>
          <h2 className="title">{toName},<br/><RichText text={CFG_TITLE || L.title} /></h2>
          <p className="subtitle">
            <RichText text={CFG_SUBTITLE || L.subtitle(toName, hasTo)} />
          </p>

          <div className="captcha-widget">
            <div
              className={"captcha-checkbox " + (checkState === "loading" ? "loading" : checkState === "done" ? "done" : "")}
              onClick={() => { if (checkState === "idle") setCheckState("loading"); }}
              role="checkbox"
              aria-checked={checkState === "done"}
              tabIndex={0}
            />
            <div className="captcha-label">
              {checkState === "done" ? L.verifiedHuman : L.notRobot}
            </div>
            <div className="captcha-brand">
              <Heart size={18} />
              <span className="logo">cuteCAPTCHA</span>
              <span className="terms">{L.captchaTerms}</span>
            </div>
          </div>

          <div className="status-line">
            {checkState === "loading" && (<><span className="blink">{L.diagnostics[diagIdx]}</span></>)}
            {checkState === "done" && <>{L.passPreparing}</>}
          </div>

          <div className="actions">
            <span className="footnote">{L.fromLabel(fromName)}</span>
            {!declineGone ? (
              <button
                ref={declineRef}
                className="decline"
                style={{ transform: `translateX(${declineDx}px)` }}
                onMouseEnter={dodgeDecline}
                onFocus={dodgeDecline}
                onClick={(e)=>{ e.preventDefault(); dodgeDecline(); }}
              >
                {L.declineLabels[Math.min(declineDodges, L.declineLabels.length - 1)]}
              </button>
            ) : (
              <span className="footnote" style={{opacity:0.6}}>{L.declineQuit}</span>
            )}
          </div>
        </div>
      )}

      {stage === "grid" && (
        <div className="card fade-in" key="grid" style={{padding:"24px 22px 22px"}}>
          {gridError && (
            <div className="toast"><span className="x">✕</span><span>{gridError}</span></div>
          )}
          <div className="challenge">
            <div className="challenge-header">
              <strong>{L.selectAllWith}</strong>
              <span className="hint"><Heart size={12} fill="#fff" style={{display:"inline",verticalAlign:"-2px",marginRight:4}}/>{CFG_PROMPT}. <RichText text={CFG_HINT} /></span>
            </div>
            <div className="grid">
              {cells.map((src, i) => (
                <div
                  key={i}
                  className={"cell " + (selected.has(i) ? "selected" : "")}
                  onClick={() => toggleCell(i)}
                >
                  <CellArt idx={i} src={src} />
                </div>
              ))}
            </div>
            <div className="challenge-foot">
              <div style={{display:"flex",gap:4}}>
                <button className="icon-btn" onClick={reloadGrid} title={L.titleReload}>↻</button>
                <button className="icon-btn" title={L.titleHelp} onClick={showHelp}>?</button>
              </div>
              <button className="verify-btn" onClick={verifyGrid}>{L.verifyBtn}</button>
            </div>
          </div>
          <p className="subtitle" style={{margin:0, fontSize:12.5, color:"var(--ink-3)", textAlign:"center"}}>
            <RichText text={L.gridFoot} />
          </p>
        </div>
      )}

      {stage === "slider" && (
        <div className="card fade-in" key="slider">
          <h1 className="eyebrow">{L.finalConfirmation}</h1>
          <h2 className="title" style={{fontSize:36, marginBottom:18}}>
            <RichText text={CFG_QUESTION || L.question(fromName, hasFrom)} />
          </h2>

          <div className="slider-challenge">
            <div className="slider-track-wrap">
              <div className="slider-track">
                <div className="slider-fill" style={{width: `${sliderVal}%`}}></div>
              </div>
              <input
                type="range" min="0" max="100" value={sliderVal}
                className="slider-input"
                onChange={e => setSliderVal(parseInt(e.target.value, 10))}
              />
              <div className="slider-labels">
                {CFG_SCALE.map((label, i) => <span key={i}>{label}</span>)}
              </div>
            </div>
            <div className="slider-readout">"{sliderLabel}"</div>
          </div>

          <div className="actions">
            <button
              className="decline"
              onClick={() => setSliderVal(s => Math.max(0, s - 25))}
              style={{textDecoration:"none"}}
            >{L.reconsider}</button>
            <button
              className="verify-btn"
              onClick={confirmSlider}
              disabled={sliderVal < 100}
              style={{background: sliderVal >= 100 ? "var(--red)" : undefined}}
            >
              {sliderVal < 100 ? L.slideAll(sliderVal) : L.confirmBtn}
            </button>
          </div>
        </div>
      )}

      {stage === "reveal" && (
        <>
          <div className="confetti">
            {confetti.map(p => (
              <div key={p.id} className="h" style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                transform: `rotate(${p.tilt}deg)`,
              }}>
                <Heart size={p.size} />
              </div>
            ))}
          </div>
          <div className="card reveal-card fade-in" key="reveal">
            <div className="seal"><Heart size={64} /></div>
            <p className="reveal-eyebrow">{L.revealEyebrow}</p>
            <h2 className="reveal-title">
              <span className="name">{toName}</span>,<br/>
              <RichText text={CFG_REVEAL || L.reveal} />
            </h2>
            <p className="reveal-sub">
              {message ? message : L.revealSub}
            </p>
            <div className="signature">
              {fromName}
              <small>{L.senderLabel}{new Date().toLocaleDateString(LANG,{month:"short",day:"numeric"})}</small>
            </div>

            <div style={{marginTop:24}}>
              <button
                className="decline"
                onClick={() => { setStage("intro"); setCheckState("idle"); setSelected(new Set()); setSliderVal(0); setDeclineGone(false); setDeclineDodges(0); setDeclineDx(0); }}
              >{L.startOver}</button>
            </div>
          </div>
        </>
      )}

      {/* Tweaks panel */}
      {TweaksPanel && (
        <TweaksPanel title="Tweaks">
          {window.TweakSection && (
            <>
              <window.TweakSection label="Names" />
              <window.TweakText label="To" value={tweaks.to} placeholder={urlTo || "(from URL: ?to=)"} onChange={v => setTweak("to", v)} />
              <window.TweakText label="From" value={tweaks.from} placeholder={urlFrom || "(from URL: ?from=)"} onChange={v => setTweak("from", v)} />
              <window.TweakSection label="Reveal" />
              <window.TweakText label="Custom message" value={tweaks.message} placeholder="optional override" onChange={v => setTweak("message", v)} />
              <window.TweakToggle label="Skip to reveal" value={tweaks.skipToReveal} onChange={v => setTweak("skipToReveal", v)} />
              <window.TweakSection label="URL" />
                <div style={{fontFamily:"JetBrains Mono, monospace", fontSize:10.5, color:"#888", lineHeight:1.6, wordBreak:"break-all"}}>
                  ?to={encodeURIComponent(toName)}&from={encodeURIComponent(fromName)}
                </div>
                <window.TweakButton label="Copy share URL" onClick={() => {
                  const u = new URL(window.location.href);
                  u.searchParams.set("to", toName);
                  u.searchParams.set("from", fromName);
                  navigator.clipboard?.writeText(u.toString());
                }} />
            </>
          )}
        </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
