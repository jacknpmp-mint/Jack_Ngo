"""Tạo thư mục app mới từ bộ khung (hoặc cập nhật lõi của app đã có).

Dùng:
  python3 -I <skill>/scripts/scaffold.py <thư_mục_app>            # app mới: chép src/ test/ tools/
  python3 -I <skill>/scripts/scaffold.py <thư_mục_app> --update   # app cũ: chỉ ghi đè file LÕI, giữ file riêng của DB
File RIÊNG của DB (không bao giờ ghi đè khi --update): src/01_Config.gs, src/12_Labels.gs (sinh lại bằng gen_config),
src/Custom.html, src/2*_*.gs (module nghiệp vụ), test/custom.test.js, test/custom.ui.js, test/data*.json, tools/app_spec.json.
"""
import os, shutil, sys
SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STARTER = os.path.join(SKILL, 'assets', 'starter')
dst = os.path.abspath(sys.argv[1]); update = '--update' in sys.argv
OWN = {'01_Config.gs', '12_Labels.gs', 'Custom.html', 'custom.test.js', 'custom.ui.js', 'data.json', 'data_real.json', 'app_spec.json', 'schema_raw.json'}
def own(name): return name in OWN or (name.startswith('2') and name.endswith('.gs'))
copied = []
for sub in ['src', 'test']:
    os.makedirs(os.path.join(dst, sub), exist_ok=True)
    for f in sorted(os.listdir(os.path.join(STARTER, sub))):
        target = os.path.join(dst, sub, f)
        if update and own(f) and os.path.exists(target): continue
        shutil.copy(os.path.join(STARTER, sub, f), target); copied.append(sub + '/' + f)
os.makedirs(os.path.join(dst, 'tools', 'templates'), exist_ok=True)
for f in ['extract_xlsx.py', 'gen_config.py', 'base_labels.json', 'xlsx_xml.py']:
    src = os.path.join(SKILL, 'scripts', f)
    if os.path.exists(src): shutil.copy(src, os.path.join(dst, 'tools', f)); copied.append('tools/' + f)
shutil.copy(os.path.join(SKILL, 'scripts', 'templates', 'config_template.gs'), os.path.join(dst, 'tools', 'templates', 'config_template.gs'))
gi = os.path.join(dst, '.gitignore')
if not os.path.exists(gi):
    open(gi, 'w').write('test/data_real.json\ntest/shots/\ntest/index.built.html\n__pycache__/\n')
print(('Cập nhật lõi' if update else 'Tạo app') + f' {dst}: {len(copied)} file')
