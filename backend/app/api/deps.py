"""
Dependency xác thực & phân quyền dùng chung cho mọi router.

Cách dùng ở router khác (các bạn trong nhóm):
    from app.api.deps import get_current_user, require_roles

    @router.get("/admin/routes", dependencies=[Depends(require_roles("ADMIN"))])
    def list_routes(...): ...

    @router.get("/customer/dashboard")
    def dashboard(current_user: User = Depends(require_roles("CUSTOMER"))): ...
"""
from typing import Callable

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User

# auto_error=False để tự trả 401 (mặc định FastAPI trả 403 khi thiếu header)
bearer_scheme = HTTPBearer(auto_error=False, description="Dán Access Token nhận từ /auth/login")

ROLES = ("ADMIN", "READER", "CUSTOMER")


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Đọc header `Authorization: Bearer <token>`, xác thực JWT và trả về User đang đăng nhập."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized("Chưa đăng nhập hoặc thiếu Access Token")

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except jwt.ExpiredSignatureError:
        raise _unauthorized("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại")
    except jwt.InvalidTokenError:
        raise _unauthorized("Access Token không hợp lệ")

    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise _unauthorized("Access Token không hợp lệ")

    user = db.get(User, user_id)
    if user is None:
        raise _unauthorized("Tài khoản không tồn tại")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tài khoản đã bị khóa")
    return user


def require_roles(*roles: str) -> Callable[..., User]:
    """Tạo dependency chỉ cho phép các vai trò được liệt kê (RBAC). Sai vai trò -> 403."""
    unknown = set(roles) - set(ROLES)
    if unknown:
        raise ValueError(f"Vai trò không hợp lệ: {unknown}")

    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền truy cập chức năng này",
            )
        return current_user

    return checker
