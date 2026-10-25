# LSB CRM · Bidding · Project — Web App v3.0 (Google Sheets + Apps Script)

Web App quản lý trọn vòng đời bán thầu của LSB (Lead → Đánh giá → Báo giá → Chiến lược / Hành động → Kết quả → Khách hàng → Dự án → Lô hàng → Thanh toán → Chi phí → Bài học) trên file **LSB_CRM_Bidding_Project_DB_v4.6.xlsx** (16 bảng / 206 cột). Dựng bằng bộ khung `mth-webapp-making`.

**Đây là app MỚI**, chạy song song với Web App v2.6 đang vận hành (v2.6 dùng file v4.5_Project, 11 bảng). Tạo Google Sheet + dự án Apps Script **riêng**, không dán đè lên v2.6.

| Nhóm menu | Bảng |
| --- | --- |
| Bán hàng & thầu | LSB_Lead · LSB_Lead_Qualifying · LSB_Quotation · LSB_Bidding_strategy · LSB_Bidding_action_plan · LSB_Result_Lesson |
| Khách hàng & dự án | LSB_Customer · LSB_project · LSB_Project_task · LSB_shipment · LSB_Project_handover_lesson |
| Tài chính | LSB_payment_plan · LSB_paid · LSB_cost |
| Danh mục (chỉ Admin sửa) | LSB_Staff · LSB_Task |

## 0. Phiên bản v3.0 (cài đặt lần đầu)

**File dữ liệu v4.6** (sửa từ v4.2 bằng XML, giữ nguyên dropdown, `tools/fix_lsb_v46.py`):

| Bảng.Cột | v4.2 | v4.6 |
| --- | --- | --- |
| LSB_project.D | `Quotation_code` (FK mềm) | **`Quotation_LSB-Code`** — mã báo giá nội bộ nhập tay, so với `LSB_Quotation.Quotation_LSB_Code` |
| LSB_Result_Lesson.L `Project_id` | công thức `#REF!` | **FK chọn tay** (dropdown LSB_project) |
| LSB_cost.G | `Invoice_code` (ngày) | **`Invoice_no`** (số hóa đơn, text) — ô ngày mẫu ở CO-2026-001 đã xóa |
| LSB_cost.Year / Quarter | theo Invoice_code | theo **Payment_day** |
| ERD_Dictionary | | cập nhật các dòng trên, cột "Thay đổi" |

**24 file trong Apps Script** (tất cả MỚI — xem `CHANGED_FILES.md`). Riêng của LSB: `20_Lsb.gs`, `Custom.html`; sinh từ file dữ liệu: `01_Config.gs`, `12_Labels.gs`; còn lại là lõi bộ khung.

**Nội dung chính**
- Menu + danh sách + form cho cả 16 bảng; form có nháp tự lưu, mã dự kiến, FK điền theo ngữ cảnh, chỉ bắt buộc PK + FK, cờ *Thiếu dữ liệu*; song ngữ VN/EN; phân quyền theo LSB_Staff; nhật ký thay đổi; cảnh báo theo hạn.
- **Dashboard 6 tab** (bản mẫu v3.0 đã duyệt): Tổng quan · **Thầu & pipeline (mới)** · Công nợ & thu tiền · Sản xuất & giao hàng · Khách hàng & thị trường · Kiểm tra dữ liệu. Lọc Năm/Quý, Khách hàng, Trạng thái DA, Quốc gia; USD/VND; cửa sổ 7/14/30/60 ngày.
- **Dự án 360°** có KPI tài chính, tab Thông tin / Đầu việc / Lô hàng / Thanh toán / Chi phí / Bài học / Nhật ký. Các bảng khác dùng 360° chung (bản ghi + cha + con + nhật ký).
- Quy tắc nghiệp vụ kế thừa v2.2 / v2.6 (mục 3).

**Quy ước tính đã chốt**

| Số liệu | Cách tính |
| --- | --- |
| Pipeline / có trọng số | Báo giá Status ∈ Draft, Submitted, Negotiating · Σ Value_USD / Σ Value_USD × Win_probability (tại hôm nay) |
| Tỷ lệ thắng | Won / (Won + Lost) theo `LSB_Result_Lesson.Result_day` trong kỳ |
| Báo giá phát hành | theo `Issue_day` |
| HĐ ký · Đã thu · Chi phí · Tấn đã xuất | theo Contract_day · Payment_day · **LSB_cost.Payment_day** · ETD_actual |
| Trạng thái đợt TT | như công thức Pay_status: Paid → Overdue → Partial → Open |
| Tình trạng lô | suy từ Start_Fab → Completed_Fab → ETD_actual → ETA_actual (trống = ETD_actual + 14) |
| VND | = USD × 26000 khi để trống (Value / Contract / Payment / Paid / Cost) |

## 1. Cài đặt lần đầu (khoảng 15 phút)

1. **Dữ liệu**: tải `LSB_CRM_Bidding_Project_DB_v4.6.xlsx` lên Google Drive → mở bằng Google Sheets → Tệp → *Lưu dưới dạng Google Trang tính*.
2. **Admin**: sheet `LSB_Staff` hiện **chưa có Admin** (ST-001, ST-002 là Editor, email mẫu). Thêm dòng email Google thật của bạn: `Access_level = Admin`, `Active = Y`.
3. **Apps Script**: Tiện ích mở rộng → Apps Script. Xóa `Code.gs` mặc định. Tạo **23 file** theo thư mục `src/` (trừ `appsscript.json`):
   - File `.gs`: **+** → *Tập lệnh*. File `.html`: **+** → *HTML*. Tên không kèm đuôi, đúng hoa/thường (vd `20_Lsb`, `Custom`).
4. **Manifest**: Cài đặt dự án (⚙) → bật *Hiển thị tệp kê khai "appsscript.json"* → dán `appsscript.json`.
5. **Cài đặt app**: tải lại Sheet → menu **LSB App › Cài đặt app** → cấp quyền. Hộp thoại phải báo **✔ Cấu trúc khớp** (sheet `LSB_Activity_log` được tạo).
6. **Triển khai**: Triển khai → *Triển khai mới* → **Ứng dụng web** · *Thực thi với tư cách*: **Người dùng truy cập ứng dụng web** · *Người có quyền truy cập*: **Bất kỳ ai có tài khoản Google** → copy URL. Chân menu trái phải hiện **v3.0.0**.
7. **Chia sẻ Google Sheet**: Viewer → *Người xem*; Editor/Admin → *Người chỉnh sửa*. Gửi URL Web App.

Phân quyền: thêm người vào `LSB_Staff` (app: Danh mục › Nhân sự, cần Admin) với Email, Access_level (Viewer / Editor / Admin), Active = Y **và** chia sẻ Sheet. Thu hồi: Active = N + gỡ chia sẻ.

## 2. Nghiệm thu (dữ liệu thật file v4.6)

| # | Thao tác | Kết quả đúng |
| --- | --- | --- |
| 1 | Mở URL bằng email Admin | Menu: Dashboard · Bán hàng & thầu (6) · Khách hàng & dự án (5) · Tài chính (3) · Danh mục (2) · Nhật ký · Tài khoản |
| 2 | Mở bằng email không có trong LSB_Staff | Màn hình "Không vào được ứng dụng" |
| 3 | Dashboard | 6 tab, tab 2 là **Thầu & pipeline** |
| 4 | Tab Thầu & pipeline, Năm = 2026 | Báo giá phát hành 1 ($1.7M, Won); tỷ lệ thắng 100% (1/0); phễu lead: Converted 1; pipeline đang chạy $0 |
| 5 | Tab Thầu › Kiểm tra dữ liệu | 2 điểm lệch: PJ-2026-001 `Quotation_LSB-Code = LSB-26-PCS` không khớp báo giá nào; QT-2026-001 (26B456) Won nhưng chưa có dự án mang mã này → sửa 1 trong 2 mã cho khớp |
| 6 | Tab Công nợ › Mở tất cả | PJ-2026-001 → Lô 1 → PP-2026-001 Deposit **Paid**, PP-2026-002 Progress **Overdue** còn 272,000 |
| 7 | Bấm dòng PP-2026-002 | Mở Dự án 360° tab **Thanh toán**; KPI: HĐ 1,680,000 · đã thu 904,000 · còn 776,000 (quá hạn 272,000) |
| 8 | Tab Kiểm tra dữ liệu | Thêm: tổng kế hoạch TT 1,176,000 ≠ HĐ (70%); Tonnage_Actual 650 ≠ tổng lô 400 |
| 9 | Kết quả & bài học thầu → RL-2026-001 → Sửa | Project_id là ô chọn dự án (không còn công thức) |
| 10 | Lead → + Thêm (chỉ nhập tên) → Lưu | Mã LD-2026-002; Lead_status = New; Ngày tạo = hôm nay |
| 11 | Đánh giá lead → + Thêm: lead vừa tạo, TK-001, ngày bắt đầu | Hạn tự điền +3 ngày; chỉ thấy đầu việc giai đoạn Lead Qualification; lead → **Qualifying** |
| 12 | Báo giá → + Thêm cho lead đó (mã nội bộ, giá trị, Win 40%, Submitted) | Dashboard › Thầu: pipeline tăng đúng giá trị, có trọng số = 40% |
| 13 | Kết quả thầu cho báo giá đó, Result = Lost | Báo giá tự chuyển **Lost** (Nhật ký ghi lại) |
| 14 | Khách hàng → + Thêm, chọn lead | Quốc gia / liên hệ / phụ trách tự điền; lead → **Converted**; thêm khách thứ 2 cùng lead bị chặn |
| 15 | Dự án 360° › Lô hàng › + Lô hàng | Project_id điền sẵn, Lô số = 3; nhập ETD KH → ETA KH = +14 ngày |
| 16 | Dự án 360° › Sửa → Status = Closed | Lưu được (đã có 1 bài học). Dự án không có bài học → bị chặn |
| 17 | Chi phí → + Thêm | Invoice_no nhập chữ; Cost_status = Planned; VND tự tính |
| 18 | Mở form, nhập vài ô → × → mở lại | "Đã khôi phục bản nháp" |
| 19 | Bấm **EN** | Toàn bộ giao diện (kể cả tab Thầu, Dự án 360°) tiếng Anh |

## 3. Quy tắc app

- Mã `TIỀNTỐ-NĂM-STT` (LD, QL, QT, BS, BA, RL, PJ, PT, SH, PL, PP, PD, CO) / `TIỀNTỐ-STT` (CU, ST, TK); số đã cấp không dùng lại.
- Không ghi đè cột công thức. Xóa = làm trống dòng; không cho xóa khi còn bản ghi con.
- Chỉ bắt buộc PK + FK quan hệ (danh mục Staff/Task giữ bắt buộc); cột "nên có" để trống → cờ **Thiếu dữ liệu**.
- Mặc định khi thêm: Lead_status New · Qual_Status / Status việc Not started · Quotation Draft · Project Kick-off · Cost Planned; người phụ trách = người đang dùng app (Lead, Đánh giá, Báo giá, Hành động, Bài học).
- 1–1 (chặn trùng): Customer.Lead_id · Bidding_strategy.Quotation_code · Result_Lesson.Quotation_code · project.Quotation_LSB-Code · Quotation.Quotation_LSB_Code · Staff.Email.
- Việc (Đánh giá lead / Hành động thầu / Đầu việc dự án): Hạn = Bắt đầu + Std_duration_days; Done → ngày xong; đầu việc sai giai đoạn → cảnh báo.
- Thêm việc đánh giá → lead New → Qualifying. Tạo khách hàng → lead Converted.
- Hành động thầu: chọn báo giá → tự điền Lead; báo giá khác lead → chặn.
- Kết quả thầu Won/Lost/Cancelled → đồng bộ Status báo giá; Won → tự điền Project_id nếu có đúng 1 dự án cùng mã nội bộ, chưa có → nhắc tạo Khách hàng + Dự án.
- Dự án: Closed cần ≥ 1 bài học; mã báo giá nội bộ không khớp / chưa Won / khác lead → cảnh báo.
- Đợt TT: USD = % × HĐ khi để trống; tổng % > 100% → cảnh báo; lô phải cùng dự án (cả bài học). Đã thu vượt đợt → cảnh báo.
- Dashboard / 360° tính lại từ dữ liệu gốc (không dùng cột công thức Collected/Balance/Pay_status/Year).

## 4. Đổi cấu trúc file dữ liệu

Đổi / thêm cột trong Sheet → chạy **LSB App › Kiểm tra cấu trúc** → xuất .xlsx gửi lại để sinh lại `01_Config.gs` / `12_Labels.gs` (`tools/extract_xlsx.py` + `tools/spec_lsb.py` + `tools/gen_config.py`). Quyết định cấu hình nằm ở `tools/app_spec.json` (sinh bởi `tools/spec_lsb.py`).

## 5. Kiểm thử

`python3 tools/make_fixture.py` (fixture = dữ liệu thật v4.6 + LD-2026-002, QT-2026-002 minh hoạ) · `node test/backend.test.js` · `node test/ui.test.js` (Chromium).
Kết quả bản này: **42/42 backend** (27 chung + 15 nghiệp vụ LSB, có smoke test dữ liệu thật) · **16/16 giao diện** (10 chung + 6 LSB, desktop + mobile 390px, VN/EN) — **chưa chạy trên Google thật**.
