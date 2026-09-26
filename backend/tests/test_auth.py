def test_login_success(client):
    """TC-FR1-01: Đăng nhập thành công với tài khoản và mật khẩu đúng."""
    response = client.post("/api/v1/auth/login", json={"username": "vanthu", "password": "123456"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "vanthu"
    assert data["user"]["role"] == "CLERK"

def test_login_invalid_password(client):
    """TC-FR1-02: Đăng nhập thất bại khi nhập sai mật khẩu (HTTP 401)."""
    response = client.post("/api/v1/auth/login", json={"username": "vanthu", "password": "wrongpassword"})
    assert response.status_code == 401
    assert "không chính xác" in response.json()["detail"]

def test_get_me_unauthorized(client):
    """TC-FR1-03: Không có Token không được lấy thông tin cá nhân (HTTP 401)."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_get_me_authenticated(client, clerk_headers):
    """TC-FR1-04: Lấy thông tin cá nhân thành công khi có Token hợp lệ."""
    response = client.get("/api/v1/auth/me", headers=clerk_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "vanthu"
