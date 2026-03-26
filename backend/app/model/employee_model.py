# Query the database for employee information
from app.config.database import employees_collection

#Get all employees from the database
def find_all_employees():
    return list(employees_collection.find({}, {"_id": 0}))  # Exclude the MongoDB _id field

#Get employees by employee ID
def find_employee_by_employee_id(employee_id: str):
    return employees_collection.find_one({"employee_id": employee_id}, {"_id": 0})  # Exclude the MongoDB _id field

#Get employees by department
def find_employees_by_department(department_name: str):
    return list(employees_collection.find({"department": department_name}, {"_id": 0}))  # Exclude the MongoDB _id field

#POST request to add a new employee
def insert_employee(employee_data: dict):
    result = employees_collection.insert_one(employee_data)
    return employees_collection.find_one({"_id": result.inserted_id}, {"_id": 0})

#UPDATE request to update an existing employee do not overwrite the entire document, only update the fields provided in the request
def update_employee(employee_id: str, employee_data: dict):
    update_fields = {k: v for k, v in employee_data.items() if v is not None}  # Only include fields that are not None
    result = employees_collection.update_one({"employee_id": employee_id}, {"$set": update_fields})
    if result.matched_count == 0:
        return None  # No employee found with the given ID
    return employees_collection.find_one({"employee_id": employee_id}, {"_id": 0})  # Return the updated employee

#DELETE request to remove an employee
def delete_employee(employee_id: str):
    result = employees_collection.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        return None
    return {"employee_id": employee_id}  # Return the deleted employee ID
