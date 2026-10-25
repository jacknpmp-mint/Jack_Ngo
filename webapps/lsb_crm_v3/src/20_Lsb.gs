/**
 * 20_Lsb.gs — Nghiệp vụ riêng LSB CRM · Bidding · Project (DB v4.6, 16 bảng). Kế thừa quy tắc v2.2 / v2.6.
 * Khai báo trong tools/app_spec.json › providers: hooks Lsb_hooks_, routes Lsb_routes_, related Lsb_related_,
 * extra360 Lsb_extra360_, checks Lsb_checks_; dashboard.providers Lsb_board_.
 *
 * Quy tắc (chặn lưu = AppError VALIDATION; còn lại là cảnh báo, vẫn lưu):
 *  Lead        Created_day mặc định hôm nay; đã có khách hàng mà rời Converted → cảnh báo.
 *  Việc        (Lead_Qualifying / Bidding_action_plan / Project_task) Due = Start + Std_duration_days của đầu việc chuẩn;
 *              Done → ngày xong; đầu việc sai giai đoạn / ngưng dùng → cảnh báo.
 *              Thêm việc đánh giá cho lead New → Qualifying.
 *  Action plan Chọn báo giá → tự điền Lead_id; báo giá phải cùng lead (chặn).
 *  Result      Result_day mặc định hôm nay; Won/Lost/Cancelled → đồng bộ LSB_Quotation.Status (ghi nhật ký);
 *              Won mà Project_id trống → tự điền dự án có Quotation_LSB-Code = mã nội bộ của báo giá.
 *  Customer    Tự điền Nation / Contact / Account_owner từ lead; lưu xong → lead Converted. (1 lead ≤ 1 KH: cột unique)
 *  Project     Closed cần ≥ 1 bài học (chặn); mã báo giá nội bộ không khớp / chưa Won / khác lead → cảnh báo.
 *  Lesson, đợt TT  Lô hàng phải cùng dự án (chặn).
 *  Đợt TT      Payment_USD = % × Contract_USD khi để trống; tổng % > 100% → cảnh báo.
 *  Đã thu      Tổng đã thu vượt đợt → cảnh báo.
 * Số liệu Dashboard / 360° tính lại từ dữ liệu gốc (không dùng cột công thức Collected/Balance/Pay_status/Year).
 */

var LSB_QUOTE_COL = 'Quotation_LSB-Code';
var LSB_OPEN_Q = ['Draft', 'Submitted', 'Negotiating'];
var LSB_TASK_FIELDS = {
  LSB_Lead_Qualifying: { start: 'Qual_Start_day', due: 'Qual_Due_day', done: 'Qual_Done_day', status: 'Qual_Status', phases: ['Lead Qualification'] },
  LSB_Bidding_action_plan: { start: 'Start_day', due: 'Due_day', done: 'Done_day', status: 'Status', phases: ['Lead Qualification', 'Bidding'] },
  LSB_Project_task: { start: 'Start_day', due: 'Due_day', done: 'Done_day', status: 'Status', phases: ['Contracting', 'Execution', 'Payment'] }
};

function Lsb_fail_(field, vi, en) {
  var m = L_(vi, en);
  throw AppError_('VALIDATION', field + ': ' + m, [{ field: field, message: m }]);
}
function Lsb_key_(v) { return String(v === null || v === undefined ? '' : v).trim().toLowerCase(); }

/** Báo giá có Quotation_LSB_Code = code (so không phân biệt hoa thường / khoảng trắng). */
function Lsb_quotesByLsbCode_(code) {
  var k = Lsb_key_(code);
  if (!k) return [];
  return Data_all_('LSB_Quotation').filter(function (q) { return Lsb_key_(q.Quotation_LSB_Code) === k; });
}
function Lsb_projectsByLsbCode_(code) {
  var k = Lsb_key_(code);
  if (!k) return [];
  return Data_all_('LSB_project').filter(function (p) { return Lsb_key_(p[LSB_QUOTE_COL]) === k; });
}

/** Trạng thái đợt thanh toán — cùng logic cột Pay_status trong Sheet (Paid → Overdue → Partial → Open). */
function Lsb_payStatus_(plan, collected, today) {
  var amount = Utils_num_(plan.Payment_USD), balance = amount - collected;
  if (amount > 0 && balance <= 0) return 'Paid';
  if (plan.Due_day && plan.Due_day < today) return 'Overdue';
  if (collected > 0) return 'Partial';
  return 'Open';
}

/** Đợt thanh toán kèm Collected_calc / Balance_calc / Status_calc (tính lại từ LSB_paid). */
function Lsb_plans_(projectId) {
  var today = Utils_today_();
  var paidByPlan = Utils_groupBy_(Data_all_('LSB_paid'), 'PaymentPlan_id');
  return Data_all_('LSB_payment_plan').filter(function (p) { return !projectId || p.Project_id === projectId; }).map(function (p) {
    var col = Utils_sum_(paidByPlan[p.PaymentPlan_id] || [], 'Paid_USD');
    p.Collected_calc = col;
    p.Balance_calc = Utils_num_(p.Payment_USD) - col;
    p.Status_calc = Lsb_payStatus_(p, col, today);
    return p;
  });
}

function Lsb_nameMap_(table) {
  var def = SCHEMA[table], m = {};
  Data_all_(table).forEach(function (r) { m[r[def.pk]] = r[def.display]; });
  return m;
}

/* ================================ Quy tắc ================================ */

/** Mặc định chung cho bảng việc. */
function Lsb_taskDefaults_(table, rec, ctx) {
  var F = LSB_TASK_FIELDS[table];
  var cat = Data_find_('LSB_Task', rec.Task_id);
  if (cat && rec[F.start] && Utils_isBlank_(rec[F.due]) && Utils_num_(cat.Std_duration_days) > 0) {
    rec[F.due] = Utils_addDays_(rec[F.start], Utils_num_(cat.Std_duration_days));
    ctx.warnings.push(F.due + L_(' tự tính = ', ' auto-calculated = ') + F.start + ' + ' + cat.Std_duration_days + L_(' ngày chuẩn.', ' standard days.'));
  }
  if (Utils_isBlank_(rec[F.status]) && ctx.isNew) rec[F.status] = 'Not started';
  if (rec[F.status] === 'Done' && Utils_isBlank_(rec[F.done])) {
    var today = Utils_today_();
    rec[F.done] = rec[F.start] && rec[F.start] > today ? rec[F.start] : today;
  }
  if (!Utils_isBlank_(rec[F.done]) && rec[F.status] !== 'Done') {
    ctx.warnings.push(L_('Đã có ', 'There is a ') + F.done + L_(' nhưng trạng thái chưa là Done.', ' but the status is not Done.'));
  }
  if (cat && F.phases.indexOf(cat.Phase) < 0) {
    ctx.warnings.push(L_('Đầu việc ', 'Standard task ') + cat.Task_id + L_(' thuộc giai đoạn ', ' belongs to phase ') + (cat.Phase || '—') +
      L_(' (bảng này dùng: ', ' (this table uses: ') + F.phases.join(' / ') + ').');
  }
  if (cat && String(cat.Active).toUpperCase() === 'N' && ctx.isNew) {
    ctx.warnings.push(L_('Đầu việc ', 'Standard task ') + cat.Task_id + L_(' đang ngưng sử dụng (Active = N).', ' is inactive (Active = N).'));
  }
}

function Lsb_checkShipmentSameProject_(rec) {
  if (Utils_isBlank_(rec.Shipping_id)) return;
  var s = Data_find_('LSB_shipment', rec.Shipping_id);
  if (s && s.Project_id !== rec.Project_id) {
    Lsb_fail_('Shipping_id', 'lô ' + rec.Shipping_id + ' thuộc dự án ' + s.Project_id + ', không phải ' + rec.Project_id,
      'shipment ' + rec.Shipping_id + ' belongs to project ' + s.Project_id + ', not ' + rec.Project_id);
  }
}

function Lsb_setLeadStatus_(leadId, status, ctx, note) {
  var lead = Data_find_('LSB_Lead', leadId);
  if (!lead || lead.Lead_status === status) return;
  Data_update_('LSB_Lead', leadId, { Lead_status: status });
  Activity_log_(ctx.user, 'Update', 'LSB_Lead', leadId, lead, Data_find_('LSB_Lead', leadId), note);
  ctx.warnings.push('Lead ' + leadId + L_(' chuyển Lead_status = ', ' switched to Lead_status = ') + status + '.');
}

function Lsb_hooks_() {
  return {
    LSB_Lead: {
      beforeSave: function (rec, ctx) {
        if (ctx.isNew && Utils_isBlank_(rec.Created_day)) rec.Created_day = Utils_today_();
        if (!ctx.isNew && ctx.old && ctx.old.Lead_status === 'Converted' && rec.Lead_status !== 'Converted') {
          var has = Data_all_('LSB_Customer').some(function (c) { return c.Lead_id === rec.Lead_id; });
          if (has) ctx.warnings.push(L_('Lead đã có khách hàng nhưng Lead_status không còn là Converted.', 'The lead already has a customer but Lead_status is no longer Converted.'));
        }
      }
    },

    LSB_Lead_Qualifying: {
      beforeSave: function (rec, ctx) { Lsb_taskDefaults_('LSB_Lead_Qualifying', rec, ctx); },
      afterSave: function (saved, ctx) {
        var lead = Data_find_('LSB_Lead', saved.Lead_id);
        if (lead && (Utils_isBlank_(lead.Lead_status) || lead.Lead_status === 'New')) {
          Lsb_setLeadStatus_(lead.Lead_id, 'Qualifying', ctx, L_('tự động khi thêm việc đánh giá lead', 'automatic when a qualification task was added'));
        }
        if (saved.Qual_Status === 'Done' && lead && ['Qualified', 'Converted', 'Disqualified', 'Nurture'].indexOf(lead.Lead_status) < 0) {
          var open = Data_all_('LSB_Lead_Qualifying').filter(function (q) { return q.Lead_id === saved.Lead_id && q.Qual_Status !== 'Done'; }).length;
          if (!open) ctx.warnings.push(L_('Đã xong mọi việc đánh giá lead ', 'All qualification tasks are done for lead ') + saved.Lead_id +
            L_(' — cập nhật Lead_status (Qualified / Nurture / Disqualified).', ' — update Lead_status (Qualified / Nurture / Disqualified).'));
        }
      }
    },

    LSB_Bidding_action_plan: {
      beforeSave: function (rec, ctx) {
        var q = Utils_isBlank_(rec.Quotation_code) ? null : Data_find_('LSB_Quotation', rec.Quotation_code);
        if (q && Utils_isBlank_(rec.Lead_id)) rec.Lead_id = q.Lead_id;
        if (q && rec.Lead_id && q.Lead_id !== rec.Lead_id) {
          Lsb_fail_('Quotation_code', 'báo giá ' + q.Quotation_code + ' thuộc lead ' + q.Lead_id + ', không phải ' + rec.Lead_id,
            'quotation ' + q.Quotation_code + ' belongs to lead ' + q.Lead_id + ', not ' + rec.Lead_id);
        }
        Lsb_taskDefaults_('LSB_Bidding_action_plan', rec, ctx);
      }
    },

    LSB_Quotation: {
      beforeSave: function (rec, ctx) {
        if (ctx.isNew && Utils_isBlank_(rec.Issue_day)) rec.Issue_day = Utils_today_();
        if (LSB_OPEN_Q.indexOf(rec.Status) >= 0 && Utils_isBlank_(rec.Win_probability)) {
          ctx.warnings.push(L_('Chưa có Win_probability — báo giá không vào pipeline có trọng số.', 'No Win_probability yet — the quotation is left out of the weighted pipeline.'));
        }
      }
    },

    LSB_Result_Lesson: {
      beforeSave: function (rec, ctx) {
        if (ctx.isNew && Utils_isBlank_(rec.Result_day)) rec.Result_day = Utils_today_();
        if (rec.Result === 'Won' && !Utils_isBlank_(rec.Winner)) ctx.warnings.push(L_('Result = Won nhưng có ghi Winner (đơn vị thắng) — kiểm tra lại.', 'Result = Won but Winner is filled in — please check.'));
        var q = Data_find_('LSB_Quotation', rec.Quotation_code);
        if (rec.Result === 'Won' && q && Utils_isBlank_(rec.Project_id)) {
          var ps = Lsb_projectsByLsbCode_(q.Quotation_LSB_Code);
          if (ps.length === 1) {
            rec.Project_id = ps[0].Project_id;
            ctx.warnings.push(L_('Project_id tự điền = ', 'Project_id auto-filled = ') + rec.Project_id + L_(' (dự án có cùng mã báo giá nội bộ).', ' (project with the same internal quotation code).'));
          }
        }
        if (q && !Utils_isBlank_(rec.Project_id)) {
          var p = Data_find_('LSB_project', rec.Project_id);
          if (p && Lsb_key_(p[LSB_QUOTE_COL]) && Lsb_key_(p[LSB_QUOTE_COL]) !== Lsb_key_(q.Quotation_LSB_Code)) {
            ctx.warnings.push(L_('Dự án ', 'Project ') + p.Project_id + ' ' + LSB_QUOTE_COL + ' = ' + p[LSB_QUOTE_COL] +
              L_(' khác mã nội bộ của báo giá (', ' differs from the quotation internal code (') + (q.Quotation_LSB_Code || '—') + ').');
          }
        }
      },
      afterSave: function (saved, ctx) {
        var target = { Won: 'Won', Lost: 'Lost', Cancelled: 'Cancelled' }[saved.Result];
        var q = Data_find_('LSB_Quotation', saved.Quotation_code);
        if (q && target && q.Status !== target) {
          Data_update_('LSB_Quotation', q.Quotation_code, { Status: target });
          Activity_log_(ctx.user, 'Update', 'LSB_Quotation', q.Quotation_code, q, Data_find_('LSB_Quotation', q.Quotation_code),
            L_('tự động theo kết quả thầu ', 'automatic from bid result ') + saved.Result_id);
          ctx.warnings.push(L_('Báo giá ', 'Quotation ') + q.Quotation_code + L_(' chuyển Status = ', ' switched to Status = ') + target + '.');
        }
        if (saved.Result === 'Won' && q && !Lsb_projectsByLsbCode_(q.Quotation_LSB_Code).length) {
          ctx.warnings.push(L_('Thắng thầu: tạo Khách hàng (từ lead ', 'Bid won: create the Customer (from lead ') + q.Lead_id +
            L_(') và Dự án với ', ') and the Project with ') + LSB_QUOTE_COL + ' = ' + (q.Quotation_LSB_Code || L_('(báo giá chưa có Quotation_LSB_Code)', '(quotation has no Quotation_LSB_Code)')) + '.');
        }
      }
    },

    LSB_Customer: {
      beforeSave: function (rec) {
        var lead = Data_find_('LSB_Lead', rec.Lead_id);
        if (!lead) return;
        if (Utils_isBlank_(rec.Nation)) rec.Nation = lead.Nation;
        if (Utils_isBlank_(rec.Contact)) rec.Contact = lead.Contact_name;
        if (Utils_isBlank_(rec.Account_owner_id)) rec.Account_owner_id = lead.Owner_id;
      },
      afterSave: function (saved, ctx) {
        Lsb_setLeadStatus_(saved.Lead_id, 'Converted', ctx, L_('tự động khi tạo khách hàng', 'automatic when the customer was created'));
      }
    },

    LSB_project: {
      beforeSave: function (rec, ctx) {
        if (rec.Status === 'Closed') {
          if (ctx.isNew) Lsb_fail_('Status', 'dự án mới chưa thể Closed', 'a new project cannot be Closed');
          var n = Data_all_('LSB_Project_handover_lesson').filter(function (l) { return l.Project_id === rec.Project_id; }).length;
          if (!n) Lsb_fail_('Status', 'chỉ được Closed khi dự án có ít nhất 1 bài học bàn giao (LSB_Project_handover_lesson)',
            'can only be Closed when the project has at least 1 handover lesson (LSB_Project_handover_lesson)');
        }
        if (Utils_isBlank_(rec.Contract_day)) ctx.warnings.push(L_('Chưa có Contract_day — dự án chưa được tính vào năm/quý.', 'No Contract_day yet — the project is not counted in any year/quarter.'));
        var code = rec[LSB_QUOTE_COL];
        var changed = ctx.isNew || !ctx.old || Lsb_key_(ctx.old[LSB_QUOTE_COL]) !== Lsb_key_(code);
        if (!Utils_isBlank_(code) && changed) {
          var qs = Lsb_quotesByLsbCode_(code);
          var q = qs.filter(function (x) { return x.Status === 'Won'; })[0] || qs[0];
          if (!q) ctx.warnings.push(LSB_QUOTE_COL + L_(': chưa có báo giá nào có Quotation_LSB_Code = ', ': no quotation has Quotation_LSB_Code = ') + code + L_(' (vẫn lưu).', ' (saved anyway).'));
          if (q && q.Status !== 'Won') ctx.warnings.push(L_('Báo giá ', 'Quotation ') + q.Quotation_code + ' (' + code + L_(') đang ở trạng thái ', ') has status ') + (q.Status || '—') + L_(' — dự án nên gắn báo giá Won.', ' — a project should link a Won quotation.'));
          if (q && !Utils_isBlank_(rec.Customer_id)) {
            var cus = Data_find_('LSB_Customer', rec.Customer_id);
            if (cus && cus.Lead_id && cus.Lead_id !== q.Lead_id) ctx.warnings.push(L_('Báo giá ', 'Quotation ') + q.Quotation_code + L_(' thuộc lead ', ' belongs to lead ') + q.Lead_id +
              L_(', còn khách hàng ', ', but customer ') + cus.Customer_id + L_(' đến từ lead ', ' comes from lead ') + cus.Lead_id + '.');
          }
        }
      }
    },

    LSB_Project_task: {
      beforeSave: function (rec, ctx) { Lsb_taskDefaults_('LSB_Project_task', rec, ctx); }
    },

    LSB_Project_handover_lesson: {
      beforeSave: function (rec) { Lsb_checkShipmentSameProject_(rec); }
    },

    LSB_payment_plan: {
      beforeSave: function (rec, ctx) {
        Lsb_checkShipmentSameProject_(rec);
        var project = Data_find_('LSB_project', rec.Project_id);
        if (project && Utils_isBlank_(rec.Payment_USD) && !Utils_isBlank_(rec.Payment_pct) && Utils_num_(project.Contract_USD)) {
          rec.Payment_USD = Math.round(Utils_num_(project.Contract_USD) * Utils_num_(rec.Payment_pct) * 100) / 100;
          ctx.warnings.push(L_('Payment_USD tự tính = % × Contract_USD.', 'Payment_USD auto-calculated = % × Contract_USD.'));
          if (Utils_isBlank_(rec.Payment_VND)) rec.Payment_VND = Math.round(rec.Payment_USD * Data_const_('FX_USD_VND'));
        }
        var total = Data_all_('LSB_payment_plan').filter(function (p) {
          return p.Project_id === rec.Project_id && p.PaymentPlan_id !== rec.PaymentPlan_id;
        }).reduce(function (s, p) { return s + Utils_num_(p.Payment_pct); }, 0) + Utils_num_(rec.Payment_pct);
        if (total > 1.0001) ctx.warnings.push(L_('Tổng Payment_pct của dự án là ', 'Total Payment_pct for the project is ') + Math.round(total * 100) + '% (> 100%).');
      }
    },

    LSB_paid: {
      beforeSave: function (rec, ctx) {
        var plan = Data_find_('LSB_payment_plan', rec.PaymentPlan_id);
        if (!plan) return;
        var others = Data_all_('LSB_paid').filter(function (x) { return x.PaymentPlan_id === rec.PaymentPlan_id && x.Paid_id !== rec.Paid_id; });
        var total = Utils_sum_(others, 'Paid_USD') + Utils_num_(rec.Paid_USD);
        if (Utils_num_(plan.Payment_USD) && total > Utils_num_(plan.Payment_USD) + 0.005) {
          ctx.warnings.push(L_('Tổng đã thu ', 'Total collected ') + total + L_(' USD vượt đợt ', ' USD exceeds milestone ') + plan.PaymentPlan_id + ' (' + plan.Payment_USD + ' USD).');
        }
      }
    }
  };
}

/** Không có API riêng (Dashboard qua DASHBOARD.providers, 360° qua ENTITY_EXTRA_PROVIDERS). */
function Lsb_routes_() { return {}; }

/** Giá trị tính sẵn cho form tự điền (record.related). */
function Lsb_related_(table, r) {
  if (table === 'LSB_payment_plan') {
    var p = Lsb_plans_(r.Project_id).filter(function (x) { return x.PaymentPlan_id === r.PaymentPlan_id; })[0];
    return p ? { Collected_calc: p.Collected_calc, Balance_calc: p.Balance_calc } : {};
  }
  if (table === 'LSB_Quotation') {
    var ps = Lsb_projectsByLsbCode_(r.Quotation_LSB_Code);
    return { Project_calc: ps.length === 1 ? ps[0].Project_id : '' };
  }
  return {};
}

/* ================================ Dự án 360° ================================ */

function Lsb_extra360_(table, rec) {
  if (table === 'LSB_project') return { project360: Lsb_project360_(rec) };
  return {};
}

function Lsb_project360_(project) {
  var id = project.Project_id, today = Utils_today_();
  var staff = Lsb_nameMap_('LSB_Staff');
  var taskCat = Utils_indexBy_(Data_all_('LSB_Task'), 'Task_id');
  var customer = Data_find_('LSB_Customer', project.Customer_id);
  var lead = customer ? Data_find_('LSB_Lead', customer.Lead_id) : null;
  var tasks = Data_all_('LSB_Project_task').filter(function (t) { return t.Project_id === id; }).map(function (t) {
    var cat = taskCat[t.Task_id] || {};
    t.Phase = t.Phase || cat.Phase || ''; t.Task_duty = t.Task_duty || cat.Task_duty || '';
    t.Owner_name = staff[t.Owner_id] || '';
    t.Overdue = t.Status !== 'Done' && !!t.Due_day && t.Due_day < today;
    t.Missing = Form_missing_('LSB_Project_task', t);
    return t;
  }).sort(function (a, b) { return String(a.Start_day).localeCompare(String(b.Start_day)); });
  var shipments = Data_all_('LSB_shipment').filter(function (s) { return s.Project_id === id; }).map(function (s) {
    s.Delay_calc = Utils_daysBetween_(s.ETD_plan, s.ETD_actual);
    s.Missing = Form_missing_('LSB_shipment', s);
    return s;
  }).sort(function (a, b) { return Utils_num_(a.Shipment_no) - Utils_num_(b.Shipment_no); });
  var plans = Lsb_plans_(id).map(function (p) { p.Missing = Form_missing_('LSB_payment_plan', p); return p; })
    .sort(function (a, b) { return String(a.Due_day).localeCompare(String(b.Due_day)); });
  var planIdx = Utils_indexBy_(plans, 'PaymentPlan_id');
  var paid = Data_all_('LSB_paid').filter(function (x) { return planIdx[x.PaymentPlan_id]; }).map(function (x) {
    x.Payment_code = planIdx[x.PaymentPlan_id].Payment_code || ''; x.Missing = Form_missing_('LSB_paid', x); return x;
  });
  var costs = Data_all_('LSB_cost').filter(function (c) { return c.Project_id === id; }).map(function (c) { c.Missing = Form_missing_('LSB_cost', c); return c; });
  var lessons = Data_all_('LSB_Project_handover_lesson').filter(function (l) { return l.Project_id === id; }).map(function (l) {
    l.Recorded_name = staff[l.Recorded_by] || ''; l.Missing = Form_missing_('LSB_Project_handover_lesson', l); return l;
  });
  var qs = Lsb_quotesByLsbCode_(project[LSB_QUOTE_COL]);
  var q = qs.filter(function (x) { return x.Status === 'Won'; })[0] || qs[0] || null;
  var contract = Utils_num_(project.Contract_USD), collected = Utils_sum_(paid, 'Paid_USD');
  var costAct = Utils_sum_(costs.filter(function (c) { return c.Cost_status !== 'Planned'; }), 'Cost_USD');
  return {
    customer: customer, lead: lead, pmName: staff[project.PM_id] || '',
    quotation: q ? { code: q.Quotation_code, lsbCode: q.Quotation_LSB_Code, status: q.Status, name: q.Project_name, valueUSD: Utils_num_(q.Value_USD) } : null,
    tasks: tasks, shipments: shipments, plans: plans, paid: paid, costs: costs, lessons: lessons,
    kpi: {
      contractUSD: contract, planUSD: Utils_sum_(plans, 'Payment_USD'),
      planPct: plans.reduce(function (s, p) { return s + Utils_num_(p.Payment_pct); }, 0),
      collectedUSD: collected, outstandingUSD: contract - collected,
      overdueUSD: plans.filter(function (p) { return p.Status_calc === 'Overdue'; }).reduce(function (s, p) { return s + p.Balance_calc; }, 0),
      costUSD: Utils_sum_(costs, 'Cost_USD'), costActualUSD: costAct,
      grossProfitUSD: contract - costAct, grossMarginPct: contract ? (contract - costAct) / contract : null,
      tonnageEST: Utils_num_(project.Tonnage_EST), tonnageActual: Utils_num_(project.Tonnage_Actual),
      shippedTon: Utils_sum_(shipments.filter(function (s) { return s.ETD_actual; }), 'Quantity_ton'),
      tasks: tasks.length, tasksDone: tasks.filter(function (t) { return t.Status === 'Done'; }).length,
      tasksOverdue: tasks.filter(function (t) { return t.Overdue; }).length,
      lessons: lessons.length, canClose: lessons.length > 0
    }
  };
}

/* ================================ Dashboard ================================ */

/**
 * Dữ liệu gọn cho Dashboard 5 tab (Tổng quan · Thầu & pipeline · Công nợ · Sản xuất · Khách hàng).
 * Trình duyệt tự lọc (năm/quý, khách hàng, trạng thái, quốc gia), đổi USD/VND và cửa sổ ngày — không gọi lại server.
 */
function Lsb_board_() {
  var leads = Data_all_('LSB_Lead'), leadIdx = Utils_indexBy_(leads, 'Lead_id');
  var taskCat = Utils_indexBy_(Data_all_('LSB_Task'), 'Task_id');
  var duty = function (t) { return t.Task_duty || (taskCat[t.Task_id] || {}).Task_duty || ''; };
  return {
    today: Utils_today_(), fx: Data_const_('FX_USD_VND'), transit: Data_const_('TRANSIT_DAYS'),
    staff: Data_all_('LSB_Staff').map(function (s) { return { id: s.Staff_id, name: s.Full_name }; }),
    leads: leads.map(function (l) {
      return { id: l.Lead_id, name: l.Company_name, nation: l.Nation, seg: l.Industry_segment, src: l.Lead_source, st: l.Lead_status, day: l.Created_day, owner: l.Owner_id };
    }),
    quotes: Data_all_('LSB_Quotation').map(function (q) {
      return { id: q.Quotation_code, lead: q.Lead_id, code: q.Quotation_LSB_Code, name: q.Project_name, usd: Utils_num_(q.Value_USD),
        prob: Utils_isBlank_(q.Win_probability) ? null : Utils_num_(q.Win_probability), day: q.Issue_day, st: q.Status, sales: q.Sales_id, rev: q.Revision_no };
    }),
    results: Data_all_('LSB_Result_Lesson').map(function (r) {
      return { id: r.Result_id, q: r.Quotation_code, res: r.Result, day: r.Result_day, winner: r.Winner, reason: r.Win_loss_reason, pj: r.Project_id };
    }),
    bidTasks: Data_all_('LSB_Lead_Qualifying').map(function (t) {
      return { t: 'LSB_Lead_Qualifying', id: t.Qualification_id, lead: t.Lead_id, q: '', duty: duty(t), owner: t.Assessor_id, due: t.Qual_Due_day, st: t.Qual_Status };
    }).concat(Data_all_('LSB_Bidding_action_plan').map(function (t) {
      return { t: 'LSB_Bidding_action_plan', id: t.Action_id, lead: t.Lead_id, q: t.Quotation_code || '', duty: duty(t), owner: t.Owner_id, due: t.Due_day, st: t.Status };
    })),
    customers: Data_all_('LSB_Customer').map(function (c) {
      var l = leadIdx[c.Lead_id] || {};
      return { id: c.Customer_id, lead: c.Lead_id, name: c.Company_name || l.Company_name || c.Customer_id, nation: c.Nation || l.Nation || '', seg: l.Industry_segment || '' };
    }),
    projects: Data_all_('LSB_project').map(function (p) {
      return { id: p.Project_id, cus: p.Customer_id, code: p.Project_code, qcode: p[LSB_QUOTE_COL], name: p.Project_name || p.Project_id,
        status: p.Status, cday: p.Contract_day, usd: Utils_num_(p.Contract_USD), tEst: Utils_num_(p.Tonnage_EST), tAct: Utils_num_(p.Tonnage_Actual),
        gmE: Utils_isBlank_(p.Grossmargin_EST) ? null : Utils_num_(p.Grossmargin_EST), gmA: Utils_isBlank_(p.Grossmargin_Actual) ? null : Utils_num_(p.Grossmargin_Actual) };
    }),
    shipments: Data_all_('LSB_shipment').map(function (s) {
      return { id: s.Shipping_id, pj: s.Project_id, no: s.Shipment_no, code: s.Shipment_code, t: Utils_num_(s.Quantity_ton), cPlan: s.Container_qty_plan,
        sFab: s.Start_Fab, cFab: s.Completed_Fab, etdP: s.ETD_plan, etdA: s.ETD_actual,
        etaA: s.ETA_actual || (s.ETD_actual ? Utils_addDays_(s.ETD_actual, Data_const_('TRANSIT_DAYS')) : '') };
    }),
    plans: Lsb_plans_().map(function (p) {
      return { id: p.PaymentPlan_id, pj: p.Project_id, sh: p.Shipping_id || '', code: p.Payment_code, pct: Utils_isBlank_(p.Payment_pct) ? null : Utils_num_(p.Payment_pct),
        usd: Utils_num_(p.Payment_USD), docs: p.Required_docs, due: p.Due_day, rev: p.PP_revision, col: p.Collected_calc, bal: Math.max(0, p.Balance_calc), st: p.Status_calc };
    }),
    paid: Data_all_('LSB_paid').map(function (x) { return { id: x.Paid_id, pp: x.PaymentPlan_id, inv: x.Invoice_no, usd: Utils_num_(x.Paid_USD), day: x.Payment_day }; }),
    costs: Data_all_('LSB_cost').map(function (c) { return { pj: c.Project_id, usd: Utils_num_(c.Cost_USD), day: c.Payment_day, st: c.Cost_status }; })
  };
}

/* ============================ Kiểm tra dữ liệu ============================ */

function Lsb_checks_() {
  var out = [];
  function add(level, table, id, column, vi, en) { out.push({ level: level, table: table, id: id, column: column, message: L_(vi, en) }); }
  var projects = Data_all_('LSB_project'), quotes = Data_all_('LSB_Quotation');
  var plansByPj = Utils_groupBy_(Data_all_('LSB_payment_plan'), 'Project_id');
  var costsByPj = Utils_groupBy_(Data_all_('LSB_cost'), 'Project_id');
  var shipByPj = Utils_groupBy_(Data_all_('LSB_shipment'), 'Project_id');
  projects.forEach(function (p) {
    var c = Utils_num_(p.Contract_USD), plans = plansByPj[p.Project_id] || [];
    var plan = Utils_sum_(plans, 'Payment_USD');
    if (plans.length && c && Math.abs(plan - c) > 1) add('warn', 'LSB_project', p.Project_id, 'Contract_USD',
      'Tổng kế hoạch thanh toán ' + Math.round(plan) + ' ≠ giá trị HĐ ' + Math.round(c) + ' USD (' + Math.round(plan / c * 100) + '%)',
      'Payment plan total ' + Math.round(plan) + ' ≠ contract value ' + Math.round(c) + ' USD (' + Math.round(plan / c * 100) + '%)');
    plans.forEach(function (x) {
      if (!Utils_isBlank_(x.Payment_pct) && c && Math.abs(Utils_num_(x.Payment_USD) - c * Utils_num_(x.Payment_pct)) > 1) add('warn', 'LSB_payment_plan', x.PaymentPlan_id, 'Payment_USD',
        'Payment_pct ' + Math.round(Utils_num_(x.Payment_pct) * 100) + '% × HĐ = ' + Math.round(c * Utils_num_(x.Payment_pct)) + ', nhưng Payment_USD = ' + Utils_num_(x.Payment_USD),
        'Payment_pct ' + Math.round(Utils_num_(x.Payment_pct) * 100) + '% × contract = ' + Math.round(c * Utils_num_(x.Payment_pct)) + ', but Payment_USD = ' + Utils_num_(x.Payment_USD));
    });
    var cost = Utils_sum_((costsByPj[p.Project_id] || []).filter(function (x) { return x.Cost_status !== 'Planned'; }), 'Cost_USD');
    if (c && cost > c) add('warn', 'LSB_project', p.Project_id, 'Contract_USD', 'Chi phí thực tế ' + Math.round(cost) + ' > giá trị HĐ ' + Math.round(c) + ' USD',
      'Actual cost ' + Math.round(cost) + ' > contract value ' + Math.round(c) + ' USD');
    var t = Utils_sum_(shipByPj[p.Project_id] || [], 'Quantity_ton');
    if (Utils_num_(p.Tonnage_Actual) && t && Math.abs(t - Utils_num_(p.Tonnage_Actual)) > 0.5) add('warn', 'LSB_project', p.Project_id, 'Tonnage_Actual',
      'Tonnage_Actual ' + p.Tonnage_Actual + ' t ≠ tổng tấn các lô ' + t + ' t', 'Tonnage_Actual ' + p.Tonnage_Actual + ' t ≠ total shipment tons ' + t + ' t');
    var code = p[LSB_QUOTE_COL];
    if (!Utils_isBlank_(code)) {
      var qs = Lsb_quotesByLsbCode_(code);
      if (!qs.length) add('warn', 'LSB_project', p.Project_id, LSB_QUOTE_COL, LSB_QUOTE_COL + ' = ' + code + ' không khớp Quotation_LSB_Code nào trong LSB_Quotation',
        LSB_QUOTE_COL + ' = ' + code + ' matches no Quotation_LSB_Code in LSB_Quotation');
      else if (!qs.some(function (q) { return q.Status === 'Won'; })) add('warn', 'LSB_project', p.Project_id, LSB_QUOTE_COL,
        'Báo giá ' + qs[0].Quotation_code + ' (' + code + ') có Status = ' + (qs[0].Status || '—') + ', chưa Won', 'Quotation ' + qs[0].Quotation_code + ' (' + code + ') has Status = ' + (qs[0].Status || '—') + ', not Won');
    }
  });
  quotes.forEach(function (q) {
    if (q.Status === 'Won' && !Lsb_projectsByLsbCode_(q.Quotation_LSB_Code).length) add('warn', 'LSB_Quotation', q.Quotation_code, 'Status',
      'Đã Won nhưng chưa có dự án mang ' + LSB_QUOTE_COL + ' = ' + (q.Quotation_LSB_Code || '(trống)'), 'Won but no project carries ' + LSB_QUOTE_COL + ' = ' + (q.Quotation_LSB_Code || '(blank)'));
    if (LSB_OPEN_Q.indexOf(q.Status) >= 0 && Utils_isBlank_(q.Win_probability)) add('warn', 'LSB_Quotation', q.Quotation_code, 'Win_probability',
      'Báo giá đang chạy chưa có Win_probability', 'Open quotation has no Win_probability');
  });
  var qIdx = Utils_indexBy_(quotes, 'Quotation_code');
  Data_all_('LSB_Result_Lesson').forEach(function (r) {
    var q = qIdx[r.Quotation_code];
    if (q && ['Won', 'Lost', 'Cancelled'].indexOf(r.Result) >= 0 && q.Status !== r.Result) add('warn', 'LSB_Result_Lesson', r.Result_id, 'Result',
      'Result = ' + r.Result + ' nhưng báo giá ' + q.Quotation_code + ' Status = ' + (q.Status || '—') + ' (lưu lại kết quả để đồng bộ)',
      'Result = ' + r.Result + ' but quotation ' + q.Quotation_code + ' Status = ' + (q.Status || '—') + ' (save the result again to sync)');
  });
  return out;
}
