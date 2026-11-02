/**
 * 07_Quotation.gs — Module Báo giá (LSB_Quotation) — bật từ v2.1 (DB v4.2 gộp 1 file).
 *  - Danh sách báo giá + chỉ số pipeline (giá trị đang chào, có trọng số, tỷ lệ thắng).
 *  - Báo giá 360°: lead → báo giá → chiến lược → kế hoạch hành động → kết quả & bài học → dự án.
 *  - Quy tắc: báo giá nối Lead trực tiếp (Lead_id); cảnh báo khi lead chưa Qualified (quy tắc 1).
 *  - v4.3: dự án nối báo giá bằng MÃ NỘI BỘ: LSB_project.Quotation_LSB-Code (PROJECT_QUOTE_COL, nhập tay)
 *    = LSB_Quotation.Quotation_LSB_Code (vd 25B561), mong đợi Status = Won. Không còn FK.
 */

function Quotation_enabled_() {
  return Config_moduleOn_('QUOTATION');
}

function Quotation_status_() {
  return {
    enabled: Quotation_enabled_(),
    message: Quotation_enabled_() ? '' : 'Module Báo giá không dùng trong bản Project (bảng LSB_Quotation không có trong Google Sheet).'
  };
}

function Quotation_requireEnabled_() {
  if (!Quotation_enabled_()) throw AppError_('MODULE_DISABLED', Quotation_status_().message);
}

/** Chuẩn hóa mã nội bộ để so khớp (bỏ khoảng trắng, không phân biệt hoa/thường). */
function Quotation_key_(v) {
  return Utils_isBlank_(v) ? '' : String(v).trim().toUpperCase();
}

/** Dự án đầu tiên ghi mã nội bộ của báo giá q (LSB_project[PROJECT_QUOTE_COL] = q.Quotation_LSB_Code). */
function Quotation_projectFor_(q, projects) {
  var c = q ? Quotation_key_(q.Quotation_LSB_Code) : '';
  if (!c) return null;
  return (projects || Data_all_('LSB_project')).filter(function (p) {
    return Quotation_key_(p[PROJECT_QUOTE_COL]) === c;
  })[0] || null;
}

/** Các báo giá có mã nội bộ = lsbCode. */
function Quotation_byLsbCode_(lsbCode) {
  var c = Quotation_key_(lsbCode);
  if (!c) return [];
  return Data_all_('LSB_Quotation').filter(function (q) { return Quotation_key_(q.Quotation_LSB_Code) === c; });
}

/** Tỷ lệ thắng = Won / (Won + Lost) theo kết quả thầu (bỏ Cancelled, No-bid). */
function Quotation_winRate_(results) {
  var won = results.filter(function (r) { return r.Result === 'Won'; }).length;
  var lost = results.filter(function (r) { return r.Result === 'Lost'; }).length;
  return won + lost ? won / (won + lost) : null;
}

/* --------------------------------- Danh sách --------------------------------- */

/** p: { year, status, sales, lead, q, open } */
function Quotation_list_(p) {
  Quotation_requireEnabled_();
  p = p || {};
  var today = Utils_today_();
  var staff = Project_nameMap_('LSB_Staff');
  var leads = Utils_indexBy_(Data_all_('LSB_Lead'), 'Lead_id');
  var results = Utils_indexBy_(Data_all_('LSB_Result_Lesson'), 'Quotation_code');
  var strategies = Utils_indexBy_(Data_all_('LSB_Bidding_strategy'), 'Quotation_code');
  var actions = Utils_groupBy_(Data_all_('LSB_Bidding_action_plan'), 'Quotation_code');
  var projects = Data_all_('LSB_project');

  var rows = Data_all_('LSB_Quotation').map(function (q) {
    var lead = leads[q.Lead_id] || {};
    var acts = actions[q.Quotation_code] || [];
    var res = results[q.Quotation_code] || null;
    var pj = Quotation_projectFor_(q, projects);
    return {
      Quotation_code: q.Quotation_code, Quotation_LSB_Code: q.Quotation_LSB_Code, Project_name: q.Project_name,
      Lead_id: q.Lead_id, Company_name: lead.Company_name || '', Nation: lead.Nation || '',
      Sales_id: q.Sales_id, Sales_name: staff[q.Sales_id] || '', Issue_day: q.Issue_day,
      Year: Utils_yearQuarter_(q.Issue_day).year, Status: q.Status, Revision_no: q.Revision_no,
      Value_USD: Utils_num_(q.Value_USD), Tonnage: q.Tonnage, Area_m2: q.Area_m2, Incoterm: q.Incoterm,
      Win_probability: q.Win_probability,
      Weighted_USD: Utils_num_(q.Value_USD) * (Utils_isBlank_(q.Win_probability) ? 0 : Utils_num_(q.Win_probability)),
      Has_strategy: !!strategies[q.Quotation_code],
      Actions: acts.length,
      Actions_done: acts.filter(function (a) { return a.Status === 'Done'; }).length,
      Actions_overdue: acts.filter(function (a) { return a.Status !== 'Done' && a.Due_day && a.Due_day < today; }).length,
      Result: res ? res.Result : '', Result_id: res ? res.Result_id : '',
      Project_id: pj ? pj.Project_id : ''
    };
  });
  if (p.year) rows = rows.filter(function (r) { return String(r.Year) === String(p.year); });
  if (p.status) rows = rows.filter(function (r) { return r.Status === p.status; });
  if (p.open) rows = rows.filter(function (r) { return QUOTATION_OPEN_STATUS.indexOf(r.Status) >= 0; });
  if (p.sales) rows = rows.filter(function (r) { return r.Sales_id === p.sales; });
  if (p.lead) rows = rows.filter(function (r) { return r.Lead_id === p.lead; });
  if (p.q) {
    var q = String(p.q).toLowerCase();
    rows = rows.filter(function (r) {
      return [r.Quotation_code, r.Quotation_LSB_Code, r.Project_name, r.Company_name, r.Lead_id].join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }
  rows.sort(function (a, b) { return String(b.Issue_day).localeCompare(String(a.Issue_day)) || String(b.Quotation_code).localeCompare(String(a.Quotation_code)); });

  var open = rows.filter(function (r) { return QUOTATION_OPEN_STATUS.indexOf(r.Status) >= 0; });
  var shownCodes = {};
  rows.forEach(function (r) { shownCodes[r.Quotation_code] = true; });
  var shownResults = Data_all_('LSB_Result_Lesson').filter(function (r) { return shownCodes[r.Quotation_code]; });
  return {
    rows: rows, total: rows.length,
    summary: {
      openCount: open.length,
      pipelineUSD: Utils_sum_(open, 'Value_USD'),
      weightedUSD: Utils_sum_(open, 'Weighted_USD'),
      wonCount: rows.filter(function (r) { return r.Status === 'Won'; }).length,
      wonUSD: Utils_sum_(rows.filter(function (r) { return r.Status === 'Won'; }), 'Value_USD'),
      winRate: Quotation_winRate_(shownResults),
      actionsOverdue: rows.reduce(function (s, r) { return s + r.Actions_overdue; }, 0)
    }
  };
}

/* --------------------------------- Báo giá 360° --------------------------------- */

function Quotation_get360_(code, user) {
  Quotation_requireEnabled_();
  var q = Data_find_('LSB_Quotation', code);
  if (!q) throw AppError_('NOT_FOUND', 'Không tìm thấy báo giá ' + code + '.');
  var today = Utils_today_();
  var staff = Project_nameMap_('LSB_Staff');
  var taskCat = Utils_indexBy_(Data_all_('LSB_Task'), 'Task_id');
  var lead = Data_find_('LSB_Lead', q.Lead_id);
  if (lead) lead.Owner_name = staff[lead.Owner_id] || '';
  q.Sales_name = staff[q.Sales_id] || '';
  q.Sale_Assistant_name = staff[q.Sale_Assistant_id] || '';

  var strategy = Data_all_('LSB_Bidding_strategy').filter(function (s) { return s.Quotation_code === code; })[0] || null;
  var actions = Data_all_('LSB_Bidding_action_plan').filter(function (a) { return a.Quotation_code === code; })
    .map(function (a) { return Bidding_decorateTask_(a, taskCat, staff, today, 'Action'); })
    .sort(function (a, b) { return String(a.Start_day).localeCompare(String(b.Start_day)); });
  var result = Data_all_('LSB_Result_Lesson').filter(function (r) { return r.Quotation_code === code; })[0] || null;
  var project = Quotation_projectFor_(q);
  var customer = lead ? Data_all_('LSB_Customer').filter(function (c) { return c.Lead_id === lead.Lead_id; })[0] || null : null;
  if (result) result.Project_id_calc = project ? project.Project_id : '';

  var value = Utils_num_(q.Value_USD);
  var kpi = {
    valueUSD: value, valueVND: Utils_num_(q.Value_VND),
    winProbability: Utils_isBlank_(q.Win_probability) ? null : Utils_num_(q.Win_probability),
    weightedUSD: Utils_isBlank_(q.Win_probability) ? 0 : value * Utils_num_(q.Win_probability),
    usdPerTon: Utils_num_(q.Tonnage) ? value / Utils_num_(q.Tonnage) : null,
    usdPerM2: Utils_num_(q.Area_m2) ? value / Utils_num_(q.Area_m2) : null,
    actions: actions.length,
    actionsDone: actions.filter(function (a) { return a.Status === 'Done'; }).length,
    actionsOverdue: actions.filter(function (a) { return a.Overdue; }).length,
    hasStrategy: !!strategy, hasResult: !!result,
    contractUSD: project ? Utils_num_(project.Contract_USD) : null
  };

  var activity = [];
  if (user && Auth_can_(user, PERMISSION.ACTIVITY_READ)) {
    var ids = [code].concat(strategy ? [strategy.Strategy_id] : [], actions.map(function (a) { return a.Action_id; }),
      result ? [result.Result_id] : []);
    activity = Activity_list_({ recordIds: ids, limit: 50 }).rows;
  }
  return { quotation: q, lead: lead, customer: customer, strategy: strategy, actions: actions, result: result,
    project: project, kpi: kpi, activity: activity };
}

/** Thông tin báo giá cho Dự án 360° — lsbCode = LSB_project[PROJECT_QUOTE_COL] (mã nội bộ). */
function Quotation_lookup_(lsbCode) {
  if (Utils_isBlank_(lsbCode)) return null;
  if (!Quotation_enabled_()) return { code: lsbCode, lsbCode: lsbCode, linked: false, note: 'Mã báo giá nội bộ (tham chiếu file Bidding).' };
  var matches = Quotation_byLsbCode_(lsbCode);
  var q = matches.filter(function (x) { return x.Status === 'Won'; })[0] || matches[0];
  if (!q) return { code: lsbCode, lsbCode: lsbCode, linked: false, note: 'Chưa có báo giá nào có Quotation_LSB_Code = ' + lsbCode + '.' };
  var res = Data_all_('LSB_Result_Lesson').filter(function (r) { return r.Quotation_code === q.Quotation_code; })[0] || null;
  return { code: q.Quotation_code, linked: true, status: q.Status, valueUSD: Utils_num_(q.Value_USD),
    projectName: q.Project_name, lsbCode: q.Quotation_LSB_Code, issueDay: q.Issue_day, result: res ? res.Result : '',
    note: (q.Status === 'Won' ? '' : 'Báo giá đang ở trạng thái ' + (q.Status || '—') + ' (mong đợi Won). ') +
      (matches.length > 1 ? matches.length + ' báo giá trùng mã nội bộ ' + lsbCode + '.' : '') };
}

/* ------------------------------ Quy tắc nghiệp vụ ------------------------------ */

function Quotation_hooks_() {
  return {
    LSB_Quotation: {
      beforeSave: function (rec, ctx) {
        if (ctx.isNew) {
          if (Utils_isBlank_(rec.Status)) rec.Status = 'Draft';
          if (Utils_isBlank_(rec.Sales_id) && ctx.user) rec.Sales_id = ctx.user.staffId;
          if (Utils_isBlank_(rec.Revision_no)) rec.Revision_no = 0;
        }
        // Quy tắc 1 (dạng cảnh báo): báo giá nên lập từ lead đã Qualified.
        var lead = Data_find_('LSB_Lead', rec.Lead_id);
        if (lead && ['Qualified', 'Converted'].indexOf(lead.Lead_status) < 0 &&
            (ctx.isNew || (ctx.old && ctx.old.Lead_id !== rec.Lead_id))) {
          ctx.warnings.push('Lead ' + lead.Lead_id + ' đang ở trạng thái ' + (lead.Lead_status || '—') + ' (chưa Qualified).');
        }
        if (Utils_isBlank_(rec.Issue_day) && rec.Status && rec.Status !== 'Draft') {
          ctx.warnings.push('Chưa có Issue_day — báo giá sẽ không được tính vào Year/Quarter.');
        }
        // v4.3: Quotation_LSB_Code là khóa nối sang dự án → nên duy nhất.
        if (!Utils_isBlank_(rec.Quotation_LSB_Code) && (ctx.isNew || !ctx.old || Quotation_key_(ctx.old.Quotation_LSB_Code) !== Quotation_key_(rec.Quotation_LSB_Code))) {
          var dup = Quotation_byLsbCode_(rec.Quotation_LSB_Code).filter(function (x) { return x.Quotation_code !== rec.Quotation_code; })[0];
          if (dup) ctx.warnings.push('Quotation_LSB_Code ' + rec.Quotation_LSB_Code + ' đã dùng ở ' + dup.Quotation_code + ' — dự án nối báo giá bằng mã này, nên để duy nhất.');
          if (ctx.old && !Utils_isBlank_(ctx.old.Quotation_LSB_Code) && Quotation_projectFor_(ctx.old)) {
            ctx.warnings.push('Đổi mã nội bộ: dự án ' + Quotation_projectFor_(ctx.old).Project_id + ' đang ghi ' + ctx.old.Quotation_LSB_Code + ' — cập nhật ' + PROJECT_QUOTE_COL + ' của dự án.');
          }
        }
        if (!ctx.isNew && ctx.old && ctx.old.Lead_id !== rec.Lead_id) {
          var acts = Data_all_('LSB_Bidding_action_plan').filter(function (a) { return a.Quotation_code === rec.Quotation_code; });
          if (acts.length) Bidding_fail_('Lead_id', 'báo giá đã có ' + acts.length + ' kế hoạch hành động gắn lead ' + ctx.old.Lead_id + ' — không đổi lead được');
        }
      },
      afterSave: function (saved, ctx) {
        if (saved.Status === 'Won' && (!ctx.old || ctx.old.Status !== 'Won')) {
          var hasProject = !!Quotation_projectFor_(saved);
          ctx.warnings.push('Báo giá Won: nhớ ghi Kết quả & bài học' + (hasProject ? '' :
            Utils_isBlank_(saved.Quotation_LSB_Code) ? ', điền Quotation_LSB_Code rồi tạo Khách hàng + Dự án'
              : ', tạo Khách hàng + Dự án (' + PROJECT_QUOTE_COL + ' = ' + saved.Quotation_LSB_Code + ')') + '.');
        }
      }
    }
  };
}
