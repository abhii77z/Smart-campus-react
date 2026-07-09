import axios from 'axios'

const BASE = '/api'

// ─── Auth helpers ─────────────────────────────────────────────
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('sc_user') || 'null') }
  catch { return null }
}
export const setUser = (u) => localStorage.setItem('sc_user', JSON.stringify(u))
export const clearUser = () => localStorage.removeItem('sc_user')

// Axios instance with Login-Id header auto-injection
const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(config => {
  const user = getUser()
  if (user?.login_id) config.headers['Login-Id'] = user.login_id
  return config
})

// ─── AUTH ─────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data)
export const register = (role, data) => api.post(`/auth/register/${role}`, data)

// ─── ADMIN ────────────────────────────────────────────────────
export const adminDashboard = () => api.get('/admin/dashboard')
export const adminUsers = () => api.get('/admin/users')
export const adminPendingUsers = () => api.get('/admin/users/pending')
export const adminApproveUser = (id) => api.put(`/admin/users/approve/${id}`)
export const adminRejectUser = (id) => api.put(`/admin/users/reject/${id}`)
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`)
export const adminAssignDepartment = (id, d) => api.put(`/admin/users/${id}/department`, d)

export const adminDepartments = () => api.get('/admin/departments')
export const adminCreateDepartment = (d) => api.post('/admin/departments', d)
export const adminUpdateDepartment = (id, d) => api.put(`/admin/departments/${id}`, d)
export const adminDeleteDepartment = (id) => api.delete(`/admin/departments/${id}`)

export const adminCourses = () => api.get('/admin/courses')
export const adminCreateCourse = (d) => api.post('/admin/courses', d)
export const adminUpdateCourse = (id, d) => api.put(`/admin/courses/${id}`, d)
export const adminDeleteCourse = (id) => api.delete(`/admin/courses/${id}`)

export const adminAnnouncements = () => api.get('/admin/announcements')
export const adminCreateAnnouncement = (d) => api.post('/admin/announcements', d)
export const adminDeleteAnnouncement = (id) => api.delete(`/admin/announcements/${id}`)

export const adminEvents = () => api.get('/admin/events')
export const adminApproveEvent = (id) => api.put(`/admin/events/${id}/approve`)
export const adminRejectEvent = (id) => api.put(`/admin/events/${id}/reject`)
export const adminDeleteEvent = (id) => api.delete(`/admin/events/${id}`)

export const adminTimetable = () => api.get('/admin/timetable')
export const adminSaveTimetable = (d) => api.post('/admin/timetable', d)
export const adminDeleteTimetable = (id) => api.delete(`/admin/timetable/${id}`)

export const adminCreateFaq = (d) => api.post('/admin/faqs', d)
export const adminGetSettings = () => api.get('/admin/settings')
export const adminSaveSettings = (d) => api.put('/admin/settings', d)

// ─── FACULTY ──────────────────────────────────────────────────
export const facultyDashboard = () => api.get('/faculty/dashboard')
export const facultyProfile = () => api.get('/faculty/profile')
export const facultyUpdateProfile = (d) => api.put('/faculty/profile', d)
export const facultyChangePassword = (d) => api.put('/faculty/password', d)

export const facultyCourses = () => api.get('/faculty/courses')
export const facultySubjects = (course) => api.get(`/faculty/subjects?course=${course}`)
export const facultyStudents = (course, semester) => {
  const params = new URLSearchParams()
  if (course) params.append('course', course)
  if (semester) params.append('semester', semester)
  return api.get(`/faculty/students?${params.toString()}`)
}
export const facultyMarkAttendance = (d) => api.post('/faculty/attendance', d)
export const facultyGetAttendance = (params) => api.get('/faculty/attendance', { params })

export const facultyExams = () => api.get('/faculty/exams')
export const facultyCreateExam = (d) => api.post('/faculty/exams', d)

export const facultyMaterials = () => api.get('/faculty/materials')
export const facultyUploadMaterial = (d) => api.post('/faculty/materials', d)

export const facultyAnnouncements = () => api.get('/faculty/announcements')
export const facultyPostAnnouncement = (d) => api.post('/faculty/announcements', d)

export const facultyEvents = () => api.get('/faculty/events')
export const facultyCreateEvent = (d) => api.post('/faculty/events', d)

export const facultyAppointments = () => api.get('/faculty/appointments')
export const facultyApproveAppointment = (id, d) => api.put(`/faculty/appointments/${id}/approve`, d)
export const facultyRejectAppointment = (id, d) => api.put(`/faculty/appointments/${id}/reject`, d)

export const facultyGrievances = () => api.get('/faculty/grievances')
export const facultyRespondGrievance = (id, d) => api.put(`/faculty/grievances/${id}/respond`, d)

// ─── STUDENT ──────────────────────────────────────────────────
export const studentDashboard = () => api.get('/student/dashboard')
export const studentProfile = () => api.get('/student/profile')
export const studentUpdateProfile = (d) => api.put('/student/profile', d)
export const studentChangePassword = (d) => api.put('/student/password', d)

export const studentAttendance = () => api.get('/student/attendance')
export const studentExams = () => api.get('/student/exams')
export const studentTimetable = () => api.get('/student/timetable')
export const studentMaterials = () => api.get('/student/materials')

export const studentAnnouncements = () => api.get('/student/announcements')
export const studentEvents = () => api.get('/student/events')
export const getFaqs = (search) => api.get(`/faqs${search ? `?search=${search}` : ''}`)

export const studentAppointments = () => api.get('/student/appointments')
export const studentBookAppointment = (d) => api.post('/student/appointments', d)

export const studentGrievances = () => api.get('/student/grievances')
export const studentSubmitGrievance = (d) => api.post('/student/grievances', d)

// ─── Grouped API objects (used by module components) ──────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard').then(r => r.data),
  getUsers: () => api.get('/admin/users').then(r => r.data),
  getPendingUsers: () => api.get('/admin/users/pending').then(r => r.data),
  approveUser: (id) => api.put(`/admin/users/approve/${id}`).then(r => r.data),
  rejectUser: (id) => api.put(`/admin/users/reject/${id}`).then(r => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(r => r.data),
  assignDepartment: (id, d) => api.put(`/admin/users/${id}/department`, d).then(r => r.data),
  getDepartments: () => api.get('/admin/departments').then(r => r.data),
  createDepartment: (d) => api.post('/admin/departments', d).then(r => r.data),
  updateDepartment: (id, d) => api.put(`/admin/departments/${id}`, d).then(r => r.data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`).then(r => r.data),
  getCourses: () => api.get('/admin/courses').then(r => r.data),
  createCourse: (d) => api.post('/admin/courses', d).then(r => r.data),
  updateCourse: (id, d) => api.put(`/admin/courses/${id}`, d).then(r => r.data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`).then(r => r.data),
  getAnnouncements: () => api.get('/admin/announcements').then(r => r.data),
  createAnnouncement: (d) => api.post('/admin/announcements', d).then(r => r.data),
  getEvents: () => api.get('/admin/events').then(r => r.data),
  approveEvent: (id) => api.put(`/admin/events/approve/${id}`).then(r => r.data),
  rejectEvent: (id, d) => api.put(`/admin/events/reject/${id}`, d).then(r => r.data),
  createTimetable: (d) => api.post('/admin/timetable', d).then(r => r.data),
  getTimetables: () => api.get('/admin/timetable').then(r => r.data),
  deleteTimetable: (id) => api.delete(`/admin/timetable/${id}`).then(r => r.data),
  getFaqs: () => api.get('/faqs').then(r => r.data),
  createFaq: (d) => api.post('/admin/faqs', d).then(r => r.data),
  deleteFaq: (id) => api.delete(`/admin/faqs/${id}`).then(r => r.data),
  getSettings: () => api.get('/admin/settings').then(r => r.data),
  updateSettings: (d) => api.put('/admin/settings', d).then(r => r.data),
}

export const facultyAPI = {
  getDashboard: () => api.get('/faculty/dashboard').then(r => r.data),
  getProfile: () => api.get('/faculty/profile').then(r => r.data),
  updateProfile: (d) => api.put('/faculty/profile', d).then(r => r.data),
  updatePassword: (d) => api.put('/faculty/password', d).then(r => r.data),
  getCourses: () => api.get('/faculty/courses').then(r => r.data),
  getTimetable: () => api.get('/faculty/timetable').then(r => r.data),
  getSubjects: (course) => api.get(`/faculty/subjects?course=${encodeURIComponent(course)}`).then(r => r.data),
  getStudents: (course, semester) => {
    const params = new URLSearchParams()
    if (course) params.append('course', course)
    if (semester) params.append('semester', semester)
    return api.get(`/faculty/students?${params.toString()}`).then(r => r.data)
  },
  submitAttendance: (d) => api.post('/faculty/attendance', d).then(r => r.data),
  getAttendanceReport: (course) => api.get(`/faculty/attendance${course ? '?course=' + encodeURIComponent(course) : ''}`).then(r => r.data),
  getExams: () => api.get('/faculty/exams').then(r => r.data),
  createExam: (d) => api.post('/faculty/exams', d).then(r => r.data),
  getMaterials: () => api.get('/faculty/materials').then(r => r.data),
  uploadMaterial: (d) => api.post('/faculty/materials', d).then(r => r.data),
  getAnnouncements: () => api.get('/faculty/announcements').then(r => r.data),
  createAnnouncement: (d) => api.post('/faculty/announcements', d).then(r => r.data),
  createEvent: (d) => api.post('/faculty/events', d).then(r => r.data),
  getAppointments: () => api.get('/faculty/appointments').then(r => r.data),
  approveAppointment: (id, d) => api.put(`/faculty/appointments/${id}/approve`, d).then(r => r.data),
  rejectAppointment: (id, d) => api.put(`/faculty/appointments/${id}/reject`, d).then(r => r.data),
  getGrievances: () => api.get('/faculty/grievances').then(r => r.data),
  respondGrievance: (id, d) => api.put(`/faculty/grievances/${id}/respond`, d).then(r => r.data),
  getAnonymousReports: () => api.get('/faculty/anonymous-reports').then(r => r.data),
  respondAnonymousReport: (id, d) => api.put(`/faculty/anonymous-reports/${id}/respond`, d).then(r => r.data),
}

export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard').then(r => r.data),
  getProfile: () => api.get('/student/profile').then(r => r.data),
  updateProfile: (d) => api.put('/student/profile', d).then(r => r.data),
  updatePassword: (d) => api.put('/student/password', d).then(r => r.data),
  getTimetable: () => api.get('/student/timetable').then(r => r.data),
  getAttendance: () => api.get('/student/attendance').then(r => r.data),
  getExams: () => api.get('/student/exams').then(r => r.data),
  getMaterials: () => api.get('/student/materials').then(r => r.data),
  getAnnouncements: () => api.get('/student/announcements').then(r => r.data),
  getEvents: () => api.get('/student/events').then(r => r.data),
  getFaqs: (search) => api.get(`/faqs${search ? '?search=' + encodeURIComponent(search) : ''}`).then(r => r.data),
  getAppointments: () => api.get('/student/appointments').then(r => r.data),
  bookAppointment: (d) => api.post('/student/appointments', d).then(r => r.data),
  getGrievances: () => api.get('/student/grievances').then(r => r.data),
  submitGrievance: (d) => api.post('/student/grievances', d).then(r => r.data),
  submitAnonymousReport: (d) => api.post('/student/anonymous-reports', d).then(r => r.data),
  getAnonymousReports: (tokens) => api.get(`/student/anonymous-reports?tokens=${encodeURIComponent(tokens)}`).then(r => r.data),
}

export default api
