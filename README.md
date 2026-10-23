# MM-iTalk — Nhìn · Nghĩ · Nói

App luyện nói liên tục 3–5 phút cho học sinh Tiểu học (lớp 2–5) và THCS (lớp 6–9). Chạy trên Chrome (máy tính, Android), cài được lên máy như một ứng dụng. Không cần máy chủ, không có tài khoản; dữ liệu nằm trong trình duyệt của từng máy.

**Phiên bản 0.1.2 (bản chạy thử):** Chặng 1, mỗi cấp 3 bài, vòng học 8 bước (không có bước gõ chữ, chỉ nói), sao, cửa hàng, Sổ từ, Nhật ký, Góc cha mẹ.

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

Mỗi lần sửa nội dung, đổi số phiên bản trong `sw.js` (dòng `var CACHE = 'mm-italk-v0.1.2';`) để máy đã cài tải bản mới.

## Cấu trúc

- `index.html`, `css/app.css`, `js/app.js`: giao diện và vòng học.
- `js/data-lessons-th.js`, `js/data-lessons-thcs.js`: bài học (thêm bài mới ở đây).
- `js/data-misc.js`: chặng, lời động viên, cửa hàng, Góc cha mẹ.
- `js/speech.js`: ghi âm, nhận dạng giọng nói, so sánh đọc to.
- `js/store.js`: lưu dữ liệu trong máy (localStorage và IndexedDB, khóa bắt đầu bằng `mmit`, không lẫn với app khác cùng tài khoản GitHub).
- `manifest.webmanifest`, `sw.js`, `icons/`: cài lên máy và chạy offline.

## Quyền riêng tư

Ghi âm chỉ lưu trong máy. Phần chuyển giọng nói thành chữ dùng dịch vụ nhận dạng của Chrome nên âm thanh được gửi qua mạng tới dịch vụ đó (Google) để xử lý.
