from app.schemas.auth import LoginRequest, Token, TokenPayload, UserResponse, UserCreate
from app.schemas.document import DocumentBase, DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse
from app.schemas.task import TaskAssignCreate, TaskStatusUpdate, TaskAssignmentResponse, DraftCreate, DraftUpdate, DraftResponseSchema
from app.schemas.ai import AISummaryRequest, AISummaryResponse, AIClassifyRequest, AIClassifyResponse, AIDraftRequest, AIDraftResponse, AITaskStatusResponse

__all__ = [
    "LoginRequest", "Token", "TokenPayload", "UserResponse", "UserCreate",
    "DocumentBase", "DocumentCreate", "DocumentUpdate", "DocumentResponse", "DocumentListResponse",
    "TaskAssignCreate", "TaskStatusUpdate", "TaskAssignmentResponse", "DraftCreate", "DraftUpdate", "DraftResponseSchema",
    "AISummaryRequest", "AISummaryResponse", "AIClassifyRequest", "AIClassifyResponse", "AIDraftRequest", "AIDraftResponse", "AITaskStatusResponse"
]

