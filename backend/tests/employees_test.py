import pytest

@pytest.fixture
def created_employee(client, employee_data):
    # create employee
    client.post("/employees", json=employee_data)

    yield employee_data  # give test access

    # cleanup after test
    client.delete(f"/employees/{employee_data['employee_id']}")

def test_get_employees(client):
    response = client.get("/employees")

    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_add_employee(client, employee_data):
    response = client.post("/employees", json=employee_data)

    assert response.status_code == 201
    assert response.json()["name"] == employee_data["name"]

    # cleanup
    client.delete(f"/employees/{employee_data['employee_id']}")

def test_update_employee(client, created_employee):
    emp_id = created_employee["employee_id"]

    updated_payload = {
        "name": "Updated Name",
        "email": "updated@example.com",
    }

    response = client.put(f"/employees/{emp_id}", json=updated_payload)

    assert response.status_code == 200
    data = response.json()

    assert data["name"] == updated_payload["name"]
    assert data["email"] == updated_payload["email"]
    assert data["position"] == created_employee["position"]
    assert data["salary"] == created_employee["salary"]
    assert data["status"] == created_employee["status"]

def test_delete_employee(client, employee_data):
    client.post("/employees", json=employee_data)

    emp_id = employee_data["employee_id"]

    delete_response = client.delete(f"/employees/{emp_id}")
    assert delete_response.status_code == 200

    get_response = client.get(f"/employees/{emp_id}")
    assert get_response.status_code == 404

def test_get_employees_by_department(client, created_employee):
    dept = created_employee["department"]

    response = client.get(f"/employees/department/{dept}")

    assert response.status_code == 200
    employees = response.json()

    assert isinstance(employees, list)
    assert any(emp["department"] == dept for emp in employees)

def test_get_employee_by_id(client, created_employee):
    emp_id = created_employee["employee_id"]

    response = client.get(f"/employees/{emp_id}")

    assert response.status_code == 200
    employee = response.json()

    assert employee["employee_id"] == emp_id
    assert employee["name"] == created_employee["name"]
    assert employee["email"] == created_employee["email"]
    assert employee["department"] == created_employee["department"]
    assert employee["position"] == created_employee["position"]
    assert employee["salary"] == created_employee["salary"]
    assert employee["status"] == created_employee["status"]