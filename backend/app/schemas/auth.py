from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email hoặc Số điện thoại")
    password: str = Field(..., min_length=6, description="Mật khẩu đăng nhập")
    rememberMe: bool = Field(default=True, description="Ghi nhớ đăng nhập")

class RegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=2, description="Họ và tên khách hàng")
    phone: str = Field(..., min_length=10, description="Số điện thoại")
    email: EmailStr = Field(..., description="Email liên hệ")
    password: str = Field(..., min_length=8, description="Mật khẩu tối thiểu 8 ký tự")
    agreeTerms: bool = Field(..., description="Đồng ý điều khoản sử dụng")

class AuthResponse(BaseModel):
    id: int
    fullName: str
    email: str
    phone: str
    role: str = Field(..., description="CUSTOMER, READER, ADMIN")
    token: str
    message: str

