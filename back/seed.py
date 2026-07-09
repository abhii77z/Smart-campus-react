"""
Seed script — inserts demo login + user records into smart_campus MongoDB.
Run once:  python seed.py
"""
from config import MongoDB

db = MongoDB()

# ──── Demo Credentials ─────────────────────────────────────────
DEMO_LOGINS = [
    {"username": "admin",      "password": "admin123", "usertype": "admin",   "status": "approved"},
    {"username": "faculty01",  "password": "pass123",  "usertype": "faculty", "status": "approved"},
    {"username": "student01",  "password": "pass123",  "usertype": "student", "status": "approved"},
]

DEMO_USERS = [
    {"username": "admin",      "name": "Administrator",   "email": "admin@mec.ac.in",       "department": "Administration"},
    {"username": "faculty01",  "name": "Dr. John Mathew", "email": "john@mec.ac.in",        "department": "Computer Science & Applications", "designation": "Assistant Professor", "specialization": "AI & ML"},
    {"username": "student01",  "name": "Anu Mary",        "email": "anu@student.mec.ac.in", "department": "Computer Science & Applications", "course": "BCA", "semester": "4", "roll_no": "BCA2023001"},
]

# ──── Insert (skip if username already exists) ──────────────────
for doc in DEMO_LOGINS:
    if not db.find_one("login", {"username": doc["username"]}):
        db.insert_one("login", doc)
        print(f"  ✅ login: {doc['username']}")
    else:
        print(f"  ⏭️  login: {doc['username']} (already exists)")

for doc in DEMO_USERS:
    if not db.find_one("users", {"username": doc["username"]}):
        db.insert_one("users", doc)
        print(f"  ✅ users: {doc['username']}")
    else:
        print(f"  ⏭️  users: {doc['username']} (already exists)")

print("\n🎉 Seed complete!")
