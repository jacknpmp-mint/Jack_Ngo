/**
 * 01_Config.gs — Cấu hình & lược đồ dữ liệu (schema) của LSB CRM · Project.
 *
 * Phần SCHEMA / LISTS được SINH TỰ ĐỘNG từ LSB_CRM_Bidding_Project_DB_v4.3_Project.xlsx (11 bảng)
 * (tools/extract_xlsx.py + tools/gen_config.py). Nếu đổi cột trong Google Sheet: sửa sheet →
 * chạy menu "LSB App › Kiểm tra cấu trúc" → cập nhật SCHEMA cho khớp.
 *
 * Quy ước cột:
 *   key: 'PK' | 'FK'      ref: bảng cha của FK; soft: true = mã không tồn tại chỉ CẢNH BÁO
 *   auto: true            cột công thức (xám) — app KHÔNG ghi đè
 *   list: tên danh mục    lấy giá trị từ LISTS (cho phép giá trị khác, chỉ cảnh báo)
 *   required / unique     bắt buộc / không trùng (quan hệ 1 : 0..1)
 *   pct                   lưu dạng tỷ lệ (0.3 = 30%), giao diện nhập theo %
 *   money / format(url|email) / long (ô nhập nhiều dòng) / min / max
 *   calc: { type: 'mul'|'addDays', src, by }  để trống → app tự tính từ cột src và hằng số APP[by]
 */

var APP = {
  NAME: 'LSB CRM · Project',
  VERSION: '2.5.0',
  SCHEMA_VERSION: 'v4.3_Project',
  // Để trống nếu script gắn (bound) vào chính Google Sheet dữ liệu.
  // Nếu dùng script độc lập, dán ID của Google Sheet vào đây.
  SPREADSHEET_ID: '',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
  HEADER_ROW: 1,
  FIRST_DATA_ROW: 2,
  LOG_SHEET: 'LSB_Activity_log',
  LOCK_TIMEOUT_MS: 20000,
  // v4.3_Project chỉ có 11 bảng dự án → TẮT module Đấu thầu & Báo giá (menu ẩn hẳn).
  // Module chỉ chạy khi cờ = true VÀ các bảng của module có trong SCHEMA (xem Config_moduleOn_).
  MODULES: { BIDDING: false, QUOTATION: false },
  // Ngưỡng cảnh báo (ngày) cho Notification.gs
  ALERT_DAYS: { TASK_DUE: 3, PAYMENT_DUE: 7, ETD: 7, RAD: 14 },
  ACTIVITY_PAGE_SIZE: 200,
  // Hằng số tự tính (cột calc) — khớp công thức mẫu ở dòng 2 của file v4.3.
  FX_USD_VND: 26000,     // Value_VND / Contract_VND = USD × FX_USD_VND
  TRANSIT_DAYS: 14       // ETA_plan / ETA_actual = ETD + TRANSIT_DAYS
};

/** Tên cột nối dự án ↔ báo giá (v4.3: LSB_project.Quotation_LSB-Code = LSB_Quotation.Quotation_LSB_Code). */
var PROJECT_QUOTE_COL = 'Quotation_LSB-Code';

/** Cấp quyền: số lớn hơn = quyền cao hơn. */
var ROLE_LEVEL = { Viewer: 1, Editor: 2, Admin: 3 };

/** Quyền tối thiểu cho từng loại thao tác. */
var PERMISSION = {
  READ: 'Viewer',
  WRITE: 'Editor',
  DELETE: 'Admin',
  CATALOG_WRITE: 'Admin',   // LSB_Staff, LSB_Task
  ACTIVITY_READ: 'Editor'
};

/** Bảng danh mục — chỉ Admin được thêm/sửa. */
var CATALOG_TABLES = ['LSB_Staff', 'LSB_Task'];

/** Đầu việc chuẩn (LSB_Task.Phase) được chọn cho từng bảng việc. */
var TASK_PHASE_FILTER = {
  LSB_Lead_Qualifying: ['Lead Qualification'],
  LSB_Bidding_action_plan: ['Lead Qualification', 'Bidding'],
  LSB_Project_task: ['Contracting', 'Execution', 'Payment']
};

/** Trạng thái báo giá còn "đang chạy" (tính pipeline). */
var QUOTATION_OPEN_STATUS = ['Draft', 'Submitted', 'Negotiating'];

/** Sheet nhật ký thay đổi (08_Activity.gs tự tạo nếu chưa có). */
var ACTIVITY_COLUMNS = ['Log_id', 'Timestamp', 'User_email', 'Staff_id', 'Action',
  'Table_name', 'Record_id', 'Changed_fields', 'Detail'];

var LISTS = /*__LISTS__*/{};

var SCHEMA = /*__SCHEMA__*/{};

/* ------------------------------------------------------------------ */

/** Trả về định nghĩa bảng; báo lỗi nếu tên bảng không có trong SCHEMA. */
function Config_table_(name) {
  var t = SCHEMA[name];
  if (!t) throw AppError_('NOT_FOUND', 'Không có bảng "' + name + '" trong cấu hình.');
  return t;
}

/** Bảng cần có để module chạy. */
var MODULE_TABLES = {
  BIDDING: ['LSB_Lead_Qualifying', 'LSB_Bidding_strategy', 'LSB_Bidding_action_plan', 'LSB_Result_Lesson', 'LSB_Quotation'],
  QUOTATION: ['LSB_Quotation']
};

/** Module bật khi cờ APP.MODULES = true và đủ bảng trong SCHEMA. */
function Config_moduleOn_(name) {
  return !!(APP.MODULES && APP.MODULES[name]) &&
    (MODULE_TABLES[name] || []).every(function (t) { return !!SCHEMA[t]; });
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
  return { app: { name: APP.NAME, version: APP.VERSION, schema: APP.SCHEMA_VERSION,
      modules: { BIDDING: Config_moduleOn_('BIDDING'), QUOTATION: Config_moduleOn_('QUOTATION') } },
    tables: SCHEMA, lists: LISTS, catalogs: CATALOG_TABLES, taskPhases: TASK_PHASE_FILTER,
    roles: ROLE_LEVEL, permission: PERMISSION,
    consts: { FX_USD_VND: APP.FX_USD_VND, TRANSIT_DAYS: APP.TRANSIT_DAYS } };
}
