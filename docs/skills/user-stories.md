# TÀI LIỆU DANH SÁCH USER STORIES (AGILE BACKLOG)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI

---

## 1. TỔNG QUAN TÀI LIỆU
Tài liệu này chi tiết hóa toàn bộ các kịch bản người dùng (User Stories) dựa trên tài liệu khảo sát thực tế và phân tích yêu cầu tại `docs/requirements.md`. Các User Stories được phân chia theo 3 vai trò chính (**Văn thư**, **Lãnh đạo**, **Chuyên viên**) cùng các yêu cầu nền tảng của **Hệ thống**, áp dụng mô hình chuẩn:
> **Là một** [Vai trò], **Tôi muốn** [Hành động / Tính năng], **Để** [Giá trị mang lại].

Mỗi User Story đi kèm tiêu chí chấp nhận (**Acceptance Criteria - Gherkin format**), độ ưu tiên theo chuẩn **MoSCoW** (Must have, Should have, Could have) và mã liên kết với yêu cầu chức năng (**FR**) / phi chức năng (**NFR**).

---

## 2. USER STORIES CHO VAI TRÒ VĂN THƯ (CLERK)

### US-VT01: Tiếp nhận và tải lên tệp công văn đa định dạng
- **Narrative**: Là một **Văn thư**, tôi muốn tải lên hệ thống các tệp công văn đến (PDF điện tử, file Word DOCX hoặc ảnh chụp/scan JPG, PNG), để lưu trữ số hóa và bắt đầu quy trình xử lý.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR1, FR2 | NFR1, NFR4
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Văn thư đã đăng nhập vào hệ thống và mở giao diện "Tiếp nhận công văn đến".
  - *When*: Văn thư kéo thả hoặc chọn tệp (PDF, DOCX, JPG, PNG) dung lượng tối đa 50MB.
  - *Then*: Hệ thống kiểm tra định dạng hợp lệ, tải file lên kho lưu trữ bảo mật nội bộ và hiển thị bản xem trước (preview) của tài liệu.

---

### US-VT02: Nhận dạng ký tự quang học (OCR) cho tệp scan/ảnh chụp
- **Narrative**: Là một **Văn thư**, tôi muốn hệ thống tự động OCR chuyển đổi các bản scan PDF hoặc ảnh chụp (kể cả ảnh xô lệch, thiếu sáng) thành văn bản số (plain text), để cung cấp dữ liệu đầu vào cho AI bóc tách thông tin.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR12 | NFR2, NFR4
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Văn thư tải lên tệp văn bản scan hoặc ảnh chụp (chiếm 20-30% lưu lượng).
  - *When*: Hệ thống phát hiện tệp dạng hình ảnh/scan và kích hoạt tiến trình OCR ngầm.
  - *Then*:
    - Tiến trình xử lý chạy dưới nền (Background Worker), giao diện hiển thị trạng thái "Đang xử lý OCR" và không làm đơ giao diện.
    - Kết quả văn bản thô (text) được trích xuất đầy đủ, sẵn sàng cho bước phân tích AI tiếp theo.

---

### US-VT03: AI tự động trích xuất siêu dữ liệu (Metadata Extraction)
- **Narrative**: Là một **Văn thư**, tôi muốn AI tự động trích xuất các trường thông tin hành chính từ tệp công văn (số hiệu, ngày ban hành, cơ quan gửi, trích yếu) với độ chính xác tối thiểu 90-95%, để tôi không phải mở từng file gõ lại thủ công.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR7 | NFR2, NFR3, NFR6
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Tệp công văn đã được tải lên và sẵn sàng nội dung văn bản.
  - *When*: AI phân tích văn bản (chạy bất đồng bộ).
  - *Then*:
    - Các trường dữ liệu: Số ký hiệu, Ngày ban hành, Cơ quan ban hành, Trích yếu được tự động điền vào form tiếp nhận.
    - Độ chính xác bóc tách đạt từ 90% - 95%.
    - Hệ thống hiển thị giao diện đối chiếu song song (bên trái là file gốc, bên phải là form dữ liệu đã trích xuất) để Văn thư kiểm tra và chỉnh sửa nhanh bằng tay nếu cần trước khi lưu.

---

### US-VT04: AI gợi ý phân loại nhóm văn bản và mức độ ưu tiên
- **Narrative**: Là một **Văn thư**, tôi muốn AI phân tích nội dung văn bản để đề xuất nhóm phân loại và mức độ khẩn, để tôi phân loại nhanh chóng và định tuyến luân chuyển chính xác.
- **Mức độ ưu tiên**: `Should Have`
- **Liên kết**: FR9 | NFR2, NFR6
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: AI đã trích xuất xong nội dung trích yếu và phần thân công văn.
  - *When*: AI hoàn tất phân loại ngữ nghĩa.
  - *Then*:
    - Hệ thống đưa ra gợi ý: Nhóm văn bản (Tài chính, Tổ chức, Hành chính...), Độ khẩn (Hỏa tốc, Khẩn, Bình thường), Phòng ban phụ trách phù hợp.
    - Văn thư có thể nhấn một nút để chấp nhận gợi ý hoặc chọn lại theo ý muốn.

---

### US-VT05: Vào sổ công văn đến và trình Lãnh đạo
- **Narrative**: Là một **Văn thư**, tôi muốn xác nhận lưu thông tin công văn vào Sổ công văn đến và chuyển tiếp trình Lãnh đạo phê duyệt/giao việc, để quy trình xử lý được luân chuyển ngay lập tức.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR2, FR5 | NFR1
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Văn thư đã kiểm tra đầy đủ các thông tin bóc tách của công văn.
  - *When*: Văn thư nhấn "Lưu & Trình Lãnh đạo" và chọn Lãnh đạo phụ trách.
  - *Then*: Hệ thống sinh số đến tự động theo sổ, đổi trạng thái công văn thành "Chờ Lãnh đạo chỉ đạo" và gửi thông báo tức thời đến tài khoản của Lãnh đạo.

---

### US-VT06: Quản lý và vào sổ công văn đi
- **Narrative**: Là một **Văn thư**, tôi muốn tiếp nhận văn bản phản hồi đã được Lãnh đạo ký duyệt để cấp số phát hành chính thức, lưu trữ vào Sổ công văn đi và hoàn tất hồ sơ.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR2 | NFR1
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Công văn dự thảo phản hồi đã được Lãnh đạo phê duyệt ban hành.
  - *When*: Văn thư thực hiện thủ tục phát hành công văn đi.
  - *Then*: Hệ thống tự động cấp số đi chính thức theo quy tắc sổ văn bản, liên kết công văn đi với công văn đến gốc tương ứng và chuyển trạng thái công văn đến thành "Đã hoàn thành".

---

## 3. USER STORIES CHO VAI TRÒ LÃNH ĐẠO (LEADER)

### US-LD01: Xem danh sách công văn trình duyệt trên đa thiết bị
- **Narrative**: Là một **Lãnh đạo**, tôi muốn xem danh sách công văn do Văn thư trình trên máy tính (PC) hoặc Máy tính bảng (Tablet), để tôi có thể xử lý chỉ đạo công việc linh hoạt ngay cả khi đang đi họp hoặc công tác.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR2 | NFR5
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Lãnh đạo đăng nhập hệ thống bằng trình duyệt trên PC hoặc Tablet.
  - *When*: Mở danh sách công văn chờ chỉ đạo.
  - *Then*:
    - Giao diện hiển thị phản hồi mượt mà, tối ưu trên màn hình cảm ứng Tablet.
    - Các văn bản có độ khẩn cao (Hỏa tốc, Khẩn) được làm nổi bật ở vị trí ưu tiên.

---

### US-LD02: Đọc bản tóm tắt AI thông minh (3-5 ý cốt lõi)
- **Narrative**: Là một **Lãnh đạo**, tôi muốn đọc bản tóm tắt ngắn gọn gồm 3-5 ý cốt lõi (Mục đích, Yêu cầu trọng tâm, Hạn chót) do AI tạo, để nắm bắt nhanh yếu chỉ công văn dài hàng chục trang mà không mất thời gian đọc toàn văn.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR8 | NFR2, NFR3
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Công văn đến có độ dài lớn được trình lên Lãnh đạo.
  - *When*: Lãnh đạo mở chi tiết công văn.
  - *Then*:
    - Khung "Tóm tắt thông minh AI" hiển thị nổi bật ở đầu trang với đúng 3-5 gạch đầu dòng rõ ràng:
      1. Mục đích công văn.
      2. Yêu cầu/nhiệm vụ trọng tâm cần thực hiện.
      3. Thời hạn giải quyết (deadline).
    - Tóm tắt trung thực với nội dung gốc, không bịa đặt thông tin.

---

### US-LD03: Nhập chỉ đạo, phân công xử lý và ấn định thời hạn
- **Narrative**: Là một **Lãnh đạo**, tôi muốn gõ nhanh ý kiến chỉ đạo ngắn gọn, chọn người/phòng ban xử lý và thiết lập hạn chót (deadline) trực tiếp trên hệ thống, để giao việc ngay mà không cần họp giấy tờ.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR3 | NFR1
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Lãnh đạo đã đọc tóm tắt công văn và định hình hướng xử lý.
  - *When*: Lãnh đạo chọn Chuyên viên chủ trì (hoặc Phòng ban), chọn hạn xử lý (ngày/giờ) và nhập vài dòng chỉ đạo (ví dụ: "Đồng ý chủ trương, giao CV An soạn thảo phản hồi từ chối do trùng quy hoạch trước 30/7") rồi nhấn "Giao việc".
  - *Then*:
    - Hệ thống chuyển trạng thái công văn sang "Đã giao việc - Đang xử lý".
    - Thông báo giao việc được gửi ngay đến tài khoản của Chuyên viên được chỉ định.

---

### US-LD04: Phê duyệt công văn dự thảo phản hồi
- **Narrative**: Là một **Lãnh đạo**, tôi muốn xem xét, phê duyệt hoặc gửi lại yêu cầu chỉnh sửa đối với dự thảo công văn phản hồi do Chuyên viên trình, để bảo đảm văn bản phát hành chuẩn xác và đúng pháp lý.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR4 | NFR1
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Chuyên viên đã hoàn thành soạn thảo và trình dự thảo phản hồi.
  - *When*: Lãnh đạo xem dự thảo (đối chiếu với chỉ đạo ban đầu và công văn gốc).
  - *Then*:
    - Nếu đồng ý: Nhấn "Phê duyệt" -> Văn bản chuyển sang Văn thư để cấp số và phát hành.
    - Nếu cần sửa: Nhập ý kiến yêu cầu chỉnh sửa và nhấn "Trả lại" -> Chuyên viên nhận thông báo để hoàn thiện tiếp.

---

### US-LD05: Giám sát toàn diện tiến độ qua Dashboard thống kê
- **Narrative**: Là một **Lãnh đạo**, tôi muốn theo dõi bảng điều khiển (Dashboard) thời gian thực về tình trạng giải quyết công văn của từng cá nhân, phòng ban (đúng hạn, quá hạn, tồn đọng), để kịp thời đôn đốc và chỉ đạo điều hành.
- **Mức độ ưu tiên**: `Should Have`
- **Liên kết**: FR11 | NFR2, NFR5
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Lãnh đạo truy cập mục "Dashboard Giám sát".
  - *When*: Dashboard tải dữ liệu thống kê.
  - *Then*:
    - Hiển thị trực quan biểu đồ tổng lượng công văn theo kỳ (ngày, tháng).
    - Thống kê chi tiết tỷ lệ Đúng hạn, Sắp đến hạn, Quá hạn.
    - Bảng xếp hạng/danh sách công việc quá hạn theo từng phòng ban và chuyên viên cụ thể.

---

## 4. USER STORIES CHO VAI TRÒ CHUYÊN VIÊN (SPECIALIST)

### US-CV01: Tiếp nhận công văn được giao xử lý theo phân quyền
- **Narrative**: Là một **Chuyên viên**, tôi muốn nhận thông báo và danh sách các công văn được Lãnh đạo phân công cho tôi/phòng tôi, để bắt đầu thực hiện nhiệm vụ được giao.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR1, FR2 | NFR1
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Lãnh đạo vừa hoàn tất thao tác giao việc cho Chuyên viên.
  - *When*: Chuyên viên đăng nhập vào hệ thống.
  - *Then*:
    - Chuyên viên nhìn thấy thông báo công việc mới kèm hạn chót hoàn thành.
    - Chuyên viên chỉ truy cập được các văn bản thuộc phạm vi quyền hạn của mình, không truy cập được văn bản nội bộ của chuyên viên/phòng ban khác khi không được phân quyền.

---

### US-CV02: Xem chi tiết ngữ cảnh chỉ đạo và tóm tắt AI
- **Narrative**: Là một **Chuyên viên**, tôi muốn xem tóm tắt 3-5 ý chính của công văn gốc cùng chỉ đạo cụ thể của Lãnh đạo trên cùng một màn hình, để nhanh chóng nắm bắt bản chất nhiệm vụ cần xử lý.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR8 | NFR1, NFR5
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Chuyên viên mở chi tiết công văn được phân công.
  - *When*: Màn hình chi tiết hiển thị.
  - *Then*: Hiển thị rõ ràng: Tệp đính kèm gốc, Bản tóm tắt AI, Ý kiến chỉ đạo của Lãnh đạo, và Thời hạn xử lý còn lại (countdown hoặc ngày giờ rõ ràng).

---

### US-CV03: Tra cứu ngữ cảnh và hồ sơ văn bản quá khứ
- **Narrative**: Là một **Chuyên viên**, tôi muốn tra cứu nhanh các công văn, văn bản chỉ đạo cũ liên quan đến cùng chủ đề hoặc cùng cơ quan gửi, để có đầy đủ căn cứ pháp lý và ngữ cảnh khi soạn thảo phản hồi.
- **Mức độ ưu tiên**: `Should Have`
- **Liên kết**: FR5 | NFR1, NFR2
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Chuyên viên đang chuẩn bị soạn văn bản trả lời.
  - *When*: Chuyên viên tìm kiếm theo từ khóa, số hiệu văn bản liên quan trong quá khứ.
  - *Then*: Hệ thống trả về danh sách các văn bản có quyền xem liên quan trong thời gian dưới 1.5 giây.

---

### US-CV04: AI tự động sinh dự thảo công văn phản hồi (Draft Generation)
- **Narrative**: Là một **Chuyên viên**, tôi muốn AI tự động sinh dự thảo văn bản phản hồi dựa trên nội dung công văn gốc và ý kiến chỉ đạo của Lãnh đạo, tự động căn chỉnh đúng biểu mẫu thể thức hành chính, để tôi không phải mất hàng giờ "đắp thịt" soạn thảo từ đầu.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR10 | NFR2, NFR3, NFR6
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Chuyên viên đã mở công văn có ý kiến chỉ đạo của Lãnh đạo.
  - *When*: Chuyên viên nhấn nút "AI Sinh dự thảo phản hồi" (chọn mẫu văn bản: Công văn trả lời, Báo cáo, Tờ trình...).
  - *Then*:
    - Hệ thống gọi AI xử lý ngầm bất đồng bộ mà không đơ màn hình.
    - Văn bản dự thảo sinh ra đầy đủ các phần chuẩn thể thức hành chính nhà nước: Quốc hiệu, Tiêu ngữ, Căn cứ pháp lý, Kính gửi, Nội dung phúc đáp bám sát chỉ đạo, Nơi nhận...
    - Nội dung mạch lạc, lập luận chặt chẽ, ngôn phong hành chính chuẩn xác.

---

### US-CV05: Chỉnh sửa và trình Lãnh đạo phê duyệt dự thảo
- **Narrative**: Là một **Chuyên viên**, tôi muốn trực tiếp chỉnh sửa, bổ sung nội dung bản dự thảo do AI tạo ra và gửi trình lên Lãnh đạo phê duyệt, để đảm bảo tính chuẩn xác trước khi ban hành.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR4, FR10 | NFR1
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Bản dự thảo AI đã được hiển thị trên trình soạn thảo văn bản (Rich Text Editor).
  - *When*: Chuyên viên rà soát, tinh chỉnh các câu chữ và nhấn nút "Trình Lãnh đạo".
  - *Then*:
    - Văn bản dự thảo được lưu trữ thành phiên bản hoàn thiện.
    - Trạng thái công việc chuyển sang "Đã trình dự thảo - Chờ Lãnh đạo duyệt".
    - Lãnh đạo nhận được thông báo để vào kiểm tra và phê duyệt.

---

### US-CV06: Nhận cảnh báo và nhắc nhở hạn xử lý tự động
- **Narrative**: Là một **Chuyên viên**, tôi muốn hệ thống tự động thông báo nhắc nhở khi công văn sắp đến hạn hoặc quá hạn xử lý, để tôi không bị quên việc hoặc sót việc như khi quản lý thủ công bằng Excel.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR6 | NFR2
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Công văn được giao có thiết lập hạn xử lý.
  - *When*:
    - Thời gian đến hạn còn 24 giờ hoặc còn 4 giờ (sắp đến hạn).
    - Hoặc thời gian vượt quá hạn xử lý mà trạng thái chưa hoàn thành (quá hạn).
  - *Then*: Hệ thống tự động gửi thông báo nổi (badge, notification) trên hệ thống đến Chuyên viên (và Lãnh đạo đối với công văn quá hạn).

---

## 5. USER STORIES CHO HỆ THỐNG & NỀN TẢNG (SYSTEM & NFR)

### US-SYS01: Xử lý tác vụ AI & OCR bất đồng bộ (Non-blocking Queue)
- **Narrative**: Là một **Người dùng hệ thống** (Văn thư/Chuyên viên/Lãnh đạo), tôi muốn tất cả các tác vụ AI và OCR chạy ngầm bất đồng bộ, để giao diện không bị treo đơ và tôi vẫn làm việc bình thường trong lúc chờ kết quả.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR7, FR8, FR10, FR12 | NFR2
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Người dùng kích hoạt tác vụ nặng (tải file scan 20 trang, chạy OCR, gọi AI tóm tắt hoặc sinh dự thảo).
  - *When*: Tác vụ được gửi đi xử lý.
  - *Then*:
    - Hệ thống phản hồi ngay cho giao diện (< 500ms) kèm Job ID xử lý nền.
    - Giao diện người dùng không bị khóa (non-blocking), người dùng thoải mái chuyển tab, nhập liệu văn bản khác.
    - Khi tác vụ nền hoàn thành, hệ thống thông báo trạng thái cập nhật kết quả mà không cần tải lại toàn bộ trang (F5).

---

### US-SYS02: Kiểm soát bảo mật & Ngăn chặn lộ lọt dữ liệu nội bộ
- **Narrative**: Là một **Quản trị viên an toàn thông tin**, tôi muốn hệ thống kiểm soát chặt chẽ luồng dữ liệu AI, để tuyệt đối không gửi văn bản mật ra Internet và chỉ cho phép người có thẩm quyền xem tài liệu.
- **Mức độ ưu tiên**: `Must Have`
- **Liên kết**: FR1 | NFR1, NFR6, NFR8
- **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - *Given*: Hệ thống tiếp nhận văn bản có đánh dấu mức độ bảo mật nội bộ/mật.
  - *When*: Các tác vụ AI (OCR, Trích xuất, Tóm tắt, Sinh dự thảo) được kích hoạt.
  - *Then*:
    - Hệ thống định tuyến toàn bộ yêu cầu qua mô hình nội bộ (Local AI Runtime trên GPU cơ quan), không tạo bất kỳ kết nối nào ra bên ngoài Internet.
    - Chỉ cho phép chuyển tiếp sang Cloud AI (OpenAI, Gemini) khi cấu hình môi trường PoC được bật và tài liệu thuộc nhóm "Giả lập / Công khai".

---

## 6. MA TRẬN ÁNH XẠ USER STORIES & MỨC ĐỘ ƯU TIÊN (MoSCoW)

| Mã US | Tiêu đề User Story | Vai trò | Mã FR liên quan | Mã NFR liên quan | Mức độ ưu tiên (MoSCoW) |
|:---|:---|:---:|:---:|:---:|:---:|
| **US-VT01** | Tiếp nhận & Upload file đa định dạng | Văn thư | FR1, FR2 | NFR1, NFR4 | **Must Have** |
| **US-VT02** | Xử lý OCR bản scan/ảnh chụp | Văn thư | FR12 | NFR2, NFR4 | **Must Have** |
| **US-VT03** | AI Trích xuất siêu dữ liệu (90-95%) | Văn thư | FR7 | NFR2, NFR3, NFR6 | **Must Have** |
| **US-VT04** | AI Gợi ý phân loại & Độ khẩn | Văn thư | FR9 | NFR2, NFR6 | **Should Have** |
| **US-VT05** | Vào sổ công văn đến & Trình Lãnh đạo | Văn thư | FR2, FR5 | NFR1 | **Must Have** |
| **US-VT06** | Quản lý & Vào sổ công văn đi | Văn thư | FR2 | NFR1 | **Must Have** |
| **US-LD01** | Xem danh sách công văn trên PC/Tablet | Lãnh đạo | FR2 | NFR5 | **Must Have** |
| **US-LD02** | Đọc tóm tắt AI thông minh (3-5 ý) | Lãnh đạo | FR8 | NFR2, NFR3 | **Must Have** |
| **US-LD03** | Nhập chỉ đạo & Giao việc kèm Deadline | Lãnh đạo | FR3 | NFR1 | **Must Have** |
| **US-LD04** | Phê duyệt công văn dự thảo | Lãnh đạo | FR4 | NFR1 | **Must Have** |
| **US-LD05** | Giám sát tiến độ qua Dashboard | Lãnh đạo | FR11 | NFR2, NFR5 | **Should Have** |
| **US-CV01** | Nhận công văn theo phân quyền | Chuyên viên | FR1, FR2 | NFR1 | **Must Have** |
| **US-CV02** | Xem chi tiết tóm tắt & Ý kiến chỉ đạo | Chuyên viên | FR8 | NFR1, NFR5 | **Must Have** |
| **US-CV03** | Tra cứu ngữ cảnh & Hồ sơ cũ | Chuyên viên | FR5 | NFR1, NFR2 | **Should Have** |
| **US-CV04** | AI Sinh dự thảo phản hồi chuẩn thể thức | Chuyên viên | FR10 | NFR2, NFR3, NFR6 | **Must Have** |
| **US-CV05** | Chỉnh sửa dự thảo & Trình Lãnh đạo | Chuyên viên | FR4, FR10 | NFR1 | **Must Have** |
| **US-CV06** | Cảnh báo & Nhắc nhở hạn tự động | Chuyên viên | FR6 | NFR2 | **Must Have** |
| **US-SYS01**| Xử lý AI/OCR ngầm bất đồng bộ | Hệ thống | FR7,8,10,12 | NFR2 | **Must Have** |
| **US-SYS02**| Bảo mật dữ liệu & Cơ chế Local AI | Hệ thống | FR1 | NFR1, NFR6, NFR8 | **Must Have** |
Status: APPROVED

