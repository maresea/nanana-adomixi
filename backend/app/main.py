from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import Base, engine, SessionLocal
from app.routers import auth, documents, tasks, ai
from app.routers.auth import init_default_data_if_empty

# Khởi tạo các bảng trong CSDL
Base.metadata.create_all(bind=engine)

# Khởi tạo dữ liệu mẫu mặc định
with SessionLocal() as db:
    init_default_data_if_empty(db)

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    Hệ thống Quản lý Công văn và Văn bản nội bộ tích hợp AI dành cho Cơ quan Nhà nước.
    - Hỗ trợ 3 vai trò: Văn thư (CLERK), Lãnh đạo (LEADER), Chuyên viên (SPECIALIST).
    - Phân tách Frontend - Backend qua RESTful API chuẩn hóa.
    - Xử lý AI bất đồng bộ (Non-blocking): Tóm tắt 3-5 ý cốt lõi, gợi ý phân loại, sinh dự thảo công văn phản hồi.
    - Kiểm soát bảo mật đa tầng: RBAC + ABAC cô lập hoàn toàn tài liệu mật.
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Cấu hình CORS cho phép ứng dụng Frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production cấu hình domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các Router nghiệp vụ
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(tasks.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Hệ thống"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs": "/docs",
        "ai_provider": settings.AI_PROVIDER
    }

@app.get("/health", tags=["Hệ thống"])
def health_check():
    return {"status": "HEALTHY"}

