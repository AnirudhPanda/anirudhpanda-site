# anirudhpanda.in

Static portfolio site. No build step: plain HTML, CSS and a small script.

- `index.html`, `social.html`, `words.html`, `irl.html`, `builds.html`: the 5 pages
- `assets/`: all images
- `dc.js` + `morphdom.min.js`: powers the interactive bits (picker, game, tabs, brief form)
- `vercel.json`: clean URLs (`/social` instead of `/social.html`), no build

To edit copy, open the page's `.html` file and change the text inside `<template id="tpl">`.
