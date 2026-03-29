from app.config.database import employees_collection


def find_all_employees():
    return list(employees_collection.find({}, {"_id": 0}))


def find_employee_by_employee_id(employee_id: str):
    return employees_collection.find_one(
        {"employee_id": employee_id},
        {"_id": 0}
    )


def find_employees_by_department(department_name: str):
    return list(employees_collection.find(
        {"department": department_name},
        {"_id": 0}
    ))


def insert_employee(employee_data: dict):
    result = employees_collection.insert_one(employee_data)
    return employees_collection.find_one(
        {"_id": result.inserted_id},
        {"_id": 0}
    )


def update_employee(employee_id: str, update_fields: dict):
    result = employees_collection.update_one(
        {"employee_id": employee_id},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        return None

    return employees_collection.find_one(
        {"employee_id": employee_id},
        {"_id": 0}
    )


def delete_employee(employee_id: str):
    result = employees_collection.delete_one({"employee_id": employee_id})

    if result.deleted_count == 0:
        return None

    return {"employee_id": employee_id}