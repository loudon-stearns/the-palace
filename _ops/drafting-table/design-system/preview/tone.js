/* a short decaying tone as a WAV blob URL, so a specimen plays with no file beside it */
function paletteTone(freq, secs, kind) {
  var sr = 22050, n = Math.floor(sr * secs), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 2, true);
  for (var i = 0; i < n; i++) {
    var t = i / sr, env = Math.exp(-2.2 * t / secs), s;
    if (kind === 'saw') { s = 0; for (var k = 1; k <= 12; k++) s += Math.sin(2 * Math.PI * freq * k * t) / k; s *= 0.5; }
    else s = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s * env * 0.6)) * 32767, true);
  }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}
