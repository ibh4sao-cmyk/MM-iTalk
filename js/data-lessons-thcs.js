/* MM-iTalk - Bài học THCS (lớp 6-9). */
window.MMI_LESSONS = window.MMI_LESSONS || [];
window.MMI_LESSONS.push(
{
  id: 'thcs-1-1', icon: '🚲', level: 'thcs', chang: 1, order: 1, kind: 'vat',
  title: 'Chiếc xe đạp của em',
  target: { min: 90, max: 150 }, hint: 1,
  task: 'Hãy nhìn một đồ vật quen thuộc, ví dụ chiếc xe đạp của em (hoặc cái đèn bàn, quyển sách em thích), rồi nói về nó khoảng 2 phút.',
  ngan: [
    { name: 'Giới thiệu',
      l1: 'Hôm nay em xin giới thiệu về ___ của em. Em có nó từ ___. Nó gắn bó với em trong ___.',
      l2: 'Xin chào cô và các bạn! Hôm nay em xin giới thiệu…',
      hint3: ['tên đồ vật', 'nguồn gốc', 'gắn bó từ khi nào'],
      kw: ['giới thiệu', 'của em', 'có từ', 'từ khi', 'tặng', 'mua', 'gắn bó', 'xin chào', 'hôm nay'] },
    { name: 'Nhìn từ xa và lại gần',
      l1: 'Nhìn từ xa, nó có màu ___ và dáng ___. Khi lại gần, em thấy ___.',
      l2: 'Nhìn từ xa, vật này…',
      hint3: ['màu sắc', 'dáng vẻ', 'chất liệu', 'chi tiết nhỏ', 'dấu vết sử dụng'],
      kw: ['nhìn từ xa', 'lại gần', 'màu', 'dáng', 'chất liệu', 'kim loại', 'sáng', 'bóng', 'vết', 'xước', 'sơn'] },
    { name: 'Các bộ phận',
      l1: 'Nó gồm các bộ phận chính: ___, ___ và ___. Bộ phận ___ giúp ___.',
      l2: 'Nó gồm nhiều bộ phận…',
      hint3: ['bộ phận chính', 'vị trí từng bộ phận', 'tác dụng của mỗi bộ phận'],
      kw: ['gồm', 'bộ phận', 'phía trước', 'phía sau', 'ở giữa', 'bánh', 'yên', 'tay lái', 'xích', 'bàn đạp', 'đèn', 'phanh'] },
    { name: 'Công dụng và cảm giác khi dùng',
      l1: 'Nó giúp em ___. Mỗi lần dùng, em cảm thấy ___.',
      l2: 'Vật này giúp em…',
      hint3: ['giúp ích gì', 'cảm giác khi dùng', 'một kỷ niệm nhỏ'],
      kw: ['giúp', 'tiết kiệm', 'sức khỏe', 'cảm thấy', 'gió', 'dễ chịu', 'vui', 'mỗi lần', 'công dụng'] },
    { name: 'Lời kết',
      l1: 'Em rất ___ nó vì ___. Em sẽ ___ để giữ gìn nó.',
      l2: 'Em rất yêu quý…',
      hint3: ['cảm nghĩ', 'lời hứa giữ gìn', 'lời cảm ơn'],
      kw: ['yêu quý', 'giữ gìn', 'lau chùi', 'cảm ơn', 'lắng nghe', 'sạch sẽ', 'luôn', 'em xin'] }
  ],
  sample: {
    paras: [
      'Xin chào cô và các bạn! Hôm nay em xin giới thiệu về chiếc xe đạp của em. Đây là món quà gia đình tặng em nhân dịp đầu năm học, và từ đó ngày nào em cũng đạp nó đến trường.',
      'Nhìn từ xa, chiếc xe có màu xanh dương, dáng thon gọn, khung xe bằng kim loại sáng bóng như một chú ngựa sắt nhỏ. Khi lại gần, em thấy lớp sơn còn mới, chỉ có vài vết xước nhỏ ở tay lái, đó là dấu vết của những lần em vội vàng dựng xe.',
      'Xe gồm nhiều bộ phận. Phía trước là tay lái và chiếc giỏ nhỏ để đựng cặp. Ở giữa là yên xe bọc da êm ái, bên dưới là bàn đạp nối với xích. Hai bánh xe tròn, lốp có những đường rãnh để bám đường tốt hơn. Phía sau có chiếc đèn đỏ để người đi sau nhìn thấy.',
      'Chiếc xe giúp em đến trường nhanh hơn, tiết kiệm thời gian và còn giúp em rèn luyện sức khỏe. Mỗi lần đạp xe, em thấy gió mát thổi vào mặt thật dễ chịu.',
      'Em rất yêu quý chiếc xe và sẽ luôn giữ gìn, lau chùi cho xe luôn sạch sẽ. Em xin cảm ơn cô và các bạn đã lắng nghe!'
    ],
    vocab: [
      { w: 'thon gọn', m: 'dáng nhỏ, gọn và cân đối', ex: 'Chiếc xe có dáng thon gọn.' },
      { w: 'êm ái', m: 'mềm và dễ chịu khi ngồi hoặc chạm vào', ex: 'Yên xe bọc da êm ái.' },
      { w: 'rãnh', m: 'đường lõm dài trên bề mặt', ex: 'Lốp xe có nhiều rãnh để bám đường.' },
      { w: 'rèn luyện', m: 'tập đi tập lại để khỏe hơn hoặc giỏi hơn', ex: 'Đạp xe giúp em rèn luyện sức khỏe.' },
      { w: 'dấu vết', m: 'điều còn lại cho biết có việc đã xảy ra', ex: 'Vết xước là dấu vết của lần dựng xe vội.' }
    ],
    more: ['Các rãnh trên lốp xe giúp tăng độ bám với mặt đường, nhất là khi đường ẩm.', 'Đạp xe là một cách tập thể dục tốt cho tim và đôi chân.'],
    tip: 'Quan sát hai lần: nhìn từ xa trước, rồi lại gần. Mỗi lần nhìn em sẽ thấy thêm những chi tiết mới để nói.'
  },
  pron: ['xích', 'sáng bóng', 'rãnh', 'trường', 'dáng'],
  parentQs: ['Vì sao con chọn đồ vật này? Nó có kỷ niệm gì không?', 'Con thấy bộ phận nào của nó quan trọng nhất? Vì sao?']
},
{
  id: 'thcs-1-2', icon: '🛣️', level: 'thcs', chang: 1, order: 2, kind: 'noi',
  title: 'Con đường đến trường',
  target: { min: 90, max: 150 }, hint: 1,
  task: 'Hãy nhớ lại con đường em đi đến trường mỗi ngày (hoặc một con đường quen thuộc quanh nhà), rồi tả nó khoảng 2 phút.',
  ngan: [
    { name: 'Giới thiệu con đường',
      l1: 'Hôm nay em xin kể về ___ em đi mỗi ngày. Con đường dài khoảng ___ và đi qua ___.',
      l2: 'Xin chào cô và các bạn! Hôm nay em xin kể về…',
      hint3: ['tên hoặc vị trí', 'độ dài', 'đi qua những đâu'],
      kw: ['kể về', 'con đường', 'mỗi ngày', 'dài', 'đi qua', 'khu phố', 'xin chào', 'hôm nay'] },
    { name: 'Cảnh vật hai bên đường',
      l1: 'Hai bên đường là ___, ___ và ___. Mặt đường ___.',
      l2: 'Hai bên đường có…',
      hint3: ['cây cối', 'nhà cửa, cửa hàng', 'mặt đường', 'biển báo, đèn tín hiệu'],
      kw: ['hai bên', 'cây', 'quán', 'nhà', 'hoa', 'mặt đường', 'phẳng', 'vạch', 'đèn', 'ngã tư'] },
    { name: 'Âm thanh và mùi hương',
      l1: 'Em nghe thấy ___. Em ngửi thấy mùi ___.',
      l2: 'Trên đường đi, em nghe thấy…',
      hint3: ['âm thanh', 'mùi hương', 'cảm giác của em'],
      kw: ['nghe', 'tiếng', 'ngửi', 'mùi', 'thơm', 'chim', 'chuông', 'rao', 'thoang thoảng'] },
    { name: 'Con đường theo từng thời điểm',
      l1: 'Buổi sáng, con đường ___. Giờ tan học thì ___. Những hôm mưa, ___.',
      l2: 'Con đường thay đổi theo từng thời điểm…',
      hint3: ['buổi sáng', 'giờ tan học', 'ngày mưa hoặc nắng'],
      kw: ['buổi sáng', 'tan học', 'mưa', 'nắng', 'đông', 'yên tĩnh', 'thay đổi', 'sáng sớm', 'tấp nập'] },
    { name: 'Điều em thích và lời kết',
      l1: 'Em thích nhất ___ vì ___. Con đường giúp em nhận ra ___.',
      l2: 'Em thích nhất…',
      hint3: ['điều em thích nhất', 'điều em nhận ra', 'lời cảm ơn'],
      kw: ['thích nhất', 'vì', 'nhận ra', 'cảm ơn', 'lắng nghe', 'mới mẻ', 'em xin'] }
  ],
  sample: {
    paras: [
      'Xin chào cô và các bạn! Hôm nay em xin kể về con đường em đi đến trường mỗi sáng. Con đường dài khoảng hai cây số, đi qua một khu phố nhỏ và một đoạn đường có hàng cây.',
      'Hai bên đường là những hàng cây phượng, vài quán ăn sáng mở cửa sớm và những ngôi nhà có giàn hoa giấy rực rỡ. Mặt đường khá phẳng, có vạch kẻ trắng và đèn tín hiệu ở ngã tư gần trường.',
      'Buổi sáng, em nghe tiếng chim hót trên cành, tiếng chuông xe đạp leng keng và tiếng rao của cô bán bánh mì. Mùi bánh mì nóng thoang thoảng bay ra từ quán ven đường.',
      'Con đường thay đổi theo từng thời điểm. Sáng sớm thì mát và yên tĩnh, giờ tan học thì đông vui, tấp nập học sinh. Những hôm mưa, mặt đường loang loáng nước và em phải đi chậm hơn.',
      'Em thích nhất những buổi sáng nắng nhẹ, khi cả con đường như bừng tỉnh. Con đường nhỏ giúp em nhận ra mỗi ngày đều có điều mới mẻ. Em xin cảm ơn cô và các bạn đã lắng nghe!'
    ],
    vocab: [
      { w: 'tấp nập', m: 'đông người qua lại, nhộn nhịp', ex: 'Giờ tan học, đường phố tấp nập.' },
      { w: 'loang loáng', m: 'sáng ướt, phản chiếu ánh sáng như có nước', ex: 'Mặt đường loang loáng nước mưa.' },
      { w: 'thoang thoảng', m: 'nhẹ nhàng, thoảng qua (nói về mùi)', ex: 'Mùi bánh mì thoang thoảng.' },
      { w: 'rực rỡ', m: 'có màu sắc tươi sáng, nổi bật', ex: 'Giàn hoa giấy rực rỡ.' },
      { w: 'leng keng', m: 'tiếng kim loại nhỏ va chạm vui tai', ex: 'Tiếng chuông xe đạp leng keng.' }
    ],
    more: ['Hoa giấy chịu nắng tốt nên có thể nở rực rỡ suốt mùa nắng.', 'Vạch kẻ đường và đèn tín hiệu giúp mọi người đi lại an toàn hơn.'],
    tip: 'Tả bằng nhiều giác quan: không chỉ nhìn mà còn nghe và ngửi. Chia con đường theo thời điểm (sáng, tan học, ngày mưa) cũng giúp em nói được lâu hơn.'
  },
  pron: ['loang loáng', 'thoang thoảng', 'tấp nập', 'leng keng', 'nắng nhẹ'],
  parentQs: ['Trên đường đi học, con nhớ nhất điều gì?', 'Nếu được thay đổi một điều trên con đường đó, con muốn đổi gì?']
},
{
  id: 'thcs-1-5', icon: '🌳', level: 'thcs', chang: 1, order: 5, kind: 'vat',
  title: 'Cây xanh trong sân trường',
  target: { min: 90, max: 150 }, hint: 2,
  task: 'Hãy nhìn một cái cây gần chỗ em (trong sân trường, trước nhà hoặc qua cửa sổ), rồi tả nó khoảng 2 phút.',
  ngan: [
    { name: 'Giới thiệu',
      l1: 'Trong sân trường em có một cây ___ mà em rất chú ý vì ___.',
      l2: 'Trong sân trường em có một cây… mà em rất chú ý vì…',
      hint3: ['tên cây', 'vị trí', 'vì sao em chú ý'],
      kw: ['có một cây', 'sân trường', 'chú ý', 'cây', 'vì', 'giới thiệu', 'xin chào'] },
    { name: 'Nhìn từ xa',
      l1: 'Đứng từ xa nhìn lại, cây có dáng ___, tán lá ___.',
      l2: 'Đứng từ xa nhìn lại, cây có dáng…',
      hint3: ['dáng cây', 'tán lá', 'so sánh hình ảnh'],
      kw: ['từ xa', 'dáng', 'tán', 'như', 'giống', 'xòe', 'khổng lồ', 'nắng', 'bóng'] },
    { name: 'Lại gần quan sát',
      l1: 'Khi đến gần, em thấy thân cây ___, cành ___, lá ___.',
      l2: 'Khi đến gần, em thấy thân cây…, cành…, lá…',
      hint3: ['thân cây', 'cành', 'lá', 'số đo cụ thể (mấy người ôm)'],
      kw: ['đến gần', 'lại gần', 'thân', 'cành', 'lá', 'sần sùi', 'nâu', 'xám', 'gân', 'xanh', 'ôm'] },
    { name: 'Cây mang lại gì',
      l1: 'Cây giúp chúng em ___ và ___.',
      l2: 'Cây giúp chúng em…',
      hint3: ['bóng mát', 'không khí', 'nơi chim đến', 'trò chơi dưới gốc'],
      kw: ['giúp', 'bóng mát', 'không khí', 'trong lành', 'chim', 'ra chơi', 'mát', 'gốc'] },
    { name: 'Lời kết',
      l1: 'Mỗi lần nhìn cây, em nghĩ ___. Vì vậy em sẽ ___.',
      l2: 'Mỗi lần nhìn cây, em nghĩ…',
      hint3: ['cảm nghĩ', 'việc em sẽ làm', 'lời cảm ơn'],
      kw: ['em nghĩ', 'giữ gìn', 'bảo vệ', 'cảm ơn', 'lắng nghe', 'vì vậy', 'em xin', 'âm thầm'] }
  ],
  sample: {
    paras: [
      'Xin chào cô và các bạn! Trong sân trường em có một cây bàng rất lớn mà em đặc biệt chú ý, vì nó đã đứng đó từ trước khi em vào trường và chứng kiến bao thế hệ học sinh.',
      'Đứng ở cổng trường nhìn vào, em thấy cây bàng như một chiếc ô khổng lồ xòe rộng giữa sân. Tán lá dày đến nỗi nắng chỉ rơi xuống thành những đốm sáng lung linh.',
      'Lại gần hơn, em thấy thân cây sần sùi, màu xám nâu, phải cần hai bạn ôm mới hết một vòng. Cành cây vươn ra nhiều phía, chia thành từng tầng. Những chiếc lá to như bàn tay, mặt trên xanh bóng, mặt dưới nhám và có những đường gân nổi rõ.',
      'Cây bàng mang lại cho chúng em bóng mát để chơi trò chơi dưới gốc vào giờ ra chơi. Cây còn giúp không khí trong lành hơn và là nơi các chú chim ghé đến mỗi sáng.',
      'Mỗi lần nhìn cây, em nghĩ rằng cây đã âm thầm cho đi rất nhiều mà không đòi hỏi gì. Vì vậy em và các bạn luôn nhắc nhau giữ gìn cây. Em xin cảm ơn cô và các bạn đã lắng nghe!'
    ],
    vocab: [
      { w: 'tán lá', m: 'phần lá xòe rộng ở trên cao của cây', ex: 'Tán lá che mát cả sân.' },
      { w: 'sần sùi', m: 'bề mặt gồ ghề, không nhẵn', ex: 'Thân cây sần sùi.' },
      { w: 'lung linh', m: 'sáng lấp lánh, đẹp mắt', ex: 'Nắng rơi thành những đốm sáng lung linh.' },
      { w: 'gân lá', m: 'đường nổi trên mặt lá, dẫn nước và chất dinh dưỡng', ex: 'Mặt dưới lá có gân nổi rõ.' },
      { w: 'âm thầm', m: 'lặng lẽ, không nói ra', ex: 'Cây âm thầm cho đi bóng mát.' }
    ],
    more: ['Dưới bóng cây thường mát hơn ngoài nắng vì tán lá che bớt ánh sáng mặt trời.', 'Cây bàng thay lá theo mùa: lá già chuyển màu rồi rụng để cây ra lá non.'],
    tip: 'Dùng ba kỹ thuật: quan sát hai lần (từ xa rồi lại gần), so sánh hình ảnh (như một chiếc ô khổng lồ) và dùng số đo cụ thể (hai bạn ôm mới hết một vòng).'
  },
  pron: ['sần sùi', 'xòe', 'lung linh', 'nhám', 'trong lành'],
  parentQs: ['Cây này có gì khiến con nhớ nhất? Con thường làm gì dưới bóng cây?', 'Theo con, vì sao chúng ta nên giữ gìn cây xanh?']
}
);
