/**
 * 04_Project.gs — Module Dự án: danh sách, Dự án 360°, Dashboard, quy tắc nghiệp vụ.
 * Bảng: LSB_project, LSB_Project_task, LSB_shipment, LSB_Project_handover_lesson,
 *       LSB_payment_plan, LSB_paid, LSB_cost.
 *
 * Số liệu tài chính được TÍNH LẠI ở server từ dữ liệu gốc (không phụ thuộc cột công
 * thức trong Sheet) để 360°/Dashboard vẫn đúng khi công thức bị hỏng (#REF!).
 */

/* ------------------------------ Tính toán chung ------------------------------ */

/** Trạng thái đợt thanh toán — cùng logic với cột Pay_status trong Sheet. */
function Project_payStatus_(plan, collected, today) {
  var amount = Utils_num_(plan.Payment_USD), balance = amount - collected;
  if (amount > 0 && balance <= 0) return 'Paid';
  if (plan.Due_day && plan.Due_day < today) return 'Overdue';
  if (collected > 0) return 'Partial';
  return 'Open';
}

/** Kế hoạch thanh toán kèm số đã thu / còn lại / trạng thái (tính lại). */
function Project_plansWithCollected_(filterProjectId) {
  var today = Utils_today_();
  var paidByPlan = Utils_groupBy_(Data_all_('LSB_paid'), 'PaymentPlan_id');
  return Data_all_('LSB_payment_plan')
    .filter(function (p) { return !filterProjectId || p.Project_id === filterProjectId; })
    .map(function (p) {
      var collected = Utils_sum_(paidByPlan[p.PaymentPlan_id] || [], 'Paid_USD');
      p.Collected_calc = collected;
      p.Balance_calc = Utils_num_(p.Payment_USD) - collected;
      p.Status_calc = Project_payStatus_(p, collected, today);
      return p;
    });
}

/** Chỉ số tài chính/tiến độ cho từng dự án (map Project_id → kpi). */
function Project_kpis_() {
  var today = Utils_today_();
  var out = {};
  function k(id) {
    return out[id] = out[id] || { planUSD: 0, collectedUSD: 0, overdueUSD: 0, costUSD: 0, shippedTon: 0,
      shipments: 0, tasks: 0, tasksDone: 0, tasksOverdue: 0, lessons: 0 };
  }
  Project_plansWithCollected_().forEach(function (p) {
    var x = k(p.Project_id);
    x.planUSD += Utils_num_(p.Payment_USD);
    x.collectedUSD += p.Collected_calc;
    if (p.Status_calc === 'Overdue') x.overdueUSD += p.Balance_calc;
  });
  Data_all_('LSB_cost').forEach(function (c) { k(c.Project_id).costUSD += Utils_num_(c.Cost_USD); });
  Data_all_('LSB_shipment').forEach(function (s) {
    var x = k(s.Project_id); x.shipments++;
    if (s.ETD_actual) x.shippedTon += Utils_num_(s.Quantity_ton);
  });
  Data_all_('LSB_Project_task').forEach(function (t) {
    var x = k(t.Project_id); x.tasks++;
    if (t.Status === 'Done') x.tasksDone++;
    else if (t.Due_day && t.Due_day < today) x.tasksOverdue++;
  });
  Data_all_('LSB_Project_handover_lesson').forEach(function (l) { k(l.Project_id).lessons++; });
  return out;
}

function Project_nameMap_(table) {
  var def = SCHEMA[table], m = {};
  Data_all_(table).forEach(function (r) { m[r[def.pk]] = r[def.display]; });
  return m;
}

/* --------------------------------- Danh sách --------------------------------- */

/** p: { year, status, pm, q, missing } */
function Project_list_(p) {
  p = p || {};
  var kpi = Project_kpis_();
  var customers = Project_nameMap_('LSB_Customer'), staff = Project_nameMap_('LSB_Staff');
  var rows = Data_all_('LSB_project').map(function (r) {
    var x = kpi[r.Project_id] || {};
    var contract = Utils_num_(r.Contract_USD), cost = x.costUSD || 0;
    return {
      Project_id: r.Project_id, Project_code: r.Project_code, Project_name: r.Project_name,
      Customer_id: r.Customer_id, Customer_name: customers[r.Customer_id] || '',
      PM_id: r.PM_id, PM_name: staff[r.PM_id] || '', Status: r.Status, Incoterm: r.Incoterm,
      Contract_day: r.Contract_day, RAD_date: r.RAD_date, Year: Utils_yearQuarter_(r.Contract_day).year,
      Contract_USD: contract, Collected_USD: x.collectedUSD || 0, Outstanding_USD: contract - (x.collectedUSD || 0),
      Overdue_USD: x.overdueUSD || 0, Cost_USD: cost, GrossProfit_USD: contract - cost,
      Tonnage_EST: r.Tonnage_EST, Shipped_ton: x.shippedTon || 0,
      Tasks: x.tasks || 0, Tasks_done: x.tasksDone || 0, Tasks_overdue: x.tasksOverdue || 0, Lessons: x.lessons || 0,
      Missing: Form_missing_('LSB_project', r)
    };
  });
  if (p.year) rows = rows.filter(function (r) { return String(r.Year) === String(p.year); });
  if (p.status) rows = rows.filter(function (r) { return r.Status === p.status; });
  if (p.pm) rows = rows.filter(function (r) { return r.PM_id === p.pm; });
  if (p.missing) rows = rows.filter(function (r) { return r.Missing.length; });
  if (p.q) {
    var q = String(p.q).toLowerCase();
    rows = rows.filter(function (r) {
      return [r.Project_id, r.Project_code, r.Project_name, r.Customer_name].join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }
  rows.sort(function (a, b) { return String(b.Contract_day).localeCompare(String(a.Contract_day)); });
  return { rows: rows, total: rows.length };
}

/* --------------------------------- Dự án 360° --------------------------------- */

function Project_get360_(id, user) {
  var project = Data_find_('LSB_project', id);
  if (!project) throw AppError_('NOT_FOUND', L_('Không tìm thấy dự án ', 'Project not found: ') + id + '.');
  var today = Utils_today_();
  var staff = Project_nameMap_('LSB_Staff');
  var taskCat = Utils_indexBy_(Data_all_('LSB_Task'), 'Task_id');
  var customer = Data_find_('LSB_Customer', project.Customer_id);
  var lead = customer ? Data_find_('LSB_Lead', customer.Lead_id) : null;

  var tasks = Data_all_('LSB_Project_task').filter(function (t) { return t.Project_id === id; }).map(function (t) {
    var cat = taskCat[t.Task_id] || {};
    t.Phase = t.Phase || cat.Phase || '';
    t.Task_duty = t.Task_duty || cat.Task_duty || '';
    t.Owner_name = staff[t.Owner_id] || '';
    t.Overdue = t.Status !== 'Done' && !!t.Due_day && t.Due_day < today;
    return t;
  }).sort(function (a, b) { return String(a.Start_day).localeCompare(String(b.Start_day)); });

  var shipments = Data_all_('LSB_shipment').filter(function (s) { return s.Project_id === id; }).map(function (s) {
    s.Delay_calc = Utils_daysBetween_(s.ETD_plan, s.ETD_actual);
    return s;
  }).sort(function (a, b) { return Utils_num_(a.Shipment_no) - Utils_num_(b.Shipment_no); });

  var plans = Project_plansWithCollected_(id).sort(function (a, b) { return String(a.Due_day).localeCompare(String(b.Due_day)); });
  var planIds = plans.map(function (p) { return p.PaymentPlan_id; });
  var planCode = Utils_indexBy_(plans, 'PaymentPlan_id');
  var paid = Data_all_('LSB_paid').filter(function (x) { return planIds.indexOf(x.PaymentPlan_id) >= 0; }).map(function (x) {
    x.Payment_code = (planCode[x.PaymentPlan_id] || {}).Payment_code || '';
    return x;
  });
  var costs = Data_all_('LSB_cost').filter(function (c) { return c.Project_id === id; });
  var lessons = Data_all_('LSB_Project_handover_lesson').filter(function (l) { return l.Project_id === id; }).map(function (l) {
    l.Recorded_name = staff[l.Recorded_by] || '';
    return l;
  });

  var contract = Utils_num_(project.Contract_USD);
  var collected = Utils_sum_(paid, 'Paid_USD');
  var cost = Utils_sum_(costs, 'Cost_USD');
  var kpi = {
    contractUSD: contract,
    planUSD: Utils_sum_(plans, 'Payment_USD'),
    planPct: plans.reduce(function (s, p) { return s + Utils_num_(p.Payment_pct); }, 0),
    collectedUSD: collected,
    outstandingUSD: contract - collected,
    overdueUSD: plans.filter(function (p) { return p.Status_calc === 'Overdue'; }).reduce(function (s, p) { return s + p.Balance_calc; }, 0),
    costUSD: cost,
    grossProfitUSD: contract - cost,
    grossMarginPct: contract ? (contract - cost) / contract : null,
    tonnageEST: Utils_num_(project.Tonnage_EST),
    tonnageActual: Utils_num_(project.Tonnage_Actual),
    shippedTon: shipments.filter(function (s) { return s.ETD_actual; }).reduce(function (s, x) { return s + Utils_num_(x.Quantity_ton); }, 0),
    tasks: tasks.length,
    tasksDone: tasks.filter(function (t) { return t.Status === 'Done'; }).length,
    tasksOverdue: tasks.filter(function (t) { return t.Overdue; }).length,
    lessons: lessons.length,
    canClose: lessons.length > 0
  };

  var activity = [];
  if (user && Auth_can_(user, PERMISSION.ACTIVITY_READ)) {
    var ids = [id].concat(tasks.map(function (x) { return x.Project_task_id; }), shipments.map(function (x) { return x.Shipping_id; }),
      planIds, paid.map(function (x) { return x.Paid_id; }), costs.map(function (x) { return x.Cost_id; }),
      lessons.map(function (x) { return x.Lesson_id; }));
    activity = Activity_list_({ recordIds: ids, limit: 50 }).rows;
  }

  project.PM_name = staff[project.PM_id] || '';
  return {
    project: project, customer: customer, lead: lead, quotation: Quotation_lookup_(project[PROJECT_QUOTE_COL]),
    tasks: tasks, shipments: shipments, paymentPlans: plans, paid: paid, costs: costs, lessons: lessons,
    kpi: kpi, activity: activity
  };
}

/* --------------------------------- Dashboard --------------------------------- */

function Project_dashboard_(year) {
  year = Number(year) || new Date().getFullYear();
  var Q = ['Q1', 'Q2', 'Q3', 'Q4'];
  var years = {};
  function blank() { return { Q1: 0, Q2: 0, Q3: 0, Q4: 0, total: 0 }; }
  function add(metric, iso, v) {
    var yq = Utils_yearQuarter_(iso);
    if (yq.year) years[yq.year] = true;
    if (yq.year !== year) return;
    metric[yq.quarter] += v; metric.total += v;
  }
  var m = {
    leads: blank(), customers: blank(), contracts: blank(), contractUSD: blank(),
    collectedUSD: blank(), costUSD: blank(), shippedTon: blank(), lessons: blank(),
    quotations: blank(), quotedUSD: blank(), bidsWon: blank(), bidsLost: blank(), wonUSD: blank()
  };
  Data_all_('LSB_Lead').forEach(function (r) { add(m.leads, r.Created_day, 1); });
  Data_all_('LSB_Customer').forEach(function (r) { add(m.customers, r.First_contract_day, 1); });
  var projects = Data_all_('LSB_project');
  projects.forEach(function (r) { add(m.contracts, r.Contract_day, 1); add(m.contractUSD, r.Contract_day, Utils_num_(r.Contract_USD)); });
  Data_all_('LSB_paid').forEach(function (r) { add(m.collectedUSD, r.Payment_day, Utils_num_(r.Paid_USD)); });
  Data_all_('LSB_cost').forEach(function (r) { add(m.costUSD, r.Invoice_code, Utils_num_(r.Cost_USD)); });
  Data_all_('LSB_shipment').forEach(function (r) { add(m.shippedTon, r.ETD_actual, Utils_num_(r.Quantity_ton)); });
  Data_all_('LSB_Project_handover_lesson').forEach(function (r) { add(m.lessons, r.Handover_day, 1); });

  var bidding = null;
  if (Quotation_enabled_()) {
    var quotes = Data_all_('LSB_Quotation');
    var qIndex = Utils_indexBy_(quotes, 'Quotation_code');
    quotes.forEach(function (r) { add(m.quotations, r.Issue_day, 1); add(m.quotedUSD, r.Issue_day, Utils_num_(r.Value_USD)); });
    var results = Data_all_('LSB_Result_Lesson');
    results.forEach(function (r) {
      if (r.Result === 'Won') { add(m.bidsWon, r.Result_day, 1); add(m.wonUSD, r.Result_day, Utils_num_((qIndex[r.Quotation_code] || {}).Value_USD)); }
      if (r.Result === 'Lost') add(m.bidsLost, r.Result_day, 1);
    });
    var openQ = quotes.filter(function (q) { return QUOTATION_OPEN_STATUS.indexOf(q.Status) >= 0; });
    var decided = m.bidsWon.total + m.bidsLost.total;
    var bidTasks = Bidding_enabled_() ? Bidding_tasks_({ open: true }) : { overdue: 0 };
    bidding = {
      openQuotations: openQ.length,
      pipelineUSD: Utils_sum_(openQ, 'Value_USD'),
      weightedUSD: openQ.reduce(function (s, q) { return s + Utils_num_(q.Value_USD) * Utils_num_(q.Win_probability); }, 0),
      winRate: decided ? m.bidsWon.total / decided : null,
      overdueBidTasks: bidTasks.overdue
    };
  }

  var byStatus = {};
  (LISTS.Project_status || []).forEach(function (s) { byStatus[s] = 0; });
  projects.forEach(function (r) { var s = r.Status || L_('(trống)', '(blank)'); byStatus[s] = (byStatus[s] || 0) + 1; });

  var plans = Project_plansWithCollected_();
  var open = plans.filter(function (p) { return p.Balance_calc > 0; });
  var today = Utils_today_();
  var overdueTasks = Data_all_('LSB_Project_task').filter(function (t) {
    return t.Status !== 'Done' && t.Due_day && t.Due_day < today;
  }).length;

  years[year] = true;
  return {
    year: year, quarters: Q, metrics: m, bidding: bidding, board: Project_board_(plans),
    years: Object.keys(years).map(Number).sort(function (a, b) { return b - a; }),
    snapshot: {
      projectsByStatus: byStatus,
      activeProjects: projects.filter(function (r) { return r.Status && r.Status !== 'Closed'; }).length,
      receivableUSD: open.reduce(function (s, p) { return s + p.Balance_calc; }, 0),
      overdueUSD: open.filter(function (p) { return p.Status_calc === 'Overdue'; }).reduce(function (s, p) { return s + p.Balance_calc; }, 0),
      overduePlans: open.filter(function (p) { return p.Status_calc === 'Overdue'; }).length,
      overdueTasks: overdueTasks
    }
  };
}

/**
 * v2.6: dữ liệu gọn cho Dashboard 4 tab (Tổng quan · Công nợ · Sản xuất · Khách hàng).
 * Trình duyệt tự lọc (kỳ, khách hàng, trạng thái, quốc gia), đổi USD/VND và cửa sổ ngày mà không gọi lại server.
 * Đợt thanh toán mang sẵn Collected/Balance/Pay_status tính lại như cột công thức trong Sheet.
 */
function Project_board_(plans) {
  var leads = Utils_indexBy_(Data_all_('LSB_Lead'), 'Lead_id');
  var paidRows = Data_all_('LSB_paid');
  return {
    today: Utils_today_(),
    fx: APP.FX_USD_VND,
    customers: Data_all_('LSB_Customer').map(function (c) {
      var l = leads[c.Lead_id] || {};
      return { id: c.Customer_id, lead: c.Lead_id, name: c.Company_name || l.Company_name || c.Customer_id,
        nation: c.Nation || l.Nation || '', seg: l.Industry_segment || '' };   // ngành chỉ có ở LSB_Lead
    }),
    projects: Data_all_('LSB_project').map(function (p) {
      return { id: p.Project_id, cus: p.Customer_id, code: p.Project_code, name: p.Project_name || p.Project_id,
        status: p.Status, cday: p.Contract_day, usd: Utils_num_(p.Contract_USD),
        tEst: Utils_num_(p.Tonnage_EST), tAct: Utils_num_(p.Tonnage_Actual),
        gmE: Utils_isBlank_(p.Grossmargin_EST) ? null : Utils_num_(p.Grossmargin_EST),
        gmA: Utils_isBlank_(p.Grossmargin_Actual) ? null : Utils_num_(p.Grossmargin_Actual) };
    }),
    shipments: Data_all_('LSB_shipment').map(function (s) {
      return { id: s.Shipping_id, pj: s.Project_id, no: s.Shipment_no, code: s.Shipment_code,
        t: Utils_num_(s.Quantity_ton), cPlan: s.Container_qty_plan, sFab: s.Start_Fab, cFab: s.Completed_Fab,
        etdP: s.ETD_plan, etdA: s.ETD_actual,
        etaA: s.ETA_actual || (s.ETD_actual ? Utils_addDays_(s.ETD_actual, APP.TRANSIT_DAYS) : '') };
    }),
    plans: plans.map(function (p) {
      return { id: p.PaymentPlan_id, pj: p.Project_id, sh: p.Shipping_id || '', code: p.Payment_code,
        pct: Utils_isBlank_(p.Payment_pct) ? null : Utils_num_(p.Payment_pct), usd: Utils_num_(p.Payment_USD),
        docs: p.Required_docs, due: p.Due_day, rev: p.PP_revision,
        col: p.Collected_calc, bal: Math.max(0, p.Balance_calc), st: p.Status_calc };
    }),
    paid: paidRows.map(function (x) {
      return { id: x.Paid_id, pp: x.PaymentPlan_id, inv: x.Invoice_no, usd: Utils_num_(x.Paid_USD), day: x.Payment_day };
    }),
    costs: Data_all_('LSB_cost').map(function (c) {
      return { pj: c.Project_id, usd: Utils_num_(c.Cost_USD), day: c.Invoice_code, st: c.Cost_status };
    })
  };
}

/* ------------------------------ Quy tắc nghiệp vụ ------------------------------ */

function Project_fail_(field, message) {
  throw AppError_('VALIDATION', field + ': ' + message, [{ field: field, message: message }]);
}

/** Lô hàng (nếu có) phải thuộc cùng dự án — quy tắc 5 & 8. */
function Project_checkShipmentSameProject_(rec) {
  if (Utils_isBlank_(rec.Shipping_id)) return;
  var s = Data_find_('LSB_shipment', rec.Shipping_id);
  if (s && s.Project_id !== rec.Project_id) {
    Project_fail_('Shipping_id', L_('lô ', 'shipment ') + rec.Shipping_id + L_(' thuộc dự án ', ' belongs to project ') + s.Project_id + L_(', không phải ', ', not ') + rec.Project_id);
  }
}

function Project_hooks_() {
  return {
    LSB_project: {
      beforeSave: function (rec, ctx) {
        // Quy tắc 8: chỉ Closed khi có ≥ 1 bài học bàn giao.
        if (rec.Status === 'Closed' && !ctx.isNew) {
          var n = Data_all_('LSB_Project_handover_lesson').filter(function (l) { return l.Project_id === rec.Project_id; }).length;
          if (!n) Project_fail_('Status', L_('chỉ được Closed khi dự án có ít nhất 1 bài học bàn giao (LSB_Project_handover_lesson)', 'can only be Closed when the project has at least 1 handover lesson (LSB_Project_handover_lesson)'));
        }
        if (rec.Status === 'Closed' && ctx.isNew) Project_fail_('Status', L_('dự án mới chưa thể Closed', 'a new project cannot be Closed'));
        if (ctx.isNew && Utils_isBlank_(rec.Status)) rec.Status = 'Kick-off';   // v2.4: Status không còn bắt buộc
        if (Utils_isBlank_(rec.Contract_day)) ctx.warnings.push(L_('Chưa có Contract_day — dự án sẽ không được tính vào Year/Quarter.', 'No Contract_day yet — the project will not count in Year/Quarter.'));
        // v4.3: mã nội bộ báo giá (nhập tay) nên khớp 1 báo giá Won — chỉ cảnh báo khi đổi mã.
        var qc = PROJECT_QUOTE_COL;
        if (!Utils_isBlank_(rec[qc]) && Quotation_enabled_() && (ctx.isNew || !ctx.old || Quotation_key_(ctx.old[qc]) !== Quotation_key_(rec[qc]))) {
          var qs = Quotation_byLsbCode_(rec[qc]);
          var q = qs.filter(function (x) { return x.Status === 'Won'; })[0] || qs[0];
          if (!q) ctx.warnings.push(qc + L_(': chưa có báo giá nào có Quotation_LSB_Code = ', ': no quotation has Quotation_LSB_Code = ') + rec[qc] + L_(' (vẫn lưu).', ' (saved anyway).'));
          if (q && q.Status !== 'Won') ctx.warnings.push(L_('Báo giá ', 'Quotation ') + q.Quotation_code + ' (' + rec[qc] + L_(') đang ở trạng thái ', ') has status ') + (q.Status || '—') + L_(' (dự án nên gắn báo giá Won).', ' (a project should link a Won quotation).'));
          if (q && !Utils_isBlank_(rec.Customer_id)) {
            var cus = Data_find_('LSB_Customer', rec.Customer_id);
            if (cus && cus.Lead_id && cus.Lead_id !== q.Lead_id) ctx.warnings.push(L_('Báo giá ', 'Quotation ') + q.Quotation_code + L_(' thuộc lead ', ' belongs to lead ') + q.Lead_id + L_(', khách hàng ', ', customer ') + cus.Customer_id + L_(' đến từ lead ', ' comes from lead ') + cus.Lead_id + '.');
          }
        }
      }
    },
    LSB_Project_task: {
      beforeSave: function (rec, ctx) {
        var cat = Data_find_('LSB_Task', rec.Task_id);
        if (cat && rec.Start_day && Utils_isBlank_(rec.Due_day) && Utils_num_(cat.Std_duration_days) > 0) {
          rec.Due_day = Utils_addDays_(rec.Start_day, Utils_num_(cat.Std_duration_days));
          ctx.warnings.push(L_('Due_day tự tính = Start_day + ', 'Due_day auto-calculated = Start_day + ') + cat.Std_duration_days + L_(' ngày chuẩn.', ' standard days.'));
        }
        if (rec.Status === 'Done' && Utils_isBlank_(rec.Done_day)) {
          var today = Utils_today_();
          rec.Done_day = rec.Start_day && rec.Start_day > today ? rec.Start_day : today;   // không sớm hơn Start_day
        }
        if (!Utils_isBlank_(rec.Done_day) && rec.Status !== 'Done') ctx.warnings.push(L_('Đã có Done_day nhưng Status chưa là Done.', 'Done_day is set but Status is not Done.'));
        if (Utils_isBlank_(rec.Status)) rec.Status = 'Not started';
      }
    },
    LSB_shipment: {
      beforeSave: function (rec) {
        if (Utils_isBlank_(rec.Shipment_no) && rec.Project_id) {
          var nos = Data_all_('LSB_shipment').filter(function (s) { return s.Project_id === rec.Project_id; })
            .map(function (s) { return Utils_num_(s.Shipment_no); });
          rec.Shipment_no = (nos.length ? Math.max.apply(null, nos) : 0) + 1;
        }
      }
    },
    LSB_Project_handover_lesson: {
      beforeSave: function (rec, ctx) {
        Project_checkShipmentSameProject_(rec);
        if (Utils_isBlank_(rec.Recorded_by) && ctx.user) rec.Recorded_by = ctx.user.staffId;
      }
    },
    LSB_payment_plan: {
      beforeSave: function (rec, ctx) {
        Project_checkShipmentSameProject_(rec);
        var project = Data_find_('LSB_project', rec.Project_id);
        if (project && Utils_isBlank_(rec.Payment_USD) && !Utils_isBlank_(rec.Payment_pct) && Utils_num_(project.Contract_USD)) {
          rec.Payment_USD = Math.round(Utils_num_(project.Contract_USD) * Utils_num_(rec.Payment_pct) * 100) / 100;
          ctx.warnings.push(L_('Payment_USD tự tính theo % × Contract_USD.', 'Payment_USD auto-calculated as % × Contract_USD.'));
        }
        var totalPct = Data_all_('LSB_payment_plan').filter(function (p) {
          return p.Project_id === rec.Project_id && p.PaymentPlan_id !== rec.PaymentPlan_id;
        }).reduce(function (s, p) { return s + Utils_num_(p.Payment_pct); }, 0) + Utils_num_(rec.Payment_pct);
        if (totalPct > 1.0001) ctx.warnings.push(L_('Tổng Payment_pct của dự án là ', 'Total Payment_pct for the project is ') + Math.round(totalPct * 100) + '% (> 100%).');
      }
    },
    LSB_cost: {
      beforeSave: function (rec, ctx) {
        if (ctx.isNew && Utils_isBlank_(rec.Cost_status)) rec.Cost_status = 'Planned';
      }
    },
    LSB_paid: {
      beforeSave: function (rec, ctx) {
        var plan = Data_find_('LSB_payment_plan', rec.PaymentPlan_id);
        if (!plan) return;
        var others = Data_all_('LSB_paid').filter(function (x) {
          return x.PaymentPlan_id === rec.PaymentPlan_id && x.Paid_id !== rec.Paid_id;
        });
        var total = Utils_sum_(others, 'Paid_USD') + Utils_num_(rec.Paid_USD);
        if (Utils_num_(plan.Payment_USD) && total > Utils_num_(plan.Payment_USD)) {
          ctx.warnings.push(L_('Tổng đã thu ', 'Total collected ') + total + L_(' USD vượt đợt ', ' USD exceeds milestone ') + plan.Payment_code + ' (' + plan.Payment_USD + ' USD).');
        }
      }
    }
  };
}
