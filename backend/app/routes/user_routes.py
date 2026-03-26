from fastapi import APIRouter, Depends
from app.schemas.user_schema import UserCreate, UserLogin
from app.controller.users_controller import register_user, login_user
from app.utils.utils import admin_required, get_current_user

router = APIRouter()

@router.post("/register")
def register(user: UserCreate):
    return register_user(user)

@router.post("/login")
def login(user: UserLogin):
    return login_user(user)

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return user
@router.get("/admin")
def admin_route(user=Depends(admin_required)):
    return {"message": "Welcome admin"}