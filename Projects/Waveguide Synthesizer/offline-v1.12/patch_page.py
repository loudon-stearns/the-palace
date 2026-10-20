"""Applies every v1.12 change onto the v1.11 page: the lesson.

The last step in the plan: a guided walk through the string that waits for
you. Seven stops in Loudon's order (pluck, reflection, loss, pitch, stiffness,
bow, body). Each stop lights one control and dims the rest, says what to do,
what to watch and what to hear, and stays until you press next. A stop notices
when your own hand has done the thing (the slider moved across most of its
range, or two plucks far apart) and ticks it off; 'show me' moves the control
for you once. Nothing is staged: the lesson only sets sliders, the same ones a
hand would move. 'walk the links' (W) stays as it was.
usage: python3 patch_page.py
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'study-v1.11-the-bow-lets-go', 'index.html')
DST_DIR = os.path.join(HERE, '..', 'study-v1.12-the-lesson')
s = open(SRC, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'expected {count} of {old[:70]!r}, found {n}'
    s = s.replace(old, new)

# ---- titles
rep('<title>Waveguide Study · v1.11 · the bow lets go</title>', '<title>Waveguide Study · v1.12 · the lesson</title>')
rep('<h1>waveguide · study · v1.11 · the bow lets go</h1>', '<h1>waveguide · study · v1.12 · the lesson</h1>')
rep('''or press <b>walk the links</b> and the page moves each slider for you.</div>''',
    '''press <b>walk the links</b> and the page moves each slider for you, or take <b>the lesson</b>: seven stops, one control each, at your own pace.</div>''')

# ---- the button
rep('''  <button id="walk">walk the links (W)</button>''',
    '''  <button id="walk">walk the links (W)</button>
  <button id="lessonBtn">the lesson (L)</button>''')

# ---- the card
rep('''<div id="walkCap">''', '''<div id="lesson">
  <div class="who"><span id="lsWho"></span><span class="dots" id="lsDots"></span></div>
  <div class="line"><b>do</b> <span id="lsDo"></span></div>
  <div class="line"><b>watch</b> <span id="lsWatch"></span></div>
  <div class="line"><b>hear</b> <span id="lsHear"></span></div>
  <div class="got" id="lsGot"></div>
  <div class="nav"><button id="lsBack">‹ back</button><button id="lsShow">show me</button><button id="lsNext">next ›</button><button id="lsQuit">leave</button></div>
</div>
<div id="walkCap">''')

# ---- styles
rep('''  #ui label.walking { color:#ffb070; }''', '''  #ui label.walking { color:#ffb070; }
  /* v1.12: the lesson card. It sits where the walk's caption sits, and dims every control but the one it is about */
  #lesson { position:absolute; left:50%; transform:translateX(-50%); bottom:54px; z-index:13; width:min(560px, calc(100% - 24px));
    font-size:13px; line-height:1.5; color:#f1e6d4; background:rgba(11,13,16,0.9); border:1px solid #8a6a3d; border-radius:4px;
    padding:10px 14px; display:none; }
  #lesson .who { color:#ffb070; letter-spacing:0.05em; margin-bottom:4px; }
  #lesson .line { margin:3px 0; }
  #lesson .line b { display:inline-block; width:46px; color:#e8b84a; font-weight:normal; letter-spacing:0.05em; }
  #lesson .got { min-height:18px; margin-top:4px; color:#9fd29a; }
  #lesson .dots { margin-top:4px; letter-spacing:4px; color:#4a4a5e; }
  #lesson .dots .done { color:#9fd29a; } #lesson .dots .here { color:#ffb070; }
  #lesson .nav button { margin-top:6px; margin-right:6px; background:#1a2128; color:#cfd3d8; border:1px solid #2a323b;
    padding:5px 11px; font:inherit; cursor:pointer; border-radius:3px; }
  #lesson .nav button:hover { background:#232c35; }
  #lesson .nav button.ready { background:#3a2a1c; border-color:#ffb070; color:#ffe2c0; box-shadow:0 0 8px rgba(255,122,61,0.45); }
  #lesson .nav button:disabled { opacity:0.35; cursor:default; }
  @media (min-width:1000px) { body:not(.short) #lesson { left:350px; transform:none; width:380px; bottom:10px; font-size:12px; }
    body:not(.short).lesson:not(.lbow) #grip { display:none; }
    body:not(.short).lbow #lesson { left:auto; right:10px; } }
  #lesson .who .dots { float:right; margin:0; }
  body.lesson #sliders label { opacity:0.22; transition:opacity 0.3s; }
  body.lesson #sliders label.focus { opacity:1; color:#ffb070; }
  body.lesson #sliders label.focus input[type=range]::-webkit-slider-thumb { background:#ffb070; box-shadow:0 0 8px #ff7a3d; }
  body.lesson #hint { display:none; }
  #ui button#lessonBtn.on { background:#3a2a1c; border-color:#8a6a3d; }''')

# ---- the bow stays on during the bow stop, even when the hand lets go of a slider
rep('''window.addEventListener('pointerup', () => { setDamp(false); setBow(false); });''',
    '''window.addEventListener('pointerup', () => { setDamp(false); if (!lessonHoldsBow()) setBow(false); });''')
rep('''  if (e.key === 'b' || e.key === 'B') setBow(false);
});''', '''  if ((e.key === 'b' || e.key === 'B') && !lessonHoldsBow()) setBow(false);
});''')

# ---- a pluck tells the lesson where it landed
rep('''  wgNode.port.postMessage({ type: 'pluck', position, mode });
}''', '''  wgNode.port.postMessage({ type: 'pluck', position, mode });
  lessonHeard('pluck', position);
}''')

# ---- the lesson steps every frame, beside the walk
rep('''  drawBoard(dt, G);
  walkStep(dt);
}''', '''  drawBoard(dt, G);
  walkStep(dt);
  lessonStep(dt);
}''')

# ---- the lesson itself
LESSON_JS = r'''
// ---- v1.12: the lesson. The last step in the plan: a guided walk through
// the string that waits for you. Seven stops, in the order Loudon set: pluck,
// reflection, loss, pitch, stiffness, bow, body. Each stop is one control, one
// thing to watch and one thing to hear. The card stays until you press next.
// When your own hand has done the thing (the slider swept across most of its
// range, or two plucks far apart), the stop ticks itself off and next lights;
// next works whether or not it has. 'show me' moves the control once for you.
// The lesson only sets sliders and views, the same ones a hand would; nothing
// in the picture is staged for it.
const LESSON = [
  { name: 'pluck', id: null, mode: 'replay', set: { slow: 4 }, links: ['string'],
    do: 'click the string near the middle, then near one end.',
    watch: 'each click replays its first three cycles slowly. the bump splits in two and the halves run apart: the two delay lines, each carrying half the wave.',
    hear: 'middle: round and soft. near an end: thin and twangy, because a sharp corner is full of high overtones.',
    got: 'two plucks, far apart: you made both shapes.' },
  { name: 'reflection', id: 'slow', from: 1.5, to: 8, mode: 'replay', set: { slow: 1.5 }, links: ['nut', 'bridge', 'clock'],
    do: 'press space, then drag slow motion toward 8 s.',
    watch: 'a half hits the post or the block and comes back upside down. there and back is two flips: upright again, where it started.',
    hear: 'no change: only the picture slows. but that round trip is one cycle of the note: the reflections make the pitch.',
    got: 'slowed right down: you can follow a half there and back.' },
  { name: 'loss', id: 'bright', from: 1, to: 0, mode: 'strobe', links: ['string', 'ladder'],
    do: 'drag brightness down to ember, pressing space as you go.',
    watch: 'the string cools. on the ladder, top right, the high bars fade first after each pluck.',
    hear: 'bright to dark, like a real pluck dying away: every lap, the loop filter takes more highs than lows.',
    got: 'swept from bright to dark: you heard the loop eat the highs.' },
  { name: 'pitch', id: 'freq', from: 110, to: 660, mode: 'strobe', links: ['beads', 'line'],
    do: 'drag pitch up and down.',
    watch: 'the beads, one per sample of the delay line: fewer of them as the note climbs.',
    hear: 'a shorter loop comes round more often, so the note is higher. the loop\u2019s length is the pitch.',
    got: 'low to high: you counted the loop in beads.' },
  { name: 'stiffness', id: 'stiff', from: 0, to: 1, mode: 'strobe', links: ['string', 'ladder'],
    do: 'drag stiffness up slowly, pressing space as you go.',
    watch: 'the wire thickens. on the ladder the amber bars slide right of their dashed rungs, the high ones furthest.',
    hear: 'guitar, then piano, then a struck bar. in a stiff string short waves run faster, so the high overtones come round sharp.',
    got: 'flexible to stiff: you heard the series bend.' },
  { name: 'bow', id: 'bfrc', from: 0.15, to: 1, bow: true, mode: 'strobe', links: ['bow', 'gWindow'],
    do: 'the bow stays on. drag bow force from light to heavy, pausing on the way.',
    watch: 'the grip chart: amber where the hair holds, dark where it slips. light lets go twice a cycle, middle once, heavy late and ragged.',
    hear: 'airy, then singing, then a crunch. the singing is one sharp corner running round the string.',
    got: 'light to heavy: you found where it sings.' },
  { name: 'body', id: 'body', from: 0, to: 1, mode: 'strobe', links: ['board', 'post', 'bridge'],
    do: 'drag body size from nothing to big.',
    watch: 'the board grows under the bridge, and the post lights as it carries the string\u2019s energy down into it.',
    hear: 'bare wire, then a boxy knock, then a deep boom. the string makes the note; the body gives it wood.',
    got: 'nothing to big: you heard the wood arrive.' },
];
let lesson = null;            // { i, done: Set, lo, hi, plucks: [], demo: { t } | null, sinceP }
const LESSON_REPLUCK_S = 2.2;
function lessonHoldsBow() { return !!(lesson && !lesson.wait && LESSON[lesson.i].bow); }
function setMode(m) { let n = 0; while (view.mode !== m && n++ < 3) cycleView(); }
function lessonDots() {
  $('lsDots').innerHTML = LESSON.map((st, k) => '<span class="' + (k === lesson.i ? 'here' : lesson.done.has(k) ? 'done' : '') + '">' +
    (lesson.done.has(k) ? '✓' : '●') + '</span>').join('');
}
function lessonGo(i) {
  if (!lesson || lesson.wait) return;
  if (LESSON[lesson.i].bow && wgNode) {
    // the same care the walk takes: still the string first, and let the bow off with it
    wgNode.port.postMessage({ type: 'still' }); lesson.wait = true;
    setBow(false);
    setTimeout(() => { if (lesson) { lesson.wait = false; lesson.i = Math.max(0, Math.min(LESSON.length - 1, i)); lessonEnter(); } }, 60);
    return;
  }
  lesson.i = Math.max(0, Math.min(LESSON.length - 1, i)); lessonEnter();
}
function lessonEnter() {
  const st = LESSON[lesson.i];
  if (view.hold) toggleHold();
  lesson.demo = null;
  for (const [k, v] of Object.entries(DEFAULTS)) setSlider(k, v);
  if (st.set) for (const [k, v] of Object.entries(st.set)) setSlider(k, v);
  setMode(st.mode);
  document.querySelectorAll('#sliders label').forEach(l => l.classList.remove('focus'));
  if (st.id) { const lab = $(st.id).closest('label'); lab.classList.add('focus'); lab.scrollIntoView({ block: 'nearest' }); }
  lesson.lo = lesson.hi = st.id ? +$(st.id).value : 0; lesson.plucks = []; lesson.sinceP = 0;
  $('lsWho').textContent = 'the lesson · ' + (lesson.i + 1) + ' of ' + LESSON.length + ' · ' + st.name;
  $('lsDo').textContent = st.do; $('lsWatch').textContent = st.watch; $('lsHear').textContent = st.hear;
  $('lsGot').textContent = lesson.done.has(lesson.i) ? '✓ ' + st.got : '';
  $('lsBack').disabled = lesson.i === 0;
  $('lsNext').textContent = lesson.i === LESSON.length - 1 ? 'finish ›' : 'next ›';
  $('lsNext').classList.toggle('ready', lesson.done.has(lesson.i));
  lessonDots();
  for (const n of st.links) flare[n] = 1;
  document.body.classList.toggle('lbow', !!st.bow);
  setBow(!!st.bow);
  if (!st.bow) pluck(st.name === 'pluck' ? 0.5 : 0.3, 'pluck');
}
function lessonTick() {    // the hand did the thing
  if (!lesson || lesson.done.has(lesson.i)) return;
  lesson.done.add(lesson.i);
  $('lsGot').textContent = '✓ ' + LESSON[lesson.i].got;
  $('lsNext').classList.add('ready'); lessonDots();
}
// a real hand on the focused slider (synthetic moves from 'show me' are not counted)
function lessonInput(e) {
  if (!lesson || lesson.wait || !e.isTrusted) return;
  const st = LESSON[lesson.i]; if (e.target.id !== st.id) return;
  const v = +e.target.value; lesson.lo = Math.min(lesson.lo, v); lesson.hi = Math.max(lesson.hi, v);
  if (lesson.hi - lesson.lo >= 0.6 * Math.abs(st.to - st.from)) lessonTick();
}
function lessonHeard(kind, position) {
  if (!lesson || lesson.demo || lesson.wait) return;
  lesson.sinceP = 0;
  if (LESSON[lesson.i].name !== 'pluck' || lesson.entering) return;
  lesson.plucks.push(position);
  if (Math.max(...lesson.plucks) - Math.min(...lesson.plucks) >= 0.3) lessonTick();
}
function lessonShow() {
  if (!lesson) return;
  const st = LESSON[lesson.i];
  if (st.id) setSlider(st.id, st.from);
  lesson.demo = { t: 0, k: 0 };
}
function lessonStep(dt) {
  if (!lesson || lesson.wait) return;
  const st = LESSON[lesson.i];
  lesson.sinceP += dt;
  const d = lesson.demo;
  if (d) {
    d.t += dt;
    if (st.name === 'pluck') {                 // show me: the middle, then near the left end
      if (d.k === 0 && d.t > 0.2) { d.k = 1; pluck(0.5, 'pluck'); }
      if (d.k === 1 && d.t > 6.5) { d.k = 2; pluck(0.1, 'pluck'); }
      if (d.t > 12.5) lesson.demo = null;
    } else {
      const u = clamp01((d.t - 0.4) / 6), e = 0.5 - 0.5 * Math.cos(Math.PI * u);
      d.since = (d.since || 0) + dt;
      if (d.since > 0.06 || u >= 1) { d.since = 0; setSlider(st.id, st.from + (st.to - st.from) * e); }
      if (!st.bow && st.mode !== 'replay' && d.t - (d.lastP || 0) > 1.4) { d.lastP = d.t; pluck(0.3, 'pluck'); }
      if (st.mode === 'replay' && d.k === 0) { d.k = 1; pluck(0.3, 'pluck'); }
      if (u >= 1 && d.t > 7) lesson.demo = null;
    }
    return;
  }
  // the page keeps the string sounding on the stops where you are only dragging
  if ((st.name === 'pitch' || st.name === 'body') && lesson.sinceP > LESSON_REPLUCK_S) pluck(0.3, 'pluck');
}
function lessonStart() {
  if (!wgNode) { startAudio().then(lessonStart, () => {}); return; }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (walk) walkStop();
  if (document.body.classList.contains('short')) document.body.classList.add('open');
  document.body.classList.add('lesson'); $('lesson').style.display = 'block';
  $('lessonBtn').classList.add('on'); $('lessonBtn').textContent = 'leave the lesson (L)';
  lesson = { i: 0, done: new Set(), wait: false };
  lessonEnter();
}
function lessonStop() {
  if (!lesson) return;
  if (LESSON[lesson.i].bow && wgNode) wgNode.port.postMessage({ type: 'still' });
  lesson = null; setBow(false);
  for (const [k, v] of Object.entries(DEFAULTS)) setSlider(k, v);
  setMode('strobe');
  document.querySelectorAll('#sliders label').forEach(l => l.classList.remove('focus'));
  document.body.classList.remove('lesson', 'lbow'); $('lesson').style.display = 'none';
  $('lessonBtn').classList.remove('on'); $('lessonBtn').textContent = 'the lesson (L)';
}
$('lessonBtn').addEventListener('click', () => (lesson ? lessonStop() : lessonStart()));
$('lsBack').addEventListener('click', () => lessonGo(lesson.i - 1));
$('lsNext').addEventListener('click', () => (lesson.i === LESSON.length - 1 ? lessonStop() : lessonGo(lesson.i + 1)));
$('lsShow').addEventListener('click', lessonShow);
$('lsQuit').addEventListener('click', lessonStop);
document.querySelectorAll('#ui input[type=range]').forEach(el => {
  el.addEventListener('input', lessonInput);
  el.addEventListener('pointerdown', () => { if (lesson) lesson.demo = null; });   // a hand takes over from 'show me'
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'l' || e.key === 'L') (lesson ? lessonStop() : lessonStart());
  if (!lesson) return;
  if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') lesson.i === LESSON.length - 1 ? lessonStop() : lessonGo(lesson.i + 1);
  if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') lessonGo(lesson.i - 1);
  if (e.key === 'Escape') lessonStop();
});
// the walk and the lesson take turns
$('walk').addEventListener('click', () => { if (lesson) lessonStop(); }, true);
'''
rep('''
function tick() {''', LESSON_JS + '''
function tick() {''')

rep('''function walkStart() {
  if (!wgNode)''', '''function walkStart() {
  if (lesson) lessonStop();
  if (!wgNode)''')

# a pluck that the lesson makes on entering a stop is not the learner's
rep('''  if (!st.bow) pluck(st.name === 'pluck' ? 0.5 : 0.3, 'pluck');
}''', '''  lesson.entering = true;
  if (!st.bow) pluck(st.name === 'pluck' ? 0.5 : 0.3, 'pluck');
  lesson.entering = false;
}''')

# ---- the hint mentions the lesson
rep('''<div id="hint">the glowing string IS the delay-line state''', '''<div id="hint">new here? press L for the lesson: seven stops, one control each · the glowing string IS the delay-line state''')

os.makedirs(DST_DIR, exist_ok=True)
open(os.path.join(DST_DIR, 'index.html'), 'w', encoding='utf-8').write(s)
print('wrote', os.path.join(DST_DIR, 'index.html'), len(s), 'bytes')
