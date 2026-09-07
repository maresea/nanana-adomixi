---
name: security-review
description: Kiểm tra lỗ hổng bảo mật, phân quyền truy cập và rò rỉ API Key.
---
# Security Review Skill
## Process
1. Kiểm tra phân quyền: Đảm bảo văn bản giao cho ai/phòng nào thì chỉ người đó/phòng đó được quyền truy cập.
2. Kiểm tra các rủi ro: SQL Injection, XSS, CSRF.
3. Kiểm tra việc quản lý biến môi trường (.env) đối với API Key của Gemini/OpenAI.
4. Xuất báo cáo bảo mật vào docs/security-review.md.