# Kiến trúc bộ khung

## Mục lục
1. Luồng dữ liệu · 2. File và vai trò · 3. app_spec.json · 4. SCHEMA sinh ra · 5. Điểm nối module · 6. Quy tắc dùng chung · 7. Giới hạn

## 1. Luồng dữ liệu

```
Google Sheet (mỗi bảng 1 sheet, dòng 1 = tiêu đề)  ←→  Data.gs (đọc/ghi theo TÊN cột, không ghi đè ô công thức)
        ↑                                                   ↑
Trình duyệt: google.script.run.api(action, payload, lang) → 02_Router.gs (kiểm quyền theo route) → module
```
- Web App `executeAs: USER_ACCESSING`, `access: ANYONE` → email Google của người mở app; quyền đọc/ghi Sheet theo chia sẻ Sheet; quyền trong app theo bảng nhân sự (Viewer/Editor/Admin, Active = Y).
- Mọi kết quả `{ ok, data } | { ok: false, error: { code, message, details } }`; mã lỗi: AUTH, FORBIDDEN, VALIDATION, CONFLICT, NOT_FOUND, STRUCTURE, LOCK.
- Ghi: khóa `LockService` → chuẩn hóa → tự tính (calc) → hook beforeSave → kiểm tra → cấp mã (ScriptProperties, số đã cấp không dùng lại) → ghi → nhật ký.
- Số liệu Dashboard / 360° **tính lại từ dữ liệu gốc** (không tin cột công thức — có thể #REF!).

## 2. File và vai trò

| File | Vai trò | Riêng từng DB? |
| --- | --- | --- |
| `01_Config.gs` | APP, quyền, MENU, quy tắc, SCHEMA, LISTS + hàm Config_* | SINH từ app_spec.json |
| `12_Labels.gs` | Nhãn bảng/cột VN-EN, ghi chú EN | SINH |
| `02_Router.gs` | doGet, include, api(), menu Sheet (Cài đặt / Kiểm tra cấu trúc / Mở Web App) | lõi |
| `03_Auth.gs`, `09_User.gs` | Đăng nhập theo APP.STAFF; luôn còn ≥ 1 Admin; không tự xóa mình | lõi |
| `04_Entity.gs` | entity.list / entity.get360 / Entity_hooks_ / Checks_run_ | lõi |
| `05_Dashboard.gs` | dashboard.get: KPI, theo quý, kiểm tra dữ liệu, + DASHBOARD.providers | lõi |
| `Data.gs`, `Validation.gs`, `10_Form.gs`, `08_Activity.gs`, `11_I18n.gs`, `Notification.gs`, `Utils.gs`, `Error.gs` | dịch vụ chung | lõi |
| `2x_<Module>.gs` | quy tắc + số liệu nghiệp vụ riêng | RIÊNG |
| `Index/Styles/JS/Components/Entity/Dashboard.html` | giao diện chung | lõi |
| `Custom.html` | tự điền, lọc FK theo nhóm, tab Dashboard, 360° riêng, trang riêng | RIÊNG |
| `test/mock.js, backend.test.js, ui.test.js` | test chung | lõi |
| `test/custom.test.js, custom.ui.js` | test riêng | RIÊNG |

`scaffold.py APP --update` ghi đè lõi, giữ file RIÊNG.

## 3. app_spec.json (nguồn sự thật)

```jsonc
{
 "app": { "name": "MTH HR · OKR", "brand": "MTH HR", "subtitle": ["Nhân sự & OKR", "People & OKR"], "version": "1.0.0",
          "schemaVersion": "MTH_HR_OKR_DB_v1.0", "menuTitle": "MTH HR App", "timezone": "Asia/Ho_Chi_Minh",
          "alertDays": 7, "consts": { "FX_USD_VND": 26000, "TRANSIT_DAYS": 14 }, "spreadsheetId": "" },
 "features": { "AUTH": true, "ACTIVITY": true, "ALERTS": true, "VIEW360": true },
 "staff": { "table": "HR_Staff", "id": "Staff_id", "email": "Email", "name": "Full_name", "access": "Access_level", "active": "Active", "role": "Role" },
 "catalogs": ["HR_Staff", "HR_Department"],
 "tables": { "HR_Objective": {
     "label": ["Mục tiêu (O)", "Objective"], "prefix": "OB", "idStyle": "year",
     "display": "Title", "labelCols": ["Title"], "listCols": ["Objective_id", "Employee_id", "Title", "Due_day", "Status"],
     "parentFk": "Employee_id", "groupCol": "", "dateCol": "Start_day", "view360": true,
     "required": ["Employee_id"], "need": ["Title", "Due_day"], "unique": [],
     "pct": { "Weight_pct": [0, 1] }, "range": { "Score": [1, 5] }, "url": [], "email": [], "long": ["Description"], "money": [],
     "calc": { "Amount_VND": { "type": "mul", "src": "Amount_USD", "by": "FX_USD_VND" } },
     "types": { "Code": "string" }, "fk": { "Owner": "HR_Staff" }, "soft": ["Legacy_code"], "notes": { "Weight_pct": "tổng = 100%/người" } } },
 "menu": [ { "group": ["OKR", "OKR"], "items": [ { "table": "HR_Objective", "icon": "◎" },
           { "route": "okr_board", "label": ["Bảng OKR", "OKR board"], "icon": "▦" } ] } ],
 "dateOrder": [["Start_day", "Due_day"], ["Start_day", "Done_day"]],
 "alerts": [ { "table": "HR_Task", "date": "Due_day", "title": [], "warnDays": 3, "doneCol": "Status", "doneValues": ["Done"],
               "ownerCol": "Owner_id", "link": "" } ],
 "dashboard": { "kpiTables": ["HR_Employee", "HR_Objective"], "metrics": [ { "label": ["Việc xong", "Tasks done"], "table": "HR_Task", "date": "Done_day", "sum": "", "where": {} } ],
                "providers": ["Okr_board_"] },
 "needExtra": { "HR_Employee": ["Email"] }, "autoUser": { "HR_Task": ["Owner_id"] }, "defaults": { "HR_Task": { "Status": "Not started" } },
 "providers": { "hooks": ["Okr_hooks_"], "routes": ["Okr_routes_"], "related": [], "extra360": [], "alerts": [], "checks": ["Okr_checks_"] },
 "labels": { "columns": { "Weight_pct": ["Trọng số", "Weight"], "HR_Task.Title": ["Tên công việc", "Task"] },
             "notesEn": { "HR_Objective.Weight_pct": "total = 100% per person" } }
}
```
- `title: []` của cảnh báo → dùng nhãn bảng. `link: ""` → mở chính bản ghi; `link: "Project_id"` → mở bản ghi cha.
- `required` của bảng nghiệp vụ (không phải FK) tự chuyển thành "nên có" (10_Form.gs) — muốn chặn lưu thật thì viết hook.
- `gen_config.py --check` báo cột/bảng sai tên trước khi sinh.

## 4. SCHEMA sinh ra (01_Config.gs)

Cột: `name, type (string|number|date), key (PK|FK), ref, soft, auto, calc, list, required, need (sau policy), unique, pct, min, max, money, format (url|email), long, note`.
Bảng: `label, prefix, idStyle, pk, display, labelCols, listCols, parentFk, groupCol, dateCol, view360, columns`.
AUTO = công thức đã kéo xuống nhiều dòng (app không ghi). Công thức chỉ ở dòng 2 → cột nhập được (Data_writeRow_ vẫn không ghi đè ô có công thức).

## 5. Điểm nối module (khai báo tên hàm trong app_spec.providers / dashboard.providers)

| Danh sách | Chữ ký | Dùng cho |
| --- | --- | --- |
| HOOK_PROVIDERS | `fn() → { bảng: { beforeSave(rec, ctx), afterSave(rec, ctx), beforeDelete(old, ctx) } }` | quy tắc chặn / tự điền khi lưu; ctx: `{ user, isNew, old, warnings[] }`; lỗi: `throw AppError_('VALIDATION', msg, [{ field, message }])` |
| ROUTE_PROVIDERS | `fn() → { 'mod.action': { role: 'Viewer', fn: (payload, user) => data } }` | API riêng |
| RELATED_PROVIDERS | `fn(table, record) → { tên: giá trị }` | giá trị tính sẵn cho tự điền form (record.related) |
| ENTITY_EXTRA_PROVIDERS | `fn(table, record) → {...}` | dữ liệu thêm ở `d.extra` trang 360° |
| ALERT_PROVIDERS | `fn(user, p) → [Notification_item_(...)]` | cảnh báo riêng |
| CHECK_PROVIDERS | `fn() → [{ level, table, id, column, message }]` | điểm lệch dữ liệu riêng (vd tổng kế hoạch ≠ HĐ) |
| DASHBOARD.providers | `fn(year) → {...}` → client `d[fnName]` | dữ liệu tab Dashboard nghiệp vụ |

Hook nhiều module cho cùng bảng chạy lần lượt (Entity_hooks_ → User_hooks_ → module). Client: `Custom.html` (xem modules.md).

## 6. Quy tắc dùng chung (không cần code)

Số thứ tự `*_no` kế tiếp theo parentFk · `Done_day` = hôm nay khi Status = Done · giá trị mặc định / cột người dùng · ngày sau không trước ngày trước (DATE_ORDER_RULES) · FK phải tồn tại (soft → cảnh báo) · unique · URL/email · chặn chèn công thức (`=`, `+`, `@`) · chặn xóa khi còn bản ghi con · không bỏ Admin cuối · lọc lựa chọn FK theo parentFk đang chọn · danh mục ngoài Lists chỉ cảnh báo.

## 7. Giới hạn đã biết

- Editor có quyền sửa Sheet trực tiếp (bỏ qua app, không vào nhật ký) — hệ quả của USER_ACCESSING với Gmail cá nhân.
- Nháp dùng localStorage trong iframe `*.googleusercontent.com`; trình duyệt chặn lưu trữ bên thứ ba / ẩn danh → không có nháp (form vẫn lưu).
- Apps Script giới hạn 6 phút/lần chạy, đọc cả bảng mỗi lần gọi — phù hợp vài nghìn dòng/bảng; lớn hơn cần cache/phân trang.
