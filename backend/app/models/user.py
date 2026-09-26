from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(20), nullable=False)  # CLERK, LEADER, SPECIALIST
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Quan hệ
    department = relationship("Department", back_populates="users")
    assigned_tasks = relationship("TaskAssignment", foreign_keys="TaskAssignment.assigner_id", back_populates="assigner")
    received_tasks = relationship("TaskAssignment", foreign_keys="TaskAssignment.assignee_id", back_populates="assignee")
    drafts = relationship("DraftResponse", back_populates="author")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
