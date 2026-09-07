from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class DocumentBase(BaseModel):
    document_code: str
    arrival_number: Optional[str] = None
    document_type: str = "INCOMING"
    issuance_date: date
    arrival_date: Optional[date] = None
    issuing_authority: str
    title: str
    category: Optional[str] = None
    urgency_level: str = "NORMAL"
    confidentiality_level: str = "NORMAL"
    department_id: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    document_code: Optional[str] = None
    arrival_number: Optional[str] = None
    issuance_date: Optional[date] = None
    issuing_authority: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    urgency_level: Optional[str] = None
    confidentiality_level: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[int] = None
    ocr_content: Optional[str] = None
    ai_summary: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    status: str
    file_path: str
    file_name: str
    file_size: int
    file_mime_type: str
    ocr_content: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_metadata: Optional[Dict[str, Any]] = None
    created_by_user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[DocumentResponse]

