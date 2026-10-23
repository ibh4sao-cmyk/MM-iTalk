/* MM-iTalk - Bài học Tiểu học (lớp 2-5). Gợi ý: hint 1 = đầy đủ nhất ... 5 = không gợi ý. */
window.MMI_LESSONS = window.MMI_LESSONS || [];
window.MMI_LESSONS.push(
{
  id: 'th-1-1', icon: '🎒', level: 'th', chang: 1, order: 1, kind: 'vat',
  title: 'Chiếc cặp sách của em',
  target: { min: 30, max: 60 }, hint: 1,
  task: 'Hãy cầm hoặc nhìn chiếc cặp sách của em (hoặc một đồ vật khác em thích) rồi nói về nó cho Vẹt con nghe.',
  ngan: [
    { name: 'Đây là gì?',
      l1: 'Đây là chiếc ___ của em. Em có nó từ ___. Ngày nào em cũng mang nó đến ___.',
      l2: 'Xin chào các bạn! Hôm nay em xin giới thiệu…',
      hint3: ['tên đồ vật', 'có từ khi nào', 'mang đi đâu'],
      kw: ['của em', 'cặp', 'mua', 'từ khi', 'đi học', 'mỗi ngày', 'ngày nào', 'đeo', 'mang', 'giới thiệu'] },
    { name: 'Trông thế nào?',
      l1: 'Chiếc cặp có màu ___. Nó có hình ___. Trên cặp có ___. Em sờ vào cặp thấy ___.',
      l2: 'Nhìn từ bên ngoài, chiếc cặp…',
      hint3: ['màu sắc', 'hình dáng', 'quai đeo', 'ngăn', 'sờ thấy mềm hay cứng'],
      kw: ['màu', 'hình', 'quai', 'khóa', 'ngăn', 'mềm', 'mịn', 'bóng', 'nhẹ', 'nặng', 'xanh', 'đỏ', 'sờ', 'to', 'nhỏ'] },
    { name: 'Em thích vì sao?',
      l1: 'Em thích chiếc cặp vì ___. Em sẽ giữ gìn nó bằng cách ___.',
      l2: 'Em rất thích chiếc cặp này vì…',
      hint3: ['vì sao em thích', 'cách giữ gìn', 'lời cảm ơn'],
      kw: ['thích', 'vì', 'giữ gìn', 'yêu', 'cảm ơn', 'sạch', 'gọn', 'cố gắng'] }
  ],
  sample: {
    paras: [
      'Xin chào các bạn! Hôm nay em xin giới thiệu chiếc cặp sách của em. Mẹ mua cho em từ đầu năm học, và ngày nào em cũng đeo nó đến trường.',
      'Chiếc cặp của em có màu xanh da trời, giống như bầu trời buổi sáng. Cặp có hình chữ nhật, hai chiếc quai đeo mềm mại và một ngăn lớn để đựng sách vở. Trên nắp cặp có hình một chú gấu nâu rất đáng yêu. Em sờ vào cặp thấy vải mịn và hơi bóng.',
      'Em rất thích chiếc cặp này vì nó giúp em mang sách vở đi học mỗi ngày. Em sẽ giữ gìn cặp thật sạch sẽ và gọn gàng. Em cảm ơn các bạn đã lắng nghe!'
    ],
    vocab: [
      { w: 'mềm mại', m: 'nhẹ nhàng và êm khi sờ vào', ex: 'Hai quai cặp rất mềm mại.' },
      { w: 'đáng yêu', m: 'khiến người ta muốn thương, muốn quý', ex: 'Chú gấu nâu rất đáng yêu.' },
      { w: 'giữ gìn', m: 'cất giữ cẩn thận để không bị hỏng', ex: 'Em giữ gìn sách vở sạch sẽ.' },
      { w: 'mịn', m: 'bề mặt nhẵn, không sần sùi', ex: 'Vải cặp rất mịn.' }
    ],
    more: ['Đeo cả hai quai giúp hai vai chịu sức đều nhau, lưng đỡ mỏi hơn so với đeo một quai.'],
    tip: 'Dùng "giống như…" để so sánh, ví dụ "màu xanh giống như bầu trời". Ở lần nói thứ hai, em hãy dùng ít nhất một câu so sánh.'
  },
  pron: ['xanh', 'sờ', 'sạch sẽ', 'gọn gàng', 'lắng nghe'],
  parentQs: ['Chiếc cặp này đã cùng con đi những đâu?', 'Trong cặp của con, đồ vật nào con thích nhất?']
},
{
  id: 'th-1-2', icon: '🐱', level: 'th', chang: 1, order: 2, kind: 'vat',
  title: 'Chú mèo đáng yêu',
  target: { min: 30, max: 60 }, hint: 1,
  task: 'Hãy chọn một chú mèo em quen biết (ở nhà em, nhà hàng xóm, trong hình hoặc đồ chơi) rồi kể về chú cho Vẹt con nghe. Em cũng có thể chọn một con vật khác em thích.',
  ngan: [
    { name: 'Đây là ai?',
      l1: 'Đây là chú ___ của em. Tên chú là ___. Chú ở nhà em từ ___.',
      l2: 'Xin chào các bạn! Hôm nay em xin giới thiệu một chú mèo…',
      hint3: ['tên chú', 'ở đâu', 'từ khi nào'],
      kw: ['tên', 'chú', 'mèo', 'ở nhà', 'từ khi', 'giới thiệu', 'nuôi', 'em yêu'] },
    { name: 'Trông thế nào?',
      l1: 'Bộ lông của chú màu ___. Đôi mắt chú ___. Cái đuôi ___. Em vuốt ve chú thấy ___.',
      l2: 'Nhìn kỹ chú mèo, em thấy…',
      hint3: ['bộ lông', 'đôi mắt', 'cái đuôi', 'râu', 'tiếng kêu', 'cảm giác khi vuốt ve'],
      kw: ['lông', 'mắt', 'đuôi', 'râu', 'tai', 'mềm', 'màu', 'tròn', 'vuốt', 'kêu', 'gừ', 'chân'] },
    { name: 'Em thích vì sao?',
      l1: 'Em thích chú vì ___. Em sẽ chăm sóc chú bằng cách ___.',
      l2: 'Em thích chú mèo này vì…',
      hint3: ['vì sao em thích', 'cách chăm sóc', 'lời cảm ơn'],
      kw: ['thích', 'vì', 'chăm sóc', 'cho ăn', 'ngoan', 'yêu', 'cảm ơn', 'sạch'] }
  ],
  sample: {
    paras: [
      'Xin chào các bạn! Hôm nay em xin giới thiệu một chú mèo mà em rất yêu quý. Chú tên là Mướp, ở cùng nhà với em từ khi em học lớp một.',
      'Mướp có bộ lông màu vàng, mềm như một cuộn bông. Đôi mắt Mướp tròn xoe, sáng long lanh. Cái đuôi dài của Mướp lúc nào cũng vẫy qua vẫy lại. Khi em vuốt ve, em nghe thấy tiếng kêu gừ gừ rất vui tai.',
      'Em thích Mướp vì chú rất ngoan và hay quấn quýt bên em. Em sẽ cho Mướp ăn đúng giờ và giữ cho chú luôn sạch sẽ. Em cảm ơn các bạn đã lắng nghe!'
    ],
    vocab: [
      { w: 'tròn xoe', m: 'tròn và to, trông rất ngạc nhiên hoặc tò mò', ex: 'Đôi mắt chú mèo tròn xoe.' },
      { w: 'long lanh', m: 'sáng và lấp lánh', ex: 'Mắt bé long lanh như hai hạt nước.' },
      { w: 'quấn quýt', m: 'luôn ở bên cạnh vì quý mến', ex: 'Chú mèo quấn quýt bên em.' },
      { w: 'vuốt ve', m: 'nhẹ nhàng đưa tay xoa lên người', ex: 'Em vuốt ve bộ lông mềm của chú.' }
    ],
    more: ['Râu của mèo giúp nó cảm nhận xung quanh, nhất là khi trời tối.'],
    tip: 'Hãy dùng những từ gợi âm thanh và hình ảnh như "gừ gừ", "long lanh". Chúng làm lời nói của em sống động hơn.'
  },
  pron: ['long lanh', 'lông', 'quấn quýt', 'vuốt ve', 'nuôi'],
  parentQs: ['Con thấy con vật nào đáng yêu nhất? Vì sao?', 'Nếu nuôi một con vật, con sẽ chăm sóc nó như thế nào?']
},
{
  id: 'th-1-5', icon: '🌹', level: 'th', chang: 1, order: 5, kind: 'vat',
  title: 'Bông hoa hồng',
  target: { min: 30, max: 60 }, hint: 2,
  task: 'Hãy nhìn một bông hoa (hoa hồng hoặc một loài hoa khác em thích), có thể là hoa thật hoặc hoa trong hình, rồi nói về nó.',
  ngan: [
    { name: 'Đây là gì?',
      l1: 'Đây là bông hoa ___. Em nhìn thấy nó ở ___. Nó nở vào ___.',
      l2: 'Xin chào các bạn! Hôm nay em muốn tả một bông hoa…',
      hint3: ['tên loài hoa', 'thấy ở đâu', 'khi nào'],
      kw: ['hoa', 'hồng', 'thấy', 'ở', 'vườn', 'nở', 'buổi sáng', 'giới thiệu', 'tả'] },
    { name: 'Trông thế nào?',
      l1: 'Hoa có màu ___. Cánh hoa ___. Cuống hoa ___. Em ngửi thấy mùi ___.',
      l2: 'Bông hoa trông thật…',
      hint3: ['màu sắc', 'cánh hoa', 'cuống và gai', 'mùi thơm'],
      kw: ['màu', 'cánh', 'cuống', 'gai', 'lá', 'thơm', 'mùi', 'đỏ', 'hồng', 'vàng', 'xếp', 'nụ'] },
    { name: 'Em thích vì sao?',
      l1: 'Em thích bông hoa vì ___. Em sẽ chăm sóc cây hoa bằng cách ___.',
      l2: 'Em thích bông hoa này vì…',
      hint3: ['vì sao em thích', 'cách chăm sóc', 'lời cảm ơn'],
      kw: ['thích', 'vì', 'chăm sóc', 'tưới', 'đẹp', 'thơm', 'cảm ơn', 'yêu'] }
  ],
  sample: {
    paras: [
      'Xin chào các bạn! Hôm nay em muốn tả một bông hoa hồng ở vườn nhà bà. Em thấy nó nở vào một buổi sáng đầu thu.',
      'Bông hồng có màu đỏ thắm, những cánh hoa xếp lớp như một chiếc váy xòe. Cuống hoa dài, có nhiều gai nhỏ và nhọn nên em phải cẩn thận khi chạm vào. Em cúi xuống ngửi thấy mùi thơm dịu nhẹ.',
      'Em thích bông hồng vì nó rất đẹp và thơm. Em sẽ tưới nước cho cây mỗi ngày để hoa nở thật lâu. Em cảm ơn các bạn đã lắng nghe!'
    ],
    vocab: [
      { w: 'đỏ thắm', m: 'màu đỏ đậm, tươi và đẹp', ex: 'Bông hồng đỏ thắm.' },
      { w: 'xếp lớp', m: 'chồng lên nhau thành từng tầng', ex: 'Cánh hoa xếp lớp như chiếc váy.' },
      { w: 'cuống hoa', m: 'phần cuống nối bông hoa với cành', ex: 'Cuống hoa dài và có gai.' },
      { w: 'dịu nhẹ', m: 'nhẹ nhàng, dễ chịu, không gắt', ex: 'Mùi thơm dịu nhẹ.' }
    ],
    more: ['Gai trên cây hoa hồng giúp cây tự bảo vệ trước những con vật muốn ăn nó.'],
    tip: 'Ngoài dùng mắt để nhìn, em hãy nói thêm một giác quan khác, ví dụ mùi hương. Một giác quan mới thêm một ý để nói.'
  },
  pron: ['xòe', 'cuống', 'nhọn', 'xếp lớp', 'dịu nhẹ'],
  parentQs: ['Con đã từng ngắm một loài hoa nào và thấy thích nhất?', 'Nếu có một khu vườn nhỏ, con muốn trồng gì?']
}
);
