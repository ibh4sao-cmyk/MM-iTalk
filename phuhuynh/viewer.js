/* MM-iTalk Phụ huynh - bản chỉ-xem cho điện thoại.
   Dùng lại màn báo cáo của js/parent.js, đọc dữ liệu từ file báo cáo (không có ghi âm). */
(function () {
  'use strict';
  var D = window.MMI_DATA, S = window.MMIStore, P = window.MMIParent;
  var LESSONS = window.MMI_LESSONS || [];
  var app = document.getElementById('app');
  var PLANS = ['Nói thêm ngăn ý còn thiếu', 'Dùng vài từ mới trong bài mẫu', 'Nói chậm và rõ hơn', 'Thêm một ví dụ hoặc một câu so sánh'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function fmtMin(sec) { var m = Math.round(sec / 30) / 2; return String(m).replace('.', ',') + ' phút'; }
  function targetLabel(t) { return t.max <= 90 ? t.min + '–' + t.max + ' giây' : 'khoảng ' + fmtMin((t.min + t.max) / 2); }
  function p2(n) { return n < 10 ? '0' + n : '' + n; }
  function stampOf(ts) { var d = new Date(ts); return p2(d.getDate()) + '/' + p2(d.getMonth() + 1) + '/' + d.getFullYear() + ' lúc ' + p2(d.getHours()) + ':' + p2(d.getMinutes()); }
  var toastT = null;
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 3600);
  }
  function lessonsOf(level, chang) {
    return LESSONS.filter(function (l) { return l.level === level && (!chang || l.chang === chang); }).sort(function (a, b) { return a.chang - b.chang || a.order - b.order; });
  }
  function findLesson(id) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i]; return null; }
  function levelLabel(p) { return p.level === 'th' ? 'Tiểu học · lớp ' + p.grade : 'THCS · lớp ' + p.grade; }
  function render(html) { app.innerHTML = html; window.scrollTo(0, 0); }
  function nav(h) { if (location.hash === '#' + h) route(); else location.hash = h; }
  function topbar() {
    return '<div class="topbar"><div class="row"><div><div class="logo">MM-<b>iTalk</b><small>Phụ huynh</small></div><div class="tagline">Báo cáo chỉ để xem</div></div></div></div>';
  }
  function hasReport() { var st = S.get(); return !!(st.profiles && st.profiles.length && st.parent && st.parent.hash && st.parent.salt); }
  function stamp() { var t = S.get().reportExported; return t ? 'Báo cáo cập nhật ' + stampOf(t) + ' · đổi số liệu mới: xuất lại file từ máy tính.' : ''; }

  /* ---------- nhập file báo cáo ---------- */
  function importCard(first) {
    return '<div class="card mt"><h3>' + (first ? '📂 Mở file báo cáo' : '📂 Mở file báo cáo mới') + '</h3>' +
      (first ? '<p>Trên máy tính, vào <b>MM-iTalk → Cài đặt → Khu cha mẹ → Cài đặt cha mẹ → "Xuất báo cáo cho điện thoại"</b>, gửi file sang điện thoại này (Zalo, email, Google Drive…), rồi chọn file ở đây.</p>' : '<p class="muted small">' + esc(stamp()) + ' Mở file mới sẽ thay số liệu cũ.</p>') +
      '<label class="btn sm" style="cursor:pointer">📂 Chọn file báo cáo<input type="file" data-chg="vimport" style="display:none"></label>' +
      '<p class="muted small mt">File chỉ được đọc trong máy này, không gửi đi đâu. Không có ghi âm trong file.</p></div>';
  }
  function viewImport() {
    render(topbar() + '<h1>Chào cha mẹ 👋</h1><div class="card"><p>Đây là app <b>chỉ để xem</b> báo cáo luyện nói của con. Con học và nói trên máy tính; còn ở đây cha mẹ xem tiến độ, thời lượng nói, ngăn ý và nhận xét tiến bộ.</p></div>' + importCard(true));
  }
  function doImport(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var o = JSON.parse(String(r.result));
        if (!o || o.app !== 'MM-iTalk-report' || !o.data || !o.data.profiles || !o.data.parent || !o.data.parent.hash || !o.data.parent.salt) throw new Error('Đây chưa phải file báo cáo của MM-iTalk. Hãy dùng nút "Xuất báo cáo cho điện thoại" trên máy tính.');
        S.importJSON(JSON.stringify({ app: 'MM-iTalk', data: o.data }));
        var st = S.get(); st.reportExported = o.exported || Date.now();
        if (!st.profiles.some(function (x) { return x.id === st.active; })) st.active = st.profiles[0] && st.profiles[0].id;
        S.save();
        toast('Đã mở báo cáo. Nhập mật khẩu cha mẹ để xem.');
        nav('/parent');
      } catch (e) { toast(e.message || 'Không đọc được file.'); }
    };
    r.onerror = function () { toast('Không đọc được file.'); };
    r.readAsText(file);
  }

  /* ---------- định tuyến ---------- */
  var acts = {
    nav: function (el) { nav(el.getAttribute('data-to')); }
  }, chgs = {
    vimport: function (el) { var f = el.files && el.files[0]; if (f) doImport(f); el.value = ''; }
  };
  function route() {
    var parts = (location.hash || '#/').slice(1).split('/').filter(Boolean);
    if (!hasReport()) return viewImport();
    if (parts[0] !== 'parent') return nav('/parent');
    P.view(parts);
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el || !app.contains(el)) return;
    var f = acts[el.getAttribute('data-act')]; if (f) { e.preventDefault(); f(el); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, k = el.getAttribute && el.getAttribute('data-chg'); if (k && chgs[k]) chgs[k](el);
  });
  /* Khi quay lại app sau lúc để máy: nếu đã quá 10 phút thì về màn mật khẩu */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && hasReport() && location.hash !== '#/parent' && !P.isLive()) nav('/parent');
  });
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  P.init({
    readonly: true, esc: esc, mmss: mmss, targetLabel: targetLabel, render: render, topbar: topbar, nav: nav, toast: toast,
    findLesson: findLesson, lessonsOf: lessonsOf, levelLabel: levelLabel, PLANS: PLANS, acts: acts, chgs: chgs,
    stamp: stamp, gateExtra: function () { return importCard(false); }
  });
  route();
})();
