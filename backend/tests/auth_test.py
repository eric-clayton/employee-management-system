import pytest
from app.main import app


# ------------------------
# 🧪 Tests
# ------------------------

def test_register_user_success(client):
    response = client.post("/auth/register", json={
        "username": "newuser",
        "email": "new@test.com",
        "password": "strongpassword",
        "role": "user"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "User created successfully"


def test_register_duplicate_username_returns_409(client, test_user):
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "another@test.com",
        "password": "anotherpass",
        "role": "user"
    })
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"].lower()


def test_register_weak_password_returns_422(client):
    response = client.post("/auth/register", json={
        "username": "weakuser",
        "email": "weak@test.com",
        "password": "123",  # weak
        "role": "user"
    })
    assert response.status_code == 422


def test_login_success_returns_jwt(client, test_user):
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "test123"
    })
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client, test_user):
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_login_nonexistent_user_returns_401(client):
    response = client.post("/auth/login", json={
        "username": "nouser",
        "password": "any"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_protected_route_without_token_returns_401(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_protected_route_with_valid_token_succeeds(client, valid_token):
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {valid_token}"})
    assert response.status_code == 200
    assert "username" in response.json()
    assert "role" in response.json()


def test_protected_route_with_expired_token_returns_401(client, expired_token):
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401


def test_admin_route_with_user_role_returns_403(client, valid_token):
    response = client.get("/auth/admin", headers={"Authorization": f"Bearer {valid_token}"})
    assert response.status_code == 403


def test_admin_route_with_admin_token_succeeds(client, admin_token):
    response = client.get("/auth/admin", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome admin"


def test_register_missing_fields_returns_422(client):
    response = client.post("/auth/register", json={
        "username": "partialuser"
        # missing email, password
    })
    assert response.status_code == 422


def test_login_missing_fields_returns_422(client):
    response = client.post("/auth/login", json={
        "username": "testuser"
        # missing password
    })
    assert response.status_code == 422