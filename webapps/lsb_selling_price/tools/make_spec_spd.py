"""Sinh tools/app_spec.json cho LSB Selling Price DB từ tools/schema_raw.json + các quyết định đã chốt (phỏng vấn 26/10/2026).

Dùng (từ thư mục app):  python3 -I tools/make_spec_spd.py && python3 -I tools/gen_config.py
Muốn đổi quyết định (bắt buộc, menu, nhãn…): sửa file NÀY rồi chạy lại 2 lệnh trên.
"""
import json, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
raw = json.load(open(os.path.join(HERE, 'schema_raw.json')))
O = collections.OrderedDict
T = raw['tables']

# --------------------------------------------------------------- bảng
CATALOGS = ['Staff', 'Markets', 'Items', 'Materials', 'FX_Rates']          # chỉ Admin sửa (đã chốt)
TABLES = O([
    ('Staff', dict(label=['Người dùng app', 'App users'], prefix='ST', w=3, display='full_name', labelCols=['full_name'],
                   listCols=['staff_id', 'full_name', 'email', 'access_level', 'active', 'job_role'], unique=['email'], email=['email'])),
    ('Markets', dict(label=['Thị trường', 'Markets'], prefix='TT', w=2, display='market_name', labelCols=['market_name'],
                     listCols=['market_id', 'market_name', 'scope', 'notes'], long=['scope', 'notes'])),
    ('Customers', dict(label=['Khách hàng', 'Customers'], prefix='CUS', w=4, display='customer_name', labelCols=['customer_name'],
                       listCols=['customer_id', 'customer_name', 'customer_type', 'country'], view360=True, long=['notes'])),
    ('Items', dict(label=['Hạng mục báo giá', 'Quotation items'], prefix='ITM', w=2, display='item_name', labelCols=['item_name', 'unit'],
                   listCols=['item_id', 'item_name', 'unit', 'material_group', 'description'], long=['description', 'notes'])),
    ('Materials', dict(label=['Vật tư', 'Materials'], prefix='MAT', w=4, display='material_name', labelCols=['material_name', 'unit'],
                       listCols=['material_id', 'material_name', 'material_group', 'unit', 'description'], long=['description', 'notes'])),
    ('FX_Rates', dict(label=['Tỷ giá', 'FX rates'], prefix='FX', w=4, display='currency', labelCols=['currency', 'effective_date'],
                      listCols=['fx_id', 'effective_date', 'currency', 'rate', 'source'], dateCol='effective_date', long=['notes'])),
    ('Material_Prices', dict(label=['Bảng giá vật tư', 'Material prices'], prefix='PRC', w=5, display='specification',
                             labelCols=['specification', 'supplier', 'effective_date'], parentFk='material_id', dateCol='effective_date',
                             listCols=['price_id', 'material_id', 'specification', 'effective_date', 'supplier', 'currency', 'unit_price'],
                             long=['price_terms', 'notes'])),
    ('Projects', dict(label=['Dự án', 'Projects'], prefix='PRJ', w=4, display='project_name', labelCols=['project_name'],
                      parentFk='customer_id', dateCol='quote_date', view360=True,
                      listCols=['project_id', 'project_name', 'customer_id', 'market_id', 'quote_date', 'status', 'job_no', 'sell_currency'],
                      long=['notes'])),
    ('Project_Items', dict(label=['Giá hạng mục dự án', 'Project item prices'], prefix='PIT', w=5, display='item_id',
                           labelCols=['project_id', 'item_id', 'stage'], parentFk='project_id',
                           listCols=['line_id', 'project_id', 'item_id', 'stage', 'unit_sell', 'gm_pct'], long=['notes'])),
    ('Project_Freight', dict(label=['Cước vận chuyển', 'Project freight'], prefix='FRT', w=5, display='incoterm',
                             labelCols=['project_id', 'incoterm', 'destination_port'], parentFk='project_id',
                             listCols=['freight_id', 'project_id', 'incoterm', 'destination_port', 'cost_basis', 'currency', 'freight_cost'],
                             long=['site_location', 'notes'])),
    ('Project_Inputs_Bid', dict(label=['Vật tư đầu vào - Bid', 'Material inputs - bid'], prefix='INB', w=5, display='specification',
                                labelCols=['project_id', 'material_id', 'specification'], parentFk='project_id',
                                listCols=['input_id', 'project_id', 'material_id', 'specification', 'currency', 'unit_price', 'spec_check'],
                                long=['notes'])),
    ('Project_Inputs_Job', dict(label=['Vật tư đầu vào - Job', 'Material inputs - job'], prefix='INJ', w=5, display='specification',
                                labelCols=['project_id', 'material_id', 'specification'], parentFk='project_id', dateCol='price_date',
                                listCols=['input_id', 'project_id', 'material_id', 'specification', 'price_date', 'currency', 'unit_price', 'var_vs_bid_pct'],
                                long=['notes'])),
])

# --------------------------------------------------------------- nhãn cột VN / EN
B = 'VND'   # tiền gốc đã chốt (Config!B3)
L = {
    'notes': ['Ghi chú', 'Notes'], 'market_id': ['Thị trường', 'Market'], 'market_name': ['Tên thị trường', 'Market name'],
    'scope': ['Phạm vi', 'Scope / description'], 'customer_id': ['Khách hàng', 'Customer'], 'customer_name': ['Tên khách hàng', 'Customer name'],
    'customer_type': ['Loại khách hàng', 'Customer type'], 'country': ['Quốc gia', 'Country'], 'item_id': ['Hạng mục', 'Item'],
    'item_name': ['Tên hạng mục', 'Item name'], 'unit': ['Đơn vị', 'Unit'], 'material_group': ['Nhóm vật tư', 'Material group'],
    'description': ['Mô tả', 'Description'], 'material_id': ['Vật tư', 'Material'], 'material_name': ['Tên vật tư', 'Material name'],
    'effective_date': ['Ngày hiệu lực', 'Effective date'], 'currency': ['Tiền tệ', 'Currency'], 'base_currency': ['Tiền tệ gốc', 'Base currency'],
    'rate': ['Tỷ giá (1 đơn vị = ? ' + B + ')', 'Rate (1 unit = ? ' + B + ')'], 'source': ['Nguồn', 'Source'], 'fx_id': ['Mã tỷ giá', 'FX row ID'],
    'price_id': ['Dòng giá', 'Price row'], 'specification': ['Quy cách', 'Specification'], 'supplier': ['Nhà cung cấp', 'Supplier'],
    'unit_price': ['Đơn giá (tiền gốc / ĐV)', 'Unit price (original / unit)'], 'fx_rate': ['Tỷ giá', 'FX rate'],
    'unit_price_base': ['Đơn giá (' + B + ' / ĐV)', 'Unit price (' + B + ' / unit)'], 'unit_price_usd': ['Đơn giá (USD / ĐV)', 'Unit price (USD / unit)'],
    'fx_usd': ['Tỷ giá USD', 'FX rate - USD'], 'price_terms': ['Điều kiện giá', 'Price terms'], 'project_id': ['Dự án', 'Project'],
    'project_name': ['Tên dự án', 'Project name'], 'quote_date': ['Ngày báo giá', 'Quotation date'], 'contract_date': ['Ngày ký HĐ', 'Contract date'],
    'status': ['Trạng thái', 'Status'], 'job_no': ['Số Job', 'Job No.'], 'sell_currency': ['Tiền tệ bán', 'Selling currency'],
    'cost_currency': ['Tiền tệ chi phí', 'Cost currency'], 'fx_date': ['Ngày tỷ giá', 'FX date'], 'fx_sell': ['Tỷ giá bán', 'FX rate - selling'],
    'fx_cost': ['Tỷ giá chi phí', 'FX rate - cost'], 'item_rows': ['Số dòng hạng mục', 'Item rows'], 'gm_pct_bid': ['GM% TB - Bid', 'Avg GM% - bid'],
    'gm_pct_job': ['GM% TB - Job', 'Avg GM% - job'], 'freight_rows': ['Số dòng cước', 'Freight rows'], 'owner': ['Người phụ trách', 'Person in charge'],
    'data_check': ['Kiểm tra dữ liệu', 'Data check'], 'line_id': ['Mã dòng', 'Row ID'], 'freight_id': ['Mã dòng', 'Row ID'], 'input_id': ['Mã dòng', 'Row ID'],
    'stage': ['Giai đoạn', 'Stage'], 'cost_material': ['CP vật tư (/ĐV)', 'Material cost (/unit)'], 'cost_fabrication': ['CP gia công (/ĐV)', 'Fabrication cost (/unit)'],
    'cost_erection': ['CP lắp dựng (/ĐV)', 'Erection cost (/unit)'], 'cost_other': ['CP khác (/ĐV)', 'Other cost (/unit)'],
    'unit_cost': ['Giá vốn (tiền chi phí / ĐV)', 'Unit cost (cost currency / unit)'], 'unit_sell': ['Giá bán (tiền bán / ĐV)', 'Unit selling price (selling currency / unit)'],
    'unit_sell_base': ['Giá bán (' + B + ' / ĐV)', 'Unit selling price (' + B + ' / unit)'], 'unit_cost_base': ['Giá vốn (' + B + ' / ĐV)', 'Unit cost (' + B + ' / unit)'],
    'gm_unit': ['Lãi gộp (' + B + ' / ĐV)', 'Gross margin (' + B + ' / unit)'], 'gm_pct': ['Lãi gộp %', 'Gross margin %'],
    'unit_sell_usd': ['Giá bán (USD / ĐV)', 'Unit selling price (USD / unit)'], 'unit_cost_usd': ['Giá vốn (USD / ĐV)', 'Unit cost (USD / unit)'],
    'gm_unit_usd': ['Lãi gộp (USD / ĐV)', 'Gross margin (USD / unit)'], 'incoterm': ['Incoterm', 'Incoterm'], 'destination_port': ['Cảng đích', 'Destination port'],
    'site_location': ['Địa điểm công trình', 'Site location'], 'cost_basis': ['Đơn vị tính cước', 'Freight cost basis'],
    'freight_cost': ['Cước (tiền gốc / đơn vị tính)', 'Freight cost (original / basis)'], 'freight_cost_base': ['Cước (' + B + ' / đơn vị tính)', 'Freight cost (' + B + ' / basis)'],
    'freight_cost_usd': ['Cước (USD / đơn vị tính)', 'Freight cost (USD / basis)'], 'ref_specification': ['Quy cách dòng giá tham chiếu', 'Spec of reference price row'],
    'spec_check': ['Kiểm tra quy cách', 'Spec check'], 'list_price_base': ['Giá bảng giá (' + B + ' / ĐV)', 'Price-list price (' + B + ' / unit)'],
    'list_price_usd': ['Giá bảng giá (USD / ĐV)', 'Price-list price (USD / unit)'], 'var_vs_list_pct': ['Chênh so bảng giá %', 'Variance vs price list %'],
    'price_date': ['Ngày giá thực tế', 'Actual price date'], 'bid_unit_price_base': ['Đơn giá Bid (' + B + ' / ĐV)', 'Bid unit price (' + B + ' / unit)'],
    'bid_unit_price_usd': ['Đơn giá Bid (USD / ĐV)', 'Bid unit price (USD / unit)'], 'var_vs_bid_pct': ['Chênh so Bid %', 'Variance vs bid %'],
    'staff_id': ['Mã nhân sự', 'Staff ID'], 'full_name': ['Họ tên', 'Full name'], 'email': ['Email Google', 'Google email'],
    'access_level': ['Quyền app', 'App access'], 'active': ['Đang hoạt động', 'Active'], 'job_role': ['Vai trò công việc', 'Job role'],
}
L_TABLE = {
    'Items.unit': ['Đơn vị tính giá', 'Price unit'], 'Items.description': ['Phạm vi hạng mục', 'Scope description'],
    'Material_Prices.price_id': ['Mã dòng giá', 'Price row ID'], 'Markets.market_id': ['Mã thị trường', 'Market ID'],
    'Customers.customer_id': ['Mã khách hàng', 'Customer ID'], 'Items.item_id': ['Mã hạng mục', 'Item ID'], 'Materials.material_id': ['Mã vật tư', 'Material ID'],
    'Projects.project_id': ['Mã dự án', 'Project ID'], 'Project_Inputs_Bid.price_id': ['Dòng giá tham chiếu', 'Reference price row'],
    'Project_Inputs_Job.price_id': ['Dòng giá tham chiếu', 'Reference price row'], 'Project_Inputs_Bid.specification': ['Quy cách áp dụng', 'Applied specification'],
    'Project_Inputs_Job.specification': ['Quy cách áp dụng', 'Applied specification'], 'Project_Inputs_Bid.unit_price': ['Đơn giá Bid (tiền gốc / ĐV)', 'Bid unit price (original / unit)'],
    'Project_Inputs_Job.unit_price': ['Đơn giá thực tế (tiền gốc / ĐV)', 'Actual unit price (original / unit)'],
    'Project_Inputs_Bid.unit_price_base': ['Đơn giá Bid (' + B + ' / ĐV)', 'Bid unit price (' + B + ' / unit)'],
    'Project_Inputs_Bid.unit_price_usd': ['Đơn giá Bid (USD / ĐV)', 'Bid unit price (USD / unit)'],
    'Project_Inputs_Job.unit_price_base': ['Đơn giá thực tế (' + B + ' / ĐV)', 'Actual unit price (' + B + ' / unit)'],
    'Project_Inputs_Job.unit_price_usd': ['Đơn giá thực tế (USD / ĐV)', 'Actual unit price (USD / unit)'],
    'Project_Freight.fx_rate': ['Tỷ giá (ngày tỷ giá dự án)', 'FX rate (project FX date)'], 'Project_Inputs_Job.supplier': ['Nhà cung cấp thực tế', 'Actual supplier'],
}
# ghi chú VN cho cột nhập tay cần giải thích (EN lấy từ DataDictionary)
NOTE_VI = {
    'Items.unit': 'Đơn vị của đơn giá — mỗi hạng mục 1 đơn vị cho mọi dự án để giá so sánh được.',
    'Items.material_group': 'Nhóm vật tư mà hạng mục đại diện (dùng cho tổng hợp theo nhóm vật tư).',
    'Materials.description': 'Mô tả chung. Quy cách chi tiết quyết định giá nhập ở Bảng giá vật tư.',
    'FX_Rates.effective_date': 'Tỷ giá áp dụng từ ngày này tới khi có dòng mới hơn. Ngày + tiền tệ không được trùng.',
    'FX_Rates.currency': 'Tiền tệ cần quy đổi (khác tiền gốc ' + B + '). Cần có dòng USD để tính các cột USD.',
    'FX_Rates.rate': 'Ví dụ 1 USD = 26.000 VND → nhập 26000.',
    'Material_Prices.specification': 'Quy cách quyết định giá (mác thép, độ dày, tiêu chuẩn, lớp phủ…). Mỗi quy cách là 1 dòng giá riêng.',
    'Material_Prices.effective_date': 'Ngày giá bắt đầu áp dụng (dùng tra tỷ giá của dòng).',
    'Material_Prices.price_terms': 'Điều kiện giao hàng, VAT, thanh toán…',
    'Projects.quote_date': 'Ngày phát hành báo giá — dùng lọc theo kỳ trong các trang phân tích.',
    'Projects.contract_date': 'Để trống nếu chưa ký.',
    'Projects.job_no': 'Số Job nội bộ khi dự án thành Job; để trống khi còn báo giá.',
    'Projects.sell_currency': 'Tiền tệ của giá bán hạng mục.',
    'Projects.cost_currency': 'Tiền tệ dùng nhập chi phí hạng mục.',
    'Projects.fx_date': 'Ngày dùng tra tỷ giá bán, chi phí và USD của dự án.',
    'Projects.owner': 'Người lập / chịu trách nhiệm báo giá.',
    'Project_Items.stage': 'Bid hoặc Job. Một dự án có thể có cả dòng Bid và Job cho cùng hạng mục.',
    'Project_Items.cost_material': 'Theo tiền tệ chi phí của dự án.',
    'Project_Items.cost_other': 'Giải thích ở Ghi chú. Không nhập cước ở đây (nhập ở Cước vận chuyển).',
    'Project_Items.unit_sell': 'Theo tiền tệ bán của dự án.',
    'Project_Freight.incoterm': 'Điều kiện giao hàng tương ứng với cước này.',
    'Project_Freight.cost_basis': 'Cước ở cột kế tiếp tính theo đơn vị nào (container, chuyến…).',
    'Project_Inputs_Bid.specification': 'Viết giống hệt ở Bid và Job để so sánh được.',
    'Project_Inputs_Job.specification': 'Viết giống hệt ở Bid và Job để so sánh được.',
    'Project_Inputs_Bid.price_id': 'Dòng bảng giá dùng so sánh (tùy chọn) — danh sách lọc theo vật tư đã chọn.',
    'Project_Inputs_Job.price_id': 'Dòng bảng giá dùng so sánh (tùy chọn) — danh sách lọc theo vật tư đã chọn.',
    'Project_Inputs_Job.price_date': 'Ngày chốt / mua giá thực tế — dùng tra tỷ giá của dòng.',
    'Staff.email': 'Tài khoản Google dùng mở Web App.',
    'Staff.access_level': 'Viewer: xem · Editor: thêm/sửa · Admin: + xóa, danh mục, người dùng.',
}

spec_tables = O()
labels = O(); notes_en = O()
for n, m in TABLES.items():
    t = T[n]
    cols = [c['name'] for c in t['columns']]
    req = [c['name'] for c in t['columns'] if c['required'] and not c['pk']]
    spec_tables[n] = O(label=m['label'], prefix=m['prefix'], idStyle='seq', idWidth=m['w'], display=m['display'],
                       labelCols=m['labelCols'], listCols=m['listCols'], parentFk=m.get('parentFk', ''), groupCol='',
                       dateCol=m.get('dateCol', ''), view360=m.get('view360', False), required=req, need=[],
                       unique=m.get('unique', []), pct={}, range={}, url=[], email=m.get('email', []), long=m.get('long', []),
                       money=[], calc={}, types={}, fk={}, soft=[],
                       notes=O((c, NOTE_VI[n + '.' + c]) for c in cols if (n + '.' + c) in NOTE_VI))
    for c in t['columns']:
        k = n + '.' + c['name']
        if k in L_TABLE: labels[k] = L_TABLE[k]
        if k in NOTE_VI: notes_en[k] = c.get('desc') or c['label']
for k, v in L.items(): labels[k] = v

spec = O(
    app=O(name='LSB Selling Price DB', brand='LSB Selling Price DB', subtitle=['Giá bán theo dự án', 'Project selling prices'],
          version='1.0.0', schemaVersion='Selling_Price_Database_R05_EN', menuTitle='LSB Price App', timezone='Asia/Ho_Chi_Minh',
          alertDays=7, consts=O(), spreadsheetId='', logSheet='Activity_log'),
    features=O(AUTH=True, ACTIVITY=True, ALERTS=True, VIEW360=True),
    staff=O(table='Staff', id='staff_id', email='email', name='full_name', access='access_level', active='active', role='job_role'),
    catalogs=CATALOGS,
    tables=spec_tables,
    menu=[
        O(group=['Phân tích', 'Analysis'], items=[O(route='price_lookup', label=['Tra cứu giá tham khảo', 'Price reference'], icon='⌕'),
                                                  O(route='price_summary', label=['Tổng hợp', 'Summaries'], icon='▤'),
                                                  O(route='bid_job', label=['Bid vs Job', 'Bid vs Job'], icon='⇄')]),
        O(group=['Dự án', 'Projects'], items=[O(table='Projects', icon='◧'), O(table='Project_Items', icon='▪'), O(table='Project_Freight', icon='⛴'),
                                              O(table='Project_Inputs_Bid', icon='▫'), O(table='Project_Inputs_Job', icon='▫')]),
        O(group=['Giá & tỷ giá', 'Prices & FX'], items=[O(table='Material_Prices', icon='₫'), O(table='FX_Rates', icon='⇆')]),
        O(group=['Danh mục', 'Masters'], items=[O(table='Customers', icon='☺'), O(table='Markets', icon='◎'), O(table='Items', icon='▦'),
                                                O(table='Materials', icon='▣'), O(route='lists', label=['Danh sách chọn (Config)', 'Dropdown lists (Config)'], icon='☰'),
                                                O(table='Staff', icon='⚿')]),
    ],
    dateOrder=[], alerts=[],
    dashboard=O(kpiTables=['Projects', 'Project_Items', 'Project_Inputs_Bid', 'Project_Inputs_Job', 'Project_Freight', 'Material_Prices', 'Customers', 'FX_Rates'],
                metrics=[O(label=['Dự án báo giá', 'Projects quoted'], table='Projects', date='quote_date', sum='', where=O()),
                         O(label=['— đang Won', '— now Won'], table='Projects', date='quote_date', sum='', where=O(status='Won')),
                         O(label=['— Completed', '— Completed'], table='Projects', date='quote_date', sum='', where=O(status='Completed')),
                         O(label=['— Lost', '— Lost'], table='Projects', date='quote_date', sum='', where=O(status='Lost'))],
                providers=[]),
    needExtra=O(), autoUser=O(), defaults=O(),
    providers=O(init=['Spd_init_'], hooks=['Spd_hooks_'], routes=['Spd_routes_'], related=[], extra360=[], alerts=['Spd_alerts_'], checks=['Spd_checks_']),
    labels=O(columns=labels, notesEn=notes_en))
json.dump(spec, open(os.path.join(HERE, 'app_spec.json'), 'w'), ensure_ascii=False, indent=1)
print('tools/app_spec.json: %d bảng, %d nhãn cột' % (len(spec_tables), len(labels)))
