# Bàn giao

## Mục lục
1. Đóng gói zip + bảng file thay đổi · 2. HUONG_DAN_CAI_DAT.md · 3. File bàn giao context · 4. GitHub · 5. Tin nhắn cuối cho người dùng

## 1. Đóng gói

```bash
python3 -I <SKILL>/scripts/package_app.py APP --name <Tên>_WebApp --version <X.Y> [--prev <thư mục bản trước>] --out <thư mục ra>
```
Tạo `<Tên>_WebApp_vX.Y.zip` (thư mục app + thư mục `_file_can_dan/` chỉ chứa file MỚI/SỬA) và `CHANGED_FILES.md` (bảng # · File trong Apps Script · Loại · Trạng thái · Cách làm + danh sách không đổi). Gửi bằng SendUserFile: zip + từng file cần dán (để mở trên điện thoại) + file bàn giao `.md`.
Nâng cấp app LSB cũ không có bản trước giải nén: giải nén zip bản đang chạy làm `--prev`.

## 2. HUONG_DAN_CAI_DAT.md (trong thư mục app)

Lần đầu: chép `assets/templates/HUONG_DAN_CAI_DAT.md`, điền. Mỗi phiên bản sau: thêm **mục "0. Thay đổi vX.Y" lên đầu** (mục cũ đổi thành "0-vX.Y-1"), gồm:
- Bảng **file cần dán** (lấy từ CHANGED_FILES.md) — MỚI / SỬA, "không có file mới" nếu đúng vậy, file không đổi.
- Bước triển khai: Triển khai → Quản lý triển khai → ✏ → Phiên bản mới → Triển khai; kiểm tra số phiên bản ở chân menu / trang Tài khoản.
- Nội dung thay đổi (ngắn, theo màn hình người dùng thấy).
- Quy ước tính đã chốt (bảng).
- Bước nghiệm thu **đánh số tiếp** các phiên bản trước, dùng dữ liệu thật của người dùng (vd "Bấm Mở tất cả → thấy PJ-2026-001 → Lô 1 → PP-2026-001 (Paid)").
- Kết quả test mô phỏng (số ca, ca mới) + "chưa chạy trên Google thật".

## 3. File bàn giao context (`<TÊN>_CRMApps.md` hoặc `<TÊN>_WebApp_BAN_GIAO.md`)

Để session sau tiếp tục không mất ngữ cảnh. Lần đầu chép `assets/templates/BAN_GIAO.md`. Mỗi lần cập nhật:
- Dòng đầu "Cập nhật: <ngày> (lần N — <tóm tắt>)" + cách mở session mới (đính kèm file này + zip mới nhất + xlsx đang dùng).
- Mục session mới: vấn đề → quyết định đã chốt qua phỏng vấn (bảng) → đã làm (file) → trạng thái test → lỗi dữ liệu còn tồn tại.
- Bảng "Quyết định đã chốt (tích lũy)" thêm dòng; bảng Deliverables (bản mới nhất / thay bằng / lỗi thời); "Việc tiếp theo" sắp theo ưu tiên.
- Ghi rõ điểm áp dụng phương án đề xuất khi người dùng chưa trả lời.

## 4. GitHub

Repo `jacknpmp-mint/Jack_Ngo`, thư mục `webapps/<tên_app>/` (src, tools, test không có `shots/` và `index.built.html`, HUONG_DAN_CAI_DAT.md, file bàn giao, CHANGED_FILES.md). Không commit file xlsx dữ liệu thật trừ khi người dùng yêu cầu (`test/data_real.json` có dữ liệu thật → hỏi; mặc định chỉ commit `test/data.json` đã làm sạch / minh hoạ và thêm `data_real.json` vào `.gitignore`).
```bash
git checkout <nhánh làm việc của session>   # tạo nếu chưa có
git add webapps/<tên_app> && git commit -m "<Tên> WebApp vX.Y: <tóm tắt>"
git push -u origin <nhánh>
```
Không tạo PR nếu người dùng không yêu cầu. Kết thúc commit bằng dòng attribution theo system reminder.

## 5. Tin nhắn cuối

Ngắn, tiếng Việt, theo thứ tự: đã làm gì → **bảng file cần dán** (MỚI/SỬA) → bước triển khai → bước nghiệm thu → kết quả test (số ca, ca chập chờn nếu có) → điểm còn mở / cần người dùng quyết → file đã gửi. Không liệt kê code; không khẳng định đã chạy trên Google thật.
