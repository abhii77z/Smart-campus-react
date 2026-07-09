"""
seed_timetable.py — Inserts dummy timetables for students and faculty.
Run:  python seed_timetable.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from config import MongoDB
from datetime import datetime

db = MongoDB()
now = datetime.utcnow().isoformat()

# ──────────────────────────────────────────────
# 1. STUDENT TIMETABLES
# ──────────────────────────────────────────────

STUDENT_TIMETABLES = [
    {
        "timetable_type": "student",
        "department": "Computer Science & Applications",
        "course": "BCA",
        "semester": "4",
        "effective_from": "2026-03-01",
        "schedule": {
            "Monday": [
                {"subject": "Data Structures", "time": "09:00-10:00", "faculty": "Arun Kumar"},
                {"subject": "Database Management", "time": "10:15-11:15", "faculty": "Meena Nair"},
                {"subject": "Web Technologies", "time": "11:30-12:30", "faculty": "Rajan P S"},
                {"subject": "Python Programming Lab", "time": "02:00-04:00", "faculty": "Divya Menon"},
            ],
            "Tuesday": [
                {"subject": "Operating Systems", "time": "09:00-10:00", "faculty": "Biju Mathew"},
                {"subject": "Data Structures", "time": "10:15-11:15", "faculty": "Arun Kumar"},
                {"subject": "Database Management", "time": "11:30-12:30", "faculty": "Meena Nair"},
                {"subject": "Web Technologies Lab", "time": "02:00-04:00", "faculty": "Rajan P S"},
            ],
            "Wednesday": [
                {"subject": "Web Technologies", "time": "09:00-10:00", "faculty": "Rajan P S"},
                {"subject": "Python Programming", "time": "10:15-11:15", "faculty": "Divya Menon"},
                {"subject": "Operating Systems", "time": "11:30-12:30", "faculty": "Biju Mathew"},
                {"subject": "Data Structures Lab", "time": "02:00-04:00", "faculty": "Arun Kumar"},
            ],
            "Thursday": [
                {"subject": "Database Management", "time": "09:00-10:00", "faculty": "Meena Nair"},
                {"subject": "Operating Systems", "time": "10:15-11:15", "faculty": "Biju Mathew"},
                {"subject": "Python Programming", "time": "11:30-12:30", "faculty": "Divya Menon"},
                {"subject": "Networking Basics", "time": "02:00-03:00", "faculty": "Suresh Babu"},
            ],
            "Friday": [
                {"subject": "Data Structures", "time": "09:00-10:00", "faculty": "Arun Kumar"},
                {"subject": "Web Technologies", "time": "10:15-11:15", "faculty": "Rajan P S"},
                {"subject": "Networking Basics", "time": "11:30-12:30", "faculty": "Suresh Babu"},
                {"subject": "Database Lab", "time": "02:00-04:00", "faculty": "Meena Nair"},
            ],
            "Saturday": [
                {"subject": "Python Programming", "time": "09:00-10:00", "faculty": "Divya Menon"},
                {"subject": "Seminar / Project Work", "time": "10:15-12:30", "faculty": "Arun Kumar"},
            ],
        },
        "created_at": now,
    },
    {
        "timetable_type": "student",
        "department": "Computer Science & Applications",
        "course": "BSc CS",
        "semester": "2",
        "effective_from": "2026-03-01",
        "schedule": {
            "Monday": [
                {"subject": "C Programming", "time": "09:00-10:00", "faculty": "Divya Menon"},
                {"subject": "Discrete Mathematics", "time": "10:15-11:15", "faculty": "Arun Kumar"},
                {"subject": "Digital Electronics", "time": "11:30-12:30", "faculty": "Rajan P S"},
            ],
            "Tuesday": [
                {"subject": "Discrete Mathematics", "time": "09:00-10:00", "faculty": "Arun Kumar"},
                {"subject": "C Programming Lab", "time": "10:15-12:30", "faculty": "Divya Menon"},
            ],
            "Wednesday": [
                {"subject": "Digital Electronics", "time": "09:00-10:00", "faculty": "Rajan P S"},
                {"subject": "C Programming", "time": "10:15-11:15", "faculty": "Divya Menon"},
                {"subject": "English Communication", "time": "11:30-12:30", "faculty": "Meena Nair"},
            ],
            "Thursday": [
                {"subject": "C Programming", "time": "09:00-10:00", "faculty": "Divya Menon"},
                {"subject": "Digital Electronics Lab", "time": "10:15-12:30", "faculty": "Rajan P S"},
            ],
            "Friday": [
                {"subject": "Discrete Mathematics", "time": "09:00-10:00", "faculty": "Arun Kumar"},
                {"subject": "English Communication", "time": "10:15-11:15", "faculty": "Meena Nair"},
                {"subject": "Library / Self-Study", "time": "11:30-12:30", "faculty": ""},
            ],
            "Saturday": [
                {"subject": "Digital Electronics", "time": "09:00-10:00", "faculty": "Rajan P S"},
                {"subject": "Mentoring Session", "time": "10:15-11:15", "faculty": "Divya Menon"},
            ],
        },
        "created_at": now,
    },
    {
        "timetable_type": "student",
        "department": "Mathematics",
        "course": "BSc Maths",
        "semester": "3",
        "effective_from": "2026-03-01",
        "schedule": {
            "Monday": [
                {"subject": "Real Analysis", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Abstract Algebra", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
                {"subject": "Probability & Statistics", "time": "11:30-12:30", "faculty": "Sreeja Krishnan"},
            ],
            "Tuesday": [
                {"subject": "Abstract Algebra", "time": "09:00-10:00", "faculty": "Sreeja Krishnan"},
                {"subject": "Differential Equations", "time": "10:15-11:15", "faculty": "Lakshmi Devi"},
                {"subject": "Numerical Methods", "time": "11:30-12:30", "faculty": "Lakshmi Devi"},
            ],
            "Wednesday": [
                {"subject": "Real Analysis", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Probability & Statistics", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
                {"subject": "Numerical Methods Lab", "time": "02:00-04:00", "faculty": "Lakshmi Devi"},
            ],
            "Thursday": [
                {"subject": "Differential Equations", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Abstract Algebra", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
                {"subject": "Real Analysis", "time": "11:30-12:30", "faculty": "Lakshmi Devi"},
            ],
            "Friday": [
                {"subject": "Numerical Methods", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Probability & Statistics", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
                {"subject": "Seminar / Assignment", "time": "11:30-12:30", "faculty": ""},
            ],
            "Saturday": [
                {"subject": "Differential Equations", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Library / Self-Study", "time": "10:15-11:15", "faculty": ""},
            ],
        },
        "created_at": now,
    },
]

# ──────────────────────────────────────────────
# 2. FACULTY TIMETABLES
# ──────────────────────────────────────────────

FACULTY_TIMETABLES = [
    {
        "timetable_type": "faculty",
        "department": "Computer Science & Applications",
        "course": "",
        "semester": "",
        "effective_from": "2026-03-01",
        "schedule": {
            "Monday": [
                {"subject": "Data Structures (BCA S4)", "time": "09:00-10:00", "faculty": "Arun Kumar"},
                {"subject": "Database Management (BCA S4)", "time": "10:15-11:15", "faculty": "Meena Nair"},
                {"subject": "Web Technologies (BCA S4)", "time": "11:30-12:30", "faculty": "Rajan P S"},
                {"subject": "Python Lab (BCA S4)", "time": "02:00-04:00", "faculty": "Divya Menon"},
            ],
            "Tuesday": [
                {"subject": "Operating Systems (BCA S4)", "time": "09:00-10:00", "faculty": "Biju Mathew"},
                {"subject": "Data Structures (BCA S4)", "time": "10:15-11:15", "faculty": "Arun Kumar"},
                {"subject": "C Programming Lab (BSc CS S2)", "time": "10:15-12:30", "faculty": "Divya Menon"},
                {"subject": "Database Management (BCA S4)", "time": "11:30-12:30", "faculty": "Meena Nair"},
            ],
            "Wednesday": [
                {"subject": "Web Technologies (BCA S4)", "time": "09:00-10:00", "faculty": "Rajan P S"},
                {"subject": "Python Programming (BCA S4)", "time": "10:15-11:15", "faculty": "Divya Menon"},
                {"subject": "Operating Systems (BCA S4)", "time": "11:30-12:30", "faculty": "Biju Mathew"},
                {"subject": "DS Lab (BCA S4)", "time": "02:00-04:00", "faculty": "Arun Kumar"},
            ],
            "Thursday": [
                {"subject": "C Programming (BSc CS S2)", "time": "09:00-10:00", "faculty": "Divya Menon"},
                {"subject": "Database Management (BCA S4)", "time": "09:00-10:00", "faculty": "Meena Nair"},
                {"subject": "Operating Systems (BCA S4)", "time": "10:15-11:15", "faculty": "Biju Mathew"},
                {"subject": "Networking (BCA S4)", "time": "02:00-03:00", "faculty": "Suresh Babu"},
            ],
            "Friday": [
                {"subject": "Data Structures (BCA S4)", "time": "09:00-10:00", "faculty": "Arun Kumar"},
                {"subject": "Discrete Maths (BSc CS S2)", "time": "09:00-10:00", "faculty": "Arun Kumar"},
                {"subject": "Networking (BCA S4)", "time": "11:30-12:30", "faculty": "Suresh Babu"},
                {"subject": "DB Lab (BCA S4)", "time": "02:00-04:00", "faculty": "Meena Nair"},
            ],
            "Saturday": [
                {"subject": "Python (BCA S4)", "time": "09:00-10:00", "faculty": "Divya Menon"},
                {"subject": "Seminar (BCA S4)", "time": "10:15-12:30", "faculty": "Arun Kumar"},
                {"subject": "Mentoring (BSc CS S2)", "time": "10:15-11:15", "faculty": "Divya Menon"},
            ],
        },
        "created_at": now,
    },
    {
        "timetable_type": "faculty",
        "department": "Mathematics",
        "course": "",
        "semester": "",
        "effective_from": "2026-03-01",
        "schedule": {
            "Monday": [
                {"subject": "Real Analysis (BSc Maths S3)", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Abstract Algebra (BSc Maths S3)", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
                {"subject": "Probability (BSc Maths S3)", "time": "11:30-12:30", "faculty": "Sreeja Krishnan"},
            ],
            "Tuesday": [
                {"subject": "Abstract Algebra (BSc Maths S3)", "time": "09:00-10:00", "faculty": "Sreeja Krishnan"},
                {"subject": "Differential Eqns (BSc Maths S3)", "time": "10:15-11:15", "faculty": "Lakshmi Devi"},
                {"subject": "Numerical Methods (BSc Maths S3)", "time": "11:30-12:30", "faculty": "Lakshmi Devi"},
            ],
            "Wednesday": [
                {"subject": "Real Analysis (BSc Maths S3)", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Probability (BSc Maths S3)", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
                {"subject": "Num Methods Lab (BSc Maths S3)", "time": "02:00-04:00", "faculty": "Lakshmi Devi"},
            ],
            "Thursday": [
                {"subject": "Differential Eqns (BSc Maths S3)", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Abstract Algebra (BSc Maths S3)", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
                {"subject": "Real Analysis (BSc Maths S3)", "time": "11:30-12:30", "faculty": "Lakshmi Devi"},
            ],
            "Friday": [
                {"subject": "Numerical Methods (BSc Maths S3)", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
                {"subject": "Probability (BSc Maths S3)", "time": "10:15-11:15", "faculty": "Sreeja Krishnan"},
            ],
            "Saturday": [
                {"subject": "Differential Eqns (BSc Maths S3)", "time": "09:00-10:00", "faculty": "Lakshmi Devi"},
            ],
        },
        "created_at": now,
    },
]

# ──────────────────────────────────────────────
# Insert / Upsert
# ──────────────────────────────────────────────

print("── Seeding Student Timetables ──")
for tt in STUDENT_TIMETABLES:
    query = {"timetable_type": "student", "course": tt["course"], "department": tt["department"], "semester": tt["semester"]}
    existing = db.find_one("timetable", query)
    if existing:
        db.update_one("timetable", {"_id": existing["_id"]}, tt)
        print(f"  ✓ Updated: {tt['course']} Sem {tt['semester']} ({tt['department']})")
    else:
        db.insert_one("timetable", tt)
        print(f"  ✓ Created: {tt['course']} Sem {tt['semester']} ({tt['department']})")

print("\n── Seeding Faculty Timetables ──")
for tt in FACULTY_TIMETABLES:
    query = {"timetable_type": "faculty", "department": tt["department"]}
    existing = db.find_one("timetable", query)
    if existing:
        db.update_one("timetable", {"_id": existing["_id"]}, tt)
        print(f"  ✓ Updated: Faculty timetable for {tt['department']}")
    else:
        db.insert_one("timetable", tt)
        print(f"  ✓ Created: Faculty timetable for {tt['department']}")

print("""
─────────────────────────────────────────────
✅ Timetable seeding complete!

  Student Timetables:
    • BCA Semester 4            (Computer Science & Applications)
    • BSc CS Semester 2         (Computer Science & Applications)
    • BSc Maths Semester 3      (Mathematics)

  Faculty Timetables:
    • Computer Science & Applications
    • Mathematics
─────────────────────────────────────────────
""")
