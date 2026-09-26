def test_specialist_cannot_create_document(client, specialist_headers):
    """NFR1-01: Chuyên viên không được phép tạo văn bản (chỉ Văn thư)."""
    payload = {
        "document_number": "99/TEST-SECURITY",
        "title": "Vượt quyền",
        "document_scope": "INTERNAL",
        "document_type": "INCOMING",
        "issued_date": "2026-03-24",
        "sender_org": "Test",
        "recipient_org": "Test"
    }
    response = client.post("/api/v1/documents", json=payload, headers=specialist_headers)
    assert response.status_code == 403
    assert "bị từ chối" in response.json()["detail"]

def test_clerk_cannot_assign_task(client, clerk_headers):
    """NFR1-02: Văn thư không được phép phân công nhiệm vụ (chỉ Lãnh đạo)."""
    payload = {
        "document_id": 1,
        "assignee_id": 3,
        "instruction": "Văn thư tự phân công trái quyền",
        "deadline": "2026-03-30T17:00:00"
    }
    response = client.post("/api/v1/tasks/assign", json=payload, headers=clerk_headers)
    assert response.status_code == 403
    assert "bị từ chối" in response.json()["detail"]

def test_clerk_cannot_approve_draft(client, clerk_headers):
    """NFR1-03: Văn thư không được phép phê duyệt dự thảo (chỉ Lãnh đạo)."""
    response = client.post("/api/v1/drafts/1/approve", json={"is_approved": True}, headers=clerk_headers)
    assert response.status_code == 403
    assert "bị từ chối" in response.json()["detail"]

def test_specialist_cannot_access_leader_dashboard(client, specialist_headers):
    """NFR1-04: Chuyên viên không được xem Dashboard thống kê của Lãnh đạo."""
    response = client.get("/api/v1/statistics/dashboard", headers=specialist_headers)
    assert response.status_code == 403
    assert "bị từ chối" in response.json()["detail"]
