---
name: frontend-development-skill
description: Quy chuẩn kiến trúc, giao diện người dùng (React/Vite), quản lý trạng thái, phân quyền UI theo 3 vai trò và tích hợp trải nghiệm AI (Human-in-the-loop) cho Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI.
---

# Skill: Phát triển Frontend Giao diện & Trải nghiệm AI (Frontend Development & AI UX)

## 1. Mục tiêu và Định hướng Trải nghiệm (UI/UX)

Skill này hướng dẫn quy chuẩn xây dựng giao diện ứng dụng web cho đề tài môn học:
> **"Hệ thống quản lý công văn và văn bản nội bộ có tích hợp AI"**

### Nguyên tắc cốt lõi (Bám sát `role.md` và các Skill nền tảng):
- **Phân quyền giao diện theo 3 Vai trò**:
  - Giao diện tùy biến theo vai trò người dùng sau khi đăng nhập (`CLERK`, `LEADER`, `SPECIALIST`).
  - Ẩn hoàn toàn các nút thao tác và menu điều hướng mà vai trò đó không có thẩm quyền (ngăn chặn thao tác trái phép ngay từ phía Client).
- **Thẩm mỹ Hành chính Hiện đại (Clean Administrative Design)**:
  - Tông màu chủ đạo trang nhã, nghiêm túc: Xanh Navy/Slate (`#1E40AF`, `#0F172A`), nền trắng/xám nhạt (`#F8FAFC`).
  - Điểm nhấn AI nổi bật nhưng thanh lịch: Hồng pastel/đỏ nhẹ (`#FEE2E2`, `#EF4444`) đồng bộ với nhận diện màu sắc trong `plantuml-diagram-skill`.
  - Bố cục lưới rõ ràng, dễ nhìn, font chữ hiện đại (Inter / Roboto / Arial), tối ưu để trình chiếu slide và bảo vệ đồ án trực quan.
- **Trải nghiệm AI lấy con người làm trung tâm (Human-in-the-loop UX)**:
  - Mọi kết quả do AI sinh ra (tóm tắt, gợi ý phân loại, bóc tách metadata, dự thảo phản hồi) **luôn luôn hiển thị ở chế độ xem trước (Preview) và cho phép chỉnh sửa (Editable)**.
  - Cung cấp nút thao tác rõ ràng: *"Áp dụng vào biểu mẫu"*, *"Chỉnh sửa lại"*, *"Tạo lại bằng AI"*. Không bao giờ tự động lưu kết quả AI vào cơ sở dữ liệu nếu chưa có thao tác xác nhận của người dùng.
- **Chống Over-engineering**:
  - Dùng Single Page Application (SPA) với React + Vite.
  - Không lạm dụng các thư viện quản lý state cồng kềnh (không Redux Saga/Thunk phức tạp); ưu tiên React Context + Hooks hoặc Zustand gọn nhẹ.

---

## 2. Công nghệ và Thư viện Chuẩn (Tech Stack)

| Thành phần | Công nghệ lựa chọn | Lý do lựa chọn cho dự án môn học |
|---|---|---|
| **Framework / Bundler** | **React 18+** + **Vite** | Tốc độ khởi động và Hot Reload cực nhanh, cấu trúc dự án nhẹ, dễ đóng gói demo. |
| **Giao diện & Styling** | **TailwindCSS** (hoặc CSS Modules) | Xây dựng giao diện nhanh chóng với hệ thống utility classes, giao diện chuẩn responsive. |
| **Điều hướng (Routing)** | **React Router DOM v6** | Định tuyến SPA mượt mà, hỗ trợ cấu hình PrivateRoute/RoleBasedRoute chặt chẽ. |
| **Icons & Trực quan** | **Lucide React** | Bộ icon phẳng, hiện đại, kích thước nhẹ (`FileText`, `Sparkles`, `Clock`, `Send`, `CheckCircle`...). |
| **HTTP Client** | **Axios** | Cấu hình Interceptors tự động đính kèm `Bearer Token` và bắt lỗi 401/403 tập trung. |
| **Biểu đồ Dashboard** | **Chart.js** / **Recharts** | Vẽ biểu đồ cột và tròn đơn giản cho màn hình thống kê tiến độ của Lãnh đạo (FR11). |

---

## 3. Cấu trúc Thư mục Frontend Chuẩn (Modular Architecture)

```
frontend/
├── src/
│   ├── assets/                     # Logo cơ quan, hình ảnh minh họa
│   ├── components/                 # Các thành phần giao diện tái sử dụng
│   │   ├── common/                 # Nút bấm, Ô nhập liệu, Bảng, Hộp thoại
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx           # Huy hiệu hiển thị Trạng thái & Độ khẩn
│   │   │   └── DataTable.jsx       # Bảng danh sách văn bản có phân trang
│   │   ├── layout/                 # Khung sườn ứng dụng
│   │   │   ├── Navbar.jsx          # Thanh đầu trang: Thông tin cán bộ, Đăng xuất
│   │   │   ├── Sidebar.jsx         # Menu điều hướng theo phân quyền vai trò
│   │   │   └── MainLayout.jsx      # Bố cục chính bọc nội dung các trang
│   │   └── ai/                     # Thành phần giao diện đặc thù cho tính năng AI
│   │       ├── AISparkleBadge.jsx  # Huy hiệu nhận diện tính năng AI
│   │       ├── AISummaryBox.jsx    # Hộp hiển thị 3-5 ý tóm tắt của AI (FR8)
│   │       ├── AIMetadataReview.jsx# Bảng so sánh dữ liệu gốc & AI trích xuất (FR7)
│   │       └── AIDraftEditor.jsx   # Khung soạn thảo dự thảo có nút AI trợ lý (FR10)
│   ├── context/                    # Quản lý trạng thái toàn cục đơn giản
│   │   └── AuthContext.jsx         # Lưu trữ user, role, token, hàm login/logout
│   ├── hooks/                      # Custom hooks tái sử dụng logic
│   │   ├── useAuth.js              # Truy xuất nhanh quyền hạn người dùng
│   │   ├── useDocuments.js         # Lấy danh sách, tra cứu công văn
│   │   └── useAI.js                # Quản lý trạng thái loading, lỗi khi gọi AI
│   ├── pages/                      # Các trang màn hình chính (Ánh xạ 12 FR)
│   │   ├── LoginPage.jsx           # FR1: Màn hình Đăng nhập
│   │   ├── DashboardPage.jsx       # FR11: Thống kê số liệu công văn & hạn xử lý
│   │   ├── DocumentsPage.jsx       # FR2, FR5: Danh sách và Tra cứu công văn
│   │   ├── DocumentCreatePage.jsx  # FR2, FR7, FR9, FR12: Tiếp nhận công văn & AI bóc tách
│   │   ├── DocumentDetailPage.jsx  # Xem chi tiết hồ sơ, tệp đính kèm, tóm tắt AI
│   │   ├── TaskAssignmentModal.jsx # FR3: Hộp thoại phân công & giao hạn của Lãnh đạo
│   │   ├── TaskProcessingPage.jsx  # FR4, FR10: Chuyên viên xử lý & AI sinh dự thảo
│   │   └── NotificationsPage.jsx   # FR6: Danh sách thông báo & Cảnh báo hạn
│   ├── services/                   # Tầng giao tiếp Backend API
│   │   ├── apiClient.js            # Axios instance có sẵn BaseURL và Auth Interceptor
│   │   ├── authService.js
│   │   ├── documentService.js
│   │   ├── taskService.js
│   │   └── aiService.js
│   ├── utils/                      # Hàm tiện ích dùng chung
│   │   ├── formatters.js           # Định dạng ngày tháng VN, dung lượng file
│   │   └── constants.js            # Danh mục Enum (RoleType, DocumentStatus...)
│   ├── App.jsx                     # Cấu hình Router và Route Guards
│   ├── index.css                   # Thiết lập TailwindCSS & Typography
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

---

## 4. Ma trận Màn hình Ánh xạ 12 FR và 3 Vai trò (UI Screens Matrix)

| Mã FR | Tên chức năng | Màn hình tương ứng | Vai trò truy cập | Các thành phần UI trọng tâm |
|:---:|---|---|:---:|---|
| **FR1** | Đăng nhập & Phân quyền | `LoginPage.jsx` | Tất cả | Form nhập tài khoản/mật khẩu, kiểm tra quyền và tự động chuyển hướng màn hình. |
| **FR2** | Quản lý công văn | `DocumentCreatePage.jsx` | `CLERK` | Upload tệp PDF/DOCX demo, xem trước văn bản, điền sổ công văn. |
| **FR3** | Phân công & Thiết lập hạn | `TaskAssignmentModal.jsx` | `LEADER` | Dropdown chọn Chuyên viên, DatePicker chọn hạn chót (`deadline`), TextArea nhập ý kiến chỉ đạo. |
| **FR4** | Cập nhật tiến độ & Trình phản hồi | `TaskProcessingPage.jsx` | `SPECIALIST` | Radio chọn trạng thái xử lý, Trình soạn thảo dự thảo phản hồi, Nút gửi trình duyệt Lãnh đạo. |
| **FR5** | Tra cứu văn bản | `DocumentsPage.jsx` | Tất cả | Thanh tìm kiếm nhanh, bộ lọc nâng cao (loại công văn, ngày ban hành, đơn vị, trạng thái). |
| **FR6** | Nhắc hạn xử lý | `NotificationsPage.jsx` & Navbar Bell | Tất cả | Icon chuông báo đỏ, danh sách thẻ văn bản sắp đến hạn (vàng) và quá hạn (đỏ). |
| **FR7** | AI trích xuất thông tin | `DocumentCreatePage.jsx` (Component `AIMetadataReview`) | `CLERK` | Nút *"AI Quét & Trích xuất"*, hiển thị gợi ý số hiệu, ngày, trích yếu để Văn thư bấm *"Chấp nhận"* hoặc sửa. |
| **FR8** | AI tóm tắt văn bản | `DocumentDetailPage.jsx` (Component `AISummaryBox`) | `LEADER`, `CLERK` | Thẻ tóm tắt 3–5 ý chính của AI, giúp Lãnh đạo đọc nhanh trong 10 giây trước khi phân công. |
| **FR9** | AI phân loại & gợi ý ưu tiên | `DocumentCreatePage.jsx` | `CLERK` | Thẻ đề xuất Thể loại & Độ khẩn (Kèm nhãn *"Gợi ý của AI"*), Văn thư có thể chọn lại theo ý mình. |
| **FR10** | AI sinh dự thảo phản hồi | `TaskProcessingPage.jsx` (Component `AIDraftEditor`) | `SPECIALIST` | Nút *"Tạo dự thảo với AI"*, sinh văn bản mẫu chuẩn thể thức hành chính, cho phép sửa trực tiếp trong trình soạn thảo. |
| **FR11** | Báo cáo thống kê | `DashboardPage.jsx` | `LEADER` | Biểu đồ cột tình hình xử lý văn bản theo phòng ban, thẻ số liệu công văn quá hạn/đúng hạn. |
| **FR12** | Nhận dạng ký tự (OCR) | `DocumentCreatePage.jsx` | `CLERK` | Hỗ trợ đọc tệp ảnh/scan công văn thành văn bản thô *(Tùy chọn Should-have)*. |

---

## 5. Quy chuẩn Thiết kế Trải nghiệm AI (AI UX Patterns)

Để đảm bảo tính khoa học và thuyết phục khi báo cáo đồ án, mọi thành phần AI trên Frontend bắt buộc phải tuân theo 4 quy tắc:

### 5.1. Nhận diện Trực quan Thống nhất (Visual Identity)
- Thành phần AI luôn có icon **Sparkles** (✨) đi kèm.
- Nền khung chứa kết quả AI sử dụng màu tím nhạt hoặc hồng/đỏ nhạt (`bg-red-50 border-red-200 text-red-900`) để phân biệt rạch ròi với dữ liệu người dùng nhập thủ công.

### 5.2. Luôn có Trạng thái Đang Xử lý (Loading & Skeleton)
- Việc gọi mô hình AI/LLM thường mất từ 2–5 giây. Bắt buộc hiển thị spinner loading hoặc hiệu ứng sóng skeleton:
  *"AI đang phân tích và trích xuất nội dung văn bản..."* để người dùng không bấm nhiều lần.

### 5.3. Hỗ trợ So sánh Đối soát Trực quan (Diff / Side-by-Side Review)
- Khi AI trích xuất metadata (FR7) hoặc gợi ý phân loại (FR9): Hiển thị khung xem tệp văn bản bên trái và form dữ liệu do AI đề xuất bên phải để Văn thư dễ dàng đối soát mắt trước khi bấm xác nhận.

### 5.4. Quyền Kiểm soát Thuộc về Con người (Human Override)
- Tuyệt đối không disable các trường nhập liệu sau khi AI điền. Người dùng luôn có quyền gõ đè, xóa hoặc sửa lại bất kỳ thông tin nào do AI đưa ra.

---

## 6. Cơ chế Phân quyền Điều hướng (Role-based Routing)

Sử dụng component bọc định tuyến để chặn truy cập trái phép:

```jsx
// src/components/layout/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">403 - Không có quyền truy cập</h2>
        <p className="mt-2 text-gray-600">Bạn không có thẩm quyền truy cập chức năng này.</p>
      </div>
    );
  }

  return children;
};
```

---

## 7. Checklist Kiểm tra Chất lượng Giao diện (Frontend Quality Checklist)

Trước khi nghiệm thu hoặc nộp bài, bắt buộc rà soát checklist:

- [ ] **Khớp 3 Vai trò**: Đăng nhập lần lượt bằng tài khoản Văn thư, Lãnh đạo, Chuyên viên và kiểm tra Menu/Nút bấm có hiển thị đúng thẩm quyền không?
- [ ] **Bao phủ 12 FR**: Các luồng từ tiếp nhận (FR2), phân công (FR3), xử lý (FR4), tra cứu (FR5), cảnh báo hạn (FR6) đến các màn hình AI (FR7, 8, 9, 10, 11, 12) hoạt động mượt mà.
- [ ] **Tính năng AI có thể chỉnh sửa**: Kết quả gợi ý từ AI luôn sửa được trên form trước khi lưu vào hệ thống.
- [ ] **Thông báo phản hồi rõ ràng**: Mọi thao tác lưu, xóa, phân công, duyệt đều có Toast notification báo thành công hoặc lỗi chi tiết.
- [ ] **Tương thích hiển thị**: Giao diện hiển thị ngay ngắn trên màn hình máy tính bàn, laptop và máy chiếu của hội đồng chấm điểm.
