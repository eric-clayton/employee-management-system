from fastapi import HTTPException

from app.model.employee_model import (
    find_all_employees,
    insert_employee,
    find_employee_by_employee_id,
    update_employee,
    delete_employee,
    find_employees_by_department
)

from app.schemas.employee_schema import (
    Employee,
    EmployeeCreate,
    EmployeeDelete,
    EmployeeUpdate
)


# ------------------------
# GET all employees
# ------------------------
def fetch_all_employees():
    employees = find_all_employees()
    return [Employee(**emp) for emp in employees]


# ------------------------
# GET employee by ID
# ------------------------
def fetch_employee_by_employee_id(employee_id: str):
    employee = find_employee_by_employee_id(employee_id)

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return Employee(**employee)


# ------------------------
# GET employees by department
# ------------------------
def fetch_employees_by_department(department_name: str):
    employees = find_employees_by_department(department_name)
    return [Employee(**emp) for emp in employees]


# ------------------------
# POST create employee
# ------------------------
def add_employee(employee_data: EmployeeCreate):
    # duplicate check
    existing_employees = find_all_employees()

    if any(emp["employee_id"] == employee_data.employee_id for emp in existing_employees):
        raise HTTPException(status_code=400, detail="Employee with this ID already exists")

    added_employee = insert_employee(employee_data.model_dump())

    return Employee(**added_employee)


# ------------------------
# PATCH / UPDATE employee
# ------------------------
def modify_employee(employee_id: str, employee_data: EmployeeUpdate):
    # IMPORTANT: only include fields actually sent by client
    update_dict = employee_data.model_dump(exclude_unset=True)

    # prevent empty updates
    if not update_dict:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    updated_employee = update_employee(employee_id, update_dict)

    if not updated_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return Employee(**updated_employee)


# ------------------------
# DELETE employee
# ------------------------
def remove_employee(employee_id: str):
    deleted_employee = delete_employee(employee_id)

    if not deleted_employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return EmployeeDelete(**deleted_employee)