# anirudhpanda.in

Static portfolio site. No build step: plain HTML, CSS and a small script.

- `index.html`, `social.html`, `words.html`, `irl.html`, `builds.html`: the 5 pages
- `assets/`: all images
- `dc.js` + `morphdom.min.js`: powers the interactive bits (picker, game, tabs, brief form)
- `vercel.json`: clean URLs (`/social` instead of `/social.html`), no build

To edit copy, open the page's `.html` file and change the text inside `<template id="tpl">`.

## How updates work

The pages are designed on a Claude Design canvas. The canvas source for each page lives in `src/*.dc.html`.
To rebuild the site after changing `src/`, run `python3 tools/build.py` from the repo root, then commit and push. Vercel redeploys on every push to `main`.
