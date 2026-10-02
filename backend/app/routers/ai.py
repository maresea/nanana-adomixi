from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.ai import MetadataDTO, ClassificationDTO, SummarizeRequest, DraftAIRequest, AIResponse
from app.services.ai_service import ai_service
from app.services.file_service import file_service
from app.dependencies import get_current_user, require_roles
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["5. Dịch vụ Trí tuệ Nhân tạo (FR7, FR8, FR9, FR10)"])

@router.post("/extract-metadata", response_model=MetadataDTO, summary="AI tự động trích xuất thông tin công văn (FR7)")
def extract_metadata_api(
    req: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["CLERK"]))
):
    """
    Nhận nội dung thô của văn bản (từ file scan/PDF/DOCX) và trả về thông tin bóc tách:
    Số hiệu, ngày ban hành, cơ quan gửi, trích yếu để Văn thư đối soát.
    """
    if not req.document_text.strip():
        raise HTTPException(status_code=400, detail="Nội dung văn bản không được để trống")
    dto = ai_service.extract_metadata(req.document_text, db=db)
    return dto

@router.post("/summarize", summary="AI tóm tắt văn bản thành 3-5 ý chính (FR8)")
def summarize_document_api(
    req: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Tóm tắt văn bản hành chính cô đọng giúp Lãnh đạo nắm bắt nhanh thông tin.
    """
    if not req.document_text.strip():
        raise HTTPException(status_code=400, detail="Nội dung văn bản không được để trống")
    summary = ai_service.summarize_text(req.document_text, db=db)
    return {"summary": summary}

@router.post("/suggest-classification", response_model=ClassificationDTO, summary="AI gợi ý thể loại & mức độ ưu tiên (FR9)")
def suggest_classification_api(
    req: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["CLERK"]))
):
    """
    Phân tích nội dung và đưa ra đề xuất phân loại mang tính tham khảo cho Văn thư.
    """
    if not req.document_text.strip():
        raise HTTPException(status_code=400, detail="Nội dung văn bản không được để trống")
    dto = ai_service.suggest_classification(req.document_text, db=db)
    return dto

@router.post("/generate-draft", summary="AI sinh dự thảo phản hồi theo mẫu hành chính (FR10)")
def generate_draft_api(
    req: DraftAIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["SPECIALIST"]))
):
    """
    Sinh dự thảo văn bản phản hồi dựa trên văn bản gốc và ý kiến chỉ đạo của Lãnh đạo.
    """
    if not req.document_text.strip():
        raise HTTPException(status_code=400, detail="Nội dung văn bản gốc không được để trống")
    draft_content = ai_service.generate_draft(req.document_text, req.instruction, db=db)
    return {"draft_content": draft_content}

@router.post("/parse-file", summary="Trích xuất nội dung văn bản từ tệp đính kèm (PDF/DOCX/TXT)")
async def parse_file_api(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Nhận tệp đính kèm (.pdf, .docx, .txt), trích xuất chuỗi text thô
    để nạp vào khung bóc tách AI hoặc xem trước nội dung.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Tên tệp không hợp lệ")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Tệp tải lên không có dữ liệu (rỗng)")

    extracted_text = file_service.extract_text_from_bytes(content, file.filename)
    if not extracted_text.strip():
        extracted_text = "Không tìm thấy nội dung văn bản trong tệp hoặc tệp ở định dạng ảnh scan chưa qua OCR."

    return {
        "filename": file.filename,
        "size": len(content),
        "text": extracted_text
    }

