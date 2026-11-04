from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login_flow():
    reg_res = client.post("/api/v1/auth/register", json={
        "fullName": "Phan Hoàng Nam",
        "phone": "0988776655",
        "email": "phanhoangnam@example.com",
        "password": "mypassword123",
        "agreeTerms": True
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["role"] == "CUSTOMER"
    assert reg_data["fullName"] == "Phan Hoàng Nam"
    assert "token" in reg_data

    login_res = client.post("/api/v1/auth/login", json={
        "identifier": "phanhoangnam@example.com",
        "password": "mypassword123",
        "rememberMe": True
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["role"] == "CUSTOMER"
    assert login_data["fullName"] == "Phan Hoàng Nam"

def test_login_existing_reader():
    res = client.post("/api/v1/auth/login", json={
        "identifier": "nguyentuan@waterflow.vn",
        "password": "mock_hashed_password",
        "rememberMe": True
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "READER"
    assert data["fullName"] == "Nguyễn Tuấn"

def test_login_invalid_credentials():
    res = client.post("/api/v1/auth/login", json={
        "identifier": "nonexistent_user@example.com",
        "password": "wrongpassword",
        "rememberMe": False
    })
    assert res.status_code == 401

def test_register_fails_without_terms():
    res = client.post("/api/v1/auth/register", json={
        "fullName": "Lê Văn Hùng",
        "phone": "0912345678",
        "email": "levanhung@example.com",
        "password": "mypassword123",
        "agreeTerms": False
    })
    assert res.status_code == 400
