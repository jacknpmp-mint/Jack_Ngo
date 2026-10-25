/**
 * 02_Router.gs — Điểm vào của Web App + định tuyến API + menu trong Google Sheet.
 *
 *  - doGet(): trả giao diện Index.html (nhúng Styles/Components/JS và các trang).
 *  - api(action, payload, lang): cổng DUY NHẤT trình duyệt gọi qua google.script.run.
 *    Mỗi route khai báo quyền tối thiểu; lỗi được chuẩn hóa bởi Error.gs; thông báo theo ngôn ngữ lang.
 *  - Route của module riêng: thêm tên hàm vào ROUTE_PROVIDERS (01_Config.gs), hàm trả { action: { role, fn } }.
 *  - onOpen(): menu APP.MENU_TITLE (Cài đặt app, Kiểm tra cấu trúc, Mở Web App) theo ngôn ngữ tài khoản Google.
 */

function doGet() {
  var t = HtmlService.createTemplateFromFile('Index');
  t.appName = APP.NAME;
  t.appVersion = APP.VERSION;
  return t.evaluate()
    .setTitle(APP.NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Nhúng file HTML con (dùng trong Index.html: <?!= include('Styles') ?>). */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** Bảng định tuyến: action → { role, fn(payload, user) }. */
function Router_routes_() {
  var r = {
    'app.bootstrap':      { role: 'Viewer', fn: function (p, u) { return Router_bootstrap_(u); } },
    'lookups.get':        { role: 'Viewer', fn: function () { return Data_lookups_(); } },
    'dashboard.get':      { role: 'Viewer', fn: function (p) { return Dashboard_get_(p.year); } },
    'notification.list':  { role: 'Viewer', fn: function (p, u) { return Notification_list_(u, p); } },

    'entity.list':        { role: 'Viewer', fn: function (p) { return Entity_list_(p); } },
    'entity.get360':      { role: 'Viewer', fn: function (p, u) { return Entity_get360_(p.table, p.id, u); } },

    'record.list':        { role: 'Viewer', fn: function (p) { return Record_list_(p.table, p.filter); } },
    'record.get':         { role: 'Viewer', fn: function (p) { return Record_get_(p.table, p.id); } },
    'record.save':        { role: 'Editor', fn: function (p, u) { return Record_save_(p.table, p.record, u); } },
    'record.delete':      { role: 'Admin',  fn: function (p, u) { return Record_delete_(p.table, p.id, u); } },
    'record.peekId':      { role: 'Editor', fn: function (p) { return Form_peekId_(p.table); } },
    'record.related':     { role: 'Viewer', fn: function (p) { return Form_related_(p.table, p.id); } },

    'activity.list':      { role: 'Editor', fn: function (p) { return Activity_list_(p); } },
    'user.me':            { role: 'Viewer', fn: function (p, u) { return User_me_(u); } },
    'structure.check':    { role: 'Admin',  fn: function () { return Router_checkStructure_(); } }
  };
  ROUTE_PROVIDERS.forEach(function (name) {
    var extra = Data_call_(name);
    for (var k in extra) r[k] = extra[k];
  });
  return r;
}

/**
 * API cho giao diện. Luôn trả { ok, data } | { ok:false, error }.
 * @param {string} action  ví dụ 'project.get360'
 * @param {Object} payload tham số
 * @param {string} lang    'vi' | 'en' (v2.5) — ngôn ngữ thông báo lỗi / cảnh báo
 */
function api(action, payload, lang) {
  I18n_set_(lang);
  return Error_wrap_(function () {
    Form_applyPolicy_();
    var route = Router_routes_()[action];
    if (!route) throw AppError_('NOT_FOUND', L_('API không tồn tại: ', 'Unknown API: ') + action);
    var user = Auth_currentUser_();
    Auth_require_(user, route.role, action);
    return route.fn(payload || {}, user);
  }, action);
}

/** Dữ liệu khởi động giao diện (1 lần gọi). */
function Router_bootstrap_(user) {
  if (APP.FEATURES.ACTIVITY !== false) Activity_ensureSheet_();
  return {
    user: user,
    caps: Auth_capabilities_(user),
    config: Router_clientConfig_(),
    lookups: Data_lookups_(),
    today: Utils_today_()
  };
}

/** Cấu hình gửi trình duyệt + gói song ngữ (v2.5). */
function Router_clientConfig_() {
  var c = Config_clientSchema_();
  c.i18n = I18n_schema_();
  return c;
}

/* ============================== Menu trong Sheet ============================== */

function onOpen() {
  I18n_fromUserLocale_();
  SpreadsheetApp.getUi()
    .createMenu(APP.MENU_TITLE)
    .addItem(L_('Cài đặt app', 'Set up app'), 'menuSetup')
    .addItem(L_('Kiểm tra cấu trúc', 'Check structure'), 'menuCheckStructure')
    .addSeparator()
    .addItem(L_('Mở Web App', 'Open Web App'), 'menuOpenApp')
    .addToUi();
}

/** Tạo sheet nhật ký (nếu thiếu) + kiểm tra cấu trúc + hiện link Web App. */
function menuSetup() {
  I18n_fromUserLocale_();
  Form_applyPolicy_();
  Activity_ensureSheet_();
  var r = Router_checkStructure_();
  var url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) { url = ''; }
  var html = '<div style="font:14px Arial;line-height:1.5">' +
    '<p><b>' + APP.NAME + ' ' + APP.VERSION + L_('</b> — lược đồ ', '</b> — schema ') + APP.SCHEMA_VERSION + '</p>' +
    Router_structureHtml_(r) +
    (url ? '<p>Web App: <a href="' + url + '" target="_blank">' + url + '</a></p>'
         : L_('<p>Chưa triển khai Web App: Triển khai › Tùy chọn triển khai mới › Ứng dụng web.</p>', '<p>Web App not deployed yet: Deploy › New deployment › Web app.</p>')) +
    L_('<p>Nhớ: bảng ', '<p>Remember: ') + APP.STAFF.table + L_(' phải có dòng email thật của bạn với Access_level = Admin.</p></div>', ' needs a row with your real email and Access_level = Admin.</p></div>');
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(420), L_('Cài đặt ', 'Setup ') + APP.MENU_TITLE);
}

function menuCheckStructure() {
  I18n_fromUserLocale_();
  var r = Router_checkStructure_();
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput('<div style="font:14px Arial;line-height:1.5">' + Router_structureHtml_(r) + '</div>')
      .setWidth(560).setHeight(420), L_('Kiểm tra cấu trúc', 'Check structure'));
}

function menuOpenApp() {
  I18n_fromUserLocale_();
  var url = ScriptApp.getService().getUrl();
  var html = url ? '<a href="' + url + L_('" target="_blank" style="font:14px Arial">Mở ', '" target="_blank" style="font:14px Arial">Open ') + APP.NAME + '</a>'
                 : L_('<p style="font:14px Arial">Chưa triển khai Web App.</p>', '<p style="font:14px Arial">Web App not deployed yet.</p>');
  SpreadsheetApp.getUi().showModelessDialog(HtmlService.createHtmlOutput(html).setWidth(320).setHeight(80), APP.MENU_TITLE);
}

/** So sánh tiêu đề các sheet với SCHEMA. */
function Router_checkStructure_() {
  var issues = [];
  var ss = Data_ss_();
  Object.keys(SCHEMA).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { issues.push({ level: 'error', table: name, message: L_('Thiếu sheet', 'Missing sheet') }); return; }
    var lastCol = sh.getLastColumn();
    var headers = lastCol ? sh.getRange(APP.HEADER_ROW, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); }) : [];
    var formulas = lastCol ? sh.getRange(APP.FIRST_DATA_ROW, 1, 1, lastCol).getFormulas()[0] : [];
    SCHEMA[name].columns.forEach(function (c) {
      var i = headers.indexOf(c.name);
      if (i < 0) issues.push({ level: 'error', table: name, message: L_('Thiếu cột ', 'Missing column ') + c.name });
      else if (c.auto && !formulas[i]) issues.push({ level: 'warn', table: name, message: L_('Cột AUTO ', 'AUTO column ') + c.name + L_(' không có công thức ở dòng ', ' has no formula in row ') + APP.FIRST_DATA_ROW });
    });
    headers.forEach(function (h) {
      if (h && !SCHEMA[name].columns.some(function (c) { return c.name === h; })) {
        issues.push({ level: 'info', table: name, message: L_('Cột ', 'Column ') + h + L_(' có trong sheet nhưng chưa khai báo trong 01_Config.gs (app bỏ qua)', ' is in the sheet but not declared in 01_Config.gs (ignored by the app)') });
      }
    });
    for (var i = 0; i < formulas.length; i++) {
      if (String(formulas[i]).indexOf('#REF!') >= 0) issues.push({ level: 'error', table: name, message: L_('Công thức lỗi #REF! ở cột ', 'Broken #REF! formula in column ') + headers[i] });
    }
  });
  if (APP.LISTS_SOURCE && APP.LISTS_SOURCE.sheet && !ss.getSheetByName(APP.LISTS_SOURCE.sheet)) {
    issues.push({ level: 'warn', table: APP.LISTS_SOURCE.sheet, message: L_('Thiếu sheet danh sách chọn — app dùng danh sách sinh sẵn', 'Missing list sheet — the app uses its built-in lists') });
  }
  return { ok: !issues.some(function (x) { return x.level === 'error'; }), issues: issues };
}

function Router_structureHtml_(r) {
  if (!r.issues.length) return L_('<p style="color:#1a7f37">✔ Cấu trúc khớp ', '<p style="color:#1a7f37">✔ Structure matches ') + APP.SCHEMA_VERSION + '.</p>';
  var color = { error: '#cf222e', warn: '#9a6700', info: '#57606a' };
  return '<p>' + (r.ok ? L_('✔ Không có lỗi chặn.', '✔ No blocking errors.') : L_('✖ Có lỗi cần sửa trước khi dùng app.', '✖ There are errors to fix before using the app.')) + '</p><ul>' +
    r.issues.map(function (x) {
      return '<li style="color:' + color[x.level] + '">' + x.table + ': ' + x.message + '</li>';
    }).join('') + '</ul>';
}
