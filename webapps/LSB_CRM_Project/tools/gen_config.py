"""Sinh src/01_Config.gs từ tools/schema_raw.json (+ ERD_Dictionary của file xlsx) và bảng quy ước bên dưới.

Dùng (từ thư mục LSB_WebApp_v2.1):
  python3 tools/extract_xlsx.py [file.xlsx]   # đọc lược đồ + dữ liệu test (mặc định ../../data/…v4.2.xlsx)
  python3 tools/gen_config.py [file.xlsx]     # sinh 01_Config.gs
"""
import json, collections, os, sys, warnings
import openpyxl
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', '..', 'data', 'LSB_CRM_Bidding_Project_DB_v4.3_Project.xlsx')
raw = json.load(open(os.path.join(HERE, 'schema_raw.json')))

dic = {}
for r in openpyxl.load_workbook(SRC)['ERD_Dictionary'].iter_rows(min_row=2, values_only=True):
    if r[0] and str(r[0]).startswith('LSB_') and r[2] and r[1] and not str(r[1]).startswith('LSB_'):
        dic[(r[0], r[2])] = r[7] or ''

META = collections.OrderedDict([
 ('LSB_Lead', dict(label='Lead', module='customer', prefix='LD', idStyle='year', display='Company_name')),
 ('LSB_Lead_Qualifying', dict(label='Đánh giá lead', module='bidding', prefix='QL', idStyle='year', display='Task_duty')),
 ('LSB_Quotation', dict(label='Báo giá', module='quotation', prefix='QT', idStyle='year', display='Project_name')),
 ('LSB_Bidding_strategy', dict(label='Chiến lược thầu', module='bidding', prefix='BS', idStyle='year', display='Win_theme')),
 ('LSB_Bidding_action_plan', dict(label='Kế hoạch hành động thầu', module='bidding', prefix='BA', idStyle='year', display='Task_duty')),
 ('LSB_Result_Lesson', dict(label='Kết quả & bài học thầu', module='bidding', prefix='RL', idStyle='year', display='Result')),
 ('LSB_Customer', dict(label='Khách hàng', module='customer', prefix='CU', idStyle='catalog', display='Company_name')),
 ('LSB_project', dict(label='Dự án', module='project', prefix='PJ', idStyle='year', display='Project_name')),
 ('LSB_Project_task', dict(label='Đầu việc dự án', module='project', prefix='PT', idStyle='year', display='Task_duty')),
 ('LSB_shipment', dict(label='Lô hàng', module='project', prefix='SH', idStyle='year', display='Shipment_code')),
 ('LSB_Project_handover_lesson', dict(label='Bài học dự án', module='project', prefix='PL', idStyle='year', display='Issue_description')),
 ('LSB_payment_plan', dict(label='Kế hoạch thanh toán', module='project', prefix='PP', idStyle='year', display='Payment_code')),
 ('LSB_paid', dict(label='Tiền đã thu', module='project', prefix='PD', idStyle='year', display='Invoice_no')),
 ('LSB_cost', dict(label='Chi phí', module='project', prefix='CO', idStyle='year', display='Vendor')),
 ('LSB_Staff', dict(label='Nhân sự', module='user', prefix='ST', idStyle='catalog', display='Full_name')),
 ('LSB_Task', dict(label='Đầu việc chuẩn', module='user', prefix='TK', idStyle='catalog', display='Task_duty')),
])
REQ = {'LSB_Lead': ['Company_name', 'Lead_status'],
 'LSB_Lead_Qualifying': ['Lead_id', 'Task_id'],
 'LSB_Quotation': ['Lead_id', 'Project_name', 'Status'],
 'LSB_Bidding_strategy': ['Quotation_code'],
 'LSB_Bidding_action_plan': ['Lead_id', 'Task_id'],
 'LSB_Result_Lesson': ['Quotation_code', 'Result'],
 'LSB_Customer': ['Lead_id'], 'LSB_project': ['Customer_id', 'Project_name', 'Status'],
 'LSB_Project_task': ['Project_id', 'Task_id'], 'LSB_shipment': ['Project_id'], 'LSB_Project_handover_lesson': ['Project_id', 'Handover_day'],
 'LSB_payment_plan': ['Project_id', 'Payment_code'], 'LSB_paid': ['PaymentPlan_id', 'Paid_USD'], 'LSB_cost': ['Project_id', 'Category'],
 'LSB_Staff': ['Full_name', 'Email', 'Access_level', 'Active'], 'LSB_Task': ['Phase', 'Task_duty']}
UNIQ = {('LSB_Customer', 'Lead_id'), ('LSB_project', 'Quotation_LSB-Code'), ('LSB_Staff', 'Email'),
        ('LSB_Bidding_strategy', 'Quotation_code'), ('LSB_Result_Lesson', 'Quotation_code')}
# FK có trong ERD nhưng sheet chưa có dropdown. soft = sai mã chỉ cảnh báo (dữ liệu cũ nhập tay).
# v4.3: LSB_project.Quotation_code → Quotation_LSB-Code (nhập tay, không FK) → không còn FK bổ sung.
FK_ADD = {}
# v4.3: cột có công thức CHỈ ở dòng 2 (dòng 3–301 trống) → không coi là AUTO (vẫn cho nhập);
# app tự tính khi để trống (Data.gs · Record_calc_). mul: from × APP[by]; addDays: from + APP[by] ngày.
CALC = {('LSB_Quotation', 'Value_VND'): dict(type='mul', src='Value_USD', by='FX_USD_VND'),
        ('LSB_project', 'Contract_VND'): dict(type='mul', src='Contract_USD', by='FX_USD_VND'),
        ('LSB_shipment', 'ETA_plan'): dict(type='addDays', src='ETD_plan', by='TRANSIT_DAYS'),
        ('LSB_shipment', 'ETA_actual'): dict(type='addDays', src='ETD_actual', by='TRANSIT_DAYS')}
TYPE_FIX = {('LSB_shipment', 'Shipment_code'): 'string', ('LSB_payment_plan', 'PP_revision'): 'number'}
PCT = {('LSB_payment_plan', 'Payment_pct'): [0, 1], ('LSB_project', 'Grossmargin_EST'): [-1, 1], ('LSB_project', 'Grossmargin_Actual'): [-1, 1],
       ('LSB_Quotation', 'Win_probability'): [0, 1], ('LSB_Result_Lesson', 'Price_gap_pct'): [-1, 5]}
RANGE = {('LSB_Project_handover_lesson', 'Customer_feedback'): [1, 5], ('LSB_project', 'RAD_Revision'): [0, 99], ('LSB_payment_plan', 'PP_revision'): [0, 99],
         ('LSB_Task', 'Std_duration_days'): [0, 3650], ('LSB_shipment', 'Shipment_no'): [1, 999], ('LSB_Quotation', 'Revision_no'): [0, 99],
         ('LSB_Quotation', 'Area_m2'): [0, 10000000], ('LSB_Quotation', 'Tonnage'): [0, 1000000]}
URL = {('LSB_Lead', 'Lead_website'), ('LSB_Task', 'Task_SOP'), ('LSB_project', 'URL_Project_data')}
EMAIL = {('LSB_Lead', 'Contact_email'), ('LSB_Staff', 'Email')}
LONG = {'Issue_description', 'Root_cause', 'What_went_well', 'To_improve', 'Action_next_project', 'Required_docs', 'Address', 'Project_address',
        'Value_proposition', 'Strengths', 'Weaknesses', 'Key_competitors', 'Win_theme', 'Approach', 'Next_time_action', 'Scope'}
NOTE_FIX = {('LSB_cost', 'Invoice_code'): 'ngày/mã hóa đơn — hiện là cột ngày, nguồn của Year/Quarter',
 ('LSB_project', 'Quotation_LSB-Code'): 'mã báo giá nội bộ thắng thầu (= LSB_Quotation.Quotation_LSB_Code, Status = Won) — nhập tay',
 ('LSB_Quotation', 'Quotation_LSB_Code'): 'mã báo giá nội bộ LSB, vd 25B561 — dùng để nối với dự án',
 ('LSB_Quotation', 'Value_VND'): 'để trống → tự tính = Value_USD × tỷ giá (APP.FX_USD_VND)',
 ('LSB_project', 'Contract_VND'): 'để trống → tự tính = Contract_USD × tỷ giá (APP.FX_USD_VND)',
 ('LSB_shipment', 'ETA_plan'): 'để trống → tự tính = ETD_plan + số ngày vận chuyển (APP.TRANSIT_DAYS)',
 ('LSB_shipment', 'ETA_actual'): 'để trống → tự tính = ETD_actual + số ngày vận chuyển (APP.TRANSIT_DAYS)',
 ('LSB_project', 'URL_Project_data'): 'link thư mục dữ liệu dự án (Drive / OneDrive)',
 ('LSB_Result_Lesson', 'Project_id'): 'auto tra từ LSB_project theo Quotation_code',
 ('LSB_Quotation', 'Area_m2'): 'diện tích công trình (m²)'}

tables = collections.OrderedDict()
# Chỉ sinh SCHEMA cho các bảng CÓ trong file xlsx (v4.3_Project: 11 bảng; bản gộp: 16 bảng).
skipped = [t for t in META if t not in raw['tables']]
for t, m in META.items():
    if t not in raw['tables']: continue
    cols = []
    for c in raw['tables'][t]:
        k = (t, c['name']); d = collections.OrderedDict(name=c['name'])
        d['type'] = TYPE_FIX.get(k, c['type'])
        if c['fill'] == 'A7650F': d['key'] = 'PK'
        if c['fk']: d['key'] = 'FK'; d['ref'] = c['fk']
        if k in FK_ADD: d['key'] = 'FK'; d.update(FK_ADD[k])
        if c['formula'] and k not in CALC: d['auto'] = True
        if k in CALC: d['calc'] = CALC[k]
        if c['list']: d['list'] = c['list']
        if c['name'] in REQ.get(t, []): d['required'] = True
        if k in UNIQ: d['unique'] = True
        if k in PCT: d['pct'] = True; d['min'], d['max'] = PCT[k]
        if k in RANGE: d['min'], d['max'] = RANGE[k]
        if 'USD' in c['name'] or 'VND' in c['name']: d['money'] = True
        if k in URL: d['format'] = 'url'
        if k in EMAIL: d['format'] = 'email'
        if c['name'] in LONG: d['long'] = True
        note = NOTE_FIX.get(k, dic.get(k, ''))
        if note and not note.startswith('⚠'): d['note'] = note
        cols.append(d)
    assert cols and cols[0].get('key') == 'PK', t
    tables[t] = collections.OrderedDict(label=m['label'], module=m['module'], prefix=m['prefix'], idStyle=m['idStyle'],
                                        pk=cols[0]['name'], display=m['display'], columns=cols)
lists = {k: list(dict.fromkeys(v)) for k, v in raw['lists'].items()}
js = json.dumps(tables, ensure_ascii=False, indent=2)
lj = json.dumps(lists, ensure_ascii=False, indent=2)
tpl = open(os.path.join(HERE, 'config_template.gs')).read()
open(os.path.join(ROOT, 'src', '01_Config.gs'), 'w').write(tpl.replace('/*__SCHEMA__*/{}', js).replace('/*__LISTS__*/{}', lj))
print('01_Config.gs:', len(tables), 'bảng,', sum(len(t['columns']) for t in tables.values()), 'cột', '· bỏ qua (không có trong file):', skipped or 'không')
