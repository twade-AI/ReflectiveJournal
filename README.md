# Haileybury Reflective Journal

A digital workbook prototype for pupils to reflect on their progress and
achievements across the year. Designed for GoodNotes annotation; A4 portrait.

Three age-band variants:

- **Key Stage 3** — Years 7–9 (ages 11–14). Warmer, scrapbook-feel, more
  guided prompts.
- **Key Stage 4** — Years 10–11 (ages 14–15). Editorial, cream paper,
  magenta accents. Introduces "for tutorial" pages.
- **Sixth Form** — Years 12–13 (ages 16–18). Minimalist essay-style, serif
  typography, generous whitespace.

Each band ships with five spreads: Cover, Introduction, Reflection entry
(blank + filled), Weekly / termly check-in, End-of-term / year review. The
Haileybury values — Courage, Curiosity, Integrity, Kindness, Respect — run
through every page as tags and prompts.

## Running

Open `Reflective Journal.html` in a modern browser. The prototype loads
React, ReactDOM and Babel from CDN and transpiles the JSX files on the
fly — no build step required. Pan/zoom with trackpad, click an artboard to
focus, press `←/→` to move between pages and `↑/↓` between age bands.

A floating **Tweaks** panel (bottom-right) lets you switch age group,
writing surface (ruled / dotted / blank), and toggle photo slots and
filled-sample content.

## File map

| File | Purpose |
| --- | --- |
| `Reflective Journal.html` | Entry point; mounts `<App/>` and the Tweaks panel. |
| `design-canvas.jsx` | Figma-ish pan/zoom canvas with artboards, reorder, focus overlay. |
| `tweaks-panel.jsx` | Floating tweaks panel and form controls. |
| `journal-common.jsx` | Shared primitives — A4 page, values, photo slot, writing surface, etc. |
| `journal-ks3.jsx` | KS3 pages (Cover, How-to-use, Entry, Check-in, Term review). |
| `journal-ks4.jsx` | KS4 pages. |
| `journal-ks5.jsx` | Sixth Form pages (Cover, Prologue, Entry part 1 & 2, Year review). |
| `assets/tokens.css` | Haileybury brand tokens (colours, typography, spacing). |
| `assets/fonts/` | Calluna Sans (brand typeface). |
| `assets/logo-*.png` | School logos in magenta / white / black. |
| `assets/campus-terrace.jpg` | Campus photo. |
