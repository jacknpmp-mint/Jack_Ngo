"""Selling_Price_Database R04 → R05 (sửa trực tiếp XML để giữ dropdown x14, Excel Table, định dạng).

Dùng:  python3 -I tools/fix_spd_r05.py <R04.xlsx> <R05.xlsx> [email_admin]

Thay đổi (đã chốt với người dùng 26/10/2026):
  1. Config: 'Peso' → 'PHP'.
  2. Xóa mọi dòng '(example)' (giữ 6 thị trường TT-01..TT-06); giữ nguyên công thức của dòng.
  3. FX_Rates: thêm cột fx_id (PK mới, mã FX-0001, app cấp); cặp effective_date + currency vẫn không trùng.
  4. Thêm cột USD (công thức) cuối các bảng: Projects.fx_usd; Material_Prices.fx_usd, unit_price_usd;
     Project_Items.unit_sell_usd, unit_cost_usd, gm_unit_usd; Project_Freight.freight_cost_usd;
     Project_Inputs_Bid.unit_price_usd, list_price_usd; Project_Inputs_Job.fx_usd, unit_price_usd, bid_unit_price_usd, list_price_usd.
     Tỷ giá USD = dòng FX_Rates USD mới nhất ≤ ngày của dòng (giống cách tra fx_sell / fx_rate hiện có).
  5. Sheet mới Staff (đăng nhập Web App): staff_id, full_name, email, access_level, active, job_role, notes.
  6. DataDictionary + README: thêm mô tả R05. Bật tính lại toàn bộ khi mở (fullCalcOnLoad).
"""
import re, sys, zipfile, uuid
from xml.sax.saxutils import escape

SRC, DST = sys.argv[1], sys.argv[2]
ADMIN_EMAIL = sys.argv[3] if len(sys.argv) > 3 else ''
LOG = []


def col_idx(s):
    n = 0
    for ch in s: n = n * 26 + ord(ch) - 64
    return n


def col_name(n):
    s = ''
    while n: n, r = divmod(n - 1, 26); s = chr(65 + r) + s
    return s


class Pkg:
    def __init__(self, path):
        z = zipfile.ZipFile(path)
        self.infos = z.infolist()
        self.files = {i.filename: z.read(i.filename) for i in self.infos}
        self.new = []
        wb = self.t('xl/workbook.xml'); rels = self.t('xl/_rels/workbook.xml.rels')
        rid = {a['Id']: a['Target'] for a in (dict(re.findall(r'(\w+)="([^"]*)"', m.group(0))) for m in re.finditer(r'<Relationship [^>]*>', rels))}
        self.sheets = {}
        for m in re.finditer(r'<sheet [^>]*>', wb):
            a = dict(re.findall(r'([\w:]+)="([^"]*)"', m.group(0)))
            self.sheets[a['name']] = 'xl/' + rid[a['r:id']].lstrip('/').replace('xl/', '')
        ss = self.t('xl/sharedStrings.xml')
        self.sst = [re.sub(r'<[^>]+>', '', x) for x in re.findall(r'<si>(.*?)</si>', ss, re.S)]

    def t(self, n): return self.files[n].decode('utf-8')
    def put(self, n, s): self.files[n] = s.encode('utf-8')

    def add_file(self, n, s):
        self.files[n] = s.encode('utf-8'); self.new.append(n)

    def save(self, path):
        with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
            for i in self.infos: z.writestr(i, self.files[i.filename])
            for n in self.new: z.writestr(n, self.files[n])


class Sheet:
    """Sửa 1 worksheet: tách các dòng một lần (nhanh với sheet 1.500 dòng)."""
    def __init__(self, pkg, name):
        self.pkg, self.name, self.path = pkg, name, pkg.sheets[name]
        s = pkg.t(self.path)
        a, b = s.index('<sheetData>') + len('<sheetData>'), s.index('</sheetData>')
        self.head, self.tail = s[:a], s[b:]
        self.rows = {}
        for m in re.finditer(r'<row r="(\d+)"[^>]*?(?:/>|>.*?</row>)', s[a:b], re.S):
            self.rows[int(m.group(1))] = m.group(0)

    def cells(self, r):
        row = self.rows.get(r, '')
        return {m.group(1): m.group(0) for m in re.finditer(r'<c r="([A-Z]+)\d+"[^>]*?(?:/>|>.*?</c>)', row, re.S)}

    def style(self, ref):
        m = re.match(r'([A-Z]+)(\d+)$', ref)
        c = self.cells(int(m.group(2))).get(m.group(1), '')
        s = re.search(r'\ss="(\d+)"', c)
        return s.group(1) if s else None

    def value(self, ref):
        m = re.match(r'([A-Z]+)(\d+)$', ref)
        c = self.cells(int(m.group(2))).get(m.group(1), '')
        v = re.search(r'<v>(.*?)</v>', c)
        if 't="s"' in c and v: return self.pkg.sst[int(v.group(1))]
        t = re.search(r'<t[^>]*>(.*?)</t>', c)
        return t.group(1) if t else (v.group(1) if v else None)

    def set(self, ref, value, style=None):
        m = re.match(r'([A-Z]+)(\d+)$', ref); col, r = m.group(1), int(m.group(2))
        old = self.cells(r).get(col)
        if style is None and old:
            s = re.search(r'\ss="(\d+)"', old); style = s.group(1) if s else None
        st = ' s="%s"' % style if style else ''
        if value is None or value == '':
            cell = '<c r="%s"%s/>' % (ref, st)
        elif isinstance(value, str) and value.startswith('='):
            cell = '<c r="%s"%s><f>%s</f></c>' % (ref, st, escape(value[1:]))
        elif isinstance(value, (int, float)):
            cell = '<c r="%s"%s><v>%s</v></c>' % (ref, st, value)
        else:
            cell = '<c r="%s"%s t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>' % (ref, st, escape(str(value)))
        row = self.rows.get(r)
        if row is None:
            self.rows[r] = '<row r="%d">%s</row>' % (r, cell); return
        if old:
            self.rows[r] = row.replace(old, cell, 1); return
        if row.endswith('/>'): row = row[:-2] + '></row>'
        cs = list(re.finditer(r'<c r="([A-Z]+)\d+"', row))
        ins = next((c.start() for c in cs if col_idx(c.group(1)) > col_idx(col)), row.rindex('</row>'))
        row = row[:ins] + cell + row[ins:]
        row = re.sub(r'\sspans="[^"]*"', '', row, count=1)
        self.rows[r] = row

    def clear_inputs(self, r):
        """Xóa giá trị nhập tay của dòng r (giữ công thức, bỏ giá trị lưu sẵn của ô công thức)."""
        row = self.rows.get(r)
        if not row: return 0
        n = 0
        def fix(m):
            nonlocal n
            c = m.group(0)
            ref = m.group(1)
            st = re.search(r'\ss="(\d+)"', c)
            sty = ' s="%s"' % st.group(1) if st else ''
            if '<f>' in c or '<f ' in c:
                f = re.search(r'<f[^>]*>.*?</f>|<f[^>]*/>', c, re.S).group(0)
                return '<c r="%s"%s>%s</c>' % (ref, sty, f)
            if '<v>' in c or '<is>' in c: n += 1
            return '<c r="%s"%s/>' % (ref, sty)
        self.rows[r] = re.sub(r'<c r="([A-Z]+\d+)"[^>]*?(?:/>|>.*?</c>)', fix, row, flags=re.S)
        return n

    def max_row(self): return max(self.rows)

    def save(self):
        body = ''.join(self.rows[k] for k in sorted(self.rows))
        s = self.head + body + self.tail
        last_col = max([col_idx(m) for m in re.findall(r'<c r="([A-Z]+)\d+"', body)] or [1])
        s = re.sub(r'<dimension ref="[^"]*"/>', '<dimension ref="A1:%s%d"/>' % (col_name(last_col), max(self.rows)), s, count=1)
        self.pkg.put(self.path, s)

    def add_col_width(self, col, width):
        n = col_idx(col)
        if '<cols>' in self.head:
            self.head = self.head.replace('</cols>', '<col min="%d" max="%d" width="%s" customWidth="1"/></cols>' % (n, n, width), 1)


def table_part(pkg, sheet):
    relp = pkg.sheets[sheet].replace('worksheets/', 'worksheets/_rels/') + '.rels'
    m = re.search(r'Target="\.\./tables/(table\d+\.xml)"', pkg.t(relp))
    return 'xl/tables/' + m.group(1)


def extend_table(pkg, sheet, new_cols):
    """new_cols: [(cột, tên tiêu đề dòng 3)] — mở rộng Excel Table sang phải."""
    p = table_part(pkg, sheet); s = pkg.t(p)
    ref = re.search(r' ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"', s)
    last = max(col_idx(c) for c, _ in new_cols)
    newref = '%s%s:%s%s' % (ref.group(1), ref.group(2), col_name(last), ref.group(4))
    s = s.replace('ref="%s%s:%s%s"' % ref.groups(), 'ref="%s"' % newref)
    cnt = int(re.search(r'<tableColumns count="(\d+)"', s).group(1))
    ids = [int(x) for x in re.findall(r'<tableColumn id="(\d+)"', s)]
    add = ''
    for k, (c, name) in enumerate(new_cols):
        add += '<tableColumn id="%d" xr3:uid="{%s}" name="%s"/>' % (max(ids) + 1 + k, str(uuid.uuid4()).upper(), escape(name))
    s = re.sub(r'<tableColumns count="\d+"', '<tableColumns count="%d"' % (cnt + len(new_cols)), s, count=1)
    s = s.replace('</tableColumns>', add + '</tableColumns>', 1)
    pkg.put(p, s)
    LOG.append(f'{sheet}: Excel Table → {newref}')
    return int(ref.group(4))


def usd_rate(cur_expr, date_ref):
    """Tỷ giá 1 USD = ? VND (dòng USD mới nhất ≤ ngày), giống mẫu tra fx_sell của file."""
    return ('IF(%s="","",IF("USD"=Config!$B$3,1,IFERROR(1/(1/SUMIFS(FX_Rates!$D$4:$D$503,FX_Rates!$B$4:$B$503,"USD",'
            'FX_Rates!$A$4:$A$503,_xlfn.MAXIFS(FX_Rates!$A$4:$A$503,FX_Rates!$B$4:$B$503,"USD",FX_Rates!$A$4:$A$503,"<="&%s))),"")))') % (date_ref, date_ref)


pkg = Pkg(SRC)

# ---------------------------------------------------------------- 1. Config: Peso → PHP
cfg = Sheet(pkg, 'Config')
assert cfg.value('A11') == 'Peso', cfg.value('A11')
cfg.set('A11', 'PHP'); cfg.save(); LOG.append('Config!A11: Peso → PHP')

# ---------------------------------------------------------------- 2..4 các bảng dữ liệu
EXAMPLE_ROWS = {'Customers': [4], 'Items': [4], 'Materials': [4], 'FX_Rates': [4], 'Material_Prices': [4, 5], 'Projects': [4],
                'Project_Items': [4, 5], 'Project_Freight': [4], 'Project_Inputs_Bid': [4], 'Project_Inputs_Job': [4]}
P_USD = 'INDEX(Projects!$W$4:$W$303,MATCH($B{r},Projects!$A$4:$A$303,0))'
NEW = {
    # sheet: [(cột, mã, nhãn dòng 3, công thức hoặc None, ô mẫu kiểu dữ liệu, ô mẫu tiêu đề, độ rộng)]
    'FX_Rates': [('G', 'fx_id', 'FX row ID *', None, 'E4', 'A', 14)],
    'Projects': [('W', 'fx_usd', 'FX rate - USD', '=' + usd_rate('$M{r}', '$M{r}'), 'N4', 'N', 14)],
    'Material_Prices': [('P', 'fx_usd', 'FX rate - USD', '=' + usd_rate('$G{r}', '$G{r}'), 'K4', 'K', 14),
                        ('Q', 'unit_price_usd', 'Unit price (USD / unit)', '=IF(OR($L{r}="",$P{r}=""),"",$L{r}/$P{r})', 'L4', 'L', 16)],
    'Project_Items': [('W', 'unit_sell_usd', 'Unit selling price (USD / unit)', '=IF(OR($R{r}="",$B{r}=""),"",IFERROR($R{r}/' + P_USD + ',""))', 'R4', 'R', 16),
                      ('X', 'unit_cost_usd', 'Unit cost (USD / unit)', '=IF(OR($S{r}="",$B{r}=""),"",IFERROR($S{r}/' + P_USD + ',""))', 'S4', 'S', 16),
                      ('Y', 'gm_unit_usd', 'Gross margin (USD / unit)', '=IF(OR($W{r}="",$X{r}=""),"",$W{r}-$X{r})', 'T4', 'T', 16)],
    'Project_Freight': [('Q', 'freight_cost_usd', 'Freight cost (USD / basis)', '=IF(OR($N{r}="",$B{r}=""),"",IFERROR($N{r}/' + P_USD + ',""))', 'N4', 'N', 16)],
    'Project_Inputs_Bid': [('U', 'unit_price_usd', 'Bid unit price (USD / unit)', '=IF(OR($Q{r}="",$B{r}=""),"",IFERROR($Q{r}/' + P_USD + ',""))', 'Q4', 'Q', 16),
                           ('V', 'list_price_usd', 'Price-list unit price (USD / unit)', '=IF($J{r}="","",IFERROR(INDEX(Material_Prices!$Q$4:$Q$1003,MATCH($J{r},Material_Prices!$A$4:$A$1003,0)),""))', 'R4', 'R', 16)],
    'Project_Inputs_Job': [('X', 'fx_usd', 'FX rate - USD', '=' + usd_rate('$J{r}', '$J{r}'), 'Q4', 'Q', 14),
                           ('Y', 'unit_price_usd', 'Actual unit price (USD / unit)', '=IF(OR($R{r}="",$X{r}=""),"",$R{r}/$X{r})', 'R4', 'R', 16),
                           ('Z', 'bid_unit_price_usd', 'Bid unit price (USD / unit)', '=IF($B{r}="","",IFERROR(AVERAGEIFS(Project_Inputs_Bid!$U$4:$U$1503,Project_Inputs_Bid!$B$4:$B$1503,$B{r},Project_Inputs_Bid!$C$4:$C$1503,$C{r},Project_Inputs_Bid!$H$4:$H$1503,$H{r}),""))', 'S4', 'S', 16),
                           ('AA', 'list_price_usd', 'Price-list unit price (USD / unit)', '=IF($L{r}="","",IFERROR(INDEX(Material_Prices!$Q$4:$Q$1003,MATCH($L{r},Material_Prices!$A$4:$A$1003,0)),""))', 'U4', 'U', 16)],
}
for name in ['Markets', 'Customers', 'Items', 'Materials', 'FX_Rates', 'Material_Prices', 'Projects', 'Project_Items',
             'Project_Freight', 'Project_Inputs_Bid', 'Project_Inputs_Job']:
    sh = Sheet(pkg, name)
    for r in EXAMPLE_ROWS.get(name, []):
        a = sh.value('A%d' % r)
        n = sh.clear_inputs(r)
        LOG.append(f'{name}: xóa dòng mẫu {r} ({a}, {n} ô)')
    if name in NEW:
        last = extend_table(pkg, name, [(c, lbl) for c, code, lbl, *_ in NEW[name]])
        for c, code, lbl, f, data_style_from, head_from, width in NEW[name]:
            sh.set('%s2' % c, code, style=sh.style('%s2' % head_from))
            sh.set('%s3' % c, lbl, style=sh.style('%s3' % head_from))
            ds = sh.style(data_style_from)
            for r in range(4, last + 1):
                sh.set('%s%d' % (c, r), f.format(r=r) if f else None, style=ds)
            sh.add_col_width(c, width)
            LOG.append(f'{name}!{c}: thêm cột {code}' + (' (công thức, dòng 4–%d)' % last if f else ' (nhập — app cấp mã)'))
    sh.save()

# ---------------------------------------------------------------- 5. Sheet Staff
mk = Sheet(pkg, 'Markets')
ST_TITLE, ST_CODE, ST_LABEL, ST_DATA = mk.style('A1'), mk.style('A2'), mk.style('A3'), mk.style('A4')
cols = [('staff_id', 'Staff ID *', 12), ('full_name', 'Full name *', 26), ('email', 'Google email *', 32),
        ('access_level', 'App access * (Viewer / Editor / Admin)', 22), ('active', 'Active * (Y / N)', 12),
        ('job_role', 'Job role', 20), ('notes', 'Notes', 30)]
rows = ['<row r="1"><c r="A1" s="%s" t="inlineStr"><is><t>STAFF / WEB APP USERS</t></is></c></row>' % ST_TITLE]
rows.append('<row r="2">' + ''.join('<c r="%s2" s="%s" t="inlineStr"><is><t>%s</t></is></c>' % (col_name(i + 1), ST_CODE, c[0]) for i, c in enumerate(cols)) + '</row>')
rows.append('<row r="3" ht="43.2" customHeight="1">' + ''.join('<c r="%s3" s="%s" t="inlineStr"><is><t>%s</t></is></c>' % (col_name(i + 1), ST_LABEL, escape(c[1])) for i, c in enumerate(cols)) + '</row>')
first = ['ST-001', 'Admin (change to your name)', ADMIN_EMAIL, 'Admin', 'Y', '', 'First Admin - edit name / email if needed'] if ADMIN_EMAIL else []
for r in range(4, 104):
    vals = first if (r == 4 and first) else [''] * len(cols)
    rows.append('<row r="%d">' % r + ''.join(
        ('<c r="%s%d" s="%s" t="inlineStr"><is><t>%s</t></is></c>' % (col_name(i + 1), r, ST_DATA, escape(v)) if v else '<c r="%s%d" s="%s"/>' % (col_name(i + 1), r, ST_DATA))
        for i, v in enumerate(vals)) + '</row>')
staff_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
             'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><dimension ref="A1:G103"/>'
             '<sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
             '<sheetFormatPr defaultRowHeight="14.4"/><cols>' + ''.join('<col min="%d" max="%d" width="%d" customWidth="1"/>' % (i + 1, i + 1, c[2]) for i, c in enumerate(cols)) +
             '</cols><sheetData>' + ''.join(rows) + '</sheetData>'
             '<dataValidations count="2">'
             '<dataValidation type="list" allowBlank="1" showErrorMessage="1" error="Viewer, Editor or Admin" sqref="D4:D103"><formula1>"Viewer,Editor,Admin"</formula1></dataValidation>'
             '<dataValidation type="list" allowBlank="1" showErrorMessage="1" error="Y or N" sqref="E4:E103"><formula1>"Y,N"</formula1></dataValidation>'
             '</dataValidations><pageMargins left="0.75" right="0.75" top="1" bottom="1" header="0.5" footer="0.5"/></worksheet>')
n_sheets = len(pkg.sheets)
spath = 'xl/worksheets/sheet%d.xml' % (n_sheets + 1)
pkg.add_file(spath, staff_xml)
wb = pkg.t('xl/workbook.xml')
ids = [int(x) for x in re.findall(r'sheetId="(\d+)"', wb)]
rels = pkg.t('xl/_rels/workbook.xml.rels')
rid = 'rId%d' % (max(int(x) for x in re.findall(r'Id="rId(\d+)"', rels)) + 1)
# đặt Staff ngay sau Config (trước Markets)
wb = wb.replace('<sheet name="Markets"', '<sheet name="Staff" sheetId="%d" r:id="%s"/><sheet name="Markets"' % (max(ids) + 1, rid), 1)
# definedName localSheetId (DataDictionary) dịch +1 vì chèn 1 sheet trước nó
wb = re.sub(r'localSheetId="(\d+)"', lambda m: 'localSheetId="%d"' % (int(m.group(1)) + (1 if int(m.group(1)) >= 2 else 0)), wb)
wb = re.sub(r'activeTab="\d+"', 'activeTab="0"', wb)
wb = re.sub(r'<calcPr ([^/]*)/>', lambda m: '<calcPr ' + m.group(1) + ' fullCalcOnLoad="1"/>', wb, count=1)
wb = wb.replace('DataDictionary!$A$3:$I$148', 'DataDictionary!$A$3:$I$%d' % 999)  # cập nhật bên dưới
pkg.put('xl/workbook.xml', wb)
pkg.put('xl/_rels/workbook.xml.rels', rels.replace('</Relationships>', '<Relationship Id="%s" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet%d.xml"/></Relationships>' % (rid, n_sheets + 1)))
ct = pkg.t('[Content_Types].xml')
pkg.put('[Content_Types].xml', ct.replace('</Types>', '<Override PartName="/%s" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' % spath))
app = pkg.t('docProps/app.xml')
app = re.sub(r'<vt:i4>%d</vt:i4>' % n_sheets, '<vt:i4>%d</vt:i4>' % (n_sheets + 1), app, count=1)
app = app.replace('<vt:vector size="%d" baseType="lpstr">' % n_sheets, '<vt:vector size="%d" baseType="lpstr">' % (n_sheets + 1)).replace('<vt:lpstr>Markets</vt:lpstr>', '<vt:lpstr>Staff</vt:lpstr><vt:lpstr>Markets</vt:lpstr>', 1)
pkg.put('docProps/app.xml', app)
LOG.append('Thêm sheet Staff (sau Config)' + (f'; ST-001 Admin = {ADMIN_EMAIL}' if ADMIN_EMAIL else ''))

# ---------------------------------------------------------------- 6. DataDictionary + README
dd = Sheet(pkg, 'DataDictionary')
DS = dd.style('A148')
# FX_Rates: khóa ghép → unique; fx_id là PK
for r in range(4, 149):
    if dd.value('A%d' % r) == 'FX_Rates' and (dd.value('G%d' % r) or '').startswith('PK'):
        dd.set('G%d' % r, 'Unique (date + currency)')
add = [
    ('Staff', '', 'staff_id', 'Staff ID', 'Text', 'Yes', 'PK', 'Web App', 'ST-001… issued by the web app'),
    ('Staff', '', 'full_name', 'Full name', 'Text', 'Yes', '', 'Manual entry', 'Name shown in the web app'),
    ('Staff', '', 'email', 'Google email', 'Text', 'Yes', 'Unique', 'Manual entry', 'Google account used to open the web app'),
    ('Staff', '', 'access_level', 'App access', 'List', 'Yes', '', 'Dropdown', 'Viewer (read) / Editor (add, edit) / Admin (+ delete, masters, users)'),
    ('Staff', '', 'active', 'Active', 'List', 'Yes', '', 'Dropdown', 'Y = can open the web app; N = blocked'),
    ('Staff', '', 'job_role', 'Job role', 'Text', '', '', 'Manual entry', 'Estimator, sales, manager...'),
    ('Staff', '', 'notes', 'Notes', 'Text', '', '', 'Manual entry', 'Notes'),
    ('FX_Rates', 'tbl_FXRates', 'fx_id', 'FX row ID', 'Text', 'Yes', 'PK', 'Web App', 'FX-0001… issued by the web app (R05). effective_date + currency stay unique'),
    ('Projects', 'tbl_Projects', 'fx_usd', 'FX rate - USD', 'Number', '', '', 'Formula', 'USD rate (1 USD = ? base) on the project FX date (R05)'),
    ('Material_Prices', 'tbl_MaterialPrices', 'fx_usd', 'FX rate - USD', 'Number', '', '', 'Formula', 'USD rate on the price effective date (R05)'),
    ('Material_Prices', 'tbl_MaterialPrices', 'unit_price_usd', 'Unit price (USD / unit)', 'Number', '', '', 'Formula', 'Unit price (base) / FX rate - USD (R05)'),
    ('Project_Items', 'tbl_ProjectItems', 'unit_sell_usd', 'Unit selling price (USD / unit)', 'Number', '', '', 'Formula', 'Unit selling price (base) / Projects.fx_usd (R05)'),
    ('Project_Items', 'tbl_ProjectItems', 'unit_cost_usd', 'Unit cost (USD / unit)', 'Number', '', '', 'Formula', 'Unit cost (base) / Projects.fx_usd (R05)'),
    ('Project_Items', 'tbl_ProjectItems', 'gm_unit_usd', 'Gross margin (USD / unit)', 'Number', '', '', 'Formula', 'Unit selling price USD - unit cost USD (R05)'),
    ('Project_Freight', 'tbl_ProjectFreight', 'freight_cost_usd', 'Freight cost (USD / basis)', 'Number', '', '', 'Formula', 'Freight cost (base) / Projects.fx_usd (R05)'),
    ('Project_Inputs_Bid', 'tbl_InputsBid', 'unit_price_usd', 'Bid unit price (USD / unit)', 'Number', '', '', 'Formula', 'Bid unit price (base) / Projects.fx_usd (R05)'),
    ('Project_Inputs_Bid', 'tbl_InputsBid', 'list_price_usd', 'Price-list unit price (USD / unit)', 'Number', '', '', 'Formula', 'Material_Prices.unit_price_usd of the reference price row (R05)'),
    ('Project_Inputs_Job', 'tbl_InputsJob', 'fx_usd', 'FX rate - USD', 'Number', '', '', 'Formula', 'USD rate on the actual price date (R05)'),
    ('Project_Inputs_Job', 'tbl_InputsJob', 'unit_price_usd', 'Actual unit price (USD / unit)', 'Number', '', '', 'Formula', 'Actual unit price (base) / FX rate - USD (R05)'),
    ('Project_Inputs_Job', 'tbl_InputsJob', 'bid_unit_price_usd', 'Bid unit price (USD / unit)', 'Number', '', '', 'Formula', 'Average unit_price_usd of matching Project_Inputs_Bid rows (same project + material + spec) (R05)'),
    ('Project_Inputs_Job', 'tbl_InputsJob', 'list_price_usd', 'Price-list unit price (USD / unit)', 'Number', '', '', 'Formula', 'Material_Prices.unit_price_usd of the reference price row (R05)'),
]
r0 = 149
for k, vals in enumerate(add):
    for i, v in enumerate(vals):
        dd.set('%s%d' % (col_name(i + 1), r0 + k), v if v else None, style=DS)
last_dd = r0 + len(add) - 1
dd.tail = dd.tail.replace('<autoFilter ref="A3:I148"', '<autoFilter ref="A3:I%d"' % last_dd)
dd.save()
pkg.put('xl/workbook.xml', pkg.t('xl/workbook.xml').replace('DataDictionary!$A$3:$I$999', 'DataDictionary!$A$3:$I$%d' % last_dd))
LOG.append(f'DataDictionary: +{len(add)} dòng (149–{last_dd}); FX_Rates khóa ghép → Unique')

rd = Sheet(pkg, 'README')
rd.set('A1', 'SELLING PRICE DATABASE BY CUSTOMER / MARKET / PROJECT - R05 (English)')
H, K, V = rd.style('A4'), rd.style('A55'), rd.style('B55')
notes = [
    ('7. CHANGES IN R05 VS R04', None, True),
    ('Web app', 'This file is the database of the LSB Selling Price DB web app (Google Sheets + Apps Script). Enter data in the web app; sheet formulas stay the source of the calculated columns.', False),
    ('Staff sheet', 'New sheet Staff: Google email, access level (Viewer / Editor / Admin) and Active flag of each web app user. At least one active Admin is required.', False),
    ('USD as second base', 'New USD formula columns: Projects.fx_usd, Material_Prices.fx_usd / unit_price_usd, Project_Items.unit_sell_usd / unit_cost_usd / gm_unit_usd, Project_Freight.freight_cost_usd, Project_Inputs_Bid.unit_price_usd / list_price_usd, Project_Inputs_Job.fx_usd / unit_price_usd / bid_unit_price_usd / list_price_usd. USD rate = latest FX_Rates USD row on or before the date of the row, so a project sold in USD shows its original USD price.', False),
    ('FX_Rates key', 'New column fx_id (FX-0001...) is the row ID used by the web app; effective date + currency must still be unique.', False),
    ('Currency list', "'Peso' renamed to PHP (Philippine peso, ISO code).", False),
    ('Example rows', 'All (example) rows were cleared; the 6 markets are kept.', False),
]
r = 57
for a, b, head in notes:
    rd.set('A%d' % r, a, style=H if head else K)
    if b: rd.set('B%d' % r, b, style=V)
    r += 1
rd.save()
LOG.append('README: tiêu đề R05 + mục 7 (thay đổi R05)')

pkg.save(DST)
print('\n'.join(LOG))
