import os
from pypdf import PdfReader
from docx import Document as DocxDocument

class FileService:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Trích xuất text thô từ tệp PDF hoặc DOCX."""
        if not os.path.exists(file_path):
            return ""

        ext = os.path.splitext(file_path)[1].lower()
        text_content = []

        try:
            if ext == ".pdf":
                reader = PdfReader(file_path)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text_content.append(extracted)
                return "\n".join(text_content).strip()

            elif ext in [".docx", ".doc"]:
                doc = DocxDocument(file_path)
                for para in doc.paragraphs:
                    if para.text:
                        text_content.append(para.text)
                return "\n".join(text_content).strip()

            elif ext == ".txt":
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read().strip()

            else:
                return "Định dạng tệp không hỗ trợ trích xuất text tự động."

        except Exception as e:
            return f"Lỗi trong quá trình trích xuất văn bản: {str(e)}"

file_service = FileService()
