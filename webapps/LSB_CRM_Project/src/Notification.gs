/**
 * Notification.gs — Cảnh báo trong app (chuông thông báo + Dashboard).
 * Tính trực tiếp từ dữ liệu, không lưu, không gửi email:
 *   - Đầu việc dự án trễ hạn / sắp đến hạn (APP.ALERT_DAYS.TASK_DUE)
 *   - Đợt thanh toán Overdue / sắp đến hạn (APP.ALERT_DAYS.PAYMENT_DUE)
 *   - Lô hàng quá / sắp đến ETD kế hoạch mà chưa có ETD_actual (APP.ALERT_DAYS.ETD)
 *   - Dự án sắp đến RAD (APP.ALERT_DAYS.RAD) chưa Closed
 *   - (v2.1) Việc đánh giá lead / kế hoạch hành động thầu trễ hoặc sắp đến hạn
 * p.mine = true → chỉ việc của tôi (Owner_id / Assessor_id / PM_id = Staff_id của người dùng).
 * Mỗi cảnh báo có link { route, id } để giao diện mở đúng trang (dự án / báo giá / lead).
 */

function Notification_list_(user, p) {
  p = p || {};
  var today = Utils_today_();
  var D = APP.ALERT_DAYS;
  var mine = !!p.mine && user;
  var projects = Utils_indexBy_(Data_all_('LSB_project'), 'Project_id');
  var out = [];
  function pname(id) { return projects[id] ? (projects[id].Project_name || id) : id; }
  function isMineProject(id) { return !mine || (projects[id] && projects[id].PM_id === user.staffId); }

  Data_all_('LSB_Project_task').forEach(function (t) {
    if (t.Status === 'Done' || !t.Due_day) return;
    if (mine && t.Owner_id !== user.staffId) return;
    var d = Utils_daysBetween_(today, t.Due_day);
    if (d < 0) out.push(Notification_item_(t.Due_day, 'danger', 'task', L_('Việc trễ ', 'Task overdue by ') + (-d) + L_(' ngày', ' days'), (t.Task_duty || t.Task_id) + ' · ' + pname(t.Project_id), 'LSB_Project_task', t.Project_task_id, t.Project_id));
    else if (d <= D.TASK_DUE) out.push(Notification_item_(t.Due_day, 'warn', 'task', L_('Việc đến hạn sau ', 'Task due in ') + d + L_(' ngày', ' days'), (t.Task_duty || t.Task_id) + ' · ' + pname(t.Project_id), 'LSB_Project_task', t.Project_task_id, t.Project_id));
  });

  Project_plansWithCollected_().forEach(function (pl) {
    if (pl.Balance_calc <= 0 || !pl.Due_day || !isMineProject(pl.Project_id)) return;
    var d = Utils_daysBetween_(today, pl.Due_day);
    var detail = pl.Payment_code + L_(' · còn ', ' · balance ') + Math.round(pl.Balance_calc).toLocaleString('en-US') + ' USD · ' + pname(pl.Project_id);
    if (d < 0) out.push(Notification_item_(pl.Due_day, 'danger', 'payment', L_('Thanh toán quá hạn ', 'Payment overdue by ') + (-d) + L_(' ngày', ' days'), detail, 'LSB_payment_plan', pl.PaymentPlan_id, pl.Project_id));
    else if (d <= D.PAYMENT_DUE) out.push(Notification_item_(pl.Due_day, 'warn', 'payment', L_('Thanh toán đến hạn sau ', 'Payment due in ') + d + L_(' ngày', ' days'), detail, 'LSB_payment_plan', pl.PaymentPlan_id, pl.Project_id));
  });

  Data_all_('LSB_shipment').forEach(function (s) {
    if (s.ETD_actual || !s.ETD_plan || !isMineProject(s.Project_id)) return;
    var d = Utils_daysBetween_(today, s.ETD_plan);
    var detail = L_('Lô ', 'Shipment ') + (s.Shipment_no || '') + (s.Shipment_code ? ' (' + s.Shipment_code + ')' : '') + ' · ' + pname(s.Project_id);
    if (d < 0) out.push(Notification_item_(s.ETD_plan, 'danger', 'shipment', L_('Quá ETD kế hoạch ', 'Past planned ETD by ') + (-d) + L_(' ngày, chưa xuất', ' days, not shipped'), detail, 'LSB_shipment', s.Shipping_id, s.Project_id));
    else if (d <= D.ETD) out.push(Notification_item_(s.ETD_plan, 'warn', 'shipment', L_('ETD sau ', 'ETD in ') + d + L_(' ngày', ' days'), detail, 'LSB_shipment', s.Shipping_id, s.Project_id));
  });

  Object.keys(projects).forEach(function (id) {
    var pr = projects[id];
    if (pr.Status === 'Closed' || !pr.RAD_date || !isMineProject(id)) return;
    var d = Utils_daysBetween_(today, pr.RAD_date);
    if (d >= 0 && d <= D.RAD) out.push(Notification_item_(pr.RAD_date, 'info', 'project', L_('RAD sau ', 'RAD in ') + d + L_(' ngày', ' days'), pname(id) + L_(' · trạng thái ', ' · status ') + (pr.Status || '—'), 'LSB_project', id, id));
  });

  if (Bidding_enabled_()) {
    Bidding_tasks_({ open: true, mine: !!mine }, user).rows.forEach(function (t) {
      if (!t.Due_calc) return;
      var d = Utils_daysBetween_(today, t.Due_calc);
      var what = (t.Kind === 'Qualifying' ? L_('Đánh giá lead', 'Lead qualification') : L_('Việc thầu', 'Bid task'));
      var detail = (t.Task_duty || t.Task_id) + ' · ' + (t.Company_name || t.Lead_id) + (t.Quotation_code ? ' · ' + t.Quotation_code : '');
      var link = t.Quotation_code ? { route: 'quotation', id: t.Quotation_code } : { route: 'lead', id: t.Lead_id };
      var item = null;
      if (d < 0) item = Notification_item_(t.Due_calc, 'danger', 'bidding', what + L_(' trễ ', ' overdue by ') + (-d) + L_(' ngày', ' days'), detail, t.Table, t.Id, '');
      else if (d <= D.TASK_DUE) item = Notification_item_(t.Due_calc, 'warn', 'bidding', what + L_(' đến hạn sau ', ' due in ') + d + L_(' ngày', ' days'), detail, t.Table, t.Id, '');
      if (item) { item.link = link; out.push(item); }
    });
  }

  var rank = { danger: 0, warn: 1, info: 2 };
  out.sort(function (a, b) { return rank[a.level] - rank[b.level] || String(a.date).localeCompare(String(b.date)); });
  return {
    rows: out,
    counts: { danger: out.filter(function (x) { return x.level === 'danger'; }).length,
      warn: out.filter(function (x) { return x.level === 'warn'; }).length, total: out.length }
  };
}

function Notification_item_(date, level, type, title, detail, table, id, projectId) {
  return { date: date, level: level, type: type, title: title, detail: detail, table: table, id: id, projectId: projectId,
    link: projectId ? { route: 'project', id: projectId } : null };
}
