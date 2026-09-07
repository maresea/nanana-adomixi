import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.core.permissions import get_current_user, verify_document_permission
from app.models.user import User
from app.models.document import Document
from app.models.ai_log import AITaskLog, Notification
from app.schemas.ai import (
    AISummaryRequest,
    AISummaryResponse,
    AIClassifyRequest,
    AIClassifyResponse,
    AIDraftRequest,
    AIDraftResponse,
    AITaskStatusResponse
)
from app.services.ai_service import (
    summarize_document_service,
    classify_document_service,
    generate_draft_service
)

router = APIRouter(prefix="/ai", tags=["Trí tuệ nhân tạo (AI Processing & Background Jobs)"])

async def background_process_ai_summary(task_id: str, document_id: int, text_content: str, is_confidential: bool, user_id: int):
    """Tiến trình chạy ngầm bất đồng bộ (Background Worker) để tóm tắt văn bản không chặn giao diện."""
    db = SessionLocal()
    try:
        log = db.query(AITaskLog).filter(AITaskLog.id == task_id).first()
        if log:
            log.status = "PROCESSING"
            db.commit()

        # Thực thi mô hình AI
        result = await summarize_document_service(text=text_content, is_confidential=is_confidential)

        # Cập nhật kết quả vào công văn
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.ai_summary = "\n".join(result.get("summary_points", []))
            db.commit()

        # Cập nhật log
        if log:
            log.status = "SUCCESS"
            log.result_data = result
            log.execution_time_ms = result.get("execution_time_ms", 0)
            log.completed_at = datetime.utcnow()
            db.commit()

        # Tạo thông báo hoàn thành
        notif = Notification(
            user_id=user_id,
            document_id=document_id,
            type="AI_READY",
            title="Đã tóm tắt AI xong",
            message=f"Bản tóm tắt thông minh cho công văn #{document_id} đã sẵn sàng."
        )
        db.add(notif)
        db.commit()
    except Exception as e:
        if log:
            log.status = "FAILED"
            log.error_message = str(e)
            log.completed_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


@router.post("/summarize", response_model=AISummaryResponse)
async def summarize_document(
    request: AISummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Tóm tắt văn bản thông minh (đồng bộ trả về ngay kết quả).
    Bóc tách thành đúng 3-5 ý cốt lõi phục vụ Lãnh đạo ra quyết định nhanh:
    1. Mục đích công văn.
    2. Nhiệm vụ trọng tâm.
    3. Hạn chót (Deadline).
    """
    text_to_summarize = request.text_content
    is_confidential = request.is_confidential

    if request.document_id:
        doc = verify_document_permission(request.document_id, current_user, db)
        text_to_summarize = doc.ocr_content or doc.title
        is_confidential = doc.confidentiality_level in ["CONFIDENTIAL", "SECRET"]

    if not text_to_summarize:
        raise HTTPException(
            status_code=400,
            detail="Cần cung cấp nội dung văn bản (text_content) hoặc document_id có nội dung."
        )

    result = await summarize_document_service(text=text_to_summarize, is_confidential=is_confidential)

    # Lưu lại vào DB nếu có document_id
    if request.document_id:
        doc = db.query(Document).filter(Document.id == request.document_id).first()
        if doc:
            doc.ai_summary = "\n".join(result.get("summary_points", []))
            db.commit()

    return AISummaryResponse(
        document_id=request.document_id,
        summary_points=result.get("summary_points", []),
        raw_summary=result.get("raw_summary", ""),
        provider_used=result.get("provider_used", "AI"),
        model_name=result.get("model_name", "standard"),
        execution_time_ms=result.get("execution_time_ms", 0)
    )


@router.post("/summarize/async", status_code=status.HTTP_202_ACCEPTED)
async def summarize_document_async(
    request: AISummaryRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kích hoạt tóm tắt văn bản BẤT ĐỒNG BỘ (Non-blocking UI).
    Hệ thống lập tức trả về mã HTTP 202 Accepted cùng Task ID (< 200ms).
    Giao diện người dùng mở khóa ngay, tiến trình chạy ngầm dưới nền.
    """
    if not request.document_id:
        raise HTTPException(status_code=400, detail="Cần cung cấp document_id cho tác vụ bất đồng bộ.")

    doc = verify_document_permission(request.document_id, current_user, db)
    text_content = doc.ocr_content or doc.title
    is_confidential = doc.confidentiality_level in ["CONFIDENTIAL", "SECRET"]

    task_id = str(uuid.uuid4())
    ai_log = AITaskLog(
        id=task_id,
        document_id=doc.id,
        triggered_by_user_id=current_user.id,
        task_type="SUMMARIZATION",
        ai_provider="LOCAL_OLLAMA" if is_confidential else "CLOUD_GEMINI",
        model_name="llama3.1:8b" if is_confidential else "gemini-1.5-flash",
        prompt_preview=text_content[:200],
        status="QUEUED"
    )
    db.add(ai_log)
    db.commit()

    # Đẩy tác vụ vào hàng đợi chạy ngầm (Non-blocking)
    background_tasks.add_task(
        background_process_ai_summary,
        task_id=task_id,
        document_id=doc.id,
        text_content=text_content,
        is_confidential=is_confidential,
        user_id=current_user.id
    )

    return {
        "status": "ACCEPTED",
        "task_id": task_id,
        "message": "Yêu cầu tóm tắt AI đã được tiếp nhận và đang xử lý ngầm (Non-blocking)."
    }


@router.post("/classify", response_model=AIClassifyResponse)
async def classify_document(
    request: AIClassifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI phân tích nội dung để đề xuất nhóm phân loại, mức độ khẩn và phòng ban phù hợp."""
    text_to_classify = request.text_content
    if request.document_id:
        doc = verify_document_permission(request.document_id, current_user, db)
        text_to_classify = doc.ocr_content or doc.title

    if not text_to_classify:
        raise HTTPException(status_code=400, detail="Không có nội dung để phân tích phân loại.")

    result = await classify_document_service(text=text_to_classify)
    return AIClassifyResponse(
        category=result.get("category", "Hành chính tổng hợp"),
        urgency_level=result.get("urgency_level", "NORMAL"),
        recommended_dept_code=result.get("recommended_dept_code", "VP"),
        confidence_score=result.get("confidence_score", 0.9)
    )


@router.post("/generate-draft", response_model=AIDraftResponse)
async def generate_draft(
    request: AIDraftRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI tự động sinh dự thảo văn bản phản hồi chuẩn thể thức hành chính:
    - Đầu vào: Công văn gốc + Ý kiến chỉ đạo của Lãnh đạo.
    - Đầu ra: Văn bản dự thảo hoàn chỉnh đúng quy chuẩn thể thức nhà nước.
    """
    doc = verify_document_permission(request.document_id, current_user, db)
    original_text = doc.ai_summary or doc.ocr_content or doc.title
    is_confidential = doc.confidentiality_level in ["CONFIDENTIAL", "SECRET"]

    result = await generate_draft_service(
        original_doc=original_text,
        directive=request.directive_notes,
        template_type=request.template_type,
        is_confidential=is_confidential
    )

    return AIDraftResponse(
        draft_title=result.get("draft_title", "Dự thảo công văn phản hồi"),
        draft_content=result.get("draft_content", ""),
        provider_used=result.get("provider_used", "AI Engine"),
        model_name=result.get("model_name", "standard")
    )


@router.get("/tasks/{task_id}", response_model=AITaskStatusResponse)
def get_ai_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tra cứu trạng thái của tiến trình AI chạy ngầm (Polling / WebSocket status check)."""
    task = db.query(AITaskLog).filter(AITaskLog.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin tác vụ AI.")

    return AITaskStatusResponse(
        task_id=task.id,
        status=task.status,
        task_type=task.task_type,
        result=task.result_data,
        error_message=task.error_message
    )

