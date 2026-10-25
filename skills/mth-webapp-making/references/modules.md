# Viết phần nghiệp vụ riêng (sau khi người dùng duyệt)

Chỉ viết khi khung chung chưa đủ và người dùng đã duyệt (bản mẫu / phỏng vấn). Mỗi DB 1–2 file server `2x_<Tên>.gs` + `Custom.html` + test riêng. Khai báo tên hàm trong `app_spec.json › providers` / `dashboard.providers` rồi chạy `gen_config.py`.

## Mục lục
1. Quy trình bản mẫu → code · 2. Module server mẫu · 3. Custom.html mẫu · 4. Test riêng · 5. Mẫu đã làm ở LSB v2.6

## 1. Bản mẫu → code

1. Phỏng vấn vòng 3 (interview.md) → dựng trang mẫu Artifact (HTML 1 file, tab + bộ lọc + bảng + biểu đồ SVG đơn giản) với **dữ liệu thật** trích từ xlsx (JSON nhúng) và nút "Minh hoạ" dùng dữ liệu giả cùng cấu trúc cột khi dữ liệu thật quá ít. Mỗi khối có "Cách tính" (bảng, cột, công thức). Có khối "Kiểm tra dữ liệu" nếu thấy điểm lệch.
2. Gửi link, hỏi các điểm còn mở (kỳ lọc theo ngày nào, trạng thái suy ra thế nào…), sửa mẫu tới khi người dùng nói **duyệt**.
3. Chuyển sang code: logic tính ở trình duyệt của bản mẫu thường dùng lại gần nguyên cho `Custom.html`; server chỉ trả dữ liệu gọn (provider), tính lại từ dữ liệu gốc.

## 2. Module server mẫu — `20_Okr.gs`

```javascript
/**
 * 20_Okr.gs — Nghiệp vụ OKR: trọng số mục tiêu ≤ 100%/người, tiến độ KR, dữ liệu tab Dashboard "OKR".
 * Khai báo: providers.hooks ['Okr_hooks_'], providers.checks ['Okr_checks_'], dashboard.providers ['Okr_board_'].
 */
function Okr_hooks_() {
  return {
    HR_Objective: {
      beforeSave: function (rec, ctx) {
        var others = Data_all_('HR_Objective').filter(function (o) {
          // so năm từ cột NGÀY gốc, không dùng cột AUTO Year (công thức có thể trống / #REF!)
          return o.Employee_id === rec.Employee_id && o.Objective_id !== rec.Objective_id &&
            String(o.Start_day).slice(0, 4) === String(rec.Start_day).slice(0, 4);
        });
        var total = Utils_sum_(others, 'Weight_pct') + Utils_num_(rec.Weight_pct);
        if (total > 1.0001) ctx.warnings.push(L_('Tổng trọng số mục tiêu của nhân viên là ', 'Total objective weight for the employee is ') + Math.round(total * 100) + '%.');
      }
    }
  };
}

/** Dữ liệu gọn cho tab Dashboard (client tự lọc / tính tiếp). */
function Okr_board_(year) {
  return {
    objectives: Data_all_('HR_Objective').map(function (o) { return { id: o.Objective_id, emp: o.Employee_id, title: o.Title, st: o.Status, due: o.Due_day, w: Utils_num_(o.Weight_pct) }; }),
    krs: Data_all_('HR_KeyResult').map(function (k) {
      var t = Utils_num_(k.Target);
      return { id: k.KeyResult_id, obj: k.Objective_id, title: k.Title, pct: t ? Utils_num_(k.Actual) / t : null, st: k.Status };
    })
  };
}

/** Điểm lệch riêng → hiện ở Dashboard › Kiểm tra dữ liệu. */
function Okr_checks_() {
  var out = [];
  var byEmp = Utils_groupBy_(Data_all_('HR_Objective'), 'Employee_id');
  Object.keys(byEmp).forEach(function (e) {
    var w = Utils_sum_(byEmp[e], 'Weight_pct');
    if (Math.abs(w - 1) > 0.001) out.push({ level: 'warn', table: 'HR_Employee', id: e, column: 'Weight_pct',
      message: L_('Tổng trọng số mục tiêu = ', 'Total objective weight = ') + Math.round(w * 100) + '%' });
  });
  return out;
}
```

Quy ước: hàm có hậu tố `_` (ẩn khỏi menu Apps Script); mọi chuỗi người dùng thấy dùng `L_(vi, en)`; đọc bằng `Data_all_` / `Data_find_` (đã cache trong 1 lượt gọi); không ghi Sheet ngoài `Record_save_` (để có nhật ký + kiểm tra).

## 3. `Custom.html` mẫu

```html
<script>
/* Tự điền khi chọn FK: KR ← Objective (hạn = hạn mục tiêu) */
UI.AUTOFILL.HR_KeyResult = [{ fk: 'Objective_id', ref: 'HR_Objective', fill: function (p) { return { Due_day: p.Due_day }; } }];
/* Lọc lựa chọn FK theo nhóm (cột groupCol của bảng đích) */
UI.FK_GROUP_FILTER.HR_Task = { HR_TaskTemplate: ['Execution'] };
/* Tab Dashboard nghiệp vụ — dữ liệu từ dashboard.providers: d.Okr_board_ */
App.pages.dashboard.tabs.push({
  id: 'okr', label: ['OKR', 'OKR'],
  render: function (d) {
    var b = d.Okr_board_;
    var risk = b.objectives.filter(function (o) { return o.st === 'At risk'; });
    return UI.kpis([{ label: L('Mục tiêu', 'Objectives'), value: b.objectives.length },
                    { label: L('Có rủi ro', 'At risk'), value: risk.length, tone: risk.length ? 'danger' : 'ok' }]) +
      '<div class="card"><h3>' + L('Kết quả then chốt', 'Key results') + '</h3>' + UI.table([
        { key: 'id', label: 'KR', render: function (k) { return '<span class="id">' + Fmt.esc(k.id) + '</span>'; } },
        { key: 'title', label: L('Nội dung', 'Title') },
        { key: 'pct', label: L('Tiến độ', 'Progress'), num: true, render: function (k) { return k.pct === null ? '—' : Fmt.pct(k.pct, 0); } }
      ], b.krs, { onRow: function (k) { App.go('entity', { table: 'HR_KeyResult', id: k.id }); } }) + '</div>';
  }
});
</script>
```
Thêm: `App.pages.entity.custom360[bảng] = function (view, d, p) {…}` (360° có KPI, gọi `App.pages.entity.draw360` rồi chèn thêm khối), `App.pages['okr_board'] = { title, render }` + mục menu `{ route: 'okr_board', label: [...] }`.

Lưu ý giao diện (đã gặp lỗi ở LSB):
- Gắn sự kiện vào phần tử con mới tạo mỗi lần vẽ (`#dash`), **không** gắn `view.onclick` (view tồn tại suốt app → handler rò sang trang khác).
- Nhãn song ngữ trong hằng số phải là **hàm** (tính lúc vẽ), không tính lúc nạp file (đổi VN/EN sẽ không cập nhật).
- Bảng rộng đặt trong `.table-wrap` (cuộn ngang riêng), không làm tràn trang ở 390px.
- Số tiền: `Fmt.usd` / `Fmt.compact`; ngày: `Fmt.date`; cột năm / số thứ tự không dùng dấu phân cách nghìn.

## 4. Test riêng

`test/custom.test.js` (được backend.test.js gọi):
```javascript
module.exports = ({ t, eq, ok, okRes, errRes, makeContext, create, SCHEMA }) => {
  t('[OKR] tổng trọng số > 100% → cảnh báo, vẫn lưu', () => {
    const A = makeContext();
    const r = okRes(A.api('record.save', { table: 'HR_Objective', record: { Employee_id: 'EM-001', Title: 'X', Start_day: '2026-07-01', Weight_pct: 0.9 } }));
    ok(r.warnings.some(w => /trọng số/.test(w)));
  });
};
```
`test/custom.ui.js`: `module.exports = async ({ run, page, A, shots }) => { await run('[OKR] tab Dashboard', async () => { await page.click('[data-route=dashboard]'); await page.click('[data-dt=okr]'); await page.waitForSelector('text=Kết quả then chốt'); }); };`
Ca test luôn kiểm cả số liệu (so với tính tay trên fixture), không chỉ "không lỗi".

## 5. Mẫu đã làm ở LSB v2.6 (`examples/lsb_v2.6/`)

| Nhu cầu | Xem |
| --- | --- |
| Dashboard 4 tab theo vai trò, lọc kỳ / khách / trạng thái / quốc gia, USD↔VND, cửa sổ 7/14/30/60 | `src/Dashboard.html` (Dash.*), `src/04_Project.gs › Project_board_` |
| Trạng thái đợt thanh toán = công thức Pay_status (Paid → Overdue → Partial → Open) | `04_Project.gs › Project_payStatus_` |
| Trạng thái lô suy từ mốc ngày (Start_Fab → Completed_Fab → ETD_actual → ETA_actual) | `Dashboard.html › Dash.shState` |
| Cây Dự án → Lô → Đợt → lần thu; nhánh "Chung dự án" | `Dashboard.html › Dash.tree` |
| Kiểm tra dữ liệu nghiệp vụ (kế hoạch ≠ HĐ, pct × HĐ ≠ USD, chi phí > HĐ, tấn lệch) | `Dashboard.html › Dash.checks` |
| Dự án 360° có KPI, Lead 360°, tạo khách hàng → Lead Converted | `src/Project.html`, `src/Customer.html`, `05_Customer.gs` |
| Quy tắc: Closed cần bài học; lô cùng dự án; Payment_USD = % × HĐ; tổng % > 100% cảnh báo | `04_Project.gs › Project_hooks_` |
| Tự điền khi chọn FK (khách ← lead, Due_day = Start + ngày chuẩn, đã thu = còn phải thu) | `src/Components.html › UI.AUTOFILL` |
| Module bật/tắt theo bảng có trong Database (thầu/báo giá) | `01_Config.gs › Config_moduleOn_`, `Index.html data-tables` |
