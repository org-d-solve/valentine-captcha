// ============================================================
//  Valentine config — edit me!
// ============================================================
//
//  This is the ONLY file you need to change to customize the page
//  for a different recipient. Render it from your backend per-URL,
//  or just edit it by hand for one-offs.
//
//  Any field can also be passed via URL parameter (e.g. ?to=Sarah);
//  values set here override URL params.
//
window.VALENTINE_CONFIG = {
  // Names — leave empty string "" to fall back to URL ?to= / ?from=
  to:   "",         // e.g. "Sarah"
  from: "",         // e.g. "Alex"

  // Optional custom reveal message. Leave empty for the default.
  message: "",

  // -------- Captcha image grid (9 cells) --------
  //
  // Each entry is either:
  //   - a URL/path to an image  (e.g. "/photos/us.jpg")
  //   - null  → uses the built-in cute SVG heart placeholder
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

  // What the user is told to find. Default "a heart".
  challengePrompt: "a heart",

  // Which cells must be selected to pass.
  //   "all"        → must select all 9   (the default joke)
  //   "any"        → any non-empty selection passes
  //   [0, 3, 8]    → only these indices are correct
  correctCells: "all",
};
