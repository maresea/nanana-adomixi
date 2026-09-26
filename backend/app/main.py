import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models import Department, User, Document, TaskAssignment, DraftResponse, Notification
from datetime import datetime, date, timedelta
from app.routers import (
    auth_router,
    documents_router,
    tasks_router,
    drafts_router,
    ai_router,
    statistics_router
)

def init_seed_data():
    """Tự động nạp dữ liệu mẫu ban đầu nếu CSDL mới tinh (không cần chạy script thủ công)."""
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            print("🚀 CSDL trống! Đang tự động nạp dữ liệu khởi tạo...")
            # 1. Tạo phòng ban
            dept1 = Department(id=1, code="VPCQ", name="Văn phòng Cơ quan")
            dept2 = Department(id=2, code="PKHTC", name="Phòng Kế hoạch - Tài chính")
            dept3 = Department(id=3, code="PCNTT", name="Phòng Công nghệ Thông tin")
            db.add_all([dept1, dept2, dept3])
            db.commit()

            # 2. Tạo 3 người dùng tương ứng 3 vai trò (Mật khẩu: 123456)
            hashed_pw = get_password_hash("123456")
            user_clerk = User(
                id=1, username="vanthu", password_hash=hashed_pw,
                full_name="Nguyễn Thị Mai", email="vanthu@coquan.gov.vn",
                role="CLERK", department_id=1, is_active=True
            )
            user_leader = User(
                id=2, username="lanhdao", password_hash=hashed_pw,
                full_name="Trần Văn Hùng", email="lanhdao@coquan.gov.vn",
                role="LEADER", department_id=1, is_active=True
            )
            user_specialist = User(
                id=3, username="chuyenvien", password_hash=hashed_pw,
                full_name="Lê Hoàng Nam", email="chuyenvien@coquan.gov.vn",
                role="SPECIALIST", department_id=2, is_active=True
            )
            db.add_all([user_clerk, user_leader, user_specialist])
            db.commit()

            # 3. Tạo công văn mẫu
            doc1 = Document(
                id=1,
                document_number="125/UBND-VX",
                title="V/v phối hợp triển khai công tác chuyển đổi số và bảo đảm an toàn thông tin năm 2026",
                document_scope="EXTERNAL",
                document_type="INCOMING",
                category="Chỉ đạo điều hành",
                issued_date=date(2026, 3, 10),
                sender_org="Ủy ban nhân dân Tỉnh",
                recipient_org="Văn phòng Cơ quan",
                urgency="URGENT",
                status="ASSIGNED",
                ai_summary="1. Đẩy nhanh tiến độ số hóa hồ sơ công văn.\n2. Rà soát phương án an toàn thông tin cơ quan.\n3. Hoàn thành báo cáo trước ngày 30/03/2026."
            )
            doc2 = Document(
                id=2,
                document_number="45/CV-PKHTC",
                title="Tờ trình về việc phân bổ dự toán kinh phí nâng cấp hạ tầng công nghệ thông tin quý II/2026",
                document_scope="INTERNAL",
                document_type="OUTGOING",
                category="Tờ trình",
                issued_date=date(2026, 3, 15),
                sender_org="Phòng Kế hoạch - Tài chính",
                recipient_org="Ban Lãnh đạo",
                urgency="NORMAL",
                status="IN_PROGRESS",
                ai_summary="Đề xuất phê duyệt kinh phí 150 triệu đồng để nâng cấp hệ thống máy chủ và thiết bị số hóa."
            )
            doc3 = Document(
                id=3,
                document_number="88/STC-HCSN",
                title="V/v hướng dẫn quyết toán kinh phí các nhiệm vụ ứng dụng công nghệ thông tin",
                document_scope="EXTERNAL",
                document_type="INCOMING",
                category="Hướng dẫn",
                issued_date=date(2026, 3, 20),
                sender_org="Sở Tài chính",
                recipient_org="Phòng Kế hoạch - Tài chính",
                urgency="NORMAL",
                status="RECEIVED"
            )
            db.add_all([doc1, doc2, doc3])
            db.commit()

            # 4. Phân công xử lý nhiệm vụ
            task1 = TaskAssignment(
                id=1,
                document_id=1,
                assigner_id=2,
                assignee_id=3,
                instruction="Chuyên viên Nam chủ trì rà soát hiện trạng an toàn thông tin và soạn thảo văn bản phản hồi UBND Tỉnh đúng hạn.",
                deadline=datetime.now() + timedelta(days=2),
                status="PROCESSING"
            )
            db.add(task1)
            db.commit()

            # 5. Dự thảo phản hồi
            draft1 = DraftResponse(
                id=1,
                task_id=1,
                author_id=3,
                content="Kính gửi: Ủy ban nhân dân Tỉnh.\n\nCơ quan kính báo cáo tình hình triển khai công tác chuyển đổi số và an toàn thông tin như sau:\n1. Đã triển khai số hóa 100% hồ sơ công văn tiếp nhận.\n2. Ban hành quy chế bảo đảm an toàn dữ liệu nội bộ.\n\nKính trình Lãnh đạo phê duyệt.",
                is_ai_generated=True,
                is_approved=False
            )
            db.add(draft1)

            # 6. Thông báo cảnh báo hạn
            notif1 = Notification(
                id=1,
                user_id=3,
                title="Nhắc nhở hạn xử lý công văn số 125/UBND-VX",
                content="Nhiệm vụ xử lý công văn 125/UBND-VX sắp đến hạn chót. Vui lòng hoàn tất dự thảo phản hồi.",
                is_read=False
            )
            db.add(notif1)
            db.commit()
            print("✅ Đã nạp thành công dữ liệu khởi tạo!")
    except Exception as e:
        print(f"Lỗi khởi tạo dữ liệu: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo bảng cơ sở dữ liệu
    Base.metadata.create_all(bind=engine)
    init_seed_data()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API phục vụ Hệ thống Quản lý Công văn và Văn bản Nội bộ Tích hợp AI (Bám sát 12 FR và 3 vai trò).",
    version="1.0.0",
    lifespan=lifespan
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn thư mục uploads phục vụ tải file đính kèm demo
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Đăng ký các router nghiệp vụ
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router, prefix=settings.API_V1_STR)
app.include_router(drafts_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(statistics_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Hệ thống"])
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR
    }
