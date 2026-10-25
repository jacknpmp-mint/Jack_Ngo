"""Sửa file .xlsx bằng cách sửa TRỰC TIẾP XML (không lưu qua openpyxl → giữ dropdown x14, định dạng, ghi chú).

Vì sao: openpyxl làm MẤT loại dropdown x14 (dropdown trỏ sang sheet khác — FK và Lists) khi lưu.
Dùng như thư viện trong một script sửa riêng cho từng lần (lưu script đó vào tools/fix_<db>_<phiên bản>.py):

    import sys; sys.path.insert(0, 'tools'); from xlsx_xml import Book
    b = Book('vao.xlsx')
    b.set_cell('HR_Task', 'H1', 'Done_day', style_from='G1')          # thêm tiêu đề cột mới, chép kiểu ô G1
    b.set_comment('HR_Task', 'H1', 'Nhập tay\\nKiểu: date\\nngày hoàn thành')   # sửa hoặc thêm ghi chú
    b.set_style('HR_Task', 'J1', 'I1')                                  # màu tiêu đề AUTO giống cột I
    b.fill_formula('HR_Task', 'J', '=IF(G{r}="","",YEAR(G{r}))', 2, 301)  # kéo công thức (AUTO) xuống 300 dòng
    b.add_dropdown('HR_Task', 'C2:C301', 'HR_Employee!$A$2:$A$2000')  # FK → bảng khác (x14)
    b.add_dropdown('HR_Task', 'D2:D301', 'Lists!$B$2:$B$50')          # danh mục từ sheet Lists
    b.replace('HR_Task', 'HR_Old!#REF!', 'HR_Employee!$A:$A')          # sửa công thức #REF!
    b.save('ra.xlsx'); print('\\n'.join(b.log))

Sau khi sửa: chạy lại tools/extract_xlsx.py trên file ra để kiểm tra (số dropdown, PK/FK, công thức) và mở file
bằng openpyxl (chỉ đọc) để chắc file không hỏng. Không bao giờ ghi đè file gốc của người dùng — luôn ghi file mới
(tên tăng phiên bản, vd _v4.6.xlsx).
"""
import re, zipfile, uuid
from xml.sax.saxutils import escape


def col_idx(letters):
    n = 0
    for ch in letters: n = n * 26 + ord(ch) - 64
    return n


class Book:
    def __init__(self, path):
        z = zipfile.ZipFile(path)
        self.infos = z.infolist()
        self.files = {i.filename: z.read(i.filename) for i in self.infos}
        self.log = []
        wb = self.text('xl/workbook.xml'); rels = self.text('xl/_rels/workbook.xml.rels')
        rid = {}
        for m in re.finditer(r'<Relationship [^>]*>', rels):
            a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(0))); rid[a['Id']] = a['Target']
        self.sheets = {}
        for m in re.finditer(r'<sheet [^>]*>', wb):
            a = dict(re.findall(r'([\w:]+)="([^"]*)"', m.group(0)))
            t = rid[a['r:id']].lstrip('/')
            self.sheets[a['name'].replace('&amp;', '&')] = t if t.startswith('xl/') else 'xl/' + t

    # ----------------------------------------------------------- tiện ích
    def text(self, n): return self.files[n].decode('utf-8')
    def put(self, n, s): self.files[n] = s.encode('utf-8')
    def xml(self, sheet): return self.text(self.sheets[sheet])

    def replace(self, sheet, old, new):
        s = self.xml(sheet); k = s.count(escape(old))
        self.put(self.sheets[sheet], s.replace(escape(old), escape(new)))
        self.log.append(f'{sheet}: thay {k} lần "{old}" → "{new}"')
        return k

    # ----------------------------------------------------------- ô
    def _row(self, s, r):
        m = re.search(r'<row r="%d"[^>]*?(?:/>|>.*?</row>)' % r, s, re.S)
        return m

    def set_cell(self, sheet, ref, value, style_from=None):
        """Ghi 1 ô: chuỗi (inlineStr), số, hoặc công thức (bắt đầu '='). Giữ kiểu ô cũ hoặc chép từ style_from."""
        s = self.xml(sheet)
        mref = re.match(r'([A-Z]+)(\d+)$', ref); col, r = mref.group(1), int(mref.group(2))
        style = ''
        if style_from:
            ms = re.search(r'<c r="%s"[^>]*?\ss="(\d+)"' % style_from, s)
            if ms: style = ' s="%s"' % ms.group(1)
        old = re.search(r'<c r="%s"([^>]*?)(?:/>|>.*?</c>)' % ref, s, re.S)
        if old and not style:
            ms = re.search(r'\ss="(\d+)"', old.group(1)); style = ' s="%s"' % ms.group(1) if ms else ''
        if isinstance(value, str) and value.startswith('='):
            cell = '<c r="%s"%s><f>%s</f></c>' % (ref, style, escape(value[1:]))
        elif isinstance(value, (int, float)):
            cell = '<c r="%s"%s><v>%s</v></c>' % (ref, style, value)
        else:
            cell = '<c r="%s"%s t="inlineStr"><is><t>%s</t></is></c>' % (ref, style, escape(str(value)))
        if old:
            s = s[:old.start()] + cell + s[old.end():]
        else:
            row = self._row(s, r)
            if row is None:
                # chèn dòng mới đúng thứ tự
                rows = [(int(x.group(1)), x.start()) for x in re.finditer(r'<row r="(\d+)"', s)]
                pos = next((p for n, p in rows if n > r), s.index('</sheetData>'))
                s = s[:pos] + '<row r="%d">%s</row>' % (r, cell) + s[pos:]
            else:
                body = row.group(0)
                if body.endswith('/>'): body = body[:-2] + '></row>'
                cells = list(re.finditer(r'<c r="([A-Z]+)\d+"', body))
                ins = next((c.start() for c in cells if col_idx(c.group(1)) > col_idx(col)), body.rindex('</row>'))
                body = body[:ins] + cell + body[ins:]
                s = s[:row.start()] + body + s[row.end():]
        dm = re.search(r'<dimension ref="([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?"/>', s)
        if dm:
            c2, r2 = dm.group(3) or dm.group(1), int(dm.group(4) or dm.group(2))
            if col_idx(col) > col_idx(c2) or r > r2:
                c2 = col if col_idx(col) > col_idx(c2) else c2
                s = s.replace(dm.group(0), '<dimension ref="%s%s:%s%d"/>' % (dm.group(1), dm.group(2), c2, max(r, r2)), 1)
        self.put(self.sheets[sheet], s)
        self.log.append(f'{sheet}!{ref} = {value}')

    def fill_formula(self, sheet, col, template, r1, r2):
        """Kéo công thức xuống các dòng r1..r2. template dùng {r} cho số dòng, vd '=IF(G{r}="","",YEAR(G{r}))'."""
        style_ref = '%s%d' % (col, r1)
        for r in range(r1, r2 + 1):
            self.set_cell(sheet, '%s%d' % (col, r), template.format(r=r), style_from=style_ref if r > r1 else None)
        self.log = self.log[:-(r2 - r1 + 1)] + [f'{sheet}!{col}{r1}:{col}{r2}: công thức {template}']

    # ----------------------------------------------------------- ghi chú tiêu đề
    def _comment_parts(self, sheet):
        relp = self.sheets[sheet].replace('worksheets/', 'worksheets/_rels/') + '.rels'
        rels = self.text(relp) if relp in self.files else ''
        def part(pat):
            m = re.search(r'Target="/?([^"]*%s)"' % pat, rels)
            if not m: return None
            t = m.group(1)
            if t.startswith('../'): t = 'xl/' + t[3:]
            elif not t.startswith('xl/'): t = 'xl/' + t
            return t
        return part(r'comments?\d*\.xml'), part(r'\.vml')

    def set_comment(self, sheet, ref, text):
        """Đặt ghi chú (comment) cho ô: sửa nếu đã có, thêm mới nếu chưa (sheet phải đã có ít nhất 1 ghi chú —
        file theo quy ước LSB luôn có ghi chú ở dòng tiêu đề). Ô mới: chép khung hiển thị VML của ghi chú cuối."""
        n, vml = self._comment_parts(sheet)
        if not n: raise ValueError(f'{sheet} chưa có ghi chú nào — thêm ghi chú đầu tiên bằng Excel/Google Sheets')
        s = self.text(n)
        body = '<text><r><t xml:space="preserve">%s</t></r></text>' % escape(text)
        cm = re.search(r'<comment ref="%s"[^>]*>.*?</comment>' % ref, s, re.S)
        if cm:
            head = re.match(r'<comment ref="%s"[^>]*>' % ref, cm.group(0)).group(0)
            self.put(n, s[:cm.start()] + head + body + '</comment>' + s[cm.end():])
            self.log.append(f'{sheet}!{ref}: sửa ghi chú → {text.splitlines()[0]}…')
            return
        author = re.search(r'<comment [^>]*authorId="(\d+)"', s)
        self.put(n, s.replace('</commentList>', '<comment ref="%s" authorId="%s">%s</comment></commentList>' % (ref, author.group(1) if author else '0', body)))
        if vml:
            v = self.text(vml)
            shapes = list(re.finditer(r'<(\w+:)?shape [^>]*>.*?</(\w+:)?shape>', v, re.S))
            if shapes:
                last = shapes[-1].group(0)
                ids = [int(x) for x in re.findall(r'_x0000_s(\d+)', v)] or [1024]
                m = re.match(r'([A-Z]+)(\d+)$', ref)
                new = re.sub(r'_x0000_s\d+', '_x0000_s%d' % (max(ids) + 1), last, count=1)
                new = re.sub(r'<(\w+:)?Row>\d+</(\w+:)?Row>', lambda x: '<%sRow>%d</%sRow>' % (x.group(1) or '', int(m.group(2)) - 1, x.group(2) or ''), new)
                new = re.sub(r'<(\w+:)?Column>\d+</(\w+:)?Column>', lambda x: '<%sColumn>%d</%sColumn>' % (x.group(1) or '', col_idx(m.group(1)) - 1, x.group(2) or ''), new)
                self.put(vml, v[:shapes[-1].end()] + new + v[shapes[-1].end():])
        self.log.append(f'{sheet}!{ref}: thêm ghi chú → {text.splitlines()[0]}…')

    def set_style(self, sheet, ref, style_from):
        """Chép kiểu (màu tiêu đề PK/FK/AUTO/nhập tay) từ ô khác, vd set_style('HR_KeyResult', 'I1', 'H1')."""
        s = self.xml(sheet)
        ms = re.search(r'<c r="%s"[^>]*?\ss="(\d+)"' % style_from, s)
        if not ms: raise ValueError(f'{sheet}!{style_from} không có kiểu')
        s2 = re.sub(r'(<c r="%s")((?:(?!>)[^s]|s(?!="))*?)(\ss="\d+")?' % ref, lambda m: m.group(1) + m.group(2) + ' s="%s"' % ms.group(1), s, count=1)
        self.put(self.sheets[sheet], s2)
        self.log.append(f'{sheet}!{ref}: kiểu = {style_from}')

    # ----------------------------------------------------------- dropdown
    def add_dropdown(self, sheet, sqref, source, warning=True, title='', message=''):
        """Thêm dropdown x14 (nguồn ở sheet khác). warning=True → vẫn cho gõ giá trị khác (chỉ cảnh báo)."""
        s = self.xml(sheet)
        style = 'warning' if warning else 'stop'
        dv = ('<x14:dataValidation type="list" errorStyle="%s" allowBlank="1" showErrorMessage="1"%s%s xr:uid="{%s}">'
              '<x14:formula1><xm:f>%s</xm:f></x14:formula1><xm:sqref>%s</xm:sqref></x14:dataValidation>') % (
            style, ' errorTitle="%s"' % escape(title) if title else '', ' error="%s"' % escape(message) if message else '',
            str(uuid.uuid4()).upper(), escape(source), sqref)
        m = re.search(r'<x14:dataValidations count="(\d+)"', s)
        if m:
            s = s.replace(m.group(0), '<x14:dataValidations count="%d"' % (int(m.group(1)) + 1), 1)
            s = s.replace('</x14:dataValidations>', dv + '</x14:dataValidations>', 1)
        else:
            ext = ('<ext uri="{CCE6A557-97BC-4b89-ADB6-D9C93CAAB3DF}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main">'
                   '<x14:dataValidations count="1" xmlns:xm="http://schemas.microsoft.com/office/excel/2006/main">%s</x14:dataValidations></ext>') % dv
            if '<extLst>' in s: s = s.replace('<extLst>', '<extLst>' + ext, 1)
            else: s = s.replace('</worksheet>', '<extLst>%s</extLst></worksheet>' % ext)
            if 'xmlns:xr=' not in s[:600]:
                s = s.replace('<worksheet ', '<worksheet xmlns:xr="http://schemas.microsoft.com/office/spreadsheetml/2014/revision" ', 1)
        self.put(self.sheets[sheet], s)
        self.log.append(f'{sheet}!{sqref}: dropdown → {source}')

    def count_dropdowns(self):
        return {n: len(re.findall(r'<x14:dataValidation ', self.text(p))) for n, p in self.sheets.items()}

    # ----------------------------------------------------------- lưu
    def save(self, path):
        with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
            for i in self.infos:
                z.writestr(i, self.files[i.filename])
        self.log.append(f'Đã ghi {path}')
