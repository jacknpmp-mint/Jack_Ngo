/**
 * 11_I18n.gs — Song ngữ VN / EN (bộ máy).
 *  - Trình duyệt gửi ngôn ngữ ('vi' | 'en') kèm mỗi lệnh api(); server đặt LANG_ rồi trả thông báo lỗi /
 *    cảnh báo theo ngôn ngữ đó bằng L_(vi, en). Menu trong Google Sheet theo ngôn ngữ tài khoản Google.
 *  - Nhãn bảng / cột / ghi chú tiếng Anh nằm ở 12_Labels.gs (sinh bằng tools/gen_config.py, bổ sung tay).
 *  - Giá trị danh mục (Status, …) và tên cột trong Sheet KHÔNG đổi.
 */

var LANG_ = 'vi';

function I18n_set_(lang) { LANG_ = lang === 'en' ? 'en' : 'vi'; }

/** Chuỗi theo ngôn ngữ hiện tại. */
function L_(vi, en) { return LANG_ === 'en' && en ? en : vi; }

/** Ngôn ngữ tài khoản Google (menu trong Sheet — không có lựa chọn của trình duyệt). */
function I18n_fromUserLocale_() {
  var loc = '';
  try { loc = String(Session.getActiveUserLocale() || ''); } catch (e) { loc = ''; }
  I18n_set_(!loc || /^vi/i.test(loc) ? 'vi' : 'en');
}

/** Nhãn bảng theo ngôn ngữ hiện tại. */
function I18n_tableLabel_(table) {
  var t = I18N_TABLES[table];
  return t ? L_(t[0], t[1]) : (SCHEMA[table] ? SCHEMA[table].label : table);
}

/** Nhãn cột theo ngôn ngữ hiện tại ('Bảng.Cột' ưu tiên). */
function I18n_colLabel_(table, col) {
  var x = I18N_COLUMNS[table + '.' + col] || I18N_COLUMNS[col];
  return x ? L_(x[0], x[1]) : col;
}

/** Gói gửi xuống trình duyệt (bootstrap). */
function I18n_schema_() {
  return { tables: I18N_TABLES, columns: I18N_COLUMNS, notesEn: I18N_NOTES_EN, groups: MENU.map(function (g) { return g.group; }) };
}
