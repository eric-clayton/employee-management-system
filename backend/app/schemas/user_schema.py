from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class ActivityLog(BaseModel):
    action: str
    timestamp: datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    userid: str
    username: str
    email: EmailStr
    role: str
    activitylog: List[ActivityLog] = []