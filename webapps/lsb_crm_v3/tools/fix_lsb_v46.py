"""Sửa LSB_CRM_Bidding_Project_DB_v4.2.xlsx → v4.6 (gộp 16 bảng) bằng XML — giữ dropdown x14.
Chạy: python3 -I tools/fix_lsb_v46.py <vao_v4.2.xlsx> <ra_v4.6.xlsx>
1. LSB_project.Quotation_code → Quotation_LSB-Code (mã nội bộ nhập tay, so với LSB_Quotation.Quotation_LSB_Code)
2. LSB_Result_Lesson.Project_id: bỏ công thức #REF! → FK chọn tay (dropdown LSB_project)
3. LSB_cost.Invoice_code (ngày) → Invoice_no (text); Year/Quarter theo Payment_day (H)
4. ERD_Dictionary cập nhật các dòng trên."""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlsx_xml import Book

src, dst = sys.argv[1], sys.argv[2]
b = Book(src); before = b.count_dropdowns()

def sub(sheet, pat, rep, count=0, flags=0, expect=None):
    s = b.xml(sheet); s2, n = re.subn(pat, rep, s, count=count, flags=flags)
    if expect is not None and n != expect: raise SystemExit(f'{sheet}: {pat} khớp {n} (mong {expect})')
    b.put(b.sheets[sheet], s2); b.log.append(f'{sheet}: {n} lần {pat[:50]}')
    return n

# 1 ---- LSB_project D1
b.set_cell('LSB_project', 'D1', 'Quotation_LSB-Code')
b.set_comment('LSB_project', 'D1', 'Nhập tay\nKiểu: string\nmã báo giá nội bộ LSB (= LSB_Quotation.Quotation_LSB_Code), vd LSB-26-PCS — không phải FK; app cảnh báo nếu không khớp / báo giá chưa Won / trùng')

# 2 ---- LSB_Result_Lesson L
st_in = re.search(r'<c r="B2" s="(\d+)"', b.xml('LSB_Result_Lesson')).group(1)
sub('LSB_Result_Lesson', r'<c r="L(\d+)" s="\d+" t="str">.*?</c>', lambda m: '<c r="L%s" s="%s"/>' % (m.group(1), st_in), flags=re.S, expect=300)
b.set_style('LSB_Result_Lesson', 'L1', 'B1')
b.set_comment('LSB_Result_Lesson', 'L1', 'Khóa ngoại\nKiểu: string\nFK → LSB_project.Project_id — chọn tay (tùy chọn) khi báo giá Won đã thành dự án')
b.add_dropdown('LSB_Result_Lesson', 'L2:L301', 'LSB_project!$A$2:$A$2000')

# 3 ---- LSB_cost G → Invoice_no
st_txt = re.search(r'<c r="D2" s="(\d+)"', b.xml('LSB_cost')).group(1)
sub('LSB_cost', r'<c r="G(\d+)" s="\d+"(?:/>|>.*?</c>)', lambda m: '<c r="G%s" s="%s"/>' % (m.group(1), st_txt), flags=re.S)
b.set_cell('LSB_cost', 'G1', 'Invoice_no')
b.set_comment('LSB_cost', 'G1', 'Nhập tay\nKiểu: string\nsố hóa đơn nhà cung cấp (v4.6: thay Invoice_code — trước là ngày)')
sub('LSB_cost', r'sqref="G2:H301"', 'sqref="H2:H301"', expect=1)
b.fill_formula('LSB_cost', 'J', '=IF(H{r}="","",YEAR(H{r}))', 2, 301)
b.fill_formula('LSB_cost', 'K', '=IF(H{r}="","","Q"&ROUNDUP(MONTH(H{r})/3,0))', 2, 301)
b.set_comment('LSB_cost', 'J1', 'Cột AUTO — không nhập\nKiểu: number\nnăm theo Payment_day')
b.set_comment('LSB_cost', 'K1', 'Cột AUTO — không nhập\nKiểu: string\nquý theo Payment_day')

# 4 ---- ERD_Dictionary (tìm dòng theo nội dung)
erd = b.xml('ERD_Dictionary')
import openpyxl
ws = openpyxl.load_workbook(src, read_only=True)['ERD_Dictionary']
rows = {}
for r in ws.iter_rows(min_row=1):
    v = [c.value for c in r]
    if v[0] and v[2]: rows[(v[0], v[1] if v[1] in ('LSB_project','LSB_Result_Lesson') else '', v[2])] = r[0].row
def row(t, c, rel=''):
    return rows[(t, rel, c)]
b.set_cell('ERD_Dictionary', 'I1', 'Thay đổi')
r = row('LSB_project', 'Quotation_code')
for col, val in zip('CDEFGHI', ['Quotation_LSB-Code', 'string', '', '', 'Nhập', 'mã báo giá nội bộ LSB = LSB_Quotation.Quotation_LSB_Code (nhập tay, cảnh báo nếu không khớp / chưa Won / trùng)', 'v4.6: đổi tên từ Quotation_code, bỏ FK']):
    b.set_cell('ERD_Dictionary', f'{col}{r}', val)
r = row('LSB_Result_Lesson', 'Project_id')
for col, val in zip('DEFGHI', ['string', 'FK', 'LSB_project', 'Nhập', 'tùy chọn — chọn dự án khi báo giá Won đã ký HĐ', 'v4.6: bỏ công thức #REF! → FK chọn tay']):
    b.set_cell('ERD_Dictionary', f'{col}{r}', val)
r = row('LSB_cost', 'Invoice_code')
for col, val in zip('CDEFGHI', ['Invoice_no', 'string', '', '', 'Nhập', 'số hóa đơn nhà cung cấp', 'v4.6: Invoice_code (ngày) → Invoice_no (text); Year/Quarter theo Payment_day']):
    b.set_cell('ERD_Dictionary', f'{col}{r}', val)
for c in ('Year', 'Quarter'):
    r = row('LSB_cost', c)
    b.set_cell('ERD_Dictionary', f'H{r}', 'auto từ Payment_day'); b.set_cell('ERD_Dictionary', f'I{r}', 'v4.6: nguồn đổi từ Invoice_code sang Payment_day')
r = rows[('LSB_Quotation', 'LSB_project', 'Quotation_code')]
for col, val in zip('CDEF', ['Quotation_LSB_Code ↔ Quotation_LSB-Code', '1 : 0..1 (Won)', 'không FK — so mã nội bộ, app cảnh báo', '']):
    b.set_cell('ERD_Dictionary', f'{col}{r}', val)

# calcChain trỏ ô công thức đã xóa → bỏ (Excel/Sheets tự dựng lại)
if 'xl/calcChain.xml' in b.files:
    b.infos = [i for i in b.infos if i.filename != 'xl/calcChain.xml']; del b.files['xl/calcChain.xml']
    b.put('[Content_Types].xml', re.sub(r'<Override[^>]*calcChain[^>]*/>', '', b.text('[Content_Types].xml')))
    b.put('xl/_rels/workbook.xml.rels', re.sub(r'<Relationship[^>]*calcChain[^>]*/>', '', b.text('xl/_rels/workbook.xml.rels')))
    b.log.append('bỏ xl/calcChain.xml')
b.save(dst); after = b.count_dropdowns()
print('\n'.join(b.log)); print('dropdown trước/sau:', before, after)
assert all(after[k] >= before[k] for k in before)
