# LSB_PSE06_CRMApps — Bàn giao context dự án LSB CRM / Bidding / Project

*Cập nhật: 25/10/2026 (lần 10 — **App MỚI LSB Cost Input v1.0.0** (giá đầu vào: vật tư, sản xuất, vận tải) dựng bằng skill `mth-webapp-making` trên **Cost_Input_Database_Part2_R03_EN.xlsx** (sửa từ R02: thêm `FX_Rates.fx_id` + sheet `Staff`); giao `LSB_Cost_Input_WebApp_v1.0.zip` + xlsx R03; test mô phỏng 44/44 backend + 19/19 UI, **chưa chạy trên Google thật** — xem mục 2e. Mở session mới cho app này: đính kèm file này + `LSB_Cost_Input_WebApp_v1.0.zip` + xlsx R03 đang dùng thật.) (Lần 9 — **App MỚI v3.0 đủ 16 bảng (CRM + Thầu + Dự án)** dựng bằng skill `mth-webapp-making` trên **DB v4.6** (sửa từ v4.2); giao `LSB_CRM_WebApp_v3.0.zip` + `LSB_CRM_Bidding_Project_DB_v4.6.xlsx`; test mô phỏng 42/42 backend + 16/16 UI, **chưa chạy trên Google thật**; v2.6 đang vận hành giữ nguyên — xem mục 2d. Mở session mới cho app v3.0: đính kèm file này + `LSB_CRM_WebApp_v3.0.zip` + xlsx v4.6 đang dùng thật.) (Lần 8 — **Web App v2.6 = v2.5 + Dashboard 4 tab**, giao `LSB_PSE06_CRMApps_v2.6.zip`, chỉ dán đè 4 file; test mô phỏng 56/56 backend + 23/23 UI, **chưa chạy trên Google thật**; file dữ liệu hiện hành **v4.5_Project** (cấu trúc cột giống v4.3_Project). Lần 7: **Web App v2.5 = v2.4 + song ngữ VN/EN**, giao `LSB_PSE06_CRMApps_v2.5.zip`; test mô phỏng 54/54 backend + 22/22 UI, **chưa chạy trên Google thật**). Lần 6: v2.4 (nháp form, mã dự kiến, bỏ bắt buộc). Lần 5: phỏng vấn yêu cầu v2.4. Lần 4: 30/09/2026 (Web App v2.3 chỉ quản lý dự án, DB v4.3_Project). Mở session mới: đính kèm file này + `LSB_PSE06_CRMApps_v2.6.zip` + `LSB_CRM_Bidding_Project_DB_v4.5_Project.xlsx`.*

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

**Trạng thái:** v2.4 xong trong mô phỏng (52/52 backend, 20/20 UI Chromium). **Cần:** dán vào Apps Script và nghiệm thu bước 9–14 trên Google thật. Rủi ro còn lại: nháp dùng localStorage trong iframe của Apps Script (`*.googleusercontent.com`) — trình duyệt chặn lưu trữ bên thứ ba / ẩn danh thì không có nháp (form vẫn lưu bình thường).

## 2c. Session PSE09 (25/10/2026) — Dashboard v2.6

**Vấn đề:** Dashboard v2.5 chỉ có bảng theo quý + cảnh báo, không xem được shipment đến hạn thanh toán, lô đang sản xuất, số đã thu theo dự án/lô.

**Đã chốt qua phỏng vấn + duyệt bản mẫu** ([bản mẫu](https://claude.ai/artifact/EKPLCdRcGcG7w6an1BvFoe)):

| Hạng mục | Quyết định |
| --- | --- |
| Bố cục | 1 trang, 4 tab: Tổng quan (BGĐ) · Công nợ & thu tiền (Kế toán) · Sản xuất & giao hàng (PM) · Khách hàng & thị trường (Sales) |
| Đến hạn thanh toán | Theo `LSB_payment_plan.Due_day`; nút 7/14/30/60 ngày; quá hạn hiện riêng |
| Đã thu | Cây Dự án → Lô → Đợt → từng lần thu; đợt không gắn lô ở nhánh "Chung dự án" |
| Trạng thái đợt | = công thức `Pay_status` có sẵn trong Sheet (Paid/Overdue/Partial/Open) |
| Đang sản xuất | Suy ra từ mốc ngày shipment (Start_Fab / Completed_Fab / ETD_actual / ETA_actual) — shipment không có cột trạng thái |
| Tiền tệ / lọc | USD mặc định, nút VND; lọc Năm/Quý, Khách hàng, Trạng thái DA, Quốc gia |
| Kỳ | Mỗi số theo ngày của chính nó (Contract_day, Payment_day, Invoice_code, ETD_actual); công nợ/quá hạn/sản xuất tính tại hôm nay |
| Bấm dòng | Mở Dự án 360° đúng tab (Thanh toán / Lô hàng) |
| Thêm | Khối "Kiểm tra dữ liệu" báo điểm lệch trong Sheet |

**v2.6 đã làm:** sửa `Dashboard.html` (viết lại), `04_Project.gs` (`Project_board_`), `Styles.html` (CSS), `01_Config.gs` (VERSION 2.6.0). Chi tiết + nghiệm thu bước 18–22: `HUONG_DAN_CAI_DAT.md` mục 0.

**Lỗi dữ liệu file v4.5 thật (dashboard đang báo):** PD-2026-002 trỏ PP-2026-002 không tồn tại; PP-2026-001 Payment_USD 504.000 ≠ 30% × HĐ 200.360; chi phí 710.000 > HĐ; Tonnage_Actual 650 ≠ tổng lô 171; Kickoff_day < Contract_day. Sheet `Dashboard` trong file vẫn `#REF!` (dòng báo giá).

## 2d. Session PSE10 (25/10/2026) — App mới v3.0 đủ 16 bảng (skill mth-webapp-making)

**Yêu cầu:** chạy skill `mth-webapp-making` cho file `LSB_CRM_Bidding_Project_DB_v4.2.xlsx` (gộp 16 bảng).

**Đã chốt qua phỏng vấn:**

| Hạng mục | Quyết định |
| --- | --- |
| Phạm vi | **App mới đủ 16 bảng** từ bộ khung skill; v2.6 (v4.5_Project) đang chạy giữ nguyên, chạy song song |
| LSB_project ↔ báo giá | **Nhập tay như v4.3**: đổi `Quotation_code` → `Quotation_LSB-Code`, so với `LSB_Quotation.Quotation_LSB_Code`; cảnh báo không khớp / chưa Won / trùng (không FK) |
| Result_Lesson.Project_id | **FK chọn tay** (bỏ công thức #REF!); app tự điền khi Won và có đúng 1 dự án cùng mã nội bộ |
| LSB_cost.Invoice_code | **Số hóa đơn (text)** → đổi tên **`Invoice_no`**; Year/Quarter chi phí theo **Payment_day** (đóng điểm mở cũ mục 6 / việc tiếp theo 3) |
| Dashboard | **4 tab v2.6 + tab "Thầu & pipeline" ở vị trí 2** + tab Kiểm tra dữ liệu — bản mẫu [Dashboard v3.0](https://claude.ai/artifact/Fr1xvuUDb3YzRYNL5i59NV) đã duyệt |
| Quy tắc nghiệp vụ | **Kế thừa toàn bộ v2.2 / v2.6** (đồng bộ kết quả → báo giá, New → Qualifying, 1 lead ≤ 1 KH → Converted, Closed cần bài học, lô cùng dự án, action plan cùng lead, VND × 26000, ETA + 14, mặc định trạng thái + tự điền như v2.4) |
| 360° riêng | **Chỉ Dự án 360°** (KPI tài chính); Lead/Báo giá/Khách hàng dùng 360° chung của bộ khung |

**DB v4.6** (`tools/fix_lsb_v46.py`, sửa XML, dropdown giữ nguyên + thêm 1 dropdown FK Result_Lesson.L): LSB_project.D → `Quotation_LSB-Code`; Result_Lesson.L bỏ công thức → FK; LSB_cost.G → `Invoice_no` (xóa ô ngày mẫu CO-2026-001), J/K theo H (Payment_day); ERD_Dictionary cột "Thay đổi"; bỏ calcChain.

**App v3.0** (24 file, mọi file MỚI): lõi bộ khung + `01_Config.gs`/`12_Labels.gs` (sinh từ `tools/app_spec.json` ← `tools/spec_lsb.py`) + **`20_Lsb.gs`** (hook, related, Dự án 360°, `Lsb_board_`, `Lsb_checks_`) + **`Custom.html`** (AUTOFILL, lọc đầu việc theo giai đoạn, Dashboard 6 tab chép lõi v2.6 + tab Thầu, Dự án 360°). Test: `test/custom.test.js` (15 ca) + `test/custom.ui.js` (6 ca); fixture `test/data.json` = dữ liệu thật + LD-2026-002, QT-2026-002 minh hoạ (`tools/make_fixture.py`).

**Áp dụng phương án đề xuất (người dùng chưa hỏi riêng, có thể đổi):** menu 4 nhóm (Bán hàng & thầu · Khách hàng & dự án · Tài chính · Danh mục); cảnh báo: việc đánh giá/hành động/dự án trễ (3 ngày), đợt TT (7), ETD lô (7), RAD dự án (14); mặc định Quotation Status = Draft, Issue_day = hôm nay, Result_day = hôm nay; Customer idStyle `CU-STT` như file.

**Lỗi dữ liệu file v4.6 (dashboard đang báo):** PJ-2026-001 `Quotation_LSB-Code = LSB-26-PCS` ≠ `QT-2026-001.Quotation_LSB_Code = 26B456`; QT-2026-001 Won chưa có dự án khớp mã; tổng kế hoạch TT 1,176,000 ≠ HĐ 1,680,000 (70%); Tonnage_Actual 650 ≠ tổng lô 400; LSB_Staff chưa có Admin; Sheet `Dashboard` dòng bài học vẫn `#REF!`; Huong_dan còn mô tả cũ.

## 2e. Session PSE11 (25/10/2026) — App mới LSB Cost Input v1.0 (Cost Input Database Part 2)

**Yêu cầu:** chạy skill `mth-webapp-making` cho `Cost_Input_Database_Part2_R02_EN.xlsx` (báo giá / đơn giá đầu vào: 12 nhóm vật tư, 3 bảng sản xuất, 4 bảng vận tải, danh mục NCC / cảng / công đoạn / tỷ giá; danh sách chọn ở sheet Config; DataDictionary đầy đủ). File không theo quy ước LSB: dòng 1 tiêu đề, **dòng 2 mã cột**, dòng 3 nhãn, dữ liệu từ dòng 4; công thức kéo sẵn tới dòng 503; Excel Table header dòng 3.

**Đã chốt qua phỏng vấn (3 vòng) + duyệt bản mẫu** ([bản mẫu](https://claude.ai/artifact/Jmi3r1DJmZue8iNW9bpLgy)):

| Hạng mục | Quyết định |
| --- | --- |
| Bố cục sheet | **Giữ file như cũ**, app tự thích ứng (đọc mã cột dòng 2, bỏ dòng 3, ghi từ dòng 4) |
| Đăng nhập | **Thêm sheet `Staff`** (staff_id, full_name, email, access_level, active, notes) — Viewer / Editor / Admin |
| Mã lạ (NCC / cảng / công đoạn chưa có) | **Cảnh báo nhưng vẫn lưu** như R02 (FK mềm) + hiện ở Kiểm tra dữ liệu |
| Khóa FX_Rates | **Thêm cột `fx_id`** (FX-00001) ở cuối; app vẫn chặn trùng ngày + tiền tệ → file lên **R03** |
| Dashboard | Giá tham chiếu & so sánh NCC · Lịch sử giá · Sản xuất & vận tải (+ Kiểm tra dữ liệu, Cảnh báo, Cách tính). **Không** chọn khối riêng "báo giá sắp hết hạn" (đưa vào chuông) |
| Cùng mặt hàng | Cùng sheet nhóm + cùng 5 cột Spec + cùng ĐVT |
| Menu vật tư | **1 mục "Bảng giá vật tư"** + nút chọn 12 nhóm |
| 360° | Nhà cung cấp · Cảng · Công đoạn |
| Giá tham chiếu | **Thấp nhất trong báo giá còn hiệu lực** (mỗi NCC lấy báo giá mới nhất; so bằng giá quy đổi tiền gốc) |
| Cảnh báo | Có, **trước 14 ngày** (+ nhóm không còn NCC nào có giá hiệu lực) |
| Quyền danh mục | Editor sửa NCC / Cảng / Công đoạn; **Admin** sửa Tỷ giá, danh sách Config, Staff, xóa |
| Tên / thư mục | **LSB Cost Input** · `webapps/lsb_cost_input`; chạy riêng với app CRM |

**Áp dụng phương án đề xuất (người dùng chưa hỏi riêng, có thể đổi):** báo giá có effective_date sau hôm nay = "Sắp áp dụng", không tính vào giá tham chiếu; valid_until trống = còn hiệu lực; so sánh tự làm / thuê ngoài chỉ khi cùng công đoạn + loại SP + ĐVT (đơn giá kg, năng lực ton — không quy đổi); danh sách chọn đọc trực tiếp sheet Config (sửa trong Sheet hoặc trong app đều thấy ngay); link tệp đính kèm không kiểm URL (cho phép đường dẫn mạng `\\server\...`); mã giữ đúng mẫu file (MSP-00001 5 số, SUP-0001 4 số, PORT-01 / PRO-01 2 số); Admin đầu tiên trong `Staff` = jackn.pmp@gmail.com.

**DB R03** (`tools/fix_cost_r03.py`, sửa XML, dropdown / kiểm tra ngày 130 → 132): FX_Rates cột G `fx_id` + mở rộng tbl_FXRates; sheet `Staff` (dropdown Access level, Active); DataDictionary +7 dòng; README tiêu đề R03 + mục 7.

**App v1.0.0** (24 file, mọi file MỚI): lõi bộ khung (đã chỉnh: `Data.gs` dòng tiêu đề / dữ liệu theo `APP.HEADER_ROW=2` / `FIRST_DATA_ROW=4`, `idDigits`, `Config_lists_()`; `10_Form.gs`, `Validation.gs`, `02_Router.gs`) + `01_Config.gs` / `12_Labels.gs` (sinh từ `tools/app_spec.json` ← `tools/spec_cost.py` ← `tools/schema_raw.json` ← `tools/extract_cost.py` đọc DataDictionary) + **`20_Cost.gs`** (tỷ giá, giá quy đổi, hiệu lực, nhóm so sánh, Dashboard `Cost_board_`, 360° `Cost_extra360_`, cảnh báo, kiểm tra dữ liệu, quy tắc lưu, route `cost.lists.get/save`) + **`Custom.html`** (Bảng giá vật tư, 6 tab Dashboard, 3 trang 360°, Danh sách chọn). Test: `test/custom.test.js` (9 ca, so số tính tay) + `test/custom.ui.js` (9 ca).

**Dữ liệu thật R03 (dashboard đang báo):** 27 dòng ví dụ "(example)" của file mẫu (Lưu ý) — không có lỗi / cảnh báo khác.

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
| Song ngữ (v2.5) | Toàn bộ; nút VN/EN nhớ theo trình duyệt; nhãn cột thân thiện; danh mục giữ tiếng Anh | 25/10 |
| Cấp mã PK (v2.4) | Hiện mã dự kiến khi mở form, cấp chính thức lúc Lưu; khác mã dự kiến → báo mã thật | 25/10 |
| Dashboard (v2.6) | 4 tab theo vai trò; Due_day; Pay_status; trạng thái lô suy từ mốc ngày; USD/VND; kỳ theo ngày của từng số | 25/10 |
| Nháp (v2.4) | localStorage; 1 nháp Thêm mới/bảng/người + nháp Sửa theo mã; 7 ngày; bản ghi bị đổi → cảnh báo, không tự khôi phục | 25/10 |
| App v3.0 | App mới đủ 16 bảng trên DB v4.6, bộ khung `mth-webapp-making`; chạy song song v2.6 | 25/10 |
| DB v4.6 | `Quotation_LSB-Code` nhập tay (như v4.3); Result_Lesson.Project_id = FK chọn tay; `Invoice_no` text, chi phí theo Payment_day | 25/10 |
| Dashboard v3.0 | Tổng quan · **Thầu & pipeline** · Công nợ · Sản xuất · Khách hàng · Kiểm tra dữ liệu; pipeline = Draft/Submitted/Negotiating, có trọng số × Win_probability; tỷ lệ thắng = Won/(Won+Lost) theo Result_day | 25/10 |
| 360° riêng (v3.0) | Chỉ Dự án 360°; bảng khác dùng 360° chung | 25/10 |
| LSB Cost Input v1.0 | App mới cho Cost Input Database Part 2 (R03), chạy riêng; giữ bố cục 3 dòng tiêu đề; sheet Staff; FK mềm; `fx_id` | 25/10 |
| Giá đầu vào | Giá tham chiếu = thấp nhất trong báo giá mới nhất còn hiệu lực của từng NCC (cùng nhóm + 5 Spec + ĐVT); tỷ giá ≤ ngày báo giá; cảnh báo 14 ngày | 25/10 |

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
| `LSB_Cost_Input_WebApp_v1.0.zip` → `LSB_Cost_Input_WebApp_v1.0/` (src 24 file, tools, test, HUONG_DAN_CAI_DAT.md) + `_file_can_dan/` | **App mới giá đầu vào** — chờ cài trên Google Sheet riêng + nghiệm thu 16 bước (HUONG_DAN mục 2) |
| `Cost_Input_Database_Part2_R03_EN.xlsx` | File dữ liệu cho LSB Cost Input (24 bảng / 570 cột; thay R02) |
| `LSB_CRM_WebApp_v3.0.zip` → `LSB_CRM_WebApp_v3.0/` (src 24 file, tools, test, HUONG_DAN_CAI_DAT.md, file này) + `_file_can_dan/` | **App mới 16 bảng** — chờ cài trên Google Sheet riêng + nghiệm thu 19 bước (HUONG_DAN mục 2) |
| `LSB_CRM_Bidding_Project_DB_v4.6.xlsx` | File dữ liệu cho app v3.0 (16 bảng / 206 cột) |
| `LSB_PSE06_CRMApps_v2.6.zip` → `LSB_WebApp_v2.6/` (src 25 file, tools, test, HUONG_DAN_CAI_DAT.md) + `LSB_v2.6_4_file_can_dan/` | Bản vận hành dự án (11 bảng) — chờ dán + nghiệm thu (bước 9–22) |
| `LSB_PSE06_CRMApps_v2.5.zip` | Thay bằng v2.6 |
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

0a. **LSB Cost Input v1.0 (mới):** tải xlsx R03 lên Drive → cài 23 file + appsscript.json theo HUONG_DAN → nghiệm thu 16 bước; xóa / ghi đè 27 dòng ví dụ; xác nhận 4 điểm mở của file R02 (README mục 6: cột Spec từng nhóm, tên nhóm "Tôn" / "Giằng cán nguội", số tệp đính kèm, Product type tự do hay danh sách) và các phương án đề xuất ở mục 2e.
0. **App v3.0 (mới):** tải xlsx v4.6 lên Drive → thêm email Admin vào LSB_Staff → cài 24 file theo HUONG_DAN v3.0 → nghiệm thu 19 bước; sửa mã báo giá PJ-2026-001 / QT-2026-001 cho khớp; quyết định dùng v3.0 thay v2.6 hay chạy song song (nếu thay: chuyển dữ liệu dự án từ file v4.5_Project sang v4.6 — cột giống, khác `Invoice_code` → `Invoice_no`).
1. **Ưu tiên (v2.6):** dán v2.6 (từ v2.5: chỉ 4 file `Dashboard`, `04_Project`, `Styles`, `01_Config`) → nghiệm thu bước 18–22; sửa các điểm lệch dữ liệu mà khối *Kiểm tra dữ liệu* báo. Nếu chưa dán v2.5: dán v2.5 (HUONG_DAN mục 0: 2 file mới `10_Form`, `11_I18n` + 17 file sửa) → Phiên bản mới → nghiệm thu bước 9–17; xác nhận/đổi các phương án mặc định ở mục 2b (FK bắt buộc, danh mục, mặc định trạng thái, cột tự điền, `FORM_NEED_EXTRA`).
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
