# LSB Cost Input — Web App v1.0.0 (Google Sheets + Apps Script)

Web App nhập và tra cứu **giá đầu vào** (vật tư, sản xuất, vận tải) trên file **Cost_Input_Database_Part2_R03_EN.xlsx** (24 bảng / 570 cột). Dựng bằng bộ khung `mth-webapp-making`. App mới, chạy riêng, không đụng tới app LSB CRM.

| Nhóm | Bảng (sheet) | Menu trong app |
| --- | --- | --- |
| Vật tư | 12 sheet `Mat_*` | **Bảng giá vật tư** (1 mục, chọn nhóm bằng nút phía trên) |
| Sản xuất | `Prod_Process_Rates`, `Prod_Subcontract`, `Prod_Capacity` | Đơn giá công đoạn (tự làm) · Giá thuê ngoài · Năng lực sản xuất |
| Vận tải | `Trans_Sea`, `Trans_Inland_Origin`, `Trans_Inland_Dest`, `Trans_Local_Charges` | Cước biển · Nội địa đầu đi · Nội địa đầu đến · Phí địa phương |
| Danh mục | `Suppliers`, `Ports`, `Processes`, `FX_Rates`, `Config`, `Staff` | Nhà cung cấp 360° · Cảng 360° · Công đoạn 360° · Tỷ giá · Danh sách chọn · Người dùng app |

## 0. File dữ liệu R03 (thay R02)

Dùng **Cost_Input_Database_Part2_R03_EN.xlsx** (sửa từ R02 bằng `tools/fix_cost_r03.py`, sửa thẳng XML, giữ nguyên 130 dropdown / kiểm tra ngày):

| Thay đổi | Lý do |
| --- | --- |
| `FX_Rates` thêm cột G `fx_id` (FX-00001), Excel Table mở rộng tới G | App cần 1 mã để sửa / xóa từng dòng tỷ giá; app vẫn chặn trùng ngày + tiền tệ |
| Sheet mới **`Staff`** (cuối file): staff_id · full_name · email · access_level · active · notes | Đăng nhập + phân quyền; dòng 4 = Admin đầu tiên `jackn.pmp@gmail.com` (đổi tên ở cột full_name) |
| DataDictionary thêm 7 dòng (fx_id + 6 cột Staff); README tiêu đề R03 + mục "7. WEB APP (R03)" | Từ điển đủ cho app |

Bố cục sheet **giữ nguyên**: dòng 1 tiêu đề, **dòng 2 mã cột** (app đọc theo dòng này), dòng 3 nhãn, dữ liệu từ dòng 4; cột công thức (xám) app không ghi đè.

## 1. Cài đặt lần đầu (khoảng 20 phút)

1. **Dữ liệu**: tải `Cost_Input_Database_Part2_R03_EN.xlsx` lên Google Drive → mở bằng Google Sheets → Tệp → *Lưu dưới dạng Google Trang tính*. Kiểm tra nhanh: `Mat_SteelPlate!S4` (FX rate) = 1, `T4` = 15500; `FX_Rates!C4` = VND.
2. **Admin**: sheet `Staff` dòng 4 đã có `jackn.pmp@gmail.com · Admin · Y`. Thêm người khác ở các dòng dưới (hoặc trong app sau khi vào được).
3. **Apps Script**: Tiện ích mở rộng → Apps Script. Xóa `Code.gs` mặc định. Tạo **23 file** theo thư mục `src/` (bảng ở `CHANGED_FILES.md`):
   - File `.gs` (16): **+** → *Tập lệnh*. File `.html` (7): **+** → *HTML*.
   - Tên file không kèm đuôi, phân biệt chữ hoa / thường (vd `01_Config`, `20_Cost`, `Custom`).
4. **Manifest**: Cài đặt dự án (⚙) → bật *Hiển thị tệp kê khai "appsscript.json"* → dán `appsscript.json`.
5. **Cài đặt app**: tải lại Sheet → menu **LSB Cost App › Cài đặt app** → cấp quyền. Hộp thoại phải báo **✔ Cấu trúc khớp** (sheet `Activity_log` được tạo tự động).
6. **Triển khai**: Triển khai → *Triển khai mới* → **Ứng dụng web** · *Thực thi với tư cách*: **Người dùng truy cập ứng dụng web** · *Người có quyền truy cập*: **Bất kỳ ai có tài khoản Google** → copy URL.
7. **Chia sẻ Google Sheet**: Viewer → *Người xem*; Editor / Admin → *Người chỉnh sửa*. Gửi URL Web App.

Phân quyền (đã chốt): **Viewer** chỉ xem · **Editor** nhập báo giá (vật tư, sản xuất, vận tải) và sửa Nhà cung cấp / Cảng / Công đoạn · **Admin** thêm: Tỷ giá, Danh sách chọn (Config), Người dùng app, xóa dữ liệu. Thu hồi: Active = N + gỡ chia sẻ Sheet.

## 2. Nghiệm thu (dùng dữ liệu thật R03)

| # | Thao tác | Kết quả đúng |
| --- | --- | --- |
| 1 | Mở URL bằng jackn.pmp@gmail.com | Menu: Dashboard · Bảng giá vật tư · Sản xuất (3) · Vận tải (4) · Danh mục (6) · Nhật ký thay đổi · Tài khoản; chân menu **v1.0.0** |
| 2 | Mở bằng email không có trong `Staff` | Màn hình "Không vào được ứng dụng" |
| 3 | Dashboard › **Giá tham chiếu** | KPI "12 / 12"; 12 dòng, Thép tấm = **15,500** (XYZ Supplier), Paint = 85,000; bấm 1 dòng → hiện từng NCC "15,500 VND × 1 = 15,500" |
| 4 | Dashboard › **Sản xuất & vận tải** | Cutting tự làm **1,000** (cơ cấu 4 màu) · thuê ngoài 1,200 → "Tự làm rẻ hơn 20%"; cước PORT-01 → PORT-02 40' HC = **35,100,000** (1,350 USD × 26,000) |
| 5 | Dashboard › **Kiểm tra dữ liệu** | 27 dòng "Dòng ví dụ của file mẫu" (mục Thiếu / Lưu ý) — xóa hoặc ghi đè trước khi dùng thật |
| 6 | Bảng giá vật tư → nút **Sơn** → **+ Thêm sơn** | Mã hiện ngay **MPT-00002 · mã dự kiến**; chỉ "Mã NCC" có dấu *; nhập NCC + giá → Lưu |
| 7 | Nhập vài ô → bấm × → mở lại form | "Đã khôi phục bản nháp" đủ dữ liệu |
| 8 | Nhập báo giá tiền **IDR** | Lưu được + cảnh báo "Chưa có tỷ giá IDR…"; Kiểm tra dữ liệu báo; ô Unit price (base) trong Sheet trống |
| 9 | Nhập báo giá với Mã NCC gõ tay `SUP-9999` | Lưu được + cảnh báo; Kiểm tra dữ liệu báo "không có trong Suppliers" (như R02) |
| 10 | Tỷ giá → thêm USD ngày 01/10/2026 | Bị chặn "Đã có tỷ giá USD ngày 2026-10-01 (FX-00001)" |
| 11 | Nhà cung cấp → **XYZ Supplier** | NCC 360°: 12 báo giá, tab Vật tư / Sản xuất / Vận tải / Tài liệu; "+ Thêm báo giá…" → chọn Cước biển → Mã NCC điền sẵn SUP-0001 |
| 12 | Cảng → PORT-01 · Công đoạn → PRO-01 | Cảng 360°: tuyến đi 1, phí địa phương 1, nội địa 1 · Công đoạn 360°: tự làm 1,000, thuê ngoài 1,200, năng lực 1,500 ton / month |
| 13 | Danh sách chọn → Unit → thêm dòng `bộ` → Lưu | Sheet `Config!C` có thêm `bộ`; form vật tư gợi ý `bộ` ngay; xóa `kg` → cảnh báo "còn N dòng dùng" |
| 14 | Bấm **EN** | Toàn bộ giao diện tiếng Anh (tab, nhãn cột, ghi chú); tải lại vẫn EN; bấm VN trở lại |
| 15 | Nhật ký thay đổi | Thấy các thao tác trên (cả sửa danh sách Unit) |
| 16 | Điện thoại | Dashboard, Bảng giá vật tư, NCC 360° không tràn ngang (bảng cuộn trong khung) |

## 3. Quy tắc app (đã chốt 25/10/2026)

| Hạng mục | Quy tắc |
| --- | --- |
| Mã | Theo mẫu file: `MSP-00001`… (5 số), `SUP-0001` (4), `PORT-01` / `PRO-01` (2), `FX-00001`, `STF-001`; hiện trước khi mở form, cấp chính thức lúc Lưu, số đã cấp không dùng lại |
| Bắt buộc | Chỉ PK + FK quan hệ (Mã NCC, Mã công đoạn, POL / POD, cảng…); cột có dấu * trong file thành "nên có" → cờ **Thiếu dữ liệu**. Tỷ giá và Người dùng app (danh mục Admin) giữ bắt buộc |
| Mã lạ | FK mềm: mã chưa có trong Suppliers / Ports / Processes vẫn lưu, cảnh báo, hiện ở Kiểm tra dữ liệu (như R02) |
| Danh sách chọn | Đọc **trực tiếp** sheet `Config` (dòng 7 = tên, 8–107 = giá trị): thêm trong Sheet hoặc trong app đều thấy ngay; giá trị ngoài danh sách chỉ cảnh báo; Currency phải giữ tiền gốc |
| Tiền gốc / tỷ giá | `Config!B3` (VND). Tỷ giá = dòng FX_Rates cùng tiền tệ, ngày mới nhất ≤ ngày báo giá; tiền gốc = 1. App **tính lại** từ cột gốc, không đọc cột công thức |
| Hiệu lực | Sắp áp dụng (effective_date > hôm nay) · Hết hạn (valid_until < hôm nay) · Không thời hạn (valid_until trống = còn hiệu lực) |
| Cùng mặt hàng | Cùng sheet nhóm + cùng 5 cột Spec + cùng ĐVT |
| Giá tham chiếu | Mỗi NCC lấy báo giá mới nhất; thấp nhất trong các dòng còn hiệu lực (giá quy đổi) |
| Cảnh báo (chuông) | Báo giá mới nhất của NCC còn ≤ **14 ngày**; mặt hàng / tuyến / công đoạn không còn NCC nào có giá hiệu lực |
| Tỷ giá | Chặn trùng ngày + tiền tệ; cảnh báo khi tiền tệ = tiền gốc |
| Lưu khác | Phí địa phương: cảnh báo khi không có số tiền lẫn %; Nội địa đầu đi: Port cần cảng đến, Site cần công trình; ngày hiệu lực đến không trước ngày báo giá |
| Ghi Sheet | Không ghi đè cột công thức; dùng lại dòng trống dựng sẵn (tới dòng 503), hết dòng thì thêm dòng + chép công thức từ dòng 4. Xóa = làm trống dòng; không xóa được NCC / cảng / công đoạn còn được dùng |

## 4. Đổi cấu trúc file dữ liệu

Đổi / thêm cột trong Sheet → chạy **LSB Cost App › Kiểm tra cấu trúc** → xuất .xlsx gửi lại để sinh lại config:
```bash
python3 -I tools/extract_cost.py <file.xlsx>     # đọc DataDictionary + dòng 2 mã cột + Config
python3 -I tools/spec_cost.py                     # quyết định đã chốt + nhãn VN/EN → tools/app_spec.json
python3 -I tools/gen_config.py                    # → src/01_Config.gs, src/12_Labels.gs
```
Thêm cột mới: thêm dòng vào **DataDictionary** (bảng, mã cột, nhãn, kiểu, bắt buộc, khóa, cách điền, mô tả) + nhãn tiếng Việt trong `tools/spec_cost.py`.

## 5. Kiểm thử

`node test/backend.test.js` (35 ca chung + 9 ca nghiệp vụ) · `node test/ui.test.js` (10 ca chung + 9 ca giao diện, Chromium desktop + 390px). Kết quả bản này: **44/44 backend, 19/19 giao diện** — mô phỏng Apps Script, **chưa chạy trên Google thật**.

Bộ khung đã chỉnh cho file này (ghi để cập nhật skill): `Data.gs` (dòng tiêu đề / dòng dữ liệu đầu theo `APP.HEADER_ROW` / `FIRST_DATA_ROW`, `idDigits`, `Config_lists_()` đọc danh sách trực tiếp), `10_Form.gs` (`idDigits`), `Validation.gs` + `config_template.gs` (danh sách trực tiếp), `02_Router.gs` (kiểm sheet danh sách), `gen_config.py`, `test/mock.js`, `test/backend.test.js`, `test/ui.test.js`.
