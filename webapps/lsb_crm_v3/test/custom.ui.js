// Ca giao diện riêng LSB v3.0: Dashboard 5 tab (bản mẫu đã duyệt) + Dự án 360°. Gọi từ ui.test.js.
const path = require('path');
module.exports = async ({ run, page, newPage, shots }) => {
  const shot = (p, n) => p.screenshot({ path: path.join(shots, n), fullPage: true });
  const noOverflow = async (p, where) => {
    if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) throw new Error('tràn ngang ' + where);
  };
  await run('[LSB] Dashboard: đủ 6 tab đúng thứ tự (Thầu ở vị trí 2), mỗi tab vẽ được', async () => {
    await page.click('[data-route=dashboard]');
    await page.waitForSelector('#dash [data-dt]');
    const ids = await page.$$eval('#dash [data-dt]', b => b.map(x => x.dataset.dt).join(','));
    if (ids !== 'ov,bd,ar,pr,cu,chk') throw new Error('tab ' + ids);
    const expect = { ov: 'Pipeline có trọng số', bd: 'Báo giá đang chạy', ar: 'Thu tiền theo Dự án', pr: 'Lô hàng đang sản xuất', cu: 'Doanh số hợp đồng theo khách hàng', chk: 'Lỗi & lệch' };
    for (const k of Object.keys(expect)) {
      await page.click(`#dash [data-dt=${k}]`);
      await page.waitForSelector('text=' + expect[k]);
      await shot(page, `7_dash_${k}.png`);
    }
  });
  await run('[LSB] Tab Thầu: số liệu khớp fixture (pipeline QT-2026-002 = 900K, có trọng số 360K), bấm dòng → Báo giá 360°', async () => {
    await page.click('#dash [data-dt=bd]');
    await page.selectOption('#yr', 'all');
    const txt = await page.textContent('#dash .kpis');
    if (!/\$900(\.0)?K/.test(txt) || !/\$360(\.0)?K/.test(txt)) throw new Error('KPI thầu: ' + txt.replace(/\s+/g, ' ').slice(0, 200));
    await page.click('tr[data-goq="QT-2026-002"]');
    await page.waitForSelector('text=QT-2026-002');
    await page.waitForSelector('#tabs .tabs');
    await page.click('[data-route=dashboard]');
    await page.waitForSelector('#dash');
  });
  await run('[LSB] Tab Công nợ: USD/VND, cây Dự án → Lô → Đợt, bấm đợt → Dự án 360° › Thanh toán', async () => {
    await page.click('#dash [data-dt=ar]');
    await page.click('[data-cur=VND]');
    await page.waitForSelector('text=(triệu ₫)');
    await page.click('[data-cur=USD]');
    await page.click('[data-tree=open]');
    await page.waitForSelector('tr.lv3');
    await page.click('tr.lv3 >> nth=0');
    await page.waitForSelector('text=Kế hoạch thanh toán');
    if (!(await page.$('#tabs .tab.active[data-t=pay]'))) throw new Error('không mở đúng tab Thanh toán');
  });
  await run('[LSB] Dự án 360°: KPI (HĐ 1,680,000 · đã thu 904,000), 7 tab, thêm lô → Project_id điền sẵn', async () => {
    const k = await page.textContent('.kpis');
    if (!/1,680,000/.test(k) || !/904,000/.test(k)) throw new Error('KPI ' + k.replace(/\s+/g, ' ').slice(0, 200));
    const tabs = await page.$$eval('#tabs .tab', b => b.map(x => x.dataset.t).join(','));
    if (tabs !== 'info,tasks,ship,pay,cost,lesson,log') throw new Error('tab ' + tabs);
    await shot(page, '8_project360.png');
    await page.click('#tabs .tab[data-t=ship]');
    await page.click('[data-add=LSB_shipment]');
    await page.waitForSelector('.modal');
    const v = await page.$eval('.modal [name=Project_id]', e => e.value);
    if (v !== 'PJ-2026-001') throw new Error('Project_id = ' + v);
    await page.waitForFunction(() => { const e = document.querySelector('.modal [name=Shipment_no]'); return e && e.value === '3'; });
    await page.keyboard.press('Escape');
    const close = await page.$('.modal [data-close], .modal .close');
    if (close) await close.click().catch(() => {});
  });
  await run('[LSB] EN: tab Thầu & Dự án 360° tiếng Anh', async () => {
    await page.click('[data-route=dashboard]').catch(() => {});
    await page.waitForSelector('#dash');
    await page.click('#lang');
    await page.click('#dash [data-dt=bd]');
    await page.waitForSelector('text=Open quotations');
    await shot(page, '9_en_bidding.png');
    await page.click('#lang');
    await page.waitForSelector('text=Báo giá đang chạy');
  });
  const mob = await newPage({ width: 390, height: 844 });
  await run('[LSB] Mobile 390px: 6 tab Dashboard + Dự án 360° không tràn ngang', async () => {
    for (const k of ['ov', 'bd', 'ar', 'pr', 'cu', 'chk']) {
      await mob.click(`#dash [data-dt=${k}]`);
      await mob.waitForTimeout(50);
      await noOverflow(mob, 'tab ' + k);
    }
    await shot(mob, '10_mobile_bd.png');
    await mob.click('#dash [data-dt=ar]');
    await mob.click('[data-tree=open]');
    await mob.click('tr.lv3 >> nth=0');
    await mob.waitForSelector('#tabs .tabs');
    await noOverflow(mob, 'Dự án 360°');
  });
};
