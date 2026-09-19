---
name: database-design-skill
description: Quy chuẩn và quy trình thiết kế cơ sở dữ liệu quan hệ (ERD, Physical Data Model, Data Dictionary) cho Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI.
---

# Skill: Thiết kế Cơ sở Dữ liệu & Biểu đồ ERD (Database & ERD Design)

## 1. Mục tiêu và Định hướng Thiết kế

Skill này hướng dẫn quy trình chuyển đổi từ **Mô hình Lớp (OOD)** sang **Mô hình Thực thể - Mối quan hệ (ERD)** và **Thiết kế Cơ sở Dữ liệu Quan hệ (Relational Database)** cho đề tài môn học:
> **"Hệ thống quản lý công văn và văn bản nội bộ có tích hợp AI"**

### Nguyên tắc cốt lõi (Bám sát `role.md`):
- **Chuẩn hóa 3NF**: Đảm bảo không dư thừa dữ liệu bất thường (update/insert/delete anomalies).
- **Chống Over-engineering**: Sử dụng CSDL quan hệ chuẩn (PostgreSQL / MySQL / SQLite). Tuyệt đối không tự ý thêm Vector Database, NoSQL phân tán hay Cache phức tạp khi chưa có yêu cầu.
- **Khớp 1:1 với OOD**: Các bảng và khóa ngoại phải ánh xạ chính xác từ các quan hệ trong Sơ đồ lớp (Class Diagram).
- **Lưu trữ dữ liệu AI minh bạch**: Tách bạch rõ giữa dữ liệu nghiệp vụ chính thức và dữ liệu nhật ký/gợi ý của AI (`ai_task_logs`).

---

## 2. Quy ước Đặt tên và Kiểu dữ liệu Chuẩn (Naming Conventions)

### 2.1. Quy ước đặt tên (Naming Rules)
- **Tên bảng**: Dùng chữ thường, dạng số nhiều, phân cách bằng dấu gạch dưới (`snake_case`). Ví dụ: `users`, `departments`, `documents`, `attachments`, `task_assignments`, `draft_responses`, `notifications`, `ai_task_logs`.
- **Khóa chính (Primary Key - PK)**: Luôn đặt tên là `id` (kiểu số nguyên tự tăng `INT` / `BIGINT` hoặc `SERIAL`).
- **Khóa ngoại (Foreign Key - FK)**: Đặt tên theo cú pháp: `<tên_thực_thể_số_ít>_id`. Ví dụ: `department_id`, `document_id`, `assigner_id`, `assignee_id`, `task_id`.
- **Cột thời gian**: Kết thúc bằng `_at`. Ví dụ: `created_at`, `updated_at`, `deadline`.
- **Cột trạng thái / Cờ Boolean**: Bắt đầu bằng `is_` hoặc `has_`. Ví dụ: `is_active`, `is_read`, `is_ai_generated`, `is_approved`.
- **Cột Enum / Phân loại**: Lưu dưới dạng `VARCHAR(30)` hoặc kiểu `ENUM` với các giá trị UPPERCASE đồng nhất với code (ví dụ: `'INCOMING'`, `'OUTGOING'`, `'INTERNAL'`).

### 2.2. Ánh xạ kiểu dữ liệu (Data Type Mapping)

| Kiểu dữ liệu trong OOD | Kiểu SQL khuyến nghị (PostgreSQL / MySQL / SQLite) | Ghi chú |
|---|---|---|
| `int` | `INT` / `INTEGER` | Dùng cho khóa chính, khóa ngoại, kích thước tệp |
| `str` (ngắn / mã hiệu) | `VARCHAR(50)` đến `VARCHAR(255)` | Tên, số ký hiệu, email, username |
| `str` (văn bản dài) | `TEXT` | Trích yếu, trích xuất OCR, prompt, dự thảo, tóm tắt |
| `bool` | `BOOLEAN` (hoặc `TINYINT(1)` / `INTEGER`) | Cờ trạng thái (0 hoặc 1) |
| `date` | `DATE` | Ngày ban hành |
| `datetime` | `TIMESTAMP` / `DATETIME` | Hạn xử lý, thời điểm tạo |
| `float` | `FLOAT` / `DOUBLE PRECISION` | Điểm độ tin cậy AI (confidence score) |

---

## 3. Danh mục Bảng Cơ sở Dữ liệu Cốt lõi (Database Schema)

Hệ thống bao gồm **8 bảng dữ liệu quan hệ** khớp đúng 12 FR:

| STT | Tên Bảng (Table) | Mô tả Nghiệp vụ | Ánh xạ Lớp OOD | Khóa ngoại chính |
|:---:|---|---|:---:|---|
| 1 | **`departments`** | Phòng ban / đơn vị trực thuộc cơ quan | `Department` | Không có |
| 2 | **`users`** | Cán bộ, công chức sử dụng hệ thống | `User` | `department_id` ➔ `departments(id)` |
| 3 | **`documents`** | Hồ sơ công văn đến/đi và văn bản nội bộ | `Document` | Không có (liên kết qua các bảng trung gian) |
| 4 | **`attachments`** | Tệp tin số hóa đính kèm văn bản | `Attachment` | `document_id` ➔ `documents(id)` *(ON DELETE CASCADE)* |
| 5 | **`task_assignments`** | Phân công xử lý công văn & hạn chót | `TaskAssignment` | `document_id` ➔ `documents(id)`<br>`assigner_id` ➔ `users(id)`<br>`assignee_id` ➔ `users(id)` |
| 6 | **`draft_responses`** | Dự thảo văn bản phản hồi do chuyên viên/AI tạo | `DraftResponse` | `task_id` ➔ `task_assignments(id)`<br>`author_id` ➔ `users(id)` |
| 7 | **`notifications`** | Thông báo và cảnh báo hạn xử lý gửi cán bộ | `Notification` | `user_id` ➔ `users(id)` |
| 8 | **`ai_task_logs`** | Nhật ký các yêu cầu gọi AI/OCR | `AITaskLog` | Không bắt buộc (lưu vết độc lập) |

---

## 4. Đặc tả Chi tiết Từ điển Dữ liệu (Data Dictionary)

### 4.1. Bảng `departments` (Phòng ban / Đơn vị)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã định danh phòng ban.
- `name`: `VARCHAR(150) NOT NULL` — Tên phòng ban (VD: "Phòng Kế hoạch").
- `code`: `VARCHAR(20) NOT NULL UNIQUE` — Mã viết tắt phòng ban (VD: "PKH").

### 4.2. Bảng `users` (Cán bộ / Người dùng)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã người dùng.
- `username`: `VARCHAR(50) NOT NULL UNIQUE` — Tên đăng nhập.
- `password_hash`: `VARCHAR(255) NOT NULL` — Chuỗi mật khẩu băm an toàn.
- `full_name`: `VARCHAR(100) NOT NULL` — Họ và tên cán bộ.
- `email`: `VARCHAR(100) NOT NULL UNIQUE` — Email công vụ.
- `role`: `VARCHAR(20) NOT NULL` — Vai trò: `'CLERK'`, `'LEADER'`, `'SPECIALIST'`.
- `department_id`: `INT NULL` — Khóa ngoại tham chiếu `departments(id)`.
- `is_active`: `BOOLEAN NOT NULL DEFAULT TRUE` — Trạng thái hoạt động.
- `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.

### 4.3. Bảng `documents` (Hồ sơ Công văn & Văn bản Nội bộ)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã hồ sơ văn bản.
- `document_number`: `VARCHAR(50) NOT NULL` — Số ký hiệu văn bản.
- `title`: `TEXT NOT NULL` — Trích yếu nội dung văn bản.
- `document_scope`: `VARCHAR(20) NOT NULL` — Phạm vi: `'EXTERNAL'`, `'INTERNAL'`.
- `document_type`: `VARCHAR(20) NOT NULL` — Chiều luân chuyển: `'INCOMING'`, `'OUTGOING'`.
- `category`: `VARCHAR(100) NULL` — Thể loại/lĩnh vực (VD: "Tài chính", "Tờ trình").
- `issued_date`: `DATE NOT NULL` — Ngày ban hành văn bản.
- `sender_org`: `VARCHAR(150) NOT NULL` — Cơ quan/đơn vị gửi.
- `recipient_org`: `VARCHAR(150) NOT NULL` — Cơ quan/đơn vị nhận.
- `urgency`: `VARCHAR(20) NOT NULL DEFAULT 'NORMAL'` — `'NORMAL'`, `'URGENT'`, `'VERY_URGENT'`.
- `status`: `VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'` — `'RECEIVED'`, `'ASSIGNED'`, `'IN_PROGRESS'`, `'COMPLETED'`.
- `ai_summary`: `TEXT NULL` — Tóm tắt 3–5 ý chính do AI sinh ra.
- `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.

### 4.4. Bảng `attachments` (Tệp đính kèm số hóa)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã tệp tin.
- `document_id`: `INT NOT NULL` — Khóa ngoại tham chiếu `documents(id)` *(ON DELETE CASCADE)*.
- `file_name`: `VARCHAR(255) NOT NULL` — Tên gốc của tệp tin.
- `file_path`: `VARCHAR(500) NOT NULL` — Đường dẫn lưu file trên máy chủ.
- `file_size`: `BIGINT NOT NULL` — Dung lượng tệp (bytes).
- `file_type`: `VARCHAR(20) NOT NULL` — Định dạng tệp (`.pdf`, `.docx`).
- `extracted_text`: `TEXT NULL` — Toàn bộ chữ thô trích xuất được từ tệp.
- `uploaded_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.

### 4.5. Bảng `task_assignments` (Phân công xử lý & Theo dõi hạn)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã nhiệm vụ phân công.
- `document_id`: `INT NOT NULL` — Khóa ngoại tham chiếu `documents(id)`.
- `assigner_id`: `INT NOT NULL` — Khóa ngoại tham chiếu `users(id)` (Lãnh đạo giao).
- `assignee_id`: `INT NOT NULL` — Khóa ngoại tham chiếu `users(id)` (Chuyên viên nhận).
- `instruction`: `TEXT NULL` — Ý kiến chỉ đạo của Lãnh đạo.
- `deadline`: `DATETIME NOT NULL` — **Hạn chót xử lý văn bản**.
- `status`: `VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED'` — `'ASSIGNED'`, `'PROCESSING'`, `'RESOLVED'`.
- `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.

### 4.6. Bảng `draft_responses` (Văn bản Dự thảo phản hồi)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã bản dự thảo.
- `task_id`: `INT NOT NULL` — Khóa ngoại tham chiếu `task_assignments(id)`.
- `author_id`: `INT NOT NULL` — Khóa ngoại tham chiếu `users(id)` (Chuyên viên soạn).
- `content`: `TEXT NOT NULL` — Nội dung văn bản dự thảo.
- `is_ai_generated`: `BOOLEAN NOT NULL DEFAULT FALSE` — Cờ đánh dấu có dùng AI hỗ trợ.
- `is_approved`: `BOOLEAN NOT NULL DEFAULT FALSE` — Trạng thái phê duyệt.
- `approval_note`: `TEXT NULL` — Ý kiến nhận xét/lý do duyệt hoặc trả về của Lãnh đạo.
- `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.
- `updated_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.

### 4.7. Bảng `notifications` (Thông báo & Cảnh báo hạn)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã thông báo.
- `user_id`: `INT NOT NULL` — Khóa ngoại tham chiếu `users(id)`.
- `title`: `VARCHAR(200) NOT NULL` — Tiêu đề thông báo.
- `content`: `TEXT NOT NULL` — Nội dung thông báo.
- `is_read`: `BOOLEAN NOT NULL DEFAULT FALSE` — Trạng thái đã đọc hay chưa.
- `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.

### 4.8. Bảng `ai_task_logs` (Nhật ký xử lý AI)
- `id`: `INT PRIMARY KEY AUTO_INCREMENT` — Mã bản ghi nhật ký.
- `task_type`: `VARCHAR(50) NOT NULL` — `'EXTRACT'`, `'SUMMARIZE'`, `'CLASSIFY'`, `'DRAFT'`, `'OCR'`.
- `prompt_input`: `TEXT NOT NULL` — Nội dung prompt và văn bản gửi AI.
- `raw_response`: `TEXT NOT NULL` — Kết quả thô AI trả về.
- `latency_ms`: `INT NOT NULL` — Thời gian xử lý (mili-giây).
- `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.

---

## 5. Checklist Tự Đánh giá Thiết kế ERD (ERD Review Checklist)

*(Lưu ý: Để trực quan hóa mô hình ERD bằng PlantUML với ký hiệu chân quạ Crow's Foot chuẩn đẹp, xem chi tiết quy chuẩn và mã nguồn tại skill `plantuml-diagram-skill`).*

Trước khi đưa vào báo cáo thiết kế hoặc sinh mã nguồn Migration / Models CSDL:

- [ ] **Khớp 1:1 với Sơ đồ lớp (OOD)**: Đã chuyển đổi đầy đủ các Entity từ OOD sang bảng dữ liệu tương ứng chưa?
- [ ] **Khóa ngoại và Ràng buộc toàn vẹn**: Tất cả các quan hệ 1-N đã có cột khóa ngoại `_id` trỏ chính xác về bảng cha chưa?
- [ ] **Ràng buộc Xóa (ON DELETE CASCADE)**: Các bảng phụ thuộc sống còn (`attachments` gắn với `documents`) đã có cơ chế cascade chưa?
- [ ] **Kiểu dữ liệu và độ dài tối ưu**: Các trường ký hiệu, email, tên người dùng có độ dài hợp lý (`VARCHAR`), không lạm dụng `TEXT` bừa bãi chưa?
- [ ] **Chống over-engineering**: Số lượng bảng có nằm trong khoảng 7–9 bảng không? Có bảng trung gian vô lý nào không?
- [ ] **Lưu vết AI minh bạch**: Đã có bảng `ai_task_logs` để ghi nhận thời gian chạy và câu lệnh prompt của AI chưa?
