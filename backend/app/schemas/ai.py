from pydantic import BaseModel
from typing import Optional
from datetime import date

class MetadataDTO(BaseModel):
    document_number: Optional[str] = None
    issued_date: Optional[str] = None
    sender_org: Optional[str] = None
    title: Optional[str] = None
    confidence_score: Optional[float] = 0.95

class ClassificationDTO(BaseModel):
    category: str
    urgency: str # NORMAL, URGENT, VERY_URGENT
    reasoning: Optional[str] = None

class SummarizeRequest(BaseModel):
    document_text: str
    document_scope: Optional[str] = "EXTERNAL"
    is_internal: Optional[bool] = False

class DraftAIRequest(BaseModel):
    document_text: str
    instruction: str
    document_scope: Optional[str] = "EXTERNAL"
    is_internal: Optional[bool] = False

class AIResponse(BaseModel):
    success: bool
    data: Optional[str] = None
    metadata: Optional[MetadataDTO] = None
    classification: Optional[ClassificationDTO] = None
    latency_ms: int = 0
