---
name: mth-webapp-making
description: Dựng và nâng cấp Web App quản lý dữ liệu (Google Sheets làm CSDL + Google Apps Script) từ file Excel/Google Sheets database của MTH / Lucky Steel Building — CRM, bán hàng, đấu thầu, dự án, sản xuất, giao hàng, nhân sự, OKR, công việc, kho, mua hàng, tài chính. Dùng skill này BẤT CỨ KHI NÀO người dùng gửi file xlsx database và muốn có app/form nhập liệu/dashboard trên đó; muốn nâng cấp, sửa lỗi hay thêm tính năng cho Web App Apps Script đang chạy (LSB CRM, LSB_PSE06_CRMApps, bản v2.x); muốn duyệt bản mẫu dashboard rồi cập nhật script; hoặc muốn chuẩn hóa/sửa file xlsx database (thêm cột, dropdown, công thức #REF!, ERD_Dictionary) mà không mất dropdown — kể cả khi họ không nói chữ "skill" hay "web app".
---

# mth-webapp-making — Web App Google Sheets + Apps Script cho mọi database

Skill này đóng gói cách đã làm LSB CRM (v2.0 → v2.6) thành **bộ khung dùng chung**: mỗi database mới chỉ cần sinh cấu hình từ file xlsx, phỏng vấn để chốt quyết định, rồi viết phần nghiệp vụ riêng. Đọc file này trước, rồi chỉ mở file `references/` cần cho bước đang làm.

## Nguyên tắc làm việc (người dùng đã chốt)

1. **Không giả định — phỏng vấn trước khi làm.** Mọi điểm chưa rõ (PK/FK suy đoán, ý nghĩa cột, trạng thái, công thức, cách tính số liệu) hỏi bằng AskUserQuestion, tối đa 4 câu/lượt, có phương án đề xuất ghi "(Recommended)". Không hỏi điều đọc được từ file. Danh sách câu hỏi: `references/interview.md`.
2. **Bản mẫu giao diện để duyệt trước khi sửa script** (Dashboard, trang 360° riêng, màn hình mới): dựng trang mẫu bằng Artifact với dữ liệu thật trích từ file (+ nút xem dữ liệu minh hoạ khi dữ liệu thật quá ít), có mục "Cách tính" ghi bảng/cột. Chỉ viết code sau khi người dùng nói duyệt.
3. **Test mô phỏng trước khi giao**: backend (Node, mô phỏng Apps Script) + giao diện (Chromium) + smoke test trên dữ liệu thật. Báo đúng kết quả; ca chập chờn thì chạy lại và nói rõ. Luôn ghi "chưa chạy trên Google thật".
4. **Tính năng chuẩn mọi app**: song ngữ VN/EN; form có nháp tự lưu, mã PK hiện trước, FK điền theo ngữ cảnh, chỉ bắt buộc PK + FK, cờ "Thiếu dữ liệu". **Mặc định có, hỏi để tắt**: phân quyền theo bảng nhân sự + nhật ký thay đổi; cảnh báo theo hạn + trang 360°.
5. **Bàn giao**: zip đầy đủ + `HUONG_DAN_CAI_DAT.md`; **bảng file thay đổi** (MỚI / SỬA / không đổi) để dán nhanh; file bàn giao context `.md` cập nhật; đẩy lên GitHub `jacknpmp-mint/Jack_Ngo` thư mục `webapps/<tên_app>/` trên nhánh làm việc của session.
6. **Sửa xlsx bằng XML** (`scripts/xlsx_xml.py`), không lưu qua openpyxl (mất dropdown x14). Luôn ghi file mới tăng phiên bản, không ghi đè file gốc.
7. Không ghi tên model vào commit/file bàn giao. Ngôn ngữ trao đổi: tiếng Việt.

## Xác định tình huống

| Tình huống | Dấu hiệu | Đi tới |
| --- | --- | --- |
| **A. App mới** từ file database | gửi xlsx, "làm app / web app / form nhập cho DB này" | Quy trình A |
| **B. Nâng cấp app đang chạy** | gửi zip vX.Y / file bàn giao `.md`, báo lỗi, xin dashboard / tính năng | Quy trình B |
| **C. Sửa / chuẩn hóa xlsx** | thêm cột, dropdown, sửa #REF!, ERD_Dictionary | `references/db_conventions.md` |

Đầu vào cần có (thiếu thì xin): file xlsx đang dùng thật; với B thêm zip bản đang chạy và file bàn giao `.md` lần trước. Giải nén file người dùng vào thư mục riêng; chạy Python với `-I`.

## Quy trình A — App mới

`<SKILL>` = thư mục skill này; `APP` = `webapps/<tên_app>/` trong repo (hoặc thư mục làm việc).

1. **Dựng khung + đọc DB**
   ```bash
   python3 -I <SKILL>/scripts/scaffold.py APP
   cd APP && python3 -I tools/extract_xlsx.py <file.xlsx>      # → tools/schema_raw.json, test/data_real.json
   python3 -I tools/gen_config.py --init                        # → tools/app_spec.json (NHÁP, suy đoán)
   ```
   Đọc kỹ phần "CẦN XÁC NHẬN" (tiền tố, PK/FK suy đoán, công thức chỉ ở dòng 2, mã không theo mẫu).
2. **Phỏng vấn** theo `references/interview.md` (vòng 1 cấu trúc → vòng 2 nghiệp vụ → vòng 3 giao diện/vai trò). Ghi mọi quyết định vào `tools/app_spec.json` (định dạng: `references/architecture.md` › app_spec.json) — đây là nguồn sự thật, không sửa tay `01_Config.gs`.
3. **Sinh app + nhãn**: `python3 -I tools/gen_config.py`. Bổ sung nhãn VN/EN còn thiếu (và bản EN của ghi chú tiếng Việt) vào `app_spec.json › labels`, sinh lại tới khi hết báo thiếu.
4. **Dữ liệu test**: `cp test/data_real.json test/data.json` (hoặc làm sạch/bổ sung dữ liệu mẫu nếu file thật gần như trống — ghi rõ là minh hoạ).
5. **Test khung**: `node test/backend.test.js && node test/ui.test.js`; xem ảnh `test/shots/`. App lúc này đã chạy được: danh sách + 360° mọi bảng, form, Dashboard chung (KPI, theo quý, cảnh báo, Kiểm tra dữ liệu).
6. **Phần nghiệp vụ riêng** (chỉ những gì người dùng cần, sau khi duyệt bản mẫu): Dashboard tab nghiệp vụ, trang 360° có KPI, quy tắc lưu, tự điền — xem `references/modules.md` (có ví dụ LSB). Thêm ca test riêng `test/custom.test.js` / `test/custom.ui.js`.
7. **Bàn giao** theo `references/delivery.md`.

## Quy trình B — Nâng cấp app đang chạy

1. Đọc file bàn giao `.md` (quyết định đã chốt, điểm mở, lỗi dữ liệu tồn tại) và mã nguồn bản đang chạy. Bản LSB v2.x có kiến trúc riêng (module 04_Project/05_Customer…) — sửa trực tiếp theo đúng phong cách file đó, tham khảo `examples/lsb_v2.6/`. App dựng từ bộ khung: sửa phần riêng (`app_spec.json`, `Custom.html`, `2*_*.gs`); cập nhật lõi bằng `scaffold.py APP --update`.
2. So cấu trúc file xlsx mới với config: chạy `extract_xlsx.py` rồi `gen_config.py --check` (app khung) hoặc so tay với `01_Config.gs` (LSB). Đổi cột → hỏi người dùng trước khi sinh lại.
3. Phỏng vấn phần thay đổi → bản mẫu (nếu có giao diện) → duyệt → code → test (giữ toàn bộ ca cũ xanh, thêm ca mới) → tăng `APP.VERSION`.
4. Bàn giao: `package_app.py --prev <thư mục bản trước>` tự lập bảng file MỚI/SỬA/không đổi; hướng dẫn thêm mục "0. Thay đổi vX.Y" lên đầu `HUONG_DAN_CAI_DAT.md` kèm bước nghiệm thu đánh số tiếp.

## Bộ khung (assets/starter) — tóm tắt

Server: `01_Config` (SINH) · `02_Router` (api duy nhất + menu Sheet) · `03_Auth` · `04_Entity` (danh sách, 360°, quy tắc chung, kiểm tra dữ liệu) · `05_Dashboard` · `08_Activity` · `09_User` · `10_Form` · `11_I18n` · `12_Labels` (SINH) · `Data` · `Validation` · `Notification` · `Utils` · `Error`.
Client: `Index` · `Styles` · `JS` · `Components` (form tự sinh, nháp, tự điền, danh mục, nhật ký, tài khoản) · `Entity` · `Dashboard` · `Custom` (riêng từng DB).
Điểm nối module riêng: `HOOK_PROVIDERS`, `ROUTE_PROVIDERS`, `RELATED_PROVIDERS`, `ENTITY_EXTRA_PROVIDERS`, `ALERT_PROVIDERS`, `CHECK_PROVIDERS`, `DASHBOARD.providers` (khai báo trong `app_spec.json › providers`). Chi tiết: `references/architecture.md`.

## Tài liệu tham chiếu

| File | Khi nào đọc |
| --- | --- |
| `references/interview.md` | Trước mỗi vòng phỏng vấn — câu hỏi theo bước và theo loại DB |
| `references/architecture.md` | Khi sửa `app_spec.json`, viết module, hiểu luồng dữ liệu |
| `references/modules.md` | Khi viết Dashboard nghiệp vụ, 360° riêng, hook, tự điền, test riêng |
| `references/db_conventions.md` | Khi đọc/sửa file xlsx, gặp cảnh báo PK/FK/công thức |
| `references/delivery.md` | Khi đóng gói, viết hướng dẫn, file bàn giao, đẩy GitHub |
| `references/lessons.md` | Trước khi giao — các lỗi đã gặp ở LSB, kiểm lại |
| `examples/lsb_v2.6/` | Mã LSB đang chạy thật: Dashboard 4 tab, Dự án 360°, công nợ theo Dự án → Lô → Đợt |
