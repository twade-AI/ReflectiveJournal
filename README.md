# The Haileybury Odyssey · Reflective Journal

An interactive reflection app for Key Stage 3 pupils (Years 7–9). Pupils log
short weekly reflections through the year and write longer "Long Tutorial"
reflections before they meet their tutor. Each entry can be tagged with the
five Haileybury values (Courage, Curiosity, Integrity, Kindness, Respect),
visualised on a profile "bloom", and browsed as a bound book or photo
scrapbook.

## Features — the voyage

The pupil's journal is framed as a hero's journey. Each tab is a stop along
the route.

- **The Hero** — the profile / dashboard. Greeting, auto-generated summary
  of the pupil's year, totals (waypoints, councils, yellow tickets, blue
  tickets), editable pupil info.
- **The Compass** — a petal chart on the hero page. Each of the five values
  is a teardrop petal that grows as the pupil tags it; the compass turns
  toward whichever direction they're paying most attention to. Total tag
  count sits at the centre.
- **Waypoints** — quick five-minute entries: a moment worth marking, value
  tags, optional photo, what they're proud of, something tricky, and a
  one-word mood.
- **Councils** — longer reflections to prepare for a tutor meeting: title,
  what happened, what shifted, values, optional photo, what went well / what
  they'd do differently, a question to bring to council, and
  **yellow ticket / blue ticket** counts that roll up onto the hero page.
- **Relics** — every photo the pupil has gathered along the way, laid out
  as a tilted paper-and-tape collage with caption, date, and value tags.
- **The Saga** — every waypoint and council, bound chronologically and
  presented as a two-page spread with ← / → navigation. Includes an
  **Export to PDF** option that produces a multi-page print-ready document
  with a cover page.
- **Photos optional everywhere** — uploaded images are stored inline as
  dataURLs; no upload step.
- **Works offline** — state persists to `localStorage`. No backend yet (see
  below).

## Running

Open `index.html` in a modern browser. The app loads React and Babel from CDN
and transpiles the JSX on the fly — no build step required.

For best results serve over HTTP so the browser can load the JSX files with
the correct MIME type:

```
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Backend — future

Everything currently lives in the browser's `localStorage`, which means a
pupil on a library iPad won't see what they wrote on their laptop, and none
of the data is shared with the tutor automatically. The next step is a
backend (accounts, cloud storage, tutor view). The data model in `app.jsx`
(`weekly[]`, `tutorial[]`, `pupil`) is already shaped in a way that will port
cleanly to a database.

The profile-page summary is currently a rule-based rollup of the pupil's data
(entry counts, most-used value, most recent reflection title). With a backend
in place, it can be upgraded to an LLM-generated narrative.

## File map

| File | Purpose |
| --- | --- |
| `index.html` | Entry point; mounts `<App/>`. |
| `common.jsx` | Shared primitives — VALUES palette, ValueTag, ValuePicker, PhotoUpload, form inputs, NumberStepper, Button, Card, icons, date helpers. |
| `app.jsx` | App shell, nav, `useJournal` storage hook, Profile / Weekly / Tutorial views, forms. |
| `assets/tokens.css` | Haileybury brand tokens (colours, typography, spacing). |
| `assets/fonts/` | Calluna Sans (brand typeface). |
| `assets/logo-*.png` | School logos in magenta / white / black. |
| `assets/campus-terrace.jpg` | Campus photo. |
