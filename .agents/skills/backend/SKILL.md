---
name: backend-development-skill
description: Quy chuẩn kiến trúc, lập trình Backend API (FastAPI/Python), tích hợp AI Service, ORM Database và phân quyền bảo mật cho Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI.
---

# Skill: Phát triển Backend API & Tích hợp AI (Backend Development & AI Integration)

## 1. Mục tiêu và Định hướng Kỹ thuật

Skill này hướng dẫn quy chuẩn lập trình Backend, thiết kế RESTful API, quản lý dữ liệu ORM và tích hợp các module AI cho đề tài môn học:
> **"Hệ thống quản lý công văn và văn bản nội bộ có tích hợp AI"**

### Nguyên tắc cốt lõi (Bám sát `role.md` và các Skill nền tảng):
- **Bám sát 12 FR & 3 Vai trò**: Mọi API endpoint phải phục vụ trực tiếp cho 12 Yêu cầu chức năng (`requirements-engineering-skill`) và được phân quyền chặt chẽ theo 3 vai trò: `CLERK` (Văn thư), `LEADER` (Lãnh đạo), `SPECIALIST` (Chuyên viên).
- **Chống Over-engineering**: 
  - Kiến trúc phân tầng đơn giản (Router ➔ Service ➔ Repository/Model).
  - Không sử dụng Microservices, Message Queue (RabbitMQ/Kafka), Celery, Vector Database hay RAG phức tạp.
  - Xử lý bất đồng bộ bằng `async/await` và `fastapi.BackgroundTasks` có sẵn của FastAPI.
- **Khớp 1:1 với OOD & CSDL**: Thực thể, trường dữ liệu, quan hệ khóa ngoại tuân thủ chính xác mô hình lớp (`ood-design-skill`) và 8 bảng quan hệ (`database-design-skill`).
- **Nguyên tắc Human-in-the-loop đối với AI**: AI chỉ đóng vai trò trợ lý; mọi kết quả AI trả về (trích xuất, tóm tắt, gợi ý, dự thảo) chỉ là gợi ý, lưu log vào `ai_task_logs` và bắt buộc phải qua sự xác nhận/phê duyệt của con người trước khi lưu chính thức.

---

## 2. Công nghệ và Thư viện Chuẩn (Tech Stack)

| Thành phần | Công nghệ lựa chọn | Lý do lựa chọn cho dự án môn học |
|---|---|---|
| **Ngôn ngữ & Runtime** | Python 3.10+ | Chuẩn công nghiệp cho AI/NLP, cú pháp trong sáng, dễ đọc mã nguồn khi báo cáo. |
| **Web Framework** | **FastAPI** | Hiệu năng cao (ASGI), hỗ trợ native `async/await`, tự động sinh tài liệu Swagger UI (`/docs`) để demo và chấm điểm. |
| **ORM & Database** | **SQLAlchemy 2.0** + **SQLite** (hoặc PostgreSQL) | SQLite mặc định không cần cài đặt server phức tạp, dễ đóng gói nộp bài; SQLAlchemy 2.0 type-hinting mạnh mẽ. |
| **Data Validation / DTO** | **Pydantic v2** | Xác thực dữ liệu đầu vào/ra tự động, chuẩn hóa dữ liệu theo đúng DTO trong OOD. |
| **Xác thực & Bảo mật** | **JWT (python-jose)** + **Passlib (bcrypt)** | Chuẩn Stateless Token, bảo mật mật khẩu an toàn theo NFR1. |
| **Xử lý Tệp (File)** | **pypdf**, **python-docx** | Trích xuất nội dung text thô từ tệp PDF và DOCX ở mức demo đơn giản. |
| **AI Integration** | **OpenAI SDK / Google GenAI / Ollama** | Tích hợp linh hoạt qua lớp bọc `AIService`, dễ dàng đổi mô hình mà không ảnh hưởng logic lõi (NFR7). |

---

## 3. Cấu trúc Thư mục Backend Chuẩn (Clean Layered Architecture)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Khởi tạo FastAPI app, CORS, Exception handlers, Routers
│   ├── core/                       # Cấu hình hệ thống & Bảo mật lõi
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic BaseSettings (SECRET_KEY, DB_URL, AI_KEY)
│   │   ├── database.py             # SQLAlchemy Engine, SessionLocal, Base
│   │   └── security.py             # Hash password, tạo & verify JWT token
│   ├── models/                     # 8 SQLAlchemy ORM Models (Ánh xạ từ database-design-skill)
│   │   ├── __init__.py
│   │   ├── user.py                 # Department, User
│   │   ├── document.py             # Document, Attachment
│   │   ├── task.py                 # TaskAssignment, DraftResponse
│   │   └── system.py               # Notification, AITaskLog
│   ├── schemas/                    # Pydantic Schemas (Request/Response DTOs)
│   │   ├── __init__.py
│   │   ├── auth.py                 # LoginRequest, TokenResponse, UserResponse
│   │   ├── document.py             # DocumentCreate, DocumentResponse, DocumentFilter
│   │   ├── task.py                 # TaskAssignCreate, TaskUpdateStatus, DraftCreate
│   │   ├── ai.py                   # MetadataDTO, ClassificationDTO, DraftRequest
│   │   └── statistics.py           # DashboardStatsResponse
│   ├── routers/                    # API Endpoints (Phân chia theo nghiệp vụ & FR)
│   │   ├── __init__.py
│   │   ├── auth.py                 # FR1: Đăng nhập, thông tin tài khoản
│   │   ├── documents.py            # FR2, FR5: Tiếp nhận, danh sách, chi tiết văn bản
│   │   ├── tasks.py                # FR3, FR4, FR6: Phân công, tiến độ, nhắc hạn
│   │   ├── drafts.py               # FR4, FR10: Soạn & duyệt dự thảo phản hồi
│   │   ├── statistics.py           # FR11: Báo cáo thống kê cho Lãnh đạo
│   │   └── ai.py                   # FR7, FR8, FR9, FR10: API gọi chức năng AI
│   ├── services/                   # Business Logic & Dịch vụ ngoài
│   │   ├── __init__.py
│   │   ├── document_service.py     # Logic nghiệp vụ công văn & tệp
│   │   ├── task_service.py         # Logic phân công, tính toán cảnh báo hạn
│   │   ├── ai_service.py           # Đóng gói Prompting & tích hợp LLM
│   │   └── file_service.py         # Trích xuất chữ từ PDF/DOCX
│   └── dependencies.py             # get_db, get_current_user, require_roles
├── uploads/                        # Thư mục lưu tệp văn bản demo cục bộ
├── requirements.txt                # Danh mục thư viện phụ thuộc
├── .env.example                    # Mẫu cấu hình biến môi trường
└── README.md                       # Hướng dẫn chạy backend cục bộ
```

---

## 4. Ma trận API Endpoints Ánh xạ 12 FR (RESTful API Matrix)

Tất cả các API đều có tiền tố `/api/v1` và yêu cầu Bearer Token (trừ endpoint login).

| Mã FR | Phương thức | Endpoint | Vai trò cho phép | Chức năng nghiệp vụ & Mô tả luồng |
|:---:|:---:|---|:---:|---|
| **FR1** | `POST` | `/api/v1/auth/login` | Công khai | Xác thực username/password ➔ Trả về Access Token JWT & Role. |
| **FR1** | `GET` | `/api/v1/auth/me` | Mọi vai trò | Lấy thông tin cá nhân và quyền của người dùng hiện tại. |
| **FR2** | `POST` | `/api/v1/documents` | `CLERK` | Tiếp nhận và vào sổ công văn mới kèm thông tin ban đầu. |
| **FR2** | `POST` | `/api/v1/documents/{id}/attachments` | `CLERK` | Tải lên tệp PDF/DOCX demo, kích hoạt trích xuất text thô. |
| **FR2** | `GET` | `/api/v1/documents/{id}` | Mọi vai trò | Xem chi tiết hồ sơ công văn, tệp đính kèm và lịch sử xử lý. |
| **FR3** | `POST` | `/api/v1/tasks/assign` | `LEADER` | Lãnh đạo phân công xử lý cho chuyên viên, thiết lập hạn (`deadline`). |
| **FR4** | `PATCH` | `/api/v1/tasks/{id}/status` | `SPECIALIST` | Chuyên viên cập nhật tiến độ (`ASSIGNED` ➔ `PROCESSING` ➔ `RESOLVED`). |
| **FR4** | `POST` | `/api/v1/drafts/{id}/submit` | `SPECIALIST` | Trình văn bản dự thảo lên Lãnh đạo xin phê duyệt. |
| **FR4** | `POST` | `/api/v1/drafts/{id}/approve` | `LEADER` | Lãnh đạo phê duyệt hoặc từ chối kèm ý kiến nhận xét (`approval_note`). |
| **FR5** | `GET` | `/api/v1/documents` | Mọi vai trò | Tra cứu, lọc văn bản theo số hiệu, ngày, đơn vị, trạng thái, phạm vi. |
| **FR6** | `GET` | `/api/v1/notifications/alerts` | Mọi vai trò | Lấy danh sách thông báo cảnh báo văn bản sắp đến hạn và quá hạn. |
| **FR7** | `POST` | `/api/v1/ai/extract-metadata` | `CLERK` | AI bóc tách: số ký hiệu, ngày ban hành, cơ quan gửi, trích yếu. |
| **FR8** | `POST` | `/api/v1/ai/summarize` | `LEADER`, `CLERK` | AI tóm tắt văn bản thành 3–5 ý chính cô đọng (kết quả lưu tạm). |
| **FR9** | `POST` | `/api/v1/ai/suggest-classification` | `CLERK` | AI phân tích nội dung để gợi ý thể loại và mức độ ưu tiên. |
| **FR10** | `POST` | `/api/v1/ai/generate-draft` | `SPECIALIST` | AI sinh nội dung dự thảo phản hồi theo mẫu hành chính từ chỉ đạo. |
| **FR11** | `GET` | `/api/v1/statistics/dashboard` | `LEADER` | Thống kê số lượng văn bản đến/đi, tỷ lệ đúng/quá hạn theo phòng ban. |
| **FR12** | `POST` | `/api/v1/documents/ocr` | `CLERK` | Chuyển đổi tệp ảnh scan sang text thô *(Tùy chọn Should-have)*. |

---

## 5. Quy chuẩn Tích hợp AI Service & Quản lý Prompt

### 5.1. Thiết kế Lớp `AIService` Độc lập (Loose Coupling)
Thực thi theo mẫu thiết kế Adapter/Strategy để dễ dàng chuyển đổi nhà cung cấp (OpenAI, Gemini, Local Ollama):

```python
# app/services/ai_service.py
import json
import time
from typing import Dict, Any
from app.schemas.ai import MetadataDTO, ClassificationDTO

class AIService:
    """Đóng gói toàn bộ logic gọi mô hình ngôn ngữ lớn (LLM)."""

    @staticmethod
    def _call_llm(system_prompt: str, user_content: str) -> str:
        """Hàm hạ tầng gọi API bên ngoài hoặc Local LLM có xử lý timeout/error."""
        # Triển khai gọi OpenAI / Gemini API hoặc Ollama local
        pass

    def extract_metadata(self, document_text: str) -> MetadataDTO:
        system_prompt = (
            "Bạn là trợ lý trích xuất văn bản hành chính Việt Nam. "
            "Chỉ trích xuất dựa trên nội dung được cung cấp, không bịa thông tin. "
            "Trả về định dạng JSON thuần túy gồm: document_number, issued_date, sender_org, title."
        )
        raw_res = self._call_llm(system_prompt, document_text)
        return MetadataDTO.model_validate_json(raw_res)

    def summarize_text(self, document_text: str) -> str:
        system_prompt = (
            "Bạn là trợ lý xử lý công văn và văn bản hành chính. "
            "Hãy tóm tắt văn bản thành 3-5 ý chính rõ ràng (mục đích, nội dung chính, yêu cầu, thời hạn). "
            "Giữ đúng văn phong hành chính, không tự suy đoán thông tin ngoài văn bản."
        )
        return self._call_llm(system_prompt, document_text)

    def suggest_classification(self, document_text: str) -> ClassificationDTO:
        system_prompt = (
            "Phân tích nội dung công văn và đề xuất thể loại văn bản (category) "
            "cùng mức độ ưu tiên (urgency: NORMAL, URGENT, VERY_URGENT). "
            "Trả về định dạng JSON thuần túy có giải thích ngắn gọn lý do."
        )
        raw_res = self._call_llm(system_prompt, document_text)
        return ClassificationDTO.model_validate_json(raw_res)

    def generate_draft(self, original_text: str, instruction: str) -> str:
        system_prompt = (
            "Bạn là trợ lý soạn thảo công văn hành chính nhà nước. "
            "Dựa vào văn bản gốc và ý kiến chỉ đạo của Lãnh đạo, hãy soạn thảo dự thảo công văn phản hồi "
            "đúng thể thức hành chính (Kính gửi, Căn cứ, Nội dung phản hồi, Nơi nhận). "
            "Tuyệt đối không tự bịa số liệu hay thông tin không có trong chỉ đạo."
        )
        user_content = f"VĂN BẢN GỐC:\n{original_text}\n\nÝ KIẾN CHỈ ĐẠO:\n{instruction}"
        return self._call_llm(system_prompt, user_content)
```

### 5.2. Ghi vết Kiểm toán AI (`ai_task_logs`)
Mọi yêu cầu gửi tới AI đều phải đo đếm thời gian phản hồi (`latency_ms`) và ghi nhận vào bảng `ai_task_logs` qua cơ chế bất đồng bộ để phục vụ đánh giá độ chính xác (NFR9) và tính minh bạch.

---

## 6. Cơ chế Phân quyền & Bảo mật API (Security & RBAC)

Sử dụng FastAPI Dependency Injection để kiểm tra vai trò tại từng endpoint:

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ hoặc đã hết hạn")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tài khoản không tồn tại hoặc đã bị khóa")
    return user

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Quyền truy cập bị từ chối. Chức năng chỉ dành cho: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
```

---

## 7. Checklist Kiểm tra Chất lượng Backend (Backend Quality Checklist)

Trước khi nghiệm thu hoặc tích hợp với Frontend, bắt buộc rà soát checklist:

- [ ] **Khớp 8 Bảng CSDL**: Đã ánh xạ chính xác 8 bảng SQLAlchemy từ `database-design-skill`, các khóa ngoại `ON DELETE CASCADE` đã thiết lập đúng.
- [ ] **Bao phủ 12 FR**: Đã tạo đủ các route phục vụ từ FR1 đến FR12, không thiếu sót bất kỳ nghiệp vụ nào.
- [ ] **Bảo vệ API Key**: Khóa bí mật (`OPENAI_API_KEY`, `JWT_SECRET`) được đọc qua file `.env`, tuyệt đối không hard-code vào git.
- [ ] **Phân quyền đúng 3 vai trò**: Các route nhạy cảm (tiếp nhận văn bản: chỉ `CLERK`, phân công & duyệt: chỉ `LEADER`, làm dự thảo: chỉ `SPECIALIST`) đã có guard `require_roles`.
- [ ] **Khả năng xử lý tệp demo**: Upload được file PDF/DOCX, trích xuất text mượt mà, lưu trữ cục bộ gọn gàng trong thư mục `uploads/`.
- [ ] **Không Over-engineering**: Không có thư viện dư thừa (không Celery, không Redis, không Docker-compose đa cụm phức tạp nếu chưa cần thiết).
