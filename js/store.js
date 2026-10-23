/* MM-iTalk - Lưu dữ liệu trong máy: localStorage (hồ sơ, sao, tiến độ) + IndexedDB (ghi âm). */
(function () {
  'use strict';
  var KEY = window.MMI_STORE_KEY || 'mmit:v1'; // app phụ huynh (phuhuynh/) dùng khóa riêng
  var memoryOnly = false;
  var state = load();

  function fresh() {
    return { v: 1, profiles: [], active: null, settings: { recAudio: true, tts: true, consent: false } };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.profiles) { s.settings = Object.assign({ recAudio: true, tts: true, consent: false }, s.settings || {}); return s; }
      }
    } catch (e) { memoryOnly = true; }
    return fresh();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); memoryOnly = false; }
    catch (e) { memoryOnly = true; }
  }
  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function weekKey(d) {
    d = d ? new Date(d) : new Date();
    var day = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - day);
    return dayStr(d);
  }

  var Store = {
    memoryOnly: function () { return memoryOnly; },
    get: function () { return state; },
    save: save,
    settings: function () { return state.settings; },
    profile: function () {
      for (var i = 0; i < state.profiles.length; i++) if (state.profiles[i].id === state.active) return state.profiles[i];
      return null;
    },
    profiles: function () { return state.profiles; },
    addProfile: function (name, level, grade) {
      var p = {
        id: uid(), name: name, level: level, grade: grade, created: Date.now(),
        stars: 0, owned: [], equipped: {}, progress: {}, vocab: [], stamps: {}, weekBonus: {},
        seenGuide: false, lastDone: 0
      };
      state.profiles.push(p); state.active = p.id; save(); return p;
    },
    setActive: function (id) { state.active = id; save(); },
    removeProfile: function (id) {
      state.profiles = state.profiles.filter(function (p) { return p.id !== id; });
      if (state.active === id) state.active = state.profiles.length ? state.profiles[0].id : null;
      state.audioKeys = (state.audioKeys || []).filter(function (k) { return k.indexOf(id + '|') !== 0; });
      save();
      Store.audio.removeByPrefix(id + '|');
    },
    uid: uid, dayStr: dayStr, weekKey: weekKey,
    exportJSON: function () { return JSON.stringify({ app: 'MM-iTalk', exported: new Date().toISOString(), data: state }, null, 1); },
    importJSON: function (text) {
      var obj = JSON.parse(text);
      if (!obj || obj.app !== 'MM-iTalk' || !obj.data || !obj.data.profiles) throw new Error('Tệp không đúng định dạng MM-iTalk');
      state = obj.data; state.settings = Object.assign({ recAudio: true, tts: true, consent: false }, state.settings || {});
      state.audioKeys = [];
      save();
    }
  };

  /* ---- IndexedDB cho ghi âm ---- */
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      try {
        var req = indexedDB.open('mmit-audio', 1);
        req.onupgradeneeded = function () { req.result.createObjectStore('clips'); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      } catch (e) { reject(e); }
    });
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var t = d.transaction('clips', mode), st = t.objectStore('clips'), out = fn(st);
        t.oncomplete = function () { resolve(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { reject(t.error); };
      });
    });
  }
  Store.audio = {
    put: function (key, blob) { return tx('readwrite', function (st) { st.put(blob, key); }).catch(function () {}); },
    get: function (key) { return tx('readonly', function (st) { return st.get(key); }).catch(function () { return null; }); },
    /* Chỉ giữ MAX bản ghi âm gần nhất; bản cũ hơn bị xóa để nhẹ trình duyệt. */
    MAX: 60,
    register: function (key) {
      state.audioKeys = state.audioKeys || [];
      state.audioKeys.push(key);
      while (state.audioKeys.length > Store.audio.MAX) { var old = state.audioKeys.shift(); Store.audio.remove(old); }
      save();
    },
    remove: function (key) { return tx('readwrite', function (st) { st.delete(key); }).catch(function () {}); },
    removeByPrefix: function (prefix) {
      return db().then(function (d) {
        return new Promise(function (resolve) {
          var t = d.transaction('clips', 'readwrite'), st = t.objectStore('clips'), req = st.openCursor();
          req.onsuccess = function () {
            var c = req.result;
            if (c) { if (String(c.key).indexOf(prefix) === 0) c.delete(); c.continue(); }
          };
          t.oncomplete = function () { resolve(); };
          t.onerror = function () { resolve(); };
        });
      }).catch(function () {});
    }
  };

  window.MMIStore = Store;
})();
