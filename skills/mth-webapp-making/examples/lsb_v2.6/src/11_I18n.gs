/**
 * 11_I18n.gs — v2.5: song ngữ VN / EN.
 *  - Trình duyệt gửi ngôn ngữ ('vi' | 'en') kèm mỗi lệnh api(); server đặt LANG_ rồi trả thông báo lỗi /
 *    cảnh báo theo ngôn ngữ đó bằng L_(vi, en). Menu trong Google Sheet theo ngôn ngữ tài khoản Google.
 *  - Nhãn bảng / nhãn cột / ghi chú cột tiếng Anh nằm ở đây (01_Config.gs vẫn sinh lại được bằng tools/gen_config.py).
 *  - Giá trị danh mục (Status, Payment_code…) và tên cột trong Sheet KHÔNG đổi.
 */

var LANG_ = 'vi';

function I18n_set_(lang) { LANG_ = lang === 'en' ? 'en' : 'vi'; }

/** Chuỗi theo ngôn ngữ hiện tại. */
function L_(vi, en) { return LANG_ === 'en' && en ? en : vi; }

/** Ngôn ngữ tài khoản Google (menu trong Sheet — không có lựa chọn của trình duyệt). */
function I18n_fromUserLocale_() {
  var loc = '';
  try { loc = String(Session.getActiveUserLocale() || ''); } catch (e) { loc = ''; }
  I18n_set_(!loc || /^vi/i.test(loc) ? 'vi' : 'en');
}

/** Nhãn bảng [vi, en]. */
var I18N_TABLES = {
  LSB_Lead: ['Lead', 'Lead'],
  LSB_Customer: ['Khách hàng', 'Customer'],
  LSB_project: ['Dự án', 'Project'],
  LSB_Project_task: ['Đầu việc dự án', 'Project task'],
  LSB_shipment: ['Lô hàng', 'Shipment'],
  LSB_Project_handover_lesson: ['Bài học dự án', 'Project lesson'],
  LSB_payment_plan: ['Kế hoạch thanh toán', 'Payment milestone'],
  LSB_paid: ['Tiền đã thu', 'Payment received'],
  LSB_cost: ['Chi phí', 'Cost'],
  LSB_Staff: ['Nhân sự', 'Staff'],
  LSB_Task: ['Đầu việc chuẩn', 'Standard task'],
  LSB_Quotation: ['Báo giá', 'Quotation'],
  LSB_Lead_Qualifying: ['Đánh giá lead', 'Lead qualification'],
  LSB_Bidding_strategy: ['Chiến lược thầu', 'Bidding strategy'],
  LSB_Bidding_action_plan: ['Kế hoạch hành động thầu', 'Bid action plan'],
  LSB_Result_Lesson: ['Kết quả & bài học thầu', 'Bid result & lesson']
};

/** Nhãn cột thân thiện [vi, en] theo tên cột; khóa 'Bảng.Cột' ghi đè cho bảng cụ thể. */
var I18N_COLUMNS = {
  Lead_id: ['Mã lead', 'Lead ID'], Company_name: ['Tên công ty', 'Company name'], Nation: ['Quốc gia', 'Country'],
  Industry_segment: ['Ngành', 'Industry segment'], Lead_source: ['Nguồn lead', 'Lead source'],
  Contact_name: ['Người liên hệ', 'Contact name'], Contact_title: ['Chức danh', 'Contact title'],
  Contact_email: ['Email liên hệ', 'Contact email'], Owner_id: ['Người phụ trách', 'Owner'],
  Created_day: ['Ngày tạo', 'Created on'], Lead_status: ['Trạng thái lead', 'Lead status'], Lead_website: ['Website', 'Website'],
  Year: ['Năm', 'Year'], Quarter: ['Quý', 'Quarter'],
  Customer_id: ['Mã khách hàng', 'Customer ID'], Tax_code: ['Mã số thuế', 'Tax code'], Address: ['Địa chỉ', 'Address'],
  Contact: ['Liên hệ', 'Contact'], First_contract_day: ['Ngày HĐ đầu tiên', 'First contract date'],
  Account_owner_id: ['Phụ trách khách hàng', 'Account owner'],
  Project_id: ['Mã dự án', 'Project ID'], Project_code: ['Mã nội bộ', 'Internal code'],
  'Quotation_LSB-Code': ['Mã báo giá nội bộ', 'Internal quotation code'], Project_name: ['Tên dự án', 'Project name'],
  Project_address: ['Địa chỉ công trình', 'Site address'], Project_owner: ['Chủ đầu tư', 'Project owner'],
  Project_Maincons: ['Tổng thầu', 'Main contractor'], Project_Consultant: ['Tư vấn', 'Consultant'],
  Contract_no: ['Số hợp đồng', 'Contract no.'], Contract_USD: ['Giá trị HĐ (USD)', 'Contract value (USD)'],
  Contract_VND: ['Giá trị HĐ (VND)', 'Contract value (VND)'], Incoterm: ['Incoterm', 'Incoterm'],
  Tonnage_EST: ['Tấn dự kiến', 'Tonnage (planned)'], Tonnage_Actual: ['Tấn thực tế', 'Tonnage (actual)'],
  Grossmargin_EST: ['Lãi gộp dự kiến', 'Gross margin (planned)'], Grossmargin_Actual: ['Lãi gộp thực tế', 'Gross margin (actual)'],
  Contract_day: ['Ngày ký HĐ', 'Contract date'], Kickoff_day: ['Ngày kick-off', 'Kick-off date'],
  RAD_date: ['Hạn giao (RAD)', 'Required delivery (RAD)'], RAD_Revision: ['Số lần đổi RAD', 'RAD revisions'],
  Installation_date_start: ['Bắt đầu lắp dựng', 'Installation start'], Project_handover: ['Ngày bàn giao', 'Handover date'],
  URL_Project_data: ['Thư mục dữ liệu dự án', 'Project data folder'], PM_id: ['PM', 'Project manager'],
  Status: ['Trạng thái', 'Status'],
  Project_task_id: ['Mã đầu việc', 'Task ID'], Task_id: ['Đầu việc chuẩn', 'Standard task'], Phase: ['Giai đoạn', 'Phase'],
  Task_duty: ['Tên đầu việc', 'Task'], Start_day: ['Ngày bắt đầu', 'Start date'], Due_day: ['Hạn', 'Due date'],
  Done_day: ['Ngày xong', 'Done date'],
  Shipping_id: ['Mã lô hàng', 'Shipment ID'], Shipment_no: ['Lô số', 'Shipment no.'], Shipment_code: ['Mã lô', 'Shipment code'],
  Quantity_ton: ['Khối lượng (tấn)', 'Quantity (tons)'], Container_qty_plan: ['Số container KH', 'Containers (planned)'],
  Container_qty_actual: ['Số container TT', 'Containers (actual)'], Start_Fab: ['Bắt đầu sản xuất', 'Fabrication start'],
  Completed_Fab: ['Xong sản xuất', 'Fabrication done'], ETD_plan: ['ETD kế hoạch', 'ETD (planned)'],
  ETD_actual: ['ETD thực tế', 'ETD (actual)'], ETA_plan: ['ETA kế hoạch', 'ETA (planned)'], ETA_actual: ['ETA thực tế', 'ETA (actual)'],
  Vessel_no: ['Tàu', 'Vessel'], BL_no: ['Số vận đơn (B/L)', 'B/L no.'], Delay_days: ['Số ngày trễ', 'Delay (days)'],
  Lesson_id: ['Mã bài học', 'Lesson ID'], Handover_day: ['Ngày bàn giao', 'Handover date'], Category: ['Nhóm', 'Category'],
  Issue_description: ['Vấn đề', 'Issue'], Root_cause: ['Nguyên nhân', 'Root cause'], Impact_USD: ['Ảnh hưởng (USD)', 'Impact (USD)'],
  Impact_days: ['Ảnh hưởng (ngày)', 'Impact (days)'], What_went_well: ['Điều làm tốt', 'What went well'],
  To_improve: ['Cần cải thiện', 'To improve'], Action_next_project: ['Áp dụng dự án sau', 'Action for next project'],
  Customer_feedback: ['Điểm khách hàng', 'Customer score'], Recorded_by: ['Người ghi', 'Recorded by'],
  PaymentPlan_id: ['Mã đợt thanh toán', 'Payment milestone ID'], Payment_code: ['Đợt', 'Milestone'],
  Payment_pct: ['% giá trị HĐ', '% of contract'], Payment_USD: ['Số tiền (USD)', 'Amount (USD)'], Payment_VND: ['Số tiền (VND)', 'Amount (VND)'],
  Required_docs: ['Chứng từ yêu cầu', 'Required documents'], PP_revision: ['Lần điều chỉnh', 'Revision'],
  Collected_USD: ['Đã thu (USD)', 'Collected (USD)'], Balance_USD: ['Còn lại (USD)', 'Balance (USD)'], Pay_status: ['Tình trạng thu', 'Payment status'],
  Paid_id: ['Mã thu tiền', 'Payment ID'], Invoice_no: ['Số hóa đơn', 'Invoice no.'], Invoice_day: ['Ngày hóa đơn', 'Invoice date'],
  Paid_USD: ['Đã thu (USD)', 'Received (USD)'], Paid_VND: ['Đã thu (VND)', 'Received (VND)'], Payment_day: ['Ngày thanh toán', 'Payment date'],
  Cost_id: ['Mã chi phí', 'Cost ID'], Vendor: ['Nhà cung cấp', 'Vendor'], Cost_USD: ['Chi phí (USD)', 'Cost (USD)'],
  Cost_VND: ['Chi phí (VND)', 'Cost (VND)'], Invoice_code: ['Ngày hóa đơn', 'Invoice date'], Cost_status: ['Trạng thái chi phí', 'Cost status'],
  Staff_id: ['Mã nhân sự', 'Staff ID'], Full_name: ['Họ tên', 'Full name'], Role: ['Vai trò', 'Role'], Email: ['Email', 'Email'],
  Phone: ['Điện thoại', 'Phone'], Access_level: ['Quyền app', 'App access'], Active: ['Đang hoạt động', 'Active'],
  Default_role: ['Vai trò mặc định', 'Default role'], Std_duration_days: ['Số ngày chuẩn', 'Standard duration (days)'],
  Task_SOP: ['Tài liệu SOP', 'SOP document'],
  'LSB_Project_task.Status': ['Trạng thái việc', 'Task status'],
  'LSB_paid.Payment_day': ['Ngày nhận tiền', 'Received on'], 'LSB_cost.Payment_day': ['Ngày trả', 'Paid on'],
  'LSB_cost.Category': ['Nhóm chi phí', 'Cost category'], 'LSB_Project_handover_lesson.Category': ['Nhóm bài học', 'Lesson category'],
  'LSB_Task.Task_id': ['Mã đầu việc chuẩn', 'Standard task ID']
};

/** Ghi chú cột tiếng Anh theo 'Bảng.Cột' (tiếng Việt lấy từ note trong 01_Config.gs). */
var I18N_NOTES_EN = {
  'LSB_Lead.Owner_id': 'Sales owner',
  'LSB_Lead.Lead_website': 'Company website URL',
  'LSB_Lead.Year': 'auto from Created_day', 'LSB_Lead.Quarter': 'auto from Created_day',
  'LSB_Customer.Lead_id': 'unique (1 lead → at most 1 customer)',
  'LSB_Customer.Company_name': 'auto-copied from the Lead on conversion',
  'LSB_project.Project_code': 'internal code',
  'LSB_project.Quotation_LSB-Code': 'internal code of the won quotation (= LSB_Quotation.Quotation_LSB_Code, Status = Won) — typed in',
  'LSB_project.Project_address': 'construction site address',
  'LSB_project.Project_owner': 'project owner / investor',
  'LSB_project.Project_Maincons': 'main contractor',
  'LSB_project.Project_Consultant': 'consultant / designer',
  'LSB_project.Contract_VND': 'leave blank → auto = Contract_USD × exchange rate (APP.FX_USD_VND)',
  'LSB_project.Tonnage_EST': 'planned steel tonnage per contract',
  'LSB_project.Tonnage_Actual': 'actual steel tonnage',
  'LSB_project.Grossmargin_EST': 'planned gross margin % (0.15 = 15%)',
  'LSB_project.Grossmargin_Actual': 'actual gross margin % (0.18 = 18%)',
  'LSB_project.RAD_date': 'required delivery date (current)',
  'LSB_project.RAD_Revision': 'number of RAD changes (0, 1, 2…)',
  'LSB_project.Installation_date_start': 'installation start date on site',
  'LSB_project.Project_handover': 'project handover date to the customer',
  'LSB_project.URL_Project_data': 'project data folder link (Drive / OneDrive)',
  'LSB_project.Year': 'auto from Contract_day', 'LSB_project.Quarter': 'auto from Contract_day',
  'LSB_Project_task.Phase': 'auto lookup from Task_id', 'LSB_Project_task.Task_duty': 'auto lookup from Task_id',
  'LSB_shipment.Shipment_no': 'lot 1, 2, 3 …',
  'LSB_shipment.Shipment_code': 'lot code by area/grid, e.g. B1-P1 (A-G)',
  'LSB_shipment.Container_qty_plan': 'planned containers', 'LSB_shipment.Container_qty_actual': 'actual containers',
  'LSB_shipment.ETA_plan': 'leave blank → auto = ETD_plan + transit days (APP.TRANSIT_DAYS)',
  'LSB_shipment.ETA_actual': 'leave blank → auto = ETD_actual + transit days (APP.TRANSIT_DAYS)',
  'LSB_shipment.Vessel_no': 'vessel name / number', 'LSB_shipment.BL_no': 'bill of lading no.',
  'LSB_Project_handover_lesson.Shipping_id': 'optional — lesson linked to a shipment',
  'LSB_Project_handover_lesson.Handover_day': 'handover / closing date',
  'LSB_Project_handover_lesson.Issue_description': 'what happened / issue',
  'LSB_Project_handover_lesson.Impact_USD': 'estimated loss / saving',
  'LSB_Project_handover_lesson.Impact_days': 'days late / early',
  'LSB_Project_handover_lesson.Action_next_project': 'action to apply on the next project',
  'LSB_Project_handover_lesson.Customer_feedback': 'customer score 1–5 at handover',
  'LSB_Project_handover_lesson.Year': 'auto from Handover_day', 'LSB_Project_handover_lesson.Quarter': 'auto from Handover_day',
  'LSB_payment_plan.Shipping_id': 'optional — milestone linked to a shipment',
  'LSB_payment_plan.Payment_pct': '% of contract value',
  'LSB_payment_plan.PP_revision': 'payment plan revision (1, 2…)',
  'LSB_payment_plan.Payment_VND': 'leave blank → auto = Payment_USD × exchange rate (APP.FX_USD_VND)',
  'LSB_paid.Paid_VND': 'leave blank → auto = Paid_USD × exchange rate (APP.FX_USD_VND)',
  'LSB_paid.Year': 'auto from Payment_day', 'LSB_paid.Quarter': 'auto from Payment_day',
  'LSB_cost.Cost_VND': 'leave blank → auto = Cost_USD × exchange rate (APP.FX_USD_VND)',
  'LSB_cost.Invoice_code': 'invoice date/code — currently a date column, source of Year/Quarter',
  'LSB_cost.Year': 'auto from Invoice_code', 'LSB_cost.Quarter': 'auto from Invoice_code',
  'LSB_Staff.Staff_id': 'ST-001, auto-generated',
  'LSB_Staff.Email': 'must match the Google account — used for access control',
  'LSB_Task.Task_duty': 'task name', 'LSB_Task.Default_role': 'default role that performs it',
  'LSB_Task.Std_duration_days': 'standard number of days', 'LSB_Task.Task_SOP': 'SOP document URL (Drive/Docs)'
};

/** Nhãn bảng theo ngôn ngữ hiện tại. */
function I18n_tableLabel_(table) {
  var t = I18N_TABLES[table];
  return t ? L_(t[0], t[1]) : (SCHEMA[table] ? SCHEMA[table].label : table);
}

/** Gói gửi xuống trình duyệt (bootstrap). */
function I18n_schema_() {
  return { tables: I18N_TABLES, columns: I18N_COLUMNS, notesEn: I18N_NOTES_EN };
}
