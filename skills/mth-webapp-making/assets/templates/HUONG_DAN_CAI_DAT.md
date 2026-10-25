# {{APP_NAME}} — Web App v{{VERSION}} (Google Sheets + Apps Script)

Web App quản lý {{MÔ_TẢ}} trên file **{{FILE_XLSX}}** ({{N_BẢNG}} bảng / {{N_CỘT}} cột). Dựng bằng bộ khung `mth-webapp-making`.

| Nhóm | Bảng | Menu trong app |
| --- | --- | --- |
| {{Nhóm}} | {{bảng…}} | {{mục menu}} |

## 0. Thay đổi v{{VERSION}}

**Cập nhật từ v{{PREV}}:** (dán bảng từ CHANGED_FILES.md — file MỚI / SỬA, không đổi)

Sau khi dán: **Triển khai → Quản lý triển khai → ✏ → Phiên bản: Phiên bản mới → Triển khai**. Chân menu trái và trang *Tài khoản* phải hiện **{{VERSION}}**.

**Nội dung thay đổi:** …
**Quy ước tính đã chốt:** (bảng)
**Nghiệm thu v{{VERSION}} (bước …):** …

## 1. Cài đặt lần đầu (khoảng 15 phút)

1. **Dữ liệu**: tải `{{FILE_XLSX}}` lên Google Drive → mở bằng Google Sheets → Tệp → *Lưu dưới dạng Google Trang tính*.
2. **Admin**: sheet `{{STAFF_TABLE}}` phải có dòng email Google thật của bạn với `Access_level = Admin`, `Active = Y`.
3. **Apps Script**: Tiện ích mở rộng → Apps Script. Xóa `Code.gs` mặc định. Tạo **{{N_FILE}} file** theo thư mục `src/`:
   - File `.gs`: **+** → *Tập lệnh*. File `.html`: **+** → *HTML*.
   - Tên file không kèm đuôi, phân biệt chữ hoa/thường.
4. **Manifest**: Cài đặt dự án (⚙) → bật *Hiển thị tệp kê khai "appsscript.json"* → dán `appsscript.json`.
5. **Cài đặt app**: tải lại Sheet → menu **{{MENU_TITLE}} › Cài đặt app** → cấp quyền. Hộp thoại phải báo **✔ Cấu trúc khớp**.
6. **Triển khai**: Triển khai → *Triển khai mới* → **Ứng dụng web** · *Thực thi với tư cách*: **Người dùng truy cập ứng dụng web** · *Người có quyền truy cập*: **Bất kỳ ai có tài khoản Google** → copy URL.
7. **Chia sẻ Google Sheet**: Viewer → *Người xem*; Editor/Admin → *Người chỉnh sửa*. Gửi URL Web App.

Phân quyền: thêm người vào `{{STAFF_TABLE}}` (app: Danh mục, cần Admin) với Email, Access_level (Viewer / Editor / Admin), Active = Y **và** chia sẻ Sheet. Thu hồi: Active = N + gỡ chia sẻ.

## 2. Nghiệm thu

| # | Thao tác | Kết quả đúng |
| --- | --- | --- |
| 1 | Mở URL bằng email Admin | Menu: Dashboard · {{các mục}} · Nhật ký thay đổi · Tài khoản |
| 2 | Mở bằng email không có trong {{STAFF_TABLE}} | Màn hình "Không vào được ứng dụng" |
| 3 | Dashboard › Kiểm tra dữ liệu | Liệt kê đúng các điểm lệch của file thật: {{…}} |
| 4 | {{Bảng chính}} → + Thêm | Mã hiện ngay `{{XX}}-<năm>-<số> · mã dự kiến`; chỉ ô FK quan hệ có dấu * |
| 5 | Nhập vài ô → bấm × → mở lại form | "Đã khôi phục bản nháp" đủ dữ liệu |
| 6 | Mở 360° một bản ghi → tab bảng con → + Thêm | FK cha điền sẵn |
| 7 | Bấm **EN** | Toàn bộ giao diện tiếng Anh; tải lại trang vẫn EN; bấm VN trở lại |
| 8 | Nhật ký thay đổi | Thấy các thao tác trên |

## 3. Quy tắc app

- Mã `TIỀNTỐ-NĂM-STT` (giao dịch) / `TIỀNTỐ-STT` (danh mục); số đã cấp không dùng lại.
- Không ghi đè cột công thức. Xóa = làm trống dòng; không cho xóa khi còn bản ghi con.
- Chỉ bắt buộc PK + FK quan hệ; cột "nên có" để trống → cờ **Thiếu dữ liệu**.
- {{Quy tắc nghiệp vụ riêng}}
- Dashboard / 360° tính lại từ dữ liệu gốc.

## 4. Đổi cấu trúc file dữ liệu

Đổi / thêm cột trong Sheet → chạy **{{MENU_TITLE}} › Kiểm tra cấu trúc** → xuất .xlsx gửi lại để sinh lại `01_Config.gs` / `12_Labels.gs` (`tools/extract_xlsx.py` + `tools/gen_config.py`).

## 5. Kiểm thử

`node test/backend.test.js` · `node test/ui.test.js` (Chromium). Kết quả bản này: {{x/x}} backend, {{y/y}} giao diện — **chưa chạy trên Google thật**.
