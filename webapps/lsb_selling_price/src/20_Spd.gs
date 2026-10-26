/**
 * 20_Spd.gs — Nghiệp vụ LSB Selling Price DB (giá bán theo khách hàng / thị trường / dự án).
 *
 *  - Spd_init_ (INIT_PROVIDERS): nạp danh mục LISTS + tiền gốc từ sheet Config mỗi lượt gọi (Admin sửa được trong app).
 *  - Spd_compute_: tính lại MỌI giá trị suy ra từ dữ liệu gốc, giống công thức trong Sheet (không tin cột công thức):
 *      tỷ giá = dòng FX_Rates mới nhất ≤ ngày (tiền gốc = 1) · giá base = giá × tỷ giá · USD = base ÷ tỷ giá USD cùng ngày
 *      giá vốn = VT + GC + LD + Khác · GM = bán − vốn (base, trước cước) · GM% = GM ÷ giá bán
 *      Inputs Job ↔ Bid ghép theo project + material + specification (TB các dòng Bid khớp).
 *  - Route: spd.data (trang phân tích, xem trước form, Dự án 360°), spd.copyToJob (chép Bid → Job),
 *           spd.lists / spd.listAdd / spd.listRemove (danh sách chọn trong Config — Admin).
 *  - Hook: FX_Rates không trùng ngày + tiền tệ; cảnh báo dòng giá tham chiếu khác vật tư; dòng hạng mục trùng.
 *  - Cảnh báo (chuông): thiếu tỷ giá; dự án chưa có dòng item Bid. Kiểm tra dữ liệu: lệch spec, Job không ghép được Bid,
 *    Won/Completed chưa có dòng Job.
 * Khai báo trong tools/make_spec_spd.py › providers (sinh vào 01_Config.gs).
 */

var SPD_ = { base: 'VND', lists: null, cfgCols: null, data: null };
var SPD_CFG_ = { sheet: 'Config', baseCell: [3, 2], headRow: 7, firstRow: 8, lastRow: 37 };
var SPD_FIXED_LISTS_ = ['Access level', 'Active'];   // không nằm trong Config

/* ============================== Danh mục từ Config ============================== */

function Spd_init_() {
  SPD_.data = null;
  var sh = Data_ss_().getSheetByName(SPD_CFG_.sheet);
  if (!sh) return;   // không có sheet Config → giữ LISTS sinh sẵn trong 01_Config.gs
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var vals = sh.getRange(1, 1, SPD_CFG_.lastRow, lastCol).getValues();
  var base = vals[SPD_CFG_.baseCell[0] - 1][SPD_CFG_.baseCell[1] - 1];
  if (!Utils_isBlank_(base)) SPD_.base = String(base).trim();
  var cols = {};
  for (var c = 0; c < lastCol; c++) {
    var name = vals[SPD_CFG_.headRow - 1][c];
    if (Utils_isBlank_(name)) continue;
    name = String(name).replace(/\s*\(.*\)$/, '').trim();
    var list = [];
    for (var r = SPD_CFG_.firstRow - 1; r < SPD_CFG_.lastRow; r++) if (!Utils_isBlank_(vals[r][c])) list.push(String(vals[r][c]).trim());
    LISTS[name] = list;
    cols[name] = c + 1;
  }
  SPD_.cfgCols = cols;
}

/** Tên giai đoạn: dòng 1 của Stage = bid, dòng 2 = job (README: không đổi thứ tự). */
function Spd_stage_() {
  var s = LISTS.Stage || [];
  return { bid: s[0] || 'Bid', job: s[1] || 'Job' };
}

/* ================================ Tính toán ================================ */

function Spd_n_(v) {
  if (Utils_isBlank_(v)) return null;
  var n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
  return isFinite(n) ? n : null;
}
function Spd_avg_(a) {
  a = a.filter(function (x) { return x !== null && x !== undefined && isFinite(x); });
  return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null;
}

/** Tra tỷ giá: dòng mới nhất có ngày ≤ date (giống SUMIFS + MAXIFS của Sheet); tiền gốc = 1. */
function Spd_fxIndex_() {
  var by = {};
  Data_all_('FX_Rates').forEach(function (r) {
    var cur = String(r.currency || '').trim(), d = String(r.effective_date || '').slice(0, 10), rate = Spd_n_(r.rate);
    if (!cur || !d || rate === null) return;
    (by[cur] = by[cur] || []).push({ d: d, r: rate });
  });
  Object.keys(by).forEach(function (k) { by[k].sort(function (a, b) { return a.d < b.d ? 1 : a.d > b.d ? -1 : 0; }); });
  return function (cur, date) {
    if (Utils_isBlank_(cur) || Utils_isBlank_(date)) return null;
    cur = String(cur).trim();
    if (cur === SPD_.base) return 1;
    var list = by[cur] || [], d = String(date).slice(0, 10);
    // nhiều dòng cùng ngày → Sheet cộng SUMIFS; app cảnh báo trùng ở Kiểm tra dữ liệu, ở đây lấy tổng cho giống Sheet
    var hit = null, sum = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].d > d) continue;
      if (hit === null) hit = list[i].d;
      if (list[i].d === hit) sum += list[i].r; else break;
    }
    return hit === null ? null : sum;
  };
}

/** Toàn bộ dữ liệu đã tính (1 lần / lượt gọi). */
function Spd_compute_() {
  if (SPD_.data) return SPD_.data;
  var fx = Spd_fxIndex_(), st = Spd_stage_();
  var div = function (a, b) { return a === null || b === null || !b ? null : a / b; };
  var mul = function (a, b) { return a === null || b === null ? null : a * b; };
  var customers = Data_all_('Customers').map(function (r) { return { id: r.customer_id, name: r.customer_name, type: r.customer_type, country: r.country }; });
  var markets = Data_all_('Markets').map(function (r) { return { id: r.market_id, name: r.market_name }; });
  var items = Data_all_('Items').map(function (r) { return { id: r.item_id, name: r.item_name, unit: r.unit, grp: r.material_group }; });
  var materials = Data_all_('Materials').map(function (r) { return { id: r.material_id, name: r.material_name, unit: r.unit, grp: r.material_group }; });
  var I = Utils_indexBy_(items, 'id'), MT = Utils_indexBy_(materials, 'id');

  var prices = Data_all_('Material_Prices').map(function (r) {
    var p = Spd_n_(r.unit_price), f = fx(r.currency, r.effective_date), u = fx('USD', r.effective_date);
    var base = mul(p, f);
    var m = MT[r.material_id] || {};
    return { id: r.price_id, mat: r.material_id, name: m.name || '', grp: m.grp || '', unit: m.unit || '', spec: r.specification,
      d: r.effective_date, sup: r.supplier, cur: r.currency, p: p, fx: f, fxu: u, base: base, usd: div(base, u) };
  });
  var PR = Utils_indexBy_(prices, 'id');

  var projects = Data_all_('Projects').map(function (r) {
    return { id: r.project_id, name: r.project_name, cus: r.customer_id, mkt: r.market_id, qd: r.quote_date, cd: r.contract_date,
      st: r.status, job: r.job_no, sc: r.sell_currency, cc: r.cost_currency, fd: r.fx_date, owner: r.owner,
      fxs: fx(r.sell_currency, r.fx_date), fxc: fx(r.cost_currency, r.fx_date), fxu: fx('USD', r.fx_date) };
  });
  var P = Utils_indexBy_(projects, 'id');

  var lines = Data_all_('Project_Items').map(function (r) {
    var p = P[r.project_id] || {}, it = I[r.item_id] || {};
    var cm = Spd_n_(r.cost_material), cf = Spd_n_(r.cost_fabrication), ce = Spd_n_(r.cost_erection), co = Spd_n_(r.cost_other);
    var cost = (cm || 0) + (cf || 0) + (ce || 0) + (co || 0), sell = Spd_n_(r.unit_sell);
    var sellB = mul(sell, p.fxs === undefined ? null : p.fxs), costB = mul(cost, p.fxc === undefined ? null : p.fxc);
    var gm = sellB === null || costB === null ? null : sellB - costB;
    var u = p.fxu === undefined ? null : p.fxu;
    return { id: r.line_id, prj: r.project_id, item: r.item_id, stg: r.stage, name: it.name || '', unit: it.unit || '', grp: it.grp || '',
      cus: p.cus || '', mkt: p.mkt || '', qd: p.qd || '', cm: cm, cf: cf, ce: ce, co: co, cost: cost, sell: sell,
      sellB: sellB, costB: costB, gm: gm, gmp: gm === null || !sellB ? null : gm / sellB,
      sellU: div(sellB, u), costU: div(costB, u), gmU: div(gm, u), notes: r.notes };
  });

  var freight = Data_all_('Project_Freight').map(function (r) {
    var p = P[r.project_id] || {}, cost = Spd_n_(r.freight_cost), f = fx(r.currency, p.fd), base = mul(cost, f);
    return { id: r.freight_id, prj: r.project_id, inc: r.incoterm, port: r.destination_port, site: r.site_location, basis: r.cost_basis,
      cur: r.currency, cost: cost, fx: f, base: base, usd: div(base, p.fxu === undefined ? null : p.fxu), src: r.source };
  });

  function input(r, date, usdRate) {
    var p = P[r.project_id] || {}, m = MT[r.material_id] || {}, price = Spd_n_(r.unit_price), f = fx(r.currency, date), base = mul(price, f);
    var ref = PR[r.price_id];
    return { id: r.input_id, prj: r.project_id, mat: r.material_id, name: m.name || '', grp: m.grp || '', unit: m.unit || '',
      cus: p.cus || '', mkt: p.mkt || '', qd: p.qd || '', spec: r.specification, ref: r.price_id || '', refSpec: ref ? ref.spec : '',
      refMat: ref ? ref.mat : '', check: r.price_id ? (ref && ref.spec === r.specification ? 'OK' : 'Spec differs') : '',
      cur: r.currency, p: price, fx: f, base: base, usd: div(base, usdRate), listB: ref ? ref.base : null, listU: ref ? ref.usd : null,
      vList: base === null || !(ref && ref.base) ? null : base / ref.base - 1 };
  }
  var inb = Data_all_('Project_Inputs_Bid').map(function (r) { var p = P[r.project_id] || {}; return input(r, p.fd, p.fxu === undefined ? null : p.fxu); });
  var inj = Data_all_('Project_Inputs_Job').map(function (r) {
    var x = input(r, r.price_date, fx('USD', r.price_date));
    x.pd = r.price_date; x.sup = r.supplier;
    var b = inb.filter(function (y) { return y.prj === x.prj && y.mat === x.mat && y.spec === x.spec; });
    x.bidB = Spd_avg_(b.map(function (y) { return y.base; }));
    x.bidU = Spd_avg_(b.map(function (y) { return y.usd; }));
    x.matched = b.length > 0;
    x.vBid = x.base === null || !x.bidB ? null : x.base / x.bidB - 1;
    return x;
  });

  projects.forEach(function (p) {
    var ls = lines.filter(function (l) { return l.prj === p.id; });
    var bid = ls.filter(function (l) { return l.stg === st.bid; }), job = ls.filter(function (l) { return l.stg === st.job; });
    p.rows = ls.length; p.bidRows = bid.length; p.jobRows = job.length;
    p.gmBid = Spd_avg_(bid.map(function (l) { return l.gmp; }));
    p.gmJob = Spd_avg_(job.map(function (l) { return l.gmp; }));
    p.fr = freight.filter(function (f) { return f.prj === p.id; }).length;
    p.check = (p.fxs === null || p.fxc === null) ? 'Missing FX rate / currency / FX date' : (p.rows === 0 ? 'No items' : 'OK');
  });
  SPD_.data = { base: SPD_.base, stage: st, today: Utils_today_(), customers: customers, markets: markets, items: items, materials: materials,
    prices: prices, projects: projects, lines: lines, freight: freight, inb: inb, inj: inj,
    fx: Data_all_('FX_Rates').map(function (r) { return { id: r.fx_id, d: r.effective_date, c: r.currency, r: Spd_n_(r.rate) }; }) };
  return SPD_.data;
}

/** Dữ liệu 1 dự án cho trang Dự án 360°. */
function Spd_project_(id) {
  var D = Spd_compute_();
  var f = function (a) { return a.filter(function (x) { return x.prj === id; }); };
  return { base: D.base, stage: D.stage, project: D.projects.filter(function (p) { return p.id === id; })[0] || null,
    lines: f(D.lines), freight: f(D.freight), inb: f(D.inb), inj: f(D.inj) };
}

/* ============================== Chép Bid → Job ============================== */

var SPD_WON_ = ['Won', 'Completed'];

function Spd_copyToJob_(projectId, user) {
  var prj = Data_find_('Projects', projectId);
  if (!prj) throw AppError_('NOT_FOUND', L_('Không tìm thấy dự án ', 'Project not found: ') + projectId);
  if (SPD_WON_.indexOf(prj.status) < 0) {
    throw AppError_('VALIDATION', L_('Chỉ chép sang Job khi dự án ở trạng thái Won hoặc Completed (hiện: ', 'Copy to job only when the project is Won or Completed (now: ') +
      (prj.status || '—') + ').', [{ field: 'status', message: L_('chưa Won/Completed', 'not Won/Completed') }]);
  }
  var st = Spd_stage_();
  var lines = Data_all_('Project_Items').filter(function (r) { return r.project_id === projectId; });
  var addI = lines.filter(function (l) {
    return l.stage === st.bid && !lines.some(function (j) { return j.stage === st.job && j.item_id === l.item_id; });
  });
  var seen = {};
  addI = addI.filter(function (l) { if (seen[l.item_id]) return false; seen[l.item_id] = true; return true; });
  var bids = Data_all_('Project_Inputs_Bid').filter(function (r) { return r.project_id === projectId; });
  var jobs = Data_all_('Project_Inputs_Job').filter(function (r) { return r.project_id === projectId; });
  var seenB = {};
  var addB = bids.filter(function (b) {
    var k = b.material_id + '|' + b.specification;
    if (seenB[k] || jobs.some(function (j) { return j.material_id === b.material_id && j.specification === b.specification; })) return false;
    seenB[k] = true; return true;
  });
  var made = { items: [], inputs: [] };
  addI.forEach(function (l) {
    var r = Record_save_('Project_Items', { project_id: projectId, item_id: l.item_id, stage: st.job, cost_material: l.cost_material,
      cost_fabrication: l.cost_fabrication, cost_erection: l.cost_erection, cost_other: l.cost_other, unit_sell: l.unit_sell,
      notes: 'Copied from bid row ' + l.line_id }, user);
    made.items.push(r.record.line_id);
  });
  addB.forEach(function (b) {
    var r = Record_save_('Project_Inputs_Job', { project_id: projectId, material_id: b.material_id, specification: b.specification,
      price_id: b.price_id, currency: b.currency, unit_price: b.unit_price, notes: 'Copied from bid row ' + b.input_id }, user);
    made.inputs.push(r.record.input_id);
  });
  return { project: projectId, items: made.items, inputs: made.inputs,
    skippedItems: lines.filter(function (l) { return l.stage === st.bid; }).length - made.items.length,
    skippedInputs: bids.length - made.inputs.length };
}

/* ============================ Danh sách chọn (Config) ============================ */

/** Cột của bảng dùng danh mục `name` → đếm số lần dùng mỗi giá trị. */
function Spd_listUsage_(name) {
  var use = {};
  Object.keys(SCHEMA).forEach(function (t) {
    SCHEMA[t].columns.forEach(function (c) {
      if (c.list !== name || c.auto) return;
      Data_all_(t).forEach(function (r) { var v = r[c.name]; if (!Utils_isBlank_(v)) use[v] = (use[v] || 0) + 1; });
    });
  });
  return use;
}

function Spd_lists_() {
  var out = [];
  Object.keys(SPD_.cfgCols || {}).forEach(function (name) {
    var use = Spd_listUsage_(name);
    out.push({ name: name, fixed: name === 'Stage', max: SPD_CFG_.lastRow - SPD_CFG_.firstRow + 1,
      values: (LISTS[name] || []).map(function (v) { return { v: v, used: use[v] || 0 }; }),
      unknown: Object.keys(use).filter(function (v) { return (LISTS[name] || []).indexOf(v) < 0; }) });
  });
  return { base: SPD_.base, lists: out };
}

function Spd_listWrite_(name, values, user, action, value) {
  var col = (SPD_.cfgCols || {})[name];
  var sh = Data_sheet_(SPD_CFG_.sheet);
  var n = SPD_CFG_.lastRow - SPD_CFG_.firstRow + 1;
  var out = [];
  for (var i = 0; i < n; i++) out.push([i < values.length ? values[i] : '']);
  var before = { values: (LISTS[name] || []).join(' | ') };
  sh.getRange(SPD_CFG_.firstRow, col, n, 1).setValues(out);
  LISTS[name] = values.slice();
  Activity_log_(user, 'Update', 'Config', name, before, { values: values.join(' | ') }, action + ': ' + value);
}

function Spd_listAdd_(p, user) {
  return Data_withLock_(function () {
    Spd_init_();
    var name = p.list, v = String(p.value || '').trim();
    if (!SPD_.cfgCols || !SPD_.cfgCols[name]) throw AppError_('NOT_FOUND', L_('Không có danh mục ', 'No list ') + name);
    if (name === 'Stage') throw AppError_('VALIDATION', L_('Danh mục Stage cố định 2 dòng (Bid, Job).', 'The Stage list is fixed at 2 rows (Bid, Job).'));
    if (!v) throw AppError_('VALIDATION', L_('Nhập giá trị.', 'Enter a value.'), [{ field: 'value', message: L_('bắt buộc nhập', 'required') }]);
    if (/^[=+@-]/.test(v)) throw AppError_('VALIDATION', L_('Giá trị không được bắt đầu bằng = + @ -', 'A value cannot start with = + @ -'));
    var list = (LISTS[name] || []).slice();
    if (list.some(function (x) { return x.toLowerCase() === v.toLowerCase(); })) throw AppError_('CONFLICT', '"' + v + L_('" đã có trong ', '" is already in ') + name);
    if (list.length >= SPD_CFG_.lastRow - SPD_CFG_.firstRow + 1) throw AppError_('VALIDATION', L_('Danh mục đã đủ 30 dòng.', 'The list already has 30 rows.'));
    list.push(v);
    Spd_listWrite_(name, list, user, 'Add', v);
    return Spd_lists_();
  });
}

function Spd_listRemove_(p, user) {
  return Data_withLock_(function () {
    Spd_init_();
    var name = p.list, v = String(p.value || '');
    if (!SPD_.cfgCols || !SPD_.cfgCols[name]) throw AppError_('NOT_FOUND', L_('Không có danh mục ', 'No list ') + name);
    if (name === 'Stage') throw AppError_('VALIDATION', L_('Danh mục Stage cố định 2 dòng (Bid, Job).', 'The Stage list is fixed at 2 rows (Bid, Job).'));
    var used = Spd_listUsage_(name)[v] || 0;
    if (used) throw AppError_('CONFLICT', L_('Không xóa được "', 'Cannot remove "') + v + L_('": đang dùng ở ', '": used in ') + used + L_(' dòng dữ liệu.', ' data rows.'));
    var list = (LISTS[name] || []).filter(function (x) { return x !== v; });
    if (list.length === (LISTS[name] || []).length) throw AppError_('NOT_FOUND', '"' + v + L_('" không có trong ', '" is not in ') + name);
    Spd_listWrite_(name, list, user, 'Remove', v);
    return Spd_lists_();
  });
}

/* ================================== Route ================================== */

function Spd_routes_() {
  return {
    'spd.data':       { role: 'Viewer', fn: function () { return Spd_compute_(); } },
    'spd.project':    { role: 'Viewer', fn: function (p) { return Spd_project_(p.id); } },
    'spd.copyToJob':  { role: 'Editor', fn: function (p, u) { return Spd_copyToJob_(p.id, u); } },
    'spd.lists':      { role: 'Viewer', fn: function () { return Spd_lists_(); } },
    'spd.listAdd':    { role: 'Admin',  fn: function (p, u) { return Spd_listAdd_(p, u); } },
    'spd.listRemove': { role: 'Admin',  fn: function (p, u) { return Spd_listRemove_(p, u); } }
  };
}

/* ================================== Hook ================================== */

function Spd_hooks_() {
  return {
    FX_Rates: {
      beforeSave: function (rec, ctx) {
        SPD_.data = null;
        var d = String(rec.effective_date || '').slice(0, 10), c = String(rec.currency || '').trim();
        if (d && c) {
          var dup = Data_all_('FX_Rates').filter(function (r) {
            return r.fx_id !== rec.fx_id && String(r.effective_date).slice(0, 10) === d && String(r.currency).trim() === c;
          })[0];
          if (dup) throw AppError_('VALIDATION', L_('Đã có tỷ giá ', 'There is already a ') + c + L_(' ngày ', ' rate dated ') + d + ' (' + dup.fx_id + ').',
            [{ field: 'currency', message: L_('trùng ngày + tiền tệ với ', 'same date + currency as ') + dup.fx_id }]);
        }
        if (c && c === SPD_.base) ctx.warnings.push(L_('Tiền gốc ', 'The base currency ') + c + L_(' luôn có tỷ giá 1 — không cần nhập dòng này.', ' always has rate 1 — this row is not needed.'));
        var rt = Spd_n_(rec.rate);
        if (rt !== null && rt <= 0) throw AppError_('VALIDATION', L_('Tỷ giá phải lớn hơn 0.', 'The rate must be greater than 0.'), [{ field: 'rate', message: '> 0' }]);
      }
    },
    Project_Items: {
      beforeSave: function (rec, ctx) {
        var dup = Data_all_('Project_Items').filter(function (r) {
          return r.line_id !== rec.line_id && r.project_id === rec.project_id && r.item_id === rec.item_id && r.stage === rec.stage && !Utils_isBlank_(rec.stage);
        })[0];
        if (dup) ctx.warnings.push(L_('Dự án đã có dòng ', 'The project already has row ') + dup.line_id + L_(' cho hạng mục ', ' for item ') + rec.item_id + ' (' + rec.stage + L_(') — trung bình GM sẽ tính cả 2 dòng.', ') — the average GM will count both rows.'));
      }
    },
    Project_Inputs_Bid: { beforeSave: Spd_checkRefPrice_ },
    Project_Inputs_Job: { beforeSave: Spd_checkRefPrice_ }
  };
}

function Spd_checkRefPrice_(rec, ctx) {
  if (Utils_isBlank_(rec.price_id) || Utils_isBlank_(rec.material_id)) return;
  var ref = Data_find_('Material_Prices', rec.price_id);
  if (ref && ref.material_id !== rec.material_id) {
    ctx.warnings.push(L_('Dòng giá ', 'Price row ') + rec.price_id + L_(' thuộc vật tư ', ' belongs to material ') + ref.material_id + L_(', khác vật tư đã chọn ', ', not the selected material ') + rec.material_id + '.');
  } else if (ref && !Utils_isBlank_(rec.specification) && ref.specification !== rec.specification) {
    ctx.warnings.push(L_('Quy cách khác dòng giá tham chiếu (', 'Spec differs from the reference price row (') + ref.specification + ').');
  }
}

/* ============================ Cảnh báo & kiểm tra ============================ */

function Spd_alerts_() {
  var D = Spd_compute_(), out = [], st = D.stage;
  var link = function (it, table, id) { it.link = { route: 'entity', table: table, id: id }; return it; };
  var t = L_('Thiếu tỷ giá', 'Missing FX rate');
  D.projects.forEach(function (p) {
    var miss = [];
    if (p.sc && p.fd && p.fxs === null) miss.push(p.sc);
    if (p.cc && p.fd && p.fxc === null && miss.indexOf(p.cc) < 0) miss.push(p.cc);
    if (p.fd && p.fxu === null && miss.indexOf('USD') < 0) miss.push('USD');
    if (miss.length) out.push(link(Notification_item_(p.fd, 'danger', 'fx', t, p.id + ' · ' + (p.name || '') + ': ' + miss.join(', ') + ' ≤ ' + p.fd, 'Projects', p.id), 'Projects', p.id));
    if (!D.lines.some(function (l) { return l.prj === p.id && l.stg === st.bid; })) {
      out.push(link(Notification_item_(p.qd || D.today, 'warn', 'data', L_('Dự án chưa có dòng item Bid', 'Project has no bid item rows'), p.id + ' · ' + (p.name || ''), 'Projects', p.id), 'Projects', p.id));
    }
  });
  D.prices.forEach(function (x) {
    var miss = [];
    if (x.cur && x.d && x.fx === null) miss.push(x.cur);
    if (x.d && x.fxu === null && miss.indexOf('USD') < 0) miss.push('USD');
    if (miss.length) out.push(Notification_item_(x.d, 'danger', 'fx', t, x.id + ' · ' + (x.name || x.mat) + ': ' + miss.join(', ') + ' ≤ ' + x.d, 'Material_Prices', x.id));
  });
  D.freight.forEach(function (x) {
    var p = Utils_indexBy_(D.projects, 'id')[x.prj] || {};
    if (x.cur && p.fd && x.fx === null) out.push(link(Notification_item_(p.fd, 'danger', 'fx', t, x.id + ' (' + x.prj + '): ' + x.cur + ' ≤ ' + p.fd, 'Project_Freight', x.id), 'Projects', x.prj));
  });
  D.inb.forEach(function (x) {
    var p = Utils_indexBy_(D.projects, 'id')[x.prj] || {};
    if (x.cur && p.fd && x.fx === null) out.push(link(Notification_item_(p.fd, 'danger', 'fx', t, x.id + ' (' + x.prj + '): ' + x.cur + ' ≤ ' + p.fd, 'Project_Inputs_Bid', x.id), 'Projects', x.prj));
  });
  D.inj.forEach(function (x) {
    if (!x.pd) return;
    var miss = [];
    if (x.cur && x.fx === null) miss.push(x.cur);
    if (x.base !== null && x.usd === null && miss.indexOf('USD') < 0) miss.push('USD');
    if (miss.length) out.push(link(Notification_item_(x.pd, 'danger', 'fx', t, x.id + ' (' + x.prj + '): ' + miss.join(', ') + ' ≤ ' + x.pd, 'Project_Inputs_Job', x.id), 'Projects', x.prj));
  });
  return out;
}

function Spd_checks_() {
  var D = Spd_compute_(), out = [], st = D.stage;
  D.inb.forEach(function (x) { Spd_checkInput_(out, 'Project_Inputs_Bid', x); });
  D.inj.forEach(function (x) {
    Spd_checkInput_(out, 'Project_Inputs_Job', x);
    if (!x.matched) out.push({ level: 'warn', table: 'Project_Inputs_Job', id: x.id, column: 'specification',
      message: L_('Không ghép được với Bid (cùng dự án + vật tư + quy cách): ', 'No matching bid row (same project + material + spec): ') + x.mat + ' · ' + (x.spec || '—') });
  });
  D.projects.forEach(function (p) {
    if (SPD_WON_.indexOf(p.st) >= 0 && !p.jobRows) out.push({ level: 'warn', table: 'Projects', id: p.id, column: 'status',
      message: p.st + L_(' nhưng chưa có dòng item Job', ' but there are no job item rows') });
  });
  var seen = {};
  D.fx.forEach(function (r) {
    var k = String(r.d).slice(0, 10) + '|' + r.c;
    if (!r.d || !r.c) return;
    if (seen[k]) out.push({ level: 'danger', table: 'FX_Rates', id: r.id, column: 'currency', message: L_('Trùng ngày + tiền tệ với ', 'Same date + currency as ') + seen[k] + ' (' + k.replace('|', ' ') + ')' });
    else seen[k] = r.id;
  });
  return out;
}

function Spd_checkInput_(out, table, x) {
  if (x.check === 'Spec differs') out.push({ level: 'warn', table: table, id: x.id, column: 'specification',
    message: L_('Quy cách khác dòng giá tham chiếu: ', 'Spec differs from reference price row: ') + (x.spec || '—') + ' ≠ ' + (x.refSpec || '—') });
  if (x.ref && x.refMat && x.refMat !== x.mat) out.push({ level: 'warn', table: table, id: x.id, column: 'price_id',
    message: L_('Dòng giá ', 'Price row ') + x.ref + L_(' thuộc vật tư ', ' belongs to material ') + x.refMat + ' ≠ ' + x.mat });
}
