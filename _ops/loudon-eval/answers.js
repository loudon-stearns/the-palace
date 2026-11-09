/* answers.js — how a page that asks Loudon something hands his answers back.
 *
 * One call, on his Submit:
 *
 *   PalaceAnswers.submit({
 *     page: 'The Lens',               // the palace entry the answers are about (required)
 *     task: 'woken-glasses',          // which ask on that page (optional)
 *     answers: { … },                 // the answers, any JSON
 *     text: 'Woken Glasses — …',      // the same answers as a readable block (recommended)
 *   }).then((r) => …)                 // r.mode is 'posted' or 'copy'
 *
 * Served by the answers server (_ops/loudon-eval/eval-server.mjs, http://127.0.0.1:8211/),
 * it POSTs them to /answers, which puts them on the STIGMERGY board, and says so on the page.
 * Anywhere else (a file:// page, the browser pane with no server, a server that is not this
 * one) or on any answer but a 2xx, it shows the answers as one block with a Copy button: one
 * click copies the whole thing, and the block is selected, so Cmd-C works where the clipboard
 * is refused. Either way the page tells him which happened.
 *
 * Include it by a path relative to the page, so it loads from file:// too, e.g. from
 * <Bundle>/proofs/<run>/page.html:  <script src="../../../_ops/loudon-eval/answers.js"></script>
 * The server also serves it at /_answers/answers.js. If it fails to load, the page's own copy
 * code is the fallback: check `window.PalaceAnswers` before calling.
 */
(function () {
  'use strict';
  var ENDPOINT = '/answers';
  var BOX = 'palace-answers-box';

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }

  function readable(o) {
    var head = 'Answers for ' + o.page + (o.task ? ' — ' + o.task : '') + '\n';
    var body = typeof o.text === 'string' && o.text.trim() ? o.text.trim()
      : typeof o.answers === 'string' ? o.answers : JSON.stringify(o.answers, null, 2);
    return head + body + '\n';
  }

  // The panel: fixed at the foot of the page, in the page's own ink and paper where it has them.
  function panel() {
    var old = document.getElementById(BOX);
    if (old) old.remove();
    var box = el('div', 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;'
      + 'width:min(680px,calc(100vw - 32px));max-height:60vh;overflow:auto;box-sizing:border-box;'
      + 'background:var(--paper,#f0eee5);color:var(--ink,#1a1916);border:1px solid var(--ink,#1a1916);'
      + 'padding:14px 16px;font:14px/1.45 system-ui,-apple-system,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.18)');
    box.id = BOX;
    box.setAttribute('role', 'status');
    var close = el('button', 'float:right;margin:-4px -6px 0 8px;background:none;border:0;font:inherit;font-size:18px;cursor:pointer;color:inherit', '×');
    close.setAttribute('aria-label', 'close');
    close.onclick = function () { box.remove(); };
    box.appendChild(close);
    document.body.appendChild(box);
    return box;
  }

  function showPosted(id) {
    var box = panel();
    box.appendChild(el('b', 'display:block;margin-bottom:4px', 'Sent to STIGMERGY.'));
    box.appendChild(el('div', '', 'Your answers are on the board. Claude reads them from there — nothing to paste.'));
    box.appendChild(el('div', 'margin-top:6px;font:12px/1.4 ui-monospace,Menlo,monospace;opacity:.7', id || ''));
  }

  function copyText(ta, status) {
    function fallback() {
      ta.focus(); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      status.textContent = ok ? 'Copied. Paste it in the chat.' : 'Selected — press Cmd-C, then paste it in the chat.';
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(ta.value).then(function () {
        status.textContent = 'Copied. Paste it in the chat.';
      }, fallback);
    } else fallback();
  }

  function showCopy(text, why) {
    var box = panel();
    box.appendChild(el('b', 'display:block;margin-bottom:4px', 'Not sent — copy your answers instead.'));
    box.appendChild(el('div', 'margin-bottom:8px', why + ' Copy the block and paste it in the chat.'));
    var ta = el('textarea', 'width:100%;box-sizing:border-box;min-height:8em;font:12px/1.4 ui-monospace,Menlo,monospace;'
      + 'background:transparent;color:inherit;border:1px solid currentColor;padding:6px');
    ta.readOnly = true;
    ta.value = text;
    box.appendChild(ta);
    var row = el('div', 'margin-top:8px;display:flex;gap:10px;align-items:center');
    var btn = el('button', 'font:inherit;padding:4px 12px;cursor:pointer;background:var(--ink,#1a1916);color:var(--paper,#f0eee5);border:0', 'Copy all');
    var status = el('span', 'font-size:13px');
    btn.onclick = function () { copyText(ta, status); };
    row.appendChild(btn); row.appendChild(status);
    box.appendChild(row);
    ta.focus(); ta.select();
  }

  function showHanded() {
    var box = panel();
    box.appendChild(el('b', 'display:block;margin-bottom:4px', 'Handed to the rich face.'));
    box.appendChild(el('div', '', 'Your answers are in the note box at the foot of this section. The face’s Send to STIGMERGY, at the bottom right, sends them with your other notes.'));
  }

  // Framed in a rich face, the page hands its answers to the face, which keeps
  // them in its note box for this section and sends them with the rest. A frame
  // nothing answers within 800 ms is not in a face, and the answers go on as usual.
  function toFace(o, text) {
    if (window.parent === window) return Promise.resolve(false);
    return new Promise(function (resolve) {
      var done = function (ok) { window.removeEventListener('message', on); clearTimeout(t); resolve(ok); };
      var on = function (e) { if (e.source === window.parent && e.data && e.data.type === 'rich:note-taken') done(!!e.data.ok); };
      var t = setTimeout(function () { done(false); }, 800);
      window.addEventListener('message', on);
      try { window.parent.postMessage({ type: 'rich:note', page: o.page, task: o.task || '', text: text }, '*'); } catch (e) { done(false); }
    });
  }

  function submit(o) {
    o = o || {};
    if (!o.page) throw new Error('PalaceAnswers.submit needs { page }');
    var text = readable(o);
    return toFace(o, text).then(function (handed) {
      if (!handed) return post(o, text);
      showHanded();
      return { mode: 'face', text: text, reason: 'They’re in the rich face’s note box for this section: send them from the face.' };
    });
  }

  function post(o, text) {
    var copy = function (why) { showCopy(text, why); return { mode: 'copy', text: text, reason: why }; };
    if (!/^https?:$/.test(location.protocol)) return Promise.resolve(copy('This page is opened as a file, so it can’t reach the board.'));
    var body = JSON.stringify({ page: o.page, task: o.task, answers: o.answers, summary: o.text, url: location.pathname });
    return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
      .then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = JSON.parse(t); } catch (e) { j = null; }
          if (r.ok && j && j.message_id) { showPosted(j.message_id); return { mode: 'posted', id: j.message_id }; }
          var why = r.status === 502 ? 'STIGMERGY isn’t running, so the board can’t take them.'
            : r.status === 404 || r.status === 405 || r.status === 501 ? 'This page isn’t opened through the answers server.'
            : 'The board said ' + r.status + (j && j.error ? ' (' + j.error + ')' : '') + '.';
          return copy(why);
        });
      }, function () { return copy('The answers server can’t be reached from here.'); });
  }

  window.PalaceAnswers = { submit: submit, readable: readable };
})();
