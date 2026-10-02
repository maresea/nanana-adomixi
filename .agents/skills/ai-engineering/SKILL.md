---
name: ai-engineering-skill
description: Quy chuẩn kỹ thuật AI, Prompt Engineering hành chính (Nghị định 30/2020/NĐ-CP), kiến trúc Multi-Provider Adapter, cơ chế Fallback Heuristic, kiểm soát chống Hallucination và mô hình Human-in-the-loop cho Hệ thống Quản lý Công văn và Văn bản Nội bộ.
---

# Skill: Kỹ Thuật AI & Tích Hợp Mô Hình Ngôn Ngữ (AI Engineering & LLM Integration)

## 1. Mục tiêu và Phạm vi Kỹ thuật AI

Skill này quy định toàn bộ tiêu chuẩn kiến trúc kỹ thuật, thiết kế Prompt hành chính, xử lý mô hình ngôn ngữ lớn (LLM) và cơ chế vận hành an toàn cho đề tài:
> **"Hệ thống quản lý công văn và văn bản nội bộ có tích hợp AI"**

### Nguyên tắc cốt lõi (Bám sát `role.md`):
- **Phục vụ đúng 4 chức năng AI cốt lõi**:
  - `FR7`: Bóc tách thông tin công văn (Metadata Extraction).
  - `FR8`: Tóm tắt nội dung văn bản (Document Summarization).
  - `FR9`: Gợi ý phân loại thể loại & mức độ ưu tiên (Classification & Urgency).
  - `FR10`: Sinh dự thảo phản hồi theo thể thức hành chính (Draft Generation).
- **Chống Over-engineering**:
  - **Không** sử dụng Vector Database hay RAG phức tạp trong phạm vi dự án môn học (RAG chỉ là hướng mở rộng tương lai).
  - Sử dụng LLM trực tiếp qua Context Injection kết hợp Fallback Heuristic cục bộ.
- **Nguyên tắc Human-in-the-loop (Con người làm chủ)**:
  - AI chỉ đóng vai trò **Trợ lý đề xuất (Assistant / Suggester)**, không bao giờ tự động ban hành hay quyết định thay con người.
  - Người dùng luôn có quyền đối soát, chỉnh sửa và xác nhận trước khi lưu vào CSDL.
- **Chống Bịa thông tin (Anti-Hallucination)**:
  - Tuyệt đối chỉ xử lý dựa trên dữ liệu văn bản được cung cấp. Nếu thiếu thông tin, AI phải thông báo rõ thay vì tự suy đoán số liệu, kinh phí hay thẩm quyền.

---

## 2. Kiến trúc Module AI (AI Architecture & Design Patterns)

Hệ thống triển khai theo mô hình **Adapter Pattern** kết hợp **Resilient Fallback Mechanism** nhằm đảm bảo tính linh hoạt và độ sẵn sàng 100%:

```
[Client / UI]
     │ (Gửi văn bản / Tệp đính kèm)
     ▼
[AI Router (FastAPI)] ──► Validate Request (Chặn chuỗi rỗng / File hỏng)
     │
     ▼
[AIService (Adapter Pattern)]
     ├── Provider = "gemini"  ──► Google Gemini API (1.5 Flash)
     ├── Provider = "openai"  ──► OpenAI API (GPT-3.5 / GPT-4o-mini)
     ├── Provider = "ollama"  ──► Local LLM (Qwen / PhoGPT)
     │         │
     │         └──► [Lỗi mạng / Quota / Không có key]
     │                       │
     │                       ▼
     └── Provider = "mock"    ──► Smart Heuristic Engine (Cục bộ, 0s delay)
                                       │
     ┌─────────────────────────────────┴─────────────────────────────────┐
     ▼                                                                   ▼
[Structured Response (DTO)]                                    [AITaskLog (Audit DB)]
(MetadataDTO / ClassificationDTO / Draft)                      (Lưu prompt, response, latency_ms)
```

### 2.1. Đa nhà cung cấp (Multi-Provider Support)
Cấu hình linh hoạt qua biến môi trường trong file `.env` ([config.py](file:///d:/nanana-adomixi/backend/app/core/config.py)):
- `AI_PROVIDER`: Lựa chọn `mock`, `gemini`, `openai`, hoặc `ollama`.
- `GEMINI_API_KEY`: Khóa API Google AI Studio.
- `OPENAI_API_KEY`: Khóa API OpenAI.
- `OLLAMA_BASE_URL`: Địa chỉ máy chủ AI cục bộ (ví dụ: `http://localhost:11434`).

### 2.2. Cơ chế Tự động Chuyển mạch Dự phòng (Smart Heuristic Fallback)
Khi chạy demo trước hội đồng chấm thi, nếu gặp sự cố mất mạng Internet, API Key hết hạn ngạch (Quota 429) hoặc sai khóa (403):
- Hệ thống **tuyệt đối không quăng Exception 500** ra giao diện.
- `AIService` bắt lỗi và tự động chuyển ngay sang **Mock Heuristic Engine**:
  - Dùng Regex bóc tách số hiệu, ngày tháng (`DD/MM/YYYY`, `Ngày DD tháng MM năm YYYY`), cơ quan ban hành.
  - Phân tích từ khóa chuyên môn (ngân sách, nhân sự, số hóa, khẩn, hỏa tốc) để đưa ra phân loại và độ khẩn chính xác.
  - Sinh dự thảo mẫu đúng chuẩn thể thức hành chính với độ trễ siêu tốc (< 100ms).

### 2.3. Nhật ký Kiểm toán AI (`ai_task_logs`)
Mọi yêu cầu xử lý AI đều được lưu vết vào bảng CSDL phục vụ đo lường và hậu kiểm:
- `task_type`: `EXTRACT`, `SUMMARIZE`, `CLASSIFY`, `DRAFT`.
- `prompt_input`: 500 ký tự đầu của văn bản đầu vào.
- `raw_response`: Nội dung thô mô hình trả về.
- `latency_ms`: Thời gian xử lý (mili-giây).
- `created_at`: Mốc thời gian thực hiện.

---

## 3. Quy Chuẩn Prompt Engineering Hành Chính Việt Nam

Mọi Prompt phải được thiết kế bám sát **Nghị định 30/2020/NĐ-CP** về công tác văn thư và thể thức văn bản hành chính nhà nước.

### 3.1. Bóc tách Thông tin Công văn (`FR7 - Metadata Extraction`)
* **Mục tiêu**: Bóc tách Số/Ký hiệu, Ngày ban hành, Cơ quan ban hành, Trích yếu và Độ tin cậy.
* **System Prompt Chuẩn**:
  ```text
  Bạn là trợ lý trích xuất văn bản hành chính Việt Nam tuân thủ Nghị định 30/2020/NĐ-CP.
  Nhiệm vụ: Phân tích nội dung công văn được cung cấp và trích xuất các trường dữ liệu quan trọng.
  Chỉ trích xuất dựa trên thông tin thực tế có trong văn bản, tuyệt đối không tự suy đoán.
  
  Trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown block ```json) với cấu trúc sau:
  {
    "document_number": "Số/Ký hiệu (ví dụ: 125/UBND-VX)",
    "issued_date": "YYYY-MM-DD (nếu không rõ ghi null)",
    "sender_org": "Tên cơ quan hoặc phòng ban ban hành",
    "title": "Trích yếu nội dung (V/v)",
    "confidence_score": 0.95
  }
  ```

### 3.2. Tóm tắt Nội dung Công văn (`FR8 - Summarization`)
* **Mục tiêu**: Giúp Lãnh đạo nắm bắt trọn vẹn văn bản 5–10 trang chỉ trong 10–15 giây đọc.
* **System Prompt Chuẩn**:
  ```text
  Bạn là trợ lý xử lý công văn và văn bản hành chính cho Lãnh đạo cơ quan.
  Nhiệm vụ: Đọc và tóm tắt văn bản thành 3-4 ý chính cô đọng, giữ đúng văn phong hành chính trang trọng.
  
  Cấu trúc tóm tắt bắt buộc:
  1. Căn cứ & Mục đích: Nêu lý do ban hành hoặc mục tiêu chính của văn bản.
  2. Nội dung trọng tâm: Tóm tắt 1-2 nhiệm vụ hoặc nội dung cốt lõi nhất.
  3. Yêu cầu & Trách nhiệm: Các đơn vị cần phối hợp hoặc thực hiện những công việc gì.
  4. Thời hạn hoàn thành: Mốc thời gian hoặc hạn chót báo cáo (nếu có).
  
  Quy tắc an toàn: Tuyệt đối không bịa số liệu, kinh phí hoặc thời hạn nếu trong văn bản không đề cập.
  ```

### 3.3. Gợi ý Phân loại & Mức độ Khẩn (`FR9 - Classification & Urgency`)
* **Mục tiêu**: Hỗ trợ Văn thư phân loại hồ sơ vào đúng danh mục nghiệp vụ và đánh giá độ ưu tiên.
* **System Prompt Chuẩn**:
  ```text
  Bạn là trợ lý phân loại văn bản hành chính.
  Nhiệm vụ: Phân tích nội dung công văn, đề xuất thể loại văn bản phù hợp và mức độ ưu tiên xử lý.
  
  Quy chuẩn danh mục thể loại (category):
  - "Chỉ đạo điều hành": Văn bản chỉ đạo, giao nhiệm vụ chung của cấp trên.
  - "Kế hoạch & Triển khai": Đề án, chương trình công tác, kế hoạch thực hiện.
  - "Tài chính - Kế toán": Dự toán, quyết toán, cấp phát ngân sách, mua sắm tài sản, tờ trình kinh phí.
  - "Tổ chức cán bộ": Bổ nhiệm, điều động, khen thưởng, kỷ luật, quy hoạch nhân sự.
  - "Công nghệ thông tin": Số hóa, chuyển đổi số, an toàn thông tin, phần mềm, cơ sở dữ liệu.
  
  Quy chuẩn mức độ ưu tiên (urgency):
  - "VERY_URGENT": Khi văn bản có dấu "HỎA TỐC", "THƯỢNG KHẨN" hoặc yêu cầu xử lý trong ngày.
  - "URGENT": Khi văn bản có dấu "KHẨN", "GẤP" hoặc yêu cầu xử lý trong 24-48 giờ.
  - "NORMAL": Các văn bản thông thường.
  
  Trả về DUY NHẤT một chuỗi JSON hợp lệ:
  {
    "category": "Tên thể loại đề xuất",
    "urgency": "NORMAL | URGENT | VERY_URGENT",
    "reasoning": "Giải thích ngắn gọn căn cứ phân loại dựa trên từ khóa trong văn bản"
  }
  ```

### 3.4. Soạn thảo Dự thảo Phản hồi (`FR10 - Draft Generation`)
* **Mục tiêu**: Giúp Chuyên viên nhanh chóng tạo khung văn bản báo cáo/phúc đáp trình Lãnh đạo duyệt.
* **System Prompt Chuẩn**:
  ```text
  Bạn là trợ lý soạn thảo văn bản hành chính nhà nước.
  Nhiệm vụ: Dựa vào nội dung văn bản gốc và ý kiến chỉ đạo của Lãnh đạo, hãy soạn thảo dự thảo văn bản phúc đáp hoàn chỉnh.
  
  Yêu cầu thể thức bắt buộc (Nghị định 30/2020/NĐ-CP):
  - Quốc hiệu & Tiêu ngữ: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc.
  - Kính gửi: Cơ quan gửi văn bản gốc hoặc đơn vị chỉ đạo liên quan.
  - Căn cứ: Căn cứ vào nội dung văn bản gốc số... ngày...
  - Nội dung phản hồi: Trình bày các điểm đã triển khai hoặc phương án giải quyết bám sát ý kiến chỉ đạo.
  - Nơi nhận: Nơi nhận theo quy định (Như trên, Lưu VT, Bộ phận chuyên môn).
  
  Nguyên tắc: Văn phong trang trọng, chuẩn mực hành chính; không tự bịa thêm thông tin ngoài chỉ đạo.
  ```

---

## 4. Kiểm Soát An Toàn & Chống Bịa Thông Tin (Anti-Hallucination Guardrails)

Trong môi trường văn thư hành chính, một số liệu sai lệch về ngày tháng hoặc kinh phí có thể dẫn đến hậu quả pháp lý nghiêm trọng. Do đó, hệ thống áp dụng **4 tầng rào chắn an toàn (Guardrails)**:

| Tầng rào chắn | Cơ chế kỹ thuật | Tác dụng bảo vệ |
| :--- | :--- | :--- |
| **Tầng 1: Validate Đầu vào** | Chặn chuỗi rỗng, khoảng trắng hoặc độ dài < 10 ký tự bằng mã lỗi `HTTP 400 Bad Request`. | Ngăn chặn việc gọi LLM vô nghĩa làm lãng phí token và gây hallucination. |
| **Tầng 2: Giới hạn Ngữ cảnh (Grounding Constraint)** | Trong mọi System Prompt, ép chặt điều kiện: *"Chỉ sử dụng dữ liệu được cung cấp, nếu không có phải nêu rõ 'Văn bản không đề cập'"*. | Ngăn chặn mô hình tự sáng tác ra ngày tháng, định mức kinh phí hoặc căn cứ pháp luật không có thật. |
| **Tầng 3: Làm sạch Đầu ra (JSON Sanitization)** | Sử dụng Regex loại bỏ các markdown code block (```json ... ```) và xác thực chặt chẽ qua schema Pydantic. | Đảm bảo kiểu dữ liệu luôn đúng chuẩn DTO, không làm sập giao diện người dùng. |
| **Tầng 4: Bảo vệ Dữ liệu Nhạy cảm** | Tuyệt đối không lưu khóa API trong mã nguồn; sử dụng biến môi trường `.env`; không gửi các thông tin bí mật nhà nước độ Mật/Tuyệt mật lên API đám mây công cộng. | Tuân thủ tiêu chuẩn an toàn thông tin cơ quan nhà nước theo NFR1. |

---

## 5. Mô hình Tương Tác Human-in-the-Loop (HITL Workflow)

Toàn bộ trải nghiệm người dùng với AI phải tuân thủ triệt để quy trình 2 bước: **Gợi ý ➔ Xác nhận**:

```
[Văn bản gốc] ──► [AI phân tích] ──► [Màn hình Xem trước (Preview Box)]
                                            │
                                            ├── [Người dùng kiểm tra mắt]
                                            ├── [Sửa trực tiếp các trường nếu AI nhận diện chưa chuẩn]
                                            │
                                            ▼
                               [Bấm nút: Áp dụng & Lưu vào CSDL]
```

### Nguyên tắc bất di bất dịch:
1. **Không tự động ghi đè**: Kết quả AI sinh ra chỉ điền vào form tạm, không tự động `commit` vào database nếu chưa có thao tác click chuột của người dùng.
2. **Minh bạch lý do (Explainability)**: AI phải trả về trường `reasoning` (lý do gợi ý) để người dùng hiểu tại sao lại xếp văn bản vào nhóm đó.
3. **Dự thảo phải có trạng thái duyệt**: Văn bản do AI soạn thảo mặc định có cờ `is_approved = false`, chỉ khi Lãnh đạo bấm *"Phê duyệt"* thì mới có giá trị ban hành.

---

## 6. Tiêu Chuẩn Đánh Giá & Đo Lường Chất Lượng AI (AI Evaluation Benchmark)

Khi đưa vào báo cáo nghiệm thu môn học hoặc slide thuyết trình, sử dụng bộ chỉ số sau để chứng minh chất lượng AI:

### 6.1. Bóc tách Metadata (FR7)
- **Độ chính xác Số hiệu (Accuracy)**: $\ge 95\%$ trên các mẫu công văn có số hiệu chuẩn.
- **Độ chính xác Ngày ban hành**: $\ge 98\%$ trên cả 3 định dạng (`Ngày DD tháng MM năm YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD`).
- **Độ chính xác Cơ quan ban hành**: $\ge 90\%$ nhờ danh mục từ khóa nhận diện cơ quan nhà nước.

### 6.2. Tóm tắt Văn bản (FR8)
- **Tỷ lệ nén nội dung (Compression Ratio)**: Giảm từ **70% - 85%** độ dài văn bản gốc.
- **Độ phủ ý chính (Coverage)**: Đảm bảo đầy đủ 4 ý: Mục đích, Nội dung chính, Nhiệm vụ phối hợp, Thời hạn.

### 6.3. Phân loại & Độ khẩn (FR9)
- Phân biệt chính xác **100%** giữa `VERY_URGENT` (Hỏa tốc, Thượng khẩn), `URGENT` (Khẩn, Gấp) và `NORMAL`.
- Tỷ lệ khớp danh mục nghiệp vụ: $\ge 88\%$ trên tập dữ liệu kiểm thử thực tế.

---

## 7. Hướng Dẫn Kiểm Thử AI (Pytest Verification)

Kiểm thử module AI được tự động hóa hoàn toàn trong tệp [backend/tests/test_ai.py](file:///d:/nanana-adomixi/backend/tests/test_ai.py):

```bash
# Chạy toàn bộ test suite AI với báo cáo chi tiết
cd backend
py -m pytest tests/test_ai.py -v
```

Bao gồm các ca kiểm thử:
- `test_ai_extract_metadata`: Kiểm tra bóc tách số hiệu, ngày, cơ quan chuẩn.
- `test_ai_extract_metadata_alternative_date_and_org`: Kiểm tra định dạng ngày gạch chéo `DD/MM/YYYY` và cơ quan Trung ương.
- `test_ai_summarize_document`: Kiểm tra cấu trúc tóm tắt 3-4 ý hành chính.
- `test_ai_suggest_classification`: Kiểm tra nhận diện cấp độ hỏa tốc/khẩn và danh mục tài chính/chỉ đạo.
- `test_ai_generate_draft`: Kiểm tra dự thảo đúng thể thức Kính gửi, Căn cứ.
- `test_ai_parse_file_text`: Kiểm tra trích xuất text thật từ tệp tải lên.
- `test_ai_anti_hallucination_empty_text`: Kiểm tra chặn văn bản rỗng, chống bịa thông tin (bắt buộc lỗi 400).
