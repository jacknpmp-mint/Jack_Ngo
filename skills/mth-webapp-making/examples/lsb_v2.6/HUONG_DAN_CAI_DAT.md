# LSB CRM · Project — Web App v2.6 (Apps Script)

Bản **v2.6** (= v2.5 + Dashboard 4 tab; dùng được với file v4.3_Project và v4.5_Project — cấu trúc cột giống nhau) dùng để **quản lý dự án** trên file **LSB_CRM_Bidding_Project_DB_v4.3_Project.xlsx**. File này có **11 bảng / 141 cột / 16 quan hệ** (ERD ở sheet `ERD_Dictionary` và file `data/ERD_v4.3_Project.mmd`).

| Nhóm | Bảng | Menu trong app |
| --- | --- | --- |
| Khách hàng | LSB_Lead, LSB_Customer | Lead & Khách hàng (+ Lead 360°) |
| Triển khai | LSB_project, LSB_Project_task, LSB_shipment, LSB_Project_handover_lesson | Dự án (+ Dự án 360°: đầu việc, lô hàng, bài học) |
| Tài chính | LSB_payment_plan, LSB_paid, LSB_cost | Trong Dự án 360°: tab Thanh toán, tab Chi phí |
| Danh mục | LSB_Staff, LSB_Task | Nhân sự, Đầu việc chuẩn (Admin sửa) |
| Hệ thống | LSB_Activity_log (app tự tạo) | Nhật ký thay đổi, Tài khoản |

## 0. Thay đổi v2.6 — Dashboard 4 tab (đã duyệt theo bản mẫu 25/10/2026)

**Cập nhật từ v2.5 lên v2.6 — chỉ dán đè 4 file (không có file mới, không đổi Sheet):**

| # | File trong Apps Script | Loại | Thay đổi |
| --- | --- | --- | --- |
| 1 | `Dashboard.html` | HTML | **Viết lại** trang Dashboard: 4 tab, bộ lọc, USD/VND, cây Dự án → Lô → Đợt, kiểm tra dữ liệu |
| 2 | `04_Project.gs` | Tập lệnh | Thêm hàm `Project_board_()`; `Project_dashboard_()` trả thêm `board` (dữ liệu cho 4 tab). Các hàm khác giữ nguyên |
| 3 | `Styles.html` | HTML | Thêm khối CSS `Dashboard 4 tab (v2.6)` ngay trước `Mobile` |
| 4 | `01_Config.gs` | Tập lệnh | Chỉ đổi `VERSION: '2.6.0'` (để kiểm tra đã triển khai đúng bản) |

Sau khi dán: **Triển khai → Quản lý triển khai → ✏ → Phiên bản: Phiên bản mới → Triển khai**. Chân menu trái và trang *Tài khoản* phải hiện **2.6.0**.

Không đổi: các file còn lại (`02_Router`, `03_Auth`, `05_Customer`, `06_Bidding`, `07_Quotation`, `08_Activity`, `09_User`, `10_Form`, `11_I18n`, `Data`, `Error`, `Notification`, `Utils`, `Validation`, `appsscript.json`, `Components`, `Customer`, `Bidding`, `Index`, `JS`, `Project`).

**Nội dung Dashboard v2.6**

- **Bộ lọc** (đầu trang): Năm (có *Tất cả*) · Quý · Khách hàng · Trạng thái dự án · Quốc gia · nút **USD / VND** (VND = USD × 26.000, hiển thị triệu ₫ / tỷ ₫). Đổi tab, bộ lọc, tiền tệ, cửa sổ ngày → vẽ lại ngay, không tải lại; chỉ đổi Năm mới gọi server. Tab, tiền tệ, cửa sổ ngày được nhớ trên trình duyệt.
- **Tab Tổng quan (BGĐ)**: hợp đồng ký / đã thu trong kỳ, còn phải thu, quá hạn, đến hạn N ngày; chi phí trong kỳ, biên LN dự kiến / thực tế, sản lượng tấn, tấn đang sản xuất; **biểu đồ dòng tiền theo tháng** (kế hoạch thu theo Due_day vs đã thu theo Payment_day); danh sách quá hạn + đến hạn; **Cảnh báo** (chuông vẫn mở tới đây); *Bảng theo quý* cũ thu gọn ở cuối.
- **Tab Công nợ & thu tiền (Kế toán)**: KPI; **Kiểm tra dữ liệu** (lần thu trỏ đợt không tồn tại, kế hoạch ≠ giá trị HĐ, Payment_pct × HĐ ≠ Payment_USD, chi phí > HĐ, Tonnage_Actual ≠ tổng tấn các lô); đợt **quá hạn**; đợt **đến hạn** với nút 7 / 14 / 30 / 60 ngày và cột *Hồ sơ cần* (Required_docs); **cây Dự án → Lô hàng → Đợt → từng lần thu** (đợt không gắn lô nằm ở nhánh *Chung dự án*).
- **Tab Sản xuất & giao hàng (PM)**: số lô theo tình trạng; bảng **lô đang sản xuất** (Start_Fab, số ngày đã SX, ETD_plan, còn bao nhiêu ngày / trễ, giá trị đợt thu gắn lô).
- **Tab Khách hàng & thị trường (Sales)**: doanh số HĐ ký trong kỳ theo khách hàng (đã thu, còn nợ, quá hạn); biểu đồ theo **quốc gia** và theo **ngành**.
- **Bấm một dòng** → mở Dự án 360° đúng tab (*Thanh toán* hoặc *Lô hàng*); dòng khách hàng → Lead 360°.
- Mỗi khối có mục **Cách tính** ghi rõ bảng / cột dùng để tính.

**Quy ước tính (đã chốt)**

| Nội dung | Cách tính |
| --- | --- |
| Số theo kỳ (Năm/Quý) | HĐ ký theo `Contract_day`; đã thu theo `LSB_paid.Payment_day`; chi phí theo `LSB_cost.Invoice_code`; tấn đã xuất theo `ETD_actual` — giống sheet Dashboard trong file |
| Số tại hôm nay | Còn phải thu = Contract_USD − tổng đã thu; quá hạn = Balance của đợt `Pay_status` = Overdue; đến hạn = đợt Open/Partial có Due_day trong N ngày tới |
| Trạng thái đợt | Đúng công thức cột `Pay_status`: Paid (thu đủ) → Overdue (quá Due_day) → Partial → Open; app tính lại từ dữ liệu gốc |
| Tình trạng lô (shipment không có cột trạng thái) | Chưa sản xuất (chưa Start_Fab) → Đang sản xuất (Start_Fab ≤ hôm nay, chưa Completed_Fab) → Chờ xuất (có Completed_Fab, chưa ETD_actual) → Đang vận chuyển (có ETD_actual, chưa tới ETA_actual) → Đã đến cảng (ETA_actual ≤ hôm nay; trống thì ETD_actual + 14) |
| Chi phí thực tế | `Cost_USD` có `Cost_status` = Invoiced hoặc Paid; Planned hiện riêng |
| Biên LN | `Grossmargin_EST` / `Grossmargin_Actual` người dùng nhập, bình quân theo giá trị HĐ |
| Quốc gia / ngành / tên khách | Quốc gia `LSB_Customer.Nation`; tên và ngành lấy từ `LSB_Lead` qua `LSB_Customer.Lead_id` |

**Nghiệm thu v2.6 (bước 18–22)**

18. Trang *Tài khoản* hiện **2.6.0**. Dashboard có 4 tab.
19. Tab *Công nợ*: khối *Kiểm tra dữ liệu* liệt kê đúng các điểm lệch của file thật (vd `PD-2026-002` trỏ `PP-2026-002` không tồn tại). Bấm *Mở tất cả* → thấy PJ-2026-001 → Lô 1 → đợt PP-2026-001 (Paid) → lần thu PD-2026-001.
20. Bấm **VND** → số đổi sang triệu ₫; bấm **7 / 60 ngày** → danh sách đến hạn đổi theo.
21. Tab *Sản xuất*: lô SH-2026-001 ở *Đã đến cảng*. Tab *Khách hàng*: PT. Trimulia Bangun Persada · Indonesia · EPC Main Contractor.
22. Bấm một dòng đợt → mở Dự án 360° ở tab *Thanh toán*. Bấm **EN** → toàn bộ Dashboard chuyển tiếng Anh.

## 0-v2.5. Thay đổi v2.5 — song ngữ VN / EN (cho người nước ngoài)

- **Nút VN / EN** ở thanh trên cùng (cạnh chuông). Lựa chọn được nhớ trên trình duyệt. Lần đầu mở: trình duyệt tiếng Việt → VN, ngôn ngữ khác → EN.
- **Dịch toàn bộ phần đang chạy**:
  - menu, tiêu đề, nút, bảng, form, toast, Dashboard, cảnh báo (chuông);
  - thông báo lỗi / cảnh báo do server trả về: trình duyệt gửi ngôn ngữ kèm mỗi lệnh, server trả đúng ngôn ngữ đó.
- **Menu "LSB App" trong Google Sheet** theo ngôn ngữ tài khoản Google của người mở.
- **Nhãn ô nhập thân thiện**: vd *Tên dự án* / *Project name*. Tên cột gốc (`Project_name`) hiện nhỏ bên cạnh để đối chiếu với Sheet. Ghi chú dưới ô cũng có bản tiếng Anh.
- **Không đổi**: tên cột và giá trị danh mục trong Sheet (Status *Kick-off*, Payment_code *Deposit*… vốn là tiếng Anh, cả hai ngôn ngữ thấy giống nhau), dữ liệu người dùng nhập, cấu trúc Sheet.
- Nhật ký thay đổi: ghi chú tự động lưu song ngữ (vd *tự động khi tạo khách hàng / automatic when the customer was created*).
- Module Báo giá & Đấu thầu (`Bidding.html`, `06_Bidding`, `07_Quotation`) đang **tắt** nên chưa dịch. Cần dịch khi bật lại module.
- **Sửa / thêm bản dịch** ở `11_I18n.gs`:
  - `I18N_TABLES`: nhãn bảng;
  - `I18N_COLUMNS`: nhãn cột, khóa `Bảng.Cột` để ghi đè riêng một bảng;
  - `I18N_NOTES_EN`: ghi chú cột tiếng Anh.

  Chuỗi giao diện viết dạng `L('tiếng Việt', 'English')` (trình duyệt) và `L_('…', '…')` (server).

**Cập nhật lên v2.5:**
- **Đang chạy v2.3** (chưa dán v2.4): tạo 2 file mới `10_Form`, `11_I18n` (Tập lệnh). Dán đè 17 file: `01_Config`, `02_Router`, `03_Auth`, `04_Project`, `05_Customer`, `09_User`, `Data`, `Error`, `Notification`, `Validation`, `Components`, `Customer`, `Dashboard`, `Index`, `JS`, `Project`, `Styles`.
- **Đã chạy v2.4**: tạo file mới `11_I18n`. Dán đè 17 file như trên (`10_Form` không đổi).
- Sau đó: **Quản lý triển khai → ✏ → Phiên bản mới**. Trang *Tài khoản* phải hiện **2.5.0**. Bấm **EN** để kiểm tra.

Không đổi: `06_Bidding`, `07_Quotation`, `08_Activity`, `Utils`, `appsscript.json`, `Bidding.html`.

## 0a. Thay đổi v2.4 so với v2.3 (form nhập)

| Lỗi v2.3 | Cách sửa ở v2.4 |
| --- | --- |
| Vô tình thoát form → mất dữ liệu đang nhập | **Nháp tự lưu trên trình duyệt** (localStorage) ~0,4 giây sau mỗi lần gõ, và lưu ngay khi đóng form, tải lại trang hoặc đóng tab. Mở lại form → **tự khôi phục**, có thanh "Đã khôi phục bản nháp … · Bỏ nháp". **Không ghi vào Sheet cho tới khi bấm Lưu.** Bấm ra ngoài khung không còn đóng form |
| Mã PK / FK không tự nhảy | **PK hiện ngay** khi bấm Thêm (vd `PJ-2026-005 · mã dự kiến`). Số chính thức chỉ cấp lúc Lưu, nên bỏ ngang không mất số. Nếu người khác lưu trước, app báo mã thật. **FK điền theo ngữ cảnh** (thêm từ Dự án 360° → Project_id; từ Lead 360° → Lead_id / Customer_id) |
| Quá nhiều trường bắt buộc | Bảng nghiệp vụ **chỉ bắt buộc FK quan hệ** (Customer.Lead_id · project.Customer_id · Project_task.Project_id + Task_id · shipment / lesson / payment_plan / cost.Project_id · paid.PaymentPlan_id). Các kiểm tra khác **giữ như v2.3**: kiểu, min/max, URL/email, FK tồn tại, unique, thứ tự ngày, chặn `=` |

**Chi tiết**

- **Nháp**: 1 nháp Thêm mới / bảng / người; nháp Sửa theo từng mã bản ghi. Giữ **7 ngày**; xóa khi Lưu thành công hoặc bấm *Bỏ nháp*.
  - Nháp Thêm mới thuộc ngữ cảnh khác (vd đang dở cho dự án khác): app hỏi *Khôi phục* / *Bỏ nháp*.
  - Nháp Sửa mà bản ghi trên Sheet đã bị đổi sau đó: app nêu tên cột bị đổi và **không tự khôi phục**.
  - Nháp nằm trên **trình duyệt + máy đang dùng** (không đồng bộ sang máy khác). Xóa dữ liệu trình duyệt hoặc dùng cửa sổ ẩn danh thì mất nháp.
- **Tự điền khi chọn FK** (chỉ điền ô trống hoặc ô app đã điền mà bạn chưa sửa; sửa tay thì giữ nguyên):

  | Form | Chọn / nhập | Tự điền |
  | --- | --- | --- |
  | Khách hàng | Lead_id | Nation, Contact (= Contact_name), Account_owner_id (= Owner_id) |
  | Đầu việc dự án | Task_id + Start_day | Due_day = Start_day + Std_duration_days |
  | Lô hàng | Project_id | Shipment_no = lô kế tiếp; ETA = ETD + 14 |
  | Bài học | Project_id | Handover_day = Project_handover của dự án (trống → hôm nay) |
  | Kế hoạch thanh toán | Project_id + Payment_pct | Payment_USD = % × Contract_USD; Payment_VND = USD × 26000 |
  | Tiền đã thu | PaymentPlan_id | Paid_USD = số còn phải thu của đợt; Paid_VND = USD × 26000 |
  | Chi phí / Dự án | Cost_USD / Contract_USD | Cost_VND / Contract_VND = USD × 26000 |

  Server cũng tính các cột VND khi để trống (giống Contract_VND).
- **Mặc định khi để trống lúc thêm mới**: Lead_status = New · project Status = Kick-off · Cost_status = Planned · Project_task Status = Not started (đã có từ v2.3).
- **Cờ "Thiếu dữ liệu"** do app tính, **không thêm cột vào Sheet**:
  - Bật khi còn trống một cột *nên có*: các cột từng bắt buộc ở v2.3, có dấu **•** cam cạnh tên ô.
  - Badge hiện ở danh sách Dự án, danh sách Lead, tiêu đề 360° và từng dòng trong các tab 360°.
  - Ô lọc **Thiếu dữ liệu** có ở danh sách Dự án và Lead & Khách hàng.
  - Muốn coi thêm cột khác là *nên có*: khai báo trong `FORM_NEED_EXTRA` (file `10_Form.gs`), vd `LSB_project: ['Contract_USD', 'PM_id']`.
- **Danh mục** LSB_Staff / LSB_Task (chỉ Admin sửa) **giữ bắt buộc như v2.3**, vì cần Email + Access_level + Active để đăng nhập.

**File thay đổi (dán vào Apps Script):**

| File | Thay đổi |
| --- | --- |
| `10_Form.gs` | **Mới** (Tập lệnh). Chính sách bắt buộc / `need`, cột VND tự tính, `Form_peekId_`, `Form_related_`, `Form_missing_` |
| `01_Config.gs` | `VERSION` 2.4.0; gửi hằng số tỷ giá / ngày vận chuyển xuống trình duyệt (`consts`) |
| `02_Router.gs` | Route `record.peekId` (Editor), `record.related` (Viewer); áp `10_Form.gs` trước mỗi lệnh |
| `Data.gs` | Tính lại cột calc sau hook (Payment_VND khi Payment_USD vừa tính từ %) |
| `04_Project.gs` | Mặc định Status / Cost_status; cột `Missing` + lọc `missing` trong danh sách dự án |
| `05_Customer.gs` | Mặc định Lead_status; `Missing` + lọc `missing` trong danh sách lead |
| `Validation.gs` | Chỉ sửa chú thích |
| `Components.html` | Form: nháp, mã dự kiến, tự điền, không đóng khi bấm ra ngoài; badge Thiếu dữ liệu |
| `JS.html` | `App.missing`, `Fmt.addDays`, báo mã chính thức khác mã dự kiến, ghi nháp khi rời trang, dọn nháp quá hạn |
| `Project.html`, `Customer.html` | Badge + ô lọc Thiếu dữ liệu |
| `Styles.html` | Kiểu cho thanh nháp và dấu • |

Không đổi: `03_Auth`, `06_Bidding`, `07_Quotation`, `08_Activity`, `09_User`, `Error`, `Notification`, `Utils`, `appsscript.json`, `Index`, `Dashboard`, `Bidding`. **Không đổi cấu trúc Google Sheet.**

**Cập nhật từ v2.3 đang chạy** (khoảng 5 phút):
1. Apps Script → **+ → Tập lệnh** → đặt tên `10_Form` → dán nội dung `src/10_Form.gs`.
2. Với từng file trong bảng trên: mở file cùng tên → chọn hết (Ctrl+A) → dán đè nội dung mới → **Lưu** (Ctrl+S).
3. Triển khai → **Quản lý triển khai** → ✏ Chỉnh sửa → Phiên bản: **Phiên bản mới** → Triển khai. URL Web App giữ nguyên.
4. Mở Web App và tải lại trang (Ctrl+F5). Trang *Tài khoản* phải hiện phiên bản **2.4.0**.

> Nếu `01_Config.gs` được sinh lại bằng `tools/gen_config.py` (đổi cột trong Sheet), chính sách v2.4 vẫn áp dụng vì nằm ở `10_Form.gs`; template `tools/config_template.gs` đã có `VERSION` 2.4.0 và `consts`.

## 0b. Thay đổi v2.3 so với v2.2

| Hạng mục | v2.2 (DB v4.3 gộp, 16 bảng) | v2.3 (DB v4.3_Project, 11 bảng) |
| --- | --- | --- |
| SCHEMA (`01_Config.gs`) | 16 bảng / 206 cột | **11 bảng / 141 cột**. `gen_config.py` chỉ sinh cho bảng có trong file xlsx |
| Menu | Có "Báo giá & Đấu thầu" | **Sinh theo Database**: mỗi mục khai báo bảng cần có (`data-tables`). Thiếu bảng → mục bị ẩn; nhóm không còn mục nào cũng ẩn. Link cũ tới trang thầu quay về Dashboard |
| Module thầu / báo giá | Bật | **Tắt**. `Config_moduleOn_()` chỉ bật khi cờ `APP.MODULES` = true **và** có đủ bảng, nên bật cờ nhầm cũng không lỗi |
| Lead 360°, Dashboard, Cảnh báo | Có phần thầu | Chỉ còn phần khách hàng và dự án |
| `LSB_project.Quotation_LSB-Code` | Nối sang LSB_Quotation | Nhập tay mã nội bộ (vd 25B561), không trùng giữa các dự án. Hiển thị ở tab Thông tin với ghi chú "tham chiếu file Bidding" |
| `Contract_VND`, `ETA_plan`, `ETA_actual` | Tự tính khi để trống | Giữ nguyên (USD × 26000; ETD + 14 ngày) |

File **sửa** ở v2.3: `01_Config`, `05_Customer`, `06_Bidding`, `07_Quotation` (chỉ đổi hàm bật/tắt), `Index`, `JS`, `Customer`.
`06_Bidding.gs`, `07_Quotation.gs`, `Bidding.html` vẫn được giữ nhưng **không chạy** khi thiếu bảng. Nhờ đó 23 file giữ nguyên tên, và khi dùng lại bản gộp chỉ cần sinh lại config.

## 1. Cài đặt (khoảng 15 phút)

1. **Dữ liệu**: tải `data/LSB_CRM_Bidding_Project_DB_v4.3_Project.xlsx` (bản trong gói, ERD_Dictionary đã cập nhật) lên Google Drive. Mở bằng Google Sheets rồi chọn Tệp → *Lưu dưới dạng Google Trang tính*.
2. **Admin**: kiểm tra sheet `LSB_Staff`. File đã có `ST-001 · mth@luckysteel.vn · Admin · Y`; thêm hoặc sửa email Google thật nếu cần.
3. **Apps Script**: Tiện ích mở rộng → Apps Script. Xóa `Code.gs` mặc định. Tạo **25 file** theo thư mục `src/` (v2.4 thêm `10_Form.gs`, v2.5 thêm `11_I18n.gs`):
   - File `.gs`: **+** → *Tập lệnh*.
   - File `.html`: **+** → *HTML*.
   - Tên file không kèm đuôi, phân biệt chữ hoa/thường.
4. **Manifest**: vào Cài đặt dự án (⚙), bật *Hiển thị tệp kê khai*, rồi dán `appsscript.json`.
5. **Cài đặt app**: tải lại Sheet → **LSB App › Cài đặt app** → cấp quyền. Hộp thoại phải báo **✔ Cấu trúc khớp v4.3_Project**.
6. **Triển khai**: Triển khai → *Triển khai mới* → **Ứng dụng web**.
   - *Thực thi với tư cách*: **Người dùng truy cập ứng dụng web**.
   - *Người có quyền truy cập*: **Bất kỳ ai có tài khoản Google**.
   - Copy URL Web App.
7. **Chia sẻ Google Sheet**: Viewer → *Người xem*; Editor/Admin → *Người chỉnh sửa*.

> Đã cài v2.1/v2.2 trên một Sheet khác? Tạo Sheet mới từ file v4.3_Project, dán lại toàn bộ 23 file, rồi *Quản lý triển khai → Chỉnh sửa → Phiên bản mới*.

## 2. Nghiệm thu (8 bước v2.3 + 6 bước v2.4 + 3 bước v2.5)

| # | Thao tác | Kết quả đúng |
| --- | --- | --- |
| 1 | Mở URL bằng email Admin | Menu chỉ có: Dashboard · Lead & Khách hàng · Dự án · Nhân sự · Đầu việc chuẩn · Nhật ký thay đổi · Tài khoản. **Không có** "Báo giá & Đấu thầu" |
| 2 | Mở bằng email không có trong LSB_Staff | Màn hình "Không vào được ứng dụng" |
| 3 | Dự án → PJ-2026-001 | 360°: Alkindo Factory, HĐ 200,360 USD; tab Thông tin hiện Báo giá **25B561** (tham chiếu file Bidding) |
| 4 | Tab Lô hàng → + Lô hàng, nhập ETD_plan và để trống ETA_plan | ETA_plan = ETD_plan + 14 ngày |
| 5 | Tab Thanh toán → Ghi nhận thu tiền | Dòng mới trong `LSB_paid`; Year/Quarter vẫn là công thức |
| 6 | Lead & Khách hàng → LD-2026-002 → Tạo khách hàng | CU-002; Lead_status tự chuyển thành Converted |
| 7 | Tạo dự án mới có Quotation_LSB-Code = 25B561 | Bị chặn: mã đã dùng ở PJ-2026-001 |
| 8 | Nhật ký thay đổi | Thấy các thao tác trên |
| 9 | Dự án → + Thêm dự án | Ô Project_id hiện ngay `PJ-<năm>-<số> · mã dự kiến`; chỉ Customer_id có dấu *; Project_name / Status có dấu • |
| 10 | Nhập vài ô → bấm ra ngoài khung → bấm × → bấm lại + Thêm dự án | Bấm ra ngoài không đóng form; sau × có thông báo "Đã lưu nháp"; mở lại thấy "Đã khôi phục bản nháp" với đủ dữ liệu. Thử thêm: tải lại trang (F5) rồi mở lại form |
| 11 | Chỉ chọn Customer_id → Thêm | Lưu được, Status = Kick-off; danh sách Dự án có badge **Thiếu dữ liệu** (Project_name); tích ô *Thiếu dữ liệu* chỉ còn dự án thiếu |
| 12 | Dự án 360° → tab Lô hàng → + Lô hàng | Project_id điền sẵn, Shipment_no = lô kế tiếp |
| 13 | Tab Thanh toán → + Đợt thanh toán, nhập Payment_pct 10 | Payment_USD = 10% × Contract_USD, Payment_VND = USD × 26000 |
| 14 | Tab Thanh toán → Ghi nhận thu tiền | Paid_USD = số còn phải thu của đợt, Paid_VND tự tính |
| 15 | Bấm **EN** trên thanh trên cùng | Menu: Dashboard · Leads & Customers · Projects · Staff · Standard tasks · Change log · Account; trang đang mở chuyển tiếng Anh; nút đổi thành **VN** |
| 16 | Ở EN: Projects → + Add project → chỉ chọn Customer_id, gõ Status = Closed → Add | Nhãn ô *Project name* (kèm `Project_name`); lỗi tại ô Status: *a new project cannot be Closed* |
| 17 | Tải lại trang (F5), rồi bấm **VN** | Vẫn ở EN sau khi tải lại; bấm VN về tiếng Việt |

## 3. Quy tắc app

- ID dạng `TIỀNTỐ-NĂM-STT`; danh mục dạng `CU-001`, `ST-001`, `TK-001`. Số đã cấp không dùng lại.
- Không ghi đè cột công thức. Xóa = làm trống dòng. Không cho xóa khi còn bản ghi con.
- 1 lead → tối đa 1 khách hàng. `Quotation_LSB-Code` và email nhân sự không được trùng.
- Lô hàng gắn với đợt thanh toán hoặc bài học phải thuộc cùng dự án. Dự án chỉ được **Closed** khi có ≥ 1 bài học.
- Tự điền:
  - Due_day = Start + số ngày chuẩn; Done → Done_day (không sớm hơn ngày bắt đầu).
  - Shipment_no tăng dần; Payment_USD = % × Contract_USD.
  - Contract_VND = USD × 26000 (`APP.FX_USD_VND`); ETA = ETD + 14 (`APP.TRANSIT_DAYS`). Giá trị tự tính được tính lại khi nguồn đổi, trừ khi bạn đã sửa tay.
- Cảnh báo (vẫn lưu): giá trị ngoài Lists, tổng % thanh toán > 100%, đã thu vượt đợt.
- Dashboard / 360° **tính lại từ dữ liệu gốc**, không phụ thuộc sheet Dashboard.

## 4. File dữ liệu v4.3_Project

**Đã cập nhật trong gói (sửa bằng XML, giữ nguyên 39 dropdown):** sheet `ERD_Dictionary`.

- Từ điển 11 bảng / 141 cột, đối chiếu khớp 141/141 với tiêu đề các sheet.
- 16 quan hệ (bỏ 13 quan hệ tới bảng thầu).
- Mục "Tham chiếu ngoài": `Quotation_LSB-Code` → LSB_Quotation ở file Bidding, không có khóa ngoại.
- Mục "Bảng không có trong file": 5 bảng thầu.
- Ghi chú công thức Contract_VND / ETA_plan / ETA_actual.

**Chưa sửa (cần bạn quyết định):**

| Vấn đề | Ảnh hưởng |
| --- | --- |
| Sheet `Dashboard`: 6 dòng chỉ số thầu + dòng "Bài học chưa áp dụng" bị `#REF!` | Chỉ ảnh hưởng sheet, app không dùng. Có thể xóa các dòng này |
| Sheet `Huong_dan` còn mô tả v3 | Chỉ là tài liệu |
| PJ-2026-001: Kickoff_day 15/04 trước Contract_day 27/04 | App **chặn lưu** dự án này đến khi sửa ngày (hoặc nới quy tắc) |
| PL-2026-001 chỉ có mã | Không sửa được trong app đến khi điền Project_id + Handover_day |
| PD-2026-002 → PP-2026-002 không tồn tại | Không sửa được; tiền đã thu không cộng vào dự án |
| Công thức VND/ETA chỉ có ở dòng 2 | Nhập qua app thì tự tính; nhập trực tiếp trong Sheet thì không |
| `LSB_cost.Invoice_code` là cột ngày | App xử lý như ngày |

Đổi cột trong Sheet → **LSB App › Kiểm tra cấu trúc**, rồi sinh lại config:

```
python3 tools/extract_xlsx.py <file.xlsx> test/data_real.json
python3 tools/gen_config.py  <file.xlsx>
python3 tools/erd_project_v43.py <vào.xlsx> <ra.xlsx> <erd.mmd>   # dựng lại ERD_Dictionary
node test/backend.test.js && node test/ui.test.js
```

## 5. Kiểm thử

- v2.6: `test/backend.test.js` **56/56 ca pass** (+2 ca: dữ liệu `board` của Dashboard trên fixture; smoke test trên **dữ liệu thật v4.5_Project** — PP-2026-001 Paid, PD-2026-002 trỏ đợt không tồn tại vẫn trả về để báo lỗi, ngành lấy từ Lead). `test/ui.test.js` **23/23 ca pass** (+1 ca: 4 tab, cây Dự án → Lô → Đợt, đổi VND, tình trạng lô, khách hàng/quốc gia/ngành, bấm dòng → Dự án 360° tab Thanh toán). Ca *Nháp* (có từ v2.4) thỉnh thoảng hết thời gian chờ trong môi trường kiểm thử rồi kéo theo các ca sau; chạy lại thì đạt — không liên quan Dashboard.
- v2.5: `test/backend.test.js` **54/54 ca pass** (+2 ca: lỗi / cảnh báo / thông báo / danh sách chọn / kiểm tra cấu trúc bằng EN khi gửi `lang=en`, mặc định vẫn VN; từ điển phủ đủ 11 bảng / 141 cột / mọi ghi chú tiếng Việt). `test/ui.test.js` **22/22 ca pass** (+2 ca: nút EN → menu, trang, form, ghi chú, lỗi server tiếng Anh, nhớ sau khi tải lại, về VN; trình duyệt tiếng Anh mở lần đầu → EN). Ngoài ra đã quét chế độ EN trên mọi trang, tab, form: không còn chữ Việt ngoài dữ liệu người dùng.
- v2.4: `test/backend.test.js` **52/52 ca pass** (46 ca v2.3, trong đó 3 ca chỉnh theo hành vi mới, + 6 ca v2.4: chính sách bắt buộc, lưu chỉ với FK + vẫn chặn sai kiểu/FK/unique/ngày ngược, mã dự kiến không cấp số, bản ghi cha cho tự điền, VND tự tính, cờ + lọc Thiếu dữ liệu). `test/ui.test.js` **20/20 ca pass** (+4 ca: mã dự kiến + tự điền, nháp đóng/bấm ra ngoài/tải lại/bỏ nháp/lưu xong xóa, nháp sửa khi bản ghi bị đổi + hết hạn 7 ngày, badge + lọc).
- v2.3: `test/backend.test.js`: **46/46 ca pass**. Chạy trên fixture 11 sheet, kèm 2 ca smoke test trên **dữ liệu thật v4.3_Project** (Admin ST-001, cấu trúc khớp, Dự án 360° và Lead 360° chạy). Bao gồm kiểm tra: module thầu tắt kể cả khi bật cờ, `Quotation_LSB-Code` không trùng, cột tự tính, lookups chỉ gồm bảng có trong Database.
- v2.3: `test/ui.test.js`: **16/16 ca pass** (Chromium desktop + mobile 390px, Admin/Viewer/email lạ). Có ca kiểm tra menu chỉ gồm bảng có trong Database và link cũ tới trang thầu quay về Dashboard. Không có lỗi JavaScript.
- **Chưa chạy trên Google thật**: làm 8 bước ở mục 2.
