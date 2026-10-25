"""Sinh tools/app_spec.json cho LSB Cost Input từ tools/schema_raw.json (extract_cost.py) + quyết định đã chốt (25/10/2026).
Nhãn EN lấy từ DataDictionary (dòng 3 của sheet); nhãn + ghi chú tiếng Việt khai báo ở đây.
Dùng: python3 -I tools/spec_cost.py && python3 -I tools/gen_config.py
"""
import json, os, collections
HERE = os.path.dirname(os.path.abspath(__file__))
raw = json.load(open(os.path.join(HERE, 'schema_raw.json')))
T = raw['tables']
O = collections.OrderedDict

MAT = [n for n in T if n.startswith('Mat_')]
PROD = [n for n in T if n.startswith('Prod_')]
TRANS = [n for n in T if n.startswith('Trans_')]
TABLE_LABEL = {
    'Suppliers': ['Nhà cung cấp', 'Suppliers'], 'Ports': ['Cảng', 'Ports'], 'Processes': ['Công đoạn', 'Processes'],
    'FX_Rates': ['Tỷ giá', 'FX rates'], 'Staff': ['Người dùng app', 'App users'],
    'Mat_SteelPlate': ['Thép tấm', 'Steel plate'], 'Mat_SteelSections': ['Thép hình', 'Steel sections'], 'Mat_SteelSheeting': ['Tôn', 'Steel sheeting'],
    'Mat_AnchorBolts': ['Bu lông neo', 'Anchor bolts'], 'Mat_Paint': ['Sơn', 'Paint'], 'Mat_CF_Purlins': ['Xà gồ cán nguội', 'Cold-formed purlins'],
    'Mat_RodBracing': ['Giằng thanh', 'Rod bracing'], 'Mat_Insulation': ['Bông cách nhiệt', 'Insulation'], 'Mat_CF_Bracing': ['Giằng cán nguội', 'Cold-formed bracing'],
    'Mat_ConnBolts': ['Bu lông liên kết', 'Connection bolts'], 'Mat_CableBracing': ['Giằng cáp', 'Cable bracing'], 'Mat_Accessories': ['Phụ kiện', 'Accessories'],
    'Prod_Process_Rates': ['Đơn giá công đoạn (tự làm)', 'In-house process rates'], 'Prod_Subcontract': ['Giá thuê ngoài', 'Subcontract prices'],
    'Prod_Capacity': ['Năng lực sản xuất', 'Production capacity'], 'Trans_Sea': ['Cước biển', 'Sea freight'],
    'Trans_Inland_Origin': ['Nội địa đầu đi', 'Inland – origin'], 'Trans_Inland_Dest': ['Nội địa đầu đến', 'Inland – destination'],
    'Trans_Local_Charges': ['Phí địa phương', 'Local charges'],
}
# Nhãn tiếng Việt theo mã cột (EN lấy từ DataDictionary)
VI = {
    'supplier_id': 'Mã NCC', 'supplier_name': 'Tên NCC', 'supplier_type': 'Loại NCC', 'country': 'Quốc gia', 'contact': 'Liên hệ', 'notes': 'Ghi chú',
    'port_code': 'Mã cảng', 'port_name': 'Tên cảng', 'market_id': 'Mã thị trường (Part 1)', 'process_id': 'Mã công đoạn', 'process_name': 'Tên công đoạn',
    'description': 'Mô tả', 'effective_date': 'Ngày hiệu lực', 'currency': 'Tiền tệ', 'base_currency': 'Tiền gốc', 'rate': 'Tỷ giá',
    'source': 'Nguồn', 'fx_id': 'Mã tỷ giá', 'record_id': 'Mã dòng', 'valid_until': 'Hiệu lực đến', 'validity_status': 'Tình trạng hiệu lực',
    'material_group': 'Nhóm vật tư', 'material_id': 'Mã vật tư (Part 1)', 'spec_grade': 'Spec: Mác / cấp bền', 'spec_standard': 'Spec: Tiêu chuẩn',
    'spec_thickness_mm': 'Spec: Dày (mm)', 'spec_width_mm': 'Spec: Rộng (mm)', 'spec_length_mm': 'Spec: Dài (mm)', 'origin_country': 'Xuất xứ',
    'unit': 'Đơn vị tính', 'unit_price': 'Đơn giá (nguyên tệ / ĐVT)', 'fx_rate': 'Tỷ giá áp dụng', 'unit_price_base': 'Đơn giá (tiền gốc / ĐVT)',
    'incoterm': 'Điều kiện giá (Incoterm)', 'delivery_place': 'Nơi giao', 'moq': 'SL đặt tối thiểu', 'lead_time_days': 'Thời gian giao (ngày)',
    'payment_terms': 'Điều khoản thanh toán', 'quotation_ref': 'Số báo giá / chứng từ', 'doc1_type': 'Tệp 1 – loại', 'doc1_url': 'Tệp 1 – link',
    'doc1_open': 'Tệp 1 – mở', 'doc2_type': 'Tệp 2 – loại', 'doc2_url': 'Tệp 2 – link', 'doc2_open': 'Tệp 2 – mở',
    'spec_section_type': 'Spec: Loại tiết diện', 'spec_section_size': 'Spec: Kích thước tiết diện', 'spec_length_m': 'Spec: Dài (m)',
    'spec_base_grade': 'Spec: Mác thép nền', 'spec_coating': 'Spec: Lớp mạ', 'spec_paint_color': 'Spec: Hệ sơn / màu', 'spec_coil_width_mm': 'Spec: Khổ cuộn (mm)',
    'spec_diameter': 'Spec: Đường kính', 'spec_finish': 'Spec: Bề mặt', 'spec_paint_type': 'Spec: Loại sơn / lớp', 'spec_product': 'Spec: Hãng / sản phẩm',
    'spec_color': 'Spec: Màu', 'spec_volume_solids_pct': 'Spec: Hàm lượng rắn (%)', 'spec_pack_size': 'Spec: Quy cách đóng gói', 'spec_profile': 'Spec: Biên dạng',
    'spec_diameter_mm': 'Spec: Đường kính (mm)', 'spec_material_type': 'Spec: Vật liệu cách nhiệt', 'spec_density_kg_m3': 'Spec: Tỷ trọng (kg/m³)',
    'spec_facing': 'Spec: Lớp phủ mặt', 'spec_roll_size': 'Spec: Kích thước cuộn / tấm', 'spec_construction': 'Spec: Cấu tạo cáp',
    'spec_fittings': 'Spec: Kèm phụ kiện đầu', 'spec_accessory_type': 'Spec: Loại phụ kiện', 'spec_size': 'Spec: Kích thước', 'spec_material': 'Spec: Vật liệu',
    'factory': 'Nhà máy', 'product_type': 'Loại sản phẩm', 'item_id': 'Mã hạng mục (Part 1)', 'cost_labor': 'Nhân công (nguyên tệ / ĐVT)',
    'cost_machine': 'Máy (nguyên tệ / ĐVT)', 'cost_consumables': 'Vật tư tiêu hao (nguyên tệ / ĐVT)', 'cost_overhead': 'Chi phí chung (nguyên tệ / ĐVT)',
    'unit_rate': 'Đơn giá công đoạn (nguyên tệ / ĐVT)', 'unit_rate_base': 'Đơn giá công đoạn (tiền gốc / ĐVT)', 'labor_share': 'Tỷ trọng nhân công',
    'machine_share': 'Tỷ trọng máy', 'consumables_share': 'Tỷ trọng tiêu hao', 'overhead_share': 'Tỷ trọng chi phí chung', 'scope': 'Phạm vi công việc',
    'material_supplied_by': 'Bên cấp vật tư chính', 'capacity_qty': 'Năng lực (ĐVT / kỳ)', 'capacity_period': 'Kỳ năng lực',
    'manhours_per_unit': 'Giờ công / ĐVT', 'machinehours_per_unit': 'Giờ máy / ĐVT', 'pol': 'Cảng xếp (POL)', 'pol_name': 'Tên cảng xếp',
    'pod': 'Cảng dỡ (POD)', 'pod_name': 'Tên cảng dỡ', 'cargo_type': 'Loại container / hàng', 'rate_basis': 'Cách tính',
    'ocean_freight': 'Cước biển (nguyên tệ)', 'surcharges': 'Phụ phí (nguyên tệ)', 'total_rate': 'Tổng cước (nguyên tệ)',
    'total_rate_base': 'Tổng cước (tiền gốc)', 'transit_days': 'Thời gian vận chuyển (ngày)', 'free_time_days': 'Ngày miễn phí tại đích',
    'service': 'Dịch vụ / tuyến', 'from_place': 'Từ (nhà máy / nơi đi)', 'destination_type': 'Loại điểm đến', 'to_port': 'Đến cảng (mã)',
    'to_port_name': 'Tên cảng đến', 'to_site': 'Đến công trình', 'vehicle_type': 'Loại xe', 'distance_km': 'Quãng đường (km)',
    'rate_base': 'Cước (tiền gốc)', 'includes': 'Giá đã gồm', 'from_port': 'Từ cảng (mã)', 'from_port_name': 'Tên cảng đi',
    'side': 'Phía', 'port': 'Mã cảng', 'charge_type': 'Loại phí', 'amount': 'Số tiền (nguyên tệ)', 'percent_rate': 'Tỷ lệ (%)',
    'amount_base': 'Số tiền (tiền gốc)', 'staff_id': 'Mã người dùng', 'full_name': 'Họ tên', 'email': 'Email (tài khoản Google)',
    'access_level': 'Quyền', 'active': 'Đang hoạt động (Y/N)',
}
# Nhãn khác nhau theo bảng: 'Bảng.cột' → VI (EN lấy từ DataDictionary của bảng đó)
VI_T = {
    'Prod_Subcontract.supplier_id': 'Mã nhà thầu phụ', 'Trans_Sea.supplier_id': 'Mã hãng tàu / FWD', 'Trans_Inland_Origin.supplier_id': 'Mã nhà xe',
    'Trans_Inland_Dest.supplier_id': 'Mã nhà xe', 'Trans_Local_Charges.supplier_id': 'Mã đơn vị dịch vụ',
    'FX_Rates.rate': 'Tỷ giá (1 nguyên tệ = ? tiền gốc)', 'Trans_Inland_Origin.rate': 'Cước (nguyên tệ)', 'Trans_Inland_Dest.rate': 'Cước (nguyên tệ)',
    'FX_Rates.source': 'Nguồn tỷ giá', 'Mat_CableBracing.spec_grade': 'Spec: Cấp bền / tải đứt', 'Mat_SteelSheeting.spec_coating': 'Spec: Lớp mạ kim loại',
    'Prod_Capacity.effective_date': 'Áp dụng từ ngày', 'Trans_Inland_Dest.country': 'Nước nhập khẩu',
}
NOTE_VI = {
    'Unique supplier code': 'Mã NCC duy nhất (app tự cấp SUP-xxxx)', 'Full supplier name': 'Tên đầy đủ của NCC',
    'Pick from Config > Supplier type': 'Chọn từ Config › Supplier type', 'Supplier country': 'Quốc gia của NCC',
    'Contact person / email / phone': 'Người liên hệ / email / điện thoại', 'Notes': 'Ghi chú',
    'Unique port code (your own code or UN/LOCODE)': 'Mã cảng duy nhất (mã nội bộ hoặc UN/LOCODE)', 'Port name': 'Tên cảng',
    'Country of the port': 'Quốc gia của cảng', 'Optional link to the Markets master of the Part 1 database': 'Tùy chọn: mã thị trường ở database Part 1',
    'Unique process code': 'Mã công đoạn duy nhất', 'Production process / work step': 'Công đoạn / bước sản xuất', 'What the process covers': 'Nội dung công đoạn',
    'Rate applies from this date until a newer row exists': 'Tỷ giá áp dụng từ ngày này tới khi có dòng mới hơn',
    'Currency to convert (other than the base currency)': 'Tiền tệ cần quy đổi (khác tiền gốc)', 'From Config base currency': 'Lấy từ tiền gốc ở Config',
    'Example: if 1 USD = 26,000 VND enter 26000': 'Ví dụ: 1 USD = 26.000 VND thì nhập 26000', 'Bank / published source': 'Ngân hàng / nguồn công bố',
    'Unique code of the rate row (FX-00001), given by the web app; date + currency must still be unique (R03)': 'Mã dòng tỷ giá (FX-00001) do app cấp; ngày + tiền tệ vẫn không được trùng',
    'Unique code of the row': 'Mã dòng duy nhất (app tự cấp)',
    'Date of the quotation or the date the price starts to apply; also used to look up the FX rate': 'Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá',
    'Last day the price is valid; blank if open-ended': 'Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn',
    "Valid / Expired against today's date; blank when no end date": 'Valid / Expired so với hôm nay; trống khi không có ngày hết hạn',
    'Material supplier. Pick from Suppliers': 'NCC vật tư — chọn từ Nhà cung cấp', 'Looked up from Suppliers': 'Tra từ Nhà cung cấp',
    'Fixed for this sheet': 'Cố định theo sheet', 'Optional link to the Materials master of the Part 1 database': 'Tùy chọn: mã vật tư ở database Part 1',
    'Short description of the quoted material': 'Mô tả ngắn vật tư được báo giá',
    'Group-specific specification attribute that drives the price': 'Thông số riêng của nhóm, quyết định giá',
    'Where the material is produced': 'Nơi sản xuất vật tư', 'Unit of the unit price. Pick from Config > Unit': 'ĐVT của đơn giá — chọn từ Config › Unit',
    'Currency of the price. Pick from Config > Currency': 'Tiền tệ của giá — chọn từ Config › Currency',
    'Quoted unit price in its original currency per unit': 'Đơn giá báo theo nguyên tệ / ĐVT',
    'Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency': 'Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1',
    'Price x FX rate': 'Giá × tỷ giá', 'Delivery term of the quoted price. Pick from Config > Incoterm': 'Điều kiện giao của giá — chọn từ Config › Incoterm',
    'Named place of the price term (supplier warehouse, port, our factory...)': 'Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)',
    'Minimum order quantity, in the price unit': 'Số lượng đặt tối thiểu, theo ĐVT của giá', 'Supplier delivery lead time in days': 'Thời gian NCC giao hàng (ngày)',
    'Payment terms of the quotation': 'Điều khoản thanh toán của báo giá', 'Quotation number / supporting document': 'Số báo giá / chứng từ',
    'Kind of document. Pick from Config > Document type': 'Loại tài liệu — chọn từ Config › Document type',
    'Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link':
        'Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)',
    'Click to open the link in column to the left': 'Bấm để mở link ở cột bên trái', 'Pick from Config > Factory / plant': 'Chọn từ Config › Factory / plant',
    'Pick from Processes': 'Chọn từ Công đoạn', 'Looked up from Processes': 'Tra từ Công đoạn',
    'Product / member type the figures apply to': 'Loại sản phẩm / cấu kiện áp dụng số liệu', 'Optional link to the Items master of the Part 1 database': 'Tùy chọn: mã hạng mục ở database Part 1',
    'Unit of the rate. Pick from Config > Unit': 'ĐVT của đơn giá — chọn từ Config › Unit', 'Currency of the rate. Pick from Config > Currency': 'Tiền tệ — chọn từ Config › Currency',
    'Direct labor cost per unit': 'Chi phí nhân công trực tiếp / ĐVT', 'Machine / equipment cost per unit (depreciation, energy, maintenance)': 'Chi phí máy / thiết bị / ĐVT (khấu hao, năng lượng, bảo trì)',
    'Consumables per unit (gas, wire, abrasive...)': 'Vật tư tiêu hao / ĐVT (khí, dây hàn, hạt mài…)', 'Factory overhead per unit': 'Chi phí chung nhà máy / ĐVT',
    'Labor + Machine + Consumables + Overhead': 'Nhân công + Máy + Tiêu hao + Chi phí chung', 'Labor / unit rate': 'Nhân công / đơn giá',
    'Machine / unit rate': 'Máy / đơn giá', 'Consumables / unit rate': 'Tiêu hao / đơn giá', 'Overhead / unit rate': 'Chi phí chung / đơn giá',
    'Where the rate comes from (costing study, budget, finance...)': 'Nguồn số liệu (tính giá thành, ngân sách, tài chính…)',
    'Subcontractor. Pick from Suppliers': 'Nhà thầu phụ — chọn từ Nhà cung cấp', 'What the subcontract price includes / excludes': 'Giá thuê ngoài gồm / không gồm gì',
    'Who supplies the main material (us / subcontractor)': 'Ai cấp vật tư chính (mình / nhà thầu phụ)',
    'Subcontractor unit price in its original currency per unit': 'Đơn giá nhà thầu phụ theo nguyên tệ / ĐVT', 'Minimum quantity, in the price unit': 'Số lượng tối thiểu, theo ĐVT của giá',
    'Subcontractor lead time in days': 'Thời gian thực hiện của nhà thầu phụ (ngày)', 'Date the figures apply from': 'Số liệu áp dụng từ ngày',
    'Unit used for capacity and per-unit hours. Pick from Config > Unit': 'ĐVT cho năng lực và giờ / ĐVT — chọn từ Config › Unit',
    'Output capacity per period': 'Sản lượng tối đa mỗi kỳ', 'Pick from Config > Capacity period': 'Chọn từ Config › Capacity period',
    'Standard labor hours per unit': 'Giờ công định mức / ĐVT', 'Standard machine hours per unit': 'Giờ máy định mức / ĐVT',
    'Standard production lead time for this process in days': 'Thời gian sản xuất định mức của công đoạn (ngày)', 'Where the figures come from': 'Nguồn số liệu',
    'Carrier or forwarder. Pick from Suppliers': 'Hãng tàu hoặc forwarder — chọn từ Nhà cung cấp', 'Port of loading. Pick from Ports': 'Cảng xếp hàng — chọn từ Cảng',
    'Looked up from Ports': 'Tra từ Cảng', 'Port of discharge. Pick from Ports': 'Cảng dỡ hàng — chọn từ Cảng',
    'Pick from Config > Container / cargo type': 'Chọn từ Config › Container / cargo type',
    'What the amount is charged per. Pick from Config > Rate basis': 'Số tiền tính theo đơn vị nào — chọn từ Config › Rate basis',
    'Base ocean freight per rate basis': 'Cước biển cơ bản theo cách tính', 'Carrier surcharges per rate basis (bunker, peak season...), if quoted separately': 'Phụ phí hãng tàu (BAF, mùa cao điểm…) nếu báo riêng',
    'Ocean freight + Surcharges': 'Cước biển + phụ phí', 'Port-to-port transit time in days': 'Thời gian cảng tới cảng (ngày)',
    'Free demurrage / detention days at destination': 'Số ngày miễn phí lưu cont / lưu bãi tại đích', 'Direct or transshipment, routing': 'Đi thẳng hay chuyển tải, tuyến',
    'Trucking company. Pick from Suppliers': 'Nhà xe — chọn từ Nhà cung cấp', 'Loading place': 'Nơi lấy hàng',
    'Port or Site. Pick from Config > Destination type': 'Cảng hoặc công trình — chọn từ Config › Destination type',
    'Destination port when the destination type is Port. Pick from Ports': 'Cảng đến khi loại điểm đến là Port — chọn từ Cảng',
    'Site address / city when the destination type is Site': 'Địa chỉ / thành phố công trình khi loại điểm đến là Site', 'Pick from Config > Vehicle type': 'Chọn từ Config › Vehicle type',
    'Route distance in km': 'Quãng đường (km)', 'Inland transport rate per rate basis': 'Cước vận chuyển nội địa theo cách tính',
    'Door-to-door transit time in days': 'Thời gian vận chuyển tận nơi (ngày)', 'What is included (loading, unloading, tolls, permits, escort...)': 'Giá đã gồm (bốc xếp, phí đường, giấy phép, dẫn đường…)',
    'Destination port where the cargo is picked up. Pick from Ports': 'Cảng đích nơi nhận hàng — chọn từ Cảng', 'Importing country': 'Nước nhập khẩu',
    'Site address / city': 'Địa chỉ / thành phố công trình', 'Forwarder, carrier or customs broker. Pick from Suppliers': 'Forwarder, hãng tàu hoặc đại lý hải quan — chọn từ Nhà cung cấp',
    'Origin or Destination. Pick from Config > Charge side': 'Đầu đi hoặc đầu đến — chọn từ Config › Charge side', 'Port where the charge applies. Pick from Ports': 'Cảng phát sinh phí — chọn từ Cảng',
    'Pick from Config > Local charge type': 'Chọn từ Config › Local charge type',
    'Charge amount per rate basis; leave blank when the charge is a percentage': 'Số tiền theo cách tính; để trống nếu phí tính theo %',
    'Only for charges quoted as a percentage (e.g. insurance, duty): enter 0.5 for 0.5%': 'Chỉ cho phí tính theo % (bảo hiểm, thuế…): nhập 0.5 nghĩa là 0,5%',
    'Unique user code (STF-001), given by the web app (R03)': 'Mã người dùng (STF-001) do app cấp', 'Name shown in the web app and the change log': 'Tên hiện trong app và nhật ký',
    'Google account used to open the web app': 'Tài khoản Google dùng để mở app',
    'Viewer = read only; Editor = enter quotations, suppliers, ports, processes; Admin = also FX rates, Config lists, users, delete':
        'Viewer = chỉ xem; Editor = nhập báo giá, NCC, cảng, công đoạn; Admin = thêm tỷ giá, danh sách Config, người dùng, xóa',
    'N = account suspended': 'N = tạm khóa tài khoản',
}

# ----------------------------------------------------------------- bảng
def cols(n): return [c['name'] for c in T[n]['columns']]
def specs(n): return [c for c in cols(n) if c.startswith('spec_')]
LIST_COLS = {
    'Suppliers': ['supplier_id', 'supplier_name', 'supplier_type', 'country', 'contact'],
    'Ports': ['port_code', 'port_name', 'country', 'market_id'],
    'Processes': ['process_id', 'process_name', 'description'],
    'FX_Rates': ['fx_id', 'effective_date', 'currency', 'rate', 'base_currency', 'source'],
    'Prod_Process_Rates': ['record_id', 'effective_date', 'validity_status', 'factory', 'process_id', 'product_type', 'unit', 'currency', 'unit_rate', 'unit_rate_base'],
    'Prod_Subcontract': ['record_id', 'effective_date', 'validity_status', 'supplier_id', 'process_id', 'product_type', 'unit', 'currency', 'unit_price', 'unit_price_base'],
    'Prod_Capacity': ['record_id', 'effective_date', 'factory', 'process_id', 'product_type', 'unit', 'capacity_qty', 'capacity_period', 'lead_time_days'],
    'Trans_Sea': ['record_id', 'effective_date', 'validity_status', 'supplier_id', 'pol', 'pod', 'cargo_type', 'rate_basis', 'currency', 'total_rate', 'total_rate_base', 'transit_days'],
    'Trans_Inland_Origin': ['record_id', 'effective_date', 'validity_status', 'supplier_id', 'from_place', 'destination_type', 'to_port', 'to_site', 'vehicle_type', 'rate_basis', 'currency', 'rate', 'rate_base'],
    'Trans_Inland_Dest': ['record_id', 'effective_date', 'validity_status', 'supplier_id', 'from_port', 'country', 'to_site', 'vehicle_type', 'rate_basis', 'currency', 'rate', 'rate_base'],
    'Trans_Local_Charges': ['record_id', 'effective_date', 'validity_status', 'supplier_id', 'side', 'port', 'charge_type', 'cargo_type', 'rate_basis', 'currency', 'amount', 'percent_rate', 'amount_base'],
    'Staff': ['staff_id', 'full_name', 'email', 'access_level', 'active'],
}
for m in MAT:
    LIST_COLS[m] = ['record_id', 'effective_date', 'validity_status', 'supplier_id', 'description'] + specs(m) + ['unit', 'currency', 'unit_price', 'unit_price_base', 'doc1_url']
DISPLAY = {'Suppliers': ['supplier_name'], 'Ports': ['port_name'], 'Processes': ['process_name'], 'FX_Rates': ['currency', 'effective_date'],
           'Staff': ['full_name'], 'Prod_Process_Rates': ['process_id', 'product_type'], 'Prod_Subcontract': ['process_id', 'product_type'],
           'Prod_Capacity': ['process_id', 'product_type'], 'Trans_Sea': ['pol', 'pod', 'cargo_type'], 'Trans_Inland_Origin': ['from_place', 'vehicle_type'],
           'Trans_Inland_Dest': ['to_site', 'vehicle_type'], 'Trans_Local_Charges': ['charge_type', 'port']}
NONNEG = ['unit_price', 'cost_labor', 'cost_machine', 'cost_consumables', 'cost_overhead', 'ocean_freight', 'surcharges', 'amount', 'moq', 'lead_time_days',
          'transit_days', 'free_time_days', 'distance_km', 'capacity_qty', 'manhours_per_unit', 'machinehours_per_unit']

tables = O()
for n, t in T.items():
    names = cols(n)
    rq = [c['name'] for c in t['columns'] if c['required'] and c['name'] != t['pk'] and not c['formula']]
    lbl = DISPLAY.get(n, ['description'])
    rng = O((k, [0, 1e15]) for k in NONNEG if k in names)
    if n == 'FX_Rates': rng['rate'] = [0.000001, 1e12]
    if n.startswith('Trans_Inland'): rng['rate'] = [0, 1e15]
    if 'percent_rate' in names: rng['percent_rate'] = [0, 100]
    tables[n] = O(
        label=TABLE_LABEL[n], prefix=t['idPrefix'] or {'Staff': 'STF'}.get(n, 'XX'), idStyle='catalog', idDigits=t['idDigits'] or 3,
        display=lbl[-1] if n in ('FX_Rates',) else lbl[0], labelCols=lbl, listCols=LIST_COLS[n], parentFk='',
        groupCol='', dateCol='effective_date' if 'effective_date' in names else '', view360=n in ('Suppliers', 'Ports', 'Processes'),
        required=rq, need=[], unique=['email'] if n == 'Staff' else [],
        pct=O((k, [0, 1]) for k in names if k.endswith('_share')), range=rng, url=[], email=['email'] if n == 'Staff' else [],
        long=[k for k in names if k in ('notes', 'scope', 'includes')] + (['description'] if n == 'Processes' else []), money=[],
        calc=O(), types=O(), fk=O(), soft=[c['name'] for c in t['columns'] if c['fk']],
        notes=O((c['name'], NOTE_VI[c['note']]) for c in t['columns'] if c['note']))
    if n == 'FX_Rates': tables[n]['display'] = 'currency'

# ----------------------------------------------------------------- nhãn
en_by_code = collections.defaultdict(collections.Counter)
for n, t in T.items():
    for c in t['columns']: en_by_code[c['name']][c['label']] += 1
labels_cols = O()
for code, cnt in en_by_code.items():
    labels_cols[code] = [VI[code], cnt.most_common(1)[0][0]]
for n, t in T.items():
    for c in t['columns']:
        key = n + '.' + c['name']
        if c['label'] != labels_cols[c['name']][1] or key in VI_T:
            labels_cols[key] = [VI_T.get(key, VI[c['name']]), c['label']]
notes_en = O((n + '.' + c['name'], c['note']) for n, t in T.items() for c in t['columns'] if c['note'])

ITEM = lambda t, icon: O(table=t, icon=icon)
spec = O(
    app=O(name='LSB Cost Input', brand='LSB Cost Input', subtitle=['Giá đầu vào: vật tư, sản xuất, vận tải', 'Input costs: materials, production, transport'],
          version='1.0.0', schemaVersion='Cost_Input_Database_Part2_R03_EN', menuTitle='LSB Cost App', timezone='Asia/Ho_Chi_Minh',
          alertDays=14, consts=O(), spreadsheetId='', logSheet='Activity_log',
          listsSource=O(sheet='Config', headerRow=7, firstRow=8, lastRow=107)),
    features=O(AUTH=True, ACTIVITY=True, ALERTS=True, VIEW360=True),
    staff=O(table='Staff', id='staff_id', email='email', name='full_name', access='access_level', active='active', role=''),
    catalogs=['FX_Rates', 'Staff'],
    tables=tables,
    menu=[O(group=['Vật tư', 'Materials'], items=[O(route='mat', label=['Bảng giá vật tư', 'Material prices'], icon='◫')]),
          O(group=['Sản xuất', 'Production'], items=[ITEM('Prod_Process_Rates', '⚙'), ITEM('Prod_Subcontract', '⇄'), ITEM('Prod_Capacity', '▤')]),
          O(group=['Vận tải', 'Transport'], items=[ITEM('Trans_Sea', '⛴'), ITEM('Trans_Inland_Origin', '⇢'), ITEM('Trans_Inland_Dest', '⇠'), ITEM('Trans_Local_Charges', '¤')]),
          O(group=['Danh mục', 'Master data'], items=[ITEM('Suppliers', '☖'), ITEM('Ports', '⚓'), ITEM('Processes', '⚒'), ITEM('FX_Rates', '$'),
                                                    O(route='lists', label=['Danh sách chọn', 'Dropdown lists'], icon='≡'), ITEM('Staff', '☺')])],
    dateOrder=[['effective_date', 'valid_until']],
    alerts=[],
    dashboard=O(kpiTables=[], metrics=[], providers=['Cost_board_']),
    needExtra=O(), autoUser=O(), defaults=O(),
    providers=O(hooks=['Cost_hooks_'], routes=['Cost_routes_'], related=[], extra360=['Cost_extra360_'], alerts=['Cost_alerts_'], checks=['Cost_checks_']),
    labels=O(columns=labels_cols, notesEn=notes_en))
json.dump(spec, open(os.path.join(HERE, 'app_spec.json'), 'w'), ensure_ascii=False, indent=1)
print('app_spec.json: %d bảng · %d nhãn cột · %d ghi chú EN' % (len(tables), len(labels_cols), len(notes_en)))
