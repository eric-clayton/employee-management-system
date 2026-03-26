from app.config.database import users_collection
from bson import ObjectId
from datetime import datetime

def create_user(user_data: dict):
    return users_collection.insert_one(user_data)

def get_user_by_username(username: str):
    return users_collection.find_one({"username": username})

def log_user_activity(user_id: str, action: str):
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$push": {
                "activitylog": {
                    "action": action,
                    "timestamp": datetime.utcnow()
                }
            }
        }
    )