from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.task import TaskAssignment, DraftResponse
from app.models.user import User
from app.models.document import Document
from app.schemas.task import DraftCreate, DraftUpdate, DraftApproval, DraftResponseModel
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/drafts", tags=["4. Quản lý Dự thảo Phản hồi (FR4, FR10)"])

@router.post("/tasks/{task_id}", response_model=DraftResponseModel, summary="Chuyên viên tạo dự thảo phản hồi mới (FR4, FR10)")
def create_draft(
    task_id: int,
    draft_in: DraftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SPECIALIST"]))
):
    task = db.query(TaskAssignment).filter(TaskAssignment.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhiệm vụ")

    if task.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không phải chuyên viên được giao nhiệm vụ này")

    draft = DraftResponse(
        task_id=task_id,
        author_id=current_user.id,
        content=draft_in.content,
        is_ai_generated=draft_in.is_ai_generated,
        is_approved=False
    )
    db.add(draft)
    task.status = "PROCESSING"
    db.commit()
    db.refresh(draft)
    return draft

@router.get("/tasks/{task_id}", response_model=List[DraftResponseModel], summary="Xem danh sách dự thảo của nhiệm vụ")
def get_task_drafts(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    drafts = db.query(DraftResponse).filter(DraftResponse.task_id == task_id).order_by(DraftResponse.created_at.desc()).all()
    return drafts

@router.patch("/{draft_id}", response_model=DraftResponseModel, summary="Chuyên viên chỉnh sửa nội dung dự thảo (FR4)")
def update_draft(
    draft_id: int,
    draft_in: DraftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SPECIALIST"]))
):
    draft = db.query(DraftResponse).filter(DraftResponse.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản dự thảo")

    if draft.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Chỉ tác giả mới được quyền chỉnh sửa dự thảo")

    draft.content = draft_in.content
    draft.is_approved = False # Reset trạng thái duyệt nếu sửa lại
    db.commit()
    db.refresh(draft)
    return draft

@router.post("/{draft_id}/approve", response_model=DraftResponseModel, summary="Lãnh đạo phê duyệt hoặc trả về dự thảo (FR4)")
def approve_draft(
    draft_id: int,
    approval_in: DraftApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["LEADER"]))
):
    draft = db.query(DraftResponse).filter(DraftResponse.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản dự thảo")

    draft.is_approved = approval_in.is_approved
    draft.approval_note = approval_in.approval_note

    task = db.query(TaskAssignment).filter(TaskAssignment.id == draft.task_id).first()
    if task and approval_in.is_approved:
        task.status = "RESOLVED"
        doc = db.query(Document).filter(Document.id == task.document_id).first()
        if doc:
            doc.status = "COMPLETED"

    db.commit()
    db.refresh(draft)
    return draft
