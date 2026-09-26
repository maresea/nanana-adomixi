from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.auth import UserBrief

class DraftCreate(BaseModel):
    content: str
    is_ai_generated: bool = False

class DraftUpdate(BaseModel):
    content: str

class DraftApproval(BaseModel):
    is_approved: bool
    approval_note: Optional[str] = None

class DraftResponseModel(BaseModel):
    id: int
    task_id: int
    author_id: int
    author: Optional[UserBrief] = None
    content: str
    is_ai_generated: bool
    is_approved: bool
    approval_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskAssignCreate(BaseModel):
    document_id: int
    assignee_id: int
    instruction: Optional[str] = None
    deadline: datetime

class TaskStatusUpdate(BaseModel):
    status: str # ASSIGNED, PROCESSING, RESOLVED

class TaskResponse(BaseModel):
    id: int
    document_id: int
    assigner_id: int
    assignee_id: int
    instruction: Optional[str] = None
    deadline: datetime
    status: str
    created_at: datetime
    assigner: Optional[UserBrief] = None
    assignee: Optional[UserBrief] = None
    drafts: List[DraftResponseModel] = []

    class Config:
        from_attributes = True
