---
name: testing-qa-skill
description: Quy chuẩn và quy trình kiểm thử phần mềm (Testing & QA), kiểm thử chức năng (FR1-FR12), kiểm thử chuyên sâu module AI (Hallucination, văn bản dài, thiếu metadata) và tự động hóa kiểm thử (Pytest) cho Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI.
---

# Skill: Kiểm thử Phần mềm & Đánh giá Năng lực AI (Software Testing & AI Evaluation)

## 1. Mục tiêu và Định hướng Kiểm thử

Skill này hướng dẫn quy chuẩn kiểm thử chất lượng phần mềm (QA/Testing) phục vụ giai đoạn **KT3 (Kiểm thử & Đánh giá)** và hoàn thành báo cáo kiểm thử cho đề tài môn học:
> **"Hệ thống quản lý công văn và văn bản nội bộ có tích hợp AI"**

### Nguyên tắc cốt lõi (Bám sát `role.md` Mục 15, 16 và các Skill đã thiết lập):
- **Bao phủ 12 FR và 3 Vai trò**: Mọi ca kiểm thử phải truy vết được về nguồn gốc yêu cầu (`requirements-engineering-skill`) và kiểm tra nghiêm ngặt quyền hạn của 3 vai trò (`CLERK`, `LEADER`, `SPECIALIST`).
- **Không chỉ kiểm tra trường hợp thành công**: Bắt buộc phải có các ca kiểm thử ngoại lệ (Negative cases), dữ liệu biên (Boundary cases) và cố tình vi phạm quyền truy cập (Security/Permission cases).
- **Kiểm thử AI chuyên sâu (KT3 Focus)**:
  - **Kiểm tra Hallucination (Bịa thông tin)**: Đảm bảo AI chỉ tóm tắt và bóc tách dựa trên văn bản được cung cấp, không tự suy đoán thông tin ngoài luồng.
  - **Kiểm thử văn bản dài**: Đánh giá khả năng xử lý khi tài liệu vượt quá độ dài thông thường mà không bị ngắt quãng hoặc mất ý chính.
  - **Kiểm thử văn bản thiếu metadata**: Đánh giá phản ứng của AI khi công văn không có số hiệu, thiếu ngày ban hành hoặc thiếu cơ quan gửi (phải thông báo không đủ dữ liệu thay vì tự bịa số).
- **Chống Over-engineering**: Sử dụng công cụ kiểm thử đơn giản, tiêu chuẩn trong hệ sinh thái Python: **Pytest** và **FastAPI TestClient** (sử dụng CSDL SQLite in-memory độc lập khi chạy test, không làm bẩn dữ liệu thật).

---

## 2. Chiến lược Kiểm thử 4 Cấp độ (Testing Strategy)

```
        ▲
       / \     Cấp độ 4: UAT / E2E Testing (Kiểm thử chấp nhận người dùng theo luồng 12 FR)
      /   \
     /     \   Cấp độ 3: AI Evaluation (Đánh giá độ chính xác, Hallucination, văn bản thiếu)
    /       \
   /         \ Cấp độ 2: API Integration Testing (Kiểm thử tích hợp Router, ORM, RBAC)
  /           \
 /             \ Cấp độ 1: Unit Testing (Kiểm thử logic hàm độc lập: Hash, Regex, Deadline)
-----------------
```

### 2.1. Cấp độ 1: Kiểm thử Đơn vị (Unit Testing)
- Kiểm thử các hàm độc lập không phụ thuộc mạng:
  - Hàm băm mật khẩu và đối soát `verify_password()`, `get_password_hash()`.
  - Hàm bóc tách chữ từ tệp PDF và DOCX của `FileService`.
  - Hàm tính toán hạn chót và phát hiện sắp đến hạn / quá hạn của nhiệm vụ.

### 2.2. Cấp độ 2: Kiểm thử Tích hợp API & Phân quyền (Integration & RBAC Testing)
- Sử dụng `fastapi.testclient.TestClient` để gửi request HTTP:
  - Kiểm tra luồng Đăng nhập (FR1): Trả về JWT token hợp lệ khi đúng tài khoản; trả về HTTP 401 khi sai mật khẩu.
  - Kiểm tra Phân quyền (RBAC):
    - Chuyên viên (`SPECIALIST`) cố tình gọi API tiếp nhận công văn (`POST /documents`) ➔ Bắt buộc trả về **HTTP 403 Forbidden**.
    - Văn thư (`CLERK`) cố tình gọi API phê duyệt dự thảo (`POST /drafts/{id}/approve`) ➔ Bắt buộc trả về **HTTP 403 Forbidden**.
    - Người dùng không có Token ➔ Bắt buộc trả về **HTTP 401 Unauthorized**.

### 2.3. Cấp độ 3: Đánh giá & Kiểm thử Năng lực AI (AI Evaluation - KT3)
Phải thực hiện 5 kịch bản kiểm thử bắt buộc đối với module AI:

| Mã Ca Test | Tình huống Kiểm thử AI | Mục tiêu & Dữ liệu đầu vào | Kỳ vọng của Hệ thống |
|:---:|---|---|---|
| **TC-AI-01** | **Văn bản hành chính chuẩn** *(Happy Path)* | Nhập công văn đầy đủ Quốc hiệu, Số hiệu, Ngày, Trích yếu, Nội dung 3 trang. | - Bóc tách đúng 100% số hiệu, ngày, cơ quan gửi.<br>- Tóm tắt đúng 3–5 ý chính cô đọng.<br>- Gợi ý độ khẩn chính xác. |
| **TC-AI-02** | **Văn bản dài vượt ngưỡng** *(Stress Test)* | Nhập báo cáo tổng kết 15–20 trang (khoảng 8.000 – 10.000 từ). | - Không bị lỗi timeout (xử lý bất đồng bộ theo NFR3).<br>- Giữ được trích yếu cốt lõi, không bỏ sót các mốc hạn xử lý quan trọng. |
| **TC-AI-03** | **Văn bản thiếu Metadata** *(Edge Case)* | Nhập một thông báo nội bộ không có số ký hiệu (`Số: ...`) và không có ngày ban hành. | - AI **không được tự bịa số hiệu**.<br>- Trả về trường `document_number = null` hoặc giữ nguyên và hạ điểm tin cậy `confidence_score < 0.9`. |
| **TC-AI-04** | **Kiểm tra chống Bịa thông tin** *(Anti-Hallucination)* | Nhập văn bản chỉ nói về *"tập huấn phòng cháy chữa cháy"*, sau đó hỏi về *"kinh phí dự toán"*. | - AI trả lời rõ ràng: *"Văn bản không cung cấp thông tin về kinh phí"*, **tuyệt đối không tự suy đoán số tiền**. |
| **TC-AI-05** | **Sinh dự thảo phản hồi** *(Human-in-the-loop)* | Cung cấp công văn yêu cầu báo cáo và ý kiến chỉ đạo ngắn của Lãnh đạo. | - Sinh văn bản khung theo thể thức hành chính (Kính gửi, Căn cứ, Báo cáo).<br>- Lưu trạng thái `is_approved = false` để chờ Lãnh đạo duyệt (không tự động gửi). |

### 2.4. Cấp độ 4: Kiểm thử Chấp nhận Liên hoàn (End-to-End User Flow)
Kiểm thử luồng khép kín xuyên suốt 3 vai trò trên giao diện Web:
1. **Bước 1 (Văn thư)**: Đăng nhập `vanthu` ➔ Tải file scan ➔ Kích hoạt AI bóc tách số hiệu & gợi ý phân loại ➔ Văn thư đối soát mắt và bấm *"Vào sổ công văn"*.
2. **Bước 2 (Lãnh đạo)**: Đăng nhập `lanhdao` ➔ Xem Dashboard thống kê ➔ Mở chi tiết công văn, đọc AI tóm tắt 3–5 ý trong 10 giây ➔ Bấm *"Phân công"* cho Chuyên viên Nam kèm hạn chót 48 giờ.
3. **Bước 3 (Chuyên viên)**: Đăng nhập `chuyenvien` ➔ Thấy chuông cảnh báo nhiệm vụ mới ➔ Bấm *"Soạn dự thảo (AI)"* ➔ AI sinh nội dung mẫu ➔ Chuyên viên chỉnh sửa bổ sung ➔ Bấm *"Trình Lãnh đạo phê duyệt"*.
4. **Bước 4 (Lãnh đạo duyệt)**: Lãnh đạo xem lại bản dự thảo của chuyên viên ➔ Bấm *"Phê duyệt ban hành"* ➔ Trạng thái công văn chuyển thành *"Hoàn tất"*.

---

## 3. Mẫu Phiếu Báo cáo Ca Kiểm thử (Test Case Template)

Mọi ca kiểm thử đưa vào báo cáo môn học `02_GenAI_SoftwareDevelopment_requirements-qa.docx` hoặc slide thuyết trình bắt buộc tuân theo bảng chuẩn:

```markdown
### TEST CASE: [MÃ_TEST_CASE] - [TÊN CHỨC NĂNG KIỂM THỬ]
- **Yêu cầu liên kết**: [FR1 - FR12] | [NFR1 - NFR9]
- **Loại kiểm thử**: [Functional | Security / RBAC | AI Accuracy | Boundary]
- **Mức độ ưu tiên**: [High | Medium | Low]
- **Người thực hiện**: [Văn thư | Lãnh đạo | Chuyên viên | Tester]
- **Tiền điều kiện (Pre-conditions)**: [Ví dụ: Đã có tài khoản vanthu trong CSDL, hệ thống Backend đang chạy]
- **Dữ liệu đầu vào (Test Data)**: [Cụ thể chuỗi text, file upload hoặc tham số API]

| Bước thực hiện | Thao tác (Action) | Kết quả mong đợi (Expected Result) | Kết quả thực tế (Actual Result) | Đánh giá (Pass/Fail) |
|:---:|---|---|---|:---:|
| 1 | Truy cập màn hình Đăng nhập | Hiển thị form đăng nhập đầy đủ các trường | Hiển thị đúng | PASS |
| 2 | Nhập tài khoản và mật khẩu | Hệ thống gửi request xác thực tới Backend | Gửi đúng API `/auth/login` | PASS |
| 3 | Kiểm tra phản hồi | Trả về Access Token JWT và chuyển đúng trang | Nhận token, chuyển đúng trang vai trò | PASS |

- **Kết luận**: [Đạt yêu cầu nghiệm thu / Cần điều chỉnh]
```

---

## 4. Cấu trúc và Mã Nguồn Kiểm thử Tự động (Pytest Suite)

Khung kiểm thử tự động đặt tại thư mục `backend/tests/`:

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Fixtures: In-memory DB, TestClient, Mock Auth Tokens
│   ├── test_auth.py            # FR1: Kiểm thử Đăng nhập, Sai mật khẩu, Token hết hạn
│   ├── test_documents.py       # FR2, FR5: Kiểm thử Tiếp nhận, Upload tệp, Tra cứu
│   ├── test_tasks.py           # FR3, FR4, FR6: Kiểm thử Phân công, Hạn xử lý, Duyệt dự thảo
│   ├── test_ai_accuracy.py     # FR7, FR8, FR9, FR10: Kiểm thử chuyên sâu AI & Hallucination
│   └── test_rbac_security.py   # NFR1: Kiểm thử bảo mật phân quyền 3 vai trò (Chống vượt quyền)
```

### 4.1. Mẫu cấu hình Test Fixture (`tests/conftest.py`)

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.models import Department, User, Document

# Sử dụng SQLite in-memory chuyên biệt cho Test (Không ảnh hưởng data.db thật)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Khởi tạo dữ liệu nền cho test
    dept = Department(id=1, code="VPCQ", name="Văn phòng Cơ quan")
    db.add(dept)
    db.commit()

    pw = get_password_hash("123456")
    u_clerk = User(id=1, username="vanthu", password_hash=pw, full_name="Văn Thư", email="vt@coquan.vn", role="CLERK", department_id=1, is_active=True)
    u_leader = User(id=2, username="lanhdao", password_hash=pw, full_name="Lãnh Đạo", email="ld@coquan.vn", role="LEADER", department_id=1, is_active=True)
    u_spec = User(id=3, username="chuyenvien", password_hash=pw, full_name="Chuyên Viên", email="cv@coquan.vn", role="SPECIALIST", department_id=1, is_active=True)
    db.add_all([u_clerk, u_leader, u_spec])
    db.commit()

    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def clerk_token():
    return create_access_token(subject=1, role="CLERK")

@pytest.fixture
def leader_token():
    return create_access_token(subject=2, role="LEADER")

@pytest.fixture
def specialist_token():
    return create_access_token(subject=3, role="SPECIALIST")
```

### 4.2. Mẫu Kiểm thử Bảo mật Phân quyền (`tests/test_rbac_security.py`)

```python
def test_clerk_cannot_approve_draft(client, clerk_token):
    """Văn thư không được phép duyệt dự thảo công văn (chỉ Lãnh đạo mới có quyền)."""
    headers = {"Authorization": f"Bearer {clerk_token}"}
    response = client.post("/api/v1/drafts/1/approve", json={"is_approved": True}, headers=headers)
    assert response.status_code == 403
    assert "Quyền truy cập bị từ chối" in response.json()["detail"]

def test_specialist_cannot_create_document(client, specialist_token):
    """Chuyên viên không được phép tiếp nhận vào sổ công văn (chỉ Văn thư mới có quyền)."""
    headers = {"Authorization": f"Bearer {specialist_token}"}
    payload = {
        "document_number": "99/TEST",
        "title": "Công văn test vượt quyền",
        "document_scope": "INTERNAL",
        "document_type": "INCOMING",
        "issued_date": "2026-03-25",
        "sender_org": "Test",
        "recipient_org": "Test"
    }
    response = client.post("/api/v1/documents", json=payload, headers=headers)
    assert response.status_code == 403
```

### 4.3. Mẫu Kiểm thử Module AI & Chống Bịa Thông tin (`tests/test_ai_accuracy.py`)

```python
def test_ai_anti_hallucination_missing_metadata(client, clerk_token):
    """Kiểm tra AI không tự bịa số ký hiệu khi văn bản không chứa thông tin này."""
    headers = {"Authorization": f"Bearer {clerk_token}"}
    text_without_number = "THÔNG BÁO NỘI BỘ\nNội dung: Họp giao ban toàn cơ quan vào sáng thứ Hai tuần tới."
    
    response = client.post("/api/v1/ai/extract-metadata", json={"document_text": text_without_number}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    # Nếu không tìm thấy số hiệu trong văn bản, không được tự tạo số giả mạo 125/UBND
    assert data["document_number"] is None or data["document_number"] == "" or data["confidence_score"] < 0.9

def test_ai_summarize_keeps_essential_points(client, leader_token):
    """Kiểm tra AI tóm tắt giữ được mục đích và thời hạn."""
    headers = {"Authorization": f"Bearer {leader_token}"}
    sample = "Yêu cầu các phòng ban hoàn thành việc rà soát an toàn thông tin trước ngày 30/03/2026."
    response = client.post("/api/v1/ai/summarize", json={"document_text": sample}, headers=headers)
    assert response.status_code == 200
    summary = response.json()["summary"]
    assert len(summary) > 10
    # Phải giữ được mốc thời gian hoặc từ khóa chính
    assert any(k in summary.lower() for k in ["30/03", "an toàn thông tin", "mục đích", "thời hạn"])
```

---

## 5. Checklist Tự Đánh giá Chất lượng Kiểm thử (QA Checklist)

Trước khi đóng gói báo cáo nghiệm thu kiểm thử (KT3):

- [ ] **Bao phủ 100% 12 FR**: Đã có ít nhất 1 ca kiểm thử thành công và 1 ca kiểm thử thất bại/ngoại lệ cho mỗi FR từ FR1 đến FR12.
- [ ] **Đã kiểm tra đủ 3 vai trò**: Đã kiểm tra phân quyền độc lập cho Văn thư, Lãnh đạo, Chuyên viên (đảm bảo không ai thao tác vượt thẩm quyền).
- [ ] **Đã thực hiện 5 ca kiểm thử AI (Mục 2.3)**: Văn bản chuẩn, văn bản dài, văn bản thiếu metadata, kiểm tra chống bịa thông tin và sinh dự thảo.
- [ ] **Kiểm thử xử lý tệp demo**: Tải lên thành công các tệp `.pdf`, `.docx` mẫu và trích xuất text rõ ràng.
- [ ] **Tự động hóa hoàn toàn**: Bộ kiểm thử `pytest` chạy độc lập với mã thoát `exit code 0` mà không phụ thuộc dữ liệu bên ngoài.
- [ ] **Khớp tài liệu SRS**: Mọi kết quả kiểm thử đều truy vết ngược lại được ma trận nghiệm thu trong `requirements-engineering-skill`.
