/**
 * 01_Config.gs — Cấu hình & lược đồ dữ liệu (schema) của __APP_NAME__.
 *
 * File này được SINH TỰ ĐỘNG bằng tools/gen_config.py từ __SOURCE__ + tools/app_spec.json.
 * Muốn đổi: sửa tools/app_spec.json (hoặc file xlsx) rồi chạy lại
 *   python3 tools/extract_xlsx.py <file.xlsx> && python3 tools/gen_config.py <file.xlsx>
 * Không sửa tay phần SCHEMA / LISTS (lần sinh sau sẽ ghi đè).
 *
 * Quy ước cột trong SCHEMA:
 *   key: 'PK' | 'FK'      ref: bảng cha của FK; soft: true = mã không tồn tại chỉ CẢNH BÁO
 *   auto: true            cột công thức (xám) — app KHÔNG ghi đè
 *   list: tên danh mục    lấy giá trị từ LISTS (cho phép giá trị khác, chỉ cảnh báo)
 *   required / unique     bắt buộc / không trùng (quan hệ 1 : 0..1)
 *   pct                   lưu dạng tỷ lệ (0.3 = 30%), giao diện nhập theo %
 *   money / format(url|email) / long (ô nhập nhiều dòng) / min / max
 *   calc: { type: 'mul'|'addDays', src, by }  để trống → app tự tính từ cột src và hằng số APP[by]
 * Thuộc tính bảng: label, prefix + idStyle ('year' → XX-2026-001 | 'catalog' → XX-001 | 'seq' → XX-0001, số chữ số = idWidth), pk, display,
 *   labelCols (nhãn trong ô chọn FK), listCols (cột ở trang danh sách), parentFk (FK cha chính — lọc lựa chọn,
 *   đánh số *_no), groupCol, dateCol (lọc theo năm), view360 (có trang 360°).
 */

var APP = __APP__;

/** Cấp quyền: số lớn hơn = quyền cao hơn. */
var ROLE_LEVEL = { Viewer: 1, Editor: 2, Admin: 3 };

/** Quyền tối thiểu cho từng loại thao tác. */
var PERMISSION = {
  READ: 'Viewer',
  WRITE: 'Editor',
  DELETE: 'Admin',
  CATALOG_WRITE: 'Admin',
  ACTIVITY_READ: 'Editor'
};

/** Bảng danh mục — chỉ Admin được thêm/sửa, giữ cột bắt buộc. */
var CATALOG_TABLES = __CATALOGS__;

/** Sheet nhật ký thay đổi (08_Activity.gs tự tạo nếu chưa có). */
var ACTIVITY_COLUMNS = ['Log_id', 'Timestamp', 'User_email', 'Staff_id', 'Action',
  'Table_name', 'Record_id', 'Changed_fields', 'Detail'];

/** Menu bên trái: nhóm → mục (route 'entity' = danh sách + 360°; 'catalog' = bảng danh mục; route khác = trang riêng). */
var MENU = __MENU__;

/** Cặp ngày [trước, sau] — ngày sau không được sớm hơn ngày trước (áp cho mọi bảng có đủ 2 cột). */
var DATE_ORDER_RULES = __DATE_ORDER__;

/** Cảnh báo theo hạn (Notification.gs). */
var ALERT_RULES = __ALERTS__;

/** Dashboard dùng chung (05_Dashboard.gs). */
var DASHBOARD = __DASHBOARD__;

/** Cột "nên có" thêm vào cờ Thiếu dữ liệu; cột tự tính thêm (10_Form.gs). */
var FORM_NEED_EXTRA = __NEED_EXTRA__;
var FORM_CALC_EXTRA = {};

/** Cột tự điền = Staff_id người đang dùng app khi để trống; giá trị mặc định khi thêm mới (04_Entity.gs). */
var AUTO_USER_COLS = __AUTO_USER__;
var DEFAULTS = __DEFAULTS__;

/**
 * Điểm nối module riêng (tên hàm toàn cục). Module nghiệp vụ (vd 20_Project.gs) thêm tên hàm của mình vào đây.
 *  HOOK_PROVIDERS   → { bảng: { beforeSave, afterSave, beforeDelete } }   (Entity_hooks_, User_hooks_ luôn có)
 *  ROUTE_PROVIDERS  → { 'module.action': { role, fn } }
 *  RELATED_PROVIDERS(table, record) → giá trị thêm cho form tự điền
 *  ENTITY_EXTRA_PROVIDERS(table, record) → dữ liệu thêm cho trang 360°
 *  ALERT_PROVIDERS(user, p) → [cảnh báo]      CHECK_PROVIDERS() → [điểm lệch dữ liệu]
 */
var HOOK_PROVIDERS = __HOOKS__;
var ROUTE_PROVIDERS = __ROUTES__;
var RELATED_PROVIDERS = __RELATED__;
var ENTITY_EXTRA_PROVIDERS = __EXTRA360__;
var ALERT_PROVIDERS = __ALERTP__;
var CHECK_PROVIDERS = __CHECKP__;
/** Chạy đầu mỗi lượt gọi api() (vd nạp danh mục LISTS từ sheet Config). */
var INIT_PROVIDERS = __INIT__;

var LISTS = __LISTS__;

var SCHEMA = __SCHEMA__;

/* ------------------------------------------------------------------ */

/** Trả về định nghĩa bảng; báo lỗi nếu tên bảng không có trong SCHEMA. */
function Config_table_(name) {
  var t = SCHEMA[name];
  if (!t) throw AppError_('NOT_FOUND', L_('Không có bảng "', 'No table "') + name + L_('" trong cấu hình.', '" in the configuration.'));
  return t;
}

/** Map tên cột → định nghĩa cột. */
function Config_columnMap_(name) {
  var map = {};
  Config_table_(name).columns.forEach(function (c) { map[c.name] = c; });
  return map;
}

/** Danh sách [bảng con, cột FK] trỏ tới bảng `parent`. */
function Config_children_(parent) {
  var out = [];
  Object.keys(SCHEMA).forEach(function (t) {
    SCHEMA[t].columns.forEach(function (c) {
      if (c.key === 'FK' && c.ref === parent) out.push({ table: t, column: c.name });
    });
  });
  return out;
}

/** Bản schema gửi xuống trình duyệt (không có gì bí mật, chỉ rút gọn). */
function Config_clientSchema_() {
  var consts = {};
  Object.keys(APP.CONSTS || {}).forEach(function (k) { consts[k] = APP.CONSTS[k]; });
  return { app: { name: APP.NAME, brand: APP.BRAND, subtitle: APP.SUBTITLE, version: APP.VERSION, schema: APP.SCHEMA_VERSION,
      logSheet: APP.LOG_SHEET, features: APP.FEATURES },
    tables: SCHEMA, lists: LISTS, catalogs: CATALOG_TABLES, menu: MENU, staffTable: APP.STAFF.table, defaults: DEFAULTS,
    roles: ROLE_LEVEL, permission: PERMISSION, consts: consts };
}
