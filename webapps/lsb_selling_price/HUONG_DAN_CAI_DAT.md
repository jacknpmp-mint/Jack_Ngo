# LSB Selling Price DB — Web App v1.0 (Google Sheets + Apps Script)

Web App quản lý **giá bán theo khách hàng / thị trường / dự án** trên file **Selling_Price_Database_R05_EN.xlsx** (12 bảng / 166 cột + Config, 5 sheet Sum_*, DataDictionary). Dựng bằng bộ khung `mth-webapp-making`.

| Nhóm menu | Bảng / trang | Ai sửa |
| --- | --- | --- |
| Phân tích | Tra cứu giá tham khảo · Tổng hợp (thay Sum_*) · Bid vs Job | (chỉ xem) |
| Dự án | Projects (Dự án 360°) · Project_Items · Project_Freight · Project_Inputs_Bid · Project_Inputs_Job | Editor |
| Giá & tỷ giá | Material_Prices (Editor) · FX_Rates (Admin) | |
| Danh mục | Customers (Editor) · Markets · Items · Materials · Danh sách chọn (Config) · Staff (Admin) | |

## 0. Phiên bản v1.0 (26/10/2026) — bản đầu

Không có bản trước → dán **toàn bộ 24 file** trong `src/` (11 file `.gs` lõi + `20_Spd.gs`, 7 file `.html`, `appsscript.json`… xem mục 1).

**File dữ liệu R05** (sửa từ R04 bằng XML, giữ nguyên 35 dropdown liên sheet + Excel Table):
- Thêm sheet **Staff** (sau Config): ST-001 = `jackn.pmp@gmail.com`, Admin, Y — **đổi họ tên / email nếu bạn dùng tài khoản Google khác**.
- `FX_Rates.fx_id` (mã FX-0001, app cấp); cặp ngày + tiền tệ vẫn không được trùng.
- 13 cột USD (công thức): `Projects.fx_usd`; `Material_Prices.fx_usd, unit_price_usd`; `Project_Items.unit_sell_usd, unit_cost_usd, gm_unit_usd`; `Project_Freight.freight_cost_usd`; `Project_Inputs_Bid.unit_price_usd, list_price_usd`; `Project_Inputs_Job.fx_usd, unit_price_usd, bid_unit_price_usd, list_price_usd`.
- Config: `Peso` → `PHP`. Xóa mọi dòng "(example)", giữ 6 thị trường TT-01…TT-06. DataDictionary +21 dòng, README mục 7.
- Đã kiểm bằng LibreOffice tính lại: dự án bán USD 1,05 → `unit_sell_usd` = 1,05; GM USD, giá bảng giá USD, Bid USD khớp công thức.

**Quy ước tính đã chốt**

| Hạng mục | Quy ước |
| --- | --- |
| Tỷ giá | Dòng FX_Rates mới nhất có ngày ≤ ngày cần (VND = 1) — giống công thức Sheet |
| Giá VND | giá gốc × tỷ giá (dự án: theo `fx_date`; bảng giá: `effective_date`; vật tư Job: `price_date`) |
| Giá USD | giá VND ÷ tỷ giá USD **cùng ngày của dòng** → dự án bán USD hiện đúng giá chào |
| Giá vốn / GM | Vốn = VT + GC + LD + Khác (trước cước); GM = bán − vốn; GM% = GM ÷ giá bán (như nhau ở VND / USD) |
| Trung bình | Trung bình đơn giản theo dòng (file không lưu khối lượng) |
| Bid ↔ Job vật tư | Ghép theo dự án + vật tư + quy cách (viết giống hệt) |
| Kỳ lọc | `quote_date` |
| Tỷ lệ thắng | (Won + Completed) ÷ (Won + Completed + Lost); Quoting không tính |

## 1. Cài đặt lần đầu (khoảng 15 phút)

1. **Dữ liệu**: tải `Selling_Price_Database_R05_EN.xlsx` lên Google Drive → mở bằng Google Sheets → Tệp → *Lưu dưới dạng Google Trang tính*. Kiểm tra vài cột công thức USD tính ra (sau khi nhập tỷ giá USD).
2. **Admin**: sheet `Staff` phải có dòng email Google thật của bạn với `access_level = Admin`, `active = Y` (đã điền sẵn ST-001 — sửa nếu khác).
3. **Apps Script**: Tiện ích mở rộng → Apps Script. Xóa `Code.gs` mặc định. Tạo **23 file** theo thư mục `src/` (trừ `appsscript.json`):
   - `.gs` (**+** → *Tập lệnh*): 01_Config, 02_Router, 03_Auth, 04_Entity, 05_Dashboard, 08_Activity, 09_User, 10_Form, 11_I18n, 12_Labels, 20_Spd, Data, Error, Notification, Utils, Validation.
   - `.html` (**+** → *HTML*): Components, Custom, Dashboard, Entity, Index, JS, Styles.
   - Tên file không kèm đuôi, phân biệt chữ hoa/thường.
4. **Manifest**: Cài đặt dự án (⚙) → bật *Hiển thị tệp kê khai "appsscript.json"* → dán `appsscript.json`.
5. **Cài đặt app**: tải lại Sheet → menu **LSB Price App › Cài đặt app** → cấp quyền. Hộp thoại phải báo **✔ Cấu trúc khớp** (app tự tạo sheet `Activity_log`).
6. **Triển khai**: Triển khai → *Triển khai mới* → **Ứng dụng web** · *Thực thi với tư cách*: **Người dùng truy cập ứng dụng web** · *Người có quyền truy cập*: **Bất kỳ ai có tài khoản Google** → copy URL.
7. **Chia sẻ Google Sheet**: Viewer → *Người xem*; Editor/Admin → *Người chỉnh sửa*. Gửi URL Web App.

Lần sửa code sau: Triển khai → Quản lý triển khai → ✏ → Phiên bản: **Phiên bản mới** → Triển khai (chân menu trái phải hiện số phiên bản mới).

Phân quyền: thêm người vào `Staff` (app: Danh mục › Người dùng app, cần Admin) với email, access_level (Viewer / Editor / Admin), active = Y **và** chia sẻ Sheet. Thu hồi: active = N + gỡ chia sẻ.

## 2. Nghiệm thu (dữ liệu thật của bạn)

| # | Thao tác | Kết quả đúng |
| --- | --- | --- |
| 1 | Mở URL bằng email Admin | Menu: Dashboard · Phân tích (3) · Dự án (5) · Giá & tỷ giá (2) · Danh mục (6) · Nhật ký · Tài khoản |
| 2 | Mở bằng email không có trong Staff | "Không vào được ứng dụng" |
| 3 | Tỷ giá → + Thêm: 01/10/2026, USD, 26000 | Mã `FX-0001 · mã dự kiến`; thêm lần 2 cùng ngày + USD → báo trùng; xem trước hiện "Tỷ giá trước đó" |
| 4 | Thêm Khách hàng, Hạng mục, Vật tư, 1 dòng Bảng giá vật tư (VND) | Mã CUS-0001, ITM-01, MAT-0001, PRC-00001; form bảng giá xem trước đơn giá USD |
| 5 | Dự án → + Thêm, chỉ chọn khách hàng + thị trường → Lưu | Lưu được, mã PRJ-0001, có cờ **Thiếu dữ liệu** |
| 6 | Sửa dự án: bán USD, vốn VND, ngày tỷ giá ≥ 01/10/2026 | Xem trước: tỷ giá bán 26,000 / vốn 1 / USD 26,000 |
| 7 | Dự án 360° → Hạng mục → + thêm dòng Bid (giá bán 1.05, CP vật tư 16000…) | Xem trước GM%; bảng hiện giá bán USD = 1.050 |
| 8 | Đổi trạng thái dự án = Won → nút **Chép Bid → Job** | Chép đủ dòng hạng mục + vật tư; dòng vật tư Job có cờ thiếu "Ngày giá thực tế"; bấm lại → 0 dòng |
| 9 | Tra cứu giá / Tổng hợp / Bid vs Job, bấm USD ↔ VND | Số khớp cột USD / VND trong Sheet; bấm dòng mở Dự án 360° |
| 10 | Dự án có ngày tỷ giá trước dòng USD đầu tiên | Chuông: **Thiếu tỷ giá**; dự án không có dòng Bid → cảnh báo vàng |
| 11 | Danh sách chọn (Config) → thêm "set" vào Unit, xóa lại | Sheet Config cột Unit đổi theo; giá trị đang dùng không có nút × |
| 12 | Nhập vài ô → bấm × → mở lại form | "Đã khôi phục bản nháp" |
| 13 | Bấm **EN** | Toàn bộ giao diện tiếng Anh; VN trở lại |
| 14 | Mở bằng tài khoản Viewer | Không có nút Thêm / Chép; Danh sách chọn chỉ xem |

## 3. Quy tắc app

- Mã giữ đúng mẫu file: TT-01, CUS-0001, ITM-01, MAT-0001, FX-0001, PRC-00001, PRJ-0001, PIT/FRT/INB/INJ-00001, ST-001; hiện mã dự kiến khi mở form, cấp chính thức lúc Lưu; số đã cấp không dùng lại.
- Bảng nghiệp vụ chỉ bắt buộc PK + FK; cột Required khác của DataDictionary để trống → cờ **Thiếu dữ liệu**. Danh mục Admin (Markets, Items, Materials, FX_Rates, Staff) giữ bắt buộc theo DataDictionary.
- Không ghi đè cột công thức (Sheet vẫn là nguồn); app dùng lại dòng trống đã kéo sẵn công thức, hết vùng thì chép công thức xuống. Xóa = làm trống dòng; chặn xóa khi còn bản ghi con.
- Chặn: tỷ giá trùng ngày + tiền tệ, tỷ giá ≤ 0, chép Job khi dự án chưa Won / Completed. Cảnh báo (vẫn lưu): dòng giá tham chiếu khác vật tư / quy cách, dòng hạng mục trùng, nhập tỷ giá cho VND.
- Danh sách chọn đọc trực tiếp từ sheet Config mỗi lần gọi; Stage cố định (dòng 1 = Bid, dòng 2 = Job). Tiền gốc Config!B3 chỉ xem.
- Dashboard / phân tích / 360° tính lại từ dữ liệu gốc bằng cùng công thức với Sheet.

## 4. Đổi cấu trúc file dữ liệu

Đổi / thêm cột → **LSB Price App › Kiểm tra cấu trúc** → xuất .xlsx gửi lại để sinh lại cấu hình:
`python3 -I tools/extract_spd.py <file.xlsx> && python3 -I tools/make_spec_spd.py && python3 -I tools/gen_config.py`.
Quyết định (bắt buộc, nhãn, menu) sửa ở `tools/make_spec_spd.py`. Sửa xlsx: `tools/fix_spd_r05.py` (XML, giữ dropdown).

## 5. Kiểm thử

`node test/backend.test.js` · `node test/ui.test.js` (Chromium). Dữ liệu test `test/data.json` là **minh hoạ** (make_fixture_spd.py), `test/data_real.json` = file R05 thật.
Kết quả v1.0: **35/35 backend** (23 chung + 12 nghiệp vụ, có smoke test dữ liệu thật) · **19/19 giao diện** (desktop + mobile 390px, VN/EN, Admin / Viewer / email lạ) — **chưa chạy trên Google thật**.

Rủi ro đã biết: Google Sheets có thể đổi Excel Table thành "bảng" của Sheets khi nhập — app đọc/ghi theo mã cột dòng 2 nên không ảnh hưởng, nhưng nếu Sheets báo lỗi kiểu dữ liệu khi app ghi, chuyển bảng về dải ô thường (Bảng › Chuyển thành dải ô). Nháp form dùng bộ nhớ trình duyệt — bị chặn ở chế độ ẩn danh (form vẫn lưu bình thường).
