/**
 * 01_Config.gs — Cấu hình & lược đồ dữ liệu (schema) của LSB CRM · Project.
 *
 * Phần SCHEMA / LISTS được SINH TỰ ĐỘNG từ LSB_CRM_Bidding_Project_DB_v4.3_Project.xlsx (11 bảng)
 * (tools/extract_xlsx.py + tools/gen_config.py). Nếu đổi cột trong Google Sheet: sửa sheet →
 * chạy menu "LSB App › Kiểm tra cấu trúc" → cập nhật SCHEMA cho khớp.
 *
 * Quy ước cột:
 *   key: 'PK' | 'FK'      ref: bảng cha của FK; soft: true = mã không tồn tại chỉ CẢNH BÁO
 *   auto: true            cột công thức (xám) — app KHÔNG ghi đè
 *   list: tên danh mục    lấy giá trị từ LISTS (cho phép giá trị khác, chỉ cảnh báo)
 *   required / unique     bắt buộc / không trùng (quan hệ 1 : 0..1)
 *   pct                   lưu dạng tỷ lệ (0.3 = 30%), giao diện nhập theo %
 *   money / format(url|email) / long (ô nhập nhiều dòng) / min / max
 *   calc: { type: 'mul'|'addDays', src, by }  để trống → app tự tính từ cột src và hằng số APP[by]
 */

var APP = {
  NAME: 'LSB CRM · Project',
  VERSION: '2.6.0',
  SCHEMA_VERSION: 'v4.3_Project',
  // Để trống nếu script gắn (bound) vào chính Google Sheet dữ liệu.
  // Nếu dùng script độc lập, dán ID của Google Sheet vào đây.
  SPREADSHEET_ID: '',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
  HEADER_ROW: 1,
  FIRST_DATA_ROW: 2,
  LOG_SHEET: 'LSB_Activity_log',
  LOCK_TIMEOUT_MS: 20000,
  // v4.3_Project chỉ có 11 bảng dự án → TẮT module Đấu thầu & Báo giá (menu ẩn hẳn).
  // Module chỉ chạy khi cờ = true VÀ các bảng của module có trong SCHEMA (xem Config_moduleOn_).
  MODULES: { BIDDING: false, QUOTATION: false },
  // Ngưỡng cảnh báo (ngày) cho Notification.gs
  ALERT_DAYS: { TASK_DUE: 3, PAYMENT_DUE: 7, ETD: 7, RAD: 14 },
  ACTIVITY_PAGE_SIZE: 200,
  // Hằng số tự tính (cột calc) — khớp công thức mẫu ở dòng 2 của file v4.3.
  FX_USD_VND: 26000,     // Value_VND / Contract_VND = USD × FX_USD_VND
  TRANSIT_DAYS: 14       // ETA_plan / ETA_actual = ETD + TRANSIT_DAYS
};

/** Tên cột nối dự án ↔ báo giá (v4.3: LSB_project.Quotation_LSB-Code = LSB_Quotation.Quotation_LSB_Code). */
var PROJECT_QUOTE_COL = 'Quotation_LSB-Code';

/** Cấp quyền: số lớn hơn = quyền cao hơn. */
var ROLE_LEVEL = { Viewer: 1, Editor: 2, Admin: 3 };

/** Quyền tối thiểu cho từng loại thao tác. */
var PERMISSION = {
  READ: 'Viewer',
  WRITE: 'Editor',
  DELETE: 'Admin',
  CATALOG_WRITE: 'Admin',   // LSB_Staff, LSB_Task
  ACTIVITY_READ: 'Editor'
};

/** Bảng danh mục — chỉ Admin được thêm/sửa. */
var CATALOG_TABLES = ['LSB_Staff', 'LSB_Task'];

/** Đầu việc chuẩn (LSB_Task.Phase) được chọn cho từng bảng việc. */
var TASK_PHASE_FILTER = {
  LSB_Lead_Qualifying: ['Lead Qualification'],
  LSB_Bidding_action_plan: ['Lead Qualification', 'Bidding'],
  LSB_Project_task: ['Contracting', 'Execution', 'Payment']
};

/** Trạng thái báo giá còn "đang chạy" (tính pipeline). */
var QUOTATION_OPEN_STATUS = ['Draft', 'Submitted', 'Negotiating'];

/** Sheet nhật ký thay đổi (08_Activity.gs tự tạo nếu chưa có). */
var ACTIVITY_COLUMNS = ['Log_id', 'Timestamp', 'User_email', 'Staff_id', 'Action',
  'Table_name', 'Record_id', 'Changed_fields', 'Detail'];

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
    "Indonesia",
    "Other",
    "Thailand"
  ],
  "Industry_segment": [
    "Warehouse",
    "Factory",
    "Logistics",
    "Retail",
    "Cold storage",
    "Infrastructure",
    "Commercial",
    "Other",
    "EPC Main Contractor",
    "Steel Contractor",
    "Subsidiary Company"
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
    "module": "customer",
    "prefix": "LD",
    "idStyle": "year",
    "pk": "Lead_id",
    "display": "Company_name",
    "columns": [
      {
        "name": "Lead_id",
        "type": "string",
        "key": "PK",
        "note": "LD-2026-001"
      },
      {
        "name": "Company_name",
        "type": "string",
        "required": true
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
        "required": true,
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
  "LSB_Customer": {
    "label": "Khách hàng",
    "module": "customer",
    "prefix": "CU",
    "idStyle": "catalog",
    "pk": "Customer_id",
    "display": "Company_name",
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
    "module": "project",
    "prefix": "PJ",
    "idStyle": "year",
    "pk": "Project_id",
    "display": "Project_name",
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
        "note": "mã báo giá nội bộ thắng thầu (= LSB_Quotation.Quotation_LSB_Code, Status = Won) — nhập tay"
      },
      {
        "name": "Project_name",
        "type": "string",
        "required": true
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
        "money": true,
        "note": "để trống → tự tính = Contract_USD × tỷ giá (APP.FX_USD_VND)"
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
        "format": "url",
        "note": "link thư mục dữ liệu dự án (Drive / OneDrive)"
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
        "required": true,
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
    "module": "project",
    "prefix": "PT",
    "idStyle": "year",
    "pk": "Project_task_id",
    "display": "Task_duty",
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
    "module": "project",
    "prefix": "SH",
    "idStyle": "year",
    "pk": "Shipping_id",
    "display": "Shipment_code",
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
        "type": "string",
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
        },
        "note": "để trống → tự tính = ETD_plan + số ngày vận chuyển (APP.TRANSIT_DAYS)"
      },
      {
        "name": "ETA_actual",
        "type": "date",
        "calc": {
          "type": "addDays",
          "src": "ETD_actual",
          "by": "TRANSIT_DAYS"
        },
        "note": "để trống → tự tính = ETD_actual + số ngày vận chuyển (APP.TRANSIT_DAYS)"
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
    "module": "project",
    "prefix": "PL",
    "idStyle": "year",
    "pk": "Lesson_id",
    "display": "Issue_description",
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
        "required": true,
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
    "module": "project",
    "prefix": "PP",
    "idStyle": "year",
    "pk": "PaymentPlan_id",
    "display": "Payment_code",
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
        "required": true,
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
        "type": "number",
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
    "module": "project",
    "prefix": "PD",
    "idStyle": "year",
    "pk": "Paid_id",
    "display": "Invoice_no",
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
        "required": true,
        "money": true
      },
      {
        "name": "Paid_VND",
        "type": "number",
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
    "module": "project",
    "prefix": "CO",
    "idStyle": "year",
    "pk": "Cost_id",
    "display": "Vendor",
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
        "required": true,
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
        "money": true
      },
      {
        "name": "Invoice_code",
        "type": "date",
        "note": "ngày/mã hóa đơn — hiện là cột ngày, nguồn của Year/Quarter"
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
        "note": "auto từ Invoice_code"
      },
      {
        "name": "Quarter",
        "type": "string",
        "auto": true,
        "note": "auto từ Invoice_code"
      }
    ]
  },
  "LSB_Staff": {
    "label": "Nhân sự",
    "module": "user",
    "prefix": "ST",
    "idStyle": "catalog",
    "pk": "Staff_id",
    "display": "Full_name",
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
    "module": "user",
    "prefix": "TK",
    "idStyle": "catalog",
    "pk": "Task_id",
    "display": "Task_duty",
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
  if (!t) throw AppError_('NOT_FOUND', 'Không có bảng "' + name + '" trong cấu hình.');
  return t;
}

/** Bảng cần có để module chạy. */
var MODULE_TABLES = {
  BIDDING: ['LSB_Lead_Qualifying', 'LSB_Bidding_strategy', 'LSB_Bidding_action_plan', 'LSB_Result_Lesson', 'LSB_Quotation'],
  QUOTATION: ['LSB_Quotation']
};

/** Module bật khi cờ APP.MODULES = true và đủ bảng trong SCHEMA. */
function Config_moduleOn_(name) {
  return !!(APP.MODULES && APP.MODULES[name]) &&
    (MODULE_TABLES[name] || []).every(function (t) { return !!SCHEMA[t]; });
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
  return { app: { name: APP.NAME, version: APP.VERSION, schema: APP.SCHEMA_VERSION,
      modules: { BIDDING: Config_moduleOn_('BIDDING'), QUOTATION: Config_moduleOn_('QUOTATION') } },
    tables: SCHEMA, lists: LISTS, catalogs: CATALOG_TABLES, taskPhases: TASK_PHASE_FILTER,
    roles: ROLE_LEVEL, permission: PERMISSION,
    consts: { FX_USD_VND: APP.FX_USD_VND, TRANSIT_DAYS: APP.TRANSIT_DAYS } };
}
