# 💌 Valentine Verification

A faux-reCAPTCHA Valentine page. Recipients have to "verify they're human" by clicking a fake captcha, selecting all 9 squares (every single one secretly contains a heart), and dragging a slider all the way to "yes" — then they're told they're your valentine. The decline button skitters away when you try to click it.

Available in **English and German**, and every text on the page can be replaced with your own wording.

> ### 🔗 Try it now: [**love.d-solve.de/customize**](https://love.d-solve.de/customize)
> Fill in a form — language, names, wording, challenge, pictures — and get your finished link instantly. No URL-encoding, no query-string syntax.

This page is already hosted at **[love.d-solve.de](https://love.d-solve.de)** — most people just need the first section below. If you want to run your own copy instead, skip to [For developers](#-for-developers--self-hosting-this-project).

---

# ❤️ For users — sending a Valentine via love.d-solve.de

You don't need to install or deploy anything.

## The easy way — the customize page

Go to **[love.d-solve.de/customize](https://love.d-solve.de/customize)**. Pick the language, type in the names, any wording you want to replace, which squares must be selected, and up to nine pictures for the grid — the page builds the finished link live as you type, with a "Copy" button and a live preview frame you can check before sending it. Every field has a placeholder example showing what to type, and there's a numbered 3×3 reference next to the squares field so the numbering is never in doubt. Leave anything empty and it falls back to the built-in text for the language you picked.

Everything from **"The basics"** onward explains how the exact same thing works if you'd rather build the link by hand, or want to understand what the customize page is doing under the hood.

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
| `hint` | Second, smaller line of the challenge header | `?hint=Pick%20carefully.` |
| `cells` | Which squares must be selected to pass | `?cells=all` · `?cells=any` · `?cells=1,2,5` |
| `img1` … `img9` | Picture URL for each square (1 = top-left, 9 = bottom-right) | `?img1=https://i.imgur.com/abc.jpg` |
| `question` | The headline above the slider | `?question=Really%2C%20*yes%20or%20no*%3F` |
| `scale` | Comma-separated labels under the slider track | `?scale=NO%2CMAYBE%2CYES` |
| `readouts` | Comma-separated phrases shown as the slider moves, 0 % → 100 % | `?readouts=nope%2Csure%2Cabsolutely` |
| `reveal` | Final headline, printed after "*name*," | `?reveal=you%20are%20my%20valentine.` |
| `msg` | Message under the final headline | `?msg=Be%20mine` |

**Formatting inside any wording field:** wrap a phrase in `*asterisks*` to render it in the italic accent colour, and use `\n` to force a line break. (Plain text only — HTML is never interpreted.)

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

Each `img1` … `img9` parameter takes the URL of a picture for that square. Any image URL works — your own photos hosted somewhere, or a placeholder while you're testing.

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

Paste that straight into a browser — it renders immediately, no setup needed. Swap `img1`/`img2`/`img3` for real photo URLs (imgur, your own site, Cloudinary, whatever) when you're ready to send the real thing. Squares left unset just show the built-in SVG heart, which already looks nice on its own.

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

## 🖼️ Picture notes

- **9 squares** in a 3×3 grid, numbered 1–9 as shown [above](#which-squares-are-which).
- Images are **cropped square** (`object-fit: cover`) — aim for roughly square sources.
- A square you don't set falls back to the **built-in SVG heart** (still pretty, still on-brand).
- **The joke** is that all 9 squares "contain a heart" so the recipient has to select all 9. If you swap in real photos, you can still keep `cells=all` — it works regardless of what the photos look like — or loosen it with `cells=any` or pick specific squares with `cells=1,2,5`.

## 🧪 Before you send it

- [ ] Open the link yourself in an incognito window — check the language, name and wording render.
- [ ] Click the "I'm not a robot" box → wait for the loader → see the image grid.
- [ ] **Actually solve your own challenge.** With `cells=all` select all 9; with a list like `cells=1,2,5` select exactly those squares, counting [1–9 as shown above](#which-squares-are-which) — then "VERIFY".
- [ ] Drag slider all the way → "CONFIRM" → reveal screen with the recipient's name.
- [ ] Paste the link into Slack or iMessage to check the share preview looks right.
- [ ] Try the "decline" button — it should skitter away.

## 🩹 Troubleshooting

**Images don't load**
Open the image URL directly in your browser. If *that* fails, the URL is wrong or the host requires auth. If it loads on its own but not inside the page, your `&` probably wasn't URL-encoded (see above) and got cut off mid-link.

**Share preview (Slack/iMessage/Twitter) won't update**
Social platforms cache aggressively per-URL. Append a throwaway parameter like `&v=2` to force a fresh preview, or use the platform's own debugger:
- Slack: paste the URL into a private chat, click "Re-fetch"
- Twitter/X: [card validator](https://cards-dev.twitter.com/validator)
- Facebook: [sharing debugger](https://developers.facebook.com/tools/debug/)

**Captcha won't pass no matter what I click**
You've set `cells` to a specific list and are selecting the wrong squares. Squares count **1–9**, left-to-right and top-to-bottom: row 1 = `1,2,3`, row 2 = `4,5,6`, row 3 = `7,8,9`. You have to select *exactly* the listed squares — no more, no fewer. Numbers outside 1–9 are ignored, and if none of them are valid the challenge silently falls back to `all` (select all 9).

**A wording field shows literal `*asterisks*` or `\n`**
Those only work in the wording parameters (`title`, `subtitle`, `hint`, `question`, `reveal`) — not in `to`, `from`, `prompt`, `scale` or `readouts`.

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

## 🚀 Deploy

Built as static HTML + JS + CSS. **No build step, no backend required.** Drop it on any host.

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

## 👀 Preview locally

Browsers block the in-browser Babel transform when you open `index.html` directly via `file://`. Run a one-liner static server from inside the folder:

```bash
# any of these work
npx serve .
python3 -m http.server 8000
php -S localhost:8000
```

Then open `http://localhost:8000/?to=Sarah&from=Alex`.

## 🎨 Personalising it

The [user section above](#-for-users--sending-a-valentine-via-love-d-solve-de) covers URL parameters, which work on any deployment, not just `love.d-solve.de`. The `/customize` page (`customize/index.html`) comes along with the rest of the site and works out of the box on your own deployment too — it detects its own base URL from wherever it's hosted, so `https://your-domain.com/customize` builds links against `https://your-domain.com/` automatically. As a host you also get two more options:

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
  hint:     "If there are none, click verify.",
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

- **9 squares** in a 3×3 grid, numbered 1–9 left-to-right and top-to-bottom.
- Each square accepts a URL (`http://`, `https://`, or relative path like `/photos/x.jpg`).
- Images are **cropped square** (`object-fit: cover`) — aim for roughly square sources.
- `null` (or missing) squares fall back to the **built-in SVG hearts** (still pretty, still on-brand).
- **The joke** is that all 9 squares "contain a heart" so the user has to select all 9. If you swap in real photos, you can:
  - Leave `correctCells: "all"` — works regardless of what the photos look like.
  - Set `correctCells: "any"` to just accept any non-empty selection.
  - Set `correctCells: [1, 4, 9]` to require exactly those squares (useful if only some photos really do show the thing).
- Cross-origin images: most hosts (S3, Cloudinary, imgur, your own server) work fine. If you see broken images, check the host's CORS headers — but since we use plain `<img>` tags (not canvas), CORS *usually* isn't required.

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
