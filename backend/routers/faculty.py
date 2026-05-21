from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from datetime import datetime

from dbz import get_db
import modelz
import schemas
from dependencies import get_faculty_profile

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])


@router.get("/me/subjects", response_model=List[schemas.SubjectEntry])
def get_my_subjects(
    teacher: modelz.Teachers = Depends(get_faculty_profile),
    db: Session = Depends(get_db)
):
    results = db.execute(
        select(modelz.Classes, modelz.Subjects, modelz.AcademicSessions)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .join(modelz.AcademicSessions, modelz.Classes.session_id == modelz.AcademicSessions.session_id)
        .where(modelz.Classes.teacher_id == teacher.teacher_id)
    ).all()

    return [
        schemas.SubjectEntry(
            class_id=cls.class_id,
            subject_name=subject.subject_name,
            subject_code=subject.subject_code,
            session_name=session.name
        )
        for cls, subject, session in results
    ]


@router.get("/me/schedule", response_model=List[schemas.TimetableEntry])
def get_my_schedule(
    teacher: modelz.Teachers = Depends(get_faculty_profile),
    db: Session = Depends(get_db)
):
    results = db.execute(
        select(modelz.ClassSchedules, modelz.Subjects)
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .join(modelz.Subjects, modelz.Classes.subject_id == modelz.Subjects.subject_id)
        .where(modelz.Classes.teacher_id == teacher.teacher_id)
    ).all()

    return [
        schemas.TimetableEntry(
            schedule_id=schedule.schedule_id,
            subject_name=subject.subject_name,
            day_of_week=schedule.day_of_week,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            room_identifier=schedule.room_identifier,
            teacher_name=f"{teacher.first_name} {teacher.last_name}".strip()
        )
        for schedule, subject in results
    ]


@router.get("/me/subjects/{class_id}/attendance", response_model=List[schemas.FacultyAttendanceEntry])
def get_class_attendance(
    class_id: int,
    teacher: modelz.Teachers = Depends(get_faculty_profile),
    db: Session = Depends(get_db)
):
    cls = db.execute(
        select(modelz.Classes).where(
            modelz.Classes.class_id == class_id,
            modelz.Classes.teacher_id == teacher.teacher_id
        )
    ).scalar_one_or_none()
    if not cls:
        raise HTTPException(status_code=403, detail="You do not teach this class.")

    results = db.execute(
        select(modelz.AttendanceRecords, modelz.Students)
        .join(modelz.Students, modelz.AttendanceRecords.student_id == modelz.Students.student_id)
        .join(modelz.ClassSchedules, modelz.AttendanceRecords.schedule_id == modelz.ClassSchedules.schedule_id)
        .where(modelz.ClassSchedules.class_id == class_id)
        .order_by(modelz.AttendanceRecords.attend_date.desc())
    ).all()

    return [
        schemas.FacultyAttendanceEntry(
            student_id=student.student_id,
            student_name=f"{student.first_name} {student.last_name}".strip(),
            attend_date=record.attend_date,
            status=record.status
        )
        for record, student in results
    ]


@router.post("/me/attendance/override", response_model=schemas.AttendanceOverrideResponse)
def override_attendance(
    payload: schemas.AttendanceOverrideRequest,
    teacher: modelz.Teachers = Depends(get_faculty_profile),
    db: Session = Depends(get_db)
):
    schedule = db.execute(
        select(modelz.ClassSchedules)
        .join(modelz.Classes, modelz.ClassSchedules.class_id == modelz.Classes.class_id)
        .where(
            modelz.ClassSchedules.schedule_id == payload.schedule_id,
            modelz.Classes.teacher_id == teacher.teacher_id
        )
    ).scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=403, detail="You do not have access to this schedule.")

    existing = db.execute(
        select(modelz.AttendanceRecords).where(
            modelz.AttendanceRecords.student_id == payload.student_id,
            modelz.AttendanceRecords.schedule_id == payload.schedule_id,
            modelz.AttendanceRecords.attend_date == payload.attend_date,
        )
    ).scalar_one_or_none()

    if existing:
        existing.status = payload.status
        db.commit()
        db.refresh(existing)
        return schemas.AttendanceOverrideResponse(
            message="Attendance record updated.",
            attend_id=existing.attend_id,
            updated_status=existing.status
        )

    new_record = modelz.AttendanceRecords(
        student_id=payload.student_id,
        schedule_id=payload.schedule_id,
        attend_date=payload.attend_date,
        recorded_at=datetime.now(),
        status=payload.status
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return schemas.AttendanceOverrideResponse(
        message="Attendance record created.",
        attend_id=new_record.attend_id,
        updated_status=new_record.status
    )