#!/usr/bin/env python3
"""Bundle the Reflective Journal into a single self-contained HTML file.

Inlines tokens.css, the Calluna Sans fonts, the two logos actually used by the
app, and the common.jsx / app.jsx sources into one file. React, Babel and the
Google Fonts substitutes still load from their CDNs (needs internet on first
open); everything else is embedded as base64/text so the file runs by being
double-clicked.

Run from the repo root:  python3 build-standalone.py
Output:                  reflective-journal-standalone.html
"""

import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "reflective-journal-standalone.html"


def data_uri(path: pathlib.Path, mime: str) -> str:
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


# --- 1. tokens.css with the Calluna fonts inlined as data URIs ---------------
tokens = read("assets/tokens.css")
for font in sorted((ROOT / "assets" / "fonts").glob("*.otf")):
    uri = data_uri(font, "font/otf")
    tokens = tokens.replace(f"url('fonts/{font.name}')", f"url('{uri}')")

# --- 2. the two logos the app references -------------------------------------
assets = {
    "logo-white": data_uri(ROOT / "assets" / "logo-white.png", "image/png"),
    "logo-odyssey": data_uri(ROOT / "assets" / "logo-odyssey.png", "image/png"),
}
assets_script = (
    "<script>\nwindow.__ASSETS = {\n"
    + ",\n".join(f'  {k!r}: {v!r}' for k, v in assets.items())
    + "\n};\n</script>"
)

# --- 3. JSX sources, with logo paths pointed at the inlined data URIs --------
common_jsx = read("common.jsx")
app_jsx = read("app.jsx")
app_jsx = app_jsx.replace(
    'src="assets/logo-white.png"', "src={window.__ASSETS['logo-white']}"
)
app_jsx = app_jsx.replace(
    'src="assets/logo-odyssey.png"', "src={window.__ASSETS['logo-odyssey']}"
)

# --- 4. assemble the HTML ----------------------------------------------------
html = read("index.html")

# inline the stylesheet
html = html.replace(
    '<link rel="stylesheet" href="assets/tokens.css">',
    f"<style>\n{tokens}\n</style>",
)

# drop the cache-bust shim (no external JSX left to bust)
html = re.sub(r"<script>\s*//\s*Cache-bust.*?</script>", "", html, flags=re.DOTALL)

# inline common.jsx (prefixed by the asset table) then app.jsx
html = html.replace(
    '<script type="text/babel" src="common.jsx"></script>',
    f'{assets_script}\n<script type="text/babel">\n{common_jsx}\n</script>',
)
html = html.replace(
    '<script type="text/babel" src="app.jsx"></script>',
    f'<script type="text/babel">\n{app_jsx}\n</script>',
)

OUT.write_text(html, encoding="utf-8")

# --- 5. sanity report --------------------------------------------------------
leftover = re.findall(r'(?:src|href)="(assets/[^"]+)"', html)
assert not leftover, f"un-inlined local asset references remain: {leftover}"
print(f"wrote {OUT.name}  ({OUT.stat().st_size / 1_000_000:.1f} MB)")
