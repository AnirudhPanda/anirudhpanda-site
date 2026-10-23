import re,sys,os
import pathlib; ROOT=pathlib.Path(__file__).resolve().parent.parent
SRC=str(ROOT/'src'); OUT=str(ROOT)
pages={'Main':('index','Anirudh Panda · marketer, bangalore','Brand, social and content marketer in Bangalore. Grew Cultstore\'s Instagram from 60K to 220K+ with no agency, made newsletters earn ₹1Cr+, and runs events people show up to.'),
 'Social':('social','Social & brand · Anirudh Panda','Creator collabs and brand films from Cultstore: 220K+ followers, 30M+ organic views a month, 100M+ views from creator partnerships.'),
 'Words':('words','Words · Anirudh Panda','Newsletters and copy that convert: ₹1Cr+ in newsletter ad revenue for 30+ clients at Inagiffy.'),
 'Irl':('irl','IRL · Anirudh Panda','Run clubs, dance days, recovery zones and a sold-out TEDx: the events Anirudh has put together.'),
 'Builds':('builds','Builds · Anirudh Panda','Dashboards built at Cult, products shipped in college, and a scrapbook of everything else.')}
links={'Main.dc.html':'/','Social.dc.html':'/social','Words.dc.html':'/words','Irl.dc.html':'/irl','Builds.dc.html':'/builds'}
for name,(slug,title,desc) in pages.items():
    s=open(f'{SRC}/{name}.dc.html').read()
    helmet=re.search(r'<helmet>(.*?)</helmet>',s,re.S).group(1)
    body=re.search(r'<x-dc>(.*?)</x-dc>',s,re.S).group(1)
    body=re.sub(r'<helmet>.*?</helmet>','',body,flags=re.S)
    script=re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>',s,re.S).group(1)
    def fix(t):
        for k,v in links.items():
            t=t.replace(f'"{k}#', f'"{v}#').replace(f'"{k}"', f'"{v}"')
        t=re.sub(r'/_blob/([0-9a-f]{32})', r'/assets/\1.jpg', t)
        t=t.replace('"/_blob/"','"/assets/"')
        t=re.sub(r'B \+ "([0-9a-f]{32})"', r'B + "\1.jpg"', t)
        return t
    body,script,helmet=fix(body),fix(script),fix(helmet)
    body=re.sub(r'href="/"([^>]*>\s*hire me\s*</a>)', r'href="/#brief"\1', body)
    assert '/_blob/' not in body+script and '.dc.html' not in body+script, name
    url='https://anirudhpanda.in'+('/' if slug=='index' else '/'+slug)
    html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://anirudhpanda.in/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F3EFE6">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="{url}">
{helmet.strip()}
</head>
<body>
<div id="app"></div>
<template id="tpl">{body}</template>
<script src="/morphdom.min.js"></script>
<script src="/dc.js"></script>
<script>{script}</script>
<script>DC.mount(typeof Component !== "undefined" ? Component : null);</script>
</body>
</html>
'''
    open(f'{OUT}/{slug}.html','w').write(html)
    print(slug, len(html))
