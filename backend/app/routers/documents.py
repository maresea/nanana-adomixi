import os
import shutil
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.config import settings
from app.core.database import get_db
from app.core.permissions import get_current_user, require_role, verify_document_permission
from app.models.user import User
from app.models.document import Document
from app.models.task import TaskAssignment
from app.schemas.document import DocumentResponse, DocumentListResponse, DocumentUpdate

router = APIRouter(prefix="/documents", tags=["Quản lý Công văn (Documents)"])

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    document_code: str = Form(..., description="Số hiệu văn bản gốc (VD: 123/UBND-VP)"),
    title: str = Form(..., description="Trích yếu nội dung công văn"),
    issuing_authority: str = Form(..., description="Cơ quan ban hành văn bản"),
    document_type: str = Form("INCOMING", description="Loại văn bản: INCOMING, OUTGOING, INTERNAL"),
    arrival_number: Optional[str] = Form(None, description="Số đến trong sổ"),
    issuance_date: str = Form(..., description="Ngày ban hành (YYYY-MM-DD)"),
    category: Optional[str] = Form(None, description="Lĩnh vực/phân loại"),
    urgency_level: str = Form("NORMAL", description="Độ khẩn: NORMAL, URGENT, TOP_URGENT"),
    confidentiality_level: str = Form("NORMAL", description="Độ mật: NORMAL, CONFIDENTIAL, SECRET"),
    department_id: Optional[int] = Form(None, description="Phòng ban thụ lý chính"),
    file: Optional[UploadFile] = File(None, description="Tệp scan/PDF đính kèm"),
    current_user: User = Depends(require_role(["CLERK", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Tiếp nhận và vào sổ công văn mới.
    Quyền thực hiện: Chỉ dành cho Văn thư (CLERK) hoặc Quản trị viên (ADMIN).
    """
    # Xử lý lưu trữ tệp tin
    saved_file_path = "uploads/default.pdf"
    file_name = "default.pdf"
    file_size = 0
    file_mime_type = "application/pdf"

    if file:
        file_name = file.filename
        file_mime_type = file.content_type or "application/octet-stream"
        sanitized_filename = f"{document_code.replace('/', '_')}_{file_name}"
        saved_file_path = os.path.join(settings.UPLOAD_DIR, sanitized_filename)
        
        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(saved_file_path)

    # Chuyển đổi ngày
    from datetime import datetime
    try:
        parsed_issuance_date = datetime.strptime(issuance_date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Định dạng ngày ban hành không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD."
        )

    new_doc = Document(
        document_code=document_code,
        arrival_number=arrival_number,
        document_type=document_type,
        issuance_date=parsed_issuance_date,
        issuing_authority=issuing_authority,
        title=title,
        category=category,
        urgency_level=urgency_level,
        confidentiality_level=confidentiality_level,
        status="RECEIVED",
        file_path=saved_file_path,
        file_name=file_name,
        file_size=file_size,
        file_mime_type=file_mime_type,
        department_id=department_id,
        created_by_user_id=current_user.id
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return new_doc


@router.get("", response_model=DocumentListResponse)
def get_documents(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Tìm kiếm theo số hiệu, trích yếu, cơ quan gửi"),
    status_filter: Optional[str] = Query(None, description="Lọc theo trạng thái"),
    urgency_filter: Optional[str] = Query(None, description="Lọc theo độ khẩn"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Tra cứu danh sách công văn kèm phân trang và kiểm soát phân quyền ABAC.
    - Lãnh đạo (LEADER) & Văn thư (CLERK): Xem toàn bộ công văn cơ quan.
    - Chuyên viên (SPECIALIST): Chỉ xem văn bản thuộc phòng ban của mình HOẶC được đích danh giao việc.
    """
    query = db.query(Document)
    user_role = current_user.role.code if current_user.role else ""

    # Áp dụng bộ lọc ABAC nếu là Chuyên viên
    if user_role == "SPECIALIST":
        assigned_doc_ids = db.query(TaskAssignment.document_id).filter(
            TaskAssignment.assigned_to_user_id == current_user.id
        ).subquery()

        query = query.filter(
            or_(
                Document.department_id == current_user.department_id,
                Document.id.in_(assigned_doc_ids)
            )
        )

    # Bộ lọc tìm kiếm
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Document.document_code.ilike(search_pattern),
                Document.title.ilike(search_pattern),
                Document.issuing_authority.ilike(search_pattern)
            )
        )

    if status_filter:
        query = query.filter(Document.status == status_filter)

    if urgency_filter:
        query = query.filter(Document.urgency_level == urgency_filter)

    total = query.count()
    items = query.order_by(desc(Document.issuance_date), desc(Document.id))\
                 .offset((page - 1) * size)\
                 .limit(size)\
                 .all()

    return DocumentListResponse(total=total, page=page, size=size, items=items)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document_by_id(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết một công văn (kiểm tra chặt chẽ quyền ABAC)."""
    return verify_document_permission(document_id, current_user, db)


@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    doc_update: DocumentUpdate,
    current_user: User = Depends(require_role(["CLERK", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Cập nhật thông tin công văn sau khi kiểm tra/đối soát AI.
    Quyền: Văn thư hoặc Quản trị viên.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy công văn.")

    update_data = doc_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(doc, field, value)

    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(require_role(["CLERK", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Xóa công văn chưa phân công."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy công văn.")

    # Kiểm tra xem đã có phân công chưa
    if doc.assignments:
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa công văn đã được phân công xử lý."
        )

    db.delete(doc)
    db.commit()
    return None

