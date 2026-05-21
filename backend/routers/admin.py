from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import select, func, case
from passlib.context import CryptContext
from typing import List, Optional
from pydantic import BaseModel
import os
import shutil

from dbz import get_db
import modelz
import schemas
from dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DATASET_DIR = r"D:\major_proj\backend\OpenCV Demo\dataset"


@router.get("/users", response_model=List[schemas.AdminUserEntry])
def list_users(_=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.execute(select(modelz.Users)).scalars().all()
    return [
        schemas.AdminUserEntry(
            user_id=u.user_id,
            email=u.email,
            roles=[r.role_name for r in u.role]
        )
        for u in users
    ]


@router.post("/users", response_model=schemas.CreateUserResponse)
def create_user(
    payload: schemas.CreateUserRequest,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check email uniqueness
    existing = db.execute(
        select(modelz.Users).where(modelz.Users.email == payload.email)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Validate role exists
    role = db.execute(
        select(modelz.Roles).where(modelz.Roles.role_name == payload.role)
    ).scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{payload.role}' does not exist.")

    # ── Business Rule: student is an exclusive role ───────────────────────────
    if payload.role == "student":
        # Students must be registered via /students/register (includes dataset capture)
        raise HTTPException(
            status_code=400,
            detail="Students must be registered via POST /api/admin/students/register which requires dataset images."
        )
    else:
        # For non-student roles, ensure this email is not already a student
        student_check = db.execute(
            select(modelz.Students)
            .join(modelz.Users, modelz.Students.user_id == modelz.Users.user_id)
            .where(modelz.Users.email == payload.email)
        ).scalar_one_or_none()
        if student_check:
            raise HTTPException(
                status_code=400,
                detail="This user is a student. Students cannot be assigned additional roles."
            )

    new_user = modelz.Users(
        email=payload.email,
        password_hash=pwd_context.hash(payload.password)
    )
    new_user.role.append(role)
    db.add(new_user)
    db.flush()

    if payload.role == "faculty":
        db.add(modelz.Teachers(
            user_id=new_user.user_id,
            first_name=payload.first_name,
            last_name=payload.last_name,
            department=payload.department
        ))
    elif payload.role == "parent":
        db.add(modelz.Parents(
            user_id=new_user.user_id,
            first_name=payload.first_name,
            last_name=payload.last_name
        ))
    elif payload.role == "admin":
        db.add(modelz.Admins(
            user_id=new_user.user_id,
            first_name=payload.first_name,
            last_name=payload.last_name
        ))

    db.commit()
    return schemas.CreateUserResponse(message="User created successfully.", user_id=new_user.user_id)


# ──────────────────────────────────────────────────────────────────────────────
# STUDENT REGISTRATION — email only commits if dataset images are saved
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/students/register", response_model=schemas.CreateUserResponse)
async def register_student_with_dataset(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    curr_semester: int = Form(...),
    files: List[UploadFile] = File(...),
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    # 1. Validate email uniqueness BEFORE touching filesystem
    existing = db.execute(
        select(modelz.Users).where(modelz.Users.email == email)
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="Dataset images are required to register a student.")

    # 2. Validate student role exists
    role = db.execute(
        select(modelz.Roles).where(modelz.Roles.role_name == "student")
    ).scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=400, detail="Student role not found in database.")

    # 3. Create user + student — flush to get IDs, don't commit yet
    new_user = modelz.Users(
        email=email,
        password_hash=pwd_context.hash(password)
    )
    new_user.role.append(role)
    db.add(new_user)
    db.flush()

    new_student = modelz.Students(
        user_id=new_user.user_id,
        first_name=first_name,
        last_name=last_name,
        curr_semester=curr_semester
    )
    db.add(new_student)
    db.flush()

    # 4. Save dataset images to DATASET_DIR/student_id/
    #    These feed encodings.pkl — NOT stored in StudentImages table
    student_folder = os.path.join(DATASET_DIR, str(new_student.student_id))
    try:
        os.makedirs(student_folder, exist_ok=True)
        saved_count = 0
        for i, file in enumerate(files):
            contents = await file.read()
            if not contents:
                continue
            file_path = os.path.join(student_folder, f"dataset_{i}_{file.filename}")
            with open(file_path, "wb") as f:
                f.write(contents)
            saved_count += 1
    except Exception as e:
        db.rollback()
        # Clean up any partially saved files so no orphaned folder
        if os.path.exists(student_folder):
            shutil.rmtree(student_folder)
        raise HTTPException(status_code=500, detail=f"Failed to save dataset images: {str(e)}")

    if saved_count == 0:
        db.rollback()
        if os.path.exists(student_folder):
            shutil.rmtree(student_folder)
        raise HTTPException(status_code=400, detail="No valid images were saved. Student not registered.")

    # 5. All good — commit user + student atomically
    db.commit()

    # 6. Retrain model so new student is immediately recognizable
    from main import train_model, load_encodings
    train_model()
    load_encodings()

    return schemas.CreateUserResponse(
        message=f"Student registered with {saved_count} dataset images. Model retrained.",
        user_id=new_user.user_id
    )


# ──────────────────────────────────────────────────────────────────────────────
# ADD MORE DATASET IMAGES for an already-registered student
# ──────────────────────────────────────────────────────────────────────────────
@router.post("/dataset/add")
async def add_dataset(
    student_id: int = Form(...),
    files: List[UploadFile] = File(...),
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Verify student exists
    student = db.execute(
        select(modelz.Students).where(modelz.Students.student_id == student_id)
    ).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    student_folder = os.path.join(DATASET_DIR, str(student_id))
    os.makedirs(student_folder, exist_ok=True)

    saved_count = 0
    for i, file in enumerate(files):
        contents = await file.read()        # async read — avoids blocking
        if not contents:
            continue
        file_path = os.path.join(student_folder, f"dataset_{i}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(contents)
        saved_count += 1
        # Note: NOT inserting into StudentImages — dataset images are not profile pictures

    if saved_count == 0:
        raise HTTPException(status_code=400, detail="No valid images were saved.")

    # Retrain immediately so added images take effect without server restart
    from main import train_model, load_encodings
    train_model()
    load_encodings()

    return {"success": True, "message": f"Saved {saved_count} images for student {student_id}. Model retrained."}


@router.get("/subjects", response_model=List[schemas.SubjectEntry])
def list_subjects(_=Depends(require_admin), db: Session = Depends(get_db)):
    subjects = db.execute(select(modelz.Subjects)).scalars().all()
    return [
        schemas.SubjectEntry(
            class_id=s.subject_id,
            subject_name=s.subject_name,
            subject_code=s.subject_code,
            session_name=None
        )
        for s in subjects
    ]


@router.post("/subjects", response_model=schemas.SubjectCreateResponse)
def create_subject(
    payload: schemas.SubjectCreateRequest,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    new_subject = modelz.Subjects(
        subject_name=payload.subject_name,
        subject_code=payload.subject_code,
        semester_id=payload.semester_id
    )
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return schemas.SubjectCreateResponse(
        message="Subject created successfully.",
        subject_id=new_subject.subject_id
    )


@router.post("/timetable", response_model=schemas.TimetableCreateResponse)
def create_timetable_entry(
    payload: schemas.TimetableCreateRequest,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    cls = db.execute(
        select(modelz.Classes).where(modelz.Classes.class_id == payload.class_id)
    ).scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found.")

    new_schedule = modelz.ClassSchedules(
        class_id=payload.class_id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        room_identifier=payload.room_identifier
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return schemas.TimetableCreateResponse(
        message="Schedule created successfully.",
        schedule_id=new_schedule.schedule_id
    )


@router.get("/attendance/analytics", response_model=schemas.AnalyticsResponse)
def get_analytics(_=Depends(require_admin), db: Session = Depends(get_db)):
    total_students = db.execute(select(func.count(modelz.Students.student_id))).scalar()
    total_records  = db.execute(select(func.count(modelz.AttendanceRecords.attend_id))).scalar()
    present_count  = db.execute(
        select(func.count(modelz.AttendanceRecords.attend_id))
        .where(modelz.AttendanceRecords.status == "present")
    ).scalar()

    overall_rate = round((present_count / total_records) * 100, 2) if total_records > 0 else 0.0

    subject_rows = db.execute(
        select(
            modelz.Classes.class_id,
            modelz.Subjects.subject_name,
            func.count(modelz.AttendanceRecords.attend_id).label("total"),
            func.sum(
                case((modelz.AttendanceRecords.status == "present", 1), else_=0)
            ).label("present")
        )
        .join(modelz.ClassSchedules, modelz.AttendanceRecords.schedule_id == modelz.ClassSchedules.schedule_id)
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .group_by(modelz.Classes.class_id, modelz.Subjects.subject_name)
    ).all()

    subject_wise = [
        {
            "class_id": row.class_id,
            "subject_name": row.subject_name,
            "total_classes": row.total,
            "present": row.present or 0,
            "attendance_percentage": round(((row.present or 0) / row.total) * 100, 2) if row.total > 0 else 0.0
        }
        for row in subject_rows
    ]

    return schemas.AnalyticsResponse(
        total_students=total_students,
        total_classes_held=total_records,
        overall_attendance_rate=overall_rate,
        subject_wise=subject_wise
    )


class UserUpdateSchema(BaseModel):
    email: str
    role: str


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserUpdateSchema,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.execute(
        select(modelz.Users).where(modelz.Users.user_id == user_id)
    ).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email != user.email:
        existing = db.execute(
            select(modelz.Users).where(modelz.Users.email == payload.email)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")

    user.email = payload.email

    existing_role = db.execute(
        select(modelz.Roles).where(modelz.Roles.role_name == payload.role)
    ).scalars().first()
    if not existing_role:
        existing_role = modelz.Roles(role_name=payload.role)
    user.role = [existing_role]

    profile_map = {
        "faculty": (modelz.Teachers, "teacher_id"),
        "student": (modelz.Students, "student_id"),
        "parent":  (modelz.Parents,  "parent_id"),
        "admin":   (modelz.Admins,   "admin_id"),
    }
    if payload.role in profile_map:
        model, _ = profile_map[payload.role]
        existing_profile = db.execute(
            select(model).where(model.user_id == user_id)
        ).scalar_one_or_none()
        if not existing_profile:
            db.add(model(user_id=user_id, first_name="", last_name=""))

    db.commit()
    return {"success": True, "message": "User updated successfully"}


@router.get("/students")
def get_students_by_semester(
    semester_id: int,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    students = db.execute(
        select(modelz.Students)
        .where(modelz.Students.curr_semester == semester_id)
    ).scalars().all()
    return [
        {"student_id": s.student_id, "first_name": s.first_name, "last_name": s.last_name}
        for s in students
    ]


@router.get("/classes")
def get_all_classes(
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    rows = db.execute(
        select(modelz.Classes, modelz.Subjects.subject_name)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
    ).all()
    return [
        {"class_id": cls.class_id, "subject_name": subj_name}
        for cls, subj_name in rows
    ]


@router.post("/enrollments")
def enroll_student(
    payload: dict,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        select(modelz.Enrollments)
        .where(modelz.Enrollments.student_id == payload["student_id"])
        .where(modelz.Enrollments.class_id == payload["class_id"])
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Student already enrolled in this class.")

    db.add(modelz.Enrollments(
        student_id=payload["student_id"],
        class_id=payload["class_id"]
    ))
    db.commit()
    return {"success": True, "message": "Student enrolled successfully."}


@router.get("/sessions")
def get_sessions(_=Depends(require_admin), db: Session = Depends(get_db)):
    sessions = db.execute(select(modelz.AcademicSessions)).scalars().all()
    return [{"session_id": s.session_id, "name": s.name} for s in sessions]


@router.post("/users/{user_id}/assign-subjects")
def assign_subjects(
    user_id: int,
    payload: dict,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    teacher = db.execute(
        select(modelz.Teachers).where(modelz.Teachers.user_id == user_id)
    ).scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    session_id = payload.get("session_id")
    subject_ids = payload.get("subject_ids", [])

    for subject_id in subject_ids:
        existing = db.execute(
            select(modelz.Classes)
            .where(modelz.Classes.subject_id == subject_id)
            .where(modelz.Classes.teacher_id == teacher.teacher_id)
            .where(modelz.Classes.session_id == session_id)
        ).scalar_one_or_none()
        if not existing:
            db.add(modelz.Classes(
                subject_id=subject_id,
                teacher_id=teacher.teacher_id,
                session_id=session_id
            ))
    db.commit()
    return {"success": True, "message": "Subjects assigned successfully."}


@router.get("/users/{user_id}/subjects")
def get_teacher_subjects(
    user_id: int,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    teacher = db.execute(
        select(modelz.Teachers).where(modelz.Teachers.user_id == user_id)
    ).scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found.")

    rows = db.execute(
        select(modelz.Classes, modelz.Subjects.subject_name, modelz.Subjects.subject_code)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .where(modelz.Classes.teacher_id == teacher.teacher_id)
    ).all()
    return [
        {
            "class_id": cls.class_id,
            "subject_id": cls.subject_id,
            "subject_name": sname,
            "subject_code": scode,
            "session_id": cls.session_id
        }
        for cls, sname, scode in rows
    ]


@router.post("/users/{user_id}/link-parent")
def link_parent(
    user_id: int,
    payload: dict,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    student = db.execute(
        select(modelz.Students).where(modelz.Students.user_id == user_id)
    ).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    existing = db.execute(
        select(modelz.Users).where(modelz.Users.email == payload["email"])
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Parent email already registered.")

    parent_role = db.execute(
        select(modelz.Roles).where(modelz.Roles.role_name == "parent")
    ).scalar_one_or_none()

    new_parent_user = modelz.Users(
        email=payload["email"],
        password_hash=pwd_context.hash(payload["password"])
    )
    if parent_role:
        new_parent_user.role.append(parent_role)
    db.add(new_parent_user)
    db.flush()

    new_parent = modelz.Parents(
        user_id=new_parent_user.user_id,
        first_name=payload["first_name"],
        last_name=payload["last_name"],
        phone_number=payload["phone_number"]
    )
    db.add(new_parent)
    db.flush()

    db.execute(
        modelz.t_student_parent_link.insert().values(
            student_id=student.student_id,
            parent_id=new_parent.parent_id
        )
    )
    db.commit()
    return {"success": True, "message": "Parent created and linked to student."}

@router.get("/students/all")
def get_all_students(
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    students = db.execute(select(modelz.Students)).scalars().all()
    return [
        {
            "student_id": s.student_id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "curr_semester": s.curr_semester,
        }
        for s in students
    ]
 
 
@router.get("/attendance")
def get_all_attendance(
    student_id: Optional[int] = None,
    class_id: Optional[int] = None,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = (
        select(
            modelz.AttendanceRecords.attend_id,
            modelz.AttendanceRecords.student_id,
            modelz.AttendanceRecords.schedule_id,
            modelz.AttendanceRecords.attend_date,
            modelz.AttendanceRecords.status,
            modelz.AttendanceRecords.recorded_at,
            modelz.Students.first_name,
            modelz.Students.last_name,
            modelz.Subjects.subject_name,
            modelz.ClassSchedules.day_of_week,
            modelz.ClassSchedules.start_time,
        )
        .join(modelz.Students, modelz.AttendanceRecords.student_id == modelz.Students.student_id)
        .join(modelz.ClassSchedules, modelz.AttendanceRecords.schedule_id == modelz.ClassSchedules.schedule_id)
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
    )
 
    if student_id:
        query = query.where(modelz.AttendanceRecords.student_id == student_id)
    if class_id:
        query = query.where(modelz.ClassSchedules.class_id == class_id)
 
    rows = db.execute(query.order_by(modelz.AttendanceRecords.attend_date.desc())).all()
 
    return [
        {
            "attend_id": r.attend_id,
            "student_id": r.student_id,
            "student_name": f"{r.first_name} {r.last_name}",
            "schedule_id": r.schedule_id,
            "subject_name": r.subject_name,
            "day_of_week": r.day_of_week,
            "start_time": str(r.start_time),
            "attend_date": str(r.attend_date),
            "status": r.status,
            "recorded_at": str(r.recorded_at) if r.recorded_at else None,
        }
        for r in rows
    ]
 
 
@router.post("/attendance")
def create_attendance_record(
    payload: schemas.AttendanceCreateSchema,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check student exists
    student = db.execute(
        select(modelz.Students).where(modelz.Students.student_id == payload.student_id)
    ).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
 
    # Check schedule exists
    schedule = db.execute(
        select(modelz.ClassSchedules).where(modelz.ClassSchedules.schedule_id == payload.schedule_id)
    ).scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found.")
 
    # Check duplicate
    existing = db.execute(
        select(modelz.AttendanceRecords).where(
            modelz.AttendanceRecords.student_id == payload.student_id,
            modelz.AttendanceRecords.schedule_id == payload.schedule_id,
            modelz.AttendanceRecords.attend_date == payload.attend_date,
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance record already exists for this student, schedule, and date.")
 
    new_record = modelz.AttendanceRecords(
        student_id=payload.student_id,
        schedule_id=payload.schedule_id,
        attend_date=payload.attend_date,
        status=payload.status,
        recorded_at=None,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return {"success": True, "attend_id": new_record.attend_id, "message": "Attendance record created."}
 
 
@router.delete("/attendance/{attend_id}")
def delete_attendance_record(
    attend_id: int,
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    record = db.execute(
        select(modelz.AttendanceRecords).where(modelz.AttendanceRecords.attend_id == attend_id)
    ).scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found.")
 
    db.delete(record)
    db.commit()
    return {"success": True, "message": "Attendance record deleted."}
 
 
@router.get("/schedules")
def get_all_schedules(
    _=Depends(require_admin),
    db: Session = Depends(get_db)
):
    rows = db.execute(
        select(
            modelz.ClassSchedules.schedule_id,
            modelz.ClassSchedules.day_of_week,
            modelz.ClassSchedules.start_time,
            modelz.ClassSchedules.end_time,
            modelz.ClassSchedules.room_identifier,
            modelz.Subjects.subject_name,
        )
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
    ).all()
    return [
        {
            "schedule_id": r.schedule_id,
            "subject_name": r.subject_name,
            "day_of_week": r.day_of_week,
            "start_time": str(r.start_time),
            "end_time": str(r.end_time),
            "room_identifier": r.room_identifier,
        }
        for r in rows
    ]
