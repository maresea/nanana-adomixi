import os
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Hệ thống Quản lý Công văn tích hợp AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    # JWT Authentication
    SECRET_KEY: str = "DEFAULT_INSECURE_DEV_KEY_CHANGE_IN_PRODUCTION_XYZ_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # AI Configuration (Adapter Pattern)
    AI_PROVIDER: Literal["LOCAL", "CLOUD"] = "LOCAL"

    # Local AI (Ollama / vLLM on-premise GPU)
    LOCAL_AI_BASE_URL: str = "http://localhost:11434"
    LOCAL_AI_MODEL: str = "llama3.1:8b"

    # Cloud AI (PoC / Mock testing) - Tuyệt đối không hard-code khóa API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50

    # Redis Queue
    REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Đảm bảo thư mục lưu trữ file tồn tại
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

