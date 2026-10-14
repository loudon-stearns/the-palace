// A stand-in for the speakers, for checking the picture when the machine's
// audio device will not render (2026-10-14: every Chrome AudioContext here sat
// at currentTime 0). It replaces AudioContext with a shim whose worklet refuses
// to load, so the page falls back to its own main-thread engine (v1.3), and it
// drives that engine's ScriptProcessor in real time from a timer. The page's
// own DSP runs untouched; only the path to the speakers is faked. The meter
// reads the engine's real output blocks.
(() => {
  const SR = 48000;
  class FakeAnalyser { constructor(ctx) { this.ctx = ctx; this.fftSize = 2048; }
    connect() {} getFloatTimeDomainData(a) { const b = this.ctx._last; for (let i = 0; i < a.length; i++) a[i] = b[i % b.length] || 0; } }
  class FakeCtx {
    constructor() { this.sampleRate = SR; this.state = 'running'; this.destination = {}; this._last = new Float32Array(1024); this.currentTime = 0;
      this.audioWorklet = { addModule: () => Promise.reject(new Error('fake clock: worklet off')) }; }
    resume() { return Promise.resolve(); }
    createAnalyser() { return new FakeAnalyser(this); }
    createScriptProcessor(n) {
      const ctx = this, node = { onaudioprocess: null, connect() {} };
      const buf = new Float32Array(n); let due = performance.now();
      setInterval(() => {
        const now = performance.now();
        while (due <= now) {
          if (node.onaudioprocess) node.onaudioprocess({ outputBuffer: { getChannelData: () => buf } });
          ctx._last = buf.slice(); if (window.__fakeRec) window.__fakeRec.push(ctx._last); ctx.currentTime += n / SR; due += 1000 * n / SR;
        }
      }, 5);
      return node;
    }
  }
  window.AudioContext = FakeCtx; window.webkitAudioContext = FakeCtx;
})();
