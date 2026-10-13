// codebox_transpile.mjs — turn a codebox~ file's text into a JS factory
// of per-sample machines, as written. Shared by codebox_mirror.mjs (the
// Hopf codebox vs the browser engine) and codebox_mirror_all.mjs (every
// other codebox vs its Python reference).
//
//   const make = transpile(text);  const m = make(table, sr);
//   m.set('baseHz', 110); const y = m.tick();
//
// @param and @state become variables, const and function stay as they
// are, the remaining top-level body is the per-sample tick. peek(name,
// i, ch) reads `table` whatever the buffer's name, which is all the
// codeboxes here need: each binds exactly one buffer.
import fs from 'node:fs';

export function transpile(src) {
  src = src.replace(/\/\/.*$/gm, '');
  const decl = [], names = [];
  src = src.replace(/^@param\s*\(\{[^}]*\}\)\s*(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  src = src.replace(/^@state\s+(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  const consts = []; src = src.replace(/^const\s+[^;]+;/gm, m => { consts.push(m); return ''; });
  const fns = []; src = src.replace(/^function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?^\}/gm, m => { fns.push(m); return ''; });
  const body = src.trim();
  const code = `
    const floor = Math.floor, abs = Math.abs, sin = Math.sin, cos = Math.cos, exp = Math.exp, sqrt = Math.sqrt,
          pow = Math.pow, min = Math.min, max = Math.max, tanh = (x) => Math.tanh(x),
          clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
    const samplerate = sr;
    function peek(name, i, ch) { return tab[i]; }
    ${consts.join('\n')}
    ${decl.join('\n')}
    ${fns.join('\n')}
    return {
      params: ${JSON.stringify(names)},
      set(k, v) { switch (k) { ${names.map(n => `case '${n}': ${n} = v; break;`).join(' ')} default: throw new Error('no ' + k); } },
      get(k) { switch (k) { ${names.map(n => `case '${n}': return ${n};`).join(' ')} } },
      tick() { let out1 = 0; ${body}
        return out1; }
    };`;
  return new Function('tab', 'sr', code);
}

export const loadCodebox = (p) => transpile(fs.readFileSync(p, 'utf8'));

// mono float32 (or 16/32-bit PCM) WAV -> Float64Array, the same values
// Tools/scan_surface.py read_surface_wav() returns
export function readWav(p) {
  const b = fs.readFileSync(p); let i = 12, fmt = 0, bits = 0;
  while (i + 8 <= b.length) {
    const id = b.toString('ascii', i, i + 4), size = b.readUInt32LE(i + 4), o = i + 8;
    if (id === 'fmt ') { fmt = b.readUInt16LE(o); bits = b.readUInt16LE(o + 14); }
    if (id === 'data') {
      const n = size / (bits / 8), out = new Float64Array(n);
      for (let k = 0; k < n; k++) out[k] = fmt === 3 ? b.readFloatLE(o + 4 * k)
        : bits === 16 ? b.readInt16LE(o + 2 * k) / 32768 : b.readInt32LE(o + 4 * k) / 2147483648;
      return out;
    }
    i = o + size + (size & 1);
  }
  throw new Error(p + ': no data chunk');
}
