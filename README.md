# Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI

Đề tài môn học: **Công nghệ Kỹ thuật Phần mềm (Software Engineering & Generative AI)**.

---

## 1. Cấu trúc Dự án

```
nanana-adomixi/
├── .agents/                 # Rules và Skills chuẩn hóa quy trình phân tích & phát triển
├── database/                # Thiết kế Cơ sở Dữ liệu & Seed Data (database-design-skill)
│   ├── schema.sql           # DDL 8 bảng quan hệ chuẩn 3NF
│   └── seed_data.sql        # Dữ liệu mẫu khởi tạo cho 3 vai trò và luồng công văn
├── backend/                 # Backend RESTful API (backend-development-skill)
│   ├── app/
│   │   ├── main.py          # Khởi chạy FastAPI, CORS, tự động tạo bảng & nạp seed data
│   │   ├── core/            # Cấu hình hệ thống, bảo mật JWT, database session
│   │   ├── models/          # 8 ORM Models SQLAlchemy khớp 1:1 CSDL
│   │   ├── schemas/         # Pydantic Schemas (Request/Response DTOs)
│   │   ├── routers/         # API Endpoints (Bao phủ trọn vẹn 12 FR và 3 vai trò)
│   │   └── services/        # Logic nghiệp vụ, Trích xuất tệp PDF/DOCX & Trợ lý AI
│   └── requirements.txt
├── frontend/                # Ứng dụng Web Single Page App (frontend-development-skill)
│   ├── src/
│   │   ├── pages/           # Màn hình chính (Login, Dashboard, Documents, Create, Tasks)
│   │   ├── components/      # UI components tái sử dụng và thẻ hiển thị AI (Human-in-the-loop)
│   │   ├── context/         # AuthContext phân quyền động 3 vai trò
│   │   └── services/        # Axios API Client kết nối Backend
│   └── package.json
└── docs/                    # Tài liệu đặc tả yêu cầu, thiết kế OOD và kế hoạch dự án
```

---

## 2. Hướng dẫn Chạy Hệ thống

### Bước 1: Khởi động Backend (FastAPI)
Mở cửa sổ Terminal thứ nhất:
```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload --port 8000
```
* **Swagger UI API Docs**: `http://localhost:8000/docs` (Truy cập để kiểm thử trực tiếp mọi API).
* CSDL SQLite (`data.db`) sẽ **tự động được tạo và nạp dữ liệu mẫu** ngay khi backend khởi động lần đầu.

### Bước 2: Khởi động Frontend (React + Vite)
Mở cửa sổ Terminal thứ hai:
```bash
cd frontend
npm install
npm run dev
```
* **Giao diện Web**: `http://localhost:3000` (hoặc cổng hiển thị trên terminal).

---

## 3. Tài khoản Đăng nhập Demo (3 Vai trò chuẩn)

Mật khẩu mặc định cho tất cả tài khoản: **`123456`**

| Tên tài khoản | Vai trò | Người dùng | Thẩm quyền chính |
|---|---|---|---|
| **`vanthu`** | Văn thư (`CLERK`) | Nguyễn Thị Mai | Tiếp nhận công văn, upload tệp số hóa, kiểm tra AI bóc tách thông tin (FR2, FR7, FR9, FR12). |
| **`lanhdao`** | Lãnh đạo (`LEADER`) | Trần Văn Hùng | Xem Dashboard thống kê (FR11), xem AI tóm tắt 3–5 ý (FR8), phân công & đặt hạn (FR3), duyệt dự thảo (FR4). |
| **`chuyenvien`** | Chuyên viên (`SPECIALIST`) | Lê Hoàng Nam | Nhận nhiệm vụ, theo dõi hạn chót (FR6), dùng AI sinh dự thảo phản hồi (FR10), cập nhật tiến độ (FR4). |

---

## 4. Danh mục 12 Yêu cầu Chức năng (FR1 – FR12)

* **FR1**: Đăng nhập và phân quyền theo đúng 3 vai trò.
* **FR2**: Quản lý công văn đến, công văn đi và văn bản nội bộ.
* **FR3**: Phân công xử lý và thiết lập hạn chót (Deadline).
* **FR4**: Cập nhật trạng thái xử lý và trình duyệt văn bản phản hồi.
* **FR5**: Tra cứu văn bản theo số ký hiệu, ngày, đơn vị và trạng thái.
* **FR6**: Cảnh báo và nhắc hạn xử lý tự động (quá hạn, sắp đến hạn).
* **FR7**: AI trích xuất thông tin tự động (số hiệu, ngày, trích yếu).
* **FR8**: AI tóm tắt văn bản thành 3–5 ý chính cô đọng.
* **FR9**: AI gợi ý phân loại và mức độ ưu tiên.
* **FR10**: AI sinh dự thảo phản hồi theo mẫu thể thức hành chính.
* **FR11**: Dashboard báo cáo thống kê tình hình công văn cho Lãnh đạo.
* **FR12**: Nhận dạng ký tự (OCR) và bóc tách nội dung tệp scan/PDF.
