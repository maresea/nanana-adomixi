from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import get_current_user, require_role
from app.models.user import User
from app.models.document import Document
from app.models.task import TaskAssignment, DraftResponse
from app.models.ai_log import Notification
from app.schemas.task import (
    TaskAssignCreate,
    TaskStatusUpdate,
    TaskAssignmentResponse,
    DraftCreate,
    DraftResponseSchema
)

router = APIRouter(prefix="/tasks", tags=["Phân công & Xử lý công việc (Task Management)"])

@router.post("/assign", response_model=TaskAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_task(
    assign_data: TaskAssignCreate,
    current_user: User = Depends(require_role(["LEADER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Lãnh đạo (LEADER) giao việc cho Chuyên viên / Phòng ban:
    - Nhập ý kiến chỉ đạo vắn tắt.
    - Thiết lập thời hạn chót giải quyết (Deadline).
    - Cập nhật trạng thái công văn sang 'ASSIGNED'.
    """
    doc = db.query(Document).filter(Document.id == assign_data.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy công văn để giao việc.")

    # Tạo bản ghi phân công
    new_assignment = TaskAssignment(
        document_id=assign_data.document_id,
        assigned_by_user_id=current_user.id,
        assigned_to_user_id=assign_data.assigned_to_user_id,
        assigned_to_dept_id=assign_data.assigned_to_dept_id or doc.department_id,
        directive_notes=assign_data.directive_notes,
        deadline=assign_data.deadline,
        status="ASSIGNED",
        assigned_at=datetime.utcnow()
    )

    # Cập nhật trạng thái của công văn
    doc.status = "ASSIGNED"
    if assign_data.assigned_to_dept_id:
        doc.department_id = assign_data.assigned_to_dept_id

    # Tạo thông báo đến chuyên viên
    if assign_data.assigned_to_user_id:
        notif = Notification(
            user_id=assign_data.assigned_to_user_id,
            document_id=doc.id,
            type="NEW_ASSIGNMENT",
            title=f"Nhiệm vụ mới: {doc.document_code}",
            message=f"Lãnh đạo {current_user.full_name} đã giao bạn xử lý công văn: {doc.title}. Hạn chót: {assign_data.deadline.strftime('%d/%m/%Y')}."
        )
        db.add(notif)

    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return new_assignment


@router.get("/my-tasks", response_model=List[TaskAssignmentResponse])
def get_my_tasks(
    current_user: User = Depends(require_role(["SPECIALIST", "LEADER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách các công việc được giao cho Chuyên viên đang đăng nhập."""
    tasks = db.query(TaskAssignment)\
              .filter(TaskAssignment.assigned_to_user_id == current_user.id)\
              .order_by(TaskAssignment.deadline.asc())\
              .all()
    return tasks


@router.patch("/{task_id}/status", response_model=TaskAssignmentResponse)
def update_task_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chuyên viên hoặc Lãnh đạo cập nhật trạng thái xử lý nhiệm vụ:
    - ASSIGNED -> IN_PROGRESS -> DRAFT_SUBMITTED -> COMPLETED
    """
    task = db.query(TaskAssignment).filter(TaskAssignment.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ phân công.")

    # Kiểm tra quyền: chỉ người được giao hoặc người giao việc mới được cập nhật
    user_role = current_user.role.code if current_user.role else ""
    if task.assigned_to_user_id != current_user.id and user_role not in ["LEADER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền cập nhật trạng thái nhiệm vụ này.")

    task.status = status_data.status
    if status_data.status == "COMPLETED":
        task.completed_at = datetime.utcnow()
        if task.document:
            task.document.status = "COMPLETED"
    elif status_data.status == "IN_PROGRESS" and task.document:
        task.document.status = "IN_PROGRESS"

    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/draft", response_model=DraftResponseSchema, status_code=status.HTTP_201_CREATED)
def submit_draft(
    task_id: int,
    draft_data: DraftCreate,
    current_user: User = Depends(require_role(["SPECIALIST", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Chuyên viên nộp dự thảo văn bản phản hồi (soạn tay hoặc tinh chỉnh từ AI) lên Lãnh đạo phê duyệt.
    """
    task = db.query(TaskAssignment).filter(TaskAssignment.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ phân công tương ứng.")

    if task.assigned_to_user_id != current_user.id and current_user.role.code != "ADMIN":
        raise HTTPException(status_code=403, detail="Chỉ chuyên viên được phân công mới có thể nộp dự thảo.")

    # Tạo bản ghi dự thảo
    new_draft = DraftResponse(
        document_id=task.document_id,
        task_assignment_id=task.id,
        author_user_id=current_user.id,
        title=draft_data.title,
        content=draft_data.content,
        is_ai_generated=draft_data.is_ai_generated,
        status="SUBMITTED"
    )

    task.status = "DRAFT_SUBMITTED"
    if task.document:
        task.document.status = "SUBMITTED"

    # Tạo thông báo gửi Lãnh đạo
    notif = Notification(
        user_id=task.assigned_by_user_id,
        document_id=task.document_id,
        type="DRAFT_SUBMITTED",
        title=f"Dự thảo mới chờ duyệt: {task.document.document_code}",
        message=f"Chuyên viên {current_user.full_name} đã trình dự thảo: '{draft_data.title}'."
    )
    db.add(notif)

    db.add(new_draft)
    db.commit()
    db.refresh(new_draft)
    return new_draft


@router.post("/drafts/{draft_id}/approve", response_model=DraftResponseSchema)
def approve_draft(
    draft_id: int,
    is_approved: bool = True,
    feedback: str = "",
    current_user: User = Depends(require_role(["LEADER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Lãnh đạo phê duyệt hoặc từ chối trả lại dự thảo:
    - Nếu duyệt: Chuyển trạng thái sang 'APPROVED', chuẩn bị cho Văn thư cấp số ban hành.
    - Nếu từ chối: Chuyển 'REJECTED' kèm ý kiến phản hồi cho Chuyên viên hoàn thiện lại.
    """
    draft = db.query(DraftResponse).filter(DraftResponse.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Không tìm thấy văn bản dự thảo.")

    if is_approved:
        draft.status = "APPROVED"
        draft.leader_feedback = feedback or "Đồng ý phê duyệt phát hành."
        if draft.task_assignment:
            draft.task_assignment.status = "APPROVED"
        if draft.document:
            draft.document.status = "APPROVED"
            
        # Báo cho chuyên viên
        notif = Notification(
            user_id=draft.author_user_id,
            document_id=draft.document_id,
            type="DRAFT_APPROVED",
            title="Dự thảo đã được duyệt",
            message=f"Lãnh đạo {current_user.full_name} đã phê duyệt dự thảo: {draft.title}."
        )
        db.add(notif)
    else:
        draft.status = "REJECTED"
        draft.leader_feedback = feedback or "Yêu cầu chỉnh sửa lại nội dung."
        if draft.task_assignment:
            draft.task_assignment.status = "IN_PROGRESS"
        if draft.document:
            draft.document.status = "IN_PROGRESS"

        notif = Notification(
            user_id=draft.author_user_id,
            document_id=draft.document_id,
            type="DRAFT_SUBMITTED",
            title="Dự thảo cần chỉnh sửa bổ sung",
            message=f"Lãnh đạo {current_user.full_name} yêu cầu chỉnh sửa dự thảo: {feedback}."
        )
        db.add(notif)

    db.commit()
    db.refresh(draft)
    return draft

