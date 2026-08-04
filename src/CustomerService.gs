/**
 * CRUD operations for the Customers sheet.
 */

function getCustomers() {
  var sheet = getSheetOrThrow(SHEET_NAMES.CUSTOMERS);
  return sheetToObjects(sheet).map(function (c) {
    c.CreatedDate = formatDateForUi(c.CreatedDate);
    c.LastContactDate = formatDateForUi(c.LastContactDate);
    c.LastUpdated = formatDateForUi(c.LastUpdated);
    return c;
  });
}

function addCustomer(form) {
  if (!form.Name) throw new Error('Customer name is required.');
  var sheet = getSheetOrThrow(SHEET_NAMES.CUSTOMERS);
  var id = generateId('C');
  var now = new Date();
  var record = {
    ID: id,
    Name: form.Name,
    Company: form.Company || '',
    Email: form.Email || '',
    Phone: form.Phone || '',
    LeadID: form.LeadID || '',
    Stage: form.Stage || 'New',
    LifetimeValue: Number(form.LifetimeValue) || 0,
    Owner: form.Owner || Session.getActiveUser().getEmail(),
    CreatedDate: now,
    LastContactDate: '',
    Notes: form.Notes || '',
    LastUpdated: now
  };
  appendObjectRow(sheet, record, CUSTOMER_HEADERS);
  applyStageAutomation(SHEET_NAMES.CUSTOMERS, id, record.Name, record.Stage);
  return record;
}

function updateCustomer(id, updates) {
  var sheet = getSheetOrThrow(SHEET_NAMES.CUSTOMERS);
  var row = findRowById(sheet, id);
  if (row === -1) throw new Error('Customer not found: ' + id);

  var oldStage = getCellByHeader(sheet, row, 'Stage');
  Object.keys(updates).forEach(function (key) {
    if (CUSTOMER_HEADERS.indexOf(key) !== -1 && key !== 'ID') {
      setCellByHeader(sheet, row, key, updates[key]);
    }
  });
  setCellByHeader(sheet, row, 'LastUpdated', new Date());

  var newStage = updates.Stage;
  if (newStage && newStage !== oldStage) {
    var name = getCellByHeader(sheet, row, 'Name');
    applyStageAutomation(SHEET_NAMES.CUSTOMERS, id, name, newStage);
  }
  return true;
}

function updateCustomerStage(id, newStage) {
  return updateCustomer(id, { Stage: newStage, LastContactDate: new Date() });
}

function deleteCustomer(id) {
  var sheet = getSheetOrThrow(SHEET_NAMES.CUSTOMERS);
  var row = findRowById(sheet, id);
  if (row === -1) throw new Error('Customer not found: ' + id);
  sheet.deleteRow(row);
  return true;
}
