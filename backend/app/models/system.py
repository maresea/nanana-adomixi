from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Quan hệ
    user = relationship("User", back_populates="notifications")

class AITaskLog(Base):
    __tablename__ = "ai_task_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_type = Column(String(50), nullable=False)       # EXTRACT, SUMMARIZE, CLASSIFY, DRAFT, OCR
    prompt_input = Column(Text, nullable=False)
    raw_response = Column(Text, nullable=False)
    latency_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
