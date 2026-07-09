# Smart Campus — Bug Fixes & Changes

## 1. Signup / Registration (`frontend/signup.html`)
**Bug:** The form was sending `login_id` in the JSON body, but the backend's
`/api/auth/register/<role>` endpoint reads `username`.  
**Fix:** Changed the field id from `login_id` → `username` (both the HTML `<input>` and
the JavaScript `body` object). The form now correctly sends `username` to the backend.

---

## 2. Admin Approvals Page (`frontend/admin-approvals.html`)
**Bug:** The pending-users table displayed `u.login_id` and `u.role`, which were
`undefined` because the backend returns the fields as `username` and `usertype`.  
**Fix:** All references changed to `u.username` and `u.usertype` (including the search
filter). The "Login ID" column now correctly shows the student/faculty username.

---

## 3. Admin User Directory (`frontend/admin-users.html`)
**Same bug as #2.** The All Users table and search filter used `u.login_id` / `u.role`.  
**Fix:** Same field-name corrections applied (`u.username`, `u.usertype`).

---

## 4. Faculty Attendance — Load Students (`frontend/faculty-attendance.html`)
**Bug:** Clicking "Load Students" showed a hard-coded list of 6 fake names
(`Alice Mathew`, `Bob Thomas`, …) instead of real students from the database.
When attendance was submitted the stored records had fake IDs (`STU001`, …)
so the student's own attendance page could never match them.

**Fix (frontend):**
- The "Course" text input was replaced with a `<select>` populated from
  `/api/faculty/courses` on page load.
- "Load Students" now calls the new endpoint `/api/faculty/students?course=<course>`
  and renders the real registered students.
- Each student row stores the real `username` in `attendanceData`, so the backend
  records are now correctly matchable against the students collection.

**Fix (backend — two new endpoints added to `backend.py`):**

### `GET /api/faculty/students?course=<optional>`
Returns all **approved** students whose `department` matches the logged-in faculty's
department. An optional `course` query param narrows it further to students enrolled
in that course. This is the FK-style relationship you requested (faculty dept →
student dept → course).

### `GET /api/faculty/courses`
Returns courses whose `department` matches the faculty's department. Used to populate
the course dropdown.

---

## 5. Student Attendance Page — Broken API Shape (`backend.py`)
**Bug:** `/api/student/attendance` returned `{"attendance": [...course summaries]}`.
The frontend (`student-attendance.html`) expected `{"summary": {...}, "attendance_records": [...]}`.
This meant the overall percentage, stats cards, and records table all showed `—` or crashed.

**Fix:** Completely rewrote the endpoint to return:
```json
{
  "summary": {
    "percentage": 82,
    "total_classes": 22,
    "attended": 18
  },
  "attendance_records": [
    { "date": "2025-06-01", "course": "BCA", "session": "morning", "status": "present", ... }
  ],
  "course_breakdown": [
    { "course": "BCA", "total": 22, "present": 18, "percentage": 82 }
  ]
}
```
The `attendance_records` list has one row per session (not per course), which
the table renderer now iterates correctly.

---

## 6. Attendance Percentage Calculation
The percentage is computed correctly:
- Faculty marks attendance with `attendance_data: [{ username, student_name, status }, ...]`
- Backend `/api/student/attendance` queries records where
  `attendance_data` contains `{username: <student_username>}`, then counts
  `present` entries.
- Because we now store real `username` (not fake `STU001`), the match works.

---

## 7. Dummy Data (`seed_dummy_data.py`)
Run once after `seed_admin.py`:

```bash
python seed_dummy_data.py
```

Creates:
- **3 Departments:** Computer Science & Applications, Mathematics, Physics
- **4 Courses:** BCA, BSc CS, BSc Maths, BSc Physics
- **10 Faculty** (password: `faculty@123`):
  - 5 in Computer Science & Applications
  - 2 in Mathematics
  - 2 in Physics
  - 1 more in Computer Science & Applications
- **20 Students** (password: `student@123`):
  - 8 BCA Sem 4
  - 5 BSc CS Sem 2
  - 3 BSc Maths Sem 3
  - 4 BSc Physics Sem 5

All accounts have `status: "approved"` so they can log in immediately.

---

## Setup / Run Order

```bash
# 1. Install deps
pip install flask flask-cors pymongo dnspython

# 2. Seed initial admin
python seed_admin.py

# 3. Seed dummy data (departments, courses, faculty, students)
python seed_dummy_data.py

# 4. Start backend (serves frontend too)
python backend.py
# Open http://localhost:5000/
```

## Credentials Summary

| Role    | Username        | Password     |
|---------|-----------------|--------------|
| Admin   | admin           | admin123     |
| Faculty | fac_arun        | faculty@123  |
| Faculty | fac_meena       | faculty@123  |
| Faculty | fac_rajan       | faculty@123  |
| Faculty | fac_divya       | faculty@123  |
| Faculty | fac_suresh      | faculty@123  |
| Faculty | fac_lakshmi     | faculty@123  |
| Faculty | fac_sreeja      | faculty@123  |
| Faculty | fac_thomas      | faculty@123  |
| Faculty | fac_asha        | faculty@123  |
| Faculty | fac_biju        | faculty@123  |
| Student | stu_adithyan    | student@123  |
| Student | stu_amitha      | student@123  |
| Student | stu_arjun       | student@123  |
| … (17 more students) | … | student@123 |
