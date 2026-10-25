"""Ghi các quyết định đã chốt (PSE10, 25/10/2026) vào tools/app_spec.json. Chạy lại được."""
import json, collections, os
O = collections.OrderedDict
P = os.path.join(os.path.dirname(__file__), 'app_spec.json')
s = json.load(open(P), object_pairs_hook=O)
s['app'].update(name='LSB CRM · Bidding · Project', brand='LSB CRM', subtitle=['CRM · Đấu thầu · Dự án', 'CRM · Bidding · Projects'],
                version='3.0.0', menuTitle='LSB App', alertDays=7, consts=O(FX_USD_VND=26000, TRANSIT_DAYS=14))
s['catalogs'] = ['LSB_Staff', 'LSB_Task']
T = s['tables']
def setT(n, **kw):
    for k, v in kw.items(): T[n][k] = v
FX = lambda src: O(type='mul', src=src, by='FX_USD_VND')
setT('LSB_Lead', label=['Lead', 'Lead'], display='Company_name', labelCols=['Company_name'],
     listCols=['Lead_id', 'Company_name', 'Nation', 'Lead_source', 'Owner_id', 'Created_day', 'Lead_status'],
     required=[], need=['Company_name', 'Lead_status'], view360=True)
setT('LSB_Lead_Qualifying', label=['Đánh giá lead', 'Lead qualification'], display='Task_duty', labelCols=['Qualification_id', 'Task_duty'],
     listCols=['Qualification_id', 'Lead_id', 'Task_id', 'Task_duty', 'Qual_Due_day', 'Qual_Status', 'Assessor_id'],
     parentFk='Lead_id', required=['Lead_id', 'Task_id'], need=['Qual_Start_day'], view360=False)
setT('LSB_Quotation', label=['Báo giá', 'Quotation'], display='Project_name', labelCols=['Quotation_LSB_Code', 'Project_name'],
     listCols=['Quotation_code', 'Quotation_LSB_Code', 'Lead_id', 'Project_name', 'Value_USD', 'Issue_day', 'Win_probability', 'Status'],
     parentFk='Lead_id', required=['Lead_id'], need=['Quotation_LSB_Code', 'Project_name', 'Value_USD', 'Issue_day', 'Status'],
     unique=['Quotation_LSB_Code'], pct=O(Win_probability=[0, 1]), range=O(Revision_no=[0, 99]),
     long=['Address', 'Scope'], money=['Value_USD', 'Value_VND'], calc=O(Value_VND=FX('Value_USD')), view360=True)
setT('LSB_Bidding_strategy', label=['Chiến lược thầu', 'Bidding strategy'], display='Win_theme', labelCols=['Strategy_id', 'Win_theme'],
     listCols=['Strategy_id', 'Quotation_code', 'Price_positioning', 'Win_theme', 'Key_competitors'],
     parentFk='Quotation_code', required=['Quotation_code'], unique=['Quotation_code'], need=['Price_positioning'],
     long=['Value_proposition', 'Strengths', 'Weaknesses', 'Key_competitors', 'Win_theme', 'Approach'], view360=False, dateCol='')
setT('LSB_Bidding_action_plan', label=['Kế hoạch hành động thầu', 'Bid action plan'], display='Task_duty', labelCols=['Action_id', 'Task_duty'],
     listCols=['Action_id', 'Lead_id', 'Quotation_code', 'Task_id', 'Task_duty', 'Owner_id', 'Due_day', 'Status'],
     parentFk='Lead_id', required=['Lead_id', 'Task_id'], need=['Start_day'], view360=False)
setT('LSB_Result_Lesson', label=['Kết quả & bài học thầu', 'Bid result & lesson'], display='Result', labelCols=['Result_id', 'Result'],
     listCols=['Result_id', 'Quotation_code', 'Result', 'Result_day', 'Winner', 'Win_loss_reason', 'Project_id'],
     parentFk='Quotation_code', required=['Quotation_code'], unique=['Quotation_code'], need=['Result', 'Result_day', 'Win_loss_reason'],
     pct=O(Price_gap_pct=[-1, 1]), money=[], long=['What_went_well', 'To_improve', 'Next_time_action'], dateCol='Result_day', view360=False,
     notes=O(Project_id='tùy chọn — dự án hình thành từ báo giá thắng (v4.6: chọn tay)', Price_gap_pct='chênh giá so với đơn vị thắng (0.05 = 5%)'))
setT('LSB_Customer', label=['Khách hàng', 'Customer'], display='Company_name', labelCols=['Company_name'],
     listCols=['Customer_id', 'Company_name', 'Lead_id', 'Nation', 'Contact', 'First_contract_day', 'Account_owner_id'],
     parentFk='Lead_id', required=['Lead_id'], unique=['Lead_id'], long=['Address'], dateCol='First_contract_day', view360=True)
setT('LSB_project', label=['Dự án', 'Project'], display='Project_name', labelCols=['Project_code', 'Project_name'],
     listCols=['Project_id', 'Project_code', 'Project_name', 'Customer_id', 'Contract_USD', 'Contract_day', 'PM_id', 'Status'],
     parentFk='Customer_id', required=['Customer_id'], need=['Project_name', 'Status'], unique=['Quotation_LSB-Code'],
     pct=O(Grossmargin_EST=[-1, 1], Grossmargin_Actual=[-1, 1]), range=O(RAD_Revision=[0, 99]), url=['URL_Project_data'],
     long=['Project_address'], money=['Contract_USD', 'Contract_VND'], calc=O(Contract_VND=FX('Contract_USD')),
     dateCol='Contract_day', view360=True)
setT('LSB_Project_task', label=['Đầu việc dự án', 'Project task'], display='Task_duty', labelCols=['Project_task_id', 'Task_duty'],
     listCols=['Project_task_id', 'Project_id', 'Task_id', 'Task_duty', 'Owner_id', 'Due_day', 'Status'],
     parentFk='Project_id', required=['Project_id', 'Task_id'], need=['Start_day'], view360=False)
setT('LSB_shipment', label=['Lô hàng', 'Shipment'], display='Shipment_code', labelCols=['Shipment_no', 'Shipment_code'],
     listCols=['Shipping_id', 'Project_id', 'Shipment_no', 'Shipment_code', 'Quantity_ton', 'ETD_plan', 'ETD_actual', 'ETA_plan'],
     parentFk='Project_id', required=['Project_id'], range=O(Shipment_no=[1, 999]),
     calc=O(ETA_plan=O(type='addDays', src='ETD_plan', by='TRANSIT_DAYS'), ETA_actual=O(type='addDays', src='ETD_actual', by='TRANSIT_DAYS')),
     dateCol='ETD_plan', view360=True)
setT('LSB_Project_handover_lesson', label=['Bài học dự án', 'Project lesson'], display='Issue_description', labelCols=['Lesson_id', 'Category'],
     listCols=['Lesson_id', 'Project_id', 'Shipping_id', 'Handover_day', 'Phase', 'Category', 'Issue_description'],
     parentFk='Project_id', required=['Project_id'], need=['Handover_day'], range=O(Customer_feedback=[1, 5]), money=['Impact_USD'],
     long=['Issue_description', 'Root_cause', 'What_went_well', 'To_improve', 'Action_next_project'], dateCol='Handover_day', view360=False)
setT('LSB_payment_plan', label=['Kế hoạch thanh toán', 'Payment milestone'], display='Payment_code', labelCols=['PaymentPlan_id', 'Payment_code'],
     listCols=['PaymentPlan_id', 'Project_id', 'Shipping_id', 'Payment_code', 'Payment_pct', 'Payment_USD', 'Due_day', 'Pay_status'],
     parentFk='Project_id', required=['Project_id'], need=['Payment_code', 'Payment_USD', 'Due_day'], pct=O(Payment_pct=[0, 1]),
     range=O(PP_revision=[0, 99]), long=['Required_docs'], money=['Payment_USD', 'Payment_VND', 'Collected_USD', 'Balance_USD'],
     calc=O(Payment_VND=FX('Payment_USD')), dateCol='Due_day', view360=True)
setT('LSB_paid', label=['Tiền đã thu', 'Payment received'], display='Invoice_no', labelCols=['Paid_id', 'Invoice_no'],
     listCols=['Paid_id', 'PaymentPlan_id', 'Invoice_no', 'Invoice_day', 'Paid_USD', 'Payment_day'],
     parentFk='PaymentPlan_id', required=['PaymentPlan_id'], need=['Paid_USD', 'Payment_day'], money=['Paid_USD', 'Paid_VND'],
     calc=O(Paid_VND=FX('Paid_USD')), dateCol='Payment_day', view360=False)
setT('LSB_cost', label=['Chi phí', 'Cost'], display='Vendor', labelCols=['Cost_id', 'Vendor'],
     listCols=['Cost_id', 'Project_id', 'Category', 'Vendor', 'Cost_USD', 'Invoice_no', 'Payment_day', 'Cost_status'],
     parentFk='Project_id', required=['Project_id'], need=['Category', 'Cost_USD'], money=['Cost_USD', 'Cost_VND'],
     calc=O(Cost_VND=FX('Cost_USD')), types=O(Invoice_no='string'), dateCol='Payment_day', view360=False)
setT('LSB_Staff', label=['Nhân sự', 'Staff'], display='Full_name', labelCols=['Full_name'], view360=False,
     listCols=['Staff_id', 'Full_name', 'Role', 'Email', 'Access_level', 'Active'],
     required=['Full_name', 'Email', 'Access_level', 'Active'], unique=['Email'])
setT('LSB_Task', label=['Đầu việc chuẩn', 'Standard task'], display='Task_duty', labelCols=['Task_id', 'Task_duty'], groupCol='Phase',
     listCols=['Task_id', 'Phase', 'Task_duty', 'Default_role', 'Std_duration_days', 'Active'], required=['Phase', 'Task_duty'],
     range=O(Std_duration_days=[0, 3650]), url=['Task_SOP'], view360=False, dateCol='')
for n in T:  # danh mục / cột ngày không có → idStyle theo file
    T[n].setdefault('groupCol', '')
s['menu'] = [
    O(group=['Bán hàng & thầu', 'Sales & bidding'], items=[O(table='LSB_Lead', icon='◎'), O(table='LSB_Lead_Qualifying', icon='✓'),
        O(table='LSB_Quotation', icon='₫'), O(table='LSB_Bidding_strategy', icon='♟'), O(table='LSB_Bidding_action_plan', icon='☰'),
        O(table='LSB_Result_Lesson', icon='★')]),
    O(group=['Khách hàng & dự án', 'Customers & projects'], items=[O(table='LSB_Customer', icon='◉'), O(table='LSB_project', icon='▣'),
        O(table='LSB_Project_task', icon='☑'), O(table='LSB_shipment', icon='⛴'), O(table='LSB_Project_handover_lesson', icon='✎')]),
    O(group=['Tài chính', 'Finance'], items=[O(table='LSB_payment_plan', icon='▤'), O(table='LSB_paid', icon='$'), O(table='LSB_cost', icon='↘')]),
    O(group=['Danh mục', 'Catalogs'], items=[O(table='LSB_Staff', icon='☺'), O(table='LSB_Task', icon='▦')])]
s['dateOrder'] = [['Start_day', 'Due_day'], ['Start_day', 'Done_day'], ['Qual_Start_day', 'Qual_Due_day'], ['Qual_Start_day', 'Qual_Done_day'],
                  ['Start_Fab', 'Completed_Fab'], ['ETD_plan', 'ETA_plan'], ['ETD_actual', 'ETA_actual'],
                  ['Contract_day', 'Kickoff_day'], ['Installation_date_start', 'Project_handover']]
s['alerts'] = [
    O(table='LSB_Lead_Qualifying', date='Qual_Due_day', title=[], warnDays=3, doneCol='Qual_Status', doneValues=['Done'], doneWhen='', ownerCol='Assessor_id', link='Lead_id'),
    O(table='LSB_Bidding_action_plan', date='Due_day', title=[], warnDays=3, doneCol='Status', doneValues=['Done'], doneWhen='', ownerCol='Owner_id', link='Lead_id'),
    O(table='LSB_Project_task', date='Due_day', title=[], warnDays=3, doneCol='Status', doneValues=['Done'], doneWhen='', ownerCol='Owner_id', link='Project_id'),
    O(table='LSB_payment_plan', date='Due_day', title=[], warnDays=7, doneCol='', doneValues=[], doneWhen='', ownerCol='', link='Project_id'),
    O(table='LSB_shipment', date='ETD_plan', title=['ETD lô hàng', 'Shipment ETD'], warnDays=7, doneCol='', doneValues=[], doneWhen='ETD_actual', ownerCol='', link='Project_id'),
    O(table='LSB_project', date='RAD_date', title=['Hạn giao RAD', 'RAD deadline'], warnDays=14, doneCol='Status', doneValues=['Closed', 'Installation Completed'], doneWhen='', ownerCol='PM_id', link='')]
s['dashboard'] = O(kpiTables=['LSB_Lead', 'LSB_Quotation', 'LSB_Customer', 'LSB_project', 'LSB_shipment', 'LSB_payment_plan'], metrics=[], providers=['Lsb_board_'])
s['needExtra'] = O()
s['autoUser'] = O(LSB_Lead=['Owner_id'], LSB_Lead_Qualifying=['Assessor_id'], LSB_Quotation=['Sales_id'], LSB_Bidding_action_plan=['Owner_id'],
                  LSB_Project_handover_lesson=['Recorded_by'])
s['defaults'] = O(LSB_Lead=O(Lead_status='New'), LSB_Lead_Qualifying=O(Qual_Status='Not started'), LSB_Quotation=O(Status='Draft'),
                  LSB_Bidding_action_plan=O(Status='Not started'), LSB_Project_task=O(Status='Not started'),
                  LSB_project=O(Status='Kick-off'), LSB_cost=O(Cost_status='Planned'))
s['providers'] = O(hooks=['Lsb_hooks_'], routes=['Lsb_routes_'], related=['Lsb_related_'], extra360=['Lsb_extra360_'], alerts=[], checks=['Lsb_checks_'])
json.dump(s, open(P, 'w'), ensure_ascii=False, indent=1)
print('app_spec.json cập nhật')

# ------------------------------------------------------------------ nhãn VN/EN
s = json.load(open(P), object_pairs_hook=O)
s['labels']['columns'] = O([
 ('Qualification_id', ['Mã đánh giá', 'Qualification ID']), ('Qual_Start_day', ['Ngày bắt đầu', 'Start date']),
 ('Qual_Due_day', ['Hạn', 'Due date']), ('Qual_Done_day', ['Ngày xong', 'Done date']), ('Qual_Status', ['Trạng thái việc', 'Task status']),
 ('Assessor_id', ['Người đánh giá', 'Assessor']), ('Quotation_code', ['Mã báo giá', 'Quotation ID']),
 ('Quotation_LSB_Code', ['Mã báo giá nội bộ', 'Internal quotation code']), ('Scope', ['Phạm vi', 'Scope']),
 ('Area_m2', ['Diện tích (m²)', 'Area (m²)']), ('Tonnage', ['Khối lượng (tấn)', 'Tonnage']),
 ('Value_USD', ['Giá trị (USD)', 'Value (USD)']), ('Value_VND', ['Giá trị (VND)', 'Value (VND)']),
 ('Quotation_owner', ['Chủ đầu tư', 'Project owner']), ('Quotation_Maincons', ['Tổng thầu', 'Main contractor']),
 ('Quotation_Consultant', ['Tư vấn', 'Consultant']), ('Issue_day', ['Ngày phát hành', 'Issue date']),
 ('Revision_no', ['Lần sửa giá', 'Revision']), ('Win_probability', ['Khả năng thắng', 'Win probability']),
 ('Sales_id', ['Sales phụ trách', 'Sales']), ('Sale_Assistant_id', ['Sales Assistant', 'Sales assistant']),
 ('Strategy_id', ['Mã chiến lược', 'Strategy ID']), ('Price_positioning', ['Định vị giá', 'Price positioning']),
 ('Value_proposition', ['Giá trị đề xuất', 'Value proposition']), ('Strengths', ['Điểm mạnh', 'Strengths']),
 ('Weaknesses', ['Điểm yếu', 'Weaknesses']), ('Key_competitors', ['Đối thủ chính', 'Key competitors']),
 ('Win_theme', ['Thông điệp thắng thầu', 'Win theme']), ('Approach', ['Cách tiếp cận', 'Approach']),
 ('Action_id', ['Mã hành động', 'Action ID']), ('Stage', ['Giai đoạn thầu', 'Bid stage']),
 ('Result_id', ['Mã kết quả', 'Result ID']), ('Result', ['Kết quả', 'Result']), ('Result_day', ['Ngày có kết quả', 'Result date']),
 ('Winner', ['Đơn vị thắng', 'Winner']), ('Price_gap_pct', ['Chênh giá', 'Price gap']),
 ('Win_loss_reason', ['Lý do thắng/thua', 'Win/loss reason']), ('Next_time_action', ['Hành động lần sau', 'Next-time action']),
 ('Invoice_no', ['Số hóa đơn', 'Invoice no.']),
 ('LSB_Bidding_action_plan.Status', ['Trạng thái việc', 'Task status']), ('LSB_Project_task.Status', ['Trạng thái việc', 'Task status']),
 ('LSB_Quotation.Status', ['Trạng thái báo giá', 'Quotation status']), ('LSB_project.Status', ['Trạng thái dự án', 'Project status']),
 ('LSB_Quotation.Address', ['Địa chỉ công trình', 'Site address']), ('LSB_Result_Lesson.Category', ['Nhóm bài học', 'Lesson category']),
 ('LSB_paid.Payment_day', ['Ngày nhận tiền', 'Received on']), ('LSB_cost.Payment_day', ['Ngày trả', 'Paid on']),
 ('LSB_cost.Category', ['Nhóm chi phí', 'Cost category']), ('LSB_Project_handover_lesson.Category', ['Nhóm bài học', 'Lesson category']),
 ('LSB_Task.Task_id', ['Mã đầu việc chuẩn', 'Standard task ID'])])
for t in ('LSB_cost',):
    T = s['tables'][t]; T['notes'].update(Year='auto từ Payment_day', Quarter='auto từ Payment_day')
E = {
 'LSB_Lead.Owner_id': 'Sales owner', 'LSB_Lead.Lead_website': 'Company website URL',
 'LSB_Lead_Qualifying.Qualification_id': 'QL-2026-001 — one row per lead-qualification task',
 'LSB_Lead_Qualifying.Task_id': 'standard task (Phase = Lead Qualification)', 'LSB_Lead_Qualifying.Qual_Start_day': 'start date',
 'LSB_Lead_Qualifying.Qual_Due_day': 'due date', 'LSB_Lead_Qualifying.Qual_Done_day': 'actual completion date', 'LSB_Lead_Qualifying.Assessor_id': 'assessor',
 'LSB_Quotation.Lead_id': 'direct link to the Lead (dropdown)', 'LSB_Quotation.Quotation_LSB_Code': 'LSB internal quotation code, e.g. 26B456',
 'LSB_Quotation.Address': 'site address', 'LSB_Quotation.Area_m2': 'building area (m²)', 'LSB_Quotation.Tonnage': 'tons',
 'LSB_Quotation.Quotation_owner': 'project owner / investor', 'LSB_Quotation.Quotation_Maincons': 'main contractor',
 'LSB_Quotation.Quotation_Consultant': 'consultant / designer', 'LSB_Quotation.Revision_no': 'current price revision',
 'LSB_Quotation.Sale_Assistant_id': 'supporting sales assistant',
 'LSB_Bidding_strategy.Quotation_code': 'unique (1–1)', 'LSB_Bidding_action_plan.Lead_id': 'required',
 'LSB_Bidding_action_plan.Quotation_code': 'optional — fill in once a quotation exists',
 'LSB_Bidding_action_plan.Stage': 'auto: blank Quotation_code → Qualify, filled → Quotation',
 'LSB_Result_Lesson.Quotation_code': 'unique (1–1)', 'LSB_Result_Lesson.Winner': 'winning bidder if lost',
 'LSB_Result_Lesson.Price_gap_pct': 'price gap vs. the winner (0.05 = 5%)', 'LSB_Result_Lesson.Category': 'lesson category',
 'LSB_Result_Lesson.Project_id': 'optional — project created from the won quotation (v4.6: picked manually)',
 'LSB_Customer.Lead_id': 'unique (1 lead → at most 1 customer)', 'LSB_Customer.Company_name': 'auto-copied from the Lead on conversion',
 'LSB_project.Project_code': 'internal code',
 'LSB_project.Quotation_LSB-Code': 'LSB internal quotation code = LSB_Quotation.Quotation_LSB_Code (typed in; warns if no match / not Won / duplicate)',
 'LSB_project.Project_address': 'site address', 'LSB_project.Project_owner': 'project owner / investor',
 'LSB_project.Project_Maincons': 'main contractor', 'LSB_project.Project_Consultant': 'consultant / designer',
 'LSB_project.Tonnage_EST': 'planned steel tonnage per contract', 'LSB_project.Tonnage_Actual': 'actual steel tonnage',
 'LSB_project.Grossmargin_EST': 'planned gross margin % (0.15 = 15%)', 'LSB_project.Grossmargin_Actual': 'actual gross margin % (0.18 = 18%)',
 'LSB_project.RAD_date': 'required delivery date (current)', 'LSB_project.RAD_Revision': 'number of RAD changes (0, 1, 2…)',
 'LSB_project.Installation_date_start': 'installation start date on site', 'LSB_project.Project_handover': 'project handover date to the customer',
 'LSB_Project_task.Phase': 'auto lookup from Task_id', 'LSB_Project_task.Task_duty': 'auto lookup from Task_id',
 'LSB_Lead_Qualifying.Task_duty': 'auto lookup from Task_id', 'LSB_Bidding_action_plan.Task_duty': 'auto lookup from Task_id',
 'LSB_shipment.Shipment_no': 'lot 1, 2, 3 …', 'LSB_shipment.Shipment_code': 'lot code by area/grid, e.g. B1-P1 (A-G)',
 'LSB_shipment.Container_qty_plan': 'planned containers', 'LSB_shipment.Container_qty_actual': 'actual containers',
 'LSB_shipment.Vessel_no': 'vessel name / number', 'LSB_shipment.BL_no': 'bill of lading no.',
 'LSB_Project_handover_lesson.Shipping_id': 'optional — lesson linked to a shipment', 'LSB_Project_handover_lesson.Handover_day': 'handover / closing date',
 'LSB_Project_handover_lesson.Issue_description': 'what happened / issue', 'LSB_Project_handover_lesson.Impact_USD': 'estimated loss / saving',
 'LSB_Project_handover_lesson.Impact_days': 'days late / early', 'LSB_Project_handover_lesson.Action_next_project': 'action to apply on the next project',
 'LSB_Project_handover_lesson.Customer_feedback': 'customer score 1–5 at handover',
 'LSB_payment_plan.Shipping_id': 'optional — milestone linked to a shipment', 'LSB_payment_plan.Payment_pct': '% of contract value',
 'LSB_payment_plan.PP_revision': 'payment plan revision (1, 2…)', 'LSB_cost.Invoice_no': 'supplier invoice number',
 'LSB_Staff.Staff_id': 'ST-001, auto-generated', 'LSB_Staff.Email': 'must match the Google account — used for access control',
 'LSB_Task.Task_duty': 'task name', 'LSB_Task.Default_role': 'default role that performs it',
 'LSB_Task.Std_duration_days': 'standard number of days', 'LSB_Task.Task_SOP': 'SOP document URL (Drive/Docs)'}
for t, src in [('LSB_Lead', 'Created_day'), ('LSB_Quotation', 'Issue_day'), ('LSB_Result_Lesson', 'Result_day'), ('LSB_project', 'Contract_day'),
               ('LSB_Project_handover_lesson', 'Handover_day'), ('LSB_paid', 'Payment_day'), ('LSB_cost', 'Payment_day')]:
    E[t + '.Year'] = 'auto from ' + src; E[t + '.Quarter'] = 'auto from ' + src
s['labels']['notesEn'] = O(sorted(E.items()))
json.dump(s, open(P, 'w'), ensure_ascii=False, indent=1)
print('nhãn cập nhật')
