-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI
-- DDL Schema: 8 Bảng Cơ sở dữ liệu chuẩn hóa 3NF
-- Tuân thủ: database-design-skill & ood-design-skill
-- ==============================================================================

-- 1. Bảng Phòng ban / Đơn vị
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Người dùng / Cán bộ
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK(role IN ('CLERK', 'LEADER', 'SPECIALIST')),
    department_id INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 3. Bảng Hồ sơ Công văn & Văn bản Nội bộ
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_number VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    document_scope VARCHAR(20) NOT NULL CHECK(document_scope IN ('EXTERNAL', 'INTERNAL')),
    document_type VARCHAR(20) NOT NULL CHECK(document_type IN ('INCOMING', 'OUTGOING')),
    category VARCHAR(100),
    issued_date DATE NOT NULL,
    sender_org VARCHAR(150) NOT NULL,
    recipient_org VARCHAR(150) NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK(urgency IN ('NORMAL', 'URGENT', 'VERY_URGENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED' CHECK(status IN ('RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED')),
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Tệp đính kèm số hóa
CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    extracted_text TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- 5. Bảng Phân công xử lý & Theo dõi hạn chót
CREATE TABLE IF NOT EXISTS task_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    assigner_id INTEGER NOT NULL,
    assignee_id INTEGER NOT NULL,
    instruction TEXT,
    deadline DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ASSIGNED' CHECK(status IN ('ASSIGNED', 'PROCESSING', 'RESOLVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (assigner_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 6. Bảng Văn bản Dự thảo phản hồi
CREATE TABLE IF NOT EXISTS draft_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT 0,
    approval_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES task_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 7. Bảng Thông báo & Cảnh báo hạn xử lý
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Bảng Nhật ký xử lý AI (Kiểm toán & Đánh giá)
CREATE TABLE IF NOT EXISTS ai_task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_type VARCHAR(50) NOT NULL CHECK(task_type IN ('EXTRACT', 'SUMMARIZE', 'CLASSIFY', 'DRAFT', 'OCR')),
    prompt_input TEXT NOT NULL,
    raw_response TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chỉ mục hỗ trợ tìm kiếm nhanh (Tối ưu cho FR5 - Tra cứu)
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents(document_number, issued_date, status, document_scope);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON task_assignments(deadline, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
