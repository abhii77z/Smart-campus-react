import sys, os
from config import MongoDB
from datetime import datetime

def now_str():
    return datetime.utcnow().isoformat()

def create_admin():
    db = MongoDB()
    print("⚡ Force-creating Admin User...")

    # 1. Delete any existing admin to start fresh
    # (This fixes the issue if a broken/partial admin account exists)
    db.delete_one("login", {"username": "admin"})
    db.delete_one("users", {"username": "admin"})

    # 2. Create Login Document
    login_data = {
        "username": "admin",
        "password": "admin123",  # You can change this
        "usertype": "admin",
        "status":   "approved",
        "created_at": now_str()
    }
    login_oid = db.insert_one("login", login_data)

    # 3. Create User Profile Document
    user_data = {
        "username": "admin",
        "login_oid": login_oid,
        "name":     "System Admin",
        "email":    "admin@smartcampus.edu",
        "created_at": now_str()
    }
    db.insert_one("users", user_data)

    print("\n✅ Admin Created Successfully!")
    print("   Username: admin")
    print("   Password: admin123")

if __name__ == "__main__":
    create_admin()