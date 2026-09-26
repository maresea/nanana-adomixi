from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class AttachmentResponse(BaseModel):
    id: int
    document_id: int
    file_name: str
    file_path: str
    file_size: int
    file_type: str
    extracted_text: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class DocumentCreate(BaseModel):
    document_number: str
    title: str
    document_scope: str = "EXTERNAL"   # EXTERNAL, INTERNAL
    document_type: str = "INCOMING"     # INCOMING, OUTGOING
    category: Optional[str] = None
    issued_date: date
    sender_org: str
    recipient_org: str
    urgency: str = "NORMAL"            # NORMAL, URGENT, VERY_URGENT
    ai_summary: Optional[str] = None

class DocumentUpdate(BaseModel):
    document_number: Optional[str] = None
    title: Optional[str] = None
    document_scope: Optional[str] = None
    document_type: Optional[str] = None
    category: Optional[str] = None
    issued_date: Optional[date] = None
    sender_org: Optional[str] = None
    recipient_org: Optional[str] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    ai_summary: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    document_number: str
    title: str
    document_scope: str
    document_type: str
    category: Optional[str] = None
    issued_date: date
    sender_org: str
    recipient_org: str
    urgency: str
    status: str
    ai_summary: Optional[str] = None
    created_at: datetime
    attachments: List[AttachmentResponse] = []

    class Config:
        from_attributes = True
