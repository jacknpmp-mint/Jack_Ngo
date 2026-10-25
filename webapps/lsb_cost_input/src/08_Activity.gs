/**
 * 08_Activity.gs — Nhật ký thay đổi (audit log).
 * Mỗi lần Thêm / Sửa / Xóa qua app ghi 1 dòng vào sheet APP.LOG_SHEET:
 *   Log_id · Timestamp · User_email · Staff_id · Action · Table_name · Record_id ·
 *   Changed_fields · Detail (JSON {cột: [cũ, mới]})
 * Sheet được tạo tự động (menu Cài đặt app hoặc lần mở app đầu tiên của Editor/Admin).
 * Lỗi ghi nhật ký KHÔNG làm hỏng thao tác lưu dữ liệu.
 */

var ACTIVITY_DETAIL_MAX = 45000;

function Activity_ensureSheet_() {
  var ss = Data_ss_();
  var sh = ss.getSheetByName(APP.LOG_SHEET);
  if (sh) return sh;
  try {
    sh = ss.insertSheet(APP.LOG_SHEET);
    sh.getRange(1, 1, 1, ACTIVITY_COLUMNS.length).setValues([ACTIVITY_COLUMNS])
      .setFontWeight('bold').setFontColor('#ffffff').setBackground('#56636F');
    sh.setFrozenRows(1);
    sh.setColumnWidth(2, 150); sh.setColumnWidth(9, 420);
    sh.getRange('B:B').setNumberFormat('dd/mm/yyyy hh:mm:ss');
    return sh;
  } catch (e) {
    console.warn('[' + APP.BRAND + '] Không tạo được sheet nhật ký: ' + e);
    return null;
  }
}

/** So sánh 2 bản ghi → { cột: [cũ, mới] } (bỏ qua cột AUTO). */
function Activity_diff_(table, before, after) {
  var diff = {};
  var def = SCHEMA[table];
  var cols = def ? def.columns.filter(function (c) { return !c.auto; }).map(function (c) { return c.name; })
                 : Object.keys(after || before || {});
  cols.forEach(function (k) {
    var a = before ? before[k] : '', b = after ? after[k] : '';
    if (!Utils_sameValue_(a, b)) diff[k] = [Utils_isBlank_(a) ? '' : a, Utils_isBlank_(b) ? '' : b];
  });
  return diff;
}

/**
 * Ghi nhật ký. action: Create | Update | Delete.
 * note (tùy chọn): ghi chú thêm, vd "tự động khi tạo khách hàng".
 */
function Activity_log_(user, action, table, recordId, before, after, note) {
  if (APP.FEATURES.ACTIVITY === false) return;
  try {
    var diff = Activity_diff_(table, before, after);
    var fields = Object.keys(diff);
    if (action === 'Update' && !fields.length) return;
    var sh = Activity_ensureSheet_();
    if (!sh) return;
    var detail = JSON.stringify(note ? { _note: note, changes: diff } : diff);
    if (detail.length > ACTIVITY_DETAIL_MAX) detail = detail.slice(0, ACTIVITY_DETAIL_MAX) + '…';
    var now = new Date();
    var logId = 'AL-' + Utilities.formatDate(now, APP.TIMEZONE, 'yyyyMMdd-HHmmss') + '-' +
      Utils_pad_(Math.floor(Math.random() * 1000), 3);
    sh.appendRow([logId, now, user ? user.email : '', user ? user.staffId : '', action, table,
      "'" + recordId, fields.join(', '), detail]);
    Data_resetCache_(APP.LOG_SHEET);
  } catch (e) {
    console.warn('[' + APP.BRAND + '] Ghi nhật ký lỗi: ' + e);
  }
}

/**
 * Đọc nhật ký, mới nhất trước.
 * p: { table, id, recordIds[], user (email), action, limit }
 */
function Activity_list_(p) {
  p = p || {};
  var ss = Data_ss_();
  if (!ss.getSheetByName(APP.LOG_SHEET)) return { rows: [], total: 0 };
  var rows = Data_all_(APP.LOG_SHEET);
  if (p.table) rows = rows.filter(function (r) { return r.Table_name === p.table; });
  if (p.id) rows = rows.filter(function (r) { return String(r.Record_id) === String(p.id); });
  if (p.recordIds) {
    var set = {};
    p.recordIds.forEach(function (x) { set[String(x)] = true; });
    rows = rows.filter(function (r) { return set[String(r.Record_id)]; });
  }
  if (p.user) rows = rows.filter(function (r) { return String(r.User_email).toLowerCase() === String(p.user).toLowerCase(); });
  if (p.action) rows = rows.filter(function (r) { return r.Action === p.action; });
  rows.reverse();
  var total = rows.length;
  rows = rows.slice(0, p.limit || APP.ACTIVITY_PAGE_SIZE).map(function (r) {
    var d = null;
    try { d = r.Detail ? JSON.parse(r.Detail) : null; } catch (e) { d = r.Detail; }
    return { id: r.Log_id, time: r.Timestamp, email: r.User_email, staffId: r.Staff_id, action: r.Action,
      table: r.Table_name, recordId: r.Record_id, fields: r.Changed_fields, detail: d };
  });
  return { rows: rows, total: total };
}
