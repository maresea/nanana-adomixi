from datetime import datetime, date
from sqlalchemy import Column, BigInteger, String, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    document_code = Column(String(100), nullable=False, index=True)  # Số ký hiệu (VD: 45/UBND-VP)
    arrival_number = Column(String(50), nullable=True, index=True)   # Số đến (VD: Đ-2026/012)
    document_type = Column(String(30), nullable=False, default="INCOMING")  # INCOMING, OUTGOING, INTERNAL
    issuance_date = Column(Date, nullable=False, default=date.today)
    arrival_date = Column(Date, nullable=False, default=date.today)
    issuing_authority = Column(String(255), nullable=False, index=True)  # Cơ quan ban hành
    title = Column(Text, nullable=False, index=True)  # Trích yếu nội dung
    category = Column(String(100), nullable=True)     # Danh mục phân loại
    urgency_level = Column(String(30), nullable=False, default="NORMAL")  # NORMAL, URGENT, TOP_URGENT
    confidentiality_level = Column(String(30), nullable=False, default="NORMAL")  # NORMAL, CONFIDENTIAL, SECRET
    status = Column(String(50), nullable=False, default="RECEIVED", index=True)
    # RECEIVED, PENDING_REVIEW, ASSIGNED, IN_PROGRESS, SUBMITTED, APPROVED, COMPLETED

    # Tệp đính kèm
    file_path = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(BigInteger, nullable=False, default=0)
    file_mime_type = Column(String(100), nullable=False, default="application/pdf")

    # Dữ liệu AI xử lý
    ocr_content = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)     # 3-5 ý cốt lõi
    ai_metadata = Column(JSON, nullable=True)    # JSON trích xuất

    # Phân quyền & Quản lý
    department_id = Column(BigInteger, ForeignKey("departments.id"), nullable=True, index=True)
    created_by_user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    creator = relationship("User", back_populates="created_documents")
    assignments = relationship("TaskAssignment", back_populates="document", cascade="all, delete-orphan")
    drafts = relationship("DraftResponse", back_populates="document", cascade="all, delete-orphan")

