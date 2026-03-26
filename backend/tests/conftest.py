import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
  return TestClient(app)

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

