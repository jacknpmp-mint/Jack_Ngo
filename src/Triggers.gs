/**
 * Installable onEdit trigger (created by setupSpreadsheet -> createInstallableTriggers).
 * Watches the "Stage" column on Leads and Customers and fires the
 * status-based task automation whenever a stage actually changes.
 */

function onEditInstallable(e) {
  try {
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    if (sheetName !== SHEET_NAMES.LEADS && sheetName !== SHEET_NAMES.CUSTOMERS) return;
    if (e.range.getRow() < 2) return;

    var headers = headerIndexMap(sheet);
    if (e.range.getColumn() !== headers['Stage']) return;

    var newStage = e.value;
    var oldStage = e.oldValue;
    if (!newStage || newStage === oldStage) return;

    var row = e.range.getRow();
    var id = getCellByHeader(sheet, row, 'ID');
    var name = getCellByHeader(sheet, row, 'Name');
    if (!id || !name) return;

    setCellByHeader(sheet, row, 'LastUpdated', new Date());
    applyStageAutomation(sheetName, id, name, newStage);
  } catch (err) {
    console.error('onEditInstallable failed: ' + err);
  }
}
