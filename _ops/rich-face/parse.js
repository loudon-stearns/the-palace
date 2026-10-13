// parse.js — read a palace entry's markdown into sections, blocks and figures.
//
// Shared by the browser renderer (rich.html) and the Node fingerprint tool
// (fingerprint.mjs), so the fingerprint a piece was stamped with and the one
// the page computes on load come from the same code. If these two ever
// disagreed, every piece would read as drifted.
//
// The rule the rich face rests on: the entry's words are never copied. The page
// reads the .md live; this module only decides which blocks are prose (the
// spine) and which are figures (media the text already carries, with their
// captions). Pieces the rich face *adds* live in the manifest, not here.

// One list of media extensions, by kind. What counts as media, what counts as a
// media-only line (not caption), and what the page lays as a player, an image
// or a frame all read it, so none of them can disagree. rich.html keeps no list
// of its own.
const KINDS = [
  ['video', 'mp4|webm|mov'],
  ['audio', 'wav|mp3|ogg|m4a|flac'],
  ['image', 'png|jpe?g|gif|webp|svg'],
  ['interactive', 'html?'],
].map(([kind, exts]) => [kind, new RegExp(`\\.(?:${exts})$`, 'i'), exts]);
const MEDIA_EXTS = KINDS.map(([, , exts]) => exts).join('|');
const MEDIA_EXT = new RegExp(`\\.(?:${MEDIA_EXTS})$`, 'i');

/** What a file is, by its name: video, audio, image, interactive, text (.md) or file. */
export function mediaKind(name) {
  for (const [kind, re] of KINDS) if (re.test(name)) return kind;
  return /\.md$/i.test(name) ? 'text' : 'file';
}
/** Is this a media file — a video, sound, image or interactive — rather than an entry or a note? */
export const isMedia = (name) => MEDIA_EXT.test(name);

// ── frontmatter ────────────────────────────────────────────────────────────
function splitFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: md };
  const raw = m[1];
  const fm = {};
  const pick = (key) => {
    const r = raw.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
    if (!r) return undefined;
    let v = r[1].trim();
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
    return v;
  };
  for (const k of ['title', 'type', 'stage', 'forward_vector', 'born', 'energy']) {
    const v = pick(k);
    if (v !== undefined && v !== '') fm[k] = v;
  }
  // pillars: either [a, b] inline or a "- a" list
  const inline = raw.match(/^pillars:\s*\[(.*)\]\s*$/m);
  if (inline) fm.pillars = inline[1].split(',').map((s) => s.trim()).filter(Boolean);
  else {
    const block = raw.match(/^pillars:\s*\n((?:\s+-\s+.*\n?)+)/m);
    if (block) fm.pillars = block[1].split('\n').map((s) => s.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
  }
  return { fm, body: md.slice(m[0].length) };
}

// ── media references ───────────────────────────────────────────────────────
// Three shapes the palace uses: ![[file]] embeds, [[file.ext|label]] links to
// media, and [label](file.ext) local links. Returns [{ name, label, embed }].
export function mediaRefs(text) {
  const out = [];
  const seen = new Set();
  const push = (name, label, embed) => {
    name = name.trim();
    if (!MEDIA_EXT.test(name) || /^https?:/i.test(name) || seen.has(name)) return;
    seen.add(name);
    out.push({ name, label: label ? label.trim() : '', embed });
  };
  for (const m of text.matchAll(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g)) push(m[1], m[2], true);
  for (const m of text.matchAll(/(?<!!)\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g)) push(m[1], m[2], false);
  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) push(safeDecodeURI(m[2]), m[1], false);
  return out;
}
// A stray % (a filename like "growth-100%.png") is not an escape; keep it as written.
function safeDecodeURI(s) { try { return decodeURI(s); } catch { return s; } }

const isHero = (name) => /—\s*hero\.(png|jpe?g|webp)$/i.test(name);
const ONLY_EMBED = /^!\[\[[^\]]+\]\]\s*$/;
// A line that is only media, in any of the three shapes mediaRefs reads: an
// embed, [[file.ext|label]], or [label](file.ext). A [[link]] to an entry is not
// media, so it stays in the caption.
const ONLY_MEDIA_LINE = new RegExp(`^(?:!\\[\\[[^\\]]+\\]\\]|\\[\\[[^\\]|]+\\.(?:${MEDIA_EXTS})(?:\\|[^\\]]*)?\\]\\]|\\[[^\\]]+\\]\\([^)\\s]+\\.(?:${MEDIA_EXTS})\\))\\s*$`, 'i');
const ITALIC_LINE = /^\*[^*].*\*$/;
// The entry's one-line door to its own rich face. It belongs to the plain view
// only: the rich face never shows it, and it never counts toward a fingerprint.
// It is dropped by the line, before blocks are built, so the words around it
// stay and it can never become a figure's caption. Inside a code fence it is
// only text, and stays.
const DOOR = /\]\((?:https?:\/\/[^)\s]*)?\/rich\/\?entry=[^)]*\)/;
function dropDoors(lines) {
  let inFence = false;
  return lines.filter((line) => {
    if (/^```/.test(line)) inFence = !inFence;
    return inFence || !DOOR.test(line);
  });
}

// ── keys ───────────────────────────────────────────────────────────────────
export function sectionKey(heading) {
  return heading.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// ── blocks ─────────────────────────────────────────────────────────────────
// Walk a section body into prose blocks and figure blocks.
//   figure = a blockquote holding media (its prose is the caption),
//            a paragraph that is only an embed, or a ```mermaid fence;
//            an italic-only line right after a figure becomes its caption.
function toBlocks(body) {
  const lines = dropDoors(body.split('\n'));
  const blocks = [];
  let i = 0;
  const pushProse = (md) => { if (md.trim()) blocks.push({ type: 'prose', md: md.trim() }); };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // fenced code
    const fence = line.match(/^```\s*([\w-]*)/);
    if (fence) {
      const lang = fence[1].toLowerCase();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      if (lang === 'mermaid') blocks.push({ type: 'figure', diagram: buf.join('\n'), media: [], caption: '' });
      else pushProse('```' + lang + '\n' + buf.join('\n') + '\n```');
      continue;
    }

    // blockquote run
    if (/^>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      const text = buf.join('\n');
      const refs = mediaRefs(text);
      if (refs.length) {
        const caption = buf.filter((l) => !ONLY_MEDIA_LINE.test(l.trim())).join('\n').trim();
        blocks.push({ type: 'figure', media: refs, caption });
      } else pushProse(buf.map((l) => '> ' + l).join('\n'));
      continue;
    }

    // paragraph
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^```/.test(lines[i]) && !/^>/.test(lines[i])) buf.push(lines[i++]);
    const para = buf.join('\n').trim();
    const prev = blocks[blocks.length - 1];
    // an embed alone, or an embed whose following lines are all one italic caption
    const [first, ...rest] = para.split('\n').map((l) => l.trim());
    const embedWithCaption = ONLY_EMBED.test(first) && rest.length > 0 && rest.every((l) => ITALIC_LINE.test(l));
    if (ONLY_EMBED.test(para) || embedWithCaption) {
      const refs = mediaRefs(first);
      const caption = embedWithCaption ? rest.map((l) => l.slice(1, -1)).join(' ').trim() : '';
      if (refs.length && isHero(refs[0].name)) blocks.push({ type: 'hero', name: refs[0].name });
      else if (refs.length) blocks.push({ type: 'figure', media: refs, caption });
      else pushProse(para);
    } else if (ITALIC_LINE.test(para) && prev && prev.type === 'figure' && !prev.caption) {
      prev.caption = para.slice(1, -1).trim();
    } else pushProse(para);
  }
  // A list written with blank lines between items is still one list.
  const LIST = /^\s*(?:[-*+]|\d+\.)\s/;
  const merged = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (b.type === 'prose' && prev && prev.type === 'prose' && LIST.test(b.md) && LIST.test(prev.md.split('\n').pop())) {
      prev.md += '\n\n' + b.md;
    } else merged.push(b);
  }
  return merged;
}

// ── entry → sections ───────────────────────────────────────────────────────
// H1 opens the first section (keyed by its own text); each H2 opens the next.
// Deeper headings stay inside their section's prose.
//
// Before the first heading: blank lines open nothing. Anything else opens an
// opening section keyed to the title — and if an H1 then arrives, that H1
// takes the opening section over instead of opening a second one. Merging
// rather than keying the stray lines apart because the H1's section *is* the
// opening (the renderer labels it so), a manifest can only address a section
// by a heading the text has, and two sections sharing a key made pieces lay
// twice and drift mark the wrong copy.
export function parseEntry(md) {
  const { fm, body } = splitFrontmatter(md.replace(/\r\n/g, '\n'));
  const lines = body.split('\n');
  const sections = [];
  let cur = null;
  let preamble = null; // the opening section, while no heading has come yet
  let inFence = false;
  const open = (heading, level) => { cur = { heading, level, key: sectionKey(heading), bodyLines: [] }; sections.push(cur); };

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    const h = !inFence && line.match(/^(#{1,2})\s+(.+?)\s*#*\s*$/);
    if (h) {
      if (preamble && h[1].length === 1) Object.assign(preamble, { heading: h[2], level: 1, key: sectionKey(h[2]) });
      else open(h[2], h[1].length);
      preamble = null;
      continue;
    }
    if (!cur) {
      if (!line.trim() || (!inFence && DOOR.test(line))) continue; // neither opens a section
      open(fm.title || 'Opening', 1);
      preamble = cur;
    }
    cur.bodyLines.push(line);
  }

  nameSections(sections);

  let hero = null;
  for (const s of sections) {
    s.blocks = toBlocks(s.bodyLines.join('\n'));
    delete s.bodyLines;
    const h = s.blocks.find((b) => b.type === 'hero');
    if (h && !hero) hero = h.name;
    s.blocks = s.blocks.filter((b) => b.type !== 'hero');
  }
  return { fm, title: fm.title || (sections[0] && sections[0].heading) || '', hero, sections };
}

// Every section gets a key no other section in the entry has. A manifest, the
// drift marks, a section's review note and fingerprint.mjs all find a section
// by its key, so two sharing one laid the same pieces under both, kept one note
// for the two, and stamped both against the second one's words.
//
// A section's name is its heading, and a heading that repeats an earlier one
// (the same key: case and emphasis don't count) is named with its place among
// them — the second "Notes" is "Notes (2)". A manifest's `heading` and
// `--stamp` use that name. A heading written that way keeps it: every heading's
// first use claims its own key before any repeat is numbered.
function nameSections(sections) {
  const taken = new Set(sections.map((s) => s.key));
  const seen = new Map(); // key -> how many sections have used it so far
  for (const s of sections) {
    s.name = s.heading;
    const n = (seen.get(s.key) || 0) + 1;
    seen.set(s.key, n);
    if (n === 1) continue;
    let i = n;
    while (taken.has(sectionKey(`${s.heading} (${i})`))) i++;
    s.name = `${s.heading} (${i})`;
    s.key = sectionKey(s.name);
    taken.add(s.key);
  }
}

// ── the fingerprint ────────────────────────────────────────────────────────
// Only the section's prose counts. Figures the text carries travel with their
// own captions, so they can't drift from themselves; what a *made* piece can
// drift from is the prose it was made to serve.
export function sectionProse(section) {
  return section.blocks.filter((b) => b.type === 'prose').map((b) => b.md).join('\n\n')
    .replace(/\s+/g, ' ').trim();
}

export async function fingerprint(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}
