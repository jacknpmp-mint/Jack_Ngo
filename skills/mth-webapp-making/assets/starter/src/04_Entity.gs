/**
 * 04_Entity.gs — Module dùng chung cho MỌI bảng nghiệp vụ (không cần viết code riêng):
 *  - Entity_list_: danh sách + nhãn FK + cờ "Thiếu dữ liệu" + lọc (từ khóa, Year, cột = giá trị, chỉ bản ghi thiếu).
 *  - Entity_get360_: trang 360° = bản ghi + bản ghi cha (theo FK) + các bảng con (bảng có FK trỏ tới) + nhật ký.
 *  - Entity_hooks_: quy tắc chung — số thứ tự *_no kế tiếp theo bản ghi cha, cột người ghi (AUTO_USER_COLS),
 *    trạng thái mặc định (DEFAULTS), Done_day khi Status = Done.
 *  - Checks_run_: kiểm tra dữ liệu (FK mồ côi, trùng cột unique, ngày ngược thứ tự, thiếu cột bắt buộc / nên có).
 * Quy tắc nghiệp vụ riêng của từng DB đặt ở file module khác (vd 20_Project.gs) và khai báo trong HOOK_PROVIDERS.
 */

/** Nhãn hiển thị của một mã khóa ngoại. */
function Entity_label_(table, id) {
  var def = SCHEMA[table], r = Data_find_(table, id);
  if (!def || !r) return '';
  var cols = def.labelCols && def.labelCols.length ? def.labelCols : [def.display];
  return cols.map(function (c) { return Utils_isBlank_(r[c]) ? '' : String(r[c]); }).filter(Boolean).join(' · ');
}

/** p: { table, q, year, eq: {cột: giá trị}, missing: true } */
function Entity_list_(p) {
  var table = p.table, def = Config_table_(table);
  Form_applyPolicy_();
  var rows = Data_all_(table);
  var fks = def.columns.filter(function (c) { return c.key === 'FK'; });
  var labels = {};
  fks.forEach(function (c) {
    if (!SCHEMA[c.ref]) return;
    var idx = {};
    Data_all_(c.ref).forEach(function (r) { idx[r[SCHEMA[c.ref].pk]] = r; });
    labels[c.name] = function (id) {
      var r = idx[id], d = SCHEMA[c.ref];
      if (!r) return '';
      var cols = d.labelCols && d.labelCols.length ? d.labelCols : [d.display];
      return cols.map(function (k) { return Utils_isBlank_(r[k]) ? '' : String(r[k]); }).filter(Boolean).join(' · ');
    };
  });
  rows.forEach(function (r) {
    r.Missing = Form_missing_(table, r);
    r._labels = {};
    fks.forEach(function (c) { if (labels[c.name] && !Utils_isBlank_(r[c.name])) r._labels[c.name] = labels[c.name](r[c.name]); });
  });
  if (p.eq) Object.keys(p.eq).forEach(function (k) {
    if (!Utils_isBlank_(p.eq[k])) rows = rows.filter(function (r) { return String(r[k]) === String(p.eq[k]); });
  });
  if (!Utils_isBlank_(p.year) && def.dateCol) rows = rows.filter(function (r) { return String(r[def.dateCol] || '').slice(0, 4) === String(p.year); });
  if (p.missing) rows = rows.filter(function (r) { return r.Missing.length > 0; });
  if (!Utils_isBlank_(p.q)) {
    var q = String(p.q).toLowerCase();
    rows = rows.filter(function (r) { return JSON.stringify(r).toLowerCase().indexOf(q) >= 0; });
  }
  rows.reverse();   // mới nhất trước
  return { table: table, total: rows.length, rows: rows };
}

/** Trang 360°: bản ghi + cha + con + nhật ký. */
function Entity_get360_(table, id, user) {
  var def = Config_table_(table);
  Form_applyPolicy_();
  var rec = Data_find_(table, id);
  if (!rec) throw AppError_('NOT_FOUND', L_('Không tìm thấy ', 'Not found: ') + id + '.');
  rec.Missing = Form_missing_(table, rec);
  var parents = def.columns.filter(function (c) { return c.key === 'FK' && !Utils_isBlank_(rec[c.name]) && SCHEMA[c.ref]; }).map(function (c) {
    return { column: c.name, table: c.ref, id: rec[c.name], label: Entity_label_(c.ref, rec[c.name]), view360: !!SCHEMA[c.ref].view360 };
  });
  var ids = [id];
  var children = Config_children_(table).map(function (ch) {
    var rows = Data_all_(ch.table).filter(function (r) { return String(r[ch.column]) === String(id); });
    rows.forEach(function (r) { r.Missing = Form_missing_(ch.table, r); ids.push(r[SCHEMA[ch.table].pk]); });
    return { table: ch.table, column: ch.column, rows: rows };
  });
  var activity = Auth_can_(user, PERMISSION.ACTIVITY_READ) && APP.FEATURES.ACTIVITY !== false ? Activity_list_({ recordIds: ids, limit: 100 }).rows : [];
  var extra = {};
  (ENTITY_EXTRA_PROVIDERS || []).forEach(function (name) {
    var x = Data_call_(name, [table, rec]) || {};
    for (var k in x) extra[k] = x[k];
  });
  return { table: table, record: rec, parents: parents, children: children, activity: activity, extra: extra };
}

/** Quy tắc chung cho mọi bảng (khai báo 'Entity_hooks_' đầu tiên trong HOOK_PROVIDERS). */
function Entity_hooks_() {
  var out = {};
  Object.keys(SCHEMA).forEach(function (t) {
    var def = SCHEMA[t];
    out[t] = {
      beforeSave: function (rec, ctx) {
        // Số thứ tự kế tiếp (vd Shipment_no) theo bản ghi cha parentFk
        def.columns.forEach(function (c) {
          if (c.type !== 'number' || !/_no$/i.test(c.name) || !def.parentFk || !Utils_isBlank_(rec[c.name]) || Utils_isBlank_(rec[def.parentFk])) return;
          var nos = Data_all_(t).filter(function (x) { return String(x[def.parentFk]) === String(rec[def.parentFk]); })
            .map(function (x) { return Utils_num_(x[c.name]); });
          rec[c.name] = (nos.length ? Math.max.apply(null, nos) : 0) + 1;
        });
        // Cột người ghi / người phụ trách mặc định = người đang dùng app
        (AUTO_USER_COLS[t] || []).forEach(function (k) { if (Utils_isBlank_(rec[k]) && ctx.user && ctx.user.staffId) rec[k] = ctx.user.staffId; });
        // Giá trị mặc định khi thêm mới
        if (ctx.isNew) Object.keys(DEFAULTS[t] || {}).forEach(function (k) { if (Utils_isBlank_(rec[k])) rec[k] = DEFAULTS[t][k]; });
        // Status = Done → Done_day (không sớm hơn Start_day)
        if (rec.Status === 'Done' && Utils_isBlank_(rec.Done_day) && def.columns.some(function (c) { return c.name === 'Done_day'; })) {
          var today = Utils_today_();
          rec.Done_day = rec.Start_day && rec.Start_day > today ? rec.Start_day : today;
        }
      }
    };
  });
  return out;
}

/**
 * Kiểm tra dữ liệu toàn Database (Dashboard › Kiểm tra dữ liệu).
 * Trả [{ level: 'danger'|'warn', table, id, column, message }].
 */
function Checks_run_() {
  Form_applyPolicy_();
  var out = [];
  Object.keys(SCHEMA).forEach(function (t) {
    var def = SCHEMA[t], rows = Data_all_(t), seen = {};
    rows.forEach(function (r) {
      var id = r[def.pk];
      def.columns.forEach(function (c) {
        var v = r[c.name];
        if (c.key === 'FK' && !Utils_isBlank_(v) && SCHEMA[c.ref] && !Data_find_(c.ref, v)) {
          out.push({ level: c.soft ? 'warn' : 'danger', table: t, id: id, column: c.name,
            message: c.name + ' = ' + v + L_(' không có trong ', ' not found in ') + c.ref });
        }
        if (c.unique && !Utils_isBlank_(v)) {
          var key = c.name + '|' + String(v).toLowerCase();
          if (seen[key]) out.push({ level: 'danger', table: t, id: id, column: c.name, message: c.name + ' "' + v + L_('" trùng với ', '" duplicates ') + seen[key] });
          else seen[key] = id;
        }
      });
      DATE_ORDER_RULES.forEach(function (p) {
        if (Utils_isBlank_(r[p[0]]) || Utils_isBlank_(r[p[1]])) return;
        var gap = Utils_daysBetween_(r[p[0]], r[p[1]]);
        if (gap !== null && gap < 0) out.push({ level: 'warn', table: t, id: id, column: p[1], message: p[1] + ' (' + r[p[1]] + L_(') trước ', ') is before ') + p[0] + ' (' + r[p[0]] + ')' });
      });
      var miss = Form_missing_(t, r);
      if (miss.length && CATALOG_TABLES.indexOf(t) < 0) out.push({ level: 'info', table: t, id: id, column: miss[0], message: L_('Thiếu: ', 'Missing: ') + miss.join(', ') });
    });
  });
  (CHECK_PROVIDERS || []).forEach(function (name) { out = out.concat(Data_call_(name) || []); });
  return out;
}
