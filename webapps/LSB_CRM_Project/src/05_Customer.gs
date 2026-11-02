/**
 * 05_Customer.gs — Module Khách hàng: LSB_Lead, LSB_Customer.
 *  - Danh sách Lead kèm trạng thái chuyển đổi, số dự án, giá trị hợp đồng.
 *  - Lead 360°: lead → việc đánh giá → báo giá / kế hoạch hành động → khách hàng → dự án (+ chỉ số).
 *  - Quy tắc: 1 lead → tối đa 1 khách hàng; tạo khách hàng thì Lead_status = Converted.
 */

/** p: { status, owner, q, year, missing } */
function Customer_list_(p) {
  p = p || {};
  var staff = Project_nameMap_('LSB_Staff');
  var customerByLead = Utils_indexBy_(Data_all_('LSB_Customer'), 'Lead_id');
  var projectsByCustomer = Utils_groupBy_(Data_all_('LSB_project'), 'Customer_id');
  var quotesByLead = Quotation_enabled_() ? Utils_groupBy_(Data_all_('LSB_Quotation'), 'Lead_id') : {};
  var rows = Data_all_('LSB_Lead').map(function (l) {
    var c = customerByLead[l.Lead_id] || null;
    var projects = c ? (projectsByCustomer[c.Customer_id] || []) : [];
    return {
      Lead_id: l.Lead_id, Company_name: l.Company_name, Nation: l.Nation, Industry_segment: l.Industry_segment,
      Lead_source: l.Lead_source, Contact_name: l.Contact_name, Contact_email: l.Contact_email,
      Owner_id: l.Owner_id, Owner_name: staff[l.Owner_id] || '', Created_day: l.Created_day,
      Year: Utils_yearQuarter_(l.Created_day).year, Lead_status: l.Lead_status, Lead_website: l.Lead_website,
      Customer_id: c ? c.Customer_id : '', Projects: projects.length,
      Quotations: (quotesByLead[l.Lead_id] || []).length,
      Contract_USD: Utils_sum_(projects, 'Contract_USD'),
      Missing: Form_missing_('LSB_Lead', l).concat(c ? Form_missing_('LSB_Customer', c).map(function (k) { return L_('Khách hàng.', 'Customer.') + k; }) : [])
    };
  });
  if (p.status) rows = rows.filter(function (r) { return r.Lead_status === p.status; });
  if (p.owner) rows = rows.filter(function (r) { return r.Owner_id === p.owner; });
  if (p.year) rows = rows.filter(function (r) { return String(r.Year) === String(p.year); });
  if (p.customersOnly) rows = rows.filter(function (r) { return r.Customer_id; });
  if (p.missing) rows = rows.filter(function (r) { return r.Missing.length; });
  if (p.q) {
    var q = String(p.q).toLowerCase();
    rows = rows.filter(function (r) {
      return [r.Lead_id, r.Company_name, r.Contact_name, r.Nation, r.Customer_id].join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }
  rows.sort(function (a, b) { return String(b.Created_day).localeCompare(String(a.Created_day)); });
  return { rows: rows, total: rows.length };
}

function Customer_lead360_(leadId, user) {
  var lead = Data_find_('LSB_Lead', leadId);
  if (!lead) throw AppError_('NOT_FOUND', L_('Không tìm thấy lead ', 'Lead not found: ') + leadId + '.');
  var staff = Project_nameMap_('LSB_Staff');
  lead.Owner_name = staff[lead.Owner_id] || '';
  var customer = Data_all_('LSB_Customer').filter(function (c) { return c.Lead_id === leadId; })[0] || null;
  if (customer) customer.Account_owner_name = staff[customer.Account_owner_id] || '';
  var projects = [];
  if (customer) {
    var ids = Data_all_('LSB_project').filter(function (p) { return p.Customer_id === customer.Customer_id; })
      .map(function (p) { return p.Project_id; });
    projects = Project_list_({}).rows.filter(function (r) { return ids.indexOf(r.Project_id) >= 0; });
  }
  var bidding = Bidding_status_();
  var quotations = [], qualifying = [], actions = [];
  if (bidding.enabled) {
    quotations = Quotation_list_({ lead: leadId }).rows;
    var tasks = Bidding_tasks_({ lead: leadId }).rows;
    qualifying = tasks.filter(function (t) { return t.Kind === 'Qualifying'; })
      .sort(function (a, b) { return String(a.Start_calc).localeCompare(String(b.Start_calc)); });
    actions = tasks.filter(function (t) { return t.Kind === 'Action'; })
      .sort(function (a, b) { return String(a.Start_calc).localeCompare(String(b.Start_calc)); });
  }
  var ids2 = [leadId].concat(customer ? [customer.Customer_id] : [],
    qualifying.map(function (t) { return t.Qualification_id; }), quotations.map(function (q) { return q.Quotation_code; }),
    actions.map(function (t) { return t.Action_id; }));
  return {
    lead: lead, customer: customer, projects: projects,
    bidding: bidding, quotations: quotations, qualifying: qualifying, actions: actions,
    kpi: {
      quotations: quotations.length,
      quotedUSD: Utils_sum_(quotations, 'Value_USD'),
      qualDone: qualifying.filter(function (t) { return t.Status_calc === 'Done'; }).length,
      qualTotal: qualifying.length,
      projects: projects.length,
      contractUSD: Utils_sum_(projects, 'Contract_USD'),
      collectedUSD: Utils_sum_(projects, 'Collected_USD'),
      outstandingUSD: Utils_sum_(projects, 'Outstanding_USD')
    },
    activity: user && Auth_can_(user, PERMISSION.ACTIVITY_READ) ? Activity_list_({ recordIds: ids2, limit: 30 }).rows : []
  };
}

function Customer_hooks_() {
  return {
    LSB_Lead: {
      beforeSave: function (rec, ctx) {
        if (ctx.isNew && Utils_isBlank_(rec.Created_day)) rec.Created_day = Utils_today_();
        if (ctx.isNew && Utils_isBlank_(rec.Lead_status)) rec.Lead_status = 'New';   // v2.4: không còn bắt buộc
        if (ctx.isNew && Utils_isBlank_(rec.Owner_id) && ctx.user) rec.Owner_id = ctx.user.staffId;
        if (!ctx.isNew && ctx.old && ctx.old.Lead_status === 'Converted' && rec.Lead_status !== 'Converted') {
          var hasCustomer = Data_all_('LSB_Customer').some(function (c) { return c.Lead_id === rec.Lead_id; });
          if (hasCustomer) ctx.warnings.push(L_('Lead đã có khách hàng nhưng Lead_status không còn là Converted.', 'The lead already has a customer but Lead_status is no longer Converted.'));
        }
      }
    },
    LSB_Customer: {
      beforeSave: function (rec, ctx) {
        var lead = Data_find_('LSB_Lead', rec.Lead_id);
        if (lead && Utils_isBlank_(rec.Nation)) rec.Nation = lead.Nation;
        if (lead && Utils_isBlank_(rec.Contact)) rec.Contact = lead.Contact_name;
        if (lead && Utils_isBlank_(rec.Account_owner_id)) rec.Account_owner_id = lead.Owner_id;
      },
      afterSave: function (saved, ctx) {
        // Quy tắc 2 (phần áp dụng được trong file Project): lead chuyển thành Converted.
        var lead = Data_find_('LSB_Lead', saved.Lead_id);
        if (lead && lead.Lead_status !== 'Converted') {
          Data_update_('LSB_Lead', lead.Lead_id, { Lead_status: 'Converted' });
          Activity_log_(ctx.user, 'Update', 'LSB_Lead', lead.Lead_id, lead, Data_find_('LSB_Lead', lead.Lead_id), 'tự động khi tạo khách hàng / automatic when the customer was created');
          ctx.warnings.push('Lead ' + lead.Lead_id + L_(' đã chuyển Lead_status = Converted.', ' switched to Lead_status = Converted.'));
        }
      }
    }
  };
}
