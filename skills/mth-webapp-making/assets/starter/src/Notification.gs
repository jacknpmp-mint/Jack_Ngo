/**
 * Notification.gs — Cảnh báo trong app (chuông + Dashboard). Tính trực tiếp từ dữ liệu, không lưu, không gửi email.
 * Quy tắc khai báo ở 01_Config.gs:
 *   ALERT_RULES = [{ table, date: 'Due_day', title: [vi, en], warnDays: 3,
 *                    doneCol: 'Status', doneValues: ['Done'],   // hoặc doneWhen: 'Done_day' (cột có giá trị = đã xong)
 *                    ownerCol: 'Owner_id', link: 'Project_id' (FK mở trang 360°, mặc định chính bản ghi) }]
 * Module có thể thêm cảnh báo riêng qua ALERT_PROVIDERS: function (user, p) → [item].
 * p.mine = true → chỉ cảnh báo có ownerCol = Staff_id của người dùng.
 */
function Notification_list_(user, p) {
  p = p || {};
  var out = [];
  if (APP.FEATURES.ALERTS !== false) {
    var today = Utils_today_();
    ALERT_RULES.forEach(function (rule) {
      if (!SCHEMA[rule.table]) return;
      var def = SCHEMA[rule.table];
      Data_all_(rule.table).forEach(function (r) {
        var due = r[rule.date];
        if (Utils_isBlank_(due)) return;
        if (rule.doneCol && (rule.doneValues || []).indexOf(r[rule.doneCol]) >= 0) return;
        if (rule.doneWhen && !Utils_isBlank_(r[rule.doneWhen])) return;
        if (p.mine && rule.ownerCol && user && r[rule.ownerCol] !== user.staffId) return;
        var d = Utils_daysBetween_(today, due);
        if (d === null) return;
        var name = L_(rule.title[0], rule.title[1]);
        var label = Entity_label_(rule.table, r[def.pk]) || r[def.pk];
        var linkTable = rule.link ? (def.columns.filter(function (c) { return c.name === rule.link; })[0] || {}).ref : rule.table;
        var linkId = rule.link ? r[rule.link] : r[def.pk];
        var item = null;
        if (d < 0) item = Notification_item_(due, 'danger', rule.table, name + L_(' trễ ', ' overdue by ') + (-d) + L_(' ngày', ' days'), label, rule.table, r[def.pk]);
        else if (d <= (rule.warnDays === undefined ? APP.ALERT_DAYS : rule.warnDays)) item = Notification_item_(due, 'warn', rule.table, name + L_(' đến hạn sau ', ' due in ') + d + L_(' ngày', ' days'), label, rule.table, r[def.pk]);
        if (item) {
          if (linkTable && linkId && SCHEMA[linkTable]) item.link = { route: 'entity', table: linkTable, id: linkId };
          out.push(item);
        }
      });
    });
    (ALERT_PROVIDERS || []).forEach(function (name) { out = out.concat(Data_call_(name, [user, p]) || []); });
  }
  var rank = { danger: 0, warn: 1, info: 2 };
  out.sort(function (a, b) { return rank[a.level] - rank[b.level] || String(a.date).localeCompare(String(b.date)); });
  return {
    rows: out,
    counts: { danger: out.filter(function (x) { return x.level === 'danger'; }).length,
      warn: out.filter(function (x) { return x.level === 'warn'; }).length, total: out.length }
  };
}

function Notification_item_(date, level, type, title, detail, table, id) {
  return { date: date, level: level, type: type, title: title, detail: detail, table: table, id: id, link: null };
}
