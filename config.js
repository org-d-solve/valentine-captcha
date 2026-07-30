// ============================================================
//  Valentine config — edit me!
// ============================================================
//
//  This is the ONLY file you need to change to customize the page
//  for a different recipient. Render it from your backend per-URL,
//  or just edit it by hand for one-offs.
//
//  Precedence for every field:  URL parameter → this file → default.
//  Leave a field empty ("" or null) to fall back.
//
//  Prefer filling in a form instead of editing this file?
//  Use the /customize page that ships with this site.
//
window.VALENTINE_CONFIG = {
  // -------- Language --------
  // "en" (default) or "de". Sets every built-in text on the page.
  // Anything you set below overrides the built-in text for that field.
  language: "",

  // Names — leave empty string "" to fall back to URL ?to= / ?from=
  to:   "",         // e.g. "Sarah"
  from: "",         // e.g. "Alex"

  // Optional custom reveal message. Leave empty for the default.
  message: "",

  // -------- Captcha image grid (9 cells) --------
  //
  // Each entry is either:
  //   - a URL/path to an image  (e.g. "/photos/us.jpg", or a placeholder
  //     like "https://dummyimage.com/600x400/000/fff&text=test-image-1"
  //     while you're testing)
  //   - null  → uses the built-in cute SVG heart placeholder
  //
  // The array runs left-to-right, top-to-bottom, so images[0] is the cell
  // labelled 1 and images[8] is the cell labelled 9.
  //
  // Use square or near-square images; they're cropped to fit.
  // Tip: real photos work GREAT — the joke still lands because
  //      they all (allegedly) contain a heart.
  //
  images: [
    null, null, null,
    null, null, null,
    null, null, null,
  ],

  // What the user is told to find. Default "a heart" / "ein Herz".
  challengePrompt: "",

  // Which cells must be selected to pass.
  // Cells are numbered 1–9, left-to-right and top-to-bottom:
  //     1 2 3
  //     4 5 6
  //     7 8 9
  //   "all"        → must select all 9   (the default joke)
  //   "any"        → any non-empty selection passes
  //   [1, 4, 9]    → only these cells are correct
  correctCells: "all",

  // -------- Wording (all optional; empty = built-in text for `language`) --------
  //
  // In these texts you may use:
  //   *asterisks*  → rendered in the italic accent colour
  //   \n           → line break
  //
  title:    "",   // intro headline, shown after "<name>,"
  subtitle: "",   // intro paragraph under the headline
  hint:     "",   // second line of the captcha challenge header
  question: "",   // the slider headline, e.g. "On a scale of *0 to yes*,\nwill you?"
  reveal:   "",   // final headline, shown after "<name>," — e.g. "you are my valentine."

  // Labels printed under the slider track (left to right). Any number works.
  //   e.g. ["NO", "MEH", "OK", "SURE", "YES"]
  scale: null,

  // The italic phrase shown as the slider moves, from 0% to 100%.
  // The last entry is reserved for "all the way".
  //   e.g. ["absolutely not", "hmm.", "i guess.", "yes, a thousand times."]
  readouts: null,
};
