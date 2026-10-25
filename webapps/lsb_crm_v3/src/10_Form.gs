/**
 * 10_Form.gs — Chính sách form nhập (tách khỏi 01_Config.gs để config sinh lại được bằng tools/gen_config.py).
 *
 *  - Bắt buộc chỉ PK + FK (bảng nghiệp vụ): cột "required" không phải FK → bỏ bắt buộc, gắn `need`
 *    để app tính cờ "Thiếu dữ liệu". Bảng danh mục (CATALOG_TABLES) giữ bắt buộc.
 *  - FORM_NEED_EXTRA / FORM_CALC_EXTRA (khai báo ở 01_Config.gs): cột "nên có" thêm và cột tự tính thêm.
 *  - Xem trước mã PK (không cấp số); số chính thức vẫn cấp lúc Lưu (Data_nextId_).
 *  - Bản ghi cha + giá trị tính sẵn để form tự điền cột phụ thuộc khi chọn FK (RELATED_PROVIDERS).
 *  - Không thêm cột nào vào Google Sheet.
 */

var FORM_POLICY_DONE_ = false;

/** Áp chính sách lên SCHEMA (1 lần / lượt chạy). Gọi ở api() và menu. */
function Form_applyPolicy_() {
  if (FORM_POLICY_DONE_) return;
  FORM_POLICY_DONE_ = true;
  Object.keys(SCHEMA).forEach(function (t) {
    var extra = FORM_NEED_EXTRA[t] || [], calc = FORM_CALC_EXTRA[t] || {};
    SCHEMA[t].columns.forEach(function (c) {
      if (CATALOG_TABLES.indexOf(t) < 0 && c.required && c.key !== 'FK' && c.key !== 'PK') {
        c.required = false;
        c.need = true;
      }
      if (extra.indexOf(c.name) >= 0 && c.key !== 'PK' && !c.auto) c.need = true;
      if (calc[c.name] && !c.calc && !c.auto) c.calc = calc[c.name];
    });
  });
}

/** Cột còn thiếu của bản ghi (cột bắt buộc hoặc `need` đang trống). */
function Form_missing_(table, rec) {
  Form_applyPolicy_();
  return Config_table_(table).columns.filter(function (c) {
    return !c.auto && c.key !== 'PK' && (c.need || c.required) && Utils_isBlank_(rec[c.name]);
  }).map(function (c) { return c.name; });
}

/** Mã dự kiến cho bản ghi mới — KHÔNG cấp số (ScriptProperties giữ nguyên). */
function Form_peekId_(table) {
  var def = Config_table_(table);
  var base = def.idStyle === 'year' ? def.prefix + '-' + new Date().getFullYear() + '-' : def.prefix + '-';
  var max = 0;
  Data_load_(table).rows.forEach(function (r) {
    var id = String(r[def.pk]);
    if (id.indexOf(base) === 0) {
      var n = parseInt(id.slice(base.length), 10);
      if (n > max) max = n;
    }
  });
  var stored = parseInt(PropertiesService.getScriptProperties().getProperty('SEQ_' + base) || '0', 10);
  return { id: base + Utils_pad_(Math.max(max, stored) + 1, 3) };
}

/**
 * Bản ghi cha (theo FK) + giá trị tính sẵn cho form tự điền. null nếu không có.
 * Mặc định: số thứ tự kế tiếp cho mọi bảng con có cột *_no (vd Next_Shipment_no).
 * Module thêm giá trị riêng qua RELATED_PROVIDERS: function (table, record) → { tên: giá trị }.
 */
function Form_related_(table, id) {
  Config_table_(table);
  var r = Data_find_(table, id);
  if (!r) return null;
  Config_children_(table).forEach(function (ch) {
    SCHEMA[ch.table].columns.forEach(function (c) {
      if (!/_no$/i.test(c.name) || c.type !== 'number') return;
      var nos = Data_all_(ch.table).filter(function (x) { return String(x[ch.column]) === String(id); })
        .map(function (x) { return Utils_num_(x[c.name]); });
      r['Next_' + c.name] = (nos.length ? Math.max.apply(null, nos) : 0) + 1;
    });
  });
  RELATED_PROVIDERS.forEach(function (name) {
    var extra = Data_call_(name, [table, r]) || {};
    for (var k in extra) r[k] = extra[k];
  });
  return r;
}
