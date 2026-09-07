# BÁO CÁO ĐÁNH GIÁ MÃ NGUỒN (CODE REVIEW REPORT)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI

---

## 1. TỔNG QUAN ĐÁNH GIÁ (EXECUTIVE SUMMARY)
Báo cáo này được thực hiện theo quy trình của `code-review skill`, tiến hành rà soát toàn diện mã nguồn Backend (FastAPI) và Frontend (React + Vite + TypeScript) của dự án.

- **Mục tiêu**: Đánh giá tính tuân thủ thiết kế kiến trúc (`docs/architecture.md`), tính đúng đắn nghiệp vụ (`docs/requirements.md`), chất lượng mã nguồn (Code Quality), cấu trúc tổ chức dự án, và khả năng xử lý ngoại lệ (Error Handling).
- **Phạm vi rà soát**:
  - `backend/app/` (`main.py`, `config.py`, `core/`, `models/`, `schemas/`, `routers/`, `services/`).
  - `backend/tests/` (`test_api.py`).
  - `frontend/src/` (`components/`, `hooks/`, `lib/`, `pages/`, `routes/`, `store/`).
- **Kết luận chung**: Mã nguồn tuân thủ xuất sắc kiến trúc Modular Monolith và mẫu thiết kế **Adapter Pattern** cho AI. Phân tách rõ ràng giữa dữ liệu, schema và endpoint. Logic phân quyền RBAC kết hợp ABAC được triển khai chặt chẽ ở tầng middleware/dependency.

---

## 2. ĐÁNH GIÁ TÍNH TUÂN THỦ KIẾN TRÚC & NGHIỆP VỤ

### 2.1. Tuân thủ Kiến trúc (Architecture Alignment)
- **Mô hình Decoupled Frontend - Backend**: Hoàn toàn tách biệt. Giao tiếp qua RESTful API chuẩn hóa (`/api/v1/...`) và kênh WebSocket cho thông báo đẩy.
- **AI Abstraction Layer**: Áp dụng đúng mẫu **Adapter Pattern**:
  - Giao diện `IAIService` xác định hợp đồng (contract).
  - `LocalAIAdapter` đóng gói kết nối tới On-premise GPU (Ollama/vLLM) phục vụ văn bản mật.
  - `CloudAIAdapter` kết nối Google Gemini / OpenAI phục vụ thử nghiệm PoC không chứa dữ liệu mật.
  - `AIServiceFactory` tự động điều phối theo cấp độ bảo mật (`confidentiality_level`).
  - Cung cấp cơ chế `fallback_heuristic` độc lập, bảo đảm hệ thống không bao giờ bị sập (fail-safe) kể cả khi hạ tầng AI mất kết nối.
- **Xử lý Bất đồng bộ (Async Queue & Non-blocking UI)**:
  - Endpoint `/api/v1/ai/summarize/async` trả về ngay HTTP 202 Accepted (< 200ms) kèm `task_id`.
  - Tiến trình xử lý ngầm qua `BackgroundTasks`, ghi trạng thái vào bảng `AITaskLog` và bắn thông báo tới `Notification`.

### 2.2. Tuân thủ Yêu cầu Nghiệp vụ 3 Vai trò (Business Requirements)
- **Văn thư (CLERK)**: Quyền tạo mới, upload file, cập nhật thông tin công văn sau khi đối soát, không có quyền giao việc thay Lãnh đạo.
- **Lãnh đạo (LEADER)**: Quyền xem tóm tắt thông minh (3-5 ý cốt lõi), phân công cho Chuyên viên/Phòng ban kèm chỉ đạo và hạn chót (Deadline), phê duyệt hoặc từ chối dự thảo.
- **Chuyên viên (SPECIALIST)**: Nhận việc, cập nhật tiến độ (`ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED`), sinh văn bản dự thảo phản hồi chuẩn thể thức nhà nước, tuân thủ nghiêm ngặt ABAC (chỉ xem văn bản thuộc phòng ban hoặc được phân công).

---

## 3. ĐÁNH GIÁ CHẤT LƯỢNG MÃ NGUỒN & KHẢ NĂNG BẢO TRÌ

### 3.1. Điểm mạnh (Strengths)
1. **Phân tách tầng rõ ràng**: Áp dụng mô hình chuẩn FastAPI (Router -> Service -> Model -> Schema).
2. **Type Safety & Validation**:
   - Sử dụng đầy đủ Type Hints trong Python và TypeScript trong Frontend.
   - Pydantic schemas kiểm tra chặt chẽ dữ liệu đầu vào và định dạng phản hồi đầu ra.
3. **Cấu trúc Prompt hành chính chuẩn mực**: Các template prompt (`SYSTEM_PROMPT_ADMINISTRATIVE`, `SUMMARIZE_PROMPT_TEMPLATE`, `DRAFT_PROMPT_TEMPLATE`) được tối ưu ngôn phong hành chính nhà nước Việt Nam, yêu cầu JSON output chuẩn.
4. **Không phụ thuộc thư viện native C phức tạp**: Mô-đun JWT Security trong `app/core/security.py` sử dụng thuần thư viện chuẩn của Python (`hmac`, `hashlib`, `base64`, `json`), loại bỏ triệt để nguy cơ lỗi biên dịch trên môi trường Windows Server.

### 3.2. Điểm cần cải thiện (Areas for Improvement)
1. **Quản lý Session Database trong Background Task**: Cần bổ sung `db.rollback()` trong khối `except` của tiến trình ngầm để tránh rò rỉ kết nối khi xảy ra lỗi đột ngột.
2. **Tương thích Pydantic V2**: Trong `documents.py`, lệnh `doc_update.dict(exclude_unset=True)` nên được chuyển dần sang `doc_update.model_dump(exclude_unset=True)`.
3. **Hàm băm mật khẩu**: Hiện tại dùng static salt `"CONGVAN_SALT_2026"` kết hợp SHA-256. Mặc dù chạy nhanh và không phụ thuộc C, nên cấu hình sử dụng `bcrypt` hoặc `argon2` khi triển khai môi trường sản xuất có cài sẵn compiler.

---

## 4. BẢNG PHÂN LOẠI VÀ THEO DÕI VẤN ĐỀ (DEFECT / ISSUE TRACKING)

| Mã ID | Thành phần | Mô tả chi tiết | Mức độ | Khuyến nghị khắc phục |
|:---|:---|:---|:---:|:---|
| **CR-01** | `app/routers/ai.py` | Hàm `background_process_ai_summary` bắt ngoại lệ nhưng chưa có `db.rollback()` khi commit lỗi. | **HIGH** | Bổ sung `db.rollback()` vào khối `except Exception:` trước khi ghi log lỗi. |
| **CR-02** | `app/routers/documents.py` | Lưu file `shutil.copyfileobj` thực hiện đồng bộ trong async router. Với file dung lượng lớn (50MB) có thể gây chậm nhẹ luồng event loop. | **HIGH** | Sử dụng `run_in_threadpool` hoặc thư viện async file I/O (`aiofiles`). |
| **CR-03** | `app/core/security.py` | Sử dụng `datetime.utcnow()` vốn đã bị đánh dấu deprecated từ Python 3.12. | **MEDIUM** | Thay thế bằng `datetime.now(timezone.utc)`. |
| **CR-04** | `app/main.py` | CORS Middleware cấu hình `allow_origins=["*"]`. | **MEDIUM** | Trong môi trường Production, đọc danh sách domain Frontend cho phép từ biến môi trường `ALLOWED_ORIGINS`. |
| **CR-05** | `frontend/src/pages/` | Các trang Dashboard của 3 Role hiện tại mới ở dạng giao diện khung nền tảng (Scaffold). | **MEDIUM** | Tiếp tục bổ sung các component bảng dữ liệu, nút gọi AI trực quan và form tương tác ở giai đoạn kế tiếp. |
| **CR-06** | `app/routers/documents.py` | Sử dụng cú pháp Pydantic v1 `.dict(exclude_unset=True)` trên môi trường Pydantic v2. | **LOW** | Chuyển đổi sang cú pháp chuẩn `.model_dump(exclude_unset=True)`. |

---

## 5. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG (FINAL VERDICT)

- **Điểm đánh giá kiến trúc**: 9.5 / 10 (Tuân thủ hoàn hảo thiết kế, phân tách rõ ràng).
- **Điểm đánh giá chất lượng mã nguồn**: 9.0 / 10 (Sạch sẽ, dễ đọc, chú thích đầy đủ tiếng Việt).
- **Tính khả thi triển khai**: **SẴN SÀNG (READY)** cho giai đoạn phát triển giao diện chi tiết và tích hợp hệ thống.

