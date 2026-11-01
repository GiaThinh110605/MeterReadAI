"""
test_auth.py – Phân hệ Xác thực (Hưng phụ trách)
Bảo mật hệ thống không bị bypass: đăng ký, đăng nhập, bcrypt, JWT hết hạn / giả mạo, phân quyền theo vai trò.
"""
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.security import create_token, hash_password, verify_password

ADMIN = {"identifier": "admin@waterflow.vn", "password": "Admin@123"}
READER = {"identifier": "nguyentuan@waterflow.vn", "password": "Reader@123"}
CUSTOMER = {"identifier": "khachhang@waterflow.vn", "password": "Customer@123"}


def _unique_phone() -> str:
    return "09" + str(uuid.uuid4().int)[:8]


def _register_payload(**overrides) -> dict:
    payload = {
        "fullName": "Trần Quang Hưng",
        "phone": _unique_phone(),
        "email": f"hung.{uuid.uuid4().hex[:8]}@example.com",
        "password": "Matkhau123",
        "confirmPassword": "Matkhau123",
        "acceptTerms": True,
    }
    payload.update(overrides)
    return payload


def _login(client: TestClient, creds: dict) -> dict:
    res = client.post("/api/v1/auth/login", json=creds)
    assert res.status_code == 200, res.text
    return res.json()


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ------------------------------------------------------------------ Mã hóa mật khẩu
def test_bcrypt_hash_is_salted_and_verifiable():
    h1 = hash_password("Matkhau123")
    h2 = hash_password("Matkhau123")
    assert h1 != "Matkhau123"
    assert h1.startswith("$2")
    assert h1 != h2  # salt ngẫu nhiên
    assert verify_password("Matkhau123", h1)
    assert not verify_password("matkhau123", h1)


def test_verify_password_rejects_non_bcrypt_hash():
    assert verify_password("anything", "mock_hashed_password") is False


# ------------------------------------------------------------------ Đăng ký (UI 2)
def test_register_success_returns_tokens_and_customer_role(client: TestClient):
    payload = _register_payload(email="Hung.Upper@Example.com")
    res = client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["accessToken"] and data["refreshToken"]
    assert data["tokenType"] == "bearer"
    assert data["user"]["role"] == "CUSTOMER"
    assert data["user"]["email"] == "hung.upper@example.com"  # email được chuẩn hóa chữ thường
    assert "password" not in data["user"] and "hashedPassword" not in data["user"]


def test_register_duplicate_email_conflict(client: TestClient):
    payload = _register_payload()
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    again = _register_payload(email=payload["email"])
    res = client.post("/api/v1/auth/register", json=again)
    assert res.status_code == 409
    assert "Email" in res.json()["detail"]


def test_register_duplicate_phone_conflict(client: TestClient):
    payload = _register_payload()
    assert client.post("/api/v1/auth/register", json=payload).status_code == 201
    res = client.post("/api/v1/auth/register", json=_register_payload(phone=payload["phone"]))
    assert res.status_code == 409
    assert "điện thoại" in res.json()["detail"]


def test_register_password_mismatch(client: TestClient):
    res = client.post("/api/v1/auth/register", json=_register_payload(confirmPassword="Khac12345"))
    assert res.status_code == 422
    assert "không khớp" in res.text


def test_register_weak_password(client: TestClient):
    res = client.post(
        "/api/v1/auth/register",
        json=_register_payload(password="chiconchu", confirmPassword="chiconchu"),
    )
    assert res.status_code == 422


def test_register_requires_terms(client: TestClient):
    res = client.post("/api/v1/auth/register", json=_register_payload(acceptTerms=False))
    assert res.status_code == 422
    assert "Điều khoản" in res.text


def test_register_invalid_email_and_phone(client: TestClient):
    assert client.post("/api/v1/auth/register", json=_register_payload(email="khong-phai-email")).status_code == 422
    assert client.post("/api/v1/auth/register", json=_register_payload(phone="12345")).status_code == 422


def test_register_cannot_escalate_role(client: TestClient):
    """Gửi kèm role=ADMIN cũng không được: đăng ký công khai luôn là CUSTOMER."""
    res = client.post("/api/v1/auth/register", json=_register_payload(role="ADMIN"))
    assert res.status_code == 201
    assert res.json()["user"]["role"] == "CUSTOMER"


# ------------------------------------------------------------------ Đăng nhập (UI 1)
def test_login_with_email_success(client: TestClient):
    data = _login(client, ADMIN)
    assert data["user"]["role"] == "ADMIN"
    assert data["expiresIn"] == settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


def test_login_with_phone_success(client: TestClient):
    data = _login(client, {"identifier": "0909.123.456", "password": "Reader@123"})
    assert data["user"]["role"] == "READER"
    assert data["user"]["employeeCode"] == "NV-4881"
    data2 = _login(client, {"identifier": "0909123456", "password": "Reader@123"})
    assert data2["user"]["id"] == data["user"]["id"]


def test_login_after_register(client: TestClient):
    payload = _register_payload()
    client.post("/api/v1/auth/register", json=payload)
    data = _login(client, {"identifier": payload["email"], "password": payload["password"]})
    assert data["user"]["fullName"] == "Trần Quang Hưng"


def test_login_wrong_password(client: TestClient):
    res = client.post("/api/v1/auth/login", json={**ADMIN, "password": "SaiMatKhau1"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Email/số điện thoại hoặc mật khẩu không đúng"


def test_login_unknown_user_same_message(client: TestClient):
    """Không tiết lộ email có tồn tại hay không."""
    res = client.post("/api/v1/auth/login", json={"identifier": "ai.do@example.com", "password": "Abc12345"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Email/số điện thoại hoặc mật khẩu không đúng"


def test_login_inactive_user_forbidden(client: TestClient):
    from app.models.user import User
    from tests.conftest import TestingSessionLocal

    payload = _register_payload()
    client.post("/api/v1/auth/register", json=payload)
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == payload["email"]).one()
    user.is_active = False
    db.commit()
    db.close()

    res = client.post("/api/v1/auth/login", json={"identifier": payload["email"], "password": payload["password"]})
    assert res.status_code == 403


# ------------------------------------------------------------------ JWT
def test_me_with_valid_token(client: TestClient):
    tokens = _login(client, CUSTOMER)
    res = client.get("/api/v1/auth/me", headers=_auth(tokens["accessToken"]))
    assert res.status_code == 200
    assert res.json()["email"] == "khachhang@waterflow.vn"


def test_me_without_token_unauthorized(client: TestClient):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401
    assert res.headers.get("www-authenticate") == "Bearer"


def test_expired_token_rejected(client: TestClient):
    expired = jwt.encode(
        {"sub": "1", "role": "ADMIN", "type": "access",
         "exp": datetime.now(timezone.utc) - timedelta(minutes=1)},
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    res = client.get("/api/v1/auth/me", headers=_auth(expired))
    assert res.status_code == 401
    assert "hết hạn" in res.json()["detail"]


def test_tampered_token_rejected(client: TestClient):
    forged = jwt.encode(
        {"sub": "1", "role": "ADMIN", "type": "access",
         "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
        "khoa-bi-mat-gia-mao",
        algorithm="HS256",
    )
    assert client.get("/api/v1/auth/me", headers=_auth(forged)).status_code == 401
    assert client.get("/api/v1/auth/me", headers=_auth("abc.def.ghi")).status_code == 401


def test_refresh_token_flow(client: TestClient):
    tokens = _login(client, READER)
    res = client.post("/api/v1/auth/refresh", json={"refreshToken": tokens["refreshToken"]})
    assert res.status_code == 200
    new_access = res.json()["accessToken"]
    assert client.get("/api/v1/auth/me", headers=_auth(new_access)).status_code == 200


def test_access_and_refresh_tokens_not_interchangeable(client: TestClient):
    tokens = _login(client, READER)
    # Refresh token không được dùng để gọi API
    assert client.get("/api/v1/auth/me", headers=_auth(tokens["refreshToken"])).status_code == 401
    # Access token không được dùng để làm mới phiên
    res = client.post("/api/v1/auth/refresh", json={"refreshToken": tokens["accessToken"]})
    assert res.status_code == 401


def test_token_for_deleted_user_rejected(client: TestClient):
    token = create_token(999999, "ADMIN", "access")
    assert client.get("/api/v1/auth/me", headers=_auth(token)).status_code == 401


# ------------------------------------------------------------------ Phân quyền theo vai trò
def test_role_based_access_to_admin_api(client: TestClient):
    admin = _login(client, ADMIN)["accessToken"]
    reader = _login(client, READER)["accessToken"]
    customer = _login(client, CUSTOMER)["accessToken"]

    assert client.get("/api/v1/admin/dashboard", headers=_auth(admin)).status_code == 200
    assert client.get("/api/v1/admin/dashboard", headers=_auth(reader)).status_code == 403
    assert client.get("/api/v1/admin/dashboard", headers=_auth(customer)).status_code == 403
    assert client.get("/api/v1/admin/dashboard").status_code == 401
