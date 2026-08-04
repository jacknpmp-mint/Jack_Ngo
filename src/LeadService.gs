/**
 * CRUD and lifecycle operations for the Leads sheet.
 * Used by both the sidebar/menu (bound UI) and the web app dashboard.
 */

function getLeads() {
  var sheet = getSheetOrThrow(SHEET_NAMES.LEADS);
  return sheetToObjects(sheet).map(function (lead) {
    lead.CreatedDate = formatDateForUi(lead.CreatedDate);
    lead.LastContactDate = formatDateForUi(lead.LastContactDate);
    lead.NextFollowUpDate = formatDateForUi(lead.NextFollowUpDate);
    lead.LastUpdated = formatDateForUi(lead.LastUpdated);
    return lead;
  });
}

function addLead(form) {
  if (!form.Name) throw new Error('Lead name is required.');
  var sheet = getSheetOrThrow(SHEET_NAMES.LEADS);
  var id = generateId('L');
  var now = new Date();
  var record = {
    ID: id,
    Name: form.Name,
    Company: form.Company || '',
    Email: form.Email || '',
    Phone: form.Phone || '',
    Source: form.Source || '',
    Stage: form.Stage || 'New',
    Value: Number(form.Value) || 0,
    Owner: form.Owner || Session.getActiveUser().getEmail(),
    CreatedDate: now,
    LastContactDate: '',
    NextFollowUpDate: '',
    Notes: form.Notes || '',
    LastUpdated: now
  };
  appendObjectRow(sheet, record, LEAD_HEADERS);
  applyStageAutomation(SHEET_NAMES.LEADS, id, record.Name, record.Stage);
  return record;
}

function updateLead(id, updates) {
  var sheet = getSheetOrThrow(SHEET_NAMES.LEADS);
  var row = findRowById(sheet, id);
  if (row === -1) throw new Error('Lead not found: ' + id);

  var oldStage = getCellByHeader(sheet, row, 'Stage');
  Object.keys(updates).forEach(function (key) {
    if (LEAD_HEADERS.indexOf(key) !== -1 && key !== 'ID') {
      setCellByHeader(sheet, row, key, updates[key]);
    }
  });
  setCellByHeader(sheet, row, 'LastUpdated', new Date());

  var newStage = updates.Stage;
  if (newStage && newStage !== oldStage) {
    var name = getCellByHeader(sheet, row, 'Name');
    applyStageAutomation(SHEET_NAMES.LEADS, id, name, newStage);
  }
  return true;
}

function updateLeadStage(id, newStage) {
  return updateLead(id, { Stage: newStage, LastContactDate: new Date() });
}

function deleteLead(id) {
  var sheet = getSheetOrThrow(SHEET_NAMES.LEADS);
  var row = findRowById(sheet, id);
  if (row === -1) throw new Error('Lead not found: ' + id);
  sheet.deleteRow(row);
  return true;
}

/** Copies a Lead into the Customers sheet. Safe to call more than once (skips if already converted). */
function convertLeadToCustomer(leadId) {
  var leadSheet = getSheetOrThrow(SHEET_NAMES.LEADS);
  var custSheet = getSheetOrThrow(SHEET_NAMES.CUSTOMERS);

  var existing = sheetToObjects(custSheet).some(function (c) { return c.LeadID === leadId; });
  if (existing) return null;

  var leadRow = findRowById(leadSheet, leadId);
  if (leadRow === -1) throw new Error('Lead not found: ' + leadId);
  var lead = sheetToObjects(leadSheet).filter(function (l) { return l.ID === leadId; })[0];

  var now = new Date();
  var customer = {
    ID: generateId('C'),
    Name: lead.Name,
    Company: lead.Company,
    Email: lead.Email,
    Phone: lead.Phone,
    LeadID: leadId,
    Stage: 'New',
    LifetimeValue: lead.Value || 0,
    Owner: lead.Owner,
    CreatedDate: now,
    LastContactDate: '',
    Notes: lead.Notes,
    LastUpdated: now
  };
  appendObjectRow(custSheet, customer, CUSTOMER_HEADERS);
  applyStageAutomation(SHEET_NAMES.CUSTOMERS, customer.ID, customer.Name, customer.Stage);
  return customer;
}
