from datetime import datetime, timedelta

def test_task_assignment_and_lifecycle(client, clerk_headers, leader_headers, specialist_headers):
    """TC-FR3-01 & TC-FR4-01: Luồng trọn vẹn từ Phân công ➔ Soạn dự thảo ➔ Lãnh đạo duyệt."""
    # 1. Văn thư tạo công văn
    doc_res = client.post("/api/v1/documents", json={
        "document_number": "77/CV-TEST",
        "title": "V/v kiểm tra tiến độ dự án",
        "document_scope": "INTERNAL",
        "document_type": "INCOMING",
        "issued_date": "2026-03-22",
        "sender_org": "Ban Chỉ đạo",
        "recipient_org": "Cơ quan",
        "urgency": "URGENT"
    }, headers=clerk_headers)
    doc_id = doc_res.json()["id"]

    # 2. Lãnh đạo phân công cho chuyên viên (id=3) kèm deadline (FR3)
    deadline_str = (datetime.now() + timedelta(days=2)).isoformat()
    assign_res = client.post("/api/v1/tasks/assign", json={
        "document_id": doc_id,
        "assignee_id": 3,
        "instruction": "Chuyên viên Nam chủ trì giải quyết và soạn văn bản trả lời.",
        "deadline": deadline_str
    }, headers=leader_headers)
    assert assign_res.status_code == 200
    task_id = assign_res.json()["id"]
    assert assign_res.json()["status"] == "ASSIGNED"

    # 3. Chuyên viên cập nhật trạng thái PROCESSING (FR4)
    status_res = client.patch(f"/api/v1/tasks/{task_id}/status", json={"status": "PROCESSING"}, headers=specialist_headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "PROCESSING"

    # 4. Chuyên viên nộp dự thảo phản hồi (FR4, FR10)
    draft_res = client.post(f"/api/v1/drafts/tasks/{task_id}", json={
        "content": "Kính gửi Lãnh đạo: Báo cáo tiến độ dự án bảo đảm đúng kế hoạch.",
        "is_ai_generated": True
    }, headers=specialist_headers)
    assert draft_res.status_code == 200
    draft_id = draft_res.json()["id"]
    assert draft_res.json()["is_approved"] is False

    # 5. Lãnh đạo phê duyệt dự thảo (FR4)
    approve_res = client.post(f"/api/v1/drafts/{draft_id}/approve", json={
        "is_approved": True,
        "approval_note": "Đồng ý phê duyệt ban hành."
    }, headers=leader_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["is_approved"] is True

    # 6. Kiểm tra trạng thái nhiệm vụ tự động chuyển sang RESOLVED
    task_check = client.get("/api/v1/tasks", headers=leader_headers).json()
    matched_task = [t for t in task_check if t["id"] == task_id][0]
    assert matched_task["status"] == "RESOLVED"

def test_deadline_warnings_alert(client, clerk_headers, leader_headers):
    """TC-FR6-01: Hệ thống tự động phát hiện văn bản quá hạn và sắp đến hạn."""
    # Tạo văn bản
    doc_res = client.post("/api/v1/documents", json={
        "document_number": "88/CV-GAP",
        "title": "Văn bản gấp",
        "document_scope": "EXTERNAL",
        "document_type": "INCOMING",
        "issued_date": "2026-03-20",
        "sender_org": "Sở",
        "recipient_org": "Cơ quan"
    }, headers=clerk_headers)
    doc_id = doc_res.json()["id"]

    # Gán deadline đã qua trong quá khứ (để test quá hạn)
    past_deadline = (datetime.now() - timedelta(days=1)).isoformat()
    client.post("/api/v1/tasks/assign", json={
        "document_id": doc_id,
        "assignee_id": 3,
        "instruction": "Xử lý gấp",
        "deadline": past_deadline
    }, headers=leader_headers)

    # Kiểm tra API cảnh báo hạn (FR6)
    alerts_res = client.get("/api/v1/tasks/alerts/deadline-warnings", headers=leader_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert alerts["overdue_count"] >= 1
    assert any(a["document_number"] == "88/CV-GAP" for a in alerts["overdue_tasks"])
