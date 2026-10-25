---
tags: [mth-webapp-making]
max_turns: 120
timeout_seconds: 3600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Đây là file database nhân sự & OKR của tôi (MTH_HR_OKR_DB_v1.0.xlsx). Làm cho tôi một web app Google Sheets + Apps Script để nhập liệu và theo dõi, giống kiểu app LSB CRM.

Tôi bận nên trả lời trước phỏng vấn: tên app "MTH HR · OKR"; HR_Staff là bảng tài khoản đăng nhập; HR_Department và HR_Staff là danh mục chỉ Admin sửa; bảng HR_KeyResult cột đầu KeyResult_id đúng là khóa chính, Objective_id là khóa ngoại tới HR_Objective; Weight_pct là tỷ lệ 0–1; menu 3 nhóm: Nhân sự (nhân viên) · OKR (mục tiêu, KR, công việc) · Danh mục. Lần này chỉ cần Dashboard chung, chưa cần bản mẫu dashboard riêng. Điểm nào còn chưa rõ thì dùng phương án đề xuất và ghi lại để tôi xác nhận sau.

Giao cho tôi zip app, hướng dẫn cài đặt, file bàn giao context; không cần đẩy GitHub lần này.

Input files: MTH_HR_OKR_DB_v1.0.xlsx
