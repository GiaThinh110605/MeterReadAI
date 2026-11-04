import hashlib
import secrets
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    identifier = request.identifier.strip().lower()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc số điện thoại không được để trống",
        )

    user = db.query(User).filter(
        or_(User.email.ilike(identifier), User.phone == identifier)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản hoặc mật khẩu không chính xác",
        )

    if user.hashed_password != hash_password(request.password) and user.hashed_password != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản hoặc mật khẩu không chính xác",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đang bị tạm khóa",
        )

    token = secrets.token_urlsafe(32)
    return AuthResponse(
        id=user.id,
        fullName=user.full_name,
        email=user.email,
        phone=user.phone or "",
        role=user.role,
        token=token,
        message="Đăng nhập thành công",
    )

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if not request.agreeTerms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bắt buộc phải đồng ý với Điều khoản sử dụng & Quy định cấp nước",
        )

    email = request.email.strip().lower()
    phone = request.phone.strip()

    existing_user = db.query(User).filter(
        or_(User.email.ilike(email), User.phone == phone)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc số điện thoại này đã được sử dụng",
        )

    new_user = User(
        email=email,
        phone=phone,
        full_name=request.fullName.strip(),
        hashed_password=hash_password(request.password),
        role="CUSTOMER",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = secrets.token_urlsafe(32)
    return AuthResponse(
        id=new_user.id,
        fullName=new_user.full_name,
        email=new_user.email,
        phone=new_user.phone or "",
        role=new_user.role,
        token=token,
        message="Đăng ký tài khoản thành công",
    )
