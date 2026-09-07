---
name: requirements-analysis
description: Phân tích file khảo sát thành tài liệu đặc tả yêu cầu.
---
# Requirements Analysis Skill

## Inputs
Đọc thông tin từ file: phan_tich_khao_sat.docx

## Process & Rules
1. Nhận diện 3 vai trò: Văn thư, Lãnh đạo, Chuyên viên.
2. Bóc tách Functional Requirements (FR): Quản lý công văn, phân công xử lý, AI tóm tắt văn bản dài, AI gợi ý phân loại, AI sinh dự thảo phản hồi.
3. Bóc tách Non-functional Requirements (NFR): Các tác vụ AI phải chạy ngầm (bất đồng bộ) không làm đơ giao diện; độ chính xác trích xuất tối thiểu 90-95%.
4. Không tự bịa thêm các quy trình nghiệp vụ ngoài file khảo sát.

## Outputs
Tạo tài liệu: docs/requirements.md