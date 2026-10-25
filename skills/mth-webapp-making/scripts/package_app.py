"""Đóng gói bàn giao một phiên bản Web App + lập bảng file thay đổi so với phiên bản trước.

Dùng:
  python3 -I <skill>/scripts/package_app.py <thư_mục_app> --name LSB_WebApp --version 2.6 [--prev <thư_mục_bản_trước>] [--out <thư_mục_ra>]

Tạo trong --out (mặc định: thư mục cha của app):
  <name>_v<version>.zip      gồm <name>_v<version>/ (src, tools, test không có ảnh tạm, HUONG_DAN_CAI_DAT.md, BAN_GIAO.md nếu có)
                             + <name>_v<version>_file_can_dan/ (chỉ file src mới/sửa — để dán nhanh vào Apps Script)
  CHANGED_FILES.md           bảng: # · File trong Apps Script · Loại (Tập lệnh/HTML) · Trạng thái (MỚI/SỬA/XÓA) + danh sách không đổi
Không có --prev: mọi file src là MỚI (cài đặt lần đầu).
"""
import argparse, filecmp, os, shutil, zipfile

ap = argparse.ArgumentParser()
ap.add_argument('app'); ap.add_argument('--name', required=True); ap.add_argument('--version', required=True)
ap.add_argument('--prev', default=''); ap.add_argument('--out', default='')
a = ap.parse_args()
app = os.path.abspath(a.app); out = os.path.abspath(a.out or os.path.dirname(app))
tag = f'{a.name}_v{a.version}'

def srcs(d):
    p = os.path.join(d, 'src')
    return sorted(f for f in os.listdir(p) if os.path.isfile(os.path.join(p, f))) if os.path.isdir(p) else []

cur = srcs(app); prev = srcs(a.prev) if a.prev else []
rows, same = [], []
for f in cur:
    if f not in prev: rows.append((f, 'MỚI'))
    elif not filecmp.cmp(os.path.join(app, 'src', f), os.path.join(a.prev, 'src', f), shallow=False): rows.append((f, 'SỬA'))
    else: same.append(f)
for f in prev:
    if f not in cur: rows.append((f, 'XÓA'))

def kind(f): return 'Tập lệnh (.gs)' if f.endswith('.gs') else 'HTML' if f.endswith('.html') else 'Tệp kê khai (appsscript.json)' if f.endswith('.json') else '—'
def as_name(f): return f.rsplit('.', 1)[0] if f.endswith(('.gs', '.html')) else f
order = {'MỚI': 0, 'SỬA': 1, 'XÓA': 2}
rows.sort(key=lambda x: (order[x[1]], x[0]))
md = [f'# {tag} — file thay đổi' + (f' so với {os.path.basename(a.prev.rstrip("/"))}' if a.prev else ' (cài đặt lần đầu)'), '',
      '| # | File trong Apps Script | Loại | Trạng thái | Cách làm |', '| --- | --- | --- | --- | --- |']
for i, (f, st) in enumerate(rows, 1):
    how = {'MỚI': 'Tạo file mới (＋ › ' + ('Tập lệnh' if f.endswith('.gs') else 'HTML') + ') đặt đúng tên, dán nội dung',
           'SỬA': 'Mở file, xóa hết, dán nội dung mới', 'XÓA': 'Xóa file trong Apps Script'}[st]
    if f == 'appsscript.json': how = 'Cài đặt dự án › bật "Hiển thị tệp kê khai appsscript.json", rồi dán'
    md.append(f'| {i} | `{as_name(f)}` | {kind(f)} | **{st}** | {how} |')
if same: md += ['', 'Không đổi (' + str(len(same)) + '): ' + ', '.join(f'`{as_name(f)}`' for f in same)]
md += ['', 'Sau khi dán: **Triển khai → Quản lý triển khai → ✏ → Phiên bản: Phiên bản mới → Triển khai**. '
       'Chân menu trái và trang *Tài khoản* phải hiện đúng số phiên bản.']
open(os.path.join(out, 'CHANGED_FILES.md'), 'w').write('\n'.join(md) + '\n')

zpath = os.path.join(out, tag + '.zip')
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(app):
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '__pycache__')]
        for f in files:
            full = os.path.join(root, f); rel = os.path.relpath(full, app)
            if rel.startswith(os.path.join('test', 'shots')) or f == 'index.built.html': continue
            z.write(full, os.path.join(tag, rel))
    for f, st in rows:
        if st != 'XÓA': z.write(os.path.join(app, 'src', f), os.path.join(tag + '_file_can_dan', f))
    z.write(os.path.join(out, 'CHANGED_FILES.md'), os.path.join(tag + '_file_can_dan', 'CHANGED_FILES.md'))
print(f'{zpath}\n{len([r for r in rows if r[1] != "XÓA"])} file cần dán · {len(same)} không đổi')
print('\n'.join(md))
