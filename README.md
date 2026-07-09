

---

## 📌 What Is This Project?

Smart Campus is a **full-stack web application** that digitizes core campus operations:

| For Students | For Faculty | For Admins |
|---|---|---|
| View timetable & attendance | Mark attendance | Manage users & approvals |
| Check exam schedules | Schedule exams | Manage departments & courses |
| Download study materials | Upload course materials | Publish announcements |
| Book faculty appointments | Approve/reject appointments | Approve/reject events |
| Submit grievances | Respond to grievances | Configure system settings |
| View announcements & events | Post announcements & events | Manage FAQs & timetables |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS (custom design system) |
| **Routing** | React Router DOM v6 |
| **HTTP Client** | Axios |
| **Backend** | Python Flask |
| **Database** | MongoDB (via PyMongo) |
| **Auth** | Session-based with `Login-Id` header |
| **Dev Proxy** | Vite proxy (`/api` → Flask on port 5000) |

---

## 📂 Project Structure

```
smartcampusreact/
│
├── react-project/                  # ── FRONTEND (React + Vite) ──
│   ├── public/
│   ├── src/
│   │   ├── App.jsx                 # Root component
│   │   ├── main.jsx                # Entry point
│   │   ├── index.css               # Global design system & styles
│   │   │
│   │   ├── components/
│   │   │   └── Layout.jsx          # Shared sidebar + header layout
│   │   │
│   │   ├── router/
│   │   │   └── AppRouter.jsx       # All routes + PrivateRoute guard
│   │   │
│   │   ├── services/
│   │   │   └── api.jsx             # Axios instance + all API functions
│   │   │
│   │   └── modules/
│   │       ├── auth/               # Login.jsx, Signup.jsx
│   │       ├── admin/              # 10 admin pages
│   │       ├── faculty/            # 9 faculty pages
│   │       └── student/            # 11 student pages
│   │
│   ├── vite.config.js              # Dev server + proxy config
│   └── package.json
│
└── back/                           # ── BACKEND (Flask + MongoDB) ──
    ├── app.py                      # All API routes (~60 endpoints)
    ├── config.py                   # MongoDB connection wrapper
    ├── requirements.txt            # Python dependencies
    ├── seed_admin.py               # Seeds the admin user
    ├── seed_dummy_data.py          # Seeds departments, courses, faculty, students
    └── verify_db.py               # Database verification script
```

---

## 🔄 Application Workflow

### 1. Authentication Flow

```
┌──────────────┐     POST /api/auth/login      ┌──────────────┐
│              │  ─────────────────────────────► │              │
│   Login      │   { username, password }        │   Flask      │
│   Page       │                                 │   Backend    │
│              │  ◄───────────────────────────── │              │
│              │   { user: { login_id, role,     │              │
└──────────────┘     name, username } }          └──────┬───────┘
       │                                                │
       │  Store user in localStorage                    │  Lookup in
       │  (including login_id)                          │  MongoDB 'login'
       ▼                                                │  collection
┌──────────────┐                                        ▼
│  Redirect to │                                ┌──────────────┐
│  Dashboard   │                                │   MongoDB    │
│  by role     │                                │  'smart_campus' │
└──────────────┘                                └──────────────┘
```

**How it works:**
1. User enters **username** and **password** on the Login page
2. Frontend sends `POST /api/auth/login` with credentials
3. Backend looks up the user in MongoDB's `login` collection
4. On success, returns a **user object** with `login_id` (MongoDB `_id`)
5. Frontend stores user data in `localStorage`
6. Frontend redirects to the **role-specific dashboard** (`/admin/dashboard`, `/faculty/dashboard`, or `/student/dashboard`)
7. **All subsequent API requests** include a `Login-Id` header (the stored `login_id`) for authentication

### 2. Role-Based Access Control

```
                    ┌─────────────────────────────────┐
                    │         PrivateRoute             │
                    │   (AppRouter.jsx)                │
                    ├─────────────────────────────────┤
                    │  1. Check localStorage for user  │
                    │  2. If no user → redirect /login │
                    │  3. If wrong role → redirect     │
                    │  4. If valid → render page       │
                    └─────────────────────────────────┘

Backend Protection (app.py):
┌──────────────────────────────────────────────────────┐
│  @require_role("admin")                              │
│  ├── Read Login-Id header                            │
│  ├── Lookup user in DB by _id                        │
│  ├── If no user → 401 Unauthorized                   │
│  ├── If wrong role → 403 Forbidden                   │
│  └── If valid → proceed to route handler             │
└──────────────────────────────────────────────────────┘
```

### 3. Request Flow (Frontend → Backend → Database)

```
┌────────────┐     Axios + Login-Id header     ┌────────────┐      PyMongo      ┌────────────┐
│            │  ──────────────────────────────► │            │  ───────────────► │            │
│  React     │     GET /api/admin/dashboard     │   Flask    │   db.find_all()   │  MongoDB   │
│  Frontend  │                                  │   app.py   │                   │            │
│  (Port     │  ◄────────────────────────────── │  (Port     │  ◄─────────────── │            │
│   5173)    │     JSON { system_overview: {} }  │   5000)    │   BSON documents  │            │
└────────────┘                                  └────────────┘                   └────────────┘
        │
        │  Vite dev proxy rewrites
        │  /api/* → localhost:5000/api/*
```

### 4. User Registration & Approval Flow

```
┌──────────────┐   POST /api/auth/register/student   ┌──────────────┐
│   Signup     │  ──────────────────────────────────► │   Backend    │
│   Page       │                                      │              │
└──────────────┘                                      └──────┬───────┘
                                                             │
                                                    Creates login record
                                                    with status: "pending"
                                                             │
                                                             ▼
┌──────────────┐   PUT /api/admin/users/approve/:id  ┌──────────────┐
│   Admin      │  ──────────────────────────────────► │   Backend    │
│   Approvals  │                                      │   Updates    │
│   Page       │  ◄────────────────────────────────── │   status →   │
│              │       { message: "approved" }        │   "approved" │
└──────────────┘                                      └──────────────┘
```

**Steps:**
1. New user registers via `/signup` (student or faculty)
2. Backend creates a record with `status: "pending"`
3. User **cannot log in** until approved
4. Admin navigates to **Approvals** page → sees pending users
5. Admin **approves** or **rejects** the user
6. Once approved, user can log in normally

---

## 📊 Module Breakdown

### 🔑 Auth Module (`/auth`)

| Page | Description |
|---|---|
| `Login.jsx` | Username/password login with demo credential buttons |
| `Signup.jsx` | Registration form for students and faculty (pending approval) |

### 🛡️ Admin Module (`/admin`)

| Page | Description |
|---|---|
| `AdminDashboard.jsx` | Overview stats: students, faculty, pending approvals, departments, courses |
| `AdminUsers.jsx` | View and manage all users (filter by role) |
| `AdminApprovals.jsx` | Approve or reject pending registrations |
| `AdminDepartments.jsx` | CRUD operations for departments |
| `AdminCourses.jsx` | CRUD operations for courses |
| `AdminAnnouncements.jsx` | Create and manage campus announcements |
| `AdminEvents.jsx` | Approve/reject faculty-submitted events |
| `AdminTimetable.jsx` | Create and assign timetables by course/semester |
| `AdminFaqs.jsx` | Manage frequently asked questions |
| `AdminSettings.jsx` | System-wide settings |

### 👨‍🏫 Faculty Module (`/faculty`)

| Page | Description |
|---|---|
| `FacultyDashboard.jsx` | Pending appointments, grievances, recent announcements |
| `FacultyProfile.jsx` | View/edit personal profile |
| `FacultyAttendance.jsx` | Mark student attendance (by course/subject/date) |
| `FacultyExams.jsx` | Schedule exams for assigned courses |
| `FacultyMaterials.jsx` | Upload study materials |
| `FacultyAnnouncements.jsx` | View & post announcements |
| `FacultyEvents.jsx` | Submit events for admin approval |
| `FacultyAppointments.jsx` | View and respond to student appointment requests |
| `FacultyGrievances.jsx` | View and respond to student grievances |

### 🎓 Student Module (`/student`)

| Page | Description |
|---|---|
| `StudentDashboard.jsx` | Attendance summary, upcoming exams, announcements |
| `StudentProfile.jsx` | View/edit personal profile |
| `StudentTimetable.jsx` | View class timetable |
| `StudentAttendance.jsx` | View attendance records and course-wise breakdown |
| `StudentExams.jsx` | View exam schedules |
| `StudentMaterials.jsx` | Download study materials |
| `StudentAnnouncements.jsx` | View campus announcements |
| `StudentEvents.jsx` | View approved campus events |
| `StudentFaqs.jsx` | Search and browse FAQs |
| `StudentAppointments.jsx` | Book appointments with faculty |
| `StudentGrievances.jsx` | Submit and track grievances |

---

## 🗄️ Database Schema (MongoDB Collections)

| Collection | Purpose | Key Fields |
|---|---|---|
| `login` | Authentication records | `username`, `password`, `usertype`, `status` |
| `users` | User profiles | `username`, `name`, `email`, `department`, `course`, `semester` |
| `departments` | Academic departments | `name`, `code`, `hod` |
| `courses` | Academic courses | `name`, `code`, `department`, `duration`, `semesters` |
| `attendance` | Attendance records | `course`, `date`, `session`, `attendance_data[]` |
| `exams` | Exam schedules | `course`, `semester`, `exam_date`, `faculty_username` |
| `materials` | Study materials | `title`, `course`, `faculty_username` |
| `announcements` | Campus announcements | `title`, `content`, `role`, `created_by` |
| `events` | Campus events | `title`, `date`, `status`, `created_by` |
| `appointments` | Student-faculty meetings | `student_username`, `faculty_username`, `status` |
| `grievances` | Student grievances | `student_username`, `department`, `status`, `response` |
| `timetable` | Class timetables | `course`, `department`, `semester` |
| `faqs` | Frequently asked questions | `question`, `answer` |
| `settings` | System settings | `key: "global"` |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **MongoDB** (running locally on port 27017)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smartcampusreact
```

### 2. Setup Backend

```bash
cd back

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with initial data
python seed_admin.py           # Creates admin user
python seed_dummy_data.py      # Creates departments, courses, faculty, students

# Start the backend server
python app.py                  # Runs on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd react-project

# Install dependencies
npm install

# Start the development server
npm run dev                    # Runs on http://localhost:5173
```

### 4. Open the Application

Navigate to **http://localhost:5173** in your browser.

---

## 🔐 Default Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Faculty** | `fac_arun` | `faculty@123` |
| **Student** | `stu_adithyan` | `student@123` |

> 💡 **Tip:** Click the **Demo Credentials** buttons on the Login page to auto-fill these.

---

## 🌐 API Endpoints Summary

All API routes are prefixed with `/api`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/register/:role` | Register (student/faculty) |

### Admin (~20 endpoints)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/pending` | Pending approvals |
| PUT | `/api/admin/users/approve/:id` | Approve a user |
| PUT | `/api/admin/users/reject/:id` | Reject a user |
| DELETE | `/api/admin/users/:id` | Delete a user |
| GET/POST | `/api/admin/departments` | List/create departments |
| PUT/DELETE | `/api/admin/departments/:id` | Update/delete department |
| GET/POST | `/api/admin/courses` | List/create courses |
| PUT/DELETE | `/api/admin/courses/:id` | Update/delete course |
| GET/POST | `/api/admin/announcements` | List/create announcements |
| GET | `/api/admin/events` | List events |
| PUT | `/api/admin/events/approve/:id` | Approve event |
| PUT | `/api/admin/events/reject/:id` | Reject event |
| POST | `/api/admin/timetable` | Create/update timetable |
| POST | `/api/admin/faqs` | Create FAQ |
| GET/PUT | `/api/admin/settings` | Get/update settings |

### Faculty (~15 endpoints)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/faculty/dashboard` | Dashboard stats |
| GET/PUT | `/api/faculty/profile` | Get/update profile |
| PUT | `/api/faculty/password` | Change password |
| GET | `/api/faculty/courses` | List courses |
| GET | `/api/faculty/subjects` | List subjects |
| GET | `/api/faculty/students` | List students |
| GET/POST | `/api/faculty/attendance` | Get/mark attendance |
| GET/POST | `/api/faculty/exams` | Get/create exams |
| GET/POST | `/api/faculty/materials` | Get/upload materials |
| GET/POST | `/api/faculty/announcements` | Get/post announcements |
| GET/POST | `/api/faculty/events` | Get/create events |
| GET | `/api/faculty/appointments` | List appointments |
| PUT | `/api/faculty/appointments/:id/approve` | Approve appointment |
| PUT | `/api/faculty/appointments/:id/reject` | Reject appointment |
| GET | `/api/faculty/grievances` | List grievances |
| PUT | `/api/faculty/grievances/:id/respond` | Respond to grievance |

### Student (~15 endpoints)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/student/dashboard` | Dashboard stats |
| GET/PUT | `/api/student/profile` | Get/update profile |
| PUT | `/api/student/password` | Change password |
| GET | `/api/student/attendance` | View attendance |
| GET | `/api/student/exams` | View exams |
| GET | `/api/student/timetable` | View timetable |
| GET | `/api/student/materials` | Browse materials |
| GET | `/api/student/announcements` | View announcements |
| GET | `/api/student/events` | View events |
| GET | `/api/faqs` | Search FAQs |
| GET/POST | `/api/student/appointments` | List/book appointments |
| GET/POST | `/api/student/grievances` | List/submit grievances |

---

## ⚙️ Environment Variables (Optional)

| Variable | Default | Description |
|---|---|---|
| `MONGO_DATABASE` | `smart_campus` | MongoDB database name |
| `MONGO_USERNAME` | *(none)* | MongoDB auth username |
| `MONGO_PASSWORD` | *(none)* | MongoDB auth password |
| `MONGO_HOST` | `localhost` | MongoDB server host |
| `MONGO_PORT` | `27017` | MongoDB server port |

---

## 📝 License

This project is developed for **Mar Elias College, Kottappady** as an academic project.
