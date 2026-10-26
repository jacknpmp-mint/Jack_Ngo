/**
 * 01_Config.gs — Cấu hình & lược đồ dữ liệu (schema) của LSB Selling Price DB.
 *
 * File này được SINH TỰ ĐỘNG bằng tools/gen_config.py từ Selling_Price_Database_R05_EN.xlsx + tools/app_spec.json.
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
 * Thuộc tính bảng: label, prefix + idStyle ('year' → XX-2026-001 | 'catalog' → XX-001 | 'seq' → XX-0001, số chữ số = idWidth), pk, display,
 *   labelCols (nhãn trong ô chọn FK), listCols (cột ở trang danh sách), parentFk (FK cha chính — lọc lựa chọn,
 *   đánh số *_no), groupCol, dateCol (lọc theo năm), view360 (có trang 360°).
 */

var APP = {
  "NAME": "LSB Selling Price DB",
  "BRAND": "LSB Selling Price DB",
  "SUBTITLE": [
    "Giá bán theo dự án",
    "Project selling prices"
  ],
  "VERSION": "1.0.0",
  "SCHEMA_VERSION": "Selling_Price_Database_R05_EN",
  "MENU_TITLE": "LSB Price App",
  "PREFIX": "",
  "SPREADSHEET_ID": "",
  "TIMEZONE": "Asia/Ho_Chi_Minh",
  "HEADER_ROW": 2,
  "FIRST_DATA_ROW": 4,
  "LOG_SHEET": "Activity_log",
  "LOCK_TIMEOUT_MS": 20000,
  "ALERT_DAYS": 7,
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
    "role": "job_role"
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
  "Staff",
  "Markets",
  "Items",
  "Materials",
  "FX_Rates"
];

/** Sheet nhật ký thay đổi (08_Activity.gs tự tạo nếu chưa có). */
var ACTIVITY_COLUMNS = ['Log_id', 'Timestamp', 'User_email', 'Staff_id', 'Action',
  'Table_name', 'Record_id', 'Changed_fields', 'Detail'];

/** Menu bên trái: nhóm → mục (route 'entity' = danh sách + 360°; 'catalog' = bảng danh mục; route khác = trang riêng). */
var MENU = [
  {
    "group": [
      "Phân tích",
      "Analysis"
    ],
    "items": [
      {
        "route": "price_lookup",
        "label": [
          "Tra cứu giá tham khảo",
          "Price reference"
        ],
        "icon": "⌕"
      },
      {
        "route": "price_summary",
        "label": [
          "Tổng hợp",
          "Summaries"
        ],
        "icon": "▤"
      },
      {
        "route": "bid_job",
        "label": [
          "Bid vs Job",
          "Bid vs Job"
        ],
        "icon": "⇄"
      }
    ]
  },
  {
    "group": [
      "Dự án",
      "Projects"
    ],
    "items": [
      {
        "table": "Projects",
        "icon": "◧"
      },
      {
        "table": "Project_Items",
        "icon": "▪"
      },
      {
        "table": "Project_Freight",
        "icon": "⛴"
      },
      {
        "table": "Project_Inputs_Bid",
        "icon": "▫"
      },
      {
        "table": "Project_Inputs_Job",
        "icon": "▫"
      }
    ]
  },
  {
    "group": [
      "Giá & tỷ giá",
      "Prices & FX"
    ],
    "items": [
      {
        "table": "Material_Prices",
        "icon": "₫"
      },
      {
        "table": "FX_Rates",
        "icon": "⇆"
      }
    ]
  },
  {
    "group": [
      "Danh mục",
      "Masters"
    ],
    "items": [
      {
        "table": "Customers",
        "icon": "☺"
      },
      {
        "table": "Markets",
        "icon": "◎"
      },
      {
        "table": "Items",
        "icon": "▦"
      },
      {
        "table": "Materials",
        "icon": "▣"
      },
      {
        "route": "lists",
        "label": [
          "Danh sách chọn (Config)",
          "Dropdown lists (Config)"
        ],
        "icon": "☰"
      },
      {
        "table": "Staff",
        "icon": "⚿"
      }
    ]
  }
];

/** Cặp ngày [trước, sau] — ngày sau không được sớm hơn ngày trước (áp cho mọi bảng có đủ 2 cột). */
var DATE_ORDER_RULES = [];

/** Cảnh báo theo hạn (Notification.gs). */
var ALERT_RULES = [];

/** Dashboard dùng chung (05_Dashboard.gs). */
var DASHBOARD = {
  "kpiTables": [
    "Projects",
    "Project_Items",
    "Project_Inputs_Bid",
    "Project_Inputs_Job",
    "Project_Freight",
    "Material_Prices",
    "Customers",
    "FX_Rates"
  ],
  "metrics": [
    {
      "label": [
        "Dự án báo giá",
        "Projects quoted"
      ],
      "table": "Projects",
      "date": "quote_date",
      "sum": "",
      "where": {}
    },
    {
      "label": [
        "— đang Won",
        "— now Won"
      ],
      "table": "Projects",
      "date": "quote_date",
      "sum": "",
      "where": {
        "status": "Won"
      }
    },
    {
      "label": [
        "— Completed",
        "— Completed"
      ],
      "table": "Projects",
      "date": "quote_date",
      "sum": "",
      "where": {
        "status": "Completed"
      }
    },
    {
      "label": [
        "— Lost",
        "— Lost"
      ],
      "table": "Projects",
      "date": "quote_date",
      "sum": "",
      "where": {
        "status": "Lost"
      }
    }
  ],
  "providers": []
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
  "Spd_hooks_"
];
var ROUTE_PROVIDERS = [
  "Spd_routes_"
];
var RELATED_PROVIDERS = [];
var ENTITY_EXTRA_PROVIDERS = [];
var ALERT_PROVIDERS = [
  "Spd_alerts_"
];
var CHECK_PROVIDERS = [
  "Spd_checks_"
];
/** Chạy đầu mỗi lượt gọi api() (vd nạp danh mục LISTS từ sheet Config). */
var INIT_PROVIDERS = [
  "Spd_init_"
];

var LISTS = {
  "Currency": [
    "VND",
    "USD",
    "IDR",
    "PHP"
  ],
  "Project status": [
    "Quoting",
    "Won",
    "Lost",
    "Completed"
  ],
  "Customer type": [
    "Owner / Investor",
    "General contractor",
    "Dealer"
  ],
  "Material group": [
    "Steel plate",
    "Steel sections",
    "Steel sheeting",
    "Anchor bolts",
    "Paint",
    "Cold-formed steel - purlins",
    "Rod Bracing",
    "Insulation",
    "Cold-formed steel - bracing",
    "Connection bolts",
    "Cable Bracing",
    "Accessories"
  ],
  "Unit": [
    "kg",
    "ton",
    "m",
    "m2",
    "pc",
    "liter"
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
  "Freight cost basis": [
    "ton",
    "kg",
    "20' container",
    "40' container",
    "trip",
    "lump sum"
  ],
  "Stage": [
    "Bid",
    "Job"
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
  "Staff": {
    "label": "Người dùng app",
    "prefix": "ST",
    "idStyle": "seq",
    "idWidth": 3,
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
      "active",
      "job_role"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "staff_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "full_name",
        "type": "string",
        "required": true
      },
      {
        "name": "email",
        "type": "string",
        "required": true,
        "unique": true,
        "format": "email",
        "note": "Tài khoản Google dùng mở Web App."
      },
      {
        "name": "access_level",
        "type": "string",
        "list": "Access level",
        "required": true,
        "note": "Viewer: xem · Editor: thêm/sửa · Admin: + xóa, danh mục, người dùng."
      },
      {
        "name": "active",
        "type": "string",
        "list": "Active",
        "required": true
      },
      {
        "name": "job_role",
        "type": "string"
      },
      {
        "name": "notes",
        "type": "string"
      }
    ]
  },
  "Markets": {
    "label": "Thị trường",
    "prefix": "TT",
    "idStyle": "seq",
    "idWidth": 2,
    "pk": "market_id",
    "display": "market_name",
    "labelCols": [
      "market_name"
    ],
    "listCols": [
      "market_id",
      "market_name",
      "scope",
      "notes"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "market_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "market_name",
        "type": "string",
        "required": true
      },
      {
        "name": "scope",
        "type": "string",
        "long": true
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      }
    ]
  },
  "Customers": {
    "label": "Khách hàng",
    "prefix": "CUS",
    "idStyle": "seq",
    "idWidth": 4,
    "pk": "customer_id",
    "display": "customer_name",
    "labelCols": [
      "customer_name"
    ],
    "listCols": [
      "customer_id",
      "customer_name",
      "customer_type",
      "country"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": true,
    "columns": [
      {
        "name": "customer_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "customer_name",
        "type": "string",
        "required": true
      },
      {
        "name": "customer_type",
        "type": "string",
        "list": "Customer type"
      },
      {
        "name": "country",
        "type": "string"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      }
    ]
  },
  "Items": {
    "label": "Hạng mục báo giá",
    "prefix": "ITM",
    "idStyle": "seq",
    "idWidth": 2,
    "pk": "item_id",
    "display": "item_name",
    "labelCols": [
      "item_name",
      "unit"
    ],
    "listCols": [
      "item_id",
      "item_name",
      "unit",
      "material_group",
      "description"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "item_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "item_name",
        "type": "string",
        "required": true
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true,
        "note": "Đơn vị của đơn giá — mỗi hạng mục 1 đơn vị cho mọi dự án để giá so sánh được."
      },
      {
        "name": "material_group",
        "type": "string",
        "list": "Material group",
        "note": "Nhóm vật tư mà hạng mục đại diện (dùng cho tổng hợp theo nhóm vật tư)."
      },
      {
        "name": "description",
        "type": "string",
        "long": true
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      }
    ]
  },
  "Materials": {
    "label": "Vật tư",
    "prefix": "MAT",
    "idStyle": "seq",
    "idWidth": 4,
    "pk": "material_id",
    "display": "material_name",
    "labelCols": [
      "material_name",
      "unit"
    ],
    "listCols": [
      "material_id",
      "material_name",
      "material_group",
      "unit",
      "description"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "material_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "material_name",
        "type": "string",
        "required": true
      },
      {
        "name": "material_group",
        "type": "string",
        "list": "Material group"
      },
      {
        "name": "description",
        "type": "string",
        "long": true,
        "note": "Mô tả chung. Quy cách chi tiết quyết định giá nhập ở Bảng giá vật tư."
      },
      {
        "name": "unit",
        "type": "string",
        "list": "Unit",
        "required": true
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      }
    ]
  },
  "FX_Rates": {
    "label": "Tỷ giá",
    "prefix": "FX",
    "idStyle": "seq",
    "idWidth": 4,
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
        "note": "Tỷ giá áp dụng từ ngày này tới khi có dòng mới hơn. Ngày + tiền tệ không được trùng."
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ cần quy đổi (khác tiền gốc VND). Cần có dòng USD để tính các cột USD."
      },
      {
        "name": "base_currency",
        "type": "string",
        "auto": true
      },
      {
        "name": "rate",
        "type": "number",
        "required": true,
        "note": "Ví dụ 1 USD = 26.000 VND → nhập 26000."
      },
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      },
      {
        "name": "fx_id",
        "type": "string",
        "key": "PK"
      }
    ]
  },
  "Material_Prices": {
    "label": "Bảng giá vật tư",
    "prefix": "PRC",
    "idStyle": "seq",
    "idWidth": 5,
    "pk": "price_id",
    "display": "specification",
    "labelCols": [
      "specification",
      "supplier",
      "effective_date"
    ],
    "listCols": [
      "price_id",
      "material_id",
      "specification",
      "effective_date",
      "supplier",
      "currency",
      "unit_price"
    ],
    "parentFk": "material_id",
    "groupCol": "",
    "dateCol": "effective_date",
    "view360": false,
    "columns": [
      {
        "name": "price_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "material_id",
        "type": "string",
        "key": "FK",
        "ref": "Materials",
        "required": true
      },
      {
        "name": "material_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true
      },
      {
        "name": "specification",
        "type": "string",
        "required": true,
        "note": "Quy cách quyết định giá (mác thép, độ dày, tiêu chuẩn, lớp phủ…). Mỗi quy cách là 1 dòng giá riêng."
      },
      {
        "name": "unit",
        "type": "string",
        "auto": true
      },
      {
        "name": "effective_date",
        "type": "date",
        "required": true,
        "note": "Ngày giá bắt đầu áp dụng (dùng tra tỷ giá của dòng)."
      },
      {
        "name": "supplier",
        "type": "string"
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "price_terms",
        "type": "string",
        "long": true,
        "note": "Điều kiện giao hàng, VAT, thanh toán…"
      },
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      },
      {
        "name": "fx_usd",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_price_usd",
        "type": "number",
        "auto": true
      }
    ]
  },
  "Projects": {
    "label": "Dự án",
    "prefix": "PRJ",
    "idStyle": "seq",
    "idWidth": 4,
    "pk": "project_id",
    "display": "project_name",
    "labelCols": [
      "project_name"
    ],
    "listCols": [
      "project_id",
      "project_name",
      "customer_id",
      "market_id",
      "quote_date",
      "status",
      "job_no",
      "sell_currency"
    ],
    "parentFk": "customer_id",
    "groupCol": "",
    "dateCol": "quote_date",
    "view360": true,
    "columns": [
      {
        "name": "project_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "project_name",
        "type": "string",
        "required": true
      },
      {
        "name": "customer_id",
        "type": "string",
        "key": "FK",
        "ref": "Customers",
        "required": true
      },
      {
        "name": "customer_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "market_id",
        "type": "string",
        "key": "FK",
        "ref": "Markets",
        "required": true
      },
      {
        "name": "market_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "quote_date",
        "type": "date",
        "note": "Ngày phát hành báo giá — dùng lọc theo kỳ trong các trang phân tích."
      },
      {
        "name": "contract_date",
        "type": "date",
        "note": "Để trống nếu chưa ký."
      },
      {
        "name": "status",
        "type": "string",
        "list": "Project status",
        "required": true
      },
      {
        "name": "job_no",
        "type": "string",
        "note": "Số Job nội bộ khi dự án thành Job; để trống khi còn báo giá."
      },
      {
        "name": "sell_currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ của giá bán hạng mục."
      },
      {
        "name": "cost_currency",
        "type": "string",
        "list": "Currency",
        "required": true,
        "note": "Tiền tệ dùng nhập chi phí hạng mục."
      },
      {
        "name": "fx_date",
        "type": "date",
        "required": true,
        "note": "Ngày dùng tra tỷ giá bán, chi phí và USD của dự án."
      },
      {
        "name": "fx_sell",
        "type": "number",
        "auto": true
      },
      {
        "name": "fx_cost",
        "type": "number",
        "auto": true
      },
      {
        "name": "item_rows",
        "type": "number",
        "auto": true
      },
      {
        "name": "gm_pct_bid",
        "type": "number",
        "auto": true,
        "pct": true
      },
      {
        "name": "gm_pct_job",
        "type": "number",
        "auto": true,
        "pct": true
      },
      {
        "name": "freight_rows",
        "type": "number",
        "auto": true
      },
      {
        "name": "owner",
        "type": "string",
        "note": "Người lập / chịu trách nhiệm báo giá."
      },
      {
        "name": "data_check",
        "type": "string",
        "auto": true
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      },
      {
        "name": "fx_usd",
        "type": "number",
        "auto": true
      }
    ]
  },
  "Project_Items": {
    "label": "Giá hạng mục dự án",
    "prefix": "PIT",
    "idStyle": "seq",
    "idWidth": 5,
    "pk": "line_id",
    "display": "item_id",
    "labelCols": [
      "project_id",
      "item_id",
      "stage"
    ],
    "listCols": [
      "line_id",
      "project_id",
      "item_id",
      "stage",
      "unit_sell",
      "gm_pct"
    ],
    "parentFk": "project_id",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "line_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "project_id",
        "type": "string",
        "key": "FK",
        "ref": "Projects",
        "required": true
      },
      {
        "name": "item_id",
        "type": "string",
        "key": "FK",
        "ref": "Items",
        "required": true
      },
      {
        "name": "stage",
        "type": "string",
        "list": "Stage",
        "required": true,
        "note": "Bid hoặc Job. Một dự án có thể có cả dòng Bid và Job cho cùng hạng mục."
      },
      {
        "name": "item_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true
      },
      {
        "name": "unit",
        "type": "string",
        "auto": true
      },
      {
        "name": "customer_id",
        "type": "string",
        "auto": true
      },
      {
        "name": "market_id",
        "type": "string",
        "auto": true
      },
      {
        "name": "cost_material",
        "type": "number",
        "required": true,
        "note": "Theo tiền tệ chi phí của dự án."
      },
      {
        "name": "cost_fabrication",
        "type": "number"
      },
      {
        "name": "cost_erection",
        "type": "number"
      },
      {
        "name": "cost_other",
        "type": "number",
        "note": "Giải thích ở Ghi chú. Không nhập cước ở đây (nhập ở Cước vận chuyển)."
      },
      {
        "name": "unit_cost",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_sell",
        "type": "number",
        "required": true,
        "note": "Theo tiền tệ bán của dự án."
      },
      {
        "name": "fx_sell",
        "type": "number",
        "auto": true
      },
      {
        "name": "fx_cost",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_sell_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_cost_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "gm_unit",
        "type": "number",
        "auto": true
      },
      {
        "name": "gm_pct",
        "type": "number",
        "auto": true,
        "pct": true
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      },
      {
        "name": "unit_sell_usd",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_cost_usd",
        "type": "number",
        "auto": true
      },
      {
        "name": "gm_unit_usd",
        "type": "number",
        "auto": true
      }
    ]
  },
  "Project_Freight": {
    "label": "Cước vận chuyển",
    "prefix": "FRT",
    "idStyle": "seq",
    "idWidth": 5,
    "pk": "freight_id",
    "display": "incoterm",
    "labelCols": [
      "project_id",
      "incoterm",
      "destination_port"
    ],
    "listCols": [
      "freight_id",
      "project_id",
      "incoterm",
      "destination_port",
      "cost_basis",
      "currency",
      "freight_cost"
    ],
    "parentFk": "project_id",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "freight_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "project_id",
        "type": "string",
        "key": "FK",
        "ref": "Projects",
        "required": true
      },
      {
        "name": "project_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "market_id",
        "type": "string",
        "auto": true
      },
      {
        "name": "market_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "incoterm",
        "type": "string",
        "list": "Incoterm",
        "required": true,
        "note": "Điều kiện giao hàng tương ứng với cước này."
      },
      {
        "name": "destination_port",
        "type": "string"
      },
      {
        "name": "site_location",
        "type": "string",
        "long": true
      },
      {
        "name": "cost_basis",
        "type": "string",
        "list": "Freight cost basis",
        "required": true,
        "note": "Cước ở cột kế tiếp tính theo đơn vị nào (container, chuyến…)."
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true
      },
      {
        "name": "freight_cost",
        "type": "number",
        "required": true
      },
      {
        "name": "fx_date",
        "type": "date",
        "auto": true
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true
      },
      {
        "name": "freight_cost_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "source",
        "type": "string"
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      },
      {
        "name": "freight_cost_usd",
        "type": "number",
        "auto": true
      }
    ]
  },
  "Project_Inputs_Bid": {
    "label": "Vật tư đầu vào - Bid",
    "prefix": "INB",
    "idStyle": "seq",
    "idWidth": 5,
    "pk": "input_id",
    "display": "specification",
    "labelCols": [
      "project_id",
      "material_id",
      "specification"
    ],
    "listCols": [
      "input_id",
      "project_id",
      "material_id",
      "specification",
      "currency",
      "unit_price",
      "spec_check"
    ],
    "parentFk": "project_id",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "input_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "project_id",
        "type": "string",
        "key": "FK",
        "ref": "Projects",
        "required": true
      },
      {
        "name": "material_id",
        "type": "string",
        "key": "FK",
        "ref": "Materials",
        "required": true
      },
      {
        "name": "material_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true
      },
      {
        "name": "customer_id",
        "type": "string",
        "auto": true
      },
      {
        "name": "market_id",
        "type": "string",
        "auto": true
      },
      {
        "name": "specification",
        "type": "string",
        "required": true,
        "note": "Viết giống hệt ở Bid và Job để so sánh được."
      },
      {
        "name": "unit",
        "type": "string",
        "auto": true
      },
      {
        "name": "price_id",
        "type": "string",
        "key": "FK",
        "ref": "Material_Prices",
        "note": "Dòng bảng giá dùng so sánh (tùy chọn) — danh sách lọc theo vật tư đã chọn."
      },
      {
        "name": "ref_specification",
        "type": "string",
        "auto": true
      },
      {
        "name": "spec_check",
        "type": "string",
        "auto": true
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true
      },
      {
        "name": "fx_date",
        "type": "date",
        "auto": true
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "list_price_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "var_vs_list_pct",
        "type": "number",
        "auto": true,
        "pct": true
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      },
      {
        "name": "unit_price_usd",
        "type": "number",
        "auto": true
      },
      {
        "name": "list_price_usd",
        "type": "number",
        "auto": true
      }
    ]
  },
  "Project_Inputs_Job": {
    "label": "Vật tư đầu vào - Job",
    "prefix": "INJ",
    "idStyle": "seq",
    "idWidth": 5,
    "pk": "input_id",
    "display": "specification",
    "labelCols": [
      "project_id",
      "material_id",
      "specification"
    ],
    "listCols": [
      "input_id",
      "project_id",
      "material_id",
      "specification",
      "price_date",
      "currency",
      "unit_price",
      "var_vs_bid_pct"
    ],
    "parentFk": "project_id",
    "groupCol": "",
    "dateCol": "price_date",
    "view360": false,
    "columns": [
      {
        "name": "input_id",
        "type": "string",
        "key": "PK"
      },
      {
        "name": "project_id",
        "type": "string",
        "key": "FK",
        "ref": "Projects",
        "required": true
      },
      {
        "name": "material_id",
        "type": "string",
        "key": "FK",
        "ref": "Materials",
        "required": true
      },
      {
        "name": "material_name",
        "type": "string",
        "auto": true
      },
      {
        "name": "material_group",
        "type": "string",
        "auto": true
      },
      {
        "name": "customer_id",
        "type": "string",
        "auto": true
      },
      {
        "name": "market_id",
        "type": "string",
        "auto": true
      },
      {
        "name": "specification",
        "type": "string",
        "required": true,
        "note": "Viết giống hệt ở Bid và Job để so sánh được."
      },
      {
        "name": "unit",
        "type": "string",
        "auto": true
      },
      {
        "name": "price_date",
        "type": "date",
        "required": true,
        "note": "Ngày chốt / mua giá thực tế — dùng tra tỷ giá của dòng."
      },
      {
        "name": "supplier",
        "type": "string"
      },
      {
        "name": "price_id",
        "type": "string",
        "key": "FK",
        "ref": "Material_Prices",
        "note": "Dòng bảng giá dùng so sánh (tùy chọn) — danh sách lọc theo vật tư đã chọn."
      },
      {
        "name": "ref_specification",
        "type": "string",
        "auto": true
      },
      {
        "name": "spec_check",
        "type": "string",
        "auto": true
      },
      {
        "name": "currency",
        "type": "string",
        "list": "Currency",
        "required": true
      },
      {
        "name": "unit_price",
        "type": "number",
        "required": true
      },
      {
        "name": "fx_rate",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_price_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "bid_unit_price_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "var_vs_bid_pct",
        "type": "number",
        "auto": true,
        "pct": true
      },
      {
        "name": "list_price_base",
        "type": "number",
        "auto": true
      },
      {
        "name": "var_vs_list_pct",
        "type": "number",
        "auto": true,
        "pct": true
      },
      {
        "name": "notes",
        "type": "string",
        "long": true
      },
      {
        "name": "fx_usd",
        "type": "number",
        "auto": true
      },
      {
        "name": "unit_price_usd",
        "type": "number",
        "auto": true
      },
      {
        "name": "bid_unit_price_usd",
        "type": "number",
        "auto": true
      },
      {
        "name": "list_price_usd",
        "type": "number",
        "auto": true
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
    tables: SCHEMA, lists: LISTS, catalogs: CATALOG_TABLES, menu: MENU, staffTable: APP.STAFF.table, defaults: DEFAULTS,
    roles: ROLE_LEVEL, permission: PERMISSION, consts: consts };
}
