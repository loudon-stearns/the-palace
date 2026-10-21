import { describe, test, expect } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readDeclaration, contractOf, declaredPath, readGrants, framePlan, piecePolicy, pieceCsp, shelfOrigins, CAPS } from '../../../../rich-face/contract.mjs';

// The piece contract (_ops/rich-face/contract.mjs): what a piece declares, what
// its manifest says for it, what grants.json lets it have, and the frame, chips
// and policies that follow. STIGMERGY — spec — rich-face pieces § 3.

const head = (metas) => `<!doctype html><html><head><meta charset="utf-8">${metas}</head><body><meta name="piece:needs" content="midi"></body></html>`;

describe('a piece’s declaration', () => {
  test('is read from its <head>, in either attribute order and either quote', () => {
    const d = readDeclaration(head(`<meta content="camera storage" name="piece:needs"><meta name='piece:files' content='frames.json, data/'>
      <meta name="piece:net" content="https://storage.googleapis.com/bucket"><meta name="piece:size" content="fill 4/3">`));
    expect(d.needs).toEqual(['camera', 'storage']);
    expect(d.files).toEqual(['frames.json', 'data/']);
    expect(d.net).toEqual(['storage.googleapis.com']);
    expect(d.size).toEqual({ mode: 'fill', ratio: 4 / 3, as: '4/3' });
    expect(d.problems).toEqual([]);
  });

  test('a name with a space is written %20; a meta in the body does not count', () => {
    const d = readDeclaration(head('<meta name="piece:files" content="my%20notes.txt">'));
    expect(d.files).toEqual(['my notes.txt']);
    expect(d.needs).toEqual([]);
  });

  test('a need off the closed list, or a size that is neither flow nor fill, is a problem, not a grant', () => {
    const d = readDeclaration(head('<meta name="piece:needs" content="camera geolocation"><meta name="piece:size" content="tall">'));
    expect(d.needs).toEqual(['camera']);
    expect(d.size).toEqual({ mode: 'flow' });
    expect(d.problems).toHaveLength(2);
    expect(d.problems[0]).toMatch(/geolocation/);
  });

  test('a page that declares nothing is pre-contract; a manifest contract speaks for a gathered proof; its own word wins', () => {
    expect(readDeclaration(head(''))).toBeNull();
    expect(contractOf({ html: head('') }).source).toBeNull();
    const byManifest = contractOf({ html: head(''), manifestContract: { needs: 'camera', size: 'fill 4/3' } });
    expect(byManifest).toMatchObject({ source: 'manifest', needs: ['camera'], size: { mode: 'fill' } });
    expect(contractOf({ html: head('<meta name="piece:needs" content="storage">'), manifestContract: { needs: 'camera' } })).toMatchObject({ source: 'piece', needs: ['storage'] });
  });

  test('a declared file is named from the piece, palace-absolute with a leading /, and never outside the palace', () => {
    expect(declaredPath('A/B/piece.html', 'frames.json')).toBe('A/B/frames.json');
    expect(declaredPath('A/B/piece.html', '../data/')).toBe('A/data/');
    expect(declaredPath('A/B/piece.html', '/Projects/Semantic Webcam/model.json')).toBe('Projects/Semantic Webcam/model.json');
    expect(declaredPath('A/piece.html', '../../etc/passwd')).toBeNull();
  });
});

describe('grants.json', () => {
  test('a missing file grants nothing; a line grants a piece what it names; a broken file grants nothing and says why', () => {
    const root = mkdtempSync(join(tmpdir(), 'rich-contract-'));
    try {
      expect(readGrants(root).byPiece.size).toBe(0);
      mkdirSync(join(root, '_ops/rich-face'), { recursive: true });
      const file = join(root, '_ops/rich-face/grants.json');
      writeFileSync(file, JSON.stringify({ grants: [{ piece: 'A/cam.html', allow: ['camera', 'storage'], net: ['https://x.example/y'] }] }));
      const g = readGrants(root).byPiece.get('A/cam.html');
      expect([...g.allow]).toEqual(['camera']); // storage needs no grant, so none is recorded
      expect([...g.net]).toEqual(['x.example']);
      writeFileSync(file, '{ not json');
      utimesSync(file, new Date(), new Date(Date.now() + 5000));
      const broken = readGrants(root);
      expect(broken.ok).toBe(false);
      expect(broken.byPiece.size).toBe(0);
      expect(broken.error).toMatch(/nothing is granted/);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});

describe('the frame a plan describes', () => {
  const ORIGIN = 'http://127.0.0.1:8843';
  const contract = (metas) => contractOf({ html: head(metas) });

  test('a pre-contract piece stays opaque and says so', () => {
    const p = framePlan({ path: 'A/x.html', contract: contract(''), origin: ORIGIN });
    expect(p).toMatchObject({ mark: 'pre-contract', sameOrigin: false, allow: 'autoplay', url: `${ORIGIN}/A/x.html`, chips: [] });
  });

  test('a granted camera is allowed; an ungranted one is refused and its chip says so', () => {
    const c = contract('<meta name="piece:needs" content="camera storage fullscreen">');
    const granted = framePlan({ path: 'A/My Cam.html', contract: c, grant: { allow: new Set(['camera']), net: new Set() }, origin: ORIGIN });
    expect(granted).toMatchObject({ mark: 'introduced', sameOrigin: true, allow: 'autoplay; camera; fullscreen', refused: [], url: `${ORIGIN}/A/My%20Cam.html` });
    expect(granted.chips.map((x) => x.text)).toEqual(['camera', 'storage', 'fullscreen']);
    const ungranted = framePlan({ path: 'A/cam.html', contract: c, origin: ORIGIN });
    expect(ungranted.allow).toBe('autoplay; fullscreen');
    expect(ungranted.refused).toEqual(['camera']);
    expect(ungranted.chips[0]).toMatchObject({ text: 'camera · not granted', state: 'warn' });
    expect(piecePolicy(granted)).toMatch(/^camera=\(self\), microphone=\(\), midi=\(\), fullscreen=\(self\)/);
    expect(piecePolicy(ungranted)).toMatch(/^camera=\(\),/);
    expect(piecePolicy(null)).toMatch(/^camera=\(\), microphone=\(\), midi=\(\), fullscreen=\(\)/);
  });

  test('a net host reaches the CSP only once granted', () => {
    const c = contract('<meta name="piece:net" content="a.example b.example">');
    const p = framePlan({ path: 'A/n.html', contract: c, grant: { allow: new Set(), net: new Set(['a.example']) }, origin: ORIGIN });
    expect(p.net).toEqual(['a.example']);
    expect(p.refused).toEqual(['net b.example']);
    expect(pieceCsp(p)).toContain("connect-src 'self' https://a.example;");
    expect(pieceCsp(null)).toContain("connect-src 'self';");
  });

  test('on the public site: opaque, storage this visit only, a camera piece in its own tab', () => {
    const p = framePlan({ path: 'A/cam.html', contract: contract('<meta name="piece:needs" content="camera storage">'), mode: 'static', url: '../files/A/cam.html' });
    expect(p).toMatchObject({ sameOrigin: false, tab: true, url: '../files/A/cam.html' });
    expect(p.chips.map((x) => x.text)).toEqual(['camera · opens in its own tab', 'storage · this visit only']);
  });

  test('the shelf: every https origin libs.json names, else today’s three CDNs', () => {
    const root = mkdtempSync(join(tmpdir(), 'rich-shelf-'));
    try {
      expect(shelfOrigins(root)).toEqual(['https://unpkg.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com']);
      mkdirSync(join(root, '_ops/rich-face'), { recursive: true });
      writeFileSync(join(root, '_ops/rich-face/libs.json'), JSON.stringify({ libs: { d3: { url: 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js' } } }));
      expect(shelfOrigins(root)).toEqual(['https://cdn.jsdelivr.net']);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  test('the caps a frame holds a piece to', () => {
    expect(CAPS).toEqual({ min: 120, max: 8000, fallback: 800 });
  });
});
