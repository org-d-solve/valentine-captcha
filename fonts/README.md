# Fonts

Self-hosted so the site makes **no external requests at all** — it works offline,
on an air-gapped network, and behind a proxy that blocks Google.

| File | Family | Style | Weight |
|---|---|---|---|
| `instrument-serif-latin-400-normal.woff2` | Instrument Serif | normal | 400 |
| `instrument-serif-latin-400-italic.woff2` | Instrument Serif | italic | 400 |
| `jetbrains-mono-latin-400-500-normal.woff2` | JetBrains Mono | normal | 400–500 (variable) |

About 73 KB in total. These are the Google Fonts **`latin` subsets**, which cover
English and German including umlauts and ß. They are declared with `@font-face`
at the top of `../styles.css`; the paths there are relative to the stylesheet, so
they resolve correctly from `/` and from `/customize/` alike.

## Licence

Both families are published under the **SIL Open Font License 1.1**, which
explicitly permits redistribution and self-hosting alongside a project.

- Instrument Serif — <https://fonts.google.com/specimen/Instrument+Serif>
- JetBrains Mono — <https://fonts.google.com/specimen/JetBrains+Mono>

The OFL requires that the fonts are not sold on their own and that any modified
version is renamed. Neither applies here: these files are unmodified.

## Replacing or extending them

Need another subset (Cyrillic, Greek, `latin-ext`) or another weight? Fetch the
stylesheet Google generates, pull the `.woff2` URLs for the subsets you want, and
add matching `@font-face` blocks:

```bash
curl -A 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120' \
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
```

The user-agent matters — without a modern one, Google serves legacy `ttf` instead
of `woff2`.
