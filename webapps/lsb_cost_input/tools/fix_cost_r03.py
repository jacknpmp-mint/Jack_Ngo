"""Cost Input Database Part 2: R02 → R03 (cho LSB Cost Input Web App v1.0).

Sửa trực tiếp XML (tools/xlsx_xml.py), không lưu qua openpyxl. Thay đổi:
  1. FX_Rates: thêm cột G `fx_id` (FX ID, khóa do app cấp, FX-00001…); mở rộng Excel Table tbl_FXRates tới cột G.
  2. Sheet mới `Staff` (cuối file): staff_id · full_name · email · access_level · active · notes,
     cùng bố cục 3 dòng tiêu đề như các sheet khác; dropdown Access level (Viewer/Editor/Admin), Active (Y/N).
     Dòng 4 = tài khoản Admin đầu tiên (email truyền vào bằng --admin).
  3. DataDictionary: thêm dòng cho FX_Rates.fx_id và 6 cột Staff; README: tiêu đề R03 + mục "7. WEB APP (R03)".
Dùng: python3 -I tools/fix_cost_r03.py <R02.xlsx> <R03.xlsx> --admin you@example.com
"""
import sys, os, re, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlsx_xml import Book
from xml.sax.saxutils import escape

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--admin', default='')
a = ap.parse_args()
if os.path.abspath(a.src) == os.path.abspath(a.dst): sys.exit('Không ghi đè file gốc')

b = Book(a.src)
dv_before = sum(len(re.findall(r'<dataValidation ', b.text(p))) for p in b.sheets.values())

# ---------------------------------------------------------------- 1. FX_Rates.fx_id
fx = 'FX_Rates'
b.set_cell(fx, 'G2', 'fx_id', style_from='F2')
b.set_cell(fx, 'G3', 'FX ID', style_from='F3')
b.set_cell(fx, 'G4', 'FX-00001', style_from='F4')
s = b.xml(fx)
s = s.replace('max="6" min="6" style="0" width="26"/></cols>',
              'max="6" min="6" style="0" width="26"/><col collapsed="false" customWidth="true" hidden="false" outlineLevel="0" max="7" min="7" style="0" width="12"/></cols>', 1)
b.put(b.sheets[fx], s)
t = b.text('xl/tables/table1.xml')
assert 'tbl_FXRates' in t
t = t.replace('ref="A3:F503"', 'ref="A3:G503"').replace('<tableColumns count="6">', '<tableColumns count="7">')
t = t.replace('</tableColumns>', '<tableColumn id="7" name="FX ID"/></tableColumns>')
b.put('xl/tables/table1.xml', t)
b.log.append('tbl_FXRates → A3:G503 (+ FX ID)')

# ---------------------------------------------------------------- 2. sheet Staff
def c(ref, v, st):
    if v == '' or v is None: return '<c r="%s" s="%s"/>' % (ref, st)
    return '<c r="%s" s="%s" t="inlineStr"><is><t xml:space="preserve">%s</t></is></c>' % (ref, st, escape(str(v)))
cols = ['staff_id', 'full_name', 'email', 'access_level', 'active', 'notes']
labels = ['Staff ID *', 'Full name *', 'Email (Google account) *', 'Access level *', 'Active (Y/N) *', 'Notes']
L = 'ABCDEF'
rows = ['<row r="1">%s</row>' % c('A1', 'APP USERS (web app login: Viewer / Editor / Admin)', 6),
        '<row r="2">%s</row>' % ''.join(c(L[i] + '2', cols[i], 13) for i in range(6)),
        '<row r="3" ht="40" customHeight="true">%s</row>' % ''.join(c(L[i] + '3', labels[i], 11) for i in range(6))]
first = ['STF-001', 'Admin', a.admin.lower(), 'Admin', 'Y', 'First admin - change the name; add other users below'] if a.admin else [''] * 6
rows.append('<row r="4">%s</row>' % ''.join(c(L[i] + '4', first[i], 12) for i in range(6)))
for r in range(5, 104):
    rows.append('<row r="%d">%s</row>' % (r, ''.join(c('%s%d' % (L[i], r), '', 12) for i in range(6))))
widths = [12, 26, 32, 14, 12, 40]
sheet = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
         '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
         '<dimension ref="A1:F103"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
         '<sheetFormatPr defaultRowHeight="15"/><cols>%s</cols><sheetData>%s</sheetData>'
         '<dataValidations count="2">'
         '<dataValidation type="list" allowBlank="true" showErrorMessage="true" errorStyle="stop" sqref="D4:D103"><formula1>"Viewer,Editor,Admin"</formula1></dataValidation>'
         '<dataValidation type="list" allowBlank="true" showErrorMessage="true" errorStyle="stop" sqref="E4:E103"><formula1>"Y,N"</formula1></dataValidation>'
         '</dataValidations><pageMargins left="0.75" right="0.75" top="1" bottom="1" header="0.5" footer="0.5"/></worksheet>') % (
    ''.join('<col min="%d" max="%d" width="%d" customWidth="true"/>' % (i + 1, i + 1, w) for i, w in enumerate(widths)), ''.join(rows))
path = 'xl/worksheets/sheet27.xml'
assert path not in b.files
b.files[path] = sheet.encode('utf-8')
import zipfile
b.infos.append(zipfile.ZipInfo(path))
wb = b.text('xl/workbook.xml')
wb = wb.replace('</sheets>', '<sheet name="Staff" sheetId="27" state="visible" r:id="rId30"/></sheets>')
b.put('xl/workbook.xml', wb)
rels = b.text('xl/_rels/workbook.xml.rels')
assert 'Id="rId30"' not in rels
rels = rels.replace('</Relationships>', '<Relationship Id="rId30" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet27.xml"/></Relationships>')
b.put('xl/_rels/workbook.xml.rels', rels)
ct = b.text('[Content_Types].xml')
ct = ct.replace('</Types>', '<Override PartName="/xl/worksheets/sheet27.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
b.put('[Content_Types].xml', ct)
b.sheets['Staff'] = path
b.log.append('Sheet mới Staff (sheet27.xml)' + (' · Admin ' + a.admin if a.admin else ''))

# ---------------------------------------------------------------- 3. DataDictionary + README
dd = 'DataDictionary'
s = b.xml(dd)
last = max(int(x) for x in re.findall(r'<row r="(\d+)"', s))
add = [
    ['FX_Rates', 'tbl_FXRates', 'fx_id', 'FX ID', 'Text', 'Yes', 'PK', 'Web app', 'Unique code of the rate row (FX-00001), given by the web app; date + currency must still be unique (R03)'],
    ['Staff', '', 'staff_id', 'Staff ID', 'Text', 'Yes', 'PK', 'Web app', 'Unique user code (STF-001), given by the web app (R03)'],
    ['Staff', '', 'full_name', 'Full name', 'Text', 'Yes', '', 'Manual entry', 'Name shown in the web app and the change log'],
    ['Staff', '', 'email', 'Email (Google account)', 'Text', 'Yes', 'Unique', 'Manual entry', 'Google account used to open the web app'],
    ['Staff', '', 'access_level', 'Access level', 'List', 'Yes', '', 'Dropdown', 'Viewer = read only; Editor = enter quotations, suppliers, ports, processes; Admin = also FX rates, Config lists, users, delete'],
    ['Staff', '', 'active', 'Active (Y/N)', 'List', 'Yes', '', 'Dropdown', 'N = account suspended'],
    ['Staff', '', 'notes', 'Notes', 'Text', '', '', 'Manual entry', 'Notes'],
]
for i, row in enumerate(add):
    r = last + 1 + i
    for j, v in enumerate(row):
        b.set_cell(dd, '%s%d' % ('ABCDEFGHI'[j], r), v, style_from='%s%d' % ('ABCDEFGHI'[j], last))
wb = b.text('xl/workbook.xml')
wb = re.sub(r'DataDictionary!\$A\$3:\$I\$\d+', 'DataDictionary!$A$3:$I$%d' % (last + len(add)), wb)
b.put('xl/workbook.xml', wb)

rd = 'README'
b.set_cell(rd, 'A1', 'COST INPUT DATABASE - PART 2: MATERIALS, PRODUCTION, TRANSPORT - R03 (English)')
s = b.xml(rd)
last = max(int(x) for x in re.findall(r'<row r="(\d+)"', s))
notes = [('7. WEB APP (R03)', None),
         ('Web app', 'LSB Cost Input web app (Google Sheets + Apps Script) reads and writes this workbook once it is uploaded to Google Drive and opened as a Google Sheet. It reads field codes from row 2 and data from row 4; formula columns stay in the sheet.'),
         ('FX_Rates.fx_id (new)', 'Column G: unique row code FX-00001 given by the web app so a rate row can be edited or deleted. Date + currency must still be unique.'),
         ('Staff (new sheet)', 'Web app users: email (Google account), access level Viewer / Editor / Admin, active Y/N. Keep at least one active Admin.'),
         ('Record IDs', 'The web app gives the next code automatically on save (MSP-00002, SUP-0006, PORT-03...). Codes typed directly in the sheet keep working.')]
for i, (k, v) in enumerate(notes):
    r = last + 2 + i
    if v is None: b.set_cell(rd, 'A%d' % r, k, style_from='A42')
    else:
        b.set_cell(rd, 'A%d' % r, k, style_from='A55'); b.set_cell(rd, 'B%d' % r, v, style_from='B55')

dv_after = sum(len(re.findall(r'<dataValidation ', b.text(p))) for p in b.sheets.values())
b.save(a.dst)
print('\n'.join(x for x in b.log if 'DataDictionary!' not in x and 'README!' not in x))
print(f'dropdown/validation: {dv_before} → {dv_after}')
