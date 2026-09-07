from datetime import datetime
from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey, Text, Boolean, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    document_id = Column(BigInteger, ForeignKey("documents.id"), nullable=False, index=True)
    assigned_by_user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    assigned_to_user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    assigned_to_dept_id = Column(BigInteger, ForeignKey("departments.id"), nullable=True, index=True)
    directive_notes = Column(Text, nullable=False)  # Ý kiến chỉ đạo của Lãnh đạo
    deadline = Column(DateTime, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="ASSIGNED", index=True)
    # ASSIGNED, IN_PROGRESS, DRAFT_SUBMITTED, APPROVED, COMPLETED, OVERDUE

    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="assignments")
    assigned_by = relationship("User", foreign_keys=[assigned_by_user_id])
    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id])
    drafts = relationship("DraftResponse", back_populates="task_assignment", cascade="all, delete-orphan")


class DraftResponse(Base):
    __tablename__ = "draft_responses"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    document_id = Column(BigInteger, ForeignKey("documents.id"), nullable=False, index=True)
    task_assignment_id = Column(BigInteger, ForeignKey("task_assignments.id"), nullable=False, index=True)
    author_user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    is_ai_generated = Column(Boolean, default=True, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    status = Column(String(50), nullable=False, default="DRAFT")  # DRAFT, SUBMITTED, APPROVED, REJECTED
    leader_feedback = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    document = relationship("Document", back_populates="drafts")
    task_assignment = relationship("TaskAssignment", back_populates="drafts")
    author = relationship("User", foreign_keys=[author_user_id])

