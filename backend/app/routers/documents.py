import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.core.config import settings
from app.models.document import Document, Attachment
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, AttachmentResponse
from app.dependencies import get_current_user, require_roles
from app.services.file_service import file_service

router = APIRouter(prefix="/documents", tags=["2. Quản lý Công văn & Tra cứu (FR2, FR5, FR12)"])

@router.post("", response_model=DocumentResponse, summary="Tiếp nhận & Vào sổ công văn mới (FR2)")
def create_document(
    doc_in: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["CLERK"]))
):
    doc = Document(
        document_number=doc_in.document_number,
        title=doc_in.title,
        document_scope=doc_in.document_scope,
        document_type=doc_in.document_type,
        category=doc_in.category,
        issued_date=doc_in.issued_date,
        sender_org=doc_in.sender_org,
        recipient_org=doc_in.recipient_org,
        urgency=doc_in.urgency,
        status="RECEIVED",
        ai_summary=doc_in.ai_summary
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/{doc_id}/attachments", response_model=AttachmentResponse, summary="Tải lên tệp đính kèm & Tự động trích xuất chữ (FR2, FR12)")
def upload_attachment(
    doc_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["CLERK"]))
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ công văn")

    # Lưu tệp demo vào thư mục uploads
    file_ext = os.path.splitext(file.filename)[1].lower()
    safe_filename = f"doc_{doc_id}_{int(os.times().system)}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    # Tự động trích xuất nội dung văn bản (FR12)
    extracted_text = file_service.extract_text(file_path)

    attachment = Attachment(
        document_id=doc_id,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        file_type=file_ext,
        extracted_text=extracted_text
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

@router.get("", response_model=List[DocumentResponse], summary="Tra cứu & Danh sách công văn theo bộ lọc (FR5)")
def list_documents(
    search: Optional[str] = Query(None, description="Tìm theo số ký hiệu hoặc trích yếu"),
    document_scope: Optional[str] = Query(None, description="EXTERNAL hoặc INTERNAL"),
    document_type: Optional[str] = Query(None, description="INCOMING hoặc OUTGOING"),
    urgency: Optional[str] = Query(None, description="NORMAL, URGENT, VERY_URGENT"),
    status: Optional[str] = Query(None, description="RECEIVED, ASSIGNED, IN_PROGRESS, COMPLETED"),
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Document)

    if search:
        query = query.filter((Document.document_number.ilike(f"%{search}%")) | (Document.title.ilike(f"%{search}%")))
    if document_scope:
        query = query.filter(Document.document_scope == document_scope.upper())
    if document_type:
        query = query.filter(Document.document_type == document_type.upper())
    if urgency:
        query = query.filter(Document.urgency == urgency.upper())
    if status:
        query = query.filter(Document.status == status.upper())
    if from_date:
        query = query.filter(Document.issued_date >= from_date)
    if to_date:
        query = query.filter(Document.issued_date <= to_date)

    return query.order_by(Document.created_at.desc()).all()

@router.get("/{doc_id}", response_model=DocumentResponse, summary="Xem chi tiết hồ sơ công văn (FR2)")
def get_document(doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ công văn")
    return doc

@router.patch("/{doc_id}", response_model=DocumentResponse, summary="Cập nhật thông tin / Tóm tắt AI cho công văn")
def update_document(
    doc_id: int,
    doc_in: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ sơ công văn")

    update_data = doc_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(doc, field, val)

    db.commit()
    db.refresh(doc)
    return doc
