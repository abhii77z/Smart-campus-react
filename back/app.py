# """
# Smart Campus — Complete Flask Backend  (v2 — username-based auth)
# =================================================================
# Auth flow:
#   • User registers / logs in with  username + password
#   • MongoDB auto-generates  _id  for every login document
#   • On login the backend returns  { user: { login_id: <_id string>, role, name } }
#   • Every subsequent request sends the header  Login-Id: <_id string>
#   • Backend resolves the caller by looking up that  _id  in the login collection

# Collections used:
#   login, users, departments, courses, timetable, announcements, events,
#   attendance, exams, materials, appointments, grievances, faqs, settings
# """
# import os
# from flask import Flask, request, jsonify, g, send_from_directory
# from flask_cors import CORS
# from config import MongoDB, oid
# from functools import wraps
# from datetime import datetime

# # ─── 1. SETUP & STATIC SERVING ──────────────────────────────────────
# app = Flask(__name__)
# CORS(app)
# db = MongoDB()

# # Force Flask to find the 'frontend' folder next to 'backend'
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# FRONTEND_FOLDER = os.path.join(BASE_DIR, '..', 'frontend')
# FRONTEND_FOLDER = os.path.abspath(FRONTEND_FOLDER)

# print(f"\n🔍 SERVING FRONTEND FROM: {FRONTEND_FOLDER}")

# @app.route('/')
# def index():
#     # Serves login.html when you go to http://localhost:5000/
#     return send_from_directory(FRONTEND_FOLDER, 'login.html')

# @app.route('/<path:filename>')
# def serve_static(filename):
#     # Serves api.js, css, etc.
#     return send_from_directory(FRONTEND_FOLDER, filename)

# # ─── 2. HELPERS ─────────────────────────────────────────────────────

# def now_str():
#     return datetime.utcnow().isoformat()

# def current_user():
#     lid = request.headers.get("Login-Id")
#     if not lid: return None
#     try: return db.find_one("login", {"_id": oid(lid)})
#     except: return None

# def require_role(*roles):
#     def decorator(fn):
#         @wraps(fn)
#         def wrapper(*args, **kwargs):
#             user = current_user()
#             if not user: return jsonify({"error": "Unauthorized"}), 401
#             if roles and user.get("usertype") not in roles:
#                 return jsonify({"error": "Forbidden"}), 403
#             g.login = user
#             return fn(*args, **kwargs)
#         return wrapper
#     return decorator

# def user_profile(username):
#     return db.find_one("users", {"username": username})




"""
Smart Campus — Complete Flask Backend  (v2.1 — Subject-wise Attendance)
=================================================================
"""
import os
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from config import MongoDB, oid
from functools import wraps
from datetime import datetime
import uuid

# ─── 1. SETUP (React Vite frontend — no static serving needed) ──────
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     supports_credentials=True)
db = MongoDB()


print("\n🚀 Smart Campus API running — React frontend on :5173, API on :5000")

# ─── 2. HELPERS ─────────────────────────────────────────────────────

def now_str():
    return datetime.utcnow().isoformat()

def current_user():
    lid = request.headers.get("Login-Id")
    if not lid: return None
    try: return db.find_one("login", {"_id": oid(lid)})
    except: return None

def require_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user: return jsonify({"error": "Unauthorized"}), 401
            if roles and user.get("usertype") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            g.login = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def user_profile(username):
    return db.find_one("users", {"username": username})

# ─── MOCK SUBJECTS HELPER (Since we don't have a subjects collection yet) ──
# In a real app, this would come from a 'subjects' collection
SUBJECT_MAPPING = {
    "BCA": ["Data Structures", "Web Programming", "Mathematics", "Operating Systems", "Software Engineering"],
    "BSc CS": ["Python Programming", "Artificial Intelligence", "Digital Electronics", "Database Systems"],
    "BSc Maths": ["Calculus", "Linear Algebra", "Statistics", "Differential Equations"],
    "BSc Physics": ["Quantum Mechanics", "Optics", "Thermodynamics", "Electromagnetism"],
    "default": ["General Subject", "Lab Session", "Seminar"]
}

# ═══════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════

# @app.route("/api/auth/login", methods=["POST","GET"])
# def auth_login():
#     print("hai")
#     body     = request.get_json() or {}
#     print("body",body)
#     username = body.get("username", "").strip()
#     print("username",username)
#     password = body.get("password", "")

#     if not username or not password:
#         return jsonify({"error": "Username and password are required"}), 400

#     login_doc = db.find_one("login", {"username": username, "password": password})
#     if not login_doc:
#         return jsonify({"error": "Invalid username or password"}), 401

#     if login_doc.get("status") == "pending":
#         return jsonify({"error": "Account pending admin approval"}), 403
#     if login_doc.get("status") == "rejected":
#         return jsonify({"error": "Account registration was rejected"}), 403

#     profile = user_profile(username) or {}

#     return jsonify({
#         "user": {
#             # login_id = MongoDB _id — used as the auth token in Login-Id header
#             "login_id": login_doc["_id"],
#             "role":     login_doc.get("usertype"),
#             "name":     profile.get("name", username),
#             "email":    profile.get("email", ""),
#             "username": username,
#         }
#     })



# @app.route("/api/auth/login", methods=["POST", "GET"])
# def auth_login():
#     print("\n--- LOGIN ATTEMPT ---")
    
#     # 1. robustly get data (JSON or Form)
#     data = request.get_json(silent=True)
#     if not data:
#         data = request.form
    
#     print(f"DEBUG: Received Body: {data}")

#     # 2. Extract username (Handle mismatch where frontend sends 'login_id')
#     # We check for 'username' FIRST, if that's missing, we check 'login_id'
#     username = data.get("username") or data.get("login_id") or ""
#     username = username.strip()
    
#     password = data.get("password", "")

#     print(f"DEBUG: Parsed -> Username: '{username}', Password: [HIDDEN]")

#     if not username or not password:
#         return jsonify({"error": "Username/Login ID and password are required"}), 400

#     # 3. Database Lookup
#     login_doc = db.find_one("login", {"username": username, "password": password})
    
#     if not login_doc:
#         print(f"DEBUG: Login failed for '{username}'")
#         return jsonify({"error": "Invalid username or password"}), 401

#     if login_doc.get("status") == "pending":
#         return jsonify({"error": "Account pending admin approval"}), 403
#     if login_doc.get("status") == "rejected":
#         return jsonify({"error": "Account registration was rejected"}), 403

#     profile = user_profile(username) or {}

#     print(f"DEBUG: Login Success for {username}")
    
#     return jsonify({
#         "user": {
#             "login_id": str(login_doc["_id"]),
#             "role":     login_doc.get("usertype"),
#             "name":     profile.get("name", username),
#             "email":    profile.get("email", ""),
#             "username": username,
#         }
#     })


# @app.route("/api/auth/register/<role>", methods=["POST"])
# def auth_register(role):
#     if role not in ("student", "faculty"):
#         return jsonify({"error": "Invalid role"}), 400

#     body     = request.get_json() or {}
#     username = body.get("username", "").strip()
#     password = body.get("password", "")

#     if not username or not password:
#         return jsonify({"error": "Username and password are required"}), 400
#     if len(password) < 6:
#         return jsonify({"error": "Password must be at least 6 characters"}), 400

#     if db.find_one("login", {"username": username}):
#         return jsonify({"error": "Username already taken"}), 409

#     # MongoDB auto-generates _id
#     login_oid = db.insert_one("login", {
#         "username":   username,
#         "password":   password,
#         "usertype":   role,
#         "status":     "pending",
#         "created_at": now_str(),
#     })

#     profile = {
#         "username":   username,
#         "login_oid":  login_oid,
#         "name":       body.get("name", ""),
#         "email":      body.get("email", ""),
#         "phone":      body.get("phone", ""),
#         "department": body.get("department", ""),
#         "created_at": now_str(),
#     }
#     if role == "student":
#         profile.update({
#             "course":   body.get("course", ""),
#             "semester": body.get("semester", ""),
#             "roll_no":  body.get("roll_no", ""),
#         })
#     else:
#         profile.update({
#             "designation":    body.get("designation", ""),
#             "specialization": body.get("specialization", ""),
#         })

#     db.insert_one("users", profile)
#     return jsonify({"message": "Registration submitted — awaiting admin approval."}), 201


# ═══════════════════════════════════════════════════════════════
# ADMIN — Dashboard
# ═══════════════════════════════════════════════════════════════

# @app.route("/api/admin/dashboard", methods=["GET"])
# @require_role("admin")
# def admin_dashboard():
#     return jsonify({
#         "system_overview": {
#             "total_students":    len(db.find_all("login", {"usertype": "student",  "status": "approved"})),
#             "total_faculty":     len(db.find_all("login", {"usertype": "faculty",  "status": "approved"})),
#             "pending_approvals": len(db.find_all("login", {"status": "pending"})),
#             "total_departments": len(db.find_all("departments")),
#             "total_courses":     len(db.find_all("courses")),
#         },
#         "activity_trends": {
#             "total_announcements": len(db.find_all("announcements")),
#             "pending_events":      len(db.find_all("events", {"status": "pending"})),
#         }
#     })


# ═══════════════════════════════════════════════════════════════
# ADMIN — User Management / Approvals
# ═══════════════════════════════════════════════════════════════

@app.route("/api/admin/users/pending", methods=["GET"])
@require_role("admin")
def admin_users_pending():
    result = []
    for l in db.find_all("login", {"status": "pending"}):
        p = user_profile(l.get("username")) or {}
        result.append({
            "_id":        l["_id"],
            "username":   l.get("username"),
            "usertype":   l.get("usertype"),
            "status":     l.get("status"),
            "name":       p.get("name"),
            "email":      p.get("email"),
            "department": p.get("department"),
            "created_at": l.get("created_at"),
        })
    return jsonify({"pending_users": result})


@app.route("/api/admin/users", methods=["GET"])
@require_role("admin")
def admin_users_all():
    result = []
    for l in db.find_all("login", {"usertype": {"$in": ["student", "faculty"]}}):
        p = user_profile(l.get("username")) or {}
        result.append({
            "_id":        l["_id"],
            "username":   l.get("username"),
            "usertype":   l.get("usertype"),
            "status":     l.get("status", "approved"),
            "name":       p.get("name"),
            "email":      p.get("email"),
            "department": p.get("department"),
        })
    return jsonify({"users": result})


@app.route("/api/admin/users/approve/<user_id>", methods=["PUT"])
@require_role("admin")
def admin_approve_user(user_id):
    if not db.update_one("login", {"_id": oid(user_id)}, {"status": "approved"}):
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User approved"})


@app.route("/api/admin/users/reject/<user_id>", methods=["PUT"])
@require_role("admin")
def admin_reject_user(user_id):
    if not db.update_one("login", {"_id": oid(user_id)}, {"status": "rejected"}):
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": "User rejected"})


@app.route("/api/admin/users/<user_id>", methods=["DELETE"])
@require_role("admin")
def admin_delete_user(user_id):
    login_doc = db.find_one("login", {"_id": oid(user_id)})
    if not login_doc:
        return jsonify({"error": "User not found"}), 404
    db.delete_one("users", {"username": login_doc.get("username")})
    db.delete_one("login", {"_id": oid(user_id)})
    return jsonify({"message": "User deleted"})


@app.route("/api/admin/users/<user_id>/department", methods=["PUT"])
@require_role("admin")
def admin_assign_department(user_id):
    """Assign a department to a faculty (or student) user."""
    body = request.get_json() or {}
    department = body.get("department", "").strip()
    if not department:
        return jsonify({"error": "Department is required"}), 400

    login_doc = db.find_one("login", {"_id": oid(user_id)})
    if not login_doc:
        return jsonify({"error": "User not found"}), 404

    username = login_doc.get("username")
    # Update department on the user profile
    db.update_one("users", {"username": username}, {"department": department})
    return jsonify({"message": f"Department set to '{department}' for {username}"})


# ═══════════════════════════════════════════════════════════════
# ADMIN — Departments
# ═══════════════════════════════════════════════════════════════

@app.route("/api/admin/departments", methods=["GET"])
@require_role("admin")
def admin_get_departments():
    return jsonify({"departments": db.find_all("departments")})

@app.route("/api/admin/departments", methods=["POST"])
@require_role("admin")
def admin_create_department():
    body = request.get_json() or {}
    body["created_at"] = now_str()
    return jsonify({"_id": db.insert_one("departments", body), "message": "Department created"}), 201

@app.route("/api/admin/departments/<dept_id>", methods=["PUT"])
@require_role("admin")
def admin_update_department(dept_id):
    body = request.get_json() or {}
    body.pop("_id", None)
    db.update_one("departments", {"_id": oid(dept_id)}, body)
    return jsonify({"message": "Department updated"})

@app.route("/api/admin/departments/<dept_id>", methods=["DELETE"])
@require_role("admin")
def admin_delete_department(dept_id):
    db.delete_one("departments", {"_id": oid(dept_id)})
    return jsonify({"message": "Department deleted"})


# ═══════════════════════════════════════════════════════════════
# ADMIN — Courses
# ═══════════════════════════════════════════════════════════════

@app.route("/api/admin/courses", methods=["GET"])
@require_role("admin")
def admin_get_courses():
    return jsonify({"courses": db.find_all("courses")})

@app.route("/api/admin/courses", methods=["POST"])
@require_role("admin")
def admin_create_course():
    body = request.get_json() or {}
    body["created_at"] = now_str()
    return jsonify({"_id": db.insert_one("courses", body), "message": "Course created"}), 201

@app.route("/api/admin/courses/<course_id>", methods=["PUT"])
@require_role("admin")
def admin_update_course(course_id):
    body = request.get_json() or {}
    body.pop("_id", None)
    db.update_one("courses", {"_id": oid(course_id)}, body)
    return jsonify({"message": "Course updated"})

@app.route("/api/admin/courses/<course_id>", methods=["DELETE"])
@require_role("admin")
def admin_delete_course(course_id):
    db.delete_one("courses", {"_id": oid(course_id)})
    return jsonify({"message": "Course deleted"})


# ═══════════════════════════════════════════════════════════════
# ADMIN — Timetable
# ═══════════════════════════════════════════════════════════════

@app.route("/api/admin/timetable", methods=["GET"])
@require_role("admin")
def admin_get_timetables():
    """List all saved timetables (metadata only, no full schedule)."""
    all_tt = db.find_all("timetable")
    result = []
    for t in all_tt:
        result.append({
            "_id":            t["_id"],
            "timetable_type": t.get("timetable_type", "student"),
            "department":     t.get("department", ""),
            "course":         t.get("course", ""),
            "semester":       t.get("semester", ""),
            "effective_from": t.get("effective_from", ""),
            "created_at":     t.get("created_at", ""),
        })
    return jsonify({"timetables": result})

@app.route("/api/admin/timetable", methods=["POST"])
@require_role("admin")
def admin_create_timetable():
    body = request.get_json() or {}
    body["created_at"] = now_str()
    tt_type = body.get("timetable_type", "student")

    # Build upsert query depending on type
    if tt_type == "faculty":
        query = {"timetable_type": "faculty", "department": body.get("department")}
    else:
        query = {
            "timetable_type": tt_type,
            "course": body.get("course"),
            "department": body.get("department"),
            "semester": body.get("semester"),
        }

    existing = db.find_one("timetable", query)
    if existing:
        body.pop("_id", None)
        db.update_one("timetable", {"_id": oid(existing["_id"])}, body)
        return jsonify({"message": "Timetable updated"})
    return jsonify({"_id": db.insert_one("timetable", body), "message": "Timetable created"}), 201

@app.route("/api/admin/timetable/<tt_id>", methods=["DELETE"])
@require_role("admin")
def admin_delete_timetable(tt_id):
    db.delete_one("timetable", {"_id": oid(tt_id)})
    return jsonify({"message": "Timetable deleted"})


# ═══════════════════════════════════════════════════════════════
# ADMIN — Announcements
# ═══════════════════════════════════════════════════════════════

@app.route("/api/admin/announcements", methods=["GET"])
@require_role("admin")
def admin_get_announcements():
    return jsonify({"announcements": db.find_all("announcements")})

@app.route("/api/admin/announcements", methods=["POST"])
@require_role("admin")
def admin_create_announcement():
    body = request.get_json() or {}
    body.update({"created_by": g.login.get("username"), "role": "admin", "created_at": now_str()})
    return jsonify({"_id": db.insert_one("announcements", body), "message": "Announcement posted"}), 201


# ═══════════════════════════════════════════════════════════════
# ADMIN — Events
# ═══════════════════════════════════════════════════════════════

@app.route("/api/admin/events", methods=["GET"])
@require_role("admin")
def admin_get_events():
    return jsonify({"events": db.find_all("events")})

@app.route("/api/admin/events/approve/<event_id>", methods=["PUT"])
@require_role("admin")
def admin_approve_event(event_id):
    db.update_one("events", {"_id": oid(event_id)}, {"status": "approved"})
    return jsonify({"message": "Event approved"})

@app.route("/api/admin/events/reject/<event_id>", methods=["PUT"])
@require_role("admin")
def admin_reject_event(event_id):
    db.update_one("events", {"_id": oid(event_id)}, {"status": "rejected"})
    return jsonify({"message": "Event rejected"})


# ═══════════════════════════════════════════════════════════════
# ADMIN — FAQs / Settings
# ═══════════════════════════════════════════════════════════════

@app.route("/api/admin/faqs", methods=["POST"])
@require_role("admin")
def admin_create_faq():
    body = request.get_json() or {}
    body["created_at"] = now_str()
    return jsonify({"_id": db.insert_one("faqs", body), "message": "FAQ created"}), 201

@app.route("/api/admin/settings", methods=["GET"])
@require_role("admin")
def admin_get_settings():
    return jsonify({"settings": db.find_one("settings", {"key": "global"}) or {}})

@app.route("/api/admin/settings", methods=["PUT"])
@require_role("admin")
def admin_save_settings():
    body = request.get_json() or {}
    body.pop("_id", None)
    if db.find_one("settings", {"key": "global"}):
        db.update_one("settings", {"key": "global"}, body)
    else:
        body["key"] = "global"
        db.insert_one("settings", body)
    return jsonify({"message": "Settings saved"})


# ═══════════════════════════════════════════════════════════════
# SHARED — FAQs (all logged-in roles)
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faqs", methods=["GET"])
def get_faqs():
    if not current_user():
        return jsonify({"error": "Unauthorized"}), 401
    search = request.args.get("search", "").strip()
    query  = {}
    if search:
        query["$or"] = [
            {"question": {"$regex": search, "$options": "i"}},
            {"answer":   {"$regex": search, "$options": "i"}},
        ]
    return jsonify({"faqs": db.find_all("faqs", query)})


# ═══════════════════════════════════════════════════════════════
# FACULTY — Dashboard
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/dashboard", methods=["GET"])
@require_role("faculty")
def faculty_dashboard():
    username = g.login.get("username")
    profile  = user_profile(username) or {}
    pending_appts = db.find_all("appointments", {"faculty_username": username, "status": "pending"})
    pending_griev = db.find_all("grievances",   {"faculty_username": username, "status": "pending"})
    recent_anns   = sorted(
        db.find_all("announcements", {"$or": [{"role": "all"}, {"role": "faculty"}]}),
        key=lambda x: x.get("created_at", ""), reverse=True
    )[:5]
    students = db.find_all("users", {"department": profile.get("department", "")})
    return jsonify({
        "pending_appointments":      len(pending_appts),
        "pending_grievances":        len(pending_griev),
        "recent_announcements":      recent_anns,
        "student_metrics":           {"students_taught": len(students)},
        "pending_appointments_list": pending_appts,
    })


# ═══════════════════════════════════════════════════════════════
# FACULTY — Profile & Password
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/profile", methods=["GET"])
@require_role("faculty")
def faculty_get_profile():
    return jsonify({"profile": user_profile(g.login.get("username")) or {}})

@app.route("/api/faculty/profile", methods=["PUT"])
@require_role("faculty")
def faculty_update_profile():
    body = request.get_json() or {}
    body.pop("_id", None); body.pop("username", None)
    db.update_one("users", {"username": g.login.get("username")}, body)
    return jsonify({"message": "Profile updated"})

@app.route("/api/faculty/password", methods=["PUT"])
@require_role("faculty")
def faculty_change_password():
    body     = request.get_json() or {}
    username = g.login.get("username")
    if not db.find_one("login", {"username": username, "password": body.get("old_password", "")}):
        return jsonify({"error": "Current password is incorrect"}), 400
    new_pw = body.get("new_password", "")
    if len(new_pw) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    db.update_one("login", {"username": username}, {"password": new_pw})
    return jsonify({"message": "Password changed"})


# ═══════════════════════════════════════════════════════════════
# FACULTY — Timetable
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/timetable", methods=["GET"])
@require_role("faculty")
def faculty_get_timetable():
    """Return the faculty timetable for this faculty's department."""
    profile = user_profile(g.login.get("username")) or {}
    dept = profile.get("department", "")
    if not dept:
        return jsonify({"timetable": None})
    timetable = db.find_one("timetable", {"timetable_type": "faculty", "department": dept})
    return jsonify({"timetable": timetable})


# ═══════════════════════════════════════════════════════════════
# FACULTY — Attendance
# ═══════════════════════════════════════════════════════════════

# @app.route("/api/faculty/students", methods=["GET"])
# @require_role("faculty")
# def faculty_get_students():
#     """
#     Return approved students for the faculty's department.
#     Optional ?course=BCA filter further narrows by student course.
#     This powers the 'Load Students' button on the attendance page.
#     """
#     faculty_username = g.login.get("username")
#     profile = user_profile(faculty_username) or {}
#     faculty_dept = profile.get("department", "")

#     course_filter = request.args.get("course", "").strip()

#     # Find all approved student usernames
#     approved_usernames = {
#         l["username"]
#         for l in db.find_all("login", {"usertype": "student", "status": "approved"})
#     }

#     # Build query: must belong to same department
#     query = {}
#     if faculty_dept:
#         query["department"] = faculty_dept
#     if course_filter:
#         query["course"] = course_filter

#     students = []
#     for u in db.find_all("users", query):
#         if u.get("username") in approved_usernames:
#             students.append({
#                 "username":   u.get("username"),
#                 "name":       u.get("name", u.get("username")),
#                 "roll_no":    u.get("roll_no", ""),
#                 "course":     u.get("course", ""),
#                 "semester":   u.get("semester", ""),
#                 "department": u.get("department", ""),
#             })

#     return jsonify({"students": students})


# @app.route("/api/faculty/attendance", methods=["POST"])
# @require_role("faculty")
# def faculty_mark_attendance():
#     body = request.get_json() or {}
#     body.update({"faculty_username": g.login.get("username"), "created_at": now_str()})
#     return jsonify({"_id": db.insert_one("attendance", body), "message": "Attendance saved"}), 201

# @app.route("/api/faculty/attendance", methods=["GET"])
# @require_role("faculty")
# def faculty_get_attendance():
#     query = {"faculty_username": g.login.get("username")}
#     course = request.args.get("course", "").strip()
#     if course:
#         query["course"] = course
#     return jsonify({"attendance_report": db.find_all("attendance", query)})


# ═══════════════════════════════════════════════════════════════
# FACULTY — Exams
# ═══════════════════════════════════════════════════════════════

# @app.route("/api/faculty/courses", methods=["GET"])
# @require_role("faculty")
# def faculty_get_courses():
#     """Return courses relevant to the faculty's department."""
#     profile = user_profile(g.login.get("username")) or {}
#     dept = profile.get("department", "")
#     query = {"department": dept} if dept else {}
#     return jsonify({"courses": db.find_all("courses", query)})

@app.route("/api/faculty/exams", methods=["GET"])
@require_role("faculty")
def faculty_get_exams():
    return jsonify({"exams": db.find_all("exams", {"faculty_username": g.login.get("username")})})

@app.route("/api/faculty/exams", methods=["POST"])
@require_role("faculty")
def faculty_create_exam():
    body = request.get_json() or {}
    body.update({"faculty_username": g.login.get("username"), "created_at": now_str()})
    return jsonify({"_id": db.insert_one("exams", body), "message": "Exam scheduled"}), 201


# ═══════════════════════════════════════════════════════════════
# FACULTY — Materials
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/materials", methods=["GET"])
@require_role("faculty")
def faculty_get_materials():
    return jsonify({"materials": db.find_all("materials", {"faculty_username": g.login.get("username")})})

@app.route("/api/faculty/materials", methods=["POST"])
@require_role("faculty")
def faculty_upload_material():
    body = request.get_json() or {}
    body.update({"faculty_username": g.login.get("username"), "created_at": now_str()})
    return jsonify({"_id": db.insert_one("materials", body), "message": "Material uploaded"}), 201


# ═══════════════════════════════════════════════════════════════
# FACULTY — Announcements & Events
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/announcements", methods=["GET"])
@require_role("faculty")
def faculty_get_announcements():
    return jsonify({"announcements": db.find_all("announcements", {"$or": [{"role": "all"}, {"role": "faculty"}]})})

@app.route("/api/faculty/announcements", methods=["POST"])
@require_role("faculty")
def faculty_post_announcement():
    body = request.get_json() or {}
    body.update({"created_by": g.login.get("username"), "role": "faculty", "created_at": now_str()})
    return jsonify({"_id": db.insert_one("announcements", body), "message": "Announcement posted"}), 201

@app.route("/api/faculty/events", methods=["GET"])
@require_role("faculty")
def faculty_get_events():
    username = g.login.get("username")
    return jsonify({"events": db.find_all("events", {"$or": [{"status": "approved"}, {"created_by": username}]})})

@app.route("/api/faculty/events", methods=["POST"])
@require_role("faculty")
def faculty_create_event():
    body = request.get_json() or {}
    body.update({"created_by": g.login.get("username"), "status": "pending", "created_at": now_str()})
    return jsonify({"_id": db.insert_one("events", body), "message": "Event submitted for approval"}), 201


# ═══════════════════════════════════════════════════════════════
# FACULTY — Appointments
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/appointments", methods=["GET"])
@require_role("faculty")
def faculty_get_appointments():
    return jsonify({"appointments": db.find_all("appointments", {"faculty_username": g.login.get("username")})})

@app.route("/api/faculty/appointments/<appt_id>/approve", methods=["PUT"])
@require_role("faculty")
def faculty_approve_appointment(appt_id):
    body = request.get_json() or {}
    db.update_one("appointments", {"_id": oid(appt_id)}, {"status": "approved", "meeting_link": body.get("meeting_link", "")})
    return jsonify({"message": "Appointment approved"})

@app.route("/api/faculty/appointments/<appt_id>/reject", methods=["PUT"])
@require_role("faculty")
def faculty_reject_appointment(appt_id):
    body = request.get_json() or {}
    db.update_one("appointments", {"_id": oid(appt_id)}, {"status": "rejected", "reason": body.get("reason", "")})
    return jsonify({"message": "Appointment rejected"})


# ═══════════════════════════════════════════════════════════════
# FACULTY — Grievances
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/grievances", methods=["GET"])
@require_role("faculty")
def faculty_get_grievances():
    dept = (user_profile(g.login.get("username")) or {}).get("department", "")
    return jsonify({"grievances": db.find_all("grievances", {"department": dept})})

@app.route("/api/faculty/grievances/<grievance_id>/respond", methods=["PUT"])
@require_role("faculty")
def faculty_respond_grievance(grievance_id):
    body = request.get_json() or {}
    db.update_one("grievances", {"_id": oid(grievance_id)}, {
        "response":     body.get("response", ""),
        "status":       body.get("status", "resolved"),
        "responded_by": g.login.get("username"),
        "responded_at": now_str(),
    })
    return jsonify({"message": "Response submitted"})


# ═══════════════════════════════════════════════════════════════
# FACULTY — Anonymous Reports (read-only, no student identity)
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/anonymous-reports", methods=["GET"])
@require_role("faculty")
def faculty_get_anonymous_reports():
    """Return all anonymous reports for the faculty's department."""
    dept = (user_profile(g.login.get("username")) or {}).get("department", "")
    if not dept:
        return jsonify({"reports": []})
    reports = db.find_all("anonymous_reports", {"department": dept})
    # Sort newest first
    reports.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return jsonify({"reports": reports})

@app.route("/api/faculty/anonymous-reports/<report_id>/respond", methods=["PUT"])
@require_role("faculty")
def faculty_respond_anonymous_report(report_id):
    """Faculty responds to an anonymous report."""
    body = request.get_json() or {}
    response_text = body.get("response", "").strip()
    if not response_text:
        return jsonify({"error": "Response text is required"}), 400
    db.update_one("anonymous_reports", {"_id": oid(report_id)}, {
        "response":     response_text,
        "status":       "responded",
        "responded_by": g.login.get("username"),
        "responded_at": now_str(),
    })
    return jsonify({"message": "Response submitted"})


# ═══════════════════════════════════════════════════════════════
# STUDENT — Dashboard
# ═══════════════════════════════════════════════════════════════

# @app.route("/api/student/dashboard", methods=["GET"])
# @require_role("student")
# def student_dashboard():
#     username = g.login.get("username")
#     profile  = user_profile(username) or {}

#     att_records = db.find_all("attendance", {"attendance_data": {"$elemMatch": {"username": username}}})
#     total    = len(att_records)
#     attended = sum(
#         1 for r in att_records
#         for a in (r.get("attendance_data") or [])
#         if a.get("username") == username and a.get("status") == "present"
#     )
#     pct = round(attended / total * 100) if total else 0

#     course  = profile.get("course", "")
#     sem     = profile.get("semester", "")
#     exams   = db.find_all("exams", {"course": course, "semester": sem}) if course else []
#     today   = datetime.utcnow().date().isoformat()
#     upcoming = [e for e in exams if e.get("exam_date", "") >= today][:5]
#     appts   = db.find_all("appointments", {"student_username": username})
#     anns    = sorted(
#         db.find_all("announcements", {"$or": [{"role": "all"}, {"role": "student"}]}),
#         key=lambda x: x.get("created_at", ""), reverse=True
#     )[:5]

#     return jsonify({
#         "attendance_summary": {"percentage": pct, "total_classes": total, "attended": attended},
#         "upcoming_exams":       upcoming,
#         "appointments":         appts,
#         "recent_announcements": anns,
#     })


# ═══════════════════════════════════════════════════════════════
# STUDENT — Profile & Password
# ═══════════════════════════════════════════════════════════════

@app.route("/api/student/profile", methods=["GET"])
@require_role("student")
def student_get_profile():
    return jsonify({"profile": user_profile(g.login.get("username")) or {}})

@app.route("/api/student/profile", methods=["PUT"])
@require_role("student")
def student_update_profile():
    body = request.get_json() or {}
    body.pop("_id", None); body.pop("username", None)
    db.update_one("users", {"username": g.login.get("username")}, body)
    return jsonify({"message": "Profile updated"})

@app.route("/api/student/password", methods=["PUT"])
@require_role("student")
def student_change_password():
    body     = request.get_json() or {}
    username = g.login.get("username")
    if not db.find_one("login", {"username": username, "password": body.get("old_password", "")}):
        return jsonify({"error": "Current password is incorrect"}), 400
    new_pw = body.get("new_password", "")
    if len(new_pw) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    db.update_one("login", {"username": username}, {"password": new_pw})
    return jsonify({"message": "Password changed"})


# ═══════════════════════════════════════════════════════════════
# STUDENT — Attendance / Exams / Timetable / Materials
# ═══════════════════════════════════════════════════════════════

# @app.route("/api/student/attendance", methods=["GET"])
# @require_role("student")
# def student_get_attendance():
#     username = g.login.get("username")
#     records  = db.find_all("attendance", {"attendance_data": {"$elemMatch": {"username": username}}})

#     # Build per-course summary
#     course_summary = {}
#     for r in records:
#         course = r.get("course", "Unknown")
#         if course not in course_summary:
#             course_summary[course] = {"total": 0, "present": 0}
#         for a in (r.get("attendance_data") or []):
#             if a.get("username") == username:
#                 course_summary[course]["total"] += 1
#                 if a.get("status") == "present":
#                     course_summary[course]["present"] += 1

#     # Overall totals
#     total_classes = sum(v["total"] for v in course_summary.values())
#     total_present = sum(v["present"] for v in course_summary.values())
#     overall_pct   = round(total_present / total_classes * 100) if total_classes else 0

#     # Flat attendance records for table display (one row per session)
#     attendance_records = []
#     for r in records:
#         for a in (r.get("attendance_data") or []):
#             if a.get("username") == username:
#                 attendance_records.append({
#                     "date":    r.get("date", ""),
#                     "course":  r.get("course", ""),
#                     "session": r.get("session", ""),
#                     "status":  a.get("status", "unknown"),
#                     "attendance_data": [a],   # keep shape consistent with frontend
#                 })

#     return jsonify({
#         "summary": {
#             "percentage":    overall_pct,
#             "total_classes": total_classes,
#             "attended":      total_present,
#         },
#         "attendance_records": attendance_records,
#         "course_breakdown": [
#             {"course": c, "total": v["total"], "present": v["present"],
#              "percentage": round(v["present"] / v["total"] * 100) if v["total"] else 0}
#             for c, v in course_summary.items()
#         ],
#     })

@app.route("/api/student/exams", methods=["GET"])
@require_role("student")
def student_get_exams():
    profile = user_profile(g.login.get("username")) or {}
    course  = profile.get("course", "")
    sem     = profile.get("semester", "")
    return jsonify({"exams": db.find_all("exams", {"course": course, "semester": sem}) if course else []})

@app.route("/api/student/timetable", methods=["GET"])
@require_role("student")
def student_get_timetable():
    profile   = user_profile(g.login.get("username")) or {}
    # Try with timetable_type first, fall back to legacy query
    timetable = db.find_one("timetable", {
        "timetable_type": "student",
        "course":     profile.get("course", ""),
        "department": profile.get("department", ""),
        "semester":   profile.get("semester", ""),
    })
    if not timetable:
        timetable = db.find_one("timetable", {
            "course":     profile.get("course", ""),
            "department": profile.get("department", ""),
            "semester":   profile.get("semester", ""),
        })
    return jsonify({"timetable": timetable})

@app.route("/api/student/materials", methods=["GET"])
@require_role("student")
def student_get_materials():
    profile = user_profile(g.login.get("username")) or {}
    query   = {}
    if profile.get("course"):      query["course"]     = profile["course"]
    if profile.get("department"):  query["department"] = profile["department"]
    return jsonify({"materials": db.find_all("materials", query) if query else db.find_all("materials")})


# ═══════════════════════════════════════════════════════════════
# STUDENT — Announcements / Events
# ═══════════════════════════════════════════════════════════════

@app.route("/api/student/announcements", methods=["GET"])
@require_role("student")
def student_get_announcements():
    anns = sorted(
        db.find_all("announcements", {"$or": [{"role": "all"}, {"role": "student"}]}),
        key=lambda x: x.get("created_at", ""), reverse=True
    )
    return jsonify({"announcements": anns})

@app.route("/api/student/events", methods=["GET"])
@require_role("student")
def student_get_events():
    return jsonify({"events": db.find_all("events", {"status": "approved"})})


# ═══════════════════════════════════════════════════════════════
# STUDENT — Appointments / Grievances
# ═══════════════════════════════════════════════════════════════

@app.route("/api/student/appointments", methods=["GET"])
@require_role("student")
def student_get_appointments():
    return jsonify({"appointments": db.find_all("appointments", {"student_username": g.login.get("username")})})

@app.route("/api/student/appointments", methods=["POST"])
@require_role("student")
def student_book_appointment():
    body = request.get_json() or {}
    body.update({"student_username": g.login.get("username"), "status": "pending", "created_at": now_str()})
    return jsonify({"_id": db.insert_one("appointments", body), "message": "Appointment request sent"}), 201

@app.route("/api/student/grievances", methods=["GET"])
@require_role("student")
def student_get_grievances():
    return jsonify({"grievances": db.find_all("grievances", {"student_username": g.login.get("username")})})

@app.route("/api/student/grievances", methods=["POST"])
@require_role("student")
def student_submit_grievance():
    body     = request.get_json() or {}
    username = g.login.get("username")
    profile  = user_profile(username) or {}
    body.update({
        "student_username": username,
        "department":       profile.get("department", body.get("department", "")),
        "status":           "pending",
        "created_at":       now_str(),
    })
    return jsonify({"_id": db.insert_one("grievances", body), "message": "Grievance submitted"}), 201


# ═══════════════════════════════════════════════════════════════
# STUDENT — Anonymous Reports (identity never stored)
# ═══════════════════════════════════════════════════════════════

@app.route("/api/student/anonymous-reports", methods=["POST"])
@require_role("student")
def student_submit_anonymous_report():
    """
    Submit an anonymous report. The student's username is NOT stored.
    A random report_token is returned so the student can track their report.
    """
    body = request.get_json() or {}
    subject_text = body.get("subject", "").strip()
    message = body.get("message", "").strip()
    category = body.get("category", "general").strip()

    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Get department from student profile (but do NOT store username)
    username = g.login.get("username")
    profile = user_profile(username) or {}
    department = profile.get("department", "")

    if not department:
        return jsonify({"error": "Your profile has no department assigned. Contact admin."}), 400

    report_token = str(uuid.uuid4())

    doc = {
        "department":   department,
        "category":     category,
        "subject":      subject_text,
        "message":      message,
        "report_token": report_token,
        "status":       "pending",
        "response":     "",
        "responded_by": "",
        "responded_at": "",
        "created_at":   now_str(),
    }
    # NOTE: No student_username stored — this is the anonymity guarantee
    db.insert_one("anonymous_reports", doc)
    return jsonify({"message": "Report submitted anonymously", "report_token": report_token}), 201

@app.route("/api/student/anonymous-reports", methods=["GET"])
@require_role("student")
def student_get_anonymous_reports():
    """
    Returns reports that match the given report_tokens (comma-separated).
    Tokens are stored client-side; the server never knows which student owns them.
    """
    tokens_param = request.args.get("tokens", "").strip()
    if not tokens_param:
        return jsonify({"reports": []})
    tokens = [t.strip() for t in tokens_param.split(",") if t.strip()]
    reports = db.find_all("anonymous_reports", {"report_token": {"$in": tokens}})
    reports.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return jsonify({"reports": reports})





# ═══════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════

@app.route("/api/auth/login", methods=["POST", "GET"])
def auth_login():
    data = request.get_json(silent=True)
    if not data: data = request.form
    
    username = (data.get("username") or "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    username = (data.get("username") or "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    login_doc = db.find_one("login", {"username": username, "password": password})
    
    if not login_doc:
        return jsonify({"error": "Invalid username or password"}), 401

    if login_doc.get("status") == "pending":
        return jsonify({"error": "Account pending admin approval"}), 403
    if login_doc.get("status") == "rejected":
        return jsonify({"error": "Account registration was rejected"}), 403

    profile = user_profile(username) or {}
    
    return jsonify({
        "user": {
            "login_id": str(login_doc["_id"]),
            "role":     login_doc.get("usertype"), 
            "usertype": login_doc.get("usertype"), 
            "name":     profile.get("name", username),
            "email":    profile.get("email", ""),
            "username": username,
        }
    })

@app.route("/api/auth/register/<role>", methods=["POST"])
def auth_register(role):
    if role not in ("student", "faculty"):
        return jsonify({"error": "Invalid role"}), 400

    body     = request.get_json() or {}
    username = body.get("username", "").strip()
    password = body.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if db.find_one("login", {"username": username}):
        return jsonify({"error": "Username already taken"}), 409

    login_oid = db.insert_one("login", {
        "username":   username,
        "password":   password,
        "usertype":   role,
        "status":     "pending",
        "created_at": now_str(),
    })

    profile = {
        "username":   username,
        "login_oid":  login_oid,
        "name":       body.get("name", ""),
        "email":      body.get("email", ""),
        "phone":      body.get("phone", ""),
        "department": body.get("department", ""),
        "created_at": now_str(),
    }
    if role == "student":
        profile.update({
            "course":   body.get("course", ""),
            "semester": body.get("semester", ""),
            "roll_no":  body.get("roll_no", ""),
        })
    else:
        profile.update({
            "designation":    body.get("designation", ""),
            "specialization": body.get("specialization", ""),
        })

    db.insert_one("users", profile)
    return jsonify({"message": "Registration submitted — awaiting admin approval."}), 201

# ═══════════════════════════════════════════════════════════════
# ADMIN API (Simplified for brevity - kept strictly necessary ones)
# ═══════════════════════════════════════════════════════════════
# ... [Include all your Admin routes here as they were] ...
# To save space, I am including the critical Faculty/Student routes below.
# Please assume the Admin routes (dashboard, users, departments, etc.) 
# remain exactly the same as your previous file.

@app.route("/api/admin/dashboard", methods=["GET"])
@require_role("admin")
def admin_dashboard():
    return jsonify({
        "system_overview": {
            "total_students":    len(db.find_all("login", {"usertype": "student",  "status": "approved"})),
            "total_faculty":     len(db.find_all("login", {"usertype": "faculty",  "status": "approved"})),
            "pending_approvals": len(db.find_all("login", {"status": "pending"})),
            "total_departments": len(db.find_all("departments")),
            "total_courses":     len(db.find_all("courses")),
        }
    })

# @app.route("/api/admin/courses", methods=["GET"])
# @require_role("admin")
# def admin_get_courses():
#     return jsonify({"courses": db.find_all("courses")})

# ═══════════════════════════════════════════════════════════════
# FACULTY — ATTENDANCE & SUBJECTS (UPDATED)
# ═══════════════════════════════════════════════════════════════

@app.route("/api/faculty/courses", methods=["GET"])
@require_role("faculty")
def faculty_get_courses():
    """Return courses relevant to the faculty's department."""
    profile = user_profile(g.login.get("username")) or {}
    dept = profile.get("department", "")
    query = {"department": dept} if dept else {}
    return jsonify({"courses": db.find_all("courses", query)})

@app.route("/api/faculty/subjects", methods=["GET"])
@require_role("faculty")
def faculty_get_subjects():
    """
    Returns a list of subjects for a specific course.
    Usage: /api/faculty/subjects?course=BCA
    """
    course = request.args.get("course", "").strip()
    # In a real app, you would query db.find("subjects", {"course": course})
    # For now, we use the static mapping defined at the top.
    subjects = SUBJECT_MAPPING.get(course, SUBJECT_MAPPING["default"])
    return jsonify({"subjects": subjects})

@app.route("/api/faculty/students", methods=["GET"])
@require_role("faculty")
def faculty_get_students():
    faculty_username = g.login.get("username")
    profile = user_profile(faculty_username) or {}
    faculty_dept = profile.get("department", "")
    course_filter = request.args.get("course", "").strip()
    semester_filter = request.args.get("semester", "").strip()

    approved_usernames = {
        l["username"] for l in db.find_all("login", {"usertype": "student", "status": "approved"})
    }
    
    query = {}
    if faculty_dept: query["department"] = faculty_dept
    if course_filter: query["course"] = course_filter
    if semester_filter: query["semester"] = semester_filter

    students = []
    for u in db.find_all("users", query):
        if u.get("username") in approved_usernames:
            students.append({
                "username":   u.get("username"),
                "name":       u.get("name", u.get("username")),
                "roll_no":    u.get("roll_no", ""),
                "course":     u.get("course", ""),
                "semester":   u.get("semester", ""),
            })

    return jsonify({"students": students})

@app.route("/api/faculty/attendance", methods=["POST"])
@require_role("faculty")
def faculty_mark_attendance():
    """
    Expects: { "course": "BCA", "subject": "Data Structures", "date": "2023-10-10", "attendance_data": [...] }
    """
    body = request.get_json() or {}
    
    # Validation
    if not body.get("subject"):
        return jsonify({"error": "Subject is required"}), 400
        
    body.update({
        "faculty_username": g.login.get("username"), 
        "created_at": now_str()
    })
    
    db.insert_one("attendance", body)
    return jsonify({"message": "Attendance saved successfully"}), 201

@app.route("/api/faculty/attendance", methods=["GET"])
@require_role("faculty")
def faculty_get_attendance():
    query = {"faculty_username": g.login.get("username")}
    
    course = request.args.get("course", "").strip()
    if course: query["course"] = course
        
    subject = request.args.get("subject", "").strip()
    if subject: query["subject"] = subject

    return jsonify({"attendance_report": db.find_all("attendance", query)})

# ═══════════════════════════════════════════════════════════════
# STUDENT — ATTENDANCE (UPDATED FOR SUBJECT WISE)
# ═══════════════════════════════════════════════════════════════

@app.route("/api/student/dashboard", methods=["GET"])
@require_role("student")
def student_dashboard():
    username = g.login.get("username")
    # Simple summary for dashboard
    att_records = db.find_all("attendance", {"attendance_data": {"$elemMatch": {"username": username}}})
    total    = len(att_records)
    attended = sum(
        1 for r in att_records
        for a in (r.get("attendance_data") or [])
        if a.get("username") == username and a.get("status") == "present"
    )
    pct = round(attended / total * 100) if total else 0
    return jsonify({"attendance_summary": {"percentage": pct, "total_classes": total, "attended": attended}})

@app.route("/api/student/attendance", methods=["GET"])
@require_role("student")
def student_get_attendance():
    """
    Returns attendance broken down by SUBJECT.
    """
    username = g.login.get("username")
    records  = db.find_all("attendance", {"attendance_data": {"$elemMatch": {"username": username}}})

    # Group by SUBJECT
    # If legacy data doesn't have 'subject', fall back to 'course'
    subject_summary = {}
    
    for r in records:
        # Key is Subject Name (e.g., "Data Structures")
        subject = r.get("subject") or r.get("course", "Unknown")
        
        if subject not in subject_summary:
            subject_summary[subject] = {"total": 0, "present": 0}
            
        for a in (r.get("attendance_data") or []):
            if a.get("username") == username:
                subject_summary[subject]["total"] += 1
                if a.get("status") == "present":
                    subject_summary[subject]["present"] += 1

    # Detailed rows for the table
    attendance_records = []
    for r in records:
        for a in (r.get("attendance_data") or []):
            if a.get("username") == username:
                attendance_records.append({
                    "date":    r.get("date", ""),
                    "course":  r.get("course", ""),
                    "subject": r.get("subject", "—"),  # Added subject here
                    "session": r.get("session", ""),
                    "status":  a.get("status", "unknown"),
                })

    # Convert summary dict to list
    breakdown_list = []
    total_classes_all = 0
    total_present_all = 0
    
    for subj, stats in subject_summary.items():
        total_classes_all += stats["total"]
        total_present_all += stats["present"]
        pct = round(stats["present"] / stats["total"] * 100) if stats["total"] else 0
        
        breakdown_list.append({
            "subject":    subj,
            "total":      stats["total"],
            "present":    stats["present"],
            "percentage": pct
        })

    overall_pct = round(total_present_all / total_classes_all * 100) if total_classes_all else 0

    return jsonify({
        "summary": {
            "percentage":    overall_pct,
            "total_classes": total_classes_all,
            "attended":      total_present_all,
        },
        "attendance_records": attendance_records,
        "subject_breakdown":  breakdown_list 
    })

# ═══════════════════════════════════════════════════════════════
# RUN
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app.run(debug=True, port=5000)