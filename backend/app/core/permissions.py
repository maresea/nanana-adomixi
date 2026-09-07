from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.document import Document
from app.models.task import TaskAssignment

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency trích xuất và xác thực người dùng hiện tại từ JWT Token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Phiên làm việc không hợp lệ hoặc đã hết hạn.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
        
    username: Optional[str] = payload.get("sub")
    if not username:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not user:
        raise credentials_exception
        
    return user


def require_role(allowed_roles: List[str]):
    """
    Middleware/Dependency kiểm tra RBAC theo vai trò người dùng.
    Ví dụ: Depends(require_role(["CLERK"]))
           Depends(require_role(["LEADER", "ADMIN"]))
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_code = current_user.role.code if current_user.role else ""
        if user_role_code not in allowed_roles and user_role_code != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Quyền truy cập bị từ chối. Chức năng yêu cầu vai trò: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


def check_document_access(document: Document, user: User, db: Session) -> bool:
    """
    Kiểm tra quyền truy cập dữ liệu văn bản theo nguyên tắc ABAC:
    'Văn bản giao cho ai/phòng nào thì chỉ người đó/phòng đó có quyền truy cập'.
    - Lãnh đạo (LEADER), Văn thư (CLERK), Quản trị (ADMIN) có quyền xem toàn diện.
    - Chuyên viên (SPECIALIST) chỉ xem nếu thuộc phòng ban phụ trách HOẶC được đích danh giao việc.
    """
    role_code = user.role.code if user.role else ""
    
    # Lãnh đạo, Văn thư và Admin được phép xem
    if role_code in ["LEADER", "CLERK", "ADMIN"]:
        return True
        
    # Chuyên viên: Kiểm tra phòng ban
    if document.department_id and document.department_id == user.department_id:
        return True
        
    # Chuyên viên: Kiểm tra nhiệm vụ được đích danh phân công
    has_assignment = db.query(TaskAssignment).filter(
        TaskAssignment.document_id == document.id,
        TaskAssignment.assigned_to_user_id == user.id
    ).first()
    
    if has_assignment:
        return True
        
    return False


def verify_document_permission(
    document_id: int,
    user: User,
    db: Session
) -> Document:
    """Hàm tiện ích tra cứu văn bản và kiểm tra phân quyền ABAC, ném lỗi 403/404 nếu vi phạm."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy công văn với mã định danh #{document_id}"
        )
        
    if not check_document_access(doc, user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có thẩm quyền truy cập văn bản này (Bảo mật nội bộ)."
        )
        
    return doc

