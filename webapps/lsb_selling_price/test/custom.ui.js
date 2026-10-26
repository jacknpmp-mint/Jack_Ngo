// Ca giao diện riêng LSB Selling Price DB (gọi từ ui.test.js). Kiểm cả số liệu (so với spd.data của backend).
const path = require('path');
module.exports = async ({ run, page, newPage, A, shots, makeContext }) => {
  const D = A.api('spd.data').data;
  const nav = async (p, route) => { await p.click(`#nav-dynamic .nav-item[data-route="${route}"]`); await p.waitForSelector('#spd'); };

  await run('[SPD] Tra cứu giá: mặc định hạng mục đầu, KPI = số dòng khớp, đổi USD/VND, bấm dòng → Dự án 360°', async () => {
    await nav(page, 'price_lookup');
    const n = D.lines.filter(l => l.item === D.items[0].id).length;
    const kpi = await page.textContent('.kpi .v');
    if (kpi.trim() !== String(n)) throw new Error('KPI dòng ' + kpi + ' ≠ ' + n);
    await page.screenshot({ path: path.join(shots, '7_lookup_usd.png'), fullPage: true });
    await page.click('[data-cur=BASE]');
    await page.waitForSelector('text=Giá bán TB / ĐV (VND)');
    await page.selectOption('[data-f=stg]', 'Job');
    const n2 = D.lines.filter(l => l.item === D.items[0].id && l.stg === 'Job').length;
    if ((await page.textContent('.kpi .v')).trim() !== String(n2)) throw new Error('lọc Job');
    await page.click('[data-cur=USD]');
    await page.click('#lk table.tbl tr[data-i] >> nth=0');
    await page.waitForSelector('#copy');
  });

  await run('[SPD] Tổng hợp: 5 cách xem; theo khách hàng đúng số dự án; nhóm VT × thị trường có cột cùng đơn vị', async () => {
    await nav(page, 'price_summary');
    const rows = await page.$$eval('table.tbl tbody tr', t => t.length);
    const exp = D.customers.filter(c => D.projects.some(p => p.cus === c.id)).length;
    if (rows !== exp) throw new Error('rows ' + rows + ' ≠ ' + exp);
    for (const s of ['mkt', 'item', 'grpm', 'grpc']) { await page.click(`[data-s=${s}]`); await page.waitForSelector('table.tbl'); }
    await page.waitForSelector('text=Cùng đơn vị?');
    await page.screenshot({ path: path.join(shots, '8_summary.png'), fullPage: true });
  });

  await run('[SPD] Bid vs Job: KPI dự án có cả Bid/Job đúng, có dòng lệch quy cách', async () => {
    await nav(page, 'bid_job');
    const exp = D.projects.filter(p => p.gmBid !== null && p.gmJob !== null).length;
    if ((await page.textContent('.kpi .v')).trim() !== String(exp)) throw new Error('kpi');
    await page.waitForSelector('text=Spec differs');
    await page.screenshot({ path: path.join(shots, '9_bidjob.png'), fullPage: true });
  });

  await run('[SPD] Dự án 360°: nút chép tắt khi Quoting; PRJ-0010 (Won) chép xong → tab hạng mục có dòng Job', async () => {
    await page.evaluate(() => App.go('entity', { table: 'Projects', id: 'PRJ-0005' }));
    await page.waitForSelector('#copy[disabled]');
    await page.evaluate(() => App.go('entity', { table: 'Projects', id: 'PRJ-0010' }));
    await page.waitForSelector('#copy:not([disabled])');
    const nBid = D.lines.filter(l => l.prj === 'PRJ-0010').length;
    await page.click('#copy');
    await page.click('.modal [data-a=yes]');
    await page.waitForSelector('.toast.ok');
    await page.waitForFunction(n => document.querySelectorAll('#tabs table.tbl tbody tr').length === n * 2, nBid);
    await page.waitForSelector('#copy[disabled]');
    await page.screenshot({ path: path.join(shots, '10_project360.png'), fullPage: true });
  });

  await run('[SPD] Form xem trước: dòng hạng mục → hiện giá USD và GM% đúng công thức', async () => {
    await page.evaluate(() => App.go('entity', { table: 'Projects', id: 'PRJ-0002' }));
    await page.waitForSelector('[data-add=Project_Items]');
    await page.click('[data-add=Project_Items]');
    await page.waitForSelector('.modal select[name=project_id]');
    await page.fill('[name=cost_material]', '16000'); await page.fill('[name=cost_fabrication]', '3000');
    await page.fill('[name=unit_sell]', '1');
    const p = D.projects.find(x => x.id === 'PRJ-0002');
    const sB = 1 * p.fxs, cB = 19000 * p.fxc, gm = ((sB - cB) / sB * 100).toFixed(1) + '%';
    await page.waitForFunction(g => document.querySelector('.form-preview') && document.querySelector('.form-preview').textContent.includes(g), gm);
    await page.screenshot({ path: path.join(shots, '11_form_preview.png') });
    await page.click('[data-a=cancel]');
    await page.click('.draft-bar [data-d=drop]').catch(() => {});
  });

  await run('[SPD] Danh sách chọn: Admin thêm giá trị → hiện chip; giá trị đang dùng không có nút xóa', async () => {
    await nav(page, 'lists');
    await page.fill('[data-in="Unit"]', 'set');
    await page.click('[data-addl="Unit"]');
    await page.waitForSelector('.spd-chip >> text=set');
    if (await page.$('[data-rm="Currency"][data-v="USD"]')) throw new Error('USD đang dùng mà có nút xóa');
    await page.click('[data-rm="Unit"][data-v="set"]');
    await page.click('.modal [data-a=yes]');
    await page.waitForFunction(() => !document.querySelector('[data-rm="Unit"][data-v="set"]'));
    await page.screenshot({ path: path.join(shots, '12_lists.png'), fullPage: true });
  });

  await run('[SPD] Tiếng Anh: trang Tra cứu giá + Dự án 360° chuyển EN', async () => {
    await page.click('#lang');
    await nav(page, 'price_lookup');
    await page.waitForSelector('text=Matching price rows');
    await page.screenshot({ path: path.join(shots, '13_lookup_en.png'), fullPage: true });
    await page.evaluate(() => App.go('entity', { table: 'Projects', id: 'PRJ-0001' }));
    await page.waitForSelector('text=Copy bid → job');
    await page.click('#lang');
  });

  const mob = await newPage({ width: 390, height: 844 });
  await run('[SPD] Mobile 390px: trang phân tích và Dự án 360° không tràn ngang', async () => {
    for (const r of ['price_lookup', 'price_summary', 'bid_job']) {
      await mob.evaluate(x => App.go(x, {}), r); await mob.waitForSelector('#spd');
      if (await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error('tràn ' + r);
    }
    await mob.evaluate(() => App.go('entity', { table: 'Projects', id: 'PRJ-0001' })); await mob.waitForSelector('#tabs');
    if (await mob.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error('tràn 360');
    await mob.screenshot({ path: path.join(shots, '14_mobile_360.png'), fullPage: true });
  });

  const vw = await newPage({ width: 1280, height: 800 }, makeContext({ email: 'viewer@test.example' }));
  await run('[SPD] Viewer: không có nút chép Bid → Job, danh sách chọn chỉ xem', async () => {
    await vw.evaluate(() => App.go('entity', { table: 'Projects', id: 'PRJ-0002' })); await vw.waitForSelector('#tabs');
    if (await vw.$('#copy')) throw new Error('Viewer thấy nút chép');
    await vw.evaluate(() => App.go('lists', {})); await vw.waitForSelector('#spd');
    if (await vw.$('[data-addl]')) throw new Error('Viewer thêm được');
  });
};
