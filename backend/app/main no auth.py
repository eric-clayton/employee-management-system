#Bootstrap employee management system backend application
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.config.database import client, employees_collection
from app.routes.employee_routes import router as employee_router
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

app = FastAPI(title="Employee Management System", version="1.0.0", lifespan=lifespan)
app.include_router(employee_router, prefix="/employees")

#Health check endpoint
@app.get("/")
def health_check():
    return {"status": "ok"}
