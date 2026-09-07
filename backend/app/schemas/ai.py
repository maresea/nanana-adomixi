from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AISummaryRequest(BaseModel):
    document_id: Optional[int] = None
    text_content: Optional[str] = None
    is_confidential: bool = False

class AISummaryResponse(BaseModel):
    document_id: Optional[int] = None
    summary_points: List[str]  # Đúng 3-5 ý cốt lõi (Mục đích, Yêu cầu, Hạn chót)
    raw_summary: str
    provider_used: str
    model_name: str
    execution_time_ms: int

class AIClassifyRequest(BaseModel):
    document_id: Optional[int] = None
    text_content: Optional[str] = None

class AIClassifyResponse(BaseModel):
    category: str
    urgency_level: str
    recommended_dept_code: Optional[str] = None
    confidence_score: float

class AIDraftRequest(BaseModel):
    document_id: int
    task_assignment_id: int
    directive_notes: str
    template_type: Optional[str] = "CONG_VAN_TRA_LOI"  # Công văn trả lời, Tờ trình, Báo cáo

class AIDraftResponse(BaseModel):
    draft_title: str
    draft_content: str  # Chuẩn thể thức văn bản hành chính
    provider_used: str
    model_name: str

class AITaskStatusResponse(BaseModel):
    task_id: str
    status: str
    task_type: str
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

