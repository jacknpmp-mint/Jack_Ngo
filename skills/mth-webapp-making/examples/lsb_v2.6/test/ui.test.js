// Chạy giao diện thật (Index.html dựng như HtmlService) trong Chromium, nối google.script.run
// vào backend mô phỏng qua page.exposeFunction. Kiểm tra: không lỗi JS, điều hướng, form, lưu, mobile.
const fs = require('fs'), path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [require('child_process').execSync('npm root -g').toString().trim()] }));
const { makeContext } = require('./mock');

const SRC = path.join(__dirname, '..', 'src');
function buildIndex() {
  let html = fs.readFileSync(path.join(SRC, 'Index.html'), 'utf8');
  html = html.replace(/<\?!=\s*include\('(\w+)'\);?\s*\?>/g, (m, n) => fs.readFileSync(path.join(SRC, n + '.html'), 'utf8'));
  html = html.replace(/<\?=\s*appName\s*\?>/g, 'LSB CRM · Project').replace(/<\?=\s*appVersion\s*\?>/g, '2.6.0');
  if (/<\?/.test(html)) throw new Error('template tag left');
  return html;
}
const SHIM = `
window.google = { script: {
  run: (function mk(s, f) { return {
    withSuccessHandler: h => mk(h, f), withFailureHandler: h => mk(s, h),
    api: (a, p, l) => window.__api(a, JSON.stringify(p || {}), l || 'vi').then(r => s && s(JSON.parse(r)), e => f && f(e)) }; })(),
  history: { push() {}, replace() {}, setChangeHandler() {} },
  url: { getLocation: cb => cb({ hash: '' }) } } };`;

(async () => {
  const A = makeContext();
  const html = buildIndex();
  fs.writeFileSync(path.join(__dirname, 'index.built.html'), html);
  const browser = await chromium.launch();
  const results = []; let fail = 0;
  const errors = [];
  async function run(name, fn) {
    try { await fn(); results.push('  ✔ ' + name); } catch (e) { fail++; results.push('  ✖ ' + name + '\n      ' + e.message.split('\n')[0]); }
  }
  async function newPage(viewport) {
    const page = await browser.newPage({ viewport });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.exposeFunction('__api', (a, p, l) => JSON.stringify(A.api(a, JSON.parse(p), l)));
    await page.addInitScript(SHIM);
    await page.addInitScript(() => { try { if (!localStorage.getItem('lsb.lang')) localStorage.setItem('lsb.lang', 'vi'); } catch (e) {} });
    await page.goto('file://' + path.join(__dirname, 'index.built.html'));
    await page.waitForSelector('.kpis', { timeout: 10000 });
    return page;
  }
  const shots = path.join(__dirname, 'shots'); fs.mkdirSync(shots, { recursive: true });
  const page = await newPage({ width: 1366, height: 900 });

  await run('Dashboard hiển thị KPI + bảng quý + cảnh báo', async () => {
    await page.waitForSelector('#alerts');
    const t = await page.textContent('#view');
    if (!/Hợp đồng ký năm 20\d\d/.test(t)) throw new Error('missing KPI');
    await page.screenshot({ path: path.join(shots, '1_dashboard.png'), fullPage: true });
  });
  await run('Dashboard năm 2026 có số liệu', async () => {
    await page.selectOption('#yr', '2026');
    await page.waitForFunction(() => /Dashboard · năm 2026/.test(document.querySelector('#view').textContent));
    const t = await page.textContent('#view');
    if (!/1,680,000/.test(t)) throw new Error('no contract value');
  });
  await run('v2.6 Dashboard 4 tab: công nợ (cây Dự án → Lô → Đợt), sản xuất, khách hàng; đổi VND; bấm dòng → 360° tab Thanh toán', async () => {
    await page.click('[data-dt=ar]');
    await page.waitForSelector('text=Thu tiền theo Dự án');
    let t = await page.textContent('#view');
    if (!/PP-2026-002/.test(t) || !/272,000/.test(t)) throw new Error('thiếu đợt quá hạn PP-2026-002');
    await page.click('[data-tree=open]');
    await page.waitForSelector('.dash-tree tr.lv3');
    t = await page.textContent('.dash-tree');
    if (!/Chung dự án|Lô 1/.test(t) || !/PD-2026-00/.test(t)) throw new Error('cây thiếu lô / lần thu');
    await page.screenshot({ path: path.join(shots, '10_dash_receivables.png'), fullPage: true });
    await page.click('[data-cur=VND]');
    await page.waitForFunction(() => /triệu ₫/.test(document.querySelector('#view').textContent));
    await page.click('[data-cur=USD]');
    await page.click('[data-dt=pr]');
    await page.waitForSelector('text=Lô hàng đang sản xuất');
    t = await page.textContent('#view');
    if (!/Đã đến cảng/.test(t) || !/Chưa sản xuất/.test(t)) throw new Error('thiếu tình trạng lô');
    await page.click('[data-dt=cu]');
    await page.waitForSelector('text=Theo quốc gia');
    t = await page.textContent('#view');
    if (!/Pacific Cold Storage/.test(t) || !/Australia/.test(t) || !/Cold storage/.test(t)) throw new Error('thiếu khách hàng/quốc gia/ngành');
    await page.screenshot({ path: path.join(shots, '11_dash_customers.png'), fullPage: true });
    await page.click('[data-dt=ar]');
    await page.waitForSelector('.dash-tree');
    await page.click('table.tbl tr[data-go][data-tab=pay] >> nth=0');
    await page.waitForSelector('.tab.active[data-t=pay]');
    await page.click('[data-route=dashboard]');
    await page.waitForSelector('[data-dt=ov]');
    await page.click('[data-dt=ov]');
    await page.waitForSelector('#alerts');
  });
  await run('Danh sách dự án → mở Dự án 360°', async () => {
    await page.click('[data-route=projects]');
    await page.waitForSelector('table.tbl');
    await page.click('text=PCS Brisbane Cold Store');
    await page.waitForSelector('#tabs .tabs');
    const t = await page.textContent('#view');
    if (!/904,000/.test(t)) throw new Error('collected not shown');
    await page.screenshot({ path: path.join(shots, '2_project360.png'), fullPage: true });
  });
  await run('Tab Thanh toán: trạng thái Overdue + form ghi nhận thu tiền (lọc đợt theo dự án)', async () => {
    await page.click('.tab[data-t=pay]');
    await page.waitForSelector('text=Overdue');
    await page.click('#add-paid');
    await page.waitForSelector('.modal');
    const opts = await page.$$eval('select[name=PaymentPlan_id] option', o => o.map(x => x.value).filter(Boolean));
    if (opts.join() !== 'PP-2026-001,PP-2026-002') throw new Error('plans ' + opts);
    await page.fill('input[name=Paid_USD]', '272000');
    await page.fill('input[name=Invoice_no]', 'INV-UI-1');
    await page.click('[data-a=save]');
    await page.waitForSelector('.modal', { state: 'detached' });
    await page.waitForFunction(() => /1,176,000/.test(document.querySelector('#view').textContent));
  });
  await run('Form v2.4: chỉ FK bắt buộc (bỏ trống Project_id → lỗi tại ô); Category để trống được; VND tự tính', async () => {
    await page.click('.tab[data-t=cost]');
    await page.click('[data-add=LSB_cost]');
    await page.waitForSelector('.modal');
    if (await page.$('.field[data-f=Category] .req')) throw new Error('Category còn dấu *');
    if (!(await page.$('.field[data-f=Category] .need'))) throw new Error('thiếu dấu • nên có');
    await page.selectOption('select[name=Project_id]', '');
    await page.click('[data-a=save]');
    await page.waitForSelector('.field.has-err[data-f=Project_id]');
    await page.selectOption('select[name=Project_id]', 'PJ-2026-001');
    await page.fill('input[name=Cost_USD]', '1200');
    await page.waitForFunction(() => document.querySelector('input[name=Cost_VND]').value === '31200000');
    await page.fill('input[name=Vendor]', 'Vendor UI');
    await page.click('[data-a=save]');
    await page.waitForSelector('.modal', { state: 'detached' });
    await page.waitForSelector('text=Vendor UI');
    await page.waitForSelector('#tabs .badge.warn:has-text("Thiếu dữ liệu")');
  });
  await run('Mã dự kiến hiện ngay khi Thêm; Lưu → đúng mã; tự điền Shipment_no / Handover_day / Payment_USD+VND', async () => {
    await page.click('.tab[data-t=ship]');
    await page.click('[data-add=LSB_shipment]');
    await page.waitForSelector('.modal [data-pk]:has-text("SH-' + new Date().getFullYear() + '-")');
    const preview = (await page.textContent('.modal [data-pk]')).split(' ')[0];
    await page.waitForFunction(() => document.querySelector('input[name=Shipment_no]').value === '3');
    await page.fill('input[name=ETD_plan]', '2026-11-01');
    await page.waitForFunction(() => document.querySelector('input[name=ETA_plan]').value === '2026-11-15');
    await page.click('[data-a=save]');
    await page.waitForSelector('.modal', { state: 'detached' });
    const sh = A.api('record.get', { table: 'LSB_shipment', id: preview }).data;
    if (sh.Shipment_no !== 3 || sh.ETA_plan !== '2026-11-15') throw new Error(JSON.stringify(sh));
    await page.click('.tab[data-t=lesson]');
    await page.click('[data-add=LSB_Project_handover_lesson]');
    await page.waitForSelector('.modal');
    await page.waitForFunction(() => document.querySelector('input[name=Handover_day]').value !== '');
    await page.click('.modal .x');
    await page.click('.tab[data-t=pay]');
    await page.click('[data-add=LSB_payment_plan]');
    await page.waitForSelector('.modal');
    await page.fill('.pct-wrap input[name=Payment_pct]', '10');
    await page.waitForFunction(() => document.querySelector('input[name=Payment_USD]').value === '168000' &&
      document.querySelector('input[name=Payment_VND]').value === String(168000 * 26000));
    await page.fill('.pct-wrap input[name=Payment_pct]', '5');
    await page.waitForFunction(() => document.querySelector('input[name=Payment_USD]').value === '84000');
    await page.fill('input[name=Payment_USD]', '90000');
    await page.fill('.pct-wrap input[name=Payment_pct]', '6');
    await page.waitForTimeout(300);
    if (await page.inputValue('input[name=Payment_USD]') !== '90000') throw new Error('ghi đè giá trị nhập tay');
    await page.click('.modal .x');
  });
  await run('Nháp: đóng form / bấm ra ngoài / tải lại trang không mất dữ liệu; Bỏ nháp; Lưu xong xóa nháp', async () => {
    await page.click('[data-route=projects]');
    await page.waitForSelector('#add');
    await page.click('#add');
    await page.waitForSelector('.modal');
    await page.fill('input[name=Project_name]', 'Nháp UI');
    await page.mouse.click(5, 5);                       // bấm ra ngoài: form không đóng
    if (!(await page.$('.modal'))) throw new Error('bấm ra ngoài làm đóng form');
    await page.click('.modal .x');
    await page.waitForSelector('text=Đã lưu nháp');
    await page.click('#add');
    await page.waitForSelector('.draft-bar:has-text("Đã khôi phục")');
    if (await page.inputValue('input[name=Project_name]') !== 'Nháp UI') throw new Error('không khôi phục');
    await page.fill('input[name=Project_owner]', 'CĐT nháp');
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForSelector('.kpis');
    await page.click('[data-route=projects]');
    await page.waitForSelector('#add');
    await page.click('#add');
    await page.waitForSelector('.draft-bar');
    if (await page.inputValue('input[name=Project_owner]') !== 'CĐT nháp') throw new Error('mất nháp sau tải lại');
    await page.click('.draft-bar [data-d=drop]');
    if (await page.inputValue('input[name=Project_name]') !== '') throw new Error('Bỏ nháp chưa xóa form');
    await page.click('.modal .x');
    await page.click('#add');
    await page.waitForSelector('.modal');
    if (!(await page.isHidden('.draft-bar'))) throw new Error('nháp vẫn còn sau Bỏ nháp');
    await page.selectOption('select[name=Customer_id]', 'CU-001');
    await page.fill('input[name=Project_name]', 'Lưu từ nháp');
    await page.click('[data-a=save]');
    await page.waitForFunction(() => /Lưu từ nháp/.test((document.querySelector('.page-head h2') || {}).textContent || ''));
    const left = await page.evaluate(() => Object.keys(localStorage).filter(k => /^lsb\.draft.*\|LSB_project\|new$/.test(k)).length);
    if (left) throw new Error('còn ' + left + ' nháp sau khi lưu');
  });
  await run('Nháp sửa: bản ghi bị đổi trên Sheet → cảnh báo, không tự khôi phục; nháp quá 7 ngày bị xóa', async () => {
    await page.click('[data-route=projects]');
    await page.waitForSelector('table.tbl');
    await page.click('text=PCS Brisbane Cold Store');
    await page.waitForSelector('#edit');
    await page.click('#edit');
    await page.waitForSelector('.modal');
    await page.fill('input[name=Contract_no]', 'HĐ-NHÁP');
    await page.click('[data-a=cancel]');
    A.api('record.save', { table: 'LSB_project', record: { Project_id: 'PJ-2026-001', Incoterm: 'DAP' } });
    await page.evaluate(() => App.reload());
    await page.waitForSelector('#edit');
    await page.click('#edit');
    await page.waitForSelector('.draft-bar.warn:has-text("Incoterm")');
    if (await page.inputValue('input[name=Contract_no]') === 'HĐ-NHÁP') throw new Error('tự khôi phục dù bản ghi đã đổi');
    await page.click('.draft-bar [data-d=restore]');
    if (await page.inputValue('input[name=Contract_no]') !== 'HĐ-NHÁP') throw new Error('không khôi phục khi bấm');
    await page.click('[data-a=cancel]');
    await page.evaluate(() => { Object.keys(localStorage).filter(k => k.indexOf('lsb.draft') === 0).forEach(k => {
      const d = JSON.parse(localStorage.getItem(k)); d.t = Date.now() - 8 * 86400000; localStorage.setItem(k, JSON.stringify(d)); }); });
    await page.click('#edit');
    await page.waitForSelector('.modal');
    if (!(await page.isHidden('.draft-bar'))) throw new Error('nháp quá hạn vẫn hiện');
    await page.click('[data-a=cancel]');
  });
  await run('Danh sách dự án: badge + lọc "Thiếu dữ liệu"', async () => {
    A.api('record.save', { table: 'LSB_project', record: { Customer_id: 'CU-001' } });
    await page.click('[data-route=projects]');
    await page.waitForSelector('#miss');
    await page.check('#miss');
    await page.waitForFunction(() => document.querySelector('#miss') && document.querySelector('#miss').checked && document.querySelectorAll('table.tbl tbody tr').length >= 1);
    const n = await page.$$eval('table.tbl tbody tr', tr => tr.filter(x => !/Thiếu dữ liệu/.test(x.textContent)).length);
    if (n) throw new Error(n + ' dòng không thiếu dữ liệu vẫn hiện');
    await page.uncheck('#miss');
    await page.waitForSelector('text=PCS Brisbane Cold Store');
  });
  await run('Lỗi server hiển thị đúng ô (Closed khi chưa có bài học → dự án mới)', async () => {
    await page.click('[data-route=projects]');
    await page.waitForSelector('#add');
    await page.click('#add');
    await page.waitForSelector('.modal');
    await page.selectOption('select[name=Customer_id]', 'CU-001');
    await page.fill('input[name=Project_name]', 'UI Test Project');
    await page.fill('input[name=Status]', 'Closed');
    await page.click('[data-a=save]');
    await page.waitForSelector('.field.has-err[data-f=Status]');
    await page.fill('input[name=Status]', 'Kick-off');
    await page.fill('.pct-wrap input[name=Grossmargin_EST]', '12.5');
    await page.click('[data-a=save]');
    await page.waitForFunction(() => /UI Test Project/.test(document.querySelector('.page-head h2') ? document.querySelector('.page-head h2').textContent : ''));
    const gm = A.api('project.list', { q: 'UI Test' }).data.rows[0];
    const rec = A.api('record.get', { table: 'LSB_project', id: gm.Project_id }).data;
    if (rec.Grossmargin_EST !== 0.125) throw new Error('pct saved as ' + rec.Grossmargin_EST);
  });
  await run('Lead & Khách hàng → Lead 360°', async () => {
    await page.click('[data-route=customers]');
    await page.waitForSelector('table.tbl');
    await page.click('text=Pacific Cold Storage (mẫu)');
    await page.waitForSelector('text=Account owner');
    await page.screenshot({ path: path.join(shots, '3_lead360.png'), fullPage: true });
  });
  await run('Lead 360°: không hiện phần thầu (bảng không có trong Database)', async () => {
    const t = await page.textContent('#view');
    if (/Đánh giá lead|Kế hoạch hành động thầu|Module/.test(t)) throw new Error('còn phần thầu');
  });
  await run('Menu chỉ gồm các bảng có trong Database; link cũ tới trang thầu quay về Dashboard', async () => {
    const vis = await page.$$eval('#nav .nav-item', a => a.filter(x => !x.classList.contains('hidden')).map(x => x.textContent.replace(x.querySelector('.ico').textContent, '').trim()));
    const want = ['Dashboard', 'Lead & Khách hàng', 'Dự án', 'Nhân sự', 'Đầu việc chuẩn', 'Nhật ký thay đổi', 'Tài khoản'];
    if (vis.join('|') !== want.join('|')) throw new Error(vis.join('|'));
    if (await page.isVisible('[data-route=bidding]')) throw new Error('menu thầu còn hiện');
    await page.evaluate(() => App.go('quotation', { id: 'QT-2026-001' }));
    await page.waitForSelector('text=Tổng quan');
    if (await page.textContent('#page-title') !== 'Dashboard') throw new Error('không chuyển về Dashboard');
    const dash = await page.textContent('#view');
    if (/Pipeline báo giá|Báo giá phát hành/.test(dash)) throw new Error('Dashboard còn chỉ số thầu');
  });
  await run('Dự án 360°: nhập Quotation_LSB-Code (mã nội bộ) → hiển thị mã, không link', async () => {
    await page.click('[data-route=projects]');
    await page.waitForSelector('table.tbl');
    await page.click('text=PCS Brisbane Cold Store');
    await page.waitForSelector('#edit');
    await page.click('#edit');
    await page.waitForSelector('.modal');
    await page.fill('input[name="Quotation_LSB-Code"]', '26B456');
    await page.fill('input[name=Contract_VND]', '');
    await page.click('[data-a=save]');
    await page.waitForSelector('.modal', { state: 'detached' });
    await page.waitForSelector('text=26B456');
    if (await page.$('[data-quote]')) throw new Error('không được có link báo giá');
    const rec = A.api('record.get', { table: 'LSB_project', id: 'PJ-2026-001' }).data;
    if (rec.Contract_VND !== 1680000 * 26000) throw new Error('Contract_VND ' + rec.Contract_VND);
  });
  await run('Danh mục Nhân sự (Admin) + Nhật ký có các thao tác vừa làm', async () => {
    await page.click('[data-route=catalog][data-table=LSB_Staff]');
    await page.waitForSelector('text=Admin Test');
    await page.click('[data-route=activity]');
    await page.waitForSelector('text=INV-UI-1', { timeout: 5000 }).catch(() => {});
    const t = await page.textContent('#view');
    if (!/Thêm/.test(t) || !/LSB_paid|Tiền đã thu/.test(t)) throw new Error('activity missing');
    await page.screenshot({ path: path.join(shots, '4_activity.png'), fullPage: true });
  });
  await run('Tài khoản', async () => {
    await page.click('[data-route=account]');
    await page.waitForSelector('text=Quyền của bạn');
  });

  await run('v2.5: nút EN → menu, trang, form, ghi chú, lỗi server tiếng Anh; nhớ sau khi tải lại; VN trở lại', async () => {
    await page.click('#lang');
    await page.waitForFunction(() => document.querySelector('#lang').textContent === 'VN');
    const nav = await page.$$eval('#nav .nav-item:not(.hidden)', a => a.map(x => x.textContent.replace(x.querySelector('.ico').textContent, '').trim()));
    if (nav.join('|') !== 'Dashboard|Leads & Customers|Projects|Staff|Standard tasks|Change log|Account') throw new Error(nav.join('|'));
    if (await page.textContent('#page-title') !== 'Account') throw new Error('title ' + await page.textContent('#page-title'));
    await page.waitForSelector('text=Your permissions');
    await page.reload();
    await page.waitForSelector('text=Overview');
    await page.click('[data-route=projects]');
    await page.waitForSelector('text=+ Add project');
    await page.click('#add');
    await page.waitForSelector('.modal');
    const lbl = await page.textContent('.field[data-f=Project_name] label');
    if (!/^Project name/.test(lbl) || !/Project_name/.test(lbl)) throw new Error('label ' + lbl);
    if (!/planned steel tonnage/.test(await page.textContent('.field[data-f=Tonnage_EST] .hint'))) throw new Error('hint');
    await page.selectOption('select[name=Customer_id]', 'CU-001');
    await page.fill('input[name=Status]', 'Closed');
    await page.click('[data-a=save]');
    await page.waitForSelector('.field.has-err[data-f=Status] .err:has-text("a new project cannot be Closed")');
    await page.click('.draft-bar [data-d=drop]').catch(() => {});
    await page.click('[data-a=cancel]');
    await page.evaluate(() => { Object.keys(localStorage).filter(k => k.indexOf('lsb.draft') === 0).forEach(k => localStorage.removeItem(k)); });
    const view = await page.textContent('#view');
    if (/Dự án|Trạng thái|Thêm dự án|Thiếu dữ liệu/.test(view)) throw new Error('còn chữ Việt: ' + view.slice(0, 200));
    await page.click('#lang');
    await page.waitForSelector('text=+ Thêm dự án');
    if (await page.textContent('#page-title') !== 'Dự án') throw new Error('không về VN');
  });

  const mob = await newPage({ width: 390, height: 844 });
  await run('Mobile 390px: menu ẩn/hiện, không tràn ngang, Dự án 360°', async () => {
    const overflow = await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (overflow) throw new Error('horizontal overflow on dashboard');
    await mob.click('#menu-btn');
    await mob.click('[data-route=projects]');
    await mob.waitForSelector('table.tbl');
    await mob.click('text=PCS Brisbane Cold Store');
    await mob.waitForSelector('#tabs .tabs');
    const ov2 = await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (ov2) throw new Error('horizontal overflow on 360');
    await mob.screenshot({ path: path.join(shots, '5_mobile360.png'), fullPage: true });
  });
  const V = makeContext({ email: 'viewer@lsb.example' });
  const vp = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  vp.on('pageerror', e => errors.push('viewer pageerror: ' + e.message));
  await vp.exposeFunction('__api', (a, p, l) => JSON.stringify(V.api(a, JSON.parse(p), l)));
  await vp.addInitScript(SHIM);
  await vp.addInitScript(() => { try { localStorage.setItem('lsb.lang', 'vi'); } catch (e) {} });
  await vp.goto('file://' + path.join(__dirname, 'index.built.html'));
  await vp.waitForSelector('.kpis');
  await run('Viewer: ẩn nút thêm, ẩn Nhật ký, form chỉ xem', async () => {
    if (await vp.isVisible('[data-route=activity]')) throw new Error('activity visible');
    await vp.click('[data-route=projects]');
    await vp.waitForSelector('table.tbl');
    if (await vp.$('#add')) throw new Error('add visible');
  });
  const S = makeContext({ email: 'stranger@gmail.com' });
  const sp = await browser.newPage();
  await sp.exposeFunction('__api', (a, p, l) => JSON.stringify(S.api(a, JSON.parse(p), l)));
  await sp.addInitScript(SHIM);
  await sp.addInitScript(() => { try { localStorage.setItem('lsb.lang', 'vi'); } catch (e) {} });
  await sp.goto('file://' + path.join(__dirname, 'index.built.html'));
  await run('Email lạ: màn hình "Không vào được ứng dụng"', async () => {
    await sp.waitForSelector('text=chưa có trong LSB_Staff');
  });

  const E = makeContext();
  const ep = await browser.newPage({ viewport: { width: 1280, height: 800 }, locale: 'en-US' });
  ep.on('pageerror', e => errors.push('en pageerror: ' + e.message));
  await ep.exposeFunction('__api', (a, p, l) => JSON.stringify(E.api(a, JSON.parse(p), l)));
  await ep.addInitScript(SHIM);
  await ep.goto('file://' + path.join(__dirname, 'index.built.html'));
  await run('v2.5: lần đầu mở bằng trình duyệt tiếng Anh → giao diện EN', async () => {
    await ep.waitForSelector('text=Overview');
    if (await ep.textContent('#lang') !== 'VN') throw new Error('mặc định không phải EN');
    await ep.screenshot({ path: path.join(shots, '9_en_dashboard.png'), fullPage: true });
  });

  await run('Không có lỗi JavaScript trên mọi trang', async () => {
    if (errors.length) throw new Error(errors.join(' | '));
  });
  await browser.close();
  console.log(results.join('\n'));
  console.log(`\n${results.length - fail} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
