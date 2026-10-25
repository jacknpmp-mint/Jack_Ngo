// Ca kiểm thử nghiệp vụ riêng LSB Cost Input (chạy sau backend.test.js). Số liệu so với tính tay trên fixture.
// Fixture test/data.json = dữ liệu thật R03 (1 dòng ví dụ mỗi sheet): SUP-0001..0005, PORT-01/02, PRO-01, FX USD 2026-10-01 = 26000,
// MSP-00001 = SUP-0001 · SS400 / JIS G3101 / 10 / 1500 / 6000 · kg · 15500 VND · hiệu lực tới 2026-12-31.
module.exports = ({ t, eq, ok, okRes, errRes, makeContext }) => {
  const today = new Date().toISOString().slice(0, 10);
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const plate = { spec_grade: 'SS400', spec_standard: 'JIS G3101', spec_thickness_mm: 10, spec_width_mm: 1500, spec_length_mm: 6000, unit: 'kg', description: 'Thép tấm test' };
  const save = (A, table, rec) => okRes(A.api('record.save', { table, record: rec }));
  const cell = (A, sheet, r, c) => A.ss.sheets[sheet].grid[r - 1][c - 1];

  t('[Cost] bố cục: dòng 2 mã cột, dòng 3 nhãn giữ nguyên; bản ghi mới vào dòng trống đầu tiên từ dòng 4, giữ công thức', () => {
    const A = makeContext();
    const id = save(A, 'Suppliers', { supplier_name: 'NCC mới', supplier_type: 'Material supplier' }).record.supplier_id;
    eq(id, 'SUP-0006');
    eq(cell(A, 'Suppliers', 3, 1).v, 'Supplier ID *', 'dòng nhãn');
    eq(cell(A, 'Suppliers', 9, 1).v, 'SUP-0006', 'dòng 9 = dòng trống đầu tiên sau 5 NCC');
    const r = save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0006', effective_date: today, currency: 'VND', unit_price: 15000 }, plate)).record;
    eq(r.record_id, 'MSP-00002');
    ok(String(cell(A, 'Mat_SteelPlate', 5, 6).f).indexOf('Suppliers!') >= 0, 'công thức supplier_name ở dòng 5 vẫn còn');
    eq(okRes(A.api('record.peekId', { table: 'Ports' })).id, 'PORT-03');
    eq(okRes(A.api('record.peekId', { table: 'FX_Rates' })).id, 'FX-00002');
  });

  t('[Cost] tỷ giá: chặn trùng ngày + tiền tệ; cảnh báo tiền tệ = tiền gốc; Editor không sửa được tỷ giá', () => {
    const A = makeContext();
    const e = errRes(A.api('record.save', { table: 'FX_Rates', record: { effective_date: '2026-10-01', currency: 'USD', rate: 25900 } }), 'VALIDATION');
    ok(/FX-00001/.test(e.message), e.message);
    const w = save(A, 'FX_Rates', { effective_date: '2026-10-01', currency: 'VND', rate: 1 }).warnings;
    ok(w.some(x => /tiền gốc/.test(x)), w.join(' | '));
    errRes(makeContext({ email: 'editor@test.example' }).api('record.save', { table: 'FX_Rates', record: { effective_date: '2026-11-01', currency: 'USD', rate: 1 } }), 'FORBIDDEN');
  });

  t('[Cost] giá quy đổi: tỷ giá mới nhất ≤ ngày báo giá; thiếu tỷ giá → trống + cảnh báo khi lưu + Kiểm tra dữ liệu', () => {
    const A = makeContext();
    save(A, 'FX_Rates', { effective_date: '2026-07-01', currency: 'USD', rate: 25800 });
    const q1 = save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0002', effective_date: '2026-08-01', valid_until: '2026-08-31', currency: 'USD', unit_price: 0.6 }, plate)).record.record_id;
    const q2 = save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0002', effective_date: '2026-10-05', currency: 'USD', unit_price: 0.58 }, plate)).record.record_id;
    const w = save(A, 'Mat_Paint', { supplier_id: 'SUP-0001', effective_date: '2026-10-01', currency: 'IDR', unit_price: 50000, unit: 'liter', description: 'x' }).warnings;
    ok(w.some(x => /IDR/.test(x)), 'cảnh báo thiếu IDR: ' + w.join(' | '));
    const b = okRes(A.api('dashboard.get', {})).Cost_board_;
    const rows = Object.fromEntries(b.rows.Mat_SteelPlate.map(r => [r._id, r]));
    eq(rows[q1]._fx, 25800); eq(rows[q1]._base, Math.round(0.6 * 25800 * 1e4) / 1e4); eq(rows[q1]._st, 'expired');
    eq(rows[q2]._fx, 26000); eq(rows[q2]._base, Math.round(0.58 * 26000 * 1e4) / 1e4); eq(rows[q2]._st, 'open');
    eq(rows['MSP-00001']._fx, 1); eq(rows['MSP-00001']._base, 15500);
    const idr = b.rows.Mat_Paint.find(r => r.currency === 'IDR');
    eq(idr._fx, null); eq(idr._base, null);
    const chk = okRes(A.api('dashboard.get', {})).checks;
    ok(chk.some(c => c.table === 'Mat_Paint' && c.id === idr._id && /IDR/.test(c.message)), 'check IDR');
  });

  t('[Cost] giá tham chiếu: mỗi NCC lấy báo giá mới nhất, bỏ dòng sắp áp dụng / hết hạn; thấp nhất còn hiệu lực; chênh cao–thấp', () => {
    const A = makeContext();
    // SUP-0002: báo giá cũ rẻ (hết hạn) rồi báo giá mới 15800 → chỉ tính dòng mới
    save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0002', effective_date: '2026-06-01', valid_until: '2026-06-30', currency: 'VND', unit_price: 14000 }, plate));
    save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0002', effective_date: '2026-10-02', valid_until: '2026-12-31', currency: 'VND', unit_price: 15800 }, plate));
    // SUP-0003: USD 0.58 × 26000 = 15080 → rẻ nhất
    save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0003', effective_date: '2026-10-03', valid_until: '2026-12-31', currency: 'USD', unit_price: 0.58 }, plate));
    // SUP-0004: rẻ hơn nữa nhưng sắp áp dụng → bỏ
    save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0004', effective_date: addDays(today, 10), currency: 'VND', unit_price: 9000 }, plate));
    // khác độ dày → nhóm khác
    save(A, 'Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0002', effective_date: '2026-10-02', currency: 'VND', unit_price: 16000 }, plate, { spec_thickness_mm: 12 }));
    const b = okRes(A.api('dashboard.get', {})).Cost_board_;
    const items = b.items.Mat_SteelPlate;
    eq(items.length, 2, 'số nhóm');
    const it = items.find(i => i.key.indexOf('|10|') > 0);
    const byId = Object.fromEntries(b.rows.Mat_SteelPlate.map(r => [r._id, r]));
    eq(it.n, 5, 'số dòng của nhóm');
    eq(it.latest.length, 3, 'mỗi NCC 1 dòng mới nhất (SUP-0001/0002/0003; SUP-0004 sắp áp dụng)');
    eq(byId[it.best].supplier_id, 'SUP-0003'); eq(it.bestBase, 15080);
    eq(Math.round(it.spread * 10000) / 10000, Math.round((15800 / 15080 - 1) * 10000) / 10000);
  });

  t('[Cost] cảnh báo: báo giá mới nhất còn ≤ 14 ngày → warn; nhóm không còn NCC nào có giá → danger; báo giá cũ bị thay thế không báo', () => {
    const A = makeContext();
    const soon = save(A, 'Trans_Sea', { supplier_id: 'SUP-0003', pol: 'PORT-01', pod: 'PORT-02', cargo_type: "20' GP", rate_basis: 'per container', currency: 'USD',
      ocean_freight: 600, effective_date: '2026-10-01', valid_until: addDays(today, 5) }).record.record_id;
    const old = save(A, 'Mat_Insulation', { supplier_id: 'SUP-0001', effective_date: '2026-01-01', valid_until: addDays(today, 3), currency: 'VND', unit_price: 1, unit: 'm2',
      description: 'cũ', spec_material_type: 'Glass wool', spec_thickness_mm: 50, spec_density_kg_m3: 12, spec_facing: 'Aluminium foil', spec_roll_size: '1.2 m x 30 m' }).record.record_id;
    const dead = save(A, 'Mat_Accessories', { supplier_id: 'SUP-0001', effective_date: '2026-01-01', valid_until: '2026-03-31', currency: 'VND', unit_price: 5, unit: 'pc',
      description: 'z', spec_accessory_type: 'Z-only' }).record.record_id;
    const al = okRes(A.api('notification.list', {})).rows;
    ok(al.some(x => x.id === soon && x.level === 'warn' && /5/.test(x.title)), 'warn sắp hết hạn');
    ok(!al.some(x => x.id === old), 'dòng cũ (đã có báo giá mới hơn cùng NCC cùng mặt hàng) không báo');
    ok(al.some(x => x.id === dead && x.level === 'danger'), 'danger không còn giá hiệu lực');
    al.forEach(x => ok(x.link && x.link.route === 'entity', 'link'));
  });

  t('[Cost] mã lạ (FK mềm): vẫn lưu, cảnh báo, hiện ở Kiểm tra dữ liệu; phí địa phương thiếu số tiền và % → cảnh báo', () => {
    const A = makeContext();
    const r = save(A, 'Mat_Paint', { supplier_id: 'SUP-9999', effective_date: today, currency: 'VND', unit_price: 1, unit: 'liter', description: 'x' });
    ok(r.warnings.some(w => /SUP-9999/.test(w)), r.warnings.join(' | '));
    const chk = okRes(A.api('dashboard.get', {})).checks;
    ok(chk.some(c => c.id === r.record.record_id && c.column === 'supplier_id'), 'check soft FK');
    const w = save(A, 'Trans_Local_Charges', { supplier_id: 'SUP-0005', side: 'Origin', port: 'PORT-01', charge_type: 'THC', rate_basis: 'per container', currency: 'VND', effective_date: today }).warnings;
    ok(w.some(x => /số tiền hoặc tỷ lệ/.test(x)), w.join(' | '));
  });

  t('[Cost] danh sách chọn: đọc trực tiếp sheet Config; Admin sửa → app thấy ngay; bỏ giá trị đang dùng → cảnh báo; Currency phải giữ tiền gốc; Editor bị chặn', () => {
    const A = makeContext();
    const g = okRes(A.api('cost.lists.get'));
    eq(g.base, 'VND'); eq(g.lists.length, 13); eq(g.lists[0].name, 'Currency');
    const unit = g.lists.find(l => l.name === 'Unit');
    ok(unit.used.kg >= 1, 'kg đang dùng');
    let w = save(A, 'Mat_Paint', { supplier_id: 'SUP-0001', effective_date: today, currency: 'VND', unit_price: 1, unit: 'thùng', description: 'x' }).warnings;
    ok(w.some(x => /Unit/.test(x)), 'cảnh báo ngoài danh sách');
    const s = okRes(A.api('cost.lists.save', { name: 'Unit', values: unit.values.filter(v => v !== 'kg').concat(['thùng', ' thùng ', '']) }));
    ok(s.warnings.some(x => /"kg"/.test(x)), 'cảnh báo bỏ kg');
    ok(s.all.Unit.indexOf('thùng') >= 0 && s.all.Unit.indexOf('kg') < 0, 'all.Unit');
    eq(s.all.Unit.filter(v => v === 'thùng').length, 1, 'bỏ trùng');
    w = save(A, 'Mat_Paint', { supplier_id: 'SUP-0001', effective_date: today, currency: 'VND', unit_price: 1, unit: 'thùng', description: 'y' }).warnings;
    ok(!w.some(x => /Unit/.test(x)), 'hết cảnh báo sau khi thêm vào Config: ' + w.join(' | '));
    eq(okRes(A.api('app.bootstrap')).config.lists.Unit.indexOf('thùng') >= 0, true);
    errRes(A.api('cost.lists.save', { name: 'Currency', values: ['USD'] }), 'VALIDATION');
    errRes(makeContext({ email: 'editor@test.example' }).api('cost.lists.save', { name: 'Unit', values: ['kg'] }), 'FORBIDDEN');
    ok(okRes(A.api('activity.list', { id: 'Unit' })).rows.length === 1, 'nhật ký');
  });

  t('[Cost] 360°: NCC (dòng giá mọi bảng + số nhóm đang rẻ nhất), Cảng (tuyến đi/đến, phí, nội địa), Công đoạn (tự làm, thuê ngoài, năng lực)', () => {
    const A = makeContext();
    const s = okRes(A.api('entity.get360', { table: 'Suppliers', id: 'SUP-0001' })).extra.cost;
    eq(s.rows.length, 12, '12 dòng vật tư ví dụ của SUP-0001');
    eq(s.wins, 12); eq(s.base, 'VND');
    const p = okRes(A.api('entity.get360', { table: 'Ports', id: 'PORT-01' })).extra.cost;
    eq([p.seaOut.length, p.seaIn.length, p.local.length, p.inland.length], [1, 0, 1, 1]);
    const p2 = okRes(A.api('entity.get360', { table: 'Ports', id: 'PORT-02' })).extra.cost;
    eq([p2.seaOut.length, p2.seaIn.length, p2.inland.length], [0, 1, 1]);
    const pr = okRes(A.api('entity.get360', { table: 'Processes', id: 'PRO-01' })).extra.cost;
    eq([pr.inhouse.length, pr.sub.length, pr.capacity.length], [1, 1, 1]);
    eq(pr.inhouse[0]._amt, 1000, '400 + 250 + 200 + 150');
    const sea = okRes(A.api('dashboard.get', {})).Cost_board_.rows.Trans_Sea[0];
    eq(sea._amt, 1350, '1200 + 150'); eq(sea._base, 1350 * 26000);
  });

  if (require('fs').existsSync(require('path').join(__dirname, 'data_real.json'))) t('[Cost] dữ liệu thật: tiền gốc VND, 12 nhóm vật tư, mỗi nhóm 1 mặt hàng có giá; dòng ví dụ được báo; Admin thật jackn.pmp vào được', () => {
    const R = makeContext({ dataFile: 'data_real.json', email: 'jackn.pmp@gmail.com', noSeed: true });
    const d = okRes(R.api('dashboard.get', {}));
    const b = d.Cost_board_;
    eq(b.base, 'VND'); eq(b.mat.length, 12);
    b.mat.forEach(tb => { eq(b.items[tb].length, 1, tb); ok(b.items[tb][0].best, tb + ' best'); });
    ok(d.checks.filter(c => /ví dụ/.test(c.message)).length >= 20, 'dòng ví dụ');
    eq(okRes(R.api('app.bootstrap')).user.role, 'Admin');
  });
};
