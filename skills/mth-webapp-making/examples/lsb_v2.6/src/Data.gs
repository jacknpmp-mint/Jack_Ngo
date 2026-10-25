/**
 * Data.gs — Tầng truy cập dữ liệu (Google Sheet) + dịch vụ bản ghi dùng chung.
 *
 *  Phần 1 · Sheet I/O (Data_*)
 *    - Đọc bảng theo TÊN CỘT ở dòng tiêu đề (đổi thứ tự cột không làm hỏng app).
 *    - Không bao giờ ghi đè ô có công thức (cột AUTO màu xám).
 *    - Thêm mới: dùng lại dòng trống (đã dựng sẵn công thức); hết dòng thì tự thêm
 *      dòng và chép công thức + định dạng từ dòng dữ liệu đầu tiên.
 *    - Xóa: chỉ xóa nội dung ô nhập tay, giữ công thức để dòng được dùng lại.
 *    - Sinh ID TIỀNTỐ-NĂM-STT / TIỀNTỐ-STT; số đã cấp không dùng lại (lưu ScriptProperties).
 *
 *  Phần 2 · Dịch vụ bản ghi (Record_*)
 *    list / get / save / delete dùng chung cho mọi bảng: kiểm quyền → khóa ghi →
 *    chuẩn hóa → hook nghiệp vụ của module → kiểm tra hợp lệ → ghi → nhật ký.
 */

var DATA_CACHE_ = {};

/* ============================ Phần 1 · Sheet I/O ============================ */

function Data_ss_() {
  if (DATA_CACHE_.__ss) return DATA_CACHE_.__ss;
  var ss = APP.SPREADSHEET_ID ? SpreadsheetApp.openById(APP.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw AppError_('STRUCTURE', L_('Không mở được Google Sheet dữ liệu. Gắn script vào Sheet hoặc điền APP.SPREADSHEET_ID trong 01_Config.gs.', 'Cannot open the data Google Sheet. Bind the script to the Sheet or set APP.SPREADSHEET_ID in 01_Config.gs.'));
  DATA_CACHE_.__ss = ss;
  return ss;
}

function Data_sheet_(name) {
  var sh = Data_ss_().getSheetByName(name);
  if (!sh) throw AppError_('STRUCTURE', L_('Thiếu sheet "', 'Missing sheet "') + name + L_('". Chạy menu LSB App › Kiểm tra cấu trúc.', '". Run the menu LSB App › Check structure.'));
  return sh;
}

/** Xóa bộ nhớ đệm (giữ kết nối Spreadsheet). */
function Data_resetCache_(name) {
  if (name) { delete DATA_CACHE_[name]; return; }
  var ss = DATA_CACHE_.__ss;
  DATA_CACHE_ = {};
  if (ss) DATA_CACHE_.__ss = ss;
}

/** Đọc toàn bộ bảng một lần/lượt gọi. */
function Data_load_(name) {
  if (DATA_CACHE_[name]) return DATA_CACHE_[name];
  var sh = Data_sheet_(name);
  var lastRow = Math.max(sh.getLastRow(), APP.HEADER_ROW);
  var lastCol = sh.getLastColumn();
  if (lastCol < 1) throw AppError_('STRUCTURE', 'Sheet "' + name + L_('" chưa có dòng tiêu đề.', '" has no header row.'));
  var values = sh.getRange(APP.HEADER_ROW, 1, lastRow - APP.HEADER_ROW + 1, lastCol).getValues();
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var col = {};
  headers.forEach(function (h, i) { if (h && col[h] === undefined) col[h] = i; });
  var def = SCHEMA[name];
  var pk = def ? def.pk : headers[0];
  if (col[pk] === undefined) throw AppError_('STRUCTURE', 'Sheet "' + name + L_('" thiếu cột khóa chính ', '" is missing primary key column ') + pk + '.');

  var rows = [], index = {};
  for (var r = 1; r < values.length; r++) {
    var v = values[r];
    if (Utils_isBlank_(v[col[pk]])) continue;
    var o = { _row: r + APP.HEADER_ROW };
    for (var i = 0; i < headers.length; i++) if (headers[i]) o[headers[i]] = Data_toClient_(v[i]);
    rows.push(o);
    index[String(o[pk])] = o;
  }
  var t = { name: name, sheet: sh, headers: headers, col: col, pk: pk, rows: rows, index: index,
    values: values, lastRow: lastRow, lastCol: lastCol };
  DATA_CACHE_[name] = t;
  return t;
}

/** Giá trị ô → giá trị gửi client (Date → 'yyyy-MM-dd', có giờ → 'yyyy-MM-dd HH:mm:ss'). */
function Data_toClient_(v) {
  if (Utils_isDate_(v)) {
    if (isNaN(v.getTime())) return '';
    var hasTime = v.getHours() || v.getMinutes() || v.getSeconds();
    return hasTime ? Utilities.formatDate(v, APP.TIMEZONE, 'yyyy-MM-dd HH:mm:ss') : Utils_fmtDate_(v);
  }
  if (typeof v === 'string') return v.trim() === '' ? '' : v;
  return v;
}

/** Giá trị đã chuẩn hóa → giá trị ghi vào ô. */
function Data_toSheet_(colDef, v) {
  if (Utils_isBlank_(v)) return '';
  if (colDef && colDef.type === 'date') return Utils_parseDate_(v) || v;
  if (typeof v === 'string' && /^[=+@]/.test(v)) return "'" + v; // chặn chèn công thức
  return v;
}

/** Tất cả bản ghi (bản sao, không có _row). */
function Data_all_(name) {
  return Data_load_(name).rows.map(Data_strip_);
}

function Data_find_(name, id) {
  if (Utils_isBlank_(id)) return null;
  var o = Data_load_(name).index[String(id).trim()];
  return o ? Data_strip_(o) : null;
}

function Data_strip_(o) {
  var c = {};
  for (var k in o) if (k !== '_row') c[k] = o[k];
  return c;
}

function Data_isAuto_(name, header) {
  var def = SCHEMA[name];
  if (!def) return false;
  for (var i = 0; i < def.columns.length; i++) if (def.columns[i].name === header) return !!def.columns[i].auto;
  return false;
}

/** Ghi một dòng: chỉ các cột có trong obj; ô công thức giữ nguyên. */
function Data_writeRow_(t, rowNum, obj) {
  var cmap = SCHEMA[t.name] ? Config_columnMap_(t.name) : {};
  var rng = t.sheet.getRange(rowNum, 1, 1, t.lastCol);
  var formulas = rng.getFormulas()[0];
  var current = rng.getValues()[0];
  var out = [];
  for (var i = 0; i < t.lastCol; i++) {
    var h = t.headers[i];
    if (formulas[i]) out.push(formulas[i]);
    else if (h && Object.prototype.hasOwnProperty.call(obj, h) && !Data_isAuto_(t.name, h)) out.push(Data_toSheet_(cmap[h], obj[h]));
    else out.push(current[i]);
  }
  rng.setValues([out]);
}

/** Dòng trống đầu tiên: khóa chính trống và mọi cột nhập tay trống. */
function Data_findBlankRow_(t) {
  var manual = [];
  t.headers.forEach(function (h, i) { if (h && !Data_isAuto_(t.name, h)) manual.push(i); });
  for (var r = 1; r < t.values.length; r++) {
    var row = t.values[r], empty = true;
    for (var j = 0; j < manual.length; j++) if (!Utils_isBlank_(row[manual[j]])) { empty = false; break; }
    if (empty) return r + APP.HEADER_ROW;
  }
  return null;
}

/** Thêm dòng mới cuối bảng, chép định dạng + công thức cột AUTO từ dòng mẫu. */
function Data_appendRow_(t) {
  var sh = t.sheet;
  var rowNum = sh.getLastRow() + 1;
  if (rowNum > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 50);
  var tplRow = APP.FIRST_DATA_ROW;
  if (rowNum > tplRow) {
    var tpl = sh.getRange(tplRow, 1, 1, t.lastCol);
    var target = sh.getRange(rowNum, 1, 1, t.lastCol);
    tpl.copyTo(target, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    tpl.copyTo(target, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    var f = tpl.getFormulasR1C1()[0];
    for (var i = 0; i < f.length; i++) if (f[i]) sh.getRange(rowNum, i + 1).setFormulaR1C1(f[i]);
  }
  return rowNum;
}

function Data_insert_(name, obj) {
  var t = Data_load_(name);
  var rowNum = Data_findBlankRow_(t) || Data_appendRow_(t);
  Data_writeRow_(t, rowNum, obj);
  Data_resetCache_(name);
  return rowNum;
}

function Data_update_(name, id, obj) {
  var t = Data_load_(name);
  var o = t.index[String(id)];
  if (!o) throw AppError_('NOT_FOUND', L_('Không tìm thấy ', 'Not found: ') + id + ' trong ' + name + '.');
  Data_writeRow_(t, o._row, obj);
  Data_resetCache_(name);
}

/** Xóa nội dung nhập tay của dòng (giữ công thức để dùng lại dòng). */
function Data_clearRow_(name, id) {
  var t = Data_load_(name);
  var o = t.index[String(id)];
  if (!o) throw AppError_('NOT_FOUND', L_('Không tìm thấy ', 'Not found: ') + id + ' trong ' + name + '.');
  var blank = {};
  t.headers.forEach(function (h) { if (h) blank[h] = ''; });
  Data_writeRow_(t, o._row, blank);
  Data_resetCache_(name);
}

/** Sinh ID tiếp theo. Gọi trong khóa ghi. */
function Data_nextId_(name) {
  var def = Config_table_(name);
  var base = def.idStyle === 'year'
    ? def.prefix + '-' + new Date().getFullYear() + '-'
    : def.prefix + '-';
  var max = 0;
  Data_load_(name).rows.forEach(function (r) {
    var id = String(r[def.pk]);
    if (id.indexOf(base) === 0) {
      var n = parseInt(id.slice(base.length), 10);
      if (n > max) max = n;
    }
  });
  var props = PropertiesService.getScriptProperties();
  var key = 'SEQ_' + base;
  var stored = parseInt(props.getProperty(key) || '0', 10);
  var next = Math.max(max, stored) + 1;
  props.setProperty(key, String(next));
  return base + Utils_pad_(next, 3);
}

/** Chạy fn trong khóa ghi toàn script, đọc lại dữ liệu mới nhất. */
function Data_withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(APP.LOCK_TIMEOUT_MS)) throw AppError_('LOCK');
  try {
    Data_resetCache_();
    return fn();
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

/** Danh sách lựa chọn cho các ô khóa ngoại (id + nhãn + cột cha để lọc). */
function Data_lookups_() {
  var out = {};
  var targets = {};
  Object.keys(SCHEMA).forEach(function (t) {
    SCHEMA[t].columns.forEach(function (c) { if (c.key === 'FK') targets[c.ref] = true; });
  });
  Object.keys(targets).forEach(function (t) {
    var def = SCHEMA[t];
    out[t] = Data_all_(t).map(function (r) {
      var o = { id: r[def.pk], label: Utils_isBlank_(r[def.display]) ? '' : String(r[def.display]) };
      if (r.Project_id !== undefined && t !== 'LSB_project') o.parent = r.Project_id;
      if (r.Lead_id !== undefined && t !== 'LSB_Lead') o.lead = r.Lead_id;
      if (t === 'LSB_Quotation') { o.status = r.Status; o.label = (r.Project_name || '') + (r.Quotation_LSB_Code ? ' · ' + r.Quotation_LSB_Code : '') + (r.Status ? ' · ' + r.Status : ''); }
      if (t === 'LSB_Staff') o.active = r.Active !== 'N';
      if (t === 'LSB_Task') { o.active = r.Active !== 'N'; o.group = r.Phase; }
      if (t === 'LSB_shipment') o.label = L_('Lô ', 'Shipment ') + (r.Shipment_no || '') + (r.Shipment_code ? ' · ' + r.Shipment_code : '');
      if (t === 'LSB_payment_plan') o.label = (r.Payment_code || '') + (r.Due_day ? L_(' · hạn ', ' · due ') + r.Due_day : '');
      return o;
    });
  });
  return out;
}

/* ========================= Phần 2 · Dịch vụ bản ghi ========================= */

/** Hook nghiệp vụ theo bảng (định nghĩa trong các file module). */
function Record_hooks_(table) {
  var all = {};
  [Customer_hooks_(), Quotation_hooks_(), Bidding_hooks_(), Project_hooks_(), User_hooks_()].forEach(function (h) {
    for (var k in h) all[k] = h[k];
  });
  return all[table] || {};
}

/**
 * Liệt kê bản ghi.
 * filter: { eq: {col: value}, q: 'từ khóa', year: 2026, limit: 500 }
 */
function Record_list_(table, filter) {
  Config_table_(table);
  filter = filter || {};
  var rows = Data_all_(table);
  if (filter.eq) {
    Object.keys(filter.eq).forEach(function (k) {
      var v = filter.eq[k];
      if (!Utils_isBlank_(v)) rows = rows.filter(function (r) { return String(r[k]) === String(v); });
    });
  }
  if (!Utils_isBlank_(filter.q)) {
    var q = String(filter.q).toLowerCase();
    rows = rows.filter(function (r) {
      for (var k in r) if (String(r[k]).toLowerCase().indexOf(q) >= 0) return true;
      return false;
    });
  }
  var total = rows.length;
  if (filter.limit) rows = rows.slice(0, filter.limit);
  return { table: table, total: total, rows: rows };
}

function Record_get_(table, id) {
  var r = Data_find_(table, id);
  if (!r) throw AppError_('NOT_FOUND', L_('Không tìm thấy ', 'Not found: ') + id + '.');
  return r;
}

/**
 * Thêm/sửa bản ghi. input có khóa chính → sửa; không có → thêm (ID tự sinh).
 * Trả về { record, warnings, isNew }.
 */
function Record_save_(table, input, user) {
  var def = Config_table_(table);
  Auth_requireWrite_(user, table);
  input = input || {};
  var hooks = Record_hooks_(table);

  return Data_withLock_(function () {
    var id = Utils_isBlank_(input[def.pk]) ? '' : String(input[def.pk]).trim();
    var old = id ? Data_find_(table, id) : null;
    if (id && !old) throw AppError_('NOT_FOUND', L_('Không tìm thấy ', 'Not found: ') + id + L_(' — có thể đã bị xóa.', ' — it may have been deleted.'));
    var isNew = !old;

    var changes = Validation_normalize_(table, input);
    var merged = {};
    var k;
    if (old) for (k in old) merged[k] = old[k];
    for (k in changes) merged[k] = changes[k];
    merged[def.pk] = id;

    var ctx = { user: user, isNew: isNew, old: old, warnings: [] };
    Record_calc_(def, merged, old, ctx);
    if (hooks.beforeSave) hooks.beforeSave(merged, ctx);
    Record_calc_(def, merged, old, ctx);   // v2.4: hook có thể vừa điền cột nguồn (vd Payment_USD từ %)
    Error_throwIfErrors_(Validation_validate_(table, merged, ctx));

    if (isNew) merged[def.pk] = Data_nextId_(table);
    var toWrite = {};
    def.columns.forEach(function (c) { if (!c.auto && merged[c.name] !== undefined) toWrite[c.name] = merged[c.name]; });

    if (isNew) Data_insert_(table, toWrite);
    else Data_update_(table, id, toWrite);

    var saved = Data_find_(table, merged[def.pk]);
    Activity_log_(user, isNew ? 'Create' : 'Update', table, merged[def.pk], old, saved);
    if (hooks.afterSave) hooks.afterSave(saved, ctx);
    return { record: saved, warnings: ctx.warnings, isNew: isNew };
  });
}

/** Giá trị tự tính của cột calc từ bản ghi rec (null nếu thiếu nguồn). */
function Record_calcValue_(c, rec) {
  var src = rec[c.calc.src], by = APP[c.calc.by];
  if (Utils_isBlank_(src) || by === undefined) return null;
  if (c.calc.type === 'mul') {
    var n = Utils_num_(src);
    return isFinite(n) && String(src).trim() !== '' ? Math.round(n * Utils_num_(by)) : null;
  }
  if (c.calc.type === 'addDays') return Utils_addDays_(src, Utils_num_(by)) || null;
  return null;
}

/**
 * Cột calc (v4.3: Value_VND, Contract_VND, ETA_plan, ETA_actual): tự tính khi để trống, hoặc tính lại khi
 * cột nguồn đổi mà giá trị cũ vẫn đúng bằng giá trị tự tính cũ (tức chưa bị người dùng sửa tay).
 */
function Record_calc_(def, rec, old, ctx) {
  def.columns.forEach(function (c) {
    if (!c.calc || c.auto) return;
    var val = Record_calcValue_(c, rec);
    if (val === null) return;
    var blank = Utils_isBlank_(rec[c.name]);
    var stale = old && !Utils_sameValue_(old[c.calc.src], rec[c.calc.src]) &&
      Utils_sameValue_(old[c.name], Record_calcValue_(c, old)) && Utils_sameValue_(rec[c.name], old[c.name]);
    if (blank || stale) {
      rec[c.name] = val;
      ctx.warnings.push(c.name + L_(' tự tính = ', ' auto-calculated = ') + c.calc.src + (c.calc.type === 'mul' ? ' × ' : ' + ') + APP[c.calc.by] +
        (c.calc.type === 'addDays' ? L_(' ngày', ' days') : '') + '.');
    }
  });
}

/** Xóa bản ghi (Admin). Chặn khi còn bản ghi con tham chiếu. */
function Record_delete_(table, id, user) {
  var def = Config_table_(table);
  Auth_require_(user, PERMISSION.DELETE, L_('xóa dữ liệu', 'delete data'));
  var hooks = Record_hooks_(table);
  return Data_withLock_(function () {
    var old = Data_find_(table, id);
    if (!old) throw AppError_('NOT_FOUND', L_('Không tìm thấy ', 'Not found: ') + id + '.');
    var refs = [];
    Config_children_(table).forEach(function (ch) {
      var n = Data_all_(ch.table).filter(function (r) { return String(r[ch.column]) === String(id); }).length;
      if (n) refs.push({ table: ch.table, column: ch.column, count: n, label: I18n_tableLabel_(ch.table) });
    });
    if (refs.length) {
      throw AppError_('CONFLICT', L_('Không xóa được ', 'Cannot delete ') + id + L_(': còn ', ': still referenced by ') + refs.map(function (r) {
        return r.count + ' ' + r.label; }).join(', ') + L_(' tham chiếu tới.', '.'), refs);
    }
    if (hooks.beforeDelete) hooks.beforeDelete(old, { user: user });
    Data_clearRow_(table, id);
    Activity_log_(user, 'Delete', table, id, old, null);
    return { deleted: id };
  });
}
