/* MM-iTalk - Khu cha mẹ: mật khẩu, báo cáo tổng quan, xem lại từng bài, đánh giá tiến bộ.
   Dữ liệu vẫn nằm trong máy; mật khẩu chỉ chặn trẻ vào nhầm, không phải bảo mật cao. */
(function () {
  'use strict';
  var A = null; // api do app.js đưa vào
  var D = window.MMI_DATA, S = window.MMIStore, Sp = window.MMISpeech;
  var pAuth = { ok: false, t: 0 }, pSel = null, IDLE = 10 * 60 * 1000;

  /* ---------- tiện ích ---------- */
  function esc(s) { return A.esc(s); }
  function mmss(x) { return A.mmss(x); }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function hasCrypto() { return !!(window.crypto && window.crypto.subtle && window.TextEncoder); }
  function toB64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function fromB64(b) { var s = atob(b), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function newSalt() { return toB64(crypto.getRandomValues(new Uint8Array(16))); }
  function kdf(text, saltB64) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(text), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromB64(saltB64), iterations: 150000, hash: 'SHA-256' }, k, 256);
    }).then(toB64);
  }
  var CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function newCode() {
    var r = crypto.getRandomValues(new Uint8Array(8)), s = '';
    for (var i = 0; i < 8; i++) s += CODE_CHARS[r[i] % CODE_CHARS.length];
    return s;
  }
  function normCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function fmtCode(c) { return c.slice(0, 4) + '-' + c.slice(4); }
  function pstate() { return S.get().parent || null; }
  function live() {
    if (pAuth.ok && Date.now() - pAuth.t > IDLE) pAuth.ok = false;
    if (pAuth.ok) pAuth.t = Date.now();
    return pAuth.ok;
  }
  function lock() { pAuth.ok = false; pAuth.t = 0; }
  function sel() {
    var ps = S.profiles(), P = null, i;
    for (i = 0; i < ps.length; i++) if (ps[i].id === pSel) P = ps[i];
    if (!P) P = S.profile() || ps[0] || null;
    pSel = P ? P.id : null; return P;
  }
  function fmtDur(sec) {
    sec = Math.round(sec || 0);
    if (sec < 60) return sec + ' giây';
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return h ? h + ' giờ ' + m + ' phút' : m + ' phút ' + (sec % 60) + ' giây';
  }
  function dt(ts) { var d = new Date(ts); return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function dtm(ts) { var d = new Date(ts); return dt(ts) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function covOf(text, ngan) {
    var t = ' ' + Sp.norm(text || '') + ' ';
    return ngan.map(function (g) {
      var hits = 0; g.kw.forEach(function (k) { var nk = Sp.norm(k); if (t.indexOf(' ' + nk + ' ') >= 0 || t.indexOf(nk) >= 0) hits++; });
      return hits;
    });
  }
  function covCount(text, ngan) { return covOf(text, ngan).filter(function (x) { return x >= 2; }).length; }
  function wpm(a) { return a && a.dur >= 10 ? Math.round(a.words * 60 / a.dur) : 0; }

  /* ---------- gom dữ liệu ---------- */
  /* Mỗi lần học xong một bài (kể cả luyện lại) là một "buổi". */
  function sessions(P) {
    var out = [];
    Object.keys(P.progress || {}).forEach(function (id) {
      var pr = P.progress[id], L = A.findLesson(id); if (!pr || !pr.done || !L) return;
      (pr.history || []).forEach(function (h) { out.push(mk(L, h.t, h, false)); });
      out.push(mk(L, pr.doneAt, pr, true));
    });
    out.sort(function (a, b) { return a.t - b.t; });
    return out;
    function mk(L, t, o, latest) {
      var at = o.attempts || [], a0 = null, a1 = null;
      at.forEach(function (x) { if (x.n === 1) a0 = x; if (x.n === 2) a1 = x; });
      var best = a1 || a0, c0 = a0 && a0.text ? covCount(a0.text, L.ngan) : null, c1 = a1 && a1.text ? covCount(a1.text, L.ngan) : null;
      var improved = !!(a0 && a1 && (a1.dur > a0.dur || (c0 != null && c1 != null && c1 > c0)));
      return { L: L, t: t, a0: a0, a1: a1, best: best, c0: c0, c1: c1, improved: improved, helped: !!o.helped, hint: o.hint, R: o.R, latest: latest, raw: o };
    }
  }
  function allFree(P) { return (P.freeLog || []).slice(); }

  /* ---------- khung chung ---------- */
  var TABS = [['overview', 'Tổng quan'], ['lessons', 'Từng bài'], ['progress', 'Tiến bộ'], ['samples', 'Ví dụ của cha mẹ'], ['ai', 'Nhận xét AI'], ['settings', 'Cài đặt cha mẹ']];
  function frame(tab, inner) {
    var P = sel(), ps = S.profiles();
    var chooser = ps.length > 1 ? '<label class="chip">Con: <select data-chg="psel" style="border:0;background:transparent;font:inherit;font-weight:700">' + ps.map(function (p) { return '<option value="' + esc(p.id) + '" ' + (P && p.id === P.id ? 'selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></label>' : (P ? '<span class="chip">Con: ' + esc(P.name) + '</span>' : '');
    A.render(A.topbar(null, '/') + '<div class="row between mb"><h1 style="margin:0">🔒 Khu cha mẹ</h1><div class="row">' + chooser + '<button class="btn alt sm" data-act="plock">🔓 Khóa và thoát</button></div></div>' +
      '<div class="tabs">' + TABS.map(function (t) { return '<button class="chip ' + (t[0] === tab ? 'sel' : '') + '" data-act="nav" data-to="/parent/' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' + inner);
  }
  function gateFrame(inner) { A.render(A.topbar(null, '/') + '<h1>🔒 Khu cha mẹ</h1>' + inner); }

  /* ---------- cổng mật khẩu ---------- */
  function viewGate(msg) {
    if (!hasCrypto()) return gateFrame('<div class="card warn">Khu cha mẹ cần trình duyệt có WebCrypto và chạy trên địa chỉ https (GitHub Pages) hoặc localhost. Trên địa chỉ hiện tại chưa dùng được.</div>');
    var ps = pstate();
    if (!ps) {
      return gateFrame('<div class="card"><h2>Tạo mật khẩu cho cha mẹ</h2><p class="muted">Con không cần mật khẩu. Mật khẩu này chỉ để chặn con vào xem báo cáo và các cài đặt nhạy cảm. Mật khẩu nằm trong máy này, không gửi đi đâu.</p>' +
        (msg ? '<p style="color:#b9332d;font-weight:700">' + esc(msg) + '</p>' : '') +
        '<div class="col" style="max-width:360px"><label>Mật khẩu (từ 6 ký tự)<input id="pw1" type="password" autocomplete="new-password" style="width:100%;padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px"></label>' +
        '<label>Nhập lại mật khẩu<input id="pw2" type="password" autocomplete="new-password" style="width:100%;padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px"></label>' +
        '<button class="btn" data-act="pgsetup">Tạo mật khẩu</button></div></div>');
    }
    var locked = ps.lockUntil && ps.lockUntil > Date.now();
    return gateFrame('<div class="card"><h2>Nhập mật khẩu cha mẹ</h2>' +
      (msg ? '<p style="color:#b9332d;font-weight:700">' + esc(msg) + '</p>' : '') +
      (locked ? '<p style="color:#b9332d">Nhập sai nhiều lần. Hãy thử lại sau ' + Math.ceil((ps.lockUntil - Date.now()) / 1000) + ' giây.</p>' : '') +
      '<div class="col" style="max-width:360px"><input id="pw1" type="password" autocomplete="current-password" placeholder="Mật khẩu" style="width:100%;padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px">' +
      '<button class="btn" data-act="pglogin">Vào</button>' +
      '<button class="btn ghost sm" data-act="pgforgot">Quên mật khẩu? Dùng mã khôi phục</button></div></div>');
  }
  function viewForgot(msg) {
    gateFrame('<div class="card"><h2>Khôi phục mật khẩu</h2><p class="muted">Nhập mã khôi phục 8 ký tự đã ghi lại khi tạo mật khẩu, rồi đặt mật khẩu mới.</p>' +
      (msg ? '<p style="color:#b9332d;font-weight:700">' + esc(msg) + '</p>' : '') +
      '<div class="col" style="max-width:360px"><input id="rc" placeholder="Mã khôi phục (ví dụ ABCD-EFGH)" style="width:100%;padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px;text-transform:uppercase">' +
      '<input id="pw1" type="password" autocomplete="new-password" placeholder="Mật khẩu mới (từ 6 ký tự)" style="width:100%;padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px">' +
      '<button class="btn" data-act="pgrecover">Đặt lại mật khẩu</button><button class="btn ghost sm" data-act="nav" data-to="/parent">← Quay lại</button></div></div>');
  }
  function viewRecoveryCode(code) {
    gateFrame('<div class="card"><h2>Mã khôi phục của bạn</h2><p>Hãy <b>ghi lại mã này và cất nơi an toàn</b>. Mã chỉ hiện một lần. Nếu quên mật khẩu, bạn cần mã này để đặt lại.</p>' +
      '<div class="stars-big" style="letter-spacing:4px;font-size:2.4em;color:var(--ink)">' + esc(fmtCode(code)) + '</div>' +
      '<div class="row mt"><button class="btn" data-act="nav" data-to="/parent/overview">Tôi đã ghi lại mã</button></div></div>');
  }
  function setPassword(pw) {
    var st = S.get(), salt = newSalt(), code = newCode(), rsalt = newSalt();
    return Promise.all([kdf(pw, salt), kdf(code, rsalt)]).then(function (r) {
      st.parent = { salt: salt, hash: r[0], rsalt: rsalt, rhash: r[1], fails: 0, lockUntil: 0 };
      S.save(); return code;
    });
  }

  /* ---------- Tổng quan ---------- */
  function bar(pct, color) { return '<div style="background:#eef1fb;border-radius:999px;height:12px;overflow:hidden"><div style="width:' + Math.max(0, Math.min(100, pct)) + '%;height:100%;background:' + (color || 'var(--green)') + '"></div></div>'; }
  function weekBars(P, ss) {
    var counts = {}, now = new Date(), keys = [], i;
    for (i = 7; i >= 0; i--) { var d = new Date(now); d.setDate(d.getDate() - i * 7); keys.push(S.weekKey(d)); }
    ss.forEach(function (x) { var k = S.weekKey(new Date(x.t)); counts[k] = (counts[k] || 0) + 1; });
    allFree(P).forEach(function (x) { var k = S.weekKey(new Date(x.t)); counts[k] = (counts[k] || 0) + 1; });
    var max = 3; keys.forEach(function (k) { if ((counts[k] || 0) > max) max = counts[k]; });
    var W = 560, H = 130, bw = 40, gap = 20, svg = '<svg viewBox="0 0 ' + W + ' ' + (H + 28) + '" style="width:100%;max-width:600px" role="img" aria-label="Số buổi luyện mỗi tuần">';
    keys.forEach(function (k, idx) {
      var n = counts[k] || 0, h = Math.round(n / max * (H - 20)), x = 10 + idx * (bw + gap);
      svg += '<rect x="' + x + '" y="' + (H - h) + '" width="' + bw + '" height="' + h + '" rx="6" fill="' + (n >= 3 ? '#2fb67c' : '#4c8dff') + '"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (H - h - 4) + '" text-anchor="middle" font-size="13" fill="#2b2a4c">' + (n || '') + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (H + 18) + '" text-anchor="middle" font-size="11" fill="#6b6a86">' + k.slice(8) + '/' + k.slice(5, 7) + '</text>';
    });
    return svg + '</svg>';
  }
  function viewOverview() {
    var P = sel(); if (!P) return frame('overview', '<div class="card soft">Chưa có hồ sơ nào.</div>');
    var ss = sessions(P), free = allFree(P), changs = D.chang[P.level], total = 0;
    var totalSec = 0, words = 0;
    ss.forEach(function (x) { [x.a0, x.a1].forEach(function (a) { if (a) { totalSec += a.dur || 0; words += a.words || 0; } }); });
    free.forEach(function (f) { totalSec += f.dur || 0; words += f.words || 0; });
    var days = {}; ss.forEach(function (x) { days[S.dayStr(new Date(x.t))] = 1; }); free.forEach(function (f) { days[S.dayStr(new Date(f.t))] = 1; });
    var doneCount = Object.keys(P.progress || {}).filter(function (id) { return P.progress[id].done; }).length;
    var wk = (P.stamps[S.weekKey()] || []).length;
    var selfHelp = ss.length ? Math.round(ss.filter(function (x) { return !x.helped; }).length * 100 / ss.length) : 0;
    var chRows = changs.map(function (c) {
      var ls = A.lessonsOf(P.level, c.n), done = ls.filter(function (l) { return P.progress[l.id] && P.progress[l.id].done; }).length, ch = ls.filter(function (l) { return l.challenge; })[0], chDone = ch && P.progress[ch.id] && P.progress[ch.id].done;
      total += ls.length;
      return '<div class="mb"><div class="row between"><b>Chặng ' + c.n + ': ' + esc(c.name) + '</b><span class="muted small">' + done + '/' + ls.length + ' bài' + (chDone ? ' · 🏆 đã xong Thử thách' : '') + '</span></div>' + bar(ls.length ? done * 100 / ls.length : 0, chDone ? 'var(--yellow)' : 'var(--green)') + '</div>';
    }).join('');
    var badges = (P.badges || []).map(function (id) { var n = parseInt(id.split('-')[2], 10); return '<span class="badge g">' + esc(D.badges[n - 1] || id) + '</span>'; }).join(' ') || '<span class="muted">Chưa có</span>';
    frame('overview',
      '<div class="card mb"><h2>Báo cáo chung · ' + esc(P.name) + ' (' + esc(A.levelLabel(P)) + ')</h2>' +
      '<div class="metrics mt"><div class="metric"><b>' + doneCount + '/' + total + '</b>bài đã xong</div><div class="metric"><b>' + ss.length + '</b>buổi luyện</div><div class="metric"><b>' + Object.keys(days).length + '</b>ngày có luyện</div><div class="metric"><b>' + wk + '/3</b>buổi tuần này</div></div>' +
      '<div class="metrics mt"><div class="metric"><b>' + fmtDur(totalSec) + '</b>tổng thời gian nói</div><div class="metric"><b>' + words + '</b>tổng số từ máy nghe được</div><div class="metric"><b>' + P.stars + ' ⭐</b>sao hiện có</div><div class="metric"><b>' + P.vocab.length + '</b>từ trong Sổ từ</div></div>' +
      '<p class="muted small mt">Số từ do máy nhận dạng giọng nói đếm nên chỉ là ước lượng.</p></div>' +
      '<div class="card mb"><h3>Tiến độ theo chặng</h3>' + chRows + '</div>' +
      '<div class="card mb"><h3>Số buổi luyện mỗi tuần (8 tuần gần nhất)</h3>' + weekBars(P, ss) + '<p class="muted small">Cột xanh lá: đủ 3 buổi trong tuần. Cột xanh dương: chưa đủ, không sao cả, duy trì đều đặn là quan trọng.</p></div>' +
      '<div class="card mb"><h3>Khác</h3><div class="kv"><span>Huy hiệu</span><b>' + badges + '</b><span>Nói tự do</span><b>' + free.length + ' lần</b><span>Bài tự lực (không mở thêm gợi ý)</span><b>' + (ss.length ? selfHelp + '%' : '–') + '</b><span>Bắt đầu học</span><b>' + dt(P.created) + '</b></div></div>');
  }

  /* ---------- Từng bài ---------- */
  function viewLessons() {
    var P = sel(); if (!P) return frame('lessons', '<div class="card soft">Chưa có hồ sơ nào.</div>');
    var ids = Object.keys(P.progress || {}).filter(function (id) { return P.progress[id].done && A.findLesson(id); }).sort(function (a, b) { return P.progress[b].doneAt - P.progress[a].doneAt; });
    var rows = ids.map(function (id) {
      var L = A.findLesson(id), pr = P.progress[id], a0 = null, a1 = null;
      (pr.attempts || []).forEach(function (x) { if (x.n === 1) a0 = x; if (x.n === 2) a1 = x; });
      var c = a1 && a1.text ? covCount(a1.text, L.ngan) : (a0 && a0.text ? covCount(a0.text, L.ngan) : null);
      var d = a0 && a1 ? a1.dur - a0.dur : null;
      return '<tr><td>' + dt(pr.doneAt) + '</td><td><b>' + esc(L.title) + '</b>' + (L.challenge ? ' 🏆' : '') + '<br><span class="muted small">' + (L.level === 'th' ? 'TH' : 'THCS') + ' · chặng ' + L.chang + '</span></td>' +
        '<td>' + (a0 ? mmss(a0.dur) + '<br><span class="muted small">' + a0.words + ' từ</span>' : '–') + '</td><td>' + (a1 ? mmss(a1.dur) + '<br><span class="muted small">' + a1.words + ' từ</span>' : '–') + '</td>' +
        '<td>' + (d == null ? '–' : (d >= 0 ? '+' : '') + d + 's') + '</td><td>' + (c == null ? '–' : c + '/' + L.ngan.length) + '</td><td>' + (pr.helped ? 'Có' : 'Không') + '</td>' +
        '<td><button class="btn alt sm" data-act="nav" data-to="/parent/lesson/' + id + '">Xem</button></td></tr>';
    }).join('');
    frame('lessons', '<div class="card"><h2>Báo cáo chi tiết từng bài · ' + esc(P.name) + '</h2>' + (rows ? '<div style="overflow-x:auto"><table class="ptable"><thead><tr><th>Ngày</th><th>Bài</th><th>Lần 1</th><th>Lần 2</th><th>Chênh lệch</th><th>Ngăn đủ</th><th>Mở thêm gợi ý</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="muted small mt">"Ngăn đủ" là số ngăn ý mà máy nghe thấy từ khóa ở lần nói cuối; chỉ để tham khảo.</p>' : '<p class="muted">Chưa có bài nào hoàn thành.</p>') + '</div>' +
      freeSection(P));
  }
  function freeSection(P) {
    var f = allFree(P).reverse().slice(0, 30);
    if (!f.length) return '';
    return '<div class="card mt"><h3>Nhật ký Nói tự do (30 lần gần nhất)</h3>' + f.map(function (x) {
      return '<div class="row mb" style="border-bottom:1px solid var(--line);padding-bottom:8px"><span class="badge">' + dtm(x.t) + '</span><b>' + esc(D.kinds[x.kind] || x.kind) + '</b><span>' + mmss(x.dur) + ' · ' + x.words + ' từ' + (x.stars ? ' · +' + x.stars + '⭐' : '') + '</span>' +
        (x.key ? '<button class="btn alt sm" data-act="playclip" data-key="' + esc(x.key) + '">▶ Nghe lại</button><span class="clip"></span>' : '') +
        (x.text ? '<details style="flex-basis:100%"><summary class="small muted">Xem chữ máy nghe được</summary><p>' + esc(x.text) + '</p></details>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function attemptCard(a, L, label) {
    if (!a) return '<div class="card soft mb"><b>' + label + '</b><p class="muted">Không có dữ liệu.</p></div>';
    var cov = a.text ? covOf(a.text, L.ngan) : null;
    return '<div class="card soft mb"><div class="row between"><b>' + label + '</b><span class="badge">' + mmss(a.dur) + ' · ' + a.words + ' từ · ' + (wpm(a) || '–') + ' từ/phút</span></div>' +
      (a.key ? '<div class="row mt"><button class="btn alt sm" data-act="playclip" data-key="' + esc(a.key) + '">▶ Nghe lại</button><span class="clip"></span></div>' : '<p class="muted small mt">Không có ghi âm (điện thoại không ghi, hoặc ghi âm cũ đã được xóa).</p>') +
      (cov ? '<div class="kws mt">' + L.ngan.map(function (g, i) { return '<span class="kw" style="' + (cov[i] >= 2 ? 'background:#dff6e9' : 'opacity:.55') + '">' + (cov[i] >= 2 ? '✔ ' : '') + (i + 1) + '. ' + esc(g.name) + '</span>'; }).join('') + '</div>' : '') +
      '<details class="mt"><summary class="small">Văn bản máy nghe được</summary><p>' + (a.text ? esc(a.text) : '<span class="muted">Máy không nghe được chữ nào lần này.</span>') + '</p></details></div>';
  }
  function viewLesson(id) {
    var P = sel(), L = A.findLesson(id), pr = P && P.progress[id];
    if (!P || !L || !pr) return frame('lessons', '<div class="card soft">Không tìm thấy bài này.</div>');
    var a0 = null, a1 = null; (pr.attempts || []).forEach(function (x) { if (x.n === 1) a0 = x; if (x.n === 2) a1 = x; });
    var reflect = pr.reflect || {}, plans = Object.keys(reflect.plan || {}).filter(function (k) { return reflect.plan[k]; }).map(function (k) { return A.PLANS[k]; });
    var checked = (pr.check || []).map(function (c, i) { return c ? L.ngan[i] && L.ngan[i].name : null; }).filter(Boolean);
    var hist = (pr.history || []).slice().reverse().map(function (h) {
      var b0 = null, b1 = null; (h.attempts || []).forEach(function (x) { if (x.n === 1) b0 = x; if (x.n === 2) b1 = x; });
      return '<div class="row mb"><span class="badge">' + dtm(h.t) + '</span><span>Lần 1: ' + (b0 ? mmss(b0.dur) + ' · ' + b0.words + ' từ' : '–') + '</span><span>Lần 2: ' + (b1 ? mmss(b1.dur) + ' · ' + b1.words + ' từ' : '–') + '</span></div>';
    }).join('');
    var d = a0 && a1 ? a1.dur - a0.dur : null;
    frame('lessons', '<button class="btn alt sm mb" data-act="nav" data-to="/parent/lessons">← Danh sách bài</button>' +
      '<div class="card mb"><h2>' + (L.icon || '') + ' ' + esc(L.title) + (L.challenge ? ' 🏆' : '') + '</h2><p class="muted">' + esc(L.task) + '</p>' +
      '<div class="row"><span class="badge">Xong lúc ' + dtm(pr.doneAt) + '</span><span class="badge">Mục tiêu ' + A.targetLabel(L.target) + '</span><span class="badge">Mức gợi ý: ' + esc(D.hintNames[L.hint]) + '</span><span class="badge ' + (pr.helped ? '' : 'g') + '">' + (pr.helped ? 'Có mở thêm gợi ý' : 'Tự lực, không mở thêm gợi ý') + '</span></div></div>' +
      attemptCard(a0, L, 'Lần nói 1') + attemptCard(a1, L, 'Lần nói 2 (sau khi xem bài mẫu)') +
      (d == null ? '' : '<div class="card soft mb">So với lần 1, lần 2 ' + (d >= 0 ? 'dài hơn ' + d : 'ngắn hơn ' + (-d)) + ' giây' + (a0.text && a1.text ? ', ngăn nghe thấy ' + covCount(a0.text, L.ngan) + ' → ' + covCount(a1.text, L.ngan) + ' trên ' + L.ngan.length : '') + '.</div>') +
      '<div class="card mb"><h3>Con tự soi lại</h3><div class="kv"><span>Ngăn ý con tự tick là đã nói</span><b>' + (checked.length ? checked.map(esc).join('; ') : '–') + '</b><span>Có chỗ im lặng lâu không?</span><b>' + (reflect.silence === 'yes' ? 'Có' : (reflect.silence === 'no' ? 'Không' : '–')) + '</b><span>Lần hai con muốn làm tốt hơn</span><b>' + (plans.length ? plans.map(esc).join('; ') : '–') + '</b></div></div>' +
      '<div class="card mb"><h3>Sao nhận được: +' + (pr.stars || 0) + ' ⭐</h3>' + (pr.R ? '<div class="kv">' + pr.R.map(function (r) { return '<span>' + esc(r[0]) + '</span><b>+' + r[1] + '</b>'; }).join('') + '</div>' : '<p class="muted">Không có chi tiết sao cho bài này.</p>') + (pr.added && pr.added.length ? '<p class="mt">Từ mới đã thêm vào Sổ từ: <b>' + pr.added.map(esc).join(', ') + '</b></p>' : '') + '</div>' +
      (hist ? '<div class="card soft mb"><h3>Các lần luyện lại trước đó</h3>' + hist + '</div>' : '') +
      '<div class="card warn"><b>Gợi ý hỏi con:</b><ul>' + (L.parentQs || []).map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul></div>');
  }

  /* ---------- Tiến bộ ---------- */
  function lineChart(points, W, H) {
    // points: [{v, label}], đường mốc 1.0 = thời lượng tối thiểu mục tiêu
    if (!points.length) return '';
    var max = 1.6, pl = 36, pr = 10, pt = 10, pb = 24, iw = W - pl - pr, ih = H - pt - pb;
    function X(i) { return pl + (points.length === 1 ? iw / 2 : i * iw / (points.length - 1)); }
    function Y(v) { return pt + ih - Math.min(max, v) / max * ih; }
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:640px" role="img" aria-label="Thời lượng nói so với mục tiêu qua các buổi">';
    [0, .5, 1, 1.5].forEach(function (g) { svg += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" stroke="' + (g === 1 ? '#2fb67c' : '#eadfce') + '" stroke-width="' + (g === 1 ? 2 : 1) + '" stroke-dasharray="' + (g === 1 ? '6 4' : '0') + '"/><text x="' + (pl - 6) + '" y="' + (Y(g) + 4) + '" text-anchor="end" font-size="11" fill="#6b6a86">' + Math.round(g * 100) + '%</text>'; });
    svg += '<polyline fill="none" stroke="#4c8dff" stroke-width="3" stroke-linejoin="round" points="' + points.map(function (p, i) { return X(i) + ',' + Y(p.v); }).join(' ') + '"/>';
    points.forEach(function (p, i) { svg += '<circle cx="' + X(i) + '" cy="' + Y(p.v) + '" r="4.5" fill="' + (p.v >= 1 ? '#2fb67c' : '#4c8dff') + '"><title>' + esc(p.label) + '</title></circle>'; });
    svg += '<text x="' + pl + '" y="' + (H - 6) + '" font-size="11" fill="#6b6a86">buổi đầu</text><text x="' + (W - pr) + '" y="' + (H - 6) + '" text-anchor="end" font-size="11" fill="#6b6a86">buổi gần nhất</text>';
    return svg + '</svg>';
  }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function insights(ss, P) {
    var out = [];
    if (ss.length < 3) return ['Cần ít nhất 3 buổi luyện để so sánh. Hiện mới có ' + ss.length + ' buổi, con cứ luyện đều đặn nhé.'];
    var r = ss.filter(function (x) { return x.best; }).map(function (x) { return x.best.dur / x.L.target.min; }), h = Math.max(1, Math.floor(r.length / 2));
    var first = avg(r.slice(0, h)), last = avg(r.slice(-h));
    if (last - first > 0.08) out.push('Gần đây con nói đủ thời lượng mục tiêu hơn những buổi đầu (khoảng ' + Math.round(first * 100) + '% rồi ' + Math.round(last * 100) + '%). Đó là kết quả của sự luyện tập.');
    else if (first - last > 0.15) out.push('Các bài gần đây khó hơn (mục tiêu dài hơn), nên tỉ lệ so với mục tiêu thấp hơn lúc đầu. Điều này bình thường, con vẫn đang cố gắng.');
    else out.push('Thời lượng nói của con khá ổn định so với mục tiêu từng chặng. Giữ nhịp luyện đều là điều quan trọng nhất.');
    var two = ss.filter(function (x) { return x.a0 && x.a1; });
    if (two.length) { var imp = two.filter(function (x) { return x.improved; }).length; out.push('Có ' + imp + '/' + two.length + ' buổi mà lần nói 2 dài hơn hoặc đủ ngăn ý hơn lần 1.'); }
    var half = Math.floor(ss.length / 2), h1 = ss.slice(0, half).filter(function (x) { return x.helped; }).length / Math.max(1, half), h2 = ss.slice(half).filter(function (x) { return x.helped; }).length / Math.max(1, ss.length - half);
    if (h1 - h2 > 0.15) out.push('Con mở thêm gợi ý ít dần (' + Math.round(h1 * 100) + '% rồi ' + Math.round(h2 * 100) + '%), tức là con đang tự tin hơn.');
    var recent = ss.filter(function (x) { return Date.now() - x.t < 28 * 864e5; }).length;
    out.push('Trong 4 tuần gần đây, con luyện ' + recent + ' buổi' + (recent >= 9 ? ', rất đều đặn.' : '.'));
    return out;
  }
  function viewProgress() {
    var P = sel(); if (!P) return frame('progress', '<div class="card soft">Chưa có hồ sơ nào.</div>');
    var ss = sessions(P), pts = ss.filter(function (x) { return x.best; }).map(function (x) { return { v: x.best.dur / x.L.target.min, label: dt(x.t) + ' · ' + x.L.title + ' · ' + mmss(x.best.dur) }; });
    var byC = {};
    ss.forEach(function (x) { (byC[x.L.chang] = byC[x.L.chang] || []).push(x); });
    var rows = Object.keys(byC).sort().map(function (c) {
      var a = byC[c], w = a.filter(function (x) { return x.best && wpm(x.best); }).map(function (x) { return wpm(x.best); }), two = a.filter(function (x) { return x.a0 && x.a1; });
      var cv = a.filter(function (x) { return x.c1 != null || x.c0 != null; }).map(function (x) { return (x.c1 != null ? x.c1 : x.c0) / x.L.ngan.length; });
      return '<tr><td>Chặng ' + c + '</td><td>' + a.length + '</td><td>' + Math.round(avg(a.filter(function (x) { return x.best; }).map(function (x) { return x.best.dur / x.L.target.min; })) * 100) + '%</td><td>' + (w.length ? Math.round(avg(w)) : '–') + '</td><td>' + (cv.length ? Math.round(avg(cv) * 100) + '%' : '–') + '</td><td>' + (two.length ? Math.round(two.filter(function (x) { return x.improved; }).length * 100 / two.length) + '%' : '–') + '</td><td>' + Math.round(a.filter(function (x) { return !x.helped; }).length * 100 / a.length) + '%</td></tr>';
    }).join('');
    frame('progress', '<div class="card mb"><h2>Đánh giá tiến bộ · ' + esc(P.name) + '</h2>' +
      '<ul>' + insights(ss, P).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '<p class="muted small">Nhận xét được tính tự động từ số liệu, chỉ nói về nỗ lực và sự tiến bộ của chính con, không so với bạn khác và không chấm điểm.</p></div>' +
      '<div class="card mb"><h3>Thời lượng nói so với mục tiêu qua các buổi</h3>' + (pts.length ? lineChart(pts, 640, 220) + '<p class="muted small">100% (đường xanh nét đứt) là đúng thời lượng tối thiểu mục tiêu của bài. Rê chuột vào từng chấm để xem bài.</p>' : '<p class="muted">Chưa có dữ liệu.</p>') + '</div>' +
      '<div class="card mb"><h3>Tóm tắt theo chặng</h3>' + (rows ? '<div style="overflow-x:auto"><table class="ptable"><thead><tr><th>Chặng</th><th>Số buổi</th><th>Thời lượng / mục tiêu</th><th>Từ mỗi phút</th><th>Ngăn đủ (TB)</th><th>Lần 2 tốt hơn lần 1</th><th>Tự lực</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<p class="muted">Chưa có dữ liệu.</p>') + '<p class="muted small mt">Số từ và ngăn ý do máy nhận dạng giọng nói ước lượng (giọng vùng miền và trẻ nhỏ có thể bị nghe sai), nên hãy xem như tham khảo và nghe lại ghi âm khi cần.</p></div>');
  }

  /* ---------- Ví dụ của cha mẹ ---------- */
  var spLevel = null, spLesson = null, spEdit = null;
  function splitParas(text) { return String(text || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12).map(function (x) { return x.slice(0, 4000); }); }
  function viewSamples() {
    var P = sel(), level = spLevel || (P ? P.level : 'th'), ls = A.lessonsOf(level);
    if (!spLesson || !ls.some(function (l) { return l.id === spLesson; })) spLesson = ls[0] && ls[0].id;
    var L = A.findLesson(spLesson), list = ((S.get().customSamples || {})[spLesson] || []), ed = spEdit ? list.filter(function (c) { return c.id === spEdit; })[0] : null;
    var opts = ls.map(function (l) { return '<option value="' + esc(l.id) + '" ' + (l.id === spLesson ? 'selected' : '') + '>Chặng ' + l.chang + ' · ' + (l.challenge ? 'Thử thách' : 'bài ' + l.order) + ' · ' + esc(l.title) + '</option>'; }).join('');
    var cards = list.map(function (c) {
      return '<div class="card soft mb"><div class="row between"><b>' + esc(c.title) + '</b><span class="muted small">' + c.paras.length + ' đoạn · ' + dt(c.created) + '</span></div><p class="muted">' + esc(c.paras[0].slice(0, 140)) + (c.paras[0].length > 140 ? '…' : '') + '</p>' +
        '<div class="row"><button class="btn alt sm" data-act="psamedit" data-id="' + esc(c.id) + '">✏️ Sửa</button><button class="btn red sm" data-act="psamdel" data-id="' + esc(c.id) + '">🗑️ Xóa</button></div></div>';
    }).join('');
    frame('samples', '<div class="card mb"><h2>Ví dụ của cha mẹ</h2><p class="muted">Thêm bài mẫu của riêng gia đình cho từng bài. Ví dụ hiện ở bước "Bài mẫu" của <b>tất cả các bạn cùng cấp</b> trên máy này (tab "👪 …"), con đọc và nghe đọc được như các ví dụ khác. Con không thấy hay sửa được phần này.</p>' +
      '<div class="row"><label class="chip">Cấp: <select data-chg="splevel" style="border:0;background:transparent;font:inherit;font-weight:700"><option value="th" ' + (level === 'th' ? 'selected' : '') + '>Tiểu học</option><option value="thcs" ' + (level === 'thcs' ? 'selected' : '') + '>THCS</option></select></label>' +
      '<label class="chip">Bài: <select data-chg="splesson" style="border:0;background:transparent;font:inherit;font-weight:700;max-width:60vw">' + opts + '</select></label></div></div>' +
      (L ? '<div class="card mb"><h3>' + (ed ? 'Sửa ví dụ' : 'Thêm ví dụ mới') + ' cho "' + esc(L.title) + '"</h3>' +
        '<p class="muted small">Các ngăn ý của bài này: ' + L.ngan.map(function (g, i) { return (i + 1) + '. ' + esc(g.name); }).join(' · ') + '</p>' +
        '<p class="muted small">Viết hoặc dán bài mẫu, <b>mỗi đoạn cách nhau một dòng trống</b>, đoạn thứ nhất ứng với ngăn 1, v.v. Ít hoặc nhiều đoạn hơn số ngăn đều được.</p>' +
        '<div class="col"><input id="spTitle" maxlength="40" placeholder="Tên ngắn, ví dụ: Chuyện cái cặp của ba" value="' + esc(ed ? ed.title : '') + '" style="padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px">' +
        '<textarea id="spText" rows="14" placeholder="Đoạn 1…\n\nĐoạn 2…" style="padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px;line-height:1.5">' + esc(ed ? ed.paras.join('\n\n') : '') + '</textarea>' +
        '<div class="row"><button class="btn" data-act="psamsave">' + (ed ? 'Lưu thay đổi' : 'Thêm ví dụ') + '</button>' + (ed ? '<button class="btn alt" data-act="psamcancel">Hủy sửa</button>' : '') + '</div></div></div>' : '') +
      (list.length ? '<h3>Các ví dụ đã thêm cho bài này</h3>' + cards : '<p class="muted">Bài này chưa có ví dụ nào của cha mẹ.</p>'));
  }

  /* ---------- AI (chờ) ---------- */
  function viewAI() {
    frame('ai', '<div class="card"><h2>🤖 Nhận xét bằng AI <span class="badge y">Chức năng chờ</span></h2>' +
      '<p>Mục này để dành cho giai đoạn sau, hiện chưa hoạt động và chưa được thiết kế chi tiết. Hiện app <b>không gửi bài nói của con tới AI hay máy chủ nào</b>.</p>' +
      '<p class="muted"><b>Dự kiến:</b> nhận xét nội dung và cách diễn đạt của từng bài nói, gợi ý từ và câu hay nên dùng, đề xuất bài luyện tiếp theo, tóm tắt tiến bộ theo tháng cho cha mẹ.</p>' +
      '<p class="muted"><b>Cần cân nhắc khi làm:</b> quyền riêng tư của trẻ (gửi giọng nói và văn bản ra ngoài), chi phí, chất lượng với tiếng Việt và giọng vùng miền.</p>' +
      '<button class="btn" disabled>Bật nhận xét AI (chưa có)</button></div>');
  }

  /* ---------- Cài đặt cha mẹ ---------- */
  function viewSettingsP() {
    var P = sel(); if (!P) return frame('settings', '<div class="card soft">Chưa có hồ sơ nào.</div>');
    frame('settings',
      '<div class="card mb"><h3>Mở khóa chặng cho ' + esc(P.name) + '</h3><label class="chk"><input type="checkbox" data-chg="punlockall" ' + (P.unlockAll ? 'checked' : '') + '><span>Mở khóa tất cả các chặng (không cần xong Thử thách)</span></label></div>' +
      '<div class="card mb"><h3>Sao lưu dữ liệu</h3><p class="muted">Dữ liệu chỉ nằm trong trình duyệt của máy này, không có trên điện thoại hay máy khác. Hãy sao lưu thỉnh thoảng. File sao lưu gồm cả hồ sơ, báo cáo và mật khẩu cha mẹ nhưng không gồm file ghi âm; có thể khôi phục trên máy khác để xem báo cáo.</p><div class="row"><button class="btn sm" data-act="backup">⬇️ Sao lưu ra file</button><label class="btn alt sm">⬆️ Khôi phục từ file<input type="file" accept=".json,application/json" data-chg="restore" style="display:none"></label></div></div>' +
      '<div class="card mb"><h3>Đổi mật khẩu</h3><div class="col" style="max-width:360px"><input id="pwOld" type="password" placeholder="Mật khẩu hiện tại" style="padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px"><input id="pwNew" type="password" placeholder="Mật khẩu mới (từ 6 ký tự)" style="padding:10px;font:inherit;border:2px solid var(--line);border-radius:10px"><button class="btn sm" data-act="pchange">Đổi mật khẩu và tạo mã khôi phục mới</button></div></div>' +
      '<div class="card mb"><h3>Xóa hồ sơ</h3><p class="muted">Xóa hồ sơ "' + esc(P.name) + '" cùng toàn bộ bài làm và ghi âm. Không thể hoàn lại.</p><button class="btn red sm" data-act="pdel">Xóa hồ sơ này</button></div>');
  }

  /* ---------- điều hướng ---------- */
  function view(parts) {
    var tab = parts[1];
    if (!live()) return viewGate();
    switch (tab) {
      case 'lessons': return viewLessons();
      case 'lesson': return viewLesson(parts[2]);
      case 'progress': return viewProgress();
      case 'samples': return viewSamples();
      case 'ai': return viewAI();
      case 'settings': return viewSettingsP();
      default: return viewOverview();
    }
  }
  function onLeave() { lock(); }

  function init(api) {
    A = api;
    var acts = A.acts, chgs = A.chgs;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }
    acts.pgsetup = function () {
      var p1 = val('pw1'), p2 = val('pw2');
      if (p1.length < 6) return viewGate('Mật khẩu cần từ 6 ký tự.');
      if (p1 !== p2) return viewGate('Hai mật khẩu chưa giống nhau.');
      setPassword(p1).then(function (code) { pAuth = { ok: true, t: Date.now() }; viewRecoveryCode(code); });
    };
    acts.pglogin = function () {
      var ps = pstate(); if (!ps) return viewGate();
      if (ps.lockUntil && ps.lockUntil > Date.now()) return viewGate();
      kdf(val('pw1'), ps.salt).then(function (h) {
        if (h === ps.hash) { ps.fails = 0; ps.lockUntil = 0; S.save(); pAuth = { ok: true, t: Date.now() }; A.nav('/parent/overview'); }
        else { ps.fails = (ps.fails || 0) + 1; var m = 'Mật khẩu chưa đúng.'; if (ps.fails >= 5) { ps.fails = 0; ps.lockUntil = Date.now() + 60000; m = 'Nhập sai 5 lần. Hãy đợi 1 phút rồi thử lại.'; } S.save(); viewGate(m); }
      });
    };
    acts.pgforgot = function () { viewForgot(); };
    acts.pgrecover = function () {
      var ps = pstate(), code = normCode(val('rc')), pw = val('pw1');
      if (code.length !== 8) return viewForgot('Mã khôi phục gồm 8 ký tự.');
      if (pw.length < 6) return viewForgot('Mật khẩu mới cần từ 6 ký tự.');
      kdf(code, ps.rsalt).then(function (h) {
        if (h !== ps.rhash) return viewForgot('Mã khôi phục chưa đúng.');
        setPassword(pw).then(function (nc) { pAuth = { ok: true, t: Date.now() }; viewRecoveryCode(nc); });
      });
    };
    acts.plock = function () { lock(); A.nav('/'); };
    acts.pchange = function () {
      var ps = pstate(), pn = val('pwNew'); if (!live()) return viewGate();
      if (pn.length < 6) return A.toast('Mật khẩu mới cần từ 6 ký tự.');
      kdf(val('pwOld'), ps.salt).then(function (h) {
        if (h !== ps.hash) return A.toast('Mật khẩu hiện tại chưa đúng.');
        setPassword(pn).then(function (code) { pAuth = { ok: true, t: Date.now() }; viewRecoveryCode(code); });
      });
    };
    acts.pdel = function () {
      if (!live()) return viewGate();
      var P = sel(); if (P && confirm('Xóa hồ sơ "' + P.name + '" cùng toàn bộ bài làm và ghi âm? Việc này không thể hoàn lại.')) { S.removeProfile(P.id); pSel = null; A.nav(S.profiles().length ? '/parent/settings' : '/profiles'); }
    };
    chgs.psel = function (el) { pSel = el.value; A.nav('/parent/' + (location.hash.split('/')[2] === 'lesson' ? 'lessons' : (location.hash.split('/')[2] || 'overview'))); };
    chgs.splevel = function (el) { spLevel = el.value; spLesson = null; spEdit = null; viewSamples(); };
    chgs.splesson = function (el) { spLesson = el.value; spEdit = null; viewSamples(); };
    acts.psamsave = function () {
      if (!live()) return viewGate();
      var title = val('spTitle').trim() || 'Ví dụ của cha mẹ', paras = splitParas(val('spText'));
      if (!paras.length) return A.toast('Hãy viết ít nhất một đoạn.');
      var st = S.get(); st.customSamples = st.customSamples || {};
      var arr = st.customSamples[spLesson] = st.customSamples[spLesson] || [];
      if (spEdit) { arr.forEach(function (c) { if (c.id === spEdit) { c.title = title; c.paras = paras; } }); }
      else arr.push({ id: S.uid(), title: title, paras: paras, created: Date.now() });
      spEdit = null; S.save(); A.toast('Đã lưu ví dụ.'); viewSamples();
    };
    acts.psamedit = function (el) { if (!live()) return viewGate(); spEdit = el.getAttribute('data-id'); viewSamples(); window.scrollTo(0, 0); };
    acts.psamcancel = function () { spEdit = null; viewSamples(); };
    acts.psamdel = function (el) {
      if (!live()) return viewGate();
      if (!confirm('Xóa ví dụ này?')) return;
      var st = S.get(), id = el.getAttribute('data-id'); st.customSamples[spLesson] = (st.customSamples[spLesson] || []).filter(function (c) { return c.id !== id; });
      if (!st.customSamples[spLesson].length) delete st.customSamples[spLesson];
      spEdit = null; S.save(); viewSamples();
    };
    chgs.punlockall = function (el) { if (!live()) return viewGate(); var P = sel(); P.unlockAll = el.checked; S.save(); A.toast(el.checked ? 'Đã mở tất cả các chặng.' : 'Đã khóa lại theo tiến độ.'); };
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !e.target || !e.target.id) return;
      var map = { pw1: ['pglogin', 'pgsetup', 'pgrecover'], pw2: ['pgsetup'], rc: ['pgrecover'], pwOld: ['pchange'], pwNew: ['pchange'] }, names = map[e.target.id]; if (!names) return;
      for (var i = 0; i < names.length; i++) { var b = document.querySelector('[data-act="' + names[i] + '"]'); if (b) { b.click(); return; } }
    });
    setInterval(function () { if (pAuth.ok && /^#\/parent/.test(location.hash) && Date.now() - pAuth.t > IDLE) { pAuth.ok = false; A.nav('/parent'); } }, 30000);
  }
  window.MMIParent = { init: init, view: view, onLeave: onLeave, isLive: function () { return live(); } };
})();
