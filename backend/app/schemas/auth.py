from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class DepartmentBrief(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    department: Optional[DepartmentBrief] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserBrief(BaseModel):
    id: int
    username: str
    full_name: str
    role: str

    class Config:
        from_attributes = True
