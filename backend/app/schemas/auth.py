import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

PHONE_PATTERN = re.compile(r"^0\d{9,10}$")


def normalize_phone(phone: str) -> str:
    """Bỏ khoảng trắng, dấu chấm, gạch ngang: '0909.123.456' -> '0909123456'."""
    return re.sub(r"[\s.\-]", "", phone)


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=3, max_length=255, description="Email hoặc số điện thoại")
    password: str = Field(..., min_length=1, max_length=128)


class RegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=255, description="Họ và tên")
    phone: str = Field(..., description="Số điện thoại, ví dụ 0901234567")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)
    confirmPassword: str
    acceptTerms: bool = Field(..., description="Đồng ý Điều khoản sử dụng & Quy định cấp nước")

    @field_validator("fullName")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Họ và tên quá ngắn")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = normalize_phone(v)
        if not PHONE_PATTERN.match(v):
            raise ValueError("Số điện thoại không hợp lệ (10–11 số, bắt đầu bằng 0)")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Mật khẩu phải có ít nhất 8 ký tự, gồm cả chữ và số")
        return v

    @model_validator(mode="after")
    def check_confirm_and_terms(self) -> "RegisterRequest":
        if self.password != self.confirmPassword:
            raise ValueError("Mật khẩu xác nhận không khớp")
        if not self.acceptTerms:
            raise ValueError("Bạn cần đồng ý Điều khoản sử dụng để đăng ký")
        return self


class RefreshRequest(BaseModel):
    refreshToken: str


class UserPublic(BaseModel):
    id: int
    email: str
    fullName: str
    phone: Optional[str] = None
    role: str
    employeeCode: Optional[str] = None


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int = Field(..., description="Số giây Access Token còn hiệu lực")
    user: UserPublic
