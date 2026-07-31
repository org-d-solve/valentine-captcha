/* Valentine Verification — interactive flow.

   Plain DOM. No framework, no build step, nothing loaded from a CDN.

   Rendering strategy: a stage change rebuilds the card (which replays the
   fade-in animation, the way remounting did before). Everything that happens
   *within* a stage — ticking the checkbox, selecting a square, dragging the
   slider — patches the affected nodes directly. That keeps the animation from
   restarting on every click and, importantly, keeps the browser's drag on the
   range input alive while it is being dragged. */
(function () {
  "use strict";

  /* ---------------- helpers ---------------- */
  function getParam(name, fallback) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name) || fallback;
  }

  const CFG = window.VALENTINE_CONFIG || {};

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
  const LANG = (function () {
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

  document.documentElement.lang = LANG;
  document.title = L.pageTitle;

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
  const CFG_IMAGES = Array.from({ length: 9 }, (_, i) => URL_IMAGES[i] || CFG_IMAGES_RAW[i] || null);

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

  const correctSet = Array.isArray(CFG_CORRECT)
    ? new Set(CFG_CORRECT)
    : new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]);   // "all" — default
  const correctMode = CFG_CORRECT === "any" ? "any"
    : Array.isArray(CFG_CORRECT) ? "specific" : "all";

  /* ---------------- text → markup ----------------
     Everything a sender writes goes through esc() before it reaches the DOM.
     React used to do this for us; here it has to be deliberate. */
  const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function esc(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/[&<>"']/g, c => ESCAPE_MAP[c]);
  }

  /* Renders a customizable string: *asterisks* become the italic accent,
     "\n" becomes a line break. Plain text only — never raw HTML.
     Note the order: escape first, *then* add our own markup. Escaping never
     produces an asterisk, so splitting afterwards is equivalent to splitting
     the raw text — but nothing the sender wrote can become a tag. */
  function richText(text) {
    return String(text).split(/\\n|\n/).map(line =>
      esc(line)
        .split(/(\*[^*]+\*)/g)
        .filter(Boolean)
        .map(part =>
          part.length > 2 && part.startsWith("*") && part.endsWith("*")
            ? "<em>" + part.slice(1, -1) + "</em>"
            : part
        )
        .join("")
    ).join("<br>");
  }

  /* ---------------- svg ---------------- */
  const HEART_PATH = "M12 21s-7.5-4.8-9.5-9.4C1.1 8.3 3 5 6.2 5c1.9 0 3.6 1 4.8 2.6C12.2 6 13.9 5 15.8 5 19 5 20.9 8.3 19.5 11.6 17.5 16.2 12 21 12 21z";

  function heart(size, fill, style) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '"' +
      (style ? ' style="' + style + '"' : "") +
      ' aria-hidden="true"><path d="' + HEART_PATH + '" fill="' + (fill || "currentColor") + '"/></svg>';
  }

  /* Each "image" in the captcha grid is an SVG placeholder.
     They all (humorously) contain a heart somewhere. */
  const PALETTES = [
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

  function cellArt(idx, src) {
    // If the sender supplied an image URL, render that as a real photo.
    if (src) {
      return '<img src="' + esc(src) + '" alt="" ' +
        'style="width:100%;height:100%;object-fit:cover;display:block">';
    }

    const palette = PALETTES[idx % PALETTES.length];
    const bg = palette[0];
    const fg = palette[1];

    // A centred heart, offset by half its size the way the React version did.
    const centred = (size, fill) =>
      heart(size, fill, "transform:translate(" + (-size / 2) + "px," + (-size / 2) + "px)");

    // Each cell has a slightly different "scene" but with a heart concealed in it.
    const variants = [
      // 0: a sunrise with a heart-shaped sun
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        '<path d="M0 75 Q 25 60 50 70 T 100 65 V100 H0 Z" fill="' + fg + '" opacity="0.6"/>' +
        '<g transform="translate(50 38) scale(0.9)">' + centred(28, fg) + '</g></g>',

      // 1: stripes
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        Array.from({ length: 6 }, (_, i) =>
          '<rect y="' + (i * 18) + '" width="100" height="6" fill="' + fg + '" opacity="0.5"/>').join("") +
        '<g transform="translate(50 50)">' + centred(22, fg) + '</g></g>',

      // 2: dots
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        Array.from({ length: 16 }, (_, i) =>
          '<circle cx="' + ((i % 4) * 25 + 12) + '" cy="' + (Math.floor(i / 4) * 25 + 12) +
          '" r="4" fill="' + fg + '" opacity="0.55"/>').join("") +
        '<g transform="translate(50 52)">' + centred(24, fg) + '</g></g>',

      // 3: cup of coffee w/ heart latte art
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        '<rect x="22" y="30" width="56" height="46" rx="6" fill="#fff" stroke="' + fg + '" stroke-width="2"/>' +
        '<rect x="78" y="40" width="14" height="22" rx="7" fill="none" stroke="' + fg + '" stroke-width="2"/>' +
        '<rect x="24" y="32" width="52" height="14" fill="' + fg + '" opacity="0.4"/>' +
        '<g transform="translate(50 56)">' + centred(18, fg) + '</g></g>',

      // 4: envelope
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        '<rect x="18" y="32" width="64" height="42" rx="3" fill="#fff" stroke="' + fg + '" stroke-width="2"/>' +
        '<path d="M18 32 L50 56 L82 32" fill="none" stroke="' + fg + '" stroke-width="2"/>' +
        '<g transform="translate(50 62)">' + centred(16, fg) + '</g></g>',

      // 5: cat
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        '<circle cx="50" cy="56" r="22" fill="' + fg + '" opacity="0.6"/>' +
        '<polygon points="32,38 38,52 26,52" fill="' + fg + '" opacity="0.6"/>' +
        '<polygon points="68,38 74,52 62,52" fill="' + fg + '" opacity="0.6"/>' +
        '<circle cx="44" cy="55" r="2.5" fill="#1a1815"/>' +
        '<circle cx="56" cy="55" r="2.5" fill="#1a1815"/>' +
        '<g transform="translate(50 66)">' + centred(10, "#1a1815") + '</g></g>',

      // 6: pizza slice
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        '<polygon points="20,20 80,20 50,82" fill="' + fg + '" opacity="0.6"/>' +
        '<polygon points="20,20 80,20 50,38" fill="#fff" opacity="0.5"/>' +
        '<g transform="translate(50 50)">' + centred(14, "#fff") + '</g></g>',

      // 7: clouds
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        '<ellipse cx="35" cy="40" rx="20" ry="10" fill="#fff" opacity="0.85"/>' +
        '<ellipse cx="65" cy="55" rx="22" ry="11" fill="#fff" opacity="0.85"/>' +
        '<g transform="translate(50 78)">' + centred(18, fg) + '</g></g>',

      // 8: just a really obvious heart
      '<g><rect width="100" height="100" fill="' + bg + '"/>' +
        '<g transform="translate(50 52)">' + centred(56, fg) + '</g></g>',
    ];

    return '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' +
      variants[idx % variants.length] + "</svg>";
  }

  /* Picks the readout phrase for the current slider value — works with any
     number of phrases; the last one is reserved for "all the way". */
  function readoutFor(val, list) {
    if (!list.length) return "";
    if (val >= 100) return list[list.length - 1];
    const rest = list.length > 1 ? list.length - 1 : 1;
    return list[Math.min(rest - 1, Math.floor((val / 100) * rest))];
  }

  /* ---------------- resolved names ---------------- */
  const urlTo = getParam("to", "") || getParam("name", "");
  const urlFrom = getParam("from", "") || getParam("by", "");
  const urlMsg = getParam("msg", "") || getParam("message", "");
  const rawTo = urlTo || CFG.to || "";
  const rawFrom = urlFrom || CFG.from || "";
  const hasTo = Boolean(rawTo.trim());
  const hasFrom = Boolean(rawFrom.trim());
  const toName = (rawTo || L.defaultTo).trim();
  const fromName = (rawFrom || L.defaultFrom).trim();
  const message = urlMsg || CFG.message || "";

  /* ---------------- state ---------------- */
  // Stages: intro -> grid -> slider -> reveal
  const state = {
    stage: "intro",
    checkState: "idle",      // idle | loading | done
    diagIdx: 0,
    selected: new Set(),
    gridError: "",
    gridAttempts: 0,
    sliderVal: 0,
    declineDx: 0,
    declineDodges: 0,
    declineGone: false,
  };

  // Every pending timer, so a stage change can't leave one running.
  let timers = [];
  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function repeat(fn, ms) { const id = setInterval(fn, ms); timers.push(id); return id; }
  function clearTimers() {
    timers.forEach(id => { clearTimeout(id); clearInterval(id); });
    timers = [];
  }

  /* ---------------- screens ---------------- */
  function introScreen() {
    const declineLabel = L.declineLabels[Math.min(state.declineDodges, L.declineLabels.length - 1)];

    return '<div class="card fade-in">' +
      '<div class="stamp">' + esc(L.stamp) + "</div>" +
      '<h1 class="eyebrow">' + esc(L.deliveredTo) + "</h1>" +
      '<h2 class="title">' + esc(toName) + ",<br>" + richText(CFG_TITLE || L.title) + "</h2>" +
      '<p class="subtitle">' + richText(CFG_SUBTITLE || L.subtitle(toName, hasTo)) + "</p>" +

      '<div class="captcha-widget">' +
        '<div class="captcha-checkbox" id="captcha-box" role="checkbox" aria-checked="false" tabindex="0"></div>' +
        '<div class="captcha-label" id="captcha-label">' + esc(L.notRobot) + "</div>" +
        '<div class="captcha-brand">' + heart(18) +
          '<span class="logo">cuteCAPTCHA</span>' +
          '<span class="terms">' + esc(L.captchaTerms) + "</span>" +
        "</div>" +
      "</div>" +

      '<div class="status-line" id="status-line"></div>' +

      '<div class="actions">' +
        '<span class="footnote">' + esc(L.fromLabel(fromName)) + "</span>" +
        (state.declineGone
          ? '<span class="footnote" style="opacity:0.6">' + esc(L.declineQuit) + "</span>"
          : '<button class="decline" id="decline-btn" style="transform:translateX(' +
            state.declineDx + 'px)">' + esc(declineLabel) + "</button>") +
      "</div>" +
    "</div>";
  }

  function gridScreen() {
    const cells = CFG_IMAGES.map((src, i) =>
      '<div class="cell" data-cell="' + i + '">' + cellArt(i, src) + "</div>").join("");

    return '<div class="card fade-in" id="grid-card" style="padding:24px 22px 22px">' +
      '<div class="challenge">' +
        '<div class="challenge-header">' +
          "<strong>" + esc(L.selectAllWith) + "</strong>" +
          '<span class="hint">' +
            heart(12, "#fff", "display:inline;vertical-align:-2px;margin-right:4px") +
            esc(CFG_PROMPT) + ". " + richText(CFG_HINT) +
          "</span>" +
        "</div>" +
        '<div class="grid">' + cells + "</div>" +
        '<div class="challenge-foot">' +
          '<div style="display:flex;gap:4px">' +
            '<button class="icon-btn" data-action="reload" title="' + esc(L.titleReload) + '">↻</button>' +
            '<button class="icon-btn" data-action="help" title="' + esc(L.titleHelp) + '">?</button>' +
          "</div>" +
          '<button class="verify-btn" data-action="verify">' + esc(L.verifyBtn) + "</button>" +
        "</div>" +
      "</div>" +
      '<p class="subtitle" style="margin:0;font-size:12.5px;color:var(--ink-3);text-align:center">' +
        richText(L.gridFoot) +
      "</p>" +
    "</div>";
  }

  function sliderScreen() {
    const labels = CFG_SCALE.map(label => "<span>" + esc(label) + "</span>").join("");

    return '<div class="card fade-in">' +
      '<h1 class="eyebrow">' + esc(L.finalConfirmation) + "</h1>" +
      '<h2 class="title" style="font-size:36px;margin-bottom:18px">' +
        richText(CFG_QUESTION || L.question(fromName, hasFrom)) +
      "</h2>" +

      '<div class="slider-challenge">' +
        '<div class="slider-track-wrap">' +
          '<div class="slider-track"><div class="slider-fill" id="slider-fill" style="width:0%"></div></div>' +
          '<input type="range" min="0" max="100" value="0" class="slider-input" id="slider-input">' +
          '<div class="slider-labels">' + labels + "</div>" +
        "</div>" +
        '<div class="slider-readout" id="slider-readout">"' + esc(readoutFor(0, CFG_READOUTS)) + '"</div>' +
      "</div>" +

      '<div class="actions">' +
        '<button class="decline" data-action="reconsider" style="text-decoration:none">' +
          esc(L.reconsider) + "</button>" +
        '<button class="verify-btn" id="confirm-btn" data-action="confirm" disabled>' +
          esc(L.slideAll(0)) + "</button>" +
      "</div>" +
    "</div>";
  }

  function revealScreen() {
    const pieces = Array.from({ length: 30 }, () => {
      const size = 14 + Math.random() * 22;
      return '<div class="h" style="left:' + (Math.random() * 100) + "%;animation-delay:" +
        (Math.random() * 2.5) + "s;transform:rotate(" + (Math.random() * 360) + 'deg)">' +
        heart(size) + "</div>";
    }).join("");

    const date = new Date().toLocaleDateString(LANG, { month: "short", day: "numeric" });

    return '<div class="confetti">' + pieces + "</div>" +
      '<div class="card reveal-card fade-in">' +
        '<div class="seal">' + heart(64) + "</div>" +
        '<p class="reveal-eyebrow">' + esc(L.revealEyebrow) + "</p>" +
        '<h2 class="reveal-title">' +
          '<span class="name">' + esc(toName) + "</span>,<br>" +
          richText(CFG_REVEAL || L.reveal) +
        "</h2>" +
        '<p class="reveal-sub">' + esc(message || L.revealSub) + "</p>" +
        '<div class="signature">' + esc(fromName) +
          "<small>" + esc(L.senderLabel) + esc(date) + "</small>" +
        "</div>" +
        '<div style="margin-top:24px">' +
          '<button class="decline" data-action="restart">' + esc(L.startOver) + "</button>" +
        "</div>" +
      "</div>";
  }

  /* ---------------- rendering ---------------- */
  const root = document.getElementById("root");

  const SCREENS = {
    intro: introScreen,
    grid: gridScreen,
    slider: sliderScreen,
    reveal: revealScreen,
  };
  const STAGE_INDEX = { intro: 0, grid: 1, slider: 2, reveal: 3 };

  function render() {
    clearTimers();

    root.innerHTML =
      '<div class="stage">' +
        '<div class="meta-row">' +
          '<span><span class="dot"></span>' + esc(L.metaSecure) + "</span>" +
          "<span>" + esc(L.stages[STAGE_INDEX[state.stage]]) + "</span>" +
        "</div>" +
        SCREENS[state.stage]() +
      "</div>";

    WIRING[state.stage]();
  }

  function goToStage(stage) {
    state.stage = stage;
    render();
  }

  /* ---------------- intro ---------------- */
  function wireIntro() {
    const box = document.getElementById("captcha-box");
    const label = document.getElementById("captcha-label");
    const status = document.getElementById("status-line");

    function startCheck() {
      if (state.checkState !== "idle") return;
      state.checkState = "loading";
      state.diagIdx = 0;

      box.className = "captcha-checkbox loading";
      status.innerHTML = '<span class="blink">' + esc(L.diagnostics[0]) + "</span>";

      const cycle = repeat(() => {
        state.diagIdx = (state.diagIdx + 1) % L.diagnostics.length;
        status.innerHTML = '<span class="blink">' + esc(L.diagnostics[state.diagIdx]) + "</span>";
      }, 850);

      later(() => {
        clearInterval(cycle);
        state.checkState = "done";
        box.className = "captcha-checkbox done";
        box.setAttribute("aria-checked", "true");
        label.textContent = L.verifiedHuman;
        status.textContent = L.passPreparing;
        later(() => goToStage("grid"), 700);
      }, 3400);
    }

    box.addEventListener("click", startCheck);
    box.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        startCheck();
      }
    });

    const decline = document.getElementById("decline-btn");
    if (!decline) return;

    function dodge(event) {
      if (event) event.preventDefault();
      if (state.declineDodges >= 2) {
        state.declineGone = true;
        decline.outerHTML = '<span class="footnote" style="opacity:0.6">' + esc(L.declineQuit) + "</span>";
        return;
      }
      state.declineDx = state.declineDx === 0 ? -120 : state.declineDx > 0 ? -160 : 160;
      state.declineDodges += 1;
      decline.style.transform = "translateX(" + state.declineDx + "px)";
      decline.textContent = L.declineLabels[Math.min(state.declineDodges, L.declineLabels.length - 1)];
    }

    decline.addEventListener("mouseenter", dodge);
    decline.addEventListener("focus", dodge);
    decline.addEventListener("click", dodge);
  }

  /* ---------------- grid ---------------- */
  function setGridError(text) {
    state.gridError = text;
    const card = document.getElementById("grid-card");
    if (!card) return;

    const existing = card.querySelector(".toast");
    if (existing) existing.remove();
    if (!text) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = '<span class="x">✕</span><span>' + esc(text) + "</span>";
    card.insertBefore(toast, card.firstChild);
  }

  function verifyGrid() {
    let pass;
    if (correctMode === "any") {
      pass = state.selected.size > 0;
    } else if (correctMode === "specific") {
      pass = correctSet.size === state.selected.size &&
        [...correctSet].every(i => state.selected.has(i));
    } else {
      pass = state.selected.size === 9;
    }

    if (pass) { goToStage("slider"); return; }

    if (state.selected.size === 0) {
      setGridError(L.errNoneSelected(CFG_PROMPT));
      return;
    }

    if (correctMode === "all") {
      const remaining = 9 - state.selected.size;
      const step = Math.min(state.gridAttempts, L.errAll.length - 1);
      setGridError(L.errAll[step](remaining, CFG_PROMPT));
    } else {
      const step = Math.min(state.gridAttempts, L.errSpecific.length - 1);
      setGridError(L.errSpecific[step]);
    }
    state.gridAttempts += 1;
  }

  // The "?" button. A custom `help` text wins; otherwise the default actually
  // reflects the challenge instead of being the same line every time.
  function showHelp() {
    if (CFG_HELP) { setGridError(CFG_HELP); return; }
    if (correctMode === "all") setGridError(L.helpAll(CFG_PROMPT));
    else if (correctMode === "any") setGridError(L.helpAny);
    else setGridError(L.helpSpecific(correctSet.size));
  }

  function reloadGrid() {
    state.selected = new Set();
    document.querySelectorAll(".cell.selected").forEach(cell => cell.classList.remove("selected"));
    setGridError(correctMode === "all" ? L.reloadAll(CFG_PROMPT) : L.reloadOther);
  }

  function wireGrid() {
    const card = document.getElementById("grid-card");

    card.addEventListener("click", event => {
      const cell = event.target.closest("[data-cell]");
      if (cell) {
        const i = Number(cell.dataset.cell);
        setGridError("");
        if (state.selected.has(i)) state.selected.delete(i);
        else state.selected.add(i);
        cell.classList.toggle("selected", state.selected.has(i));
        return;
      }

      const button = event.target.closest("[data-action]");
      if (!button) return;
      if (button.dataset.action === "verify") verifyGrid();
      else if (button.dataset.action === "reload") reloadGrid();
      else if (button.dataset.action === "help") showHelp();
    });
  }

  /* ---------------- slider ---------------- */
  function wireSlider() {
    const input = document.getElementById("slider-input");
    const fill = document.getElementById("slider-fill");
    const readout = document.getElementById("slider-readout");
    const confirm = document.getElementById("confirm-btn");

    state.sliderVal = 0;

    function paint() {
      const value = state.sliderVal;
      fill.style.width = value + "%";
      readout.textContent = '"' + readoutFor(value, CFG_READOUTS) + '"';
      confirm.disabled = value < 100;
      confirm.textContent = value < 100 ? L.slideAll(value) : L.confirmBtn;
      confirm.style.background = value >= 100 ? "var(--red)" : "";
    }

    input.addEventListener("input", () => {
      state.sliderVal = parseInt(input.value, 10);
      paint();
    });

    document.querySelector('[data-action="reconsider"]').addEventListener("click", () => {
      state.sliderVal = Math.max(0, state.sliderVal - 25);
      input.value = String(state.sliderVal);
      paint();
    });

    confirm.addEventListener("click", () => {
      if (state.sliderVal >= 100) goToStage("reveal");
    });

    paint();
  }

  /* ---------------- reveal ---------------- */
  function wireReveal() {
    document.querySelector('[data-action="restart"]').addEventListener("click", () => {
      state.checkState = "idle";
      state.diagIdx = 0;
      state.selected = new Set();
      state.gridError = "";
      state.gridAttempts = 0;
      state.sliderVal = 0;
      state.declineDx = 0;
      state.declineDodges = 0;
      state.declineGone = false;
      goToStage("intro");
    });
  }

  const WIRING = {
    intro: wireIntro,
    grid: wireGrid,
    slider: wireSlider,
    reveal: wireReveal,
  };

  render();
})();
