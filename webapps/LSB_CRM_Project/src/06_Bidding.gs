/**
 * 06_Bidding.gs — Module Đấu thầu — bật từ v2.1 (DB v4.2 gộp 1 file).
 * Bảng: LSB_Lead_Qualifying (việc đánh giá lead), LSB_Bidding_strategy (1–1 báo giá),
 *       LSB_Bidding_action_plan (việc thầu theo lead / báo giá), LSB_Result_Lesson (1–1 báo giá).
 *
 * Quy tắc:
 *  - Việc (Qualifying / Action plan): Due tự tính = Start + Std_duration_days của đầu việc chuẩn;
 *    Status = Done → tự điền ngày xong; đầu việc nên đúng giai đoạn (TASK_PHASE_FILTER, cảnh báo).
 *  - Thêm việc đánh giá cho lead New → lead chuyển Qualifying.
 *  - Action plan: báo giá (nếu có) phải thuộc cùng lead; chỉ chọn báo giá → tự điền Lead_id.
 *    Stage (cột công thức) được tính lại: trống Quotation_code → Qualify, có → Quotation.
 *  - Kết quả thầu Won / Lost / Cancelled → đồng bộ LSB_Quotation.Status (ghi nhật ký).
 *  - Result_Lesson.Project_id (cột công thức) được app tính lại: báo giá → Quotation_LSB_Code → LSB_project[PROJECT_QUOTE_COL].
 */

function Bidding_enabled_() {
  return Config_moduleOn_('BIDDING');
}

/** Trạng thái module cho giao diện. */
function Bidding_status_() {
  return {
    enabled: Bidding_enabled_(),
    tables: ['LSB_Lead_Qualifying', 'LSB_Quotation', 'LSB_Bidding_strategy', 'LSB_Bidding_action_plan', 'LSB_Result_Lesson'],
    message: Bidding_enabled_() ? '' : 'Module Đấu thầu không dùng trong bản Project (các bảng thầu không có trong Google Sheet).'
  };
}

function Bidding_requireEnabled_() {
  if (!Bidding_enabled_()) throw AppError_('MODULE_DISABLED', Bidding_status_().message);
}

function Bidding_fail_(field, message) {
  throw AppError_('VALIDATION', field + ': ' + message, [{ field: field, message: message }]);
}

/* ------------------------------ Việc thầu dùng chung ------------------------------ */

/** Tên cột ngày/trạng thái của từng bảng việc. */
var BIDDING_TASK_FIELDS = {
  LSB_Lead_Qualifying: { pk: 'Qualification_id', start: 'Qual_Start_day', due: 'Qual_Due_day', done: 'Qual_Done_day', status: 'Qual_Status', owner: 'Assessor_id' },
  LSB_Bidding_action_plan: { pk: 'Action_id', start: 'Start_day', due: 'Due_day', done: 'Done_day', status: 'Status', owner: 'Owner_id' }
};

/** Chuẩn hóa 1 dòng việc để hiển thị (tên đầu việc, người phụ trách, trễ hạn, Stage). */
function Bidding_decorateTask_(t, taskCat, staff, today, kind) {
  var F = kind === 'Qualifying' ? BIDDING_TASK_FIELDS.LSB_Lead_Qualifying : BIDDING_TASK_FIELDS.LSB_Bidding_action_plan;
  var cat = taskCat[t.Task_id] || {};
  t.Kind = kind;
  t.Task_duty = t.Task_duty || cat.Task_duty || '';
  t.Phase_calc = cat.Phase || '';
  t.Owner_calc = t[F.owner] || '';
  t.Owner_name = staff[t[F.owner]] || '';
  t.Start_calc = t[F.start] || ''; t.Due_calc = t[F.due] || ''; t.Done_calc = t[F.done] || ''; t.Status_calc = t[F.status] || '';
  t.Overdue = t.Status_calc !== 'Done' && !!t.Due_calc && t.Due_calc < today;
  if (kind === 'Action') t.Stage_calc = Utils_isBlank_(t.Quotation_code) ? 'Qualify' : 'Quotation';
  return t;
}

/** Mặc định chung cho việc: Due từ ngày chuẩn, Done → ngày xong, Status, người phụ trách. */
function Bidding_taskDefaults_(table, rec, ctx) {
  var F = BIDDING_TASK_FIELDS[table];
  var cat = Data_find_('LSB_Task', rec.Task_id);
  if (cat && rec[F.start] && Utils_isBlank_(rec[F.due]) && Utils_num_(cat.Std_duration_days) > 0) {
    rec[F.due] = Utils_addDays_(rec[F.start], Utils_num_(cat.Std_duration_days));
    ctx.warnings.push(F.due + ' tự tính = ' + F.start + ' + ' + cat.Std_duration_days + ' ngày chuẩn.');
  }
  if (Utils_isBlank_(rec[F.status])) rec[F.status] = 'Not started';
  if (rec[F.status] === 'Done' && Utils_isBlank_(rec[F.done])) {
    var today = Utils_today_();
    rec[F.done] = rec[F.start] && rec[F.start] > today ? rec[F.start] : today;   // không sớm hơn ngày bắt đầu
  }
  if (!Utils_isBlank_(rec[F.done]) && rec[F.status] !== 'Done') ctx.warnings.push('Đã có ' + F.done + ' nhưng trạng thái chưa là Done.');
  if (ctx.isNew && Utils_isBlank_(rec[F.owner]) && ctx.user) rec[F.owner] = ctx.user.staffId;
  var phases = TASK_PHASE_FILTER[table];
  if (cat && phases && phases.indexOf(cat.Phase) < 0) {
    ctx.warnings.push('Đầu việc ' + cat.Task_id + ' thuộc giai đoạn ' + (cat.Phase || '—') + ' (bảng này dùng: ' + phases.join(' / ') + ').');
  }
  if (cat && String(cat.Active).toUpperCase() === 'N' && ctx.isNew) ctx.warnings.push('Đầu việc ' + cat.Task_id + ' đang ngưng sử dụng (Active = N).');
}

/**
 * Danh sách việc thầu (đánh giá lead + kế hoạch hành động) gộp một bảng.
 * p: { mine, open (chưa Done), lead, quotation }
 */
function Bidding_tasks_(p, user) {
  Bidding_requireEnabled_();
  p = p || {};
  var today = Utils_today_();
  var staff = Project_nameMap_('LSB_Staff');
  var taskCat = Utils_indexBy_(Data_all_('LSB_Task'), 'Task_id');
  var leads = Utils_indexBy_(Data_all_('LSB_Lead'), 'Lead_id');
  var rows = [];
  Data_all_('LSB_Lead_Qualifying').forEach(function (t) {
    t = Bidding_decorateTask_(t, taskCat, staff, today, 'Qualifying');
    t.Table = 'LSB_Lead_Qualifying'; t.Id = t.Qualification_id; rows.push(t);
  });
  Data_all_('LSB_Bidding_action_plan').forEach(function (t) {
    t = Bidding_decorateTask_(t, taskCat, staff, today, 'Action');
    t.Table = 'LSB_Bidding_action_plan'; t.Id = t.Action_id; rows.push(t);
  });
  rows.forEach(function (t) { t.Company_name = (leads[t.Lead_id] || {}).Company_name || ''; });
  if (p.mine && user) rows = rows.filter(function (t) { return t.Owner_calc === user.staffId; });
  if (p.open) rows = rows.filter(function (t) { return t.Status_calc !== 'Done'; });
  if (p.lead) rows = rows.filter(function (t) { return t.Lead_id === p.lead; });
  if (p.quotation) rows = rows.filter(function (t) { return t.Quotation_code === p.quotation; });
  rows.sort(function (a, b) {
    return (b.Overdue - a.Overdue) || String(a.Due_calc || '9999').localeCompare(String(b.Due_calc || '9999'));
  });
  return { rows: rows, total: rows.length, overdue: rows.filter(function (t) { return t.Overdue; }).length };
}

/* ------------------------------ Quy tắc nghiệp vụ ------------------------------ */

function Bidding_hooks_() {
  return {
    LSB_Lead_Qualifying: {
      beforeSave: function (rec, ctx) { Bidding_taskDefaults_('LSB_Lead_Qualifying', rec, ctx); },
      afterSave: function (saved, ctx) {
        var lead = Data_find_('LSB_Lead', saved.Lead_id);
        if (lead && (Utils_isBlank_(lead.Lead_status) || lead.Lead_status === 'New')) {
          Data_update_('LSB_Lead', lead.Lead_id, { Lead_status: 'Qualifying' });
          Activity_log_(ctx.user, 'Update', 'LSB_Lead', lead.Lead_id, lead, Data_find_('LSB_Lead', lead.Lead_id), 'tự động khi thêm việc đánh giá lead');
          ctx.warnings.push('Lead ' + lead.Lead_id + ' chuyển Lead_status = Qualifying.');
        }
        if (saved.Qual_Status === 'Done' && lead && lead.Lead_status !== 'Qualified' && lead.Lead_status !== 'Converted') {
          var open = Data_all_('LSB_Lead_Qualifying').filter(function (q) { return q.Lead_id === saved.Lead_id && q.Qual_Status !== 'Done'; }).length;
          if (!open) ctx.warnings.push('Đã xong mọi việc đánh giá lead ' + saved.Lead_id + ' — cập nhật Lead_status (Qualified / Nurture / Disqualified).');
        }
      }
    },
    LSB_Bidding_action_plan: {
      beforeSave: function (rec, ctx) {
        var q = Utils_isBlank_(rec.Quotation_code) ? null : Data_find_('LSB_Quotation', rec.Quotation_code);
        if (q && Utils_isBlank_(rec.Lead_id)) rec.Lead_id = q.Lead_id;
        if (q && rec.Lead_id && q.Lead_id !== rec.Lead_id) {
          Bidding_fail_('Quotation_code', 'báo giá ' + q.Quotation_code + ' thuộc lead ' + q.Lead_id + ', không phải ' + rec.Lead_id);
        }
        Bidding_taskDefaults_('LSB_Bidding_action_plan', rec, ctx);
      }
    },
    LSB_Result_Lesson: {
      beforeSave: function (rec, ctx) {
        if (Utils_isBlank_(rec.Result_day) && ctx.isNew) rec.Result_day = Utils_today_();
        if (rec.Result === 'Won' && !Utils_isBlank_(rec.Winner)) ctx.warnings.push('Result = Won nhưng có ghi Winner (đơn vị thắng) — kiểm tra lại.');
      },
      afterSave: function (saved, ctx) {
        var map = { Won: 'Won', Lost: 'Lost', Cancelled: 'Cancelled' };
        var q = Data_find_('LSB_Quotation', saved.Quotation_code);
        var target = map[saved.Result];
        if (q && target && q.Status !== target) {
          Data_update_('LSB_Quotation', q.Quotation_code, { Status: target });
          Activity_log_(ctx.user, 'Update', 'LSB_Quotation', q.Quotation_code, q, Data_find_('LSB_Quotation', q.Quotation_code), 'tự động theo kết quả thầu ' + saved.Result_id);
          ctx.warnings.push('Báo giá ' + q.Quotation_code + ' chuyển Status = ' + target + '.');
        }
        if (saved.Result === 'Won' && q && !Quotation_projectFor_(q)) {
          ctx.warnings.push('Thắng thầu: tạo Khách hàng (từ lead ' + q.Lead_id + ') và Dự án với ' + PROJECT_QUOTE_COL + ' = ' + (q.Quotation_LSB_Code || '(chưa có Quotation_LSB_Code)') + '.');
        }
      }
    }
  };
}
