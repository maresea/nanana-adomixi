---
name: ood-design-skill
description: Quy chuẩn và quy trình phân tích và thiết kế hướng đối tượng (OOAD/OOD), xây dựng mô hình lớp (Domain Model, Design Class Diagram) cho Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI.
---

# Skill: Thiết kế Hướng Đối tượng & Mô hình Lớp (Object-Oriented Design - OOD)

## 1. Mục tiêu và Phạm vi Áp dụng

Skill này hướng dẫn quy chuẩn phân tích và thiết kế hướng đối tượng (OOAD/OOD) phục vụ việc hoàn thành báo cáo **Thiết kế Hướng đối tượng** và làm tiền đề cho việc lập trình Backend/Database của dự án **"Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI"**.

### Nguyên tắc cốt lõi (Bám sát role.md & requirements-engineering-skill):
- **Bám sát 12 FR và 3 vai trò**: Các lớp (Classes) được thiết kế phải phục vụ trực tiếp cho 12 Yêu cầu Chức năng (FR1 – FR12) và 3 tác nhân người dùng (Văn thư, Lãnh đạo, Chuyên viên).
- **Chống over-engineering**: Thiết kế kiến trúc phân tầng đơn giản (Controller/Router ➔ Service ➔ Entity). Tuyệt đối không tự ý thêm các mẫu thiết kế quá phức tạp (CQRS, Event Sourcing, Domain-Driven Design đa tầng, Microservices).
- **Độc lập và an toàn cho thành phần AI**: Module AI được thiết kế độc lập, đóng vai trò trợ lý (Assistant); kết quả AI (tóm tắt, trích xuất, gợi ý, dự thảo) luôn đi kèm cờ trạng thái kiểm duyệt của con người trước khi áp dụng.
- **Có thể truy vết (Traceability)**: Mọi phương thức và thuộc tính của lớp phải truy vết được về nguồn gốc yêu cầu nghiệp vụ trong SRS.

---

## 2. Phân biệt 2 Cấp độ Mô hình Lớp trong Báo cáo

Báo cáo OOD chuẩn môn học cần phân biệt rõ ràng 2 cấp độ mô hình:

### 2.1. Mô hình Lớp Phân tích / Lớp Miền (Domain / Conceptual Model)
- **Mục đích**: Mô tả các khái niệm nghiệp vụ thực tế trong cơ quan và mối quan hệ giữa chúng, đứng từ góc nhìn bài toán (chưa quan tâm đến ngôn ngữ lập trình hay công nghệ database).
- **Nội dung**: Chỉ bao gồm Tên lớp (Class Name) và Thuộc tính nghiệp vụ chính (Business Attributes); chưa cần ghi kiểu dữ liệu chi tiết hay phương thức (methods).

### 2.2. Mô hình Lớp Thiết kế Chi tiết (Design Class Diagram)
- **Mục đích**: Mô tả cấu trúc phần mềm hướng đối tượng thực tế để lập trình viên hiện thực hóa mã nguồn (Backend).
- **Nội dung**: Đầy đủ phạm vi truy cập (`+ public`, `- private`, `# protected`), kiểu dữ liệu cụ thể (`int`, `str`, `datetime`, `boolean`), phương thức xử lý kèm tham số đầu vào và kiểu dữ liệu trả về.
- **Phân loại lớp theo mẫu BCE (Boundary - Control - Entity) hoặc MVC/Service**:
  - **Lớp Thực thể (Entity Classes)**: Ánh xạ dữ liệu nghiệp vụ lưu trữ (`User`, `Document`, `TaskAssignment`...).
  - **Lớp Nghiệp vụ (Service / Control Classes)**: Chứa logic xử lý nghiệp vụ và điều phối (`DocumentService`, `AIService`, `TaskService`...).
  - **Lớp Giao tiếp (Router / Controller / Boundary Classes)**: Tiếp nhận yêu cầu từ giao diện, kiểm tra quyền và trả về kết quả.

---

## 3. Danh mục Các Lớp Thực thể Cốt lõi (Core Domain Entities)

Bám sát 12 FR của hệ thống, danh mục lớp thực thể gồm 9 lớp cốt lõi, không thêm lớp dư thừa:

| STT | Tên Lớp (Entity) | Ý nghĩa nghiệp vụ | Ánh xạ Yêu cầu |
|:---:|---|---|:---:|
| 1 | **User** | Đại diện cho người dùng hệ thống (thuộc phòng ban, có tài khoản). | FR1 |
| 2 | **Role** | Định nghĩa 3 vai trò người dùng chuẩn: `CLERK`, `LEADER`, `SPECIALIST`. | FR1 |
| 3 | **Department** | Đơn vị / Phòng ban chuyên môn trực thuộc cơ quan. | FR1, FR5, FR11 |
| 4 | **Document** | Thông tin công văn đến / công văn đi trong cơ quan. | FR2, FR5 |
| 5 | **Attachment** | Tệp tin văn bản số hóa (PDF, DOCX, bản scan) đính kèm công văn. | FR2, FR12 |
| 6 | **TaskAssignment** | Việc phân công xử lý công văn do Lãnh đạo giao cho Chuyên viên. | FR3, FR4, FR6 |
| 7 | **DraftResponse** | Văn bản dự thảo phản hồi do Chuyên viên soạn hoặc AI hỗ trợ tạo. | FR4, FR10 |
| 8 | **Notification** | Thông báo nhắc nhở, cảnh báo hạn xử lý gửi tới người dùng. | FR6 |
| 9 | **AITaskLog** | Nhật ký các yêu cầu xử lý AI (OCR, tóm tắt, trích xuất, dự thảo). | FR7, FR8, FR9, FR10 |

---

## 4. Quy chuẩn Đặc tả Thuộc tính và Phương thức Lớp Thiết kế

### 4.1. Lớp `User` (Người dùng)
- **Thuộc tính**:
  - `- id: int` (Định danh người dùng)
  - `- username: str` (Tên tài khoản)
  - `- password_hash: str` (Mật khẩu đã băm an toàn)
  - `- full_name: str` (Họ và tên cán bộ)
  - `- email: str` (Hộp thư nội bộ)
  - `- department_id: int` (Khoá liên kết phòng ban)
  - `- is_active: bool` (Trạng thái hoạt động)
- **Phương thức**:
  - `+ authenticate(password: str): bool`
  - `+ get_role(): Role`
  - `+ get_department(): Department`

### 4.2. Lớp `Document` (Công văn)
- **Thuộc tính**:
  - `- id: int` (Định danh văn bản)
  - `- document_number: str` (Số ký hiệu công văn)
  - `- title: str` (Trích yếu nội dung)
  - `- document_type: DocumentType` (Loại: `INCOMING` - Đến, `OUTGOING` - Đi)
  - `- issued_date: date` (Ngày ban hành)
  - `- sender_org: str` (Cơ quan gửi)
  - `- recipient_org: str` (Cơ quan nhận)
  - `- urgency: UrgencyLevel` (Độ khẩn: `NORMAL`, `URGENT`, `VERY_URGENT`)
  - `- status: DocumentStatus` (Trạng thái: `RECEIVED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`)
  - `- ai_summary: str` (Tóm tắt 3-5 ý do AI sinh ra)
  - `- deadline: datetime` (Thời hạn xử lý văn bản)
- **Phương thức**:
  - `+ add_attachment(file: Attachment): void`
  - `+ update_status(new_status: DocumentStatus): void`
  - `+ is_overdue(): bool`
  - `+ set_ai_summary(summary: str): void`

### 4.3. Lớp `TaskAssignment` (Phân công xử lý)
- **Thuộc tính**:
  - `- id: int`
  - `- document_id: int` (Công văn cần xử lý)
  - `- assigner_id: int` (Lãnh đạo giao việc)
  - `- assignee_id: int` (Chuyên viên thụ lý)
  - `- instruction: str` (Ý kiến chỉ đạo vắn tắt của Lãnh đạo)
  - `- deadline: datetime` (Hạn chót giải quyết)
  - `- status: TaskStatus` (Trạng thái nhiệm vụ: `ASSIGNED`, `PROCESSING`, `RESOLVED`)
  - `- created_at: datetime`
- **Phương thức**:
  - `+ update_progress(status: TaskStatus, note: str): void`
  - `+ attach_draft(draft: DraftResponse): void`
  - `+ check_deadline_warning(): AlertLevel` (Tính toán sắp đến hạn / quá hạn)

### 4.4. Lớp `DraftResponse` (Dự thảo phản hồi)
- **Thuộc tính**:
  - `- id: int`
  - `- task_id: int` (Thuộc nhiệm vụ phân công nào)
  - `- author_id: int` (Chuyên viên soạn thảo)
  - `- content: str` (Nội dung văn bản theo mẫu thể thức)
  - `- is_ai_generated: bool` (Cờ đánh dấu do AI sinh)
  - `- is_approved: bool` (Lãnh đạo đã phê duyệt hay chưa)
  - `- approval_note: str` (Ý kiến nhận xét khi duyệt/trả về của Lãnh đạo)
- **Phương thức**:
  - `+ edit_content(new_content: str): void`
  - `+ submit_for_approval(): void`
  - `+ approve(leader_id: int, note: str): void`
  - `+ reject(leader_id: int, reason: str): void`

### 4.5. Lớp `AIService` (Dịch vụ Trí tuệ Nhân tạo - Hỗ trợ nghiệp vụ)
- **Nhiệm vụ**: Đóng gói các hàm gọi AI, tách biệt hoàn toàn khỏi CSDL và giao diện.
- **Phương thức**:
  - `+ extract_metadata(document_text: str): DocumentMetadataDTO` (FR7)
  - `+ summarize_text(document_text: str): str` (FR8: Tóm tắt 3–5 ý)
  - `+ suggest_classification(document_text: str): ClassificationDTO` (FR9)
  - `+ generate_draft(original_text: str, instruction: str): str` (FR10)
  - `+ perform_ocr(file_bytes: bytes): str` (FR12)

---

## 5. Quy chuẩn Mối quan hệ giữa các Lớp (Relationships)

Áp dụng đúng ngữ nghĩa UML cho mô hình lớp của hệ thống:

1. **Association (Liên kết thông thường `-->`)**:
   - `User` ➔ `Department`: Một người dùng thuộc về một phòng ban (`1..*` đến `1`).
   - `TaskAssignment` ➔ `User`: Liên kết người giao (Lãnh đạo) và người nhận (Chuyên viên).
2. **Aggregation (Quan hệ thu nạp `o--`)**:
   - `Department` `1` o-- `0..*` `User`: Phòng ban chứa các người dùng (nếu phòng ban giải thể, người dùng vẫn tồn tại).
   - `Document` `1` o-- `0..*` `TaskAssignment`: Một công văn có thể có nhiều đợt phân công / phối hợp.
3. **Composition (Quan hệ sở hữu chặt chẽ `*--`)**:
   - `Document` `1` *-- `1..*` `Attachment`: Tệp đính kèm phụ thuộc hoàn toàn vào công văn; nếu xoá hồ sơ công văn thì tệp đính kèm bị xoá theo.
   - `TaskAssignment` `1` *-- `0..*` `DraftResponse`: Dự thảo phản hồi gắn liền với nhiệm vụ được giao.
4. **Dependency (Quan hệ phụ thuộc `..>`)**:
   - `DocumentService` ..> `AIService`: Service quản lý công văn sử dụng dịch vụ AI để trích xuất thông tin hoặc tóm tắt.

## 6. Checklist Tự Đánh giá Chất lượng Mô hình Lớp (OOD Review Checklist)

Trước khi đưa biểu đồ và thuyết minh vào báo cáo `04_GenAI_SoftwareDevelopment_object-oriented-design.docx`, bắt buộc kiểm tra:

- [ ] **Bám sát 12 FR**: Các thực thể và phương thức có đáp ứng đủ các luồng xử lý của 12 FR không?
- [ ] **Chống over-engineering**: Số lượng thực thể cốt lõi có nằm trong khoảng 7–9 lớp không? Có bị phình to lớp trung gian không cần thiết không?
- [ ] **Đúng quan hệ UML**: Đã phân biệt đúng giữa Composition (tệp đính kèm gắn với công văn) và Aggregation/Association (người dùng, phòng ban) chưa?
- [ ] **Bản chất AI hỗ trợ**: Lớp `DraftResponse` và `Document` có cờ/trường lưu trạng thái phê duyệt của con người đối với kết quả do `AIService` sinh ra không?
- [ ] **Khả thi khi lập trình**: Các thuộc tính và phương thức có dễ dàng chuyển thành code Python/FastAPI (Models, Schemas, Services) và React Frontend không?
