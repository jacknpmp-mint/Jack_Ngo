/**
 * 12_Labels.gs — Nhãn song ngữ (SINH TỰ ĐỘNG bằng tools/gen_config.py từ app_spec.json › labels + tools/base_labels.json).
 * Muốn sửa nhãn: sửa app_spec.json rồi sinh lại. Khóa 'Bảng.Cột' ghi đè nhãn chung của cột.
 */

var I18N_TABLES = {
  "Staff": [
    "Người dùng app",
    "App users"
  ],
  "Markets": [
    "Thị trường",
    "Markets"
  ],
  "Customers": [
    "Khách hàng",
    "Customers"
  ],
  "Items": [
    "Hạng mục báo giá",
    "Quotation items"
  ],
  "Materials": [
    "Vật tư",
    "Materials"
  ],
  "FX_Rates": [
    "Tỷ giá",
    "FX rates"
  ],
  "Material_Prices": [
    "Bảng giá vật tư",
    "Material prices"
  ],
  "Projects": [
    "Dự án",
    "Projects"
  ],
  "Project_Items": [
    "Giá hạng mục dự án",
    "Project item prices"
  ],
  "Project_Freight": [
    "Cước vận chuyển",
    "Project freight"
  ],
  "Project_Inputs_Bid": [
    "Vật tư đầu vào - Bid",
    "Material inputs - bid"
  ],
  "Project_Inputs_Job": [
    "Vật tư đầu vào - Job",
    "Material inputs - job"
  ]
};

var I18N_COLUMNS = {
  "staff_id": [
    "Mã nhân sự",
    "Staff ID"
  ],
  "full_name": [
    "Họ tên",
    "Full name"
  ],
  "email": [
    "Email Google",
    "Google email"
  ],
  "access_level": [
    "Quyền app",
    "App access"
  ],
  "active": [
    "Đang hoạt động",
    "Active"
  ],
  "job_role": [
    "Vai trò công việc",
    "Job role"
  ],
  "notes": [
    "Ghi chú",
    "Notes"
  ],
  "Markets.market_id": [
    "Mã thị trường",
    "Market ID"
  ],
  "market_name": [
    "Tên thị trường",
    "Market name"
  ],
  "scope": [
    "Phạm vi",
    "Scope / description"
  ],
  "Customers.customer_id": [
    "Mã khách hàng",
    "Customer ID"
  ],
  "customer_name": [
    "Tên khách hàng",
    "Customer name"
  ],
  "customer_type": [
    "Loại khách hàng",
    "Customer type"
  ],
  "country": [
    "Quốc gia",
    "Country"
  ],
  "Items.item_id": [
    "Mã hạng mục",
    "Item ID"
  ],
  "item_name": [
    "Tên hạng mục",
    "Item name"
  ],
  "Items.unit": [
    "Đơn vị tính giá",
    "Price unit"
  ],
  "material_group": [
    "Nhóm vật tư",
    "Material group"
  ],
  "Items.description": [
    "Phạm vi hạng mục",
    "Scope description"
  ],
  "Materials.material_id": [
    "Mã vật tư",
    "Material ID"
  ],
  "material_name": [
    "Tên vật tư",
    "Material name"
  ],
  "description": [
    "Mô tả",
    "Description"
  ],
  "unit": [
    "Đơn vị",
    "Unit"
  ],
  "effective_date": [
    "Ngày hiệu lực",
    "Effective date"
  ],
  "currency": [
    "Tiền tệ",
    "Currency"
  ],
  "base_currency": [
    "Tiền tệ gốc",
    "Base currency"
  ],
  "rate": [
    "Tỷ giá (1 đơn vị = ? VND)",
    "Rate (1 unit = ? VND)"
  ],
  "source": [
    "Nguồn",
    "Source"
  ],
  "fx_id": [
    "Mã tỷ giá",
    "FX row ID"
  ],
  "Material_Prices.price_id": [
    "Mã dòng giá",
    "Price row ID"
  ],
  "material_id": [
    "Vật tư",
    "Material"
  ],
  "specification": [
    "Quy cách",
    "Specification"
  ],
  "supplier": [
    "Nhà cung cấp",
    "Supplier"
  ],
  "unit_price": [
    "Đơn giá (tiền gốc / ĐV)",
    "Unit price (original / unit)"
  ],
  "fx_rate": [
    "Tỷ giá",
    "FX rate"
  ],
  "unit_price_base": [
    "Đơn giá (VND / ĐV)",
    "Unit price (VND / unit)"
  ],
  "price_terms": [
    "Điều kiện giá",
    "Price terms"
  ],
  "fx_usd": [
    "Tỷ giá USD",
    "FX rate - USD"
  ],
  "unit_price_usd": [
    "Đơn giá (USD / ĐV)",
    "Unit price (USD / unit)"
  ],
  "Projects.project_id": [
    "Mã dự án",
    "Project ID"
  ],
  "project_name": [
    "Tên dự án",
    "Project name"
  ],
  "customer_id": [
    "Khách hàng",
    "Customer"
  ],
  "market_id": [
    "Thị trường",
    "Market"
  ],
  "quote_date": [
    "Ngày báo giá",
    "Quotation date"
  ],
  "contract_date": [
    "Ngày ký HĐ",
    "Contract date"
  ],
  "status": [
    "Trạng thái",
    "Status"
  ],
  "job_no": [
    "Số Job",
    "Job No."
  ],
  "sell_currency": [
    "Tiền tệ bán",
    "Selling currency"
  ],
  "cost_currency": [
    "Tiền tệ chi phí",
    "Cost currency"
  ],
  "fx_date": [
    "Ngày tỷ giá",
    "FX date"
  ],
  "fx_sell": [
    "Tỷ giá bán",
    "FX rate - selling"
  ],
  "fx_cost": [
    "Tỷ giá chi phí",
    "FX rate - cost"
  ],
  "item_rows": [
    "Số dòng hạng mục",
    "Item rows"
  ],
  "gm_pct_bid": [
    "GM% TB - Bid",
    "Avg GM% - bid"
  ],
  "gm_pct_job": [
    "GM% TB - Job",
    "Avg GM% - job"
  ],
  "freight_rows": [
    "Số dòng cước",
    "Freight rows"
  ],
  "owner": [
    "Người phụ trách",
    "Person in charge"
  ],
  "data_check": [
    "Kiểm tra dữ liệu",
    "Data check"
  ],
  "line_id": [
    "Mã dòng",
    "Row ID"
  ],
  "project_id": [
    "Dự án",
    "Project"
  ],
  "item_id": [
    "Hạng mục",
    "Item"
  ],
  "stage": [
    "Giai đoạn",
    "Stage"
  ],
  "cost_material": [
    "CP vật tư (/ĐV)",
    "Material cost (/unit)"
  ],
  "cost_fabrication": [
    "CP gia công (/ĐV)",
    "Fabrication cost (/unit)"
  ],
  "cost_erection": [
    "CP lắp dựng (/ĐV)",
    "Erection cost (/unit)"
  ],
  "cost_other": [
    "CP khác (/ĐV)",
    "Other cost (/unit)"
  ],
  "unit_cost": [
    "Giá vốn (tiền chi phí / ĐV)",
    "Unit cost (cost currency / unit)"
  ],
  "unit_sell": [
    "Giá bán (tiền bán / ĐV)",
    "Unit selling price (selling currency / unit)"
  ],
  "unit_sell_base": [
    "Giá bán (VND / ĐV)",
    "Unit selling price (VND / unit)"
  ],
  "unit_cost_base": [
    "Giá vốn (VND / ĐV)",
    "Unit cost (VND / unit)"
  ],
  "gm_unit": [
    "Lãi gộp (VND / ĐV)",
    "Gross margin (VND / unit)"
  ],
  "gm_pct": [
    "Lãi gộp %",
    "Gross margin %"
  ],
  "unit_sell_usd": [
    "Giá bán (USD / ĐV)",
    "Unit selling price (USD / unit)"
  ],
  "unit_cost_usd": [
    "Giá vốn (USD / ĐV)",
    "Unit cost (USD / unit)"
  ],
  "gm_unit_usd": [
    "Lãi gộp (USD / ĐV)",
    "Gross margin (USD / unit)"
  ],
  "freight_id": [
    "Mã dòng",
    "Row ID"
  ],
  "incoterm": [
    "Incoterm",
    "Incoterm"
  ],
  "destination_port": [
    "Cảng đích",
    "Destination port"
  ],
  "site_location": [
    "Địa điểm công trình",
    "Site location"
  ],
  "cost_basis": [
    "Đơn vị tính cước",
    "Freight cost basis"
  ],
  "freight_cost": [
    "Cước (tiền gốc / đơn vị tính)",
    "Freight cost (original / basis)"
  ],
  "Project_Freight.fx_rate": [
    "Tỷ giá (ngày tỷ giá dự án)",
    "FX rate (project FX date)"
  ],
  "freight_cost_base": [
    "Cước (VND / đơn vị tính)",
    "Freight cost (VND / basis)"
  ],
  "freight_cost_usd": [
    "Cước (USD / đơn vị tính)",
    "Freight cost (USD / basis)"
  ],
  "input_id": [
    "Mã dòng",
    "Row ID"
  ],
  "Project_Inputs_Bid.specification": [
    "Quy cách áp dụng",
    "Applied specification"
  ],
  "Project_Inputs_Bid.price_id": [
    "Dòng giá tham chiếu",
    "Reference price row"
  ],
  "ref_specification": [
    "Quy cách dòng giá tham chiếu",
    "Spec of reference price row"
  ],
  "spec_check": [
    "Kiểm tra quy cách",
    "Spec check"
  ],
  "Project_Inputs_Bid.unit_price": [
    "Đơn giá Bid (tiền gốc / ĐV)",
    "Bid unit price (original / unit)"
  ],
  "Project_Inputs_Bid.unit_price_base": [
    "Đơn giá Bid (VND / ĐV)",
    "Bid unit price (VND / unit)"
  ],
  "list_price_base": [
    "Giá bảng giá (VND / ĐV)",
    "Price-list price (VND / unit)"
  ],
  "var_vs_list_pct": [
    "Chênh so bảng giá %",
    "Variance vs price list %"
  ],
  "Project_Inputs_Bid.unit_price_usd": [
    "Đơn giá Bid (USD / ĐV)",
    "Bid unit price (USD / unit)"
  ],
  "list_price_usd": [
    "Giá bảng giá (USD / ĐV)",
    "Price-list price (USD / unit)"
  ],
  "Project_Inputs_Job.specification": [
    "Quy cách áp dụng",
    "Applied specification"
  ],
  "price_date": [
    "Ngày giá thực tế",
    "Actual price date"
  ],
  "Project_Inputs_Job.supplier": [
    "Nhà cung cấp thực tế",
    "Actual supplier"
  ],
  "Project_Inputs_Job.price_id": [
    "Dòng giá tham chiếu",
    "Reference price row"
  ],
  "Project_Inputs_Job.unit_price": [
    "Đơn giá thực tế (tiền gốc / ĐV)",
    "Actual unit price (original / unit)"
  ],
  "Project_Inputs_Job.unit_price_base": [
    "Đơn giá thực tế (VND / ĐV)",
    "Actual unit price (VND / unit)"
  ],
  "bid_unit_price_base": [
    "Đơn giá Bid (VND / ĐV)",
    "Bid unit price (VND / unit)"
  ],
  "var_vs_bid_pct": [
    "Chênh so Bid %",
    "Variance vs bid %"
  ],
  "Project_Inputs_Job.unit_price_usd": [
    "Đơn giá thực tế (USD / ĐV)",
    "Actual unit price (USD / unit)"
  ],
  "bid_unit_price_usd": [
    "Đơn giá Bid (USD / ĐV)",
    "Bid unit price (USD / unit)"
  ]
};

var I18N_NOTES_EN = {
  "Staff.email": "Google account used to open the web app",
  "Staff.access_level": "Viewer (read) / Editor (add, edit) / Admin (+ delete, masters, users)",
  "Items.unit": "Unit that the item unit price is quoted in (one unit per item for all projects, so prices are comparable). Pick from Config > Unit",
  "Items.material_group": "Material group this item represents (drives selling price / gross margin summaries by material group). Pick from Config > Material group",
  "Materials.description": "General description. The detailed specification that drives the price is entered in Material_Prices",
  "FX_Rates.effective_date": "Rate applies from this date until a newer row exists",
  "FX_Rates.currency": "Currency to convert (other than the base currency)",
  "FX_Rates.rate": "Example: if 1 USD = 26,000 VND enter 26000",
  "Material_Prices.specification": "Specification that drives the unit price (grade, thickness, standard, coating...). Each different spec of the same material is a separate price row",
  "Material_Prices.effective_date": "Date the price starts to apply",
  "Material_Prices.price_terms": "Delivery terms, VAT, payment...",
  "Projects.quote_date": "Date the quotation was issued",
  "Projects.contract_date": "Leave blank if not signed",
  "Projects.job_no": "Internal job number once the project becomes a job; blank while still at bid stage",
  "Projects.sell_currency": "Currency of the unit selling prices",
  "Projects.cost_currency": "Currency used to enter item unit costs",
  "Projects.fx_date": "Date used to look up FX rates for the project",
  "Projects.owner": "Estimator / person responsible for the quotation",
  "Project_Items.stage": "Bid or Job. A project can hold both a bid row and a job row for the same item. Pick from Config > Stage",
  "Project_Items.cost_material": "Material cost per unit, in the project's cost currency",
  "Project_Items.cost_other": "Other cost per unit (explain in Notes). Freight is NOT entered here but in Project_Freight",
  "Project_Items.unit_sell": "Item unit selling price in the project's selling currency",
  "Project_Freight.incoterm": "Delivery term that this freight cost corresponds to. Pick from Config > Incoterm",
  "Project_Freight.cost_basis": "What the cost in the next column is charged per. Pick from Config > Freight cost basis",
  "Project_Inputs_Bid.specification": "Material spec used for the project. Write it identically in the Bid and Job sheets so they can be compared",
  "Project_Inputs_Bid.price_id": "Row in Material_Prices used for comparison (optional)",
  "Project_Inputs_Job.specification": "Material spec used for the project. Write it identically in the Bid and Job sheets so they can be compared",
  "Project_Inputs_Job.price_date": "Date the actual price was fixed / purchased; used to look up the FX rate of this row",
  "Project_Inputs_Job.price_id": "Row in Material_Prices used for comparison (optional)"
};
