/**
 * 01_Config.gs — Cấu hình & lược đồ dữ liệu (schema) của LSB Cost Input.
 *
 * File này được SINH TỰ ĐỘNG bằng tools/gen_config.py từ Cost_Input_Database_Part2_R03_EN.xlsx + tools/app_spec.json.
 * Muốn đổi: sửa tools/app_spec.json (hoặc file xlsx) rồi chạy lại
 *   python3 tools/extract_xlsx.py <file.xlsx> && python3 tools/gen_config.py <file.xlsx>
 * Không sửa tay phần SCHEMA / LISTS (lần sinh sau sẽ ghi đè).
 *
 * Quy ước cột trong SCHEMA:
 *   key: 'PK' | 'FK'      ref: bảng cha của FK; soft: true = mã không tồn tại chỉ CẢNH BÁO
 *   auto: true            cột công thức (xám) — app KHÔNG ghi đè
 *   list: tên danh mục    lấy giá trị từ LISTS (cho phép giá trị khác, chỉ cảnh báo)
 *   required / unique     bắt buộc / không trùng (quan hệ 1 : 0..1)
 *   pct                   lưu dạng tỷ lệ (0.3 = 30%), giao diện nhập theo %
 *   money / format(url|email) / long (ô nhập nhiều dòng) / min / max
 *   calc: { type: 'mul'|'addDays', src, by }  để trống → app tự tính từ cột src và hằng số APP[by]
 * Thuộc tính bảng: label, prefix + idStyle ('year' → XX-2026-001 | 'catalog' → XX-001) + idDigits (số chữ số, mặc định 3), pk, display,
 *   labelCols (nhãn trong ô chọn FK), listCols (cột ở trang danh sách), parentFk (FK cha chính — lọc lựa chọn,
 *   đánh số *_no), groupCol, dateCol (lọc theo năm), view360 (có trang 360°).
 */

var APP = {
  "NAME": "LSB Cost Input",
  "BRAND": "LSB Cost Input",
  "SUBTITLE": [
    "Giá đầu vào: vật tư, sản xuất, vận tải",
    "Input costs: materials, production, transport"
  ],
  "VERSION": "1.0.0",
  "SCHEMA_VERSION": "Cost_Input_Database_Part2_R03_EN",
  "MENU_TITLE": "LSB Cost App",
  "PREFIX": "",
  "SPREADSHEET_ID": "",
  "TIMEZONE": "Asia/Ho_Chi_Minh",
  "HEADER_ROW": 2,
  "FIRST_DATA_ROW": 4,
  "LISTS_SOURCE": {
    "sheet": "Config",
    "headerRow": 7,
    "firstRow": 8,
    "lastRow": 107
  },
  "LOG_SHEET": "Activity_log",
  "LOCK_TIMEOUT_MS": 20000,
  "ALERT_DAYS": 14,
  "ACTIVITY_PAGE_SIZE": 200,
  "FEATURES": {
    "AUTH": true,
    "ACTIVITY": true,
    "ALERTS": true,
    "VIEW360": true
  },
  "STAFF": {
    "table": "Staff",
    "id": "staff_id",
    "email": "email",
    "name": "full_name",
    "access": "access_level",
    "active": "active",
    "role": ""
  },
  "CONSTS": {}
};

/** Cấp quyền: số lớn hơn = quyền cao hơn. */
var ROLE_LEVEL = { Viewer: 1, Editor: 2, Admin: 3 };

/** Quyền tối thiểu cho từng loại thao tác. */
var PERMISSION = {
  READ: 'Viewer',
  WRITE: 'Editor',
  DELETE: 'Admin',
  CATALOG_WRITE: 'Admin',
  ACTIVITY_READ: 'Editor'
};

/** Bảng danh mục — chỉ Admin được thêm/sửa, giữ cột bắt buộc. */
var CATALOG_TABLES = [
  "FX_Rates",
  "Staff"
];

/** Sheet nhật ký thay đổi (08_Activity.gs tự tạo nếu chưa có). */
var ACTIVITY_COLUMNS = ['Log_id', 'Timestamp', 'User_email', 'Staff_id', 'Action',
  'Table_name', 'Record_id', 'Changed_fields', 'Detail'];

/** Menu bên trái: nhóm → mục (route 'entity' = danh sách + 360°; 'catalog' = bảng danh mục; route khác = trang riêng). */
var MENU = [
  {
    "group": [
      "Vật tư",
      "Materials"
    ],
    "items": [
      {
        "route": "mat",
        "label": [
          "Bảng giá vật tư",
          "Material prices"
        ],
        "icon": "◫"
      }
    ]
  },
  {
    "group": [
      "Sản xuất",
      "Production"
    ],
    "items": [
      {
        "table": "Prod_Process_Rates",
        "icon": "⚙"
      },
      {
        "table": "Prod_Subcontract",
        "icon": "⇄"
      },
      {
        "table": "Prod_Capacity",
        "icon": "▤"
      }
    ]
  },
  {
    "group": [
      "Vận tải",
      "Transport"
    ],
    "items": [
      {
        "table": "Trans_Sea",
        "icon": "⛴"
      },
      {
        "table": "Trans_Inland_Origin",
        "icon": "⇢"
      },
      {
        "table": "Trans_Inland_Dest",
        "icon": "⇠"
      },
      {
        "table": "Trans_Local_Charges",
        "icon": "¤"
      }
    ]
  },
  {
    "group": [
      "Danh mục",
      "Master data"
    ],
    "items": [
      {
        "table": "Suppliers",
        "icon": "☖"
      },
      {
        "table": "Ports",
        "icon": "⚓"
      },
      {
        "table": "Processes",
        "icon": "⚒"
      },
      {
        "table": "FX_Rates",
        "icon": "$"
      },
      {
        "route": "lists",
        "label": [
          "Danh sách chọn",
          "Dropdown lists"
        ],
        "icon": "≡"
      },
      {
        "table": "Staff",
        "icon": "☺"
      }
    ]
  }
];

/** Cặp ngày [trước, sau] — ngày sau không được sớm hơn ngày trước (áp cho mọi bảng có đủ 2 cột). */
var DATE_ORDER_RULES = [
  [
    "effective_date",
    "valid_until"
  ]
];

/** Cảnh báo theo hạn (Notification.gs). */
var ALERT_RULES = [];

/** Dashboard dùng chung (05_Dashboard.gs). */
var DASHBOARD = {
  "kpiTables": [],
  "metrics": [],
  "providers": [
    "Cost_board_"
  ]
};

/** Cột "nên có" thêm vào cờ Thiếu dữ liệu; cột tự tính thêm (10_Form.gs). */
var FORM_NEED_EXTRA = {};
var FORM_CALC_EXTRA = {};

/** Cột tự điền = Staff_id người đang dùng app khi để trống; giá trị mặc định khi thêm mới (04_Entity.gs). */
var AUTO_USER_COLS = {};
var DEFAULTS = {};

/**
 * Điểm nối module riêng (tên hàm toàn cục). Module nghiệp vụ (vd 20_Project.gs) thêm tên hàm của mình vào đây.
 *  HOOK_PROVIDERS   → { bảng: { beforeSave, afterSave, beforeDelete } }   (Entity_hooks_, User_hooks_ luôn có)
 *  ROUTE_PROVIDERS  → { 'module.action': { role, fn } }
 *  RELATED_PROVIDERS(table, record) → giá trị thêm cho form tự điền
 *  ENTITY_EXTRA_PROVIDERS(table, record) → dữ liệu thêm cho trang 360°
 *  ALERT_PROVIDERS(user, p) → [cảnh báo]      CHECK_PROVIDERS() → [điểm lệch dữ liệu]
 */
var HOOK_PROVIDERS = [
  "Entity_hooks_",
  "User_hooks_",
  "Cost_hooks_"
];
var ROUTE_PROVIDERS = [
  "Cost_routes_"
];
var RELATED_PROVIDERS = [];
var ENTITY_EXTRA_PROVIDERS = [
  "Cost_extra360_"
];
var ALERT_PROVIDERS = [
  "Cost_alerts_"
];
var CHECK_PROVIDERS = [
  "Cost_checks_"
];

var LISTS = {
  "Currency": [
    "VND",
    "USD",
    "IDR",
    "Peso"
  ],
  "Unit": [
    "kg",
    "ton",
    "m",
    "m2",
    "pc",
    "liter"
  ],
  "Supplier type": [
    "Material supplier",
    "Subcontractor",
    "Carrier / forwarder",
    "Trucker",
    "Customs broker"
  ],
  "Factory / plant": [
    "Factory 1 (example)"
  ],
  "Container / cargo type": [
    "20' GP",
    "40' GP",
    "40' HC",
    "40' OT",
    "40' FR",
    "Breakbulk"
  ],
  "Rate basis": [
    "per container",
    "per ton",
    "per CBM",
    "per trip",
    "per shipment",
    "per B/L",
    "lump sum",
    "% of cargo value"
  ],
  "Vehicle type": [
    "Container trailer 20'",
    "Container trailer 40'",
    "Flatbed truck",
    "Truck"
  ],
  "Local charge type": [
    "THC",
    "Documentation / B/L fee",
    "Seal fee",
    "Lift on / lift off",
    "Customs clearance",
    "Cargo insurance",
    "Import duty / tax"
  ],
  "Charge side": [
    "Origin",
    "Destination"
  ],
  "Incoterm": [
    "EXW",
    "FCA",
    "FAS",
    "FOB",
    "CFR",
    "CIF",
    "CPT",
    "CIP",
    "DAP",
    "DPU",
    "DDP"
  ],
  "Destination type": [
    "Port",
    "Site"
  ],
  "Capacity period": [
    "day",
    "week",
    "month"
  ],
  "Document type": [
    "Quotation",
    "Price list",
    "Datasheet / TDS",
    "Mill certificate",
    "Drawing",
    "Email / correspondence",
    "Other"
  ],
  "Access level": [
    "Viewer",
    "Editor",
    "Admin"
  ],
  "Active": [
    "Y",
    "N"
  ]
};

var SCHEMA = {
  "Suppliers": {
    "label": "Nhà cung cấp",
    "prefix": "SUP",
    "idStyle": "catalog",
    "idDigits": 4,
    "pk": "supplier_id",
    "display": "supplier_name",
    "labelCols": [
      "supplier_name"
    ],
    "listCols": [
      "supplier_id",
      "supplier_name",
      "supplier_type",
      "country",
      "contact"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": true,
    "columns": [
      {
        "name": "supplier_id",
        "type": "string",
        "key": "PK",
        "note": "Mã NCC duy nhất (app tự cấp SUP-xxxx)"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "required": true,
        "note": "Tên đầy đủ của NCC"
      },
      {
        "name": "supplier_type",
        "type": "string",
        "list": "Supplier type",
        "required": true,
        "note": "Chọn từ Config › Supplier type"
      },
      {
        "name": "country",
        "type": "string",
        "note": "Quốc gia của NCC"
      },
      {
        "name": "contact",
        "type": "string",
        "note": "Người liên hệ / email / điện thoại"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Ports": {
    "label": "Cảng",
    "prefix": "PORT",
    "idStyle": "catalog",
    "idDigits": 2,
    "pk": "port_code",
    "display": "port_name",
    "labelCols": [
      "port_name"
    ],
    "listCols": [
      "port_code",
      "port_name",
      "country",
      "market_id"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": true,
    "columns": [
      {
        "name": "port_code",
        "type": "string",
        "key": "PK",
        "note": "Mã cảng duy nhất (mã nội bộ hoặc UN/LOCODE)"
      },
      {
        "name": "port_name",
        "type": "string",
        "required": true,
        "note": "Tên cảng"
      },
      {
        "name": "country",
        "type": "string",
        "note": "Quốc gia của cảng"
      },
      {
        "name": "market_id",
        "type": "string",
        "note": "Tùy chọn: mã thị trường ở database Part 1"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Processes": {
    "label": "Công đoạn",
    "prefix": "PRO",
    "idStyle": "catalog",
    "idDigits": 2,
    "pk": "process_id",
    "display": "process_name",
    "labelCols": [
      "process_name"
    ],
    "listCols": [
      "process_id",
      "process_name",
      "description"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": true,
    "columns": [
      {
        "name": "process_id",
        "type": "string",
        "key": "PK",
        "note": "Mã công đoạn duy nhất"
      },
      {
        "name": "process_name",
        "type": "string",
        "required": true,
        "note": "Công đoạn / bước sản xuất"
      },
      {
        "name": "description",
        "type": "string",
        "long": true,
        "note": "Nội dung công đoạn"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "FX_Rates": {
    "label": "Tỷ giá",
    "prefix": "FX",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "fx_id",
    "display": "currency",
    "labelCols": [
      "currency",
      "effective_date"
    ],
    "listCols": [
      "fx_id",
      "effective_date",
      "currency",
      "rate",
      "base_currency",
      "source"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Tỷ giá áp dụng từ ngày này tới khi có dòng mới hơn"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ cần quy đổi (khác tiền gốc)"
      },
      {
        "name": "base_currency",
        "type": "string",
        "auto": true,
        "note": "Lấy từ tiền gốc ở Config"
      },
      {
        "name": "rate",
        "type": "number",
        "required": true,
        "min": 1e-06,
        "max": 1000000000000.0,
        "note": "Ví dụ: 1 USD = 26.000 VND thì nhập 26000"
      },
      {
        "name": "source",
        "type": "string",
        "note": "Ngân hàng / nguồn công bố"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      },
      {
        "name": "fx_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng tỷ giá (FX-00001) do app cấp; ngày + tiền tệ vẫn không được trùng"
      }
    ]
  },
  "Mat_SteelPlate": {
    "label": "Thép tấm",
    "prefix": "MSP",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_grade",
      "spec_standard",
      "spec_thickness_mm",
      "spec_width_mm",
      "spec_length_mm",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_standard",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_thickness_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_width_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_length_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_SteelSections": {
    "label": "Thép hình",
    "prefix": "MSS",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_section_type",
      "spec_section_size",
      "spec_grade",
      "spec_standard",
      "spec_length_m",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_section_type",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_section_size",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_standard",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_length_m",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_SteelSheeting": {
    "label": "Tôn",
    "prefix": "MSH",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_base_grade",
      "spec_thickness_mm",
      "spec_coating",
      "spec_paint_color",
      "spec_coil_width_mm",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_base_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_thickness_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_coating",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_paint_color",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_coil_width_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_AnchorBolts": {
    "label": "Bu lông neo",
    "prefix": "MAB",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_diameter",
      "spec_length_mm",
      "spec_grade",
      "spec_standard",
      "spec_finish",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_diameter",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_length_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_standard",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_finish",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_Paint": {
    "label": "Sơn",
    "prefix": "MPT",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_paint_type",
      "spec_product",
      "spec_color",
      "spec_volume_solids_pct",
      "spec_pack_size",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_paint_type",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_product",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_color",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_volume_solids_pct",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_pack_size",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_CF_Purlins": {
    "label": "Xà gồ cán nguội",
    "prefix": "MCP",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_profile",
      "spec_section_size",
      "spec_thickness_mm",
      "spec_grade",
      "spec_coating",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_profile",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_section_size",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_thickness_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_coating",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_RodBracing": {
    "label": "Giằng thanh",
    "prefix": "MRB",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_diameter_mm",
      "spec_grade",
      "spec_standard",
      "spec_finish",
      "spec_length_mm",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_diameter_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_standard",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_finish",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_length_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_Insulation": {
    "label": "Bông cách nhiệt",
    "prefix": "MIN",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_material_type",
      "spec_thickness_mm",
      "spec_density_kg_m3",
      "spec_facing",
      "spec_roll_size",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_material_type",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_thickness_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_density_kg_m3",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_facing",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_roll_size",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_CF_Bracing": {
    "label": "Giằng cán nguội",
    "prefix": "MCB",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_profile",
      "spec_section_size",
      "spec_thickness_mm",
      "spec_grade",
      "spec_coating",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_profile",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_section_size",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_thickness_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_coating",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_ConnBolts": {
    "label": "Bu lông liên kết",
    "prefix": "MCN",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_diameter",
      "spec_length_mm",
      "spec_grade",
      "spec_standard",
      "spec_finish",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_diameter",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_length_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_standard",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_finish",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_CableBracing": {
    "label": "Giằng cáp",
    "prefix": "MCA",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_diameter_mm",
      "spec_construction",
      "spec_grade",
      "spec_finish",
      "spec_fittings",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_diameter_mm",
        "type": "number",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_construction",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_grade",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_finish",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_fittings",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Mat_Accessories": {
    "label": "Phụ kiện",
    "prefix": "MAC",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "description",
    "labelCols": [
      "description"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "description",
      "spec_accessory_type",
      "spec_size",
      "spec_material",
      "spec_finish",
      "spec_standard",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base",
      "doc1_url"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "NCC vật tư — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true,
        "note": "Cố định theo sheet"
      },
      {
        "name": "material_id",
        "type": "string",
        "note": "Tùy chọn: mã vật tư ở database Part 1"
      },
      {
        "name": "description",
        "type": "string",
        "required": true,
        "note": "Mô tả ngắn vật tư được báo giá"
      },
      {
        "name": "spec_accessory_type",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_size",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_material",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_finish",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "spec_standard",
        "type": "string",
        "note": "Thông số riêng của nhóm, quyết định giá"
      },
      {
        "name": "origin_country",
        "type": "string",
        "note": "Nơi sản xuất vật tư"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá báo theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "Điều kiện giao của giá — chọn từ Config › Incoterm"
      },
      {
        "name": "delivery_place",
        "type": "string",
        "note": "Địa điểm theo điều kiện giá (kho NCC, cảng, nhà máy mình…)"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng đặt tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian NCC giao hàng (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "doc1_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc1_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc1_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "doc2_type",
        "type": "string",
        "list": "Document type",
        "note": "Loại tài liệu — chọn từ Config › Document type"
      },
      {
        "name": "doc2_url",
        "type": "string",
        "note": "Link đầy đủ: link chia sẻ SharePoint / OneDrive / Google Drive, URL, hoặc đường dẫn mạng (\\\\server\\thư mục\\file.pdf)"
      },
      {
        "name": "doc2_open",
        "type": "string",
        "auto": true,
        "note": "Bấm để mở link ở cột bên trái"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Prod_Process_Rates": {
    "label": "Đơn giá công đoạn (tự làm)",
    "prefix": "PPR",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "process_id",
    "labelCols": [
      "process_id",
      "product_type"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "factory",
      "process_id",
      "product_type",
      "unit",
      "currency",
      "unit_rate",
      "unit_rate_base"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "factory",
        "type": "string",
        "list": "Factory / plant",
        "required": true,
        "note": "Chọn từ Config › Factory / plant"
      },
      {
        "name": "process_id",
        "type": "string",
        "key": "FK",
        "ref": "Processes",
        "soft": true,
        "required": true,
        "note": "Chọn từ Công đoạn"
      },
      {
        "name": "process_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Công đoạn"
      },
      {
        "name": "product_type",
        "type": "string",
        "required": true,
        "note": "Loại sản phẩm / cấu kiện áp dụng số liệu"
      },
      {
        "name": "item_id",
        "type": "string",
        "note": "Tùy chọn: mã hạng mục ở database Part 1"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ — chọn từ Config › Currency"
      },
      {
        "name": "cost_labor",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Chi phí nhân công trực tiếp / ĐVT"
      },
      {
        "name": "cost_machine",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Chi phí máy / thiết bị / ĐVT (khấu hao, năng lượng, bảo trì)"
      },
      {
        "name": "cost_consumables",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Vật tư tiêu hao / ĐVT (khí, dây hàn, hạt mài…)"
      },
      {
        "name": "cost_overhead",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Chi phí chung nhà máy / ĐVT"
      },
      {
        "name": "unit_rate",
        "type": "number",
        "auto": true,
        "note": "Nhân công + Máy + Tiêu hao + Chi phí chung"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_rate_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "labor_share",
        "type": "number",
        "auto": true,
        "pct": true,
        "min": 0,
        "max": 1,
        "note": "Nhân công / đơn giá"
      },
      {
        "name": "machine_share",
        "type": "number",
        "auto": true,
        "pct": true,
        "min": 0,
        "max": 1,
        "note": "Máy / đơn giá"
      },
      {
        "name": "consumables_share",
        "type": "number",
        "auto": true,
        "pct": true,
        "min": 0,
        "max": 1,
        "note": "Tiêu hao / đơn giá"
      },
      {
        "name": "overhead_share",
        "type": "number",
        "auto": true,
        "pct": true,
        "min": 0,
        "max": 1,
        "note": "Chi phí chung / đơn giá"
      },
      {
        "name": "source",
        "type": "string",
        "note": "Nguồn số liệu (tính giá thành, ngân sách, tài chính…)"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Prod_Subcontract": {
    "label": "Giá thuê ngoài",
    "prefix": "PSC",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "process_id",
    "labelCols": [
      "process_id",
      "product_type"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "process_id",
      "product_type",
      "unit",
      "currency",
      "unit_price",
      "unit_price_base"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "Nhà thầu phụ — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "process_id",
        "type": "string",
        "key": "FK",
        "ref": "Processes",
        "soft": true,
        "required": true,
        "note": "Chọn từ Công đoạn"
      },
      {
        "name": "process_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Công đoạn"
      },
      {
        "name": "product_type",
        "type": "string",
        "required": true,
        "note": "Loại sản phẩm / cấu kiện áp dụng số liệu"
      },
      {
        "name": "item_id",
        "type": "string",
        "note": "Tùy chọn: mã hạng mục ở database Part 1"
      },
      {
        "name": "scope",
        "type": "string",
        "long": true,
        "note": "Giá thuê ngoài gồm / không gồm gì"
      },
      {
        "name": "material_supplied_by",
        "type": "string",
        "note": "Ai cấp vật tư chính (mình / nhà thầu phụ)"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT của đơn giá — chọn từ Config › Unit"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Đơn giá nhà thầu phụ theo nguyên tệ / ĐVT"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "moq",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số lượng tối thiểu, theo ĐVT của giá"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian thực hiện của nhà thầu phụ (ngày)"
      },
      {
        "name": "payment_terms",
        "type": "string",
        "note": "Điều khoản thanh toán của báo giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Prod_Capacity": {
    "label": "Năng lực sản xuất",
    "prefix": "PCP",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "process_id",
    "labelCols": [
      "process_id",
      "product_type"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "factory",
      "process_id",
      "product_type",
      "unit",
      "capacity_qty",
      "capacity_period",
      "lead_time_days"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Số liệu áp dụng từ ngày"
      },
      {
        "name": "factory",
        "type": "string",
        "list": "Factory / plant",
        "required": true,
        "note": "Chọn từ Config › Factory / plant"
      },
      {
        "name": "process_id",
        "type": "string",
        "key": "FK",
        "ref": "Processes",
        "soft": true,
        "required": true,
        "note": "Chọn từ Công đoạn"
      },
      {
        "name": "process_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Công đoạn"
      },
      {
        "name": "product_type",
        "type": "string",
        "required": true,
        "note": "Loại sản phẩm / cấu kiện áp dụng số liệu"
      },
      {
        "name": "item_id",
        "type": "string",
        "note": "Tùy chọn: mã hạng mục ở database Part 1"
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "ĐVT cho năng lực và giờ / ĐVT — chọn từ Config › Unit"
      },
      {
        "name": "capacity_qty",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Sản lượng tối đa mỗi kỳ"
      },
      {
        "name": "capacity_period",
        "type": "string",
        "list": "Capacity period",
        "note": "Chọn từ Config › Capacity period"
      },
      {
        "name": "manhours_per_unit",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Giờ công định mức / ĐVT"
      },
      {
        "name": "machinehours_per_unit",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Giờ máy định mức / ĐVT"
      },
      {
        "name": "lead_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian sản xuất định mức của công đoạn (ngày)"
      },
      {
        "name": "source",
        "type": "string",
        "note": "Nguồn số liệu"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Trans_Sea": {
    "label": "Cước biển",
    "prefix": "TSF",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "pol",
    "labelCols": [
      "pol",
      "pod",
      "cargo_type"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "pol",
      "pod",
      "cargo_type",
      "rate_basis",
      "currency",
      "total_rate",
      "total_rate_base",
      "transit_days"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "Hãng tàu hoặc forwarder — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "pol",
        "type": "string",
        "key": "FK",
        "ref": "Ports",
        "soft": true,
        "required": true,
        "note": "Cảng xếp hàng — chọn từ Cảng"
      },
      {
        "name": "pol_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Cảng"
      },
      {
        "name": "pod",
        "type": "string",
        "key": "FK",
        "ref": "Ports",
        "soft": true,
        "required": true,
        "note": "Cảng dỡ hàng — chọn từ Cảng"
      },
      {
        "name": "pod_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Cảng"
      },
      {
        "name": "cargo_type",
        "type": "string",
        "list": "Container / cargo type",
        "required": true,
        "note": "Chọn từ Config › Container / cargo type"
      },
      {
        "name": "rate_basis",
        "type": "string",
        "list": "Rate basis",
        "required": true,
        "note": "Số tiền tính theo đơn vị nào — chọn từ Config › Rate basis"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ — chọn từ Config › Currency"
      },
      {
        "name": "ocean_freight",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Cước biển cơ bản theo cách tính"
      },
      {
        "name": "surcharges",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Phụ phí hãng tàu (BAF, mùa cao điểm…) nếu báo riêng"
      },
      {
        "name": "total_rate",
        "type": "number",
        "auto": true,
        "note": "Cước biển + phụ phí"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "total_rate_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "transit_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian cảng tới cảng (ngày)"
      },
      {
        "name": "free_time_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số ngày miễn phí lưu cont / lưu bãi tại đích"
      },
      {
        "name": "service",
        "type": "string",
        "note": "Đi thẳng hay chuyển tải, tuyến"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Trans_Inland_Origin": {
    "label": "Nội địa đầu đi",
    "prefix": "TIO",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "from_place",
    "labelCols": [
      "from_place",
      "vehicle_type"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "from_place",
      "destination_type",
      "to_port",
      "to_site",
      "vehicle_type",
      "rate_basis",
      "currency",
      "rate",
      "rate_base"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "Nhà xe — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "from_place",
        "type": "string",
        "required": true,
        "note": "Nơi lấy hàng"
      },
      {
        "name": "destination_type",
        "type": "string",
        "list": "Destination type",
        "required": true,
        "note": "Cảng hoặc công trình — chọn từ Config › Destination type"
      },
      {
        "name": "to_port",
        "type": "string",
        "key": "FK",
        "ref": "Ports",
        "soft": true,
        "note": "Cảng đến khi loại điểm đến là Port — chọn từ Cảng"
      },
      {
        "name": "to_port_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Cảng"
      },
      {
        "name": "to_site",
        "type": "string",
        "note": "Địa chỉ / thành phố công trình khi loại điểm đến là Site"
      },
      {
        "name": "vehicle_type",
        "type": "string",
        "list": "Vehicle type",
        "required": true,
        "note": "Chọn từ Config › Vehicle type"
      },
      {
        "name": "rate_basis",
        "type": "string",
        "list": "Rate basis",
        "required": true,
        "note": "Số tiền tính theo đơn vị nào — chọn từ Config › Rate basis"
      },
      {
        "name": "distance_km",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Quãng đường (km)"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "rate",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Cước vận chuyển nội địa theo cách tính"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "rate_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "transit_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian vận chuyển tận nơi (ngày)"
      },
      {
        "name": "includes",
        "type": "string",
        "long": true,
        "note": "Giá đã gồm (bốc xếp, phí đường, giấy phép, dẫn đường…)"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Trans_Inland_Dest": {
    "label": "Nội địa đầu đến",
    "prefix": "TID",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "to_site",
    "labelCols": [
      "to_site",
      "vehicle_type"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "from_port",
      "country",
      "to_site",
      "vehicle_type",
      "rate_basis",
      "currency",
      "rate",
      "rate_base"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "Nhà xe — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "from_port",
        "type": "string",
        "key": "FK",
        "ref": "Ports",
        "soft": true,
        "required": true,
        "note": "Cảng đích nơi nhận hàng — chọn từ Cảng"
      },
      {
        "name": "from_port_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Cảng"
      },
      {
        "name": "country",
        "type": "string",
        "required": true,
        "note": "Nước nhập khẩu"
      },
      {
        "name": "to_site",
        "type": "string",
        "required": true,
        "note": "Địa chỉ / thành phố công trình"
      },
      {
        "name": "vehicle_type",
        "type": "string",
        "list": "Vehicle type",
        "required": true,
        "note": "Chọn từ Config › Vehicle type"
      },
      {
        "name": "rate_basis",
        "type": "string",
        "list": "Rate basis",
        "required": true,
        "note": "Số tiền tính theo đơn vị nào — chọn từ Config › Rate basis"
      },
      {
        "name": "distance_km",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Quãng đường (km)"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "rate",
        "type": "number",
        "required": true,
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Cước vận chuyển nội địa theo cách tính"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "rate_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "transit_days",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Thời gian vận chuyển tận nơi (ngày)"
      },
      {
        "name": "includes",
        "type": "string",
        "long": true,
        "note": "Giá đã gồm (bốc xếp, phí đường, giấy phép, dẫn đường…)"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Trans_Local_Charges": {
    "label": "Phí địa phương",
    "prefix": "TLC",
    "idStyle": "catalog",
    "idDigits": 5,
    "pk": "record_id",
    "display": "charge_type",
    "labelCols": [
      "charge_type",
      "port"
    ],
    "listCols": [
      "record_id",
      "effective_date",
      "validity_status",
      "supplier_id",
      "side",
      "port",
      "charge_type",
      "cargo_type",
      "rate_basis",
      "currency",
      "amount",
      "percent_rate",
      "amount_base"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "record_id",
        "type": "string",
        "key": "PK",
        "note": "Mã dòng duy nhất (app tự cấp)"
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày báo giá hoặc ngày giá bắt đầu áp dụng; dùng để tra tỷ giá"
      },
      {
        "name": "valid_until",
        "type": "date",
        "note": "Ngày cuối giá còn hiệu lực; để trống nếu không thời hạn"
      },
      {
        "name": "validity_status",
        "type": "string",
        "auto": true,
        "note": "Valid / Expired so với hôm nay; trống khi không có ngày hết hạn"
      },
      {
        "name": "supplier_id",
        "type": "string",
        "key": "FK",
        "ref": "Suppliers",
        "soft": true,
        "required": true,
        "note": "Forwarder, hãng tàu hoặc đại lý hải quan — chọn từ Nhà cung cấp"
      },
      {
        "name": "supplier_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Nhà cung cấp"
      },
      {
        "name": "side",
        "type": "string",
        "list": "Charge side",
        "required": true,
        "note": "Đầu đi hoặc đầu đến — chọn từ Config › Charge side"
      },
      {
        "name": "port",
        "type": "string",
        "key": "FK",
        "ref": "Ports",
        "soft": true,
        "required": true,
        "note": "Cảng phát sinh phí — chọn từ Cảng"
      },
      {
        "name": "port_name",
        "type": "string",
        "auto": true,
        "note": "Tra từ Cảng"
      },
      {
        "name": "charge_type",
        "type": "string",
        "list": "Local charge type",
        "required": true,
        "note": "Chọn từ Config › Local charge type"
      },
      {
        "name": "cargo_type",
        "type": "string",
        "list": "Container / cargo type",
        "note": "Chọn từ Config › Container / cargo type"
      },
      {
        "name": "rate_basis",
        "type": "string",
        "list": "Rate basis",
        "required": true,
        "note": "Số tiền tính theo đơn vị nào — chọn từ Config › Rate basis"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá — chọn từ Config › Currency"
      },
      {
        "name": "amount",
        "type": "number",
        "min": 0,
        "max": 1000000000000000.0,
        "note": "Số tiền theo cách tính; để trống nếu phí tính theo %"
      },
      {
        "name": "percent_rate",
        "type": "number",
        "min": 0,
        "max": 100,
        "note": "Chỉ cho phí tính theo % (bảo hiểm, thuế…): nhập 0.5 nghĩa là 0,5%"
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true,
        "note": "Tỷ giá mới nhất có ngày ≤ ngày báo giá (từ Tỷ giá); tiền gốc = 1"
      },
      {
        "name": "amount_base",
        "type": "number",
        "auto": true,
        "note": "Giá × tỷ giá"
      },
      {
        "name": "quotation_ref",
        "type": "string",
        "note": "Số báo giá / chứng từ"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  },
  "Staff": {
    "label": "Người dùng app",
    "prefix": "STF",
    "idStyle": "catalog",
    "idDigits": 3,
    "pk": "staff_id",
    "display": "full_name",
    "labelCols": [
      "full_name"
    ],
    "listCols": [
      "staff_id",
      "full_name",
      "email",
      "access_level",
      "active"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "staff_id",
        "type": "string",
        "key": "PK",
        "note": "Mã người dùng (STF-001) do app cấp"
      },
      {
        "name": "full_name",
        "type": "string",
        "required": true,
        "note": "Tên hiện trong app và nhật ký"
      },
      {
        "name": "email",
        "type": "string",
        "required": true,
        "unique": true,
        "format": "email",
        "note": "Tài khoản Google dùng để mở app"
      },
      {
        "name": "access_level",
        "type": "string",
        "list": "Access level",
        "required": true,
        "note": "Viewer = chỉ xem; Editor = nhập báo giá, NCC, cảng, công đoạn; Admin = thêm tỷ giá, danh sách Config, người dùng, xóa"
      },
      {
        "name": "active",
        "type": "string",
        "list": "Active",
        "required": true,
        "note": "N = tạm khóa tài khoản"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true,
        "note": "Ghi chú"
      }
    ]
  }
};

/* ------------------------------------------------------------------ */

/** Trả về định nghĩa bảng; báo lỗi nếu tên bảng không có trong SCHEMA. */
function Config_table_(name) {
  var t = SCHEMA[name];
  if (!t) throw AppError_('NOT_FOUND', L_('Không có bảng "', 'No table "') + name + L_('" trong cấu hình.', '" in the configuration.'));
  return t;
}

/** Map tên cột → định nghĩa cột. */
function Config_columnMap_(name) {
  var map = {};
  Config_table_(name).columns.forEach(function (c) { map[c.name] = c; });
  return map;
}

/** Danh sách [bảng con, cột FK] trỏ tới bảng `parent`. */
function Config_children_(parent) {
  var out = [];
  Object.keys(SCHEMA).forEach(function (t) {
    SCHEMA[t].columns.forEach(function (c) {
      if (c.key === 'FK' && c.ref === parent) out.push({ table: t, column: c.name });
    });
  });
  return out;
}

/** Bản schema gửi xuống trình duyệt (không có gì bí mật, chỉ rút gọn). */
function Config_clientSchema_() {
  var consts = {};
  Object.keys(APP.CONSTS || {}).forEach(function (k) { consts[k] = APP.CONSTS[k]; });
  return { app: { name: APP.NAME, brand: APP.BRAND, subtitle: APP.SUBTITLE, version: APP.VERSION, schema: APP.SCHEMA_VERSION,
      logSheet: APP.LOG_SHEET, features: APP.FEATURES },
    tables: SCHEMA, lists: Config_lists_(), catalogs: CATALOG_TABLES, menu: MENU, staffTable: APP.STAFF.table, defaults: DEFAULTS,
    roles: ROLE_LEVEL, permission: PERMISSION, consts: consts };
}
