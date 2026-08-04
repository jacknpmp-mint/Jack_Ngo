/**
 * Shared low-level helpers used by every service file.
 */

function getSs() {
  return SpreadsheetApp.getActive();
}

function getSheetOrThrow(name) {
  var sheet = getSs().getSheetByName(name);
  if (!sheet) {
    throw new Error('Sheet "' + name + '" is missing. Run "Set Up / Repair Sheets" from the menu first.');
  }
  return sheet;
}

function generateId(prefix) {
  return prefix + '-' + Utilities.getUuid().split('-')[0].toUpperCase();
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(date, days) {
  var d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/** Reads a data sheet (first row = headers) into an array of plain objects. */
function sheetToObjects(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var rows = [];
  for (var r = 0; r < values.length; r++) {
    var obj = { _row: r + 2 };
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = values[r][c];
    }
    rows.push(obj);
  }
  return rows;
}

function headerIndexMap(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  headers.forEach(function (h, i) { map[h] = i + 1; });
  return map;
}

/** Appends a plain object as a new row, matching column order to the header row. */
function appendObjectRow(sheet, obj, headers) {
  var row = headers.map(function (h) { return obj.hasOwnProperty(h) ? obj[h] : ''; });
  sheet.appendRow(row);
  return sheet.getLastRow();
}

/** Finds the 1-indexed sheet row for a given ID value in column "ID". Returns -1 if not found. */
function findRowById(sheet, id) {
  var idCol = headerIndexMap(sheet)['ID'];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return i + 2;
  }
  return -1;
}

function setCellByHeader(sheet, row, header, value) {
  var col = headerIndexMap(sheet)[header];
  if (!col) throw new Error('Unknown column "' + header + '"');
  sheet.getRange(row, col).setValue(value);
}

function getCellByHeader(sheet, row, header) {
  var col = headerIndexMap(sheet)[header];
  if (!col) throw new Error('Unknown column "' + header + '"');
  return sheet.getRange(row, col).getValue();
}

function formatDateForUi(value) {
  if (!value) return '';
  var d = (value instanceof Date) ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
