from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from dbz import get_db
import modelz
import schemas
from dependencies import get_parent_profile

router = APIRouter(prefix="/api/parents", tags=["Parents"])
LOW_ATTENDANCE_THRESHOLD = 50.0


@router.get("/me/students", response_model=List[schemas.LinkedStudentEntry])
def get_my_children(
    parent: modelz.Parents = Depends(get_parent_profile),
    db: Session = Depends(get_db)
):
    students = db.execute(
        select(modelz.Students)
        .join(modelz.t_student_parent_link,
              modelz.Students.student_id == modelz.t_student_parent_link.c.student_id)
        .where(modelz.t_student_parent_link.c.parent_id == parent.parent_id)
    ).scalars().all()

    return [
        schemas.LinkedStudentEntry(
            student_id=s.student_id,
            first_name=s.first_name,
            last_name=s.last_name,
            curr_semester=s.curr_semester
        )
        for s in students
    ]


@router.get("/me/students/{student_id}/attendance", response_model=List[schemas.AttendanceSummary])
def get_child_attendance(
    student_id: int,
    parent: modelz.Parents = Depends(get_parent_profile),
    db: Session = Depends(get_db)
):
    link = db.execute(
        select(modelz.t_student_parent_link).where(
            modelz.t_student_parent_link.c.parent_id == parent.parent_id,
            modelz.t_student_parent_link.c.student_id == student_id
        )
    ).first()
    if not link:
        raise HTTPException(status_code=403, detail="This student is not linked to your account.")

    records = db.execute(
        select(modelz.AttendanceRecords, modelz.Subjects)
        .join(modelz.ClassSchedules, modelz.AttendanceRecords.schedule_id == modelz.ClassSchedules.schedule_id)
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .where(modelz.AttendanceRecords.student_id == student_id)
    ).all()

    subject_map = {}
    for record, subject in records:
        name = subject.subject_name
        if name not in subject_map:
            subject_map[name] = {"total": 0, "present": 0}
        subject_map[name]["total"] += 1
        if record.status == "present":
            subject_map[name]["present"] += 1

    return [
        schemas.AttendanceSummary(
            subject_name=name,
            total_classes=data["total"],
            present=data["present"],
            attendance_percentage=round((data["present"] / data["total"]) * 100, 2) if data["total"] > 0 else 0.0
        )
        for name, data in subject_map.items()
    ]


@router.get("/me/alerts", response_model=List[schemas.AlertEntry])
def get_alerts(
    parent: modelz.Parents = Depends(get_parent_profile),
    db: Session = Depends(get_db)
):
    linked_students = db.execute(
        select(modelz.Students)
        .join(modelz.t_student_parent_link,
              modelz.Students.student_id == modelz.t_student_parent_link.c.student_id)
        .where(modelz.t_student_parent_link.c.parent_id == parent.parent_id)
    ).scalars().all()

    alerts = []
    for student in linked_students:
        records = db.execute(
            select(modelz.AttendanceRecords, modelz.Subjects)
            .join(modelz.ClassSchedules, modelz.AttendanceRecords.schedule_id == modelz.ClassSchedules.schedule_id)
            .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
            .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
            .where(modelz.AttendanceRecords.student_id == student.student_id)
        ).all()

        subject_map = {}
        for record, subject in records:
            name = subject.subject_name
            if name not in subject_map:
                subject_map[name] = {"total": 0, "present": 0}
            subject_map[name]["total"] += 1
            if record.status == "present":
                subject_map[name]["present"] += 1

        for subject_name, data in subject_map.items():
            pct = round((data["present"] / data["total"]) * 100, 2) if data["total"] > 0 else 0.0
            if pct < LOW_ATTENDANCE_THRESHOLD:
                alerts.append(schemas.AlertEntry(
                    student_id=student.student_id,
                    student_name=f"{student.first_name} {student.last_name}".strip(),
                    subject_name=subject_name,
                    attendance_percentage=pct,
                    message=f"Attendance in {subject_name} is below {LOW_ATTENDANCE_THRESHOLD}%."
                ))
    return alerts


@router.get("/me/students/{student_id}/teachers")
def get_child_teachers(
    student_id: int,
    parent: modelz.Parents = Depends(get_parent_profile),
    db: Session = Depends(get_db)
):
    # Security check — verify this student belongs to this parent
    link = db.execute(
        select(modelz.t_student_parent_link).where(
            modelz.t_student_parent_link.c.parent_id == parent.parent_id,
            modelz.t_student_parent_link.c.student_id == student_id
        )
    ).first()
    if not link:
        raise HTTPException(status_code=403, detail="This student is not linked to your account.")

    # Get all teachers for this student's enrolled classes
    results = db.execute(
        select(modelz.Teachers, modelz.Subjects, modelz.Users)
        .join(modelz.Classes, modelz.Classes.teacher_id == modelz.Teachers.teacher_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .join(modelz.Enrollments, modelz.Enrollments.class_id == modelz.Classes.class_id)
        .join(modelz.Users, modelz.Teachers.user_id == modelz.Users.user_id)
        .where(modelz.Enrollments.student_id == student_id)
    ).all()

    # Deduplicate by teacher_id
    seen = set()
    teachers = []
    for teacher, subject, user in results:
        if teacher.teacher_id not in seen:
            seen.add(teacher.teacher_id)
            teachers.append({
                "teacher_id": teacher.teacher_id,
                "name": f"{teacher.first_name} {teacher.last_name}".strip(),
                "subject_name": subject.subject_name,
                "email": user.email,
                "department": teacher.department,
            })

    return teachers