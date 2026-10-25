// Kiểm thử backend LSB CRM · Project v2.5 — lược đồ v4.3_Project, 11 bảng (mô phỏng Apps Script).
// test/data.json: fixture mẫu cố định (11 sheet, cấu trúc v4.3_Project); test/data_real.json: dữ liệu thật file v4.3_Project.
// Module Báo giá/Đấu thầu không dùng ở bản này (bảng không có trong Database) — bộ test của module nằm ở gói v2.2.
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

const year = new Date().getFullYear();

/* ---------------- Khởi động & phân quyền ---------------- */
t('nạp file theo thứ tự ngược vẫn chạy (không phụ thuộc load order)', () => {
  const A = makeContext({ reverse: true });
  okRes(A.api('app.bootstrap'));
});

t('bootstrap: user Admin, schema 11 bảng / 141 cột (chỉ bảng có trong Database), lookups, tạo sheet nhật ký', () => {
  const A = makeContext();
  const d = okRes(A.api('app.bootstrap'));
  eq(d.user.role, 'Admin'); eq(d.user.staffId, 'ST-003');
  eq(Object.keys(d.config.tables), ['LSB_Lead', 'LSB_Customer', 'LSB_project', 'LSB_Project_task', 'LSB_shipment',
    'LSB_Project_handover_lesson', 'LSB_payment_plan', 'LSB_paid', 'LSB_cost', 'LSB_Staff', 'LSB_Task']);
  eq(Object.values(d.config.tables).reduce((s, t) => s + t.columns.length, 0), 141);
  eq(d.config.app.schema, 'v4.3_Project');
  const qc = d.config.tables.LSB_project.columns.find(c => c.name === 'Quotation_LSB-Code');
  eq([qc.key, qc.unique, qc.type], [undefined, true, 'string']);
  const calc = [].concat(...Object.values(d.config.tables).map(t => t.columns.filter(c => c.calc).map(c => c.name)));
  eq(calc, ['Contract_VND', 'ETA_plan', 'ETA_actual', 'Payment_VND', 'Paid_VND', 'Cost_VND']);
  ok(d.config.tables.LSB_project.columns.some(c => c.name === 'URL_Project_data' && c.format === 'url'), 'URL_Project_data');
  eq(Object.keys(d.lookups).sort(), ['LSB_Customer', 'LSB_Lead', 'LSB_Staff', 'LSB_Task', 'LSB_payment_plan', 'LSB_project', 'LSB_shipment']);
  ok(d.lookups.LSB_project.some(x => x.id === 'PJ-2026-001'));
  ok(A.ss.getSheetByName('LSB_Activity_log'), 'log sheet created');
  eq(d.caps, { read: true, write: true, del: true, catalog: true, activity: true });
});

t('email không có trong LSB_Staff → AUTH', () => {
  const A = makeContext({ email: 'stranger@gmail.com' });
  errRes(A.api('app.bootstrap'), 'AUTH');
});
t('nhân sự Active = N → AUTH', () => { errRes(makeContext({ email: 'off@lsb.example' }).api('app.bootstrap'), 'AUTH'); });
t('email trống (chưa đăng nhập) → AUTH', () => { errRes(makeContext({ email: '' }).api('app.bootstrap'), 'AUTH'); });
t('email khác hoa/thường vẫn nhận', () => { eq(okRes(makeContext({ email: 'AN.Nguyen@LSB.example' }).api('app.bootstrap')).user.staffId, 'ST-001'); });

t('Viewer: xem được, không thêm/sửa, không xem nhật ký', () => {
  const A = makeContext({ email: 'viewer@lsb.example' });
  okRes(A.api('project.list'));
  errRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Category: 'Other' } }), 'FORBIDDEN');
  errRes(A.api('activity.list'), 'FORBIDDEN');
});
t('Editor: thêm được, không xóa, không sửa danh mục Staff/Task', () => {
  const A = makeContext({ email: 'an.nguyen@lsb.example' });
  const r = okRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Category: 'Other', Cost_USD: 10 } }));
  errRes(A.api('record.delete', { table: 'LSB_cost', id: r.record.Cost_id }), 'FORBIDDEN');
  errRes(A.api('record.save', { table: 'LSB_Task', record: { Phase: 'Execution', Task_duty: 'x' } }), 'FORBIDDEN');
});
t('API không tồn tại → NOT_FOUND', () => { errRes(makeContext().api('abc.xyz'), 'NOT_FOUND'); });

/* ---------------- Đọc dữ liệu ---------------- */
t('project.list tính KPI từ dữ liệu gốc (đã thu = SUM paid)', () => {
  const d = okRes(makeContext().api('project.list', {}));
  const p = d.rows.find(r => r.Project_id === 'PJ-2026-001');
  eq(p.Customer_name, 'Pacific Cold Storage (mẫu)');
  eq(p.PM_name, 'Trần Thị Bình');
  eq(p.Collected_USD, 904000);
  eq(p.Contract_USD, 1680000);
  eq(p.Year, 2026);
});
t('project.list lọc theo năm / trạng thái / từ khóa', () => {
  const A = makeContext();
  eq(okRes(A.api('project.list', { year: 2025 })).total, 0);
  eq(okRes(A.api('project.list', { status: 'Shipping' })).total, 1);
  eq(okRes(A.api('project.list', { q: 'brisbane' })).total, 1);
});
t('project.get360: đủ phần, KPI khớp, trạng thái thanh toán tính lại', () => {
  const d = okRes(makeContext().api('project.get360', { id: 'PJ-2026-001' }));
  eq(d.customer.Customer_id, 'CU-001'); eq(d.lead.Lead_id, 'LD-2026-001');
  eq(d.paymentPlans.length, 2); eq(d.shipments.length, 2);
  eq(d.kpi.collectedUSD, 904000);
  eq(d.kpi.outstandingUSD, 1680000 - 904000);
  eq(d.paymentPlans.find(p => p.PaymentPlan_id === 'PP-2026-001').Status_calc, 'Paid');
  eq(d.paymentPlans.find(p => p.PaymentPlan_id === 'PP-2026-002').Status_calc, 'Overdue');
  eq(d.kpi.canClose, true);
  eq([d.quotation.linked, d.quotation.code], [false, 'LSB-26-PCS']); ok(/file Bidding/.test(d.quotation.note), 'mã nội bộ, tham chiếu file Bidding');
  ok(d.tasks[0].Task_duty, 'Task_duty tra từ LSB_Task');
});
t('project.get360 mã không có → NOT_FOUND', () => { errRes(makeContext().api('project.get360', { id: 'PJ-1999-001' }), 'NOT_FOUND'); });
t('dashboard.get năm 2026: số liệu theo quý', () => {
  const d = okRes(makeContext().api('dashboard.get', { year: 2026 }));
  eq(d.metrics.leads.Q1, 1); eq(d.metrics.contractUSD.Q2, 1680000);
  eq(d.metrics.collectedUSD.total, 904000);
  ok(d.years.includes(2026));
  ok(d.snapshot.receivableUSD > 0);
});
t('v2.6 dashboard.get → board: đợt có Collected/Balance/Pay_status, khách có quốc gia + ngành từ Lead, lô có mốc ngày', () => {
  const b = okRes(makeContext().api('dashboard.get', { year: 2026 })).board;
  eq(b.fx, 26000); ok(/^\d{4}-\d{2}-\d{2}$/.test(b.today), 'today');
  eq(b.customers[0], { id: 'CU-001', lead: 'LD-2026-001', name: 'Pacific Cold Storage (mẫu)', nation: 'Australia', seg: 'Cold storage' });
  const pp = b.plans.find(x => x.id === 'PP-2026-002');
  eq([pp.sh, pp.usd, pp.col, pp.bal, pp.st], ['SH-2026-001', 672000, 400000, 272000, 'Overdue']);
  const s1 = b.shipments.find(x => x.id === 'SH-2026-001');
  eq([s1.sFab, s1.cFab, s1.etdA, s1.etaA], ['2026-05-05', '2026-06-20', '2026-06-28', '2026-07-18']);
  eq(b.projects[0].usd, 1680000); eq(b.paid.length, 2); eq(b.costs.length, 1);
});
t('customer.list + lead360', () => {
  const A = makeContext();
  const l = okRes(A.api('customer.list', {}));
  eq(l.rows[0].Customer_id, 'CU-001'); eq(l.rows[0].Projects, 1);
  const d = okRes(A.api('customer.lead360', { id: 'LD-2026-001' }));
  eq(d.customer.Customer_id, 'CU-001'); eq(d.projects.length, 1); eq(d.kpi.contractUSD, 1680000);
});
t('notification.list: có cảnh báo thanh toán quá hạn PP-2026-002', () => {
  const d = okRes(makeContext().api('notification.list', {}));
  ok(d.rows.some(x => x.type === 'payment' && x.id === 'PP-2026-002' && x.level === 'danger'));
});
t('bidding/quotation status: module tắt', () => {
  const A = makeContext();
  eq(okRes(A.api('bidding.status')).enabled, false);
  eq(okRes(A.api('quotation.status')).enabled, false);
});
t('Quotation_LSB-Code: nhập tay tự do (không cảnh báo báo giá), không trùng giữa các dự án', () => {
  const A = makeContext();
  const r = okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: 'PJ-2026-001', 'Quotation_LSB-Code': '25B561' } }));
  eq(r.record['Quotation_LSB-Code'], '25B561');
  ok(!r.warnings.some(w => /báo giá/i.test(w)), JSON.stringify(r.warnings));
  const e = errRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Project_name: 'Dup', Status: 'Kick-off', 'Quotation_LSB-Code': '25b561' } }), 'VALIDATION');
  ok(e.details.some(x => x.field === 'Quotation_LSB-Code'));
});

/* ---------------- Ghi dữ liệu ---------------- */
t('thêm lead: sinh ID LD-<năm>-NNN, dùng lại dòng trống, giữ công thức Year/Quarter', () => {
  const A = makeContext();
  const r = okRes(A.api('record.save', { table: 'LSB_Lead', record: { Company_name: 'Test Co', Lead_status: 'New', Nation: 'Japan', Created_day: '2026-09-01' } }));
  eq(r.record.Lead_id, 'LD-' + year + '-' + (year === 2026 ? '002' : '001'));
  const sh = A.ss.getSheetByName('LSB_Lead');
  eq(sh.cell(3, 1).v, r.record.Lead_id, 'ghi vào dòng 3 (dòng trống đầu tiên)');
  ok(sh.cell(3, 13).f.startsWith('=IF(J3'), 'công thức Year còn nguyên');
  ok(Object.prototype.toString.call(sh.cell(3, 10).v) === '[object Date]', 'ngày ghi dạng Date');
  eq(r.record.Owner_id, 'ST-003', 'Owner mặc định = người tạo');
});
t('không ghi đè cột AUTO dù client gửi', () => {
  const A = makeContext();
  okRes(A.api('record.save', { table: 'LSB_Lead', record: { Lead_id: 'LD-2026-001', Year: 1999, Quarter: 'Q9', Contact_title: 'CEO' } }));
  const sh = A.ss.getSheetByName('LSB_Lead');
  ok(sh.cell(2, 13).f.startsWith('=IF(J2'), 'giữ công thức');
  eq(sh.cell(2, 7).v, 'CEO');
});
t('sửa: chỉ đổi cột gửi lên, cột khác giữ nguyên', () => {
  const A = makeContext();
  okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: 'PJ-2026-001', Incoterm: 'FOB' } }));
  const p = okRes(A.api('record.get', { table: 'LSB_project', id: 'PJ-2026-001' }));
  eq(p.Incoterm, 'FOB'); eq(p.Contract_USD, 1680000); eq(p.Contract_day, '2026-04-10');
});
t('bắt buộc / sai kiểu / FK không tồn tại → VALIDATION kèm cột lỗi', () => {
  const A = makeContext();
  let e = errRes(A.api('record.save', { table: 'LSB_project', record: { Project_name: 'X' } }), 'VALIDATION');
  ok(e.details.some(x => x.field === 'Customer_id')); ok(!e.details.some(x => x.field === 'Status'), 'v2.4: Status không bắt buộc');
  e = errRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-999', Project_name: 'X', Status: 'Kick-off', Contract_USD: 'abc', Contract_day: '31/02/2026' } }), 'VALIDATION');
  ok(e.details.some(x => x.field === 'Customer_id' && /không có/.test(x.message)));
  ok(e.details.some(x => x.field === 'Contract_USD'));
  ok(e.details.some(x => x.field === 'Contract_day'));
});
t('định dạng ngày dd/mm/yyyy được chấp nhận; % ngoài khoảng bị chặn', () => {
  const A = makeContext();
  const r = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Project_name: 'P2', Status: 'Kick-off', Contract_day: '05/10/2026', Grossmargin_EST: 0.2 } }));
  eq(r.record.Contract_day, '2026-10-05');
  errRes(A.api('record.save', { table: 'LSB_payment_plan', record: { Project_id: 'PJ-2026-001', Payment_code: 'Final', Payment_pct: 1.5 } }), 'VALIDATION');
});
t('ngày kết thúc trước ngày bắt đầu → lỗi', () => {
  const e = errRes(makeContext().api('record.save', { table: 'LSB_Project_task', record: { Project_id: 'PJ-2026-001', Task_id: 'TK-003', Start_day: '2026-10-10', Due_day: '2026-10-01' } }), 'VALIDATION');
  ok(e.details.some(x => x.field === 'Due_day'));
});
t('giá trị ngoài danh mục Lists → cảnh báo, vẫn lưu', () => {
  const r = okRes(makeContext().api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Category: 'Crane rental' } }));
  ok(r.warnings.some(w => /Crane rental/.test(w)));
});
t('1 : 0..1 — một lead chỉ 1 khách hàng', () => {
  const e = errRes(makeContext().api('record.save', { table: 'LSB_Customer', record: { Lead_id: 'LD-2026-001' } }), 'VALIDATION');
  ok(e.details.some(x => x.field === 'Lead_id' && /CU-001/.test(x.message)));
});
t('tạo khách hàng từ lead mới → CU-002, Lead_status = Converted, lấy Nation/owner từ lead', () => {
  const A = makeContext();
  const l = okRes(A.api('record.save', { table: 'LSB_Lead', record: { Company_name: 'Osaka Steel', Lead_status: 'Qualified', Nation: 'Japan', Owner_id: 'ST-001' } })).record;
  const r = okRes(A.api('record.save', { table: 'LSB_Customer', record: { Lead_id: l.Lead_id } }));
  eq(r.record.Customer_id, 'CU-002'); eq(r.record.Nation, 'Japan'); eq(r.record.Account_owner_id, 'ST-001');
  eq(okRes(A.api('record.get', { table: 'LSB_Lead', id: l.Lead_id })).Lead_status, 'Converted');
});
t('quy tắc 8: không Closed khi chưa có bài học; Closed được khi đã có', () => {
  const A = makeContext();
  const p = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Project_name: 'P3', Status: 'Kick-off' } })).record;
  errRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: p.Project_id, Status: 'Closed' } }), 'VALIDATION');
  okRes(A.api('record.save', { table: 'LSB_Project_handover_lesson', record: { Project_id: p.Project_id, Handover_day: '2026-09-01', Issue_description: 'x' } }));
  eq(okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: p.Project_id, Status: 'Closed' } })).record.Status, 'Closed');
});
t('quy tắc 5 & 8: lô hàng phải cùng dự án (payment_plan, lesson)', () => {
  const A = makeContext();
  const p = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Project_name: 'P4', Status: 'Kick-off' } })).record;
  errRes(A.api('record.save', { table: 'LSB_payment_plan', record: { Project_id: p.Project_id, Shipping_id: 'SH-2026-001', Payment_code: 'Final' } }), 'VALIDATION');
  errRes(A.api('record.save', { table: 'LSB_Project_handover_lesson', record: { Project_id: p.Project_id, Shipping_id: 'SH-2026-001', Handover_day: '2026-09-01' } }), 'VALIDATION');
});
t('payment_plan: tự tính USD theo %, cảnh báo tổng % > 100%', () => {
  const r = okRes(makeContext().api('record.save', { table: 'LSB_payment_plan', record: { Project_id: 'PJ-2026-001', Payment_code: 'Final', Payment_pct: 0.4 } }));
  eq(r.record.Payment_USD, 672000);
  ok(r.warnings.some(w => /110%/.test(w)), JSON.stringify(r.warnings));
});
t('paid vượt số tiền đợt → cảnh báo', () => {
  const r = okRes(makeContext().api('record.save', { table: 'LSB_paid', record: { PaymentPlan_id: 'PP-2026-002', Paid_USD: 300000, Payment_day: '2026-09-20' } }));
  ok(r.warnings.some(w => /vượt/.test(w)));
});
t('project_task: Due_day tự tính từ Std_duration, Done → Done_day', () => {
  const A = makeContext();
  const r = okRes(A.api('record.save', { table: 'LSB_Project_task', record: { Project_id: 'PJ-2026-001', Task_id: 'TK-002', Start_day: '2026-09-01' } }));
  eq(r.record.Due_day, '2026-09-08'); eq(r.record.Status, 'Not started');
  const r2 = okRes(A.api('record.save', { table: 'LSB_Project_task', record: { Project_task_id: r.record.Project_task_id, Status: 'Done' } }));
  ok(r2.record.Done_day, 'Done_day set');
});
t('shipment: Shipment_no tự tăng trong dự án', () => {
  const r = okRes(makeContext().api('record.save', { table: 'LSB_shipment', record: { Project_id: 'PJ-2026-001', Quantity_ton: 50 } }));
  eq(r.record.Shipment_no, 3);
});
t('chặn chèn công thức (=...) vào ô văn bản', () => {
  const A = makeContext();
  okRes(A.api('record.save', { table: 'LSB_Lead', record: { Lead_id: 'LD-2026-001', Contact_title: '=IMPORTXML("http://x")' } }));
  const c = A.ss.getSheetByName('LSB_Lead').cell(2, 7);
  eq(c.f, ''); eq(c.v, '=IMPORTXML("http://x")');
});

/* ---------------- Xóa, ID, mở rộng dòng ---------------- */
t('xóa bị chặn khi còn bản ghi con; xóa được bản ghi lá; dòng giữ công thức', () => {
  const A = makeContext();
  const e = errRes(A.api('record.delete', { table: 'LSB_project', id: 'PJ-2026-001' }), 'CONFLICT');
  ok(/Đầu việc dự án|Lô hàng/.test(e.message));
  okRes(A.api('record.delete', { table: 'LSB_paid', id: 'PD-2026-002' }));
  errRes(A.api('record.get', { table: 'LSB_paid', id: 'PD-2026-002' }), 'NOT_FOUND');
  ok(A.ss.getSheetByName('LSB_paid').cell(3, 8).f, 'công thức Year còn ở dòng đã xóa');
});
t('số ID đã cấp không dùng lại sau khi xóa', () => {
  const A = makeContext();
  const a = okRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Category: 'Other' } })).record.Cost_id;
  okRes(A.api('record.delete', { table: 'LSB_cost', id: a }));
  const b = okRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Category: 'Other' } })).record.Cost_id;
  ok(a !== b, a + ' vs ' + b);
});
t('hết 300 dòng dựng sẵn → tự thêm dòng + chép công thức', () => {
  const A = makeContext();
  const sh = A.ss.getSheetByName('LSB_paid');
  for (let r = 4; r <= 301; r++) sh.cell(r, 1, true).v = 'PD-2000-' + r;   // lấp đầy
  const r = okRes(A.api('record.save', { table: 'LSB_paid', record: { PaymentPlan_id: 'PP-2026-001', Paid_USD: 1, Payment_day: '2026-09-01' } }));
  eq(sh.cell(302, 1).v, r.record.Paid_id);
  ok(sh.cell(302, 8).f, 'công thức Year được chép');
});
t('Staff: không bỏ được Admin cuối cùng; không tự xóa mình', () => {
  const A = makeContext();
  errRes(A.api('record.save', { table: 'LSB_Staff', record: { Staff_id: 'ST-003', Access_level: 'Editor' } }), 'VALIDATION');
  errRes(A.api('record.delete', { table: 'LSB_Staff', id: 'ST-003' }), 'CONFLICT');
  errRes(A.api('record.save', { table: 'LSB_Staff', record: { Full_name: 'Dup', Email: 'AN.NGUYEN@lsb.example', Access_level: 'Viewer', Active: 'Y' } }), 'VALIDATION');
});


/* ---------------- v2.3 · chỉ Project ---------------- */
t('module thầu tắt (bảng không có trong Database) → API thầu trả MODULE_DISABLED, bật cờ cũng không chạy; Lead 360 vẫn chạy', () => {
  const A = makeContext();
  eq(okRes(A.api('app.bootstrap')).config.app.modules, { BIDDING: false, QUOTATION: false });
  require('vm').runInContext('APP.MODULES = { BIDDING: true, QUOTATION: true };', A.ctx);
  eq(okRes(A.api('app.bootstrap')).config.app.modules, { BIDDING: false, QUOTATION: false }, 'thiếu bảng → vẫn tắt');
  errRes(A.api('quotation.list', {}), 'MODULE_DISABLED');
  errRes(A.api('bidding.tasks', {}), 'MODULE_DISABLED');
  const d = okRes(A.api('customer.lead360', { id: 'LD-2026-001' }));
  eq(d.quotations.length, 0); okRes(A.api('dashboard.get', { year: 2026 })); okRes(A.api('notification.list', {}));
});


/* ---------------- v2.2 · lược đồ v4.3 ---------------- */
t('cột calc: VND = USD × 26000, ETA = ETD + 14; tính lại khi đổi nguồn, giữ giá trị sửa tay', () => {
  const A = makeContext();
  const q = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Project_name: 'C1', Status: 'Kick-off', Contract_USD: 100 } })).record;
  eq(q.Contract_VND, 2600000);
  eq(okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: q.Project_id, Contract_USD: 200 } })).record.Contract_VND, 5200000, 'tính lại');
  okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: q.Project_id, Contract_VND: 5000000 } }));
  eq(okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: q.Project_id, Contract_USD: 300 } })).record.Contract_VND, 5000000, 'giữ giá trị sửa tay');
  const s = okRes(A.api('record.save', { table: 'LSB_shipment', record: { Project_id: 'PJ-2026-001', ETD_plan: '2026-10-01', ETD_actual: '2026-10-03' } })).record;
  eq([s.ETA_plan, s.ETA_actual], ['2026-10-15', '2026-10-17']);
  const p = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Project_name: 'C2', Status: 'Kick-off', Contract_USD: 1000 } })).record;
  eq(p.Contract_VND, 26000000);
});

/* ---------------- Nhật ký ---------------- */
t('nhật ký: ghi Create/Update/Delete với danh sách cột đổi', () => {
  const A = makeContext();
  okRes(A.api('app.bootstrap'));
  const c = okRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Category: 'Other', Cost_USD: 5 } })).record;
  okRes(A.api('record.save', { table: 'LSB_cost', record: { Cost_id: c.Cost_id, Cost_USD: 7 } }));
  okRes(A.api('record.save', { table: 'LSB_cost', record: { Cost_id: c.Cost_id, Cost_USD: 7 } })); // không đổi → không ghi
  okRes(A.api('record.delete', { table: 'LSB_cost', id: c.Cost_id }));
  const log = okRes(A.api('activity.list', { id: c.Cost_id }));
  eq(log.rows.map(r => r.action), ['Delete', 'Update', 'Create']);
  eq(log.rows[1].fields, 'Cost_USD, Cost_VND'); eq(log.rows[1].detail.Cost_USD, [5, 7]); eq(log.rows[1].detail.Cost_VND, [130000, 182000]);
  eq(log.rows[0].email, 'admin@lsb.example');
  ok(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(log.rows[0].time), 'giữ giờ: ' + log.rows[0].time);
  eq(log.rows[0].recordId, c.Cost_id, 'Record_id là text');
});
t('nhật ký tự động khi Lead → Converted; 360 hiển thị nhật ký', () => {
  const A = makeContext();
  const l = okRes(A.api('record.save', { table: 'LSB_Lead', record: { Company_name: 'Z', Lead_status: 'New' } })).record;
  okRes(A.api('record.save', { table: 'LSB_Customer', record: { Lead_id: l.Lead_id } }));
  const d = okRes(A.api('customer.lead360', { id: l.Lead_id }));
  ok(d.activity.some(a => a.detail && a.detail._note), 'có ghi chú tự động');
  okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: 'PJ-2026-001', Incoterm: 'DAP' } }));
  ok(okRes(A.api('project.get360', { id: 'PJ-2026-001' })).activity.length >= 1);
});
t('Kiểm tra cấu trúc: phát hiện thiếu cột / cột lạ / #REF!', () => {
  const A = makeContext();
  eq(okRes(A.api('structure.check')).ok, true);
  const sh = A.ss.getSheetByName('LSB_cost');
  sh.cell(1, 4).v = 'Supplier';
  sh.cell(2, 10).f = '=IF(#REF!="","",YEAR(#REF!))';
  const r = okRes(A.api('structure.check'));
  eq(r.ok, false);
  ok(r.issues.some(i => /Thiếu cột Vendor/.test(i.message)));
  ok(r.issues.some(i => /Supplier/.test(i.message)));
  ok(r.issues.some(i => /#REF!/.test(i.message)));
});
t('không có lỗi INTERNAL/console.error trong toàn bộ lượt chạy', () => {
  const A = makeContext();
  ['app.bootstrap', 'dashboard.get', 'notification.list', 'project.list', 'customer.list', 'activity.list', 'lookups.get', 'user.me',
   'bidding.status', 'quotation.status', 'structure.check'].forEach(a => okRes(A.api(a, {})));
  ['quotation.list', 'quotation.get360', 'bidding.tasks'].forEach(a => errRes(A.api(a, {}), 'MODULE_DISABLED'));
  eq(A.state.logs.filter(l => l[0] === 'error').length, 0);
});


/* ---------------- v2.4: bắt buộc chỉ PK + FK, mã dự kiến, tự điền, cờ Thiếu dữ liệu ---------------- */
t('v2.4: bảng nghiệp vụ chỉ bắt buộc FK quan hệ; danh mục giữ bắt buộc; cột từng bắt buộc → need', () => {
  const d = okRes(makeContext().api('app.bootstrap'));
  const req = {}, need = {};
  Object.entries(d.config.tables).forEach(([t, def]) => {
    req[t] = def.columns.filter(c => c.required).map(c => c.name);
    need[t] = def.columns.filter(c => c.need).map(c => c.name);
  });
  eq(req.LSB_Lead, []); eq(req.LSB_Customer, ['Lead_id']); eq(req.LSB_project, ['Customer_id']);
  eq(req.LSB_Project_task, ['Project_id', 'Task_id']); eq(req.LSB_paid, ['PaymentPlan_id']); eq(req.LSB_cost, ['Project_id']);
  eq(req.LSB_Staff, ['Full_name', 'Email', 'Access_level', 'Active']); eq(req.LSB_Task, ['Phase', 'Task_duty']);
  eq(need.LSB_project, ['Project_name', 'Status']); eq(need.LSB_Project_handover_lesson, ['Handover_day']);
  eq(need.LSB_Staff, []);
});
t('v2.4: lưu chỉ với FK → được; mặc định Status/Lead_status/Cost_status; vẫn chặn sai kiểu, FK sai, unique, ngày ngược', () => {
  const A = makeContext();
  const p = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001' } })).record;
  eq([p.Status, p.Project_name], ['Kick-off', '']);
  eq(okRes(A.api('record.save', { table: 'LSB_Lead', record: {} })).record.Lead_status, 'New');
  eq(okRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: p.Project_id } })).record.Cost_status, 'Planned');
  okRes(A.api('record.save', { table: 'LSB_Project_handover_lesson', record: { Project_id: p.Project_id } }));
  okRes(A.api('record.save', { table: 'LSB_paid', record: { PaymentPlan_id: 'PP-2026-001' } }));
  errRes(A.api('record.save', { table: 'LSB_cost', record: {} }), 'VALIDATION');
  errRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2099-999' } }), 'VALIDATION');
  errRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: p.Project_id, Cost_USD: 'abc' } }), 'VALIDATION');
  errRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', 'Quotation_LSB-Code': 'lsb-26-pcs' } }), 'VALIDATION');
  errRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Contract_day: '2026-05-01', Kickoff_day: '2026-04-01' } }), 'VALIDATION');
  errRes(A.api('record.save', { table: 'LSB_Staff', record: { Full_name: 'No mail', Access_level: 'Viewer', Active: 'Y' } }), 'VALIDATION');
  // sửa bản ghi cũ: xóa trắng cột từng bắt buộc → vẫn lưu, không tự điền lại
  eq(okRes(A.api('record.save', { table: 'LSB_project', record: { Project_id: p.Project_id, Status: '' } })).record.Status, '');
});
t('v2.4: record.peekId không cấp số; mã khi Lưu = mã dự kiến; 2 người cùng lúc → mã sau khác', () => {
  const A = makeContext();
  const k = 'SEQ_PJ-' + year + '-';
  const before = A.props[k];
  const a = okRes(A.api('record.peekId', { table: 'LSB_project' })).id;
  eq(okRes(A.api('record.peekId', { table: 'LSB_project' })).id, a, 'xem lại vẫn cùng mã');
  eq(A.props[k], before, 'không ghi ScriptProperties');
  const s1 = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001' } })).record.Project_id;
  eq(s1, a);
  const s2 = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001' } })).record.Project_id;
  ok(s2 !== a, 'người thứ 2 nhận mã kế tiếp');
  eq(okRes(A.api('record.peekId', { table: 'LSB_Staff' })).id, 'ST-006');
  errRes(makeContext({ email: 'viewer@lsb.example' }).api('record.peekId', { table: 'LSB_project' }), 'FORBIDDEN');
  errRes(A.api('record.peekId', { table: 'LSB_Nope' }), 'NOT_FOUND');
});
t('v2.4: record.related trả bản ghi cha + lô kế tiếp + số còn phải thu', () => {
  const A = makeContext();
  const pj = okRes(A.api('record.related', { table: 'LSB_project', id: 'PJ-2026-001' }));
  eq([pj.Contract_USD, pj.Next_shipment_no], [1680000, 3]);
  const pp = okRes(A.api('record.related', { table: 'LSB_payment_plan', id: 'PP-2026-002' }));
  eq([pp.Collected_calc, pp.Balance_calc], [400000, 272000]);
  eq(okRes(A.api('record.related', { table: 'LSB_Lead', id: 'LD-2026-001' })).Lead_id, 'LD-2026-001');
  eq(okRes(A.api('record.related', { table: 'LSB_project', id: 'PJ-2099-999' })), null);
});
t('v2.4: VND tự tính = USD × 26000 cho payment_plan (kể cả USD tính từ %), paid, cost; giữ giá trị nhập tay', () => {
  const A = makeContext();
  const pp = okRes(A.api('record.save', { table: 'LSB_payment_plan', record: { Project_id: 'PJ-2026-001', Payment_pct: 0.1 } })).record;
  eq([pp.Payment_USD, pp.Payment_VND], [168000, 168000 * 26000]);
  eq(okRes(A.api('record.save', { table: 'LSB_paid', record: { PaymentPlan_id: pp.PaymentPlan_id, Paid_USD: 100 } })).record.Paid_VND, 2600000);
  eq(okRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Cost_USD: 10, Cost_VND: 255000 } })).record.Cost_VND, 255000);
});
t('v2.4: cờ Thiếu dữ liệu trong danh sách dự án / lead + lọc missing', () => {
  const A = makeContext();
  const p = okRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001' } })).record;
  const all = okRes(A.api('project.list', {}));
  eq(all.rows.find(r => r.Project_id === p.Project_id).Missing, ['Project_name']);
  eq(all.rows.find(r => r.Project_id === 'PJ-2026-001').Missing, []);
  eq(okRes(A.api('project.list', { missing: true })).rows.map(r => r.Project_id), [p.Project_id]);
  const l = okRes(A.api('record.save', { table: 'LSB_Lead', record: { Nation: 'Japan' } })).record;
  const cl = okRes(A.api('customer.list', { missing: true }));
  eq(cl.rows.map(r => r.Lead_id), [l.Lead_id]); eq(cl.rows[0].Missing, ['Company_name']);
});

/* ---------------- v2.5: song ngữ VN / EN ---------------- */
const VI_RE = /[à-ỹđĐ]/i;
t('v2.5: mặc định (không gửi lang) vẫn tiếng Việt; lang=en → lỗi / cảnh báo / thông báo tiếng Anh', () => {
  const A = makeContext();
  let e = errRes(A.api('record.save', { table: 'LSB_cost', record: {} }), 'VALIDATION');
  eq(e.details[0].message, 'bắt buộc nhập');
  e = errRes(A.api('record.save', { table: 'LSB_cost', record: {} }, 'en'), 'VALIDATION');
  eq(e.details[0], { field: 'Project_id', message: 'required' });
  e = errRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', Status: 'Closed' } }, 'en'), 'VALIDATION');
  eq(e.message, 'Status: a new project cannot be Closed');
  const w = okRes(A.api('record.save', { table: 'LSB_cost', record: { Project_id: 'PJ-2026-001', Category: 'Crane', Cost_USD: 1 } }, 'en')).warnings;
  ok(w.length && w.every(x => !VI_RE.test(x)), JSON.stringify(w));
  eq(errRes(makeContext({ email: 'stranger@gmail.com' }).api('app.bootstrap', {}, 'en'), 'AUTH').message, 'Email stranger@gmail.com is not in LSB_Staff. Ask an Admin to add you.');
  eq(errRes(makeContext({ email: 'viewer@lsb.example' }).api('record.save', { table: 'LSB_cost', record: {} }, 'en'), 'FORBIDDEN').message.indexOf('Requires Editor access to'), 0);
  const n = okRes(A.api('notification.list', {}, 'en'));
  ok(n.rows.length && n.rows.every(r => !VI_RE.test(r.title)), JSON.stringify(n.rows.map(r => r.title)));
  ok(okRes(A.api('lookups.get', {}, 'en')).LSB_shipment.every(o => /^Shipment /.test(o.label)));
  e = errRes(A.api('record.delete', { table: 'LSB_project', id: 'PJ-2026-001' }, 'en'), 'CONFLICT');
  ok(/^Cannot delete PJ-2026-001: still referenced by .*Project task/.test(e.message), e.message);
  ok(!okRes(A.api('structure.check', {}, 'en')).issues.some(i => VI_RE.test(i.message)));
  eq(errRes(A.api('nope', {}, 'en'), 'NOT_FOUND').message, 'Unknown API: nope');
  eq(errRes(A.api('nope', {}), 'NOT_FOUND').message, 'API không tồn tại: nope');
});
t('v2.5: từ điển phủ đủ — mọi bảng/cột có nhãn VN+EN, mọi ghi chú tiếng Việt có bản EN', () => {
  const d = okRes(makeContext().api('app.bootstrap', {}, 'en'));
  const i = d.config.i18n, miss = [];
  Object.entries(d.config.tables).forEach(([t, def]) => {
    if (!i.tables[t]) miss.push('table ' + t);
    def.columns.forEach(c => {
      const lab = i.columns[t + '.' + c.name] || i.columns[c.name];
      if (!lab || !lab[0] || !lab[1] || VI_RE.test(lab[1])) miss.push('label ' + t + '.' + c.name);
      if (c.note && VI_RE.test(c.note) && !i.notesEn[t + '.' + c.name]) miss.push('note ' + t + '.' + c.name);
    });
  });
  eq(miss, []);
  ok(Object.values(i.notesEn).every(x => !VI_RE.test(x)));
});

/* ---------------- Smoke test trên dữ liệu thật v4.3_Project (test/data_real.json) ---------------- */
const fs = require('fs');
if (fs.existsSync(require('path').join(__dirname, 'data_real.json'))) {
  const R = () => makeContext({ dataFile: 'data_real.json', noSeed: true, email: 'mth@luckysteel.vn' });
  t('[v4.3_Project thật] Admin thật vào được, cấu trúc khớp 11 bảng, mọi API đọc chạy', () => {
    const A = R();
    const b = okRes(A.api('app.bootstrap'));
    eq([b.user.staffId, b.user.role, Object.keys(b.config.tables).length], ['ST-001', 'Admin', 11]);
    const st = okRes(A.api('structure.check'));
    ok(st.ok, JSON.stringify(st.issues.filter(i => i.level === 'error')));
    ['dashboard.get', 'notification.list', 'project.list', 'customer.list', 'activity.list', 'lookups.get']
      .forEach(a => okRes(A.api(a, { year: 2026 })));
    eq(A.state.logs.filter(l => l[0] === 'error').length, 0);
  });
  t('[v4.3_Project thật] PJ-2026-001: 360° đủ, mã báo giá nội bộ 25B561 hiển thị (không nối bảng)', () => {
    const A = R();
    const p = okRes(A.api('project.get360', { id: 'PJ-2026-001' }));
    eq([p.quotation.linked, p.quotation.code, p.customer.Customer_id], [false, '25B561', 'CU-001']);
    eq(okRes(A.api('customer.lead360', { id: 'LD-2026-001' })).projects.length, 1);
  });
  t('[v4.5_Project thật] Dashboard board: Paid PP-2026-001, lần thu PD-2026-002 trỏ đợt không tồn tại vẫn được trả về để báo lỗi', () => {
    const b = okRes(R().api('dashboard.get', { year: 2026 })).board;
    eq(b.plans.map(x => [x.id, x.st]), [['PP-2026-001', 'Paid']]);
    ok(b.paid.some(x => x.id === 'PD-2026-002' && x.pp === 'PP-2026-002'), 'PD-2026-002');
    eq(b.customers[0].seg, 'EPC Main Contractor');
  });
}

console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
