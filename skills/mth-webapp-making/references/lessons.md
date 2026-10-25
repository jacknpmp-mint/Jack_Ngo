# Bài học từ LSB CRM (v2.0 → v2.6) — kiểm lại trước khi giao

## Dữ liệu / Sheet
- openpyxl LƯU file → mất dropdown x14 (FK, Lists). Sửa xlsx bằng XML (xlsx_xml.py), openpyxl chỉ đọc.
- Công thức chỉ ở dòng 2 (dòng 3+ trống) → không phải AUTO thật; app tự tính khi để trống (calc) hoặc kéo công thức.
- Cột AUTO trong Sheet có thể trống (file mới tạo chưa tính) hoặc `#REF!` → server luôn tính lại từ cột gốc (vd năm từ Start_day, không từ cột Year; Collected từ LSB_paid, không từ Collected_USD).
- Công thức Sheet và logic app phải giống nhau (Pay_status: Paid → Overdue → Partial → Open) — ghi rõ ở "Cách tính".
- Dữ liệu thật hay chứa lỗi (lần thu trỏ đợt không tồn tại, % × HĐ ≠ số tiền, chi phí > HĐ, ngày ngược) → hiện ở "Kiểm tra dữ liệu", không âm thầm bỏ qua; báo người dùng.
- Bảng nhân sự file mẫu có thể chưa có Admin → nhắc thêm email thật Access_level = Admin trước khi mở app.
- Tên cột gây hiểu nhầm (Invoice_code là ngày) → hỏi, không đoán.

## Apps Script
- `executeAs: USER_ACCESSING` → người dùng phải được chia sẻ Sheet; Editor sửa thẳng Sheet được (không vào nhật ký).
- Triển khai xong phải tạo **Phiên bản mới** (Quản lý triển khai → ✏), nếu không link cũ vẫn chạy mã cũ. Số phiên bản hiện ở chân menu để người dùng kiểm.
- Tên file trong Apps Script không có đuôi; file mới phải tạo đúng loại (Tập lệnh / HTML).
- Mọi hàm nội bộ hậu tố `_`; chỉ `doGet`, `include`, `api`, `onOpen`, `menu*` là hàm công khai.
- Thứ tự nạp file .gs không đảm bảo → không dùng biến toàn cục của file khác ở cấp nạp file (chỉ trong hàm). Test "nạp ngược" kiểm điều này.

## Giao diện
- Không gắn `view.onclick` (view sống suốt app → rò handler sang trang khác); gắn vào phần tử con tạo mới mỗi lần vẽ.
- Nhãn song ngữ trong hằng số phải tính lúc vẽ (hàm), không lúc nạp.
- Bộ lọc / nút nằm ngoài vùng gắn sự kiện sẽ không chạy — gói cả trang trong 1 container (`#dash`) rồi gắn ở đó.
- localStorage trong iframe Apps Script có thể bị chặn → bọc try/catch, app vẫn chạy không nháp.
- Số năm / số thứ tự không định dạng phân cách nghìn (2,026).
- Bảng rộng trong `.table-wrap`; kiểm tràn ngang ở 390px.

## Test
- Playwright có ca "Nháp" thỉnh thoảng hết thời gian chờ rồi kéo theo ca sau → chạy lại; nếu lần 2 đạt thì ghi rõ "ca chập chờn, không liên quan thay đổi". Không sửa test cho xanh.
- Sau khi đổi giao diện, cập nhật ca test theo chữ mới (vd tiêu đề Dashboard) — không xóa ca.
- Xem ảnh chụp (`test/shots/`) cả VN và EN trước khi giao.

## Quy trình với người dùng
- Người dùng muốn **phỏng vấn đủ trước khi làm** và **duyệt bản mẫu** trước khi sửa script; câu trả lời "Other" có thể là hành động ("tôi sẽ gửi file xlsx") → chờ file, đọc, cập nhật bản mẫu theo cấu trúc thật.
- Khi nâng cấp: luôn ghi rõ **file nào MỚI / SỬA / không đổi** để dán nhanh và chính xác.
- Repo GitHub `jacknpmp-mint/Jack_Ngo` cũ chứa app khác (`src/` Leads/Customers/ToDos) — không liên quan bản đang chạy; app mới đặt ở `webapps/<tên>/`.
