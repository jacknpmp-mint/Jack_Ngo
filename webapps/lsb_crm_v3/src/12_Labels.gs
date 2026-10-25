/**
 * 12_Labels.gs — Nhãn song ngữ (SINH TỰ ĐỘNG bằng tools/gen_config.py từ app_spec.json › labels + tools/base_labels.json).
 * Muốn sửa nhãn: sửa app_spec.json rồi sinh lại. Khóa 'Bảng.Cột' ghi đè nhãn chung của cột.
 */

var I18N_TABLES = {
  "LSB_Lead": [
    "Lead",
    "Lead"
  ],
  "LSB_Lead_Qualifying": [
    "Đánh giá lead",
    "Lead qualification"
  ],
  "LSB_Quotation": [
    "Báo giá",
    "Quotation"
  ],
  "LSB_Bidding_strategy": [
    "Chiến lược thầu",
    "Bidding strategy"
  ],
  "LSB_Bidding_action_plan": [
    "Kế hoạch hành động thầu",
    "Bid action plan"
  ],
  "LSB_Result_Lesson": [
    "Kết quả & bài học thầu",
    "Bid result & lesson"
  ],
  "LSB_Customer": [
    "Khách hàng",
    "Customer"
  ],
  "LSB_project": [
    "Dự án",
    "Project"
  ],
  "LSB_Project_task": [
    "Đầu việc dự án",
    "Project task"
  ],
  "LSB_shipment": [
    "Lô hàng",
    "Shipment"
  ],
  "LSB_Project_handover_lesson": [
    "Bài học dự án",
    "Project lesson"
  ],
  "LSB_payment_plan": [
    "Kế hoạch thanh toán",
    "Payment milestone"
  ],
  "LSB_paid": [
    "Tiền đã thu",
    "Payment received"
  ],
  "LSB_cost": [
    "Chi phí",
    "Cost"
  ],
  "LSB_Staff": [
    "Nhân sự",
    "Staff"
  ],
  "LSB_Task": [
    "Đầu việc chuẩn",
    "Standard task"
  ]
};

var I18N_COLUMNS = {
  "Lead_id": [
    "Mã lead",
    "Lead ID"
  ],
  "Company_name": [
    "Tên công ty",
    "Company name"
  ],
  "Nation": [
    "Quốc gia",
    "Country"
  ],
  "Industry_segment": [
    "Ngành",
    "Industry segment"
  ],
  "Lead_source": [
    "Nguồn lead",
    "Lead source"
  ],
  "Contact_name": [
    "Người liên hệ",
    "Contact name"
  ],
  "Contact_title": [
    "Chức danh",
    "Contact title"
  ],
  "Contact_email": [
    "Email liên hệ",
    "Contact email"
  ],
  "Owner_id": [
    "Người phụ trách",
    "Owner"
  ],
  "Created_day": [
    "Ngày tạo",
    "Created on"
  ],
  "Lead_status": [
    "Trạng thái lead",
    "Lead status"
  ],
  "Lead_website": [
    "Website",
    "Website"
  ],
  "Year": [
    "Năm",
    "Year"
  ],
  "Quarter": [
    "Quý",
    "Quarter"
  ],
  "Qualification_id": [
    "Mã đánh giá",
    "Qualification ID"
  ],
  "Task_id": [
    "Đầu việc chuẩn",
    "Standard task"
  ],
  "Task_duty": [
    "Tên đầu việc",
    "Task"
  ],
  "Qual_Start_day": [
    "Ngày bắt đầu",
    "Start date"
  ],
  "Qual_Due_day": [
    "Hạn",
    "Due date"
  ],
  "Qual_Done_day": [
    "Ngày xong",
    "Done date"
  ],
  "Qual_Status": [
    "Trạng thái việc",
    "Task status"
  ],
  "Assessor_id": [
    "Người đánh giá",
    "Assessor"
  ],
  "Quotation_code": [
    "Mã báo giá",
    "Quotation ID"
  ],
  "Quotation_LSB_Code": [
    "Mã báo giá nội bộ",
    "Internal quotation code"
  ],
  "Project_name": [
    "Tên dự án",
    "Project name"
  ],
  "LSB_Quotation.Address": [
    "Địa chỉ công trình",
    "Site address"
  ],
  "Scope": [
    "Phạm vi",
    "Scope"
  ],
  "Area_m2": [
    "Diện tích (m²)",
    "Area (m²)"
  ],
  "Tonnage": [
    "Khối lượng (tấn)",
    "Tonnage"
  ],
  "Value_USD": [
    "Giá trị (USD)",
    "Value (USD)"
  ],
  "Value_VND": [
    "Giá trị (VND)",
    "Value (VND)"
  ],
  "Incoterm": [
    "Incoterm",
    "Incoterm"
  ],
  "Quotation_owner": [
    "Chủ đầu tư",
    "Project owner"
  ],
  "Quotation_Maincons": [
    "Tổng thầu",
    "Main contractor"
  ],
  "Quotation_Consultant": [
    "Tư vấn",
    "Consultant"
  ],
  "Issue_day": [
    "Ngày phát hành",
    "Issue date"
  ],
  "Revision_no": [
    "Lần sửa giá",
    "Revision"
  ],
  "Win_probability": [
    "Khả năng thắng",
    "Win probability"
  ],
  "LSB_Quotation.Status": [
    "Trạng thái báo giá",
    "Quotation status"
  ],
  "Sales_id": [
    "Sales phụ trách",
    "Sales"
  ],
  "Sale_Assistant_id": [
    "Sales Assistant",
    "Sales assistant"
  ],
  "Strategy_id": [
    "Mã chiến lược",
    "Strategy ID"
  ],
  "Price_positioning": [
    "Định vị giá",
    "Price positioning"
  ],
  "Value_proposition": [
    "Giá trị đề xuất",
    "Value proposition"
  ],
  "Strengths": [
    "Điểm mạnh",
    "Strengths"
  ],
  "Weaknesses": [
    "Điểm yếu",
    "Weaknesses"
  ],
  "Key_competitors": [
    "Đối thủ chính",
    "Key competitors"
  ],
  "Win_theme": [
    "Thông điệp thắng thầu",
    "Win theme"
  ],
  "Approach": [
    "Cách tiếp cận",
    "Approach"
  ],
  "Action_id": [
    "Mã hành động",
    "Action ID"
  ],
  "Stage": [
    "Giai đoạn thầu",
    "Bid stage"
  ],
  "Start_day": [
    "Ngày bắt đầu",
    "Start date"
  ],
  "Due_day": [
    "Hạn",
    "Due date"
  ],
  "Done_day": [
    "Ngày xong",
    "Done on"
  ],
  "LSB_Bidding_action_plan.Status": [
    "Trạng thái việc",
    "Task status"
  ],
  "Result_id": [
    "Mã kết quả",
    "Result ID"
  ],
  "Result": [
    "Kết quả",
    "Result"
  ],
  "Result_day": [
    "Ngày có kết quả",
    "Result date"
  ],
  "Winner": [
    "Đơn vị thắng",
    "Winner"
  ],
  "Price_gap_pct": [
    "Chênh giá",
    "Price gap"
  ],
  "Win_loss_reason": [
    "Lý do thắng/thua",
    "Win/loss reason"
  ],
  "What_went_well": [
    "Điều làm tốt",
    "What went well"
  ],
  "To_improve": [
    "Cần cải thiện",
    "To improve"
  ],
  "Next_time_action": [
    "Hành động lần sau",
    "Next-time action"
  ],
  "LSB_Result_Lesson.Category": [
    "Nhóm bài học",
    "Lesson category"
  ],
  "Project_id": [
    "Mã dự án",
    "Project ID"
  ],
  "Customer_id": [
    "Mã khách hàng",
    "Customer ID"
  ],
  "Tax_code": [
    "Mã số thuế",
    "Tax code"
  ],
  "Address": [
    "Địa chỉ",
    "Address"
  ],
  "Contact": [
    "Liên hệ",
    "Contact"
  ],
  "First_contract_day": [
    "Ngày HĐ đầu tiên",
    "First contract date"
  ],
  "Account_owner_id": [
    "Phụ trách khách hàng",
    "Account owner"
  ],
  "Project_code": [
    "Mã nội bộ",
    "Internal code"
  ],
  "Quotation_LSB-Code": [
    "Mã báo giá nội bộ",
    "Internal quotation code"
  ],
  "Project_address": [
    "Địa chỉ công trình",
    "Site address"
  ],
  "Project_owner": [
    "Chủ đầu tư",
    "Project owner"
  ],
  "Project_Maincons": [
    "Tổng thầu",
    "Main contractor"
  ],
  "Project_Consultant": [
    "Tư vấn",
    "Consultant"
  ],
  "Contract_no": [
    "Số hợp đồng",
    "Contract no."
  ],
  "Contract_USD": [
    "Giá trị HĐ (USD)",
    "Contract value (USD)"
  ],
  "Contract_VND": [
    "Giá trị HĐ (VND)",
    "Contract value (VND)"
  ],
  "Tonnage_EST": [
    "Tấn dự kiến",
    "Tonnage (planned)"
  ],
  "Tonnage_Actual": [
    "Tấn thực tế",
    "Tonnage (actual)"
  ],
  "Grossmargin_EST": [
    "Lãi gộp dự kiến",
    "Gross margin (planned)"
  ],
  "Grossmargin_Actual": [
    "Lãi gộp thực tế",
    "Gross margin (actual)"
  ],
  "Contract_day": [
    "Ngày ký HĐ",
    "Contract date"
  ],
  "Kickoff_day": [
    "Ngày kick-off",
    "Kick-off date"
  ],
  "RAD_date": [
    "Hạn giao (RAD)",
    "Required delivery (RAD)"
  ],
  "RAD_Revision": [
    "Số lần đổi RAD",
    "RAD revisions"
  ],
  "Installation_date_start": [
    "Bắt đầu lắp dựng",
    "Installation start"
  ],
  "Project_handover": [
    "Ngày bàn giao",
    "Handover date"
  ],
  "URL_Project_data": [
    "Thư mục dữ liệu dự án",
    "Project data folder"
  ],
  "PM_id": [
    "PM",
    "Project manager"
  ],
  "LSB_project.Status": [
    "Trạng thái dự án",
    "Project status"
  ],
  "Project_task_id": [
    "Mã đầu việc",
    "Task ID"
  ],
  "Phase": [
    "Giai đoạn",
    "Phase"
  ],
  "LSB_Project_task.Status": [
    "Trạng thái việc",
    "Task status"
  ],
  "Shipping_id": [
    "Mã lô hàng",
    "Shipment ID"
  ],
  "Shipment_no": [
    "Lô số",
    "Shipment no."
  ],
  "Shipment_code": [
    "Mã lô",
    "Shipment code"
  ],
  "Quantity_ton": [
    "Khối lượng (tấn)",
    "Quantity (tons)"
  ],
  "Container_qty_plan": [
    "Số container KH",
    "Containers (planned)"
  ],
  "Container_qty_actual": [
    "Số container TT",
    "Containers (actual)"
  ],
  "Start_Fab": [
    "Bắt đầu sản xuất",
    "Fabrication start"
  ],
  "Completed_Fab": [
    "Xong sản xuất",
    "Fabrication done"
  ],
  "ETD_plan": [
    "ETD kế hoạch",
    "ETD (planned)"
  ],
  "ETD_actual": [
    "ETD thực tế",
    "ETD (actual)"
  ],
  "ETA_plan": [
    "ETA kế hoạch",
    "ETA (planned)"
  ],
  "ETA_actual": [
    "ETA thực tế",
    "ETA (actual)"
  ],
  "Vessel_no": [
    "Tàu",
    "Vessel"
  ],
  "BL_no": [
    "Số vận đơn (B/L)",
    "B/L no."
  ],
  "Delay_days": [
    "Số ngày trễ",
    "Delay (days)"
  ],
  "Lesson_id": [
    "Mã bài học",
    "Lesson ID"
  ],
  "Handover_day": [
    "Ngày bàn giao",
    "Handover date"
  ],
  "LSB_Project_handover_lesson.Category": [
    "Nhóm bài học",
    "Lesson category"
  ],
  "Issue_description": [
    "Vấn đề",
    "Issue"
  ],
  "Root_cause": [
    "Nguyên nhân",
    "Root cause"
  ],
  "Impact_USD": [
    "Ảnh hưởng (USD)",
    "Impact (USD)"
  ],
  "Impact_days": [
    "Ảnh hưởng (ngày)",
    "Impact (days)"
  ],
  "Action_next_project": [
    "Áp dụng dự án sau",
    "Action for next project"
  ],
  "Customer_feedback": [
    "Điểm khách hàng",
    "Customer score"
  ],
  "Recorded_by": [
    "Người ghi",
    "Recorded by"
  ],
  "PaymentPlan_id": [
    "Mã đợt thanh toán",
    "Payment milestone ID"
  ],
  "Payment_code": [
    "Đợt",
    "Milestone"
  ],
  "Payment_pct": [
    "% giá trị HĐ",
    "% of contract"
  ],
  "Payment_USD": [
    "Số tiền (USD)",
    "Amount (USD)"
  ],
  "Payment_VND": [
    "Số tiền (VND)",
    "Amount (VND)"
  ],
  "Required_docs": [
    "Chứng từ yêu cầu",
    "Required documents"
  ],
  "PP_revision": [
    "Lần điều chỉnh",
    "Revision"
  ],
  "Collected_USD": [
    "Đã thu (USD)",
    "Collected (USD)"
  ],
  "Balance_USD": [
    "Còn lại (USD)",
    "Balance (USD)"
  ],
  "Pay_status": [
    "Tình trạng thu",
    "Payment status"
  ],
  "Paid_id": [
    "Mã thu tiền",
    "Payment ID"
  ],
  "Invoice_no": [
    "Số hóa đơn",
    "Invoice no."
  ],
  "Invoice_day": [
    "Ngày hóa đơn",
    "Invoice date"
  ],
  "Paid_USD": [
    "Đã thu (USD)",
    "Received (USD)"
  ],
  "Paid_VND": [
    "Đã thu (VND)",
    "Received (VND)"
  ],
  "LSB_paid.Payment_day": [
    "Ngày nhận tiền",
    "Received on"
  ],
  "Cost_id": [
    "Mã chi phí",
    "Cost ID"
  ],
  "LSB_cost.Category": [
    "Nhóm chi phí",
    "Cost category"
  ],
  "Vendor": [
    "Nhà cung cấp",
    "Vendor"
  ],
  "Cost_USD": [
    "Chi phí (USD)",
    "Cost (USD)"
  ],
  "Cost_VND": [
    "Chi phí (VND)",
    "Cost (VND)"
  ],
  "LSB_cost.Payment_day": [
    "Ngày trả",
    "Paid on"
  ],
  "Cost_status": [
    "Trạng thái chi phí",
    "Cost status"
  ],
  "Staff_id": [
    "Mã nhân sự",
    "Staff ID"
  ],
  "Full_name": [
    "Họ tên",
    "Full name"
  ],
  "Role": [
    "Vai trò",
    "Role"
  ],
  "Email": [
    "Email",
    "Email"
  ],
  "Phone": [
    "Điện thoại",
    "Phone"
  ],
  "Access_level": [
    "Quyền app",
    "App access"
  ],
  "Active": [
    "Đang hoạt động",
    "Active"
  ],
  "LSB_Task.Task_id": [
    "Mã đầu việc chuẩn",
    "Standard task ID"
  ],
  "Default_role": [
    "Vai trò mặc định",
    "Default role"
  ],
  "Std_duration_days": [
    "Số ngày chuẩn",
    "Standard duration (days)"
  ],
  "Task_SOP": [
    "Tài liệu SOP",
    "SOP document"
  ]
};

var I18N_NOTES_EN = {
  "LSB_Bidding_action_plan.Lead_id": "required",
  "LSB_Bidding_action_plan.Quotation_code": "optional — fill in once a quotation exists",
  "LSB_Bidding_action_plan.Stage": "auto: blank Quotation_code → Qualify, filled → Quotation",
  "LSB_Bidding_action_plan.Task_duty": "auto lookup from Task_id",
  "LSB_Bidding_strategy.Quotation_code": "unique (1–1)",
  "LSB_Customer.Company_name": "auto-copied from the Lead on conversion",
  "LSB_Customer.Lead_id": "unique (1 lead → at most 1 customer)",
  "LSB_Lead.Lead_website": "Company website URL",
  "LSB_Lead.Owner_id": "Sales owner",
  "LSB_Lead.Quarter": "auto from Created_day",
  "LSB_Lead.Year": "auto from Created_day",
  "LSB_Lead_Qualifying.Assessor_id": "assessor",
  "LSB_Lead_Qualifying.Qual_Done_day": "actual completion date",
  "LSB_Lead_Qualifying.Qual_Due_day": "due date",
  "LSB_Lead_Qualifying.Qual_Start_day": "start date",
  "LSB_Lead_Qualifying.Qualification_id": "QL-2026-001 — one row per lead-qualification task",
  "LSB_Lead_Qualifying.Task_duty": "auto lookup from Task_id",
  "LSB_Lead_Qualifying.Task_id": "standard task (Phase = Lead Qualification)",
  "LSB_Project_handover_lesson.Action_next_project": "action to apply on the next project",
  "LSB_Project_handover_lesson.Customer_feedback": "customer score 1–5 at handover",
  "LSB_Project_handover_lesson.Handover_day": "handover / closing date",
  "LSB_Project_handover_lesson.Impact_USD": "estimated loss / saving",
  "LSB_Project_handover_lesson.Impact_days": "days late / early",
  "LSB_Project_handover_lesson.Issue_description": "what happened / issue",
  "LSB_Project_handover_lesson.Quarter": "auto from Handover_day",
  "LSB_Project_handover_lesson.Shipping_id": "optional — lesson linked to a shipment",
  "LSB_Project_handover_lesson.Year": "auto from Handover_day",
  "LSB_Project_task.Phase": "auto lookup from Task_id",
  "LSB_Project_task.Task_duty": "auto lookup from Task_id",
  "LSB_Quotation.Address": "site address",
  "LSB_Quotation.Area_m2": "building area (m²)",
  "LSB_Quotation.Lead_id": "direct link to the Lead (dropdown)",
  "LSB_Quotation.Quarter": "auto from Issue_day",
  "LSB_Quotation.Quotation_Consultant": "consultant / designer",
  "LSB_Quotation.Quotation_LSB_Code": "LSB internal quotation code, e.g. 26B456",
  "LSB_Quotation.Quotation_Maincons": "main contractor",
  "LSB_Quotation.Quotation_owner": "project owner / investor",
  "LSB_Quotation.Revision_no": "current price revision",
  "LSB_Quotation.Sale_Assistant_id": "supporting sales assistant",
  "LSB_Quotation.Tonnage": "tons",
  "LSB_Quotation.Year": "auto from Issue_day",
  "LSB_Result_Lesson.Category": "lesson category",
  "LSB_Result_Lesson.Price_gap_pct": "price gap vs. the winner (0.05 = 5%)",
  "LSB_Result_Lesson.Project_id": "optional — project created from the won quotation (v4.6: picked manually)",
  "LSB_Result_Lesson.Quarter": "auto from Result_day",
  "LSB_Result_Lesson.Quotation_code": "unique (1–1)",
  "LSB_Result_Lesson.Winner": "winning bidder if lost",
  "LSB_Result_Lesson.Year": "auto from Result_day",
  "LSB_Staff.Email": "must match the Google account — used for access control",
  "LSB_Staff.Staff_id": "ST-001, auto-generated",
  "LSB_Task.Default_role": "default role that performs it",
  "LSB_Task.Std_duration_days": "standard number of days",
  "LSB_Task.Task_SOP": "SOP document URL (Drive/Docs)",
  "LSB_Task.Task_duty": "task name",
  "LSB_cost.Invoice_no": "supplier invoice number",
  "LSB_cost.Quarter": "auto from Payment_day",
  "LSB_cost.Year": "auto from Payment_day",
  "LSB_paid.Quarter": "auto from Payment_day",
  "LSB_paid.Year": "auto from Payment_day",
  "LSB_payment_plan.PP_revision": "payment plan revision (1, 2…)",
  "LSB_payment_plan.Payment_pct": "% of contract value",
  "LSB_payment_plan.Shipping_id": "optional — milestone linked to a shipment",
  "LSB_project.Grossmargin_Actual": "actual gross margin % (0.18 = 18%)",
  "LSB_project.Grossmargin_EST": "planned gross margin % (0.15 = 15%)",
  "LSB_project.Installation_date_start": "installation start date on site",
  "LSB_project.Project_Consultant": "consultant / designer",
  "LSB_project.Project_Maincons": "main contractor",
  "LSB_project.Project_address": "site address",
  "LSB_project.Project_code": "internal code",
  "LSB_project.Project_handover": "project handover date to the customer",
  "LSB_project.Project_owner": "project owner / investor",
  "LSB_project.Quarter": "auto from Contract_day",
  "LSB_project.Quotation_LSB-Code": "LSB internal quotation code = LSB_Quotation.Quotation_LSB_Code (typed in; warns if no match / not Won / duplicate)",
  "LSB_project.RAD_Revision": "number of RAD changes (0, 1, 2…)",
  "LSB_project.RAD_date": "required delivery date (current)",
  "LSB_project.Tonnage_Actual": "actual steel tonnage",
  "LSB_project.Tonnage_EST": "planned steel tonnage per contract",
  "LSB_project.Year": "auto from Contract_day",
  "LSB_shipment.BL_no": "bill of lading no.",
  "LSB_shipment.Container_qty_actual": "actual containers",
  "LSB_shipment.Container_qty_plan": "planned containers",
  "LSB_shipment.Shipment_code": "lot code by area/grid, e.g. B1-P1 (A-G)",
  "LSB_shipment.Shipment_no": "lot 1, 2, 3 …",
  "LSB_shipment.Vessel_no": "vessel name / number"
};
