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

// URL-param image overrides: ?img0=...&img1=...  (0–8)
function urlImages() {
  const out = [];
  for (let i = 0; i < 9; i++) {
    out.push(getParam("img" + i, null));
  }
  return out;
}
const URL_IMAGES = urlImages();
const CFG_IMAGES_RAW = Array.isArray(CFG.images) ? CFG.images : [];
// Merge: URL beats config beats null
const CFG_IMAGES = Array.from({length: 9}, (_, i) => URL_IMAGES[i] || CFG_IMAGES_RAW[i] || null);

const CFG_PROMPT = getParam("prompt", "") || CFG.challengePrompt || "a heart";

// Correct cells: ?cells=all | any | 0,3,8
function parseCorrect(raw) {
  if (!raw) return null;
  if (raw === "all" || raw === "any") return raw;
  const parts = raw.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  return parts.length ? parts : null;
}
const CFG_CORRECT = parseCorrect(getParam("cells", "")) || CFG.correctCells || "all";

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

/* ---------------- diagnostic messages ---------------- */
const DIAGNOSTICS = [
  "Analyzing your heart rate…",
  "Cross-referencing with my diary…",
  "Checking for red flags…",
  "Looking for someone better… none found.",
  "Asking your mom for permission…",
  "Verifying you're not my ex…",
  "Re-reading your texts from 2021…",
  "Calculating compatibility (suspiciously high)…",
];

/* ---------------- main app ---------------- */
function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const TweaksPanel = window.TweaksPanel;

  // Resolve names — URL params trump tweaks unless tweak is set
  const urlTo = getParam("to", "") || getParam("name", "");
  const urlFrom = getParam("from", "") || getParam("by", "");
  const urlMsg = getParam("msg", "") || getParam("message", "");
  const toName = (tweaks.to || urlTo || CFG.to || "You").trim();
  const fromName = (tweaks.from || urlFrom || CFG.from || "Your Secret Admirer").trim();
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
      i = (i + 1) % DIAGNOSTICS.length;
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
      setGridError(`Please select all images containing ${CFG_PROMPT}.`);
      return;
    }
    setGridAttempts(a => a + 1);
    if (correctMode === "all") {
      const remaining = 9 - selected.size;
      if (gridAttempts === 0)      setGridError(`Almost — you missed ${remaining}. Look closer.`);
      else if (gridAttempts === 1) setGridError(`Still ${remaining} more. They all have ${CFG_PROMPT}. Trust me, I checked.`);
      else                          setGridError(`${remaining} unselected. This is starting to feel personal.`);
    } else {
      if (gridAttempts === 0)      setGridError(`Not quite — try again.`);
      else if (gridAttempts === 1) setGridError(`Still wrong. Look closer.`);
      else                          setGridError(`This is starting to feel personal.`);
    }
  }

  function reloadGrid() {
    setSelected(new Set());
    setGridError(`Refreshing didn't help. ${correctMode === "all" ? "They're still all " + CFG_PROMPT + "." : "Same challenge."}`);
  }

  // slider challenge state
  const [sliderVal, setSliderVal] = useState(0);
  const sliderLabel = useMemo(() => {
    if (sliderVal < 10) return "absolutely not";
    if (sliderVal < 30) return "hmm.";
    if (sliderVal < 55) return "i guess.";
    if (sliderVal < 80) return "fine, yes.";
    if (sliderVal < 99) return "yes, obviously.";
    return "yes, a thousand times.";
  }, [sliderVal]);

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
  const stageLabel = stage === "intro" ? "01 / VERIFICATION"
    : stage === "grid" ? "02 / IMAGE CHALLENGE"
    : stage === "slider" ? "03 / FINAL CONFIRMATION"
    : "04 / VERIFIED";

  return (
    <div className="stage">
      <div className="meta-row">
        <span><span className="dot"></span>SECURE TRANSMISSION</span>
        <span>{stageLabel}</span>
      </div>

      {stage === "intro" && (
        <div className="card fade-in" key="intro">
          <div className="stamp">Priority · 1ST class</div>
          <h1 className="eyebrow">Hand-Delivered To</h1>
          <h2 className="title">{toName},<br/>you've received <em>a Valentine.</em></h2>
          <p className="subtitle">
            For security reasons, please verify you are a real human{toName !== "You" ? ` and that you are, in fact, ${toName}` : ""}. Bots have been receiving entirely too many valentines this year.
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
              {checkState === "done" ? "Verified. You seem human enough." : "I'm not a robot"}
            </div>
            <div className="captcha-brand">
              <Heart size={18} />
              <span className="logo">cuteCAPTCHA</span>
              <span className="terms">Privacy · Terms</span>
            </div>
          </div>

          <div className="status-line">
            {checkState === "loading" && (<><span className="blink">{DIAGNOSTICS[diagIdx]}</span></>)}
            {checkState === "done" && <>✓ pass. preparing challenge…</>}
          </div>

          <div className="actions">
            <span className="footnote">From {fromName}</span>
            {!declineGone ? (
              <button
                ref={declineRef}
                className="decline"
                style={{ transform: `translateX(${declineDx}px)` }}
                onMouseEnter={dodgeDecline}
                onFocus={dodgeDecline}
                onClick={(e)=>{ e.preventDefault(); dodgeDecline(); }}
              >
                {declineDodges === 0 ? "decline" : declineDodges === 1 ? "no really, decline" : "fine, decline"}
              </button>
            ) : (
              <span className="footnote" style={{opacity:0.6}}>decline button quit</span>
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
              <strong>Select all squares with</strong>
              <span className="hint"><Heart size={12} fill="#fff" style={{display:"inline",verticalAlign:"-2px",marginRight:4}}/>{CFG_PROMPT}. If there are none, click verify.</span>
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
                <button className="icon-btn" onClick={reloadGrid} title="Get a new challenge">↻</button>
                <button className="icon-btn" title="Audio challenge (unavailable)" onClick={()=>setGridError("Audio challenge unavailable. Use your eyes.")}>♪</button>
                <button className="icon-btn" title="Help" onClick={()=>setGridError(correctMode === "all" ? `Hint: every single one is ${CFG_PROMPT}.` : `Hint: look carefully.`)}>?</button>
              </div>
              <button className="verify-btn" onClick={verifyGrid}>VERIFY</button>
            </div>
          </div>
          <p className="subtitle" style={{margin:0, fontSize:12.5, color:"var(--ink-3)", textAlign:"center"}}>
            This step protects against bots <em>and</em> people with worse taste.
          </p>
        </div>
      )}

      {stage === "slider" && (
        <div className="card fade-in" key="slider">
          <h1 className="eyebrow">Final Confirmation</h1>
          <h2 className="title" style={{fontSize:36, marginBottom:18}}>
            On a scale of <em>0 to yes</em>,<br/>
            will you be {fromName !== "Your Secret Admirer" ? <>{fromName}'s</> : "my"} valentine?
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
                <span>NO</span><span>MEH</span><span>OK</span><span>SURE</span><span>YES</span>
              </div>
            </div>
            <div className="slider-readout">"{sliderLabel}"</div>
          </div>

          <div className="actions">
            <button
              className="decline"
              onClick={() => setSliderVal(s => Math.max(0, s - 25))}
              style={{textDecoration:"none"}}
            >← reconsider</button>
            <button
              className="verify-btn"
              onClick={confirmSlider}
              disabled={sliderVal < 100}
              style={{background: sliderVal >= 100 ? "var(--red)" : undefined}}
            >
              {sliderVal < 100 ? `slide all the way (${sliderVal}%)` : "CONFIRM ✓"}
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
            <p className="reveal-eyebrow">Verified · Authentic · Non-refundable</p>
            <h2 className="reveal-title">
              <span className="name">{toName}</span>,<br/>
              you are my valentine.
            </h2>
            <p className="reveal-sub">
              {message
                ? message
                : <>The system has spoken. The captcha agrees. There is no appeals process.</>}
            </p>
            <div className="signature">
              {fromName}
              <small>— sender · {new Date().toLocaleDateString(undefined,{month:"short",day:"numeric"})}</small>
            </div>

            <div style={{marginTop:24}}>
              <button
                className="decline"
                onClick={() => { setStage("intro"); setCheckState("idle"); setSelected(new Set()); setSliderVal(0); setDeclineGone(false); setDeclineDodges(0); setDeclineDx(0); }}
              >start over (you'll just end up here again)</button>
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
