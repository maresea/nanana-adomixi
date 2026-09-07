# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mục đích & Bối cảnh dự án
Hệ thống được phát triển nhằm giải quyết các điểm nghẽn nghiêm trọng trong quy trình xử lý công văn truyền thống tại cơ quan:
- **Khâu tiếp nhận & số hóa**: Tốn nhiều thời gian mở từng file scan/ảnh chụp, gõ lại thủ công các trường thông tin (số ký hiệu, ngày ban hành, cơ quan ban hành, trích yếu) và đọc nội dung dài để phân loại.
- **Khâu chỉ đạo của Lãnh đạo**: Lãnh đạo không có thời gian đọc toàn bộ các báo cáo dài hàng chục trang; cần bản tóm tắt súc tích (3-5 ý cốt lõi) nêu rõ mục đích, yêu cầu và hạn chót để đưa ra chỉ đạo giao việc tức thì.
- **Khâu theo dõi tiến độ & hạn xử lý**: Việc theo dõi hạn xử lý đang làm thủ công (Excel hoặc ghi nhớ cá nhân), dẫn đến tình trạng sót việc, trễ hạn hoặc chỉ phát hiện khi đã quá hạn do thiếu cơ chế cảnh báo tự động.
- **Khâu soạn thảo phản hồi của Chuyên viên**: Mất nhiều thời gian tra cứu ngữ cảnh cũ và tự "đắp thịt" từ vài từ chỉ đạo ngắn gọn của lãnh đạo thành văn bản hành chính hoàn chỉnh, chuẩn thể thức nhà nước.

### 1.2. Phạm vi hệ thống
Hệ thống quản lý toàn bộ vòng đời của công văn đến và công văn đi, tích hợp sâu các năng lực Trí tuệ nhân tạo (AI & OCR) nhằm tự động hóa các khâu thủ công, đồng thời kiểm soát nghiêm ngặt luồng dữ liệu bảo mật nội bộ.

### 1.3. Khảo sát lưu lượng & Đặc tính dữ liệu
- **Lưu lượng tiếp nhận**:
  - Trung bình: 150 - 200 văn bản/ngày (~ 3.000 - 4.000 văn bản/tháng).
  - Đợt cao điểm (cuối quý, cuối năm): 250 - 300 văn bản/ngày.
- **Định dạng tài liệu**:
  - File điện tử trực tiếp: PDF, DOCX,...
  - File scan/ảnh chụp: Chiếm 20% - 30% tổng số văn bản; chất lượng không đồng đều (PDF máy scan rõ nét, ảnh chụp điện thoại bị xô lệch, thiếu sáng).

---

## 2. NHẬN DIỆN VAI TRÒ NGƯỜI DÙNG (USER PERSONAS)

| STT | Vai trò (Role) | Thiết bị chính | Trách nhiệm chính & Điểm đau nghiệp vụ |
|:---:|:---|:---|:---|
| 1 | **Văn thư** *(Clerk)* | Máy tính để bàn (PC) | - Tiếp nhận công văn từ đa kênh (email, dịch vụ công, bản scan giấy).<br>- Tốn nhiều thời gian nhập liệu thủ công (số hiệu, ngày, trích yếu...) và đọc phân loại luân chuyển.<br>- Chuyển đổi OCR cho bản scan/ảnh chụp.<br>- Đưa công văn vào sổ, trình Lãnh đạo phân công. |
| 2 | **Lãnh đạo** *(Leader/Manager)* | PC và Máy tính bảng (Tablet) khi đi họp/công tác | - Nhận công văn do Văn thư trình.<br>- Quá tải thông tin, không có thời gian đọc văn bản dài.<br>- Cần AI tóm tắt 3-5 ý cốt lõi (mục đích, yêu cầu, hạn chót) để ra quyết định ngay.<br>- Phân công người/phòng ban xử lý, ấn định thời hạn giải quyết.<br>- Phê duyệt văn bản dự thảo.<br>- Giám sát tiến độ xử lý toàn cơ quan qua Dashboard thống kê trực quan. |
| 3 | **Chuyên viên** *(Officer/Specialist)* | Máy tính để bàn (PC) | - Tiếp nhận công văn được Lãnh đạo phân công (theo phạm vi quyền hạn cá nhân/phòng ban).<br>- Tra cứu ngữ cảnh hồ sơ công văn cũ.<br>- Mất nhiều thời gian soạn thảo công văn phản hồi chuẩn thể thức hành chính từ các chỉ đạo ngắn của lãnh đạo.<br>- Cần AI sinh dự thảo phản hồi tự động theo đúng mẫu chuẩn.<br>- Cập nhật trạng thái xử lý và nhận thông báo nhắc hạn tự động. |

---

## 3. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS - FR)

### 3.1. Bóc tách FR theo 3 vai trò

#### A. Nhóm chức năng dành cho Văn thư (FR-VT)
- **FR-VT01. Tiếp nhận & Quản lý file đính kèm**: Tiếp nhận công văn từ nhiều nguồn (upload file PDF, Word, ảnh chụp dạng JPG/PNG).
- **FR-VT02. Nhận dạng ký tự (OCR)**: Tự động nhận diện và chuyển đổi tệp văn bản scan hoặc ảnh chụp (kể cả ảnh xô lệch, thiếu sáng) thành văn bản số (plain text) để cung cấp cho mô hình AI.
- **FR-VT03. AI Trích xuất trường thông tin tự động**: AI tự động nhận diện và trích xuất các thông tin hành chính cốt lõi:
  - Số ký hiệu văn bản.
  - Ngày ban hành văn bản.
  - Cơ quan/đơn vị ban hành (nơi gửi).
  - Trích yếu nội dung văn bản.
  - Hạn xử lý ghi trong văn bản (nếu có).
  - Cho phép Văn thư kiểm tra, đối soát trực quan cạnh file gốc và sửa tay nếu cần trước khi lưu.
- **FR-VT04. AI Gợi ý phân loại & Độ khẩn**: AI phân tích nội dung văn bản để đề xuất:
  - Danh mục/nhóm văn bản (Tài chính, Tổ chức cán bộ, Kế hoạch đầu tư, Hành chính tổng hợp...).
  - Mức độ ưu tiên xử lý (Hỏa tốc, Thượng khẩn, Khẩn, Bình thường).
  - Đơn vị/phòng ban chuyên môn dự kiến phù hợp để xử lý.
- **FR-VT05. Vào sổ & Trình duyệt công văn**: Cập nhật thông tin vào sổ theo dõi công văn đến, thiết lập trạng thái và trình chuyển tiếp lên Lãnh đạo phê duyệt/chỉ đạo.
- **FR-VT06. Quản lý công văn đi & Cấp số**: Lưu trữ công văn đi chính thức đã được Lãnh đạo ký duyệt, cấp số ký hiệu, đính kèm tệp văn bản phát hành và gửi đi.
- **FR-VT07. Tra cứu công văn**: Tìm kiếm nhanh và nâng cao theo số ký hiệu, ngày ban hành, đơn vị gửi, trích yếu, trạng thái luân chuyển.

#### B. Nhóm chức năng dành cho Lãnh đạo (FR-LD)
- **FR-LD01. Tiếp nhận & Xem danh sách công văn trình duyệt**: Nhận thông báo và xem danh sách công văn Văn thư vừa trình, sắp xếp theo mức độ khẩn và thời gian tiếp nhận.
- **FR-LD02. AI Tóm tắt văn bản thông minh**:
  - Xem bản tóm tắt tự động gồm **3-5 ý cốt lõi**:
    1. Cơ quan ban hành & Mục đích chính của công văn.
    2. Các yêu cầu, nhiệm vụ trọng tâm cơ quan cần triển khai.
    3. Thời hạn chót (deadline) phải hoàn thành/phản hồi.
  - Không cần đọc toàn bộ văn bản dài hàng chục trang mà vẫn nắm trọn vẹn ngữ cảnh để ra quyết định.
- **FR-LD03. Phân công xử lý & Thiết lập hạn chót**:
  - Thao tác giao việc trực tiếp trên hệ thống: Chọn đích danh Chuyên viên hoặc Phòng ban chủ trì, các đơn vị phối hợp.
  - Thiết lập ngày/giờ hạn xử lý (Deadline) cho nhiệm vụ.
  - Nhập ý kiến chỉ đạo vắn tắt (ghi chú định hướng xử lý để Chuyên viên căn cứ thực hiện).
- **FR-LD04. Phê duyệt công văn dự thảo phản hồi**:
  - Tiếp nhận bản dự thảo công văn phản hồi do Chuyên viên trình duyệt.
  - Xem so sánh, lịch sử sửa đổi, phê duyệt hoặc trả lại kèm ý kiến chỉnh sửa bổ sung.
- **FR-LD05. Dashboard Báo cáo & Giám sát tiến độ**:
  - Bảng điều khiển trực quan hiển thị số liệu thời gian thực:
    - Tổng số lượng công văn tiếp nhận (theo ngày, tuần, tháng, quý).
    - Tỷ lệ và số lượng công văn đã xử lý, đang xử lý, chưa xử lý.
    - Thống kê tình trạng hạn xử lý: Đúng hạn, Sắp đến hạn, Quá hạn.
    - Phân tích hiệu suất theo từng phòng ban và từng cá nhân chuyên viên.

#### C. Nhóm chức năng dành cho Chuyên viên (FR-CV)
- **FR-CV01. Tiếp nhận nhiệm vụ & Phân quyền truy cập**:
  - Nhận thông báo khi được Lãnh đạo phân công xử lý văn bản.
  - Chỉ xem và thao tác trên những văn bản được phân công trực tiếp hoặc thuộc thẩm quyền phòng ban của mình (đảm bảo tính bảo mật dữ liệu).
- **FR-CV02. Xem chi tiết & Định hướng chỉ đạo**:
  - Xem file gốc đính kèm, trích yếu, bản tóm tắt AI (3-5 ý cốt lõi) và ý kiến chỉ đạo cụ thể từ Lãnh đạo.
- **FR-CV03. Tra cứu ngữ cảnh & Hồ sơ liên quan**:
  - Tra cứu các văn bản liên quan, công văn đi/đến trong quá khứ cùng chủ đề hoặc cùng cơ quan gửi để có đầy đủ ngữ cảnh tham chiếu.
- **FR-CV04. AI Sinh dự thảo phản hồi (Draft Generation)**:
  - Tự động sinh dự thảo văn bản phản hồi dựa trên:
    - Nội dung cốt lõi của công văn gốc.
    - Ý kiến chỉ đạo/ghi chú ngắn gọn của Lãnh đạo.
    - Biểu mẫu (template) hành chính quy định (Quốc hiệu, Tiêu ngữ, Tên cơ quan, Kính gửi, Căn cứ pháp lý, Nội dung giải quyết, Nơi nhận...).
  - Đảm bảo đúng chuẩn thể thức văn bản hành chính nhà nước.
- **FR-CV05. Hiệu chỉnh & Trình văn bản phản hồi**:
  - Cho phép Chuyên viên biên tập, bổ sung, chỉnh sửa nội dung văn bản do AI sinh ra trước khi hoàn tất.
  - Trình văn bản dự thảo lên Lãnh đạo xem xét và phê duyệt.
- **FR-CV06. Cập nhật trạng thái xử lý**:
  - Cập nhật tiến độ giải quyết công việc: *Tiếp nhận -> Đang xử lý -> Đã trình dự thảo -> Hoàn thành*.
- **FR-CV07. Nhận cảnh báo & Nhắc hạn xử lý tự động**:
  - Nhận thông báo nhắc nhở khi công văn sắp đến hạn xử lý (trước 1 ngày, trước vài giờ).
  - Nhận cảnh báo tức thì khi công văn bị quá hạn chưa hoàn thành.

---

### 3.2. Bảng tổng hợp mã định danh chức năng hệ thống (FR-Matrix)

| Mã FR | Tên chức năng | Vai trò chính | Thành phần AI | Mô tả tóm tắt |
|:---|:---|:---|:---:|:---|
| **FR1** | Đăng nhập và phân quyền | Văn thư, Lãnh đạo, Chuyên viên | Không | Kiểm soát đăng nhập, phân quyền RBAC/ABAC theo vai trò và phạm vi dữ liệu văn bản. |
| **FR2** | Quản lý công văn (Đến/Đi) | Văn thư, Lãnh đạo, Chuyên viên | Không | Tiếp nhận, tạo mới, lưu trữ, đính kèm tệp và quản lý vòng đời công văn. |
| **FR3** | Phân công xử lý & Thiết lập hạn | Lãnh đạo | Không | Giao việc cho chuyên viên/phòng ban, thiết lập deadline, nhập ý kiến chỉ đạo. |
| **FR4** | Cập nhật tiến độ & Trình phản hồi | Chuyên viên | Không | Cập nhật trạng thái giải quyết, đính kèm dự thảo và gửi trình Lãnh đạo. |
| **FR5** | Tra cứu và tìm kiếm văn bản | Tất cả vai trò | Không | Tìm kiếm nâng cao theo số hiệu, ngày ban hành, đơn vị gửi, từ khóa, trạng thái. |
| **FR6** | Cảnh báo và nhắc hạn tự động | Hệ thống (gửi Lãnh đạo & Chuyên viên) | Không | Tự động kích hoạt thông báo khi văn bản sắp đến hạn hoặc quá thời hạn xử lý. |
| **FR7** | AI Trích xuất thông tin tự động | Văn thư | **Có** *(LLM/NER)* | Tự động bóc tách số hiệu, ngày, nơi ban hành, trích yếu với độ chính xác cao. |
| **FR8** | AI Tóm tắt văn bản thông minh | Lãnh đạo, Chuyên viên | **Có** *(LLM Summarizer)* | Rút gọn văn bản dài thành 3-5 ý cốt lõi: mục đích, yêu cầu, hạn chót xử lý. |
| **FR9** | AI Phân loại & Gợi ý ưu tiên | Văn thư | **Có** *(LLM Classifier)* | Gợi ý nhóm danh mục công văn, mức độ khẩn và đơn vị xử lý đề xuất. |
| **FR10** | AI Sinh dự thảo phản hồi | Chuyên viên | **Có** *(LLM Generator)* | Tự động sinh công văn trả lời đúng thể thức hành chính từ chỉ đạo của lãnh đạo. |
| **FR11** | Dashboard Báo cáo & Thống kê | Lãnh đạo | Không | Bảng điều khiển thời gian thực theo dõi tổng lượng công văn, tỷ lệ đúng hạn/quá hạn. |
| **FR12** | Nhận dạng ký tự quang học (OCR) | Văn thư, Hệ thống | **Có** *(OCR Engine)* | Đọc và trích xuất text thô từ tệp ảnh scan, PDF hình ảnh chất lượng không đồng đều. |

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

### 4.1. NFR1 - Bảo mật dữ liệu & Phân quyền truy cập nội bộ (Security & Confidentiality)
- **Kiểm soát truy cập theo phân quyền**: Áp dụng cơ chế kiểm soát truy cập nghiêm ngặt dựa trên vai trò (RBAC) kết hợp phạm vi nhiệm vụ (ABAC). Văn bản giao cho cá nhân hoặc phòng ban nào thì **chỉ cá nhân/phòng ban đó và lãnh đạo phụ trách** mới được quyền truy xuất nội dung.
- **Bảo mật dữ liệu công văn nội bộ**:
  - **Tuyệt đối cấm** gửi nội dung tài liệu mật, nhạy cảm lên các dịch vụ Cloud AI thương mại bên ngoài (OpenAI, Gemini Cloud,...).
  - **Cơ chế Local AI**: Hệ thống phải hỗ trợ vận hành mô hình AI hoàn toàn nội bộ (Local AI/On-premise) chạy trên mạng LAN nội bộ, không yêu cầu kết nối Internet đối với các văn bản mật.
  - **Giai đoạn thử nghiệm (PoC/Staging)**: Cho phép cấu hình linh hoạt sử dụng API Cloud AI (OpenAI, Google Gemini) **chỉ đối với dữ liệu văn bản giả lập, dữ liệu công khai** nhằm kiểm chứng luồng nghiệp vụ.
- **An toàn lưu trữ & Truyền thông**: Dữ liệu tệp đính kèm và thông tin trong CSDL phải được mã hóa khi lưu trữ (Encryption at Rest) và mã hóa đường truyền HTTPS/TLS (Encryption in Transit).

### 4.2. NFR2 - Xử lý Bất đồng bộ & Hiệu năng hệ thống (Asynchronous Processing & Non-blocking UI)
- **Tác vụ AI chạy ngầm bất đồng bộ (Asynchronous/Background Execution)**:
  - Mọi tác vụ tốn thời gian xử lý (OCR nhận dạng ảnh scan, trích xuất thông tin AI, tóm tắt văn bản dài, sinh văn bản dự thảo) **bắt buộc phải được đẩy vào hàng đợi xử lý ngầm (Message Queue / Background Worker)**.
  - Tuyệt đối không thực thi các tác vụ AI theo dạng đồng bộ gây "đơ", "treo" (blocking) giao diện người dùng.
- **Trải nghiệm người dùng không gián đoạn (Non-blocking UX)**:
  - Khi hệ thống đang xử lý OCR hoặc AI ngầm, người dùng (Văn thư, Lãnh đạo, Chuyên viên) vẫn tự do thực hiện các thao tác khác (nhập liệu, tra cứu, xem văn bản khác).
  - Có cơ chế thông báo trạng thái xử lý tiến trình trực quan (Loading status, Processing badge, WebSocket/Server-Sent Events đẩy kết quả khi hoàn thành).
- **Thời gian đáp ứng tương tác (Response Time)**:
  - Các thao tác click chuột, chuyển trang, lưu form thông thường phải phản hồi nhanh tức thì (dưới **1 giây**).
  - Tác vụ tìm kiếm/tra cứu dữ liệu phản hồi dưới **1.5 giây**.

### 4.3. NFR3 - Độ chính xác và chất lượng đầu ra AI (AI Accuracy & Precision)
- **Độ chính xác trích xuất thông tin (Extraction Accuracy)**:
  - Tỷ lệ bóc tách chính xác các trường siêu dữ liệu (Số ký hiệu, Ngày ban hành, Cơ quan ban hành, Trích yếu) phải đạt tối thiểu **90% - 95%** đối với văn bản điện tử và văn bản scan chuẩn.
  - Giảm thiểu tối đa việc người dùng phải chỉnh sửa đối soát thủ công.
- **Chất lượng tóm tắt (Summarization Quality)**:
  - Đúng chuẩn cấu trúc 3-5 ý cốt lõi, không bỏ sót thời hạn (deadline) và yêu cầu trọng yếu; không sinh thông tin giả mạo (no hallucination).
- **Chuẩn hóa thể thức dự thảo (Draft Formatting)**:
  - Bản dự thảo sinh ra phải bám sát ý kiến chỉ đạo, đúng thể thức kỹ thuật trình bày văn bản hành chính theo quy định nhà nước (nghị định công tác văn thư).

### 4.4. NFR4 - Tương thích hạ tầng phần cứng & Khả năng mở rộng (Hardware Constraints & Scalability)
- **Đáp ứng tải định mức**:
  - Xử lý mượt mà lưu lượng thông thường 150 - 200 văn bản/ngày (3.000 - 4.000 văn bản/tháng).
  - Chịu tải tốt trong các đợt cao điểm đạt 250 - 300 văn bản/ngày mà không xảy ra nghẽn hàng đợi hoặc crash dịch vụ.
- **Hạ tầng máy chủ triển khai**:
  - Khảo sát hiện trạng: Máy chủ vật lý sẵn có của cơ quan (RAM 64GB, CPU Intel Xeon) phục vụ chạy Web Application, CSDL và lưu trữ file.
  - Hạ tầng đề xuất bổ sung cho Local AI: Trang bị máy chủ AI chuyên dụng có GPU tối thiểu từ **NVIDIA RTX 3090 (24GB VRAM) hoặc RTX 4090 (24GB VRAM)** để vận hành các mô hình ngôn ngữ lớn nguồn mở cỡ trung bình (7B - 14B parameters, lượng tử hóa 4-bit/8-bit).

### 4.5. NFR5 - Khả năng sử dụng & Đa nền tảng (Usability & Responsiveness)
- **Giao diện người dùng**: Thiết kế trực quan, dễ thao tác, phù hợp với thói quen làm việc của cán bộ, công chức cơ quan hành chính.
- **Hỗ trợ đa thiết bị**:
  - Giao diện Web tối ưu trên PC/Laptop cho Văn thư và Chuyên viên.
  - Giao diện Responsive tối ưu hiển thị trên **Máy tính bảng (Tablet)** và PC dành cho Lãnh đạo để thuận tiện đọc tóm tắt, phê duyệt và chỉ đạo khi đi họp, công tác.

### 4.6. NFR6 - Kiến trúc phần mềm & Độc lập nhà cung cấp AI (Maintainability & AI Provider Agnostic)
- **Tách biệt Frontend - Backend**: Kiến trúc phân tầng rõ ràng, Backend cung cấp RESTful API / GraphQL chuẩn hóa, dễ bảo trì và mở rộng.
- **AI Abstraction Layer (Lớp trừu tượng hóa AI)**:
  - Các module AI được đóng gói độc lập theo mô hình Adapter/Provider Pattern.
  - Cho phép cấu hình hoán đổi linh hoạt giữa Cloud Provider (Gemini API, OpenAI API) và Local AI Runtime (Ollama, vLLM, Local Server) thông qua cài đặt hệ thống (Configuration/Environment Variables) mà không phải sửa đổi mã nguồn nghiệp vụ cốt lõi.

---

## 5. RÀNG BUỘC VÀ GIẢ ĐỊNH NGHIỆP VỤ (CONSTRAINTS & ASSUMPTIONS)

### 5.1. Ràng buộc (Constraints)
1. **Tuân thủ quy trình hành chính**: Mọi luồng xử lý văn bản (tiếp nhận, trình duyệt, phân công, dự thảo, ban hành) phải tuân thủ nghiêm ngặt quy trình quản lý văn bản nhà nước, không tự ý sáng tác thêm các luồng xử lý ngoài tài liệu khảo sát.
2. **Không tự động ban hành**: AI chỉ đóng vai trò trợ lý hỗ trợ (đề xuất, gợi ý, sinh bản nháp). Mọi thông tin trích xuất, phân loại, tóm tắt và dự thảo bắt buộc phải qua sự xác nhận/phê duyệt của con người (Văn thư, Chuyên viên, Lãnh đạo) trước khi lưu chính thức hoặc phát hành.
3. **Thời gian phát triển PoC**: Dự án thử nghiệm triển khai trong phạm vi ngắn (1 tuần, từ 27/07/2026 đến 02/08/2026).

### 5.2. Giả định (Assumptions)
1. Trong giai đoạn thử nghiệm (PoC), các văn bản được sử dụng để gọi Cloud AI là dữ liệu giả lập, không chứa thông tin mật nhà nước.
2. Chất lượng file scan đầu vào có thể bị nhiễu hoặc lệch tới 30%, hệ thống cần có bộ lọc tiền xử lý ảnh cơ bản trước khi đưa vào module OCR.

---

## 6. MA TRẬN TRUY VẾT YÊU CẦU (TRACEABILITY MATRIX)

| Mã FR | Tên chức năng | Văn thư | Lãnh đạo | Chuyên viên | Ràng buộc NFR liên quan |
|:---|:---|:---:|:---:|:---:|:---|
| **FR1** | Đăng nhập & Phân quyền | x | x | x | NFR1 (RBAC/ABAC, Bảo mật) |
| **FR2** | Quản lý công văn đến/đi | x | x | x | NFR1 (Bảo mật), NFR4 (Tải dữ liệu) |
| **FR3** | Phân công xử lý & Thiết lập hạn | | x | | NFR1 (Phân quyền nhiệm vụ) |
| **FR4** | Cập nhật tiến độ & Trình duyệt | | | x | NFR4 (Hiệu năng) |
| **FR5** | Tra cứu & Tìm kiếm nâng cao | x | x | x | NFR1 (Chỉ tìm văn bản có quyền xem), NFR2 |
| **FR6** | Nhắc hạn & Cảnh báo tự động | | x | x | NFR2 (Xử lý ngầm, cảnh báo tức thì) |
| **FR7** | AI Trích xuất thông tin | x | | | NFR2 (Async), NFR3 (Chính xác 90-95%), NFR6 |
| **FR8** | AI Tóm tắt văn bản thông minh | | x | x | NFR2 (Async), NFR3 (3-5 ý cốt lõi), NFR5 |
| **FR9** | AI Phân loại & Gợi ý ưu tiên | x | | | NFR2 (Async), NFR6 (AI Adapter) |
| **FR10** | AI Sinh dự thảo phản hồi | | | x | NFR2 (Async), NFR3 (Chuẩn thể thức), NFR6 |
| **FR11** | Dashboard Báo cáo & Thống kê | | x | | NFR2 (Thời gian thực), NFR5 (Hỗ trợ Tablet) |
| **FR12** | Nhận dạng ký tự OCR | x | | | NFR2 (Async queue cho file scan nặng) |
Status: APPROVED

