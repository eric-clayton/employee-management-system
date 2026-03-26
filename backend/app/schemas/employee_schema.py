#Define Employee schema for data validation and serialization
from pydantic import BaseModel, EmailStr
import datetime

class Employee(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    position: str
    department: str
    salary: float
    status: str

class EmployeeResponse(BaseModel):
    id: str
    createdAt: str

class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    position: str
    department: str
    salary: float
    status: str
    createdAt: str = datetime.datetime.now().isoformat()

#Schema for updating employee information
class EmployeeUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    position: str | None = None
    department: str | None = None
    salary: float | None = None
    status: str | None = None

#Schema for deleting an employee
class EmployeeDelete(BaseModel):
    employee_id: str