/**
 * 20_Cost.gs — Nghiệp vụ riêng của LSB Cost Input (giá đầu vào: vật tư, sản xuất, vận tải).
 * Quy tắc tính đã duyệt qua bản mẫu (25/10/2026) — mục "Cách tính" trên Dashboard nói lại bằng lời:
 *  - Tiền gốc = Config!B3. Giá quy đổi = giá nguyên tệ × tỷ giá; tỷ giá = dòng FX_Rates cùng tiền tệ có effective_date
 *    mới nhất nhưng ≤ ngày báo giá; tiền gốc = 1. Không có → giá quy đổi trống (Kiểm tra dữ liệu báo).
 *    Tính lại từ cột gốc, không đọc cột công thức trong Sheet (fx_rate, *_base, validity_status).
 *  - Hiệu lực: 'future' (effective_date > hôm nay) · 'expired' (valid_until < hôm nay) · 'open' (valid_until trống, tính là còn hiệu lực) · 'valid'.
 *  - Nhóm so sánh (Cost_key_): vật tư = sheet + 5 cột spec_* + unit; sản xuất / vận tải theo bảng (xem COST_KEYS_).
 *  - Giá tham chiếu của nhóm: mỗi NCC lấy dòng mới nhất (bỏ 'future'); trong các dòng còn hiệu lực có giá quy đổi → thấp nhất.
 *  - Cảnh báo: dòng mới nhất của NCC còn ≤ APP.ALERT_DAYS ngày hiệu lực; nhóm không còn NCC nào có giá hiệu lực.
 * Điểm nối (01_Config.gs): HOOK Cost_hooks_ · ROUTE Cost_routes_ · ENTITY_EXTRA Cost_extra360_ · ALERT Cost_alerts_ ·
 *   CHECK Cost_checks_ · DASHBOARD.providers Cost_board_.
 */

/** Bảng có giá (báo giá / đơn giá). Prod_Capacity không có giá. */
function Cost_priceTables_() {
  return Object.keys(SCHEMA).filter(function (t) { return /^(Mat_|Trans_)/.test(t) || t === 'Prod_Process_Rates' || t === 'Prod_Subcontract'; });
}
function Cost_matTables_() { return Object.keys(SCHEMA).filter(function (t) { return t.indexOf('Mat_') === 0; }); }

/** Cột tạo nhóm so sánh (ngoài vật tư). */
var COST_KEYS_ = {
  Prod_Process_Rates: ['factory', 'process_id', 'product_type', 'unit'],
  Prod_Subcontract: ['process_id', 'product_type', 'unit'],
  Trans_Sea: ['pol', 'pod', 'cargo_type', 'rate_basis'],
  Trans_Inland_Origin: ['from_place', 'destination_type', 'to_port', 'to_site', 'vehicle_type', 'rate_basis'],
  Trans_Inland_Dest: ['from_port', 'to_site', 'vehicle_type', 'rate_basis'],
  Trans_Local_Charges: ['side', 'port', 'charge_type', 'cargo_type', 'rate_basis']
};

function Cost_specCols_(t) {
  return (SCHEMA[t] ? SCHEMA[t].columns : []).filter(function (c) { return c.name.indexOf('spec_') === 0; }).map(function (c) { return c.name; });
}
function Cost_keyCols_(t) { return t.indexOf('Mat_') === 0 ? Cost_specCols_(t).concat(['unit']) : (COST_KEYS_[t] || []); }
function Cost_key_(t, r) {
  return [t].concat(Cost_keyCols_(t).map(function (k) { return Utils_isBlank_(r[k]) ? '' : String(r[k]).trim(); })).join('|');
}

/** Tiền gốc (Config!B3). */
function Cost_base_() {
  if (DATA_CACHE_.__base !== undefined) return DATA_CACHE_.__base;
  var v = '';
  try {
    var sh = Data_ss_().getSheetByName('Config');
    v = sh ? String(sh.getRange(3, 2, 1, 1).getValues()[0][0] || '').trim() : '';
  } catch (e) { v = ''; }
  DATA_CACHE_.__base = v || 'VND';
  return DATA_CACHE_.__base;
}

/** Tỷ giá cho tiền tệ cur tại ngày date (null nếu không có). */
function Cost_fx_(cur, date) {
  if (Utils_isBlank_(cur) || Utils_isBlank_(date)) return null;
  cur = String(cur).trim();
  if (cur === Cost_base_()) return 1;
  var best = null;
  Data_all_('FX_Rates').forEach(function (r) {
    if (String(r.currency).trim() !== cur || Utils_isBlank_(r.effective_date) || r.effective_date > date) return;
    var rate = Utils_num_(r.rate);
    if (!(rate > 0)) return;
    if (!best || r.effective_date > best.effective_date) best = r;
  });
  return best ? Utils_num_(best.rate) : null;
}

/** Số tiền nguyên tệ của dòng (null nếu trống). */
function Cost_amount_(t, r) {
  function n(k) { return Utils_isBlank_(r[k]) ? null : Utils_num_(r[k]); }
  var v;
  if (t === 'Prod_Process_Rates') {
    var parts = ['cost_labor', 'cost_machine', 'cost_consumables', 'cost_overhead'].map(n);
    if (parts.every(function (x) { return x === null; })) return null;
    return parts.reduce(function (s, x) { return s + (x || 0); }, 0);
  }
  if (t === 'Trans_Sea') { if (n('ocean_freight') === null && n('surcharges') === null) return null; return (n('ocean_freight') || 0) + (n('surcharges') || 0); }
  if (t === 'Trans_Inland_Origin' || t === 'Trans_Inland_Dest') v = n('rate');
  else if (t === 'Trans_Local_Charges') v = n('amount');
  else v = n('unit_price');
  return v === null || !isFinite(v) ? null : v;
}

function Cost_status_(r, today) {
  if (!Utils_isBlank_(r.effective_date) && r.effective_date > today) return 'future';
  if (Utils_isBlank_(r.valid_until)) return 'open';
  return r.valid_until < today ? 'expired' : 'valid';
}
function Cost_live_(st) { return st === 'valid' || st === 'open'; }

/** Dòng của bảng t kèm giá trị tính: _t, _amt, _fx, _base, _st, _days, _key. Bộ nhớ đệm theo lượt gọi. */
function Cost_rows_(t) {
  var ck = '__cost_' + t;
  if (DATA_CACHE_[ck]) return DATA_CACHE_[ck];
  var today = Utils_today_(), pk = SCHEMA[t].pk;
  var rows = Data_all_(t).map(function (r) {
    var o = {};
    for (var k in r) if (!Utils_isBlank_(r[k])) o[k] = r[k];
    o._t = t; o._id = r[pk];
    if (t !== 'Prod_Capacity') {
      o._amt = Cost_amount_(t, r);
      o._fx = Cost_fx_(r.currency, r.effective_date);
      o._base = o._amt !== null && o._fx !== null ? Math.round(o._amt * o._fx * 10000) / 10000 : null;
      o._st = Cost_status_(r, today);
      o._days = Utils_isBlank_(r.valid_until) ? null : Utils_daysBetween_(today, r.valid_until);
    }
    o._key = Cost_key_(t, r);
    return o;
  });
  DATA_CACHE_[ck] = rows;
  return rows;
}

/**
 * Nhóm so sánh của bảng t: [{ t, key, n, latest: [dòng mới nhất mỗi NCC, giá tăng dần], live: [...], best, spread }].
 * NCC = supplier_id (bảng không có NCC — đơn giá tự làm — coi cả nhóm là 1 nguồn).
 */
function Cost_items_(t) {
  var ck = '__items_' + t;
  if (DATA_CACHE_[ck]) return DATA_CACHE_[ck];
  var groups = {}, order = [];
  Cost_rows_(t).forEach(function (r) {
    if (!groups[r._key]) { groups[r._key] = []; order.push(r._key); }
    groups[r._key].push(r);
  });
  var out = order.map(function (key) {
    var rs = groups[key], latest = {};
    rs.forEach(function (r) {
      if (r._st === 'future') return;
      var s = r.supplier_id || '';
      var p = latest[s];
      if (!p || String(r.effective_date || '') > String(p.effective_date || '') ||
          (String(r.effective_date || '') === String(p.effective_date || '') && String(r._id) > String(p._id))) latest[s] = r;
    });
    var lat = Object.keys(latest).map(function (s) { return latest[s]; }).sort(function (a, b) {
      var x = a._base === null ? Infinity : a._base, y = b._base === null ? Infinity : b._base;
      return x - y;
    });
    var live = lat.filter(function (r) { return Cost_live_(r._st) && r._base !== null; });
    var best = live[0] || null, hi = live.length ? live[live.length - 1] : null;
    return { t: t, key: key, n: rs.length, ids: rs.map(function (r) { return r._id; }), latest: lat.map(function (r) { return r._id; }),
      live: live.map(function (r) { return r._id; }), best: best ? best._id : '', bestBase: best ? best._base : null,
      spread: best && hi && best._base ? hi._base / best._base - 1 : null };
  });
  DATA_CACHE_[ck] = out;
  return out;
}

/** Tên tra cứu cho client. */
function Cost_names_() {
  function idx(t, k, v) { var o = {}; Data_all_(t).forEach(function (r) { o[r[k]] = r[v]; }); return o; }
  return { suppliers: idx('Suppliers', 'supplier_id', 'supplier_name'), ports: idx('Ports', 'port_code', 'port_name'),
    processes: idx('Processes', 'process_id', 'process_name') };
}

/* ============================== Dashboard ============================== */

/** Dữ liệu tab Dashboard (client tự lọc / vẽ). Mọi số tính từ dữ liệu gốc. */
function Cost_board_() {
  var rows = {}, items = {};
  Cost_priceTables_().concat(['Prod_Capacity']).forEach(function (t) {
    rows[t] = Cost_rows_(t);
    if (t !== 'Prod_Capacity') items[t] = Cost_items_(t);
  });
  return { base: Cost_base_(), today: Utils_today_(), alertDays: APP.ALERT_DAYS, mat: Cost_matTables_(), keyCols: Cost_keyColsAll_(),
    rows: rows, items: items, names: Cost_names_() };
}
function Cost_keyColsAll_() {
  var o = {};
  Cost_priceTables_().forEach(function (t) { o[t] = Cost_keyCols_(t); });
  return o;
}

/* ============================== Trang 360° ============================== */

function Cost_extra360_(table, rec) {
  var id = rec[SCHEMA[table].pk], out = null;
  function pick(tables, fn) {
    var a = [];
    tables.forEach(function (t) { Cost_rows_(t).forEach(function (r) { if (fn(r, t)) a.push(r); }); });
    return a.sort(function (x, y) { return String(y.effective_date || '').localeCompare(String(x.effective_date || '')); });
  }
  if (table === 'Suppliers') {
    var wins = 0;
    Cost_priceTables_().forEach(function (t) {
      Cost_items_(t).forEach(function (it) {
        if (!it.best) return;
        var b = Cost_rows_(t).filter(function (r) { return r._id === it.best; })[0];
        if (b && b.supplier_id === id) wins++;
      });
    });
    out = { rows: pick(Cost_priceTables_(), function (r) { return r.supplier_id === id; }), wins: wins };
  } else if (table === 'Ports') {
    out = { seaOut: pick(['Trans_Sea'], function (r) { return r.pol === id; }), seaIn: pick(['Trans_Sea'], function (r) { return r.pod === id; }),
      local: pick(['Trans_Local_Charges'], function (r) { return r.port === id; }),
      inland: pick(['Trans_Inland_Origin', 'Trans_Inland_Dest'], function (r) { return r.to_port === id || r.from_port === id; }) };
  } else if (table === 'Processes') {
    out = { inhouse: pick(['Prod_Process_Rates'], function (r) { return r.process_id === id; }),
      sub: pick(['Prod_Subcontract'], function (r) { return r.process_id === id; }),
      capacity: pick(['Prod_Capacity'], function (r) { return r.process_id === id; }) };
  }
  if (!out) return {};
  out.base = Cost_base_(); out.names = Cost_names_(); out.today = Utils_today_(); out.alertDays = APP.ALERT_DAYS;
  return { cost: out };
}

/* ============================== Cảnh báo ============================== */

function Cost_alerts_(user, p) {
  var out = [], days = APP.ALERT_DAYS;
  Cost_priceTables_().forEach(function (t) {
    var name = I18n_tableLabel_(t), byId = {};
    Cost_rows_(t).forEach(function (r) { byId[r._id] = r; });
    Cost_items_(t).forEach(function (it) {
      var label = Cost_itemLabel_(t, byId[it.ids[0]]);
      it.latest.forEach(function (rid) {
        var r = byId[rid];
        if (r._st === 'valid' && r._days !== null && r._days <= days) {
          var x = Notification_item_(r.valid_until, 'warn', t, name + L_(': báo giá hết hạn sau ', ': quote expires in ') + r._days + L_(' ngày', ' days'),
            label + ' · ' + (Cost_supName_(r.supplier_id) || r.supplier_id || r.factory || ''), t, rid);
          x.link = { route: 'entity', table: t, id: rid };
          out.push(x);
        }
      });
      if (!it.live.length && it.latest.length) {
        var r0 = byId[it.latest[0]];
        var y = Notification_item_(r0.valid_until || r0.effective_date, 'danger', t, name + L_(': không còn báo giá hiệu lực', ': no valid quote left'),
          label + L_(' — báo giá mới nhất của mọi NCC đã hết hạn hoặc thiếu tỷ giá', ' — the latest quote of every supplier has expired or lacks an FX rate'), t, r0._id);
        y.link = { route: 'entity', table: t, id: r0._id };
        out.push(y);
      }
    });
  });
  return out;
}
function Cost_supName_(id) { var r = Utils_isBlank_(id) ? null : Data_find_('Suppliers', id); return r ? r.supplier_name : ''; }
function Cost_itemLabel_(t, r) {
  if (!r) return '';
  return Cost_keyCols_(t).map(function (k) { return r[k]; }).filter(function (v) { return !Utils_isBlank_(v); }).join(' · ') || r.description || r._id;
}

/* ============================== Kiểm tra dữ liệu ============================== */

function Cost_checks_() {
  var out = [], base = Cost_base_();
  Cost_priceTables_().forEach(function (t) {
    Cost_rows_(t).forEach(function (r) {
      if (r._amt !== null && !Utils_isBlank_(r.currency) && r._fx === null) {
        out.push({ level: 'warn', table: t, id: r._id, column: 'currency', message: L_('Chưa có tỷ giá ', 'No ') + r.currency +
          L_(' hiệu lực trước ', ' FX rate on or before ') + r.effective_date + L_(' → giá quy đổi trống', ' → base-currency price is blank') });
      }
      if (t === 'Trans_Local_Charges' && Utils_isBlank_(r.amount) && Utils_isBlank_(r.percent_rate)) {
        out.push({ level: 'warn', table: t, id: r._id, column: 'amount', message: L_('Không có số tiền và không có tỷ lệ %', 'Neither an amount nor a percentage') });
      }
    });
  });
  Object.keys(SCHEMA).forEach(function (t) {
    if (t === 'Staff') return;
    Data_all_(t).forEach(function (r) {
      var txt = [r.description, r.product_type, r.from_place, r.supplier_name, r.port_name, r.process_name].join(' ');
      if (/\(example\)/i.test(txt) || /^example row$/i.test(String(r.notes || '').trim())) {
        out.push({ level: 'info', table: t, id: r[SCHEMA[t].pk], column: '', message: L_('Dòng ví dụ của file mẫu — xóa hoặc ghi đè trước khi dùng thật', 'Example row from the template — clear or overwrite it before real use') });
      }
    });
  });
  var seen = {};
  Data_all_('FX_Rates').forEach(function (r) {
    var k = r.effective_date + '|' + r.currency;
    if (seen[k]) out.push({ level: 'danger', table: 'FX_Rates', id: r.fx_id, column: 'currency', message: L_('Trùng tỷ giá cùng ngày + tiền tệ với ', 'Duplicate date + currency with ') + seen[k] });
    else seen[k] = r.fx_id;
    if (String(r.currency).trim() === base) out.push({ level: 'warn', table: 'FX_Rates', id: r.fx_id, column: 'currency', message: L_('Tiền tệ trùng tiền gốc ', 'Currency equals the base currency ') + base + L_(' — dòng này không được dùng', ' — this row is never used') });
  });
  return out;
}

/* ============================== Quy tắc khi lưu ============================== */

function Cost_hooks_() {
  var out = {};
  out.FX_Rates = { beforeSave: function (rec, ctx) {
    var dup = Data_all_('FX_Rates').filter(function (r) {
      return r.fx_id !== rec.fx_id && String(r.currency).trim() === String(rec.currency || '').trim() && r.effective_date === rec.effective_date;
    })[0];
    if (dup) throw AppError_('VALIDATION', L_('Đã có tỷ giá ', 'There is already a ') + rec.currency + L_(' ngày ', ' rate dated ') + rec.effective_date + ' (' + dup.fx_id + ').',
      [{ field: 'effective_date', message: L_('trùng ngày + tiền tệ với ', 'same date + currency as ') + dup.fx_id }]);
    if (String(rec.currency || '').trim() === Cost_base_()) ctx.warnings.push(L_('Tiền tệ trùng tiền gốc ', 'The currency is the base currency ') + Cost_base_() + L_(' — tỷ giá luôn = 1, dòng này không được dùng.', ' — its rate is always 1, so this row is not used.'));
  } };
  Cost_priceTables_().forEach(function (t) {
    out[t] = { beforeSave: function (rec, ctx) {
      if (!Utils_isBlank_(rec.currency) && !Utils_isBlank_(rec.effective_date) && Cost_fx_(rec.currency, rec.effective_date) === null) {
        ctx.warnings.push(L_('Chưa có tỷ giá ', 'No ') + rec.currency + L_(' hiệu lực tại ', ' FX rate in force on ') + rec.effective_date +
          L_(' — giá quy đổi sẽ trống cho tới khi Admin thêm tỷ giá.', ' — the base-currency price stays blank until an Admin adds the rate.'));
      }
      if (t === 'Trans_Local_Charges') {
        var a = !Utils_isBlank_(rec.amount), p = !Utils_isBlank_(rec.percent_rate);
        if (!a && !p) ctx.warnings.push(L_('Nhập số tiền hoặc tỷ lệ %.', 'Enter an amount or a percentage.'));
        if (a && p) ctx.warnings.push(L_('Có cả số tiền và tỷ lệ % — thường chỉ dùng một.', 'Both an amount and a percentage are set — usually only one applies.'));
      }
      if (t === 'Trans_Inland_Origin') {
        if (rec.destination_type === 'Port' && Utils_isBlank_(rec.to_port)) ctx.warnings.push(L_('Loại điểm đến là Port nhưng chưa chọn cảng đến.', 'Destination type is Port but no port is selected.'));
        if (rec.destination_type === 'Site' && Utils_isBlank_(rec.to_site)) ctx.warnings.push(L_('Loại điểm đến là Site nhưng chưa nhập công trình.', 'Destination type is Site but the site is blank.'));
      }
    } };
  });
  return out;
}

/* ============================== Danh sách chọn (Config) ============================== */

function Cost_routes_() {
  return {
    'cost.lists.get': { role: 'Viewer', fn: function () { return Cost_listsGet_(); } },
    'cost.lists.save': { role: 'Admin', fn: function (p, u) { return Cost_listsSave_(p.name, p.values, u); } }
  };
}

var COST_LISTS_ = { sheet: 'Config', headerRow: 7, firstRow: 8, lastRow: 107 };

/** Danh sách trong sheet Config: [{ name, col, values, used: {giá trị: số dòng dùng} }] + tiền gốc. */
function Cost_listsGet_() {
  var sh = Data_ss_().getSheetByName(COST_LISTS_.sheet);
  if (!sh) throw AppError_('STRUCTURE', L_('Thiếu sheet Config.', 'Missing sheet Config.'));
  var lastCol = sh.getLastColumn();
  var vals = sh.getRange(COST_LISTS_.headerRow, 1, COST_LISTS_.lastRow - COST_LISTS_.headerRow + 1, lastCol).getValues();
  var lists = [];
  for (var c = 0; c < lastCol; c++) {
    var name = String(vals[0][c] || '').trim();
    if (!name) continue;
    var v = [];
    for (var r = 1; r < vals.length; r++) if (!Utils_isBlank_(vals[r][c])) v.push(String(vals[r][c]).trim());
    lists.push({ name: name, col: c + 1, values: v, used: Cost_listUsage_(name), max: COST_LISTS_.lastRow - COST_LISTS_.firstRow + 1 });
  }
  return { base: Cost_base_(), lists: lists };
}

/** Số dòng dữ liệu đang dùng từng giá trị của danh sách name. */
function Cost_listUsage_(name) {
  var used = {};
  Object.keys(SCHEMA).forEach(function (t) {
    var cols = SCHEMA[t].columns.filter(function (c) { return c.list === name; }).map(function (c) { return c.name; });
    if (!cols.length) return;
    Data_all_(t).forEach(function (r) { cols.forEach(function (k) { if (!Utils_isBlank_(r[k])) used[r[k]] = (used[r[k]] || 0) + 1; }); });
  });
  return used;
}

/** Ghi lại 1 danh sách (Admin). Giá trị đang được dùng mà bị bỏ → vẫn lưu, cảnh báo. */
function Cost_listsSave_(name, values, user) {
  Auth_require_(user, 'Admin', L_('sửa danh sách chọn', 'edit dropdown lists'));
  return Data_withLock_(function () {
    var cur = Cost_listsGet_().lists.filter(function (l) { return l.name === name; })[0];
    if (!cur) throw AppError_('NOT_FOUND', L_('Không có danh sách ', 'No list ') + name);
    var clean = [];
    (values || []).forEach(function (v) {
      v = String(v === null || v === undefined ? '' : v).trim();
      if (v && clean.indexOf(v) < 0) clean.push(v);
    });
    if (clean.length > cur.max) throw AppError_('VALIDATION', L_('Tối đa ', 'At most ') + cur.max + L_(' giá trị mỗi danh sách.', ' values per list.'));
    if (/^Currency$/i.test(name) && clean.indexOf(Cost_base_()) < 0) {
      throw AppError_('VALIDATION', L_('Danh sách Currency phải giữ tiền gốc ', 'The Currency list must keep the base currency ') + Cost_base_() + '.');
    }
    var sh = Data_ss_().getSheetByName(COST_LISTS_.sheet);
    var out = [];
    for (var i = 0; i < cur.max; i++) {
      var v = clean[i] === undefined ? '' : clean[i];
      out.push([/^[=+@-]/.test(v) && isNaN(Number(v)) ? "'" + v : v]);
    }
    sh.getRange(COST_LISTS_.firstRow, cur.col, cur.max, 1).setValues(out);
    Data_resetCache_();
    var warnings = [];
    Object.keys(cur.used).forEach(function (v) {
      if (clean.indexOf(v) < 0) warnings.push('"' + v + L_('" đã bỏ khỏi danh sách nhưng còn ', '" was removed but is still used by ') + cur.used[v] + L_(' dòng dùng.', ' rows.'));
    });
    Activity_log_(user, 'Update', COST_LISTS_.sheet, name, { values: cur.values.join(' | ') }, { values: clean.join(' | ') });
    return { lists: Cost_listsGet_(), all: Config_lists_(), warnings: warnings };
  });
}
