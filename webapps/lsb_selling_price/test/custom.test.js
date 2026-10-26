// Ca kiểm thử nghiệp vụ LSB Selling Price DB (chạy sau backend.test.js). Fixture: test/data.json (minh hoạ, make_fixture_spd.py).
module.exports = ({ t, eq, ok, okRes, errRes, makeContext }) => {
  const near = (a, b, m, eps) => { if (a === null || b === null || Math.abs(a - b) > (eps || 1e-6) * Math.max(1, Math.abs(b))) throw new Error((m || '') + ' expected ' + b + ' got ' + a); };
  const data = () => okRes(makeContext().api('spd.data'));

  t('[SPD] danh mục nạp từ sheet Config (PHP thay Peso, Stage = Bid/Job) và đổi trên Sheet là app thấy ngay', () => {
    const A = makeContext();
    const b = okRes(A.api('app.bootstrap'));
    eq(b.config.lists.Currency, ['VND', 'USD', 'IDR', 'PHP']);
    eq(b.config.lists.Stage, ['Bid', 'Job']);
    A.ss.sheets.Config.cell(12, 1, true).v = 'SGD';     // A12 thêm tay trên Sheet
    ok(okRes(A.api('app.bootstrap')).config.lists.Currency.includes('SGD'), 'live list');
  });

  t('[SPD] tỷ giá: dòng mới nhất ≤ ngày, tiền gốc = 1; giá USD của dự án bán USD = đúng giá chào', () => {
    const D = data();
    eq(D.base, 'VND');
    const usdRows = D.fx.filter(x => x.c === 'USD').sort((a, b) => a.d < b.d ? -1 : 1);
    D.projects.filter(p => p.fd >= usdRows[0].d).forEach(p => {
      const exp = usdRows.filter(x => x.d <= p.fd).pop().r;
      eq(p.fxu, exp, p.id + ' fx_usd');
      if (p.cc === 'VND') eq(p.fxc, 1, p.id + ' fx_cost');
    });
    const usdLine = D.lines.find(l => (D.projects.find(p => p.id === l.prj) || {}).sc === 'USD' && l.sellU !== null);
    ok(usdLine, 'có dòng bán USD');
    near(usdLine.sellU, usdLine.sell, usdLine.id + ' sellU = unit_sell');
    const p = D.projects.find(x => x.id === usdLine.prj);
    near(usdLine.sellB, usdLine.sell * p.fxs, 'sellB');
    near(usdLine.cost, usdLine.cm + usdLine.cf + usdLine.ce + usdLine.co, 'unit_cost');
    near(usdLine.gmp, (usdLine.sellB - usdLine.costB) / usdLine.sellB, 'gm%');
    near(usdLine.gmU, usdLine.gm / p.fxu, 'gm USD');
  });

  t('[SPD] GM% Bid/Job của dự án = TB đơn giản GM% các dòng theo giai đoạn; Job ghép Bid theo dự án + vật tư + quy cách', () => {
    const D = data();
    const p = D.projects.find(x => x.gmBid !== null && x.gmJob !== null);
    const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
    near(p.gmBid, avg(D.lines.filter(l => l.prj === p.id && l.stg === 'Bid').map(l => l.gmp)), 'gmBid');
    near(p.gmJob, avg(D.lines.filter(l => l.prj === p.id && l.stg === 'Job').map(l => l.gmp)), 'gmJob');
    const j = D.inj.find(x => x.matched);
    const b = D.inb.filter(y => y.prj === j.prj && y.mat === j.mat && y.spec === j.spec);
    near(j.bidB, avg(b.map(y => y.base)), 'bidB');
    near(j.vBid, j.base / j.bidB - 1, 'var vs bid');
    const ref = D.prices.find(x => x.id === j.ref);
    near(j.listB, ref.base, 'list'); near(j.vList, j.base / ref.base - 1, 'var vs list');
  });

  t('[SPD] cảnh báo: thiếu tỷ giá (PRJ-0006 không có USD ≤ ngày tỷ giá), dự án chưa có dòng item Bid (PRJ-0012)', () => {
    const n = okRes(makeContext().api('notification.list', {}));
    ok(n.rows.some(x => x.level === 'danger' && /Thiếu tỷ giá/.test(x.title) && /PRJ-0006/.test(x.detail) && x.link && x.link.id === 'PRJ-0006'), 'fx PRJ-0006');
    ok(n.rows.some(x => x.level === 'warn' && /PRJ-0012/.test(x.detail) && x.link.table === 'Projects'), 'no bid PRJ-0012');
    const e = okRes(makeContext().api('notification.list', {}, 'en'));
    ok(e.rows.some(x => /Missing FX rate/.test(x.title)), 'EN');
  });

  t('[SPD] kiểm tra dữ liệu: lệch spec + Job không ghép Bid (PRJ-0004), Won chưa có dòng Job (PRJ-0010), trùng tỷ giá', () => {
    const A = makeContext();
    const c = okRes(A.api('dashboard.get', { year: 2026 })).checks;
    ok(c.some(x => x.table === 'Project_Inputs_Job' && /Spec differs|Quy cách khác/.test(x.message)), 'spec');
    ok(c.some(x => x.table === 'Project_Inputs_Job' && /ghép/.test(x.message)), 'no match');
    ok(c.some(x => x.table === 'Projects' && x.id === 'PRJ-0010'), 'won no job');
    const fx = A.ss.sheets.FX_Rates;   // chèn trùng thẳng vào Sheet (bỏ qua app) → báo lỗi
    const r = fx.grid.findIndex((row, i) => i >= 3 && !(row[6] && row[6].v));
    fx.grid[r][0] = { v: new Date(2026, 0, 1) }; fx.grid[r][1] = { v: 'USD' }; fx.grid[r][3] = { v: 25000 }; fx.grid[r][6] = { v: 'FX-0999' };
    ok(okRes(A.api('dashboard.get', { year: 2026 })).checks.some(x => x.table === 'FX_Rates' && x.level === 'danger'), 'dup fx');
  });

  t('[SPD] FX_Rates: chặn trùng ngày + tiền tệ, chặn tỷ giá ≤ 0, cảnh báo nhập tiền gốc; mã FX-0067', () => {
    const A = makeContext();
    eq(okRes(A.api('record.peekId', { table: 'FX_Rates' })).id, 'FX-0067');
    errRes(A.api('record.save', { table: 'FX_Rates', record: { effective_date: '2026-10-01', currency: 'USD', rate: 26100 } }), 'VALIDATION');
    errRes(A.api('record.save', { table: 'FX_Rates', record: { effective_date: '2026-10-02', currency: 'USD', rate: 0 } }), 'VALIDATION');
    const r = okRes(A.api('record.save', { table: 'FX_Rates', record: { effective_date: '2026-10-02', currency: 'VND', rate: 1 } }));
    ok(r.warnings.some(w => /luôn có tỷ giá 1/.test(w)), 'base warn');
    eq(r.record.fx_id, 'FX-0067');
    const ok2 = okRes(A.api('record.save', { table: 'FX_Rates', record: { effective_date: '2026-10-20', currency: 'USD', rate: 26400 } }));
    eq(ok2.record.fx_id, 'FX-0068');
  });

  t('[SPD] mã đúng mẫu file: PRJ-0013, PIT-00082, PRC-00031, CUS-0008, ITM-07, TT-07', () => {
    const A = makeContext();
    [['Projects', 'PRJ-0013'], ['Project_Items', 'PIT-00082'], ['Material_Prices', 'PRC-00031'], ['Customers', 'CUS-0008'], ['Items', 'ITM-07'], ['Markets', 'TT-07']]
      .forEach(([tb, id]) => eq(okRes(A.api('record.peekId', { table: tb })).id, id, tb));
  });

  t('[SPD] bắt buộc chỉ PK + FK: dự án lưu được chỉ với khách hàng + thị trường, cờ Thiếu dữ liệu liệt kê cột Required của DataDictionary', () => {
    const A = makeContext();
    errRes(A.api('record.save', { table: 'Projects', record: { project_name: 'X' } }), 'VALIDATION');
    const r = okRes(A.api('record.save', { table: 'Projects', record: { customer_id: 'CUS-0001', market_id: 'TT-01' } })).record;
    const row = okRes(A.api('entity.list', { table: 'Projects' })).rows.find(x => x.project_id === r.project_id);
    ['project_name', 'status', 'sell_currency', 'cost_currency', 'fx_date'].forEach(k => ok(row.Missing.includes(k), 'missing ' + k));
    errRes(A.api('record.save', { table: 'Markets', record: {} }), 'VALIDATION');   // danh mục giữ bắt buộc
  });

  t('[SPD] chép Bid → Job: chặn khi chưa Won; Won (PRJ-0010) chép đủ item + vật tư, lần 2 không chép trùng; Viewer bị chặn', () => {
    const A = makeContext();
    errRes(A.api('spd.copyToJob', { id: 'PRJ-0005' }), 'VALIDATION');                   // Quoting
    errRes(makeContext({ email: 'viewer@test.example' }).api('spd.copyToJob', { id: 'PRJ-0010' }), 'FORBIDDEN');
    const before = okRes(A.api('spd.project', { id: 'PRJ-0010' }));
    const nBid = before.lines.filter(l => l.stg === 'Bid').length, nIn = before.inb.length;
    ok(nBid > 0 && nIn > 0 && before.lines.every(l => l.stg === 'Bid') && before.inj.length === 0, 'fixture');
    const r = okRes(A.api('spd.copyToJob', { id: 'PRJ-0010' }));
    eq(r.items.length, nBid); eq(r.inputs.length, nIn);
    const after = okRes(A.api('spd.project', { id: 'PRJ-0010' }));
    after.lines.filter(l => l.stg === 'Job').forEach(j => {
      const b = after.lines.find(l => l.stg === 'Bid' && l.item === j.item);
      eq([j.cm, j.cf, j.ce, j.co, j.sell], [b.cm, b.cf, b.ce, b.co, b.sell], j.id);
      ok(/Copied from bid row PIT-/.test(j.notes), 'note');
    });
    ok(after.inj.every(x => !x.pd), 'price_date trống');
    const missing = okRes(A.api('entity.list', { table: 'Project_Inputs_Job' })).rows.filter(x => r.inputs.includes(x.input_id));
    ok(missing.every(x => x.Missing.includes('price_date')), 'cờ thiếu price_date');
    const r2 = okRes(A.api('spd.copyToJob', { id: 'PRJ-0010' }));
    eq([r2.items.length, r2.inputs.length], [0, 0]);
    ok(okRes(A.api('activity.list', { id: r.items[0] })).rows.length === 1, 'nhật ký');
  });

  t('[SPD] danh sách chọn: Admin thêm / xóa giá trị chưa dùng; chặn xóa giá trị đang dùng, chặn sửa Stage; Editor bị chặn; có nhật ký', () => {
    const A = makeContext();
    const l = okRes(A.api('spd.lists'));
    eq(l.base, 'VND');
    const cur = l.lists.find(x => x.name === 'Currency');
    ok(cur.values.find(v => v.v === 'USD').used > 0, 'USD used');
    errRes(makeContext({ email: 'editor@test.example' }).api('spd.listAdd', { list: 'Currency', value: 'SGD' }), 'FORBIDDEN');
    const a = okRes(A.api('spd.listAdd', { list: 'Currency', value: 'SGD' }));
    eq(a.lists.find(x => x.name === 'Currency').values.map(v => v.v), ['VND', 'USD', 'IDR', 'PHP', 'SGD']);
    eq(A.ss.sheets.Config.cell(12, 1).v, 'SGD');
    errRes(A.api('spd.listAdd', { list: 'Currency', value: 'sgd' }), 'CONFLICT');
    errRes(A.api('spd.listRemove', { list: 'Currency', value: 'USD' }), 'CONFLICT');
    errRes(A.api('spd.listAdd', { list: 'Stage', value: 'Tender' }), 'VALIDATION');
    errRes(A.api('spd.listAdd', { list: 'Unit', value: '=HACK()' }), 'VALIDATION');
    const rm = okRes(A.api('spd.listRemove', { list: 'Currency', value: 'SGD' }));
    eq(rm.lists.find(x => x.name === 'Currency').values.map(v => v.v), ['VND', 'USD', 'IDR', 'PHP']);
    eq(A.ss.sheets.Config.cell(12, 1).v, '');
    ok(okRes(A.api('activity.list', { table: 'Config' })).rows.length === 2, 'log');
  });

  t('[SPD] dòng giá tham chiếu khác vật tư / khác quy cách → cảnh báo (vẫn lưu); dòng hạng mục trùng → cảnh báo', () => {
    const A = makeContext();
    const r = okRes(A.api('record.save', { table: 'Project_Inputs_Bid', record: { project_id: 'PRJ-0001', material_id: 'MAT-0002', price_id: 'PRC-00001', specification: 'X', currency: 'VND', unit_price: 100 } }));
    ok(r.warnings.some(w => /thuộc vật tư MAT-0001/.test(w)), 'mat');
    const r2 = okRes(A.api('record.save', { table: 'Project_Inputs_Job', record: { project_id: 'PRJ-0001', material_id: 'MAT-0001', price_id: 'PRC-00001', specification: 'khác', currency: 'VND', unit_price: 100 } }));
    ok(r2.warnings.some(w => /Quy cách khác/.test(w)), 'spec');
    const d = okRes(A.api('record.save', { table: 'Project_Items', record: { project_id: 'PRJ-0001', item_id: 'ITM-01', stage: 'Bid', unit_sell: 1 } }));
    ok(d.warnings.some(w => /đã có dòng/.test(w)), 'dup line');
  });

  t('[SPD] dữ liệu thật R05 (gần như trống): spd.data / spd.lists / cảnh báo chạy, 6 thị trường, Admin ST-001', () => {
    const R = makeContext({ dataFile: 'data_real.json', noSeed: true, email: 'jackn.pmp@gmail.com' });
    const b = okRes(R.api('app.bootstrap'));
    eq(b.user.role, 'Admin'); eq(b.user.staffId, 'ST-001');
    const D = okRes(R.api('spd.data'));
    eq(D.markets.length, 6); eq(D.projects.length, 0);
    okRes(R.api('spd.lists')); okRes(R.api('notification.list', {}));
  });
};
