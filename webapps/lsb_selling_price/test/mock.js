// Mô phỏng tối thiểu các dịch vụ Apps Script đủ để chạy backend LSB trên Node.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function reviveCell(c) {
  let v = c.v;
  if (v && typeof v === 'object' && v.$d) { const [d, t] = v.$d.split('T'); const [y, m, dd] = d.split('-').map(Number); const [h, mi, s] = t.split(':').map(Number); v = new Date(y, m - 1, dd, h, mi, s); }
  return { v: v === null || v === undefined ? '' : v, f: c.f || '' };
}

class Range {
  constructor(sheet, r, c, nr, nc) { Object.assign(this, { sheet, r, c, nr, nc }); }
  cells(fn) { const out = []; for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) row.push(fn(this.sheet.cell(this.r + i, this.c + j))); out.push(row); } return out; }
  getValues() { return this.cells(x => x.v instanceof Date ? new Date(x.v) : x.v); }
  getFormulas() { return this.cells(x => x.f); }
  getFormulasR1C1() { return this.cells(x => x.f ? 'R1C1:' + x.f : ''); }
  setValues(vals) {
    if (vals.length !== this.nr || vals[0].length !== this.nc) throw new Error('setValues size mismatch');
    vals.forEach((row, i) => row.forEach((v, j) => {
      const cell = this.sheet.cell(this.r + i, this.c + j, true);
      if (typeof v === 'string' && v.startsWith('=')) { cell.f = v; cell.v = ''; }
      else if (typeof v === 'string' && v.startsWith("'")) { cell.f = ''; cell.v = v.slice(1); }
      else { cell.f = ''; cell.v = v === null || v === undefined ? '' : v; }
    }));
    this.sheet.ss.writes++;
    return this;
  }
  setFormulaR1C1(f) { const cell = this.sheet.cell(this.r, this.c, true); cell.f = f.replace(/^R1C1:/, ''); cell.v = ''; return this; }
  copyTo() { return this; }
  setFontWeight() { return this; } setFontColor() { return this; } setBackground() { return this; } setNumberFormat() { return this; }
}

class Sheet {
  constructor(ss, name, grid) { this.ss = ss; this.name = name; this.grid = grid || []; this.maxRows = Math.max(this.grid.length, 1000); }
  cell(r, c, create) {
    while (create && this.grid.length < r) this.grid.push([]);
    const row = this.grid[r - 1] || [];
    if (create) { while (row.length < c) row.push({ v: '', f: '' }); }
    return row[c - 1] || { v: '', f: '' };
  }
  getLastRow() { for (let r = this.grid.length; r >= 1; r--) if ((this.grid[r - 1] || []).some(x => x.f || (x.v !== '' && x.v !== null))) return r; return 0; }
  getLastColumn() { return this.grid.reduce((m, row) => { let n = 0; row.forEach((x, i) => { if (x.f || x.v !== '') n = i + 1; }); return Math.max(m, n); }, 0); }
  getMaxRows() { return this.maxRows; }
  insertRowsAfter(after, n) { this.maxRows += n; }
  getRange(a, b, c, d) {
    if (typeof a === 'string') return new Range(this, 1, 2, 1, 1);
    return new Range(this, a, b, c || 1, d || 1);
  }
  appendRow(vals) { const r = this.getLastRow() + 1; new Range(this, r, 1, 1, vals.length).setValues([vals.map(v => v)]); }
  setFrozenRows() {} setColumnWidth() {}
}

function makeContext(opts) {
  opts = opts || {};
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, opts.dataFile || 'data.json'), 'utf8'));
  const ss = { sheets: {}, writes: 0 };
  Object.keys(data).forEach(n => { ss.sheets[n] = new Sheet(ss, n, data[n].map(row => row.map(reviveCell))); });
  ss.getSheetByName = n => ss.sheets[n] || null;
  ss.insertSheet = n => (ss.sheets[n] = new Sheet(ss, n, []));
  const props = {};
  const state = { email: 'email' in opts ? opts.email : 'admin@test.example', logs: [] };
  const ctx = {
    console: { log() {}, warn: (...a) => state.logs.push(['warn', ...a]), error: (...a) => state.logs.push(['error', ...a]) },
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: () => ss, flush() {}, CopyPasteType: { PASTE_FORMAT: 1, PASTE_DATA_VALIDATION: 2 } },
    Session: { getActiveUser: () => ({ getEmail: () => state.email }), getActiveUserLocale: () => 'vi' },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = v; } }) },
    Utilities: {
      formatDate(d, tz, fmt) {
        const p = n => String(n).padStart(2, '0');
        return fmt.replace('yyyy', d.getFullYear()).replace('MM', p(d.getMonth() + 1)).replace('dd', p(d.getDate()))
          .replace('HH', p(d.getHours())).replace('mm', p(d.getMinutes())).replace('ss', p(d.getSeconds()));
      }
    },
    HtmlService: {}, ScriptApp: { getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/TEST/exec' }) }
  };
  vm.createContext(ctx);
  const dir = path.join(__dirname, '..', 'src');
  let files = fs.readdirSync(dir).filter(f => f.endsWith('.gs'));
  if (opts.reverse) files = files.reverse();   // chứng minh không phụ thuộc thứ tự nạp file
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }));
  // Thêm 3 tài khoản thử (Admin / Viewer / đã nghỉ) vào bảng nhân sự theo APP.STAFF — bỏ qua khi opts.noSeed
  const S = ctx.APP && ctx.APP.STAFF;
  if (!opts.noSeed && S && S.table && ss.sheets[S.table]) {
    const sh = ss.sheets[S.table];
    const head = (sh.grid[(ctx.APP.HEADER_ROW || 1) - 1] || []).map(c => String(c.v).trim());
    const pre = ctx.SCHEMA[S.table].prefix;
    const seed = [['TA', 'Admin Test', 'admin@test.example', 'Admin', 'Y'], ['TV', 'Viewer Test', 'viewer@test.example', 'Viewer', 'Y'],
      ['TE', 'Editor Test', 'editor@test.example', 'Editor', 'Y'], ['TO', 'Nghỉ việc', 'off@test.example', 'Editor', 'N']];
    seed.forEach((x, k) => {
      const row = sh.getLastRow() + 1;
      const vals = head.map(h => h === S.id ? pre + '-9' + (90 + k) : h === S.name ? x[1] : h === S.email ? x[2] : h === S.access ? x[3] : h === S.active ? x[4] : '');
      new Range(sh, row, 1, 1, head.length).setValues([vals]);
    });
  }
  ss.writes = 0;
  return {
    ctx, ss, props, state,
    as(email) { state.email = email; vm.runInContext('AUTH_USER_ = null; DATA_CACHE_ = {};', ctx); return this; },
    api(action, payload, lang) { vm.runInContext('AUTH_USER_ = null; DATA_CACHE_ = {};', ctx); return JSON.parse(JSON.stringify(ctx.api(action, payload, lang))); }
  };
}
module.exports = { makeContext };
