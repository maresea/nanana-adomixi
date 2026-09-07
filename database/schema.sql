-- =============================================================================
-- DỰ ÁN: HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI
-- TẬP LỆNH KHỞI TẠO CƠ SỞ DỮ LIỆU (DATABASE SCHEMA DDL)
-- HỆ QUẢN TRỊ CSDL: PostgreSQL 15+
-- =============================================================================

-- 1. BẬT CÁC EXTENSION MỞ RỘNG CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. TẠO HÀM TRIGGER TỰ ĐỘNG CẬP NHẬT updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. ĐỊNH NGHĨA CÁC BẢNG DỮ LIỆU CỐT LÕI
-- =============================================================================

-- 3.1. Bảng Phòng ban / Đơn vị (departments)
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    parent_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE departments IS 'Bảng lưu trữ thông tin phòng ban, đơn vị trực thuộc cơ quan phục vụ phân quyền ABAC';
COMMENT ON COLUMN departments.code IS 'Mã định danh phòng ban duy nhất (VD: VP, TCKH, QLDT)';

-- 3.2. Bảng Vai trò người dùng (roles)
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS 'Bảng định nghĩa các vai trò hệ thống: CLERK, LEADER, SPECIALIST, ADMIN';

-- 3.3. Bảng Người dùng hệ thống (users)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Bảng lưu trữ tài khoản cán bộ, công chức truy cập hệ thống';

-- 3.4. Bảng Công văn & Văn bản (documents)
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    document_code VARCHAR(100) NOT NULL,
    arrival_number VARCHAR(50),
    document_type VARCHAR(30) NOT NULL CHECK (document_type IN ('INCOMING', 'OUTGOING', 'INTERNAL')),
    issuance_date DATE NOT NULL,
    arrival_date DATE NOT NULL DEFAULT CURRENT_DATE,
    issuing_authority VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    category VARCHAR(100),
    urgency_level VARCHAR(30) NOT NULL DEFAULT 'NORMAL' 
        CHECK (urgency_level IN ('NORMAL', 'URGENT', 'VERY_URGENT', 'TOP_URGENT')),
    confidentiality_level VARCHAR(30) NOT NULL DEFAULT 'NORMAL' 
        CHECK (confidentiality_level IN ('NORMAL', 'CONFIDENTIAL', 'SECRET')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW' 
        CHECK (status IN ('RECEIVED', 'PENDING_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'DISPATCHED', 'COMPLETED', 'REJECTED')),
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_mime_type VARCHAR(100) NOT NULL,
    ocr_content TEXT,
    ai_summary TEXT,
    ai_metadata JSONB,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE documents IS 'Bảng trung tâm lưu trữ thông tin công văn đến, đi và nội bộ kèm dữ liệu AI bóc tách';
COMMENT ON COLUMN documents.confidentiality_level IS 'Mức độ mật: nếu là CONFIDENTIAL hoặc SECRET thì bắt buộc xử lý qua Local AI';
COMMENT ON COLUMN documents.ai_summary IS 'Bản tóm tắt 3-5 ý cốt lõi phục vụ Lãnh đạo ra quyết định nhanh';

-- 3.5. Bảng Phân công nhiệm vụ & Quản lý Hạn xử lý (task_assignments)
CREATE TABLE IF NOT EXISTS task_assignments (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    assigned_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_dept_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    directive_notes TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED' 
        CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'DRAFT_SUBMITTED', 'APPROVED', 'COMPLETED', 'OVERDUE')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE task_assignments IS 'Lưu trữ chỉ đạo, người thụ lý chính và hạn chót xử lý do Lãnh đạo thiết lập';

-- 3.6. Bảng Dự thảo công văn phản hồi (draft_responses)
CREATE TABLE IF NOT EXISTS draft_responses (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    task_assignment_id BIGINT NOT NULL REFERENCES task_assignments(id) ON DELETE CASCADE,
    author_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    leader_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE draft_responses IS 'Bản dự thảo công văn phúc đáp do AI sinh ra và Chuyên viên hiệu chỉnh';

-- 3.7. Bảng Nhật ký tác vụ AI & OCR bất đồng bộ (ai_task_logs)
CREATE TABLE IF NOT EXISTS ai_task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    triggered_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    task_type VARCHAR(50) NOT NULL 
        CHECK (task_type IN ('OCR', 'METADATA_EXTRACTION', 'SUMMARIZATION', 'CLASSIFICATION', 'DRAFT_GENERATION')),
    ai_provider VARCHAR(50) NOT NULL 
        CHECK (ai_provider IN ('LOCAL_OLLAMA', 'LOCAL_VLLM', 'CLOUD_GEMINI', 'CLOUD_OPENAI')),
    model_name VARCHAR(100) NOT NULL,
    prompt_preview TEXT,
    result_data JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED' 
        CHECK (status IN ('QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED')),
    execution_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

COMMENT ON TABLE ai_task_logs IS 'Lưu vết các tác vụ xử lý nền (Background Queue) của OCR và AI để đo lường hiệu năng và kiểm toán';

-- 3.8. Bảng Thông báo & Nhắc hạn tự động (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('APPROACHING_DEADLINE', 'OVERDUE', 'NEW_ASSIGNMENT', 'DRAFT_SUBMITTED', 'DRAFT_APPROVED', 'AI_READY')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notifications IS 'Bảng quản lý thông báo đẩy nhắc việc thời gian thực và cảnh báo quá hạn';

-- =============================================================================
-- 4. GẮN CÁC TRIGGER TỰ ĐỘNG CẬP NHẬT updated_at
-- =============================================================================

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_task_assignments_updated_at
BEFORE UPDATE ON task_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_draft_responses_updated_at
BEFORE UPDATE ON draft_responses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. CHIẾN LƯỢC ĐÁNH CHỈ MỤC (INDEXING STRATEGY)
-- =============================================================================

-- 5.1. Chỉ mục tối ưu hóa cho phân quyền ABAC và trạng thái công văn
CREATE INDEX IF NOT EXISTS idx_documents_dept_status 
ON documents(department_id, status);

CREATE INDEX IF NOT EXISTS idx_documents_created_by 
ON documents(created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_documents_date_urgency 
ON documents(issuance_date DESC, urgency_level);

-- 5.2. Chỉ mục tối ưu hóa tìm kiếm mờ và toàn văn tiếng Việt (pg_trgm)
CREATE INDEX IF NOT EXISTS idx_documents_code_trgm 
ON documents USING gin (document_code gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_documents_authority_trgm 
ON documents USING gin (issuing_authority gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_documents_title_trgm 
ON documents USING gin (title gin_trgm_ops);

-- 5.3. Chỉ mục tối ưu hóa phân công công việc và quản lý hạn chót
CREATE INDEX IF NOT EXISTS idx_task_assigned_user_status 
ON task_assignments(assigned_to_user_id, status);

CREATE INDEX IF NOT EXISTS idx_task_assigned_dept_status 
ON task_assignments(assigned_to_dept_id, status);

-- Chỉ mục điều kiện (Partial Index) phục vụ quét cảnh báo nhắc hạn công việc chưa hoàn thành
CREATE INDEX IF NOT EXISTS idx_task_deadline_active 
ON task_assignments(deadline) 
WHERE status NOT IN ('COMPLETED');

-- 5.4. Chỉ mục giám sát tác vụ AI và hàng đợi nền
CREATE INDEX IF NOT EXISTS idx_ai_logs_doc_status 
ON ai_task_logs(document_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at 
ON ai_task_logs(created_at DESC);

-- 5.5. Chỉ mục tối ưu lấy thông báo người dùng
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC);

-- =============================================================================
-- 6. DỮ LIỆU KHỞI TẠO MẪU (SEED DATA)
-- =============================================================================

-- 6.1. Khởi tạo Vai trò hệ thống
INSERT INTO roles (id, code, name, description) VALUES
(1, 'ADMIN', 'Quản trị hệ thống', 'Toàn quyền quản trị tài khoản, danh mục và giám sát kỹ thuật'),
(2, 'CLERK', 'Văn thư cơ quan', 'Tiếp nhận công văn, chạy OCR, trích xuất AI, vào sổ và cấp số đi'),
(3, 'LEADER', 'Lãnh đạo cơ quan', 'Đọc tóm tắt AI, nhập chỉ đạo, phân công giao việc, duyệt dự thảo và xem dashboard'),
(4, 'SPECIALIST', 'Chuyên viên xử lý', 'Thụ lý văn bản được giao, tra cứu hồ sơ, dùng AI sinh dự thảo phản hồi')
ON CONFLICT (code) DO NOTHING;

-- 6.2. Khởi tạo Cơ cấu Phòng ban cơ quan
INSERT INTO departments (id, code, name, parent_id, is_active) VALUES
(1, 'BGD', 'Ban Giám đốc', NULL, TRUE),
(2, 'VP', 'Văn phòng cơ quan', 1, TRUE),
(3, 'TCKH', 'Phòng Tài chính - Kế hoạch', 1, TRUE),
(4, 'QLDT', 'Phòng Quản lý Đô thị', 1, TRUE),
(5, 'NV', 'Phòng Nội vụ', 1, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 6.3. Khởi tạo Tài khoản người dùng đại diện 3 vai trò
-- Lưu ý: password_hash giả lập cho mật khẩu mặc định: Password@123
INSERT INTO users (id, username, email, password_hash, full_name, phone_number, department_id, role_id, is_active) VALUES
(1, 'admin', 'admin@agency.gov.vn', '$2b$12$e8k8bN8QxP6qRjUeO3pEwOI9KqZkK6xL2Qy0P0xR5Z9X8P3y3k5e', 'Quản trị viên', '0901000001', 2, 1, TRUE),
(2, 'vanthu_mai', 'vanthu@agency.gov.vn', '$2b$12$e8k8bN8QxP6qRjUeO3pEwOI9KqZkK6xL2Qy0P0xR5Z9X8P3y3k5e', 'Nguyễn Thị Mai (Văn thư)', '0901000002', 2, 2, TRUE),
(3, 'lanhdao_hai', 'lanhdao@agency.gov.vn', '$2b$12$e8k8bN8QxP6qRjUeO3pEwOI9KqZkK6xL2Qy0P0xR5Z9X8P3y3k5e', 'Trần Văn Hải (Giám đốc)', '0901000003', 1, 3, TRUE),
(4, 'chuyenvien_nam', 'nam.tc@agency.gov.vn', '$2b$12$e8k8bN8QxP6qRjUeO3pEwOI9KqZkK6xL2Qy0P0xR5Z9X8P3y3k5e', 'Lê Hoàng Nam (Chuyên viên Tài chính)', '0901000004', 3, 4, TRUE),
(5, 'chuyenvien_an', 'an.dt@agency.gov.vn', '$2b$12$e8k8bN8QxP6qRjUeO3pEwOI9KqZkK6xL2Qy0P0xR5Z9X8P3y3k5e', 'Phạm Quốc An (Chuyên viên Đô thị)', '0901000005', 4, 4, TRUE)
ON CONFLICT (username) DO NOTHING;

-- Đặt lại giá trị Sequence cho các bảng sau khi insert dữ liệu mẫu
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

