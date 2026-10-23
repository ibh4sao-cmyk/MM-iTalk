/* MM-iTalk - Khung ngăn ý theo loại đề + bộ dựng bài học.
   Mỗi loại đề (vật, nơi, việc, hiện tượng) có khung 7 ngăn. Mỗi chặng chọn một số ngăn (3 đến 7).
   Bài mới chỉ cần khai báo nội dung riêng (đề, bài mẫu, từ hay...). Ngăn ý, gợi ý, mục tiêu được dựng ở đây. */
(function () {
  'use strict';
  window.MMI_LESSONS = window.MMI_LESSONS || [];

  /* name: [tên cho Tiểu học, tên cho THCS] */
  var F = {
    vat: [
      { name: ['Đây là gì?', 'Giới thiệu'], l1: 'Đây là ___. Em nhìn thấy (hoặc có) nó ở ___. Em biết nó từ ___.', l2: 'Xin chào các bạn! Hôm nay em xin giới thiệu…', h3: ['tên gọi', 'thấy ở đâu', 'biết từ khi nào'],
        kw: ['giới thiệu', 'đây là', 'xin chào', 'hôm nay', 'của em', 'nhìn thấy', 'từ khi', 'thường', 'tên', 'em biết'] },
      { name: ['Trông thế nào?', 'Quan sát bên ngoài'], l1: 'Nó có màu ___. Nó có hình ___ và to (nhỏ) cỡ ___. Nhìn kỹ, em thấy ___.', l2: 'Nhìn từ bên ngoài, nó…', h3: ['màu sắc', 'hình dáng', 'to hay nhỏ', 'chi tiết nổi bật'],
        kw: ['màu', 'hình', 'dáng', 'to', 'nhỏ', 'dài', 'tròn', 'nhìn', 'xanh', 'đỏ', 'vàng', 'trắng', 'sáng'] },
      { name: ['Sờ, ngửi, nghe', 'Các giác quan khác'], l1: 'Em sờ vào thấy ___. Em ngửi thấy mùi ___. Khi nó phát ra tiếng, em nghe ___.', l2: 'Ngoài việc nhìn, em còn…', h3: ['sờ thấy thế nào', 'mùi', 'âm thanh'],
        kw: ['sờ', 'mềm', 'cứng', 'mịn', 'nhẵn', 'ngửi', 'mùi', 'thơm', 'nghe', 'tiếng', 'âm thanh', 'nhẹ', 'nặng', 'lạnh', 'ấm'] },
      { name: ['Có những phần nào?', 'Các bộ phận'], l1: 'Nó gồm các phần: ___, ___ và ___. Phần ___ nằm ở ___.', l2: 'Nó gồm nhiều phần…', h3: ['phần chính', 'phần nhỏ', 'vị trí từng phần'],
        kw: ['gồm', 'phần', 'bộ phận', 'phía trước', 'phía sau', 'ở giữa', 'bên trên', 'bên dưới', 'một bên', 'cái'] },
      { name: ['Nó làm gì, giúp gì?', 'Công dụng, hoạt động'], l1: 'Nó dùng để (hoặc thường) ___. Cách dùng (hoặc cách hoạt động): ___. Nó giúp em ___.', l2: 'Nó thường… và giúp em…', h3: ['dùng để làm gì hoặc làm gì', 'cách dùng hoặc cách hoạt động', 'giúp ích gì'],
        kw: ['dùng', 'giúp', 'công dụng', 'để', 'cách', 'hoạt động', 'làm', 'ích', 'mỗi ngày', 'sử dụng'] },
      { name: ['Em thích vì sao?', 'Điều em thích'], l1: 'Em thích nó vì ___. Điều em thích nhất là ___. Em sẽ giữ gìn (chăm sóc) nó bằng cách ___.', l2: 'Em thích nó vì…', h3: ['vì sao thích', 'điều thích nhất', 'cách giữ gìn hoặc chăm sóc'],
        kw: ['thích', 'vì', 'yêu', 'quý', 'giữ gìn', 'chăm sóc', 'nhất', 'vui', 'cảm ơn', 'luôn'] },
      { name: ['Lời kết', 'Lời kết'], l1: 'Nói tóm lại, ___. Em xin cảm ơn ___ đã lắng nghe.', l2: 'Tóm lại, em…', h3: ['tóm tắt một câu', 'lời cảm ơn'],
        kw: ['tóm lại', 'cảm ơn', 'lắng nghe', 'kết thúc', 'cuối cùng', 'hẹn', 'em xin', 'nói tóm'] }
    ],
    noi: [
      { name: ['Đây là đâu?', 'Giới thiệu nơi này'], l1: 'Đây là ___. Nó nằm ở ___. Em đến đây khi ___.', l2: 'Xin chào các bạn! Hôm nay em xin kể về…', h3: ['tên nơi', 'ở đâu', 'khi nào em đến'],
        kw: ['giới thiệu', 'kể về', 'đây là', 'xin chào', 'hôm nay', 'nằm ở', 'ở', 'em đến', 'thường', 'tên'] },
      { name: ['Nhìn thấy gì?', 'Cảnh vật nhìn thấy'], l1: 'Nhìn quanh, em thấy ___, ___ và ___. Cảnh vật có màu ___.', l2: 'Nhìn quanh, em thấy…', h3: ['vật lớn nhất', 'vật nhỏ', 'màu sắc chung', 'ánh sáng'],
        kw: ['nhìn', 'thấy', 'màu', 'cây', 'nhà', 'sáng', 'rộng', 'xanh', 'cao', 'xung quanh', 'phía'] },
      { name: ['Nghe và ngửi', 'Âm thanh, mùi hương'], l1: 'Ở đây em nghe thấy ___. Em ngửi thấy mùi ___. Không khí ___.', l2: 'Ngoài việc nhìn, em còn nghe…', h3: ['âm thanh', 'mùi', 'không khí'],
        kw: ['nghe', 'tiếng', 'âm thanh', 'mùi', 'thơm', 'ngửi', 'không khí', 'mát', 'ồn', 'yên tĩnh', 'rì rào'] },
      { name: ['Có những chỗ nào?', 'Các khu vực'], l1: 'Nơi này có các khu: ___, ___ và ___. Chỗ ___ nằm ở ___.', l2: 'Nơi này chia thành…', h3: ['khu thứ nhất', 'khu thứ hai', 'vị trí', 'chỗ nổi bật'],
        kw: ['khu', 'chỗ', 'gồm', 'chia', 'phía', 'góc', 'ở giữa', 'bên trái', 'bên phải', 'cuối'] },
      { name: ['Mọi người làm gì?', 'Hoạt động ở đây'], l1: 'Ở đây mọi người ___. Em thường ___. Lúc ___ ở đây rất ___.', l2: 'Ở đây, mọi người…', h3: ['mọi người làm gì', 'em làm gì', 'lúc nào đông vui'],
        kw: ['mọi người', 'làm', 'chơi', 'học', 'đọc', 'đi', 'buổi', 'thường', 'em', 'vui', 'đông'] },
      { name: ['Em thích vì sao?', 'Điều em thích'], l1: 'Em thích nơi này vì ___. Chỗ em thích nhất là ___. Em sẽ giữ gìn nơi này bằng cách ___.', l2: 'Em thích nơi này vì…', h3: ['vì sao thích', 'chỗ thích nhất', 'cách giữ gìn'],
        kw: ['thích', 'vì', 'yêu', 'quý', 'giữ gìn', 'nhất', 'vui', 'cảm ơn', 'giữ sạch', 'luôn'] },
      { name: ['Lời kết', 'Lời kết'], l1: 'Nói tóm lại, ___. Em xin cảm ơn ___ đã lắng nghe.', l2: 'Tóm lại, em…', h3: ['tóm tắt một câu', 'lời cảm ơn'],
        kw: ['tóm lại', 'cảm ơn', 'lắng nghe', 'kết thúc', 'cuối cùng', 'hẹn', 'em xin', 'nói tóm'] }
    ],
    hien: [
      { name: ['Đó là gì?', 'Là gì, khi nào gặp'], l1: 'Đây là ___. Em thường gặp nó vào ___. Nó xuất hiện ở ___.', l2: 'Xin chào các bạn! Hôm nay em xin kể về…', h3: ['tên hiện tượng', 'gặp khi nào', 'gặp ở đâu'],
        kw: ['kể về', 'giới thiệu', 'đây là', 'xin chào', 'hôm nay', 'thường gặp', 'vào', 'mùa', 'buổi', 'xuất hiện'] },
      { name: ['Dấu hiệu nhận biết', 'Dấu hiệu nhận biết'], l1: 'Khi nó sắp đến, em thấy ___. Dấu hiệu dễ nhận ra là ___.', l2: 'Trước khi nó đến, em thường thấy…', h3: ['dấu hiệu trên trời', 'dấu hiệu dưới đất', 'dấu hiệu em cảm nhận'],
        kw: ['dấu hiệu', 'sắp', 'trước khi', 'bầu trời', 'mây', 'gió', 'nhận ra', 'thấy', 'báo', 'cảm nhận'] },
      { name: ['Diễn ra thế nào?', 'Nhìn, nghe, ngửi'], l1: 'Em thấy ___. Em nghe ___. Em ngửi thấy ___. Trên da em cảm thấy ___.', l2: 'Khi nó diễn ra, em…', h3: ['nhìn thấy', 'nghe thấy', 'ngửi thấy', 'cảm giác trên da'],
        kw: ['thấy', 'nghe', 'tiếng', 'mùi', 'ngửi', 'mát', 'ấm', 'lạnh', 'ướt', 'sáng', 'rơi', 'thổi'] },
      { name: ['Vì sao có?', 'Vì sao có hiện tượng này'], l1: 'Nó có là vì ___. Nói đơn giản, ___. Khi ___ thì ___.', l2: 'Nói đơn giản thì…', h3: ['nguyên nhân chính', 'giải thích đơn giản', 'ví dụ dễ hiểu'],
        kw: ['vì', 'nguyên nhân', 'do', 'nên', 'khi', 'thì', 'nói đơn giản', 'nhờ', 'bởi', 'giải thích'] },
      { name: ['Ảnh hưởng đến ai?', 'Ảnh hưởng đến cây cối, con vật, con người'], l1: 'Khi nó đến, cây cối ___. Con vật ___. Mọi người ___.', l2: 'Khi nó đến, mọi vật…', h3: ['cây cối', 'con vật', 'con người'],
        kw: ['cây', 'lá', 'hoa', 'con vật', 'chim', 'mọi người', 'em', 'ảnh hưởng', 'giúp', 'cần', 'thích'] },
      { name: ['Em cảm thấy thế nào?', 'Cảm nhận của em'], l1: 'Em cảm thấy ___ vì ___. Điều em thích nhất là ___.', l2: 'Mỗi lần gặp nó, em cảm thấy…', h3: ['cảm xúc', 'vì sao', 'điều thích nhất'],
        kw: ['cảm thấy', 'thích', 'vui', 'vì', 'nhất', 'yêu', 'mong', 'dễ chịu', 'thú vị'] },
      { name: ['Lời kết', 'Lời kết'], l1: 'Nói tóm lại, ___. Em xin cảm ơn ___ đã lắng nghe.', l2: 'Tóm lại, em…', h3: ['tóm tắt một câu', 'lời cảm ơn'],
        kw: ['tóm lại', 'cảm ơn', 'lắng nghe', 'kết thúc', 'cuối cùng', 'hẹn', 'em xin', 'nói tóm'] }
    ],
    viec: [
      { name: ['Việc gì, ở đâu?', 'Việc gì, ở đâu, khi nào'], l1: 'Hôm nay em kể về ___. Việc diễn ra ở ___ vào ___.', l2: 'Xin chào các bạn! Hôm nay em xin kể về…', h3: ['việc gì', 'ở đâu', 'khi nào'],
        kw: ['kể về', 'xin chào', 'hôm nay', 'diễn ra', 'vào', 'ở', 'khi', 'ngày', 'buổi', 'sáng', 'chiều'] },
      { name: ['Có những ai?', 'Ai tham gia'], l1: 'Có ___ cùng tham gia. Mỗi người làm ___. Em làm ___.', l2: 'Cùng tham gia với em có…', h3: ['những ai', 'mỗi người làm gì', 'em làm gì'],
        kw: ['cùng', 'bạn', 'cô', 'thầy', 'mẹ', 'bố', 'mọi người', 'tham gia', 'làm', 'em', 'nhóm'] },
      { name: ['Lúc bắt đầu', 'Lúc bắt đầu'], l1: 'Lúc đầu, ___. Trước khi làm, mọi người ___. Em cảm thấy ___.', l2: 'Lúc bắt đầu, mọi người…', h3: ['chuẩn bị gì', 'ai nói gì', 'em cảm thấy'],
        kw: ['lúc đầu', 'bắt đầu', 'trước khi', 'chuẩn bị', 'mang', 'xếp', 'hồi hộp', 'háo hức', 'đầu tiên'] },
      { name: ['Điều thú vị nhất', 'Điều thú vị nhất'], l1: 'Điều thú vị nhất là ___. Lúc đó em ___. Em nhớ nhất ___.', l2: 'Điều làm em thích thú nhất là…', h3: ['điều thú vị nhất', 'lúc đó em làm gì', 'điều nhớ nhất'],
        kw: ['thú vị', 'nhất', 'nhớ', 'lúc đó', 'vui', 'bất ngờ', 'cười', 'thích', 'đặc biệt'] },
      { name: ['Kết quả ra sao?', 'Kết quả'], l1: 'Cuối cùng, ___. Kết quả là ___. Mọi người ___.', l2: 'Cuối cùng, mọi việc…', h3: ['kết quả', 'mọi người thế nào', 'em thấy thế nào'],
        kw: ['cuối cùng', 'kết quả', 'xong', 'hoàn thành', 'sạch', 'đẹp', 'mọi người', 'vui', 'được'] },
      { name: ['Em học được gì?', 'Em học được gì'], l1: 'Qua việc này, em học được ___. Lần sau em sẽ ___.', l2: 'Qua việc này, em học được…', h3: ['điều học được', 'lần sau sẽ làm gì'],
        kw: ['học được', 'hiểu', 'bài học', 'lần sau', 'sẽ', 'nhớ', 'biết', 'cố gắng', 'qua việc'] },
      { name: ['Lời kết', 'Lời kết'], l1: 'Nói tóm lại, ___. Em xin cảm ơn ___ đã lắng nghe.', l2: 'Tóm lại, em…', h3: ['tóm tắt một câu', 'lời cảm ơn'],
        kw: ['tóm lại', 'cảm ơn', 'lắng nghe', 'kết thúc', 'cuối cùng', 'hẹn', 'em xin', 'nói tóm'] }
    ]
  };

  /* Chọn ngăn theo số ngăn của chặng */
  var PICK = {
    th: {
      vat:  { 3: [0, 1, 5], 4: [0, 1, 4, 5], 5: [0, 1, 4, 5, 6], 6: [0, 1, 3, 4, 5, 6] },
      noi:  { 3: [0, 1, 5], 4: [0, 1, 4, 5], 5: [0, 1, 4, 5, 6], 6: [0, 1, 3, 4, 5, 6] },
      hien: { 3: [0, 2, 5], 4: [0, 2, 4, 5], 5: [0, 2, 4, 5, 6], 6: [0, 1, 2, 4, 5, 6] },
      viec: { 3: [0, 3, 5], 4: [0, 2, 3, 5], 5: [0, 2, 3, 5, 6], 6: [0, 1, 2, 3, 5, 6] }
    },
    thcs: {
      vat:  { 5: [0, 1, 3, 4, 6], 6: [0, 1, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] },
      noi:  { 5: [0, 1, 3, 4, 6], 6: [0, 1, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] },
      hien: { 5: [0, 1, 2, 4, 6], 6: [0, 1, 2, 3, 4, 6], 7: [0, 1, 2, 3, 4, 5, 6] },
      viec: { 5: [0, 2, 3, 5, 6], 6: [0, 1, 2, 3, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] }
    }
  };

  /* Cấu hình từng chặng: số ngăn, mục tiêu thời gian (giây) */
  var CFG = {
    th: {
      1: { n: 3, t: [30, 60], ct: [60, 90] },
      2: { n: 4, t: [90, 120], ct: [120, 150] },
      3: { n: 5, t: [120, 180], ct: [180, 240] },
      4: { n: 6, t: [180, 240], ct: [240, 300] }
    },
    thcs: {
      1: { n: 5, t: [90, 150], ct: [120, 180] },
      2: { n: 6, t: [150, 210], ct: [180, 240] },
      3: { n: 7, t: [210, 270], ct: [240, 300] },
      4: { n: 7, t: [270, 330], ct: [300, 360] }
    }
  };
  function hintFor(chang, order) {
    var base = chang === 1 ? (order <= 4 ? 1 : 2) : chang + 1;
    if (order === 9) return chang === 1 ? 3 : Math.min(5, base + 1);
    return base;
  }

  function buildNgan(level, kind, n) {
    var idx = PICK[level][kind][n], li = level === 'th' ? 0 : 1;
    return idx.map(function (i) {
      var f = F[kind][i];
      return { name: f.name[li], l1: f.l1, l2: f.l2, hint3: f.h3.slice(), kw: f.kw.slice() };
    });
  }

  /* Nói tự do: trả về đầy đủ các ngăn ý của một loại (vật, nơi, hiện tượng, việc) */
  window.MMI_FREE = function (level, kind) {
    var li = level === 'th' ? 0 : 1, n = level === 'th' ? 6 : 7;
    return PICK[level][kind][n].map(function (i) {
      var f = F[kind][i];
      return { name: f.name[li], l1: f.l1, kw: f.kw.slice() };
    });
  };

  /* spec: {level, chang, order, kind, icon, title, task, sample:{paras, vocab:[[từ, nghĩa, ví dụ]], more, tip}, pron, parentQs} */
  window.MMI_ADD = function (spec) {
    var c = CFG[spec.level][spec.chang], challenge = spec.order === 9;
    var t = challenge ? c.ct : c.t;
    var L = {
      id: spec.level + '-' + spec.chang + '-' + spec.order, icon: spec.icon, level: spec.level, chang: spec.chang, order: spec.order,
      kind: spec.kind, challenge: challenge, title: spec.title, target: { min: t[0], max: t[1] }, hint: hintFor(spec.chang, spec.order),
      task: spec.task, ngan: buildNgan(spec.level, spec.kind, c.n),
      sample: {
        paras: spec.sample.paras,
        vocab: spec.sample.vocab.map(function (v) { return { w: v[0], m: v[1], ex: v[2] }; }),
        more: spec.sample.more, tip: spec.sample.tip
      },
      pron: spec.pron, parentQs: spec.parentQs
    };
    if (L.sample.paras.length !== L.ngan.length) { try { console.error('MMI_ADD: số đoạn bài mẫu khác số ngăn ở ' + L.id); } catch (e) {} }
    window.MMI_LESSONS.push(L);
  };
})();
