from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse, UserBrief
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["1. Xác thực & Phân quyền (FR1)"])

@router.post("/login", response_model=TokenResponse, summary="Đăng nhập hệ thống")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản cán bộ đã bị vô hiệu hóa"
        )
    
    access_token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse, summary="Lấy thông tin người dùng hiện tại")
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[UserBrief], summary="Danh sách cán bộ theo vai trò (để phân công)")
def list_users(role: str = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(User).filter(User.is_active == True)
    if role:
        query = query.filter(User.role == role.upper())
    return query.all()
