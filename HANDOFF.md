# Handoff: the "link is the database" pattern

Extracted from `valentine-captcha`, with the Valentine-specific content stripped out. This describes a **project shape**, not a library: a static page whose entire content comes from its own URL, plus a builder page that produces those URLs.

Use it when you want to hand someone a personalised page — a greeting, an invitation, a quiz, a menu, a product configurator, a small report — without running a backend, without a database, and without anyone needing an account.

---

## 1. The core idea

**There is no server. The link carries everything.**

```
builder page          →      the link       →      the display page
form fields                  carries               reads the query string
→ query string               all content           → renders
```

Both pages are static files. The display page is byte-identical for every recipient; the difference comes entirely from `window.location`.

**What this buys you**

- No backend, no database, no accounts, no hosting cost beyond static files.
- Nothing can expire — there is no record anywhere that could be deleted or migrated.
- The builder can honestly say *"nothing is saved or sent anywhere"*, because nothing is.
- Trivially self-hostable: the whole product is a folder.

**What it costs you — decide this before you start, not after**

- **Nothing is private.** Everything sits readable in the URL. Whoever gets the link gets the content. Never put anything confidential in it.
- **Links get long.** A page with a lot of text and a few embedded images can reach tens of thousands of characters. Chat apps mangle them; you will end up recommending a URL shortener.
- **Share previews cannot be personalised.** `og:` tags are read by crawlers that don't run JavaScript, so every link previews identically. If per-recipient previews matter, this pattern is the wrong choice — you need server-side rendering and a `/v/<slug>` route.
- **No analytics of who opened what**, unless you add a third party and give up the privacy story.

If the last two points are dealbreakers, skip to §10.

---

## 2. Project shape

```
project/
├── index.html          ← shell: meta tags, one mount point, two scripts
├── app.js              ← all logic (plain DOM, no framework)
├── styles.css          ← all styles, including @font-face
├── config.js           ← per-instance overrides, the middle precedence layer
├── fonts/              ← self-hosted typefaces + a README with the licence
├── builder/
│   └── index.html      ← the link builder (self-contained: markup + CSS + JS)
└── README.md
```

Deliberate choices worth keeping:

- **No build step.** The files in the repo are the files you deploy. No `package.json`, nothing to install, nothing to re-run after an edit.
- **No CDN, no external fonts, no analytics.** Zero external requests means the page works offline, air-gapped, and behind restrictive proxies. It also means no third party learns who opened your link.
- **The builder is one self-contained HTML file.** Markup, styles and script in one place. It is a tool, not a product surface — keeping it in a single file makes it easy to copy into the next project.

Self-hosting the fonts is worth the ~70 KB. Fetch the subsets you need once (see `fonts/README.md` in this repo for the exact procedure — the trick is passing a modern user-agent, or Google serves legacy TTF), then declare them with `@font-face` in the stylesheet. Use paths relative to the **stylesheet**, so they resolve from `/` and `/builder/` alike.

---

## 3. Three-layer configuration

Every configurable value resolves the same way:

**URL parameter → `config.js` → built-in default**

```js
const CFG = window.APP_CONFIG || {};

function getParam(name, fallback) {
  return new URL(window.location.href).searchParams.get(name) || fallback;
}

function pick(param, cfgKey) {
  return getParam(param, "") || CFG[cfgKey] || "";
}

const CFG_TITLE = pick("title", "title");
const CFG_INTRO = pick("intro", "intro") || DEFAULTS.intro;
```

The `||` chain is the whole mechanism: an empty value falls through to the next layer. That is what lets every field in the builder be optional.

**Resolve at module level, before the first render.** These become plain constants; nothing re-reads the URL later. It keeps the render path free of configuration logic.

Why keep `config.js` at all when URL params exist? It is the seam for the "many recipients" case: serve it dynamically per slug from a backend and you get pretty URLs (`/v/abc123/`) with no change to the rest of the code. Keeping the layer costs one `||` and buys you that option later.

---

## 4. Turning strings into structure

Everything arrives as a string. Give each field type one small, well-tested parser, and make every parser fall back rather than fail.

```js
// "a, b, c" → ["a","b","c"]  (null when empty, so || falls through)
function parseList(raw) {
  if (!raw) return null;
  const parts = String(raw).split(",").map(s => s.trim()).filter(Boolean);
  return parts.length ? parts : null;
}

// "all" | "any" | "1,3,5" → mode string or 0-based index array
function parseSelection(raw) {
  if (!raw) return null;
  const mode = String(raw).trim().toLowerCase();
  if (mode === "all" || mode === "any") return mode;
  const parts = String(raw).split(",")
    .map(n => parseInt(n.trim(), 10))
    .filter(n => !isNaN(n) && n >= 1 && n <= 9)   // validate range
    .map(n => n - 1);                              // 1-based UI → 0-based code
  return parts.length ? [...new Set(parts)] : null;
}
```

Two conventions that prevented a lot of confusion:

- **1-based in everything the user touches, 0-based only inside the code.** Parameters, labels, error messages and documentation all count from 1. Convert exactly once, at the parser.
- **Invalid input degrades, never breaks.** Out-of-range numbers are dropped; if nothing valid remains, the parser returns `null` and the `||` chain supplies the default. A malformed link still renders a sensible page.

### Safe mini-markup

Senders want *some* formatting. Give them a tiny dialect — never raw HTML:

```js
const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ESCAPE_MAP[c]);

// *asterisks* → <em>, \n → <br>. Escape FIRST, then add our own markup.
function richText(text) {
  return String(text).split(/\\n|\n/).map(line =>
    esc(line)
      .split(/(\*[^*]+\*)/g).filter(Boolean)
      .map(p => p.length > 2 && p.startsWith("*") && p.endsWith("*")
        ? "<em>" + p.slice(1, -1) + "</em>"
        : p)
      .join("")
  ).join("<br>");
}
```

**The order is the security property.** Escaping never produces an asterisk, so splitting afterwards is equivalent to splitting the raw text — but nothing the sender wrote can become a tag. Reverse these two steps and you have an XSS hole that is invisible in review.

Accept both `\n` (literal backslash-n, what a single-line form field can hold) and a real newline (what `%0A` decodes to), so hand-written and builder-generated links behave identically.

---

## 5. Rendering without a framework

For anything under a few thousand lines, a framework earns nothing here and costs a CDN dependency plus a build step.

```js
const state = { stage: "start", /* … */ };

function render() {            // full rebuild — only on stage changes
  clearTimers();
  root.innerHTML = shell(SCREENS[state.stage]());
  WIRING[state.stage]();
}
```

**Redraw granularity is the one design decision that matters.** Rebuild on *stage* changes; patch individual nodes for changes *within* a stage. Rebuilding everything on every interaction causes two bugs that are easy to ship and annoying to diagnose:

- CSS entry animations replay on every click.
- A rebuild during a drag destroys the element being dragged, so range inputs and sliders break mid-stroke.

Supporting habits:

- **Event delegation per screen**, one listener on the container, `event.target.closest("[data-action]")`.
- **Register every timer** in one array and clear it on stage change, or a `setInterval` from a previous screen keeps firing into a detached DOM.
- **Escape at the boundary.** Every value that reaches `innerHTML` goes through `esc()` or `richText()`. Grep for `innerHTML` in review; each hit should have one of the two next to it.

---

## 6. The builder page

A form that produces a string. No backend, no storage.

```js
// Derive the base URL from where the builder itself is served — never hardcode
// a domain, or self-hosted copies build links pointing at your deployment.
const defaultBase = new URL("../", window.location.href).href;

function buildUrl() {
  const u = new URL(form.baseUrl.value.trim() || defaultBase);
  u.search = "";
  const setIfFilled = (k, v) => { const s = String(v || "").trim(); if (s) u.searchParams.set(k, s); };

  // Only emit what differs from the default — keeps links as short as possible.
  if (form.lang.value && form.lang.value !== "en") u.searchParams.set("lang", form.lang.value);
  TEXT_PARAMS.forEach(k => setIfFilled(k, form[k].value));
  MEDIA_PARAMS.forEach(k => setIfFilled(k, normalizeMediaUrl(form[k].value)));
  return u.toString();
}
```

Features that turned out to matter, roughly in order of value:

1. **Live preview in an iframe.** Because the link is the whole product, the preview is just `iframe.src = builtUrl`. No mocking, no separate render path — it is literally the real thing.
2. **Import: parse a finished link back into the form.** Lets people edit a link they already sent instead of starting over, and lets a demo double as a starting template. Clear every field first, then apply, so the form shows *that link and nothing else*. Reject junk without wiping the form. Test the round-trip: build → import → rebuild must produce an identical URL.
3. **Only emit non-default parameters.** Shorter links, and the resulting URL reads as a diff from the defaults.
4. **A live demo embedded in the builder.** One long finished link, in an iframe, with a button that loads it into the form.
5. **Copy and Open buttons.** Trivial, used constantly.
6. **Normalise media URLs on the way out** (§7), and *say so* in the UI when you rewrite something the user pasted — otherwise the finished link looks unexpectedly different from their input.

Placeholders on every field showing a realistic example are worth more than help text.

---

## 7. Images — the part that will cost you a day

This is the hardest-won knowledge in the whole project. Media is where a URL-parameter product actually breaks.

### The rule

The link must point **straight at the image file** and work for a stranger who is not logged in. Test in a **private/incognito window**: bare picture and nothing else = good. A page containing the picture, a login screen, or a preview page = broken.

Also: **`https://` only.** The page is served over HTTPS and browsers silently block plain-`http` images inside it. Silently — no error, just an empty box.

### Google Drive: the trap worth knowing

The advice everywhere on the internet is to convert a share link to `drive.google.com/uc?export=view&id=FILE_ID`. **This does not work for embedding**, and it fails in the most confusing way possible: it looks perfect when you open it in a tab, and renders as a blank square inside your page.

```
uc?export=view  →  303  →  drive.usercontent.google.com/download?…
                           cross-origin-resource-policy: same-site   ← browser refuses
```

`CORP: same-site` tells the browser to allow the resource only on Google's own pages. A top-level navigation is not a cross-origin embed, so opening it in a tab is fine — which is exactly why people conclude the URL is good.

**What works:** the thumbnail endpoint, which serves the same bytes without that header.

```
https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
https://lh3.googleusercontent.com/d/FILE_ID=w1000        (equivalent, what the above redirects to)
```

Verify a claim like this with `curl -sIL` and look at the actual response headers, then confirm in a real cross-origin page. Both steps — the header told us *why*, the browser told us *whether*.

### Auto-detect and rewrite

Don't document a manual conversion; do it for the user.

```js
const DRIVE_SIZE = "w1000";

// Returns the file ID if this is a Drive link that still needs converting.
function driveFileId(raw) {
  const v = String(raw || "").trim();
  if (!/^https?:\/\/(drive|docs)\.google\.com\//i.test(v)) return null;
  if (/\/thumbnail\?/i.test(v)) return null;                    // already converted
  const path = v.match(/\/(?:file|d)\/d?\/?([A-Za-z0-9_-]{10,})/);
  if (path) return path[1];
  const query = v.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  return query ? query[1] : null;
}

function normalizeMediaUrl(raw) {
  const id = driveFileId(raw);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=${DRIVE_SIZE}`
            : String(raw || "").trim();
}
```

Required properties, all worth a test each: **idempotent** (converted links pass through unchanged), **inert on everything else** (other hosts, `data:` URIs, empty strings untouched), and it must cover every shape Google hands out — `/file/d/ID/view?usp=sharing`, `?usp=drive_link`, `/preview`, `open?id=`, and the broken `uc?export=view` form.

The sharing setting is the user's job and the only thing they can still get wrong: **"Anyone with the link"**, not "Restricted".

### Other sources

| Source | How to get a direct link |
|---|---|
| Wikimedia Commons | Right-click the image → *Copy image address* (`upload.wikimedia.org/…`). Free, permanent, unmetered — the most reliable option. |
| Dropbox | Share link, change `?dl=0` → `?raw=1` |
| Imgur | The `i.imgur.com/….jpg` form, not the gallery page |
| GitHub | Commit to a public repo, open the file, **Raw** button |
| Netlify Drop | Drag a folder of images on, get public URLs in seconds, no account |
| **Never works** | Google Photos and iCloud share links (those are album *pages*), anything behind a login |

### Embedding images in the link itself

A `data:image/webp;base64,…` URI can go straight into a parameter. Nothing is hosted, nothing expires, nothing is uploaded to a third party — the picture travels inside the link.

The cost is length: base64 inflates by ~33%, and URL-encoding inflates again. A 3 MB photo adds roughly 4 million characters; a 20 KB thumbnail adds about 27 000. Shrink aggressively first, to whatever size the layout actually displays:

```bash
magick photo.jpg -resize 400x400^ -gravity center -extent 400x400 -quality 70 out.webp
python3 -c "import base64,urllib.parse; \
  print(urllib.parse.quote('data:image/webp;base64,'+base64.b64encode(open('out.webp','rb').read()).decode(), safe=''))"
```

Warn people off browser-based base64 converters unless they explicitly convert locally — most upload the file to a server, which defeats the entire point.

Mixing sources works well: hosted URLs for most slots, a `data:` URI for the one image nobody should be able to find on the open internet.

---

## 8. Security checklist

Short, because the attack surface is small — but each item is real.

- [ ] **Every sender-supplied value is escaped before it reaches the DOM.** No exceptions, no "this one is just a name".
- [ ] **Mini-markup escapes before it adds markup** (§4). This is the single most likely place to introduce a hole.
- [ ] **No secrets in URLs, ever.** The link is public by construction. Also assume it lands in browser history, referrer headers, chat previews and server logs.
- [ ] **Media URLs are attacker-controlled too.** They end up in `src` attributes; escape the attribute value so nothing can break out of the quotes.
- [ ] **Validate and clamp everything numeric** at the parser, then fall back to a default.
- [ ] If you later add a backend for slugs, remember you have just created a database of personal messages — with the retention and GDPR obligations that come with it. The no-backend version has none.

---

## 9. Testing without a test framework

The whole app is one `<script>` in one HTML file, which makes it easy to test in Node with a ~20-line DOM shim: fake `document.getElementById`, a `form` object with named fields, then `new Function(script + "; return { …internals }")()`. Good enough to assert on parsers, URL building and the import round-trip.

What is genuinely worth automating:

- Parser table tests — every input shape → expected output, including the ones that must be left untouched.
- Build → import → rebuild produces an identical URL.
- Media normalisation is idempotent and inert on non-matching input.

What needs a real browser, because a shim will lie to you:

- Whether an image actually renders (a `naturalWidth > 0` check on a cross-origin page — this is how the Drive problem was found, and *only* how).
- That the entry animation doesn't replay on in-stage updates.
- That dragging a slider isn't interrupted.
- That sender-supplied `<b>` renders as literal text and an injected `<script>` does not execute.

---

## 10. When to abandon this pattern

Be honest about this early; migrating later is a rewrite of the delivery layer, not of the product.

| Signal | What you need instead |
|---|---|
| Share previews must show the recipient's name/photo | SSR with a `/v/<slug>` route — crawlers don't run JS, so nothing client-side can fix it |
| Links are too long to send | A slug + a data store (the `config.js` seam from §3 is where this plugs in) |
| Content is confidential | Any URL-parameter design is wrong; you need auth |
| You need to know who opened it | A backend, and a privacy policy to match |
| Users upload photos rather than paste links | File storage, and now you have uploads, quotas and moderation |

If two or more of these apply, start with a server-rendered app. If none do, this pattern will carry the whole product with a fraction of the moving parts.

---

## 11. Starting a new one

1. Copy `index.html`, `styles.css`, `app.js`, `config.js`, `fonts/`, `builder/index.html`.
2. Rename `window.APP_CONFIG` and strip the domain-specific strings.
3. Define your parameter table first — name, meaning, example, default — **before writing any code**. It is the product's real API and doubles as the README section and the builder's field list.
4. Port the helpers unchanged: `getParam`, `pick`, `parseList`, `esc`, `richText`, `normalizeMediaUrl`. They carry the accumulated bug fixes.
5. Write the screens, then the builder fields to match.
6. Test the round-trip and the media normalisation before anything cosmetic.

Keep the parameter table, the builder fields, and the documentation in sync — when they drift, the builder silently stops emitting something the page still reads, and nobody notices until a link renders wrong.
