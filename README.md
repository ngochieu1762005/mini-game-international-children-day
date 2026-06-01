# Website Quốc tế Thiếu nhi 1/6

Website tĩnh siêu cute dành cho ngày Quốc tế Thiếu nhi, có mini game chọn hộp quà bí mật.

## Cách chạy

Mở file `index.html` bằng trình duyệt.

## Tính năng

- Giao diện cute, có mây, bóng bay, gấu và hộp quà.
- Bé chọn 1 trong 6 hộp quà để nhận quà ngẫu nhiên.
- Sau khi bốc quà, website khóa lượt bằng `localStorage` trên trình duyệt.
- Muốn thêm lượt có 2 cách:
  - Nhập mật mã từ anh Hiếu.
  - Giải câu đố để mở thêm 1 lượt.

## Chỉnh quà và đáp án mở thêm lượt

- Sửa danh sách quà trong biến `gifts`.
- Mật mã và đáp án câu đố hiện không để dạng chữ thường trong code nữa.
- Nếu muốn đổi mật mã/đáp án, hãy tạo SHA-256 hash của đáp án sau khi viết thường, bỏ dấu và bỏ khoảng trắng, rồi thay vào `SECRET_CODE_HASH` hoặc `RIDDLE_ANSWER_HASHES` trong `script.js`.

Quy tắc chuẩn hóa: viết thường, bỏ dấu tiếng Việt, bỏ khoảng trắng, rồi mới băm SHA-256.

## Lưu ý quan trọng

Website này là web tĩnh, nên không khóa IP thật 100%. Nó khóa theo trình duyệt/thiết bị bằng `localStorage`.
Nếu muốn khóa chính xác mỗi IP chỉ được bốc 1 lần, cần thêm backend/database.


## Lưu ý về bảo mật

Bản này đã mã hóa đáp án bằng SHA-256 hash để khi mở DevTools/F12 không thấy mật mã và đáp án trực tiếp. Tuy nhiên đây vẫn là web tĩnh, nên không thể bảo mật tuyệt đối 100%. Người rành kỹ thuật vẫn có thể dò hash nếu đáp án quá dễ đoán. Muốn bảo mật thật sự cần đưa phần kiểm tra đáp án lên backend/server.
