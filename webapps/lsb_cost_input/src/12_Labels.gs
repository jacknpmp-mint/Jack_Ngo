/**
 * 12_Labels.gs — Nhãn song ngữ (SINH TỰ ĐỘNG bằng tools/gen_config.py từ app_spec.json › labels + tools/base_labels.json).
 * Muốn sửa nhãn: sửa app_spec.json rồi sinh lại. Khóa 'Bảng.Cột' ghi đè nhãn chung của cột.
 */

var I18N_TABLES = {
  "Suppliers": [
    "Nhà cung cấp",
    "Suppliers"
  ],
  "Ports": [
    "Cảng",
    "Ports"
  ],
  "Processes": [
    "Công đoạn",
    "Processes"
  ],
  "FX_Rates": [
    "Tỷ giá",
    "FX rates"
  ],
  "Mat_SteelPlate": [
    "Thép tấm",
    "Steel plate"
  ],
  "Mat_SteelSections": [
    "Thép hình",
    "Steel sections"
  ],
  "Mat_SteelSheeting": [
    "Tôn",
    "Steel sheeting"
  ],
  "Mat_AnchorBolts": [
    "Bu lông neo",
    "Anchor bolts"
  ],
  "Mat_Paint": [
    "Sơn",
    "Paint"
  ],
  "Mat_CF_Purlins": [
    "Xà gồ cán nguội",
    "Cold-formed purlins"
  ],
  "Mat_RodBracing": [
    "Giằng thanh",
    "Rod bracing"
  ],
  "Mat_Insulation": [
    "Bông cách nhiệt",
    "Insulation"
  ],
  "Mat_CF_Bracing": [
    "Giằng cán nguội",
    "Cold-formed bracing"
  ],
  "Mat_ConnBolts": [
    "Bu lông liên kết",
    "Connection bolts"
  ],
  "Mat_CableBracing": [
    "Giằng cáp",
    "Cable bracing"
  ],
  "Mat_Accessories": [
    "Phụ kiện",
    "Accessories"
  ],
  "Prod_Process_Rates": [
    "Đơn giá công đoạn (tự làm)",
    "In-house process rates"
  ],
  "Prod_Subcontract": [
    "Giá thuê ngoài",
    "Subcontract prices"
  ],
  "Prod_Capacity": [
    "Năng lực sản xuất",
    "Production capacity"
  ],
  "Trans_Sea": [
    "Cước biển",
    "Sea freight"
  ],
  "Trans_Inland_Origin": [
    "Nội địa đầu đi",
    "Inland – origin"
  ],
  "Trans_Inland_Dest": [
    "Nội địa đầu đến",
    "Inland – destination"
  ],
  "Trans_Local_Charges": [
    "Phí địa phương",
    "Local charges"
  ],
  "Staff": [
    "Người dùng app",
    "App users"
  ]
};

var I18N_COLUMNS = {
  "supplier_id": [
    "Mã NCC",
    "Supplier ID"
  ],
  "supplier_name": [
    "Tên NCC",
    "Supplier name"
  ],
  "supplier_type": [
    "Loại NCC",
    "Supplier type"
  ],
  "country": [
    "Quốc gia",
    "Country"
  ],
  "contact": [
    "Liên hệ",
    "Contact"
  ],
  "notes": [
    "Ghi chú",
    "Notes"
  ],
  "port_code": [
    "Mã cảng",
    "Port code"
  ],
  "port_name": [
    "Tên cảng",
    "Port name"
  ],
  "market_id": [
    "Mã thị trường (Part 1)",
    "Market ID (Part 1)"
  ],
  "process_id": [
    "Mã công đoạn",
    "Process ID"
  ],
  "process_name": [
    "Tên công đoạn",
    "Process name"
  ],
  "Processes.description": [
    "Mô tả",
    "Description"
  ],
  "FX_Rates.effective_date": [
    "Ngày hiệu lực",
    "Effective date"
  ],
  "currency": [
    "Tiền tệ",
    "Currency"
  ],
  "base_currency": [
    "Tiền gốc",
    "Base currency"
  ],
  "FX_Rates.rate": [
    "Tỷ giá (1 nguyên tệ = ? tiền gốc)",
    "Rate (1 unit of currency = ? base currency)"
  ],
  "FX_Rates.source": [
    "Nguồn tỷ giá",
    "Rate source"
  ],
  "fx_id": [
    "Mã tỷ giá",
    "FX ID"
  ],
  "record_id": [
    "Mã dòng",
    "Record ID"
  ],
  "effective_date": [
    "Ngày hiệu lực",
    "Quotation / effective date"
  ],
  "valid_until": [
    "Hiệu lực đến",
    "Valid until"
  ],
  "validity_status": [
    "Tình trạng hiệu lực",
    "Validity status"
  ],
  "material_group": [
    "Nhóm vật tư",
    "Material group"
  ],
  "material_id": [
    "Mã vật tư (Part 1)",
    "Material ID (Part 1)"
  ],
  "description": [
    "Mô tả",
    "Material description"
  ],
  "spec_grade": [
    "Spec: Mác / cấp bền",
    "Spec: Steel grade"
  ],
  "spec_standard": [
    "Spec: Tiêu chuẩn",
    "Spec: Standard"
  ],
  "spec_thickness_mm": [
    "Spec: Dày (mm)",
    "Spec: Thickness (mm)"
  ],
  "spec_width_mm": [
    "Spec: Rộng (mm)",
    "Spec: Width (mm)"
  ],
  "spec_length_mm": [
    "Spec: Dài (mm)",
    "Spec: Length (mm)"
  ],
  "origin_country": [
    "Xuất xứ",
    "Country of origin"
  ],
  "unit": [
    "Đơn vị tính",
    "Unit"
  ],
  "unit_price": [
    "Đơn giá (nguyên tệ / ĐVT)",
    "Unit price (original currency / unit)"
  ],
  "fx_rate": [
    "Tỷ giá áp dụng",
    "FX rate"
  ],
  "unit_price_base": [
    "Đơn giá (tiền gốc / ĐVT)",
    "Unit price (base currency / unit)"
  ],
  "incoterm": [
    "Điều kiện giá (Incoterm)",
    "Price incoterm"
  ],
  "delivery_place": [
    "Nơi giao",
    "Delivery place"
  ],
  "moq": [
    "SL đặt tối thiểu",
    "Minimum order qty"
  ],
  "lead_time_days": [
    "Thời gian giao (ngày)",
    "Lead time (days)"
  ],
  "payment_terms": [
    "Điều khoản thanh toán",
    "Payment terms"
  ],
  "quotation_ref": [
    "Số báo giá / chứng từ",
    "Quotation ref."
  ],
  "doc1_type": [
    "Tệp 1 – loại",
    "Attachment 1 - type"
  ],
  "doc1_url": [
    "Tệp 1 – link",
    "Attachment 1 - link (URL / path)"
  ],
  "doc1_open": [
    "Tệp 1 – mở",
    "Attachment 1 - open"
  ],
  "doc2_type": [
    "Tệp 2 – loại",
    "Attachment 2 - type"
  ],
  "doc2_url": [
    "Tệp 2 – link",
    "Attachment 2 - link (URL / path)"
  ],
  "doc2_open": [
    "Tệp 2 – mở",
    "Attachment 2 - open"
  ],
  "spec_section_type": [
    "Spec: Loại tiết diện",
    "Spec: Section type"
  ],
  "spec_section_size": [
    "Spec: Kích thước tiết diện",
    "Spec: Section size"
  ],
  "spec_length_m": [
    "Spec: Dài (m)",
    "Spec: Length (m)"
  ],
  "spec_base_grade": [
    "Spec: Mác thép nền",
    "Spec: Base steel grade"
  ],
  "Mat_SteelSheeting.spec_coating": [
    "Spec: Lớp mạ kim loại",
    "Spec: Metallic coating"
  ],
  "spec_paint_color": [
    "Spec: Hệ sơn / màu",
    "Spec: Paint system / colour"
  ],
  "spec_coil_width_mm": [
    "Spec: Khổ cuộn (mm)",
    "Spec: Coil width (mm)"
  ],
  "spec_diameter": [
    "Spec: Đường kính",
    "Spec: Diameter"
  ],
  "Mat_AnchorBolts.spec_grade": [
    "Spec: Mác / cấp bền",
    "Spec: Grade"
  ],
  "spec_finish": [
    "Spec: Bề mặt",
    "Spec: Finish"
  ],
  "spec_paint_type": [
    "Spec: Loại sơn / lớp",
    "Spec: Paint type / coat"
  ],
  "spec_product": [
    "Spec: Hãng / sản phẩm",
    "Spec: Brand / product"
  ],
  "spec_color": [
    "Spec: Màu",
    "Spec: Colour"
  ],
  "spec_volume_solids_pct": [
    "Spec: Hàm lượng rắn (%)",
    "Spec: Volume solids (%)"
  ],
  "spec_pack_size": [
    "Spec: Quy cách đóng gói",
    "Spec: Pack size"
  ],
  "spec_profile": [
    "Spec: Biên dạng",
    "Spec: Profile"
  ],
  "spec_coating": [
    "Spec: Lớp mạ",
    "Spec: Coating"
  ],
  "spec_diameter_mm": [
    "Spec: Đường kính (mm)",
    "Spec: Diameter (mm)"
  ],
  "spec_material_type": [
    "Spec: Vật liệu cách nhiệt",
    "Spec: Insulation material"
  ],
  "spec_density_kg_m3": [
    "Spec: Tỷ trọng (kg/m³)",
    "Spec: Density (kg/m3)"
  ],
  "spec_facing": [
    "Spec: Lớp phủ mặt",
    "Spec: Facing"
  ],
  "spec_roll_size": [
    "Spec: Kích thước cuộn / tấm",
    "Spec: Roll / sheet size"
  ],
  "Mat_ConnBolts.spec_grade": [
    "Spec: Mác / cấp bền",
    "Spec: Grade"
  ],
  "spec_construction": [
    "Spec: Cấu tạo cáp",
    "Spec: Cable construction"
  ],
  "Mat_CableBracing.spec_grade": [
    "Spec: Cấp bền / tải đứt",
    "Spec: Grade / breaking load"
  ],
  "spec_fittings": [
    "Spec: Kèm phụ kiện đầu",
    "Spec: End fittings included"
  ],
  "spec_accessory_type": [
    "Spec: Loại phụ kiện",
    "Spec: Accessory type"
  ],
  "spec_size": [
    "Spec: Kích thước",
    "Spec: Size / dimension"
  ],
  "spec_material": [
    "Spec: Vật liệu",
    "Spec: Material"
  ],
  "factory": [
    "Nhà máy",
    "Factory / plant"
  ],
  "product_type": [
    "Loại sản phẩm",
    "Product type"
  ],
  "item_id": [
    "Mã hạng mục (Part 1)",
    "Item ID (Part 1)"
  ],
  "cost_labor": [
    "Nhân công (nguyên tệ / ĐVT)",
    "Labor (original currency / unit)"
  ],
  "cost_machine": [
    "Máy (nguyên tệ / ĐVT)",
    "Machine (original currency / unit)"
  ],
  "cost_consumables": [
    "Vật tư tiêu hao (nguyên tệ / ĐVT)",
    "Consumables (original currency / unit)"
  ],
  "cost_overhead": [
    "Chi phí chung (nguyên tệ / ĐVT)",
    "Overhead (original currency / unit)"
  ],
  "unit_rate": [
    "Đơn giá công đoạn (nguyên tệ / ĐVT)",
    "Unit rate (original currency / unit)"
  ],
  "unit_rate_base": [
    "Đơn giá công đoạn (tiền gốc / ĐVT)",
    "Unit rate (base currency / unit)"
  ],
  "labor_share": [
    "Tỷ trọng nhân công",
    "Labor share %"
  ],
  "machine_share": [
    "Tỷ trọng máy",
    "Machine share %"
  ],
  "consumables_share": [
    "Tỷ trọng tiêu hao",
    "Consumables share %"
  ],
  "overhead_share": [
    "Tỷ trọng chi phí chung",
    "Overhead share %"
  ],
  "source": [
    "Nguồn",
    "Source"
  ],
  "Prod_Subcontract.supplier_id": [
    "Mã nhà thầu phụ",
    "Subcontractor ID"
  ],
  "scope": [
    "Phạm vi công việc",
    "Scope of work"
  ],
  "material_supplied_by": [
    "Bên cấp vật tư chính",
    "Material supplied by"
  ],
  "Prod_Capacity.effective_date": [
    "Áp dụng từ ngày",
    "Effective date"
  ],
  "capacity_qty": [
    "Năng lực (ĐVT / kỳ)",
    "Capacity (units / period)"
  ],
  "capacity_period": [
    "Kỳ năng lực",
    "Capacity period"
  ],
  "manhours_per_unit": [
    "Giờ công / ĐVT",
    "Man-hours per unit"
  ],
  "machinehours_per_unit": [
    "Giờ máy / ĐVT",
    "Machine-hours per unit"
  ],
  "Trans_Sea.supplier_id": [
    "Mã hãng tàu / FWD",
    "Carrier / forwarder ID"
  ],
  "pol": [
    "Cảng xếp (POL)",
    "POL code"
  ],
  "pol_name": [
    "Tên cảng xếp",
    "POL name"
  ],
  "pod": [
    "Cảng dỡ (POD)",
    "POD code"
  ],
  "pod_name": [
    "Tên cảng dỡ",
    "POD name"
  ],
  "cargo_type": [
    "Loại container / hàng",
    "Container / cargo type"
  ],
  "rate_basis": [
    "Cách tính",
    "Rate basis"
  ],
  "ocean_freight": [
    "Cước biển (nguyên tệ)",
    "Ocean freight (original currency / basis)"
  ],
  "surcharges": [
    "Phụ phí (nguyên tệ)",
    "Surcharges (original currency / basis)"
  ],
  "total_rate": [
    "Tổng cước (nguyên tệ)",
    "Total sea freight (original currency / basis)"
  ],
  "total_rate_base": [
    "Tổng cước (tiền gốc)",
    "Total sea freight (base currency / basis)"
  ],
  "transit_days": [
    "Thời gian vận chuyển (ngày)",
    "Transit time (days)"
  ],
  "free_time_days": [
    "Ngày miễn phí tại đích",
    "Free time at destination (days)"
  ],
  "service": [
    "Dịch vụ / tuyến",
    "Service / routing"
  ],
  "Trans_Inland_Origin.supplier_id": [
    "Mã nhà xe",
    "Trucker ID"
  ],
  "from_place": [
    "Từ (nhà máy / nơi đi)",
    "From (factory / origin place)"
  ],
  "destination_type": [
    "Loại điểm đến",
    "Destination type"
  ],
  "to_port": [
    "Đến cảng (mã)",
    "To port code"
  ],
  "to_port_name": [
    "Tên cảng đến",
    "To port name"
  ],
  "to_site": [
    "Đến công trình",
    "To site location"
  ],
  "vehicle_type": [
    "Loại xe",
    "Vehicle type"
  ],
  "distance_km": [
    "Quãng đường (km)",
    "Distance (km)"
  ],
  "Trans_Inland_Origin.rate": [
    "Cước (nguyên tệ)",
    "Trucking rate (original currency / basis)"
  ],
  "rate_base": [
    "Cước (tiền gốc)",
    "Trucking rate (base currency / basis)"
  ],
  "includes": [
    "Giá đã gồm",
    "Rate includes"
  ],
  "Trans_Inland_Dest.supplier_id": [
    "Mã nhà xe",
    "Trucker ID"
  ],
  "from_port": [
    "Từ cảng (mã)",
    "From port code"
  ],
  "from_port_name": [
    "Tên cảng đi",
    "From port name"
  ],
  "Trans_Inland_Dest.country": [
    "Nước nhập khẩu",
    "Country"
  ],
  "Trans_Inland_Dest.rate": [
    "Cước (nguyên tệ)",
    "Trucking rate (original currency / basis)"
  ],
  "Trans_Local_Charges.supplier_id": [
    "Mã đơn vị dịch vụ",
    "Service provider ID"
  ],
  "side": [
    "Phía",
    "Charge side"
  ],
  "port": [
    "Mã cảng",
    "Port code"
  ],
  "charge_type": [
    "Loại phí",
    "Charge type"
  ],
  "amount": [
    "Số tiền (nguyên tệ)",
    "Amount (original currency / basis)"
  ],
  "percent_rate": [
    "Tỷ lệ (%)",
    "Percent rate (%)"
  ],
  "amount_base": [
    "Số tiền (tiền gốc)",
    "Amount (base currency / basis)"
  ],
  "staff_id": [
    "Mã người dùng",
    "Staff ID"
  ],
  "full_name": [
    "Họ tên",
    "Full name"
  ],
  "email": [
    "Email (tài khoản Google)",
    "Email (Google account)"
  ],
  "access_level": [
    "Quyền",
    "Access level"
  ],
  "active": [
    "Đang hoạt động (Y/N)",
    "Active (Y/N)"
  ]
};

var I18N_NOTES_EN = {
  "Suppliers.supplier_id": "Unique supplier code",
  "Suppliers.supplier_name": "Full supplier name",
  "Suppliers.supplier_type": "Pick from Config > Supplier type",
  "Suppliers.country": "Supplier country",
  "Suppliers.contact": "Contact person / email / phone",
  "Suppliers.notes": "Notes",
  "Ports.port_code": "Unique port code (your own code or UN/LOCODE)",
  "Ports.port_name": "Port name",
  "Ports.country": "Country of the port",
  "Ports.market_id": "Optional link to the Markets master of the Part 1 database",
  "Ports.notes": "Notes",
  "Processes.process_id": "Unique process code",
  "Processes.process_name": "Production process / work step",
  "Processes.description": "What the process covers",
  "Processes.notes": "Notes",
  "FX_Rates.effective_date": "Rate applies from this date until a newer row exists",
  "FX_Rates.currency": "Currency to convert (other than the base currency)",
  "FX_Rates.base_currency": "From Config base currency",
  "FX_Rates.rate": "Example: if 1 USD = 26,000 VND enter 26000",
  "FX_Rates.source": "Bank / published source",
  "FX_Rates.notes": "Notes",
  "FX_Rates.fx_id": "Unique code of the rate row (FX-00001), given by the web app; date + currency must still be unique (R03)",
  "Mat_SteelPlate.record_id": "Unique code of the row",
  "Mat_SteelPlate.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_SteelPlate.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_SteelPlate.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_SteelPlate.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_SteelPlate.supplier_name": "Looked up from Suppliers",
  "Mat_SteelPlate.material_group": "Fixed for this sheet",
  "Mat_SteelPlate.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_SteelPlate.description": "Short description of the quoted material",
  "Mat_SteelPlate.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_SteelPlate.spec_standard": "Group-specific specification attribute that drives the price",
  "Mat_SteelPlate.spec_thickness_mm": "Group-specific specification attribute that drives the price",
  "Mat_SteelPlate.spec_width_mm": "Group-specific specification attribute that drives the price",
  "Mat_SteelPlate.spec_length_mm": "Group-specific specification attribute that drives the price",
  "Mat_SteelPlate.origin_country": "Where the material is produced",
  "Mat_SteelPlate.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_SteelPlate.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_SteelPlate.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_SteelPlate.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_SteelPlate.unit_price_base": "Price x FX rate",
  "Mat_SteelPlate.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_SteelPlate.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_SteelPlate.moq": "Minimum order quantity, in the price unit",
  "Mat_SteelPlate.lead_time_days": "Supplier delivery lead time in days",
  "Mat_SteelPlate.payment_terms": "Payment terms of the quotation",
  "Mat_SteelPlate.quotation_ref": "Quotation number / supporting document",
  "Mat_SteelPlate.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_SteelPlate.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_SteelPlate.doc1_open": "Click to open the link in column to the left",
  "Mat_SteelPlate.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_SteelPlate.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_SteelPlate.doc2_open": "Click to open the link in column to the left",
  "Mat_SteelPlate.notes": "Notes",
  "Mat_SteelSections.record_id": "Unique code of the row",
  "Mat_SteelSections.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_SteelSections.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_SteelSections.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_SteelSections.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_SteelSections.supplier_name": "Looked up from Suppliers",
  "Mat_SteelSections.material_group": "Fixed for this sheet",
  "Mat_SteelSections.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_SteelSections.description": "Short description of the quoted material",
  "Mat_SteelSections.spec_section_type": "Group-specific specification attribute that drives the price",
  "Mat_SteelSections.spec_section_size": "Group-specific specification attribute that drives the price",
  "Mat_SteelSections.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_SteelSections.spec_standard": "Group-specific specification attribute that drives the price",
  "Mat_SteelSections.spec_length_m": "Group-specific specification attribute that drives the price",
  "Mat_SteelSections.origin_country": "Where the material is produced",
  "Mat_SteelSections.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_SteelSections.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_SteelSections.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_SteelSections.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_SteelSections.unit_price_base": "Price x FX rate",
  "Mat_SteelSections.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_SteelSections.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_SteelSections.moq": "Minimum order quantity, in the price unit",
  "Mat_SteelSections.lead_time_days": "Supplier delivery lead time in days",
  "Mat_SteelSections.payment_terms": "Payment terms of the quotation",
  "Mat_SteelSections.quotation_ref": "Quotation number / supporting document",
  "Mat_SteelSections.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_SteelSections.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_SteelSections.doc1_open": "Click to open the link in column to the left",
  "Mat_SteelSections.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_SteelSections.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_SteelSections.doc2_open": "Click to open the link in column to the left",
  "Mat_SteelSections.notes": "Notes",
  "Mat_SteelSheeting.record_id": "Unique code of the row",
  "Mat_SteelSheeting.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_SteelSheeting.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_SteelSheeting.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_SteelSheeting.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_SteelSheeting.supplier_name": "Looked up from Suppliers",
  "Mat_SteelSheeting.material_group": "Fixed for this sheet",
  "Mat_SteelSheeting.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_SteelSheeting.description": "Short description of the quoted material",
  "Mat_SteelSheeting.spec_base_grade": "Group-specific specification attribute that drives the price",
  "Mat_SteelSheeting.spec_thickness_mm": "Group-specific specification attribute that drives the price",
  "Mat_SteelSheeting.spec_coating": "Group-specific specification attribute that drives the price",
  "Mat_SteelSheeting.spec_paint_color": "Group-specific specification attribute that drives the price",
  "Mat_SteelSheeting.spec_coil_width_mm": "Group-specific specification attribute that drives the price",
  "Mat_SteelSheeting.origin_country": "Where the material is produced",
  "Mat_SteelSheeting.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_SteelSheeting.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_SteelSheeting.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_SteelSheeting.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_SteelSheeting.unit_price_base": "Price x FX rate",
  "Mat_SteelSheeting.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_SteelSheeting.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_SteelSheeting.moq": "Minimum order quantity, in the price unit",
  "Mat_SteelSheeting.lead_time_days": "Supplier delivery lead time in days",
  "Mat_SteelSheeting.payment_terms": "Payment terms of the quotation",
  "Mat_SteelSheeting.quotation_ref": "Quotation number / supporting document",
  "Mat_SteelSheeting.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_SteelSheeting.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_SteelSheeting.doc1_open": "Click to open the link in column to the left",
  "Mat_SteelSheeting.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_SteelSheeting.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_SteelSheeting.doc2_open": "Click to open the link in column to the left",
  "Mat_SteelSheeting.notes": "Notes",
  "Mat_AnchorBolts.record_id": "Unique code of the row",
  "Mat_AnchorBolts.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_AnchorBolts.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_AnchorBolts.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_AnchorBolts.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_AnchorBolts.supplier_name": "Looked up from Suppliers",
  "Mat_AnchorBolts.material_group": "Fixed for this sheet",
  "Mat_AnchorBolts.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_AnchorBolts.description": "Short description of the quoted material",
  "Mat_AnchorBolts.spec_diameter": "Group-specific specification attribute that drives the price",
  "Mat_AnchorBolts.spec_length_mm": "Group-specific specification attribute that drives the price",
  "Mat_AnchorBolts.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_AnchorBolts.spec_standard": "Group-specific specification attribute that drives the price",
  "Mat_AnchorBolts.spec_finish": "Group-specific specification attribute that drives the price",
  "Mat_AnchorBolts.origin_country": "Where the material is produced",
  "Mat_AnchorBolts.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_AnchorBolts.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_AnchorBolts.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_AnchorBolts.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_AnchorBolts.unit_price_base": "Price x FX rate",
  "Mat_AnchorBolts.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_AnchorBolts.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_AnchorBolts.moq": "Minimum order quantity, in the price unit",
  "Mat_AnchorBolts.lead_time_days": "Supplier delivery lead time in days",
  "Mat_AnchorBolts.payment_terms": "Payment terms of the quotation",
  "Mat_AnchorBolts.quotation_ref": "Quotation number / supporting document",
  "Mat_AnchorBolts.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_AnchorBolts.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_AnchorBolts.doc1_open": "Click to open the link in column to the left",
  "Mat_AnchorBolts.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_AnchorBolts.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_AnchorBolts.doc2_open": "Click to open the link in column to the left",
  "Mat_AnchorBolts.notes": "Notes",
  "Mat_Paint.record_id": "Unique code of the row",
  "Mat_Paint.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_Paint.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_Paint.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_Paint.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_Paint.supplier_name": "Looked up from Suppliers",
  "Mat_Paint.material_group": "Fixed for this sheet",
  "Mat_Paint.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_Paint.description": "Short description of the quoted material",
  "Mat_Paint.spec_paint_type": "Group-specific specification attribute that drives the price",
  "Mat_Paint.spec_product": "Group-specific specification attribute that drives the price",
  "Mat_Paint.spec_color": "Group-specific specification attribute that drives the price",
  "Mat_Paint.spec_volume_solids_pct": "Group-specific specification attribute that drives the price",
  "Mat_Paint.spec_pack_size": "Group-specific specification attribute that drives the price",
  "Mat_Paint.origin_country": "Where the material is produced",
  "Mat_Paint.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_Paint.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_Paint.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_Paint.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_Paint.unit_price_base": "Price x FX rate",
  "Mat_Paint.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_Paint.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_Paint.moq": "Minimum order quantity, in the price unit",
  "Mat_Paint.lead_time_days": "Supplier delivery lead time in days",
  "Mat_Paint.payment_terms": "Payment terms of the quotation",
  "Mat_Paint.quotation_ref": "Quotation number / supporting document",
  "Mat_Paint.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_Paint.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_Paint.doc1_open": "Click to open the link in column to the left",
  "Mat_Paint.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_Paint.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_Paint.doc2_open": "Click to open the link in column to the left",
  "Mat_Paint.notes": "Notes",
  "Mat_CF_Purlins.record_id": "Unique code of the row",
  "Mat_CF_Purlins.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_CF_Purlins.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_CF_Purlins.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_CF_Purlins.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_CF_Purlins.supplier_name": "Looked up from Suppliers",
  "Mat_CF_Purlins.material_group": "Fixed for this sheet",
  "Mat_CF_Purlins.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_CF_Purlins.description": "Short description of the quoted material",
  "Mat_CF_Purlins.spec_profile": "Group-specific specification attribute that drives the price",
  "Mat_CF_Purlins.spec_section_size": "Group-specific specification attribute that drives the price",
  "Mat_CF_Purlins.spec_thickness_mm": "Group-specific specification attribute that drives the price",
  "Mat_CF_Purlins.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_CF_Purlins.spec_coating": "Group-specific specification attribute that drives the price",
  "Mat_CF_Purlins.origin_country": "Where the material is produced",
  "Mat_CF_Purlins.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_CF_Purlins.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_CF_Purlins.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_CF_Purlins.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_CF_Purlins.unit_price_base": "Price x FX rate",
  "Mat_CF_Purlins.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_CF_Purlins.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_CF_Purlins.moq": "Minimum order quantity, in the price unit",
  "Mat_CF_Purlins.lead_time_days": "Supplier delivery lead time in days",
  "Mat_CF_Purlins.payment_terms": "Payment terms of the quotation",
  "Mat_CF_Purlins.quotation_ref": "Quotation number / supporting document",
  "Mat_CF_Purlins.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_CF_Purlins.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_CF_Purlins.doc1_open": "Click to open the link in column to the left",
  "Mat_CF_Purlins.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_CF_Purlins.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_CF_Purlins.doc2_open": "Click to open the link in column to the left",
  "Mat_CF_Purlins.notes": "Notes",
  "Mat_RodBracing.record_id": "Unique code of the row",
  "Mat_RodBracing.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_RodBracing.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_RodBracing.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_RodBracing.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_RodBracing.supplier_name": "Looked up from Suppliers",
  "Mat_RodBracing.material_group": "Fixed for this sheet",
  "Mat_RodBracing.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_RodBracing.description": "Short description of the quoted material",
  "Mat_RodBracing.spec_diameter_mm": "Group-specific specification attribute that drives the price",
  "Mat_RodBracing.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_RodBracing.spec_standard": "Group-specific specification attribute that drives the price",
  "Mat_RodBracing.spec_finish": "Group-specific specification attribute that drives the price",
  "Mat_RodBracing.spec_length_mm": "Group-specific specification attribute that drives the price",
  "Mat_RodBracing.origin_country": "Where the material is produced",
  "Mat_RodBracing.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_RodBracing.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_RodBracing.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_RodBracing.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_RodBracing.unit_price_base": "Price x FX rate",
  "Mat_RodBracing.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_RodBracing.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_RodBracing.moq": "Minimum order quantity, in the price unit",
  "Mat_RodBracing.lead_time_days": "Supplier delivery lead time in days",
  "Mat_RodBracing.payment_terms": "Payment terms of the quotation",
  "Mat_RodBracing.quotation_ref": "Quotation number / supporting document",
  "Mat_RodBracing.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_RodBracing.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_RodBracing.doc1_open": "Click to open the link in column to the left",
  "Mat_RodBracing.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_RodBracing.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_RodBracing.doc2_open": "Click to open the link in column to the left",
  "Mat_RodBracing.notes": "Notes",
  "Mat_Insulation.record_id": "Unique code of the row",
  "Mat_Insulation.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_Insulation.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_Insulation.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_Insulation.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_Insulation.supplier_name": "Looked up from Suppliers",
  "Mat_Insulation.material_group": "Fixed for this sheet",
  "Mat_Insulation.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_Insulation.description": "Short description of the quoted material",
  "Mat_Insulation.spec_material_type": "Group-specific specification attribute that drives the price",
  "Mat_Insulation.spec_thickness_mm": "Group-specific specification attribute that drives the price",
  "Mat_Insulation.spec_density_kg_m3": "Group-specific specification attribute that drives the price",
  "Mat_Insulation.spec_facing": "Group-specific specification attribute that drives the price",
  "Mat_Insulation.spec_roll_size": "Group-specific specification attribute that drives the price",
  "Mat_Insulation.origin_country": "Where the material is produced",
  "Mat_Insulation.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_Insulation.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_Insulation.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_Insulation.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_Insulation.unit_price_base": "Price x FX rate",
  "Mat_Insulation.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_Insulation.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_Insulation.moq": "Minimum order quantity, in the price unit",
  "Mat_Insulation.lead_time_days": "Supplier delivery lead time in days",
  "Mat_Insulation.payment_terms": "Payment terms of the quotation",
  "Mat_Insulation.quotation_ref": "Quotation number / supporting document",
  "Mat_Insulation.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_Insulation.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_Insulation.doc1_open": "Click to open the link in column to the left",
  "Mat_Insulation.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_Insulation.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_Insulation.doc2_open": "Click to open the link in column to the left",
  "Mat_Insulation.notes": "Notes",
  "Mat_CF_Bracing.record_id": "Unique code of the row",
  "Mat_CF_Bracing.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_CF_Bracing.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_CF_Bracing.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_CF_Bracing.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_CF_Bracing.supplier_name": "Looked up from Suppliers",
  "Mat_CF_Bracing.material_group": "Fixed for this sheet",
  "Mat_CF_Bracing.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_CF_Bracing.description": "Short description of the quoted material",
  "Mat_CF_Bracing.spec_profile": "Group-specific specification attribute that drives the price",
  "Mat_CF_Bracing.spec_section_size": "Group-specific specification attribute that drives the price",
  "Mat_CF_Bracing.spec_thickness_mm": "Group-specific specification attribute that drives the price",
  "Mat_CF_Bracing.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_CF_Bracing.spec_coating": "Group-specific specification attribute that drives the price",
  "Mat_CF_Bracing.origin_country": "Where the material is produced",
  "Mat_CF_Bracing.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_CF_Bracing.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_CF_Bracing.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_CF_Bracing.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_CF_Bracing.unit_price_base": "Price x FX rate",
  "Mat_CF_Bracing.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_CF_Bracing.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_CF_Bracing.moq": "Minimum order quantity, in the price unit",
  "Mat_CF_Bracing.lead_time_days": "Supplier delivery lead time in days",
  "Mat_CF_Bracing.payment_terms": "Payment terms of the quotation",
  "Mat_CF_Bracing.quotation_ref": "Quotation number / supporting document",
  "Mat_CF_Bracing.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_CF_Bracing.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_CF_Bracing.doc1_open": "Click to open the link in column to the left",
  "Mat_CF_Bracing.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_CF_Bracing.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_CF_Bracing.doc2_open": "Click to open the link in column to the left",
  "Mat_CF_Bracing.notes": "Notes",
  "Mat_ConnBolts.record_id": "Unique code of the row",
  "Mat_ConnBolts.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_ConnBolts.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_ConnBolts.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_ConnBolts.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_ConnBolts.supplier_name": "Looked up from Suppliers",
  "Mat_ConnBolts.material_group": "Fixed for this sheet",
  "Mat_ConnBolts.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_ConnBolts.description": "Short description of the quoted material",
  "Mat_ConnBolts.spec_diameter": "Group-specific specification attribute that drives the price",
  "Mat_ConnBolts.spec_length_mm": "Group-specific specification attribute that drives the price",
  "Mat_ConnBolts.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_ConnBolts.spec_standard": "Group-specific specification attribute that drives the price",
  "Mat_ConnBolts.spec_finish": "Group-specific specification attribute that drives the price",
  "Mat_ConnBolts.origin_country": "Where the material is produced",
  "Mat_ConnBolts.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_ConnBolts.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_ConnBolts.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_ConnBolts.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_ConnBolts.unit_price_base": "Price x FX rate",
  "Mat_ConnBolts.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_ConnBolts.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_ConnBolts.moq": "Minimum order quantity, in the price unit",
  "Mat_ConnBolts.lead_time_days": "Supplier delivery lead time in days",
  "Mat_ConnBolts.payment_terms": "Payment terms of the quotation",
  "Mat_ConnBolts.quotation_ref": "Quotation number / supporting document",
  "Mat_ConnBolts.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_ConnBolts.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_ConnBolts.doc1_open": "Click to open the link in column to the left",
  "Mat_ConnBolts.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_ConnBolts.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_ConnBolts.doc2_open": "Click to open the link in column to the left",
  "Mat_ConnBolts.notes": "Notes",
  "Mat_CableBracing.record_id": "Unique code of the row",
  "Mat_CableBracing.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_CableBracing.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_CableBracing.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_CableBracing.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_CableBracing.supplier_name": "Looked up from Suppliers",
  "Mat_CableBracing.material_group": "Fixed for this sheet",
  "Mat_CableBracing.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_CableBracing.description": "Short description of the quoted material",
  "Mat_CableBracing.spec_diameter_mm": "Group-specific specification attribute that drives the price",
  "Mat_CableBracing.spec_construction": "Group-specific specification attribute that drives the price",
  "Mat_CableBracing.spec_grade": "Group-specific specification attribute that drives the price",
  "Mat_CableBracing.spec_finish": "Group-specific specification attribute that drives the price",
  "Mat_CableBracing.spec_fittings": "Group-specific specification attribute that drives the price",
  "Mat_CableBracing.origin_country": "Where the material is produced",
  "Mat_CableBracing.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_CableBracing.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_CableBracing.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_CableBracing.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_CableBracing.unit_price_base": "Price x FX rate",
  "Mat_CableBracing.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_CableBracing.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_CableBracing.moq": "Minimum order quantity, in the price unit",
  "Mat_CableBracing.lead_time_days": "Supplier delivery lead time in days",
  "Mat_CableBracing.payment_terms": "Payment terms of the quotation",
  "Mat_CableBracing.quotation_ref": "Quotation number / supporting document",
  "Mat_CableBracing.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_CableBracing.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_CableBracing.doc1_open": "Click to open the link in column to the left",
  "Mat_CableBracing.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_CableBracing.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_CableBracing.doc2_open": "Click to open the link in column to the left",
  "Mat_CableBracing.notes": "Notes",
  "Mat_Accessories.record_id": "Unique code of the row",
  "Mat_Accessories.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Mat_Accessories.valid_until": "Last day the price is valid; blank if open-ended",
  "Mat_Accessories.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Mat_Accessories.supplier_id": "Material supplier. Pick from Suppliers",
  "Mat_Accessories.supplier_name": "Looked up from Suppliers",
  "Mat_Accessories.material_group": "Fixed for this sheet",
  "Mat_Accessories.material_id": "Optional link to the Materials master of the Part 1 database",
  "Mat_Accessories.description": "Short description of the quoted material",
  "Mat_Accessories.spec_accessory_type": "Group-specific specification attribute that drives the price",
  "Mat_Accessories.spec_size": "Group-specific specification attribute that drives the price",
  "Mat_Accessories.spec_material": "Group-specific specification attribute that drives the price",
  "Mat_Accessories.spec_finish": "Group-specific specification attribute that drives the price",
  "Mat_Accessories.spec_standard": "Group-specific specification attribute that drives the price",
  "Mat_Accessories.origin_country": "Where the material is produced",
  "Mat_Accessories.unit": "Unit of the unit price. Pick from Config > Unit",
  "Mat_Accessories.currency": "Currency of the price. Pick from Config > Currency",
  "Mat_Accessories.unit_price": "Quoted unit price in its original currency per unit",
  "Mat_Accessories.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Mat_Accessories.unit_price_base": "Price x FX rate",
  "Mat_Accessories.incoterm": "Delivery term of the quoted price. Pick from Config > Incoterm",
  "Mat_Accessories.delivery_place": "Named place of the price term (supplier warehouse, port, our factory...)",
  "Mat_Accessories.moq": "Minimum order quantity, in the price unit",
  "Mat_Accessories.lead_time_days": "Supplier delivery lead time in days",
  "Mat_Accessories.payment_terms": "Payment terms of the quotation",
  "Mat_Accessories.quotation_ref": "Quotation number / supporting document",
  "Mat_Accessories.doc1_type": "Kind of document. Pick from Config > Document type",
  "Mat_Accessories.doc1_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_Accessories.doc1_open": "Click to open the link in column to the left",
  "Mat_Accessories.doc2_type": "Kind of document. Pick from Config > Document type",
  "Mat_Accessories.doc2_url": "Full link to the file: SharePoint / OneDrive / Google Drive share link, web URL, or network path (\\\\server\\folder\\file.pdf). Paste the whole link",
  "Mat_Accessories.doc2_open": "Click to open the link in column to the left",
  "Mat_Accessories.notes": "Notes",
  "Prod_Process_Rates.record_id": "Unique code of the row",
  "Prod_Process_Rates.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Prod_Process_Rates.valid_until": "Last day the price is valid; blank if open-ended",
  "Prod_Process_Rates.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Prod_Process_Rates.factory": "Pick from Config > Factory / plant",
  "Prod_Process_Rates.process_id": "Pick from Processes",
  "Prod_Process_Rates.process_name": "Looked up from Processes",
  "Prod_Process_Rates.product_type": "Product / member type the figures apply to",
  "Prod_Process_Rates.item_id": "Optional link to the Items master of the Part 1 database",
  "Prod_Process_Rates.unit": "Unit of the rate. Pick from Config > Unit",
  "Prod_Process_Rates.currency": "Currency of the rate. Pick from Config > Currency",
  "Prod_Process_Rates.cost_labor": "Direct labor cost per unit",
  "Prod_Process_Rates.cost_machine": "Machine / equipment cost per unit (depreciation, energy, maintenance)",
  "Prod_Process_Rates.cost_consumables": "Consumables per unit (gas, wire, abrasive...)",
  "Prod_Process_Rates.cost_overhead": "Factory overhead per unit",
  "Prod_Process_Rates.unit_rate": "Labor + Machine + Consumables + Overhead",
  "Prod_Process_Rates.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Prod_Process_Rates.unit_rate_base": "Price x FX rate",
  "Prod_Process_Rates.labor_share": "Labor / unit rate",
  "Prod_Process_Rates.machine_share": "Machine / unit rate",
  "Prod_Process_Rates.consumables_share": "Consumables / unit rate",
  "Prod_Process_Rates.overhead_share": "Overhead / unit rate",
  "Prod_Process_Rates.source": "Where the rate comes from (costing study, budget, finance...)",
  "Prod_Process_Rates.notes": "Notes",
  "Prod_Subcontract.record_id": "Unique code of the row",
  "Prod_Subcontract.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Prod_Subcontract.valid_until": "Last day the price is valid; blank if open-ended",
  "Prod_Subcontract.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Prod_Subcontract.supplier_id": "Subcontractor. Pick from Suppliers",
  "Prod_Subcontract.supplier_name": "Looked up from Suppliers",
  "Prod_Subcontract.process_id": "Pick from Processes",
  "Prod_Subcontract.process_name": "Looked up from Processes",
  "Prod_Subcontract.product_type": "Product / member type the figures apply to",
  "Prod_Subcontract.item_id": "Optional link to the Items master of the Part 1 database",
  "Prod_Subcontract.scope": "What the subcontract price includes / excludes",
  "Prod_Subcontract.material_supplied_by": "Who supplies the main material (us / subcontractor)",
  "Prod_Subcontract.unit": "Unit of the unit price. Pick from Config > Unit",
  "Prod_Subcontract.currency": "Currency of the price. Pick from Config > Currency",
  "Prod_Subcontract.unit_price": "Subcontractor unit price in its original currency per unit",
  "Prod_Subcontract.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Prod_Subcontract.unit_price_base": "Price x FX rate",
  "Prod_Subcontract.moq": "Minimum quantity, in the price unit",
  "Prod_Subcontract.lead_time_days": "Subcontractor lead time in days",
  "Prod_Subcontract.payment_terms": "Payment terms of the quotation",
  "Prod_Subcontract.quotation_ref": "Quotation number / supporting document",
  "Prod_Subcontract.notes": "Notes",
  "Prod_Capacity.record_id": "Unique code of the row",
  "Prod_Capacity.effective_date": "Date the figures apply from",
  "Prod_Capacity.factory": "Pick from Config > Factory / plant",
  "Prod_Capacity.process_id": "Pick from Processes",
  "Prod_Capacity.process_name": "Looked up from Processes",
  "Prod_Capacity.product_type": "Product / member type the figures apply to",
  "Prod_Capacity.item_id": "Optional link to the Items master of the Part 1 database",
  "Prod_Capacity.unit": "Unit used for capacity and per-unit hours. Pick from Config > Unit",
  "Prod_Capacity.capacity_qty": "Output capacity per period",
  "Prod_Capacity.capacity_period": "Pick from Config > Capacity period",
  "Prod_Capacity.manhours_per_unit": "Standard labor hours per unit",
  "Prod_Capacity.machinehours_per_unit": "Standard machine hours per unit",
  "Prod_Capacity.lead_time_days": "Standard production lead time for this process in days",
  "Prod_Capacity.source": "Where the figures come from",
  "Prod_Capacity.notes": "Notes",
  "Trans_Sea.record_id": "Unique code of the row",
  "Trans_Sea.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Trans_Sea.valid_until": "Last day the price is valid; blank if open-ended",
  "Trans_Sea.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Trans_Sea.supplier_id": "Carrier or forwarder. Pick from Suppliers",
  "Trans_Sea.supplier_name": "Looked up from Suppliers",
  "Trans_Sea.pol": "Port of loading. Pick from Ports",
  "Trans_Sea.pol_name": "Looked up from Ports",
  "Trans_Sea.pod": "Port of discharge. Pick from Ports",
  "Trans_Sea.pod_name": "Looked up from Ports",
  "Trans_Sea.cargo_type": "Pick from Config > Container / cargo type",
  "Trans_Sea.rate_basis": "What the amount is charged per. Pick from Config > Rate basis",
  "Trans_Sea.currency": "Currency of the rate. Pick from Config > Currency",
  "Trans_Sea.ocean_freight": "Base ocean freight per rate basis",
  "Trans_Sea.surcharges": "Carrier surcharges per rate basis (bunker, peak season...), if quoted separately",
  "Trans_Sea.total_rate": "Ocean freight + Surcharges",
  "Trans_Sea.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Trans_Sea.total_rate_base": "Price x FX rate",
  "Trans_Sea.transit_days": "Port-to-port transit time in days",
  "Trans_Sea.free_time_days": "Free demurrage / detention days at destination",
  "Trans_Sea.service": "Direct or transshipment, routing",
  "Trans_Sea.quotation_ref": "Quotation number / supporting document",
  "Trans_Sea.notes": "Notes",
  "Trans_Inland_Origin.record_id": "Unique code of the row",
  "Trans_Inland_Origin.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Trans_Inland_Origin.valid_until": "Last day the price is valid; blank if open-ended",
  "Trans_Inland_Origin.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Trans_Inland_Origin.supplier_id": "Trucking company. Pick from Suppliers",
  "Trans_Inland_Origin.supplier_name": "Looked up from Suppliers",
  "Trans_Inland_Origin.from_place": "Loading place",
  "Trans_Inland_Origin.destination_type": "Port or Site. Pick from Config > Destination type",
  "Trans_Inland_Origin.to_port": "Destination port when the destination type is Port. Pick from Ports",
  "Trans_Inland_Origin.to_port_name": "Looked up from Ports",
  "Trans_Inland_Origin.to_site": "Site address / city when the destination type is Site",
  "Trans_Inland_Origin.vehicle_type": "Pick from Config > Vehicle type",
  "Trans_Inland_Origin.rate_basis": "What the amount is charged per. Pick from Config > Rate basis",
  "Trans_Inland_Origin.distance_km": "Route distance in km",
  "Trans_Inland_Origin.currency": "Currency of the price. Pick from Config > Currency",
  "Trans_Inland_Origin.rate": "Inland transport rate per rate basis",
  "Trans_Inland_Origin.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Trans_Inland_Origin.rate_base": "Price x FX rate",
  "Trans_Inland_Origin.transit_days": "Door-to-door transit time in days",
  "Trans_Inland_Origin.includes": "What is included (loading, unloading, tolls, permits, escort...)",
  "Trans_Inland_Origin.quotation_ref": "Quotation number / supporting document",
  "Trans_Inland_Origin.notes": "Notes",
  "Trans_Inland_Dest.record_id": "Unique code of the row",
  "Trans_Inland_Dest.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Trans_Inland_Dest.valid_until": "Last day the price is valid; blank if open-ended",
  "Trans_Inland_Dest.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Trans_Inland_Dest.supplier_id": "Trucking company. Pick from Suppliers",
  "Trans_Inland_Dest.supplier_name": "Looked up from Suppliers",
  "Trans_Inland_Dest.from_port": "Destination port where the cargo is picked up. Pick from Ports",
  "Trans_Inland_Dest.from_port_name": "Looked up from Ports",
  "Trans_Inland_Dest.country": "Importing country",
  "Trans_Inland_Dest.to_site": "Site address / city",
  "Trans_Inland_Dest.vehicle_type": "Pick from Config > Vehicle type",
  "Trans_Inland_Dest.rate_basis": "What the amount is charged per. Pick from Config > Rate basis",
  "Trans_Inland_Dest.distance_km": "Route distance in km",
  "Trans_Inland_Dest.currency": "Currency of the price. Pick from Config > Currency",
  "Trans_Inland_Dest.rate": "Inland transport rate per rate basis",
  "Trans_Inland_Dest.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Trans_Inland_Dest.rate_base": "Price x FX rate",
  "Trans_Inland_Dest.transit_days": "Door-to-door transit time in days",
  "Trans_Inland_Dest.includes": "What is included (loading, unloading, tolls, permits, escort...)",
  "Trans_Inland_Dest.quotation_ref": "Quotation number / supporting document",
  "Trans_Inland_Dest.notes": "Notes",
  "Trans_Local_Charges.record_id": "Unique code of the row",
  "Trans_Local_Charges.effective_date": "Date of the quotation or the date the price starts to apply; also used to look up the FX rate",
  "Trans_Local_Charges.valid_until": "Last day the price is valid; blank if open-ended",
  "Trans_Local_Charges.validity_status": "Valid / Expired against today's date; blank when no end date",
  "Trans_Local_Charges.supplier_id": "Forwarder, carrier or customs broker. Pick from Suppliers",
  "Trans_Local_Charges.supplier_name": "Looked up from Suppliers",
  "Trans_Local_Charges.side": "Origin or Destination. Pick from Config > Charge side",
  "Trans_Local_Charges.port": "Port where the charge applies. Pick from Ports",
  "Trans_Local_Charges.port_name": "Looked up from Ports",
  "Trans_Local_Charges.charge_type": "Pick from Config > Local charge type",
  "Trans_Local_Charges.cargo_type": "Pick from Config > Container / cargo type",
  "Trans_Local_Charges.rate_basis": "What the amount is charged per. Pick from Config > Rate basis",
  "Trans_Local_Charges.currency": "Currency of the price. Pick from Config > Currency",
  "Trans_Local_Charges.amount": "Charge amount per rate basis; leave blank when the charge is a percentage",
  "Trans_Local_Charges.percent_rate": "Only for charges quoted as a percentage (e.g. insurance, duty): enter 0.5 for 0.5%",
  "Trans_Local_Charges.fx_rate": "Latest rate dated on or before the quotation / effective date (from FX_Rates); 1 for the base currency",
  "Trans_Local_Charges.amount_base": "Price x FX rate",
  "Trans_Local_Charges.quotation_ref": "Quotation number / supporting document",
  "Trans_Local_Charges.notes": "Notes",
  "Staff.staff_id": "Unique user code (STF-001), given by the web app (R03)",
  "Staff.full_name": "Name shown in the web app and the change log",
  "Staff.email": "Google account used to open the web app",
  "Staff.access_level": "Viewer = read only; Editor = enter quotations, suppliers, ports, processes; Admin = also FX rates, Config lists, users, delete",
  "Staff.active": "N = account suspended",
  "Staff.notes": "Notes"
};
