import os
import io
from pypdf import PdfReader
from docx import Document as DocxDocument

class FileService:
    @staticmethod
    def extract_text_from_bytes(content: bytes, filename: str) -> str:
        """Trích xuất text thô từ nội dung bytes của PDF, DOCX hoặc TXT."""
        ext = os.path.splitext(filename)[1].lower()
        text_content = []

        try:
            if ext == ".pdf":
                reader = PdfReader(io.BytesIO(content))
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text_content.append(extracted)
                return "\n".join(text_content).strip()

            elif ext in [".docx", ".doc"]:
                doc = DocxDocument(io.BytesIO(content))
                for para in doc.paragraphs:
                    if para.text:
                        text_content.append(para.text)
                return "\n".join(text_content).strip()

            elif ext == ".txt":
                return content.decode("utf-8", errors="ignore").strip()

            else:
                return "Định dạng tệp không hỗ trợ trích xuất text tự động."

        except Exception as e:
            return f"Lỗi trong quá trình trích xuất văn bản: {str(e)}"

    @staticmethod
    def extract_text(file_path: str) -> str:
        """Trích xuất text thô từ đường dẫn tệp PDF hoặc DOCX trên ổ đĩa."""
        if not os.path.exists(file_path):
            return ""

        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            content = f.read()

        return FileService.extract_text_from_bytes(content, filename)

file_service = FileService()

