from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    department_id: int

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[int] = None
    user_id: Optional[int] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    department_id: int
    role_id: int
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role_code: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

