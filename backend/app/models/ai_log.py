import uuid
from datetime import datetime
from sqlalchemy import Column, BigInteger, String, DateTime, ForeignKey, Text, JSON, Integer, Boolean
from app.core.database import Base

class AITaskLog(Base):
    __tablename__ = "ai_task_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(BigInteger, ForeignKey("documents.id"), nullable=True, index=True)
    triggered_by_user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    task_type = Column(String(50), nullable=False)  # OCR, METADATA_EXTRACTION, SUMMARIZATION, CLASSIFICATION, DRAFT_GENERATION
    ai_provider = Column(String(50), nullable=False)  # LOCAL_OLLAMA, LOCAL_VLLM, CLOUD_GEMINI, CLOUD_OPENAI
    model_name = Column(String(100), nullable=False)
    prompt_preview = Column(Text, nullable=True)
    result_data = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False, default="QUEUED", index=True)  # QUEUED, PROCESSING, SUCCESS, FAILED
    execution_time_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(BigInteger, ForeignKey("documents.id"), nullable=True)
    type = Column(String(50), nullable=False)  # APPROACHING_DEADLINE, OVERDUE, NEW_ASSIGNMENT, DRAFT_SUBMITTED, DRAFT_APPROVED, AI_READY
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

