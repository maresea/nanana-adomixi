# HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI

Hệ thống số hóa và tự động hóa quy trình tiếp nhận, luân chuyển, xử lý và ban hành công văn hành chính dành cho Cơ quan Nhà nước, tích hợp Trí tuệ Nhân tạo (AI & OCR) với cơ chế bảo mật đa tầng.

---

## 1. CÔNG NGHỆ CHỦ ĐẠO (TECH STACK)

- **Backend**:
  - Framework: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12/3.14).
  - CSDL & ORM: [PostgreSQL](https://www.postgresql.org/) / [SQLite](https://www.sqlite.org/) qua [SQLAlchemy](https://www.sqlalchemy.org/).
  - Xác thực & Phân quyền: JWT Token HS256, RBAC kết hợp ABAC cô lập dữ liệu.
  - Xử lý Bất đồng bộ: FastAPI BackgroundTasks, hỗ trợ tích hợp Redis/Celery.
- **Frontend**:
  - Thư viện cốt lõi: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/).
  - Giao diện: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/).
  - Quản lý trạng thái: [Zustand](https://zustand-demo.pmnd.rs/) (Auth & Role state), [TanStack React Query](https://tanstack.com/query/latest).
  - Định tuyến: [React Router v6](https://reactrouter.com/).
  - Realtime: WebSocket client lắng nghe sự kiện hoàn tất AI ngầm.
- **Trí tuệ Nhân tạo (AI Engine)**:
  - Kiến trúc Adapter Pattern: Hoán đổi linh hoạt giữa Local AI và Cloud AI.
  - **Local AI** (Bắt buộc với văn bản MẬT): Ollama / vLLM trên On-premise GPU (NVIDIA RTX 3090/4090).
  - **Cloud AI** (Thử nghiệm PoC): Google Gemini API, OpenAI API (tuyệt đối không hard-code khóa).
  - **Heuristic Fallback Engine**: Tự động dự phòng khi ngắt kết nối mô hình ngoài.

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```
Skill_Prj/
├── backend/                  # Mã nguồn dịch vụ Backend (FastAPI)
│   ├── app/
│   │   ├── core/             # Database session, JWT security, RBAC/ABAC permissions
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── schemas/          # Pydantic Schemas
│   │   ├── services/         # AI Service (Adapter Pattern, Prompts hành chính)
│   │   ├── routers/          # API Endpoints (auth, documents, tasks, ai)
│   │   ├── config.py         # Cấu hình biến môi trường
│   │   └── main.py           # Điểm vào ứng dụng FastAPI & Middleware
│   ├── tests/                # Bộ kiểm thử tự động toàn diện (pytest)
│   ├── .env.example          # Mẫu biến môi trường
│   └── requirements.txt      # Thư viện phụ thuộc Python
├── frontend/                 # Mã nguồn giao diện người dùng (React + Vite)
│   ├── src/
│   │   ├── components/       # Layout, Navbar, ProtectedRoute, UI components
│   │   ├── hooks/            # useAIWebSocket.ts (kết nối thời gian thực)
│   │   ├── lib/              # Cấu hình Axios Interceptors
│   │   ├── pages/            # Login, Dashboards (Clerk, Leader, Specialist), DocumentDetail
│   │   ├── routes/           # Cấu hình React Router v6
│   │   └── store/            # Zustand authStore
│   ├── package.json          # Thư viện phụ thuộc Node.js
│   └── vite.config.ts        # Cấu hình Vite & Proxy
├── database/
│   └── schema.sql            # Bản thiết kế lược đồ CSDL PostgreSQL chuẩn hóa
├── docs/                     # Tài liệu kỹ thuật & Báo cáo chất lượng
│   ├── requirements.md       # Đặc tả yêu cầu phần mềm (SRS)
│   ├── user-stories.md       # Danh sách User Stories & Tiêu chí chấp nhận
│   ├── architecture.md       # Tài liệu thiết kế kiến trúc hệ thống
│   ├── architecture-decisions.md # 6 quyết định kiến trúc quan trọng (ADRs)
│   ├── database-design.md    # Thiết kế CSDL chi tiết (3NF)
│   ├── test-report.md        # Báo cáo kiểm thử chất lượng (Testing Skill)
│   ├── code-review.md        # Báo cáo đánh giá mã nguồn (Code Review Skill)
│   ├── security-review.md    # Báo cáo an toàn thông tin & bảo mật (Security Review Skill)
│   └── user-guide.md         # Hướng dẫn sử dụng hệ thống theo vai trò
└── README.md                 # Tài liệu tổng quan dự án
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN

### 3.1. Khởi chạy Backend API
1. Mở cửa sổ Terminal và kích hoạt môi trường ảo:
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Khởi tạo file biến môi trường từ mẫu:
   ```bash
   cp backend/.env.example backend/.env
   ```
4. Chạy máy chủ backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
- **Tài liệu API Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Tài liệu API ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3.2. Khởi chạy Frontend Web Application
1. Mở một cửa sổ Terminal khác:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Truy cập ứng dụng tại: [http://localhost:5173/](http://localhost:5173/)

---

## 4. TÀI KHOẢN MẪU KHỞI TẠO SẴN (SEED USERS)

Hệ thống tự động khởi tạo các tài khoản người dùng mẫu phục vụ kiểm thử:

| Tài khoản | Mật khẩu | Vai trò (Role) | Phòng ban | Chức trách chính |
|:---|:---|:---:|:---|:---|
| `vanthu_mai` | `Password@123` | **CLERK** | Văn phòng cơ quan | Tiếp nhận, scan/upload, đối soát thông tin, vào sổ |
| `lanhdao_hai` | `Password@123` | **LEADER** | Ban Giám đốc | Đọc tóm tắt AI (3-5 ý), chỉ đạo, giao việc, duyệt dự thảo |
| `chuyenvien_nam` | `Password@123` | **SPECIALIST** | Phòng Tài chính - Kế hoạch | Nhận việc, sinh dự thảo AI, nộp bản thảo phản hồi |
| `chuyenvien_an` | `Password@123` | **SPECIALIST** | Phòng Quản lý Đô thị | Thụ lý văn bản mảng đô thị (kiểm thử bảo mật ABAC) |
| `admin` | `Password@123` | **ADMIN** | Quản trị hệ thống | Toàn quyền quản trị tài khoản và danh mục |

---

## 5. TÀI LIỆU VÀ CÁC BÁO CÁO NGHIỆM THU

- [Báo cáo Kiểm thử Hệ thống (Test Report)](docs/test-report.md)
- [Báo cáo Đánh giá Mã nguồn (Code Review)](docs/code-review.md)
- [Báo cáo An toàn Thông tin & Bảo mật (Security Review)](docs/security-review.md)
- [Hướng dẫn Sử dụng Theo Vai trò (User Guide)](docs/user-guide.md)
- [Đặc tả Yêu cầu Phần mềm (SRS)](docs/requirements.md)
- [Thiết kế Kiến trúc Hệ thống](docs/architecture.md)
- [Thiết kế Cơ sở Dữ liệu](docs/database-design.md)

