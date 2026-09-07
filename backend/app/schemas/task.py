from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class TaskAssignCreate(BaseModel):
    document_id: int
    assigned_to_user_id: Optional[int] = None
    assigned_to_dept_id: Optional[int] = None
    directive_notes: str  # Ý kiến chỉ đạo của Lãnh đạo
    deadline: datetime    # Hạn xử lý

class TaskStatusUpdate(BaseModel):
    status: str  # ASSIGNED, IN_PROGRESS, DRAFT_SUBMITTED, COMPLETED

class TaskAssignmentResponse(BaseModel):
    id: int
    document_id: int
    assigned_by_user_id: int
    assigned_to_user_id: Optional[int] = None
    assigned_to_dept_id: Optional[int] = None
    directive_notes: str
    deadline: datetime
    status: str
    assigned_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DraftCreate(BaseModel):
    title: str
    content: str
    is_ai_generated: bool = False

class DraftUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None  # DRAFT, SUBMITTED, APPROVED, REJECTED
    leader_feedback: Optional[str] = None

class DraftResponseSchema(BaseModel):
    id: int
    document_id: int
    task_assignment_id: int
    author_user_id: int
    title: str
    content: str
    is_ai_generated: bool
    version: int
    status: str
    leader_feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

