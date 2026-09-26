def test_ai_extract_metadata(client, clerk_headers):
    """TC-FR7-01: AI tự động bóc tách số hiệu, ngày ban hành và trích yếu."""
    sample_text = (
        "ỦY BAN NHÂN DÂN TỈNH\n"
        "Số: 215/UBND-VX\n"
        "Ngày 25 tháng 03 năm 2026\n\n"
        "V/v phối hợp tổ chức hội thảo khoa học chuyển đổi số ngành hành chính công."
    )
    response = client.post("/api/v1/ai/extract-metadata", json={"document_text": sample_text}, headers=clerk_headers)
    assert response.status_code == 200
    data = response.json()
    assert "215" in data["document_number"]
    assert data["confidence_score"] >= 0.8

def test_ai_summarize_document(client, leader_headers):
    """TC-FR8-01: AI tóm tắt văn bản thành 3-5 ý chính rõ ràng."""
    sample_text = "Nội dung chỉ đạo rà soát an toàn thông tin cơ quan và hoàn thành báo cáo trước 30/03/2026."
    response = client.post("/api/v1/ai/summarize", json={"document_text": sample_text}, headers=leader_headers)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert len(data["summary"]) > 10

def test_ai_suggest_classification(client, clerk_headers):
    """TC-FR9-01: AI phân tích và gợi ý thể loại cùng độ khẩn."""
    sample_text = "Công văn HỎA TỐC: Đề nghị xử lý ngay sự cố bảo mật trong ngày hôm nay."
    response = client.post("/api/v1/ai/suggest-classification", json={"document_text": sample_text}, headers=clerk_headers)
    assert response.status_code == 200
    data = response.json()
    assert "category" in data
    assert data["urgency"] == "URGENT"

def test_ai_generate_draft(client, specialist_headers):
    """TC-FR10-01: AI sinh dự thảo phản hồi theo mẫu hành chính."""
    response = client.post("/api/v1/ai/generate-draft", json={
        "document_text": "V/v yêu cầu báo cáo tình hình ứng dụng công nghệ thông tin",
        "instruction": "Chuyên viên Nam báo cáo tiến độ đã đạt 90%."
    }, headers=specialist_headers)
    assert response.status_code == 200
    data = response.json()
    assert "draft_content" in data
    assert "Kính gửi" in data["draft_content"]

def test_ai_anti_hallucination_empty_text(client, clerk_headers):
    """TC-AI-04: Kiểm tra chống bịa thông tin khi chuỗi đầu vào trống (bắt buộc báo lỗi 400)."""
    response = client.post("/api/v1/ai/extract-metadata", json={"document_text": "   "}, headers=clerk_headers)
    assert response.status_code == 400
    assert "không được để trống" in response.json()["detail"]
