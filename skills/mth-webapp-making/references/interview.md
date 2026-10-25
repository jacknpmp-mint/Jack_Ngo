# Phỏng vấn — danh sách câu hỏi

Cách hỏi: AskUserQuestion, ≤ 4 câu/lượt, 2–4 lựa chọn, phương án nên chọn đặt đầu và ghi "(Recommended)", mô tả ngắn hệ quả của từng lựa chọn. Chỉ hỏi điều **không đọc được** từ file / config / file bàn giao. Câu trả lời "Other" có thể là yêu cầu mới — đọc kỹ, làm theo đúng ý (vd người dùng trả lời "tôi sẽ gửi file xlsx" → chờ file rồi đọc, không đoán). Sau mỗi vòng ghi quyết định vào `app_spec.json` và vào mục "Quyết định đã chốt" của file bàn giao.

Nếu người dùng không trả lời một điểm và việc phải tiếp tục: dùng phương án đề xuất, ghi rõ "áp dụng phương án đề xuất — người dùng chưa trả lời, có thể đổi" trong file bàn giao.

## Vòng 1 — Cấu trúc dữ liệu (sau extract_xlsx + gen_config --init)

Chỉ hỏi những gì "CẦN XÁC NHẬN" báo + những gì suy đoán có rủi ro:
- Tiền tố bảng; sheet không theo tiền tố có phải bảng dữ liệu không.
- PK suy đoán (bảng không tô màu PK); FK suy đoán (trùng tên PK, không có dropdown); cột tô màu FK mà không tìm được bảng cha.
- Mẫu mã: `XX-NĂM-STT` (giao dịch) hay `XX-STT` (danh mục); tiền tố 2 chữ cho bảng chưa có dữ liệu.
- Cột công thức chỉ ở dòng 2: kéo công thức xuống (AUTO) hay để app tự tính khi để trống (calc)?
- Cột tên gây hiểu nhầm (vd `Invoice_code` nhưng là ngày) — ý nghĩa thật.
- Bảng nào là **danh mục** (chỉ Admin sửa, giữ bắt buộc): nhân sự, đầu việc chuẩn, phòng ban…
- Bảng nhân sự để đăng nhập: tên bảng, cột Email / Access_level / Active. Không có → app 1 người (AUTH tắt) hay thêm bảng?

## Vòng 2 — Nghiệp vụ

- Vòng đời chính (vd Lead → Báo giá → Dự án → Lô → Thanh toán; Nhân viên → Mục tiêu → KR → Việc; Yêu cầu mua → PO → Nhận hàng → Thanh toán).
- Cột bắt buộc ngoài PK/FK? (Mặc định: chỉ PK + FK quan hệ; cột khác "nên có" → cờ Thiếu dữ liệu.)
- Giá trị mặc định khi thêm mới (Status = …); cột tự điền người dùng hiện tại (Owner_id, Recorded_by).
- Cột tự tính: tỷ giá (VND = USD × hằng số), ngày (ETA = ETD + N), % × giá trị, số thứ tự kế tiếp.
- Tự điền khi chọn FK: cột nào lấy từ bản ghi cha (vd khách hàng ← lead: quốc gia, liên hệ, phụ trách).
- Quy tắc chặn lưu (vd chỉ Closed khi có bài học; lô phải cùng dự án) và quy tắc chỉ cảnh báo.
- Trạng thái "xong" của từng bảng việc; mốc hạn để cảnh báo; số ngày cảnh báo sớm.
- Trạng thái suy ra từ ngày (vd lô hàng: Start_Fab → Completed_Fab → ETD_actual → ETA_actual) hay có cột trạng thái.

## Vòng 3 — Giao diện, vai trò, Dashboard

- Ai xem (BGĐ / kế toán / PM / sales / HR / kho…) → bố cục: 1 trang nhiều tab (Recommended) / cuộn dài / tab mặc định theo vai trò.
- Mỗi tab cần thông tin gì (đưa lựa chọn cụ thể theo loại DB bên dưới).
- Bộ lọc (năm/quý, khách hàng, trạng thái, quốc gia, phòng ban…); tiền tệ (USD + nút VND); cửa sổ ngày (7/14/30/60).
- Mức chi tiết (vd Dự án → Lô → Đợt → lần thu); bản ghi không gắn cấp giữa hiển thị ở đâu ("Chung dự án").
- Kỳ lọc theo ngày nào: mỗi số theo ngày của chính nó (giống sheet Dashboard) / theo ngày ký / theo ngày phát sinh.
- Bấm một dòng → mở 360° đúng tab / chỉ xem / thêm nút thao tác nhanh.
- Menu: nhóm và thứ tự; bảng nào có trang 360°.

## Vòng 4 — Bàn giao

- Tên app, tên hiển thị, phụ đề VN/EN; phiên bản bắt đầu.
- Thư mục GitHub (mặc định `webapps/<tên_app>/` trong `jacknpmp-mint/Jack_Ngo`).
- Bật/tắt: phân quyền + nhật ký; cảnh báo; trang 360° (mặc định bật).

## Gợi ý theo loại database

**CRM / bán hàng / thầu**: pipeline theo trạng thái báo giá (giá trị, có trọng số Win_probability), tỷ lệ thắng theo quý, lead mới theo nguồn/quốc gia/ngành, việc thầu trễ hạn, khách hàng → dự án.
**Dự án / sản xuất / giao hàng**: HĐ ký / đã thu / còn phải thu / quá hạn, đợt đến hạn N ngày (Due_day + Pay_status), cây Dự án → Lô → Đợt, lô đang sản xuất / chờ xuất / đang vận chuyển, trễ ETD, tấn kế hoạch / thực tế, chi phí & biên LN, dòng tiền theo tháng. (Mẫu đã duyệt: LSB v2.6.)
**Nhân sự / OKR / công việc**: số nhân viên theo phòng ban/tình trạng, mục tiêu theo trạng thái (On track / At risk), tiến độ KR = Actual/Target, trọng số mục tiêu = 100%/người, việc trễ / sắp hạn theo người, việc xong theo tháng.
**Kho / mua hàng / tài chính**: tồn kho = nhập − xuất theo vật tư, dưới mức tối thiểu, PO chờ nhận, công nợ nhà cung cấp đến hạn, thu chi theo tháng, chênh lệch kế hoạch / thực tế.

## Câu hỏi mẫu (định dạng)

```
question: "Một shipment được coi là 'đến hạn thanh toán' theo mốc nào?"
header: "Hạn TT"
options:
  - label: "Due_day của payment_plan (Recommended)"
    description: "Mỗi đợt có ngày hạn; đến hạn khi tới Due_day mà chưa thu đủ"
  - label: "Theo ETD/ETA + điều khoản"
    description: "Hạn = ETD + N ngày; payment_plan chỉ để tham khảo"
```
