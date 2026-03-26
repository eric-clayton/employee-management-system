from random import randint

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test cases for the GET /employees endpoint to list all employees
def test_get_employees():
    response = client.get("/employees")
    assert response.status_code == 200
    assert isinstance(response.json(), list)  # Assuming it returns a list of employees

# Test case for POST /employee endpoint to create a new employee
def test_add_employee():
    payload = {
        "employee_id": "E001",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "position": "Software Engineer",
        "department": "IT",
        "salary": 60000.0,
        "status": "Active",
    }
    response = client.post("/employees", json=payload)
    assert response.status_code == 201  # returns 201 Created
    assert response.json()["name"] == payload["name"]  # Check if the name matches
    # Delete the created employee to clean up the database
    client.delete(f"/employees/{payload['employee_id']}")

#Update an employee test case /employees/{employee_id}
def test_update_employee():
    # First, create a new employee to update if it does not already exist
    payload = {
        "employee_id": "E002",
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "position": "QA Engineer",
        "department": "Quality Assurance",
        "salary": 65000.0,
        "status": "Active",
    }
    client.post("/employees", json=payload)

    # Now, update the employee's information
    updated_payload = {
        "name": "Alice Johnson Updated",
        "email": "alice.johnson.updated@example.com",
    }
    employee_id = payload["employee_id"]
    update_response = client.put(f"/employees/{employee_id}", json=updated_payload)
    assert update_response.status_code == 200
    updated_employee = update_response.json()
    assert updated_employee["name"] == updated_payload["name"]
    assert updated_employee["email"] == updated_payload["email"]
    assert updated_employee["position"] == payload["position"]  # Unchanged fields should remain the same
    assert updated_employee["salary"] ==  payload["salary"]
    assert updated_employee["status"] == payload["status"]


#Delete an employee test case /employees/{employee_id}
def test_delete_employee():
    # First, create a new employee to delete
    payload = {
        "employee_id": "E003",
        "name": "Bob Williams",
        "email": "bob.williams@example.com",
        "position": "DevOps Engineer",
        "department": "IT",
        "salary": 70000.0,
        "status": "Active",
    }

    client.post("/employees", json=payload)
    employee_id = payload["employee_id"]
    # Now, delete the employee
    delete_response = client.delete(f"/employees/{employee_id}")
    assert delete_response.status_code == 200
    # Try to retrieve the deleted employee to confirm deletion
    get_response = client.get(f"/employees/{employee_id}")
    assert get_response.status_code == 404 # Assuming it returns 404 Not Found for non-existent employee



#Get an employee by department test case /employees/department/{department_name}
def test_get_employees_by_department():
    department_name = "IT"
    response = client.get(f"/employees/department/{department_name}")
    assert response.status_code == 200
    employees = response.json()
    assert isinstance(employees, list)
    for employee in employees:
        assert employee["department"] == department_name

#Get an employee by ID test case /employees/{employee_id}
def test_get_employee_by_id():
    # First, create a new employee to retrieve if it does not already exist
    payload = {
        "employee_id": "E004",
        "name": "Charlie Brown",
        "email": "charlie.brown@example.com",
        "position": "Business Analyst",
        "department": "Business",
        "salary": 65000.0,
        "status": "Active",
    }
    client.post("/employees", json=payload)
    employee_id = payload["employee_id"]
    # Now, retrieve the employee by ID
    response = client.get(f"/employees/{employee_id}")
    assert response.status_code == 200
    employee = response.json()
    assert employee["employee_id"] == employee_id
    assert employee["name"] == payload["name"]