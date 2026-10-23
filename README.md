# MM-iTalk — Nhìn · Nghĩ · Nói

App luyện nói liên tục 3–5 phút cho học sinh Tiểu học (lớp 2–5) và THCS (lớp 6–9). Chạy trên Chrome (máy tính, Android), cài được lên máy như một ứng dụng. Không cần máy chủ, không có tài khoản; dữ liệu nằm trong trình duyệt của từng máy.

**Phiên bản 0.5.0:** thêm app **MM-iTalk Phụ huynh** (thư mục `phuhuynh/`, cài được lên điện thoại, chỉ xem báo cáo từ file xuất ở Khu cha mẹ, không có ghi âm). Trước đó (0.4.0): mỗi bài có 2 ví dụ mẫu (Cách cơ bản và ✨ Góc nhìn mới, nhiều bài nhân hóa) và cha mẹ có thể thêm ví dụ riêng; đủ 4 chặng, mỗi cấp 36 bài, vòng học 8 bước (không gõ chữ), mở khóa chặng bằng Thử thách, Nói tự do, và **Khu cha mẹ có mật khẩu** (báo cáo tổng quan, xem lại từng bài, đánh giá tiến bộ, mục AI đang chờ). **Ưu tiên máy tính (Chrome)**; điện thoại tạm thời chỉ để xem nội dung.

## Đưa lên GitHub Pages (kho riêng tên MM-iTalk)

1. Trên GitHub tạo kho mới tên **MM-iTalk**, chế độ **Public**. Không cần tick "Add a README".
2. Tải toàn bộ nội dung thư mục này lên kho (nút *Add file → Upload files*, kéo thả cả thư mục `css`, `js`, `icons` và các file lẻ), rồi *Commit changes*. Hoặc dùng git như đã làm với LotFTMO.
3. Vào *Settings → Pages*. Ở *Build and deployment* chọn *Deploy from a branch*, nhánh `main`, thư mục `/ (root)`, bấm *Save*.
4. Chờ 1–2 phút. Địa chỉ app sẽ là `https://<tên-tài-khoản>.github.io/MM-iTalk/`.
5. Mở bằng Chrome. Bấm biểu tượng cài đặt ở cuối thanh địa chỉ (hoặc menu ⋮ → *Cài đặt MM-iTalk*) để cài lên máy.

## Thử micro trước khi học

Mở `https://<tên-tài-khoản>.github.io/MM-iTalk/test-mic.html` (hoặc *Cài đặt → Mở trang thử micro* trong app). Hãy đọc liên tục 5 phút để xem nhận dạng giọng nói có bị ngắt giữa chừng không. Gửi lại kết quả (số từ, số lần tự nối lại, lỗi trong nhật ký) để chỉnh tiếp.

Lưu ý: không mở `index.html` bằng cách bấm đúp (địa chỉ `file://`), vì Chrome hạn chế micro ở đó. Hãy dùng địa chỉ GitHub Pages ở trên, hoặc chạy máy chủ nội bộ `localhost`.

## Cập nhật app

Mỗi lần sửa nội dung, đổi số phiên bản trong `sw.js` (dòng `var CACHE = 'mm-italk-v0.5.0';`) để máy đã cài tải bản mới.

## Cấu trúc

- `index.html`, `css/app.css`, `js/app.js`: giao diện và vòng học.
- `js/data-frames.js`: khung các ngăn ý và hàm `MMI_ADD` dựng bài học; `js/data-lessons-*.js`, `js/data-th-c1..c4.js`, `js/data-thcs-c1..c4.js`: nội dung bài (36 bài mỗi cấp, thêm bài mới bằng `MMI_ADD`).
- `js/data-misc.js`: chặng, lời động viên, cửa hàng, Góc cha mẹ.
- `phuhuynh/`: app phụ huynh chỉ-xem cho điện thoại (`index.html`, `viewer.js`, `sw.js`, manifest riêng); dùng lại `js/parent.js` ở chế độ chỉ xem, khóa lưu riêng `mmit:view`. Có SW riêng, nhớ đổi `CACHE` trong `phuhuynh/sw.js` khi sửa.
- `js/parent.js`: Khu cha mẹ (mật khẩu PBKDF2 lưu trong máy, báo cáo, xem lại bài, tab Ví dụ của cha mẹ).
- `js/samples-*.js`: bài mẫu viết lại + ví dụ "Góc nhìn mới" cho từng cấp × chặng (nạp bằng `MMI_SAMPLE`, sau các file bài học).
- `js/speech.js`: ghi âm, nhận dạng giọng nói, so sánh đọc to.
- `js/store.js`: lưu dữ liệu trong máy (localStorage và IndexedDB, khóa bắt đầu bằng `mmit`, không lẫn với app khác cùng tài khoản GitHub).
- `manifest.webmanifest`, `sw.js`, `icons/`: cài lên máy và chạy offline.

## Quyền riêng tư

Ghi âm chỉ lưu trong máy. Phần chuyển giọng nói thành chữ dùng dịch vụ nhận dạng của Chrome nên âm thanh được gửi qua mạng tới dịch vụ đó (Google) để xử lý.
