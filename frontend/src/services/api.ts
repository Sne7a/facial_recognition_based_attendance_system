const BASE_URL = "https://172.20.10.2:8443"; // your actual IP

export function saveToken(token: string) { localStorage.setItem("access_token", token); }
export function getToken(): string | null { return localStorage.getItem("access_token"); }
export function clearToken() { localStorage.removeItem("access_token"); }

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Unknown error" }));
      console.error(`API error ${res.status} on ${path}:`, err);
      return err;
    }

    return res.json();
  } catch (err) {
    console.error(`Network error on ${path}:`, err);
    throw err;
  }
}

export async function login(email: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}
export async function logout() { return apiFetch("/api/auth/logout", { method: "POST" }); }
export async function forgotPassword(email: string) {
  return apiFetch("/api/auth/forgotpassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}
export async function getMe() { return apiFetch("/api/users/me"); }
export async function getMyAttendance() { return apiFetch("/api/students/me/attendance"); }
export async function getMyTimetable() { return apiFetch("/api/students/me/timetable"); }
export async function uploadFace(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/api/students/me/face", { method: "POST", body: formData });
}
export async function getMySubjects() { return apiFetch("/api/faculty/me/subjects"); }
export async function getMySchedule() { return apiFetch("/api/faculty/me/schedule"); }
export async function getClassAttendance(class_id: number) {
  return apiFetch(`/api/faculty/me/subjects/${class_id}/attendance`);
}
export async function overrideAttendance(
  student_id: number, schedule_id: number, attend_date: string, status: string
) {
  return apiFetch("/api/faculty/me/attendance/override", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id, schedule_id, attend_date, status }),
  });
}
export async function getMyStudents() { return apiFetch("/api/parents/me/students"); }
export async function getChildAttendance(student_id: number) {
  return apiFetch(`/api/parents/me/students/${student_id}/attendance`);
}
export async function getChildTeachers(student_id: number) {
  return apiFetch(`/api/parents/me/students/${student_id}/teachers`);
}
export async function getAlerts() { return apiFetch("/api/parents/me/alerts"); }
export async function getAllUsers() { return apiFetch("/api/admin/users"); }
export async function createUser(
  email: string, password: string, role: string,
  first_name: string, last_name: string
) {
  return apiFetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role, first_name, last_name }),
  });
}
export async function getAllSubjects() { return apiFetch("/api/admin/subjects"); }
export async function createSubject(
  subject_name: string, subject_code: string, semester_id: number
) {
  return apiFetch("/api/admin/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject_name, subject_code, semester_id }),
  });
}
export async function createTimetableEntry(
  class_id: number, day_of_week: string,
  start_time: string, end_time: string, room_identifier: string
) {
  return apiFetch("/api/admin/timetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ class_id, day_of_week, start_time, end_time, room_identifier }),
  });
}
export async function getAnalytics() { return apiFetch("/api/admin/attendance/analytics"); }

export async function updateUser(user_id: string | number, email: string, role: string) {
  return apiFetch(`/api/admin/users/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, role }),
  });
}

export async function getStudentsBySemester(semester_id: number) {
  return apiFetch(`/api/admin/students?semester_id=${semester_id}`);
}
export async function getAllClasses() {
  return apiFetch("/api/admin/classes");
}
export async function enrollStudent(student_id: number, class_id: number) {
  return apiFetch("/api/admin/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id, class_id }),
  });
}

export async function getSessions() {
  return apiFetch("/api/admin/sessions");
}
export async function assignSubjects(user_id: number, session_id: number, subject_ids: number[]) {
  return apiFetch(`/api/admin/users/${user_id}/assign-subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, subject_ids }),
  });
}
export async function getTeacherSubjects(user_id: number) {
  return apiFetch(`/api/admin/users/${user_id}/subjects`);
}
export async function linkParent(user_id: number, email: string, password: string, first_name: string, last_name: string, phone_number: string) {
  return apiFetch(`/api/admin/users/${user_id}/link-parent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, first_name, last_name, phone_number }),
  });
}