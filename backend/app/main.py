#Bootstrap employee management system backend application
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.config.database import client, employees_collection
from app.routes.employee_routes import router as employee_router
from app.routes.user_routes import router as user_routes
from fastapi.middleware.cors import CORSMiddleware
#Import the context manager for handling application lifespan events startup and shutdown code
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    try:
        info = client.server_info()  # Attempt to connect to the database
        print("Database connection successful")
        # Initialize database connection or other resources here

        print("Starting up the Employee Management System...")
        # For example, you could connect to a database here
    except Exception as e:
        print("Database connection failed:", e)
        # Handle the exception, log it, or raise an error to prevent the app from starting
        raise e
    yield
    # Shutdown code
    print("Shutting down the Employee Management System...")


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app = FastAPI(title="Employee Management System", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(employee_router, prefix="/employees")
app.include_router(user_routes, prefix="/auth", tags=["Users"])
