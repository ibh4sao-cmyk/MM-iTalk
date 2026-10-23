/* MM-iTalk - ứng dụng chính: màn hình, vòng học 8 bước, sao, cửa hàng, sổ tay. */
(function () {
  'use strict';
  var D = window.MMI_DATA, S = window.MMIStore, Sp = window.MMISpeech, M = window.MMIMascot;
  var LESSONS = window.MMI_LESSONS || [];
  var app = document.getElementById('app');
  var ctx = null, session = null, tick = null, prepTick = null, urls = [], deferredInstall = null, reader = null;

  /* ---------- tiện ích ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function fmtMin(sec) { var m = Math.round(sec / 30) / 2; return String(m).replace('.', ',') + ' phút'; }
  function targetLabel(t) { return t.max <= 90 ? t.min + '–' + t.max + ' giây' : 'khoảng ' + fmtMin((t.min + t.max) / 2); }
  function dateVN(ts) { var d = new Date(ts); return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear(); }
  var toastT = null;
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }
  function profile() { return S.profile(); }
  function lessonsOf(level, chang) {
    return LESSONS.filter(function (l) { return l.level === level && (!chang || l.chang === chang); }).sort(function (a, b) { return a.chang - b.chang || a.order - b.order; });
  }
  function changUnlocked(P, n) {
    if (n <= 1 || P.unlockAll) return true;
    var ch = lessonsOf(P.level, n - 1).filter(function (l) { return l.challenge; })[0];
    return !!(ch && P.progress[ch.id] && P.progress[ch.id].done);
  }
  function allVocab(L) { return L.sample.vocab.concat((L.sample.alt && L.sample.alt.vocab) || []); }
  function sampleVariants(L) {
    var v = [{ id: 'base', label: 'Cách cơ bản', paras: L.sample.paras }];
    if (L.sample.alt) v.push({ id: 'alt', label: '✨ Góc nhìn mới', angle: L.sample.alt.angle, paras: L.sample.alt.paras, why: L.sample.alt.why, vocab: L.sample.alt.vocab });
    ((S.get().customSamples || {})[L.id] || []).forEach(function (c) { v.push({ id: 'c' + c.id, label: '👪 ' + c.title, paras: c.paras, custom: true }); });
    return v;
  }
  function curVariant() {
    var vs = sampleVariants(ctx.L);
    for (var i = 0; i < vs.length; i++) if (vs[i].id === ctx.sampleTab) return vs[i];
    return vs[0];
  }
  function findLesson(id) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i]; return null; }
  function stopAll() {
    clearInterval(tick); tick = null; clearInterval(prepTick); prepTick = null;
    if (session && session.isActive()) { try { session.stop(); } catch (e) {} }
    session = null;
    if (reader && reader.session && reader.session.isActive()) { try { reader.session.stop(); } catch (e) {} }
    reader = null;
    urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); urls = [];
    if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  }
  function setLevelAttr() { var P = profile(); document.body.setAttribute('data-level', P ? P.level : 'th'); }
  function render(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function nav(h) { if (location.hash === '#' + h) route(); else location.hash = h; }
  function levelLabel(P) { return P.level === 'th' ? 'Tiểu học · lớp ' + P.grade : 'THCS · lớp ' + P.grade; }

  /* ---------- khung chung ---------- */
  function topbar(P, back) {
    return '<div class="topbar"><div class="row">' +
      (back ? '<button class="btn alt sm" data-act="nav" data-to="' + back + '" aria-label="Quay lại">← Quay lại</button>' : '') +
      '<div><div class="logo">MM-<b>iTalk</b></div>' + (back ? '' : '<div class="tagline">Nhìn – Nghĩ – Nói</div>') + '</div></div>' +
      (P ? '<div class="row"><span class="chip star" title="Số sao">⭐ <span id="starCount">' + P.stars + '</span></span><button class="chip" data-act="nav" data-to="/profiles" title="Đổi bạn">' + esc(P.name) + '</button></div>' : '') + '</div>';
  }
  function parentHTML(L) {
    var p = D.parent;
    var qs = L && L.parentQs ? '<p><b>Câu hỏi gợi mở cho bài này:</b></p><ul>' + L.parentQs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>' : '';
    return '<details class="parent"><summary>Dành cho cha mẹ – bấm để xem</summary>' +
      '<p>' + esc(p.role) + '</p><p><b>Nên làm</b></p><ul>' + p.do.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<p><b>Nên tránh</b></p><ul>' + p.avoid.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' + qs +
      '<p class="small muted"><b>Quyền riêng tư:</b> ' + esc(p.privacy) + '</p></details>';
  }

  /* ---------- định tuyến ---------- */
  function route() {
    stopAll();
    var h = (location.hash || '#/').slice(1), parts = h.split('/').filter(Boolean), P = profile();
    if (parts[0] !== 'parent' && window.MMIParent) window.MMIParent.onLeave();
    if (!P && parts[0] !== 'profiles' && parts[0] !== 'parent') return nav('/profiles');
    setLevelAttr();
    switch (parts[0]) {
      case 'parent': return window.MMIParent ? window.MMIParent.view(parts) : viewHome();
      case 'profiles': return viewProfiles();
      case 'guide': return viewGuide(parseInt(parts[1] || '0', 10));
      case 'lesson': return viewLesson(parts[1]);
      case 'shop': return viewShop(parts[1] || 'hat');
      case 'book': return viewBook(parts[1] || 'vocab');
      case 'free': return viewFree(parts[1] || 'vat');
      case 'settings': return viewSettings();
      default: return viewHome();
    }
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; });

  /* ---------- hồ sơ ---------- */
  function viewProfiles() {
    var ps = S.profiles();
    var list = ps.map(function (p) {
      return '<div class="card soft profile-card" data-act="pickprofile" data-id="' + p.id + '">' + M.render(p.equipped, { size: 'sm' }) +
        '<div class="grow"><h3>' + esc(p.name) + '</h3><div class="muted">' + esc(levelLabel(p)) + ' · ⭐ ' + p.stars + '</div></div>' +
        '<span class="btn sm">Chọn</span></div>';
    }).join('');
    var form = ps.length >= 4 ? '<p class="muted">Máy này đã có 4 hồ sơ (tối đa).</p>' :
      '<div class="card" id="newProfile"><h2>' + (ps.length ? 'Thêm bạn mới' : 'Chào mừng đến với MM-iTalk!') + '</h2>' +
      '<p class="muted">Mỗi bạn có hồ sơ riêng: sao, bài đã học và ghi âm đều tách biệt trên máy này.</p>' +
      '<div class="field"><label for="pName">Tên của em</label><input id="pName" type="text" maxlength="20" placeholder="Ví dụ: Bin" autocomplete="off"></div>' +
      '<div class="field"><label for="pLevel">Em đang học</label><select id="pLevel"><option value="th">Tiểu học (lớp 2–5)</option><option value="thcs">THCS (lớp 6–9)</option></select></div>' +
      '<div class="field"><label for="pGrade">Lớp</label><select id="pGrade"></select></div>' +
      '<button class="btn big" data-act="addprofile">Bắt đầu nào!</button></div>';
    render('<div class="topbar"><div><div class="logo">MM-<b>iTalk</b></div><div class="tagline">Nhìn – Nghĩ – Nói</div></div></div>' +
      (ps.length ? '<h2>Ai đang học đây?</h2><div class="col mb">' + list + '</div>' : '') + form);
    fillGrades();
  }
  function fillGrades() {
    var lv = document.getElementById('pLevel'), gr = document.getElementById('pGrade'); if (!lv || !gr) return;
    var set = function () {
      var arr = lv.value === 'th' ? [2, 3, 4, 5] : [6, 7, 8, 9];
      gr.innerHTML = arr.map(function (g) { return '<option value="' + g + '">Lớp ' + g + '</option>'; }).join('');
    };
    lv.onchange = set; set();
  }

  /* ---------- Cách học ---------- */
  function viewGuide(i) {
    var P = profile(), cards = D.guide[P.level], c = cards[i] || cards[0]; i = cards[i] ? i : 0;
    var last = i === cards.length - 1;
    render(topbar(P, '/') + '<div class="card guide-card"><div class="ic">' + c.icon + '</div><h2>' + (i + 1) + '. ' + esc(c.title) + '</h2><p style="font-size:1.08em">' + esc(c.text) + '</p></div>' +
      '<div class="dots">' + cards.map(function (_, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      '<div class="row between">' + (i > 0 ? '<button class="btn alt" data-act="nav" data-to="/guide/' + (i - 1) + '">← Trước</button>' : '<span></span>') +
      (last ? '<button class="btn green" data-act="guidedone">Đã hiểu, bắt đầu học!</button>' : '<button class="btn" data-act="nav" data-to="/guide/' + (i + 1) + '">Tiếp →</button>') + '</div>' +
      parentHTML(null));
  }

  /* ---------- Trang chủ ---------- */
  function weekCount(P) { return (P.stamps[S.weekKey()] || []).length; }
  function badgesHTML(P) {
    var b = P.badges || []; if (!b.length) return '';
    return '<div class="card soft mb"><b>🏅 Huy hiệu của em:</b> ' + b.map(function (id) { var n = parseInt(id.split('-')[2], 10); return '<span class="badge g">' + esc(D.badges[n - 1] || id) + '</span>'; }).join(' ') + '</div>';
  }
  function viewHome() {
    var P = profile(); if (!P.seenGuide) return nav('/guide/0');
    var changs = D.chang[P.level], mine = lessonsOf(P.level).filter(function (l) { return changUnlocked(P, l.chang); });
    var next = mine.filter(function (l) { return !(P.progress[l.id] && P.progress[l.id].done); })[0];
    var wc = weekCount(P), stamps = '';
    for (var i = 0; i < 3; i++) stamps += '<div class="stamp ' + (i < wc ? 'on' : '') + '">' + (i < wc ? '⭐' : '') + '</div>';
    var today = next ?
      '<div class="card today mb"><div class="row between"><div><span class="badge">Bài hôm nay</span><h2 style="margin-top:6px">' + (next.icon || D.kindIcon[next.kind]) + ' ' + esc(next.title) + '</h2><p class="muted">Mục tiêu: ' + targetLabel(next.target) + ' · ' + next.ngan.length + ' ngăn ý</p></div>' +
      '<button class="btn big" data-act="nav" data-to="/lesson/' + next.id + '">Học thôi! →</button></div></div>' :
      '<div class="card ok mb"><h2>Em đã xong các bài hiện có!</h2><p>Hãy luyện lại một bài cũ để nói hay hơn, hoặc chờ bài mới nhé.</p></div>';
    var chHTML = changs.map(function (c) {
      var ls = lessonsOf(P.level, c.n), unlocked = changUnlocked(P, c.n);
      var cards = !unlocked ? '' : ls.map(function (l) {
        var pr = P.progress[l.id], done = pr && pr.done;
        return '<button class="lesson-card ' + (done ? 'done' : '') + '" data-act="nav" data-to="/lesson/' + l.id + '"><span class="ico">' + (l.icon || D.kindIcon[l.kind]) + '</span><b>' + esc(l.title) + '</b>' +
          '<span class="muted small">' + targetLabel(l.target) + ' · ' + l.ngan.length + ' ngăn</span>' + (l.challenge ? '<span class="badge y">🏆 Thử thách</span>' : '') +
          '<span><span class="badge">Gợi ý: ' + esc(D.hintNames[l.hint]) + '</span> ' + (done ? '<span class="badge g">Đã xong +' + (pr.stars || 0) + '⭐</span>' : '') + '</span></button>';
      }).join('');
      var rest = c.total - ls.length;
      var lock = !unlocked ? '<div class="lesson-card locked"><span class="ico">🔒</span><b>Chặng ' + c.n + ' đang khóa</b><span class="muted small">Hoàn thành 🏆 Thử thách của chặng ' + (c.n - 1) + ' để mở chặng này</span></div>' :
        (rest > 0 ? '<div class="lesson-card locked"><span class="ico">🛠️</span><b>Còn ' + rest + ' bài nữa</b><span class="muted small">Đang được soạn thêm</span></div>' : '');
      return '<section class="chang"><div class="chang-h"><span class="num">' + c.n + '</span><h2 style="margin:0">Chặng ' + c.n + ': ' + esc(c.name) + '</h2><span class="muted small">Tuần ' + c.weeks + ' · nói ' + c.time + ' · ' + c.ngan + ' ngăn ý · ' + esc(c.hint) + '</span></div>' +
        '<div class="lessons">' + cards + lock + '</div></section>';
    }).join('');
    render(topbar(P, null) +
      '<div class="card mb hello">' + M.render(P.equipped, { size: 'md' }) + '<div><h1>Chào ' + esc(P.name) + '!</h1><p class="muted">Vẹt con đang chờ nghe em kể chuyện. Mỗi tuần mình luyện 3 buổi nhé.</p>' +
      '<div class="row"><b>Tem tuần này:</b><div class="stamps">' + stamps + '</div></div>' +
      '<div class="row mt"><button class="btn sm" data-act="nav" data-to="/free">🗣️ Nói tự do</button><button class="btn alt sm" data-act="nav" data-to="/shop">🛍️ Cửa hàng</button><button class="btn alt sm" data-act="nav" data-to="/book">📒 Sổ tay</button><button class="btn alt sm" data-act="nav" data-to="/guide/0">❓ Cách học</button><button class="btn alt sm" data-act="nav" data-to="/settings">⚙️ Cài đặt</button><button class="btn ghost sm" data-act="nav" data-to="/parent">🔒 Cha mẹ</button></div></div></div>' +
      (Sp.isMobile ? '<div class="card warn mb">📱 Trên điện thoại, MM-iTalk tạm thời chỉ để xem nội dung. Để luyện nói và đếm từ, em hãy mở trên máy tính (Chrome) nhé.</div>' : '') +
      badgesHTML(P) + today + chHTML + parentHTML(null));
  }

  /* ---------- Bài học ---------- */
  var PLANS = ['Nói thêm ngăn ý còn thiếu', 'Dùng vài từ mới trong bài mẫu', 'Nói chậm và rõ hơn', 'Thêm một ví dụ hoặc một câu so sánh'];
  var STEPS = ['Đề bài', 'Gợi ý', 'Chuẩn bị', 'Nói lần 1', 'Soi lại', 'Bài mẫu', 'Nói lần 2', 'Thưởng'];
  function viewLesson(id) {
    var L = findLesson(id), P = profile(); if (!L || L.level !== P.level) return nav('/');
    if (!changUnlocked(P, L.chang)) { toast('Chặng này đang khóa. Em hoàn thành Thử thách của chặng trước để mở nhé!'); return nav('/'); }
    ctx = { L: L, step: 0, level: L.hint, helped: false, att: [null, null], reflect: { silence: '', plan: {} }, check: null, readDone: false, vocab: {}, prepped: {}, finished: false };
    allVocab(L).forEach(function (v) { ctx.vocab[v.w] = true; });
    renderStep();
  }
  function gc(i) { return D.ganColors[i % D.ganColors.length]; }
  function stepper() {
    return '<div class="stepper" aria-label="Tiến độ">' + STEPS.map(function (_, i) { return '<i class="' + (i < ctx.step ? 'on' : (i === ctx.step ? 'cur' : '')) + '"></i>'; }).join('') + '</div>' +
      '<div class="step-title"><span class="n">Bước ' + (ctx.step + 1) + '/' + STEPS.length + '</span><h2 style="margin:0">' + esc(STEPS[ctx.step]) + '</h2></div>';
  }
  function isTH() { var P = profile(); return !!P && P.level === 'th'; }
  function lessonFrame(inner) {
    render(topbar(profile(), '/') + '<h3 class="muted" style="margin-bottom:4px">' + (ctx.L.icon || D.kindIcon[ctx.L.kind]) + ' ' + esc(ctx.L.title) + '</h3>' + stepper() + inner + parentHTML(ctx.L));
  }
  function goStep(n) { stopAll(); ctx.step = n; renderStep(); }
  function renderStep() {
    switch (ctx.step) {
      case 0: return stepIntro();
      case 1: return stepHint();
      case 2: return stepPrep();
      case 3: return stepSpeak(0);
      case 4: return stepReview();
      case 5: return stepSample();
      case 6: return stepSpeak(1);
      default: return stepDone();
    }
  }

  function stepIntro() {
    var L = ctx.L;
    lessonFrame('<div class="card"><div class="hello" style="grid-template-columns:auto 1fr">' + M.render(profile().equipped, { size: 'md' }) +
      '<div><h2>' + esc(L.title) + '</h2><p style="font-size:1.1em">' + esc(L.task) + '</p>' +
      '<div class="row"><span class="badge">Mục tiêu: ' + targetLabel(L.target) + '</span><span class="badge">' + L.ngan.length + ' ngăn ý</span><span class="badge">Gợi ý: ' + esc(D.hintNames[L.hint]) + '</span></div></div></div></div>' +
      (L.challenge ? '<div class="card warn mt">🏆 <b>Đây là Thử thách của chặng ' + L.chang + '.</b> Hoàn thành để nhận <b>+5 ⭐</b>, một <b>huy hiệu</b>' + (L.chang < 4 ? ' và mở chặng ' + (L.chang + 1) : '') + '. Chủ đề Thử thách đã được chọn sẵn cho em.</div>' : '') +
      '<div class="card soft mt">💡 Em có thể <b>dùng vật khác quanh em</b> (cùng loại) thay cho ví dụ trong đề. Các ngăn ý vẫn dùng được y như vậy.</div>' +
      '<div class="card soft mt"><b>Vẹt con đang chờ!</b> Bạn ấy chưa biết gì về chủ đề này. Em hãy giải thích thật rõ cho bạn ấy hiểu nhé. Một bài học gồm ' + STEPS.length + ' bước, mất khoảng ' + (isTH() ? '15–25' : '20–30') + ' phút.</div>' +
      '<div class="mt"><button class="btn big" data-act="step" data-n="1">Bắt đầu →</button></div>');
  }

  function hintCards(L, level) {
    if (level >= 5) return '<div class="hint-box"><b>Lần này không có gợi ý nào.</b> Em đã đủ khỏe để tự bước lên rồi! Nếu cần, em vẫn bấm "Cần giúp" được.</div>';
    return L.ngan.map(function (g, i) {
      var body = '';
      if (level === 1) body = '<div class="sent">' + esc(g.l1).replace(/___/g, '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>') + '</div><div class="kws">' + g.hint3.map(function (k) { return '<span class="kw">' + esc(k) + '</span>'; }).join('') + '</div>';
      else if (level === 2) body = '<div class="sent">' + esc(g.l2) + '</div>';
      else if (level === 3) body = '<div class="kws">' + g.hint3.map(function (k) { return '<span class="kw">' + esc(k) + '</span>'; }).join('') + '</div>';
      return '<div class="ngan-card" style="--c:' + gc(i) + '"><div class="nm"><span class="no">' + (i + 1) + '</span>' + esc(g.name) + '</div>' + body + '</div>';
    }).join('');
  }
  function stepHint() {
    var L = ctx.L;
    lessonFrame('<p>Mức gợi ý hôm nay: <b id="hintName">' + esc(D.hintNames[ctx.level]) + '</b>. Đọc kỹ rồi nhẩm trong đầu nhé.</p><div id="hints">' + hintCards(L, ctx.level) + '</div>' +
      '<div class="row mt">' + (ctx.level > 1 ? '<button class="btn alt" data-act="help">🪜 Cần giúp thêm</button>' : '') + '<button class="btn" data-act="step" data-n="2">Em đã đọc xong →</button></div>' +
      '<p class="muted small mt">Bấm "Cần giúp thêm" khi em thấy khó. Không bị trừ sao đâu, chỉ không nhận sao thưởng "Tự lực".</p>');
  }

  function stepPrep() {
    var L = ctx.L;
    lessonFrame('<p>Chạm vào từng ngăn ý và nhẩm trong đầu em sẽ nói gì (chưa cần thu âm). Nhìn vật thật nếu em có.</p>' +
      '<div class="ngan-list" id="prepList">' + L.ngan.map(function (g, i) { return '<button class="ngan-pill" style="--c:' + gc(i) + ';opacity:' + (ctx.prepped[i] ? 1 : .45) + '" data-act="prep" data-i="' + i + '">' + (ctx.prepped[i] ? '✔ ' : '') + (i + 1) + '. ' + esc(g.name) + '</button>'; }).join('') + '</div>' +
      '<div class="card soft center"><div class="stars-big" id="prepClock" style="font-size:2.2em;color:var(--ink)">2:00</div><button class="btn alt" id="prepBtn" data-act="prepstart">⏱️ Nháp 2 phút (không bắt buộc)</button></div>' +
      '<div class="row mt"><button class="btn alt" data-act="step" data-n="1">← Xem lại gợi ý</button><button class="btn big" data-act="step" data-n="3">Em sẵn sàng nói! →</button></div>');
  }

  /* ----- Nói ----- */
  function consentCard(n) {
    return '<div class="card warn"><h3>Trước khi nói, cha mẹ và em cùng đọc nhé</h3><ul>' +
      '<li>Chrome sẽ hỏi quyền dùng <b>micro</b>. Em bấm "Cho phép".</li>' +
      '<li>Bản ghi âm của em (nếu có) <b>chỉ lưu trong máy này</b>.</li>' +
      '<li>Để chuyển lời nói thành chữ, Chrome gửi âm thanh qua mạng tới dịch vụ nhận dạng giọng nói của Google, nên máy cần có mạng.</li></ul>' +
      '<button class="btn" data-act="consent" data-n="' + n + '">Em và cha mẹ đã hiểu</button></div>';
  }
  function ringSVG(frac, ok) {
    var C = 2 * Math.PI * 90, off = C * (1 - Math.min(1, frac));
    return '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="none" stroke="#eadfce" stroke-width="14"/><circle id="ringArc" cx="100" cy="100" r="90" fill="none" stroke="' + (ok ? '#2fb67c' : '#4c8dff') + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg>';
  }
  function stepSpeak(n) {
    var L = ctx.L, P = profile();
    if (!S.settings().consent) return lessonFrame(consentCard(n));
    var warn = '';
    if (!Sp.supported) warn += '<div class="card warn mb"><b>Trình duyệt này chưa chuyển được giọng nói thành chữ.</b> Em vẫn nói và ghi âm được, app vẫn tính thời gian em nói. Để dùng đầy đủ, hãy mở bằng Chrome trên máy tính.</div>';
    if (S.memoryOnly()) warn += '<div class="card warn mb">Trình duyệt đang chặn lưu dữ liệu, nên bài làm sẽ mất khi đóng trang.</div>';
    var tips = n === 1 ? '<div class="card soft mb"><b>Nói lại lần hai:</b> ' + esc(L.sample.tip) + '<div class="kws">' + allVocab(L).map(function (v) { return '<span class="kw">' + esc(v.w) + '</span>'; }).join('') + '</div></div>' : '';
    lessonFrame(warn + tips +
      '<div class="card center"><div class="row" style="justify-content:center">' + M.render(P.equipped, { size: 'md', talk: false }) + '</div>' +
      '<div class="timer"><div class="ring">' + ringSVG(0, false) + '<div class="t" id="clock">0:00</div><div class="sub" id="clockSub">Mục tiêu ' + mmss(L.target.min) + '–' + mmss(L.target.max) + '</div></div></div>' +
      '<div class="ngan-list">' + L.ngan.map(function (g, i) { return '<span class="ngan-pill" style="--c:' + gc(i) + '">' + (i + 1) + '. ' + esc(g.name) + '</span>'; }).join('') + '</div>' +
      '<div id="status" class="muted" style="min-height:28px">' + (n === 1 ? 'Hãy giải thích lại cho Vẹt con, dùng thêm ý và từ mới em vừa học.' : 'Khi sẵn sàng, bấm nút bên dưới và nói thật to, rõ.') + '</div>' +
      '<div id="speakBtns"><button class="btn big" data-act="speakstart" data-n="' + n + '">🎙️ Bắt đầu nói</button></div></div>' +
      '<div id="speakResult"></div>');
  }

  function startSpeaking(n) {
    var L = ctx.L, btns = document.getElementById('speakBtns'), status = document.getElementById('status'), clock = document.getElementById('clock');
    var cnt = 3; btns.innerHTML = ''; status.textContent = 'Chuẩn bị nhé…'; clock.textContent = cnt;
    var cd = setInterval(function () {
      cnt--; if (cnt > 0) { clock.textContent = cnt; return; }
      clearInterval(cd); begin();
    }, 800);
    tick = cd;
    function begin() {
      session = Sp.createSession({
        recordAudio: !!S.settings().recAudio && !Sp.isMobile,
        onError: function (code) {
          var m = { 'not-allowed': 'Chrome chưa cho dùng micro. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, chọn cho phép Micro, rồi thử lại.', 'audio-capture': 'Không tìm thấy micro. Hãy cắm micro hoặc kiểm tra lại.', 'network': 'Không kết nối được dịch vụ nhận dạng giọng nói (cần có mạng). Em vẫn nói được, app vẫn tính thời gian em nói.' }[code];
          if (m) { var s = document.getElementById('status'); if (s) s.innerHTML = '<span style="color:#b9332d;font-weight:700">' + esc(m) + '</span>'; }
        },
        onUpdate: function () {}
      });
      var startP = session.start();
      document.querySelector('.stage .parrot').classList.add('talk');
      document.getElementById('speakBtns').innerHTML = '<button class="btn red big" data-act="speakstop" data-n="' + n + '">⏹️ Xong rồi</button>';
      document.getElementById('status').innerHTML = '<span class="rec-dot"></span>Vẹt con đang nghe em… (em có thể nói tiếp đến khi hết ý)';
      var reached = false, t0 = Date.now();
      tick = setInterval(function () {
        var el = (Date.now() - t0) / 1000;
        var c = document.getElementById('clock'); if (!c) return;
        c.textContent = mmss(el);
        var arc = document.getElementById('ringArc');
        if (arc) {
          var C = 2 * Math.PI * 90; arc.setAttribute('stroke-dashoffset', (C * (1 - Math.min(1, el / L.target.max))).toFixed(1));
          arc.setAttribute('stroke', el >= L.target.min ? '#2fb67c' : '#4c8dff');
        }
        if (!reached && el >= L.target.min) { reached = true; toast('Đã đủ thời gian mục tiêu! Em có thể nói tiếp nếu còn ý.'); }
      }, 250);
      startP.catch(function () {});
    }
  }

  function words(s) { return Sp.countWords(s); }
  function coverage(text) {
    var t = ' ' + Sp.norm(text) + ' ';
    return ctx.L.ngan.map(function (g) {
      var hits = 0; g.kw.forEach(function (k) { if (t.indexOf(' ' + Sp.norm(k) + ' ') >= 0 || t.indexOf(Sp.norm(k)) >= 0) hits++; });
      return hits;
    });
  }
  function stopSpeaking(n) {
    clearInterval(tick); tick = null;
    var s = session; session = null; if (!s) return;
    var p = document.querySelector('.stage .parrot'); if (p) p.classList.remove('talk');
    document.getElementById('speakBtns').innerHTML = '';
    document.getElementById('status').textContent = 'Đang xử lý lời em nói…';
    s.stop().then(function (res) {
      var dur = Math.round(res.durationMs / 1000), text = res.text;
      ctx.att[n] = { dur: dur, text: text, segs: res.segs, audio: res.audio, words: words(text), restarts: res.restarts, typed: false, srOK: res.srSupported, dropped: res.recDropped };
      if (ctx.free) return showFreeResult();
      showSpeakResult(n);
    });
  }
  function showSpeakResult(n) {
    var a = ctx.att[n], L = ctx.L, el = document.getElementById('speakResult'); if (!el) return;
    document.getElementById('status').textContent = 'Em đã nói xong!';
    var pace = a.dur > 0 ? Math.round(a.words * 60 / a.dur) : 0;
    var short = a.dur < 8 ? '<div class="card warn mt">Lần này hơi ngắn. Em có thể bấm "Nói lại" để thử lần nữa, hoặc đi tiếp cũng được.</div>' : '';
    var typed = '';
    if (!a.text) {
      typed = '<div class="card warn mt"><b>Máy chưa nghe được chữ nào.</b> ' + (a.srOK ? 'Có thể micro nói nhỏ, nói quá xa micro hoặc máy không có mạng. ' : 'Trình duyệt này chưa chuyển được giọng nói thành chữ. ') + 'Không sao! App vẫn tính thời gian em nói. Em bấm "Tiếp tục" để học tiếp, hoặc "Nói lại" nếu muốn thử lần nữa.</div>';
    }
    var cmp = '';
    if (n === 1 && ctx.att[0]) {
      var b = ctx.att[0], dd = a.dur - b.dur, c1 = coverage(b.text).filter(function (x) { return x >= 2; }).length, c2 = coverage(a.text).filter(function (x) { return x >= 2; }).length;
      cmp = '<div class="card soft mt"><b>So với lần 1:</b><div class="metrics mt"><div class="metric"><b>' + (dd >= 0 ? '+' : '') + dd + 's</b>thời gian</div><div class="metric"><b>' + (a.words - b.words >= 0 ? '+' : '') + (a.words - b.words) + '</b>từ</div><div class="metric"><b>' + c1 + '→' + c2 + '</b>ngăn nghe thấy</div></div></div>';
    }
    el.innerHTML = '<div class="card mt"><div class="metrics"><div class="metric"><b>' + mmss(a.dur) + '</b>thời gian</div><div class="metric"><b>' + a.words + '</b>số từ</div><div class="metric"><b>' + (a.dur >= 10 && pace ? pace : '–') + '</b>từ mỗi phút</div></div></div>' + short + typed + cmp +
      '<div class="row mt"><button class="btn alt" data-act="retry" data-n="' + n + '">🔁 Nói lại</button><button class="btn big" data-act="step" data-n="' + (n === 0 ? 4 : 7) + '">Tiếp tục →</button></div>';
    var cl = document.getElementById('clock'); if (cl) cl.textContent = mmss(a.dur);
  }

  /* ----- Soi lại ----- */
  function transcriptHTML(a) {
    if (!a) return '';
    if (a.segs && a.segs.length) return a.segs.map(function (s) { return '<span class="' + (s.c < 0.7 ? 'low' : '') + '">' + esc(s.t) + '</span>'; }).join(' ');
    return esc(a.text || '');
  }
  function stepReview() {
    var L = ctx.L, a = ctx.att[0] || { text: '', dur: 0, words: 0, segs: [] };
    var cov = coverage(a.text);
    if (!ctx.check) ctx.check = cov.map(function (h) { return h >= 2; });
    var url = '';
    if (a.audio) { url = URL.createObjectURL(a.audio); urls.push(url); }
    var pace = a.dur > 0 ? Math.round(a.words * 60 / a.dur) : 0;
    lessonFrame('<p>Bây giờ em là "người nghe". Nghe lại lời mình nói và tìm xem chỗ nào còn thiếu, chỗ nào Vẹt con khó hiểu.</p>' +
      (url ? '<div class="card soft mb"><b>🔊 Nghe lại lời em nói</b><br><audio controls src="' + url + '" style="width:100%;margin-top:6px"></audio></div>' : (Sp.isMobile ? '<div class="card soft mb">Trên điện thoại, app chưa lưu ghi âm để máy đếm được chữ. Em đọc phần chữ máy nghe được ở dưới nhé.</div>' : '')) +
      '<div class="card soft mb"><b>📝 Máy nghe được:</b><div class="tx mt">' + (a.text ? transcriptHTML(a) : '<span class="muted">Chưa có chữ. Không sao, em vẫn tự soi lại được bằng trí nhớ.</span>') + '</div>' +
      '<p class="muted small mt">Máy chưa viết dấu chấm, dấu phẩy. Những chỗ gạch chấm đỏ là chỗ máy nghe chưa chắc, em nghe lại để tự quyết định nhé. Máy cũng có thể nghe sai, nhất là với giọng vùng miền.</p></div>' +
      '<div class="metrics mb"><div class="metric"><b>' + mmss(a.dur) + '</b>thời gian</div><div class="metric"><b>' + a.words + '</b>số từ</div><div class="metric"><b>' + (a.dur >= 10 && pace ? pace : '–') + '</b>từ mỗi phút</div></div>' +
      '<div class="card"><h3>Em đã nói về những ngăn ý nào?</h3>' + L.ngan.map(function (g, i) {
        return '<label class="chk ' + (cov[i] >= 2 ? 'auto-ok' : '') + '"><input type="checkbox" data-chg="check" data-i="' + i + '" ' + (ctx.check[i] ? 'checked' : '') + '><span class="lbl"><b style="color:' + gc(i) + '">' + (i + 1) + '.</b> ' + esc(g.name) + '</span></label>';
      }).join('') + '<p class="muted small mt">Em tự tick theo trí nhớ của mình. Dấu "máy nghe thấy" chỉ là gợi ý.</p></div>' +
      '<div class="card mt"><h3>Hỏi bản thân như người dạy học</h3>' +
      '<p>1. Có chỗ nào em im lặng lâu không?</p><div class="row"><label class="chip"><input type="radio" name="sil" data-chg="sil" value="yes" ' + (ctx.reflect.silence === 'yes' ? 'checked' : '') + '> Có</label><label class="chip"><input type="radio" name="sil" data-chg="sil" value="no" ' + (ctx.reflect.silence === 'no' ? 'checked' : '') + '> Không</label></div>' +
      '<p class="mt">2. Lần hai, em muốn làm tốt hơn điều gì? (chạm để chọn)</p><div class="col">' + PLANS.map(function (t, k) { return '<label class="chk"><input type="checkbox" data-chg="plan" data-i="' + k + '" ' + (ctx.reflect.plan[k] ? 'checked' : '') + '><span class="lbl">' + esc(t) + '</span></label>'; }).join('') + '</div></div>' +
      '<div class="row mt"><button class="btn big" data-act="step" data-n="5">Xem bài mẫu →</button></div>');
  }

  /* ----- Bài mẫu ----- */
  function stepSample() {
    var L = ctx.L, sm = L.sample, tts = S.settings().tts && Sp.hasVoice(), vs = sampleVariants(L), cv = curVariant();
    var tabs = vs.length > 1 ? '<div class="tabs mb">' + vs.map(function (v) { return '<button class="chip ' + (v.id === cv.id ? 'sel' : '') + '" data-act="stab" data-id="' + esc(v.id) + '">' + esc(v.label) + '</button>'; }).join('') + '</div>' : '';
    var intro = cv.id === 'alt' ?
      '<div class="card warn mb">✨ <b>Góc nhìn mới: ' + esc(cv.angle) + '.</b> Vẫn đủ các ngăn ý như bài cơ bản, nhưng nhìn sự vật theo một cách khác. Em đọc rồi thử đặt mình vào góc nhìn đó nhé!</div>' :
      (cv.custom ? '<div class="card soft mb">👪 Ví dụ do cha mẹ thêm cho bài này.</div>' :
        '<p>Đây là một bài mẫu. Mỗi đoạn là một ngăn ý, tô màu giống ở phần gợi ý. Em đọc để học cách nói, từ hay và kiến thức mới. <b>Không cần giống y hệt</b>, bài của em cũng rất đáng quý.</p>');
    var vocab = sm.vocab.concat(cv.id === 'alt' ? (cv.vocab || []) : []);
    lessonFrame(tabs + intro +
      cv.paras.map(function (p, i) {
        return '<div class="sample" style="--c:' + gc(i) + '"><div class="lab">' + (L.ngan[i] ? 'Ngăn ' + (i + 1) + ': ' + esc(L.ngan[i].name) : 'Đoạn ' + (i + 1)) + '</div><p>' + esc(p) + '</p>' +
          '<div class="row">' + (tts ? '<button class="btn alt sm" data-act="tts" data-i="' + i + '">🔊 Nghe đọc</button>' : '') +
          (Sp.supported ? '<button class="btn alt sm" data-act="readstart" data-i="' + i + '">🎤 Đọc to đoạn này</button>' : '') + '</div><div id="read-' + i + '"></div></div>';
      }).join('') +
      (cv.id === 'alt' && cv.why ? '<div class="card ok mb">💡 <b>Vì sao cách này hay?</b> ' + esc(cv.why) + '</div>' : '') +
      '<h3 class="mt">Từ hay cần nhớ</h3><div class="col">' + vocab.map(function (v) {
        return '<label class="vcard"><input type="checkbox" data-chg="vocab" data-w="' + esc(v.w) + '" ' + (ctx.vocab[v.w] ? 'checked' : '') + '> <b>' + esc(v.w) + '</b>: ' + esc(v.m) + '<br><span class="muted">Ví dụ: ' + esc(v.ex) + '</span></label>';
      }).join('') + '</div><p class="muted small">Từ được tick sẽ được thêm vào Sổ từ khi em xong bài.</p>' +
      '<h3 class="mt">Em biết thêm</h3><div class="card soft"><ul style="margin:0;padding-left:20px">' + sm.more.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<h3 class="mt">Mẹo nói</h3><div class="card warn">' + esc(sm.tip) + '</div>' +
      (L.pron && L.pron.length ? '<h3 class="mt">Luyện đọc những từ dễ nhầm</h3><div class="kws">' + L.pron.map(function (w) { return '<span class="kw" ' + (tts ? 'style="cursor:pointer" data-act="ttsword" data-w="' + esc(w) + '"' : '') + '>' + (tts ? '🔊 ' : '') + esc(w) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="row mt"><button class="btn big" data-act="step" data-n="6">Em sẽ nói lại →</button></div>');
  }
  function readStart(i) {
    if (!Sp.supported) return toast('Máy này chưa hỗ trợ nhận dạng giọng nói. Hãy dùng Chrome.');
    if (reader && reader.session && reader.session.isActive()) return;
    var box = document.getElementById('read-' + i);
    var sess = Sp.createSession({ recordAudio: false, onError: function (c) { if (c === 'not-allowed') box.innerHTML = '<p style="color:#b9332d">Chrome chưa cho dùng micro.</p>'; if (c === 'network') box.innerHTML = '<p style="color:#b9332d">Cần có mạng để nhận dạng giọng nói.</p>'; } });
    reader = { i: i, session: sess };
    sess.start();
    box.innerHTML = '<div class="card soft mt"><span class="rec-dot"></span>Đang nghe em đọc… Đọc chậm, rõ từng chữ rồi bấm "Xong".<div class="mt"><button class="btn red sm" data-act="readstop" data-i="' + i + '">⏹️ Xong</button></div></div>';
  }
  function readStop(i) {
    if (!reader || !reader.session) return;
    var sess = reader.session, box = document.getElementById('read-' + i);
    box.innerHTML = '<p class="muted">Đang xử lý…</p>';
    sess.stop().then(function (res) {
      var cmp = Sp.compare(curVariant().paras[i], res.text);
      if (!res.text) { box.innerHTML = '<div class="card warn mt">Máy chưa nghe được gì. Em thử lại, đọc to hơn một chút nhé.</div>'; return; }
      ctx.readDone = true;
      var tts = S.settings().tts && Sp.hasVoice();
      box.innerHTML = '<div class="card soft mt"><b>Máy nghe khớp ' + cmp.ok + '/' + cmp.total + ' từ.</b><div class="cmp mt" style="line-height:2">' + cmp.words.map(function (w) {
        var cls = w.s, extra = (w.s === 'diff' || w.s === 'tone') ? ' title="Máy nghe thành: ' + esc(w.heard) + '"' : '';
        return '<span class="' + cls + '"' + extra + (tts && cls !== 'ok' ? ' data-act="ttsword" data-w="' + esc(w.w) + '"' : '') + '>' + esc(w.w) + '</span>';
      }).join(' ') + '</div><p class="muted small mt">Từ tô vàng: máy nghe thành từ khác, em nghe lại và đọc rõ hơn nhé. Từ gạch đỏ: máy chưa nghe thấy. Máy nghe không hoàn hảo nên đây chỉ là gợi ý, không phải chấm điểm. Bấm vào từ vàng để nghe đọc mẫu (nếu máy có giọng tiếng Việt).</p>' +
        '<button class="btn alt sm" data-act="readstart" data-i="' + i + '">🔁 Đọc lại</button></div>';
    });
  }

  /* ----- Thưởng ----- */
  function stepDone() {
    var P = profile(), L = ctx.L, R = [];
    if (!ctx.finished) {
      ctx.finished = true;
      var prev = P.progress[L.id], repeat = prev && prev.done, a0 = ctx.att[0], a1 = ctx.att[1], total = 0;
      if (repeat) { R.push(['Luyện lại bài cũ', 2]); total = 2; }
      else {
        R.push(['Hoàn thành ' + STEPS.length + ' bước', 3]);
        var c0 = a0 ? coverage(a0.text).filter(function (x) { return x >= 2; }).length : 0, c1 = a1 ? coverage(a1.text).filter(function (x) { return x >= 2; }).length : 0;
        if (a1 && a0 && (a1.dur > a0.dur || c1 > c0)) R.push(['Nói lần 2 dài hơn hoặc đủ ngăn hơn', 2]);
        if (ctx.readDone) R.push(['Đọc to bài mẫu', 1]);
        var alltext = Sp.norm((a1 && a1.text) || ''), used = allVocab(L).filter(function (v) { return alltext.indexOf(Sp.norm(v.w)) >= 0; }).length;
        if (used) R.push(['Dùng từ mới (' + Math.min(used, 3) + ' từ)', Math.min(used, 3)]);
        if (!ctx.helped) R.push(['Tự lực (không mở thêm gợi ý)', 1]);
        if (L.challenge) {
          R.push(['Hoàn thành Thử thách', 5]);
          P.badges = P.badges || []; var bid = 'ch-' + L.level + '-' + L.chang;
          if (P.badges.indexOf(bid) < 0) { P.badges.push(bid); ctx.newBadge = D.badges[L.chang - 1]; }
          if (L.chang < 4) ctx.unlockedChang = L.chang + 1;
        }
        total = R.reduce(function (s, r) { return s + r[1]; }, 0);
      }
      var wk = S.weekKey(), arr = P.stamps[wk] || (P.stamps[wk] = []); arr.push(S.dayStr());
      var weekly = false; if (arr.length >= 3 && !P.weekBonus[wk]) { P.weekBonus[wk] = true; weekly = true; R.push(['Đủ 3 buổi trong tuần (tem tuần)', 3]); total += 3; }
      var comeback = P.lastDone && (Date.now() - P.lastDone) > 7 * 864e5;
      var longer = a1 && a0 && a1.dur - a0.dur > 4, usedAny = R.some(function (r) { return r[0].indexOf('Dùng từ mới') === 0; });
      var cat = repeat ? 'repeat' : (L.challenge ? 'challenge' : weekly ? 'weekly' : (comeback ? 'comeback' : (longer ? 'longer' : (usedAny ? 'vocab' : (a1 ? 'steady' : 'complete')))));
      ctx.msg = pick(D.encourage[cat]).replace(/\{name\}/g, P.name).replace(/\{sec\}/g, a1 && a0 ? Math.abs(a1.dur - a0.dur) : 0);
      ctx.total = total; ctx.R = R;
      var ts = Date.now(), atts = [];
      [a0, a1].forEach(function (a, i) {
        if (!a) return; var key = null;
        if (a.audio) { key = P.id + '|' + L.id + '|' + (i + 1) + '|' + ts; S.audio.put(key, a.audio); S.audio.register(key); }
        atts.push({ n: i + 1, dur: a.dur, words: a.words, text: a.text, key: key });
      });
      var hist = prev && prev.done ? (prev.history || []).concat([{ t: prev.doneAt, helped: prev.helped, hint: prev.hint, R: prev.R, attempts: prev.attempts, reflect: prev.reflect, check: prev.check }]).slice(-5) : [];
      P.progress[L.id] = { done: true, doneAt: ts, helped: ctx.helped, hint: ctx.level, stars: (repeat && prev ? (prev.stars || 0) : 0) + total, attempts: atts, reflect: ctx.reflect, check: ctx.check, R: ctx.R, history: hist };
      P.stars += total; P.lastDone = ts;
      var added = [];
      allVocab(L).forEach(function (v) {
        if (ctx.vocab[v.w] && !P.vocab.some(function (x) { return x.w === v.w; })) { P.vocab.push({ w: v.w, m: v.m, ex: v.ex, lesson: L.id, title: L.title, added: ts }); added.push(v.w); }
      });
      ctx.added = added; P.progress[L.id].added = added; S.save();
    }
    var eq = P.equipped || {};
    lessonFrame('<div class="card center"><div class="row" style="justify-content:center">' + M.render(eq, { size: 'lg' }) + '</div>' +
      '<h1>Chúc mừng ' + esc(P.name) + '!</h1><div class="stars-big">+' + ctx.total + ' ⭐</div><p style="font-size:1.1em">' + esc(ctx.msg) + '</p>' +
      '<div class="card soft" style="text-align:left"><b>Em nhận sao vì:</b><div class="kv mt">' + ctx.R.map(function (r) { return '<span>' + esc(r[0]) + '</span><b>+' + r[1] + '</b>'; }).join('') + '</div></div>' +
      (ctx.newBadge ? '<div class="card ok mt">🏅 <b>Em nhận được ' + esc(ctx.newBadge) + '!</b></div>' : '') +
      (ctx.unlockedChang ? '<div class="card ok mt">🔓 <b>Chặng ' + ctx.unlockedChang + ' đã mở!</b> Hẹn em ở bài mới nhé.</div>' : (L.challenge && L.chang === 4 && ctx.newBadge ? '<div class="card ok mt">🎉 Em đã đi hết cả lộ trình 4 chặng. Em có thể luyện lại các bài cũ hoặc nói tự do.</div>' : '')) +
      (ctx.added && ctx.added.length ? '<p class="mt">📒 Từ mới vào Sổ từ: <b>' + ctx.added.map(esc).join(', ') + '</b></p>' : '') +
      '<p class="muted">Tổng số sao của em: <b>' + P.stars + '</b> ⭐</p>' +
      '<div class="row" style="justify-content:center"><button class="btn big" data-act="nav" data-to="/">Về trang chủ</button><button class="btn alt" data-act="nav" data-to="/shop">🛍️ Mua đồ cho Vẹt con</button><button class="btn alt" data-act="again">🔁 Luyện lại bài này</button></div></div>');
    confetti((eq.fx === 'fx-confetti') ? 90 : 28);
  }
  function confetti(n) {
    var box = document.createElement('div'); box.className = 'confetti'; var cols = ['#ff7a59', '#4c8dff', '#2fb67c', '#ffc83d', '#e8508a', '#a56bff'], h = '';
    for (var i = 0; i < n; i++) h += '<i style="left:' + Math.random() * 100 + '%;background:' + pick(cols) + ';animation-duration:' + (2 + Math.random() * 2.5) + 's;animation-delay:' + Math.random() * .8 + 's"></i>';
    box.innerHTML = h; document.body.appendChild(box); setTimeout(function () { box.remove(); }, 5500);
  }

  /* ---------- Nói tự do ---------- */
  var FREE_IDEAS = {
    vat: 'ví dụ: cái cặp, con mèo, quả cam, chiếc xe đạp…',
    noi: 'ví dụ: phòng của em, sân trường, công viên, quán ăn…',
    hien: 'ví dụ: mưa, gió, cầu vồng, ngày nắng…',
    viec: 'ví dụ: một buổi đi chơi, một lần giúp mẹ nấu cơm, một trận bóng…'
  };
  function viewFree(kind) {
    var P = profile(); if (!D.kinds[kind]) kind = 'vat';
    var frames = window.MMI_FREE(P.level, kind), today = S.dayStr(), f = P.free || {};
    var left = Math.max(0, 3 - (f.day === today ? f.count : 0)), maxT = P.level === 'th' ? 180 : 300;
    ctx = { free: true, kind: kind, att: [null, null], L: { title: 'Nói tự do', target: { min: 30, max: maxT }, ngan: frames.map(function (g) { return { name: g.name, kw: g.kw }; }) } };
    var warn = '';
    if (!Sp.supported) warn += '<div class="card warn mb"><b>Trình duyệt này chưa chuyển được giọng nói thành chữ.</b> Em vẫn nói được, app vẫn tính thời gian em nói. Để dùng đầy đủ, hãy mở bằng Chrome trên máy tính.</div>';
    var body;
    if (!S.settings().consent) body = consentCard(0);
    else body = '<div class="card center"><div class="row" style="justify-content:center">' + M.render(P.equipped, { size: 'md', talk: false }) + '</div>' +
      '<div class="timer"><div class="ring">' + ringSVG(0, false) + '<div class="t" id="clock">0:00</div><div class="sub" id="clockSub">Nói ít nhất 30 giây</div></div></div>' +
      '<div class="ngan-list">' + frames.map(function (g, i) { return '<span class="ngan-pill" style="--c:' + gc(i) + '">' + (i + 1) + '. ' + esc(g.name) + '</span>'; }).join('') + '</div>' +
      '<div id="status" class="muted" style="min-height:28px">Chọn một ' + esc(D.kinds[kind].toLowerCase()) + ' em thích, rồi bấm nút và nói theo các ngăn ý ở trên.</div>' +
      '<div id="speakBtns"><button class="btn big" data-act="speakstart" data-n="0">🎙️ Bắt đầu nói</button></div></div><div id="speakResult"></div>';
    render(topbar(P, '/') + '<h1>🗣️ Nói tự do</h1>' +
      '<p class="muted">Không có bài mẫu và không có gợi ý chi tiết. Em tự chọn một chủ đề và nói về nó thật lâu bằng các ngăn ý bên dưới. Nói được ít nhất 30 giây sẽ nhận <b>+2 ⭐</b> (tối đa 3 lần mỗi ngày; hôm nay còn <b>' + left + '</b> lần).</p>' +
      '<div class="tabs">' + Object.keys(D.kinds).map(function (k) { return '<button class="chip ' + (k === kind ? 'sel' : '') + '" data-act="nav" data-to="/free/' + k + '">' + D.kindIcon[k] + ' ' + esc(D.kinds[k]) + '</button>'; }).join('') + '</div>' +
      '<p class="muted small">' + esc(FREE_IDEAS[kind]) + '</p>' + warn + body);
  }
  function showFreeResult() {
    var P = profile(), a = ctx.att[0], el = document.getElementById('speakResult'); if (!el) return;
    document.getElementById('status').textContent = 'Em đã nói xong!';
    var today = S.dayStr(), f = P.free || (P.free = { day: today, count: 0, total: 0 });
    if (f.day !== today) { f.day = today; f.count = 0; }
    var gain = 0;
    if (a.dur >= 30 && f.count < 3) { gain = 2; f.count++; f.total = (f.total || 0) + 1; P.stars += gain; P.lastDone = Date.now(); S.save(); var sc = document.getElementById('starCount'); if (sc) sc.textContent = P.stars; }
    var pace = a.dur > 0 ? Math.round(a.words * 60 / a.dur) : 0, cov = coverage(a.text).filter(function (x) { return x >= 1; }).length;
    var url = ''; if (a.audio) { url = URL.createObjectURL(a.audio); urls.push(url); }
    var fkey = null, fts = Date.now();
    if (a.audio) { fkey = P.id + '|free|' + fts; S.audio.put(fkey, a.audio); S.audio.register(fkey); }
    P.freeLog = (P.freeLog || []); P.freeLog.push({ t: fts, kind: ctx.kind, dur: a.dur, words: a.words, text: (a.text || '').slice(0, 6000), key: fkey, stars: gain });
    if (P.freeLog.length > 200) P.freeLog = P.freeLog.slice(-200);
    S.save();
    var msg = a.dur < 30 ? 'Lần này hơi ngắn, em thử nói thêm một ngăn ý nữa nhé. Em đã dám nói, thế là đáng khen rồi!' : pick(D.encourage.free).replace(/\{name\}/g, P.name);
    var note = a.dur < 30 ? '' : (gain ? '<div class="stars-big">+' + gain + ' ⭐</div>' : '<p class="muted">Hôm nay em đã nhận đủ sao cho phần Nói tự do. Em vẫn có thể luyện thêm nhé!</p>');
    el.innerHTML = '<div class="card mt center">' + note + '<p style="font-size:1.1em">' + esc(msg) + '</p><div class="metrics"><div class="metric"><b>' + mmss(a.dur) + '</b>thời gian</div><div class="metric"><b>' + a.words + '</b>số từ</div><div class="metric"><b>' + (a.dur >= 10 && pace ? pace : '–') + '</b>từ mỗi phút</div><div class="metric"><b>' + cov + '/' + ctx.L.ngan.length + '</b>ngăn nghe thấy</div></div>' +
      (url ? '<div class="card soft mt" style="text-align:left"><b>🔊 Nghe lại lời em nói</b><br><audio controls src="' + url + '" style="width:100%;margin-top:6px"></audio></div>' : '') +
      (!a.text ? '<div class="card warn mt" style="text-align:left"><b>Máy chưa nghe được chữ nào.</b> Không sao, app vẫn tính thời gian em nói.</div>' : '') +
      '<div class="row mt" style="justify-content:center"><button class="btn alt" data-act="freeretry">🔁 Nói tiếp chủ đề khác</button><button class="btn big" data-act="nav" data-to="/">Về trang chủ</button></div></div>';
    var cl = document.getElementById('clock'); if (cl) cl.textContent = mmss(a.dur);
  }

  /* ---------- Cửa hàng ---------- */
  function viewShop(type) {
    var P = profile(), items = D.shop.filter(function (x) { return x.type === type; });
    render(topbar(P, '/') + '<h1>🛍️ Cửa hàng của Vẹt con</h1><div class="row mb">' + M.render(P.equipped, { size: 'md' }) + '<div><p class="muted">Dùng sao em kiếm được để mua đồ cho Vẹt con và căn phòng.</p><p>Em đang có: <b>⭐ ' + P.stars + '</b></p></div></div>' +
      '<div class="tabs">' + Object.keys(D.shopTypes).map(function (k) { return '<button class="chip ' + (k === type ? 'sel' : '') + '" data-act="nav" data-to="/shop/' + k + '">' + D.shopTypes[k] + '</button>'; }).join('') + '</div>' +
      '<div class="shop-grid">' + items.map(function (it) {
        var owned = P.owned.indexOf(it.id) >= 0, eq = P.equipped[it.type] === it.id, prev = {}; prev[it.type] = it.id;
        return '<div class="shop-item ' + (eq ? 'eq' : '') + '">' + M.render(prev, { size: 'sm' }) + '<div><b>' + esc(it.name) + '</b></div>' +
          (owned ? '<button class="btn sm ' + (eq ? 'alt' : 'green') + ' mt" data-act="equip" data-id="' + it.id + '">' + (eq ? 'Đang dùng · Bỏ ra' : 'Dùng') + '</button>' :
            '<button class="btn sm mt" data-act="buy" data-id="' + it.id + '" ' + (P.stars < it.price ? 'disabled' : '') + '>⭐ ' + it.price + ' · Mua</button>') + '</div>';
      }).join('') + '</div>');
  }

  /* ---------- Sổ tay ---------- */
  function viewBook(tab) {
    var P = profile(), body = '';
    if (tab === 'vocab') {
      body = P.vocab.length ? '<div class="col">' + P.vocab.slice().reverse().map(function (v) { return '<div class="vcard">' + (S.settings().tts && Sp.hasVoice() ? '<button class="btn alt sm" style="float:right" data-act="ttsword" data-w="' + esc(v.w) + '" aria-label="Nghe đọc từ ' + esc(v.w) + '">🔊</button>' : '') + '<b>' + esc(v.w) + '</b>: ' + esc(v.m) + '<br><span class="muted">Ví dụ: ' + esc(v.ex) + ' · từ bài "' + esc(v.title) + '"</span></div>'; }).join('') + '</div>' : '<div class="card soft">Chưa có từ nào. Hoàn thành một bài, từ mới sẽ vào đây!</div>';
    } else {
      var ids = Object.keys(P.progress).sort(function (a, b) { return (P.progress[b].doneAt || 0) - (P.progress[a].doneAt || 0); });
      body = ids.length ? ids.map(function (id) {
        var pr = P.progress[id], L = findLesson(id); if (!L) return '';
        return '<div class="card soft mb"><div class="row between"><b>' + esc(L.title) + '</b><span class="muted small">' + dateVN(pr.doneAt) + ' · +' + (pr.stars || 0) + '⭐</span></div>' +
          pr.attempts.map(function (a) { return '<div class="row mt"><span class="badge">Lần ' + a.n + ': ' + mmss(a.dur) + ' · ' + a.words + ' từ</span>' + (a.key ? '<button class="btn alt sm" data-act="playclip" data-key="' + esc(a.key) + '">▶ Nghe lại</button>' : '') + '<span class="clip"></span></div>'; }).join('') +
          '</div>';
      }).join('') : '<div class="card soft">Chưa có bài nào trong nhật ký.</div>';
    }
    render(topbar(P, '/') + '<h1>📒 Sổ tay</h1><div class="tabs"><button class="chip ' + (tab === 'vocab' ? 'sel' : '') + '" data-act="nav" data-to="/book/vocab">Sổ từ (' + P.vocab.length + ')</button><button class="chip ' + (tab === 'diary' ? 'sel' : '') + '" data-act="nav" data-to="/book/diary">Nhật ký luyện nói</button></div>' + body);
  }

  /* ---------- Cài đặt ---------- */
  function viewSettings() {
    var P = profile(), st = S.settings();
    render(topbar(P, '/') + '<h1>⚙️ Cài đặt</h1>' +
      '<div class="card mb"><h3>Hồ sơ: ' + esc(P.name) + ' · ' + esc(levelLabel(P)) + '</h3><div class="row"><button class="btn alt sm" data-act="nav" data-to="/profiles">Đổi bạn / thêm hồ sơ</button></div></div>' +
      '<div class="card mb"><h3>Tùy chọn</h3>' + (Sp.isMobile ? '<p class="muted small">Trên điện thoại, MM-iTalk tắt ghi âm để máy chuyển được lời nói thành chữ (hai việc này tranh nhau micro). Trên máy tính, em vẫn nghe lại được.</p>' : '<label class="chk"><input type="checkbox" data-chg="setrec" ' + (st.recAudio ? 'checked' : '') + '><span>Ghi âm để nghe lại (lưu trong máy)</span></label>') + '<label class="chk"><input type="checkbox" data-chg="settts" ' + (st.tts ? 'checked' : '') + '><span>Bật giọng đọc mẫu (nếu máy có giọng tiếng Việt)</span></label></div>' +
      '<div class="card mb"><h3>Dành cho cha mẹ</h3><p class="muted">Báo cáo học tập, xem lại bài của con, mở khóa chặng, sao lưu và xóa hồ sơ nằm trong Khu cha mẹ (cần mật khẩu).</p><button class="btn alt sm" data-act="nav" data-to="/parent">🔒 Vào Khu cha mẹ</button></div>' +
      '<div class="card mb"><h3>Kiểm tra micro</h3><p class="muted">Thử ghi âm và nhận dạng giọng nói trước khi học.</p><a class="btn alt sm" href="test-mic.html">🎤 Mở trang thử micro</a></div>' +
      (deferredInstall ? '<div class="card mb"><h3>Cài ứng dụng</h3><button class="btn sm" data-act="install">📲 Cài MM-iTalk lên máy</button></div>' : '<div class="card mb"><h3>Cài ứng dụng</h3><p class="muted">Trên Chrome, bấm biểu tượng cài đặt ở thanh địa chỉ hoặc menu ⋮ → "Cài đặt MM-iTalk" (trên Android: "Thêm vào màn hình chính").</p></div>') +
      '<p class="muted small">MM-iTalk phiên bản ' + esc(D.version) + ' · bản chạy thử</p>' + (S.memoryOnly() ? '<div class="card warn">Trình duyệt đang chặn lưu dữ liệu.</div>' : ''));
  }

  /* ---------- Sự kiện ---------- */
  var chgs = {};
  var acts = {
    nav: function (el) { nav(el.getAttribute('data-to')); },
    pickprofile: function (el) { S.setActive(el.getAttribute('data-id')); nav('/'); },
    addprofile: function () {
      var name = document.getElementById('pName').value.trim(); if (!name) return toast('Em nhập tên của em nhé!');
      S.addProfile(name, document.getElementById('pLevel').value, parseInt(document.getElementById('pGrade').value, 10)); nav('/guide/0');
    },
    guidedone: function () { var P = profile(); P.seenGuide = true; S.save(); nav('/'); },
    step: function (el) { goStep(parseInt(el.getAttribute('data-n'), 10)); },
    help: function () { ctx.level = Math.max(1, ctx.level - 1); ctx.helped = true; stepHint(); },
    prep: function (el) { var i = el.getAttribute('data-i'); ctx.prepped[i] = !ctx.prepped[i]; stepPrep(); },
    prepstart: function (el) {
      if (prepTick) { clearInterval(prepTick); prepTick = null; el.textContent = '⏱️ Nháp 2 phút (không bắt buộc)'; return; }
      var left = 120; el.textContent = '⏹️ Dừng nháp';
      prepTick = setInterval(function () { left--; var c = document.getElementById('prepClock'); if (!c) return; c.textContent = mmss(left); if (left <= 0) { clearInterval(prepTick); prepTick = null; toast('Hết giờ nháp rồi. Em sẵn sàng chưa?'); el.textContent = '⏱️ Nháp lại'; } }, 1000);
    },
    consent: function (el) { S.settings().consent = true; S.save(); if (ctx && ctx.free) return viewFree(ctx.kind); stepSpeak(parseInt(el.getAttribute('data-n'), 10)); },
    freeretry: function () { viewFree(ctx.kind); },
    speakstart: function (el) { startSpeaking(parseInt(el.getAttribute('data-n'), 10)); },
    speakstop: function (el) { stopSpeaking(parseInt(el.getAttribute('data-n'), 10)); },
    retry: function (el) { ctx.att[parseInt(el.getAttribute('data-n'), 10)] = null; stepSpeak(parseInt(el.getAttribute('data-n'), 10)); },
    tts: function (el) { Sp.speak(curVariant().paras[parseInt(el.getAttribute('data-i'), 10)]); },
    stab: function (el) { ctx.sampleTab = el.getAttribute('data-id'); stepSample(); },
    ttsword: function (el) { Sp.speak(el.getAttribute('data-w')); },
    readstart: function (el) { readStart(parseInt(el.getAttribute('data-i'), 10)); },
    readstop: function (el) { readStop(parseInt(el.getAttribute('data-i'), 10)); },
    again: function () { nav('/lesson/' + ctx.L.id); },
    buy: function (el) {
      var P = profile(), it = D.shop.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!it || P.stars < it.price) return;
      P.stars -= it.price; P.owned.push(it.id); P.equipped[it.type] = it.id; S.save(); toast('Đã mua "' + it.name + '"!'); viewShop(it.type);
    },
    equip: function (el) {
      var P = profile(), it = D.shop.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
      if (P.equipped[it.type] === it.id) delete P.equipped[it.type]; else P.equipped[it.type] = it.id; S.save(); viewShop(it.type);
    },
    playclip: function (el) {
      S.audio.get(el.getAttribute('data-key')).then(function (blob) {
        if (!blob) return toast('Không còn bản ghi âm này (app chỉ giữ ' + S.audio.MAX + ' bản gần nhất).');
        var u = URL.createObjectURL(blob); urls.push(u);
        var holder = el.parentNode.querySelector('.clip'); holder.innerHTML = '<audio controls autoplay src="' + u + '"></audio>';
      });
    },
    backup: function () {
      var blob = new Blob([S.exportJSON()], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'MM-iTalk-saoluu-' + S.dayStr() + '.json'; document.body.appendChild(a); a.click(); a.remove();
    },
    install: function () { if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; } }
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el || !app.contains(el)) return;
    var f = acts[el.getAttribute('data-act')]; if (f) { e.preventDefault(); f(el); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, k = el.getAttribute && el.getAttribute('data-chg'); if (!k) return;
    if (chgs[k]) return chgs[k](el);
    if (k === 'check') ctx.check[parseInt(el.getAttribute('data-i'), 10)] = el.checked;
    else if (k === 'sil') ctx.reflect.silence = el.value;
    else if (k === 'plan') ctx.reflect.plan[parseInt(el.getAttribute('data-i'), 10)] = el.checked;
    else if (k === 'vocab') ctx.vocab[el.getAttribute('data-w')] = el.checked;
    else if (k === 'setrec') { S.settings().recAudio = el.checked; S.save(); }
    else if (k === 'settts') { S.settings().tts = el.checked; S.save(); }
    else if (k === 'restore') {
      var f = el.files && el.files[0]; if (!f) return;
      var r = new FileReader(); r.onload = function () { try { S.importJSON(String(r.result)); toast('Đã khôi phục dữ liệu.'); nav('/profiles'); } catch (er) { toast(er.message || 'Không đọc được tệp.'); } };
      r.readAsText(f);
    }
  });
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  if (window.MMIParent) window.MMIParent.init({
    esc: esc, mmss: mmss, targetLabel: targetLabel, render: render, topbar: topbar, nav: nav, toast: toast,
    findLesson: findLesson, lessonsOf: lessonsOf, levelLabel: levelLabel, PLANS: PLANS, acts: acts, chgs: chgs
  });
  route();
})();
