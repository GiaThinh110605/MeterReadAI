"""Tiện ích bảo mật: băm mật khẩu bcrypt và cấp / giải mã JWT (access + refresh)."""
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
import jwt

from app.core.config import settings

TokenType = Literal["access", "refresh"]

# bcrypt chỉ dùng tối đa 72 byte đầu của mật khẩu -> cắt cố định để hash và verify luôn khớp nhau
_BCRYPT_MAX_BYTES = 72


def _encode_password(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    """Băm mật khẩu bằng bcrypt (có salt ngẫu nhiên). Không bao giờ lưu mật khẩu gốc."""
    return bcrypt.hashpw(_encode_password(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    """So khớp mật khẩu với chuỗi băm; trả False nếu chuỗi băm hỏng / không phải bcrypt."""
    try:
        return bcrypt.checkpw(_encode_password(password), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_token(subject: int | str, role: str, token_type: TokenType = "access") -> str:
    """Tạo JWT ký HS256. `sub` = id người dùng, `role` phục vụ phân quyền RBAC."""
    now = datetime.now(timezone.utc)
    if token_type == "access":
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    payload: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "type": token_type,
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str, expected_type: TokenType = "access") -> dict[str, Any]:
    """
    Giải mã và kiểm tra JWT. Ném `jwt.InvalidTokenError` (gồm cả ExpiredSignatureError)
    nếu token sai chữ ký, hết hạn hoặc không đúng loại (access/refresh).
    """
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": ["sub", "exp", "type"]},
    )
    if payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"Sai loại token, cần '{expected_type}'")
    return payload
