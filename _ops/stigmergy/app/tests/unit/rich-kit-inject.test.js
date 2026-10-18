// The piece kit goes into every served web page (rich-face/kit/inject.mjs):
// first in <head>, so it runs before the piece's own scripts, and only once.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { injectKit, isPiecePage, KIT_ATTR } from '../../../../rich-face/kit/inject.mjs';

const KIT_SRC = readFileSync(new URL('../../../../rich-face/kit/piece.js', import.meta.url), 'utf8');
const tagAt = (s) => s.indexOf(`<script ${KIT_ATTR}=`);

describe('injectKit', () => {
  it('puts the kit first in <head>, before the piece\'s own scripts', () => {
    const out = injectKit('<!doctype html><html><head><meta charset="utf-8"><script>own()</script></head><body></body></html>');
    expect(tagAt(out)).toBe(out.indexOf('<head>') + '<head>'.length);
    expect(tagAt(out)).toBeLessThan(out.indexOf('own()'));
  });

  it('keeps a <head> with attributes, and is not fooled by <header>', () => {
    const out = injectKit('<!doctype html><html><body><header>top</header></body></html>');
    expect(tagAt(out)).toBe(out.indexOf('<html>') + '<html>'.length);
    const withAttr = injectKit('<html lang="en"><head data-x="1"><title>t</title></head></html>');
    expect(tagAt(withAttr)).toBe(withAttr.indexOf('<head data-x="1">') + '<head data-x="1">'.length);
  });

  it('with no <html> or <head>, goes after the doctype so the page keeps its standards mode', () => {
    const out = injectKit('<!doctype html><body><div>x</div></body>');
    expect(out.startsWith('<!doctype html><script')).toBe(true);
    expect(injectKit('<div>bare</div>').startsWith('<script')).toBe(true);
  });

  it('a page that already carries the kit is left alone', () => {
    const once = injectKit('<html><head></head></html>');
    expect(injectKit(once)).toBe(once);
  });

  it('serves .html and .htm as pieces, not .svg or anything else', () => {
    expect(isPiecePage('A/b.html')).toBe(true);
    expect(isPiecePage('A/b.HTM')).toBe(true);
    expect(isPiecePage('A/b.svg')).toBe(false);
    expect(isPiecePage('A/b.md')).toBe(false);
  });

  it('the kit can be inlined: no closing script tag inside it', () => {
    expect(/<\/script/i.test(KIT_SRC)).toBe(false);
  });
});
