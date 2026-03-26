from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from typing import List
from pydantic import BaseModel
from secrets import compare_digest

app = FastAPI()

# -----------------------
# Employee data structure
# -----------------------
class Employee(BaseModel):
    id: int
    name: str
    email: str
    position: str

# In-memory "database"
employees = [
    Employee(id=1, name="Alice", email="alice@example.com", position="Engineer"),
    Employee(id=2, name="Bob", email="bob@example.com", position="Manager"),
]

# -----------------------
# HTTP Basic setup
# -----------------------
security = HTTPBasic()

# Hardcoded users
users_db = {
    "admin": {"password": "admin123", "role": "admin"},
    "user": {"password": "user123", "role": "user"}
}

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    """
    Validate the username/password sent in HTTP Basic Auth.
    """
    user = users_db.get(credentials.username)
    if not user or not compare_digest(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return {"username": credentials.username, "role": user["role"]}

def admin_only(user=Depends(get_current_user)):
    """
    Ensure the current user has admin role.
    """
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user

# -----------------------
# Endpoints
# -----------------------

# GET /employees - any authenticated user
@app.get("/employees", response_model=List[Employee])
def read_employees(user=Depends(get_current_user)):
    return employees

# GET /employees/{id} - any authenticated user
@app.get("/employees/{id}", response_model=Employee)
def read_employee(id: int, user=Depends(get_current_user)):
    for emp in employees:
        if emp.id == id:
            return emp
    raise HTTPException(status_code=404, detail="Employee not found")

# POST /employees - admin only
@app.post("/employees", response_model=Employee)
def create_employee(employee: Employee, user=Depends(admin_only)):
    employees.append(employee)
    return employee

# PUT /employees/{id} - admin only
@app.put("/employees/{id}", response_model=Employee)
def update_employee(id: int, updated: Employee, user=Depends(admin_only)):
    for idx, emp in enumerate(employees):
        if emp.id == id:
            employees[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Employee not found")

# DELETE /employees/{id} - admin only
@app.delete("/employees/{id}")
def delete_employee(id: int, user=Depends(admin_only)):
    for idx, emp in enumerate(employees):
        if emp.id == id:
            del employees[idx]
            return {"detail": "Employee deleted"}
    raise HTTPException(status_code=404, detail="Employee not found")
