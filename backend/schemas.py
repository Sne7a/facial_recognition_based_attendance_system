from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time

#Authorization Schemas

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# profile is keyed by role name e.g. {"faculty": {...}, "parent": {...}}
# Students will only ever have {"student": {...}} since student is an exclusive role.

class UserMeResponse(BaseModel):
    user_id: int
    email: str
    roles: List[str]
    profile: Dict[str, Any]

    class Config:
        from_attributes = True

#Attendance

class AttendanceSummary(BaseModel):
    subject_name: str
    total_classes: int
    present: int
    attendance_percentage: float


#Timetable

class TimetableEntry(BaseModel):
    schedule_id: int
    subject_name: Optional[str]
    day_of_week: Optional[str]
    start_time: Optional[time]
    end_time: Optional[time]
    room_identifier: Optional[str]
    teacher_name: Optional[str]

    class Config:
        from_attributes = True

#Face Upload

class FaceUploadResponse(BaseModel):
    message: str
    student_id: int
    img_path: str



#Attendance mark(ESP32)

class AttendanceResponse(BaseModel):
    status: str
    message: str
    student_id: int
    schedule_id: Optional[int]=None
    recorded_at: Optional[datetime]=None

    class Config:
        from_attributes = True
    

#Faculty 

class SubjectEntry(BaseModel):
    class_id: int
    subject_name: str
    subject_code: Optional[str]
    session_name: Optional[str]

class FacultyAttendanceEntry(BaseModel):
    student_id: int
    student_name: str
    attend_date: date
    status: Optional[str]

class AttendanceOverrideRequest(BaseModel):
    student_id: int
    schedule_id: int
    attend_date: date
    status: str  # "present", "absent", "late"

class AttendanceOverrideResponse(BaseModel):
    message: str
    attend_id: int
    updated_status: str

#Parent 

class LinkedStudentEntry(BaseModel):
    student_id: int
    first_name: Optional[str]
    last_name: Optional[str]
    curr_semester: Optional[int]

class AlertEntry(BaseModel):
    student_id: int
    student_name: str
    subject_name: str
    attendance_percentage: float
    message: str

#Admin

class AdminUserEntry(BaseModel):
    user_id: int
    email: str
    roles: List[str]

class CreateUserRequest(BaseModel):
    email: str
    password: str
    role: str  # "student", "faculty", "parent", "admin"
    first_name: str
    last_name: str
    curr_semester: Optional[int] = None  # Only for students
    department: Optional[str] = None  # Only for faculty

class CreateUserResponse(BaseModel):
    message: str
    user_id: int

class SubjectCreateRequest(BaseModel):
    subject_name: str
    subject_code: Optional[str] = None
    semester_id: Optional[int] = None

class SubjectCreateResponse(BaseModel):
    message: str
    subject_id: int

class TimetableCreateRequest(BaseModel):
    class_id: int
    day_of_week: str
    start_time: time
    end_time: time
    room_identifier: str

class TimetableCreateResponse(BaseModel):
    message: str
    schedule_id: int

class AnalyticsResponse(BaseModel):
    total_students: int
    total_classes_held: int
    overall_attendance_rate: float
    subject_wise: List[dict]

class AttendanceCreateSchema(BaseModel):
    student_id: int
    schedule_id: int
    attend_date: date
    status: str  # "present", "absent", "late"