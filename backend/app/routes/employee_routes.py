#All API routes related to employee operations
import datetime

from fastapi import APIRouter, Depends
from app.controller.employee_controller import add_employee, fetch_all_employees, fetch_employee_by_employee_id, modify_employee, remove_employee, fetch_employees_by_department
from app.schemas.employee_schema import Employee, EmployeeCreate, EmployeeDelete, EmployeeUpdate
from app.utils.utils import admin_required, get_current_user

router = APIRouter()

#GET endpoint to retrieve all employees should be logged in as a user
@router.get("/", response_model=list[Employee])
def get_employees(user=Depends(get_current_user)):
    return fetch_all_employees()

#GET endpoint to retrieve an employee by ID should be logged in as a user
@router.get("/{employee_id}", response_model=Employee)
def get_employee_by_id(employee_id: str, user=Depends(get_current_user)):
    return fetch_employee_by_employee_id(employee_id)

#GET endpoint to retrieve employees by department should be logged in as a user
@router.get("/department/{department_name}", response_model=list[Employee])
def get_employees_by_department(department_name: str, user=Depends(get_current_user)):
    return fetch_employees_by_department(department_name)

#POST endpoint to add a new employee should be logged in as an admin user
@router.post("/", response_model=EmployeeCreate, status_code=201)
def create_employee(employee: EmployeeCreate, user=Depends(admin_required)):
    return add_employee(employee)

#UPDATE endpoint to update an existing employee should be logged in as an admin user
@router.put("/{employee_id}", response_model=Employee)
def update_employee(employee_id: str, employee_data: EmployeeUpdate, user=Depends(admin_required)):
    return modify_employee(employee_id, employee_data)

#DELETE endpoint to remove an employee should be logged in as an admin user
@router.delete("/{employee_id}", response_model=EmployeeDelete)
def delete_employee(employee_id: str, user=Depends(admin_required)):
    return remove_employee(employee_id)