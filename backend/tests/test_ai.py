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
    assert data["issued_date"] == "2026-03-25"
    assert "ỦY BAN NHÂN DÂN" in data["sender_org"].upper()

def test_ai_extract_metadata_alternative_date_and_org(client, clerk_headers):
    """TC-FR7-02: AI bóc tách định dạng ngày DD/MM/YYYY và cơ quan ngành dọc."""
    sample_text = (
        "VĂN PHÒNG CHÍNH PHỦ\n"
        "Số: 89/VPCP-KSTT\n"
        "Hà Nội, 15/04/2026\n\n"
        "V/v hướng dẫn chuẩn hóa quy trình phân công xử lý văn bản điện tử."
    )
    response = client.post("/api/v1/ai/extract-metadata", json={"document_text": sample_text}, headers=clerk_headers)
    assert response.status_code == 200
    data = response.json()
    assert "89" in data["document_number"]
    assert data["issued_date"] == "2026-04-15"
    assert "VĂN PHÒNG CHÍNH PHỦ" in data["sender_org"].upper()

def test_ai_summarize_document(client, leader_headers):
    """TC-FR8-01: AI tóm tắt văn bản thành 3-5 ý chính rõ ràng."""
    sample_text = (
        "Căn cứ Quyết định về chuyển đổi số quốc gia giai đoạn 2025-2030.\n"
        "Nội dung trọng tâm: Tăng cường rà soát an toàn thông tin cơ quan và hoàn thiện hồ sơ điện tử.\n"
        "Yêu cầu các đơn vị trực thuộc nộp báo cáo định kỳ trước ngày 30 hàng tháng.\n"
        "Thời hạn thực hiện: Nghiêm túc hoàn thành trước ngày 30/03/2026."
    )
    response = client.post("/api/v1/ai/summarize", json={"document_text": sample_text}, headers=leader_headers)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert len(data["summary"]) > 10
    assert "1." in data["summary"]

def test_ai_suggest_classification(client, clerk_headers):
    """TC-FR9-01: AI phân tích và gợi ý thể loại cùng độ khẩn."""
    # Test hỏa tốc
    sample_text_urgent = "Công văn HỎA TỐC: Đề nghị xử lý ngay sự cố bảo mật trong ngày hôm nay."
    response = client.post("/api/v1/ai/suggest-classification", json={"document_text": sample_text_urgent}, headers=clerk_headers)
    assert response.status_code == 200
    data = response.json()
    assert "category" in data
    assert data["urgency"] == "VERY_URGENT"

    # Test khẩn thông thường
    sample_text_normal_urgent = "Công văn KHẨN: Rà soát ngân sách kinh phí quyết toán quý 1."
    response2 = client.post("/api/v1/ai/suggest-classification", json={"document_text": sample_text_normal_urgent}, headers=clerk_headers)
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["urgency"] == "URGENT"
    assert "Tài chính" in data2["category"]

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
    assert "90%" in data["draft_content"]

def test_ai_parse_file_text(client, clerk_headers):
    """TC-AI-03: Trích xuất nội dung văn bản từ tệp đính kèm."""
    file_content = b"UY BAN NHAN DAN TINH\nSo: 77/UBND-TH\nNgay 18/03/2026\nV/v tap huan PCCC"
    files = {"file": ("van_ban_test.txt", file_content, "text/plain")}
    response = client.post("/api/v1/ai/parse-file", files=files, headers=clerk_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "van_ban_test.txt"
    assert "77/UBND-TH" in data["text"]

def test_ai_anti_hallucination_empty_text(client, clerk_headers, leader_headers, specialist_headers):
    """TC-AI-04: Kiểm tra chống bịa thông tin khi chuỗi đầu vào trống (bắt buộc báo lỗi 400)."""
    # 1. Trích xuất metadata
    r1 = client.post("/api/v1/ai/extract-metadata", json={"document_text": "   "}, headers=clerk_headers)
    assert r1.status_code == 400
    assert "không được để trống" in r1.json()["detail"]

    # 2. Tóm tắt
    r2 = client.post("/api/v1/ai/summarize", json={"document_text": "   "}, headers=leader_headers)
    assert r2.status_code == 400

    # 3. Soạn thảo phản hồi
    r3 = client.post("/api/v1/ai/generate-draft", json={"document_text": "   ", "instruction": "Đồng ý"}, headers=specialist_headers)
    assert r3.status_code == 400

def test_ai_internal_document_local_routing(client, db, clerk_headers, leader_headers, specialist_headers):
    """TC-AI-05: Công văn nội bộ bắt buộc định tuyến Local AI On-Premise (không gửi Cloud AI)."""
    from app.models.system import AITaskLog

    # 1. Trích xuất metadata với document_scope="INTERNAL"
    internal_doc = (
        "CƠ QUAN NỘI BỘ\n"
        "Số: 09/TB-NB\n"
        "Ngày 10 tháng 04 năm 2026\n\n"
        "V/v kế hoạch đánh giá thi đua nội bộ quý 2."
    )
    r1 = client.post(
        "/api/v1/ai/extract-metadata",
        json={"document_text": internal_doc, "document_scope": "INTERNAL"},
        headers=clerk_headers
    )
    assert r1.status_code == 200
    assert "09" in r1.json()["document_number"]

    # 2. Tóm tắt với is_internal=True
    r2 = client.post(
        "/api/v1/ai/summarize",
        json={"document_text": internal_doc, "is_internal": True},
        headers=leader_headers
    )
    assert r2.status_code == 200
    assert "summary" in r2.json()

    # 3. Soạn thảo phản hồi với từ khóa 'nội bộ' tự nhận diện
    r3 = client.post(
        "/api/v1/ai/generate-draft",
        json={
            "document_text": "THÔNG BÁO LƯU HÀNH NỘI BỘ: Đề nghị các phòng ban nộp hồ sơ quyết toán.",
            "instruction": "Phòng Kế toán tổng hợp trước ngày 20/04/2026."
        },
        headers=specialist_headers
    )
    assert r3.status_code == 200

    # 4. Kiểm tra trong cơ sở dữ liệu kiểm toán AITaskLog đã ghi nhận đúng cờ LOCAL
    logs = db.query(AITaskLog).order_by(AITaskLog.id.desc()).limit(3).all()
    logged_task_types = [l.task_type for l in logs]
    assert "EXTRACT_INTERNAL_LOCAL" in logged_task_types
    assert "SUMMARIZE_INTERNAL_LOCAL" in logged_task_types
    assert "DRAFT_INTERNAL_LOCAL" in logged_task_types


