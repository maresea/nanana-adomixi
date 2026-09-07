# HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI (BACKEND SERVICE)

## 1. GIỚI THIỆU
Dịch vụ Backend được xây dựng trên nền tảng **FastAPI**, tuân thủ nghiêm ngặt các yêu cầu tại `docs/requirements.md`, `docs/architecture.md` và `docs/database-design.md`:
- **Phân quyền 3 vai trò (RBAC + ABAC)**: Văn thư (`CLERK`), Lãnh đạo (`LEADER`), Chuyên viên (`SPECIALIST`).
- **Quản lý công văn & Phân công**: CRUD công văn đến/đi, Lãnh đạo giao việc kèm hạn xử lý, Chuyên viên cập nhật trạng thái và nộp dự thảo, Lãnh đạo phê duyệt.
- **Xử lý AI Bất đồng bộ (Adapter Pattern)**: Tóm tắt 3-5 ý cốt lõi, gợi ý phân loại và sinh dự thảo phản hồi chuẩn thể thức hành chính Việt Nam. Tuyệt đối không hard-code API Key.

---

## 2. CẤU TRÚC THƯ MỤC
```
backend/
├── app/
│   ├── core/
│   │   ├── database.py       # Kết nối SQLAlchemy, engine, get_db
│   │   ├── security.py       # Băm mật khẩu, mã hóa và giải mã JWT
│   │   └── permissions.py    # Middleware/Dependency RBAC & ABAC
│   ├── models/               # SQLAlchemy Models (User, Document, TaskAssignment, DraftResponse, AITaskLog)
│   ├── schemas/              # Pydantic Schemas xác thực dữ liệu đầu vào/ra
│   ├── services/
│   │   └── ai_service.py     # AI Service theo Adapter Pattern (Local AI vs Cloud AI, Administrative Prompt)
│   ├── routers/
│   │   ├── auth.py           # Đăng nhập, cấp Token JWT, /me
│   │   ├── documents.py      # CRUD công văn đến/đi, tải tệp, kiểm soát ABAC
│   │   ├── tasks.py          # Phân công, cập nhật tiến độ, nộp & duyệt dự thảo
│   │   └── ai.py             # Tóm tắt 3-5 ý, phân loại, sinh dự thảo, tác vụ chạy nền (BackgroundTasks)
│   ├── config.py             # Đọc biến môi trường tập trung
│   └── main.py               # Khởi tạo ứng dụng FastAPI, CORS và nạp router
├── tests/
│   └── test_api.py           # Bộ kiểm thử tự động toàn diện
├── .env.example              # Mẫu biến môi trường
└── requirements.txt          # Danh mục thư viện phụ thuộc
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY

### Bước 1: Kích hoạt môi trường ảo (Virtual Environment)
```bash
# Trên Windows PowerShell
.\venv\Scripts\Activate.ps1
```

### Bước 2: Cài đặt các gói phụ thuộc
```bash
pip install -r backend/requirements.txt
```

### Bước 3: Cấu hình biến môi trường
Sao chép tệp `.env.example` thành `.env`:
```bash
cp backend/.env.example backend/.env
```
*(Tùy chỉnh `GEMINI_API_KEY`, `LOCAL_AI_BASE_URL` hoặc `DATABASE_URL` khi cần thiết. Tuyệt đối không lưu khóa API trong Git repository).*

### Bước 4: Khởi chạy máy chủ Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Swagger UI (Interactive API Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 4. TÀI KHOẢN MẪU KHỞI TẠO SẴN (SEED USERS)
Hệ thống tự động khởi tạo các tài khoản mẫu khi máy chủ khởi động:
- **Văn thư**: `vanthu_mai` / Mật khẩu: `Password@123` (Vai trò `CLERK`)
- **Lãnh đạo**: `lanhdao_hai` / Mật khẩu: `Password@123` (Vai trò `LEADER`)
- **Chuyên viên Tài chính**: `chuyenvien_nam` / Mật khẩu: `Password@123` (Vai trò `SPECIALIST`)
- **Chuyên viên Đô thị**: `chuyenvien_an` / Mật khẩu: `Password@123` (Vai trò `SPECIALIST`)
- **Quản trị viên**: `admin` / Mật khẩu: `Password@123` (Vai trò `ADMIN`)

---

## 5. KIỂM THỬ TỰ ĐỘNG VÀ BÁO CÁO CHẤT LƯỢNG
- Chạy bộ kiểm thử tự động toàn diện:
  ```bash
  pytest backend/tests/test_api.py -v
  ```
- **Báo cáo kiểm thử chi tiết**: Xem tại [docs/test-report.md](../docs/test-report.md)
- **Báo cáo đánh giá mã nguồn**: Xem tại [docs/code-review.md](../docs/code-review.md)
- **Báo cáo an toàn bảo mật**: Xem tại [docs/security-review.md](../docs/security-review.md)
- **Hướng dẫn sử dụng theo vai trò**: Xem tại [docs/user-guide.md](../docs/user-guide.md)

