from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.permissions import get_current_user
from app.models.user import User, Role, Department
from app.schemas.auth import LoginRequest, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Xác thực & Người dùng (Authentication)"])

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Đăng nhập hệ thống bằng Tên đăng nhập và Mật khẩu.
    Trả về Bearer JWT Token kèm thông tin Vai trò (Role).
    """
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị tạm khóa bởi quản trị viên."
        )

    role_code = user.role.code if user.role else "SPECIALIST"

    token_payload = {
        "sub": user.username,
        "user_id": user.id,
        "role": role_code,
        "department_id": user.department_id,
        "full_name": user.full_name
    }

    access_token = create_access_token(data=token_payload)

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=role_code,
        user_id=user.id,
        full_name=user.full_name,
        department_id=user.department_id
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Lấy thông tin tài khoản đang đăng nhập hiện tại."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        department_id=current_user.department_id,
        role_id=current_user.role_id,
        role_code=current_user.role.code if current_user.role else None,
        department_name=current_user.department.name if current_user.department else None,
        is_active=current_user.is_active
    )


def init_default_data_if_empty(db: Session):
    """Khởi tạo dữ liệu mẫu nếu CSDL hoàn toàn mới."""
    if db.query(Role).count() == 0:
        # Seed Roles
        roles_data = [
            Role(id=1, code="ADMIN", name="Quản trị hệ thống", description="Quản trị toàn quyền"),
            Role(id=2, code="CLERK", name="Văn thư cơ quan", description="Tiếp nhận, OCR, vào sổ"),
            Role(id=3, code="LEADER", name="Lãnh đạo cơ quan", description="Đọc tóm tắt AI, chỉ đạo, giao việc"),
            Role(id=4, code="SPECIALIST", name="Chuyên viên xử lý", description="Thụ lý công việc, sinh dự thảo AI")
        ]
        db.add_all(roles_data)
        db.commit()

    if db.query(Department).count() == 0:
        # Seed Departments
        depts_data = [
            Department(id=1, code="BGD", name="Ban Giám đốc", is_active=True),
            Department(id=2, code="VP", name="Văn phòng cơ quan", parent_id=1, is_active=True),
            Department(id=3, code="TCKH", name="Phòng Tài chính - Kế hoạch", parent_id=1, is_active=True),
            Department(id=4, code="QLDT", name="Phòng Quản lý Đô thị", parent_id=1, is_active=True)
        ]
        db.add_all(depts_data)
        db.commit()

    if db.query(User).count() == 0:
        default_pwd = get_password_hash("Password@123")
        users_data = [
            User(username="admin", email="admin@agency.gov.vn", password_hash=default_pwd, full_name="Quản trị viên", department_id=2, role_id=1),
            User(username="vanthu_mai", email="vanthu@agency.gov.vn", password_hash=default_pwd, full_name="Nguyễn Thị Mai (Văn thư)", department_id=2, role_id=2),
            User(username="lanhdao_hai", email="lanhdao@agency.gov.vn", password_hash=default_pwd, full_name="Trần Văn Hải (Giám đốc)", department_id=1, role_id=3),
            User(username="chuyenvien_nam", email="nam.tc@agency.gov.vn", password_hash=default_pwd, full_name="Lê Hoàng Nam (Chuyên viên Tài chính)", department_id=3, role_id=4),
            User(username="chuyenvien_an", email="an.dt@agency.gov.vn", password_hash=default_pwd, full_name="Phạm Quốc An (Chuyên viên Đô thị)", department_id=4, role_id=4)
        ]
        db.add_all(users_data)
        db.commit()

