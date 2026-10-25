"""test/data.json = dữ liệu thật v4.6 + vài dòng MINH HOẠ (đặt đầu bảng) để test chung tạo được bản ghi 1–1
(Bidding_strategy / Result_Lesson theo báo giá, Customer theo lead) và test nghiệp vụ có báo giá đang chạy."""
import json, os
H = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(H, '..', 'test')
d = json.load(open(os.path.join(T, 'data_real.json')))
def ins(table, rec):
    head = [c['v'] for c in d[table][0]]
    row = [{'v': ({'$d': rec[h] + 'T00:00:00'} if isinstance(rec.get(h), str) and len(rec[h]) == 10 and rec[h][4] == '-' and h.endswith(('day', 'Day', '_date')) else rec.get(h)), 'f': ''} for h in head]
    d[table].insert(1, row)
ins('LSB_Lead', {'Lead_id': 'LD-2026-002', 'Company_name': 'Demo Steel Co (minh hoạ)', 'Nation': 'Japan', 'Industry_segment': 'Factory',
                 'Lead_source': 'Website', 'Owner_id': 'ST-001', 'Created_day': '2026-08-20', 'Lead_status': 'Qualified'})
ins('LSB_Quotation', {'Quotation_code': 'QT-2026-002', 'Lead_id': 'LD-2026-002', 'Quotation_LSB_Code': '26B500', 'Project_name': 'Demo Factory (minh hoạ)',
                      'Value_USD': 900000, 'Value_VND': 23400000000, 'Issue_day': '2026-09-01', 'Win_probability': 0.4, 'Status': 'Submitted', 'Sales_id': 'ST-001'})
json.dump(d, open(os.path.join(T, 'data.json'), 'w'), ensure_ascii=False)
print('test/data.json: + LD-2026-002, QT-2026-002 (minh hoạ)')
