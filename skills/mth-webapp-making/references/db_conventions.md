# Quy ước file database (.xlsx / Google Sheet) và cách sửa

## Quy ước (theo file LSB — các DB của người dùng phần lớn theo, đôi khi thiếu)

| Thành phần | Quy ước | extract_xlsx.py nhận diện |
| --- | --- | --- |
| Bảng | Mỗi bảng 1 sheet, tên `<TIỀNTỐ>_<Tên>` (LSB_project, HR_Task) | tiền tố phổ biến nhất (hoặc `--prefix`) |
| Tiêu đề | Dòng 1; dữ liệu từ dòng 2 | — |
| Màu tiêu đề | Cam `A7650F` = PK · Xanh `1D5C96` = FK · Xám `7A8894` = AUTO (công thức) · Navy `1F2F3D` = nhập tay | màu ô dòng 1 |
| Ghi chú tiêu đề | "Nhập tay / Khóa ngoại / Cột AUTO…\nKiểu: string|number|date\n<mô tả>" | dòng `Kiểu:` → kiểu cột (không có thì đoán từ dữ liệu) |
| PK | Cột đầu, mã `XX-NĂM-STT` (giao dịch) hoặc `XX-STT` (danh mục) | màu cam → không có: cột đầu (⚠) |
| FK | Dropdown trỏ `<Bảng>!$A$2:$A$n` (thường là dropdown x14) | dropdown → không có: tên cột trùng PK bảng khác (⚠) |
| Danh mục | Sheet `Lists`: mỗi cột 1 danh mục, dòng 1 = tên; dropdown trỏ `Lists!$X$2:$X$n` | tên danh mục = tiêu đề cột Lists |
| AUTO | Công thức kéo sẵn dòng 2 → ~301 (Year/Quarter, tra cứu, Collected/Balance/Pay_status) | công thức ở > 1 dòng |
| Từ điển | Sheet `ERD_Dictionary` (Bảng, Nhóm, Cột, Kiểu, Khóa, Tham chiếu, Nhập/Auto, Ghi chú, Thay đổi) | cột Ghi chú → note |
| Khác | `Dashboard`, `Huong_dan` — bỏ qua khi sinh app | — |

## Xử lý khi file thiếu quy ước

Mọi suy đoán in ở "CẦN XÁC NHẬN" → hỏi người dùng (vòng 1) → ghi vào `app_spec.json`:
- PK sai cột → không hỗ trợ đổi PK khác cột đầu: đề xuất chuyển cột (sửa xlsx) hoặc chấp nhận cột đầu.
- FK không có dropdown → `tables.<T>.fk: { "Cột": "Bảng" }` (hoặc thêm dropdown vào xlsx bằng xlsx_xml.py).
- Mã cũ không theo mẫu → giữ mã cũ, khai báo `prefix` + `idStyle` cho mã mới; FK trỏ tới mã cũ nhập tay → `soft`.
- Công thức chỉ ở dòng 2 (LSB v4.3: VND, ETA) → app coi là cột nhập; nếu là giá trị suy ra → `calc` (tự tính khi để trống) hoặc kéo công thức xuống bằng xlsx_xml.py.
- Tên cột gây hiểu nhầm (LSB `Invoice_code` là ngày) → hỏi, ghi chú vào `notes`, đề xuất đổi tên ở phiên bản DB sau.

## Sửa file xlsx bằng XML (scripts/xlsx_xml.py)

**Vì sao**: openpyxl khi LƯU làm mất dropdown x14 (FK, Lists) — file LSB có 35–53 dropdown x14/bảng. Chỉ dùng openpyxl để ĐỌC.

```python
import sys; sys.path.insert(0, 'tools'); from xlsx_xml import Book
b = Book('LSB_..._v4.5_Project.xlsx'); before = b.count_dropdowns()
b.fill_formula('LSB_shipment', 'L', '=IF(J{r}="","",J{r}+14)', 2, 301)      # kéo công thức ETA_plan
b.add_dropdown('LSB_project', 'D2:D301', 'LSB_Quotation!$A$2:$A$2000')        # FK x14, kiểu cảnh báo
b.set_cell('LSB_cost', 'L1', 'Invoice_no', style_from='K1')                    # cột mới (chép kiểu tiêu đề)
b.set_style('LSB_cost', 'L1', 'K1')                                            # màu tiêu đề theo vai trò (PK/FK/AUTO/nhập tay)
b.set_comment('LSB_cost', 'L1', 'Nhập tay\nKiểu: string\nsố hóa đơn')        # thêm mới hoặc sửa ghi chú
b.replace('Dashboard', '#REF!', 'LSB_paid!$E:$E')                               # sửa công thức hỏng
b.save('LSB_..._v4.6_Project.xlsx'); after = b.count_dropdowns()
```
Sau khi sửa:
1. So `before`/`after` dropdown (không được giảm).
2. Mở bằng openpyxl (chỉ đọc) để chắc file không hỏng; chạy `extract_xlsx.py` trên file mới — PK/FK/danh mục đúng như mong muốn.
3. Cập nhật `ERD_Dictionary` (thêm dòng cột mới, cột "Thay đổi vX → vY").
4. Lưu script sửa vào `tools/fix_<db>_<vY>.py` (làm lại được), ghi danh sách thay đổi vào file bàn giao.
5. Không ghi đè file gốc; tên file tăng phiên bản. Nhắc người dùng: tải file mới lên Google Drive → mở bằng Google Sheets (hoặc chép sheet) — app đọc theo TÊN cột nên thêm cột không làm hỏng app, nhưng cần sinh lại config để app thấy cột mới.

Giới hạn xlsx_xml.py: sheet chưa có ghi chú nào, chèn cột giữa (dịch cột), đổi tên sheet → làm trong Excel/Google Sheets rồi gửi lại file. Thêm cột: luôn thêm ở CUỐI bảng (app đọc theo tên cột nên thứ tự không quan trọng).

## Kiểm tra cấu trúc trên Google thật

Menu trong Sheet `<APP.MENU_TITLE> › Kiểm tra cấu trúc` so tiêu đề sheet với SCHEMA: thiếu sheet/cột (lỗi), cột AUTO không có công thức ở dòng 2 (cảnh báo), cột thừa (thông tin), công thức `#REF!` (lỗi). Người dùng đổi cột → chạy kiểm tra, xuất .xlsx gửi lại để sinh lại config.
