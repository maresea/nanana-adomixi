# HỒ SƠ QUYẾT ĐỊNH KIẾN TRÚC (ARCHITECTURE DECISION RECORDS - ADR)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI

---

## MỤC LỤC
1. [ADR-001: Phân tách kiến trúc Frontend và Backend giao tiếp qua RESTful API](#adr-001-phân-tách-kiến-trúc-frontend-và-backend-giao-tiếp-qua-restful-api)
2. [ADR-002: Kiến trúc xử lý bất đồng bộ (Queue & Background Worker) cho các tác vụ nặng (OCR, AI)](#adr-002-kiến-trúc-xử-lý-bất-đồng-bộ-queue--background-worker-cho-các-tác-vụ-nặng-ocr-ai)
3. [ADR-003: Thiết kế Lớp trừu tượng hóa AI (AI Abstraction Layer) theo mẫu Adapter Pattern](#adr-003-thiết-kế-lớp-trừu-tượng-hóa-ai-ai-abstraction-layer-theo-mẫu-adapter-pattern)
4. [ADR-004: Cơ chế phân quyền dữ liệu kết hợp RBAC và ABAC](#adr-004-cơ-chế-phân-quyền-dữ-liệu-kết-hợp-rbac-và-abac)
5. [ADR-005: Giải pháp đồng bộ tiến độ thời gian thực bằng WebSocket kết hợp Polling dự phòng](#adr-005-giải-pháp-đồng-bộ-tiến-độ-thời-gian-thực-bằng-websocket-kết-hợp-polling-dự-phòng)
6. [ADR-006: Kiến trúc hạ tầng Local AI On-Premise trên GPU phục vụ bảo mật tài liệu mật](#adr-006-kiến-trúc-hạ-tầng-local-ai-on-premise-trên-gpu-phục-vụ-bảo-mật-tài-liệu-mật)

---

## ADR-001: Phân tách kiến trúc Frontend và Backend giao tiếp qua RESTful API

- **Trạng thái**: `ĐÃ PHÊ DUYỆT (ACCEPTED)`
- **Ngày quyết định**: 2026-07-27
- **Người đề xuất**: Đội ngũ Kiến trúc sư hệ thống

### 1. Bối cảnh (Context)
Hệ thống phục vụ 3 nhóm đối tượng người dùng với thiết bị và nhu cầu giao diện khác nhau:
- **Văn thư & Chuyên viên**: Thao tác liên tục trên máy tính để bàn (PC), yêu cầu giao diện làm việc chia cột, trình chỉnh sửa văn bản song song và tương tác dữ liệu tốc độ cao.
- **Lãnh đạo**: Thường xuyên di chuyển, đi họp, sử dụng máy tính bảng (Tablet) hoặc điện thoại thông minh để đọc nhanh tóm tắt và chỉ đạo tức thì.
Nếu sử dụng mô hình kiến trúc khối nguyên khối (Monolith ghép chặt giao diện vào server-side rendering như JSP, Blade, ASP.NET MVC truyền thống), hệ thống sẽ gặp khó khăn lớn trong việc tối ưu trải nghiệm đa thiết bị, bảo trì độc lập và tích hợp các kênh truyền thông thời gian thực.

### 2. Quyết định (Decision)
Tách biệt hoàn toàn tầng giao diện (Frontend) và tầng xử lý nghiệp vụ (Backend):
- **Frontend**: Xây dựng dưới dạng Single Page Application (SPA) / Responsive Web Application (sử dụng React.js / Next.js hoặc Vue.js). Tối ưu giao diện đáp ứng cho PC và Tablet.
- **Backend**: Cung cấp giao diện lập trình ứng dụng RESTful API chuẩn hóa, phi trạng thái (Stateless), bảo vệ bằng cơ chế JWT Authentication.

### 3. Hệ quả (Consequences)
- **Tích cực**:
  - Frontend và Backend có thể phát triển, kiểm thử, triển khai và nâng cấp hoàn toàn độc lập (Decoupled Development).
  - Giao diện người dùng mượt mà, không bị chớp màn hình hay tải lại trang (SPA experience).
  - Tái sử dụng trọn vẹn 100% logic Backend cho các ứng dụng mở rộng trong tương lai (Mobile App, hệ thống liên thông chính phủ).
- **Tiêu cực / Rủi ro cần quản lý**:
  - Cần quản lý vấn đề CORS (Cross-Origin Resource Sharing) và cấu hình Nginx Reverse Proxy chuẩn xác.
  - Cần duy trì tài liệu đặc tả API (OpenAPI / Swagger) đồng bộ giữa hai đội ngũ.

---

## ADR-002: Kiến trúc xử lý bất đồng bộ (Queue & Background Worker) cho các tác vụ nặng (OCR, AI)

- **Trạng thái**: `ĐÃ PHÊ DUYỆT (ACCEPTED)`
- **Ngày quyết định**: 2026-07-27
- **Người đề xuất**: Đội ngũ Kiến trúc sư hệ thống

### 1. Bối cảnh (Context)
- Lưu lượng công văn đến từ 150 - 300 văn bản/ngày. Trong đó, có 20% - 30% là văn bản scan hoặc ảnh chụp (nhiều tệp từ 10 - 50 trang).
- Các tác vụ xử lý bao gồm: Nhận dạng OCR, Trích xuất siêu dữ liệu qua LLM, Tóm tắt nội dung văn bản dài, và Sinh dự thảo văn bản phản hồi.
- Thời gian chạy mô hình AI/OCR dao động từ 3 đến 45 giây tùy thuộc vào độ dài file.
- Nếu xử lý đồng bộ (Synchronous HTTP Request-Response), yêu cầu sẽ bị timeout (> 30s), làm cạn kiệt tài nguyên luồng (Thread Starvation) của máy chủ API, và quan trọng nhất là **gây "treo", "đơ" toàn bộ giao diện người dùng**, vi phạm nghiêm trọng yêu cầu phi chức năng NFR2 và NFR4.

### 2. Quyết định (Decision)
Thiết lập mô hình kiến trúc hàng đợi công việc bất đồng bộ (Asynchronous Task Queue with Background Workers):
1. **Message Broker**: Sử dụng **Redis** kết hợp framework điều phối hàng đợi (Celery cho Python hoặc BullMQ cho Node.js).
2. **Luồng 2 pha (Two-phase Execution)**:
   - *Pha 1 (Phản hồi tức thời)*: Khi người dùng tải file hoặc kích hoạt AI, Backend API chỉ ghi nhận bản ghi với trạng thái `PROCESSING`, đẩy thông điệp công việc vào Redis Queue và **trả về ngay mã HTTP 202 Accepted** cùng `job_id` trong vòng < 300ms. Giao diện người dùng lập tức mở khóa (Non-blocking UI).
   - *Pha 2 (Xử lý ngầm)*: Một cụm Worker độc lập (OCR Worker, AI Worker) lắng nghe Redis Queue, bốc tác vụ để xử lý. Sau khi hoàn tất, Worker ghi kết quả vào PostgreSQL và phát sự kiện thông báo qua WebSocket đến Client.

### 3. Hệ quả (Consequences)
- **Tích cực**:
  - Giao diện người dùng luôn mượt mà, phản hồi tức thì dưới 1 giây. Người dùng thoải mái nhập liệu hoặc tra cứu các văn bản khác trong khi chờ AI xử lý ngầm.
  - Khả năng mở rộng vượt trội: Có thể tăng/giảm số lượng Background Worker theo khối lượng công văn thực tế mà không ảnh hưởng đến máy chủ API chính.
  - Tích hợp sẵn cơ chế Retry tự động và hàng đợi lỗi (Dead Letter Queue - DLQ).
- **Tiêu cực / Rủi ro cần quản lý**:
  - Kiến trúc hệ thống phức tạp hơn, đòi hỏi giám sát thêm tiến trình Worker và dịch vụ Redis.
  - Cần cơ chế cập nhật trạng thái thời gian thực để người dùng biết khi nào tiến trình xử lý xong.

---

## ADR-003: Thiết kế Lớp trừu tượng hóa AI (AI Abstraction Layer) theo mẫu Adapter Pattern

- **Trạng thái**: `ĐÃ PHÊ DUYỆT (ACCEPTED)`
- **Ngày quyết định**: 2026-07-27
- **Người đề xuất**: Đội ngũ Kiến trúc sư hệ thống

### 1. Bối cảnh (Context)
- Yêu cầu NFR1 cấm tuyệt đối việc đẩy dữ liệu công văn mật ra bên ngoài các dịch vụ Cloud AI thương mại.
- Cơ quan hiện tại chưa lắp đặt kịp máy chủ GPU chuyên dụng (đang trong giai đoạn đề xuất mua sắm RTX 3090/4090).
- Giai đoạn thử nghiệm PoC (kéo dài 1 tuần) cần kiểm chứng tính khả thi của quy trình nghiệp vụ bằng các mô hình đám mây mạnh mẽ (Google Gemini API, OpenAI API) với dữ liệu giả lập.
- Yêu cầu NFR6 và NFR7 đòi hỏi logic nghiệp vụ không được gắn chặt (hard-code) vào một nhà cung cấp AI cụ thể, phải dễ dàng chuyển đổi nhà cung cấp mà không sửa mã nguồn cốt lõi.

### 2. Quyết định (Decision)
Áp dụng mẫu thiết kế **Adapter Pattern** và **Abstract Factory**:
1. Định nghĩa giao diện chung duy nhất `IAIService` chuẩn hóa các phương thức nghiệp vụ:
   - `extractMetadata(documentText)`
   - `summarizeDocument(documentText)`
   - `classifyDocument(documentText)`
   - `generateDraftResponse(originalDoc, leaderDirective, template)`
2. Xây dựng các lớp Adapter cụ thể:
   - `LocalAIAdapter`: Kết nối qua mạng LAN đến máy chủ AI On-Premise (Ollama / vLLM runtime chạy mô hình mã nguồn mở như Llama-3-Vietnamese, PhoGPT, Qwen 2.5).
   - `CloudAIAdapter`: Kết nối qua HTTPS đến Google Gemini API hoặc OpenAI API.
3. Bộ điều phối `AIServiceFactory`: Căn cứ vào cờ cấu hình môi trường (`AI_PROVIDER`) và mức độ bảo mật của văn bản (`is_confidential`) để quyết định adapter thực thi. Nếu văn bản là **MẬT**, hệ thống cưỡng chế gọi `LocalAIAdapter`, ngăn chặn mọi rò rỉ dữ liệu.

### 3. Hệ quả (Consequences)
- **Tích cực**:
  - Đảm bảo tuân thủ 100% quy định an toàn dữ liệu cơ quan nhà nước.
  - Dễ dàng chuyển đổi từ Cloud sang On-Premise GPU chỉ bằng một dòng cấu hình biến môi trường mà không cần viết lại mã nguồn.
  - Thuận tiện cho việc viết Unit Test và Mock Service khi kiểm thử tự động.
- **Tiêu cực / Rủi ro cần quản lý**:
  - Prompt Engineering cần được thiết kế cẩn thận để cả mô hình Cloud lớn và mô hình Local cỡ trung bình (7B - 14B) đều xuất ra định dạng JSON đồng nhất.

---

## ADR-004: Cơ chế phân quyền dữ liệu kết hợp RBAC và ABAC

- **Trạng thái**: `ĐÃ PHÊ DUYỆT (ACCEPTED)`
- **Ngày quyết định**: 2026-07-27
- **Người đề xuất**: Đội ngũ Kiến trúc sư hệ thống

### 1. Bối cảnh (Context)
- Hệ thống quản lý các công văn hành chính với mức độ nhạy cảm cao.
- Khảo sát thực tế yêu cầu rõ: *"Văn bản giao cho ai/phòng nào thì chỉ người đó/phòng đó được quyền truy cập"*.
- Nếu chỉ áp dụng phân quyền theo vai trò (Role-Based Access Control - RBAC đơn thuần), mọi Chuyên viên đều có quyền xem tất cả văn bản trong hệ thống, dẫn đến vi phạm nghiêm trọng nguyên tắc bảo mật và quyền riêng tư giữa các phòng ban.

### 2. Quyết định (Decision)
Áp dụng mô hình bảo mật kết hợp hai tầng:
1. **Tầng 1 - RBAC (Role-Based Access Control)**:
   - Kiểm soát hành động được phép thực thi theo chức năng:
     - `CLERK`: Tải văn bản, OCR, sửa siêu dữ liệu, vào sổ, cấp số đi.
     - `LEADER`: Đọc tóm tắt, giao việc, phê duyệt, xem Dashboard toàn cơ quan.
     - `SPECIALIST`: Soạn dự thảo bằng AI, cập nhật trạng thái giải quyết, tra cứu văn bản.
2. **Tầng 2 - ABAC (Attribute-Based Access Control)**:
   - Kiểm soát quyền truy cập trực tiếp trên từng bản ghi tài liệu:
   - Một người dùng chỉ được phép đọc/sửa một văn bản nếu thỏa mãn một trong các điều kiện thuộc tính sau:
     - Người dùng là `LEADER` (Lãnh đạo cơ quan/đơn vị).
     - Người dùng thuộc vai trò `CLERK` phụ trách tiếp nhận và vào sổ.
     - Người dùng là Chuyên viên được đích danh giao việc (`assigned_user_id == current_user.id`).
     - Người dùng thuộc phòng ban chủ trì hoặc phòng ban phối hợp xử lý văn bản (`user.department_id IN doc.involved_department_ids`).

### 3. Hệ quả (Consequences)
- **Tích cực**:
  - Đáp ứng trọn vẹn và tuyệt đối nguyên tắc bảo mật nội bộ theo NFR1.
  - Ngăn ngừa hoàn toàn lỗ hổng IDOR (Insecure Direct Object References) khi người dùng đổi ID văn bản trên thanh URL.
- **Tiêu cực / Rủi ro cần quản lý**:
  - Các truy vấn SQL / ORM lọc danh sách văn bản phải luôn kèm theo mệnh đề điều kiện ABAC, đòi hỏi đánh chỉ mục (Index) hiệu quả trên các cột `department_id` và `assigned_user_id`.

---

## ADR-005: Giải pháp đồng bộ tiến độ thời gian thực bằng WebSocket kết hợp Polling dự phòng

- **Trạng thái**: `ĐÃ PHÊ DUYỆT (ACCEPTED)`
- **Ngày quyết định**: 2026-07-27
- **Người đề xuất**: Đội ngũ Kiến trúc sư hệ thống

### 1. Bối cảnh (Context)
- Do các tác vụ OCR và AI xử lý ngầm trong khoảng thời gian từ vài giây đến hàng chục giây, giao diện người dùng cần được cập nhật dữ liệu tự động ngay khi Background Worker hoàn thành mà không yêu cầu người dùng phải bấm F5 tải lại trang.
- Mạng nội bộ cơ quan hành chính đôi khi có tường lửa hoặc proxy khắt khe có thể gây ngắt kết nối WebSocket kéo dài.

### 2. Quyết định (Decision)
Triển khai giải pháp kênh đôi (Dual-Channel Realtime Synchronization):
1. **Kênh chính - WebSocket (Socket.io / Native WebSocket)**:
   - Client duy trì kết nối WebSocket nhẹ nhàng với máy chủ API.
   - Khi Worker xử lý xong, Redis Pub/Sub sẽ bắn thông điệp đến WebSocket Hub để đẩy trực tiếp dữ liệu kết quả đến đúng phiên làm việc của người dùng.
2. **Kênh dự phòng - Short/Long Polling**:
   - Nếu kết nối WebSocket bị gián đoạn do hạ tầng mạng, Frontend tự động fallback sang cơ chế Polling định kỳ (mỗi 3 giây) gọi endpoint `GET /api/v1/tasks/{job_id}` cho đến khi tác vụ hoàn thành.

### 3. Hệ quả (Consequences)
- **Tích cực**:
  - Trải nghiệm người dùng mượt mà, kết quả hiển thị tức thì trên màn hình ngay khi AI bóc tách xong.
  - Độ tin cậy đạt 100%, không bị ảnh hưởng tiêu cực bởi các hạn chế tường lửa của mạng cơ quan.
- **Tiêu cực / Rủi ro cần quản lý**:
  - Cần quản lý vòng đời kết nối WebSocket (Heartbeat, Reconnect) phía Frontend.

---

## ADR-006: Kiến trúc hạ tầng Local AI On-Premise trên GPU phục vụ bảo mật tài liệu mật

- **Trạng thái**: `ĐÃ PHÊ DUYỆT (ACCEPTED)`
- **Ngày quyết định**: 2026-07-27
- **Người đề xuất**: Đội ngũ Kiến trúc sư hệ thống

### 1. Bối cảnh (Context)
- Máy chủ hiện có của cơ quan: CPU Intel Xeon, 64GB RAM, không có GPU chuyên dụng. Cấu hình này đáp ứng rất tốt việc chạy Nginx, Node.js/Python API, Redis và PostgreSQL, nhưng không thể chạy mượt mà các mô hình ngôn ngữ lớn (LLM) nội bộ (độ trễ sinh text trên CPU rất lớn, thường > 60s/văn bản).
- Yêu cầu bảo mật tuyệt đối không gửi văn bản mật ra Internet đòi hỏi phải có mô hình AI nội bộ hoàn toàn.

### 2. Quyết định (Decision)
Phân chia hạ tầng làm 2 cụm máy chủ kết nối qua mạng nội bộ LAN:
1. **Node 1 - Application Server (Máy chủ hiện có)**:
   - CPU Intel Xeon, 64GB RAM.
   - Triển khai: Web Gateway (Nginx), Frontend App, Backend API, Redis Broker và PostgreSQL Database.
2. **Node 2 - Dedicated AI Inference Server (Đề xuất đầu tư bổ sung)**:
   - Trang bị máy chủ AI chứa tối thiểu **1 card đồ họa NVIDIA RTX 3090 hoặc RTX 4090 (24GB VRAM)**.
   - Cài đặt runtime suy luận hiệu năng cao: **vLLM** hoặc **Ollama** phục vụ LLM (chạy các model mã nguồn mở như Llama-3-Vietnamese 8B Q4/Q8 hoặc Qwen-2.5-7B/14B-Instruct) và **PaddleOCR** phục vụ nhận dạng văn bản tiếng Việt.
   - Hai máy chủ giao tiếp với nhau qua đường truyền LAN riêng biệt (tốc độ Gigabit, độ trễ < 2ms).

### 3. Hệ quả (Consequences)
- **Tích cực**:
  - Tách rời tải tính toán nặng của AI khỏi tải vận hành của hệ thống web hành chính, không gây sụt giảm hiệu năng người dùng.
  - Khai thác tối đa chi phí đầu tư phần cứng (RTX 3090/4090 mang lại tỷ suất hiệu năng/giá thành tối ưu nhất cho mô hình ngôn ngữ 8B-14B).
  - Hoàn toàn khép kín trong mạng nội bộ, đáp ứng tiêu chuẩn an toàn thông tin cấp độ nhà nước.
- **Tiêu cực / Rủi ro cần quản lý**:
  - Cơ quan cần bố trí ngân sách bổ sung máy chủ GPU và phòng máy có điều hòa làm mát ổn định.
  Status: APPROVED

