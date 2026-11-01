from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserPublic
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Xác Thực & Tài Khoản"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    UI 2 – Đăng ký tài khoản Khách hàng mới:
    - Kiểm tra trùng email / số điện thoại (409).
    - Mật khẩu ≥ 8 ký tự, có chữ và số; băm bcrypt trước khi lưu.
    - Đăng ký xong trả luôn cặp token để vào thẳng cổng khách hàng.
    """
    user = AuthService.register_customer(db, request)
    return AuthService.issue_tokens(user)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """UI 1 – Đăng nhập bằng email hoặc số điện thoại, cấp Access & Refresh JWT."""
    user = AuthService.authenticate(db, request)
    return AuthService.issue_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    """Đổi Refresh Token lấy cặp token mới khi Access Token hết hạn."""
    user = AuthService.user_from_refresh_token(db, request.refreshToken)
    return AuthService.issue_tokens(user)


@router.get("/me", response_model=UserPublic)
def read_me(current_user: User = Depends(get_current_user)):
    """Thông tin người dùng đang đăng nhập (dùng để khôi phục phiên trên Frontend)."""
    return AuthService.to_public(current_user)
