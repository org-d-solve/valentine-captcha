# 💌 Valentine Verification

A faux-reCAPTCHA Valentine page. Recipients have to "verify they're human" by clicking a fake captcha, selecting all 9 squares (every single one secretly contains a heart), and dragging a slider all the way to "yes" — then they're told they're your valentine. The decline button skitters away when you try to click it.

> ### 🔗 Try it now: [**love.d-solve.de/customize**](https://love.d-solve.de/customize)
> Fill in a form — names, message, challenge, pictures — and get your finished link instantly. No URL-encoding, no query-string syntax.

This page is already hosted at **[love.d-solve.de](https://love.d-solve.de)** — most people just need the first section below. If you want to run your own copy instead, skip to [For developers](#-for-developers--self-hosting-this-project).

---

# ❤️ For users — sending a Valentine via love.d-solve.de

You don't need to install or deploy anything.

## The easy way — the customize page

Go to **[love.d-solve.de/customize](https://love.d-solve.de/customize)**. Type in the recipient's name, your name, a message, the challenge prompt, which cells must be selected, and up to nine pictures for the grid — the page builds the finished link live as you type, with a "Copy" button and a live preview frame you can check before sending it. Every field has a small placeholder example showing what to type. Leave anything empty and it falls back to the default, same as below.

Everything from **"The basics"** onward explains how the exact same thing works if you'd rather build the link by hand, or want to understand what the customize page is doing under the hood.

## The basics

```
https://love.d-solve.de/?to=Sarah&from=Alex&msg=Be%20mine%20pls
```

Open that in a browser (or send it to someone) and it just works.

**Full parameter list:**

| Param | What it does | Example |
|---|---|---|
| `to` | Recipient's name (shown big at the top + reveal) | `?to=Sarah` |
| `from` | Sender's name (shown on reveal) | `?from=Alex` |
| `msg` | Custom message on the reveal screen | `?msg=Be%20mine` |
| `prompt` | What the captcha asks the user to find | `?prompt=a%20red%20flag` |
| `cells` | Which cells must be selected to pass | `?cells=all` · `?cells=any` · `?cells=0,3,8` |
| `img0` … `img8` | URL of the image in each captcha cell (0 = top-left, 8 = bottom-right) | `?img0=https://i.imgur.com/abc.jpg` |

**Encoding rules:** URL-encode spaces (`%20`), commas (`%2C`), `&`, `=`, etc. In JavaScript: `encodeURIComponent("Be mine!")`.

Don't want to encode it by hand? Paste the raw value into an online encoder like **[urlencoder.org](https://www.urlencoder.org/)**, copy the encoded result, and drop that into the parameter instead.

## Adding your own pictures to the grid

Each `img0` … `img8` parameter takes the URL of a picture for that grid cell (9 cells total, numbered left-to-right, top-to-bottom). Any image URL works — your own photos hosted somewhere, or a placeholder while you're testing.

For example, using [dummyimage.com](https://dummyimage.com) as quick placeholder pictures:

```
img0 = https://dummyimage.com/600x400/000/fff&text=test-image-1
img1 = https://dummyimage.com/600x400/000/fff&text=test-image-2
img2 = https://dummyimage.com/600x400/000/fff&text=test-image-3
```

…and so on for `img3` up to `img8` (just bump the number in `text=test-image-N`).

**Important:** those placeholder URLs contain their own `&`, which would otherwise get parsed as the start of a new URL parameter. URL-encode the whole image URL before dropping it into the `love.d-solve.de` link — encode `://`, `/`, `&`, `=` as `%3A%2F%2F`, `%2F`, `%26`, `%3D` respectively.

**Full worked example** — a Valentine for Sarah, from Alex, with three placeholder pictures and the rest falling back to the default heart:

```
https://love.d-solve.de/?to=Sarah&from=Alex&msg=Be%20mine%3F&img0=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-1&img1=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-2&img2=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-3
```

Paste that straight into a browser — it renders immediately, no setup needed. Swap `img0`/`img1`/`img2` for real photo URLs (imgur, your own site, Cloudinary, whatever) when you're ready to send the real thing. Cells left unset just show the built-in SVG heart, which already looks nice on its own.

## Every parameter in one URL

Here's every parameter set at once — recipient, sender, message, challenge prompt, which cells must be selected, and all nine grid pictures:

**Plain values (before encoding):**

| Param | Value |
|---|---|
| `to` | `Sarah` |
| `from` | `Alex` |
| `msg` | `Be mine forever?` |
| `prompt` | `a shared memory` |
| `cells` | `1,3,5` (only cells at index 1, 3 and 5 must be selected to pass — see [picture notes](#-picture-notes) for how indices map to the grid) |
| `img0` … `img8` | `https://dummyimage.com/600x400/000/fff&text=test-image-1` … `test-image-9`, one per cell |

**As one link** (values URL-encoded — spaces to `%20`, `?` to `%3F`, commas to `%2C`, and each image URL's own `://`, `/`, `&`, `=` to `%3A%2F%2F`, `%2F`, `%26`, `%3D`):

```
https://love.d-solve.de/?to=Sarah&from=Alex&msg=Be%20mine%20forever%3F&prompt=a%20shared%20memory&cells=1%2C3%2C5&img0=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-1&img1=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-2&img2=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-3&img3=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-4&img4=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-5&img5=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-6&img6=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-7&img7=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-8&img8=https%3A%2F%2Fdummyimage.com%2F600x400%2F000%2Ffff%26text%3Dtest-image-9
```

Paste that in as-is — every cell shows its own placeholder picture (`test-image-1` through `test-image-9`, left-to-right top-to-bottom), the challenge reads "Select all squares with a shared memory", and only cells 1, 3 and 5 need to be selected to pass. Swap the `cells` list, prompt, names and image URLs for your own — everything else in this example is just filled in for illustration.

## 🖼️ Picture notes

- **9 cells** in a 3×3 grid.
- Images are **cropped square** (`object-fit: cover`) — aim for roughly square sources.
- A cell you don't set falls back to the **built-in SVG heart** (still pretty, still on-brand).
- **The joke** is that all 9 cells "contain a heart" so the recipient has to select all 9. If you swap in real photos, you can still keep `cells=all` — it works regardless of what the photos look like — or loosen it with `cells=any` or `cells=0,3,8`.

## 🧪 Before you send it

- [ ] Open the link yourself in an incognito window — check the name/message renders.
- [ ] Click the "I'm not a robot" box → wait for the loader → see the image grid.
- [ ] Select all 9 squares → "VERIFY" → slider appears.
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
You've set `cells` to a specific list but selected the wrong indices. Indices are 0-based, left-to-right, top-to-bottom: row 1 = `0,1,2`, row 2 = `3,4,5`, row 3 = `6,7,8`.

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
  to:   "Sarah",
  from: "Alex",
  message: "The captcha agrees. There is no appeal.",

  images: [
    "https://dummyimage.com/600x400/000/fff&text=test-image-1",
    "https://dummyimage.com/600x400/000/fff&text=test-image-2",
    null,                  // null = use the cute default heart placeholder
    "https://dummyimage.com/600x400/000/fff&text=test-image-4",
    null, null, null, null, null,
  ],

  challengePrompt: "our cat",
  correctCells: "all",     // "all" | "any" | [0, 3, 8]
};
```

Unlike URL parameters, image URLs in `config.js` are plain JavaScript strings — no need to URL-encode the `&` in the `dummyimage.com` example URLs above.

Then redeploy. Anything left empty (`""`) or `null` falls back to URL params or built-in defaults.

**Precedence (highest wins):** URL parameter → `config.js` value → built-in default.

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

## 🖼️ Captcha images — practical notes

- **9 cells** in a 3×3 grid.
- Each cell accepts a URL (`http://`, `https://`, or relative path like `/photos/x.jpg`).
- Images are **cropped square** (`object-fit: cover`) — aim for roughly square sources.
- `null` (or missing) cells fall back to the **built-in SVG hearts** (still pretty, still on-brand).
- **The joke** is that all 9 cells "contain a heart" so the user has to select all 9. If you swap in real photos, you can:
  - Leave `cells: "all"` — works regardless of what the photos look like.
  - Set `cells: "any"` to just accept any non-empty selection.
  - Set `cells: [0, 3, 8]` to require exact indices (useful if only some photos really do show the thing).
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
You've set `correctCells` to a specific array but selected the wrong indices. Indices are 0-based, left-to-right, top-to-bottom: row 1 = `[0,1,2]`, row 2 = `[3,4,5]`, row 3 = `[6,7,8]`.

## 📜 License

Do whatever you want with it. Don't use it to be cruel to anyone. ❤️
