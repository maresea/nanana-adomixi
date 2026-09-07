import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Kiểm tra endpoint sức khỏe hệ thống."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "HEALTHY"}


def test_auth_login():
    """Kiểm tra đăng nhập đúng vai trò Văn thư, Lãnh đạo, Chuyên viên."""
    # 1. Đăng nhập Văn thư
    resp_clerk = client.post("/api/v1/auth/login", json={"username": "vanthu_mai", "password": "Password@123"})
    assert resp_clerk.status_code == 200
    assert resp_clerk.json()["role"] == "CLERK"
    clerk_token = resp_clerk.json()["access_token"]

    # 2. Đăng nhập Lãnh đạo
    resp_leader = client.post("/api/v1/auth/login", json={"username": "lanhdao_hai", "password": "Password@123"})
    assert resp_leader.status_code == 200
    assert resp_leader.json()["role"] == "LEADER"

    # 3. Đăng nhập Chuyên viên
    resp_spec = client.post("/api/v1/auth/login", json={"username": "chuyenvien_nam", "password": "Password@123"})
    assert resp_spec.status_code == 200
    assert resp_spec.json()["role"] == "SPECIALIST"

    # 4. Kiểm tra xem profile /me
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {clerk_token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "vanthu_mai"


def test_document_lifecycle_and_abac():
    """
    Kiểm thử vòng đời công văn và kiểm soát phân quyền ABAC:
    1. Văn thư tiếp nhận công văn.
    2. Lãnh đạo xem và phân công cho Chuyên viên Nam.
    3. Chuyên viên Nam thấy công văn; Chuyên viên An (khác phòng, không được phân công) bị chặn ABAC.
    4. Chuyên viên Nam nộp dự thảo; Lãnh đạo duyệt dự thảo.
    """
    # Token Văn thư
    clerk_token = client.post("/api/v1/auth/login", json={"username": "vanthu_mai", "password": "Password@123"}).json()["access_token"]
    # Token Lãnh đạo
    leader_token = client.post("/api/v1/auth/login", json={"username": "lanhdao_hai", "password": "Password@123"}).json()["access_token"]
    # Token Chuyên viên Nam (Phòng Tài chính, id=4)
    nam_token = client.post("/api/v1/auth/login", json={"username": "chuyenvien_nam", "password": "Password@123"}).json()["access_token"]
    # Token Chuyên viên An (Phòng Đô thị, id=5)
    an_token = client.post("/api/v1/auth/login", json={"username": "chuyenvien_an", "password": "Password@123"}).json()["access_token"]

    # Bước 1: Văn thư tạo công văn đến
    doc_payload = {
        "document_code": "99/STC-HCSN",
        "title": "V/v hướng dẫn lập dự toán thu chi ngân sách năm 2027",
        "issuing_authority": "Sở Tài chính Thành phố",
        "issuance_date": "2026-07-28",
        "urgency_level": "URGENT",
        "confidentiality_level": "NORMAL",
        "department_id": 3 # Phòng Tài chính
    }
    create_resp = client.post(
        "/api/v1/documents",
        data=doc_payload,
        headers={"Authorization": f"Bearer {clerk_token}"}
    )
    assert create_resp.status_code == 201
    doc_id = create_resp.json()["id"]

    # Bước 2: Lãnh đạo chỉ đạo và giao việc cho Chuyên viên Nam (id=4)
    assign_payload = {
        "document_id": doc_id,
        "assigned_to_user_id": 4,
        "directive_notes": "Giao đ/c Nam rà soát số liệu và tổng hợp dự thảo trả lời trước ngày 30/7",
        "deadline": "2026-07-30T17:00:00"
    }
    assign_resp = client.post(
        "/api/v1/tasks/assign",
        json=assign_payload,
        headers={"Authorization": f"Bearer {leader_token}"}
    )
    assert assign_resp.status_code == 201
    task_id = assign_resp.json()["id"]

    # Bước 3: Kiểm tra ABAC
    # Chuyên viên Nam được giao -> Xem được (200)
    nam_view_resp = client.get(f"/api/v1/documents/{doc_id}", headers={"Authorization": f"Bearer {nam_token}"})
    assert nam_view_resp.status_code == 200

    # Bước 4: Chuyên viên Nam cập nhật trạng thái sang IN_PROGRESS và nộp dự thảo
    status_resp = client.patch(
        f"/api/v1/tasks/{task_id}/status",
        json={"status": "IN_PROGRESS"},
        headers={"Authorization": f"Bearer {nam_token}"}
    )
    assert status_resp.status_code == 200

    draft_payload = {
        "title": "Dự thảo Báo cáo dự toán ngân sách cơ quan năm 2027",
        "content": "Căn cứ công văn số 99/STC-HCSN... UBND báo cáo dự toán ngân sách...",
        "is_ai_generated": True
    }
    draft_resp = client.post(
        f"/api/v1/tasks/{task_id}/draft",
        json=draft_payload,
        headers={"Authorization": f"Bearer {nam_token}"}
    )
    assert draft_resp.status_code == 201
    draft_id = draft_resp.json()["id"]

    # Bước 5: Lãnh đạo phê duyệt dự thảo
    approve_resp = client.post(
        f"/api/v1/tasks/drafts/{draft_id}/approve?is_approved=true&feedback=Đồng ý ký ban hành",
        headers={"Authorization": f"Bearer {leader_token}"}
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"


def test_ai_summarize_service():
    """Kiểm tra API AI tóm tắt văn bản thông minh (3-5 ý cốt lõi)."""
    leader_token = client.post("/api/v1/auth/login", json={"username": "lanhdao_hai", "password": "Password@123"}).json()["access_token"]
    
    sample_doc_text = """
    ỦY BAN NHÂN DÂN THÀNH PHỐ HÀ NỘI
    Số: 456/UBND-TH
    Hà Nội, ngày 27 tháng 7 năm 2026

    Kính gửi: Các Sở, Ban, ngành và UBND các quận, huyện.

    Về việc tăng cường công tác chuyển đổi số và ứng dụng AI trong quản lý công văn nội bộ.
    UBND Thành phố yêu cầu Thủ trưởng các đơn vị khẩn trương triển khai:
    1. Triển khai số hóa 100% văn bản đến dạng scan/ảnh chụp thành văn bản số.
    2. Ứng dụng công nghệ xử lý ngôn ngữ tự nhiên để tóm tắt và tự động hóa soạn thảo văn bản phản hồi.
    3. Hoàn tất báo cáo kết quả thực hiện trước ngày 15/08/2026.
    """

    resp = client.post(
        "/api/v1/ai/summarize",
        json={"text_content": sample_doc_text, "is_confidential": False},
        headers={"Authorization": f"Bearer {leader_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["summary_points"]) >= 3
    assert any("Mục đích" in p or "mục đích" in p.lower() for p in data["summary_points"])


def test_task_assignment_permissions_and_deadlines():
    """Kiểm thử phân quyền giao việc: Chỉ Lãnh đạo mới có quyền phân công và đặt hạn chót."""
    clerk_token = client.post("/api/v1/auth/login", json={"username": "vanthu_mai", "password": "Password@123"}).json()["access_token"]
    leader_token = client.post("/api/v1/auth/login", json={"username": "lanhdao_hai", "password": "Password@123"}).json()["access_token"]
    spec_token = client.post("/api/v1/auth/login", json={"username": "chuyenvien_nam", "password": "Password@123"}).json()["access_token"]

    # Tạo công văn bởi Văn thư
    doc_resp = client.post(
        "/api/v1/documents",
        data={
            "document_code": "101/UBND-VP",
            "title": "Công văn phân công thẩm định dự án",
            "issuing_authority": "UBND Thành phố",
            "issuance_date": "2026-08-01",
            "urgency_level": "NORMAL",
            "confidentiality_level": "NORMAL",
            "department_id": 3
        },
        headers={"Authorization": f"Bearer {clerk_token}"}
    )
    doc_id = doc_resp.json()["id"]

    assign_payload = {
        "document_id": doc_id,
        "assigned_to_user_id": 4,
        "directive_notes": "Chuyên viên Nam thẩm định trước ngày 05/08",
        "deadline": "2026-08-05T17:00:00"
    }

    # Chuyên viên cố tình giao việc -> Bị chặn 403
    fail_spec_resp = client.post(
        "/api/v1/tasks/assign",
        json=assign_payload,
        headers={"Authorization": f"Bearer {spec_token}"}
    )
    assert fail_spec_resp.status_code == 403

    # Văn thư cố tình giao việc -> Bị chặn 403
    fail_clerk_resp = client.post(
        "/api/v1/tasks/assign",
        json=assign_payload,
        headers={"Authorization": f"Bearer {clerk_token}"}
    )
    assert fail_clerk_resp.status_code == 403

    # Lãnh đạo giao việc -> Thành công 201
    success_resp = client.post(
        "/api/v1/tasks/assign",
        json=assign_payload,
        headers={"Authorization": f"Bearer {leader_token}"}
    )
    assert success_resp.status_code == 201
    task_data = success_resp.json()
    assert task_data["status"] == "ASSIGNED"
    assert task_data["deadline"].startswith("2026-08-05")


def test_abac_cross_department_access_denied():
    """Kiểm thử bảo mật ABAC: Chuyên viên khác phòng ban không được phân công thì tuyệt đối không xem được."""
    clerk_token = client.post("/api/v1/auth/login", json={"username": "vanthu_mai", "password": "Password@123"}).json()["access_token"]
    an_token = client.post("/api/v1/auth/login", json={"username": "chuyenvien_an", "password": "Password@123"}).json()["access_token"]

    # Văn thư tạo công văn thuộc Phòng Tài chính (dept_id=3)
    doc_resp = client.post(
        "/api/v1/documents",
        data={
            "document_code": "202/STC-DT",
            "title": "Tài liệu mật nội bộ Phòng Tài chính",
            "issuing_authority": "Sở Tài chính",
            "issuance_date": "2026-08-02",
            "urgency_level": "NORMAL",
            "confidentiality_level": "CONFIDENTIAL",
            "department_id": 3
        },
        headers={"Authorization": f"Bearer {clerk_token}"}
    )
    doc_id = doc_resp.json()["id"]

    # Chuyên viên An (Phòng Đô thị - dept_id=4) cố tình truy cập văn bản -> Phải trả về 403 Forbidden
    forbidden_resp = client.get(
        f"/api/v1/documents/{doc_id}",
        headers={"Authorization": f"Bearer {an_token}"}
    )
    assert forbidden_resp.status_code == 403
    assert "không có thẩm quyền truy cập" in forbidden_resp.json()["detail"].lower()


def test_ai_classify_service():
    """Kiểm tra chức năng AI phân loại và gợi ý mức độ khẩn."""
    clerk_token = client.post("/api/v1/auth/login", json={"username": "vanthu_mai", "password": "Password@123"}).json()["access_token"]
    
    payload = {
        "text_content": "Tờ trình về việc phê duyệt quy hoạch chi tiết xây dựng đô thị tỷ lệ 1/500."
    }
    resp = client.post(
        "/api/v1/ai/classify",
        json=payload,
        headers={"Authorization": f"Bearer {clerk_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "category" in data
    assert "urgency_level" in data
    assert "recommended_dept_code" in data
    assert data["recommended_dept_code"] == "QLDT"


def test_ai_draft_generation():
    """Kiểm tra chức năng AI sinh văn bản dự thảo phản hồi chuẩn thể thức."""
    leader_token = client.post("/api/v1/auth/login", json={"username": "lanhdao_hai", "password": "Password@123"}).json()["access_token"]
    spec_token = client.post("/api/v1/auth/login", json={"username": "chuyenvien_nam", "password": "Password@123"}).json()["access_token"]

    # Lấy 1 công văn có sẵn
    docs_resp = client.get("/api/v1/documents", headers={"Authorization": f"Bearer {leader_token}"})
    doc_id = docs_resp.json()["items"][0]["id"]

    draft_req = {
        "document_id": doc_id,
        "directive_notes": "Đồng ý chủ trương, giao lập tờ trình hoàn tất trước ngày 10/8",
        "template_type": "CONG_VAN_TRA_LOI"
    }
    resp = client.post(
        "/api/v1/ai/generate-draft",
        json=draft_req,
        headers={"Authorization": f"Bearer {spec_token}"}
    )
    assert resp.status_code == 200
    draft_data = resp.json()
    assert "draft_title" in draft_data
    assert "draft_content" in draft_data
    assert "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" in draft_data["draft_content"]


def test_ai_async_summarization():
    """Kiểm tra luồng tóm tắt bất đồng bộ (Non-blocking HTTP 202)."""
    leader_token = client.post("/api/v1/auth/login", json={"username": "lanhdao_hai", "password": "Password@123"}).json()["access_token"]
    docs_resp = client.get("/api/v1/documents", headers={"Authorization": f"Bearer {leader_token}"})
    doc_id = docs_resp.json()["items"][0]["id"]

    async_req = {
        "document_id": doc_id,
        "text_content": "Nội dung tóm tắt thử nghiệm bất đồng bộ"
    }
    resp = client.post(
        "/api/v1/ai/summarize/async",
        json=async_req,
        headers={"Authorization": f"Bearer {leader_token}"}
    )
    assert resp.status_code == 202
    res_data = resp.json()
    assert res_data["status"] == "ACCEPTED"
    assert "task_id" in res_data

    # Kiểm tra endpoint tra cứu task status
    task_id = res_data["task_id"]
    status_resp = client.get(
        f"/api/v1/ai/tasks/{task_id}",
        headers={"Authorization": f"Bearer {leader_token}"}
    )
    assert status_resp.status_code == 200

