import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config.database import users_collection
from app.utils.utils import create_access_token, hash_password
from datetime import timedelta

@pytest.fixture
def client():
  return TestClient(app)

@pytest.fixture(autouse=True)
def clear_db():
    """Clear users collection before and after each test"""
    users_collection.delete_many({})
    yield
    users_collection.delete_many({})

@pytest.fixture
def test_user():
    """Insert a normal user"""
    user = {
        "username": "testuser",
        "email": "test@test.com",
        "password": hash_password("test123"),
        "role": "user",
        "activitylog": []
    }
    result = users_collection.insert_one(user)
    user["_id"] = result.inserted_id
    return user


@pytest.fixture
def admin_user():
    """Insert an admin user"""
    user = {
        "username": "admin",
        "email": "admin@test.com",
        "password": hash_password("admin123"),
        "role": "admin",
        "activitylog": []
    }
    result = users_collection.insert_one(user)
    user["_id"] = result.inserted_id
    return user

@pytest.fixture
def valid_token(test_user):
    return create_access_token({
        "username": test_user["username"],
        "role": test_user["role"],
        "user_id": str(test_user["_id"])
    })

@pytest.fixture
def admin_token(admin_user):
    return create_access_token({
        "username": admin_user["username"],
        "role": admin_user["role"],
        "user_id": str(admin_user["_id"])
    })

@pytest.fixture
def expired_token(test_user):
    return create_access_token(
        {"username": test_user["username"], "role": test_user["role"], "user_id": str(test_user["_id"])},
        expires_delta=timedelta(seconds=-1)
    )


def pytest_addoption(parser):
    parser.addoption("--empid", action="store", default="EMP1000")
    parser.addoption("--name", action="store", default="Test User")
    parser.addoption("--email", action="store", default="test.user@example.com")
    parser.addoption("--department", action="store", default="IT")
    parser.addoption("--position", action="store", default="Tester")
    parser.addoption("--salary", action="store", type=float, default=50000.0)
    parser.addoption("--status", action="store", default="Active")

@pytest.fixture
def employee_data(request):
    return {
        "employee_id": request.config.getoption("--empid"),
        "name": request.config.getoption("--name"),
        "email": request.config.getoption("--email"),
        "department": request.config.getoption("--department"),
        "position": request.config.getoption("--position"),
        "salary": request.config.getoption("--salary"),
        "status": request.config.getoption("--status"),
    }

@pytest.fixture
def user_headers(valid_token):
    return {"Authorization": f"Bearer {valid_token}"}

@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}