"""Sửa lỗi cấu trúc của LSB_CRM_Bidding_Project_DB_v4.2.xlsx bằng cách sửa trực tiếp XML
(không lưu qua openpyxl → giữ nguyên dropdown x14 và định dạng).

Dùng: python3 tools/fix_xlsx_v42.py <vào.xlsx> <ra.xlsx>

Sửa:
 1. LSB_Result_Lesson.Project_id: công thức #REF! → tra LSB_project!$D:$D (Quotation_code), 300 dòng.
 2. LSB_project.Quotation_code: thêm dropdown FK → LSB_Quotation (kiểu cảnh báo, vẫn gõ được mã cũ).
 3. Ghi chú tiêu đề chép sai: Area_m2, Quotation_code, Installation_date_start, Project_handover,
    URL_Project_data, Shipment_code, Vessel_no, PP_revision, LSB_cost.Year/Quarter.
 4. Lists: bỏ giá trị lặp Lumpsum_NotErect (Incoterm, ô J11).
 5. ERD_Dictionary: thêm dòng LSB_project.URL_Project_data (v4.2) + cập nhật ghi chú đã sửa.
"""
import re, sys, zipfile, shutil, os
from xml.sax.saxutils import escape

SRC, DST = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(SRC)
files = {n: zin.read(n) for n in zin.namelist()}
infos = {i.filename: i for i in zin.infolist()}
T = lambda n: files[n].decode('utf-8')
def put(n, s): files[n] = s.encode('utf-8')

wbxml = T('xl/workbook.xml'); rels = T('xl/_rels/workbook.xml.rels')
rid = {}
for m in re.finditer(r'<Relationship [^>]*>', rels):
    a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(0))); rid[a['Id']] = a['Target']
sheet = {n: 'xl/' + rid[r] for n, r in re.findall(r'<sheet name="([^"]+)" sheetId="\d+" r:id="(rId\d+)"', wbxml)}
def comments_of(name):
    rp = sheet[name].replace('worksheets/', 'worksheets/_rels/') + '.rels'
    return 'xl/' + re.search(r'Target="\.\./(comments\d+\.xml)"', T(rp)).group(1)
log = []

# 1. Result_Lesson #REF!
n = sheet['LSB_Result_Lesson']; s = T(n)
cnt = s.count('LSB_project!#REF!')
s = s.replace('LSB_project!#REF!', 'LSB_project!$D:$D'); put(n, s); log.append('Result_Lesson.Project_id: sửa %d công thức #REF!' % cnt)

# 2. Dropdown FK cho LSB_project.Quotation_code (cột D)
n = sheet['LSB_project']; s = T(n)
if 'LSB_Quotation!$A$2' not in s:
    dv = ('<x14:dataValidation type="list" errorStyle="warning" allowBlank="1" showErrorMessage="1" errorTitle="Mã báo giá" '
          'error="Nên chọn mã báo giá có trong LSB_Quotation (Status = Won)." xr:uid="{6C1B2A31-0D42-4F8E-9E11-42A000000D01}">'
          '<x14:formula1><xm:f>LSB_Quotation!$A$2:$A$2000</xm:f></x14:formula1><xm:sqref>D2:D301</xm:sqref></x14:dataValidation>')
    m = re.search(r'<x14:dataValidations count="(\d+)"', s)
    s = s.replace(m.group(0), '<x14:dataValidations count="%d"' % (int(m.group(1)) + 1), 1)
    s = s.replace('</x14:dataValidations>', dv + '</x14:dataValidations>', 1)
    put(n, s); log.append('LSB_project.Quotation_code: thêm dropdown → LSB_Quotation')

# 3. Ghi chú tiêu đề
NOTES = {
 'LSB_Quotation': {'G1': 'Nhập tay\nKiểu: number\ndiện tích công trình (m²)'},
 'LSB_project': {'D1': 'Khóa ngoại → LSB_Quotation\nKiểu: string\nmã báo giá thắng thầu (Status = Won)',
                 'V1': 'Nhập tay\nKiểu: date\nngày bắt đầu lắp dựng tại công trình',
                 'W1': 'Nhập tay\nKiểu: date\nngày bàn giao dự án cho khách',
                 'X1': 'Nhập tay\nKiểu: string\nlink thư mục dữ liệu dự án (Drive / OneDrive)'},
 'LSB_shipment': {'D1': 'Nhập tay\nKiểu: string\nmã lô theo khu vực/trục, vd B1-P1 (A-G)',
                  'N1': 'Nhập tay\nKiểu: string\ntên / số hiệu tàu'},
 'LSB_payment_plan': {'J1': 'Nhập tay\nKiểu: number\nlần điều chỉnh kế hoạch thanh toán (1, 2…)'},
 'LSB_cost': {'J1': 'Cột AUTO — không nhập\nKiểu: number\nauto từ Invoice_code',
              'K1': 'Cột AUTO — không nhập\nKiểu: string\nauto từ Invoice_code'},
}
for sh, refs in NOTES.items():
    cn = comments_of(sh); s = T(cn)
    for ref, text in refs.items():
        pat = re.compile(r'(<comment ref="%s"[^>]*>.*?<t(?: [^>]*)?>)(.*?)(</t>)' % ref, re.S)
        assert pat.search(s), (sh, ref)
        s = pat.sub(lambda m: m.group(1) + escape(text) + m.group(3), s, count=1)
        log.append('Ghi chú %s!%s' % (sh, ref))
    put(cn, s)

# 4. Lists: Incoterm lặp ở J11
n = sheet['Lists']; s = T(n)
s2 = re.sub(r'<c r="J11" s="(\d+)" t="s"><v>\d+</v></c>', r'<c r="J11" s="\1"/>', s)
if s2 != s: put(n, s2); log.append('Lists: bỏ Incoterm lặp (J11)')

# 5. ERD_Dictionary
n = sheet['ERD_Dictionary']; s = T(n)
ss = T('xl/sharedStrings.xml')
sst = [re.sub(r'<[^>]+>', '', x) for x in re.findall(r'<si>(.*?)</si>', ss, re.S)]
def cell_text(row_xml, col):
    m = re.search(r'<c r="%s\d+"[^>]*?(?:/>|>(.*?)</c>)' % col, row_xml, re.S)
    if not m or not m.group(1): return ''
    if 't="s"' in m.group(0): return sst[int(re.search(r'<v>(\d+)</v>', m.group(1)).group(1))]
    t = re.search(r'<t[^>]*>(.*?)</t>', m.group(1), re.S)
    return t.group(1) if t else ''
rows = re.findall(r'<row r="(\d+)"[^>]*>.*?</row>', s, re.S)
row_xml = {int(r.group(1)): r.group(0) for r in re.finditer(r'<row r="(\d+)"[^>]*>.*?</row>', s, re.S)}
def find_row(a, c):
    for r, x in row_xml.items():
        if cell_text(x, 'A') == a and cell_text(x, 'C') == c: return r
def set_text(r, col, text):
    global s
    x = row_xml[r]
    style = re.search(r'<c r="%s%d" s="(\d+)"' % (col, r), x)
    st = style.group(1) if style else '25'
    newc = '<c r="%s%d" s="%s" t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>' % (col, r, st, escape(text))
    x2, k = re.subn(r'<c r="%s%d"[^>]*?(?:/>|>.*?</c>)' % (col, r), newc, x, count=1, flags=re.S)
    assert k, (col, r)
    s = s.replace(x, x2); row_xml[r] = x2

if not find_row('LSB_project', 'URL_Project_data'):
    r_q = find_row('LSB_project', 'Quotation_code')
    set_text(r_q, 'H', 'duy nhất, Status = Won — dropdown FK (kiểu cảnh báo, vẫn gõ được mã cũ)')
    set_text(r_q, 'I', 'Chuyển vị trí; v4.2: thêm lại dropdown FK')
    r_rl = find_row('LSB_Result_Lesson', 'Project_id')
    set_text(r_rl, 'H', 'auto tra từ LSB_project theo Quotation_code')
    set_text(r_rl, 'I', 'v4.2: sửa công thức #REF! (tra LSB_project cột D)')
    r_c = find_row('LSB_cost', 'Invoice_code')
    r_h = find_row('LSB_project', 'Project_handover')
    # dời các dòng sau r_h xuống 1
    def shift(m):
        r = int(m.group(1)); return m.group(0) if r <= r_h else m.group(0).replace('r="%d"' % r, 'r="%d"' % (r + 1), 1)
    def shift_row(m):
        r = int(m.group(1)); x = m.group(0)
        if r <= r_h: return x
        x = re.sub(r'<row r="%d"' % r, '<row r="%d"' % (r + 1), x, count=1)
        return re.sub(r'<c r="([A-Z]+)%d"' % r, lambda mm: '<c r="%s%d"' % (mm.group(1), r + 1), x)
    s = re.sub(r'<row r="(\d+)"[^>]*>.*?</row>', shift_row, s, flags=re.S)
    tpl = re.search(r'<row r="%d"[^>]*>.*?</row>' % r_h, s, re.S).group(0)
    vals = ['LSB_project', 'Hợp đồng & triển khai', 'URL_Project_data', 'string', '', '', 'Nhập', 'link thư mục dữ liệu dự án (Drive / OneDrive)', 'Mới (v4.2)']
    cells = ''
    for i, v in enumerate(vals):
        col = 'ABCDEFGHI'[i]
        st = re.search(r'<c r="%s%d" s="(\d+)"' % (col, r_h), tpl); st = st.group(1) if st else '25'
        cells += ('<c r="%s%d" s="%s"/>' % (col, r_h + 1, st)) if not v else \
                 '<c r="%s%d" s="%s" t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>' % (col, r_h + 1, st, escape(v))
    head = re.match(r'<row r="\d+"([^>]*)>', tpl).group(1)
    newrow = '<row r="%d"%s>%s</row>' % (r_h + 1, head, cells)
    s = s.replace(tpl, tpl + newrow, 1)
    # dimension, autoFilter, merged cells, conditional formatting refs
    s = re.sub(r'<dimension ref="A1:I(\d+)"/>', lambda m: '<dimension ref="A1:I%d"/>' % (int(m.group(1)) + 1), s)
    def bump(ref):
        return re.sub(r'([A-Z]+)(\d+)', lambda m: m.group(1) + str(int(m.group(2)) + (1 if int(m.group(2)) > r_h else 0)), ref)
    s = re.sub(r'(<autoFilter ref=")([^"]+)"', lambda m: m.group(1) + bump(m.group(2)) + '"', s)
    s = re.sub(r'(<mergeCell ref=")([^"]+)"', lambda m: m.group(1) + bump(m.group(2)) + '"', s)
    s = re.sub(r'(sqref=")([^"]+)"', lambda m: m.group(1) + ' '.join(bump(x) for x in m.group(2).split()) + '"', s)
    wb = T('xl/workbook.xml')
    wb = re.sub(r"(ERD_Dictionary!\$A\$1:\$I\$)(\d+)", lambda m: m.group(1) + str(int(m.group(2)) + 1), wb)
    put('xl/workbook.xml', wb)
    put(n, s)
    # tiêu đề nhóm "Quan hệ" — cập nhật ghi chú FK Quotation → project
    s = T(n)
    for r, x in list(re.findall(r'<row r="(\d+)"[^>]*>.*?</row>', s, re.S) and
                     [(int(m.group(1)), m.group(0)) for m in re.finditer(r'<row r="(\d+)"[^>]*>.*?</row>', s, re.S)]):
        if cell_text(x, 'A') == 'LSB_Quotation' and cell_text(x, 'B') == 'LSB_project':
            row_xml[r] = x; set_text(r, 'E', 'v4.2: có dropdown FK (kiểu cảnh báo)')
    put(n, s)
    log.append('ERD_Dictionary: thêm URL_Project_data (dòng %d), cập nhật ghi chú Quotation_code / Result_Lesson.Project_id' % (r_h + 1))

# calcChain có thể lệch sau khi sửa → xóa để Excel/Sheets tự dựng lại
if 'xl/calcChain.xml' in files:
    del files['xl/calcChain.xml']
    put('[Content_Types].xml', re.sub(r'<Override PartName="/xl/calcChain.xml"[^>]*/>', '', T('[Content_Types].xml')))
    put('xl/_rels/workbook.xml.rels', re.sub(r'<Relationship [^>]*calcChain[^>]*/>', '', T('xl/_rels/workbook.xml.rels')))

with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
    for name in zin.namelist():
        if name in files: zout.writestr(infos[name], files[name])
print('\n'.join(log))
