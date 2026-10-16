#!/usr/bin/env python3
"""Build the 747-8F Tech Guide.

Outputs
  dist/artifact.html          single-file page for the Claude artifact preview
  dist/pwa/                   offline-installable web app (host on any HTTPS static host)
    index.html, sw.js, manifest.webmanifest, icons/*
  dist/747-8F-Tech-Guide.zip  the pwa/ folder zipped

Add a chapter: drop content/chNN.js next to ch01.js and re-run. Chapter files load in number order.
"""
import hashlib, json, pathlib, re, shutil, subprocess, zipfile

ROOT = pathlib.Path(__file__).parent
SRC, CONTENT, DIST = ROOT / "src", ROOT / "content", ROOT / "dist"
FONTS = ("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400"
         "&family=B612+Mono:wght@400;700&family=Sofia+Sans+Condensed:wght@500;600;700;800&display=swap")
TITLE = "747-8F Tech Guide"

def read(p): return pathlib.Path(p).read_text(encoding="utf-8")

def scripts(pwa):
    files = [CONTENT / "library.js"] + sorted(CONTENT.glob("ch[0-9][0-9].js")) + [SRC / "widgets.js", SRC / "app.js"]
    out = []
    for f in files:
        if f.name == "app.js" and pwa:
            out.append("<script>window.B748_PWA = true;</script>")
        out.append(f"<script>\n/* {f.name} */\n{read(f)}\n</script>")
    return "\n".join(out)

def body(pwa):
    return f'<div id="app"></div>\n<noscript>This guide needs JavaScript.</noscript>\n{scripts(pwa)}'

def build_artifact():
    html = f"""<title>{TITLE}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>
{read(SRC / "styles.css")}
</style>
{body(False)}
"""
    (DIST / "artifact.html").write_text(html, encoding="utf-8")
    return html

ICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" fill="#16212b"/>
<g transform="translate(256 70) scale(4.6)" fill="#e9eff4">
<path d="M0,0 C1.9,0 3.25,2.8 3.25,8 L3.25,60 C3.25,68 1.6,74 0.45,76.3 L-0.45,76.3 C-1.6,74 -3.25,68 -3.25,60 L-3.25,8 C-3.25,2.8 -1.9,0 0,0 Z"/>
<path d="M3.25,25.5 L31.5,49.2 L34.2,54.6 L33.6,55.6 L12,43.2 L3.25,41.5 Z"/><path d="M-3.25,25.5 L-31.5,49.2 L-34.2,54.6 L-33.6,55.6 L-12,43.2 L-3.25,41.5 Z"/>
<path d="M2.7,63.5 L11,71.6 L11,74.2 L1.6,73.8 Z"/><path d="M-2.7,63.5 L-11,71.6 L-11,74.2 L-1.6,73.8 Z"/>
<rect x="10.25" y="27.5" width="3.3" height="7" rx="1.1"/><rect x="19.55" y="35.3" width="3.1" height="6.7" rx="1.1"/>
<rect x="-13.55" y="27.5" width="3.3" height="7" rx="1.1"/><rect x="-22.65" y="35.3" width="3.1" height="6.7" rx="1.1"/>
</g>
<rect x="0" y="448" width="512" height="64" fill="#43d6f2"/>
</svg>"""

def build_icons(out):
    icons = out / "icons"; icons.mkdir(parents=True, exist_ok=True)
    svg = icons / "icon.svg"; svg.write_text(ICON_SVG)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
            pg = b.new_page(viewport={"width": size, "height": size})
            pg.set_content(f'<html><body style="margin:0">{ICON_SVG.replace("<svg ", f"<svg width={size} height={size} ", 1)}</body></html>')
            pg.screenshot(path=str(icons / name), omit_background=True)
            pg.close()
        b.close()

def build_pwa(artifact_html):
    out = DIST / "pwa"
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True)
    build_icons(out)
    page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="theme-color" content="#16212b">
<meta name="robots" content="noindex, nofollow">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="748F Guide">
<link rel="manifest" href="manifest.webmanifest" crossorigin="use-credentials">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" href="icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>
:root {{ padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); color-scheme: light; }}
[hidden] {{ display: none !important; }}
img {{ max-width: 100%; }}
{read(SRC / "styles.css")}
</style>
</head>
<body>
{body(True)}
</body>
</html>
"""
    (out / "index.html").write_text(page, encoding="utf-8")
    manifest = {
        "name": TITLE, "short_name": "748F Guide", "start_url": "./", "scope": "./", "display": "standalone",
        "background_color": "#16212b", "theme_color": "#16212b", "orientation": "any",
        "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
                  {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
    }
    (out / "manifest.webmanifest").write_text(json.dumps(manifest, indent=2))
    version = hashlib.sha256(page.encode()).hexdigest()[:10]
    sw = read(SRC / "sw.js").replace("__VERSION__", version)
    (out / "sw.js").write_text(sw)
    (out / "README.txt").write_text(read(SRC / "README-pwa.txt"))
    (out / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
    z = DIST / "747-8F-Tech-Guide.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(out.rglob("*")):
            if f.is_file(): zf.write(f, f.relative_to(out))
    return version

if __name__ == "__main__":
    DIST.mkdir(exist_ok=True)
    a = build_artifact()
    v = build_pwa(a)
    print("artifact.html", len(a.encode()) // 1024, "KB · pwa version", v)
