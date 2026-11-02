# LSB_PSE06_CRMApps — Bàn giao context dự án LSB CRM / Bidding / Project

*Cập nhật: 02/11/2026 (lần 8 — **Web App v2.7 ĐÃ DEPLOY (phiên bản 3)** = v2.6 (Dashboard 4 tab, bản trong skill mth-webapp-making `examples/lsb_v2.6`) + nhập tiền USD/VND linh động + bảng Quá hạn / Đến hạn thêm Mã DA + 2 cột VND; giao `LSB_PSE06_CRMApps_v2.7.zip` + `LSB_WebApp_v2.7_clasp.zip`; test 58/58 backend + 25/25 UI (3 lần), **chưa chạy trên Google thật**). Lần 7: **Web App v2.5 = v2.4 + song ngữ VN/EN**, giao `LSB_PSE06_CRMApps_v2.5.zip`; test mô phỏng 54/54 backend + 22/22 UI, **chưa chạy trên Google thật**). Lần 6: v2.4 (nháp form, mã dự kiến, bỏ bắt buộc). Lần 5: phỏng vấn yêu cầu v2.4. Lần 4: 30/09/2026 (Web App v2.3 chỉ quản lý dự án, DB v4.3_Project). Mở session mới: đính kèm file này + `LSB_PSE06_CRMApps_v2.3.zip` + `LSB_CRM_Bidding_Project_DB_v4.3_Project.xlsx`.*

## 1. Mục tiêu

Google Apps (**Google Sheets làm CSDL + Apps Script Web App**) quản lý vòng đời bán thầu của **LSB (Lucky Steel Building)** — fabrication & xuất khẩu kết cấu thép — cho team 2–10 người; dữ liệu đa năm, rút bài học theo quý/năm.

Vòng đời: **Lead → Lead_Qualifying → Quotation → Bidding_strategy / Bidding_action_plan → Result_Lesson**; khi Won + ký HĐ → **Customer → Project** → Project_task, shipment → Project_handover_lesson; payment_plan → paid; cost.

## 2. Diễn biến session PSE06 (29–30/09)

| # | Việc | Kết quả |
| --- | --- | --- |
| 1 | Cập nhật `ERD_Dictionary` cho **v4.1_Project** (11 bảng, 140 cột, 16 quan hệ) | Thêm cột "Thay đổi v4.1", mục "Đã bỏ so với v3.1" |
| 2 | Cập nhật `ERD_Dictionary` cho **v4.1 đầy đủ** (16 bảng, 205 cột, 29 quan hệ) | Đối chiếu khớp 205/205 cột |
| 3 | Cập nhật `ERD_Dictionary` cho **v4.1_Bidding** (9 bảng, 102 cột, 15 quan hệ + 6 liên kết sang file Project) | Khớp 102/102 |
| 4 | Kiểm tra **v4.2_Project** | Giống hệt v4.1_Project (cột, công thức, từ điển) |
| 5 | Viết lại **Web App v2.0** theo ảnh kiến trúc `Architectural_AppScript` (23 file) | 41/41 ca backend + 14/14 ca UI (mô phỏng); **chưa chạy trên Google thật** |
| 6 | Hướng dẫn phân quyền người dùng | Xem mục 7 |
| 7 | **DB v4.2 = 1 file gộp 16 bảng / 206 cột** (thêm `LSB_project.URL_Project_data`) → nâng Web App lên **v2.1**, bật module Báo giá & Đấu thầu | 54/54 ca backend + 20/20 ca UI (mô phỏng); **chưa chạy trên Google thật** |
| 10 | **DB v4.3_Project** (11 bảng / 141 cột, bỏ 5 bảng thầu): dựng lại ERD_Dictionary (16 quan hệ) + `ERD_v4.3_Project.mmd`; **Web App v2.3** chỉ quản lý dự án, **menu sinh theo bảng có trong Database**, module thầu tắt (`Config_moduleOn_` cần cờ + đủ bảng) | 46/46 ca backend (có smoke test dữ liệu thật) + 16/16 ca UI |
| 9 | **DB v4.3**: `LSB_project.Quotation_code` → `Quotation_LSB-Code` (mã nội bộ nhập tay, bỏ FK); Value_VND/Contract_VND = USD×26000, ETA = ETD+14 (công thức chỉ ở dòng 2); Lists thêm Nation/Industry_segment → **Web App v2.2** | 57/57 ca backend (có smoke test dữ liệu thật v4.3) + 20/20 ca UI |
| 8 | Sửa lỗi cấu trúc file v4.2 bằng XML (`tools/fix_xlsx_v42.py`) | Result_Lesson `#REF!` 300 dòng, dropdown Quotation_code, 10 ghi chú tiêu đề, Incoterm lặp, ERD_Dictionary + URL_Project_data; giữ 53 dropdown x14 (+1) |

Cách sửa xlsx: sửa trực tiếp XML của sheet (không lưu qua openpyxl) để **giữ 35/53/32 dropdown x14** — openpyxl làm mất loại dropdown này.

## 2b. Session PSE07 (25/10/2026) — Yêu cầu sửa Web App v2.3 đang vận hành

**Lỗi người dùng báo (v2.3 đang chạy thật):**
1. Không tự lưu khi đang nhập/assign thông tin mới → vô tình thoát ra phải nhập lại từ đầu.
2. Mã Primary Key / Foreign Key không tự nhảy.
3. Quá nhiều trường bắt buộc → muốn nhập trước phần chính, bổ sung sau.

**Yêu cầu đã chốt qua phỏng vấn (No assumption):**

| Hạng mục | Quyết định |
| --- | --- |
| Bản đang chạy thật | **Web App v2.3 (23 file)**. App Leads/Customers/ToDos trong `src/` của repo GitHub `jacknpmp-mint/Jack_Ngo` **không phải** bản đang chạy — bỏ qua |
| Không mất dữ liệu đang nhập | **Lưu nháp form trên trình duyệt** (tự động, liên tục); vô tình thoát/đóng form/tải lại trang → mở lại form thì khôi phục. **Không ghi vào Sheet cho tới khi bấm Lưu** (thay cho lựa chọn ban đầu "tự ghi vào Sheet") |
| PK | **Tự sinh, hiện ngay khi bấm Thêm mới**, không cần nhập |
| FK | **Điền sẵn theo ngữ cảnh** (vd thêm Task/Shipment/Payment/Cost/Lesson từ Dự án 360° → Project_id tự điền) |
| Cột liên quan | **Tự điền cột phụ thuộc** khi chọn FK (danh sách cụ thể theo bảng — **chưa chốt**, xem mục mở) |
| Bắt buộc | **Chỉ PK + FK**; mọi cột khác cho nhập sau |
| Kiểm tra dữ liệu | **Giữ như v2.3** (kiểu, min/max, URL/email, FK tồn tại, unique, thứ tự ngày, chặn `=`) — chỉ bỏ điều kiện bắt buộc |
| Bản ghi thiếu dữ liệu | **Cờ tự động "Thiếu dữ liệu"** do app tính (không thêm cột vào Sheet), hiện badge + bộ lọc trong danh sách |
| Bàn giao | **Chỉ file zip** (v2.4) + danh sách file thay đổi + hướng dẫn dán vào Apps Script |

**Chốt thêm (PSE08, 25/10):** cấp mã = hiện trước, cấp khi Lưu · 1 nháp Thêm mới / bảng / người, nháp Sửa theo mã · nháp cho cả Thêm mới và Sửa · giữ nháp 7 ngày.
**Áp dụng phương án đề xuất (người dùng chưa trả lời, có thể đổi):** chỉ FK quan hệ đang bắt buộc mới bắt buộc (FK người phụ trách, Shipping_id vẫn tùy chọn) · danh mục Staff/Task giữ bắt buộc · mặc định Lead_status = New, Status = Kick-off, Cost_status = Planned · tự điền đủ 4 nhóm (Customer ← Lead; Task → Due_day; Thanh toán: USD theo %, VND = USD × 26000, Paid = số còn phải thu; Lô kế tiếp / Handover_day / Cost_VND).

**v2.4 đã làm:** file mới `10_Form.gs` (chính sách tách khỏi `01_Config` để sinh lại config không mất); sửa `01_Config`, `02_Router` (route `record.peekId`, `record.related`), `Data`, `04_Project`, `05_Customer`, `Validation` (chú thích), `Components`, `JS`, `Project`, `Customer`, `Styles`. Chi tiết + cách dán: `HUONG_DAN_CAI_DAT.md` mục 0, nghiệm thu bước 9–14.

**Điểm mở (cũ — đã xử lý ở v2.4):**
1. **Cấp mã PK:** vì chỉ ghi Sheet khi Lưu và số đã cấp không dùng lại (ScriptProperties), đề xuất: mở form chỉ **hiện trước** mã (vd PJ-2026-005), **cấp chính thức lúc Lưu** → bỏ ngang không mất số; nếu 2 người nhập cùng lúc, mã khi Lưu có thể khác mã hiện trước. Cần xác nhận sau khi xem `Data.gs`.
2. **Danh sách cột tự điền theo từng bảng** (cột nào phụ thuộc FK nào, lấy từ bảng nào) — đối chiếu ERD_Dictionary v4.3_Project rồi xác nhận với người dùng.
3. Phạm vi nháp: 1 nháp/bảng/người hay nhiều nháp; thời hạn giữ nháp; nháp cho cả form **sửa** bản ghi cũ hay chỉ **thêm mới**.

**v2.5 — song ngữ (chốt 25/10):** dịch toàn bộ phần đang chạy (giao diện + lỗi/cảnh báo server + cảnh báo Dashboard) · nút VN/EN trên thanh trên cùng, nhớ theo trình duyệt, lần đầu theo ngôn ngữ trình duyệt · nhãn ô thân thiện VN/EN kèm tên cột gốc · giá trị danh mục giữ tiếng Anh. File mới `11_I18n.gs` (L_, nhãn bảng/cột, ghi chú EN); trình duyệt gửi `lang` thứ 3 vào `api(action, payload, lang)`; menu Sheet theo `Session.getActiveUserLocale()`. Module thầu (tắt) chưa dịch.

**v2.7 (02/11/2026) — chốt qua phỏng vấn:**

| Hạng mục | Quyết định |
| --- | --- |
| Bảng Quá hạn / Đến hạn sắp tới | Cột riêng **Mã DA** (`Project_code`) ngay sau Due_day; thêm **Phải thu (VND)** = Payment_VND (trống → USD × tỷ giá) và **Còn lại (VND)** = Phải thu VND − Σ Paid_VND (trống → Paid_USD × tỷ giá); 2 cột VND không đổi theo nút USD/VND |
| Nhập tiền linh động | 4 cặp Contract / Payment / Paid / Cost USD ↔ VND; **tỷ giá cố định** `APP.FX_USD_VND` = 26.000 |
| Hai chiều | **Ô vừa sửa quyết định** (gõ USD → VND tính lại, gõ VND → USD tính lại); sửa cả hai → giữ cả hai; trống một bên → server quy đổi |

Đã làm: `10_Form.gs` (FORM_FX_PAIRS, Form_fxSync_), `Data.gs` (gọi fxSync trước/sau hook), `Components.html` (fxSync khi gõ; calcAll bỏ qua cặp tiền), `04_Project.gs` (board: vnd của đợt và lần thu), `Dashboard.html` (3 cột + Cách tính), `11_I18n.gs` (ghi chú EN), `01_Config.gs` 2.7.0. Đẩy GitHub `webapps/LSB_CRM_Project/`.
Test: tìm ra nguyên nhân ca *Nháp* chập chờn từ v2.6 — test mở `file://`, Chromium headless đôi khi mất localStorage khi tải lại (app không xóa; qua http 28/28 giữ nháp) → test UI nay chạy qua `http://127.0.0.1`.
Script ID dự án đang chạy (từ người dùng) nằm trong `.clasp.json` của gói clasp (không đưa lên GitHub).

**02/11/2026 — đã push v2.7 lên dự án thật (chưa deploy):**
- Đăng nhập clasp trong session bằng `mth@luckysteel.vn`.
- Sao lưu code trên dự án trước khi push: **v2.6.0 + bộ nhớ đệm** (CacheService trong `Data.gs` + `onEdit`; bộ đệm 2 phút trên trình duyệt trong `JS.html`; `08_Activity`). Phần bộ nhớ đệm không có trong bản v2.6 của skill.
- Bản push = code đang chạy + bản vá v2.6→v2.7 (7 file, áp sạch).
- Test: backend 59/59 (mock thêm CacheService + 1 ca bộ nhớ đệm), UI 25/25 ×2.
- Đã clone lại kiểm chứng: 25/25 file khớp, `VERSION 2.7.0`.
- Bản triển khai: `@2 - PSE06_Project Managemnt` (đang phục vụ người dùng) + `@HEAD`.
- **ĐÃ DEPLOY 02/11/2026:** bản triển khai `AKfycbwjUDt6…ZFA-wNdY7gVNAfmsY` (giữ URL) → **phiên bản 3** "v2.7 - Ma DA + VND bang cong no, nhap USD/VND hai chieu".
  - Phiên bản 2 = v2.6 + bộ nhớ đệm, phiên bản 1 = bản đầu.
  - Quay lại: `clasp deploy -i <mã triển khai> -V 2`.
- **Rủi ro cần hỏi:** bộ đệm trình duyệt 2 phút có thể cho mở form sửa trên dữ liệu cũ → Lưu ghi đè thay đổi của người khác trong 2 phút đó.

**Trạng thái:** v2.4 xong trong mô phỏng (52/52 backend, 20/20 UI Chromium). **Cần:** dán vào Apps Script và nghiệm thu bước 9–14 trên Google thật. Rủi ro còn lại: nháp dùng localStorage trong iframe của Apps Script (`*.googleusercontent.com`) — trình duyệt chặn lưu trữ bên thứ ba / ẩn danh thì không có nháp (form vẫn lưu bình thường).

## 3. Quyết định đã chốt (tích lũy)

| Hạng mục | Quyết định | Ngày |
| --- | --- | --- |
| Nền tảng | Google Sheets + Apps Script Web App; quan hệ bằng ID | 22/09 |
| Tách file | ~~v4.x tách 2 file~~ → **v4.2 gộp 1 file 16 bảng** | 29/09 → 30/09 |
| Phạm vi Web App | v2.0 chỉ Project → v2.1/v2.2 đủ 16 bảng → **v2.3 chỉ Project (11 bảng), menu theo Database** | 30/09 |
| Nối dự án ↔ báo giá | v4.3: `LSB_project.Quotation_LSB-Code` = `LSB_Quotation.Quotation_LSB_Code` (nhập tay, cảnh báo nếu không khớp / chưa Won / trùng mã) — thay FK mềm của v4.2 | 30/09 |
| Cột VND / ETA | Không coi là AUTO; app tự tính khi để trống (`APP.FX_USD_VND` = 26000, `APP.TRANSIT_DAYS` = 14) | 30/09 |
| Kết quả thầu → báo giá | Result Won/Lost/Cancelled tự đồng bộ `LSB_Quotation.Status` (ghi nhật ký) | 30/09 |
| Mã nguồn | Viết mới theo kiến trúc (không có code v1 trong session) | 29/09 |
| 08_Activity | = **Nhật ký thay đổi** (sheet `LSB_Activity_log`, tự tạo) | 29/09 |
| Notification | Cảnh báo **trong app**, không gửi email | 29/09 |
| Quotation nối Lead | v4.1: **trực tiếp qua `Lead_id`** (bỏ `Qualification_id`) | 29/09 (thay 25/09) |
| Lead_Qualifying | Thành **danh sách việc** (Task_id, ngày bắt đầu/hạn/xong, Qual_Status = trạng thái việc) | 29/09 |
| Phân quyền | LSB_Staff (Email, Access_level, Active) **+** chia sẻ Google Sheet; Viewer / Editor / Admin | 25/09, 30/09 |
| ID | `TIỀNTỐ-NĂM-STT`; danh mục `CU/ST/TK-001`; số đã cấp không dùng lại (ScriptProperties) | 25/09 |
| Kỳ báo cáo | Năm lịch | 22/09 |
| Form nhập (v2.4) | Nháp trên trình duyệt, ghi Sheet khi bấm Lưu; PK tự sinh; FK điền theo ngữ cảnh + tự điền cột phụ thuộc; bắt buộc chỉ PK + FK; validation giữ nguyên; cờ "Thiếu dữ liệu" tự tính | 25/10 |
| Bàn giao v2.4 | Chỉ zip | 25/10 |
| Tiền USD/VND (v2.7) | Nhập 1 bên, bên kia tự quy đổi theo tỷ giá cố định 26.000; ô vừa sửa quyết định | 02/11 |
| Bảng công nợ (v2.7) | Thêm cột Mã DA + Phải thu (VND) + Còn lại (VND) | 02/11 |
| Song ngữ (v2.5) | Toàn bộ; nút VN/EN nhớ theo trình duyệt; nhãn cột thân thiện; danh mục giữ tiếng Anh | 25/10 |
| Cấp mã PK (v2.4) | Hiện mã dự kiến khi mở form, cấp chính thức lúc Lưu; khác mã dự kiến → báo mã thật | 25/10 |
| Nháp (v2.4) | localStorage; 1 nháp Thêm mới/bảng/người + nháp Sửa theo mã; 7 ngày; bản ghi bị đổi → cảnh báo, không tự khôi phục | 25/10 |

## 4. Mô hình dữ liệu v4.x

**File Project (v4.2_Project) — 11 bảng:** LSB_Lead, LSB_Customer, LSB_project, LSB_Project_task, LSB_shipment, LSB_Project_handover_lesson, LSB_payment_plan, LSB_paid, LSB_cost, LSB_Staff, LSB_Task (+ Lists, ERD_Dictionary, Dashboard, Huong_dan).

**File Bidding (v4.1_Bidding) — 9 bảng:** LSB_Lead, LSB_Lead_Qualifying, LSB_Quotation, LSB_Bidding_strategy, LSB_Bidding_action_plan, LSB_Result_Lesson, LSB_Customer, LSB_Staff, LSB_Task.

**Thay đổi v3.1 → v4.1 chính**

| Bảng | Thay đổi |
| --- | --- |
| LSB_Lead_qualification → **LSB_Lead_Qualifying** | Thêm Task_id (FK Task), Task_duty (auto), Qual_Start/Due/Done_day; Qual_Status = Not started/In progress/Done/Blocked; bỏ Qual_day, Need_scope, Est_tonnage, Budget_range, Decision_maker, Timeline, Qual_score |
| LSB_Quotation | Lead_id thành FK nhập (bỏ Qualification_id); thêm Quotation_LSB_Code, Address, Area_m2, Quotation_owner/Maincons/Consultant; bỏ Submit_deadline, Valid_until |
| LSB_project | Thêm Project_address, Project_owner, Project_Maincons, Project_Consultant, Tonnage_Actual, Grossmargin_EST/Actual, Installation_date_start, Project_handover; Tonnage → Tonnage_EST; Quotation_code thành text nhập tay (không FK) |
| LSB_shipment | Thêm Shipment_code, Container_qty_actual, Vessel_no; Container_qty → Container_qty_plan |
| LSB_Project_handover_lesson | Bỏ Apply_to_Task_id, Action_owner_id, Action_status |
| LSB_payment_plan | Thêm PP_revision |
| LSB_paid | Bỏ Bank_ref |
| LSB_cost | Invoice_day → Invoice_code (**vẫn là cột ngày**, nguồn Year/Quarter) |
| Lists | Project_status thêm Installation Processing / Installation Completed |

## 5. Web App v2.1 — kiến trúc (23 file, như v2.0; khác biệt ở mục 5b)

| File | Vai trò |
| --- | --- |
| `appsscript.json` | Asia/Ho_Chi_Minh, V8, webapp **USER_ACCESSING / ANYONE** |
| `01_Config.gs` | APP, ROLE_LEVEL, PERMISSION, LISTS, **SCHEMA 11 bảng/140 cột** (sinh bằng `tools/gen_config.py`) |
| `02_Router.gs` | `doGet`, `include`, cổng duy nhất `api(action, payload)` (17 route, mỗi route có quyền tối thiểu), menu LSB App (Cài đặt app, Kiểm tra cấu trúc, Mở Web App) |
| `03_Auth.gs` | Email Google → LSB_Staff (Active = Y) → Viewer/Editor/Admin; `Auth_requireWrite_` (danh mục cần Admin) |
| `04_Project.gs` | Danh sách, **Dự án 360°**, Dashboard, hook quy tắc dự án |
| `05_Customer.gs` | Lead & Khách hàng, **Lead 360°**, tạo Customer → Lead Converted |
| `06_Bidding.gs`, `07_Quotation.gs` | Khung module thầu/báo giá (tắt) |
| `08_Activity.gs` | Nhật ký: Log_id, Timestamp, User_email, Staff_id, Action, Table_name, Record_id, Changed_fields, Detail (JSON cũ→mới) |
| `09_User.gs` | Staff/Task; luôn còn ≥ 1 Admin, không tự xóa mình |
| `Data.gs` | Đọc/ghi theo tên cột, không ghi đè công thức, dùng lại dòng trống, tự thêm dòng + chép công thức; `Record_list/get/save/delete` (khóa ghi → chuẩn hóa → hook → validate → ghi → log) |
| `Validation.gs` | Bắt buộc, kiểu, min/max, URL/email, FK, unique, thứ tự ngày; ngoài Lists = cảnh báo |
| `Utils.gs`, `Error.gs` | Tiện ích; `AppError_`, `{ok,data}/{ok:false,error}` |
| `Notification.gs` | Việc trễ/sắp hạn, thanh toán quá hạn/sắp hạn, ETD, RAD |
| `Index/Dashboard/Project/Customer/Bidding.html` | Khung + các trang |
| `Styles/Components/JS.html` | CSS (màu theo Sheet); UI dùng chung (bảng, tab, **form tự sinh từ SCHEMA**, modal, nhật ký, trang Danh mục/Nhật ký/Tài khoản); lõi client |

**Quy tắc đang áp dụng:** 1 lead → tối đa 1 customer; Quotation_code dự án không trùng; email Staff không trùng; quy tắc 5 & 8 (lô hàng cùng dự án; Closed cần ≥ 1 bài học); tự điền Due_day, Done_day, Shipment_no, Payment_USD, Owner/Recorded_by; chặn chèn công thức `=`; chặn xóa khi còn bản ghi con; KPI tính lại từ dữ liệu gốc.

**Kiểm thử:** `test/backend.test.js` (54 ca), `test/ui.test.js` (20 ca Chromium desktop + mobile 390px, Admin/Viewer/email lạ).

### 5b. Thay đổi v2.1

- `01_Config.gs`: SCHEMA 16 bảng/206 cột sinh bằng `tools/extract_xlsx.py` + `tools/gen_config.py`; `APP.MODULES` bật; `TASK_PHASE_FILTER`; `QUOTATION_OPEN_STATUS`.
- `06_Bidding.gs`: việc đánh giá lead / kế hoạch hành động (Due tự tính, Done → ngày xong, lọc giai đoạn), lead New → Qualifying, kế hoạch hành động phải cùng lead với báo giá, Result → Status báo giá, `bidding.tasks`.
- `07_Quotation.gs`: `quotation.list` (pipeline, có trọng số, tỷ lệ thắng), `quotation.get360`, `Quotation_lookup_` thật cho Dự án 360°.
- Lead 360° thêm Đánh giá lead / Báo giá / Kế hoạch hành động; Dashboard thêm chỉ số thầu; cảnh báo việc thầu có link (dự án/báo giá/lead).
- Router: 20 route (thêm `quotation.list`, `quotation.get360`, `bidding.tasks`).

### 5c. Kế hoạch v2.4 (chưa làm — theo mục 2b)

File dự kiến chạm tới (xác nhận sau khi đọc code): `Components.html` / `JS.html` (nháp localStorage, khôi phục form, cảnh báo đóng form, điền FK theo ngữ cảnh, tự điền cột phụ thuộc, badge + lọc "Thiếu dữ liệu"), `Validation.gs` + `01_Config.gs` (bắt buộc chỉ PK + FK), `Data.gs` (xem trước mã PK / cấp khi Lưu), `02_Router.gs` (route xem trước mã nếu cần), `test/` (bổ sung ca kiểm thử).

## 6. Lỗi dữ liệu còn tồn tại (chưa sửa)

| File | Vấn đề |
| --- | --- |
| v4.2 | ✅ Đã sửa 30/09: Result_Lesson `#REF!`, ghi chú tiêu đề, Incoterm lặp, `Area_m2` "tấn", dropdown Quotation_code, ERD_Dictionary |
| v4.2 | `LSB_cost.Invoice_code` tên "code" nhưng là ngày + nguồn Year/Quarter — **cần bạn xác nhận** |
| v4.3 | Result_Lesson.Project_id so QT-code với cột mã nội bộ → luôn rỗng (công thức sửa trong HUONG_DAN mục 5a); PJ-2026-001 Kickoff < Contract_day (app chặn lưu); PL-2026-001 thiếu dữ liệu; PD-2026-002 → PP-2026-002 không tồn tại; công thức VND/ETA chỉ ở dòng 2 |
| Project v4.2 | Sheet Dashboard `#REF!` (dòng bài học chưa áp dụng); Huong_dan còn mô tả v3.1 |
| Project v4.2 | Ghi chú tiêu đề chép sai: Vessel_no, Installation_date_start, Project_handover, Shipment_code, PP_revision; dữ liệu mẫu Project_owner/Maincons/Consultant trùng nhau; Grossmargin hiển thị 0.15 chưa % |
| Project v4.2 | Lists: Incoterm lặp `Lumpsum_NotErect`; **LSB_Staff chưa có Admin** |
| Bidding v4.1 | (lỗi thời — dùng v4.2 gộp) Dashboard 81 ô `#REF!` |
| Bidding v4.1 | Quy tắc 1 (Quotation chỉ từ lead Qualified) mất nguồn; bỏ Submit_deadline → email nhắc hạn thầu mất nguồn |

## 7. Phân quyền người dùng (đã hướng dẫn)

1. Thêm người vào **LSB_Staff** (app: Danh mục › Nhân sự, cần Admin; hoặc gõ vào sheet): Email Google, Access_level, Active = Y.
2. **Chia sẻ Google Sheet**: Viewer → Người xem; Editor/Admin → Người chỉnh sửa.
3. Gửi link Web App. Thu hồi: Active = N (+ gỡ chia sẻ).
- Hạn chế: Editor có quyền sửa Sheet trực tiếp (bỏ qua app, không vào nhật ký) — hệ quả của USER_ACCESSING với Gmail cá nhân.

## 8. Deliverables (trong `LSB_PSE06_CRMApps.zip`)

| Sản phẩm | Trạng thái |
| --- | --- |
| `LSB_PSE06_CRMApps_v2.7.zip` → `LSB_WebApp_v2.7/` (src 25 file, tools, test, HUONG_DAN_CAI_DAT.md, CHANGED_FILES.md) + `LSB_WebApp_v2.7_clasp.zip` | **Bản mới nhất** — chờ đẩy (clasp) + nghiệm thu bước 18–21 |
| `LSB_PSE06_CRMApps_v2.5.zip`, v2.6 (skill examples) | Thay bằng v2.7 |
| `LSB_PSE06_CRMApps_v2.4.zip` | Thay bằng v2.5 |
| `webapp/LSB_WebApp_v2.3/` | Đang vận hành thật (thay bằng v2.4 sau nghiệm thu) |
| `webapp/LSB_WebApp_v2.2/` | Bản gộp 16 bảng (có module thầu + bộ test thầu) — dùng nếu quay lại file gộp |
| `data/LSB_CRM_Bidding_Project_DB_v4.3_Project.xlsx` | **File dữ liệu hiện hành** (11 bảng, ERD_Dictionary đã cập nhật) + `data/ERD_v4.3_Project.mmd` |
| `data/LSB_CRM_Bidding_Project_DB_v4.3.xlsx` | Bản gộp 16 bảng (tham khảo) |
| `data/LSB_CRM_Bidding_Project_DB_v4.2.xlsx` | Tham khảo |
| `data/…v4.1_Project.xlsx`, `…v4.1_Bidding.xlsx`, `…v4.1.xlsx` | Tham khảo (lỗi thời) |
| [Tài liệu sống](https://claude.ai/artifact/AEi9WzEA8ntLwSvDWufEvJ), [ERD tương tác](https://claude.ai/artifact/DWK9UQJSsRq3RgAYtLoD1o) | **Còn ở v3.1** — chưa cập nhật v4.x |
| v3.1 xlsx, Web App v1.0, Web App v2.0 | Lỗi thời |
| Repo GitHub `jacknpmp-mint/Jack_Ngo` (`src/` Leads/Customers/ToDos) | Không liên quan bản đang chạy |

## 9. Việc tiếp theo

1. **Ưu tiên:** đẩy v2.7 bằng clasp (`HUONG_DAN_CLASP.md`: clone sao lưu → push → thử /dev → deploy) → nghiệm thu bước 18–21 (và 9–17 nếu chưa làm); xác nhận/đổi các phương án mặc định ở mục 2b (FK bắt buộc, danh mục, mặc định trạng thái, cột tự điền, `FORM_NEED_EXTRA`).
2. Cài Web App + nghiệm thu theo `HUONG_DAN_CAI_DAT.md`; thêm email thật làm Admin; gửi ảnh nếu lỗi.
3. Xác nhận `Invoice_code` (ngày hay mã hóa đơn) → sửa file + `01_Config.gs`.
4. Còn lại của mục 6: sheet Dashboard trong file, Huong_dan (v3.1), phạm vi dropdown Incoterm/Project_status, dữ liệu mẫu trùng.
5. Cập nhật ERD tương tác + tài liệu sống lên v4.x.
6. Tùy chọn: email nhắc hạn thầu (cần cột hạn nộp thầu — đã bỏ Submit_deadline), khóa sửa Sheet trực tiếp.

## 10. Cách tiếp tục ở session mới

Đính kèm `LSB_PSE06_CRMApps.md` + `LSB_PSE06_CRMApps_v2.3.zip` + xlsx đang dùng thật, rồi nói:

> "Tiếp tục dự án LSB — theo file LSB_PSE06_CRMApps, mục 2b. Đọc source v2.3, hỏi tôi 3 điểm còn mở rồi sửa lên v2.4, giao zip."

Nếu zip không giải nén được: upload lẻ `01_Config.gs`, `Data.gs`, `Validation.gs`, `Utils.gs`, `02_Router.gs`, `04_Project.gs`, `Components.html`, `JS.html`, `Project.html`, `Customer.html` (đổi đuôi .txt nếu cần).

Nếu đã đổi cột trong Google Sheet: chạy **LSB App › Kiểm tra cấu trúc** và gửi kèm bản xuất .xlsx mới để sinh lại `01_Config.gs`.
