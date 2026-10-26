# LSB Selling Price DB — Bàn giao context Web App

*Cập nhật: 26/10/2026 (lần 1 — Web App v1.0 + file dữ liệu R05). Mở session mới: đính kèm file này + `LSB_SellingPrice_WebApp_v1.0.zip` + file xlsx đang dùng thật (xuất từ Google Sheet), nói: "Tiếp tục LSB Selling Price DB theo file bàn giao, dùng skill mth-webapp-making."*

## 1. Mục tiêu
Thu thập giá đầu vào, giá vốn, lãi gộp, giá bán đơn vị theo dự án / khách hàng / thị trường để xem lại giá thực tế và làm cơ sở báo giá dự án sau. App **riêng, Google Sheet riêng** (không nối mã với LSB CRM v2.6). Vòng đời: Danh mục (Markets, Customers, Items, Materials) → FX_Rates → Material_Prices → Projects → Project_Items / Freight / Inputs_Bid → (Won) → dòng Job + Inputs_Job.

## 2. Session 1 (26/10/2026) — App mới từ Selling_Price_Database_R04_EN.xlsx

**Đã chốt qua phỏng vấn (4 vòng + duyệt bản mẫu [Artifact](https://claude.ai/artifact/Hvovbrfri5FVU1ogGX3znj)):**

| Hạng mục | Quyết định |
| --- | --- |
| Phạm vi | App riêng, Sheet riêng |
| Đăng nhập | Thêm sheet Staff (email, access_level, active) + nhật ký thay đổi |
| Mã PK | Tự sinh đúng mẫu file (TT-01, CUS-0001, ITM-01, MAT-0001, PRC-00001, PRJ-0001, PIT/FRT/INB/INJ-00001); hiện trước, cấp khi Lưu |
| FX_Rates | Thêm cột `fx_id` (FX-0001) cuối bảng; ngày + tiền tệ vẫn unique |
| Bắt buộc | Chỉ PK + FK; cột Required khác → cờ Thiếu dữ liệu (danh mục Admin giữ bắt buộc) |
| Công thức | Giữ công thức Sheet; form xem trước tỷ giá / giá quy đổi / GM% |
| Tiền tệ | Gốc VND + lưu USD trên từng dòng (tỷ giá USD đúng ngày của dòng); Peso → PHP |
| Bid → Job | Nút chép Project_Items Bid + Inputs_Bid sang Job, bỏ dòng đã có, price_date trống; chỉ khi Won/Completed (theo bản mẫu đã duyệt) |
| Dashboard / phân tích | Tra cứu giá tham khảo · Tổng hợp theo KH / thị trường / item / nhóm VT × thị trường / × khách hàng (thêm Won/Lost, tỷ lệ thắng) · Bid vs Job |
| Kỳ lọc | quote_date |
| Cảnh báo | Thiếu tỷ giá; dự án chưa có dòng item Bid |
| Quyền | Admin: Markets / Items / Materials / FX_Rates / Config / Staff; Editor: Customers, Material_Prices, Projects, Project_* |
| Dòng mẫu | Xóa hết "(example)" ở R05, giữ 6 thị trường |
| Bàn giao | LSB Selling Price DB v1.0 · zip + hướng dẫn + file này · GitHub `webapps/lsb_selling_price/` |

**Áp dụng (không hỏi riêng, có thể đổi):** ST-001 Admin = email tài khoản Claude của người dùng (jackn.pmp@gmail.com); không đặt giá trị mặc định khi thêm mới; không thêm quy tắc thứ tự ngày (quote ≤ contract); Admin chỉ thêm / xóa giá trị chưa dùng trong Config (không đổi tên, Stage cố định, tiền gốc chỉ xem); tỷ giá trùng ngày + tiền tệ bị chặn trong app (Sheet cộng SUMIFS nếu trùng — Kiểm tra dữ liệu báo lỗi).

**Đã làm:**
- `Selling_Price_Database_R05_EN.xlsx` (script `tools/fix_spd_r05.py`, sửa XML): Staff, fx_id, 13 cột USD, PHP, xóa dòng mẫu, DataDictionary +21, README mục 7, fullCalcOnLoad. Kiểm bằng LibreOffice: công thức USD đúng.
- Web App 24 file `src/`: lõi bộ khung (chỉnh: header dòng 2 / dữ liệu dòng 4, mã `seq` theo số chữ số, INIT_PROVIDERS, UI.FORM_PREVIEW, sheet nhật ký vẫn header dòng 1) + `20_Spd.gs` + `Custom.html`.
- Công cụ: `extract_spd.py` (lược đồ từ DataDictionary + danh mục Config), `make_spec_spd.py` (quyết định → app_spec.json), `make_fixture_spd.py` (dữ liệu minh hoạ test), `gen_config.py` (đã thêm idWidth, header row, init).

**Trạng thái:** 35/35 backend + 19/19 giao diện (mô phỏng) — **chưa chạy trên Google thật**.

## 3. Quyết định đã chốt (tích lũy)
| Hạng mục | Quyết định | Ngày |
| --- | --- | --- |
| Nền tảng | Google Sheets + Apps Script Web App; bộ khung mth-webapp-making | 26/10/2026 |
| Phân quyền | Staff (email, access_level, active) + chia sẻ Sheet; Viewer / Editor / Admin | 26/10/2026 |
| Hai tiền gốc | VND (Config!B3) + USD theo ngày của từng dòng | 26/10/2026 |
| Các mục ở bảng mục 2 | | 26/10/2026 |

## 4. Mô hình dữ liệu
Sheet: dòng 1 tiêu đề, **dòng 2 = mã cột** (app đọc), dòng 3 = nhãn (tiêu đề Excel Table), dữ liệu từ dòng 4. Danh mục: Config dòng 7 = tên, 8–37 = giá trị.
Staff (ST) · Markets (TT) · Customers (CUS) · Items (ITM) · Materials (MAT) · FX_Rates (FX) · Material_Prices (PRC → Materials) · Projects (PRJ → Customers, Markets) · Project_Items (PIT → Projects, Items) · Project_Freight (FRT → Projects) · Project_Inputs_Bid / Job (INB / INJ → Projects, Materials, Material_Prices). Nguồn cấu hình: `tools/make_spec_spd.py` → `app_spec.json`.

## 5. Lỗi dữ liệu / điểm còn mở
| Điểm | Ghi chú |
| --- | --- |
| File thật gần như trống | Chỉ 6 thị trường + ST-001 — nghiệm thu bằng dữ liệu nhập mới |
| Excel Table khi nhập Google Sheets | Chưa thử trên Google thật; nếu lỗi ghi → chuyển bảng về dải ô |
| Sum_* sheets | Giữ nguyên (vẫn quy đổi hiển thị bằng 1 tỷ giá); app có Tổng hợp riêng theo USD từng dòng |
| Nhóm vật tư dịch | README R04: 'Steel sheeting', 'Cold-formed steel - bracing' cần người dùng xác nhận |

## 6. Deliverables
| Sản phẩm | Trạng thái |
| --- | --- |
| `LSB_SellingPrice_WebApp_v1.0.zip` | **Bản mới nhất** — chờ dán + nghiệm thu (HUONG_DAN mục 2) |
| `Selling_Price_Database_R05_EN.xlsx` | File dữ liệu hiện hành |
| Bản mẫu giao diện (Artifact) | Đã duyệt |
| GitHub `jacknpmp-mint/Jack_Ngo` › `webapps/lsb_selling_price/` | xem tin nhắn bàn giao |

## 7. Việc tiếp theo
1. Tải R05 lên Drive, dán 24 file, Cài đặt app, triển khai, nghiệm thu bước 1–14.
2. Nhập tỷ giá USD (bắt buộc để có cột USD) rồi danh mục, bảng giá, dự án thật.
3. Tùy chọn: giá trị mặc định (status = Quoting), quy tắc quote_date ≤ contract_date, cảnh báo GM% dưới ngưỡng, cảnh báo giá vật tư cũ — chưa làm vì chưa chọn.
