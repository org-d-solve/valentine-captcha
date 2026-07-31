# 💌 Valentine Verification


# Next steps
- add stripe donations to the configuration page

A faux-reCAPTCHA Valentine page. Recipients have to "verify they're human" by clicking a fake captcha, selecting all 9 squares (every single one secretly contains a heart), and dragging a slider all the way to "yes" — then they're told they're your valentine. The decline button skitters away when you try to click it.

Available in **English and German**, and every text on the page can be replaced with your own wording.

> ### 🔗 Try it now: [**love.d-solve.de/customize**](https://love.d-solve.de/customize)
> Fill in a form — language, names, wording, challenge, pictures — and get your finished link instantly. No URL-encoding, no query-string syntax.

> ### 👀 See a finished one first: [**open the live demo**][demo]
> A real Valentine with every parameter filled in — German throughout, custom wording on every screen, only squares 1, 3 and 5 count as correct, and a picture grid mixing all three sources you can use: photos hosted on a website, an image from Wikipedia, and a few squares carrying their picture inline in the link itself. It's an ordinary link, exactly what the customize page produces — just a very long one.

Use a url shortener like [this](https://www.shorturl.at/) to short the url when you want to send nice links. 

This page is already hosted at **[love.d-solve.de](https://love.d-solve.de)** — most people just need the first section below. If you want to run your own copy instead, skip to [For developers](#-for-developers--self-hosting-this-project).

---

# ❤️ For users — sending a Valentine via love.d-solve.de

You don't need to install or deploy anything.

## The easy way — the customize page

Go to **[love.d-solve.de/customize](https://love.d-solve.de/customize)**, fill in the form, copy the link it builds. Every field explains itself, the [demo][demo] runs live in a frame at the top, and you can paste a finished link back in to edit one you already made.

Everything from **"The basics"** onward is for building the link by hand instead, or for understanding what that page produces.

## The basics

```
https://love.d-solve.de/?to=Sarah&from=Alex&msg=Be%20mine%20pls
```

Open that in a browser (or send it to someone) and it just works.

**Full parameter list.** Every one of these is optional — leave it out and you get the built-in text for the chosen language.

| Param | What it does | Example |
|---|---|---|
| `lang` | Language of every built-in text: `en` (default) or `de` | `?lang=de` |
| `to` | Recipient's name (shown big at the top + reveal) | `?to=Sarah` |
| `from` | Sender's name (shown in the intro footer + reveal signature) | `?from=Alex` |
| `title` | Intro headline, printed after "*name*," | `?title=you've%20received%20*a%20Valentine.*` |
| `subtitle` | Intro paragraph (the mock security notice) | `?subtitle=Verification%20required.` |
| `prompt` | What the captcha asks the user to find | `?prompt=a%20red%20flag` |
| `hint` | Second, smaller line of the challenge header — **always visible** | `?hint=Pick%20carefully.` |
| `help` | Message shown only when the recipient clicks the **?** button | `?help=Only%20our%20holiday%20photos.` |
| `cells` | Which squares must be selected to pass | `?cells=all` · `?cells=any` · `?cells=1,2,5` |
| `img1` … `img9` | Picture URL for each square (1 = top-left, 9 = bottom-right) | `?img1=https://i.imgur.com/abc.jpg` |
| `question` | The headline above the slider | `?question=Really%2C%20*yes%20or%20no*%3F` |
| `scale` | Comma-separated labels under the slider track | `?scale=NO%2CMAYBE%2CYES` |
| `readouts` | Comma-separated phrases shown as the slider moves, 0 % → 100 % | `?readouts=nope%2Csure%2Cabsolutely` |
| `reveal` | Final headline, printed after "*name*," | `?reveal=you%20are%20my%20valentine.` |
| `msg` | Message under the final headline | `?msg=Be%20mine` |

**Two different hints.** `hint` sits in the challenge header permanently; `help` only appears when the recipient presses **?**. Set one, the other, or neither — an empty `help` defaults to a description of the challenge you actually configured, so it isn't the same sentence every time.

**Formatting** works in `title`, `subtitle`, `hint`, `question` and `reveal`: wrap a phrase in `*asterisks*` to render it in the italic accent colour, and use `\n` to force a line break. Plain text only — HTML is never interpreted. The remaining fields (`to`, `from`, `prompt`, `help`, `scale`, `readouts`, `msg`) are taken literally.

**Encoding rules:** URL-encode spaces (`%20`), commas (`%2C`), `&`, `=`, etc. In JavaScript: `encodeURIComponent("Be mine!")`.

Don't want to encode it by hand? Paste the raw value into an online encoder like **[urlencoder.org](https://www.urlencoder.org/)**, copy the encoded result, and drop that into the parameter instead — or just use the [customize page](https://love.d-solve.de/customize), which does all of this for you.

## Which squares are which

Squares are numbered **1–9**, left-to-right and top-to-bottom — the same numbering the customize page shows, and the same numbering `cells` and `img1`…`img9` use:

```
 1  2  3
 4  5  6
 7  8  9
```

So `?cells=1,2,5` means the recipient has to select the top-left, top-middle and centre square — nothing else — to pass.

## Adding your own pictures to the grid

Each `img1` … `img9` parameter takes the URL of a picture for that square.

**The one rule:** it has to be a link that points *directly at the image file* and that works for a stranger who isn't logged in. If you see a web page *containing* the picture, a login screen, or a "preview" page, it will show up as a broken square. See [Where to get a public image link](#-where-to-get-a-public-image-link) below.

For example, using [dummyimage.com](https://dummyimage.com) as quick placeholder pictures:

```
img1 = https://dummyimage.com/600x400/000/fff&text=test-image-1
img2 = https://dummyimage.com/600x400/000/fff&text=test-image-2
img3 = https://dummyimage.com/600x400/000/fff&text=test-image-3
```

…and so on up to `img9` (just bump the number in `text=test-image-N`).

**Important:** those placeholder URLs contain their own `&`, which would otherwise get parsed as the start of a new URL parameter. URL-encode the whole image URL before dropping it into the `love.d-solve.de` link — encode `://`, `/`, `&`, `=` as `%3A%2F%2F`, `%2F`, `%26`, `%3D` respectively.

**Full worked example** — a Valentine for Sarah, from Alex, with three placeholder pictures and the rest falling back to the default heart:

```
https://love.d-solve.de/?to=Sarah&from=Alex&msg=Be%20mine%3F&img1=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-1&img2=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-2&img3=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-3
```

Paste that straight into a browser — it renders immediately, no setup needed. Swap `img1`/`img2`/`img3` for real photo URLs when you're ready to send the real thing. Squares left unset just show the built-in SVG heart, which already looks nice on its own.

## 🌐 Where to get a public image link

A photo sitting on your phone or laptop has no URL, so it has to go somewhere public before it can go in the grid. The [customize page](https://love.d-solve.de/customize) keeps the recipes right next to the picture fields — how to get a direct link out of Wikimedia Commons, Google Drive, Dropbox, Imgur, GitHub or your own host, and which links can never work (Google Photos and iCloud share *albums*, not files, and anything behind a login is a broken square for the recipient).

Three rules decide whether a square shows up at all:

- **The link has to point straight at the image file**, not at a page containing it. Test it in a **private/incognito window** — if you see the bare picture and nothing else, it works.
- **`https://`, never `http://`.** The page is served over HTTPS, and browsers silently block plain-`http` images inside it.
- **Building the link by hand adds one more:** an image URL containing its own `&` or `=` must be URL-encoded first ([see above](#adding-your-own-pictures-to-the-grid)), or it gets cut off mid-link. The customize page does that for you.

**Google Drive is handled natively.** Paste a share link into any square on the customize page exactly as Google gives it to you (`drive.google.com/file/d/FILE_ID/view?usp=sharing`) — the page recognises it, pulls the file ID out and writes `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000` into the finished link instead. It also fixes up the `open?id=` and `uc?export=view` forms. All the recipient needs is that the file is shared with **"Anyone with the link"**.

That detour is necessary, not cosmetic: Drive's `uc?export=view` endpoint answers with `cross-origin-resource-policy: same-site`, so a browser refuses to render it inside another site. The link looks perfect when you open it in a tab and still leaves a blank square in the grid — which is exactly what makes it worth automating. If you're writing the URL by hand, use the `thumbnail?id=…` form yourself.

### Or skip hosting entirely: put the picture *inside* the link

An image can be embedded directly in the URL as a `data:` URI, which is what several squares of the [demo][demo] do. Nothing is hosted anywhere, nothing can expire or go offline, and nothing is uploaded to a third party — the picture travels inside the link itself.

The trade-off is size. Every image roughly doubles in length as base64, and the demo link ends up around 45 000 characters. That still works when pasted into a browser, but chat apps, mail clients and link previews will often mangle or truncate it. Shrink hard first — a captcha square is displayed at roughly 200×200 pixels, so there's no reason to embed anything bigger:

```bash
# shrink to a 400×400 square, then print a ready-to-paste, URL-encoded data: URI
magick photo.jpg -resize 400x400^ -gravity center -extent 400x400 -quality 70 square.webp
python3 -c "import base64, urllib.parse; \
  d = base64.b64encode(open('square.webp','rb').read()).decode(); \
  print(urllib.parse.quote('data:image/webp;base64,' + d, safe=''))"
```

Paste the result as the value of `img1` … `img9`. (If you're using the [customize page](https://love.d-solve.de/customize), paste the *un*-encoded `data:image/webp;base64,…` form into the square's box instead — it encodes it for you.) A handful of these are fine; nine is what makes a link enormous. Mixing sources works too: hosted URLs for most squares, a `data:` URI for the one photo you don't want to put on the internet.

## Every parameter in one URL

Here's the whole lot set at once — German, both names, all wording replaced, a custom challenge, three specific squares to select, and all nine grid pictures:

**Plain values (before encoding):**

| Param | Value |
|---|---|
| `lang` | `de` |
| `to` | `Sarah` |
| `from` | `Alex` |
| `title` | `du hast *einen Gruß* bekommen.` |
| `subtitle` | `Aus Sicherheitsgründen bitte kurz bestätigen, dass du echt bist.` |
| `prompt` | `eine gemeinsame Erinnerung` |
| `hint` | `Wenn keine dabei sind, klicke auf Bestätigen.` |
| `cells` | `1,2,5` — top-left, top-middle and centre square |
| `img1` … `img9` | `https://dummyimage.com/600x400/000/fff&text=test-image-1` … `test-image-9`, one per square |
| `question` | `Auf einer Skala von *0 bis ja*,` + line break + `willst du mein Valentinsschatz sein?` |
| `scale` | `NEIN,HMM,OK,KLAR,JA` |
| `readouts` | `absolut nicht,hmm.,na gut.,ja klar.,ja tausendmal.` |
| `reveal` | `du bist mein *Valentinsschatz.*` |
| `msg` | `Für immer deine?` |

**As one link** (values URL-encoded — spaces to `%20`, commas to `%2C`, `?` to `%3F`, the line break to `%0A`, umlauts to their UTF-8 escapes, and each image URL's own `://`, `/`, `&`, `=` to `%3A%2F%2F`, `%2F`, `%26`, `%3D`):

```
https://love.d-solve.de/?lang=de&to=Sarah&from=Alex&title=du%20hast%20*einen%20Gru%C3%9F*%20bekommen.&subtitle=Aus%20Sicherheitsgr%C3%BCnden%20bitte%20kurz%20best%C3%A4tigen%2C%20dass%20du%20echt%20bist.&prompt=eine%20gemeinsame%20Erinnerung&hint=Wenn%20keine%20dabei%20sind%2C%20klicke%20auf%20Best%C3%A4tigen.&cells=1%2C2%2C5&img1=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-1&img2=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-2&img3=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-3&img4=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-4&img5=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-5&img6=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-6&img7=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-7&img8=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-8&img9=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-9&question=Auf%20einer%20Skala%20von%20*0%20bis%20ja*%2C%0Awillst%20du%20mein%20Valentinsschatz%20sein%3F&scale=NEIN%2CHMM%2COK%2CKLAR%2CJA&readouts=absolut%20nicht%2Chmm.%2Cna%20gut.%2Cja%20klar.%2Cja%20tausendmal.&reveal=du%20bist%20mein%20*Valentinsschatz.*&msg=F%C3%BCr%20immer%20deine%3F
```

Paste that in as-is — the whole page comes up in German, every square shows its own placeholder picture (`test-image-1` through `test-image-9`, left-to-right top-to-bottom), and only squares 1, 2 and 5 need to be selected to pass. Swap any value for your own; drop any parameter you don't care about and its built-in text comes back.

## 🧪 Before you send it

- [ ] Open the link yourself in an incognito window — check the language, name and wording render.
- [ ] Click the "I'm not a robot" box → wait for the loader → see the image grid.
- [ ] **Actually solve your own challenge.** With `cells=all` select all 9; with a list like `cells=1,2,5` select exactly those squares, counting [1–9 as shown above](#which-squares-are-which) — then "VERIFY".
- [ ] Drag slider all the way → "CONFIRM" → reveal screen with the recipient's name.
- [ ] Paste the link into Slack or iMessage to check the share preview looks right.
- [ ] Try the "decline" button — it should skitter away.

## 🩹 Troubleshooting

**Images don't load**
Open the image URL on its own in a **private/incognito window** — incognito matters, because a link that works for you may only work because you're logged in. Then:

- Nothing but a broken image, a login screen, or a web page *around* the photo → the URL isn't a direct link to the file. See [Where to get a public image link](#-where-to-get-a-public-image-link).
- The URL starts with `http://` → it's blocked as mixed content inside the HTTPS page. You need `https://`.
- It loads perfectly on its own but not inside the grid → your `&` or `=` probably wasn't URL-encoded (see above), so the link got cut off mid-URL.

**Share preview (Slack/iMessage/Twitter) won't update**
Social platforms cache aggressively per-URL. Append a throwaway parameter like `&v=2` to force a fresh preview, or use the platform's own debugger:
- Slack: paste the URL into a private chat, click "Re-fetch"
- Twitter/X: [card validator](https://cards-dev.twitter.com/validator)
- Facebook: [sharing debugger](https://developers.facebook.com/tools/debug/)

**Captcha won't pass no matter what I click**
You've set `cells` to a specific list and are selecting the wrong squares. Squares count **1–9**, left-to-right and top-to-bottom: row 1 = `1,2,3`, row 2 = `4,5,6`, row 3 = `7,8,9`. You have to select *exactly* the listed squares — no more, no fewer. Numbers outside 1–9 are ignored, and if none of them are valid the challenge silently falls back to `all` (select all 9).

**A wording field shows literal `*asterisks*` or `\n`**
Formatting only applies to `title`, `subtitle`, `hint`, `question` and `reveal`. Everything else — including `help`, `prompt`, `scale` and `readouts` — is printed exactly as typed.

**My custom hint isn't the one I expected to see**
There are two: `hint` sits in the challenge header permanently, `help` only appears after pressing **?**. Setting one leaves the other at its default.

---

# 🛠 For developers — self-hosting this project

Want to run your own copy instead of using `love.d-solve.de`? It's a static site — everything below assumes you're working from source.

## 📁 File structure

```
valentine-captcha/
├── index.html          ← the page itself (links to everything else)
├── styles.css          ← all styles
├── config.js           ← ★ per-recipient settings (names, message, images)
├── app.jsx             ← the app logic (don't edit)
├── tweaks-panel.jsx    ← dev-only panel, harmless in prod (don't edit)
├── favicon.svg         ← browser tab icon
├── og-image.png        ← share preview (Slack/iMessage/Twitter), 1200×630
├── customize/
│   └── index.html      ← the link-builder form at /customize
└── README.md           ← this file
```

All files live in the same folder. Relative paths in `index.html` resolve to siblings, so don't shuffle them around.

## ⚙️ How it works

There is no server anywhere in this project. **The link is the database.**

```
customize/index.html    →    the link    →    index.html + app.jsx
form fields → a string       carries           reads the string →
                             everything        renders the page
```

**The customize page only builds a string.** `buildUrl()` reads the form fields and appends them as query parameters. No `fetch`, no storage, no backend — that's why the page can honestly say nothing is saved or sent anywhere. Its only cleverness is URL-encoding and the Google Drive rewrite.

**The Valentine page reads itself out of the address bar.** `index.html` is byte-identical for every recipient; the entire difference comes from `window.location`:

```js
function getParam(name, fallback) {                        // app.jsx:13
  const u = new URL(window.location.href);
  return u.searchParams.get(name) || fallback;
}
```

That runs **at module level, before React renders** — the `CFG_*` constants (`app.jsx:183–219`) are resolved once at load and are plain values by the time any component sees them.

**One line decides where each value comes from** (`app.jsx:179`):

```js
function pick(param, cfgKey) {
  return getParam(param, "") || CFG[cfgKey] || "";
}
```

URL parameter → `config.js` → the built-in text of the active language. The `||` chain is what makes an empty field fall through to the next level, which is why every input on the customize page is optional.

**Four small translators turn strings into structure:**

| What | Where | From | To |
|---|---|---|---|
| `RichText` | `app.jsx:223` | `you are my *valentine.*\nreally` | `<em>` + `<br>` — never raw HTML |
| `parseList` | `app.jsx:21` | `"NO, MEH, YES"` | `["NO","MEH","YES"]` |
| `parseCorrect` | `app.jsx:208` | `"1,3,5"` | `[0,2,4]` (0-based internally) |
| image merge | `app.jsx:195–203` | `img1`…`img9` | 9-slot array, empty → heart SVG |

`LANG` (`app.jsx:31`) is resolved first of all and also sets `document.title` and `<html lang>`. The rest is a small state machine: `stage` runs `intro` → `challenge` → `slider` → `reveal`.

**What follows from this design:**

- Nothing can expire — there's no record anywhere that could be deleted.
- Nothing is private. Everything sits visibly in the URL; whoever has the link has the content.
- Links get long, and a `data:` URI image is expensive because it literally *is* part of the address.
- The preview frame on the customize page needs no trickery: it just loads the finished URL.
- **Share previews can't be personalised.** The `og:` tags in `index.html` are static, and crawlers don't run JavaScript, so every link previews as the same generic card. Only the `config.js` route (below) can fix that.

## 🪶 Making it lighter: dropping React

React and Babel are the whole weight of this project, and the app doesn't really use them:

| | Downloaded on every page load |
|---|---|
| `babel.min.js` | **2.99 MB** |
| `react` + `react-dom` | 0.14 MB |
| all of your own files | 0.07 MB |

Roughly **3.2 MB to run a four-step wizard** — and Babel compiles the JSX in the visitor's browser each time. For 12 `useState`, 4 `useEffect`, 3 `useMemo` and 2 `useRef` across four screens, a framework buys close to nothing. Plain DOM code would be about **45 KB total, with no CDN dependency and still no build step.**

### Migration plan — vanilla HTML/CSS/JS

The rewrite is smaller than it looks, because the interesting half of `app.jsx` is already plain JavaScript.

**1. Port lines 1–219 unchanged.** `getParam`, `parseList`, `LANG`, `STRINGS`, `pick`, `urlImages`, `parseCorrect` and all the `CFG_*` constants contain no JSX and no React. Copy them into `app.js` verbatim. That's a third of the file done with zero risk, and it's the part that actually defines the product's behaviour.

**2. Replace the 12 `useState` with one state object and one `render()`.**

```js
const state = { stage: "intro", checkState: "idle", selected: new Set(),
                sliderVal: 0, /* … */ };

function setState(patch) {
  Object.assign(state, patch);
  render();
}
```

Every `setX(value)` becomes `setState({ x: value })`. There are only four screens and they're mutually exclusive, so re-rendering the whole card on each change is fine — no diffing needed.

**3. Turn the 149 JSX tags into strings.** Each screen becomes a function returning HTML, with one escaping helper so user text can never inject markup:

```js
const esc = s => String(s).replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function introScreen() {
  return `<div class="card">
            <h1>${esc(toName)}, ${richText(CFG_TITLE)}</h1>
            …
          </div>`;
}
```

`RichText` becomes a `richText()` function that escapes first and only then swaps `*…*` for `<em>` and `\n` for `<br>` — same guarantee as today, that user input is never treated as HTML. **Do this part carefully:** it is the one place where the rewrite can introduce a security bug that React was silently preventing.

**4. Events by delegation instead of props.** One listener on the container handles every screen:

```js
root.addEventListener("click", e => {
  const cell = e.target.closest("[data-cell]");
  if (cell) toggleCell(Number(cell.dataset.cell));
});
```

**5. Drop `useEffect`.** The four of them are a timer (loader diagnostics), a slider watcher, the confetti spawn and the title setter — all straightforward `setInterval` / `addEventListener` calls placed right after the render that needs them. Remember to `clearInterval` on stage changes.

**6. Strip `index.html`.** Delete the three CDN `<script>` tags, change `type="text/babel"` to a plain `<script src="app.js">`, and delete `tweaks-panel.jsx` (dev-only, 23 KB). Nothing else in the file changes.

**7. Verify against the existing checklist** in [Test it locally](#-test-it-locally) — it already covers every screen, both languages and the challenge modes. Extra things to check because they're the easiest to get wrong: the slider's live readout, the dodging decline button, confetti on reveal, and that a `*starred*` phrase renders italic while a literal `<b>` in a name renders as text.

**What does *not* change:** `styles.css`, `config.js`, `customize/index.html`, the URL parameters, and every link anyone has already sent. This is purely an implementation swap — the product stays identical.

**Realistic scope:** ~490 lines of JSX become roughly the same amount of DOM code. Half a day, and the result has no build step, no CDN dependency, and works offline.

## 🚀 Deploy

Built as static HTML + JS + CSS. **No build step, no backend required.** Drop it on any host — the files in this repo are the files you deploy, byte for byte. There is no `package.json`, no bundler, no compile output, and nothing to install; `npm`/`npx` shows up below only in optional one-liners (a local web server, a syntax check).

### What "no build step" actually costs you

The JSX is never compiled ahead of time — `index.html` pulls React and **Babel Standalone** from a CDN and Babel compiles `app.jsx` and `tweaks-panel.jsx` *in the visitor's browser*, every single page load. That's what removes the build step, and it's worth knowing what you're trading for it:

- **The page needs the internet at load time, not just at deploy time.** It fetches React, ReactDOM and Babel from `unpkg.com`, plus the two typefaces from Google Fonts. If those are unreachable — offline, air-gapped network, a corporate proxy, an ad-blocker that blanket-blocks CDNs — the page comes up blank. Self-hosting the files doesn't change that; the dependencies still come from outside.
- **Every visitor downloads and runs a compiler.** `babel.min.js` alone is **3.0 MB** (React and ReactDOM add ~140 KB between them), and the JSX compile costs a moment on load. Babel's own documentation says not to do this in production. For a Valentine that one person opens once, it's completely fine — it's simply the reason you wouldn't build a high-traffic product this way.
- **Availability is someone else's uptime.** The CDN URLs pin exact versions (`react@18.3.1`, `@babel/standalone@7.29.0`), so nothing shifts under you — but `unpkg.com` being reachable is out of your hands.

If any of that bothers you, you can opt into a build. Compile the JSX once:

```bash
npx esbuild app.jsx tweaks-panel.jsx --loader:.jsx=jsx --outdir=dist
```

That writes plain-JS `dist/app.js` and `dist/tweaks-panel.js` that still expect `React` as a global. Then download `react.production.min.js` and `react-dom.production.min.js` next to your files, and in `index.html` point the two React `<script src>` tags at the local copies, delete the Babel `<script>` tag entirely, and replace the two `type="text/babel"` tags with ordinary `<script src="dist/app.js"></script>` / `<script src="dist/tweaks-panel.js"></script>`. Now nothing is fetched from a CDN at load time (except the Google Fonts `<link>`, which you can drop or self-host the same way).

That's a real build step you'd have to re-run after every edit — which is exactly what the project avoids by default. **Vanilla deployment needs none of it.**

### One-click hosts

- **[Netlify Drop](https://app.netlify.com/drop)** — drag the folder onto the page, done. You get a public URL in seconds.
- **[Vercel](https://vercel.com/)** — `vercel deploy` from the folder, or drag-and-drop in their dashboard.
- **[GitHub Pages](https://pages.github.com/)** — push the folder to a repo, enable Pages on the `main` branch.
- **Cloudflare Pages**, **Surge**, **Render**, **Fly static** — same drill.

### Your own server (nginx, Caddy, Apache, etc.)

Just point a directory at the folder. Example nginx, serving it under a custom subdomain the way `love.d-solve.de` does:

```nginx
server {
  listen 80;
  server_name love.example.com;
  root /var/www/valentine-captcha;
  index index.html;
}
```

Make sure `.js` is served with `Content-Type: text/javascript` (most servers do this by default).

## 👀 Test it locally

### 1. Start a static server

**You cannot just double-click `index.html`** — browsers block the in-browser Babel transform over `file://` and you'll get a blank page. Serve the folder over HTTP instead. From inside the project folder:

```bash
python3 -m http.server 8000     # or: npx serve .   /   php -S localhost:8000
```

Leave it running. Stop it with `Ctrl+C` when you're done.

### 2. Open the two pages

| URL | What you should see |
|---|---|
| <http://localhost:8000/> | The Valentine page itself, English defaults |
| <http://localhost:8000/customize/> | The link builder form |

The customize page derives its base URL from wherever it's served, so on localhost it builds `http://localhost:8000/?…` links — its **Open ↗** button and preview frame test your local copy, not the live site.

### 3. Smoke-test checklist

Fastest path: open `/customize/`, fill a few fields, hit **Open ↗**. To test a specific thing directly, these URLs each isolate one feature:

```bash
# names on the intro + reveal screen
http://localhost:8000/?to=Sarah&from=Alex

# everything in German
http://localhost:8000/?lang=de

# specific squares: you must select squares 1, 2 and 5 — nothing else — to pass
http://localhost:8000/?cells=1,2,5

# the two hints are independent: one is always visible, one is behind "?"
http://localhost:8000/?cells=1,2,5&hint=Only%20the%20top%20row.&help=Just%20our%20trip%20photos.

# your own pictures in the grid
http://localhost:8000/?img1=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-1
```

Then walk the flow and check:

- [ ] **Footer** — "powered by d-solve.de" is visible without scrolling, right under the card.
- [ ] Click "I'm not a robot" → loader cycles diagnostics → the image grid appears.
- [ ] **The challenge is passable.** With `cells=all` select all 9; with `cells=1,2,5` select exactly squares 1, 2 and 5 ([numbering](#which-squares-are-which)) → "VERIFY" advances to the slider.
- [ ] Press **?** — the message reflects the challenge you configured (or your `help` text), and differs from the always-visible `hint` line.
- [ ] Drag the slider fully right → "CONFIRM" → reveal screen with the recipient's name and confetti.
- [ ] Hover "decline" a few times — it dodges, then gives up.
- [ ] With `?lang=de`, every button, error and loading message is German — and the browser tab title too.

### 4. If the page is blank

Open the browser console (F12). A `SyntaxError` pointing at a `.jsx` file means the JSX didn't compile; anything about `file://` means you skipped step 1. To check the JSX compiles without a browser at all:

```bash
npx esbuild app.jsx --loader:.jsx=jsx --outfile=/dev/null
```

## 🎨 Personalising it

The [user section above](#-for-users--sending-a-valentine-via-loved-solvede) covers URL parameters, which work on any deployment, not just `love.d-solve.de`. The `/customize` page (`customize/index.html`) comes along with the rest of the site and works out of the box on your own deployment too — it detects its own base URL from wherever it's hosted, so `https://your-domain.com/customize` builds links against `https://your-domain.com/` automatically. As a host you also get two more options:

### Option 2 — Edit `config.js` by hand

Good for a single recipient where you want pretty URLs (no params).

Open `config.js` and fill it in:

```js
window.VALENTINE_CONFIG = {
  language: "de",          // "en" (default) | "de"

  to:   "Sarah",
  from: "Alex",
  message: "The captcha agrees. There is no appeal.",

  images: [                // images[0] is the square labelled 1
    "https://dummyimage.com/600x400/000/fff&text=test-image-1",
    "https://dummyimage.com/600x400/000/fff&text=test-image-2",
    null,                  // null = use the cute default heart placeholder
    "https://dummyimage.com/600x400/000/fff&text=test-image-4",
    null, null, null, null, null,
  ],

  challengePrompt: "our cat",
  correctCells: "all",     // "all" | "any" | [1, 4, 9]  ← squares 1–9

  // Wording — all optional, empty falls back to the built-in text
  title:    "you've received *a Valentine.*",
  subtitle: "",
  hint:     "If there are none, click verify.",   // always visible
  help:     "",                                   // only on the "?" button
  question: "On a scale of *0 to yes*,\nwill you be mine?",
  reveal:   "you are my valentine.",
  scale:    ["NO", "MEH", "OK", "SURE", "YES"],
  readouts: ["absolutely not", "hmm.", "i guess.", "yes, a thousand times."],
};
```

Two things behave differently here than in URL parameters:

- Image URLs and list values are plain JavaScript — no URL-encoding, and `scale`/`readouts` are real arrays instead of comma-separated strings (so a label may contain a comma).
- `correctCells` takes a real array, still numbered **1–9** like everywhere else: `[1, 4, 9]` means top-left, middle-left and bottom-right.

Then redeploy. Anything left empty (`""`) or `null` falls back to URL params or built-in defaults.

**Precedence (highest wins):** URL parameter → `config.js` value → built-in text for the active language.

### Option 3 — Server-render `config.js` (best for many recipients)

If you're sending valentines to many people from your own backend/database, render `config.js` dynamically per URL slug. Everything else stays static.

**Example with Express:**

```js
// Static valentine bundle:
app.use('/v/:slug', express.static('valentine-captcha'));

// …but config.js is dynamic per slug:
app.get('/v/:slug/config.js', async (req, res) => {
  const v = await db.valentine.findBySlug(req.params.slug);
  if (!v) return res.status(404).end();

  res.type('application/javascript').send(
    `window.VALENTINE_CONFIG = ${JSON.stringify({
      language: v.language || 'en',
      to: v.recipientName,
      from: v.senderName,
      message: v.customMessage || '',
      images: v.captchaImageUrls,  // array of up to 9 URLs
      correctCells: 'all',
    })};`
  );
});
```

Now each `/v/abc123/` URL pulls its own data with no rebuild. The browser fetches `/v/abc123/config.js` before `app.jsx` runs.

**Equivalents:** Next.js API route, FastAPI endpoint, PHP script, Cloudflare Worker, etc. — anything that can return JavaScript.

## 🌍 Adding another language

All built-in text lives in the `STRINGS` object near the top of `app.jsx`, one key per language (`en`, `de`). To add one:

1. Copy the whole `en` block, rename the key to your language code, and translate the values. Entries that are functions (`subtitle`, `question`, `fromLabel`, the `errAll` list, …) receive the interpolated values as arguments — keep their signatures.
2. Add the code to the guard in the `LANG` resolver just below, which currently only lets `de` through and falls back to `en` for anything else.
3. Add an `<option>` to the language `<select>` in `customize/index.html`.

Nothing else is language-aware: `document.title` and the `<html lang>` attribute are set from the active pack at startup, and the reveal date is formatted with `toLocaleDateString(LANG, …)`. Note that the `<meta>` share-preview tags in `index.html` stay static — they're read by crawlers before any JavaScript runs, so translate them per-deployment if that matters to you.

## 🖼️ Captcha images — practical notes

The [user section above](#-where-to-get-a-public-image-link) covers where image URLs come from; on your own deployment a relative path like `/photos/us.jpg` works too. Two things are specific to `config.js`:

- A `null` or missing entry falls back to the built-in SVG heart, exactly like an unset `img1`…`img9`.
- `correctCells` decides what counts as solved: `"all"` (the joke — every square "contains a heart"), `"any"`, or an exact array like `[1, 4, 9]`.

Cross-origin images: most hosts (S3, Cloudinary, imgur, your own server) work fine. If you see broken images, check the host's CORS headers — but since we use plain `<img>` tags (not canvas), CORS *usually* isn't required.

## 🪪 Favicon & share preview

### Favicon

`favicon.svg` — a red heart on cream. Replace it to rebrand. SVG works in all modern browsers; if you need a `.ico` fallback for old IE, generate one and add a second `<link rel="icon">` in `index.html`.

### OG image (social previews)

`og-image.png` — 1200×630, the card-style preview shown when you paste the URL into Slack / iMessage / Twitter / LinkedIn / etc.

The current image is generic ("You've received a Valentine"). Two ways to customise:

1. **Static replacement:** swap the file. Same dimensions. Done.
2. **Per-recipient OG image:** generate a unique image server-side and update the `<meta property="og:image">` tag in `index.html` (or render `index.html` itself per-slug). Note: most platforms aggressively cache OG previews — a unique URL per recipient is essential.

The `<meta>` tags also include `og:title`, `og:description`, and the Twitter equivalents. Edit them in `index.html` if you want to customise the share text.

## 🛠️ Tweaks panel

There's a hidden dev panel on the page (toggled by a host environment). It does nothing in production — you can ignore it, or delete the line `<script type="text/babel" src="tweaks-panel.jsx"></script>` from `index.html` if you want to drop a file from the bundle.

## 🩹 Troubleshooting (self-hosting)

**Page is blank, console says "Uncaught SyntaxError" near a JSX file**
You opened it from `file://`. Run a static server (see "Preview locally").

**Images don't load**
Open the URL of one image directly in your browser. If *that* fails, the URL is wrong or the host requires auth. If it loads but is blocked in the page, check the browser console for CORS errors.

**OG preview won't update**
Social platforms cache aggressively. Use the platform's debugger to flush:
- Slack: paste the URL into a private chat, click "Re-fetch"
- iMessage: append `?v=2` to force a new cache key
- Twitter/X: [card validator](https://cards-dev.twitter.com/validator)
- Facebook: [sharing debugger](https://developers.facebook.com/tools/debug/)

**Captcha won't pass no matter what I click**
You've set `correctCells` to a specific array but are selecting the wrong squares. Squares are numbered **1–9**, left-to-right and top-to-bottom: row 1 = `[1,2,3]`, row 2 = `[4,5,6]`, row 3 = `[7,8,9]`. The selection has to match *exactly*. Values outside 1–9 are dropped, and if nothing valid is left the challenge falls back to `"all"`.

## 📜 License

Do whatever you want with it. Don't use it to be cruel to anyone. ❤️

<!-- The live demo: an ordinary Valentine link with every parameter set. It is very long
     because several squares carry their picture inline as a data: URI. -->
[demo]: https://love.d-solve.de/?lang=de&to=Fredi&from=Felix&prompt=Finde+alle+Fotos+deines+Liebsten&hint=Wenn+es+viel+K%C3%B6rperbehaarung+hat+bin+es+wahrscheinlich+nicht+ich.&help=Bild+1%2C3%2C5+sehen+doch+wie+ich+aus&cells=1%2C3%2C5&question=Auf+einer+Skala+von+1+bis+10+bist+du+mein+Valentins+Schatz%3F&scale=joa%2C+ja%2C+auf+jeden%2C+oh+gott+ja&readouts=joa%2C+ja%2C+auf+jeden%2C+oh+gott+ja&reveal=Fredi+du+bist+mein+Superschatz.&img1=https%3A%2F%2Fwohnung.felix-paul.de%2F_astro%2Fperson-2-photo-1.BqIx3ea0.JPG&img2=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F0%2F01%2FTarangire_Warzenschwein1.jpg%2F330px-Tarangire_Warzenschwein1.jpg&img3=https%3A%2F%2Fwohnung.felix-paul.de%2F_astro%2Fperson-2-photo-2.BVnTLM2R.JPG&img4=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F9%2F96%2F2026-03-20_Besuch_von_Dr._Markus_S%25C3%25B6der_vor_der_Oberb%25C3%25BCrgermeisterstichwahl_in_Hof_%2528Saale%2529_HOF9967_RAW-Export_%2528cropped%2529.jpg%2F250px-2026-03-20_Besuch_von_Dr._Markus_S%25C3%25B6der_vor_der_Oberb%25C3%25BCrgermeisterstichwahl_in_Hof_%2528Saale%2529_HOF9967_RAW-Export_%2528cropped%2529.jpg&img5=https%3A%2F%2Fwohnung.felix-paul.de%2F_astro%2Fperson-2-photo-3.Bs6LNS9P.JPG&img6=data%3Aimage%2Fwebp%3Bbase64%2CUklGRpwJAABXRUJQVlA4IJAJAACQTwCdASo4ATgBPtFkqlEoJT%2BqpNEaA%2FAaCWdu1Rt4jaxwkE26kTbWsoaUI8xOvc2p7711mePNDTWxoKqtT7UEjQVVan2oJGgqq1PtQSNBVVqfagkaCp6Pvm94AccTavN7vLYhWgUZUk2mj%2B%2B9X%2FNxmN1QigqgbkNB9BtXm9zOqO8dKxxy0i%2F3I%2FO9IboXTZ5A7FQVVanvxQDSXIi4jZ5UoWWtjQRpmhkvm1eaaqFug0vLRcSR9JvnhgTqrSEgFzo73gBg5WKI%2FNefaEEj5mcx1WAyUcObzAUXTRGOO9eOHKFNv72C6S8Z7jDoZDck5b1UwdDWwjjUiPW1uY5jGvHdpr%2BX8UMm4KGMypbcprkdXCFsRzNHWkW6JZ2zGochkC1kE2fsRB%2BeIUkxFZgJuvKOOaVMEC4M%2BYf6HyHRYkpU7w0aNI1HjzOMs8kg5%2BeI4qXVHu7XM%2B8jIoeEO7Hbw3fVK158rXEhjtUebHikRyCC6svaxetgPHwB0Id1g5EANGKZEHTwt1MDD%2BmFwR82ZcQLiazQDTAHHE2882K8ZeHXpw0%2Fo2vBwYdluCyw6ObELC3aZXGNMtQFMD8%2BkQoqwS3EVwzHqnXTvEUgESjAFdXTQZuAEa3y93hkRis2VoIJZ%2BfYfhdsJS%2BkPSilGZA2WZsTnxaIY2YmYmqaKnsEjLLDMpCY3%2BCzPHJcLsZHoWBl3zegAzkdbj5WGmwwzvk9xQtxqXYnlLXv3gN7v0vTKBvR5%2BpZhBQWludzbHEO9sw5nJUfBDpkGIElEfvO91AIbAghGVUXelwyAyj6hxLaZykW0Mfa9dkHUevxI24K6R9XpUuxM8Qb7YtYZvtQSNBVVqfagkaCqOAA%2Fv4tAAAAAAAAA0R2385QAR2daZvIhdoFmP6p7YoQw4HqmVr3urKtHJR6EPUa0VvBT8LtHexuu5TTPXcWDceUwxaQenkJY%2F%2B5K2pzGgNWTsYcBjF57kjNGasDD2ubEOwgJ2oYKfKB2Gl5wABnHPy2AFHcKTNKck6ZDjCyn6HO9QaXTZXFkZkQszxOqjB1r%2Fw3lU75pu9GqZijZ%2FLcL8AtUVTJMucRMH%2Fz%2FgG3H7tqYMmDKrIoQEnSBMmHNYXyrSRQ5uPqBtBjbLHIyX2OLJpeelG%2FeFAGcC2BU8xsKF31uf3CVCjv360nxXlDcD5C%2FE2%2FayqpGyAsH%2Bo60I6uU%2FBVOx493r5JWNAizfKDBfQ4HLLt7gJHLhm43%2F2R3A2dsw7peTK%2BM2Nca0GXoUaFnHoGih3%2FxKwbKJzyfaKq5B7BODDdmVXer6z2TRuQ7CwKAocDffHJhKTtgtzuCny1PmldgvjWQPWF8pE0%2FjetMqk2%2BfsvdKbWVhJ8%2BstIm%2FaZ8jvQpiu512jC2Y6jjcKW0zah42SbE6dPEk2SWvQXAcjL8Y5fbhkIsXKY8imA01sap429TG0p439zOcSRQkcRsEIg0qyPBzAm6zPbX4eClldhoia4oeHmd2pQbbC%2FCWxvo4uif8xKL%2FeyFXGhnHECyWsU8P20aqcOCT8vJwfRg71v26GmE2WWTdU08sYLCkmMKsid8EtiAR5xDmbWjUjG4JTD8BlHNJ%2Bve%2F6GB%2FcSB083a0ZCZmPMwtfRndZra3TnEcxoIKqatDHT6tGQcGBaPLZThiSfuERkD8g84jfGrev4OQf2HVDhQ4QEx%2FLysvYSnxJNRfSj4pxGVd8RTWZhgbpBamdSQZ0p2efdplwFIKiiFu8q5Ma89uTSxhsle%2FTrrz4HDqRzNpwwn6JbNbYrwem5EG7PMNoSH146hXvO2JUl8tsBphG6mJOGWyBENA%2F%2B9Bnoa5mNPY7q9MTwIBocbW8I%2F8aev4b%2FHfMukEX2jpuR7Oue%2FAeIpgtxgkkFYfL2%2B77yukejk8oEHoRWQ1mmdunIY9DwJM%2BoNcMxnY%2FACvzoIFgv8mLI6xcFBV%2BzQ%2BDlgczF00nB%2BKDlXyypahnHkjPjXB69C3qJsRYybUBUsDg%2FdFdNenqYFmI%2Fh523uxWtaq%2Fk6xyr8PkWkJ4kzJA4avHD8K4Z5dW0kymwE8EDugq49y4bvUnRrVbXNlXX6oxL4cVGJK08SFILvxe3AfJVDrRHg06FmoYU%2FZhCzA4Q4jd6t5h56E3qdtXUMPrWmwu4fEMdYGWBreHbT%2Fpyof8wblqWlPICoS%2F%2FO79zzaAOQfSkdhN1n74NgMRddT%2BDt1ZC9BXl1bsiI3CErFQj5nHHeIPN7B3Jpzgo33rdddHfvV3MSSNskk03X6VIzZYII5RtfNHCXABdEhuAeYHt%2FNupK7nyWfPn1KNG7XPKQSkAwrNXhuq5rZMpOSfDw9p2ABpShuzRfjKYPFnNdtgaTaE1sh5CFCtqGb4Q1RIu1c7Ott3l2Tpl7KEsWSlCVgaMLLkh0A7c%2BCEPeLvtWV4R6HRD4lGL6fbk89dcq1MUqldKs79k5qQXPbm56GIqDmYwCeckgtfQgvNQg58z9X9snSv0RLzkQAsoZSlsUHfqQvSDrVb%2BxXTuOCOV4vY9wOPJvZSLzTJQwd1w%2BxhFCJcGxFIokuRg0tWIZInZOBugedQ4DczfJrSABmSKLIoczRRTeR8OLFGDpJTYHIHRRJWbUgShG4Q1zwyorfZS1Oj2hhQ9WUXlJrBuxPgaGARyJEZ%2Fip7K%2BowPBRZGStNnl7GWxMwyOaGzlCUbjPns3FvfJz1t4f9UuHx8f4xrY33775Ifd8HyHz9IT5m5690TcgFpfoFk61RdAV7azImt%2FyZYCQJ%2FOZsLp8Pby7UVEUqlzc8Ugnf3jxBHitj3akrzTpnEUegG%2FUSt2irEjn4jQHPiU0gJOv4uL6voSiZL2yp7MpLXwDykZloSBGidZ4wHAy%2Bkgy5p0qGKNyceDsu1XBNMtT5YBMb%2FGh6diASH%2FaVEkOHkKCAGuFnU3niwfKXPaaxl7pHlCNnfgjqZyVZPZiueCu87gnHcL%2Be6ttaTmlk%2BAVKkTUZpaqqXZChrBFZMtrDp5rIaIE%2BSzlTQPwYaF4h1zfX50Wq%2B8soe%2BGdOzAqwhpgE5%2B1egxnQLK4OrEWUDTVNuYVbbuMAVIKTHuGz%2FiE%2BRoL%2B%2BuC7e3Sv9aS07XnLrYD58K7dFipyw5W9T4agAl6MueeSdIgoEkw4Xglf%2Bz%2F2MgIaiG%2F9A%2FRHFjeyKd%2FRvft05FAIG0NSQdBe8sAXOLBTdkiCy5IXrrK%2BLOjiojFC7Dd9k%2B9TP%2B43f8gAHNR32zwt5Vgxz3SmZjHyJcFinXDXFFnTeeRtKUcPig5OyAAAAAA%3D&img7=data%3Aimage%2Fjpeg%3Bbase64%2C%2F9j%2F4AAQSkZJRgABAQAAAQABAAD%2F2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys%2FRD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N%2F%2FAABEIAMAAzAMBIgACEQEDEQH%2FxAAcAAACAwEBAQEAAAAAAAAAAAAEBQIDBgcBAAj%2FxAA6EAACAQMDAgQEAwgABgMAAAABAgMABBEFEiExQQYTIlEUMmFxQoGhFSNSkbHB0fAzQ2KC4fEHJHL%2FxAAaAQACAwEBAAAAAAAAAAAAAAAAAQIDBAUG%2F8QAKBEAAgIBBAICAQQDAAAAAAAAAAECEQMEEiExE0EiUWEFFHGxM1Kh%2F9oADAMBAAIRAxEAPwDqXh%2B9SZRCjAhR36ioeJ9UtrZre1ZWmuJG3LCgyenU%2B1Z3TI7q3haYS%2FCk9h1ppp6xIxuDh5W%2BaVuSfzrzk9bJYPG1bZIyutPq8TKLoPDbtyFQ4%2FLNLRdSof3Mrwj%2FAKWOT966Dqc0V5FscKQBWQ1XRpoFMqeuM8%2FauVKdZNv0Qmn2iWm6k3nLFdP5kbcbm5NbXSytrBsbkHkD6VzeJvUAy4Ird6JK11YI7fKo27vertM5eX4vsUJemWNLBFK%2FwcYR5PmxxzQVwblD%2B7JZupJol7Npy7WQG9epzSyO8uY5pEmA6cUTx5I3Gaq%2FaLdyRfY3crsbe4z6vevVuzYzPER1%2BX2oOxE9zDNMfm%2FD%2BVNrCOC908zP%2FwAQDDfcVLTQzVwxNpkIZBcSAPJ1561VeMI7kIknGOvtQOqatbJAht9vmKcGhtQvozaoFHrIzVE8abakufsVkxHF8Q6h92T3NStoo3nZEkGRwRmo6TphuU82eQhT2%2BlG6zo9tZCKTTmPmt1QEndSWik4uf0F8g97LLZIcncg7Cn0OpmHQBfu5chQwTd0OelIbSGSNGN6hzjO0gkjrV02hXT2KvCpRG5CFuP5V0v0%2FLLDF8ehNOx54evU1YvJuAY8nFKPElgP21ArTOAyk%2BlsUsg0vU9ImW9jkHl9G2nB%2FwDVTaee41dLpyZmAwOOg9hV%2BPVQyxS%2FPY3Yqug1te3QMrMVwRubPbpSm3g1HWYZEs7ZpHjPBUcCtbrdqLi8V5rVwuPmwRmrvBWpWumz3Fo4wZDnnrxmtCV5NvoPQg8K6ZIt%2Bt1qj7pITjacYWuhLqsd2fh4lByMVkNYZxrMyWTEm4JKqOxpYupXehXoSWNg%2BRuGfmGa5%2B3URyNyfxsFJUNtT0m5spnkt5WaLuoPB%2FzQumJdXV4ZI4wu09DXRLO4tr2xWXapRkyd39KQwSW0F28pIRHJxiparC8bU4ytf0LsQ3Fjc22rw6hMxxkK%2BCScVrDPYSBW8xckc80LdQpqK%2BXFJ6WqMWgLGgVpD%2BTUlqZ81G0Oiy7u7WZGQR%2FniqFMVvbHJ4%2FhoJbqJWVSCpP8QxzV1jPH8ewn9UeQE4rmxUsmRWOz69hK2wmjJBbtRUQDW4E3QryD3pnfIqQh%2FL9IFZy91EHhjhVroajT%2BOVisVailvG7pCikt0Yn5aceHUkurFUSQpGhIY%2B9Aa01q1lG6KBkgnjtQthdXUEJSFNkJ53Vmx43jyWyKqzcx24t42MUu1SMVktYh3XGzzSWPtRlrfCRUjW4Lk9Rnv8AapC0eF3mlU4Py1pyXPpDsu8OQLbRMJfXJ2XrX2nI063kUiGEmVgAD0q7TILhJBPLiMMMAVdcW8kKSsm1mck5JrThg%2FErXQhcdC05B%2B%2FXhvVnPeo6lpullF%2BFbcwHA3Z5ryUTX0axwpIVXglflP1zUBpkwmBE1src5DTAEde1bMOlxyjbiBFZfhYeCBsx6SeO3erorzdE1yQu6M7VIJ96ouNIklU41CBBgAAv7cf0FRsNK8k7ZNTgYg7pAT9Ov%2B%2B1bFp8aVJDG8N%2FJcTRhoo2c89foP8ANMriaXai8KjHJ%2F8Az2rNeZawyE%2FtmxRwAPVJge5waZM141vviRLgsAVMThgRWTPhWOLlBWOyyXV7dZJbSWI7CPSSODQ8V5badbnyoAWOelU3c8d1bZkiaOQd8cigLwwbE9TjPWuQ55YT%2BKpDuzQQ67DNbHzYCSOwGaymrfC3mqpPAoi%2FCR0yacaRbJy8coYP%2BeKnfadboVdtp5ycVp%2FcylhTu2gr0IbrTZ7O8hvYbpnkU8Kw4pPqd%2Bbu%2FDXIAlI2IAOBWseaBsRRoGcDA56CkfiLQvjYFnt1aOWM53ZrPj1MskqapEXEZaHHqElhJbpcYbnAHIqVt4V1CV999dFQDwiUq8M6hf2jvEsRnmHYVpLPVdUutQVZ7ZoQvJDjFTzTxVTXQRX2QurV9OmQRF1OMZzRUepTqoGN2O9MZrY3xLz4CD2o62s4PJXaqke9Y1os2TI3je1Floxt9epMwdosZ6URbyoY1ZV9a8gVPSptEuraLNzEX9mbBqOsrApX4Nhx1INLLGUOSs0ulyftDR2M3B9Sn6VhJbaJdV3Bi8e7BGeK1fh95VsZoTg7ju%2B2RQUek2yYAQySDk%2B1dPKpZsMGuwYo8WRq%2BmBbd9rAeleKz%2BhHXplWBbUkZ%2BZhxitZqM5tpFjFlu9iozUop7yDLKyKMZx7Vz55XHqIdjrTbCCxto8x5mb5mx3ou6WCWMCT5vwjNZmx12bz9k7hxzz7VKa7n%2BKF0CGQD0j2roR1uJ4qSIjeG6DXHwkgO9RlftWa8d%2BNrXQQLOLbNfYzt7IPr9aMk1Qx2l3eygGSNCy%2FTAJr8%2FalfT6ndyXFxIzvK24nPWtujk5wu7RJI0Wof%2FIfiC4OyC9aJc%2FgGKzb6jdyy%2Ba9zMZQc7i3Q17ZaVNeyBVDfYdvuaPuvDFzbIG4IIyDkHNbrHR7Y6tcHDXFxNKRxy56f3phc6x5yb4ori3lSPy9ynORz79qz9nas92tsw9THGM0217Szp%2BxUjIEgHqJznigQnmuDJLvkclvc%2B9MdP8AEWpaef8A6t5KU6lSxFfaboEl6VSNHkYnoOlNdY8DTadAJGEijG5ip3BRjOSOtCsDV%2BEv%2FkcXE6WmtqSrnHncen7%2B9dEurS3dMbB5bj5z7e9fmqSGW1lPmAHb0I6EV2%2FwbdXOt%2BD7XzXYvGxjP1A6f1rDrMa27u2CDrW3s9OmNv8AFnD5KjdzQepatD54sxJx2arJNKtxfoZSWX70t1LSIl1J2R%2FRjg%2B1cpKKx%2FyDTQ1jiZIsROWmPSihb6xDYMLhVcEZyOuKB8OQS3UysW3Ro34T1rdSAR2375gqbcc1XHFKSdOkM5z4VFy%2FinIUpHklsjrXTvLjZssqjjrS%2FSdEtoJGuYm3B%2BQalrCuFCQOSx64rXDHPDjeSa4%2BgQTN5JiMUci8%2BxqUcgt0Ee3oKzGoWFwiK1g5il6k7utaHTIJfg0%2BJbdL3NU6XXTzTbUeSTicImieF8MCrfbBFHafql3GViMmY89COQK0niqKzntd8cG2cdWxillxpNjp%2BmQzNMZr%2BVNwXsoqpThNcGemjbeE5pHvfIMgZWjJFWXLz22rXNmJlQnDpkdQawGiazf6VqUV0kJlCZGzOMg1pbnUoPEcjzXKPZSxrmI7snNaY5awqHssi00Oba5e3JS9w7t%2BL6UNrlpm2e4glJwucChtENzOGj1NWBB9DMMBhTW8t1ewMNu3XiljhvhdCsyVlc2q258xwshHOTUra%2BjYLDJcjH4RQd34enLttYGqYII9Nhea7w2BgFff7Vlx6Z%2BRL2xJ2xvd3cccUlsx3xuh3HHQYrlFto5EE0uG2RH%2BHtn%2FABW3aQSwsyGRt%2FTJPf8A3vRum28ULpHKFMbfOGHB%2FwBzXpcWNY4qKLDB2l7feaYdO32ajIMkagysAMk5%2B1fftK4udLeW31PUjcRN%2B98%2B4DIw9tuOv1z%2BVdNTwTpZnWeyu5Y2BJCjB2%2FT7fQ0RD4L0tJg14TIAQwUIFU%2BxIHWhxybqXRbFQ28s5xpeiXV1DFqlzGUyxHycSHJ5A9u9bHxLoBu7pIrWASSC3SXaAAzALyB07kUz1tJJGhVdnlBlEUaqRtwcU21CGX9t2vqCZiZQ3ccDH5cVfRScOh%2FaCG6aeS7RIFz5MTlMc98U00%2B%2FwBWltopNMvrpQfQYbiUyIx%2F7un61099O0zVrpzMgttSX0yFT1P17EfSpw%2BDLNmDPMW2%2FKyLgr9cZI6fSqHDK5UuixePb3yc2s9KbXbZpRaGCVow7IOME88D%2B1dF8GL%2By9CgsnGAdxc%2FiDbj%2FwCKKmsbHSLfytOXaCcu7HczH3JNAziRWcgqodQwYnr%2BlTnjUlRWaA2sUqAjnI4J9qR6jodxeTbYpNox1zTDw7dpLBLFPJmROjdsfSm08flRCaOTivFarFqNLmnt67LVTMVZQ65obSRWkHmxscnuQfpWktbi6vkRbxTwOV9qcafdQNE0knLVK1toryZpC2xu2K0YNR5oRhN%2FJ%2BiMo10TtrpraFUVfQOKISAODKrepvzxQ0kEgLoXwM4U0RawfDsA8vUZrqQc2lGa4EAamjrLEpchd3OKewJ%2B6XB4x3pLenz75VXlVOc08tnXyV5rP%2Blxi9RktkpdHP73WdM1K1dEg8yZgdqgcfzpPe2jfCo8ghjkQYCg5JFMLfwq8cTW9vJtdjknuBS3UvDb2Me6eaRkz19qzZHN98L%2BCltiCW%2Fn3NEXAx0AHWnPhm0muL1biUZihO71HjNQTwrbXdpJLHcN5qgkc4qnT2uLa0WzWXcCeg60Zf8AHaZBWnZ0LUrqOe1wWUN2weaTw6jE0pgSQbh2PWhtP0G%2Fm2yhioP8Rq6%2B0OK1VZ5GIfPzirMflg%2FKyy7QaFWSQMnzZwQeM1ivFF1bx3ZhDRkgkjac4%2Fl%2Bdame4jg0RbpziQqVBNc6vr%2Fzpy5XaBwu0Dn6129PBSqYRQfZSA7SOQORlxzj3ozRbj9oajJEdxKJvZOBgD%2Ff9xWXnuY4oHZXJJG3p0%2FOivAryz3N884DwqEXDN8x5OOOeoBx9PpW2xnTLGcRIFgjLk8krsBP28x1J%2B%2BMV4D8TI0al0ck5jddpz29%2BvuCR7UBZxxOSJILZi3qCNApVj9SckfnRQto4LkPGY1jRcKqy%2FLnj09hzjHbP3qaYFzeVdXhdRlFAGff2%2Fp%2BtN9ZYT%2BXJCBuXDH7DqP1oHTbOU308k%2BEZGJ9I4Oe%2FwBj1x9TTW9t2ktXxIF25LAdxQBmtSCw3vxG7y92CDjluOcY69uByaZW1xN8Mm6CYMTwHKoT%2FwBoBx%2F3YpfqcYm0eNpZNrRsuJD6SxyeFHcfX6H2r3KwWai6RnfaSAGOVH3zkflQBHV0JtZ97OjIpbbIAM464P8Av2pKl%2FHNYLIxDGPgjPY0ddTWdzp93HAzR3DW0mAWbJ9J49yaxPhy6le38mYhQRxg4Gai%2BwNZp15BDfReWFBXl0QjkV0NrRZrUPF6lIzgVyIzsZle3UuV%2BbDba6j4H1H4vTDE67XiPfrg1z9Vo8WeScx2D6u%2Fw9qI7e2kyOpArOx6vd28oIyrE4Ga2F%2FrtpZ64lhP%2FwAxM5x0pEYUk1mZmh%2F%2BsT6Ce5rzus0scUnKLvkly%2BBxDJK8URuJMs3TFHK8HxKQT5LMMDNZe9tprjV4nt5jHFF1GetHtBun8yacmROnNRxanZXNtsk0H6jbCxu0liyIpOCPY14t7Iowq8Ut1e%2FPwgSWVSM%2B9BQ6sqIFVgQO5p6iLhml4VSEn9i6w1zULi9Pk7TKe1P5tRlmhWC%2Fsck8cEEfesYPioHy6MlwhGAn4jT6VNYlSC7u3WKIAb0xk4%2B9aVJxTVlSiyGoabIkxe2LHC%2FLGcL9qE0KyiF68upr5TD%2FAIeelMpNSeWSFLTJidvlHVhTi%2BtVuysFzblFK8GlHHXMfQ6JXj3JshHBIuMZDA9aAL3Zs2W5%2FeIByT2pRcWt3pshh8yQQMcjJo%2BC7Zo5IpgygJn6NU46jyy8cgSMn40uljgt7aFvMwm4BTwCayCSfunUKfm4AGMn%2FFHa7cSSXDYYJuYkgHgClcknKxwnPHU%2B5r0GCGyCQ2VTvIYsFiuOgD7cUd4du3igkjjlO8vk49WBgf46YrPTRqq5Y8555xT3w%2BrC0mkyFTgKADjHPc%2B%2FTgZq4Rr9K1BhceU8jZ6Zcnr9%2BorZFLPWrQC8j2uB6ZRglQRgjPcY%2FwBFctDysrgkdOQR%2BeOT%2FWm%2Bmam9ooaOV05429M9wDz29waaYDGO48ReEXW2nsbjVLLdhL20JdyvYODk5FMvEPivVrdbe00jRdQuWuVB8ySIhVJ7E44oNPFt0G2SgBcYJHX3HQjsfao2Hiu8Ekgm5UNtjcyMACce35fzp2gG%2BheGngT4zxFdNeXIbfHGzEpAP4Rn2qGsX0LbkiaEowxt8oE9frS67157sPuYDbuQlFPuMYYn%2B3tSO9n8xxI%2B0MOMDgdf1%2B9FgN4ZBtyiAquSQWJwQOtYWwItbjhnRjgcmtnpHlTl45A24pjeGAJyMcnvWOnQWkphkgdR%2BEs2Rn2%2BmP8ATUQGAllWYrglyPTt4%2B9bXwFqEq3vkzSMkbwkAFjjIPaufJMG2NycenB6Gtj4bmR7u3ZwEYELlT9M8j%2Ff1qnOnLG0iR0RrTTpZzJMFZ%2F4jzQl%2BJbqRUs1AVf1qqa4RZCp6DrVtrq0GxhtZCvQ4614%2BO%2FK3DJxzz%2BSbku0ASfEw3KRzx43HtTL4WOSUuHKtjBz3pXfahI91EzbWCnJ20ZdanbzBFjO0t83uKt08MUHK3xYk7F2qeHruDdO0vmRMentULcQRR7HjJIp9%2B04Lq0W2zlF4J968b4dMAQM4x1Aq%2BWNSlvxPj8kbSMhZ6la3Ny8txIEYn054xU9b8RLbWxiy0xPCovOaUaZYh5TdThQSOIzxiitLMUd1c3LpHPN%2FwAsZHpxVzjCEftkd30NvDk9wBBd3dqsCj5VPZa1dzqcNzJH5bA4rmL3PiPVZZFii8qOM889RTrRo7gWrT3rYKDnmq3PLiVcc%2BiakjZalDHfW5jAHmYyM1jdUuWgt5IGX94BgAV9puuzHUWd5MQ4xzSvxDeg3DyRtx9616bGsmRTaBtGQ1NljlfL7i3Zeg%2BlJ2cCUtISSfY4%2FtRF3cszkZ9IPORSydzvbjHfFdtCZeQJHUyFSpbIVOSx%2B%2FYf17dDT2G4VNO3MykLjhTx3z%2BWKzMczoG2Y7Dnr%2BQ70Vp5kuUcMzHKleBwBimINTU%2FOHlb1Bl9IUqOnX9aPuBcvbqsWBkEOQcentj2J4rMJCLfUrWa6A%2BFEyibn5RnB%2FzTzUtPniuLPUbG4e5heXMUUeWJIPbHzdKrnJrotiotBMwvYY5Hkj3zn8YPp4%2F8UTaPeX5ItEJcDaCejDdz%2BeBWoi1zQrm1jR2Am2gGJULPkDkYAzX3hfXdEti4MFwkqNtZWtZDg56HjjqP51j%2FAHOb%2FUt8UaMvd299Z3PlSgJJId6LyQcZH9hVOoXj2ymaeVWIOSPduP0z%2FetL4istR8Qa2mrWKPa2ULJbBiMOATy2z2yazvjfTrS0nj0HT9892s%2B6WVx228DPTqavhObasrlGKR7oOtBrtfLl6Kc5HA49%2Bh7VRq8kU8skm4R7n9BUnDf73qdtYW1rC5hGEjXYXP42%2FFz7Z4pM0rCV1b1Ybgv1rSUhUdy2wR79w6gAdK0%2Bh3Cm5izuBAHP6e%2F%2B4rJQALwDk45IFaPSHWJ4wQvOGBPtUGhnTbVDLA86AM2M80RpF9bzQvHdQBXQ8A96V6ZJ%2B4IRyG6Vcu5TlUOcctivNaleHN8VwCDV0yK9vEuYzsTPIq3UdHiVtloA0zrwtCrqElmuUCtu7UVpmqs1wMwbpW9ugqmE8Uocrsb5CdC8Opp9sJNRcPKTkjPA%2BlHT6pbRvsSPIAxxil2qai4cwId0jdcdFFCRWj7AQGOe9SlrljfjwQ4HsoTNJa6wrwxxgOo5ZaCgtIrGPa1seDyw70Xpup2cTJbW9sybR6iV60fpmr2N7PJa3cW3nAYjANblib43%2FwDCiiGk%2BXdbxEjqO5WoanaPErRr5jRnrxReragugxoLOMSgnop5o2z1e2vrQyqoEgHKPQsW5VLtD6MtBa2zKCFG7HTNZXxO8azEBNgH61p%2FEuoWyN8TAoV%2Bj4OKwOp6gJiSc45684rp6bHtQ4oQ3rZduR159xmh1woYHnIwPpRMkyvJuIGSOtLZWODhsjJrWkM9JO4c8r3NH6fOElyMY7%2B9KS%2B7qcEdKsBwishzk8496dAPrlVWQOAJI5uHU9CaM0zVl09o%2Fh3dEiyUHDBT9KX20wks9vOU5AzQ7TI4HGffB%2FpUaT7HZtNI8YxWUs8vxssDXDAy4iB3ED6H2pra%2BPrG2aeSO8nWSeTzHKQgb2xjJ59go%2FKuYOUkU5VfbgdKq2AnJ556jr%2FvWjah72by78YR3EknlXN%2BUd9z5YJuJ98Utlvlmkd4YCLiQ8zOSzHP1pDAEWMDYeDzk%2F79f50400q1yuQgCeo5Ao49ITbYVeSfAWyQYBfb6sc1mpJNz5zwKK1jURLcF8k%2BrOCcgn86XSSlg7KTu6ndzn7VKhBsEpWTIfjuafWLxPdAxq3POP04rJRRlmYHnJyMYpxY3JjfavXPJ%2FtQ0M6z4Ymj80CX5WH8ulbXyoJFRQRhuPvXMNDvGjiiYPGM%2Fpim2q6hfGMS2hLPjChexrFqcSfLQGz%2FAGVaedtOBnoDUb23%2BCheW0jHmAccUo1VdRvvDkL26ut2AGJB5HvWZj8UalDcm0v2YdtzCubl8ag4RiClyNX1UWlu890mZj1JNQtfHUQhUeVnFZ%2FxHM8wWNX6rml1hp4EHr5JOeayafTqEXKXbCczc3kExTzIUXe3saWfG28BKXkflgfM23rSy51a4sCLh5HaJjwBziirjWg1tHMIBcRScMGXBrpPHGytcgOs3Iub5H0i4L4XlM5o63vHisj5mBMRye9JFfTpLiSSzBhk%2FEACuKjcXSuqIXC%2FfOavxYU5WTUV2Q1K7nnbjbt9mFZfU3zuIU%2FccU4u7sRqyIMg9WzmkV5IG3bl2p2xn%2BtdFJJUMUST4b5OfbNDsTuNWTjkdOarAZsnimIiNuSGrws3Zse30rxuCTgZrwcigA6zn8tgRnP3oh8N64uQDnAHIpVnHfgdfvVy3BwMnH1pUASzBFGcgsSSK9V%2BeP0oZrxmOOo%2B1efFEdFXPviigG0AL%2FTjqe1FmdbaHKkAMOT3NIfjHHXJB9u1fCRpBsZsg9D7GigL7l1JP70sNuQSoodXwuDktnqfw18uQdp%2Bbj0%2B9egEghQDj60wLbTd62BO0cmmluu9A%2FPIz170vtSArxnA3dCTgU7sxGYsSYGOFx0oYxto16qblkzgjBx7%2FSt9pM0U1sSw4UcHvWEso4TzhgR7ritXoUjE7VxsYfYGqskd0RjYeI3sLFgz8cgA0ClxZ6mTcSqCeD1FBJolxf6mVkl22x6nHH5U0TQIYlnXTMsoBGSeprh5YxU6YmhLr0cTxLcw8BPSeaRnWnQ7QowKYyxzJbT2NyNky8jPcfSs7CRsw4O4E1alaJqCfZuorKIxLbz%2Bpg%2Ff2ppeQwG1jigiQbR2FZmC1ukfzEnZgOhNNWvWjiAkQjjr7msz1G%2BVWVr6ANVtYbdFkMeN38GTz9qR3KgDOHxjqVNNNWvBKd0aZwMEknA%2FnSOSQx7tg9TjruJzXd06%2BFkmA3D7XKAAsRgbfelVzC24CQnCjNNXTlQpYSHr%2FwBNLbtQ2FXoo5%2B1aBCiVck57GqQMfzo2YcE9PoKGPBG4cmgQPJGcr33DP64qGCKuYHfj7ivCAXwP5UAU4rw%2B1TI28GokUAec4x2r4L3r2pAU7A%2BQkfY9qtx3FR4BHpBJqzBUZ4IpAfRjJ56k9ajhvT271c2wxgKOSef8VKRS3qANAE7YEFT7e9PbEKdzSEFT1GOn1FKrdQoUsOozz3FN7b1sSduB%2BH2zQMOhlX0qw3gc5HWn%2BmOEkiw556oB0FZ5Yl3E%2FiUEY%2B%2F%2FumFnJtCNkSODwc9B7UmBtZ7wpGPIDHI44qqy8QXEF0kRt9kA5Y9zQtpJK8O6MngcDk8VReNcp%2FxQNh5GBXF1mJeS12Mv8RXsF1eRzIoB%2BUnFZq9sJUuG8uMsrcggU7VUvIQrxsPbin9jCTbKPK3Y4zVUZOKoFbF0Nw1taCFkLf9VBm%2BMrMm1Cq9TRE11vjbYlBXqw2lkcZEr1oxYsbfCLXtaEGoTkylQeEPAXtS92chjOXHfO4k9%2FyqyU7WcblLYxnsfqTVLpvXLyFk7onCjkD%2B9dWC2qkUlfnHds3ELx%2BI9%2Fc0FOdkg7HOGx061dcupKxxnr9eQDVExG%2FEuWZhx7ACpgDzKq88j2CjrQkiDzABzgZ59%2Fai2Q8EuSc8AdqoDcMATuI5J60CA5MscjgjrioHIYYolx6h7L7dM1TJyc0AVsd3NRNWMmKiRQBHHFeipomami7myOtAFRyRx2qargLg9eKtMW7OOlfQxEkN2VqALVRcHcMLjGT2oyJTti4HTkD3qkfuzkbWXp6vf3o4sI4tmCZVPJHeigKFQPhcEsowpH9DTCxy5XBz75odQwG%2BIkDIOGAGD9%2FvmjrTbt68j25I6c0DDIWCcMOWzhfbA7URBtYbyR%2BXBFDwIOfNDADowNFRbiMR7Hz9ME%2FSgDRaTukRkhlwmMksc8%2FnTC6hnuo0BChF6kHr%2FOlmihEz5h8vavK9qru9TlaOdbZzHAG9GRXJ1UG52iSZro47SPS%2FNXZuA%2BhzS2LULjZ6IMil%2FhnTbi%2Fty0k5SLPAHQ1ZqRms7toYpVZR3FYcl%2BhvIuicgttoKnHtms5rV3tLRZ9J46Hk0zW%2BU2wlfaM9qzmplZ5Hl9Z29OcDP3rqYIfKxbXFC1mNxkK2F%2FExGM%2Faob%2FKgcqfVkKAec9a9cBVAOSTnBJ4Hv8A160O0gaIleRwN2MfmK6CRE83mZ8LtADDe%2F1%2BlDy%2Brf5nL9MDsBX0h%2FebYwcdcirLgMY3xgMQBxzTEUO4jfztxBznGKGC7WZmIwvA%2BtW3Kqm0g5PGcdBUH6BQMqQOf50AUthpDj5BzVPl55HSrC%2BNoC9eKsVCFPB56fypAUsMdRUQpJ9I4q%2BUZUfWpRxYGc8CgCtY%2BO9SCYBI5xVxwAvPU1ai45XnmgAfYDGrDqeDz0r0AlCq%2Fi5HH%2B%2FWrWBAMeA2W6j%2BZ%2FrXnJZSo5z6R%2BVAFkSLG8QlG5VBbA%2B3FWwego7diOvII71WEL7BnJAwSf5VZC%2BWwfUpU8D6UwLpGAu3JJVGOSMYyKthUZDHlQDwvapPh0Ykb26gHuBUbcGMkEHax4%2FxRQw6JztC4yhbBxxg%2B%2F8AWiGYCTdnA4GO4odD6coQ0HU9jn71bCpdAw%2BUekjPNIB5aRia2KpMyknq3ej7Fotp0vh5G4J64pNp0vl7hjCt0Bbn86Y2pFnexysAecEHqDWDVLiyS6IG%2Fv8AT9RXTIF9JOAQa1EXhPz4xLcXDeY3LZPSs9cTQrrcd0pU4OaL1DWr2S5ZraQGPAxiuTK2%2BEQa5P%2FZ&img8=data%3Aimage%2Fjpeg%3Bbase64%2C%2F9j%2F4AAQSkZJRgABAQAAAQABAAD%2F2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys%2FRD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N%2F%2FAABEIAJQA3gMBIgACEQEDEQH%2FxAAbAAACAgMBAAAAAAAAAAAAAAAEBQIDAAEGB%2F%2FEAD8QAAIBAwIDBQYFAwEHBQEAAAECAwAEERIhMUFRBRMiYXEygZGhsfAGFELB0SNS4WIkM0NygqLxBzRjktIV%2F8QAGQEAAwEBAQAAAAAAAAAAAAAAAQIDAAQF%2F8QAIBEBAQEBAAICAwEBAAAAAAAAAAERAhIhAzFBQlEEIv%2FaAAwDAQACEQMRAD8Aqnu7ibJmlncyL4jOdx8cEeXGh1UoWDSuhAyFbLsfL2vZqr846R91AzQhvbbVpKryzgksfUipRAqjPCS%2BvZpJpfb9BuT8vfUlVqSMIgToIPEadsbEVGe6icd4%2FjI9lVXQo94G1USz4yiiMvvklvAp54%2FwDS%2B7keF8EFZAemB7q0gLZ7kuveJGiKenAn%2FmIFLzeGRgI%2B5eULnCgsc%2BuaFd3dhLJpZQzKPDg56Z2%2BtRedI0jaOSLXwGc5%2BYOPjTgmnaMqysjxwFvZwQQRnzDVchlJBYRkYxhCdh03oeBNnY6jP%2Brc6d%2BHrR%2BBHKHUknG2oEYPwNZmJpmQZI4AbbHHu48auSEx%2F1GGMc9zjyoeRljc4GOJPXH351D84IxsNiMHG2B1rAslaRGLhtwwwRxU%2BVbt7gXCyhFYs8L5xz4cvdVE8DLcpAzrJqAJOevKus7Ag7J7LK3F8jN4vYKk6lHH6ihR2E%2FZvZss1jlkJUzDcDBAA5%2FwD2Hwppa9mxpAFcahz34DNOLjtSzt7SMWcayd%2BREgRfZAXcnzyR8KjHIGiDkFmIwI1I34Y%2FcVO%2BRpYqfs20VMRswI4sozk88jpxqrQ8CHGloTtx9%2BKA7buksIu8vboqTv3cbEAeW1KIPxVZPJpRrhR1bUw%2BpoeFDydfaXkYOi5ijONlZgDjy33rLyRFJijcupGUG40joc8aAsZI7%2BENFKrggkFDy%2Fmo98yyKspzsNL9fKlkymXLE0ltPofSpIT1rbtHFbgs2Cw2PPHpUnAjWNUyCMkJ%2FcedCmFvzKNKuoNxUfSrT2nWxJCD%2FWwGOMKDw9aho9s2yDDABcnh5n6%2B6sulhF0C%2BNuJG4z%2B%2FKgXuGkcBVGgnGAPa8qpIVO4EkioYye7AOljtk%2BfvNE9kzW9p%2BZR5MFlIaTn51XLdKMKDxwBzx1NV9qW8ERSCIln06pSfPl7qLKdBDjW5AYafdV%2Faaw3Vyq2qlEVQpP%2BkDj781iwFI%2B%2FYa34LGfPgT7h8qHjYnW5IJYg7efCmwErnvIWiiUju0wSDzOP2qZummZGePPg4kcd%2BNRvHBYBfFsAzfflWLi4t4jLP3QGQpG2RmiDV1c906ARoN86QR4s8cty5Z5fGsSPGlEiDXDqC5B36%2B0d%2FvYUJEEglAuXV5QdTZ9kHjv%2FAI%2FgUVeXfePmPxB%2F%2BIU06uWy%2FYrnW1XcGSSdQSzOOLA5APl0oC5%2FMDw7HOcrzA578vl6UR3j6D3e5G%2BQQKXyzMSViO2RkD%2FNEA0lprAMWqR1OPHv%2FwCRWtJZ9Mwk7rlpY8fTh8qIlXgunxfqYcAfPOKkCJCNZV3H6uJ%2Fz970WahkUhNCsGY4GNiPU9KsYtkrv4c6iFOfP3VjRNbKCdJDeLKbHHQjiPfWniuijvAG3Gchtx862sHmQnJYnVpyCDnPvqsASgDOMdDx9KjP3qnNxE%2BrHhLcTV1imttgVHTgaPIUTa73AkOk8AfOuri%2FrhEJ1Ivi0suc54iuZMLx%2BNWAIGaddl3PdvoA%2FwCnHCmvJdGODAmASBnqMADbhy5UwsZvy1qXkOSsZbwjG%2F3%2B9WGGO6UHYAL%2B%2FwBmqbyL%2FZGCMVUpoweHDFLms8%2F7RJ7V7RuZpmzbQSFRrPtHnSicxxXRNs2AOY60RJM9pFdW80SLMJmz3i51ZNLcgezwqlzGm66fsztFkgF0r6JIiFuVX%2FiRscasdc4B659a7aeBLnUV06T4lx6Zryq1kkYmOJSxcaDjzr1ezikTsuKNxvHAitjG5AOR9Kh8mRSA0md4TrHji2PnjjQcksgJw2FAJJHLyo4Rd3cEAsVkXJ5786HhsnnPdL4Yly0kp2wtDih0Fm1PpUnP92KrDHu8DGcYH%2BkdKYW6qqP%2BXi15RvG3Q7ZoKKJMqjsSpBOQRkirRNZaWyXDhYgdSqMk9Dxq%2FtFUW4BRAAoBBJ3NUQtJ3ZWJSHc6Ro5e%2FwAqhdagVLZbOytzblRZY0zZGSzavaIHHpihdRjIdgAynKrnO%2FLNThXuw0mPEnAcQBUAsjOWY5dt%2BPnTA3oU6lGW3wfM8%2FvyquVyjEBQ4U6RvRjWwihWZn06sCNBxYdaGlCBtMS95nxasVmKsyPLLc8Uk9gAgaV%2BoGeexbrwqyO51RnU2pgBgEADH7D51X29Mi30sEAVYovCSF48Mnbr94FLUn7s7kNnkRxrnnuLU4d2IDNv4dW%2BwHxoR7uRWOJNef0ldan45FWJOJEGklc8c7k1kFv3sckksqqVUlI%2BOT50YCs3BZQrqQOYGVz8Nqut44CGbunyCOJBC%2FSqoosFQyaiDk4roezOzlJUzNtyPvodXBkDdmdki5u1mSQo2RpyrbH%2BPfTztCQRLa2aW5TUwd8A%2BDluuOHlvnarLuHuY9Fuzo3%2FAMcmN%2FrSnRcRNIZXkkebBYuST7s8aXm63Qm5sopo5O9iVi3DHL0pbJ2clsqhfFyUniaddlJktqwqgbakP7cKy%2BtzqXHiXjmr8pkSgE6dJIIIANX2oEWGDDfbPSoXERSTI89O%2FH%2FFCvcrFqDDGTwzwp9mA63s%2BY6VDsMjlnhRs8QlAPnw471xadpvEQpKlQfCaZw9tNHGFwNh%2Bqp9Gk0v7S%2FDwlv5XuoGWFmyjL7t81S34MhYZFwME4GFYn5Gug%2F%2FALZlRQ5%2Fp81HA%2Ff71s3ETuUBQYxwPPn%2FADSXqm8QnZf4cseySJmjaZweLEKPXFM3mIVlZTxwAhxttn7NCCcvkR4BJwcEVENuuRqbJzkj41LoZ6EOHbxaVGnhvtQd1PMLf8uhOhmy2kU6g0m2IbGQcYpYkatfBJWKJq8R8qHNzobPRck7qTAG2bZsbZXpWNEgR3Aw2NvIfzV15JZRS4thIYifE5PEeVCd7mQELpDHhx9K60Vxd0UxQ4AIyep8q3eOMwaFzLoGQTwqZnW4lZmXDkABegq09lSGy%2FMykIgGpiT8BWYHblXjfvOJIwN9%2FWi5RFD2fHjxSM52646%2B%2FwClCoI1Uvvlf0jl5VCWXw94%2FDGAOXpRwEZtculxlmVdsblsncn3ZqXeSqTFBjUp8RrFYBAc6Wzy9M1AFQM7%2BIk5PGmwNKbNLaS7ZJZZGjdtIb%2B5yOH7e6k%2FaEYtLi4iAyUcrjhjFNuyox3LtHMveDSYY1UlgpPtD386U3TxYmV0JnMrZZjnbh8a5Z9r36W286gJ4dtHiyRgf4prbFe57lIQ0r43xy8qTW0LMwBOASB5ZruLTsYfkFk05ZsHJzuaHfc5HmFdhCTc6Xwuk%2ByFOAa6SW5S1hCJIquy%2BM5yAvXGKVW6RtcqqoFCnJyc5%2BmaVfjW8ZbYBWKh34cwoFJP%2BqPXqCrn8YWNm%2FdDMmNidix9%2BPptV9p%2BJeze0GASYxyDfxYwPdtXnskaMiOh2I41essUixQToFcHwyIcE10c8RK2vU7W7jjXWp1kHOdgPXA%2FerhJ35UOuDxPKuA7EvL0RFIxkkkHK5IHXpXedhHvLMyXWnKDAcDGefpmt1kaFHbZ0xjK7ltsCuaeSQsdvLhXQ9tTxOVUHYZIJ6%2FfKkqEyyFtB04OcVp0bxDo7I%2FiOSRjGKYwySyqunj%2Boj5VqHs6SRztpIOPWmUfZ0kUigg5OM%2BlJ10aRULO7x7EhVsbIOFUyQzIzaUbUfjXTxlOzrUPdOwydl55G4NGWo7M7XhLxyMJTk%2BP9TfeflU%2FLr7xvTkIJLlCGG4zkAJjFMI%2B0hGhDQlwD4sfOr7m2aBmMqZiX2nbbB6Eev1%2BND2r4WR1ymM5QjA5e6jujhtZ3kEkfeJlcnSQTnFCXsndXTSQ84yATvxBG1DLHHkhXVdZ0q4yATjzq57clIXu2ZGLBe7UAsR1zU%2F2b7hc8MqyaGVi5O4xmiYbWNULuRG6Y9oZOfICib2%2F1XAS0woGFGwyeW9RMfaUp1RRMYkyVYrpXV1LNtXVqWA7KRI5ie7JOcEkbnyoq%2F7QNxbtEzaiGyGHsn08qFayBkzJdwDc7CQufXw5FTe27tChu4C%2BQDxGD04U2lQh0Rwyuw4rhM8M8zWSA9xGxA0jfVipX0UwEIIxGiY1qQVJ6ZHP51TIZEwnNScLnYYppdZDA16jw4Y5Zzmpuvd4UjLYBJHLyqtwRpGk%2BWeHHifjWcc62yfLenBx%2FY3astvcQPGwVo10as7HfP0%2BFFzwi7naWM6teo5xgAjfHuApNMO57QzbSi4B9lhgfGnXY0hnaWzBGrxNGRzONgPWuW%2Bvas9t2i62jO48XDr5eXrXfDteTs7sUPhWh%2FV4ThM88k8Ou1cFEskM6LKArIxXHQ8B8h867W303fZv5dyPEMcNs441D5fdinP1gKRnj7RkJb2iPEFGP%2FFJfxyjGzgl20h8bDjnz%2B9803lUrZ2sgJZ41Ee4wTpOk%2FTNE9oQp2t2b%2BXupSIlUiNUtiSjdS2d%2FQDNbiyB1PTzW3cd20TeznbNWLAzyiNd9R28qOb8Odpd%2BAlp%2BYQnAmik8B9%2FKnnZHY8Ns7PcNG06e3hsrEOhPU%2FvXRe4nhn%2BHuz0tbRRIDumTjl0B%2BXxplezC1tGEbLjHHj%2B9Yjd3HkAAk5zwx6mlfas7FPEdjnZjnNJboyFTqWl1FhjkCCCPn508tezJI0Re7DA7npml9hE7lJNyBsRjjXUdo3Uth2csyRjVJqVCTkb79OXp1pbbuQ%2F0q7PsX7wqwOVbS2P08Kd3ccNpbm%2Bu0LQoeQ4jp8q82P%2FAKh3UBljUDLbGSPmKDPbs3adk8H5%2BVgBvG7bHPSnnx7fZL3%2FAAV%2BOfxNJfW8KxR9yHyEUHgn3ip%2F%2BmvftFdO0jBARjB5%2BVcr2m5uLeJ8EmDKPgV6B%2BBbJLXsKBpMf1su2o4yemRwNWySJup7S74wwfkkURo2mTvvFqI3Kjqcnc%2BWKS3jJLFLCSbeRH4keGUeQ6c6t7Vni7yEM7R91J4I42wpUZGDnz32x%2FKi6njkgvRKWni7xQwIBMRzt8Dj0zUJPR9EtODdlCUE8WFIK6hLgeHA6nhTa3lMsEkaPbzELiMOSFx0wCCSN9qTJKVWSGIHXGyOkoYgFQMnPzppYKdWlB44zqKcDuoOxIIBzSfkzccHaCuyQnuugtbJsA46hf3qZsp0RZbq37QupsbBoGbT04ioS3mx%2FMLexuuwMkkbH1GVWlUghkVNdxIHOSoezRh0HBvWqwtMJbC6VjcRWl2Q3Tw%2FAaev0oGW2vtSyns69XHs4jYgfBeNbkRGSO2F5b4Rc4Mbrkk7nhiox9mu0hMc0BOwysgDAHny3qkLW0uHt4QfCNW7xvzHIVebCIQNdNMRG2O7zxCnJx6jhVt63aNvL3SSTtbRjIL%2BNDgeeRvmqmvLe4gW3uoBhAQ0lt4Spzxx7J%2BXrRAA7hpGwToAHh%2BIArTIAMONLDiFpvbWrRXCXautxaAFlkUYBIGcEHdT5H50vSSMu7zjJyePrmnlBxHaXZptoVIjW3YrkiWTMjdcgeyPiar7PeSyugpkQSw42GNuBx6703v7WbtSORIxFHHHjTFGh0jPDUxAJI8hvnbNKe0obq3uZJr5pHutaju2jAZQObAbDpio2aeXD2%2FR5p1kZcCbG4xs3OnHYd2I7kq%2B2OAPI8%2FnSWxuhPEWIysww69DsM%2BVX%2F8At2ZByIwR55%2F81ydfyujl1V3bqbV2GCC%2Bo%2BXKktrdMtyEU6cnYEkZ9%2FHFXwXUgtljYalddIzz3zVctriYuoy2c6f7jj7%2BdT5uDY1c2sEr94bcAsckRSFA3mQOXnVsYVQscKpGE3VVGEj88c28zQkk8oXTvjntjP3tUbXJYFicA5IJ41XSYZNMWUKzHTuSTxJpH2xODPjUehOeVNwSQzgkAjwhulc7dnLqSCctyzkU%2FNjYY2baY0AUYJG3sg%2B%2FeuouHmvbEJoYxFdQGrVkk8OJ3rlrGDvzvkqFJOB033%2BFOHbvRb2yvIhdDJ3sTaBpHIMOe9b9tC%2FRL2h%2BBre81GxkMEy%2B3lSYyds46cfmKTD8E9sW9zG0T28qg5LRvyHHbFeg2%2FasUaPBCghEaFC7qc8SWxnidhknoKya4UuHJCK6huONsfuCfhVvP%2BpeLz8WU3ZvahfTiJpShZhkA5xv5HFeg9mz60MUYC6UGcDw5zS7tKwWcvA2GRhvv57e%2FnVfZKzxQPE7Ms8H9Nip3YY2P70nfyTPQzm6lNJPNayM0ba1kHgYDxMCcHO54ZxmtSxSG5cadp4QyhmBYN%2FcQd8DFFSq0sTxMWC3GQZF2Izn791VtrWS0kEcJWPMcsnFjtsM52U71Hz1TFFtqlWBklV0dDCQv6xvk4PlkUytQIo0kkUyRKc6hq1rjgSOfDO2fSgzMLfxyMjHvTIvdjcjHs45YqiG7V5yw8MuNRA3VxvsRw%2Bx0p%2BZaF9G7XMoheW3eG5hwNQU6D79OxH%2FADKPSoxT2RiMhjhWeQkKJgFAHPDLtz5gUrfD3DPalobkAN3aMQScfoPM7cDvWpLtJcC4thqDbyIo39Rw%2BGD61aRPUzZd25Zu%2Bhc%2Bx33jQ%2BjD%2BKqWIwjOSU9nUmOXnV6SSWsCopSWCQ5w3iRhjlwx8iKj3Udx%2FW7PLhlGGgJ8f%2FSf1Dj57c%2BNPKDI5Z1nUWkrRPIFBKHTgb%2FsK136OWWeDJZ8B4lCsd%2BnA9aqWYLiVP8AergNjg3Qj3kbVGRwdTAKCASpzz2A%2FemgGH5%2BWEBo9E1vKukrjAkXPAjkQB7uNL5lXv3FuVkjHsl%2BYO%2FxrSjRZIpYldfTicb%2FADyaioVgAVGAMDPPFGRgNyjRsR2j3uBIPy1jbIsYbmXff03yedL%2B5tyFuZYe5gBPUyzycB7geXKuomX%2FAGqSN2t7Ud1qYReN1X1PhQHqd%2FfigzYS3F1ZO6CCzjDNFqGPAOLb78SNzvxqOnxyVhct2dc67gMEeUqUx4QNsevCuxgiS6UaNJBGQR5ikPbFvDNEtwAVjJ%2Foq%2B39Me059dh7xWuwu1ms3%2FKXepTuMsD4Tvhah83OzYp8fWeq6SOFo9Ax4dOrbrkf5olHyufIH0qMTo7AavBz9PsVJlwnAjAHCuPV8UXMXebg9MVkS6SFOMZ4CrNySp%2BHTaqnO5079D0o%2BYeK%2BUIACM4xuMUimsmFyu%2BpdWpQBx91MjJ3Zy%2BSD7yalChdkaUquW1IM%2BJjnn0GANz7qfjotgBHRTM0bKpEfhTGNZ5kiie9SREhctJCYB3bKxQrwONuAoTureJyZDju1MZZc7t1Hvqy31eAQgxTxtgd2dpAR0PH0rplSq8yh1Elz3U1q8ZixkhhjYZHIbGj172zjeWK3WWGIAoVbJJPFR7voaDtmJlBtSMtrMkDxbk%2BtWZ7iA3Nkqx3WlP9mdtWlM5J226ih100gkSiYhjwYgoTjBHkR97Uh7X7fkWZx2RAJJQojkuSuV2PLqRnjRd%2FE95psrWQokvjm08QOQ8qZL2XZwWXdEoiqPZU4zuNtqTm88%2FZrLfoj7O7Kl7SImvL64mZsEjWQoPoNqcjs%2Bys00RLqYZ1OR7I5486tj7i2hCWisMkDHEmg7yeRWeFFw5jwxPLIx%2B4NaXz6yfTZ4z2ouZmuJFUsdEYCoOg32%2BP1qFuvhbGnJQhRzHn99Kk0KKMlsFcafVv4IrI5I%2B7Ggb6CA3niuvmZMRtR%2FUo2ExAK%2BY329dtqZrPFcIseR%2BYK57wjGryPnQKw63BAydQX0A51k2qRtKbnJ3HHpRBdbzyQsV7tWjYFHhcbNudj0I5Vu8t0KxTWTsYiRsT4o2zz%2BPGoPHLNl2Vg6KNQHFhj68PWpCR7CfUVzJpIKNwI22NFhvdpfwkyHTeRp3kmBjvwM%2F93E%2BY86WqDpBK4Bxg448d%2FTn76PtVjtrkdoMxNsIzIjMeZ%2FR5sOHoM0veV5mBY4HHSPv72puQTEjNGoUDEfAdCf8AFZE4VySEwBjDef2K0sTaA2DpbBJ9%2BKicOijUANxkrnhsKYDC8tjNdTTrIJEDaInYHUxA3I20g9WxsOYOaJWOGR1gmLTXsiYubrgltFn2F5DbAA4njvvRV5KZbeOLKQzsmVjixoghG5JPU8TjyHqr7kIn5W0jPfqe9e4vGOpOrleC4zsW%2BHTlqyr8Sdn25kMcUqOVTVPgjTEo9lTyAzy5hd65G%2BtzP2lNJMkkdvI2NWN8YOg%2BucnrgmuxuIINEMMUT%2FlDgIeDXT88D%2B3bJY7kdKDuFSWUyuA7ayiYGBLLw8I6Lw%2BNDcEm7E7RkW4S3vGLawrxlVOWBHD5V1ImVl0xJIuTjW%2BNvQVzadlsvcaNYmeWRXfOMA5wV94yKt7P7Untu6ju5VEbqO7kJHHoc58Q3Fc3y%2FHvvlbjr8V0LRORq9gs2BnntiqHhZRggDAGR0oiKRjGCe8A5ENgevAfWrGbWjxoFjUDVLIenT4VyWqlnhDazg8lBH3mrkQEvLOGZS4UINmuGzsBj9PCiEtEeTMhCooySdtI6etbBllfv0QKzZW3U%2F8ABjH6vI8d%2FfT89BYGvrYzBmSJC6FgdIyHlIyVA6ADfzFASx6OK5jUaskklW%2FUc8QARTWaUx27tBkogNvaqOPV29%2BR8akbWF3MTRkjHcas7kalX66zV%2Bfk%2FqV4K1IRkEgX2ARIJN%2BI6enzNbFzgrIcDQO78K41L%2B%2FKiUkPc2culRqVkc4%2BH1oILNI7ZJydwfrW6%2BSDOK3AGgleUSRmWQlmbjx6Vfl7ht3YkDbbArUdppOB4h58qYwRrEus4O%2BAOv8Aio3o%2Fjin%2BnYQvPIQNI0gn9RI4D6fGlcd7I10JZQGzjYDOTirO15BejukcZjYBF67%2FZoV2%2FKyyIgUyAnLHkMcR9867f8APxnO37c%2FyXaJvZs6WGAzZyByHL6VuySPEjuCyquV8ztigGZ0J1qcDbJ4k7%2FzRVjd%2FllIPAqSBji3IV0xKmEsgRu6XKlsM54Y25UNE4Ey4YAnfY55861mWcqXd9cnPl0%2FYVueEwseWo7YPAUYAuyuRl5xlSBjyORg%2FD96qleJtUkpaWUEuwzsWP7b0NaPGiEb%2BIDGeecf4qMiMpZTvryfv76U0nsBNxM8ywQ92FSMYEajbj%2FOPhzqvWEOy7jw%2Bu5%2Fit2qyG4YZOUUHf0%2FmrLmF41iL7GTBxnqabGaWTOnWNg2wzxOKjcN3TYCagNhnjw4%2B%2Bogx%2BB365GPlVU0kmx15J9og8TWB0VuUsLX%2FevHrCtcXcnimkc7hFHDPxxkDbFW26wLZi2hg0yzMT3TkyF25s5%2FWV6DYHbJO1aQNOzumRHEMvPI3icHbCj9IO%2B%2B5%2BtVxQNMJAs7wpIo711XxaM4Eajl0A5b53rksWVXEQuLtiJmbCn8xccTHGNtCY21s222w3AoOZe%2BlhY6YliV0hUDgODN7h4QebE8qfNbwm373AFvGSkapspwdznouMZ8if1CgpLGV7tSFVIlHeSMRsiKPAmOg455kjrS6Yqks1LwJOhy%2BZSv9qAeEfQe80Bd2UTM5YazM4ATkuG3b09rPpT62ieeS4uJTpLHAY7FIxvn3%2FQiqpIACe8XSXGkD%2B1cb%2FL5mpW%2BzwkW5uezJBFJEJogQqY2YZxj3b%2FKm8TiSOOONwzF%2FEsZzk9DjzqM0P5vvHZVUs4wPLH8fvSqC2fsrv720USKEBWI8C55j3Z%2BAqV5lUldHI%2BkOoGVXdmfmw6cqlkrD4ie8kI0jOyr09%2B2380u7KuluLZWfW3h1vFtx4AeXT40wgJE8lxIQ0sYDKEGArHhz5bfCo5lMyV4obtEGnFohJY7DXnJ%2BefhWRRD8%2FBEoYFHQNjffTn96DQapSpwdSoqhjxyWq5ptPa7ylm0LdEnG2FDYOPd9a2NqnCS2kfdgaYpCMA74IGPpU1i0DKgF0OQB58vvnVb9%2FELi3xgo2o4PAqSpH%2Fd8q0sjEYY7Lqz%2FqA2x9a2Dq%2FMcaCQ5f8AtX%2B7z9KCvLwrE7swG3uHlW55GkkJ2zqwQOFIu3blXItwcb5b9v5qnxceXRO%2BsgKG5d5u9L6VILk9eOAPgPjRSXwli3XxSHGrngcfpQMUIEqxuxGtSurGcD%2Bdqtt401uFJQQqcZb7%2BxXouUzd0ncnBHiAbyxuT8q3KIxKCjjC7g9McR9Kqg2QzvkvnJUHYnfB%2BlUqzmMZIBwTw48vqaeEHJcMiqAf92ARtx2yanM40uXIOgaN9uufmKDyDgbLnAB8%2BtSRlLam6n1A6mnCi7dW786faGnltnNWyP4mdVZkhQZ8%2BOP2qFmrNI8jNjQVPH2mzVv5lRYyMVGJ%2FCoxvnNH8s0krHIXxaNjjyH%2BKsuGZ4YskscYGBvwx8P5odiVZNsgtqJ61sTPLFHCMDSunUfM70QaaLIwurxBcAc%2BG31rfdskjoU1Op3B4ZO5%2BoFRhkZJCf8AUX93D961JI0rl1fSDyzwrM6i4OjvxH4dEvdrjkAFGfXDHejZYEitmjjyiIyRqByBz8%2FpWVlctWQ2uLrupVUwWcbNDABhMr7JI544%2BtEpCr3QhkLOkcJnOTu7Y%2FV5b7DyHStVlSp4BuTrayh4I1t%2BYYD9TKMjPlnBx1FAZ7wOzcWm7r0XURt98zWVlToxU7FZWYcj9cisYBYURRhV4fHH0rdZU6oT9suezrWN7XCs3iY9SW0%2FIZx6mi7Zz%2BSi5GaYK56gBf8A9GsrK3f0aCYGP5hG5tIFPpn%2FABUL4kXM4HDvHHu41lZUjLrw4vnbnJErt5koM%2FWgnJ1uOWaysrAhITjPrXISsZbhmc5JlH0%2FxWVldX%2Bf7qHyD7lmQLpJ8OFHptV1rbRzTo8gJLIdXnsf5rKyur8JGnaEMdt2bphUDx5zz9rH0ApNGToj9y%2B7VW6ym5LTZbaMm2bG7qQf%2B0Vu7hjtL2GKJRpRDu25PCsrKeAyCNVZQuRg%2FQD%2BTW%2FaYOeImyBy3z%2FArKym%2FIKoye9Uf6P3FRLFbLI44xWqyiCyZiEkAJxrxx5cKiq%2F0h11GsrKzP%2FZ&img9=data%3Aimage%2Fjpeg%3Bbase64%2C%2F9j%2F4AAQSkZJRgABAQAAAQABAAD%2F2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys%2FRD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N%2F%2FAABEIAJQBDAMBIgACEQEDEQH%2FxAAbAAABBQEBAAAAAAAAAAAAAAADAAECBAUGB%2F%2FEADoQAAICAQMCBQEECAUFAQAAAAECAAMRBBIhMUEFEyJRYXEUMoGRBiNCUnKhsdEzgsHh8BVDU2KSNP%2FEABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf%2FEACMRAAICAQQDAQEBAQAAAAAAAAABAhEDBBIhMRNBUSIUMmH%2F2gAMAwEAAhEDEQA%2FAOErfAxiETES59%2F5SaqZ7aR5bZID2klUE9CPmOvEmPmaJGTYyg%2BodiOOekgNNubJZhjpzx%2BUOI8NqZDfwjZXa1bbCnEr0eco22qSTn1CXAT%2BEfPsTiJwdiU%2FoIs6YyD%2BMlXsuYLZtAPHSEG3jK5x7wqLW33lAjUWiXJDavTLpDXtetwy5BrIP4fEQsrJAQMB3zz7f7xjTWeh5i8gY4fBjM%2FySZFJ7EdsjmD8tXJC7hiSShskrZk%2FWFootQsbSCD0GIuRrjpghSo%2B8PzhFqr7LGddnAxiErUqAwJ%2BRnpGK39GWpUPHEmAF7flIepskdB1zJqpZBmFkslnI9JGfpIP53%2Fk4%2BuIYIAoyDgjr7RDg9QU6ZxnECCsyXMBmxAPlhIihz11NQ%2FzS7fo6V2k2g7hnNZzj6x18F8xQyXAIe7IesaZVop%2FZA%2FIupcxjXp1bbdnI7qCJebwMgAjW0gnpkmSHgmvTIR9wzjjofzhYrKP2Whv8K1lJ%2FfxzKt1NlZ3OMjsR1mymk8QoBH2cWKOxTMt6ZH1K4v8PGO4Vh%2FRuYdk7mjmAbVwVY4%2BesgWQn9Yik%2B44M6HW%2BDBhv02ktQE8ANg5%2BhmJfpzVYa7SamH7NqlTCjWM0%2Byq1AJ%2FVMCPY9ZB6TXy6lT8iWPJYn71ZH1icahFxy6e2ciS4mynXTM23b%2B109xArUthJpcH6y266Yn9bWA3xxCUU6NSWVrUPw2RM3G2beSkU0R9wWxBt%2FeBxmHGlDDK1uR7hpr6e3QtUV1Oywfw4Mf7J4I3K3WIPaV4jB6l%2FKMsLiSG6EAkwBKSNnIEuc9IVY%2B0RwB36RktjjBjwNl9dLBXcDPtJ1X6c3Knnht3THb2kvJFew8cn0gg6d48lnNgQMAT0Bib05yPpGssPonin8Icx8nPMKazhc8EgGLybD2%2FOPyR%2Bk7JfAYkgfeT8lunU%2FEY1MOqmPfEh45fBs4jg%2FJ%2FOLyX%2FdMfyrB0U%2FlHuiLZL4OuWbaASfiT8wY9K4PxxBgWK3Rh9BDKo42%2BZu75GBDciHFjpbnqzZbg5OYQZXJUZ9hAMGz0Xj84dePXsYe2CeY7RDTJtaDhFUfQ%2B00fDdGl1yfqAwJ4wxH9CICpNl9TOQEcfecn0%2F1nW%2BDWULaFp1dNmBghGzn2z6RMsk6XBcIbnyVm8KoroLV6KknHXDMf5sf6TMNOp8%2Fy8NwcDA6fhPRa6KNpZAVbHc8Sv8AZamfd6Q3cjic0dTR1z0drs40eB6izlzuB5wq4J9%2BZ0VK2k0lsFahhV4Yj8T%2FALzQOmC2hkOPjPEEdOBwFH15kyy7ioYNhR12mttuQ0VlEJO4hRj%2B8o26SzUP9mu0yXt2CuAw%2FoJ0Na7fcSdjU2KVtrVx8iSsrRTwqXJwt3hNYz%2Bs11LdQFcFR%2BUpajS6vOxtfXdWOi31Z%2Fr%2FAKGd4nh3h9b%2BZRTsYjBwxx%2BXSRfTaRnAspRx3yuczdZ18OeWlf089%2F6To3JF9CKe7ad2A%2FI5lPU%2BDadedNrrFPZbEnpNvgnhNjb66RW3fyyRK2o%2FRLS2gWVXHd0yR0EtamHsj%2BbKv8nmLeC6yw%2Bi2u0d9pgj4K6EnK7u4JInoFv6I3i4%2BW6uO2LNp%2FmIE%2Fovrlzhrlz77WEtTxMzf9EekcGvhVgBLZ%2BoGcSDeHvniwD8J19v6Pa%2Bltz3NjGf8E%2F1mdcmqrfaQD84M1Wxmby54nOrJiQWTElHax5Xwtj1%2FarCqBvUiA8fUxtc7CsLWSGY8YlrwyhLb7q7rGKMvJJ4E5c8%2BaR04Ifm2T1KaJtciBQiNjAHP5mQpvo097BgMBgcjpgwPjC10aiok57ADk8dDMIam1ndgv3srg%2BwnM2dCVnV36xDaT6WXaHXf257fl%2FOD%2B0brbEYKNp9LHoBMvSg3aLJYbqjjGe3%2FMwpYpqlO7bW6jjPf4jsVUa%2BnrLVuoJJVSy7xg4%2FvCVOduOdzLnHt8yul7UW1MCPS5HXqDLVSjdYinlWO09wP7RkvggjOw9J4zjp3jhmHDEZ%2BeIKpyikMANgJJP1xCI%2FnWcj0gYOfeOxMnULGJ47ZGe8tmlRtHmKrH9k5gtO9dYxu9W0fJzgwVtruAykbehaFk9hnUqpYkAexOOfaQqtKPjeQD%2F6yv8AafNLit8PuDAEcEjPX%2BcldY%2Fl1genI5xHYUXXZAq%2BsE5wfT1MZRvDN7HEr1%2FrKibW2jvxCJcq2BV4THU9x7yrIcV8CeW9g%2B8ePeWdI2r0z76WB9x7xm1ItbNKBF6YPIMitjUWEAYB6wsiv%2BHW%2BH%2FpNTtJvRsgfun%2FAEEuafx%2FR6lxs9BPY8ziPMAXAbDDjE0PCRpha1urf0heADjJk7UG6SO9ovS5A6EEY4hFIPHAnHHxN9ODfUxsB6Ln0qO0In6RWWMmys4%2Fa3ESfHfRay8cnUWKxJCxLUT3Ey6fGkC7m3flLo8T0pKhTjP84nGSGpwZdr0xTqBjuYHUaUOp2kZ7SVHiFTZX%2FWXE1FLrjAzM7lH0apQkuzF8p6xtZlwOsNTqHX09U%2BkvuKslioOZWbHTAxL37u0Rs2vhlV9QyPg5K9cywmrZicEfWQcKV6Sv5aHPaXtTM3KSfZbFjYOLEJPbEqutjHnyz%2BEq3W%2FZ2BUwya6llBYID9ZSg%2FRDyRfZ40JMSEkJ3GbBXBfOrZydoBHEDdU40qmp8ktkAHkAQ2q5NQHczYa%2FTaTRoBUC1n7QPScWVfs7MbqCozfsq6rRVtcSNQvQTLs0JIcAFW3blE3arwWCqMsTnMNq9EbRvqzk8nEyovfXZjeGV%2FrPLfq6yzqKCXqPVlXgGXU0qKAzA7x7yxeGsoAc8QE5FQ1vZpWA4AOcx9O%2BLiy5G7kj5jq2z0%2FsmJKQX3BsDHMYggdSprP1JgXZq17KepZj1%2F5iFar9aQBke8DdSXbO0%2FHEA4GrtLH0liPnr7yeAw4PQEEyNVZ3YIwRDGrDggGA7RVUYu57559j%2FwA5mpWnmAEqwyMg%2FwBYDToV3oq53nmamk20rg9CYyJSKT6eyobN%2BU%2BZHyF2jc0ta0iy3avSV7dyqiryeh7x2JNk9RcBhaVPlgbQue8SagtXtsByP2viVtQUFgzwe2Okj5hDAqYgo0GQMQRycdY5qsK46RaWwPx0OJBjhiMSkZsXmts8rHAOZNNQUfknHvBHgj%2BclqVqsUGslWH5GMKLX2%2FjCkmHo8Qf96YRd1OHIhK7Y7JeNHR1a5kYsGaWqPHHrdcv3nMLq9pxniEW5HP3uYXZHjro7ivx6u1BlgDiWa9X5iAg5nArqRWwyZsaHxIMQGfPtHGCZMpzirZ05v4gTf6xKP2kMMgyvdqfLG7ru44leOiHmt8GtrdPYaRqKhuB6g9vmc9Zrrg5AdOPj%2FaavhviuWWq1mVcc56TM8SFL621qkJUnggyYykuBzUXyefiTWQEkOJ1lMLRQdReqJjcBxmXNdoWRVDKcAAfjBeHEDUfewSOM8S7qtSSdh2k89D7Tkyr9s6MbdAdBpgtbOQMDpma%2BlTdpy%2B3mVKP%2FwAijj1HmauiKmkjtjAmYTbsw7eXYgcZg7MkAEQ%2BsxXayj3lV3zXz97MkuIFhII%2FZu%2FWGP8Ah57ylkraobvAtcm3RUrENyciE1hRUCKvIGTK%2BmsIQfEFrLdzHntAzrkJSFK7scmTUAuARjEr1WqKQBwwh67lAOe8B0TrAWwlTnBkVZ%2FMyDx7RLkEkdDHDilzu5jEPaSDuA4xmC05LWHcOB3hBYLMgdzxCKprTbgZYQDooatd1nHQdDKwyGwDNR6SyHA5meqbXYEdIDTRf0r9D7Qlw3ktnmAq9KCF5K5EdkvsCLMcZ5jq5LYlVm5J%2BYSjcSrfMLHXBK9c5PeBAbGcyVzEZ%2BJEWZTGIFIbccwlb4PMrM2DGNnzAKs0Mm1cA8w%2Fh9ppu9f5TLS4g5zCNqN2DnDSk6IlC1tOkr136xVJAEa6%2FLEKSfYCYVNqty%2BWA9o1%2FiBD45VegVZo8lnNHT7XSNf7UtINmT5h6Ie3zK58Tyec5mR55sON3PaDNwBwTI3GyworrJSCnEnOtENCaw1KbFOCoz0mXqfFm3rg5xnn3mr14xn495zPiejfS3HapNLnKH2%2BJzaiL7R0aaS6Zs%2BGeNNhkdunTmbnhnjJLEI3I7GecI7VvkHmW9Hr30up80cg9RORZDpnhTO11OsF1jtnvzmDp1CuQCcfWczX4oTY%2FPpY5jHXlbQ27ofzlbkT4qOofUgDGR96BNy71YzGt8RV%2FuHvmONblRyARDcPxs6xH3UZ6cyhfcGc4lUeIKtBXfzwZTr1wdiGzn2jshQ5Nmgsy8Q4RtoYg8wPh7I6AtkTa0lPmoAq9Pcxozm6AIualAB3DrA2cYYnnPM0L6mRSU6nrM29WC8nnMqiIuyabQfnGYUWg8E8iZeov8v1ewxB06jcQ7N3isvZZ0xC%2BSCCN2MzMsdDbgD7xkPtd%2BzcFzkYwD2kUtDlWWsp2YtiNshQone3lelegjVanI2ypqbi65PAzgGVfO2Nwcge0k0UQ2psPmcSwLQtaiU6MXEnPeNe5Vse0B0Fa45YEj2EY2fuysCHJOOfeFX0fe5gOhXWHv3lfeCepEex8sZCsjnMCkgqsf2cmLzCIFrtjEbhj6SBsz1hY6LdeqKvgcCEbFxznmZLW4PENRcQwyYWJxLTsUfgwT3FmzgSOpff6l4xKwuXHPEGxpGjJiDBklM70cLRORupTUVNVaMo3aSjiNq%2BGTbXRyviHhV%2BkJZFNlXZgP6yljgf8E7iVbvDtHfy9CZ9xwZyT0lu4nXDVpKpHIlDkYxzJWIyKrGdG%2FgekP8AhtYh%2BuZWv8GvHFdtbKDxu4mL084m8dRjfswQzjoZPexAGenSaLeDasf9rP8ACw%2FvBN4bqk60WkfCZ%2FpM%2FHNejRZIP2NTqFVDuJLSLa1g3oAB95FtNYvWtx8FcQLIQeRD9IFtZpabxfUVkZOQCDib%2Fhf6UHftdGU%2FWcgFz7fgY6hlMFJomWOMj0dfEltQsHzn5g3cOMbpwNV91R4dgJeo8XvT75JEvfZk8FdHVXUejJwcygKwrqh95Vq8bTy8Pnd7Q2l11VtynI6947TEoyRoo74I5x0hyXsVQXOAYGjV1MWHHEit6lsA8ZlENMlrNMgqAdnXn9nH9pmOFBwGtH8YE0fENT6AQeeZkDUsz7cbiexiLgnRd0ZCEyGqbdYTJIF27h19swJO9sHiA65IruJ6Z%2FCKyxkHPB7yzpUDPtx%2BUh4l9lP%2BIx47Kf8AWAXyUV1CkZBBJia0qvTrIam%2FSXHdVpUorUYPrOc%2B8oXWVk5psY47ZyD9JLZaQZ7snGJHzjgiVfNyoJMj5mZNlUWTZnEmLuQMyn5mDHrJYgwTBo1arCUZDjmAsT1wCMQ45hGOTzGI2QZMGBBhVnoo4GggkhIAyQlohkooooyKJDpHEiI8ZLFHjR4CFk%2B5iiihQWwT6aiz79KH%2FLAN4Vo26U7f4SZcjYBieOD9DWWa6ZnW%2BCadlwljp7cZmdqfB9TTkqvmL7r1%2FKdHFMpaaEjWGryR75OLtRk4KlfqI1VzVnPOZ2diJYP1iK%2F8QzKr%2BGaOznyAP4Tic8tK10zqjrIv%2FSMWnxJ0XHSWK%2FE8HMunwXSMeBZj%2BKOPB9IOMP8AnF4Mg%2F6cRQ1PiZdSMypVq9p3TWfwSk522Nz7jpK1ngL%2FALNinHTgyXhy%2FC458L9j0eI1vu3ghsdfiPXrCUyCCM9fYfMrP4TrKQSihh32mUrlspIBDVsO2MTNqS7RotsumdH9r2UejaM9%2B5mPqNWXOWYn8ZQe%2B3HL9esEGLnqZLmUoJF7eNhYIsCbCQfWo%2BMQW5x6Rkg%2FMKtVr1u6hQqdcSbsdUV2Y57xK0mtQbknnEXlAHhvzioY4JPeWUAXmCoqDPhjz2x0lsUOAR973lJCYNWBsh9g94FU28d89ZOxjW23av8AOUSzXBkwYIGTBnoI4WgoMmIIGTBlEMIJKQBkpRDQ8kJDPMkIIljxRo8YmKPGiEYqHiiijJoUUUUBUKNFFEUPFFFGSKKKMYDSFGZVdSrqrA%2FvDMeNJZStFG%2FwjR29ayje6HH8pnXeAP8A9m4H%2BLib8aZSwY5ejeOfJH2crb4VrKetO%2FHdTmVnpvT71Vo%2FA4nZxj8Y%2FGYvSL0zdat%2B0cWCV6jEnuPHtOttrVkPoXPviUV8J02zDqWcnJfOOszemkvZotTF9mIpz90fykyzY5sXM0z4LQTk22%2FTI%2FtF%2FwBH0uOth%2FzReCZfngY5v2E%2BuROs5myfCNLjo%2F8A9Srb4Jl8124X%2FwBusmWHIgWaDNJYQRRTrRzMkDJiKKUQyYkx0jRS0Qx5IRRRkDxRRRoQohFFATHEeKKMkUaKKACiiiiGPFFFGT7GMUUUCkMYooohjRRRQGKMY0UTAUYxRQKImQMUUljRGNFFEWf%2F2Q%3D%3D