"""Sinh src/01_Config.gs + src/12_Labels.gs từ tools/schema_raw.json (extract_xlsx.py) + tools/app_spec.json.

Dùng (từ thư mục app):
  python3 -I tools/gen_config.py --init     # lần đầu: tạo tools/app_spec.json NHÁP (suy đoán) để xem lại với người dùng
  python3 -I tools/gen_config.py            # sinh 01_Config.gs + 12_Labels.gs; in các nhãn còn thiếu
  python3 -I tools/gen_config.py --check    # chỉ kiểm tra app_spec.json khớp schema_raw.json

app_spec.json là NGUỒN SỰ THẬT về quyết định của người dùng (nhãn, bắt buộc, tự tính, menu, cảnh báo…).
Không sửa tay 01_Config.gs / 12_Labels.gs — sửa app_spec.json rồi sinh lại.
"""
import json, os, re, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SPEC = os.path.join(HERE, 'app_spec.json')
RAW = os.path.join(HERE, 'schema_raw.json')
TPL = os.path.join(HERE, 'templates', 'config_template.gs')
BASE = os.path.join(HERE, 'base_labels.json')
raw = json.load(open(RAW))
O = collections.OrderedDict

def human(name):
    return re.sub(r'\s+', ' ', name.replace('_', ' ')).strip()

def short(table, prefix):
    return table[len(prefix):] if prefix and table.startswith(prefix) else table

# ------------------------------------------------------------------ --init
def init_spec():
    if os.path.exists(SPEC) and '--force' not in sys.argv:
        sys.exit('tools/app_spec.json đã có — thêm --force để ghi đè.')
    prefix = raw['prefix']
    T = raw['tables']
    children = collections.Counter(x['fk'] for t in T.values() for x in t['columns'] if x['fk'])
    staff = next((n for n, t in T.items() if {'Email', 'Access_level'} <= {x['name'] for x in t['columns']}), '')
    tables = O()
    used_prefix = set()
    for n, t in T.items():
        cols = t['columns']
        names = [x['name'] for x in cols]
        strings = [x['name'] for x in cols if x['type'] == 'string' and not x['fk'] and x['name'] != t['pk'] and not x['formula'] and not x['list']]
        display = next((c for c in strings if re.search(r'name|title|ten|tên|code|duty|description', c, re.I)), strings[0] if strings else t['pk'])
        pre = t['idPrefix'] or re.sub(r'[^A-Z]', '', short(n, prefix).title())[:2].upper() or 'XX'
        while pre in used_prefix: pre = pre[0] + chr(ord(pre[-1]) + 1)
        used_prefix.add(pre)
        fks = [x['name'] for x in cols if x['fk'] and x['fk'] != staff]
        dates = [x['name'] for x in cols if x['type'] == 'date' and not x['formula']]
        tables[n] = O(
            label=[human(short(n, prefix)), human(short(n, prefix))],
            prefix=pre, idStyle=t['idStyle'] or ('catalog' if n == staff or not dates else 'year'),
            display=display, labelCols=[display], listCols=[x['name'] for x in cols if not x['formula']][:7],
            parentFk=fks[0] if fks else '', dateCol=dates[0] if dates else '', view360=children[n] > 0 and n != staff,
            required=[x['name'] for x in cols if x['fk'] and x['fk'] != staff][:1],
            need=[], unique=[], pct={}, range={}, url=[x for x in names if re.search(r'url|website|link|sop', x, re.I)],
            email=[x for x in names if re.search(r'email', x, re.I)], long=[x for x in names if re.search(r'description|note|address|root_cause|lesson|comment', x, re.I)],
            money=[x for x in names if re.search(r'usd|vnd|amount|price|cost|value', x, re.I) and next(c for c in cols if c['name'] == x)['type'] == 'number'],
            calc={}, types={}, fk={}, soft=[], notes={})
        if n == staff:
            tables[n]['label'] = ['Người dùng app', 'App users']   # tránh trùng trang hệ thống "Tài khoản"
            tables[n]['required'] = [c for c in ['Full_name', 'Email', 'Access_level', 'Active'] if c in names]
            tables[n]['unique'] = ['Email'] if 'Email' in names else []
    alerts = []
    for n, t in T.items():
        names = {x['name'] for x in t['columns']}
        if 'Due_day' in names:
            alerts.append(O(table=n, date='Due_day', title=[], warnDays=3,
                            doneCol='Status' if 'Status' in names else '', doneValues=['Done'] if 'Status' in names else [],
                            doneWhen='Done_day' if 'Done_day' in names and 'Status' not in names else '',
                            ownerCol='Owner_id' if 'Owner_id' in names else '', link='' if tables[n]['view360'] else tables[n]['parentFk']))
    pairs = [['Start_day', 'Due_day'], ['Start_day', 'Done_day'], ['Start_day', 'End_day'], ['Start_date', 'End_date']]
    spec = O(
        app=O(name=prefix.rstrip('_') + ' App', brand=prefix.rstrip('_') + ' App', subtitle=['Quản lý dữ liệu', 'Data management'],
              version='1.0.0', schemaVersion=os.path.splitext(raw['source'])[0], menuTitle=prefix.rstrip('_') + ' App',
              timezone='Asia/Ho_Chi_Minh', alertDays=7, consts=O()),
        features=O(AUTH=bool(staff), ACTIVITY=True, ALERTS=True, VIEW360=True),
        staff=O(table=staff, id=T[staff]['pk'] if staff else '', email='Email', name='Full_name', access='Access_level', active='Active', role='Role') if staff else O(),
        catalogs=[staff] if staff else [],
        tables=tables,
        menu=[O(group=['Dữ liệu', 'Data'], items=[O(table=n, icon='▪') for n in T if n != staff]),
              O(group=['Danh mục', 'Catalogs'], items=[O(table=staff, icon='☺')] if staff else [])],
        dateOrder=[p for p in pairs if any(set(p) <= {x['name'] for x in t['columns']} for t in T.values())],
        alerts=alerts,
        dashboard=O(kpiTables=[n for n in T if n != staff][:8], metrics=[], providers=[]),
        needExtra=O(), autoUser=O(), defaults=O(),
        providers=O(hooks=[], routes=[], related=[], extra360=[], alerts=[], checks=[]),
        labels=O(columns=O(), notesEn=O()))
    json.dump(spec, open(SPEC, 'w'), ensure_ascii=False, indent=1)
    print('Đã tạo tools/app_spec.json (NHÁP). Xem lại cùng người dùng: nhãn bảng VN/EN, display, parentFk, bắt buộc, menu, cảnh báo, danh mục.')
    for w in raw['warnings']: print('  ⚠ ' + w)

# ------------------------------------------------------------------ build
def build(check_only=False):
    spec = json.load(open(SPEC), object_pairs_hook=O)
    T = raw['tables']; S = spec['tables']
    errs = []
    for n in S:
        if n not in T: errs.append(f'app_spec.tables có {n} nhưng file xlsx không có sheet này')
    for n in T:
        if n not in S: errs.append(f'Sheet {n} chưa khai báo trong app_spec.tables')
    def need_cols(n, lst, what):
        names = {x['name'] for x in T.get(n, {}).get('columns', [])}
        for c in lst:
            if c and c not in names: errs.append(f'{n}.{what}: cột "{c}" không có trong sheet')
    for n, m in S.items():
        if n not in T: continue
        for key in ['required', 'need', 'unique', 'url', 'email', 'long', 'money', 'soft', 'listCols', 'labelCols']:
            need_cols(n, m.get(key, []), key)
        for key in ['pct', 'range', 'calc', 'types', 'fk', 'notes']:
            need_cols(n, list(m.get(key, {}).keys()), key)
        need_cols(n, [m.get('display', ''), m.get('parentFk', ''), m.get('dateCol', ''), m.get('groupCol', '')], 'display/parentFk/dateCol/groupCol')
    st = spec.get('staff') or {}
    if spec['features'].get('AUTH', True):
        if not st.get('table') or st['table'] not in T: errs.append('features.AUTH = true nhưng staff.table không có trong file')
        else: need_cols(st['table'], [st.get(k) for k in ['id', 'email', 'name', 'access', 'active']], 'staff')
    for g in spec['menu']:
        for it in g['items']:
            if it.get('table') and it['table'] not in T: errs.append(f'menu: bảng {it["table"]} không có trong file')
    for al in spec['alerts']:
        need_cols(al['table'], [al.get('date'), al.get('doneCol'), al.get('doneWhen'), al.get('ownerCol'), al.get('link')], 'alerts')
    if errs:
        print('LỖI app_spec.json:'); [print('  ✖ ' + e) for e in errs]; sys.exit(1)
    if check_only: print('app_spec.json khớp schema_raw.json'); return

    tables = O()
    for n, t in T.items():
        m = S[n]; cols = []
        for c in t['columns']:
            k = c['name']; d = O(name=k)
            d['type'] = m.get('types', {}).get(k, c['type'])
            if k == t['pk']: d['key'] = 'PK'
            ref = m.get('fk', {}).get(k) or c['fk']
            if ref and k != t['pk']:
                d['key'] = 'FK'; d['ref'] = ref
                if k in m.get('soft', []): d['soft'] = True
            # AUTO = công thức đã kéo xuống nhiều dòng; công thức chỉ ở dòng 2 → cột nhập được (app không ghi đè ô có công thức)
            if c['formula'] and c['formulaRows'] > 1 and k not in m.get('calc', {}): d['auto'] = True
            if k in m.get('calc', {}): d['calc'] = m['calc'][k]
            if c['list']: d['list'] = c['list']
            if k in m.get('required', []): d['required'] = True
            if k in m.get('unique', []): d['unique'] = True
            if k in m.get('pct', {}): d['pct'] = True; d['min'], d['max'] = m['pct'][k]
            elif c.get('pct'): d['pct'] = True   # SPD: kiểu Percent trong DataDictionary
            if k in m.get('range', {}): d['min'], d['max'] = m['range'][k]
            if k in m.get('money', []): d['money'] = True
            if k in m.get('url', []): d['format'] = 'url'
            if k in m.get('email', []): d['format'] = 'email'
            if k in m.get('long', []): d['long'] = True
            note = m.get('notes', {}).get(k) or c.get('note', '')
            if note and not note.startswith('⚠'): d['note'] = note
            cols.append(d)
        tables[n] = O(label=m['label'][0], prefix=m['prefix'], idStyle=m['idStyle'], idWidth=m.get('idWidth', 3), pk=t['pk'], display=m.get('display') or t['pk'],
                      labelCols=m.get('labelCols') or [m.get('display') or t['pk']], listCols=m.get('listCols') or [],
                      parentFk=m.get('parentFk', ''), groupCol=m.get('groupCol', ''), dateCol=m.get('dateCol', ''),
                      view360=bool(m.get('view360')) and spec['features'].get('VIEW360', True), columns=cols)
    A = spec['app']; F = spec['features']
    app = O(NAME=A['name'], BRAND=A.get('brand', A['name']), SUBTITLE=A.get('subtitle', ['', '']), VERSION=A['version'],
            SCHEMA_VERSION=A.get('schemaVersion', ''), MENU_TITLE=A.get('menuTitle', A['name']), PREFIX=raw['prefix'],
            SPREADSHEET_ID=A.get('spreadsheetId', ''), TIMEZONE=A.get('timezone', 'Asia/Ho_Chi_Minh'),
            HEADER_ROW=raw.get('headerRow', 1), FIRST_DATA_ROW=raw.get('firstDataRow', 2),
            LOG_SHEET=A.get('logSheet', raw['prefix'] + 'Activity_log'), LOCK_TIMEOUT_MS=20000, ALERT_DAYS=A.get('alertDays', 7),
            ACTIVITY_PAGE_SIZE=200, FEATURES=O(AUTH=F.get('AUTH', True), ACTIVITY=F.get('ACTIVITY', True), ALERTS=F.get('ALERTS', True), VIEW360=F.get('VIEW360', True)),
            STAFF=O(table=st.get('table', ''), id=st.get('id', ''), email=st.get('email', 'Email'), name=st.get('name', 'Full_name'),
                    access=st.get('access', 'Access_level'), active=st.get('active', 'Active'), role=st.get('role', '')),
            CONSTS=A.get('consts', {}))
    P = spec.get('providers', {})
    def j(x): return json.dumps(x, ensure_ascii=False, indent=2)
    alerts = [O((k, v) for k, v in a.items() if v not in ('', [], None)) for a in spec['alerts']]
    for al in alerts:
        if not al.get('title'): al['title'] = S[al['table']]['label']   # mặc định = nhãn bảng VN/EN
    rep = {'__APP_NAME__': A['name'], '__SOURCE__': raw['source'], '__APP__': j(app), '__CATALOGS__': j(spec.get('catalogs', [])),
           '__MENU__': j(spec['menu']), '__DATE_ORDER__': j(spec.get('dateOrder', [])), '__ALERTS__': j(alerts),
           '__DASHBOARD__': j(spec.get('dashboard', {})), '__NEED_EXTRA__': j(spec.get('needExtra', {})),
           '__AUTO_USER__': j(spec.get('autoUser', {})), '__DEFAULTS__': j(spec.get('defaults', {})),
           '__HOOKS__': j(['Entity_hooks_', 'User_hooks_'] + P.get('hooks', [])), '__ROUTES__': j(P.get('routes', [])),
           '__RELATED__': j(P.get('related', [])), '__EXTRA360__': j(P.get('extra360', [])), '__ALERTP__': j(P.get('alerts', [])),
           '__CHECKP__': j(P.get('checks', [])), '__INIT__': j(P.get('init', [])), '__LISTS__': j(raw['lists']), '__SCHEMA__': j(tables)}
    out = open(TPL).read()
    for k, v in rep.items(): out = out.replace(k, v)
    os.makedirs(os.path.join(ROOT, 'src'), exist_ok=True)
    open(os.path.join(ROOT, 'src', '01_Config.gs'), 'w').write(out)

    base = json.load(open(BASE))['columns'] if os.path.exists(BASE) else {}
    L = spec.get('labels', {}); lc = L.get('columns', {})
    cols_lbl = O(); gaps = []
    for n, t in T.items():
        for c in t['columns']:
            k = c['name']
            if (n + '.' + k) in lc: cols_lbl[n + '.' + k] = lc[n + '.' + k]
            elif k in lc: cols_lbl[k] = lc[k]
            elif k in base: cols_lbl[k] = base[k]
            else: gaps.append(n + '.' + k)
    tl = O((n, S[n]['label']) for n in T)
    lab = ('/**\n * 12_Labels.gs — Nhãn song ngữ (SINH TỰ ĐỘNG bằng tools/gen_config.py từ app_spec.json › labels + tools/base_labels.json).\n'
           ' * Muốn sửa nhãn: sửa app_spec.json rồi sinh lại. Khóa \'Bảng.Cột\' ghi đè nhãn chung của cột.\n */\n\n'
           'var I18N_TABLES = ' + j(tl) + ';\n\nvar I18N_COLUMNS = ' + j(cols_lbl) + ';\n\nvar I18N_NOTES_EN = ' + j(L.get('notesEn', {})) + ';\n')
    open(os.path.join(ROOT, 'src', '12_Labels.gs'), 'w').write(lab)
    print(f'01_Config.gs: {len(tables)} bảng, {sum(len(t["columns"]) for t in tables.values())} cột · 12_Labels.gs: {len(cols_lbl)} nhãn cột')
    if gaps:
        print(f'THIẾU NHÃN VN/EN cho {len(gaps)} cột — bổ sung app_spec.json › labels.columns (test i18n sẽ báo lỗi):')
        print('  ' + ', '.join(gaps))
    vi_notes = [n + '.' + c['name'] for n, t in tables.items() for c in t['columns'] if c.get('note') and re.search(r'[À-ỹ]', c['note'])
                and (n + '.' + c['name']) not in L.get('notesEn', {})]
    if vi_notes:
        print(f'GHI CHÚ TIẾNG VIỆT CHƯA CÓ BẢN EN ({len(vi_notes)}): ' + ', '.join(vi_notes))

if '--init' in sys.argv: init_spec()
else: build('--check' in sys.argv)
