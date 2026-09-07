# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ CÔNG VĂN TÍCH HỢP AI
## (USER GUIDE & WORKFLOW MANUAL)

---

## 1. GIỚI THIỆU CHUNG
Tài liệu này hướng dẫn chi tiết quy trình tác nghiệp trên Hệ thống Quản lý Công văn và Văn bản nội bộ tích hợp AI cho 3 vai trò chính: **Văn thư cơ quan**, **Lãnh đạo cơ quan** và **Chuyên viên xử lý**.

Tài liệu phản ánh chính xác các chức năng đã được triển khai trong phiên bản hiện tại.

---

## 2. QUY TRÌNH DÀNH CHO VĂN THƯ CƠ QUAN (ROLE: CLERK)

### 2.1. Đăng nhập hệ thống
- Truy cập màn hình đăng nhập tại: `http://localhost:5173/login`.
- Sử dụng tài khoản mẫu: `vanthu_mai` / Mật khẩu: `Password@123`.
- Sau khi đăng nhập thành công, hệ thống tự động điều hướng tới Dashboard Văn thư (`/clerk/dashboard`).

### 2.2. Tiếp nhận và Vào sổ Công văn mới
1. Chọn chức năng **Tiếp nhận công văn mới**.
2. Điền các trường thông tin hành chính:
   - **Số ký hiệu văn bản**: Ví dụ: `123/UBND-VP`.
   - **Trích yếu nội dung**: Tóm tắt nội dung chính của văn bản.
   - **Cơ quan ban hành**: Đơn vị gửi văn bản đến.
   - **Ngày ban hành**: Định dạng `YYYY-MM-DD`.
   - **Độ khẩn / Độ mật**: Lựa chọn mức độ tương ứng (`NORMAL`, `URGENT`, `CONFIDENTIAL`).
   - **Tệp đính kèm**: Chọn file scan PDF hoặc hình ảnh công văn.
3. Nhấn **Lưu và Vào sổ**. Công văn sẽ được tạo với trạng thái ban đầu là `RECEIVED`.

### 2.3. Sử dụng AI Gợi ý phân loại và Độ khẩn
- Đối với công văn có nội dung dài hoặc phức tạp, Văn thư nhấn nút **AI Phân loại**.
- Hệ thống tự động phân tích và trả về:
  - Nhóm danh mục đề xuất (Tài chính, Quản lý đô thị, Nội vụ, Hành chính tổng hợp).
  - Độ khẩn gợi ý.
  - Mã phòng ban chuyên môn phù hợp nhất để thụ lý (ví dụ: `TCKH` cho Phòng Tài chính).

---

## 3. QUY TRÌNH DÀNH CHO LÃNH ĐẠO CƠ QUAN (ROLE: LEADER)

### 3.1. Đăng nhập và Xem tóm tắt thông minh
- Đăng nhập với tài khoản: `lanhdao_hai` / Mật khẩu: `Password@123`.
- Hệ thống chuyển tới Dashboard Lãnh đạo (`/leader/dashboard`).
- Khi mở xem chi tiết một công văn, Lãnh đạo không cần đọc toàn bộ tài liệu dài:
  - Khối **AI Tóm tắt thông minh** sẽ hiển thị sẵn **3 đến 5 ý cốt lõi**:
    1. Cơ quan ban hành & Mục đích chính của công văn.
    2. Các yêu cầu, nhiệm vụ trọng tâm cơ quan cần triển khai.
    3. Thời hạn chót (Deadline) bắt buộc hoàn thành.
    4. Vấn đề cần lưu ý đặc biệt.
  - Lãnh đạo có thể kích hoạt tóm tắt ngầm qua nút **Tóm tắt bất đồng bộ (Non-blocking)** để tiếp tục xem các văn bản khác mà không bị gián đoạn.

### 3.2. Phân công xử lý và Thiết lập Hạn chót (Deadline)
1. Tại màn hình chi tiết công văn, nhấn nút **Chỉ đạo & Giao việc**.
2. Chọn Chuyên viên hoặc Phòng ban chủ trì (ví dụ: Chuyên viên Lê Hoàng Nam - Phòng Tài chính).
3. Nhập **Ý kiến chỉ đạo vắn tắt** (định hướng xử lý cho chuyên viên).
4. Chọn **Hạn chót giải quyết (Deadline)**: Ví dụ `2026-08-05 17:00:00`.
5. Nhấn **Xác nhận giao việc**:
   - Công văn chuyển trạng thái sang `ASSIGNED`.
   - Hệ thống tự động gửi thông báo (`Notification`) tới chuyên viên được giao.

### 3.3. Phê duyệt văn bản dự thảo
1. Khi Chuyên viên nộp dự thảo phản hồi, Lãnh đạo nhận thông báo `DRAFT_SUBMITTED`.
2. Mở dự thảo xem nội dung đối chiếu với văn bản gốc.
3. Chọn một trong hai thao tác:
   - **Phê duyệt**: Nhấn **Duyệt phát hành** -> Trạng thái chuyển `APPROVED`, sẵn sàng để Văn thư cấp số gửi đi.
   - **Yêu cầu chỉnh sửa**: Nhập ý kiến phản hồi và nhấn **Trả lại chỉnh sửa** -> Trạng thái chuyển `REJECTED` để chuyên viên hoàn thiện lại.

---

## 4. QUY TRÌNH DÀNH CHO CHUYÊN VIÊN XỬ LÝ (ROLE: SPECIALIST)

### 4.1. Đăng nhập và Tiếp nhận nhiệm vụ
- Đăng nhập với tài khoản: `chuyenvien_nam` / Mật khẩu: `Password@123`.
- Dashboard Chuyên viên hiển thị danh sách các công việc được Lãnh đạo giao việc, sắp xếp theo hạn chót (Deadline) từ gần đến xa.
- **Lưu ý bảo mật (ABAC)**: Chuyên viên chỉ nhìn thấy công văn thuộc phòng ban của mình hoặc được đích danh giao việc. Hệ thống tuyệt đối ngăn chặn việc truy cập chéo văn bản phòng ban khác.

### 4.2. Cập nhật tiến độ xử lý
- Khi bắt đầu thực hiện, Chuyên viên chuyển trạng thái nhiệm vụ từ `ASSIGNED` sang `IN_PROGRESS`.

### 4.3. Tự động sinh dự thảo phản hồi bằng AI (Draft Generation)
1. Nhấn nút **AI Sinh dự thảo phản hồi**.
2. Hệ thống tổng hợp:
   - Nội dung cốt lõi của công văn đến.
   - Ý kiến chỉ đạo ngắn gọn của Lãnh đạo.
   - Biểu mẫu thể thức hành chính chuẩn Việt Nam.
3. Mô hình AI sinh ra bản dự thảo hoàn chỉnh:
   - Tiêu ngữ, Quốc hiệu, Trích yếu, Căn cứ pháp lý, Kính gửi, Nội dung trả lời, Nơi nhận.
4. Chuyên viên tinh chỉnh, bổ sung số liệu thực tế trên khung soạn thảo.

### 4.4. Nộp dự thảo lên Lãnh đạo
- Nhấn **Nộp dự thảo**.
- Trạng thái nhiệm vụ chuyển sang `DRAFT_SUBMITTED` và thông báo tự động được gửi tới Lãnh đạo để chờ phê duyệt.

---

## 5. TRA CỨU TÀI LIỆU API CHO LẬP TRÌNH VIÊN (DEVELOPER API GUIDE)

Các API endpoints chính được cung cấp qua Swagger UI tại `http://localhost:8000/docs`:

| Endpoint | Phương thức | Mô tả chức năng | Quyền truy cập |
|:---|:---:|:---|:---:|
| `/api/v1/auth/login` | `POST` | Đăng nhập lấy JWT Bearer Token | Public |
| `/api/v1/auth/me` | `GET` | Xem thông tin hồ sơ tài khoản hiện tại | Đã xác thực |
| `/api/v1/documents` | `POST` | Tiếp nhận và vào sổ công văn mới | `CLERK`, `ADMIN` |
| `/api/v1/documents` | `GET` | Tra cứu danh sách công văn (kèm bộ lọc ABAC) | Mọi người dùng |
| `/api/v1/documents/{id}`| `GET` | Xem chi tiết công văn (kiểm tra ABAC) | Có thẩm quyền |
| `/api/v1/tasks/assign` | `POST` | Giao việc kèm chỉ đạo và hạn chót | `LEADER`, `ADMIN` |
| `/api/v1/tasks/{id}/status`| `PATCH` | Cập nhật tiến độ xử lý công việc | Chuyên viên / Lãnh đạo |
| `/api/v1/tasks/{id}/draft` | `POST` | Nộp văn bản dự thảo phản hồi | `SPECIALIST` |
| `/api/v1/tasks/drafts/{id}/approve` | `POST` | Phê duyệt hoặc từ chối dự thảo | `LEADER`, `ADMIN` |
| `/api/v1/ai/summarize` | `POST` | Tóm tắt văn bản thông minh (3-5 ý) | Mọi người dùng |
| `/api/v1/ai/summarize/async` | `POST` | Tóm tắt chạy ngầm bất đồng bộ (HTTP 202) | Mọi người dùng |
| `/api/v1/ai/classify` | `POST` | Gợi ý phân loại và mức độ khẩn | Mọi người dùng |
| `/api/v1/ai/generate-draft` | `POST` | Sinh dự thảo công văn phản hồi | Mọi người dùng |
| `/api/v1/ai/tasks/{task_id}`| `GET` | Kiểm tra trạng thái tác vụ chạy nền | Mọi người dùng |

