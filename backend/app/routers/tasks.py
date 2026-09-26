from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.task import TaskAssignment
from app.models.document import Document
from app.models.user import User
from app.models.system import Notification
from app.schemas.task import TaskAssignCreate, TaskStatusUpdate, TaskResponse
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/tasks", tags=["3. Phân công & Nhắc hạn xử lý (FR3, FR4, FR6)"])

@router.post("/assign", response_model=TaskResponse, summary="Lãnh đạo phân công xử lý văn bản & Thiết lập hạn (FR3)")
def assign_task(
    task_in: TaskAssignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LEADER"]))
):
    doc = db.query(Document).filter(Document.id == task_in.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy văn bản để phân công")

    assignee = db.query(User).filter(User.id == task_in.assignee_id).first()
    if not assignee or assignee.role != "SPECIALIST":
        raise HTTPException(status_code=400, detail="Người được phân công phải là Chuyên viên xử lý")

    task = TaskAssignment(
        document_id=task_in.document_id,
        assigner_id=current_user.id,
        assignee_id=task_in.assignee_id,
        instruction=task_in.instruction,
        deadline=task_in.deadline,
        status="ASSIGNED"
    )
    db.add(task)

    # Cập nhật trạng thái công văn sang Đã phân công
    doc.status = "ASSIGNED"

    # Tạo thông báo tự động cho chuyên viên được phân công (FR6)
    notif = Notification(
        user_id=assignee.id,
        title=f"Phân công xử lý văn bản số {doc.document_number}",
        content=f"Lãnh đạo {current_user.full_name} đã giao nhiệm vụ xử lý công văn: '{doc.title}'. Hạn chót: {task_in.deadline.strftime('%d/%m/%Y %H:%M')}"
    )
    db.add(notif)

    db.commit()
    db.refresh(task)
    return task

@router.get("", response_model=List[TaskResponse], summary="Xem danh sách nhiệm vụ phân công (FR3, FR4)")
def list_tasks(
    document_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TaskAssignment)

    # Nếu là chuyên viên, chỉ thấy nhiệm vụ được giao cho mình
    if current_user.role == "SPECIALIST":
        query = query.filter(TaskAssignment.assignee_id == current_user.id)
    elif current_user.role == "LEADER":
        pass # Lãnh đạo xem toàn bộ nhiệm vụ

    if document_id:
        query = query.filter(TaskAssignment.document_id == document_id)
    if status_filter:
        query = query.filter(TaskAssignment.status == status_filter.upper())

    return query.order_by(TaskAssignment.created_at.desc()).all()

@router.patch("/{task_id}/status", response_model=TaskResponse, summary="Chuyên viên cập nhật tiến độ xử lý (FR4)")
def update_task_status(
    task_id: int,
    status_in: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SPECIALIST", "LEADER"]))
):
    task = db.query(TaskAssignment).filter(TaskAssignment.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")

    if current_user.role == "SPECIALIST" and task.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không được phép cập nhật nhiệm vụ của chuyên viên khác")

    task.status = status_in.status.upper()

    # Cập nhật tương ứng cho trạng thái chung của công văn
    doc = db.query(Document).filter(Document.id == task.document_id).first()
    if doc:
        if task.status == "PROCESSING":
            doc.status = "IN_PROGRESS"
        elif task.status == "RESOLVED":
            doc.status = "COMPLETED"

    db.commit()
    db.refresh(task)
    return task

@router.get("/alerts/deadline-warnings", summary="Nhắc nhở văn bản sắp đến hạn và quá hạn (FR6)")
def get_deadline_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    query = db.query(TaskAssignment).filter(TaskAssignment.status != "RESOLVED")

    if current_user.role == "SPECIALIST":
        query = query.filter(TaskAssignment.assignee_id == current_user.id)

    tasks = query.all()
    overdue = []
    due_soon = []

    for t in tasks:
        diff_hours = (t.deadline - now).total_seconds() / 3600
        item = {
            "task_id": t.id,
            "document_id": t.document_id,
            "document_number": t.document.document_number if t.document else "",
            "document_title": t.document.title if t.document else "",
            "deadline": t.deadline,
            "assignee_name": t.assignee.full_name if t.assignee else "",
            "hours_remaining": round(diff_hours, 1)
        }
        if diff_hours < 0:
            overdue.append(item)
        elif diff_hours <= 48: # Sắp đến hạn trong 48h
            due_soon.append(item)

    return {
        "overdue_count": len(overdue),
        "due_soon_count": len(due_soon),
        "overdue_tasks": overdue,
        "due_soon_tasks": due_soon
    }
