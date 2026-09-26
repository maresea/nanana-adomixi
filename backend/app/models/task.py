from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    assigner_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    instruction = Column(Text, nullable=True)            # Ý kiến chỉ đạo của Lãnh đạo
    deadline = Column(DateTime, nullable=False, index=True) # Hạn chót xử lý
    status = Column(String(20), nullable=False, default="ASSIGNED", index=True) # ASSIGNED, PROCESSING, RESOLVED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Quan hệ
    document = relationship("Document", back_populates="tasks")
    assigner = relationship("User", foreign_keys=[assigner_id], back_populates="assigned_tasks")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="received_tasks")
    drafts = relationship("DraftResponse", back_populates="task", cascade="all, delete-orphan")

class DraftResponse(Base):
    __tablename__ = "draft_responses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("task_assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    content = Column(Text, nullable=False)               # Nội dung dự thảo công văn phản hồi
    is_ai_generated = Column(Boolean, default=False, nullable=False) # Cờ đánh dấu có sự hỗ trợ của AI
    is_approved = Column(Boolean, default=False, nullable=False)     # Lãnh đạo phê duyệt
    approval_note = Column(Text, nullable=True)          # Nhận xét hoặc lý do trả về của Lãnh đạo
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Quan hệ
    task = relationship("TaskAssignment", back_populates="drafts")
    author = relationship("User", back_populates="drafts")
