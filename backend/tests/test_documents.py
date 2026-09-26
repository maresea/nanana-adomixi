def test_create_document_clerk_success(client, clerk_headers):
    """TC-FR2-01: Văn thư tiếp nhận và vào sổ công văn mới thành công."""
    payload = {
        "document_number": "55/UBND-VX",
        "title": "V/v tăng cường an toàn dữ liệu công văn",
        "document_scope": "EXTERNAL",
        "document_type": "INCOMING",
        "category": "Chỉ đạo điều hành",
        "issued_date": "2026-03-24",
        "sender_org": "Ủy ban nhân dân Tỉnh",
        "recipient_org": "Văn phòng Cơ quan",
        "urgency": "URGENT"
    }
    response = client.post("/api/v1/documents", json=payload, headers=clerk_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] is not None
    assert data["document_number"] == "55/UBND-VX"
    assert data["status"] == "RECEIVED"

def test_search_and_filter_documents(client, clerk_headers):
    """TC-FR5-01: Tra cứu công văn theo số ký hiệu và bộ lọc trạng thái."""
    # Tạo 2 văn bản
    client.post("/api/v1/documents", json={
        "document_number": "101/STC",
        "title": "Hướng dẫn tài chính",
        "document_scope": "EXTERNAL",
        "document_type": "INCOMING",
        "issued_date": "2026-03-20",
        "sender_org": "Sở Tài chính",
        "recipient_org": "Cơ quan",
        "urgency": "NORMAL"
    }, headers=clerk_headers)

    client.post("/api/v1/documents", json={
        "document_number": "202/UBND",
        "title": "Báo cáo nội bộ",
        "document_scope": "INTERNAL",
        "document_type": "OUTGOING",
        "issued_date": "2026-03-21",
        "sender_org": "Cơ quan",
        "recipient_org": "UBND",
        "urgency": "URGENT"
    }, headers=clerk_headers)

    # 1. Tìm theo số hiệu
    res_search = client.get("/api/v1/documents?search=101", headers=clerk_headers)
    assert res_search.status_code == 200
    docs = res_search.json()
    assert len(docs) == 1
    assert docs[0]["document_number"] == "101/STC"

    # 2. Lọc theo phạm vi INTERNAL
    res_scope = client.get("/api/v1/documents?document_scope=INTERNAL", headers=clerk_headers)
    assert res_scope.status_code == 200
    assert len(res_scope.json()) == 1
    assert res_scope.json()[0]["document_number"] == "202/UBND"
