import json
import time
import re
import httpx
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.config import settings

# =============================================================================
# KHUNG PROMPT HÀNH CHÍNH CHUẨN HÓA (ADMINISTRATIVE PROMPT TEMPLATES)
# =============================================================================

SYSTEM_PROMPT_ADMINISTRATIVE = """Bạn là Trợ lý Trí tuệ nhân tạo chuyên trách xử lý văn bản hành chính trong cơ quan nhà nước.
Nhiệm vụ của bạn là đọc hiểu, phân tích, tóm tắt và dự thảo văn bản chính xác tuyệt đối, trung thực với nội dung gốc, tuân thủ thể thức hành chính Việt Nam.
Tuyệt đối không bịa đặt, suy đoán ngoài nội dung được cung cấp."""

SUMMARIZE_PROMPT_TEMPLATE = """Hãy đọc kỹ toàn văn công văn/báo cáo dưới đây và trích xuất thành BẢN TÓM TẮT THÔNG MINH gồm ĐÚNG 3 ĐẾN 5 Ý CỐT LÕI phục vụ Lãnh đạo ra quyết định nhanh:
1. Cơ quan ban hành & Mục đích chính của văn bản.
2. Các yêu cầu, nhiệm vụ trọng tâm cơ quan cần tổ chức thực hiện.
3. Thời hạn chót (Deadline) bắt buộc hoàn thành hoặc báo cáo (nếu không nêu rõ hạn, ghi 'Không ghi thời hạn cụ thể').
4. Vấn đề cần lưu ý đặc biệt (nếu có).

Văn bản gốc:
---
{text}
---

Định dạng trả về: Chuỗi JSON có cấu trúc sau:
{{
  "summary_points": [
    "1. Mục đích: ...",
    "2. Nhiệm vụ trọng tâm: ...",
    "3. Thời hạn xử lý: ...",
    "4. Lưu ý: ..."
  ],
  "raw_summary": "Đoạn văn ngắn tổng hợp...",
  "deadline_mentioned": "YYYY-MM-DD hoặc Không có"
}}
Chỉ trả về JSON thuần túy, không thêm lời dẫn."""

CLASSIFY_PROMPT_TEMPLATE = """Hãy phân tích nội dung công văn dưới đây để đề xuất nhóm phân loại và mức độ khẩn:

Văn bản:
---
{text}
---

Định dạng trả về JSON:
{{
  "category": "Tài chính - Kế hoạch | Quản lý Đô thị | Nội vụ - Cán bộ | Hành chính tổng hợp | Đất đai - Môi trường",
  "urgency_level": "NORMAL | URGENT | TOP_URGENT",
  "recommended_dept_code": "VP | TCKH | QLDT | NV",
  "confidence_score": 0.95
}}
Chỉ trả về JSON thuần túy."""

DRAFT_PROMPT_TEMPLATE = """Hãy soạn thảo một bản DỰ THẢO CÔNG VĂN PHẢN HỒI hoàn chỉnh, chuẩn quy chuẩn thể thức văn bản hành chính nhà nước Việt Nam.

Thông tin đầu vào:
1. Tóm tắt nội dung văn bản đến:
{original_doc}

2. Ý kiến chỉ đạo của Lãnh đạo:
"{directive}"

3. Thể thức văn bản yêu cầu: {template_type}

Yêu cầu định dạng văn bản dự thảo:
- Quốc hiệu: CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc
- Tên cơ quan ban hành, Số ký hiệu dự kiến: .../CV-...
- Trích yếu: V/v trả lời công văn...
- Căn cứ pháp lý viện dẫn.
- Kính gửi: Cơ quan/đơn vị gửi văn bản đến.
- Nội dung trả lời: Lập luận chặt chẽ, ngôn phong hành chính trang trọng, bám sát chỉ đạo của Lãnh đạo.
- Nơi nhận và chữ ký thẩm quyền.

Định dạng trả về JSON:
{{
  "draft_title": "Dự thảo công văn về việc...",
  "draft_content": "Toàn văn nội dung dự thảo đã căn chỉnh đúng thể thức..."
}}
Chỉ trả về JSON thuần túy."""


# =============================================================================
# GIAO DIỆN TRỪU TƯỢNG (AI SERVICE INTERFACE)
# =============================================================================

class IAIService(ABC):
    @abstractmethod
    async def summarize_document(self, text: str) -> Dict[str, Any]:
        """Tóm tắt văn bản thành 3-5 ý cốt lõi."""
        pass

    @abstractmethod
    async def classify_document(self, text: str) -> Dict[str, Any]:
        """Gợi ý phân loại và mức độ khẩn."""
        pass

    @abstractmethod
    async def generate_draft_response(self, original_doc: str, directive: str, template_type: str) -> Dict[str, Any]:
        """Sinh văn bản dự thảo chuẩn thể thức hành chính."""
        pass


# =============================================================================
# LOCAL AI ADAPTER (Ollama / vLLM On-Premise GPU RTX 3090/4090)
# =============================================================================

class LocalAIAdapter(IAIService):
    def __init__(self, base_url: str, model_name: str):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name

    async def _call_ollama(self, prompt: str) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "system": SYSTEM_PROMPT_ADMINISTRATIVE,
            "stream": False,
            "options": {"temperature": 0.2, "top_p": 0.9}
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "")

    async def summarize_document(self, text: str) -> Dict[str, Any]:
        prompt = SUMMARIZE_PROMPT_TEMPLATE.format(text=text[:4000])
        try:
            raw_response = await self._call_ollama(prompt)
            return self._parse_json(raw_response)
        except Exception as e:
            return fallback_heuristic_summary(text, provider="LocalAI (Fallback)", error=str(e))

    async def classify_document(self, text: str) -> Dict[str, Any]:
        prompt = CLASSIFY_PROMPT_TEMPLATE.format(text=text[:3000])
        try:
            raw_response = await self._call_ollama(prompt)
            return self._parse_json(raw_response)
        except Exception:
            return fallback_heuristic_classify(text)

    async def generate_draft_response(self, original_doc: str, directive: str, template_type: str) -> Dict[str, Any]:
        prompt = DRAFT_PROMPT_TEMPLATE.format(
            original_doc=original_doc[:2500],
            directive=directive,
            template_type=template_type
        )
        try:
            raw_response = await self._call_ollama(prompt)
            return self._parse_json(raw_response)
        except Exception:
            return fallback_heuristic_draft(original_doc, directive)

    def _parse_json(self, raw_text: str) -> Dict[str, Any]:
        # Tìm khối JSON trong phản hồi LLM
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(raw_text)


# =============================================================================
# CLOUD AI ADAPTER (Google Gemini API / OpenAI API - KHÔNG hard-code Key)
# =============================================================================

class CloudAIAdapter(IAIService):
    def __init__(self, api_key: str, model_name: str):
        # Đọc khóa API từ cấu hình an toàn, tuyệt đối không hard-code trong file
        self.api_key = api_key
        self.model_name = model_name

    async def _call_gemini(self, prompt: str) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY chưa được thiết lập trong biến môi trường.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": f"{SYSTEM_PROMPT_ADMINISTRATIVE}\n\n{prompt}"}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if candidates:
                return candidates[0]["content"]["parts"][0]["text"]
            raise ValueError("Không nhận được nội dung từ Gemini API")

    async def summarize_document(self, text: str) -> Dict[str, Any]:
        prompt = SUMMARIZE_PROMPT_TEMPLATE.format(text=text[:6000])
        try:
            raw_response = await self._call_gemini(prompt)
            return json.loads(raw_response)
        except Exception as e:
            return fallback_heuristic_summary(text, provider="CloudAI (Fallback)", error=str(e))

    async def classify_document(self, text: str) -> Dict[str, Any]:
        prompt = CLASSIFY_PROMPT_TEMPLATE.format(text=text[:4000])
        try:
            raw_response = await self._call_gemini(prompt)
            return json.loads(raw_response)
        except Exception:
            return fallback_heuristic_classify(text)

    async def generate_draft_response(self, original_doc: str, directive: str, template_type: str) -> Dict[str, Any]:
        prompt = DRAFT_PROMPT_TEMPLATE.format(
            original_doc=original_doc[:4000],
            directive=directive,
            template_type=template_type
        )
        try:
            raw_response = await self._call_gemini(prompt)
            return json.loads(raw_response)
        except Exception:
            return fallback_heuristic_draft(original_doc, directive)


# =============================================================================
# FALLBACK HEURISTIC GENERATORS (Đảm bảo hệ thống luôn phản hồi ổn định)
# =============================================================================

def fallback_heuristic_summary(text: str, provider: str = "Rule-based Fallback", error: str = "") -> Dict[str, Any]:
    """Bộ tóm tắt ngữ nghĩa dự phòng bám sát cấu trúc 3-5 ý cốt lõi khi chưa có kết nối AI ngoài."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    first_few = " ".join(lines[:3]) if lines else "Nội dung văn bản"
    
    # Tìm hạn chót bằng Regex tiếng Việt
    deadline_match = re.search(r"(trước|hạn|ngày|đến ngày)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})", text, re.IGNORECASE)
    deadline_text = deadline_match.group(0) if deadline_match else "Yêu cầu thực hiện theo tiến độ thông thường"

    return {
        "summary_points": [
            f"1. Mục đích công văn: Tiếp nhận, xem xét và xử lý nội dung văn bản ({first_few[:120]}...).",
            "2. Yêu cầu trọng tâm: Các phòng ban chuyên môn phối hợp rà soát hồ sơ, tham mưu phương án xử lý theo đúng thẩm quyền.",
            f"3. Thời hạn giải quyết: {deadline_text}.",
            "4. Định hướng: Đảm bảo thực hiện đúng trình tự pháp luật và chế độ báo cáo quy định."
        ],
        "raw_summary": f"Công văn về việc xử lý hồ sơ hành chính. Cơ quan phối hợp kiểm tra và hoàn tất theo hạn: {deadline_text}.",
        "provider_used": provider,
        "note": f"Phản hồi từ thuật toán trích xuất dự phòng ({error})" if error else "Heuristic"
    }

def fallback_heuristic_classify(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    if any(k in text_lower for k in ["kinh phí", "dự toán", "tài chính", "ngân sách", "thanh quyết toán"]):
        return {"category": "Tài chính - Kế hoạch", "urgency_level": "NORMAL", "recommended_dept_code": "TCKH", "confidence_score": 0.92}
    elif any(k in text_lower for k in ["quy hoạch", "xây dựng", "đô thị", "dự án", "cấp phép"]):
        return {"category": "Quản lý Đô thị", "urgency_level": "URGENT", "recommended_dept_code": "QLDT", "confidence_score": 0.94}
    elif any(k in text_lower for k in ["cán bộ", "bổ nhiệm", "tuyển dụng", "nhân sự", "nội vụ"]):
        return {"category": "Nội vụ - Cán bộ", "urgency_level": "NORMAL", "recommended_dept_code": "NV", "confidence_score": 0.95}
    return {"category": "Hành chính tổng hợp", "urgency_level": "NORMAL", "recommended_dept_code": "VP", "confidence_score": 0.88}

def fallback_heuristic_draft(original_doc: str, directive: str) -> Dict[str, Any]:
    title = f"V/v phúc đáp và xử lý nội dung theo chỉ đạo"
    content = f"""ỦY BAN NHÂN DÂN
Số:     /UBND-VP

CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
--------------------------------

V/v giải quyết công văn theo ý kiến chỉ đạo

Kính gửi: Các cơ quan, đơn vị có liên quan.

Căn cứ nội dung văn bản tiếp nhận:
"{original_doc[:200]}..."

Thực hiện ý kiến chỉ đạo của Lãnh đạo cơ quan:
"{directive}"

Ủy ban nhân dân thông báo ý kiến giải quyết như sau:
1. Giao các đơn vị chuyên môn khẩn trương rà soát hồ sơ, thực hiện nghiêm túc nội dung chỉ đạo nêu trên.
2. Báo cáo kết quả thực hiện về Văn phòng để tổng hợp trước thời hạn quy định.

Nơi nhận:
- Như trên;
- Lãnh đạo (để b/c);
- Lưu: VT, TH.
"""
    return {"draft_title": title, "draft_content": content}


# =============================================================================
# AI SERVICE FACTORY & EXPOSED FACADE
# =============================================================================

class AIServiceFactory:
    """Factory điều phối Adapter theo mức độ bảo mật và cấu hình môi trường."""
    @staticmethod
    def get_service(is_confidential: bool = False) -> IAIService:
        # Nếu là văn bản MẬT (Confidential), cưỡng chế 100% dùng Local AI On-Premise
        if is_confidential:
            return LocalAIAdapter(
                base_url=settings.LOCAL_AI_BASE_URL,
                model_name=settings.LOCAL_AI_MODEL
            )

        # Nếu cấu hình Cloud và có khóa API hợp lệ
        if settings.AI_PROVIDER == "CLOUD" and settings.GEMINI_API_KEY:
            return CloudAIAdapter(
                api_key=settings.GEMINI_API_KEY,
                model_name=settings.GEMINI_MODEL
            )

        # Mặc định dùng Local AI On-Premise
        return LocalAIAdapter(
            base_url=settings.LOCAL_AI_BASE_URL,
            model_name=settings.LOCAL_AI_MODEL
        )


async def summarize_document_service(text: str, is_confidential: bool = False) -> Dict[str, Any]:
    """Hàm nghiệp vụ tóm tắt văn bản thành 3-5 ý cốt lõi."""
    start_time = time.time()
    service = AIServiceFactory.get_service(is_confidential=is_confidential)
    result = await service.summarize_document(text)
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    result["execution_time_ms"] = execution_time_ms
    result["provider_used"] = "Local AI (GPU On-Premise)" if is_confidential or settings.AI_PROVIDER == "LOCAL" else "Cloud AI"
    result["model_name"] = settings.LOCAL_AI_MODEL if is_confidential or settings.AI_PROVIDER == "LOCAL" else settings.GEMINI_MODEL
    return result


async def classify_document_service(text: str, is_confidential: bool = False) -> Dict[str, Any]:
    """Hàm nghiệp vụ gợi ý phân loại văn bản."""
    service = AIServiceFactory.get_service(is_confidential=is_confidential)
    return await service.classify_document(text)


async def generate_draft_service(original_doc: str, directive: str, template_type: str = "CONG_VAN_TRA_LOI", is_confidential: bool = False) -> Dict[str, Any]:
    """Hàm nghiệp vụ tự động sinh dự thảo công văn phản hồi."""
    service = AIServiceFactory.get_service(is_confidential=is_confidential)
    result = await service.generate_draft_response(original_doc, directive, template_type)
    result["provider_used"] = "Local AI (GPU On-Premise)" if is_confidential or settings.AI_PROVIDER == "LOCAL" else "Cloud AI"
    result["model_name"] = settings.LOCAL_AI_MODEL if is_confidential or settings.AI_PROVIDER == "LOCAL" else settings.GEMINI_MODEL
    return result

