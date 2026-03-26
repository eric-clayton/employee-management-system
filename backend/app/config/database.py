#Database configuration file
import os
from dotenv import load_dotenv
from pymongo import MongoClient
# Load environment variables from .env file
load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DATABASE_NAME")]
employees_collection = db["employees"]
users_collection = db["users"]