// ============================================================
// api.js — Central API integration module
// Handles: Courses, Categories, Topics, Instructors,
//          Enrollments, Reviews, Weekly Schedules
// ============================================================

const API_BASE = 'https://api.redclass.redberryinternship.ge/api';

function getToken() {
  return localStorage.getItem('lp_token');
}

function authHeaders(json = false) {
  const token = getToken();
  const headers = { 'Accept': 'application/json' };
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ─── Generic fetch wrapper ────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(options.json),
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || `HTTP ${res.status}`), { status: res.status, data: err });
  }
  return res.json();
}

// ─── COURSES ─────────────────────────────────────────────────
// GET /courses  — list/filter courses
// Params: category_id, topic_id, instructor_id, sort (price_asc|price_desc|rating_desc)
export async function fetchCourses(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return apiFetch(`/courses${qs ? '?' + qs : ''}`);
}

// GET /courses/:id — single course detail
export async function fetchCourse(id) {
  return apiFetch(`/courses/${id}`);
}

// ─── CATEGORIES ──────────────────────────────────────────────
export async function fetchCategories() {
  return apiFetch('/categories');
}

// ─── TOPICS ──────────────────────────────────────────────────
export async function fetchTopics() {
  return apiFetch('/topics');
}

// ─── INSTRUCTORS ─────────────────────────────────────────────
export async function fetchInstructors() {
  return apiFetch('/instructors');
}

// ─── WEEKLY SCHEDULES (3-step scheduling on course page) ─────
// Step 1: GET /courses/:id/weekly-schedules
export async function fetchWeeklySchedules(courseId) {
  return apiFetch(`/courses/${courseId}/weekly-schedules`);
}
// Step 2: GET /courses/:id/time-slots?weekly_schedule_id=X
export async function fetchTimeSlots(courseId, weeklyScheduleId) {
  return apiFetch(`/courses/${courseId}/time-slots?weekly_schedule_id=${weeklyScheduleId}`);
}
// Step 3: GET /courses/:id/session-types?weekly_schedule_id=X&time_slot_id=Y
export async function fetchSessionTypes(courseId, weeklyScheduleId, timeSlotId) {
  return apiFetch(`/courses/${courseId}/session-types?weekly_schedule_id=${weeklyScheduleId}&time_slot_id=${timeSlotId}`);
}

// ─── ENROLLMENTS ─────────────────────────────────────────────
// GET /enrollments — list authenticated user's enrollments
export async function fetchEnrollments() {
  return apiFetch('/enrollments');
}
// POST /enrollments — enroll { course_id, weekly_schedule_id, time_slot_id, session_type_id }
export async function enrollCourse(payload) {
  return apiFetch('/enrollments', {
    method: 'POST',
    json: true,
    body: JSON.stringify(payload),
  });
}
// PATCH /enrollments/:id/complete — mark enrollment complete
export async function completeEnrollment(enrollmentId) {
  return apiFetch(`/enrollments/${enrollmentId}/complete`, { method: 'PATCH' });
}
// DELETE /enrollments/:id — unenroll
export async function deleteEnrollment(enrollmentId) {
  return apiFetch(`/enrollments/${enrollmentId}`, { method: 'DELETE' });
}

// ─── REVIEWS ─────────────────────────────────────────────────
// POST /courses/:id/reviews — { rating: 1-5 }
export async function submitReview(courseId, rating) {
  return apiFetch(`/courses/${courseId}/reviews`, {
    method: 'POST',
    json: true,
    body: JSON.stringify({ rating }),
  });
}
