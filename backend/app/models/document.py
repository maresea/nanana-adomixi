from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_number = Column(String(50), nullable=False, index=True)
    title = Column(Text, nullable=False)
    document_scope = Column(String(20), nullable=False)  # EXTERNAL, INTERNAL
    document_type = Column(String(20), nullable=False)   # INCOMING, OUTGOING
    category = Column(String(100), nullable=True)        # Chỉ đạo điều hành, Tờ trình...
    issued_date = Column(Date, nullable=False, index=True)
    sender_org = Column(String(150), nullable=False)
    recipient_org = Column(String(150), nullable=False)
    urgency = Column(String(20), nullable=False, default="NORMAL") # NORMAL, URGENT, VERY_URGENT
    status = Column(String(20), nullable=False, default="RECEIVED", index=True) # RECEIVED, ASSIGNED, IN_PROGRESS, COMPLETED
    ai_summary = Column(Text, nullable=True)             # 3-5 ý tóm tắt do AI sinh
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Quan hệ
    attachments = relationship("Attachment", back_populates="document", cascade="all, delete-orphan")
    tasks = relationship("TaskAssignment", back_populates="document", cascade="all, delete-orphan")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    file_type = Column(String(20), nullable=False)       # .pdf, .docx
    extracted_text = Column(Text, nullable=True)         # Chữ thô trích xuất từ file
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Quan hệ
    document = relationship("Document", back_populates="attachments")
