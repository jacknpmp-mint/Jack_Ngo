/**
 * One-time / idempotent spreadsheet provisioning.
 * Safe to re-run: it only creates what's missing and never deletes data.
 */

function setupSpreadsheet() {
  var ss = getSs();
  ensureSheetWithHeaders_(ss, SHEET_NAMES.LEADS, LEAD_HEADERS);
  ensureSheetWithHeaders_(ss, SHEET_NAMES.CUSTOMERS, CUSTOMER_HEADERS);
  ensureSheetWithHeaders_(ss, SHEET_NAMES.TODOS, TODO_HEADERS);

  applyLeadValidation_(ss.getSheetByName(SHEET_NAMES.LEADS));
  applyCustomerValidation_(ss.getSheetByName(SHEET_NAMES.CUSTOMERS));
  applyTodoValidation_(ss.getSheetByName(SHEET_NAMES.TODOS));

  createInstallableTriggers();

  var ui;
  try { ui = SpreadsheetApp.getUi(); } catch (err) { ui = null; }
  if (ui) ui.alert('Setup complete', 'Leads, Customers and ToDos sheets are ready to use.', ui.ButtonSet.OK);
}

function ensureSheetWithHeaders_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  var range = sheet.getRange(1, 1, 1, headers.length);
  var current = range.getValues()[0];
  var needsHeaders = headers.some(function (h, i) { return current[i] !== h; });
  if (needsHeaders) {
    range.setValues([headers]);
    sheet.setFrozenRows(1);
    range.setFontWeight('bold').setBackground('#1a73e8').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

function applyLeadValidation_(sheet) {
  var col = headerIndexMap(sheet)['Stage'];
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(LEAD_STAGES, true).setAllowInvalid(false).build();
  sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
  applyStageColorFormatting_(sheet, col, LEAD_STAGE_COLORS);
}

function applyCustomerValidation_(sheet) {
  var col = headerIndexMap(sheet)['Stage'];
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(CUSTOMER_STAGES, true).setAllowInvalid(false).build();
  sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
  applyStageColorFormatting_(sheet, col, CUSTOMER_STAGE_COLORS);
}

function applyTodoValidation_(sheet) {
  var headers = headerIndexMap(sheet);
  var priorityRule = SpreadsheetApp.newDataValidation().requireValueInList(TODO_PRIORITIES, true).setAllowInvalid(false).build();
  sheet.getRange(2, headers['Priority'], Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(priorityRule);
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(TODO_STATUSES, true).setAllowInvalid(false).build();
  sheet.getRange(2, headers['Status'], Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(statusRule);
}

var LEAD_STAGE_COLORS = {
  'New': '#e8f0fe', 'Contacted': '#fef7e0', 'Qualified': '#fce8e6',
  'Proposal Sent': '#e6f4ea', 'Negotiation': '#fff0e0', 'Won': '#ceead6', 'Lost': '#f1f3f4'
};
var CUSTOMER_STAGE_COLORS = {
  'New': '#e8f0fe', 'Active': '#ceead6', 'VIP': '#fef7e0', 'At Risk': '#fce8e6', 'Churned': '#f1f3f4'
};

function applyStageColorFormatting_(sheet, col, colorMap) {
  var range = sheet.getRange(2, col, Math.max(sheet.getMaxRows() - 1, 1), 1);
  var rules = sheet.getConditionalFormatRules().filter(function (r) {
    return r.getRanges().every(function (rg) { return rg.getColumn() !== col; });
  });
  Object.keys(colorMap).forEach(function (stage) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(stage)
      .setBackground(colorMap[stage])
      .setRanges([range])
      .build());
  });
  sheet.setConditionalFormatRules(rules);
}

function createInstallableTriggers() {
  var handlers = ['onEditInstallable'];
  var existing = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
  handlers.forEach(function (fn) {
    if (existing.indexOf(fn) === -1) {
      ScriptApp.newTrigger(fn).forSpreadsheet(getSs()).onEdit().create();
    }
  });
}
