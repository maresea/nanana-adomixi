from app.routers.auth import router as auth_router
from app.routers.documents import router as documents_router
from app.routers.tasks import router as tasks_router
from app.routers.drafts import router as drafts_router
from app.routers.ai import router as ai_router
from app.routers.statistics import router as statistics_router

__all__ = [
    "auth_router",
    "documents_router",
    "tasks_router",
    "drafts_router",
    "ai_router",
    "statistics_router"
]
