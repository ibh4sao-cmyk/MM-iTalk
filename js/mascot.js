/* MM-iTalk - Linh vật Vẹt con (SVG vẽ trong code) + phòng + phụ kiện. */
(function () {
  'use strict';

  function hat(id) {
    if (id === 'hat-cap') return '<g><path d="M60 62 Q100 8 140 62 Z" fill="#4c8dff"/><ellipse cx="100" cy="62" rx="46" ry="7" fill="#2f6fe0"/><path d="M118 62 Q150 60 158 70 Q140 72 118 68 Z" fill="#2f6fe0"/><circle cx="100" cy="24" r="4" fill="#ffd34d"/></g>';
    if (id === 'hat-party') return '<g><path d="M100 4 L132 62 L68 62 Z" fill="#ff7a59"/><path d="M86 38 L114 38 M78 52 L122 52" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="6" r="7" fill="#ffd34d"/></g>';
    if (id === 'hat-crown') return '<g><path d="M66 60 L72 26 L88 44 L100 20 L112 44 L128 26 L134 60 Z" fill="#ffc83d" stroke="#d99a00" stroke-width="2.5" stroke-linejoin="round"/><circle cx="72" cy="26" r="4" fill="#ff5d73"/><circle cx="100" cy="20" r="4.5" fill="#4c8dff"/><circle cx="128" cy="26" r="4" fill="#ff5d73"/></g>';
    return '';
  }
  function glasses(id) {
    if (id === 'gl-round') return '<g fill="rgba(255,255,255,.28)" stroke="#2b2a4c" stroke-width="3.5"><circle cx="82" cy="76" r="15"/><circle cx="118" cy="76" r="15"/><path d="M97 76 L103 76" fill="none"/></g>';
    if (id === 'gl-star') {
      var st = function (cx, cy) {
        var p = [], k;
        for (k = 0; k < 10; k++) { var r = k % 2 ? 7 : 16, a = -Math.PI / 2 + k * Math.PI / 5; p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)); }
        return '<polygon points="' + p.join(' ') + '"/>';
      };
      return '<g fill="#ffd34d" stroke="#d99a00" stroke-width="2.5" stroke-linejoin="round">' + st(82, 76) + st(118, 76) + '</g>';
    }
    return '';
  }
  function scarf(id) {
    if (id === 'sc-red') return '<g><path d="M62 118 Q100 140 138 118 L140 134 Q100 156 60 134 Z" fill="#e8433c"/><path d="M122 138 L136 168 L120 166 Z" fill="#c83630"/></g>';
    if (id === 'sc-rainbow') {
      var cols = ['#ff5d73', '#ffa83d', '#ffd34d', '#45c17b', '#4c8dff'], s = '<g>';
      cols.forEach(function (c, i) { s += '<path d="M62 ' + (116 + i * 5) + ' Q100 ' + (136 + i * 5) + ' 138 ' + (116 + i * 5) + '" stroke="' + c + '" stroke-width="6" fill="none" stroke-linecap="round"/>'; });
      return s + '</g>';
    }
    return '';
  }

  function parrot(eq, opts) {
    eq = eq || {}; opts = opts || {};
    var talk = opts.talk ? ' talk' : '';
    var mood = opts.mood === 'sleep' ? 'sleep' : '';
    var eyes = mood === 'sleep'
      ? '<path d="M74 74 Q84 82 94 74 M106 74 Q116 82 126 74" stroke="#2b2a4c" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
      : '<circle cx="84" cy="74" r="12" fill="#fff"/><circle cx="116" cy="74" r="12" fill="#fff"/><circle cx="86" cy="75" r="6" fill="#2b2a4c"/><circle cx="114" cy="75" r="6" fill="#2b2a4c"/><circle cx="88" cy="72" r="2" fill="#fff"/><circle cx="116" cy="72" r="2" fill="#fff"/>';
    return '<svg class="parrot' + talk + '" viewBox="0 0 200 215" role="img" aria-label="Vẹt con">' +
      '<g class="tail"><path d="M100 170 Q70 205 56 208 Q74 190 88 158 Z" fill="#e8433c"/><path d="M104 170 Q104 206 100 212 Q116 192 116 158 Z" fill="#4c8dff"/><path d="M110 168 Q140 202 150 205 Q132 188 122 156 Z" fill="#ffc83d"/></g>' +
      '<ellipse cx="100" cy="138" rx="48" ry="58" fill="#34b36b"/>' +
      '<ellipse cx="100" cy="150" rx="29" ry="40" fill="#a6e8bb"/>' +
      '<g class="wing-l"><ellipse cx="58" cy="140" rx="16" ry="38" fill="#27935a" transform="rotate(12 58 140)"/></g>' +
      '<g class="wing-r"><ellipse cx="142" cy="140" rx="16" ry="38" fill="#27935a" transform="rotate(-12 142 140)"/></g>' +
      '<path d="M84 190 L84 204 M78 204 L90 204 M116 190 L116 204 M110 204 L122 204" stroke="#f2a33a" stroke-width="4.5" stroke-linecap="round"/>' +
      '<g class="crest"><ellipse cx="92" cy="34" rx="6" ry="14" fill="#e8433c" transform="rotate(-18 92 34)"/><ellipse cx="100" cy="30" rx="6" ry="15" fill="#ffc83d"/><ellipse cx="108" cy="34" rx="6" ry="14" fill="#4c8dff" transform="rotate(18 108 34)"/></g>' +
      '<circle cx="100" cy="78" r="44" fill="#34b36b"/>' +
      '<ellipse cx="66" cy="92" rx="8" ry="5" fill="#ff9fb0" opacity=".7"/><ellipse cx="134" cy="92" rx="8" ry="5" fill="#ff9fb0" opacity=".7"/>' +
      eyes +
      '<g class="beak"><path d="M86 90 Q100 84 114 90 Q112 108 100 114 Q88 108 86 90 Z" fill="#ffb03a" stroke="#e0901a" stroke-width="2"/><path class="beak-low" d="M92 104 Q100 112 108 104" stroke="#c97a10" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>' +
      scarf(eq.scarf) + glasses(eq.glasses) + hat(eq.hat) +
      '</svg>';
  }

  function room(id) {
    if (id === 'room-garden') return '<svg class="room" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice"><rect width="300" height="240" fill="#bfe8ff"/><circle cx="250" cy="40" r="24" fill="#ffe27a"/><ellipse cx="80" cy="250" rx="190" ry="90" fill="#7bd389"/><ellipse cx="260" cy="260" rx="150" ry="80" fill="#5cc275"/><g><circle cx="40" cy="190" r="6" fill="#ff7aa8"/><circle cx="70" cy="210" r="6" fill="#ffd34d"/><circle cx="240" cy="200" r="6" fill="#ff7aa8"/><circle cx="270" cy="220" r="6" fill="#fff"/></g></svg>';
    if (id === 'room-sea') return '<svg class="room" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice"><rect width="300" height="240" fill="#bfeaff"/><circle cx="48" cy="40" r="22" fill="#ffe27a"/><rect y="110" width="300" height="130" fill="#4fb6e8"/><path d="M0 120 Q25 105 50 120 T100 120 T150 120 T200 120 T250 120 T300 120 V140 H0 Z" fill="#7ccdf2"/><path d="M0 160 Q30 148 60 160 T120 160 T180 160 T240 160 T300 160 V190 H0 Z" fill="#3aa3d6"/></svg>';
    if (id === 'room-space') return '<svg class="room" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice"><rect width="300" height="240" fill="#1d1b4b"/><g fill="#fff"><circle cx="30" cy="30" r="2"/><circle cx="90" cy="60" r="1.5"/><circle cx="150" cy="24" r="2"/><circle cx="220" cy="70" r="1.5"/><circle cx="270" cy="30" r="2"/><circle cx="60" cy="130" r="1.5"/><circle cx="250" cy="150" r="2"/><circle cx="20" cy="200" r="1.5"/><circle cx="170" cy="200" r="1.5"/></g><circle cx="245" cy="195" r="30" fill="#ff8a5c"/><ellipse cx="245" cy="195" rx="46" ry="9" fill="none" stroke="#ffd34d" stroke-width="3"/></svg>';
    return '<svg class="room" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b8"/><stop offset="1" stop-color="#ffd0a8"/></linearGradient></defs><rect width="300" height="240" fill="url(#rg)"/><rect y="190" width="300" height="50" fill="#f3b98a"/></svg>';
  }

  /* Khung hiển thị: phòng + vẹt. opts: {talk, size:'sm'|'md'|'lg', mood} */
  function render(eq, opts) {
    opts = opts || {};
    return '<div class="stage stage-' + (opts.size || 'md') + '">' + room((eq || {}).room) + '<div class="pwrap">' + parrot(eq, opts) + '</div></div>';
  }
  function head(eq) { return '<span class="mini-parrot">' + parrot(eq || {}, {}) + '</span>'; }

  window.MMIMascot = { render: render, parrot: parrot, head: head, room: room };
})();
