import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getUser } from '../services/api'

// Auth
import Login from '../modules/auth/Login'
import Signup from '../modules/auth/Signup'

// Admin
import AdminDashboard from '../modules/admin/AdminDashboard'
import AdminUsers from '../modules/admin/AdminUsers'
import AdminApprovals from '../modules/admin/AdminApprovals'
import AdminDepartments from '../modules/admin/AdminDepartments'
import AdminCourses from '../modules/admin/AdminCourses'
import AdminAnnouncements from '../modules/admin/AdminAnnouncements'
import AdminEvents from '../modules/admin/AdminEvents'
import AdminTimetable from '../modules/admin/AdminTimetable'
import AdminFaqs from '../modules/admin/AdminFaqs'
import AdminSettings from '../modules/admin/AdminSettings'

// Faculty
import FacultyDashboard from '../modules/faculty/FacultyDashboard'
import FacultyProfile from '../modules/faculty/FacultyProfile'
import FacultyTimetable from '../modules/faculty/FacultyTimetable'
import FacultyAttendance from '../modules/faculty/FacultyAttendance'
import FacultyExams from '../modules/faculty/FacultyExams'
import FacultyMaterials from '../modules/faculty/FacultyMaterials'
import FacultyAnnouncements from '../modules/faculty/FacultyAnnouncements'
import FacultyEvents from '../modules/faculty/FacultyEvents'
import FacultyAppointments from '../modules/faculty/FacultyAppointments'
import FacultyGrievances from '../modules/faculty/FacultyGrievances'
import FacultyAnonymousReports from '../modules/faculty/FacultyAnonymousReports'

// Student
import StudentDashboard from '../modules/student/StudentDashboard'
import StudentProfile from '../modules/student/StudentProfile'
import StudentTimetable from '../modules/student/StudentTimetable'
import StudentAttendance from '../modules/student/StudentAttendance'
import StudentExams from '../modules/student/StudentExams'
import StudentMaterials from '../modules/student/StudentMaterials'
import StudentAnnouncements from '../modules/student/StudentAnnouncements'
import StudentEvents from '../modules/student/StudentEvents'
import StudentFaqs from '../modules/student/StudentFaqs'
import StudentAppointments from '../modules/student/StudentAppointments'
import StudentGrievances from '../modules/student/StudentGrievances'
import StudentAnonymousReports from '../modules/student/StudentAnonymousReports'

function PrivateRoute({ children, role }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

function HomeRedirect() {
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/approvals" element={<PrivateRoute role="admin"><AdminApprovals /></PrivateRoute>} />
        <Route path="/admin/departments" element={<PrivateRoute role="admin"><AdminDepartments /></PrivateRoute>} />
        <Route path="/admin/courses" element={<PrivateRoute role="admin"><AdminCourses /></PrivateRoute>} />
        <Route path="/admin/announcements" element={<PrivateRoute role="admin"><AdminAnnouncements /></PrivateRoute>} />
        <Route path="/admin/events" element={<PrivateRoute role="admin"><AdminEvents /></PrivateRoute>} />
        <Route path="/admin/timetable" element={<PrivateRoute role="admin"><AdminTimetable /></PrivateRoute>} />
        <Route path="/admin/faqs" element={<PrivateRoute role="admin"><AdminFaqs /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute role="admin"><AdminSettings /></PrivateRoute>} />

        <Route path="/faculty/dashboard" element={<PrivateRoute role="faculty"><FacultyDashboard /></PrivateRoute>} />
        <Route path="/faculty/profile" element={<PrivateRoute role="faculty"><FacultyProfile /></PrivateRoute>} />
        <Route path="/faculty/timetable" element={<PrivateRoute role="faculty"><FacultyTimetable /></PrivateRoute>} />
        <Route path="/faculty/attendance" element={<PrivateRoute role="faculty"><FacultyAttendance /></PrivateRoute>} />
        <Route path="/faculty/exams" element={<PrivateRoute role="faculty"><FacultyExams /></PrivateRoute>} />
        <Route path="/faculty/materials" element={<PrivateRoute role="faculty"><FacultyMaterials /></PrivateRoute>} />
        <Route path="/faculty/announcements" element={<PrivateRoute role="faculty"><FacultyAnnouncements /></PrivateRoute>} />
        <Route path="/faculty/events" element={<PrivateRoute role="faculty"><FacultyEvents /></PrivateRoute>} />
        <Route path="/faculty/appointments" element={<PrivateRoute role="faculty"><FacultyAppointments /></PrivateRoute>} />
        <Route path="/faculty/grievances" element={<PrivateRoute role="faculty"><FacultyGrievances /></PrivateRoute>} />
        <Route path="/faculty/anonymous-reports" element={<PrivateRoute role="faculty"><FacultyAnonymousReports /></PrivateRoute>} />

        <Route path="/student/dashboard" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/profile" element={<PrivateRoute role="student"><StudentProfile /></PrivateRoute>} />
        <Route path="/student/timetable" element={<PrivateRoute role="student"><StudentTimetable /></PrivateRoute>} />
        <Route path="/student/attendance" element={<PrivateRoute role="student"><StudentAttendance /></PrivateRoute>} />
        <Route path="/student/exams" element={<PrivateRoute role="student"><StudentExams /></PrivateRoute>} />
        <Route path="/student/materials" element={<PrivateRoute role="student"><StudentMaterials /></PrivateRoute>} />
        <Route path="/student/announcements" element={<PrivateRoute role="student"><StudentAnnouncements /></PrivateRoute>} />
        <Route path="/student/events" element={<PrivateRoute role="student"><StudentEvents /></PrivateRoute>} />
        <Route path="/student/faqs" element={<PrivateRoute role="student"><StudentFaqs /></PrivateRoute>} />
        <Route path="/student/appointments" element={<PrivateRoute role="student"><StudentAppointments /></PrivateRoute>} />
        <Route path="/student/grievances" element={<PrivateRoute role="student"><StudentGrievances /></PrivateRoute>} />
        <Route path="/student/anonymous-reports" element={<PrivateRoute role="student"><StudentAnonymousReports /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
