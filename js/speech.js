/* MM-iTalk - Ghi âm + nhận dạng giọng nói tiếng Việt liên tục (Web Speech API) + so sánh đọc to. */
(function () {
  'use strict';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function tokens(s) {
    return String(s || '').toLowerCase().normalize('NFC').replace(/[.,!?;:"“”()…\-–]/g, ' ').replace(/\s+/g, ' ').trim()
      .split(' ').filter(Boolean);
  }
  function countWords(s) { return tokens(s).length; }

  /* Tạo một phiên nói. opts: {recordAudio, onUpdate(info), onError(code), onTick} */
  function createSession(opts) {
    opts = opts || {};
    var rec = null, active = false, segs = [], interim = '', restarts = 0, startedAt = 0;
    var stream = null, mr = null, chunks = [], audioOK = false, srOK = false, errors = [];
    var stopResolve = null, lastErr = null, gotAny = false;

    function emit() {
      if (opts.onUpdate) opts.onUpdate({
        text: segs.map(function (s) { return s.t; }).join(' '),
        interim: interim, segs: segs, restarts: restarts
      });
    }
    function err(code) { errors.push(code); lastErr = code; if (opts.onError) opts.onError(code); }

    function setupRecognition() {
      if (!SR) return false;
      try {
        rec = new SR();
        rec.lang = 'vi-VN'; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
        rec.onresult = function (e) {
          gotAny = true; interim = '';
          for (var i = e.resultIndex; i < e.results.length; i++) {
            var r = e.results[i], a = r[0];
            if (r.isFinal) {
              var t = (a.transcript || '').trim();
              if (t) segs.push({ t: t, c: typeof a.confidence === 'number' ? a.confidence : 1, ts: Date.now() - startedAt });
            } else { interim += a.transcript; }
          }
          emit();
        };
        rec.onerror = function (e) {
          var c = e.error;
          if (c === 'no-speech' || c === 'aborted') return;
          if (c === 'not-allowed' || c === 'service-not-allowed') { active = false; }
          err(c);
        };
        rec.onend = function () {
          if (active) { restarts++; setTimeout(function () { if (active) { try { rec.start(); } catch (e) {} } }, 150); }
          else if (stopResolve) { finish(); }
        };
        srOK = true; return true;
      } catch (e) { err('sr-init'); return false; }
    }

    function setupAudio() {
      if (!opts.recordAudio || !navigator.mediaDevices || !window.MediaRecorder) return Promise.resolve();
      return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s;
        var mime = '';
        ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].some(function (m) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) { mime = m; return true; } return false;
        });
        mr = mime ? new MediaRecorder(s, { mimeType: mime, audioBitsPerSecond: 32000 }) : new MediaRecorder(s);
        mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        mr.start(1000); audioOK = true;
      }).catch(function (e) {
        if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) err('not-allowed');
        else err('audio-capture');
      });
    }

    function finish() {
      var done = stopResolve; stopResolve = null;
      var finalize = function (blob) {
        if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
        if (interim && !segs.length) { segs.push({ t: interim.trim(), c: 0.5, ts: Date.now() - startedAt }); }
        interim = '';
        done({
          text: segs.map(function (s) { return s.t; }).join(' '), segs: segs,
          durationMs: Date.now() - startedAt, audio: blob || null, restarts: restarts,
          srSupported: srOK, audioOK: audioOK, errors: errors, gotSpeech: gotAny
        });
      };
      if (mr && mr.state !== 'inactive') {
        mr.onstop = function () { finalize(chunks.length ? new Blob(chunks, { type: mr.mimeType || 'audio/webm' }) : null); };
        try { mr.stop(); } catch (e) { finalize(null); }
      } else finalize(chunks.length ? new Blob(chunks, { type: 'audio/webm' }) : null);
    }

    return {
      supported: !!SR,
      start: function () {
        segs = []; interim = ''; restarts = 0; errors = []; chunks = []; gotAny = false;
        startedAt = Date.now(); active = true;
        return setupAudio().then(function () {
          if (!active) return;
          if (setupRecognition()) { try { rec.start(); } catch (e) { err('sr-start'); } }
          startedAt = Date.now();
        });
      },
      stop: function () {
        return new Promise(function (resolve) {
          stopResolve = resolve; active = false;
          if (rec) { try { rec.stop(); } catch (e) {} setTimeout(function () { if (stopResolve) finish(); }, 1200); }
          else finish();
        });
      },
      elapsedMs: function () { return active ? Date.now() - startedAt : 0; },
      isActive: function () { return active; },
      lastError: function () { return lastErr; }
    };
  }

  /* So sánh lời đọc với văn bản mẫu: căn chỉnh theo khoảng cách chỉnh sửa, giữ dấu để bắt lỗi thanh điệu. */
  function compare(ref, heard) {
    var a = tokens(ref), b = tokens(heard), n = a.length, m = b.length, i, j;
    var d = []; for (i = 0; i <= n; i++) { d.push(new Array(m + 1).fill(0)); }
    for (i = 0; i <= n; i++) d[i][0] = i;
    for (j = 0; j <= m; j++) d[0][j] = j;
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      var sub = d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      d[i][j] = Math.min(sub, d[i - 1][j] + 1, d[i][j - 1] + 1);
    }
    var out = []; i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
        if (a[i - 1] === b[j - 1]) out.push({ w: a[i - 1], s: 'ok' });
        else out.push({ w: a[i - 1], s: norm(a[i - 1]) === norm(b[j - 1]) ? 'tone' : 'diff', heard: b[j - 1] });
        i--; j--;
      } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { out.push({ w: a[i - 1], s: 'miss' }); i--; }
      else { j--; }
    }
    out.reverse();
    var ok = out.filter(function (x) { return x.s === 'ok'; }).length;
    return { words: out, ok: ok, total: n, pct: n ? Math.round(ok * 100 / n) : 0 };
  }

  /* Giọng đọc tiếng Việt (nếu máy có) */
  function voice() {
    if (!window.speechSynthesis) return null;
    var vs = speechSynthesis.getVoices() || [];
    for (var i = 0; i < vs.length; i++) if (/^vi/i.test(vs[i].lang)) return vs[i];
    return null;
  }
  function speak(text) {
    var v = voice(); if (!v) return false;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = 0.9;
    speechSynthesis.speak(u); return true;
  }

  window.MMISpeech = {
    supported: !!SR, norm: norm, tokens: tokens, countWords: countWords,
    createSession: createSession, compare: compare, speak: speak,
    hasVoice: function () { return !!voice(); }
  };
  if (window.speechSynthesis) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = function () {}; } catch (e) {} }
})();
