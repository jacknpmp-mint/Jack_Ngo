/**
 * 10_Form.gs — v2.4: chính sách form nhập (tách riêng để 01_Config.gs vẫn sinh lại được bằng tools/gen_config.py).
 *
 *  - Bắt buộc chỉ PK + FK (bảng nghiệp vụ): cột từng "required" (không phải FK) → bỏ bắt buộc, gắn `need`
 *    để app tính cờ "Thiếu dữ liệu". Bảng danh mục (LSB_Staff, LSB_Task) giữ bắt buộc như v2.3.
 *  - Thêm cột calc VND = USD × APP.FX_USD_VND cho payment_plan / paid / cost (để trống → tự tính).
 *  - Xem trước mã PK (không cấp số); số chính thức vẫn cấp lúc Lưu (Data_nextId_).
 *  - Bản ghi cha + giá trị tính sẵn để form tự điền cột phụ thuộc khi chọn FK.
 *  - Không thêm cột nào vào Google Sheet.
 */

/** Cột "nên có" thêm vào cờ Thiếu dữ liệu (ngoài các cột từng bắt buộc). Ví dụ: LSB_project: ['Contract_USD', 'PM_id']. */
var FORM_NEED_EXTRA = {};

/** Cột tự tính thêm (cùng cơ chế calc của 01_Config.gs). */
var FORM_CALC_EXTRA = {
  LSB_payment_plan: { Payment_VND: { type: 'mul', src: 'Payment_USD', by: 'FX_USD_VND' } },
  LSB_paid: { Paid_VND: { type: 'mul', src: 'Paid_USD', by: 'FX_USD_VND' } },
  LSB_cost: { Cost_VND: { type: 'mul', src: 'Cost_USD', by: 'FX_USD_VND' } }
};

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
      if (calc[c.name] && !c.calc && !c.auto) {
        c.calc = calc[c.name];
        c.note = (c.note ? c.note + ' · ' : '') + 'để trống → tự tính = ' + calc[c.name].src + ' × tỷ giá (APP.' + calc[c.name].by + ')';
      }
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

/** Bản ghi cha (theo FK) + giá trị tính sẵn cho form tự điền. null nếu không có. */
function Form_related_(table, id) {
  Config_table_(table);
  var r = Data_find_(table, id);
  if (!r) return null;
  if (table === 'LSB_project') {
    var nos = Data_all_('LSB_shipment').filter(function (s) { return s.Project_id === r.Project_id; })
      .map(function (s) { return Utils_num_(s.Shipment_no); });
    r.Next_shipment_no = (nos.length ? Math.max.apply(null, nos) : 0) + 1;
  }
  if (table === 'LSB_payment_plan') {
    var p = Project_plansWithCollected_(r.Project_id).filter(function (x) { return x.PaymentPlan_id === r.PaymentPlan_id; })[0];
    if (p) { r.Collected_calc = p.Collected_calc; r.Balance_calc = p.Balance_calc; }
  }
  return r;
}
