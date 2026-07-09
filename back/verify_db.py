from config import MongoDB

db = MongoDB()

print(f"1.  Connected to Database Name: '{db.db.name}'")
print(f"2.  Checking for Admin...")

admin = db.find_one("login", {"username": "admin"})

if admin:
    print(f"    ✅ FOUND Admin! ID: {admin['_id']}")
else:
    print(f"    ❌ Admin NOT found. (Did you run seed_admin.py?)")

print(f"3.  Checking for Students...")
count = len(db.find_all("login", {"usertype": "student"}))
print(f"    Found {count} students.")