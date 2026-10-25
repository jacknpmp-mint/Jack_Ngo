/**
 * 05_Dashboard.gs — Dashboard dùng chung (trước khi có Dashboard nghiệp vụ riêng đã duyệt bản mẫu).
 *  - KPI: số bản ghi mỗi bảng trong DASHBOARD.kpiTables (+ số bản ghi thiếu dữ liệu).
 *  - Chỉ số theo quý: DASHBOARD.metrics = [{ label: [vi, en], table, date, sum? (cột cộng), where? {cột: giá trị} }].
 *  - Kiểm tra dữ liệu: Checks_run_() (04_Entity.gs).
 * Dashboard nghiệp vụ (4 tab kiểu LSB v2.6) viết thêm ở module riêng và gắn vào kết quả qua DASHBOARD.providers.
 */
function Dashboard_get_(year) {
  year = Number(year) || new Date().getFullYear();
  Form_applyPolicy_();
  var years = {}; years[year] = true;
  var Q = ['Q1', 'Q2', 'Q3', 'Q4'];
  var metrics = (DASHBOARD.metrics || []).filter(function (m) { return SCHEMA[m.table]; }).map(function (m) {
    var v = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, total: 0 };
    Data_all_(m.table).forEach(function (r) {
      if (m.where && Object.keys(m.where).some(function (k) { return String(r[k]) !== String(m.where[k]); })) return;
      var yq = Utils_yearQuarter_(r[m.date]);
      if (!yq.year) return;
      years[yq.year] = true;
      if (yq.year !== year) return;
      var n = m.sum ? Utils_num_(r[m.sum]) : 1;
      v[yq.quarter] += n; v.total += n;
    });
    return { label: m.label, kind: m.sum ? 'sum' : 'count', values: v };
  });
  var kpis = (DASHBOARD.kpiTables || Object.keys(SCHEMA)).filter(function (t) { return SCHEMA[t]; }).map(function (t) {
    var rows = Data_all_(t);
    return { table: t, total: rows.length, missing: rows.filter(function (r) { return Form_missing_(t, r).length; }).length };
  });
  var out = { year: year, quarters: Q, metrics: metrics, kpis: kpis, checks: Checks_run_(), today: Utils_today_(),
    years: Object.keys(years).map(Number).sort(function (a, b) { return b - a; }) };
  (DASHBOARD.providers || []).forEach(function (name) { out[name] = Data_call_(name, [year]); });
  return out;
}
