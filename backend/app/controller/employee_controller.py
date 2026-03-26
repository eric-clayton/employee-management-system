#Controller for employee-related operations/ business logic

from fastapi import HTTPException

from app.model.employee_model import find_all_employees, insert_employee, find_employee_by_employee_id, update_employee, delete_employee, find_employees_by_department
from app.schemas.employee_schema import Employee, EmployeeCreate, EmployeeDelete, EmployeeDelete, EmployeeUpdate

#GET request handler to retrieve all employees
def fetch_all_employees():
    employees = find_all_employees()
    return [Employee(**employee) for employee in employees]  # Convert dicts to Employee objects

#GET request handler to retrieve an employee by ID
def fetch_employee_by_employee_id(employee_id: str):
    employee = find_employee_by_employee_id(employee_id)
    if employee:
        return Employee(**employee)  # Convert dict to Employee object
    else:
        raise HTTPException(status_code=404, detail="Employee not found")

#GET request handler to retrieve employees by department
def fetch_employees_by_department(department_name: str):
    employees = find_employees_by_department(department_name)
    return [Employee(**employee) for employee in employees]  # Convert dicts to Employee objects

#POST request add a new employee
def add_employee(employee_data: EmployeeCreate):
    #check if duplicate employeeId exists
    existing_employees = find_all_employees()
    if any(emp['employee_id'] == employee_data.employee_id for emp in existing_employees):
        raise HTTPException(status_code=400, detail="Employee with this ID already exists")
    added_employee = insert_employee(employee_data.model_dump())  # Convert Employee object to dict for database insertion
    return Employee(**added_employee)  # Convert the added employee dict back to an Employee object

#UPDATE request handler to update an existing employee
def modify_employee(employee_id: str, employee_data: EmployeeUpdate):
    updated_employee = update_employee(employee_id, employee_data.model_dump())  # Convert EmployeeUpdate to dict for database update
    if updated_employee:
        return Employee(**updated_employee)  # Convert the updated employee dict back to an Employee object
    else:
        raise HTTPException(status_code=404, detail="Employee not found")

#DELETE request handler to remove an employee
def remove_employee(employee_id: str):
    deleted_employee = delete_employee(employee_id)  # Call the model function to delete the employee
    if deleted_employee:
        return EmployeeDelete(**deleted_employee) 
    else:
        raise HTTPException(status_code=404, detail="Employee not found")