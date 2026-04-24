# Haileybury Reflective Journal

An interactive reflection app for Key Stage 3 pupils (Years 7–9). Pupils log
short weekly reflections through the year and write longer "Long Tutorial"
reflections before they meet their tutor. Each entry can be tagged with the
five Haileybury values (Courage, Curiosity, Integrity, Kindness, Respect) and
visualised on their profile.

## Features

- **Profile / dashboard** — greeting, auto-generated summary of the pupil's
  activity, totals, a values-usage chart showing which values are getting the
  most attention across the year, and editable pupil info.
- **Weekly reflections** — quick five-minute entries: a moment from the week,
  values tags, optional photo, what they're proud of, something tricky, and a
  one-word mood.
- **Long tutorial reflections** — longer entries: title, what happened, what
  shifted, values, optional photo, what went well / what they'd do differently,
  a question to discuss with the tutor, and **yellow ticket / blue ticket**
  counts.
- **Values visualisation** — a horizontal bar chart on the profile page,
  colour-coded per value, updated as entries are tagged.
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
