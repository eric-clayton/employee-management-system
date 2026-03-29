#Define Employee schema for data validation and serialization
from typing import Optional

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
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[float] = None
    status: Optional[str] = None

#Schema for deleting an employee
class EmployeeDelete(BaseModel):
    employee_id: str