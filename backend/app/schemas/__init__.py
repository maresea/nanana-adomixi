from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, AttachmentResponse
from app.schemas.task import TaskAssignCreate, TaskStatusUpdate, TaskResponse, DraftCreate, DraftResponseModel
from app.schemas.ai import MetadataDTO, ClassificationDTO, SummarizeRequest, DraftAIRequest
from app.schemas.statistics import DashboardStatsResponse

__all__ = [
    "LoginRequest", "TokenResponse", "UserResponse",
    "DocumentCreate", "DocumentUpdate", "DocumentResponse", "AttachmentResponse",
    "TaskAssignCreate", "TaskStatusUpdate", "TaskResponse", "DraftCreate", "DraftResponseModel",
    "MetadataDTO", "ClassificationDTO", "SummarizeRequest", "DraftAIRequest",
    "DashboardStatsResponse"
]
