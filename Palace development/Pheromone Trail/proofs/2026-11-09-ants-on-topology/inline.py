#!/usr/bin/env python3
"""Fold data.js and icons.webp into src.html, so the page is one file that opens anywhere.
Usage: python3 inline.py [src.html ants-on-topology.html]   (after build.py)"""
import base64, os, sys
SRC, OUT = (sys.argv[1], sys.argv[2]) if len(sys.argv) == 3 else ('src.html', 'ants-on-topology.html')
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, SRC), encoding='utf-8').read()
data = open(os.path.join(here, 'data.js'), encoding='utf-8').read().replace('</', '<\\/')
icons = base64.b64encode(open(os.path.join(here, 'icons.webp'), 'rb').read()).decode()
tag = '<script src="data.js"></script>'
assert tag in src and "'icons.webp'" in src
out = src.replace(tag, '<script>' + data + '</script>').replace("'icons.webp'", "'data:image/webp;base64," + icons + "'")
open(os.path.join(here, OUT), 'w', encoding='utf-8').write(out)
print(len(out))
