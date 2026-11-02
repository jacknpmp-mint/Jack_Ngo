/**
 * Validation.gs — Chuẩn hóa & kiểm tra dữ liệu theo SCHEMA (dùng chung mọi bảng).
 * Quy tắc nghiệp vụ riêng từng bảng nằm trong hook của module (04_…09_).
 *
 *  Lỗi (chặn lưu):  bắt buộc (v2.4: chỉ FK quan hệ + cột danh mục — xem 10_Form.gs), sai kiểu, ngoài khoảng, URL/email sai, FK không tồn tại (trừ FK soft),
 *                   trùng giá trị ở cột unique, ngày kết thúc trước ngày bắt đầu.
 *  Cảnh báo (vẫn lưu): giá trị ngoài danh mục Lists; FK soft (cột có soft: true) không khớp.
 */

var DATE_ORDER_RULES = [
  ['Start_day', 'Due_day'], ['Start_day', 'Done_day'],
  ['Start_Fab', 'Completed_Fab'], ['ETD_plan', 'ETA_plan'], ['ETD_actual', 'ETA_actual'],
  ['Contract_day', 'Kickoff_day'], ['Installation_date_start', 'Project_handover'],
  ['Qual_Start_day', 'Qual_Due_day'], ['Qual_Start_day', 'Qual_Done_day']
];

/** Lấy các cột hợp lệ (không PK, không AUTO) trong input và ép kiểu. */
function Validation_normalize_(table, input) {
  var out = {};
  Config_table_(table).columns.forEach(function (c) {
    if (c.auto || c.key === 'PK') return;
    if (!Object.prototype.hasOwnProperty.call(input, c.name)) return;
    out[c.name] = Validation_coerce_(c, input[c.name]);
  });
  return out;
}

function Validation_coerce_(c, v) {
  if (Utils_isBlank_(v)) return '';
  if (c.type === 'date') {
    var d = Utils_parseDate_(v);
    return d ? Utils_fmtDate_(d) : String(v).trim();
  }
  if (c.type === 'number') {
    if (typeof v === 'number') return v;
    var s = String(v).trim().replace(/,/g, '');
    var n = Number(s);
    return s !== '' && isFinite(n) ? n : String(v).trim();
  }
  var str = String(v).trim();
  if (c.format === 'email') str = str.toLowerCase();
  if (c.key === 'FK') str = str.toUpperCase();
  return str;
}

/** Kiểm tra toàn bộ bản ghi đã gộp. Trả về mảng lỗi; cảnh báo đẩy vào ctx.warnings. */
function Validation_validate_(table, rec, ctx) {
  var def = Config_table_(table);
  var errors = [];
  var warnings = ctx && ctx.warnings ? ctx.warnings : [];

  def.columns.forEach(function (c) {
    if (c.auto || c.key === 'PK') return;
    var v = rec[c.name];
    var blank = Utils_isBlank_(v);
    if (c.required && blank) { errors.push({ field: c.name, message: L_('bắt buộc nhập', 'required') }); return; }
    if (blank) return;

    if (c.type === 'date' && !Utils_parseDate_(v)) {
      errors.push({ field: c.name, message: L_('ngày không hợp lệ (', 'invalid date (') + v + ')' }); return;
    }
    if (c.type === 'number') {
      if (typeof v !== 'number' || !isFinite(v)) { errors.push({ field: c.name, message: L_('phải là số', 'must be a number') }); return; }
      if (c.min !== undefined && v < c.min) errors.push({ field: c.name, message: L_('nhỏ nhất ', 'minimum ') + Validation_fmtBound_(c, c.min) });
      if (c.max !== undefined && v > c.max) errors.push({ field: c.name, message: L_('lớn nhất ', 'maximum ') + Validation_fmtBound_(c, c.max) });
    }
    if (c.format === 'url' && !/^https?:\/\/\S+$/i.test(v)) {
      errors.push({ field: c.name, message: L_('URL phải bắt đầu bằng http:// hoặc https://', 'URL must start with http:// or https://') });
    }
    if (c.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      errors.push({ field: c.name, message: L_('email không hợp lệ', 'invalid email') });
    }
    if (c.list && LISTS[c.list] && LISTS[c.list].indexOf(v) < 0) {
      warnings.push(c.name + ': "' + v + L_('" không có trong danh mục ', '" is not in list ') + c.list + '.');
    }
    if (c.key === 'FK' && !Data_find_(c.ref, v)) {
      if (c.soft) {
        if (!(ctx && ctx.old && Utils_sameValue_(ctx.old[c.name], v))) warnings.push(c.name + L_(': mã ', ': ID ') + v + L_(' không có trong ', ' does not exist in ') + c.ref + L_(' (vẫn lưu — nên chọn mã có sẵn).', ' (saved anyway — better pick an existing ID).'));
      } else errors.push({ field: c.name, message: L_('mã ', 'ID ') + v + L_(' không có trong ', ' does not exist in ') + c.ref });
    }
    if (c.unique) {
      var dup = Data_all_(table).filter(function (r) {
        return String(r[c.name]).toLowerCase() === String(v).toLowerCase() && String(r[def.pk]) !== String(rec[def.pk]);
      })[0];
      if (dup) errors.push({ field: c.name, message: '"' + v + L_('" đã dùng ở ', '" is already used by ') + dup[def.pk] + L_(' (quan hệ 1 : 1)', ' (1 : 1 relation)') });
    }
  });

  DATE_ORDER_RULES.forEach(function (p) {
    if (rec[p[0]] === undefined || rec[p[1]] === undefined) return;
    var gap = Utils_daysBetween_(rec[p[0]], rec[p[1]]);
    if (gap !== null && gap < 0) errors.push({ field: p[1], message: L_('không được trước ', 'cannot be before ') + p[0] });
  });
  return errors;
}

function Validation_fmtBound_(c, b) {
  return c.pct ? Math.round(b * 100) + '%' : String(b);
}
