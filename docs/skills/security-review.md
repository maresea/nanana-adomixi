# BÁO CÁO ĐÁNH GIÁ AN TOÀN THÔNG TIN VÀ BẢO MẬT (SECURITY REVIEW REPORT)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI

---

## 1. TỔNG QUAN BẢO MẬT (EXECUTIVE SUMMARY)
Báo cáo này được thực hiện theo chỉ dẫn của `security-review skill`, tập trung vào các khía cạnh an toàn thông tin trọng yếu của một hệ thống quản lý văn bản nhà nước tích hợp trí tuệ nhân tạo:
1. **Kiểm soát phân quyền truy cập dữ liệu**: Đảm bảo nguyên tắc *"Văn bản giao cho ai/phòng nào thì chỉ người đó/phòng đó được quyền truy cập"*.
2. **Rà soát các lỗ hổng Web phổ biến (OWASP Top 10)**: SQL Injection, XSS, CSRF, Path Traversal, Broken Access Control.
3. **Quản lý khóa bí mật và API Key**: Đảm bảo không lộ lọt khóa Gemini / OpenAI ra mã nguồn công khai hoặc Git repository.
4. **Cô lập an toàn cho tài liệu MẬT (Confidential Isolation)**: Cơ chế ngăn chặn gửi dữ liệu nhạy cảm ra ngoài Internet.

---

## 2. KẾT QUẢ KIỂM SOÁT PHÂN QUYỀN TRUY CẬP (ACCESS CONTROL & ABAC/RBAC)

### 2.1. Đánh giá Logic Phân quyền Dữ liệu (ABAC)
- **Nguyên tắc nghiệp vụ**: Chuyên viên chỉ được xem và xử lý văn bản nếu:
  - Văn bản thuộc phòng ban mà chuyên viên trực thuộc (`document.department_id == user.department_id`).
  - **HOẶC** Chuyên viên được Lãnh đạo giao việc đích danh qua bản ghi `TaskAssignment` (`assigned_to_user_id == user.id`).
- **Hiện trạng triển khai**:
  - Tại hàm `check_document_access()` và dependency `verify_document_permission()` trong `app/core/permissions.py`, điều kiện kiểm tra được thực thi nghiêm ngặt trước khi trả về dữ liệu văn bản.
  - Tại endpoint danh sách `GET /api/v1/documents`, câu lệnh truy vấn tự động bổ sung mệnh đề lọc:
    ```python
    if user_role == "SPECIALIST":
        assigned_doc_ids = db.query(TaskAssignment.document_id).filter(
            TaskAssignment.assigned_to_user_id == current_user.id
        ).subquery()
        query = query.filter(
            or_(
                Document.department_id == current_user.department_id,
                Document.id.in_(assigned_doc_ids)
            )
        )
    ```
  - **Kết luận**: **AN TOÀN**. Chuyên viên không thể xem trộm danh sách hoặc tra cứu ID công văn của các phòng ban khác. Ca kiểm thử `test_abac_cross_department_access_denied` đã xác nhận hệ thống trả về HTTP 403 Forbidden.

### 2.2. Kiểm soát Quyền thực hiện Thao tác (RBAC)
- Tiếp nhận và tạo công văn: Giới hạn cho `CLERK` và `ADMIN`.
- Phân công chỉ đạo và duyệt dự thảo: Giới hạn cho `LEADER` và `ADMIN`.
- Soạn thảo và nộp dự thảo phản hồi: Giới hạn cho `SPECIALIST` và `ADMIN`.
- **Kết luận**: **AN TOÀN**. Không có tình trạng leo thang đặc quyền (Privilege Escalation).

---

## 3. RÀ SOÁT CÁC LỖ HỔNG PHỔ BIẾN (OWASP TOP 10 AUDIT)

### 3.1. SQL Injection
- **Phân tích**:
  - Hệ thống sử dụng hoàn toàn SQLAlchemy ORM. Mọi tham số từ người dùng (ID, từ khóa tìm kiếm, ngày tháng) đều được truyền qua dạng bind parameters (tham số hóa), không có bất kỳ lệnh ghép chuỗi SQL thô nào (`text()`, `raw()`, `f"SELECT ..."`).
  - Tìm kiếm toàn văn qua `Document.title.ilike(search_pattern)` được đóng gói an toàn.
- **Đánh giá rủi ro**: **KHÔNG PHÁT HIỆN LỖ HỔNG (CLEAN)**.

### 3.2. Cross-Site Scripting (XSS)
- **Phân tích**:
  - Tầng Backend chỉ trả về dữ liệu định dạng chuẩn JSON (`application/json`), không render trực tiếp HTML template.
  - Tầng Frontend xây dựng bằng React 18, mặc định tự động encode/escape toàn bộ chuỗi ký tự trong JSX trước khi render lên DOM.
- **Đánh giá rủi ro**: **AN TOÀN (LOW RISK)**.
- **Khuyến nghị**: Khi tích hợp Rich Text Editor (soạn thảo dự thảo) ở các giai đoạn sau, cần sử dụng thư viện lọc HTML an toàn như `DOMPurify` trước khi render nội dung HTML thô.

### 3.3. Cross-Site Request Forgery (CSRF)
- **Phân tích**:
  - Hệ thống áp dụng kiến trúc Token-based Authentication (Bearer JWT).
  - Token được lưu trữ ở Client và gửi lên server qua Header `Authorization: Bearer <token>`, hoàn toàn không dựa vào cơ chế lưu trữ Cookie tự động gửi của trình duyệt.
- **Đánh giá rủi ro**: **KHÔNG CÓ NGUY CƠ CSRF (IMMUNE)**.

### 3.4. Rủi ro Tải tệp & Đường dẫn (File Upload & Path Traversal)
- **Phân tích**:
  - Tại `app/routers/documents.py`, tệp tải lên được lưu với tên:
    `sanitized_filename = f"{document_code.replace('/', '_')}_{file_name}"`
  - *Nguy cơ tiềm ẩn*: Biến `file.filename` lấy trực tiếp từ client có thể chứa ký tự điều hướng thư mục (ví dụ `../../malicious.exe`).
- **Đánh giá rủi ro**: **MEDIUM**.
- **Khuyến nghị**: Sử dụng `os.path.basename(file.filename)` hoặc đổi tên tệp ngẫu nhiên theo UUID (ví dụ `uuid.uuid4().hex + ext`) để triệt tiêu hoàn toàn nguy cơ Path Traversal. Đồng thời thêm whitelist kiểm tra phần mở rộng file cho phép (`.pdf`, `.docx`, `.png`, `.jpg`).

---

## 4. QUẢN LÝ BIẾN MÔI TRƯỜNG & RÒ RỈ KHÓA BÍ MẬT (SECRET MANAGEMENT)

### 4.1. Quét tìm Khóa API (Gemini / OpenAI API Keys)
- **Kết quả quét**:
  - Đã quét toàn bộ mã nguồn tại `backend/` và `frontend/`.
  - **Không tìm thấy bất kỳ API Key nào bị hard-code trong mã nguồn**.
  - Các khóa API được quản lý tập trung qua lớp `Settings` (`app/config.py`) sử dụng thư viện `pydantic-settings`.
  - File mẫu cấu hình `backend/.env.example` để trống các trường khóa bí mật (`GEMINI_API_KEY=""`, `OPENAI_API_KEY=""`).

### 4.2. Chính sách Bảo mật Tài liệu Mật (Confidential Routing)
- **Quy tắc an toàn**: Mọi văn bản có cấp độ mật `CONFIDENTIAL` hoặc `SECRET` **tuyệt đối không được gửi qua Cloud AI (Internet)**.
- **Thực thi trong mã nguồn**:
  - Tại `app/services/ai_service.py`, hàm `AIServiceFactory.get_service(is_confidential)`:
    ```python
    if is_confidential:
        return LocalAIAdapter(
            base_url=settings.LOCAL_AI_BASE_URL,
            model_name=settings.LOCAL_AI_MODEL
        )
    ```
  - Tại `app/routers/ai.py`, hệ thống tự động kiểm tra `doc.confidentiality_level in ["CONFIDENTIAL", "SECRET"]` và cưỡng chế định tuyến sang `LocalAIAdapter` (máy chủ On-Premise GPU ngắt mạng Internet).
- **Kết luận**: **ĐẠT CHUẨN AN TOÀN DỮ LIỆU NHÀ NƯỚC**.

---

## 5. BẢNG TỔNG HỢP LỖ HỔNG & KHUYẾN NGHỊ KHẮC PHỤC

| Mã Lỗ hổng | Hạng mục | Mức độ | Hiện trạng | Khuyến nghị khắc phục |
|:---|:---|:---:|:---|:---|
| **SEC-01** | Băm mật khẩu (Hashing) | **MEDIUM** | Dùng SHA-256 kèm static salt cố định trong mã nguồn. | Triển khai giải thuật băm mật khẩu hiện đại (`bcrypt` hoặc `argon2id`) với salt ngẫu nhiên cho từng user khi đưa vào production. |
| **SEC-02** | Xử lý tên tệp tải lên | **MEDIUM** | Chưa làm sạch triệt để `file.filename` bằng `os.path.basename`. | Sử dụng UUID ngẫu nhiên cho tên file lưu trên đĩa và kiểm tra Whitelist MIME type (`pdf`, `docx`, `jpeg`, `png`). |
| **SEC-03** | Khóa JWT mặc định | **LOW** | Cung cấp chuỗi `SECRET_KEY` mặc định cho môi trường dev. | Bắt buộc sinh chuỗi bí mật ngẫu nhiên tối thiểu 32 byte trong file `.env` môi trường production. |
| **SEC-04** | Giới hạn tần suất (Rate Limiting) | **LOW** | Chưa kích hoạt Rate Limiter cho các API tốn tài nguyên (AI/OCR). | Cấu hình giới hạn số lượng request (ví dụ 30 req/phút/user) qua Redis hoặc `slowapi`. |

---

## 6. KẾT LUẬN CUỐI CÙNG (SECURITY VERDICT)
Hệ thống thể hiện tính bảo mật cao, tư duy thiết kế chuẩn mực về phân quyền dữ liệu (ABAC) và cô lập tài liệu mật (Confidential Isolation). Dự án **ĐẠT TIÊU CHUẨN AN TOÀN** để vận hành thử nghiệm nội bộ.

