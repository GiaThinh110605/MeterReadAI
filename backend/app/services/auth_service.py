import jwt
from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_token, decode_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserPublic,
    normalize_phone,
)

# Thông báo chung cho mọi trường hợp sai thông tin để không lộ email nào đã tồn tại
INVALID_CREDENTIALS = "Email/số điện thoại hoặc mật khẩu không đúng"


class AuthService:

    @staticmethod
    def to_public(user: User) -> UserPublic:
        return UserPublic(
            id=user.id,
            email=user.email,
            fullName=user.full_name,
            phone=user.phone,
            role=user.role,
            employeeCode=user.employee.employee_code if user.employee else None,
        )

    @classmethod
    def issue_tokens(cls, user: User) -> TokenResponse:
        return TokenResponse(
            accessToken=create_token(user.id, user.role, "access"),
            refreshToken=create_token(user.id, user.role, "refresh"),
            expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=cls.to_public(user),
        )

    @staticmethod
    def register_customer(db: Session, request: RegisterRequest) -> User:
        """Đăng ký tài khoản KHÁCH HÀNG. Vai trò ADMIN/READER chỉ do quản trị viên tạo."""
        email = request.email.lower()
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email đã được sử dụng")
        if db.query(User).filter(User.phone == request.phone).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Số điện thoại đã được sử dụng")

        user = User(
            email=email,
            hashed_password=hash_password(request.password),
            full_name=request.fullName,
            phone=request.phone,
            role="CUSTOMER",
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, request: LoginRequest) -> User:
        identifier = request.identifier.strip()
        if "@" in identifier:
            condition = User.email == identifier.lower()
        else:
            phone = normalize_phone(identifier)
            # Hỗ trợ cả số lưu dạng có dấu chấm trong dữ liệu mẫu cũ (0909.123.456)
            condition = or_(User.phone == phone, User.phone == identifier)

        user = db.query(User).filter(condition).first()
        if user is None or not verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_CREDENTIALS)
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị khóa")
        return user

    @staticmethod
    def user_from_refresh_token(db: Session, refresh_token: str) -> User:
        try:
            payload = decode_token(refresh_token, expected_type="refresh")
            user = db.get(User, int(payload["sub"]))
        except (jwt.InvalidTokenError, TypeError, ValueError):
            user = None
        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh Token không hợp lệ hoặc đã hết hạn",
            )
        return user
