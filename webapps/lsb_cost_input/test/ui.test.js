// Kiểm thử GIAO DIỆN dùng chung: dựng Index.html như HtmlService, nối google.script.run vào backend mô phỏng,
// chạy Chromium (Playwright có sẵn). Ca riêng của DB: test/custom.ui.js — module.exports = async ({ run, page, newPage, A, shots }) => {}.
const fs = require('fs'), path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require(require.resolve('playwright', { paths: [require('child_process').execSync('npm root -g').toString().trim()] }))); }
const { makeContext } = require('./mock');

const SRC = path.join(__dirname, '..', 'src');
function buildIndex(A) {
  let html = fs.readFileSync(path.join(SRC, 'Index.html'), 'utf8');
  html = html.replace(/<\?!=\s*include\('(\w+)'\);?\s*\?>/g, (m, n) => fs.readFileSync(path.join(SRC, n + '.html'), 'utf8'));
  html = html.replace(/<\?=\s*appName\s*\?>/g, A.ctx.APP.NAME).replace(/<\?=\s*appVersion\s*\?>/g, A.ctx.APP.VERSION);
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
  const SCHEMA = A.ctx.SCHEMA, APP = A.ctx.APP, MENU = A.ctx.MENU;
  fs.writeFileSync(path.join(__dirname, 'index.built.html'), buildIndex(A));
  const browser = await chromium.launch();
  const results = []; let fail = 0;
  const errors = [];
  async function run(name, fn) {
    try { await fn(); results.push('  ✔ ' + name); } catch (e) { fail++; results.push('  ✖ ' + name + '\n      ' + e.message.split('\n')[0]); }
  }
  async function newPage(viewport, ctxA, opts) {
    opts = opts || {};
    const B = ctxA || A;
    const page = await browser.newPage({ viewport, locale: opts.locale });
    page.setDefaultTimeout(15000);
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.exposeFunction('__api', (a, p, l) => JSON.stringify(B.api(a, JSON.parse(p), l)));
    await page.addInitScript(SHIM);
    if (!opts.locale) await page.addInitScript(() => { try { if (!localStorage.getItem('lsb.lang')) localStorage.setItem('lsb.lang', 'vi'); } catch (e) {} });
    await page.goto('file://' + path.join(__dirname, 'index.built.html'));
    if (!opts.noWait) await page.waitForSelector('#dash', { timeout: 15000 });
    return page;
  }
  const shots = path.join(__dirname, 'shots'); fs.mkdirSync(shots, { recursive: true });
  const page = await newPage({ width: 1366, height: 900 });
  const menuTables = MENU.flatMap(g => g.items).filter(it => it.table && SCHEMA[it.table]).map(it => it.table);

  await run('Dashboard: KPI + tab Kiểm tra dữ liệu + cảnh báo', async () => {
    if (!(await page.$('#alerts'))) await page.click('[data-dt=ov]');   // Dashboard riêng có thể mở tab khác trước
    await page.waitForSelector('#alerts');
    await page.screenshot({ path: path.join(shots, '1_dashboard.png'), fullPage: true });
    await page.click('[data-dt=chk]');
    await page.waitForSelector('text=Lỗi & lệch');
    await page.screenshot({ path: path.join(shots, '2_checks.png'), fullPage: true });
    await page.click('[data-dt=ov]');
  });
  await run('Menu sinh từ MENU: đủ mục, mỗi mục mở được danh sách', async () => {
    const items = await page.$$eval('#nav-dynamic .nav-item', a => a.map(x => x.dataset.table).filter(Boolean));   // mục trang riêng (route) không có bảng
    if (items.join() !== menuTables.join()) throw new Error('menu ' + items.join() + ' ≠ ' + menuTables.join());
    for (const tb of menuTables) {
      await page.click(`#nav-dynamic .nav-item[data-table="${tb}"]`);
      await page.waitForSelector('.page-head h2');
      await page.waitForFunction(t => document.querySelector('#page-title').textContent.length > 0 && !document.querySelector('.loading'), tb);
    }
  });
  const t360 = menuTables.find(tb => SCHEMA[tb].view360 && A.api('record.list', { table: tb }).data.total > 0);
  if (t360) await run('Trang 360° (' + t360 + '): tab thông tin + tab bảng con; thêm bản ghi con → FK điền sẵn', async () => {
    await page.click(`#nav-dynamic .nav-item[data-table="${t360}"]`);
    await page.waitForSelector('table.tbl tr[data-i]');
    await page.click('table.tbl tr[data-i] >> nth=0');
    await page.waitForSelector('#tabs .tabs');
    await page.screenshot({ path: path.join(shots, '3_view360.png'), fullPage: true });
    const childTab = await page.$('#tabs .tab:not([data-t=info]):not([data-t=log])');
    if (childTab) {
      await childTab.click();
      const add = await page.$('[data-add]');
      if (add) {
        await add.click();
        await page.waitForSelector('.modal');
        const fk = await page.$$eval('.modal select[data-ref]', s => s.map(x => x.value).filter(Boolean));
        if (!fk.length) throw new Error('FK không điền sẵn');
        await page.click('[data-a=cancel]');
        await page.click('.draft-bar [data-d=drop]').catch(() => {});
      }
    }
  });
  const tAdd = menuTables.find(tb => A.ctx.CATALOG_TABLES.indexOf(tb) < 0);
  if (tAdd) await run('Thêm mới (' + tAdd + '): mã dự kiến hiện ngay, lưu chỉ với FK bắt buộc', async () => {
    await page.click(`#nav-dynamic .nav-item[data-table="${tAdd}"]`);
    await page.waitForSelector('#add');
    await page.click('#add');
    await page.waitForSelector('.modal [data-pk]');
    await page.waitForFunction(p => new RegExp('^' + p + '-').test(document.querySelector('.modal [data-pk]').textContent), SCHEMA[tAdd].prefix);
    for (const c of SCHEMA[tAdd].columns.filter(c => c.key === 'FK' && c.required)) {
      const opts = await page.$$eval(`select[name="${c.name}"] option`, o => o.map(x => x.value).filter(Boolean));
      if (!opts.length) return;   // chưa có bản ghi cha trong dữ liệu mẫu
      await page.selectOption(`select[name="${c.name}"]`, opts[0]);
    }
    await page.click('[data-a=save]');
    await page.waitForSelector('.toast.ok');
    await page.screenshot({ path: path.join(shots, '4_after_add.png'), fullPage: true });
  });
  await run('Nút EN: menu, Dashboard, trang danh sách chuyển tiếng Anh; VN trở lại', async () => {
    await page.click('[data-route=dashboard]');
    await page.waitForSelector('#dash');
    await page.click('#lang');
    await page.waitForFunction(() => document.querySelector('#lang').textContent === 'VN');
    await page.waitForSelector('text=Data check');
    const nav = await page.textContent('#nav');
    if (/[À-ỹ]/.test(nav)) throw new Error('menu còn chữ Việt: ' + nav.replace(/\s+/g, ' ').slice(0, 160));
    await page.screenshot({ path: path.join(shots, '5_en_dashboard.png'), fullPage: true });
    await page.click('#lang');
    await page.waitForSelector('text=Kiểm tra dữ liệu');
  });

  const mob = await newPage({ width: 390, height: 844 });
  await run('Mobile 390px: không tràn ngang ở Dashboard và danh sách', async () => {
    if (await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error('tràn ngang dashboard');
    await mob.click('#menu-btn');
    await mob.click(`#nav-dynamic .nav-item >> nth=0`);
    await mob.waitForSelector('.page-head h2');
    if (await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error('tràn ngang danh sách');
    await mob.screenshot({ path: path.join(shots, '6_mobile.png'), fullPage: true });
  });
  if (APP.FEATURES.AUTH !== false) {
    const vp = await newPage({ width: 1280, height: 800 }, makeContext({ email: 'viewer@test.example' }));
    await run('Viewer: không có nút Thêm, không thấy Nhật ký', async () => {
      await vp.click(`#nav-dynamic .nav-item >> nth=0`);
      await vp.waitForSelector('.page-head h2');
      if (await vp.$('#add')) throw new Error('Viewer thấy nút Thêm');
      if (await vp.isVisible('[data-route=activity]')) throw new Error('Viewer thấy Nhật ký');
    });
    const sp = await newPage({ width: 1280, height: 800 }, makeContext({ email: 'stranger@gmail.com' }), { noWait: true });
    await run('Email lạ: màn hình "Không vào được ứng dụng"', async () => { await sp.waitForSelector('.fatal'); });
  }
  const en = await newPage({ width: 1280, height: 800 }, null, { locale: 'en-US' });
  await run('Trình duyệt tiếng Anh mở lần đầu → giao diện EN', async () => {
    await en.waitForSelector('text=Overview');
    if (await en.textContent('#lang') !== 'VN') throw new Error('mặc định không phải EN');
  });

  const custom = path.join(__dirname, 'custom.ui.js');
  if (fs.existsSync(custom)) await require(custom)({ run, page, newPage, A, shots, makeContext });

  await run('Không có lỗi JavaScript trên mọi trang', async () => { if (errors.length) throw new Error(errors.join(' | ')); });
  await browser.close();
  console.log(results.join('\n'));
  console.log(`\n${results.length - fail} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
