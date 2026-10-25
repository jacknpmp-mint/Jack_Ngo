/**
 * 01_Config.gs — Cấu hình & lược đồ dữ liệu (schema) của LSB CRM · Bidding · Project.
 *
 * File này được SINH TỰ ĐỘNG bằng tools/gen_config.py từ LSB_CRM_Bidding_Project_DB_v4.6.xlsx + tools/app_spec.json.
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
 * Thuộc tính bảng: label, prefix + idStyle ('year' → XX-2026-001 | 'catalog' → XX-001), pk, display,
 *   labelCols (nhãn trong ô chọn FK), listCols (cột ở trang danh sách), parentFk (FK cha chính — lọc lựa chọn,
 *   đánh số *_no), groupCol, dateCol (lọc theo năm), view360 (có trang 360°).
 */

var APP = {
  "NAME": "LSB CRM · Bidding · Project",
  "BRAND": "LSB CRM",
  "SUBTITLE": [
    "CRM · Đấu thầu · Dự án",
    "CRM · Bidding · Projects"
  ],
  "VERSION": "3.0.0",
  "SCHEMA_VERSION": "LSB_CRM_Bidding_Project_DB_v4.6",
  "MENU_TITLE": "LSB App",
  "PREFIX": "LSB_",
  "SPREADSHEET_ID": "",
  "TIMEZONE": "Asia/Ho_Chi_Minh",
  "HEADER_ROW": 1,
  "FIRST_DATA_ROW": 2,
  "LOG_SHEET": "LSB_Activity_log",
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
    "table": "LSB_Staff",
    "id": "Staff_id",
    "email": "Email",
    "name": "Full_name",
    "access": "Access_level",
    "active": "Active",
    "role": "Role"
  },
  "CONSTS": {
    "FX_USD_VND": 26000,
    "TRANSIT_DAYS": 14
  }
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
  "LSB_Staff",
  "LSB_Task"
];

/** Sheet nhật ký thay đổi (08_Activity.gs tự tạo nếu chưa có). */
var ACTIVITY_COLUMNS = ['Log_id', 'Timestamp', 'User_email', 'Staff_id', 'Action',
  'Table_name', 'Record_id', 'Changed_fields', 'Detail'];

/** Menu bên trái: nhóm → mục (route 'entity' = danh sách + 360°; 'catalog' = bảng danh mục; route khác = trang riêng). */
var MENU = [
  {
    "group": [
      "Bán hàng & thầu",
      "Sales & bidding"
    ],
    "items": [
      {
        "table": "LSB_Lead",
        "icon": "◎"
      },
      {
        "table": "LSB_Lead_Qualifying",
        "icon": "✓"
      },
      {
        "table": "LSB_Quotation",
        "icon": "₫"
      },
      {
        "table": "LSB_Bidding_strategy",
        "icon": "♟"
      },
      {
        "table": "LSB_Bidding_action_plan",
        "icon": "☰"
      },
      {
        "table": "LSB_Result_Lesson",
        "icon": "★"
      }
    ]
  },
  {
    "group": [
      "Khách hàng & dự án",
      "Customers & projects"
    ],
    "items": [
      {
        "table": "LSB_Customer",
        "icon": "◉"
      },
      {
        "table": "LSB_project",
        "icon": "▣"
      },
      {
        "table": "LSB_Project_task",
        "icon": "☑"
      },
      {
        "table": "LSB_shipment",
        "icon": "⛴"
      },
      {
        "table": "LSB_Project_handover_lesson",
        "icon": "✎"
      }
    ]
  },
  {
    "group": [
      "Tài chính",
      "Finance"
    ],
    "items": [
      {
        "table": "LSB_payment_plan",
        "icon": "▤"
      },
      {
        "table": "LSB_paid",
        "icon": "$"
      },
      {
        "table": "LSB_cost",
        "icon": "↘"
      }
    ]
  },
  {
    "group": [
      "Danh mục",
      "Catalogs"
    ],
    "items": [
      {
        "table": "LSB_Staff",
        "icon": "☺"
      },
      {
        "table": "LSB_Task",
        "icon": "▦"
      }
    ]
  }
];

/** Cặp ngày [trước, sau] — ngày sau không được sớm hơn ngày trước (áp cho mọi bảng có đủ 2 cột). */
var DATE_ORDER_RULES = [
  [
    "Start_day",
    "Due_day"
  ],
  [
    "Start_day",
    "Done_day"
  ],
  [
    "Qual_Start_day",
    "Qual_Due_day"
  ],
  [
    "Qual_Start_day",
    "Qual_Done_day"
  ],
  [
    "Start_Fab",
    "Completed_Fab"
  ],
  [
    "ETD_plan",
    "ETA_plan"
  ],
  [
    "ETD_actual",
    "ETA_actual"
  ],
  [
    "Contract_day",
    "Kickoff_day"
  ],
  [
    "Installation_date_start",
    "Project_handover"
  ]
];

/** Cảnh báo theo hạn (Notification.gs). */
var ALERT_RULES = [
  {
    "table": "LSB_Lead_Qualifying",
    "date": "Qual_Due_day",
    "warnDays": 3,
    "doneCol": "Qual_Status",
    "doneValues": [
      "Done"
    ],
    "ownerCol": "Assessor_id",
    "link": "Lead_id",
    "title": [
      "Đánh giá lead",
      "Lead qualification"
    ]
  },
  {
    "table": "LSB_Bidding_action_plan",
    "date": "Due_day",
    "warnDays": 3,
    "doneCol": "Status",
    "doneValues": [
      "Done"
    ],
    "ownerCol": "Owner_id",
    "link": "Lead_id",
    "title": [
      "Kế hoạch hành động thầu",
      "Bid action plan"
    ]
  },
  {
    "table": "LSB_Project_task",
    "date": "Due_day",
    "warnDays": 3,
    "doneCol": "Status",
    "doneValues": [
      "Done"
    ],
    "ownerCol": "Owner_id",
    "link": "Project_id",
    "title": [
      "Đầu việc dự án",
      "Project task"
    ]
  },
  {
    "table": "LSB_payment_plan",
    "date": "Due_day",
    "warnDays": 7,
    "link": "Project_id",
    "title": [
      "Kế hoạch thanh toán",
      "Payment milestone"
    ]
  },
  {
    "table": "LSB_shipment",
    "date": "ETD_plan",
    "title": [
      "ETD lô hàng",
      "Shipment ETD"
    ],
    "warnDays": 7,
    "doneWhen": "ETD_actual",
    "link": "Project_id"
  },
  {
    "table": "LSB_project",
    "date": "RAD_date",
    "title": [
      "Hạn giao RAD",
      "RAD deadline"
    ],
    "warnDays": 14,
    "doneCol": "Status",
    "doneValues": [
      "Closed",
      "Installation Completed"
    ],
    "ownerCol": "PM_id"
  }
];

/** Dashboard dùng chung (05_Dashboard.gs). */
var DASHBOARD = {
  "kpiTables": [
    "LSB_Lead",
    "LSB_Quotation",
    "LSB_Customer",
    "LSB_project",
    "LSB_shipment",
    "LSB_payment_plan"
  ],
  "metrics": [],
  "providers": [
    "Lsb_board_"
  ]
};

/** Cột "nên có" thêm vào cờ Thiếu dữ liệu; cột tự tính thêm (10_Form.gs). */
var FORM_NEED_EXTRA = {};
var FORM_CALC_EXTRA = {};

/** Cột tự điền = Staff_id người đang dùng app khi để trống; giá trị mặc định khi thêm mới (04_Entity.gs). */
var AUTO_USER_COLS = {
  "LSB_Lead": [
    "Owner_id"
  ],
  "LSB_Lead_Qualifying": [
    "Assessor_id"
  ],
  "LSB_Quotation": [
    "Sales_id"
  ],
  "LSB_Bidding_action_plan": [
    "Owner_id"
  ],
  "LSB_Project_handover_lesson": [
    "Recorded_by"
  ]
};
var DEFAULTS = {
  "LSB_Lead": {
    "Lead_status": "New"
  },
  "LSB_Lead_Qualifying": {
    "Qual_Status": "Not started"
  },
  "LSB_Quotation": {
    "Status": "Draft"
  },
  "LSB_Bidding_action_plan": {
    "Status": "Not started"
  },
  "LSB_Project_task": {
    "Status": "Not started"
  },
  "LSB_project": {
    "Status": "Kick-off"
  },
  "LSB_cost": {
    "Cost_status": "Planned"
  }
};

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
  "Lsb_hooks_"
];
var ROUTE_PROVIDERS = [
  "Lsb_routes_"
];
var RELATED_PROVIDERS = [
  "Lsb_related_"
];
var ENTITY_EXTRA_PROVIDERS = [
  "Lsb_extra360_"
];
var ALERT_PROVIDERS = [];
var CHECK_PROVIDERS = [
  "Lsb_checks_"
];

var LISTS = {
  "Role": [
    "Sales",
    "Sales Assistant",
    "Estimator",
    "PM",
    "QA-QC",
    "Logistics",
    "Accounting",
    "Manager"
  ],
  "Access_level": [
    "Admin",
    "Editor",
    "Viewer"
  ],
  "YesNo": [
    "Y",
    "N"
  ],
  "Task_phase": [
    "Lead Qualification",
    "Bidding",
    "Contracting",
    "Execution",
    "Payment"
  ],
  "Nation": [
    "Vietnam",
    "Australia",
    "USA",
    "Canada",
    "Japan",
    "Korea",
    "Philippines",
    "Singapore",
    "Malaysia",
    "New Zealand",
    "Other"
  ],
  "Industry_segment": [
    "Warehouse",
    "Factory",
    "Logistics",
    "Retail",
    "Cold storage",
    "Infrastructure",
    "Commercial",
    "Other"
  ],
  "Lead_source": [
    "Referral",
    "Website",
    "Trade show",
    "Agent",
    "Repeat customer",
    "Cold outreach",
    "Other"
  ],
  "Lead_status": [
    "New",
    "Qualifying",
    "Qualified",
    "Nurture",
    "Disqualified",
    "Converted"
  ],
  "Qual_status": [
    "Qualified",
    "Nurture",
    "Disqualified"
  ],
  "Incoterm": [
    "EXW",
    "FOB",
    "CFR",
    "CIF",
    "DAP",
    "DDP",
    "Lumpsum_Erect",
    "Lumpsum_NotErect",
    "Unit_price_Erect"
  ],
  "Quot_status": [
    "Draft",
    "Submitted",
    "Negotiating",
    "Won",
    "Lost",
    "Cancelled"
  ],
  "Price_positioning": [
    "Premium",
    "Market",
    "Aggressive"
  ],
  "Work_status": [
    "Not started",
    "In progress",
    "Done",
    "Blocked"
  ],
  "Result": [
    "Won",
    "Lost",
    "Cancelled",
    "No-bid"
  ],
  "Win_loss_reason": [
    "Price",
    "Technical",
    "Schedule",
    "Relationship",
    "Scope change",
    "Client cancelled",
    "Other"
  ],
  "Project_status": [
    "Kick-off",
    "Engineering",
    "Fabrication",
    "Shipping",
    "Closed",
    "Installation Processing",
    "Installation Completed"
  ],
  "Lesson_phase": [
    "Engineering",
    "Procurement",
    "Fabrication",
    "QA-QC",
    "Packing",
    "Shipping",
    "Erection",
    "Payment"
  ],
  "Lesson_category": [
    "Cost",
    "Schedule",
    "Quality",
    "Safety",
    "Customer",
    "Document"
  ],
  "Lesson_action_status": [
    "Open",
    "In progress",
    "Applied",
    "Dropped"
  ],
  "Payment_code": [
    "Deposit",
    "Progress",
    "Final",
    "Retention"
  ],
  "Cost_category": [
    "Material",
    "Fabrication",
    "Painting",
    "Logistics",
    "Other"
  ],
  "Cost_status": [
    "Planned",
    "Invoiced",
    "Paid"
  ]
};

var SCHEMA = {
  "LSB_Lead": {
    "label": "Lead",
    "prefix": "LD",
    "idStyle": "year",
    "pk": "Lead_id",
    "display": "Company_name",
    "labelCols": [
      "Company_name"
    ],
    "listCols": [
      "Lead_id",
      "Company_name",
      "Nation",
      "Lead_source",
      "Owner_id",
      "Created_day",
      "Lead_status"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "Created_day",
    "view360": true,
    "columns": [
      {
        "name": "Lead_id",
        "type": "string",
        "key": "PK",
        "note": "LD-2026-001"
      },
      {
        "name": "Company_name",
        "type": "string"
      },
      {
        "name": "Nation",
        "type": "string",
        "list": "Nation"
      },
      {
        "name": "Industry_segment",
        "type": "string",
        "list": "Industry_segment",
        "note": "Warehouse / Factory / Logistics / Retail …"
      },
      {
        "name": "Lead_source",
        "type": "string",
        "list": "Lead_source",
        "note": "Referral / Website / Trade show / Agent …"
      },
      {
        "name": "Contact_name",
        "type": "string"
      },
      {
        "name": "Contact_title",
        "type": "string"
      },
      {
        "name": "Contact_email",
        "type": "string",
        "format": "email"
      },
      {
        "name": "Owner_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff",
        "note": "Sales phụ trách"
      },
      {
        "name": "Created_day",
        "type": "date"
      },
      {
        "name": "Lead_status",
        "type": "string",
        "list": "Lead_status",
        "note": "New / Qualifying / Qualified / Nurture / Disqualified / Converted"
      },
      {
        "name": "Lead_website",
        "type": "string",
        "format": "url",
        "note": "URL website công ty"
      },
      {
        "name": "Year",
        "type": "number",
        "auto": true,
        "note": "auto từ Created_day"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Created_day"
      }
    ]
  },
  "LSB_Lead_Qualifying": {
    "label": "Đánh giá lead",
    "prefix": "QL",
    "idStyle": "year",
    "pk": "Qualification_id",
    "display": "Task_duty",
    "labelCols": [
      "Qualification_id",
      "Task_duty"
    ],
    "listCols": [
      "Qualification_id",
      "Lead_id",
      "Task_id",
      "Task_duty",
      "Qual_Due_day",
      "Qual_Status",
      "Assessor_id"
    ],
    "parentFk": "Lead_id",
    "groupCol": "",
    "dateCol": "Qual_Start_day",
    "view360": false,
    "columns": [
      {
        "name": "Qualification_id",
        "type": "string",
        "key": "PK",
        "note": "QL-2026-001 — mỗi dòng là 1 đầu việc đánh giá lead"
      },
      {
        "name": "Lead_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Lead",
        "required": true
      },
      {
        "name": "Task_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Task",
        "required": true,
        "note": "đầu việc chuẩn (Phase = Lead Qualification)"
      },
      {
        "name": "Task_duty",
        "type": "string",
        "auto": true,
        "note": "auto tra từ Task_id"
      },
      {
        "name": "Qual_Start_day",
        "type": "date",
        "note": "ngày bắt đầu"
      },
      {
        "name": "Qual_Due_day",
        "type": "date",
        "note": "hạn hoàn thành"
      },
      {
        "name": "Qual_Done_day",
        "type": "date",
        "note": "ngày hoàn thành thực tế"
      },
      {
        "name": "Qual_Status",
        "type": "string",
        "list": "Work_status",
        "note": "Not started / In progress / Done / Blocked (Lists: Work_status)"
      },
      {
        "name": "Assessor_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff",
        "note": "người đánh giá"
      }
    ]
  },
  "LSB_Quotation": {
    "label": "Báo giá",
    "prefix": "QT",
    "idStyle": "year",
    "pk": "Quotation_code",
    "display": "Project_name",
    "labelCols": [
      "Quotation_LSB_Code",
      "Project_name"
    ],
    "listCols": [
      "Quotation_code",
      "Quotation_LSB_Code",
      "Lead_id",
      "Project_name",
      "Value_USD",
      "Issue_day",
      "Win_probability",
      "Status"
    ],
    "parentFk": "Lead_id",
    "groupCol": "",
    "dateCol": "Issue_day",
    "view360": true,
    "columns": [
      {
        "name": "Quotation_code",
        "type": "string",
        "key": "PK",
        "note": "QT-2026-001"
      },
      {
        "name": "Lead_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Lead",
        "required": true,
        "note": "khóa nối trực tiếp về Lead (dropdown)"
      },
      {
        "name": "Quotation_LSB_Code",
        "type": "string",
        "unique": true,
        "note": "mã báo giá nội bộ LSB, vd 26B456"
      },
      {
        "name": "Project_name",
        "type": "string"
      },
      {
        "name": "Address",
        "type": "string",
        "long": true,
        "note": "địa chỉ công trình"
      },
      {
        "name": "Scope",
        "type": "string",
        "long": true
      },
      {
        "name": "Area_m2",
        "type": "number",
        "note": "diện tích công trình (m²)"
      },
      {
        "name": "Tonnage",
        "type": "number",
        "note": "tấn"
      },
      {
        "name": "Value_USD",
        "type": "number",
        "money": true
      },
      {
        "name": "Value_VND",
        "type": "number",
        "calc": {
          "type": "mul",
          "src": "Value_USD",
          "by": "FX_USD_VND"
        },
        "money": true
      },
      {
        "name": "Incoterm",
        "type": "string",
        "list": "Incoterm",
        "note": "EXW / FOB / CIF / DAP …"
      },
      {
        "name": "Quotation_owner",
        "type": "string",
        "note": "chủ đầu tư"
      },
      {
        "name": "Quotation_Maincons",
        "type": "string",
        "note": "tổng thầu chính (main contractor)"
      },
      {
        "name": "Quotation_Consultant",
        "type": "string",
        "note": "đơn vị tư vấn / thiết kế"
      },
      {
        "name": "Issue_day",
        "type": "date"
      },
      {
        "name": "Revision_no",
        "type": "number",
        "min": 0,
        "max": 99,
        "note": "lần sửa giá hiện hành"
      },
      {
        "name": "Win_probability",
        "type": "number",
        "pct": true,
        "min": 0,
        "max": 1,
        "note": "%"
      },
      {
        "name": "Status",
        "type": "string",
        "list": "Quot_status",
        "note": "Draft / Submitted / Negotiating / Won / Lost / Cancelled"
      },
      {
        "name": "Sales_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff"
      },
      {
        "name": "Sale_Assistant_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff",
        "note": "Sales Assistant hỗ trợ"
      },
      {
        "name": "Year",
        "type": "number",
        "auto": true,
        "note": "auto từ Issue_day"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Issue_day"
      }
    ]
  },
  "LSB_Bidding_strategy": {
    "label": "Chiến lược thầu",
    "prefix": "BS",
    "idStyle": "year",
    "pk": "Strategy_id",
    "display": "Win_theme",
    "labelCols": [
      "Strategy_id",
      "Win_theme"
    ],
    "listCols": [
      "Strategy_id",
      "Quotation_code",
      "Price_positioning",
      "Win_theme",
      "Key_competitors"
    ],
    "parentFk": "Quotation_code",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "Strategy_id",
        "type": "string",
        "key": "PK",
        "note": "BS-2026-001"
      },
      {
        "name": "Quotation_code",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Quotation",
        "required": true,
        "unique": true,
        "note": "duy nhất (1–1)"
      },
      {
        "name": "Price_positioning",
        "type": "string",
        "list": "Price_positioning",
        "note": "Premium / Market / Aggressive"
      },
      {
        "name": "Value_proposition",
        "type": "string",
        "long": true
      },
      {
        "name": "Strengths",
        "type": "string",
        "long": true
      },
      {
        "name": "Weaknesses",
        "type": "string",
        "long": true
      },
      {
        "name": "Key_competitors",
        "type": "string",
        "long": true
      },
      {
        "name": "Win_theme",
        "type": "string",
        "long": true
      },
      {
        "name": "Approach",
        "type": "string",
        "long": true
      }
    ]
  },
  "LSB_Bidding_action_plan": {
    "label": "Kế hoạch hành động thầu",
    "prefix": "BA",
    "idStyle": "year",
    "pk": "Action_id",
    "display": "Task_duty",
    "labelCols": [
      "Action_id",
      "Task_duty"
    ],
    "listCols": [
      "Action_id",
      "Lead_id",
      "Quotation_code",
      "Task_id",
      "Task_duty",
      "Owner_id",
      "Due_day",
      "Status"
    ],
    "parentFk": "Lead_id",
    "groupCol": "",
    "dateCol": "Start_day",
    "view360": false,
    "columns": [
      {
        "name": "Action_id",
        "type": "string",
        "key": "PK",
        "note": "BA-2026-001"
      },
      {
        "name": "Lead_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Lead",
        "required": true,
        "note": "bắt buộc"
      },
      {
        "name": "Quotation_code",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Quotation",
        "note": "tùy chọn — điền khi đã có báo giá"
      },
      {
        "name": "Stage",
        "type": "string",
        "auto": true,
        "note": "auto: trống Quotation_code → Qualify, có → Quotation"
      },
      {
        "name": "Task_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Task",
        "required": true
      },
      {
        "name": "Task_duty",
        "type": "string",
        "auto": true,
        "note": "auto tra từ Task_id"
      },
      {
        "name": "Owner_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff"
      },
      {
        "name": "Start_day",
        "type": "date"
      },
      {
        "name": "Due_day",
        "type": "date"
      },
      {
        "name": "Done_day",
        "type": "date"
      },
      {
        "name": "Status",
        "type": "string",
        "list": "Work_status",
        "note": "Not started / In progress / Done / Blocked"
      }
    ]
  },
  "LSB_Result_Lesson": {
    "label": "Kết quả & bài học thầu",
    "prefix": "RL",
    "idStyle": "year",
    "pk": "Result_id",
    "display": "Result",
    "labelCols": [
      "Result_id",
      "Result"
    ],
    "listCols": [
      "Result_id",
      "Quotation_code",
      "Result",
      "Result_day",
      "Winner",
      "Win_loss_reason",
      "Project_id"
    ],
    "parentFk": "Quotation_code",
    "groupCol": "",
    "dateCol": "Result_day",
    "view360": false,
    "columns": [
      {
        "name": "Result_id",
        "type": "string",
        "key": "PK",
        "note": "RL-2026-001"
      },
      {
        "name": "Quotation_code",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Quotation",
        "required": true,
        "unique": true,
        "note": "duy nhất (1–1)"
      },
      {
        "name": "Result",
        "type": "string",
        "list": "Result",
        "note": "Won / Lost / Cancelled / No-bid"
      },
      {
        "name": "Result_day",
        "type": "date"
      },
      {
        "name": "Winner",
        "type": "string",
        "note": "đơn vị thắng nếu thua"
      },
      {
        "name": "Price_gap_pct",
        "type": "number",
        "pct": true,
        "min": -1,
        "max": 1,
        "note": "chênh giá so với đơn vị thắng (0.05 = 5%)"
      },
      {
        "name": "Win_loss_reason",
        "type": "string",
        "list": "Win_loss_reason",
        "note": "Price / Technical / Schedule / Relationship …"
      },
      {
        "name": "What_went_well",
        "type": "string",
        "long": true
      },
      {
        "name": "To_improve",
        "type": "string",
        "long": true
      },
      {
        "name": "Next_time_action",
        "type": "string",
        "long": true
      },
      {
        "name": "Category",
        "type": "string",
        "note": "nhóm bài học"
      },
      {
        "name": "Project_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_project",
        "note": "tùy chọn — dự án hình thành từ báo giá thắng (v4.6: chọn tay)"
      },
      {
        "name": "Year",
        "type": "number",
        "auto": true,
        "note": "auto từ Result_day"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Result_day"
      }
    ]
  },
  "LSB_Customer": {
    "label": "Khách hàng",
    "prefix": "CU",
    "idStyle": "catalog",
    "pk": "Customer_id",
    "display": "Company_name",
    "labelCols": [
      "Company_name"
    ],
    "listCols": [
      "Customer_id",
      "Company_name",
      "Lead_id",
      "Nation",
      "Contact",
      "First_contract_day",
      "Account_owner_id"
    ],
    "parentFk": "Lead_id",
    "groupCol": "",
    "dateCol": "First_contract_day",
    "view360": true,
    "columns": [
      {
        "name": "Customer_id",
        "type": "string",
        "key": "PK",
        "note": "CU-001"
      },
      {
        "name": "Lead_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Lead",
        "required": true,
        "unique": true,
        "note": "duy nhất (1 lead → tối đa 1 customer)"
      },
      {
        "name": "Company_name",
        "type": "string",
        "auto": true,
        "note": "auto chép từ Lead khi chuyển đổi"
      },
      {
        "name": "Nation",
        "type": "string",
        "list": "Nation"
      },
      {
        "name": "Tax_code",
        "type": "string"
      },
      {
        "name": "Address",
        "type": "string",
        "long": true
      },
      {
        "name": "Contact",
        "type": "string"
      },
      {
        "name": "First_contract_day",
        "type": "date"
      },
      {
        "name": "Account_owner_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff"
      }
    ]
  },
  "LSB_project": {
    "label": "Dự án",
    "prefix": "PJ",
    "idStyle": "year",
    "pk": "Project_id",
    "display": "Project_name",
    "labelCols": [
      "Project_code",
      "Project_name"
    ],
    "listCols": [
      "Project_id",
      "Project_code",
      "Project_name",
      "Customer_id",
      "Contract_USD",
      "Contract_day",
      "PM_id",
      "Status"
    ],
    "parentFk": "Customer_id",
    "groupCol": "",
    "dateCol": "Contract_day",
    "view360": true,
    "columns": [
      {
        "name": "Project_id",
        "type": "string",
        "key": "PK",
        "note": "PJ-2026-001"
      },
      {
        "name": "Customer_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Customer",
        "required": true
      },
      {
        "name": "Project_code",
        "type": "string",
        "note": "mã nội bộ"
      },
      {
        "name": "Quotation_LSB-Code",
        "type": "string",
        "unique": true,
        "note": "mã báo giá nội bộ LSB = LSB_Quotation.Quotation_LSB_Code (nhập tay, cảnh báo nếu không khớp / chưa Won / trùng)"
      },
      {
        "name": "Project_name",
        "type": "string"
      },
      {
        "name": "Project_address",
        "type": "string",
        "long": true,
        "note": "địa chỉ công trình"
      },
      {
        "name": "Project_owner",
        "type": "string",
        "note": "chủ đầu tư"
      },
      {
        "name": "Project_Maincons",
        "type": "string",
        "note": "tổng thầu chính (main contractor)"
      },
      {
        "name": "Project_Consultant",
        "type": "string",
        "note": "đơn vị tư vấn / thiết kế"
      },
      {
        "name": "Contract_no",
        "type": "string"
      },
      {
        "name": "Contract_USD",
        "type": "number",
        "money": true
      },
      {
        "name": "Contract_VND",
        "type": "number",
        "calc": {
          "type": "mul",
          "src": "Contract_USD",
          "by": "FX_USD_VND"
        },
        "money": true
      },
      {
        "name": "Incoterm",
        "type": "string",
        "list": "Incoterm"
      },
      {
        "name": "Tonnage_EST",
        "type": "number",
        "note": "tấn thép dự kiến theo hợp đồng"
      },
      {
        "name": "Tonnage_Actual",
        "type": "number",
        "note": "tấn thép thực tế"
      },
      {
        "name": "Grossmargin_EST",
        "type": "number",
        "pct": true,
        "min": -1,
        "max": 1,
        "note": "% lãi gộp dự kiến (0.15 = 15%)"
      },
      {
        "name": "Grossmargin_Actual",
        "type": "number",
        "pct": true,
        "min": -1,
        "max": 1,
        "note": "% lãi gộp thực tế (0.18 = 18%)"
      },
      {
        "name": "Contract_day",
        "type": "date"
      },
      {
        "name": "Kickoff_day",
        "type": "date"
      },
      {
        "name": "RAD_date",
        "type": "date",
        "note": "hạn giao hàng yêu cầu (hiện hành)"
      },
      {
        "name": "RAD_Revision",
        "type": "number",
        "min": 0,
        "max": 99,
        "note": "số lần đổi RAD (0, 1, 2…)"
      },
      {
        "name": "Installation_date_start",
        "type": "date",
        "note": "ngày bắt đầu lắp dựng tại công trình"
      },
      {
        "name": "Project_handover",
        "type": "date",
        "note": "ngày bàn giao dự án cho khách"
      },
      {
        "name": "URL_Project_data",
        "type": "string",
        "format": "url"
      },
      {
        "name": "PM_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff"
      },
      {
        "name": "Status",
        "type": "string",
        "list": "Project_status",
        "note": "Kick-off / Engineering / Fabrication / Shipping / Closed"
      },
      {
        "name": "Year",
        "type": "number",
        "auto": true,
        "note": "auto từ Contract_day"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Contract_day"
      }
    ]
  },
  "LSB_Project_task": {
    "label": "Đầu việc dự án",
    "prefix": "PT",
    "idStyle": "year",
    "pk": "Project_task_id",
    "display": "Task_duty",
    "labelCols": [
      "Project_task_id",
      "Task_duty"
    ],
    "listCols": [
      "Project_task_id",
      "Project_id",
      "Task_id",
      "Task_duty",
      "Owner_id",
      "Due_day",
      "Status"
    ],
    "parentFk": "Project_id",
    "groupCol": "",
    "dateCol": "Start_day",
    "view360": false,
    "columns": [
      {
        "name": "Project_task_id",
        "type": "string",
        "key": "PK",
        "note": "PT-2026-001"
      },
      {
        "name": "Project_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_project",
        "required": true
      },
      {
        "name": "Task_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Task",
        "required": true
      },
      {
        "name": "Phase",
        "type": "string",
        "auto": true,
        "note": "auto tra từ Task_id"
      },
      {
        "name": "Task_duty",
        "type": "string",
        "auto": true,
        "note": "auto tra từ Task_id"
      },
      {
        "name": "Owner_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff"
      },
      {
        "name": "Start_day",
        "type": "date"
      },
      {
        "name": "Due_day",
        "type": "date"
      },
      {
        "name": "Done_day",
        "type": "date"
      },
      {
        "name": "Status",
        "type": "string",
        "list": "Work_status",
        "note": "Not started / In progress / Done / Blocked"
      }
    ]
  },
  "LSB_shipment": {
    "label": "Lô hàng",
    "prefix": "SH",
    "idStyle": "year",
    "pk": "Shipping_id",
    "display": "Shipment_code",
    "labelCols": [
      "Shipment_no",
      "Shipment_code"
    ],
    "listCols": [
      "Shipping_id",
      "Project_id",
      "Shipment_no",
      "Shipment_code",
      "Quantity_ton",
      "ETD_plan",
      "ETD_actual",
      "ETA_plan"
    ],
    "parentFk": "Project_id",
    "groupCol": "",
    "dateCol": "ETD_plan",
    "view360": true,
    "columns": [
      {
        "name": "Shipping_id",
        "type": "string",
        "key": "PK",
        "note": "SH-2026-001"
      },
      {
        "name": "Project_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_project",
        "required": true
      },
      {
        "name": "Shipment_no",
        "type": "number",
        "min": 1,
        "max": 999,
        "note": "lô 1, 2, 3 …"
      },
      {
        "name": "Shipment_code",
        "type": "number",
        "note": "mã lô theo khu vực/trục, vd B1-P1 (A-G)"
      },
      {
        "name": "Quantity_ton",
        "type": "number"
      },
      {
        "name": "Container_qty_plan",
        "type": "number",
        "note": "số container kế hoạch"
      },
      {
        "name": "Container_qty_actual",
        "type": "number",
        "note": "số container thực tế"
      },
      {
        "name": "Start_Fab",
        "type": "date"
      },
      {
        "name": "Completed_Fab",
        "type": "date"
      },
      {
        "name": "ETD_plan",
        "type": "date"
      },
      {
        "name": "ETD_actual",
        "type": "date"
      },
      {
        "name": "ETA_plan",
        "type": "date",
        "calc": {
          "type": "addDays",
          "src": "ETD_plan",
          "by": "TRANSIT_DAYS"
        }
      },
      {
        "name": "ETA_actual",
        "type": "date",
        "calc": {
          "type": "addDays",
          "src": "ETD_actual",
          "by": "TRANSIT_DAYS"
        }
      },
      {
        "name": "Vessel_no",
        "type": "string",
        "note": "tên / số hiệu tàu"
      },
      {
        "name": "BL_no",
        "type": "string",
        "note": "số vận đơn"
      },
      {
        "name": "Delay_days",
        "type": "number",
        "auto": true,
        "note": "auto = ETD_actual − ETD_plan"
      }
    ]
  },
  "LSB_Project_handover_lesson": {
    "label": "Bài học dự án",
    "prefix": "PL",
    "idStyle": "year",
    "pk": "Lesson_id",
    "display": "Issue_description",
    "labelCols": [
      "Lesson_id",
      "Category"
    ],
    "listCols": [
      "Lesson_id",
      "Project_id",
      "Shipping_id",
      "Handover_day",
      "Phase",
      "Category",
      "Issue_description"
    ],
    "parentFk": "Project_id",
    "groupCol": "",
    "dateCol": "Handover_day",
    "view360": false,
    "columns": [
      {
        "name": "Lesson_id",
        "type": "string",
        "key": "PK",
        "note": "PL-2026-001"
      },
      {
        "name": "Project_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_project",
        "required": true
      },
      {
        "name": "Shipping_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_shipment",
        "note": "tùy chọn — bài học gắn với một lô hàng"
      },
      {
        "name": "Handover_day",
        "type": "date",
        "note": "ngày bàn giao / đóng dự án"
      },
      {
        "name": "Phase",
        "type": "string",
        "list": "Lesson_phase",
        "note": "Engineering / Procurement / Fabrication / QA-QC / Packing / Shipping / Erection / Payment"
      },
      {
        "name": "Category",
        "type": "string",
        "list": "Lesson_category",
        "note": "Cost / Schedule / Quality / Safety / Customer / Document"
      },
      {
        "name": "Issue_description",
        "type": "string",
        "long": true,
        "note": "sự việc / vấn đề"
      },
      {
        "name": "Root_cause",
        "type": "string",
        "long": true
      },
      {
        "name": "Impact_USD",
        "type": "number",
        "money": true,
        "note": "thiệt hại / tiết kiệm ước tính"
      },
      {
        "name": "Impact_days",
        "type": "number",
        "note": "số ngày trễ / sớm"
      },
      {
        "name": "What_went_well",
        "type": "string",
        "long": true
      },
      {
        "name": "To_improve",
        "type": "string",
        "long": true
      },
      {
        "name": "Action_next_project",
        "type": "string",
        "long": true,
        "note": "hành động áp dụng cho dự án sau"
      },
      {
        "name": "Customer_feedback",
        "type": "number",
        "min": 1,
        "max": 5,
        "note": "điểm khách hàng 1–5 khi bàn giao"
      },
      {
        "name": "Recorded_by",
        "type": "string",
        "key": "FK",
        "ref": "LSB_Staff"
      },
      {
        "name": "Year",
        "type": "number",
        "auto": true,
        "note": "auto từ Handover_day"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Handover_day"
      }
    ]
  },
  "LSB_payment_plan": {
    "label": "Kế hoạch thanh toán",
    "prefix": "PP",
    "idStyle": "year",
    "pk": "PaymentPlan_id",
    "display": "Payment_code",
    "labelCols": [
      "PaymentPlan_id",
      "Payment_code"
    ],
    "listCols": [
      "PaymentPlan_id",
      "Project_id",
      "Shipping_id",
      "Payment_code",
      "Payment_pct",
      "Payment_USD",
      "Due_day",
      "Pay_status"
    ],
    "parentFk": "Project_id",
    "groupCol": "",
    "dateCol": "Due_day",
    "view360": true,
    "columns": [
      {
        "name": "PaymentPlan_id",
        "type": "string",
        "key": "PK",
        "note": "PP-2026-001"
      },
      {
        "name": "Project_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_project",
        "required": true
      },
      {
        "name": "Shipping_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_shipment",
        "note": "tùy chọn — đợt gắn với lô hàng"
      },
      {
        "name": "Payment_code",
        "type": "string",
        "list": "Payment_code",
        "note": "Deposit / Progress / Final / Retention"
      },
      {
        "name": "Payment_pct",
        "type": "number",
        "pct": true,
        "min": 0,
        "max": 1,
        "note": "% giá trị HĐ"
      },
      {
        "name": "Payment_USD",
        "type": "number",
        "money": true
      },
      {
        "name": "Payment_VND",
        "type": "number",
        "calc": {
          "type": "mul",
          "src": "Payment_USD",
          "by": "FX_USD_VND"
        },
        "money": true
      },
      {
        "name": "Required_docs",
        "type": "string",
        "long": true,
        "note": "B/L, Invoice, Packing list …"
      },
      {
        "name": "Due_day",
        "type": "date"
      },
      {
        "name": "PP_revision",
        "type": "string",
        "min": 0,
        "max": 99,
        "note": "lần điều chỉnh kế hoạch thanh toán (1, 2…)"
      },
      {
        "name": "Collected_USD",
        "type": "number",
        "auto": true,
        "money": true,
        "note": "auto = SUM(LSB_paid)"
      },
      {
        "name": "Balance_USD",
        "type": "number",
        "auto": true,
        "money": true,
        "note": "auto = Payment − Collected"
      },
      {
        "name": "Pay_status",
        "type": "string",
        "auto": true,
        "note": "auto: Open / Partial / Paid / Overdue"
      }
    ]
  },
  "LSB_paid": {
    "label": "Tiền đã thu",
    "prefix": "PD",
    "idStyle": "year",
    "pk": "Paid_id",
    "display": "Invoice_no",
    "labelCols": [
      "Paid_id",
      "Invoice_no"
    ],
    "listCols": [
      "Paid_id",
      "PaymentPlan_id",
      "Invoice_no",
      "Invoice_day",
      "Paid_USD",
      "Payment_day"
    ],
    "parentFk": "PaymentPlan_id",
    "groupCol": "",
    "dateCol": "Payment_day",
    "view360": false,
    "columns": [
      {
        "name": "Paid_id",
        "type": "string",
        "key": "PK",
        "note": "PD-2026-001"
      },
      {
        "name": "PaymentPlan_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_payment_plan",
        "required": true
      },
      {
        "name": "Invoice_no",
        "type": "string"
      },
      {
        "name": "Invoice_day",
        "type": "date"
      },
      {
        "name": "Paid_USD",
        "type": "number",
        "money": true
      },
      {
        "name": "Paid_VND",
        "type": "number",
        "calc": {
          "type": "mul",
          "src": "Paid_USD",
          "by": "FX_USD_VND"
        },
        "money": true
      },
      {
        "name": "Payment_day",
        "type": "date"
      },
      {
        "name": "Year",
        "type": "number",
        "auto": true,
        "note": "auto từ Payment_day"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Payment_day"
      }
    ]
  },
  "LSB_cost": {
    "label": "Chi phí",
    "prefix": "CO",
    "idStyle": "year",
    "pk": "Cost_id",
    "display": "Vendor",
    "labelCols": [
      "Cost_id",
      "Vendor"
    ],
    "listCols": [
      "Cost_id",
      "Project_id",
      "Category",
      "Vendor",
      "Cost_USD",
      "Invoice_no",
      "Payment_day",
      "Cost_status"
    ],
    "parentFk": "Project_id",
    "groupCol": "",
    "dateCol": "Payment_day",
    "view360": false,
    "columns": [
      {
        "name": "Cost_id",
        "type": "string",
        "key": "PK",
        "note": "CO-2026-001"
      },
      {
        "name": "Project_id",
        "type": "string",
        "key": "FK",
        "ref": "LSB_project",
        "required": true
      },
      {
        "name": "Category",
        "type": "string",
        "list": "Cost_category",
        "note": "Material / Fabrication / Painting / Logistics / Other"
      },
      {
        "name": "Vendor",
        "type": "string"
      },
      {
        "name": "Cost_USD",
        "type": "number",
        "money": true
      },
      {
        "name": "Cost_VND",
        "type": "number",
        "calc": {
          "type": "mul",
          "src": "Cost_USD",
          "by": "FX_USD_VND"
        },
        "money": true
      },
      {
        "name": "Invoice_no",
        "type": "string",
        "note": "số hóa đơn nhà cung cấp"
      },
      {
        "name": "Payment_day",
        "type": "date"
      },
      {
        "name": "Cost_status",
        "type": "string",
        "list": "Cost_status",
        "note": "Planned / Invoiced / Paid"
      },
      {
        "name": "Year",
        "type": "number",
        "auto": true,
        "note": "auto từ Payment_day"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Payment_day"
      }
    ]
  },
  "LSB_Staff": {
    "label": "Nhân sự",
    "prefix": "ST",
    "idStyle": "catalog",
    "pk": "Staff_id",
    "display": "Full_name",
    "labelCols": [
      "Full_name"
    ],
    "listCols": [
      "Staff_id",
      "Full_name",
      "Role",
      "Email",
      "Access_level",
      "Active"
    ],
    "parentFk": "",
    "groupCol": "",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "Staff_id",
        "type": "string",
        "key": "PK",
        "note": "ST-001, tự sinh"
      },
      {
        "name": "Full_name",
        "type": "string",
        "required": true
      },
      {
        "name": "Role",
        "type": "string",
        "list": "Role",
        "note": "Sales / Sales Assistant / Estimator / PM / QA-QC / Logistics / Accounting / Manager"
      },
      {
        "name": "Email",
        "type": "string",
        "required": true,
        "unique": true,
        "format": "email",
        "note": "khớp tài khoản Google — dùng cho phân quyền"
      },
      {
        "name": "Phone",
        "type": "string"
      },
      {
        "name": "Access_level",
        "type": "string",
        "list": "Access_level",
        "required": true,
        "note": "Admin / Editor / Viewer"
      },
      {
        "name": "Active",
        "type": "string",
        "list": "YesNo",
        "required": true,
        "note": "Y / N"
      }
    ]
  },
  "LSB_Task": {
    "label": "Đầu việc chuẩn",
    "prefix": "TK",
    "idStyle": "catalog",
    "pk": "Task_id",
    "display": "Task_duty",
    "labelCols": [
      "Task_id",
      "Task_duty"
    ],
    "listCols": [
      "Task_id",
      "Phase",
      "Task_duty",
      "Default_role",
      "Std_duration_days",
      "Active"
    ],
    "parentFk": "",
    "groupCol": "Phase",
    "dateCol": "",
    "view360": false,
    "columns": [
      {
        "name": "Task_id",
        "type": "string",
        "key": "PK",
        "note": "TK-001"
      },
      {
        "name": "Phase",
        "type": "string",
        "list": "Task_phase",
        "required": true,
        "note": "Lead Qualification / Bidding / Contracting / Execution / Payment"
      },
      {
        "name": "Task_duty",
        "type": "string",
        "required": true,
        "note": "tên đầu việc"
      },
      {
        "name": "Default_role",
        "type": "string",
        "list": "Role",
        "note": "vai trò mặc định thực hiện"
      },
      {
        "name": "Std_duration_days",
        "type": "number",
        "min": 0,
        "max": 3650,
        "note": "số ngày chuẩn"
      },
      {
        "name": "Task_SOP",
        "type": "string",
        "format": "url",
        "note": "URL tài liệu SOP (Drive/Docs)"
      },
      {
        "name": "Active",
        "type": "string",
        "list": "YesNo",
        "note": "Y / N"
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
