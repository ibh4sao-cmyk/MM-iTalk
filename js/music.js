/* MM-iTalk - nhạc nền tạo bằng WebAudio (không cần file âm thanh).
   Nhạc tự tắt khi con đang nói (micro), khi có giọng đọc/âm thanh khác đang phát, khi ẩn tab hoặc ở Khu cha mẹ. */
(function () {
  'use strict';
  var S = window.MMIStore, AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, an = null, master = null, rainG = null, noiseSrc = null, holds = {}, timer = null;
  var okSince = 0, lastUp = 0, nextT = 0, step = 0, rainNext = 0, curStyle = null, unlocked = false, btn = null;
  var VOL = { s: 0.14, m: 0.3 }, STYLES = [['sang', 'Buổi sáng'], ['tap', 'Tập trung'], ['mua', 'Mưa nhẹ']];

  function cfg() { var st = S.settings(); if (!st.music) st.music = { on: true, style: 'sang', vol: 'm' }; return st.music; }
  function allowed() { return S.settings().musicAllowed !== false; }
  function f(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- tạo âm ---------- */
  function tone(freq, t, dur, type, vol, att, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.05);
  }
  function pad(notes, t, dur, vol) {
    notes.forEach(function (m, i) {
      tone(f(m), t, dur, 'sine', vol, dur * 0.35, null);
      tone(f(m) * (1 + 0.003 * (i % 2 ? 1 : -1)), t, dur, 'triangle', vol * 0.5, dur * 0.35, null);
    });
  }
  var CH_SANG = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];
  var CH_TAP = [[48, 55, 59, 64], [53, 57, 60, 64], [45, 55, 60, 64], [43, 55, 59, 64]];
  var PENTA = [72, 74, 76, 79, 81, 84];
  function schedule() {
    var now = ctx.currentTime, st = cfg().style, beat = 0.55;
    if (st !== curStyle) { curStyle = st; step = 0; nextT = now + 0.05; rainNext = now + 0.1; rainG.gain.setTargetAtTime(st === 'mua' ? 0.15 : 0, now, 0.8); }
    if (nextT < now) nextT = now + 0.05;
    if (rainNext < now) rainNext = now + 0.1;
    var horizon = now + 0.7;
    if (st === 'sang') {
      while (nextT < horizon) {
        var ch = CH_SANG[Math.floor(step / 8) % 4];
        if (step % 8 === 0) pad(ch.map(function (m) { return m - 12; }), nextT, beat * 8.5, 0.08);
        if (Math.random() < 0.78) {
          var m = rnd([ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24, ch[0] + 24, ch[2] + 5]);
          tone(f(m), nextT, 1.1, 'triangle', 0.2, 0.012);
        }
        nextT += beat * 0.5 * (step % 2 ? 1.3 : 0.7); step++;
      }
    } else if (st === 'tap') {
      while (nextT < horizon) {
        var c2 = CH_TAP[step % 4];
        pad(c2, nextT, 9, 0.08);
        var k = 1 + Math.floor(Math.random() * 3), tt = nextT + 1.2;
        for (var i = 0; i < k; i++) { tone(f(rnd(PENTA)), tt, 2.4, 'sine', 0.14, 0.02); tt += 1.6 + Math.random() * 1.8; }
        nextT += 6.5; step++;
      }
    } else {
      while (rainNext < horizon) {
        tone(1100 + Math.random() * 1400, rainNext, 0.09, 'sine', 0.035 + Math.random() * 0.03, 0.004);
        rainNext += 0.12 + Math.random() * 0.5;
      }
      while (nextT < horizon) { pad(rnd([[48, 55, 62], [45, 52, 60]]), nextT, 11, 0.025); nextT += 8; }
    }
  }

  function rms() { if (!an) return 0; var d = new Float32Array(an.fftSize), x = 0; an.getFloatTimeDomainData(d); for (var i = 0; i < d.length; i++) x += d[i] * d[i]; return Math.sqrt(x / d.length); }

  /* ---------- trạng thái ---------- */
  function playingMedia() {
    var a = document.querySelectorAll('audio,video');
    for (var i = 0; i < a.length; i++) if (!a[i].paused && !a[i].ended) return true;
    return false;
  }
  function wanted() {
    if (!allowed() || !cfg().on || document.hidden) return false;
    if (document.body.classList.contains('pro')) return false;          // Khu cha mẹ không có nhạc
    for (var k in holds) if (holds[k]) return false;                      // đang dùng micro
    if (window.speechSynthesis && speechSynthesis.speaking) return false; // giọng đọc mẫu
    return !playingMedia();
  }
  function tick() {
    if (!ctx) return;
    var w = wanted(), now = ctx.currentTime;
    if (w) { if (!okSince) okSince = Date.now(); } else okSince = 0;
    var up = w && Date.now() - okSince > 700;
    if (up) {
      lastUp = Date.now();
      if (ctx.state === 'suspended') ctx.resume();
      master.gain.setTargetAtTime(VOL[cfg().vol] || VOL.m, now, 0.9);
      if (ctx.state === 'running') schedule();
    } else {
      master.gain.setTargetAtTime(0, now, w ? 0.9 : 0.12);
      if (Date.now() - lastUp > 2500 && ctx.state === 'running') ctx.suspend();
    }
    paint();
  }
  function startNoise() {
    var len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { last = last * 0.96 + (Math.random() * 2 - 1) * 0.35; d[i] = last; }
    noiseSrc = ctx.createBufferSource(); noiseSrc.buffer = buf; noiseSrc.loop = true;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 600;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5500;
    rainG = ctx.createGain(); rainG.gain.value = 0;
    noiseSrc.connect(hp); hp.connect(lp); lp.connect(rainG); rainG.connect(master); noiseSrc.start();
  }
  function unlock() {
    if (unlocked || !AC) return;
    unlocked = true;
    try {
      ctx = new AC();
      var comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination);
      an = ctx.createAnalyser(); an.fftSize = 1024; comp.connect(an);
      master = ctx.createGain(); master.gain.value = 0; master.connect(comp);
      startNoise();
      if (ctx.state === 'suspended') ctx.resume();
      timer = setInterval(tick, 150); tick();
    } catch (e) { ctx = null; }
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, unlock, { once: true, passive: true, capture: true }); });
  document.addEventListener('visibilitychange', function () { tick(); });

  /* ---------- nút bật/tắt ---------- */
  function paint() {
    if (!btn) return;
    var on = allowed() && cfg().on;
    btn.style.display = allowed() ? '' : 'none';
    btn.classList.toggle('off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? 'Tắt nhạc nền' : 'Bật nhạc nền';
    btn.setAttribute('aria-label', btn.title);
  }
  function setCfg(o) {
    var c = cfg(); Object.keys(o).forEach(function (k) { c[k] = o[k]; }); S.save(); unlock(); paint(); tick();
  }
  function init() {
    btn = document.createElement('button');
    btn.id = 'musicBtn'; btn.type = 'button'; btn.innerHTML = '<span aria-hidden="true">♪</span>';
    btn.addEventListener('click', function () { setCfg({ on: !cfg().on }); });
    document.body.appendChild(btn); paint();
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);

  /* Một chỗ gọi từ speech.js: hold('mic') khi bắt đầu nói, release('mic') khi xong */
  window.MMIMusic = {
    STYLES: STYLES,
    hold: function (k) { holds[k] = true; if (ctx) tick(); },
    release: function (k) { delete holds[k]; },
    debug: function () { var h = []; for (var k in holds) h.push(k); return { state: ctx && ctx.state, gain: master ? master.gain.value : null, holds: h, wanted: wanted(), rms: rms() }; },
    set: setCfg, get: cfg, allowed: allowed, refresh: function () { paint(); tick(); }
  };
})();
