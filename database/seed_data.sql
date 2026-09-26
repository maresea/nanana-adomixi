-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ CÔNG VĂN VÀ VĂN BẢN NỘI BỘ TÍCH HỢP AI
-- Seed Data: Dữ liệu mẫu ban đầu phục vụ Demo & Chấm điểm
-- Mật khẩu mặc định cho tất cả tài khoản: 123456
-- (Hash bcrypt chuẩn: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW)
-- ==============================================================================

-- 1. Phòng ban
INSERT INTO departments (id, code, name) VALUES 
(1, 'VPCQ', 'Văn phòng Cơ quan'),
(2, 'PKHTC', 'Phòng Kế hoạch - Tài chính'),
(3, 'PCNTT', 'Phòng Công nghệ Thông tin');

-- 2. Người dùng mẫu (3 vai trò chuẩn)
INSERT INTO users (id, username, password_hash, full_name, email, role, department_id, is_active) VALUES 
(1, 'vanthu', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Nguyễn Thị Mai', 'vanthu@coquan.gov.vn', 'CLERK', 1, 1),
(2, 'lanhdao', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Trần Văn Hùng', 'lanhdao@coquan.gov.vn', 'LEADER', 1, 1),
(3, 'chuyenvien', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Lê Hoàng Nam', 'chuyenvien@coquan.gov.vn', 'SPECIALIST', 2, 1);

-- 3. Hồ sơ công văn mẫu
INSERT INTO documents (id, document_number, title, document_scope, document_type, category, issued_date, sender_org, recipient_org, urgency, status, ai_summary) VALUES 
(1, '125/UBND-VX', 'V/v phối hợp triển khai công tác chuyển đổi số và bảo đảm an toàn thông tin năm 2026', 'EXTERNAL', 'INCOMING', 'Chỉ đạo điều hành', '2026-03-10', 'Ủy ban nhân dân Tỉnh', 'Văn phòng Cơ quan', 'URGENT', 'ASSIGNED', '1. Yêu cầu các đơn vị trực thuộc đẩy nhanh tiến độ đề án chuyển đổi số.\n2. Rà soát phương án bảo mật dữ liệu công văn và văn bản hành chính.\n3. Hoàn thành báo cáo tình hình thực hiện trước ngày 30/03/2026.'),
(2, '45/CV-PKHTC', 'Tờ trình về việc phân bổ dự toán kinh phí nâng cấp hạ tầng công nghệ thông tin quý II/2026', 'INTERNAL', 'OUTGOING', 'Tờ trình', '2026-03-15', 'Phòng Kế hoạch - Tài chính', 'Ban Lãnh đạo', 'NORMAL', 'IN_PROGRESS', 'Đề xuất phê duyệt kinh phí 150 triệu đồng để bảo trì hệ thống máy chủ và trang bị thiết bị văn phòng phục vụ số hóa văn bản.'),
(3, '88/STC-HCSN', 'V/v hướng dẫn quyết toán kinh phí các nhiệm vụ ứng dụng công nghệ thông tin', 'EXTERNAL', 'INCOMING', 'Hướng dẫn', '2026-03-20', 'Sở Tài chính', 'Phòng Kế hoạch - Tài chính', 'NORMAL', 'RECEIVED', NULL);

-- 4. Phân công xử lý nhiệm vụ (Lãnh đạo giao Chuyên viên)
INSERT INTO task_assignments (id, document_id, assigner_id, assignee_id, instruction, deadline, status) VALUES 
(1, 1, 2, 3, 'Chuyên viên Nam chủ trì rà soát hiện trạng an toàn thông tin và soạn thảo văn bản phản hồi UBND Tỉnh đúng hạn.', '2026-03-28 17:00:00', 'PROCESSING');

-- 5. Dự thảo phản hồi
INSERT INTO draft_responses (id, task_id, author_id, content, is_ai_generated, is_approved, approval_note) VALUES 
(1, 1, 3, 'Kính gửi: Ủy ban nhân dân Tỉnh.\n\nCăn cứ Công văn số 125/UBND-VX ngày 10/03/2026 về công tác chuyển đổi số và bảo đảm an toàn thông tin, Cơ quan kính báo cáo tình hình triển khai như sau:\n1. Đã hoàn thành rà soát hạ tầng lưu trữ và phân quyền người dùng.\n2. Tiếp tục hoàn thiện quy chế an toàn văn bản nội bộ trước ngày 25/03/2026.\n\nKính trình Lãnh đạo phê duyệt.', 1, 0, NULL);

-- 6. Thông báo cảnh báo hạn xử lý
INSERT INTO notifications (id, user_id, title, content, is_read) VALUES 
(1, 3, 'Nhắc nhở hạn xử lý công văn số 125/UBND-VX', 'Nhiệm vụ xử lý công văn 125/UBND-VX sắp đến hạn chót (28/03/2026). Vui lòng hoàn thiện dự thảo phản hồi.', 0);
