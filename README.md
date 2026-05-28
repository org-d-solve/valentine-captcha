# 💌 Valentine Verification

A faux-reCAPTCHA Valentine page. Recipients have to "verify they're human" by clicking a fake captcha, selecting all 9 squares (every single one secretly contains a heart), and dragging a slider all the way to "yes" — then they're told they're your valentine. The decline button skitters away when you try to click it.

Built as static HTML + JS + CSS. **No build step, no backend required.** Drop it on any host.

---

## 📁 File structure

```
valentine/
├── index.html          ← the page itself (links to everything else)
├── styles.css          ← all styles
├── config.js           ← ★ per-recipient settings (names, message, images)
├── app.jsx             ← the app logic (don't edit)
├── tweaks-panel.jsx    ← dev-only panel, harmless in prod (don't edit)
├── favicon.svg         ← browser tab icon
├── og-image.png        ← share preview (Slack/iMessage/Twitter), 1200×630
└── README.md           ← this file
```

All files live in the same folder. Relative paths in `index.html` resolve to siblings, so don't shuffle them around.

---

## 🚀 Deploy

It's static — anywhere that serves files will work.

### One-click hosts

- **[Netlify Drop](https://app.netlify.com/drop)** — drag the folder onto the page, done. You get a public URL in seconds.
- **[Vercel](https://vercel.com/)** — `vercel deploy` from the folder, or drag-and-drop in their dashboard.
- **[GitHub Pages](https://pages.github.com/)** — push the folder to a repo, enable Pages on the `main` branch.
- **Cloudflare Pages**, **Surge**, **Render**, **Fly static** — same drill.

### Your own server (nginx, Caddy, Apache, etc.)

Just point a directory at the folder. Example nginx:

```nginx
server {
  listen 80;
  server_name valentine.example.com;
  root /var/www/valentine;
  index index.html;
}
```

Make sure `.js` is served with `Content-Type: text/javascript` (most servers do this by default).

---

## 👀 Preview locally

Browsers block the in-browser Babel transform when you open `index.html` directly via `file://`. Run a one-liner static server from inside the folder:

```bash
# any of these work
npx serve .
python3 -m http.server 8000
php -S localhost:8000
```

Then open `http://localhost:8000/?to=Sarah&from=Alex`.

---

## 🎨 Personalising it

You have three options. Pick the one that matches your effort budget.

### Option 1 — URL parameters (zero setup, no backend)

The simplest path. Just craft a URL and share it.

```
https://your-site.com/?to=Sarah&from=Alex&msg=Be%20mine%20pls
```

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

**Combine freely:**

```
?to=Sarah&from=Alex
 &msg=The%20captcha%20agrees.%20There%20is%20no%20appeal.
 &img0=https://example.com/photos/us-1.jpg
 &img1=https://example.com/photos/us-2.jpg
 &prompt=our%20cat
 &cells=any
```

(Newlines added for readability — real URLs have no whitespace.)

### Option 2 — Edit `config.js` by hand

Good for a single recipient where you want pretty URLs (no params).

Open `config.js` and fill it in:

```js
window.VALENTINE_CONFIG = {
  to:   "Sarah",
  from: "Alex",
  message: "The captcha agrees. There is no appeal.",

  images: [
    "/photos/01.jpg",
    "/photos/02.jpg",
    null,                  // null = use the cute default heart placeholder
    "/photos/04.jpg",
    null, null, null, null, null,
  ],

  challengePrompt: "our cat",
  correctCells: "all",     // "all" | "any" | [0, 3, 8]
};
```

Then redeploy. Anything left empty (`""`) or `null` falls back to URL params or built-in defaults.

**Precedence (highest wins):** URL parameter → `config.js` value → built-in default.

### Option 3 — Server-render `config.js` (best for many recipients)

If you're sending valentines to many people from your own backend/database, render `config.js` dynamically per URL slug. Everything else stays static.

**Example with Express:**

```js
// Static valentine bundle:
app.use('/v/:slug', express.static('valentine'));

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

---

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

---

## 🪪 Favicon & share preview

### Favicon

`favicon.svg` — a red heart on cream. Replace it to rebrand. SVG works in all modern browsers; if you need a `.ico` fallback for old IE, generate one and add a second `<link rel="icon">` in `index.html`.

### OG image (social previews)

`og-image.png` — 1200×630, the card-style preview shown when you paste the URL into Slack / iMessage / Twitter / LinkedIn / etc.

The current image is generic ("You've received a Valentine"). Two ways to customise:

1. **Static replacement:** swap the file. Same dimensions. Done.
2. **Per-recipient OG image:** generate a unique image server-side and update the `<meta property="og:image">` tag in `index.html` (or render `index.html` itself per-slug). Note: most platforms aggressively cache OG previews — a unique URL per recipient is essential.

The `<meta>` tags also include `og:title`, `og:description`, and the Twitter equivalents. Edit them in `index.html` if you want to customise the share text.

---

## 🛠️ Tweaks panel

There's a hidden dev panel on the page (toggled by a host environment). It does nothing in production — you can ignore it, or delete the line `<script type="text/babel" src="tweaks-panel.jsx"></script>` from `index.html` if you want to drop a file from the bundle.

---

## 🧪 Testing checklist

Before sending a URL out:

- [ ] Open it in an incognito window — make sure the name/message renders.
- [ ] Click the "I'm not a robot" box → wait for the loader → see the image grid.
- [ ] Select all 9 squares → "VERIFY" → slider appears.
- [ ] Drag slider all the way → "CONFIRM" → reveal screen with the recipient's name.
- [ ] Paste the URL into Slack or iMessage to verify the OG preview renders.
- [ ] Try the "decline" button — it should skitter away.

---

## 🩹 Troubleshooting

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

---

## 📜 License

Do whatever you want with it. Don't use it to be cruel to anyone. ❤️
