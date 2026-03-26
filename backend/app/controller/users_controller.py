from app.model.user_model import create_user, get_user_by_username, log_user_activity
from app.utils.utils import hash_password, verify_password, create_access_token
from fastapi import HTTPException

def register_user(user):
    existing = get_user_by_username(user.username)
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")
    #if user password is weak then raise an error
    if len(user.password) < 6:
        raise HTTPException(status_code=422, detail="Password must be at least 6 characters long")

    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "activitylog": []
    }

    result = create_user(user_data)

    # Log activity
    log_user_activity(str(result.inserted_id), "User Registered")

    return {"message": "User created successfully"}

def login_user(user):
    db_user = get_user_by_username(user.username)

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "username": db_user["username"],
        "role": db_user["role"],
        "user_id": str(db_user["_id"])
    })

    # Log activity
    log_user_activity(str(db_user["_id"]), "User Logged In")

    return {"access_token": token, "token_type": "bearer"}