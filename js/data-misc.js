/* MM-iTalk - Dữ liệu phụ: chặng, lời động viên, cửa hàng, hướng dẫn, góc cha mẹ */
window.MMI_DATA = {
  version: '0.2.0',
  chang: {
    th: [
      { n: 1, name: 'Khởi động', weeks: '1–3', time: '30–60 giây', ngan: 3, hint: 'Gợi ý đầy đủ rồi bớt dần', total: 9 },
      { n: 2, name: 'Tăng tốc', weeks: '4–6', time: '1,5–2 phút', ngan: 4, hint: 'Chỉ có từ khóa', total: 9 },
      { n: 3, name: 'Tự tin', weeks: '7–9', time: '2–3 phút', ngan: 5, hint: 'Chỉ có tên các ngăn ý', total: 9 },
      { n: 4, name: 'Bứt phá', weeks: '10–12', time: '3–4 phút', ngan: 6, hint: 'Chỉ có đề bài', total: 9 }
    ],
    thcs: [
      { n: 1, name: 'Khởi động', weeks: '1–3', time: '2 phút', ngan: 5, hint: 'Gợi ý đầy đủ rồi bớt dần', total: 9 },
      { n: 2, name: 'Tăng tốc', weeks: '4–6', time: '3 phút', ngan: 6, hint: 'Chỉ có từ khóa', total: 9 },
      { n: 3, name: 'Tự tin', weeks: '7–9', time: '4 phút', ngan: 7, hint: 'Chỉ có tên các ngăn ý', total: 9 },
      { n: 4, name: 'Bứt phá', weeks: '10–12', time: '5 phút', ngan: 7, hint: 'Chỉ có đề bài', total: 9 }
    ]
  },
  badges: ['Huy hiệu Khởi động', 'Huy hiệu Tăng tốc', 'Huy hiệu Tự tin', 'Huy hiệu Bứt phá'],
  kinds: { vat: 'Vật', viec: 'Việc', hien: 'Hiện tượng', noi: 'Nơi chốn' },
  kindIcon: { vat: '🎒', viec: '🎬', hien: '🌦️', noi: '🏫' },
  hintNames: {
    1: 'Câu mẫu có chỗ trống',
    2: 'Câu mở đầu',
    3: 'Từ khóa',
    4: 'Tên các ngăn ý',
    5: 'Chỉ có đề bài'
  },
  ganColors: ['#ff7a59', '#4c8dff', '#2fb67c', '#a56bff', '#f2a900', '#e8508a', '#1fa3b8'],

  encourage: {
    complete: [
      'Chúc mừng {name} đã cố gắng hoàn thành bài học hôm nay! Mỗi lần luyện tập là một bước tiến.',
      '{name} ơi, chúc mừng em vì đã nỗ lực đến phút cuối cùng. Vẹt con cảm ơn em nhiều!',
      'Chúc mừng em đã hoàn thành cả tám bước! Sự kiên trì của em thật đáng quý.',
      'Em đã dành thời gian luyện nói hôm nay, và đó là điều đáng tự hào. Chúc mừng {name}!',
      'Chúc mừng {name}! Em đã dám nói thành tiếng và làm đến cùng bài học này.',
      'Cảm ơn em đã cố gắng hôm nay. Mỗi bài hoàn thành là một viên gạch xây nên sự tự tin.',
      'Chúc mừng em đã hoàn thành bài học! Sự chăm chỉ của em đang được ghi nhận.',
      '{name} đã nỗ lực rất nhiều hôm nay. Vẹt con chúc mừng em!'
    ],
    longer: [
      'Lần hai em nói lâu hơn lần một khoảng {sec} giây. Chúc mừng sự cố gắng của em, nó đang có kết quả đấy!',
      'Em đã bổ sung thêm ý ở lần nói thứ hai. Chúc mừng {name} đã nỗ lực làm tốt hơn lần trước của chính mình!',
      'Nói lại mà nói được nhiều hơn cần rất nhiều cố gắng. Chúc mừng em nhé!',
      'Chúc mừng {name}! Sự kiên trì nói lại lần hai của em đã mang lại kết quả.',
      'Lần hai em cố gắng nói thêm, và điều đó thể hiện sự nỗ lực. Chúc mừng {name}!',
      'Em đã chịu khó nói rõ và nói thêm ở lần hai. Chúc mừng em!'
    ],
    steady: [
      'Hôm nay nói chưa thật trôi chảy cũng không sao. Em đã dám nói và hoàn thành bài, chúc mừng {name}!',
      'Chúc mừng em đã cố gắng nói lại lần hai. Lần sau mình thử thêm một ý nhỏ nhé!',
      'Em đã nỗ lực hoàn thành bài học, thế là đủ để vui rồi. Chúc mừng {name}!',
      'Mỗi lần nói là một lần luyện tập. Cảm ơn em đã kiên trì, chúc mừng em!',
      'Có hôm nói trôi chảy, có hôm vấp. Điều quan trọng là {name} đã cố gắng. Chúc mừng em!',
      'Em đã làm hết các bước hôm nay. Chúc mừng {name} đã kiên trì đến cuối!'
    ],
    vocab: [
      'Em đã dùng được từ mới trong bài của mình. Chúc mừng sự cố gắng học từ mới của {name}!',
      'Em vừa học thêm từ mới và đem ra dùng ngay. Chúc mừng em đã nỗ lực!',
      'Từ mới em học hôm nay đã xuất hiện trong lời nói của em. Chúc mừng {name} đã chăm chỉ ôn từ!',
      'Em dám dùng từ mới ngay sau khi học. Đó là sự cố gắng đáng khen, chúc mừng {name}!',
      'Chúc mừng em! Việc em chịu khó dùng từ mới sẽ giúp lời nói của em phong phú dần.'
    ],
    challenge: [
      'Chúc mừng {name} đã hoàn thành Thử thách! Em đã cố gắng rất nhiều để đi đến đây.',
      'Thử thách này không dễ, vậy mà em đã nỗ lực làm đến cùng. Chúc mừng em!',
      'Chặng này khép lại bằng một bài khó, và {name} đã kiên trì làm hết. Chúc mừng em và chào đón chặng mới!',
      'Em đã bước qua Thử thách bằng sự cố gắng của chính mình. Chúc mừng {name}, huy hiệu này là của em!',
      'Chúc mừng {name}! Em đã nói trọn vẹn bài Thử thách với rất ít gợi ý. Đó là kết quả của bao buổi luyện tập.',
      'Một Thử thách xong rồi! Cảm ơn em vì đã không bỏ cuộc. Chúc mừng {name}!'
    ],
    free: [
      'Em tự chọn một chủ đề và nói về nó. Chúc mừng {name} đã chủ động luyện nói!',
      'Nói tự do là một cách luyện rất tốt. Chúc mừng {name} đã cố gắng nói thêm hôm nay!',
      'Không có bài mẫu, không có gợi ý, em vẫn nói được. Chúc mừng sự chủ động của em!',
      'Em đã dành thêm thời gian luyện nói. Chúc mừng {name} vì sự chăm chỉ ấy!',
      'Chúc mừng em đã tự tìm chủ đề để kể. Mỗi lần nói là một lần tiến bộ!'
    ],
    weekly: [
      'Em đã luyện đủ 3 buổi trong tuần này. Chúc mừng sự chăm chỉ của {name}!',
      'Tem tuần đã đầy! Chúc mừng em vì đã kiên trì luyện tập đều đặn.',
      'Ba buổi trong một tuần là một nỗ lực lớn. Chúc mừng {name}!'
    ],
    comeback: [
      'Chào mừng {name} trở lại! Chúc mừng em đã cố gắng bắt đầu lại hôm nay. Mình cùng đi tiếp nhé.',
      'Rất vui được gặp lại em! Chúc mừng em đã quay lại luyện tập.'
    ],
    repeat: [
      'Em đã luyện lại bài cũ. Chúc mừng sự cố gắng ôn tập của {name}!',
      'Ôn lại bài cũ cũng là một cách nỗ lực. Chúc mừng em nhé!',
      'Em chịu khó luyện lại để nói tốt hơn. Chúc mừng {name} vì đã không ngại làm lại!',
      'Luyện lại bài cũ cần sự kiên nhẫn. Chúc mừng em đã làm được!'
    ]
  },

  shop: [
    { id: 'hat-cap', type: 'hat', name: 'Mũ lưỡi trai', price: 10 },
    { id: 'hat-party', type: 'hat', name: 'Mũ tiệc', price: 15 },
    { id: 'hat-crown', type: 'hat', name: 'Vương miện', price: 30 },
    { id: 'gl-round', type: 'glasses', name: 'Kính tròn', price: 15 },
    { id: 'gl-star', type: 'glasses', name: 'Kính ngôi sao', price: 25 },
    { id: 'sc-red', type: 'scarf', name: 'Khăn đỏ', price: 12 },
    { id: 'sc-rainbow', type: 'scarf', name: 'Khăn cầu vồng', price: 25 },
    { id: 'room-garden', type: 'room', name: 'Phòng vườn', price: 20 },
    { id: 'room-sea', type: 'room', name: 'Phòng biển', price: 30 },
    { id: 'room-space', type: 'room', name: 'Phòng vũ trụ', price: 50 },
    { id: 'fx-confetti', type: 'fx', name: 'Pháo giấy', price: 40 }
  ],
  shopTypes: { hat: 'Mũ', glasses: 'Kính', scarf: 'Khăn', room: 'Phòng', fx: 'Hiệu ứng' },

  guide: {
    th: [
      { icon: '👀', title: 'Nhìn thật kỹ', text: 'Chọn một vật thật ở gần em: cái cặp, con mèo, bông hoa… Nhìn và sờ thử xem nó như thế nào.' },
      { icon: '🪜', title: 'Đọc gợi ý', text: 'Gợi ý giống như cái thang giúp em leo lên. Ở các bài đầu, thang có rất nhiều nấc. Các bài sau thang ít nấc dần, vì em đã khỏe hơn.' },
      { icon: '🦜', title: 'Nói cho Vẹt con nghe', text: 'Vẹt con chưa biết gì cả! Em hãy giải thích thật rõ để bạn ấy hiểu. Bấm nút thu âm và nói to, rõ.' },
      { icon: '🔍', title: 'Nghe lại và xem bài mẫu', text: 'Nghe lại lời em nói, xem chỗ nào em còn vấp. Sau đó đọc bài mẫu để học thêm từ hay và cách nói.' },
      { icon: '🌟', title: 'Nói lại lần hai', text: 'Em nói lần hai thật hay hơn lần một, dùng thêm ý và từ mới em vừa học. Xong bài là nhận sao!' }
    ],
    thcs: [
      { icon: '🔭', title: 'Quan sát có chủ đích', text: 'Chọn một sự vật, sự việc hoặc hiện tượng quanh em. Quan sát bằng nhiều giác quan và ghi nhớ những chi tiết đáng chú ý.' },
      { icon: '🪜', title: 'Gợi ý giảm dần', text: 'Ở các bài đầu, em có câu mẫu và từ khóa. Càng về sau, gợi ý càng ít để em tự xây dựng ý. Cuối cùng em chỉ nhận đề bài.' },
      { icon: '🎙️', title: 'Giải thích cho người chưa biết', text: 'Hãy tưởng tượng người nghe chưa biết gì về chủ đề. Nếu em giải thích rõ được cho họ, nghĩa là em đã hiểu thật sự. Đó là phương pháp Feynman.' },
      { icon: '🔍', title: 'Soi lại và học từ bài mẫu', text: 'Nghe lại, tự đánh dấu chỗ vấp và ngăn ý còn thiếu. Rồi đọc bài mẫu để học cấu trúc, từ ngữ và kỹ thuật diễn đạt.' },
      { icon: '🌟', title: 'Nói lại lần hai', text: 'Nói lần hai tốt hơn lần một: thêm ý còn thiếu, dùng từ mới, thêm ví dụ hoặc so sánh. App chỉ luyện nói, em không cần gõ chữ.' }
    ]
  },

  parent: {
    role: 'Vai trò của cha mẹ: làm "người nghe" như chú Vẹt con chưa biết gì, không phải người chấm bài.',
    do: [
      'Giữ 20–35 phút yên tĩnh, tắt tivi; học 3 buổi mỗi tuần vào giờ quen thuộc.',
      'Đưa vật thật cho con quan sát trước khi nói.',
      'Khi con nói lần hai, ngồi nghe, gật đầu và chỉ hỏi một câu mở như "Con kể thêm về … được không?"',
      'Khen đúng sự nỗ lực, nêu việc cụ thể: "Con đã nói hết cả 3 phần."',
      'Cuối buổi hỏi: "Hôm nay con học được từ mới nào?"',
      'Con lớp 2–3: ngồi cạnh khi con đọc gợi ý. Con lớp 4 trở lên: để con tự làm, chỉ nghe khi con muốn.'
    ],
    avoid: [
      'Sửa lỗi ngay khi con đang nói, hoặc ngắt lời.',
      'Ép con nói đủ giờ; nếu con dừng sớm, để con nói lại lần sau.',
      'So sánh anh chị em; dùng sao để đe dọa hay phạt.'
    ],
    privacy: 'Ghi âm chỉ lưu trong máy này. Tuy nhiên phần chuyển giọng nói thành chữ dùng dịch vụ nhận dạng giọng nói của Chrome, nên âm thanh được gửi qua mạng tới dịch vụ đó để xử lý và máy cần có kết nối mạng. Chế độ nói tự do không được app lọc nội dung, nên cha mẹ nên thỉnh thoảng xem con nói gì.'
  },

  connectors: ['và', 'nhưng', 'vì', 'nên', 'khi', 'rồi', 'sau đó', 'còn', 'tuy nhiên', 'ngoài ra', 'đặc biệt', 'vì vậy', 'cuối cùng', 'trước tiên']
};
