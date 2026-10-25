// Ca giao diện riêng LSB Cost Input (gọi từ ui.test.js). Thêm vài báo giá vào backend mô phỏng để biểu đồ / so sánh có dữ liệu.
const path = require('path');
module.exports = async ({ run, page, newPage, A, shots, makeContext }) => {
  const today = new Date().toISOString().slice(0, 10);
  const plate = { spec_grade: 'SS400', spec_standard: 'JIS G3101', spec_thickness_mm: 10, spec_width_mm: 1500, spec_length_mm: 6000, unit: 'kg', description: 'Steel plate' };
  const save = (table, record) => { const r = A.api('record.save', { table, record }); if (!r.ok) throw new Error(JSON.stringify(r.error)); return r.data.record; };
  save('FX_Rates', { effective_date: '2026-04-01', currency: 'USD', rate: 25450 });
  save('FX_Rates', { effective_date: '2026-07-01', currency: 'USD', rate: 25800 });
  [['2026-04-01', '2026-06-30', 14725, 14434, 0.6], ['2026-07-01', '2026-09-30', 15268, 14960, 0.62]].forEach(([a, b, p1, p2, p3]) => {
    save('Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0001', effective_date: a, valid_until: b, currency: 'VND', unit_price: p1 }, plate));
    save('Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0002', effective_date: a, valid_until: b, currency: 'VND', unit_price: p2 }, plate));
    save('Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0003', effective_date: a, valid_until: b, currency: 'USD', unit_price: p3 }, plate));
  });
  save('Mat_SteelPlate', Object.assign({ supplier_id: 'SUP-0003', effective_date: '2026-10-01', valid_until: '2026-11-05', currency: 'USD', unit_price: 0.65 }, plate));
  save('Prod_Subcontract', { supplier_id: 'SUP-0002', process_id: 'PRO-01', product_type: 'Built-up member (example)', unit: 'kg', currency: 'VND', unit_price: 950, effective_date: '2026-10-05', valid_until: '2026-12-31' });

  const noOverflow = async (p, what) => { if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error('tràn ngang ' + what); };

  await run('[Cost] Dashboard › Giá tham chiếu: KPI, 12 nhóm, mở dòng → từng NCC; số đúng (SUP-0001 15,500 rẻ nhất, 2 / 3 NCC, chênh 9.0%)', async () => {
    await page.click('[data-route=dashboard]');
    await page.click('[data-dt=ref]');
    await page.waitForSelector('#c-ref');
    const kpi = await page.textContent('.kpis');
    if (!/12 \/ 12/.test(kpi)) throw new Error('KPI mặt hàng: ' + kpi);
    const n = await page.$$eval('#c-ref tr[data-ref]', x => x.length);
    if (n !== 12) throw new Error('số mặt hàng ' + n);
    await page.click('#c-ref tr[data-ref] >> nth=0');
    await page.waitForSelector('#c-ref tr.csub');
    const first = await page.textContent('#c-ref tr[data-ref] >> nth=0');
    // SUP-0001 15,500 (tới 31/12) và SUP-0003 0.65 USD × 26,000 = 16,900 còn hiệu lực; SUP-0002 mới nhất hết hạn 30/09 → 2 / 3, chênh 9.0%
    if (!/15,500/.test(first) || !/XYZ Supplier/.test(first) || !/2 \/ 3/.test(first) || !/9\.0%/.test(first)) throw new Error('giá tham chiếu thép tấm: ' + first.replace(/\s+/g, ' '));
    await page.screenshot({ path: path.join(shots, 'c1_ref.png'), fullPage: true });
    await page.selectOption('#c-g', 'Mat_Paint');
    await page.waitForFunction(() => document.querySelectorAll('#c-ref tr[data-ref]').length === 1);
    await page.selectOption('#c-g', '');
  });
  await run('[Cost] Dashboard › Lịch sử giá: biểu đồ 3 NCC, bảng báo giá mới nhất ở trên', async () => {
    await page.click('[data-dt=hist]');
    await page.waitForSelector('.chart svg polyline');
    const lines = await page.$$eval('.chart svg polyline', x => x.length);
    if (lines !== 3) throw new Error('số đường ' + lines);
    await page.screenshot({ path: path.join(shots, 'c2_hist.png'), fullPage: true });
  });
  await run('[Cost] Dashboard › Sản xuất & vận tải + Cách tính + Cảnh báo', async () => {
    await page.click('[data-dt=pt]');
    await page.waitForSelector('text=Công đoạn: tự làm hay thuê ngoài');
    const t = await page.textContent('#dash');
    if (!/Thuê ngoài rẻ hơn 5%/.test(t)) throw new Error('so sánh tự làm 1000 vs thuê ngoài 950');
    if (!/35,100,000/.test(t)) throw new Error('cước biển 1350 USD × 26000');
    await page.screenshot({ path: path.join(shots, 'c3_prod_trans.png'), fullPage: true });
    await page.click('[data-dt=how]');
    await page.waitForSelector('text=Giá tham chiếu');
    await page.click('[data-dt=ov]');
    await page.waitForSelector('#alerts .alert');
    await page.screenshot({ path: path.join(shots, 'c4_alerts.png'), fullPage: true });
  });
  await run('[Cost] Bảng giá vật tư: 1 mục menu, 12 nhóm, đổi nhóm, thêm báo giá → mã MPT-00002 hiện trước', async () => {
    await page.click('[data-route=mat]');
    await page.waitForSelector('#mat-groups .chip.on');
    if (await page.$$eval('#mat-groups .chip', x => x.length) !== 12) throw new Error('12 nhóm');
    if (!(await page.$('.nav-item.active[data-route=mat]'))) throw new Error('menu không sáng');
    await page.click('#mat-groups [data-grp=Mat_Paint]');
    await page.waitForFunction(() => /Sơn/.test(document.querySelector('.page-head h2').textContent));
    await page.screenshot({ path: path.join(shots, 'c5_materials.png'), fullPage: true });
    await page.click('#add');
    await page.waitForFunction(() => /MPT-00002/.test(document.querySelector('.modal [data-pk]').textContent));
    await page.click('[data-a=cancel]');
    await page.click('.draft-bar [data-d=drop]').catch(() => {});
    await page.click('[data-route=mat]');
    await page.waitForFunction(() => /Sơn/.test(document.querySelector('.page-head h2').textContent));   // nhớ nhóm vừa chọn
  });
  await run('[Cost] NCC 360°: KPI, tab theo mảng, thêm báo giá từ NCC → supplier_id điền sẵn', async () => {
    await page.evaluate(() => App.go('entity', { table: 'Suppliers', id: 'SUP-0001' }));
    await page.waitForSelector('#tabs .tab');
    const k = await page.textContent('.kpis');
    if (!/Báo giá/.test(k)) throw new Error(k);
    await page.screenshot({ path: path.join(shots, 'c6_supplier360.png'), fullPage: true });
    await page.selectOption('#add-q', 'Trans_Sea');
    await page.waitForSelector('.modal select[name=supplier_id]');
    const v = await page.$eval('.modal select[name=supplier_id]', s => s.value);
    if (v !== 'SUP-0001') throw new Error('supplier_id = ' + v);
    await page.click('[data-a=cancel]');
    await page.click('.draft-bar [data-d=drop]').catch(() => {});
    await page.click('#tabs .tab[data-t=mat]');
    await page.click('#tabs tr[data-row] >> nth=0');
    await page.waitForSelector('.modal');
    await page.click('[data-a=cancel]');
  });
  await run('[Cost] Cảng 360° + Công đoạn 360°', async () => {
    await page.evaluate(() => App.go('entity', { table: 'Ports', id: 'PORT-01' }));
    await page.waitForSelector('#tabs .tab[data-t=out]');
    await page.screenshot({ path: path.join(shots, 'c7_port360.png'), fullPage: true });
    await page.evaluate(() => App.go('entity', { table: 'Processes', id: 'PRO-01' }));
    await page.waitForSelector('#tabs .tab[data-t=ih]');
    const t = await page.textContent('#tabs');
    if (!/1,000/.test(t)) throw new Error('đơn giá tự làm 1,000');
    await page.screenshot({ path: path.join(shots, 'c8_process360.png'), fullPage: true });
  });
  await run('[Cost] Danh sách chọn: Admin sửa + lưu (đơn vị mới dùng được ngay); Viewer chỉ xem', async () => {
    await page.click('[data-route=lists]');
    await page.waitForSelector('textarea[data-name=Unit]');
    await page.screenshot({ path: path.join(shots, 'c9_lists.png'), fullPage: true });
    const ta = 'textarea[data-name=Unit]';
    await page.fill(ta, (await page.inputValue(ta)) + '\ncuộn');
    const i = await page.$eval(ta, el => el.id.slice(1));
    await page.click(`[data-save="${i}"]`);
    await page.waitForSelector('.toast.ok');
    const lists = await page.evaluate(() => App.boot.config.lists.Unit);
    if (lists.indexOf('cuộn') < 0) throw new Error('Unit chưa có cuộn');
    const vp = await newPage({ width: 1280, height: 800 }, makeContext({ email: 'viewer@test.example' }));
    await vp.click('[data-route=lists]');
    await vp.waitForSelector('.clist .badge');
    if (await vp.$('textarea')) throw new Error('Viewer thấy ô sửa');
    await vp.close();
  });
  await run('[Cost] EN: tab Dashboard, 360°, danh sách chọn bằng tiếng Anh', async () => {
    await page.click('#lang');
    await page.click('[data-route=dashboard]');
    await page.click('[data-dt=ref]');
    await page.waitForSelector('text=Reference price by item');
    const tabs = await page.textContent('.dash-tabs');
    if (/[À-ỹ]/.test(tabs)) throw new Error('tab còn chữ Việt: ' + tabs);
    await page.screenshot({ path: path.join(shots, 'c10_en_ref.png'), fullPage: true });
    await page.evaluate(() => App.go('entity', { table: 'Suppliers', id: 'SUP-0003' }));
    await page.waitForSelector('text=Supplier 360°');
    await page.click('#lang');
    await page.waitForSelector('#lang:has-text("EN")');
  });
  const mob = await newPage({ width: 390, height: 844 }, A);
  await run('[Cost] Mobile 390px: Dashboard (3 tab), Bảng giá vật tư, NCC 360° không tràn ngang', async () => {
    for (const tab of ['ref', 'hist', 'pt']) { await mob.click(`[data-dt=${tab}]`); await mob.waitForTimeout(150); await noOverflow(mob, 'dashboard ' + tab); }
    await mob.screenshot({ path: path.join(shots, 'c11_mobile_pt.png'), fullPage: true });
    await mob.evaluate(() => App.go('mat'));
    await mob.waitForSelector('#mat-groups');
    await noOverflow(mob, 'vật tư');
    await mob.evaluate(() => App.go('entity', { table: 'Suppliers', id: 'SUP-0001' }));
    await mob.waitForSelector('#tabs .tab');
    await noOverflow(mob, 'NCC 360');
    await mob.screenshot({ path: path.join(shots, 'c12_mobile_360.png'), fullPage: true });
  });
};
