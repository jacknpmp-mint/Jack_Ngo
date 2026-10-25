// Kiểm thử backend DÙNG CHUNG cho mọi app sinh từ bộ khung mth-webapp-making (mô phỏng Apps Script trên Node).
// test/data.json: fixture (mặc định = bản sao dữ liệu thật đã làm sạch); test/data_real.json: dữ liệu thật (smoke test).
// Ca kiểm thử nghiệp vụ riêng của DB đặt ở test/custom.test.js (chạy sau file này).
const fs = require('fs'), path = require('path');
const { makeContext } = require('./mock');
let pass = 0, fail = 0;
const results = [];
function t(name, fn) {
  try { fn(); pass++; results.push('  ✔ ' + name); }
  catch (e) { fail++; results.push('  ✖ ' + name + '\n      ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join('\n      ') : e)); }
}
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || '') + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a)); }
function ok(c, m) { if (!c) throw new Error(m || 'assert failed'); }
function okRes(r) { if (!r.ok) throw new Error('API error: ' + JSON.stringify(r.error)); return r.data; }
function errRes(r, code) { if (r.ok) throw new Error('expected error ' + code); if (code) eq(r.error.code, code, 'error code'); return r.error; }

const A0 = makeContext();
const C = A0.ctx, SCHEMA = C.SCHEMA, APP = C.APP, LISTS = C.LISTS, CATALOGS = C.CATALOG_TABLES;
const tables = Object.keys(SCHEMA);
const today = new Date().toISOString().slice(0, 10);

/** Giá trị thử hợp lệ cho một cột (không phải FK). */
function sample(table, c, k) {
  if (c.list && LISTS[c.list] && LISTS[c.list].length) return LISTS[c.list][0];
  if (c.format === 'email') return 'test' + k + '.' + Date.now() % 100000 + '@test.example';
  if (c.format === 'url') return 'https://example.com/' + k;
  if (c.type === 'date') return today;
  if (c.type === 'number') return c.pct ? 0.1 : (c.min !== undefined ? Math.max(c.min, 1) : 1);
  if (APP.STAFF && table === APP.STAFF.table && c.name === APP.STAFF.access) return 'Viewer';
  if (c.name === 'Active') return 'Y';
  return 'Test ' + c.name + ' ' + k;
}
/** Tạo bản ghi tối thiểu hợp lệ cho bảng (tạo bản ghi cha nếu cần). Trả mã bản ghi. */
function create(A, table, k, depth) {
  depth = depth || 0;
  const def = SCHEMA[table], rec = {};
  def.columns.forEach(c => {
    if (c.key === 'PK' || c.auto) return;
    if (c.key === 'FK') {
      if (!c.required && depth > 0) return;
      const ids = okRes(A.api('record.list', { table: c.ref })).rows.map(r => r[SCHEMA[c.ref].pk]);
      rec[c.name] = ids.length ? ids[0] : (depth < 4 ? create(A, c.ref, k, depth + 1) : '');
      return;
    }
    if (c.required || c.unique || c.need) rec[c.name] = sample(table, c, k);
  });
  // giữ đúng quan hệ cha: các FK có parentFk phải cùng bản ghi cha
  def.columns.filter(c => c.key === 'FK' && rec[c.name]).forEach(c => {
    const pf = SCHEMA[c.ref] && SCHEMA[c.ref].parentFk;
    if (pf && rec[pf] !== undefined) {
      const ok2 = okRes(A.api('record.list', { table: c.ref })).rows.filter(r => r[pf] === rec[pf]);
      rec[c.name] = ok2.length ? ok2[0][SCHEMA[c.ref].pk] : '';
      if (!rec[c.name] && !c.required) delete rec[c.name];
    }
  });
  return okRes(A.api('record.save', { table, record: rec })).record[def.pk];
}

/* ---------------- Khởi động, cấu trúc, phân quyền ---------------- */
t('nạp file theo thứ tự ngược vẫn chạy (không phụ thuộc thứ tự file)', () => { okRes(makeContext({ reverse: true }).api('app.bootstrap')); });
t('bootstrap: Admin, schema đủ bảng, lookups cho mọi bảng được FK trỏ tới, menu chỉ gồm bảng có thật', () => {
  const d = okRes(makeContext().api('app.bootstrap'));
  if (APP.FEATURES.AUTH !== false) eq(d.user.role, 'Admin');
  eq(Object.keys(d.config.tables), tables);
  tables.forEach(tb => SCHEMA[tb].columns.filter(c => c.key === 'FK').forEach(c => ok(d.lookups[c.ref], 'lookup ' + c.ref)));
  d.config.menu.forEach(g => g.items.forEach(it => ok(!it.table || SCHEMA[it.table], 'menu ' + it.table)));
});
t('kiểm tra cấu trúc: không có lỗi chặn', () => {
  const s = okRes(makeContext().api('structure.check'));
  ok(s.ok, JSON.stringify(s.issues.filter(i => i.level === 'error')));
});
t('mỗi bảng có PK là cột đầu, prefix/idStyle hợp lệ, prefix không trùng giữa các bảng', () => {
  const seen = {};
  tables.forEach(tb => {
    const d = SCHEMA[tb];
    eq(d.columns.find(c => c.key === 'PK').name, d.pk, tb);
    ok(/^[A-Z]{1,5}$/.test(d.prefix), tb + ' prefix ' + d.prefix); ok(['year', 'catalog'].includes(d.idStyle), tb + ' idStyle');
    ok(!seen[d.prefix], 'prefix trùng ' + d.prefix + ': ' + tb + ' / ' + seen[d.prefix]); seen[d.prefix] = tb;
    d.columns.filter(c => c.key === 'FK').forEach(c => ok(SCHEMA[c.ref], tb + '.' + c.name + ' → ' + c.ref + ' không có'));
    if (d.parentFk) ok(d.columns.some(c => c.name === d.parentFk && c.key === 'FK'), tb + ' parentFk ' + d.parentFk + ' phải là FK');
  });
});
if (APP.FEATURES.AUTH !== false) {
  t('email lạ / tài khoản nghỉ → AUTH; Viewer không lưu được', () => {
    errRes(makeContext({ email: 'stranger@gmail.com' }).api('app.bootstrap'), 'AUTH');
    errRes(makeContext({ email: 'off@test.example' }).api('app.bootstrap'), 'AUTH');
    const V = makeContext({ email: 'viewer@test.example' });
    eq(okRes(V.api('app.bootstrap')).user.role, 'Viewer');
    const tb = tables.find(x => CATALOGS.indexOf(x) < 0);
    errRes(V.api('record.save', { table: tb, record: {} }), 'FORBIDDEN');
  });
  t('Editor không sửa được bảng danh mục; không bỏ được Admin cuối cùng', () => {
    const E = makeContext({ email: 'editor@test.example' });
    errRes(E.api('record.save', { table: APP.STAFF.table, record: {} }), 'FORBIDDEN');
    const A = makeContext(), S = APP.STAFF;
    const admins = okRes(A.api('record.list', { table: S.table })).rows.filter(r => r[S.access] === 'Admin' && r[S.active] === 'Y');
    admins.slice(0, -1).forEach(r => okRes(A.api('record.save', { table: S.table, record: Object.assign({}, r, { [S.access]: 'Editor' }) })));
    const last = admins[admins.length - 1];
    errRes(A.api('record.save', { table: S.table, record: Object.assign({}, last, { [S.access]: 'Viewer' }) }), 'VALIDATION');
  });
}

/* ---------------- Ghi dữ liệu cho TỪNG bảng ---------------- */
tables.forEach((tb, k) => {
  t('[' + tb + '] mã dự kiến → thêm tối thiểu (chỉ PK + FK) → đúng mẫu mã, sửa, danh sách, 360°, nhật ký', () => {
    const A = makeContext(), def = SCHEMA[tb];
    const peek = okRes(A.api('record.peekId', { table: tb })).id;
    const dg = def.idDigits || 3;   // số chữ số của mã (mặc định 3)
    const re = def.idStyle === 'year' ? new RegExp('^' + def.prefix + '-\\d{4}-\\d{' + dg + ',}$') : new RegExp('^' + def.prefix + '-\\d{' + dg + ',}$');
    ok(re.test(peek), 'peek ' + peek);
    const id = create(A, tb, k);
    ok(re.test(id), 'id ' + id);
    const firstText = def.columns.find(c => !c.key && !c.auto && c.type === 'string' && !c.list && !c.format && !c.unique);
    if (firstText) {
      const r = okRes(A.api('record.save', { table: tb, record: { [def.pk]: id, [firstText.name]: 'Đã sửa ' + k } }));
      eq(r.record[firstText.name], 'Đã sửa ' + k);
    }
    const list = okRes(A.api('entity.list', { table: tb }));
    ok(list.rows.some(r => r[def.pk] === id), 'list');
    ok(Array.isArray(list.rows[0].Missing), 'Missing flag');
    const d = okRes(A.api('entity.get360', { table: tb, id }));
    eq(d.record[def.pk], id);
    if (APP.FEATURES.ACTIVITY !== false) ok(okRes(A.api('activity.list', { id })).rows.length >= 1, 'activity');
  });
});

t('kiểm tra hợp lệ: sai số, sai ngày, FK không tồn tại → VALIDATION; giá trị ngoài danh mục chỉ cảnh báo', () => {
  const A = makeContext();
  const tb = tables.find(x => SCHEMA[x].columns.some(c => c.type === 'number' && !c.auto && !c.key));
  if (tb) { const c = SCHEMA[tb].columns.find(c => c.type === 'number' && !c.auto && !c.key); errRes(A.api('record.save', { table: tb, record: Object.assign(minimal(A, tb), { [c.name]: 'abc' }) }), 'VALIDATION'); }
  const td = tables.find(x => SCHEMA[x].columns.some(c => c.type === 'date' && !c.auto));
  if (td) { const c = SCHEMA[td].columns.find(c => c.type === 'date' && !c.auto); errRes(A.api('record.save', { table: td, record: Object.assign(minimal(A, td), { [c.name]: '31/31/2026' }) }), 'VALIDATION'); }
  const tf = tables.find(x => SCHEMA[x].columns.some(c => c.key === 'FK' && !c.soft));
  if (tf) { const c = SCHEMA[tf].columns.find(c => c.key === 'FK' && !c.soft); errRes(A.api('record.save', { table: tf, record: Object.assign(minimal(A, tf), { [c.name]: 'ZZ-0000-999' }) }), 'VALIDATION'); }
  const tl = tables.find(x => CATALOGS.indexOf(x) < 0 && SCHEMA[x].columns.some(c => c.list && !c.auto));
  if (tl) { const c = SCHEMA[tl].columns.find(c => c.list && !c.auto); const r = okRes(A.api('record.save', { table: tl, record: Object.assign(minimal(A, tl), { [c.name]: 'Giá trị lạ' }) })); ok(r.warnings.some(w => w.indexOf(c.list) >= 0), 'warn list'); }
});
function minimal(A, tb) {
  const rec = {};
  SCHEMA[tb].columns.filter(c => c.key === 'FK' && c.required).forEach(c => {
    const rows = okRes(A.api('record.list', { table: c.ref })).rows; rec[c.name] = rows.length ? rows[0][SCHEMA[c.ref].pk] : create(A, c.ref, 77);
  });
  SCHEMA[tb].columns.filter(c => c.required && c.key !== 'FK' && c.key !== 'PK').forEach(c => { rec[c.name] = sample(tb, c, 78); });
  return rec;
}

t('xóa bản ghi cha còn bản ghi con → CONFLICT; xóa bản ghi lá → ghi nhật ký Delete', () => {
  const A = makeContext();
  const rel = tables.map(tb => SCHEMA[tb].columns.filter(c => c.key === 'FK' && c.ref !== (APP.STAFF || {}).table).map(c => [tb, c])).flat()[0];
  if (!rel) return;
  const [child, c] = rel;
  const cid = create(A, child, 91);
  const pid = okRes(A.api('record.get', { table: child, id: cid }))[c.name];
  if (pid) errRes(A.api('record.delete', { table: c.ref, id: pid }), 'CONFLICT');
  okRes(A.api('record.delete', { table: child, id: cid }));
  if (APP.FEATURES.ACTIVITY !== false) ok(okRes(A.api('activity.list', { id: cid, action: 'Delete' })).rows.length === 1);
});
t('dashboard.get + notification.list + kiểm tra dữ liệu chạy; KPI đủ bảng khai báo', () => {
  const A = makeContext();
  const d = okRes(A.api('dashboard.get', { year: new Date().getFullYear() }));
  ok(Array.isArray(d.checks) && Array.isArray(d.metrics) && d.kpis.length === (C.DASHBOARD.kpiTables || tables).filter(x => SCHEMA[x]).length);
  const n = okRes(A.api('notification.list', {}));
  ok(Array.isArray(n.rows));
  n.rows.forEach(x => ok(!x.link || (x.link.route === 'entity' && SCHEMA[x.link.table]), 'link ' + JSON.stringify(x.link)));
});
t('song ngữ: mọi bảng / cột có nhãn VN + EN; ghi chú tiếng Việt có bản EN; lỗi server theo lang=en', () => {
  const miss = [];
  tables.forEach(tb => {
    const tl = C.I18N_TABLES[tb]; if (!tl || !tl[0] || !tl[1]) miss.push(tb);
    SCHEMA[tb].columns.forEach(c => {
      const l = C.I18N_COLUMNS[tb + '.' + c.name] || C.I18N_COLUMNS[c.name];
      if (!l || !l[0] || !l[1]) miss.push(tb + '.' + c.name);
      if (c.note && /[À-ỹ]/.test(c.note) && !C.I18N_NOTES_EN[tb + '.' + c.name]) miss.push(tb + '.' + c.name + ' (note EN)');
    });
  });
  ok(!miss.length, 'thiếu nhãn: ' + miss.join(', '));
  const e = errRes(makeContext({ email: 'stranger@gmail.com' }).api('app.bootstrap', {}, 'en'), APP.FEATURES.AUTH === false ? undefined : 'AUTH');
  if (APP.FEATURES.AUTH !== false) ok(/is not in/.test(e.message), e.message);
});

/* ---------------- Dữ liệu thật (smoke test) ---------------- */
if (fs.existsSync(path.join(__dirname, 'data_real.json'))) {
  t('[dữ liệu thật] mọi API đọc chạy, không lỗi; 360° mở được bản ghi đầu mỗi bảng có view360', () => {
    const R = makeContext({ dataFile: 'data_real.json' });
    ['app.bootstrap', 'dashboard.get', 'notification.list', 'lookups.get', 'activity.list', 'user.me', 'structure.check'].forEach(a => okRes(R.api(a, {})));
    tables.forEach(tb => {
      const rows = okRes(R.api('entity.list', { table: tb })).rows;
      if (SCHEMA[tb].view360 && rows.length) okRes(R.api('entity.get360', { table: tb, id: rows[0][SCHEMA[tb].pk] }));
    });
    eq(R.state.logs.filter(l => l[0] === 'error').length, 0, 'console.error');
  });
}

const custom = path.join(__dirname, 'custom.test.js');
if (fs.existsSync(custom)) require(custom)({ t, eq, ok, okRes, errRes, makeContext, create, SCHEMA, APP });

console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
