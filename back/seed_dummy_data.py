"""
seed_dummy_data.py — Inserts dummy departments, courses, 20 students and 10 faculty.
Run:  python seed_dummy_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from config import MongoDB
from datetime import datetime

db = MongoDB()

def now():
    return datetime.utcnow().isoformat()

# ──────────────────────────────────────────────
# 1. DEPARTMENTS
# ──────────────────────────────────────────────
DEPARTMENTS = [
    {"name": "Computer Science & Applications", "code": "CSA", "hod": "Dr. Poornima N"},
    {"name": "Mathematics",                      "code": "MTH", "hod": "Dr. Mathew George"},
    {"name": "Physics",                           "code": "PHY", "hod": "Dr. Sara Thomas"},
]

dept_ids = {}
for d in DEPARTMENTS:
    existing = db.find_one("departments", {"code": d["code"]})
    if existing:
        dept_ids[d["code"]] = existing["_id"]
        print(f"  Dept '{d['name']}' already exists — skipping.")
    else:
        d["created_at"] = now()
        dept_ids[d["code"]] = db.insert_one("departments", d)
        print(f"  ✓ Dept '{d['name']}' created.")

# ──────────────────────────────────────────────
# 2. COURSES
# ──────────────────────────────────────────────
COURSES = [
    {"name": "BCA",          "code": "BCA",    "department": "Computer Science & Applications", "duration": "3 years", "semesters": 6},
    {"name": "BSc CS",       "code": "BSCCS",  "department": "Computer Science & Applications", "duration": "3 years", "semesters": 6},
    {"name": "BSc Maths",    "code": "BSCMTH", "department": "Mathematics",                      "duration": "3 years", "semesters": 6},
    {"name": "BSc Physics",  "code": "BSCPHY", "department": "Physics",                          "duration": "3 years", "semesters": 6},
]

for c in COURSES:
    existing = db.find_one("courses", {"code": c["code"]})
    if existing:
        print(f"  Course '{c['name']}' already exists — skipping.")
    else:
        c["created_at"] = now()
        db.insert_one("courses", c)
        print(f"  ✓ Course '{c['name']}' created.")

# ──────────────────────────────────────────────
# 3. FACULTY (10)
# ──────────────────────────────────────────────
FACULTY = [
    {"username": "fac_arun",    "name": "Arun Kumar",      "email": "arun.kumar@campus.edu",    "department": "Computer Science & Applications", "designation": "Assistant Professor", "specialization": "Data Structures & Algorithms", "phone": "9876543210"},
    {"username": "fac_meena",   "name": "Meena Nair",      "email": "meena.nair@campus.edu",    "department": "Computer Science & Applications", "designation": "Associate Professor", "specialization": "Database Systems",            "phone": "9876543211"},
    {"username": "fac_rajan",   "name": "Rajan P S",       "email": "rajan.ps@campus.edu",      "department": "Computer Science & Applications", "designation": "Assistant Professor", "specialization": "Web Technologies",            "phone": "9876543212"},
    {"username": "fac_divya",   "name": "Divya Menon",     "email": "divya.menon@campus.edu",   "department": "Computer Science & Applications", "designation": "Assistant Professor", "specialization": "Python & AI",                 "phone": "9876543213"},
    {"username": "fac_suresh",  "name": "Suresh Babu",     "email": "suresh.babu@campus.edu",   "department": "Computer Science & Applications", "designation": "Professor",           "specialization": "Networking & Security",       "phone": "9876543214"},
    {"username": "fac_lakshmi", "name": "Lakshmi Devi",    "email": "lakshmi.devi@campus.edu",  "department": "Mathematics",                      "designation": "Assistant Professor", "specialization": "Calculus & Linear Algebra",   "phone": "9876543215"},
    {"username": "fac_sreeja",  "name": "Sreeja Krishnan", "email": "sreeja.krishnan@campus.edu","department": "Mathematics",                     "designation": "Associate Professor", "specialization": "Statistics & Probability",    "phone": "9876543216"},
    {"username": "fac_thomas",  "name": "Thomas Varghese", "email": "thomas.v@campus.edu",      "department": "Physics",                          "designation": "Assistant Professor", "specialization": "Optics & Photonics",          "phone": "9876543217"},
    {"username": "fac_asha",    "name": "Asha Joseph",     "email": "asha.joseph@campus.edu",   "department": "Physics",                          "designation": "Associate Professor", "specialization": "Quantum Mechanics",           "phone": "9876543218"},
    {"username": "fac_biju",    "name": "Biju Mathew",     "email": "biju.mathew@campus.edu",   "department": "Computer Science & Applications", "designation": "Assistant Professor", "specialization": "Operating Systems",           "phone": "9876543219"},
]

print("\n── Faculty ──")
for f in FACULTY:
    if db.find_one("login", {"username": f["username"]}):
        print(f"  Faculty '{f['username']}' already exists — skipping.")
        continue
    db.insert_one("login", {
        "username": f["username"], "password": "faculty@123",
        "usertype": "faculty", "status": "approved", "created_at": now(),
    })
    db.insert_one("users", {
        "username":       f["username"],
        "name":           f["name"],
        "email":          f["email"],
        "phone":          f.get("phone", ""),
        "department":     f["department"],
        "designation":    f.get("designation", ""),
        "specialization": f.get("specialization", ""),
        "created_at":     now(),
    })
    print(f"  ✓ Faculty '{f['name']}' ({f['username']}) created  →  password: faculty@123")

# ──────────────────────────────────────────────
# 4. STUDENTS (20)
# ──────────────────────────────────────────────
STUDENTS = [
    # BCA Computer Science & Applications — Sem 4
    {"username": "stu_adithyan",  "name": "Adithyan Manoj",   "email": "adithyan.m@student.edu",  "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023001"},
    {"username": "stu_amitha",    "name": "Amitha Suresh",    "email": "amitha.s@student.edu",    "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023002"},
    {"username": "stu_arjun",     "name": "Arjun Nair",       "email": "arjun.n@student.edu",     "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023003"},
    {"username": "stu_bindhu",    "name": "Bindhu Thomas",    "email": "bindhu.t@student.edu",    "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023004"},
    {"username": "stu_devan",     "name": "Devan George",     "email": "devan.g@student.edu",     "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023005"},
    {"username": "stu_fathima",   "name": "Fathima Beevi",    "email": "fathima.b@student.edu",   "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023006"},
    {"username": "stu_gopika",    "name": "Gopika Rajan",     "email": "gopika.r@student.edu",    "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023007"},
    {"username": "stu_harikrishna","name":"Harikrishna V",    "email": "hari.v@student.edu",      "department": "Computer Science & Applications", "course": "BCA",       "semester": "4", "roll_no": "BCA2023008"},
    # BSc CS — Sem 2
    {"username": "stu_jisha",     "name": "Jisha Mathew",     "email": "jisha.m@student.edu",     "department": "Computer Science & Applications", "course": "BSc CS",    "semester": "2", "roll_no": "BSCCS2024001"},
    {"username": "stu_kiran",     "name": "Kiran Jose",       "email": "kiran.j@student.edu",     "department": "Computer Science & Applications", "course": "BSc CS",    "semester": "2", "roll_no": "BSCCS2024002"},
    {"username": "stu_lekshmi",   "name": "Lekshmi Das",      "email": "lekshmi.d@student.edu",   "department": "Computer Science & Applications", "course": "BSc CS",    "semester": "2", "roll_no": "BSCCS2024003"},
    {"username": "stu_midhun",    "name": "Midhun Krishnan",  "email": "midhun.k@student.edu",    "department": "Computer Science & Applications", "course": "BSc CS",    "semester": "2", "roll_no": "BSCCS2024004"},
    {"username": "stu_navya",     "name": "Navya Pillai",     "email": "navya.p@student.edu",     "department": "Computer Science & Applications", "course": "BSc CS",    "semester": "2", "roll_no": "BSCCS2024005"},
    # BSc Maths — Sem 3
    {"username": "stu_om",        "name": "Om Prakash",       "email": "om.p@student.edu",        "department": "Mathematics",                      "course": "BSc Maths", "semester": "3", "roll_no": "BSCMTH2023001"},
    {"username": "stu_parvathy",  "name": "Parvathy Nair",    "email": "parvathy.n@student.edu",  "department": "Mathematics",                      "course": "BSc Maths", "semester": "3", "roll_no": "BSCMTH2023002"},
    {"username": "stu_qasim",     "name": "Qasim Ali",        "email": "qasim.a@student.edu",     "department": "Mathematics",                      "course": "BSc Maths", "semester": "3", "roll_no": "BSCMTH2023003"},
    # BSc Physics — Sem 5
    {"username": "stu_roshni",    "name": "Roshni Jacob",     "email": "roshni.j@student.edu",    "department": "Physics",                          "course": "BSc Physics","semester": "5", "roll_no": "BSCPHY2022001"},
    {"username": "stu_sajan",     "name": "Sajan Paul",       "email": "sajan.p@student.edu",     "department": "Physics",                          "course": "BSc Physics","semester": "5", "roll_no": "BSCPHY2022002"},
    {"username": "stu_treasa",    "name": "Treasa Kurian",    "email": "treasa.k@student.edu",    "department": "Physics",                          "course": "BSc Physics","semester": "5", "roll_no": "BSCPHY2022003"},
    {"username": "stu_unais",     "name": "Unais Mohammed",   "email": "unais.m@student.edu",     "department": "Physics",                          "course": "BSc Physics","semester": "5", "roll_no": "BSCPHY2022004"},
]

print("\n── Students ──")
for s in STUDENTS:
    if db.find_one("login", {"username": s["username"]}):
        print(f"  Student '{s['username']}' already exists — skipping.")
        continue
    db.insert_one("login", {
        "username": s["username"], "password": "student@123",
        "usertype": "student", "status": "approved", "created_at": now(),
    })
    db.insert_one("users", {
        "username":   s["username"],
        "name":       s["name"],
        "email":      s["email"],
        "phone":      "",
        "department": s["department"],
        "course":     s["course"],
        "semester":   s["semester"],
        "roll_no":    s["roll_no"],
        "created_at": now(),
    })
    print(f"  ✓ Student '{s['name']}' ({s['username']}) created  →  password: student@123")

print("""
─────────────────────────────────────────────
✅  Seeding complete!

Default credentials:
  Admin    →  admin / admin123
  Faculty  →  fac_arun / faculty@123  (and 9 more)
  Students →  stu_adithyan / student@123  (and 19 more)
─────────────────────────────────────────────
""")
