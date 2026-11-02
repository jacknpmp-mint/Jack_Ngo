/**
 * Utils.gs — Hàm tiện ích dùng chung (ngày, số, mảng). Không truy cập Sheet.
 */

function Utils_isBlank_(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

/** Là đối tượng Date hợp lệ về kiểu (an toàn cả khi Date đến từ ngữ cảnh khác). */
function Utils_isDate_(v) {
  return Object.prototype.toString.call(v) === '[object Date]';
}

/** Date → 'yyyy-MM-dd' theo múi giờ app. */
function Utils_fmtDate_(d) {
  if (!Utils_isDate_(d) || isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, APP.TIMEZONE, 'yyyy-MM-dd');
}

/** 'yyyy-MM-dd' | 'dd/MM/yyyy' | Date → Date (00:00) hoặc null. */
function Utils_parseDate_(v) {
  if (Utils_isBlank_(v)) return null;
  if (Utils_isDate_(v)) return isNaN(v.getTime()) ? null : v;
  var s = String(v).trim(), m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return Utils_mkDate_(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) return Utils_mkDate_(+m[3], +m[2], +m[1]);
  return null;
}

function Utils_mkDate_(y, mo, d) {
  var dt = new Date(y, mo - 1, d);
  return (dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d) ? dt : null;
}

/** Hôm nay dạng 'yyyy-MM-dd'. */
function Utils_today_() { return Utils_fmtDate_(new Date()); }

/** Cộng n ngày vào chuỗi 'yyyy-MM-dd'. */
function Utils_addDays_(iso, n) {
  var d = Utils_parseDate_(iso);
  if (!d) return '';
  d.setDate(d.getDate() + n);
  return Utils_fmtDate_(d);
}

/** Số ngày từ a đến b (chuỗi ISO). */
function Utils_daysBetween_(a, b) {
  var da = Utils_parseDate_(a), db = Utils_parseDate_(b);
  if (!da || !db) return null;
  return Math.round((db - da) / 86400000);
}

/** Năm + quý (năm lịch) từ chuỗi ISO. */
function Utils_yearQuarter_(iso) {
  var d = Utils_parseDate_(iso);
  if (!d) return { year: null, quarter: null };
  return { year: d.getFullYear(), quarter: 'Q' + (Math.floor(d.getMonth() / 3) + 1) };
}

function Utils_num_(v) {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (Utils_isBlank_(v)) return 0;
  var n = Number(String(v).replace(/,/g, ''));
  return isFinite(n) ? n : 0;
}

function Utils_sum_(arr, field) {
  return arr.reduce(function (s, r) { return s + Utils_num_(field ? r[field] : r); }, 0);
}

function Utils_groupBy_(arr, field) {
  var out = {};
  arr.forEach(function (r) { var k = r[field]; (out[k] = out[k] || []).push(r); });
  return out;
}

function Utils_indexBy_(arr, field) {
  var out = {};
  arr.forEach(function (r) { out[r[field]] = r; });
  return out;
}

function Utils_pad_(n, width) {
  var s = String(n);
  while (s.length < width) s = '0' + s;
  return s;
}

/** So sánh "lỏng" hai giá trị ô (bỏ khác biệt kiểu số/chuỗi, ngày). */
function Utils_sameValue_(a, b) {
  var na = Utils_isBlank_(a) ? '' : a, nb = Utils_isBlank_(b) ? '' : b;
  if (Utils_isDate_(na)) na = Utils_fmtDate_(na);
  if (Utils_isDate_(nb)) nb = Utils_fmtDate_(nb);
  return String(na) === String(nb);
}
