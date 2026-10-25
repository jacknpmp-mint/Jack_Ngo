// Ca kiểm thử nghiệp vụ riêng LSB v3.0 (gọi từ backend.test.js). Fixture: test/data.json (dữ liệu thật v4.6 + LD-2026-002, QT-2026-002 minh hoạ).
module.exports = ({ t, eq, ok, okRes, errRes, makeContext }) => {
  const save = (A, table, record) => okRes(A.api('record.save', { table, record }));
  const get = (A, table, id) => okRes(A.api('record.get', { table, id }));
  const has = (r, re) => (r.warnings || []).some(w => re.test(w));

  t('[LSB] Lead mới: Created_day = hôm nay, Lead_status = New, Owner = người dùng', () => {
    const A = makeContext();
    const r = save(A, 'LSB_Lead', { Company_name: 'X' }).record;
    eq(r.Lead_status, 'New'); ok(r.Created_day, 'Created_day'); ok(r.Owner_id, 'Owner_id');
  });
  t('[LSB] Việc đánh giá lead: Due = Start + ngày chuẩn, Qual_Status mặc định; lead New → Qualifying', () => {
    const A = makeContext();
    const lead = save(A, 'LSB_Lead', { Company_name: 'Y' }).record;
    const r = save(A, 'LSB_Lead_Qualifying', { Lead_id: lead.Lead_id, Task_id: 'TK-001', Qual_Start_day: '2026-10-01' });
    eq(r.record.Qual_Due_day, '2026-10-04'); eq(r.record.Qual_Status, 'Not started');
    eq(get(A, 'LSB_Lead', lead.Lead_id).Lead_status, 'Qualifying');
    ok(has(r, /Qualifying/));
  });
  t('[LSB] Việc đánh giá: Done → ngày xong; đầu việc sai giai đoạn → cảnh báo', () => {
    const A = makeContext();
    const r = save(A, 'LSB_Lead_Qualifying', { Lead_id: 'LD-2026-002', Task_id: 'TK-003', Qual_Start_day: '2026-01-05', Qual_Status: 'Done' });
    ok(r.record.Qual_Done_day, 'Qual_Done_day'); ok(has(r, /giai đoạn/));
  });
  t('[LSB] Action plan: chọn báo giá → tự điền Lead; báo giá khác lead → chặn', () => {
    const A = makeContext();
    const r = save(A, 'LSB_Bidding_action_plan', { Quotation_code: 'QT-2026-002', Task_id: 'TK-002', Start_day: '2026-09-01' });
    eq(r.record.Lead_id, 'LD-2026-002'); eq(r.record.Due_day, '2026-09-08');
    errRes(A.api('record.save', { table: 'LSB_Bidding_action_plan', record: { Lead_id: 'LD-2026-001', Quotation_code: 'QT-2026-002', Task_id: 'TK-002' } }), 'VALIDATION');
  });
  t('[LSB] Kết quả thầu Lost → LSB_Quotation.Status = Lost (+ nhật ký); 1 báo giá ≤ 1 kết quả', () => {
    const A = makeContext();
    const r = save(A, 'LSB_Result_Lesson', { Quotation_code: 'QT-2026-002', Result: 'Lost', Winner: 'Competitor' });
    ok(r.record.Result_day, 'Result_day');
    eq(get(A, 'LSB_Quotation', 'QT-2026-002').Status, 'Lost');
    ok(okRes(A.api('activity.list', { id: 'QT-2026-002' })).rows.some(x => x.action === 'Update'));
    errRes(A.api('record.save', { table: 'LSB_Result_Lesson', record: { Quotation_code: 'QT-2026-002', Result: 'Won' } }), 'VALIDATION');
  });
  t('[LSB] Kết quả Won: tự điền Project_id theo mã nội bộ; chưa có dự án → nhắc tạo', () => {
    const A = makeContext();
    // dự án mang mã 26B500 → Result Won tự điền Project_id
    const pj = save(A, 'LSB_project', { Customer_id: 'CU-001', 'Quotation_LSB-Code': '26B500', Project_name: 'P' });
    ok(has(pj, /trạng thái Submitted|Submitted/), 'cảnh báo báo giá chưa Won');
    const r = save(A, 'LSB_Result_Lesson', { Quotation_code: 'QT-2026-002', Result: 'Won' });
    eq(r.record.Project_id, pj.record.Project_id);
    eq(get(A, 'LSB_Quotation', 'QT-2026-002').Status, 'Won');
    const B = makeContext();
    const r2 = save(B, 'LSB_Result_Lesson', { Quotation_code: 'QT-2026-002', Result: 'Won' });
    ok(has(r2, /Thắng thầu/));
  });
  t('[LSB] Khách hàng: tự điền từ lead, lead → Converted; 1 lead ≤ 1 khách hàng', () => {
    const A = makeContext();
    const c = save(A, 'LSB_Customer', { Lead_id: 'LD-2026-002' }).record;
    eq(c.Nation, 'Japan'); eq(c.Account_owner_id, 'ST-001');
    eq(get(A, 'LSB_Lead', 'LD-2026-002').Lead_status, 'Converted');
    errRes(A.api('record.save', { table: 'LSB_Customer', record: { Lead_id: 'LD-2026-002' } }), 'VALIDATION');
  });
  t('[LSB] Dự án: Status mặc định Kick-off; Closed khi chưa có bài học → chặn; mã báo giá không khớp → cảnh báo', () => {
    const A = makeContext();
    const r = save(A, 'LSB_project', { Customer_id: 'CU-001', 'Quotation_LSB-Code': 'NOPE-1' });
    eq(r.record.Status, 'Kick-off'); ok(has(r, /chưa có báo giá nào/));
    errRes(A.api('record.save', { table: 'LSB_project', record: Object.assign({}, r.record, { Status: 'Closed' }) }), 'VALIDATION');
    save(A, 'LSB_Project_handover_lesson', { Project_id: r.record.Project_id, Handover_day: '2026-10-01' });
    eq(save(A, 'LSB_project', Object.assign({}, r.record, { Status: 'Closed' })).record.Status, 'Closed');
    errRes(A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001', 'Quotation_LSB-Code': 'LSB-26-PCS' } }), 'VALIDATION'); // unique
  });
  t('[LSB] Đợt thanh toán: USD = % × HĐ, VND = USD × 26000; tổng % > 100% → cảnh báo; lô khác dự án → chặn', () => {
    const A = makeContext();
    const r = save(A, 'LSB_payment_plan', { Project_id: 'PJ-2026-001', Payment_pct: 0.5, Payment_code: 'Final' });
    eq(r.record.Payment_USD, 840000); eq(r.record.Payment_VND, 840000 * 26000);
    ok(has(r, /> 100%/));
    const p2 = save(A, 'LSB_project', { Customer_id: 'CU-001', Project_name: 'Other' }).record;
    errRes(A.api('record.save', { table: 'LSB_payment_plan', record: { Project_id: p2.Project_id, Shipping_id: 'SH-2026-001' } }), 'VALIDATION');
  });
  t('[LSB] Đã thu vượt đợt → cảnh báo; lô hàng: số lô kế tiếp, ETA = ETD + 14', () => {
    const A = makeContext();
    ok(has(save(A, 'LSB_paid', { PaymentPlan_id: 'PP-2026-002', Paid_USD: 300000 }), /vượt/));
    const s = save(A, 'LSB_shipment', { Project_id: 'PJ-2026-001', ETD_plan: '2026-11-01' }).record;
    eq(s.Shipment_no, 3); eq(s.ETA_plan, '2026-11-15');
  });
  t('[LSB] Chi phí: Cost_status mặc định Planned, Cost_VND tự tính; Invoice_no là text', () => {
    const A = makeContext();
    const c = save(A, 'LSB_cost', { Project_id: 'PJ-2026-001', Cost_USD: 100, Invoice_no: 'HD-0001' }).record;
    eq(c.Cost_status, 'Planned'); eq(c.Cost_VND, 2600000); eq(c.Invoice_no, 'HD-0001');
  });
  t('[LSB] record.related: đợt TT trả Balance_calc; báo giá trả Project_calc; dự án trả Next_Shipment_no', () => {
    const A = makeContext();
    eq(okRes(A.api('record.related', { table: 'LSB_payment_plan', id: 'PP-2026-002' })).Balance_calc, 272000);
    eq(okRes(A.api('record.related', { table: 'LSB_project', id: 'PJ-2026-001' })).Next_Shipment_no, 3);
    eq(okRes(A.api('record.related', { table: 'LSB_Quotation', id: 'QT-2026-002' })).Project_calc, '');
  });
  t('[LSB] Dự án 360°: KPI tính lại từ dữ liệu gốc (khớp tính tay trên file v4.6)', () => {
    const A = makeContext();
    const k = okRes(A.api('entity.get360', { table: 'LSB_project', id: 'PJ-2026-001' })).extra.project360.kpi;
    eq(k.contractUSD, 1680000); eq(k.collectedUSD, 904000); eq(k.outstandingUSD, 776000);
    eq(k.overdueUSD, 272000); eq(k.planUSD, 1176000); eq(k.costActualUSD, 710000); eq(k.shippedTon, 200); eq(k.lessons, 1);
  });
  t('[LSB] Dashboard board: Pay_status, pipeline, kết quả thầu, việc thầu; kiểm tra dữ liệu bắt đúng điểm lệch', () => {
    const A = makeContext({ dataFile: 'data_real.json' });
    const d = okRes(A.api('dashboard.get', {}));
    const b = d.Lsb_board_;
    eq(b.plans.map(p => p.st).join(','), 'Paid,Overdue');
    eq(b.plans[1].bal, 272000); eq(b.costs[0].day, '2026-05-10');
    eq(b.quotes.length, 1); eq(b.results[0].res, 'Won'); eq(b.bidTasks.length, 3);
    eq(b.projects[0].status, 'Shipping'); eq(b.projects[0].qcode, 'LSB-26-PCS');
    const msg = d.checks.map(c => c.table + ' ' + c.id + ' ' + c.message).join('\n');
    ok(/LSB_project PJ-2026-001 Tổng kế hoạch thanh toán 1176000/.test(msg), msg);
    ok(/không khớp Quotation_LSB_Code/.test(msg), msg);
    ok(/QT-2026-001 Đã Won nhưng chưa có dự án/.test(msg), msg);
    ok(/Tonnage_Actual 650/.test(msg), msg);
  });
  t('[LSB] Cảnh báo: việc thầu / đợt TT quá hạn có link mở đúng bản ghi', () => {
    const A = makeContext();
    save(A, 'LSB_Bidding_action_plan', { Lead_id: 'LD-2026-002', Task_id: 'TK-002', Start_day: '2026-01-01', Due_day: '2026-01-05' });
    const n = okRes(A.api('notification.list', {}));
    ok(n.rows.some(x => x.link && x.link.table === 'LSB_Lead' && x.link.id === 'LD-2026-002'), JSON.stringify(n.rows.slice(0, 3)));
    ok(n.rows.some(x => x.link && x.link.table === 'LSB_project'), 'đợt TT quá hạn → dự án');
  });
};
