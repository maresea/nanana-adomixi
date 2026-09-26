from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models.document import Document
from app.models.task import TaskAssignment
from app.models.department import Department
from app.models.user import User
from app.schemas.statistics import DashboardStatsResponse, DepartmentStat
from app.dependencies import require_roles

router = APIRouter(prefix="/statistics", tags=["6. Báo cáo Thống kê & Dashboard (FR11)"])

@router.get("/dashboard", response_model=DashboardStatsResponse, summary="Thống kê tổng quan tình hình công văn & tiến độ xử lý (FR11)")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LEADER"]))
):
    now = datetime.now()

    # Thống kê công văn theo chiều luân chuyển
    total_docs = db.query(Document).count()
    incoming = db.query(Document).filter(Document.document_type == "INCOMING").count()
    outgoing = db.query(Document).filter(Document.document_type == "OUTGOING").count()
    internal = db.query(Document).filter(Document.document_scope == "INTERNAL").count()

    # Thống kê nhiệm vụ phân công
    pending = db.query(TaskAssignment).filter(TaskAssignment.status == "ASSIGNED").count()
    completed = db.query(TaskAssignment).filter(TaskAssignment.status == "RESOLVED").count()
    
    # Nhiệm vụ quá hạn (chưa hoàn thành và deadline < hiện tại)
    overdue = db.query(TaskAssignment).filter(
        TaskAssignment.status != "RESOLVED",
        TaskAssignment.deadline < now
    ).count()

    # Thống kê theo phòng ban
    dept_stats = []
    departments = db.query(Department).all()
    for d in departments:
        # Đếm số nhiệm vụ của nhân sự thuộc phòng này
        user_ids = [u.id for u in d.users]
        dept_overdue = db.query(TaskAssignment).filter(
            TaskAssignment.assignee_id.in_(user_ids),
            TaskAssignment.status != "RESOLVED",
            TaskAssignment.deadline < now
        ).count() if user_ids else 0

        dept_stats.append(DepartmentStat(
            department_name=d.name,
            total_documents=len(user_ids), # Số cán bộ phụ trách
            overdue_tasks=dept_overdue
        ))

    return DashboardStatsResponse(
        total_documents=total_docs,
        incoming_count=incoming,
        outgoing_count=outgoing,
        internal_count=internal,
        pending_tasks=pending,
        overdue_tasks=overdue,
        completed_tasks=completed,
        department_stats=dept_stats
    )
